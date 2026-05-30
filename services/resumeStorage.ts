
import { db, auth } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ResumeData } from '../types';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHelper';

export const saveDownloadedResume = async (resumeData: ResumeData, format: 'pdf' | 'txt' | 'json', template?: string) => {
    if (!db || !auth.currentUser) return;

    try {
        await addDoc(collection(db, 'downloaded_resumes'), {
            userId: auth.currentUser.uid,
            resumeData,
            format,
            template: template || 'unknown',
            downloadedAt: serverTimestamp()
        });
    } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'downloaded_resumes');
    }
};
