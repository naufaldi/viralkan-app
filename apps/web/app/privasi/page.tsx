import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card } from "@repo/ui";
import {
  Shield,
  Eye,
  Lock,
  Users,
  FileText,
  Mail,
  Calendar,
} from "lucide-react";

export default function Privasi() {
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
                <Shield className="h-6 w-6 text-neutral-600" />
              </div>
            </div>
            <h1 className="mb-4 text-4xl font-bold text-neutral-900">
              Kebijakan Privasi
            </h1>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-neutral-600">
              Kami berkomitmen melindungi privasi dan keamanan data pengguna
              platform komunitas Viralkan. Kebijakan ini menjelaskan bagaimana
              kami mengumpulkan, menggunakan, dan melindungi informasi Anda.
            </p>
            <p className="mt-4 text-sm text-neutral-500">
              Terakhir diperbarui: 31 Juli 2025
            </p>
          </div>

          {/* Content Sections */}
          <div className="mx-auto max-w-4xl space-y-12">
            {/* Introduction */}
            <Card className="p-8">
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100">
                  <Users className="h-5 w-5 text-neutral-600" />
                </div>
                <div>
                  <h2 className="mb-3 text-2xl font-semibold text-neutral-900">
                    Tentang Platform Viralkan
                  </h2>
                  <div className="prose prose-neutral max-w-none">
                    <p className="mb-4 leading-relaxed text-neutral-600">
                      Viralkan adalah platform komunitas independen yang
                      memungkinkan warga melaporkan dan menyebarkan informasi
                      kerusakan jalan di Indonesia. Tujuan kami adalah membantu
                      masyarakat agar laporan kerusakan jalan mendapat perhatian
                      yang lebih luas.
                    </p>
                    <p className="leading-relaxed text-neutral-600">
                      Platform ini mengumpulkan laporan yang sebelumnya tersebar
                      di WhatsApp dan media sosial, kemudian menyentralisasinya
                      agar lebih mudah disebarkan dan mendapat perhatian dari
                      masyarakat luas, termasuk pemerintah.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Data Collection */}
            <Card className="p-8">
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100">
                  <Eye className="h-5 w-5 text-neutral-600" />
                </div>
                <div className="w-full">
                  <h2 className="mb-6 text-2xl font-semibold text-neutral-900">
                    Data yang Kami Kumpulkan
                  </h2>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-lg bg-neutral-50 p-6">
                      <h3 className="mb-3 font-semibold text-neutral-900">
                        Data Pribadi
                      </h3>
                      <ul className="space-y-2 text-neutral-600">
                        <li>• Nama lengkap (dari akun Google)</li>
                        <li>• Alamat email</li>
                        <li>• Foto profil (opsional)</li>
                        <li>• Provider autentikasi (Google)</li>
                      </ul>
                    </div>

                    <div className="rounded-lg bg-neutral-50 p-6">
                      <h3 className="mb-3 font-semibold text-neutral-900">
                        Data Laporan
                      </h3>
                      <ul className="space-y-2 text-neutral-600">
                        <li>• Foto kerusakan jalan</li>
                        <li>• Lokasi (nama jalan, koordinat)</li>
                        <li>• Kategori kerusakan</li>
                        <li>• Waktu pelaporan</li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Catatan:</strong> Kami hanya mengumpulkan data
                      yang diperlukan untuk fungsi platform dan tidak mengakses
                      informasi pribadi lainnya dari akun Google Anda.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Data Usage */}
            <Card className="p-8">
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100">
                  <FileText className="h-5 w-5 text-neutral-600" />
                </div>
                <div>
                  <h2 className="mb-6 text-2xl font-semibold text-neutral-900">
                    Penggunaan Data
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-3 font-semibold text-neutral-900">
                        Tujuan Utama
                      </h3>
                      <ul className="ml-4 space-y-2 text-neutral-600">
                        <li>
                          • Menyebarkan laporan kerusakan jalan agar mendapat
                          perhatian lebih luas
                        </li>
                        <li>
                          • Memungkinkan masyarakat melihat kondisi jalan di
                          berbagai lokasi
                        </li>
                        <li>
                          • Memfasilitasi sharing informasi kerusakan jalan
                          antar warga
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="mb-3 font-semibold text-neutral-900">
                        Tujuan Pendukung
                      </h3>
                      <ul className="ml-4 space-y-2 text-neutral-600">
                        <li>
                          • Meningkatkan kualitas platform berdasarkan feedback
                          pengguna
                        </li>
                        <li>
                          • Analisis statistik untuk tren kerusakan jalan (data
                          anonim)
                        </li>
                        <li>
                          • Moderasi konten untuk menjaga kualitas laporan
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Data Sharing */}
            <Card className="p-8">
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100">
                  <Users className="h-5 w-5 text-neutral-600" />
                </div>
                <div>
                  <h2 className="mb-6 text-2xl font-semibold text-neutral-900">
                    Berbagi Data
                  </h2>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-lg border border-green-200 bg-green-50 p-6">
                      <h3 className="mb-3 font-semibold text-green-900">
                        ✓ Data yang Bersifat Publik
                      </h3>
                      <ul className="space-y-2 text-green-800">
                        <li>
                          • Foto kerusakan jalan (untuk tujuan viral/penyebaran)
                        </li>
                        <li>• Lokasi kerusakan (nama jalan)</li>
                        <li>• Kategori kerusakan</li>
                        <li>• Waktu laporan dibuat</li>
                      </ul>
                    </div>

                    <div className="rounded-lg border border-red-200 bg-red-50 p-6">
                      <h3 className="mb-3 font-semibold text-red-900">
                        ✗ Kami Tidak Berbagi
                      </h3>
                      <ul className="space-y-2 text-red-800">
                        <li>• Data pribadi pengguna</li>
                        <li>• Email atau informasi kontak</li>
                        <li>• Data dengan perusahaan komersial</li>
                        <li>• Data untuk tujuan iklan atau profit</li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                    <p className="text-sm text-neutral-700">
                      <strong>Transparansi:</strong> Semua laporan yang Anda
                      buat bersifat publik dan dapat dilihat oleh pengguna lain
                      untuk membantu penyebaran informasi kerusakan jalan.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* User Rights */}
            <Card className="p-8">
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100">
                  <Shield className="h-5 w-5 text-neutral-600" />
                </div>
                <div>
                  <h2 className="mb-6 text-2xl font-semibold text-neutral-900">
                    Hak-Hak Pengguna
                  </h2>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-neutral-200"></div>
                        <div>
                          <h4 className="font-medium text-neutral-900">
                            Akses Data
                          </h4>
                          <p className="text-sm text-neutral-600">
                            Melihat semua data pribadi yang kami simpan
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-neutral-200"></div>
                        <div>
                          <h4 className="font-medium text-neutral-900">
                            Koreksi Data
                          </h4>
                          <p className="text-sm text-neutral-600">
                            Memperbarui informasi yang tidak akurat
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-neutral-200"></div>
                        <div>
                          <h4 className="font-medium text-neutral-900">
                            Hapus Akun
                          </h4>
                          <p className="text-sm text-neutral-600">
                            Menghapus akun dan data pribadi
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-neutral-200"></div>
                        <div>
                          <h4 className="font-medium text-neutral-900">
                            Unduh Data
                          </h4>
                          <p className="text-sm text-neutral-600">
                            Mendapatkan salinan data dalam format portabel
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-neutral-200"></div>
                        <div>
                          <h4 className="font-medium text-neutral-900">
                            Keberatan
                          </h4>
                          <p className="text-sm text-neutral-600">
                            Mengajukan keberatan atas pemrosesan data
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-neutral-200"></div>
                        <div>
                          <h4 className="font-medium text-neutral-900">
                            Pembatasan
                          </h4>
                          <p className="text-sm text-neutral-600">
                            Membatasi pemrosesan data tertentu
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <p className="text-sm text-blue-800">
                      Untuk menggunakan hak-hak ini, silakan hubungi kami
                      melalui email di bawah ini. Kami akan merespons dalam
                      waktu 30 hari kerja.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Security */}
            <Card className="p-8">
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100">
                  <Lock className="h-5 w-5 text-neutral-600" />
                </div>
                <div>
                  <h2 className="mb-6 text-2xl font-semibold text-neutral-900">
                    Keamanan Data
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-3 font-semibold text-neutral-900">
                        Langkah Keamanan
                      </h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-lg bg-neutral-50 p-4">
                          <h4 className="mb-2 font-medium text-neutral-900">
                            Enkripsi
                          </h4>
                          <p className="text-sm text-neutral-600">
                            Semua data ditransmisikan menggunakan HTTPS/TLS
                          </p>
                        </div>
                        <div className="rounded-lg bg-neutral-50 p-4">
                          <h4 className="mb-2 font-medium text-neutral-900">
                            Autentikasi
                          </h4>
                          <p className="text-sm text-neutral-600">
                            Firebase Authentication untuk keamanan login
                          </p>
                        </div>
                        <div className="rounded-lg bg-neutral-50 p-4">
                          <h4 className="mb-2 font-medium text-neutral-900">
                            Akses Terbatas
                          </h4>
                          <p className="text-sm text-neutral-600">
                            Hanya admin yang berwenang dapat mengakses data
                          </p>
                        </div>
                        <div className="rounded-lg bg-neutral-50 p-4">
                          <h4 className="mb-2 font-medium text-neutral-900">
                            Monitoring
                          </h4>
                          <p className="text-sm text-neutral-600">
                            Pemantauan aktivitas dan log audit
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
                      <h4 className="mb-2 font-medium text-yellow-900">
                        Pelaporan Keamanan
                      </h4>
                      <p className="text-sm text-yellow-800">
                        Jika Anda menemukan kerentanan keamanan, mohon laporkan
                        segera kepada tim kami. Kami akan menindaklanjuti dengan
                        serius dan cepat.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Data Retention */}
            <Card className="p-8">
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100">
                  <Calendar className="h-5 w-5 text-neutral-600" />
                </div>
                <div>
                  <h2 className="mb-6 text-2xl font-semibold text-neutral-900">
                    Penyimpanan Data
                  </h2>

                  <div className="space-y-4">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <h3 className="mb-3 font-semibold text-neutral-900">
                          Data Pengguna
                        </h3>
                        <p className="leading-relaxed text-neutral-600">
                          Data akun disimpan selama akun aktif. Setelah
                          penghapusan akun, data pribadi akan dihapus dalam 30
                          hari.
                        </p>
                      </div>

                      <div>
                        <h3 className="mb-3 font-semibold text-neutral-900">
                          Data Laporan
                        </h3>
                        <p className="leading-relaxed text-neutral-600">
                          Laporan kerusakan jalan disimpan untuk memungkinkan
                          akses publik dan referensi masyarakat dalam memantau
                          kondisi jalan.
                        </p>
                      </div>
                    </div>

                    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6">
                      <h4 className="mb-2 font-medium text-neutral-900">
                        Kebijakan Retensi
                      </h4>
                      <ul className="space-y-1 text-sm text-neutral-600">
                        <li>• Data login dan profil: Sampai akun dihapus</li>
                        <li>• Foto dan laporan: Disimpan untuk arsip publik</li>
                        <li>
                          • Log aktivitas: 2 tahun untuk keperluan keamanan
                        </li>
                        <li>• Data analitik: Dalam bentuk anonim permanen</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Contact & Updates */}
            <Card className="p-8">
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100">
                  <Mail className="h-5 w-5 text-neutral-600" />
                </div>
                <div>
                  <h2 className="mb-6 text-2xl font-semibold text-neutral-900">
                    Kontak & Pembaruan
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-3 font-semibold text-neutral-900">
                        Hubungi Kami
                      </h3>
                      <div className="rounded-lg bg-neutral-50 p-6">
                        <p className="mb-4 text-neutral-600">
                          Untuk pertanyaan terkait privasi, permintaan data,
                          atau kekhawatiran keamanan:
                        </p>
                        <div className="space-y-2">
                          <p className="font-medium text-neutral-900">
                            Email: privacy@viralkan.id
                          </p>
                          <p className="text-neutral-600">
                            Tim akan merespons dalam 1-3 hari kerja
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="mb-3 font-semibold text-neutral-900">
                        Pembaruan Kebijakan
                      </h3>
                      <p className="mb-4 leading-relaxed text-neutral-600">
                        Kami dapat memperbarui kebijakan privasi ini dari waktu
                        ke waktu. Perubahan signifikan akan diberitahukan
                        melalui:
                      </p>
                      <ul className="ml-4 space-y-2 text-neutral-600">
                        <li>• Notifikasi email kepada pengguna terdaftar</li>
                        <li>• Pengumuman di halaman utama platform</li>
                        <li>
                          • Update tanggal &ldquo;Terakhir diperbarui&rdquo; di
                          halaman ini
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Final Note */}
            <div className="py-8 text-center">
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-8">
                <h3 className="mb-4 text-xl font-semibold text-neutral-900">
                  Komitmen Kami pada Transparansi
                </h3>
                <p className="mx-auto max-w-2xl leading-relaxed text-neutral-600">
                  Viralkan adalah platform yang dibangun untuk kepentingan
                  publik. Kami berkomitmen untuk menjaga kepercayaan masyarakat
                  melalui transparansi dalam pengelolaan data dan fokus pada
                  tujuan civic engagement yang positif.
                </p>
                <p className="mt-4 text-sm text-neutral-500">
                  Platform ini dibuat dengan ❤️ untuk kemajuan infrastruktur
                  Indonesia
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
