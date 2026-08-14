"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface RecentInvoice {
  id: string;
  customer: string;
  total: string;
  status: "Lunas" | "Menunggu" | "Jatuh Tempo";
}

export default function DashboardOverview() {
  const [invoices, setInvoices] = useState<RecentInvoice[]>([]);
  const [totalInvoicesCount, setTotalInvoicesCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalPendingCount, setTotalPendingCount] = useState(0);
  const [totalPaidCount, setTotalPaidCount] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [monthlyTarget, setMonthlyTarget] = useState(10000000);
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [targetInput, setTargetInput] = useState("");
  const [monthlyRevenueData, setMonthlyRevenueData] = useState<number[]>(new Array(12).fill(0));
  const [monthlyExpenseData, setMonthlyExpenseData] = useState<number[]>(new Array(12).fill(0));

  const processDashboardData = (companyData: any, expensesData: any, invoicesData: any) => {
    // 1. Process Company monthly target
    if (companyData && companyData.success && companyData.company) {
      setMonthlyTarget(companyData.company.revenueTarget || 10000000);
    }

    // 2. Process Expenses
    let totalExp = 0;
    const mExp = new Array(12).fill(0);
    const currentYear = new Date().getFullYear();

    if (expensesData && expensesData.success && Array.isArray(expensesData.expenses)) {
      totalExp = expensesData.expenses.reduce((sum: number, item: any) => sum + (item.amount || 0), 0);
      expensesData.expenses.forEach((item: any) => {
        if (item.date) {
          const expDate = new Date(item.date);
          if (expDate.getFullYear() === currentYear) {
            const month = expDate.getMonth();
            mExp[month] += item.amount || 0;
          }
        }
      });
    }
    setTotalExpenses(totalExp);
    setMonthlyExpenseData(mExp);

    // 3. Process Invoices
    if (invoicesData && invoicesData.success && Array.isArray(invoicesData.invoices)) {
      const parsed = invoicesData.invoices;
      setInvoices(parsed.slice(0, 5)); // Show latest 5 invoices
      setTotalInvoicesCount(parsed.length);
      let rev = 0;
      let pending = 0;
      let paid = 0;
      const mRev = new Array(12).fill(0);

      parsed.forEach((inv: any) => {
        const totalAmount = inv.amount || 0;
        const rawDp = Number(inv.downPayment) || 0;
        const dpAmount = inv.dpType === "percent" 
          ? (totalAmount * Math.min(100, Math.max(0, rawDp))) / 100 
          : Math.min(totalAmount, Math.max(0, rawDp));

        if (inv.status === "Lunas" || inv.status === "Paid") {
          rev += totalAmount;
          paid += 1;
        } else {
          rev += dpAmount; // DP paid is part of revenue
          pending += 1;
        }

        // Aggregate by month for current year
        if (inv.date) {
          const invDate = new Date(inv.date);
          if (invDate.getFullYear() === currentYear) {
            const month = invDate.getMonth();
            if (inv.status === "Lunas" || inv.status === "Paid") {
              mRev[month] += totalAmount;
            } else {
              mRev[month] += dpAmount;
            }
          }
        }
      });
      setTotalRevenue(rev);
      setTotalPendingCount(pending);
      setTotalPaidCount(paid);
      setMonthlyRevenueData(mRev);
    }
  };

  // Load created invoices from localStorage or state if any
  const fetchDashboardData = async () => {
    try {
      // Fetch details in parallel to avoid waterfall network delays
      const [companyRes, expensesRes, invoicesRes] = await Promise.all([
        fetch("/api/company"),
        fetch("/api/expenses"),
        fetch("/api/invoices")
      ]);

      const [companyData, expensesData, invoicesData] = await Promise.all([
        companyRes.json(),
        expensesRes.json(),
        invoicesRes.json()
      ]);

      processDashboardData(companyData, expensesData, invoicesData);

      // Cache the response
      localStorage.setItem("invoicein_cache_dashboard", JSON.stringify({
        companyData,
        expensesData,
        invoicesData
      }));
    } catch (err) {
      console.error("Error loading dashboard data", err);
    }
  };

  useEffect(() => {
    // Try loading from localStorage cache first for instant rendering
    try {
      const cached = localStorage.getItem("invoicein_cache_dashboard");
      if (cached) {
        const { companyData, expensesData, invoicesData } = JSON.parse(cached);
        processDashboardData(companyData, expensesData, invoicesData);
      }
    } catch (e) {
      console.warn("Error loading cached dashboard data", e);
    }

    fetchDashboardData();
  }, []);

  const handleSaveTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = Number(targetInput.replace(/[^0-9]/g, "")) || 0;
    try {
      const res = await fetch("/api/company", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ revenueTarget: clean }),
      });
      const data = await res.json();
      if (data.success) {
        setMonthlyTarget(clean);
      }
    } catch (err) {
      console.error("Failed to save target", err);
    }
    setIsTargetModalOpen(false);
  };

  const formatRupiah = (val: number) => {
    return `Rp ${val.toLocaleString("id-ID")}`;
  };

  return (
    <div className="dashboard-content-inner">
      <div className="page-header">
        <div>
          <h1>Dashboard Keuangan</h1>
          <p>Selamat datang di pusat pengelolaan invoice dan pemantauan arus kas bisnis Anda</p>
        </div>
        <div className="date">
          {new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* 6 Stat Cards - Fresh Zero State */}
      <div className="dash-stats-grid">
        <div className="dash-card stat-card">
          <div className="stat-card-top">
            <div className="stat-icon blue">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className="stat-title">Total Invoice Diterbitkan</div>
          <div className="stat-value">{totalInvoicesCount}</div>
          <div className="stat-subtitle">Akun Baru</div>
        </div>

        <div className="dash-card stat-card">
          <div className="stat-card-top">
            <div className="stat-icon green">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="stat-title">Total Pendapatan</div>
          <div className="stat-value">{formatRupiah(totalRevenue)}</div>
          <div className="stat-subtitle">Arus Kas Masuk</div>
        </div>

        <div className="dash-card stat-card">
          <div className="stat-card-top">
            <div className="stat-icon red">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
            </div>
          </div>
          <div className="stat-title">Total Biaya Operasional</div>
          <div className="stat-value">{formatRupiah(totalExpenses)}</div>
          <div className="stat-subtitle">Operasional & Modal</div>
        </div>

        <div className="dash-card stat-card">
          <div className="stat-card-top">
            <div className="stat-icon purple">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
          </div>
          <div className="stat-title">Laba Bersih</div>
          <div className="stat-value">{formatRupiah(totalRevenue - totalExpenses)}</div>
          <div className="stat-subtitle">Net Profit</div>
        </div>

        <div className="dash-card stat-card">
          <div className="stat-card-top">
            <div className="stat-icon orange">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="stat-title">Invoice Menunggu Bayar</div>
          <div className="stat-value">{totalPendingCount}</div>
        </div>

        <div className="dash-card stat-card">
          <div className="stat-card-top">
            <div className="stat-icon teal">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="stat-title">Invoice Sudah Lunas</div>
          <div className="stat-value">{totalPaidCount}</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        <div className="dash-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">Pendapatan vs Pengeluaran</div>
              <div className="chart-subtitle">Grafik arus kas bulanan tahun berjalan</div>
            </div>
            <div className="chart-legend">
              <div className="legend-item"><div className="legend-dot blue"></div> Pendapatan</div>
              <div className="legend-item"><div className="legend-dot red"></div> Pengeluaran</div>
            </div>
          </div>
          
          <div className="mock-bar-chart">
            {(() => {
              const maxVal = Math.max(...monthlyRevenueData, ...monthlyExpenseData, 1000000);
              return monthlyRevenueData.map((rev, i) => {
                const revHeight = (rev / maxVal) * 160; // Max height 160px
                const expHeight = (monthlyExpenseData[i] / maxVal) * 160;
                return (
                  <div 
                    className="bar-group" 
                    key={i} 
                    title={`Bulan ke-${i+1}\nPendapatan: ${formatRupiah(rev)}\nPengeluaran: ${formatRupiah(monthlyExpenseData[i])}`}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="bar-col blue" style={{ height: `${Math.max(rev > 0 ? 3 : 0, revHeight)}px`, transition: 'height 0.4s ease-out' }}></div>
                    <div className="bar-col red" style={{ height: `${Math.max(monthlyExpenseData[i] > 0 ? 3 : 0, expHeight)}px`, transition: 'height 0.4s ease-out' }}></div>
                  </div>
                );
              });
            })()}
          </div>
          <div className="x-axis">
            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>Mei</span><span>Jun</span><span>Jul</span><span>Agu</span><span>Sep</span><span>Okt</span><span>Nov</span><span>Des</span>
          </div>
        </div>

        <div className="dash-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">Target Omzet Bulanan</div>
              <div className="chart-subtitle">Target omzet bulan ini</div>
            </div>
            <button 
              type="button"
              className="btn-set-target"
              onClick={() => {
                setTargetInput(monthlyTarget.toString());
                setIsTargetModalOpen(true);
              }}
            >
              Atur Target
            </button>
          </div>
          
          <div className="semi-circle-container">
            {(() => {
              const pct = monthlyTarget > 0 ? Math.min(100, Math.round((totalRevenue / monthlyTarget) * 100)) : 0;
              // semi-circle arc length is 251.3
              const strokeOffset = 251.3 - (251.3 * pct) / 100;
              return (
                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <svg width="200" height="110" viewBox="0 0 200 110" style={{ transform: 'rotate(0deg)' }}>
                    <path
                      d="M 20 100 A 80 80 0 0 1 180 100"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="16"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 20 100 A 80 80 0 0 1 180 100"
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="16"
                      strokeLinecap="round"
                      strokeDasharray="251.3"
                      strokeDashoffset={strokeOffset}
                      style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
                    />
                  </svg>
                  <div style={{ position: 'absolute', bottom: '15px', fontSize: '28px', fontWeight: 800, color: 'var(--foreground, #0f172a)' }}>
                    {pct}%
                  </div>
                </div>
              );
            })()}
            <div className="target-label" style={{ marginTop: '4px' }}>Tercapai <b>{formatRupiah(totalRevenue)}</b> dari target {formatRupiah(monthlyTarget)}</div>
            
            <div className="target-stats-row">
              <div className="target-stat-item">
                <span>Target</span>
                <strong className="black">{formatRupiah(monthlyTarget)}</strong>
              </div>
              <div className="target-stat-item">
                <span>Omzet Masuk</span>
                <strong className="green">{formatRupiah(totalRevenue)}</strong>
              </div>
              <div className="target-stat-item">
                <span>Laba Bersih</span>
                <strong className="blue">{formatRupiah(totalRevenue - totalExpenses)}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Target Setting Modal */}
      {isTargetModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div className="dash-card" style={{ width: '100%', maxWidth: '400px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--card-bg, #ffffff)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--foreground)' }}>Atur Target Omzet Bulanan</h3>
              <button 
                type="button" 
                onClick={() => setIsTargetModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTarget} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Target Nominal (Rp) *</label>
                <input 
                  type="text" 
                  required
                  className="form-input" 
                  value={targetInput} 
                  onChange={(e) => {
                    const clean = e.target.value.replace(/[^0-9]/g, "");
                    setTargetInput(clean ? Number(clean).toLocaleString("id-ID") : "");
                  }} 
                  placeholder="10.000.000"
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button 
                  type="button" 
                  onClick={() => setIsTargetModalOpen(false)}
                  className="btn-pill-white"
                  style={{ border: '1px solid #cbd5e1', padding: '8px 16px', fontSize: '13px', borderRadius: '4px' }}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="btn-pill-green"
                  style={{ padding: '8px 20px', fontSize: '13px', borderRadius: '4px', backgroundColor: '#2563eb', color: '#ffffff' }}
                >
                  Simpan Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Grid */}
      <div className="bottom-grid">
        <div className="dash-card">
          <div className="section-header">
            <h2>Invoice Terbaru</h2>
            <Link href="/dashboard/invoices" className="link-primary">
              Lihat semua
            </Link>
          </div>
          
          {invoices.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: "#94a3b8" }}>
                <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p style={{ fontSize: "14px", fontWeight: 600, color: "#1e293b", margin: "0 0 4px" }}>Belum Ada Invoice Diterbitkan</p>
              <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 16px" }}>Mulai buat invoice penagihan resmi pertama Anda sekarang.</p>
              <Link 
                href="/dashboard/invoices/create"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 16px",
                  background: "#2563eb",
                  color: "#ffffff",
                  fontSize: "12px",
                  fontWeight: 600,
                  textDecoration: "none",
                  borderRadius: "6px"
                }}
              >
                + Buat Invoice Baru
              </Link>
            </div>
          ) : (
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>NO. INVOICE</th>
                  <th>KLIEN / PERUSAHAAN</th>
                  <th>TOTAL NOMINAL</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{invoice.id}</td>
                    <td>{invoice.customer}</td>
                    <td style={{ fontWeight: 600 }}>{invoice.total}</td>
                    <td>
                      <span className={`status-badge ${
                        invoice.status === 'Lunas' ? 'status-paid' :
                        invoice.status === 'Menunggu' ? 'status-pending' : 'status-overdue'
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="dash-card">
          <div className="section-header">
            <h2>Layanan & Paket Terlaris</h2>
            <Link href="/dashboard/invoices" className="link-primary">
              Lihat invoice
            </Link>
          </div>
          
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: "#94a3b8" }}>
              <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#1e293b", margin: "0 0 4px" }}>Belum Ada Data Penjualan</p>
            <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>Statistik layanan terlaris akan otomatis terisi saat transaksi Anda tercatat.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
