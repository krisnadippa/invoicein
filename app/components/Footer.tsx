"use client";

import Image from "next/image";
import Link from "next/link";

const footerLinks = {
  "Fitur & Layanan": ["Pembuat Invoice", "Hitung DP & Pajak", "Export PDF", "Laporan Arus Kas"],
  "Solusi Usaha": ["Tour & Travel", "Freelancer & Kreatif", "Jasa & Konsultan", "UMKM & Bisnis"],
  "Perusahaan": ["Tentang Kami", "Panduan Pengguna", "Syarat & Ketentuan", "Kebijakan Privasi"],
};

export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="container-inner">
        <div className="footer-top">
          <div className="footer-logo">
            <Image
              src="/images/logoin2.png"
              alt="Logo Invoice.In"
              width={36}
              height={36}
              style={{ objectFit: 'contain' }}
            />
            <span>Invoice.In</span>
          </div>

          {Object.entries(footerLinks).map(([col, links]) => (
            <div className="footer-col" key={col}>
              <h4>{col}</h4>
              <ul>
                {links.map((link) => (
                  <li key={link}>
                    <Link href="/register">{link}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="footer-bottom">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
            <span suppressHydrationWarning>&copy; {new Date().getFullYear()} Invoice.In - Hak Cipta Dilindungi</span>
          </div>
          
          <div className="footer-social">
            <a href="#" className="social-icon" aria-label="Twitter">𝕏</a>
            <a href="#" className="social-icon" aria-label="LinkedIn">in</a>
            <a href="#" className="social-icon" aria-label="Instagram">ig</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
