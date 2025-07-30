"use client";

import { useState } from "react";
import { ShareCount } from "./share-count";

interface ReportDetailClientProps {
  report: {
    id: string;
    share_count?: number;
  };
}

export function ReportDetailClient({ report }: ReportDetailClientProps) {
  const [shareCount, setShareCount] = useState(report.share_count || 0);

  const handleShareSuccess = (platform: string, newCount: number) => {
    console.log(`Shared on ${platform}, new count: ${newCount}`);
    setShareCount(newCount);

    // Update the share count in the DOM
    const shareCountElement = document.querySelector("[data-share-count]");
    if (shareCountElement) {
      // Force a re-render of the ShareCount component
      const event = new CustomEvent("shareCountUpdated", {
        detail: { newCount },
      });
      document.dispatchEvent(event);
    }
  };

  return (
    <div style={{ display: "none" }}>
      {/* This component is hidden but handles share count updates */}
      <ShareCount reportId={report.id} initialCount={shareCount} />
    </div>
  );
}
