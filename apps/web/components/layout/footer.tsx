import Link from "next/link";
import { Twitter, Facebook, Instagram, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-6 py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
                <span className="text-lg font-bold text-gray-900">V</span>
              </div>
              <span className="text-xl font-bold">Viralkan</span>
            </div>
            <p className="text-gray-400 max-w-md">
              Platform komunitas untuk melaporkan, membagikan, dan menghindari jalan rusak 
              di seluruh Indonesia. Bersama kita ciptakan kesadaran infrastruktur.
            </p>
            <div className="flex space-x-4 mt-6">
              <Link 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </Link>
              <Link 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </Link>
              <Link 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Platform</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#how-it-works" className="text-gray-400 hover:text-white transition-colors">
                  Cara Kerja
                </Link>
              </li>
              <li>
                <Link href="#statistics" className="text-gray-400 hover:text-white transition-colors">
                  Statistik
                </Link>
              </li>
              <li>
                <Link href="#disclaimer" className="text-gray-400 hover:text-white transition-colors">
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Viralkan. Seluruh hak cipta dilindungi.
          </p>
          <p className="text-gray-400 text-sm mt-4 sm:mt-0">
            Dibuat dengan ❤️ untuk Indonesia
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 