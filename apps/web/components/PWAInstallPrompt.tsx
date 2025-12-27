"use client";

import { usePWAInstall } from "@/hooks/usePWAInstall";
import { Button } from "@repo/ui";
import { X, Download } from "lucide-react";
import { useState, useEffect } from "react";

/**
 * Component that shows a prompt to install the application as a PWA.
 * Only appears if the app is installable and the user hasn't dismissed it in the current session.
 */
export const PWAInstallPrompt = () => {
  const { isInstallable, handleInstallClick } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Use useEffect to avoid hydration mismatch and only show after a short delay
  useEffect(() => {
    if (isInstallable && !isDismissed) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
    setIsVisible(false);
  }, [isInstallable, isDismissed]);

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 fixed right-4 bottom-4 left-4 z-50 duration-500 md:right-4 md:left-auto md:max-w-sm">
      <div className="bg-background relative flex flex-col gap-4 rounded-xl border p-5 shadow-2xl">
        <button
          onClick={handleDismiss}
          className="text-muted-foreground hover:bg-muted hover:text-foreground absolute top-3 right-3 rounded-full p-1 transition-colors"
          aria-label="Tutup"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-4">
          <div className="bg-primary/10 text-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-lg">
            <Download size={24} />
          </div>
          <div>
            <h3 className="leading-none font-bold">Install Viralkan</h3>
            <p className="text-muted-foreground mt-1 text-sm">
              Akses cepat dan mudah lewat layar beranda kamu.
            </p>
          </div>
        </div>

        <Button onClick={handleInstallClick} className="w-full font-semibold">
          Install Sekarang
        </Button>
      </div>
    </div>
  );
};
