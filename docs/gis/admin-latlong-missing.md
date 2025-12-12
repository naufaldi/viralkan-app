# GIS · Handling Reports Without Coordinates (Admin Workflow)

**Status:** Draft (MVP alignment)  
**Context:** Users are allowed to submit reports without latitude/longitude. Admins must be able to see which reports are missing coordinates and fix them.

---

## 1 · Problem

- Some reports arrive with `lat` / `lon` set to `null`:
  - Image has no EXIF GPS data.
  - Geocoding from the client-side form failed or was skipped.
- The location text and street name are still useful, but:
  - Reports cannot be shown on the GIS map.
  - Future spatial queries and prioritization by area become less reliable.

We need:

1. Clear **flagging in the admin table** when a report has missing coordinates.
2. An **admin workflow to fix coordinates**, either manually or via geocoding based on address.

---

## 2 · Data Model · Coordinates

Source table: `reports`

- `lat FLOAT NULL`
- `lon FLOAT NULL`
- `geocoding_source ENUM('exif','nominatim','manual')`
- `geocoded_at TIMESTAMPTZ NULL`

Rules:

- Coordinates are **optional at creation time**.
- When coordinates are later added/updated by admin:
  - `lat` / `lon` are set.
  - `geocoding_source` is updated:
    - `"manual"` when admin types coordinates directly.
    - `"nominatim"` when the backend geocodes from address.
  - `geocoded_at` is set to `NOW()` on the backend.

---

## 3 · Surfaces Affected

### 3.1 Admin Reports Table (`/admin/reports`)

Goal: make missing coordinates immediately visible.

- For each row where `lat === null OR lon === null`:
  - Show a **small warning label** under the location cell:
    - Text: `BUTUH KOORDINAT`
    - Style: subtle warning pill (e.g. `bg-amber-50 text-amber-800 border border-amber-200`).
- This is purely visual; it does **not** block actions like verify/reject/delete.

### 3.2 Admin Report Detail (`/admin/reports/[id]`)

Goal: give admins enough context to decide how to fix the coordinates.

- Show current `lat` / `lon` values (or `-` when missing).
- When both are missing, surface a **highlighted note** explaining:
  - “Koordinat belum tersedia. Silakan isi manual atau gunakan fitur pencarian berdasarkan alamat.”

---

## 4 · Admin Fix Workflow (High-Level)

These flows describe the intended behavior; individual UI steps will be implemented incrementally.

### 4.1 Manual Coordinate Entry

Use-case: admin already knows the exact coordinates (e.g., from a map tool).

1. Admin opens `/admin/reports/[id]`.
2. Admin enters `lat` / `lon` manually in a coordinate form.
3. Frontend calls an **admin-only location update endpoint**:

   ```http
   PUT /api/reports/{id}/admin/location
   Authorization: Bearer <admin-token>
   Body: {
     "lat": number,
     "lon": number,
     "geocoding_source": "manual"
   }
   ```

4. Backend:
   - Validates input (Zod).
   - Updates `lat`, `lon`, `geocoding_source`, `geocoded_at`.
   - Logs admin action in `admin_actions`.

### 4.2 Geocode from Address (Admin)

Use-case: coordinates are missing but we have a good address string.

1. Admin opens `/admin/reports/[id]` and reviews:
   - `street_name`
   - `location_text`
   - administrative fields (district/city/province) when available.
2. Admin clicks “Cari Koordinat dari Alamat”.
3. Frontend calls a **forward geocoding** endpoint (existing Nominatim proxy):

   ```http
   POST /api/reports/geocode/forward
   Authorization: Bearer <admin-token>
   Body: {
     "street_name": string,
     "district": string,
     "city": string,
     "province": string,
     "province_code?": string,
     "regency_code?": string,
     "district_code?": string
   }
   ```

4. Backend:
   - Uses Nominatim to find matching coordinates.
   - Returns candidate `lat` / `lon` and normalized address.
5. Admin sees a **preview** and clicks “Terapkan Koordinat”.
6. Frontend updates the report via the admin location endpoint in §4.1.

---

## 5 · UX Guidelines for Missing Coordinates

- Do **not** block report verification solely because coordinates are missing.
  - Admin may still verify based on textual description.
- Always show:
  - Whether coordinates are present.
  - When they were last geocoded (`geocoded_at`) and from which source.
- Warnings should be **informational**, not alarming:
  - Use amber/yellow tones instead of red for “missing coordinates”.

Copy suggestions (Bahasa):

- Label in table: `BUTUH KOORDINAT`
- Detail page helper text:
  - `Koordinat lokasi belum tersedia untuk laporan ini.`
  - `Anda dapat mengisi koordinat secara manual atau menggunakan pencarian berdasarkan alamat.`

---

## 6 · Implementation Checklist (This Task)

- [x] Document behavior for reports with missing coordinates (this file).
- [ ] Add visual flag in `/admin/reports` table for `lat/lon` missing.
- [ ] Surface coordinate status clearly in `/admin/reports/[id]`.
- [ ] (Next tasks) Wire manual edit + “find from address” flow on the admin detail page using existing geocoding endpoints.
