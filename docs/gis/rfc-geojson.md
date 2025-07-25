# Viralkan GIS RFC – GeoJSON & Location Services

**Goal:** Implement bidirectional geocoding with EXIF metadata extraction to enable seamless location data capture and map visualization for road damage reports.

---

## 1 · Scope

### **IN**
- EXIF metadata extraction from uploaded images
- Bidirectional geocoding (coordinates ↔ address) via Nominatim
- Auto-fill location data from coordinates or address input
- GeoJSON API endpoints for Leaflet map integration
- Administrative boundary detection (kecamatan, kota, provinsi)
- Metadata validation and user warnings
- Map visualization with custom markers

### **OUT**
- Real-time geocoding during form input (V3)
- Advanced GIS spatial queries (V3)
- Map clustering and advanced filtering (V3)
- Offline geocoding capabilities

---

## 2 · Tech Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Geocoding** | OpenStreetMap Nominatim | Free, good Indonesia coverage |
| **EXIF Extraction** | `exifr` library | Extract GPS metadata from images |
| **Map Visualization** | Leaflet.js | Interactive map display |
| **Data Format** | GeoJSON | Standard geographic data format |
| **Spatial Database** | PostgreSQL + PostGIS | GIS-ready storage |
| **Rate Limiting** | Custom middleware | Nominatim rate limit compliance |

---

## 3 · Data Flow Architecture

```
User Upload Image → EXIF Extraction → GPS Coordinates → Nominatim Reverse Geocoding → Auto-fill Form
     ↓
Manual Input (Coordinates OR Address) → Nominatim Forward/Reverse Geocoding → Auto-fill Form
     ↓
Form Submission → Database Storage → GeoJSON API → Leaflet Map Display
```

### **3.1 User Experience Flow**

**Flow A: Image with GPS Metadata**
1. User uploads photo with GPS data
2. System extracts lat/lng from EXIF
3. System calls Nominatim reverse geocoding
4. Form auto-fills: street_name, kecamatan, kota, provinsi
5. User can edit any field manually
6. Submit report

**Flow B: Image without GPS Metadata**
1. User uploads photo without GPS data
2. System shows warning: "No location data found in image"
3. User manually enters coordinates OR address
4. System calls Nominatim geocoding based on input
5. Form auto-fills remaining fields
6. Submit report

**Flow C: Manual Location Input**
1. User enters coordinates → System reverse geocodes → Auto-fills address fields
2. User enters address → System forward geocodes → Auto-fills coordinate fields
3. User can override any auto-filled data
4. Submit report

---

## 4 · API Design

### **4.1 Geocoding Service Endpoints**

```http
POST /api/geocoding/extract-exif
Content-Type: multipart/form-data
Body: { image: File }
→ 200 OK { lat: number, lon: number, address: LocationData } | 400 No GPS Data

POST /api/geocoding/reverse
Body: { lat: number, lon: number }
→ 200 OK { address: LocationData } | 400 Invalid Coordinates

POST /api/geocoding/forward  
Body: { address: string }
→ 200 OK { lat: number, lon: number, address: LocationData } | 400 Address Not Found

GET /api/reports/geojson?status=pending&category=berlubang
→ 200 OK { type: "FeatureCollection", features: [...] }
```

### **4.2 Data Structures**

```typescript
interface LocationData {
  lat?: number;
  lon?: number;
  street_name?: string;
  kecamatan?: string;
  kota?: string;
  provinsi?: string;
  country?: string;
  geocoded_at?: string;
  geocoding_source?: 'exif' | 'nominatim' | 'manual';
}

interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [lon, lat]
  };
  properties: {
    id: string;
    category: string;
    street_name: string;
    kecamatan?: string;
    kota?: string;
    provinsi?: string;
    status: string;
    created_at: string;
    image_url: string;
  };
}
```

---

## 5 · Database Schema Updates

### **5.1 New Columns**

```sql
-- Add administrative location fields
ALTER TABLE reports ADD COLUMN kecamatan TEXT;
ALTER TABLE reports ADD COLUMN kota TEXT;
ALTER TABLE reports ADD COLUMN provinsi TEXT;
ALTER TABLE reports ADD COLUMN country TEXT DEFAULT 'Indonesia';

-- Add geocoding metadata
ALTER TABLE reports ADD COLUMN geocoded_at TIMESTAMPTZ;
ALTER TABLE reports ADD COLUMN geocoding_source TEXT CHECK (geocoding_source IN ('exif', 'nominatim', 'manual'));

-- Add indexes for performance
CREATE INDEX reports_kecamatan_idx ON reports(kecamatan);
CREATE INDEX reports_kota_idx ON reports(kota);
CREATE INDEX reports_provinsi_idx ON reports(provinsi);
CREATE INDEX reports_location_filter_idx ON reports(provinsi, kota, kecamatan);
```

### **5.2 Spatial Index (Already Exists)**
```sql
-- PostGIS spatial index for map queries
CREATE INDEX reports_geo_idx ON reports USING GIST (geography(ST_MakePoint(lon,lat)))
WHERE lat IS NOT NULL AND lon IS NOT NULL;
```

---

## 6 · Implementation Strategy

### **6.1 EXIF Extraction Service**

**Purpose:** Extract GPS coordinates from uploaded images

**Process:**
1. Receive uploaded image file
2. Use `exifr` library to parse EXIF data
3. Extract GPS coordinates (lat/lng)
4. Return coordinates or null if no GPS data
5. Log extraction success/failure for analytics

**Error Handling:**
- No EXIF data: Return null with warning
- Corrupted EXIF: Return null with error
- Invalid coordinates: Validate range (-90 to 90, -180 to 180)

### **6.2 Nominatim Geocoding Service**

**Purpose:** Bidirectional geocoding with rate limiting

**Configuration:**
- Base URL: `https://nominatim.openstreetmap.org`
- Rate limit: 1 request per second
- Language: Indonesian (`accept-language=id`)
- Format: JSON with address details

**Caching Strategy:**
- Cache successful geocoding results
- Cache key: `geocoding:${lat}:${lon}` or `geocoding:${address_hash}`
- TTL: 24 hours (addresses don't change frequently)

**Error Handling:**
- Rate limit exceeded: Queue request with exponential backoff
- Network error: Retry with circuit breaker
- Invalid response: Log error and return null

### **6.3 GeoJSON API Service**

**Purpose:** Serve reports data in GeoJSON format for maps

**Features:**
- Filter by status, category, date range
- Pagination for large datasets
- Custom marker properties
- Spatial queries using PostGIS

**Performance:**
- Database query optimization with indexes
- Response caching for public data
- Compression for large GeoJSON responses

---

## 7 · User Experience Design

### **7.1 Form Auto-fill Behavior**

**Smart Field Population:**
- If coordinates provided: Auto-fill address fields
- If address provided: Auto-fill coordinate fields
- If EXIF data available: Auto-fill all location fields
- User can override any auto-filled field

**Visual Feedback:**
- Loading indicators during geocoding
- Success indicators for auto-filled fields
- Warning messages for missing metadata
- Error messages for geocoding failures

### **7.2 Metadata Validation**

**Image Requirements:**
- Minimum resolution: 800x600 pixels
- Supported formats: JPEG, PNG, HEIC
- Maximum file size: 10MB

**GPS Metadata:**
- Required for automatic location detection
- Warning if missing: "Add location data to your photos for automatic location detection"
- Manual input fallback always available

### **7.3 Map Integration**

**Leaflet Map Features:**
- Custom markers by damage category
- Rich popups with report details
- Administrative boundary filtering
- Responsive design for mobile

**Marker Styling:**
- Berlubang (holes): Red circles
- Retak (cracks): Orange circles  
- Lainnya (others): Gray circles
- Size based on zoom level

---

## 8 · Security & Performance

### **8.1 Rate Limiting**

```typescript
const RATE_LIMITS = {
  NOMINATIM_REQUESTS: { max: 1, window: "1s" }, // Nominatim requirement
  EXIF_EXTRACTION: { max: 10, window: "1m" },
  GEOJSON_REQUESTS: { max: 100, window: "1m" },
};
```

### **8.2 Input Validation**

**Coordinate Validation:**
- Latitude: -90 to 90 degrees
- Longitude: -180 to 180 degrees
- Precision: Maximum 6 decimal places
- Indonesia bounds checking (optional)

**Address Validation:**
- Minimum length: 3 characters
- Maximum length: 500 characters
- Sanitize special characters
- Prevent injection attacks

### **8.3 Caching Strategy**

**Geocoding Cache:**
- Redis or in-memory cache
- Key: `geocoding:${input_hash}`
- TTL: 24 hours for successful results
- No cache for failed requests

**GeoJSON Cache:**
- Cache public reports data
- Invalidate on new report creation
- TTL: 5 minutes for fresh data
- Compress large responses

---

## 9 · Error Handling

### **9.1 User-Friendly Messages**

**EXIF Extraction Errors:**
- "No location data found in this image. Please add GPS data to your photos or enter location manually."
- "Unable to read image metadata. Please try a different image or enter location manually."

**Geocoding Errors:**
- "Location not found. Please check your address or coordinates."
- "Service temporarily unavailable. Please try again in a moment."
- "Rate limit exceeded. Please wait a moment before trying again."

**Validation Errors:**
- "Invalid coordinates. Please check latitude and longitude values."
- "Address too short. Please provide a more specific location."

### **9.2 Fallback Strategies**

**Primary Fallback:**
1. EXIF extraction fails → Manual input
2. Nominatim unavailable → Manual coordinates only
3. Geocoding fails → Partial form with available data

**Secondary Fallback:**
1. Cache previous successful geocoding results
2. Use approximate location based on user's last known location
3. Provide location suggestions from recent reports

---

## 10 · Testing Strategy

### **10.1 Unit Tests**

**EXIF Extraction:**
- Test with images containing GPS data
- Test with images without GPS data
- Test with corrupted image files
- Test coordinate validation

**Geocoding Service:**
- Test forward geocoding with valid addresses
- Test reverse geocoding with valid coordinates
- Test rate limiting behavior
- Test error handling and fallbacks

### **10.2 Integration Tests**

**End-to-End Flow:**
- Complete report creation with EXIF data
- Complete report creation with manual input
- Map display with GeoJSON data
- Form auto-fill behavior

**API Testing:**
- GeoJSON endpoint with various filters
- Geocoding endpoints with valid/invalid inputs
- Rate limiting compliance
- Error response formats

### **10.3 Performance Tests**

**Load Testing:**
- Concurrent geocoding requests
- Large GeoJSON response handling
- Database query performance
- Cache hit/miss ratios

---

## 11 · Monitoring & Analytics

### **11.1 Key Metrics**

**Geocoding Performance:**
- Success rate by input type (EXIF vs manual)
- Average response time for Nominatim calls
- Cache hit rate for geocoding results
- Error rates by error type

**User Behavior:**
- Percentage of reports with EXIF data
- Manual input vs auto-fill usage
- Map interaction patterns
- Location accuracy feedback

### **11.2 Health Checks**

**Service Health:**
- Nominatim API availability
- EXIF extraction success rate
- GeoJSON API response times
- Database spatial query performance

---

## 12 · Deployment Considerations

### **12.1 Environment Variables**

```bash
# Geocoding Configuration
NOMINATIM_BASE_URL=https://nominatim.openstreetmap.org
NOMINATIM_RATE_LIMIT=1
NOMINATIM_USER_AGENT=Viralkan/1.0

# Caching Configuration
REDIS_URL=redis://localhost:6379
GEOCODING_CACHE_TTL=86400
GEOJSON_CACHE_TTL=300

# Validation Configuration
MAX_COORDINATE_PRECISION=6
MIN_ADDRESS_LENGTH=3
MAX_ADDRESS_LENGTH=500
```

### **12.2 Dependencies**

```json
{
  "dependencies": {
    "exifr": "^7.1.3",
    "leaflet": "^1.9.4",
    "redis": "^4.6.10"
  }
}
```

---

## 13 · Future Enhancements (V3)

### **13.1 Advanced Features**
- Real-time address autocomplete
- Map clustering for performance
- Spatial queries (reports within radius)
- Offline geocoding capabilities
- Advanced GIS analytics

### **13.2 Performance Optimizations**
- CDN for GeoJSON responses
- Database query optimization
- Advanced caching strategies
- Background geocoding processing

---

## 14 · Success Criteria

### **14.1 Functional Requirements**
- ✅ EXIF extraction works for 95% of GPS-enabled images
- ✅ Bidirectional geocoding accuracy > 90% for Indonesian addresses
- ✅ Map displays all reports with correct markers
- ✅ Form auto-fill reduces manual input by 70%

### **14.2 Performance Requirements**
- ✅ Geocoding response time < 2 seconds
- ✅ GeoJSON API response time < 1 second
- ✅ Map loads within 3 seconds
- ✅ 99.9% uptime for geocoding services

### **14.3 User Experience Requirements**
- ✅ Users can create reports with minimal location input
- ✅ Clear feedback for missing metadata
- ✅ Intuitive map interaction
- ✅ Mobile-responsive design

---

_This RFC provides a complete technical specification for implementing GIS functionality in Viralkan, enabling seamless location data capture and map visualization._
