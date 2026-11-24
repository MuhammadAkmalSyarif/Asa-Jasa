import { 
  initialClients, 
  initialServices, 
  initialQuotations, 
  initialInvoices, 
  initialPayments, 
  initialProjects 
} from './mockData';

// --- UTILITIES ---
export const formatIDR = (value) => 
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value || 0);

export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const d = new Date(dateString);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export const generateNumber = (prefix) => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const rand = Math.floor(Math.random() * 9000 + 1000).toString();
  return `${prefix}-${year}${month}-${rand}`;
};

// Fungsi Terbilang Bahasa Indonesia untuk Kwitansi Resmi
export const terbilang = (nilai) => {
  const angka = Math.abs(Math.floor(nilai || 0));
  const baca = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];
  let hasil = '';
  if (angka < 12) {
    hasil = ' ' + baca[angka];
  } else if (angka < 20) {
    hasil = terbilang(angka - 10) + ' Belas';
  } else if (angka < 100) {
    hasil = terbilang(Math.floor(angka / 10)) + ' Puluh' + terbilang(angka % 10);
  } else if (angka < 200) {
    hasil = ' Seratus' + terbilang(angka - 100);
  } else if (angka < 1000) {
    hasil = terbilang(Math.floor(angka / 100)) + ' Ratus' + terbilang(angka % 100);
  } else if (angka < 2000) {
    hasil = ' Seribu' + terbilang(angka - 1000);
  } else if (angka < 1000000) {
    hasil = terbilang(Math.floor(angka / 1000)) + ' Ribu' + terbilang(angka % 1000);
  } else if (angka < 1000000000) {
    hasil = terbilang(Math.floor(angka / 1000000)) + ' Juta' + terbilang(angka % 1000000);
  } else if (angka < 1000000000000) {
    hasil = terbilang(Math.floor(angka / 1000000000)) + ' Milyar' + terbilang(angka % 1000000000);
  } else {
    hasil = terbilang(Math.floor(angka / 1000000000000)) + ' Triliun' + terbilang(angka % 1000000000000);
  }
  return hasil.trim();
};

// --- STORAGE MANAGER ---
const STORAGE_PREFIX = 'asajasa_';

export const loadInitialData = (key, fallback) => {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Sinkronisasi tanggal surat penawaran contoh agar sesuai tanggal pembuatan saat ini
      if (key === 'quotations' && Array.isArray(parsed)) {
        return parsed.map(q => {
          if (q.date === '2026-11-10' || q.date === '2026-11-20') {
            return { ...q, date: new Date().toISOString().split('T')[0] };
          }
          return q;
        });
      }
      return parsed;
    }
  } catch (err) {
    console.error(`Failed to load ${key} from localStorage:`, err);
  }
  // Store fallback into localStorage
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(fallback));
  } catch (e) {
    console.warn('LocalStorage save failed:', e);
  }
  return fallback;
};

export const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(data));
  } catch (err) {
    console.error(`Failed to save ${key} to localStorage:`, err);
  }
};

export const exportAllData = () => {
  const keys = ['clients', 'services', 'quotations', 'invoices', 'payments', 'projects'];
  const dump = {};
  keys.forEach(k => {
    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${k}`);
      dump[k] = raw ? JSON.parse(raw) : [];
    } catch {
      dump[k] = [];
    }
  });
  
  const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `backup_asajasa_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const resetAllData = () => {
  localStorage.setItem(`${STORAGE_PREFIX}clients`, JSON.stringify(initialClients));
  localStorage.setItem(`${STORAGE_PREFIX}services`, JSON.stringify(initialServices));
  localStorage.setItem(`${STORAGE_PREFIX}quotations`, JSON.stringify(initialQuotations));
  localStorage.setItem(`${STORAGE_PREFIX}invoices`, JSON.stringify(initialInvoices));
  localStorage.setItem(`${STORAGE_PREFIX}payments`, JSON.stringify(initialPayments));
  localStorage.setItem(`${STORAGE_PREFIX}projects`, JSON.stringify(initialProjects));
  return {
    clients: initialClients,
    services: initialServices,
    quotations: initialQuotations,
    invoices: initialInvoices,
    payments: initialPayments,
    projects: initialProjects
  };
};
