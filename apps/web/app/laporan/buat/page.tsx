"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "../../../contexts/AuthContext";
import CreateReportForm from "../../../components/reports/create-report-form";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { AlertCircle, Loader2, Share2, Users, Eye } from "lucide-react";
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";
import Header from "components/layout/header";

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
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-neutral-200 shadow-lg">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-neutral-600" />
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
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-neutral-200 shadow-lg">
          <CardContent className="p-8 text-center">
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-800">
                Anda harus login terlebih dahulu untuk membuat laporan.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-neutral-50">
        {/* Main Content Container */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          {/* Page Header Section */}
          <div className="max-w-4xl mx-auto mb-12 lg:mb-16">
            <div className="text-center lg:text-left lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
              {/* Left Column - Introduction */}
              <div className="mb-8 lg:mb-0">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 tracking-tight mb-4">
                  Bagikan Kondisi Jalan Rusak
                </h1>
                <p className="text-lg sm:text-xl text-neutral-600 leading-relaxed max-w-2xl lg:max-w-none">
                  Bantu komunitas menghindari jalan rusak dan tingkatkan kesadaran publik tentang masalah infrastruktur di sekitar kita.
                </p>
              </div>

              {/* Right Column - Platform Benefits */}
              <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 lg:p-8">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Users className="h-4 w-4 text-neutral-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 mb-1">
                        Bantu Komunitas
                      </h3>
                      <p className="text-sm text-neutral-600">
                        Bagikan lokasi jalan rusak agar warga lain bisa menghindari kerusakan yang sama.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Share2 className="h-4 w-4 text-neutral-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 mb-1">
                        Tingkatkan Kesadaran
                      </h3>
                      <p className="text-sm text-neutral-600">
                        Viral di media sosial untuk menarik perhatian dan mendorong perbaikan infrastruktur.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Eye className="h-4 w-4 text-neutral-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 mb-1">
                        Platform Komunitas
                      </h3>
                      <p className="text-sm text-neutral-600">
                        Viralkan adalah platform berbagi informasi komunitas, bukan layanan resmi pemerintah.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="max-w-4xl mx-auto">
            <CreateReportForm />
          </div>
        </div>
      </div>
    </>
  );
}
