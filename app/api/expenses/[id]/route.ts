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
    const { description, amount, date, invoiceId } = body;

    const company = await prisma.company.findUnique({
      where: { userId: session.userId },
    });

    if (!company) {
      return NextResponse.json({ success: false, message: "Perusahaan tidak ditemukan" }, { status: 404 });
    }

    // Verify ownership
    const existing = await prisma.expense.findFirst({
      where: { id, companyId: company.id },
    });

    if (!existing) {
      return NextResponse.json({ success: false, message: "Pengeluaran tidak ditemukan" }, { status: 404 });
    }

    const updated = await prisma.expense.update({
      where: { id },
      data: {
        description: description || undefined,
        amount: amount !== undefined ? Number(amount) : undefined,
        date: date ? new Date(date) : undefined,
        invoiceId: invoiceId || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Pengeluaran berhasil diperbarui",
      expense: {
        id: updated.id,
        description: updated.description,
        amount: updated.amount,
        date: updated.date.toISOString().split("T")[0],
        invoiceId: updated.invoiceId || "",
      },
    });
  } catch (error) {
    console.error("Update Expense Error:", error);
    return NextResponse.json({ success: false, message: "Gagal memperbarui data pengeluaran" }, { status: 500 });
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
    const existing = await prisma.expense.findFirst({
      where: { id, companyId: company.id },
    });

    if (!existing) {
      return NextResponse.json({ success: false, message: "Pengeluaran tidak ditemukan atau tidak berhak" }, { status: 404 });
    }

    await prisma.expense.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Pengeluaran berhasil dihapus" });
  } catch (error) {
    console.error("Delete Expense Error:", error);
    return NextResponse.json({ success: false, message: "Gagal menghapus pengeluaran" }, { status: 500 });
  }
}
