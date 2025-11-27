# RFC – Improve Create Report Flow (Auto Location & Easier Form)

## 1. Summary

Today, users can create a report but still feel that the form is heavy and too “technical” (lat/lon, many fields).  
This RFC refines the create report flow so that:

- Users mostly interact with **photo + simple address + description**, not coordinates.
- **EXIF GPS** and **reverse geocoding** do the heavy lifting in the background.
- The UI follows our UX principles to feel lighter, clearer, and faster to complete.

This RFC builds on the current `CreateReportForm` and `ReportForm` implementation in `apps/web`, and the administrative sync / geocoding flow, without changing core data structures.

---

## 2. Goals

- Make it **very easy and fast** for citizens to submit a road damage report.
- Hide **technical details** (lat/lon) from the UI while still capturing precise data.
- Auto‑fill address fields when possible, with **clear fallbacks** when automation fails.
- Apply our UX principles (see `docs/ux-principle.md`) so the form feels simple, familiar, and trustworthy.

Non‑goals:

- No new map view in this iteration.
- No advanced editing tools (crop, draw on map, etc.).

---

## 3. Green Path: Ideal User Story

1. User opens the **Buat Laporan Baru** page.
2. User sees two clear modes (Hick’s Law, Goal‑Gradient):
   - **Foto & Lokasi Otomatis** (default, recommended)
   - **Foto & Alamat Manual**
3. In **Foto & Lokasi Otomatis** mode:
   - User selects or takes a **photo** of the road damage.
   - The app extracts **EXIF GPS** from the photo.
   - **Lat/Lon are never shown in the UI** (technical detail), but:
     - The app calls backend geocoding with lat/lon.
     - Backend returns **street, district, city, province**.
   - The form auto‑fills:
     - **Jalan / Nama Jalan**
     - **Kecamatan / Distrik**
     - **Kota / Kabupaten**
     - **Provinsi**
   - Auto‑filled address fields are **visible and editable** so users can correct them.
   - User types a short **deskripsi lokasi** (e.g. “di depan Indomaret, dekat lampu merah”).
4. User taps the **primary submit button** (large, clear, bottom of card, Fitts’s Law).
5. Report is created successfully, and user sees a clear **success state** and navigation back to their reports / detail page.

---

## 4. Edge Cases & Fallbacks

### 4.1 EXIF Missing or Invalid

- User uploads a photo **without EXIF GPS** or with invalid coordinates.
- System behavior:
  - Show a gentle **EXIF warning** in the auto mode (“Lokasi foto tidak terbaca, coba isi alamat manual.”).
  - Do **not** show lat/lon inputs.
  - Auto mode can:
    - Try **device geolocation** (if user allows), and/or
    - Encourage switching to **Foto & Alamat Manual** tab to complete address.
  - Address fields remain **empty**, user must fill them manually.
  - After the user fills a valid address (province, city, district, street/area):
    - The system performs **forward geocoding** on the address to derive lat/lon.
    - Lat/lon are stored in the payload but remain **hidden from the UI**.
    - If forward geocoding fails, the report is still accepted as long as required address fields are valid.

### 4.2 Reverse Geocoding Fails

- EXIF GPS exists, but backend **reverse geocoding fails** or returns low confidence.
- System behavior:
  - Keep lat/lon stored in the payload, but:
    - Show a **yellow inline banner** near address fields:
      - “Kami tidak bisa menemukan alamat yang pasti dari lokasi foto. Mohon lengkapi alamat di bawah ini.”
  - Do not pre‑fill incorrect address; instead:
    - Focus the first address field (e.g. street).
    - User fills **street, district, city, province** manually.
  - User can still submit once all required fields are valid.

### 4.3 Manual Mode: No Automation

- In **Foto & Alamat Manual** mode:
  - User uploads a photo (no EXIF requirement).
  - User selects/enters address using our administrative select:
    - **Provinsi → Kabupaten/Kota → Kecamatan**
    - Optional **street** field.
  - Once a valid address is provided, the backend performs **forward geocoding** to store lat/lon:
    - This happens **fully in the background**, no lat/lon fields in UI.
    - This ensures we “always try” to have coordinates, without ever asking the user to handle lat/lon directly.
  - If forward geocoding fails, the report is still accepted as long as required address fields are filled.

### 4.4 Form Validation & Errors

- Required fields:
  - At least one **photo**.
  - **Address** (auto-filled or manual): province, city, district, and street/area.
  - **Deskripsi lokasi** (short text).
- If validation fails:
  - Errors are grouped near the top (ReportFormError) and inline on each field.
  - Primary button stays in place (Fitts’s Law) but is disabled during submission.

### 4.5 Admin Remediation for Failed Geocoding

- If both EXIF extraction and forward/reverse geocoding fail, the report is still accepted with the user-provided address.
- Admins must be able to **edit lat/lon and address metadata later** from the admin tools to correct location precision post-submission.

---

## 5. UX Principles Applied (from `docs/ux-principle.md`)

### 5.1 Aesthetic‑Usability Effect

- Use **clean spacing** and typography inside the report card:
  - Consistent gaps (`gap-4`, `space-y-4`), generous padding (`px-6`, `py-6`).
  - Clear hierarchy:
    - Title: “Buat Laporan Baru”
    - Section headings (Foto, Lokasi, Deskripsi).
- Subtle card shadow and border to make the form feel trustworthy and easy.

### 5.2 Hick’s Law

- Limit visible choices at any time:
  - Two top‑level modes via **Tabs**: Auto vs Manual.
  - Within each mode, show only the fields relevant to that mode.
- Advanced/technical options (coordinates, confidence scores) stay hidden from the end user.

### 5.3 Fitts’s Law

- Primary action button (“Kirim Laporan”) is:
  - Wide, visually distinct, placed at the **bottom of the card**.
  - Always in a predictable location, so repeat users can quickly submit.
- Secondary actions (cancel, reset) are visually lighter and placed to avoid accidental taps.

### 5.4 Law of Proximity

- Group related inputs using spacing and card layout:
  - **Photo section**: upload, EXIF warning, help text.
  - **Lokasi section**: automatic address / manual address inputs.
  - **Deskripsi section**: free‑text description.
- Each logical group uses consistent padding and background so the form feels “chunked”, not like a long list.

### 5.5 Zeigarnik & Goal‑Gradient Effects

- Show a simple **2‑step mental model**:
  - Step 1: Foto
  - Step 2: Detail Lokasi
- Visual cues:
  - Tabs highlight the current mode.
  - Section headings and subtle numbering (“Langkah 1”, “Langkah 2”) can be added to reinforce progress.

### 5.6 Law of Similarity

- Use consistent styles for:
  - All selects (province, city, district).
  - All text inputs (street, description).
  - All buttons (primary vs secondary).
- Ensures the create and edit forms look and behave the same, reducing confusion.

### 5.7 Miller’s Law

- Limit the number of **simultaneously visible** form groups:
  - Photo, Address, Description (3 main groups).
  - Within each group, keep fields focused and labeled clearly.
- Avoid exposing raw IDs or long technical labels; use human‑friendly Indonesian copy.

### 5.8 Doherty Threshold

- When running EXIF extraction or geocoding:
  - Show **loading states** (spinner, skeleton text) inside the address section.
  - If the operation takes longer than ~400 ms, show feedback like “Mencari alamat dari foto…”.
- The user should always feel that the system is responding, not stuck.

---

## 6. Implementation Notes (High Level)

These notes are for future implementation work; this RFC only defines behavior and UX.

- **Auto mode**:
  - Extract EXIF on the client when the image is selected.
  - Store lat/lon in form state (hidden), send to API.
  - API performs reverse geocoding and returns structured address.
  - The form maps this to existing fields used by `administrative-select` and related components.
- **Manual mode**:
  - Use existing `administrative-select` component to select province/city/district.
  - Allow free‑text street / nearby landmark.
  - API may attempt forward geocoding but does not block submission on failure.
- **Editing reports**:
  - The same principles should apply when editing: keep lat/lon hidden, focus on address + description.

This RFC can be referenced from the main `docs/rfc.md` as “Create Report UX v2 – Auto Location & Simplified Form” once approved.
