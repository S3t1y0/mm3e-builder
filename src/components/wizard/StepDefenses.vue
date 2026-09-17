<template>
  <div class="step-defenses-container">
    <div class="step-banner">
      <div class="step-banner-icon"><i class="ri-shield-check-line"></i></div>
      <div>
        <h3 class="step-title">Step 3: Defenses & Power Level Cap Audits</h3>
        <p class="step-subtitle">Purchase defense ranks (<strong>1 PP per Rank</strong>) and balance paired PL caps (Dodge+Toughness, Parry+Toughness, Fortitude+Will).</p>
      </div>
    </div>

    <!-- PL CAP AUDIT METERS -->
    <div class="card mb-4" style="padding: 1.25rem;">
      <h4 class="section-title"><i class="ri-scales-3-line text-accent"></i> PL {{ heroStore.character.powerLevel }} Defense Caps (Max {{ heroStore.character.powerLevel * 2 }})</h4>
      <div class="caps-grid">
        <!-- CAP 1: DODGE + TOUGHNESS -->
        <div class="cap-card" :class="{ overflow: isCapExceeded(dodgeTotal + toughnessTotal) }">
          <div class="cap-header">
            <span>Dodge + Toughness</span>
            <span class="cap-val tabular-nums">{{ dodgeTotal + toughnessTotal }} / {{ maxCap }}</span>
          </div>
          <div class="progress-bar-bg">
            <div
              class="progress-bar-fill"
              :style="{ transform: `scaleX(${getCapPercent(dodgeTotal + toughnessTotal) / 100})` }"
              :class="{ over: isCapExceeded(dodgeTotal + toughnessTotal) }"
            ></div>
          </div>
          <div class="cap-footer tabular-nums">
            <span>Dodge: {{ dodgeTotal }}</span>
            <span>Toughness: {{ toughnessTotal }}</span>
          </div>
        </div>

        <!-- CAP 2: PARRY + TOUGHNESS -->
        <div class="cap-card" :class="{ overflow: isCapExceeded(parryTotal + toughnessTotal) }">
          <div class="cap-header">
            <span>Parry + Toughness</span>
            <span class="cap-val tabular-nums">{{ parryTotal + toughnessTotal }} / {{ maxCap }}</span>
          </div>
          <div class="progress-bar-bg">
            <div
              class="progress-bar-fill"
              :style="{ transform: `scaleX(${getCapPercent(parryTotal + toughnessTotal) / 100})` }"
              :class="{ over: isCapExceeded(parryTotal + toughnessTotal) }"
            ></div>
          </div>
          <div class="cap-footer tabular-nums">
            <span>Parry: {{ parryTotal }}</span>
            <span>Toughness: {{ toughnessTotal }}</span>
          </div>
        </div>

        <!-- CAP 3: FORTITUDE + WILL -->
        <div class="cap-card" :class="{ overflow: isCapExceeded(fortitudeTotal + willTotal) }">
          <div class="cap-header">
            <span>Fortitude + Will</span>
            <span class="cap-val tabular-nums">{{ fortitudeTotal + willTotal }} / {{ maxCap }}</span>
          </div>
          <div class="progress-bar-bg">
            <div
              class="progress-bar-fill"
              :style="{ transform: `scaleX(${getCapPercent(fortitudeTotal + willTotal) / 100})` }"
              :class="{ over: isCapExceeded(fortitudeTotal + willTotal) }"
            ></div>
          </div>
          <div class="cap-footer tabular-nums">
            <span>Fortitude: {{ fortitudeTotal }}</span>
            <span>Will: {{ willTotal }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- DEFENSES STEPPER GRID (4 BOUGHT DEFENSES) -->
    <div class="defenses-grid">
      <!-- DODGE -->
      <div class="card def-card" style="padding: 1rem;">
        <div class="def-header">
          <div>
            <div class="def-name">Dodge</div>
            <div class="def-sub">Base: AGL ({{ heroStore.effectiveAbilities?.AGL ?? 0 }})</div>
          </div>
          <div class="def-total tabular-nums">{{ dodgeTotal }}</div>
        </div>
        <div class="def-stepper-row">
          <label class="def-label">Bought Ranks (1 PP/ea):</label>
          <div class="stepper-controls">
            <button
              class="btn btn-secondary btn-xs stepper-btn"
              :disabled="(heroStore.character.defensesBought?.DODGE || 0) <= 0"
              @click="setDefense('DODGE', (heroStore.character.defensesBought?.DODGE || 0) - 1)"
            >-</button>
            <span class="bought-val tabular-nums">{{ heroStore.character.defensesBought?.DODGE || 0 }}</span>
            <button
              class="btn btn-secondary btn-xs stepper-btn"
              @click="setDefense('DODGE', (heroStore.character.defensesBought?.DODGE || 0) + 1)"
            >+</button>
          </div>
        </div>
      </div>

      <!-- PARRY -->
      <div class="card def-card" style="padding: 1rem;">
        <div class="def-header">
          <div>
            <div class="def-name">Parry</div>
            <div class="def-sub">Base: FGT ({{ heroStore.effectiveAbilities?.FGT ?? 0 }})</div>
          </div>
          <div class="def-total tabular-nums">{{ parryTotal }}</div>
        </div>
        <div class="def-stepper-row">
          <label class="def-label">Bought Ranks (1 PP/ea):</label>
          <div class="stepper-controls">
            <button
              class="btn btn-secondary btn-xs stepper-btn"
              :disabled="(heroStore.character.defensesBought?.PARRY || 0) <= 0"
              @click="setDefense('PARRY', (heroStore.character.defensesBought?.PARRY || 0) - 1)"
            >-</button>
            <span class="bought-val tabular-nums">{{ heroStore.character.defensesBought?.PARRY || 0 }}</span>
            <button
              class="btn btn-secondary btn-xs stepper-btn"
              @click="setDefense('PARRY', (heroStore.character.defensesBought?.PARRY || 0) + 1)"
            >+</button>
          </div>
        </div>
      </div>

      <!-- FORTITUDE -->
      <div class="card def-card" style="padding: 1rem;">
        <div class="def-header">
          <div>
            <div class="def-name">Fortitude</div>
            <div class="def-sub">Base: STA ({{ heroStore.effectiveAbilities?.STA ?? 0 }})</div>
          </div>
          <div class="def-total tabular-nums">{{ fortitudeTotal }}</div>
        </div>
        <div class="def-stepper-row">
          <label class="def-label">Bought Ranks (1 PP/ea):</label>
          <div class="stepper-controls">
            <button
              class="btn btn-secondary btn-xs stepper-btn"
              :disabled="(heroStore.character.defensesBought?.FORTITUDE || 0) <= 0"
              @click="setDefense('FORTITUDE', (heroStore.character.defensesBought?.FORTITUDE || 0) - 1)"
            >-</button>
            <span class="bought-val tabular-nums">{{ heroStore.character.defensesBought?.FORTITUDE || 0 }}</span>
            <button
              class="btn btn-secondary btn-xs stepper-btn"
              @click="setDefense('FORTITUDE', (heroStore.character.defensesBought?.FORTITUDE || 0) + 1)"
            >+</button>
          </div>
        </div>
      </div>

      <!-- WILL -->
      <div class="card def-card" style="padding: 1rem;">
        <div class="def-header">
          <div>
            <div class="def-name">Will</div>
            <div class="def-sub">Base: AWE ({{ heroStore.effectiveAbilities?.AWE ?? 0 }})</div>
          </div>
          <div class="def-total tabular-nums">{{ willTotal }}</div>
        </div>
        <div class="def-stepper-row">
          <label class="def-label">Bought Ranks (1 PP/ea):</label>
          <div class="stepper-controls">
            <button
              class="btn btn-secondary btn-xs stepper-btn"
              :disabled="(heroStore.character.defensesBought?.WILL || 0) <= 0"
              @click="setDefense('WILL', (heroStore.character.defensesBought?.WILL || 0) - 1)"
            >-</button>
            <span class="bought-val tabular-nums">{{ heroStore.character.defensesBought?.WILL || 0 }}</span>
            <button
              class="btn btn-secondary btn-xs stepper-btn"
              @click="setDefense('WILL', (heroStore.character.defensesBought?.WILL || 0) + 1)"
            >+</button>
          </div>
        </div>
      </div>
    </div>

    <!-- TOUGHNESS (DEDICATED DERIVED DEFENSE BANNER) -->
    <div class="card toughness-banner mt-3" style="padding: 1.15rem 1.25rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div style="display: flex; align-items: center; gap: 0.85rem;">
          <div style="width: 42px; height: 42px; border-radius: var(--radius-sm); background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.35); display: flex; align-items: center; justify-content: center; font-size: 1.35rem; color: #38bdf8;">
            <i class="ri-shield-fill"></i>
          </div>
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="font-weight: 800; color: #38bdf8; font-size: 1.05rem;">Toughness</span>
              <span class="badge badge-secondary" style="font-size: 0.68rem;">DERIVED STAT</span>
            </div>
            <div class="tabular-nums" style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 0.2rem;">
              Base STA: <strong style="color: #fff;">{{ heroStore.effectiveAbilities?.STA ?? 0 }}</strong> &bull;
              <span style="white-space: nowrap;">Powers/Armor: <strong style="color: #fff;">+{{ heroStore.protectionBonus || 0 }}</strong></span>
            </div>
          </div>
        </div>
        <div style="text-align: right;">
          <div class="def-total tabular-nums" style="color: #38bdf8; font-size: 1.8rem; line-height: 1;">{{ toughnessTotal }}</div>
          <span style="font-size: 0.7rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">Total Toughness</span>
        </div>
      </div>
      <p style="font-size: 0.76rem; color: var(--text-secondary); margin: 0.75rem 0 0; line-height: 1.45; border-top: 1px solid var(--border-subtle); padding-top: 0.65rem;">
        Toughness cannot be purchased directly with defense points; it derives naturally from Stamina, Protection powers, the Defensive Roll advantage, or defensive gear/devices.
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useHeroStore } from '../../stores/heroStore.js';

const heroStore = useHeroStore();

const maxCap = computed(() => (heroStore.character.powerLevel || 10) * 2);

const dodgeTotal = computed(() => {
  return heroStore.defenseTotals?.DODGE ?? ((heroStore.effectiveAbilities?.AGL || 0) + (heroStore.character.defensesBought?.DODGE || 0));
});

const parryTotal = computed(() => {
  return heroStore.defenseTotals?.PARRY ?? ((heroStore.effectiveAbilities?.FGT || 0) + (heroStore.character.defensesBought?.PARRY || 0));
});

const fortitudeTotal = computed(() => {
  return heroStore.defenseTotals?.FORTITUDE ?? ((heroStore.effectiveAbilities?.STA || 0) + (heroStore.character.defensesBought?.FORTITUDE || 0));
});

const willTotal = computed(() => {
  return heroStore.defenseTotals?.WILL ?? ((heroStore.effectiveAbilities?.AWE || 0) + (heroStore.character.defensesBought?.WILL || 0));
});

const toughnessTotal = computed(() => {
  return heroStore.defenseTotals?.TOUGHNESS ?? ((heroStore.effectiveAbilities?.STA || 0) + (heroStore.protectionBonus || 0));
});

function isCapExceeded(val) {
  return val > maxCap.value;
}

function getCapPercent(val) {
  return Math.min(100, Math.round((val / maxCap.value) * 100));
}

function setDefense(key, val) {
  heroStore.setDefense(key, Math.max(0, val));
}
</script>

<style scoped>
.step-banner {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin-bottom: 1.25rem;
  padding: 1rem 1.25rem;
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.25);
  border-radius: var(--radius-md);
}

.step-banner-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  background: rgba(16, 185, 129, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  color: #34d399;
}

.step-title {
  font-size: 1.2rem;
  font-weight: 800;
  color: #fff;
  margin: 0;
}

.step-subtitle {
  font-size: 0.82rem;
  color: var(--text-secondary);
  margin: 0.25rem 0 0;
  line-height: 1.45;
}

.section-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-bottom: 0.85rem;
}

.caps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.cap-card {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 0.85rem;
}

.cap-card.overflow {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.08);
}

.cap-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.78rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.4rem;
}

.cap-val {
  color: #10b981;
}

.cap-card.overflow .cap-val {
  color: #ef4444;
}

.progress-bar-bg {
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  overflow: hidden;
  margin-bottom: 0.4rem;
}

.progress-bar-fill {
  width: 100%;
  height: 100%;
  background: #10b981;
  transform-origin: left;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.progress-bar-fill.over {
  background: #ef4444;
}

.cap-footer {
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  color: var(--text-secondary);
}

.defenses-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.25rem;
}

@media (max-width: 1024px) {
  .defenses-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 560px) {
  .defenses-grid {
    grid-template-columns: 1fr;
  }
}

.def-card {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
}

.def-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.def-name {
  font-weight: 800;
  color: #fff;
  font-size: 1rem;
}

.def-sub {
  font-size: 0.72rem;
  color: var(--text-secondary);
}

.def-total {
  font-size: 1.4rem;
  font-weight: 900;
  color: #fff;
}

.def-stepper-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border-subtle);
}

.def-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 600;
}

.stepper-controls {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.stepper-btn {
  width: 26px;
  height: 26px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  border-radius: 4px;
}

.bought-val {
  font-weight: 800;
  font-size: 0.88rem;
  color: #60a5fa;
  min-width: 28px;
  text-align: center;
}

.toughness-banner {
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.08), rgba(15, 23, 42, 0.85));
  border: 1px solid rgba(56, 189, 248, 0.35);
  border-radius: var(--radius-md);
  margin-top: 1.25rem;
}
</style>
