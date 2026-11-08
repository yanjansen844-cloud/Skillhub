import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from './firebase';

const LOCAL_USER_KEY = 'skillhub_auth_user';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export const authService = {
  // Subscribe to auth state changes
  onAuthChange(callback: (user: AuthUser | null) => void) {
    if (!isFirebaseConfigured()) {
      try {
        const saved = localStorage.getItem(LOCAL_USER_KEY);
        callback(saved ? JSON.parse(saved) : null);
      } catch {
        callback(null);
      }
      return () => {};
    }

    return onAuthStateChanged(auth, (firebaseUser: User | null) => {
      if (firebaseUser) {
        const user: AuthUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Criador',
          photoURL: firebaseUser.photoURL,
        };
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
        callback(user);
      } else {
        localStorage.removeItem(LOCAL_USER_KEY);
        callback(null);
      }
    });
  },

  // Sign in with email and password
  async signIn(email: string, pass: string): Promise<AuthUser> {
    if (!isFirebaseConfigured()) {
      const mockUser: AuthUser = {
        uid: 'demo-user-123',
        email: email || 'criador@skillhub.io',
        displayName: 'Criador Studio',
        photoURL: null,
      };
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(mockUser));
      return mockUser;
    }

    const cred = await signInWithEmailAndPassword(auth, email, pass);
    return {
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: cred.user.displayName || cred.user.email?.split('@')[0] || 'Criador',
      photoURL: cred.user.photoURL,
    };
  },

  // Sign up with email and password
  async signUp(email: string, pass: string): Promise<AuthUser> {
    if (!isFirebaseConfigured()) {
      const mockUser: AuthUser = {
        uid: `user-${Date.now()}`,
        email,
        displayName: email.split('@')[0],
        photoURL: null,
      };
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(mockUser));
      return mockUser;
    }

    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    return {
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: cred.user.displayName || cred.user.email?.split('@')[0] || 'Criador',
      photoURL: cred.user.photoURL,
    };
  },

  // Sign in with Google
  async signInGoogle(): Promise<AuthUser> {
    if (!isFirebaseConfigured()) {
      const mockUser: AuthUser = {
        uid: 'google-demo-user',
        email: 'google.creator@skillhub.io',
        displayName: 'Google Creator',
        photoURL: null,
      };
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(mockUser));
      return mockUser;
    }

    const cred = await signInWithPopup(auth, googleProvider);
    return {
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: cred.user.displayName || cred.user.email?.split('@')[0] || 'Criador',
      photoURL: cred.user.photoURL,
    };
  },

  // Logout
  async signOut(): Promise<void> {
    localStorage.removeItem(LOCAL_USER_KEY);
    if (isFirebaseConfigured()) {
      await signOut(auth);
    }
  }
};
