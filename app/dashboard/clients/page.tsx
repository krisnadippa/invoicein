"use client";

import { useState } from "react";

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [clients, setClients] = useState<any[]>([]);

  const filteredClients = clients.filter(cl => {
    const matchesSearch = (cl.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (cl.company || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (cl.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || (cl.status || "").toUpperCase() === statusFilter.toUpperCase();
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
            Daftar Klien & Pelanggan
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>
            Kelola data kontak, riwayat penagihan, dan total transaksi mitra bisnis Anda.
          </p>
        </div>

        <button 
          type="button"
          style={{
            backgroundColor: '#2563eb',
            color: '#ffffff',
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)'
          }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
          + Tambah Klien Baru
        </button>
      </div>

      <div className="dash-card" style={{ padding: '24px' }}>
        
        {/* Search & Filter Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '10px', flex: 1, minWidth: '260px' }}>
            <input 
              type="text" 
              placeholder="Cari nama klien, perusahaan, atau email..." 
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
              <option value="ACTIVE">Active (Aktif)</option>
              <option value="VIP">VIP (Prioritas)</option>
              <option value="INACTIVE">Inactive (Non-aktif)</option>
            </select>
          </div>
        </div>
        
        {/* Responsive Table */}
        <div className="table-responsive-wrapper">
          <table className="invoice-table" style={{ width: '100%', minWidth: '700px' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '12px' }}>Nama Klien</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Perusahaan</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Kontak & Email</th>
                <th style={{ textAlign: 'center', padding: '12px' }}>Total Invoice</th>
                <th style={{ textAlign: 'right', padding: '12px' }}>Total Transaksi</th>
                <th style={{ textAlign: 'center', padding: '12px' }}>Status</th>
                <th style={{ textAlign: 'center', padding: '12px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <tr key={client.id}>
                    <td style={{ fontWeight: 700, color: 'var(--foreground, #0f172a)', padding: '12px' }}>
                      {client.name}
                    </td>
                    <td style={{ fontWeight: 600, color: '#475569', padding: '12px' }}>
                      {client.company}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontSize: '13px', color: '#0f172a', fontWeight: 500 }}>{client.email}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>{client.phone}</div>
                    </td>
                    <td style={{ textAlign: 'center', color: '#64748b', fontSize: '13px', padding: '12px' }}>
                      {client.invoicesCount} invoice
                    </td>
                    <td style={{ fontWeight: 700, textAlign: 'right', color: '#16a34a', padding: '12px' }}>
                      {formatRupiah(client.totalInvoiced)}
                    </td>
                    <td style={{ textAlign: 'center', padding: '12px' }}>
                      <span className={`status-badge status-${client.status.toLowerCase()}`}>
                        {client.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', padding: '12px' }}>
                      <button 
                        style={{
                          padding: '4px 10px',
                          background: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#334155',
                          cursor: 'pointer'
                        }}
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                    Tidak ada data klien yang sesuai dengan pencarian Anda.
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
