import { MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-neutral-950 text-neutral-300">
      <div className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-white">Viralkan</span>
            </div>
            <p className="text-neutral-400 leading-relaxed">
              Platform komunitas untuk melaporkan dan memviralkan kerusakan
              infrastruktur jalan di Indonesia.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Platform</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Cara Kerja
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Panduan
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Komunitas</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Testimoni
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Events
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Dukungan</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Kontak
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Privasi
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Syarat
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-800 mt-12 pt-8 text-center">
          <p className="text-neutral-400">
            © 2024 Viralkan. Dibuat dengan ❤️ untuk Indonesia.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
