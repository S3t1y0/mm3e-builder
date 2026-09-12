// js/components/notifications.js
// Confirmation Dialog System replacing native browser confirm()

let confirmModalOverlay = null;

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
 * Toast notifications have been disabled per user request.
 * Kept as safe no-op to ensure zero errors across all callers.
 */
export function showToast(message, type = 'info', duration = 3500) {
  return { dismiss: () => {} };
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
