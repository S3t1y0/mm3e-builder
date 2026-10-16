import { createApp } from 'vue';
import { createPinia } from 'pinia';

// Icons & Design System Stylesheets
import 'remixicon/fonts/remixicon.css';
import './styles/main.css';
import './styles/sheet.css';
import './styles/builder.css';
import './styles/wizard.css';
import './styles/roll20-print.css';
import './styles/green-ronin-sheet.css';

import App from './App.vue';
import { initSeamlessScroll } from './utils/seamlessScroll.js';
import { vDragScroll } from './utils/dragScroll.js';
import { inject as injectAnalytics } from '@vercel/analytics';

// Initialize Vercel Web Analytics tracking
injectAnalytics();

const app = createApp(App);
const pinia = createPinia();

// Exclusively identify as MM3e Builder Vue 3 for the Chrome Extension VTT Bridge
document.documentElement.setAttribute('data-app', 'mm3e-builder-vue');
document.documentElement.setAttribute('data-builder-framework', 'vue3');
window.__MM3E_BUILDER_VUE__ = {
  version: '2.0.0',
  framework: 'vue3',
  loadedAt: Date.now(),
  pinia
};

// Initialize smooth, stutter-free scroll chaining from dynamic containers to page window
initSeamlessScroll();

app.directive('drag-scroll', vDragScroll);

// Suppress all native browser tooltips globally across the application
if (typeof window !== 'undefined') {
  const stripTooltips = (root = document) => {
    if (!root || !root.querySelectorAll) return;
    const elements = root.querySelectorAll('[title]');
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      const val = el.getAttribute('title');
      if (val && !el.hasAttribute('aria-label') && !el.innerText?.trim()) {
        el.setAttribute('aria-label', val);
      }
      el.removeAttribute('title');
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => stripTooltips());
  } else {
    stripTooltips();
  }

  // Intercept dynamically added elements via MutationObserver
  const tooltipObserver = new MutationObserver((mutations) => {
    for (let i = 0; i < mutations.length; i++) {
      const mutation = mutations[i];
      if (mutation.type === 'childList') {
        const added = mutation.addedNodes;
        for (let j = 0; j < added.length; j++) {
          const node = added[j];
          if (node.nodeType === 1) {
            if (node.hasAttribute('title')) {
              const val = node.getAttribute('title');
              if (val && !node.hasAttribute('aria-label') && !node.innerText?.trim()) {
                node.setAttribute('aria-label', val);
              }
              node.removeAttribute('title');
            }
            stripTooltips(node);
          }
        }
      } else if (mutation.type === 'attributes' && mutation.attributeName === 'title') {
        const target = mutation.target;
        if (target && target.hasAttribute('title')) {
          target.removeAttribute('title');
        }
      }
    }
  });

  tooltipObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['title']
  });

  // Fail-safe: remove title attribute immediately on hover before tooltip delay
  window.addEventListener(
    'mouseover',
    (e) => {
      const el = e.target?.closest?.('[title]');
      if (el && el.hasAttribute('title')) {
        const val = el.getAttribute('title');
        if (val && !el.hasAttribute('aria-label') && !el.innerText?.trim()) {
          el.setAttribute('aria-label', val);
        }
        el.removeAttribute('title');
      }
    },
    { capture: true, passive: true }
  );
}

app.use(pinia);
app.mount('#app');
