export interface JSearchJob {
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
}

export interface JSearchResponse {
  data: JSearchJob[];
  status: string;
  request_id: string;
}

export const JSearchService = {
  searchJobs: async (query: string, location: string, page: number = 1, numPages: number = 1): Promise<JSearchResponse> => {
    const response = await fetch(`/api/jobs/search?query=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}&page=${page}&num_pages=${numPages}`);
    if (!response.ok) {
      throw new Error('Failed to fetch jobs');
    }
    return response.json();
  }
};
