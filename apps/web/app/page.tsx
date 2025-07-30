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
        <section className="bg-gradient-to-br from-neutral-50 to-white py-24 lg:py-32">
          <div className="container mx-auto px-6">
            <div className="grid items-center gap-24 lg:grid-cols-2">
              {/* Left Content - Luxury typography and spacing */}
              <div className="space-y-12">
                <div className="space-y-6">
                  <Badge
                    variant="secondary"
                    className="border-0 bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-700"
                  >
                    <span className="mr-2">🇮🇩</span>
                    Platform Komunitas Indonesia
                  </Badge>

                  <div className="space-y-8">
                    <h1 className="text-display-xl lg:text-display-2xl leading-tight font-bold tracking-tight text-neutral-900">
                      Laporkan Kerusakan Jalan{" "}
                      <span className="block text-neutral-700">dengan</span>
                      <span className="block text-neutral-800">Sederhana</span>
                    </h1>

                    <p className="max-w-lg text-xl leading-relaxed text-neutral-600">
                      Unggah foto, isi detail lokasi, dan bagikan informasi
                      kerusakan jalan di seluruh Indonesia. Platform sederhana
                      untuk dokumentasi infrastruktur yang dapat diakses semua
                      warga.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-6 sm:flex-row">
                  <Button
                    size="lg"
                    className="shadow-button hover:shadow-button-hover bg-neutral-800 px-8 py-4 text-lg text-white transition-all duration-200 hover:bg-neutral-900"
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
                    className="border-neutral-300 px-8 py-4 text-lg text-neutral-700 transition-all duration-200 hover:border-neutral-400 hover:bg-neutral-50"
                    asChild
                  >
                    <Link href="/laporan">
                      <MessageSquare className="mr-3 h-5 w-5" />
                      Lihat Laporan
                    </Link>
                  </Button>
                </div>

                {/* Trust indicators - Simple and honest */}
                <div className="flex items-center gap-8 border-t border-neutral-200 pt-8">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-neutral-800"></div>
                    <span className="text-sm text-neutral-600">
                      Upload Foto Sederhana
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-neutral-800"></div>
                    <span className="text-sm text-neutral-600">
                      Lokasi Manual
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-neutral-800"></div>
                    <span className="text-sm text-neutral-600">
                      Akses Terbuka
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Content - Simple app preview */}
              <div className="relative">
                <div className="absolute -inset-4 rounded-2xl bg-gradient-to-r from-neutral-100 to-neutral-200 opacity-50 blur-xl"></div>
                <Card className="relative transform border border-neutral-200 bg-white shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
                  <CardContent className="p-10">
                    <div className="space-y-8">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-3 w-3 rounded-full bg-neutral-400"></div>
                          <div className="h-3 w-3 rounded-full bg-neutral-300"></div>
                          <div className="h-3 w-3 rounded-full bg-neutral-500"></div>
                        </div>
                        <Badge className="bg-neutral-800 text-xs text-white">
                          DRAFT
                        </Badge>
                      </div>

                      <div>
                        <h3 className="mb-2 text-xl font-semibold text-neutral-900">
                          Laporan Kerusakan Jalan
                        </h3>
                        <p className="flex items-center gap-1 text-sm text-neutral-600">
                          <MapPin className="h-3 w-3" />
                          Jl. Sudirman, Jakarta Pusat
                        </p>
                      </div>

                      <div className="flex h-52 items-center justify-center rounded-xl border border-neutral-200 bg-gradient-to-br from-neutral-50 to-neutral-100 p-8">
                        <div className="space-y-4 text-center">
                          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-neutral-800 shadow-lg">
                            <Camera className="h-8 w-8 text-white" />
                          </div>
                          <p className="text-sm font-medium text-neutral-700">
                            Upload Foto Jalan Rusak
                          </p>
                          <p className="text-xs text-neutral-500">
                            Drag & drop atau klik untuk pilih
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <Button className="shadow-button hover:shadow-button-hover flex-1 bg-neutral-800 text-white transition-all duration-200 hover:bg-neutral-900">
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
        <section className="bg-white py-24">
          <div className="container mx-auto px-6">
            <div className="mb-16 text-center">
              <h2 className="text-display-md mb-4 font-bold text-neutral-900">
                Platform Sederhana untuk Dokumentasi
              </h2>
              <p className="mx-auto max-w-2xl text-xl text-neutral-600">
                Unggah foto, isi detail, dan bagikan informasi kerusakan jalan
                dengan mudah dan cepat.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
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
                  className="shadow-card hover:shadow-card-hover transform border border-neutral-200 bg-white text-center transition-all duration-300 hover:-translate-y-1"
                >
                  <CardContent className="py-12">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 shadow-sm">
                      <stat.icon className="h-8 w-8 text-neutral-800" />
                    </div>
                    <div className="text-display-md mb-3 font-bold text-neutral-900">
                      {stat.number}
                    </div>
                    <p className="mb-2 text-lg font-medium text-neutral-600">
                      {stat.label}
                    </p>
                    <p className="text-sm text-neutral-500">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section - Simple process */}
        <section id="how-it-works" className="bg-neutral-50 py-24">
          <div className="container mx-auto px-6">
            <div className="grid items-center gap-24 lg:grid-cols-2">
              <div className="space-y-12">
                <div className="space-y-6">
                  <Badge
                    variant="secondary"
                    className="border-0 bg-neutral-100 px-4 py-2 text-neutral-700"
                  >
                    Cara Kerja
                  </Badge>
                  <h2 className="text-display-md leading-tight font-bold text-neutral-900">
                    Proses Sederhana dalam 3 Langkah
                  </h2>
                  <p className="text-xl leading-relaxed text-neutral-600">
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
                        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-neutral-800 shadow-lg">
                          <step.icon className="h-8 w-8 text-white" />
                        </div>
                        <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-neutral-100">
                          <span className="text-xs font-bold text-neutral-800">
                            {step.step}
                          </span>
                        </div>
                      </div>
                      <div>
                        <h3 className="mb-3 text-xl font-semibold text-neutral-900">
                          {step.title}
                        </h3>
                        <p className="text-lg leading-relaxed text-neutral-600">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-6">
                <Card className="shadow-card hover:shadow-card-hover transform border border-neutral-200 transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-8">
                    <div className="mb-6 flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 shadow-sm">
                        <div className="h-5 w-5 rounded-full bg-neutral-600"></div>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-neutral-900">
                          Lubang Besar - Jl. Gatot Subroto
                        </span>
                        <p className="mt-1 text-xs text-neutral-500">
                          Dilaporkan oleh warga
                        </p>
                      </div>
                    </div>
                    <div className="mb-4 h-32 rounded-xl bg-neutral-100"></div>
                    <p className="text-xs text-neutral-600">
                      Dilaporkan 2 jam yang lalu • Foto dokumentasi
                    </p>
                  </CardContent>
                </Card>

                <Card className="shadow-card hover:shadow-card-hover transform border border-neutral-200 transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-8">
                    <div className="mb-6 flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 shadow-sm">
                        <div className="h-5 w-5 rounded-full bg-neutral-500"></div>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-neutral-900">
                          Retak Permukaan - Jl. Sudirman
                        </span>
                        <p className="mt-1 text-xs text-neutral-500">
                          Dilaporkan oleh warga
                        </p>
                      </div>
                    </div>
                    <div className="mb-4 h-32 rounded-xl bg-neutral-100"></div>
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
        <section id="community" className="bg-white py-24">
          <div className="container mx-auto px-6">
            <div className="mb-20 text-center">
              <Badge
                variant="secondary"
                className="mb-6 border-0 bg-neutral-100 px-4 py-2 text-neutral-700"
              >
                Dipercaya Warga
              </Badge>
              <h2 className="text-display-md mb-6 font-bold text-neutral-900">
                Platform Sederhana untuk Semua
              </h2>
              <p className="mx-auto max-w-3xl text-xl leading-relaxed text-neutral-600">
                Ribuan warga Indonesia sudah menggunakan platform ini untuk
                mendokumentasikan kerusakan jalan di sekitar mereka.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
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
                  className="shadow-card hover:shadow-card-hover transform border border-neutral-200 bg-white transition-all duration-300 hover:-translate-y-2"
                >
                  <CardContent className="p-10">
                    <div className="mb-8 flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 shadow-sm">
                        <span className="text-lg font-semibold text-neutral-700">
                          {testimonial.image}
                        </span>
                      </div>
                      <div>
                        <div className="text-xl font-semibold text-neutral-900">
                          {testimonial.name}
                        </div>
                        <div className="text-sm text-neutral-600">
                          {testimonial.role}
                        </div>
                      </div>
                    </div>

                    <p className="mb-8 text-lg leading-relaxed text-neutral-700">
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
        <section className="bg-neutral-50 py-24">
          <div className="container mx-auto px-6">
            <div className="grid items-center gap-24 lg:grid-cols-2">
              <div className="space-y-12">
                <div>
                  <Badge
                    variant="secondary"
                    className="mb-6 border-0 bg-neutral-100 px-4 py-2 text-neutral-700"
                  >
                    Keunggulan Platform
                  </Badge>
                  <h2 className="text-display-md mb-6 leading-tight font-bold text-neutral-900">
                    Sederhana dan Mudah Digunakan
                  </h2>
                  <p className="text-xl leading-relaxed text-neutral-600">
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
                      <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-neutral-100 shadow-sm">
                        <feature.icon className="h-8 w-8 text-neutral-800" />
                      </div>
                      <div>
                        <h3 className="mb-3 text-xl font-semibold text-neutral-900">
                          {feature.title}
                        </h3>
                        <p className="text-lg leading-relaxed text-neutral-600">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Card className="border border-neutral-200 bg-gradient-to-br from-neutral-50 to-neutral-100 shadow-xl">
                <CardContent className="p-12 text-center">
                  <div className="mx-auto mb-10 flex h-24 w-24 items-center justify-center rounded-full bg-neutral-800 shadow-xl">
                    <Users className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-display-sm mb-8 font-bold text-neutral-900">
                    Bergabung dengan Komunitas
                  </h3>
                  <p className="mb-10 text-xl leading-relaxed text-neutral-700">
                    Ribuan warga Indonesia sudah menggunakan platform ini untuk
                    mendokumentasikan kerusakan jalan. Mulai berkontribusi
                    sekarang.
                  </p>
                  <Button
                    className="shadow-button hover:shadow-button-hover bg-neutral-800 px-8 py-4 text-lg text-white transition-all duration-200 hover:bg-neutral-900"
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
        <section className="bg-neutral-900 py-24">
          <div className="container mx-auto px-6 text-center">
            <div className="mx-auto max-w-4xl space-y-12">
              <h2 className="text-display-md lg:text-display-lg leading-tight font-bold text-white">
                Mulai Dokumentasi Sekarang.{" "}
                <span className="text-neutral-400">
                  Platform sederhana untuk semua.
                </span>
              </h2>

              <p className="text-xl leading-relaxed text-neutral-300">
                Bergabunglah dengan ribuan warga Indonesia yang sudah
                mendokumentasikan kerusakan jalan. Upload foto, isi detail, dan
                bagikan informasi dengan mudah.
              </p>

              <Button
                size="lg"
                className="shadow-button hover:shadow-button-hover bg-neutral-800 px-10 py-6 text-xl text-white transition-all duration-200 hover:bg-neutral-900"
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
