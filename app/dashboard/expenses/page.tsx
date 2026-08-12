"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  invoiceId: string;
}

interface Invoice {
  id: string;
  client: string;
  amount: number;
  date: string;
  due: string;
  status: string;
}

function ExpensesContent() {
  const searchParams = useSearchParams();
  const queryInvoiceId = searchParams.get("invoiceId") || "";

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>("");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  
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
  
  // CRUD Item states
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);

  // Modal control
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setDate(today);

    fetchInvoices();
    fetchExpenses();
  }, []);

  useEffect(() => {
    if (queryInvoiceId && invoices.length > 0) {
      setSelectedInvoiceId(queryInvoiceId);
    }
  }, [queryInvoiceId, invoices]);

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

  const fetchExpenses = async () => {
    try {
      const res = await fetch("/api/expenses");
      const data = await res.json();
      if (data.success) {
        setExpenses(data.expenses || []);
      }
    } catch (e) {
      console.error("Fetch expenses error", e);
    }
  };

  const selectedInvoice = invoices.find(inv => inv.id === selectedInvoiceId);

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount || !selectedInvoiceId) return;

    const numAmount = Number(amount.replace(/[^0-9]/g, "")) || 0;

    try {
      if (editingExpenseId) {
        // Edit mode
        const res = await fetch(`/api/expenses/${editingExpenseId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description,
            amount: numAmount,
            date: date || new Date().toISOString().split('T')[0],
            invoiceId: selectedInvoiceId
          })
        });
        const data = await res.json();
        if (data.success) {
          showToast("Pengeluaran berhasil diperbarui!");
          fetchExpenses();
        } else {
          showToast(data.message || "Gagal memperbarui pengeluaran", "error");
        }
        setEditingExpenseId(null);
      } else {
        // Create mode
        const res = await fetch("/api/expenses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description,
            amount: numAmount,
            date: date || new Date().toISOString().split('T')[0],
            invoiceId: selectedInvoiceId
          })
        });
        const data = await res.json();
        if (data.success) {
          showToast("Pengeluaran berhasil disimpan!");
          fetchExpenses();
        } else {
          showToast(data.message || "Gagal menyimpan pengeluaran", "error");
        }
      }
    } catch (err) {
      console.error("Save expense error", err);
      showToast("Terjadi kesalahan saat menyimpan pengeluaran", "error");
    }

    // Reset fields
    setDescription("");
    setAmount("");
    setIsModalOpen(false);
  };

  const handleEditClick = (expense: Expense) => {
    setEditingExpenseId(expense.id);
    setDescription(expense.description);
    setAmount(expense.amount.toString());
    setDate(expense.date);
    setIsModalOpen(true);
  };

  const handleDeleteExpense = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Hapus Pengeluaran?",
      message: "Apakah Anda yakin ingin menghapus rincian pengeluaran operasional ini?",
      confirmText: "Ya, Hapus",
      cancelText: "Batal",
      type: "danger",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/expenses/${id}`, {
            method: "DELETE"
          });
          const data = await res.json();
          if (data.success) {
            fetchExpenses();
            showToast("Pengeluaran berhasil dihapus!", "info");
          } else {
            showToast(data.message || "Gagal menghapus pengeluaran", "error");
          }
        } catch (err) {
          console.error("Delete expense error", err);
          showToast("Gagal menghapus pengeluaran", "error");
        }
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      },
      onCancel: () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const formatRupiah = (val: number) => {
    return `Rp ${val.toLocaleString("id-ID")}`;
  };

  // Filter expenses belonging to the selected invoice
  const currentInvoiceExpenses = expenses.filter(exp => exp.invoiceId === selectedInvoiceId);

  const totalIncome = selectedInvoice ? (selectedInvoice.amount || 0) : 0;
  const totalExpenses = currentInvoiceExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const netProfit = totalIncome - totalExpenses;

  return (
    <div className="dashboard-content-inner">
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: 'var(--foreground, #0f172a)' }}>
            Pengeluaran per Invoice (Expenses)
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>
            Kelola modal, operasional, dan pengeluaran barang khusus untuk masing-masing invoice.
          </p>
        </div>

        {selectedInvoiceId && (
          <button 
            type="button"
            onClick={() => {
              setEditingExpenseId(null);
              setDescription("");
              setAmount("");
              setIsModalOpen(true);
            }}
            style={{
              backgroundColor: '#ef4444',
              color: '#ffffff',
              padding: '10px 18px',
              fontSize: '13px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.25)'
            }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            Tambah Item Pengeluaran
          </button>
        )}
      </div>

      {/* Invoice Selector Row */}
      <div className="dash-card" style={{ padding: '20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Pilih Invoice Tagihan</label>
          <select 
            value={selectedInvoiceId}
            onChange={(e) => setSelectedInvoiceId(e.target.value)}
            className="form-select"
            style={{ minWidth: '280px', padding: '10px', fontSize: '14px', borderRadius: '6px' }}
          >
            <option value="">-- Pilih Nomor Invoice --</option>
            {invoices.map(inv => (
              <option key={inv.id} value={inv.id}>{inv.id} - {inv.client} ({formatRupiah(inv.amount)})</option>
            ))}
          </select>
        </div>

        {selectedInvoice && (
          <div style={{ display: 'flex', gap: '24px', marginLeft: 'auto', flexWrap: 'wrap', background: '#f8fafc', padding: '12px 20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>KLIEN</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{selectedInvoice.client}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>TGL TERBIT</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{selectedInvoice.date}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>STATUS</div>
              <span className={`status-badge status-${selectedInvoice.status.toLowerCase()}`} style={{ display: 'inline-block', marginTop: '2px' }}>
                {selectedInvoice.status}
              </span>
            </div>
          </div>
        )}
      </div>

      {selectedInvoiceId ? (
        <>
          {/* Summary Stats Cards */}
          <div className="dash-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            
            <div className="dash-card stat-card" style={{ padding: '20px' }}>
              <div className="stat-title" style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Pendapatan Invoice (Income)</div>
              <div className="stat-value" style={{ fontSize: '22px', fontWeight: 800, color: '#16a34a', marginTop: '6px' }}>{formatRupiah(totalIncome)}</div>
              <div className="stat-subtitle" style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Nilai Tagihan Terbit</div>
            </div>

            <div className="dash-card stat-card" style={{ padding: '20px' }}>
              <div className="stat-title" style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Total Pengeluaran Invoice</div>
              <div className="stat-value" style={{ fontSize: '22px', fontWeight: 800, color: '#dc2626', marginTop: '6px' }}>{formatRupiah(totalExpenses)}</div>
              <div className="stat-subtitle" style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Total Biaya Operasional</div>
            </div>

            <div className="dash-card stat-card" style={{ padding: '20px', borderLeft: '4px solid #2563eb' }}>
              <div className="stat-title" style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Hasil Bersih (Net Profit)</div>
              <div className="stat-value" style={{ fontSize: '22px', fontWeight: 800, color: '#2563eb', marginTop: '6px' }}>{formatRupiah(netProfit)}</div>
              <div className="stat-subtitle" style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Bersih setelah Pengeluaran</div>
            </div>

          </div>

          {/* Expenses Table */}
          <div className="dash-card" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: 'var(--foreground)' }}>
              Rincian Pengeluaran untuk Invoice {selectedInvoiceId}
            </h2>
            <div className="table-responsive-wrapper">
              <table className="invoice-table" style={{ width: '100%', minWidth: '700px' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '12px' }}>Tanggal</th>
                    <th style={{ textAlign: 'left', padding: '12px' }}>Deskripsi Barang / Jasa</th>
                    <th style={{ textAlign: 'right', padding: '12px' }}>Nominal Pengeluaran</th>
                    <th style={{ textAlign: 'center', padding: '12px' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {currentInvoiceExpenses.length > 0 ? (
                    currentInvoiceExpenses.map((expense) => (
                      <tr key={expense.id}>
                        <td style={{ color: '#64748b', fontSize: '13px', padding: '12px' }}>{expense.date}</td>
                        <td style={{ fontWeight: 600, color: 'var(--foreground, #0f172a)', padding: '12px' }}>{expense.description}</td>
                        <td style={{ fontWeight: 700, textAlign: 'right', color: '#dc2626', padding: '12px' }}>
                          {formatRupiah(expense.amount)}
                        </td>
                        <td style={{ textAlign: 'center', padding: '12px' }}>
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            <button 
                              type="button"
                              onClick={() => handleEditClick(expense)}
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
                              Edit
                            </button>
                            <button 
                              type="button"
                              onClick={() => handleDeleteExpense(expense.id)}
                              style={{
                                padding: '4px 10px',
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
                      <td colSpan={4} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                        Belum ada item pengeluaran dicatat untuk invoice ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '48px 24px', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px' }}>
          <p style={{ margin: 0, color: '#64748b', fontWeight: 600 }}>Pilih salah satu invoice di atas untuk mengelola detail pengeluaran item.</p>
        </div>
      )}

      {/* Modal Add/Edit Expense */}
      {isModalOpen && (
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
          <div className="dash-card" style={{ width: '100%', maxWidth: '450px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--card-bg, #ffffff)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--foreground)' }}>
                {editingExpenseId ? "Edit Item Pengeluaran" : "Catat Pengeluaran Baru"}
              </h3>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveExpense} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Keterangan Biaya / Barang *</label>
                <input 
                  type="text" 
                  required
                  className="form-input" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Contoh: Beli domain website / Sewa Hotel"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nominal Biaya (Rp) *</label>
                <input 
                  type="text" 
                  required
                  className="form-input" 
                  value={amount} 
                  onChange={(e) => {
                    const clean = e.target.value.replace(/[^0-9]/g, "");
                    setAmount(clean ? Number(clean).toLocaleString("id-ID") : "");
                  }} 
                  placeholder="200.000"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tanggal</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="btn-pill-white"
                  style={{ border: '1px solid #cbd5e1', padding: '8px 16px', fontSize: '13px', borderRadius: '4px' }}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="btn-pill-green"
                  style={{ padding: '8px 20px', fontSize: '13px', borderRadius: '4px', backgroundColor: '#ef4444', color: '#ffffff' }}
                >
                  {editingExpenseId ? "Perbarui Biaya" : "Simpan Biaya"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

    </div>
  );
}

export default function ExpensesPage() {
  return (
    <Suspense fallback={<div className="dashboard-content-inner">Memuat Pengeluaran...</div>}>
      <ExpensesContent />
    </Suspense>
  );
}
