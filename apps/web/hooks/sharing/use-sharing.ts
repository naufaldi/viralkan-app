import { useState } from 'react';
import { sharingApi, type AICaptionResponse } from '@/services/api-client';
import { toast } from 'sonner';

interface UseSharingOptions {
  onShareSuccess?: (platform: string, newCount: number) => void;
  onError?: (error: string) => void;
}

interface UseSharingReturn {
  // State
  isGenerating: boolean;
  isSharing: boolean;
  
  // Actions
  generateAICaption: (reportId: string, platform: string, tone: string, usePaidModel?: boolean) => Promise<AICaptionResponse | null>;
  
  trackShare: (reportId: string, platform: string) => Promise<number | null>;
  
  // Utilities
  shareToPlatform: (
    platform: string,
    caption: string,
    hashtags: string[],
    reportId: string
  ) => Promise<boolean>;
}

// Platform configuration
const PLATFORM_CONFIG = {
  whatsapp: { supportsPrefill: true },
  twitter: { supportsPrefill: true },
  facebook: { supportsPrefill: false },
  threads: { supportsPrefill: false },
  telegram: { supportsPrefill: true },
} as const;

export function useSharing(options: UseSharingOptions = {}): UseSharingReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // DEPRECATED: generateCaption is removed - always use generateAICaption

  const generateAICaption = async (
    reportId: string,
    platform: string,
    tone: string,
    usePaidModel?: boolean
  ) => {
    setIsGenerating(true);
    try {
      const response = await sharingApi.generateAICaption(reportId, {
        platform: platform as any,
        tone: tone as any,
        usePaidModel,
      });
      
      const modelName = response.modelUsed === 'template-fallback' ? 'Template' : 'AI';
      toast.success(`${modelName} caption berhasil dibuat!`);
      return response;
    } catch (error) {
      console.error("Error generating AI caption:", error);
      const errorMessage = "Gagal menghasilkan AI caption. Silakan coba lagi.";
      toast.error(errorMessage);
      options.onError?.(errorMessage);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const trackShare = async (reportId: string, platform: string) => {
    try {
      const response = await sharingApi.trackShare(reportId, {
        platform: platform as any,
      });
      
      options.onShareSuccess?.(platform, response.newShareCount);
      return response.newShareCount;
    } catch (error) {
      console.error("Error tracking share:", error);
      const errorMessage = "Gagal melacak pembagian. Silakan coba lagi.";
      toast.error(errorMessage);
      options.onError?.(errorMessage);
      return null;
    }
  };

  const shareToPlatform = async (
    platform: string,
    caption: string,
    hashtags: string[],
    reportId: string
  ) => {
    // Check if platform supports pre-filling
    const platformConfig = PLATFORM_CONFIG[platform as keyof typeof PLATFORM_CONFIG];
    if (!platformConfig?.supportsPrefill) {
      // For platforms that don't support pre-filling, just return success
      // The UI will handle the copy-paste flow
      return true;
    }

    setIsSharing(true);
    try {
      const shareUrl = `${window.location.origin}/laporan/${reportId}`;
      const fullText = `${caption}\n\n${hashtags.join(" ")}\n\n${shareUrl}`;
      const encodedText = encodeURIComponent(fullText);
      
      let shareUrlPlatform = "";

      switch (platform) {
        case "whatsapp":
          shareUrlPlatform = `https://wa.me/?text=${encodedText}`;
          break;
        case "twitter":
          shareUrlPlatform = `https://twitter.com/intent/tweet?text=${encodedText}`;
          break;
        case "telegram":
          shareUrlPlatform = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(caption + "\n\n" + hashtags.join(" "))}`;
          break;
        default:
          return false;
      }

      if (shareUrlPlatform) {
        window.open(shareUrlPlatform, "_blank", "width=600,height=400");
        const platformNames = {
          whatsapp: "WhatsApp",
          twitter: "Twitter/X",
          facebook: "Facebook",
          threads: "Threads",
          telegram: "Telegram",
        };
        toast.success(`Berhasil membagikan caption dan link ke ${platformNames[platform as keyof typeof platformNames]}!`);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error sharing to platform:", error);
      const errorMessage = "Gagal membagikan laporan. Silakan coba lagi.";
      toast.error(errorMessage);
      options.onError?.(errorMessage);
      return false;
    } finally {
      setIsSharing(false);
    }
  };

  return {
    isGenerating,
    isSharing,
    generateAICaption,
    trackShare,
    shareToPlatform,
  };
} 