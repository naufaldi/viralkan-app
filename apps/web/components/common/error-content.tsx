"use client";

import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import Link from "next/link";

interface ErrorContentProps {
  reset: () => void;
  message?: string;
}

const ErrorContent = ({
  reset,
  message = "Terjadi kesalahan pada server. Tim kami sudah diberitahu.",
}: ErrorContentProps) => {
  return (
    <Card className="border-neutral-200 bg-white shadow-md">
      <CardHeader className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 shadow-sm">
            <AlertTriangle className="h-6 w-6 text-neutral-800" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight text-neutral-900">
              Terjadi Kesalahan
            </CardTitle>
            <CardDescription className="text-base text-neutral-600">
              {message}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        <p className="text-sm text-neutral-500">
          Silakan coba lagi atau kembali ke halaman utama.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <Button
            className="h-11 bg-neutral-800 px-6 text-white hover:bg-neutral-900"
            onClick={reset}
          >
            <RefreshCw className="mr-3 h-4 w-4" />
            Coba Lagi
          </Button>

          <Button
            variant="outline"
            className="h-11 justify-start border-neutral-300 text-neutral-700 hover:bg-neutral-50"
            asChild
          >
            <Link href="/">
              <Home className="mr-3 h-4 w-4" />
              Kembali ke Beranda
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ErrorContent;
