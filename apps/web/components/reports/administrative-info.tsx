import { Building } from "lucide-react";

interface AdministrativeInfoProps {
  kecamatan?: string;
  kabupaten_kota?: string;
  provinsi?: string;
  // API field mappings
  district?: string;
  city?: string;
  province?: string;
  className?: string;
}

export function AdministrativeInfo({
  kecamatan,
  kabupaten_kota,
  provinsi,
  district,
  city,
  province,
  className = "",
}: AdministrativeInfoProps) {
  // Use API fields if available, otherwise use display fields
  const kecamatanValue = district || kecamatan;
  const kabupatenKotaValue = city || kabupaten_kota;
  const provinsiValue = province || provinsi;
  
  // Don't render if no administrative data
  if (!kecamatanValue && !kabupatenKotaValue && !provinsiValue) {
    return null;
  }

  return (
    <section 
      className={`space-y-2 pt-3 border-t border-neutral-100 ${className}`}
      aria-label="Administrative Information"
    >
      <div className="flex items-center gap-2 text-sm text-neutral-500">
        <Building className="h-4 w-4" />
        <span className="font-medium">Administrative Info:</span>
      </div>
      
      <dl className="space-y-1">
        {kecamatanValue && (
          <div className="flex items-center gap-2">
            <dt className="text-sm font-medium text-neutral-600 min-w-[80px]">
              Kecamatan:
            </dt>
            <dd className="text-sm text-neutral-500">
              {kecamatanValue}
            </dd>
          </div>
        )}
        
        {kabupatenKotaValue && (
          <div className="flex items-center gap-2">
            <dt className="text-sm font-medium text-neutral-600 min-w-[80px]">
              Kabupaten/Kota:
            </dt>
            <dd className="text-sm text-neutral-500">
              {kabupatenKotaValue}
            </dd>
          </div>
        )}
        
        {provinsiValue && (
          <div className="flex items-center gap-2">
            <dt className="text-sm font-medium text-neutral-600 min-w-[80px]">
              Provinsi:
            </dt>
            <dd className="text-sm text-neutral-500">
              {provinsiValue}
            </dd>
          </div>
        )}
      </dl>
    </section>
  );
} 