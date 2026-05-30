import { serverTimestamp } from 'firebase/firestore';
import * as fs from 'fs';
import { assertFails, assertSucceeds, initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { describe, it, beforeAll, afterAll, beforeEach } from '@jest/globals';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
        projectId: 'gen-lang-client-0779852108',
        firestore: {
            rules: fs.readFileSync('DRAFT_firestore.rules', 'utf8'),
        },
    });
});

beforeEach(async () => {
    await testEnv.clearFirestore();
});

afterAll(async () => {
    await testEnv.cleanup();
});

describe('Firestore Security Rules', () => {
    // Helper contexts
    const authContext = { uid: 'alice', email: 'alice@example.com', email_verified: true };
    const unauthContext = null;

    it('1. Identity Spoofing (Create)', async () => {
        const db = testEnv.authenticatedContext('alice').firestore();
        await assertFails(db.collection('resume_versions').doc('v1').set({
            userId: 'bob', // spoofed
            name: 'Draft',
            resumeData: {},
            timestamp: serverTimestamp()
        }));
    });

    it('2. Identity Spoofing (Update)', async () => {
        const dbAdmin = testEnv.unauthenticatedContext().firestore();
        await testEnv.withSecurityRulesDisabled(async (context) => {
            await context.firestore().collection('resume_versions').doc('v1').set({
                userId: 'alice',
                name: 'Draft',
                resumeData: {},
                timestamp: serverTimestamp()
            });
        });

        const db = testEnv.authenticatedContext('alice').firestore();
        await assertFails(db.collection('resume_versions').doc('v1').update({
            userId: 'bob'
        }));
    });

    it('3. Shadow Field Injection', async () => {
        const db = testEnv.authenticatedContext('alice').firestore();
        await assertFails(db.collection('user_memories').doc('alice').set({
            userId: 'alice',
            lastUpdated: serverTimestamp(),
            isAdmin: true // Not allowed
        }));
    });

    it('4. Data Type Poisoning', async () => {
        const db = testEnv.authenticatedContext('alice').firestore();
        await assertFails(db.collection('resume_versions').doc('v1').set({
            userId: 'alice',
            name: 'Draft',
            resumeData: "This is a giant string instead of a map",
            timestamp: serverTimestamp()
        }));
    });

    it('5. Denial of Wallet (Size Violation)', async () => {
        const db = testEnv.authenticatedContext('alice').firestore();
        await assertFails(db.collection('resume_versions').doc('v1').set({
            userId: 'alice',
            name: 'A'.repeat(101), // Exceeds 100 char limit
            resumeData: {},
            timestamp: serverTimestamp()
        }));
    });

    it('6. Immutable Field Modification', async () => {
         await testEnv.withSecurityRulesDisabled(async (context) => {
            await context.firestore().collection('downloaded_resumes').doc('d1').set({
                userId: 'alice',
                resumeData: {},
                format: 'pdf',
                downloadedAt: serverTimestamp()
            });
        });
        const db = testEnv.authenticatedContext('alice').firestore();
        await assertFails(db.collection('downloaded_resumes').doc('d1').update({
            format: 'txt'
        }));
    });

    it('7. Privilege Escalation', async () => {
        const db = testEnv.unauthenticatedContext().firestore();
        await assertFails(db.collection('system').doc('ai_rate_limit').set({
            lastRequest: serverTimestamp()
        }));
    });

    it('8. Orphaned Write', async () => {
        const db = testEnv.authenticatedContext('alice').firestore();
        await assertFails(db.collection('resume_versions').doc('v1').set({
            userId: 'alice',
            name: 'Draft',
            // Missing resumeData
            timestamp: serverTimestamp()
        }));
    });

    it('9. Role Modification Bypass', async () => {
        const db = testEnv.authenticatedContext('alice').firestore();
        await assertFails(db.collection('job_applications').doc('j1').set({
            userId: 'alice',
            company: 'Google',
            role: 'SE',
            status: 'Hired', // Invalid enum
            dateAdded: '2026-05-15'
        }));
    });

    it('10. Cross-Tenant Access', async () => {
         await testEnv.withSecurityRulesDisabled(async (context) => {
            await context.firestore().collection('user_memories').doc('bob').set({
                userId: 'bob',
                lastUpdated: serverTimestamp()
            });
        });
        const db = testEnv.authenticatedContext('alice').firestore();
        await assertFails(db.collection('user_memories').doc('bob').get());
    });

    it('11. Spoofed Timestamps', async () => {
        const db = testEnv.authenticatedContext('alice').firestore();
        await assertFails(db.collection('resume_versions').doc('v1').set({
            userId: 'alice',
            name: 'Draft',
            resumeData: {},
            timestamp: new Date('2030-01-01') // Not request.time
        }));
    });

    it('12. Missing Author', async () => {
        const db = testEnv.authenticatedContext('alice').firestore();
        await assertFails(db.collection('downloaded_resumes').doc('d1').set({
            // userId: 'alice',
            resumeData: {},
            format: 'pdf',
            downloadedAt: serverTimestamp()
        }));
    });
});
