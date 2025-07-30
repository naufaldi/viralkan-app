"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Label } from "@repo/ui/components/ui/label";
import { Separator } from "@repo/ui/components/ui/separator";
import { Copy, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { PLATFORMS, type Platform } from "./platform-selector";

interface SharingActionsProps {
  isSubmitting: boolean;
  caption: string;
  hashtags: string[];
  reportId: string;
  platform: Platform;
  onBack: () => void;
  onClose: () => void;
}

export function SharingActions({
  isSubmitting,
  caption,
  hashtags,
  reportId,
  platform,
  onBack,
  onClose,
}: SharingActionsProps) {
  const selectedPlatform = PLATFORMS.find((p) => p.value === platform);
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/laporan/${reportId}`
      : "";

  const handleCopyToClipboard = async (
    textToCopy: string,
    type: "caption" | "link" | "all",
  ) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      toast.success(
        type === "all"
          ? "Caption dan link berhasil disalin!"
          : `${type === "caption" ? "Caption" : "Link"} berhasil disalin!`,
      );
    } catch {
      toast.error("Gagal menyalin ke clipboard. Coba lagi.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
          {isSubmitting ? (
            <Loader2 className="h-8 w-8 animate-spin text-neutral-600" />
          ) : (
            <CheckCircle className="h-8 w-8 text-green-600" />
          )}
        </div>
        <h3 className="mb-2 text-lg font-semibold text-neutral-900">
          {isSubmitting ? "Membagikan Laporan..." : "Siap Dibagikan!"}
        </h3>
        <p className="text-sm text-neutral-600">
          {isSubmitting
            ? `Membuka ${selectedPlatform?.label} di tab baru. Jika tidak terbuka, silakan salin manual.`
            : `Jendela ${selectedPlatform?.label} telah dibuka. Anda bisa salin ulang jika perlu.`}
        </p>
      </div>

      <div className="space-y-4">
        {/* Combined text for copying */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-neutral-900">
              Pesan untuk Dibagikan
            </Label>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleCopyToClipboard(
                  `${caption}\n\n${hashtags.join(" ")}\n\n${shareUrl}`,
                  "all",
                )
              }
              className="h-8 px-3 text-xs"
            >
              <Copy className="mr-1 h-3 w-3" />
              Salin Semua
            </Button>
          </div>
          <div className="max-h-48 overflow-y-auto rounded-lg border border-neutral-200 bg-neutral-50 p-4">
            <p className="font-sans text-sm whitespace-pre-wrap text-neutral-700">
              {caption}
            </p>
            {hashtags.length > 0 && (
              <p className="mt-2 text-sm text-blue-600">{hashtags.join(" ")}</p>
            )}
            <p className="mt-2 text-sm break-all text-neutral-500">
              {shareUrl}
            </p>
          </div>
        </div>
      </div>

      <Separator />

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Kembali & Edit
        </Button>
        <Button
          onClick={onClose}
          className="flex-1 bg-neutral-800 text-white hover:bg-neutral-900"
        >
          Selesai
        </Button>
      </div>
    </div>
  );
}
