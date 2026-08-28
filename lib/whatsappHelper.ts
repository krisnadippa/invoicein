/**
 * WhatsApp Integration Utilities for Invoice.In
 */

export interface InvoiceWhatsAppPayload {
  invoiceNumber: string;
  clientName: string;
  clientPhone?: string;
  issueDate?: string;
  dueDate?: string;
  currency?: string;
  subtotal?: number;
  taxRate?: number;
  totalAmount: number;
  downPayment?: number;
  downPaymentType?: string;
  amountPaid?: number;
  balanceDue?: number;
  status: string;
  notes?: string;
  items?: Array<{ description: string; quantity: number | string; price?: number | string; unitPrice?: number | string }>;
}

export interface CompanyWhatsAppPayload {
  companyName?: string;
  phone?: string;
  email?: string;
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
}

/**
 * Normalizes phone numbers to standard WhatsApp format (international without leading + or 0).
 * Example: '081234567890' -> '6281234567890', '+62 812-3456' -> '628123456'
 */
export function formatWhatsAppNumber(phone: string): string {
  if (!phone) return "";
  let clean = phone.replace(/[^0-9]/g, "");
  
  if (clean.startsWith("0")) {
    clean = "62" + clean.substring(1);
  } else if (clean.startsWith("8")) {
    clean = "62" + clean;
  }
  
  return clean;
}

/**
 * Formats currency in standard Indonesian format.
 */
function formatCurrency(val: number, currencyCode: string = "IDR"): string {
  try {
    return new Intl.NumberFormat(currencyCode === "IDR" ? "id-ID" : "en-US", {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: currencyCode === "IDR" ? 0 : 2
    }).format(val);
  } catch {
    return `${currencyCode === "IDR" ? "Rp" : currencyCode} ${val.toLocaleString("id-ID")}`;
  }
}

/**
 * Generates a formal, polite, and comprehensive Indonesian WhatsApp invoice message.
 */
export function generateInvoiceWhatsAppMessage(
  invoice: InvoiceWhatsAppPayload,
  company: CompanyWhatsAppPayload
): string {
  const companyName = company.companyName || "Perusahaan Kami";
  const curr = invoice.currency || "IDR";
  const isLunas = invoice.status === "Paid" || invoice.status === "Lunas";

  const totalAmount = invoice.totalAmount || 0;
  const rawDp = Number(invoice.downPayment) || 0;
  const dpAmount = invoice.downPaymentType === "percent" 
    ? (totalAmount * Math.min(100, Math.max(0, rawDp))) / 100 
    : Math.min(totalAmount, Math.max(0, rawDp));
  const balanceDue = isLunas ? 0 : Math.max(0, totalAmount - dpAmount);

  let statusText = "Menunggu Pembayaran";
  if (isLunas) {
    statusText = "LUNAS (Paid)";
  } else if (dpAmount > 0) {
    statusText = "Uang Muka (DP) Terbayar";
  }

  // Format dates
  const issueDateStr = invoice.issueDate ? invoice.issueDate.split("T")[0] : "-";
  const dueDateStr = invoice.dueDate ? invoice.dueDate.split("T")[0] : "-";

  let lines: string[] = [
    `*TAGIHAN INVOICE RESMI*`,
    `----------------------------------------`,
    `Halo *${invoice.clientName || "Bapak/Ibu"}*,`,
    ``,
    `Berikut adalah rincian tagihan invoice dari *${companyName}*:`,
    ``,
    `📄 *No. Invoice:* ${invoice.invoiceNumber}`,
    `📅 *Tanggal Terbit:* ${issueDateStr}`,
    `⏰ *Jatuh Tempo:* ${dueDateStr}`,
    `💰 *Total Tagihan:* ${formatCurrency(totalAmount, curr)}`,
    `📌 *Status:* ${statusText}`
  ];

  if (!isLunas && dpAmount > 0) {
    lines.push(`💵 *DP Dibayar:* ${formatCurrency(dpAmount, curr)}`);
    lines.push(`⏳ *Sisa Tagihan:* ${formatCurrency(balanceDue, curr)}`);
  }

  // Payment information
  if (company.bankName || company.accountNumber) {
    lines.push(``);
    lines.push(`💳 *Rekening Pembayaran:*`);
    if (company.bankName) lines.push(`• *Bank:* ${company.bankName}`);
    if (company.accountNumber) lines.push(`• *No. Rekening:* ${company.accountNumber}`);
    if (company.accountHolder) lines.push(`• *Atas Nama:* ${company.accountHolder}`);
  }

  if (invoice.notes) {
    lines.push(``);
    lines.push(`📝 *Catatan:* ${invoice.notes}`);
  }

  lines.push(``);
  lines.push(`Mohon konfirmasi kembali apabila pembayaran telah dilakukan.`);
  lines.push(`Terima kasih atas kerja sama dan kepercayaannya.`);
  lines.push(`----------------------------------------`);
  lines.push(`*${companyName}*`);

  return lines.join("\n");
}

/**
 * Direct WhatsApp dispatch function.
 * If phone is provided, opens wa.me link directly.
 * If not provided, prompts the user to enter the number.
 */
export function sendInvoiceToWhatsApp(
  invoice: InvoiceWhatsAppPayload,
  company: CompanyWhatsAppPayload,
  customPhone?: string
): boolean {
  let targetPhone = customPhone || invoice.clientPhone || "";
  targetPhone = formatWhatsAppNumber(targetPhone);

  if (!targetPhone) {
    const input = window.prompt(
      "Nomor WhatsApp customer belum terdaftar. Silakan masukkan nomor WhatsApp customer (contoh: 081234567890):"
    );
    if (!input) return false;
    targetPhone = formatWhatsAppNumber(input);
  }

  if (!targetPhone || targetPhone.length < 7) {
    alert("Nomor WhatsApp tidak valid. Silakan periksa kembali.");
    return false;
  }

  const message = generateInvoiceWhatsAppMessage(invoice, company);
  const waUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;

  window.open(waUrl, "_blank");
  return true;
}
