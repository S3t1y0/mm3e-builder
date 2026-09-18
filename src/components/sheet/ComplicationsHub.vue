<template>
  <div class="complications-hub">
    <!-- Toolbar Header -->
    <div class="comp-toolbar">
      <div class="comp-toolbar-left">
        <div class="comp-title-wrap">
          <i class="ri-shield-star-line comp-title-icon"></i>
          <span class="comp-title-text">Motivations & Complications</span>
        </div>

        <!-- Official M&M 3e Rules Status Pill -->
        <div
          class="comp-rules-status"
          :class="narrativeStatus.isValid ? 'status-met' : 'status-pending'"
          :title="narrativeStatus.message"
        >
          <i :class="narrativeStatus.isValid ? 'ri-shield-check-fill' : 'ri-error-warning-fill'"></i>
          <span v-if="narrativeStatus.isValid">
            Rules Met ({{ motivations.length }} Motivation, {{ generalComplications.length }} Complications)
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

      <div class="comp-toolbar-actions">
        <button
          type="button"
          class="btn-action-add btn-action-mot"
          @click="openAdd('motivation')"
          title="Add a motivation"
        >
          <i class="ri-compass-3-line"></i>
          <span>Add Motivation</span>
        </button>
        <button
          type="button"
          class="btn-action-add btn-action-comp"
          @click="openAdd('complication')"
          title="Add a complication"
        >
          <i class="ri-alert-line"></i>
          <span>Add Complication</span>
        </button>
      </div>
    </div>

    <!-- Tactical Hero Points HUD -->
    <div class="comp-hp-hud">
      <div class="hp-stepper-block">
        <span class="hp-label">HERO POINTS</span>
        <div class="hp-stepper">
          <button
            type="button"
            class="hp-btn-step hp-btn-minus"
            :disabled="(heroStore.character.heroPoints || 0) <= 0"
            @click="adjustHeroPoints(-1)"
            title="Spend 1 Hero Point"
            aria-label="Spend 1 Hero Point"
          >
            <i class="ri-subtract-line"></i>
          </button>
          <div class="hp-token-badge" title="Current Hero Points balance">
            <i class="ri-copper-diamond-fill hp-token-icon"></i>
            <span class="hp-token-count">{{ heroStore.character.heroPoints || 0 }}</span>
          </div>
          <button
            type="button"
            class="hp-btn-step hp-btn-plus"
            @click="adjustHeroPoints(1)"
            title="Award +1 Hero Point"
            aria-label="Award +1 Hero Point"
          >
            <i class="ri-add-line"></i>
          </button>
        </div>
      </div>

      <div class="hp-mechanics-guide">
        <p class="hp-guide-desc">
          Earned when your <span class="text-mot-accent">motivation</span> creates a dilemma or
          <span class="text-comp-accent">complication</span> causes trouble.
          Spend on re-rolls, recovery, or extra effort.
        </p>
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
          <i class="ri-radioactive-line"></i> Weakness
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
                <div class="comp-icon-indicator indicator-mot" title="Heroic Motivation">
                  <i :class="getComplicationIcon(item)"></i>
                </div>
                <h4 class="comp-name">{{ item.name }}</h4>
              </div>

              <!-- Secondary Actions -->
              <div class="comp-card-actions">
                <button
                  type="button"
                  class="card-act-btn"
                  @click="openEdit(item)"
                  title="Edit motivation"
                  aria-label="Edit motivation"
                >
                  <i class="ri-edit-line"></i>
                </button>
                <button
                  type="button"
                  class="card-act-btn"
                  @click="broadcastComplication(item)"
                  title="Broadcast to Roll20 / VTT"
                  aria-label="Broadcast to Roll20"
                >
                  <i class="ri-broadcast-line"></i>
                </button>
                <button
                  type="button"
                  class="card-act-btn"
                  @click="copyText(item)"
                  title="Copy text to clipboard"
                  aria-label="Copy text"
                >
                  <i class="ri-file-copy-line"></i>
                </button>
                <button
                  type="button"
                  class="card-act-btn btn-delete"
                  @click="removeComp(item.id, item.name)"
                  title="Delete motivation"
                  aria-label="Delete motivation"
                >
                  <i class="ri-delete-bin-line"></i>
                </button>
              </div>
            </div>

            <!-- Creed / Narrative Description -->
            <div v-if="item.desc" class="comp-narrative-quote quote-mot">
              <p class="comp-desc">{{ item.desc }}</p>
            </div>

            <!-- Primary Action: Trigger (+1 HP) -->
            <div class="comp-card-bottom">
              <button
                type="button"
                class="btn-trigger-hp trigger-motivation"
                @click="triggerTrait(item)"
                title="Award +1 Hero Point when this motivation creates a dilemma or setback"
              >
                <i class="ri-flashlight-fill"></i>
                <span>Trigger (+1 HP)</span>
              </button>
            </div>
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
                <span class="comp-category-tag">
                  <i :class="getComplicationIcon(item)"></i>
                  {{ getCategoryLabel(item) }}
                </span>
                <h4 class="comp-name">{{ item.name }}</h4>
              </div>

              <!-- Secondary Actions -->
              <div class="comp-card-actions">
                <button
                  type="button"
                  class="card-act-btn"
                  @click="openEdit(item)"
                  title="Edit complication"
                  aria-label="Edit complication"
                >
                  <i class="ri-edit-line"></i>
                </button>
                <button
                  type="button"
                  class="card-act-btn"
                  @click="broadcastComplication(item)"
                  title="Broadcast to Roll20 / VTT"
                  aria-label="Broadcast to Roll20"
                >
                  <i class="ri-broadcast-line"></i>
                </button>
                <button
                  type="button"
                  class="card-act-btn"
                  @click="copyText(item)"
                  title="Copy text to clipboard"
                  aria-label="Copy text"
                >
                  <i class="ri-file-copy-line"></i>
                </button>
                <button
                  type="button"
                  class="card-act-btn btn-delete"
                  @click="removeComp(item.id, item.name)"
                  title="Delete complication"
                  aria-label="Delete complication"
                >
                  <i class="ri-delete-bin-line"></i>
                </button>
              </div>
            </div>

            <!-- Hazard / Story Hook Description -->
            <div v-if="item.desc" class="comp-narrative-quote quote-comp">
              <p class="comp-desc">{{ item.desc }}</p>
            </div>

            <!-- Primary Tactical Action: Trigger (+1 HP) -->
            <div class="comp-card-bottom">
              <button
                type="button"
                class="btn-trigger-hp trigger-complication"
                @click="triggerTrait(item)"
                title="Award +1 Hero Point when this complication causes trouble"
              >
                <i class="ri-flashlight-fill"></i>
                <span>Trigger (+1 HP)</span>
              </button>
            </div>
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
                  <i class="ri-magic-line"></i> Presets:
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
                  :title="preset.summary"
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
      name: `⚡ Motivation: ${item.name}`,
      category: 'motivation_award',
      type: 'Motivation',
      subtype: item.name || '',
      description: `Motivation: **${item.name}** created a dilemma. GM awarded 1 Hero Point.\n\n${item.desc || ''}`,
      details: `Motivation • +1 Hero Point`
    }, heroStore.character);

    uiStore.showToast(`Triggered "${item.name}" (+1 Hero Point)`, 'success');
  } else {
    sendFeatureToVTT({
      name: `⚡ Complication: ${item.name}`,
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
  padding: 0.2rem 0;
}

.comp-toolbar-left {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
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

.comp-toolbar-actions {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.btn-action-add {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.35rem 0.75rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  transition: all var(--trans-fast);
}

.btn-action-mot {
  background: rgba(168, 85, 247, 0.14);
  border: 1px solid rgba(168, 85, 247, 0.4);
  color: #d8b4fe;
}

.btn-action-mot:hover {
  background: #a855f7;
  color: #ffffff;
  transform: translateY(-1px);
}

.btn-action-comp {
  background: rgba(244, 63, 94, 0.14);
  border: 1px solid rgba(244, 63, 94, 0.4);
  color: #fda4af;
}

.btn-action-comp:hover {
  background: #f43f5e;
  color: #ffffff;
  transform: translateY(-1px);
}

/* Tactical Hero Points HUD */
.comp-hp-hud {
  display: flex;
  align-items: center;
  gap: 1.15rem;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.09) 0%, rgba(17, 24, 39, 0.6) 100%);
  border: 1px solid rgba(245, 158, 11, 0.28);
  border-radius: var(--radius-md);
  padding: 0.65rem 1rem;
  flex-wrap: wrap;
}

.hp-stepper-block {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: center;
}

.hp-label {
  font-size: 0.64rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: #f59e0b;
  text-transform: uppercase;
}

.hp-stepper {
  display: inline-flex;
  align-items: center;
  background: rgba(11, 15, 23, 0.85);
  border: 1px solid rgba(245, 158, 11, 0.35);
  border-radius: var(--radius-sm);
  padding: 2px;
  gap: 3px;
}

.hp-btn-step {
  width: 26px;
  height: 26px;
  background: rgba(255, 255, 255, 0.06);
  border: none;
  border-radius: calc(var(--radius-sm) - 2px);
  color: #ffffff;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--trans-fast);
}

.hp-btn-step:hover:not(:disabled) {
  background: #f59e0b;
  color: #0b0f17;
}

.hp-btn-step:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.hp-token-badge {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0 0.55rem;
  min-width: 48px;
  justify-content: center;
}

.hp-token-icon {
  color: #fbbf24;
  font-size: 0.95rem;
}

.hp-token-count {
  font-size: 1.05rem;
  font-weight: 900;
  color: #ffffff;
  font-family: var(--font-mono, monospace);
}

.hp-mechanics-guide {
  flex: 1;
  min-width: 240px;
}

.hp-guide-desc {
  font-size: 0.76rem;
  color: var(--text-secondary);
  line-height: 1.45;
  margin: 0;
}

.text-mot-accent {
  color: #c084fc;
  font-weight: 700;
}

.text-comp-accent {
  color: #fb7185;
  font-weight: 700;
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

/* Cards Grid */
.comp-items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 0.75rem;
}

.comp-card {
  background: rgba(17, 24, 39, 0.55);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  transition: all var(--trans-fast);
  position: relative;
}

.card-motivation {
  border-left: 3px solid #a855f7;
}

.card-motivation:hover {
  border-color: rgba(168, 85, 247, 0.45);
  background: rgba(28, 23, 48, 0.75);
}

.card-complication {
  border-left: 3px solid #f43f5e;
}

.card-complication:hover {
  border-color: rgba(244, 63, 94, 0.45);
  background: rgba(36, 20, 30, 0.75);
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

.comp-icon-indicator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: var(--radius-xs);
  font-size: 0.85rem;
  margin-bottom: 0.2rem;
}

.indicator-mot {
  background: rgba(168, 85, 247, 0.16);
  border: 1px solid rgba(168, 85, 247, 0.3);
  color: #c084fc;
}

.comp-category-tag {
  font-size: 0.65rem;
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
}

.comp-name {
  font-size: 0.92rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0;
  line-height: 1.3;
}

.comp-card-actions {
  display: flex;
  align-items: center;
  gap: 0.2rem;
}

.card-act-btn {
  width: 26px;
  height: 26px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  cursor: pointer;
  font-size: 0.82rem;
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

.comp-narrative-quote {
  background: rgba(0, 0, 0, 0.25);
  padding: 0.45rem 0.65rem;
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
}

.quote-mot {
  border-left: 2px solid rgba(168, 85, 247, 0.4);
}

.quote-comp {
  border-left: 2px solid rgba(244, 63, 94, 0.4);
}

.comp-desc {
  font-size: 0.76rem;
  color: var(--text-secondary);
  line-height: 1.45;
  margin: 0;
}

/* Tactical Trigger Action Bottom */
.comp-card-bottom {
  display: flex;
  align-items: center;
  margin-top: auto;
  padding-top: 0.25rem;
}

.btn-trigger-hp {
  width: 100%;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 0.35rem 0.6rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  transition: all var(--trans-fast);
}

.trigger-motivation {
  background: rgba(168, 85, 247, 0.16);
  border: 1px solid rgba(168, 85, 247, 0.45);
  color: #d8b4fe;
}

.trigger-motivation:hover {
  background: #a855f7;
  border-color: #c084fc;
  color: #ffffff;
  transform: translateY(-1px);
}

.trigger-complication {
  background: rgba(244, 63, 94, 0.16);
  border: 1px solid rgba(244, 63, 94, 0.45);
  color: #fda4af;
}

.trigger-complication:hover {
  background: #f43f5e;
  border-color: #fb7185;
  color: #ffffff;
  transform: translateY(-1px);
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
