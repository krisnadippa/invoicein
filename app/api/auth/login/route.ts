import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword, signAuthToken, setAuthCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // 1. Validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email dan kata sandi wajib diisi." },
        { status: 400 }
      );
    }

    const emailClean = email.trim().toLowerCase();

    // 2. Find user in database with company
    const user = await prisma.user.findUnique({
      where: { email: emailClean },
      include: { company: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Email atau kata sandi tidak sesuai." },
        { status: 401 }
      );
    }

    // 3. Verify password
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Email atau kata sandi tidak sesuai." },
        { status: 401 }
      );
    }

    // 4. Sign JWT token
    const token = await signAuthToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    });

    // 5. Set HTTP-only Cookie
    await setAuthCookie(token);

    return NextResponse.json(
      {
        success: true,
        message: "Berhasil masuk ke akun!",
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
        },
        company: user.company,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server saat masuk. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
