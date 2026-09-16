<template>
  <div class="advantages-hub-pane">
    <!-- Advantages Toolbar -->
    <div class="dndb-pane-toolbar">
      <div class="dndb-pane-info">
        <span class="dndb-pane-title">Combat & General Feats</span>
        <span class="adv-pp-badge">{{ heroStore.totalAdvantagePP }} PP Total</span>
      </div>
      <div class="dndb-pane-actions">
        <button
          v-if="effectiveAdvantages.length > 0"
          type="button"
          class="btn-pane-action"
          @click="toggleCollapseAll"
        >
          <i :class="allCollapsed ? 'ri-arrow-down-s-line' : 'ri-arrow-up-s-line'"></i>
          <span>{{ allCollapsed ? 'Expand All' : 'Collapse All' }}</span>
        </button>

        <button
          type="button"
          class="btn-browse-catalog"
          @click="uiStore.openModal('advantage')"
          title="Open Advantages Library Catalog Window"
        >
          <i class="ri-add-line"></i> Browse Catalog (56 Choices)
        </button>
      </div>
    </div>

    <!-- EMPTY ADVANTAGES STATE -->
    <div v-if="effectiveAdvantages.length === 0" class="adv-empty-state">
      <div class="adv-empty-icon"><i class="ri-medal-line"></i></div>
      <h4 class="adv-empty-title">No Advantages Selected</h4>
      <p class="adv-empty-desc">
        Advantages represent specialized combat maneuvers, fortune perks, and expert talents (1 PP per rank).
      </p>
      <button
        type="button"
        class="btn-browse-empty-cta"
        @click="uiStore.openModal('advantage')"
      >
        <i class="ri-search-line"></i> Browse Advantages Library (56 Choices)
      </button>
    </div>

    <!-- ACTIVE ADVANTAGES LIST -->
    <div v-else class="sheet-advantages-library">
      <div
        v-for="adv in effectiveAdvantages"
        :key="adv.name"
        class="sheet-adv-card"
        :class="{
          'is-collapsed': isAdvCollapsed(adv.name),
          'is-power-granted': adv.isPowerGranted
        }"
      >
        <!-- Card Header -->
        <div class="adv-card-header" @click="toggleAdvCollapse(adv.name)">
          <div class="adv-card-title-group">
            <i :class="getCategoryIcon(adv.name)" class="adv-card-icon"></i>
            <h4 class="adv-card-name">{{ adv.name }}</h4>
          </div>

          <div class="adv-card-badges" @click.stop>
            <!-- Power Granted / Standard Badges -->
            <template v-if="adv.isPowerGranted">
              <span class="adv-cat-tag power">
                <i class="ri-flashlight-line"></i> Power Buff
              </span>
              <span class="adv-cost-tag power">Power Buff</span>
            </template>
            <template v-else>
              <span class="adv-cat-tag" :class="getAdvCategory(adv.name).toLowerCase()">
                {{ getAdvCategory(adv.name) }}
              </span>
              <span class="adv-cost-tag">
                {{ adv.naturalRanks }} PP{{ adv.hasPowerBonus ? ` (+${adv.enhancedRanks} Power)` : '' }}
              </span>
            </template>

            <!-- VTT / Roll20 Broadcast Button -->
            <button
              type="button"
              class="btn-send-vtt"
              @click="broadcastAdvantage(adv)"
              :title="`Send ${adv.name} description to clipboard / VTT`"
            >
              <i class="ri-broadcast-line"></i>
            </button>

            <!-- Collapse / Expand Chevron -->
            <button
              type="button"
              class="btn-adv-collapse-toggle"
              :class="{ collapsed: isAdvCollapsed(adv.name) }"
              @click="toggleAdvCollapse(adv.name)"
              :title="isAdvCollapsed(adv.name) ? 'Expand Details' : 'Collapse Details'"
            >
              <i :class="isAdvCollapsed(adv.name) ? 'ri-arrow-down-s-line' : 'ri-arrow-up-s-line'"></i>
            </button>
          </div>
        </div>

        <!-- Card Body (Collapsible) -->
        <div v-show="!isAdvCollapsed(adv.name)" class="adv-card-body">
          <!-- Active Mechanics Linked Badge -->
          <div v-if="getAdvMechanicBadge(adv)" class="adv-mechanic-strip" :class="getAdvMechanicBadge(adv).type">
            <i :class="getAdvMechanicBadge(adv).icon"></i>
            <span>{{ getAdvMechanicBadge(adv).text }}</span>
          </div>

          <p class="adv-card-desc">{{ getAdvDesc(adv.name) }}</p>

          <div class="adv-card-footer">
            <div class="adv-card-stepper-wrap">
              <span v-if="adv.isPowerGranted" class="adv-status-tag power">
                <i class="ri-flashlight-line"></i> Granted by Active Power (Rank {{ adv.ranks }})
              </span>
              <div v-else-if="isAdvRanked(adv.name)" class="stepper-compact">
                <button
                  type="button"
                  class="step-btn-xs"
                  :disabled="adv.naturalRanks <= 1"
                  @click="stepRank(adv, -1)"
                  title="Decrease Rank"
                >-</button>
                <span class="step-val-xs">
                  Rank {{ adv.ranks }}{{ adv.hasPowerBonus ? ` (${adv.naturalRanks}+${adv.enhancedRanks}p)` : '' }}
                </span>
                <button
                  type="button"
                  class="step-btn-xs"
                  :disabled="getMaxRanks(adv.name) && adv.naturalRanks >= getMaxRanks(adv.name)"
                  @click="stepRank(adv, 1)"
                  title="Increase Rank"
                >+</button>
              </div>
              <span v-else class="adv-status-tag">
                <i class="ri-check-line"></i> Active Trait
              </span>
            </div>

            <button
              v-if="adv.isPowerGranted"
              type="button"
              class="btn-adv-del locked"
              title="Granted by active power. To remove, modify or deactivate the power."
              disabled
            >
              <i class="ri-lock-line"></i>
            </button>
            <button
              v-else
              type="button"
              class="btn-adv-del"
              @click="deleteAdvantage(adv)"
              :title="`Remove ${adv.name} from sheet`"
            >
              <i class="ri-delete-bin-line"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useHeroStore } from '../../stores/heroStore.js';
import { useUiStore } from '../../stores/uiStore.js';
import { ADVANTAGES } from '../../rules/advantages.js';
import { sendFeatureToVTT } from '../../services/vttBridge.js';

const heroStore = useHeroStore();
const uiStore = useUiStore();

const collapsedNames = ref(new Set());

const effectiveAdvantages = computed(() => {
  return heroStore.effectiveAdvantages || [];
});

function getAdvMechanicBadge(adv) {
  if (!adv || !adv.name) return null;
  const name = adv.name.trim().toLowerCase();
  const ranks = Number(adv.ranks) || 1;

  if (name === 'close attack') {
    return { icon: 'ri-sword-fill', type: 'combat', text: `+${ranks} Bonus to All Close Attacks & Close Combat` };
  }
  if (name === 'ranged attack') {
    return { icon: 'ri-crosshair-2-fill', type: 'ranged', text: `+${ranks} Bonus to All Ranged Attacks & Ranged Combat` };
  }
  if (name === 'defensive roll') {
    return { icon: 'ri-shield-fill', type: 'defense', text: `+${ranks} Active Toughness Defense Bonus` };
  }
  if (name === 'improved initiative') {
    return { icon: 'ri-speed-up-fill', type: 'init', text: `+${ranks * 4} Initiative Modifier` };
  }
  if (name === 'equipment') {
    return { icon: 'ri-briefcase-4-fill', type: 'equip', text: `${ranks * 5} Equipment Points (EP) Budget` };
  }
  if (name === 'throwing mastery') {
    return { icon: 'ri-knife-blood-fill', type: 'damage', text: `+${ranks} Damage Rank to Thrown Weapons` };
  }
  if (name === 'improved critical') {
    return { icon: 'ri-sparkling-fill', type: 'crit', text: `Threat Range: ${Math.max(1, 20 - ranks)}–20 Critical Hits` };
  }
  if (name === 'jack-of-all-trades') {
    return { icon: 'ri-tools-fill', type: 'skill', text: 'Untrained Skill Checks Allowed (No Penalty)' };
  }
  if (name === 'eidetic memory') {
    return { icon: 'ri-brain-line', type: 'circumstance', text: '+5 Circumstance Bonus on Memory / Recall Checks' };
  }
  if (name === 'great endurance') {
    return { icon: 'ri-heart-pulse-line', type: 'circumstance', text: '+5 Circumstance Bonus on Hazard / Fatigue Checks' };
  }
  return null;
}

const allCollapsed = computed(() => {
  if (effectiveAdvantages.value.length === 0) return false;
  return effectiveAdvantages.value.every(a => collapsedNames.value.has(a.name));
});

function toggleCollapseAll() {
  if (allCollapsed.value) {
    collapsedNames.value.clear();
  } else {
    effectiveAdvantages.value.forEach(a => collapsedNames.value.add(a.name));
  }
}

function isAdvCollapsed(name) {
  return collapsedNames.value.has(name);
}

function toggleAdvCollapse(name) {
  if (collapsedNames.value.has(name)) {
    collapsedNames.value.delete(name);
  } else {
    collapsedNames.value.add(name);
  }
}

function getAdvRule(name) {
  return ADVANTAGES.find(r => r.name.toLowerCase() === (name || '').toLowerCase());
}

function getAdvCategory(name) {
  const rule = getAdvRule(name);
  return rule?.category || 'General';
}

function getCategoryIcon(name) {
  const cat = getAdvCategory(name);
  switch (cat) {
    case 'Combat': return 'ri-sword-line';
    case 'Fortune': return 'ri-clover-line';
    case 'Skill': return 'ri-focus-3-line';
    case 'General': return 'ri-shield-line';
    default: return 'ri-star-line';
  }
}

function getAdvDesc(name) {
  const rule = getAdvRule(name);
  return rule?.desc || 'Rules description unavailable.';
}

function isAdvRanked(name) {
  const rule = getAdvRule(name);
  return !!rule?.ranked;
}

function getMaxRanks(name) {
  const rule = getAdvRule(name);
  return rule?.maxRanks || null;
}

function stepRank(adv, delta) {
  if (adv.storeIndex === -1) return;
  const cur = adv.naturalRanks;
  const next = Math.max(1, cur + delta);
  heroStore.setAdvantageRank(adv.storeIndex, next);
}

function deleteAdvantage(adv) {
  if (adv.storeIndex === -1) return;
  heroStore.removeAdvantage(adv.storeIndex);
  uiStore.showToast(`Removed ${adv.name} from Advantages`, 'info');
}

function broadcastAdvantage(adv) {
  const desc = getAdvDesc(adv.name);
  const text = `**${adv.name}** [Rank ${adv.ranks}]\n${desc}`;

  // Broadcast to Roll20 via Chrome Extension
  sendFeatureToVTT({
    name: adv.name,
    category: 'advantage',
    type: 'Advantage',
    subtype: getAdvCategory(adv.name),
    ranks: adv.ranks || 1,
    description: desc,
    details: `${getAdvCategory(adv.name)} Advantage • Rank ${adv.ranks}`
  }, heroStore.character);

  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
    uiStore.showToast(`Broadcasted "${adv.name}" to Roll20 & copied to clipboard!`, 'info');
  } else {
    uiStore.showToast(`Broadcasted "${adv.name}" to Roll20!`, 'info');
  }
}
</script>

<style scoped>
.advantages-hub-pane {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.adv-pp-badge {
  font-size: 0.72rem;
  font-weight: 800;
  color: #fca5a5;
  background: rgba(220, 38, 38, 0.15);
  border: 1px solid rgba(220, 38, 38, 0.3);
  padding: 0.15rem 0.55rem;
  border-radius: var(--radius-pill);
}

.dndb-pane-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-pane-action {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: var(--text-secondary);
  font-size: 0.74rem;
  font-weight: 700;
  padding: 0.3rem 0.65rem;
  border-radius: var(--radius-xs);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  transition: all var(--trans-fast);
}

.btn-pane-action:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.btn-browse-catalog {
  background: #dc2626;
  border: 1px solid #ef4444;
  color: #fff;
  font-size: 0.76rem;
  font-weight: 800;
  padding: 0.32rem 0.75rem;
  border-radius: var(--radius-xs);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.35);
  transition: all var(--trans-fast);
}

.btn-browse-catalog:hover {
  background: #ef4444;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.5);
}

/* Empty State */
.adv-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2.8rem 1.5rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px dashed rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  gap: 0.65rem;
}

.adv-empty-icon {
  font-size: 2.4rem;
  color: rgba(220, 38, 38, 0.4);
}

.adv-empty-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: #fff;
  margin: 0;
}

.adv-empty-desc {
  font-size: 0.78rem;
  color: var(--text-muted);
  max-width: 460px;
  margin: 0;
  line-height: 1.4;
}

.btn-browse-empty-cta {
  margin-top: 0.5rem;
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
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.4);
}

.btn-browse-empty-cta:hover {
  background: #ef4444;
}

/* Sheet Advantages Library Grid */
.sheet-advantages-library {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.sheet-adv-card {
  background: rgba(20, 20, 28, 0.6);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: all var(--trans-fast);
}

.sheet-adv-card:hover {
  border-color: rgba(220, 38, 38, 0.3);
  background: rgba(25, 25, 35, 0.8);
}

.sheet-adv-card.is-power-granted {
  border-left: 3px solid #38bdf8;
}

.sheet-adv-card.is-collapsed .adv-card-header {
  border-bottom: none;
}

.adv-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.65rem 0.85rem;
  cursor: pointer;
  user-select: none;
  border-bottom: 1px solid var(--border-subtle);
  gap: 0.75rem;
}

.adv-card-title-group {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  min-width: 0;
}

.adv-card-icon {
  color: #ef4444;
  font-size: 1rem;
}

.adv-card-name {
  font-size: 0.86rem;
  font-weight: 800;
  color: #fff;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.adv-card-badges {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-shrink: 0;
}

.adv-cat-tag {
  font-size: 0.62rem;
  font-weight: 800;
  padding: 0.1rem 0.4rem;
  border-radius: 3px;
  text-transform: uppercase;
}

.adv-cat-tag.combat { background: rgba(239, 68, 68, 0.15); color: #fca5a5; }
.adv-cat-tag.fortune { background: rgba(16, 185, 129, 0.15); color: #6ee7b7; }
.adv-cat-tag.skill { background: rgba(56, 189, 248, 0.15); color: #7dd3fc; }
.adv-cat-tag.general { background: rgba(168, 85, 247, 0.15); color: #d8b4fe; }
.adv-cat-tag.power {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.35);
}

.adv-cost-tag {
  font-size: 0.65rem;
  font-weight: 800;
  padding: 0.1rem 0.4rem;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-secondary);
}

.adv-cost-tag.power {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.35);
}

.btn-send-vtt {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.15rem;
  font-size: 0.85rem;
  border-radius: 3px;
  transition: all var(--trans-fast);
}

.btn-send-vtt:hover {
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.1);
}

.btn-adv-collapse-toggle {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.15rem;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  transition: color var(--trans-fast);
}

.btn-adv-collapse-toggle:hover {
  color: #fff;
}

.adv-card-body {
  padding: 0.75rem 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  background: rgba(10, 10, 15, 0.3);
}

.adv-card-desc {
  font-size: 0.76rem;
  color: var(--text-secondary);
  line-height: 1.45;
  margin: 0;
}

.adv-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  gap: 0.5rem;
}

.adv-card-stepper-wrap {
  display: flex;
  align-items: center;
}

.adv-status-tag {
  font-size: 0.72rem;
  color: #34d399;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.adv-status-tag.power {
  color: #38bdf8;
}

.btn-adv-del {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 0.85rem;
  padding: 0.2rem;
  border-radius: 3px;
  transition: color var(--trans-fast);
}

.btn-adv-del:hover {
  color: #ef4444;
}

.btn-adv-del.locked {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Active Mechanics Linked Badge */
.adv-mechanic-strip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.28rem 0.6rem;
  border-radius: var(--radius-xs);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  margin-bottom: 0.25rem;
  transition: all var(--trans-fast);
  width: fit-content;
}

.adv-mechanic-strip.combat {
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.35);
  color: #fbbf24;
}

.adv-mechanic-strip.ranged {
  background: rgba(56, 189, 248, 0.15);
  border: 1px solid rgba(56, 189, 248, 0.35);
  color: #38bdf8;
}

.adv-mechanic-strip.defense {
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.35);
  color: #34d399;
}

.adv-mechanic-strip.init {
  background: rgba(168, 85, 247, 0.15);
  border: 1px solid rgba(168, 85, 247, 0.35);
  color: #c084fc;
}

.adv-mechanic-strip.equip {
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.35);
  color: #60a5fa;
}

.adv-mechanic-strip.damage {
  background: rgba(249, 115, 22, 0.15);
  border: 1px solid rgba(249, 115, 22, 0.35);
  color: #fb923c;
}

.adv-mechanic-strip.crit {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.35);
  color: #f87171;
}

.adv-mechanic-strip.skill,
.adv-mechanic-strip.circumstance {
  background: rgba(148, 163, 184, 0.12);
  border: 1px solid rgba(148, 163, 184, 0.25);
  color: #cbd5e1;
}
</style>
