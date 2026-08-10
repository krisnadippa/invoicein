"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [setupProgress, setSetupProgress] = useState(15);
  const [currentActionIndex, setCurrentActionIndex] = useState(0);
  
  const [isExiting, setIsExiting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 1: Business Profile State
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("Tour & Travel / Hospitality");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [logoBase64, setLogoBase64] = useState("");

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("invoicein_user");
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed.email && !email) {
          setEmail(parsed.email);
        }
      }
    } catch {
      // Ignore
    }
  }, []);

  // Step 2: Survey & Discovery State
  const [referralSource, setReferralSource] = useState("Google Search / Web");
  const [primaryGoal, setPrimaryGoal] = useState("Pembuatan & Pengiriman Invoice");
  const [monthlyVolume, setMonthlyVolume] = useState("10 - 50 invoice / bulan");

  // Step 3: Billing & Branding State
  const [companyAddress, setCompanyAddress] = useState("");
  const [taxId, setTaxId] = useState("");
  const [bankName, setBankName] = useState("Bank Central Asia (BCA)");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [themeColor, setThemeColor] = useState("#2563eb");

  const referralOptions = [
    { 
      id: "google", 
      label: "Google Search / Web", 
      desc: "Pencarian mesin telusur & artikel",
      svg: (
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
      )
    },
    { 
      id: "social", 
      label: "Media Sosial", 
      desc: "Instagram, LinkedIn, atau TikTok",
      svg: (
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
      )
    },
    { 
      id: "friend", 
      label: "Rekomendasi Rekan", 
      desc: "Teman kerja atau mitra bisnis",
      svg: (
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
      )
    },
    { 
      id: "ads", 
      label: "Iklan Digital", 
      desc: "Iklan online & promosi sponsor",
      svg: (
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
      )
    },
    { 
      id: "community", 
      label: "Komunitas Bisnis", 
      desc: "Grup UMKM, Startup, atau Travel",
      svg: (
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
      )
    },
    { 
      id: "other", 
      label: "Sumber Lainnya", 
      desc: "Media atau referensi lainnya",
      svg: (
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
      )
    },
  ];

  const goalOptions = [
    { 
      id: "invoicing", 
      label: "Pembuatan & Pengiriman Invoice", 
      desc: "Format standar profesional siap cetak & unduh PDF A4",
      svg: (
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
      )
    },
    { 
      id: "reports", 
      label: "Laporan Keuangan & Arus Kas", 
      desc: "Monitoring grafik pendapatan, pengeluaran & profit",
      svg: (
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
      )
    },
    { 
      id: "tour", 
      label: "Manajemen Paket Wisata & Tour", 
      desc: "Kelola rincian paket itinerary dan data pelanggan",
      svg: (
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      )
    },
    { 
      id: "tracking", 
      label: "Tracking Status Pembayaran Klien", 
      desc: "Pantau status invoice lunas, tertunda, dan jatuh tempo",
      svg: (
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      )
    },
  ];

  const volumeOptions = [
    { label: "< 10 invoice / bulan", sub: "Freelance & Usaha Mikro" },
    { label: "10 - 50 invoice / bulan", sub: "Bisnis Berkembang" },
    { label: "50 - 200 invoice / bulan", sub: "UMKM Menengah" },
    { label: "> 200 invoice / bulan", sub: "Skala Enterprise" },
  ];

  const presetThemes = [
    { name: "Royal Blue", hex: "#2563eb" },
    { name: "Indigo Violet", hex: "#6366f1" },
    { name: "Emerald Green", hex: "#059669" },
    { name: "Crimson Red", hex: "#dc2626" },
    { name: "Amber Orange", hex: "#d97706" },
    { name: "Slate Dark", hex: "#0f172a" },
  ];

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setLogoBase64(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      triggerSetupFlow();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const triggerSetupFlow = async () => {
    setIsSettingUp(true);

    const companyDetails = {
      companyName: companyName || "Infinity Go Indonesia",
      industry,
      companyAddress: companyAddress || "Jakarta, Indonesia",
      taxId,
      phone,
      email: email || "billing@infinitygo.id",
      bankName,
      accountNumber,
      accountHolder: accountHolder || companyName || "Infinity Go Indonesia",
      referralSource,
      primaryGoal,
      monthlyVolume,
      logoBase64,
      themeColor,
      defaultNotes: "Terima kasih atas kerja samanya. Pembayaran mohon ditransfer ke rekening resmi di atas."
    };

    if (typeof window !== "undefined") {
      localStorage.setItem("companyDetails", JSON.stringify(companyDetails));
    }

    // Persist company details in Neon PostgreSQL
    try {
      await fetch("/api/company", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(companyDetails),
      });
    } catch (err) {
      console.error("Failed to persist company details to DB", err);
    }

    // Smooth progressive timeline transition
    setTimeout(() => {
      setSetupProgress(35);
      setCurrentActionIndex(1);
    }, 600);

    setTimeout(() => {
      setSetupProgress(70);
      setCurrentActionIndex(2);
    }, 1300);

    setTimeout(() => {
      setSetupProgress(95);
      setCurrentActionIndex(3);
    }, 2000);

    setTimeout(() => {
      setSetupProgress(100);
      setCurrentActionIndex(4);
      setIsExiting(true);
    }, 2600);

    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 2900);
  };

  // =========================================================
  // SETUP / LOADING ANIMATION SCREEN (STRIPE / LINEAR GRADE)
  // =========================================================
  if (isSettingUp) {
    const setupSteps = [
      { title: "Mendaftarkan profil & legalitas bisnis", desc: "Menyimpan data identitas resmi perusahaan" },
      { title: "Mengonfigurasi tema & template invoice", desc: "Menyiapkan tata letak cetak PDF A4 standar" },
      { title: "Menyiapkan database keuangan & analitik", desc: "Membuat struktur modul arus kas & invoice" },
      { title: "Memuat Dashboard Utama InvoiceIn", desc: "Mengarahkan ke ruang kerja digital Anda" }
    ];

    return (
      <div className="onboarding-page-container">
        <div className={`setup-screen-box ${isExiting ? 'slide-up-exit' : ''}`}>
          
          <div className="setup-logo-badge">
            i
          </div>

          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
            Menyiapkan Workspace Anda
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Mohon tunggu sejenak, kami sedang mengonfigurasi pengaturan akun Anda.
          </p>

          {/* Smooth Progress Bar */}
          <div style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>
              <span>Inisialisasi Sistem</span>
              <span style={{ color: '#2563eb', fontWeight: 700 }}>{setupProgress}%</span>
            </div>
            
            <div className="setup-progress-track">
              <div className="setup-progress-fill" style={{ width: `${setupProgress}%` }} />
            </div>
          </div>

          {/* Stepped Checklist */}
          <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {setupSteps.map((step, idx) => {
              const isDone = currentActionIndex > idx;
              const isActive = currentActionIndex === idx;

              return (
                <div 
                  key={idx} 
                  className={`setup-step-row ${isDone ? 'done' : isActive ? 'active' : ''}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {isDone ? (
                        <svg width="16" height="16" fill="none" stroke="#16a34a" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                      ) : isActive ? (
                        <div className="setup-mini-spinner" />
                      ) : (
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#cbd5e1' }} />
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600 }}>{step.title}</div>
                    </div>
                  </div>
                  
                  {isDone && (
                    <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600 }}>Selesai</span>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="onboarding-page-container">
      
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
        <div style={{ width: '32px', height: '32px', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '18px' }}>
          i
        </div>
        <span style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.5px' }}>InvoiceIn</span>
      </div>

      <div className="onboarding-card-box">
        
        {/* Modern Clean Stepper Header */}
        <div className="stepper-nav">
          
          <div className={`stepper-step-item ${currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : ''}`}>
            <div className="stepper-circle">
              {currentStep > 1 ? (
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
              ) : '1'}
            </div>
            <div className="stepper-label">1. Profil Bisnis</div>
          </div>

          <div className={`stepper-line ${currentStep > 1 ? 'completed' : ''}`} />

          <div className={`stepper-step-item ${currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : ''}`}>
            <div className="stepper-circle">
              {currentStep > 2 ? (
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
              ) : '2'}
            </div>
            <div className="stepper-label">2. Preferensi & Survey</div>
          </div>

          <div className={`stepper-line ${currentStep > 2 ? 'completed' : ''}`} />

          <div className={`stepper-step-item ${currentStep === 3 ? 'active' : ''}`}>
            <div className="stepper-circle">
              3
            </div>
            <div className="stepper-label">3. Rekening & Branding</div>
          </div>

        </div>

        <form onSubmit={handleNext}>

          {/* =========================================================
              STEP 1: BUSINESS PROFILE & IDENTIFICATION
              ========================================================= */}
          {currentStep === 1 && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                  Lengkapi Profil Bisnis Anda
                </h2>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                  Informasi ini akan dicantumkan secara otomatis pada invoice resmi dan dokumen transaksi Anda.
                </p>
              </div>

              {/* Logo Upload Box */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                <div 
                  style={{ 
                    width: '76px', 
                    height: '76px', 
                    border: '2px dashed #cbd5e1', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    overflow: 'hidden',
                    background: '#ffffff',
                    position: 'relative',
                    flexShrink: 0
                  }}
                >
                  {logoBase64 ? (
                    <img src={logoBase64} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <span style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center' }}>No Logo</span>
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '2px' }}>Logo Perusahaan / Bisnis</div>
                  <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 8px' }}>Format PNG, JPG, atau SVG (Maks. 2MB).</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      style={{ padding: '6px 14px', background: '#ffffff', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}
                    >
                      {logoBase64 ? "Ganti Logo" : "Upload Logo"}
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleLogoUpload} 
                      accept="image/*" 
                      style={{ display: "none" }} 
                    />
                    {logoBase64 && (
                      <button 
                        type="button" 
                        onClick={() => setLogoBase64("")}
                        style={{ padding: '6px 12px', background: 'transparent', border: '1px solid #fecaca', color: '#dc2626', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Grid */}
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Nama Perusahaan / Bisnis *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    placeholder="e.g. PT Infinity Go Indonesia"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Kategori / Industri Bisnis</label>
                  <select 
                    className="form-select"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                  >
                    <option value="Tour & Travel / Hospitality">Tour & Travel / Hospitality</option>
                    <option value="IT, Software & Digital Agency">IT, Software & Digital Agency</option>
                    <option value="Creative, Design & Media">Creative, Design & Media</option>
                    <option value="Konsultan & Jasa Profesional">Konsultan & Jasa Profesional</option>
                    <option value="Retail, E-commerce & Dagang">Retail, E-commerce & Dagang</option>
                    <option value="Konstruksi & Manufaktur">Konstruksi & Manufaktur</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              <div className="form-grid-2" style={{ marginBottom: 0 }}>
                <div className="form-group">
                  <label className="form-label">Email Resmi Perusahaan *</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="billing@company.com"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Nomor Telepon / WhatsApp</label>
                  <input 
                    type="tel" 
                    className="form-input" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+62 812-3456-7890"
                  />
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              STEP 2: DISCOVERY, GOALS & SURVEY (CLEAN VECTOR ICONS)
              ========================================================= */}
          {currentStep === 2 && (
            <div>
              <div style={{ marginBottom: '28px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                  Preferensi & Kebutuhan Bisnis Anda
                </h2>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                  Bantu kami mempersonalisasi alur kerja dan konfigurasi dashboard sesuai skala bisnis Anda.
                </p>
              </div>

              {/* Question 1: Referral Source */}
              <div className="survey-question-group">
                <div className="survey-question-label">
                  1. Dari mana Anda mengetahui InvoiceIn? *
                </div>
                <div className="survey-grid-2">
                  {referralOptions.map(opt => (
                    <div 
                      key={opt.id}
                      onClick={() => setReferralSource(opt.label)}
                      className={`survey-choice-card ${referralSource === opt.label ? 'active' : ''}`}
                    >
                      <div className="survey-svg-icon">{opt.svg}</div>
                      <div>
                        <div className="survey-card-text-title" style={{ fontSize: '12px' }}>{opt.label}</div>
                        <div className="survey-card-text-sub" style={{ fontSize: '11px' }}>{opt.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Question 2: Primary Goal */}
              <div className="survey-question-group">
                <div className="survey-question-label">
                  2. Apa kebutuhan utama bisnis Anda? *
                </div>
                <div className="survey-grid-2">
                  {goalOptions.map(goal => (
                    <div 
                      key={goal.id}
                      onClick={() => setPrimaryGoal(goal.label)}
                      className={`survey-choice-card ${primaryGoal === goal.label ? 'active' : ''}`}
                    >
                      <div className="survey-svg-icon">{goal.svg}</div>
                      <div>
                        <div className="survey-card-text-title" style={{ fontSize: '12px' }}>{goal.label}</div>
                        <div className="survey-card-text-sub" style={{ fontSize: '11px' }}>{goal.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Question 3: Volume */}
              <div className="survey-question-group" style={{ marginBottom: '10px' }}>
                <div className="survey-question-label">
                  3. Perkiraan volume invoice per bulan
                </div>
                <div className="survey-grid-2">
                  {volumeOptions.map(vol => (
                    <div 
                      key={vol.label}
                      onClick={() => setMonthlyVolume(vol.label)}
                      className={`survey-choice-card ${monthlyVolume === vol.label ? 'active' : ''}`}
                    >
                      <div>
                        <div className="survey-card-text-title" style={{ fontSize: '12px' }}>{vol.label}</div>
                        <div className="survey-card-text-sub" style={{ fontSize: '11px' }}>{vol.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              STEP 3: BANK DETAILS & BRANDING PREVIEW
              ========================================================= */}
          {currentStep === 3 && (
            <div>
              <div style={{ marginBottom: '22px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                  Rekening Pembayaran & Desain Invoice
                </h2>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                  Tambahkan rekening tujuan transfer dan pilih warna identitas brand untuk invoice resmi Anda.
                </p>
              </div>

              {/* Bank Details */}
              <div style={{ padding: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: '18px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                  Informasi Rekening Bank Tujuan
                </div>
                
                <div className="form-grid-3" style={{ marginBottom: 0 }}>
                  <div className="form-group">
                    <label className="form-label">Nama Bank</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="e.g. BCA / Mandiri / BNI"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Nomor Rekening</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="123-456-7890"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Atas Nama (Pemilik)</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                      placeholder={companyName || "PT Nama Perusahaan"}
                    />
                  </div>
                </div>
              </div>

              {/* Address & Tax */}
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Alamat Kantor / Bisnis</label>
                  <textarea 
                    className="form-textarea" 
                    rows={2}
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    placeholder="Jl. Sudirman No. 45, Jakarta..."
                    style={{ resize: 'none' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">NPWP / Tax ID (Opsional)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    placeholder="01.234.567.8-000.000"
                  />
                </div>
              </div>

              {/* Theme Palette */}
              <div style={{ marginBottom: '18px' }}>
                <label className="form-label" style={{ marginBottom: '8px' }}>Pilih Warna Aksen Invoice</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '10px' }}>
                  {presetThemes.map(theme => (
                    <button
                      key={theme.hex}
                      type="button"
                      onClick={() => setThemeColor(theme.hex)}
                      style={{
                        padding: '8px 10px',
                        background: themeColor === theme.hex ? '#eff6ff' : '#ffffff',
                        border: `1px solid ${themeColor === theme.hex ? '#2563eb' : '#e2e8f0'}`,
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#0f172a',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      <span style={{ width: '12px', height: '12px', background: theme.hex, borderRadius: '2px', display: 'inline-block' }} />
                      <span>{theme.name}</span>
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Custom Hex Color:</span>
                  <input 
                    type="color" 
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    style={{ width: '32px', height: '28px', border: '1px solid #cbd5e1', padding: 0, cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '12px', fontFamily: 'monospace', fontWeight: 600, color: '#0f172a' }}>{themeColor}</span>
                </div>
              </div>

              {/* Mini Invoice Preview Card */}
              <div style={{ border: '1px solid #e2e8f0', background: '#ffffff', padding: '16px', borderTop: `4px solid ${themeColor}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {logoBase64 ? (
                      <img src={logoBase64} alt="Logo" style={{ height: '28px', objectFit: 'contain' }} />
                    ) : (
                      <div style={{ width: '28px', height: '28px', background: themeColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>
                        {(companyName || "I").charAt(0)}
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{companyName || "Nama Perusahaan Anda"}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{email || "billing@company.com"}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: themeColor, letterSpacing: '1px' }}>INVOICE PREVIEW</span>
                </div>
              </div>

            </div>
          )}

          {/* =========================================================
              BOTTOM CONTROLS & STEPPER ACTIONS
              ========================================================= */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginTop: '28px', 
            paddingTop: '20px', 
            borderTop: '1px solid #f1f5f9' 
          }}>
            
            {currentStep > 1 ? (
              <button 
                type="button" 
                onClick={handleBack}
                style={{
                  padding: '10px 18px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                Kembali
              </button>
            ) : (
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                Langkah 1 dari 3
              </div>
            )}

            <button 
              type="submit" 
              style={{
                backgroundColor: themeColor,
                color: '#ffffff',
                padding: '11px 26px',
                border: 'none',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }}
            >
              {currentStep < 3 ? (
                <>
                  Lanjut ke Langkah Berikutnya
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </>
              ) : (
                <>
                  Selesai & Buka Dashboard
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                </>
              )}
            </button>

          </div>

        </form>

      </div>

      {/* Footer Support */}
      <div style={{ marginTop: '20px', fontSize: '12px', color: '#94a3b8' }}>
        Perlu bantuan? <Link href="/login" style={{ color: '#2563eb', textDecoration: 'none' }}>Hubungi Tim Dukungan</Link>
      </div>

    </div>
  );
}
