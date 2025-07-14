"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";

interface BackendUser {
  id: number;
  firebase_uid: string;
  email: string;
  name: string;
  avatar_url: string | null;
  provider: string;
  created_at: string;
}

interface AuthContextType {
  // Firebase state
  firebaseUser: any | null;
  isFirebaseAuthenticated: boolean;

  // Backend state
  backendUser: BackendUser | null;
  isBackendVerified: boolean;
  isVerifying: boolean;

  // Combined auth state
  isAuthenticated: boolean;
  isLoading: boolean;

  // Error state
  authError: string | null;
  clearError: () => void;

  // Actions
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;

  // API helper
  apiCall: (url: string, options?: RequestInit) => Promise<Response>;

  // Manual verification
  verifyWithBackend: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth();

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
export type { BackendUser, AuthContextType };
