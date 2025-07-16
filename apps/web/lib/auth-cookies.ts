"use server";
import { cookies } from "next/headers";

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("firebase-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("firebase-token");
}

export async function getAuthCookie() {
  const cookieStore = await cookies();
  return cookieStore.get("firebase-token")?.value;
}
