import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Badge } from "@repo/ui/components/ui/badge";
import { TrendingUp, Users, MapPin, Target } from "lucide-react";

const StatsSection = () => {
  const stats = [
    {
      icon: MapPin,
      number: "1,247",
      suffix: "+",
      label: "Laporan Jalan Rusak",
      description: "Dokumentasi kerusakan dari seluruh Indonesia",
      color: "from-blue-500 to-cyan-500",
      bgColor: "from-blue-50 to-cyan-50",
      accentColor: "text-blue-600",
    },
    {
      icon: TrendingUp,
      number: "5,890",
      suffix: "+",
      label: "Dibagikan ke Media Sosial",
      description: "Viral di Twitter, Facebook, dan Instagram",
      color: "from-purple-500 to-pink-500",
      bgColor: "from-purple-50 to-pink-50",
      accentColor: "text-purple-600",
    },
    {
      icon: Users,
      number: "23",
      suffix: "",
      label: "Kota Terjangkau",
      description: "Dari Sabang sampai Merauke",
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-50 to-emerald-50",
      accentColor: "text-green-600",
    },
    {
      icon: Target,
      number: "89",
      suffix: "%",
      label: "Tingkat Kepuasan",
      description: "Pengguna merasa terbantu dengan platform ini",
      color: "from-orange-500 to-red-500",
      bgColor: "from-orange-50 to-red-50",
      accentColor: "text-orange-600",
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-white to-slate-50">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-6">
          <Badge
            variant="secondary"
            className="bg-slate-100 text-slate-700 px-4 py-2"
          >
            Dampak Platform
          </Badge>

          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
            Angka yang{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              berbicara sendiri
            </span>
          </h2>

          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Lihat bagaimana platform kami telah memberdayakan masyarakat
            Indonesia untuk menciptakan perubahan nyata
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card
                key={index}
                className={`group relative overflow-hidden bg-gradient-to-br ${stat.bgColor} border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2`}
              >
                <CardContent className="p-8 text-center relative z-10">
                  {/* Icon */}
                  <div
                    className={`inline-flex w-14 h-14 rounded-2xl bg-gradient-to-r ${stat.color} p-3 shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>

                  {/* Number */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-center">
                      <span
                        className={`text-4xl lg:text-5xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
                      >
                        {stat.number}
                      </span>
                      <span
                        className={`text-2xl lg:text-3xl font-bold ${stat.accentColor} ml-1`}
                      >
                        {stat.suffix}
                      </span>
                    </div>
                  </div>

                  {/* Label */}
                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-slate-800 transition-colors">
                    {stat.label}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {stat.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="mt-6">
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${stat.color} rounded-full transition-all duration-1000 group-hover:scale-x-110 origin-left`}
                        style={{
                          width: `${Math.min(100, parseInt(stat.number) / 20)}%`,
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-slate-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Terus bertambah setiap hari
                    </div>
                  </div>
                </CardContent>

                {/* Decorative Elements */}
                <div
                  className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-5 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-700`}
                ></div>
                <div
                  className={`absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-br ${stat.color} opacity-5 rounded-full translate-y-8 -translate-x-8 group-hover:scale-125 transition-transform duration-500`}
                ></div>

                {/* Hover Glow Effect */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                ></div>
              </Card>
            );
          })}
        </div>

        {/* Real-time Update Notice */}
        <div className="mt-16 text-center">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl max-w-md mx-auto">
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-slate-700">
                  Update Real-time
                </span>
              </div>
              <p className="text-sm text-slate-600">
                Data diperbarui setiap jam untuk memberikan informasi terkini
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
