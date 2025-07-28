"use client";

import { Share2 } from "lucide-react";
import { Separator } from "@repo/ui/components/ui/separator";

interface ShareCountProps {
  count: number;
  className?: string;
}

export function ShareCount({ count, className = "" }: ShareCountProps) {
  const formatShareCount = (shareCount: number): string => {
    if (shareCount >= 1000000) {
      return `${(shareCount / 1000000).toFixed(1)}M`;
    } else if (shareCount >= 1000) {
      return `${(shareCount / 1000).toFixed(1)}K`;
    }
    return shareCount.toString();
  };

  const getShareText = (shareCount: number): string => {
    if (shareCount === 0) return "Belum ada yang membagikan";
    if (shareCount === 1) return "1 kali dibagikan";
    return `${formatShareCount(shareCount)} kali dibagikan`;
  };

  return (
    <>
      <Separator className="bg-neutral-200" />
      <div className={`flex items-center gap-3 ${className}`}>
        <Share2 className="h-4 w-4 text-neutral-500 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-neutral-900">Dibagikan</p>
          <p className="text-sm text-neutral-600">{getShareText(count)}</p>

          {/* Additional context for zero shares */}
          {count === 0 && (
            <p className="text-xs text-neutral-500 mt-1">
              Jadilah yang pertama membagikan
            </p>
          )}
        </div>
      </div>
    </>
  );
}
