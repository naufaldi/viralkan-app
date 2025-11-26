import { requireAuth } from "../../../lib/auth-server";
import CreateReportForm from "../../../components/reports/create-report-form";

import { Share2, Users, Eye } from "lucide-react";
import Header from "components/layout/header";

export default async function CreateReportPage() {
  // Server-side authentication check
  await requireAuth();

  return (
    <>
      <Header />
      <div className="min-h-screen bg-neutral-50">
        {/* Main Content Container */}
        <div className="container mx-auto px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
          {/* Page Header Section */}
          <div className="mx-auto mb-12 max-w-4xl lg:mb-16">
            <div className="text-center lg:grid lg:grid-cols-2 lg:items-center lg:gap-16 lg:text-left">
              {/* Left Column - Introduction */}
              <div className="mb-8 lg:mb-0">
                <h1 className="mb-4 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
                  Bagikan Kondisi Jalan Rusak
                </h1>
                <p className="max-w-2xl text-lg leading-relaxed text-neutral-600 sm:text-xl lg:max-w-none">
                  Bantu komunitas menghindari jalan rusak dan tingkatkan
                  kesadaran publik tentang masalah infrastruktur di sekitar
                  kita.
                </p>
              </div>

              {/* Right Column - Platform Benefits */}
              <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm lg:p-8">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-neutral-100">
                      <Users className="h-4 w-4 text-neutral-600" />
                    </div>
                    <div>
                      <h3 className="mb-1 font-semibold text-neutral-900">
                        Bantu Komunitas
                      </h3>
                      <p className="text-sm text-neutral-600">
                        Bagikan lokasi jalan rusak agar warga lain bisa
                        menghindari kerusakan yang sama.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-neutral-100">
                      <Share2 className="h-4 w-4 text-neutral-600" />
                    </div>
                    <div>
                      <h3 className="mb-1 font-semibold text-neutral-900">
                        Tingkatkan Kesadaran
                      </h3>
                      <p className="text-sm text-neutral-600">
                        Viral di media sosial untuk menarik perhatian dan
                        mendorong perbaikan infrastruktur.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-neutral-100">
                      <Eye className="h-4 w-4 text-neutral-600" />
                    </div>
                    <div>
                      <h3 className="mb-1 font-semibold text-neutral-900">
                        Platform Komunitas
                      </h3>
                      <p className="text-sm text-neutral-600">
                        Viralkan adalah platform berbagi informasi komunitas,
                        bukan layanan resmi pemerintah.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="mx-auto max-w-4xl">
            <CreateReportForm />
          </div>
        </div>
      </div>
    </>
  );
}
