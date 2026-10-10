<template>
  <!-- Core Abilities Ribbon -->
  <section class="dndb-abilities-ribbon">
    <div class="dndb-ribbon-header">
      <span class="dndb-ribbon-title">ABILITIES</span>
      <div style="display: flex; align-items: center; gap: 0.65rem;">
        <span class="dndb-ribbon-cost">2 PP / Rank</span>
        <span style="font-size: 0.72rem; font-weight: 800; color: var(--text-secondary); font-family: var(--font-mono);">
          {{ heroStore.totalAbilityPP }} PP Total
        </span>
      </div>
    </div>

    <div class="dndb-abilities-grid">
      <div
        v-for="ab in ABILITIES_CONFIG"
        :key="ab.key"
        class="ability-card"
        :class="{
          'is-absent': heroStore.isAbilityAbsent(ab.key),
          'is-enhanced': getEnhancedRanks(ab.key) > 0
        }"
        :title="`${ab.desc}${heroStore.isAbilityAbsent(ab.key) ? ` (Absent ${ab.name}: ${ab.absentDesc})` : (getEnhancedRanks(ab.key) > 0 ? ` (Enhanced Trait active: +${getEnhancedRanks(ab.key)})` : '')}`"
      >
        <div class="ab-top">
          <div class="ab-title-row">
            <span class="ab-key">{{ ab.key }}</span>
            <button
              type="button"
              class="matrix-absent-toggle"
              :class="{ active: heroStore.isAbilityAbsent(ab.key) }"
              :title="heroStore.isAbilityAbsent(ab.key) ? `Restore ${ab.name}` : `Set ${ab.name} to Absent (-10 PP)`"
              @click.stop="heroStore.toggleAbsentAbility(ab.key)"
            >
              {{ heroStore.isAbilityAbsent(ab.key) ? '-' : 'Nil' }}
            </button>
          </div>
          <span class="ab-name">{{ ab.name }}</span>
          <span
            class="ab-cost font-mono"
            :class="{ 'is-refund': heroStore.isAbilityAbsent(ab.key) }"
          >
            {{ heroStore.isAbilityAbsent(ab.key) ? '-10 PP' : `${(heroStore.character.abilities[ab.key] || 0) * 2} PP` }}
          </span>
          <span
            v-if="!heroStore.isAbilityAbsent(ab.key) && getEnhancedRanks(ab.key) > 0"
            class="ab-enh-badge"
            :title="`Enhanced Trait active: +${getEnhancedRanks(ab.key)}`"
          >
            +{{ getEnhancedRanks(ab.key) }} Enh
          </span>
        </div>

        <div class="ab-controls">
          <button
            type="button"
            class="step-btn"
            :disabled="heroStore.isAbilityAbsent(ab.key)"
            title="Decrease Rank"
            @click="heroStore.setAbility(ab.key, (heroStore.character.abilities[ab.key] || 0) - 1)"
          >-</button>

          <button
            type="button"
            class="ab-roll-btn"
            :disabled="heroStore.isAbilityAbsent(ab.key)"
            :title="heroStore.isAbilityAbsent(ab.key) ? `Absent ${ab.name}: ${ab.absentDesc}` : `Click to Roll ${ab.name} Check (d20${getEffectiveRank(ab.key) >= 0 ? '+' + getEffectiveRank(ab.key) : getEffectiveRank(ab.key)})`"
            @click="!heroStore.isAbilityAbsent(ab.key) && handleRollCheck(ab)"
          >
            <i :class="heroStore.isAbilityAbsent(ab.key) ? 'ri-close-line' : 'ri-dice-line'"></i>
            <span
              class="ab-val"
              :class="{
                negative: !heroStore.isAbilityAbsent(ab.key) && getEffectiveRank(ab.key) < 0,
                absent: heroStore.isAbilityAbsent(ab.key)
              }"
            >
              {{ heroStore.isAbilityAbsent(ab.key) ? '-' : formatModifier(getEffectiveRank(ab.key)) }}
            </span>
          </button>

          <button
            type="button"
            class="step-btn"
            :disabled="heroStore.isAbilityAbsent(ab.key)"
            title="Increase Rank"
            @click="heroStore.setAbility(ab.key, (heroStore.character.abilities[ab.key] || 0) + 1)"
          >+</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useHeroStore } from '../../stores/heroStore.js';
import { useUiStore } from '../../stores/uiStore.js';

const heroStore = useHeroStore();
const uiStore = useUiStore();

const ABILITIES_CONFIG = [
  {
    key: 'STR',
    name: 'Strength',
    desc: 'Lifting capacity and close combat damage',
    absentDesc: 'Zero lifting capacity (0 kg). Melee attacks cannot deal Strength damage. Athletics checks automatically fail.'
  },
  {
    key: 'STA',
    name: 'Stamina',
    desc: 'Physical health, recovery, and resistance',
    absentDesc: 'Construct trait. Base Toughness 0, Fortitude defense absent (requires Immunity 30), no natural healing.'
  },
  {
    key: 'AGL',
    name: 'Agility',
    desc: 'Quick motor reflexes, balance, and coordination',
    absentDesc: 'No physical evasion or reflexes. Base Dodge 0, Initiative 0, and automatic failure on Acrobatics and Stealth checks.'
  },
  {
    key: 'DEX',
    name: 'Dexterity',
    desc: 'Hand-eye coordination, aim, and manipulation',
    absentDesc: 'No manual dexterity. Base Ranged Attack 0, and cannot operate vehicles, tools, or make Sleight of Hand checks.'
  },
  {
    key: 'FGT',
    name: 'Fighting',
    desc: 'Close combat accuracy and hand-to-hand defense',
    absentDesc: 'No close combat competence. Base Parry 0, Base Close Attack 0, and unable to actively parry melee attacks.'
  },
  {
    key: 'INT',
    name: 'Intellect',
    desc: 'Logic, technical reasoning, and memory',
    absentDesc: 'Mindless automaton. Acts solely on rigid programming or outside commands. Fails all intellect and technical checks.'
  },
  {
    key: 'AWE',
    name: 'Awareness',
    desc: 'Sensory perception, insight, and mental resolve',
    absentDesc: 'Blind and deaf without sensory powers. Base Will 0, and fails all Perception and Insight checks.'
  },
  {
    key: 'PRE',
    name: 'Presence',
    desc: 'Force of personality, leadership, and charisma',
    absentDesc: 'No personality, ego, or social presence. Fails all Deception, Intimidation, and Persuasion checks.'
  }
];

function getEnhancedRanks(code) {
  return heroStore.activeEnhancedTraits?.abilities?.[code] || 0;
}

function getEffectiveRank(code) {
  const base = Number(heroStore.character.abilities[code]) || 0;
  const enh = getEnhancedRanks(code);
  return base + enh;
}

function formatModifier(val) {
  return val >= 0 ? `+${val}` : `${val}`;
}

function handleRollCheck(ab) {
  const eff = getEffectiveRank(ab.key);
  heroStore.rollCheck(`${ab.name} (${ab.key}) Check`, eff, null, 'Ability');
}
</script>

<style scoped>
.ab-title-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  width: 100%;
}

.matrix-absent-toggle {
  position: relative;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: var(--text-muted);
  font-size: 0.6rem;
  font-weight: 700;
  border-radius: 3px;
  padding: 1px 5px;
  line-height: 1.3;
  cursor: pointer;
  transition: all var(--trans-fast);
}

/* Touch hit-area expansion for mobile ergonomics (WCAG / R-03 >= 44x44px) */
.matrix-absent-toggle::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 44px;
  height: 44px;
}

.matrix-absent-toggle:hover {
  background: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
  border-color: rgba(239, 68, 68, 0.35);
}

.matrix-absent-toggle.active {
  background: rgba(239, 68, 68, 0.25);
  color: #fca5a5;
  border-color: rgba(239, 68, 68, 0.5);
}

.ability-card.is-absent {
  border-color: rgba(239, 68, 68, 0.3) !important;
  background: rgba(239, 68, 68, 0.04) !important;
}

.ab-cost.is-refund {
  color: #34d399 !important;
  background: rgba(16, 185, 129, 0.15) !important;
  border: 1px solid rgba(16, 185, 129, 0.35);
}

.ab-val.absent {
  color: #f87171 !important;
}

.ab-roll-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: rgba(239, 68, 68, 0.08) !important;
  border-color: rgba(239, 68, 68, 0.2) !important;
}

.step-btn:disabled {
  opacity: 0.25;
  cursor: not-allowed;
}
</style>
