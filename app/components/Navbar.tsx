"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export default function Navbar() {
  const navRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useGSAP(() => {
    const tl = gsap.timeline({ delay: 0.2 });
    tl.fromTo(".navbar-logo", 
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
    )
    .fromTo(".navbar-pill-container", 
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, 
      "-=0.4"
    )
    .fromTo(".navbar-actions", 
      { x: 20, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, 
      "-=0.4"
    );
  }, { scope: navRef });

  // Mobile Menu Animation
  useGSAP(() => {
    if (!menuRef.current) return;
    
    if (menuOpen) {
      gsap.to(menuRef.current, {
        autoAlpha: 1,
        y: 0,
        duration: 0.4,
        ease: "power3.out"
      });
      gsap.fromTo(".mobile-nav-item", 
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: "power2.out", delay: 0.1 }
      );
    } else {
      gsap.to(menuRef.current, {
        autoAlpha: 0,
        y: -20,
        duration: 0.3,
        ease: "power2.in"
      });
    }
  }, [menuOpen]);

  return (
    <div className="navbar-wrapper" ref={navRef}>
      
      {/* Header layout that scrolls away (Logo & Actions) */}
      <div className="container-inner navbar-layout">
        <Link href="/" className="navbar-logo" aria-label="Beranda Invoice.In">
          <Image
            src="/images/logoin2.png"
            alt="Logo Invoice.In"
            width={48}
            height={48}
            priority
            style={{ objectFit: 'contain' }}
          />
          <span style={{ fontSize: '24px' }}>Invoice.In</span>
        </Link>

        <div className="navbar-actions desktop-only">
          <Link href="/login" className="btn-ghost-light">Masuk</Link>
          <Link href="/register" className="btn-pill-white">Daftar Sekarang</Link>
        </div>
      </div>

      {/* Center Pill Menu that stays sticky */}
      <div className={`navbar-pill-container ${scrolled ? 'fixed-pill' : 'absolute-pill'}`}>
        <nav className="navbar-pill desktop-only">
          <ul className="navbar-nav" role="navigation" aria-label="Navigasi Utama">
            <li><a href="#features">Fitur</a></li>
            <li><a href="#solutions">Solusi</a></li>
            <li><a href="#pricing">Keunggulan</a></li>
            <li><a href="#capabilities">Kemampuan</a></li>
            <li><a href="#footer">Kontak</a></li>
          </ul>
        </nav>

        {/* Floating Mobile Toggle Button */}
        <button 
          className="mobile-menu-btn" 
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Buka Menu"
        >
          <div className={`hamburger ${menuOpen ? "open" : ""}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div className="mobile-menu" ref={menuRef} style={{ visibility: "hidden", opacity: 0 }}>
        <ul className="mobile-nav-list">
          <li className="mobile-nav-item"><a href="#features" onClick={() => setMenuOpen(false)}>Fitur</a></li>
          <li className="mobile-nav-item"><a href="#solutions" onClick={() => setMenuOpen(false)}>Solusi</a></li>
          <li className="mobile-nav-item"><a href="#pricing" onClick={() => setMenuOpen(false)}>Keunggulan</a></li>
          <li className="mobile-nav-item"><a href="#capabilities" onClick={() => setMenuOpen(false)}>Kemampuan</a></li>
          <li className="mobile-nav-item"><a href="#footer" onClick={() => setMenuOpen(false)}>Kontak</a></li>
        </ul>
        <div className="mobile-actions" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
          <Link href="/login" className="btn-pill-outline" style={{ width: '100%', display: 'inline-flex', justifyContent: 'center' }} onClick={() => setMenuOpen(false)}>Masuk</Link>
          <Link href="/register" className="btn-pill-green" style={{ width: '100%', display: 'inline-flex', justifyContent: 'center' }} onClick={() => setMenuOpen(false)}>Daftar Sekarang</Link>
        </div>
      </div>
    </div>
  );
}
