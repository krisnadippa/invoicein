import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
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

    const invoice = await prisma.invoice.findFirst({
      where: { id, companyId: company.id },
      include: {
        items: true,
        clientRef: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ success: false, message: "Invoice tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, invoice });
  } catch (error) {
    console.error("Fetch Invoice Detail Error:", error);
    return NextResponse.json({ success: false, message: "Gagal memuat detail invoice" }, { status: 500 });
  }
}

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
    const { status, amountPaid, balanceDue } = body;

    const company = await prisma.company.findUnique({
      where: { userId: session.userId },
    });

    if (!company) {
      return NextResponse.json({ success: false, message: "Perusahaan tidak ditemukan" }, { status: 404 });
    }

    // Verify ownership
    const existing = await prisma.invoice.findFirst({
      where: { id, companyId: company.id },
    });

    if (!existing) {
      return NextResponse.json({ success: false, message: "Invoice tidak ditemukan" }, { status: 404 });
    }

    // Convert Indonesian status if any
    let dbStatus = status;
    if (status === "Lunas" || status === "Paid") {
      dbStatus = "Paid";
    } else if (status === "Menunggu" || status === "Pending") {
      dbStatus = "Pending";
    } else if (status === "Jatuh Tempo" || status === "Overdue") {
      dbStatus = "Overdue";
    } else if (status === "Draft") {
      dbStatus = "Draft";
    }

    const updated = await prisma.invoice.update({
      where: { id },
      data: {
        status: dbStatus || undefined,
        amountPaid: amountPaid !== undefined ? Number(amountPaid) : undefined,
        balanceDue: balanceDue !== undefined ? Number(balanceDue) : undefined,
      },
    });

    return NextResponse.json({ success: true, message: "Invoice berhasil diperbarui", invoice: updated });
  } catch (error) {
    console.error("Update Invoice Detail Error:", error);
    return NextResponse.json({ success: false, message: "Gagal memperbarui invoice" }, { status: 500 });
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
    const existing = await prisma.invoice.findFirst({
      where: { id, companyId: company.id },
    });

    if (!existing) {
      return NextResponse.json({ success: false, message: "Invoice tidak ditemukan atau tidak berhak" }, { status: 404 });
    }

    await prisma.invoice.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Invoice berhasil dihapus" });
  } catch (error) {
    console.error("Delete Invoice Error:", error);
    return NextResponse.json({ success: false, message: "Gagal menghapus invoice" }, { status: 500 });
  }
}
