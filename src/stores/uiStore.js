import { defineStore } from 'pinia';
import { syncUiStateToUrl } from '../utils/urlSync.js';

export const DEFAULT_EXPORT_OPTIONS = {
  powerMechanics: true,
  effectRules: false,
  modifierRules: false,
  showAbilities: true,
  showDefenses: true,
  showOffense: true,
  showAdvantages: true,
  showSkills: true,
  skillsMode: 'all', // 'all' | 'trained'
  showPowers: true,
  showMovement: true,
  showEquipment: true,
  showComplications: true,
  showNotes: true
};

function loadStoredExportOptions() {
  if (typeof window === 'undefined') return { ...DEFAULT_EXPORT_OPTIONS };
  try {
    const raw = localStorage.getItem('mm3e_export_config');
    if (raw) {
      return { ...DEFAULT_EXPORT_OPTIONS, ...JSON.parse(raw) };
    }
  } catch {
    /* Fallback to default options if storage read fails */
  }
  return { ...DEFAULT_EXPORT_OPTIONS };
}

function loadStoredBypassTrainedOnly() {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem('mm3e_bypass_trained_only') === 'true';
  } catch {
    return false;
  }
}

export const useUiStore = defineStore('ui', {
  state: () => ({
    activeTab: 'sheet',
    activeActionHubTab: 'actions',
    bypassTrainedOnly: loadStoredBypassTrainedOnly(),
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
      markdown: false,
      exportStructure: false
    },
    returnModal: null,
    exportImportInitialTab: 'export',
    alwaysIncludePage2: false,
    exportOptions: loadStoredExportOptions(),
    toasts: [],
    inspector: {
      isOpen: false,
      type: 'ability',
      data: null,
      title: '',
      subtitle: ''
    }
  }),

  actions: {
    openInspector(type, data, title, subtitle) {
      this.inspector.isOpen = true;
      this.inspector.type = type || 'ability';
      this.inspector.data = data || null;
      this.inspector.title = title || 'Details';
      this.inspector.subtitle = subtitle || '';
    },

    closeInspector() {
      this.inspector.isOpen = false;
      this.inspector.data = null;
    },

    setActiveActionHubTab(tab) {
      this.activeActionHubTab = tab;
    },

    setNavTab(tab) {
      this.setActiveTab(tab);
    },

    setActiveTab(tab) {
      if (tab === 'rules') {
        if (typeof window !== 'undefined') {
          window.open('https://s3t1y0.github.io/mm3e-reference/', '_blank', 'noopener,noreferrer');
        }
        return;
      }
      this.activeTab = tab;
      syncUiStateToUrl(this);
    },

    openModal(modalName) {
      if (this.modals[modalName] !== undefined) {
        if (modalName === 'exportStructure') {
          // If a parent modal is active (e.g. 'printOfficial' or 'markdown'),
          // remember it and keep it active in the background as an overlay
          const activeParent = Object.keys(this.modals).find(
            k => k !== 'exportStructure' && this.modals[k] === true
          );
          if (activeParent) {
            this.returnModal = activeParent;
          }
          this.modals.exportStructure = true;
          syncUiStateToUrl(this);
          return;
        }

        // For other primary modals, clear returnModal and close other modals
        this.returnModal = null;
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

        // If closing exportStructure and we have an active parent modal (e.g. 'printOfficial'),
        // ensure it remains/is restored to active
        if (modalName === 'exportStructure' && this.returnModal) {
          const parent = this.returnModal;
          this.returnModal = null;
          if (this.modals[parent] !== undefined) {
            this.modals[parent] = true;
          }
        }

        syncUiStateToUrl(this);
      }
    },

    closeAllModals() {
      this.returnModal = null;
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
    },

    setExportOption(key, val) {
      this.exportOptions[key] = val;
      this.saveExportOptions();
    },

    saveExportOptions() {
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('mm3e_export_config', JSON.stringify(this.exportOptions));
        } catch {
          /* Ignore quota exceeded or storage disabled errors */
        }
      }
    },

    applyExportPreset(preset) {
      if (preset === 'full') {
        this.exportOptions = {
          ...this.exportOptions,
          powerMechanics: true,
          effectRules: true,
          modifierRules: true,
          showAbilities: true,
          showDefenses: true,
          showOffense: true,
          showAdvantages: true,
          showSkills: true,
          skillsMode: 'all',
          showPowers: true,
          showMovement: true,
          showEquipment: true,
          showComplications: true,
          showNotes: true
        };
      } else if (preset === 'compact') {
        this.exportOptions = {
          ...this.exportOptions,
          powerMechanics: true,
          effectRules: false,
          modifierRules: false,
          showAbilities: true,
          showDefenses: true,
          showOffense: true,
          showAdvantages: true,
          showSkills: true,
          skillsMode: 'all',
          showPowers: true,
          showMovement: true,
          showEquipment: true,
          showComplications: true,
          showNotes: true
        };
      } else if (preset === 'minimal') {
        this.exportOptions = {
          ...this.exportOptions,
          powerMechanics: false,
          effectRules: false,
          modifierRules: false,
          showAbilities: true,
          showDefenses: true,
          showOffense: true,
          showAdvantages: true,
          showSkills: true,
          skillsMode: 'trained',
          showPowers: true,
          showMovement: false,
          showEquipment: true,
          showComplications: true,
          showNotes: false
        };
      }
      this.saveExportOptions();
    },

    resetExportOptions() {
      this.exportOptions = { ...DEFAULT_EXPORT_OPTIONS };
      this.saveExportOptions();
    },

    toggleBypassTrainedOnly(forceState) {
      if (typeof forceState === 'boolean') {
        this.bypassTrainedOnly = forceState;
      } else {
        this.bypassTrainedOnly = !this.bypassTrainedOnly;
      }
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('mm3e_bypass_trained_only', String(this.bypassTrainedOnly));
        } catch (e) {
          console.warn('Failed to save bypassTrainedOnly to localStorage:', e);
        }
      }
      if (this.bypassTrainedOnly) {
        this.showToast('Untrained bypass enabled: Trained Only restrictions unlocked.', 'info', 3500);
      } else {
        this.showToast('Untrained bypass disabled: Trained Only restrictions restored.', 'info', 3000);
      }
    }
  },

  getters: {
    currentExportPreset: (state) => {
      const o = state.exportOptions;
      if (
        o.powerMechanics && o.effectRules && o.modifierRules &&
        o.skillsMode === 'all' && o.showPowers && o.showMovement && o.showNotes &&
        o.showAbilities && o.showDefenses && o.showOffense && o.showAdvantages && o.showSkills && o.showEquipment && o.showComplications
      ) {
        return 'full';
      }
      if (
        o.powerMechanics && !o.effectRules && !o.modifierRules &&
        o.skillsMode === 'all' && o.showPowers && o.showMovement && o.showNotes &&
        o.showAbilities && o.showDefenses && o.showOffense && o.showAdvantages && o.showSkills && o.showEquipment && o.showComplications
      ) {
        return 'compact';
      }
      if (
        !o.powerMechanics && !o.effectRules && !o.modifierRules &&
        o.skillsMode === 'trained' && o.showPowers && !o.showMovement && !o.showNotes
      ) {
        return 'minimal';
      }
      return 'custom';
    }
  }
});
