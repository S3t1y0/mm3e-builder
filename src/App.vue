<template>
  <div class="app-container" :class="{ 'is-embed-mode': isEmbed }">
    <!-- Top Navigation Bar -->
    <header v-if="!isEmbed" class="top-menubar">
      <div class="menubar-left">
        <div class="app-logo">
          <div class="logo-icon-box">
            <i class="ri-shield-flash-line"></i>
          </div>
          <div class="logo-text-wrap">
            <span class="app-title">M&M 3e Builder</span>
            <span class="logo-badge">v1.0</span>
          </div>
        </div>

        <nav class="nav-tabs">
          <button
            class="nav-tab-btn"
            :class="{ active: uiStore.activeTab === 'sheet' }"
            @click="uiStore.setActiveTab('sheet')"
          >
            <i class="ri-file-user-line"></i>
            <span>Character Sheet</span>
          </button>
          <button
            class="nav-tab-btn"
            :class="{ active: uiStore.activeTab === 'wizard' }"
            @click="uiStore.setActiveTab('wizard')"
          >
            <i class="ri-compass-3-line"></i>
            <span>Character Wizard</span>
          </button>
          <a
            href="https://s3t1y0.github.io/mm3e-reference/"
            target="_blank"
            rel="noopener noreferrer"
            class="nav-tab-btn"
            title="Open Mutants & Masterminds 3E Rules Reference in a new tab"
          >
            <i class="ri-book-open-line"></i>
            <span>Rules Reference</span>
            <i class="ri-external-link-line nav-external-icon"></i>
          </a>
        </nav>
      </div>

      <!-- Active Hero Status Bar -->
      <div v-if="heroStore.character.name" class="menubar-center">
        <div class="header-hero-pill" :title="`Active Character: ${heroStore.character.name} (PL ${heroStore.character.powerLevel})`">
          <i class="ri-shield-user-line hero-pill-icon"></i>
          <span class="hero-pill-name">{{ heroStore.character.name }}</span>
          <span class="hero-pill-pl">PL {{ heroStore.character.powerLevel }}</span>
          <span class="hero-pill-pp" :class="{ 'pp-over': heroStore.remainingPP < 0 }">
            {{ heroStore.totalSpentPP }} / {{ heroStore.totalBudgetPP }} PP
          </span>
        </div>

        <!-- Local Storage Autosave Status Pill -->
        <button
          class="header-save-indicator"
          :class="{ 'is-saving': heroStore.isSaving }"
          :title="heroStore.isSaving ? 'Saving changes locally...' : 'Auto-saved to browser local storage. Click to open Vault.'"
          @click="handleToolAction('storage')"
        >
          <i :class="heroStore.isSaving ? 'ri-loader-4-line spin' : 'ri-hard-drive-2-line'"></i>
          <span class="save-status-text">{{ heroStore.isSaving ? 'Saving...' : 'Saved' }}</span>
        </button>
      </div>

      <div class="menubar-right">
        <!-- Primary Action: Share -->
        <button class="nav-btn-share" @click="uiStore.openModal('share')" title="Share Hero Link">
          <i class="ri-share-forward-line"></i>
          <span>Share</span>
        </button>

        <!-- Secondary Actions: Tools Dropdown -->
        <div class="nav-dropdown-wrap" ref="toolsDropdownRef">
          <button
            class="nav-btn-tools"
            :class="{ active: isToolsOpen }"
            @click="isToolsOpen = !isToolsOpen"
            title="File, Export & Sheet Utilities"
          >
            <i class="ri-tools-line"></i>
            <span>Tools</span>
            <i class="ri-arrow-down-s-line chevron-icon" :class="{ rotated: isToolsOpen }"></i>
          </button>

          <!-- Dropdown Menu Card -->
          <div v-if="isToolsOpen" class="nav-dropdown-menu">
            <div class="dropdown-section-label">File & Storage</div>
            <button class="dropdown-item" @click="handleToolAction('storage')">
              <i class="ri-hard-drive-2-line icon-teal"></i>
              <div class="dropdown-item-text">
                <strong>Saved Heroes Vault</strong>
                <span>Manage local character slots</span>
              </div>
            </button>

            <button class="dropdown-item" @click="handleToolAction('exportImport')">
              <i class="ri-folder-transfer-line icon-teal"></i>
              <div class="dropdown-item-text">
                <strong>Export / Import JSON</strong>
                <span>Backup or load hero JSON file</span>
              </div>
            </button>

            <button class="dropdown-item" @click="handleToolAction('roll20')">
              <i class="ri-printer-line icon-sapphire"></i>
              <div class="dropdown-item-text">
                <strong>Print / Roll20 Sheet</strong>
                <span>Print sheet & Roll20 macros</span>
              </div>
            </button>

            <div class="dropdown-divider"></div>
            <div class="dropdown-section-label">Presets</div>

            <button class="dropdown-item" @click="handleToolAction('sample')">
              <i class="ri-user-shared-line icon-amber"></i>
              <div class="dropdown-item-text">
                <strong>Sample Hero</strong>
                <span>Load PL 10 Aegis Valkyrie</span>
              </div>
            </button>

            <div class="dropdown-divider"></div>
            <div class="dropdown-section-label danger">Danger Zone</div>

            <button class="dropdown-item danger" @click="handleToolAction('reset')">
              <i class="ri-restart-line icon-red"></i>
              <div class="dropdown-item-text">
                <strong>Reset Sheet</strong>
                <span>Clear all hero stats and powers</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- MAIN BODY / ACTIVE WORKSPACE -->
    <main
      class="main-content"
      :style="isEmbed ? 'padding: 0.5rem 0.75rem 2rem; max-width: 100%; margin: 0 auto; width: 100%;' : 'padding: 1.25rem 1.5rem; max-width: 1560px; margin: 0 auto; width: 100%;'"
    >
      <!-- RUNTIME ERROR BOUNDARY FALLBACK (R-27) -->
      <div v-if="runtimeError" class="card mb-3" style="background: rgba(239, 68, 68, 0.1); border: 1px solid var(--accent-danger); border-radius: var(--radius-md); padding: 1.25rem; text-align: center;">
        <i class="ri-alert-line" style="font-size: 1.75rem; color: var(--accent-danger); display: block; margin-bottom: 0.5rem;"></i>
        <h3 style="color: #fff; margin-bottom: 0.35rem; font-size: 1.05rem;">Tactical Sheet Recovery State</h3>
        <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 0.85rem;">{{ runtimeError.message || 'An unexpected rendering error occurred.' }}</p>
        <button class="btn btn-secondary btn-sm" @click="runtimeError = null">
          <i class="ri-refresh-line"></i> Dismiss & Retry
        </button>
      </div>
      <!-- HERO COMMAND HUB BANNER (For Wizard & Rules Reference views) -->
      <div v-if="!isEmbed && uiStore.activeTab !== 'sheet'" class="card mb-3" style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9)); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1rem 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div style="display: flex; align-items: center; gap: 0.85rem;">
            <div style="width: 40px; height: 40px; border-radius: var(--radius-sm); background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.35); display: flex; align-items: center; justify-content: center; font-size: 1.25rem; color: var(--accent-primary);">
              <i class="ri-shield-user-line"></i>
            </div>
            <div>
              <div style="font-size: 0.95rem; font-weight: 800; color: #fff; display: flex; align-items: center; gap: 0.5rem;">
                <span>{{ heroStore.character.name || 'Hero Registry' }}</span>
                <span class="badge badge-primary" style="font-size: 0.7rem;">PL {{ heroStore.character.powerLevel }}</span>
                <span v-if="heroStore.character.concept?.archetype" class="badge badge-secondary" style="font-size: 0.7rem;">{{ heroStore.character.concept.archetype }}</span>
              </div>
              <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 0.2rem;">
                {{ heroStore.character.identity || 'Secret Identity' }} &bull; {{ heroStore.character.player || 'Player' }} &bull; {{ heroStore.character.concept?.origin || 'Origin Unspecified' }}
              </div>
            </div>
          </div>
          <div style="display: flex; gap: 0.5rem; align-items: center;">
            <button class="btn btn-secondary btn-sm" @click="uiStore.openModal('roll20')">
              <i class="ri-printer-line"></i> Export Sheet
            </button>
          </div>
        </div>
      </div>

      <!-- TAB 1: CHARACTER SHEET -->
      <div v-if="uiStore.activeTab === 'sheet'">
        <TacticalCharacterSheet />
      </div>

      <!-- TAB 2: CHARACTER CREATION WIZARD -->
      <div v-else-if="uiStore.activeTab === 'wizard'">
        <CharacterWizard />
      </div>

      <!-- TAB 3: RULES REFERENCE -->
      <div v-else-if="uiStore.activeTab === 'rules'">
        <RulesReference />
      </div>
    </main>

    <!-- DEDICATED FULL-WINDOW POWER STUDIO (NOT FLOATING MODAL) -->
    <PowerStudioWorkspace />

    <!-- MODALS -->
    <ExportImportModal />
    <ShareModal />
    <Roll20PrintModal />
    <AdvantageLibraryModal />
    <ConditionPickerModal />

    <!-- FLOATING TACTICAL DICE ROLL HUD -->
    <DiceRollHud />

    <!-- TOAST NOTIFICATIONS CONTAINER -->
    <div style="position: fixed; bottom: 1.5rem; right: 1.5rem; z-index: var(--z-toast); display: flex; flex-direction: column; gap: 0.5rem;">
      <div
        v-for="toast in uiStore.toasts"
        :key="toast.id"
        class="toast-notification"
        style="background: #1e293b; border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0.65rem 1rem; color: #fff; font-size: 0.82rem; font-weight: 600; box-shadow: 0 8px 24px rgba(0,0,0,0.5); display: flex; align-items: center; gap: 0.5rem;"
      >
        <i class="ri-checkbox-circle-fill" style="color: #34d399;"></i>
        <span>{{ toast.message }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, onErrorCaptured } from 'vue';
import { useHeroStore } from './stores/heroStore.js';
import { useUiStore } from './stores/uiStore.js';
import { usePowerBuilderStore } from './stores/powerBuilderStore.js';
import { createEmptyPower, createEmptyEffect } from './rules/powerEngine.js';
import { parseSharedCharacterFromHash } from './services/shareService.js';
import { isEmbedMode, getEmbedType, initEmbedBridge } from './services/embedBridge.js';

import TacticalCharacterSheet from './components/sheet/TacticalCharacterSheet.vue';
import CharacterWizard from './components/wizard/CharacterWizard.vue';
import RulesReference from './components/rules/RulesReference.vue';
import PowerStudioWorkspace from './components/power-studio/PowerStudioWorkspace.vue';
import ExportImportModal from './components/modals/ExportImportModal.vue';
import ShareModal from './components/modals/ShareModal.vue';
import Roll20PrintModal from './components/modals/Roll20PrintModal.vue';
import AdvantageLibraryModal from './components/modals/AdvantageLibraryModal.vue';
import ConditionPickerModal from './components/modals/ConditionPickerModal.vue';
import DiceRollHud from './components/sheet/DiceRollHud.vue';

const heroStore = useHeroStore();
const uiStore = useUiStore();
const builderStore = usePowerBuilderStore();

const isEmbed = ref(isEmbedMode());
const isToolsOpen = ref(false);
const toolsDropdownRef = ref(null);
const runtimeError = ref(null);

onErrorCaptured((err) => {
  runtimeError.value = err;
  console.error('[MM3e Error Boundary]:', err);
  return false;
});

// Automatic continuous saving to local storage
let autosaveTimer = null;
watch(
  () => heroStore.character,
  () => {
    if (autosaveTimer) clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(() => {
      heroStore.saveToStorage();
    }, 350);
  },
  { deep: true }
);

// Synchronize body scroll lock when store modals open/close
watch(
  [() => uiStore.modals, () => builderStore.isOpen],
  () => {
    const isAnyModalOpen = Object.values(uiStore.modals).some(Boolean) || Boolean(builderStore.isOpen);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('modal-open', isAnyModalOpen);
      document.body.classList.toggle('modal-open', isAnyModalOpen);
    }
  },
  { deep: true, immediate: true }
);

function flushSave() {
  heroStore.saveToStorage();
}

function handleClickOutside(event) {
  if (isToolsOpen.value && toolsDropdownRef.value && !toolsDropdownRef.value.contains(event.target)) {
    isToolsOpen.value = false;
  }
}

function handleKeyDown(event) {
  if (event.key === 'Escape' || event.code === 'Escape') {
    isToolsOpen.value = false;
    if (builderStore.isOpen) {
      builderStore.closeStudio();
      return;
    }
    const hasOpenModal = Object.values(uiStore.modals).some(Boolean);
    if (hasOpenModal) {
      uiStore.closeAllModals();
      return;
    }
  }
}

function handleToolAction(action) {
  isToolsOpen.value = false;
  if (action === 'storage') {
    uiStore.openExportImport('storage');
  } else if (action === 'exportImport') {
    uiStore.openExportImport('export');
  } else if (action === 'roll20') {
    uiStore.openModal('roll20');
  } else if (action === 'sample') {
    loadSampleHero();
  } else if (action === 'reset') {
    if (window.confirm('Reset this character sheet? All current hero stats and powers will be cleared.')) {
      heroStore.resetCharacter();
      uiStore.showToast('Character sheet has been reset.', 'info');
    }
  }
}

async function loadFromHash() {
  if (typeof window === 'undefined' || !window.location.hash) return;

  const hash = window.location.hash;
  const isKvLink = hash.startsWith('#s=');

  if (isKvLink) {
    uiStore.showToast('Fetching shared hero from Cloudflare KV...', 'info', 2500);
  }

  try {
    const sharedChar = await parseSharedCharacterFromHash(hash);
    if (sharedChar && (sharedChar.name || sharedChar.abilities)) {
      heroStore.loadCharacter(sharedChar);
      uiStore.showToast(
        `Loaded shared hero "${sharedChar.name || 'Hero'}" (PL ${sharedChar.powerLevel || 10})!`,
        'success',
        4500
      );
    } else if (isKvLink) {
      uiStore.showToast('Could not find or decode character from Cloudflare KV link.', 'error', 4500);
    }
  } catch (err) {
    console.error('Failed to load shared character from hash:', err);
    uiStore.showToast(
      isKvLink ? 'Failed to fetch character from Cloudflare KV. Check your connection or link ID.' : 'Failed to parse character from URL hash.',
      'error',
      4500
    );
  }
}

onMounted(() => {
  if (isEmbed.value) {
    const embedType = getEmbedType();
    if (embedType === 'wizard') {
      uiStore.setActiveTab('wizard');
      // Initialize with query params if provided
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const faction = params.get('faction');
        const role = params.get('role');
        const pl = params.get('pl');
        const name = params.get('name');
        if (faction) heroStore.character.faction = faction;
        if (role) heroStore.character.role = role;
        if (pl && !isNaN(Number(pl))) {
          heroStore.character.powerLevel = Number(pl);
          heroStore.character.powerPoints = Number(pl) * 15;
        }
        if (name) heroStore.character.name = name;
      }
    } else {
      uiStore.setActiveTab('sheet');
    }

    initEmbedBridge({
      onLoadCharacter: (charData) => {
        if (charData) {
          heroStore.loadCharacter(charData);
        }
      },
      onInitWizard: (wizardConfig) => {
        uiStore.setActiveTab('wizard');
        if (wizardConfig) {
          if (wizardConfig.faction) heroStore.character.faction = wizardConfig.faction;
          if (wizardConfig.role) heroStore.character.role = wizardConfig.role;
          if (wizardConfig.pl) {
            heroStore.character.powerLevel = Number(wizardConfig.pl);
            heroStore.character.powerPoints = Number(wizardConfig.pl) * 15;
          }
          if (wizardConfig.name) heroStore.character.name = wizardConfig.name;
        }
      }
    });
  } else {
    loadFromHash();
  }

  if (typeof window !== 'undefined') {
    if (!isEmbed.value) {
      window.addEventListener('hashchange', loadFromHash);
      window.addEventListener('beforeunload', flushSave);
      window.addEventListener('pagehide', flushSave);
    }
    document.addEventListener('click', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
  }
});

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    if (!isEmbed.value) {
      window.removeEventListener('hashchange', loadFromHash);
      window.removeEventListener('beforeunload', flushSave);
      window.removeEventListener('pagehide', flushSave);
    }
    document.removeEventListener('click', handleClickOutside);
    window.removeEventListener('keydown', handleKeyDown);
  }
});

function loadSampleHero() {
  heroStore.character.name = 'Aegis Valkyrie';
  heroStore.character.player = 'Campaign Player';
  heroStore.character.identity = 'Elena Ward';
  heroStore.character.powerLevel = 10;

  // Abilities
  heroStore.character.abilities = {
    STR: 4, STA: 4, AGL: 2, DEX: 2,
    FGT: 6, INT: 2, AWE: 2, PRE: 2
  };

  // Defenses
  heroStore.character.defensesBought = {
    DODGE: 4, PARRY: 2, FORTITUDE: 4, WILL: 4, TOUGHNESS: 0
  };

  // Skills
  heroStore.character.skills = [
    { id: 'sk_1', name: 'Close Combat', subtype: 'Unarmed', ranks: 4 },
    { id: 'sk_2', name: 'Ranged Combat', subtype: 'Battlesuit', ranks: 4 },
    { id: 'sk_3', name: 'Athletics', subtype: '', ranks: 4 },
    { id: 'sk_4', name: 'Perception', subtype: '', ranks: 4 },
    { id: 'sk_5', name: 'Technology', subtype: '', ranks: 4 },
    { id: 'sk_6', name: 'Expertise', subtype: 'Tactics', ranks: 4 }
  ];

  // Advantages
  heroStore.character.advantages = [
    { id: 'adv_1', name: 'Power Attack', ranks: 1 },
    { id: 'adv_2', name: 'All-out Attack', ranks: 1 },
    { id: 'adv_3', name: 'Improved Initiative', ranks: 1 },
    { id: 'adv_4', name: 'Evasion', ranks: 1 },
    { id: 'adv_5', name: 'Defensive Roll', ranks: 2 }
  ];

  // Powers
  const p1 = createEmptyPower();
  p1.name = 'Solar Blast';
  p1.type = 'standard';
  p1.mainEffect = createEmptyEffect('Damage');
  p1.mainEffect.ranks = 8;
  p1.mainEffect.range = 'Ranged';

  const p1Linked = createEmptyEffect('Affliction');
  p1Linked.name = 'Secondary Thermal Flash';
  p1Linked.ranks = 6;
  p1Linked.range = 'Ranged';
  p1.linkedEffects = [p1Linked];

  const p2 = createEmptyPower();
  p2.name = 'Apex Battlesuit';
  p2.type = 'device';
  p2.deviceConfig = { type: 'removable', descriptor: 'High-Tech Exosuit', toughness: 10 };

  const sub1 = {
    id: 'sub_flight',
    name: 'Micro-Thrusters',
    effect: createEmptyEffect('Flight'),
    linkedEffects: [],
    alternateEffects: []
  };
  sub1.effect.ranks = 6;

  const sub2 = {
    id: 'sub_cannon',
    name: 'Particle Cannon',
    activeSlotId: 'main',
    effect: {
      ...createEmptyEffect('Damage'),
      name: 'Heavy Particle Blast',
      ranks: 10,
      range: 'Ranged',
      extras: [{ name: 'Multiattack', cost: 1, type: 'per_rank', ranks: 1, desc: 'Multiple targets or rapid burst' }],
      flaws: [{ name: 'Distracting', cost: -1, type: 'per_rank', ranks: 1, desc: 'Vulnerable while firing' }]
    },
    linkedEffects: [
      {
        id: 'lnk_burn',
        name: 'Thermal Singe',
        baseEffect: 'Weaken',
        ranks: 6,
        action: 'Standard',
        range: 'Ranged',
        duration: 'Instant',
        resistance: 'Fortitude',
        extras: [],
        flaws: []
      }
    ],
    alternateEffects: [
      {
        id: 'alt_stun',
        name: 'Neural Stun Pulse',
        cost: 1,
        effect: {
          ...createEmptyEffect('Affliction'),
          name: 'Neural Stun Pulse',
          baseEffect: 'Affliction',
          ranks: 8,
          range: 'Ranged',
          action: 'Standard',
          duration: 'Instant',
          resistance: 'Fortitude',
          extras: [],
          flaws: []
        },
        linkedEffects: []
      }
    ]
  };

  p2.devicePowers = [sub1, sub2];

  heroStore.character.powers = [p1, p2];
  heroStore.pushHistory();

  uiStore.showToast('Loaded complete sample hero "Aegis Valkyrie" (PL 10)!', 'success');
}
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  min-height: 100dvh;
  background-color: var(--bg-app);
  color: var(--text-primary);
  font-family: var(--font-sans);
}

.app-container.is-embed-mode {
  min-height: auto;
  background-color: transparent;
}

.top-menubar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.65rem 1.5rem;
  background: rgba(11, 16, 32, 0.98);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  gap: 1rem;
}

.menubar-left {
  display: flex;
  align-items: center;
  gap: 1.75rem;
}

/* App Logo */
.app-logo {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  user-select: none;
}

.logo-icon-box {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: rgba(0, 111, 184, 0.15);
  border: 1px solid rgba(0, 111, 184, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #38bdf8;
  font-size: 1.1rem;
  box-shadow: 0 0 10px rgba(0, 111, 184, 0.25);
  transition: transform var(--trans-fast), box-shadow var(--trans-fast);
}

.logo-icon-box:hover {
  transform: scale(1.05);
  box-shadow: 0 0 14px rgba(0, 111, 184, 0.45);
}

.logo-text-wrap {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.app-title {
  font-size: 0.98rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.01em;
}

.logo-badge {
  font-size: 0.62rem;
  font-weight: 800;
  color: #60a5fa;
  background: rgba(0, 111, 184, 0.15);
  border: 1px solid rgba(0, 111, 184, 0.35);
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
  letter-spacing: 0.04em;
}

/* Minimalist Pro Studio Nav Tabs */
.nav-tabs {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  position: relative;
}

.nav-tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-secondary);
  font-size: 0.83rem;
  font-weight: 600;
  padding: 0.42rem 0.85rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  position: relative;
  transition: color var(--trans-fast), background-color var(--trans-fast), border-color var(--trans-fast);
  white-space: nowrap;
  text-decoration: none;
}

.nav-external-icon {
  font-size: 0.72rem !important;
  opacity: 0.6;
  margin-left: -0.15rem;
  transition: opacity var(--trans-fast), transform var(--trans-fast);
}

.nav-tab-btn:hover .nav-external-icon {
  opacity: 1;
  transform: translate(1px, -1px);
}

.nav-tab-btn i {
  font-size: 0.95rem;
  color: var(--text-muted);
  transition: color var(--trans-fast);
}

.nav-tab-btn:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.06);
}

.nav-tab-btn:hover i {
  color: var(--text-primary);
}

.nav-tab-btn.active {
  color: #ffffff;
  background: rgba(0, 111, 184, 0.12);
  border-color: rgba(0, 111, 184, 0.35);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.nav-tab-btn.active i {
  color: #38bdf8;
}

.nav-tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -0.65rem;
  left: 0.45rem;
  right: 0.45rem;
  height: 2px;
  background: var(--accent-primary);
  border-radius: 2px;
  box-shadow: 0 0 8px rgba(0, 111, 184, 0.7);
}

.nav-tab-btn:active {
  transform: scale(0.97);
}

/* Active Hero Center Pill */
.menubar-center {
  display: flex;
  align-items: center;
}

.header-hero-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-pill);
  padding: 0.22rem 0.75rem;
  font-size: 0.74rem;
  color: var(--text-secondary);
}

.hero-pill-icon {
  color: var(--accent-primary);
  font-size: 0.85rem;
}

.hero-pill-name {
  font-weight: 700;
  color: var(--text-primary);
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hero-pill-pl {
  font-size: 0.66rem;
  font-weight: 800;
  background: rgba(0, 111, 184, 0.18);
  border: 1px solid rgba(0, 111, 184, 0.35);
  color: #60a5fa;
  padding: 0.08rem 0.35rem;
  border-radius: 4px;
}

.hero-pill-pp {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}

.hero-pill-pp.pp-over {
  color: #ef4444;
}

/* Local Storage Save Indicator */
.header-save-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #34d399;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.25rem 0.65rem;
  border-radius: var(--radius-pill);
  cursor: pointer;
  transition: all var(--trans-fast);
  margin-left: 0.5rem;
  font-family: inherit;
}

.header-save-indicator:hover {
  background: rgba(16, 185, 129, 0.22);
  border-color: rgba(16, 185, 129, 0.45);
  color: #6ee7b7;
  transform: translateY(-1px);
}

.header-save-indicator.is-saving {
  background: rgba(56, 189, 248, 0.12);
  border-color: rgba(56, 189, 248, 0.3);
  color: #7dd3fc;
}

.spin {
  animation: spinLoader 0.9s linear infinite;
}

@keyframes spinLoader {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Right Actions */
.menubar-right {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.nav-btn-share {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: linear-gradient(135deg, #006fb8, #005a96);
  border: 1px solid rgba(42, 143, 214, 0.5);
  color: #ffffff;
  font-size: 0.82rem;
  font-weight: 700;
  padding: 0.38rem 0.85rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  box-shadow: 0 1px 6px rgba(0, 111, 184, 0.35);
  transition: transform var(--trans-fast), box-shadow var(--trans-fast), background-color var(--trans-fast);
  white-space: nowrap;
}

.nav-btn-share:hover {
  background: linear-gradient(135deg, #2a8fd6, #006fb8);
  box-shadow: 0 2px 10px rgba(0, 111, 184, 0.5);
}

.nav-btn-share:active {
  transform: scale(0.96);
}

.nav-dropdown-wrap {
  position: relative;
}

.nav-btn-tools {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: var(--text-primary);
  font-size: 0.82rem;
  font-weight: 600;
  padding: 0.38rem 0.8rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background-color var(--trans-fast), border-color var(--trans-fast);
  white-space: nowrap;
}

.nav-btn-tools:hover,
.nav-btn-tools.active {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(0, 111, 184, 0.45);
  color: #ffffff;
}

.nav-btn-tools:active {
  transform: scale(0.96);
}

.chevron-icon {
  font-size: 0.85rem;
  color: var(--text-muted);
  transition: transform 0.2s ease;
}

.chevron-icon.rotated {
  transform: rotate(180deg);
}

.nav-dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 270px;
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--radius-md);
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.6), 0 0 1px rgba(255, 255, 255, 0.2);
  padding: 0.45rem;
  z-index: var(--z-dropdown);
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  animation: dropdownFade 140ms ease-out;
}

@keyframes dropdownFade {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}

.dropdown-section-label {
  font-size: 0.62rem;
  font-weight: 800;
  color: var(--text-muted);
  padding: 0.35rem 0.6rem 0.15rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.dropdown-section-label.danger {
  color: #f87171;
}

.dropdown-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  margin: 0.25rem 0.35rem;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.55rem 0.65rem;
  background: transparent;
  border: none;
  border-radius: var(--radius-xs);
  cursor: pointer;
  text-align: left;
  width: 100%;
  color: var(--text-primary);
  transition: background-color var(--trans-fast);
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.07);
}

.dropdown-item:active {
  transform: scale(0.98);
}

.dropdown-item i {
  font-size: 1.15rem;
  flex-shrink: 0;
}

.icon-teal { color: #2dd4bf; }
.icon-sapphire { color: #38bdf8; }
.icon-blue { color: #38bdf8; }
.icon-amber { color: #fbbf24; }
.icon-red { color: #f87171; }

.dropdown-item-text {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.dropdown-item-text strong {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--text-primary);
}

.dropdown-item-text span {
  font-size: 0.68rem;
  color: var(--text-muted);
}

.dropdown-item.danger:hover {
  background: rgba(239, 68, 68, 0.15);
}

.dropdown-item.danger:hover strong {
  color: #fca5a5;
}

@media (max-width: 1024px) {
  .menubar-center {
    display: none;
  }
}

@media (max-width: 640px) {
  .nav-tab-btn span {
    display: none;
  }
  .app-title {
    display: none;
  }
  .menubar-left {
    gap: 0.75rem;
  }
}
</style>
