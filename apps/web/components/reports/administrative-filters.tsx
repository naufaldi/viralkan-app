import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { Building, Loader2 } from "lucide-react";
import { useAdministrative } from "../../hooks/reports/use-administrative";
import { useEffect } from "react";

interface AdministrativeFiltersProps {
  provinsi?: string;
  kabupaten_kota?: string;
  kecamatan?: string;
  onProvinsiChange: (value: string) => void;
  onKabupatenKotaChange: (value: string) => void;
  onKecamatanChange: (value: string) => void;
  className?: string;
}

export function AdministrativeFilters({
  provinsi,
  kabupaten_kota,
  kecamatan,
  onProvinsiChange,
  onKabupatenKotaChange,
  onKecamatanChange,
  className = "",
}: AdministrativeFiltersProps) {
  const { data, loading, refetchRegencies, refetchDistricts } =
    useAdministrative();

  // Fetch dependent data when parent selection changes
  useEffect(() => {
    if (provinsi && provinsi !== "all") {
      refetchRegencies(provinsi);
    }
  }, [provinsi, refetchRegencies]);

  useEffect(() => {
    if (kabupaten_kota && kabupaten_kota !== "all") {
      refetchDistricts(kabupaten_kota);
    }
  }, [kabupaten_kota, refetchDistricts]);

  // Filter options based on selected values
  const filteredRegencies = data.regencies.filter(
    (item) =>
      !provinsi || provinsi === "all" || item.province_code === provinsi,
  );

  const filteredDistricts = data.districts.filter(
    (item) =>
      !kabupaten_kota ||
      kabupaten_kota === "all" ||
      item.regency_code === kabupaten_kota,
  );

  return (
    <section className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2">
        <Building className="h-4 w-4 text-neutral-500" />
        <h3 className="text-sm font-medium text-neutral-700">
          Administrative Filters
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Provinsi Filter */}
        <div className="space-y-2">
          <label
            htmlFor="provinsi-filter"
            className="text-sm font-medium text-neutral-600"
          >
            Provinsi
          </label>
          <Select value={provinsi || "all"} onValueChange={onProvinsiChange}>
            <SelectTrigger id="provinsi-filter" className="w-full">
              <SelectValue placeholder="Pilih Provinsi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Provinsi</SelectItem>
              {loading.provinces ? (
                <SelectItem value="loading" disabled>
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading...
                  </div>
                </SelectItem>
              ) : (
                data.provinces.map((item) => (
                  <SelectItem key={item.code} value={item.code}>
                    {item.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Kabupaten/Kota Filter */}
        <div className="space-y-2">
          <label
            htmlFor="kabupaten-filter"
            className="text-sm font-medium text-neutral-600"
          >
            Kabupaten/Kota
          </label>
          <Select
            value={kabupaten_kota || "all"}
            onValueChange={onKabupatenKotaChange}
            disabled={!provinsi || provinsi === "all"}
          >
            <SelectTrigger id="kabupaten-filter" className="w-full">
              <SelectValue placeholder="Pilih Kabupaten/Kota" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kabupaten/Kota</SelectItem>
              {loading.regencies ? (
                <SelectItem value="loading" disabled>
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading...
                  </div>
                </SelectItem>
              ) : (
                filteredRegencies.map((item) => (
                  <SelectItem key={item.code} value={item.code}>
                    {item.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Kecamatan Filter */}
        <div className="space-y-2">
          <label
            htmlFor="kecamatan-filter"
            className="text-sm font-medium text-neutral-600"
          >
            Kecamatan
          </label>
          <Select
            value={kecamatan || "all"}
            onValueChange={onKecamatanChange}
            disabled={!kabupaten_kota || kabupaten_kota === "all"}
          >
            <SelectTrigger id="kecamatan-filter" className="w-full">
              <SelectValue placeholder="Pilih Kecamatan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kecamatan</SelectItem>
              {loading.districts ? (
                <SelectItem value="loading" disabled>
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading...
                  </div>
                </SelectItem>
              ) : (
                filteredDistricts.map((item) => (
                  <SelectItem key={item.code} value={item.code}>
                    {item.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
    </section>
  );
}
