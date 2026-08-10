"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/neon-auth-client";

export default function NeonAuthHandler() {
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const urlParams = new URLSearchParams(window.location.search);
    const verifier = urlParams.get("neon_auth_session_verifier");
    const hasToken = urlParams.get("token") || urlParams.get("session_token");

    if (verifier || hasToken) {
      setIsProcessing(true);

      async function syncSession() {
        try {
          // Allow Better-Auth client to process the verifier parameter
          await new Promise((resolve) => setTimeout(resolve, 400));

          let session = await authClient.getSession();

          if (!session?.data?.user?.email) {
            // Retry after short delay if session is initializing
            await new Promise((resolve) => setTimeout(resolve, 800));
            session = await authClient.getSession();
          }

          if (session?.data?.user?.email) {
            const googleUser = session.data.user;

            const res = await fetch("/api/auth/neon/sync", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: googleUser.email,
                name: googleUser.name || googleUser.email.split("@")[0],
              }),
            });

            const data = await res.json();

            if (data.success) {
              if (typeof window !== "undefined") {
                if (data.user) localStorage.setItem("invoicein_user", JSON.stringify(data.user));
                if (data.company) localStorage.setItem("companyDetails", JSON.stringify(data.company));
              }
              window.location.href = data.isNewUser ? "/register/onboarding" : "/dashboard";
              return;
            }
          }

          // If session still not resolved, redirect to login
          window.location.href =
            "/login?error=" +
            encodeURIComponent("Sesi Google belum terdeteksi. Silakan coba masuk kembali.");
        } catch (err) {
          console.error("Neon Auth Verifier Sync Error:", err);
          window.location.href =
            "/login?error=" + encodeURIComponent("Terjadi kesalahan saat memproses login Google.");
        }
      }

      syncSession();
    }
  }, []);

  if (!isProcessing) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        backgroundColor: "#0a0a0c",
        color: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-inter), sans-serif",
      }}
    >
      <div style={{ textAlign: "center", padding: "32px", maxWidth: "420px" }}>
        <div
          style={{
            width: "44px",
            height: "44px",
            border: "3.5px solid rgba(59, 130, 246, 0.2)",
            borderTopColor: "#3b82f6",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 20px",
          }}
        />
        <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>
          Memverifikasi Akun Google
        </h2>
        <p style={{ fontSize: "13px", color: "#94a3b8", margin: 0 }}>
          Menyiapkan akun & mengalihkan ke konfigurasi bisnis Anda...
        </p>
      </div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
