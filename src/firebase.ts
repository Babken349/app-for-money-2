import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

// Check if we are running with mock credentials
export const isFirebaseMock = firebaseConfig.apiKey.includes('mock-api-key') || !firebaseConfig.apiKey;

let firebaseApp;
let firestoreDb: any = null;
let firebaseAuth: any = null;
let firebaseStorage: any = null;

if (!isFirebaseMock) {
  try {
    firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    firestoreDb = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
    firebaseAuth = getAuth(firebaseApp);
    firebaseStorage = getStorage(firebaseApp);

    // Validate connection to Firestore as required by the Firebase Skill
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(firestoreDb, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.warn("Please check your Firebase configuration: Firestore client is offline.");
        }
      }
    };
    testConnection();
  } catch (error) {
    console.warn("Failed to initialize physical Firebase SDK, switching to Local DB Fallback Mode:", error);
  }
}

export const db = firestoreDb;
export const auth = firebaseAuth;
export const storage = firebaseStorage;

// Firestore Specific Error JSON Reporting (Skill requirement)
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || 'offline-mock-user',
      email: auth?.currentUser?.email || 'mock@example.com',
      emailVerified: auth?.currentUser?.emailVerified || true,
      isAnonymous: auth?.currentUser?.isAnonymous || false,
      tenantId: auth?.currentUser?.tenantId || null
    },
    operationType,
    path
  };
  console.error('Firestore SECURE Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
