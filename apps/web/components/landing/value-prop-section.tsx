import { Card, CardContent, CardHeader } from "@repo/ui/components/ui/card";
import { Badge } from "@repo/ui/components/ui/badge";
import { TrendingUp, Shield, Users, ArrowRight } from "lucide-react";

const ValuePropSection = () => {
  const valueProps = [
    {
      icon: TrendingUp,
      title: "Kebijakan Berbasis Viral",
      description: "Di Indonesia, suara netizen punya kekuatan. Laporan yang viral lebih cepat mendapat perhatian.",
      gradient: "from-red-500 to-orange-500",
      bgColor: "from-red-50 to-orange-50",
      borderColor: "border-red-200",
      features: ["Jangkauan Luas", "Respon Cepat", "Dampak Nyata"]
    },
    {
      icon: Shield,
      title: "Informasi Untuk Keselamatan",
      description: "Ketahui rute mana yang harus dihindari. Rencanakan perjalanan Anda dengan lebih aman.",
      gradient: "from-blue-500 to-cyan-500",
      bgColor: "from-blue-50 to-cyan-50",
      borderColor: "border-blue-200",
      features: ["Rute Aman", "Data Real-time", "Navigasi Cerdas"]
    },
    {
      icon: Users,
      title: "Kekuatan Komunitas",
      description: "Data dari masyarakat, oleh masyarakat. Bersama kita ciptakan transparansi infrastruktur.",
      gradient: "from-green-500 to-emerald-500",
      bgColor: "from-green-50 to-emerald-50",
      borderColor: "border-green-200",
      features: ["Crowdsourced", "Transparan", "Kolaboratif"]
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-white to-slate-50">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-6">
          <Badge variant="secondary" className="bg-slate-100 text-slate-700 px-4 py-2">
            Mengapa Memilih Viralkan?
          </Badge>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
            Platform kami memberdayakan Anda untuk membuat perubahan nyata melalui{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              kesadaran sosial dan kekuatan komunitas yang terorganisir.
            </span>
          </h2>
        </div>

        {/* Value Proposition Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {valueProps.map((prop, index) => {
            const IconComponent = prop.icon;
            return (
              <Card 
                key={index} 
                className={`group relative overflow-hidden bg-gradient-to-br ${prop.bgColor} border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 ${prop.borderColor}`}
              >
                <CardHeader className="pb-4">
                  {/* Icon */}
                  <div className={`inline-flex w-14 h-14 rounded-2xl bg-gradient-to-r ${prop.gradient} p-3 shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-slate-800 transition-colors">
                    {prop.title}
                  </h3>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Description */}
                  <p className="text-slate-600 leading-relaxed">
                    {prop.description}
                  </p>

                  {/* Features List */}
                  <div className="space-y-3">
                    {prop.features.map((feature, featureIndex) => (
                      <div 
                        key={featureIndex}
                        className="flex items-center gap-3 text-sm text-slate-700"
                      >
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${prop.gradient}`}></div>
                        <span className="font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Hover Arrow */}
                  <div className="flex items-center gap-2 text-slate-600 group-hover:text-slate-800 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <span className="text-sm font-medium">Pelajari lebih lanjut</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </CardContent>

                {/* Decorative Elements */}
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${prop.gradient} opacity-5 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-700`}></div>
                <div className={`absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-br ${prop.gradient} opacity-5 rounded-full translate-y-8 -translate-x-8 group-hover:scale-125 transition-transform duration-500`}></div>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl max-w-2xl mx-auto">
            <CardContent className="p-8">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-slate-900">
                  Siap untuk membuat perubahan?
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Bergabunglah dengan ribuan pengguna yang telah merasakan dampak positif platform kami.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div 
                        key={i}
                        className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white"
                      >
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <span className="ml-2 font-medium">1,247+ pengguna aktif</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ValuePropSection; 