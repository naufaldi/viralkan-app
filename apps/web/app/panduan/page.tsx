import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card } from "@repo/ui";
import {
  BookOpen,
  Camera,
  MapPin,
  Upload,
  Edit3,
  Send,
  Users,
  Share2,
  CheckCircle,
  AlertCircle,
  Smartphone,
  Globe,
  Eye,
  Settings,
  ArrowRight,
} from "lucide-react";

export default function Panduan() {
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
                <BookOpen className="h-6 w-6 text-neutral-600" />
              </div>
            </div>
            <h1 className="mb-4 text-4xl font-bold text-neutral-900">
              Panduan Penggunaan
            </h1>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-neutral-600">
              Pelajari cara membuat laporan kerusakan jalan yang efektif dan
              membantu komunitas dengan platform Viralkan.
            </p>
          </div>

          {/* Content Sections */}
          <div className="mx-auto max-w-4xl space-y-12">
            {/* Quick Start Guide */}
            <Card className="p-8">
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100">
                  <Settings className="h-5 w-5 text-neutral-600" />
                </div>
                <div>
                  <h2 className="mb-6 text-2xl font-semibold text-neutral-900">
                    Mulai Cepat
                  </h2>

                  <div className="mb-6 grid gap-6 md:grid-cols-3">
                    <div className="p-4 text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-neutral-100">
                        <Users className="h-8 w-8 text-neutral-600" />
                      </div>
                      <h3 className="mb-2 font-semibold text-neutral-900">
                        1. Masuk Akun
                      </h3>
                      <p className="text-sm text-neutral-600">
                        Login dengan akun Google untuk mulai membuat laporan
                      </p>
                    </div>

                    <div className="p-4 text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-neutral-100">
                        <Camera className="h-8 w-8 text-neutral-600" />
                      </div>
                      <h3 className="mb-2 font-semibold text-neutral-900">
                        2. Foto Jalan
                      </h3>
                      <p className="text-sm text-neutral-600">
                        Ambil foto kerusakan jalan dengan jelas dan detail
                      </p>
                    </div>

                    <div className="p-4 text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-neutral-100">
                        <Send className="h-8 w-8 text-neutral-600" />
                      </div>
                      <h3 className="mb-2 font-semibold text-neutral-900">
                        3. Kirim Laporan
                      </h3>
                      <p className="text-sm text-neutral-600">
                        Isi detail dan kirim laporan untuk dibagikan ke publik
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
                    <h4 className="mb-2 font-medium text-blue-900">
                      Tips Awal
                    </h4>
                    <p className="text-sm text-blue-800">
                      Pastikan GPS ponsel aktif saat mengambil foto. Ini akan
                      membantu sistem mengisi informasi lokasi secara otomatis
                      dan mempercepat proses pelaporan.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Step by Step Guide */}
            <Card className="p-8">
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100">
                  <Edit3 className="h-5 w-5 text-neutral-600" />
                </div>
                <div className="w-full">
                  <h2 className="mb-8 text-2xl font-semibold text-neutral-900">
                    Langkah Demi Langkah
                  </h2>

                  <div className="space-y-8">
                    {/* Step 1: Image Upload */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white">
                          1
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="mb-3 flex items-center gap-2">
                          <Upload className="h-5 w-5 text-neutral-600" />
                          <h3 className="text-lg font-semibold text-neutral-900">
                            Unggah Foto
                          </h3>
                        </div>
                        <div className="space-y-4">
                          <p className="leading-relaxed text-neutral-600">
                            Mulai dengan mengunggah foto kerusakan jalan. Sistem
                            akan menganalisis foto dan mengekstrak informasi
                            lokasi GPS jika tersedia.
                          </p>

                          <div className="rounded-lg bg-neutral-50 p-4">
                            <h4 className="mb-2 font-medium text-neutral-900">
                              Persyaratan Foto:
                            </h4>
                            <ul className="space-y-1 text-sm text-neutral-600">
                              <li>• Format: JPEG atau PNG</li>
                              <li>• Ukuran maksimal: 10 MB</li>
                              <li>• Pastikan kerusakan terlihat jelas</li>
                              <li>• Aktifkan GPS saat mengambil foto</li>
                            </ul>
                          </div>

                          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                            <div className="flex items-start gap-2">
                              <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                              <div>
                                <h4 className="mb-1 font-medium text-green-900">
                                  Pro Tip
                                </h4>
                                <p className="text-sm text-green-800">
                                  Foto yang diambil dengan GPS akan otomatis
                                  mengisi koordinat lokasi, mempercepat proses
                                  pengisian formulir.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 2: Form Activation */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white">
                          2
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="mb-3 flex items-center gap-2">
                          <Edit3 className="h-5 w-5 text-neutral-600" />
                          <h3 className="text-lg font-semibold text-neutral-900">
                            Formulir Teraktivasi
                          </h3>
                        </div>
                        <div className="space-y-4">
                          <p className="leading-relaxed text-neutral-600">
                            Setelah foto berhasil diunggah, formulir detail
                            laporan akan aktif. Sistem akan menampilkan
                            peringatan jika foto tidak memiliki data GPS.
                          </p>

                          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600" />
                              <div>
                                <h4 className="mb-1 font-medium text-yellow-900">
                                  Peringatan EXIF
                                </h4>
                                <p className="text-sm text-yellow-800">
                                  Jika muncul peringatan "GPS metadata tidak
                                  ditemukan", Anda perlu mengisi lokasi secara
                                  manual atau menggunakan tombol "Dapatkan
                                  Lokasi Saya".
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 3: Fill Details */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white">
                          3
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="mb-3 flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-neutral-600" />
                          <h3 className="text-lg font-semibold text-neutral-900">
                            Isi Detail Laporan
                          </h3>
                        </div>
                        <div className="space-y-4">
                          <p className="leading-relaxed text-neutral-600">
                            Lengkapi informasi laporan dengan mengisi formulir
                            yang tersedia.
                          </p>

                          <div className="space-y-4">
                            <div className="rounded-lg bg-neutral-50 p-4">
                              <h4 className="mb-3 font-medium text-neutral-900">
                                Field Wajib:
                              </h4>
                              <div className="grid gap-4 text-sm md:grid-cols-2">
                                <div>
                                  <h5 className="mb-1 font-medium text-neutral-800">
                                    Kategori Kerusakan
                                  </h5>
                                  <p className="text-neutral-600">
                                    Pilih: Berlubang, Retak, atau Lainnya
                                  </p>
                                </div>
                                <div>
                                  <h5 className="mb-1 font-medium text-neutral-800">
                                    Nama Jalan
                                  </h5>
                                  <p className="text-neutral-600">
                                    Contoh: Jl. Ahmad Yani, Jl. Sudirman
                                  </p>
                                </div>
                                <div>
                                  <h5 className="mb-1 font-medium text-neutral-800">
                                    Koordinat
                                  </h5>
                                  <p className="text-neutral-600">
                                    Latitude dan Longitude (otomatis atau
                                    manual)
                                  </p>
                                </div>
                                <div>
                                  <h5 className="mb-1 font-medium text-neutral-800">
                                    Deskripsi Lokasi
                                  </h5>
                                  <p className="text-neutral-600">
                                    Detail tambahan lokasi kerusakan
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                              <h4 className="mb-2 font-medium text-blue-900">
                                Fitur Bantuan Lokasi:
                              </h4>
                              <ul className="space-y-1 text-sm text-blue-800">
                                <li>
                                  • <strong>Dapatkan Lokasi Saya:</strong>{" "}
                                  Otomatis isi koordinat GPS
                                </li>
                                <li>
                                  • <strong>Dapatkan Alamat:</strong> Konversi
                                  koordinat ke alamat
                                </li>
                                <li>
                                  • <strong>Dapatkan Koordinat:</strong>{" "}
                                  Konversi alamat ke koordinat
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 4: Submit */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white">
                          4
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="mb-3 flex items-center gap-2">
                          <Send className="h-5 w-5 text-neutral-600" />
                          <h3 className="text-lg font-semibold text-neutral-900">
                            Kirim Laporan
                          </h3>
                        </div>
                        <div className="space-y-4">
                          <p className="leading-relaxed text-neutral-600">
                            Setelah semua field terisi, tekan tombol "Kirim
                            Laporan" untuk mempublikasikan laporan Anda ke
                            platform komunitas.
                          </p>

                          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                            <h4 className="mb-2 font-medium text-green-900">
                              Setelah Dikirim:
                            </h4>
                            <ul className="space-y-1 text-sm text-green-800">
                              <li>
                                • Laporan langsung terlihat di halaman publik
                              </li>
                              <li>• Mendapat ID unik untuk tracking</li>
                              <li>• Dapat dibagikan ke media sosial</li>
                              <li>• Muncul di dashboard pribadi Anda</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Photo Guidelines */}
            <Card className="p-8">
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100">
                  <Camera className="h-5 w-5 text-neutral-600" />
                </div>
                <div>
                  <h2 className="mb-6 text-2xl font-semibold text-neutral-900">
                    Tips Foto yang Baik
                  </h2>

                  <div className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="rounded-lg border border-green-200 bg-green-50 p-6">
                        <h3 className="mb-3 font-semibold text-green-900">
                          ✓ Lakukan
                        </h3>
                        <ul className="space-y-2 text-green-800">
                          <li>• Foto dengan pencahayaan yang cukup</li>
                          <li>• Fokus pada area kerusakan</li>
                          <li>• Sertakan konteks jalan sekitar</li>
                          <li>• Aktifkan GPS saat mengambil foto</li>
                          <li>• Foto dari jarak yang aman</li>
                        </ul>
                      </div>

                      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
                        <h3 className="mb-3 font-semibold text-red-900">
                          ✗ Hindari
                        </h3>
                        <ul className="space-y-2 text-red-800">
                          <li>• Foto buram atau gelap</li>
                          <li>• Hanya fokus close-up tanpa konteks</li>
                          <li>• Mengambil foto sambil berkendara</li>
                          <li>• Foto yang mengandung informasi pribadi</li>
                          <li>• Screenshot atau foto dari aplikasi lain</li>
                        </ul>
                      </div>
                    </div>

                    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6">
                      <h4 className="mb-3 font-medium text-neutral-900">
                        Contoh Foto Ideal:
                      </h4>
                      <div className="grid gap-4 text-sm text-neutral-600 md:grid-cols-3">
                        <div>
                          <h5 className="mb-1 font-medium text-neutral-800">
                            Berlubang
                          </h5>
                          <p>
                            Tampilkan ukuran lubang dengan referensi objek di
                            sekitar
                          </p>
                        </div>
                        <div>
                          <h5 className="mb-1 font-medium text-neutral-800">
                            Retak
                          </h5>
                          <p>
                            Foto yang menunjukkan panjang dan lebar retakan
                            jalan
                          </p>
                        </div>
                        <div>
                          <h5 className="mb-1 font-medium text-neutral-800">
                            Kerusakan Lain
                          </h5>
                          <p>
                            Dokumentasi jelas dengan konteks lingkungan sekitar
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Platform Features */}
            <Card className="p-8">
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100">
                  <Smartphone className="h-5 w-5 text-neutral-600" />
                </div>
                <div>
                  <h2 className="mb-6 text-2xl font-semibold text-neutral-900">
                    Fitur Platform
                  </h2>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <h3 className="mb-3 font-semibold text-neutral-900">
                        Fitur Utama
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-neutral-200"></div>
                          <div>
                            <h4 className="font-medium text-neutral-900">
                              Auto-Extract GPS
                            </h4>
                            <p className="text-sm text-neutral-600">
                              Otomatis mengambil koordinat dari foto
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-neutral-200"></div>
                          <div>
                            <h4 className="font-medium text-neutral-900">
                              Geocoding
                            </h4>
                            <p className="text-sm text-neutral-600">
                              Konversi koordinat ke alamat dan sebaliknya
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-neutral-200"></div>
                          <div>
                            <h4 className="font-medium text-neutral-900">
                              Progressive Form
                            </h4>
                            <p className="text-sm text-neutral-600">
                              Formulir aktif setelah foto diunggah
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="mb-3 font-semibold text-neutral-900">
                        Akses Publik
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-neutral-200"></div>
                          <div>
                            <h4 className="font-medium text-neutral-900">
                              Laporan Publik
                            </h4>
                            <p className="text-sm text-neutral-600">
                              Semua dapat melihat laporan tanpa login
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-neutral-200"></div>
                          <div>
                            <h4 className="font-medium text-neutral-900">
                              Share ke Media Sosial
                            </h4>
                            <p className="text-sm text-neutral-600">
                              Mudah dibagikan untuk viral
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-neutral-200"></div>
                          <div>
                            <h4 className="font-medium text-neutral-900">
                              Dashboard Pribadi
                            </h4>
                            <p className="text-sm text-neutral-600">
                              Kelola laporan yang telah dibuat
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Troubleshooting */}
            <Card className="p-8">
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100">
                  <AlertCircle className="h-5 w-5 text-neutral-600" />
                </div>
                <div>
                  <h2 className="mb-6 text-2xl font-semibold text-neutral-900">
                    Pemecahan Masalah
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-4 font-semibold text-neutral-900">
                        Masalah Umum & Solusi
                      </h3>

                      <div className="space-y-4">
                        <div className="rounded-lg border border-neutral-200 p-4">
                          <h4 className="mb-2 font-medium text-neutral-900">
                            GPS tidak terdeteksi
                          </h4>
                          <p className="mb-2 text-sm text-neutral-600">
                            Foto tidak memiliki informasi GPS atau muncul
                            peringatan EXIF.
                          </p>
                          <div className="text-sm text-neutral-600">
                            <strong>Solusi:</strong>
                            <ul className="mt-1 ml-4 space-y-1">
                              <li>• Pastikan GPS/lokasi aktif di ponsel</li>
                              <li>• Gunakan tombol "Dapatkan Lokasi Saya"</li>
                              <li>• Isi koordinat secara manual</li>
                            </ul>
                          </div>
                        </div>

                        <div className="rounded-lg border border-neutral-200 p-4">
                          <h4 className="mb-2 font-medium text-neutral-900">
                            Upload foto gagal
                          </h4>
                          <p className="mb-2 text-sm text-neutral-600">
                            Foto tidak dapat diunggah atau proses terhenti.
                          </p>
                          <div className="text-sm text-neutral-600">
                            <strong>Solusi:</strong>
                            <ul className="mt-1 ml-4 space-y-1">
                              <li>• Periksa koneksi internet</li>
                              <li>• Pastikan ukuran foto di bawah 10 MB</li>
                              <li>• Gunakan format JPEG atau PNG</li>
                              <li>• Coba refresh halaman</li>
                            </ul>
                          </div>
                        </div>

                        <div className="rounded-lg border border-neutral-200 p-4">
                          <h4 className="mb-2 font-medium text-neutral-900">
                            Formulir tidak aktif
                          </h4>
                          <p className="mb-2 text-sm text-neutral-600">
                            Formulir tetap tidak bisa diisi setelah upload foto.
                          </p>
                          <div className="text-sm text-neutral-600">
                            <strong>Solusi:</strong>
                            <ul className="mt-1 ml-4 space-y-1">
                              <li>• Tunggu hingga proses upload selesai</li>
                              <li>• Periksa apakah muncul pesan error</li>
                              <li>• Coba hapus foto dan upload ulang</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
                      <h4 className="mb-2 font-medium text-blue-900">
                        Butuh Bantuan Lebih Lanjut?
                      </h4>
                      <p className="text-sm text-blue-800">
                        Jika masalah masih berlanjut, hubungi tim support
                        melalui email atau cek halaman privasi untuk informasi
                        kontak.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Call to Action */}
            <div className="py-12 text-center">
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-8">
                <h3 className="mb-4 text-xl font-semibold text-neutral-900">
                  Siap Membuat Laporan?
                </h3>
                <p className="mb-6 leading-relaxed text-neutral-600">
                  Dengan panduan ini, Anda sudah siap membuat laporan kerusakan
                  jalan yang efektif. Mari berkontribusi untuk komunitas dan
                  infrastruktur yang lebih baik.
                </p>
                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                  <a
                    href="/login"
                    className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-6 py-3 text-white transition-colors hover:bg-neutral-800"
                  >
                    Mulai Lapor Sekarang
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <a
                    href="/laporan"
                    className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-6 py-3 text-neutral-700 transition-colors hover:bg-neutral-50"
                  >
                    <Eye className="h-4 w-4" />
                    Lihat Laporan Lain
                  </a>
                </div>
                <p className="mt-4 text-sm text-neutral-500">
                  Platform komunitas untuk kemajuan infrastruktur Indonesia
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}
