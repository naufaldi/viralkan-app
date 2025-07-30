"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Label } from "@repo/ui/components/ui/label";
import { Badge } from "@repo/ui/components/ui/badge";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { PLATFORMS, type Platform } from "./platform-selector";

interface SharingPreviewProps {
  caption: string;
  hashtags: string[];
  characterCount: number;
  reportId: string;
  platform: Platform;
  onCaptionChange: (caption: string) => void;
}

export function SharingPreview({
  caption,
  hashtags,
  characterCount,
  reportId,
  platform,
  onCaptionChange,
}: SharingPreviewProps) {
  const selectedPlatform = PLATFORMS.find((p) => p.value === platform);
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/laporan/${reportId}`
      : "";

  const handleCopyToClipboard = async (
    textToCopy: string,
    type: "caption" | "link",
  ) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      toast.success(
        `${type === "caption" ? "Caption" : "Link"} berhasil disalin!`,
      );
    } catch {
      toast.error("Gagal menyalin ke clipboard. Coba lagi.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-neutral-900">
          Preview Caption
        </Label>
        <div className="flex items-center gap-2">
          {selectedPlatform && (
            <div className="flex items-center gap-1 text-xs text-neutral-500">
              <selectedPlatform.icon className="h-3 w-3" />
              {selectedPlatform.label}
              {!selectedPlatform.supportsPrefill && (
                <span className="rounded bg-neutral-200 px-1 text-xs">
                  Copy-paste
                </span>
              )}
            </div>
          )}
          <div className="text-xs text-neutral-500">
            {characterCount} karakter
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
        <Textarea
          value={caption}
          onChange={(e) => onCaptionChange(e.target.value)}
          placeholder="Caption akan muncul di sini..."
          className="min-h-[120px] resize-none border-0 bg-transparent text-neutral-700 focus:ring-0"
        />
      </div>

      {/* Hashtags */}
      {hashtags.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-neutral-900">
            Hashtags
          </Label>
          <div className="flex flex-wrap gap-2">
            {hashtags.map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-neutral-200 text-neutral-700"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Link Preview */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-neutral-900">
          Link yang akan dibagikan
        </Label>
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center gap-2 text-sm text-neutral-600">
              <ExternalLink className="h-4 w-4 flex-shrink-0" />
              <span className="break-all">{shareUrl}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopyToClipboard(shareUrl, "link")}
              className="ml-2 h-8 px-2 text-xs"
            >
              <Copy className="mr-1 h-3 w-3" />
              Salin
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
