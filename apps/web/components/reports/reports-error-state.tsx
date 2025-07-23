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
    <div className="text-center py-16 px-4">
      {/* Error Icon with Civic Styling */}
      <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-6 border border-neutral-200">
        <AlertTriangle className="h-10 w-10 text-neutral-600" />
      </div>

      {/* Error Message with Professional Typography */}
      <div className="max-w-md mx-auto space-y-4">
        <h3 className="text-xl font-semibold text-neutral-900 tracking-tight">
          Gagal Memuat Data
        </h3>
        <p className="text-base text-neutral-600 leading-relaxed">
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
          className="gap-3 px-8 py-3 bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 hover:text-neutral-800 transition-all duration-200 font-medium"
        >
          <RefreshCw className="h-4 w-4" />
          Coba Lagi
        </Button>
      </div>
    </div>
  );
}
