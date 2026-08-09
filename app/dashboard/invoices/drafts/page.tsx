"use client";

import Link from "next/link";
import { useState } from "react";

export default function InvoiceDraftsPage() {
  const [drafts, setDrafts] = useState([
    { id: "DFT-2026-001", client: "PT Samudera Harmoni", date: "07 Agu 2026", itemsCount: 3, amount: 8500000, status: "Draft" },
    { id: "DFT-2026-002", client: "CV Nusa Indah Tour", date: "05 Agu 2026", itemsCount: 2, amount: 15400000, status: "Draft" },
    { id: "DFT-2026-003", client: "PT Sentosa Mandiri", date: "01 Agu 2026", itemsCount: 5, amount: 32000000, status: "Draft" },
  ]);

  const handleDelete = (id: string) => {
    setDrafts(drafts.filter(d => d.id !== id));
  };

  const formatRupiah = (val: number) => {
    return `Rp ${val.toLocaleString("id-ID")}`;
  };

  return (
    <div className="dashboard-content-inner">
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: 'var(--foreground, #0f172a)' }}>
            Draf Invoice
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>
            Daftar invoice yang belum diterbitkan atau masih dalam proses penyusunan.
          </p>
        </div>

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
          Buat Draf Baru
        </Link>
      </div>

      <div className="dash-card" style={{ padding: '24px' }}>
        <div className="table-responsive-wrapper">
          <table className="invoice-table" style={{ width: '100%', minWidth: '700px' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '12px' }}>Kode Draf</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Calon Klien</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Terakhir Diubah</th>
                <th style={{ textAlign: 'center', padding: '12px' }}>Jumlah Item</th>
                <th style={{ textAlign: 'right', padding: '12px' }}>Estimasi Total</th>
                <th style={{ textAlign: 'center', padding: '12px' }}>Status</th>
                <th style={{ textAlign: 'center', padding: '12px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {drafts.length > 0 ? (
                drafts.map((draft) => (
                  <tr key={draft.id}>
                    <td style={{ fontWeight: 700, color: '#475569', padding: '12px' }}>
                      {draft.id}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--foreground, #0f172a)', padding: '12px' }}>
                      {draft.client}
                    </td>
                    <td style={{ color: '#64748b', fontSize: '13px', padding: '12px' }}>
                      {draft.date}
                    </td>
                    <td style={{ textAlign: 'center', color: '#64748b', fontSize: '13px', padding: '12px' }}>
                      {draft.itemsCount} item
                    </td>
                    <td style={{ fontWeight: 700, textAlign: 'right', color: 'var(--foreground, #0f172a)', padding: '12px' }}>
                      {formatRupiah(draft.amount)}
                    </td>
                    <td style={{ textAlign: 'center', padding: '12px' }}>
                      <span className="status-badge status-draft">
                        {draft.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', padding: '12px' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <Link 
                          href="/dashboard/invoices/create"
                          style={{
                            padding: '5px 12px',
                            background: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            color: '#1d4ed8',
                            fontSize: '12px',
                            fontWeight: 600,
                            textDecoration: 'none'
                          }}
                        >
                          Lanjutkan Edit
                        </Link>
                        <button 
                          onClick={() => handleDelete(draft.id)}
                          style={{
                            padding: '5px 10px',
                            background: '#fff',
                            border: '1px solid #fecaca',
                            color: '#dc2626',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                    Belum ada draf invoice yang tersimpan.
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
