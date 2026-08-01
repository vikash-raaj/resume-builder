import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  confirmPasswordReset,
  type User,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase/config";

const ACTION_CODE_SETTINGS = {
  url: `${window.location.origin}/reset-password`,
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signup: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<unknown>;
  loginWithGoogle: () => Promise<unknown>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  confirmReset: (oobCode: string, newPassword: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const signup = (email: string, password: string, name: string) =>
    createUserWithEmailAndPassword(auth, email, password).then((cred) =>
      updateProfile(cred.user, { displayName: name })
    );

  const login = (email: string, password: string) =>
    signInWithEmailAndPassword(auth, email, password);

  const loginWithGoogle = () => signInWithPopup(auth, googleProvider);

  const logout = () => signOut(auth);

  const resetPassword = (email: string) => sendPasswordResetEmail(auth, email, ACTION_CODE_SETTINGS);

  const confirmReset = (oobCode: string, newPassword: string) => confirmPasswordReset(auth, oobCode, newPassword);

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, loginWithGoogle, logout, resetPassword, confirmReset }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext) as AuthContextValue;
