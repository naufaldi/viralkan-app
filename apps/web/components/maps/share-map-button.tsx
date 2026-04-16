"use client";

import { useState } from "react";
import { Share2, Copy, Check } from "lucide-react";
import { toast } from "sonner";

/**
 * Floating share button on the map that copies the current URL (which includes
 * map state as search params) to the clipboard, with WhatsApp/Twitter share options.
 */
export const ShareMapButton = () => {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Link disalin!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Gagal menyalin link");
    }
  };

  const handleShareWhatsApp = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent("Lihat peta kerusakan jalan di Viralkan:");
    window.open(`https://wa.me/?text=${text}%20${url}`, "_blank");
    setOpen(false);
  };

  const handleShareTwitter = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent("Lihat peta kerusakan jalan di Viralkan");
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      "_blank",
    );
    setOpen(false);
  };

  return (
    <div className="absolute top-3 right-3 z-[1000]">
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-white shadow-md transition-colors hover:bg-neutral-50"
          title="Bagikan peta"
          aria-label="Bagikan peta"
        >
          <Share2 className="h-4 w-4 text-neutral-700" />
        </button>

        {open && (
          <div className="absolute top-12 right-0 w-44 rounded-lg border border-neutral-200 bg-white py-1 shadow-lg">
            <button
              onClick={handleCopy}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? "Disalin!" : "Salin Link"}
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50"
            >
              <span className="text-base">💬</span>
              WhatsApp
            </button>
            <button
              onClick={handleShareTwitter}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50"
            >
              <span className="text-base">🐦</span>
              Twitter
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
