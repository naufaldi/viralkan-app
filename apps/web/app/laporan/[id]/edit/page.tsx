"use client";

import { useEffect, useState, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/AuthContext";
import CreateReportForm from "@/components/reports/create-report-form";
import { ReportResponse } from "@/lib/types/api";
import { Loader2 } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function EditReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { backendUser, apiCall, isLoading: isAuthLoading } = useAuthContext();
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiCallRef = useRef(apiCall);
  const routerRef = useRef(router);

  useEffect(() => {
    apiCallRef.current = apiCall;
    routerRef.current = router;
  }, [apiCall, router]);

  useEffect(() => {
    const fetchReport = async () => {
      if (!backendUser) return;

      try {
        setIsLoading(true);
        const response = await apiCallRef.current(`/api/reports/${id}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Laporan tidak ditemukan");
          }
          if (response.status === 403) {
            throw new Error(
              "Anda tidak memiliki akses untuk mengedit laporan ini",
            );
          }
          throw new Error("Gagal memuat laporan");
        }

        const data = await response.json();
        setReport(data);
      } catch (err) {
        console.error("Error fetching report:", err);
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        setIsLoading(false);
      }
    };

    if (!isAuthLoading) {
      if (!backendUser) {
        routerRef.current.push("/login");
      } else {
        fetchReport();
      }
    }
  }, [id, backendUser, isAuthLoading]);

  if (isAuthLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <h2 className="mb-2 text-lg font-semibold text-red-800">
            Gagal Memuat Laporan
          </h2>
          <p className="text-red-600">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          className="pl-0 hover:bg-transparent hover:text-neutral-900"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Detail Laporan
        </Button>
      </div>

      {report && (
        <CreateReportForm
          initialData={report}
          isEditing={true}
          onSuccess={(id: string) =>
            router.push(`/laporan/${id}?success=updated`)
          }
        />
      )}
    </div>
  );
}
