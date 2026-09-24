<template>
  <div class="structure-selector-compact">
    <!-- Architecture Segmented Switcher -->
    <div class="structure-segmented-group" role="tablist" aria-label="Power Architecture">
      <button
        type="button"
        role="tab"
        class="structure-seg-btn"
        :class="{ active: builderStore.power.type === 'standard' || builderStore.power.type === 'array' }"
        :aria-selected="builderStore.power.type === 'standard' || builderStore.power.type === 'array'"
        @click="builderStore.setStructureType('standard')"
        title="Standard Power: Single effect with optional alternate stunt array"
      >
        <i class="ri-flashlight-line"></i>
        <span>Standard</span>
      </button>

      <button
        type="button"
        role="tab"
        class="structure-seg-btn"
        :class="{ active: builderStore.power.type === 'compound' }"
        :aria-selected="builderStore.power.type === 'compound'"
        @click="builderStore.setStructureType('compound')"
        title="Compound Power: Multi-effect linked combo or bundled traits (DHH p. 147)"
      >
        <i class="ri-stack-line"></i>
        <span>Compound</span>
      </button>

      <button
        type="button"
        role="tab"
        class="structure-seg-btn"
        :class="{ active: builderStore.power.type === 'device' }"
        :aria-selected="builderStore.power.type === 'device'"
        @click="builderStore.setStructureType('device')"
        title="Device: Multi-power collection, battlesuit systems, or equipment kit"
      >
        <i class="ri-shield-keyhole-line"></i>
        <span>Device</span>
      </button>
    </div>

    <!-- Modifier Flaws Grid -->
    <div class="flaws-strips-wrapper">
      <!-- Device / Removable Flaw Strip -->
      <div class="compact-flaw-strip">
        <span class="flaw-label" title="Device Flaw: Removable equipment discount applied to total cost">
          <i class="ri-shield-keyhole-line text-cyan"></i>
          <span>Device:</span>
        </span>

        <div class="flaw-mini-chips">
          <button
            type="button"
            class="chip-btn chip-cyan"
            :class="{ active: !builderStore.power.deviceConfig?.type || builderStore.power.deviceConfig.type === 'none' }"
            @click="builderStore.setDeviceDiscountType('none')"
            title="Inherent Trait: Cannot be removed or disarmed (0 PP discount)"
          >
            Inherent
          </button>
          <button
            type="button"
            class="chip-btn chip-cyan"
            :class="{ active: builderStore.power.deviceConfig?.type === 'removable' }"
            @click="builderStore.setDeviceDiscountType('removable')"
            title="Removable: Can only be removed when immobilized (-1 per 5 PP)"
          >
            Remov (-1/5)
          </button>
          <button
            type="button"
            class="chip-btn chip-cyan"
            :class="{ active: builderStore.power.deviceConfig?.type === 'easily_removable' }"
            @click="builderStore.setDeviceDiscountType('easily_removable')"
            title="Easily Removable: Can be disarmed in combat (-2 per 5 PP)"
          >
            Easily (-2/5)
          </button>
        </div>
      </div>

      <!-- Activation Flaw Strip -->
      <div class="compact-flaw-strip">
        <span class="flaw-label" title="Activation Flaw: Requires an action to prepare before use">
          <i class="ri-timer-flash-line text-amber"></i>
          <span>Action:</span>
        </span>

        <div class="flaw-mini-chips">
          <button
            type="button"
            class="chip-btn chip-amber"
            :class="{ active: !builderStore.power.activation || builderStore.power.activation === 'none' }"
            @click="builderStore.setActivation('none')"
            title="Instant (Free action to use, 0 PP discount)"
          >
            Instant
          </button>
          <button
            type="button"
            class="chip-btn chip-amber"
            :class="{ active: builderStore.power.activation === 'move' }"
            @click="builderStore.setActivation('move')"
            title="Move Action to activate (-1 Flat PP discount)"
          >
            Move (-1)
          </button>
          <button
            type="button"
            class="chip-btn chip-amber"
            :class="{ active: builderStore.power.activation === 'standard' }"
            @click="builderStore.setActivation('standard')"
            title="Standard Action to activate (-2 Flat PP discount)"
          >
            Std (-2)
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { usePowerBuilderStore } from '../../stores/powerBuilderStore.js';

const builderStore = usePowerBuilderStore();
</script>

<style scoped>
.structure-selector-compact {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 0.55rem 0.65rem;
}

.structure-segmented-group {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  background: var(--bg-app);
  padding: 2.5px;
  border-radius: var(--radius-xs);
  border: 1px solid var(--border-subtle);
  gap: 2px;
}

.structure-seg-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.42rem 0.35rem;
  font-size: 0.76rem;
  font-weight: 700;
  color: var(--text-secondary);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 3px;
  cursor: pointer;
  transition: all var(--trans-fast);
  white-space: nowrap;
}

.structure-seg-btn:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.04);
}

.structure-seg-btn.active {
  color: #fff;
  background: var(--bg-elevated);
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}

.structure-seg-btn i {
  font-size: 0.85rem;
}

.structure-seg-btn.active i {
  color: var(--accent-secondary);
}

.flaws-strips-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding-top: 0.15rem;
}

.compact-flaw-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.35rem;
}

.flaw-label {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted);
  flex-shrink: 0;
}

.flaw-label i {
  font-size: 0.8rem;
}

.text-cyan {
  color: #38bdf8;
}

.text-amber {
  color: #fbbf24;
}

.flaw-mini-chips {
  display: flex;
  gap: 0.2rem;
  flex: 1;
  justify-content: flex-end;
}

.chip-btn {
  padding: 0.16rem 0.38rem;
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--text-secondary);
  background: var(--bg-app);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xs);
  cursor: pointer;
  transition: all var(--trans-fast);
  white-space: nowrap;
  text-align: center;
}

.chip-btn:hover {
  color: var(--text-primary);
  border-color: var(--border-color);
}

.chip-btn.chip-cyan.active {
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.14);
  border-color: rgba(56, 189, 248, 0.45);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.chip-btn.chip-amber.active {
  color: #fbbf24;
  background: rgba(245, 158, 11, 0.14);
  border-color: rgba(245, 158, 11, 0.45);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}
</style>
