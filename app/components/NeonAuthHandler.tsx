"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/neon-auth-client";

export default function NeonAuthHandler() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Menghubungkan sesi akun Google Anda...");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const urlParams = new URLSearchParams(window.location.search);
    const verifier = urlParams.get("neon_auth_session_verifier");
    const hasToken = urlParams.get("token") || urlParams.get("session_token");

    if (verifier || hasToken) {
      setIsProcessing(true);

      async function syncSession() {
        let userFound: { email: string; name?: string } | null = null;

        // Try polling up to 5 times with progressive backoff to allow Better-Auth cookie challenge to finish
        for (let attempt = 1; attempt <= 5; attempt++) {
          try {
            setStatusMessage(`Memverifikasi kredensial Google (${attempt}/5)...`);
            await new Promise((resolve) => setTimeout(resolve, 500 * attempt));

            const session = await authClient.getSession();

            if (session?.data?.user?.email) {
              userFound = {
                email: session.data.user.email,
                name: session.data.user.name || session.data.user.email.split("@")[0],
              };
              break;
            }
          } catch (e) {
            console.warn(`Attempt ${attempt} session check note:`, e);
          }
        }

        if (userFound && userFound.email) {
          try {
            setStatusMessage("Sinkronisasi data akun ke database Neon...");
            const res = await fetch("/api/auth/neon/sync", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: userFound.email,
                name: userFound.name || userFound.email.split("@")[0],
              }),
            });

            const data = await res.json();

            if (data.success) {
              if (typeof window !== "undefined") {
                if (data.user) localStorage.setItem("invoicein_user", JSON.stringify(data.user));
                if (data.company) localStorage.setItem("companyDetails", JSON.stringify(data.company));
              }
              // Redirect to onboarding for new user, dashboard for returning user
              window.location.href = data.isNewUser ? "/register/onboarding" : "/dashboard";
              return;
            }
          } catch (syncErr) {
            console.error("Sync API error:", syncErr);
          }
        }

        // If after 5 attempts session still not ready, redirect with helpful prompt
        window.location.href =
          "/login?error=" +
          encodeURIComponent("Sesi Google memerlukan verifikasi ulang. Silakan klik 'Lanjutkan dengan Google' sekali lagi.");
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
            width: "48px",
            height: "48px",
            border: "3.5px solid rgba(59, 130, 246, 0.2)",
            borderTopColor: "#3b82f6",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 20px",
          }}
        />
        <h2 style={{ fontSize: "19px", fontWeight: 700, marginBottom: "8px" }}>
          Memverifikasi Akun Google
        </h2>
        <p style={{ fontSize: "13px", color: "#94a3b8", margin: 0 }}>
          {statusMessage}
        </p>
      </div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
