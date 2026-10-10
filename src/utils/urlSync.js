/**
 * src/utils/urlSync.js
 * Synchronizes Pinia uiStore (active tabs & open modals) and powerBuilderStore with browser URL pathnames.
 * 
 * Why Pathnames instead of Query Strings?
 * Vercel Web Analytics strips query strings (?tab=...) from the "Pages" dashboard view for GDPR/privacy compliance.
 * By updating the actual URL pathname (/wizard, /power-studio, /print-official), Vercel Analytics separates
 * each section into distinct rows in the "Pages" report, showing exact visitor counts per feature for FREE!
 * 
 * Works 100% seamlessly on Vercel thanks to vercel.json rewrite rule: { "source": "/(.*)", "destination": "/index.html" }.
 */

const MODAL_PATH_MAP = {
  powerStudio: '/power-studio',
  printOfficial: '/print-official',
  roll20: '/roll20',
  markdown: '/markdown',
  exportImport: '/export-import',
  advantage: '/advantage-library',
  skill: '/skill-library',
  conditions: '/conditions',
  share: '/share'
};

const REVERSE_MODAL_PATH_MAP = Object.entries(MODAL_PATH_MAP).reduce((acc, [storeKey, path]) => {
  acc[path] = storeKey;
  return acc;
}, {});

let isApplyingPopState = false;

/**
 * Computes the target pathname based on current uiStore and builderStore state.
 * @param {Object} uiStore
 * @param {Object} [builderStore]
 * @returns {string} Target pathname
 */
function getTargetPathname(uiStore, builderStore) {
  // 1. Check Power Studio Workspace
  if (builderStore && builderStore.isOpen) {
    return '/power-studio';
  }

  // 2. Check Modals
  if (uiStore && uiStore.modals) {
    for (const [key, isOpen] of Object.entries(uiStore.modals)) {
      if (isOpen && MODAL_PATH_MAP[key]) {
        return MODAL_PATH_MAP[key];
      }
    }
  }

  // 3. Check Tabs
  const activeTab = uiStore?.activeTab || 'sheet';
  if (activeTab === 'wizard') {
    return '/wizard';
  }

  return '/';
}

/**
 * Updates the browser URL based on current uiStore and builderStore state.
 * Uses window.history.pushState to register a new virtual pageview in Vercel Analytics.
 * @param {Object} uiStore - The Pinia uiStore instance
 * @param {Object} [builderStore] - The Pinia powerBuilderStore instance
 * @param {boolean} [replace=false] - If true, uses replaceState instead of pushState
 */
export function syncUiStateToUrl(uiStore, builderStore = null, replace = false) {
  if (typeof window === 'undefined' || isApplyingPopState) return;

  const targetPath = getTargetPathname(uiStore, builderStore);
  const currentPath = window.location.pathname;

  // Clean legacy ?tab= or ?modal= query params if present, while preserving other query params
  const currentParams = new URLSearchParams(window.location.search);
  currentParams.delete('tab');
  currentParams.delete('modal');
  const remainingQuery = currentParams.toString() ? `?${currentParams.toString()}` : '';
  const newUrl = `${targetPath}${remainingQuery}${window.location.hash}`;

  // Only push if the pathname or URL actually changed
  if (currentPath !== targetPath || window.location.search.includes('tab=') || window.location.search.includes('modal=')) {
    if (replace) {
      window.history.replaceState({ path: targetPath }, '', newUrl);
    } else {
      window.history.pushState({ path: targetPath }, '', newUrl);
    }
  }
}

/**
 * Reads initial URL pathname (and legacy query params) on application mount and restores tab/modal state.
 * @param {Object} uiStore - The Pinia uiStore instance
 * @param {Object} [builderStore] - The Pinia powerBuilderStore instance
 */
export function initUrlSync(uiStore, builderStore = null) {
  if (typeof window === 'undefined') return;

  const pathname = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
  const searchParams = new URLSearchParams(window.location.search);

  // 1. Check Pathname or Legacy Query for Modals
  const modalQuery = searchParams.get('modal');
  let matchedModalKey = REVERSE_MODAL_PATH_MAP[pathname] || null;

  if (!matchedModalKey && modalQuery) {
    const formattedQuery = `/${modalQuery.replace(/^\//, '')}`;
    matchedModalKey = REVERSE_MODAL_PATH_MAP[formattedQuery] || null;
  }

  if (matchedModalKey) {
    if (matchedModalKey === 'powerStudio' && builderStore) {
      builderStore.openNewPower('standard');
    } else {
      uiStore.openModal(matchedModalKey);
    }
  }

  // 2. Check Pathname or Legacy Query for Tabs
  const tabQuery = searchParams.get('tab');
  if (pathname === '/wizard' || tabQuery === 'wizard') {
    uiStore.setActiveTab('wizard');
  } else if (pathname === '/' || pathname === '/sheet' || tabQuery === 'sheet') {
    uiStore.setActiveTab('sheet');
  }

  // Clean initial URL state without query param clutter
  syncUiStateToUrl(uiStore, builderStore, true);

  // 3. Listen to browser Back / Forward buttons (popstate)
  window.addEventListener('popstate', () => {
    isApplyingPopState = true;
    try {
      const currentPopPath = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';

      // Check if it's a modal route
      const popModalKey = REVERSE_MODAL_PATH_MAP[currentPopPath];
      if (popModalKey) {
        if (popModalKey === 'powerStudio' && builderStore) {
          if (!builderStore.isOpen) builderStore.openNewPower('standard');
        } else {
          uiStore.openModal(popModalKey);
        }
      } else {
        // If not a modal route, close all modals and power studio
        uiStore.closeAllModals();
        if (builderStore && builderStore.isOpen) {
          builderStore.closeStudio();
        }

        // Restore tab
        if (currentPopPath === '/wizard') {
          uiStore.setActiveTab('wizard');
        } else {
          uiStore.setActiveTab('sheet');
        }
      }
    } finally {
      setTimeout(() => {
        isApplyingPopState = false;
      }, 50);
    }
  });
}
