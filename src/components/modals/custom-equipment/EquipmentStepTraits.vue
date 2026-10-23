<template>
  <div class="step-pane">
    <div class="step-pane-head">
      <h4>3. Traits and Features</h4>
      <p>Add weapon traits, armor extras, or vehicle features.</p>
    </div>

    <!-- 3A. WEAPONS TRAITS -->
    <div v-if="selectedCategory === 'Weapons'" class="traits-section">
      <!-- Critical Threat Selector (Expanded to 4 Ranks) -->
      <div class="trait-group-box">
        <div class="trait-group-head">
          <strong>Critical Threat Rating</strong>
          <span class="badge-tag">Improved Critical (Max 4 Ranks)</span>
        </div>
        <div class="crit-pills">
          <button
            type="button"
            class="crit-pill"
            :class="{ active: weaponConfig.critBonus === 0 }"
            @click="weaponConfig.critBonus = 0"
          >
            Natural 20 (0 EP)
          </button>
          <button
            type="button"
            class="crit-pill"
            :class="{ active: weaponConfig.critBonus === 1 }"
            @click="weaponConfig.critBonus = 1"
          >
            19-20 (+1 EP)
          </button>
          <button
            type="button"
            class="crit-pill"
            :class="{ active: weaponConfig.critBonus === 2 }"
            @click="weaponConfig.critBonus = 2"
          >
            18-20 (+2 EP)
          </button>
          <button
            type="button"
            class="crit-pill"
            :class="{ active: weaponConfig.critBonus === 3 }"
            @click="weaponConfig.critBonus = 3"
          >
            17-20 (+3 EP)
          </button>
          <button
            type="button"
            class="crit-pill"
            :class="{ active: weaponConfig.critBonus === 4 }"
            @click="weaponConfig.critBonus = 4"
          >
            16-20 (+4 EP)
          </button>
        </div>
      </div>

      <!-- Tactical Trait Chips with Custom Ranks -->
      <div class="trait-chips-grid mt-3">
        <!-- 1. Multiattack -->
        <div
          class="trait-chip-card"
          :class="{ active: weaponConfig.multiattack }"
        >
          <div class="chip-top">
            <label class="chip-title-label">
              <input
                type="checkbox"
                v-model="weaponConfig.multiattack"
                @change="onToggleMultiattack"
              />
              <span class="chk-custom-sm"></span>
              <strong>Multiattack</strong>
            </label>

            <!-- Inline Rank Stepper when active -->
            <div v-if="weaponConfig.multiattack" class="trait-inline-stepper">
              <button
                type="button"
                class="btn-trait-step"
                :disabled="weaponConfig.multiattackRanks <= 1"
                @click="stepMultiattack(-1)"
              >-</button>
              <span class="trait-step-val">{{ weaponConfig.multiattackRanks }} Rk</span>
              <button
                type="button"
                class="btn-trait-step"
                :disabled="weaponConfig.multiattackRanks >= weaponConfig.damageRank"
                @click="stepMultiattack(1)"
              >+</button>
              <span class="chip-cost">+{{ weaponConfig.multiattackRanks }} EP</span>
            </div>
            <span v-else class="chip-cost-inactive">+1 EP / Rk</span>
          </div>
          <p>Spray fire or multi-target volley. Partial modifier: up to {{ weaponConfig.damageRank }} damage ranks.</p>
        </div>

        <!-- 2. Burst Area -->
        <div
          v-if="weaponConfig.rangeType === 'Ranged'"
          class="trait-chip-card"
          :class="{ active: weaponConfig.burstArea }"
        >
          <div class="chip-top">
            <label class="chip-title-label">
              <input
                type="checkbox"
                v-model="weaponConfig.burstArea"
                @change="onToggleBurstArea"
              />
              <span class="chk-custom-sm"></span>
              <strong>Area (Burst 30 ft)</strong>
            </label>

            <!-- Inline Rank Stepper when active -->
            <div v-if="weaponConfig.burstArea" class="trait-inline-stepper">
              <button
                type="button"
                class="btn-trait-step"
                :disabled="weaponConfig.burstAreaRanks <= 1"
                @click="stepBurstArea(-1)"
              >-</button>
              <span class="trait-step-val">{{ weaponConfig.burstAreaRanks }} Rk</span>
              <button
                type="button"
                class="btn-trait-step"
                :disabled="weaponConfig.burstAreaRanks >= weaponConfig.damageRank"
                @click="stepBurstArea(1)"
              >+</button>
              <span class="chip-cost">+{{ weaponConfig.burstAreaRanks }} EP</span>
            </div>
            <span v-else class="chip-cost-inactive">+1 EP / Rk</span>
          </div>
          <p>Explosive blast radius. Partial modifier: up to {{ weaponConfig.damageRank }} damage ranks.</p>
        </div>

        <!-- 3. Penetrating -->
        <div
          class="trait-chip-card"
          :class="{ active: weaponConfig.penetratingRank > 0 }"
        >
          <div class="chip-top">
            <label class="chip-title-label">
              <input
                type="checkbox"
                :checked="weaponConfig.penetratingRank > 0"
                @change="togglePenetratingCheckbox"
              />
              <span class="chk-custom-sm"></span>
              <strong>Penetrating</strong>
            </label>

            <div v-if="weaponConfig.penetratingRank > 0" class="trait-inline-stepper">
              <button
                type="button"
                class="btn-trait-step"
                :disabled="weaponConfig.penetratingRank <= 1"
                @click="stepPenetrating(-1)"
              >-</button>
              <span class="trait-step-val">{{ weaponConfig.penetratingRank }} Rk</span>
              <button
                type="button"
                class="btn-trait-step"
                :disabled="weaponConfig.penetratingRank >= weaponConfig.damageRank"
                @click="stepPenetrating(1)"
              >+</button>
              <span class="chip-cost">+{{ weaponConfig.penetratingRank }} EP</span>
            </div>
            <span v-else class="chip-cost-inactive">+1 EP / Rk</span>
          </div>
          <p>Overcomes Impervious Toughness up to chosen rank (max {{ weaponConfig.damageRank }}).</p>
        </div>

        <!-- 4. Reach (Melee only) -->
        <div
          v-if="weaponConfig.rangeType === 'Close'"
          class="trait-chip-card"
          :class="{ active: weaponConfig.reachRank > 0 }"
        >
          <div class="chip-top">
            <label class="chip-title-label">
              <input
                type="checkbox"
                :checked="weaponConfig.reachRank > 0"
                @change="toggleReachCheckbox"
              />
              <span class="chk-custom-sm"></span>
              <strong>Reach</strong>
            </label>

            <div v-if="weaponConfig.reachRank > 0" class="trait-inline-stepper">
              <button
                type="button"
                class="btn-trait-step"
                :disabled="weaponConfig.reachRank <= 1"
                @click="weaponConfig.reachRank = Math.max(1, weaponConfig.reachRank - 1)"
              >-</button>
              <span class="trait-step-val">{{ weaponConfig.reachRank * 5 }} ft</span>
              <button
                type="button"
                class="btn-trait-step"
                :disabled="weaponConfig.reachRank >= 6"
                @click="weaponConfig.reachRank = Math.min(6, weaponConfig.reachRank + 1)"
              >+</button>
              <span class="chip-cost">+{{ weaponConfig.reachRank }} EP</span>
            </div>
            <span v-else class="chip-cost-inactive">+1 EP / 5 ft</span>
          </div>
          <p>Extends melee striking reach by +5 feet per rank (max 30 ft).</p>
        </div>

        <!-- 5. Improved Range (Ranged only) -->
        <div
          v-if="weaponConfig.rangeType === 'Ranged'"
          class="trait-chip-card"
          :class="{ active: (weaponConfig.improvedRangeRanks || 0) > 0 }"
        >
          <div class="chip-top">
            <label class="chip-title-label">
              <input
                type="checkbox"
                :checked="(weaponConfig.improvedRangeRanks || 0) > 0"
                @change="toggleImprovedRangeCheckbox"
              />
              <span class="chk-custom-sm"></span>
              <strong>Improved Range</strong>
            </label>

            <div v-if="(weaponConfig.improvedRangeRanks || 0) > 0" class="trait-inline-stepper">
              <button
                type="button"
                class="btn-trait-step"
                :disabled="weaponConfig.improvedRangeRanks <= 1"
                @click="weaponConfig.improvedRangeRanks = Math.max(1, weaponConfig.improvedRangeRanks - 1)"
              >-</button>
              <span class="trait-step-val">{{ weaponConfig.improvedRangeRanks }} Rk</span>
              <button
                type="button"
                class="btn-trait-step"
                :disabled="weaponConfig.improvedRangeRanks >= 4"
                @click="weaponConfig.improvedRangeRanks = Math.min(4, weaponConfig.improvedRangeRanks + 1)"
              >+</button>
              <span class="chip-cost">+{{ weaponConfig.improvedRangeRanks }} EP</span>
            </div>
            <span v-else class="chip-cost-inactive">+1 EP / Rk</span>
          </div>
          <p>Doubles short, medium, and long range increments per rank (max 4 ranks).</p>
        </div>

        <!-- 6. Ricochet (Ranged only) -->
        <div
          v-if="weaponConfig.rangeType === 'Ranged'"
          class="trait-chip-card"
          :class="{ active: (weaponConfig.ricochetRanks || 0) > 0 }"
        >
          <div class="chip-top">
            <label class="chip-title-label">
              <input
                type="checkbox"
                :checked="(weaponConfig.ricochetRanks || 0) > 0"
                @change="toggleRicochetCheckbox"
              />
              <span class="chk-custom-sm"></span>
              <strong>Ricochet</strong>
            </label>

            <div v-if="(weaponConfig.ricochetRanks || 0) > 0" class="trait-inline-stepper">
              <button
                type="button"
                class="btn-trait-step"
                :disabled="weaponConfig.ricochetRanks <= 1"
                @click="weaponConfig.ricochetRanks = Math.max(1, weaponConfig.ricochetRanks - 1)"
              >-</button>
              <span class="trait-step-val">{{ weaponConfig.ricochetRanks }} Rk</span>
              <button
                type="button"
                class="btn-trait-step"
                :disabled="weaponConfig.ricochetRanks >= 5"
                @click="weaponConfig.ricochetRanks = Math.min(5, weaponConfig.ricochetRanks + 1)"
              >+</button>
              <span class="chip-cost">+{{ weaponConfig.ricochetRanks }} EP</span>
            </div>
            <span v-else class="chip-cost-inactive">+1 EP / Rk</span>
          </div>
          <p>Allows attacks to bounce off hard surfaces around 1 corner per rank (max 5).</p>
        </div>

        <!-- 7. Homing (Ranged only) -->
        <div
          v-if="weaponConfig.rangeType === 'Ranged'"
          class="trait-chip-card"
          :class="{ active: (weaponConfig.homingRanks || 0) > 0 }"
        >
          <div class="chip-top">
            <label class="chip-title-label">
              <input
                type="checkbox"
                :checked="(weaponConfig.homingRanks || 0) > 0"
                @change="toggleHomingCheckbox"
              />
              <span class="chk-custom-sm"></span>
              <strong>Homing</strong>
            </label>

            <div v-if="(weaponConfig.homingRanks || 0) > 0" class="trait-inline-stepper">
              <button
                type="button"
                class="btn-trait-step"
                :disabled="weaponConfig.homingRanks <= 1"
                @click="weaponConfig.homingRanks = Math.max(1, weaponConfig.homingRanks - 1)"
              >-</button>
              <span class="trait-step-val">{{ weaponConfig.homingRanks }} Rk</span>
              <button
                type="button"
                class="btn-trait-step"
                :disabled="weaponConfig.homingRanks >= 4"
                @click="weaponConfig.homingRanks = Math.min(4, weaponConfig.homingRanks + 1)"
              >+</button>
              <span class="chip-cost">+{{ weaponConfig.homingRanks }} EP</span>
            </div>
            <span v-else class="chip-cost-inactive">+1 EP / Rk</span>
          </div>
          <p>Allows 1 reroll on following rounds if an attack misses (guided missile/tracer).</p>
        </div>

        <!-- 8. Subtle / Silencer (Flat 1 EP) -->
        <div
          class="trait-chip-card"
          :class="{ active: weaponConfig.subtle }"
          @click="weaponConfig.subtle = !weaponConfig.subtle"
        >
          <div class="chip-top">
            <label class="chip-title-label" @click.stop>
              <input type="checkbox" v-model="weaponConfig.subtle" />
              <span class="chk-custom-sm"></span>
              <strong>{{ weaponConfig.rangeType === 'Ranged' ? 'Silencer / Suppressed' : 'Subtle (Concealable)' }}</strong>
            </label>
            <span class="chip-cost" :class="{ 'chip-cost-inactive': !weaponConfig.subtle }">+1 EP</span>
          </div>
          <p>{{ weaponConfig.rangeType === 'Ranged' ? 'Acoustic suppressor requiring DC 20 Perception check to locate.' : 'Easily concealable weapon (cane sword, boot dagger, hideout sleeve).' }}</p>
        </div>

        <!-- 9. Thrown (Melee only, Flat 1 EP) -->
        <div
          v-if="weaponConfig.rangeType === 'Close'"
          class="trait-chip-card"
          :class="{ active: weaponConfig.thrown }"
          @click="weaponConfig.thrown = !weaponConfig.thrown"
        >
          <div class="chip-top">
            <label class="chip-title-label" @click.stop>
              <input type="checkbox" v-model="weaponConfig.thrown" />
              <span class="chk-custom-sm"></span>
              <strong>Thrown Weapon</strong>
            </label>
            <span class="chip-cost" :class="{ 'chip-cost-inactive': !weaponConfig.thrown }">+1 EP</span>
          </div>
          <p>Aerodynamically balanced for thrown attacks at short range (tomahawks, knives).</p>
        </div>
      </div>
    </div>

    <!-- 3B. ARMOR EXTRAS -->
    <div v-else-if="selectedCategory === 'Armor'" class="traits-section">
      <div class="trait-chips-grid">
        <div
          v-for="extra in ARMOR_EXTRAS"
          :key="extra.id"
          class="trait-chip-card"
          :class="{ active: isArmorExtraActive(extra.id) }"
          @click="toggleArmorExtra(extra)"
        >
          <div class="chip-top">
            <strong>{{ extra.label }}</strong>
            <span class="chip-cost">+{{ extra.cost }} EP</span>
          </div>
          <p>{{ extra.desc }}</p>
        </div>
      </div>
    </div>

    <!-- 3C. VEHICLE FEATURES -->
    <div v-else-if="selectedCategory === 'Vehicle'" class="traits-section">
      <div class="features-summary-hint">
        <span>SELECT VEHICLE AMENITIES (+1 EP each):</span>
        <span class="features-count-tag">{{ vehicleConfig.features.length }} selected</span>
      </div>
      <div class="features-chips-grid">
        <button
          v-for="feat in VEHICLE_FEATURES"
          :key="feat"
          type="button"
          class="feature-toggle-pill"
          :class="{ active: vehicleConfig.features.includes(feat) }"
          @click="toggleVehicleFeature(feat)"
        >
          <i :class="vehicleConfig.features.includes(feat) ? 'ri-checkbox-circle-fill' : 'ri-add-line'"></i>
          <span>{{ feat }}</span>
        </button>
      </div>
    </div>

    <!-- 3D. HQ FEATURES -->
    <div v-else-if="selectedCategory === 'Headquarters'" class="traits-section">
      <div class="features-summary-hint">
        <span>SELECT HEADQUARTERS AMENITIES (+1 EP each):</span>
        <span class="features-count-tag">{{ hqConfig.features.length }} selected</span>
      </div>
      <div class="features-chips-grid">
        <button
          v-for="feat in HQ_FEATURES"
          :key="feat.name"
          type="button"
          class="feature-toggle-pill"
          :class="{ active: hqConfig.features.includes(feat.name) }"
          @click="toggleHQFeature(feat.name)"
        >
          <i :class="hqConfig.features.includes(feat.name) ? 'ri-checkbox-circle-fill' : 'ri-add-line'"></i>
          <span>{{ feat.name }}</span>
        </button>
      </div>
    </div>

    <!-- 3E. GADGET FEATURES -->
    <div v-else-if="selectedCategory === 'Gadget'" class="traits-section">
      <div class="eq-form-group">
        <label>Custom Gadget Effect / Traits Description</label>
        <textarea
          v-model="gadgetConfig.customDesc"
          rows="4"
          class="eq-textarea"
          placeholder="e.g. Movement 1 (Swinging), Senses 2 (Darkvision), or +2 to Treatment checks..."
        ></textarea>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ARMOR_EXTRAS } from '../../../rules/equipmentCalculator.js';
import { VEHICLE_FEATURES, HQ_FEATURES } from '../../../rules/resources.js';

const props = defineProps({
  selectedCategory: {
    type: String,
    required: true
  },
  weaponConfig: {
    type: Object,
    required: true
  },
  armorConfig: {
    type: Object,
    required: true
  },
  vehicleConfig: {
    type: Object,
    required: true
  },
  hqConfig: {
    type: Object,
    required: true
  },
  gadgetConfig: {
    type: Object,
    required: true
  }
});

function onToggleMultiattack() {
  if (props.weaponConfig.multiattack) {
    if (!props.weaponConfig.multiattackRanks || props.weaponConfig.multiattackRanks <= 0) {
      props.weaponConfig.multiattackRanks = props.weaponConfig.damageRank;
    }
  }
}

function stepMultiattack(delta) {
  const current = props.weaponConfig.multiattackRanks || props.weaponConfig.damageRank;
  const max = props.weaponConfig.damageRank;
  props.weaponConfig.multiattackRanks = Math.max(1, Math.min(max, current + delta));
}

function onToggleBurstArea() {
  if (props.weaponConfig.burstArea) {
    if (!props.weaponConfig.burstAreaRanks || props.weaponConfig.burstAreaRanks <= 0) {
      props.weaponConfig.burstAreaRanks = props.weaponConfig.damageRank;
    }
  }
}

function stepBurstArea(delta) {
  const current = props.weaponConfig.burstAreaRanks || props.weaponConfig.damageRank;
  const max = props.weaponConfig.damageRank;
  props.weaponConfig.burstAreaRanks = Math.max(1, Math.min(max, current + delta));
}

function togglePenetratingCheckbox() {
  if (props.weaponConfig.penetratingRank > 0) {
    props.weaponConfig.penetratingRank = 0;
  } else {
    props.weaponConfig.penetratingRank = props.weaponConfig.damageRank;
  }
}

function stepPenetrating(delta) {
  const current = props.weaponConfig.penetratingRank;
  const max = props.weaponConfig.damageRank;
  props.weaponConfig.penetratingRank = Math.max(1, Math.min(max, current + delta));
}

function toggleReachCheckbox() {
  if (props.weaponConfig.reachRank > 0) {
    props.weaponConfig.reachRank = 0;
  } else {
    props.weaponConfig.reachRank = 1;
  }
}

function toggleImprovedRangeCheckbox() {
  if ((props.weaponConfig.improvedRangeRanks || 0) > 0) {
    props.weaponConfig.improvedRangeRanks = 0;
    props.weaponConfig.improvedRange = false;
  } else {
    props.weaponConfig.improvedRangeRanks = 1;
    props.weaponConfig.improvedRange = true;
  }
}

function toggleRicochetCheckbox() {
  if ((props.weaponConfig.ricochetRanks || 0) > 0) {
    props.weaponConfig.ricochetRanks = 0;
    props.weaponConfig.ricochet = false;
  } else {
    props.weaponConfig.ricochetRanks = 1;
    props.weaponConfig.ricochet = true;
  }
}

function toggleHomingCheckbox() {
  if ((props.weaponConfig.homingRanks || 0) > 0) {
    props.weaponConfig.homingRanks = 0;
    props.weaponConfig.homing = false;
  } else {
    props.weaponConfig.homingRanks = 1;
    props.weaponConfig.homing = true;
  }
}

function isArmorExtraActive(extraId) {
  if (extraId === 'Subtle') return props.armorConfig.subtle;
  if (extraId === 'SecondChance') return props.armorConfig.secondChance;
  return (props.armorConfig.immunities || []).includes(extraId.replace('Immunity', ''));
}

function toggleArmorExtra(extra) {
  if (extra.id === 'Subtle') {
    props.armorConfig.subtle = !props.armorConfig.subtle;
  } else if (extra.id === 'SecondChance') {
    props.armorConfig.secondChance = !props.armorConfig.secondChance;
  } else {
    const key = extra.id.replace('Immunity', '');
    const arr = props.armorConfig.immunities || [];
    const idx = arr.indexOf(key);
    if (idx !== -1) arr.splice(idx, 1);
    else arr.push(key);
    props.armorConfig.immunities = [...arr];
  }
}

function toggleVehicleFeature(feat) {
  const arr = props.vehicleConfig.features;
  const idx = arr.indexOf(feat);
  if (idx !== -1) arr.splice(idx, 1);
  else arr.push(feat);
}

function toggleHQFeature(featName) {
  const arr = props.hqConfig.features;
  const idx = arr.indexOf(featName);
  if (idx !== -1) arr.splice(idx, 1);
  else arr.push(featName);
}
</script>
