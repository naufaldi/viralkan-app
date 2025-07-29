"use client";

import { useState } from "react";
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
  Instagram,
  Send,
  Loader2,
} from "lucide-react";
import { ShareDialog } from "./share-dialog";
import { useSharing } from "@/hooks/sharing";

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
}

const PLATFORMS = [
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle, color: "text-green-600" },
  { value: "twitter", label: "Twitter/X", icon: Twitter, color: "text-blue-500" },
  { value: "facebook", label: "Facebook", icon: Facebook, color: "text-blue-600" },
  { value: "instagram", label: "Instagram", icon: Instagram, color: "text-pink-600" },
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

export function ShareButton({
  reportId,
  report,
  className = "",
  size = "md",
  useDialog = false,
  onShareSuccess,
}: ShareButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Use the sharing hook
  const { shareToPlatform } = useSharing({
    onShareSuccess,
    onError: (error) => {
      console.error("Sharing error:", error);
    },
  });

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

  if (useDialog) {
    return (
      <>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className={`${SIZE_CLASSES[size]} ${className} bg-white/95 backdrop-blur-md border border-white/20 text-neutral-700 shadow-lg hover:bg-white hover:scale-105 hover:shadow-xl transition-all duration-300 ease-out rounded-full p-0`}
          disabled={isSharing}
        >
          {isSharing ? (
            <Loader2 className={`${ICON_SIZES[size]} animate-spin`} />
          ) : (
            <Share2 className={ICON_SIZES[size]} />
          )}
        </Button>

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
        <Button
          className={`${SIZE_CLASSES[size]} ${className} bg-white/95 backdrop-blur-md border border-white/20 text-neutral-700 shadow-lg hover:bg-white hover:scale-105 hover:shadow-xl transition-all duration-300 ease-out rounded-full p-0`}
          disabled={isSharing}
        >
          {isSharing ? (
            <Loader2 className={`${ICON_SIZES[size]} animate-spin`} />
          ) : (
            <Share2 className={ICON_SIZES[size]} />
          )}
        </Button>
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
