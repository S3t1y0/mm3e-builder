<template>
  <div class="structure-selector-container">
    <div class="structure-selector-label">
      <i class="ri-node-tree"></i>
      <span>Power Structure</span>
    </div>

    <div class="structure-pills-grid">
      <button
        type="button"
        class="structure-pill-card"
        :class="{ active: builderStore.power.type === 'standard' || builderStore.power.type === 'array' }"
        @click="builderStore.setStructureType('standard')"
      >
        <div class="pill-icon"><i class="ri-flashlight-line"></i></div>
        <div class="pill-text">
          <span class="pill-title">Standard Power</span>
          <span class="pill-desc">Primary power with optional Linked & Alternate Effects</span>
        </div>
        <i v-if="builderStore.power.type === 'standard' || builderStore.power.type === 'array'" class="ri-checkbox-circle-fill active-check"></i>
      </button>

      <button
        type="button"
        class="structure-pill-card"
        :class="{ active: builderStore.power.type === 'device' }"
        @click="builderStore.setStructureType('device')"
      >
        <div class="pill-icon device"><i class="ri-shield-keyhole-line"></i></div>
        <div class="pill-text">
          <span class="pill-title">Device Container</span>
          <span class="pill-desc">Removable equipment, battlesuit, or weapon hosting multiple sub-powers</span>
        </div>
        <i v-if="builderStore.power.type === 'device'" class="ri-checkbox-circle-fill active-check"></i>
      </button>
    </div>

    <div class="architecture-guidance-note">
      <i class="ri-information-line"></i>
      <span>
        Use <strong>Linked Effects</strong> to trigger multiple effects together in a single action. Use <strong>Alternate Effects (Array)</strong> for switchable modes sharing a power point pool.
      </span>
    </div>

    <!-- Power / Container Activation Flaw Block -->
    <div class="activation-control-block">
      <div class="activation-row-header">
        <div class="activation-title">
          <i class="ri-timer-flash-line"></i>
          <span>Container / Power Activation Flaw</span>
        </div>
        <span class="activation-chip" :class="{ 'has-discount': builderStore.power.activation && builderStore.power.activation !== 'none' }">
          {{ builderStore.power.activation === 'move' ? '-1 Flat PP (Move Action)' : builderStore.power.activation === 'standard' ? '-2 Flat PP (Standard Action)' : 'No Activation Flaw (0 PP)' }}
        </span>
      </div>
      <p class="activation-help">
        Requires an action to prepare/activate before effects can be used (e.g. drawing a weapon, booting a battlesuit, transforming). Applies across the entire power suite or device container.
      </p>

      <div class="activation-radios-grid">
        <label
          class="activation-radio-card"
          :class="{ active: !builderStore.power.activation || builderStore.power.activation === 'none' }"
        >
          <input
            type="radio"
            name="power_activation_selector"
            value="none"
            :checked="!builderStore.power.activation || builderStore.power.activation === 'none'"
            @change="builderStore.setActivation('none')"
          />
          <div class="act-radio-text">
            <span class="act-radio-title">None (Instant / Free)</span>
            <span class="act-radio-sub">Ready to use without prep</span>
          </div>
          <span class="act-cost-badge free">0 PP</span>
        </label>

        <label
          class="activation-radio-card"
          :class="{ active: builderStore.power.activation === 'move' }"
        >
          <input
            type="radio"
            name="power_activation_selector"
            value="move"
            :checked="builderStore.power.activation === 'move'"
            @change="builderStore.setActivation('move')"
          />
          <div class="act-radio-text">
            <span class="act-radio-title">Move Action</span>
            <span class="act-radio-sub">Quick prep, readying item</span>
          </div>
          <span class="act-cost-badge discount">-1 PP</span>
        </label>

        <label
          class="activation-radio-card"
          :class="{ active: builderStore.power.activation === 'standard' }"
        >
          <input
            type="radio"
            name="power_activation_selector"
            value="standard"
            :checked="builderStore.power.activation === 'standard'"
            @change="builderStore.setActivation('standard')"
          />
          <div class="act-radio-text">
            <span class="act-radio-title">Standard Action</span>
            <span class="act-radio-sub">Significant prep, boot-up</span>
          </div>
          <span class="act-cost-badge discount">-2 PP</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>
import { usePowerBuilderStore } from '../../stores/powerBuilderStore.js';

const builderStore = usePowerBuilderStore();
</script>

<style scoped>
.structure-selector-container {
  margin-bottom: 1.25rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 0.85rem 1rem;
}

.structure-selector-label {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.76rem;
  font-weight: 800;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-caps);
  margin-bottom: 0.65rem;
}

.structure-selector-label i {
  color: var(--accent-primary);
  font-size: 0.95rem;
}

.structure-pills-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.architecture-guidance-note {
  margin-top: 0.65rem;
  padding: 0.5rem 0.75rem;
  background: rgba(59, 130, 246, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: var(--radius-xs);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.73rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.architecture-guidance-note i {
  color: var(--accent-primary);
  font-size: 0.95rem;
  flex-shrink: 0;
}

.structure-pill-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--bg-surface);
  border: 1.5px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 0.65rem 0.85rem;
  cursor: pointer;
  text-align: left;
  transition: background-color var(--trans-fast), border-color var(--trans-fast), box-shadow var(--trans-fast), transform var(--trans-fast);
  position: relative;
}

.structure-pill-card:hover {
  background: var(--bg-card-hover);
  border-color: var(--border-color);
}

.structure-pill-card:active {
  transform: scale(0.98);
}

.structure-pill-card.active {
  background: rgba(220, 38, 38, 0.08);
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 1px rgba(220, 38, 38, 0.25);
}

.pill-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-xs);
  background: rgba(220, 38, 38, 0.15);
  color: var(--accent-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.pill-icon.array {
  background: rgba(168, 85, 247, 0.15);
  color: #c084fc;
}

.pill-icon.device {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
}

.pill-text {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
  flex: 1;
}

.pill-title {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--text-primary);
}

.pill-desc {
  font-size: 0.7rem;
  color: var(--text-secondary);
  line-height: 1.45;
}

.active-check {
  position: absolute;
  top: 0.45rem;
  right: 0.45rem;
  font-size: 0.95rem;
  color: var(--accent-primary);
}

/* Activation Flaw Section */
.activation-control-block {
  margin-top: 0.85rem;
  padding-top: 0.85rem;
  border-top: 1px dashed var(--border-subtle);
}

.activation-row-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.35rem;
  gap: 0.5rem;
}

.activation-title {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.74rem;
  font-weight: 800;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-caps);
}

.activation-title i {
  color: #f59e0b;
  font-size: 0.95rem;
}

.activation-chip {
  font-size: 0.68rem;
  font-weight: 800;
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-pill);
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  color: var(--text-muted);
}

.activation-chip.has-discount {
  background: rgba(245, 158, 11, 0.15);
  border-color: rgba(245, 158, 11, 0.4);
  color: #fbbf24;
}

.activation-help {
  font-size: 0.69rem;
  color: var(--text-muted);
  line-height: 1.4;
  margin-bottom: 0.65rem;
}

.activation-radios-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.6rem;
}

.activation-radio-card {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: var(--bg-surface);
  border: 1.5px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 0.55rem 0.75rem;
  cursor: pointer;
  transition: all var(--trans-fast);
}

.activation-radio-card:hover {
  background: var(--bg-card-hover);
  border-color: var(--border-color);
}

.activation-radio-card.active {
  background: rgba(245, 158, 11, 0.08);
  border-color: #f59e0b;
  box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.25);
}

.activation-radio-card input[type="radio"] {
  accent-color: #f59e0b;
  cursor: pointer;
}

.act-radio-text {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
  flex: 1;
}

.act-radio-title {
  font-size: 0.76rem;
  font-weight: 800;
  color: var(--text-primary);
}

.act-radio-sub {
  font-size: 0.65rem;
  color: var(--text-secondary);
  line-height: 1.35;
}

.act-cost-badge {
  font-size: 0.68rem;
  font-weight: 800;
  padding: 0.15rem 0.45rem;
  border-radius: var(--radius-xs);
  flex-shrink: 0;
}

.act-cost-badge.free {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-muted);
}

.act-cost-badge.discount {
  background: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.35);
}
</style>
