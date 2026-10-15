<template>
  <transition name="modal-pop">
    <div v-if="modelValue" class="eq-modal-backdrop" @click.self="closeModal">
      <div class="eq-studio-card">
        <!-- Studio Header -->
        <div class="eq-studio-header">
          <div class="header-branding">
            <span class="studio-badge">M&M 3E RULES</span>
            <h3 class="studio-title">Custom Equipment Workshop</h3>
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
            <!-- ======================================================= -->
            <!-- STEP 1: CATEGORY & IDENTITY -->
            <!-- ======================================================= -->
            <div v-if="currentStep === 1" class="step-pane">
              <div class="step-pane-head">
                <h4>1. Choose Equipment Category & Identity</h4>
                <p>Select the M&M 3e equipment domain and name your custom gear.</p>
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
                  <label for="eq-item-name">Item Name *</label>
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
                <i class="ri-arrow-left-line"></i> Previous Tab
              </button>
              <div v-else class="footer-hint-text">
                <i class="ri-compass-3-line"></i> Direct Studio Navigation Available Above
              </div>
              <div class="footer-spacer"></div>
              <button
                v-if="currentStep < 4"
                type="button"
                class="btn-step-next"
                @click="nextStep"
              >
                Next Tab <i class="ri-arrow-right-line"></i>
              </button>
              <button
                type="button"
                class="btn-step-save"
                :class="{ 'btn-step-save-primary': currentStep === 4 }"
                @click="saveEquipmentItem"
              >
                <i class="ri-check-line"></i> {{ currentStep === 4 ? 'Create & Add to Sheet' : 'Save Equipment' }}
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
  buildEquipmentResource
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
  }
});

const emit = defineEmits(['update:modelValue', 'item-created']);

const heroStore = useHeroStore();
const uiStore = useUiStore();

// Stepper
const currentStep = ref(1);
const steps = STEPS;
const categoryCards = CATEGORY_CARDS;

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
      if (props.initialCategory) {
        selectCategory(props.initialCategory);
      } else {
        ensureItemName();
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

// Reactive Calculations
const costBreakdown = computed(() => {
  const cat = selectedCategory.value;
  let cfg = {};
  if (cat === 'Weapons') cfg = weaponConfig.value;
  else if (cat === 'Armor') cfg = armorConfig.value;
  else if (cat === 'Vehicle') cfg = vehicleConfig.value;
  else if (cat === 'Headquarters') cfg = hqConfig.value;
  else cfg = gadgetConfig.value;

  return calculateTotalEquipmentCost(cat, cfg);
});

const calculatedTotalCost = computed(() => costBreakdown.value.total);

// Hero Budget Calculations
const budgetInfo = computed(() => heroStore.getEquipmentBudgetInfo());

const projectedBudgetInfo = computed(() => {
  const currentTotal = budgetInfo.value.totalEP;
  const capacity = budgetInfo.value.maxEP;
  const itemCost = calculatedTotalCost.value;
  const projectedUsed = currentTotal + itemCost;
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
  uiStore.showToast(`Updated Equipment Advantage to Rank ${targetRanks} (${targetRanks * 5} EP capacity)!`, 'success');
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
  ensureItemName();
  const name = itemName.value.trim();
  if (!name) {
    uiStore.showToast('Please enter an item name', 'error');
    currentStep.value = 1;
    return;
  }

  const cat = selectedCategory.value;
  const totalEP = calculatedTotalCost.value;

  const newResource = buildEquipmentResource({
    cat,
    name,
    totalEP,
    itemStatus: itemStatus.value,
    customDescription: customDescription.value,
    weaponConfig: weaponConfig.value,
    armorConfig: armorConfig.value,
    vehicleConfig: vehicleConfig.value,
    hqConfig: hqConfig.value,
    gadgetConfig: gadgetConfig.value
  });

  heroStore.addResource(newResource);
  uiStore.showToast(`Added "${name}" (${totalEP} EP) to equipment!`, 'success');
  emit('item-created', newResource);
  closeModal();
}
</script>

<style src="./custom-equipment/customEquipmentModal.css"></style>
