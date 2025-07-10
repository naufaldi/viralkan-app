import { Button } from "@repo/ui/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import Link from "next/link";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-6 py-24 lg:px-8 lg:py-32">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24">
          <div className="flex flex-col justify-center space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
                🇮🇩 Platform Komunitas Indonesia
              </div>
              
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                Jalan Rusak?{" "}
                <span className="text-gray-700">
                  Jangan Diam,{" "}
                  <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Viralkan!
                  </span>
                </span>
              </h1>
              
              <p className="text-xl leading-8 text-gray-600 lg:text-2xl">
                Petakan, bagikan, dan hindari jalan rusak di seluruh Indonesia. 
                Jadikan suaramu terdengar lewat kekuatan media sosial.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
              <Button size="lg" className="group bg-gray-900 hover:bg-gray-800">
                Lihat Peta Laporan
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              
              <Button variant="outline" size="lg" className="group">
                <Play className="mr-2 h-4 w-4" />
                Cara Kerja
              </Button>
            </div>

            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <span className="font-semibold text-gray-900">1,247+</span>
                <span className="ml-1">Laporan</span>
              </div>
              <div className="flex items-center">
                <span className="font-semibold text-gray-900">5,890+</span>
                <span className="ml-1">Dibagikan</span>
              </div>
              <div className="flex items-center">
                <span className="font-semibold text-gray-900">23</span>
                <span className="ml-1">Kota</span>
              </div>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="relative">
              {/* Main visual element */}
              <div className="relative h-[500px] w-full max-w-md rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 p-8 shadow-2xl">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-transparent"></div>
                <div className="relative flex h-full flex-col items-center justify-center space-y-6">
                  <div className="rounded-2xl bg-white p-6 shadow-lg">
                    <div className="h-32 w-32 rounded-xl bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
                      <span className="text-4xl">📍</span>
                    </div>
                  </div>
                  <div className="space-y-2 text-center">
                    <h3 className="text-lg font-semibold text-gray-900">Laporan Jalan Rusak</h3>
                    <p className="text-sm text-gray-600">Jl. Sudirman, Jakarta</p>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-6 -right-6 rounded-xl bg-white p-4 shadow-lg">
                <span className="text-2xl">🚗</span>
              </div>
              <div className="absolute -bottom-6 -left-6 rounded-xl bg-white p-4 shadow-lg">
                <span className="text-2xl">⚠️</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection; 