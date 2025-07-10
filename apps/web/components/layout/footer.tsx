import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Separator } from "@repo/ui/components/ui/separator";
import { Badge } from "@repo/ui/components/ui/badge";
import {
  Heart,
  Twitter,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

const Footer = () => {
  const socialLinks = [
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Mail, href: "mailto:info@viralkan.id", label: "Email" },
  ];

  const platformLinks = [
    { label: "Cara Kerja", href: "#how-it-works" },
    { label: "Statistik", href: "#statistics" },
    { label: "Peta Interaktif", href: "#" },
    { label: "API Documentation", href: "#" },
  ];

  const legalLinks = [
    { label: "Disclaimer", href: "#disclaimer" },
    { label: "Kebijakan Privasi", href: "#" },
    { label: "Syarat & Ketentuan", href: "#" },
    { label: "FAQ", href: "#" },
  ];

  return (
    <footer className="bg-gradient-to-b from-slate-900 to-slate-950 text-white">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid lg:grid-cols-4 gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg">
                  <span className="text-xl font-bold text-white">V</span>
                </div>
                <div>
                  <span className="text-2xl font-bold">Viralkan</span>
                  <Badge
                    variant="secondary"
                    className="ml-3 bg-blue-500/20 text-blue-300 border-blue-500/30"
                  >
                    Platform Komunitas
                  </Badge>
                </div>
              </div>

              <p className="text-slate-300 leading-relaxed max-w-md">
                Platform komunitas untuk melaporkan dan menghindari jalan rusak
                di seluruh Indonesia. Jadikan suaramu terdengar lewat kekuatan
                media sosial.
              </p>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-slate-300">
                  <Mail className="h-4 w-4 text-blue-400" />
                  <span className="text-sm">info@viralkan.id</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <MapPin className="h-4 w-4 text-blue-400" />
                  <span className="text-sm">Indonesia</span>
                </div>
              </div>

              {/* Social Media */}
              <div className="flex items-center gap-4">
                {socialLinks.map((social) => {
                  const IconComponent = social.icon;
                  return (
                    <Button
                      key={social.label}
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white transition-all duration-300 hover:scale-110"
                      asChild
                    >
                      <a href={social.href} aria-label={social.label}>
                        <IconComponent className="h-4 w-4" />
                      </a>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Platform Links */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">Platform</h3>
              <ul className="space-y-3">
                {platformLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-slate-300 hover:text-white transition-colors duration-200 text-sm hover:underline hover:underline-offset-4"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">Legal</h3>
              <ul className="space-y-3">
                {legalLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-slate-300 hover:text-white transition-colors duration-200 text-sm hover:underline hover:underline-offset-4"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Separator */}
        <Separator className="bg-slate-800" />

        {/* Bottom Section */}
        <div className="py-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Copyright */}
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <span>© 2024 Viralkan. Dibuat dengan</span>
              <Heart className="h-4 w-4 text-red-400 fill-current" />
              <span>untuk Indonesia</span>
            </div>

            {/* Status & Version */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-slate-400">
                  Semua sistem berjalan normal
                </span>
              </div>
              <Badge
                variant="outline"
                className="border-slate-700 text-slate-400 text-xs"
              >
                v1.0.0-beta
              </Badge>
            </div>
          </div>
        </div>

        {/* Indonesia Pride */}
        <div className="pb-8">
          <Card className="bg-gradient-to-r from-red-500/10 via-white/5 to-red-500/10 border-red-500/20">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center gap-3 text-sm text-slate-300">
                <span className="text-red-400 text-lg">🇮🇩</span>
                <span>
                  Bangga buatan anak negeri untuk kemajuan infrastruktur
                  Indonesia
                </span>
                <span className="text-red-400 text-lg">🇮🇩</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
