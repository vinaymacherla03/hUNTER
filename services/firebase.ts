
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    createUserWithEmailAndPassword as _createUserWithEmailAndPassword, 
    signInWithEmailAndPassword as _signInWithEmailAndPassword, 
    signOut as _signOut, 
    onAuthStateChanged as _onAuthStateChanged, 
    GoogleAuthProvider, 
    signInWithPopup as _signInWithPopup,
    setPersistence as _setPersistence,
    browserLocalPersistence,
    browserSessionPersistence
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json' with { type: 'json' };

let app;
let auth: any;
let db: any;
let isConfigured = false;

try {
    // Check if config is valid (not default placeholders)
    if (firebaseConfig.apiKey && !firebaseConfig.apiKey.includes("TODO")) {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
        isConfigured = true;
    } else {
        console.warn("Firebase configuration missing. Running in MOCK AUTH mode.");
        auth = { currentUser: null }; // Mock auth object
        db = null; // Mock db handle
    }
} catch (e) {
    console.error("Error initializing Firebase:", e);
    auth = { currentUser: null };
    db = null;
}

// --- Mock Auth Implementation ---
// This handles state when no real Firebase is connected so the UI works for demos.

let mockUser: User | null = null;
const mockListeners: ((user: User | null) => void)[] = [];

const createMockUser = (email: string): User => ({
    uid: `mock-user-${Date.now()}`,
    email: email,
    emailVerified: true,
    displayName: email.split('@')[0],
    isAnonymous: false,
    metadata: {
        creationTime: new Date().toISOString(),
        lastSignInTime: new Date().toISOString(),
    },
    providerData: [],
    refreshToken: 'mock-token',
    tenantId: null,
    delete: async () => {},
    getIdToken: async () => 'mock-token',
    getIdTokenResult: async () => ({
        token: 'mock',
        signInProvider: 'password',
        claims: {},
        authTime: new Date().toISOString(),
        issuedAtTime: new Date().toISOString(),
        expirationTime: new Date().toISOString(),
    }),
    reload: async () => {},
    toJSON: () => ({}),
    phoneNumber: null,
    photoURL: null
} as unknown as User);

const notifyMockListeners = () => {
    mockListeners.forEach(l => l(mockUser));
};

// --- Safe Wrappers ---

const onAuthStateChanged = (authInstance: any, callback: (user: User | null) => void) => {
    if (isConfigured && authInstance) {
        return _onAuthStateChanged(authInstance, callback);
    }
    
    // Mock Implementation
    mockListeners.push(callback);
    // Fire immediately with current mock state
    callback(mockUser);
    
    // Return unsubscribe function
    return () => {
        const index = mockListeners.indexOf(callback);
        if (index > -1) mockListeners.splice(index, 1);
    };
};

const signOut = async (authInstance: any) => {
    if (isConfigured && authInstance) {
        return _signOut(authInstance);
    }
    
    // Mock Implementation
    console.log("Mock Sign Out");
    mockUser = null;
    notifyMockListeners();
    return Promise.resolve();
};

const signInWithEmailAndPassword = async (authInstance: any, email: string, pass: string) => {
    if (isConfigured && authInstance) {
        return _signInWithEmailAndPassword(authInstance, email, pass);
    }
    
    // Mock Implementation
    console.log(`Mock Sign In for ${email}`);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    mockUser = createMockUser(email);
    notifyMockListeners();
    return { user: mockUser };
};

const createUserWithEmailAndPassword = async (authInstance: any, email: string, pass: string) => {
    if (isConfigured && authInstance) {
        return _createUserWithEmailAndPassword(authInstance, email, pass);
    }
    
    // Mock Implementation
    console.log(`Mock Sign Up for ${email}`);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    mockUser = createMockUser(email);
    notifyMockListeners();
    return { user: mockUser };
};

const signInWithPopup = async (authInstance: any, provider: any) => {
    if (isConfigured && authInstance) {
        return _signInWithPopup(authInstance, provider);
    }
    
    // Mock Implementation
    console.log("Mock Google Sign In");
    await new Promise(resolve => setTimeout(resolve, 800));
    
    mockUser = createMockUser('demo.user@gmail.com');
    notifyMockListeners();
    return { user: mockUser };
};

const setPersistence = async (authInstance: any, persistence: any) => {
    if (isConfigured && authInstance) {
        return _setPersistence(authInstance, persistence);
    }
    // Mock Implementation
    console.log(`Mock setPersistence: ${persistence}`);
    return Promise.resolve();
};

export { 
    auth, 
    db,
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged, 
    GoogleAuthProvider, 
    signInWithPopup,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence
};

export type { User };