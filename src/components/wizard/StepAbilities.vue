<template>
  <div class="step-abilities-container">
    <div class="step-banner">
      <div class="step-banner-icon"><i class="ri-heart-pulse-line"></i></div>
      <div>
        <h3 class="step-title">Core Abilities</h3>
        <p class="step-subtitle">Allocate hero physical and mental attributes. Cost: <strong>2 PP per Rank</strong>. Normal human average is 0.</p>
      </div>
    </div>

    <!-- PP SUMMARY STRIP -->
    <div class="card mb-3" style="padding: 0.85rem 1.25rem; display: flex; justify-content: space-between; align-items: center; background: rgba(59, 130, 246, 0.05); border-color: rgba(59, 130, 246, 0.25);">
      <div style="font-size: 0.85rem; color: #fff; font-weight: 700;">
        Abilities Point Total: <span class="tabular-nums" style="color: var(--accent-primary); font-size: 1.05rem;">{{ heroStore.abilitiesCost }} PP</span>
      </div>
      <div style="font-size: 0.78rem; color: var(--text-secondary);">
        Remaining Character Budget: <strong class="tabular-nums" :style="{ color: heroStore.remainingPP < 0 ? '#ef4444' : '#10b981' }">{{ heroStore.remainingPP }} PP</strong>
      </div>
    </div>

    <!-- ABILITIES GRID -->
    <div class="abilities-grid">
      <div
        v-for="ability in abilitiesList"
        :key="ability.key"
        class="card ability-card"
        style="padding: 1rem;"
      >
        <div class="ability-card-top">
          <div>
            <div class="ability-short">{{ ability.key }}</div>
            <div class="ability-full">{{ ability.name }}</div>
          </div>
          <div class="ability-cost-tag tabular-nums">
            {{ (heroStore.character.abilities[ability.key] || 0) * 2 }} PP
          </div>
        </div>

        <p class="ability-desc">{{ ability.desc }}</p>

        <div class="ability-stepper-row">
          <button
            class="btn btn-secondary btn-sm stepper-btn"
            :disabled="(heroStore.character.abilities[ability.key] || 0) <= -5"
            @click="setAbilityRank(ability.key, (heroStore.character.abilities[ability.key] || 0) - 1)"
          >
            -
          </button>

          <div class="ability-rank-display">
            <span class="rank-value tabular-nums">{{ formatMod(heroStore.character.abilities[ability.key] || 0) }}</span>
          </div>

          <button
            class="btn btn-secondary btn-sm stepper-btn"
            :disabled="(heroStore.character.abilities[ability.key] || 0) >= 20"
            @click="setAbilityRank(ability.key, (heroStore.character.abilities[ability.key] || 0) + 1)"
          >
            +
          </button>
        </div>

        <!-- DERIVED BENEFIT HINT -->
        <div class="derived-hint">
          <i class="ri-corner-down-right-line"></i> {{ ability.affects }}
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

.abilities-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

@media (max-width: 1200px) {
  .abilities-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .abilities-grid {
    grid-template-columns: 1fr;
  }
}

.ability-card {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.ability-card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.ability-short {
  font-size: 1.25rem;
  font-weight: 900;
  color: #fff;
  letter-spacing: 0.05em;
}

.ability-full {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.ability-cost-tag {
  font-size: 0.7rem;
  font-weight: 800;
  color: #60a5fa;
  background: rgba(59, 130, 246, 0.15);
  padding: 0.15rem 0.45rem;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.ability-desc {
  font-size: 0.76rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 0.85rem;
  min-height: 42px;
}

.ability-stepper-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-card);
  padding: 0.35rem 0.5rem;
  border-radius: 8px;
  border: 1px solid var(--border-subtle);
  margin-bottom: 0.65rem;
}

.stepper-btn {
  width: 28px;
  height: 28px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  border-radius: 4px;
}

.ability-rank-display {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
}

.rank-value {
  font-size: 1.15rem;
  font-weight: 800;
  color: #fff;
}

.mod-value {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--text-secondary);
}

.derived-hint {
  font-size: 0.7rem;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
</style>
