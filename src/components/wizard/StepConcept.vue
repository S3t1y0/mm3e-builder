<template>
  <div class="step-concept-container">
    <div class="step-banner">
      <div class="step-banner-icon"><i class="ri-user-star-line"></i></div>
      <div>
        <h3 class="step-title">Hero Concept & Archetypes</h3>
        <p class="step-subtitle">Define hero identity, Power Level, power origins, or select a ready-to-play archetype preset.</p>
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

    <!-- ARCHETYPE TEMPLATES CATALOG -->
    <div class="card" style="padding: 1.25rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
        <div>
          <h4 class="section-title" style="margin-bottom: 0.2rem;">Standard Archetype Presets</h4>
          <p style="font-size: 0.78rem; color: var(--text-secondary); margin: 0;">
            Use official M&M 3e Hero's Handbook archetypes as instant templates with balanced point distributions.
          </p>
        </div>
      </div>

      <div class="archetype-grid">
        <div
          v-for="arch in ARCHETYPES"
          :key="arch.id"
          class="archetype-card"
        >
          <div class="archetype-header">
            <div class="archetype-icon">
              <i :class="arch.icon || 'ri-shield-flash-line'"></i>
            </div>
            <div>
              <div class="archetype-name">{{ arch.name }}</div>
              <div class="archetype-origin">{{ arch.origin }}</div>
            </div>
          </div>

          <p class="archetype-desc">{{ arch.tagline }}</p>

          <div class="archetype-budget">
            <span class="budget-pill tabular-nums">Abil: {{ arch.budgetGuidelines.abilities }} PP</span>
            <span class="budget-pill tabular-nums">Def: {{ arch.budgetGuidelines.defenses }} PP</span>
            <span class="budget-pill tabular-nums">Skills: {{ arch.budgetGuidelines.skills }} PP</span>
            <span class="budget-pill tabular-nums">Pow: {{ arch.budgetGuidelines.powers }} PP</span>
          </div>

          <button
            class="btn btn-secondary btn-sm"
            style="width: 100%; margin-top: 0.85rem; font-weight: 700;"
            @click="applyArchetype(arch)"
          >
            <i class="ri-file-download-line"></i> Apply {{ arch.name }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useHeroStore } from '../../stores/heroStore.js';
import { useUiStore } from '../../stores/uiStore.js';
import { ARCHETYPES } from '../../rules/archetypes.js';

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

function applyArchetype(arch) {
  const success = heroStore.applyArchetype(arch.id);
  if (success) {
    uiStore.showToast(`Applied ${arch.name} archetype template!`, 'success');
  }
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

.archetype-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.archetype-card {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition-property: border-color, background-color, transform, box-shadow;
  transition-duration: 0.2s;
}

.archetype-card:hover {
  border-color: rgba(59, 130, 246, 0.45);
  background: rgba(30, 41, 59, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 8px 16px -4px rgba(0, 0, 0, 0.4);
}

.archetype-header {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin-bottom: 0.5rem;
}

.archetype-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  background: rgba(220, 38, 38, 0.15);
  border: 1px solid rgba(220, 38, 38, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  color: var(--accent-primary);
}

.archetype-name {
  font-weight: 800;
  color: #fff;
  font-size: 0.95rem;
}

.archetype-origin {
  font-size: 0.72rem;
  color: var(--text-secondary);
}

.archetype-desc {
  font-size: 0.78rem;
  color: var(--text-secondary);
  line-height: 1.35;
  margin: 0.35rem 0 0.75rem;
  flex: 1;
}

.archetype-budget {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.budget-pill {
  font-size: 0.68rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0.2rem 0.45rem;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
}
</style>
