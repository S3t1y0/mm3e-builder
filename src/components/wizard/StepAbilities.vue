<template>
  <div class="step-abilities-container">
    <div class="step-banner">
      <div class="step-banner-icon"><i class="ri-heart-pulse-line"></i></div>
      <div>
        <h3 class="step-title">Core Abilities</h3>
        <p class="step-subtitle">Allocate hero physical and mental abilities. Cost: <strong>2 PP per Rank</strong>. Normal human average is 0.</p>
      </div>
    </div>

    <!-- PP SUMMARY STRIP -->
    <div class="card abilities-budget-strip mb-3">
      <div class="budget-strip-spent">
        Abilities Point Total: <span class="tabular-nums budget-val">{{ heroStore.abilitiesCost }} PP</span>
      </div>
      <div class="budget-strip-remaining">
        Remaining Character Budget: <strong class="tabular-nums" :class="heroStore.remainingPP < 0 ? 'budget-danger' : 'budget-ok'">{{ heroStore.remainingPP }} PP</strong>
      </div>
    </div>

    <!-- ABILITIES GRID -->
    <div class="abilities-grid">
      <div
        v-for="ability in abilitiesList"
        :key="ability.key"
        class="card wizard-ability-card"
        :class="{ 'is-absent': heroStore.isAbilityAbsent(ability.key) }"
      >
        <!-- Card Header: Code, Full Name, Absent Toggle, and PP Cost Tag -->
        <div class="ability-card-header">
          <div class="ability-title-group">
            <span class="ability-code">{{ ability.key }}</span>
            <span class="ability-name">{{ ability.name }}</span>

            <!-- Modular Absent Ability Toggle placed under the full name -->
            <button
              type="button"
              class="absent-toggle-pill"
              :class="{ 'is-absent': heroStore.isAbilityAbsent(ability.key) }"
              @click="heroStore.toggleAbsentAbility(ability.key)"
              :title="heroStore.isAbilityAbsent(ability.key) ? `Restore ${ability.name} to active (Rank 0)` : `Set ${ability.name} to Absent (-, -10 PP)`"
            >
              <i :class="heroStore.isAbilityAbsent(ability.key) ? 'ri-close-circle-fill' : 'ri-indeterminate-circle-line'"></i>
              <span>Absent (-)</span>
            </button>
          </div>

          <!-- Cost Tag: Displays -10 PP refund when absent -->
          <div
            class="ability-cost-tag tabular-nums"
            :class="{ 'is-refund': heroStore.isAbilityAbsent(ability.key) }"
            :title="heroStore.isAbilityAbsent(ability.key) ? 'Absent Ability refund: -10 PP' : 'Cost: 2 PP per rank'"
          >
            {{ heroStore.isAbilityAbsent(ability.key) ? '-10 PP' : `${(heroStore.character.abilities[ability.key] || 0) * 2} PP` }}
          </div>
        </div>

        <!-- Prominent Ability Rank & Stepper Control -->
        <div class="ability-rank-box" :class="{ 'is-absent': heroStore.isAbilityAbsent(ability.key) }">
          <div class="rank-eyebrow">
            {{ heroStore.isAbilityAbsent(ability.key) ? 'Absent Ability' : 'Ability Rank' }}
          </div>

          <!-- When Absent: Display Dash & Nil indication -->
          <div v-if="heroStore.isAbilityAbsent(ability.key)" class="absent-display-row">
            <span class="absent-dash">-</span>
            <span class="absent-caption">Nil / Non-existent</span>
          </div>

          <!-- When Normal: Active Stepper -->
          <div v-else class="rank-stepper-row">
            <button
              type="button"
              class="stepper-action-btn"
              :disabled="(heroStore.character.abilities[ability.key] || 0) <= -5"
              @click="setAbilityRank(ability.key, (heroStore.character.abilities[ability.key] || 0) - 1)"
              :aria-label="`Decrease ${ability.name} rank`"
              title="Decrease Rank"
            >
              <i class="ri-subtract-line"></i>
            </button>

            <div class="rank-val-container">
              <span
                class="rank-val tabular-nums"
                :class="{
                  'is-positive': (heroStore.character.abilities[ability.key] || 0) > 0,
                  'is-negative': (heroStore.character.abilities[ability.key] || 0) < 0
                }"
              >
                {{ formatMod(heroStore.character.abilities[ability.key] || 0) }}
              </span>
            </div>

            <button
              type="button"
              class="stepper-action-btn"
              :disabled="(heroStore.character.abilities[ability.key] || 0) >= 20"
              @click="setAbilityRank(ability.key, (heroStore.character.abilities[ability.key] || 0) + 1)"
              :aria-label="`Increase ${ability.name} rank`"
              title="Increase Rank"
            >
              <i class="ri-add-line"></i>
            </button>
          </div>
        </div>

        <!-- Description -->
        <p class="ability-desc">{{ ability.desc }}</p>

        <!-- Derived Benefit Hint or Absent Consequence -->
        <div v-if="heroStore.isAbilityAbsent(ability.key)" class="ability-derived-box is-absent-notice">
          <i class="ri-alert-line derived-icon"></i>
          <span class="derived-text">
            <strong>Absent {{ ability.name }}:</strong> {{ ability.absentDesc }}
          </span>
        </div>
        <div v-else class="ability-derived-box">
          <i class="ri-corner-down-right-line derived-icon"></i>
          <span class="derived-text">{{ ability.affects }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useHeroStore } from '../../stores/heroStore.js';

const heroStore = useHeroStore();

const abilitiesList = [
  {
    key: 'STR',
    name: 'Strength',
    desc: 'Physical prowess, lifting capacity, and close combat damage.',
    affects: 'Damage DC, Athletics',
    absentDesc: 'Zero lifting capacity (0 kg). Melee attacks cannot deal Strength damage. Athletics checks automatically fail.'
  },
  {
    key: 'STA',
    name: 'Stamina',
    desc: 'Physical health, recovery, and resistance to disease, poison, and injury.',
    affects: 'Base Toughness, Fortitude',
    absentDesc: 'Construct trait. Base Toughness 0, Fortitude defense absent (requires Immunity 30), no natural healing.'
  },
  {
    key: 'AGL',
    name: 'Agility',
    desc: 'Agility, balance, quick motor reflexes, and overall body coordination.',
    affects: 'Base Dodge, Initiative, Acrobatics, Stealth',
    absentDesc: 'No physical evasion or reflexes. Base Dodge 0, Initiative 0, and automatic failure on Acrobatics and Stealth checks.'
  },
  {
    key: 'DEX',
    name: 'Dexterity',
    desc: 'Hand-eye coordination, aim, tool manipulation, and ranged combat.',
    affects: 'Ranged attack bonus, Sleight of Hand, Vehicles',
    absentDesc: 'No manual dexterity. Base Ranged Attack 0, and cannot operate vehicles, tools, or make Sleight of Hand checks.'
  },
  {
    key: 'FGT',
    name: 'Fighting',
    desc: 'Close combat competence and active hand-to-hand defense maneuvers.',
    affects: 'Close attack bonus, Base Parry',
    absentDesc: 'No close combat competence. Base Parry 0, Base Close Attack 0, and unable to actively parry melee attacks.'
  },
  {
    key: 'INT',
    name: 'Intellect',
    desc: 'Reasoning, logic, memory, technical aptitude, and general education.',
    affects: 'Expertise, Technology, Investigation, Treatment',
    absentDesc: 'Mindless automaton. Acts solely on rigid programming or outside commands. Fails all intellect and technical checks.'
  },
  {
    key: 'AWE',
    name: 'Awareness',
    desc: 'Intuition, sensory perception, common sense, and mental resolve.',
    affects: 'Base Will, Perception, Insight',
    absentDesc: 'Blind and deaf without sensory powers. Base Will 0, and fails all Perception and Insight checks.'
  },
  {
    key: 'PRE',
    name: 'Presence',
    desc: 'Charisma, leadership, force of personality, and social influence.',
    affects: 'Deception, Intimidation, Persuasion',
    absentDesc: 'No personality, ego, or social presence. Fails all Deception, Intimidation, and Persuasion checks.'
  }
];

function setAbilityRank(key, val) {
  heroStore.setAbility(key, val);
}

function formatMod(val) {
  return val >= 0 ? `+${val}` : `${val}`;
}
</script>

<style scoped>
.step-banner {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin-bottom: 1.25rem;
  padding: 1rem 1.25rem;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: var(--radius-md);
}

.step-banner-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  background: rgba(239, 68, 68, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  color: #f87171;
  flex-shrink: 0;
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

/* PP Summary Strip */
.abilities-budget-strip {
  padding: 0.85rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(59, 130, 246, 0.05);
  border: 1px solid rgba(59, 130, 246, 0.25);
  border-radius: var(--radius-md);
}

.budget-strip-spent {
  font-size: 0.85rem;
  color: #fff;
  font-weight: 700;
}

.budget-val {
  color: var(--accent-secondary, #38bdf8);
  font-size: 1.05rem;
  font-weight: 800;
}

.budget-strip-remaining {
  font-size: 0.78rem;
  color: var(--text-secondary);
}

.budget-ok {
  color: #10b981;
}

.budget-danger {
  color: #ef4444;
}

/* Grid & Cards */
.abilities-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}

@media (max-width: 1280px) {
  .abilities-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .abilities-grid {
    grid-template-columns: 1fr;
  }
}

.wizard-ability-card {
  background: rgba(15, 23, 42, 0.65);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1.1rem;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  transition: border-color var(--trans-fast), box-shadow var(--trans-fast);
}

.wizard-ability-card:hover {
  border-color: rgba(59, 130, 246, 0.35);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
}

/* Card Header */
.ability-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.85rem;
  width: 100%;
}

.ability-title-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.2rem;
}

.absent-toggle-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.28rem;
  padding: 0.18rem 0.5rem;
  font-size: 0.68rem;
  font-weight: 600;
  border-radius: var(--radius-xs);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: var(--text-muted);
  cursor: pointer;
  transition: all var(--trans-fast);
  white-space: nowrap;
  margin-top: 0.15rem;
}

.absent-toggle-pill:hover {
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.35);
  color: #fca5a5;
}

.absent-toggle-pill.is-absent {
  background: rgba(239, 68, 68, 0.18);
  border-color: rgba(239, 68, 68, 0.5);
  color: #fca5a5;
  font-weight: 700;
}

.ability-code {
  font-size: 1.25rem;
  font-weight: 900;
  color: #fff;
  letter-spacing: 0.05em;
  line-height: 1.1;
}

.ability-name {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.ability-cost-tag {
  font-size: 0.72rem;
  font-weight: 800;
  color: #60a5fa;
  background: rgba(59, 130, 246, 0.12);
  padding: 0.2rem 0.5rem;
  border-radius: var(--radius-xs);
  border: 1px solid rgba(59, 130, 246, 0.28);
  white-space: nowrap;
  transition: all var(--trans-fast);
}

.ability-cost-tag.is-refund {
  color: #34d399;
  background: rgba(16, 185, 129, 0.14);
  border-color: rgba(16, 185, 129, 0.4);
}

/* Hero Rank & Stepper Section */
.ability-rank-box {
  background: rgba(15, 23, 42, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: var(--radius-sm);
  padding: 0.65rem 0.75rem;
  margin-bottom: 0.85rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  transition: all var(--trans-fast);
}

.ability-rank-box.is-absent {
  background: rgba(239, 68, 68, 0.04);
  border-color: rgba(239, 68, 68, 0.25);
}

.absent-display-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  gap: 0.1rem;
}

.absent-dash {
  font-size: 1.6rem;
  font-weight: 900;
  color: #f87171;
  line-height: 1;
}

.absent-caption {
  font-size: 0.65rem;
  font-weight: 600;
  color: #fca5a5;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.rank-eyebrow {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--text-muted);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 0.35rem;
}

.rank-stepper-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.85rem;
  width: 100%;
}

.stepper-action-btn {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: var(--text-secondary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all var(--trans-fast);
  flex-shrink: 0;
  padding: 0;
}

.stepper-action-btn:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.4);
  color: #fff;
}

.stepper-action-btn:active:not(:disabled) {
  transform: scale(0.92);
}

.stepper-action-btn:disabled {
  opacity: 0.2;
  cursor: not-allowed;
  border-color: transparent;
}

.rank-val-container {
  min-width: 3.2rem;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rank-val {
  font-size: 1.45rem;
  font-weight: 900;
  color: #fff;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  transition: color var(--trans-fast);
}

.rank-val.is-positive {
  color: var(--accent-secondary, #38bdf8);
}

.rank-val.is-negative {
  color: #f87171;
}

/* Description */
.ability-desc {
  font-size: 0.76rem;
  color: var(--text-secondary);
  line-height: 1.45;
  margin-bottom: 0.85rem;
  flex-grow: 1;
  min-height: 42px;
}

/* Derived Benefit Hint */
.ability-derived-box {
  font-size: 0.72rem;
  display: flex;
  align-items: flex-start;
  gap: 0.35rem;
  padding-top: 0.65rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  line-height: 1.35;
  margin-top: auto;
}

.derived-icon {
  font-size: 0.85rem;
  color: var(--accent-secondary, #38bdf8);
  flex-shrink: 0;
  margin-top: 1px;
}

.derived-text {
  color: var(--text-muted);
}

.ability-derived-box.is-absent-notice {
  border-top-color: rgba(239, 68, 68, 0.25);
  background: rgba(239, 68, 68, 0.08);
  border-radius: var(--radius-xs);
  padding: 0.45rem 0.6rem;
  margin-top: auto;
}

.ability-derived-box.is-absent-notice .derived-icon {
  color: #f87171;
}

.ability-derived-box.is-absent-notice .derived-text {
  color: #fca5a5;
  line-height: 1.4;
}

.wizard-ability-card.is-absent {
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.03);
}

.wizard-ability-card.is-absent:hover {
  border-color: rgba(239, 68, 68, 0.5);
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.15);
}
</style>

