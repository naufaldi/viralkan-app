import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card } from "@repo/ui";
import { Users, Target, Heart, MapPin, Shield, Zap, Share2, Eye } from "lucide-react";

export default function Tentang() {
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
                <Users className="h-6 w-6 text-neutral-600" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-neutral-900 mb-4">
              Tentang Viralkan
            </h1>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
              Platform komunitas independen yang membantu warga melaporkan dan menyebarkan informasi 
              kerusakan jalan agar mendapat perhatian yang lebih luas.
            </p>
          </div>

          {/* Content Sections */}
          <div className="space-y-12 max-w-4xl mx-auto">
            
            {/* Mission */}
            <Card className="p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-neutral-100 flex h-10 w-10 items-center justify-center rounded-lg shrink-0">
                  <Target className="h-5 w-5 text-neutral-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-neutral-900 mb-6">
                    Misi Kami
                  </h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-neutral-900 mb-3">Tujuan Utama</h3>
                      <ul className="space-y-3 text-neutral-600 ml-4">
                        <li className="flex items-start gap-3">
                          <div className="bg-neutral-200 h-2 w-2 rounded-full mt-2 shrink-0"></div>
                          <span>Membantu warga menghindari jalan rusak dengan berbagi informasi lokasi</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="bg-neutral-200 h-2 w-2 rounded-full mt-2 shrink-0"></div>
                          <span>Mendapat perhatian dari pemerintah melalui viral dan tekanan komunitas</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="bg-neutral-200 h-2 w-2 rounded-full mt-2 shrink-0"></div>
                          <span>Meningkatkan kesadaran publik tentang masalah infrastruktur</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Dampak yang Diharapkan</h4>
                      <p className="text-sm text-blue-800">
                        Dengan menyentralisasi laporan yang sebelumnya tersebar di WhatsApp dan media sosial, 
                        kami membantu masyarakat agar laporan kerusakan jalan mendapat perhatian yang lebih luas 
                        dan dapat disebarkan secara viral untuk mendorong tindakan perbaikan.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* What We Are & What We Are Not */}
            <Card className="p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-neutral-100 flex h-10 w-10 items-center justify-center rounded-lg shrink-0">
                  <Shield className="h-5 w-5 text-neutral-600" />
                </div>
                <div className="w-full">
                  <h2 className="text-2xl font-semibold text-neutral-900 mb-6">
                    Posisi Platform
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
                      <h3 className="font-semibold text-green-900 mb-3">✓ Apa itu Viralkan</h3>
                      <ul className="space-y-2 text-green-800">
                        <li>• Platform berbagi informasi komunitas</li>
                        <li>• Alat bantu warga hindari jalan rusak</li>
                        <li>• Cara memperkuat suara warga melalui viral media sosial</li>
                        <li>• Inisiatif civic engagement independen</li>
                      </ul>
                    </div>
                    
                    <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
                      <h3 className="font-semibold text-red-900 mb-3">✗ Bukan Viralkan</h3>
                      <ul className="space-y-2 text-red-800">
                        <li>• Sistem pelaporan resmi pemerintah</li>
                        <li>• Saluran komunikasi langsung dengan otoritas</li>
                        <li>• Platform yang melacak progress perbaikan</li>
                        <li>• Layanan yang menjamin respons pemerintah</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-neutral-50 border border-neutral-200 rounded-lg">
                    <p className="text-sm text-neutral-700">
                      <strong>Catatan Penting:</strong> Viralkan adalah platform komunitas independen 
                      yang tidak memiliki afiliasi atau kerjasama langsung dengan pemerintah. 
                      Kami membantu masyarakat menyebarkan informasi agar mendapat perhatian publik.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* How It Works */}
            <Card className="p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-neutral-100 flex h-10 w-10 items-center justify-center rounded-lg shrink-0">
                  <Zap className="h-5 w-5 text-neutral-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-neutral-900 mb-6">
                    Cara Kerja Platform
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="text-center p-4">
                        <div className="bg-neutral-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                          <MapPin className="h-8 w-8 text-neutral-600" />
                        </div>
                        <h3 className="font-semibold text-neutral-900 mb-2">1. Laporkan</h3>
                        <p className="text-sm text-neutral-600">
                          Foto kerusakan jalan dan isi detail lokasi dengan mudah
                        </p>
                      </div>
                      
                      <div className="text-center p-4">
                        <div className="bg-neutral-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                          <Share2 className="h-8 w-8 text-neutral-600" />
                        </div>
                        <h3 className="font-semibold text-neutral-900 mb-2">2. Sebarkan</h3>
                        <p className="text-sm text-neutral-600">
                          Laporan dapat dilihat publik dan dibagikan ke media sosial
                        </p>
                      </div>
                      
                      <div className="text-center p-4">
                        <div className="bg-neutral-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                          <Eye className="h-8 w-8 text-neutral-600" />
                        </div>
                        <h3 className="font-semibold text-neutral-900 mb-2">3. Perhatian</h3>
                        <p className="text-sm text-neutral-600">
                          Viral dan awareness mendorong perhatian dari berbagai pihak
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-neutral-50 border border-neutral-200 p-6 rounded-lg">
                      <h4 className="font-medium text-neutral-900 mb-2">Filosofi Platform</h4>
                      <p className="text-sm text-neutral-700 leading-relaxed">
                        Kami percaya bahwa informasi yang tersebar luas akan mendapat perhatian yang lebih besar. 
                        Dengan mengumpulkan laporan yang sebelumnya terpencar di WhatsApp dan media sosial, 
                        kami membantu menciptakan tekanan publik yang konstruktif untuk perbaikan infrastruktur.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Technology & Values */}
            <Card className="p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-neutral-100 flex h-10 w-10 items-center justify-center rounded-lg shrink-0">
                  <Heart className="h-5 w-5 text-neutral-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-neutral-900 mb-6">
                    Nilai & Teknologi
                  </h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-neutral-900 mb-3">Nilai-Nilai Kami</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-neutral-50 p-4 rounded-lg">
                          <h4 className="font-medium text-neutral-900 mb-2">Transparansi</h4>
                          <p className="text-sm text-neutral-600">Semua laporan bersifat publik dan dapat diakses siapa saja</p>
                        </div>
                        <div className="bg-neutral-50 p-4 rounded-lg">
                          <h4 className="font-medium text-neutral-900 mb-2">Independensi</h4>
                          <p className="text-sm text-neutral-600">Tidak berafiliasi dengan pemerintah atau partai politik</p>
                        </div>
                        <div className="bg-neutral-50 p-4 rounded-lg">
                          <h4 className="font-medium text-neutral-900 mb-2">Komunitas</h4>
                          <p className="text-sm text-neutral-600">Dibangun oleh dan untuk masyarakat</p>
                        </div>
                        <div className="bg-neutral-50 p-4 rounded-lg">
                          <h4 className="font-medium text-neutral-900 mb-2">Aksesibilitas</h4>
                          <p className="text-sm text-neutral-600">Mudah digunakan untuk semua kalangan</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-neutral-900 mb-3">Teknologi Terbuka</h3>
                      <p className="text-neutral-600 leading-relaxed mb-4">
                        Platform ini dibangun menggunakan teknologi web modern dan open source. 
                        Kami berkomitmen pada keamanan data, kecepatan akses, dan kemudahan penggunaan.
                      </p>
                      <div className="flex flex-wrap gap-2 text-sm">
                        <span className="bg-neutral-100 px-3 py-1 rounded-full text-neutral-700">React</span>
                        <span className="bg-neutral-100 px-3 py-1 rounded-full text-neutral-700">Next.js</span>
                        <span className="bg-neutral-100 px-3 py-1 rounded-full text-neutral-700">PostgreSQL</span>
                        <span className="bg-neutral-100 px-3 py-1 rounded-full text-neutral-700">Firebase Auth</span>
                        <span className="bg-neutral-100 px-3 py-1 rounded-full text-neutral-700">Cloudflare</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Success Metrics */}
            <Card className="p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-neutral-100 flex h-10 w-10 items-center justify-center rounded-lg shrink-0">
                  <Target className="h-5 w-5 text-neutral-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-neutral-900 mb-6">
                    Ukuran Keberhasilan
                  </h2>
                  
                  <div className="space-y-6">
                    <p className="text-neutral-600 leading-relaxed">
                      Keberhasilan platform Viralkan diukur berdasarkan dampak nyata untuk masyarakat:
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold text-neutral-900 mb-3">Indikator Keberhasilan</h3>
                        <ul className="space-y-2 text-neutral-600">
                          <li>• Adopsi dan partisipasi aktif masyarakat</li>
                          <li>• Viral dan sharing laporan di media sosial</li>
                          <li>• Warga berhasil menghindari jalan rusak</li>
                          <li>• Peningkatan kesadaran publik</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-neutral-900 mb-3">Dampak Jangka Panjang</h3>
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
          <div className="text-center py-12 mt-16">
            <div className="bg-neutral-50 border border-neutral-200 p-8 rounded-lg max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold text-neutral-900 mb-4">
                Bergabunglah dengan Komunitas
              </h3>
              <p className="text-neutral-600 leading-relaxed mb-6">
                Viralkan adalah platform untuk kita semua. Mari bersama-sama membangun 
                kesadaran tentang kondisi infrastruktur jalan dan membantu sesama warga 
                menghindari kerusakan yang dapat merugikan.
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
