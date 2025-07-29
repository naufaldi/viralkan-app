"use client";
import Link from "next/link";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import {
  MapPin,
  Camera,
  Share2,
  Users,
  
  ArrowRight,
  Star,
  MessageSquare,
  Zap,
  Shield,
  Heart,
  TrendingUp,
} from "lucide-react";
import Header from "components/layout/header";
import Footer from "components/layout/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header - Professional civic design */}
      <Header />

      <main>
        {/* Hero Section - Luxury real estate inspired */}
        <section className="py-24 lg:py-32 bg-gradient-to-br from-neutral-50 to-white">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-24 items-center">
              {/* Left Content - Luxury typography and spacing */}
              <div className="space-y-12">
                <div className="space-y-6">
                  <Badge
                    variant="secondary"
                    className="bg-neutral-100 text-neutral-700 border-0 px-4 py-2 text-sm font-medium"
                  >
                    <span className="mr-2">🇮🇩</span>
                    Platform Komunitas Indonesia
                  </Badge>

                  <div className="space-y-8">
                    <h1 className="text-display-xl lg:text-display-2xl font-bold leading-tight tracking-tight text-neutral-900">
                      Laporkan Kerusakan Jalan{" "}
                      <span className="block text-neutral-700">dengan</span>
                      <span className="block text-neutral-800">Sederhana</span>
                    </h1>

                    <p className="text-xl text-neutral-600 leading-relaxed max-w-lg">
                      Unggah foto, isi detail lokasi, dan bagikan informasi
                      kerusakan jalan di seluruh Indonesia. Platform sederhana
                      untuk dokumentasi infrastruktur yang dapat diakses semua
                      warga.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6">
                  <Button
                    size="lg"
                    className="bg-neutral-800 hover:bg-neutral-900 text-white shadow-button hover:shadow-button-hover transition-all duration-200 px-8 py-4 text-lg"
                    asChild
                  >
                    <Link href="/laporan/buat">
                      <Camera className="mr-3 h-6 w-6" />
                      Buat Laporan
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-neutral-300 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 transition-all duration-200 px-8 py-4 text-lg"
                    asChild
                  >
                    <Link href="/laporan">
                      <MessageSquare className="mr-3 h-5 w-5" />
                      Lihat Laporan
                    </Link>
                  </Button>
                </div>

                {/* Trust indicators - Simple and honest */}
                <div className="flex items-center gap-8 pt-8 border-t border-neutral-200">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-neutral-800 rounded-full"></div>
                    <span className="text-sm text-neutral-600">
                      Upload Foto Sederhana
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-neutral-800 rounded-full"></div>
                    <span className="text-sm text-neutral-600">
                      Lokasi Manual
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-neutral-800 rounded-full"></div>
                    <span className="text-sm text-neutral-600">
                      Akses Terbuka
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Content - Simple app preview */}
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-neutral-100 to-neutral-200 rounded-2xl blur-xl opacity-50"></div>
                <Card className="relative bg-white border border-neutral-200 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <CardContent className="p-10">
                    <div className="space-y-8">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-neutral-400 rounded-full"></div>
                          <div className="w-3 h-3 bg-neutral-300 rounded-full"></div>
                          <div className="w-3 h-3 bg-neutral-500 rounded-full"></div>
                        </div>
                        <Badge className="bg-neutral-800 text-white text-xs">
                          DRAFT
                        </Badge>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                          Laporan Kerusakan Jalan
                        </h3>
                        <p className="text-sm text-neutral-600 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          Jl. Sudirman, Jakarta Pusat
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 border border-neutral-200 rounded-xl p-8 h-52 flex items-center justify-center">
                        <div className="text-center space-y-4">
                          <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mx-auto shadow-lg">
                            <Camera className="h-8 w-8 text-white" />
                          </div>
                          <p className="text-sm text-neutral-700 font-medium">
                            Upload Foto Jalan Rusak
                          </p>
                          <p className="text-xs text-neutral-500">
                            Drag & drop atau klik untuk pilih
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <Button className="flex-1 bg-neutral-800 hover:bg-neutral-900 text-white shadow-button hover:shadow-button-hover transition-all duration-200">
                          <Share2 className="mr-2 h-4 w-4" />
                          Simpan Draft
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                        >
                          Preview
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section - Simple metrics */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-display-md font-bold text-neutral-900 mb-4">
                Platform Sederhana untuk Dokumentasi
              </h2>
              <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
                Unggah foto, isi detail, dan bagikan informasi kerusakan jalan
                dengan mudah dan cepat.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  number: "1,247+",
                  label: "Foto Terunggah",
                  description: "Dokumentasi kerusakan jalan",
                  icon: Camera,
                },
                {
                  number: "5,890+",
                  label: "Laporan Dibuat",
                  description: "Oleh warga Indonesia",
                  icon: TrendingUp,
                },
                {
                  number: "23",
                  label: "Kota Terjangkau",
                  description: "Dari Sabang sampai Merauke",
                  icon: MapPin,
                },
              ].map((stat, index) => (
                <Card
                  key={index}
                  className="text-center bg-white border border-neutral-200 shadow-card hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-1"
                >
                  <CardContent className="py-12">
                    <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                      <stat.icon className="h-8 w-8 text-neutral-800" />
                    </div>
                    <div className="text-display-md font-bold text-neutral-900 mb-3">
                      {stat.number}
                    </div>
                    <p className="text-neutral-600 font-medium text-lg mb-2">
                      {stat.label}
                    </p>
                    <p className="text-neutral-500 text-sm">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section - Simple process */}
        <section id="how-it-works" className="py-24 bg-neutral-50">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-24 items-center">
              <div className="space-y-12">
                <div className="space-y-6">
                  <Badge
                    variant="secondary"
                    className="bg-neutral-100 text-neutral-700 border-0 px-4 py-2"
                  >
                    Cara Kerja
                  </Badge>
                  <h2 className="text-display-md font-bold text-neutral-900 leading-tight">
                    Proses Sederhana dalam 3 Langkah
                  </h2>
                  <p className="text-xl text-neutral-600 leading-relaxed">
                    Platform dokumentasi infrastruktur yang mudah digunakan.
                    Unggah foto, isi detail lokasi, dan bagikan informasi
                    kerusakan jalan dengan komunitas.
                  </p>
                </div>

                <div className="space-y-10">
                  {[
                    {
                      icon: Camera,
                      title: "Upload Foto",
                      description:
                        "Ambil foto kerusakan jalan dan unggah dengan mudah melalui drag & drop",
                      step: "01",
                    },
                    {
                      icon: MapPin,
                      title: "Isi Lokasi",
                      description:
                        "Masukkan detail lokasi dan koordinat GPS secara manual",
                      step: "02",
                    },
                    {
                      icon: Share2,
                      title: "Bagikan Informasi",
                      description:
                        "Simpan dan bagikan laporan dengan komunitas",
                      step: "03",
                    },
                  ].map((step, index) => (
                    <div key={index} className="flex gap-8">
                      <div className="relative">
                        <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                          <step.icon className="h-8 w-8 text-white" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-neutral-100 rounded-full flex items-center justify-center border-2 border-white">
                          <span className="text-xs font-bold text-neutral-800">
                            {step.step}
                          </span>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-900 mb-3 text-xl">
                          {step.title}
                        </h3>
                        <p className="text-neutral-600 leading-relaxed text-lg">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-6">
                <Card className="border border-neutral-200 shadow-card hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-1">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center shadow-sm">
                        <div className="w-5 h-5 bg-neutral-600 rounded-full"></div>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-neutral-900">
                          Lubang Besar - Jl. Gatot Subroto
                        </span>
                        <p className="text-xs text-neutral-500 mt-1">
                          Dilaporkan oleh warga
                        </p>
                      </div>
                    </div>
                    <div className="bg-neutral-100 rounded-xl h-32 mb-4"></div>
                    <p className="text-xs text-neutral-600">
                      Dilaporkan 2 jam yang lalu • Foto dokumentasi
                    </p>
                  </CardContent>
                </Card>

                <Card className="border border-neutral-200 shadow-card hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-1">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center shadow-sm">
                        <div className="w-5 h-5 bg-neutral-500 rounded-full"></div>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-neutral-900">
                          Retak Permukaan - Jl. Sudirman
                        </span>
                        <p className="text-xs text-neutral-500 mt-1">
                          Dilaporkan oleh warga
                        </p>
                      </div>
                    </div>
                    <div className="bg-neutral-100 rounded-xl h-32 mb-4"></div>
                    <p className="text-xs text-neutral-600">
                      Dilaporkan 5 jam yang lalu • Foto dokumentasi
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Community Section - Simple testimonials */}
        <section id="community" className="py-24 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-20">
              <Badge
                variant="secondary"
                className="bg-neutral-100 text-neutral-700 border-0 mb-6 px-4 py-2"
              >
                Dipercaya Warga
              </Badge>
              <h2 className="text-display-md font-bold text-neutral-900 mb-6">
                Platform Sederhana untuk Semua
              </h2>
              <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
                Ribuan warga Indonesia sudah menggunakan platform ini untuk
                mendokumentasikan kerusakan jalan di sekitar mereka.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: "Sari Dewi",
                  role: "Warga Jakarta",
                  image: "SD",
                  testimonial:
                    "Platform yang sederhana dan mudah digunakan. Bisa upload foto dan isi detail lokasi dengan cepat.",
                  reports: "12 laporan",
                },
                {
                  name: "Ahmad Rahman",
                  role: "Driver Ojol",
                  image: "AR",
                  testimonial:
                    "Sebagai driver, penting untuk tahu kondisi jalan. Platform ini membantu mendokumentasikan kerusakan dengan mudah.",
                  reports: "28 laporan",
                },
                {
                  name: "Maya Sari",
                  role: "Ibu Rumah Tangga",
                  image: "MS",
                  testimonial:
                    "Interface yang simpel dan mudah dipahami. Bisa upload foto dan isi detail lokasi tanpa kesulitan.",
                  reports: "7 laporan",
                },
              ].map((testimonial, index) => (
                <Card
                  key={index}
                  className="bg-white border border-neutral-200 shadow-card hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-2"
                >
                  <CardContent className="p-10">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-lg font-semibold text-neutral-700">
                          {testimonial.image}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-neutral-900 text-xl">
                          {testimonial.name}
                        </div>
                        <div className="text-sm text-neutral-600">
                          {testimonial.role}
                        </div>
                      </div>
                    </div>

                    <p className="text-neutral-700 mb-8 leading-relaxed text-lg">
                      &ldquo;{testimonial.testimonial}&rdquo;
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="h-4 w-4 fill-neutral-300 text-neutral-300"
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

        {/* Why Choose Us - Simple features */}
        <section className="py-24 bg-neutral-50">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-24 items-center">
              <div className="space-y-12">
                <div>
                  <Badge
                    variant="secondary"
                    className="bg-neutral-100 text-neutral-700 border-0 mb-6 px-4 py-2"
                  >
                    Keunggulan Platform
                  </Badge>
                  <h2 className="text-display-md font-bold text-neutral-900 mb-6 leading-tight">
                    Sederhana dan Mudah Digunakan
                  </h2>
                  <p className="text-xl text-neutral-600 leading-relaxed">
                    Platform dokumentasi infrastruktur yang dirancang untuk
                    kemudahan penggunaan. Upload foto, isi detail, dan bagikan
                    informasi dengan cepat.
                  </p>
                </div>

                <div className="space-y-10">
                  {[
                    {
                      icon: Heart,
                      title: "Ramah Pengguna",
                      description:
                        "Interface yang sederhana dan mudah dipahami oleh semua kalangan",
                    },
                    {
                      icon: Shield,
                      title: "Akses Terbuka",
                      description:
                        "Platform dapat diakses oleh semua warga tanpa batasan",
                    },
                    {
                      icon: Zap,
                      title: "Cepat dan Mudah",
                      description:
                        "Proses upload foto dan pengisian detail yang cepat",
                    },
                  ].map((feature, index) => (
                    <div key={index} className="flex gap-8">
                      <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                        <feature.icon className="h-8 w-8 text-neutral-800" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-900 mb-3 text-xl">
                          {feature.title}
                        </h3>
                        <p className="text-neutral-600 leading-relaxed text-lg">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Card className="bg-gradient-to-br from-neutral-50 to-neutral-100 border border-neutral-200 shadow-xl">
                <CardContent className="p-12 text-center">
                  <div className="w-24 h-24 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-10 shadow-xl">
                    <Users className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-display-sm font-bold text-neutral-900 mb-8">
                    Bergabung dengan Komunitas
                  </h3>
                  <p className="text-neutral-700 mb-10 leading-relaxed text-xl">
                    Ribuan warga Indonesia sudah menggunakan platform ini untuk
                    mendokumentasikan kerusakan jalan. Mulai berkontribusi
                    sekarang.
                  </p>
                  <Button
                    className="bg-neutral-800 hover:bg-neutral-900 text-white shadow-button hover:shadow-button-hover transition-all duration-200 px-8 py-4 text-lg"
                    asChild
                  >
                    <Link href="/laporan/buat">
                      <ArrowRight className="mr-3 h-5 w-5" />
                      Mulai Upload Foto
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section - Simple call-to-action */}
        <section className="py-24 bg-neutral-900">
          <div className="container mx-auto px-6 text-center">
            <div className="max-w-4xl mx-auto space-y-12">
              <h2 className="text-display-md lg:text-display-lg font-bold text-white leading-tight">
                Mulai Dokumentasi Sekarang.{" "}
                <span className="text-neutral-400">
                  Platform sederhana untuk semua.
                </span>
              </h2>

              <p className="text-xl text-neutral-300 leading-relaxed">
                Bergabunglah dengan ribuan warga Indonesia yang sudah
                mendokumentasikan kerusakan jalan. Upload foto, isi detail, dan
                bagikan informasi dengan mudah.
              </p>

              <Button
                size="lg"
                className="bg-neutral-800 hover:bg-neutral-900 text-white shadow-button hover:shadow-button-hover transition-all duration-200 px-10 py-6 text-xl"
                asChild
              >
                <Link href="/laporan/buat">
                  <Camera className="mr-3 h-6 w-6" />
                  Upload Foto Sekarang
                </Link>
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
