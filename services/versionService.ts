
import { db, auth } from './firebase';
import { 
    collection, 
    addDoc, 
    query, 
    where, 
    orderBy, 
    getDocs, 
    deleteDoc, 
    doc, 
    serverTimestamp,
    Timestamp,
    updateDoc as _updateDoc
} from 'firebase/firestore';
import { ResumeData, ResumeVersion } from '../types';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHelper';

const COLLECTION_NAME = 'resume_versions';

export const versionService = {
    saveVersion: async (name: string, resumeData: ResumeData, isAutoSave: boolean = false): Promise<string> => {
        if (!auth.currentUser) throw new Error("User must be authenticated to save versions.");

        try {
            const docRef = await addDoc(collection(db, COLLECTION_NAME), {
                userId: auth.currentUser.uid,
                name,
                resumeData,
                timestamp: serverTimestamp(),
                isAutoSave
            });
            return docRef.id;
        } catch (error) {
            handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
            throw error; // Will be caught by handleFirestoreError (which throws), this is safety
        }
    },

    getVersions: async (): Promise<ResumeVersion[]> => {
        if (!auth.currentUser) return [];

        try {
            const q = query(
                collection(db, COLLECTION_NAME),
                where("userId", "==", auth.currentUser.uid),
                orderBy("timestamp", "desc")
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as ResumeVersion));
        } catch (error) {
            handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
            return [];
        }
    },

    deleteVersion: async (versionId: string): Promise<void> => {
        if (!auth.currentUser) throw new Error("User must be authenticated to delete versions.");
        try {
            await deleteDoc(doc(db, COLLECTION_NAME, versionId));
        } catch (error) {
            handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${versionId}`);
        }
    },

    updateVersion: async (versionId: string, updates: Partial<ResumeVersion>): Promise<void> => {
        if (!auth.currentUser) throw new Error("User must be authenticated to update versions.");
        try {
            await _updateDoc(doc(db, COLLECTION_NAME, versionId), updates);
        } catch (error) {
            handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${versionId}`);
        }
    }
};
