<template>
  <div class="step-pane">
    <div class="step-pane-head">
      <h4>4. Review and Finalize</h4>
      <p>Check stats, edit the rules text if needed, and set item status.</p>
    </div>

    <!-- Tactical Stat Preview Card -->
    <div class="tactical-preview-card">
      <div class="preview-card-header">
        <div class="preview-title-box">
          <span class="preview-icon"><i :class="getCategoryIcon(selectedCategory)"></i></span>
          <div>
            <strong class="preview-name">{{ itemName || 'Unnamed Equipment' }}</strong>
            <span class="preview-type">{{ selectedCategory.toUpperCase() }}</span>
          </div>
        </div>
        <span class="preview-ep-badge">{{ calculatedTotalCost }} EP</span>
      </div>

      <!-- Tactical Chips -->
      <div v-if="selectedCategory === 'Weapons'" class="preview-chips-row">
        <span class="prev-chip chip-atk">
          <i class="ri-crosshair-2-line"></i> Atk +{{ calculatedAtkBonus }}
        </span>
        <span class="prev-chip chip-dc">
          <i class="ri-shield-flash-line"></i> DC {{ calculatedDc }} Toughness
        </span>
        <span class="prev-chip chip-range">
          {{ weaponConfig.rangeType === 'Ranged' ? 'Ranged' : (weaponConfig.isStrengthBased ? 'Melee (STR)' : 'Close') }}
        </span>
        <span v-if="weaponConfig.critBonus > 0" class="prev-chip chip-crit">
          Crit {{ 20 - weaponConfig.critBonus }}-20
        </span>
      </div>

      <div v-else-if="selectedCategory === 'Armor'" class="preview-chips-row">
        <span class="prev-chip chip-armor">
          <i class="ri-shield-line"></i> +{{ armorConfig.protectionRank }} Protection
        </span>
        <span v-if="armorConfig.imperviousRank > 0" class="prev-chip chip-imperv">
          Impervious {{ armorConfig.imperviousRank }}
        </span>
        <span v-if="armorConfig.shieldRank > 0" class="prev-chip chip-shield">
          +{{ armorConfig.shieldRank }} Shield
        </span>
      </div>

      <div v-else-if="selectedCategory === 'Vehicle'" class="preview-chips-row">
        <span class="prev-chip">Size: {{ vehicleConfig.size }}</span>
        <span class="prev-chip">STR: {{ vehicleConfig.str }}</span>
        <span class="prev-chip">Speed: {{ getSpeedMph(vehicleConfig.speedRank) }}</span>
        <span class="prev-chip">Toughness: {{ vehicleConfig.toughness }}</span>
      </div>

      <div v-else-if="selectedCategory === 'Headquarters'" class="preview-chips-row">
        <span class="prev-chip">Size: {{ hqConfig.size }}</span>
        <span class="prev-chip">Toughness: {{ hqConfig.toughness }}</span>
        <span class="prev-chip">{{ hqConfig.features.length }} Amenities</span>
      </div>

      <!-- Rules Text Box -->
      <div class="eq-form-group mt-3">
        <div class="eq-label-row">
          <label>Rules Text</label>
          <button type="button" class="btn-refresh-text" @click="$emit('regenerate-description')">
            <i class="ri-refresh-line"></i> Reset to default
          </button>
        </div>
        <textarea
          :value="customDescription"
          @input="$emit('update:customDescription', $event.target.value)"
          rows="3"
          class="eq-textarea"
          placeholder="Rules description..."
        ></textarea>
      </div>

      <!-- Initial Status Selector -->
      <div class="status-select-row mt-3">
        <label>Initial status:</label>
        <div class="status-options">
          <button
            type="button"
            class="status-opt-btn"
            :class="{ active: itemStatus === 'equipped' }"
            @click="$emit('update:itemStatus', 'equipped')"
          >
            <i class="ri-checkbox-circle-line"></i> Equipped
          </button>
          <button
            type="button"
            class="status-opt-btn"
            :class="{ active: itemStatus === 'carried' }"
            @click="$emit('update:itemStatus', 'carried')"
          >
            <i class="ri-inbox-line"></i> Carried
          </button>
          <button
            type="button"
            class="status-opt-btn"
            :class="{ active: itemStatus === 'stored' }"
            @click="$emit('update:itemStatus', 'stored')"
          >
            <i class="ri-archive-line"></i> Stored
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getCategoryIcon, getSpeedMph } from './customEquipmentHelper.js';

defineProps({
  selectedCategory: {
    type: String,
    required: true
  },
  itemName: {
    type: String,
    default: ''
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
  calculatedAtkBonus: {
    type: Number,
    default: 0
  },
  calculatedDc: {
    type: Number,
    default: 15
  },
  calculatedTotalCost: {
    type: Number,
    default: 0
  },
  customDescription: {
    type: String,
    default: ''
  },
  itemStatus: {
    type: String,
    default: 'equipped'
  }
});

defineEmits(['update:customDescription', 'update:itemStatus', 'regenerate-description']);
</script>
