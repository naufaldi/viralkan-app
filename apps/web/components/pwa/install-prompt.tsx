"use client";

import { useEffect, useState } from "react";
import { Button } from "@repo/ui/components/ui/button";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setDeferredPrompt(null);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed right-4 bottom-4 left-4 z-50 rounded-xl border border-neutral-200 bg-white p-4 shadow-lg sm:left-auto sm:max-w-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-neutral-900">
            Pasang Viralkan
          </p>
          <p className="text-xs text-neutral-500">
            Akses cepat dari layar utama, tanpa browser.
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
          aria-label="Tutup"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <Button
        onClick={handleInstall}
        className="mt-3 h-9 w-full bg-neutral-800 text-xs text-white hover:bg-neutral-900"
      >
        <Download className="mr-2 h-3.5 w-3.5" />
        Pasang Sekarang
      </Button>
    </div>
  );
};

export default InstallPrompt;
