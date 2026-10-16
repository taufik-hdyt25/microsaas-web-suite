import { api } from '../api.js';
import { showToast } from '../components/toast.js';

export const atsState = {
  sampleData: null,
  currentFormats: null
};

export async function fetchSampleData() {
  try {
    const data = await api.get('/api/ats/sample');
    atsState.sampleData = data;
    return data;
  } catch (err) {
    console.error('Failed to load sample ATS data', err);
  }
}

export function switchAtsSub(sub) {
  const tabs = ['audit', 'match', 'star', 'generate'];
  tabs.forEach(s => {
    const pane = document.getElementById(`ats-pane-${s}`);
    const btn = document.getElementById(`ats-sub-${s}`);
    if (pane) pane.classList.add('hidden');
    if (btn) {
      btn.classList.remove('active');
    }
  });

  const activePane = document.getElementById(`ats-pane-${sub}`);
  const activeBtn = document.getElementById(`ats-sub-${sub}`);
  if (activePane) activePane.classList.remove('hidden');
  if (activeBtn) activeBtn.classList.add('active');

  if (window.lucide) window.lucide.createIcons();
}

export function loadSampleResume(type) {
  const textarea = document.getElementById('resume-input-text');
  if (!textarea) return;

  if (type === 'good') {
    textarea.value = `Alex Pratama
Email: alex.pratama@techcorp.io | Phone: +62 812 3456 7890 | Location: Jakarta, Indonesia
LinkedIn: linkedin.com/in/alexpratama | GitHub: github.com/alexpratama

PROFESSIONAL SUMMARY
Results-driven Senior Full Stack Engineer with 7+ years of experience architecting resilient cloud systems and high-throughput microservices. Spearheaded AI workflow integrations reducing operational turnaround by 45%. Proven track record scaling platforms from 50k to 2M+ active users.

CORE SKILLS
- Languages: TypeScript, JavaScript, Go, Python, SQL
- Technologies: React, Next.js, Node.js, Express, Docker, Kubernetes, PostgreSQL, Redis, AWS, CI/CD

PROFESSIONAL EXPERIENCE
Lead Software Engineer | Unicorn FinTech Indonesia (2022 - Present)
- Architected distributed real-time settlement engine processing $12M+ monthly GMV with 99.99% uptime.
- Automated payment reconciliation pipeline, slashing error resolution from 4 hours to under 3 minutes.
- Mentored squad of 8 engineers and introduced automated testing standards increasing code coverage from 62% to 91%.

Senior Backend Engineer | Nexus Cloud Solutions (2019 - 2021)
- Optimized query performance on PostgreSQL cluster, decreasing p99 latency by 68% across 15M records.
- Engineered asynchronous event processing workers using Redis streams, saving 35% server memory overhead.
- Designed and deployed enterprise REST and GraphQL APIs serving 40+ external corporate clients.

EDUCATION
Bachelor of Science in Informatics Engineering
Institut Teknologi Bandung (ITB) | GPA: 3.84 / 4.00`;
    showToast('Contoh resume Grade A+ berhasil dimuat', 'success');
  } else {
    textarea.value = `Curriculum Vitae
Nama: Budi
Alamat: Jakarta
Email: budi123@yahoo.com

Tentang Saya:
Saya orangnya pekerja keras dan bertanggung jawab. Siap bekerja di perusahaan bapak/ibu.

Pengalaman:
- Responsible for fixing bugs
- Worked on website feature
- Helped team with tasks
- Participated in daily meetings`;
    showToast('Contoh draf resume standar dimuat', 'info');
  }
}

export async function runAtsAudit() {
  const textarea = document.getElementById('resume-input-text');
  const text = textarea ? textarea.value.trim() : '';

  if (!text) {
    showToast('Harap masukkan teks resume terlebih dahulu', 'error');
    return;
  }

  const btn = document.getElementById('btn-run-audit');
  const originalHtml = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i><span>Menganalisis Algoritma ATS...</span>';
    if (window.lucide) window.lucide.createIcons();
  }

  try {
    const data = await api.postJson('/api/ats/review', { text });
    if (data.success && data.result) {
      renderAuditResult(data.result);
      showToast('Audit ATS 100-poin berhasil diselesaikan!', 'success');
    }
  } catch (err) {
    showToast(err.message || 'Gagal menjalankan audit ATS', 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalHtml;
      if (window.lucide) window.lucide.createIcons();
    }
  }
}

function renderAuditResult(result) {
  const emptyState = document.getElementById('audit-empty-state');
  const resultsContent = document.getElementById('audit-results-content');
  if (emptyState) emptyState.classList.add('hidden');
  if (resultsContent) resultsContent.classList.remove('hidden');

  // Overall Score
  const scoreNum = document.getElementById('audit-score-num');
  if (scoreNum) scoreNum.innerText = result.overallScore;

  const gradeBadge = document.getElementById('audit-grade-badge');
  const scoreBox = document.getElementById('score-box-color');
  const gradeTitle = document.getElementById('audit-grade-title');
  const summaryText = document.getElementById('audit-summary-text');

  if (gradeBadge) {
    gradeBadge.classList.remove('hidden');
    gradeBadge.innerText = `Grade ${result.grade}`;
  }

  let badgeColor = 'badge-success';
  let boxBg = 'bg-emerald-600 text-white dark:bg-emerald-500';

  if (result.overallScore >= 85) {
    badgeColor = 'badge-success';
    boxBg = 'bg-emerald-600 text-white dark:bg-emerald-500';
  } else if (result.overallScore >= 70) {
    badgeColor = 'badge-secondary';
    boxBg = 'bg-sky-600 text-white dark:bg-sky-500';
  } else if (result.overallScore >= 50) {
    badgeColor = 'badge-warning';
    boxBg = 'bg-amber-500 text-white dark:bg-amber-600';
  } else {
    badgeColor = 'badge-destructive';
    boxBg = 'bg-rose-600 text-white dark:bg-rose-500';
  }

  if (scoreBox) {
    scoreBox.className = `w-20 h-20 sm:w-24 sm:h-24 rounded-xl flex flex-col items-center justify-center font-extrabold shadow-sm shrink-0 ${boxBg}`;
  }

  if (gradeBadge) {
    gradeBadge.className = `badge ${badgeColor} font-semibold`;
  }

  if (gradeTitle) gradeTitle.innerText = `Evaluasi: Grade ${result.grade}`;
  if (summaryText) summaryText.innerText = `Skor ATS ${result.overallScore}/100. Analisis kompatibilitas Workday, Taleo & Greenhouse.`;

  // Rubric breakdown
  const rubricGrid = document.getElementById('rubric-grid');
  if (rubricGrid && result.breakdown) {
    const b = result.breakdown;
    const formatScore = (item) => typeof item === 'object' ? `${item.score} / ${item.max}` : `${item || 0}`;

    const items = [
      { label: 'Kelengkapan Kontak', val: formatScore(b.contactCompleteness || b.contactScore) },
      { label: 'Bagian Wajib (Sections)', val: formatScore(b.sectionsCompleteness || b.sectionsScore) },
      { label: 'Power Verbs (Kata Kerja)', val: formatScore(b.actionVerbsStrength || b.actionVerbsScore) },
      { label: 'Dampak & Metrik Terukur', val: formatScore(b.quantifiableImpact || b.quantifiableMetricsScore) },
      { label: 'Format & Red Flags ATS', val: formatScore(b.atsFormattingSafety || b.formattingScore), span: true }
    ];

    rubricGrid.innerHTML = items.map(item => `
      <div class="p-3 rounded-lg border border-border bg-muted/40 ${item.span ? 'col-span-1 sm:col-span-2' : ''}">
        <span class="text-xs text-muted-foreground block mb-0.5">${item.label}</span>
        <span class="text-sm font-semibold text-foreground">${item.val}</span>
      </div>
    `).join('');
  }

  // Recommendations
  const sugList = document.getElementById('audit-suggestions-list');
  if (sugList) {
    sugList.innerHTML = '';
    const recs = result.actionableRecommendations || result.recommendations || [];
    if (recs.length > 0) {
      recs.forEach(r => {
        const li = document.createElement('li');
        li.className = 'flex items-start gap-2 text-xs text-muted-foreground leading-relaxed';
        li.innerHTML = `<i data-lucide="check" class="w-3.5 h-3.5 text-sky-500 shrink-0 mt-0.5"></i><span>${r}</span>`;
        sugList.appendChild(li);
      });
    } else {
      sugList.innerHTML = '<li class="text-xs text-emerald-500 font-medium flex items-center gap-1.5"><i data-lucide="check-circle" class="w-3.5 h-3.5"></i> Resume Anda telah memenuhi standar lolos ATS secara optimal!</li>';
    }
  }

  if (window.lucide) window.lucide.createIcons();
}

export function loadSampleJobDescription() {
  if (atsState.sampleData) {
    const jdInput = document.getElementById('jd-input-text');
    if (jdInput) jdInput.value = atsState.sampleData.sampleJobDescription;
  }
  const matchResume = document.getElementById('match-resume-text');
  if (matchResume && !matchResume.value.trim()) {
    loadSampleResume('good');
    const mainResume = document.getElementById('resume-input-text');
    if (mainResume) matchResume.value = mainResume.value;
  }
  showToast('Contoh Job Description Engineer dimuat', 'info');
}

export async function runJobMatch() {
  const jdInput = document.getElementById('jd-input-text');
  const resumeInput = document.getElementById('match-resume-text');
  const jd = jdInput ? jdInput.value.trim() : '';
  const resume = (resumeInput ? resumeInput.value.trim() : '') || (document.getElementById('resume-input-text')?.value.trim() || '');

  if (!jd || !resume) {
    showToast('Harap isi Job Description dan Teks Resume terlebih dahulu', 'error');
    return;
  }

  const btn = document.getElementById('btn-run-match');
  const origHtml = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i><span>Menghitung Matching...</span>';
    if (window.lucide) window.lucide.createIcons();
  }

  try {
    const data = await api.postJson('/api/ats/match', {
      resumeText: resume,
      jobDescription: jd
    });

    if (data.success && data.result) {
      document.getElementById('match-empty-state')?.classList.add('hidden');
      document.getElementById('match-results-content')?.classList.remove('hidden');

      const score = data.result.matchScore ?? data.result.matchPercentage ?? 0;
      const matched = data.result.matchedSkills || data.result.matchedKeywords || [];
      const missing = data.result.missingCriticalSkills || data.result.missingKeywords || [];

      const scoreText = document.getElementById('match-percentage-text');
      if (scoreText) scoreText.innerText = `${score}%`;

      const matchedCount = document.getElementById('match-matched-count');
      if (matchedCount) matchedCount.innerText = matched.length;

      const totalCount = document.getElementById('match-total-count');
      if (totalCount) totalCount.innerText = matched.length + missing.length;

      const matchedTags = document.getElementById('matched-keywords-tags');
      if (matchedTags) {
        matchedTags.innerHTML = matched.length > 0
          ? matched.map(k => `<span class="badge badge-success">${k}</span>`).join('')
          : '<span class="text-xs text-muted-foreground">Tidak ada keyword yang persis cocok.</span>';
      }

      const missingTags = document.getElementById('missing-keywords-tags');
      if (missingTags) {
        missingTags.innerHTML = missing.length > 0
          ? missing.map(k => `<span class="badge badge-destructive">${k}</span>`).join('')
          : '<span class="text-xs text-emerald-500 font-medium">Semua skill utama terpenuhi!</span>';
      }

      showToast('Kalkulasi Job Matching selesai!', 'success');
    }
  } catch (err) {
    showToast(err.message || 'Gagal menghitung match', 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = origHtml;
      if (window.lucide) window.lucide.createIcons();
    }
  }
}

export async function optimizeBullet() {
  const bulletInput = document.getElementById('star-input-bullet');
  const roleInput = document.getElementById('star-input-role');
  const contextInput = document.getElementById('star-input-context');

  const bullet = bulletInput ? bulletInput.value.trim() : '';
  const targetRole = roleInput ? roleInput.value.trim() : '';
  const context = contextInput ? contextInput.value.trim() : '';

  if (!bullet) {
    showToast('Harap masukkan draf poin pekerjaan mentah', 'error');
    return;
  }

  const btn = document.getElementById('btn-opt-bullet');
  const origHtml = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i>';
    if (window.lucide) window.lucide.createIcons();
  }

  try {
    const data = await api.postJson('/api/ats/optimize-bullet', {
      bullet,
      targetRole,
      context
    });

    if (data.success && data.variations) {
      document.getElementById('star-results')?.classList.remove('hidden');
      const v1 = document.getElementById('star-var-1');
      const v2 = document.getElementById('star-var-2');
      const v3 = document.getElementById('star-var-3');

      if (v1) v1.innerText = data.variations[0]?.bullet || data.variations[0]?.rewrittenBullet || '';
      if (v2) v2.innerText = data.variations[1]?.bullet || data.variations[1]?.rewrittenBullet || '';
      if (v3) v3.innerText = data.variations[2]?.bullet || data.variations[2]?.rewrittenBullet || '';

      showToast('3 Formula STAR berhasil dioptimasi!', 'success');
    }
  } catch (err) {
    showToast(err.message || 'Gagal mengoptimasi bullet point', 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = origHtml;
      if (window.lucide) window.lucide.createIcons();
    }
  }
}

export async function generateResumeFormats() {
  if (!atsState.sampleData) {
    await fetchSampleData();
  }
  const resume = atsState.sampleData?.sampleResumeData;
  if (!resume) {
    showToast('Data resume contoh tidak ditemukan', 'error');
    return;
  }

  try {
    const data = await api.postJson('/api/ats/generate', { resume });
    if (data.success && data.formats) {
      atsState.currentFormats = data.formats;
      setGenView('html');
      showToast('4 Format resume berhasil digenerate!', 'success');
    }
  } catch (err) {
    showToast(err.message || 'Gagal generate format resume', 'error');
  }
}

export function setGenView(type) {
  if (!atsState.currentFormats) {
    generateResumeFormats();
    return;
  }

  const tabs = ['html', 'markdown', 'plain', 'json'];
  tabs.forEach(t => {
    const btn = document.getElementById(`gen-tab-${t}`);
    if (btn) btn.classList.remove('active');
  });

  const activeBtn = document.getElementById(`gen-tab-${type}`);
  if (activeBtn) activeBtn.classList.add('active');

  const iframe = document.getElementById('gen-iframe');
  const pre = document.getElementById('gen-text-preview');

  if (type === 'html') {
    if (iframe) {
      iframe.classList.remove('hidden');
      iframe.srcdoc = atsState.currentFormats.html;
    }
    if (pre) pre.classList.add('hidden');
  } else {
    if (iframe) iframe.classList.add('hidden');
    if (pre) {
      pre.classList.remove('hidden');
      if (type === 'markdown') pre.innerText = atsState.currentFormats.markdown;
      if (type === 'plain') pre.innerText = atsState.currentFormats.plainText;
      if (type === 'json') pre.innerText = JSON.stringify(atsState.currentFormats.json, null, 2);
    }
  }
}
