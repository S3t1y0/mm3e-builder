// js/components/shareModal.js
import { store } from '../state.js';
import { generateShareUrl } from '../storage/shareUrl.js';
import { showToast } from './notifications.js';

let shareModalOverlay = null;

function ensureShareModalOverlay() {
  if (!shareModalOverlay) {
    shareModalOverlay = document.getElementById('share-modal-overlay');
    if (!shareModalOverlay) {
      shareModalOverlay = document.createElement('div');
      shareModalOverlay.id = 'share-modal-overlay';
      shareModalOverlay.className = 'modal-overlay';
      document.body.appendChild(shareModalOverlay);
    }
  }
  return shareModalOverlay;
}

/**
 * Opens the Share Character Modal with 1-Click URL copy.
 */
export async function openShareModal() {
  const overlay = ensureShareModalOverlay();
  const char = store.character;
  const heroName = char.name || 'Unnamed Hero';
  const pl = char.powerLevel || 10;
  const spentPP = store.getTotalSpentPP();
  const budgetPP = store.getTotalBudgetPP();

  // Show loading indicator in modal while compressing
  overlay.innerHTML = `
    <div class="modal-dialog modal-dialog-share">
      <div class="share-modal-header">
        <div class="share-icon-crest">
          <i class="ri-share-forward-line"></i>
        </div>
        <div class="share-title-group">
          <h3 class="share-title">Share Character Link</h3>
          <p class="share-sub">Preparing shareable link...</p>
        </div>
      </div>
      <div class="share-modal-body" style="padding: 2rem 0; text-align: center;">
        <i class="ri-loader-4-line ri-spin" style="font-size: 2rem; color: var(--accent-primary);"></i>
      </div>
    </div>
  `;
  overlay.classList.add('open');

  let shareUrl = '';
  try {
    shareUrl = await generateShareUrl(char);
  } catch (err) {
    console.error('Failed to generate share URL:', err);
    showToast('Failed to generate share link.', 'error');
    overlay.classList.remove('open');
    return;
  }

  overlay.innerHTML = `
    <div class="modal-dialog modal-dialog-share" role="dialog" aria-modal="true" aria-labelledby="share-modal-title">
      <div class="share-modal-header">
        <div class="share-icon-crest">
          <i class="ri-share-forward-fill"></i>
        </div>
        <div class="share-title-group">
          <h3 class="share-title" id="share-modal-title">Share Character Sheet</h3>
          <p class="share-sub">Send this hero profile directly to other players or Game Masters</p>
        </div>
        <button id="btn-close-share-modal" class="modal-close-btn" type="button" aria-label="Close Share Modal">
          <i class="ri-close-line"></i>
        </button>
      </div>

      <div class="share-modal-body">
        <div class="share-hero-badge">
          <div class="share-hero-avatar">
            <i class="ri-shield-user-fill"></i>
          </div>
          <div class="share-hero-meta">
            <span class="share-hero-name">${heroName}</span>
            <div class="share-hero-chips">
              <span class="share-pill pl">PL ${pl}</span>
              <span class="share-pill pp">${spentPP} / ${budgetPP} PP</span>
              <span class="share-pill slug"><i class="ri-link-m"></i> Ready to Share</span>
            </div>
          </div>
        </div>

        <div class="share-input-section">
          <label class="share-input-label" for="share-url-input">Direct Share Link:</label>
          <div class="share-input-row">
            <input type="text" id="share-url-input" class="share-url-input" value="${shareUrl}" readonly spellcheck="false">
            <button id="btn-copy-share-url" class="btn btn-primary" type="button">
              <i class="ri-file-copy-line"></i> <span id="copy-btn-text">Copy Link</span>
            </button>
          </div>
        </div>

        <p class="share-explainer">
          <i class="ri-information-line"></i> Anyone opening this link will be prompted to load this character profile directly into their sheet.
        </p>
      </div>

      <div class="share-modal-footer">
        <button id="btn-share-done" class="btn btn-secondary" type="button">Done</button>
      </div>
    </div>
  `;

  const inputEl = overlay.querySelector('#share-url-input');
  const copyBtn = overlay.querySelector('#btn-copy-share-url');
  const copyBtnText = overlay.querySelector('#copy-btn-text');
  const closeBtn = overlay.querySelector('#btn-close-share-modal');
  const doneBtn = overlay.querySelector('#btn-share-done');

  const closeModal = () => {
    overlay.classList.remove('open');
  };

  const copyToClipboard = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        inputEl.select();
        document.execCommand('copy');
      }
      copyBtn.classList.add('copied');
      copyBtn.innerHTML = '<i class="ri-check-line"></i> Copied!';
      showToast('Share link copied to clipboard!', 'success');
      setTimeout(() => {
        if (copyBtn) {
          copyBtn.classList.remove('copied');
          copyBtn.innerHTML = '<i class="ri-file-copy-line"></i> <span id="copy-btn-text">Copy Link</span>';
        }
      }, 2500);
    } catch (err) {
      inputEl.select();
      showToast('Press Ctrl+C to copy the link.', 'info');
    }
  };

  copyBtn?.addEventListener('click', copyToClipboard);
  inputEl?.addEventListener('click', () => inputEl.select());
  closeBtn?.addEventListener('click', closeModal);
  doneBtn?.addEventListener('click', closeModal);

  // Close on backdrop click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // Focus copy button initially
  setTimeout(() => copyBtn?.focus(), 80);
}
