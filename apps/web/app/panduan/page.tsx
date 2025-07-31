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
  ArrowRight
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
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="bg-neutral-100 flex h-12 w-12 items-center justify-center rounded-lg">
                <BookOpen className="h-6 w-6 text-neutral-600" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-neutral-900 mb-4">
              Panduan Penggunaan
            </h1>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
              Pelajari cara membuat laporan kerusakan jalan yang efektif dan membantu komunitas 
              dengan platform Viralkan.
            </p>
          </div>

          {/* Content Sections */}
          <div className="space-y-12 max-w-4xl mx-auto">
            
            {/* Quick Start Guide */}
            <Card className="p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-neutral-100 flex h-10 w-10 items-center justify-center rounded-lg shrink-0">
                  <Settings className="h-5 w-5 text-neutral-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-neutral-900 mb-6">
                    Mulai Cepat
                  </h2>
                  
                  <div className="grid md:grid-cols-3 gap-6 mb-6">
                    <div className="text-center p-4">
                      <div className="bg-neutral-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Users className="h-8 w-8 text-neutral-600" />
                      </div>
                      <h3 className="font-semibold text-neutral-900 mb-2">1. Masuk Akun</h3>
                      <p className="text-sm text-neutral-600">
                        Login dengan akun Google untuk mulai membuat laporan
                      </p>
                    </div>
                    
                    <div className="text-center p-4">
                      <div className="bg-neutral-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Camera className="h-8 w-8 text-neutral-600" />
                      </div>
                      <h3 className="font-semibold text-neutral-900 mb-2">2. Foto Jalan</h3>
                      <p className="text-sm text-neutral-600">
                        Ambil foto kerusakan jalan dengan jelas dan detail
                      </p>
                    </div>
                    
                    <div className="text-center p-4">
                      <div className="bg-neutral-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Send className="h-8 w-8 text-neutral-600" />
                      </div>
                      <h3 className="font-semibold text-neutral-900 mb-2">3. Kirim Laporan</h3>
                      <p className="text-sm text-neutral-600">
                        Isi detail dan kirim laporan untuk dibagikan ke publik
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Tips Awal</h4>
                    <p className="text-sm text-blue-800">
                      Pastikan GPS ponsel aktif saat mengambil foto. Ini akan membantu sistem 
                      mengisi informasi lokasi secara otomatis dan mempercepat proses pelaporan.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Step by Step Guide */}
            <Card className="p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-neutral-100 flex h-10 w-10 items-center justify-center rounded-lg shrink-0">
                  <Edit3 className="h-5 w-5 text-neutral-600" />
                </div>
                <div className="w-full">
                  <h2 className="text-2xl font-semibold text-neutral-900 mb-8">
                    Langkah Demi Langkah
                  </h2>
                  
                  <div className="space-y-8">
                    {/* Step 1: Image Upload */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="bg-neutral-900 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold">
                          1
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <Upload className="h-5 w-5 text-neutral-600" />
                          <h3 className="text-lg font-semibold text-neutral-900">Unggah Foto</h3>
                        </div>
                        <div className="space-y-4">
                          <p className="text-neutral-600 leading-relaxed">
                            Mulai dengan mengunggah foto kerusakan jalan. Sistem akan menganalisis foto 
                            dan mengekstrak informasi lokasi GPS jika tersedia.
                          </p>
                          
                          <div className="bg-neutral-50 p-4 rounded-lg">
                            <h4 className="font-medium text-neutral-900 mb-2">Persyaratan Foto:</h4>
                            <ul className="text-sm text-neutral-600 space-y-1">
                              <li>• Format: JPEG atau PNG</li>
                              <li>• Ukuran maksimal: 10 MB</li>
                              <li>• Pastikan kerusakan terlihat jelas</li>
                              <li>• Aktifkan GPS saat mengambil foto</li>
                            </ul>
                          </div>
                          
                          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                            <div className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <h4 className="font-medium text-green-900 mb-1">Pro Tip</h4>
                                <p className="text-sm text-green-800">
                                  Foto yang diambil dengan GPS akan otomatis mengisi koordinat lokasi, 
                                  mempercepat proses pengisian formulir.
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
                        <div className="bg-neutral-900 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold">
                          2
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <Edit3 className="h-5 w-5 text-neutral-600" />
                          <h3 className="text-lg font-semibold text-neutral-900">Formulir Teraktivasi</h3>
                        </div>
                        <div className="space-y-4">
                          <p className="text-neutral-600 leading-relaxed">
                            Setelah foto berhasil diunggah, formulir detail laporan akan aktif. 
                            Sistem akan menampilkan peringatan jika foto tidak memiliki data GPS.
                          </p>
                          
                          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <h4 className="font-medium text-yellow-900 mb-1">Peringatan EXIF</h4>
                                <p className="text-sm text-yellow-800">
                                  Jika muncul peringatan "GPS metadata tidak ditemukan", Anda perlu 
                                  mengisi lokasi secara manual atau menggunakan tombol "Dapatkan Lokasi Saya".
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
                        <div className="bg-neutral-900 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold">
                          3
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <MapPin className="h-5 w-5 text-neutral-600" />
                          <h3 className="text-lg font-semibold text-neutral-900">Isi Detail Laporan</h3>
                        </div>
                        <div className="space-y-4">
                          <p className="text-neutral-600 leading-relaxed">
                            Lengkapi informasi laporan dengan mengisi formulir yang tersedia.
                          </p>
                          
                          <div className="space-y-4">
                            <div className="bg-neutral-50 p-4 rounded-lg">
                              <h4 className="font-medium text-neutral-900 mb-3">Field Wajib:</h4>
                              <div className="grid md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <h5 className="font-medium text-neutral-800 mb-1">Kategori Kerusakan</h5>
                                  <p className="text-neutral-600">Pilih: Berlubang, Retak, atau Lainnya</p>
                                </div>
                                <div>
                                  <h5 className="font-medium text-neutral-800 mb-1">Nama Jalan</h5>
                                  <p className="text-neutral-600">Contoh: Jl. Ahmad Yani, Jl. Sudirman</p>
                                </div>
                                <div>
                                  <h5 className="font-medium text-neutral-800 mb-1">Koordinat</h5>
                                  <p className="text-neutral-600">Latitude dan Longitude (otomatis atau manual)</p>
                                </div>
                                <div>
                                  <h5 className="font-medium text-neutral-800 mb-1">Deskripsi Lokasi</h5>
                                  <p className="text-neutral-600">Detail tambahan lokasi kerusakan</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                              <h4 className="font-medium text-blue-900 mb-2">Fitur Bantuan Lokasi:</h4>
                              <ul className="text-sm text-blue-800 space-y-1">
                                <li>• <strong>Dapatkan Lokasi Saya:</strong> Otomatis isi koordinat GPS</li>
                                <li>• <strong>Dapatkan Alamat:</strong> Konversi koordinat ke alamat</li>
                                <li>• <strong>Dapatkan Koordinat:</strong> Konversi alamat ke koordinat</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 4: Submit */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="bg-neutral-900 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold">
                          4
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <Send className="h-5 w-5 text-neutral-600" />
                          <h3 className="text-lg font-semibold text-neutral-900">Kirim Laporan</h3>
                        </div>
                        <div className="space-y-4">
                          <p className="text-neutral-600 leading-relaxed">
                            Setelah semua field terisi, tekan tombol "Kirim Laporan" untuk mempublikasikan 
                            laporan Anda ke platform komunitas.
                          </p>
                          
                          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                            <h4 className="font-medium text-green-900 mb-2">Setelah Dikirim:</h4>
                            <ul className="text-sm text-green-800 space-y-1">
                              <li>• Laporan langsung terlihat di halaman publik</li>
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
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-neutral-100 flex h-10 w-10 items-center justify-center rounded-lg shrink-0">
                  <Camera className="h-5 w-5 text-neutral-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-neutral-900 mb-6">
                    Tips Foto yang Baik
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
                        <h3 className="font-semibold text-green-900 mb-3">✓ Lakukan</h3>
                        <ul className="space-y-2 text-green-800">
                          <li>• Foto dengan pencahayaan yang cukup</li>
                          <li>• Fokus pada area kerusakan</li>
                          <li>• Sertakan konteks jalan sekitar</li>
                          <li>• Aktifkan GPS saat mengambil foto</li>
                          <li>• Foto dari jarak yang aman</li>
                        </ul>
                      </div>
                      
                      <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
                        <h3 className="font-semibold text-red-900 mb-3">✗ Hindari</h3>
                        <ul className="space-y-2 text-red-800">
                          <li>• Foto buram atau gelap</li>
                          <li>• Hanya fokus close-up tanpa konteks</li>
                          <li>• Mengambil foto sambil berkendara</li>
                          <li>• Foto yang mengandung informasi pribadi</li>
                          <li>• Screenshot atau foto dari aplikasi lain</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="bg-neutral-50 border border-neutral-200 p-6 rounded-lg">
                      <h4 className="font-medium text-neutral-900 mb-3">Contoh Foto Ideal:</h4>
                      <div className="grid md:grid-cols-3 gap-4 text-sm text-neutral-600">
                        <div>
                          <h5 className="font-medium text-neutral-800 mb-1">Berlubang</h5>
                          <p>Tampilkan ukuran lubang dengan referensi objek di sekitar</p>
                        </div>
                        <div>
                          <h5 className="font-medium text-neutral-800 mb-1">Retak</h5>
                          <p>Foto yang menunjukkan panjang dan lebar retakan jalan</p>
                        </div>
                        <div>
                          <h5 className="font-medium text-neutral-800 mb-1">Kerusakan Lain</h5>
                          <p>Dokumentasi jelas dengan konteks lingkungan sekitar</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Platform Features */}
            <Card className="p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-neutral-100 flex h-10 w-10 items-center justify-center rounded-lg shrink-0">
                  <Smartphone className="h-5 w-5 text-neutral-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-neutral-900 mb-6">
                    Fitur Platform
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-neutral-900 mb-3">Fitur Utama</h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="bg-neutral-200 h-2 w-2 rounded-full mt-2 shrink-0"></div>
                          <div>
                            <h4 className="font-medium text-neutral-900">Auto-Extract GPS</h4>
                            <p className="text-sm text-neutral-600">Otomatis mengambil koordinat dari foto</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="bg-neutral-200 h-2 w-2 rounded-full mt-2 shrink-0"></div>
                          <div>
                            <h4 className="font-medium text-neutral-900">Geocoding</h4>
                            <p className="text-sm text-neutral-600">Konversi koordinat ke alamat dan sebaliknya</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="bg-neutral-200 h-2 w-2 rounded-full mt-2 shrink-0"></div>
                          <div>
                            <h4 className="font-medium text-neutral-900">Progressive Form</h4>
                            <p className="text-sm text-neutral-600">Formulir aktif setelah foto diunggah</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-neutral-900 mb-3">Akses Publik</h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="bg-neutral-200 h-2 w-2 rounded-full mt-2 shrink-0"></div>
                          <div>
                            <h4 className="font-medium text-neutral-900">Laporan Publik</h4>
                            <p className="text-sm text-neutral-600">Semua dapat melihat laporan tanpa login</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="bg-neutral-200 h-2 w-2 rounded-full mt-2 shrink-0"></div>
                          <div>
                            <h4 className="font-medium text-neutral-900">Share ke Media Sosial</h4>
                            <p className="text-sm text-neutral-600">Mudah dibagikan untuk viral</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="bg-neutral-200 h-2 w-2 rounded-full mt-2 shrink-0"></div>
                          <div>
                            <h4 className="font-medium text-neutral-900">Dashboard Pribadi</h4>
                            <p className="text-sm text-neutral-600">Kelola laporan yang telah dibuat</p>
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
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-neutral-100 flex h-10 w-10 items-center justify-center rounded-lg shrink-0">
                  <AlertCircle className="h-5 w-5 text-neutral-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-neutral-900 mb-6">
                    Pemecahan Masalah
                  </h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-neutral-900 mb-4">Masalah Umum & Solusi</h3>
                      
                      <div className="space-y-4">
                        <div className="border border-neutral-200 rounded-lg p-4">
                          <h4 className="font-medium text-neutral-900 mb-2">GPS tidak terdeteksi</h4>
                          <p className="text-sm text-neutral-600 mb-2">
                            Foto tidak memiliki informasi GPS atau muncul peringatan EXIF.
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
                        
                        <div className="border border-neutral-200 rounded-lg p-4">
                          <h4 className="font-medium text-neutral-900 mb-2">Upload foto gagal</h4>
                          <p className="text-sm text-neutral-600 mb-2">
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
                        
                        <div className="border border-neutral-200 rounded-lg p-4">
                          <h4 className="font-medium text-neutral-900 mb-2">Formulir tidak aktif</h4>
                          <p className="text-sm text-neutral-600 mb-2">
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
                    
                    <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Butuh Bantuan Lebih Lanjut?</h4>
                      <p className="text-sm text-blue-800">
                        Jika masalah masih berlanjut, hubungi tim support melalui email atau 
                        cek halaman privasi untuk informasi kontak.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Call to Action */}
            <div className="text-center py-12">
              <div className="bg-neutral-50 border border-neutral-200 p-8 rounded-lg">
                <h3 className="text-xl font-semibold text-neutral-900 mb-4">
                  Siap Membuat Laporan?
                </h3>
                <p className="text-neutral-600 leading-relaxed mb-6">
                  Dengan panduan ini, Anda sudah siap membuat laporan kerusakan jalan yang efektif. 
                  Mari berkontribusi untuk komunitas dan infrastruktur yang lebih baik.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a 
                    href="/login" 
                    className="inline-flex items-center gap-2 bg-neutral-900 text-white px-6 py-3 rounded-lg hover:bg-neutral-800 transition-colors"
                  >
                    Mulai Lapor Sekarang
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <a 
                    href="/laporan" 
                    className="inline-flex items-center gap-2 border border-neutral-300 text-neutral-700 px-6 py-3 rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    Lihat Laporan Lain
                  </a>
                </div>
                <p className="text-sm text-neutral-500 mt-4">
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