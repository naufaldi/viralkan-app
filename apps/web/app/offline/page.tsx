"use client";

import { Button } from "@repo/ui";
import { WifiOff } from "lucide-react";

/**
 * Offline fallback page
 * Shown when the user is offline and the requested page is not in the cache.
 */
const OfflinePage = () => {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <div className="bg-muted mb-6 rounded-full p-6">
        <WifiOff className="text-muted-foreground h-12 w-12" />
      </div>
      <h1 className="mb-2 text-3xl font-bold">Kamu Sedang Offline</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        Sepertinya kamu tidak terhubung ke internet. Beberapa fitur mungkin
        tidak tersedia saat ini. Silakan cek koneksi kamu dan coba lagi.
      </p>
      <Button onClick={handleReload} size="lg">
        Coba Lagi
      </Button>
    </div>
  );
};

export default OfflinePage;
