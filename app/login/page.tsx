"use client";

import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { EtherealShadow } from "@/components/ui/etheral-shadow";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Check if there is URL error or success message
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const urlErr = urlParams.get("error");
      const urlSuccess = urlParams.get("success");
      if (urlErr) {
        setErrorMessage(decodeURIComponent(urlErr));
      }
      if (urlSuccess) {
        setSuccessMessage(decodeURIComponent(urlSuccess));
      }
    }
  }, []);

  const errors = useMemo(() => {
    const errs: Record<string, string> = {};

    if (touched.email) {
      if (!email.trim()) {
        errs.email = "Email bisnis wajib diisi";
      } else if (!emailRegex.test(email.trim())) {
        errs.email = "Format email tidak valid (contoh: nama@perusahaan.com)";
      }
    }

    if (touched.password) {
      if (!password) {
        errs.password = "Kata sandi wajib diisi";
      }
    }

    return errs;
  }, [email, password, touched]);

  const handleBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({ email: true, password: true });
    setErrorMessage("");

    if (!email.trim() || !emailRegex.test(email.trim())) {
      setErrorMessage("Silakan masukkan alamat email yang valid.");
      return;
    }

    if (!password) {
      setErrorMessage("Silakan masukkan kata sandi Anda.");
      return;
    }

    setIsLoggingIn(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setIsLoggingIn(false);
        setErrorMessage(data.message || "Gagal masuk. Periksa email dan kata sandi Anda.");
        return;
      }

      // Save user & company state to localStorage for offline cache
      if (typeof window !== "undefined") {
        if (data.user) localStorage.setItem("invoicein_user", JSON.stringify(data.user));
        if (data.company) localStorage.setItem("companyDetails", JSON.stringify(data.company));
      }

      // Smooth exit animation and redirect
      setIsExiting(true);
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 500);
    } catch (err) {
      console.error("Login network error", err);
      setIsLoggingIn(false);
      setErrorMessage("Terjadi gangguan koneksi internet. Silakan coba lagi.");
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
            <p>Selamat Datang Kembali</p>
            <h2>Kelola invoice dan keuangan bisnis Anda dalam satu platform cerdas</h2>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="auth-right">
          <div className="auth-header">
            <h1 className="auth-title">Masuk ke Akun</h1>
            <p className="auth-subtitle">
              Akses invoice, pantau arus kas, dan atur manajemen paket tour Anda.
            </p>
          </div>

          {/* 1-Click Google Sign In powered by Neon Auth */}
          <a
            href="/api/auth/google"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              width: "100%",
              padding: "13px 20px",
              background: "#ffffff",
              border: "1.5px solid #e2e8f0",
              borderRadius: "12px",
              color: "#1e293b",
              fontSize: "14px",
              fontWeight: 600,
              textDecoration: "none",
              transition: "all 0.2s ease",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              marginBottom: "20px",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Lanjutkan dengan Google</span>
          </a>

          <div className="auth-divider" style={{ margin: "0 0 20px 0" }}>
            <span>atau masuk dengan email</span>
          </div>

          {successMessage && (
            <div
              style={{
                padding: "10px 14px",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "8px",
                color: "#16a34a",
                fontSize: "13px",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
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
              <span>{errorMessage}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="email">Email Bisnis</label>
              <input
                type="email"
                id="email"
                placeholder="nama@perusahaan.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage("");
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

            <div className="form-group">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <label htmlFor="password" style={{ margin: 0 }}>
                  Kata Sandi
                </label>
                <Link
                  href="#"
                  style={{
                    fontSize: "12px",
                    color: "#4f46e5",
                    textDecoration: "none",
                    fontWeight: 500,
                  }}
                >
                  Lupa kata sandi?
                </Link>
              </div>
              <div className="auth-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage("");
                  }}
                  onBlur={() => handleBlur("password")}
                  className={touched.password && errors.password ? "input-invalid" : ""}
                  autoComplete="current-password"
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

            <button
              type="submit"
              className="btn-auth"
              disabled={isLoggingIn}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                opacity: isLoggingIn ? 0.8 : 1,
              }}
            >
              {isLoggingIn ? (
                <>
                  <div
                    className="setup-mini-spinner"
                    style={{
                      borderColor: "rgba(255,255,255,0.4)",
                      borderTopColor: "#ffffff",
                    }}
                  />
                  <span>Memproses Masuk...</span>
                </>
              ) : (
                "Masuk Sekarang"
              )}
            </button>
          </form>

          <div className="auth-footer">
            Belum memiliki akun? <Link href="/register">Daftar Sekarang</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
