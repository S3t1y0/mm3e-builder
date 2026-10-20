<template>
  <div class="dndb-card dndb-defenses-card">
    <!-- Card Header -->
    <div class="dndb-card-header">
      <div class="dndb-card-title-wrap">
        <i class="ri-shield-fill dndb-card-icon"></i>
        <h3 class="dndb-card-title">DEFENSES</h3>
      </div>
      <div class="dndb-def-header-right">
        <span class="def-budget-pill">
          <strong class="budget-num">{{ totalDefensePP }}</strong>
          <span class="budget-lbl">PP</span>
        </span>
      </div>
    </div>

    <!-- Minimalist PL Cap Alert Banner (Visible ONLY when any paired defense exceeds PL cap) -->
    <transition name="alert-slide">
      <div v-if="plCapBreaches.length > 0" class="def-cap-alert-banner" role="alert">
        <div class="alert-icon-wrap">
          <i class="ri-error-warning-fill"></i>
        </div>
        <div class="alert-text-wrap">
          <strong class="alert-title">PL {{ heroStore.character.powerLevel }} Defense Cap Exceeded</strong>
          <span class="alert-detail">{{ plCapBreaches.join(' • ') }}</span>
        </div>
      </div>
    </transition>

    <!-- Tactical Row Ledger (Modular, Zero Nested Cards) -->
    <div class="def-row-ledger" role="list">
      <!-- 1. DODGE (AGL) -->
      <div class="def-ledger-row" role="listitem">
        <div class="def-row-main">
          <div
            class="def-name-group is-clickable"
            role="button"
            tabindex="0"
            aria-label="Inspect Dodge Defense details"
            @click="openDefenseInspector('DODGE')"
            @keydown.enter="openDefenseInspector('DODGE')"
            @keydown.space.prevent="openDefenseInspector('DODGE')"
          >
            <span class="def-ab-badge ab-agl">AGL</span>
            <span class="def-name">Dodge</span>
          </div>

          <div class="def-stepper-wrap">
            <div class="def-stepper">
              <button
                type="button"
                class="step-btn"
                :disabled="boughtDefenses.DODGE <= 0"
                @click="stepDefense('DODGE', -1)"
                aria-label="Decrease Dodge rank"
              >-</button>
              <span class="def-bought-val font-mono">{{ boughtDefenses.DODGE || 0 }}</span>
              <button
                type="button"
                class="step-btn"
                @click="stepDefense('DODGE', 1)"
                aria-label="Increase Dodge rank"
              >+</button>
            </div>
          </div>

          <div class="def-roll-wrap">
            <button
              type="button"
              class="def-roll-btn"
              @click="rollDefense('Dodge', combatDefenses.DODGE)"
              aria-label="Roll Dodge Resistance Check"
            >
              <i class="ri-dice-line"></i>
              <span class="def-roll-val font-mono">{{ formatBonus(combatDefenses.DODGE) }}</span>
            </button>
          </div>
        </div>

        <!-- Badges Subrow (Conditional) -->
        <div v-if="hasDodgeBadges" class="def-badges-subrow">
          <span v-if="condMods.isDefenseless" class="def-badge danger">Defenseless (0)</span>
          <span v-else-if="condMods.isVulnerable" class="def-badge warn">Halved</span>
          <span v-if="condMods.isProne" class="def-badge bonus">+5 Ranged</span>
          <span v-if="enhDefenses.DODGE > 0" class="def-badge enh">+{{ enhDefenses.DODGE }} Enh</span>
          <span v-if="equipmentShieldBonus > 0" class="def-badge shield">+{{ equipmentShieldBonus }} Shield</span>
        </div>
      </div>

      <!-- 2. PARRY (FGT) -->
      <div class="def-ledger-row" role="listitem">
        <div class="def-row-main">
          <div
            class="def-name-group is-clickable"
            role="button"
            tabindex="0"
            aria-label="Inspect Parry Defense details"
            @click="openDefenseInspector('PARRY')"
            @keydown.enter="openDefenseInspector('PARRY')"
            @keydown.space.prevent="openDefenseInspector('PARRY')"
          >
            <span class="def-ab-badge ab-fgt">FGT</span>
            <span class="def-name">Parry</span>
          </div>

          <div class="def-stepper-wrap">
            <div class="def-stepper">
              <button
                type="button"
                class="step-btn"
                :disabled="boughtDefenses.PARRY <= 0"
                @click="stepDefense('PARRY', -1)"
                aria-label="Decrease Parry rank"
              >-</button>
              <span class="def-bought-val font-mono">{{ boughtDefenses.PARRY || 0 }}</span>
              <button
                type="button"
                class="step-btn"
                @click="stepDefense('PARRY', 1)"
                aria-label="Increase Parry rank"
              >+</button>
            </div>
          </div>

          <div class="def-roll-wrap">
            <button
              type="button"
              class="def-roll-btn"
              @click="rollDefense('Parry', combatDefenses.PARRY)"
              aria-label="Roll Parry Resistance Check"
            >
              <i class="ri-dice-line"></i>
              <span class="def-roll-val font-mono">{{ formatBonus(combatDefenses.PARRY) }}</span>
            </button>
          </div>
        </div>

        <!-- Badges Subrow (Conditional) -->
        <div v-if="hasParryBadges" class="def-badges-subrow">
          <span v-if="condMods.isDefenseless" class="def-badge danger">Defenseless (0)</span>
          <span v-else-if="condMods.isVulnerable" class="def-badge warn">Halved</span>
          <span v-if="condMods.isProne && !condMods.isDefenseless" class="def-badge danger">-5 Close</span>
          <span v-if="enhDefenses.PARRY > 0" class="def-badge enh">+{{ enhDefenses.PARRY }} Enh</span>
          <span v-if="equipmentShieldBonus > 0" class="def-badge shield">+{{ equipmentShieldBonus }} Shield</span>
        </div>
      </div>

      <!-- 3. FORTITUDE (STA) -->
      <div
        class="def-ledger-row"
        :class="{ 'is-dying-row': heroStore.isDying, 'is-absent-row': isStaAbsent }"
        role="listitem"
      >
        <div class="def-row-main">
          <div
            class="def-name-group is-clickable"
            role="button"
            tabindex="0"
            aria-label="Inspect Fortitude Defense details"
            @click="openDefenseInspector('FORTITUDE')"
            @keydown.enter="openDefenseInspector('FORTITUDE')"
            @keydown.space.prevent="openDefenseInspector('FORTITUDE')"
          >
            <span class="def-ab-badge ab-sta">STA</span>
            <span class="def-name">Fortitude</span>
          </div>

          <div class="def-stepper-wrap">
            <span v-if="isStaAbsent" class="def-absent-label">Absent</span>
            <div v-else class="def-stepper">
              <button
                type="button"
                class="step-btn"
                :disabled="boughtDefenses.FORTITUDE <= 0"
                @click="stepDefense('FORTITUDE', -1)"
                aria-label="Decrease Fortitude rank"
              >-</button>
              <span class="def-bought-val font-mono">{{ boughtDefenses.FORTITUDE || 0 }}</span>
              <button
                type="button"
                class="step-btn"
                @click="stepDefense('FORTITUDE', 1)"
                aria-label="Increase Fortitude rank"
              >+</button>
            </div>
          </div>

          <div class="def-roll-wrap">
            <button
              type="button"
              class="def-roll-btn"
              :class="{ 'is-immune-btn': isStaAbsent, 'is-dying-btn': heroStore.isDying }"
              :disabled="isStaAbsent"
              @click="!isStaAbsent && rollDefense('Fortitude', combatDefenses.FORTITUDE)"
              :aria-label="isStaAbsent ? 'Fortitude Immune' : 'Roll Fortitude Resistance Check'"
            >
              <i :class="isStaAbsent ? 'ri-shield-check-line' : (heroStore.isDying ? 'ri-alarm-warning-line' : 'ri-dice-line')"></i>
              <span class="def-roll-val font-mono">{{ isStaAbsent ? 'Immune' : formatBonus(combatDefenses.FORTITUDE) }}</span>
            </button>
          </div>
        </div>

        <!-- Badges Subrow (Conditional) -->
        <div v-if="hasFortitudeBadges" class="def-badges-subrow">
          <span v-if="heroStore.isDying" class="def-badge danger pulse">Dying (DC 15 Check)</span>
          <span v-if="condMods.checkPenalty !== 0" class="def-badge danger">
            {{ condMods.checkPenalty }} {{ condMods.isDisabled ? 'Disabled' : 'Impaired' }}
          </span>
          <span v-if="enhDefenses.FORTITUDE > 0" class="def-badge enh">
            +{{ enhDefenses.FORTITUDE }} Enh
          </span>
        </div>
      </div>

      <!-- 4. WILL (AWE) -->
      <div class="def-ledger-row" role="listitem">
        <div class="def-row-main">
          <div
            class="def-name-group is-clickable"
            role="button"
            tabindex="0"
            aria-label="Inspect Will Defense details"
            @click="openDefenseInspector('WILL')"
            @keydown.enter="openDefenseInspector('WILL')"
            @keydown.space.prevent="openDefenseInspector('WILL')"
          >
            <span class="def-ab-badge ab-awe">AWE</span>
            <span class="def-name">Will</span>
          </div>

          <div class="def-stepper-wrap">
            <div class="def-stepper">
              <button
                type="button"
                class="step-btn"
                :disabled="boughtDefenses.WILL <= 0"
                @click="stepDefense('WILL', -1)"
                aria-label="Decrease Will rank"
              >-</button>
              <span class="def-bought-val font-mono">{{ boughtDefenses.WILL || 0 }}</span>
              <button
                type="button"
                class="step-btn"
                @click="stepDefense('WILL', 1)"
                aria-label="Increase Will rank"
              >+</button>
            </div>
          </div>

          <div class="def-roll-wrap">
            <button
              type="button"
              class="def-roll-btn"
              @click="rollDefense('Will', combatDefenses.WILL)"
              aria-label="Roll Will Resistance Check"
            >
              <i class="ri-dice-line"></i>
              <span class="def-roll-val font-mono">{{ formatBonus(combatDefenses.WILL) }}</span>
            </button>
          </div>
        </div>

        <!-- Badges Subrow (Conditional) -->
        <div v-if="hasWillBadges" class="def-badges-subrow">
          <span v-if="condMods.checkPenalty !== 0" class="def-badge danger">
            {{ condMods.checkPenalty }} {{ condMods.isDisabled ? 'Disabled' : 'Impaired' }}
          </span>
          <span v-if="enhDefenses.WILL > 0" class="def-badge enh">+{{ enhDefenses.WILL }} Enh</span>
        </div>
      </div>

      <!-- 5. TOUGHNESS (Anchored Flagship Row - Non-Purchasable Derived Stat) -->
      <div
        class="def-ledger-row is-toughness"
        :class="{ 'is-injured': heroStore.character.injuries > 0 }"
        role="listitem"
      >
        <div class="def-row-main">
          <div
            class="def-name-group is-clickable"
            role="button"
            tabindex="0"
            aria-label="Inspect Toughness Defense details"
            @click="openDefenseInspector('TOUGHNESS')"
            @keydown.enter="openDefenseInspector('TOUGHNESS')"
            @keydown.space.prevent="openDefenseInspector('TOUGHNESS')"
          >
            <span class="def-ab-badge ab-sta">STA</span>
            <span class="def-name text-cyan">Toughness</span>
          </div>

          <div class="def-stepper-wrap">
            <span class="def-non-bought-dash font-mono">-</span>
          </div>

          <div class="def-roll-wrap">
            <button
              type="button"
              class="def-roll-btn toughness-roll-btn"
              :class="{ 'is-injured-roll': heroStore.character.injuries > 0 }"
              @click="rollDefense('Toughness', combatDefenses.TOUGHNESS)"
              aria-label="Roll Toughness Damage Resistance Check"
            >
              <i class="ri-dice-line"></i>
              <span class="def-roll-val font-mono">{{ formatBonus(combatDefenses.TOUGHNESS) }}</span>
            </button>
          </div>
        </div>

        <!-- Badges Subrow (Conditional) -->
        <div v-if="hasToughnessBadges" class="def-badges-subrow">
          <span v-if="heroStore.character.injuries > 0" class="def-badge danger">
            -{{ heroStore.character.injuries }} Bruised
          </span>
          <span v-if="condMods.defRollLost > 0" class="def-badge danger">
            -{{ condMods.defRollLost }} Def Roll Lost
          </span>
          <span v-if="enhDefenses.TOUGHNESS > 0" class="def-badge enh">
            +{{ enhDefenses.TOUGHNESS }} Enh
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useHeroStore } from '../../stores/heroStore.js';
import { useUiStore } from '../../stores/uiStore.js';
import { DEFENSE_EDITORIAL } from '../../rules/defensesEditorial.js';

const heroStore = useHeroStore();
const uiStore = useUiStore();

function openDefenseInspector(key) {
  const meta = DEFENSE_EDITORIAL[key];
  if (!meta) return;
  uiStore.openInspector(
    'defense',
    {
      key,
      name: meta.name,
      baseAbility: meta.baseAbility
    },
    `${meta.name} Defense`,
    `${meta.type} • ${meta.cost}`
  );
}

const combatDefenses = computed(() => heroStore.effectiveCombatDefenses);
const condMods = computed(() => heroStore.conditionModifiers);
const boughtDefenses = computed(() => heroStore.character.defensesBought || {});

const isStaAbsent = computed(() => heroStore.isAbilityAbsent('STA'));
const powerLevel = computed(() => heroStore.character.powerLevel || 10);
const maxCap = computed(() => powerLevel.value * 2);
const singleWillCap = computed(() => powerLevel.value);

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

const equipmentArmorBonus = computed(() => heroStore.equipmentArmorBonus || 0);
const equipmentShieldBonus = computed(() => heroStore.equipmentShieldBonus || 0);
const defensiveRollBonus = computed(() => heroStore.getAdvantageRanks('Defensive Roll'));

const totalDefensePP = computed(() => {
  const b = boughtDefenses.value;
  return (b.DODGE || 0) + (b.PARRY || 0) + (b.FORTITUDE || 0) + (b.WILL || 0);
});

// Condition badge visibility flags
const hasDodgeBadges = computed(() => {
  return condMods.value.isDefenseless || condMods.value.isVulnerable || condMods.value.isProne || enhDefenses.value.DODGE > 0 || equipmentShieldBonus.value > 0;
});

const hasParryBadges = computed(() => {
  return condMods.value.isDefenseless || condMods.value.isVulnerable || (condMods.value.isProne && !condMods.value.isDefenseless) || enhDefenses.value.PARRY > 0 || equipmentShieldBonus.value > 0;
});

const hasFortitudeBadges = computed(() => {
  if (isStaAbsent.value) return false;
  return heroStore.isDying || condMods.value.checkPenalty !== 0 || enhDefenses.value.FORTITUDE > 0;
});

const hasWillBadges = computed(() => {
  return condMods.value.checkPenalty !== 0 || enhDefenses.value.WILL > 0;
});

const hasToughnessBadges = computed(() => {
  return heroStore.character.injuries > 0 || condMods.value.defRollLost > 0 || enhDefenses.value.TOUGHNESS > 0;
});

// PL Cap Defense Trade-Off Breaches Audit
const plCapBreaches = computed(() => {
  const breaches = [];
  const dodgeVal = combatDefenses.value.DODGE || 0;
  const parryVal = combatDefenses.value.PARRY || 0;
  const fortVal = combatDefenses.value.FORTITUDE || 0;
  const willVal = combatDefenses.value.WILL || 0;
  const toughVal = combatDefenses.value.TOUGHNESS || 0;

  if (dodgeVal + toughVal > maxCap.value) {
    breaches.push(`Dodge + Toughness (${dodgeVal + toughVal}/${maxCap.value})`);
  }
  if (parryVal + toughVal > maxCap.value) {
    breaches.push(`Parry + Toughness (${parryVal + toughVal}/${maxCap.value})`);
  }
  if (isStaAbsent.value) {
    if (willVal > singleWillCap.value) {
      breaches.push(`Will (${willVal}/${singleWillCap.value})`);
    }
  } else {
    if (fortVal + willVal > maxCap.value) {
      breaches.push(`Fortitude + Will (${fortVal + willVal}/${maxCap.value})`);
    }
  }
  return breaches;
});

function formatBonus(val) {
  if (val === null || val === undefined) return '-';
  const num = Number(val);
  if (isNaN(num)) return '-';
  return num >= 0 ? `+${num}` : `${num}`;
}

function stepDefense(key, delta) {
  const current = Number(boughtDefenses.value[key]) || 0;
  heroStore.setDefense(key, Math.max(0, current + delta));
}

function rollDefense(name, bonus) {
  if (name === 'Fortitude' && heroStore.isDying) {
    heroStore.rollDyingCheck();
    return;
  }
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
.dndb-defenses-card {
  background: var(--bg-card, #0f172a);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 0.85rem 1rem;
}

.dndb-def-header-right {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.def-budget-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
}

.budget-num {
  font-size: 0.8rem;
  font-weight: 800;
  color: #38bdf8;
  font-variant-numeric: tabular-nums;
}

.budget-lbl {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--text-muted, #94a3b8);
  text-transform: uppercase;
}



/* Minimalist PL Cap Alert Banner */
.def-cap-alert-banner {
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.35);
  border-radius: 6px;
  padding: 0.4rem 0.65rem;
  margin-top: 0.5rem;
  margin-bottom: 0.65rem;
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.alert-icon-wrap {
  color: #f87171;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
}

.alert-text-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  line-height: 1.25;
}

.alert-title {
  color: #fca5a5;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.alert-detail {
  color: #cbd5e1;
  font-size: 0.7rem;
  font-variant-numeric: tabular-nums;
}

.alert-slide-enter-active,
.alert-slide-leave-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.alert-slide-enter-from,
.alert-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* Tactical Row Ledger */
.def-row-ledger {
  display: flex;
  flex-direction: column;
  margin-top: 0.45rem;
}

.def-ledger-row {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.5rem 0.35rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: background 0.15s ease;
}

.def-ledger-row:last-child {
  border-bottom: none;
}

.def-ledger-row:hover {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 4px;
}

/* Main horizontal line of each row */
.def-row-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  width: 100%;
}

/* Left Group: Ability Badge + Name */
.def-name-group {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  min-width: 0;
  flex: 1 1 auto;
}

.def-name-group.is-clickable {
  cursor: pointer;
  border-radius: 4px;
  padding: 0.15rem 0.3rem;
  margin: -0.15rem -0.3rem;
  transition: all 0.15s ease;
  user-select: none;
}

.def-name-group.is-clickable:hover {
  background: rgba(255, 255, 255, 0.05);
}

.def-name-group.is-clickable:hover .def-name {
  color: #38bdf8;
  text-decoration: underline;
  text-decoration-color: rgba(56, 189, 248, 0.4);
  text-underline-offset: 3px;
}

.def-name-group.is-clickable:focus-visible {
  outline: 2px solid #38bdf8;
  outline-offset: 2px;
}

.def-ab-badge {
  font-size: 0.65rem;
  font-weight: 800;
  padding: 0.12rem 0.35rem;
  border-radius: 3px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  flex-shrink: 0;
}

.def-ab-badge.ab-agl { color: #38bdf8; border-color: rgba(56, 189, 248, 0.25); background: rgba(56, 189, 248, 0.08); }
.def-ab-badge.ab-fgt { color: #f43f5e; border-color: rgba(244, 63, 94, 0.25); background: rgba(244, 63, 94, 0.08); }
.def-ab-badge.ab-sta { color: #10b981; border-color: rgba(16, 185, 129, 0.25); background: rgba(16, 185, 129, 0.08); }
.def-ab-badge.ab-awe { color: #a78bfa; border-color: rgba(167, 139, 250, 0.25); background: rgba(167, 139, 250, 0.08); }

.def-name {
  font-size: 0.88rem;
  font-weight: 800;
  color: #f1f5f9;
  letter-spacing: 0.01em;
  white-space: nowrap;
}

/* Center Group: Stepper or Derived Chips */
.def-stepper-wrap {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.def-stepper {
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  padding: 0.1rem 0.25rem;
  gap: 0.25rem;
}

.def-bought-val {
  font-size: 0.78rem;
  font-weight: 800;
  color: #cbd5e1;
  min-width: 1.5rem;
  text-align: center;
}

.step-btn {
  width: 20px;
  height: 20px;
  border-radius: 3px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  color: #e2e8f0;
  font-size: 0.85rem;
  font-weight: 700;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.step-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.18);
  border-color: rgba(255, 255, 255, 0.3);
  color: #fff;
}

.step-btn:active:not(:disabled) {
  transform: scale(0.92);
}

.step-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.def-absent-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  padding: 0.15rem 0.45rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 3px;
}

.def-non-bought-dash {
  font-size: 0.88rem;
  font-weight: 700;
  color: #64748b;
  opacity: 0.5;
  width: 72px;
  text-align: center;
  user-select: none;
}

/* Right Group: Roll Chip */
.def-roll-wrap {
  flex-shrink: 0;
}

.def-roll-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.55rem;
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 5px;
  color: #34d399;
  cursor: pointer;
  transition: all 0.15s ease;
  min-width: 58px;
  justify-content: center;
}

.def-roll-btn:hover:not(:disabled) {
  background: rgba(16, 185, 129, 0.24);
  border-color: #34d399;
  color: #fff;
  transform: translateY(-1px);
}

.def-roll-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.def-roll-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.def-roll-btn i {
  font-size: 0.82rem;
}

.def-roll-val {
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: -0.01em;
}

/* Badges Sub-row */
.def-badges-subrow {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.25rem;
  padding-left: 2rem;
  margin-top: 0.1rem;
}

.def-badge {
  font-size: 0.6rem;
  font-weight: 800;
  padding: 0.06rem 0.3rem;
  border-radius: 3px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  line-height: 1.25;
}

.def-badge.danger {
  color: #f87171;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.35);
}

.def-badge.danger.pulse {
  animation: pulse-danger 1.8s infinite;
}

@keyframes pulse-danger {
  0%, 100% { opacity: 1; border-color: rgba(239, 68, 68, 0.5); }
  50% { opacity: 0.65; border-color: rgba(239, 68, 68, 0.2); }
}

.def-badge.warn {
  color: #fbbf24;
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.35);
}

.def-badge.bonus {
  color: #34d399;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.35);
}

.def-badge.enh,
.def-badge.shield {
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.3);
}

.def-badge.immune {
  color: #a78bfa;
  background: rgba(167, 139, 250, 0.12);
  border: 1px solid rgba(167, 139, 250, 0.3);
}

/* Special Row Modifiers */
.is-dying-row {
  background: rgba(239, 68, 68, 0.06);
}

.is-dying-btn {
  background: rgba(239, 68, 68, 0.2) !important;
  border-color: #ef4444 !important;
  color: #fca5a5 !important;
}

.is-immune-btn {
  background: rgba(255, 255, 255, 0.03) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
  color: #64748b !important;
  min-width: 68px;
}

/* Flagship Toughness Row Styling */
.is-toughness {
  border-left: 3px solid #0284c7;
  padding-left: 0.55rem;
  margin-left: -0.35rem;
  background: rgba(2, 132, 199, 0.03);
}

.toughness-roll-btn {
  background: rgba(2, 132, 199, 0.15);
  border-color: rgba(56, 189, 248, 0.35);
  color: #38bdf8;
}

.toughness-roll-btn:hover:not(:disabled) {
  background: rgba(2, 132, 199, 0.28);
  border-color: #38bdf8;
  color: #fff;
}

/* Injured State for Toughness */
.is-toughness.is-injured {
  border-left-color: #ef4444;
  background: rgba(239, 68, 68, 0.06);
}

.is-injured-roll {
  background: rgba(239, 68, 68, 0.16) !important;
  border-color: rgba(239, 68, 68, 0.4) !important;
  color: #fca5a5 !important;
}

/* Accessibility & Mobile Ergonomics */
.step-btn:focus-visible,
.def-roll-btn:focus-visible {
  outline: 2px solid #38bdf8;
  outline-offset: 2px;
}

@media (pointer: coarse) {
  .step-btn {
    min-width: 32px;
    min-height: 32px;
  }

  .def-roll-btn {
    min-height: 36px;
    padding: 0.35rem 0.65rem;
  }
}
</style>
