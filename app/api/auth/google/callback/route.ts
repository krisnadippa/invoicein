import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { signAuthToken, setAuthCookie, hashPassword } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const state = searchParams.get("state");

  let redirectTo = "/dashboard";
  if (state) {
    try {
      const decoded = JSON.parse(Buffer.from(state, "base64").toString());
      if (decoded.from) redirectTo = decoded.from;
    } catch {
      // Ignore
    }
  }

  if (error || !code) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent("Gagal mengotorisasi akun Google.")}`, req.url)
    );
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent("Kredensial Google OAuth belum disetel di .env")}`, req.url)
    );
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  const redirectUri = `${siteUrl}/api/auth/google/callback`;

  try {
    // 1. Exchange authorization code for access token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      console.error("Google Token Exchange Failed:", tokenData);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent("Gagal menukar token otentikasi Google.")}`, req.url)
      );
    }

    // 2. Fetch Google User Profile info
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const googleUser = await userRes.json();
    if (!userRes.ok || !googleUser.email) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent("Gagal mengambil data profil Google.")}`, req.url)
      );
    }

    const email = googleUser.email.toLowerCase().trim();
    const name = googleUser.name || email.split("@")[0];

    // 3. Find or Create User in Neon PostgreSQL
    let user = await prisma.user.findUnique({
      where: { email },
      include: { company: true },
    });

    if (!user) {
      // Random secure password for OAuth accounts
      const randomPassword = await hashPassword(Math.random().toString(36).slice(-10) + Date.now());

      user = await prisma.user.create({
        data: {
          email,
          username: name,
          password: randomPassword,
          role: "USER",
          company: {
            create: {
              companyName: name,
              email: email,
              bankName: "Bank Central Asia (BCA)",
              accountHolder: name,
              themeColor: "#2563eb",
            },
          },
        },
        include: { company: true },
      });
    }

    // 4. Generate JWT Token
    const token = await signAuthToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    });

    // 5. Set Secure HTTP-Only Cookie
    await setAuthCookie(token);

    return NextResponse.redirect(new URL(redirectTo, req.url));
  } catch (err) {
    console.error("Google OAuth Callback Error:", err);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent("Terjadi kesalahan sistem saat proses masuk Google.")}`, req.url)
    );
  }
}
