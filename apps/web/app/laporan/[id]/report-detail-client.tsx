"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { HeroShareButton, ShareDialog } from "@/components/details";

interface ReportData {
  id: string;
  street_name: string;
  district: string;
  city: string;
  province: string;
  category: string;
  created_at: string;
  lat?: number;
  lon?: number;
}

interface ReportDetailClientProps {
  report: ReportData;
}

export function ReportDetailClient({ report }: ReportDetailClientProps) {
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareCount, setShareCount] = useState(0); // Mock share count
  const [heroContainer, setHeroContainer] = useState<Element | null>(null);

  const handleShareSuccess = () => {
    setShareCount((prev) => prev + 1);
    // In real implementation, this would call an API to increment share count
    console.log("Share count incremented:", shareCount + 1);
  };

  useEffect(() => {
    // Find the hero image container to portal the share button
    const heroElement = document.querySelector(".relative.w-full.h-96");
    if (heroElement) {
      setHeroContainer(heroElement);
    }

    // Update share count in sidebar if it exists
    const shareCountElement = document.querySelector("[data-share-count]");
    if (shareCountElement) {
      shareCountElement.textContent =
        shareCount > 0
          ? `${shareCount} kali dibagikan`
          : "Belum ada yang membagikan";
    }
  }, [shareCount]);

  return (
    <>
      {/* Portal Share Button to Hero Image */}
      {heroContainer &&
        createPortal(
          <HeroShareButton
            onClick={() => setIsShareDialogOpen(true)}
            shareCount={shareCount}
          />,
          heroContainer,
        )}

      {/* Share Dialog */}
      <ShareDialog
        isOpen={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
        report={report}
        onShareSuccess={handleShareSuccess}
      />
    </>
  );
}
