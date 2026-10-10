import { defineStore } from 'pinia';
import { syncUiStateToUrl } from '../utils/urlSync.js';

export const useUiStore = defineStore('ui', {
  state: () => ({
    activeNavTab: 'sheet', // 'wizard' | 'sheet' | 'rules'
    activeTab: 'sheet',
    activeActionHubTab: 'actions',
    modals: {
      powerStudio: false,
      advantage: false,
      skill: false,
      resource: false,
      roll20: false,
      share: false,
      conditions: false,
      exportImport: false,
      printOfficial: false,
      markdown: false
    },
    exportImportInitialTab: 'export',
    toasts: []
  }),

  actions: {
    setActiveActionHubTab(tab) {
      this.activeActionHubTab = tab;
    },

    setNavTab(tab) {
      if (tab === 'rules') {
        if (typeof window !== 'undefined') {
          window.open('https://s3t1y0.github.io/mm3e-reference/', '_blank', 'noopener,noreferrer');
        }
        return;
      }
      this.activeNavTab = tab;
      this.activeTab = tab;
      syncUiStateToUrl(this);
    },

    setActiveTab(tab) {
      if (tab === 'rules') {
        if (typeof window !== 'undefined') {
          window.open('https://s3t1y0.github.io/mm3e-reference/', '_blank', 'noopener,noreferrer');
        }
        return;
      }
      this.activeNavTab = tab;
      this.activeTab = tab;
      syncUiStateToUrl(this);
    },

    openModal(modalName) {
      if (this.modals[modalName] !== undefined) {
        for (const key of Object.keys(this.modals)) {
          this.modals[key] = false;
        }
        this.modals[modalName] = true;
        syncUiStateToUrl(this);
      }
    },

    openExportImport(tab = 'export') {
      this.exportImportInitialTab = tab;
      this.openModal('exportImport');
    },

    closeModal(modalName) {
      if (this.modals[modalName] !== undefined) {
        this.modals[modalName] = false;
        syncUiStateToUrl(this);
      }
    },

    closeAllModals() {
      for (const key of Object.keys(this.modals)) {
        this.modals[key] = false;
      }
      syncUiStateToUrl(this);
    },

    showToast(message, type = 'info', duration = 3000) {
      const id = 'toast_' + Date.now() + Math.random().toString(36).substr(2, 4);
      this.toasts.push({ id, message, type });
      if (duration > 0) {
        setTimeout(() => {
          this.removeToast(id);
        }, duration);
      }
      return id;
    },

    removeToast(id) {
      const idx = this.toasts.findIndex(t => t.id === id);
      if (idx !== -1) {
        this.toasts.splice(idx, 1);
      }
    }
  }
});
