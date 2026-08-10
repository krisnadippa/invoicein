import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const neonAuthUrl =
    process.env.NEON_AUTH_URL ||
    "https://ep-summer-queen-aymmn3zk.neonauth.c-5.us-east-2.aws.neon.tech/neondb/auth";

  const origin = req.nextUrl.origin;
  const callbackUrl = `${origin}/`;
  const newUserCallbackUrl = `${origin}/register/onboarding`;

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
        newUserCallbackURL: newUserCallbackUrl,
      }),
    });

    const data = await res.json();

    if (data?.url) {
      const response = NextResponse.redirect(data.url);
      const setCookie = res.headers.get("set-cookie");
      if (setCookie) {
        response.headers.set("set-cookie", setCookie);
      }
      return response;
    }

    console.error("Neon Auth Sign-in Error Response:", data);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent("Gagal menginisiasi login Google.")}`, req.url)
    );
  } catch (err) {
    console.error("Neon Auth Fetch Error:", err);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent("Terjadi gangguan koneksi ke server otentikasi.")}`, req.url)
    );
  }
}
