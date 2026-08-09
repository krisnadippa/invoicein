import Link from "next/link";

export default function DashboardOverview() {
  const recentInvoices = [
    { id: "INV-2026-001", customer: "PT Samudera Harmoni", total: "Rp 12.500.000", status: "Lunas" },
    { id: "INV-2026-002", customer: "CV Nusa Indah Tour", total: "Rp 8.000.000", status: "Menunggu" },
    { id: "INV-2026-003", customer: "PT Sentosa Mandiri", total: "Rp 15.000.000", status: "Jatuh Tempo" },
    { id: "INV-2026-004", customer: "Global Tech Solusi", total: "Rp 8.500.000", status: "Lunas" },
  ];

  const topTours = [
    { name: "Paket Wisata Bali 4D3N", price: "Rp 18.500.000" },
    { name: "Paket Tour Jogja 3D2N", price: "Rp 12.000.000" },
    { name: "Paket Bandung City Tour", price: "Rp 7.800.000" },
  ];

  return (
    <div className="dashboard-content-inner">
      <div className="page-header">
        <div>
          <h1>Dashboard Keuangan</h1>
          <p>Selamat datang kembali di pusat pengelolaan invoice dan bisnis Anda</p>
        </div>
        <div className="date">
          Minggu, 10 Agustus 2026
        </div>
      </div>

      {/* 6 Stat Cards */}
      <div className="dash-stats-grid">
        <div className="dash-card stat-card">
          <div className="stat-card-top">
            <div className="stat-icon blue">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="stat-trend up">
              <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              12%
            </div>
          </div>
          <div className="stat-title">Total Invoice Diterbitkan</div>
          <div className="stat-value">75</div>
          <div className="stat-subtitle">vs bulan lalu</div>
        </div>

        <div className="dash-card stat-card">
          <div className="stat-card-top">
            <div className="stat-icon green">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="stat-trend up">
              <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              18%
            </div>
          </div>
          <div className="stat-title">Total Pendapatan</div>
          <div className="stat-value">Rp 78.325.000</div>
          <div className="stat-subtitle">vs bulan lalu</div>
        </div>

        <div className="dash-card stat-card">
          <div className="stat-card-top">
            <div className="stat-icon red">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
            </div>
            <div className="stat-trend down">
              <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
              5%
            </div>
          </div>
          <div className="stat-title">Total Biaya Operasional</div>
          <div className="stat-value">Rp 10.599.767</div>
          <div className="stat-subtitle">vs bulan lalu</div>
        </div>

        <div className="dash-card stat-card">
          <div className="stat-card-top">
            <div className="stat-icon purple">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <div className="stat-trend up">
              <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              24%
            </div>
          </div>
          <div className="stat-title">Laba Bersih</div>
          <div className="stat-value">Rp 67.725.233</div>
          <div className="stat-subtitle">vs bulan lalu</div>
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
          <div className="stat-value">43</div>
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
          <div className="stat-value">32</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        <div className="dash-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">Pendapatan vs Pengeluaran</div>
              <div className="chart-subtitle">Perbandingan arus kas bulanan tahun 2026</div>
            </div>
            <div className="chart-legend">
              <div className="legend-item"><div className="legend-dot blue"></div> Pendapatan</div>
              <div className="legend-item"><div className="legend-dot red"></div> Pengeluaran</div>
            </div>
          </div>
          
          <div className="mock-bar-chart">
            <div className="bar-group"><div className="bar-col blue" style={{ height: '40px' }}></div><div className="bar-col red" style={{ height: '20px' }}></div></div>
            <div className="bar-group"><div className="bar-col blue" style={{ height: '50px' }}></div><div className="bar-col red" style={{ height: '25px' }}></div></div>
            <div className="bar-group"><div className="bar-col blue" style={{ height: '60px' }}></div><div className="bar-col red" style={{ height: '30px' }}></div></div>
            <div className="bar-group"><div className="bar-col blue" style={{ height: '55px' }}></div><div className="bar-col red" style={{ height: '35px' }}></div></div>
            <div className="bar-group"><div className="bar-col blue" style={{ height: '45px' }}></div><div className="bar-col red" style={{ height: '25px' }}></div></div>
            <div className="bar-group"><div className="bar-col blue" style={{ height: '140px' }}></div><div className="bar-col red" style={{ height: '20px' }}></div></div>
            <div className="bar-group"><div className="bar-col blue" style={{ height: '180px' }}></div><div className="bar-col red" style={{ height: '30px' }}></div></div>
            <div className="bar-group"><div className="bar-col blue" style={{ height: '5px' }}></div><div className="bar-col red" style={{ height: '0px' }}></div></div>
            <div className="bar-group"><div className="bar-col blue" style={{ height: '0px' }}></div><div className="bar-col red" style={{ height: '0px' }}></div></div>
            <div className="bar-group"><div className="bar-col blue" style={{ height: '0px' }}></div><div className="bar-col red" style={{ height: '0px' }}></div></div>
            <div className="bar-group"><div className="bar-col blue" style={{ height: '0px' }}></div><div className="bar-col red" style={{ height: '0px' }}></div></div>
            <div className="bar-group"><div className="bar-col blue" style={{ height: '0px' }}></div><div className="bar-col red" style={{ height: '0px' }}></div></div>
          </div>
          <div className="x-axis">
            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>Mei</span><span>Jun</span><span>Jul</span><span>Agu</span><span>Sep</span><span>Okt</span><span>Nov</span><span>Des</span>
          </div>
        </div>

        <div className="dash-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">Target Omzet Bulanan</div>
              <div className="chart-subtitle">Target omzet bulan Agustus 2026</div>
            </div>
            <button className="btn-set-target">Atur Target</button>
          </div>
          
          <div className="semi-circle-container">
            <div className="semi-circle">
              <div className="semi-circle-value">0%</div>
            </div>
            <div className="target-label">Tercapai <b>Rp 1.320.000</b> dari target Rp 0</div>
            
            <div className="target-stats-row">
              <div className="target-stat-item">
                <span>Target</span>
                <strong className="black">Rp 0</strong>
              </div>
              <div className="target-stat-item">
                <span>Omzet Masuk</span>
                <strong className="green">Rp 1.320.000</strong>
              </div>
              <div className="target-stat-item">
                <span>Laba Bersih</span>
                <strong className="blue">Rp 1.320.000</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="bottom-grid">
        <div className="dash-card">
          <div className="section-header">
            <h2>Invoice Terbaru</h2>
            <Link href="/dashboard/invoices" className="link-primary">
              Lihat semua
            </Link>
          </div>
          
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
              {recentInvoices.map((invoice, i) => (
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
        </div>

        <div className="dash-card">
          <div className="section-header">
            <h2>Layanan & Paket Terlaris</h2>
            <Link href="/dashboard/invoices" className="link-primary">
              Lihat invoice
            </Link>
          </div>
          
          <div className="top-list">
            {topTours.map((tour, i) => (
              <div key={i} className="top-list-item">
                <div className="top-list-number">{i + 1}</div>
                <div className="top-list-content">
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="top-list-title">{tour.name}</span>
                    <span className="top-list-subtitle">Invoice Resmi</span>
                  </div>
                  <span className="top-list-value">{tour.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
