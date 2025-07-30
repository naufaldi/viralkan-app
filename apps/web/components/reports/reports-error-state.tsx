"use client";

import { Button } from "@repo/ui/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ReportsErrorStateProps {
  error?: Error | null;
  onRetry?: () => void;
}

export function ReportsErrorState({ error, onRetry }: ReportsErrorStateProps) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="px-4 py-16 text-center">
      {/* Error Icon with Civic Styling */}
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-neutral-200 bg-neutral-100">
        <AlertTriangle className="h-10 w-10 text-neutral-600" />
      </div>

      {/* Error Message with Professional Typography */}
      <div className="mx-auto max-w-md space-y-4">
        <h3 className="text-xl font-semibold tracking-tight text-neutral-900">
          Gagal Memuat Data
        </h3>
        <p className="text-base leading-relaxed text-neutral-600">
          {error?.message ||
            "Terjadi kesalahan saat memuat data laporan. Silakan coba lagi."}
        </p>
      </div>

      {/* Retry Button with Civic Design */}
      <div className="mt-8">
        <Button
          onClick={handleRetry}
          variant="outline"
          size="lg"
          className="gap-3 border-neutral-300 bg-white px-8 py-3 font-medium text-neutral-700 transition-all duration-200 hover:border-neutral-400 hover:bg-neutral-50 hover:text-neutral-800"
        >
          <RefreshCw className="h-4 w-4" />
          Coba Lagi
        </Button>
      </div>
    </div>
  );
}
