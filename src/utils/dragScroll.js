export function initDragScroll(el, options = {}) {
  if (!el || typeof el.addEventListener !== 'function') return () => {};

  const threshold = options.dragThreshold ?? 5;
  const enableMomentum = options.momentum ?? true;

  let isDown = false;
  let hasDragged = false;
  let preventNextClick = false;
  let startX = 0;
  let startScrollLeft = 0;

  let lastX = 0;
  let lastTime = 0;
  let velocity = 0;
  let momentumRafId = null;

  function stopMomentum() {
    if (momentumRafId !== null) {
      cancelAnimationFrame(momentumRafId);
      momentumRafId = null;
    }
  }

  function onMouseDown(e) {
    if (e.button !== 0) return;

    const tag = e.target?.tagName?.toUpperCase();
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
      return;
    }

    stopMomentum();
    el.scrollTop = 0;

    isDown = true;
    hasDragged = false;
    preventNextClick = false;

    startX = e.pageX;
    startScrollLeft = el.scrollLeft;

    lastX = e.pageX;
    lastTime = performance.now();
    velocity = 0;

    window.addEventListener('mousemove', onMouseMove, { passive: false });
    window.addEventListener('mouseup', onMouseUp, { passive: false });
  }

  function onMouseMove(e) {
    if (!isDown) return;

    const dx = e.pageX - startX;

    if (!hasDragged) {
      if (Math.abs(dx) > threshold) {
        hasDragged = true;
        preventNextClick = true;
        el.classList.add('is-dragging');
        document.body.style.userSelect = 'none';
        document.body.style.webkitUserSelect = 'none';
      }
    }

    if (hasDragged) {
      e.preventDefault();
      el.scrollLeft = startScrollLeft - dx;
      if (el.scrollTop !== 0) el.scrollTop = 0;

      const now = performance.now();
      const dt = now - lastTime;
      if (dt > 8) {
        const instantVelocity = (e.pageX - lastX) / dt;
        velocity = 0.65 * instantVelocity + 0.35 * velocity;
        lastX = e.pageX;
        lastTime = now;
      }
    }
  }

  function onMouseUp(e) {
    if (!isDown) return;
    isDown = false;

    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);

    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';
    el.classList.remove('is-dragging');
    if (el.scrollTop !== 0) el.scrollTop = 0;

    if (hasDragged) {
      preventNextClick = true;
      setTimeout(() => {
        preventNextClick = false;
      }, 80);

      if (performance.now() - lastTime > 120) {
        velocity = 0;
      }

      if (enableMomentum && Math.abs(velocity) > 0.12) {
        let currentVelocity = velocity * 16;
        const maxVelocity = 35;
        if (Math.abs(currentVelocity) > maxVelocity) {
          currentVelocity = Math.sign(currentVelocity) * maxVelocity;
        }

        const decay = 0.92;
        const minSpeed = 0.3;

        function step() {
          if (Math.abs(currentVelocity) < minSpeed) {
            momentumRafId = null;
            return;
          }
          el.scrollLeft -= currentVelocity;
          if (el.scrollTop !== 0) el.scrollTop = 0;
          currentVelocity *= decay;
          momentumRafId = requestAnimationFrame(step);
        }

        momentumRafId = requestAnimationFrame(step);
      }
    }
  }

  // Intercept synthetic click in capture phase so tab buttons do not fire on drag release
  function onClickCapture(e) {
    if (preventNextClick) {
      e.stopPropagation();
      e.stopImmediatePropagation();
      e.preventDefault();
      preventNextClick = false;
    }
  }

  el.classList.add('drag-scroll-container');
  el.addEventListener('mousedown', onMouseDown);
  el.addEventListener('click', onClickCapture, true);

  return function cleanup() {
    stopMomentum();
    el.removeEventListener('mousedown', onMouseDown);
    el.removeEventListener('click', onClickCapture, true);
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
    el.classList.remove('drag-scroll-container', 'is-dragging');
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';
  };
}

export const vDragScroll = {
  mounted(el, binding) {
    el.__dragScrollCleanup = initDragScroll(el, binding.value || {});
  },
  unmounted(el) {
    if (el.__dragScrollCleanup) {
      el.__dragScrollCleanup();
      delete el.__dragScrollCleanup;
    }
  }
};

export default vDragScroll;
