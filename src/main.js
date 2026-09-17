import { createApp } from 'vue';
import { createPinia } from 'pinia';

// Icons & Design System Stylesheets
import 'remixicon/fonts/remixicon.css';
import './styles/main.css';
import './styles/sheet.css';
import './styles/builder.css';
import './styles/wizard.css';
import './styles/roll20-print.css';

import App from './App.vue';
import { initSeamlessScroll } from './utils/seamlessScroll.js';

const app = createApp(App);
const pinia = createPinia();

// Exclusively identify as MM3e Builder Vue 3 for the Chrome Extension VTT Bridge
document.documentElement.setAttribute('data-app', 'mm3e-builder-vue');
document.documentElement.setAttribute('data-builder-framework', 'vue3');
window.__MM3E_BUILDER_VUE__ = {
  version: '2.0.0',
  framework: 'vue3',
  loadedAt: Date.now()
};

// Initialize smooth, stutter-free scroll chaining from dynamic containers to page window
initSeamlessScroll();

app.use(pinia);
app.mount('#app');
