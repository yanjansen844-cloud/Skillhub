import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAkYGjqg5rYshRcBzMKdI0jwaCbho1LzYw",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "skillhub-b12fd.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "skillhub-b12fd",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "skillhub-b12fd.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "912742798392",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:912742798392:web:07c544324b74cc0ee142cd",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-GSLXL9FPLP"
};

// Validates that environment variables or production config are properly supplied
export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.apiKey.startsWith('AIzaSy')
  );
};

// Initialize Firebase App
const app = getApps().length > 0 
  ? getApp() 
  : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Safe initialization of Google Analytics in browser environment
export let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== 'undefined' && isFirebaseConfigured()) {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // ignore analytics error if offline or adblock
  });
}

export default app;
