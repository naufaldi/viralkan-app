"use client";

import React, { createContext, useContext, ReactNode } from "react";
import type { User as FirebaseUser } from "firebase/auth";
import { useAuth } from "../hooks/useAuth";
import type { AuthUser } from "../lib/auth-server";

interface AuthContextType {
  // Firebase state
  firebaseUser: FirebaseUser | null;
  isFirebaseAuthenticated: boolean;

  // Backend state
  backendUser: AuthUser | null;
  isBackendVerified: boolean;
  isVerifying: boolean;

  // Combined auth state
  isAuthenticated: boolean;
  isLoading: boolean;
  isServerVerified: boolean; // New: tracks server-side verification

  // Error state
  authError: string | null;
  clearError: () => void;

  // Actions
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;

  // API helper
  apiCall: (url: string, options?: RequestInit) => Promise<Response>;

  // Token access
  getToken: () => Promise<string | null>;

  // Manual verification
  verifyWithBackend: () => Promise<void>;
  refreshAuth: () => Promise<void>; // New: refresh server auth state
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  initialUser?: AuthUser | null; // Server-side initial user
}

export function AuthProvider({ children, initialUser }: AuthProviderProps) {
  const auth = useAuth(initialUser);

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }

  return context;
}

// Export types for use in other components
export type { AuthUser, AuthContextType };
