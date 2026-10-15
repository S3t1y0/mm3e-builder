<template>
  <div class="step-equipment-container">
    <!-- STEP BANNER -->
    <div class="step-banner">
      <div class="step-banner-icon"><i class="ri-tools-line"></i></div>
      <div>
        <h3 class="step-title">Equipment & Gear</h3>
        <p class="step-subtitle">
          Equip your hero with weapons, armor, utility gadgets, vehicles, and headquarters.
          In M&M 3e, gear is bought with <strong>Equipment Points (EP)</strong> where <strong>1 PP Advantage = 5 EP</strong>.
        </p>
      </div>
    </div>

    <!-- EP Budget Banner -->
    <div class="card ep-budget-card mb-4" :class="budgetInfo.isOverBudget ? 'banner-warn' : 'banner-ok'">
      <div class="ep-budget-left">
        <div class="ep-stat-item">
          <span class="ep-stat-label">Total EP Used</span>
          <span class="ep-stat-val tabular-nums text-cyan">{{ budgetInfo.totalEP }} EP</span>
        </div>
        <div class="ep-stat-divider">/</div>
        <div class="ep-stat-item">
          <span class="ep-stat-label">Equipment Capacity</span>
          <span class="ep-stat-val tabular-nums">{{ budgetInfo.maxEP }} EP ({{ budgetInfo.ranks }} Ranks)</span>
        </div>
      </div>

      <div class="ep-budget-right">
        <template v-if="budgetInfo.isOverBudget">
          <div class="ep-status-alert">
            <i class="ri-alert-line"></i>
            <span>Deficit: <strong class="tabular-nums">{{ budgetInfo.totalEP - budgetInfo.maxEP }} EP</strong> (Requires Rank {{ budgetInfo.neededRanks }} Advantage)</span>
          </div>
          <button type="button" class="btn btn-danger btn-sm" @click="syncEquipmentAdvantage">
            <i class="ri-refresh-line"></i> Auto-Sync Advantage ({{ budgetInfo.neededRanks }} PP)
          </button>
        </template>
        <template v-else>
          <div class="ep-status-ok">
            <i class="ri-checkbox-circle-line"></i>
            <span>Budget Balanced (Remaining: <strong class="tabular-nums">{{ budgetInfo.remainingEP }} EP</strong>)</span>
          </div>
          <button
            v-if="budgetInfo.ranks > budgetInfo.neededRanks"
            type="button"
            class="btn btn-secondary btn-xs"
            @click="syncEquipmentAdvantage"
            title="Adjust advantage to exact needed ranks"
          >
            <i class="ri-refresh-line"></i> Adjust to {{ budgetInfo.neededRanks }} Ranks
          </button>
        </template>

        <button type="button" class="btn btn-secondary btn-sm" @click="openCustomStudio(activeFilter !== 'all' ? activeFilter : 'Weapons')">
          <i class="ri-tools-line"></i> Custom Gear Studio
        </button>
        <button type="button" class="btn btn-primary btn-sm" @click="showPresetModal = true">
          <i class="ri-book-read-line"></i> Preset Library
        </button>
      </div>
    </div>

    <!-- CATEGORY FILTER CHIPS -->
    <div class="card mb-4 filter-container-card">
      <div class="filter-pills-bar">
        <button
          v-for="cat in categories"
          :key="cat.id"
          type="button"
          class="filter-chip"
          :class="{ active: activeFilter === cat.id }"
          @click="activeFilter = cat.id"
        >
          <i v-if="cat.icon" :class="cat.icon"></i>
          <span>{{ cat.label }} ({{ getCategoryCount(cat.id) }})</span>
        </button>
      </div>
    </div>

    <!-- ACTIVE EQUIPMENT ITEMS GRID -->
    <div v-if="filteredResources.length === 0" class="card empty-equipment-card">
      <i class="ri-inbox-archive-line empty-icon"></i>
      <div v-if="(heroStore.character.resources || []).length === 0">
        <h4 class="empty-equip-title">No Equipment Added Yet</h4>
        <p class="empty-equip-desc">
          Equip your hero with standard weapons, armor, gadgets, vehicles, or headquarters.
        </p>
        <button type="button" class="btn btn-primary btn-sm" @click="showPresetModal = true">
          <i class="ri-shopping-bag-3-line"></i> Browse Equipment Catalog
        </button>
      </div>
      <div v-else>
        <p class="empty-equip-filter-notice">
          No equipment items found in category "<strong>{{ activeFilter }}</strong>".
        </p>
      </div>
    </div>

    <div v-else class="equipment-grid">
      <div
        v-for="item in filteredResources"
        :key="item.id"
        class="card equipment-item-card"
        :class="item.status === 'equipped' ? 'card-equipped' : 'card-unequipped'"
      >
        <div class="item-card-header">
          <div class="item-meta-info">
            <div class="item-icon-box">
              <i :class="getResIconClass(item)"></i>
            </div>
            <div>
              <div class="item-tags-row">
                <button
                  type="button"
                  class="status-toggle-pill"
                  :class="{ 'text-emerald': item.status === 'equipped' }"
                  @click="toggleStatus(item.id)"
                  title="Click to cycle status (Equipped -> In Bag -> Stored)"
                >
                  <i v-if="item.status === 'equipped' || !item.status" class="ri-checkbox-circle-fill"></i>
                  <i v-else-if="item.status === 'carried'" class="ri-inbox-line"></i>
                  <i v-else class="ri-archive-line"></i>
                  <span>{{ formatStatus(item.status) }}</span>
                </button>
              </div>
              <h5 class="item-name">{{ item.name }}</h5>
            </div>
          </div>

          <div class="item-actions">
            <span class="badge badge-primary ep-badge tabular-nums">
              {{ item.epCost ?? item.cost ?? 0 }} EP
            </span>
            <button
              type="button"
              class="btn-icon text-danger"
              @click="deleteResource(item.id, item.name)"
              title="Delete Item"
            >
              <i class="ri-delete-bin-line"></i>
            </button>
          </div>
        </div>

        <!-- TACTICAL SUMMARY CHIPS -->
        <div v-if="isWeapon(item)" class="tactical-chips-row">
          <span class="tactical-chip atk-chip tabular-nums">
            <i class="ri-dice-line"></i> Atk +{{ getWeaponAttackBonus(item) }}
          </span>
          <span class="tactical-chip dc-chip tabular-nums">
            DC {{ getWeaponDC(item) }} {{ getWeaponResistance(item) }}
          </span>
          <span class="tactical-chip range-chip">
            {{ getWeaponRange(item) }}
          </span>
          <span v-if="item.weapon?.crit" class="tactical-chip crit-chip tabular-nums">
            Crit {{ item.weapon.crit }}
          </span>
        </div>

        <div v-else-if="isShield(item)" class="tactical-chips-row">
          <span class="tactical-chip shield-chip tabular-nums">
            <i class="ri-shield-line"></i> +{{ getShieldBonus(item) }} Active Defense (Dodge & Parry)
          </span>
        </div>

        <div v-else-if="isArmor(item)" class="tactical-chips-row">
          <span class="tactical-chip armor-chip tabular-nums">
            <i class="ri-shield-check-line"></i> +{{ getArmorProtection(item) }} Protection
          </span>
        </div>

        <!-- ITEM DESCRIPTION -->
        <p v-if="item.desc" class="item-desc">{{ item.desc }}</p>
      </div>
    </div>

    <!-- PRESET CATALOG MODAL -->
    <div v-if="showPresetModal" class="modal-overlay" @click.self="showPresetModal = false">
      <div class="modal-content preset-modal-box">
        <div class="modal-header-row">
          <h4 style="font-weight: 800; color: #fff; margin: 0; font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem;">
            <i class="ri-book-read-line text-accent"></i> Standard Equipment Presets
          </h4>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <button
              type="button"
              class="btn btn-secondary btn-xs"
              @click="openCustomStudio(activeFilter !== 'all' ? activeFilter : 'Weapons')"
            >
              <i class="ri-tools-line"></i> Custom Equipment Studio
            </button>
            <button class="btn-icon text-muted" style="font-size: 1.25rem;" @click="showPresetModal = false" aria-label="Close dialog">
              <i class="ri-close-line"></i>
            </button>
          </div>
        </div>

        <div class="modal-tab-body">
          <div class="search-input-wrapper mb-3">
            <i class="ri-search-line search-icon"></i>
            <input
              v-model="presetSearch"
              type="text"
              class="form-control"
              placeholder="Search weapons, gadgets, armor, vehicles, HQ..."
              style="padding-left: 2.3rem;"
            />
          </div>

          <div class="preset-items-scroll">
            <div
              v-for="p in filteredPresets"
              :key="p.name"
              class="card preset-list-item"
            >
              <div class="preset-info">
                <div class="preset-head">
                  <strong class="preset-name">{{ p.name }}</strong>
                  <span class="badge badge-primary tabular-nums" style="font-size: 0.7rem;">{{ p.epCost }} EP</span>
                </div>
                <p class="preset-desc">{{ p.desc }}</p>
              </div>
              <button
                type="button"
                class="btn btn-secondary btn-xs"
                @click="addPreset(p)"
              >
                <i class="ri-add-line"></i> Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dedicated Custom Equipment Studio Modal -->
    <CustomEquipmentModal
      v-model="showCustomStudio"
      :initial-category="customStudioCategory"
    />
  </div>
</template>

<script setup>
import { useHeroStore } from '../../stores/heroStore.js';
import { useUiStore } from '../../stores/uiStore.js';
import { RESOURCE_CATEGORIES } from '../../rules/resources.js';
import { useEquipmentWorkflow } from '../../rules/useEquipmentWorkflow.js';
import CustomEquipmentModal from '../modals/CustomEquipmentModal.vue';

const heroStore = useHeroStore();
const uiStore = useUiStore();
const categories = RESOURCE_CATEGORIES;

const {
  activeFilter,
  showPresetModal,
  showCustomStudio,
  customStudioCategory,
  presetSearch,
  budgetInfo,
  openCustomStudio,
  getCategoryCount,
  filteredResources,
  filteredPresets,
  syncEquipmentAdvantage,
  toggleStatus,
  formatStatus,
  deleteResource,
  addPreset,
  getResIconClass,
  getSubtypeLabel,
  isWeapon,
  isShield,
  isArmor,
  getShieldBonus,
  getWeaponAttackBonus,
  getWeaponDC,
  getWeaponResistance,
  getWeaponRange,
  getArmorProtection
} = useEquipmentWorkflow(heroStore, uiStore);
</script>

<style scoped>
.step-equipment-container {
  width: 100%;
}

.step-banner {
  background: rgba(6, 182, 212, 0.08);
  border-color: rgba(6, 182, 212, 0.25);
}

.step-banner-icon {
  background: rgba(6, 182, 212, 0.2);
  color: #22d3ee;
}

/* EP Budget */
.ep-budget-card {
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  border-radius: var(--radius-md);
}

.ep-budget-card.banner-ok {
  background: rgba(16, 185, 129, 0.08);
  border-color: rgba(16, 185, 129, 0.3);
}

.ep-budget-card.banner-warn {
  background: rgba(239, 68, 68, 0.08);
  border-color: rgba(239, 68, 68, 0.4);
}

.ep-budget-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.ep-stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.ep-stat-label {
  font-size: 0.68rem;
  font-weight: 800;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.ep-stat-val {
  font-size: 1.2rem;
  font-weight: 900;
  color: #fff;
}

.text-cyan {
  color: #38bdf8;
}

.ep-stat-divider {
  font-size: 1.3rem;
  color: var(--text-muted);
  font-weight: 300;
}

.ep-budget-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.ep-status-ok {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  color: #34d399;
  font-size: 0.78rem;
  font-weight: 700;
}

.ep-status-alert {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  color: #f87171;
  font-size: 0.78rem;
}

/* Category Filter & Actions */
.filter-and-actions-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.filter-pills-bar {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  overflow-x: auto;
  scrollbar-width: thin;
}

.filter-container-card {
  padding: 0.75rem 1.25rem;
}

/* Empty Card */
.empty-equipment-card {
  padding: 3rem 1.5rem;
  text-align: center;
}

.empty-equip-title {
  color: #fff;
  margin: 0 0 0.4rem;
  font-size: 1rem;
  font-weight: 800;
}

.empty-equip-desc {
  font-size: 0.8rem;
  color: var(--text-secondary);
  max-width: 480px;
  margin: 0 auto 1rem;
}

.empty-equip-filter-notice {
  font-size: 0.82rem;
  color: var(--text-secondary);
  margin: 0;
}

.empty-icon {
  font-size: 2.5rem;
  color: var(--text-muted);
  margin-bottom: 0.75rem;
  display: inline-block;
}

/* Equipment Grid */
.equipment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 0.85rem;
}

.item-card {
  padding: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  background: rgba(15, 23, 42, 0.6);
  border-radius: var(--radius-sm);
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.item-card:hover {
  border-color: rgba(6, 182, 212, 0.4);
}

.item-unequipped {
  opacity: 0.65;
  border-style: dashed;
}

.item-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.65rem;
}

.item-meta-info {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  min-width: 0;
}

.item-icon-box {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-xs);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  color: #38bdf8;
  flex-shrink: 0;
}

.item-tags-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.15rem;
}

.status-toggle-pill {
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xs);
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--text-secondary);
  padding: 0.1rem 0.4rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.status-toggle-pill:hover {
  border-color: rgba(255, 255, 255, 0.3);
  color: #fff;
}

.text-emerald {
  color: #10b981;
}

.item-name {
  font-size: 0.92rem;
  font-weight: 800;
  color: #fff;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;
}

.ep-badge {
  font-size: 0.72rem;
  padding: 0.2rem 0.5rem;
}

/* Tactical Chips */
.tactical-chips-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.tactical-chip {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: var(--radius-xs);
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
}

.atk-chip {
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.3);
  color: #f87171;
}

.dc-chip {
  background: rgba(245, 158, 11, 0.12);
  border-color: rgba(245, 158, 11, 0.3);
  color: #fbbf24;
}

.armor-chip {
  background: rgba(16, 185, 129, 0.12);
  border-color: rgba(16, 185, 129, 0.3);
  color: #34d399;
}

.shield-chip {
  background: rgba(14, 165, 233, 0.12);
  border-color: rgba(56, 189, 248, 0.3);
  color: #38bdf8;
}

.item-desc {
  font-size: 0.76rem;
  color: var(--text-secondary);
  line-height: 1.45;
  margin: 0;
}

/* Preset Modal */
.preset-modal-box {
  max-width: 650px;
  width: 90vw;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}

.modal-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.85rem;
}

.modal-tab-body {
  overflow-y: auto;
  flex: 1;
}

.search-input-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  font-size: 1rem;
}

.preset-items-scroll {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 400px;
  overflow-y: auto;
  scrollbar-width: thin;
  padding-right: 0.25rem;
}

.preset-list-item {
  padding: 0.75rem 0.9rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.85rem;
  background: rgba(15, 23, 42, 0.7);
}

.preset-info {
  min-width: 0;
}

.preset-head {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-bottom: 0.2rem;
  flex-wrap: wrap;
}

.preset-name {
  color: #fff;
  font-size: 0.88rem;
}

.preset-desc {
  font-size: 0.74rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.4;
}
</style>
