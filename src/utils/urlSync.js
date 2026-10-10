/**
 * src/utils/urlSync.js
 * Synchronizes Pinia uiStore (active tabs & open modals) and powerBuilderStore with browser URL query parameters.
 * 
 * Benefits:
 * 1. Automatically triggers new Page Views in Vercel Analytics (Hobby Free Tier) on tab/modal changes.
 * 2. Lowers bounce rate by turning single-page sessions into multi-interaction sessions.
 * 3. Enables deep linking (e.g., sharing a direct link to ?tab=wizard or ?modal=print-official).
 * 4. Connects browser Back/Forward navigation to modals and tabs seamlessly.
 */

const MODAL_MAP = {
  powerStudio: 'power-studio',
  printOfficial: 'print-official',
  roll20: 'roll20',
  markdown: 'markdown',
  exportImport: 'export-import',
  advantage: 'advantage-library',
  skill: 'skill-library',
  conditions: 'conditions',
  share: 'share'
};

const REVERSE_MODAL_MAP = Object.entries(MODAL_MAP).reduce((acc, [storeKey, urlParam]) => {
  acc[urlParam] = storeKey;
  return acc;
}, {});

let isApplyingPopState = false;

/**
 * Updates the browser URL based on current uiStore and builderStore state.
 * Uses window.history.pushState to register a new virtual pageview in Vercel Analytics.
 * @param {Object} uiStore - The Pinia uiStore instance
 * @param {Object} [builderStore] - The Pinia powerBuilderStore instance
 * @param {boolean} [replace=false] - If true, uses replaceState instead of pushState
 */
export function syncUiStateToUrl(uiStore, builderStore = null, replace = false) {
  if (typeof window === 'undefined' || isApplyingPopState) return;

  const currentSearch = window.location.search;
  const currentParams = new URLSearchParams(currentSearch);
  const newParams = new URLSearchParams();

  // 1. Tab parameter
  const activeTab = uiStore?.activeTab || 'sheet';
  if (activeTab && activeTab !== 'sheet') {
    newParams.set('tab', activeTab);
  }

  // 2. Modal parameter
  let activeModalKey = null;

  // Check Power Studio Workspace first
  if (builderStore && builderStore.isOpen) {
    activeModalKey = 'power-studio';
  } else if (uiStore && uiStore.modals) {
    for (const [key, isOpen] of Object.entries(uiStore.modals)) {
      if (isOpen && MODAL_MAP[key]) {
        activeModalKey = MODAL_MAP[key];
        break;
      }
    }
  }

  if (activeModalKey) {
    newParams.set('modal', activeModalKey);
  }

  // Preserve other query params (like referral codes or embeds if any)
  for (const [key, val] of currentParams.entries()) {
    if (key !== 'tab' && key !== 'modal') {
      newParams.set(key, val);
    }
  }

  const newQueryString = newParams.toString() ? `?${newParams.toString()}` : '';
  const newUrl = `${window.location.pathname}${newQueryString}${window.location.hash}`;

  // Only push if the URL actually changed
  if (window.location.search !== newQueryString) {
    if (replace) {
      window.history.replaceState({ tab: activeTab, modal: activeModalKey }, '', newUrl);
    } else {
      window.history.pushState({ tab: activeTab, modal: activeModalKey }, '', newUrl);
    }
  }
}

/**
 * Reads initial URL query parameters on application mount and restores tab/modal state.
 * @param {Object} uiStore - The Pinia uiStore instance
 * @param {Object} [builderStore] - The Pinia powerBuilderStore instance
 */
export function initUrlSync(uiStore, builderStore = null) {
  if (typeof window === 'undefined') return;

  const params = new URLSearchParams(window.location.search);

  // 1. Restore Tab
  const tabParam = params.get('tab');
  if (tabParam && (tabParam === 'wizard' || tabParam === 'sheet')) {
    uiStore.setActiveTab(tabParam);
  }

  // 2. Restore Modal
  const modalParam = params.get('modal');
  if (modalParam) {
    if (modalParam === 'power-studio' && builderStore) {
      builderStore.openNewPower('standard');
    } else if (REVERSE_MODAL_MAP[modalParam]) {
      uiStore.openModal(REVERSE_MODAL_MAP[modalParam]);
    }
  }

  // 3. Listen to browser Back / Forward buttons (popstate)
  window.addEventListener('popstate', () => {
    isApplyingPopState = true;
    try {
      const popParams = new URLSearchParams(window.location.search);
      const targetTab = popParams.get('tab') || 'sheet';
      if (uiStore.activeTab !== targetTab) {
        uiStore.setActiveTab(targetTab);
      }

      const targetModal = popParams.get('modal');
      if (targetModal) {
        if (targetModal === 'power-studio' && builderStore) {
          if (!builderStore.isOpen) {
            builderStore.openNewPower('standard');
          }
        } else if (REVERSE_MODAL_MAP[targetModal]) {
          const storeModalKey = REVERSE_MODAL_MAP[targetModal];
          if (!uiStore.modals[storeModalKey]) {
            uiStore.openModal(storeModalKey);
          }
        }
      } else {
        // Close modals and power studio if modal param is removed
        uiStore.closeAllModals();
        if (builderStore && builderStore.isOpen) {
          builderStore.closeStudio();
        }
      }
    } finally {
      // Small timeout to avoid immediate recursive sync
      setTimeout(() => {
        isApplyingPopState = false;
      }, 50);
    }
  });
}
