import { callServerAI } from "./aiProxy";
import { Type } from "@google/genai";

export interface GoogleJob {
  job_id: string;
  job_title: string;
  employer_name: string;
  employer_logo: string | null;
  job_location: string;
  job_is_remote: boolean;
  job_posted_at_datetime_utc: string;
  job_apply_link: string;
  job_description: string;
  job_min_salary: number | null;
  job_max_salary: number | null;
  job_salary_currency: string | null;
  job_salary_period: string | null;
  job_employment_type: string | null;
  job_latitude?: number | null;
  job_longitude?: number | null;
  job_experience_level?: string | null;
  job_publisher?: string;
  source?: string;
}

export interface GoogleJobsResponse {
  data: GoogleJob[];
  status: string;
  request_id: string;
  total_count?: number;
}

export const GoogleJobsService = {
  searchJobs: async (
    query: string, 
    location: string, 
    page: number = 1, 
    numPages: number = 1
  ): Promise<GoogleJobsResponse> => {
    try {
      const prompt = `Search for RECENT job listings (posted within the last 30 days) for "${query}" in "${location}". 
      Extract the details of the most relevant and ACTIVE job listings found.
      CRITICAL: The 'job_apply_link' MUST be a direct, active application URL. 
      Prioritize official company career sites (e.g., epam.com, google.com/about/careers) over third-party aggregators if possible.
      Verify that the job is still open. If the link looks like it might be expired or is a generic search page, do not include it.
      Current date: ${new Date().toISOString()}`;

      const schema = {
        type: Type.OBJECT,
        properties: {
          data: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                job_id: { type: Type.STRING },
                job_title: { type: Type.STRING },
                employer_name: { type: Type.STRING },
                employer_logo: { type: Type.STRING, nullable: true },
                job_location: { type: Type.STRING },
                job_is_remote: { type: Type.BOOLEAN },
                job_posted_at_datetime_utc: { type: Type.STRING },
                job_apply_link: { type: Type.STRING },
                job_description: { type: Type.STRING },
                job_min_salary: { type: Type.NUMBER, nullable: true },
                job_max_salary: { type: Type.NUMBER, nullable: true },
                job_salary_currency: { type: Type.STRING, nullable: true },
                job_salary_period: { type: Type.STRING, nullable: true },
                job_employment_type: { type: Type.STRING, nullable: true },
                job_latitude: { type: Type.NUMBER, nullable: true },
                job_longitude: { type: Type.NUMBER, nullable: true },
                job_experience_level: { type: Type.STRING, nullable: true, description: "Experience level required (e.g., Entry Level, Mid Level, Senior Level, Executive)" }
              },
              required: ["job_id", "job_title", "employer_name", "job_location", "job_is_remote", "job_posted_at_datetime_utc", "job_apply_link", "job_description"]
            }
          }
        },
        required: ["data"]
      };

      const response = await callServerAI(prompt, "gemini-3-flash-preview", {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: schema as any
      });

      const parsed = JSON.parse(response.text() || '{"data": []}');
      
      return {
        data: parsed.data || [],
        status: "OK",
        request_id: `google-search-${Date.now()}`
      };
    } catch (error) {
      console.error("Google Jobs Search Error:", error);
      throw error;
    }
  }
};
