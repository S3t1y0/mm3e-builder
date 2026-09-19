<template>
  <div v-if="builderStore.isOpen" class="modal-overlay open" @click.self="builderStore.closeModal">
    <div class="modal-dialog modal-xl power-studio-dialog">
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="header-main-group">
          <div class="header-icon-box">
            <i class="ri-flashlight-fill"></i>
          </div>

          <div class="header-name-inputs">
            <input
              v-model="builderStore.power.name"
              type="text"
              class="power-title-input"
              placeholder="Enter Power Name (e.g. Solar Blast, Aegis Shield)..."
            />
            <span class="power-studio-subtitle">
              Mutants & Masterminds 3e Power Studio •
              <span class="type-highlight">{{ builderStore.power.type.toUpperCase() }}</span>
            </span>
          </div>
        </div>

        <div class="modal-header-actions">
          <button type="button" class="btn btn-secondary" @click="builderStore.closeModal">
            Cancel
          </button>
          <button type="button" class="btn btn-primary" @click="handleSave">
            <i class="ri-save-line"></i>
            <span>Save Power ({{ builderStore.totalCost }} PP)</span>
          </button>
          <button type="button" class="btn-icon" @click="builderStore.closeModal">
            <i class="ri-close-line"></i>
          </button>
        </div>
      </div>

      <!-- Modal Body (2-Column Studio Layout) -->
      <div class="modal-body power-studio-body">
        <div class="studio-main-workspace">
          <!-- Structure Selector -->
          <StructureSelector />

          <!-- Dynamic Workspace depending on Structure -->
          <!-- 1. Device Container -->
          <DeviceContainerStudio v-if="builderStore.power.type === 'device'" />

          <!-- 2. Standard Superhuman Power (with on-demand Array Suite & Linked Effects) -->
          <template v-else>
            <TopLevelArrayStudio />
            <EffectEditorCanvas
              :key="'std_canvas_' + builderStore.currentEditingEffect?.id"
              :effect="builderStore.currentEditingEffect"
              :title="canvasTitle"
            />
          </template>
        </div>

        <!-- Sidebar (Cost Breakdown & Math) -->
        <CostBreakdownSidebar />
      </div>

      <!-- Modifier Inspector Modal Child -->
      <ModifierInspectorModal />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { usePowerBuilderStore } from '../../stores/powerBuilderStore.js';
import { useHeroStore } from '../../stores/heroStore.js';
import { useUiStore } from '../../stores/uiStore.js';

import StructureSelector from './StructureSelector.vue';
import DeviceContainerStudio from './DeviceContainerStudio.vue';
import TopLevelArrayStudio from './TopLevelArrayStudio.vue';
import EffectEditorCanvas from './EffectEditorCanvas.vue';
import CostBreakdownSidebar from './CostBreakdownSidebar.vue';
import ModifierInspectorModal from './ModifierInspectorModal.vue';

const builderStore = usePowerBuilderStore();
const heroStore = useHeroStore();
const uiStore = useUiStore();

const canvasTitle = computed(() => {
  if (builderStore.activeTargetType === 'slot') {
    const slot = builderStore.power.alternateEffects?.[builderStore.activeSlotIndex];
    return `Editing Alternate Slot: ${slot?.name || 'Slot'}`;
  }
  return `Primary Superhuman Effect: ${builderStore.power.mainEffect?.name || 'Primary'}`;
});

function handleSave() {
  if (!builderStore.power.name || builderStore.power.name.trim() === '') {
    builderStore.power.name = builderStore.power.type === 'device' ? 'Unnamed Device' : 'Unnamed Power';
  }

  if (builderStore.editingIndex === -1) {
    heroStore.addPower(builderStore.power);
    uiStore.showToast(`Added power: ${builderStore.power.name}`, 'success');
  } else {
    heroStore.updatePower(builderStore.editingIndex, builderStore.power);
    uiStore.showToast(`Updated power: ${builderStore.power.name}`, 'success');
  }

  builderStore.closeModal();
}
</script>

<style scoped>
.power-studio-dialog {
  max-width: 1240px;
  height: 92vh;
  display: flex;
  flex-direction: column;
}

.header-main-group {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  flex: 1;
}

.header-icon-box {
  width: 40px;
  height: 40px;
  background: rgba(0, 111, 184, 0.12);
  border: 1px solid rgba(0, 111, 184, 0.35);
  color: var(--accent-primary);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  flex-shrink: 0;
}

.header-name-inputs {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  flex: 1;
}

.power-title-input {
  background: transparent;
  border: 1px solid transparent;
  color: #fff;
  font-size: 1.25rem;
  font-weight: 900;
  padding: 0.15rem 0.45rem;
  border-radius: var(--radius-xs);
  outline: none;
  font-family: inherit;
  letter-spacing: var(--letter-spacing-tight);
  transition: all var(--trans-fast);
  max-width: 550px;
}

.power-title-input:hover,
.power-title-input:focus {
  background: var(--bg-surface);
  border-color: var(--border-color);
}

.power-studio-subtitle {
  font-size: 0.74rem;
  color: var(--text-muted);
}

.type-highlight {
  color: var(--accent-primary);
  font-weight: 800;
}

.power-studio-body {
  display: flex;
  gap: 1.25rem;
  padding: 1.25rem;
  overflow-y: auto;
  flex: 1;
}

.studio-main-workspace {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
}
</style>
