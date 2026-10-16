/**
 * Shadcn / Sonner style Toast Notification Component
 */
export function showToast(message, type = 'success', duration = 3000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';

  const icons = {
    success: '<i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-500 shrink-0 mt-0.5"></i>',
    error: '<i data-lucide="alert-circle" class="w-4 h-4 text-rose-500 shrink-0 mt-0.5"></i>',
    info: '<i data-lucide="info" class="w-4 h-4 text-sky-500 shrink-0 mt-0.5"></i>'
  };

  const iconHtml = icons[type] || icons.info;

  toast.innerHTML = `
    ${iconHtml}
    <div class="flex-1 text-xs font-medium leading-relaxed">${message}</div>
  `;

  container.appendChild(toast);

  if (window.lucide) {
    window.lucide.createIcons({ root: toast });
  }

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 200);
  }, duration);
}
