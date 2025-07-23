"use client";

import { useState, useEffect } from "react";
import { useFirebaseAuth } from "./useFirebaseAuth";
import { setAuthCookie, clearAuthCookie } from "../lib/auth-cookies";
import type { AuthUser } from "../lib/auth-server";

interface AuthVerificationResponse {
  message: string;
  user_id: number;
  user: AuthUser;
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

export function useAuth(initialUser?: AuthUser | null) {
  const {
    user: firebaseUser,
    signInWithGoogle,
    signOut: firebaseSignOut,
    getIdToken,
  } = useFirebaseAuth();
  const [backendUser, setBackendUser] = useState<AuthUser | null>(
    initialUser || null,
  );
  const [isVerifying, setIsVerifying] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isServerVerified, setIsServerVerified] = useState(!!initialUser);

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
      // Set cookie immediately when Firebase user is available
      const setCookieAndVerify = async () => {
        try {
          const firebaseToken = await getIdToken();
          
          if (firebaseToken) {
            // Set secure HTTP-only cookie via Server Action
            await setAuthCookie(firebaseToken);
          }
          // Then verify with backend
          await verifyWithBackend();
        } catch (error) {
          console.error("Failed to set auth cookie:", error);
          handleAuthError("unknown-error");
        }
      };
      setCookieAndVerify();
    } else {
      setBackendUser(null);
      setAuthError(null);
      setIsServerVerified(false);
    }
  }, [firebaseUser]);

  // Sync with server-side auth state
  useEffect(() => {
    if (!isServerVerified && !isVerifying) {
      refreshAuth();
    }
  }, [isServerVerified, isVerifying]);

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

  const refreshAuth = async () => {
    setIsVerifying(true);
    try {
      // This would call server-side verification
      await verifyWithBackend();
      setIsServerVerified(true);
    } catch (error) {
      console.error("Auth refresh failed:", error);
      setIsServerVerified(false);
    } finally {
      setIsVerifying(false);
    }
  };

  const signIn = async () => {
    clearError();
    try {
      await signInWithGoogle();
      // Cookie setting and backend verification will be handled automatically via useEffect
    } catch (error) {
      console.error("Firebase sign in failed:", error);
      handleAuthError("firebase-auth-failed");
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut();
      // Clear secure cookie via Server Action
      await clearAuthCookie();
      setBackendUser(null);
      setAuthError(null);
      setIsServerVerified(false);
    } catch (error) {
      console.error("Sign out failed:", error);
      // Force clear state even if sign out fails
      await clearAuthCookie();
      setBackendUser(null);
      setAuthError(null);
      setIsServerVerified(false);
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
    isServerVerified,

    // Error state
    authError,
    clearError,

    // Actions
    signIn,
    signOut,

    // API helper
    apiCall,

    // Token access
    getToken: getIdToken,
    get token() {
      return firebaseUser ? getIdToken() : null;
    },

    // Manual verification
    verifyWithBackend,
    refreshAuth,
  };
}
