"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

interface SidebarProps {
  isCollapsed?: boolean;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  companyName?: string;
  companyLogo?: string;
  industry?: string;
  themeColor?: string;
}

export default function Sidebar({ 
  isCollapsed = false, 
  isOpenMobile = false,
  onCloseMobile,
  companyName: propCompanyName,
  companyLogo: propCompanyLogo,
  industry: propIndustry,
  themeColor: propThemeColor
}: SidebarProps) {
  const pathname = usePathname();
  const [invoiceMenuOpen, setInvoiceMenuOpen] = useState(pathname.includes('/invoices'));

  // Local state that can read directly from localStorage to guarantee real-time sync with onboarding/settings
  const [brand, setBrand] = useState({
    name: propCompanyName || "Infinity Go Indonesia",
    logo: propCompanyLogo || "",
    industry: propIndustry || "Tour & Travel / Hospitality",
    themeColor: propThemeColor || "#2563eb"
  });

  const [userProfile, setUserProfile] = useState({
    name: "Admin",
    role: "Administrator",
    avatarInitial: "A"
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem("companyDetails");
      if (saved) {
        const parsed = JSON.parse(saved);
        setBrand({
          name: parsed.companyName || propCompanyName || "Infinity Go Indonesia",
          logo: parsed.logoBase64 || propCompanyLogo || "",
          industry: parsed.industry || propIndustry || "Tour & Travel / Hospitality",
          themeColor: parsed.themeColor || propThemeColor || "#2563eb"
        });
      }

      const savedUser = localStorage.getItem("invoicein_user");
      if (savedUser) {
        const user = JSON.parse(savedUser);
        const name = user.username || "Admin";
        setUserProfile({
          name: name,
          role: "Administrator / Owner",
          avatarInitial: name.charAt(0).toUpperCase()
        });
      }
    } catch {
      // Ignore
    }
  }, [propCompanyName, propCompanyLogo, propIndustry, propThemeColor]);

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" },
    { 
      name: "Invoice", 
      href: "/dashboard/invoices", 
      icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
      hasSubmenu: true
    },
    { name: "Data Klien", href: "/dashboard/clients", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
    { name: "Laporan Keuangan", href: "/dashboard/reports", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
    { name: "Pengaturan", href: "/dashboard/settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
  ];

  const handleLinkClick = () => {
    onCloseMobile?.();
  };

  const displayName = brand.name || "Infinity Go Indonesia";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <aside className={`dashboard-sidebar ${isCollapsed ? 'collapsed' : ''} ${isOpenMobile ? 'mobile-open' : ''}`}>
      {/* Header Row: Company Brand with Logo */}
      <div className="sidebar-header-row" style={{ display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between', width: '100%', marginBottom: '16px' }}>
        {!isCollapsed ? (
          <Link 
            href="/dashboard" 
            className="sidebar-brand-card" 
            onClick={handleLinkClick}
            title={displayName}
          >
            {/* Logo Container */}
            <div className="sidebar-brand-logo">
              {brand.logo ? (
                <img 
                  src={brand.logo} 
                  alt={displayName} 
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                />
              ) : (
                <div 
                  className="sidebar-avatar-fallback" 
                  style={{ background: brand.themeColor }}
                >
                  {initial}
                </div>
              )}
            </div>

            {/* Company Info */}
            <div className="sidebar-brand-info">
              <div className="sidebar-brand-name">{displayName}</div>
              <div className="sidebar-brand-tag">{brand.industry || "Official Business"}</div>
            </div>
          </Link>
        ) : (
          <Link 
            href="/dashboard" 
            className="sidebar-brand-collapsed" 
            onClick={handleLinkClick}
            title={displayName}
          >
            {brand.logo ? (
              <img 
                src={brand.logo} 
                alt={displayName} 
                style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '3px' }} 
              />
            ) : (
              <div 
                className="sidebar-avatar-fallback" 
                style={{ background: brand.themeColor }}
              >
                {initial}
              </div>
            )}
          </Link>
        )}

        {/* Mobile Close Button */}
        {isOpenMobile && (
          <button 
            type="button" 
            className="sidebar-close-mobile-btn"
            onClick={onCloseMobile}
            aria-label="Tutup Menu"
            style={{ marginLeft: '8px' }}
          >
            ✕
          </button>
        )}
      </div>
      
      {!isCollapsed && <div className="sidebar-menu-label" style={{ marginTop: '20px' }}>MENU UTAMA</div>}
      
      <nav className="sidebar-nav" style={{ marginTop: isCollapsed ? '24px' : '0' }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/dashboard');
          
          return (
            <div key={item.name}>
              <Link 
                href={item.hasSubmenu ? "#" : item.href}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                onClick={(e) => {
                  if (item.hasSubmenu) {
                    e.preventDefault();
                    if (!isCollapsed) {
                      setInvoiceMenuOpen(!invoiceMenuOpen);
                    }
                  } else {
                    handleLinkClick();
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                  </svg>
                  {!isCollapsed && <span>{item.name}</span>}
                </div>
                {!isCollapsed && item.hasSubmenu && (
                  <svg 
                    width="16" 
                    height="16" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    style={{ 
                      transform: invoiceMenuOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                      marginLeft: 'auto'
                    }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </Link>

              {/* Submenu for Invoices */}
              {item.hasSubmenu && invoiceMenuOpen && !isCollapsed && (
                <div className="sidebar-submenu">
                  <Link href="/dashboard/invoices" className="sidebar-submenu-item" onClick={handleLinkClick}>
                    Semua Invoice
                  </Link>
                  <Link href="/dashboard/invoices/create" className="sidebar-submenu-item" onClick={handleLinkClick}>
                    Buat Invoice Baru
                  </Link>
                  <Link href="/dashboard/invoices/drafts" className="sidebar-submenu-item" onClick={handleLinkClick}>
                    Draf Invoice
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Sidebar Footer with User Profile & Logout */}
      <div className="sidebar-footer" style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
        {/* User Profile Card inside Sidebar */}
        {!isCollapsed ? (
          <Link 
            href="/dashboard/settings" 
            className="sidebar-user-card"
            onClick={handleLinkClick}
            title="Pengaturan Akun & Profil"
          >
            <div className="sidebar-user-avatar">
              {userProfile.avatarInitial}
            </div>
            <div className="sidebar-user-details">
              <span className="sidebar-user-name">{userProfile.name}</span>
              <span className="sidebar-user-role">{userProfile.role}</span>
            </div>
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#94a3b8', marginLeft: 'auto', flexShrink: 0 }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ) : (
          <Link 
            href="/dashboard/settings" 
            className="sidebar-user-collapsed" 
            onClick={handleLinkClick}
            title={`${userProfile.name} (${userProfile.role})`}
          >
            <div className="sidebar-user-avatar">
              {userProfile.avatarInitial}
            </div>
          </Link>
        )}

        <Link href="/login" className="sidebar-nav-item" style={{ color: '#ef4444', padding: '8px 12px' }} onClick={handleLinkClick}>
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {!isCollapsed && <span>Keluar Akun</span>}
        </Link>
      </div>
    </aside>
  );
}
