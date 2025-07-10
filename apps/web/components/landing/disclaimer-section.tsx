import { Card, CardContent, CardHeader } from "@repo/ui/components/ui/card";
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";
import { Badge } from "@repo/ui/components/ui/badge";
import { AlertTriangle, Info, Heart, Target } from "lucide-react";

const DisclaimerSection = () => {
  const disclaimerPoints = [
    {
      icon: AlertTriangle,
      title: "Platform Independen",
      description: "Viralkan adalah platform independen yang tidak berafiliasi dengan pemerintah manapun.",
      type: "warning"
    },
    {
      icon: Info,
      title: "Tidak Menjamin Perbaikan",
      description: "Kami tidak dapat menjamin bahwa laporan akan langsung diperbaiki oleh pihak berwenang.",
      type: "info"
    },
    {
      icon: Target,
      title: "Tujuan Platform",
      description: "Tujuan utama adalah membangun kesadaran publik dan memberikan informasi rute yang aman.",
      type: "success"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-slate-50 to-orange-50">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-6">
          <Badge variant="outline" className="border-orange-200 bg-orange-50 text-orange-700 px-4 py-2">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Informasi Penting
          </Badge>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
            Harap{" "}
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              diperhatikan
            </span>
          </h2>
          
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Transparansi dan kejujuran adalah kunci kepercayaan. Berikut adalah hal-hal penting yang perlu Anda ketahui.
          </p>
        </div>

        {/* Main Disclaimer Card */}
        <div className="max-w-4xl mx-auto mb-12">
          <Alert className="border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50 shadow-lg">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <AlertDescription className="text-lg text-slate-700 leading-relaxed">
              <strong className="text-orange-800">Perhatian:</strong> Platform ini dirancang untuk meningkatkan kesadaran publik tentang kondisi infrastruktur jalan. 
              Kami berkomitmen untuk transparansi penuh dalam operasional dan tujuan platform.
            </AlertDescription>
          </Alert>
        </div>

        {/* Disclaimer Points */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {disclaimerPoints.map((point, index) => {
            const IconComponent = point.icon;
            const colorClasses = {
              warning: {
                icon: "from-orange-500 to-red-500",
                bg: "from-orange-50 to-red-50",
                border: "border-orange-200",
                text: "text-orange-800"
              },
              info: {
                icon: "from-blue-500 to-cyan-500",
                bg: "from-blue-50 to-cyan-50",
                border: "border-blue-200",
                text: "text-blue-800"
              },
              success: {
                icon: "from-green-500 to-emerald-500",
                bg: "from-green-50 to-emerald-50",
                border: "border-green-200",
                text: "text-green-800"
              }
            };
            
            const colors = colorClasses[point.type as keyof typeof colorClasses];
            
            return (
              <Card 
                key={index}
                className={`bg-gradient-to-br ${colors.bg} border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${colors.border}`}
              >
                <CardHeader className="pb-4">
                  <div className={`inline-flex w-12 h-12 rounded-2xl bg-gradient-to-r ${colors.icon} p-3 shadow-lg mb-4`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  
                  <h3 className={`text-xl font-bold ${colors.text}`}>
                    {point.title}
                  </h3>
                </CardHeader>

                <CardContent>
                  <p className="text-slate-600 leading-relaxed">
                    {point.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Purpose Statement */}
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0 shadow-2xl">
            <CardContent className="p-8 lg:p-12 text-center text-white">
              <div className="space-y-6">
                <div className="inline-flex w-16 h-16 rounded-3xl bg-white/20 backdrop-blur-sm p-4 shadow-lg mb-6">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="text-3xl font-bold leading-tight">
                  Dibuat dengan ❤️ untuk Indonesia
                </h3>
                
                <p className="text-xl text-blue-100 leading-relaxed max-w-2xl mx-auto">
                  Platform ini lahir dari kepedulian terhadap kondisi infrastruktur Indonesia. 
                  Kami percaya bahwa dengan transparansi dan partisipasi masyarakat, 
                  kita bisa menciptakan perubahan positif.
                </p>

                {/* Mission Points */}
                <div className="grid md:grid-cols-2 gap-6 mt-8 text-left">
                  {[
                    "Memberikan informasi rute aman untuk pengguna jalan",
                    "Membangun kesadaran publik tentang kondisi infrastruktur",
                    "Menciptakan platform partisipasi masyarakat yang konstruktif",
                    "Mendorong transparansi dalam pengelolaan infrastruktur"
                  ].map((mission, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-blue-100">{mission}</span>
                    </div>
                  ))}
                </div>

                {/* Contact Info */}
                <div className="pt-8 border-t border-white/20">
                  <p className="text-sm text-blue-200">
                    Ada pertanyaan atau masukan? Hubungi kami di{" "}
                    <a href="mailto:info@viralkan.id" className="text-white underline hover:no-underline">
                      info@viralkan.id
                    </a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default DisclaimerSection; 