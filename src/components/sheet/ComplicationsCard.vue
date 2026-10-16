<template>
  <div class="dndb-card dndb-complications-card">
    <!-- Card Header -->
    <div class="dndb-card-header">
      <div class="dndb-card-title-wrap">
        <i class="ri-alert-line dndb-card-icon"></i>
        <h3 class="dndb-card-title">COMPLICATIONS</h3>
      </div>
      <div class="dndb-comp-header-right">
        <!-- Rules Met / Needs Metric Badge -->
        <span
          class="comp-rules-badge"
          :class="narrativeStatus.isValid ? 'is-valid' : 'is-pending'"
          :title="narrativeStatus.isValid ? 'Rules met: Character has at least 1 motivation and 1 complication' : (!narrativeStatus.hasMotivation ? 'Needs 1 motivation' : 'Needs 1 complication')"
        >
          <i :class="narrativeStatus.isValid ? 'ri-shield-check-fill' : 'ri-error-warning-fill'"></i>
          <span class="badge-label">{{ narrativeStatus.isValid ? 'Rules Met' : 'Needs 1' }}</span>
          <span class="badge-count">{{ allComplications.length }}</span>
        </span>

        <!-- Quick Add Button -->
        <button
          type="button"
          class="btn-comp-header-add"
          title="Add a new Motivation or Complication"
          @click="openAdd('complication')"
        >
          <i class="ri-add-line"></i>
          <span>Add</span>
        </button>
      </div>
    </div>

    <!-- Card Content Area -->
    <div class="dndb-complications-content">
      <!-- Empty State -->
      <div v-if="allComplications.length === 0" class="comp-empty-container">
        <i class="ri-shield-star-line comp-empty-glyph"></i>
        <p class="comp-empty-msg">
          No motivations or complications defined. M&amp;M 3e heroes require at least 1 motivation and 1 complication.
        </p>
        <div class="comp-quick-add-row">
          <button
            type="button"
            class="btn-quick-add motivation"
            @click="quickAdd('Motivation', 'Justice', 'Committed to bringing wrongdoers to justice and protecting fairness.')"
          >
            <i class="ri-scales-3-line"></i> + Justice (Mot)
          </button>
          <button
            type="button"
            class="btn-quick-add complication"
            @click="quickAdd('Secret Identity', 'Secret Identity', 'Must protect mundane civilian double-life and loved ones from villains.')"
          >
            <i class="ri-spy-line"></i> + Secret Identity
          </button>
        </div>
      </div>

      <!-- Non-Empty List -->
      <div v-else class="comp-groups-wrap">
        <!-- Subgroup 1: Motivations -->
        <div class="comp-subgroup motivation-subgroup">
          <div class="comp-subgroup-header">
            <div class="subgroup-title-wrap">
              <i class="ri-compass-3-line subgroup-icon text-cyan"></i>
              <span class="subgroup-title-text">MOTIVATIONS</span>
              <span class="subgroup-count">({{ motivations.length }})</span>
            </div>
            <button
              v-if="motivations.length === 0"
              type="button"
              class="btn-subgroup-add"
              @click="openAdd('motivation')"
            >
              <i class="ri-add-line"></i> Add
            </button>
          </div>

          <div v-if="motivations.length === 0" class="comp-subgroup-empty">
            <span>Missing motivation. Why does this hero fight?</span>
          </div>

          <div v-else class="comp-items-stack">
            <article
              v-for="item in motivations"
              :key="item.id"
              class="comp-item-row is-motivation"
            >
              <div class="comp-item-top">
                <div class="comp-item-title-wrap">
                  <span class="comp-icon-badge badge-mot">
                    <i :class="getComplicationIcon(item)"></i>
                  </span>
                  <strong class="comp-item-name" :title="item.name">{{ item.name }}</strong>
                </div>

                <div class="comp-item-actions">
                  <button
                    type="button"
                    class="btn-comp-action"
                    title="Edit motivation"
                    aria-label="Edit motivation"
                    @click="openEdit(item)"
                  >
                    <i class="ri-edit-line"></i>
                  </button>
                  <button
                    type="button"
                    class="btn-comp-action"
                    title="Broadcast to Roll20"
                    aria-label="Broadcast to Roll20"
                    @click="broadcastComplication(item)"
                  >
                    <i class="ri-broadcast-line"></i>
                  </button>
                  <button
                    type="button"
                    class="btn-comp-action is-delete"
                    title="Delete motivation"
                    aria-label="Delete motivation"
                    @click="removeComp(item.id, item.name)"
                  >
                    <i class="ri-close-line"></i>
                  </button>
                </div>
              </div>

              <p v-if="item.desc" class="comp-item-desc">{{ item.desc }}</p>
            </article>
          </div>
        </div>

        <!-- Subgroup 2: General Complications -->
        <div class="comp-subgroup complication-subgroup">
          <div class="comp-subgroup-header">
            <div class="subgroup-title-wrap">
              <i class="ri-alert-line subgroup-icon text-amber"></i>
              <span class="subgroup-title-text">COMPLICATIONS</span>
              <span class="subgroup-count">({{ generalComplications.length }})</span>
            </div>
            <button
              v-if="generalComplications.length === 0"
              type="button"
              class="btn-subgroup-add"
              @click="openAdd('complication')"
            >
              <i class="ri-add-line"></i> Add
            </button>
          </div>

          <div v-if="generalComplications.length === 0" class="comp-subgroup-empty">
            <span>Missing complications. What flaws or enemies cause trouble?</span>
          </div>

          <div v-else class="comp-items-stack">
            <article
              v-for="item in generalComplications"
              :key="item.id"
              class="comp-item-row is-complication"
            >
              <div class="comp-item-top">
                <div class="comp-item-title-wrap">
                  <span class="comp-icon-badge badge-comp">
                    <i :class="getComplicationIcon(item)"></i>
                  </span>
                  <strong class="comp-item-name" :title="item.name">{{ item.name }}</strong>
                  <span
                    v-if="item.type && item.type.toLowerCase() !== item.name.toLowerCase() && item.type.toLowerCase() !== 'complication'"
                    class="comp-tag tag-comp"
                  >{{ item.type }}</span>
                </div>

                <div class="comp-item-actions">
                  <button
                    type="button"
                    class="btn-comp-action"
                    title="Edit complication"
                    aria-label="Edit complication"
                    @click="openEdit(item)"
                  >
                    <i class="ri-edit-line"></i>
                  </button>
                  <button
                    type="button"
                    class="btn-comp-action"
                    title="Broadcast to Roll20"
                    aria-label="Broadcast to Roll20"
                    @click="broadcastComplication(item)"
                  >
                    <i class="ri-broadcast-line"></i>
                  </button>
                  <button
                    type="button"
                    class="btn-comp-action is-delete"
                    title="Delete complication"
                    aria-label="Delete complication"
                    @click="removeComp(item.id, item.name)"
                  >
                    <i class="ri-close-line"></i>
                  </button>
                </div>
              </div>

              <p v-if="item.desc" class="comp-item-desc">{{ item.desc }}</p>
            </article>
          </div>
        </div>
      </div>
    </div>

    <!-- Add / Edit Modal -->
    <transition name="fade">
      <div v-if="showModal" class="comp-modal-backdrop" @click.self="showModal = false">
        <div
          class="comp-modal-card"
          :class="formKind === 'motivation' ? 'theme-motivation' : 'theme-complication'"
          role="dialog"
          aria-modal="true"
        >
          <div class="comp-modal-header">
            <h4>
              <i :class="formKind === 'motivation' ? 'ri-compass-3-fill' : 'ri-alert-fill'"></i>
              <span>
                {{ isEditing ? 'Edit ' : 'Add ' }}
                {{ formKind === 'motivation' ? 'Motivation' : 'Complication' }}
              </span>
            </h4>
            <button type="button" class="comp-modal-close" @click="showModal = false" aria-label="Close">
              <i class="ri-close-line"></i>
            </button>
          </div>

          <div class="comp-modal-body">
            <!-- Mode Switcher (only when adding new) -->
            <div v-if="!isEditing" class="comp-segmented-switcher">
              <button
                type="button"
                class="segmented-btn btn-sw-mot"
                :class="{ active: formKind === 'motivation' }"
                @click="switchKind('motivation')"
              >
                <i class="ri-compass-3-line"></i> Motivation
              </button>
              <button
                type="button"
                class="segmented-btn btn-sw-comp"
                :class="{ active: formKind === 'complication' }"
                @click="switchKind('complication')"
              >
                <i class="ri-alert-line"></i> Complication
              </button>
            </div>

            <!-- Type / Category Selection (only for Complications) -->
            <div v-if="formKind === 'complication'" class="comp-form-group">
              <label for="comp-type-select">Category / Classification</label>
              <select
                id="comp-type-select"
                v-model="formType"
                @change="onCategoryChange"
              >
                <option v-for="cat in COMPLICATIONS_CATALOG" :key="cat.id" :value="cat.name">
                  {{ cat.name }} ({{ cat.summary }})
                </option>
                <option value="Custom">Custom Complication...</option>
              </select>
            </div>

            <!-- Title / Name Input -->
            <div class="comp-form-group">
              <label for="comp-name-input">Descriptor / Title</label>
              <input
                id="comp-name-input"
                v-model="formName"
                type="text"
                :placeholder="formKind === 'motivation' ? 'e.g. Justice, Responsibility, Protecting Innocents...' : 'e.g. Secret Identity, Arch-Nemesis: Baron Blitz, Kryptonite Weakness...'"
                autocomplete="off"
              />
            </div>

            <!-- Interactive Catalog Preset Drawer -->
            <div class="comp-presets-box">
              <div class="presets-header">
                <span class="presets-title">
                  <i class="ri-bookmark-3-line"></i> Presets:
                </span>
              </div>
              <div class="presets-chips-deck">
                <button
                  v-for="preset in activeCatalogPresets"
                  :key="preset.id"
                  type="button"
                  class="preset-chip"
                  :class="formKind === 'motivation' ? 'chip-motivation' : 'chip-complication'"
                  @click="applyPreset(preset)"
                >
                  <i :class="preset.icon"></i>
                  <span>{{ preset.name }}</span>
                </button>
              </div>
            </div>

            <!-- Narrative Hook / Description -->
            <div class="comp-form-group">
              <label for="comp-desc-textarea">Description</label>
              <textarea
                id="comp-desc-textarea"
                v-model="formDesc"
                rows="3"
                :placeholder="formKind === 'motivation' ? 'Why this hero fights, or what principles guide them...' : 'How this causes setbacks or trouble during play...'"
              ></textarea>
            </div>
          </div>

          <div class="comp-modal-footer">
            <button type="button" class="btn-cancel" @click="showModal = false">
              Cancel
            </button>
            <button
              type="button"
              class="btn-save"
              :class="formKind === 'motivation' ? 'btn-save-mot' : 'btn-save-comp'"
              @click="saveForm"
            >
              <i :class="isEditing ? 'ri-save-line' : (formKind === 'motivation' ? 'ri-compass-3-line' : 'ri-add-line')"></i>
              <span>{{ isEditing ? 'Save Changes' : (formKind === 'motivation' ? 'Add Motivation' : 'Add Complication') }}</span>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useHeroStore } from '../../stores/heroStore.js';
import { useUiStore } from '../../stores/uiStore.js';
import { sendFeatureToVTT } from '../../services/vttBridge.js';
import {
  MOTIVATIONS_CATALOG,
  COMPLICATIONS_CATALOG,
  findComplicationPreset,
  isMotivation
} from '../../rules/complications.js';

const heroStore = useHeroStore();
const uiStore = useUiStore();

// Modal Form State
const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref(null);
const formKind = ref('motivation'); // 'motivation' | 'complication'
const formType = ref('Motivation');
const formName = ref('');
const formDesc = ref('');

// Computed Lists from Store
const allComplications = computed(() => {
  return heroStore.character.complications || [];
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

const activeCatalogPresets = computed(() => {
  return formKind.value === 'motivation' ? MOTIVATIONS_CATALOG : COMPLICATIONS_CATALOG;
});

// Category & Icon Resolution
function getComplicationIcon(comp) {
  if (!comp) return 'ri-alert-line';
  if (isMotivation(comp)) {
    const p = findComplicationPreset(comp.name);
    return p?.icon || 'ri-compass-3-line';
  }
  const p = findComplicationPreset(comp.type) || findComplicationPreset(comp.name);
  return p?.icon || 'ri-alert-line';
}

// Quick Add from Empty State
function quickAdd(type, name, desc) {
  heroStore.addComplication(type, name, desc);
  uiStore.showToast(`Added ${name}!`, 'success');
}

// Modal Handlers
function openAdd(kind = 'motivation') {
  isEditing.value = false;
  editingId.value = null;
  formKind.value = kind;
  formType.value = kind === 'motivation' ? 'Motivation' : 'Enemy';
  formName.value = '';
  formDesc.value = '';
  showModal.value = true;
}

function openEdit(item) {
  isEditing.value = true;
  editingId.value = item.id;
  const isMot = isMotivation(item);
  formKind.value = isMot ? 'motivation' : 'complication';
  formType.value = item.type || (isMot ? 'Motivation' : 'Enemy');
  formName.value = item.name || '';
  formDesc.value = item.desc || '';
  showModal.value = true;
}

function switchKind(kind) {
  formKind.value = kind;
  if (kind === 'motivation') {
    formType.value = 'Motivation';
  } else if (formType.value === 'Motivation') {
    formType.value = 'Enemy';
  }
}

function onCategoryChange() {
  const preset = COMPLICATIONS_CATALOG.find(c => c.name.toLowerCase() === formType.value.toLowerCase());
  if (preset && !formName.value) {
    formName.value = preset.name;
    if (!formDesc.value) formDesc.value = preset.defaultDesc || preset.summary || '';
  }
}

function applyPreset(preset) {
  formName.value = preset.name;
  formDesc.value = preset.defaultDesc || preset.summary || '';
  if (preset.type === 'Complication') {
    formType.value = preset.name;
  }
}

function saveForm() {
  const name = formName.value.trim();
  if (!name) {
    uiStore.showToast('Please enter a title or descriptor', 'error');
    return;
  }

  const desc = formDesc.value.trim();
  const type = formKind.value === 'motivation' ? 'Motivation' : (formType.value || 'Complication');

  if (isEditing.value && editingId.value) {
    heroStore.updateComplication(editingId.value, { type, name, desc });
    uiStore.showToast(`Updated "${name}"`, 'success');
  } else {
    heroStore.addComplication(type, name, desc);
    uiStore.showToast(`Added "${name}"!`, 'success');
  }

  showModal.value = false;
}

function removeComp(id, name) {
  heroStore.removeComplication(id || name);
  uiStore.showToast(`Removed "${name}"`, 'info');
}

function broadcastComplication(item) {
  sendFeatureToVTT({
    name: `${item.type || 'Complication'}: ${item.name}`,
    category: 'complication',
    type: item.type || 'Complication',
    subtype: item.name || '',
    description: item.desc || '',
    details: `${item.type || 'Complication'} • ${item.name}`
  }, heroStore.character);

  uiStore.showToast(`Broadcasted "${item.name}" to Roll20!`, 'info');
}
</script>

<style scoped>
.dndb-complications-card {
  display: flex;
  flex-direction: column;
  position: relative;
  box-sizing: border-box;
  width: 100%;
  overflow: hidden;
  padding: 1rem;
}

/* Header Elements */
.dndb-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.35rem;
  margin-bottom: 0.65rem;
  padding-bottom: 0.45rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  box-sizing: border-box;
  width: 100%;
}

.dndb-card-title-wrap {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  min-width: 0;
  flex-shrink: 1;
}

.dndb-card-icon {
  font-size: 1rem;
  color: var(--accent-primary, #38bdf8);
  flex-shrink: 0;
}

.dndb-card-title {
  font-size: 0.82rem;
  font-weight: 900;
  letter-spacing: 0.04em;
  color: #f8fafc;
  margin: 0;
  white-space: nowrap;
}

.dndb-comp-header-right {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-shrink: 0;
}

.comp-rules-badge {
  font-size: 0.62rem;
  font-weight: 700;
  padding: 0.15rem 0.4rem;
  border-radius: var(--radius-pill, 999px);
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  white-space: nowrap;
  letter-spacing: 0.02em;
  box-sizing: border-box;
}

.comp-rules-badge .badge-label {
  display: none;
}

@media (min-width: 1500px) {
  .comp-rules-badge .badge-label {
    display: inline;
  }
}

.comp-rules-badge.is-valid {
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.35);
  color: #34d399;
}

.comp-rules-badge.is-pending {
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.35);
  color: #fbbf24;
}

.badge-count {
  font-weight: 800;
}

.btn-comp-header-add {
  height: 22px;
  background: rgba(0, 111, 184, 0.2);
  border: 1px solid rgba(0, 111, 184, 0.4);
  color: #38bdf8;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0 0.45rem;
  border-radius: var(--radius-xs, 4px);
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  cursor: pointer;
  box-sizing: border-box;
  transition: all var(--trans-fast, 0.15s ease);
}

.btn-comp-header-add:hover {
  background: var(--accent-primary, #006fb8);
  border-color: #38bdf8;
  color: #fff;
}

/* Card Content Area */
.dndb-complications-content {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  box-sizing: border-box;
  width: 100%;
}

/* Empty State */
.comp-empty-container {
  padding: 0.85rem 0.5rem;
  text-align: center;
  background: rgba(255, 255, 255, 0.02);
  border: 1px dashed rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  box-sizing: border-box;
  width: 100%;
}

.comp-empty-glyph {
  font-size: 1.4rem;
  color: var(--text-muted, #64748b);
  margin-bottom: 0.3rem;
}

.comp-empty-msg {
  font-size: 0.7rem;
  color: var(--text-muted, #94a3b8);
  margin: 0 0 0.55rem;
  line-height: 1.4;
}

.comp-quick-add-row {
  display: flex;
  gap: 0.35rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-quick-add {
  font-size: 0.66rem;
  font-weight: 700;
  padding: 0.22rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  box-sizing: border-box;
  transition: all 0.15s ease;
}

.btn-quick-add.motivation {
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #34d399;
}

.btn-quick-add.motivation:hover {
  background: rgba(16, 185, 129, 0.25);
  border-color: #10b981;
  color: #fff;
}

.btn-quick-add.complication {
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: #fbbf24;
}

.btn-quick-add.complication:hover {
  background: rgba(245, 158, 11, 0.25);
  border-color: #f59e0b;
  color: #fff;
}

/* Subgroups */
.comp-groups-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  box-sizing: border-box;
  width: 100%;
}

.comp-subgroup {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  box-sizing: border-box;
  width: 100%;
}

.comp-subgroup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 0.2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  box-sizing: border-box;
  width: 100%;
}

.subgroup-title-wrap {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.subgroup-icon {
  font-size: 0.8rem;
}

.subgroup-title-text {
  font-size: 0.66rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: var(--text-muted, #94a3b8);
}

.subgroup-count {
  font-size: 0.64rem;
  font-weight: 700;
  color: #64748b;
}

.btn-subgroup-add {
  background: none;
  border: none;
  color: #38bdf8;
  font-size: 0.64rem;
  font-weight: 700;
  cursor: pointer;
  padding: 0 0.2rem;
  transition: color 0.15s ease;
}

.btn-subgroup-add:hover {
  color: #fff;
}

.comp-subgroup-empty {
  font-size: 0.68rem;
  color: #64748b;
  font-style: italic;
  padding: 0.25rem 0.15rem;
}

/* Items Stack */
.comp-items-stack {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  box-sizing: border-box;
  width: 100%;
}

.comp-item-row {
  display: flex;
  flex-direction: column;
  gap: 0.22rem;
  padding: 0.42rem 0.55rem;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 255, 255, 0.07);
  box-sizing: border-box;
  width: 100%;
  overflow: hidden;
  transition: all 0.15s ease;
}

.comp-item-row:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.14);
}

.comp-item-row.is-motivation {
  border-left: 2px solid #10b981;
}

.comp-item-row.is-complication {
  border-left: 2px solid #f59e0b;
}

.comp-item-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.35rem;
  width: 100%;
  box-sizing: border-box;
}

.comp-item-title-wrap {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  min-width: 0;
  flex: 1;
}

.comp-icon-badge {
  font-size: 0.78rem;
  line-height: 1;
  display: inline-flex;
  flex-shrink: 0;
}

.badge-mot {
  color: #34d399;
}

.badge-comp {
  color: #fbbf24;
}

.comp-item-name {
  font-size: 0.76rem;
  font-weight: 700;
  color: #f1f5f9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.comp-tag {
  font-size: 0.55rem;
  font-weight: 700;
  padding: 0.05rem 0.25rem;
  border-radius: 3px;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  white-space: nowrap;
  flex-shrink: 0;
}

.tag-comp {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
}

/* Action Cluster */
.comp-item-actions {
  display: flex;
  align-items: center;
  gap: 0.15rem;
  flex-shrink: 0;
}

.btn-comp-action {
  width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 3px;
  color: #94a3b8;
  cursor: pointer;
  font-size: 0.68rem;
  box-sizing: border-box;
  transition: all 0.15s ease;
}

.btn-comp-action:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  border-color: rgba(255, 255, 255, 0.2);
}

.btn-comp-action.is-delete:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: #ef4444;
  color: #fca5a5;
}

.comp-item-desc {
  font-size: 0.68rem;
  color: #94a3b8;
  margin: 0;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  box-sizing: border-box;
  width: 100%;
}

.btn-comp-action:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  border-color: rgba(255, 255, 255, 0.2);
}

.btn-comp-action.is-delete:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: #ef4444;
  color: #fca5a5;
}

/* Modal Form Styles */
.comp-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.comp-modal-card {
  width: 100%;
  max-width: 480px;
  background: #0d1520;
  border: 1px solid #1e293b;
  border-radius: 8px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.comp-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1rem;
  background: #111c2e;
  border-bottom: 1px solid #1e293b;
}

.comp-modal-header h4 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  color: #f8fafc;
}

.comp-modal-close {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 1.15rem;
  cursor: pointer;
  line-height: 1;
}

.comp-modal-close:hover {
  color: #fff;
}

.comp-modal-body {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  max-height: 70vh;
  overflow-y: auto;
}

/* Segmented Switcher */
.comp-segmented-switcher {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.35rem;
  background: rgba(255, 255, 255, 0.03);
  padding: 0.25rem;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.segmented-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.4rem;
  font-size: 0.75rem;
  font-weight: 700;
  border: 1px solid transparent;
  border-radius: 4px;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.15s ease;
}

.segmented-btn.active.btn-sw-mot {
  background: rgba(16, 185, 129, 0.18);
  border-color: rgba(16, 185, 129, 0.4);
  color: #34d399;
}

.segmented-btn.active.btn-sw-comp {
  background: rgba(245, 158, 11, 0.18);
  border-color: rgba(245, 158, 11, 0.4);
  color: #fbbf24;
}

/* Form Groups */
.comp-form-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.comp-form-group label {
  font-size: 0.72rem;
  font-weight: 700;
  color: #cbd5e1;
}

.comp-form-group input,
.comp-form-group select,
.comp-form-group textarea {
  background: #090e17;
  border: 1px solid #1e293b;
  border-radius: 4px;
  padding: 0.45rem 0.65rem;
  color: #f8fafc;
  font-size: 0.8rem;
  font-family: inherit;
  transition: border-color 0.15s ease;
}

.comp-form-group input:focus,
.comp-form-group select:focus,
.comp-form-group textarea:focus {
  outline: none;
  border-color: var(--accent-primary, #006fb8);
  box-shadow: 0 0 0 2px rgba(0, 111, 184, 0.2);
}

/* Presets Chips */
.comp-presets-box {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 6px;
  padding: 0.55rem;
}

.presets-header {
  margin-bottom: 0.35rem;
}

.presets-title {
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.presets-chips-deck {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.preset-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.18rem 0.45rem;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #cbd5e1;
  cursor: pointer;
  transition: all 0.15s ease;
}

.preset-chip:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.preset-chip.chip-motivation:hover {
  border-color: #10b981;
}

.preset-chip.chip-complication:hover {
  border-color: #f59e0b;
}

/* Modal Footer */
.comp-modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #111c2e;
  border-top: 1px solid #1e293b;
}

.btn-cancel {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.btn-save {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.4rem 0.85rem;
  border-radius: 4px;
  border: 1px solid transparent;
  cursor: pointer;
  color: #fff;
  transition: all 0.15s ease;
}

.btn-save-mot {
  background: #059669;
  border-color: #10b981;
}

.btn-save-mot:hover {
  background: #10b981;
}

.btn-save-comp {
  background: #d97706;
  border-color: #f59e0b;
}

.btn-save-comp:hover {
  background: #f59e0b;
}

.text-cyan {
  color: #38bdf8;
}

.text-amber {
  color: #fbbf24;
}
</style>
