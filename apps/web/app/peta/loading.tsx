const PetaLoading = () => {
  return (
    <div
      className="flex items-center justify-center bg-neutral-100"
      style={{ height: "calc(100vh - 64px)" }}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-neutral-300 border-t-red-600" />
        <p className="text-sm text-neutral-500">Memuat peta...</p>
      </div>
    </div>
  );
};

export default PetaLoading;
