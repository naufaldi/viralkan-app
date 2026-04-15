// DEV ONLY — generates 30 seed users (1 admin + 29 regular)

import { faker } from "@faker-js/faker";

export interface SeedUser {
  firebase_uid: string;
  email: string;
  name: string;
  avatar_url: string;
  provider: string;
  role: string;
  created_at: Date;
}

// Hard-coded Indonesian names for realism
const indonesianNames = [
  "Budi Santoso",
  "Siti Rahayu",
  "Agus Wijaya",
  "Dewi Kurniawan",
  "Eko Prasetyo",
  "Fitri Handayani",
  "Gunawan Susanto",
  "Hani Wulandari",
  "Irwan Setiawan",
  "Joko Purnomo",
  "Kartika Sari",
  "Lukman Hakim",
  "Mira Anggraini",
  "Nanang Hidayat",
  "Oktavia Permata",
  "Purnomo Wibowo",
  "Qomariah Nisa",
  "Rizky Firmansyah",
  "Sri Mulyani",
  "Taufik Hidayatullah",
  "Umar Bakri",
  "Vina Rosdiana",
  "Wahyu Nugroho",
  "Xenia Putri",
  "Yusuf Abdillah",
  "Zahra Ramadhani",
  "Andika Pratama",
  "Bella Safitri",
  "Cahyo Nugroho",
  "Diana Kusuma",
];

/**
 * Generates an array of 30 seed users with deterministic data.
 * First user is admin, remaining 29 are regular users.
 */
export const generateUsers = (): SeedUser[] => {
  const users: SeedUser[] = [];

  // Admin user (index 0)
  users.push({
    firebase_uid: "dev-seed-0",
    email: "admin@viralkan.dev",
    name: "Admin Viralkan",
    avatar_url: `https://picsum.photos/seed/admin/200/200`,
    provider: "google",
    role: "admin",
    created_at: faker.date.past({ years: 2 }),
  });

  // 29 regular users (index 1–29)
  for (let i = 1; i <= 29; i++) {
    const name = indonesianNames[i - 1] ?? `User ${i}`;
    const emailSlug = name
      .toLowerCase()
      .replace(/\s+/g, ".")
      .replace(/[^a-z.]/g, "");

    users.push({
      firebase_uid: `dev-seed-${i}`,
      email: `${emailSlug}${i}@viralkan.dev`,
      name,
      avatar_url: `https://picsum.photos/seed/user${i}/200/200`,
      provider: "google",
      role: "user",
      created_at: faker.date.past({ years: 2 }),
    });
  }

  return users;
};
