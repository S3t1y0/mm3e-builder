<template>
  <div class="step-skills-container">
    <!-- STEP BANNER -->
    <div class="step-banner">
      <div class="step-banner-icon"><i class="ri-briefcase-4-line"></i></div>
      <div>
        <h3 class="step-title">Skills & Specialties</h3>
        <p class="step-subtitle">Acquire specialized training (<strong>1 PP per 2 Ranks</strong>). Skill ranks are added to their associated ability modifiers.</p>
      </div>
    </div>

    <!-- SKILLS PP SUMMARY STRIP -->
    <div class="card mb-3 wizard-skills-summary-card">
      <div class="skills-summary-left">
        <span class="summary-label">Skills Point Total:</span>
        <span class="tabular-nums summary-pp">{{ heroStore.skillsCost }} PP</span>
        <span class="summary-ranks">({{ totalRanks }} Ranks Total • 1 PP = 2 Ranks)</span>
      </div>
      <button type="button" class="btn-wizard-add-spec" @click="openAddSpecialtyDialog()">
        <i class="ri-add-line"></i> Add Specialty Skill
      </button>
    </div>

    <!-- SKILLS TOOLBAR: CATEGORY PILLS & SEARCH -->
    <div class="wizard-skills-toolbar">
      <div class="skills-cat-pills">
        <button
          v-for="cat in categories"
          :key="cat"
          type="button"
          class="skill-cat-pill"
          :class="{ active: activeCategory === cat }"
          @click="activeCategory = cat"
        >
          <span>{{ cat }}</span>
          <span v-if="cat === 'Trained'" class="cat-pill-count">{{ trainedCount }}</span>
        </button>
      </div>

      <div class="skills-search-wrap">
        <i class="ri-search-line search-icon"></i>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Filter skills..."
          class="skills-search-input"
        />
        <button 
          v-if="searchQuery" 
          type="button" 
          class="clear-search-btn" 
          @click="searchQuery = ''"
          title="Clear search"
        >
          <i class="ri-close-circle-line"></i>
        </button>
      </div>
    </div>

    <!-- SKILLS TABLE / LIST -->
    <div class="card wizard-skills-card">
      <div class="skills-table-responsive">
        <table class="table-custom">
          <thead>
            <tr>
              <th style="width: 34%;">Skill Name & Formula</th>
              <th style="width: 14%; text-align: center;">Ability</th>
              <th style="width: 14%; text-align: center;">Abil Mod</th>
              <th style="width: 22%; text-align: center;">Bought Ranks</th>
              <th style="width: 16%; text-align: center;">Total Check</th>
            </tr>
          </thead>
          <tbody>
            <template v-if="filteredSkills.length === 0">
              <tr>
                <td colspan="5" class="empty-cell">
                  <i class="ri-search-eye-line"></i>
                  <span>No skills found matching "{{ searchQuery }}".</span>
                </td>
              </tr>
            </template>

            <template v-else>
              <template v-for="ruleSkill in filteredSkills" :key="ruleSkill.name">
                <!-- 1. Specialization Skills (Close Combat, Ranged Combat, Expertise) -->
                <template v-if="ruleSkill.requiresSubtype">
                  <!-- Group Header Row -->
                  <tr class="spec-group-row">
                    <td>
                      <div class="spec-header-title-wrap">
                        <span class="spec-parent-name">{{ ruleSkill.name }}</span>
                        <span 
                          v-if="getSubtypeInstances(ruleSkill.name).length > 0"
                          class="spec-count-tag"
                          :title="`${getSubtypeInstances(ruleSkill.name).length} specialization(s) trained`"
                        >
                          {{ getSubtypeInstances(ruleSkill.name).length }}
                        </span>
                        <span
                          v-if="getAdvantageBonusForSkill(ruleSkill.name) > 0"
                          class="badge badge-warning tabular-nums"
                          style="font-size: 0.62rem; padding: 0.1rem 0.35rem; margin-left: 0.3rem;"
                        >
                          +{{ getAdvantageBonusForSkill(ruleSkill.name) }} {{ getAdvantageNameForSkill(ruleSkill.name) }}
                        </span>
                      </div>
                    </td>
                    <td style="text-align: center;">
                      <span class="sheet-skill-ab-tag" :class="`ab-${ruleSkill.ability.toLowerCase()}`">
                        {{ ruleSkill.ability }}
                      </span>
                    </td>
                    <td class="tabular-nums mod-cell">
                      {{ formatMod(heroStore.effectiveAbilities[ruleSkill.ability] || 0) }}
                    </td>
                    <td colspan="2" style="text-align: right; padding-right: 1rem;">
                      <button
                        type="button"
                        class="btn btn-xs btn-outline-primary"
                        @click="openAddSpecialtyDialog(ruleSkill.name)"
                        :title="`Add new ${ruleSkill.name} specialization`"
                      >
                        <i class="ri-add-line"></i> Add Spec
                      </button>
                    </td>
                  </tr>

                  <!-- Specialization Child Rows (If instances exist) -->
                  <template v-if="getSubtypeInstances(ruleSkill.name).length > 0">
                    <tr
                      v-for="inst in getSubtypeInstances(ruleSkill.name)"
                      :key="inst.id || (ruleSkill.name + '_' + inst.subtype)"
                      class="spec-child-row"
                    >
                      <td>
                        <div class="spec-child-title-wrap">
                          <i class="ri-corner-down-right-line spec-branch-icon"></i>
                          <div class="spec-child-name-block">
                            <div class="spec-name-tag-row">
                              <span class="spec-subtype-name">{{ inst.subtype || 'General' }}</span>
                            </div>
                            <span class="spec-math-subtext">
                              {{ ruleSkill.ability }} {{ heroStore.effectiveAbilities[ruleSkill.ability] || 0 }} + Rk {{ inst.ranks || 0 }}
                              <span v-if="getEnhancedRanks(ruleSkill.name, inst.subtype) > 0" class="enh-math">
                                +{{ getEnhancedRanks(ruleSkill.name, inst.subtype) }}p
                              </span>
                              <span v-if="getAdvantageBonusForSkill(ruleSkill.name) > 0" class="enh-math" style="color: #fbbf24; font-weight: 700;">
                                +{{ getAdvantageBonusForSkill(ruleSkill.name) }} Adv
                              </span>
                            </span>
                          </div>
                        </div>
                      </td>
                      <td style="text-align: center;">
                        <span class="sheet-skill-ab-tag" :class="`ab-${ruleSkill.ability.toLowerCase()}`">
                          {{ ruleSkill.ability }}
                        </span>
                      </td>
                      <td class="tabular-nums mod-cell">
                        {{ formatMod(heroStore.effectiveAbilities[ruleSkill.ability] || 0) }}
                      </td>
                      <td style="text-align: center;">
                        <div class="stepper-wrap">
                          <button
                            type="button"
                            class="btn-step-sm"
                            :disabled="(inst.ranks || 0) <= 0"
                            @click="stepSpecialization(inst, -1)"
                            title="Decrease Rank"
                          >-</button>
                          <span class="tabular-nums step-value">{{ inst.ranks || 0 }}</span>
                          <button
                            type="button"
                            class="btn-step-sm"
                            @click="stepSpecialization(inst, 1)"
                            title="Increase Rank"
                          >+</button>
                          <button
                            type="button"
                            class="btn-delete-row"
                            title="Remove Specialization"
                            @click="removeSpecialtySkill(inst)"
                          >
                            <i class="ri-close-line"></i>
                          </button>
                        </div>
                      </td>
                      <td style="text-align: center;">
                        <span 
                          class="badge-check tabular-nums"
                          :class="{ 'is-active-check': calculateTotalBonus(ruleSkill.ability, inst.ranks, getEnhancedRanks(ruleSkill.name, inst.subtype), ruleSkill.name) > 0 }"
                        >
                          {{ formatMod(calculateTotalBonus(ruleSkill.ability, inst.ranks, getEnhancedRanks(ruleSkill.name, inst.subtype), ruleSkill.name)) }}
                        </span>
                      </td>
                    </tr>
                  </template>

                  <!-- Empty State for Specialization Group -->
                  <tr v-else class="spec-empty-row">
                    <td colspan="5">
                      <div class="spec-empty-box" @click="openAddSpecialtyDialog(ruleSkill.name)">
                        <i class="ri-add-circle-line"></i>
                        <span>No <strong>{{ ruleSkill.name }}</strong> specializations added yet. Click "+ Add Spec" to specialize.</span>
                      </div>
                    </td>
                  </tr>
                </template>

                <!-- 2. Standard Non-Subtype Skills (Acrobatics, Athletics, etc.) -->
                <template v-else>
                  <tr 
                    class="standard-skill-row"
                    :class="{ 'is-trained': isStandardTrained(ruleSkill.name) }"
                  >
                    <td>
                      <div class="skill-name-block">
                        <span class="skill-title">{{ ruleSkill.name }}</span>
                        <span class="spec-math-subtext">
                          {{ ruleSkill.ability }} {{ heroStore.effectiveAbilities[ruleSkill.ability] || 0 }} + Rk {{ getStandardRanks(ruleSkill.name) }}
                          <span v-if="getEnhancedRanks(ruleSkill.name) > 0" class="enh-math">
                            +{{ getEnhancedRanks(ruleSkill.name) }}p
                          </span>
                        </span>
                      </div>
                    </td>
                    <td style="text-align: center;">
                      <span class="sheet-skill-ab-tag" :class="`ab-${ruleSkill.ability.toLowerCase()}`">
                        {{ ruleSkill.ability }}
                      </span>
                    </td>
                    <td class="tabular-nums mod-cell">
                      {{ formatMod(heroStore.effectiveAbilities[ruleSkill.ability] || 0) }}
                    </td>
                    <td style="text-align: center;">
                      <div class="stepper-wrap">
                        <button
                          type="button"
                          class="btn-step-sm"
                          :disabled="getStandardRanks(ruleSkill.name) <= 0"
                          @click="stepStandardSkill(ruleSkill.name, -1)"
                          title="Decrease Rank"
                        >-</button>
                        <span class="tabular-nums step-value">{{ getStandardRanks(ruleSkill.name) }}</span>
                        <button
                          type="button"
                          class="btn-step-sm"
                          @click="stepStandardSkill(ruleSkill.name, 1)"
                          title="Increase Rank"
                        >+</button>
                      </div>
                    </td>
                    <td style="text-align: center;">
                      <span 
                        class="badge-check tabular-nums"
                        :class="{ 'is-active-check': calculateTotalBonus(ruleSkill.ability, getStandardRanks(ruleSkill.name), getEnhancedRanks(ruleSkill.name)) > 0 }"
                      >
                        {{ formatMod(calculateTotalBonus(ruleSkill.ability, getStandardRanks(ruleSkill.name), getEnhancedRanks(ruleSkill.name))) }}
                      </span>
                    </td>
                  </tr>
                </template>
              </template>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <!-- SPECIALTY SKILL MODAL (CUSTOM RANK & CLEAN INTERFACE) -->
    <transition name="modal-pop">
      <div v-if="showSpecialtyDialog" class="modal-overlay" @click.self="showSpecialtyDialog = false">
        <div class="modal-content spec-modal-card">
          <!-- Modal Header -->
          <div class="spec-modal-header">
            <h4>
              <i class="ri-medal-line"></i>
              <span>Add Specialty Skill</span>
            </h4>
            <button type="button" class="spec-modal-close" @click="showSpecialtyDialog = false" title="Close">
              <i class="ri-close-line"></i>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="spec-modal-body">
            <div class="form-group">
              <label class="form-label">Skill Type</label>
              <select v-model="specialtyType" class="form-control spec-select">
                <option value="Close Combat">Close Combat (FGT)</option>
                <option value="Ranged Combat">Ranged Combat (DEX)</option>
                <option value="Expertise">Expertise (INT)</option>
              </select>
            </div>

            <div class="form-group">
              <div class="label-with-hint">
                <label class="form-label">Subtype / Focus</label>
                <span class="spec-label-hint">Required for {{ specialtyType }}</span>
              </div>
              <input
                ref="focusInputRef"
                v-model="specialtyFocus"
                type="text"
                class="form-control spec-input"
                :placeholder="getPlaceholderForSkill(specialtyType)"
                @keyup.enter="confirmSpecialtySkill"
              />
            </div>

            <!-- Dynamic Suggestions -->
            <div v-if="suggestedSubtypes.length > 0" class="spec-chips-section">
              <span class="spec-chips-title">SUGGESTED SPECIALIZATIONS:</span>
              <div class="spec-chips-grid">
                <button
                  v-for="chip in suggestedSubtypes"
                  :key="chip"
                  type="button"
                  class="spec-chip-btn"
                  :class="{ active: specialtyFocus.toLowerCase() === chip.toLowerCase() }"
                  @click="specialtyFocus = chip"
                >
                  {{ chip }}
                </button>
              </div>
            </div>

            <!-- Custom Starting Rank Input -->
            <div class="form-group">
              <div class="label-with-hint">
                <label class="form-label">Starting Rank</label>
                <span class="spec-label-hint">{{ Math.ceil((Number(initialRankInput) || 0) / 2) }} PP Cost (1 PP = 2 Ranks)</span>
              </div>
              <div class="spec-custom-rank-wrap">
                <button 
                  type="button" 
                  class="rank-step-btn" 
                  :disabled="(Number(initialRankInput) || 0) <= 0"
                  @click="initialRankInput = Math.max(0, (Number(initialRankInput) || 0) - 1)"
                  title="Decrease Rank"
                >
                  <i class="ri-subtract-line"></i>
                </button>
                <input
                  v-model.number="initialRankInput"
                  type="number"
                  min="0"
                  max="30"
                  class="form-control spec-rank-input"
                  placeholder="0"
                  @keyup.enter="confirmSpecialtySkill"
                />
                <button 
                  type="button" 
                  class="rank-step-btn"
                  @click="initialRankInput = (Number(initialRankInput) || 0) + 1"
                  title="Increase Rank"
                >
                  <i class="ri-add-line"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="spec-modal-footer">
            <button type="button" class="btn btn-secondary btn-sm" @click="showSpecialtyDialog = false">Cancel</button>
            <button 
              type="button" 
              class="btn-modal-confirm" 
              :disabled="!specialtyFocus.trim()" 
              @click="confirmSpecialtySkill"
            >
              <i class="ri-check-line"></i> Add Specialty
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue';
import { useHeroStore } from '../../stores/heroStore.js';
import { useUiStore } from '../../stores/uiStore.js';
import { SKILLS } from '../../rules/skills.js';

const heroStore = useHeroStore();
const uiStore = useUiStore();

const categories = ['All', 'Trained', 'Combat', 'Physical', 'Mental', 'Interaction'];
const activeCategory = ref('All');
const searchQuery = ref('');

const showSpecialtyDialog = ref(false);
const specialtyType = ref('Close Combat');
const specialtyFocus = ref('');
const initialRankInput = ref(2);
const focusInputRef = ref(null);

const suggestedSubtypes = computed(() => {
  const current = SKILLS.find(s => s.name === specialtyType.value);
  return current?.commonSubtypes || [];
});

const totalRanks = computed(() => {
  return (heroStore.character?.skills || []).reduce((sum, s) => {
    return sum + (parseInt(s.ranks ?? s.rank ?? 0, 10) || 0);
  }, 0);
});

const trainedCount = computed(() => {
  const added = heroStore.character?.skills || [];
  let count = 0;
  for (const s of SKILLS) {
    if (s.requiresSubtype) {
      count += added.filter(inst => (inst.name || '').toLowerCase() === s.name.toLowerCase() && ((inst.ranks || 0) > 0 || getEnhancedRanks(s.name, inst.subtype) > 0)).length;
    } else {
      if (isStandardTrained(s.name)) count++;
    }
  }
  return count;
});

const filteredSkills = computed(() => {
  const added = heroStore.character?.skills || [];
  const q = searchQuery.value.toLowerCase().trim();

  return SKILLS.filter(s => {
    // 1. Category filter
    if (activeCategory.value === 'Trained') {
      if (s.requiresSubtype) {
        const hasTrained = getSubtypeInstances(s.name).some(inst => (inst.ranks || 0) > 0 || getEnhancedRanks(s.name, inst.subtype) > 0);
        if (!hasTrained) return false;
      } else {
        if (!isStandardTrained(s.name)) return false;
      }
    } else if (activeCategory.value !== 'All') {
      if ((s.category || '').toLowerCase() !== activeCategory.value.toLowerCase()) {
        return false;
      }
    }

    // 2. Search query match
    if (!q) return true;
    if (s.name.toLowerCase().includes(q)) return true;
    if (s.ability.toLowerCase().includes(q)) return true;
    if (s.desc && s.desc.toLowerCase().includes(q)) return true;

    if (s.requiresSubtype) {
      const matchInstance = added.some(inst =>
        inst.name.toLowerCase() === s.name.toLowerCase() &&
        inst.subtype &&
        inst.subtype.toLowerCase().includes(q)
      );
      if (matchInstance) return true;
      if (s.commonSubtypes && s.commonSubtypes.some(cs => cs.toLowerCase().includes(q))) return true;
    }

    return false;
  });
});

function getSubtypeInstances(skillName) {
  const skills = heroStore.character?.skills || [];
  return skills.filter(s => (s.name || '').toLowerCase() === skillName.toLowerCase());
}

function getStandardRanks(skillName) {
  const skills = heroStore.character?.skills || [];
  const found = skills.find(s => (s.name || '').toLowerCase() === skillName.toLowerCase() && !s.subtype);
  return found ? (Number(found.ranks ?? found.rank) || 0) : 0;
}

function getEnhancedRanks(skillName, subtype = '') {
  const traits = heroStore.activeEnhancedTraits?.skills || {};
  const fullKey = subtype ? `${skillName} (${subtype})`.toLowerCase() : skillName.toLowerCase();
  return (traits[fullKey] || traits[skillName.toLowerCase()] || 0);
}

function isStandardTrained(skillName) {
  const base = getStandardRanks(skillName);
  const enh = getEnhancedRanks(skillName);
  return (base + enh) > 0;
}

function getAdvantageNameForSkill(skillName) {
  if (skillName === 'Close Combat') return 'Close Attack';
  if (skillName === 'Ranged Combat') return 'Ranged Attack';
  return '';
}

function getAdvantageBonusForSkill(skillName) {
  const adv = getAdvantageNameForSkill(skillName);
  return adv ? (heroStore.getAdvantageRanks(adv) || 0) : 0;
}

function calculateTotalBonus(abilityKey, ranks, enhRanks = 0, skillName = '') {
  const abilMod = Number(heroStore.effectiveAbilities?.[abilityKey]) || 0;
  const advBonus = getAdvantageBonusForSkill(skillName);
  return abilMod + (Number(ranks) || 0) + (Number(enhRanks) || 0) + advBonus;
}

function formatMod(val) {
  return val >= 0 ? `+${val}` : `${val}`;
}

function stepStandardSkill(skillName, delta) {
  const cur = getStandardRanks(skillName);
  const newRank = Math.max(0, cur + delta);
  heroStore.setSkillRank(skillName, '', newRank);
}

function stepSpecialization(inst, delta) {
  const cur = Number(inst.ranks ?? inst.rank) || 0;
  const newRank = Math.max(0, cur + delta);
  heroStore.setSkillRank(inst.name, inst.subtype || '', newRank);
}

function removeSpecialtySkill(inst) {
  const skills = heroStore.character?.skills || [];
  const idx = skills.findIndex(s => s === inst || (s.name === inst.name && (s.subtype || '') === (inst.subtype || '')));
  if (idx !== -1) {
    heroStore.removeSkill(idx);
    uiStore.showToast(`Removed ${inst.name} (${inst.subtype})`, 'info');
  }
}

function openAddSpecialtyDialog(skillName = 'Close Combat') {
  specialtyType.value = skillName;
  specialtyFocus.value = '';
  initialRankInput.value = 2;
  showSpecialtyDialog.value = true;
  nextTick(() => {
    focusInputRef.value?.focus();
  });
}

function getPlaceholderForSkill(skillName) {
  if (skillName === 'Close Combat') return 'e.g. Unarmed, Swords, Knives, Claws...';
  if (skillName === 'Ranged Combat') return 'e.g. Firearms, Bows, Energy Blast, Thrown...';
  if (skillName === 'Expertise') return 'e.g. Science, Technology, Magic, Criminology...';
  return 'Specialization focus name...';
}

function confirmSpecialtySkill() {
  const sub = specialtyFocus.value.trim();
  if (!sub) {
    uiStore.showToast('Please enter a specialization focus (e.g. Unarmed, Swords)', 'error');
    return;
  }
  const ranks = Math.max(0, Number(initialRankInput.value) || 0);
  heroStore.setSkillRank(specialtyType.value, sub, ranks);
  uiStore.showToast(`Added ${specialtyType.value}: ${sub} (+${ranks} ranks)`, 'success');
  specialtyFocus.value = '';
  showSpecialtyDialog.value = false;
}
</script>

<style scoped>
.step-banner {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin-bottom: 1.25rem;
  padding: 1rem 1.25rem;
  background: rgba(234, 179, 8, 0.08);
  border: 1px solid rgba(234, 179, 8, 0.25);
  border-radius: var(--radius-md);
}

.step-banner-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  background: rgba(234, 179, 8, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  color: #facc15;
}

.step-title {
  font-size: 1.2rem;
  font-weight: 800;
  color: #fff;
  margin: 0;
}

.step-subtitle {
  font-size: 0.82rem;
  color: var(--text-secondary);
  margin: 0.25rem 0 0;
  line-height: 1.45;
}

/* Skills Summary Strip */
.wizard-skills-summary-card {
  padding: 0.75rem 1.15rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(234, 179, 8, 0.06);
  border-color: rgba(234, 179, 8, 0.25);
  border-radius: var(--radius-md);
}

.skills-summary-left {
  display: flex;
  align-items: baseline;
  gap: 0.45rem;
  font-size: 0.85rem;
  color: #fff;
  font-weight: 700;
}

.summary-label {
  color: #cbd5e1;
}

.summary-pp {
  color: #facc15;
  font-size: 1.1rem;
  font-weight: 900;
}

.summary-ranks {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 600;
}

.btn-wizard-add-spec {
  background: linear-gradient(135deg, rgba(234, 179, 8, 0.2), rgba(202, 138, 4, 0.3));
  border: 1px solid rgba(250, 204, 21, 0.4);
  color: #fef08a;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.3rem 0.75rem;
  border-radius: var(--radius-sm);
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  cursor: pointer;
  transition: all var(--trans-fast);
}

.btn-wizard-add-spec:hover {
  background: #eab308;
  border-color: #facc15;
  color: #0f172a;
  box-shadow: 0 2px 10px rgba(234, 179, 8, 0.4);
}

.btn-wizard-add-spec:active {
  transform: scale(0.96);
}

/* Toolbar */
.wizard-skills-toolbar {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  margin-bottom: 0.75rem;
}

.skills-cat-pills {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  overflow-x: auto;
  padding-bottom: 0.15rem;
  scrollbar-width: none;
}

.skills-cat-pills::-webkit-scrollbar {
  display: none;
}

.skill-cat-pill {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-xs);
  color: var(--text-muted);
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.22rem 0.65rem;
  cursor: pointer;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  transition: all var(--trans-fast);
}

.skill-cat-pill:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.skill-cat-pill.active {
  background: rgba(234, 179, 8, 0.25);
  border-color: #facc15;
  color: #fef08a;
  box-shadow: 0 1px 8px rgba(234, 179, 8, 0.3);
}

.cat-pill-count {
  background: #eab308;
  color: #0f172a;
  font-size: 0.62rem;
  font-weight: 900;
  padding: 0.05rem 0.35rem;
  border-radius: 9999px;
  line-height: 1;
}

.skills-search-wrap {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  background: rgba(15, 15, 22, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-sm);
  padding: 0.35rem 0.75rem;
  transition: border-color var(--trans-fast);
}

.skills-search-wrap:focus-within {
  border-color: #facc15;
  box-shadow: 0 0 0 2px rgba(250, 204, 21, 0.2);
}

.search-icon {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.skills-search-input {
  background: transparent;
  border: none;
  color: #fff;
  font-size: 0.82rem;
  font-family: inherit;
  outline: none;
  width: 100%;
}

.clear-search-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
}

.clear-search-btn:hover {
  color: #fff;
}

/* Skills Card & Table */
.wizard-skills-card {
  padding: 0.4rem 0.6rem;
  border-radius: var(--radius-md);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
}

.skills-table-responsive {
  max-height: 560px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(234, 179, 8, 0.4) rgba(15, 15, 20, 0.45);
}

.table-custom {
  width: 100%;
  border-collapse: collapse;
}

.table-custom th {
  padding: 0.65rem 0.75rem;
  font-size: 0.68rem;
  text-transform: uppercase;
  color: var(--text-muted);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-weight: 800;
  position: sticky;
  top: 0;
  background: #0f172a;
  z-index: 10;
  letter-spacing: 0.05em;
}

.table-custom td {
  padding: 0.45rem 0.75rem;
  font-size: 0.82rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

/* Skill Rows */
.standard-skill-row,
.spec-child-row {
  transition: background-color var(--trans-fast);
}

.standard-skill-row:hover,
.spec-child-row:hover {
  background: rgba(255, 255, 255, 0.03);
}

.standard-skill-row.is-trained,
.spec-child-row.is-trained {
  background: rgba(16, 185, 129, 0.03);
}

.skill-name-block {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.skill-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: #fff;
}

.spec-math-subtext {
  font-size: 0.68rem;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}

.enh-math {
  color: #38bdf8;
  font-weight: 700;
}

/* Ability Badges */
.sheet-skill-ab-tag {
  font-size: 0.68rem;
  font-weight: 800;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  text-align: center;
  text-transform: uppercase;
  font-family: var(--font-mono, monospace);
  display: inline-block;
  letter-spacing: 0.02em;
}

.ab-fgt {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.35);
  color: #f87171;
}

.ab-str {
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.35);
  color: #fbbf24;
}

.ab-agl {
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.35);
  color: #34d399;
}

.ab-dex {
  background: rgba(6, 182, 212, 0.15);
  border: 1px solid rgba(6, 182, 212, 0.35);
  color: #22d3ee;
}

.ab-int {
  background: rgba(99, 102, 241, 0.15);
  border: 1px solid rgba(99, 102, 241, 0.35);
  color: #818cf8;
}

.ab-awe {
  background: rgba(20, 184, 166, 0.15);
  border: 1px solid rgba(20, 184, 166, 0.35);
  color: #2dd4bf;
}

.ab-pre {
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: #fbbf24;
}

.ab-sta {
  background: rgba(244, 63, 94, 0.15);
  border: 1px solid rgba(244, 63, 94, 0.35);
  color: #fb7185;
}

.mod-cell {
  text-align: center;
  font-weight: 700;
  color: var(--text-secondary);
}

/* Stepper */
.stepper-wrap {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  padding: 2px 4px;
}

.btn-step-sm {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: var(--text-secondary);
  border-radius: 3px;
  font-weight: 800;
  cursor: pointer;
  transition: all var(--trans-fast);
}

.btn-step-sm:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.btn-step-sm:active:not(:disabled) {
  transform: scale(0.92);
}

.btn-step-sm:disabled {
  opacity: 0.25;
  cursor: not-allowed;
}

.step-value {
  min-width: 24px;
  font-weight: 800;
  color: #fff;
  font-size: 0.85rem;
}

.btn-delete-row {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 0.85rem;
  padding: 0.1rem 0.25rem;
  margin-left: 0.2rem;
  transition: color var(--trans-fast);
}

.btn-delete-row:hover {
  color: #ef4444;
}

/* Total Check Badge */
.badge-check {
  display: inline-block;
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-muted);
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-weight: 800;
  font-size: 0.82rem;
  padding: 0.2rem 0.65rem;
  border-radius: 4px;
  min-width: 44px;
}

.badge-check.is-active-check {
  background: rgba(234, 179, 8, 0.15);
  color: #fde047;
  border-color: rgba(234, 179, 8, 0.35);
  box-shadow: 0 0 8px rgba(234, 179, 8, 0.2);
}

/* Specialization Group Header */
.spec-group-row {
  background: rgba(20, 20, 32, 0.6);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.spec-header-title-wrap {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.spec-parent-name {
  font-size: 0.88rem;
  font-weight: 800;
  color: #fff;
}

.spec-count-tag {
  background: rgba(56, 189, 248, 0.15);
  border: 1px solid rgba(56, 189, 248, 0.35);
  color: #38bdf8;
  font-size: 0.65rem;
  font-weight: 800;
  padding: 0.05rem 0.4rem;
  border-radius: 9999px;
  line-height: 1;
}

.btn-spec-inline-add {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: var(--text-secondary);
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  transition: all var(--trans-fast);
}

.btn-spec-inline-add:hover {
  background: rgba(234, 179, 8, 0.2);
  border-color: #facc15;
  color: #fef08a;
}

/* Specialization Child */
.spec-child-row {
  background: rgba(56, 189, 248, 0.02);
}

.spec-child-title-wrap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-left: 0.75rem;
}

.spec-branch-icon {
  color: #38bdf8;
  font-size: 0.9rem;
  opacity: 0.8;
}

.spec-child-name-block {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.spec-name-tag-row {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.spec-subtype-name {
  font-size: 0.82rem;
  font-weight: 800;
  color: #e2e8f0;
}

.spec-badge-chip {
  background: rgba(56, 189, 248, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.25);
  color: #38bdf8;
  font-size: 0.58rem;
  font-weight: 800;
  padding: 0.05rem 0.3rem;
  border-radius: 2px;
}

/* Specialization Empty Row */
.spec-empty-row td {
  padding: 0.35rem 0.75rem 0.55rem 1.5rem;
}

.spec-empty-box {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.45rem 0.75rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px dashed rgba(255, 255, 255, 0.12);
  border-radius: 4px;
  color: var(--text-muted);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all var(--trans-fast);
}

.spec-empty-box:hover {
  background: rgba(234, 179, 8, 0.08);
  border-color: rgba(250, 204, 21, 0.4);
  color: #fef08a;
}

.spec-empty-box i {
  font-size: 0.95rem;
}

.empty-cell {
  text-align: center;
  padding: 2.5rem 1rem !important;
  color: var(--text-muted);
  font-size: 0.85rem;
}

.empty-cell i {
  font-size: 1.5rem;
  display: block;
  margin-bottom: 0.4rem;
  opacity: 0.4;
}

/* Modal Redesign */
.spec-modal-card {
  background: #12121a;
  border: 1px solid rgba(234, 179, 8, 0.35);
  border-radius: var(--radius-lg);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
  width: 100%;
  max-width: 460px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0 !important;
}

.modal-pop-enter-active,
.modal-pop-leave-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-pop-enter-from,
.modal-pop-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.spec-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.95rem 1.25rem;
  background: rgba(234, 179, 8, 0.08);
  border-bottom: 1px solid rgba(234, 179, 8, 0.2);
}

.spec-modal-header h4 {
  font-size: 1rem;
  font-weight: 800;
  color: #fff;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.spec-modal-header h4 i {
  color: #facc15;
}

.spec-modal-close {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 1.15rem;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.spec-modal-close:hover {
  color: #fff;
}

.spec-modal-body {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.label-with-hint {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.35rem;
}

.form-label {
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
}

.spec-label-hint {
  font-size: 0.68rem;
  color: #facc15;
}

.spec-select, .spec-input {
  background: rgba(20, 20, 30, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--radius-sm);
  color: #fff;
  padding: 0.55rem 0.75rem;
  font-size: 0.84rem;
  outline: none;
  transition: border-color var(--trans-fast), box-shadow var(--trans-fast);
}

.spec-select:focus, .spec-input:focus {
  border-color: #facc15;
  box-shadow: 0 0 0 3px rgba(250, 204, 21, 0.2);
}

.spec-chips-section {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.spec-chips-title {
  font-size: 0.65rem;
  font-weight: 800;
  color: var(--text-muted);
  letter-spacing: 0.05em;
}

.spec-chips-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.spec-chip-btn {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-pill);
  color: var(--text-secondary);
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.22rem 0.55rem;
  cursor: pointer;
  transition: all var(--trans-fast);
}

.spec-chip-btn:hover {
  background: rgba(234, 179, 8, 0.15);
  border-color: rgba(250, 204, 21, 0.4);
  color: #fff;
}

.spec-chip-btn.active {
  background: #eab308;
  border-color: #facc15;
  color: #0f172a;
  font-weight: 800;
}

.spec-custom-rank-wrap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.spec-rank-input {
  background: rgba(20, 20, 30, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--radius-sm);
  color: #fff;
  padding: 0.5rem 0.75rem;
  font-size: 0.95rem;
  font-weight: 800;
  text-align: center;
  font-variant-numeric: tabular-nums;
  outline: none;
  width: 100%;
  transition: border-color var(--trans-fast), box-shadow var(--trans-fast);
}

.spec-rank-input:focus {
  border-color: #facc15;
  box-shadow: 0 0 0 3px rgba(250, 204, 21, 0.2);
}

.rank-step-btn {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: 1rem;
  cursor: pointer;
  flex-shrink: 0;
  transition: all var(--trans-fast);
}

.rank-step-btn:hover:not(:disabled) {
  background: rgba(234, 179, 8, 0.2);
  border-color: #facc15;
  color: #fff;
}

.rank-step-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.rank-step-btn:disabled {
  opacity: 0.25;
  cursor: not-allowed;
}

.spec-modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.65rem;
  padding: 0.85rem 1.25rem;
  background: rgba(10, 10, 15, 0.6);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.btn-modal-confirm {
  background: linear-gradient(135deg, #eab308, #ca8a04);
  border: 1px solid #facc15;
  color: #0f172a;
  padding: 0.4rem 1rem;
  border-radius: var(--radius-sm);
  font-size: 0.82rem;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  cursor: pointer;
  transition: all var(--trans-fast);
  box-shadow: 0 2px 10px rgba(234, 179, 8, 0.35);
}

.btn-modal-confirm:hover:not(:disabled) {
  background: #facc15;
  box-shadow: 0 4px 14px rgba(234, 179, 8, 0.5);
}

.btn-modal-confirm:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
</style>
