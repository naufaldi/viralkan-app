"use client";

import { useState } from "react";
import { Button } from "@repo/ui/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@repo/ui/components/ui/sheet";
import { Badge } from "@repo/ui/components/ui/badge";
import { Menu, X } from "lucide-react";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: "Cara Kerja", href: "#how-it-works" },
    { label: "Statistik", href: "#statistics" },
    { label: "Disclaimer", href: "#disclaimer" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg">
              <span className="text-xl font-bold text-white">V</span>
            </div>
            <span className="text-xl font-bold text-slate-900">Viralkan</span>
            <Badge
              variant="secondary"
              className="bg-blue-50 text-blue-700 text-xs px-2 py-1"
            >
              Beta
            </Badge>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-slate-600 hover:text-slate-900 font-medium transition-colors duration-200 hover:underline hover:underline-offset-4"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="ghost"
              className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              Masuk
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-300">
              Daftar
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden hover:bg-slate-100"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-80 bg-white/95 backdrop-blur-xl border-l border-slate-200/50"
            >
              <div className="flex flex-col h-full">
                {/* Mobile Header */}
                <div className="flex items-center justify-between pb-6 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                      <span className="text-sm font-bold text-white">V</span>
                    </div>
                    <span className="text-lg font-bold text-slate-900">
                      Viralkan
                    </span>
                  </div>
                </div>

                {/* Mobile Navigation */}
                <nav className="flex flex-col gap-6 py-8">
                  {navItems.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="text-slate-600 hover:text-slate-900 font-medium text-lg transition-colors duration-200 hover:translate-x-2 transform"
                    >
                      {item.label}
                    </a>
                  ))}
                </nav>

                {/* Mobile Auth Buttons */}
                <div className="mt-auto space-y-4 pt-6 border-t border-slate-200">
                  <Button
                    variant="outline"
                    className="w-full border-slate-200 hover:bg-slate-50"
                  >
                    Masuk
                  </Button>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md">
                    Daftar
                  </Button>

                  {/* Platform Info */}
                  <div className="pt-4 text-center">
                    <Badge
                      variant="secondary"
                      className="bg-slate-100 text-slate-600 text-xs"
                    >
                      Platform Komunitas Indonesia
                    </Badge>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
