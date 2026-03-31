
import { JobApplication } from '../types';

const INDEED_CONNECTED_KEY = 'indeed_connected';

export const JobBoardService = {
    isConnected: async (platform: 'indeed'): Promise<boolean> => {
        try {
            const res = await fetch('/api/auth/status');
            const data = await res.json();
            return !!data[platform];
        } catch (e) {
            console.error('Failed to fetch auth status', e);
            return false;
        }
    },

    connect: async (platform: 'indeed'): Promise<void> => {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await fetch(`/api/auth/${platform}/url`);
                if (!response.ok) {
                    throw new Error('Failed to get auth URL');
                }
                const { url } = await response.json();

                const authWindow = window.open(
                    url,
                    'oauth_popup',
                    'width=600,height=700'
                );

                if (!authWindow) {
                    alert('Please allow popups for this site to connect your account.');
                    return reject(new Error('Popup blocked'));
                }

                const handleMessage = (event: MessageEvent) => {
                    const origin = event.origin;
                    if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
                        return;
                    }
                    if (event.data?.type === 'OAUTH_AUTH_SUCCESS' && event.data?.provider === platform) {
                        window.removeEventListener('message', handleMessage);
                        resolve();
                    }
                };
                window.addEventListener('message', handleMessage);
            } catch (error) {
                console.error('OAuth error:', error);
                reject(error);
            }
        });
    },

    disconnect: async (platform: 'indeed'): Promise<void> => {
        try {
            await fetch(`/api/auth/${platform}/disconnect`, { method: 'POST' });
        } catch (error) {
            console.error('Disconnect error:', error);
            throw error;
        }
    },

    syncApplications: async (): Promise<{ newJobs: JobApplication[], updatedCount: number }> => {
        const indeedConnected = await JobBoardService.isConnected('indeed');

        if (!indeedConnected) {
            throw new Error("No job boards connected.");
        }

        return new Promise((resolve) => {
            setTimeout(() => {
                const fetchedJobs: JobApplication[] = [];

                if (indeedConnected) {
                    fetchedJobs.push(
                        { 
                            id: `in-${Date.now()}-1`, 
                            company: 'StartUp Inc', 
                            role: 'Frontend Developer', 
                            status: 'Saved', 
                            dateAdded: '5 hours ago', 
                            location: 'Remote',
                            source: 'Indeed'
                        }
                    );
                }

                // Simulate getting 2-3 random updates to existing jobs
                const updatedCount = Math.floor(Math.random() * 2) + 1;

                resolve({
                    newJobs: fetchedJobs,
                    updatedCount
                });
            }, 2000);
        });
    }
};
