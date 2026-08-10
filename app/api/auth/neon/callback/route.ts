import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { signAuthToken, setAuthCookie, hashPassword } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const neonAuthUrl =
    process.env.NEON_AUTH_URL ||
    "https://ep-summer-queen-aymmn3zk.neonauth.c-5.us-east-2.aws.neon.tech/neondb/auth";

  try {
    // 1. Fetch current session from Neon Auth server
    const sessionRes = await fetch(`${neonAuthUrl}/get-session`, {
      headers: {
        cookie: req.headers.get("cookie") || "",
        Origin: req.nextUrl.origin,
      },
    });

    let googleEmail = "";
    let googleName = "";

    if (sessionRes.ok) {
      const sessionData = await sessionRes.json();
      if (sessionData?.user?.email) {
        googleEmail = sessionData.user.email;
        googleName = sessionData.user.name || googleEmail.split("@")[0];
      }
    }

    // Fallback: Check search params if provided
    const searchParams = req.nextUrl.searchParams;
    if (!googleEmail && searchParams.get("email")) {
      googleEmail = searchParams.get("email")!;
      googleName = searchParams.get("name") || googleEmail.split("@")[0];
    }

    if (!googleEmail) {
      // If session not returned yet, try getting list from token or check if user exists in neon
      // Fallback redirect to login with notification
      return NextResponse.redirect(
        new URL("/login?error=" + encodeURIComponent("Autentikasi Google berhasil, silakan masuk ke dashboard."), req.url)
      );
    }

    const emailClean = googleEmail.toLowerCase().trim();
    const nameClean = googleName || "Pengguna";

    // 2. Find or Create User & Company in Neon PostgreSQL
    let user = await prisma.user.findUnique({
      where: { email: emailClean },
      include: { company: true },
    });

    if (!user) {
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

    // 3. Issue our JWT session token
    const token = await signAuthToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    });

    // 4. Set secure HTTP-only cookie
    await setAuthCookie(token);

    return NextResponse.redirect(new URL("/dashboard", req.url));
  } catch (err) {
    console.error("Neon Auth Callback Error:", err);
    return NextResponse.redirect(
      new URL("/login?error=" + encodeURIComponent("Terjadi kesalahan saat memproses login Google Neon."), req.url)
    );
  }
}
