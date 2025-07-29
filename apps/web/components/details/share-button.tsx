"use client";

import { useState, useEffect } from "react";
import { Button } from "@repo/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import {
  Share2,
  MessageCircle,
  Twitter,
  Facebook,
  AtSign,
  Send,
  Loader2,
} from "lucide-react";
import { ShareDialog } from "./share-dialog";
import { useSharing } from "@/hooks/sharing";
import { useReportSharing } from "@/hooks/sharing";

interface ShareButtonProps {
  reportId: string;
  report: {
    street_name: string;
    district: string;
    city: string;
    province: string;
    category: string;
  };
  className?: string;
  size?: "sm" | "md" | "lg";
  useDialog?: boolean;
  onShareSuccess?: (platform: string, newCount: number) => void;
  showShareCount?: boolean;
}

const PLATFORMS = [
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle, color: "text-green-600" },
  { value: "twitter", label: "Twitter/X", icon: Twitter, color: "text-blue-500" },
  { value: "facebook", label: "Facebook", icon: Facebook, color: "text-blue-600" },
  { value: "threads", label: "Threads", icon: AtSign, color: "text-purple-600" },
  { value: "telegram", label: "Telegram", icon: Send, color: "text-blue-400" },
] as const;

const SIZE_CLASSES = {
  sm: "w-8 h-8",
  md: "w-10 h-10", 
  lg: "w-12 h-12",
};

const ICON_SIZES = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

const BADGE_SIZES = {
  sm: "text-xs px-1.5 py-0.5 -top-1 -right-1 min-w-[16px] h-4",
  md: "text-xs px-2 py-1 -top-1.5 -right-1.5 min-w-[20px] h-5",
  lg: "text-sm px-2.5 py-1.5 -top-2 -right-2 min-w-[24px] h-6",
};

export function ShareButton({
  reportId,
  report,
  className = "",
  size = "md",
  useDialog = false,
  onShareSuccess,
  showShareCount = true,
}: ShareButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareCount, setShareCount] = useState(0);

  // Use the sharing hook
  const { shareToPlatform } = useSharing({
    onShareSuccess,
    onError: (error) => {
      console.error("Sharing error:", error);
    },
  });

  // Use the report sharing hook to get share count
  const { shareDetails, isLoading } = useReportSharing({
    reportId,
    enabled: showShareCount,
  });

  // Update share count when data is loaded
  useEffect(() => {
    if (shareDetails) {
      setShareCount(shareDetails.shareCount);
    }
  }, [shareDetails]);

  // Listen for share count updates from other components
  useEffect(() => {
    if (!showShareCount) return;

    const handleShareCountUpdate = (event: CustomEvent) => {
      if (event.detail?.newCount !== undefined) {
        setShareCount(event.detail.newCount);
      }
    };

    document.addEventListener('shareCountUpdated', handleShareCountUpdate as EventListener);
    
    return () => {
      document.removeEventListener('shareCountUpdated', handleShareCountUpdate as EventListener);
    };
  }, [showShareCount]);

  const handleQuickShare = async (platform: string) => {
    setIsSharing(true);
    
    try {
      // Generate a simple caption for quick sharing
      const caption = `Laporan kerusakan jalan di ${report.street_name}, ${report.district}, ${report.city}, ${report.province}. Kategori: ${report.category}`;
      const hashtags = ["#JALANBERLUBANG", "#ROADSAFETY", "#VIRALKANJALAN"];
      
      const success = await shareToPlatform(platform, caption, hashtags, reportId);
      
      if (success) {
        // Success is handled by the hook
      }
    } catch (error) {
      console.error("Quick share error:", error);
    } finally {
      setIsSharing(false);
    }
  };

  const handleShareSuccess = (platform: string, newCount: number) => {
    onShareSuccess?.(platform, newCount);
  };

  const formatShareCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const renderButton = (children: React.ReactNode, onClick?: () => void) => (
    <div className="relative group">
      <Button
        onClick={onClick}
        className={`${SIZE_CLASSES[size]} ${className} bg-white/95 backdrop-blur-md border border-white/20 text-neutral-700 shadow-lg hover:bg-white hover:scale-105 hover:shadow-xl transition-all duration-300 ease-out rounded-full p-0`}
        disabled={isSharing}
      >
        {children}
      </Button>
      
      {/* Share Count Badge */}
      {showShareCount && shareCount > 0 && (
        <div className={`absolute ${BADGE_SIZES[size]} bg-neutral-800 text-white font-bold rounded-full flex items-center justify-center shadow-md border-2 border-white transition-all duration-300 ease-out group-hover:scale-110 group-hover:shadow-lg group-hover:bg-neutral-900`}>
          {isLoading ? "..." : formatShareCount(shareCount)}
        </div>
      )}
    </div>
  );

  if (useDialog) {
    return (
      <>
        {renderButton(
          isSharing ? (
            <Loader2 className={`${ICON_SIZES[size]} animate-spin`} />
          ) : (
            <Share2 className={ICON_SIZES[size]} />
          ),
          () => setIsDialogOpen(true)
        )}

        <ShareDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          reportId={reportId}
          onShareSuccess={handleShareSuccess}
        />
      </>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {renderButton(
          isSharing ? (
            <Loader2 className={`${ICON_SIZES[size]} animate-spin`} />
          ) : (
            <Share2 className={ICON_SIZES[size]} />
          )
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {PLATFORMS.map((platform) => {
          const Icon = platform.icon;
          return (
            <DropdownMenuItem
              key={platform.value}
              onClick={() => handleQuickShare(platform.value)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Icon className={`h-4 w-4 ${platform.color}`} />
              <span>{platform.label}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
