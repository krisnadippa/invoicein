import { NextRequest, NextResponse } from "next/server";

const NEON_AUTH_URL =
  process.env.NEON_AUTH_URL ||
  "https://ep-summer-queen-aymmn3zk.neonauth.c-5.us-east-2.aws.neon.tech/neondb/auth";

async function proxyToNeonAuth(req: NextRequest) {
  const url = new URL(req.url);
  // Extract subpath after /api/neon-auth
  const subpath = url.pathname.replace(/^\/api\/neon-auth/, "");
  const targetUrl = `${NEON_AUTH_URL}${subpath}${url.search}`;

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    if (key.toLowerCase() !== "host") {
      headers.set(key, value);
    }
  });

  headers.set("Origin", url.origin);

  let body: ArrayBuffer | undefined = undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    body = await req.arrayBuffer();
  }

  try {
    const res = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      redirect: "manual",
    });

    const responseHeaders = new Headers();
    res.headers.forEach((value, key) => {
      if (key.toLowerCase() === "set-cookie") {
        const rewrittenCookie = value
          .replace(/Domain=[^;]+;?/gi, "")
          .replace(/SameSite=None;?/gi, "SameSite=Lax;")
          .replace(/Secure;?/gi, "");
        responseHeaders.append("set-cookie", rewrittenCookie);
      } else {
        responseHeaders.set(key, value);
      }
    });

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (location) {
        return NextResponse.redirect(location, {
          status: res.status,
          headers: responseHeaders,
        });
      }
    }

    const responseBody = await res.arrayBuffer();
    return new NextResponse(responseBody, {
      status: res.status,
      headers: responseHeaders,
    });
  } catch (err) {
    console.error("Neon Auth Proxy Error:", err);
    return NextResponse.json(
      { error: "Internal Auth Proxy Error", message: String(err) },
      { status: 500 }
    );
  }
}

export const GET = proxyToNeonAuth;
export const POST = proxyToNeonAuth;
export const PUT = proxyToNeonAuth;
export const DELETE = proxyToNeonAuth;
export const PATCH = proxyToNeonAuth;
