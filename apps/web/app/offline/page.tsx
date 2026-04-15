import Header from "components/layout/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <main className="container mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <Card className="border-neutral-200 bg-white shadow-md">
            <CardHeader className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 shadow-sm">
                  <WifiOff className="h-6 w-6 text-neutral-800" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-2xl font-bold tracking-tight text-neutral-900">
                    Tidak Ada Koneksi
                  </CardTitle>
                  <CardDescription className="text-base text-neutral-600">
                    Anda sedang offline. Periksa koneksi internet Anda dan coba
                    lagi.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-neutral-500">
                Laporan yang sudah dimuat sebelumnya masih dapat dilihat. Fitur
                membuat laporan membutuhkan koneksi internet.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
