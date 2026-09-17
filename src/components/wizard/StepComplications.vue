<template>
  <div class="step-complications-container">
    <!-- STEP BANNER -->
    <div class="step-banner">
      <div class="step-banner-icon"><i class="ri-compass-3-line"></i></div>
      <div>
        <h3 class="step-title">Motivations & Complications</h3>
        <p class="step-subtitle">
          Define core motivations and dramatic complications. In M&M 3e, facing personal obstacles or vulnerabilities earns players valuable <strong>Hero Points</strong> during gameplay.
        </p>
      </div>
    </div>

    <!-- MOTIVATION PRESETS CHIPS -->
    <div class="card mb-4" style="padding: 1.25rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
        <div>
          <h4 class="section-title" style="margin-bottom: 0.2rem;">Core Heroic Motivation</h4>
          <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 0;">
            Select the primary conviction that drives your hero into danger:
          </p>
        </div>
        <button
          type="button"
          class="btn btn-xs btn-add-motivation"
          @click="openAddDialog('motivation')"
          title="Add a custom or detailed heroic motivation"
        >
          <i class="ri-compass-3-line"></i> + Add Motivation
        </button>
      </div>

      <div class="motivation-chips-group">
        <button
          v-for="mot in motivationOptions"
          :key="mot"
          type="button"
          class="badge-chip"
          :class="{ active: isMotivationActive(mot) }"
          @click="toggleMotivation(mot)"
        >
          {{ mot }}
        </button>
      </div>
    </div>

    <!-- COMPLICATIONS & MOTIVATIONS ACTIVE LIST -->
    <div class="card mb-4" style="padding: 1.25rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
        <div>
          <h4 class="section-title" style="margin-bottom: 0.2rem;">
            Active Motivations & Complications
          </h4>
          <p style="font-size: 0.78rem; color: var(--text-secondary); margin: 0;">
            Heroes require at least 2 narrative traits (1 Motivation + 1 other complication).
            <span class="tabular-nums" :style="{ color: isComplicationsCountValid ? '#10b981' : '#f59e0b', fontWeight: '700', marginLeft: '0.35rem' }">
              Current: {{ (heroStore.character.complications || []).length }} defined
            </span>
          </p>
        </div>

        <!-- TWO DEDICATED ACTION BUTTONS -->
        <div class="actions-button-cluster">
          <button
            type="button"
            class="btn btn-xs btn-add-motivation"
            @click="openAddDialog('motivation')"
          >
            <i class="ri-compass-3-line"></i> + Add Motivation
          </button>
          <button
            type="button"
            class="btn btn-xs btn-add-complication"
            @click="openAddDialog('complication')"
          >
            <i class="ri-alert-line"></i> + Add Complication
          </button>
        </div>
      </div>

      <div v-if="!heroStore.character.complications || heroStore.character.complications.length === 0" class="empty-comp-box">
        <i class="ri-shield-user-line" style="font-size: 2.2rem; color: var(--text-muted); display: block; margin-bottom: 0.5rem;"></i>
        No motivations or complications added yet. Every hero needs at least 1 Motivation and 1 dramatic Complication.
        <div style="margin-top: 1rem; display: flex; justify-content: center; gap: 0.75rem;">
          <button type="button" class="btn btn-sm btn-add-motivation" @click="openAddDialog('motivation')">
            <i class="ri-compass-3-line"></i> Add Motivation
          </button>
          <button type="button" class="btn btn-sm btn-add-complication" @click="openAddDialog('complication')">
            <i class="ri-alert-line"></i> Add Complication
          </button>
        </div>
      </div>

      <div v-else class="complications-list">
        <div
          v-for="(comp, idx) in heroStore.character.complications"
          :key="comp.id || idx"
          class="card comp-item"
          :class="isItemMotivation(comp) ? 'item-motivation' : 'item-complication'"
        >
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.75rem;">
            <div style="flex: 1; min-width: 0;">
              <!-- Header Badges -->
              <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.35rem; flex-wrap: wrap;">
                <span
                  class="badge-pill"
                  :class="isItemMotivation(comp) ? 'pill-motivation' : 'pill-complication'"
                >
                  <i :class="isItemMotivation(comp) ? 'ri-compass-3-fill' : getComplicationIcon(comp.type)"></i>
                  {{ (comp.type || 'COMPLICATION').toUpperCase() }}
                </span>

                <span v-if="!isItemMotivation(comp)" class="hp-reward-tag" title="Awards +1 Hero Point when GM triggers this complication">
                  <i class="ri-copper-diamond-line"></i> +1 Hero Point
                </span>
                <span v-else class="hp-reward-tag tag-drive" title="Primary moral driving force">
                  <i class="ri-heart-pulse-line"></i> Core Drive
                </span>
              </div>

              <!-- Name -->
              <div class="comp-title-text">
                {{ comp.name }}
              </div>

              <!-- Description -->
              <p v-if="comp.desc" class="comp-desc-text">
                {{ comp.desc }}
              </p>
            </div>

            <!-- Delete Button -->
            <button
              type="button"
              class="btn-icon btn-remove-comp text-danger"
              @click="heroStore.removeComplication(idx)"
              title="Remove this trait"
            >
              <i class="ri-delete-bin-line"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- NOTES & BACKSTORY -->
    <div class="card" style="padding: 1.25rem;">
      <h4 class="section-title"><i class="ri-file-text-line text-accent"></i> Character Notes & Backstory</h4>
      <textarea
        v-model="heroStore.character.notes"
        class="form-control"
        rows="4"
        placeholder="Write hero origin story, secret identity details, personality traits, and team affiliations..."
        style="resize: vertical; font-size: 0.82rem;"
      ></textarea>
    </div>

    <!-- DUAL-MODE ADD MOTIVATION & COMPLICATION MODAL -->
    <div v-if="showAddDialog" class="modal-overlay" @click.self="showAddDialog = false">
      <div
        class="modal-content narrative-modal-box"
        :class="modalMode === 'motivation' ? 'theme-motivation' : 'theme-complication'"
      >
        <!-- Modal Top Header -->
        <div class="narrative-modal-header">
          <div class="header-title-cluster">
            <div class="header-icon-badge">
              <i :class="modalMode === 'motivation' ? 'ri-compass-3-fill' : 'ri-alert-fill'"></i>
            </div>
            <div>
              <h4 class="narrative-modal-title">
                {{ modalMode === 'motivation' ? 'Add Heroic Motivation' : 'Add Dramatic Complication' }}
              </h4>
              <p class="narrative-modal-subtitle">
                {{ modalMode === 'motivation'
                  ? 'Define the core conviction or noble calling that drives your hero into danger.'
                  : 'Define dramatic obstacles, personal flaws, or recurring foes that award Hero Points.'
                }}
              </p>
            </div>
          </div>
          <button
            type="button"
            class="modal-close-btn"
            @click="showAddDialog = false"
            aria-label="Close dialog"
          >
            <i class="ri-close-line"></i>
          </button>
        </div>

        <!-- TOP SEGMENTED SWITCHER (Choose What to Add) -->
        <div class="narrative-segmented-nav">
          <button
            type="button"
            class="segmented-btn"
            :class="{ active: modalMode === 'motivation', 'btn-tab-motivation': true }"
            @click="switchModalMode('motivation')"
          >
            <i class="ri-compass-3-line"></i>
            <span class="segmented-label">Heroic Motivation</span>
            <span class="segmented-pill">Core Drive</span>
          </button>
          <button
            type="button"
            class="segmented-btn"
            :class="{ active: modalMode === 'complication', 'btn-tab-complication': true }"
            @click="switchModalMode('complication')"
          >
            <i class="ri-alert-line"></i>
            <span class="segmented-label">Dramatic Complication</span>
            <span class="segmented-pill">+1 Hero Point</span>
          </button>
        </div>

        <!-- BODY: MOTIVATION MODE -->
        <div v-if="modalMode === 'motivation'" class="narrative-mode-body">
          <!-- Presets Quick-Pick Section -->
          <div class="presets-section mb-3">
            <div class="presets-label">
              <i class="ri-sparkling-fill" style="color: #fbbf24;"></i>
              <span>Official M&M 3e Motivations (Click to pre-fill):</span>
            </div>
            <div class="presets-chips-grid">
              <button
                v-for="preset in MOTIVATIONS_CATALOG"
                :key="preset.id"
                type="button"
                class="preset-chip chip-motivation"
                :class="{ active: selectedPresetId === preset.id }"
                @click="selectMotivationPreset(preset)"
              >
                <i :class="preset.icon || 'ri-flag-line'"></i>
                <span>{{ preset.name }}</span>
              </button>
            </div>
          </div>

          <!-- Title Input -->
          <div class="form-group mb-3">
            <label class="form-label">
              Motivation Title / Conviction <span class="required-star">*</span>
            </label>
            <input
              v-model="newCompName"
              type="text"
              class="form-control input-narrative"
              placeholder="e.g. Motivation: Justice, Doing Good, Protecting Family..."
            />
          </div>

          <!-- Description Textarea -->
          <div class="form-group mb-3">
            <label class="form-label">Moral Creed & Narrative Drive</label>
            <textarea
              v-model="newCompDesc"
              class="form-control input-narrative"
              rows="3"
              placeholder="Describe what drives your hero to risk everything and make sacrifices for others..."
            ></textarea>
          </div>

          <!-- Rule Callout -->
          <div class="narrative-rule-callout callout-motivation">
            <i class="ri-information-line"></i>
            <div>
              <strong>M&M 3E Hero Requirement:</strong> Every superhero starts with at least <strong>1 Motivation</strong> to establish why they answer the call of heroism.
            </div>
          </div>
        </div>

        <!-- BODY: COMPLICATION MODE -->
        <div v-else class="narrative-mode-body">
          <!-- Presets Quick-Pick Section -->
          <div class="presets-section mb-3">
            <div class="presets-label">
              <i class="ri-fire-fill" style="color: #fb7185;"></i>
              <span>Common Complications Catalog (Click to pre-fill):</span>
            </div>
            <div class="presets-chips-grid">
              <button
                v-for="preset in popularComplicationPresets"
                :key="preset.id"
                type="button"
                class="preset-chip chip-complication"
                :class="{ active: selectedPresetId === preset.id }"
                @click="selectComplicationPreset(preset)"
              >
                <i :class="preset.icon || 'ri-alert-line'"></i>
                <span>{{ preset.name }}</span>
              </button>
            </div>
          </div>

          <!-- Category and Title Row -->
          <div class="row-two-col mb-3">
            <div class="form-group">
              <label class="form-label">Category</label>
              <select
                v-model="selectedCompCategory"
                class="form-control select-narrative"
                @change="handleCategoryChange"
              >
                <option v-for="cat in complicationCategories" :key="cat" :value="cat">
                  {{ cat }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">
                Specific Title / Descriptor <span class="required-star">*</span>
              </label>
              <input
                v-model="newCompName"
                type="text"
                class="form-control input-narrative"
                placeholder="e.g. Arch-Nemesis: Doctor Oblivion"
              />
            </div>
          </div>

          <!-- Description Textarea -->
          <div class="form-group mb-3">
            <label class="form-label">Description & Narrative Impact</label>
            <textarea
              v-model="newCompDesc"
              class="form-control input-narrative"
              rows="3"
              placeholder="How this complication creates dramatic obstacles or challenges for the GM to award Hero Points..."
            ></textarea>
          </div>

          <!-- Rule Callout -->
          <div class="narrative-rule-callout callout-complication">
            <i class="ri-copper-diamond-line"></i>
            <div>
              <strong>Hero Points Award:</strong> When this complication actively hinders your hero or complicates a scene, the GM awards you <strong>+1 Hero Point</strong>!
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="narrative-modal-footer">
          <button type="button" class="btn btn-secondary btn-sm" @click="showAddDialog = false">
            Cancel
          </button>
          <button
            type="button"
            class="btn btn-sm btn-narrative-submit"
            :class="modalMode === 'motivation' ? 'btn-submit-motivation' : 'btn-submit-complication'"
            :disabled="!newCompName.trim()"
            @click="confirmAddComp"
          >
            <i :class="modalMode === 'motivation' ? 'ri-compass-3-fill' : 'ri-alert-fill'"></i>
            {{ modalMode === 'motivation' ? 'Add Motivation' : 'Add Complication' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useHeroStore } from '../../stores/heroStore.js';
import {
  MOTIVATIONS_CATALOG,
  COMPLICATIONS_CATALOG,
  findComplicationPreset
} from '../../rules/complications.js';

const heroStore = useHeroStore();

const showAddDialog = ref(false);
const modalMode = ref('motivation'); // 'motivation' | 'complication'
const selectedPresetId = ref('');
const selectedCompCategory = ref('Enemy');
const newCompType = ref('Motivation');
const newCompName = ref('');
const newCompDesc = ref('');

const motivationOptions = [
  'Justice', 'Responsibility', 'Doing Good', 'Thrills',
  'Acceptance', 'Patriotism', 'Recognition', 'Greed', 'Revenge'
];

const complicationCategories = [
  'Enemy', 'Secret Identity', 'Weakness', 'Power Loss', 'Relationship',
  'Responsibility', 'Phobia', 'Accident', 'Addiction', 'Disability',
  'Fame', 'Flashbacks', 'Hatred', 'Honor', 'Obsession', 'Prejudice',
  'Reputation', 'Rivalry', 'Secret', 'Temper', 'Quirk', 'Other'
];

const popularComplicationPresets = computed(() => {
  return COMPLICATIONS_CATALOG.slice(0, 14);
});

const isComplicationsCountValid = computed(() => {
  return (heroStore.character.complications || []).length >= 2;
});

function isItemMotivation(comp) {
  if (!comp) return false;
  return (comp.type || '').toLowerCase() === 'motivation' || (comp.name || '').toLowerCase().startsWith('motivation:');
}

function getComplicationIcon(type) {
  const preset = findComplicationPreset(type);
  if (preset && preset.icon) return preset.icon;
  switch ((type || '').toLowerCase()) {
    case 'enemy': return 'ri-skull-line';
    case 'secret identity': return 'ri-spy-line';
    case 'weakness': return 'ri-radioactive-line';
    case 'power loss': return 'ri-battery-low-line';
    case 'relationship': return 'ri-parent-line';
    case 'responsibility': return 'ri-briefcase-line';
    case 'phobia': return 'ri-ghost-line';
    case 'accident': return 'ri-alarm-warning-line';
    case 'addiction': return 'ri-capsule-line';
    case 'disability': return 'ri-wheelchair-line';
    case 'honor': return 'ri-shield-star-line';
    case 'temper': return 'ri-temp-hot-line';
    case 'fame': return 'ri-camera-lens-line';
    case 'prejudice': return 'ri-group-line';
    default: return 'ri-alert-line';
  }
}

function isMotivationActive(mot) {
  return (heroStore.character.complications || []).some(
    c => c.type === 'Motivation' && c.name.toLowerCase().includes(mot.toLowerCase())
  );
}

function toggleMotivation(mot) {
  const comps = heroStore.character.complications || [];
  const existingIdx = comps.findIndex(
    c => c.type === 'Motivation' && c.name.toLowerCase().includes(mot.toLowerCase())
  );

  if (existingIdx !== -1) {
    heroStore.removeComplication(existingIdx);
  } else {
    heroStore.addComplication('Motivation', `Motivation: ${mot}`, `Inner conviction driving the hero to champion ${mot.toLowerCase()}.`);
  }
}

function openAddDialog(mode = 'motivation') {
  modalMode.value = mode;
  selectedPresetId.value = '';
  if (mode === 'motivation') {
    newCompType.value = 'Motivation';
    newCompName.value = '';
    newCompDesc.value = '';
  } else {
    selectedCompCategory.value = 'Enemy';
    newCompType.value = 'Enemy';
    newCompName.value = '';
    newCompDesc.value = '';
  }
  showAddDialog.value = true;
}

function switchModalMode(mode) {
  modalMode.value = mode;
  selectedPresetId.value = '';
  if (mode === 'motivation') {
    newCompType.value = 'Motivation';
    newCompName.value = '';
    newCompDesc.value = '';
  } else {
    selectedCompCategory.value = 'Enemy';
    newCompType.value = 'Enemy';
    newCompName.value = '';
    newCompDesc.value = '';
  }
}

function selectMotivationPreset(preset) {
  selectedPresetId.value = preset.id;
  newCompType.value = 'Motivation';
  newCompName.value = preset.id === 'custom_motivation' ? '' : `Motivation: ${preset.name}`;
  newCompDesc.value = preset.defaultDesc || '';
}

function selectComplicationPreset(preset) {
  selectedPresetId.value = preset.id;
  selectedCompCategory.value = preset.name;
  newCompType.value = preset.name;
  newCompName.value = preset.id === 'custom_complication' ? '' : preset.name;
  newCompDesc.value = preset.defaultDesc || '';
}

function handleCategoryChange() {
  const preset = COMPLICATIONS_CATALOG.find(c => c.name.toLowerCase() === selectedCompCategory.value.toLowerCase());
  if (preset) {
    selectedPresetId.value = preset.id;
    newCompType.value = preset.name;
    if (!newCompName.value || complicationCategories.includes(newCompName.value)) {
      newCompName.value = preset.id === 'custom_complication' ? '' : preset.name;
    }
    if (!newCompDesc.value || COMPLICATIONS_CATALOG.some(c => c.defaultDesc === newCompDesc.value)) {
      newCompDesc.value = preset.defaultDesc || '';
    }
  } else {
    selectedPresetId.value = '';
    newCompType.value = selectedCompCategory.value;
  }
}

function confirmAddComp() {
  if (!newCompName.value.trim()) return;
  const type = modalMode.value === 'motivation' ? 'Motivation' : (newCompType.value || selectedCompCategory.value || 'Complication');
  heroStore.addComplication(type, newCompName.value.trim(), newCompDesc.value.trim());
  newCompName.value = '';
  newCompDesc.value = '';
  selectedPresetId.value = '';
  showAddDialog.value = false;
}
</script>

<style scoped>
.step-complications-container {
  width: 100%;
}

.step-banner {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin-bottom: 1.25rem;
  padding: 1rem 1.25rem;
  background: rgba(249, 115, 22, 0.08);
  border: 1px solid rgba(249, 115, 22, 0.25);
  border-radius: var(--radius-md);
}

.step-banner-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  background: rgba(249, 115, 22, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  color: #fb923c;
}

.step-title {
  font-size: 1.2rem;
  font-weight: 800;
  color: #fff;
  margin: 0;
  letter-spacing: -0.01em;
}

.step-subtitle {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin: 0.25rem 0 0;
  line-height: 1.5;
}

.section-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-bottom: 0.85rem;
}

.form-label {
  display: block;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
  margin-bottom: 0.35rem;
}

.required-star {
  color: #ef4444;
}

/* Actions Button Cluster */
.actions-button-cluster {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-add-motivation {
  background: rgba(168, 85, 247, 0.15);
  border: 1px solid rgba(168, 85, 247, 0.4);
  color: #d8b4fe;
  font-weight: 700;
  border-radius: var(--radius-sm);
  padding: 0.35rem 0.75rem;
  transition: all 0.2s ease;
}

.btn-add-motivation:hover {
  background: rgba(168, 85, 247, 0.3);
  border-color: #a855f7;
  color: #fff;
  transform: translateY(-1px);
}

.btn-add-complication {
  background: rgba(244, 63, 94, 0.15);
  border: 1px solid rgba(244, 63, 94, 0.4);
  color: #fda4af;
  font-weight: 700;
  border-radius: var(--radius-sm);
  padding: 0.35rem 0.75rem;
  transition: all 0.2s ease;
}

.btn-add-complication:hover {
  background: rgba(244, 63, 94, 0.3);
  border-color: #f43f5e;
  color: #fff;
  transform: translateY(-1px);
}

/* Motivation Presets Chips */
.motivation-chips-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
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
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, transform 0.15s ease;
}

.badge-chip:hover {
  background: var(--bg-card-hover);
  color: #fff;
}

.badge-chip:active {
  transform: scale(0.96);
}

.badge-chip.active {
  background: rgba(168, 85, 247, 0.2);
  border-color: #a855f7;
  color: #d8b4fe;
  font-weight: 700;
}

/* Complications List & Cards */
.empty-comp-box {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
  font-size: 0.82rem;
}

.complications-list {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.comp-item {
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-sm);
  padding: 0.9rem 1.1rem;
  transition: border-color 0.2s ease, transform 0.15s ease;
}

.comp-item:hover {
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.comp-item.item-motivation {
  border-left: 3.5px solid #a855f7;
}

.comp-item.item-complication {
  border-left: 3.5px solid #f43f5e;
}

.badge-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.55rem;
  border-radius: var(--radius-xs);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.03em;
}

.pill-motivation {
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.35);
  color: #fbbf24;
}

.pill-complication {
  background: rgba(244, 63, 94, 0.18);
  border: 1px solid rgba(244, 63, 94, 0.4);
  color: #fda4af;
}

.hp-reward-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.68rem;
  font-weight: 700;
  color: #fbbf24;
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.3);
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
}

.hp-reward-tag.tag-drive {
  color: #a7f3d0;
  background: rgba(16, 185, 129, 0.12);
  border-color: rgba(16, 185, 129, 0.3);
}

.comp-title-text {
  font-weight: 800;
  color: #fff;
  font-size: 0.95rem;
  line-height: 1.35;
}

.comp-desc-text {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin: 0.3rem 0 0;
  line-height: 1.5;
}

.btn-remove-comp {
  opacity: 0.6;
  transition: opacity 0.2s ease, transform 0.15s ease;
}

.btn-remove-comp:hover {
  opacity: 1;
  transform: scale(1.1);
}

/* =========================================================
   DUAL-MODE SEGMENTED NARRATIVE MODAL STYLING
   ========================================================= */
.narrative-modal-box {
  max-width: 540px;
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.85);
  padding: 1.4rem;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.narrative-modal-box.theme-motivation {
  border-color: rgba(168, 85, 247, 0.45);
  box-shadow: 0 25px 60px -15px rgba(124, 58, 237, 0.25);
}

.narrative-modal-box.theme-complication {
  border-color: rgba(244, 63, 94, 0.45);
  box-shadow: 0 25px 60px -15px rgba(225, 29, 72, 0.25);
}

.narrative-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 1.15rem;
}

.header-title-cluster {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-icon-badge {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.theme-motivation .header-icon-badge {
  background: rgba(245, 158, 11, 0.18);
  color: #fbbf24;
}

.theme-complication .header-icon-badge {
  background: rgba(244, 63, 94, 0.2);
  color: #fb7185;
}

.narrative-modal-title {
  font-weight: 800;
  color: #fff;
  margin: 0;
  font-size: 1.15rem;
  letter-spacing: -0.01em;
}

.narrative-modal-subtitle {
  font-size: 0.76rem;
  color: var(--text-secondary);
  margin: 0.2rem 0 0;
  line-height: 1.4;
}

.modal-close-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 1.3rem;
  cursor: pointer;
  padding: 0.2rem;
  border-radius: 6px;
  line-height: 1;
  transition: color 0.2s ease;
}

.modal-close-btn:hover {
  color: #fff;
}

/* TOP SEGMENTED NAV CONTROL */
.narrative-segmented-nav {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.35rem;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 0.3rem;
  margin-bottom: 1.25rem;
}

.segmented-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  padding: 0.65rem 0.5rem;
  border-radius: 8px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.segmented-btn i {
  font-size: 1.15rem;
}

.segmented-btn .segmented-label {
  font-size: 0.82rem;
  font-weight: 700;
}

.segmented-btn .segmented-pill {
  font-size: 0.66rem;
  font-weight: 600;
  opacity: 0.7;
}

.segmented-btn:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.04);
}

.segmented-btn.active.btn-tab-motivation {
  background: rgba(245, 158, 11, 0.16);
  border-color: rgba(245, 158, 11, 0.45);
  color: #fef3c7;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.segmented-btn.active.btn-tab-motivation .segmented-pill {
  color: #fbbf24;
  opacity: 1;
}

.segmented-btn.active.btn-tab-complication {
  background: rgba(244, 63, 94, 0.18);
  border-color: rgba(244, 63, 94, 0.5);
  color: #ffe4e6;
  box-shadow: 0 4px 12px rgba(225, 29, 72, 0.2);
}

.segmented-btn.active.btn-tab-complication .segmented-pill {
  color: #fb7185;
  opacity: 1;
}

/* Presets Chips Grid */
.presets-section {
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 0.75rem;
}

.presets-label {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.74rem;
  font-weight: 700;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.presets-chips-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  max-height: 110px;
  overflow-y: auto;
  padding-right: 0.25rem;
}

.presets-chips-grid::-webkit-scrollbar {
  width: 4px;
}

.presets-chips-grid::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.preset-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.25rem 0.55rem;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(15, 23, 42, 0.8);
  color: var(--text-secondary);
  font-size: 0.74rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.preset-chip:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.preset-chip.chip-motivation.active {
  background: rgba(168, 85, 247, 0.25);
  border-color: #a855f7;
  color: #f3e8ff;
  font-weight: 700;
}

.preset-chip.chip-complication.active {
  background: rgba(244, 63, 94, 0.25);
  border-color: #f43f5e;
  color: #ffe4e6;
  font-weight: 700;
}

/* Two-column Row */
.row-two-col {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 0.75rem;
}

@media (max-width: 480px) {
  .row-two-col {
    grid-template-columns: 1fr;
  }
}

.input-narrative,
.select-narrative {
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  color: #fff;
  font-size: 0.82rem;
  padding: 0.5rem 0.65rem;
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.theme-motivation .input-narrative:focus,
.theme-motivation .select-narrative:focus {
  outline: none;
  border-color: #a855f7;
  box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.25);
}

.theme-complication .input-narrative:focus,
.theme-complication .select-narrative:focus {
  outline: none;
  border-color: #f43f5e;
  box-shadow: 0 0 0 2px rgba(244, 63, 94, 0.25);
}

/* Narrative Rule Callout */
.narrative-rule-callout {
  display: flex;
  align-items: flex-start;
  gap: 0.55rem;
  padding: 0.65rem 0.85rem;
  border-radius: 8px;
  font-size: 0.75rem;
  line-height: 1.45;
}

.callout-motivation {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.25);
  color: #fde68a;
}

.callout-motivation i {
  color: #fbbf24;
  font-size: 1rem;
  margin-top: 1px;
}

.callout-complication {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.25);
  color: #fcd34d;
}

.callout-complication i {
  color: #fbbf24;
  font-size: 1rem;
  margin-top: 1px;
}

/* Modal Footer */
.narrative-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  margin-top: 1.25rem;
  padding-top: 0.85rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.btn-narrative-submit {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 1rem;
  font-weight: 700;
  border-radius: 6px;
  color: #fff;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-submit-motivation {
  background: linear-gradient(135deg, #7c3aed, #9333ea);
  box-shadow: 0 4px 14px rgba(124, 58, 237, 0.35);
}

.btn-submit-motivation:hover:not(:disabled) {
  background: linear-gradient(135deg, #6d28d9, #7e22ce);
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(124, 58, 237, 0.45);
}

.btn-submit-complication {
  background: linear-gradient(135deg, #e11d48, #be123c);
  box-shadow: 0 4px 14px rgba(225, 29, 72, 0.35);
}

.btn-submit-complication:hover:not(:disabled) {
  background: linear-gradient(135deg, #be123c, #9f1239);
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(225, 29, 72, 0.45);
}

.btn-narrative-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}
</style>
