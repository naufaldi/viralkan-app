// Mock data matching API schema types for development and testing

export interface MockReportWithUser {
  id: number;
  user_id: number;
  image_url: string;
  category: "berlubang" | "retak" | "lainnya";
  street_name: string;
  location_text: string;
  lat: number | null;
  lon: number | null;
  created_at: string; // ISO datetime
  user_name: string | null;
  user_avatar: string | null;
}

export interface MockPaginatedReports {
  items: MockReportWithUser[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export const mockReports: MockReportWithUser[] = [
  {
    id: 1,
    user_id: 1,
    image_url: "https://picsum.photos/400/300?random=1",
    category: "berlubang",
    street_name: "Jalan Sudirman",
    location_text: "Depan Gedung BCA Tower, sebelah kiri arah Senayan",
    lat: -6.2088,
    lon: 106.8456,
    created_at: "2024-07-10T08:30:00Z",
    user_name: "Sari Dewi",
    user_avatar:
      "https://ui-avatars.com/api/?name=Sari+Dewi&background=2563eb&color=fff",
  },
  {
    id: 2,
    user_id: 2,
    image_url: "https://picsum.photos/400/300?random=2",
    category: "retak",
    street_name: "Jalan Gatot Subroto",
    location_text: "Dekat flyover Kuningan, jalur kanan",
    lat: -6.2297,
    lon: 106.8372,
    created_at: "2024-07-10T06:15:00Z",
    user_name: "Ahmad Rahman",
    user_avatar:
      "https://ui-avatars.com/api/?name=Ahmad+Rahman&background=2563eb&color=fff",
  },
  {
    id: 3,
    user_id: 3,
    image_url: "https://picsum.photos/400/300?random=3",
    category: "berlubang",
    street_name: "Jalan Thamrin",
    location_text: "Di depan Grand Indonesia Mall, jalur tengah",
    lat: -6.1944,
    lon: 106.8229,
    created_at: "2024-07-10T05:45:00Z",
    user_name: "Maya Sari",
    user_avatar:
      "https://ui-avatars.com/api/?name=Maya+Sari&background=2563eb&color=fff",
  },
  {
    id: 4,
    user_id: 4,
    image_url: "https://picsum.photos/400/300?random=4",
    category: "lainnya",
    street_name: "Jalan HR Rasuna Said",
    location_text: "Dekat Menara Imperium, ada genangan air besar",
    lat: -6.2286,
    lon: 106.8317,
    created_at: "2024-07-09T22:20:00Z",
    user_name: "Budi Santoso",
    user_avatar:
      "https://ui-avatars.com/api/?name=Budi+Santoso&background=2563eb&color=fff",
  },
  {
    id: 5,
    user_id: 5,
    image_url: "https://picsum.photos/400/300?random=5",
    category: "berlubang",
    street_name: "Jalan Casablanca",
    location_text: "Pertigaan menuju Tebet, lubang sangat dalam",
    lat: -6.2236,
    lon: 106.8472,
    created_at: "2024-07-09T19:10:00Z",
    user_name: "Indira Putri",
    user_avatar:
      "https://ui-avatars.com/api/?name=Indira+Putri&background=2563eb&color=fff",
  },
  {
    id: 6,
    user_id: 6,
    image_url: "https://picsum.photos/400/300?random=6",
    category: "retak",
    street_name: "Jalan Kemang Raya",
    location_text: "Depan Mall Kemang Village, retakan panjang",
    lat: -6.2678,
    lon: 106.8133,
    created_at: "2024-07-09T16:30:00Z",
    user_name: "Eko Wijaya",
    user_avatar:
      "https://ui-avatars.com/api/?name=Eko+Wijaya&background=2563eb&color=fff",
  },
  {
    id: 7,
    user_id: 7,
    image_url: "https://picsum.photos/400/300?random=7",
    category: "berlubang",
    street_name: "Jalan Pancoran",
    location_text: "Dekat Pasar Pancoran, lubang di jalur bus",
    lat: -6.2441,
    lon: 106.8497,
    created_at: "2024-07-09T14:15:00Z",
    user_name: "Dewi Kartika",
    user_avatar:
      "https://ui-avatars.com/api/?name=Dewi+Kartika&background=2563eb&color=fff",
  },
  {
    id: 8,
    user_id: 8,
    image_url: "https://picsum.photos/400/300?random=8",
    category: "lainnya",
    street_name: "Jalan Cikini Raya",
    location_text: "Dekat Stasiun Cikini, permukaan jalan rusak parah",
    lat: -6.1925,
    lon: 106.8441,
    created_at: "2024-07-09T12:45:00Z",
    user_name: "Rudi Hartono",
    user_avatar:
      "https://ui-avatars.com/api/?name=Rudi+Hartono&background=2563eb&color=fff",
  },
  {
    id: 9,
    user_id: 9,
    image_url: "https://picsum.photos/400/300?random=9",
    category: "retak",
    street_name: "Jalan Kelapa Gading",
    location_text: "Di depan Mall of Indonesia, retak melintang",
    lat: -6.1586,
    lon: 106.9097,
    created_at: "2024-07-09T10:20:00Z",
    user_name: "Lisa Anggraeni",
    user_avatar:
      "https://ui-avatars.com/api/?name=Lisa+Anggraeni&background=2563eb&color=fff",
  },
  {
    id: 10,
    user_id: 10,
    image_url: "https://picsum.photos/400/300?random=10",
    category: "berlubang",
    street_name: "Jalan Veteran",
    location_text: "Dekat Monas, lubang besar di tengah jalan",
    lat: -6.1701,
    lon: 106.8272,
    created_at: "2024-07-09T08:00:00Z",
    user_name: "Fajar Nugraha",
    user_avatar:
      "https://ui-avatars.com/api/?name=Fajar+Nugraha&background=2563eb&color=fff",
  },
  {
    id: 11,
    user_id: 11,
    image_url: "https://picsum.photos/400/300?random=11",
    category: "berlubang",
    street_name: "Jalan Hayam Wuruk",
    location_text: "Perempatan dengan Jalan Gajah Mada, lubang dalam",
    lat: -6.1478,
    lon: 106.8142,
    created_at: "2024-07-08T21:30:00Z",
    user_name: "Sinta Maharani",
    user_avatar:
      "https://ui-avatars.com/api/?name=Sinta+Maharani&background=2563eb&color=fff",
  },
  {
    id: 12,
    user_id: 12,
    image_url: "https://picsum.photos/400/300?random=12",
    category: "lainnya",
    street_name: "Jalan Raya Bogor",
    location_text: "Dekat Terminal Kampung Rambutan, jalan bergelombang",
    lat: -6.3158,
    lon: 106.8733,
    created_at: "2024-07-08T18:45:00Z",
    user_name: "Yudi Pratama",
    user_avatar:
      "https://ui-avatars.com/api/?name=Yudi+Pratama&background=2563eb&color=fff",
  },
  {
    id: 13,
    user_id: 13,
    image_url: "https://picsum.photos/400/300?random=13",
    category: "retak",
    street_name: "Jalan MT Haryono",
    location_text: "Dekat Cawang UKI, retakan zigzag panjang",
    lat: -6.2419,
    lon: 106.8672,
    created_at: "2024-07-08T16:10:00Z",
    user_name: "Rani Puspitasari",
    user_avatar:
      "https://ui-avatars.com/api/?name=Rani+Puspitasari&background=2563eb&color=fff",
  },
  {
    id: 14,
    user_id: 14,
    image_url: "https://picsum.photos/400/300?random=14",
    category: "berlubang",
    street_name: "Jalan Otista",
    location_text: "Dekat Pasar Jatinegara, lubang di jalur motor",
    lat: -6.2153,
    lon: 106.8747,
    created_at: "2024-07-08T13:25:00Z",
    user_name: "Galih Prabowo",
    user_avatar:
      "https://ui-avatars.com/api/?name=Galih+Prabowo&background=2563eb&color=fff",
  },
  {
    id: 15,
    user_id: 15,
    image_url: "https://picsum.photos/400/300?random=15",
    category: "berlubang",
    street_name: "Jalan Warung Buncit",
    location_text: "Menuju Mampang Prapatan, lubang besar dekat lampu merah",
    lat: -6.2458,
    lon: 106.8253,
    created_at: "2024-07-08T11:50:00Z",
    user_name: "Mila Kencana",
    user_avatar:
      "https://ui-avatars.com/api/?name=Mila+Kencana&background=2563eb&color=fff",
  },
];

// Mock pagination function
export function getMockReportsPaginated(
  page: number = 1,
  limit: number = 10,
  category?: "berlubang" | "retak" | "lainnya",
): MockPaginatedReports {
  let filteredReports = mockReports;

  if (category) {
    filteredReports = mockReports.filter(
      (report) => report.category === category,
    );
  }

  const total = filteredReports.length;
  const pages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const end = start + limit;
  const items = filteredReports.slice(start, end);

  return {
    items,
    total,
    page,
    limit,
    pages,
  };
}

// Category display names and colors
export const categoryConfig = {
  berlubang: {
    label: "Berlubang",
    color: "bg-red-100 text-red-700",
    icon: "🕳️",
  },
  retak: {
    label: "Retak",
    color: "bg-yellow-100 text-yellow-700",
    icon: "⚡",
  },
  lainnya: {
    label: "Lainnya",
    color: "bg-blue-100 text-blue-700",
    icon: "🚧",
  },
};

// Time ago helper function
export function getTimeAgo(dateString: string): string {
  const now = new Date();
  const reportDate = new Date(dateString);
  const diffInHours = Math.floor(
    (now.getTime() - reportDate.getTime()) / (1000 * 60 * 60),
  );

  if (diffInHours < 1) return "Baru saja";
  if (diffInHours < 24) return `${diffInHours} jam yang lalu`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} hari yang lalu`;

  const diffInWeeks = Math.floor(diffInDays / 7);
  return `${diffInWeeks} minggu yang lalu`;
}
