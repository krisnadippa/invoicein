"use client";

import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { EtherealShadow } from "@/components/ui/etheral-shadow";

export default function RegisterPage() {
  const router = useRouter();

  // Form states
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Interaction / submission states
  const [touched, setTouched] = useState({
    username: false,
    email: false,
    password: false,
    confirmPassword: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [generalError, setGeneralError] = useState("");

  // Validation rules
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;

  // Password strength calculation
  const passwordCriteria = useMemo(() => {
    return {
      hasMinLength: password.length >= 8,
      hasUpperLower: /[a-z]/.test(password) && /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSymbol: /[^a-zA-Z0-9]/.test(password),
    };
  }, [password]);

  const strengthScore = useMemo(() => {
    if (!password) return 0;
    let score = 0;
    if (passwordCriteria.hasMinLength) score += 1;
    if (passwordCriteria.hasUpperLower) score += 1;
    if (passwordCriteria.hasNumber) score += 1;
    if (passwordCriteria.hasSymbol) score += 1;
    return score;
  }, [password, passwordCriteria]);

  const strengthMeta = useMemo(() => {
    switch (strengthScore) {
      case 1:
        return { label: "Sangat Lemah", class: "weak", barClass: "active-weak" };
      case 2:
        return { label: "Cukup", class: "fair", barClass: "active-fair" };
      case 3:
        return { label: "Kuat", class: "good", barClass: "active-good" };
      case 4:
        return { label: "Sangat Kuat", class: "strong", barClass: "active-strong" };
      default:
        return { label: "Belum Diisi", class: "empty", barClass: "" };
    }
  }, [strengthScore]);

  // Field validation errors
  const errors = useMemo(() => {
    const errs: Record<string, string> = {};

    if (touched.username) {
      if (!username.trim()) {
        errs.username = "Username wajib diisi";
      } else if (username.length < 3) {
        errs.username = "Username minimal 3 karakter";
      } else if (!usernameRegex.test(username)) {
        errs.username = "Hanya huruf, angka, '_' dan '-' yang diperbolehkan";
      }
    }

    if (touched.email) {
      if (!email.trim()) {
        errs.email = "Email bisnis wajib diisi";
      } else if (!emailRegex.test(email.trim())) {
        errs.email = "Format email tidak valid (contoh: user@company.com)";
      }
    }

    if (touched.password) {
      if (!password) {
        errs.password = "Kata sandi wajib diisi";
      } else if (password.length < 8) {
        errs.password = "Kata sandi minimal 8 karakter";
      }
    }

    if (touched.confirmPassword) {
      if (!confirmPassword) {
        errs.confirmPassword = "Ulangi kata sandi Anda";
      } else if (confirmPassword !== password) {
        errs.confirmPassword = "Kata sandi konfirmasi tidak cocok";
      }
    }

    return errs;
  }, [username, email, password, confirmPassword, touched]);

  const handleBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSuccessfulRegister = () => {
    setIsSubmitting(true);
    setGeneralError("");

    try {
      if (typeof window !== "undefined") {
        const userObj = {
          username: username || "krisna_adi",
          email: email || "krisna@company.com",
          registeredAt: new Date().toISOString(),
        };
        localStorage.setItem("invoicein_user", JSON.stringify(userObj));

        // Initialize default company details for dashboard if not existing
        if (!localStorage.getItem("companyDetails")) {
          const defaultCompany = {
            companyName: username ? `${username} Enterprise` : "Infinity Go Indonesia",
            industry: "Tour & Travel / Hospitality",
            companyAddress: "Jakarta, Indonesia",
            taxId: "",
            phone: "+62 812-3456-7890",
            email: email || "billing@infinitygo.id",
            bankName: "Bank Central Asia (BCA)",
            accountNumber: "8820-1928-3921",
            accountHolder: username || "Infinity Go Indonesia",
            referralSource: "Google Search / Web",
            primaryGoal: "Pembuatan & Pengiriman Invoice",
            monthlyVolume: "10 - 50 invoice / bulan",
            logoBase64: "",
            themeColor: "#2563eb",
            defaultNotes: "Terima kasih atas kerja sama Anda. Pembayaran jatuh tempo dalam 14 hari."
          };
          localStorage.setItem("companyDetails", JSON.stringify(defaultCompany));
        }
      }
    } catch {
      // Ignore localStorage errors
    }

    setTimeout(() => {
      setIsExiting(true);
    }, 400);

    setTimeout(() => {
      router.push("/register/onboarding");
    }, 850);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all as touched
    setTouched({
      username: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    // Check all requirements
    if (!username.trim() || !usernameRegex.test(username)) {
      setGeneralError("Mohon masukkan username yang valid (min. 3 karakter).");
      return;
    }

    if (!email.trim() || !emailRegex.test(email.trim())) {
      setGeneralError("Mohon masukkan alamat email yang valid.");
      return;
    }

    if (password.length < 8) {
      setGeneralError("Kata sandi minimal 8 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setGeneralError("Konfirmasi kata sandi tidak cocok dengan kata sandi.");
      return;
    }

    handleSuccessfulRegister();
  };

  return (
    <div className="auth-page">
      <div className={`auth-split-card ${isExiting ? "slide-up-exit" : ""}`}>
        {/* Left Side: Animated Black & Silver Ethereal Shadow */}
        <div className="auth-left">
          <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
            <EtherealShadow
              color="rgba(195, 205, 220, 0.28)"
              animation={{ scale: 65, speed: 50 }}
              noise={{ opacity: 0.35, scale: 1.2 }}
              sizing="fill"
            />
          </div>
          <div style={{ 
            position: "absolute", 
            inset: 0, 
            background: "radial-gradient(circle at 50% 30%, rgba(220, 225, 235, 0.06) 0%, rgba(10, 10, 12, 0.8) 75%, #0a0a0c 100%)", 
            zIndex: 1, 
            pointerEvents: "none" 
          }} />

          <div className="auth-left-logo" style={{ position: "relative", zIndex: 2 }}>
            <img 
              src="/images/logoin2.png" 
              alt="Invoice.In Logo" 
              style={{ width: "44px", height: "44px", objectFit: "contain", borderRadius: "10px" }} 
            />
          </div>
          <div className="auth-left-text" style={{ position: "relative", zIndex: 2 }}>
            <p>Mulai Gratis Sekarang</p>
            <h2>Akses pusat pengelolaan invoice profesional dan keuangan bisnis Anda</h2>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="auth-right">
          <div className="auth-header">
            <h1 className="auth-title">Buat Akun Baru</h1>
            <p className="auth-subtitle">
              Daftar dalam hitungan detik untuk mulai membuat invoice dan memantau bisnis Anda.
            </p>
          </div>

          {generalError && (
            <div
              style={{
                padding: "10px 14px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "8px",
                color: "#dc2626",
                fontSize: "13px",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" strokeLinecap="round" />
                <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span>{generalError}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {/* 1. Username Field */}
            <div className="form-group">
              <label htmlFor="username">Nama Pengguna (Username)</label>
              <input
                type="text"
                id="username"
                placeholder="contoh: krisna_adi"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (generalError) setGeneralError("");
                }}
                onBlur={() => handleBlur("username")}
                className={
                  touched.username && errors.username
                    ? "input-invalid"
                    : touched.username && username.length >= 3 && !errors.username
                    ? "input-valid"
                    : ""
                }
                autoComplete="username"
                required
              />
              {touched.username && errors.username && (
                <div className="auth-error-msg">
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" strokeWidth="2" />
                    <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" strokeLinecap="round" />
                    <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span>{errors.username}</span>
                </div>
              )}
            </div>

            {/* 2. Email Field */}
            <div className="form-group">
              <label htmlFor="email">Email Bisnis</label>
              <input
                type="email"
                id="email"
                placeholder="nama@perusahaan.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (generalError) setGeneralError("");
                }}
                onBlur={() => handleBlur("email")}
                className={
                  touched.email && errors.email
                    ? "input-invalid"
                    : touched.email && emailRegex.test(email.trim())
                    ? "input-valid"
                    : ""
                }
                autoComplete="email"
                required
              />
              {touched.email && errors.email && (
                <div className="auth-error-msg">
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" strokeWidth="2" />
                    <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" strokeLinecap="round" />
                    <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span>{errors.email}</span>
                </div>
              )}
            </div>

            {/* 3. Password Field */}
            <div className="form-group">
              <label htmlFor="password">Kata Sandi</label>
              <div className="auth-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Minimal 8 karakter"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (generalError) setGeneralError("");
                  }}
                  onBlur={() => handleBlur("password")}
                  className={
                    touched.password && errors.password
                      ? "input-invalid"
                      : touched.password && strengthScore >= 2
                      ? "input-valid"
                      : ""
                  }
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  title={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                >
                  {showPassword ? (
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                      />
                    </svg>
                  ) : (
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>

              {/* Password Strength Meter */}
              {password.length > 0 && (
                <div className="password-strength-card">
                  <div className="strength-header">
                    <span className="strength-label-text">
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Kekuatan Kata Sandi:
                    </span>
                    <span className={`strength-badge ${strengthMeta.class}`}>
                      {strengthMeta.label}
                    </span>
                  </div>

                  {/* 4 Segment Progress Bar */}
                  <div className="strength-bars-track">
                    <div
                      className={`strength-bar-pill ${
                        strengthScore >= 1 ? strengthMeta.barClass : ""
                      }`}
                    />
                    <div
                      className={`strength-bar-pill ${
                        strengthScore >= 2 ? strengthMeta.barClass : ""
                      }`}
                    />
                    <div
                      className={`strength-bar-pill ${
                        strengthScore >= 3 ? strengthMeta.barClass : ""
                      }`}
                    />
                    <div
                      className={`strength-bar-pill ${
                        strengthScore >= 4 ? strengthMeta.barClass : ""
                      }`}
                    />
                  </div>

                  {/* Dynamic Requirements Checklist */}
                  <div className="strength-reqs-grid">
                    <div className={`req-item-pill ${passwordCriteria.hasMinLength ? "active" : ""}`}>
                      {passwordCriteria.hasMinLength ? "✓" : "○"} Min. 8 karakter
                    </div>
                    <div className={`req-item-pill ${passwordCriteria.hasUpperLower ? "active" : ""}`}>
                      {passwordCriteria.hasUpperLower ? "✓" : "○"} Huruf besar & kecil
                    </div>
                    <div className={`req-item-pill ${passwordCriteria.hasNumber ? "active" : ""}`}>
                      {passwordCriteria.hasNumber ? "✓" : "○"} Mengandung angka
                    </div>
                    <div className={`req-item-pill ${passwordCriteria.hasSymbol ? "active" : ""}`}>
                      {passwordCriteria.hasSymbol ? "✓" : "○"} Simbol (!@#$%^&*)
                    </div>
                  </div>
                </div>
              )}

              {touched.password && errors.password && (
                <div className="auth-error-msg">
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" strokeWidth="2" />
                    <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" strokeLinecap="round" />
                    <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span>{errors.password}</span>
                </div>
              )}
            </div>

            {/* 4. Confirm Password Field */}
            <div className="form-group">
              <label htmlFor="confirmPassword">Konfirmasi Kata Sandi</label>
              <div className="auth-input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  placeholder="Ulangi kata sandi Anda"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (generalError) setGeneralError("");
                  }}
                  onBlur={() => handleBlur("confirmPassword")}
                  className={
                    touched.confirmPassword && errors.confirmPassword
                      ? "input-invalid"
                      : touched.confirmPassword && confirmPassword && confirmPassword === password
                      ? "input-valid"
                      : ""
                  }
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Sembunyikan konfirmasi kata sandi" : "Tampilkan konfirmasi kata sandi"}
                  title={showConfirmPassword ? "Sembunyikan konfirmasi kata sandi" : "Tampilkan konfirmasi kata sandi"}
                >
                  {showConfirmPassword ? (
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                      />
                    </svg>
                  ) : (
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>

              {/* Password Match Status indicator */}
              {confirmPassword.length > 0 && (
                <div
                  className={`confirm-match-badge ${
                    confirmPassword === password ? "matched" : "mismatched"
                  }`}
                >
                  {confirmPassword === password ? (
                    <>
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Kata sandi cocok</span>
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span>Kata sandi belum cocok</span>
                    </>
                  )}
                </div>
              )}

              {touched.confirmPassword && errors.confirmPassword && (
                <div className="auth-error-msg">
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" strokeWidth="2" />
                    <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" strokeLinecap="round" />
                    <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span>{errors.confirmPassword}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn-auth"
              disabled={isSubmitting}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                opacity: isSubmitting ? 0.8 : 1,
              }}
            >
              {isSubmitting ? (
                <>
                  <div
                    className="setup-mini-spinner"
                    style={{
                      borderColor: "rgba(255,255,255,0.4)",
                      borderTopColor: "#ffffff",
                    }}
                  />
                  <span>Memproses Pendaftaran...</span>
                </>
              ) : (
                "Daftar Sekarang"
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>atau daftar dengan</span>
          </div>

          {/* Social Auth Providers Common in Indonesia */}
          <div className="auth-social">
            {/* Google */}
            <button
              type="button"
              className="btn-social"
              onClick={handleSuccessfulRegister}
              title="Daftar dengan Google"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Google</span>
            </button>

            {/* WhatsApp */}
            <button
              type="button"
              className="btn-social"
              onClick={handleSuccessfulRegister}
              title="Daftar dengan WhatsApp"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366">
                <path d="M17.472 14.382c-.301-.15-1.781-.879-2.057-.98-.276-.1-.477-.15-.678.15-.2.3-.778.98-.954 1.18-.175.2-.351.226-.652.075s-1.27-.468-2.42-1.493c-.894-.798-1.498-1.783-1.674-2.084-.176-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.175.2-.301.301-.501.101-.2.05-.376-.025-.527s-.678-1.635-.929-2.238c-.244-.588-.493-.508-.678-.517-.175-.01-.376-.01-.577-.01s-.527.075-.803.376c-.276.301-1.054 1.03-1.054 2.511s1.079 2.912 1.23 3.113c.15.2 2.124 3.243 5.145 4.547.719.31 1.28.496 1.718.636.722.23 1.378.198 1.898.12.578-.087 1.781-.728 2.032-1.431.251-.703.251-1.305.176-1.431-.076-.125-.277-.2-.578-.35z" />
                <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.98-1.399A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.182a8.136 8.136 0 01-4.391-1.277l-.315-.192-2.956.83.844-2.883-.207-.333A8.146 8.146 0 013.818 12c0-4.512 3.67-8.182 8.182-8.182s8.182 3.67 8.182 8.182-3.67 8.182-8.182 8.182z" />
              </svg>
              <span>WhatsApp</span>
            </button>

            {/* Apple */}
            <button
              type="button"
              className="btn-social"
              onClick={handleSuccessfulRegister}
              title="Daftar dengan Apple"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#0f172a">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.87-.9.04-2.03.62-2.67 1.37-.56.65-1.06 1.71-.93 2.74 1.01.08 2.07-.49 2.68-1.24z" />
              </svg>
              <span>Apple</span>
            </button>
          </div>

          <div className="auth-footer">
            Sudah memiliki akun? <Link href="/login">Masuk di sini</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
