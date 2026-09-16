import { defineStore } from 'pinia';

export const useUiStore = defineStore('ui', {
  state: () => ({
    activeNavTab: 'sheet', // 'wizard' | 'sheet' | 'rules'
    activeTab: 'sheet',
    modals: {
      powerStudio: false,
      advantage: false,
      skill: false,
      resource: false,
      roll20: false,
      share: false,
      conditions: false,
      exportImport: false
    },
    exportImportInitialTab: 'export',
    toasts: []
  }),

  actions: {
    setNavTab(tab) {
      this.activeNavTab = tab;
      this.activeTab = tab;
    },

    setActiveTab(tab) {
      this.activeNavTab = tab;
      this.activeTab = tab;
    },

    openModal(modalName) {
      if (this.modals[modalName] !== undefined) {
        this.closeAllModals();
        this.modals[modalName] = true;
      }
    },

    openExportImport(tab = 'export') {
      this.exportImportInitialTab = tab;
      this.openModal('exportImport');
    },

    closeModal(modalName) {
      if (this.modals[modalName] !== undefined) {
        this.modals[modalName] = false;
      }
    },

    closeAllModals() {
      for (const key of Object.keys(this.modals)) {
        this.modals[key] = false;
      }
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
