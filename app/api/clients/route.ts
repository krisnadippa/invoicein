import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET all clients of the company
export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const clients = await prisma.client.findMany({
      where: {
        companyRef: {
          userId: session.userId,
        },
      },
      include: {
        invoices: {
          select: {
            id: true,
            totalAmount: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Format like client expects
    const formattedClients = clients.map((c) => {
      const invoicesCount = c.invoices.length;
      const totalInvoiced = c.invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
      return {
        id: c.id,
        name: c.name,
        company: c.company || "",
        email: c.email || "",
        phone: c.phone || "",
        address: c.address || "",
        status: c.status,
        invoicesCount,
        totalInvoiced,
      };
    });

    return NextResponse.json({ success: true, clients: formattedClients });
  } catch (error) {
    console.error("Fetch Clients Error:", error);
    return NextResponse.json({ success: false, message: "Gagal mengambil data klien" }, { status: 500 });
  }
}

// POST create client
export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // Get or create company first
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
    const { name, company: clientCompany, email, phone, address, status } = body;

    if (!name) {
      return NextResponse.json({ success: false, message: "Nama klien wajib diisi" }, { status: 400 });
    }

    const client = await prisma.client.create({
      data: {
        companyId: company.id,
        name,
        company: clientCompany,
        email,
        phone,
        address,
        status: status || "Active",
      },
    });

    return NextResponse.json({ success: true, message: "Klien berhasil ditambahkan", client });
  } catch (error) {
    console.error("Create Client Error:", error);
    return NextResponse.json({ success: false, message: "Gagal membuat klien baru" }, { status: 500 });
  }
}
