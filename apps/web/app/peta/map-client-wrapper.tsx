"use client";

import dynamic from "next/dynamic";
import type { MapReport } from "../../lib/maps/constants";
import type { MapUrlState } from "../../lib/maps/url-state";
import PetaLoading from "./loading";

const ReportsMap = dynamic(() => import("../../components/maps/reports-map"), {
  ssr: false,
  loading: () => <PetaLoading />,
});

interface MapClientWrapperProps {
  reports: MapReport[];
  initialState?: MapUrlState;
}

/**
 * Client-side wrapper that dynamically loads ReportsMap with SSR disabled.
 * Receives pre-fetched reports and optional initial map state from the server component.
 */
export const MapClientWrapper = ({
  reports,
  initialState,
}: MapClientWrapperProps) => {
  return <ReportsMap reports={reports} initialState={initialState} />;
};
