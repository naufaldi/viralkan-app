"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "../../contexts/AuthContext";

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

export const AdminRouteGuard = ({ children }: AdminRouteGuardProps) => {
  const { isAuthenticated, isLoading, backendUser } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }

      // If authenticated but not admin, redirect to dashboard
      if (backendUser && backendUser.role !== "admin") {
        router.push("/dashboard");
        return;
      }
    }
  }, [isAuthenticated, isLoading, backendUser, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900 mx-auto"></div>
          <p className="mt-2 text-sm text-neutral-600">Memverifikasi akses...</p>
        </div>
      </div>
    );
  }

  // If not authenticated or not admin, don't render children
  if (!isAuthenticated || !backendUser || backendUser.role !== "admin") {
    return null;
  }

  // User is authenticated and has admin role, render children
  return <>{children}</>;
}; 