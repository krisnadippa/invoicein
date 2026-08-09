"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { EtherealShadow } from "@/components/ui/etheral-shadow";

const rotatingWords = ["Profesional", "Modern"];

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const [wordIndex, setWordIndex] = useState(0);

  // Relaxed & smooth rotation between "Profesional" and "Modern" every 4.6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 4600);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="hero" ref={heroRef} id="hero">
      {/* Animated Black & Silver Ethereal Shadow Canvas */}
      <div className="hero-shadow-bg">
        <EtherealShadow
          color="rgba(195, 205, 220, 0.28)"
          animation={{ scale: 65, speed: 50 }}
          noise={{ opacity: 0.35, scale: 1.2 }}
          sizing="fill"
        />
      </div>

      <div className="hero-bg-overlay" />

      {/* Hero Center Content */}
      <div className="container-inner hero-content">
        {/* Dynamic Rotating Title with Fixed Width & Pure Solid White Text */}
        <h1 className="hero-title">
          <span>Buat Invoice Digital</span>{" "}
          <span className="hero-word-rotator">
            <span key={wordIndex} className="hero-word-slide">
              {rotatingWords[wordIndex]}
            </span>
          </span>
          <br />
          <span>dalam Hitungan Detik</span>
        </h1>

        {/* Subtitle */}
        <p className="hero-subtitle">
          Tinggalkan cara manual. Buat faktur instan, hitung DP & pajak otomatis, cetak PDF resmi, dan pantau arus kas bisnis Anda lebih cepat tanpa ribet.
        </p>

        {/* Action Button */}
        <div className="hero-btn">
          <Link href="/register" className="btn-hero">
            <span className="btn-hero-text">Mulai Sekarang Gratis</span>
            <div className="btn-hero-arrow-wrapper">
              <span className="btn-hero-arrow arrow-out">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 7H13M13 7L7 1M13 7L7 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <span className="btn-hero-arrow arrow-in">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 7H13M13 7L7 1M13 7L7 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
