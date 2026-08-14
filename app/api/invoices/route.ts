import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const invoices = await prisma.invoice.findMany({
      where: {
        companyRef: {
          userId: session.userId,
        },
      },
      include: {
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Format like client expects
    const formattedInvoices = invoices.map((inv) => {
      const cur = inv.currency || "IDR";
      let formattedTotal = "";
      try {
        formattedTotal = new Intl.NumberFormat(cur === "IDR" ? "id-ID" : "en-US", {
          style: "currency",
          currency: cur,
          maximumFractionDigits: cur === "IDR" ? 0 : 2
        }).format(inv.totalAmount);
      } catch (e) {
        formattedTotal = `${cur === "IDR" ? "Rp" : cur} ${inv.totalAmount.toLocaleString("id-ID")}`;
      }

      return {
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        customer: inv.clientName,
        clientName: inv.clientName,
        clientEmail: inv.clientEmail || "",
        clientPhone: inv.clientPhone || "",
        clientTaxId: inv.clientTaxId || "",
        clientAddress: inv.clientAddress || "",
        clientId: inv.clientId || "",
        date: inv.issueDate.toISOString().split("T")[0],
        due: inv.dueDate.toISOString().split("T")[0],
        total: formattedTotal,
        amount: inv.totalAmount,
        currency: cur,
        subtotal: inv.subtotal,
        discount: inv.discount,
        taxRate: inv.taxRate,
        downPayment: inv.downPayment,
        dpType: inv.downPaymentType,
        amountPaid: inv.amountPaid || 0,
        balanceDue: inv.balanceDue || 0,
        status: inv.status === "Paid" 
          ? "Lunas" 
          : (inv.status === "Pending" && (inv.downPayment || 0) > 0 ? "DP" : (inv.status === "Pending" ? "Menunggu" : (inv.status === "Overdue" ? "Jatuh Tempo" : (inv.status === "Draft" ? "Draft" : inv.status)))),
        notes: inv.notes || "",
        paymentInstructions: inv.paymentInstructions || "",
        createdBy: inv.createdBy || "",
        items: inv.items.map((it) => ({
          id: it.id,
          description: it.description,
          quantity: it.quantity,
          price: it.unitPrice,
        })),
      };
    });

    return NextResponse.json({ success: true, invoices: formattedInvoices });
  } catch (error) {
    console.error("Fetch Invoices Error:", error);
    return NextResponse.json({ success: false, message: "Gagal mengambil data invoice" }, { status: 500 });
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
    const {
      id, // can be passed to upsert or custom ID
      invoiceNumber,
      clientName,
      clientEmail,
      clientPhone,
      clientTaxId,
      clientAddress,
      clientId,
      issueDate,
      dueDate,
      currency,
      taxRate,
      downPayment,
      downPaymentType,
      subtotal,
      discount,
      totalAmount,
      amountPaid,
      balanceDue,
      status,
      notes,
      paymentInstructions,
      createdBy,
      items = [],
    } = body;

    if (!invoiceNumber || !clientName) {
      return NextResponse.json({ success: false, message: "Nomor invoice dan nama klien wajib diisi" }, { status: 400 });
    }

    // Convert date strings to Date objects
    const parsedIssueDate = issueDate ? new Date(issueDate) : new Date();
    const parsedDueDate = dueDate ? new Date(dueDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    // Resolve or find clientId
    let resolvedClientId = clientId || null;
    if (!resolvedClientId && clientName) {
      // Find matching client by name under company
      const matchedClient = await prisma.client.findFirst({
        where: { name: clientName, companyId: company.id },
      });
      if (matchedClient) {
        resolvedClientId = matchedClient.id;
      }
    }

    // Status mapping (client uses Indonesian statuses, DB uses English statuses)
    let dbStatus = "Pending";
    if (status === "Lunas" || status === "Paid") {
      dbStatus = "Paid";
    } else if (status === "Menunggu" || status === "Pending") {
      dbStatus = "Pending";
    } else if (status === "Jatuh Tempo" || status === "Overdue") {
      dbStatus = "Overdue";
    } else if (status === "Draft") {
      dbStatus = "Draft";
    } else if (status === "DP") {
      dbStatus = "Pending"; // Treated as Pending in DB, but with downpayment
    }

    // Create the invoice and its items in a transaction
    const invoice = await prisma.$transaction(async (tx) => {
      // If client is editing and provided an existing ID
      if (id && id.startsWith("INV-") === false) {
        // Delete existing items for edit mode if we are overriding
        await tx.invoiceItem.deleteMany({
          where: { invoiceId: id },
        });

        return await tx.invoice.update({
          where: { id },
          data: {
            invoiceNumber,
            clientName,
            clientEmail,
            clientPhone,
            clientTaxId,
            clientAddress,
            clientId: resolvedClientId,
            issueDate: parsedIssueDate,
            dueDate: parsedDueDate,
            currency: currency || "IDR",
            taxRate: Number(taxRate) || 0,
            downPayment: Number(downPayment) || 0,
            downPaymentType: downPaymentType || "nominal",
            subtotal: Number(subtotal) || 0,
            discount: Number(discount) || 0,
            totalAmount: Number(totalAmount) || 0,
            amountPaid: Number(amountPaid) || 0,
            balanceDue: Number(balanceDue) || 0,
            status: dbStatus,
            notes,
            paymentInstructions,
            createdBy,
            items: {
              create: items.map((item: any) => ({
                description: item.description || "",
                quantity: Number(item.quantity) || 1,
                unitPrice: Number(item.price) || 0,
                amount: (Number(item.quantity) || 1) * (Number(item.price) || 0),
              })),
            },
          },
        });
      } else {
        // Create new
        return await tx.invoice.create({
          data: {
            companyId: company.id,
            invoiceNumber,
            clientName,
            clientEmail,
            clientPhone,
            clientTaxId,
            clientAddress,
            clientId: resolvedClientId,
            issueDate: parsedIssueDate,
            dueDate: parsedDueDate,
            currency: currency || "IDR",
            taxRate: Number(taxRate) || 0,
            downPayment: Number(downPayment) || 0,
            downPaymentType: downPaymentType || "nominal",
            subtotal: Number(subtotal) || 0,
            discount: Number(discount) || 0,
            totalAmount: Number(totalAmount) || 0,
            amountPaid: Number(amountPaid) || 0,
            balanceDue: Number(balanceDue) || 0,
            status: dbStatus,
            notes,
            paymentInstructions,
            createdBy,
            items: {
              create: items.map((item: any) => ({
                description: item.description || "",
                quantity: Number(item.quantity) || 1,
                unitPrice: Number(item.price) || 0,
                amount: (Number(item.quantity) || 1) * (Number(item.price) || 0),
              })),
            },
          },
        });
      }
    });

    return NextResponse.json({ success: true, message: "Invoice berhasil disimpan", invoice });
  } catch (error) {
    console.error("Create Invoice Error:", error);
    return NextResponse.json({ success: false, message: "Gagal menyimpan invoice" }, { status: 500 });
  }
}
