import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Validate that all required environment variables are set
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  console.error('Firebase configuration is missing. Please set up your .env.local file with Firebase credentials.');
  console.error('See FIREBASE_SETUP.md for instructions on how to get your Firebase config.');
  console.error('Required environment variables:');
  console.error('  - VITE_FIREBASE_API_KEY');
  console.error('  - VITE_FIREBASE_AUTH_DOMAIN');
  console.error('  - VITE_FIREBASE_PROJECT_ID');
  console.error('  - VITE_FIREBASE_STORAGE_BUCKET');
  console.error('  - VITE_FIREBASE_MESSAGING_SENDER_ID');
  console.error('  - VITE_FIREBASE_APP_ID');
  
  // Create a dummy config to prevent crashes, but Firebase operations will fail
  firebaseConfig.apiKey = firebaseConfig.apiKey || 'missing-api-key';
  firebaseConfig.authDomain = firebaseConfig.authDomain || 'missing-auth-domain';
  firebaseConfig.projectId = firebaseConfig.projectId || 'missing-project-id';
  firebaseConfig.storageBucket = firebaseConfig.storageBucket || 'missing-storage-bucket';
  firebaseConfig.messagingSenderId = firebaseConfig.messagingSenderId || 'missing-messaging-sender-id';
  firebaseConfig.appId = firebaseConfig.appId || 'missing-app-id';
}

// Initialize Firebase only if it hasn't been initialized already
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

// Connect to emulator in development if needed
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
  connectFunctionsEmulator(functions, 'localhost', 5001);
}

