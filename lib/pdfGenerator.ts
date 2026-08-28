import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export interface PDFGenerateOptions {
  fileName?: string;
  quality?: number;
  scale?: number;
  onProgress?: (status: string) => void;
}

/**
 * Directly downloads an HTML element as an A4 PDF document without browser print dialog.
 */
export async function downloadInvoicePDF(
  element: HTMLElement,
  options: PDFGenerateOptions = {}
): Promise<boolean> {
  const {
    fileName = "Invoice.pdf",
    scale = 2,
    onProgress
  } = options;

  try {
    onProgress?.("Menyiapkan dokumen...");

    // Wait a brief moment to ensure all fonts and images are rendered
    await new Promise((resolve) => setTimeout(resolve, 100));

    onProgress?.("Merender invoice ke format PDF...");

    const canvas = await html2canvas(element, {
      scale: scale,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: 1024, // Consistent desktop-grade rendering
    });

    onProgress?.("Menyusun berkas PDF A4...");

    const imgData = canvas.toDataURL("image/png", 1.0);

    // Standard A4 dimensions in mm: 210mm x 297mm
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true
    });

    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297

    const imgProps = pdf.getImageProperties(imgData);
    const imgRatio = imgProps.height / imgProps.width;

    // Calculate height to fit width
    const contentHeight = pdfWidth * imgRatio;

    if (contentHeight <= pdfHeight) {
      // Single Page fit
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, contentHeight, undefined, "FAST");
    } else {
      // Multi-page handling if invoice is unusually long
      let heightLeft = contentHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, contentHeight, undefined, "FAST");
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - contentHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, contentHeight, undefined, "FAST");
        heightLeft -= pdfHeight;
      }
    }

    onProgress?.("Mengunduh berkas...");
    pdf.save(fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`);

    return true;
  } catch (error) {
    console.error("Failed to generate PDF:", error);
    throw error;
  }
}

/**
 * Generates a PDF File object (Blob) from an HTML element for direct file sharing.
 */
export async function generateInvoicePDFBlob(
  element: HTMLElement,
  options: PDFGenerateOptions = {}
): Promise<{ blob: Blob; file: File; fileName: string }> {
  const {
    fileName = "Invoice.pdf",
    scale = 2,
    onProgress
  } = options;

  try {
    onProgress?.("Menyiapkan dokumen...");
    await new Promise((resolve) => setTimeout(resolve, 100));

    onProgress?.("Merender invoice ke format PDF...");
    const canvas = await html2canvas(element, {
      scale: scale,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: 1024,
    });

    onProgress?.("Menyusun berkas PDF A4...");
    const imgData = canvas.toDataURL("image/png", 1.0);

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgProps = pdf.getImageProperties(imgData);
    const imgRatio = imgProps.height / imgProps.width;
    const contentHeight = pdfWidth * imgRatio;

    if (contentHeight <= pdfHeight) {
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, contentHeight, undefined, "FAST");
    } else {
      let heightLeft = contentHeight;
      let position = 0;
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, contentHeight, undefined, "FAST");
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - contentHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, contentHeight, undefined, "FAST");
        heightLeft -= pdfHeight;
      }
    }

    const pdfBlob = pdf.output("blob");
    const actualFileName = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`;
    const pdfFile = new File([pdfBlob], actualFileName, { type: "application/pdf" });

    return { blob: pdfBlob, file: pdfFile, fileName: actualFileName };
  } catch (error) {
    console.error("Failed to generate PDF Blob:", error);
    throw error;
  }
}

/**
 * Renders an invoice object into an offscreen element and generates an A4 PDF.
 */
export async function generateInvoicePDFFromData(
  invoice: any,
  company: any,
  options: PDFGenerateOptions = {}
): Promise<{ blob: Blob; file: File; fileName: string }> {
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "-9999px";
  container.style.width = "850px";
  container.style.backgroundColor = "#ffffff";
  container.style.padding = "40px";
  container.style.fontFamily = "Arial, sans-serif";
  container.style.color = "#0f172a";
  container.style.fontSize = "13px";
  container.style.lineHeight = "1.5";
  container.style.boxSizing = "border-box";

  const curr = invoice.currency || "IDR";
  const formatCur = (val: number) => {
    try {
      return new Intl.NumberFormat(curr === "IDR" ? "id-ID" : "en-US", {
        style: "currency",
        currency: curr,
        maximumFractionDigits: curr === "IDR" ? 0 : 2
      }).format(val || 0);
    } catch {
      return `${curr === "IDR" ? "Rp" : curr} ${(val || 0).toLocaleString("id-ID")}`;
    }
  };

  const isLunas = invoice.status === "Paid" || invoice.status === "Lunas";
  const subtotal = Number(invoice.subtotal || invoice.amount || invoice.totalAmount) || 0;
  const taxRate = Number(invoice.taxRate) || 0;
  const taxAmount = (subtotal * taxRate) / 100;
  const totalAmount = Number(invoice.totalAmount || invoice.amount) || (subtotal + taxAmount);
  const rawDp = Number(invoice.downPayment) || 0;
  const dpAmount = invoice.downPaymentType === "percent" || invoice.dpType === "percent"
    ? (totalAmount * Math.min(100, Math.max(0, rawDp))) / 100
    : Math.min(totalAmount, Math.max(0, rawDp));
  const remaining = isLunas ? 0 : Math.max(0, totalAmount - dpAmount);

  const themeColor = company?.themeColor || "#2563eb";
  const items = invoice.items && invoice.items.length > 0 ? invoice.items : [
    { description: "Jasa / Produk Invoice", quantity: 1, unitPrice: subtotal }
  ];

  const itemsHtml = items.map((item: any) => {
    const q = Number(item.quantity) || 1;
    const p = Number(item.unitPrice || item.price) || 0;
    const tot = q * p;
    return `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px; text-align: left;">${item.description || "-"}</td>
        <td style="padding: 12px; text-align: center;">${q}</td>
        <td style="padding: 12px; text-align: right;">${formatCur(p)}</td>
        <td style="padding: 12px; text-align: right; font-weight: 600;">${formatCur(tot)}</td>
      </tr>
    `;
  }).join("");

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid ${themeColor}; padding-bottom: 24px; margin-bottom: 28px;">
      <div>
        ${company?.logoBase64 ? `<img src="${company.logoBase64}" style="height: 50px; object-fit: contain; margin-bottom: 8px; display: block;" />` : ''}
        <div style="font-size: 20px; font-weight: 800; color: ${themeColor}; margin-bottom: 4px;">${company?.companyName || "Invoice.In"}</div>
        ${company?.companyAddress ? `<div style="color: #475569; max-width: 320px; margin-bottom: 4px;">${company.companyAddress}</div>` : ''}
        <div style="color: #475569;">
          ${company?.email ? `<div>Email: <strong>${company.email}</strong></div>` : ''}
          ${company?.phone ? `<div>Telp / WA: <strong>${company.phone}</strong></div>` : ''}
        </div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 28px; font-weight: 800; color: ${themeColor}; letter-spacing: 2px; margin-bottom: 6px;">INVOICE</div>
        ${isLunas ? `<div style="display: inline-block; border: 2px solid #16a34a; color: #16a34a; font-weight: 900; padding: 2px 8px; border-radius: 4px; margin-bottom: 8px;">LUNAS / PAID</div>` : ''}
        <div style="color: #64748b; font-size: 12px;">
          <div>No: <strong>${invoice.invoiceNumber || invoice.id}</strong></div>
          <div>Tanggal: <strong>${(invoice.issueDate || invoice.date || "").split('T')[0]}</strong></div>
          <div>Jatuh Tempo: <strong>${(invoice.dueDate || invoice.due || "").split('T')[0]}</strong></div>
        </div>
      </div>
    </div>

    <div style="display: flex; justify-content: space-between; margin-bottom: 28px;">
      <div>
        <div style="color: ${themeColor}; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 6px;">DITUJUKAN KEPADA:</div>
        <div style="font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 2px;">${invoice.clientName || invoice.customer || invoice.client || "Pelanggan"}</div>
        ${invoice.clientAddress ? `<div style="color: #475569; max-width: 280px;">${invoice.clientAddress}</div>` : ''}
        ${invoice.clientPhone ? `<div style="color: #475569;">Telp / WA: ${invoice.clientPhone}</div>` : ''}
      </div>
      ${company?.bankName ? `
        <div style="text-align: right; font-size: 12px; color: #475569;">
          <div style="color: ${themeColor}; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 6px;">INFO PEMBAYARAN:</div>
          <div><strong>${company.bankName}</strong></div>
          ${company.accountNumber ? `<div>No. Rek: ${company.accountNumber}</div>` : ''}
          ${company.accountHolder ? `<div>a/n ${company.accountHolder}</div>` : ''}
        </div>
      ` : ''}
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
      <thead>
        <tr style="background-color: ${themeColor}; color: #ffffff;">
          <th style="padding: 10px 12px; text-align: left; font-size: 12px;">Deskripsi</th>
          <th style="padding: 10px 12px; text-align: center; font-size: 12px; width: 10%;">Qty</th>
          <th style="padding: 10px 12px; text-align: right; font-size: 12px; width: 25%;">Harga</th>
          <th style="padding: 10px 12px; text-align: right; font-size: 12px; width: 25%;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div style="display: flex; justify-content: flex-end; margin-bottom: 24px;">
      <div style="width: 45%;">
        <div style="display: flex; justify-content: space-between; padding: 4px 8px; border-bottom: 1px solid #f1f5f9;">
          <span style="color: #64748b;">Subtotal</span>
          <span style="font-weight: 600;">${formatCur(subtotal)}</span>
        </div>
        ${taxRate > 0 ? `
          <div style="display: flex; justify-content: space-between; padding: 4px 8px; border-bottom: 1px solid #f1f5f9;">
            <span style="color: #64748b;">Pajak (${taxRate}%)</span>
            <span style="font-weight: 600;">${formatCur(taxAmount)}</span>
          </div>
        ` : ''}
        <div style="display: flex; justify-content: space-between; padding: 6px 8px; border-bottom: 1px solid #e2e8f0; font-size: 14px; font-weight: 800; color: ${themeColor};">
          <span>Total Tagihan</span>
          <span>${formatCur(totalAmount)}</span>
        </div>
        ${dpAmount > 0 ? `
          <div style="display: flex; justify-content: space-between; padding: 4px 8px; border-bottom: 1px solid #f1f5f9; color: #16a34a;">
            <span>DP Terbayar</span>
            <span style="font-weight: 600;">${formatCur(dpAmount)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 6px 8px; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: ${remaining > 0 ? '#dc2626' : '#16a34a'};">
            <span>Sisa Tagihan</span>
            <span>${formatCur(remaining)}</span>
          </div>
        ` : ''}
      </div>
    </div>

    ${invoice.notes ? `
      <div style="margin-top: 20px; padding: 12px; background: #f8fafc; border-left: 3px solid ${themeColor}; font-size: 12px; color: #475569;">
        <strong>Catatan:</strong> ${invoice.notes}
      </div>
    ` : ''}
  `;

  document.body.appendChild(container);
  try {
    const result = await generateInvoicePDFBlob(container, {
      fileName: `Invoice-${invoice.invoiceNumber || invoice.id || "INV"}.pdf`,
      ...options
    });
    return result;
  } finally {
    document.body.removeChild(container);
  }
}


