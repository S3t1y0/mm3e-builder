<template>
  <div v-if="builderStore.isOpen" class="power-studio-fullscreen-window">
    <!-- TOP WORKSTATION COMMAND BAR (Full Window Header) -->
    <header class="workspace-header-bar">
      <div class="header-left-cluster">
        <button
          type="button"
          class="btn btn-secondary btn-sm btn-back-sheet"
          @click="builderStore.closeModal"
          :title="uiStore.activeTab === 'wizard' ? 'Close Power Studio and return to Wizard' : 'Close Power Studio and return to Character Sheet'"
        >
          <i class="ri-arrow-left-line"></i>
          <span>{{ uiStore.activeTab === 'wizard' ? 'Back to Wizard' : 'Back to Sheet' }}</span>
        </button>

        <div class="studio-logo-cube">
          <i class="ri-flashlight-fill"></i>
        </div>

        <div class="power-switcher-dropdown-group" v-if="heroStore.character.powers?.length > 0">
          <label class="switcher-label">Switch Power:</label>
          <select
            class="power-selector-select"
            :value="currentPowerSelectValue"
            @change="handlePowerSelectChange($event.target.value)"
          >
            <option
              v-for="(pow, pIdx) in heroStore.character.powers"
              :key="pow.id || pIdx"
              :value="pIdx"
            >
              {{ pow.name || `Power #${pIdx + 1}` }} ({{ calculatePowerTotalCost(pow) }} PP • {{ pow.type?.toUpperCase() }})
            </option>
            <option value="new_standard">+ Create New Standard Power</option>
            <option value="new_device">+ Create New Device Container</option>
          </select>
        </div>

        <div class="power-title-editor">
          <input
            v-model="builderStore.power.name"
            type="text"
            class="power-name-input"
            placeholder="Enter Power Name (e.g. Solar Blast, Aegis Battlesuit)..."
          />
          <div class="power-meta-tags">
            <span class="type-pill" :class="builderStore.power.type">
              <i :class="builderStore.power.type === 'device' ? 'ri-shield-keyhole-line' : 'ri-flashlight-line'"></i>
              {{ builderStore.power.type === 'device' ? 'Device Container' : 'Standard Power' }}
            </span>
            <span v-if="builderStore.power.alternateEffects?.length > 0" class="array-indicator-pill">
              <i class="ri-shuffle-line"></i> Array ({{ builderStore.power.alternateEffects.length + 1 }} Modes)
            </span>
            <span v-if="builderStore.power.linkedEffects?.length > 0" class="linked-indicator-pill">
              <i class="ri-links-line"></i> Linked ({{ builderStore.power.linkedEffects.length }})
            </span>
            <span v-if="builderStore.power.activation && builderStore.power.activation !== 'none'" class="activation-indicator-pill">
              <i class="ri-timer-flash-line"></i> {{ builderStore.power.activation === 'move' ? 'Activation (Move, -1 PP)' : 'Activation (Standard, -2 PP)' }}
            </span>
            <span class="rules-source-tag">Mutants & Masterminds 3E</span>
          </div>
        </div>
      </div>

      <div class="header-actions-cluster">
        <button
          type="button"
          class="btn btn-secondary btn-sm"
          @click="builderStore.openNewPower('standard')"
          title="Create a new fresh power"
        >
          <i class="ri-add-line"></i>
          <span>New Power</span>
        </button>

        <button
          type="button"
          class="btn btn-primary btn-save-power"
          @click="handleSave"
        >
          <i class="ri-save-line"></i>
          <span>Save Power ({{ builderStore.totalCost }} PP)</span>
        </button>

        <button
          type="button"
          class="btn-icon btn-close-window"
          @click="builderStore.closeModal"
          title="Close Window"
        >
          <i class="ri-close-line"></i>
        </button>
      </div>
    </header>

    <!-- WORKSTATION 2-COLUMN MAIN BODY -->
    <div class="workspace-main-content">
      <!-- LEFT COLUMN: POWER ARCHITECTURE & EDITOR WORKBENCH -->
      <div class="workspace-editor-col">
        <!-- Strictly 2 Architectures: Standard vs Device Container -->
        <StructureSelector />

        <!-- 1. DEVICE CONTAINER ARCHITECTURE -->
        <DeviceContainerStudio v-if="builderStore.power.type === 'device'" />

        <!-- 2. STANDARD POWER ARCHITECTURE (With on-demand Array Suite & Linked Effects) -->
        <template v-else>
          <!-- On-demand Array / Alternate Effects Suite -->
          <TopLevelArrayStudio />

          <!-- Effect Editor Canvas -->
          <EffectEditorCanvas
            :key="'workspace_canvas_' + builderStore.currentEditingEffect?.id"
            :effect="builderStore.currentEditingEffect"
            :title="canvasTitle"
          />
        </template>
      </div>

      <!-- Right Column: Cost Breakdown Sidebar -->
      <div class="workspace-sidebar-col">
        <CostBreakdownSidebar />
      </div>
    </div>

    <!-- MODIFIERS INSPECTOR MODAL -->
    <ModifierInspectorModal />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { usePowerBuilderStore } from '../../stores/powerBuilderStore.js';
import { useHeroStore } from '../../stores/heroStore.js';
import { useUiStore } from '../../stores/uiStore.js';
import { calculatePowerTotalCost } from '../../rules/powerEngine.js';

import StructureSelector from './StructureSelector.vue';
import DeviceContainerStudio from './DeviceContainerStudio.vue';
import TopLevelArrayStudio from './TopLevelArrayStudio.vue';
import EffectEditorCanvas from './EffectEditorCanvas.vue';
import CostBreakdownSidebar from './CostBreakdownSidebar.vue';
import ModifierInspectorModal from './ModifierInspectorModal.vue';

const builderStore = usePowerBuilderStore();
const heroStore = useHeroStore();
const uiStore = useUiStore();

const currentPowerSelectValue = computed(() => {
  if (builderStore.editingIndex >= 0 && builderStore.editingIndex < (heroStore.character.powers?.length || 0)) {
    return builderStore.editingIndex;
  }
  return 'custom';
});

const canvasTitle = computed(() => {
  if (builderStore.activeTargetType === 'slot') {
    const slot = builderStore.power.alternateEffects?.[builderStore.activeSlotIndex];
    return `Editing Alternate Slot: ${slot?.name || 'Slot'}`;
  }
  return `Primary Superhuman Effect: ${builderStore.power.mainEffect?.name || 'Primary'}`;
});

function handlePowerSelectChange(val) {
  if (val === 'new_standard') {
    builderStore.openNewPower('standard');
  } else if (val === 'new_device') {
    builderStore.openNewPower('device');
  } else {
    const pIdx = Number(val);
    const rawPower = heroStore.character.powers[pIdx];
    if (rawPower) {
      builderStore.openEditPower(pIdx, rawPower);
    }
  }
}

function handleSave() {
  if (!builderStore.power.name || builderStore.power.name.trim() === '') {
    builderStore.power.name = builderStore.power.type === 'device' ? 'Unnamed Device' : 'Unnamed Power';
  }

  if (builderStore.editingIndex === -1) {
    heroStore.addPower(builderStore.power);
    uiStore.showToast(`Saved power: ${builderStore.power.name}`, 'success');
  } else {
    heroStore.updatePower(builderStore.editingIndex, builderStore.power);
    uiStore.showToast(`Updated power: ${builderStore.power.name}`, 'success');
  }

  builderStore.closeModal();
}
</script>

<style scoped>
.power-studio-fullscreen-window {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 5000;
  background: var(--bg-main, #0b0f19);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

/* ==========================================================================
   WORKSTATION HEADER BAR
   ========================================================================== */
.workspace-header-bar {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98));
  border-bottom: 1.5px solid var(--border-color);
  padding: 0.75rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.25rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
}

.header-left-cluster {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  min-width: 0;
  flex-wrap: wrap;
}

.studio-logo-cube {
  width: 46px;
  height: 46px;
  background: rgba(220, 38, 38, 0.15);
  border: 1.5px solid rgba(220, 38, 38, 0.4);
  color: var(--accent-primary);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.power-switcher-dropdown-group {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.switcher-label {
  font-size: 0.65rem;
  font-weight: 800;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-caps);
}

.power-selector-select {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0.35rem 0.65rem;
  border-radius: var(--radius-xs);
  outline: none;
  cursor: pointer;
  max-width: 250px;
}

.power-selector-select:focus {
  border-color: var(--accent-primary);
}

.power-title-editor {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  min-width: 280px;
}

.power-name-input {
  background: transparent;
  border: 1px solid transparent;
  color: #fff;
  font-size: 1.35rem;
  font-weight: 900;
  padding: 0.2rem 0.45rem;
  border-radius: var(--radius-xs);
  outline: none;
  font-family: inherit;
  letter-spacing: -0.01em;
  transition: background-color var(--trans-fast), border-color var(--trans-fast);
}

.power-name-input:hover,
.power-name-input:focus {
  background: var(--bg-surface);
  border-color: var(--border-color);
}

.power-meta-tags {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.type-pill {
  font-size: 0.68rem;
  font-weight: 800;
  padding: 0.15rem 0.45rem;
  border-radius: var(--radius-xs);
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.type-pill.standard {
  background: rgba(220, 38, 38, 0.15);
  color: #f87171;
  border: 1px solid rgba(220, 38, 38, 0.3);
}

.type-pill.device {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.array-indicator-pill {
  font-size: 0.68rem;
  font-weight: 800;
  background: rgba(168, 85, 247, 0.15);
  color: #c084fc;
  border: 1px solid rgba(168, 85, 247, 0.3);
  padding: 0.15rem 0.45rem;
  border-radius: var(--radius-xs);
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  letter-spacing: 0.06em;
}

.linked-indicator-pill {
  font-size: 0.68rem;
  font-weight: 800;
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.3);
  padding: 0.15rem 0.45rem;
  border-radius: var(--radius-xs);
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  letter-spacing: 0.06em;
}

.activation-indicator-pill {
  font-size: 0.68rem;
  font-weight: 800;
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.35);
  padding: 0.15rem 0.45rem;
  border-radius: var(--radius-xs);
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  letter-spacing: 0.06em;
}

.rules-source-tag {
  font-size: 0.68rem;
  color: var(--text-muted);
}

.header-actions-cluster {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex-wrap: wrap;
}

.btn-save-power {
  box-shadow: 0 4px 14px rgba(220, 38, 38, 0.4);
}

.btn-save-power:active {
  transform: scale(0.97);
}

/* ==========================================================================
   WORKSTATION 2-COLUMN MAIN CONTENT
   ========================================================================== */
.workspace-main-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem 2rem;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 1.75rem;
  max-width: 1720px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
  align-items: start;
}

@media (max-width: 1024px) {
  .workspace-main-content {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
}

.workspace-editor-col {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  min-width: 0;
}

.workspace-sidebar-col {
  position: sticky;
  top: 1rem;
}

.btn-back-sheet {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-weight: 700;
}

.btn-back-sheet:active {
  transform: scale(0.97);
}

.btn-close-window {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 1.35rem;
  cursor: pointer;
  padding: 0.35rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-xs);
  transition: color var(--trans-fast), background-color var(--trans-fast), transform var(--trans-fast);
}

.btn-close-window:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

.btn-close-window:active {
  transform: scale(0.92);
}
</style>
