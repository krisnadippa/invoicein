import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";

export async function POST() {
  try {
    await clearAuthCookie();
    return NextResponse.json({
      success: true,
      message: "Berhasil keluar dari akun.",
    });
  } catch (error) {
    console.error("Logout Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal keluar akun." },
      { status: 500 }
    );
  }
}
