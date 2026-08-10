import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Sesi tidak ditemukan atau telah berakhir." },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { company: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Pengguna tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      company: user.company,
    });
  } catch (error) {
    console.error("Get Current User Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data akun." },
      { status: 500 }
    );
  }
}
