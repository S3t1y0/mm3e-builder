<template>
  <!-- Core Abilities Ribbon -->
  <section class="dndb-abilities-ribbon">
    <div class="dndb-ribbon-header">
      <span class="dndb-ribbon-title">ABILITIES</span>
      <div class="dndb-ribbon-meta">
        <span class="dndb-ribbon-cost">2 PP / Rank</span>
        <span class="dndb-ribbon-total font-mono">
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
      >
        <!-- Clickable Top Area: Key, Name & Detail Inspector Trigger -->
        <div
          class="ab-top-clickable"
          role="button"
          tabindex="0"
          @click="openAbilityDrawer(ab)"
          @keydown.enter="openAbilityDrawer(ab)"
          @keydown.space.prevent="openAbilityDrawer(ab)"
        >
          <div class="ab-title-row">
            <span class="ab-key">{{ ab.key }}</span>
          </div>
          <span class="ab-name">{{ ab.name }}</span>
        </div>

        <!-- Bottom Controls: Rapid Rank Stepper & d20 Click-to-Roll Chip -->
        <div class="ab-controls">
          <button
            type="button"
            class="step-btn"
            :disabled="heroStore.isAbilityAbsent(ab.key)"
            @click.stop="heroStore.setAbility(ab.key, (heroStore.character.abilities[ab.key] || 0) - 1)"
          >-</button>

          <button
            type="button"
            class="ab-roll-btn"
            :disabled="heroStore.isAbilityAbsent(ab.key)"
            @click.stop="!heroStore.isAbilityAbsent(ab.key) && handleRollCheck(ab)"
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
            @click.stop="heroStore.setAbility(ab.key, (heroStore.character.abilities[ab.key] || 0) + 1)"
          >+</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useHeroStore } from '../../stores/heroStore.js';
import { useUiStore } from '../../stores/uiStore.js';
import { formatModifier } from '../../rules/abilities.js';

const heroStore = useHeroStore();
const uiStore = useUiStore();

const ABILITIES_CONFIG = [
  {
    key: 'STR',
    name: 'Strength',
    desc: 'Lifting capacity, physical brute force, and close combat damage bonus.',
    absentDesc: 'Zero lifting capacity (0 kg). Melee attacks cannot deal Strength damage. Athletics checks automatically fail.'
  },
  {
    key: 'STA',
    name: 'Stamina',
    desc: 'Physical health, recovery from injury, and bodily resistance to toxins and disease.',
    absentDesc: 'Construct trait. Base Toughness 0, Fortitude defense absent (requires Immunity 30), no natural healing.'
  },
  {
    key: 'AGL',
    name: 'Agility',
    desc: 'Quick motor reflexes, balance, kinetic body control, and physical stealth.',
    absentDesc: 'No physical evasion or reflexes. Base Dodge 0, Initiative 0, and automatic failure on Acrobatics and Stealth checks.'
  },
  {
    key: 'DEX',
    name: 'Dexterity',
    desc: 'Manual coordination, precision aiming, vehicle piloting, and sleight of hand.',
    absentDesc: 'No manual dexterity. Base Ranged Attack 0, and cannot operate vehicles, tools, or make Sleight of Hand checks.'
  },
  {
    key: 'FGT',
    name: 'Fighting',
    desc: 'Close combat competence, hand-to-hand skill, and active melee parry defense.',
    absentDesc: 'No close combat competence. Base Parry 0, Base Close Attack 0, and unable to actively parry melee attacks.'
  },
  {
    key: 'INT',
    name: 'Intellect',
    desc: 'Logic, deduction, technical comprehension, memory recall, and science reasoning.',
    absentDesc: 'Mindless automaton. Acts solely on rigid programming or outside commands. Fails all intellect and technical checks.'
  },
  {
    key: 'AWE',
    name: 'Awareness',
    desc: 'Sensory perception, empathy, intuitive insight, and willpower fortitude.',
    absentDesc: 'Blind and deaf without sensory powers. Base Will 0, and fails all Perception and Insight checks.'
  },
  {
    key: 'PRE',
    name: 'Presence',
    desc: 'Force of personality, charisma, leadership, social intimidation, and persuasion.',
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

function openAbilityDrawer(ab) {
  uiStore.openInspector(
    'ability',
    ab,
    `${ab.name} (${ab.key})`,
    ''
  );
}

function handleRollCheck(ab) {
  const eff = getEffectiveRank(ab.key);
  heroStore.rollCheck(`${ab.name} (${ab.key}) Check`, eff, null, 'Ability');
}
</script>

<style scoped>
.dndb-ribbon-meta {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.dndb-ribbon-total {
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--text-secondary);
}

/* Clickable Top Portion */
.ab-top-clickable {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100%;
  padding: 0.45rem 0.25rem 0.35rem;
  border-radius: var(--radius-sm, 6px);
  cursor: pointer;
  transition: all var(--trans-fast, 0.15s ease);
  user-select: none;
}

.ab-top-clickable:hover {
  background: rgba(2, 132, 199, 0.1);
}

.ab-top-clickable:focus-visible {
  outline: 2px solid var(--accent-secondary, #2a8fd6);
  outline-offset: 1px;
}

.ab-title-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  width: 100%;
}

/* Enhanced Trait Subtle Accent (Zero Clutter Badge) - crisp solid accent without AI neon glow */
.ability-card.is-enhanced {
  border-color: #38bdf8 !important;
  border-top-width: 2px;
  position: relative;
}

.ability-card.is-enhanced .ab-key {
  color: #38bdf8;
}

/* Absent Trait Subtle Accent */
.ability-card.is-absent {
  border-color: rgba(239, 68, 68, 0.3) !important;
  background: rgba(239, 68, 68, 0.04) !important;
  opacity: 0.85;
}

.ability-card.is-absent .ab-name {
  text-decoration: line-through;
  opacity: 0.65;
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
