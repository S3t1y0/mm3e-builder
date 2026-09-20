<template>
  <div class="step-concept-container">
    <div class="step-banner">
      <div class="step-banner-icon"><i class="ri-user-star-line"></i></div>
      <div>
        <h3 class="step-title">Hero Concept</h3>
        <p class="step-subtitle">Define hero identity, Power Level, and power origins.</p>
      </div>
    </div>

    <!-- IDENTITY SECTION -->
    <div class="card mb-4" style="padding: 1.25rem;">
      <h4 class="section-title">Hero Identity</h4>
      <div class="grid-2-col" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem;">
        <div class="form-group">
          <label class="form-label">Hero / Codename</label>
          <input
            v-model="heroStore.character.name"
            type="text"
            class="form-control"
            placeholder="e.g. Aegis Valkyrie, Chronos, Iron Weaver"
          />
        </div>
        <div class="form-group">
          <label class="form-label">Real Name / Alter Ego</label>
          <input
            v-model="heroStore.character.identity"
            type="text"
            class="form-control"
            placeholder="e.g. Caleb Vance, Clark Kent"
          />
        </div>
        <div class="form-group">
          <label class="form-label">Player Name</label>
          <input
            v-model="heroStore.character.player"
            type="text"
            class="form-control"
            placeholder="e.g. Alex Mercer, Morgan Vance"
          />
        </div>
        <div class="form-group">
          <label class="form-label">Base of Operations</label>
          <input
            v-model="heroStore.character.baseOfOperations"
            type="text"
            class="form-control"
            placeholder="e.g. Freedom City, Orbit Station"
          />
        </div>
      </div>

      <!-- POWER LEVEL CONTROLLER -->
      <div style="margin-top: 1.25rem; padding-top: 1rem; border-top: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div>
          <div style="font-weight: 700; color: #fff; font-size: 0.9rem;">Power Level (PL) & Budget</div>
          <div style="font-size: 0.78rem; color: var(--text-secondary);">Standard M&M 3e campaign baseline is PL 10 (150 PP). Each PL grants 15 Power Points.</div>
        </div>
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <div class="btn-group">
            <button
              v-for="plPreset in [8, 10, 12, 14]"
              :key="plPreset"
              class="btn btn-xs"
              :class="heroStore.character.powerLevel === plPreset ? 'btn-primary' : 'btn-secondary'"
              @click="setPL(plPreset)"
            >
              PL {{ plPreset }}
            </button>
          </div>
          <div style="display: flex; align-items: center; gap: 0.35rem; background: var(--bg-card); padding: 0.25rem 0.5rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
            <button class="btn btn-xs btn-secondary" :disabled="heroStore.character.powerLevel <= 1" @click="setPL(heroStore.character.powerLevel - 1)">-</button>
            <span class="tabular-nums" style="font-weight: 800; font-size: 0.88rem; min-width: 44px; text-align: center; color: var(--accent-primary);">PL {{ heroStore.character.powerLevel }}</span>
            <button class="btn btn-xs btn-secondary" :disabled="heroStore.character.powerLevel >= 20" @click="setPL(heroStore.character.powerLevel + 1)">+</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ORIGIN TAGS -->
    <div class="card mb-4" style="padding: 1.25rem;">
      <h4 class="section-title">Origin Descriptors</h4>
      <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.75rem;">
        Select one or more power sources to establish character descriptors and narrative counter-measures.
      </p>
      <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
        <button
          v-for="origin in origins"
          :key="origin"
          class="badge-chip"
          :class="{ active: isOriginSelected(origin) }"
          @click="toggleOrigin(origin)"
        >
          {{ origin }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useHeroStore } from '../../stores/heroStore.js';
import { useUiStore } from '../../stores/uiStore.js';

const heroStore = useHeroStore();
const uiStore = useUiStore();

const origins = [
  'Mutant', 'High-Tech', 'Magic', 'Alien', 'Experiment',
  'Training', 'Divine', 'Cosmic', 'Psionic', 'Accident'
];

function setPL(pl) {
  heroStore.character.powerLevel = Math.max(1, Math.min(20, pl));
  heroStore.pushHistory();
}

function isOriginSelected(origin) {
  return (heroStore.character.notes || '').includes(origin);
}

function toggleOrigin(origin) {
  let notes = heroStore.character.notes || '';
  if (notes.includes(origin)) {
    notes = notes.replace(origin, '').replace(/,\s*,/g, ',').replace(/^,\s*|,\s*$/g, '').trim();
  } else {
    notes = notes ? `${notes}, ${origin}` : origin;
  }
  heroStore.character.notes = notes;
  heroStore.pushHistory();
}
</script>

<style scoped>
.step-banner {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin-bottom: 1.25rem;
  padding: 1rem 1.25rem;
  background: rgba(59, 130, 246, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.25);
  border-radius: var(--radius-md);
}

.step-banner-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  background: rgba(59, 130, 246, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  color: #60a5fa;
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

.section-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-bottom: 0.85rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge-chip {
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-secondary);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition-property: background-color, border-color, color, transform;
  transition-duration: 0.2s;
}

.badge-chip:hover {
  background: var(--bg-card-hover);
  color: #fff;
}

.badge-chip.active {
  background: rgba(59, 130, 246, 0.2);
  border-color: #3b82f6;
  color: #60a5fa;
  font-weight: 700;
}
</style>
