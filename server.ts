import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import dotenv from "dotenv";
import rateLimit from 'express-rate-limit';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests, please try again later.'
  });

  // Apply to all API routes
  app.use('/api/', limiter);

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
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const prompt = `Analyze the following recent emails and calendar events to extract job application updates.
      Return a JSON array of objects. Each object must have:
      - company: string (name of the company)
      - role: string (job title, infer if possible, or "Unknown Role")
      - status: string (must be exactly one of: 'Applied', 'Interviewing', 'Offer', 'Rejected')
      - dateAdded: string (e.g., "Today", "2 days ago", or a short date)
      - source: string (either "Gmail" or "Google Calendar")
      
      Data:
      ${combinedText}`;

      const aiRes = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
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

  app.get("/api/jobs/search", async (req, res) => {
    const { query, location, page, num_pages } = req.query;
    if (!query) return res.status(400).json({ error: "Missing query" });

    try {
      const pageParam = page ? `&page=${page}` : '';
      const numPagesParam = num_pages ? `&num_pages=${num_pages}` : '';
      const response = await fetch(`https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query as string)}&location=${encodeURIComponent(location as string || '')}${pageParam}${numPagesParam}`, {
        headers: {
          'X-RapidAPI-Key': process.env.JSEARCH_API_KEY || '',
          'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
        }
      });
      const data = await response.json();
      res.json(data);
    } catch (e) {
      console.error("JSearch error:", e);
      res.status(500).json({ error: "Failed to fetch jobs" });
    }
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
