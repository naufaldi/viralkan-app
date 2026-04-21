"use client";

import { useState } from "react";
import { Button } from "@repo/ui/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/ui/components/ui/alert-dialog";
import { CheckCircle, XCircle, Trash2, Loader2 } from "lucide-react";
import { RejectionReasonModal } from "./rejection-reason-modal";

interface BulkActionToolbarProps {
  selectedCount: number;
  isVerifying: boolean;
  isRejecting: boolean;
  isDeleting: boolean;
  onBulkVerify: () => void;
  onBulkReject: (reason: string) => void;
  onBulkDelete: () => void;
}

export function BulkActionToolbar({
  selectedCount,
  isVerifying,
  isRejecting,
  isDeleting,
  onBulkVerify,
  onBulkReject,
  onBulkDelete,
}: BulkActionToolbarProps) {
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  const isBusy = isVerifying || isRejecting || isDeleting;

  if (selectedCount === 0) return null;

  const handleVerifyConfirm = () => {
    setVerifyDialogOpen(false);
    onBulkVerify();
  };

  const handleDeleteConfirm = () => {
    setDeleteDialogOpen(false);
    onBulkDelete();
  };

  const handleRejectConfirm = (reason: string) => {
    setRejectModalOpen(false);
    onBulkReject(reason);
  };

  return (
    <>
      <div className="flex items-center gap-3 rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-3">
        <span className="text-sm font-medium text-neutral-700">
          {selectedCount} laporan dipilih
        </span>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setVerifyDialogOpen(true)}
            disabled={isBusy}
            className="border-neutral-300 text-neutral-700 hover:border-green-300 hover:bg-green-50 hover:text-green-700"
          >
            {isVerifying ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="mr-1 h-4 w-4" />
            )}
            Verifikasi ({selectedCount})
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRejectModalOpen(true)}
            disabled={isBusy}
            className="border-neutral-300 text-neutral-700 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
          >
            {isRejecting ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <XCircle className="mr-1 h-4 w-4" />
            )}
            Tolak ({selectedCount})
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
            disabled={isBusy}
            className="border-neutral-300 text-neutral-700 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
          >
            {isDeleting ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-1 h-4 w-4" />
            )}
            Hapus ({selectedCount})
          </Button>
        </div>
      </div>

      {/* Bulk Verify Confirmation */}
      <AlertDialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Verifikasi {selectedCount} Laporan
            </AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin memverifikasi {selectedCount} laporan yang
              dipilih? Semua laporan akan ditandai sebagai terverifikasi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="hover:border-neutral-400 hover:bg-neutral-50">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleVerifyConfirm}
              className="border-neutral-800 bg-neutral-800 text-white hover:bg-neutral-900"
            >
              Verifikasi Semua
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus {selectedCount} Laporan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus {selectedCount} laporan yang
              dipilih? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="hover:border-neutral-400 hover:bg-neutral-50">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="border-neutral-800 bg-neutral-800 text-white hover:bg-red-600"
            >
              Hapus Semua
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Reject Modal */}
      <RejectionReasonModal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        onConfirm={handleRejectConfirm}
        isLoading={isRejecting}
        reportTitle={`${selectedCount} laporan yang dipilih`}
      />
    </>
  );
}
