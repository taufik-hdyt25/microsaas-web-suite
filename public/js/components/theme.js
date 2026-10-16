/**
 * Shadcn UI Theme Manager (Dark / Light)
 */
export function initTheme() {
  const storedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  updateThemeToggleIcon();
}

export function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  updateThemeToggleIcon();
}

function updateThemeToggleIcon() {
  const iconContainer = document.getElementById('theme-toggle-btn');
  if (!iconContainer) return;

  const isDark = document.documentElement.classList.contains('dark');
  iconContainer.innerHTML = isDark
    ? '<i data-lucide="sun" class="w-4 h-4 text-amber-400"></i>'
    : '<i data-lucide="moon" class="w-4 h-4 text-slate-700"></i>';

  if (window.lucide) {
    window.lucide.createIcons();
  }
}
