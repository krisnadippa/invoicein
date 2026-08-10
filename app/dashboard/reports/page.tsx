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
}

export default function ReportsPage() {
  // Company details for printing/header
  const [companyName, setCompanyName] = useState("Infinity Go Indonesia");

  // Date range state
  const [startDate, setStartDate] = useState("2026-01-01");
  const [endDate, setEndDate] = useState("2026-12-31");
  const [activePreset, setActivePreset] = useState("thisYear");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("companyDetails");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.companyName) setCompanyName(parsed.companyName);
      }
    } catch {
      // Ignore
    }
  }, []);

  // Fresh transaction dataset
  const allTransactions: ReportItem[] = [];

  // Preset Date Handlers
  const handlePreset = (preset: string) => {
    setActivePreset(preset);
    const today = new Date();
    const formatDate = (d: Date) => d.toISOString().split("T")[0];

    if (preset === "last30") {
      const past = new Date();
      past.setDate(today.getDate() - 30);
      setStartDate(formatDate(past));
      setEndDate(formatDate(today));
    } else if (preset === "thisMonth") {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      setStartDate(formatDate(start));
      setEndDate(formatDate(end));
    } else if (preset === "thisQuarter") {
      const quarter = Math.floor(today.getMonth() / 3);
      const start = new Date(today.getFullYear(), quarter * 3, 1);
      const end = new Date(today.getFullYear(), (quarter + 1) * 3, 0);
      setStartDate(formatDate(start));
      setEndDate(formatDate(end));
    } else if (preset === "thisYear") {
      setStartDate("2026-01-01");
      setEndDate("2026-12-31");
    } else if (preset === "all") {
      setStartDate("2024-01-01");
      setEndDate("2027-12-31");
    }
  };

  // Filtered transactions based on date range
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter(item => {
      return item.date >= startDate && item.date <= endDate;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [startDate, endDate]);

  // Aggregate stats
  const totals = useMemo(() => {
    const invoiced = filteredTransactions.reduce((acc, cur) => acc + cur.invoiced, 0);
    const collected = filteredTransactions.reduce((acc, cur) => acc + cur.collected, 0);
    const expense = filteredTransactions.reduce((acc, cur) => acc + cur.expense, 0);
    const pending = Math.max(0, invoiced - collected);
    const profit = collected - expense;

    return { invoiced, collected, expense, pending, profit };
  }, [filteredTransactions]);

  const formatRupiah = (val: number) => {
    return `Rp ${val.toLocaleString("id-ID")}`;
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
                  setActivePreset("custom");
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
                  setActivePreset("custom");
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

        {/* Quick Date Presets Row */}
        <div className="date-presets-row">
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginRight: '4px' }}>Pilihan Cepat:</span>
          <button 
            type="button" 
            className={`date-preset-chip ${activePreset === "last30" ? "active" : ""}`}
            onClick={() => handlePreset("last30")}
          >
            30 Hari Terakhir
          </button>
          <button 
            type="button" 
            className={`date-preset-chip ${activePreset === "thisMonth" ? "active" : ""}`}
            onClick={() => handlePreset("thisMonth")}
          >
            Bulan Ini
          </button>
          <button 
            type="button" 
            className={`date-preset-chip ${activePreset === "thisQuarter" ? "active" : ""}`}
            onClick={() => handlePreset("thisQuarter")}
          >
            Kuartal Ini
          </button>
          <button 
            type="button" 
            className={`date-preset-chip ${activePreset === "thisYear" ? "active" : ""}`}
            onClick={() => handlePreset("thisYear")}
          >
            Tahun Ini (2026)
          </button>
          <button 
            type="button" 
            className={`date-preset-chip ${activePreset === "all" ? "active" : ""}`}
            onClick={() => handlePreset("all")}
          >
            Semua Waktu
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="dash-stats-grid" style={{ marginBottom: '24px' }}>
        <div className="dash-card stat-card">
          <div className="stat-title">Total Ditagih (Invoiced)</div>
          <div className="stat-value" style={{ color: '#2563eb' }}>{formatRupiah(totals.invoiced)}</div>
          <div className="stat-subtitle">{filteredTransactions.length} invoice dalam rentang waktu</div>
        </div>

        <div className="dash-card stat-card">
          <div className="stat-title">Penerimaan Kas (Lunas)</div>
          <div className="stat-value" style={{ color: '#16a34a' }}>{formatRupiah(totals.collected)}</div>
          <div className="stat-subtitle">
            {totals.invoiced > 0 ? `${Math.round((totals.collected / totals.invoiced) * 100)}% dari total tagihan` : "0%"}
          </div>
        </div>

        <div className="dash-card stat-card">
          <div className="stat-title">Piutang / Pending</div>
          <div className="stat-value" style={{ color: '#d97706' }}>{formatRupiah(totals.pending)}</div>
          <div className="stat-subtitle">Menunggu pelunasan klien</div>
        </div>

        <div className="dash-card stat-card">
          <div className="stat-title">Estimasi Laba Bersih</div>
          <div className="stat-value" style={{ color: '#7c3aed' }}>{formatRupiah(totals.profit)}</div>
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

        {filteredTransactions.length > 0 ? (
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
                      {formatRupiah(row.invoiced)}
                    </td>
                    <td style={{ textAlign: 'right', padding: '12px', fontWeight: 600, color: '#16a34a' }}>
                      {formatRupiah(row.collected)}
                    </td>
                    <td style={{ textAlign: 'right', padding: '12px', color: '#dc2626' }}>
                      {formatRupiah(row.expense)}
                    </td>
                    <td style={{ textAlign: 'right', padding: '12px', fontWeight: 700, color: '#7c3aed' }}>
                      {formatRupiah(row.collected - row.expense)}
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
      <div className="screen-hidden">
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
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#2563eb' }}>{formatRupiah(totals.invoiced)}</div>
            </div>
            <div style={{ border: '1px solid #cbd5e1', padding: '10px', borderRadius: '6px' }}>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Total Kas Masuk</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#16a34a' }}>{formatRupiah(totals.collected)}</div>
            </div>
            <div style={{ border: '1px solid #cbd5e1', padding: '10px', borderRadius: '6px' }}>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Piutang / Pending</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#d97706' }}>{formatRupiah(totals.pending)}</div>
            </div>
            <div style={{ border: '1px solid #cbd5e1', padding: '10px', borderRadius: '6px' }}>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Estimasi Laba Bersih</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#7c3aed' }}>{formatRupiah(totals.profit)}</div>
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
                  <td style={{ padding: '8px', textAlign: 'right' }}>{formatRupiah(item.invoiced)}</td>
                  <td style={{ padding: '8px', textAlign: 'right', color: '#16a34a' }}>{formatRupiah(item.collected)}</td>
                  <td style={{ padding: '8px', textAlign: 'right', color: '#dc2626' }}>{formatRupiah(item.expense)}</td>
                  <td style={{ padding: '8px', textAlign: 'right', fontWeight: 700 }}>{formatRupiah(item.collected - item.expense)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
