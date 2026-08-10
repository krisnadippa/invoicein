import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const neonAuthUrl =
    process.env.NEON_AUTH_URL ||
    "https://ep-summer-queen-aymmn3zk.neonauth.c-5.us-east-2.aws.neon.tech/neondb/auth";

  // Determine base site origin
  const origin = req.nextUrl.origin;
  const callbackUrl = `${origin}/api/auth/neon/callback`;

  try {
    const res = await fetch(`${neonAuthUrl}/sign-in/social`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: origin,
      },
      body: JSON.stringify({
        provider: "google",
        callbackURL: callbackUrl,
        newUserCallbackURL: callbackUrl,
      }),
    });

    const data = await res.json();

    if (data.url) {
      return NextResponse.redirect(data.url);
    }

    console.error("Neon Auth Error:", data);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent("Gagal menginisiasi login Google via Neon Auth.")}`, req.url)
    );
  } catch (err) {
    console.error("Neon Auth Fetch Error:", err);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent("Terjadi gangguan koneksi ke Neon Auth.")}`, req.url)
    );
  }
}
