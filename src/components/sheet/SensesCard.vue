<template>
  <div class="dndb-card dndb-senses-card">
    <div class="dndb-card-header">
      <div class="dndb-card-title-wrap">
        <i class="ri-eye-2-line dndb-card-icon"></i>
        <h3 class="dndb-card-title">SENSES & PERCEPTION</h3>
      </div>
      <button 
        type="button" 
        class="sense-roll-btn" 
        @click="rollPerception" 
        title="Roll Active Perception Check"
      >
        <i class="ri-dice-line"></i> Roll Perception
      </button>
    </div>

    <div class="dndb-senses-content">
      <div class="dndb-sense-row" title="10 + Awareness + Perception Ranks">
        <span class="dndb-sense-val">{{ passivePerception }}</span>
        <div class="dndb-sense-info">
          <span class="dndb-sense-label">PASSIVE PERCEPTION</span>
          <span class="dndb-sense-formula">10 + AWE ({{ aweMod }}) + Skill ({{ percRanks }})</span>
        </div>
      </div>

      <div class="dndb-sense-list">
        <div class="dndb-sense-item">
          <i class="ri-check-line"></i>
          <span>Normal Vision & Hearing</span>
        </div>
        <div class="dndb-sense-item">
          <i class="ri-check-line"></i>
          <span>Olfactory & Tactile</span>
        </div>
        <div 
          v-for="(sense, idx) in specialSenses" 
          :key="idx" 
          class="dndb-sense-item special-sense"
        >
          <i class="ri-radar-line"></i>
          <span>{{ sense }}</span>
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

const aweMod = computed(() => {
  return Number(heroStore.effectiveAbilities?.AWE) || 0;
});

const percRanks = computed(() => {
  const skills = heroStore.character?.skills || [];
  const skill = skills.find(s => (s.name || '').toLowerCase() === 'perception');
  const baseRanks = skill ? (Number(skill.ranks ?? skill.rank) || 0) : 0;
  const enh = heroStore.activeEnhancedTraits?.skills?.perception || 0;
  return baseRanks + enh;
});

const passivePerception = computed(() => {
  return 10 + aweMod.value + percRanks.value;
});

const activePerceptionMod = computed(() => {
  return aweMod.value + percRanks.value;
});

const specialSenses = computed(() => {
  const list = [];
  for (const eff of heroStore.activeEffects) {
    const base = (eff.baseEffect || eff.effectType || eff.name || '').toLowerCase();
    if (base === 'senses') {
      const faculties = eff.config?.selectedFaculties || eff.config?.faculties || [];
      if (Array.isArray(faculties)) {
        faculties.forEach(f => {
          const name = typeof f === 'object' ? (f.name || f.id || f.label) : f;
          if (name && !list.includes(name)) list.push(name);
        });
      } else if (typeof faculties === 'string' && faculties) {
        list.push(faculties);
      }
    }
  }
  return list;
});

function rollPerception() {
  const mod = activePerceptionMod.value;
  heroStore.rollCheck('Perception Check', mod, null, 'Skill');
}
</script>

<style scoped>
.sense-roll-btn {
  background: rgba(56, 189, 248, 0.1);
  border: 1px solid rgba(56, 189, 248, 0.3);
  color: #38bdf8;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.2rem 0.55rem;
  border-radius: var(--radius-sm);
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  cursor: pointer;
  transition: all var(--trans-fast);
}

.sense-roll-btn:hover {
  background: rgba(56, 189, 248, 0.25);
  border-color: #38bdf8;
  color: #fff;
}

.dndb-sense-info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.dndb-sense-formula {
  font-size: 0.65rem;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}

.special-sense {
  color: #38bdf8 !important;
  font-weight: 600;
}

.special-sense i {
  color: #38bdf8 !important;
}
</style>
