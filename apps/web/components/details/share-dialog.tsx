"use client";

import { useState } from "react";
import { Button } from "@repo/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@repo/ui/components/ui/dialog";

import { Textarea } from "@repo/ui/components/ui/textarea";
import { Label } from "@repo/ui/components/ui/label";
import { Badge } from "@repo/ui/components/ui/badge";
import { Separator } from "@repo/ui/components/ui/separator";
import { 
  Copy, 
  ExternalLink, 
  Loader2, 
  Sparkles,
  MessageCircle,
  Twitter,
  Facebook,
  Instagram,
  Send,
  Share2,
  CheckCircle,
  X
} from "lucide-react";
import { toast } from "sonner";
import { useSharing } from "@/hooks/sharing";

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: string;
  onShareSuccess?: (platform: string, newCount: number) => void;
}

const PLATFORMS = [
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle, color: "text-green-600", supportsPrefill: true },
  { value: "twitter", label: "Twitter/X", icon: Twitter, color: "text-blue-500", supportsPrefill: true },
  { value: "facebook", label: "Facebook", icon: Facebook, color: "text-blue-600", supportsPrefill: false },
  { value: "instagram", label: "Instagram", icon: Instagram, color: "text-pink-600", supportsPrefill: false },
  { value: "telegram", label: "Telegram", icon: Send, color: "text-blue-400", supportsPrefill: true },
] as const;

type Platform = typeof PLATFORMS[number]["value"];

const TONES = [
  { value: "formal", label: "Formal", description: "Bahasa resmi untuk pemerintah" },
  { value: "urgent", label: "Urgent", description: "Mendesak untuk perbaikan cepat" },
  { value: "community", label: "Community", description: "Ramah untuk komunitas" },
  { value: "informative", label: "Informative", description: "Informatif dengan data" },
] as const;

type Tone = typeof TONES[number]["value"];

export function ShareDialog({
  isOpen,
  onClose,
  reportId,
  onShareSuccess,
}: ShareDialogProps) {
  const [platform, setPlatform] = useState<Platform>("whatsapp");
  const [tone, setTone] = useState<Tone>("community");
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [characterCount, setCharacterCount] = useState(0);
  const [step, setStep] = useState<"setup" | "preview" | "sharing">("setup");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isGenerating, generateCaption, trackShare, shareToPlatform } = useSharing({
    onShareSuccess,
    onError: (error) => {
      console.error("Sharing error:", error);
      toast.error("Gagal membagikan laporan. Silakan coba lagi.");
    },
  });

  const handleGenerateCaption = async () => {
    const result = await generateCaption(reportId, platform, tone);
    
    if (result) {
      setCaption(result.caption);
      setHashtags(result.hashtags);
      setCharacterCount(result.characterCount);
      setStep("preview");
    }
  };

  const handleShare = async () => {
    const selectedPlatform = PLATFORMS.find(p => p.value === platform);
    if (!selectedPlatform) return;

    setIsSubmitting(true);
    setStep("sharing");

    // Track the share in the background
    trackShare(reportId, platform);
    
    // Attempt to open the share window
    const success = await shareToPlatform(platform, caption, hashtags, reportId);

    if (!success) {
      toast.error(`Gagal membuka ${selectedPlatform.label}. Silakan salin caption dan link secara manual.`);
    }
    
    // Keep the modal open in the 'sharing' state for manual copy
    setIsSubmitting(false);
  };

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
  
  const handleClose = () => {
    setStep("setup");
    setCaption("");
    setHashtags([]);
    setCharacterCount(0);
    setIsSubmitting(false);
    onClose();
  };

  const selectedPlatform = PLATFORMS.find(p => p.value === platform);
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/laporan/${reportId}` : '';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
        showCloseButton
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center">
              <Share2 className="h-5 w-5 text-neutral-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-neutral-900">
                {step === 'sharing' ? 'Bagikan & Salin' : 'Bagikan Laporan'}
              </DialogTitle>
              <DialogDescription className="text-neutral-600 mt-1">
                {step === 'sharing' 
                  ? 'Buka platform sosial media dan tempelkan caption yang sudah disalin.'
                  : 'Bagikan laporan kerusakan jalan ini ke media sosial untuk meningkatkan kesadaran.'}
              </DialogDescription>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-2 mt-6">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === "setup" ? "bg-neutral-800 text-white" : "bg-green-600 text-white"
            }`}>
              {step !== "setup" ? <CheckCircle className="h-5 w-5" /> : '1'}
            </div>
            <div className={`flex-1 h-1 rounded-full ${
              step !== "setup" ? "bg-neutral-800" : "bg-neutral-200"
            }`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === "preview" ? "bg-neutral-800 text-white" : step === "sharing" ? "bg-green-600 text-white" : "bg-neutral-200 text-neutral-600"
            }`}>
              {step === "sharing" ? <CheckCircle className="h-5 w-5" /> : '2'}
            </div>
            <div className={`flex-1 h-1 rounded-full ${
              step === "sharing" ? "bg-neutral-800" : "bg-neutral-200"
            }`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === "sharing" ? "bg-neutral-800 text-white" : "bg-neutral-200 text-neutral-600"
            }`}>
              3
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {step === "setup" && (
            <>
              {/* Platform Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-neutral-900">
                  Pilih Platform Media Sosial
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {PLATFORMS.map((p) => {
                    const Icon = p.icon;
                    return (
                      <Button
                        key={p.value}
                        variant={platform === p.value ? "default" : "outline"}
                        className={`h-auto py-4 px-3 flex flex-col items-center gap-2 transition-all duration-200 ${
                          platform === p.value 
                            ? "bg-neutral-800 text-white border-neutral-800" 
                            : "hover:bg-neutral-50 border-neutral-200"
                        }`}
                        onClick={() => setPlatform(p.value)}
                      >
                        <Icon className={`h-6 w-6 ${platform === p.value ? "text-white" : p.color}`} />
                        <span className="text-sm font-medium">{p.label}</span>
                        {!p.supportsPrefill && (
                          <span className="text-xs opacity-75">Copy-paste</span>
                        )}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Tone Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-neutral-900">
                  Pilih Nada Caption
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {TONES.map((t) => (
                    <Button
                      key={t.value}
                      variant={tone === t.value ? "default" : "outline"}
                      className={`h-auto py-4 px-4 flex flex-col items-start gap-1 text-left transition-all duration-200 ${
                        tone === t.value 
                          ? "bg-neutral-800 text-white border-neutral-800" 
                          : "hover:bg-neutral-50 border-neutral-200"
                      }`}
                      onClick={() => setTone(t.value)}
                    >
                      <span className="font-medium">{t.label}</span>
                      <span className={`text-xs ${tone === t.value ? "text-neutral-200" : "text-neutral-500"}`}>
                        {t.description}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerateCaption}
                disabled={isGenerating}
                className="w-full bg-neutral-800 hover:bg-neutral-900 text-white py-3"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Menghasilkan Caption...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Generate Caption
                  </>
                )}
              </Button>
            </>
          )}

          {step === "preview" && caption && (
            <>
              {/* Caption Preview */}
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
                          <span className="text-xs bg-neutral-200 px-1 rounded">Copy-paste</span>
                        )}
                      </div>
                    )}
                    <div className="text-xs text-neutral-500">
                      {characterCount} karakter
                    </div>
                  </div>
                </div>
                
                <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                  <Textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Caption akan muncul di sini..."
                    className="min-h-[120px] border-0 bg-transparent resize-none focus:ring-0 text-neutral-700"
                  />
                </div>
                
                {/* Hashtags */}
                {hashtags.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-neutral-900">Hashtags</Label>
                    <div className="flex flex-wrap gap-2">
                      {hashtags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="bg-neutral-200 text-neutral-700">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Link Preview */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-neutral-900">Link yang akan dibagikan</Label>
                  <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-neutral-600 flex-1">
                        <ExternalLink className="h-4 w-4 flex-shrink-0" />
                        <span className="break-all">
                          {shareUrl}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyToClipboard(shareUrl, 'link')}
                        className="ml-2 h-8 px-2 text-xs"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Salin
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Primary Action Button */}
              <div className="pt-4">
                <Button
                  onClick={handleShare}
                  disabled={!caption || isSubmitting}
                  className="w-full bg-neutral-800 hover:bg-neutral-900 text-white py-3"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Membagikan...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="h-5 w-5 mr-2" />
                      {selectedPlatform?.supportsPrefill ? "Bagikan Sekarang" : "Siapkan untuk Copy-paste"}
                    </>
                  )}
                </Button>
              </div>
            </>
          )}

          {step === "sharing" && (
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
              
              {/* Custom close button for sharing step */}
              <div className="absolute top-4 right-4">
                <DialogClose asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClose}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </Button>
                </DialogClose>
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
                  onClick={() => setStep("preview")}
                  className="flex-1"
                >
                  Kembali & Edit
                </Button>
                <Button
                  onClick={handleClose}
                  className="flex-1 bg-neutral-800 hover:bg-neutral-900 text-white"
                >
                  Selesai
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

