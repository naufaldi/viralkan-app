import { Button } from "@repo/ui/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@repo/ui/components/ui/sheet";
import { Menu } from "lucide-react";
import Link from "next/link";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-20 items-center justify-between px-6 lg:px-8">
        <Link className="flex items-center space-x-2" href="#">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900">
            <span className="text-lg font-bold text-white">V</span>
          </div>
          <span className="text-xl font-bold text-gray-900">Viralkan</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-8">
          <Link
            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
            href="#how-it-works"
          >
            Cara Kerja
          </Link>
          <Link
            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
            href="#statistics"
          >
            Statistik
          </Link>
          <Link
            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
            href="#disclaimer"
          >
            Disclaimer
          </Link>
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          <Button variant="ghost" size="sm">
            Masuk
          </Button>
          <Button size="sm" className="bg-gray-900 hover:bg-gray-800">
            Daftar
          </Button>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <nav className="flex flex-col space-y-4">
              <Link
                className="text-lg font-medium text-gray-900 transition-colors hover:text-gray-600"
                href="#how-it-works"
              >
                Cara Kerja
              </Link>
              <Link
                className="text-lg font-medium text-gray-900 transition-colors hover:text-gray-600"
                href="#statistics"
              >
                Statistik
              </Link>
              <Link
                className="text-lg font-medium text-gray-900 transition-colors hover:text-gray-600"
                href="#disclaimer"
              >
                Disclaimer
              </Link>
              <div className="flex flex-col space-y-3 pt-6">
                <Button variant="outline" size="lg">
                  Masuk
                </Button>
                <Button size="lg" className="bg-gray-900 hover:bg-gray-800">
                  Daftar
                </Button>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};
export default Header; 