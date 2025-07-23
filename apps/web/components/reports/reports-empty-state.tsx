export function ReportsEmptyState() {
  return (
    <div className="text-center py-24">
      <div className="text-6xl mb-4">🔍</div>
      <h3 className="text-xl font-semibold text-foreground mb-2">
        Tidak ada laporan ditemukan
      </h3>
      <p className="text-muted-foreground">
        Coba ubah filter atau kata kunci pencarian Anda
      </p>
    </div>
  );
} 