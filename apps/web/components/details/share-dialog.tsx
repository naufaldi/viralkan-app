"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { Separator } from "@repo/ui/components/ui/separator";
import { ToneSelector, ToneType } from "./tone-selector";
import { CaptionGenerator } from "./caption-generator";
import { PlatformButtons } from "./platform-buttons";
import { LocationHierarchy } from "./location-hierarchy";

interface ReportData {
  id: string;
  street_name: string;
  district: string;
  city: string;
  province: string;
  category: string;
  created_at: string;
}

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  report: ReportData;
  onShareSuccess: () => void;
}

export function ShareDialog({
  isOpen,
  onClose,
  report,
  onShareSuccess,
}: ShareDialogProps) {
  const [selectedTone, setSelectedTone] = useState<ToneType>("formal");
  const [caption, setCaption] = useState("");
  const [shareCount, setShareCount] = useState(0);

  // Mock report URL - in real implementation, this would be the actual URL
  const reportUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/laporan/${report.id}`;

  const handleShareSuccess = (platform: string) => {
    // Mock increment share count
    setShareCount((prev) => prev + 1);

    // Call parent success handler
    onShareSuccess();

    // Mock success feedback
    console.log(`Successfully shared on ${platform}`);
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-semibold text-neutral-900">
            Bagikan Laporan Kerusakan Jalan
          </DialogTitle>
          <DialogDescription className="text-neutral-600">
            Bantu viralkan laporan ini di media sosial untuk mempercepat
            perbaikan infrastruktur jalan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Location Summary */}
          <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
            <LocationHierarchy
              province={report.province}
              city={report.city}
              district={report.district}
              streetName={report.street_name}
            />
          </div>

          <Separator className="bg-neutral-200" />

          {/* Tone Selection */}
          <ToneSelector value={selectedTone} onChange={setSelectedTone} />

          <Separator className="bg-neutral-200" />

          {/* Caption Generation */}
          <CaptionGenerator
            tone={selectedTone}
            reportData={{
              streetName: report.street_name,
              district: report.district,
              city: report.city,
              province: report.province,
              category: report.category,
              createdAt: report.created_at,
            }}
            value={caption}
            onChange={setCaption}
            platform="twitter" // Default platform
          />

          <Separator className="bg-neutral-200" />

          {/* Social Media Platforms */}
          <PlatformButtons
            caption={caption}
            reportUrl={reportUrl}
            onShareSuccess={handleShareSuccess}
          />

          {/* Mock Share Statistics */}
          {shareCount > 0 && (
            <>
              <Separator className="bg-neutral-200" />
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800 font-medium">
                  🎉 Berhasil dibagikan {shareCount} kali dalam sesi ini!
                </p>
                <p className="text-xs text-green-700 mt-1">
                  Terima kasih telah membantu menyebarkan laporan ini
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
