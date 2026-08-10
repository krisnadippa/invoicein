"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function InvoicesList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("invoicein_saved_invoices");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setInvoices(parsed);
        }
      }
    } catch {
      // Ignore
    }
  }, []);

  const filteredInvoices = invoices.filter(inv => {
    const clientName = inv.client || inv.customer || "";
    const matchesSearch = (inv.id || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                          clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || (inv.status || "").toUpperCase() === statusFilter.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  const formatRupiah = (val: number) => {
    return `Rp ${val.toLocaleString("id-ID")}`;
  };

  return (
    <div className="dashboard-content-inner">
      
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: 'var(--foreground, #0f172a)' }}>
            Semua Invoice
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>
            Kelola, lacak status pembayaran, dan unduh tagihan transaksi resmi Anda.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link 
            href="/dashboard/invoices/create"
            style={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
              padding: '10px 18px',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)'
            }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            Buat Invoice Baru
          </Link>
        </div>
      </div>

      <div className="dash-card" style={{ padding: '24px' }}>
        
        {/* Search & Filter Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '10px', flex: 1, minWidth: '260px' }}>
            <input 
              type="text" 
              placeholder="Cari nomor invoice atau nama klien..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ maxWidth: '380px', padding: '8px 12px', fontSize: '13px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select"
              style={{ padding: '8px 14px', fontSize: '13px', minWidth: '150px' }}
            >
              <option value="ALL">Semua Status</option>
              <option value="PAID">Paid (Lunas)</option>
              <option value="PENDING">Pending (Menunggu)</option>
              <option value="OVERDUE">Overdue (Terlambat)</option>
              <option value="DRAFT">Draft (Draf)</option>
            </select>
          </div>
        </div>
        
        {/* Responsive Table */}
        <div className="table-responsive-wrapper">
          <table className="invoice-table" style={{ width: '100%', minWidth: '700px' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '12px' }}>No. Invoice</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Klien / Perusahaan</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Tgl Terbit</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Jatuh Tempo</th>
                <th style={{ textAlign: 'right', padding: '12px' }}>Total Nominal</th>
                <th style={{ textAlign: 'center', padding: '12px' }}>Status</th>
                <th style={{ textAlign: 'center', padding: '12px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td style={{ fontWeight: 700, color: '#2563eb', padding: '12px' }}>
                      {invoice.id}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--foreground, #0f172a)', padding: '12px' }}>
                      {invoice.client}
                    </td>
                    <td style={{ color: '#64748b', fontSize: '13px', padding: '12px' }}>
                      {invoice.date}
                    </td>
                    <td style={{ color: '#64748b', fontSize: '13px', padding: '12px' }}>
                      {invoice.due}
                    </td>
                    <td style={{ fontWeight: 700, textAlign: 'right', color: 'var(--foreground, #0f172a)', padding: '12px' }}>
                      {formatRupiah(invoice.amount)}
                    </td>
                    <td style={{ textAlign: 'center', padding: '12px' }}>
                      <span className={`status-badge status-${invoice.status.toLowerCase()}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', padding: '12px' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <Link 
                          href="/dashboard/invoices/create"
                          style={{
                            padding: '4px 10px',
                            background: '#f1f5f9',
                            border: '1px solid #cbd5e1',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#334155',
                            textDecoration: 'none'
                          }}
                        >
                          Lihat
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                    Tidak ada invoice yang sesuai dengan pencarian atau filter Anda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
