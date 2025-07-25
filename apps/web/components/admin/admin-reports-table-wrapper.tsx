"use client";

import { useState } from "react";
import { AdminReportsTable } from "./admin-reports-table";
import { RejectionReasonModal } from "./rejection-reason-modal";
import { 
  useAdminReportsQuery, 
  useVerifyReport, 
  useRejectReport, 
  useDeleteReport 
} from "../../hooks/admin";
import { toast } from "sonner";

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
  // Remove data and isLoading props since we're using real data
}

export function AdminReportsTableWrapper({}: AdminReportsTableWrapperProps) {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: "",
    category: "",
    search: "",
  });

  const [rejectionModal, setRejectionModal] = useState<{
    isOpen: boolean;
    reportId: string;
    reportTitle: string;
  }>({
    isOpen: false,
    reportId: "",
    reportTitle: "",
  });

  // Data fetching
  const { data, isLoading, error } = useAdminReportsQuery(filters);

  // Admin actions
  const verifyReport = useVerifyReport();
  const rejectReport = useRejectReport();
  const deleteReport = useDeleteReport();

  // Transform API data to match the expected interface
  const transformedData: AdminReport[] = data?.items?.map((item) => ({
    id: item.id,
    category: item.category as "berlubang" | "retak" | "lainnya",
    streetName: item.street_name,
    locationText: item.location_text,
    userName: item.user?.name || "Unknown User",
    submittedAt: item.created_at,
    imageUrl: item.image_url,
    status: item.status as "pending" | "verified" | "rejected",
  })) || [];

  // Client-side handlers for table actions
  const handleVerify = async (id: string) => {
    try {
      await verifyReport.mutateAsync(id);
      toast.success("Laporan berhasil diverifikasi!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal memverifikasi laporan");
    }
  };

  const handleReject = (id: string) => {
    const report = transformedData.find(r => r.id === id);
    setRejectionModal({
      isOpen: true,
      reportId: id,
      reportTitle: report?.streetName || "laporan ini",
    });
  };

  const handleRejectConfirm = async (reason: string) => {
    try {
      await rejectReport.mutateAsync({
        reportId: rejectionModal.reportId,
        reason,
      });
      toast.success("Laporan berhasil ditolak");
      setRejectionModal({ isOpen: false, reportId: "", reportTitle: "" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menolak laporan");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteReport.mutateAsync(id);
      toast.success("Laporan berhasil dihapus");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menghapus laporan");
    }
  };

  // Handle error state
  if (error) {
    return (
      <div className="space-y-4">
        <div className="border border-red-200 rounded-lg bg-red-50 p-4">
          <div className="text-red-800 font-medium mb-2">
            Error loading reports
          </div>
          <div className="text-red-600 text-sm">
            {error instanceof Error ? error.message : "Failed to load reports"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <AdminReportsTable 
        data={transformedData}
        isLoading={isLoading}
        onVerify={handleVerify}
        onReject={handleReject}
        onDelete={handleDelete}
      />
      
      <RejectionReasonModal
        isOpen={rejectionModal.isOpen}
        onClose={() => setRejectionModal({ isOpen: false, reportId: "", reportTitle: "" })}
        onConfirm={handleRejectConfirm}
        isLoading={rejectReport.isPending}
        reportTitle={rejectionModal.reportTitle}
      />
    </>
  );
} 