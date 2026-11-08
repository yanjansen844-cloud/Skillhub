import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// A sessão é mantida pelo próprio Firebase Auth (IndexedDB). Nada de perfil em localStorage.
const toAuthUser = (u: User): AuthUser => ({
  uid: u.uid,
  email: u.email,
  displayName: u.displayName || u.email?.split('@')[0] || 'Criador',
  photoURL: u.photoURL,
});

export const authService = {
  onAuthChange(callback: (user: AuthUser | null) => void) {
    return onAuthStateChanged(auth, (u) => callback(u ? toAuthUser(u) : null));
  },

  /** "Lembrar deste dispositivo": sessão persistente ou só até fechar o navegador. */
  async applyPersistence(remember: boolean): Promise<void> {
    await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
  },

  async signIn(email: string, pass: string, remember = true): Promise<AuthUser> {
    if (!email || !pass) throw new Error('Informe o e-mail e a senha.');
    await this.applyPersistence(remember);
    const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
    return toAuthUser(cred.user);
  },

  async signUp(email: string, pass: string, remember = true): Promise<AuthUser> {
    if (!email || !pass) throw new Error('Informe o e-mail e a senha para cadastro.');
    await this.applyPersistence(remember);
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    return toAuthUser(cred.user);
  },

  async signInGoogle(): Promise<AuthUser> {
    const cred = await signInWithPopup(auth, googleProvider);
    return toAuthUser(cred.user);
  },

  async sendPasswordReset(email: string): Promise<void> {
    if (!email) throw new Error('Informe seu e-mail para receber o link de redefinição.');
    await sendPasswordResetEmail(auth, email.trim());
  },

  async signOut(): Promise<void> {
    await signOut(auth);
  },
};
