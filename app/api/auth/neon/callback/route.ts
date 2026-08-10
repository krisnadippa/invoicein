import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { signAuthToken, setAuthCookie, hashPassword } from "@/lib/auth";
import { createRemoteJWKSet, jwtVerify } from "jose";

const JWKS_URL =
  process.env.NEON_AUTH_JWKS_URL ||
  "https://ep-summer-queen-aymmn3zk.neonauth.c-5.us-east-2.aws.neon.tech/neondb/auth/.well-known/jwks.json";

const JWKS = createRemoteJWKSet(new URL(JWKS_URL));

export async function GET(req: NextRequest) {
  const neonAuthUrl =
    process.env.NEON_AUTH_URL ||
    "https://ep-summer-queen-aymmn3zk.neonauth.c-5.us-east-2.aws.neon.tech/neondb/auth";

  const searchParams = req.nextUrl.searchParams;
  const token =
    searchParams.get("token") ||
    searchParams.get("session_token") ||
    searchParams.get("access_token") ||
    searchParams.get("id_token");

  const urlError = searchParams.get("error");
  if (urlError) {
    console.error("Neon Auth Error param:", urlError);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(urlError)}`, req.url)
    );
  }

  let googleEmail = searchParams.get("email") || "";
  let googleName = searchParams.get("name") || "";

  // 1. Try verifying token via JWKS if token exists
  if (token && !googleEmail) {
    try {
      const { payload } = await jwtVerify(token, JWKS);
      if (payload.email) {
        googleEmail = payload.email as string;
        googleName = (payload.name as string) || (payload.username as string) || googleEmail.split("@")[0];
      }
    } catch (jwksErr) {
      console.warn("JWKS verification note:", jwksErr);
    }
  }

  // 2. Try querying Neon Auth get-session endpoint with headers & cookies
  if (!googleEmail) {
    try {
      const headers: Record<string, string> = {
        Origin: req.nextUrl.origin,
      };

      const incomingCookie = req.headers.get("cookie");
      if (incomingCookie) headers["cookie"] = incomingCookie;
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const sessionRes = await fetch(`${neonAuthUrl}/get-session`, {
        headers,
      });

      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        if (sessionData?.user?.email) {
          googleEmail = sessionData.user.email;
          googleName = sessionData.user.name || googleEmail.split("@")[0];
        }
      }
    } catch (sessionErr) {
      console.error("Failed to query Neon Auth session:", sessionErr);
    }
  }

  // 3. Fallback: Check if token can be parsed as JWT payload directly
  if (!googleEmail && token) {
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        const decodedPayload = JSON.parse(Buffer.from(parts[1], "base64").toString());
        if (decodedPayload.email) {
          googleEmail = decodedPayload.email;
          googleName = decodedPayload.name || googleEmail.split("@")[0];
        }
      }
    } catch {
      // Ignore
    }
  }

  // If still no email found
  if (!googleEmail) {
    console.error("Could not obtain user email from Neon Auth response. Query params:", Object.fromEntries(searchParams));
    return NextResponse.redirect(
      new URL(
        "/login?error=" +
          encodeURIComponent("Sesi Google tidak terdeteksi. Silakan coba klik login Google lagi atau gunakan email & kata sandi."),
        req.url
      )
    );
  }

  const emailClean = googleEmail.toLowerCase().trim();
  const nameClean = googleName.trim() || emailClean.split("@")[0];

  try {
    // 4. Find or Create User & Company in Neon PostgreSQL
    let user = await prisma.user.findUnique({
      where: { email: emailClean },
      include: { company: true },
    });

    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      const randomPassword = await hashPassword(Math.random().toString(36).slice(-10) + Date.now());
      user = await prisma.user.create({
        data: {
          email: emailClean,
          username: nameClean,
          password: randomPassword,
          role: "USER",
          company: {
            create: {
              companyName: nameClean,
              email: emailClean,
              bankName: "Bank Central Asia (BCA)",
              accountHolder: nameClean,
              themeColor: "#2563eb",
            },
          },
        },
        include: { company: true },
      });
    }

    // 5. Issue our JWT session token
    const authToken = await signAuthToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    });

    // 6. Set secure HTTP-only cookie
    await setAuthCookie(authToken);

    // Redirect to onboarding for new users, or dashboard for returning users
    const redirectPath = isNewUser ? "/register/onboarding" : "/dashboard";
    return NextResponse.redirect(new URL(redirectPath, req.url));
  } catch (dbErr) {
    console.error("Neon DB Sync Error:", dbErr);
    return NextResponse.redirect(
      new URL("/login?error=" + encodeURIComponent("Gagal menyinkronkan data akun ke database."), req.url)
    );
  }
}
