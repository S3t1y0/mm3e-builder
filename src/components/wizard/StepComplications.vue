<template>
  <div class="step-complications-container">
    <!-- STEP BANNER -->
    <div class="step-banner">
      <div class="step-banner-icon"><i class="ri-compass-3-line"></i></div>
      <div>
        <h3 class="step-title">Motivations & Complications</h3>
        <p class="step-subtitle">
          Every hero needs at least one motivation and one complication. When they cause setbacks during play, you earn Hero Points.
        </p>
      </div>
    </div>

    <!-- RULES COMPLIANCE CHECKLIST BANNER -->
    <div class="card mb-4 rule-checklist-card">
      <div class="rule-checklist-header">
        <div class="checklist-title-group">
          <h4 class="section-title mb-0">
            <i class="ri-shield-star-line text-accent"></i>
            Narrative Requirements
          </h4>
          <span class="checklist-status-badge" :class="narrativeStatus.isValid ? 'status-pass' : 'status-pending'">
            <i :class="narrativeStatus.isValid ? 'ri-checkbox-circle-fill' : 'ri-alert-fill'"></i>
            {{ narrativeStatus.isValid ? 'Complete' : 'Incomplete' }}
          </span>
        </div>

        <div class="checklist-actions-cluster">
          <button
            type="button"
            class="btn btn-xs btn-add-motivation"
            @click="openAddDialog('motivation')"
          >
            <i class="ri-compass-3-line"></i> Add Motivation
          </button>
          <button
            type="button"
            class="btn btn-xs btn-add-complication"
            @click="openAddDialog('complication')"
          >
            <i class="ri-alert-line"></i> Add Complication
          </button>
        </div>
      </div>

      <!-- Two Pillars Status Row -->
      <div class="pillars-status-grid">
        <!-- Pillar 1: Motivation -->
        <div class="pillar-status-card" :class="narrativeStatus.hasMotivation ? 'pillar-valid' : 'pillar-warning'">
          <div class="pillar-icon-wrap icon-mot">
            <i :class="narrativeStatus.hasMotivation ? 'ri-checkbox-circle-line' : 'ri-compass-3-line'"></i>
          </div>
          <div class="pillar-info">
            <div class="pillar-label">1. MOTIVATION</div>
            <div class="pillar-val">
              <span v-if="narrativeStatus.hasMotivation" class="val-pass">
                {{ motivations.length }} added
              </span>
              <span v-else class="val-warn">
                0 added (requires 1)
              </span>
            </div>
            <p class="pillar-hint">
              Why your character acts as a hero (Justice, Responsibility, Doing Good, etc.).
            </p>
          </div>
        </div>

        <!-- Pillar 2: Other Complications -->
        <div class="pillar-status-card" :class="narrativeStatus.hasComplication ? 'pillar-valid' : 'pillar-warning'">
          <div class="pillar-icon-wrap icon-comp">
            <i :class="narrativeStatus.hasComplication ? 'ri-checkbox-circle-line' : 'ri-alert-line'"></i>
          </div>
          <div class="pillar-info">
            <div class="pillar-label">2. COMPLICATIONS</div>
            <div class="pillar-val">
              <span v-if="narrativeStatus.hasComplication" class="val-pass">
                {{ generalComplications.length }} added
              </span>
              <span v-else class="val-warn">
                0 added (requires 1)
              </span>
            </div>
            <p class="pillar-hint">
              Enemies, secrets, or weaknesses that cause problems during play.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 1. ACTIVE HEROIC MOTIVATIONS SECTION -->
    <div class="card mb-4 group-block mot-group-block">
      <div class="group-header">
        <div class="group-title">
          <i class="ri-compass-3-fill text-mot"></i>
          <span>Motivations</span>
          <span class="group-counter">{{ motivations.length }}</span>
        </div>
        <button
          type="button"
          class="btn btn-xs btn-add-motivation"
          @click="openAddDialog('motivation')"
        >
          <i class="ri-add-line"></i> Add Motivation
        </button>
      </div>

      <div v-if="motivations.length === 0" class="empty-pillar-box">
        <i class="ri-compass-3-line empty-icon-mot"></i>
        <p class="empty-text">
          No motivation added yet. Add the reason your character acts as a hero.
        </p>
        <button type="button" class="btn btn-sm btn-add-motivation" @click="openAddDialog('motivation')">
          <i class="ri-compass-3-line"></i> Add Motivation
        </button>
      </div>

      <div v-else class="complications-list">
        <div
          v-for="item in motivations"
          :key="item.id"
          class="card comp-item item-motivation"
        >
          <div class="comp-item-layout">
            <div class="comp-item-main">
              <div class="comp-header-row">
                <span class="badge-pill pill-motivation">
                  <i :class="getComplicationIcon(item)"></i>
                  MOTIVATION
                </span>
                <span class="comp-title-text">{{ item.name }}</span>
              </div>
              <p v-if="item.desc" class="comp-desc-text quote-mot">
                {{ item.desc }}
              </p>
            </div>

            <div class="comp-card-actions">
              <button
                type="button"
                class="comp-action-btn btn-edit-comp"
                @click="openEditDialog(item)"
                title="Edit motivation"
                aria-label="Edit motivation"
              >
                <i class="ri-edit-line"></i>
              </button>
              <button
                type="button"
                class="comp-action-btn btn-remove-comp"
                @click="removeTrait(item)"
                title="Remove motivation"
                aria-label="Remove motivation"
              >
                <i class="ri-delete-bin-line"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. ACTIVE COMPLICATIONS SECTION -->
    <div class="card mb-4 group-block comp-group-block">
      <div class="group-header">
        <div class="group-title">
          <i class="ri-alert-fill text-comp"></i>
          <span>Complications</span>
          <span class="group-counter">{{ generalComplications.length }}</span>
        </div>
        <button
          type="button"
          class="btn btn-xs btn-add-complication"
          @click="openAddDialog('complication')"
        >
          <i class="ri-add-line"></i> Add Complication
        </button>
      </div>

      <div v-if="generalComplications.length === 0" class="empty-pillar-box">
        <i class="ri-alert-line empty-icon-comp"></i>
        <p class="empty-text">
          No complications added yet. Add enemies, secrets, or weaknesses that cause problems in play.
        </p>
        <button type="button" class="btn btn-sm btn-add-complication" @click="openAddDialog('complication')">
          <i class="ri-add-line"></i> Add Complication
        </button>
      </div>

      <div v-else class="complications-list">
        <div
          v-for="item in generalComplications"
          :key="item.id"
          class="card comp-item item-complication"
        >
          <div class="comp-item-layout">
            <div class="comp-item-main">
              <div class="comp-header-row">
                <span class="badge-pill pill-complication">
                  <i :class="getComplicationIcon(item)"></i>
                  {{ (item.type || 'COMPLICATION').toUpperCase() }}
                </span>
                <span class="comp-title-text">{{ item.name }}</span>
              </div>
              <p v-if="item.desc" class="comp-desc-text quote-comp">
                {{ item.desc }}
              </p>
            </div>

            <div class="comp-card-actions">
              <button
                type="button"
                class="comp-action-btn btn-edit-comp"
                @click="openEditDialog(item)"
                title="Edit complication"
                aria-label="Edit complication"
              >
                <i class="ri-edit-line"></i>
              </button>
              <button
                type="button"
                class="comp-action-btn btn-remove-comp"
                @click="removeTrait(item)"
                title="Remove complication"
                aria-label="Remove complication"
              >
                <i class="ri-delete-bin-line"></i>
              </button>
            </div>
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
        placeholder="Origin story, identity details, personality traits, and team affiliations..."
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
              <h4 class="modal-title">
                {{ editingId ? 'Edit ' : 'Add ' }}
                {{ modalMode === 'motivation' ? 'Motivation' : 'Complication' }}
              </h4>
              <p class="modal-subtitle">
                {{ modalMode === 'motivation'
                  ? 'The reason this character fights or acts as a hero.'
                  : 'An obstacle or weakness that creates setbacks during play.' }}
              </p>
            </div>
          </div>
          <button type="button" class="btn-close-modal" @click="showAddDialog = false" aria-label="Close dialog">
            <i class="ri-close-line"></i>
          </button>
        </div>

        <!-- Segmented Mode Switcher (only when adding new) -->
        <div v-if="!editingId" class="segmented-mode-bar">
          <button
            type="button"
            class="segmented-tab-btn"
            :class="{ active: modalMode === 'motivation', 'btn-tab-motivation': true }"
            @click="switchModalMode('motivation')"
          >
            <i class="ri-compass-3-line"></i>
            <span class="segmented-label">Motivation</span>
          </button>
          <button
            type="button"
            class="segmented-tab-btn"
            :class="{ active: modalMode === 'complication', 'btn-tab-complication': true }"
            @click="switchModalMode('complication')"
          >
            <i class="ri-alert-line"></i>
            <span class="segmented-label">Complication</span>
          </button>
        </div>

        <!-- BODY: MOTIVATION MODE -->
        <div v-if="modalMode === 'motivation'" class="narrative-mode-body">
          <div class="catalog-recommendation-banner">
            <div class="catalog-rec-header">
              <i class="ri-sparkling-fill text-mot"></i>
              <span>Motivations catalog:</span>
            </div>
            <div class="presets-chips-grid">
              <button
                v-for="preset in MOTIVATIONS_CATALOG"
                :key="preset.id"
                type="button"
                class="chip-preset-btn chip-mot"
                :class="{ selected: selectedPresetId === preset.id }"
                @click="selectMotivationPreset(preset)"
                :title="preset.summary"
              >
                <i :class="preset.icon"></i>
                <span>{{ preset.name }}</span>
              </button>
            </div>
          </div>

          <div class="form-group mb-3">
            <label class="form-label">
              Motivation <span class="required-star">*</span>
            </label>
            <input
              v-model="newCompName"
              type="text"
              class="form-control"
              placeholder="e.g. Justice, Responsibility, Doing Good, Thrills..."
              autocomplete="off"
            />
          </div>

          <div class="form-group mb-0">
            <label class="form-label">
              Description
            </label>
            <textarea
              v-model="newCompDesc"
              class="form-control"
              rows="3"
              placeholder="Why this hero fights, or what principles guide them..."
            ></textarea>
          </div>
        </div>

        <!-- BODY: COMPLICATION MODE -->
        <div v-else class="narrative-mode-body">
          <div class="catalog-recommendation-banner">
            <div class="catalog-rec-header">
              <i class="ri-sparkling-fill text-comp"></i>
              <span>Complications catalog:</span>
            </div>
            <div class="presets-chips-grid">
              <button
                v-for="preset in popularComplicationPresets"
                :key="preset.id"
                type="button"
                class="chip-preset-btn chip-comp"
                :class="{ selected: selectedPresetId === preset.id }"
                @click="selectComplicationPreset(preset)"
                :title="preset.summary"
              >
                <i :class="preset.icon"></i>
                <span>{{ preset.name }}</span>
              </button>
            </div>
          </div>

          <div class="form-group mb-3">
            <label class="form-label">Category</label>
            <select
              v-model="selectedCompCategory"
              class="form-control"
              @change="handleCategoryChange"
            >
              <option v-for="cat in complicationCategories" :key="cat" :value="cat">
                {{ cat }}
              </option>
            </select>
          </div>

          <div class="form-group mb-3">
            <label class="form-label">
              Complication <span class="required-star">*</span>
            </label>
            <input
              v-model="newCompName"
              type="text"
              class="form-control"
              placeholder="e.g. Secret Identity, Nemesis, Weakness, Temper..."
              autocomplete="off"
            />
          </div>

          <div class="form-group mb-0">
            <label class="form-label">
              Description
            </label>
            <textarea
              v-model="newCompDesc"
              class="form-control"
              rows="3"
              placeholder="How this causes setbacks or trouble during play..."
            ></textarea>
          </div>
        </div>

        <!-- Modal Actions Footer -->
        <div class="narrative-modal-footer">
          <button type="button" class="btn btn-secondary" @click="showAddDialog = false">
            Cancel
          </button>
          <button
            type="button"
            class="btn"
            :class="modalMode === 'motivation' ? 'btn-confirm-mot' : 'btn-confirm-comp'"
            :disabled="!newCompName.trim()"
            @click="confirmAddComp"
          >
            <i :class="editingId ? 'ri-save-line' : (modalMode === 'motivation' ? 'ri-compass-3-line' : 'ri-add-line')"></i>
            {{ editingId ? 'Save Changes' : (modalMode === 'motivation' ? 'Add Motivation' : 'Add Complication') }}
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
  findComplicationPreset,
  isMotivation
} from '../../rules/complications.js';

const heroStore = useHeroStore();

const showAddDialog = ref(false);
const editingId = ref(null);
const modalMode = ref('motivation'); // 'motivation' | 'complication'
const selectedPresetId = ref('');
const selectedCompCategory = ref('Enemy');
const newCompType = ref('Motivation');
const newCompName = ref('');
const newCompDesc = ref('');

const complicationCategories = [
  'Enemy', 'Secret Identity', 'Weakness', 'Power Loss', 'Relationship',
  'Responsibility', 'Phobia', 'Accident', 'Addiction', 'Disability',
  'Fame', 'Flashbacks', 'Hatred', 'Honor', 'Obsession', 'Prejudice',
  'Reputation', 'Rivalry', 'Secret', 'Temper', 'Quirk', 'Other'
];

const popularComplicationPresets = computed(() => {
  return COMPLICATIONS_CATALOG.slice(0, 16);
});

const motivations = computed(() => {
  return heroStore.motivations;
});

const generalComplications = computed(() => {
  return heroStore.generalComplications;
});

const narrativeStatus = computed(() => {
  return heroStore.narrativeTraitsStatus;
});

function getComplicationIcon(comp) {
  if (!comp) return 'ri-alert-line';
  if (isMotivation(comp)) {
    const p = findComplicationPreset(comp.name);
    return p?.icon || 'ri-compass-3-line';
  }
  const p = findComplicationPreset(comp.type) || findComplicationPreset(comp.name);
  return p?.icon || 'ri-alert-line';
}

function openAddDialog(mode = 'motivation') {
  editingId.value = null;
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

function openEditDialog(comp) {
  editingId.value = comp.id;
  const isMot = isMotivation(comp);
  modalMode.value = isMot ? 'motivation' : 'complication';
  selectedPresetId.value = '';
  newCompType.value = comp.type || (isMot ? 'Motivation' : 'Enemy');
  selectedCompCategory.value = comp.type || 'Enemy';
  newCompName.value = comp.name || '';
  newCompDesc.value = comp.desc || '';
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
  newCompName.value = preset.id === 'custom_motivation' ? '' : preset.name;
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
  const name = newCompName.value.trim();
  const desc = newCompDesc.value.trim();

  if (editingId.value) {
    heroStore.updateComplication(editingId.value, { type, name, desc });
  } else {
    heroStore.addComplication(type, name, desc);
  }

  newCompName.value = '';
  newCompDesc.value = '';
  selectedPresetId.value = '';
  editingId.value = null;
  showAddDialog.value = false;
}

function removeTrait(item) {
  heroStore.removeComplication(item.id || item.name);
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
}

/* Rule Checklist Card */
.rule-checklist-card {
  padding: 1.15rem;
  background: rgba(15, 23, 42, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.09);
}

.rule-checklist-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.checklist-title-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.65rem;
}

.checklist-status-badge {
  font-size: 0.72rem;
  font-weight: 800;
  padding: 0.2rem 0.55rem;
  border-radius: var(--radius-sm);
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.checklist-status-badge.status-pass {
  background: rgba(16, 185, 129, 0.14);
  border: 1px solid rgba(16, 185, 129, 0.35);
  color: #34d399;
}

.checklist-status-badge.status-pending {
  background: rgba(245, 158, 11, 0.14);
  border: 1px solid rgba(245, 158, 11, 0.35);
  color: #fbbf24;
}

.checklist-actions-cluster {
  display: flex;
  align-items: center;
  gap: 0.45rem;
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
  background: #a855f7;
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
  background: #f43f5e;
  color: #fff;
  transform: translateY(-1px);
}

/* Two Pillars Status Grid */
.pillars-status-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.pillar-status-card {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem 0.9rem;
  border-radius: var(--radius-sm);
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.pillar-status-card.pillar-valid {
  border-color: rgba(16, 185, 129, 0.3);
  background: rgba(16, 185, 129, 0.05);
}

.pillar-status-card.pillar-warning {
  border-color: rgba(245, 158, 11, 0.3);
  background: rgba(245, 158, 11, 0.05);
}

.pillar-icon-wrap {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-xs);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.icon-mot {
  background: rgba(168, 85, 247, 0.2);
  color: #c084fc;
}

.icon-comp {
  background: rgba(244, 63, 94, 0.2);
  color: #fb7185;
}

.pillar-info {
  flex: 1;
  min-width: 0;
}

.pillar-label {
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: var(--text-muted);
}

.pillar-val {
  font-size: 0.84rem;
  font-weight: 800;
  margin: 0.1rem 0;
}

.val-pass {
  color: #34d399;
}

.val-warn {
  color: #fbbf24;
}

.pillar-hint {
  font-size: 0.72rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.35;
}

/* Group Blocks */
.group-block {
  padding: 1.15rem;
}

.mot-group-block {
  border-top: 2px solid #a855f7;
}

.comp-group-block {
  border-top: 2px solid #f43f5e;
}

.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.85rem;
}

.group-title {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.92rem;
  font-weight: 800;
  color: #ffffff;
}

.text-mot {
  color: #c084fc;
}

.text-comp {
  color: #fb7185;
}

.group-counter {
  font-size: 0.68rem;
  background: rgba(255, 255, 255, 0.08);
  padding: 0.1rem 0.45rem;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
}

.empty-pillar-box {
  text-align: center;
  padding: 1.5rem 1rem;
  background: rgba(0, 0, 0, 0.2);
  border: 1px dashed rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-sm);
}

.empty-icon-mot {
  font-size: 2rem;
  color: #c084fc;
  opacity: 0.5;
  display: block;
  margin-bottom: 0.35rem;
}

.empty-icon-comp {
  font-size: 2rem;
  color: #fb7185;
  opacity: 0.5;
  display: block;
  margin-bottom: 0.35rem;
}

.empty-text {
  font-size: 0.78rem;
  color: var(--text-muted);
  max-width: 440px;
  margin: 0 auto 0.75rem;
  line-height: 1.4;
}

.complications-list {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.comp-item {
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-sm);
  padding: 0.75rem 1rem;
  transition: all 0.2s ease;
}

.comp-item:hover {
  border-color: rgba(255, 255, 255, 0.2);
}

.comp-item.item-motivation {
  border-left: 3.5px solid #a855f7;
}

.comp-item.item-complication {
  border-left: 3.5px solid #f43f5e;
}

.comp-item-layout {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
}

.comp-item-main {
  flex: 1;
  min-width: 0;
}

.comp-header-row {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-bottom: 0.3rem;
  flex-wrap: wrap;
}

.badge-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.15rem 0.45rem;
  border-radius: var(--radius-xs);
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.03em;
}

.pill-motivation {
  background: rgba(168, 85, 247, 0.15);
  color: #d8b4fe;
  border: 1px solid rgba(168, 85, 247, 0.3);
}

.pill-complication {
  background: rgba(244, 63, 94, 0.15);
  color: #fda4af;
  border: 1px solid rgba(244, 63, 94, 0.3);
}

.comp-title-text {
  font-size: 0.88rem;
  font-weight: 800;
  color: #ffffff;
}

.comp-desc-text {
  font-size: 0.76rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.4;
  padding: 0.3rem 0.55rem;
  border-radius: 0 var(--radius-xs) var(--radius-xs) 0;
  background: rgba(0, 0, 0, 0.2);
}

.quote-mot {
  border-left: 2px solid rgba(168, 85, 247, 0.4);
}

.quote-comp {
  border-left: 2px solid rgba(244, 63, 94, 0.4);
}

.comp-card-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.comp-action-btn {
  width: 26px;
  height: 26px;
  border-radius: var(--radius-xs);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-muted);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.comp-action-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
}

.comp-action-btn.btn-remove-comp:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.5);
  color: #fca5a5;
}

/* Modal Overlay & Card */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(6px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
}

.narrative-modal-box {
  background: #111827;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--radius-lg);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.85);
  width: 100%;
  max-width: 540px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  max-height: 90vh;
}

.narrative-modal-box.theme-motivation {
  border-color: rgba(168, 85, 247, 0.4);
}

.narrative-modal-box.theme-complication {
  border-color: rgba(244, 63, 94, 0.4);
}

.narrative-modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border-subtle);
}

.theme-motivation .narrative-modal-header {
  background: rgba(168, 85, 247, 0.08);
}

.theme-complication .narrative-modal-header {
  background: rgba(244, 63, 94, 0.08);
}

.header-title-cluster {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
}

.header-icon-badge {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-xs);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.theme-motivation .header-icon-badge {
  background: rgba(168, 85, 247, 0.2);
  color: #c084fc;
}

.theme-complication .header-icon-badge {
  background: rgba(244, 63, 94, 0.2);
  color: #fb7185;
}

.modal-title {
  font-size: 1rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0;
}

.modal-subtitle {
  font-size: 0.74rem;
  color: var(--text-muted);
  margin: 0.15rem 0 0;
  line-height: 1.35;
}

.btn-close-modal {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.2rem;
  border-radius: var(--radius-xs);
  transition: all 0.2s ease;
}

.btn-close-modal:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.08);
}

.segmented-mode-bar {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.35rem;
  padding: 0.5rem 1.25rem;
  background: rgba(0, 0, 0, 0.25);
  border-bottom: 1px solid var(--border-subtle);
}

.segmented-tab-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0.45rem;
  border-radius: var(--radius-xs);
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-muted);
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.segmented-tab-btn.active.btn-tab-motivation {
  background: rgba(168, 85, 247, 0.2);
  border-color: rgba(168, 85, 247, 0.45);
  color: #d8b4fe;
}

.segmented-tab-btn.active.btn-tab-complication {
  background: rgba(244, 63, 94, 0.2);
  border-color: rgba(244, 63, 94, 0.45);
  color: #fda4af;
}

.narrative-mode-body {
  padding: 1.15rem 1.25rem;
  overflow-y: auto;
  max-height: 60vh;
}

.catalog-recommendation-banner {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: var(--radius-sm);
  padding: 0.65rem;
  margin-bottom: 1rem;
}

.catalog-rec-header {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--text-muted);
  margin-bottom: 0.45rem;
}

.presets-chips-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  max-height: 100px;
  overflow-y: auto;
}

.chip-preset-btn {
  font-size: 0.68rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: var(--radius-xs);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.chip-preset-btn.chip-mot:hover,
.chip-preset-btn.chip-mot.selected {
  background: rgba(168, 85, 247, 0.2);
  border-color: #a855f7;
  color: #d8b4fe;
}

.chip-preset-btn.chip-comp:hover,
.chip-preset-btn.chip-comp.selected {
  background: rgba(244, 63, 94, 0.2);
  border-color: #f43f5e;
  color: #fda4af;
}

.narrative-modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.65rem;
  padding: 0.75rem 1.25rem;
  background: rgba(11, 15, 23, 0.75);
  border-top: 1px solid var(--border-subtle);
}

.btn-confirm-mot {
  background: #a855f7;
  border: 1px solid #c084fc;
  color: #ffffff;
  font-weight: 700;
}

.btn-confirm-mot:hover {
  background: #9333ea;
}

.btn-confirm-comp {
  background: #f43f5e;
  border: 1px solid #fb7185;
  color: #ffffff;
  font-weight: 700;
}

.btn-confirm-comp:hover {
  background: #e11d48;
}

@media (max-width: 768px) {
  .pillars-status-grid {
    grid-template-columns: 1fr;
  }
}
</style>
