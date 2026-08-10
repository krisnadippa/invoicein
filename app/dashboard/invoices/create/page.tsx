"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface LineItem {
  id: string;
  description: string;
  quantity: number | string;
  price: number | string;
}

export default function CreateInvoice() {
  const [isClient, setIsClient] = useState(false);
  const [isSavedAlert, setIsSavedAlert] = useState(false);
  
  // Company state loaded from LocalStorage
  const [companyDetails, setCompanyDetails] = useState({
    companyName: "Your Company",
    companyAddress: "",
    taxId: "",
    phone: "",
    email: "",
    logoBase64: "",
    themeColor: "#2563eb"
  });

  // Invoice state
  const [invoiceNumber, setInvoiceNumber] = useState("INV-001");
  const [invoiceDate, setInvoiceDate] = useState("2026-08-09");
  const [dueDate, setDueDate] = useState("2026-08-23");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [createdBy, setCreatedBy] = useState("Finance Admin");

  // Client state
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientTaxId, setClientTaxId] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  
  // Line items - Start clean with empty fields
  const [items, setItems] = useState<LineItem[]>([
    { id: "1", description: "", quantity: "", price: "" }
  ]);

  // Tax rate starts empty (tidak ditetapkan di awal)
  const [taxRate, setTaxRate] = useState<number | string>("");
  const [downPayment, setDownPayment] = useState<number | string>("");
  const [dpType, setDpType] = useState<"nominal" | "percent">("nominal");

  const [notes, setNotes] = useState("Terima kasih atas kerja samanya. Mohon transfer pembayaran ke rekening di bawah.");
  const [paymentInstructions, setPaymentInstructions] = useState("Bank Central Asia (BCA)\nNo. Rekening: 123-456-7890\na/n PT Nama Perusahaan");

  useEffect(() => {
    setIsClient(true);
    const today = new Date();
    setInvoiceDate(today.toISOString().split('T')[0]);
    const due = new Date();
    due.setDate(due.getDate() + 14);
    setDueDate(due.toISOString().split('T')[0]);

    const saved = localStorage.getItem("companyDetails");
    if (saved) {
      try {
        const details = JSON.parse(saved);
        setCompanyDetails(prev => ({ ...prev, ...details }));
        if (details.accountHolder) {
          setCreatedBy(details.accountHolder);
        }

        // Sinkronisasi otomatis Catatan untuk Klien dari profil onboarding / settings
        if (details.defaultNotes) {
          setNotes(details.defaultNotes);
        }

        // Sinkronisasi otomatis Rekening Bank & Petunjuk Transfer dari data onboarding / settings
        if (details.bankName || details.accountNumber || details.accountHolder) {
          const bankLines: string[] = [];
          if (details.bankName) bankLines.push(details.bankName);
          if (details.accountNumber) bankLines.push(`No. Rekening: ${details.accountNumber}`);
          if (details.accountHolder || details.companyName) bankLines.push(`a/n ${details.accountHolder || details.companyName}`);
          setPaymentInstructions(bankLines.join("\n"));
        }
      } catch (e) {
        console.error("Failed to parse company details", e);
      }
    }

    const savedUser = localStorage.getItem("invoicein_user");
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        if (user.username) {
          setCreatedBy(user.username);
        }
      } catch (e) {
        console.error("Failed to parse user", e);
      }
    }
  }, []);

  const handleAddItem = () => {
    setItems(prev => [
      ...prev,
      { id: Math.random().toString(36).substring(2, 9), description: "", quantity: "", price: "" }
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof LineItem, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  // Helper formatting numbers with dot thousand separators
  const formatNumberWithDots = (val: number | string | undefined | null) => {
    if (val === "" || val === undefined || val === null) return "";
    const clean = val.toString().replace(/[^0-9]/g, "");
    if (!clean) return "";
    return new Intl.NumberFormat("id-ID").format(Number(clean));
  };

  const parseNumberFromDots = (val: string) => {
    const clean = val.replace(/[^0-9]/g, "");
    return clean === "" ? "" : Number(clean);
  };

  const getItemTotal = (item: LineItem) => {
    const qty = Number(item.quantity) || 0;
    const prc = Number(item.price) || 0;
    return qty * prc;
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + getItemTotal(item), 0);
  const taxPercent = Number(taxRate) || 0;
  const taxAmount = (subtotal * taxPercent) / 100;
  const totalAmount = subtotal + taxAmount;

  // DP calculation
  const rawDp = Number(downPayment) || 0;
  const dpAmount = dpType === "percent" 
    ? (totalAmount * Math.min(100, Math.max(0, rawDp))) / 100 
    : Math.min(totalAmount, Math.max(0, rawDp));
  const remainingBalance = Math.max(0, totalAmount - dpAmount);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveDraft = () => {
    setIsSavedAlert(true);
    setTimeout(() => setIsSavedAlert(false), 3000);
  };

  if (!isClient) return <div className="dashboard-content-inner">Loading workspace...</div>;

  return (
    <div className="dashboard-content-inner">
      {/* Top Header & Navigation */}
      <div className="page-header no-print" style={{ marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>
            <Link href="/dashboard/invoices" style={{ color: '#64748b', textDecoration: 'none' }}>Invoices</Link>
            <span>/</span>
            <span style={{ color: '#0f172a', fontWeight: 500 }}>Create New</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>Create Invoice</h1>
        </div>
      </div>

      {isSavedAlert && (
        <div style={{ padding: '12px 16px', background: '#dcfce7', color: '#15803d', fontSize: '13px', fontWeight: 500, marginBottom: '20px', border: '1px solid #bbf7d0' }}>
          ✓ Draf invoice berhasil disimpan ke sesi Anda!
        </div>
      )}

      {/* Main 2-Column Professional Form Layout */}
      <div className="invoice-builder-layout no-print">
        
        {/* LEFT COLUMN: PRIMARY DETAILS */}
        <div>
          
          {/* Card 1: Invoice Meta Details */}
          <div className="invoice-section-card">
            <div className="invoice-section-header">
              <span className="invoice-section-title">
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Informasi Utama Invoice
              </span>
              <span style={{ fontSize: '12px', background: '#eff6ff', color: '#2563eb', padding: '3px 8px', fontWeight: 600 }}>DRAFT</span>
            </div>

            <div className="form-grid-3">
              <div className="form-group">
                <label className="form-label">Nomor Invoice</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={invoiceNumber} 
                  onChange={(e) => setInvoiceNumber(e.target.value)} 
                  placeholder="INV-001" 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tanggal Terbit</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={invoiceDate} 
                  onChange={(e) => setInvoiceDate(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Jatuh Tempo</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={dueDate} 
                  onChange={(e) => setDueDate(e.target.value)} 
                />
              </div>
            </div>

            <div className="form-grid-2" style={{ marginBottom: 0 }}>
              <div className="form-group">
                <label className="form-label">Syarat Pembayaran (Payment Terms) — Opsional</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={paymentTerms} 
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  placeholder="Contoh: DP 50% / Net 14 Hari / Lunas di Depan"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mata Uang</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value="IDR - Indonesian Rupiah (Rp)" 
                  disabled 
                  style={{ background: '#f1f5f9', cursor: 'not-allowed', color: '#64748b' }}
                />
              </div>
            </div>
          </div>

          {/* Card 2: Billed To (Client Details) */}
          <div className="invoice-section-card">
            <div className="invoice-section-header">
              <span className="invoice-section-title">
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                Ditujukan Kepada (Klien / Pelanggan)
              </span>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Nama Klien / Perusahaan *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={clientName} 
                  onChange={(e) => setClientName(e.target.value)} 
                  placeholder="e.g. PT Mitra Sejahtera" 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Klien</label>
                <input 
                  type="email" 
                  className="form-input" 
                  value={clientEmail} 
                  onChange={(e) => setClientEmail(e.target.value)} 
                  placeholder="billing@klien.com" 
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Nomor Telepon</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={clientPhone} 
                  onChange={(e) => setClientPhone(e.target.value)} 
                  placeholder="+62 812-3456-7890" 
                />
              </div>

              <div className="form-group">
                <label className="form-label">NPWP / Tax ID Klien (Opsional)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={clientTaxId} 
                  onChange={(e) => setClientTaxId(e.target.value)} 
                  placeholder="01.234.567.8-901.000" 
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Alamat Penagihan</label>
              <textarea 
                className="form-textarea" 
                rows={2} 
                value={clientAddress} 
                onChange={(e) => setClientAddress(e.target.value)} 
                placeholder="Alamat kantor, jalan, kota, kode pos..."
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>

          {/* Card 3: Line Items Table */}
          <div className="invoice-section-card">
            <div className="invoice-section-header">
              <span className="invoice-section-title">
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                Rincian Item & Layanan
              </span>
              <span style={{ fontSize: '12px', color: '#64748b' }}>{items.length} {items.length === 1 ? 'item' : 'items'}</span>
            </div>

            <div className="table-responsive-wrapper">
              <table className="items-builder-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px', textAlign: 'center' }}>#</th>
                    <th>Deskripsi Layanan / Item</th>
                    <th style={{ width: '90px', textAlign: 'center' }}>Qty</th>
                    <th style={{ width: '170px', textAlign: 'right' }}>Harga Satuan (Rp)</th>
                    <th style={{ width: '160px', textAlign: 'right' }}>Total (Rp)</th>
                    <th style={{ width: '45px', textAlign: 'center' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={item.id}>
                      <td style={{ textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>{index + 1}</td>
                      <td>
                        <input 
                          type="text" 
                          className="form-input" 
                          value={item.description} 
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)} 
                          placeholder="e.g. Paket Tour 3H2M Bali"
                          style={{ border: '1px solid transparent', padding: '6px 8px', minWidth: '150px' }}
                        />
                      </td>
                      <td>
                        <input 
                          type="text" 
                          inputMode="numeric"
                          className="form-input" 
                          value={formatNumberWithDots(item.quantity)} 
                          onChange={(e) => {
                            const parsed = parseNumberFromDots(e.target.value);
                            updateItem(item.id, 'quantity', parsed);
                          }} 
                          placeholder="1"
                          style={{ textAlign: 'center', padding: '6px 4px', minWidth: '60px' }}
                        />
                      </td>
                      <td>
                        <input 
                          type="text" 
                          inputMode="numeric"
                          className="form-input" 
                          value={formatNumberWithDots(item.price)} 
                          onChange={(e) => {
                            const parsed = parseNumberFromDots(e.target.value);
                            updateItem(item.id, 'price', parsed);
                          }} 
                          placeholder="0"
                          style={{ textAlign: 'right', padding: '6px 8px', minWidth: '120px' }}
                        />
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600, fontSize: '13px', paddingRight: '12px', color: '#0f172a', whiteSpace: 'nowrap' }}>
                        {formatCurrency(getItemTotal(item))}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button 
                          type="button" 
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={items.length <= 1}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: items.length <= 1 ? '#cbd5e1' : '#ef4444',
                            cursor: items.length <= 1 ? 'not-allowed' : 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto'
                          }}
                          title="Hapus baris"
                        >
                          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button 
              type="button" 
              onClick={handleAddItem}
              className="btn-add-item"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              Tambah Baris Item Baru
            </button>
          </div>

          {/* Card 4: Notes & Payment Terms */}
          <div className="invoice-section-card" style={{ marginBottom: 0 }}>
            <div className="invoice-section-header">
              <span className="invoice-section-title">
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Catatan & Petunjuk Pembayaran
              </span>
            </div>

            <div className="form-grid-2" style={{ marginBottom: 0 }}>
              <div className="form-group">
                <label className="form-label">Catatan untuk Klien</label>
                <textarea 
                  className="form-textarea" 
                  rows={4} 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)} 
                  placeholder="Terima kasih atas kerja samanya. Pembayaran maksimal 14 hari..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Rekening Bank & Petunjuk Transfer</label>
                <textarea 
                  className="form-textarea" 
                  rows={4} 
                  value={paymentInstructions} 
                  onChange={(e) => setPaymentInstructions(e.target.value)} 
                  placeholder="Bank Central Asia (BCA) - 123-456-7890 a/n PT Nama Perusahaan..."
                />
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: STICKY SUMMARY, DP & BRANDING */}
        <div className="summary-panel">
          <div className="invoice-section-card">
            <div className="invoice-section-header">
              <span className="invoice-section-title">Ringkasan & Total Tagihan</span>
            </div>

            <div className="summary-row">
              <span>Subtotal</span>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>{formatCurrency(subtotal)}</span>
            </div>

            <div className="summary-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Tarif Pajak (PPN)</span>
                <input 
                  type="text" 
                  inputMode="numeric"
                  className="form-input" 
                  value={taxRate === "" ? "" : taxRate} 
                  onChange={(e) => {
                    const clean = e.target.value.replace(/[^0-9]/g, "");
                    setTaxRate(clean === "" ? "" : Number(clean));
                  }} 
                  placeholder="0"
                  style={{ width: '60px', padding: '4px 6px', textAlign: 'center', fontSize: '12px' }}
                />
                <span>%</span>
              </div>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>{formatCurrency(taxAmount)}</span>
            </div>

            {/* Total Tagihan (Kotor) */}
            <div className="summary-row" style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '10px', marginTop: '6px' }}>
              <span style={{ fontWeight: 600, color: '#475569' }}>Total Tagihan</span>
              <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '15px' }}>{formatCurrency(totalAmount)}</span>
            </div>

            {/* Down Payment (DP / Uang Muka) Section */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', marginTop: '12px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Uang Muka / DP (Opsional)</span>
                <div style={{ display: 'flex', gap: '4px', background: '#e2e8f0', padding: '2px', borderRadius: '4px' }}>
                  <button 
                    type="button" 
                    onClick={() => setDpType("nominal")}
                    style={{
                      border: 'none',
                      background: dpType === "nominal" ? '#ffffff' : 'transparent',
                      color: dpType === "nominal" ? '#2563eb' : '#64748b',
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}
                  >
                    Nominal (Rp)
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setDpType("percent")}
                    style={{
                      border: 'none',
                      background: dpType === "percent" ? '#ffffff' : 'transparent',
                      color: dpType === "percent" ? '#2563eb' : '#64748b',
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}
                  >
                    Persen (%)
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input 
                    type="text" 
                    inputMode="numeric"
                    className="form-input" 
                    value={dpType === "nominal" ? formatNumberWithDots(downPayment) : downPayment} 
                    onChange={(e) => {
                      if (dpType === "nominal") {
                        const parsed = parseNumberFromDots(e.target.value);
                        setDownPayment(parsed);
                      } else {
                        const clean = e.target.value.replace(/[^0-9]/g, "");
                        setDownPayment(clean === "" ? "" : Math.min(100, Number(clean)));
                      }
                    }} 
                    placeholder={dpType === "percent" ? "contoh: 50" : "contoh: 5.000.000"}
                    style={{ padding: '8px 10px', fontSize: '13px' }}
                  />
                </div>
                {dpAmount > 0 && (
                  <button 
                    type="button"
                    onClick={() => setDownPayment("")}
                    style={{ border: 'none', background: '#fee2e2', color: '#dc2626', fontSize: '11px', fontWeight: 600, padding: '8px 10px', borderRadius: '6px', cursor: 'pointer' }}
                    title="Hapus DP"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Quick Percentage Chips */}
              <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                {[20, 30, 50].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => {
                      setDpType("percent");
                      setDownPayment(pct);
                    }}
                    style={{
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#475569',
                      fontSize: '11px',
                      fontWeight: 500,
                      padding: '3px 8px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    {pct}%
                  </button>
                ))}
              </div>

              {dpAmount > 0 && (
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#16a34a', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                  <span>DP Terhitung:</span>
                  <span>- {formatCurrency(dpAmount)}</span>
                </div>
              )}
            </div>

            {/* Total / Sisa Pembayaran */}
            <div className="summary-row total">
              <div>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', fontWeight: 600 }}>
                  {dpAmount > 0 ? "Sisa Pembayaran (Pelunasan)" : "Total Pembayaran"}
                </div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: companyDetails.themeColor, marginTop: '2px' }}>
                  {formatCurrency(dpAmount > 0 ? remainingBalance : totalAmount)}
                </div>
              </div>
              <span style={{ fontSize: '12px', background: '#dbeafe', color: '#1e40af', padding: '4px 8px', fontWeight: 600 }}>IDR (Rp)</span>
            </div>

            {/* Quick Branding Customizer */}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Warna Aksen Invoice</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="color" 
                    value={companyDetails.themeColor} 
                    onChange={(e) => setCompanyDetails({ ...companyDetails, themeColor: e.target.value })}
                    style={{ width: '28px', height: '28px', border: 'none', padding: 0, cursor: 'pointer', background: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                {companyDetails.logoBase64 ? (
                  <img src={companyDetails.logoBase64} alt="Logo" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
                ) : (
                  <div style={{ width: '36px', height: '36px', background: companyDetails.themeColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px' }}>
                    {companyDetails.companyName.charAt(0)}
                  </div>
                )}
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {companyDetails.companyName}
                  </div>
                  <Link href="/dashboard/settings" style={{ fontSize: '11px', color: '#2563eb', textDecoration: 'none' }}>
                    Pengaturan Profil Perusahaan →
                  </Link>
                </div>
              </div>
            </div>

            {/* Primary Action Button */}
            <button 
              type="button" 
              onClick={handlePrint}
              style={{
                width: '100%',
                backgroundColor: companyDetails.themeColor,
                color: '#ffffff',
                padding: '13px',
                border: 'none',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                marginBottom: '10px',
                transition: 'opacity 0.2s'
              }}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              Cetak & Unduh PDF
            </button>

            <button 
              type="button" 
              onClick={handleSaveDraft}
              style={{
                width: '100%',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                color: '#475569',
                padding: '10px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Simpan sebagai Draf
            </button>
          </div>
        </div>

      </div>

      {/* HIDDEN STRICT PRINT A4 TEMPLATE */}
      <div className="screen-hidden">
        <div className="invoice-print-container" style={{ 
          backgroundColor: '#ffffff', 
          width: '100%', 
          padding: '40px', 
          display: 'flex',
          flexDirection: 'column',
          color: '#0f172a',
          fontSize: '13px',
          fontFamily: 'Arial, sans-serif'
        }}>
          
          {/* Invoice Header: Logo, Company Name below Logo, Email, and Phone below Email */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: `2px solid ${companyDetails.themeColor}`, paddingBottom: '24px', marginBottom: '28px' }}>
            <div>
              {/* Logo */}
              {companyDetails.logoBase64 && (
                <img 
                  src={companyDetails.logoBase64} 
                  alt="Logo Perusahaan" 
                  style={{ height: '55px', objectFit: 'contain', marginBottom: '10px', display: 'block' }} 
                />
              )}
              
              {/* Nama CV / Perusahaan (Tepat di bawah logo) */}
              <div style={{ fontSize: '22px', fontWeight: 800, color: companyDetails.themeColor, marginBottom: '6px' }}>
                {companyDetails.companyName || "Infinity Go Indonesia"}
              </div>

              {/* Alamat */}
              {companyDetails.companyAddress && (
                <div style={{ color: '#475569', lineHeight: 1.5, whiteSpace: 'pre-wrap', maxWidth: '350px', marginBottom: '6px' }}>
                  {companyDetails.companyAddress}
                </div>
              )}

              {/* Kontak: Email, dan Nomor Telepon di bawah Email */}
              <div style={{ color: '#475569', lineHeight: 1.6 }}>
                {companyDetails.email && (
                  <div>Email: <span style={{ color: '#0f172a', fontWeight: 500 }}>{companyDetails.email}</span></div>
                )}
                {companyDetails.phone && (
                  <div>Telp / WA: <span style={{ color: '#0f172a', fontWeight: 500 }}>{companyDetails.phone}</span></div>
                )}
                {companyDetails.taxId && (
                  <div>NPWP: <span style={{ color: '#0f172a', fontWeight: 500 }}>{companyDetails.taxId}</span></div>
                )}
              </div>
            </div>
            
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '32px', fontWeight: 800, color: companyDetails.themeColor, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>
                INVOICE
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'auto auto', gap: '6px 16px', textAlign: 'right', justifyContent: 'end' }}>
                <span style={{ color: '#64748b' }}>Invoice No:</span>
                <span style={{ fontWeight: 600 }}>{invoiceNumber || "INV-001"}</span>
                <span style={{ color: '#64748b' }}>Issue Date:</span>
                <span style={{ fontWeight: 600 }}>{invoiceDate}</span>
                <span style={{ color: '#64748b' }}>Due Date:</span>
                <span style={{ fontWeight: 600 }}>{dueDate}</span>
                {paymentTerms && (
                  <>
                    <span style={{ color: '#64748b' }}>Terms:</span>
                    <span style={{ fontWeight: 600 }}>{paymentTerms}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Bill To & Metadata */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
            <div>
              <h4 style={{ color: companyDetails.themeColor, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginBottom: '8px' }}>BILLED TO:</h4>
              <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px', color: '#0f172a' }}>{clientName || "Client / Company Name"}</div>
              {clientAddress && <div style={{ color: '#475569', whiteSpace: 'pre-wrap', marginBottom: '4px', maxWidth: '300px' }}>{clientAddress}</div>}
              {clientEmail && <div>Email: {clientEmail}</div>}
              {clientPhone && <div style={{ marginTop: '2px' }}>Telp / WA: {clientPhone}</div>}
              {clientTaxId && <div style={{ marginTop: '2px' }}>NPWP: {clientTaxId}</div>}
            </div>

            {paymentInstructions && (
              <div style={{ maxWidth: '280px', textAlign: 'right' }}>
                <h4 style={{ color: companyDetails.themeColor, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginBottom: '8px' }}>PAYMENT INFO:</h4>
                <div style={{ color: '#475569', whiteSpace: 'pre-wrap', lineHeight: 1.5, fontSize: '12px' }}>
                  {paymentInstructions}
                </div>
              </div>
            )}
          </div>

          {/* Table */}
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
              {items.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px', textAlign: 'left' }}>{item.description || "Item description"}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>{formatNumberWithDots(item.quantity) || 1}</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>{formatCurrency(Number(item.price) || 0)}</td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(getItemTotal(item))}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals & DP Block */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
            <div style={{ width: '45%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Subtotal</span>
                <span style={{ fontWeight: 500 }}>{formatCurrency(subtotal)}</span>
              </div>
              {taxPercent > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>Tax ({taxPercent}%)</span>
                  <span style={{ fontWeight: 500 }}>{formatCurrency(taxAmount)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#475569', fontWeight: 600 }}>Total Tagihan</span>
                <span style={{ fontWeight: 700 }}>{formatCurrency(totalAmount)}</span>
              </div>
              {dpAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', borderBottom: '1px solid #f1f5f9', color: '#16a34a' }}>
                  <span style={{ fontWeight: 600 }}>Uang Muka (DP) Dibayar</span>
                  <span style={{ fontWeight: 700 }}>- {formatCurrency(dpAmount)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 8px', backgroundColor: '#f8fafc', marginTop: '6px', borderTop: `2px solid ${companyDetails.themeColor}` }}>
                <span style={{ fontWeight: 700, fontSize: '14px' }}>{dpAmount > 0 ? "Sisa Pelunasan" : "Total Due"}</span>
                <span style={{ fontWeight: 800, fontSize: '16px', color: companyDetails.themeColor }}>
                  {formatCurrency(dpAmount > 0 ? remainingBalance : totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Signature & Authorization Section */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '24px', marginBottom: '20px', paddingTop: '16px', borderTop: '1px dashed #cbd5e1' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', fontWeight: 600 }}>
                Hormat Kami,
              </div>
              <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>
                {companyDetails.companyName || "Infinity Go Indonesia"}
              </div>
            </div>

            <div style={{ textAlign: 'center', minWidth: '200px' }}>
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '45px', fontWeight: 500 }}>
                Tanda Tangan & Cap Resmi:
              </div>
              <div style={{ borderBottom: '1.5px solid #64748b', width: '100%', marginBottom: '6px' }}></div>
              <div style={{ fontWeight: 700, fontSize: '12px', color: '#0f172a' }}>
                ( {companyDetails.companyName || "Otorisator Resmi"} )
              </div>
            </div>
          </div>

          {/* Footer Notes */}
          {notes && (
            <div style={{ marginTop: 'auto', borderTop: '1px solid #e2e8f0', paddingTop: '12px', color: '#64748b', fontSize: '11px', lineHeight: 1.5 }}>
              <strong style={{ display: 'block', color: '#0f172a', marginBottom: '4px' }}>Notes / Terms:</strong>
              {notes}
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
