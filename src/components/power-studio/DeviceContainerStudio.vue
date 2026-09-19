<template>
  <div class="device-container-studio">
    <!-- Device Configuration Section -->
    <div class="device-config-card">
      <div class="config-top-row">
        <div class="device-badge-title">
          <i class="ri-shield-keyhole-line"></i>
          <span>Device Removable Discount Rules</span>
        </div>
        <div class="device-discount-summary">
          Discount: <strong>-{{ discountAmount }} PP</strong>
        </div>
      </div>

      <div class="discount-options-grid">
        <label
          class="discount-radio-card"
          :class="{ active: builderStore.power.deviceConfig?.type === 'removable' }"
        >
          <input
            type="radio"
            name="device_discount"
            value="removable"
            :checked="builderStore.power.deviceConfig?.type === 'removable'"
            @change="builderStore.setDeviceDiscountType('removable')"
          />
          <div class="radio-meta">
            <span class="radio-name">Removable</span>
            <span class="radio-sub">-1 PP per 5 PP (Suits, armor, worn items)</span>
          </div>
        </label>

        <label
          class="discount-radio-card"
          :class="{ active: builderStore.power.deviceConfig?.type === 'easily_removable' }"
        >
          <input
            type="radio"
            name="device_discount"
            value="easily_removable"
            :checked="builderStore.power.deviceConfig?.type === 'easily_removable'"
            @change="builderStore.setDeviceDiscountType('easily_removable')"
          />
          <div class="radio-meta">
            <span class="radio-name">Easily Removable</span>
            <span class="radio-sub">-2 PP per 5 PP (Handheld weapons, disarmable items)</span>
          </div>
        </label>

        <label
          class="discount-radio-card"
          :class="{ active: builderStore.power.deviceConfig?.type === 'none' }"
        >
          <input
            type="radio"
            name="device_discount"
            value="none"
            :checked="builderStore.power.deviceConfig?.type === 'none'"
            @change="builderStore.setDeviceDiscountType('none')"
          />
          <div class="radio-meta">
            <span class="radio-name">No Discount</span>
            <span class="radio-sub">Indestructible or integrated</span>
          </div>
        </label>
      </div>

      <div class="device-config-divider"></div>

      <div class="config-top-row">
        <div class="device-badge-title">
          <i class="ri-timer-flash-line"></i>
          <span>Device Activation Flaw</span>
        </div>
        <div class="device-discount-summary">
          Activation: <strong>{{ builderStore.power.activationCost ? `${builderStore.power.activationCost} PP` : '0 PP' }}</strong>
        </div>
      </div>

      <div class="discount-options-grid">
        <label
          class="discount-radio-card"
          :class="{ active: !builderStore.power.activation || builderStore.power.activation === 'none' }"
        >
          <input
            type="radio"
            name="device_activation_inner"
            value="none"
            :checked="!builderStore.power.activation || builderStore.power.activation === 'none'"
            @change="builderStore.setActivation('none')"
          />
          <div class="radio-meta">
            <span class="radio-name">None (Ready to Use)</span>
            <span class="radio-sub">Instant ready (0 PP)</span>
          </div>
        </label>

        <label
          class="discount-radio-card"
          :class="{ active: builderStore.power.activation === 'move' }"
        >
          <input
            type="radio"
            name="device_activation_inner"
            value="move"
            :checked="builderStore.power.activation === 'move'"
            @change="builderStore.setActivation('move')"
          />
          <div class="radio-meta">
            <span class="radio-name">Move Action (-1 PP)</span>
            <span class="radio-sub">Quick draw, equip, power-up</span>
          </div>
        </label>

        <label
          class="discount-radio-card"
          :class="{ active: builderStore.power.activation === 'standard' }"
        >
          <input
            type="radio"
            name="device_activation_inner"
            value="standard"
            :checked="builderStore.power.activation === 'standard'"
            @change="builderStore.setActivation('standard')"
          />
          <div class="radio-meta">
            <span class="radio-name">Standard Action (-2 PP)</span>
            <span class="radio-sub">Boot-up, complex suit-up</span>
          </div>
        </label>
      </div>
    </div>

    <!-- Horizontal Sub-Power Tabs Bar -->
    <div class="sub-powers-nav-container">
      <div class="sub-tabs-list">
        <button
          v-for="(sub, idx) in builderStore.power.devicePowers"
          :key="sub.id"
          type="button"
          class="sub-power-tab"
          :class="{ active: builderStore.activeSubPowerIndex === idx }"
          @click="builderStore.selectSubPower(idx)"
        >
          <i :class="sub.alternateEffects?.length > 0 ? 'ri-shuffle-line' : 'ri-flashlight-line'"></i>
          <span class="tab-label-text">{{ sub.name || `Sub-Power #${idx + 1}` }}</span>

          <span v-if="sub.alternateEffects?.length > 0" class="tab-array-pill">
            Array ({{ sub.alternateEffects.length + 1 }})
          </span>

          <span class="tab-cost-text">{{ getSubPowerCost(sub) }} PP</span>

          <!-- Delete sub-power button if more than 1 -->
          <span
            v-if="builderStore.power.devicePowers.length > 1"
            class="tab-close-btn"
            title="Delete Sub-Power"
            @click.stop="builderStore.removeDeviceSubPower(idx)"
          >
            <i class="ri-close-line"></i>
          </span>
        </button>
      </div>

      <!-- Add Sub-Power Button -->
      <button
        type="button"
        class="btn-add-subpower"
        @click="builderStore.addDeviceSubPower()"
      >
        <i class="ri-add-line"></i>
        <span>Add Sub-Power</span>
      </button>
    </div>

    <!-- Active Sub-Power Workspace -->
    <div v-if="builderStore.activeSubPower" class="active-subpower-workspace">
      <!-- Sub-Power Metadata & Array Activation Row -->
      <div class="subpower-meta-bar">
        <div class="subpower-name-input-box">
          <label class="sub-label">Sub-Power Name</label>
          <input
            v-model="builderStore.activeSubPower.name"
            type="text"
            class="sub-name-input"
            placeholder="Sub-Power Name (e.g. Chest Armor, Repulsor Cannon)..."
          />
        </div>

        <div class="subpower-array-toggle-box">
          <button
            v-if="!hasActiveSubArray"
            type="button"
            class="btn-enable-array"
            @click="enableSubPowerArray"
          >
            <i class="ri-shuffle-line"></i>
            <span>Convert to Sub-Array (+1 PP Alternate Mode)</span>
          </button>

          <button
            v-else
            type="button"
            class="btn-disable-array"
            @click="disableSubPowerArray"
          >
            <i class="ri-close-circle-line"></i>
            <span>Dismantle Sub-Array (Keep Primary Only)</span>
          </button>
        </div>
      </div>

      <!-- Sub-Power Array Workbench (Rendered ONLY if this sub-power has alternate slots) -->
      <!-- With :key="builderStore.activeSubPower.id", switching sub-powers guarantees immediate unmount/remount without ghost arrays! -->
      <SubPowerArrayWorkbench
        v-if="hasActiveSubArray"
        :key="'array_' + builderStore.activeSubPower.id"
        :sub-power="builderStore.activeSubPower"
        :sub-index="builderStore.activeSubPowerIndex"
      />

      <!-- Effect Canvas for the active editing target -->
      <EffectEditorCanvas
        :key="'canvas_' + builderStore.currentEditingEffect?.id"
        :effect="builderStore.currentEditingEffect"
        :title="editorCanvasTitle"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { usePowerBuilderStore } from '../../stores/powerBuilderStore.js';
import { calculateEffectCost, calculateDeviceDiscount } from '../../rules/powerEngine.js';
import SubPowerArrayWorkbench from './SubPowerArrayWorkbench.vue';
import EffectEditorCanvas from './EffectEditorCanvas.vue';

const builderStore = usePowerBuilderStore();

const hasActiveSubArray = computed(() => {
  const sub = builderStore.activeSubPower;
  return Boolean(sub && Array.isArray(sub.alternateEffects) && sub.alternateEffects.length > 0);
});

const discountAmount = computed(() => {
  const subtotal = builderStore.breakdown?.subtotalBeforeDiscount || 0;
  const dType = builderStore.power.deviceConfig?.type || 'removable';
  return calculateDeviceDiscount(subtotal, dType);
});

function getSubPowerCost(sub) {
  if (!sub?.effect) return 0;
  const mainCost = calculateEffectCost(sub.effect, 0).totalCost;
  const linkedCost = (sub.linkedEffects || []).reduce((sum, l) => sum + (calculateEffectCost(l, 0).totalCost || 0), 0);
  const altCost = (sub.alternateEffects || []).reduce((sum, a) => sum + (a.isDynamic ? 2 : 1), 0);
  return mainCost + linkedCost + altCost;
}

const editorCanvasTitle = computed(() => {
  if (builderStore.activeTargetType === 'slot') {
    const slot = builderStore.activeSubPower?.alternateEffects?.[builderStore.activeSlotIndex];
    return `Editing Alternate Slot: ${slot?.name || 'Slot'}`;
  }
  return `Editing Primary Effect: ${builderStore.activeSubPower?.name || 'Sub-Power'}`;
});

function enableSubPowerArray() {
  builderStore.addArraySlot(true, 'Alternate Mode', 'Blast');
}

function disableSubPowerArray() {
  if (builderStore.activeSubPower) {
    builderStore.activeSubPower.alternateEffects = [];
    builderStore.activeTargetType = 'main';
  }
}
</script>

<style scoped>
.device-container-studio {
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
}

.device-config-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 0.85rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.config-top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.device-badge-title {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.76rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #fbbf24;
  letter-spacing: var(--letter-spacing-caps);
}

.device-discount-summary {
  font-size: 0.82rem;
  color: var(--text-secondary);
}

.device-discount-summary strong {
  color: #34d399;
  font-variant-numeric: tabular-nums;
}

.device-config-divider {
  height: 1px;
  background: var(--border-subtle);
  margin: 0.85rem 0;
  border: none;
}

.discount-options-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.65rem;
}

.discount-radio-card {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 0.55rem 0.75rem;
  cursor: pointer;
  transition: border-color var(--trans-fast), background-color var(--trans-fast), transform var(--trans-fast);
}

.discount-radio-card:hover {
  border-color: var(--border-color);
}

.discount-radio-card:active {
  transform: scale(0.98);
}

.discount-radio-card.active {
  border-color: #fbbf24;
  background: rgba(245, 158, 11, 0.08);
}

.radio-meta {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.radio-name {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--text-primary);
}

.radio-sub {
  font-size: 0.68rem;
  color: var(--text-muted);
}

/* Sub-Powers Tabs */
.sub-powers-nav-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.45rem;
  overflow-x: auto;
}

.sub-tabs-list {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex: 1;
}

.sub-power-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  padding: 0.45rem 0.85rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 700;
  white-space: nowrap;
  transition: background-color var(--trans-fast), border-color var(--trans-fast), color var(--trans-fast), transform var(--trans-fast);
}

.sub-power-tab:hover {
  color: var(--text-primary);
  border-color: var(--border-color);
}

.sub-power-tab:active {
  transform: scale(0.97);
}

.sub-power-tab.active {
  background: rgba(0, 111, 184, 0.15);
  border-color: var(--accent-primary);
  color: #fff;
}

.tab-label-text {
  font-weight: 800;
}

.tab-array-pill {
  font-size: 0.65rem;
  background: rgba(0, 111, 184, 0.18);
  color: #38bdf8;
  padding: 0.1rem 0.4rem;
  border-radius: var(--radius-pill);
  font-weight: 800;
}

.tab-cost-text {
  font-size: 0.72rem;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}

.tab-close-btn {
  font-size: 0.85rem;
  opacity: 0.6;
  margin-left: 0.2rem;
  display: flex;
  align-items: center;
}

.tab-close-btn:hover {
  opacity: 1;
  color: #f87171;
}

.btn-add-subpower {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: var(--bg-surface);
  border: 1px dashed var(--border-color);
  color: var(--text-primary);
  padding: 0.45rem 0.85rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 800;
  white-space: nowrap;
  transition: border-color var(--trans-fast), color var(--trans-fast), transform var(--trans-fast);
}

.btn-add-subpower:hover {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.btn-add-subpower:active {
  transform: scale(0.97);
}

/* Active Sub-Power Workspace */
.active-subpower-workspace {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.subpower-meta-bar {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 0.75rem 1rem;
}

.subpower-name-input-box {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  flex: 1;
  max-width: 400px;
}

.sub-label {
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.sub-name-input {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  color: var(--text-primary);
  font-size: 0.88rem;
  font-weight: 800;
  padding: 0.45rem 0.75rem;
  border-radius: var(--radius-xs);
  outline: none;
  font-family: inherit;
}

.sub-name-input:focus {
  border-color: var(--accent-primary);
}

.btn-enable-array {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(168, 85, 247, 0.15);
  border: 1px solid rgba(168, 85, 247, 0.35);
  color: #c084fc;
  font-size: 0.78rem;
  font-weight: 800;
  padding: 0.45rem 0.85rem;
  border-radius: var(--radius-xs);
  cursor: pointer;
  transition: background-color var(--trans-fast), color var(--trans-fast), transform var(--trans-fast);
}

.btn-enable-array:hover {
  background: #a855f7;
  color: #fff;
}

.btn-enable-array:active {
  transform: scale(0.97);
}

.btn-disable-array {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.35);
  color: #f87171;
  font-size: 0.78rem;
  font-weight: 800;
  padding: 0.45rem 0.85rem;
  border-radius: var(--radius-xs);
  cursor: pointer;
  transition: background-color var(--trans-fast), color var(--trans-fast), transform var(--trans-fast);
}

.btn-disable-array:hover {
  background: #ef4444;
  color: #fff;
}

.btn-disable-array:active {
  transform: scale(0.97);
}
</style>
