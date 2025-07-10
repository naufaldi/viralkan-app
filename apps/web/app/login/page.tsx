"use client";

import { useEffect } from "react";
import { MapPin, ArrowLeft } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { LoginForm } from "../../components/auth/login-form";
import { useMockAuth } from "../../hooks/use-mock-auth";

export default function LoginPage() {
  const { isAuthenticated, loading } = useMockAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      window.location.href = "/";
    }
  }, [isAuthenticated, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mx-auto mb-4">
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
      <header className="bg-white/80 backdrop-blur-sm border-b border-neutral-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-neutral-900">
                Viralkan
              </span>
            </div>
            
            <Button
              variant="ghost"
              onClick={() => window.location.href = "/"}
              className="text-neutral-600 hover:text-neutral-900"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Beranda
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
          {/* Left Side - Info */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-5xl font-bold text-neutral-900 leading-tight">
                Bergabung dengan{" "}
                <span className="text-primary-600">komunitas</span>
              </h1>
              
              <p className="text-xl text-neutral-600 leading-relaxed">
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
                {[
                  {
                    icon: "📷",
                    title: "Laporkan Kerusakan Jalan",
                    description: "Ambil foto dan tandai lokasi jalan rusak di sekitar Anda"
                  },
                  {
                    icon: "📱",
                    title: "Bagikan ke Media Sosial", 
                    description: "Viralkan laporan Anda langsung ke WhatsApp, Twitter, Instagram"
                  },
                  {
                    icon: "👥",
                    title: "Bergabung dengan Komunitas",
                    description: "Terhubung dengan ribuan warga Indonesia yang peduli infrastruktur"
                  },
                  {
                    icon: "📊",
                    title: "Lihat Dashboard Pribadi",
                    description: "Pantau laporan Anda dan lihat dampak kontribusi pada komunitas"
                  }
                ].map((feature, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="text-2xl">{feature.icon}</div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-neutral-600 text-sm">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
              <h3 className="font-semibold text-primary-900 mb-2">
                💡 Catatan Penting
              </h3>
              <p className="text-sm text-primary-700 leading-relaxed">
                Viralkan adalah platform <strong>komunitas independen</strong>. 
                Kami tidak berafiliasi dengan pemerintah dan tidak dapat menjamin 
                perbaikan jalan. Tujuan kami murni untuk meningkatkan kesadaran publik 
                melalui kekuatan viral media sosial.
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