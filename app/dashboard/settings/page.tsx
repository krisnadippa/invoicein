"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function SettingsPage() {
  const [isClient, setIsClient] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  
  const [companyDetails, setCompanyDetails] = useState({
    companyName: "Infinity Go Indonesia",
    companyAddress: "Jl. Sudirman No. 45, Jakarta Selatan 12190",
    taxId: "01.234.567.8-012.000",
    phone: "+62 812-3456-7890",
    email: "billing@infinitygo.id",
    website: "https://infinitygo.id",
    bankName: "Bank Central Asia (BCA)",
    accountNumber: "123-456-7890",
    accountHolder: "PT Infinity Go Indonesia",
    defaultNotes: "Terima kasih atas kerja samanya. Pembayaran mohon ditransfer ke rekening resmi di atas.",
    logoBase64: "",
    themeColor: "#2563eb"
  });

  const presetColors = [
    { name: "Royal Blue", hex: "#2563eb" },
    { name: "Indigo Violet", hex: "#6366f1" },
    { name: "Emerald Green", hex: "#059669" },
    { name: "Crimson Red", hex: "#dc2626" },
    { name: "Amber Orange", hex: "#d97706" },
    { name: "Slate Dark", hex: "#0f172a" },
  ];

  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem("companyDetails");
    if (saved) {
      try {
        setCompanyDetails(prev => ({ ...prev, ...JSON.parse(saved) }));
      } catch (e) {
        console.error("Failed to parse company details", e);
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCompanyDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompanyDetails(prev => ({ ...prev, logoBase64: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setCompanyDetails(prev => ({ ...prev, logoBase64: "" }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("companyDetails", JSON.stringify(companyDetails));
    }

    try {
      await fetch("/api/company", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(companyDetails),
      });
    } catch (err) {
      console.error("Failed to update company in DB", err);
    }
    
    setIsSaving(false);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3500);
    window.dispatchEvent(new Event("storage"));
  };

  if (!isClient) return <div className="dashboard-content-inner">Memuat pengaturan...</div>;

  return (
    <div className="dashboard-content-inner">
      {/* Top Page Header */}
      <div className="page-header" style={{ alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>
            <Link href="/dashboard" style={{ color: '#64748b', textDecoration: 'none' }}>Dashboard</Link>
            <span>/</span>
            <span style={{ color: '#0f172a', fontWeight: 500 }}>Pengaturan</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>Pengaturan Profil & Invoice</h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            type="button" 
            onClick={handleSave}
            disabled={isSaving}
            style={{
              backgroundColor: companyDetails.themeColor,
              color: '#ffffff',
              padding: '10px 24px',
              border: 'none',
              fontSize: '13px',
              fontWeight: 600,
              cursor: isSaving ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              opacity: isSaving ? 0.7 : 1
            }}
          >
            {isSaving ? (
              <>Menyimpan...</>
            ) : (
              <>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                Simpan Pengaturan
              </>
            )}
          </button>
        </div>
      </div>

      {showSuccessToast && (
        <div style={{ 
          padding: '14px 18px', 
          background: '#dcfce7', 
          color: '#15803d', 
          fontSize: '13px', 
          fontWeight: 600, 
          marginBottom: '24px', 
          border: '1px solid #bbf7d0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Pengaturan berhasil disimpan! Template dan informasi resmi invoice Anda telah diperbarui.
        </div>
      )}

      {/* 2-Column Professional Settings Layout */}
      <div className="invoice-builder-layout">
        
        {/* LEFT COLUMN: DETAILED SECTIONS */}
        <div>
          
          {/* Card 1: Company Profile & Logo */}
          <div className="invoice-section-card">
            <div className="invoice-section-header">
              <span className="invoice-section-title">
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                Identitas Perusahaan / Usaha & Logo
              </span>
            </div>

            {/* Logo Upload Box */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px', padding: '16px', background: '#f8fafc', border: '1px solid var(--border-color, #e2e8f0)' }}>
              <div style={{
                width: '100px',
                height: '100px',
                border: '2px dashed #cbd5e1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#ffffff',
                position: 'relative',
                overflow: 'hidden',
                flexShrink: 0
              }}>
                {companyDetails.logoBase64 ? (
                  <img src={companyDetails.logoBase64} alt="Logo Perusahaan" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ margin: '0 auto 4px' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <span style={{ fontSize: '11px', display: 'block' }}>Belum Ada Logo</span>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleLogoUpload}
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                  title="Unggah Logo"
                />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>Logo Resmi Bisnis</div>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 12px', lineHeight: 1.4 }}>
                  Unggah file logo beresolusi tinggi (format PNG atau JPG transparan direkomendasikan).
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <label style={{
                    padding: '6px 14px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#0f172a',
                    cursor: 'pointer',
                    display: 'inline-block'
                  }}>
                    Pilih File Logo
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleLogoUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                  {companyDetails.logoBase64 && (
                    <button 
                      type="button" 
                      onClick={handleRemoveLogo}
                      style={{
                        padding: '6px 12px',
                        background: 'transparent',
                        border: '1px solid #fecaca',
                        color: '#dc2626',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Hapus
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Nama Perusahaan / CV / Usaha *</label>
                <input 
                  type="text" 
                  name="companyName" 
                  className="form-input" 
                  value={companyDetails.companyName} 
                  onChange={handleChange} 
                  placeholder="Contoh: PT Samudera Harmoni"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Resmi Usaha *</label>
                <input 
                  type="email" 
                  name="email" 
                  className="form-input" 
                  value={companyDetails.email} 
                  onChange={handleChange} 
                  placeholder="billing@perusahaan.com"
                />
              </div>
            </div>

            <div className="form-grid-2" style={{ marginBottom: 0 }}>
              <div className="form-group">
                <label className="form-label">Nomor Telepon / WhatsApp</label>
                <input 
                  type="tel" 
                  name="phone" 
                  className="form-input" 
                  value={companyDetails.phone} 
                  onChange={handleChange} 
                  placeholder="+62 812-3456-7890"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Website Resmi (Opsional)</label>
                <input 
                  type="url" 
                  name="website" 
                  className="form-input" 
                  value={companyDetails.website} 
                  onChange={handleChange} 
                  placeholder="https://perusahaan.com"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Legal & Registered Billing Address */}
          <div className="invoice-section-card">
            <div className="invoice-section-header">
              <span className="invoice-section-title">
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Alamat Legal & NPWP
              </span>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Nomor Pokok Wajib Pajak (NPWP)</label>
                <input 
                  type="text" 
                  name="taxId" 
                  className="form-input" 
                  value={companyDetails.taxId} 
                  onChange={handleChange} 
                  placeholder="01.234.567.8-012.000"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Negara / Yurisdiksi</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value="Indonesia (ID)" 
                  disabled 
                  style={{ opacity: 0.8, backgroundColor: '#f8fafc' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Alamat Kantor Lengkap</label>
              <textarea 
                name="companyAddress" 
                className="form-textarea" 
                rows={3} 
                value={companyDetails.companyAddress} 
                onChange={handleChange} 
                placeholder="Nama jalan, gedung, lantai, kelurahan, kecamatan, kota, kode pos..."
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>

          {/* Card 3: Default Bank & Payment Details */}
          <div className="invoice-section-card" style={{ marginBottom: 0 }}>
            <div className="invoice-section-header">
              <span className="invoice-section-title">
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                Rekening Bank & Catatan Default Invoice
              </span>
            </div>

            <div className="form-grid-3">
              <div className="form-group">
                <label className="form-label">Nama Bank</label>
                <input 
                  type="text" 
                  name="bankName" 
                  className="form-input" 
                  value={companyDetails.bankName} 
                  onChange={handleChange} 
                  placeholder="Contoh: Bank Central Asia (BCA)"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nomor Rekening</label>
                <input 
                  type="text" 
                  name="accountNumber" 
                  className="form-input" 
                  value={companyDetails.accountNumber} 
                  onChange={handleChange} 
                  placeholder="123-456-7890"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nama Pemilik Rekening (a/n)</label>
                <input 
                  type="text" 
                  name="accountHolder" 
                  className="form-input" 
                  value={companyDetails.accountHolder} 
                  onChange={handleChange} 
                  placeholder="Contoh: PT Samudera Harmoni"
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Catatan & Syarat Pembayaran Default</label>
              <textarea 
                name="defaultNotes" 
                className="form-textarea" 
                rows={3} 
                value={companyDetails.defaultNotes} 
                onChange={handleChange} 
                placeholder="Pesan yang otomatis muncul di bagian bawah setiap pembuatan invoice baru..."
              />
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: STICKY BRANDING & QUICK PREVIEW */}
        <div className="summary-panel">
          
          {/* Card: Invoice Branding & Accent Color */}
          <div className="invoice-section-card">
            <div className="invoice-section-header">
              <span className="invoice-section-title">
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
                Warna Tema & Branding
              </span>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label className="form-label" style={{ marginBottom: '10px' }}>Pilihan Palet Warna</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {presetColors.map(color => (
                  <button 
                    key={color.hex}
                    type="button" 
                    onClick={() => setCompanyDetails(prev => ({ ...prev, themeColor: color.hex }))}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px',
                      background: companyDetails.themeColor === color.hex ? '#eff6ff' : '#ffffff',
                      border: `1px solid ${companyDetails.themeColor === color.hex ? '#2563eb' : '#e2e8f0'}`,
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#0f172a',
                      cursor: 'pointer'
                    }}
                  >
                    <span style={{ width: '12px', height: '12px', background: color.hex, borderRadius: '2px', display: 'inline-block' }}></span>
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{color.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Kode Hex Kustom</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input 
                  type="color" 
                  name="themeColor" 
                  value={companyDetails.themeColor} 
                  onChange={handleChange} 
                  style={{ width: '40px', height: '38px', border: '1px solid #e2e8f0', padding: 0, cursor: 'pointer', background: 'none' }}
                />
                <input 
                  type="text" 
                  name="themeColor" 
                  className="form-input" 
                  value={companyDetails.themeColor} 
                  onChange={handleChange} 
                  style={{ fontFamily: 'monospace', textTransform: 'uppercase' }}
                />
              </div>
            </div>

            {/* Live Invoice Header Preview */}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '18px', marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '10px' }}>
                Pratinjau Header Invoice
              </div>
              
              <div style={{ 
                border: '1px solid #e2e8f0', 
                background: '#ffffff', 
                padding: '16px',
                borderTop: `4px solid ${companyDetails.themeColor}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  {companyDetails.logoBase64 ? (
                    <img src={companyDetails.logoBase64} alt="Logo" style={{ height: '32px', objectFit: 'contain' }} />
                  ) : (
                    <div style={{ fontWeight: 800, fontSize: '15px', color: companyDetails.themeColor }}>
                      {companyDetails.companyName || "Nama Perusahaan Anda"}
                    </div>
                  )}
                  <span style={{ fontSize: '14px', fontWeight: 800, color: companyDetails.themeColor, letterSpacing: '1px' }}>INVOICE</span>
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.4 }}>
                  {companyDetails.email} • {companyDetails.phone}
                </div>
                {companyDetails.taxId && (
                  <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                    NPWP: {companyDetails.taxId}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <button 
              type="button" 
              onClick={handleSave}
              disabled={isSaving}
              style={{
                width: '100%',
                backgroundColor: companyDetails.themeColor,
                color: '#ffffff',
                padding: '12px',
                border: 'none',
                fontSize: '13px',
                fontWeight: 600,
                cursor: isSaving ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                marginBottom: '10px',
                opacity: isSaving ? 0.7 : 1
              }}
            >
              {isSaving ? "Menyimpan Perubahan..." : "Simpan Semua Pengaturan"}
            </button>

            <Link 
              href="/dashboard/invoices/create"
              style={{
                width: '100%',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                color: '#475569',
                padding: '10px',
                fontSize: '13px',
                fontWeight: 600,
                display: 'block',
                textAlign: 'center',
                textDecoration: 'none'
              }}
            >
              Uji Coba Buat Invoice →
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
