"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "../../../contexts/AuthContext";
import CreateReportForm from "../../../components/reports/create-report-form";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";

export default function CreateReportPage() {
  const router = useRouter();
  const { backendUser, isLoading } = useAuthContext();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !backendUser) {
      router.push("/login?redirect=/laporan/buat");
    }
  }, [backendUser, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-600" />
            <h2 className="text-lg font-semibold text-neutral-900 mb-2">
              Memuat...
            </h2>
            <p className="text-neutral-600">Memeriksa status autentikasi</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error if not authenticated
  if (!backendUser) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Anda harus login terlebih dahulu untuk membuat laporan.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Buat Laporan Jalan Rusak
          </h1>
          <p className="text-neutral-600">
            Laporkan kerusakan jalan di sekitar Anda untuk membantu komunitas.
          </p>
        </div>

        {/* Form */}
        <CreateReportForm />
      </div>
    </div>
  );
}
