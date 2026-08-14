"use client";

import { useState, useMemo, useEffect } from "react";

interface ReportItem {
  id: string;
  date: string;
  invoiceNo: string;
  client: string;
  invoiced: number;
  collected: number;
  expense: number;
  status: "Paid" | "Pending" | "Overdue";
  currency: string;
}

export default function ReportsPage() {
  // Company details for printing/header
  const [companyName, setCompanyName] = useState("Infinity Go Indonesia");

  // Date range state - defaults dynamically to the 1st of the current month until the end of the current month
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}-01`;
  });
  const [endDate, setEndDate] = useState(() => {
    const today = new Date();
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const year = lastDay.getFullYear();
    const month = String(lastDay.getMonth() + 1).padStart(2, "0");
    const day = String(lastDay.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });

  // Fresh transaction dataset state
  const [allTransactions, setAllTransactions] = useState<ReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Try loading from localStorage cache first
    try {
      const cached = localStorage.getItem("invoicein_cache_reports");
      const savedComp = localStorage.getItem("companyDetails");
      if (savedComp) {
        const parsed = JSON.parse(savedComp);
        if (parsed.companyName) setCompanyName(parsed.companyName);
      }
      if (cached) {
        setAllTransactions(JSON.parse(cached));
        setIsLoading(false); // Render immediately using cached data
      }
    } catch (e) {
      console.warn("Error loading cached reports", e);
    }

    async function loadData() {
      try {
        const savedComp = localStorage.getItem("companyDetails");
        if (savedComp) {
          const parsed = JSON.parse(savedComp);
          if (parsed.companyName) setCompanyName(parsed.companyName);
        }

        // Fetch live database invoices and expenses
        const [resInvoices, resExpenses] = await Promise.all([
          fetch("/api/invoices"),
          fetch("/api/expenses")
        ]);

        const dataInvoices = await resInvoices.json();
        const dataExpenses = await resExpenses.json();

        const invoicesList = dataInvoices.success ? dataInvoices.invoices : [];
        const expensesList = dataExpenses.success ? dataExpenses.expenses : [];

        const transactions: ReportItem[] = invoicesList.map((inv: any) => {
          const totalAmount = Number(inv.amount) || 0;
          
          // DP amount
          const rawDp = Number(inv.downPayment) || 0;
          const dpAmount = inv.dpType === "percent" 
            ? (totalAmount * Math.min(100, Math.max(0, rawDp))) / 100 
            : Math.min(totalAmount, Math.max(0, rawDp));

          // Collected amount
          let collected = Number(inv.amountPaid) || 0;
          if (collected === 0) {
            if (inv.status === "Lunas" || inv.status === "Paid") {
              collected = totalAmount;
            } else {
              collected = dpAmount; // Downpayment is paid, rest is pending
            }
          }

          // Expenses sum
          const associatedExp = expensesList.filter((e: any) => e.invoiceId === inv.id);
          const expenseTotal = associatedExp.reduce((sum: number, e: any) => sum + (Number(e.amount) || 0), 0);

          return {
            id: inv.id,
            date: inv.date || new Date().toISOString().split('T')[0],
            invoiceNo: inv.invoiceNumber || inv.id,
            client: inv.customer || inv.clientName || "Klien Umum",
            invoiced: totalAmount,
            collected: collected,
            expense: expenseTotal,
            status: inv.status === "Lunas" || inv.status === "Paid" 
              ? "Paid" 
              : (inv.status === "Jatuh Tempo" || inv.status === "Overdue" ? "Overdue" : "Pending"),
            currency: inv.currency || "IDR"
          };
        });

        setAllTransactions(transactions);
        localStorage.setItem("invoicein_cache_reports", JSON.stringify(transactions));
      } catch (e) {
        console.error("Error loading reports data:", e);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // Filtered transactions based on date range
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter(item => {
      return item.date >= startDate && item.date <= endDate;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [startDate, endDate, allTransactions]);

  // Aggregate stats
  const totals = useMemo(() => {
    const invoiced = filteredTransactions.reduce((acc, cur) => acc + cur.invoiced, 0);
    const collected = filteredTransactions.reduce((acc, cur) => acc + cur.collected, 0);
    const expense = filteredTransactions.reduce((acc, cur) => acc + cur.expense, 0);
    const pending = Math.max(0, invoiced - collected);
    const profit = collected - expense;

    return { invoiced, collected, expense, pending, profit };
  }, [filteredTransactions]);

  const formatCurrency = (val: number, currency: string = "IDR") => {
    try {
      return new Intl.NumberFormat(currency === "IDR" ? "id-ID" : "en-US", {
        style: "currency",
        currency: currency,
        maximumFractionDigits: currency === "IDR" ? 0 : 2
      }).format(val);
    } catch (e) {
      return `${currency === "IDR" ? "Rp" : currency} ${val.toLocaleString("id-ID")}`;
    }
  };

  // Export to CSV Function
  const handleExportCSV = () => {
    const headers = ["No", "Tanggal", "Nomor Invoice", "Nama Klien", "Total Ditagih (Rp)", "Diterima / Lunas (Rp)", "Biaya Operasional (Rp)", "Laba Bersih (Rp)", "Status"];
    
    const rows = filteredTransactions.map((item, idx) => [
      idx + 1,
      item.date,
      `"${item.invoiceNo}"`,
      `"${item.client}"`,
      item.invoiced,
      item.collected,
      item.expense,
      item.collected - item.expense,
      item.status
    ]);

    // Add Summary Row
    rows.push([]);
    rows.push([
      "TOTAL",
      "",
      "",
      "",
      totals.invoiced,
      totals.collected,
      totals.expense,
      totals.profit,
      ""
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Laporan_Keuangan_${startDate}_sampai_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="dashboard-content-inner">
      
      {/* Top Header */}
      <div className="no-print" style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: 'var(--foreground, #0f172a)' }}>
          Laporan Keuangan & Rekapitulasi
        </h1>
        <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>
          Pantau omzet, arus kas masuk, piutang, dan laba operasional berdasarkan rentang tanggal yang fleksibel.
        </p>
      </div>

      {/* Date Range & Export Control Card */}
      <div className="reports-filter-card no-print">
        <div className="reports-filter-top-row">
          
          {/* Flexible Date Picker (Dari Tanggal s/d Sampai Tanggal) */}
          <div className="date-range-container">
            <div className="date-input-group">
              <label>Dari Tanggal:</label>
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => {
                  setStartDate(e.target.value);
                }} 
              />
            </div>

            <span style={{ color: '#94a3b8', fontWeight: 600 }}>s/d</span>

            <div className="date-input-group">
              <label>Sampai Tanggal:</label>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => {
                  setEndDate(e.target.value);
                }} 
              />
            </div>
          </div>

          {/* Export Actions */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button 
              type="button"
              onClick={handleExportCSV}
              className="report-export-btn btn-excel"
              title="Unduh file Excel / CSV"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Unduh Excel (CSV)
            </button>

            <button 
              type="button"
              onClick={handlePrintPDF}
              className="report-export-btn btn-pdf"
              title="Cetak atau simpan sebagai PDF"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Cetak Rekap PDF
            </button>
          </div>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="dash-stats-grid" style={{ marginBottom: '24px' }}>
        <div className="dash-card stat-card">
          <div className="stat-title">Total Ditagih (Invoiced)</div>
          <div className="stat-value" style={{ color: '#2563eb' }}>{formatCurrency(totals.invoiced)}</div>
          <div className="stat-subtitle">{filteredTransactions.length} invoice dalam rentang waktu</div>
        </div>

        <div className="dash-card stat-card">
          <div className="stat-title">Penerimaan Kas (Lunas)</div>
          <div className="stat-value" style={{ color: '#16a34a' }}>{formatCurrency(totals.collected)}</div>
          <div className="stat-subtitle">
            {totals.invoiced > 0 ? `${Math.round((totals.collected / totals.invoiced) * 100)}% dari total tagihan` : "0%"}
          </div>
        </div>

        <div className="dash-card stat-card">
          <div className="stat-title">Piutang / Pending</div>
          <div className="stat-value" style={{ color: '#d97706' }}>{formatCurrency(totals.pending)}</div>
          <div className="stat-subtitle">Menunggu pelunasan klien</div>
        </div>

        <div className="dash-card stat-card">
          <div className="stat-title">Estimasi Laba Bersih</div>
          <div className="stat-value" style={{ color: '#7c3aed' }}>{formatCurrency(totals.profit)}</div>
          <div className="stat-subtitle">Penerimaan dikurangi operasional</div>
        </div>
      </div>

      {/* Reports Table Card */}
      <div className="dash-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--foreground, #0f172a)' }}>
              Rincian Transaksi & Arus Kas
            </h2>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Periode: {startDate} s/d {endDate} ({filteredTransactions.length} data ditemukan)
            </span>
          </div>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '48px 16px', color: '#64748b' }}>
            <div className="spinner" style={{ border: '3px solid #f3f3f3', borderTop: '3px solid #2563eb', borderRadius: '50%', width: '30px', height: '30px', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }}></div>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
            <span>Memuat data laporan...</span>
          </div>
        ) : filteredTransactions.length > 0 ? (
          <div className="table-responsive-wrapper">
            <table className="invoice-table" style={{ width: '100%', minWidth: '750px' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '12px' }}>Tanggal</th>
                  <th style={{ textAlign: 'left', padding: '12px' }}>No. Invoice</th>
                  <th style={{ textAlign: 'left', padding: '12px' }}>Klien</th>
                  <th style={{ textAlign: 'right', padding: '12px' }}>Total Ditagih</th>
                  <th style={{ textAlign: 'right', padding: '12px' }}>Kas Masuk</th>
                  <th style={{ textAlign: 'right', padding: '12px' }}>Biaya Operasional</th>
                  <th style={{ textAlign: 'right', padding: '12px' }}>Laba Bersih</th>
                  <th style={{ textAlign: 'center', padding: '12px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((row) => (
                  <tr key={row.id}>
                    <td style={{ padding: '12px', color: '#64748b', fontSize: '13px' }}>
                      {row.date}
                    </td>
                    <td style={{ fontWeight: 600, color: '#2563eb', padding: '12px' }}>
                      {row.invoiceNo}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--foreground, #0f172a)', padding: '12px' }}>
                      {row.client}
                    </td>
                    <td style={{ textAlign: 'right', padding: '12px', fontWeight: 600 }}>
                      {formatCurrency(row.invoiced, row.currency)}
                    </td>
                    <td style={{ textAlign: 'right', padding: '12px', fontWeight: 600, color: '#16a34a' }}>
                      {formatCurrency(row.collected, row.currency)}
                    </td>
                    <td style={{ textAlign: 'right', padding: '12px', color: '#dc2626' }}>
                      {formatCurrency(row.expense, row.currency)}
                    </td>
                    <td style={{ textAlign: 'right', padding: '12px', fontWeight: 700, color: '#7c3aed' }}>
                      {formatCurrency(row.collected - row.expense, row.currency)}
                    </td>
                    <td style={{ textAlign: 'center', padding: '12px' }}>
                      <span className={`status-badge status-${row.status.toLowerCase()}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '48px 16px', color: '#64748b' }}>
            <svg width="40" height="40" fill="none" stroke="#cbd5e1" viewBox="0 0 24 24" style={{ margin: '0 auto 12px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p style={{ fontWeight: 600, margin: 0, color: '#0f172a' }}>Tidak ada data transaksi pada rentang tanggal ini.</p>
            <p style={{ fontSize: '12px', marginTop: '4px' }}>Coba ubah tanggal mulai atau tanggal akhir pada filter di atas.</p>
          </div>
        )}
      </div>

      {/* HIDDEN PRINT-ONLY FINANCIAL RECAP A4 TEMPLATE */}
      <div className="screen-hidden invoice-print-container">
        <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif', color: '#0f172a' }}>
          <div style={{ borderBottom: '2px solid #2563eb', paddingBottom: '16px', marginBottom: '20px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: '#2563eb' }}>{companyName}</h1>
            <h2 style={{ fontSize: '15px', fontWeight: 700, margin: '6px 0 0', color: '#0f172a' }}>REKAPITULASI LAPORAN KEUANGAN</h2>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0' }}>
              Periode Laporan: <strong>{startDate}</strong> s/d <strong>{endDate}</strong>
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
            <div style={{ border: '1px solid #cbd5e1', padding: '10px', borderRadius: '6px' }}>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Total Ditagih</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#2563eb' }}>{formatCurrency(totals.invoiced)}</div>
            </div>
            <div style={{ border: '1px solid #cbd5e1', padding: '10px', borderRadius: '6px' }}>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Total Kas Masuk</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#16a34a' }}>{formatCurrency(totals.collected)}</div>
            </div>
            <div style={{ border: '1px solid #cbd5e1', padding: '10px', borderRadius: '6px' }}>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Piutang / Pending</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#d97706' }}>{formatCurrency(totals.pending)}</div>
            </div>
            <div style={{ border: '1px solid #cbd5e1', padding: '10px', borderRadius: '6px' }}>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Estimasi Laba Bersih</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#7c3aed' }}>{formatCurrency(totals.profit)}</div>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
            <thead>
              <tr style={{ backgroundColor: '#2563eb', color: '#ffffff' }}>
                <th style={{ padding: '8px', textAlign: 'left' }}>Tanggal</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>No. Invoice</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Klien</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>Ditagih</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>Kas Masuk</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>Biaya</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>Laba Bersih</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '8px' }}>{item.date}</td>
                  <td style={{ padding: '8px', fontWeight: 600 }}>{item.invoiceNo}</td>
                  <td style={{ padding: '8px' }}>{item.client}</td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>{formatCurrency(item.invoiced, item.currency)}</td>
                  <td style={{ padding: '8px', textAlign: 'right', color: '#16a34a' }}>{formatCurrency(item.collected, item.currency)}</td>
                  <td style={{ padding: '8px', textAlign: 'right', color: '#dc2626' }}>{formatCurrency(item.expense, item.currency)}</td>
                  <td style={{ padding: '8px', textAlign: 'right', fontWeight: 700 }}>{formatCurrency(item.collected - item.expense, item.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        @media screen {
          .screen-hidden {
            display: none !important;
          }
        }
        @media print {
          /* Hide screen-only dashboard navigation, sidebars, headers, and filters */
          .no-print, 
          header, 
          nav, 
          aside, 
          .sidebar, 
          .dashboard-header,
          button,
          .reports-filter-card {
            display: none !important;
          }
          
          .screen-hidden {
            display: block !important;
          }
          
          /* Override wrapper layouts that cause clipping/blank pages on print */
          html, 
          body, 
          .dashboard-layout, 
          .dashboard-main, 
          .dashboard-content-inner,
          #root {
            background: #ffffff !important;
            color: #000000 !important;
            height: auto !important;
            min-height: auto !important;
            overflow: visible !important;
            position: static !important;
            display: block !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          .dashboard-content-inner {
            max-width: 100% !important;
            width: 100% !important;
          }
        }
      `}</style>

    </div>
  );
}
