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
