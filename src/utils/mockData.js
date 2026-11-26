// Initial sample data for ASA JASA Management System
export const initialClients = [
  {
    id: "cl-1",
    companyName: "PT Berkah Mandiri Pangan",
    picName: "Haji Ahmad Syafii",
    phone: "081288991234",
    email: "ahmad@berkahpangan.co.id",
    nib: "9120003412991",
    businessCategory: "Food & Beverage (F&B)",
    address: "Kawasan Industri Sentul, Blok B3 No. 12, Bogor, Jawa Barat",
    createdAt: Date.now() - 30 * 86400000
  },
  {
    id: "cl-2",
    companyName: "CV Nusantara Rasa Alami",
    picName: "Ibu Ratna Dewi",
    phone: "085712345678",
    email: "ratna.dewi@nusantararasa.com",
    nib: "0220108923412",
    businessCategory: "Makanan Olahan & Bumbu",
    address: "Jl. Pajajaran No. 45, Baranangsiang, Kota Bogor",
    createdAt: Date.now() - 20 * 86400000
  },
  {
    id: "cl-3",
    companyName: "PT Derma Herbal Aesthetic",
    picName: "dr. Kevin Pratama",
    phone: "081399887766",
    email: "legal@dermaherbal.id",
    nib: "1240005612344",
    businessCategory: "Kosmetik & Skincare",
    address: "Ruko Cibinong City Center Blok C-08, Cibinong, Kab. Bogor",
    createdAt: Date.now() - 10 * 86400000
  }
];

export const initialServices = [
  {
    id: "srv-1",
    name: "Pendampingan Sertifikasi Halal Reguler (BPJPH & LPH)",
    category: "Sertifikasi Halal",
    price: 4500000,
    unit: "Paket",
    description: "Pendampingan penyusunan Manual SJPH (Sistem Jaminan Produk Halal), audit internal, pendaftaran di SIHALAL BPJPH, koordinasi LPH, dan pengawalan hingga terbit Sertifikat Halal MUI/BPJPH."
  },
  {
    id: "srv-2",
    name: "Pendaftaran & Pemutakhiran NIB OSS RBA (Resiko Rendah - Tinggi)",
    category: "Perizinan Usaha (NIB)",
    price: 1500000,
    unit: "Paket Usaha",
    description: "Pengurusan pembuatan/perubahan Nomor Induk Berusaha (NIB) berbasis risiko melalui OSS RBA, penyesuaian KBLI 2020, izin dasar KKPR/PKKPR, SPPL, dan persetujuan lingkungan."
  },
  {
    id: "srv-3",
    name: "Pengurusan Izin Edar BPOM MD (Pangan Olahan Dalam Negeri)",
    category: "Izin Edar (BPOM/PIRT)",
    price: 8500000,
    unit: "Produk/Kategori",
    description: "Pendampingan sertifikasi Cara Produksi Pangan Olahan yang Baik (CPPOB), audit sarana oleh Balai POM, verifikasi komposisi label pangan, dan pendaftaran e-BPOM hingga izin edar MD terbit."
  },
  {
    id: "srv-4",
    name: "Sertifikasi SPP-PIRT & Penyuluhan Keamanan Pangan (PKP)",
    category: "Izin Edar (BPOM/PIRT)",
    price: 2000000,
    unit: "Paket",
    description: "Fasilitasi pelatihan sertifikat PKP Dinkes, pemeriksaan sarana IRTP (audit higienitas), dan pengajuan sertifikat SPP-PIRT melalui OSS."
  },
  {
    id: "srv-5",
    name: "Konsultasi & Sertifikasi ISO 9001:2015 (Sistem Manajemen Mutu)",
    category: "Sistem Manajemen (ISO/HACCP)",
    price: 12500000,
    unit: "Perusahaan",
    description: "Gap analysis, penyusunan SOP dan dokumen mutu, pelatihan awareness ISO, simulasi internal audit, dan pendampingan audit sertifikasi oleh Badan Sertifikasi Akreditasi KAN."
  },
  {
    id: "srv-6",
    name: "Konsultasi Legalitas & Legal Opinion Pendirian Usaha",
    category: "Konsultasi",
    price: 2500000,
    unit: "Sesi / Dokumen",
    description: "Review legalitas badan hukum PT/CV, kajian izin operasional daerah, kesesuaian tata ruang (RDTR), dan konsultasi kepatuhan regulasi bisnis di Indonesia."
  },
  {
    id: "srv-7",
    name: "Web Development",
    category: "Web Development",
    price: 3500000,
    unit: "Paket Website",
    description: "Pengembangan website profil perusahaan / landing page modern & responsif (mobile friendly), optimasi SEO Google, integrasi tombol WhatsApp / form kontak, domain & hosting, serta panduan pengelolaan CMS."
  }
];

export const initialQuotations = [
  {
    id: "qtn-1",
    number: "QTN-202611-0012",
    date: new Date().toISOString().split('T')[0],
    clientId: "cl-1",
    subject: "Penawaran Pendampingan Sertifikasi Halal BPJPH & Izin BPOM MD",
    openingText: "Dengan hormat,\n\nBersama surat ini kami dari ASA JASA bermaksud mengajukan penawaran harga jasa konsultasi dan pendampingan perizinan/sertifikasi usaha sesuai dengan kebutuhan perusahaan Bapak/Ibu, dengan rincian sebagai berikut:",
    closingText: "Demikian surat penawaran ini kami sampaikan. Besar harapan kami dapat bekerja sama dengan perusahaan Bapak/Ibu. Atas perhatian dan kerja samanya kami ucapkan terima kasih.",
    items: [
      {
        serviceId: "srv-1",
        name: "Pendampingan Sertifikasi Halal Reguler (BPJPH & LPH)",
        description: "Pendampingan penyusunan Manual SJPH, pendaftaran SIHALAL, koordinasi LPH, dan pengawalan sidang fatwa.",
        unit: "Paket",
        price: 4500000,
        qty: 1,
        total: 4500000
      },
      {
        serviceId: "srv-3",
        name: "Pengurusan Izin Edar BPOM MD (Pangan Olahan Dalam Negeri)",
        description: "Pendampingan sertifikasi CPPOB, uji lab gizi, dan pendaftaran izin edar MD 2 varian rasa.",
        unit: "Produk/Kategori",
        price: 8500000,
        qty: 1,
        total: 8500000
      }
    ],
    subtotal: 13000000,
    discount: 1000000,
    total: 12000000,
    status: "Disetujui",
    createdAt: Date.now() - 14 * 86400000
  },
  {
    id: "qtn-2",
    number: "QTN-202611-0025",
    date: new Date().toISOString().split('T')[0],
    clientId: "cl-2",
    subject: "Penawaran Sertifikasi Halal & Fasilitasi NIB OSS RBA",
    openingText: "Dengan hormat,\n\nBersama surat ini kami dari ASA JASA bermaksud mengajukan penawaran harga jasa pendampingan legalitas dan perizinan usaha dengan rincian rincian pekerjaan sebagai berikut:",
    closingText: "Demikian surat penawaran ini kami sampaikan. Kami siap membantu kelancaran perizinan usaha Bapak/Ibu.",
    items: [
      {
        serviceId: "srv-1",
        name: "Pendampingan Sertifikasi Halal Reguler (BPJPH & LPH)",
        description: "Penyusunan SJPH, audit bahan baku, koordinasi auditor halal.",
        unit: "Paket",
        price: 4500000,
        qty: 1,
        total: 4500000
      },
      {
        serviceId: "srv-2",
        name: "Pendaftaran & Pemutakhiran NIB OSS RBA",
        description: "Penambahan KBLI industri bumbu masak dan izin dasar SPPL.",
        unit: "Paket Usaha",
        price: 1500000,
        qty: 1,
        total: 1500000
      }
    ],
    subtotal: 6000000,
    discount: 500000,
    total: 5500000,
    status: "Pending",
    createdAt: Date.now() - 4 * 86400000
  }
];

export const initialInvoices = [
  {
    id: "inv-1",
    number: "INV-202611-0008",
    quotationId: "qtn-1",
    clientId: "cl-1",
    date: "2026-11-12",
    dueDate: "2026-11-26",
    items: [
      {
        serviceId: "srv-1",
        name: "Pendampingan Sertifikasi Halal Reguler (BPJPH & LPH)",
        description: "Penyusunan SJPH & SIHALAL",
        unit: "Paket",
        price: 4500000,
        qty: 1,
        total: 4500000
      },
      {
        serviceId: "srv-3",
        name: "Pengurusan Izin Edar BPOM MD (Pangan Olahan Dalam Negeri)",
        description: "Audit CPPOB & pendaftaran e-BPOM",
        unit: "Produk/Kategori",
        price: 8500000,
        qty: 1,
        total: 8500000
      }
    ],
    subtotal: 13000000,
    discount: 1000000,
    total: 12000000,
    amountPaid: 6000000,
    paymentStatus: "Parsial",
    status: "Aktif",
    createdAt: Date.now() - 12 * 86400000
  }
];

export const initialPayments = [
  {
    id: "pay-1",
    number: "KWT-202611-0004",
    invoiceId: "inv-1",
    invoiceNumber: "INV-202611-0008",
    clientId: "cl-1",
    amount: 6000000,
    method: "Transfer Bank",
    paymentType: "Pembayaran Parsial / DP",
    note: "Pembayaran Uang Muka (DP 50%) Pendampingan Halal & BPOM MD",
    date: "2026-11-13",
    status: "Terverifikasi",
    createdAt: Date.now() - 11 * 86400000
  }
];

export const initialProjects = [
  {
    id: "prj-1",
    name: "Proyek: Sertifikasi Halal & Izin Edar BPOM MD",
    clientId: "cl-1",
    quotationId: "qtn-1",
    status: "Verifikasi Dokumen",
    startDate: "2026-11-12",
    createdAt: Date.now() - 12 * 86400000
  },
  {
    id: "prj-2",
    name: "Proyek: Pendaftaran Izin SPP-PIRT Bumbu Alami",
    clientId: "cl-2",
    status: "Proses Audit/Pemeriksaan",
    startDate: "2026-10-25",
    createdAt: Date.now() - 25 * 86400000
  }
];
