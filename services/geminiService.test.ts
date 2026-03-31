
import { findMatchingJobs } from './geminiService';
import { scheduler } from '../utils/scheduler';

// Fix for missing Jest types in this context
declare const jest: any;
declare const describe: any;
declare const it: any;
declare const beforeEach: any;
declare const expect: any;

// Mock Scheduler to avoid real API calls
jest.mock('../utils/scheduler', () => ({
    scheduler: {
        add: jest.fn()
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
            jest.clearAllMocks();
        });

        it('should correctly parse a clean JSON response', async () => {
            const mockResponse = {
                marketSummary: "Market is good",
                jobs: [
                    { company: "CompA", role: "Dev", link: "http://a.com", summary: "Good job" }
                ]
            };
            (scheduler.add as any).mockResolvedValue({ text: JSON.stringify(mockResponse) });

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
            (scheduler.add as any).mockResolvedValue({ text });

            const result = await findMatchingJobs(mockResumeData, 'NY', 'Dev', { remote: false, salary: '', experience: '' });

            expect(result.marketSummary).toBe("Markdown market");
        });

        it('should handle malformed JSON gracefully', async () => {
            (scheduler.add as any).mockResolvedValue({ text: "This is not JSON" });

            const result = await findMatchingJobs(mockResumeData, 'NY', 'Dev', { remote: false, salary: '', experience: '' });

            // parseJsonResult returns {} on failure
            expect(result).toEqual({});
        });

        it('should generate deterministic IDs for jobs', async () => {
            const mockResponse = {
                jobs: [{ company: "A", role: "B", link: "http://a.com" }]
            };
            (scheduler.add as any).mockResolvedValue({ text: JSON.stringify(mockResponse) });

            const result1 = await findMatchingJobs(mockResumeData, 'NY', 'Dev', { remote: false, salary: '', experience: '' });
            
            // Mock again for second call
            (scheduler.add as any).mockResolvedValue({ text: JSON.stringify(mockResponse) });
            const result2 = await findMatchingJobs(mockResumeData, 'NY', 'Dev', { remote: false, salary: '', experience: '' });

            expect(result1.jobs[0].id).toBe(result2.jobs[0].id);
        });
    });
});
