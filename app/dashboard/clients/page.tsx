"use client";

import { useState, useEffect } from "react";

interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  status: "Active" | "VIP" | "Inactive";
  invoicesCount: number;
  totalInvoiced: number;
}

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [clients, setClients] = useState<Client[]>([]);

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

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [newClientName, setNewClientName] = useState("");
  const [newClientCompany, setNewClientCompany] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientAddress, setNewClientAddress] = useState("");
  const [newClientStatus, setNewClientStatus] = useState<"Active" | "VIP" | "Inactive">("Active");

  // Load clients from LocalStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("invoicein_saved_clients");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setClients(parsed);
          return;
        }
      }
      
      // Default initial mock clients if empty
      const initialClients: Client[] = [
        {
          id: "c-1",
          name: "Budi Santoso",
          company: "PT Maju Bersama",
          email: "budi@majubersama.com",
          phone: "081234567890",
          address: "Jl. Sudirman No. 12, Jakarta",
          status: "VIP",
          invoicesCount: 0,
          totalInvoiced: 0
        },
        {
          id: "c-2",
          name: "Siti Rahma",
          company: "CV Digital Karya",
          email: "siti@digitalkarya.com",
          phone: "089876543210",
          address: "Jl. Gatot Subroto No. 45, Bandung",
          status: "Active",
          invoicesCount: 0,
          totalInvoiced: 0
        }
      ];
      localStorage.setItem("invoicein_saved_clients", JSON.stringify(initialClients));
      setClients(initialClients);
    } catch {
      // Ignore
    }
  }, []);

  // Update clients in localStorage whenever state changes
  const saveClientsToStorage = (updatedList: Client[]) => {
    setClients(updatedList);
    localStorage.setItem("invoicein_saved_clients", JSON.stringify(updatedList));
  };

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    let updated: Client[];

    if (editingClientId) {
      // Edit mode
      updated = clients.map(c => {
        if (c.id === editingClientId) {
          return {
            ...c,
            name: newClientName,
            company: newClientCompany || "-",
            email: newClientEmail || "-",
            phone: newClientPhone || "-",
            address: newClientAddress || "-",
            status: newClientStatus
          };
        }
        return c;
      });
      showToast("Berhasil memperbarui data klien!");
      setEditingClientId(null);
    } else {
      // Create mode
      const newClient: Client = {
        id: `c-${Math.random().toString(36).substring(2, 9)}`,
        name: newClientName,
        company: newClientCompany || "-",
        email: newClientEmail || "-",
        phone: newClientPhone || "-",
        address: newClientAddress || "-",
        status: newClientStatus,
        invoicesCount: 0,
        totalInvoiced: 0
      };
      updated = [newClient, ...clients];
      showToast("Berhasil menambahkan klien baru!");
    }

    saveClientsToStorage(updated);

    // Reset Form
    setNewClientName("");
    setNewClientCompany("");
    setNewClientEmail("");
    setNewClientPhone("");
    setNewClientAddress("");
    setNewClientStatus("Active");
    setIsModalOpen(false);
  };

  const handleEditClient = (client: Client) => {
    setEditingClientId(client.id);
    setNewClientName(client.name);
    setNewClientCompany(client.company === "-" ? "" : client.company);
    setNewClientEmail(client.email === "-" ? "" : client.email);
    setNewClientPhone(client.phone === "-" ? "" : client.phone);
    setNewClientAddress(client.address === "-" ? "" : client.address);
    setNewClientStatus(client.status);
    setIsModalOpen(true);
  };

  const handleOpenAddModal = () => {
    setEditingClientId(null);
    setNewClientName("");
    setNewClientCompany("");
    setNewClientEmail("");
    setNewClientPhone("");
    setNewClientAddress("");
    setNewClientStatus("Active");
    setIsModalOpen(true);
  };

  const handleDeleteClient = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Hapus Klien?",
      message: "Apakah Anda yakin ingin menghapus klien ini? Semua data tagihan terkait klien ini akan tetap disimpan secara terpisah.",
      confirmText: "Ya, Hapus",
      cancelText: "Batal",
      type: "danger",
      onConfirm: () => {
        const updated = clients.filter(c => c.id !== id);
        saveClientsToStorage(updated);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        showToast("Klien berhasil dihapus!", "info");
      },
      onCancel: () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

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
          onClick={handleOpenAddModal}
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
                    <td style={{ textAlign: 'center', padding: '12px' }}>
                      <span className={`status-badge status-${client.status.toLowerCase()}`}>
                        {client.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', padding: '12px' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button 
                          type="button"
                          onClick={() => handleEditClient(client)}
                          style={{
                            padding: '4px 10px',
                            background: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#2563eb',
                            cursor: 'pointer'
                          }}
                        >
                          Edit
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleDeleteClient(client.id)}
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
                  <td colSpan={5} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                    Tidak ada data klien yang sesuai dengan pencarian Anda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Modal Tambah Klien Baru */}
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
          <div className="dash-card" style={{ width: '100%', maxWidth: '500px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--card-bg, #ffffff)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--foreground)' }}>
                {editingClientId ? "Edit Informasi Klien" : "Tambah Klien Baru"}
              </h3>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddClient} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Nama Lengkap Klien *</label>
                <input 
                  type="text" 
                  required
                  className="form-input" 
                  value={newClientName} 
                  onChange={(e) => setNewClientName(e.target.value)} 
                  placeholder="Contoh: Budi Santoso"
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Nama Perusahaan</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={newClientCompany} 
                    onChange={(e) => setNewClientCompany(e.target.value)} 
                    placeholder="PT Maju Bersama"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Status Klien</label>
                  <select 
                    className="form-select"
                    value={newClientStatus}
                    onChange={(e: any) => setNewClientStatus(e.target.value)}
                  >
                    <option value="Active">Active</option>
                    <option value="VIP">VIP</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    value={newClientEmail} 
                    onChange={(e) => setNewClientEmail(e.target.value)} 
                    placeholder="klien@email.com"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Telepon</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={newClientPhone} 
                    onChange={(e) => setNewClientPhone(e.target.value)} 
                    placeholder="0812xxxxxx"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Alamat Klien</label>
                <textarea 
                  className="form-textarea" 
                  rows={3}
                  value={newClientAddress} 
                  onChange={(e) => setNewClientAddress(e.target.value)} 
                  placeholder="Alamat kantor / tempat tinggal..."
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
                  style={{ padding: '8px 20px', fontSize: '13px', borderRadius: '4px', backgroundColor: '#2563eb', color: '#ffffff' }}
                >
                  {editingClientId ? "Perbarui Klien" : "Simpan Klien"}
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
