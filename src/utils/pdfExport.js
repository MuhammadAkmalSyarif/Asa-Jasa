import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Mengonversi elemen DOM ke file PDF berkualitas tinggi dan mengunduhnya langsung.
 * Kompatibel dengan perangkat mobile (Android/iOS) dan desktop.
 *
 * @param {HTMLElement|string} elementOrId - Elemen DOM atau string ID elemen
 * @param {string} filename - Nama file PDF yang akan diunduh
 * @param {Object} options - Pengaturan tambahan (orientation, scale)
 */
export const exportElementToPdf = async (elementOrId, filename = 'dokumen.pdf', options = {}) => {
  const element = typeof elementOrId === 'string' 
    ? document.getElementById(elementOrId) 
    : elementOrId;

  if (!element) {
    throw new Error('Elemen dokumen tidak ditemukan untuk pembuatan PDF');
  }

  // Opsi orientasi: 'p' (portrait) atau 'l' (landscape)
  const orientation = options.orientation || 'p';

  // Render elemen ke Canvas dengan resolusi tinggi (scale 2 untuk hasil teks tajam)
  const canvas = await html2canvas(element, {
    scale: options.scale || 2,
    useCORS: true,
    allowTaint: true,
    logging: false,
    backgroundColor: '#ffffff',
    scrollX: 0,
    scrollY: 0,
    windowWidth: 1024 // Simulasikan viewport desktop agar tidak terdistorsi di layar HP
  });

  // Buat dokumen PDF A4
  const pdf = new jsPDF({
    orientation: orientation,
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;

  // Hitung rasio tinggi gambar di PDF
  const imgHeight = (canvasHeight * pdfWidth) / canvasWidth;
  const imgData = canvas.toDataURL('image/jpeg', 0.95);

  let heightLeft = imgHeight;
  let position = 0;

  // Halaman pertama
  pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
  heightLeft -= pdfHeight;

  // Dukungan multi-halaman jika dokumen panjang (misal Surat Penawaran dengan banyak item)
  while (heightLeft > 5) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pdfHeight;
  }

  // Simpan/Unduh file PDF langsung ke perangkat user
  pdf.save(filename);
};
