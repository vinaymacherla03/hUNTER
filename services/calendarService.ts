
// Service to handle Google Calendar API interactions via backend

const CALENDAR_API_CONNECTED_KEY = 'google_calendar_connected';

export interface CalendarEvent {
    id: string;
    summary: string;
    description?: string;
    start: { dateTime: string };
    end: { dateTime: string };
    hangoutLink?: string; // Google Meet link
    company?: string;
}

export const CalendarService = {
    isConnected: async (): Promise<boolean> => {
        try {
            const res = await fetch('/api/auth/status');
            const data = await res.json();
            return data.google === true;
        } catch (e) {
            return false;
        }
    },

    connect: async (): Promise<void> => {
        return new Promise(async (resolve, reject) => {
            try {
                const redirectUri = `${window.location.origin}/api/auth/google/callback`;
                const origin = window.location.origin;
                const res = await fetch(`/api/auth/google/url?redirectUri=${encodeURIComponent(redirectUri)}&origin=${encodeURIComponent(origin)}`);
                const data = await res.json();
                if (data.url) {
                    const authWindow = window.open(data.url, 'google_oauth', 'width=600,height=700');
                    if (!authWindow) {
                        alert('Please allow popups to connect to Google.');
                        return reject(new Error('Popup blocked'));
                    }

                    const handleMessage = (event: MessageEvent) => {
                        if (event.data?.type === 'OAUTH_AUTH_SUCCESS' && event.data?.provider === 'google') {
                            window.removeEventListener('message', handleMessage);
                            resolve();
                        }
                    };
                    window.addEventListener('message', handleMessage);
                } else {
                    reject(new Error(data.error || 'Failed to get auth URL'));
                }
            } catch (e) {
                reject(e);
            }
        });
    },

    disconnect: async (): Promise<void> => {
        try {
            await fetch('/api/auth/google/disconnect', { method: 'POST' });
        } catch (e) {
            console.error(e);
        }
    },

    syncJobs: async (): Promise<any[]> => {
        try {
            const res = await fetch('/api/sync/google', { method: 'POST' });
            if (!res.ok) throw new Error('Sync failed');
            const data = await res.json();
            return data.jobs || [];
        } catch (e) {
            console.error("Failed to sync jobs:", e);
            throw e;
        }
    },

    getUpcomingInterviews: async (): Promise<CalendarEvent[]> => {
        try {
            const res = await fetch('/api/calendar/events');
            if (res.ok) {
                const data = await res.json();
                return data.events || [];
            }
            return [];
        } catch (e) {
            console.error("Failed to fetch calendar events:", e);
            return [];
        }
    },

    createEvent: async (title: string, dateTime: Date, description: string): Promise<void> => {
        try {
            const res = await fetch('/api/calendar/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, dateTime: dateTime.toISOString(), description })
            });
            if (!res.ok) {
                throw new Error("Failed to create event");
            }
        } catch (e) {
            console.error("Error creating event:", e);
            throw e;
        }
    }
};
