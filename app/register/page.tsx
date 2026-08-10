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

  // Check if there is URL error (e.g. from Google OAuth)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const urlErr = urlParams.get("error");
      if (urlErr) {
        setGeneralError(decodeURIComponent(urlErr));
      }
    }
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all as touched
    setTouched({
      username: true,
      email: true,
      password: true,
      confirmPassword: true,
    });
    setGeneralError("");

    // Check all requirements
    if (!username.trim()) {
      setGeneralError("Mohon lengkapi nama pengguna Anda.");
      return;
    }

    if (!email.trim() || !emailRegex.test(email.trim())) {
      setGeneralError("Mohon masukkan format email bisnis yang valid.");
      return;
    }

    if (!password || password.length < 8) {
      setGeneralError("Kata sandi minimal harus 8 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setGeneralError("Kata sandi dan konfirmasi kata sandi tidak cocok.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setIsSubmitting(false);
        setGeneralError(data.message || "Pendaftaran gagal. Silakan coba lagi.");
        return;
      }

      if (typeof window !== "undefined") {
        if (data.user) localStorage.setItem("invoicein_user", JSON.stringify(data.user));
        if (data.company) localStorage.setItem("companyDetails", JSON.stringify(data.company));
      }

      // Smooth exit animation
      setIsExiting(true);
      setTimeout(() => {
        router.push("/register/onboarding");
        router.refresh();
      }, 500);
    } catch (err) {
      console.error("Register network error", err);
      setIsSubmitting(false);
      setGeneralError("Terjadi gangguan koneksi internet. Silakan coba lagi.");
    }
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
                placeholder="contoh: johndoe"
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

          <div className="auth-footer">
            Sudah memiliki akun? <Link href="/login">Masuk di sini</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
