"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/neon-auth-client";

export default function NeonCallbackPage() {
  const [statusText, setStatusText] = useState("Menghubungkan akun Google Anda...");

  useEffect(() => {
    async function handleAuthSync() {
      try {
        // Small delay to allow session cookie persistence
        await new Promise((resolve) => setTimeout(resolve, 300));

        // 1. Fetch session from Neon Auth client
        const session = await authClient.getSession();

        if (session?.data?.user?.email) {
          const googleUser = session.data.user;
          setStatusText("Sinkronisasi profil dengan database...");

          // 2. Sync to our local backend Prisma & issue session cookie
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

        // If not found on first try, retry once
        await new Promise((resolve) => setTimeout(resolve, 800));
        const retrySession = await authClient.getSession();

        if (retrySession?.data?.user?.email) {
          const googleUser = retrySession.data.user;
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

        // Fallback if session cannot be detected
        window.location.href =
          "/login?error=" +
          encodeURIComponent("Sesi Google belum terdeteksi. Silakan coba masuk kembali atau gunakan email & kata sandi.");
      } catch (err) {
        console.error("Neon Auth Callback Error:", err);
        window.location.href =
          "/login?error=" + encodeURIComponent("Terjadi kesalahan saat memproses login Google.");
      }
    }

    handleAuthSync();
  }, []);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0a0a0c",
        color: "#ffffff",
        fontFamily: "var(--font-inter), sans-serif",
      }}
    >
      <div style={{ textAlign: "center", padding: "32px", maxWidth: "400px" }}>
        <div
          style={{
            width: "42px",
            height: "42px",
            border: "3px solid rgba(59, 130, 246, 0.2)",
            borderTopColor: "#3b82f6",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 20px",
          }}
        />
        <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "8px" }}>Memverifikasi Akun Google</h2>
        <p style={{ fontSize: "14px", color: "#94a3b8" }}>{statusText}</p>
      </div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
