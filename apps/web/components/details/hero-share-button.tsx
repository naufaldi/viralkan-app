"use client";

import { Share2 } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";

interface HeroShareButtonProps {
  onClick: () => void;
  shareCount: number;
  disabled?: boolean;
}

export function HeroShareButton({
  onClick,
  shareCount,
  disabled = false,
}: HeroShareButtonProps) {
  const formatShareCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div className="absolute top-4 right-4 z-10">
      <Button
        onClick={onClick}
        disabled={disabled}
        size="icon"
        className="group relative h-12 w-12 rounded-full border border-white/20 bg-white/95 text-neutral-700 shadow-lg backdrop-blur-md transition-all duration-300 ease-out hover:scale-105 hover:bg-white hover:shadow-xl"
      >
        <Share2 className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />

        {/* Share Count Badge */}
        {shareCount > 0 && (
          <div className="absolute -top-2 -right-2 flex h-6 min-w-[20px] items-center justify-center rounded-full bg-neutral-800 px-2 py-1 text-xs font-bold text-white shadow-md">
            {formatShareCount(shareCount)}
          </div>
        )}

        {/* Glass morphism glow effect */}
        <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-t from-white/10 to-white/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </Button>

      {/* Tooltip */}
      <div className="pointer-events-none absolute top-14 right-0 rounded bg-black/80 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        Bagikan laporan
      </div>
    </div>
  );
}
