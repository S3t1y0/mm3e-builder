// js/components/notifications.js
// Modern Toast and Confirmation Dialog System replacing ugly native browser alert() and confirm()

let toastContainer = null;
let confirmModalOverlay = null;

function ensureToastContainer() {
  if (!toastContainer) {
    toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
    }
  }
  return toastContainer;
}

function ensureConfirmModal() {
  if (!confirmModalOverlay) {
    confirmModalOverlay = document.getElementById('confirm-modal-overlay');
    if (!confirmModalOverlay) {
      confirmModalOverlay = document.createElement('div');
      confirmModalOverlay.id = 'confirm-modal-overlay';
      confirmModalOverlay.className = 'modal-overlay';
      document.body.appendChild(confirmModalOverlay);
    }
  }
  return confirmModalOverlay;
}

/**
 * Display a modern, non-blocking toast notification.
 * @param {string} message - Text or HTML message to display
 * @param {'success' | 'error' | 'warning' | 'info'} type - Type of toast
 * @param {number} duration - Milliseconds before auto-dismissing (default 3500ms)
 */
export function showToast(message, type = 'info', duration = 3500) {
  const container = ensureToastContainer();

  const toast = document.createElement('div');
  toast.className = `toast-item toast-${type}`;

  const icons = {
    success: '<i class="ri-checkbox-circle-fill"></i>',
    error: '<i class="ri-close-circle-fill"></i>',
    warning: '<i class="ri-error-warning-fill"></i>',
    info: '<i class="ri-information-fill"></i>'
  };

  const icon = icons[type] || '<i class="ri-notification-3-line"></i>';

  toast.innerHTML = `
    <div class="toast-content">
      <span class="toast-icon">${icon}</span>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close-btn" aria-label="Close notification"><i class="ri-close-line"></i></button>
    <div class="toast-progress-bar"></div>
  `;

  container.appendChild(toast);

  // Trigger enter animation on next tick
  requestAnimationFrame(() => {
    toast.classList.add('visible');
  });

  let dismissTimeout = null;

  const dismiss = () => {
    if (toast.classList.contains('dismissing')) return;
    toast.classList.add('dismissing');
    toast.classList.remove('visible');
    setTimeout(() => {
      toast.remove();
    }, 220);
  };

  // Close button
  toast.querySelector('.toast-close-btn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    clearTimeout(dismissTimeout);
    dismiss();
  });

  // Auto dismiss
  if (duration > 0) {
    dismissTimeout = setTimeout(dismiss, duration);

    // Pause on hover
    toast.addEventListener('mouseenter', () => clearTimeout(dismissTimeout));
    toast.addEventListener('mouseleave', () => {
      dismissTimeout = setTimeout(dismiss, 1500);
    });
  }

  return { dismiss };
}

/**
 * Display an interactive, accessible modal confirmation dialog (Promise-based).
 * Replaces native confirm().
 * @param {Object} options
 * @param {string} options.title - Dialog title
 * @param {string} options.message - Descriptive text explaining the action
 * @param {string} [options.confirmText='Proceed'] - Confirmation button label
 * @param {string} [options.cancelText='Cancel'] - Cancel button label
 * @param {boolean} [options.isDanger=false] - True for destructive actions (red styling)
 * @param {string} [options.icon] - Dialog icon HTML
 * @returns {Promise<boolean>}
 */
export function showConfirmModal({
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Proceed',
  cancelText = 'Cancel',
  isDanger = false,
  icon = isDanger ? '<i class="ri-delete-bin-line"></i>' : '<i class="ri-alert-line"></i>'
} = {}) {
  return new Promise((resolve) => {
    const overlay = ensureConfirmModal();

    overlay.innerHTML = `
      <div class="modal-dialog modal-dialog-confirm ${isDanger ? 'confirm-danger' : ''}">
        <div class="confirm-header">
          <div class="confirm-icon-wrap ${isDanger ? 'danger' : 'warning'}">
            <span>${icon}</span>
          </div>
          <div class="confirm-text-group">
            <h3 class="confirm-title">${title}</h3>
            <p class="confirm-message">${message}</p>
          </div>
        </div>
        <div class="confirm-actions">
          <button type="button" class="btn btn-ghost" id="btn-confirm-cancel">${cancelText}</button>
          <button type="button" class="btn ${isDanger ? 'btn-danger' : 'btn-primary'}" id="btn-confirm-ok">${confirmText}</button>
        </div>
      </div>
    `;

    overlay.classList.add('open');

    const cleanUp = (result) => {
      overlay.classList.remove('open');
      resolve(result);
    };

    // Close on Cancel
    overlay.querySelector('#btn-confirm-cancel')?.addEventListener('click', () => cleanUp(false));

    // Close on OK
    overlay.querySelector('#btn-confirm-ok')?.addEventListener('click', () => cleanUp(true));

    // Focus confirm button for accessibility
    setTimeout(() => {
      overlay.querySelector('#btn-confirm-ok')?.focus();
    }, 50);
  });
}

// Attach globally for convenience
window.showToast = showToast;
window.showConfirmModal = showConfirmModal;
