import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import NodeCache from 'node-cache';
import { generateAIContent, createAIJob, generateTTS } from "./server/aiService.ts";

const jobCache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour

dotenv.config();

// Force override from .env file if system environment has a placeholder
try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
        const envConfig = dotenv.parse(fs.readFileSync(envPath));
        for (const k in envConfig) {
            if (k === 'GEMINI_API_KEY' || k === 'API_KEY') {
                if (envConfig[k] && !envConfig[k].includes('TODO') && !envConfig[k].includes('YOUR_API_KEY')) {
                    console.log(`[Server] Forcing ${k} from .env file override`);
                    process.env[k] = envConfig[k];
                }
            }
        }
    }
} catch (e) {
    console.error("[Server] Error forcing .env override:", e);
}

console.log(`[Server] GEMINI_API_KEY present: ${!!process.env.GEMINI_API_KEY}`);
if (process.env.GEMINI_API_KEY) {
    const key = process.env.GEMINI_API_KEY;
    console.log(`[Server] GEMINI_API_KEY length: ${key.length}, starts with: ${key.substring(0, 4)}`);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Enable compression for high performance
  app.use(compression());

  // Trust proxy is required for express-rate-limit to work correctly behind a proxy
  // Cloud Run/GCP Load Balancer is typically 1 hop away
  app.set('trust proxy', 1);

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  // Handle JSON parsing errors explicitly
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof SyntaxError && 'status' in err && err.status === 400 && 'body' in err) {
      return res.status(400).json({ error: "Invalid JSON payload" });
    }
    if (err.type === 'entity.too.large') {
      return res.status(413).json({ error: "Payload too large. Please use a smaller file or less text." });
    }
    next(err);
  });
  app.use(cookieParser());

  const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    limit: 1000, // limit each IP to 1000 requests per minute for high concurrency
    message: 'Too many requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Apply to all API routes
  app.use('/api/', limiter);

  // Robust Rate Limiting for AI specifically
  const aiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    limit: 200, // limit each IP to 200 AI requests per minute
    message: { error: 'AI quota exceeded for your IP. Please try again in a minute.' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use('/api/ai/', aiLimiter);

  // AI Endpoints
  app.post("/api/ai/generate", async (req, res) => {
    const { model, prompt, config } = req.body;
    if (!prompt) return res.status(400).json({ error: "Missing prompt" });

    try {
      const result = await generateAIContent(model || "gemini-3-flash-preview", prompt, config || {});
      res.json({ result });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "AI Generation failed" });
    }
  });

  app.post("/api/ai/job", async (req, res) => {
    const { type, payload } = req.body;
    if (!type) return res.status(400).json({ error: "Missing job type" });

    try {
      const jobId = await createAIJob(type, payload);
      res.json({ jobId });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Job creation failed" });
    }
  });

  app.post("/api/ai/tts", async (req, res) => {
    const { text, voiceName } = req.body;
    if (!text) return res.status(400).json({ error: "Missing text for TTS" });
    try {
      const base64Audio = await generateTTS(text, voiceName || "Kore");
      res.json({ audio: base64Audio });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "TTS Generation failed" });
    }
  });

  // OAuth Flow Endpoints
  app.get("/api/auth/:provider/url", (req, res) => {
    const { provider } = req.params;
    const redirectUri = req.query.redirectUri as string || `${req.protocol}://${req.get("host")}/api/auth/${provider}/callback`;

    if (provider === "indeed") {
      const clientId = process.env.INDEED_CLIENT_ID;
      if (!clientId) return res.status(500).json({ error: "Missing INDEED_CLIENT_ID" });
      const url = `https://secure.indeed.com/oauth/v2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&response_type=code&state=123456`;
      return res.json({ url });
    }
    if (provider === "google") {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      if (!clientId) return res.status(500).json({ error: "Missing GOOGLE_CLIENT_ID" });
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/calendar.events',
        access_type: 'offline',
        prompt: 'consent',
        state: encodeURIComponent(req.query.origin as string || `${req.protocol}://${req.get("host")}`)
      });
      return res.json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params}` });
    }
    res.status(400).json({ error: "Unknown provider" });
  });

  app.get("/api/auth/:provider/callback", async (req, res) => {
    const { provider } = req.params;
    const { code, state } = req.query;
    // We need to use the exact same redirect URI that was used in the request.
    // Since we don't know it here, we should pass it via state or use a relative path if possible.
    // Actually, Google requires an exact match. Let's reconstruct it using the host header, but it might be wrong.
    // Better: pass the origin in the state parameter.
    const origin = state ? decodeURIComponent(state as string) : `${req.protocol}://${req.get("host")}`;
    const redirectUri = `${origin}/api/auth/${provider}/callback`;

    try {
      if (provider === "google") {
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID || '',
            client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
            code: code as string,
            grant_type: 'authorization_code',
            redirect_uri: redirectUri
          })
        });
        const tokens = await tokenResponse.json();
        if (tokens.access_token) {
          res.cookie('google_access_token', tokens.access_token, { secure: true, sameSite: 'none', httpOnly: true });
          res.cookie('google_connected', 'true', { secure: true, sameSite: 'none', httpOnly: true });
        }
      } else {
        // Mock for indeed
        res.cookie(`${provider}_connected`, "true", {
          secure: true,
          sameSite: "none",
          httpOnly: true,
        });
      }

      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', provider: '${provider}' }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Authentication successful. This window should close automatically.</p>
          </body>
        </html>
      `);
    } catch (e) {
      console.error(e);
      res.status(500).send('Authentication failed');
    }
  });

  app.get("/api/auth/status", (req, res) => {
    res.json({
      indeed: !!req.cookies.indeed_connected,
      google: !!req.cookies.google_connected,
    });
  });

  app.post("/api/auth/:provider/disconnect", (req, res) => {
    const { provider } = req.params;
    res.clearCookie(`${provider}_connected`, {
      secure: true,
      sameSite: "none",
      httpOnly: true,
    });
    if (provider === 'google') {
      res.clearCookie('google_access_token', { secure: true, sameSite: "none", httpOnly: true });
    }
    res.json({ success: true });
  });

  app.post("/api/sync/google", async (req, res) => {
    const token = req.cookies.google_access_token;
    if (!token) return res.status(401).json({ error: "Not connected to Google" });

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const dateQuery = Math.floor(thirtyDaysAgo.getTime() / 1000);

      // 1. Fetch Gmail
      const gmailRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?q=subject:(application OR interview OR offer OR rejected OR "thank you for applying") after:${dateQuery}&maxResults=15`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const gmailData = await gmailRes.json();
      
      let emailTexts = [];
      if (gmailData.messages) {
        for (const msg of gmailData.messages) {
          const msgRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const msgData = await msgRes.json();
          const subject = msgData.payload?.headers?.find((h: any) => h.name === 'Subject')?.value || '';
          emailTexts.push(`Email Subject: ${subject}\nSnippet: ${msgData.snippet}`);
        }
      }

      // 2. Fetch Calendar
      const calRes = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?q=interview&timeMin=${thirtyDaysAgo.toISOString()}&maxResults=15&singleEvents=true&orderBy=startTime`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const calData = await calRes.json();
      
      let calendarTexts = [];
      if (calData.items) {
        for (const item of calData.items) {
          calendarTexts.push(`Event: ${item.summary}\nDate: ${item.start?.dateTime || item.start?.date}`);
        }
      }

      const combinedText = [...emailTexts, ...calendarTexts].join('\\n\\n');

      if (!combinedText.trim()) {
        return res.json({ jobs: [] });
      }

      // 3. Use Gemini to parse
      const { Type } = await import('@google/genai');
      
      const prompt = `Analyze the following recent emails and calendar events to extract job application updates.
      Return a JSON array of objects. Each object must have:
      - company: string (name of the company)
      - role: string (job title, infer if possible, or "Unknown Role")
      - status: string (must be exactly one of: 'Applied', 'Interviewing', 'Offer', 'Rejected')
      - dateAdded: string (e.g., "Today", "2 days ago", or a short date)
      - source: string (either "Gmail" or "Google Calendar")
      
      Data:
      ${combinedText}`;

      const schema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            company: { type: Type.STRING },
            role: { type: Type.STRING },
            status: { type: Type.STRING, enum: ['Applied', 'Interviewing', 'Offer', 'Rejected'] },
            dateAdded: { type: Type.STRING },
            source: { type: Type.STRING, enum: ['Gmail', 'Google Calendar'] }
          },
          required: ["company", "role", "status", "dateAdded", "source"]
        }
      };

      const aiRes = await generateAIContent('gemini-3-flash-preview', prompt, { 
        responseMimeType: 'application/json',
        responseSchema: schema
      });

      const parsed = JSON.parse(aiRes.text || '[]');
      res.json({ jobs: parsed });

    } catch (e) {
      console.error("Sync error:", e);
      res.status(500).json({ error: "Failed to sync with Google" });
    }
  });

  app.get("/api/calendar/events", async (req, res) => {
    const token = req.cookies.google_access_token;
    if (!token) {
      return res.status(401).json({ error: "Not connected to Google" });
    }

    try {
      const now = new Date();
      const calRes = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?q=interview&timeMin=${now.toISOString()}&maxResults=10&singleEvents=true&orderBy=startTime`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!calRes.ok) {
        throw new Error("Failed to fetch calendar events");
      }

      const calData = await calRes.json();
      
      const events = (calData.items || []).map((item: any) => ({
        id: item.id,
        summary: item.summary,
        description: item.description,
        start: item.start,
        end: item.end,
        hangoutLink: item.hangoutLink,
        company: item.summary.split(/with|at|-/i)[1]?.trim() || 'Unknown Company' // Basic heuristic
      }));

      res.json({ events });
    } catch (e) {
      console.error("Calendar fetch error:", e);
      res.status(500).json({ error: "Failed to fetch calendar events" });
    }
  });

  app.post("/api/calendar/create", async (req, res) => {
    const token = req.cookies.google_access_token;
    if (!token) {
      return res.status(401).json({ error: "Not connected to Google" });
    }

    const { title, dateTime, description } = req.body;
    if (!title || !dateTime) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const start = new Date(dateTime);
      const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour duration

      const event = {
        summary: title,
        description: description,
        start: {
          dateTime: start.toISOString(),
        },
        end: {
          dateTime: end.toISOString(),
        },
        conferenceData: {
          createRequest: {
            requestId: `hunt-desk-${Date.now()}`,
            conferenceSolutionKey: {
              type: "hangoutsMeet"
            }
          }
        }
      };

      const calRes = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      });
      
      if (!calRes.ok) {
        const errorText = await calRes.text();
        console.error("Calendar create error response:", errorText);
        throw new Error("Failed to create calendar event");
      }

      const calData = await calRes.json();
      res.json({ success: true, event: calData });
    } catch (e) {
      console.error("Calendar create error:", e);
      res.status(500).json({ error: "Failed to create calendar event" });
    }
  });

  app.post("/api/jobs/search", async (req, res) => {
    try {
      const apiKey = process.env.JSEARCH_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "JSEARCH_API_KEY is not configured" });
      }

      const { query, location, page = 1, filters } = req.body;
      const cacheKey = JSON.stringify({ query, location, page, filters });
      const cachedData = jobCache.get(cacheKey);

      if (cachedData) {
        console.log("Returning cached job search results");
        return res.json(cachedData);
      }

      let searchQuery = `${query || ''} ${location ? `in ${location}` : ''}`.trim();
      
      // Append experience level to query if specified
      if (filters?.experienceLevel && filters.experienceLevel !== 'Any') {
        searchQuery = `${searchQuery} ${filters.experienceLevel} level`.trim();
      }

      if (filters?.technologies && filters.technologies.length > 0) {
        searchQuery = `${searchQuery} ${filters.technologies.join(' ')}`.trim();
      }

      if (filters?.minSalary && filters.minSalary > 0) {
        searchQuery = `${searchQuery} $${filters.minSalary / 1000}k+`.trim();
      }

      console.log("Sending request to JSearch:", searchQuery, "with filters:", filters);

      const url = new URL("https://jsearch.p.rapidapi.com/search");
      url.searchParams.append("query", searchQuery);
      url.searchParams.append("page", page.toString());
      url.searchParams.append("num_pages", "5");
      
      // Apply filters to JSearch parameters
      if (filters) {
        if (filters.employmentType && filters.employmentType !== 'Any') {
          const typeMap: Record<string, string> = {
            'Full-time': 'FULLTIME',
            'Part-time': 'PARTTIME',
            'Contract': 'CONTRACTOR',
            'Internship': 'INTERN'
          };
          if (typeMap[filters.employmentType]) {
            url.searchParams.append("employment_types", typeMap[filters.employmentType]);
          } else {
            searchQuery = `${searchQuery} ${filters.employmentType}`.trim();
          }
        }
        
        if (filters.datePosted && filters.datePosted !== 'Any') {
          const dateMap: Record<string, string> = {
            'Past 24h': 'today',
            'Past 3 days': '3days',
            'Past week': 'week',
            'Past month': 'month'
          };
          if (dateMap[filters.datePosted]) {
            url.searchParams.append("date_posted", dateMap[filters.datePosted]);
          } else {
            url.searchParams.append("date_posted", "all");
          }
        } else {
          url.searchParams.append("date_posted", "all");
        }

        if (filters.remoteOption === 'Remote') {
          url.searchParams.append("remote_jobs_only", "true");
        }
      } else {
        url.searchParams.append("date_posted", "all");
      }

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "x-rapidapi-host": "jsearch.p.rapidapi.com",
          "x-rapidapi-key": apiKey,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("JSearch API error:", response.status, errorText);
        return res.status(response.status).json({ error: "Failed to fetch jobs from JSearch", details: errorText });
      }

        const data = await response.json();
        
        // Store in cache
        jobCache.set(cacheKey, data);

        // Async link validation: filter out jobs with 404 broken links
        if (data.data && Array.isArray(data.data)) {
          const checkLink = async (link: string): Promise<boolean> => {
            try {
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout
              const res = await fetch(link, {
                method: 'GET',
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
                signal: controller.signal
              });
              clearTimeout(timeoutId);
              // 404 means the job is gone. 403/999/etc usually means bot protection, so we keep it.
              return res.status !== 404;
            } catch (e) {
              // If fetch fails (timeout, CORS, etc), assume valid to avoid false positives
              return true;
            }
          };

          const validateJob = async (job: any) => {
            const linksToCheck = [job.job_apply_link];
            
            if (job.apply_options && Array.isArray(job.apply_options)) {
              job.apply_options.forEach((opt: any) => {
                if (opt.apply_link && !linksToCheck.includes(opt.apply_link)) {
                  linksToCheck.push(opt.apply_link);
                }
              });
            }

            for (const link of linksToCheck) {
              if (!link) continue;
              const isValid = await checkLink(link);
              if (isValid) {
                job.job_apply_link = link; // Update to the first working link
                return job;
              }
            }
            return null; // All links returned 404
          };

          const validatedJobs = await Promise.all(data.data.map(validateJob));
          data.data = validatedJobs.filter(j => j !== null);
        }

        res.json(data);
      } catch (error) {
        console.error("Job search proxy error:", error);
        res.status(500).json({ error: "Internal server error during job search" });
      }
    });

    app.post("/api/ai/agent-chat", async (req, res) => {
      const { messages, resumeData } = req.body;
      if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: "Messages array required" });

      try {
        const { Type } = await import("@google/genai");
        const prompt = `You are a Career Agent powered by Google Agent kit working alongside a job seeker.
Here is their resume context:
${JSON.stringify(resumeData, null, 2)}

User's last message: ${messages[messages.length - 1].text}

Respond as an expert career coach. If they need a mock interview, give them a question. If they need resume advice, provide it. Keep responses concise and formatting clean.

You must return a JSON response matching this schema:
{
  "reply": "Your message to the user",
  "action": {
    "type": "navigate", // Optional: 'navigate' or 'update'
    "payload": "job-match" // Only if navigating.
  }
}`;

        const aiRes = await generateAIContent('gemini-3-flash-preview', prompt, {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    reply: { type: Type.STRING },
                    action: { 
                        type: Type.OBJECT, 
                        properties: {
                            type: { type: Type.STRING },
                            payload: { type: Type.STRING },
                            path: { type: Type.STRING },
                            value: { type: Type.STRING }
                        }
                    }
                },
                required: ["reply"]
            }
        });

        const parsed = JSON.parse(aiRes.text || '{"reply": "I am having trouble understanding."}');
        res.json(parsed);
      } catch (error: any) {
        console.error("Agent chat error:", error);
        res.status(500).json({ error: error.message });
      }
    });

    // Catch-all for API routes to prevent Vite from returning index.html for undefined endpoints or preflight OPTIONS
    app.all("/api/*all", (req, res, next) => {
        if (req.method === 'OPTIONS') {
            // Give 200 OK for OPTIONS preflight, let CORS handle it if needed
            return res.status(200).end();
        }
        res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl}` });
    });

    // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
