import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const { name, company: clientCompany, email, phone, address, status } = body;

    const company = await prisma.company.findUnique({
      where: { userId: session.userId },
    });

    if (!company) {
      return NextResponse.json({ success: false, message: "Perusahaan tidak ditemukan" }, { status: 404 });
    }

    // Verify ownership of the client
    const existingClient = await prisma.client.findFirst({
      where: { id, companyId: company.id },
    });

    if (!existingClient) {
      return NextResponse.json({ success: false, message: "Klien tidak ditemukan" }, { status: 404 });
    }

    const updated = await prisma.client.update({
      where: { id },
      data: {
        name: name || undefined,
        company: clientCompany,
        email: email,
        phone: phone,
        address: address,
        status: status || undefined,
      },
    });

    return NextResponse.json({ success: true, message: "Klien berhasil diperbarui", client: updated });
  } catch (error) {
    console.error("Update Client Error:", error);
    return NextResponse.json({ success: false, message: "Gagal memperbarui data klien" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const company = await prisma.company.findUnique({
      where: { userId: session.userId },
    });

    if (!company) {
      return NextResponse.json({ success: false, message: "Perusahaan tidak ditemukan" }, { status: 404 });
    }

    // Verify ownership
    const existingClient = await prisma.client.findFirst({
      where: { id, companyId: company.id },
    });

    if (!existingClient) {
      return NextResponse.json({ success: false, message: "Klien tidak ditemukan atau tidak berhak" }, { status: 404 });
    }

    await prisma.client.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Klien berhasil dihapus" });
  } catch (error) {
    console.error("Delete Client Error:", error);
    return NextResponse.json({ success: false, message: "Gagal menghapus klien" }, { status: 500 });
  }
}
