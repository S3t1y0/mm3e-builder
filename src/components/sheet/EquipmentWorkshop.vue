<template>
  <div class="equipment-workshop">
    <!-- Header -->
    <div class="workshop-header">
      <div class="header-info">
        <h3 class="workshop-title">Equipment & Resources</h3>
        <p class="workshop-sub">1 Power Point grants 5 Equipment Points (EP). Gear, weapons, vehicles, and headquarters.</p>
      </div>
      <div class="header-actions">
        <button type="button" class="btn-secondary-custom" @click="openCustomStudio(activeFilter !== 'all' ? activeFilter : 'Weapons')">
          <i class="ri-tools-line"></i> Custom Gear Studio
        </button>
        <button type="button" class="btn-primary-add" @click="showPresetModal = true">
          <i class="ri-book-read-line"></i> Preset Library
        </button>
      </div>
    </div>

    <!-- Minimalist Stat Strip (Tactical EP Budget Bar) -->
    <div class="eq-stat-strip" :class="budgetInfo.isOverBudget ? 'strip-deficit' : 'strip-balanced'">
      <div class="strip-metrics-cluster">
        <div class="strip-metric-item">
          <span class="strip-label">USED</span>
          <span class="strip-value font-mono highlight">{{ budgetInfo.totalEP }} <small>EP</small></span>
        </div>
        <span class="strip-sep">/</span>
        <div class="strip-metric-item">
          <span class="strip-label">CAPACITY</span>
          <span class="strip-value font-mono">{{ budgetInfo.maxEP }} <small>EP</small></span>
          <span class="strip-sub">({{ budgetInfo.ranks }} Rks)</span>
        </div>
        <span class="strip-sep">|</span>
        <div class="strip-metric-item" :class="budgetInfo.isOverBudget ? 'status-deficit' : 'status-ok'">
          <template v-if="budgetInfo.isOverBudget">
            <span class="strip-label">DEFICIT</span>
            <span class="strip-value font-mono val-warn">{{ budgetInfo.totalEP - budgetInfo.maxEP }} <small>EP</small></span>
            <span class="strip-sub">(Req Rk {{ budgetInfo.neededRanks }})</span>
          </template>
          <template v-else>
            <span class="strip-label">REMAINING</span>
            <span class="strip-value font-mono val-ok">{{ budgetInfo.remainingEP }} <small>EP</small></span>
          </template>
        </div>
      </div>

      <div class="strip-actions-cluster">
        <button
          v-if="budgetInfo.isOverBudget"
          type="button"
          class="btn-strip-sync btn-sync-deficit"
          @click="syncEquipmentAdvantage"
          title="Auto-Sync Advantage ranks to cover deficit"
        >
          <i class="ri-flashlight-line"></i>
          <span>Auto-Sync (+{{ budgetInfo.neededRanks - budgetInfo.ranks }} PP)</span>
        </button>
        <button
          v-else-if="budgetInfo.ranks > budgetInfo.neededRanks"
          type="button"
          class="btn-strip-sync btn-sync-adjust"
          @click="syncEquipmentAdvantage"
          title="Adjust advantage to exact needed ranks"
        >
          <i class="ri-refresh-line"></i>
          <span>Adjust to {{ budgetInfo.neededRanks }} Rks</span>
        </button>
        <div v-else class="strip-badge-ok">
          <i class="ri-checkbox-circle-fill"></i>
          <span>Budget OK</span>
        </div>
      </div>
    </div>

    <!-- Category Filters -->
    <div class="res-categories-bar">
      <div class="filter-pills-bar" v-drag-scroll>
        <button
          v-for="cat in categories"
          :key="cat.id"
          type="button"
          class="filter-chip"
          :class="[
            'chip-' + (cat.id.toLowerCase()),
            { active: activeFilter === cat.id }
          ]"
          @click="activeFilter = cat.id"
        >
          <i v-if="cat.icon" :class="cat.icon"></i>
          <span>{{ cat.label }}</span>
          <span class="chip-count">({{ getCategoryCount(cat.id) }})</span>
        </button>
      </div>
    </div>

    <!-- Items Grid -->
    <div v-if="filteredResources.length === 0" class="empty-hint">
      <i class="ri-inbox-archive-line empty-icon"></i>
      <p v-if="(heroStore.character.resources || []).length === 0">
        Equipment library is empty. Click "Preset Library" or "Custom Gear Studio" to add items to your character sheet.
      </p>
      <p v-else>
        No equipment items found in category "{{ activeFilter }}".
      </p>
    </div>

    <div v-else class="res-grid">
      <div
        v-for="item in filteredResources"
        :key="item.id"
        class="res-card"
        :class="[
          'cat-border-' + getItemCategoryKey(item),
          item.status === 'equipped' ? 'card-equipped' : 'card-unequipped'
        ]"
      >
        <div class="res-card-top">
          <div class="res-title-box">
            <span class="res-icon" :class="'icon-' + getItemCategoryKey(item)">
              <i :class="getResIconClass(item)"></i>
            </span>
            <div class="res-naming">
              <div class="res-badges-row">
                <span class="badge-subtle" :class="'badge-' + getItemCategoryKey(item)">{{ getSubtypeLabel(item) }}</span>
                <button
                  type="button"
                  class="res-status-pill"
                  :class="'status-' + (item.status || 'equipped')"
                  @click="toggleStatus(item.id)"
                  title="Click to cycle status: Equipped → Carried → Stored"
                >
                  <span class="status-dot"></span>
                  <span>{{ formatStatus(item.status) }}</span>
                </button>
              </div>
              <strong class="res-card-name">{{ item.name }}</strong>
            </div>
          </div>

          <div class="res-top-actions">
            <span class="ep-tag font-mono">{{ item.epCost ?? item.cost ?? 0 }} EP</span>
            <button
              type="button"
              class="btn-icon-subtle"
              @click="openCustomStudio(item.category || item.type || 'Weapons')"
              title="Open in Custom Studio"
            >
              <i class="ri-edit-line"></i>
            </button>
            <button
              type="button"
              class="btn-icon-subtle"
              @click="exportRoll20(item)"
              title="Copy Roll20 Macro / Text"
            >
              <i class="ri-broadcast-line"></i>
            </button>
            <button
              type="button"
              class="btn-icon-subtle btn-delete"
              @click="deleteResource(item.id, item.name)"
              title="Delete Item"
            >
              <i class="ri-delete-bin-line"></i>
            </button>
          </div>
        </div>

        <!-- Tactical Chips Row -->
        <div v-if="isWeapon(item)" class="res-tactical-chips">
          <button
            type="button"
            class="res-chip chip-atk interactive-chip"
            @click="rollWeaponAttack(item)"
            title="Click to roll attack check (d20 + bonus)"
          >
            <i class="ri-dice-line"></i> Atk +{{ getWeaponAttackBonus(item) }}
          </button>
          <span class="res-chip chip-dc">
            DC {{ getWeaponDC(item) }} {{ getWeaponResistance(item) }}
          </span>
          <span class="res-chip chip-range">
            {{ getWeaponRange(item) }}
          </span>
          <span v-if="item.weapon?.crit" class="res-chip chip-crit">
            Crit {{ item.weapon.crit }}
          </span>
          <span v-for="tr in (item.weapon?.traits || [])" :key="tr" class="res-chip chip-trait">
            {{ tr }}
          </span>
        </div>

        <div v-else-if="isShield(item)" class="res-tactical-chips">
          <span class="res-chip chip-shield">
            <i class="ri-shield-line"></i> +{{ getShieldBonus(item) }} Active Defense (Dodge & Parry)
          </span>
        </div>

        <div v-else-if="isArmor(item)" class="res-tactical-chips">
          <span class="res-chip chip-armor">
            <i class="ri-shield-check-line"></i> +{{ getArmorProtection(item) }} Protection
          </span>
          <span v-if="item.armor?.imperviousRank" class="res-chip chip-imperv">
            Impervious {{ item.armor.imperviousRank }}
          </span>
        </div>

        <div v-else-if="item.vehicle || item.type === 'Vehicle'" class="res-tactical-chips">
          <span v-if="item.vehicle?.size" class="res-chip chip-vehicle">Size: {{ item.vehicle.size }}</span>
          <span v-if="item.vehicle?.speedMph" class="res-chip chip-vehicle">Speed: {{ item.vehicle.speedMph }}</span>
          <span v-if="item.vehicle?.toughness" class="res-chip chip-vehicle">Tough: {{ item.vehicle.toughness }}</span>
        </div>

        <div v-else-if="item.hq || item.type === 'Headquarters'" class="res-tactical-chips">
          <span v-if="item.hq?.size" class="res-chip chip-hq">Size: {{ item.hq.size }}</span>
          <span v-if="item.hq?.toughness" class="res-chip chip-hq">Tough: {{ item.hq.toughness }}</span>
          <span v-if="item.hq?.features?.length" class="res-chip chip-hq">{{ item.hq.features.length }} Features</span>
        </div>

        <!-- Description -->
        <p v-if="item.desc" class="res-desc">{{ item.desc }}</p>
      </div>
    </div>

    <!-- Standard Presets Catalog Modal -->
    <transition name="fade">
      <div v-if="showPresetModal" class="preset-modal-backdrop" @click.self="showPresetModal = false">
        <div class="preset-modal-card">
          <div class="preset-modal-header">
            <h4><i class="ri-book-read-line"></i> Standard Equipment Presets</h4>
            <div class="modal-header-actions">
              <button
                type="button"
                class="btn-studio-direct"
                @click="openCustomStudio(activeFilter !== 'all' ? activeFilter : 'Weapons')"
              >
                <i class="ri-tools-line"></i> Custom Equipment Studio
              </button>
              <button type="button" class="preset-modal-close" @click="showPresetModal = false">
                <i class="ri-close-line"></i>
              </button>
            </div>
          </div>

          <div class="preset-modal-body">
            <div class="preset-search-row">
              <i class="ri-search-line"></i>
              <input
                v-model="presetSearch"
                type="text"
                placeholder="Search weapons, gadgets, armor, vehicles..."
              />
            </div>

            <div class="preset-items-list">
              <div
                v-for="p in filteredPresets"
                :key="p.name"
                class="preset-item-row"
              >
                <div class="preset-item-info">
                  <div class="preset-item-title-row">
                    <strong>{{ p.name }}</strong>
                    <span class="preset-type-pill">{{ p.subtype || p.type }}</span>
                    <span class="preset-cost-pill">{{ p.epCost }} EP</span>
                  </div>
                  <p class="preset-item-desc">{{ p.desc }}</p>
                </div>
                <button
                  type="button"
                  class="btn-add-preset"
                  @click="addPreset(p)"
                >
                  <i class="ri-add-line"></i> Add
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

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
import { sendFeatureToVTT } from '../../services/vttBridge.js';
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
  getItemCategoryKey,
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

function rollWeaponAttack(item) {
  const bonus = getWeaponAttackBonus(item);
  heroStore.rollCheck(`${item.name} Attack`, bonus, null, 'Attack');
}

function exportRoll20(item) {
  const text = `**${item.name}** [${item.epCost ?? 0} EP]\n${item.desc || ''}`;

  // Broadcast to Roll20 via Chrome Extension
  sendFeatureToVTT({
    name: item.name,
    category: 'equipment',
    type: 'Equipment',
    subtype: item.category || 'General',
    cost: item.epCost || 0,
    description: item.desc || '',
    details: `${item.category || 'Equipment'} • Cost: ${item.epCost || 0} EP`
  }, heroStore.character);

  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
    uiStore.showToast(`Broadcasted "${item.name}" to Roll20 & copied to clipboard!`, 'info');
  } else {
    uiStore.showToast(`Broadcasted "${item.name}" to Roll20!`, 'info');
  }
}
</script>

<style scoped>
.equipment-workshop {
  display: flex;
  flex-direction: column;
  gap: 0.95rem;
}

.workshop-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.workshop-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: #fff;
  margin: 0 0 0.15rem 0;
  letter-spacing: -0.01em;
}

.workshop-sub {
  font-size: 0.74rem;
  color: var(--text-muted, #94a3b8);
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-secondary-custom {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: #e2e8f0;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0.45rem 0.85rem;
  border-radius: var(--radius-xs, 4px);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  transition: all 0.15s ease;
}

.btn-secondary-custom:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border-color: rgba(255, 255, 255, 0.25);
}

.btn-primary-add {
  background: rgba(56, 189, 248, 0.14);
  border: 1px solid rgba(56, 189, 248, 0.35);
  color: #38bdf8;
  font-size: 0.78rem;
  font-weight: 800;
  padding: 0.45rem 0.95rem;
  border-radius: var(--radius-xs, 4px);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  transition: all 0.15s ease;
}

.btn-primary-add:hover {
  background: #38bdf8;
  color: #090d16;
  border-color: #7dd3fc;
  box-shadow: 0 2px 12px rgba(56, 189, 248, 0.35);
}

/* ==========================================================================
   MINIMALIST STAT STRIP (TACTICAL EP BUDGET BAR)
   ========================================================================== */
.eq-stat-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0.95rem;
  background: rgba(15, 23, 42, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-sm, 6px);
  gap: 1rem;
  flex-wrap: wrap;
  backdrop-filter: blur(8px);
}

.eq-stat-strip.strip-deficit {
  border-color: rgba(245, 158, 11, 0.35);
  background: rgba(28, 24, 18, 0.7);
}

.strip-metrics-cluster {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  flex-wrap: wrap;
}

.strip-metric-item {
  display: flex;
  align-items: baseline;
  gap: 0.35rem;
}

.strip-label {
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: #94a3b8;
  text-transform: uppercase;
}

.strip-value {
  font-size: 0.95rem;
  font-weight: 800;
  color: #fff;
}

.strip-value small {
  font-size: 0.7rem;
  font-weight: 600;
  color: #94a3b8;
}

.strip-sub {
  font-size: 0.7rem;
  color: #94a3b8;
}

.strip-sep {
  color: rgba(255, 255, 255, 0.15);
  font-weight: 300;
  font-size: 0.9rem;
}

.val-warn {
  color: #fbbf24 !important;
}

.val-ok {
  color: #34d399 !important;
}

.strip-actions-cluster {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-strip-sync {
  font-size: 0.72rem;
  font-weight: 800;
  padding: 0.3rem 0.65rem;
  border-radius: var(--radius-xs, 4px);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  transition: all 0.15s ease;
}

.btn-sync-deficit {
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.4);
  color: #fbbf24;
}

.btn-sync-deficit:hover {
  background: #f59e0b;
  color: #090d16;
  border-color: #fbbf24;
}

.btn-sync-adjust {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #94a3b8;
}

.btn-sync-adjust:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}

.strip-badge-ok {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.74rem;
  font-weight: 700;
  color: #34d399;
}

/* ==========================================================================
   CATEGORY FILTERS BAR
   ========================================================================== */
.res-categories-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.85rem;
  flex-wrap: wrap;
}

.filter-pills-bar {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  overflow-x: auto;
  padding-bottom: 2px;
}

.filter-chip {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #94a3b8;
  font-size: 0.74rem;
  font-weight: 700;
  padding: 0.35rem 0.75rem;
  border-radius: var(--radius-xs, 4px);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.filter-chip:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.filter-chip.active {
  background: rgba(56, 189, 248, 0.15);
  border-color: rgba(56, 189, 248, 0.45);
  color: #38bdf8;
  box-shadow: 0 0 10px rgba(56, 189, 248, 0.2);
}

.chip-count {
  font-size: 0.68rem;
  opacity: 0.75;
}

/* ==========================================================================
   POLISHED TACTICAL ITEM CARDS
   ========================================================================== */
.res-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 0.85rem;
}

.res-card {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-left: 3px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-sm, 6px);
  padding: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  transition: all 0.15s ease;
  position: relative;
}

.res-card.cat-border-weapon { border-left-color: #f87171; }
.res-card.cat-border-armor { border-left-color: #60a5fa; }
.res-card.cat-border-gadget { border-left-color: #34d399; }
.res-card.cat-border-vehicle { border-left-color: #38bdf8; }
.res-card.cat-border-hq { border-left-color: #c084fc; }

.res-card:hover {
  background: rgba(22, 33, 56, 0.75);
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.4);
}

.card-unequipped {
  opacity: 0.65;
  border-style: dashed;
  border-left-style: solid;
}

.res-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.65rem;
}

.res-title-box {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  min-width: 0;
}

.res-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-xs, 4px);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  flex-shrink: 0;
}

.res-icon.icon-weapon { background: rgba(248, 113, 113, 0.12); border-color: rgba(248, 113, 113, 0.3); color: #f87171; }
.res-icon.icon-armor { background: rgba(96, 165, 250, 0.12); border-color: rgba(96, 165, 250, 0.3); color: #60a5fa; }
.res-icon.icon-gadget { background: rgba(52, 211, 153, 0.12); border-color: rgba(52, 211, 153, 0.3); color: #34d399; }
.res-icon.icon-vehicle { background: rgba(56, 189, 248, 0.12); border-color: rgba(56, 189, 248, 0.3); color: #38bdf8; }
.res-icon.icon-hq { background: rgba(192, 132, 252, 0.12); border-color: rgba(192, 132, 252, 0.3); color: #c084fc; }

.res-naming {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.res-badges-row {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.badge-subtle {
  font-size: 0.62rem;
  font-weight: 800;
  padding: 0.08rem 0.4rem;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 3px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.badge-weapon { color: #f87171; background: rgba(248, 113, 113, 0.08); }
.badge-armor { color: #60a5fa; background: rgba(96, 165, 250, 0.08); }
.badge-gadget { color: #34d399; background: rgba(52, 211, 153, 0.08); }
.badge-vehicle { color: #38bdf8; background: rgba(56, 189, 248, 0.08); }
.badge-hq { color: #c084fc; background: rgba(192, 132, 252, 0.08); }

.res-status-pill {
  font-size: 0.62rem;
  font-weight: 700;
  padding: 0.08rem 0.45rem;
  border-radius: 3px;
  border: 1px solid transparent;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: transparent;
  transition: all 0.15s ease;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.res-status-pill.status-equipped {
  color: #34d399;
  border-color: rgba(52, 211, 153, 0.25);
  background: rgba(52, 211, 153, 0.1);
}
.res-status-pill.status-equipped .status-dot {
  background: #34d399;
  box-shadow: 0 0 6px rgba(52, 211, 153, 0.6);
}

.res-status-pill.status-carried {
  color: #38bdf8;
  border-color: rgba(56, 189, 248, 0.25);
  background: rgba(56, 189, 248, 0.1);
}
.res-status-pill.status-carried .status-dot {
  background: #38bdf8;
}

.res-status-pill.status-stored {
  color: #94a3b8;
  border-color: rgba(148, 163, 184, 0.25);
  background: rgba(148, 163, 184, 0.1);
}
.res-status-pill.status-stored .status-dot {
  background: #94a3b8;
}

.res-card-name {
  font-size: 0.92rem;
  font-weight: 800;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.res-top-actions {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-shrink: 0;
}

.ep-tag {
  font-size: 0.74rem;
  font-weight: 800;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.25);
  border-radius: 3px;
  padding: 0.15rem 0.45rem;
}

.btn-icon-subtle {
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 0.95rem;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon-subtle:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

.btn-icon-subtle.btn-delete:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.15);
}

/* ==========================================================================
   TACTICAL CHIPS ROW
   ========================================================================== */
.res-tactical-chips {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.res-chip {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.15rem 0.45rem;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.res-chip.chip-atk {
  background: rgba(248, 113, 113, 0.12);
  border-color: rgba(248, 113, 113, 0.35);
  color: #fca5a5;
}

.interactive-chip {
  cursor: pointer;
  transition: all 0.15s ease;
}

.interactive-chip:hover {
  background: #dc2626;
  color: #fff;
  border-color: #ef4444;
}

.res-chip.chip-dc {
  background: rgba(56, 189, 248, 0.1);
  border-color: rgba(56, 189, 248, 0.25);
  color: #7dd3fc;
}

.res-chip.chip-range {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.12);
  color: #94a3b8;
}

.res-chip.chip-crit {
  background: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.3);
  color: #fbbf24;
}

.res-chip.chip-trait {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.08);
  color: #94a3b8;
}

.res-chip.chip-shield {
  background: rgba(56, 189, 248, 0.12);
  border-color: rgba(56, 189, 248, 0.3);
  color: #38bdf8;
}

.res-chip.chip-armor {
  background: rgba(52, 211, 153, 0.12);
  border-color: rgba(52, 211, 153, 0.3);
  color: #34d399;
}

.res-chip.chip-imperv {
  background: rgba(168, 85, 247, 0.12);
  border-color: rgba(168, 85, 247, 0.3);
  color: #c084fc;
}

.res-chip.chip-vehicle {
  background: rgba(56, 189, 248, 0.1);
  border-color: rgba(56, 189, 248, 0.25);
  color: #7dd3fc;
}

.res-chip.chip-hq {
  background: rgba(192, 132, 252, 0.1);
  border-color: rgba(192, 132, 252, 0.25);
  color: #d8b4fe;
}

.res-desc {
  font-size: 0.74rem;
  color: #94a3b8;
  line-height: 1.4;
  margin: 0;
}

.empty-hint {
  padding: 2.5rem 1rem;
  text-align: center;
  color: #64748b;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.empty-icon {
  font-size: 2.2rem;
  color: rgba(255, 255, 255, 0.2);
}

/* Modal */
.preset-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
}

.preset-modal-card {
  background: #14141e;
  border: 1px solid rgba(220, 38, 38, 0.4);
  border-radius: var(--radius-lg);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
  width: 100%;
  max-width: 680px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.preset-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.95rem 1.25rem;
  background: rgba(220, 38, 38, 0.08);
  border-bottom: 1px solid rgba(220, 38, 38, 0.25);
}

.preset-modal-header h4 {
  font-size: 1rem;
  font-weight: 800;
  color: #fff;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.preset-modal-close {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 1.2rem;
  cursor: pointer;
}

.preset-modal-close:hover {
  color: #fff;
}

.modal-tab-bar {
  display: flex;
  align-items: center;
  background: rgba(10, 10, 15, 0.6);
  border-bottom: 1px solid var(--border-subtle);
}

.modal-tab-btn {
  flex: 1;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  padding: 0.75rem 1rem;
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  transition: all var(--trans-fast);
}

.modal-tab-btn.active {
  color: #fff;
  border-bottom-color: #ef4444;
  background: rgba(220, 38, 38, 0.06);
}

.preset-modal-body {
  padding: 1.15rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.preset-search-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(20, 20, 28, 0.9);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 0.45rem 0.75rem;
  transition: border-color var(--trans-fast);
}

.preset-search-row:focus-within {
  border-color: var(--accent-secondary, #2a8fd6);
  box-shadow: 0 0 0 2px rgba(42, 143, 214, 0.25);
}

.preset-search-row input {
  background: transparent;
  border: none;
  color: #fff;
  font-size: 0.82rem;
  outline: none;
  width: 100%;
}

.preset-items-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 4px;
}

.preset-item-row {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 0.65rem 0.85rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.85rem;
}

.preset-item-row:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(220, 38, 38, 0.3);
}

.preset-item-title-row {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-bottom: 0.2rem;
}

.preset-type-pill {
  font-size: 0.62rem;
  padding: 0.08rem 0.35rem;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 3px;
  color: var(--text-muted);
  text-transform: uppercase;
}

.preset-cost-pill {
  font-size: 0.68rem;
  font-weight: 800;
  color: #38bdf8;
}

.preset-item-desc {
  font-size: 0.72rem;
  color: var(--text-secondary);
  margin: 0;
}

.btn-add-preset {
  background: #dc2626;
  border: 1px solid #ef4444;
  color: #fff;
  font-size: 0.74rem;
  font-weight: 800;
  padding: 0.3rem 0.75rem;
  border-radius: var(--radius-xs);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
}

.btn-add-preset:hover {
  background: #ef4444;
}

.modal-header-actions {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.btn-studio-direct {
  background: rgba(56, 189, 248, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.3);
  color: #38bdf8;
  font-size: 0.74rem;
  font-weight: 700;
  padding: 0.3rem 0.65rem;
  border-radius: var(--radius-xs, 4px);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  transition: all var(--trans-fast);
}

.btn-studio-direct:hover {
  background: #38bdf8;
  color: #090d16;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-secondary-custom {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #e2e8f0;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0.45rem 0.85rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  transition: all var(--trans-fast);
}

.btn-secondary-custom:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border-color: rgba(255, 255, 255, 0.25);
}

.res-chip.chip-shield {
  background: rgba(14, 165, 233, 0.12);
  border-color: rgba(56, 189, 248, 0.3);
  color: #38bdf8;
}

</style>
