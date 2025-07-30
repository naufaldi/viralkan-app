export function ReportsEmptyState() {
  return (
    <div className="py-24 text-center">
      <div className="mb-4 text-6xl">🔍</div>
      <h3 className="text-foreground mb-2 text-xl font-semibold">
        Tidak ada laporan ditemukan
      </h3>
      <p className="text-muted-foreground">
        Coba ubah filter atau kata kunci pencarian Anda
      </p>
    </div>
  );
}
