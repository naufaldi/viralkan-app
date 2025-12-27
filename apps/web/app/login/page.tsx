"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, ArrowLeft } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { LoginForm } from "../../components/auth/login-form";
import { useAuthContext } from "../../contexts/AuthContext";

interface Feature {
  icon: string;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: "📷",
    title: "Laporkan Kerusakan Jalan",
    description: "Ambil foto dan tandai lokasi jalan rusak di sekitar Anda",
  },
  {
    icon: "📱",
    title: "Bagikan ke Media Sosial",
    description: "Viralkan laporan Anda langsung ke WhatsApp, Twitter, Threads",
  },
  {
    icon: "👥",
    title: "Bergabung dengan Komunitas",
    description:
      "Terhubung dengan ribuan warga Indonesia yang peduli infrastruktur",
  },
  {
    icon: "📊",
    title: "Lihat Dashboard Pribadi",
    description:
      "Pantau laporan Anda dan lihat dampak kontribusi pada komunitas",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthContext();

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="bg-primary-600 mx-auto mb-4 flex h-8 w-8 items-center justify-center rounded-lg">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <p className="text-neutral-600">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      {/* Header */}
      <header className="border-b border-neutral-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary-600 flex h-8 w-8 items-center justify-center rounded-lg">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-neutral-900">
                Viralkan
              </span>
            </div>

            <Button
              variant="ghost"
              onClick={() => router.push("/")}
              className="text-neutral-600 hover:text-neutral-900"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Beranda
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-16">
        <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-2">
          {/* Left Side - Info */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl leading-tight font-bold text-neutral-900 lg:text-5xl">
                Bergabung dengan{" "}
                <span className="text-primary-600">komunitas</span>
              </h1>

              <p className="text-xl leading-relaxed text-neutral-600">
                Masuk untuk mulai melaporkan kerusakan jalan, berbagi informasi
                dengan komunitas, dan membantu membangun infrastruktur yang
                lebih baik untuk Indonesia.
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-neutral-900">
                Dengan masuk, Anda bisa:
              </h2>

              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="text-2xl">{feature.icon}</div>
                    <div>
                      <h3 className="mb-1 font-semibold text-neutral-900">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-neutral-600">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-primary-50 border-primary-200 rounded-lg border p-6">
              <h3 className="text-primary-900 mb-2 font-semibold">
                💡 Catatan Penting
              </h3>
              <p className="text-primary-700 text-sm leading-relaxed">
                Viralkan adalah platform <strong>komunitas independen</strong>.
                Kami tidak berafiliasi dengan pemerintah dan tidak dapat
                menjamin perbaikan jalan. Tujuan kami murni untuk meningkatkan
                kesadaran publik melalui kekuatan viral media sosial.
              </p>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="flex items-center justify-center">
            <LoginForm />
          </div>
        </div>
      </main>
    </div>
  );
}
