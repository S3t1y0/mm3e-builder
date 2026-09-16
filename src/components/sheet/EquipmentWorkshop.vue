<template>
  <div class="equipment-workshop">
    <!-- Header -->
    <div class="workshop-header">
      <div class="header-info">
        <h3 class="workshop-title">Equipment & Resources Workshop</h3>
        <p class="workshop-sub">Weapons, ballistic armor, utility gadgets, combat vehicles, and secret bases (1 PP = 5 EP).</p>
      </div>
      <button type="button" class="btn-primary-add" @click="showPresetModal = true">
        <i class="ri-add-line"></i> Add Item / Preset
      </button>
    </div>

    <!-- EP Budget Banner -->
    <div class="equipment-budget-banner" :class="budgetInfo.isOverBudget ? 'banner-warn' : 'banner-ok'">
      <div class="budget-banner-left">
        <div class="budget-stat-group">
          <span class="budget-label">Total EP Used</span>
          <span class="budget-val highlight">{{ budgetInfo.totalEP }} EP</span>
        </div>
        <div class="budget-divider">/</div>
        <div class="budget-stat-group">
          <span class="budget-label">Equipment Capacity</span>
          <span class="budget-val">{{ budgetInfo.maxEP }} EP ({{ budgetInfo.ranks }} Ranks)</span>
        </div>
      </div>

      <div class="budget-banner-right">
        <template v-if="budgetInfo.isOverBudget">
          <div class="budget-status-alert">
            <span class="status-icon"><i class="ri-alert-line"></i></span>
            <span>Deficit: <strong>{{ budgetInfo.totalEP - budgetInfo.maxEP }} EP</strong> (Requires Rank {{ budgetInfo.neededRanks }} Equipment)</span>
          </div>
          <button type="button" class="btn-sync-warn" @click="syncEquipmentAdvantage">
            <i class="ri-flashlight-line"></i> Auto-Sync Advantage ({{ budgetInfo.neededRanks }} Ranks / {{ budgetInfo.neededRanks }} PP)
          </button>
        </template>
        <template v-else>
          <div class="budget-status-ok">
            <span class="status-icon"><i class="ri-checkbox-circle-line"></i></span>
            <span>Budget OK (Remaining: <strong>{{ budgetInfo.remainingEP }} EP</strong>)</span>
          </div>
          <button
            v-if="budgetInfo.ranks > budgetInfo.neededRanks"
            type="button"
            class="btn-sync-adjust"
            @click="syncEquipmentAdvantage"
            title="Adjust advantage to exact needed ranks"
          >
            <i class="ri-flashlight-line"></i> Adjust to {{ budgetInfo.neededRanks }} Ranks
          </button>
        </template>
      </div>
    </div>

    <!-- Category Pills & Quick Add -->
    <div class="res-categories-bar">
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

      <div class="quick-add-group">
        <button type="button" class="quick-add-btn" @click="openQuickAdd('Weapons')">
          <i class="ri-sword-line"></i> + Weapon
        </button>
        <button type="button" class="quick-add-btn" @click="openQuickAdd('Armor')">
          <i class="ri-shield-line"></i> + Armor
        </button>
        <button type="button" class="quick-add-btn" @click="openQuickAdd('Gadget')">
          <i class="ri-smartphone-line"></i> + Gadget
        </button>
        <button type="button" class="quick-add-btn" @click="openQuickAdd('Vehicle')">
          <i class="ri-car-line"></i> + Vehicle
        </button>
        <button type="button" class="quick-add-btn" @click="openQuickAdd('Headquarters')">
          <i class="ri-building-line"></i> + HQ
        </button>
      </div>
    </div>

    <!-- Items Grid -->
    <div v-if="filteredResources.length === 0" class="empty-hint">
      <i class="ri-inbox-archive-line empty-icon"></i>
      <p v-if="(heroStore.character.resources || []).length === 0">
        Equipment library is empty. Click "+ Add Item / Preset" to choose weapons, gadgets, armor, vehicles, or headquarters!
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
        :class="item.status === 'equipped' ? 'card-equipped' : 'card-unequipped'"
      >
        <div class="res-card-top">
          <div class="res-title-box">
            <span class="res-icon" :class="item.subtype || item.type">
              <i :class="getResIconClass(item)"></i>
            </span>
            <div class="res-naming">
              <div class="res-badges-row">
                <span class="badge-subtle">{{ getSubtypeLabel(item) }}</span>
                <button
                  type="button"
                  class="res-status-pill"
                  :class="'status-' + (item.status || 'equipped')"
                  @click="toggleStatus(item.id)"
                  title="Click to cycle status (Equipped -> In Bag -> Stored)"
                >
                  <i v-if="item.status === 'equipped' || !item.status" class="ri-checkbox-circle-fill pulse"></i>
                  <i v-else-if="item.status === 'carried'" class="ri-inbox-line"></i>
                  <i v-else class="ri-archive-line"></i>
                  <span>{{ formatStatus(item.status) }}</span>
                </button>
              </div>
              <strong class="res-card-name">{{ item.name }}</strong>
            </div>
          </div>

          <div class="res-top-actions">
            <span class="ep-tag">{{ item.epCost ?? item.cost ?? 0 }} EP</span>
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
            title="Click to roll attack check"
          >
            <i class="ri-crosshair-2-line"></i> Atk +{{ getWeaponAttackBonus(item) }}
          </button>
          <span class="res-chip chip-dc">
            <i class="ri-shield-flash-line"></i> DC {{ getWeaponDC(item) }} {{ getWeaponResistance(item) }}
          </span>
          <span class="res-chip chip-range">
            {{ getWeaponRange(item) }}
          </span>
          <span v-if="item.weapon?.crit" class="res-chip chip-crit">
            Crit {{ item.weapon.crit }}
          </span>
        </div>

        <div v-else-if="isArmor(item)" class="res-tactical-chips">
          <span class="res-chip chip-armor">
            <i class="ri-shield-line"></i> +{{ getArmorProtection(item) }} Protection
          </span>
        </div>

        <!-- Description -->
        <p v-if="item.desc" class="res-desc">{{ item.desc }}</p>
      </div>
    </div>

    <!-- Add Item / Preset Catalog Modal -->
    <transition name="fade">
      <div v-if="showPresetModal" class="preset-modal-backdrop" @click.self="showPresetModal = false">
        <div class="preset-modal-card">
          <div class="preset-modal-header">
            <h4><i class="ri-shopping-bag-3-line"></i> Equipment Preset Library & Creator</h4>
            <button type="button" class="preset-modal-close" @click="showPresetModal = false">
              <i class="ri-close-line"></i>
            </button>
          </div>

          <!-- Tabs in Modal -->
          <div class="modal-tab-bar">
            <button
              type="button"
              class="modal-tab-btn"
              :class="{ active: modalActiveTab === 'presets' }"
              @click="modalActiveTab = 'presets'"
            >
              <i class="ri-list-check"></i> Standard Presets ({{ RESOURCE_PRESETS.length }})
            </button>
            <button
              type="button"
              class="modal-tab-btn"
              :class="{ active: modalActiveTab === 'custom' }"
              @click="modalActiveTab = 'custom'"
            >
              <i class="ri-edit-line"></i> Custom Item Creator
            </button>
          </div>

          <div class="preset-modal-body">
            <!-- 1. Presets Catalog Tab -->
            <template v-if="modalActiveTab === 'presets'">
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
            </template>

            <!-- 2. Custom Item Creator Tab -->
            <template v-else>
              <div class="custom-form-grid">
                <div class="form-group">
                  <label>Item Name *</label>
                  <input v-model="customForm.name" type="text" placeholder="e.g. Plasma Rifle, Nanotech Suit..." />
                </div>
                <div class="form-group">
                  <label>Category *</label>
                  <select v-model="customForm.type">
                    <option value="Gear">Gear (General)</option>
                    <option value="Weapons">Weapon</option>
                    <option value="Armor">Armor</option>
                    <option value="Gadget">Gadget</option>
                    <option value="Vehicle">Vehicle</option>
                    <option value="Headquarters">Headquarters</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Equipment Cost (EP) *</label>
                  <input v-model.number="customForm.epCost" type="number" min="0" />
                </div>
                <div class="form-group full-width">
                  <label>Description & Rules Text</label>
                  <textarea
                    v-model="customForm.desc"
                    rows="3"
                    placeholder="Provide details, game stats, traits, or mechanical effects..."
                  ></textarea>
                </div>
              </div>
              <div class="custom-form-actions">
                <button type="button" class="btn-create-custom" @click="saveCustomItem">
                  <i class="ri-check-line"></i> Create & Add to Sheet
                </button>
              </div>
            </template>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useHeroStore } from '../../stores/heroStore.js';
import { useUiStore } from '../../stores/uiStore.js';
import { RESOURCE_CATEGORIES, RESOURCE_PRESETS } from '../../rules/resources.js';
import { sendFeatureToVTT } from '../../services/vttBridge.js';

const heroStore = useHeroStore();
const uiStore = useUiStore();

const activeFilter = ref('all');
const showPresetModal = ref(false);
const modalActiveTab = ref('presets');
const presetSearch = ref('');

const customForm = ref({
  name: '',
  type: 'Gear',
  epCost: 1,
  desc: ''
});

const categories = RESOURCE_CATEGORIES;

const budgetInfo = computed(() => {
  return heroStore.getEquipmentBudgetInfo();
});

function getCategoryCount(catId) {
  const list = heroStore.character.resources || [];
  if (catId === 'all') return list.length;
  if (catId === 'Weapons') {
    return list.filter(r => r.subtype?.startsWith('weapon') || r.weapon != null || (/Damage\s+\d+/i.test(r.desc || '') && !r.subtype?.includes('armor'))).length;
  }
  if (catId === 'Armor') {
    return list.filter(r => r.subtype === 'armor' || r.subtype === 'shield' || r.armor != null || /Protection\s+\d+/i.test(r.desc || '')).length;
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
    return list.filter(r => r.subtype?.startsWith('weapon') || r.weapon != null || (/Damage\s+\d+/i.test(r.desc || '') && !r.subtype?.includes('armor')));
  }
  if (activeFilter.value === 'Armor') {
    return list.filter(r => r.subtype === 'armor' || r.subtype === 'shield' || r.armor != null || /Protection\s+\d+/i.test(r.desc || ''));
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

function openQuickAdd(cat) {
  activeFilter.value = cat;
  showPresetModal.value = true;
  modalActiveTab.value = 'presets';
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

function saveCustomItem() {
  if (!customForm.value.name.trim()) {
    uiStore.showToast('Please enter an item name', 'error');
    return;
  }
  heroStore.addResource({
    id: 'res_' + Date.now() + Math.random().toString(36).substr(2, 4),
    name: customForm.value.name.trim(),
    type: customForm.value.type,
    epCost: Number(customForm.value.epCost) || 0,
    status: 'equipped',
    desc: customForm.value.desc.trim()
  });
  uiStore.showToast(`Created ${customForm.value.name}!`, 'success');
  customForm.value = { name: '', type: 'Gear', epCost: 1, desc: '' };
  showPresetModal.value = false;
}

function getResIconClass(r) {
  if (r.subtype === 'weapon_ranged' || (r.weapon?.range === 'Ranged')) return 'ri-focus-2-line';
  if (r.subtype?.startsWith('weapon') || r.weapon != null) return 'ri-sword-line';
  if (r.subtype === 'armor') return 'ri-shield-check-line';
  if (r.subtype === 'shield') return 'ri-shield-line';
  if (r.type === 'Vehicle' || r.subtype === 'vehicle') return 'ri-car-line';
  if (r.type === 'Headquarters' || r.subtype === 'headquarters') return 'ri-building-line';
  if (r.type === 'Gadget' || r.subtype === 'gadget') return 'ri-smartphone-line';
  return 'ri-archive-line';
}

function getSubtypeLabel(r) {
  if (r.subtype === 'weapon_ranged') return 'RANGED WEAPON';
  if (r.subtype === 'weapon_melee') return 'MELEE WEAPON';
  if (r.weapon) return r.weapon.range === 'Ranged' ? 'RANGED WEAPON' : 'MELEE WEAPON';
  if (r.subtype === 'armor') return 'BODY ARMOR';
  if (r.subtype === 'shield') return 'SHIELD';
  if (r.type === 'Vehicle' || r.subtype === 'vehicle') return 'VEHICLE';
  if (r.type === 'Headquarters' || r.subtype === 'headquarters') return 'HEADQUARTERS';
  return (r.type || 'GEAR').toUpperCase();
}

function isWeapon(r) {
  return r.subtype?.startsWith('weapon') || r.weapon != null || (/Damage\s+\d+/i.test(r.desc || '') && !r.subtype?.includes('armor'));
}

function isArmor(r) {
  return r.subtype === 'armor' || r.subtype === 'shield' || r.armor != null || /Protection\s+\d+/i.test(r.desc || '');
}

function getWeaponAttackBonus(r) {
  const w = r.weapon || {};
  const isRanged = w.range === 'Ranged' || (/Ranged/i.test(r.desc || '') && !/Close/i.test(w.range || ''));
  const skills = heroStore.character.skills || [];
  if (isRanged) {
    const dex = Number(heroStore.effectiveAbilities.DEX) || 0;
    const skill = skills.find(s => s.name === 'Ranged Combat' && (new RegExp(r.name, 'i').test(s.subtype || '') || /firearm|guns|pistol|rifle/i.test(s.subtype || '')));
    return dex + (skill ? Number(skill.ranks) || 0 : 0) + (w.attackBonus || 0);
  } else {
    const fgt = Number(heroStore.effectiveAbilities.FGT) || 0;
    const skill = skills.find(s => s.name === 'Close Combat' && (new RegExp(r.name, 'i').test(s.subtype || '') || /blades|swords|melee|unarmed/i.test(s.subtype || '')));
    return fgt + (skill ? Number(skill.ranks) || 0 : 0) + (w.attackBonus || 0);
  }
}

function getWeaponDC(r) {
  const w = r.weapon || {};
  const str = Number(heroStore.effectiveAbilities.STR) || 0;
  const isStrengthBased = w.isStrengthBased ?? (/Strength-based/i.test(r.desc || ''));
  let dmgRank = w.damageRank;
  if (dmgRank === undefined) {
    const m = (r.desc || '').match(/Damage\s+(\d+)/i);
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
  gap: 1rem;
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
  margin: 0 0 0.2rem 0;
}

.workshop-sub {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin: 0;
}

.btn-primary-add {
  background: #dc2626;
  border: 1px solid #ef4444;
  color: #fff;
  font-size: 0.8rem;
  font-weight: 800;
  padding: 0.45rem 0.95rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.4);
  transition: all var(--trans-fast);
}

.btn-primary-add:hover {
  background: #ef4444;
  box-shadow: 0 4px 14px rgba(220, 38, 38, 0.6);
}

/* Equipment Budget Banner */
.equipment-budget-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1.15rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  gap: 1rem;
  flex-wrap: wrap;
}

.equipment-budget-banner.banner-ok {
  background: rgba(16, 185, 129, 0.08);
  border-color: rgba(16, 185, 129, 0.3);
}

.equipment-budget-banner.banner-warn {
  background: rgba(239, 68, 68, 0.08);
  border-color: rgba(239, 68, 68, 0.4);
}

.budget-banner-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.budget-stat-group {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.budget-label {
  font-size: 0.65rem;
  font-weight: 800;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.budget-val {
  font-size: 1.15rem;
  font-weight: 900;
  color: #fff;
  font-variant-numeric: tabular-nums;
}

.budget-val.highlight {
  color: #38bdf8;
}

.budget-divider {
  font-size: 1.25rem;
  color: var(--text-muted);
  font-weight: 300;
}

.budget-banner-right {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  flex-wrap: wrap;
}

.budget-status-ok {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  color: #34d399;
  font-size: 0.78rem;
  font-weight: 700;
}

.budget-status-alert {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  color: #f87171;
  font-size: 0.78rem;
}

.btn-sync-warn {
  background: #dc2626;
  border: 1px solid #ef4444;
  color: #fff;
  font-size: 0.74rem;
  font-weight: 800;
  padding: 0.3rem 0.65rem;
  border-radius: var(--radius-xs);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.btn-sync-adjust {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: var(--text-secondary);
  font-size: 0.74rem;
  padding: 0.25rem 0.55rem;
  border-radius: var(--radius-xs);
  cursor: pointer;
}

/* Category Pills & Quick Add */
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
  gap: 0.35rem;
  overflow-x: auto;
  padding-bottom: 0.2rem;
}

.filter-chip {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-pill);
  color: var(--text-secondary);
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.22rem 0.65rem;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all var(--trans-fast);
}

.filter-chip:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.filter-chip.active {
  background: #dc2626;
  border-color: #ef4444;
  color: #fff;
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.35);
}

.quick-add-group {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.quick-add-btn {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-secondary);
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: var(--radius-xs);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  transition: all var(--trans-fast);
}

.quick-add-btn:hover {
  background: rgba(220, 38, 38, 0.15);
  border-color: #ef4444;
  color: #fff;
}

/* Items Grid */
.res-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 0.85rem;
}

.res-card {
  background: rgba(20, 20, 28, 0.6);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  transition: all var(--trans-fast);
}

.res-card:hover {
  border-color: rgba(220, 38, 38, 0.35);
  background: rgba(25, 25, 35, 0.8);
}

.card-unequipped {
  opacity: 0.65;
  border-style: dashed;
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
  width: 34px;
  height: 34px;
  border-radius: var(--radius-sm);
  background: rgba(220, 38, 38, 0.12);
  border: 1px solid rgba(220, 38, 38, 0.3);
  color: #f87171;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}

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
  font-size: 0.6rem;
  font-weight: 800;
  padding: 0.1rem 0.35rem;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 3px;
  color: var(--text-muted);
  text-transform: uppercase;
}

.res-status-pill {
  font-size: 0.62rem;
  font-weight: 700;
  padding: 0.08rem 0.35rem;
  border-radius: 3px;
  border: 1px solid transparent;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  background: transparent;
}

.res-status-pill.status-equipped {
  color: #34d399;
  border-color: rgba(52, 211, 153, 0.3);
  background: rgba(52, 211, 153, 0.1);
}

.res-status-pill.status-carried {
  color: #38bdf8;
  border-color: rgba(56, 189, 248, 0.3);
  background: rgba(56, 189, 248, 0.1);
}

.res-status-pill.status-stored {
  color: #94a3b8;
  border-color: rgba(148, 163, 184, 0.3);
  background: rgba(148, 163, 184, 0.1);
}

.res-card-name {
  font-size: 0.9rem;
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
  color: var(--text-muted);
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0.2rem;
  border-radius: 3px;
  transition: all var(--trans-fast);
}

.btn-icon-subtle:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
}

.btn-icon-subtle.btn-delete:hover {
  color: #ef4444;
}

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
  color: var(--text-secondary);
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.res-chip.chip-atk {
  background: rgba(220, 38, 38, 0.12);
  border-color: rgba(239, 68, 68, 0.35);
  color: #f87171;
}

.interactive-chip {
  cursor: pointer;
  transition: all var(--trans-fast);
}

.interactive-chip:hover {
  background: #dc2626;
  color: #fff;
}

.res-chip.chip-dc {
  background: rgba(56, 189, 248, 0.1);
  border-color: rgba(56, 189, 248, 0.25);
  color: #38bdf8;
}

.res-chip.chip-armor {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.25);
  color: #34d399;
}

.res-desc {
  font-size: 0.74rem;
  color: var(--text-secondary);
  line-height: 1.4;
  margin: 0;
}

.empty-hint {
  padding: 2.5rem 1rem;
  text-align: center;
  color: var(--text-muted);
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

.custom-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.85rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
}

.form-group input, .form-group select, .form-group textarea {
  background: rgba(20, 20, 28, 0.9);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: #fff;
  padding: 0.45rem 0.65rem;
  font-size: 0.82rem;
  font-family: inherit;
  outline: none;
}

.custom-form-actions {
  display: flex;
  justify-content: flex-end;
}

.btn-create-custom {
  background: #dc2626;
  border: 1px solid #ef4444;
  color: #fff;
  font-size: 0.8rem;
  font-weight: 800;
  padding: 0.45rem 1rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.pulse {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.15); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
}
</style>
