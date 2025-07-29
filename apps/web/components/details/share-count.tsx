"use client";

import { useEffect, useState } from "react";
import { Share2 } from "lucide-react";
import { useReportSharing } from "@/hooks/sharing";

interface ShareCountProps {
  reportId: string;
  initialCount?: number;
  className?: string;
}

export function ShareCount({ 
  reportId, 
  initialCount = 0,
  className = "" 
}: ShareCountProps) {
  const [count, setCount] = useState(initialCount);
  
  // Use the report sharing hook to get real-time data
  const { shareDetails, isLoading, error } = useReportSharing({
    reportId,
    enabled: true,
  });

  // Update count when share details are loaded
  useEffect(() => {
    if (shareDetails) {
      setCount(shareDetails.shareCount);
    }
  }, [shareDetails]);

  // Listen for share count updates from other components
  useEffect(() => {
    const handleShareCountUpdate = (event: CustomEvent) => {
      if (event.detail?.newCount !== undefined) {
        setCount(event.detail.newCount);
      }
    };

    document.addEventListener('shareCountUpdated', handleShareCountUpdate as EventListener);
    
    return () => {
      document.removeEventListener('shareCountUpdated', handleShareCountUpdate as EventListener);
    };
  }, []);

  if (error) {
    console.error("Error loading share count:", error);
  }

  return (
    <div className={`flex items-center gap-2 text-sm text-neutral-600 ${className}`}>
      <Share2 className="h-4 w-4" />
      <span className="font-medium">
        {isLoading ? "..." : count.toLocaleString()}
      </span>
      <span>dibagikan</span>
    </div>
  );
}
