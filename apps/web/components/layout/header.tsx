"use client";

import { Button } from "@repo/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/ui/avatar";
import { MapPin, LogOut, LayoutDashboard, FileText } from "lucide-react";
import Link from "next/link";
import { useAuthContext } from "../../contexts/AuthContext";

const Header = () => {
  const { isAuthenticated, isLoading, backendUser, signOut } = useAuthContext();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const renderAuthButton = () => {
    if (isLoading) {
      return (
        <Button size="sm" disabled className="bg-primary-600">
          Loading...
        </Button>
      );
    }

    if (isAuthenticated && backendUser) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={backendUser.avatar_url || undefined}
                  alt={backendUser.name}
                />
                <AvatarFallback>
                  {backendUser.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {backendUser.name}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {backendUser.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard" className="cursor-pointer">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/laporan/buat" className="cursor-pointer">
                <FileText className="mr-2 h-4 w-4" />
                Buat Laporan
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <Button asChild size="sm" className="bg-primary-600 hover:bg-primary-700">
        <Link href="/login">Mulai Lapor</Link>
      </Button>
    );
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-neutral-200">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-neutral-900">
              Viralkan
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="/laporan"
              className="text-neutral-600 hover:text-neutral-900 font-medium transition-colors"
            >
              Laporan
            </a>
            <a
              href="#how-it-works"
              className="text-neutral-600 hover:text-neutral-900 font-medium transition-colors"
            >
              Cara Kerja
            </a>
            <a
              href="#community"
              className="text-neutral-600 hover:text-neutral-900 font-medium transition-colors"
            >
              Komunitas
            </a>
            <a
              href="#about"
              className="text-neutral-600 hover:text-neutral-900 font-medium transition-colors"
            >
              Tentang
            </a>
            {renderAuthButton()}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
