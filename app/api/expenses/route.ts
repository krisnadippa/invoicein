import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const expenses = await prisma.expense.findMany({
      where: {
        companyRef: {
          userId: session.userId,
        },
      },
      orderBy: { date: "desc" },
    });

    // Format for frontend
    const formattedExpenses = expenses.map((exp) => ({
      id: exp.id,
      description: exp.description,
      amount: exp.amount,
      date: exp.date.toISOString().split("T")[0],
      invoiceId: exp.invoiceId || "",
    }));

    return NextResponse.json({ success: true, expenses: formattedExpenses });
  } catch (error) {
    console.error("Fetch Expenses Error:", error);
    return NextResponse.json({ success: false, message: "Gagal mengambil data pengeluaran" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    let company = await prisma.company.findUnique({
      where: { userId: session.userId },
    });

    if (!company) {
      company = await prisma.company.create({
        data: {
          userId: session.userId,
          companyName: session.username,
        },
      });
    }

    const body = await req.json();
    const { description, amount, date, invoiceId } = body;

    if (!description || !amount) {
      return NextResponse.json({ success: false, message: "Deskripsi dan jumlah wajib diisi" }, { status: 400 });
    }

    const expense = await prisma.expense.create({
      data: {
        companyId: company.id,
        description,
        amount: Number(amount) || 0,
        date: date ? new Date(date) : new Date(),
        invoiceId: invoiceId || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Pengeluaran berhasil disimpan",
      expense: {
        id: expense.id,
        description: expense.description,
        amount: expense.amount,
        date: expense.date.toISOString().split("T")[0],
        invoiceId: expense.invoiceId || "",
      },
    });
  } catch (error) {
    console.error("Create Expense Error:", error);
    return NextResponse.json({ success: false, message: "Gagal menyimpan pengeluaran baru" }, { status: 500 });
  }
}
