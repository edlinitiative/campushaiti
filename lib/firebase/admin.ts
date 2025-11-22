import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getStorage, Storage } from "firebase-admin/storage";

let adminApp: App | undefined;
let _adminAuth: Auth | undefined;
let _adminDb: Firestore | undefined;
let _adminStorage: Storage | undefined;

function getAdminApp(): App {
  if (adminApp) {
    return adminApp;
  }

  if (getApps().length === 0) {
    // Skip initialization during build time only
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      console.log("Skipping Firebase Admin initialization during build");
      // Return a mock app to prevent errors during build
      return {} as App;
    }
    
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
      console.error("Missing Firebase Admin environment variables");
      throw new Error("Firebase Admin environment variables are not set. Please configure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in Vercel.");
    }

    // Parse the private key properly (handle all formats)
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;
    
    // Remove quotes if present
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    }
    
    // Replace escaped newlines with actual newlines
    privateKey = privateKey.replace(/\\n/g, "\n");

    try {
      adminApp = initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });
    } catch (error) {
      console.error("Failed to initialize Firebase Admin:", error);
      throw error;
    }
  } else {
    adminApp = getApps()[0];
  }

  return adminApp;
}

// Lazy getters for Firebase Admin services
export const getAdminAuth = (): Auth => {
  if (!_adminAuth) {
    const app = getAdminApp();
    // Return mock during build
    if (!app || Object.keys(app).length === 0) {
      return {} as Auth;
    }
    _adminAuth = getAuth(app);
  }
  return _adminAuth;
};

export const getAdminDb = (): Firestore => {
  if (!_adminDb) {
    const app = getAdminApp();
    // Return mock during build
    if (!app || Object.keys(app).length === 0) {
      return {} as Firestore;
    }
    _adminDb = getFirestore(app);
  }
  // Re-check if the cached db is actually a valid Firestore instance
  // This handles cases where it was initialized as a mock during build
  if (_adminDb && typeof (_adminDb as any).collection !== 'function') {
    const app = getAdminApp();
    if (app && Object.keys(app).length > 0) {
      _adminDb = getFirestore(app);
    }
  }
  return _adminDb;
};

export const getAdminStorage = (): Storage => {
  if (!_adminStorage) {
    const app = getAdminApp();
    // Return mock during build
    if (!app || Object.keys(app).length === 0) {
      return {} as Storage;
    }
    _adminStorage = getStorage(app);
  }
  return _adminStorage;
};

// Deprecated: Use getAdminAuth(), getAdminDb(), getAdminStorage() instead
// These are kept for backwards compatibility but will be removed
export const adminAuth = new Proxy({} as Auth, {
  get: (target, prop) => {
    return (getAdminAuth() as any)[prop];
  }
});

export const adminDb = new Proxy({} as Firestore, {
  get: (target, prop) => {
    return (getAdminDb() as any)[prop];
  }
});

export const adminStorage = new Proxy({} as Storage, {
  get: (target, prop) => {
    return (getAdminStorage() as any)[prop];
  }
});

export default getAdminApp;
