"use client";
import { useCallback, useEffect, useState } from "react";

import {
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase/config";

export function useFirebaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(
    () =>
      onAuthStateChanged(auth, (u) => {
        setUser(u);
        setLoading(false);
      }),
    [],
  );

  const signInWithGoogle = useCallback(
    () => signInWithPopup(auth, googleProvider),
    [],
  );
  const signOut = useCallback(() => fbSignOut(auth), []);
  const getIdToken = useCallback(async (): Promise<string | null> => {
    if (!user) return null;
    try {
      return await user.getIdToken();
    } catch (error) {
      console.error("Failed to get ID token:", error);
      return null;
    }
  }, [user]);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    signInWithGoogle,
    signOut,
    getIdToken,
  };
}
