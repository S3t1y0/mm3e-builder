<template>
  <transition name="modal-pop">
    <div v-if="modelValue" class="eq-modal-backdrop" @click.self="closeModal">
      <div class="eq-studio-card">
        <!-- Studio Header -->
        <div class="eq-studio-header">
          <div class="header-branding">
            <span class="studio-badge">{{ editingItemId ? 'Edit Item' : 'Equipment' }}</span>
            <h3 class="studio-title">{{ editingItemId ? 'Edit Equipment' : 'Custom Equipment' }}</h3>
          </div>

          <!-- Studio Navigation Tabs in Header -->
          <div class="studio-stepper" role="tablist" aria-label="Equipment Studio Sections">
            <button
              v-for="st in steps"
              :key="st.num"
              type="button"
              role="tab"
              class="stepper-tab"
              :class="{
                active: currentStep === st.num,
                completed: currentStep > st.num
              }"
              :aria-selected="currentStep === st.num"
              @click="goToStep(st.num)"
            >
              <span class="step-num">
                <i v-if="st.icon" :class="st.icon"></i>
                <span v-else>{{ st.num }}</span>
              </span>
              <span class="step-label">{{ st.label }}</span>
            </button>
          </div>

          <button type="button" class="studio-close-btn" @click="closeModal" aria-label="Close">
            <i class="ri-close-line"></i>
          </button>
        </div>

        <!-- Studio 2-Column Body -->
        <div class="eq-studio-body">
          <!-- Left Column: Step Content (65%) -->
          <div class="eq-step-workspace">
            <!-- Sub-Workshop Banner when configuring an Alternate Equipment Item -->
            <div v-if="isSubEditing" class="eq-sub-editing-banner">
              <div class="sub-banner-info">
                <div class="sub-banner-title">
                  <i class="ri-git-branch-line"></i>
                  <span>Alternate Equipment</span>
                </div>
                <div class="sub-banner-meta">
                  Primary item: <strong>{{ primaryBackup?.itemName || 'Primary Gear' }}</strong>
                  <span class="sub-ceiling-tag" :class="{ 'tag-over-budget': isSubItemOverCeiling }">
                    Cost limit: {{ primaryCeilingEP }} EP (Current: {{ calculatedTotalCost }} EP)
                  </span>
                </div>
              </div>
              <button type="button" class="btn-cancel-sub" @click="cancelSubWorkshop">
                <i class="ri-arrow-go-back-line"></i> Back to primary item
              </button>
            </div>

            <!-- ======================================================= -->
            <!-- STEP 1: CATEGORY & IDENTITY -->
            <!-- ======================================================= -->
            <div v-if="currentStep === 1" class="step-pane">
              <div class="step-pane-head">
                <h4>{{ isSubEditing ? '1. Alternate Item Category and Name' : '1. Category and Name' }}</h4>
                <p>{{ isSubEditing ? 'Alternate items cannot cost more than the primary item.' : 'Select a category and name the item.' }}</p>
              </div>

              <!-- 5 Category Cards Grid -->
              <div class="category-cards-grid">
                <button
                  v-for="cat in categoryCards"
                  :key="cat.id"
                  type="button"
                  class="cat-select-card"
                  :class="[
                    'cat-card-' + cat.id.toLowerCase(),
                    { selected: selectedCategory === cat.id }
                  ]"
                  @click="selectCategory(cat.id)"
                >
                  <div class="cat-card-icon">
                    <i :class="cat.icon"></i>
                  </div>
                  <div class="cat-card-info">
                    <strong class="cat-card-title">{{ cat.label }}</strong>
                    <span class="cat-card-desc">{{ cat.desc }}</span>
                  </div>
                  <span v-if="selectedCategory === cat.id" class="cat-selected-check">
                    <i class="ri-checkbox-circle-fill"></i>
                  </span>
                </button>
              </div>

              <!-- Item Name Input -->
              <div class="eq-form-group mt-4">
                <div class="eq-label-row">
                  <label for="eq-item-name">{{ isSubEditing ? 'Alternate Item Name *' : 'Item Name *' }}</label>
                </div>
                <input
                  id="eq-item-name"
                  v-model="itemName"
                  type="text"
                  class="eq-text-input"
                  :placeholder="getNamePlaceholder(selectedCategory)"
                  @keyup.enter="nextStep"
                />
              </div>

              <!-- Equipment Array Section in Identity (Step 1, only visible in Primary Mode) -->
              <div v-if="!isSubEditing" class="eq-array-section-card mt-4">
                <div class="eq-array-header">
                  <div class="eq-array-title-wrap">
                    <i class="ri-stack-line eq-array-icon"></i>
                    <div>
                      <div class="eq-array-title">Equipment Array</div>
                      <div class="eq-array-subtitle">Group alternate items into a single array (+1 EP per alternate)</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    class="btn-toggle-array"
                    :class="{ 'is-active': isArrayMode }"
                    @click="toggleArrayMode"
                  >
                    <i :class="isArrayMode ? 'ri-toggle-fill' : 'ri-toggle-line'"></i>
                    <span>{{ isArrayMode ? 'Array active' : 'Enable array' }}</span>
                  </button>
                </div>

                <div v-if="isArrayMode" class="eq-array-body">
                  <div class="eq-array-slots-list">
                    <!-- Main Primary Slot -->
                    <div class="array-slot-row primary-slot">
                      <div class="slot-badge-col">
                        <span class="array-slot-tag primary-tag">PRIMARY</span>
                      </div>
                      <div class="slot-info-col">
                        <strong class="slot-name">{{ itemName || 'Primary Item' }}</strong>
                        <span class="slot-cat-badge" :class="'badge-' + selectedCategory.toLowerCase()">{{ selectedCategory }}</span>
                      </div>
                      <div class="slot-cost-col font-mono">
                        {{ primaryStandaloneCost }} EP (limit)
                      </div>
                    </div>

                    <!-- Alternate Slots -->
                    <div
                      v-for="(alt, idx) in alternateItems"
                      :key="alt.id || idx"
                      class="array-slot-row alt-slot"
                    >
                      <div class="slot-badge-col">
                        <span class="array-slot-tag alt-tag">ALT #{{ idx + 1 }}</span>
                      </div>
                      <div class="slot-info-col">
                        <strong class="slot-name">{{ alt.name }}</strong>
                        <span class="slot-cat-badge" :class="'badge-' + (alt.category || 'gadget').toLowerCase()">{{ alt.category }}</span>
                      </div>
                      <div class="slot-cost-col font-mono">
                        {{ alt.epCost ?? alt.cost ?? 0 }} EP
                      </div>
                      <div class="slot-actions-col">
                        <button
                          type="button"
                          class="btn-slot-action"
                          title="Edit alternate item"
                          @click="openSubWorkshop(idx)"
                        >
                          <i class="ri-edit-line"></i>
                        </button>
                        <button
                          type="button"
                          class="btn-slot-action text-danger"
                          title="Remove alternate item"
                          @click="removeAlternateItem(idx)"
                        >
                          <i class="ri-delete-bin-line"></i>
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Add Alternate Item Button -->
                  <button
                    type="button"
                    class="btn-add-array-alt"
                    @click="openSubWorkshop(-1)"
                  >
                    <i class="ri-add-circle-line"></i>
                    <span>+ Add Alternate Item (+1 EP)</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- ======================================================= -->
            <!-- STEP 2: BASE MECHANICAL SPECS -->
            <!-- ======================================================= -->
            <EquipmentStepSpecs
              v-else-if="currentStep === 2"
              :selected-category="selectedCategory"
              :weapon-config="weaponConfig"
              :armor-config="armorConfig"
              :vehicle-config="vehicleConfig"
              :hq-config="hqConfig"
              :gadget-config="gadgetConfig"
              :hero-store="heroStore"
              @select-gadget-pack="selectGadgetPack"
            />

            <!-- ======================================================= -->
            <!-- STEP 3: TRAITS, FEATURES & AMENITIES -->
            <!-- ======================================================= -->
            <EquipmentStepTraits
              v-else-if="currentStep === 3"
              :selected-category="selectedCategory"
              :weapon-config="weaponConfig"
              :armor-config="armorConfig"
              :vehicle-config="vehicleConfig"
              :hq-config="hqConfig"
              :gadget-config="gadgetConfig"
            />

            <!-- ======================================================= -->
            <!-- STEP 4: REVIEW & FINALIZE -->
            <!-- ======================================================= -->
            <EquipmentStepFinalize
              v-else-if="currentStep === 4"
              :selected-category="selectedCategory"
              :item-name="itemName"
              :weapon-config="weaponConfig"
              :armor-config="armorConfig"
              :vehicle-config="vehicleConfig"
              :hq-config="hqConfig"
              :calculated-atk-bonus="calculatedAtkBonus"
              :calculated-dc="calculatedDC"
              :calculated-total-cost="calculatedTotalCost"
              v-model:custom-description="customDescription"
              v-model:item-status="itemStatus"
              @regenerate-description="regenerateDescription"
            />

            <!-- Studio Bottom Nav Controls -->
            <div class="step-nav-footer">
              <button
                v-if="currentStep > 1"
                type="button"
                class="btn-step-prev"
                @click="prevStep"
              >
                <i class="ri-arrow-left-line"></i> Back
              </button>
              <button
                v-else-if="isSubEditing"
                type="button"
                class="btn-step-prev"
                @click="cancelSubWorkshop"
              >
                <i class="ri-arrow-go-back-line"></i> Back to primary
              </button>
              <div v-else class="footer-hint-text">
                <i class="ri-compass-3-line"></i> Click any tab above to jump directly
              </div>
              <div class="footer-spacer"></div>
              <button
                v-if="currentStep < 4"
                type="button"
                class="btn-step-next"
                @click="nextStep"
              >
                Next <i class="ri-arrow-right-line"></i>
              </button>
              <button
                v-if="isSubEditing"
                type="button"
                class="btn-step-save btn-step-save-primary"
                :disabled="isSubItemOverCeiling"
                @click="saveSubItemToAlternateList"
              >
                <i class="ri-check-line"></i> {{ subEditingIndex >= 0 ? 'Save Alternate Item' : 'Add Alternate Item (+1 EP)' }}
              </button>
              <button
                v-else
                type="button"
                class="btn-step-save"
                :class="{ 'btn-step-save-primary': currentStep === 4 }"
                @click="saveEquipmentItem"
              >
                <i class="ri-check-line"></i> {{ editingItemId ? 'Save Changes' : (currentStep === 4 ? 'Add to Sheet' : 'Save Item') }}
              </button>
            </div>
          </div>

          <!-- Right Column: Live Bill of Materials (BOM) & Budget HUD (35%) -->
          <EquipmentBomPanel
            :item-name="itemName"
            :selected-category="selectedCategory"
            :calculated-total-cost="calculatedTotalCost"
            :cost-breakdown="costBreakdown"
            :budget-info="budgetInfo"
            :projected-budget-info="projectedBudgetInfo"
            :is-editing="Boolean(editingItemId)"
            @sync-budget="syncEquipmentAdvantage"
          />
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useHeroStore } from '../../stores/heroStore.js';
import { useUiStore } from '../../stores/uiStore.js';
import {
  calculateTotalEquipmentCost,
  generateEquipmentDescription
} from '../../rules/equipmentCalculator.js';
import {
  STEPS,
  CATEGORY_CARDS,
  createDefaultWeaponConfig,
  createDefaultArmorConfig,
  createDefaultVehicleConfig,
  createDefaultHqConfig,
  createDefaultGadgetConfig,
  getNamePlaceholder,
  getNameSuggestions,
  calculateAtkBonus,
  calculateDC,
  buildEquipmentResource,
  parseResourceToConfigs
} from './custom-equipment/customEquipmentHelper.js';
import EquipmentStepSpecs from './custom-equipment/EquipmentStepSpecs.vue';
import EquipmentStepTraits from './custom-equipment/EquipmentStepTraits.vue';
import EquipmentStepFinalize from './custom-equipment/EquipmentStepFinalize.vue';
import EquipmentBomPanel from './custom-equipment/EquipmentBomPanel.vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  initialCategory: {
    type: String,
    default: 'Weapons'
  },
  editingItem: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['update:modelValue', 'item-created']);

const heroStore = useHeroStore();
const uiStore = useUiStore();

// Stepper
const currentStep = ref(1);
const steps = STEPS;
const categoryCards = CATEGORY_CARDS;
const editingItemId = ref(null);

// Selection State
const selectedCategory = ref('Weapons');
const itemName = ref('');
const itemStatus = ref('equipped');
const customDescription = ref('');

// Category Configuration States
const weaponConfig = ref(createDefaultWeaponConfig());
const armorConfig = ref(createDefaultArmorConfig());
const vehicleConfig = ref(createDefaultVehicleConfig());
const hqConfig = ref(createDefaultHqConfig());
const gadgetConfig = ref(createDefaultGadgetConfig());

// Equipment Array State
const isArrayMode = ref(false);
const activeSlotId = ref('main');
const alternateItems = ref([]);

// Sub-Workshop Mode State (for configuring alternate equipment)
const isSubEditing = ref(false);
const subEditingIndex = ref(-1);
const primaryBackup = ref(null);

// Clamp ranked traits to damage rank when damage rank is reduced
watch(
  () => weaponConfig.value.damageRank,
  (newDmg) => {
    if (weaponConfig.value.multiattackRanks > newDmg) {
      weaponConfig.value.multiattackRanks = newDmg;
    }
    if (weaponConfig.value.burstAreaRanks > newDmg) {
      weaponConfig.value.burstAreaRanks = newDmg;
    }
    if (weaponConfig.value.penetratingRank > newDmg) {
      weaponConfig.value.penetratingRank = newDmg;
    }
  }
);

// Ensure item name always has a sensible, genre-fitting default
function ensureItemName() {
  if (!itemName.value || !itemName.value.trim()) {
    const suggestions = getNameSuggestions(selectedCategory.value);
    itemName.value = (suggestions && suggestions[0]) || `Custom ${selectedCategory.value}`;
  }
}

// Initialize on category change
watch(
  () => props.initialCategory,
  (newCat) => {
    if (props.editingItem) return;
    if (newCat) selectCategory(newCat);
    else ensureItemName();
  },
  { immediate: true }
);

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      currentStep.value = 1;
      isSubEditing.value = false;
      subEditingIndex.value = -1;
      primaryBackup.value = null;
      if (props.editingItem) {
        editingItemId.value = props.editingItem.id || null;
        const parsed = parseResourceToConfigs(props.editingItem);
        if (parsed) {
          selectedCategory.value = parsed.category;
          itemName.value = parsed.itemName;
          itemStatus.value = parsed.itemStatus;
          customDescription.value = parsed.customDescription;
          weaponConfig.value = { ...parsed.weaponConfig };
          armorConfig.value = { ...parsed.armorConfig };
          vehicleConfig.value = { ...parsed.vehicleConfig };
          hqConfig.value = { ...parsed.hqConfig };
          gadgetConfig.value = { ...parsed.gadgetConfig };
          isArrayMode.value = Boolean(parsed.isArray);
          activeSlotId.value = parsed.activeSlotId || 'main';
          alternateItems.value = Array.isArray(parsed.alternateItems) ? [...parsed.alternateItems] : [];
        }
      } else {
        editingItemId.value = null;
        weaponConfig.value = createDefaultWeaponConfig();
        armorConfig.value = createDefaultArmorConfig();
        vehicleConfig.value = createDefaultVehicleConfig();
        hqConfig.value = createDefaultHqConfig();
        gadgetConfig.value = createDefaultGadgetConfig();
        itemStatus.value = 'equipped';
        customDescription.value = '';
        isArrayMode.value = false;
        activeSlotId.value = 'main';
        alternateItems.value = [];
        if (props.initialCategory) {
          selectCategory(props.initialCategory);
        } else {
          ensureItemName();
        }
      }
    }
  }
);

function selectCategory(catId) {
  const prevCat = selectedCategory.value;
  selectedCategory.value = catId;
  const prevSuggestions = getNameSuggestions(prevCat) || [];
  if (!itemName.value || !itemName.value.trim() || prevSuggestions.includes(itemName.value.trim())) {
    const newSuggestions = getNameSuggestions(catId);
    itemName.value = (newSuggestions && newSuggestions[0]) || `Custom ${catId}`;
  }
  regenerateDescription();
}

function selectGadgetPack(pk) {
  gadgetConfig.value.presetPackId = pk.id;
  itemName.value = pk.name;
  regenerateDescription();
}

function goToStep(num) {
  ensureItemName();
  currentStep.value = Math.max(1, Math.min(4, Number(num) || 1));
  if (currentStep.value === 4) {
    regenerateDescription();
  }
}

function nextStep() {
  ensureItemName();
  if (currentStep.value < 4) {
    currentStep.value++;
    if (currentStep.value === 4) {
      regenerateDescription();
    }
  }
}

function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
}

function closeModal() {
  emit('update:modelValue', false);
}

// Current configuration object helper
function getCurrentConfig() {
  const cat = selectedCategory.value;
  if (cat === 'Weapons') return JSON.parse(JSON.stringify(weaponConfig.value));
  if (cat === 'Armor') return JSON.parse(JSON.stringify(armorConfig.value));
  if (cat === 'Vehicle') return JSON.parse(JSON.stringify(vehicleConfig.value));
  if (cat === 'Headquarters') return JSON.parse(JSON.stringify(hqConfig.value));
  return JSON.parse(JSON.stringify(gadgetConfig.value));
}

// Standalone cost of the primary item currently displayed
const primaryStandaloneCost = computed(() => {
  const cat = selectedCategory.value;
  let cfg = {};
  if (cat === 'Weapons') cfg = weaponConfig.value;
  else if (cat === 'Armor') cfg = armorConfig.value;
  else if (cat === 'Vehicle') cfg = vehicleConfig.value;
  else if (cat === 'Headquarters') cfg = hqConfig.value;
  else cfg = gadgetConfig.value;
  return calculateTotalEquipmentCost(cat, cfg).total;
});

// Primary ceiling EP when configuring alternate items (M&M 3e Strict Limit)
const primaryCeilingEP = computed(() => {
  if (!primaryBackup.value) return 999;
  return primaryBackup.value.baseCost || 0;
});

const isSubItemOverCeiling = computed(() => {
  if (!isSubEditing.value) return false;
  return calculatedTotalCost.value > primaryCeilingEP.value;
});

function toggleArrayMode() {
  if (isSubEditing.value) return;
  isArrayMode.value = !isArrayMode.value;
  if (!isArrayMode.value) {
    alternateItems.value = [];
    activeSlotId.value = 'main';
  }
}

function openSubWorkshop(index = -1) {
  ensureItemName();
  const primaryStandalone = primaryStandaloneCost.value;
  if (primaryStandalone <= 0) {
    uiStore.showToast('Configure the primary item before adding alternates.', 'warning');
    return;
  }

  // Backup primary item state
  primaryBackup.value = {
    selectedCategory: selectedCategory.value,
    itemName: itemName.value,
    itemStatus: itemStatus.value,
    customDescription: customDescription.value,
    weaponConfig: JSON.parse(JSON.stringify(weaponConfig.value)),
    armorConfig: JSON.parse(JSON.stringify(armorConfig.value)),
    vehicleConfig: JSON.parse(JSON.stringify(vehicleConfig.value)),
    hqConfig: JSON.parse(JSON.stringify(hqConfig.value)),
    gadgetConfig: JSON.parse(JSON.stringify(gadgetConfig.value)),
    baseCost: primaryStandalone,
    currentStep: currentStep.value
  };

  isSubEditing.value = true;
  subEditingIndex.value = index;

  if (index >= 0 && alternateItems.value[index]) {
    const altItem = alternateItems.value[index];
    const parsed = parseResourceToConfigs(altItem);
    if (parsed) {
      selectedCategory.value = parsed.category;
      itemName.value = parsed.itemName;
      itemStatus.value = parsed.itemStatus;
      customDescription.value = parsed.customDescription;
      weaponConfig.value = { ...parsed.weaponConfig };
      armorConfig.value = { ...parsed.armorConfig };
      vehicleConfig.value = { ...parsed.vehicleConfig };
      hqConfig.value = { ...parsed.hqConfig };
      gadgetConfig.value = { ...parsed.gadgetConfig };
    }
  } else {
    selectedCategory.value = 'Weapons';
    weaponConfig.value = createDefaultWeaponConfig();
    armorConfig.value = createDefaultArmorConfig();
    vehicleConfig.value = createDefaultVehicleConfig();
    hqConfig.value = createDefaultHqConfig();
    gadgetConfig.value = createDefaultGadgetConfig();
    itemName.value = '';
    customDescription.value = '';
    ensureItemName();
  }
  currentStep.value = 1;
}

function saveSubItemToAlternateList() {
  ensureItemName();
  const name = itemName.value.trim();
  if (!name) {
    uiStore.showToast('Enter a name for the alternate item.', 'error');
    currentStep.value = 1;
    return;
  }

  const cat = selectedCategory.value;
  const standaloneCost = calculatedTotalCost.value;

  if (standaloneCost > primaryCeilingEP.value) {
    uiStore.showToast(`Alternate item (${standaloneCost} EP) cannot exceed the primary limit (${primaryCeilingEP.value} EP).`, 'error');
    return;
  }

  const altResource = buildEquipmentResource({
    id: subEditingIndex.value >= 0 && alternateItems.value[subEditingIndex.value]?.id
      ? alternateItems.value[subEditingIndex.value].id
      : ('alt_' + Date.now() + Math.random().toString(36).substr(2, 4)),
    cat,
    name,
    totalEP: standaloneCost,
    itemStatus: 'equipped',
    customDescription: customDescription.value,
    weaponConfig: weaponConfig.value,
    armorConfig: armorConfig.value,
    vehicleConfig: vehicleConfig.value,
    hqConfig: hqConfig.value,
    gadgetConfig: gadgetConfig.value,
    isArray: false
  });

  const alts = [...alternateItems.value];
  if (subEditingIndex.value >= 0) {
    alts[subEditingIndex.value] = altResource;
  } else {
    alts.push(altResource);
  }
  alternateItems.value = alts;

  restorePrimaryState();
  uiStore.showToast(`Added ${name} to array (+1 EP).`, 'success');
}

function cancelSubWorkshop() {
  restorePrimaryState();
}

function restorePrimaryState() {
  if (primaryBackup.value) {
    selectedCategory.value = primaryBackup.value.selectedCategory;
    itemName.value = primaryBackup.value.itemName;
    itemStatus.value = primaryBackup.value.itemStatus;
    customDescription.value = primaryBackup.value.customDescription;
    weaponConfig.value = primaryBackup.value.weaponConfig;
    armorConfig.value = primaryBackup.value.armorConfig;
    vehicleConfig.value = primaryBackup.value.vehicleConfig;
    hqConfig.value = primaryBackup.value.hqConfig;
    gadgetConfig.value = primaryBackup.value.gadgetConfig;
    currentStep.value = primaryBackup.value.currentStep || 1;
  }
  isSubEditing.value = false;
  subEditingIndex.value = -1;
  primaryBackup.value = null;
}

function removeAlternateItem(index) {
  const alts = [...alternateItems.value];
  const removed = alts.splice(index, 1)[0];
  alternateItems.value = alts;
  if (activeSlotId.value === removed?.id) {
    activeSlotId.value = 'main';
  }
  uiStore.showToast(`Removed ${removed?.name || 'item'} from array.`, 'info');
}

// Reactive Calculations
const costBreakdown = computed(() => {
  const cat = selectedCategory.value;
  let cfg = {};
  if (cat === 'Weapons') cfg = weaponConfig.value;
  else if (cat === 'Armor') cfg = armorConfig.value;
  else if (cat === 'Vehicle') cfg = vehicleConfig.value;
  else if (cat === 'Headquarters') cfg = hqConfig.value;
  else cfg = gadgetConfig.value;

  const baseResult = calculateTotalEquipmentCost(cat, cfg);

  if (isSubEditing.value) {
    return baseResult;
  }

  if (isArrayMode.value && alternateItems.value.length > 0) {
    const extraLines = alternateItems.value.map(alt => ({
      label: `Alternate: ${alt.name} (${alt.epCost ?? alt.cost ?? 0} EP standalone)`,
      cost: 1
    }));
    return {
      total: baseResult.total + alternateItems.value.length,
      breakdown: [...baseResult.breakdown, ...extraLines]
    };
  }

  return baseResult;
});

const calculatedTotalCost = computed(() => costBreakdown.value.total);

// Hero Budget Calculations
const budgetInfo = computed(() => heroStore.getEquipmentBudgetInfo());

const editingItemEp = computed(() => {
  if (!props.editingItem) return 0;
  return Number(props.editingItem.epCost ?? props.editingItem.cost ?? 0);
});

const projectedBudgetInfo = computed(() => {
  const currentTotal = budgetInfo.value.totalEP;
  const capacity = budgetInfo.value.maxEP;
  const itemCost = calculatedTotalCost.value;
  const projectedUsed = editingItemId.value
    ? Math.max(0, currentTotal - editingItemEp.value + itemCost)
    : currentTotal + itemCost;
  const isOverBudget = projectedUsed > capacity;
  const deficit = Math.max(0, projectedUsed - capacity);
  const neededRanks = Math.ceil(projectedUsed / 5);
  const remaining = Math.max(0, capacity - projectedUsed);

  return {
    projectedUsed,
    capacity,
    isOverBudget,
    deficit,
    neededRanks,
    remaining
  };
});

function syncEquipmentAdvantage() {
  const targetRanks = projectedBudgetInfo.value.neededRanks;
  heroStore.setAdvantageRank('Equipment', targetRanks);
  uiStore.showToast(`Updated Equipment advantage to rank ${targetRanks} (${targetRanks * 5} EP capacity).`, 'success');
}

// Tactical Stats Preview Calculations
const calculatedAtkBonus = computed(() =>
  calculateAtkBonus(heroStore, weaponConfig.value, itemName.value, customDescription.value)
);

const calculatedDC = computed(() =>
  calculateDC(heroStore, weaponConfig.value)
);

function regenerateDescription() {
  try {
    const cat = selectedCategory.value;
    let cfg = {};
    if (cat === 'Weapons') cfg = weaponConfig.value;
    else if (cat === 'Armor') cfg = armorConfig.value;
    else if (cat === 'Vehicle') cfg = vehicleConfig.value;
    else if (cat === 'Headquarters') cfg = hqConfig.value;
    else cfg = gadgetConfig.value;

    customDescription.value = generateEquipmentDescription(cat, cfg);
  } catch (e) {
    console.error('Error regenerating description:', e);
  }
}

// Save to Hero Sheet
function saveEquipmentItem() {
  if (isSubEditing.value) {
    saveSubItemToAlternateList();
    return;
  }

  ensureItemName();
  const name = itemName.value.trim();
  if (!name) {
    uiStore.showToast('Enter an item name.', 'error');
    currentStep.value = 1;
    return;
  }

  const cat = selectedCategory.value;
  const isArr = isArrayMode.value;
  const alts = isArr ? alternateItems.value : [];
  const baseEp = primaryStandaloneCost.value;
  const totalEP = calculatedTotalCost.value;
  const isEditing = Boolean(editingItemId.value);

  const resourceData = buildEquipmentResource({
    id: editingItemId.value || undefined,
    cat,
    name,
    totalEP: baseEp,
    itemStatus: itemStatus.value,
    customDescription: customDescription.value,
    weaponConfig: weaponConfig.value,
    armorConfig: armorConfig.value,
    vehicleConfig: vehicleConfig.value,
    hqConfig: hqConfig.value,
    gadgetConfig: gadgetConfig.value,
    isArray: isArr,
    activeSlotId: activeSlotId.value || 'main',
    alternateItems: alts
  });

  if (isEditing) {
    heroStore.updateResource(editingItemId.value, resourceData);
    uiStore.showToast(`Updated ${name} (${totalEP} EP).`, 'success');
  } else {
    heroStore.addResource(resourceData);
    uiStore.showToast(`Added ${name} (${totalEP} EP) to equipment.`, 'success');
  }
  emit('item-created', resourceData);
  closeModal();
}
</script>

<style src="./custom-equipment/customEquipmentModal.css"></style>
