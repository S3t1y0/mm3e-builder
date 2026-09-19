/**
 * Seamless Scroll Chaining Engine with Dual-Mode Interpolation
 * - Trackpad: Direct micro-delta passthrough (responsive, 1:1 hardware tracked).
 * - Mouse Wheel: Smooth rAF momentum easing (eliminates choppy 100px notch jumps
 *   and seamlessly transitions from dynamic containers to page window).
 * - Modal Scroll Isolation: Strictly prevents background page scroll chaining
 *   when interacting with floating modals, dialogs, or backdrops.
 */

const MODAL_CONTAINER_SELECTOR = [
  '.modal-backdrop',
  '.modal-overlay',
  '.modal-card',
  '.modal-dialog',
  '.modal-content',
  '.r20-modal-overlay',
  '.spec-modal-backdrop',
  '.preset-modal-backdrop',
  '.comp-modal-backdrop',
  '.eq-modal-backdrop',
  '.wizard-spec-modal-overlay',
  '.power-studio-fullscreen-window',
  '.dice-roll-hud-dock',
  '[role="dialog"]',
  '[data-modal]'
].join(', ');

export function getModalContainer(element) {
  if (!element || element === document.body || element === document.documentElement) return null;
  return element.closest(MODAL_CONTAINER_SELECTOR);
}

export function hasActiveModal() {
  if (typeof document === 'undefined') return false;
  return Boolean(
    document.querySelector(
      '.modal-backdrop, .modal-overlay.open, .modal-overlay:not([style*="display: none"]), ' +
      '.r20-modal-overlay, .spec-modal-backdrop, .preset-modal-backdrop, .comp-modal-backdrop, ' +
      '.eq-modal-backdrop, .wizard-spec-modal-overlay.open, .power-studio-fullscreen-window, ' +
      '[role="dialog"]'
    )
  );
}

export function syncBodyScrollLock() {
  if (typeof document === 'undefined') return;
  const isModalOpen = hasActiveModal();
  const htmlHas = document.documentElement.classList.contains('modal-open');
  const bodyHas = document.body.classList.contains('modal-open');

  if (isModalOpen) {
    if (!htmlHas) document.documentElement.classList.add('modal-open');
    if (!bodyHas) document.body.classList.add('modal-open');
  } else {
    if (htmlHas) document.documentElement.classList.remove('modal-open');
    if (bodyHas) document.body.classList.remove('modal-open');
  }
}

function getNormalizedDelta(event) {
  let delta = event.deltaY;
  if (event.deltaMode === 1) {
    // DOM_DELTA_LINE (typically 28-32px per line on desktop)
    delta *= 32;
  } else if (event.deltaMode === 2) {
    // DOM_DELTA_PAGE
    delta *= window.innerHeight;
  }
  return delta;
}

function findScrollableContainer(target) {
  let el = target;
  while (el && el !== document.body && el !== document.documentElement) {
    if (el.nodeType === 1) {
      // Respect interactive inputs with their own internal scrolling
      const tag = el.tagName;
      if ((tag === 'TEXTAREA' || tag === 'SELECT') && el.scrollHeight > el.clientHeight) {
        return null;
      }

      // If hovering anywhere on the skills card, the target scrollable container is sheet-skills-list
      if (el.classList.contains('dndb-skills-card')) {
        const skillsList = el.querySelector('.sheet-skills-list');
        if (skillsList && skillsList.scrollHeight > skillsList.clientHeight + 1) {
          return skillsList;
        }
      }

      // If hovering anywhere on the tabbed action hub, the target is the active tab pane
      if (
        el.classList.contains('dndb-tabbed-hub') ||
        el.classList.contains('tabbed-action-hub') ||
        el.classList.contains('dndb-col-right')
      ) {
        const activePane = el.querySelector('.dndb-tab-pane.active') || el.querySelector('.dndb-tab-pane');
        if (activePane && activePane.scrollHeight > activePane.clientHeight + 1) {
          return activePane;
        }
      }

      if (
        el.classList.contains('dndb-tab-pane') ||
        el.classList.contains('sheet-skills-list') ||
        el.classList.contains('catalog-cards-container') ||
        el.classList.contains('skills-table-responsive') ||
        el.classList.contains('wizard-advisor-sidebar') ||
        el.classList.contains('preset-items-scroll') ||
        el.classList.contains('presets-chips-grid') ||
        el.classList.contains('modal-body') ||
        el.classList.contains('r20-modal-body') ||
        el.classList.contains('spec-modal-body') ||
        el.classList.contains('modal-tab-body') ||
        el.classList.contains('narrative-mode-body') ||
        el.classList.contains('comp-modal-body') ||
        el.classList.contains('eq-modal-body') ||
        el.hasAttribute('data-seamless-scroll')
      ) {
        return el;
      }

      // Automatically identify any dynamic element with vertical overflow
      const style = window.getComputedStyle(el);
      const overflowY = style.overflowY;
      if ((overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 2) {
        return el;
      }
    }
    el = el.parentElement;
  }
  return null;
}

function isMouseWheel(event) {
  // Line or page delta modes are physical mouse wheels
  if (event.deltaMode !== 0) return true;
  // Fractional deltas are high-precision trackpads (e.g. 1.25, 2.5)
  if (!Number.isInteger(event.deltaY)) return false;
  // High-magnitude integer deltas (e.g. 100, 120) typical of notched wheels
  return Math.abs(event.deltaY) >= 40;
}

function applyScrollStep(scroller, step, isWindowTarget = false, isModalActive = false) {
  if (isModalActive) {
    // When modal is active, page window scrolling is strictly locked
    if (!scroller || !scroller.isConnected) return;
    const maxScroll = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
    if (maxScroll <= 1) return;
    const currentTop = scroller.scrollTop;
    if (step > 0) {
      scroller.scrollTop = Math.min(maxScroll, currentTop + step);
      if (scroller.scrollTop >= maxScroll) pendingMouseDelta = 0;
    } else if (step < 0) {
      scroller.scrollTop = Math.max(0, currentTop + step);
      if (scroller.scrollTop <= 0) pendingMouseDelta = 0;
    }
    return;
  }

  // Standard non-modal scrolling
  if (isWindowTarget || !scroller || !scroller.isConnected) {
    window.scrollBy({ top: step, behavior: 'auto' });
    return;
  }

  const maxScroll = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
  if (maxScroll <= 3) {
    // Container has no overflow: seamlessly scroll the window
    window.scrollBy({ top: step, behavior: 'auto' });
    return;
  }

  const currentTop = scroller.scrollTop;

  if (step > 0) {
    // Scrolling DOWN
    const available = maxScroll - currentTop;
    if (available <= 3) {
      // Already at the bottom boundary: seamlessly scroll the page window!
      window.scrollBy({ top: step, behavior: 'auto' });
    } else if (step >= available) {
      // Reached the bottom on this flick: stop cleanly without jerking the window
      scroller.scrollTop = maxScroll;
      pendingMouseDelta = 0;
    } else {
      const before = scroller.scrollTop;
      scroller.scrollTop = currentTop + step;
      if (scroller.scrollTop === before && before > 0) {
        window.scrollBy({ top: step, behavior: 'auto' });
      }
    }
  } else if (step < 0) {
    // Scrolling UP
    const available = currentTop;
    if (available <= 3) {
      // Already at the top boundary: seamlessly scroll the page window!
      window.scrollBy({ top: step, behavior: 'auto' });
    } else if (-step >= available) {
      // Reached the top on this flick: stop cleanly without jerking the window
      scroller.scrollTop = 0;
      pendingMouseDelta = 0;
    } else {
      const before = scroller.scrollTop;
      scroller.scrollTop = currentTop + step;
      if (scroller.scrollTop === before) {
        window.scrollBy({ top: step, behavior: 'auto' });
      }
    }
  }
}

let isInitialized = false;

// Mouse wheel rAF accumulator state
let pendingMouseDelta = 0;
let activeScroller = null;
let activeIsWindowTarget = false;
let activeIsModalActive = false;
let rafId = null;

function runMouseWheelLoop() {
  if (Math.abs(pendingMouseDelta) < 0.6) {
    if (pendingMouseDelta !== 0) {
      applyScrollStep(activeScroller, pendingMouseDelta, activeIsWindowTarget, activeIsModalActive);
      pendingMouseDelta = 0;
    }
    rafId = null;
    return;
  }

  // Smooth momentum easing: 0.20 per frame provides crisp, silky deceleration (~140ms)
  const step = pendingMouseDelta * 0.20;
  pendingMouseDelta -= step;

  applyScrollStep(activeScroller, step, activeIsWindowTarget, activeIsModalActive);

  rafId = requestAnimationFrame(runMouseWheelLoop);
}

export function initSeamlessScroll() {
  if (typeof window === 'undefined' || isInitialized) return;
  isInitialized = true;

  // Setup DOM MutationObserver for automatic body scroll lock
  if (typeof MutationObserver !== 'undefined' && document.body) {
    let debounceTimer = null;
    const observer = new MutationObserver(() => {
      if (debounceTimer) return;
      debounceTimer = setTimeout(() => {
        debounceTimer = null;
        syncBodyScrollLock();
      }, 40);
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  window.addEventListener(
    'wheel',
    (event) => {
      // Ignore pinch-zoom (ctrlKey) or horizontal gestures
      if (event.ctrlKey || event.altKey) return;
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;

      const modalContainer = getModalContainer(event.target);
      const modalActive = Boolean(modalContainer) || hasActiveModal();

      if (modalActive) {
        // Modal or floating window is active: prevent all default window scrolling
        event.preventDefault();

        const scroller = findScrollableContainer(event.target);
        if (!scroller) {
          // Hovering on backdrop, modal header, tabs, or non-scrollable area: page stays locked
          return;
        }

        // If a specific modal container was matched, make sure the scroller is inside it
        if (modalContainer && !modalContainer.contains(scroller) && scroller !== modalContainer) {
          return;
        }

        const deltaY = getNormalizedDelta(event);
        if (deltaY === 0) return;

        if (isMouseWheel(event)) {
          activeScroller = scroller;
          activeIsWindowTarget = false;
          activeIsModalActive = true;
          pendingMouseDelta = Math.max(-800, Math.min(800, pendingMouseDelta + deltaY));
          if (!rafId) {
            rafId = requestAnimationFrame(runMouseWheelLoop);
          }
        } else {
          if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
            pendingMouseDelta = 0;
          }
          applyScrollStep(scroller, deltaY, false, true);
        }
        return;
      }

      // Standard page scroll behavior (no modal active)
      const scroller = findScrollableContainer(event.target);
      const deltaY = getNormalizedDelta(event);
      if (deltaY === 0) return;

      event.preventDefault();

      let isWindowTarget = false;
      if (!scroller || !scroller.isConnected) {
        isWindowTarget = true;
      } else {
        const maxScroll = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
        if (maxScroll <= 3) {
          isWindowTarget = true;
        } else {
          const currentTop = scroller.scrollTop;
          if (deltaY > 0 && maxScroll - currentTop <= 3) {
            isWindowTarget = true;
          } else if (deltaY < 0 && currentTop <= 3) {
            isWindowTarget = true;
          }
        }
      }

      if (isMouseWheel(event)) {
        activeScroller = scroller;
        activeIsWindowTarget = isWindowTarget;
        activeIsModalActive = false;
        pendingMouseDelta = Math.max(-800, Math.min(800, pendingMouseDelta + deltaY));
        if (!rafId) {
          rafId = requestAnimationFrame(runMouseWheelLoop);
        }
      } else {
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
          pendingMouseDelta = 0;
        }
        applyScrollStep(scroller, deltaY, isWindowTarget, false);
      }
    },
    { passive: false, capture: true }
  );
}
