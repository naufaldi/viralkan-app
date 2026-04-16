"use client";

import dynamic from "next/dynamic";
import type { DashboardMapReport } from "../../lib/maps/constants";

const DashboardMap = dynamic(() => import("./dashboard-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[400px] items-center justify-center rounded-lg bg-neutral-100">
      <div className="text-center">
        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-neutral-900" />
        <p className="text-sm text-neutral-500">Memuat peta...</p>
      </div>
    </div>
  ),
});

interface DashboardMapWrapperProps {
  reports: DashboardMapReport[];
}

/**
 * Client-side wrapper that dynamically imports DashboardMap with SSR disabled.
 * Shows a loading spinner while Leaflet is being loaded.
 */
export const DashboardMapWrapper = ({ reports }: DashboardMapWrapperProps) => {
  return <DashboardMap reports={reports} />;
};
