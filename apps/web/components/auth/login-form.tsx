import { useState, useEffect } from "react";
import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@repo/ui/components/ui/card";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useAuthContext } from "../../contexts/AuthContext";

interface LoginFormProps {
  onSuccess?: () => void;
  redirectUrl?: string;
}

export function LoginForm({ onSuccess, redirectUrl }: LoginFormProps) {
  const {
    signIn,
    isAuthenticated,
    isLoading: isVerifying,
    authError,
    clearError,
    firebaseUser,
    backendUser,
  } = useAuthContext();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    clearError();

    try {
      await signIn();

      // Wait for backend verification to complete
      // The useAuth hook will handle backend verification automatically
    } catch (error) {
      console.error("Login failed:", error);
      // Error is handled by useAuth hook
    } finally {
      setIsSigningIn(false);
    }
  };

  // Handle success after both Firebase and backend verification complete
  useEffect(() => {
    if (isAuthenticated && !isSigningIn && !isVerifying) {
      // Both Firebase and backend verification successful
      setTimeout(() => {
        if (redirectUrl) {
          window.location.href = redirectUrl;
        } else if (onSuccess) {
          onSuccess();
        } else {
          window.location.href = "/";
        }
      }, 1000); // Small delay to show success state
    }
  }, [isAuthenticated, isSigningIn, isVerifying, redirectUrl, onSuccess]);

  const isLoading = isSigningIn || isVerifying;
  const showError = authError && !isLoading;

  const getButtonText = () => {
    if (isAuthenticated) {
      return "Berhasil masuk!";
    }
    if (isSigningIn) {
      return "Sedang masuk...";
    }
    if (isVerifying) {
      return "Memverifikasi...";
    }
    return "Masuk dengan Google";
  };

  const getStatusMessage = () => {
    if (firebaseUser && !backendUser && isVerifying) {
      return "Menyimpan data pengguna...";
    }
    if (isAuthenticated) {
      return "Login berhasil! Mengalihkan...";
    }
    return null;
  };

  return (
    <Card className="w-full max-w-md mx-auto border border-neutral-200 shadow-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-neutral-900">
          Masuk ke Viralkan
        </CardTitle>
        <CardDescription className="text-neutral-600">
          Bergabung dengan komunitas peduli infrastruktur jalan Indonesia
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Google Sign In Button */}
        <Button
          onClick={handleGoogleSignIn}
          disabled={isLoading || isAuthenticated}
          className="w-full bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 transition-colors disabled:opacity-50"
          size="lg"
        >
          {isAuthenticated ? (
            <CheckCircle2 className="mr-2 h-5 w-5 text-green-600" />
          ) : isLoading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          {getButtonText()}
        </Button>

        {/* Status Message */}
        {getStatusMessage() && (
          <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
            {getStatusMessage()}
          </div>
        )}

        {/* Error Message */}
        {showError && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
            {authError}
            <button
              onClick={clearError}
              className="ml-2 text-red-800 hover:text-red-900 underline"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Terms */}
        <p className="text-xs text-neutral-500 text-center leading-relaxed">
          Dengan masuk, Anda menyetujui{" "}
          <a href="#" className="text-primary-600 hover:underline">
            Syarat & Ketentuan
          </a>{" "}
          dan{" "}
          <a href="#" className="text-primary-600 hover:underline">
            Kebijakan Privasi
          </a>{" "}
          kami.
        </p>
      </CardContent>
    </Card>
  );
}
