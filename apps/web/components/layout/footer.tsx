import { MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-neutral-950 text-neutral-300">
      <div className="container mx-auto px-6 py-16">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary-600 flex h-8 w-8 items-center justify-center rounded-lg">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-white">Viralkan</span>
            </div>
            <p className="leading-relaxed text-neutral-400">
              Platform komunitas untuk melaporkan dan memviralkan kerusakan
              infrastruktur jalan di Indonesia.
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-white">Platform</h3>
            <ul className="space-y-2">
              <li>
                <a href="/tentang" className="transition-colors hover:text-white">
                  Tentang
                </a>
              </li>
              <li>
                <a href="/panduan" className="transition-colors hover:text-white">
                  Panduan
                </a>
              </li>
              <li>
                <a href="/privasi" className="transition-colors hover:text-white">
                  Kebijakan Privasi
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-white">Laporan</h3>
            <ul className="space-y-2">
              <li>
                <a href="/laporan" className="transition-colors hover:text-white">
                  Lihat Laporan
                </a>
              </li>
              <li>
                <a href="/login" className="transition-colors hover:text-white">
                  Buat Laporan
                </a>
              </li>
              <li>
                <a href="/dashboard" className="transition-colors hover:text-white">
                  Dashboard
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-white">Akun</h3>
            <ul className="space-y-2">
              <li>
                <a href="/login" className="transition-colors hover:text-white">
                  Masuk
                </a>
              </li>
              <li>
                <a href="/dashboard" className="transition-colors hover:text-white">
                  Laporan Saya
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-neutral-800 pt-8 text-center">
          <p className="text-neutral-400">
            © 2024 Viralkan. Dibuat dengan ❤️ untuk Indonesia.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
