/**
 * Seamless Scroll Chaining Engine with Dual-Mode Interpolation
 * - Trackpad: Direct micro-delta passthrough (responsive, 1:1 hardware tracked).
 * - Mouse Wheel: Smooth rAF momentum easing (eliminates choppy 100px notch jumps
 *   and seamlessly transitions from dynamic containers to page window).
 */

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

function applyScrollStep(scroller, step) {
  if (!scroller || !scroller.isConnected) {
    window.scrollBy({ top: step, behavior: 'auto' });
    return;
  }

  const maxScroll = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
  if (maxScroll <= 1) {
    window.scrollBy({ top: step, behavior: 'auto' });
    return;
  }

  const currentTop = scroller.scrollTop;

  if (step > 0) {
    // Scrolling DOWN
    const available = maxScroll - currentTop;
    if (available <= 0.8) {
      window.scrollBy({ top: step, behavior: 'auto' });
    } else if (step > available) {
      scroller.scrollTop = maxScroll;
      window.scrollBy({ top: step - available, behavior: 'auto' });
    } else {
      scroller.scrollTop = currentTop + step;
    }
  } else if (step < 0) {
    // Scrolling UP
    const available = currentTop;
    if (available <= 0.8) {
      window.scrollBy({ top: step, behavior: 'auto' });
    } else if (-step > available) {
      scroller.scrollTop = 0;
      window.scrollBy({ top: step + available, behavior: 'auto' });
    } else {
      scroller.scrollTop = currentTop + step;
    }
  }
}

let isInitialized = false;

// Mouse wheel rAF accumulator state
let pendingMouseDelta = 0;
let activeScroller = null;
let rafId = null;

function runMouseWheelLoop() {
  if (Math.abs(pendingMouseDelta) < 0.6) {
    if (pendingMouseDelta !== 0) {
      applyScrollStep(activeScroller, pendingMouseDelta);
      pendingMouseDelta = 0;
    }
    rafId = null;
    return;
  }

  // Smooth momentum easing: 0.20 per frame provides crisp, silky deceleration (~140ms)
  const step = pendingMouseDelta * 0.20;
  pendingMouseDelta -= step;

  applyScrollStep(activeScroller, step);

  rafId = requestAnimationFrame(runMouseWheelLoop);
}

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

      const deltaY = getNormalizedDelta(event);
      if (deltaY === 0) return;

      event.preventDefault();

      if (isMouseWheel(event)) {
        // Physical mouse wheel with discrete notch clicks:
        // Accumulate delta into rAF momentum loop to eliminate jagged/patah-patah jumps
        activeScroller = scroller;
        pendingMouseDelta = Math.max(-800, Math.min(800, pendingMouseDelta + deltaY));
        if (!rafId) {
          rafId = requestAnimationFrame(runMouseWheelLoop);
        }
      } else {
        // Precision trackpad with continuous micro-deltas:
        // Immediate 1:1 passthrough for instant, responsive hardware tracking
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
          pendingMouseDelta = 0;
        }
        applyScrollStep(scroller, deltaY);
      }
    },
    { passive: false, capture: true }
  );
}
