import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { signAuthToken, setAuthCookie, hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email tidak ditemukan." },
        { status: 400 }
      );
    }

    const emailClean = email.toLowerCase().trim();
    const nameClean = name ? name.trim() : emailClean.split("@")[0];

    // 1. Find or Create User & Company in Neon PostgreSQL
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

    // 2. Issue our JWT session token
    const authToken = await signAuthToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    });

    // 3. Set secure HTTP-only cookie
    await setAuthCookie(authToken);

    return NextResponse.json({
      success: true,
      isNewUser,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      company: user.company,
    });
  } catch (error) {
    console.error("Neon Auth Sync Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menyinkronkan data pengguna." },
      { status: 500 }
    );
  }
}
