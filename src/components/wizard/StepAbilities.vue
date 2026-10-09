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
      >
        <!-- Card Header: Code, Full Name, and PP Cost Tag -->
        <div class="ability-card-header">
          <div class="ability-title-group">
            <span class="ability-code">{{ ability.key }}</span>
            <span class="ability-name">{{ ability.name }}</span>
          </div>
          <div class="ability-cost-tag tabular-nums" title="Cost: 2 PP per rank">
            {{ (heroStore.character.abilities[ability.key] || 0) * 2 }} PP
          </div>
        </div>

        <!-- Prominent Ability Rank & Proportional Stepper Control -->
        <div class="ability-rank-box">
          <div class="rank-eyebrow">Ability Rank</div>
          <div class="rank-stepper-row">
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

        <!-- Derived Benefit Hint -->
        <div class="ability-derived-box">
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
    affects: 'Damage DC, Athletics'
  },
  {
    key: 'STA',
    name: 'Stamina',
    desc: 'Physical health, recovery, and resistance to disease, poison, and injury.',
    affects: 'Base Toughness, Fortitude'
  },
  {
    key: 'AGL',
    name: 'Agility',
    desc: 'Agility, balance, quick motor reflexes, and overall body coordination.',
    affects: 'Base Dodge, Initiative, Acrobatics, Stealth'
  },
  {
    key: 'DEX',
    name: 'Dexterity',
    desc: 'Hand-eye coordination, aim, tool manipulation, and ranged combat.',
    affects: 'Ranged attack bonus, Sleight of Hand, Vehicles'
  },
  {
    key: 'FGT',
    name: 'Fighting',
    desc: 'Close combat competence and active hand-to-hand defense maneuvers.',
    affects: 'Close attack bonus, Base Parry'
  },
  {
    key: 'INT',
    name: 'Intellect',
    desc: 'Reasoning, logic, memory, technical aptitude, and general education.',
    affects: 'Expertise, Technology, Investigation, Treatment'
  },
  {
    key: 'AWE',
    name: 'Awareness',
    desc: 'Intuition, sensory perception, common sense, and mental resolve.',
    affects: 'Base Will, Perception, Insight'
  },
  {
    key: 'PRE',
    name: 'Presence',
    desc: 'Charisma, leadership, force of personality, and social influence.',
    affects: 'Deception, Intimidation, Persuasion'
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
  gap: 0.15rem;
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
</style>

