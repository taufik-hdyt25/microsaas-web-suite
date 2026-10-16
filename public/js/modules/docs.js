import { showToast } from '../components/toast.js';

export function copySnippet(elementId, label = 'Kode') {
  const elem = document.getElementById(elementId);
  if (!elem) return;

  const text = elem.innerText || elem.textContent;
  navigator.clipboard.writeText(text).then(() => {
    showToast(`${label} berhasil disalin ke clipboard!`, 'success');
  }).catch(() => {
    showToast('Gagal menyalin teks ke clipboard', 'error');
  });
}
