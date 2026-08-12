"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function InvoicesList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [invoices, setInvoices] = useState<any[]>([]);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Custom Confirm Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    type?: "danger" | "primary";
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    onCancel: () => {}
  });

  // Custom Settlement Modal State
  const [settlementModal, setSettlementModal] = useState<{
    isOpen: boolean;
    invoiceId: string;
    settlementDate: string;
    remainingBalance: number;
  }>({
    isOpen: false,
    invoiceId: "",
    settlementDate: "",
    remainingBalance: 0
  });

  const handleTriggerSettlement = (id: string) => {
    const inv = invoices.find(i => i.id === id);
    let remaining = 0;
    if (inv) {
      const totalAmount = inv.amount || 0;
      const rawDp = Number(inv.downPayment) || 0;
      const dpAmount = inv.dpType === "percent" 
        ? (totalAmount * Math.min(100, Math.max(0, rawDp))) / 100 
        : Math.min(totalAmount, Math.max(0, rawDp));
      remaining = Math.max(0, totalAmount - dpAmount);
    }
    setConfirmModal(prev => ({ ...prev, isOpen: false })); // close confirm modal if open
    setSettlementModal({
      isOpen: true,
      invoiceId: id,
      settlementDate: new Date().toISOString().split('T')[0],
      remainingBalance: remaining
    });
  };

  const handleConfirmSettlement = async () => {
    const inv = invoices.find(i => i.id === settlementModal.invoiceId);
    const amount = inv ? (inv.amount || 0) : 0;
    try {
      const res = await fetch(`/api/invoices/${settlementModal.invoiceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Lunas",
          amountPaid: amount,
          balanceDue: 0
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchInvoices();
        showToast(`Invoice ${settlementModal.invoiceId} berhasil dilunasi pada tanggal ${settlementModal.settlementDate}!`);
      } else {
        showToast(data.message || "Gagal melunasi invoice", "error");
      }
    } catch (err) {
      console.error("Settlement error", err);
      showToast("Gagal melunasi invoice", "error");
    }
    setSettlementModal(prev => ({ ...prev, isOpen: false }));
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await fetch("/api/invoices");
      const data = await res.json();
      if (data.success) {
        setInvoices(data.invoices || []);
      }
    } catch (e) {
      console.error("Fetch invoices error", e);
    }
  };

  const handleDeleteInvoice = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Hapus Invoice?",
      message: "Apakah Anda yakin ingin menghapus invoice ini secara permanen?",
      confirmText: "Ya, Hapus",
      cancelText: "Batal",
      type: "danger",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/invoices/${id}`, {
            method: "DELETE"
          });
          const data = await res.json();
          if (data.success) {
            fetchInvoices();
            showToast("Invoice berhasil dihapus!", "info");
          } else {
            showToast(data.message || "Gagal menghapus invoice", "error");
          }
        } catch (err) {
          console.error("Delete invoice error", err);
          showToast("Gagal menghapus invoice", "error");
        }
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      },
      onCancel: () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        fetchInvoices();
        showToast(`Status invoice berhasil diubah menjadi ${newStatus}!`);
      } else {
        showToast(data.message || "Gagal memperbarui status", "error");
      }
    } catch (err) {
      console.error("Update status error", err);
      showToast("Gagal memperbarui status invoice", "error");
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const clientName = inv.client || inv.customer || "";
    const matchesSearch = (inv.id || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                          clientName.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Support comparing English filters with Indonesian statuses
    let mappedFilter = statusFilter;
    if (statusFilter === "PAID") mappedFilter = "LUNAS";
    if (statusFilter === "PENDING") mappedFilter = "MENUNGGU";
    if (statusFilter === "OVERDUE") mappedFilter = "JATUH TEMPO";

    const matchesStatus = statusFilter === "ALL" || (inv.status || "").toUpperCase() === mappedFilter;
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
                      {invoice.invoiceNumber || invoice.id}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--foreground, #0f172a)', padding: '12px' }}>
                      {invoice.clientName || invoice.customer || "-"}
                    </td>
                    <td style={{ color: '#64748b', fontSize: '13px', padding: '12px' }}>
                      {invoice.date}
                    </td>
                    <td style={{ color: '#64748b', fontSize: '13px', padding: '12px' }}>
                      {invoice.due}
                    </td>
                    <td style={{ textAlign: 'right', color: 'var(--foreground, #0f172a)', padding: '12px' }}>
                      <div style={{ fontWeight: 700 }}>{formatRupiah(invoice.amount)}</div>
                      {invoice.status === 'DP' && (
                        <div style={{ fontSize: '11px', color: '#0284c7', marginTop: '2px', lineHeight: 1.3 }}>
                          DP: {formatRupiah(invoice.amountPaid)} <br/>
                          Sisa: {formatRupiah(invoice.balanceDue)}
                        </div>
                      )}
                      {(invoice.status === 'Menunggu' || invoice.status === 'Jatuh Tempo') && (invoice.amountPaid || 0) === 0 && (
                        <div style={{ fontSize: '11px', color: '#dc2626', marginTop: '2px', lineHeight: 1.3 }}>
                          Belum Bayar: {formatRupiah(invoice.balanceDue || invoice.amount)}
                        </div>
                      )}
                      {(invoice.status === 'Menunggu' || invoice.status === 'Jatuh Tempo') && (invoice.amountPaid || 0) > 0 && (
                        <div style={{ fontSize: '11px', color: '#ca8a04', marginTop: '2px', lineHeight: 1.3 }}>
                          Bayar: {formatRupiah(invoice.amountPaid)} <br/>
                          Sisa: {formatRupiah(invoice.balanceDue)}
                        </div>
                      )}
                      {invoice.status === 'Lunas' && (
                        <div style={{ fontSize: '11px', color: '#16a34a', marginTop: '2px', fontWeight: 600 }}>
                          Lunas
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'center', padding: '12px' }}>
                      <select
                        value={invoice.status}
                        onChange={(e) => handleUpdateStatus(invoice.id, e.target.value)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          border: '1px solid #cbd5e1',
                          fontWeight: 600,
                          fontSize: '12px',
                          cursor: 'pointer',
                          background: invoice.status === 'Lunas' ? '#dcfce7' : invoice.status === 'Menunggu' ? '#fef9c3' : invoice.status === 'DP' ? '#e0f2fe' : '#fee2e2',
                          color: invoice.status === 'Lunas' ? '#16a34a' : invoice.status === 'Menunggu' ? '#ca8a04' : invoice.status === 'DP' ? '#0369a1' : '#dc2626'
                        }}
                      >
                        <option value="Lunas">Lunas</option>
                        <option value="DP">DP</option>
                        <option value="Menunggu">Menunggu</option>
                        <option value="Jatuh Tempo">Jatuh Tempo</option>
                      </select>
                    </td>
                    <td style={{ textAlign: 'center', padding: '12px' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        {invoice.status === 'DP' && (
                          <button 
                            onClick={() => handleTriggerSettlement(invoice.id)}
                            style={{
                              padding: '4px 8px',
                              background: '#f0fdf4',
                              border: '1px solid #bbf7d0',
                              fontSize: '12px',
                              fontWeight: 700,
                              color: '#16a34a',
                              cursor: 'pointer'
                            }}
                            title="Konfirmasi Pelunasan Sisa Tagihan"
                          >
                            Pelunasan
                          </button>
                        )}
                        <Link 
                          href={`/dashboard/invoices/create?id=${invoice.id}`}
                          style={{
                            padding: '4px 8px',
                            background: '#f1f5f9',
                            border: '1px solid #cbd5e1',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#334155',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center'
                          }}
                          title="Lihat & Cetak Invoice"
                        >
                          Lihat
                        </Link>
                        <Link 
                          href={`/dashboard/expenses?invoiceId=${invoice.id}`}
                          style={{
                            padding: '4px 8px',
                            background: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#2563eb',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          title="Tambah Pengeluaran"
                        >
                          + Biaya
                        </Link>
                        <button 
                          onClick={() => handleDeleteInvoice(invoice.id)}
                          style={{
                            padding: '4px 8px',
                            background: '#fee2e2',
                            border: '1px solid #fca5a5',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#dc2626',
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
                    Tidak ada invoice yang sesuai dengan pencarian atau filter Anda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

    {/* Floating Premium Toast Notification */}
    {toast && (
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        backgroundColor: toast.type === 'success' ? '#10b981' : toast.type === 'error' ? '#ef4444' : '#2563eb',
        color: '#ffffff',
        padding: '12px 20px',
        borderRadius: '8px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        zIndex: 99999,
        animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        fontWeight: 600,
        fontSize: '13px',
        border: '1px solid rgba(255, 255, 255, 0.15)'
      }}>
        {toast.type === 'success' ? (
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
        ) : toast.type === 'error' ? (
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        ) : (
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        )}
        {toast.message}
        <style>{`
          @keyframes slideIn {
            0% { transform: translateY(30px) scale(0.95); opacity: 0; }
            100% { transform: translateY(0) scale(1); opacity: 1; }
          }
        `}</style>
      </div>
      )}

      {/* Custom Confirmation Modal */}
      {confirmModal.isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 99999,
          padding: '16px',
          animation: 'fadeIn 0.25s ease forwards'
        }}>
          <div className="dash-card" style={{
            width: '100%',
            maxWidth: '400px',
            padding: '28px',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            background: 'var(--card-bg, #ffffff)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            animation: 'zoomIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Decorative Top Bar */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '4px',
              background: confirmModal.type === 'danger' 
                ? 'linear-gradient(to right, #f87171, #ef4444)' 
                : 'linear-gradient(to right, #3b82f6, #2563eb)'
            }}></div>
            
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: confirmModal.type === 'danger' ? '#fef2f2' : '#eff6ff',
                color: confirmModal.type === 'danger' ? '#ef4444' : '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {confirmModal.type === 'danger' ? (
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                ) : (
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                )}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--foreground, #0f172a)', letterSpacing: '-0.3px' }}>{confirmModal.title}</h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: 1.6 }}>{confirmModal.message}</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
              <button 
                type="button" 
                onClick={confirmModal.onCancel}
                style={{
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#475569',
                  padding: '10px 18px',
                  fontSize: '13px',
                  fontWeight: 600,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {confirmModal.cancelText || 'Batal'}
              </button>
              <button 
                type="button" 
                onClick={confirmModal.onConfirm}
                style={{
                  padding: '10px 22px',
                  fontSize: '13px',
                  fontWeight: 700,
                  borderRadius: '8px',
                  backgroundColor: confirmModal.type === 'danger' ? '#ef4444' : '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: confirmModal.type === 'danger' ? '0 4px 12px rgba(239, 68, 68, 0.2)' : '0 4px 12px rgba(37, 99, 235, 0.2)'
                }}
              >
                {confirmModal.confirmText || 'Ya'}
              </button>
            </div>
          </div>
          
          <style>{`
            @keyframes fadeIn {
              0% { opacity: 0; }
              100% { opacity: 1; }
            }
            @keyframes zoomIn {
              0% { transform: scale(0.9); opacity: 0; }
              100% { transform: scale(1); opacity: 1; }
            }
          `}</style>
        </div>
      )}

      {/* Custom Settlement Modal */}
      {settlementModal.isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 99999,
          padding: '16px',
          animation: 'fadeIn 0.25s ease forwards'
        }}>
          <div className="dash-card" style={{
            width: '100%',
            maxWidth: '400px',
            padding: '28px',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            background: 'var(--card-bg, #ffffff)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            animation: 'zoomIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Decorative Top Bar */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'linear-gradient(to right, #10b981, #059669)' }}></div>
            
            <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--foreground, #0f172a)' }}>
              Pelunasan Invoice
            </h3>
            
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
              Silakan pilih tanggal pelunasan untuk invoice <strong>{settlementModal.invoiceId}</strong>. Status invoice akan otomatis berubah menjadi Lunas.
            </p>
            
            <div style={{ padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600, textTransform: 'uppercase' }}>Sisa Tagihan Pelunasan</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#15803d', marginTop: '2px' }}>
                {formatRupiah(settlementModal.remainingBalance)}
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>Tanggal Pelunasan</label>
              <input 
                type="date" 
                value={settlementModal.settlementDate}
                onChange={(e) => setSettlementModal(prev => ({ ...prev, settlementDate: e.target.value }))}
                style={{ width: '100%', padding: '10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button 
                type="button" 
                onClick={() => setSettlementModal(prev => ({ ...prev, isOpen: false }))}
                style={{
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#475569',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Batal
              </button>
              <button 
                type="button" 
                onClick={handleConfirmSettlement}
                style={{
                  padding: '8px 20px',
                  fontSize: '13px',
                  fontWeight: 700,
                  borderRadius: '6px',
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
                }}
              >
                Konfirmasi Pelunasan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
