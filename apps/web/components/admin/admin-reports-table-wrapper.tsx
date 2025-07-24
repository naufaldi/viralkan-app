"use client";

import { AdminReportsTable } from "./admin-reports-table";

interface AdminReport {
  id: string;
  category: "berlubang" | "retak" | "lainnya";
  streetName: string;
  locationText: string;
  userName: string;
  submittedAt: string;
  imageUrl?: string;
  status: "pending" | "verified" | "rejected";
}

interface AdminReportsTableWrapperProps {
  data: AdminReport[];
  isLoading?: boolean;
}

export function AdminReportsTableWrapper({ 
  data, 
  isLoading = false 
}: AdminReportsTableWrapperProps) {
  // Client-side handlers for table actions
  const handleVerify = (id: string) => {
    console.log(`Verifying report: ${id}`);
    // TODO: Implement verification logic with API call
    // Example: await verifyReport(id);
  };

  const handleReject = (id: string) => {
    console.log(`Rejecting report: ${id}`);
    // TODO: Implement rejection logic with API call
    // Example: await rejectReport(id);
  };

  const handleDelete = (id: string) => {
    console.log(`Deleting report: ${id}`);
    // TODO: Implement delete logic with API call
    // Example: await deleteReport(id);
  };

  return (
    <AdminReportsTable 
      data={data}
      isLoading={isLoading}
      onVerify={handleVerify}
      onReject={handleReject}
      onDelete={handleDelete}
    />
  );
} 