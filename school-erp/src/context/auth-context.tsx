"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import { ref, get, set } from "firebase/database";
import { auth, db } from "@/lib/firebase";
import type { AuthState, FirebaseUser } from "@/types";

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<string>;
  signOut: () => Promise<void>;
  setSchoolId: (id: string | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function toFirebaseUser(u: import("firebase/auth").User): FirebaseUser {
  return { uid: u.uid, email: u.email, displayName: u.displayName, photoURL: u.photoURL };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    schoolId: null,
    loading: true,
  });

  const resolveSchoolId = useCallback(async (uid: string) => {
    if (!db) return null;
    const snap = await get(ref(db, `users/${uid}/schoolId`));
    return snap.exists() ? (snap.val() as string) : null;
  }, []);

  useEffect(() => {
    if (!auth) {
      setState((prev) => ({ ...prev, loading: false }));
      return;
    }
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const user = toFirebaseUser(firebaseUser);
        const schoolId = await resolveSchoolId(firebaseUser.uid);
        setState({ user, schoolId, loading: false });
      } else {
        setState({ user: null, schoolId: null, loading: false });
      }
    });
  }, [resolveSchoolId]);

  async function signIn(email: string, password: string) {
    if (!auth) throw new Error("Firebase not configured");
    setState((prev) => ({ ...prev, loading: true }));
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function signUp(email: string, password: string, name: string): Promise<string> {
    if (!auth || !db) throw new Error("Firebase not configured");
    setState((prev) => ({ ...prev, loading: true }));
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });

    const schoolId = cred.user.uid;
    await set(ref(db, `users/${cred.user.uid}`), {
      email,
      name,
      schoolId,
      role: "admin",
      createdAt: Date.now(),
    });
    await set(ref(db, `schools/${schoolId}/profile`), {
      id: schoolId,
      name: "",
      address: "",
      phone: "",
      email,
      createdAt: Date.now(),
    });
    return schoolId;
  }

  async function signOut() {
    if (!auth) return;
    await firebaseSignOut(auth);
    setState({ user: null, schoolId: null, loading: false });
  }

  function setSchoolId(id: string | null) {
    setState((prev) => ({ ...prev, schoolId: id }));
  }

  return (
    <AuthContext value={{ ...state, signIn, signUp, signOut, setSchoolId }}>
      {children}
    </AuthContext>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
