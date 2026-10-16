import { initTheme, toggleTheme } from './components/theme.js';
import { showToast } from './components/toast.js';
import * as ats from './modules/ats.js';
import * as media from './modules/media.js';
import * as docs from './modules/docs.js';

// Top-level tab switching
export function switchTab(tab) {
  const tabs = ['ats', 'media', 'api'];
  tabs.forEach(t => {
    const content = document.getElementById(`tab-content-${t}`);
    const btn = document.getElementById(`tab-btn-${t}`);
    if (content) content.classList.add('hidden');
    if (btn) btn.classList.remove('active');
  });

  const activeContent = document.getElementById(`tab-content-${tab}`);
  const activeBtn = document.getElementById(`tab-btn-${tab}`);
  if (activeContent) activeContent.classList.remove('hidden');
  if (activeBtn) activeBtn.classList.add('active');

  if (window.lucide) window.lucide.createIcons();
}

// Expose functions globally to window so HTML event handlers work seamlessly
window.switchTab = switchTab;
window.toggleTheme = toggleTheme;
window.showToast = showToast;

// ATS
window.switchAtsSub = ats.switchAtsSub;
window.loadSampleResume = ats.loadSampleResume;
window.runAtsAudit = ats.runAtsAudit;
window.loadSampleJobDescription = ats.loadSampleJobDescription;
window.runJobMatch = ats.runJobMatch;
window.optimizeBullet = ats.optimizeBullet;
window.generateResumeFormats = ats.generateResumeFormats;
window.setGenView = ats.setGenView;

// Media
window.handleImageConvert = media.handleImageConvert;
window.handleImagesToPdf = media.handleImagesToPdf;
window.handleMergePdfs = media.handleMergePdfs;
window.handleExtractPdf = media.handleExtractPdf;

// Docs
window.copySnippet = docs.copySnippet;
window.copyText = (id) => docs.copySnippet(id, 'Teks');
window.copyCode = (id) => docs.copySnippet(id, 'Kode');

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  if (window.lucide) window.lucide.createIcons();
  await ats.fetchSampleData();
});
