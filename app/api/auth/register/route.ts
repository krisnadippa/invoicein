import { NextRequest, NextResponse } from "next/server";
import prisma, { withDbRetry } from "@/lib/prisma";
import { hashPassword, signAuthToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, email, password } = body;

    // 1. Validation
    if (!username || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Semua kolom pendaftaran wajib diisi." },
        { status: 400 }
      );
    }

    const emailClean = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailClean)) {
      return NextResponse.json(
        { success: false, message: "Format email tidak valid." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: "Kata sandi minimal harus 8 karakter." },
        { status: 400 }
      );
    }

    // 2. Check if user already exists (with cold-start retry)
    const existingUser = await withDbRetry(() =>
      prisma.user.findUnique({
        where: { email: emailClean },
      })
    );

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email ini sudah terdaftar. Silakan gunakan email lain atau masuk." },
        { status: 409 }
      );
    }

    // 3. Hash password
    const hashedPassword = await hashPassword(password);

    // 4. Create User and default Company profile in transaction
    const newUser = await withDbRetry(() =>
      prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: emailClean,
            username: username.trim(),
            password: hashedPassword,
            role: "USER",
          },
        });

        const company = await tx.company.create({
          data: {
            userId: user.id,
            companyName: username.trim(),
            email: emailClean,
            bankName: "Bank Central Asia (BCA)",
            accountHolder: username.trim(),
            defaultNotes: "Terima kasih atas kerja samanya. Pembayaran mohon ditransfer ke rekening resmi di atas.",
            themeColor: "#2563eb",
          },
        });

        return { user, company };
      })
    );

    // 5. Sign Auth Token
    const token = await signAuthToken({
      userId: newUser.user.id,
      email: newUser.user.email,
      username: newUser.user.username,
      role: newUser.user.role,
    });

    // 6. Return response with cookie
    const response = NextResponse.json(
      {
        success: true,
        message: "Pendaftaran akun berhasil!",
        user: {
          id: newUser.user.id,
          email: newUser.user.email,
          username: newUser.user.username,
          role: newUser.user.role,
        },
        company: newUser.company,
      },
      { status: 201 }
    );

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server saat mendaftar. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
