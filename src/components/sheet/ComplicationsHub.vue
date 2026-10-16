<template>
  <div class="complications-hub">
    <!-- Unified Toolbar Header -->
    <div class="comp-toolbar">
      <div class="comp-toolbar-left">
        <div class="comp-title-wrap">
          <i class="ri-shield-star-line comp-title-icon"></i>
          <span class="comp-title-text">Motivations & Complications</span>
        </div>

        <!-- Core M&M 3e Rules Status Pill -->
        <div
          class="comp-rules-status"
          :class="narrativeStatus.isValid ? 'status-met' : 'status-pending'"
        >
          <i :class="narrativeStatus.isValid ? 'ri-shield-check-fill' : 'ri-error-warning-fill'"></i>
          <span v-if="narrativeStatus.isValid">
            Rules Met ({{ motivations.length }} Mot, {{ generalComplications.length }} Comp)
          </span>
          <span v-else-if="!narrativeStatus.hasMotivation">
            Needs 1 motivation
          </span>
          <span v-else-if="!narrativeStatus.hasComplication">
            Needs 1 complication
          </span>
          <span v-else>
            Needs 1 motivation and 1 complication
          </span>
        </div>
      </div>

      <!-- Integrated Hero Points HUD Quick Counter -->
      <div class="comp-toolbar-right">
        <div class="hp-inline-tracker">
          <span class="hp-inline-label">HERO POINTS</span>
          <div class="hp-stepper-compact">
            <button
              type="button"
              class="hp-step-btn hp-step-minus"
              :disabled="(heroStore.character.heroPoints || 0) <= 0"
              @click="adjustHeroPoints(-1)"
              aria-label="Spend 1 Hero Point"
            >
              <i class="ri-subtract-line"></i>
            </button>
            <div class="hp-token-pill">
              <i class="ri-copper-diamond-fill hp-token-glyph"></i>
              <span class="hp-token-num">{{ heroStore.character.heroPoints || 0 }}</span>
            </div>
            <button
              type="button"
              class="hp-step-btn hp-step-plus"
              @click="adjustHeroPoints(1)"
              aria-label="Award +1 Hero Point"
            >
              <i class="ri-add-line"></i>
            </button>
          </div>
          <span
            class="hp-info-tip"
          >
            <i class="ri-information-line"></i>
          </span>
        </div>
      </div>
    </div>

    <!-- Empty State when nothing is defined -->
    <div v-if="allComplications.length === 0" class="comp-empty-state">
      <div class="comp-empty-icon"><i class="ri-shield-star-line"></i></div>
      <h4 class="comp-empty-title">No Motivations or Complications Defined</h4>
      <p class="comp-empty-desc">
        Every hero needs at least one motivation and one complication.
        When they cause trouble during play, the GM awards you Hero Points.
      </p>
      <div class="comp-preset-quick-row">
        <button
          type="button"
          class="comp-preset-btn motivation"
          @click="quickAdd('Motivation', 'Justice', 'Committed to bringing wrongdoers to justice and protecting fairness.')"
        >
          <i class="ri-scales-3-line"></i> Justice (Motivation)
        </button>
        <button
          type="button"
          class="comp-preset-btn motivation"
          @click="quickAdd('Motivation', 'Responsibility', 'Believes that great power carries a moral duty to protect others.')"
        >
          <i class="ri-shield-user-line"></i> Responsibility (Motivation)
        </button>
        <button
          type="button"
          class="comp-preset-btn complication"
          @click="quickAdd('Secret Identity', 'Secret Identity', 'Must protect mundane civilian double-life and loved ones from villains.')"
        >
          <i class="ri-spy-line"></i> Secret Identity
        </button>
        <button
          type="button"
          class="comp-preset-btn complication"
          @click="quickAdd('Enemy', 'Arch-Nemesis', 'Targeted by a recurring nemesis or criminal syndicate dedicated to your downfall.')"
        >
          <i class="ri-skull-line"></i> Enemy
        </button>
        <button
          type="button"
          class="comp-preset-btn complication"
          @click="quickAdd('Weakness', 'Weakness', 'Vulnerable to a specific substance, mineral, or frequency that bypasses defenses.')"
        >
          <i class="ri-atom-line"></i> Weakness
        </button>
      </div>
    </div>

    <!-- Active Sections Grid -->
    <div v-else class="comp-sections-wrapper">
      <!-- 1. Heroic Motivations Section -->
      <section class="comp-group-section motivation-group">
        <div class="comp-group-header">
          <div class="comp-group-title">
            <i class="ri-compass-3-fill group-icon"></i>
            <span>Motivations</span>
            <span class="comp-group-count">{{ motivations.length }}</span>
            <span v-if="motivations.length === 0" class="comp-req-warning">Needs 1</span>
          </div>
          <button type="button" class="btn-subtle-add btn-subtle-mot" @click="openAdd('motivation')">
            <i class="ri-add-line"></i> Add Motivation
          </button>
        </div>

        <div v-if="motivations.length === 0" class="comp-group-empty">
          <i class="ri-compass-3-line"></i>
          <span>No motivation added yet. Add the reason your character acts as a hero.</span>
        </div>

        <div v-else class="comp-items-grid">
          <article
            v-for="item in motivations"
            :key="item.id"
            class="comp-card card-motivation"
          >
            <div class="comp-card-top">
              <div class="comp-card-identity">
                <div class="comp-identity-header">
                  <div class="comp-icon-indicator indicator-mot">
                    <i :class="getComplicationIcon(item)"></i>
                  </div>
                  <h4 class="comp-name">{{ item.name }}</h4>
                </div>
              </div>

              <!-- Action Cluster: Inline Trigger Pill + Secondary Actions -->
              <div class="comp-card-actions">
                <button
                  type="button"
                  class="btn-trigger-pill trigger-mot-pill"
                  @click="triggerTrait(item)"
                >
                  <i class="ri-shield-star-fill"></i>
                  <span>+1 HP Trigger</span>
                </button>
                <button
                  type="button"
                  class="card-act-btn"
                  @click="openEdit(item)"
                  aria-label="Edit motivation"
                >
                  <i class="ri-edit-line"></i>
                </button>
                <button
                  type="button"
                  class="card-act-btn"
                  @click="broadcastComplication(item)"
                  aria-label="Broadcast to Roll20"
                >
                  <i class="ri-broadcast-line"></i>
                </button>
                <button
                  type="button"
                  class="card-act-btn"
                  @click="copyText(item)"
                  aria-label="Copy text"
                >
                  <i class="ri-file-copy-line"></i>
                </button>
                <button
                  type="button"
                  class="card-act-btn btn-delete"
                  @click="removeComp(item.id, item.name)"
                  aria-label="Delete motivation"
                >
                  <i class="ri-delete-bin-line"></i>
                </button>
              </div>
            </div>

            <!-- Creed / Narrative Description (Clean, No Nested Box) -->
            <p v-if="item.desc" class="comp-card-desc desc-mot">{{ item.desc }}</p>
          </article>
        </div>
      </section>

      <!-- 2. Complications Section -->
      <section class="comp-group-section complication-group">
        <div class="comp-group-header">
          <div class="comp-group-title">
            <i class="ri-alert-fill group-icon"></i>
            <span>Complications</span>
            <span class="comp-group-count">{{ generalComplications.length }}</span>
            <span v-if="generalComplications.length === 0" class="comp-req-warning">Needs 1</span>
          </div>
          <button type="button" class="btn-subtle-add btn-subtle-comp" @click="openAdd('complication')">
            <i class="ri-add-line"></i> Add Complication
          </button>
        </div>

        <div v-if="generalComplications.length === 0" class="comp-group-empty">
          <i class="ri-alert-line"></i>
          <span>No complications added yet. Add enemies, secrets, or weaknesses that cause problems during play.</span>
        </div>

        <div v-else class="comp-items-grid">
          <article
            v-for="item in generalComplications"
            :key="item.id"
            class="comp-card card-complication"
          >
            <div class="comp-card-top">
              <div class="comp-card-identity">
                <div class="comp-identity-header">
                  <div class="comp-icon-indicator indicator-comp">
                    <i :class="getComplicationIcon(item)"></i>
                  </div>
                  <h4 class="comp-name">{{ item.name }}</h4>
                </div>
              </div>

              <!-- Action Cluster: Inline Trigger Pill + Secondary Actions -->
              <div class="comp-card-actions">
                <button
                  type="button"
                  class="btn-trigger-pill trigger-comp-pill"
                  @click="triggerTrait(item)"
                >
                  <i class="ri-shield-star-fill"></i>
                  <span>+1 HP Trigger</span>
                </button>
                <button
                  type="button"
                  class="card-act-btn"
                  @click="openEdit(item)"
                  aria-label="Edit complication"
                >
                  <i class="ri-edit-line"></i>
                </button>
                <button
                  type="button"
                  class="card-act-btn"
                  @click="broadcastComplication(item)"
                  aria-label="Broadcast to Roll20"
                >
                  <i class="ri-broadcast-line"></i>
                </button>
                <button
                  type="button"
                  class="card-act-btn"
                  @click="copyText(item)"
                  aria-label="Copy text"
                >
                  <i class="ri-file-copy-line"></i>
                </button>
                <button
                  type="button"
                  class="card-act-btn btn-delete"
                  @click="removeComp(item.id, item.name)"
                  aria-label="Delete complication"
                >
                  <i class="ri-delete-bin-line"></i>
                </button>
              </div>
            </div>

            <!-- Hazard / Story Hook Description (Clean, No Nested Box) -->
            <p v-if="item.desc" class="comp-card-desc desc-comp">{{ item.desc }}</p>
          </article>
        </div>
      </section>
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
                <i class="ri-compass-3-line"></i>
                <div class="segmented-texts">
                  <span class="seg-title">Motivation</span>
                  <span class="seg-sub">Reason to fight</span>
                </div>
              </button>
              <button
                type="button"
                class="segmented-btn btn-sw-comp"
                :class="{ active: formKind === 'complication' }"
                @click="switchKind('complication')"
              >
                <i class="ri-alert-line"></i>
                <div class="segmented-texts">
                  <span class="seg-title">Complication</span>
                  <span class="seg-sub">Weakness or obstacle</span>
                </div>
              </button>
            </div>

            <!-- Complication Category Selector -->
            <div v-if="formKind === 'complication'" class="comp-form-group">
              <label for="comp-category-select">Complication Category</label>
              <select id="comp-category-select" v-model="formType" @change="onCategoryChange">
                <option value="Enemy">Enemy / Arch-Nemesis</option>
                <option value="Secret Identity">Secret Identity</option>
                <option value="Weakness">Weakness / Vulnerability</option>
                <option value="Power Loss">Power Loss</option>
                <option value="Relationship">Relationship / Dependent</option>
                <option value="Responsibility">Responsibility / Duty</option>
                <option value="Phobia">Phobia / Dread</option>
                <option value="Accident">Accident / Collateral Risk</option>
                <option value="Addiction">Addiction / Dependence</option>
                <option value="Disability">Disability / Impairment</option>
                <option value="Fame">Fame / Celebrity Spotlight</option>
                <option value="Flashbacks">Flashbacks / Trauma</option>
                <option value="Hatred">Hatred / Intolerance</option>
                <option value="Honor">Honor / Code of Conduct</option>
                <option value="Identity">Identity / False Persona</option>
                <option value="Obsession">Obsession / Mania</option>
                <option value="Prejudice">Prejudice / Outcast</option>
                <option value="Quirk">Quirk / Idiosyncrasy</option>
                <option value="Reputation">Reputation / Notoriety</option>
                <option value="Rivalry">Rivalry / Competitive Feud</option>
                <option value="Secret">Secret / Dark Truth</option>
                <option value="Temper">Temper / Berserk Fury</option>
                <option value="Complication">Other Custom Complication</option>
              </select>
            </div>

            <!-- Name / Title Input -->
            <div class="comp-form-group">
              <label for="comp-name-input">
                {{ formKind === 'motivation' ? 'Motivation *' : 'Complication *' }}
              </label>
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

function getCategoryLabel(comp) {
  if (!comp) return 'COMPLICATION';
  if (isMotivation(comp)) return 'MOTIVATION';
  return (comp.type || 'COMPLICATION').toUpperCase();
}

// Hero Points Handling
function adjustHeroPoints(delta) {
  heroStore.adjustHeroPoints(delta);
  if (delta > 0) {
    uiStore.showToast(`Awarded +${delta} Hero Point!`, 'success');
  } else {
    uiStore.showToast(`Spent 1 Hero Point. Remaining: ${heroStore.character.heroPoints}`, 'info');
  }
}

// Quick Add from Empty State
function quickAdd(type, name, desc) {
  heroStore.addComplication(type, name, desc);
  uiStore.showToast(`Added ${name}!`, 'success');
}

// Trait Gameplay Trigger (Both Motivation & Complications award +1 HP per rules)
function triggerTrait(item) {
  heroStore.adjustHeroPoints(1);
  const isMot = isMotivation(item);

  if (isMot) {
    sendFeatureToVTT({
      name: `Motivation: ${item.name}`,
      category: 'motivation_award',
      type: 'Motivation',
      subtype: item.name || '',
      description: `Motivation: **${item.name}** created a dilemma. GM awarded 1 Hero Point.\n\n${item.desc || ''}`,
      details: `Motivation • +1 Hero Point`
    }, heroStore.character);

    uiStore.showToast(`Triggered "${item.name}" (+1 Hero Point)`, 'success');
  } else {
    sendFeatureToVTT({
      name: `Complication: ${item.name}`,
      category: 'complication_award',
      type: item.type || 'Complication',
      subtype: item.name || '',
      description: `Complication: **${item.name}** caused a setback. GM awarded 1 Hero Point.\n\n${item.desc || ''}`,
      details: `${item.type || 'Complication'} • +1 Hero Point`
    }, heroStore.character);

    uiStore.showToast(`Triggered "${item.name}" (+1 Hero Point)`, 'success');
  }
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

function copyText(item) {
  const text = `**${item.name}** [${item.type}]\n${item.desc || ''}`;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
    uiStore.showToast(`Copied "${item.name}" to clipboard!`, 'info');
  }
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
.complications-hub {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

/* Toolbar */
.comp-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: 0.35rem 0 0.5rem 0;
  border-bottom: 1px solid var(--border-subtle);
}

.comp-toolbar-left {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.65rem;
}

.comp-title-wrap {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.comp-title-icon {
  font-size: 1.15rem;
  color: #f59e0b;
}

.comp-title-text {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

/* Rules Status Pill */
.comp-rules-status {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.2rem 0.55rem;
  border-radius: var(--radius-sm);
  transition: all var(--trans-fast);
}

.comp-rules-status.status-met {
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.35);
  color: #34d399;
}

.comp-rules-status.status-pending {
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.35);
  color: #fbbf24;
}

/* Toolbar Right: Integrated Compact Hero Points Tracker */
.comp-toolbar-right {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.hp-inline-tracker {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.28);
  border-radius: var(--radius-sm);
  padding: 2px 7px 2px 9px;
  transition: all var(--trans-fast);
}

.hp-inline-tracker:hover {
  border-color: rgba(245, 158, 11, 0.45);
  background: rgba(245, 158, 11, 0.12);
}

.hp-inline-label {
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: #f59e0b;
  text-transform: uppercase;
}

.hp-stepper-compact {
  display: inline-flex;
  align-items: center;
  background: rgba(11, 15, 23, 0.9);
  border: 1px solid rgba(245, 158, 11, 0.22);
  border-radius: var(--radius-xs);
  padding: 1px;
  gap: 2px;
}

.hp-step-btn {
  width: 22px;
  height: 22px;
  background: rgba(255, 255, 255, 0.06);
  border: none;
  border-radius: 2px;
  color: #ffffff;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--trans-fast);
}

.hp-step-btn:hover:not(:disabled) {
  background: #f59e0b;
  color: #0b0f17;
}

.hp-step-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.hp-token-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0 0.45rem;
  min-width: 32px;
  justify-content: center;
}

.hp-token-glyph {
  color: #fbbf24;
  font-size: 0.85rem;
}

.hp-token-num {
  font-size: 0.95rem;
  font-weight: 900;
  color: #ffffff;
  font-family: var(--font-mono, monospace);
}

.hp-info-tip {
  color: var(--text-muted);
  font-size: 0.85rem;
  cursor: help;
  display: inline-flex;
  align-items: center;
  transition: color var(--trans-fast);
}

.hp-info-tip:hover {
  color: #f59e0b;
}

/* Empty State */
.comp-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2.25rem 1.25rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px dashed rgba(255, 255, 255, 0.12);
  border-radius: var(--radius-lg);
  gap: 0.65rem;
}

.comp-empty-icon {
  font-size: 2.2rem;
  color: #f59e0b;
  opacity: 0.6;
}

.comp-empty-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0;
}

.comp-empty-desc {
  font-size: 0.78rem;
  color: var(--text-muted);
  max-width: 520px;
  margin: 0;
  line-height: 1.45;
}

.comp-preset-quick-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  margin-top: 0.5rem;
}

.comp-preset-btn {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.35rem 0.65rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  transition: all var(--trans-fast);
}

.comp-preset-btn.motivation {
  background: rgba(168, 85, 247, 0.14);
  border: 1px solid rgba(168, 85, 247, 0.35);
  color: #d8b4fe;
}

.comp-preset-btn.motivation:hover {
  background: #a855f7;
  color: #ffffff;
}

.comp-preset-btn.complication {
  background: rgba(244, 63, 94, 0.14);
  border: 1px solid rgba(244, 63, 94, 0.35);
  color: #fda4af;
}

.comp-preset-btn.complication:hover {
  background: #f43f5e;
  color: #ffffff;
}

/* Sections */
.comp-sections-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
}

.comp-group-section {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.comp-group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 0.35rem;
  border-bottom: 1px solid var(--border-subtle);
}

.comp-group-title {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: 0.03em;
}

.comp-group-title .group-icon {
  font-size: 1rem;
}

.motivation-group .comp-group-title .group-icon {
  color: #c084fc;
}

.complication-group .comp-group-title .group-icon {
  color: #fb7185;
}

.comp-group-count {
  font-size: 0.65rem;
  background: rgba(255, 255, 255, 0.08);
  padding: 0.05rem 0.4rem;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
}

.comp-req-warning {
  font-size: 0.65rem;
  font-weight: 700;
  color: #fb923c;
  background: rgba(249, 115, 22, 0.15);
  padding: 0.05rem 0.4rem;
  border-radius: var(--radius-sm);
}

.btn-subtle-add {
  background: transparent;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.2rem 0.55rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--trans-fast);
}

.btn-subtle-mot {
  border: 1px solid rgba(168, 85, 247, 0.35);
  color: #d8b4fe;
}

.btn-subtle-mot:hover {
  background: rgba(168, 85, 247, 0.2);
  color: #ffffff;
}

.btn-subtle-comp {
  border: 1px solid rgba(244, 63, 94, 0.35);
  color: #fda4af;
}

.btn-subtle-comp:hover {
  background: rgba(244, 63, 94, 0.2);
  color: #ffffff;
}

.comp-group-empty {
  padding: 1.15rem;
  text-align: center;
  background: rgba(255, 255, 255, 0.015);
  border: 1px dashed rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-md);
  color: var(--text-muted);
  font-size: 0.76rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

/* Cards Grid & Dossier Card Architecture (Anti Card-in-Card) */
.comp-items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 0.75rem;
}

.comp-card {
  background: rgba(15, 23, 42, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: var(--radius-md);
  padding: 0.75rem 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  transition: all var(--trans-fast);
  position: relative;
}

.card-motivation {
  border-color: rgba(139, 92, 246, 0.3);
  background: rgba(139, 92, 246, 0.04);
}

.card-motivation:hover {
  background: rgba(139, 92, 246, 0.09);
  border-color: rgba(139, 92, 246, 0.45);
}

.card-complication {
  border-color: rgba(244, 63, 94, 0.3);
  background: rgba(244, 63, 94, 0.04);
}

.card-complication:hover {
  background: rgba(244, 63, 94, 0.09);
  border-color: rgba(244, 63, 94, 0.45);
}

.comp-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
}

.comp-card-identity {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  min-width: 0;
}

.comp-identity-header {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-wrap: wrap;
}

.comp-icon-indicator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: var(--radius-xs);
  font-size: 0.82rem;
  flex-shrink: 0;
}

.indicator-mot {
  background: rgba(168, 85, 247, 0.16);
  border: 1px solid rgba(168, 85, 247, 0.3);
  color: #c084fc;
}

.indicator-comp {
  background: rgba(244, 63, 94, 0.16);
  border: 1px solid rgba(244, 63, 94, 0.3);
  color: #fda4af;
}

.comp-category-tag {
  font-size: 0.64rem;
  font-weight: 800;
  color: #fda4af;
  background: rgba(244, 63, 94, 0.14);
  border: 1px solid rgba(244, 63, 94, 0.28);
  padding: 0.1rem 0.4rem;
  border-radius: var(--radius-sm);
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  letter-spacing: 0.04em;
  width: fit-content;
  flex-shrink: 0;
}

.comp-name {
  font-size: 0.92rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0;
  line-height: 1.3;
}

/* Card Action Cluster: Inline Trigger Pill + Secondary Icons */
.comp-card-actions {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  flex-shrink: 0;
}

.btn-trigger-pill {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.22rem 0.55rem;
  border-radius: 9999px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  white-space: nowrap;
  transition: all var(--trans-fast);
}

.trigger-mot-pill {
  background: rgba(139, 92, 246, 0.15);
  border: 1px solid rgba(139, 92, 246, 0.4);
  color: #c4b5fd;
}

.trigger-mot-pill:hover {
  background: #8b5cf6;
  border-color: #a78bfa;
  color: #ffffff;
}

.trigger-comp-pill {
  background: rgba(244, 63, 94, 0.15);
  border: 1px solid rgba(244, 63, 94, 0.4);
  color: #fda4af;
}

.trigger-comp-pill:hover {
  background: #f43f5e;
  border-color: #fb7185;
  color: #ffffff;
}

.card-act-btn {
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  cursor: pointer;
  font-size: 0.8rem;
  border-radius: var(--radius-sm);
  transition: all var(--trans-fast);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.card-act-btn:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.12);
}

.card-act-btn.btn-delete:hover {
  color: #fca5a5;
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.5);
}

/* Narrative Creed & Hazard Description (Clean, No Box-in-a-Box) */
.comp-card-desc {
  font-size: 0.77rem;
  color: #94a3b8;
  line-height: 1.5;
  margin: 0;
  padding-left: 0.05rem;
}

.desc-mot {
  color: #cbd5e1;
}

.desc-comp {
  color: #cbd5e1;
}

/* Modal Dialog */
.comp-modal-backdrop {
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

.comp-modal-card {
  background: #111827;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--radius-lg);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.85);
  width: 100%;
  max-width: 520px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: border-color var(--trans-fast);
}

.comp-modal-card.theme-motivation {
  border-color: rgba(168, 85, 247, 0.4);
}

.comp-modal-card.theme-complication {
  border-color: rgba(244, 63, 94, 0.4);
}

.comp-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1.15rem;
  border-bottom: 1px solid var(--border-subtle);
}

.theme-motivation .comp-modal-header {
  background: rgba(168, 85, 247, 0.08);
}

.theme-motivation .comp-modal-header h4 i {
  color: #c084fc;
}

.theme-complication .comp-modal-header {
  background: rgba(244, 63, 94, 0.08);
}

.theme-complication .comp-modal-header h4 i {
  color: #fb7185;
}

.comp-modal-header h4 {
  font-size: 0.95rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.comp-modal-close {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  padding: 0.2rem;
  transition: all var(--trans-fast);
}

.comp-modal-close:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.08);
}

.comp-modal-body {
  padding: 1.15rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  max-height: 75vh;
  overflow-y: auto;
}

/* Modal Switcher */
.comp-segmented-switcher {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.4rem;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-md);
  padding: 0.3rem;
}

.segmented-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.55rem 0.5rem;
  border-radius: calc(var(--radius-md) - 2px);
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--trans-fast);
  text-align: left;
}

.segmented-btn i {
  font-size: 1.15rem;
}

.segmented-texts {
  display: flex;
  flex-direction: column;
}

.seg-title {
  font-size: 0.78rem;
  font-weight: 700;
}

.seg-sub {
  font-size: 0.65rem;
  opacity: 0.7;
}

.segmented-btn:hover {
  background: rgba(255, 255, 255, 0.04);
  color: #ffffff;
}

.segmented-btn.active.btn-sw-mot {
  background: rgba(168, 85, 247, 0.2);
  border-color: rgba(168, 85, 247, 0.45);
  color: #d8b4fe;
}

.segmented-btn.active.btn-sw-comp {
  background: rgba(244, 63, 94, 0.2);
  border-color: rgba(244, 63, 94, 0.45);
  color: #fda4af;
}

.comp-form-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.comp-form-group label {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.comp-form-group select,
.comp-form-group input,
.comp-form-group textarea {
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: #ffffff;
  padding: 0.5rem 0.7rem;
  font-size: 0.82rem;
  font-family: inherit;
  outline: none;
  transition: border-color var(--trans-fast);
}

.comp-form-group select:focus,
.comp-form-group input:focus,
.comp-form-group textarea:focus {
  border-color: #a855f7;
}

.comp-form-group select:focus-visible,
.comp-form-group input:focus-visible,
.comp-form-group textarea:focus-visible {
  outline: 2px solid var(--accent-secondary, #2a8fd6);
  outline-offset: 2px;
}

.theme-complication .comp-form-group select:focus,
.theme-complication .comp-form-group input:focus,
.theme-complication .comp-form-group textarea:focus {
  border-color: #f43f5e;
}

/* Preset Deck */
.comp-presets-box {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.presets-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.presets-title {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.presets-chips-deck {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  max-height: 110px;
  overflow-y: auto;
  padding: 0.15rem;
}

.preset-chip {
  font-size: 0.68rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  transition: all var(--trans-fast);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--text-secondary);
}

.preset-chip.chip-motivation:hover {
  background: rgba(168, 85, 247, 0.2);
  border-color: #a855f7;
  color: #d8b4fe;
}

.preset-chip.chip-complication:hover {
  background: rgba(244, 63, 94, 0.2);
  border-color: #f43f5e;
  color: #fda4af;
}

/* Modal Footer */
.comp-modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.65rem;
  padding: 0.75rem 1.15rem;
  background: rgba(11, 15, 23, 0.65);
  border-top: 1px solid var(--border-subtle);
}

.btn-cancel {
  background: transparent;
  border: 1px solid var(--border-subtle);
  color: var(--text-muted);
  padding: 0.4rem 0.85rem;
  border-radius: var(--radius-sm);
  font-size: 0.78rem;
  cursor: pointer;
  transition: all var(--trans-fast);
}

.btn-cancel:hover {
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.25);
}

.btn-save {
  padding: 0.4rem 0.95rem;
  border-radius: var(--radius-sm);
  font-size: 0.78rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  cursor: pointer;
  transition: all var(--trans-fast);
  border: 1px solid transparent;
}

.btn-save-mot {
  background: #a855f7;
  border-color: #c084fc;
  color: #ffffff;
}

.btn-save-mot:hover {
  background: #9333ea;
}

.btn-save-comp {
  background: #f43f5e;
  border-color: #fb7185;
  color: #ffffff;
}

.btn-save-comp:hover {
  background: #e11d48;
}
</style>
