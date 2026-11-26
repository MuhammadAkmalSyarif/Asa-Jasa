import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, BookOpen, FileText, FileSpreadsheet, 
  CreditCard, Briefcase, DollarSign, Plus, Edit, Trash, X, Search, 
  Menu, Printer, CheckCircle, Clock, AlertTriangle, ArrowRight, 
  FileCheck, Download, RefreshCw, Building2, Phone, Mail,
  ExternalLink, Sparkles
} from 'lucide-react';
import { 
  formatIDR, formatDate, generateNumber, terbilang, 
  loadInitialData, saveToStorage, exportAllData, resetAllData 
} from './utils/storage';
import { 
  initialClients, initialServices, initialQuotations, 
  initialInvoices, initialPayments, initialProjects 
} from './utils/mockData';
import { supabase } from './supabaseClient';

// --- MAIN APPLICATION COMPONENT (TEMA PROFESIONAL PUTIH / LIGHT CLEAN) ---
export default function AsaJasaApp() {
  const [view, setView] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Data States loaded from LocalStorage with defaults
  const [clients, setClients] = useState(() => loadInitialData('clients', initialClients));
  const [services, setServices] = useState(() => loadInitialData('services', initialServices));
  const [quotations, setQuotations] = useState(() => loadInitialData('quotations', initialQuotations));
  const [invoices, setInvoices] = useState(() => loadInitialData('invoices', initialInvoices));
  const [payments, setPayments] = useState(() => loadInitialData('payments', initialPayments));
  const [projects, setProjects] = useState(() => loadInitialData('projects', initialProjects));

  // Sync to localStorage
  useEffect(() => { saveToStorage('clients', clients); }, [clients]);
  useEffect(() => { saveToStorage('services', services); }, [services]);
  useEffect(() => { saveToStorage('quotations', quotations); }, [quotations]);
  useEffect(() => { saveToStorage('invoices', invoices); }, [invoices]);
  useEffect(() => { saveToStorage('payments', payments); }, [payments]);
  useEffect(() => { saveToStorage('projects', projects); }, [projects]);

  // Sync to Supabase Cloud Database
  const [cloudSynced, setCloudSynced] = useState(false);
  useEffect(() => {
    if (!supabase) return;

    const syncWithSupabase = async () => {
      try {
        const collections = [
          { name: 'clients', setter: setClients, initial: initialClients },
          { name: 'services', setter: setServices, initial: initialServices },
          { name: 'quotations', setter: setQuotations, initial: initialQuotations },
          { name: 'invoices', setter: setInvoices, initial: initialInvoices },
          { name: 'payments', setter: setPayments, initial: initialPayments },
          { name: 'projects', setter: setProjects, initial: initialProjects }
        ];

        let anyDataFound = false;
        let hasError = false;
        for (const col of collections) {
          const { data, error } = await supabase.from(col.name).select('*');
          if (error) {
            console.warn(`Supabase error on ${col.name}:`, error.message);
            hasError = true;
            continue;
          }
          if (data) {
            if (data.length > 0) {
              col.setter(data);
              anyDataFound = true;
            } else if (col.initial && col.initial.length > 0) {
              await supabase.from(col.name).insert(col.initial);
            }
          }
        }
        if (!hasError) {
          setCloudSynced(true);
        }
      } catch (err) {
        console.warn('Supabase initial fetch fallback to local:', err);
      }
    };

    syncWithSupabase();
  }, []);

  // Print State: { type: 'quotation' | 'invoice' | 'receipt', data: {} }
  const [printData, setPrintData] = useState(null);

  // Notification Toast State
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };


  // Generic DB Action Dispatcher for Local State
  const dbAction = (collectionName, action, id = null, data = {}) => {
    const setters = {
      clients: setClients,
      services: setServices,
      quotations: setQuotations,
      invoices: setInvoices,
      payments: setPayments,
      projects: setProjects
    };

    const setter = setters[collectionName];
    if (!setter) return null;

    if (action === 'add') {
      const newId = `${collectionName.slice(0, 3)}-${Date.now()}`;
      const newRecord = { ...data, id: newId, createdAt: Date.now() };
      setter(prev => [newRecord, ...prev]);
      if (supabase) {
        supabase.from(collectionName).insert(newRecord).then(({ error }) => {
          if (error) console.error(`Error inserting ${collectionName} into Supabase:`, error);
        });
      }
      return newRecord;
    }

    if (action === 'update') {
      setter(prev => prev.map(item => item.id === id ? { ...item, ...data, updatedAt: Date.now() } : item));
      if (supabase) {
        supabase.from(collectionName).update(data).eq('id', id).then(({ error }) => {
          if (error) console.error(`Error updating ${collectionName} in Supabase:`, error);
        });
      }
      return { id, ...data };
    }

    if (action === 'delete') {
      setter(prev => prev.filter(item => item.id !== id));
      if (supabase) {
        supabase.from(collectionName).delete().eq('id', id).then(({ error }) => {
          if (error) console.error(`Error deleting ${collectionName} from Supabase:`, error);
        });
      }
      return { id };
    }
  };

  const handleResetData = () => {
    if (window.confirm('Apakah Anda yakin ingin mengatur ulang data ke contoh default ASA JASA?')) {
      const reset = resetAllData();
      setClients(reset.clients);
      setServices(reset.services);
      setQuotations(reset.quotations);
      setInvoices(reset.invoices);
      setPayments(reset.payments);
      setProjects(reset.projects);
      showToast('Data berhasil diatur ulang ke sampel default!');
    }
  };

  // --- PRINT LAYOUT ---
  if (printData) {
    return <PrintTemplate data={printData} onClose={() => setPrintData(null)} clients={clients} invoices={invoices} />;
  }


  // --- MAIN LAYOUT DENGAN TEMA PROFESIONAL PUTIH ---
  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      {/* TOAST NOTIFICATION DENGAN TEMA PUTIH & AKSEN STATUS */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-5 py-3.5 rounded-2xl shadow-xl font-medium flex items-center gap-3 animate-bounce transition-all ${
          toast.type === 'error' 
            ? 'bg-white border-2 border-rose-500 text-slate-800 shadow-rose-500/10' 
            : 'bg-white border-2 border-emerald-500 text-slate-800 shadow-emerald-500/10'
        }`}>
          {toast.type === 'error' ? (
            <AlertTriangle size={20} className="text-rose-500 shrink-0" />
          ) : (
            <CheckCircle size={20} className="text-emerald-500 shrink-0" />
          )}
          <span className="font-bold text-sm text-slate-800">{toast.msg}</span>
        </div>
      )}

      {/* MOBILE BACKDROP */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-20 md:hidden backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* SIDEBAR DENGAN TEMA PUTIH BERSIH & PROFESIONAL */}
      <aside className={`fixed md:static inset-y-0 left-0 z-30 flex flex-col w-64 bg-white text-slate-800 transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 shadow-lg md:shadow-none border-r border-slate-200`}>
        {/* LOGO & BRANDING HEADER */}
        <div className="p-4 border-b border-slate-100 bg-white flex flex-col gap-2.5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-slate-50 p-1.5 rounded-xl shadow-xs border border-slate-200 flex items-center justify-center shrink-0">
                <img src="/logo.png" alt="ASA JASA" className="h-8 w-auto object-contain" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-black tracking-wider text-slate-900 leading-tight">ASA JASA</h1>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Management</p>
              </div>
            </div>
            <button className="md:hidden text-slate-400 hover:text-slate-700" onClick={() => setMobileMenuOpen(false)}>
              <X size={20} />
            </button>
          </div>
          <div className="pt-2 border-t border-slate-100">
            <p className="text-[9px] text-slate-500 font-medium tracking-tight leading-snug">
              Solusi Legalitas, Perizinan, Sertifikasi & IT Developer
            </p>
          </div>
        </div>

        {/* SIDEBAR NAVIGATION */}
        <div className="flex-1 overflow-y-auto py-4">
          <SidebarNav view={view} setView={(v) => { setView(v); setMobileMenuOpen(false); }} />
        </div>

      </aside>

      {/* MAIN CONTENT AREA DENGAN TEMA PUTIH BERSIH */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-slate-50">
        {/* HEADER ATAS */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center px-4 md:px-8 justify-between z-10 shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-slate-600 p-1.5 rounded-lg hover:bg-slate-100" onClick={() => setMobileMenuOpen(true)}>
              <Menu size={22} />
            </button>
            <div>
              <div className="text-lg font-black text-slate-900 capitalize leading-tight flex items-center gap-2">
                <span>
                  {view === 'dashboard' && 'Dashboard Utama'}
                  {view === 'clients' && 'Data Klien & Mitra'}
                  {view === 'services' && 'Katalog Layanan & Tarif'}
                  {view === 'quotations' && 'Surat Penawaran (Quotation)'}
                  {view === 'invoices' && 'Invoice / Tagihan Klien'}
                  {view === 'payments' && 'Riwayat Pembayaran & Kwitansi'}
                  {view === 'projects' && 'Monitoring & Progress Proyek'}
                  {view === 'finance' && 'Ringkasan & Laporan Keuangan'}
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600"></span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block font-medium">
                ASA JASA • Solusi Legalitas, Perizinan, Sertifikasi & IT Developer
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {cloudSynced ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200" title="Terhubung ke Database Cloud Supabase">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Cloud DB Online
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200" title="Menggunakan Penyimpanan Lokal">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                Local Storage
              </span>
            )}
          </div>
        </header>

        {/* PAGE CONTENT CONTAINER */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50">
          {view === 'dashboard' && (
            <Dashboard 
              clients={clients} 
              quotations={quotations} 
              invoices={invoices} 
              projects={projects} 
              setView={setView} 
              setPrintData={setPrintData} 
            />
          )}
          {view === 'clients' && <ClientManager clients={clients} dbAction={dbAction} showToast={showToast} />}
          {view === 'services' && <ServiceCatalog services={services} dbAction={dbAction} showToast={showToast} />}
          {view === 'quotations' && (
            <QuotationManager 
              quotations={quotations} 
              clients={clients} 
              services={services} 
              dbAction={dbAction} 
              setPrintData={setPrintData} 
              showToast={showToast} 
            />
          )}
          {view === 'invoices' && (
            <InvoiceManager 
              invoices={invoices} 
              quotations={quotations} 
              clients={clients} 
              payments={payments} 
              dbAction={dbAction} 
              setPrintData={setPrintData} 
              showToast={showToast} 
            />
          )}
          {view === 'payments' && (
            <PaymentManager 
              payments={payments} 
              invoices={invoices} 
              clients={clients} 
              setPrintData={setPrintData} 
            />
          )}
          {view === 'projects' && (
            <ProjectManager 
              projects={projects} 
              clients={clients} 
              dbAction={dbAction} 
              showToast={showToast} 
            />
          )}
          {view === 'finance' && (
            <FinanceDashboard 
              invoices={invoices} 
              payments={payments} 
              setPrintData={setPrintData} 
            />
          )}
        </div>
      </main>
    </div>
  );
}

// ==========================================
// NAVIGATION (TEMA PROFESIONAL PUTIH)
// ==========================================
const SidebarNav = ({ view, setView }) => {
  const menus = [
    { group: 'Utama', items: [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }] },
    { group: 'Master Data', items: [
       { id: 'clients', label: 'Data Klien', icon: Users },
       { id: 'services', label: 'Katalog Layanan', icon: BookOpen }
    ]},
    { group: 'Administrasi', items: [
       { id: 'quotations', label: 'Surat Penawaran', icon: FileText },
       { id: 'invoices', label: 'Invoice / Tagihan', icon: FileSpreadsheet },
       { id: 'payments', label: 'Pembayaran & Kwitansi', icon: CreditCard }
    ]},
    { group: 'Operasional', items: [
       { id: 'projects', label: 'Daftar Proyek', icon: Briefcase }
    ]},
    { group: 'Keuangan', items: [
       { id: 'finance', label: 'Laporan Keuangan', icon: DollarSign }
    ]}
  ];

  return (
    <nav className="space-y-6">
      {menus.map((g, i) => (
        <div key={i} className="px-4">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-3">{g.group}</p>
          <div className="space-y-1">
            {g.items.map(m => {
              const isActive = view === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setView(m.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700 font-bold border-l-4 border-blue-600 shadow-xs' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                  }`}
                >
                  <m.icon size={18} className={isActive ? 'text-blue-600' : 'text-slate-400'} /> 
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
};

// ==========================================
// DASHBOARD (TEMA PROFESIONAL PUTIH)
// ==========================================
const Dashboard = ({ clients, quotations, invoices, projects, setView, setPrintData }) => {
  const activeProjects = projects.filter(p => p.status !== 'Selesai' && p.status !== 'Batal').length;
  const unpaidInvoices = invoices.filter(i => i.paymentStatus !== 'Lunas').length;
  const pendingQuotations = quotations.filter(q => q.status === 'Pending').length;
  const totalRevenue = invoices.reduce((acc, inv) => acc + (inv.amountPaid || 0), 0);

  return (
    <div className="space-y-6">
      {/* QUICK STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Klien Terdaftar" value={clients.length} icon={Users} accent="text-blue-600" />
        <StatCard title="Proyek Aktif Berjalan" value={activeProjects} icon={Briefcase} accent="text-sky-600" />
        <StatCard title="Tagihan Belum Lunas" value={unpaidInvoices} icon={AlertTriangle} accent="text-amber-600" />
        <StatCard title="Total Kas Masuk" value={formatIDR(totalRevenue)} icon={DollarSign} accent="text-emerald-600" />
      </div>

      {/* QUICK ACTIONS BANNER DENGAN TAMPILAN PUTIH BERSIH */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
        <div className="flex items-start sm:items-center gap-4">
          <div className="bg-slate-50 p-2.5 rounded-2xl shadow-xs border border-slate-200 shrink-0 hidden sm:block">
            <img src="/logo.png" alt="ASA JASA" className="h-14 w-auto object-contain" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold uppercase tracking-wider mb-2">
              <Sparkles size={13} className="text-blue-600" /> Solusi Legalitas, Perizinan, Sertifikasi & IT Developer
            </div>
            <h2 className="text-xl font-black tracking-tight text-slate-900">Sistem Administrasi Terpadu ASA JASA</h2>
            <p className="text-xs text-slate-600 mt-1 max-w-xl leading-relaxed">
              Buat Surat Penawaran resmi berlogo, otomatis buat Invoice saat disetujui, pantau 6 tahapan proyek perizinan, dan cetak Kwitansi Resmi dengan Terbilang Rupiah otomatis.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2.5 shrink-0">
          <button 
            onClick={() => setView('quotations')}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={16} /> Buat Penawaran
          </button>
          <button 
            onClick={() => setView('clients')}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-sm border border-slate-300 hover:border-slate-400 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Users size={16} /> Tambah Klien
          </button>
        </div>
      </div>

      {/* 2-COLUMN SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PROYEK TERBARU */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">Proyek Berjalan Terbaru</h3>
              <p className="text-xs text-slate-500">Progress tahapan pengurusan izin & sertifikasi</p>
            </div>
            <button onClick={() => setView('projects')} className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
              Lihat Semua &rarr;
            </button>
          </div>
          <div className="space-y-3 flex-1">
            {projects.slice(0, 5).map(p => {
              const client = clients.find(c => c.id === p.clientId);
              return (
                <div key={p.id} className="flex justify-between items-center p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/60 transition-colors">
                  <div className="max-w-[65%]">
                    <p className="font-bold text-sm text-slate-900 truncate">{p.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{client?.companyName || 'Klien Umum'}</p>
                  </div>
                  <Badge status={p.status} />
                </div>
              );
            })}
            {projects.length === 0 && <p className="text-sm text-slate-400 text-center py-8">Belum ada proyek aktif.</p>}
          </div>
        </div>

        {/* PENAWARAN MENUNGGU */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">Penawaran Menunggu (Pending)</h3>
              <p className="text-xs text-slate-500">Surat penawaran yang belum disetujui klien</p>
            </div>
            <button onClick={() => setView('quotations')} className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
              Kelola Penawaran &rarr;
            </button>
          </div>
          <div className="space-y-3 flex-1">
            {quotations.filter(q => q.status === 'Pending').slice(0, 5).map(q => {
              const client = clients.find(c => c.id === q.clientId);
              return (
                <div key={q.id} className="flex justify-between items-center p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/60 transition-colors">
                  <div>
                    <p className="font-bold text-sm text-blue-600">{q.number}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{client?.companyName || 'Klien tidak ditemukan'}</p>
                    <p className="text-xs font-black text-slate-900 mt-1">{formatIDR(q.total)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge status={q.status} />
                    <button 
                      onClick={() => setPrintData({ type: 'quotation', data: q })}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200"
                      title="Lihat / Cetak Surat Penawaran"
                    >
                      <Printer size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
            {pendingQuotations === 0 && (
              <div className="text-center py-8 text-slate-400">
                <CheckCircle size={32} className="mx-auto text-emerald-500 mb-2 opacity-80" />
                <p className="text-sm font-medium text-slate-600">Semua surat penawaran telah disetujui / diproses.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, accent }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 hover:border-slate-300 hover:shadow transition-all flex items-center gap-4">
    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-xs shrink-0">
      <Icon size={22} className={accent} />
    </div>
    <div className="min-w-0">
      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{title}</p>
      <p className="text-xl font-black text-slate-900 mt-0.5 truncate">{value}</p>
    </div>
  </div>
);

// ==========================================
// CLIENT MANAGER
// ==========================================
const ClientManager = ({ clients, dbAction, showToast }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = clients.filter(c => 
    c.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.picName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.nib?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.businessCategory?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd.entries());
    if (editingClient) {
      dbAction('clients', 'update', editingClient.id, data);
      showToast('Data klien berhasil diperbarui');
    } else {
      dbAction('clients', 'add', null, data);
      showToast('Klien baru berhasil ditambahkan');
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Data Klien & Mitra</h2>
          <p className="text-xs text-slate-500">Database perusahaan, pemilik/PIC, legalitas NIB, dan kontak</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input 
              type="text" 
              placeholder="Cari perusahaan, PIC, NIB..." 
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none bg-white text-slate-900 placeholder-slate-400 shadow-xs" 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
            />
          </div>
          <button 
            onClick={() => { setEditingClient(null); setModalOpen(true); }} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all whitespace-nowrap cursor-pointer"
          >
            <Plus size={18} /> <span>Tambah Klien</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider font-bold border-b border-slate-200">
                <th className="p-4">Nama Perusahaan</th>
                <th className="p-4">PIC / Kontak</th>
                <th className="p-4">Kategori Usaha</th>
                <th className="p-4">NIB</th>
                <th className="p-4">Alamat</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {filteredClients.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-4 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <Building2 size={16} className="text-blue-600 shrink-0" />
                      <span>{c.companyName}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-slate-900">{c.picName}</div>
                    <div className="text-xs text-slate-500 flex flex-col gap-0.5 mt-0.5">
                      <span className="flex items-center gap-1"><Phone size={12} className="text-blue-500" /> {c.phone}</span>
                      {c.email && <span className="flex items-center gap-1"><Mail size={12} className="text-blue-500" /> {c.email}</span>}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-bold text-xs rounded-full border border-slate-200">
                      {c.businessCategory || 'Umum'}
                    </span>
                  </td>
                  <td className="p-4 text-xs font-mono font-bold text-slate-700">{c.nib || '-'}</td>
                  <td className="p-4 text-xs text-slate-500 max-w-xs truncate" title={c.address}>
                    {c.address || '-'}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button 
                        onClick={() => { setEditingClient(c); setModalOpen(true); }} 
                        className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Data Klien"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => setDeleteTarget(c)} 
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Hapus Klien"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">
                    Tidak ditemukan data klien yang sesuai dengan pencarian "{searchTerm}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {deleteTarget && (
        <ConfirmModal 
          title="Hapus Data Klien" 
          message={`Apakah Anda yakin ingin menghapus klien "${deleteTarget.companyName}"?`}
          onConfirm={() => { dbAction('clients', 'delete', deleteTarget.id); showToast('Klien berhasil dihapus'); setDeleteTarget(null); }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {isModalOpen && (
        <Modal title={editingClient ? "Edit Data Klien" : "Tambah Klien Baru"} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Nama Perusahaan / Usaha" name="companyName" defaultValue={editingClient?.companyName} placeholder="Contoh: PT Berkah Sejahtera" required />
              <Input label="Nama Pemilik / PIC" name="picName" defaultValue={editingClient?.picName} placeholder="Contoh: Bpk. Ahmad" required />
              <Input label="Nomor WhatsApp" name="phone" defaultValue={editingClient?.phone} placeholder="Contoh: 08123456789" required />
              <Input label="Email Perusahaan" name="email" type="email" defaultValue={editingClient?.email} placeholder="email@perusahaan.com" />
              <Input label="Nomor Induk Berusaha (NIB)" name="nib" defaultValue={editingClient?.nib} placeholder="Contoh: 9120003412991" />
              <Input label="Kategori Usaha" name="businessCategory" defaultValue={editingClient?.businessCategory} placeholder="F&B, Kosmetik, Jasa, Farmasi..." />
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Alamat Lengkap</label>
                <textarea 
                  name="address" 
                  defaultValue={editingClient?.address} 
                  className="w-full p-2.5 border border-slate-300 bg-white text-slate-900 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none text-sm placeholder-slate-400 shadow-xs" 
                  rows="3"
                  placeholder="Alamat kantor / tempat usaha..."
                ></textarea>
              </div>
            </div>
            <div className="flex justify-end gap-2.5 mt-6 pt-4 border-t border-slate-100">
              <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border border-slate-200 bg-white rounded-xl text-slate-700 hover:bg-slate-50 text-sm font-medium">
                Batal
              </button>
              <button type="submit" className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 text-sm shadow-sm">
                Simpan Klien
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

// ==========================================
// SERVICE CATALOG
// ==========================================
const ServiceCatalog = ({ services, dbAction, showToast }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  const categories = ["Semua", "Sertifikasi Halal", "Perizinan Usaha (NIB)", "Izin Edar (BPOM/PIRT)", "Sistem Manajemen (ISO/HACCP)", "Konsultasi"];
  const formCategories = categories.filter(c => c !== 'Semua');

  const filteredServices = services.filter(s => 
    selectedCategory === 'Semua' ? true : s.category === selectedCategory
  );

  const handleSave = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = {
      name: fd.get('name'),
      category: fd.get('category'),
      price: Number(fd.get('price')),
      unit: fd.get('unit'),
      description: fd.get('description')
    };
    if (editingService) {
      dbAction('services', 'update', editingService.id, data);
      showToast('Layanan berhasil diperbarui');
    } else {
      dbAction('services', 'add', null, data);
      showToast('Layanan baru berhasil ditambahkan');
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Katalog Layanan & Tarif</h2>
          <p className="text-xs text-slate-500">Daftar tarif resmi konsultasi dan pendampingan legalitas ASA JASA</p>
        </div>
        <button 
          onClick={() => { setEditingService(null); setModalOpen(true); }} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <Plus size={18} /> Tambah Layanan
        </button>
      </div>

      {/* CATEGORY FILTER TABS */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat 
                ? 'bg-slate-900 text-white font-bold shadow-sm border-transparent' 
                : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* SERVICES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map(s => (
          <div key={s.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2.5">
                <span className="text-[11px] font-bold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                  {s.category}
                </span>
                <div className="flex gap-1">
                  <button onClick={() => { setEditingService(s); setModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors" title="Edit">
                    <Edit size={15} />
                  </button>
                  <button onClick={() => setDeleteTarget(s)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors" title="Hapus">
                    <Trash size={15} />
                  </button>
                </div>
              </div>
              <h3 className="font-bold text-base text-slate-900 leading-snug mb-2">{s.name}</h3>
              <p className="text-2xl font-black text-blue-700 mb-3">
                {formatIDR(s.price)} 
                <span className="text-xs font-normal text-slate-500 ml-1">/ {s.unit}</span>
              </p>
              <div className="text-xs text-slate-600 line-clamp-4 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                {s.description || 'Tidak ada deskripsi layanan.'}
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Siap di Surat Penawaran</span>
              <span className="font-bold text-emerald-600">Tersedia</span>
            </div>
          </div>
        ))}
      </div>

      {deleteTarget && (
        <ConfirmModal 
          title="Hapus Layanan" 
          message={`Apakah Anda yakin ingin menghapus layanan "${deleteTarget.name}" dari katalog?`}
          onConfirm={() => { dbAction('services', 'delete', deleteTarget.id); showToast('Layanan dihapus'); setDeleteTarget(null); }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {isModalOpen && (
        <Modal title={editingService ? "Edit Layanan" : "Tambah Layanan Baru"} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSave} className="space-y-4">
            <Input label="Nama Layanan" name="name" defaultValue={editingService?.name} placeholder="Contoh: Pendampingan Sertifikasi Halal Reguler" required />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Kategori</label>
                <select name="category" defaultValue={editingService?.category || formCategories[0]} className="w-full p-2.5 border border-slate-300 bg-white text-slate-900 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm">
                  {formCategories.map(cat => <option key={cat} value={cat} className="bg-white text-slate-900">{cat}</option>)}
                </select>
              </div>
              <Input label="Harga Standar (Rp)" name="price" type="number" defaultValue={editingService?.price} placeholder="5000000" required />
              <Input label="Satuan" name="unit" defaultValue={editingService?.unit || 'Paket'} placeholder="Paket / Titik / Produk" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Deskripsi Layanan & Rincian Pekerjaan</label>
              <textarea 
                name="description" 
                defaultValue={editingService?.description} 
                placeholder="Rincian ruang lingkup ini akan otomatis masuk ke tabel Surat Penawaran saat layanan dipilih..." 
                className="w-full p-3 border border-slate-300 bg-white text-slate-900 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm placeholder-slate-400 shadow-xs" 
                rows="4"
              ></textarea>
            </div>
            <div className="flex justify-end gap-2.5 mt-6 pt-4 border-t border-slate-100">
              <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border border-slate-200 bg-white rounded-xl text-slate-700 hover:bg-slate-50 text-sm font-medium">Batal</button>
              <button type="submit" className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 text-sm shadow-sm">Simpan Layanan</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

// ==========================================
// QUOTATION MANAGER
// ==========================================
const QuotationManager = ({ quotations, clients, services, dbAction, setPrintData, showToast }) => {
  const [isFormOpen, setFormOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState(null);
  const [confirmApprove, setConfirmApprove] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  
  const handleCreateInvoice = (q) => {
    // 1. Update quotation status
    dbAction('quotations', 'update', q.id, { status: 'Disetujui' });
    
    // 2. Auto create invoice (+14 days due date)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const invData = {
      number: generateNumber('INV'),
      quotationId: q.id,
      clientId: q.clientId,
      items: q.items,
      subtotal: q.subtotal,
      discount: q.discount,
      total: q.total,
      status: 'Aktif',
      paymentStatus: 'Belum Bayar',
      amountPaid: 0,
      date: new Date().toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0]
    };
    dbAction('invoices', 'add', null, invData);

    // 3. Auto create project
    const projData = {
      name: `Proyek: ${q.items[0]?.name || 'Layanan ASA JASA'}`,
      clientId: q.clientId,
      quotationId: q.id,
      status: 'Persiapan',
      startDate: new Date().toISOString().split('T')[0],
    };
    dbAction('projects', 'add', null, projData);
    
    setConfirmApprove(null);
    showToast('Penawaran disetujui! Invoice dan Proyek otomatis dibuat.');
  };

  return (
    <div className="space-y-4">
      {isFormOpen ? (
        <QuotationForm 
          clients={clients} 
          services={services}
          initialData={editingQuotation}
          onSave={(data) => { 
            if (editingQuotation) {
              dbAction('quotations', 'update', editingQuotation.id, data);
              showToast('Surat Penawaran berhasil diperbarui');
            } else {
              dbAction('quotations', 'add', null, data);
              showToast('Surat Penawaran baru berhasil diterbitkan');
            }
            setFormOpen(false);
            setEditingQuotation(null);
          }} 
          onCancel={() => { setFormOpen(false); setEditingQuotation(null); }} 
        />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Surat Penawaran (Quotation)</h2>
              <p className="text-xs text-slate-500">Kelola penawaran harga, kustomisasi kalimat pembuka/penutup, dan buat tagihan</p>
            </div>
            <button 
              onClick={() => { setEditingQuotation(null); setFormOpen(true); }} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Plus size={18} /> Buat Penawaran Baru
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider font-bold border-b border-slate-200">
                    <th className="p-4">Nomor & Tanggal</th>
                    <th className="p-4">Klien & Perihal</th>
                    <th className="p-4">Total Penawaran</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {quotations.map(q => {
                    const client = clients.find(c => c.id === q.clientId);
                    return (
                      <tr key={q.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-blue-600">{q.number}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{formatDate(q.date)}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-slate-900">{client?.companyName || 'Klien tidak ditemukan'}</div>
                          <div className="text-xs text-slate-500 truncate max-w-sm">{q.subject || 'Penawaran Layanan'}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-black text-slate-900">{formatIDR(q.total)}</div>
                          {q.discount > 0 && <div className="text-xs text-rose-600 font-semibold">Diskon: {formatIDR(q.discount)}</div>}
                        </td>
                        <td className="p-4">
                          <Badge status={q.status} />
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1 items-center">
                            <button 
                              onClick={() => setPrintData({ type: 'quotation', data: q })} 
                              className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                              title="Cetak / Pratinjau Surat Penawaran"
                            >
                              <Printer size={16} />
                            </button>
                            {q.status !== 'Disetujui' && (
                              <>
                                <button 
                                  onClick={() => { setEditingQuotation(q); setFormOpen(true); }} 
                                  className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                                  title="Edit Penawaran"
                                >
                                  <Edit size={16} />
                                </button>
                                <button 
                                  onClick={() => setConfirmApprove(q)} 
                                  className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" 
                                  title="Setujui & Buat Invoice Otomatis"
                                >
                                  <FileCheck size={16} />
                                </button>
                              </>
                            )}
                            <button 
                              onClick={() => setDeleteTarget(q)} 
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" 
                              title="Hapus"
                            >
                              <Trash size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {quotations.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-slate-400">
                        Belum ada surat penawaran dibuat. Klik "Buat Penawaran Baru" di atas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {confirmApprove && (
        <ConfirmModal 
          title="Setujui Penawaran & Terbitkan Invoice"
          message={`Setujui penawaran ${confirmApprove.number}? Sistem akan otomatis membuat Invoice baru dengan tempo 14 hari serta memulai Proyek baru di tahap Persiapan.`}
          confirmText="Ya, Setujui & Buat Invoice"
          confirmColor="bg-emerald-600 hover:bg-emerald-700"
          onConfirm={() => handleCreateInvoice(confirmApprove)}
          onCancel={() => setConfirmApprove(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmModal 
          title="Hapus Penawaran" 
          message={`Hapus surat penawaran ${deleteTarget.number}?`}
          onConfirm={() => { dbAction('quotations', 'delete', deleteTarget.id); showToast('Penawaran dihapus'); setDeleteTarget(null); }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

const QuotationForm = ({ clients, services, initialData, onSave, onCancel }) => {
  const defaultOpening = `Dengan hormat,\n\nBersama surat ini kami dari ASA JASA bermaksud mengajukan penawaran harga jasa konsultasi dan pendampingan perizinan/sertifikasi usaha sesuai dengan kebutuhan perusahaan Bapak/Ibu, dengan rincian sebagai berikut:`;
  const defaultClosing = `Demikian surat penawaran ini kami sampaikan. Besar harapan kami dapat bekerja sama dengan perusahaan Bapak/Ibu. Atas perhatian dan kerja samanya kami ucapkan terima kasih.`;

  const [clientId, setClientId] = useState(initialData?.clientId || '');
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [subject, setSubject] = useState(initialData?.subject || 'Penawaran Jasa Konsultasi Legalitas & Sertifikasi Usaha');
  const [openingText, setOpeningText] = useState(initialData?.openingText ?? defaultOpening);
  const [closingText, setClosingText] = useState(initialData?.closingText ?? defaultClosing);
  const [items, setItems] = useState(initialData?.items || []);
  const [discount, setDiscount] = useState(initialData?.discount || 0);
  const [formError, setFormError] = useState('');

  const addItem = (serviceId) => {
    const s = services.find(x => x.id === serviceId);
    if (!s) return;
    setItems(prev => [
      ...prev, 
      { 
        serviceId: s.id, 
        name: s.name, 
        description: s.description || '', 
        unit: s.unit || 'Paket',
        price: s.price, 
        qty: 1, 
        total: s.price 
      }
    ]);
  };

  const updateItem = (index, field, value) => {
    setItems(prev => {
      const copy = [...prev];
      if (field === 'price' || field === 'qty') {
        copy[index][field] = Number(value);
        copy[index].total = copy[index].price * copy[index].qty;
      } else {
        copy[index][field] = value;
      }
      return copy;
    });
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const total = Math.max(0, subtotal - discount);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!clientId) return setFormError('Silakan pilih klien terlebih dahulu.');
    if (items.length === 0) return setFormError('Silakan tambahkan minimal 1 layanan dari Katalog Layanan.');
    setFormError('');
    
    onSave({
      number: initialData?.number || generateNumber('QTN'),
      date: date || new Date().toISOString().split('T')[0],
      clientId,
      subject,
      openingText,
      closingText,
      items,
      subtotal,
      discount,
      total,
      status: initialData?.status || 'Pending'
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 text-slate-800">
      <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-xl font-black text-slate-900">
            {initialData ? `Edit Surat Penawaran: ${initialData.number}` : 'Buat Surat Penawaran Baru'}
          </h3>
          <p className="text-xs text-slate-500">Sesuaikan data klien, kalimat pembuka, rincian item layanan, dan kalimat penutup resmi.</p>
        </div>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors">
          <X size={20} />
        </button>
      </div>

      {formError && (
        <div className="mb-4 p-3.5 bg-rose-50 border border-rose-300 text-rose-700 rounded-xl text-sm flex items-center gap-2">
          <AlertTriangle size={18} /> {formError}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Pilih Klien / Perusahaan *</label>
            <select 
              value={clientId} 
              onChange={e => setClientId(e.target.value)} 
              className="w-full p-2.5 border border-slate-300 bg-white text-slate-900 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none text-sm shadow-xs" 
              required
            >
              <option value="" className="text-slate-500">-- Pilih Klien Terdaftar --</option>
              {clients.map(c => (
                <option key={c.id} value={c.id} className="text-slate-900">{c.companyName} ({c.picName})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Tanggal Surat Penawaran *</label>
            <input 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)} 
              className="w-full p-2.5 border border-slate-300 bg-white text-slate-900 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none text-sm shadow-xs" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Perihal / Judul Penawaran *</label>
            <input 
              type="text" 
              value={subject} 
              onChange={e => setSubject(e.target.value)} 
              className="w-full p-2.5 border border-slate-300 bg-white text-slate-900 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none text-sm shadow-xs" 
              placeholder="Contoh: Penawaran Sertifikasi Halal BPJPH & NIB OSS RBA" 
              required 
            />
          </div>
        </div>

        {/* 1. KALIMAT PEMBUKA */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-bold text-slate-800">1. Kalimat Pembuka Surat (Posisi Atas Tabel)</label>
            <button type="button" onClick={() => setOpeningText(defaultOpening)} className="text-xs text-blue-600 font-bold hover:underline">
              Kembalikan ke Teks Standar
            </button>
          </div>
          <textarea 
            value={openingText} 
            onChange={e => setOpeningText(e.target.value)} 
            rows="3" 
            className="w-full p-3 border border-slate-300 bg-white text-slate-900 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none text-sm shadow-xs"
            placeholder="Tulis kalimat pembuka surat penawaran di sini..."
          />
        </div>

        {/* 2. TABEL RINCIAN LAYANAN */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="block text-sm font-bold text-slate-800">2. Tabel Rincian Layanan & Tarif (Posisi Tengah)</label>
            <div className="w-full sm:w-80">
              <select 
                onChange={e => { addItem(e.target.value); e.target.value=''; }} 
                className="w-full p-2 border border-blue-200 bg-blue-50/50 text-blue-800 font-bold rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-xs"
              >
                <option value="" className="text-slate-600">+ Pilih & Tambahkan dari Katalog...</option>
                {services.map(s => (
                  <option key={s.id} value={s.id} className="text-slate-900">{s.name} ({formatIDR(s.price)})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-bold tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Nama & Deskripsi Layanan</th>
                    <th className="p-3.5 w-36">Harga Satuan (Rp)</th>
                    <th className="p-3.5 w-24 text-center">Qty</th>
                    <th className="p-3.5 w-36 text-right">Total</th>
                    <th className="p-3.5 w-12 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {items.map((item, i) => (
                    <tr key={i} className="align-top hover:bg-slate-50/70">
                      <td className="p-3 space-y-1.5">
                        <input 
                          type="text" 
                          value={item.name} 
                          onChange={e => updateItem(i, 'name', e.target.value)} 
                          className="w-full font-bold text-slate-900 border border-slate-200 bg-white p-2 rounded-lg text-sm focus:ring-1 focus:ring-blue-500"
                          placeholder="Nama Layanan"
                        />
                        <textarea 
                          value={item.description} 
                          onChange={e => updateItem(i, 'description', e.target.value)} 
                          rows="2"
                          className="w-full text-xs text-slate-600 border border-slate-200 bg-white p-2 rounded-lg focus:ring-1 focus:ring-blue-500"
                          placeholder="Rincian lingkup kerja layanan..."
                        />
                      </td>
                      <td className="p-3">
                        <input 
                          type="number" 
                          value={item.price} 
                          onChange={e => updateItem(i, 'price', e.target.value)} 
                          className="w-full border border-slate-200 bg-white text-slate-900 p-2 rounded-lg text-sm font-semibold" 
                        />
                        <span className="text-[11px] text-slate-500 block mt-1">/{item.unit || 'Paket'}</span>
                      </td>
                      <td className="p-3">
                        <input 
                          type="number" 
                          min="1" 
                          value={item.qty} 
                          onChange={e => updateItem(i, 'qty', e.target.value)} 
                          className="w-full border border-slate-200 bg-white text-slate-900 p-2 rounded-lg text-center text-sm font-semibold" 
                        />
                      </td>
                      <td className="p-3 font-black text-right text-slate-900 pt-5">
                        {formatIDR(item.total)}
                      </td>
                      <td className="p-3 pt-5 text-center">
                        <button 
                          type="button" 
                          onClick={() => setItems(prev => prev.filter((_, idx) => idx !== i))} 
                          className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"
                          title="Hapus Baris"
                        >
                          <Trash size={16}/>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-slate-400 text-sm">
                        Belum ada layanan dipilih. Silakan pilih layanan melalui dropdown Katalog Layanan di atas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <div className="w-full sm:w-80 bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5 text-sm">
              <div className="flex justify-between font-medium text-slate-600">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">{formatIDR(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Diskon (Rp)</span>
                <input 
                  type="number" 
                  value={discount} 
                  onChange={e => setDiscount(Number(e.target.value))} 
                  className="w-32 border border-slate-300 bg-white text-slate-900 p-1.5 rounded-lg text-right font-semibold text-sm" 
                />
              </div>
              <div className="flex justify-between font-black text-lg text-blue-700 border-t border-slate-200 pt-2.5">
                <span>Total Penawaran</span>
                <span>{formatIDR(total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. KALIMAT PENUTUP */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-bold text-slate-800">3. Kalimat Penutup Surat (Posisi Bawah Tabel)</label>
            <button type="button" onClick={() => setClosingText(defaultClosing)} className="text-xs text-blue-600 font-bold hover:underline">
              Kembalikan ke Teks Standar
            </button>
          </div>
          <textarea 
            value={closingText} 
            onChange={e => setClosingText(e.target.value)} 
            rows="3" 
            className="w-full p-3 border border-slate-300 bg-white text-slate-900 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none text-sm shadow-xs"
            placeholder="Tulis kalimat penutup surat penawaran di sini..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button type="button" onClick={onCancel} className="px-5 py-2.5 border border-slate-200 bg-white rounded-xl text-slate-700 hover:bg-slate-50 text-sm font-medium">
            Batal
          </button>
          <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-sm">
            {initialData ? 'Simpan Perubahan Penawaran' : 'Simpan & Terbitkan Penawaran'}
          </button>
        </div>
      </form>
    </div>
  );
};

// ==========================================
// INVOICE MANAGER
// ==========================================
const InvoiceManager = ({ invoices, quotations, clients, payments, dbAction, setPrintData, showToast }) => {
  const [payModal, setPayModal] = useState(null);
  const [receiptListModal, setReceiptListModal] = useState(null);

  const handleRecordPayment = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const amount = Number(fd.get('amount'));
    const method = fd.get('method');
    const note = fd.get('note');
    
    const currentPaid = payModal.amountPaid || 0;
    const newAmountPaid = currentPaid + amount;
    const isFull = newAmountPaid >= payModal.total;
    const paymentType = isFull ? (currentPaid === 0 ? 'Pelunasan Penuh' : 'Pelunasan Akhir') : 'Pembayaran Parsial / DP';

    // 1. Create Payment & Official Kwitansi Record
    const payData = {
      number: generateNumber('KWT'),
      invoiceId: payModal.id,
      invoiceNumber: payModal.number,
      clientId: payModal.clientId,
      amount,
      method,
      paymentType,
      note: note || `${paymentType} untuk Tagihan ${payModal.number}`,
      date: new Date().toISOString().split('T')[0],
      status: 'Terverifikasi'
    };
    const createdPay = dbAction('payments', 'add', null, payData);

    // 2. Update Invoice Status
    const newStatus = isFull ? 'Lunas' : 'Parsial';
    dbAction('invoices', 'update', payModal.id, {
      amountPaid: newAmountPaid,
      paymentStatus: newStatus
    });

    setPayModal(null);
    showToast(`Pembayaran (${paymentType}) berhasil dicatat & Kwitansi Resmi telah diterbitkan!`);

    // Langsung buka Kwitansi Resmi
    if (createdPay) {
      setPrintData({ type: 'receipt', data: createdPay });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Invoice / Tagihan Klien</h2>
          <p className="text-xs text-slate-500">Daftar tagihan pembayaran jasa konsultasi & status pelunasan</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider font-bold border-b border-slate-200">
                <th className="p-4">No Invoice</th>
                <th className="p-4">Klien & Tanggal</th>
                <th className="p-4">Total / Terbayar</th>
                <th className="p-4">Status Tagihan</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {invoices.map(inv => {
                const client = clients.find(c => c.id === inv.clientId);
                const balance = inv.total - (inv.amountPaid || 0);
                const invPayments = payments.filter(p => p.invoiceId === inv.id);

                return (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-blue-600">{inv.number}</div>
                      <div className="text-xs text-slate-500 mt-0.5">Jatuh tempo: {formatDate(inv.dueDate)}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{client?.companyName}</div>
                      <div className="text-xs text-slate-500">Tgl Invoice: {formatDate(inv.date)}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-black text-slate-900">{formatIDR(inv.total)}</div>
                      {(inv.amountPaid || 0) > 0 && (
                        <div className="text-xs font-bold text-emerald-600">Terbayar: {formatIDR(inv.amountPaid)}</div>
                      )}
                      {balance > 0 && (
                        <div className="text-xs font-bold text-rose-600">Sisa: {formatIDR(balance)}</div>
                      )}
                    </td>
                    <td className="p-4">
                      <Badge status={inv.paymentStatus} />
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end items-center gap-1.5">
                        <button 
                          onClick={() => setPrintData({ type: 'invoice', data: inv })} 
                          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors" 
                          title="Cetak Invoice"
                        >
                          <Printer size={16} />
                        </button>
                        
                        {/* Tombol Kwitansi Resmi */}
                        {invPayments.length > 0 && (
                          <button 
                            onClick={() => {
                              if (invPayments.length === 1) {
                                setPrintData({ type: 'receipt', data: invPayments[0] });
                              } else {
                                setReceiptListModal(inv);
                              }
                            }} 
                            className="px-2.5 py-1.5 text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                            title="Cetak Kwitansi Resmi"
                          >
                            <FileCheck size={14} className="text-blue-600" /> Kwitansi ({invPayments.length})
                          </button>
                        )}

                        {inv.paymentStatus !== 'Lunas' && (
                          <button 
                            onClick={() => setPayModal(inv)} 
                            className="px-3 py-1.5 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition-colors"
                          >
                            <DollarSign size={14}/> Bayar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">
                    Belum ada invoice diterbitkan. Setujui Surat Penawaran untuk membuat invoice otomatis.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CATAT PEMBAYARAN */}
      {payModal && (
        <Modal title={`Catat Pembayaran: ${payModal.number}`} onClose={() => setPayModal(null)}>
          <div className="mb-4 p-4 bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl text-sm space-y-1.5">
            <div className="flex justify-between"><span>Total Nilai Tagihan:</span><strong className="text-base font-black text-slate-900">{formatIDR(payModal.total)}</strong></div>
            <div className="flex justify-between"><span>Telah Dibayar Sebelumnya:</span><strong className="text-emerald-600 font-bold">{formatIDR(payModal.amountPaid || 0)}</strong></div>
            <div className="flex justify-between border-t border-slate-200 pt-1.5"><span>Sisa yang Harus Dibayar:</span><strong className="text-rose-600 text-base font-black">{formatIDR(payModal.total - (payModal.amountPaid || 0))}</strong></div>
          </div>
          <form onSubmit={handleRecordPayment} className="space-y-4">
            <div>
              <Input 
                label="Nominal Pembayaran Diterima (Rp) - Isi sebagian untuk Parsial/DP" 
                name="amount" 
                type="number" 
                min="1000"
                max={payModal.total - (payModal.amountPaid || 0)} 
                defaultValue={payModal.total - (payModal.amountPaid || 0)} 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Metode Pembayaran</label>
              <select name="method" className="w-full p-2.5 border border-slate-300 bg-white text-slate-900 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm" required>
                <option value="Transfer Bank BSI" className="text-slate-900">Transfer Bank Syariah Indonesia (BSI)</option>
                <option value="Transfer Bank BCA" className="text-slate-900">Transfer Bank (BCA)</option>
                <option value="Transfer Bank Mandiri" className="text-slate-900">Transfer Bank (Mandiri)</option>
                <option value="Cash / Tunai" className="text-slate-900">Cash / Tunai</option>
                <option value="QRIS" className="text-slate-900">QRIS</option>
                <option value="Virtual Account" className="text-slate-900">Virtual Account</option>
              </select>
            </div>
            <div>
              <Input 
                label="Keterangan Pembayaran (Muncul di Kwitansi)" 
                name="note" 
                placeholder="Contoh: Pembayaran Uang Muka (DP 50%) / Pelunasan Akhir..." 
              />
            </div>
            <div className="flex justify-end gap-2.5 mt-6 pt-4 border-t border-slate-100">
              <button type="button" onClick={() => setPayModal(null)} className="px-4 py-2 border border-slate-200 bg-white rounded-xl text-slate-700 hover:bg-slate-50 text-sm font-medium">Batal</button>
              <button type="submit" className="px-5 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 text-sm font-bold shadow-sm flex items-center gap-1.5">
                <Printer size={15} /> Simpan & Buka Kwitansi
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL PILIH KWITANSI */}
      {receiptListModal && (
        <Modal title={`Daftar Kwitansi Resmi: ${receiptListModal.number}`} onClose={() => setReceiptListModal(null)}>
          <p className="text-xs text-slate-500 mb-3">Invoice ini memiliki beberapa riwayat pembayaran. Pilih kwitansi yang ingin dicetak ulang:</p>
          <div className="space-y-2.5">
            {payments.filter(p => p.invoiceId === receiptListModal.id).map(p => (
              <div key={p.id} className="flex justify-between items-center p-3.5 border border-slate-200 bg-slate-50 rounded-xl hover:bg-slate-100/80 transition-colors">
                <div>
                  <div className="font-bold text-blue-600 text-sm">{p.number} <span className="text-xs font-normal text-slate-500">({formatDate(p.date)})</span></div>
                  <div className="text-xs text-slate-600 mt-0.5">{p.note || p.paymentType} • {p.method}</div>
                  <div className="font-black text-emerald-600 text-sm mt-1">{formatIDR(p.amount)}</div>
                </div>
                <button 
                  onClick={() => { setReceiptListModal(null); setPrintData({ type: 'receipt', data: p }); }}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-blue-700 transition-colors"
                >
                  <Printer size={13} /> Cetak Kwitansi
                </button>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
};

// ==========================================
// PAYMENT / RECEIPT MANAGER
// ==========================================
const PaymentManager = ({ payments, invoices, clients, setPrintData }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Riwayat Pembayaran & Kwitansi Resmi</h2>
          <p className="text-xs text-slate-500">Arsip seluruh transaksi kas masuk yang telah diverifikasi dan memiliki Kwitansi Resmi</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider font-bold border-b border-slate-200">
                <th className="p-4">No Kwitansi & Tgl</th>
                <th className="p-4">Klien / Invoice Ref</th>
                <th className="p-4">Jenis & Metode</th>
                <th className="p-4">Nominal Diterima</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Kwitansi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {payments.map(p => {
                const client = clients.find(c => c.id === p.clientId);
                const inv = invoices.find(i => i.id === p.invoiceId);
                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-blue-600">{p.number}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{formatDate(p.date)}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-sm text-slate-900">{client?.companyName}</div>
                      <div className="text-xs text-blue-600 font-bold">{inv?.number || p.invoiceNumber}</div>
                    </td>
                    <td className="p-4 text-sm">
                      <div className="font-semibold text-slate-700">{p.paymentType || 'Pembayaran'}</div>
                      <div className="text-xs text-slate-500">{p.method}</div>
                    </td>
                    <td className="p-4 font-black text-emerald-600">{formatIDR(p.amount)}</td>
                    <td className="p-4"><Badge status={p.status} /></td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => setPrintData({ type: 'receipt', data: p })}
                        className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <Printer size={14} /> Cetak Kwitansi
                      </button>
                    </td>
                  </tr>
                );
              })}
              {payments.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">
                    Belum ada riwayat pembayaran yang dicatat.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// PROJECT MANAGER
// ==========================================
const ProjectManager = ({ projects, clients, dbAction, showToast }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const stages = [
    'Persiapan',
    'Verifikasi Dokumen',
    'Proses Ajuan',
    'Proses Audit/Pemeriksaan',
    'Proses Perbaikan Hasil Audit',
    'Selesai'
  ];

  const handleCreateProject = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = {
      name: fd.get('name'),
      clientId: fd.get('clientId'),
      status: fd.get('status') || 'Persiapan',
      startDate: fd.get('startDate') || new Date().toISOString().split('T')[0]
    };
    dbAction('projects', 'add', null, data);
    showToast('Proyek baru berhasil didaftarkan');
    setModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Monitoring & Progress Proyek</h2>
          <p className="text-xs text-slate-500">Tracking tahapan pendampingan perizinan dan sertifikasi halal klien</p>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <Plus size={18} /> Tambah Proyek Manual
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider font-bold border-b border-slate-200">
                <th className="p-4">Nama Proyek</th>
                <th className="p-4">Klien</th>
                <th className="p-4">Tanggal Mulai</th>
                <th className="p-4">Tahapan Saat Ini</th>
                <th className="p-4 text-right">Update Tahapan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {projects.map(p => {
                const client = clients.find(c => c.id === p.clientId);
                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{p.name}</td>
                    <td className="p-4 text-sm text-slate-600">{client?.companyName || '-'}</td>
                    <td className="p-4 text-sm text-slate-500">{formatDate(p.startDate)}</td>
                    <td className="p-4"><Badge status={p.status} /></td>
                    <td className="p-4 text-right">
                      <select
                        value={p.status}
                        onChange={(e) => {
                          dbAction('projects', 'update', p.id, { status: e.target.value });
                          showToast(`Status proyek diubah ke: ${e.target.value}`);
                        }}
                        className="p-2 border border-slate-300 bg-white text-slate-800 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none shadow-xs cursor-pointer"
                      >
                        {stages.map(st => <option key={st} value={st} className="text-slate-900">{st}</option>)}
                      </select>
                    </td>
                  </tr>
                );
              })}
              {projects.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">
                    Belum ada proyek berjalan. Proyek akan otomatis dibuat saat Surat Penawaran disetujui.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <Modal title="Tambah Proyek Baru" onClose={() => setModalOpen(false)}>
          <form onSubmit={handleCreateProject} className="space-y-4">
            <Input label="Nama Proyek" name="name" placeholder="Contoh: Pendampingan Halal & BPOM MD PT ABC" required />
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Pilih Klien *</label>
              <select name="clientId" className="w-full p-2.5 border border-slate-300 bg-white text-slate-900 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm" required>
                <option value="" className="text-slate-500">-- Pilih Klien --</option>
                {clients.map(c => <option key={c.id} value={c.id} className="text-slate-900">{c.companyName}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Tanggal Mulai" name="startDate" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Tahapan Awal</label>
                <select name="status" className="w-full p-2.5 border border-slate-300 bg-white text-slate-900 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm">
                  {stages.map(st => <option key={st} value={st} className="text-slate-900">{st}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2.5 mt-6 pt-4 border-t border-slate-100">
              <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border border-slate-200 bg-white rounded-xl text-slate-700 hover:bg-slate-50 text-sm font-medium">Batal</button>
              <button type="submit" className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 text-sm shadow-sm">Simpan Proyek</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

// ==========================================
// FINANCE DASHBOARD
// ==========================================
const FinanceDashboard = ({ invoices, payments, setPrintData }) => {
  const totalInvoiced = invoices.reduce((sum, i) => sum + (i.total || 0), 0);
  const totalCashIn = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalReceivables = Math.max(0, totalInvoiced - totalCashIn);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900">Laporan & Ringkasan Keuangan</h2>
        <p className="text-xs text-slate-500">Rekapitulasi total tagihan, kas masuk, piutang, dan arus kas pembayaran</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Nilai Tagihan (Invoice)" value={formatIDR(totalInvoiced)} icon={FileSpreadsheet} accent="text-blue-600" />
        <StatCard title="Total Kas Masuk (Terbayar)" value={formatIDR(totalCashIn)} icon={CheckCircle} accent="text-emerald-600" />
        <StatCard title="Total Piutang (Belum Lunas)" value={formatIDR(totalReceivables)} icon={Clock} accent="text-rose-600" />
      </div>

      {/* RECENT PAYMENTS IN FINANCE */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-black text-slate-900 mb-4">Arus Kas Masuk Terverifikasi</h3>
        <div className="space-y-3">
          {payments.slice(0, 8).map(p => (
            <div key={p.id} className="flex justify-between items-center p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/60 transition-colors">
              <div>
                <p className="font-bold text-sm text-blue-600">{p.number} • <span className="font-normal text-slate-500 text-xs">{formatDate(p.date)}</span></p>
                <p className="text-xs text-slate-600 mt-0.5">{p.note || p.paymentType} ({p.method})</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-black text-emerald-600 text-base">{formatIDR(p.amount)}</span>
                <button 
                  onClick={() => setPrintData({ type: 'receipt', data: p })}
                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200"
                  title="Cetak Kwitansi"
                >
                  <Printer size={16} />
                </button>
              </div>
            </div>
          ))}
          {payments.length === 0 && <p className="text-sm text-slate-400 text-center py-6">Belum ada catatan kas masuk.</p>}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// PRINT TEMPLATES (DENGAN TEMA RESMI A4 / CETAK)
// ==========================================
const PrintTemplate = ({ data, onClose, clients, invoices = [] }) => {
  const docData = data.data;
  const docType = data.type; // 'quotation' | 'invoice' | 'receipt'
  const isInvoice = docType === 'invoice';
  const isReceipt = docType === 'receipt';
  const client = clients.find(c => c.id === docData.clientId);
  const relatedInvoice = isReceipt ? invoices.find(i => i.id === docData.invoiceId) : null;

  // --- TEMPLATE KHUSUS KWITANSI RESMI PEMBAYARAN ---
  if (isReceipt) {
    return (
      <div className="min-h-screen bg-slate-100 py-8 flex flex-col items-center print:bg-white print:py-0">
        <div className="w-full max-w-4xl flex justify-between items-center mb-4 print:hidden px-4">
          <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 rounded-xl shadow-sm font-bold text-slate-700 flex items-center gap-2 hover:bg-slate-50 text-sm">
            <ArrowRight className="rotate-180" size={16} /> Kembali ke Aplikasi
          </button>
          <button onClick={() => window.print()} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm font-bold flex items-center gap-2 text-sm">
            <Printer size={18} /> Cetak / Simpan PDF Kwitansi
          </button>
        </div>

        {/* Kwitansi Resmi Format Formal A4 Landscape / Half A4 */}
        <div className="bg-white shadow-xl print:shadow-none w-full max-w-[22cm] p-10 text-sm text-slate-800 border-t-8 border-slate-900 rounded-lg print:rounded-none">
          {/* Header Kwitansi dengan Logo Resmi */}
          <div className="border-b-2 border-slate-200 pb-3 mb-6">
            <div className="flex justify-between items-center pb-3">
              <div className="flex items-center gap-4">
                <img src="/logo.png" alt="ASA JASA" className="h-14 w-auto object-contain shrink-0" />
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tighter leading-none">ASA JASA</h1>
                  <p className="text-slate-700 font-bold text-xs uppercase tracking-wider mt-1">Solusi Legalitas, Perizinan, Sertifikasi & IT Developer</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="inline-block bg-slate-100 text-slate-900 px-3.5 py-1 rounded-lg font-black tracking-widest text-base border border-slate-300">
                  KWITANSI PEMBAYARAN
                </div>
                <p className="font-bold text-slate-800 mt-1.5 text-sm">No: {docData.number}</p>
                <p className="text-xs text-slate-500">Tanggal: {formatDate(docData.date)}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 space-y-0.5">
              <p className="text-slate-600 font-medium leading-normal">
                Jalan Kelurahan Pondok Rajeg No. 35A, Rt. 05 Rw. 02, Pondok Rajeg, Cibinong Bogor 16914
              </p>
              <p className="text-[11px] text-slate-400 leading-normal">
                Menkumham NOMOR: AHU-050109.AH.01.30.Tahun 2023 &nbsp;|&nbsp; Email: halo@asajasa.id &nbsp;|&nbsp; Telpon: 0851-9611-5669
              </p>
            </div>
          </div>

          {/* Isi Kwitansi */}
          <div className="space-y-4 my-6 text-sm">
            <div className="grid grid-cols-12 items-baseline border-b border-dashed border-slate-300 pb-2.5">
              <div className="col-span-4 text-slate-600 font-bold">Telah Terima Dari</div>
              <div className="col-span-8 font-black text-base text-slate-900">
                : {client?.companyName || '-'} {client?.picName ? `(Up. ${client.picName})` : ''}
              </div>
            </div>

            <div className="grid grid-cols-12 items-baseline border-b border-dashed border-slate-300 pb-2.5">
              <div className="col-span-4 text-slate-600 font-bold">Uang Sejumlah</div>
              <div className="col-span-8">
                <div className="bg-slate-50 border border-slate-300 px-4 py-2 rounded-xl italic font-black text-slate-900">
                  # {terbilang(docData.amount)} Rupiah #
                </div>
              </div>
            </div>

            <div className="grid grid-cols-12 items-baseline border-b border-dashed border-slate-300 pb-2.5">
              <div className="col-span-4 text-slate-600 font-bold">Untuk Pembayaran</div>
              <div className="col-span-8 text-slate-800">
                : <span className="font-black text-slate-900">{docData.note || docData.paymentType}</span>
                <div className="text-xs text-slate-500 pl-2 mt-1">
                  Referensi Invoice: <strong>{relatedInvoice?.number || docData.invoiceNumber || '-'}</strong> 
                  {relatedInvoice && (
                    <span> • Status Tagihan: <strong className="text-slate-900">{relatedInvoice.paymentStatus}</strong> (Total Tagihan: {formatIDR(relatedInvoice.total)})</span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-12 items-baseline border-b border-dashed border-slate-300 pb-2.5">
              <div className="col-span-4 text-slate-600 font-bold">Metode Pembayaran</div>
              <div className="col-span-8 font-bold text-slate-800">: {docData.method}</div>
            </div>
          </div>

          {/* Nominal Diterima & Tanda Tangan */}
          <div className="flex justify-between items-end mt-12 pt-4">
            <div>
              <div className="text-xs font-bold text-slate-500 mb-1">Jumlah Nominal:</div>
              <div className="bg-slate-900 text-white px-7 py-3 rounded-2xl font-black text-2xl tracking-wide shadow-md inline-block">
                {formatIDR(docData.amount)}
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                * Kwitansi ini sah dan diterbitkan secara elektronik oleh sistem manajemen ASA JASA.
              </p>
            </div>

            <div className="text-center pr-6 inline-flex flex-col items-center">
              <p className="text-xs text-slate-600 mb-0.5">Bogor, {formatDate(docData.date)}</p>
              <p className="text-xs font-bold text-slate-700">Penerima / Keuangan ASA JASA</p>
              <div className="h-20 flex items-center justify-center my-1">
                <img 
                  src="/ttd-keuangan.png" 
                  alt="Tanda Tangan Keuangan" 
                  className="h-20 w-auto object-contain mix-blend-multiply" 
                />
              </div>
              <p className="font-bold border-b-2 border-slate-800 inline-block px-6 text-slate-900">Elis Maesaroh</p>
              <p className="text-slate-600 font-medium text-[11px] mt-0.5">Admin Keuangan</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- TEMPLATE SURAT PENAWARAN (QUOTATION) & INVOICE ---
  return (
    <div className="min-h-screen bg-slate-100 py-8 flex flex-col items-center print:bg-white print:py-0">
      <div className="w-full max-w-4xl flex justify-between items-center mb-4 print:hidden px-4">
        <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 rounded-xl shadow-sm font-bold text-slate-700 flex items-center gap-2 hover:bg-slate-50 text-sm">
          <ArrowRight className="rotate-180" size={16} /> Kembali ke Aplikasi
        </button>
        <button onClick={() => window.print()} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm font-bold flex items-center gap-2 text-sm">
          <Printer size={18} /> Cetak / Simpan PDF
        </button>
      </div>

      {/* A4 Printable Page Container */}
      <div className="bg-white shadow-xl print:shadow-none w-full max-w-[21cm] min-h-[29.7cm] p-12 text-sm text-slate-800 rounded-lg print:rounded-none">
        {/* Kop Surat Resmi */}
        <div className="border-b-4 border-slate-900 pb-3 mb-2">
          {/* Baris Atas: Logo & Identitas di Kiri, Judul Dokumen di Kanan */}
          <div className="flex justify-between items-center pb-3">
            <div className="flex items-center gap-4">
              <img src="/logo.png" alt="ASA JASA" className="h-16 w-auto object-contain shrink-0" />
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">ASA JASA</h1>
                <p className="text-blue-700 font-black uppercase text-xs tracking-wider mt-1.5">
                  Solusi Legalitas, Perizinan, Sertifikasi & IT Developer
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-wider">
                {isInvoice ? 'INVOICE' : 'SURAT PENAWARAN'}
              </h2>
              <p className="text-base font-bold text-blue-700 mt-0.5">{docData.number}</p>
              <p className="text-slate-500 text-xs">Tanggal: {formatDate(docData.date)}</p>
              {isInvoice && <p className="text-rose-600 font-bold text-xs mt-0.5">Jatuh Tempo: {formatDate(docData.dueDate)}</p>}
            </div>
          </div>

          {/* Baris Alamat & Kontak: Memanjang Rapi ke Samping Kanan (Tidak Menumpuk di Bawah Tulisan ASA JASA) */}
          <div className="pt-2.5 border-t border-slate-200 text-xs text-slate-500 space-y-1">
            <p className="text-slate-600 font-medium leading-normal">
              Jalan Kelurahan Pondok Rajeg No. 35A, Rt. 05 Rw. 02, Pondok Rajeg, Cibinong Bogor 16914
            </p>
            <p className="text-[11px] text-slate-400 leading-normal">
              Menkumham NOMOR: AHU-050109.AH.01.30.Tahun 2023 &nbsp;|&nbsp; Email: halo@asajasa.id &nbsp;|&nbsp; Telpon: 0851-9611-5669
            </p>
          </div>
        </div>
        {/* Garis Aksen di Bawah Kop */}
        <div className="border-b-2 border-blue-600 mb-6"></div>

        {/* Informasi Klien */}
        <div className="mb-6 flex justify-between">
          <div className="w-2/3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Kepada Yth:</p>
            <p className="font-black text-base text-slate-900">{client?.companyName}</p>
            <p className="text-slate-700 font-semibold text-xs">Up. {client?.picName}</p>
            <p className="text-slate-600 mt-1 max-w-md text-xs">{client?.address || 'Alamat tidak tersedia'}</p>
            <p className="text-slate-600 mt-0.5 text-xs">{client?.phone}</p>
          </div>
        </div>

        {/* Perihal & Kalimat Pembuka (Khusus Surat Penawaran) */}
        {!isInvoice && (
          <div className="mb-6 space-y-3">
            {docData.subject && (
              <div className="font-bold text-slate-900 text-sm">
                Perihal: <span className="underline">{docData.subject}</span>
              </div>
            )}
            <div className="whitespace-pre-line text-slate-700 leading-relaxed text-justify text-xs">
              {docData.openingText || 'Dengan hormat,\nBersama ini kami sampaikan penawaran harga layanan konsultasi sebagai berikut:'}
            </div>
          </div>
        )}

        {/* Tabel Rincian Layanan */}
        <table className="w-full mb-6 border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white text-xs uppercase font-bold tracking-wider">
              <th className="p-3 text-left w-10">No</th>
              <th className="p-3 text-left">Deskripsi Layanan & Lingkup Kerja</th>
              <th className="p-3 text-center w-16">Qty</th>
              <th className="p-3 text-right w-32">Harga Satuan</th>
              <th className="p-3 text-right w-36">Total</th>
            </tr>
          </thead>
          <tbody className="text-xs">
            {docData.items.map((item, idx) => (
              <tr key={idx} className="border-b border-slate-200 align-top">
                <td className="p-3 font-semibold text-slate-600">{idx + 1}</td>
                <td className="p-3">
                  <div className="font-bold text-slate-900 text-sm">{item.name}</div>
                  {item.description && (
                    <div className="text-[11px] text-slate-600 mt-1 whitespace-pre-line leading-relaxed">
                      {item.description}
                    </div>
                  )}
                </td>
                <td className="p-3 text-center font-medium">{item.qty} {item.unit || ''}</td>
                <td className="p-3 text-right font-medium">{formatIDR(item.price)}</td>
                <td className="p-3 text-right font-bold text-slate-900">{formatIDR(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Rekap Total */}
        <div className="flex justify-end mb-6">
          <div className="w-1/2 max-w-sm ml-auto text-xs">
            <div className="flex justify-between py-1.5 font-medium text-slate-600">
              <span>Subtotal</span>
              <span>{formatIDR(docData.subtotal)}</span>
            </div>
            {docData.discount > 0 && (
              <div className="flex justify-between py-1.5 text-rose-600 font-semibold">
                <span>Diskon</span>
                <span>-{formatIDR(docData.discount)}</span>
              </div>
            )}
            <div className="flex justify-between py-2.5 border-t-2 border-slate-900 font-black text-base text-slate-900">
              <span>TOTAL {isInvoice ? 'TAGIHAN' : ''}</span>
              <span>{formatIDR(docData.total)}</span>
            </div>
            {isInvoice && (
              <>
                <div className="flex justify-between py-1.5 text-emerald-600 font-bold">
                  <span>Telah Dibayar</span>
                  <span>{formatIDR(docData.amountPaid || 0)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-t font-black text-rose-600 text-sm">
                  <span>SISA PEMBAYARAN</span>
                  <span>{formatIDR(docData.total - (docData.amountPaid || 0))}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Kalimat Penutup (Khusus Surat Penawaran) */}
        {!isInvoice && docData.closingText && (
          <div className="mb-6 whitespace-pre-line text-slate-700 leading-relaxed text-justify text-xs">
            {docData.closingText}
          </div>
        )}

        {/* Syarat & Rekening Pembayaran */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 mb-10">
          <p className="font-bold mb-1 text-slate-900">Keterangan & Rekening Pembayaran:</p>
          <ul className="list-disc pl-4 space-y-1 text-[11px]">
            <li>Pembayaran ditransfer ke Rekening <strong>Bank Syariah Indonesia (BSI) No.: 7357140123 a.n. PT. Amanah Sejahtera Alhamdulillah</strong>.</li>
            <li>{isInvoice ? 'Invoice ini sah dan berlaku sebagai bukti penagihan resmi.' : 'Harga dan penawaran berlaku 3 hari kerja sejak tanggal surat ini diterbitkan.'}</li>
          </ul>
        </div>

        {/* Kolom Tanda Tangan */}
        <div className="mt-8 flex justify-start px-8 text-xs">
          <div className="text-center inline-flex flex-col items-center">
            <p className="font-semibold text-slate-700">Hormat Kami, ASA JASA</p>
            <div className="h-20 flex items-center justify-center my-1">
              <img 
                src="/ttd-direktur.png" 
                alt="Tanda Tangan Direktur" 
                className="h-20 w-auto object-contain mix-blend-multiply" 
              />
            </div>
            <p className="font-bold border-b border-slate-700 inline-block px-4 text-slate-900">Muhammad Akmal Syarif</p>
            <p className="text-slate-600 font-medium text-[11px] mt-0.5">Direktur</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// REUSABLE UI COMPONENTS (TEMA PROFESIONAL PUTIH)
// ==========================================
const Input = ({ label, name, type = "text", defaultValue, required, placeholder, ...rest }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-1">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <input 
      type={type} 
      name={name} 
      defaultValue={defaultValue} 
      placeholder={placeholder} 
      required={required} 
      className="w-full p-2.5 border border-slate-300 bg-white text-slate-900 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-sm placeholder-slate-400 shadow-xs" 
      {...rest} 
    />
  </div>
);

const Badge = ({ status }) => {
  const colors = {
    'Pending': 'bg-amber-50 text-amber-700 border border-amber-200',
    'Disetujui': 'bg-sky-50 text-sky-700 border border-sky-200',
    'Aktif': 'bg-blue-50 text-blue-700 border border-blue-200',
    'Belum Bayar': 'bg-rose-50 text-rose-700 border border-rose-200',
    'Parsial': 'bg-orange-50 text-orange-700 border border-orange-200',
    'Lunas': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    'Terverifikasi': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    'Persiapan': 'bg-slate-100 text-slate-700 border border-slate-200',
    'Verifikasi Dokumen': 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    'Proses Ajuan': 'bg-purple-50 text-purple-700 border border-purple-200',
    'Proses Audit/Pemeriksaan': 'bg-amber-50 text-amber-700 border border-amber-200',
    'Proses Audit / Pemeriksaan': 'bg-amber-50 text-amber-700 border border-amber-200',
    'Proses Perbaikan Hasil Audit': 'bg-orange-50 text-orange-700 border border-orange-200',
    'Selesai': 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold',
    'Batal': 'bg-rose-50 text-rose-700 border border-rose-200',
  };
  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${colors[status] || 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
      {status}
    </span>
  );
};

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
    <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-slate-900 animate-in fade-in zoom-in-95 duration-150">
      <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50/60">
        <h3 className="text-lg font-black text-slate-900">{title}</h3>
        <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
          <X size={20}/>
        </button>
      </div>
      <div className="p-6 overflow-y-auto text-slate-700">
        {children}
      </div>
    </div>
  </div>
);

const ConfirmModal = ({ title, message, onConfirm, onCancel, confirmText = 'Hapus', confirmColor = 'bg-rose-600 hover:bg-rose-700' }) => (
  <Modal title={title} onClose={onCancel}>
    <p className="text-slate-600 text-sm mb-6 leading-relaxed">{message}</p>
    <div className="flex justify-end gap-2.5">
      <button onClick={onCancel} className="px-4 py-2 border border-slate-200 bg-white rounded-xl text-slate-700 hover:bg-slate-50 text-sm font-medium">Batal</button>
      <button onClick={onConfirm} className={`px-5 py-2 text-white rounded-xl text-sm font-bold shadow-sm ${confirmColor}`}>{confirmText}</button>
    </div>
  </Modal>
);
