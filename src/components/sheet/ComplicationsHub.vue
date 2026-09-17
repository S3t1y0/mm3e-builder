<template>
  <div class="complications-hub">
    <!-- Toolbar Header -->
    <div class="dndb-pane-toolbar">
      <div class="dndb-pane-info">
        <div class="dndb-pane-title-wrap">
          <i class="ri-shield-star-line pane-icon"></i>
          <span class="dndb-pane-title">Motivations & Complications</span>
        </div>
        <div class="comp-summary-counts">
          <span class="count-badge count-motivation">
            <i class="ri-compass-3-line"></i>
            {{ motivations.length }} Motivation{{ motivations.length === 1 ? '' : 's' }}
          </span>
          <span class="count-divider">•</span>
          <span class="count-badge count-complication">
            <i class="ri-alert-line"></i>
            {{ generalComplications.length }} Complication{{ generalComplications.length === 1 ? '' : 's' }}
          </span>
        </div>
      </div>
      <div class="dndb-pane-actions">
        <button type="button" class="btn-action-motivation" @click="openAdd('motivation')">
          <i class="ri-compass-3-line"></i> + Add Motivation
        </button>
        <button type="button" class="btn-action-complication" @click="openAdd('complication')">
          <i class="ri-add-line"></i> + Add Complication
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
          Awarded by the GM when complications hinder your hero. Spend anytime to turn the tide.
        </p>
      </div>
    </div>

    <!-- Empty State when nothing is defined -->
    <div v-if="allComplications.length === 0" class="comp-empty-state">
      <div class="comp-empty-icon"><i class="ri-shield-star-line"></i></div>
      <h4 class="comp-empty-title">No Motivations or Complications Defined</h4>
      <p class="comp-empty-desc">
        In Mutants & Masterminds 3rd Edition, every hero needs at least <strong>1 Heroic Motivation</strong> and <strong>1 Dramatic Complication</strong> to fuel story drama and earn <strong>Hero Points</strong>.
      </p>
      <div class="comp-preset-quick-row">
        <button type="button" class="comp-preset-btn motivation" @click="quickAdd('Motivation', 'Justice', 'Driven by an unwavering need to bring wrongdoers to justice.')">
          <i class="ri-scales-3-line"></i> + Justice (Motivation)
        </button>
        <button type="button" class="comp-preset-btn motivation" @click="quickAdd('Motivation', 'Responsibility', 'Believes that great power carries an absolute moral duty to protect others.')">
          <i class="ri-shield-user-line"></i> + Responsibility (Motivation)
        </button>
        <button type="button" class="comp-preset-btn complication" @click="quickAdd('Secret Identity', 'Secret Identity', 'Must protect mundane personal life and civilian career from villains.')">
          <i class="ri-spy-line"></i> + Secret Identity
        </button>
        <button type="button" class="comp-preset-btn complication" @click="quickAdd('Enemy', 'Arch-Nemesis', 'Targeted by a recurring nemesis or criminal syndicate dedicated to your downfall.')">
          <i class="ri-skull-line"></i> + Enemy
        </button>
        <button type="button" class="comp-preset-btn complication" @click="quickAdd('Weakness', 'Weakness', 'Vulnerable to a specific substance, mineral, or frequency that bypasses defenses.')">
          <i class="ri-radioactive-line"></i> + Weakness
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
            <span>HEROIC MOTIVATIONS</span>
            <span class="comp-group-count">{{ motivations.length }}</span>
          </div>
          <button type="button" class="btn-subtle-add-mot" @click="openAdd('motivation')">
            <i class="ri-add-line"></i> Add Motivation
          </button>
        </div>

        <div v-if="motivations.length === 0" class="comp-group-empty">
          <i class="ri-compass-3-line"></i>
          <span>No motivation specified. Choose what moral conviction drives your hero to risk everything.</span>
        </div>

        <div v-else class="comp-items-grid">
          <article
            v-for="item in motivations"
            :key="item.id"
            class="comp-card card-motivation"
          >
            <div class="comp-card-top">
              <div class="comp-badge-row">
                <span class="comp-category-badge badge-motivation">
                  <i :class="getComplicationIcon(item)"></i>
                  MOTIVATION
                </span>
              </div>
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

            <h4 class="comp-name">{{ item.name }}</h4>

            <div v-if="item.desc" class="comp-narrative-quote">
              <p class="comp-desc">{{ item.desc }}</p>
            </div>
          </article>
        </div>
      </section>

      <!-- 2. Dramatic Complications Section -->
      <section class="comp-group-section complication-group">
        <div class="comp-group-header">
          <div class="comp-group-title">
            <i class="ri-alert-fill group-icon"></i>
            <span>DRAMATIC COMPLICATIONS & FLAWS</span>
            <span class="comp-group-count">{{ generalComplications.length }}</span>
          </div>
          <button type="button" class="btn-subtle-add-comp" @click="openAdd('complication')">
            <i class="ri-add-line"></i> Add Complication
          </button>
        </div>

        <div v-if="generalComplications.length === 0" class="comp-group-empty">
          <i class="ri-alert-line"></i>
          <span>No complications defined yet. Add enemies, quirks, secret identities, or personal flaws to earn Hero Points.</span>
        </div>

        <div v-else class="comp-items-grid">
          <article
            v-for="item in generalComplications"
            :key="item.id"
            class="comp-card card-complication"
          >
            <div class="comp-card-top">
              <div class="comp-badge-row">
                <span class="comp-category-badge badge-complication">
                  <i :class="getComplicationIcon(item)"></i>
                  {{ getCategoryLabel(item) }}
                </span>
              </div>

              <div class="comp-card-actions">
                <!-- Tactical Trigger Action: Earn +1 HP in play -->
                <button
                  type="button"
                  class="btn-trigger-hp"
                  @click="triggerComplication(item)"
                  title="Complication triggered in story! Awards +1 Hero Point"
                >
                  <i class="ri-flashlight-fill"></i>
                  <span>Trigger (+1 HP)</span>
                </button>

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

            <h4 class="comp-name">{{ item.name }}</h4>

            <div v-if="item.desc" class="comp-narrative-quote">
              <p class="comp-desc">{{ item.desc }}</p>
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
                {{ formKind === 'motivation' ? 'Heroic Motivation' : 'Dramatic Complication' }}
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
                  <span class="seg-title">Heroic Motivation</span>
                  <span class="seg-sub">Core Drive & Purpose</span>
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
                  <span class="seg-title">Dramatic Complication</span>
                  <span class="seg-sub">Narrative Flaw (+1 HP)</span>
                </div>
              </button>
            </div>

            <!-- Complication Category Selector -->
            <div v-if="formKind === 'complication'" class="comp-form-group">
              <label for="comp-category-select">Complication Category</label>
              <select id="comp-category-select" v-model="formType" @change="onCategoryChange">
                <option value="Complication">General Complication / Flaw</option>
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
                <option value="Motivation">Motivation (Flawed)</option>
                <option value="Obsession">Obsession / Mania</option>
                <option value="Prejudice">Prejudice / Outcast</option>
                <option value="Quirk">Quirk / Idiosyncrasy</option>
                <option value="Reputation">Reputation / Notoriety</option>
                <option value="Rivalry">Rivalry / Competitive Feud</option>
                <option value="Secret">Secret / Dark Truth</option>
                <option value="Temper">Temper / Berserk Fury</option>
              </select>
            </div>

            <!-- Name / Title Input -->
            <div class="comp-form-group">
              <label for="comp-name-input">
                {{ formKind === 'motivation' ? 'Motivation Title / Conviction *' : 'Name / Descriptor *' }}
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
                  <i class="ri-magic-line"></i> Quick Catalog Presets (Click to fill):
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
              <label for="comp-desc-textarea">
                {{ formKind === 'motivation' ? 'Moral Creed & Driving Conviction' : 'Description & Story Hook' }}
              </label>
              <textarea
                id="comp-desc-textarea"
                v-model="formDesc"
                rows="3"
                :placeholder="formKind === 'motivation' ? 'Describe what moral code or tragedy drives your hero to put their life on the line...' : 'Explain how this obstacle creates drama in roleplay to earn you Hero Points...'"
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
  findComplicationPreset
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

// Computed Lists
const allComplications = computed(() => {
  return heroStore.character.complications || [];
});

const motivations = computed(() => {
  return allComplications.value.filter(c => (c.type || '').toLowerCase() === 'motivation');
});

const generalComplications = computed(() => {
  return allComplications.value.filter(c => (c.type || '').toLowerCase() !== 'motivation');
});

const activeCatalogPresets = computed(() => {
  return formKind.value === 'motivation' ? MOTIVATIONS_CATALOG : COMPLICATIONS_CATALOG;
});

// Category & Icon Resolution
function getComplicationIcon(comp) {
  if (!comp) return 'ri-alert-line';
  const typeStr = (comp.type || '').toLowerCase();
  if (typeStr === 'motivation') {
    const p = findComplicationPreset(comp.name);
    return p?.icon || 'ri-compass-3-line';
  }
  const p = findComplicationPreset(comp.type) || findComplicationPreset(comp.name);
  return p?.icon || 'ri-alert-line';
}

function getCategoryLabel(comp) {
  if (!comp) return 'COMPLICATION';
  const typeStr = (comp.type || '').toLowerCase();
  if (typeStr === 'motivation') return 'MOTIVATION';
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

// Complication Gameplay Trigger
function triggerComplication(item) {
  heroStore.adjustHeroPoints(1);

  sendFeatureToVTT({
    name: `⚡ Complication Triggered: ${item.name}`,
    category: 'complication_award',
    type: item.type || 'Complication',
    subtype: item.name || '',
    description: `**${item.name}** was triggered in the story!\nThe GM awards **+1 Hero Point** to fuel heroic effort.\n\n*${item.desc || ''}*`,
    details: `Triggered • +1 Hero Point`
  }, heroStore.character);

  uiStore.showToast(`Triggered "${item.name}"! Awarded +1 Hero Point!`, 'success');
}

// Modal Handlers
function openAdd(kind = 'motivation') {
  isEditing.value = false;
  editingId.value = null;
  formKind.value = kind;
  formType.value = kind === 'motivation' ? 'Motivation' : 'Complication';
  formName.value = '';
  formDesc.value = '';
  showModal.value = true;
}

function openEdit(item) {
  isEditing.value = true;
  editingId.value = item.id;
  const isMot = (item.type || '').toLowerCase() === 'motivation';
  formKind.value = isMot ? 'motivation' : 'complication';
  formType.value = item.type || (isMot ? 'Motivation' : 'Complication');
  formName.value = item.name || '';
  formDesc.value = item.desc || '';
  showModal.value = true;
}

function switchKind(kind) {
  formKind.value = kind;
  if (kind === 'motivation') {
    formType.value = 'Motivation';
  } else if (formType.value === 'Motivation') {
    formType.value = 'Complication';
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
  const comps = heroStore.character.complications || [];
  const idx = comps.findIndex(c => c.id === id || c.name === name);
  if (idx !== -1) {
    heroStore.removeComplication(idx);
    uiStore.showToast(`Removed "${name}"`, 'info');
  }
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

/* Toolbar Header */
.dndb-pane-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: 0.25rem 0.15rem;
}

.dndb-pane-info {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.65rem;
}

.dndb-pane-title-wrap {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.pane-icon {
  font-size: 1.15rem;
  color: #f59e0b;
}

.dndb-pane-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.comp-summary-counts {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.74rem;
}

.count-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: 700;
  padding: 0.15rem 0.45rem;
  border-radius: var(--radius-sm);
}

.count-badge.count-motivation {
  background: rgba(245, 158, 11, 0.12);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.count-badge.count-complication {
  background: rgba(239, 68, 68, 0.12);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.count-divider {
  color: var(--text-muted);
}

.dndb-pane-actions {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.btn-action-motivation {
  background: rgba(245, 158, 11, 0.14);
  border: 1px solid rgba(245, 158, 11, 0.4);
  color: #fbbf24;
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

.btn-action-motivation:hover {
  background: #f59e0b;
  color: #0b0f17;
}

.btn-action-complication {
  background: #dc2626;
  border: 1px solid #ef4444;
  color: #ffffff;
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

.btn-action-complication:hover {
  background: #ef4444;
}

/* Tactical Hero Points HUD */
.comp-hp-hud {
  display: flex;
  align-items: center;
  gap: 1.15rem;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(17, 24, 39, 0.6) 100%);
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
  font-size: 0.65rem;
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
  line-height: 1.4;
}

.comp-preset-quick-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  margin-top: 0.5rem;
}

.comp-preset-btn {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.3rem 0.65rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  transition: all var(--trans-fast);
}

.comp-preset-btn.motivation {
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.35);
  color: #fbbf24;
}

.comp-preset-btn.motivation:hover {
  background: #f59e0b;
  color: #0b0f17;
}

.comp-preset-btn.complication {
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.35);
  color: #fca5a5;
}

.comp-preset-btn.complication:hover {
  background: #ef4444;
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
  color: #f59e0b;
}

.complication-group .comp-group-title .group-icon {
  color: #ef4444;
}

.comp-group-count {
  font-size: 0.65rem;
  background: rgba(255, 255, 255, 0.08);
  padding: 0.05rem 0.4rem;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
}

.btn-subtle-add-mot {
  background: transparent;
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: #fbbf24;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--trans-fast);
}

.btn-subtle-add-mot:hover {
  background: rgba(245, 158, 11, 0.18);
  color: #ffffff;
}

.btn-subtle-add-comp {
  background: transparent;
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--trans-fast);
}

.btn-subtle-add-comp:hover {
  background: rgba(239, 68, 68, 0.18);
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
  gap: 0.5rem;
  transition: all var(--trans-fast);
  position: relative;
}

.card-motivation {
  border-left: 3px solid #f59e0b;
}

.card-motivation:hover {
  border-color: rgba(245, 158, 11, 0.45);
  background: rgba(23, 33, 53, 0.75);
}

.card-complication {
  border-left: 3px solid #ef4444;
}

.card-complication:hover {
  border-color: rgba(239, 68, 68, 0.45);
  background: rgba(29, 21, 28, 0.75);
}

.comp-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.comp-badge-row {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.comp-category-badge {
  font-size: 0.65rem;
  font-weight: 800;
  padding: 0.15rem 0.45rem;
  border-radius: var(--radius-sm);
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  letter-spacing: 0.04em;
}

.badge-motivation {
  background: rgba(245, 158, 11, 0.14);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.badge-complication {
  background: rgba(239, 68, 68, 0.14);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.comp-card-actions {
  display: flex;
  align-items: center;
  gap: 0.2rem;
}

.btn-trigger-hp {
  background: rgba(245, 158, 11, 0.16);
  border: 1px solid rgba(245, 158, 11, 0.45);
  color: #fbbf24;
  font-size: 0.68rem;
  font-weight: 800;
  padding: 0.18rem 0.45rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  transition: all var(--trans-fast);
  margin-right: 0.25rem;
}

.btn-trigger-hp:hover {
  background: #f59e0b;
  color: #0b0f17;
  transform: translateY(-1px);
}

.card-act-btn {
  width: 28px;
  height: 28px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  cursor: pointer;
  font-size: 0.85rem;
  border-radius: var(--radius-sm);
  transition: all var(--trans-fast);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.card-act-btn:active {
  transform: scale(0.93);
}

.card-act-btn:hover {
  color: #60a5fa;
  background: rgba(59, 130, 246, 0.16);
  border-color: rgba(59, 130, 246, 0.45);
}

.card-act-btn.btn-delete:hover {
  color: #fca5a5;
  background: rgba(239, 68, 68, 0.18);
  border-color: rgba(239, 68, 68, 0.5);
}

.comp-name {
  font-size: 0.92rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0;
  line-height: 1.3;
}

.comp-narrative-quote {
  background: rgba(0, 0, 0, 0.25);
  border-left: 2px solid rgba(255, 255, 255, 0.15);
  padding: 0.4rem 0.65rem;
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
}

.card-motivation .comp-narrative-quote {
  border-left-color: rgba(245, 158, 11, 0.4);
}

.card-complication .comp-narrative-quote {
  border-left-color: rgba(239, 68, 68, 0.4);
}

.comp-desc {
  font-size: 0.76rem;
  color: var(--text-secondary);
  line-height: 1.45;
  margin: 0;
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
  border-color: rgba(245, 158, 11, 0.4);
}

.comp-modal-card.theme-complication {
  border-color: rgba(239, 68, 68, 0.4);
}

.comp-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1.15rem;
  border-bottom: 1px solid var(--border-subtle);
}

.theme-motivation .comp-modal-header {
  background: rgba(245, 158, 11, 0.08);
}

.theme-motivation .comp-modal-header h4 i {
  color: #fbbf24;
}

.theme-complication .comp-modal-header {
  background: rgba(239, 68, 68, 0.08);
}

.theme-complication .comp-modal-header h4 i {
  color: #f87171;
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
  background: rgba(245, 158, 11, 0.18);
  border-color: rgba(245, 158, 11, 0.45);
  color: #fbbf24;
}

.segmented-btn.active.btn-sw-comp {
  background: rgba(239, 68, 68, 0.18);
  border-color: rgba(239, 68, 68, 0.45);
  color: #fca5a5;
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
  border-color: #f59e0b;
}

.theme-complication .comp-form-group select:focus,
.theme-complication .comp-form-group input:focus,
.theme-complication .comp-form-group textarea:focus {
  border-color: #ef4444;
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
  background: rgba(245, 158, 11, 0.2);
  border-color: #f59e0b;
  color: #fbbf24;
}

.preset-chip.chip-complication:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: #ef4444;
  color: #fca5a5;
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
  background: #f59e0b;
  border-color: #fbbf24;
  color: #0b0f17;
}

.btn-save-mot:hover {
  background: #d97706;
}

.btn-save-comp {
  background: #dc2626;
  border-color: #ef4444;
  color: #ffffff;
}

.btn-save-comp:hover {
  background: #b91c1c;
}
</style>
