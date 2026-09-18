<template>
  <div class="dndb-card dndb-defenses-card">
    <div class="dndb-card-header">
      <h3 class="dndb-card-title">DEFENSES</h3>
      <span class="dndb-cost-indicator">1 PP / Rank</span>
    </div>
    <p class="dndb-card-sub">Resistance checks to withstand damage and hazardous effects.</p>

    <!-- 6 Defenses & Initiative Grid -->
    <div class="dndb-defenses-grid">
      <!-- 1. Dodge -->
      <div class="defense-card" title="Ability to avoid ranged attacks and area hazards.">
        <div class="def-header">
          <span class="def-name">Dodge</span>
          <div class="def-meta-row">
            <span v-if="condMods.isDefenseless" class="def-cond-badge danger" title="Defenseless: Active defense is 0">Defenseless (0)</span>
            <span v-else-if="condMods.isVulnerable" class="def-cond-badge warn" :title="`Vulnerable: Halved from base ${heroStore.defenseTotals.DODGE}`">Halved</span>
            <span v-if="condMods.isProne" class="def-cond-badge bonus" title="Prone: +5 defense vs ranged attacks">+5 Ranged</span>
            <span v-if="enhDefenses.DODGE > 0" class="def-enh-badge" :title="`Enhanced Trait active: +${enhDefenses.DODGE}`">
              +{{ enhDefenses.DODGE }} Enh
            </span>
            <span v-if="equipmentShieldBonus > 0" class="def-enh-badge" :title="`Equipped Shield: +${equipmentShieldBonus}`">
              +{{ equipmentShieldBonus }} Shield
            </span>
            <span class="def-base-info">AGL {{ heroStore.effectiveAbilities.AGL || 0 }}</span>
          </div>
        </div>
        <div class="def-body">
          <button type="button" class="def-roll-btn" @click="rollDefense('Dodge', combatDefenses.DODGE)" title="Click to Roll Dodge Check">
            <i class="ri-dice-line"></i>
            <span class="def-total">{{ combatDefenses.DODGE >= 0 ? `+${combatDefenses.DODGE}` : combatDefenses.DODGE }}</span>
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
            <span v-if="condMods.isDefenseless" class="def-cond-badge danger" title="Defenseless: Active defense is 0">Defenseless (0)</span>
            <span v-else-if="condMods.isVulnerable" class="def-cond-badge warn" :title="`Vulnerable: Halved from base ${heroStore.defenseTotals.PARRY}`">Halved</span>
            <span v-if="condMods.isProne && !condMods.isDefenseless" class="def-cond-badge danger" title="Prone: -5 defense vs close attacks">-5 Close</span>
            <span v-if="enhDefenses.PARRY > 0" class="def-enh-badge" :title="`Enhanced Trait active: +${enhDefenses.PARRY}`">
              +{{ enhDefenses.PARRY }} Enh
            </span>
            <span v-if="equipmentShieldBonus > 0" class="def-enh-badge" :title="`Equipped Shield: +${equipmentShieldBonus}`">
              +{{ equipmentShieldBonus }} Shield
            </span>
            <span class="def-base-info">FGT {{ heroStore.effectiveAbilities.FGT || 0 }}</span>
          </div>
        </div>
        <div class="def-body">
          <button type="button" class="def-roll-btn" @click="rollDefense('Parry', combatDefenses.PARRY)" title="Click to Roll Parry Check">
            <i class="ri-dice-line"></i>
            <span class="def-total">{{ combatDefenses.PARRY >= 0 ? `+${combatDefenses.PARRY}` : combatDefenses.PARRY }}</span>
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
            <span v-if="condMods.checkPenalty !== 0" class="def-cond-badge danger" :title="condMods.isDisabled ? 'Disabled: -5 on resistance checks' : 'Impaired: -2 on resistance checks'">
              {{ condMods.checkPenalty }} {{ condMods.isDisabled ? 'Disabled' : 'Impaired' }}
            </span>
            <span v-if="enhDefenses.FORTITUDE > 0" class="def-enh-badge" :title="`Enhanced Trait active: +${enhDefenses.FORTITUDE}`">
              +{{ enhDefenses.FORTITUDE }} Enh
            </span>
            <span class="def-base-info">STA {{ heroStore.effectiveAbilities.STA || 0 }}</span>
          </div>
        </div>
        <div class="def-body">
          <button type="button" class="def-roll-btn" @click="rollDefense('Fortitude', combatDefenses.FORTITUDE)" title="Click to Roll Fortitude Check">
            <i class="ri-dice-line"></i>
            <span class="def-total">{{ combatDefenses.FORTITUDE >= 0 ? `+${combatDefenses.FORTITUDE}` : combatDefenses.FORTITUDE }}</span>
            <span class="def-roll-label">ROLL</span>
          </button>
          <div class="def-stepper">
            <button type="button" class="step-btn" @click="stepDefense('FORTITUDE', -1)" title="Decrease Fortitude">-</button>
            <span class="def-bought-val">+{{ heroStore.character.defensesBought.FORTITUDE || 0 }} PP</span>
            <button type="button" class="step-btn" @click="stepDefense('FORTITUDE', 1)" title="Increase Fortitude">+</button>
          </div>
        </div>
      </div>

      <!-- 4. Will -->
      <div class="defense-card" title="Mental stability, determination, and psychic resistance.">
        <div class="def-header">
          <span class="def-name">Will</span>
          <div class="def-meta-row">
            <span v-if="condMods.checkPenalty !== 0" class="def-cond-badge danger" :title="condMods.isDisabled ? 'Disabled: -5 on resistance checks' : 'Impaired: -2 on resistance checks'">
              {{ condMods.checkPenalty }} {{ condMods.isDisabled ? 'Disabled' : 'Impaired' }}
            </span>
            <span v-if="enhDefenses.WILL > 0" class="def-enh-badge" :title="`Enhanced Trait active: +${enhDefenses.WILL}`">
              +{{ enhDefenses.WILL }} Enh
            </span>
            <span class="def-base-info">AWE {{ heroStore.effectiveAbilities.AWE || 0 }}</span>
          </div>
        </div>
        <div class="def-body">
          <button type="button" class="def-roll-btn" @click="rollDefense('Will', combatDefenses.WILL)" title="Click to Roll Will Check">
            <i class="ri-dice-line"></i>
            <span class="def-total">{{ combatDefenses.WILL >= 0 ? `+${combatDefenses.WILL}` : combatDefenses.WILL }}</span>
            <span class="def-roll-label">ROLL</span>
          </button>
          <div class="def-stepper">
            <button type="button" class="step-btn" @click="stepDefense('WILL', -1)" title="Decrease Will">-</button>
            <span class="def-bought-val">+{{ heroStore.character.defensesBought.WILL || 0 }} PP</span>
            <button type="button" class="step-btn" @click="stepDefense('WILL', 1)" title="Increase Will">+</button>
          </div>
        </div>
      </div>

      <!-- 5. Toughness (Spans full width on row 3) -->
      <div class="defense-card card-toughness" :class="{ 'card-injured': heroStore.character.injuries > 0 }" title="Resistance to direct damage (Derived from STA + Protection, reduced by bruises).">
        <div class="def-header">
          <span class="def-name">Toughness</span>
          <div class="def-meta-row">
            <span v-if="condMods.defRollLost > 0" class="def-cond-badge danger" title="Defensive Roll advantage bonus lost while Vulnerable or Defenseless">
              -{{ condMods.defRollLost }} Def Roll Lost
            </span>
            <span v-if="enhDefenses.TOUGHNESS > 0" class="def-enh-badge" :title="`Enhanced Trait active: +${enhDefenses.TOUGHNESS}`">
              +{{ enhDefenses.TOUGHNESS }} Enh
            </span>
            <span v-if="equipmentArmorBonus > 0" class="def-enh-badge" :title="`Equipped Armor: +${equipmentArmorBonus}`">
              +{{ equipmentArmorBonus }} Armor
            </span>
            <span v-if="heroStore.character.injuries > 0" class="def-base-info def-injured-text" :title="`Base STA ${heroStore.effectiveAbilities.STA || 0}, minus ${heroStore.character.injuries} bruise penalty`">
              STA {{ heroStore.effectiveAbilities.STA || 0 }} (-{{ heroStore.character.injuries }} Bruised)
            </span>
            <span v-else class="def-base-info">
              STA {{ heroStore.effectiveAbilities.STA || 0 }}{{ protectionBonus > 0 ? ` (+${protectionBonus} Power)` : '' }}{{ defensiveRollBonus > 0 ? ` (+${defensiveRollBonus} Adv)` : '' }}
            </span>
          </div>
        </div>
        <div class="def-body">
          <button type="button" class="def-roll-btn" @click="rollDefense('Toughness', combatDefenses.TOUGHNESS)" title="Click to Roll Toughness Resistance">
            <i class="ri-dice-line"></i>
            <span class="def-total">{{ combatDefenses.TOUGHNESS >= 0 ? `+${combatDefenses.TOUGHNESS}` : combatDefenses.TOUGHNESS }}</span>
            <span class="def-roll-label">ROLL</span>
          </button>
          <div class="def-stepper derived">
            <span class="def-derived-label">{{ toughnessDerivedLabel }}</span>
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

const combatDefenses = computed(() => heroStore.effectiveCombatDefenses);
const condMods = computed(() => heroStore.conditionModifiers);

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

const equipmentArmorBonus = computed(() => {
  return heroStore.equipmentArmorBonus || 0;
});

const equipmentShieldBonus = computed(() => {
  return heroStore.equipmentShieldBonus || 0;
});

const defensiveRollBonus = computed(() => {
  return heroStore.getAdvantageRanks('Defensive Roll');
});

const toughnessDerivedLabel = computed(() => {
  const parts = [];
  if (protectionBonus.value > 0) parts.push(`+${protectionBonus.value} Power`);
  if (equipmentArmorBonus.value > 0) parts.push(`+${equipmentArmorBonus.value} Armor`);
  if (defensiveRollBonus.value > 0) {
    if (condMods.value.defRollLost > 0) {
      parts.push(`0 Def Roll (Lost)`);
    } else {
      parts.push(`+${defensiveRollBonus.value} Def Roll`);
    }
  }
  return parts.length > 0 ? parts.join(' • ') : 'Via STA';
});

function stepDefense(key, delta) {
  const current = Number(heroStore.character.defensesBought[key]) || 0;
  heroStore.setDefense(key, Math.max(0, current + delta));
}

function rollDefense(name, bonus) {
  const extra = {};
  if (condMods.value.checkPenalty !== 0 && (name === 'Fortitude' || name === 'Will')) {
    extra.conditionPenalty = condMods.value.checkPenalty;
  }
  if (heroStore.character.injuries > 0 && name === 'Toughness') {
    extra.injuryPenalty = -heroStore.character.injuries;
  }
  heroStore.rollCheck(`${name} Resistance`, bonus, null, 'Defense', extra);
}
</script>

<style scoped>
.card-toughness {
  grid-column: 1 / -1;
}

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

.def-cond-badge {
  font-size: 0.62rem;
  font-weight: 800;
  padding: 0.08rem 0.35rem;
  border-radius: var(--radius-xs);
  text-transform: uppercase;
}

.def-cond-badge.danger {
  color: #f87171;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.35);
}

.def-cond-badge.warn {
  color: #fbbf24;
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.35);
}

.def-cond-badge.bonus {
  color: #34d399;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.35);
}
</style>
