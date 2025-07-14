"use client";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import {
  MapPin,
  Camera,
  Share2,
  Users,
  CheckCircle,
  ArrowRight,
  Star,
  MessageSquare,
  Zap,
  Shield,
  Heart,
} from "lucide-react";
import Header from "components/layout/header";
import Footer from "components/layout/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header - Streamline-inspired minimal design */}
      <Header />

      <main>
        {/* Hero Section - Clean typography-first approach */}
        <section className="py-24 lg:py-32">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left Content */}
              <div className="space-y-8">
                <Badge
                  variant="secondary"
                  className="bg-neutral-100 text-neutral-700 border-0"
                >
                  <span className="mr-2">🇮🇩</span>
                  Platform Komunitas Indonesia
                </Badge>

                <div className="space-y-6">
                  <h1 className="text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-neutral-900">
                    Jalan Rusak?{" "}
                    <span className="block text-neutral-700">Jangan Diam,</span>
                    <span className="block text-primary-600">Viralkan!</span>
                  </h1>

                  <p className="text-xl text-neutral-600 leading-relaxed max-w-lg">
                    Petakan, bagikan, dan hindari jalan rusak di seluruh
                    Indonesia. Jadikan suaramu terdengar lewat kekuatan
                    komunitas.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    className="bg-primary-600 hover:bg-primary-700"
                  >
                    <Camera className="mr-2 h-5 w-5" />
                    Mulai Lapor Sekarang
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-neutral-300"
                    onClick={() => (window.location.href = "/laporan")}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Lihat Laporan
                  </Button>
                </div>
              </div>

              {/* Right Content - App Preview */}
              <div className="relative">
                <Card className="bg-neutral-25 border border-neutral-200 shadow-sm">
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-danger rounded-full"></div>
                        <div className="w-3 h-3 bg-warning rounded-full"></div>
                        <div className="w-3 h-3 bg-success rounded-full"></div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                          Laporan Jalan Rusak
                        </h3>
                        <p className="text-sm text-neutral-600">
                          Jl. Sudirman, Jakarta Pusat
                        </p>
                      </div>

                      <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 h-40 flex items-center justify-center">
                        <div className="text-center space-y-3">
                          <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center mx-auto">
                            <MapPin className="h-6 w-6 text-white" />
                          </div>
                          <p className="text-sm text-primary-700 font-medium">
                            Lokasi Terdeteksi
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button className="flex-1 bg-primary-600 hover:bg-primary-700">
                          <Share2 className="mr-2 h-4 w-4" />
                          Bagikan
                        </Button>
                        <Button variant="outline" className="flex-1">
                          Detail
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-neutral-50">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  number: "1,247+",
                  label: "Laporan Diterima",
                  color: "text-primary-600",
                },
                {
                  number: "5,890+",
                  label: "Dibagikan di Medsos",
                  color: "text-success",
                },
                { number: "23", label: "Kota Terlayani", color: "text-info" },
              ].map((stat, index) => (
                <Card
                  key={index}
                  className="text-center bg-white border-0 shadow-sm"
                >
                  <CardContent className="py-8">
                    <div className={`text-3xl font-bold ${stat.color} mb-2`}>
                      {stat.number}
                    </div>
                    <p className="text-neutral-600 font-medium">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-24">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <Badge
                    variant="secondary"
                    className="bg-primary-100 text-primary-700 border-0"
                  >
                    Cara Kerja
                  </Badge>
                  <h2 className="text-4xl font-bold text-neutral-900 leading-tight">
                    Mudah untuk semua orang
                  </h2>
                  <p className="text-lg text-neutral-600 leading-relaxed">
                    Platform komunitas untuk berbagi info jalan rusak. Bantu
                    sesama hindari lubang, sekaligus buat viral ke medsos!
                  </p>
                </div>

                <div className="space-y-6">
                  {[
                    {
                      icon: Camera,
                      title: "Foto & Lokasi",
                      description:
                        "Ambil foto jalan rusak, lokasi otomatis terdeteksi",
                    },
                    {
                      icon: Share2,
                      title: "Bagikan ke Medsos",
                      description:
                        "Viralkan laporan ke WhatsApp, Twitter, atau Instagram",
                    },
                    {
                      icon: CheckCircle,
                      title: "Lihat Dampak",
                      description:
                        "Pantau seberapa viral laporan dan respons komunitas",
                    },
                  ].map((step, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <step.icon className="h-6 w-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-900 mb-1">
                          {step.title}
                        </h3>
                        <p className="text-neutral-600">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4">
                <Card className="border border-neutral-200 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-danger/10 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-danger rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium text-neutral-900">
                        Lubang Besar - Jl. Gatot Subroto
                      </span>
                    </div>
                    <div className="bg-neutral-100 rounded-lg h-24 mb-4"></div>
                    <p className="text-xs text-neutral-600">
                      Dilaporkan 2 jam yang lalu • 15 orang membagikan
                    </p>
                  </CardContent>
                </Card>

                <Card className="border border-neutral-200 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-warning/10 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-warning rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium text-neutral-900">
                        Retak Aspal - Jl. Sudirman
                      </span>
                    </div>
                    <div className="bg-neutral-100 rounded-lg h-24 mb-4"></div>
                    <p className="text-xs text-neutral-600">
                      Dilaporkan 5 jam yang lalu • 8 orang membagikan
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Community Section */}
        <section id="community" className="py-24 bg-neutral-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <Badge
                variant="secondary"
                className="bg-neutral-100 text-neutral-700 border-0 mb-4"
              >
                Dipercaya Komunitas
              </Badge>
              <h2 className="text-4xl font-bold text-neutral-900 mb-4">
                Oleh rakyat, untuk rakyat
              </h2>
              <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                Bergabung dengan ribuan warga Indonesia yang peduli
                infrastruktur dan membantu membangun jalan yang lebih baik.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: "Sari Dewi",
                  role: "Warga Jakarta",
                  image: "SD",
                  testimonial:
                    "Akhirnya ada platform untuk berbagi info jalan rusak. Setelah viral di medsos, banyak teman yang terhindar dari lubang besar!",
                  reports: "12 laporan",
                },
                {
                  name: "Ahmad Rahman",
                  role: "Driver Ojol",
                  image: "AR",
                  testimonial:
                    "Sebagai driver ojol, app ini penyelamat! Bisa hindari jalan rusak dari info teman-teman, sekaligus berbagi ke komunitas driver.",
                  reports: "28 laporan",
                },
                {
                  name: "Maya Sari",
                  role: "Ibu Rumah Tangga",
                  image: "MS",
                  testimonial:
                    "Interface-nya simpel, gampang dipake. Sekarang keluarga bisa tau jalan mana yang harus dihindari dari laporan warga.",
                  reports: "7 laporan",
                },
              ].map((testimonial, index) => (
                <Card
                  key={index}
                  className="bg-white border border-neutral-200 shadow-sm"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary-700">
                          {testimonial.image}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-neutral-900">
                          {testimonial.name}
                        </div>
                        <div className="text-sm text-neutral-600">
                          {testimonial.role}
                        </div>
                      </div>
                    </div>

                    <p className="text-neutral-700 mb-4 leading-relaxed">
                      "{testimonial.testimonial}"
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="h-4 w-4 fill-warning text-warning"
                          />
                        ))}
                      </div>
                      <span className="text-xs text-neutral-500">
                        {testimonial.reports}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-24">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div>
                  <Badge
                    variant="secondary"
                    className="bg-primary-100 text-primary-700 border-0 mb-4"
                  >
                    Mengapa Viralkan?
                  </Badge>
                  <h2 className="text-4xl font-bold text-neutral-900 mb-4 leading-tight">
                    Platform yang dibuat dengan hati
                  </h2>
                  <p className="text-lg text-neutral-600 leading-relaxed">
                    Kami percaya informasi yang tepat bisa menyelamatkan ban dan
                    shock breaker. Viralkan hadir untuk membantu komunitas
                    saling berbagi dan peduli.
                  </p>
                </div>

                <div className="space-y-6">
                  {[
                    {
                      icon: Heart,
                      title: "Dibuat dengan Cinta",
                      description:
                        "Tim lokal yang memahami kondisi jalan Indonesia",
                    },
                    {
                      icon: Shield,
                      title: "Data Aman & Privasi",
                      description: "Lokasi dan data pribadi dijaga keamanannya",
                    },
                    {
                      icon: Zap,
                      title: "Respon Cepat",
                      description:
                        "Laporan langsung tersambung ke media sosial",
                    },
                  ].map((feature, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <feature.icon className="h-6 w-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-900 mb-1">
                          {feature.title}
                        </h3>
                        <p className="text-neutral-600">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Card className="bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-900 mb-4">
                    Bergabung dengan Komunitas
                  </h3>
                  <p className="text-neutral-700 mb-6 leading-relaxed">
                    Ribuan warga Indonesia sudah berbagi info jalan rusak di
                    Viralkan. Bantu teman-teman hindari lubang, suaramu
                    berpengaruh!
                  </p>
                  <Button className="bg-primary-600 hover:bg-primary-700">
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Mulai Berkontribusi
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-neutral-900">
          <div className="container mx-auto px-6 text-center">
            <div className="max-w-3xl mx-auto space-y-8">
              <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                Viralkan dimulai sekarang.{" "}
                <span className="text-neutral-400">
                  Jalan yang lebih baik menanti.
                </span>
              </h2>

              <p className="text-xl text-neutral-300 leading-relaxed">
                Bergabunglah dengan komunitas yang peduli sesama pengguna jalan.
                Setiap info yang kamu bagikan bisa menyelamatkan ban
                teman-teman.
              </p>

              <Button size="lg" className="bg-primary-600 hover:bg-primary-700">
                <Camera className="mr-2 h-5 w-5" />
                Mulai Lapor Gratis
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
