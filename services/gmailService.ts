
// Service to handle Gmail API interactions
// Note: In a production environment, you would need a valid Google Cloud Project with OAuth 2.0 credentials.
// For this demo, we simulate the authentication and sending process to demonstrate the UX flow.

const GMAIL_API_connected_KEY = 'gmail_api_connected';

export interface GmailUser {
    email: string;
    name: string;
    picture?: string;
}

export const GmailService = {
    isConnected: (): boolean => {
        return !!localStorage.getItem(GMAIL_API_connected_KEY);
    },

    connect: async (): Promise<GmailUser> => {
        // SIMULATION: Real implementation would use gapi.auth2.getAuthInstance().signIn()
        return new Promise((resolve) => {
            setTimeout(() => {
                localStorage.setItem(GMAIL_API_connected_KEY, 'true');
                resolve({
                    email: 'user@example.com',
                    name: 'Demo User',
                    picture: 'https://lh3.googleusercontent.com/a/default-user=s96-c'
                });
            }, 1500);
        });
    },

    disconnect: async (): Promise<void> => {
        // SIMULATION: Real implementation would use gapi.auth2.getAuthInstance().signOut()
        return new Promise((resolve) => {
            setTimeout(() => {
                localStorage.removeItem(GMAIL_API_connected_KEY);
                resolve();
            }, 500);
        });
    },

    sendEmail: async (to: string, subject: string, body: string): Promise<void> => {
        if (!GmailService.isConnected()) {
            throw new Error("Gmail is not connected.");
        }

        // SIMULATION: Real implementation using Gmail API
        /*
        const email = [
            'Content-Type: text/plain; charset="UTF-8"\n',
            'MIME-Version: 1.0\n',
            'Content-Transfer-Encoding: 7bit\n',
            `to: ${to}\n`,
            `subject: ${subject}\n\n`,
            body
        ].join('');
        const base64EncodedEmail = btoa(email).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        
        await gapi.client.gmail.users.messages.send({
            'userId': 'me',
            'resource': { 'raw': base64EncodedEmail }
        });
        */

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() > 0.1) { // 90% success rate simulation
                    console.log(`[Gmail API] Email sent to ${to}`);
                    resolve();
                } else {
                    reject(new Error("Failed to send email via Gmail API (Simulation)"));
                }
            }, 2000);
        });
    }
};
