<template>
  <div class="step-pane">
    <div class="step-pane-head">
      <h4>2. Base Specs</h4>
      <p>Set the damage rank, defense, size, or core stats for this item.</p>
    </div>

    <!-- 2A. WEAPONS SPEC FORM -->
    <div v-if="selectedCategory === 'Weapons'" class="spec-form-section">
      <!-- Range Mode Toggle -->
      <div class="spec-toggle-row">
        <label>Weapon Type & Range</label>
        <div class="range-toggle-group">
          <button
            type="button"
            class="toggle-btn"
            :class="{ active: weaponConfig.rangeType === 'Close' }"
            @click="weaponConfig.rangeType = 'Close'"
          >
            <i class="ri-sword-line"></i> Melee (1 EP/Rk)
          </button>
          <button
            type="button"
            class="toggle-btn"
            :class="{ active: weaponConfig.rangeType === 'Ranged' }"
            @click="weaponConfig.rangeType = 'Ranged'"
          >
            <i class="ri-focus-2-line"></i> Ranged (2 EP/Rk)
          </button>
        </div>
      </div>

      <!-- Damage Rank Stepper -->
      <div class="spec-stepper-box">
        <div class="stepper-box-info">
          <span class="box-title">Damage Rank</span>
          <span class="box-desc">
            Base damage output ({{ weaponConfig.rangeType === 'Ranged' ? '2 EP per rank' : '1 EP per rank' }}).
          </span>
        </div>
        <div class="studio-stepper-ctrl">
          <button
            type="button"
            class="btn-step"
            :disabled="weaponConfig.damageRank <= 1"
            @click="weaponConfig.damageRank = Math.max(1, weaponConfig.damageRank - 1)"
          >-</button>
          <span class="step-display-val">{{ weaponConfig.damageRank }}</span>
          <button
            type="button"
            class="btn-step"
            @click="weaponConfig.damageRank = weaponConfig.damageRank + 1"
          >+</button>
          <span class="step-cost-subtle">
            {{ weaponConfig.damageRank * (weaponConfig.rangeType === 'Ranged' ? 2 : 1) }} EP
          </span>
        </div>
      </div>

      <!-- Strength-Based Option (Melee Only) -->
      <div v-if="weaponConfig.rangeType === 'Close'" class="spec-checkbox-box">
        <label class="custom-chk-label">
          <input v-model="weaponConfig.isStrengthBased" type="checkbox" />
          <span class="chk-custom"></span>
          <div class="chk-text">
            <strong>Strength-Based Damage (+0 EP)</strong>
            <span>Adds hero's STR rank ({{ heroStore.effectiveAbilities?.STR || 0 }}) to the attack's final Damage DC.</span>
          </div>
        </label>
      </div>

      <!-- Attack Bonus Modifier -->
      <div class="spec-stepper-box">
        <div class="stepper-box-info">
          <span class="box-title">Accurate / Built-in Attack Bonus</span>
          <span class="box-desc">Laser sight, balanced grip, or optics (+1 EP per +1 bonus).</span>
        </div>
        <div class="studio-stepper-ctrl">
          <button
            type="button"
            class="btn-step"
            :disabled="weaponConfig.laserSightRanks <= 0"
            @click="weaponConfig.laserSightRanks = Math.max(0, weaponConfig.laserSightRanks - 1); weaponConfig.laserSight = weaponConfig.laserSightRanks > 0"
          >-</button>
          <span class="step-display-val">+{{ weaponConfig.laserSightRanks }}</span>
          <button
            type="button"
            class="btn-step"
            @click="weaponConfig.laserSightRanks = weaponConfig.laserSightRanks + 1; weaponConfig.laserSight = true"
          >+</button>
          <span class="step-cost-subtle">{{ weaponConfig.laserSightRanks }} EP</span>
        </div>
      </div>
    </div>

    <!-- 2B. ARMOR SPEC FORM -->
    <div v-else-if="selectedCategory === 'Armor'" class="spec-form-section">
      <!-- Protection Rank Stepper -->
      <div class="spec-stepper-box">
        <div class="stepper-box-info">
          <span class="box-title">Protection Rank (Toughness Bonus)</span>
          <span class="box-desc">+1 Toughness bonus per rank (1 EP per rank).</span>
        </div>
        <div class="studio-stepper-ctrl">
          <button
            type="button"
            class="btn-step"
            :disabled="armorConfig.protectionRank <= 1"
            @click="armorConfig.protectionRank = Math.max(1, armorConfig.protectionRank - 1)"
          >-</button>
          <span class="step-display-val">+{{ armorConfig.protectionRank }}</span>
          <button
            type="button"
            class="btn-step"
            @click="armorConfig.protectionRank = armorConfig.protectionRank + 1"
          >+</button>
          <span class="step-cost-subtle">{{ armorConfig.protectionRank }} EP</span>
        </div>
      </div>

      <!-- Impervious Toughness Stepper -->
      <div class="spec-stepper-box">
        <div class="stepper-box-info">
          <span class="box-title">Impervious Toughness</span>
          <span class="box-desc">Automatically shrugs off damage ranks of &le; &lceil;Impervious/2&rceil; (1 EP per rank).</span>
        </div>
        <div class="studio-stepper-ctrl">
          <button
            type="button"
            class="btn-step"
            :disabled="armorConfig.imperviousRank <= 0"
            @click="armorConfig.imperviousRank = Math.max(0, armorConfig.imperviousRank - 1)"
          >-</button>
          <span class="step-display-val">{{ armorConfig.imperviousRank }}</span>
          <button
            type="button"
            class="btn-step"
            @click="armorConfig.imperviousRank = armorConfig.imperviousRank + 1"
          >+</button>
          <span class="step-cost-subtle">{{ armorConfig.imperviousRank }} EP</span>
        </div>
      </div>

      <!-- Active Shield Stepper -->
      <div class="spec-stepper-box">
        <div class="stepper-box-info">
          <span class="box-title">Tactical Shield / Active Defense</span>
          <span class="box-desc">Deflection shield adding bonus to Dodge and Parry defenses (1 EP per rank).</span>
        </div>
        <div class="studio-stepper-ctrl">
          <button
            type="button"
            class="btn-step"
            :disabled="armorConfig.shieldRank <= 0"
            @click="armorConfig.shieldRank = Math.max(0, armorConfig.shieldRank - 1)"
          >-</button>
          <span class="step-display-val">+{{ armorConfig.shieldRank }}</span>
          <button
            type="button"
            class="btn-step"
            @click="armorConfig.shieldRank = armorConfig.shieldRank + 1"
          >+</button>
          <span class="step-cost-subtle">{{ armorConfig.shieldRank }} EP</span>
        </div>
      </div>
    </div>

    <!-- 2C. VEHICLES SPEC FORM -->
    <div v-else-if="selectedCategory === 'Vehicle'" class="spec-form-section">
      <!-- Vehicle Size Selector -->
      <div class="eq-form-group">
        <label>Vehicle Size Category</label>
        <select v-model="vehicleConfig.size" class="eq-select" @change="onVehicleSizeChange">
          <option v-for="sz in VEHICLE_SIZES" :key="sz.size" :value="sz.size">
            {{ sz.size }} (Base STR {{ sz.strBase }}, Def {{ sz.defMod }}, Tough {{ sz.toughBase }}): {{ sz.epCost }} EP
          </option>
        </select>
      </div>

      <!-- Strength Stepper -->
      <div class="spec-stepper-box">
        <div class="stepper-box-info">
          <span class="box-title">Vehicle Strength (STR)</span>
          <span class="box-desc">Base for {{ vehicleConfig.size }} is {{ getVehicleBaseStr(vehicleConfig.size) }}. +1 EP per STR above base.</span>
        </div>
        <div class="studio-stepper-ctrl">
          <button
            type="button"
            class="btn-step"
            :disabled="vehicleConfig.str <= getVehicleBaseStr(vehicleConfig.size)"
            @click="vehicleConfig.str = Math.max(getVehicleBaseStr(vehicleConfig.size), vehicleConfig.str - 1)"
          >-</button>
          <span class="step-display-val">{{ vehicleConfig.str }}</span>
          <button
            type="button"
            class="btn-step"
            @click="vehicleConfig.str = vehicleConfig.str + 1"
          >+</button>
          <span class="step-cost-subtle">+{{ Math.max(0, vehicleConfig.str - getVehicleBaseStr(vehicleConfig.size)) }} EP</span>
        </div>
      </div>

      <!-- Movement Mode & Speed Stepper -->
      <div class="spec-dual-row">
        <div class="eq-form-group">
          <label>Movement Mode</label>
          <select v-model="vehicleConfig.speedType" class="eq-select">
            <option value="Ground">Ground (Wheeled / Treads)</option>
            <option value="Flight">Flight (Air / Turbofan)</option>
            <option value="Swimming">Swimming (Marine / Sub)</option>
            <option value="Space">Spaceflight</option>
          </select>
        </div>

        <div class="spec-stepper-box speed-box">
          <div class="stepper-box-info">
            <span class="box-title">Speed Rank ({{ getSpeedMph(vehicleConfig.speedRank) }})</span>
            <span class="box-desc">1 EP per rank of movement.</span>
          </div>
          <div class="studio-stepper-ctrl">
            <button
              type="button"
              class="btn-step"
              :disabled="vehicleConfig.speedRank <= 1"
              @click="vehicleConfig.speedRank = Math.max(1, vehicleConfig.speedRank - 1)"
            >-</button>
            <span class="step-display-val">{{ vehicleConfig.speedRank }}</span>
            <button
              type="button"
              class="btn-step"
              @click="vehicleConfig.speedRank = vehicleConfig.speedRank + 1"
            >+</button>
            <span class="step-cost-subtle">{{ vehicleConfig.speedRank }} EP</span>
          </div>
        </div>
      </div>

      <!-- Vehicle Toughness -->
      <div class="spec-stepper-box">
        <div class="stepper-box-info">
          <span class="box-title">Toughness & Armor Plating</span>
          <span class="box-desc">Base for {{ vehicleConfig.size }} is {{ getVehicleBaseTough(vehicleConfig.size) }}. +1 EP per Toughness above base.</span>
        </div>
        <div class="studio-stepper-ctrl">
          <button
            type="button"
            class="btn-step"
            :disabled="vehicleConfig.toughness <= getVehicleBaseTough(vehicleConfig.size)"
            @click="vehicleConfig.toughness = Math.max(getVehicleBaseTough(vehicleConfig.size), vehicleConfig.toughness - 1)"
          >-</button>
          <span class="step-display-val">{{ vehicleConfig.toughness }}</span>
          <button
            type="button"
            class="btn-step"
            @click="vehicleConfig.toughness = vehicleConfig.toughness + 1"
          >+</button>
          <span class="step-cost-subtle">+{{ Math.max(0, vehicleConfig.toughness - getVehicleBaseTough(vehicleConfig.size)) }} EP</span>
        </div>
      </div>
    </div>

    <!-- 2D. HEADQUARTERS SPEC FORM -->
    <div v-else-if="selectedCategory === 'Headquarters'" class="spec-form-section">
      <!-- HQ Size Selector -->
      <div class="eq-form-group">
        <label>Headquarters Size Category</label>
        <select v-model="hqConfig.size" class="eq-select" @change="onHQSizeChange">
          <option v-for="sz in HQ_SIZES" :key="sz.size" :value="sz.size">
            {{ sz.size }} (Base Toughness {{ sz.toughBase }}): {{ sz.epCost }} EP, {{ sz.desc }}
          </option>
        </select>
      </div>

      <!-- HQ Toughness Stepper -->
      <div class="spec-stepper-box">
        <div class="stepper-box-info">
          <span class="box-title">Structural Toughness</span>
          <span class="box-desc">Base for {{ hqConfig.size }} is {{ getHQBaseTough(hqConfig.size) }}. +1 EP per Toughness above base.</span>
        </div>
        <div class="studio-stepper-ctrl">
          <button
            type="button"
            class="btn-step"
            :disabled="hqConfig.toughness <= getHQBaseTough(hqConfig.size)"
            @click="hqConfig.toughness = Math.max(getHQBaseTough(hqConfig.size), hqConfig.toughness - 1)"
          >-</button>
          <span class="step-display-val">{{ hqConfig.toughness }}</span>
          <button
            type="button"
            class="btn-step"
            @click="hqConfig.toughness = hqConfig.toughness + 1"
          >+</button>
          <span class="step-cost-subtle">+{{ Math.max(0, hqConfig.toughness - getHQBaseTough(hqConfig.size)) }} EP</span>
        </div>
      </div>
    </div>

    <!-- 2E. GADGETS SPEC FORM -->
    <div v-else-if="selectedCategory === 'Gadget'" class="spec-form-section">
      <div class="gadget-mode-tabs">
        <button
          type="button"
          class="g-mode-btn"
          :class="{ active: gadgetConfig.mode === 'pack' }"
          @click="gadgetConfig.mode = 'pack'"
        >
          <i class="ri-archive-line"></i> Standard Gadget Presets
        </button>
        <button
          type="button"
          class="g-mode-btn"
          :class="{ active: gadgetConfig.mode === 'custom' }"
          @click="gadgetConfig.mode = 'custom'"
        >
          <i class="ri-tools-line"></i> Custom Invention / Device
        </button>
      </div>

      <!-- Pack Selection Grid -->
      <div v-if="gadgetConfig.mode === 'pack'" class="gadget-packs-grid">
        <button
          v-for="pk in GADGET_PACKS"
          :key="pk.id"
          type="button"
          class="gadget-pack-card"
          :class="{ active: gadgetConfig.presetPackId === pk.id }"
          @click="$emit('select-gadget-pack', pk)"
        >
          <div class="g-pack-top">
            <strong>{{ pk.name }}</strong>
            <span class="g-pack-cost">{{ pk.cost }} EP</span>
          </div>
          <span class="g-pack-cat">{{ pk.category }}</span>
          <p class="g-pack-desc">{{ pk.desc }}</p>
        </button>
      </div>

      <!-- Custom Gadget Cost -->
      <div v-else class="custom-gadget-fields">
        <div class="spec-stepper-box">
          <div class="stepper-box-info">
            <span class="box-title">Custom Device Equipment Cost (EP)</span>
            <span class="box-desc">1 Equipment Point per rank of utility effect.</span>
          </div>
          <div class="studio-stepper-ctrl">
            <button
              type="button"
              class="btn-step"
              :disabled="gadgetConfig.customCost <= 1"
              @click="gadgetConfig.customCost = Math.max(1, gadgetConfig.customCost - 1)"
            >-</button>
            <span class="step-display-val">{{ gadgetConfig.customCost }}</span>
            <button
              type="button"
              class="btn-step"
              @click="gadgetConfig.customCost = gadgetConfig.customCost + 1"
            >+</button>
            <span class="step-cost-subtle">{{ gadgetConfig.customCost }} EP</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { VEHICLE_SIZES } from '../../../rules/resources.js';
import { HQ_SIZES, GADGET_PACKS } from '../../../rules/equipmentCalculator.js';
import {
  getVehicleBaseStr,
  getVehicleBaseTough,
  getHQBaseTough,
  getSpeedMph
} from './customEquipmentHelper.js';

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
  },
  heroStore: {
    type: Object,
    required: true
  }
});

defineEmits(['select-gadget-pack']);

function onVehicleSizeChange() {
  const sz = props.vehicleConfig.size;
  props.vehicleConfig.str = getVehicleBaseStr(sz);
  props.vehicleConfig.toughness = getVehicleBaseTough(sz);
  props.vehicleConfig.defense = VEHICLE_SIZES.find(s => s.size === sz)?.defMod ?? 1;
}

function onHQSizeChange() {
  props.hqConfig.toughness = getHQBaseTough(props.hqConfig.size);
}
</script>
