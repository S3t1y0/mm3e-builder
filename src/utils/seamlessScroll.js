/**
 * Seamless Scroll Chaining Engine
 * Eliminates browser gesture-locking, dropped delta, and scroll stutter between
 * dynamic inner scroll containers (skills table, tabbed action hub panes, wizard catalogs)
 * and the outer document window.
 */

function getNormalizedDelta(event) {
  let delta = event.deltaY;
  if (event.deltaMode === 1) {
    // DOM_DELTA_LINE (typically 20-24px per line)
    delta *= 24;
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

      if (
        el.classList.contains('dndb-tab-pane') ||
        el.classList.contains('sheet-skills-list') ||
        el.classList.contains('catalog-cards-container') ||
        el.classList.contains('skills-table-responsive') ||
        el.classList.contains('wizard-advisor-sidebar') ||
        el.classList.contains('preset-items-scroll') ||
        el.classList.contains('presets-chips-grid') ||
        el.hasAttribute('data-seamless-scroll')
      ) {
        return el;
      }
    }
    el = el.parentElement;
  }
  return null;
}

let isInitialized = false;

export function initSeamlessScroll() {
  if (typeof window === 'undefined' || isInitialized) return;
  isInitialized = true;

  window.addEventListener(
    'wheel',
    (event) => {
      // Ignore pinch-zoom (ctrlKey) or horizontal gestures
      if (event.ctrlKey || event.altKey) return;
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;

      const scroller = findScrollableContainer(event.target);
      if (!scroller) return;

      const maxScroll = scroller.scrollHeight - scroller.clientHeight;
      const deltaY = getNormalizedDelta(event);

      // If container fits without scrolling, delegate immediately to window
      if (maxScroll <= 1) {
        window.scrollBy({ top: deltaY, behavior: 'auto' });
        event.preventDefault();
        return;
      }

      if (deltaY === 0) return;

      const currentTop = scroller.scrollTop;

      if (deltaY > 0) {
        // Scrolling DOWN
        const available = maxScroll - currentTop;
        if (available <= 0.5) {
          // Already at bottom boundary: forward 100% of delta to page
          window.scrollBy({ top: deltaY, behavior: 'auto' });
          event.preventDefault();
        } else if (deltaY > available) {
          // Crosses boundary: absorb available into container, remainder into page
          scroller.scrollTop = maxScroll;
          window.scrollBy({ top: deltaY - available, behavior: 'auto' });
          event.preventDefault();
        } else {
          // Within container bounds
          scroller.scrollTop = currentTop + deltaY;
          event.preventDefault();
        }
      } else {
        // Scrolling UP (deltaY < 0)
        const available = currentTop;
        if (available <= 0.5) {
          // Already at top boundary: forward 100% of delta to page
          window.scrollBy({ top: deltaY, behavior: 'auto' });
          event.preventDefault();
        } else if (-deltaY > available) {
          // Crosses boundary: absorb available to 0, remainder into page
          scroller.scrollTop = 0;
          window.scrollBy({ top: deltaY + available, behavior: 'auto' });
          event.preventDefault();
        } else {
          // Within container bounds
          scroller.scrollTop = currentTop + deltaY;
          event.preventDefault();
        }
      }
    },
    { passive: false, capture: true }
  );
}
