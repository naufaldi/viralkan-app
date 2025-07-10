import { Card, CardContent, CardHeader } from "@repo/ui/components/ui/card";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Camera, Share2, Map, ArrowRight, CheckCircle } from "lucide-react";

const HowItWorksSection = () => {
  const steps = [
    {
      id: "01",
      icon: Camera,
      title: "Laporkan",
      subtitle: "Dokumentasi Kerusakan",
      description: "Ambil foto jalan rusak, tandai lokasi dengan GPS otomatis, dan kategorikan jenis kerusakan yang ditemukan.",
      color: "from-blue-500 to-cyan-500",
      bgColor: "from-blue-50 to-cyan-50",
      features: ["Foto HD", "GPS Otomatis", "Kategorisasi"]
    },
    {
      id: "02", 
      icon: Share2,
      title: "Viralkan",
      subtitle: "Bagikan ke Media Sosial",
      description: "Bagikan laporan ke platform media sosial dengan template yang menarik untuk memaksimalkan jangkauan.",
      color: "from-purple-500 to-pink-500",
      bgColor: "from-purple-50 to-pink-50",
      features: ["Template Siap", "Multi Platform", "Auto Hashtag"]
    },
    {
      id: "03",
      icon: Map,
      title: "Peta Interaktif",
      subtitle: "Hindari & Navigasi",
      description: "Akses peta interaktif dengan semua laporan terkini untuk merencanakan rute perjalanan yang lebih aman.",
      color: "from-green-500 to-emerald-500", 
      bgColor: "from-green-50 to-emerald-50",
      features: ["Real-time", "Navigasi", "Filter Lokasi"]
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20 space-y-6">
          <Badge variant="secondary" className="bg-slate-100 text-slate-700 px-4 py-2">
            Cara Kerja Platform
          </Badge>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
            Tiga langkah sederhana untuk{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              membuat perubahan
            </span>
          </h2>
          
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Proses yang dirancang untuk memaksimalkan dampak setiap laporan melalui kekuatan media sosial
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Lines - Hidden on mobile */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-green-200 -translate-y-1/2 z-0"></div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 relative z-10">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div key={step.id} className="relative">
                  {/* Mobile Flow Indicator */}
                  {index < steps.length - 1 && (
                    <div className="lg:hidden absolute -bottom-4 left-1/2 transform -translate-x-1/2 translate-y-full">
                      <ArrowRight className="h-6 w-6 text-slate-300 rotate-90" />
                    </div>
                  )}

                  <Card className={`relative bg-gradient-to-br ${step.bgColor} border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 group`}>
                    <CardHeader className="text-center pb-4">
                      {/* Step Number */}
                      <div className="absolute -top-4 left-6">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${step.color} shadow-lg flex items-center justify-center`}>
                          <span className="text-white font-bold text-lg">{step.id}</span>
                        </div>
                      </div>
                      
                      {/* Icon */}
                      <div className={`inline-flex w-16 h-16 rounded-3xl bg-gradient-to-r ${step.color} p-4 shadow-lg mb-6 mt-8 group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className="h-8 w-8 text-white" />
                      </div>
                      
                      {/* Title & Subtitle */}
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-slate-900">{step.title}</h3>
                        <p className="text-slate-600 font-medium">{step.subtitle}</p>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      {/* Description */}
                      <p className="text-slate-600 leading-relaxed text-center">
                        {step.description}
                      </p>

                      {/* Features */}
                      <div className="space-y-3">
                        {step.features.map((feature, featureIndex) => (
                          <div 
                            key={featureIndex}
                            className="flex items-center gap-3 text-sm"
                          >
                            <CheckCircle className={`h-4 w-4 text-green-600`} />
                            <span className="font-medium text-slate-700">{feature}</span>
                          </div>
                        ))}
                      </div>

                      {/* Action Button */}
                      <Button 
                        variant="outline" 
                        className="w-full group-hover:bg-slate-50 transition-colors"
                      >
                        Pelajari Detail
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>

                    {/* Decorative Elements */}
                    <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${step.color} opacity-5 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-700`}></div>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA Section */}
        <div className="mt-20">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0 shadow-2xl">
            <CardContent className="p-12 text-center text-white">
              <div className="space-y-6 max-w-3xl mx-auto">
                <h3 className="text-3xl font-bold">
                  Siap untuk memulai perubahan?
                </h3>
                <p className="text-xl text-blue-100 leading-relaxed">
                  Bergabunglah dengan komunitas yang peduli infrastruktur Indonesia. 
                  Setiap laporan Anda berkontribusi untuk jalan yang lebih baik.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button 
                    size="lg" 
                    className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Camera className="mr-2 h-5 w-5" />
                    Mulai Melaporkan
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
                  >
                    <Map className="mr-2 h-5 w-5" />
                    Lihat Peta
                  </Button>
                </div>

                {/* Trust Indicators */}
                <div className="flex items-center justify-center gap-8 text-sm text-blue-100 pt-8 border-t border-white/20">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Gratis selamanya</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Data terenkripsi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Komunitas aktif</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection; 