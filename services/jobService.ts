
import { 
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    getDocs, 
    query, 
    where, 
    deleteDoc, 
    updateDoc,
    onSnapshot,
    Timestamp,
    orderBy
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { JobApplication } from '../types';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHelper';

const COLLECTION_NAME = 'job_applications';

export const jobService = {
    async createJob(job: Omit<JobApplication, 'id' | 'userId'>): Promise<string> {
        if (!auth.currentUser) throw new Error('User must be authenticated');
        
        const id = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const jobData: JobApplication = {
            ...job,
            id,
            userId: auth.currentUser.uid,
            contacts: job.contacts || [],
            tasks: job.tasks || [],
        };
        
        try {
            await setDoc(doc(db, COLLECTION_NAME, id), jobData);
            return id;
        } catch (error) {
            handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
            throw error;
        }
    },

    async updateJob(id: string, updates: Partial<JobApplication>): Promise<void> {
        if (!auth.currentUser) throw new Error('User must be authenticated');
        const jobRef = doc(db, COLLECTION_NAME, id);
        try {
            await updateDoc(jobRef, updates);
        } catch (error) {
            handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
        }
    },

    async deleteJob(id: string): Promise<void> {
        if (!auth.currentUser) throw new Error('User must be authenticated');
        try {
            await deleteDoc(doc(db, COLLECTION_NAME, id));
        } catch (error) {
            handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
        }
    },

    async getJobs(): Promise<JobApplication[]> {
        if (!auth.currentUser) return [];
        
        try {
            const q = query(
                collection(db, COLLECTION_NAME), 
                where('userId', '==', auth.currentUser.uid),
                orderBy('dateAdded', 'desc')
            );
            
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => doc.data() as JobApplication);
        } catch (error) {
            handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
            return [];
        }
    },

    subscribeToJobs(callback: (jobs: JobApplication[]) => void) {
        if (!auth.currentUser) return () => {};
        
        const q = query(
            collection(db, COLLECTION_NAME), 
            where('userId', '==', auth.currentUser.uid),
            orderBy('dateAdded', 'desc')
        );
        
        return onSnapshot(q, (snapshot) => {
            const jobs = snapshot.docs.map(doc => doc.data() as JobApplication);
            callback(jobs);
        }, (error) => {
            handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
        });
    }
};
