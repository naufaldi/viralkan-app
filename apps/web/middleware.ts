import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Quick token existence check for performance
  const token = request.cookies.get("firebase-token")?.value;

  // Fast redirect for missing tokens
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Basic token format validation (performance optimization)
  if (!token.includes(".") || token.length < 100) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("firebase-token");
    return response;
  }

  // Allow request to proceed to server component for full verification
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/laporan/buat",
    "/admin/:path*",
  ],
};
