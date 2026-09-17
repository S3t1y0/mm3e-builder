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
            <i class="ri-flashlight-line"></i> Auto-Sync Advantage ({{ budgetInfo.neededRanks }} PP)
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
            <i class="ri-flashlight-line"></i> Adjust to {{ budgetInfo.neededRanks }} Ranks
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
    <div class="card mb-4" style="padding: 0.75rem 1.25rem;">
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
        <h4 style="color: #fff; margin: 0 0 0.4rem; font-size: 1rem; font-weight: 800;">No Equipment Added Yet</h4>
        <p style="font-size: 0.8rem; color: var(--text-secondary); max-width: 480px; margin: 0 auto 1rem;">
          Equip your hero with standard weapons, armor, gadgets, vehicles, or headquarters.
        </p>
        <button type="button" class="btn btn-primary btn-sm" @click="showPresetModal = true">
          <i class="ri-shopping-bag-3-line"></i> Browse Equipment Catalog
        </button>
      </div>
      <div v-else>
        <p style="font-size: 0.82rem; color: var(--text-secondary); margin: 0;">
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
                <span class="badge-subtle">{{ getSubtypeLabel(item) }}</span>
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
                  <span class="badge badge-subtle" style="font-size: 0.68rem;">{{ p.subtype || p.type }}</span>
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
import { ref, computed } from 'vue';
import { useHeroStore } from '../../stores/heroStore.js';
import { useUiStore } from '../../stores/uiStore.js';
import { RESOURCE_CATEGORIES, RESOURCE_PRESETS } from '../../rules/resources.js';
import CustomEquipmentModal from '../modals/CustomEquipmentModal.vue';

const heroStore = useHeroStore();
const uiStore = useUiStore();

const activeFilter = ref('all');
const showPresetModal = ref(false);
const showCustomStudio = ref(false);
const customStudioCategory = ref('Weapons');
const presetSearch = ref('');

function openCustomStudio(cat = 'Weapons') {
  customStudioCategory.value = cat;
  showCustomStudio.value = true;
  showPresetModal.value = false;
}

const categories = RESOURCE_CATEGORIES;

const budgetInfo = computed(() => {
  return heroStore.getEquipmentBudgetInfo();
});

function getCategoryCount(catId) {
  const list = heroStore.character.resources || [];
  if (catId === 'all') return list.length;
  if (catId === 'Weapons') {
    return list.filter(r => isWeapon(r)).length;
  }
  if (catId === 'Armor') {
    return list.filter(r => isArmor(r) || isShield(r)).length;
  }
  if (catId === 'Gadget') {
    return list.filter(r => r.type === 'Gadget' || r.subtype === 'gadget').length;
  }
  if (catId === 'Vehicle') {
    return list.filter(r => r.type === 'Vehicle' || r.subtype === 'vehicle').length;
  }
  if (catId === 'Headquarters') {
    return list.filter(r => r.type === 'Headquarters' || r.subtype === 'headquarters').length;
  }
  return list.filter(r => r.type === catId).length;
}

const filteredResources = computed(() => {
  const list = heroStore.character.resources || [];
  if (activeFilter.value === 'all') return list;
  if (activeFilter.value === 'Weapons') {
    return list.filter(r => isWeapon(r));
  }
  if (activeFilter.value === 'Armor') {
    return list.filter(r => isArmor(r) || isShield(r));
  }
  if (activeFilter.value === 'Gadget') {
    return list.filter(r => r.type === 'Gadget' || r.subtype === 'gadget');
  }
  if (activeFilter.value === 'Vehicle') {
    return list.filter(r => r.type === 'Vehicle' || r.subtype === 'vehicle');
  }
  if (activeFilter.value === 'Headquarters') {
    return list.filter(r => r.type === 'Headquarters' || r.subtype === 'headquarters');
  }
  return list.filter(r => r.type === activeFilter.value);
});

const filteredPresets = computed(() => {
  const q = presetSearch.value.toLowerCase().trim();
  if (!q) return RESOURCE_PRESETS;
  return RESOURCE_PRESETS.filter(p =>
    p.name.toLowerCase().includes(q) ||
    (p.desc && p.desc.toLowerCase().includes(q)) ||
    (p.subtype && p.subtype.toLowerCase().includes(q)) ||
    (p.type && p.type.toLowerCase().includes(q))
  );
});

function syncEquipmentAdvantage() {
  heroStore.syncEquipmentAdvantage();
  uiStore.showToast('Synchronized Equipment Advantage PP budget!', 'success');
}

function toggleStatus(id) {
  heroStore.toggleResourceStatus(id);
}

function formatStatus(status) {
  if (status === 'carried') return 'In Bag';
  if (status === 'stored') return 'Stored';
  return 'Equipped';
}

function deleteResource(id, name) {
  heroStore.removeResource(id);
  uiStore.showToast(`Deleted ${name}`, 'info');
}

function addPreset(preset) {
  heroStore.addResource({
    ...preset,
    id: 'res_' + Date.now() + Math.random().toString(36).substr(2, 4)
  });
  uiStore.showToast(`Added ${preset.name} (${preset.epCost} EP)!`, 'success');
}

function getResIconClass(r) {
  if (isShield(r) || r.subtype === 'shield') return 'ri-shield-line';
  if (r.subtype === 'weapon_ranged' || (r.weapon?.range === 'Ranged')) return 'ri-focus-2-line';
  if (r.subtype?.startsWith('weapon') || r.weapon != null) return 'ri-sword-line';
  if (r.subtype === 'armor') return 'ri-shield-check-line';
  if (r.type === 'Vehicle' || r.subtype === 'vehicle') return 'ri-car-line';
  if (r.type === 'Headquarters' || r.subtype === 'headquarters') return 'ri-building-line';
  if (r.type === 'Gadget' || r.subtype === 'gadget') return 'ri-smartphone-line';
  return 'ri-archive-line';
}

function getSubtypeLabel(r) {
  if (isShield(r) || r.subtype === 'shield') return 'SHIELD';
  if (r.subtype === 'weapon_ranged') return 'RANGED WEAPON';
  if (r.subtype === 'weapon_melee') return 'MELEE WEAPON';
  if (r.weapon) return r.weapon.range === 'Ranged' ? 'RANGED WEAPON' : 'MELEE WEAPON';
  if (r.subtype === 'armor') return 'BODY ARMOR';
  if (r.type === 'Vehicle' || r.subtype === 'vehicle') return 'VEHICLE';
  if (r.type === 'Headquarters' || r.subtype === 'headquarters') return 'HEADQUARTERS';
  return (r.type || 'GEAR').toUpperCase();
}

function isWeapon(r) {
  return r.subtype?.startsWith('weapon') || r.weapon != null || (/Damage\s+\d+/i.test(r.desc || '') && !r.subtype?.includes('armor') && !r.subtype?.includes('shield'));
}

function isShield(r) {
  return r.subtype === 'shield' || (r.armor && (r.armor.shieldRank || r.armor.activeDefenseBonus)) || /Active Defense/i.test(r.desc || '') || /Shield/i.test(r.name || '');
}

function isArmor(r) {
  return (r.subtype === 'armor' || r.armor != null || /Protection\s+\d+/i.test(r.desc || '')) && !isShield(r);
}

function getShieldBonus(r) {
  const a = r.armor || {};
  let bonus = Number(a.activeDefenseBonus ?? a.shieldRank ?? 0);
  if (isNaN(bonus) || bonus <= 0) {
    const m = (r.desc || '').match(/Active Defense:\s*\+(\d+)/i) || (r.desc || '').match(/(?:Dodge|Parry)\s*\+(\d+)/i);
    bonus = m ? parseInt(m[1], 10) : 2;
  }
  return bonus;
}

function getWeaponAttackBonus(r) {
  const w = r.weapon || {};
  const isRanged = w.range === 'Ranged' || (/Ranged/i.test(r.desc || '') && !/Close/i.test(w.range || ''));
  const skills = heroStore.character.skills || [];
  const rNameLower = (r.name || '').toLowerCase();

  if (isRanged) {
    const dex = Number(heroStore.effectiveAbilities.DEX) || 0;
    const rangedAdv = Number(heroStore.getAdvantageRanks('Ranged Attack')) || 0;
    const skill = skills.find(s => {
      if (s.name !== 'Ranged Combat') return false;
      const sub = (s.subtype || '').toLowerCase().trim();
      return sub && (rNameLower.includes(sub) || sub.includes(rNameLower) || /firearms?|guns?|pistols?|rifles?|bows?/i.test(sub));
    });
    return dex + rangedAdv + (skill ? Number(skill.ranks) || 0 : 0) + (w.attackBonus || 0);
  } else {
    const fgt = Number(heroStore.effectiveAbilities.FGT) || 0;
    const closeAdv = Number(heroStore.getAdvantageRanks('Close Attack')) || 0;
    const skill = skills.find(s => {
      if (s.name !== 'Close Combat') return false;
      const sub = (s.subtype || '').toLowerCase().trim();
      return sub && (rNameLower.includes(sub) || sub.includes(rNameLower) || /blades?|swords?|knives|melee|unarmed/i.test(sub));
    });
    return fgt + closeAdv + (skill ? Number(skill.ranks) || 0 : 0) + (w.attackBonus || 0);
  }
}

function getWeaponDC(r) {
  const w = r.weapon || {};
  const str = Number(heroStore.effectiveAbilities.STR) || 0;
  const isStrengthBased = w.isStrengthBased ?? (/Strength-based/i.test(r.desc || ''));
  let dmgRank = w.damageRank;
  if (dmgRank === undefined) {
    const m = (r.desc || '').match(/Damage\s+(\d+)/i) || (r.desc || '').match(/Affliction\s+(\d+)/i);
    dmgRank = m ? parseInt(m[1], 10) : 1;
  }
  const effectiveDmg = isStrengthBased ? (str + dmgRank) : dmgRank;
  const isAffliction = (w.traits || []).includes('Affliction') || /Affliction/i.test(r.desc || '');
  return (isAffliction ? 10 : 15) + effectiveDmg;
}

function getWeaponResistance(r) {
  const w = r.weapon || {};
  const isAffliction = (w.traits || []).includes('Affliction') || /Affliction/i.test(r.desc || '');
  return w.resistance || (isAffliction ? 'Fortitude' : 'Toughness');
}

function getWeaponRange(r) {
  const w = r.weapon || {};
  if (w.range === 'Ranged' || /Ranged/i.test(r.desc || '')) return 'Ranged';
  if (w.isStrengthBased ?? /Strength-based/i.test(r.desc || '')) return 'Melee (STR)';
  return 'Close';
}

function getArmorProtection(r) {
  const a = r.armor || {};
  if (a.protectionRank !== undefined) return a.protectionRank;
  const m = (r.desc || '').match(/Protection\s+(\d+)/i);
  return m ? parseInt(m[1], 10) : 1;
}
</script>

<style scoped>
.step-equipment-container {
  width: 100%;
}

.step-banner {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin-bottom: 1.25rem;
  padding: 1rem 1.25rem;
  background: rgba(6, 182, 212, 0.08);
  border: 1px solid rgba(6, 182, 212, 0.25);
  border-radius: var(--radius-md);
}

.step-banner-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  background: rgba(6, 182, 212, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  color: #22d3ee;
}

.step-title {
  font-size: 1.2rem;
  font-weight: 800;
  color: #fff;
  margin: 0;
  letter-spacing: -0.01em;
}

.step-subtitle {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin: 0.25rem 0 0;
  line-height: 1.5;
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

.filter-chip {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xs);
  color: var(--text-secondary);
  font-size: 0.74rem;
  font-weight: 700;
  padding: 0.28rem 0.65rem;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.filter-chip:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.filter-chip.active {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
  color: #fff;
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.35);
}



/* Empty Card */
.empty-equipment-card {
  padding: 3rem 1.5rem;
  text-align: center;
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

.badge-subtle {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted);
  background: rgba(255, 255, 255, 0.05);
  padding: 0.15rem 0.4rem;
  border-radius: var(--radius-xs);
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
