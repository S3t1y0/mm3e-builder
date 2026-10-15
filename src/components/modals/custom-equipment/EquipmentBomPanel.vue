<template>
  <div class="eq-live-bom-panel">
    <div class="bom-head">
      <i class="ri-calculator-line bom-icon"></i>
      <strong class="bom-title">LIVE COST BREAKDOWN</strong>
    </div>

    <!-- Current Item Card Preview -->
    <div class="bom-item-summary" :class="'bom-summary-' + selectedCategory.toLowerCase()">
      <div class="bom-item-top">
        <strong class="bom-item-name">{{ itemName || 'New Custom Item' }}</strong>
        <span class="bom-cat-badge" :class="'badge-' + selectedCategory.toLowerCase()">{{ selectedCategory }}</span>
      </div>
      <div class="bom-cost-row">
        <span class="bom-cost-label">Item Total:</span>
        <span class="bom-cost-total font-mono">{{ calculatedTotalCost }} EP</span>
      </div>
    </div>

    <!-- Item Cost Breakdown Lines -->
    <div class="bom-breakdown-list">
      <div
        v-for="line in (costBreakdown?.breakdown || [])"
        :key="line.label"
        class="bom-line-item"
      >
        <span class="bom-line-label">{{ line.label }}</span>
        <span class="bom-line-cost font-mono">{{ line.cost >= 0 ? `+${line.cost}` : line.cost }} EP</span>
      </div>
      <div v-if="!costBreakdown?.breakdown?.length" class="bom-empty-hint">
        Standard equipment base configuration
      </div>
    </div>

    <div class="bom-divider"></div>

    <!-- Total Cost Summary -->
    <div class="bom-total-row">
      <span class="bom-total-label">TOTAL EQUIPMENT COST:</span>
      <span class="bom-total-val font-mono">{{ calculatedTotalCost }} EP</span>
    </div>

    <!-- Hero Budget Impact Box (Polished Tactical Budget HUD) -->
    <div class="bom-budget-box" :class="projectedBudgetInfo?.isOverBudget ? 'is-deficit' : 'is-balanced'">
      <div class="budget-box-head">
        <div class="budget-head-title">
          <i :class="projectedBudgetInfo?.isOverBudget ? 'ri-error-warning-line text-amber' : 'ri-shield-check-line text-emerald'"></i>
          <strong>HERO EP BUDGET IMPACT</strong>
        </div>
        <span v-if="projectedBudgetInfo?.isOverBudget" class="budget-status-pill pill-deficit">
          Deficit
        </span>
        <span v-else class="budget-status-pill pill-ok">
          Balanced
        </span>
      </div>

      <!-- Subtle Progress Gauge -->
      <div class="budget-progress-track">
        <div
          class="budget-progress-fill"
          :class="projectedBudgetInfo?.isOverBudget ? 'fill-deficit' : 'fill-ok'"
          :style="{ width: `${Math.min(100, ((projectedBudgetInfo?.projectedUsed || 0) / Math.max(1, projectedBudgetInfo?.capacity || 1)) * 100)}%` }"
        ></div>
      </div>

      <div class="budget-stats-grid">
        <div class="b-stat">
          <span class="b-stat-lbl">Current Used:</span>
          <strong class="font-mono">{{ budgetInfo?.totalEP || 0 }} EP</strong>
        </div>
        <div class="b-stat">
          <span class="b-stat-lbl">After Adding:</span>
          <strong class="font-mono" :class="projectedBudgetInfo?.isOverBudget ? 'text-amber' : 'text-emerald'">
            {{ projectedBudgetInfo?.projectedUsed || 0 }} EP
          </strong>
        </div>
        <div class="b-stat full">
          <span class="b-stat-lbl">Available Capacity:</span>
          <strong class="font-mono">{{ budgetInfo?.maxEP || 0 }} EP ({{ budgetInfo?.ranks || 0 }} Ranks)</strong>
        </div>
      </div>

      <div v-if="projectedBudgetInfo?.isOverBudget" class="budget-alert-action">
        <p class="budget-deficit-text">
          Deficit of <strong>{{ projectedBudgetInfo.deficit }} EP</strong>. Requires Rank {{ projectedBudgetInfo.neededRanks }} Equipment Advantage.
        </p>
        <button type="button" class="btn-quick-sync" @click="$emit('sync-budget')">
          <i class="ri-flashlight-line"></i>
          <span>Auto-Sync Advantage (+{{ (projectedBudgetInfo.neededRanks || 0) - (budgetInfo?.ranks || 0) }} PP)</span>
        </button>
      </div>
      <div v-else class="budget-ok-badge">
        <i class="ri-checkbox-circle-fill"></i>
        <span>Remaining: <strong class="font-mono">{{ projectedBudgetInfo?.remaining || 0 }} EP</strong></span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  itemName: {
    type: String,
    default: ''
  },
  selectedCategory: {
    type: String,
    required: true
  },
  calculatedTotalCost: {
    type: Number,
    default: 0
  },
  costBreakdown: {
    type: Object,
    default: () => ({ breakdown: [] })
  },
  budgetInfo: {
    type: Object,
    default: () => ({ totalEP: 0, maxEP: 0, ranks: 0 })
  },
  projectedBudgetInfo: {
    type: Object,
    default: () => ({ projectedUsed: 0, capacity: 1, isOverBudget: false, deficit: 0, neededRanks: 0, remaining: 0 })
  }
});

defineEmits(['sync-budget']);
</script>
