<template>
  <div v-if="effect" class="effect-editor-canvas">
    <!-- Header Banner of Canvas -->
    <div class="canvas-header">
      <div class="canvas-title-group">
        <span v-if="title" class="canvas-badge">{{ title }}</span>
        <h4 class="canvas-effect-name">{{ currentHeaderName }}</h4>
      </div>
      <div class="canvas-cost-pill">
        <span class="cost-calc-label">Cost:</span>
        <span class="cost-calc-val">{{ effectCost.totalCost }} PP</span>
      </div>
    </div>

    <!-- Contextual Linked Banner (When editing a Linked Effect) -->
    <div v-if="builderStore.isEditingLinkedEffect" class="canvas-linked-context-banner">
      <div class="linked-context-left">
        <span class="linked-context-badge">
          <i class="ri-links-line"></i>
          <span>Linked Effect</span>
        </span>
        <span class="linked-context-desc">
          Triggers simultaneously with <strong>{{ builderStore.currentLinkedParentEffect?.name || builderStore.currentLinkedParentEffect?.baseEffect || 'Primary Effect' }}</strong>
        </span>
      </div>
      <div class="linked-context-right">
        <span class="sync-lock-pill" title="Action and Range are synchronized with the parent effect">
          <i class="ri-lock-line"></i>
          <span>Action & Range Locked</span>
        </span>
        <button
          type="button"
          class="btn-unlink-current"
          @click="builderStore.removeLinkedEffect(null, builderStore.activeLinkedIndex)"
          title="Remove this linked effect"
        >
          <i class="ri-delete-bin-line"></i>
          <span>Remove Linked</span>
        </button>
      </div>
    </div>

    <!-- Core Effect Form Grid -->
    <div class="canvas-form-grid">
      <!-- 1. Compound Sub-Effect Identity & Role Bar (Only in Compound Component Mode) -->
      <div v-if="builderStore.isCompoundMode && (builderStore.activeTargetType === 'compound' || builderStore.activeTargetType === 'compound_linked') && builderStore.activeCompoundEffect" class="sub-effect-identity-bar span-full">
        <div class="sub-name-group">
          <label class="sub-name-label">
            <i class="ri-edit-line"></i>
            <span>Sub-Effect Name</span>
          </label>
          <input
            v-model="builderStore.activeCompoundEffect.name"
            type="text"
            class="sub-name-input"
            placeholder="e.g. Frostbite Damage, Hypothermia Affliction..."
          />
        </div>
        <div class="sub-role-actions">
          <button
            type="button"
            class="btn-primary-role"
            :class="{ active: builderStore.activeCompoundEffect.isPrimaryAction }"
            @click="builderStore.setPrimaryCompoundEffect(builderStore.activeCompoundIndex)"
            :title="builderStore.activeCompoundEffect.isPrimaryAction ? 'Current Primary Action Effect' : 'Designate as Primary Effect'"
          >
            <i :class="builderStore.activeCompoundEffect.isPrimaryAction ? 'ri-star-fill' : 'ri-star-line'"></i>
            <span>{{ builderStore.activeCompoundEffect.isPrimaryAction ? 'Primary Action Effect' : 'Make Primary' }}</span>
          </button>
        </div>
      </div>

      <!-- 2. Device Sub-Power Identity Bar (When editing a Device Sub-Power) -->
      <div v-else-if="builderStore.power.type === 'device' && builderStore.activeSubPower && !currentSlotRef && !builderStore.isEditingLinkedEffect" class="sub-effect-identity-bar span-full">
        <div class="sub-name-group">
          <label class="sub-name-label">
            <i class="ri-shield-keyhole-line"></i>
            <span>Device Sub-Power Name</span>
          </label>
          <input
            v-model="builderStore.activeSubPower.name"
            type="text"
            class="sub-name-input"
            placeholder="e.g. Chest Armor, Repulsor Cannon, Micro-Thrusters..."
          />
        </div>
      </div>

      <!-- 3. Alternate Slot Name & Capacity Bar -->
      <div v-else-if="currentSlotRef" class="sub-effect-identity-bar span-full slot-identity-container">
        <div class="sub-name-group">
          <label class="sub-name-label">
            <i class="ri-shuffle-line"></i>
            <span>{{ isCompoundSlot ? 'Compound Alternate Effect Name' : 'Alternate Effect Name' }}</span>
          </label>
          <input
            v-model="currentSlotRef.name"
            type="text"
            class="sub-name-input"
            placeholder="e.g. Heat Wave, Dazzle Flash..."
          />
        </div>

        <!-- Slot Capacity Meter / Warning -->
        <div v-if="builderStore.activeSlotContext" class="slot-capacity-pill" :class="{ 'is-overflow': builderStore.activeSlotContext.isOverflow }">
          <i :class="builderStore.activeSlotContext.isOverflow ? 'ri-error-warning-line' : 'ri-shield-check-line'"></i>
          <span class="capacity-text">
            Slot: <strong>{{ builderStore.activeSlotContext.slotValue }} PP</strong> / Cap: <strong>{{ builderStore.activeSlotContext.capacity }} PP</strong>
          </span>
          <span v-if="builderStore.activeSlotContext.isOverflow" class="overflow-tag">
            +{{ builderStore.activeSlotContext.slotValue - builderStore.activeSlotContext.capacity }} Overflow!
          </span>
        </div>
      </div>

      <!-- 4. Linked Effect Identity Bar (When editing a Linked Effect) -->
      <div v-else-if="builderStore.isEditingLinkedEffect" class="sub-effect-identity-bar span-full linked-identity-bar">
        <div class="sub-name-group">
          <label class="sub-name-label">
            <i class="ri-links-line"></i>
            <span>Linked Effect Name</span>
          </label>
          <input
            v-model="effect.name"
            type="text"
            class="sub-name-input"
            placeholder="e.g. Secondary Neurotoxin, Knockdown Impact..."
          />
        </div>
      </div>

      <!-- 5. Standard Power Primary Effect Display Name (Optional) -->
      <div v-else-if="builderStore.power.type === 'standard' && builderStore.activeTargetType === 'main' && !builderStore.isEditingLinkedEffect" class="sub-effect-identity-bar span-full">
        <div class="sub-name-group">
          <label class="sub-name-label">
            <i class="ri-edit-line"></i>
            <span>Effect Display Name (Optional)</span>
          </label>
          <input
            v-model="effect.name"
            type="text"
            class="sub-name-input"
            :placeholder="`e.g. Custom name for ${effect.baseEffect || 'Effect'}...`"
          />
        </div>
      </div>

      <!-- 3. Base Effect Hero Strip (Compact & Streamlined) -->
      <div class="base-effect-hero-strip span-full">
        <div class="hero-left">
          <div class="base-icon-box">
            <i :class="getEffectIcon(effect.baseEffect)"></i>
          </div>
          <div class="base-identity-info">
            <div class="base-title-row">
              <span class="base-effect-title">{{ effect.baseEffect || 'Damage' }}</span>
              <span class="badge-cat-tag">{{ currentBaseInfo?.category || 'Effect' }}</span>
              <span class="base-cost-tag">{{ currentBaseInfo?.cost || 1 }} PP / Rank</span>
            </div>
          </div>
          <button
            type="button"
            class="btn-catalog-trigger"
            @click="builderStore.openEffectsLibrary(effect)"
          >
            <i class="ri-book-open-line"></i>
            <span>Change Effect</span>
          </button>
        </div>

        <div class="hero-right">
          <!-- Rank Stepper with numeric typing -->
          <div class="rank-stepper-box">
            <span class="rank-lbl">Rank</span>
            <div class="rank-stepper-row">
              <button
                type="button"
                class="btn-step"
                :disabled="effect.ranks <= 1"
                @click="builderStore.updateEffectRank(effect, -1)"
                title="Decrease Rank"
              >
                <i class="ri-subtract-line"></i>
              </button>
              <input
                v-model.number="effect.ranks"
                type="number"
                min="1"
                max="30"
                class="rank-num-input"
              />
              <button
                type="button"
                class="btn-step"
                @click="builderStore.updateEffectRank(effect, 1)"
                title="Increase Rank"
              >
                <i class="ri-add-line"></i>
              </button>
            </div>
          </div>

          <!-- Rules Toggle -->
          <button
            type="button"
            class="btn-toggle-rules"
            :class="{ active: showRules }"
            @click="showRules = !showRules"
            title="Toggle Official M&M 3e Rules"
          >
            <i class="ri-book-read-line"></i>
            <span>{{ showRules ? 'Hide Rules' : 'M&M Rules' }}</span>
          </button>
        </div>
      </div>

      <!-- Collapsible Rules Drawer -->
      <div v-if="showRules" class="rules-collapsible-drawer span-full">
        <div class="rules-drawer-head">
          <i class="ri-file-list-3-line"></i>
          <span>Official Mechanics & Rules (DHH)</span>
        </div>
        <p class="rules-desc-text">{{ currentBaseInfo?.desc || 'Official M&M 3E base effect.' }}</p>
      </div>

      <!-- Combat Parameters Status Strip -->
      <div class="params-status-strip span-full">
        <div class="param-status-item">
          <span class="param-lbl">Action:</span>
          <span class="param-val">{{ effect.action || 'Standard' }}</span>
        </div>
        <div class="param-status-divider"></div>
        <div class="param-status-item">
          <span class="param-lbl">Range:</span>
          <span class="param-val">{{ effect.range || 'Close' }}</span>
        </div>
        <div class="param-status-divider"></div>
        <div class="param-status-item">
          <span class="param-lbl">Duration:</span>
          <span class="param-val">{{ effect.duration || 'Instant' }}</span>
        </div>
        <template v-if="hasResistanceCheck(effect)">
          <div class="param-status-divider"></div>
          <div class="param-status-item highlight">
            <span class="param-lbl">Resisted By:</span>
            <span class="param-val">{{ effect.resistance || 'Toughness' }}</span>
          </div>
        </template>
      </div>

      <!-- Effect Configurator (Enhanced Trait, Senses, Affliction, Illusion, Immunity, Movement, etc.) -->
      <EffectConfigurator :effect="effect" class="span-full" />
    </div>

    <!-- Modifiers Section (Extras & Flaws) -->
    <div class="canvas-modifiers-section">
      <div class="modifiers-section-header">
        <div class="sec-title">
          <i class="ri-tools-line"></i>
          <span>Applied Extras & Flaws</span>
        </div>
        <button
          type="button"
          class="btn-browse-mods"
          @click="builderStore.openModifierInspector(effect)"
        >
          <i class="ri-add-line"></i>
          <span>Browse Extras / Flaws</span>
        </button>
      </div>

      <!-- Applied Extras & Flaws (2-Column Grid) -->
      <div class="modifiers-two-col-grid">
        <!-- Extras Column -->
        <div class="mods-category-block">
          <div class="mods-block-header">
            <span class="mods-subhead extras-head">
              <i class="ri-add-circle-line"></i> Extras ({{ effect.extras?.length || 0 }})
            </span>
          </div>

          <div v-if="effect.extras && effect.extras.length > 0" class="applied-cards-grid">
            <div
              v-for="(extra, idx) in effect.extras"
              :key="extra.name + '_' + idx"
              class="modifier-card mod-card-extra"
            >
              <!-- Card Header: Title, Cost Badge, Delete -->
              <div class="mod-card-header">
                <div class="mod-card-identity">
                  <span class="mod-card-title">{{ extra.name }}</span>
                  <span v-if="extra.customText" class="mod-card-custom-preview">: {{ extra.customText }}</span>
                </div>
                <div class="mod-card-header-actions">
                  <span class="mod-card-cost extra-cost">
                    {{ formatModCost(extra, false) }}
                  </span>
                  <button
                    type="button"
                    class="mod-card-del-btn"
                    title="Remove Extra"
                    @click="builderStore.removeModifierFromTarget(effect, false, extra.id || idx)"
                  >
                    <i class="ri-close-line"></i>
                  </button>
                </div>
              </div>

              <!-- Card Body: Description of Effect & Rules -->
              <div class="mod-card-body">
                <p class="mod-card-desc">{{ getModifierMeta(extra, false).desc }}</p>

                <!-- Custom Player Specification Input -->
                <div
                  v-if="getModifierMeta(extra, false).hasCustomText || extra.customText !== undefined"
                  class="mod-custom-text-wrapper"
                >
                  <label class="mod-custom-text-label">
                    <i class="ri-edit-line"></i>
                    <span>{{ getModifierMeta(extra, false).customTextLabel || 'Specification / Detail:' }}</span>
                  </label>
                  <input
                    v-model="extra.customText"
                    type="text"
                    class="form-control form-control-sm mod-custom-input"
                    :placeholder="getModifierMeta(extra, false).customTextPlaceholder || 'Specify details...'"
                    @input="onModifierCustomTextInput(extra)"
                  />
                </div>

                <!-- Optional Variant Chips (if options exist) -->
                <div
                  v-if="getModifierMeta(extra, false).options?.length > 0"
                  class="mod-card-options-wrapper"
                >
                  <span class="mod-options-label">Active Variant:</span>
                  <div class="mod-options-pills">
                    <button
                      v-for="opt in getModifierMeta(extra, false).options"
                      :key="opt.id"
                      type="button"
                      class="mod-option-pill extra-opt"
                      :class="{ active: (getSelectedOptionId(extra) || getModifierMeta(extra, false).options[0]?.id) === opt.id }"
                      @click="setModifierOptionDirect(extra, opt)"
                    >
                      {{ opt.label }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Card Footer: Stepper & Subtotal impact -->
              <div class="mod-card-footer">
                <div v-if="extra.hasRanks || getModifierMeta(extra, false).hasRanks" class="mod-card-stepper">
                  <span class="stepper-label">Ranks:</span>
                  <div class="stepper-group">
                    <button
                      type="button"
                      class="step-btn"
                      :disabled="(extra.ranks || 1) <= 1"
                      @click="builderStore.stepModifierRank(extra, -1)"
                    >-</button>
                    <span class="step-value">R{{ extra.ranks || 1 }}</span>
                    <button
                      type="button"
                      class="step-btn"
                      @click="builderStore.stepModifierRank(extra, 1)"
                    >+</button>
                  </div>
                </div>
                <div v-else class="mod-card-flat-info">
                  <i class="ri-shield-flash-line"></i>
                  <span>Fixed Extra</span>
                </div>

                <div class="mod-card-subtotal">
                  <span class="subtotal-label">Subtotal:</span>
                  <span class="subtotal-val extra-text">
                    {{ calculateModSubtotal(extra, false) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="empty-mods-clean">
            <i class="ri-information-line"></i>
            <span>No extras applied.</span>
          </div>
        </div>

        <!-- Flaws Column -->
        <div class="mods-category-block">
          <div class="mods-block-header">
            <span class="mods-subhead flaws-head">
              <i class="ri-indeterminate-circle-line"></i> Flaws ({{ effect.flaws?.length || 0 }})
            </span>
          </div>

          <div v-if="effect.flaws && effect.flaws.length > 0" class="applied-cards-grid">
            <div
              v-for="(flaw, idx) in effect.flaws"
              :key="flaw.name + '_' + idx"
              class="modifier-card mod-card-flaw"
            >
              <!-- Card Header: Title, Cost Badge, Delete -->
              <div class="mod-card-header">
                <div class="mod-card-identity">
                  <span class="mod-card-title">{{ flaw.name }}</span>
                  <span v-if="flaw.customText" class="mod-card-custom-preview">: {{ flaw.customText }}</span>
                </div>
                <div class="mod-card-header-actions">
                  <span class="mod-card-cost flaw-cost">
                    {{ formatModCost(flaw, true) }}
                  </span>
                  <button
                    type="button"
                    class="mod-card-del-btn"
                    title="Remove Flaw"
                    @click="builderStore.removeModifierFromTarget(effect, true, flaw.id || idx)"
                  >
                    <i class="ri-close-line"></i>
                  </button>
                </div>
              </div>

              <!-- Card Body: Description of Effect & Rules -->
              <div class="mod-card-body">
                <p class="mod-card-desc">{{ getModifierMeta(flaw, true).desc }}</p>

                <!-- Custom Player Specification Input -->
                <div
                  v-if="getModifierMeta(flaw, true).hasCustomText || flaw.customText !== undefined"
                  class="mod-custom-text-wrapper"
                >
                  <label class="mod-custom-text-label">
                    <i class="ri-edit-line"></i>
                    <span>{{ getModifierMeta(flaw, true).customTextLabel || 'Specification / Detail:' }}</span>
                  </label>
                  <input
                    v-model="flaw.customText"
                    type="text"
                    class="form-control form-control-sm mod-custom-input"
                    :placeholder="getModifierMeta(flaw, true).customTextPlaceholder || 'Specify details...'"
                    @input="onModifierCustomTextInput(flaw)"
                  />
                </div>

                <!-- Optional Variant Chips (if options exist) -->
                <div
                  v-if="getModifierMeta(flaw, true).options?.length > 0"
                  class="mod-card-options-wrapper"
                >
                  <span class="mod-options-label">Active Variant:</span>
                  <div class="mod-options-pills">
                    <button
                      v-for="opt in getModifierMeta(flaw, true).options"
                      :key="opt.id"
                      type="button"
                      class="mod-option-pill flaw-opt"
                      :class="{ active: (getSelectedOptionId(flaw) || getModifierMeta(flaw, true).options[0]?.id) === opt.id }"
                      @click="setModifierOptionDirect(flaw, opt)"
                    >
                      {{ opt.label }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Card Footer: Stepper & Subtotal impact -->
              <div class="mod-card-footer">
                <div v-if="flaw.hasRanks || getModifierMeta(flaw, true).hasRanks" class="mod-card-stepper">
                  <span class="stepper-label">Ranks:</span>
                  <div class="stepper-group">
                    <button
                      type="button"
                      class="step-btn"
                      :disabled="(flaw.ranks || 1) <= 1"
                      @click="builderStore.stepModifierRank(flaw, -1)"
                    >-</button>
                    <span class="step-value">R{{ flaw.ranks || 1 }}</span>
                    <button
                      type="button"
                      class="step-btn"
                      @click="builderStore.stepModifierRank(flaw, 1)"
                    >+</button>
                  </div>
                </div>
                <div v-else class="mod-card-flat-info">
                  <i class="ri-alert-line"></i>
                  <span>Fixed Limitation</span>
                </div>

                <div class="mod-card-subtotal">
                  <span class="subtotal-label">Discount:</span>
                  <span class="subtotal-val flaw-text">
                    {{ calculateModSubtotal(flaw, true) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="empty-mods-clean">
            <i class="ri-information-line"></i>
            <span>No flaws applied.</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Effects Library Modal Mount -->
    <EffectsLibraryModal />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { usePowerBuilderStore } from '../../stores/powerBuilderStore.js';
import { useHeroStore } from '../../stores/heroStore.js';
import { BASE_EFFECTS, EXTRAS, FLAWS, calculateEffectCost, hasResistanceCheck, getBaseEffectIcon } from '../../rules/powerEngine.js';
import EffectsLibraryModal from './EffectsLibraryModal.vue';
import EffectConfigurator from './EffectConfigurator.vue';

const heroStore = useHeroStore();
const builderStore = usePowerBuilderStore();

const showRules = ref(true);


const isCompoundSlot = computed(() => {
  return builderStore.activeTargetType === 'compound_slot' || builderStore.activeTargetType === 'compound_slot_linked';
});

const currentSlotRef = computed(() => {
  if (builderStore.activeTargetType === 'slot' || builderStore.activeTargetType === 'slot_linked') {
    if (builderStore.power.type === 'device') {
      return builderStore.activeSubPower?.alternateEffects?.[builderStore.activeSlotIndex] || null;
    }
    return builderStore.power.alternateEffects?.[builderStore.activeSlotIndex] || null;
  }
  if (builderStore.activeTargetType === 'compound_slot' || builderStore.activeTargetType === 'compound_slot_linked') {
    return builderStore.activeCompoundEffect?.alternateEffects?.[builderStore.activeSlotIndex] || null;
  }
  return null;
});

const currentHeaderName = computed(() => {
  if (builderStore.power.type === 'device' && builderStore.activeSubPower && !currentSlotRef.value && !builderStore.isEditingLinkedEffect) {
    return builderStore.activeSubPower.name || builderStore.activeSubPower.effect?.baseEffect || 'Device Sub-Power';
  }
  if (builderStore.isCompoundMode && (builderStore.activeTargetType === 'compound' || builderStore.activeTargetType === 'compound_linked') && builderStore.activeCompoundEffect) {
    return builderStore.activeCompoundEffect.name || builderStore.activeCompoundEffect.effect?.baseEffect || 'Component Effect';
  }
  if (currentSlotRef.value) {
    return currentSlotRef.value.name || currentSlotRef.value.effect?.baseEffect || 'Alternate Effect';
  }
  return props.effect?.name || props.effect?.baseEffect || 'Effect';
});

function getEffectIcon(baseEffect) {
  return getBaseEffectIcon(baseEffect);
}

const props = defineProps({
  effect: {
    type: Object,
    required: true
  },
  title: {
    type: String,
    default: 'Effect Editor'
  }
});

const effectCategories = ['Attack', 'Control', 'Defense', 'General', 'Movement', 'Sensory'];

function getEffectsByCategory(category) {
  return BASE_EFFECTS.filter(b => b.category === category);
}

const effectCost = computed(() => {
  return calculateEffectCost(props.effect, 0);
});

const currentBaseInfo = computed(() => {
  return BASE_EFFECTS.find(b => b.name === props.effect.baseEffect) || {
    name: props.effect.baseEffect,
    category: 'Superhuman',
    cost: props.effect.baseCost || 1,
    desc: 'Superhuman base effect.'
  };
});

function handleBaseChange(newBase) {
  builderStore.setEffectBase(props.effect, newBase);
}

// Helpers for Applied Extras & Flaws Master-Detail Cards
function getModifierMeta(mod, isFlaw = false) {
  const catalog = isFlaw ? FLAWS : EXTRAS;
  const match = catalog.find(item => (item.name || '').toLowerCase() === (mod.name || '').toLowerCase());
  return {
    name: mod.name,
    category: mod.category || match?.category || (isFlaw ? 'Limitation' : 'Combat & Utility'),
    desc: mod.desc || match?.desc || 'Applies mechanical rules and modifications to this power effect.',
    options: match?.options || mod.options || [],
    hasConfig: match?.hasConfig || mod.hasConfig || false,
    hasRanks: mod.hasRanks ?? match?.hasRanks ?? false,
    hasCustomText: mod.hasCustomText ?? match?.hasCustomText ?? false,
    customTextLabel: mod.customTextLabel || match?.customTextLabel || 'Specification / Detail:',
    customTextPlaceholder: mod.customTextPlaceholder || match?.customTextPlaceholder || 'Specify details...',
    costDisplay: match?.costDisplay || ''
  };
}

function onModifierCustomTextInput(mod) {
  if (mod) {
    if (!mod.config) mod.config = {};
    mod.config.customText = mod.customText;
    heroStore.pushHistory();
  }
}

function getSelectedOptionId(mod) {
  return mod?.config?.optionId || mod?.optionId || null;
}

function setModifierOptionDirect(mod, opt) {
  mod.config = mod.config || {};
  mod.config.optionId = opt.id;
  if (opt.cost !== undefined) mod.cost = opt.cost;
  if (opt.type !== undefined) mod.type = opt.type;
}

function formatModCost(mod, isFlaw = false) {
  const cost = Number(mod.cost) || 0;
  const prefix = (!isFlaw && cost >= 0) ? `+${cost}` : `${cost}`;
  if (mod.type === 'per_rank') return `${prefix} PP/R`;
  if (mod.type === 'flat_per_rank') return `${prefix} Flat/R`;
  return `${prefix} Flat`;
}

function calculateModSubtotal(mod, isFlaw = false) {
  const ranks = Number(mod.ranks) || 1;
  const cost = Number(mod.cost) || 0;
  if (mod.type === 'per_rank') {
    return isFlaw ? `${cost} PP/Rank` : `+${cost} PP/Rank`;
  }
  if (mod.type === 'flat_per_rank') {
    const total = cost * ranks;
    return isFlaw ? `${total} PP Flat` : `+${total} PP Flat`;
  }
  return isFlaw ? `${cost} PP Flat` : `+${cost} PP Flat`;
}
</script>

<style scoped>
.effect-editor-canvas {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1.15rem;
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
}

.canvas-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-subtle);
  padding-bottom: 0.75rem;
}

.canvas-title-group {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.canvas-badge {
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--accent-primary);
  letter-spacing: 0.06em;
}

.canvas-effect-name {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
}

.canvas-cost-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: rgba(0, 111, 184, 0.1);
  border: 1px solid rgba(0, 111, 184, 0.25);
  padding: 0.25rem 0.65rem;
  border-radius: var(--radius-xs);
}

.cost-calc-label {
  font-size: 0.7rem;
  color: var(--text-muted);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.cost-calc-val {
  font-size: 0.88rem;
  font-weight: 900;
  color: var(--accent-primary);
  font-variant-numeric: tabular-nums;
}

/* Compound & Stunt Sub-Effect Identity Bar */
.sub-effect-identity-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  background: rgba(0, 111, 184, 0.08);
  border: 1px solid rgba(0, 111, 184, 0.25);
  border-radius: var(--radius-sm);
  padding: 0.55rem 0.85rem;
  flex-wrap: wrap;
}

.sub-name-group {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex: 1;
  min-width: 240px;
}

.sub-name-label {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-secondary);
  white-space: nowrap;
}

.sub-name-input {
  flex: 1;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xs);
  color: var(--text-primary);
  font-size: 0.82rem;
  font-weight: 700;
  padding: 0.35rem 0.6rem;
  outline: none;
  transition: all var(--trans-fast);
}

.sub-name-input:focus {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 1px rgba(0, 111, 184, 0.3);
}

.sub-role-actions {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.btn-primary-role {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.65rem;
  font-size: 0.72rem;
  font-weight: 700;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xs);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--trans-fast);
}

.btn-primary-role.active {
  background: rgba(234, 179, 8, 0.15);
  border-color: #eab308;
  color: #fde047;
}

/* Base Effect Hero Strip */
.base-effect-hero-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 0.75rem 1rem;
  flex-wrap: wrap;
}

.hero-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.base-icon-box {
  width: 38px;
  height: 38px;
  background: rgba(0, 111, 184, 0.12);
  border: 1px solid rgba(0, 111, 184, 0.35);
  color: var(--accent-secondary);
  border-radius: var(--radius-xs);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.base-title-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.base-effect-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text-primary);
}

.badge-cat-tag {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-secondary);
  padding: 0.15rem 0.4rem;
  border-radius: var(--radius-xs);
}

.base-cost-tag {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--accent-secondary);
  font-family: var(--font-mono);
}

.btn-catalog-trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  background: rgba(0, 111, 184, 0.14);
  border: 1px solid rgba(56, 189, 248, 0.4);
  border-radius: var(--radius-xs);
  color: #e0f2fe;
  cursor: pointer;
  transition: all var(--trans-fast);
  user-select: none;
}

.btn-catalog-trigger i {
  color: #38bdf8;
  font-size: 0.85rem;
  transition: transform var(--trans-fast);
}

.btn-catalog-trigger:hover {
  background: rgba(0, 111, 184, 0.28);
  border-color: #38bdf8;
  color: #ffffff;
  box-shadow: 0 0 10px rgba(0, 111, 184, 0.35);
}

.btn-catalog-trigger:hover i {
  transform: scale(1.1);
}

.btn-catalog-trigger:active {
  transform: translateY(1px);
}

.btn-catalog-trigger:focus-visible {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
}

.hero-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.rank-stepper-box {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.rank-lbl {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.rank-num-input {
  width: 44px;
  background: transparent;
  border: none;
  text-align: center;
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--text-primary);
  font-family: var(--font-mono);
  outline: none;
}

.rank-num-input::-webkit-inner-spin-button,
.rank-num-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.btn-toggle-rules {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.38rem 0.65rem;
  font-size: 0.72rem;
  font-weight: 600;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xs);
  color: var(--text-muted);
  cursor: pointer;
  transition: all var(--trans-fast);
}

.btn-toggle-rules:hover,
.btn-toggle-rules.active {
  background: rgba(0, 111, 184, 0.15);
  border-color: rgba(0, 111, 184, 0.4);
  color: var(--accent-secondary);
}

.btn-toggle-rules:focus-visible {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
}

/* Rules Drawer */
.rules-collapsible-drawer {
  background: rgba(15, 23, 42, 0.6);
  border: 1px dashed var(--border-color);
  border-radius: var(--radius-sm);
  padding: 0.75rem 0.95rem;
}

.rules-drawer-head {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--accent-amber);
  margin-bottom: 0.35rem;
}

.rules-desc-text {
  font-size: 0.78rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}

/* Combat Parameters Status Strip */
.params-status-strip {
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 0.55rem 0.85rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.param-status-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
}

.param-status-item .param-lbl {
  font-weight: 600;
  color: var(--text-muted);
}

.param-status-item .param-val {
  font-weight: 700;
  color: var(--text-primary);
}

.param-status-item.highlight .param-val {
  color: #38bdf8;
}

.param-status-divider {
  width: 1px;
  height: 16px;
  background: var(--border-subtle);
}

/* Modifiers 2-Column Responsive Deck */
.modifiers-two-col-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

@media (max-width: 900px) {
  .modifiers-two-col-grid {
    grid-template-columns: 1fr;
  }
}

.empty-mods-clean {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.65rem 0.85rem;
  background: var(--bg-card);
  border: 1px dashed var(--border-subtle);
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  font-size: 0.74rem;
}

.canvas-form-grid {
  display: grid;
  grid-template-columns: minmax(180px, 1.5fr) minmax(180px, 1.5fr) minmax(130px, 1fr);
  gap: 0.85rem;
}

.span-full {
  grid-column: 1 / -1;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field-label {
  font-size: 0.74rem;
  font-weight: 700;
  color: var(--text-secondary);
}

.input-with-icon,
.select-with-icon {
  display: flex;
  align-items: center;
  position: relative;
}

.input-with-icon i,
.select-with-icon i {
  position: absolute;
  left: 0.75rem;
  color: var(--text-muted);
  font-size: 0.9rem;
  pointer-events: none;
}

.text-input,
.select-input {
  width: 100%;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  color: var(--text-primary);
  padding: 0.5rem 0.75rem 0.5rem 2.2rem;
  border-radius: var(--radius-sm);
  font-size: 0.84rem;
  font-family: inherit;
  outline: none;
  transition: border-color var(--trans-fast), box-shadow var(--trans-fast), background-color var(--trans-fast);
}

.text-input:focus,
.select-input:focus {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 2px rgba(0, 111, 184, 0.25);
}

.rank-stepper-row {
  display: flex;
  align-items: center;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 0.2rem;
}

.btn-step {
  width: 32px;
  height: 32px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  color: var(--text-primary);
  border-radius: calc(var(--radius-sm) - 0.2rem);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  transition: background-color var(--trans-fast), border-color var(--trans-fast), color var(--trans-fast), transform var(--trans-fast);
}

.btn-step:hover:not(:disabled) {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
  color: #fff;
}

.btn-step:active:not(:disabled) {
  transform: scale(0.95);
}

.btn-step:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.rank-display {
  flex: 1;
  text-align: center;
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}

.params-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.5rem;
}

.param-chip {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xs);
  padding: 0.4rem 0.65rem;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.param-label {
  font-size: 0.65rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.param-value {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-primary);
}

.param-value.highlight {
  color: var(--text-primary);
}

.canvas-modifiers-section {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding-top: 1.15rem;
  margin-top: 0.25rem;
}

.modifiers-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sec-title {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.sec-title i {
  color: var(--accent-primary);
}

.btn-browse-mods {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  font-size: 0.74rem;
  font-weight: 700;
  padding: 0.35rem 0.75rem;
  border-radius: var(--radius-xs);
  cursor: pointer;
  transition: background-color var(--trans-fast), border-color var(--trans-fast), color var(--trans-fast), transform var(--trans-fast);
}

.btn-browse-mods:hover {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
  color: #fff;
}

.btn-browse-mods:active {
  transform: scale(0.96);
}

.btn-browse-mods:hover {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
  color: #fff;
}

.mods-category-block {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.mods-block-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.mods-subhead {
  font-size: 0.74rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.extras-head { color: var(--text-secondary); }
.flaws-head { color: var(--text-secondary); }
.extras-head i { color: #34d399; }
.flaws-head i { color: #f87171; }

.applied-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 0.75rem;
}

.modifier-card {
  background: var(--bg-card);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
  padding: 0.8rem 0.95rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  position: relative;
  transition: border-color var(--trans-fast), box-shadow var(--trans-fast);
}

.modifier-card.mod-card-extra {
  border-color: rgba(16, 185, 129, 0.28);
  background: linear-gradient(180deg, rgba(16, 185, 129, 0.05) 0%, var(--bg-card) 45%);
}

.modifier-card.mod-card-extra:hover {
  border-color: rgba(16, 185, 129, 0.45);
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.08);
}

.modifier-card.mod-card-flaw {
  border-color: rgba(239, 68, 68, 0.28);
  background: linear-gradient(180deg, rgba(239, 68, 68, 0.05) 0%, var(--bg-card) 45%);
}

.modifier-card.mod-card-flaw:hover {
  border-color: rgba(239, 68, 68, 0.45);
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.08);
}

.mod-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.mod-card-identity {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  min-width: 0;
}

.mod-cat-badge {
  font-size: 0.62rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.15rem 0.4rem;
  border-radius: var(--radius-xs);
  white-space: nowrap;
}

.extra-badge {
  background: rgba(16, 185, 129, 0.2);
  border: 1px solid rgba(16, 185, 129, 0.35);
  color: #34d399;
}

.flaw-badge {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.35);
  color: #f87171;
}

.mod-card-title {
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mod-card-header-actions {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;
}

.mod-card-cost {
  font-size: 0.72rem;
  font-weight: 800;
  padding: 0.18rem 0.5rem;
  border-radius: var(--radius-xs);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
}

.extra-cost {
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #a7f3d0;
}

.flaw-cost {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fecaca;
}

.mod-card-del-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  border-radius: var(--radius-xs);
  transition: color var(--trans-fast), background var(--trans-fast), transform var(--trans-fast);
}

.mod-card-del-btn:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.15);
}

.mod-card-del-btn:active {
  transform: scale(0.92);
}

.mod-card-body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mod-card-custom-preview {
  font-size: 0.8rem;
  font-weight: 600;
  color: #60a5fa;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 160px;
}

.mod-custom-text-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  background: rgba(0, 0, 0, 0.28);
  padding: 0.45rem 0.6rem;
  border-radius: var(--radius-xs);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.mod-custom-text-label {
  font-size: 0.68rem;
  font-weight: 700;
  color: #93c5fd;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin: 0;
}

.mod-custom-input {
  width: 100%;
  font-size: 0.78rem;
  padding: 0.3rem 0.5rem;
  background: rgba(11, 17, 34, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: var(--radius-xs);
  color: var(--text-primary);
  transition: border-color var(--trans-fast), box-shadow var(--trans-fast);
}

.mod-custom-input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 2px rgba(0, 111, 184, 0.3);
}

.mod-custom-input::placeholder {
  color: var(--text-secondary, #94a3b8);
  font-style: italic;
}

.mod-card-desc {
  font-size: 0.75rem;
  line-height: 1.5;
  color: var(--text-secondary);
  margin: 0;
  white-space: pre-line;
}

.mod-card-options-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.28rem;
  background: rgba(0, 0, 0, 0.25);
  padding: 0.4rem 0.55rem;
  border-radius: var(--radius-xs);
  border: 1px solid var(--border-subtle);
}

.mod-options-label {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.mod-options-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.mod-option-pill {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.18rem 0.45rem;
  border-radius: var(--radius-xs);
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--trans-fast);
}

.mod-option-pill:hover {
  border-color: var(--accent-primary);
  color: var(--text-primary);
}

.mod-option-pill:active {
  transform: scale(0.96);
}

.mod-option-pill.active {
  background: rgba(16, 185, 129, 0.22);
  border-color: rgba(16, 185, 129, 0.55);
  color: #a7f3d0;
  font-weight: 800;
}

.mod-option-pill.flaw-opt.active {
  background: rgba(239, 68, 68, 0.22);
  border-color: rgba(239, 68, 68, 0.55);
  color: #fecaca;
  font-weight: 800;
}

.mod-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border-subtle);
  margin-top: auto;
  gap: 0.5rem;
}

.mod-card-stepper {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.stepper-label {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.stepper-group {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  background: rgba(0, 0, 0, 0.3);
  padding: 0.12rem 0.35rem;
  border-radius: var(--radius-xs);
  border: 1px solid var(--border-subtle);
}

.step-btn {
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: 0.78rem;
  font-weight: 900;
  cursor: pointer;
  padding: 0 0.25rem;
  border-radius: 2px;
  transition: background var(--trans-fast), transform var(--trans-fast);
}

.step-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.15);
}

.step-btn:active:not(:disabled) {
  transform: scale(0.92);
}

.step-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.step-value {
  font-size: 0.74rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  padding: 0 0.2rem;
}

.mod-card-flat-info {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--text-muted);
}

.mod-card-flat-info i {
  font-size: 0.75rem;
}

.mod-card-subtotal {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  margin-left: auto;
}

.subtotal-label {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.subtotal-val {
  font-size: 0.78rem;
  font-weight: 900;
  font-variant-numeric: tabular-nums;
}

.extra-text {
  color: #34d399;
}

.flaw-text {
  color: #f87171;
}

.empty-mods-notice {
  font-size: 0.76rem;
  color: var(--text-muted);
  font-style: italic;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.6rem 0.85rem;
  background: rgba(255, 255, 255, 0.02);
  border-radius: var(--radius-xs);
  border: 1px dashed var(--border-subtle);
}

.empty-mods-notice i {
  font-size: 0.95rem;
  opacity: 0.7;
}

/* ==========================================================================
   BASE EFFECT BANNER & CATALOG LAUNCHER
   ========================================================================== */
.base-effect-card.split-layout {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 1.15rem 1.25rem;
  display: grid;
  grid-template-columns: minmax(320px, 1fr) 1.6fr;
  gap: 1.5rem;
  align-items: stretch;
  position: relative;
  box-shadow: var(--shadow-sm);
}

@media (max-width: 900px) {
  .base-effect-card.split-layout {
    grid-template-columns: 1fr;
    gap: 1.15rem;
  }
}

.base-col-control {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1rem;
}

.base-col-identity {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
}

.base-effect-icon-box {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-xs);
  background: rgba(0, 111, 184, 0.12);
  border: 1px solid rgba(0, 111, 184, 0.3);
  color: var(--accent-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.35rem;
  flex-shrink: 0;
  margin-top: 2px;
}

.base-identity-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.base-effect-name-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.base-effect-title {
  font-size: 1.15rem;
  font-weight: 900;
  color: #fff;
  letter-spacing: -0.01em;
}

.base-effect-cost-tag {
  font-size: 0.74rem;
  font-weight: 700;
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-color);
  padding: 0.12rem 0.45rem;
  border-radius: var(--radius-xs);
  font-variant-numeric: tabular-nums;
}

.base-type-subtitle {
  font-size: 0.68rem;
  color: var(--text-muted);
  font-weight: 600;
}

.base-col-actions {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.btn-open-effects-catalog {
  background: var(--accent-primary);
  color: #fff;
  border: 1px solid var(--accent-primary-hover);
  border-radius: var(--radius-xs);
  padding: 0.5rem 0.85rem;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  box-shadow: var(--shadow-sm);
  transition: background-color var(--trans-fast), border-color var(--trans-fast), transform var(--trans-fast);
  width: 100%;
}

.btn-open-effects-catalog:hover {
  background: var(--accent-primary-hover);
  border-color: var(--accent-primary);
  transform: translateY(-1px);
}

.btn-open-effects-catalog:active {
  transform: scale(0.97);
}

.base-rank-stepper-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.65rem;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xs);
  padding: 0.35rem 0.65rem;
}

.base-rank-label {
  font-size: 0.72rem;
  color: var(--text-secondary);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  white-space: nowrap;
}

.base-rank-label i {
  color: var(--accent-primary);
  font-size: 0.85rem;
}

.base-rank-stepper-box .rank-stepper-row {
  flex: 1;
  max-width: 170px;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  padding: 0.15rem;
  border-radius: var(--radius-xs);
}

.base-rank-stepper-box .btn-step {
  width: 26px;
  height: 26px;
  font-size: 0.85rem;
}

.base-rank-stepper-box .rank-display {
  font-size: 0.84rem;
  font-weight: 800;
  color: #fff;
}

/* Right Column: Rules & Mechanics */
.base-col-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  border-left: 1px solid rgba(255, 255, 255, 0.08);
  padding-left: 1.5rem;
  justify-content: center;
}

@media (max-width: 900px) {
  .base-col-details {
    border-left: none;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    padding-left: 0;
    padding-top: 1rem;
  }
}

.base-details-header {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.base-details-header i {
  color: var(--accent-primary);
  font-size: 0.85rem;
}

.base-effect-desc {
  font-size: 0.76rem;
  color: var(--text-secondary);
  line-height: 1.55;
  margin: 0;
}

/* ==========================================================================
   LINKED EFFECT CONTEXT BANNER (When editing a Linked Effect)
   ========================================================================== */
.canvas-linked-context-banner {
  background: rgba(20, 184, 166, 0.08);
  border: 1px solid rgba(20, 184, 166, 0.28);
  border-radius: var(--radius-sm);
  padding: 0.65rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.85rem;
  flex-wrap: wrap;
}

.linked-context-left {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex-wrap: wrap;
}

.linked-context-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: rgba(20, 184, 166, 0.2);
  border: 1px solid rgba(20, 184, 166, 0.45);
  color: #2dd4bf;
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 0.2rem 0.55rem;
  border-radius: var(--radius-xs);
}

.linked-context-desc {
  font-size: 0.78rem;
  color: #ccfbf1;
}

.linked-context-desc strong {
  color: #fff;
}

.linked-context-right {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.sync-lock-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.7rem;
  font-weight: 700;
  color: #99f6e4;
  background: rgba(20, 184, 166, 0.12);
  border: 1px solid rgba(20, 184, 166, 0.25);
  padding: 0.18rem 0.5rem;
  border-radius: var(--radius-xs);
}

.btn-unlink-current {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  height: 28px;
  padding: 0 0.65rem;
  font-size: 0.72rem;
  font-weight: 700;
  color: #fca5a5;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.35);
  border-radius: var(--radius-xs);
  cursor: pointer;
  transition: all var(--trans-fast);
}

.btn-unlink-current::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  min-width: 44px;
  min-height: 44px;
  width: 100%;
  height: 100%;
}

.btn-unlink-current:hover {
  background: #ef4444;
  color: #fff;
  border-color: #f87171;
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.4);
}

.slot-identity-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.slot-capacity-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.75rem;
  background: rgba(56, 189, 248, 0.08);
  border: 1px solid rgba(56, 189, 248, 0.25);
  border-radius: var(--radius-sm);
  font-size: 0.76rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

.slot-capacity-pill.is-overflow {
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.5);
  color: #ef4444;
}

.slot-capacity-pill .overflow-tag {
  background: #ef4444;
  color: #fff;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.1rem 0.35rem;
  border-radius: 3px;
}
</style>
