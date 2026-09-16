<template>
  <!-- Core Abilities Ribbon -->
  <section class="dndb-abilities-ribbon">
    <div class="dndb-ribbon-header">
      <span class="dndb-ribbon-title"><i class="ri-brain-line"></i> ABILITIES</span>
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
        :class="{ 'is-enhanced': getEnhancedRanks(ab.key) > 0 }"
        :title="`${ab.desc}${getEnhancedRanks(ab.key) > 0 ? ` (Enhanced Trait active: +${getEnhancedRanks(ab.key)})` : ''}`"
      >
        <div class="ab-top">
          <span class="ab-key">{{ ab.key }}</span>
          <span class="ab-name">{{ ab.name }}</span>
          <span class="ab-cost font-mono">{{ (heroStore.character.abilities[ab.key] || 0) * 2 }} PP</span>
          <span
            v-if="getEnhancedRanks(ab.key) > 0"
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
            title="Decrease Rank"
            @click="heroStore.setAbility(ab.key, (heroStore.character.abilities[ab.key] || 0) - 1)"
          >-</button>

          <button
            type="button"
            class="ab-roll-btn"
            :title="`Click to Roll ${ab.name} Check (d20${getEffectiveRank(ab.key) >= 0 ? '+' + getEffectiveRank(ab.key) : getEffectiveRank(ab.key)})`"
            @click="handleRollCheck(ab)"
          >
            <i class="ri-dice-line"></i>
            <span class="ab-val" :class="{ negative: getEffectiveRank(ab.key) < 0 }">
              {{ formatModifier(getEffectiveRank(ab.key)) }}
            </span>
          </button>

          <button
            type="button"
            class="step-btn"
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
  { key: 'STR', name: 'Strength', desc: 'Lifting capacity and close combat damage' },
  { key: 'STA', name: 'Stamina', desc: 'Physical health, recovery, and resistance' },
  { key: 'AGL', name: 'Agility', desc: 'Quick motor reflexes, balance, and coordination' },
  { key: 'DEX', name: 'Dexterity', desc: 'Hand-eye coordination, aim, and manipulation' },
  { key: 'FGT', name: 'Fighting', desc: 'Close combat accuracy and hand-to-hand defense' },
  { key: 'INT', name: 'Intellect', desc: 'Logic, technical reasoning, and memory' },
  { key: 'AWE', name: 'Awareness', desc: 'Sensory perception, insight, and mental resolve' },
  { key: 'PRE', name: 'Presence', desc: 'Force of personality, leadership, and charisma' }
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
