import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const { pathname } = request.nextUrl;

  // Redirect root to doctors list (public)
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/doctors", request.url));
  }

  // Already logged in — don't show the login page again
  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL("/doctors", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login"],
};
