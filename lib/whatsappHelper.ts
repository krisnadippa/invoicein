import { generateInvoicePDFBlob } from "./pdfGenerator";

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
 * Direct WhatsApp dispatch function (Text only).
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

/**
 * Shares the actual Invoice PDF file directly to WhatsApp.
 * - On Mobile / Web Share API supported browsers: Uses navigator.share() with the PDF file, directly attaching the PDF to WhatsApp.
 * - On Desktop / browsers without Web Share: Downloads the PDF file automatically and opens WhatsApp Chat with the customer.
 */
export async function shareInvoicePDFToWhatsApp(
  element: HTMLElement,
  invoice: InvoiceWhatsAppPayload,
  company: CompanyWhatsAppPayload,
  customPhone?: string,
  onProgress?: (status: string) => void
): Promise<{ success: boolean; method: "native_share" | "download_and_chat"; message: string }> {
  let targetPhone = customPhone || invoice.clientPhone || "";
  targetPhone = formatWhatsAppNumber(targetPhone);

  if (!targetPhone) {
    const input = window.prompt(
      "Nomor WhatsApp customer belum terdaftar. Silakan masukkan nomor WhatsApp customer (contoh: 081234567890):"
    );
    if (!input) return { success: false, method: "native_share", message: "Batal mengirim" };
    targetPhone = formatWhatsAppNumber(input);
  }

  if (!targetPhone || targetPhone.length < 7) {
    alert("Nomor WhatsApp tidak valid. Silakan periksa kembali.");
    return { success: false, method: "native_share", message: "Nomor WhatsApp tidak valid" };
  }

  const fileName = `Invoice-${invoice.invoiceNumber || "INV"}.pdf`;
  const { file, blob } = await generateInvoicePDFBlob(element, {
    fileName,
    onProgress
  });

  const message = generateInvoiceWhatsAppMessage(invoice, company);

  // 1. Check if Web Share API with Files is supported (Mobile Safari, Chrome Android, etc.)
  if (
    typeof navigator !== "undefined" &&
    navigator.canShare &&
    navigator.canShare({ files: [file] })
  ) {
    try {
      onProgress?.("Membuka aplikasi WhatsApp...");
      await navigator.share({
        files: [file],
        title: fileName,
        text: message
      });
      return { success: true, method: "native_share", message: "Berkas PDF berhasil dikirim ke WhatsApp!" };
    } catch (err: any) {
      if (err.name === "AbortError") {
        return { success: false, method: "native_share", message: "Pengiriman dibatalkan." };
      }
      console.warn("Navigator share failed, falling back to download & chat:", err);
    }
  }

  // 2. Fallback for Desktop Browsers:
  // Automatically trigger PDF file download and open WhatsApp Web/App chat to customer
  onProgress?.("Mengunduh berkas PDF & membuka WhatsApp...");
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);

  // Open WhatsApp Web with the customer number and formatted invoice details
  const waUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
  window.open(waUrl, "_blank");

  return {
    success: true,
    method: "download_and_chat",
    message: "Berkas PDF Invoice telah diunduh! Silakan lampirkan berkas ke chat WhatsApp yang telah dibuka."
  };
}

