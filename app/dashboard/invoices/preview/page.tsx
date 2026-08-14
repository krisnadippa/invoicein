"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

function InvoicePreviewContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const router = useRouter();

  const [invoice, setInvoice] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [companyDetails, setCompanyDetails] = useState<any>({
    companyName: "Perusahaan Saya",
    companyAddress: "",
    taxId: "",
    phone: "",
    email: "",
    logoBase64: "",
    themeColor: "#2563eb"
  });

  const [settlementModal, setSettlementModal] = useState({
    isOpen: false,
    settlementDate: "",
    remainingBalance: 0
  });

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    // Load company details
    try {
      const saved = localStorage.getItem("companyDetails");
      if (saved) {
        setCompanyDetails(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Failed to load company details", e);
    }

    if (id) {
      fetchInvoiceDetail();
    }
  }, [id]);

  const fetchInvoiceDetail = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/invoices/${id}`);
      const data = await res.json();
      if (data.success && data.invoice) {
        setInvoice(data.invoice);
      } else {
        showToast("Invoice tidak ditemukan!", "error");
      }
    } catch (err) {
      console.error("Error loading invoice detail", err);
      showToast("Gagal memuat detail invoice", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard-content-inner" style={{ textAlign: "center", padding: "100px 20px" }}>
        <div className="spinner" style={{ border: "3px solid #f3f3f3", borderTop: "3px solid #2563eb", borderRadius: "50%", width: "40px", height: "40px", animation: "spin 1s linear infinite", margin: "0 auto 16px" }}></div>
        <span>Memuat pratinjau invoice...</span>
        <style>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="dashboard-content-inner" style={{ textAlign: "center", padding: "100px 20px" }}>
        <h3>Invoice tidak ditemukan</h3>
        <p style={{ color: "#64748b", marginTop: "8px" }}>Detail invoice yang Anda cari tidak tersedia.</p>
        <Link href="/dashboard/invoices" style={{ display: "inline-block", marginTop: "16px", padding: "10px 20px", backgroundColor: "#2563eb", color: "#ffffff", fontWeight: 600, textDecoration: "none", borderRadius: "6px" }}>
          Kembali ke Daftar Invoice
        </Link>
      </div>
    );
  }

  const formatCurrency = (val: number, currencyCode: string = "IDR") => {
    try {
      return new Intl.NumberFormat(currencyCode === "IDR" ? "id-ID" : "en-US", {
        style: "currency",
        currency: currencyCode,
        maximumFractionDigits: currencyCode === "IDR" ? 0 : 2
      }).format(val);
    } catch (e) {
      return `${currencyCode === "IDR" ? "Rp" : currencyCode} ${val.toLocaleString("id-ID")}`;
    }
  };

  const formatNumberWithDots = (val: number | string | undefined | null) => {
    if (val === "" || val === undefined || val === null) return "0";
    const clean = val.toString().replace(/[^0-9]/g, "");
    if (!clean) return "0";
    return new Intl.NumberFormat("id-ID").format(Number(clean));
  };

  const isLunas = invoice.status === "Paid" || invoice.status === "Lunas";
  const taxAmount = (invoice.subtotal * (invoice.taxRate || 0)) / 100;
  const totalAmount = invoice.totalAmount;
  const rawDp = Number(invoice.downPayment) || 0;
  const dpAmount = invoice.downPaymentType === "percent" 
    ? (totalAmount * Math.min(100, Math.max(0, rawDp))) / 100 
    : Math.min(totalAmount, Math.max(0, rawDp));
  const remainingBalance = isLunas ? 0 : Math.max(0, totalAmount - dpAmount);

  const handleTriggerSettlement = () => {
    setSettlementModal({
      isOpen: true,
      settlementDate: new Date().toISOString().split("T")[0],
      remainingBalance: remainingBalance
    });
  };

  const handleConfirmSettlement = async () => {
    try {
      const res = await fetch(`/api/invoices/${invoice.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Lunas",
          amountPaid: totalAmount,
          balanceDue: 0
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast("Invoice berhasil dilunasi!");
        fetchInvoiceDetail();
      } else {
        showToast(data.message || "Gagal melunasi invoice", "error");
      }
    } catch (err) {
      console.error("Settlement error", err);
      showToast("Gagal melunasi invoice", "error");
    }
    setSettlementModal(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="dashboard-content-inner" style={{ padding: "24px 0", maxWidth: "900px", margin: "0 auto" }}>
      {/* Action panel at the top (hidden during print) */}
      <div className="no-print" style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#ffffff",
        padding: "16px 24px",
        borderRadius: "12px",
        border: "1px solid #cbd5e1",
        marginBottom: "24px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
      }}>
        <div style={{ display: "flex", gap: "10px" }}>
          <button 
            onClick={() => router.push("/dashboard/invoices")}
            style={{
              padding: "10px 16px",
              backgroundColor: "#f8fafc",
              border: "1px solid #cbd5e1",
              color: "#475569",
              fontSize: "13px",
              fontWeight: 600,
              borderRadius: "6px",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            ← Kembali
          </button>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button 
            onClick={() => window.print()}
            style={{
              padding: "10px 18px",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              fontSize: "13px",
              fontWeight: 600,
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(37,99,235,0.2)",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Cetak Invoice (PDF)
          </button>

          {!isLunas && dpAmount > 0 && (
            <button 
              onClick={handleTriggerSettlement}
              style={{
                padding: "10px 18px",
                backgroundColor: "#10b981",
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: 600,
                border: "none",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              Konfirmasi Pelunasan
            </button>
          )}

          <button 
            onClick={() => router.push(`/dashboard/invoices/create?id=${invoice.id}`)}
            style={{
              padding: "10px 18px",
              backgroundColor: "#ffffff",
              border: "1px solid #cbd5e1",
              color: "#334155",
              fontSize: "13px",
              fontWeight: 600,
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            Edit Invoice
          </button>
        </div>
      </div>

      {/* Preview Sheet Container (Exact A4 matching view) */}
      <div style={{
        backgroundColor: "#ffffff",
        border: "1px solid #cbd5e1",
        borderRadius: "8px",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        padding: "48px",
        color: "#0f172a",
        fontFamily: "Arial, sans-serif",
        fontSize: "13px",
        lineHeight: 1.5
      }} className="print-view-sheet invoice-print-container">
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: `2px solid ${companyDetails.themeColor}`, paddingBottom: '24px', marginBottom: '28px' }}>
          <div>
            {companyDetails.logoBase64 && (
              <img 
                src={companyDetails.logoBase64} 
                alt="Logo Perusahaan" 
                style={{ height: '55px', objectFit: 'contain', marginBottom: '10px', display: 'block' }} 
              />
            )}
            <div style={{ fontSize: '22px', fontWeight: 800, color: companyDetails.themeColor, marginBottom: '6px' }}>
              {companyDetails.companyName || "Infinity Go Indonesia"}
            </div>
            {companyDetails.companyAddress && (
              <div style={{ color: '#475569', lineHeight: 1.5, whiteSpace: 'pre-wrap', maxWidth: '350px', marginBottom: '6px' }}>
                {companyDetails.companyAddress}
              </div>
            )}
            <div style={{ color: '#475569', lineHeight: 1.6 }}>
              {companyDetails.email && <div>Email: <span style={{ color: '#0f172a', fontWeight: 500 }}>{companyDetails.email}</span></div>}
              {companyDetails.phone && <div>Telp / WA: <span style={{ color: '#0f172a', fontWeight: 500 }}>{companyDetails.phone}</span></div>}
              {companyDetails.taxId && <div>NPWP: <span style={{ color: '#0f172a', fontWeight: 500 }}>{companyDetails.taxId}</span></div>}
            </div>
          </div>
          
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '32px', fontWeight: 800, color: companyDetails.themeColor, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>
              INVOICE
            </div>
            {isLunas && (
              <div style={{
                display: 'inline-block',
                border: '3px solid #16a34a',
                color: '#16a34a',
                textTransform: 'uppercase',
                fontSize: '12px',
                fontWeight: 900,
                padding: '3px 10px',
                borderRadius: '4px',
                transform: 'rotate(-5deg)',
                marginBottom: '12px',
                letterSpacing: '1px',
                boxShadow: '0 0 0 2px #ffffff'
              }}>
                LUNAS / PAID
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'auto auto', gap: '6px 16px', textAlign: 'right', justifyContent: 'end' }}>
              <span style={{ color: '#64748b' }}>Invoice No:</span>
              <span style={{ fontWeight: 600 }}>{invoice.invoiceNumber || invoice.id}</span>
              <span style={{ color: '#64748b' }}>Issue Date:</span>
              <span style={{ fontWeight: 600 }}>{invoice.issueDate ? invoice.issueDate.split('T')[0] : ""}</span>
              <span style={{ color: '#64748b' }}>Due Date:</span>
              <span style={{ fontWeight: 600 }}>{invoice.dueDate ? invoice.dueDate.split('T')[0] : ""}</span>
            </div>
          </div>
        </div>

        {/* Client details */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <h4 style={{ color: companyDetails.themeColor, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginBottom: '8px' }}>BILLED TO:</h4>
            <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px', color: '#0f172a' }}>{invoice.clientName}</div>
            {invoice.clientAddress && <div style={{ color: '#475569', whiteSpace: 'pre-wrap', marginBottom: '4px', maxWidth: '300px' }}>{invoice.clientAddress}</div>}
            {invoice.clientEmail && <div>Email: {invoice.clientEmail}</div>}
            {invoice.clientPhone && <div style={{ marginTop: '2px' }}>Telp / WA: {invoice.clientPhone}</div>}
            {invoice.clientTaxId && <div style={{ marginTop: '2px' }}>NPWP: {invoice.clientTaxId}</div>}
          </div>

          {companyDetails.bankName && (
            <div style={{ maxWidth: '280px', textAlign: 'right' }}>
              <h4 style={{ color: companyDetails.themeColor, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginBottom: '8px' }}>PAYMENT INFO:</h4>
              <div style={{ color: '#475569', lineHeight: 1.5, fontSize: '12px' }}>
                <strong>{companyDetails.bankName}</strong><br/>
                {companyDetails.accountNumber && <>No. Rekening: {companyDetails.accountNumber}<br/></>}
                {companyDetails.accountHolder && <>a/n {companyDetails.accountHolder}</>}
              </div>
            </div>
          )}
        </div>

        {/* Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
          <thead>
            <tr style={{ backgroundColor: companyDetails.themeColor, color: '#ffffff' }}>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, fontSize: '12px' }}>Description</th>
              <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600, width: '10%', fontSize: '12px' }}>Qty</th>
              <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, width: '25%', fontSize: '12px' }}>Price</th>
              <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, width: '25%', fontSize: '12px' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {(invoice.items || []).map((item: any, idx: number) => (
              <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px', textAlign: 'left' }}>{item.description}</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>{formatNumberWithDots(item.quantity)}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{formatCurrency(Number(item.unitPrice || item.price) || 0, invoice.currency)}</td>
                <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>{formatCurrency((Number(item.quantity) || 0) * (Number(item.unitPrice || item.price) || 0), invoice.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals & DP Block */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
          <div style={{ width: '45%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>Subtotal</span>
              <span style={{ fontWeight: 500 }}>{formatCurrency(invoice.subtotal, invoice.currency)}</span>
            </div>
            {invoice.taxRate > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Tax ({invoice.taxRate}%)</span>
                <span style={{ fontWeight: 500 }}>{formatCurrency(taxAmount, invoice.currency)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#475569', fontWeight: 600 }}>Total Tagihan</span>
              <span style={{ fontWeight: 700 }}>{formatCurrency(totalAmount, invoice.currency)}</span>
            </div>
            {dpAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', borderBottom: '1px solid #f1f5f9', color: '#16a34a' }}>
                <span style={{ fontWeight: 600 }}>Uang Muka (DP) Dibayar</span>
                <span style={{ fontWeight: 700 }}>- {formatCurrency(dpAmount, invoice.currency)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 8px', backgroundColor: isLunas ? '#dcfce7' : '#f8fafc', marginTop: '6px', borderTop: `2px solid ${isLunas ? '#16a34a' : companyDetails.themeColor}` }}>
              <span style={{ fontWeight: 700, fontSize: '14px', color: isLunas ? '#15803d' : '#0f172a' }}>{isLunas ? "STATUS:" : (dpAmount > 0 ? "Sisa Pelunasan" : "Total Due")}</span>
              <span style={{ fontWeight: 800, fontSize: '16px', color: isLunas ? '#16a34a' : companyDetails.themeColor }}>
                {isLunas ? "LUNAS / PAID" : formatCurrency(dpAmount > 0 ? remainingBalance : totalAmount, invoice.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Notes */}
        {invoice.notes && (
          <div style={{ marginTop: 'auto', borderTop: '1px solid #e2e8f0', paddingTop: '12px', color: '#64748b', fontSize: '11px', lineHeight: 1.5 }}>
            <strong style={{ display: 'block', color: '#0f172a', marginBottom: '4px' }}>Notes / Terms:</strong>
            {invoice.notes}
          </div>
        )}
      </div>

      {/* Settlement Confirmation Modal */}
      {settlementModal.isOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(15, 23, 42, 0.4)",
          backdropFilter: "blur(8px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 99999,
          padding: "16px"
        }}>
          <div className="dash-card" style={{
            width: "100%",
            maxWidth: "400px",
            padding: "28px",
            borderRadius: "16px",
            backgroundColor: "#ffffff",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            border: "1px solid rgba(226, 232, 240, 0.8)",
            position: "relative"
          }}>
            <h3 style={{ fontSize: "18px", fontWeight: 800, margin: 0, color: "#0f172a" }}>Pelunasan Invoice</h3>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "10px 0 20px", lineHeight: 1.5 }}>
              Konfirmasi pelunasan sisa tagihan untuk invoice ini. Status akan diubah menjadi Lunas.
            </p>
            <div style={{ padding: "12px", backgroundColor: "#f0fdf4", borderRadius: "8px", border: "1px solid #bbf7d0", marginBottom: "20px" }}>
              <div style={{ fontSize: "11px", color: "#16a34a", fontWeight: 600 }}>Sisa Tagihan</div>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "#15803d", marginTop: "2px" }}>
                {formatCurrency(settlementModal.remainingBalance, invoice.currency)}
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => setSettlementModal(prev => ({ ...prev, isOpen: false }))} style={{ border: "1px solid #cbd5e1", background: "#ffffff", color: "#475569", padding: "8px 16px", fontSize: "13px", fontWeight: 600, borderRadius: "6px", cursor: "pointer" }}>Batal</button>
              <button onClick={handleConfirmSettlement} style={{ border: "none", backgroundColor: "#10b981", color: "#ffffff", padding: "8px 20px", fontSize: "13px", fontWeight: 700, borderRadius: "6px", cursor: "pointer", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)" }}>Konfirmasi Pelunasan</button>
            </div>
          </div>
        </div>
      )}

      {/* Print Specific Styles */}
      <style>{`
        @media screen {
          .screen-hidden {
            display: none !important;
          }
        }
        @media print {
          .no-print, 
          header, 
          nav, 
          aside, 
          .sidebar, 
          .dashboard-header,
          button,
          a {
            display: none !important;
          }
          .dashboard-main {
            padding: 0 !important;
            margin: 0 !important;
          }
          .print-view-sheet {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            width: 100% !important;
            margin: 0 !important;
          }
          html, 
          body, 
          .dashboard-layout, 
          .dashboard-main, 
          .dashboard-content-inner,
          #root {
            background: #ffffff !important;
            color: #000000 !important;
            height: auto !important;
            min-height: auto !important;
            overflow: visible !important;
            position: static !important;
            display: block !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>

      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: toast.type === 'success' ? '#10b981' : toast.type === 'error' ? '#ef4444' : '#2563eb',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          zIndex: 99999,
          fontWeight: 600,
          fontSize: '13px'
        }}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default function InvoicePreviewPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: "100px 20px" }}>Memuat halaman...</div>}>
      <InvoicePreviewContent />
    </Suspense>
  );
}
