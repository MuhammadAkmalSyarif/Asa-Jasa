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
  if (isNaN(d.getTime())) return dateString;
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
  if (angka === 0) return 'Nol';

  const baca = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];

  const convert = (n) => {
    if (n < 12) {
      return baca[n];
    } else if (n < 20) {
      return convert(n - 10) + ' Belas';
    } else if (n < 100) {
      const sisa = n % 10;
      return convert(Math.floor(n / 10)) + ' Puluh' + (sisa ? ' ' + convert(sisa) : '');
    } else if (n < 200) {
      const sisa = n - 100;
      return 'Seratus' + (sisa ? ' ' + convert(sisa) : '');
    } else if (n < 1000) {
      const sisa = n % 100;
      return convert(Math.floor(n / 100)) + ' Ratus' + (sisa ? ' ' + convert(sisa) : '');
    } else if (n < 2000) {
      const sisa = n - 1000;
      return 'Seribu' + (sisa ? ' ' + convert(sisa) : '');
    } else if (n < 1000000) {
      const sisa = n % 1000;
      return convert(Math.floor(n / 1000)) + ' Ribu' + (sisa ? ' ' + convert(sisa) : '');
    } else if (n < 1000000000) {
      const sisa = n % 1000000;
      return convert(Math.floor(n / 1000000)) + ' Juta' + (sisa ? ' ' + convert(sisa) : '');
    } else if (n < 1000000000000) {
      const sisa = n % 1000000000;
      return convert(Math.floor(n / 1000000000)) + ' Milyar' + (sisa ? ' ' + convert(sisa) : '');
    } else {
      const sisa = n % 1000000000000;
      return convert(Math.floor(n / 1000000000000)) + ' Triliun' + (sisa ? ' ' + convert(sisa) : '');
    }
  };

  return convert(angka).trim();
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
