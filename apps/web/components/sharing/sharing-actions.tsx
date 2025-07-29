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
  onClose 
}: SharingActionsProps) {
  const selectedPlatform = PLATFORMS.find(p => p.value === platform);
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/laporan/${reportId}` : '';

  const handleCopyToClipboard = async (textToCopy: string, type: 'caption' | 'link' | 'all') => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      toast.success(
        type === 'all' 
          ? "Caption dan link berhasil disalin!" 
          : `${type === 'caption' ? 'Caption' : 'Link'} berhasil disalin!`
      );
    } catch {
      toast.error("Gagal menyalin ke clipboard. Coba lagi.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
          {isSubmitting ? (
            <Loader2 className="h-8 w-8 text-neutral-600 animate-spin" />
          ) : (
            <CheckCircle className="h-8 w-8 text-green-600" />
          )}
        </div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          {isSubmitting ? "Membagikan Laporan..." : "Siap Dibagikan!"}
        </h3>
        <p className="text-neutral-600 text-sm">
          {isSubmitting 
            ? `Membuka ${selectedPlatform?.label} di tab baru. Jika tidak terbuka, silakan salin manual.`
            : `Jendela ${selectedPlatform?.label} telah dibuka. Anda bisa salin ulang jika perlu.`
          }
        </p>
      </div>
      
      <div className="space-y-4">
        {/* Combined text for copying */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-neutral-900">Pesan untuk Dibagikan</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopyToClipboard(`${caption}\n\n${hashtags.join(" ")}\n\n${shareUrl}`, 'all')}
              className="h-8 px-3 text-xs"
            >
              <Copy className="h-3 w-3 mr-1" />
              Salin Semua
            </Button>
          </div>
          <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200 max-h-48 overflow-y-auto">
            <p className="text-sm text-neutral-700 whitespace-pre-wrap font-sans">{caption}</p>
            {hashtags.length > 0 && (
              <p className="text-sm text-blue-600 mt-2">{hashtags.join(" ")}</p>
            )}
            <p className="text-sm text-neutral-500 mt-2 break-all">{shareUrl}</p>
          </div>
        </div>
      </div>

      <Separator />
      
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1"
        >
          Kembali & Edit
        </Button>
        <Button
          onClick={onClose}
          className="flex-1 bg-neutral-800 hover:bg-neutral-900 text-white"
        >
          Selesai
        </Button>
      </div>
    </div>
  );
} 