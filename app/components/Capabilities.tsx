"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FileText, Bell, ShieldCheck, BarChart3, Users } from "lucide-react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const capabilities = [
  {
    id: "invoicing",
    title: "Cetak & Unduh PDF Instan",
    description: "Format faktur A4 profesional siap cetak atau bagikan langsung ke klien.",
    image: "/images/cap_clients.png",
    Icon: FileText
  },
  {
    id: "reminders",
    label: "Penagihan",
    title: "Pantau Status Pembayaran",
    description: "Ketahui kapan invoice dilihat, dibayar sebagian (DP), atau telah lunas.",
    image: "/images/cap_reminders.png",
    Icon: Bell
  },
  {
    id: "payments",
    title: "Format Rekening Bank Resmi",
    description: "Instruksi transfer bank yang jelas dan rapi untuk kemudahan transaksi klien.",
    image: "/images/cap_payments.png",
    Icon: ShieldCheck
  },
  {
    id: "analytics",
    title: "Rekapitulasi Laporan Keuangan",
    description: "Export laporan transaksi bulanan dan tahunan dengan format siap pakai.",
    image: "/images/cap_analytics.png",
    Icon: BarChart3
  },
  {
    id: "clients",
    title: "Kemitraan & Database Klien",
    description: "Simpan riwayat kerja sama bisnis dan data perusahaan klien terpusat.",
    image: "/images/hero_person.png",
    Icon: Users
  }
];

export default function Capabilities() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from(".capabilities-header", {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".capabilities-section",
          start: "top 80%",
          once: true,
        },
      });

      gsap.from(".cap-card", {
        opacity: 0,
        x: 40,
        stagger: 0.1,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".capabilities-grid",
          start: "top 85%",
          once: true,
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section className="capabilities-section" ref={sectionRef} id="capabilities">
      <div className="container-inner">
        <div className="capabilities-header">
          <h2 className="capabilities-title">Solusi Lengkap Bisnis Anda</h2>
          <Link href="/register" className="btn-outline-pill">Daftar Sekarang</Link>
        </div>
        
        <div className="capabilities-grid">
          {capabilities.map((cap) => {
            const Icon = cap.Icon;
            return (
              <article className="cap-card" key={cap.id}>
                <div className="cap-card-image">
                  <Image
                    src={cap.image}
                    alt={cap.title}
                    width={300}
                    height={200}
                    style={{ objectFit: "cover", width: "100%", height: "100%" }}
                  />
                </div>
                <h4 className="cap-card-title">{cap.title}</h4>
                <p className="cap-card-desc">{cap.description}</p>
                <div className="cap-card-footer">
                  <div className="cap-icon">
                    <Icon size={16} strokeWidth={2} color="#000" />
                  </div>
                  <span style={{ fontSize: "12px", color: "#666", fontWeight: 500 }}>Invoice.In / Solusi</span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
