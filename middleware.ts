import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET_STRING = process.env.JWT_SECRET || "invoicein-secure-jwt-secret-key-2026-production-token";
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);
const AUTH_COOKIE_NAME = "invoicein_session";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;

  let isAuthenticated = false;
  if (token) {
    try {
      await jwtVerify(token, JWT_SECRET);
      isAuthenticated = true;
    } catch {
      isAuthenticated = false;
    }
  }

  // 1. Protected routes: /dashboard/* and /superadmin/*
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/superadmin")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Auth routes: redirect to dashboard if already logged in
  if ((pathname === "/login" || pathname === "/register") && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/superadmin/:path*",
    "/login",
    "/register",
  ],
};
