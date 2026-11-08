import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';

const LOCAL_USER_KEY = 'skillhub_auth_user';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export const authService = {
  // Subscribe to real Firebase auth state changes
  onAuthChange(callback: (user: AuthUser | null) => void) {
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

  // Real Sign in with Firebase email and password
  async signIn(email: string, pass: string): Promise<AuthUser> {
    if (!email || !pass) {
      throw new Error('Informe o e-mail e a senha.');
    }

    const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
    const user: AuthUser = {
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: cred.user.displayName || cred.user.email?.split('@')[0] || 'Criador',
      photoURL: cred.user.photoURL,
    };
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
    return user;
  },

  // Real Sign up with Firebase email and password
  async signUp(email: string, pass: string): Promise<AuthUser> {
    if (!email || !pass) {
      throw new Error('Informe o e-mail e a senha para cadastro.');
    }

    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    const user: AuthUser = {
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: cred.user.displayName || cred.user.email?.split('@')[0] || 'Criador',
      photoURL: cred.user.photoURL,
    };
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
    return user;
  },

  // Real Sign in with Google
  async signInGoogle(): Promise<AuthUser> {
    const cred = await signInWithPopup(auth, googleProvider);
    const user: AuthUser = {
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: cred.user.displayName || cred.user.email?.split('@')[0] || 'Criador',
      photoURL: cred.user.photoURL,
    };
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
    return user;
  },

  // Real Logout
  async signOut(): Promise<void> {
    localStorage.removeItem(LOCAL_USER_KEY);
    await signOut(auth);
  }
};
