"use client";

import dynamic from "next/dynamic";
import type { MapReport } from "../../lib/maps/constants";
import PetaLoading from "./loading";

const ReportsMap = dynamic(() => import("../../components/maps/reports-map"), {
  ssr: false,
  loading: () => <PetaLoading />,
});

interface MapClientWrapperProps {
  reports: MapReport[];
}

/**
 * Client-side wrapper that dynamically loads ReportsMap with SSR disabled.
 * Receives pre-fetched reports from the server component and passes them to the map.
 */
export const MapClientWrapper = ({ reports }: MapClientWrapperProps) => {
  return <ReportsMap reports={reports} />;
};
