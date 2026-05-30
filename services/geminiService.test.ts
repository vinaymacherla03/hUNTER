
import { findMatchingJobs } from './geminiService';
import { scheduler } from '../utils/scheduler';
import { vi, describe, it, beforeEach, expect } from 'vitest';

// Mock Scheduler to avoid real API calls
vi.mock('../utils/scheduler', () => ({
    scheduler: {
        add: vi.fn()
    }
}));

const mockResumeData = {
    fullName: 'Test User',
    title: 'Developer',
    contactInfo: { email: 'test@example.com', location: 'NY', phone: '123', linkedin: '' },
    summary: 'A dev',
    experience: [],
    education: [],
    skills: []
};

describe('geminiService', () => {
    describe('findMatchingJobs', () => {
        beforeEach(() => {
            vi.clearAllMocks();
        });

        it('should correctly parse a clean JSON response', async () => {
            const mockResponse = {
                marketSummary: "Market is good",
                jobs: [
                    { company: "CompA", role: "Dev", link: "http://a.com", summary: "Good job" }
                ]
            };
            (scheduler.add as any).mockResolvedValue({ text: () => JSON.stringify(mockResponse) });

            const result = await findMatchingJobs(mockResumeData, 'NY', 'Dev', { remote: false, salary: '', experience: '' });

            expect(result.marketSummary).toBe("Market is good");
            expect(result.jobs).toHaveLength(1);
            expect(result.jobs[0].id).toBeDefined(); // ID should be generated
            expect(result.jobs[0].id).toContain('job_');
        });

        it('should correctly parse JSON inside Markdown code blocks', async () => {
            const mockResponse = {
                marketSummary: "Markdown market",
                jobs: []
            };
            const text = "Here is the data:\n```json\n" + JSON.stringify(mockResponse) + "\n```";
            (scheduler.add as any).mockResolvedValue({ text: () => text });

            const result = await findMatchingJobs(mockResumeData, 'NY', 'Dev', { remote: false, salary: '', experience: '' });

            expect(result.marketSummary).toBe("Markdown market");
        });

        it('should handle malformed JSON gracefully', async () => {
            (scheduler.add as any).mockResolvedValue({ text: () => "This is not JSON" });

            const result = await findMatchingJobs(mockResumeData, 'NY', 'Dev', { remote: false, salary: '', experience: '' });

            // findMatchingJobs returns a default object on failure
            expect(result).toEqual({ marketSummary: "Could not retrieve market signals.", jobs: [] });
        });

        it('should generate deterministic IDs for jobs', async () => {
            const mockResponse = {
                jobs: [{ company: "A", role: "B", link: "http://a.com" }]
            };
            (scheduler.add as any).mockResolvedValue({ text: () => JSON.stringify(mockResponse) });

            const result1 = await findMatchingJobs(mockResumeData, 'NY', 'Dev', { remote: false, salary: '', experience: '' });
            
            // Mock again for second call
            (scheduler.add as any).mockResolvedValue({ text: () => JSON.stringify(mockResponse) });
            const result2 = await findMatchingJobs(mockResumeData, 'NY', 'Dev', { remote: false, salary: '', experience: '' });

            expect(result1.jobs[0].id).toBe(result2.jobs[0].id);
        });
    });
});
