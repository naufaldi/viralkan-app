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
        className="relative group bg-white/95 backdrop-blur-md border border-white/20 text-neutral-700 shadow-lg hover:bg-white hover:scale-105 hover:shadow-xl transition-all duration-300 ease-out rounded-full w-12 h-12"
      >
        <Share2 className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />

        {/* Share Count Badge */}
        {shareCount > 0 && (
          <div className="absolute -top-2 -right-2 bg-neutral-800 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] h-6 flex items-center justify-center shadow-md">
            {formatShareCount(shareCount)}
          </div>
        )}

        {/* Glass morphism glow effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-white/10 to-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </Button>

      {/* Tooltip */}
      <div className="absolute top-14 right-0 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        Bagikan laporan
      </div>
    </div>
  );
}
