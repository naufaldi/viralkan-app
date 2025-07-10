import { AlertTriangle, Shield, Info } from "lucide-react";

const DisclaimerSection = () => {
  return (
    <section id="disclaimer" className="py-24 bg-gradient-to-r from-amber-50 to-orange-50">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center rounded-full bg-amber-100 p-3 mb-6">
              <AlertTriangle className="h-8 w-8 text-amber-600" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
              Peran Kami &{" "}
              <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Batasan Platform
              </span>
            </h2>
          </div>

          <div className="rounded-2xl bg-white/80 backdrop-blur p-8 shadow-xl ring-1 ring-gray-200 lg:p-12">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="inline-flex rounded-lg bg-amber-100 p-2">
                    <Info className="h-5 w-5 text-amber-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Platform Independen
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Viralkan adalah platform independen yang digerakkan oleh komunitas. Kami{" "}
                    <strong className="font-semibold text-gray-900">tidak berafiliasi</strong> dengan 
                    instansi pemerintah manapun dan beroperasi secara mandiri.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="inline-flex rounded-lg bg-red-100 p-2">
                    <Shield className="h-5 w-5 text-red-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Tidak Ada Jaminan Perbaikan
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Kami{" "}
                    <strong className="font-semibold text-gray-900">tidak dapat menjamin</strong> bahwa 
                    laporan yang dibuat akan menghasilkan perbaikan jalan. Platform ini berfungsi sebagai 
                    alat kesadaran publik, bukan sebagai saluran resmi pemerintah.
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-8">
                <div className="rounded-xl bg-gray-50 p-6">
                  <h4 className="text-base font-semibold text-gray-900 mb-3">
                    🎯 Tujuan Utama Platform
                  </h4>
                  <p className="text-gray-600 leading-relaxed">
                    Tujuan kami adalah murni untuk meningkatkan kesadaran publik dan keselamatan 
                    berkendara melalui kekuatan viral media sosial. Kami percaya bahwa transparansi 
                    dan partisipasi aktif masyarakat dapat mendorong perhatian terhadap infrastruktur jalan.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Dengan menggunakan platform ini, Anda memahami dan menyetujui batasan-batasan yang disebutkan di atas.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DisclaimerSection; 