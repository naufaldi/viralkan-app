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
import { Separator } from "@repo/ui/components/ui/separator";
import { Badge } from "@repo/ui/components/ui/badge";
import { Loader2, Share2, CheckCircle, X, Brain } from "lucide-react";
import { toast } from "sonner";
import { useSharing } from "@/hooks/sharing";
import {
  PlatformSelector,
  type Platform,
  ToneSelector,
  type Tone,
  SharingPreview,
  SharingActions,
} from "./index";

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: string;
  onShareSuccess?: (platform: string, newCount: number) => void;
}

type Step = "setup" | "preview" | "sharing";

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
  const [aiGenerated, setAiGenerated] = useState(false);
  const [modelUsed, setModelUsed] = useState<string>("");
  const [step, setStep] = useState<Step>("setup");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isGenerating, generateAICaption, trackShare, shareToPlatform } =
    useSharing({
      onShareSuccess,
      onError: (error) => {
        console.error("Sharing error:", error);
        toast.error("Gagal membagikan laporan. Silakan coba lagi.");
      },
    });

  const handleGenerateCaption = async () => {
    const result = await generateAICaption(
      reportId,
      platform,
      tone as any,
      true,
    );

    if (result) {
      setCaption(result.caption);
      setHashtags(result.hashtags);
      setCharacterCount(result.characterCount);
      setAiGenerated(result.aiGenerated);
      setModelUsed(result.modelUsed);
      setStep("preview");
    }
  };

  const handleShare = async () => {
    setIsSubmitting(true);
    setStep("sharing");

    // Track the share in the background
    trackShare(reportId, platform);

    // Attempt to open the share window
    const success = await shareToPlatform(
      platform,
      caption,
      hashtags,
      reportId,
    );

    if (!success) {
      toast.error(
        `Gagal membuka platform. Silakan salin caption dan link secara manual.`,
      );
    }

    // Keep the modal open in the 'sharing' state for manual copy
    setIsSubmitting(false);
  };

  const handleClose = () => {
    setStep("setup");
    setCaption("");
    setHashtags([]);
    setCharacterCount(0);
    setAiGenerated(false);
    setModelUsed("");
    setIsSubmitting(false);
    onClose();
  };

  const handleBack = () => {
    setStep("preview");
  };

  const renderStepContent = () => {
    switch (step) {
      case "setup":
        return (
          <>
            <PlatformSelector
              selectedPlatform={platform}
              onPlatformChange={setPlatform}
            />
            <Separator />
            <ToneSelector selectedTone={tone} onToneChange={setTone} />

            <Button
              onClick={handleGenerateCaption}
              disabled={isGenerating}
              className="w-full bg-neutral-800 py-3 text-white hover:bg-neutral-900"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Menghasilkan AI Caption... (~5 detik)
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-5 w-5" />
                  Generate AI Caption
                </>
              )}
            </Button>
          </>
        );

      case "preview":
        return (
          <>
            {/* AI Generation Info */}
            {aiGenerated && (
              <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
                <Brain className="h-4 w-4 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">
                    AI-Generated Caption
                  </p>
                  <p className="text-xs text-blue-700">
                    Model:{" "}
                    {modelUsed === "template-fallback"
                      ? "Template (AI gagal)"
                      : modelUsed}
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  AI
                </Badge>
              </div>
            )}

            <SharingPreview
              caption={caption}
              hashtags={hashtags}
              characterCount={characterCount}
              reportId={reportId}
              platform={platform}
              onCaptionChange={setCaption}
            />
            <div className="pt-4">
              <Button
                onClick={handleShare}
                disabled={!caption || isSubmitting}
                className="w-full bg-neutral-800 py-3 text-white hover:bg-neutral-900"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Membagikan...
                  </>
                ) : (
                  <>
                    <Share2 className="mr-2 h-5 w-5" />
                    Bagikan Sekarang
                  </>
                )}
              </Button>
            </div>
          </>
        );

      case "sharing":
        return (
          <>
            <SharingActions
              isSubmitting={isSubmitting}
              caption={caption}
              hashtags={hashtags}
              reportId={reportId}
              platform={platform}
              onBack={handleBack}
              onClose={handleClose}
            />
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
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]"
        showCloseButton={step !== "sharing"}
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100">
              <Share2 className="h-5 w-5 text-neutral-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-neutral-900">
                {step === "sharing" ? "Bagikan & Salin" : "Bagikan Laporan"}
              </DialogTitle>
              <DialogDescription className="mt-1 text-neutral-600">
                {step === "sharing"
                  ? "Buka platform sosial media dan tempelkan caption yang sudah disalin."
                  : "Bagikan laporan kerusakan jalan ini ke media sosial dengan AI-powered caption generation."}
              </DialogDescription>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="mt-6 flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                step === "setup"
                  ? "bg-neutral-800 text-white"
                  : "bg-green-600 text-white"
              }`}
            >
              {step !== "setup" ? <CheckCircle className="h-5 w-5" /> : "1"}
            </div>
            <div
              className={`h-1 flex-1 rounded-full ${
                step !== "setup" ? "bg-neutral-800" : "bg-neutral-200"
              }`}
            />
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                step === "preview"
                  ? "bg-neutral-800 text-white"
                  : step === "sharing"
                    ? "bg-green-600 text-white"
                    : "bg-neutral-200 text-neutral-600"
              }`}
            >
              {step === "sharing" ? <CheckCircle className="h-5 w-5" /> : "2"}
            </div>
            <div
              className={`h-1 flex-1 rounded-full ${
                step === "sharing" ? "bg-neutral-800" : "bg-neutral-200"
              }`}
            />
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                step === "sharing"
                  ? "bg-neutral-800 text-white"
                  : "bg-neutral-200 text-neutral-600"
              }`}
            >
              3
            </div>
          </div>
        </DialogHeader>

        <div className="mt-6 space-y-6">{renderStepContent()}</div>
      </DialogContent>
    </Dialog>
  );
}
