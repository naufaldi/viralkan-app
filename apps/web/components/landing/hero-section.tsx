import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Play, MapPin, Share2, Eye } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-indigo-400/10 to-cyan-400/10 rounded-full blur-3xl"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left space-y-8">
            {/* Platform Badge */}
            <Badge
              variant="secondary"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-blue-200/50 text-slate-700 text-sm font-medium hover:bg-white/90 transition-colors"
            >
              <span className="text-red-500">🇮🇩</span>
              Platform Komunitas Indonesia
            </Badge>

            {/* Main Heading */}
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight tracking-tight">
                <span className="text-slate-900">Jalan Rusak?</span>
                <br />
                <span className="text-slate-800">Jangan Diam,</span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Viralkan!
                </span>
              </h1>

              <p className="text-xl text-slate-600 max-w-2xl leading-relaxed">
                Petakan, bagikan, dan hindari jalan rusak di seluruh Indonesia.
                Jadikan suaramu terdengar lewat kekuatan media sosial.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="flex flex-wrap gap-6 justify-center lg:justify-start">
              {[
                {
                  number: "1,247+",
                  label: "Laporan",
                  color: "from-blue-500 to-cyan-500",
                },
                {
                  number: "5,890+",
                  label: "Dibagikan",
                  color: "from-purple-500 to-pink-500",
                },
                {
                  number: "23",
                  label: "Kota",
                  color: "from-indigo-500 to-blue-500",
                },
              ].map((stat, index) => (
                <Card
                  key={index}
                  className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <CardContent className="p-4 text-center">
                    <div
                      className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
                    >
                      {stat.number}
                    </div>
                    <div className="text-sm text-slate-600 font-medium">
                      {stat.label}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <MapPin className="mr-2 h-5 w-5" />
                Cara Kerja
                <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  →
                </div>
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:border-slate-300 text-slate-700 shadow-md hover:shadow-lg transition-all duration-300"
              >
                <Play className="mr-2 h-4 w-4" />
                Lihat Demo
              </Button>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative">
            {/* Main App Mockup Card */}
            <Card className="relative bg-white/80 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105">
              <CardContent className="p-8">
                {/* Floating Action Buttons */}
                <div className="absolute -top-4 -right-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl p-3 shadow-lg animate-bounce">
                  <MapPin className="h-6 w-6 text-white" />
                </div>

                <div className="absolute -bottom-4 -left-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-3 shadow-lg animate-pulse">
                  <Share2 className="h-6 w-6 text-white" />
                </div>

                {/* Card Header */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-1">
                      Laporan Jalan Rusak
                    </h3>
                    <p className="text-slate-600 text-sm">
                      Jl. Sudirman, Jakarta Pusat
                    </p>
                  </div>
                </div>

                {/* Mock Map Interface */}
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 mb-6">
                  <CardContent className="p-6 h-48 flex items-center justify-center">
                    <div className="text-center space-y-3">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto">
                        <MapPin className="h-8 w-8 text-white" />
                      </div>
                      <div className="text-sm text-slate-600 font-medium">
                        Lokasi Terdeteksi
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md">
                    <Share2 className="mr-2 h-4 w-4" />
                    Bagikan
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-slate-200 hover:bg-slate-50"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Detail
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Decorative Floating Elements */}
            <div className="absolute top-1/4 -left-8 w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-60 animate-pulse"></div>
            <div className="absolute bottom-1/3 -right-6 w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-60 animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 -left-4 w-3 h-3 bg-gradient-to-r from-indigo-400 to-cyan-400 rounded-full opacity-60 animate-pulse delay-500"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
