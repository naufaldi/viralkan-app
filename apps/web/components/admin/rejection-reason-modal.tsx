"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { Button } from "@repo/ui/components/ui/button";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { Label } from "@repo/ui/components/ui/label";

interface RejectionReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isLoading?: boolean;
  reportTitle?: string;
}

export function RejectionReasonModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  reportTitle = "laporan ini",
}: RejectionReasonModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    const trimmedReason = reason.trim();

    if (!trimmedReason) {
      setError("Alasan penolakan harus diisi");
      return;
    }

    if (trimmedReason.length < 10) {
      setError("Alasan penolakan minimal 10 karakter");
      return;
    }

    if (trimmedReason.length > 500) {
      setError("Alasan penolakan maksimal 500 karakter");
      return;
    }

    onConfirm(trimmedReason);
    setReason("");
  };

  const handleClose = () => {
    setReason("");
    setError("");
    onClose();
  };

  const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReason(e.target.value);
    // Clear error when user starts typing
    if (error) {
      setError("");
    }
  };

  const isValid = reason.trim().length >= 10 && reason.trim().length <= 500;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Tolak Laporan</DialogTitle>
            <DialogDescription>
              Berikan alasan mengapa Anda menolak {reportTitle}. Alasan ini akan
              ditampilkan kepada pengguna yang melaporkan.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason">
                Alasan Penolakan <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="reason"
                placeholder="Contoh: Foto tidak jelas, lokasi tidak spesifik, atau kerusakan sudah diperbaiki..."
                value={reason}
                onChange={handleReasonChange}
                className={`min-h-[100px] ${error ? "border-red-300 focus:border-red-500" : ""}`}
                required
                disabled={isLoading}
                maxLength={500}
              />
              {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
              <div className="flex justify-between text-xs text-neutral-500">
                <span>Minimal 10 karakter</span>
                <span>{reason.length}/500</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="hover:border-neutral-400 hover:bg-neutral-50"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="outline"
              disabled={!isValid || isLoading}
              className="border-neutral-800 bg-neutral-800 text-white hover:bg-red-600 hover:text-white disabled:border-neutral-200 disabled:bg-neutral-200 disabled:text-neutral-400"
            >
              {isLoading ? "Memproses..." : "Tolak Laporan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
