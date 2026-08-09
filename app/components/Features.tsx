"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const features = [
  {
    id: "invoicing",
    label: "Invoice Instan & Rapi",
    title: "Pembuatan Invoice Digital Cepat",
    description:
      "Buat dan kirim faktur resmi berstandar profesional hanya dalam beberapa klik. Sesuaikan logo usaha, identitas perusahaan, rincian produk, dan syarat pembayaran langsung tanpa ribet.",
  },
  {
    id: "dp-payment",
    label: "Uang Muka (DP) & Pajak",
    title: "Hitung Otomatis DP & PPN",
    description:
      "Fleksibel menentukan uang muka (DP) dalam bentuk nominal rupiah maupun persentase. Perhitungan diskon, PPN, dan sisa pelunasan terkalkulasi secara akurat dan otomatis.",
  },
  {
    id: "reminders",
    label: "Pengingat Jatuh Tempo",
    title: "Kelola Batas Waktu Pembayaran",
    description:
      "Pantau status invoice yang belum lunas, mendekati jatuh tempo, hingga lewat jatuh tempo secara real-time untuk menjaga kesehatan arus kas bisnis Anda.",
  },
  {
    id: "analytics",
    label: "Laporan Keuangan & Omzet",
    title: "Analisis Arus Kas Terpadu",
    description:
      "Dapatkan wawasan performa bisnis dengan grafik omzet, ringkasan pelunasan invoice, serta export rekapitulasi data keuangan dengan rentang tanggal fleksibel.",
  },
  {
    id: "clients",
    label: "Manajemen Data Klien",
    title: "Database Mitra & Pelanggan",
    description:
      "Kelola riwayat tagihan, kontak WhatsApp, email, dan alamat klien dalam satu dashboard terorganisir untuk mempermudah penagihan berikutnya.",
  },
];

export default function Features() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeId, setActiveId] = useState("invoicing");

  const activeFeature = features.find((f) => f.id === activeId) ?? features[0];

  useGSAP(
    () => {
      gsap.from(".features-inner", {
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".features-section",
          start: "top 80%",
          once: true,
        },
      });
    },
    { scope: sectionRef }
  );

  const handleFeatureChange = (id: string) => {
    setActiveId(id);
    gsap.from(".features-content h2, .features-content p", {
      opacity: 0,
      y: 10,
      duration: 0.4,
      ease: "power2.out",
    });
  };

  return (
    <section className="features-section" ref={sectionRef} id="features">
      <div className="container-inner features-inner">
        {/* Left Col: Nav List */}
        <div>
          <div className="features-nav-header">Fitur Unggulan</div>
          <div className="features-nav-list" role="tablist">
            {features.map((f) => (
              <button
                key={f.id}
                role="tab"
                aria-selected={activeId === f.id}
                className={`features-nav-item ${activeId === f.id ? "active" : ""}`}
                onClick={() => handleFeatureChange(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Middle Col: Content */}
        <div className="features-content">
          <div className="features-nav-header" style={{ marginBottom: "16px" }}>Solusi Bisnis</div>
          <h2>{activeFeature.title}</h2>
          <p>{activeFeature.description}</p>
          <a href="/register" className="btn-pill-black">
            Coba Fitur Sekarang
          </a>
        </div>

        {/* Right Col: Grow Card */}
        <div>
          <div className="grow-card">
            <div>
              <h3>Kembangkan Bisnis Anda Bersama Invoice.In</h3>
              <p>
                Bergabunglah dengan ribuan pelaku usaha yang mempercayakan administrasi invoice dan manajemen tagihan secara praktis, rapi, dan otomatis.
              </p>
            </div>
            <div>
              <a href="/register" className="btn-pill-white">
                Mulai Gratis Sekarang
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
