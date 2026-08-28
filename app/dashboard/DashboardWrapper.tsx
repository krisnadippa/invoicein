"use client";

import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import DashboardHeader from "../components/DashboardHeader";

export default function DashboardWrapper({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const [companyInfo, setCompanyInfo] = useState({
    name: "Perusahaan Saya",
    logo: "",
    industry: "Tour & Travel / Hospitality",
    themeColor: "#2563eb"
  });

  const [userData, setUserData] = useState({
    name: "Admin",
    role: "Administrator",
    company: "Perusahaan Saya",
    avatarInitial: "P"
  });
  
  useEffect(() => {
    // 1. Initial read from local storage for instant layout rendering
    try {
      const saved = localStorage.getItem("companyDetails");
      if (saved) {
        const parsed = JSON.parse(saved);
        const compName = parsed.companyName || "Infinity Go Indonesia";
        setCompanyInfo({
          name: compName,
          logo: parsed.logoBase64 || "",
          industry: parsed.industry || "Tour & Travel / Hospitality",
          themeColor: parsed.themeColor || "#2563eb"
        });
        setUserData(prev => ({
          ...prev,
          company: compName,
          avatarInitial: compName.charAt(0).toUpperCase()
        }));
      }

      const savedUser = localStorage.getItem("invoicein_user");
      if (savedUser) {
        const user = JSON.parse(savedUser);
        if (user.username) {
          setUserData(prev => ({
            ...prev,
            name: user.username
          }));
        }
      }
    } catch (e) {
      console.error("Failed to parse local storage cache", e);
    }

    // 2. Fetch fresh company profile from database
    fetch("/api/company")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.company) {
          const comp = data.company;
          const compName = comp.companyName || "Infinity Go Indonesia";
          setCompanyInfo({
            name: compName,
            logo: comp.logoBase64 || "",
            industry: comp.industry || "Tour & Travel / Hospitality",
            themeColor: comp.themeColor || "#2563eb"
          });
          setUserData(prev => ({
            ...prev,
            company: compName,
            avatarInitial: compName.charAt(0).toUpperCase()
          }));
          try {
            localStorage.setItem("companyDetails", JSON.stringify(comp));
          } catch {}
        }
      })
      .catch(err => console.error("Error fetching company details:", err));

    // 3. Listen to real-time custom events when settings or logo are updated
    const handleCompanyUpdate = (e: any) => {
      const comp = e.detail;
      if (comp) {
        const compName = comp.companyName || "Infinity Go Indonesia";
        setCompanyInfo({
          name: compName,
          logo: comp.logoBase64 || "",
          industry: comp.industry || "Tour & Travel / Hospitality",
          themeColor: comp.themeColor || "#2563eb"
        });
        setUserData(prev => ({
          ...prev,
          company: compName,
          avatarInitial: compName.charAt(0).toUpperCase()
        }));
      }
    };

    window.addEventListener("companyDetailsUpdated", handleCompanyUpdate);
    window.addEventListener("storage", (e) => {
      if (e.key === "companyDetails" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          handleCompanyUpdate({ detail: parsed });
        } catch {}
      }
    });

    return () => {
      window.removeEventListener("companyDetailsUpdated", handleCompanyUpdate);
    };
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [isDarkMode]);

  const toggleSidebar = () => {
    if (window.innerWidth <= 768) {
      setIsMobileSidebarOpen(!isMobileSidebarOpen);
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <div className={`dashboard-layout ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      {/* Mobile Drawer Backdrop */}
      {isMobileSidebarOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={() => setIsMobileSidebarOpen(false)}
          aria-label="Tutup Menu"
        />
      )}

      {/* Sidebar (Desktop Sticky + Mobile Off-Canvas Drawer) */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        companyName={companyInfo.name}
        companyLogo={companyInfo.logo}
        industry={companyInfo.industry}
        themeColor={companyInfo.themeColor}
      />

      {/* Main Workspace Area */}
      <main className="dashboard-main">
        <DashboardHeader 
          toggleSidebar={toggleSidebar} 
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
        />
        {children}
      </main>
    </div>
  );
}
