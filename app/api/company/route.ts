import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET current user's company profile
export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const company = await prisma.company.findUnique({
      where: { userId: session.userId },
    });

    return NextResponse.json({ success: true, company });
  } catch (error) {
    console.error("Fetch Company Error:", error);
    return NextResponse.json({ success: false, message: "Gagal memuat profil perusahaan" }, { status: 500 });
  }
}

// PUT update company profile
export async function PUT(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      companyName,
      industry,
      companyAddress,
      taxId,
      phone,
      email,
      website,
      bankName,
      accountNumber,
      accountHolder,
      defaultNotes,
      logoBase64,
      themeColor,
    } = body;

    const updated = await prisma.company.upsert({
      where: { userId: session.userId },
      update: {
        companyName,
        industry,
        companyAddress,
        taxId,
        phone,
        email,
        website,
        bankName,
        accountNumber,
        accountHolder,
        defaultNotes,
        logoBase64,
        themeColor,
      },
      create: {
        userId: session.userId,
        companyName: companyName || session.username,
        industry,
        companyAddress,
        taxId,
        phone,
        email: email || session.email,
        website,
        bankName,
        accountNumber,
        accountHolder,
        defaultNotes,
        logoBase64,
        themeColor: themeColor || "#2563eb",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profil perusahaan berhasil diperbarui!",
      company: updated,
    });
  } catch (error) {
    console.error("Update Company Error:", error);
    return NextResponse.json({ success: false, message: "Gagal memperbarui profil perusahaan" }, { status: 500 });
  }
}
