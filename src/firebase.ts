import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

// We always run in real mode as requested
export const isFirebaseMock = false;

const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(firebaseApp);
export const storage = getStorage(firebaseApp);

// Validate connection to Firestore as required by the Firebase Skill
const testConnection = async () => {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase Connection: Initialized and verified with physical Firestore.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Please check your Firebase configuration: Firestore client is offline.");
    }
  }
};
testConnection();

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
  const errMsg = error instanceof Error ? error.message : String(error);
  const isOffline = errMsg.toLowerCase().includes('offline') || errMsg.toLowerCase().includes('failed to get document');

  const errInfo: FirestoreErrorInfo = {
    error: errMsg,
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

  if (isOffline) {
    console.warn('Firestore Offline Notice (Non-fatal): ', JSON.stringify(errInfo));
    // Return gracefully instead of throwing, allowing offline cache to act as fallback
    return;
  }

  console.error('Firestore SECURE Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
