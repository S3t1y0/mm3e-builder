<template>
  <div class="step-powers-container">
    <div class="step-banner">
      <div class="step-banner-icon"><i class="ri-flashlight-line"></i></div>
      <div>
        <h3 class="step-title">Step 6: Superhuman Powers Studio</h3>
        <p class="step-subtitle">Design superhuman powers, versatile weapon arrays, or high-tech device containers.</p>
      </div>
    </div>

    <!-- POWERS SUMMARY STRIP -->
    <div class="card mb-3" style="padding: 1rem 1.25rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; background: rgba(168, 85, 247, 0.08); border-color: rgba(168, 85, 247, 0.25);">
      <div>
        <div style="font-size: 0.88rem; font-weight: 800; color: #fff;">
          Powers Point Total: <span class="tabular-nums" style="color: #c084fc; font-size: 1.1rem;">{{ heroStore.powersCost }} PP</span> (<span class="tabular-nums">{{ heroStore.character.powers?.length || 0 }}</span> Powers Active)
        </div>
        <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 0.2rem;">
          Full modular Power Studio editor featuring official M&M 3e extras, flaws, and modifier calculations.
        </div>
      </div>
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
        <button class="btn btn-primary btn-sm" @click="builderStore.openNewPower('standard')">
          <i class="ri-flashlight-line"></i> Standard Power
        </button>
        <button class="btn btn-secondary btn-sm" @click="builderStore.openNewPower('device')">
          <i class="ri-shield-keyhole-line"></i> Device Container
        </button>
      </div>
    </div>

    <!-- POWERS LIST CARDS -->
    <div v-if="!heroStore.character.powers || heroStore.character.powers.length === 0" class="card" style="padding: 3rem 1.5rem; text-align: center;">
      <i class="ri-flashlight-line" style="font-size: 3rem; color: #a855f7; display: block; margin-bottom: 0.75rem;"></i>
      <h4 style="font-weight: 800; color: #fff; margin-bottom: 0.35rem;">No Superhuman Powers Yet</h4>
      <p style="font-size: 0.82rem; color: var(--text-secondary); max-width: 450px; margin: 0 auto 1.25rem;">
        Click above to craft powers using the Power Studio or load an archetype template in Step 1.
      </p>
      <button class="btn btn-primary btn-sm" @click="builderStore.openNewPower('standard')">
        <i class="ri-add-line"></i> Create First Power
      </button>
    </div>

    <div v-else class="powers-deck-grid">
      <div
        v-for="(power, idx) in heroStore.character.powers"
        :key="power.id || idx"
        class="card power-summary-card"
      >
        <div class="power-card-header">
          <div>
            <span class="badge" :class="getTypeBadgeClass(power.type)" style="font-size: 0.68rem; margin-bottom: 0.25rem;">
              {{ (power.type || 'standard').toUpperCase() }}
            </span>
            <span v-if="power.activation && power.activation !== 'none'" class="badge" style="font-size: 0.68rem; margin-bottom: 0.25rem; margin-left: 0.35rem; background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3);">
              <i class="ri-timer-flash-line"></i> {{ power.activation === 'move' ? 'Move (-1 PP)' : 'Standard (-2 PP)' }}
            </span>
            <div style="font-weight: 800; color: #fff; font-size: 0.95rem;">
              {{ power.name || 'Unnamed Power' }}
            </div>
          </div>
          <div class="tabular-nums" style="font-weight: 800; font-size: 0.92rem; color: #c084fc;">
            {{ getPowerCost(power) }} PP
          </div>
        </div>

        <div class="power-card-body">
          <div v-if="power.type === 'device'" style="font-size: 0.78rem; color: var(--text-secondary);">
            <div>Device Type: <strong>{{ power.deviceConfig?.type || 'removable' }}</strong></div>
            <div style="margin-top: 0.35rem;">
              Sub-powers: <strong>{{ power.devicePowers?.length || 0 }} simultaneous effects</strong>
            </div>
          </div>
          <div v-else-if="power.type === 'array'" style="font-size: 0.78rem; color: var(--text-secondary);">
            <div>Primary: <strong>{{ power.mainEffect?.name }} (Rank {{ power.mainEffect?.ranks }})</strong></div>
            <div style="margin-top: 0.35rem;">
              Alternate Slots: <strong>{{ power.alternateEffects?.length || 0 }} slots</strong>
            </div>
          </div>
          <div v-else style="font-size: 0.78rem; color: var(--text-secondary);">
            <div>Effect: <strong>{{ power.mainEffect?.name }} (Rank {{ power.mainEffect?.ranks }})</strong></div>
            <div style="margin-top: 0.2rem;">Range: {{ power.mainEffect?.range }} • Action: {{ power.mainEffect?.action }}</div>
          </div>

          <div v-if="power.activation && power.activation !== 'none'" style="margin-top: 0.35rem; font-size: 0.74rem; color: #fbbf24;">
            <i class="ri-timer-flash-line"></i> Activation: <strong>{{ power.activation === 'move' ? 'Move Action (-1 PP)' : 'Standard Action (-2 PP)' }}</strong>
          </div>
        </div>

        <div class="power-card-actions">
          <button class="btn btn-secondary btn-xs" @click="builderStore.openEditPower(idx, power)">
            <i class="ri-edit-line"></i> Edit in Power Studio
          </button>
          <button class="btn btn-secondary btn-xs text-danger" @click="heroStore.removePower(idx)">
            <i class="ri-delete-bin-line"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useHeroStore } from '../../stores/heroStore.js';
import { usePowerBuilderStore } from '../../stores/powerBuilderStore.js';
import { calculatePowerTotalCost } from '../../rules/powerEngine.js';

const heroStore = useHeroStore();
const builderStore = usePowerBuilderStore();

function getPowerCost(power) {
  return calculatePowerTotalCost(power);
}

function getTypeBadgeClass(type) {
  if (type === 'device') return 'badge-warning';
  if (type === 'array') return 'badge-secondary';
  return 'badge-primary';
}
</script>

<style scoped>
.step-banner {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin-bottom: 1.25rem;
  padding: 1rem 1.25rem;
  background: rgba(168, 85, 247, 0.08);
  border: 1px solid rgba(168, 85, 247, 0.25);
  border-radius: var(--radius-md);
}

.step-banner-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  background: rgba(168, 85, 247, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  color: #c084fc;
}

.step-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: #fff;
  margin: 0;
}

.step-subtitle {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin: 0.2rem 0 0;
}

.powers-deck-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.power-summary-card {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.power-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.65rem;
}

.power-card-body {
  margin-bottom: 0.85rem;
}

.power-card-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.65rem;
  border-top: 1px solid var(--border-subtle);
}
</style>
