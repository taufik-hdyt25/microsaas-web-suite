import { api } from '../api.js';
import { showToast } from '../components/toast.js';

export async function handleImageConvert(e) {
  if (e) e.preventDefault();
  const fileInput = document.getElementById('img-file-input');
  if (!fileInput || !fileInput.files[0]) {
    showToast('Pilih gambar yang ingin dikonversi', 'error');
    return;
  }

  const format = document.getElementById('img-target-format')?.value || 'webp';
  const quality = document.getElementById('img-quality')?.value || 80;
  const stripMetadata = document.getElementById('img-strip-exif')?.checked ?? true;
  const grayscale = document.getElementById('img-grayscale')?.checked ?? false;

  const formData = new FormData();
  formData.append('file', fileInput.files[0]);
  formData.append('format', format);
  formData.append('quality', quality);
  formData.append('stripMetadata', stripMetadata);
  formData.append('grayscale', grayscale);

  const status = document.getElementById('img-convert-status');
  if (status) status.innerHTML = '<span class="text-xs text-muted-foreground animate-pulse">Mengonversi dan mengompresi gambar...</span>';

  const btn = document.getElementById('btn-convert-img');
  if (btn) btn.disabled = true;

  try {
    const res = await api.postFormData('/api/media/convert-image', formData);
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted-${Date.now()}.${format}`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    const origSize = res.headers.get('X-Original-Size') || '';
    const convSize = res.headers.get('X-Converted-Size') || '';
    const reduction = res.headers.get('X-Reduction') || '';

    if (status) {
      status.innerHTML = `<span class="badge badge-success">✓ Selesai! Hemat ${reduction} (${origSize} → ${convSize})</span>`;
    }
    showToast(`Gambar berhasil dikonversi ke ${format.toUpperCase()}!`, 'success');
  } catch (err) {
    if (status) status.innerHTML = `<span class="badge badge-destructive">Error: ${err.message}</span>`;
    showToast(err.message || 'Gagal mengonversi gambar', 'error');
  } finally {
    if (btn) btn.disabled = false;
  }
}

export async function handleImagesToPdf(e) {
  if (e) e.preventDefault();
  const fileInput = document.getElementById('images-pdf-input');
  if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
    showToast('Pilih minimal 1 file gambar', 'error');
    return;
  }

  const pageSize = document.getElementById('pdf-page-size')?.value || 'a4';
  const formData = new FormData();
  for (let i = 0; i < fileInput.files.length; i++) {
    formData.append('images', fileInput.files[i]);
  }
  formData.append('pageSize', pageSize);

  const status = document.getElementById('images-pdf-status');
  if (status) status.innerHTML = '<span class="text-xs text-muted-foreground animate-pulse">Menyatukan gambar ke dokumen PDF...</span>';

  const btn = document.getElementById('btn-images-pdf');
  if (btn) btn.disabled = true;

  try {
    const res = await api.postFormData('/api/media/images-to-pdf', formData);
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `images-bundle-${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    const pageCount = res.headers.get('X-Page-Count') || fileInput.files.length;
    if (status) {
      status.innerHTML = `<span class="badge badge-success">✓ Berhasil dibuat (${pageCount} halaman)!</span>`;
    }
    showToast('PDF berhasil dibuat dan didownload!', 'success');
  } catch (err) {
    if (status) status.innerHTML = `<span class="badge badge-destructive">Error: ${err.message}</span>`;
    showToast(err.message || 'Gagal membuat dokumen PDF', 'error');
  } finally {
    if (btn) btn.disabled = false;
  }
}

export async function handleMergePdfs() {
  const input = document.getElementById('pdf-merge-input');
  if (!input || !input.files || input.files.length < 2) {
    showToast('Pilih minimal 2 file PDF untuk digabungkan', 'error');
    return;
  }

  const formData = new FormData();
  for (let i = 0; i < input.files.length; i++) {
    formData.append('pdfs', input.files[i]);
  }

  const status = document.getElementById('pdf-tools-status');
  if (status) status.innerHTML = '<span class="text-xs text-muted-foreground animate-pulse">Menggabungkan file PDF...</span>';

  try {
    const res = await api.postFormData('/api/media/merge-pdfs', formData);
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `merged-${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    const totalPages = res.headers.get('X-Total-Pages') || '';
    if (status) {
      status.innerHTML = `<span class="badge badge-success">✓ Berhasil digabungkan (${totalPages} total halaman)!</span>`;
    }
    showToast('PDF berhasil digabungkan!', 'success');
  } catch (err) {
    if (status) status.innerHTML = `<span class="badge badge-destructive">Error: ${err.message}</span>`;
    showToast(err.message || 'Gagal merge PDF', 'error');
  }
}

export async function handleExtractPdf() {
  const input = document.getElementById('pdf-extract-input');
  if (!input || !input.files || input.files.length === 0) {
    showToast('Pilih file PDF untuk diekstrak', 'error');
    return;
  }

  const formData = new FormData();
  formData.append('file', input.files[0]);

  const status = document.getElementById('pdf-tools-status');
  if (status) status.innerHTML = '<span class="text-xs text-muted-foreground animate-pulse">Mengekstrak teks & metadata...</span>';

  try {
    const res = await api.postFormData('/api/media/extract-pdf-text', formData);
    const data = await res.json();

    if (data.success && data.result) {
      const box = document.getElementById('pdf-text-result-box');
      const pre = document.getElementById('pdf-extracted-pre');
      if (box) box.classList.remove('hidden');
      if (pre) pre.innerText = data.result.text;

      if (status) {
        status.innerHTML = `<span class="badge badge-success">✓ Ekstraksi ${data.result.numPages} halaman sukses!</span>`;
      }
      showToast(`Berhasil mengekstrak ${data.result.numPages} halaman!`, 'success');
    }
  } catch (err) {
    if (status) status.innerHTML = `<span class="badge badge-destructive">Error: ${err.message}</span>`;
    showToast(err.message || 'Gagal ekstraksi teks PDF', 'error');
  }
}
