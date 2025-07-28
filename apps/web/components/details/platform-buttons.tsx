"use client";

import { useState } from "react";
import { Button } from "@repo/ui/components/ui/button";
import { Check, Copy, ExternalLink } from "lucide-react";

interface PlatformButtonsProps {
  caption: string;
  reportUrl: string;
  onShareSuccess: (platform: string) => void;
  disabled?: boolean;
}

interface Platform {
  id: string;
  name: string;
  icon: string;
  color: string;
  hoverBg: string;
  hoverBorder: string;
  action: "url" | "copy";
}

const platforms: Platform[] = [
  {
    id: "whatsapp",
    name: "WhatsApp",
    icon: "💬",
    color: "text-green-600",
    hoverBg: "hover:bg-green-50",
    hoverBorder: "hover:border-green-300",
    action: "url",
  },
  {
    id: "twitter",
    name: "Twitter/X",
    icon: "🐦",
    color: "text-blue-600",
    hoverBg: "hover:bg-blue-50",
    hoverBorder: "hover:border-blue-300",
    action: "url",
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: "📘",
    color: "text-blue-700",
    hoverBg: "hover:bg-blue-50",
    hoverBorder: "hover:border-blue-400",
    action: "url",
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: "📷",
    color: "text-pink-600",
    hoverBg: "hover:bg-pink-50",
    hoverBorder: "hover:border-pink-300",
    action: "copy",
  },
  {
    id: "telegram",
    name: "Telegram",
    icon: "✈️",
    color: "text-blue-500",
    hoverBg: "hover:bg-blue-50",
    hoverBorder: "hover:border-blue-300",
    action: "url",
  },
];

export function PlatformButtons({
  caption,
  reportUrl,
  onShareSuccess,
  disabled = false,
}: PlatformButtonsProps) {
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);
  const [sharingState, setSharingState] = useState<string | null>(null);

  const generateShareUrl = (platform: Platform): string => {
    const encodedCaption = encodeURIComponent(caption);
    const encodedUrl = encodeURIComponent(reportUrl);

    switch (platform.id) {
      case "whatsapp":
        return `https://wa.me/?text=${encodedCaption}%20${encodedUrl}`;

      case "twitter":
        return `https://twitter.com/intent/tweet?text=${encodedCaption}&url=${encodedUrl}`;

      case "facebook":
        return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedCaption}`;

      case "telegram":
        return `https://t.me/share/url?url=${encodedUrl}&text=${encodedCaption}`;

      default:
        return "#";
    }
  };

  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      return false;
    }
  };

  const handlePlatformClick = async (platform: Platform) => {
    if (disabled) return;

    setSharingState(platform.id);

    try {
      if (platform.action === "copy") {
        // Instagram: Copy caption to clipboard
        const success = await copyToClipboard(caption);
        if (success) {
          setCopiedPlatform(platform.id);
          setTimeout(() => setCopiedPlatform(null), 3000);
          onShareSuccess(platform.id);
        }
      } else {
        // Other platforms: Open sharing URL
        const shareUrl = generateShareUrl(platform);

        // Simulate brief delay for better UX
        setTimeout(() => {
          window.open(shareUrl, "_blank", "noopener,noreferrer");
          onShareSuccess(platform.id);
        }, 500);
      }
    } catch (error) {
      console.error(`Failed to share on ${platform.name}:`, error);
    } finally {
      setSharingState(null);
    }
  };

  const isLoading = (platformId: string) => sharingState === platformId;
  const isCopied = (platformId: string) => copiedPlatform === platformId;

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium text-neutral-900 mb-2">
          Pilih Platform Media Sosial
        </h4>
        <p className="text-xs text-neutral-600">
          Klik platform untuk membagikan laporan kerusakan jalan
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {platforms.map((platform) => (
          <Button
            key={platform.id}
            variant="outline"
            onClick={() => handlePlatformClick(platform)}
            disabled={disabled || isLoading(platform.id)}
            className={`
              relative flex flex-col items-center gap-2 h-auto py-4 px-3 
              border border-neutral-200 bg-white transition-all duration-200
              ${platform.hoverBg} ${platform.hoverBorder} hover:shadow-md hover:-translate-y-0.5
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {/* Platform Icon */}
            <div className="text-2xl">{platform.icon}</div>

            {/* Platform Name */}
            <span className={`text-sm font-medium ${platform.color}`}>
              {platform.name}
            </span>

            {/* Action Indicator */}
            <div className="flex items-center gap-1 text-xs text-neutral-500">
              {platform.action === "copy" ? (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Salin caption</span>
                </>
              ) : (
                <>
                  <ExternalLink className="h-3 w-3" />
                  <span>Buka aplikasi</span>
                </>
              )}
            </div>

            {/* Loading/Success State Overlay */}
            {(isLoading(platform.id) || isCopied(platform.id)) && (
              <div className="absolute inset-0 bg-white/90 rounded-lg flex items-center justify-center">
                {isLoading(platform.id) && (
                  <div className="flex flex-col items-center gap-1">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-neutral-300 border-t-neutral-600"></div>
                    <span className="text-xs text-neutral-600">Memuat...</span>
                  </div>
                )}

                {isCopied(platform.id) && (
                  <div className="flex flex-col items-center gap-1">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-xs text-green-600 font-medium">
                      Tersalin!
                    </span>
                  </div>
                )}
              </div>
            )}
          </Button>
        ))}
      </div>

      {/* Platform-specific Instructions */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3">
        <p className="text-xs text-neutral-600 mb-2">
          <strong>Catatan:</strong>
        </p>
        <ul className="text-xs text-neutral-600 space-y-1 list-disc list-inside">
          <li>
            <strong>WhatsApp/Telegram:</strong> Aplikasi akan terbuka dengan
            caption siap kirim
          </li>
          <li>
            <strong>Twitter/Facebook:</strong> Halaman sharing akan terbuka di
            browser
          </li>
          <li>
            <strong>Instagram:</strong> Caption akan disalin, buka Instagram dan
            paste manual
          </li>
        </ul>
      </div>
    </div>
  );
}
