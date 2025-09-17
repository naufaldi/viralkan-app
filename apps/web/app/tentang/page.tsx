import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card } from "@repo/ui";
import {
  Users,
  Target,
  Heart,
  MapPin,
  Shield,
  Zap,
  Share2,
  Eye,
} from "lucide-react";

export default function Tentang() {
  return (
    <>
      <div className="min-h-screen bg-white">
        {/* Header - Professional civic design */}
        <Header />

        {/* Main Content */}
        <main className="container mx-auto px-6 py-16">
          {/* Page Header */}
          <div className="mb-16 text-center">
            <div className="mb-6 inline-flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-100">
                <Users className="h-6 w-6 text-neutral-600" />
              </div>
            </div>
            <h1 className="mb-4 text-4xl font-bold text-neutral-900">
              Tentang Viralkan
            </h1>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-neutral-600">
              Platform komunitas independen yang membantu warga melaporkan dan
              menyebarkan informasi kerusakan jalan agar mendapat perhatian yang
              lebih luas.
            </p>
          </div>

          {/* Content Sections */}
          <div className="mx-auto max-w-4xl space-y-12">
            {/* Mission */}
            <Card className="p-8">
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100">
                  <Target className="h-5 w-5 text-neutral-600" />
                </div>
                <div>
                  <h2 className="mb-6 text-2xl font-semibold text-neutral-900">
                    Misi Kami
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-3 font-semibold text-neutral-900">
                        Tujuan Utama
                      </h3>
                      <ul className="ml-4 space-y-3 text-neutral-600">
                        <li className="flex items-start gap-3">
                          <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-neutral-200"></div>
                          <span>
                            Membantu warga menghindari jalan rusak dengan
                            berbagi informasi lokasi
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-neutral-200"></div>
                          <span>
                            Mendapat perhatian dari pemerintah melalui viral dan
                            tekanan komunitas
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-neutral-200"></div>
                          <span>
                            Meningkatkan kesadaran publik tentang masalah
                            infrastruktur
                          </span>
                        </li>
                      </ul>
                    </div>

                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
                      <h4 className="mb-2 font-medium text-blue-900">
                        Dampak yang Diharapkan
                      </h4>
                      <p className="text-sm text-blue-800">
                        Dengan menyentralisasi laporan yang sebelumnya tersebar
                        di WhatsApp dan media sosial, kami membantu masyarakat
                        agar laporan kerusakan jalan mendapat perhatian yang
                        lebih luas dan dapat disebarkan secara viral untuk
                        mendorong tindakan perbaikan.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* What We Are & What We Are Not */}
            <Card className="p-8">
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100">
                  <Shield className="h-5 w-5 text-neutral-600" />
                </div>
                <div className="w-full">
                  <h2 className="mb-6 text-2xl font-semibold text-neutral-900">
                    Posisi Platform
                  </h2>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-lg border border-green-200 bg-green-50 p-6">
                      <h3 className="mb-3 font-semibold text-green-900">
                        ✓ Apa itu Viralkan
                      </h3>
                      <ul className="space-y-2 text-green-800">
                        <li>• Platform berbagi informasi komunitas</li>
                        <li>• Alat bantu warga hindari jalan rusak</li>
                        <li>
                          • Cara memperkuat suara warga melalui viral media
                          sosial
                        </li>
                        <li>• Inisiatif civic engagement independen</li>
                      </ul>
                    </div>

                    <div className="rounded-lg border border-red-200 bg-red-50 p-6">
                      <h3 className="mb-3 font-semibold text-red-900">
                        ✗ Bukan Viralkan
                      </h3>
                      <ul className="space-y-2 text-red-800">
                        <li>• Sistem pelaporan resmi pemerintah</li>
                        <li>• Saluran komunikasi langsung dengan otoritas</li>
                        <li>• Platform yang melacak progress perbaikan</li>
                        <li>• Layanan yang menjamin respons pemerintah</li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                    <p className="text-sm text-neutral-700">
                      <strong>Catatan Penting:</strong> Viralkan adalah platform
                      komunitas independen yang tidak memiliki afiliasi atau
                      kerjasama langsung dengan pemerintah. Kami membantu
                      masyarakat menyebarkan informasi agar mendapat perhatian
                      publik.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* How It Works */}
            <Card className="p-8">
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100">
                  <Zap className="h-5 w-5 text-neutral-600" />
                </div>
                <div>
                  <h2 className="mb-6 text-2xl font-semibold text-neutral-900">
                    Cara Kerja Platform
                  </h2>

                  <div className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-3">
                      <div className="p-4 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-neutral-100">
                          <MapPin className="h-8 w-8 text-neutral-600" />
                        </div>
                        <h3 className="mb-2 font-semibold text-neutral-900">
                          1. Laporkan
                        </h3>
                        <p className="text-sm text-neutral-600">
                          Foto kerusakan jalan dan isi detail lokasi dengan
                          mudah
                        </p>
                      </div>

                      <div className="p-4 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-neutral-100">
                          <Share2 className="h-8 w-8 text-neutral-600" />
                        </div>
                        <h3 className="mb-2 font-semibold text-neutral-900">
                          2. Sebarkan
                        </h3>
                        <p className="text-sm text-neutral-600">
                          Laporan dapat dilihat publik dan dibagikan ke media
                          sosial
                        </p>
                      </div>

                      <div className="p-4 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-neutral-100">
                          <Eye className="h-8 w-8 text-neutral-600" />
                        </div>
                        <h3 className="mb-2 font-semibold text-neutral-900">
                          3. Perhatian
                        </h3>
                        <p className="text-sm text-neutral-600">
                          Viral dan awareness mendorong perhatian dari berbagai
                          pihak
                        </p>
                      </div>
                    </div>

                    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6">
                      <h4 className="mb-2 font-medium text-neutral-900">
                        Filosofi Platform
                      </h4>
                      <p className="text-sm leading-relaxed text-neutral-700">
                        Kami percaya bahwa informasi yang tersebar luas akan
                        mendapat perhatian yang lebih besar. Dengan mengumpulkan
                        laporan yang sebelumnya terpencar di WhatsApp dan media
                        sosial, kami membantu menciptakan tekanan publik yang
                        konstruktif untuk perbaikan infrastruktur.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Technology & Values */}
            <Card className="p-8">
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100">
                  <Heart className="h-5 w-5 text-neutral-600" />
                </div>
                <div>
                  <h2 className="mb-6 text-2xl font-semibold text-neutral-900">
                    Nilai & Teknologi
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-3 font-semibold text-neutral-900">
                        Nilai-Nilai Kami
                      </h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-lg bg-neutral-50 p-4">
                          <h4 className="mb-2 font-medium text-neutral-900">
                            Transparansi
                          </h4>
                          <p className="text-sm text-neutral-600">
                            Semua laporan bersifat publik dan dapat diakses
                            siapa saja
                          </p>
                        </div>
                        <div className="rounded-lg bg-neutral-50 p-4">
                          <h4 className="mb-2 font-medium text-neutral-900">
                            Independensi
                          </h4>
                          <p className="text-sm text-neutral-600">
                            Tidak berafiliasi dengan pemerintah atau partai
                            politik
                          </p>
                        </div>
                        <div className="rounded-lg bg-neutral-50 p-4">
                          <h4 className="mb-2 font-medium text-neutral-900">
                            Komunitas
                          </h4>
                          <p className="text-sm text-neutral-600">
                            Dibangun oleh dan untuk masyarakat
                          </p>
                        </div>
                        <div className="rounded-lg bg-neutral-50 p-4">
                          <h4 className="mb-2 font-medium text-neutral-900">
                            Aksesibilitas
                          </h4>
                          <p className="text-sm text-neutral-600">
                            Mudah digunakan untuk semua kalangan
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="mb-3 font-semibold text-neutral-900">
                        Teknologi Terbuka
                      </h3>
                      <p className="mb-4 leading-relaxed text-neutral-600">
                        Platform ini dibangun menggunakan teknologi web modern
                        dan open source. Kami berkomitmen pada keamanan data,
                        kecepatan akses, dan kemudahan penggunaan.
                      </p>
                      <div className="flex flex-wrap gap-2 text-sm">
                        <span className="rounded-full bg-neutral-100 px-3 py-1 text-neutral-700">
                          React
                        </span>
                        <span className="rounded-full bg-neutral-100 px-3 py-1 text-neutral-700">
                          Next.js
                        </span>
                        <span className="rounded-full bg-neutral-100 px-3 py-1 text-neutral-700">
                          PostgreSQL
                        </span>
                        <span className="rounded-full bg-neutral-100 px-3 py-1 text-neutral-700">
                          Firebase Auth
                        </span>
                        <span className="rounded-full bg-neutral-100 px-3 py-1 text-neutral-700">
                          Cloudflare
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Success Metrics */}
            <Card className="p-8">
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100">
                  <Target className="h-5 w-5 text-neutral-600" />
                </div>
                <div>
                  <h2 className="mb-6 text-2xl font-semibold text-neutral-900">
                    Ukuran Keberhasilan
                  </h2>

                  <div className="space-y-6">
                    <p className="leading-relaxed text-neutral-600">
                      Keberhasilan platform Viralkan diukur berdasarkan dampak
                      nyata untuk masyarakat:
                    </p>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <h3 className="mb-3 font-semibold text-neutral-900">
                          Indikator Keberhasilan
                        </h3>
                        <ul className="space-y-2 text-neutral-600">
                          <li>• Adopsi dan partisipasi aktif masyarakat</li>
                          <li>• Viral dan sharing laporan di media sosial</li>
                          <li>• Warga berhasil menghindari jalan rusak</li>
                          <li>• Peningkatan kesadaran publik</li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="mb-3 font-semibold text-neutral-900">
                          Dampak Jangka Panjang
                        </h3>
                        <ul className="space-y-2 text-neutral-600">
                          <li>• Tekanan organik pada pemerintah</li>
                          <li>• Hemat biaya perbaikan kendaraan warga</li>
                          <li>• Meningkatnya civic engagement</li>
                          <li>• Data infrastruktur yang terstruktur</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Call to Action */}
          <div className="mt-16 py-12 text-center">
            <div className="mx-auto max-w-2xl rounded-lg border border-neutral-200 bg-neutral-50 p-8">
              <h3 className="mb-4 text-xl font-semibold text-neutral-900">
                Bergabunglah dengan Komunitas
              </h3>
              <p className="mb-6 leading-relaxed text-neutral-600">
                Viralkan adalah platform untuk kita semua. Mari bersama-sama
                membangun kesadaran tentang kondisi infrastruktur jalan dan
                membantu sesama warga menghindari kerusakan yang dapat
                merugikan.
              </p>
              <p className="text-sm text-neutral-500">
                Dibuat dengan ❤️ untuk kemajuan infrastruktur Indonesia
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}
