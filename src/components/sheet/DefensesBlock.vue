<template>
  <div class="dndb-card dndb-defenses-card">
    <div class="dndb-card-header">
      <div class="dndb-card-title-wrap">
        <i class="ri-shield-check-fill dndb-card-icon"></i>
        <h3 class="dndb-card-title">DEFENSES</h3>
      </div>
      <span class="dndb-card-badge">1 PP / Rank</span>
    </div>
    <p class="dndb-card-sub">Resistance checks to withstand damage and hazardous effects.</p>

    <!-- 6 Defenses & Initiative Grid -->
    <div class="dndb-defenses-grid">
      <!-- 1. Dodge -->
      <div class="defense-card" title="Ability to avoid ranged attacks and area hazards.">
        <div class="def-header">
          <span class="def-name">Dodge</span>
          <div class="def-meta-row">
            <span v-if="enhDefenses.DODGE > 0" class="def-enh-badge" :title="`Enhanced Trait active: +${enhDefenses.DODGE}`">
              +{{ enhDefenses.DODGE }} Enh
            </span>
            <span class="def-base-info">AGL {{ heroStore.effectiveAbilities.AGL || 0 }}</span>
          </div>
        </div>
        <div class="def-body">
          <button type="button" class="def-roll-btn" @click="rollDefense('Dodge', heroStore.defenseTotals.DODGE)" title="Click to Roll Dodge Check">
            <i class="ri-dice-line"></i>
            <span class="def-total">{{ heroStore.defenseTotals.DODGE >= 0 ? `+${heroStore.defenseTotals.DODGE}` : heroStore.defenseTotals.DODGE }}</span>
            <span class="def-roll-label">ROLL</span>
          </button>
          <div class="def-stepper">
            <button type="button" class="step-btn" @click="stepDefense('DODGE', -1)" title="Decrease Dodge">-</button>
            <span class="def-bought-val">+{{ heroStore.character.defensesBought.DODGE || 0 }} PP</span>
            <button type="button" class="step-btn" @click="stepDefense('DODGE', 1)" title="Increase Dodge">+</button>
          </div>
        </div>
      </div>

      <!-- 2. Parry -->
      <div class="defense-card" title="Ability to turn aside or evade close melee attacks.">
        <div class="def-header">
          <span class="def-name">Parry</span>
          <div class="def-meta-row">
            <span v-if="enhDefenses.PARRY > 0" class="def-enh-badge" :title="`Enhanced Trait active: +${enhDefenses.PARRY}`">
              +{{ enhDefenses.PARRY }} Enh
            </span>
            <span class="def-base-info">FGT {{ heroStore.effectiveAbilities.FGT || 0 }}</span>
          </div>
        </div>
        <div class="def-body">
          <button type="button" class="def-roll-btn" @click="rollDefense('Parry', heroStore.defenseTotals.PARRY)" title="Click to Roll Parry Check">
            <i class="ri-dice-line"></i>
            <span class="def-total">{{ heroStore.defenseTotals.PARRY >= 0 ? `+${heroStore.defenseTotals.PARRY}` : heroStore.defenseTotals.PARRY }}</span>
            <span class="def-roll-label">ROLL</span>
          </button>
          <div class="def-stepper">
            <button type="button" class="step-btn" @click="stepDefense('PARRY', -1)" title="Decrease Parry">-</button>
            <span class="def-bought-val">+{{ heroStore.character.defensesBought.PARRY || 0 }} PP</span>
            <button type="button" class="step-btn" @click="stepDefense('PARRY', 1)" title="Increase Parry">+</button>
          </div>
        </div>
      </div>

      <!-- 3. Fortitude -->
      <div class="defense-card" title="Health, stamina, and biological/metabolic resistance.">
        <div class="def-header">
          <span class="def-name">Fortitude</span>
          <div class="def-meta-row">
            <span v-if="enhDefenses.FORTITUDE > 0" class="def-enh-badge" :title="`Enhanced Trait active: +${enhDefenses.FORTITUDE}`">
              +{{ enhDefenses.FORTITUDE }} Enh
            </span>
            <span class="def-base-info">STA {{ heroStore.effectiveAbilities.STA || 0 }}</span>
          </div>
        </div>
        <div class="def-body">
          <button type="button" class="def-roll-btn" @click="rollDefense('Fortitude', heroStore.defenseTotals.FORTITUDE)" title="Click to Roll Fortitude Check">
            <i class="ri-dice-line"></i>
            <span class="def-total">{{ heroStore.defenseTotals.FORTITUDE >= 0 ? `+${heroStore.defenseTotals.FORTITUDE}` : heroStore.defenseTotals.FORTITUDE }}</span>
            <span class="def-roll-label">ROLL</span>
          </button>
          <div class="def-stepper">
            <button type="button" class="step-btn" @click="stepDefense('FORTITUDE', -1)" title="Decrease Fortitude">-</button>
            <span class="def-bought-val">+{{ heroStore.character.defensesBought.FORTITUDE || 0 }} PP</span>
            <button type="button" class="step-btn" @click="stepDefense('FORTITUDE', 1)" title="Increase Fortitude">+</button>
          </div>
        </div>
      </div>

      <!-- 4. Toughness -->
      <div class="defense-card" :class="{ 'card-injured': heroStore.character.injuries > 0 }" title="Resistance to direct damage (Derived from STA + Protection, reduced by bruises).">
        <div class="def-header">
          <span class="def-name">Toughness</span>
          <div class="def-meta-row">
            <span v-if="enhDefenses.TOUGHNESS > 0" class="def-enh-badge" :title="`Enhanced Trait active: +${enhDefenses.TOUGHNESS}`">
              +{{ enhDefenses.TOUGHNESS }} Enh
            </span>
            <span v-if="heroStore.character.injuries > 0" class="def-base-info def-injured-text" :title="`Base STA ${heroStore.effectiveAbilities.STA || 0}, minus ${heroStore.character.injuries} bruise penalty`">
              STA {{ heroStore.effectiveAbilities.STA || 0 }} (-{{ heroStore.character.injuries }} Bruised)
            </span>
            <span v-else class="def-base-info">
              STA {{ heroStore.effectiveAbilities.STA || 0 }}{{ protectionBonus > 0 ? ` (+${protectionBonus} Arm)` : '' }}{{ defensiveRollBonus > 0 ? ` (+${defensiveRollBonus} Adv)` : '' }}
            </span>
          </div>
        </div>
        <div class="def-body">
          <button type="button" class="def-roll-btn" @click="rollDefense('Toughness', effectiveToughnessCheck)" title="Click to Roll Toughness Resistance">
            <i class="ri-dice-line"></i>
            <span class="def-total">{{ effectiveToughnessCheck >= 0 ? `+${effectiveToughnessCheck}` : effectiveToughnessCheck }}</span>
            <span class="def-roll-label">ROLL</span>
          </button>
          <div class="def-stepper derived">
            <span class="def-derived-label">{{ toughnessDerivedLabel }}</span>
          </div>
        </div>
      </div>

      <!-- 5. Will -->
      <div class="defense-card" title="Mental stability, determination, and psychic resistance.">
        <div class="def-header">
          <span class="def-name">Will</span>
          <div class="def-meta-row">
            <span v-if="enhDefenses.WILL > 0" class="def-enh-badge" :title="`Enhanced Trait active: +${enhDefenses.WILL}`">
              +{{ enhDefenses.WILL }} Enh
            </span>
            <span class="def-base-info">AWE {{ heroStore.effectiveAbilities.AWE || 0 }}</span>
          </div>
        </div>
        <div class="def-body">
          <button type="button" class="def-roll-btn" @click="rollDefense('Will', heroStore.defenseTotals.WILL)" title="Click to Roll Will Check">
            <i class="ri-dice-line"></i>
            <span class="def-total">{{ heroStore.defenseTotals.WILL >= 0 ? `+${heroStore.defenseTotals.WILL}` : heroStore.defenseTotals.WILL }}</span>
            <span class="def-roll-label">ROLL</span>
          </button>
          <div class="def-stepper">
            <button type="button" class="step-btn" @click="stepDefense('WILL', -1)" title="Decrease Will">-</button>
            <span class="def-bought-val">+{{ heroStore.character.defensesBought.WILL || 0 }} PP</span>
            <button type="button" class="step-btn" @click="stepDefense('WILL', 1)" title="Increase Will">+</button>
          </div>
        </div>
      </div>

      <!-- 6. Initiative -->
      <div class="defense-card" title="Combat reaction order (AGL + Improved Initiative advantage).">
        <div class="def-header">
          <span class="def-name">Initiative</span>
          <div class="def-meta-row">
            <span class="def-base-info">
              AGL {{ heroStore.effectiveAbilities.AGL || 0 }}{{ improvedInitBonus > 0 ? ` (+${improvedInitBonus} Adv)` : '' }}
            </span>
          </div>
        </div>
        <div class="def-body">
          <button type="button" class="def-roll-btn init-roll-btn" @click="rollDefense('Initiative', totalInitiative)" title="Click to Roll Initiative">
            <i class="ri-speed-up-line"></i>
            <span class="def-total">{{ totalInitiative >= 0 ? `+${totalInitiative}` : totalInitiative }}</span>
            <span class="def-roll-label">ROLL</span>
          </button>
          <div class="def-stepper derived">
            <span class="def-derived-label">AGL + Adv</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useHeroStore } from '../../stores/heroStore.js';
import { useUiStore } from '../../stores/uiStore.js';

const heroStore = useHeroStore();
const uiStore = useUiStore();

const enhDefenses = computed(() => {
  return heroStore.activeEnhancedTraits?.defenses || { DODGE: 0, PARRY: 0, FORTITUDE: 0, TOUGHNESS: 0, WILL: 0 };
});

const protectionBonus = computed(() => {
  let bonus = 0;
  for (const effect of heroStore.activeEffects) {
    const b = (effect.baseEffect || effect.name || '').toLowerCase();
    if (b === 'protection') {
      bonus += (parseInt(effect.ranks, 10) || 0);
    }
  }
  return bonus;
});

const defensiveRollBonus = computed(() => {
  return heroStore.getAdvantageRanks('Defensive Roll');
});

const toughnessDerivedLabel = computed(() => {
  const parts = [];
  if (protectionBonus.value > 0) parts.push(`+${protectionBonus.value} Armor`);
  if (defensiveRollBonus.value > 0) parts.push(`+${defensiveRollBonus.value} Def Roll`);
  return parts.length > 0 ? parts.join(' • ') : 'Via STA';
});

const improvedInitBonus = computed(() => {
  return heroStore.getAdvantageRanks('Improved Initiative') * 4;
});

const totalInitiative = computed(() => {
  return (heroStore.effectiveAbilities.AGL || 0) + improvedInitBonus.value;
});

const effectiveToughnessCheck = computed(() => {
  const baseToughness = heroStore.defenseTotals.TOUGHNESS;
  const injuries = heroStore.character.injuries || 0;
  return baseToughness - injuries;
});

function stepDefense(key, delta) {
  const current = Number(heroStore.character.defensesBought[key]) || 0;
  heroStore.setDefense(key, Math.max(0, current + delta));
}

function rollDefense(name, bonus) {
  heroStore.rollCheck(`${name} Resistance`, bonus, null, 'Defense');
}
</script>

<style scoped>
.def-meta-row {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.def-enh-badge {
  font-size: 0.62rem;
  font-weight: 800;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.15);
  border: 1px solid rgba(56, 189, 248, 0.3);
  padding: 0.08rem 0.35rem;
  border-radius: var(--radius-xs);
  text-transform: uppercase;
}

.def-injured-text {
  color: #f87171 !important;
  font-weight: 800;
}

.card-injured {
  border-color: rgba(239, 68, 68, 0.45) !important;
  background: rgba(239, 68, 68, 0.06) !important;
}

.step-btn {
  width: 22px;
  height: 22px;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: var(--text-secondary);
  border-radius: 4px;
  cursor: pointer;
  transition: all var(--trans-fast);
}

.step-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.init-roll-btn {
  background: rgba(225, 29, 72, 0.08) !important;
  border-color: rgba(225, 29, 72, 0.35) !important;
}

.init-roll-btn:hover {
  background: #e11d48 !important;
  border-color: #f43f5e !important;
  box-shadow: 0 0 10px rgba(225, 29, 72, 0.4) !important;
}
</style>
