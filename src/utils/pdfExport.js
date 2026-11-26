import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Mengonversi elemen DOM ke file PDF berkualitas tinggi dan mengunduhnya langsung.
 * Kompatibel dengan perangkat mobile (Android/iOS) dan desktop.
 *
 * @param {HTMLElement|string} elementOrId - Elemen DOM atau string ID elemen
 * @param {string} filename - Nama file PDF yang akan diunduh
 * @param {Object} options - Pengaturan tambahan (orientation, scale, singlePage)
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

  // Render elemen ke Canvas dengan resolusi tinggi (scale 2 untuk teks tajam)
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

  const imgData = canvas.toDataURL('image/jpeg', 0.96);

  // Jika diminta singlePage (atau dokumen mendekati 1 halaman A4), paskan persis ke 1 halaman
  const isSinglePage = options.singlePage !== undefined 
    ? options.singlePage 
    : (canvasHeight / canvasWidth) <= (pdfHeight / pdfWidth) * 1.25;

  if (isSinglePage) {
    const ratio = Math.min(pdfWidth / canvasWidth, pdfHeight / canvasHeight);
    const finalWidth = canvasWidth * ratio;
    const finalHeight = canvasHeight * ratio;
    const offsetX = (pdfWidth - finalWidth) / 2;
    const offsetY = (pdfHeight - finalHeight) / 2;

    pdf.addImage(imgData, 'JPEG', offsetX, offsetY, finalWidth, finalHeight, undefined, 'FAST');
    pdf.save(filename);
    return;
  }

  // Multi-halaman untuk dokumen sangat panjang jika singlePage: false
  const imgHeight = (canvasHeight * pdfWidth) / canvasWidth;
  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
  heightLeft -= pdfHeight;

  while (heightLeft > 5) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pdfHeight;
  }

  pdf.save(filename);
};
