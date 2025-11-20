import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getDatabase, Database } from "firebase-admin/database";
import { getStorage, Storage } from "firebase-admin/storage";

let adminApp: App | undefined;
let _adminAuth: Auth | undefined;
let _adminDb: Firestore | undefined;
let _adminDatabase: Database | undefined;
let _adminStorage: Storage | undefined;

function getAdminApp(): App {
  if (adminApp) {
    return adminApp;
  }

  if (getApps().length === 0) {
    // Skip initialization during build time
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      console.log("Skipping Firebase Admin initialization during build");
      throw new Error("Firebase Admin not available during build");
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
        databaseURL: process.env.FIREBASE_DATABASE_URL || `https://${process.env.FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`,
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
    _adminAuth = getAuth(getAdminApp());
  }
  return _adminAuth;
};

export const getAdminDb = (): Firestore => {
  if (!_adminDb) {
    _adminDb = getFirestore(getAdminApp());
  }
  return _adminDb;
};

export const getAdminDatabase = (): Database => {
  if (!_adminDatabase) {
    _adminDatabase = getDatabase(getAdminApp());
  }
  return _adminDatabase;
};

export const getAdminStorage = (): Storage => {
  if (!_adminStorage) {
    _adminStorage = getStorage(getAdminApp());
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

export const adminDatabase = new Proxy({} as Database, {
  get: (target, prop) => {
    return (getAdminDatabase() as any)[prop];
  }
});

export const adminStorage = new Proxy({} as Storage, {
  get: (target, prop) => {
    return (getAdminStorage() as any)[prop];
  }
});

export default getAdminApp;
