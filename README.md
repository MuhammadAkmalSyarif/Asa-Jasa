# ASA JASA - Management System
**Sistem Informasi Manajemen Terpadu Konsultan Legalitas Usaha & Sertifikasi Halal**

Website sistem manajemen profesional yang dirancang khusus untuk operasional **ASA JASA** (Konsultan Perizinan, Sertifikasi Halal BPJPH/MUI, Izin Edar BPOM/PIRT, NIB OSS RBA, dan Sistem Manajemen ISO/HACCP).

---

## 🚀 Fitur Utama

1. **Dashboard Eksekutif**
   - KPI metrics: Total Klien, Proyek Aktif Berjalan, Tagihan Belum Lunas, dan Total Kas Masuk (Lunas).
   - Daftar Proyek Berjalan Terbaru dengan status tahapan.
   - Daftar Surat Penawaran Pending yang siap ditindaklanjuti.
   - Quick action shortcuts untuk membuat penawaran baru dan menambah klien.

2. **Data Klien & Mitra (Master Data)**
   - Manajemen data klien (Nama Perusahaan, Pemilik/PIC, WhatsApp, Email, NIB, Kategori Usaha, Alamat Lengkap).
   - Pencarian cepat dan filter interaktif.
   - CRUD lengkap (Tambah, Edit, Hapus) dengan konfirmasi modal.

3. **Katalog Layanan & Tarif (Master Data)**
   - Daftar tarif layanan resmi dengan kategori (Sertifikasi Halal, Perizinan Usaha NIB, Izin Edar BPOM/PIRT, ISO/HACCP, Konsultasi).
   - Deskripsi lengkap ruang lingkup pekerjaan yang otomatis terintegrasi saat membuat Surat Penawaran.

4. **Surat Penawaran / Quotation (Administrasi)**
   - Pembuatan surat penawaran harga resmi dengan nomor otomatis (`QTN-YYYYMM-XXXX`).
   - Kustomisasi kalimat pembuka surat (di atas tabel) dan kalimat penutup surat (di bawah tabel).
   - Pemilihan layanan dari katalog layanan: harga, deskripsi, dan satuan otomatis terisi dan dapat disesuaikan.
   - Perhitungan otomatis Subtotal, Diskon (Rp), dan Total Penawaran.
   - **Fitur "Setujui & Buat Invoice Otomatis"**: saat klien menyetujui penawaran, sistem otomatis membuat Invoice baru dengan jatuh tempo 14 hari serta memulai Proyek baru di tahap Persiapan.
   - Format cetak A4 siap print / save to PDF dengan kop surat resmi dan kolom tanda tangan.

5. **Invoice & Penagihan (Administrasi)**
   - Daftar invoice dengan status: *Belum Bayar*, *Parsial (DP)*, dan *Lunas*.
   - Pelacakan jatuh tempo pembayaran, total tagihan, jumlah terbayar, dan sisa pembayaran.
   - **Pencatatan Pembayaran Parsial / Penuh**: mendukung pembayaran bertahap (termin/DP) dengan berbagai metode (Transfer Bank, Tunai, QRIS, Virtual Account).
   - Otomatis menerbitkan **Kwitansi Resmi** saat pembayaran dicatat.

6. **Riwayat Pembayaran & Kwitansi Resmi (Keuangan)**
   - Arsip seluruh kas masuk dengan nomor resmi (`KWT-YYYYMM-XXXX`).
   - Format Kwitansi Resmi standar Indonesia dengan fungsi **Terbilang Rupiah Otomatis** (misal: *# Dua Belas Juta Rupiah #*).
   - Format cetak kwitansi rapi siap print / save to PDF.

7. **Monitoring & Progress Proyek (Operasional)**
   - Pelacakan tahapan pengurusan izin:
     * *Persiapan*
     * *Pengumpulan Dokumen*
     * *Verifikasi Dokumen*
     * *Pengajuan SIHALAL / Perizinan*
     * *Proses Audit / Pemeriksaan*
     * *Sidang Fatwa / Evaluasi*
     * *Sertifikat Terbit*
     * *Selesai*
   - Pembaruan tahapan langsung via dropdown atau pembuatan proyek manual.

8. **Laporan & Ringkasan Keuangan (Keuangan)**
   - Rekapitulasi Total Tagihan (Invoiced), Total Kas Masuk (Cash In), dan Total Piutang (Receivables).
   - Riwayat arus kas masuk terverifikasi.

9. **Penyimpanan & Pencadangan Data (Local-First Persistence)**
   - Data tersimpan otomatis dan persisten di browser (LocalStorage).
   - Tombol **"Cadangkan Data" (Backup JSON)** untuk mengunduh seluruh data aplikasi.
   - Tombol **"Reset Data Contoh"** untuk mengembalikan data awal simulasi kapan saja.

---

## 🛠️ Panduan Menjalankan Proyek

### 1. Prasyarat
- Node.js (versi 18 ke atas)
- npm

### 2. Jalankan Mode Pengembangan (Dev Server)
Buka terminal di folder `c:\Project Asa Jasa`, lalu jalankan:
```bash
npm run dev
```
Buka browser pada alamat yang ditampilkan (default: `http://localhost:3000`).

### 3. Build untuk Produksi
Untuk menghasilkan file statis yang siap di-upload ke server / hosting:
```bash
npm run build
```
File hasil build akan berada di dalam folder `dist/`.

---

## 📁 Struktur Direktori
```text
Project Asa Jasa/
├── index.html              # HTML template dengan font Plus Jakarta Sans
├── package.json            # Dependensi React, Lucide-React, Tailwind CSS, Vite
├── vite.config.js          # Konfigurasi Vite & dev server
├── tailwind.config.js      # Konfigurasi tema dan warna ungu khas ASA JASA
├── postcss.config.js       # Konfigurasi PostCSS untuk Tailwind CSS
├── public/
│   └── logo.svg            # Favicon & logo SVG ASA JASA
├── src/
│   ├── main.jsx            # Entry point React
│   ├── App.jsx             # Aplikasi lengkap ASA JASA Management System
│   ├── index.css           # Styling dasar & optimasi print (@media print)
│   └── utils/
│       ├── mockData.js     # Data sampel awal (Klien, Layanan, Quotation, Invoice, Proyek, Kwitansi)
│       └── storage.js      # Storage manager, terbilang Rupiah, format IDR, ekspor JSON
└── dist/                   # File siap produksi hasil build
```
