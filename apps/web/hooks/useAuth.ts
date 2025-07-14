"use client";

import { useState, useEffect } from "react";
import { useFirebaseAuth } from "./useFirebaseAuth";

interface BackendUser {
  id: number;
  firebase_uid: string;
  email: string;
  name: string;
  avatar_url: string | null;
  provider: string;
  created_at: string;
}

interface AuthVerificationResponse {
  message: string;
  user_id: number;
  user: BackendUser;
}

type AuthError =
  | "firebase-auth-failed"
  | "firebase-token-invalid"
  | "backend-verification-failed"
  | "network-error"
  | "unknown-error";

const AUTH_ERROR_MESSAGES: Record<AuthError, string> = {
  "firebase-auth-failed": "Gagal masuk dengan Google. Silakan coba lagi.",
  "firebase-token-invalid": "Sesi telah berakhir. Silakan masuk kembali.",
  "backend-verification-failed":
    "Gagal verifikasi dengan server. Silakan coba lagi.",
  "network-error": "Tidak ada koneksi internet. Silakan coba lagi.",
  "unknown-error": "Terjadi kesalahan. Silakan coba lagi.",
};

export function useAuth() {
  const {
    user: firebaseUser,
    signInWithGoogle,
    signOut: firebaseSignOut,
    getIdToken,
  } = useFirebaseAuth();
  const [backendUser, setBackendUser] = useState<BackendUser | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  const clearError = () => setAuthError(null);

  const handleAuthError = (error: AuthError) => {
    const message = AUTH_ERROR_MESSAGES[error];
    setAuthError(message);
    console.error(`Auth error (${error}):`, message);
  };

  const verifyWithBackend = async () => {
    if (!firebaseUser) return;

    setIsVerifying(true);
    setAuthError(null);

    try {
      const firebaseToken = await getIdToken();

      if (!firebaseToken) {
        handleAuthError("firebase-token-invalid");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${firebaseToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data: AuthVerificationResponse = await response.json();
        setBackendUser(data.user);
        console.log("Backend verification successful:", data.message);
      } else if (response.status === 401) {
        handleAuthError("firebase-token-invalid");
        // Force Firebase sign out if token is invalid
        await firebaseSignOut();
      } else {
        handleAuthError("backend-verification-failed");
      }
    } catch (error) {
      console.error("Backend verification failed:", error);
      if (error instanceof TypeError && error.message.includes("fetch")) {
        handleAuthError("network-error");
      } else {
        handleAuthError("unknown-error");
      }
    } finally {
      setIsVerifying(false);
    }
  };

  // Auto-verify when Firebase user changes
  useEffect(() => {
    if (firebaseUser) {
      verifyWithBackend();
    } else {
      setBackendUser(null);
      setAuthError(null);
    }
  }, [firebaseUser]);

  const apiCall = async (
    url: string,
    options: RequestInit = {},
  ): Promise<Response> => {
    if (!firebaseUser) {
      throw new Error("User not authenticated");
    }

    const firebaseToken = await getIdToken();

    if (!firebaseToken) {
      throw new Error("Failed to get authentication token");
    }

    return fetch(url.startsWith("http") ? url : `${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${firebaseToken}`,
        "Content-Type": "application/json",
      },
    });
  };

  const signIn = async () => {
    clearError();
    try {
      await signInWithGoogle();
      // verifyWithBackend will be called automatically via useEffect
    } catch (error) {
      console.error("Firebase sign in failed:", error);
      handleAuthError("firebase-auth-failed");
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut();
      setBackendUser(null);
      setAuthError(null);
    } catch (error) {
      console.error("Sign out failed:", error);
      // Force clear state even if sign out fails
      setBackendUser(null);
      setAuthError(null);
    }
  };

  return {
    // Firebase state
    firebaseUser,
    isFirebaseAuthenticated: !!firebaseUser,

    // Backend state
    backendUser,
    isBackendVerified: !!backendUser,
    isVerifying,

    // Combined auth state
    isAuthenticated: !!firebaseUser && !!backendUser,
    isLoading: isVerifying,

    // Error state
    authError,
    clearError,

    // Actions
    signIn,
    signOut,

    // API helper
    apiCall,

    // Manual verification (if needed)
    verifyWithBackend,
  };
}
