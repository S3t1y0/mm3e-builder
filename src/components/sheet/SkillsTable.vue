<template>
  <div class="dndb-card dndb-skills-card">
    <!-- Card Header -->
    <div class="dndb-card-header">
      <div class="dndb-card-title-wrap">
        <i class="ri-focus-3-line dndb-card-icon"></i>
        <h3 class="dndb-card-title">SKILLS</h3>
      </div>
      <div class="dndb-skills-header-right">
        <span
          v-if="heroStore.circumstancePenalty !== 0"
          class="skills-cond-debuff-badge"
          :class="heroStore.conditionModifiers.isDisabled ? 'danger' : 'warn'"
        >
          {{ heroStore.conditionModifiers.isDisabled ? 'Disabled (-5)' : 'Impaired (-2)' }}
        </span>
        <div class="skills-budget-pill">
          <span class="budget-item ranks">
            <strong class="budget-num">{{ totalRanksBought }}</strong>
            <span class="budget-lbl">Rks</span>
          </span>
          <span class="budget-divider" aria-hidden="true"></span>
          <span class="budget-item pp">
            <strong class="budget-num">{{ heroStore.totalSkillPP }}</strong>
            <span class="budget-lbl">PP</span>
          </span>
        </div>
        <button 
          type="button" 
          class="btn-spec-add" 
          @click="openAddSpecializationModal()"
        >
          <i class="ri-add-line"></i> Spec
        </button>
        <button
          type="button"
          class="btn-trained-bypass"
          :class="{ 'is-active': uiStore.bypassTrainedOnly }"
          :title="uiStore.bypassTrainedOnly ? 'Untrained Bypass Active (Click to re-enable Trained Only restrictions)' : 'Bypass Trained Only skill locks'"
          @click="uiStore.toggleBypassTrainedOnly()"
        >
          <i :class="uiStore.bypassTrainedOnly ? 'ri-lock-unlock-line' : 'ri-lock-line'"></i>
          <span class="bypass-text">{{ uiStore.bypassTrainedOnly ? 'Bypass' : 'Bypass' }}</span>
        </button>
      </div>
    </div>

    <!-- Quick Specialization Modal -->
    <transition name="modal-pop">
      <div v-if="showSpecModal" class="spec-modal-backdrop" @click.self="showSpecModal = false">
        <div class="spec-modal-card">
          <div class="spec-modal-header">
            <h4>
              <i class="ri-medal-line"></i>
              <span>Add Specialized Skill</span>
            </h4>
            <button type="button" class="spec-modal-close" @click="showSpecModal = false" aria-label="Close">
              <i class="ri-close-line"></i>
            </button>
          </div>

          <div class="spec-modal-body">
            <div class="spec-form-group">
              <label>Skill Base</label>
              <select v-model="selectedBaseSkill" class="spec-select">
                <option v-for="sk in subtypeSkills" :key="sk.name" :value="sk.name" :disabled="heroStore.isAbilityAbsent(sk.ability)">
                  {{ sk.name }} ({{ sk.ability }}){{ heroStore.isAbilityAbsent(sk.ability) ? ': Absent (Locked)' : '' }}
                </option>
              </select>
            </div>

            <div class="spec-form-group">
              <div class="spec-label-row">
                <label>Specialty / Field</label>
                <span class="spec-label-hint">Required for {{ selectedBaseSkill }}</span>
              </div>
              <input
                ref="specInputRef"
                v-model="specSubtypeInput"
                type="text"
                class="spec-input"
                :placeholder="getPlaceholderForSkill(selectedBaseSkill)"
                @keyup.enter="confirmAddSpecialization"
              />
            </div>

            <!-- Dynamic Suggestions -->
            <div v-if="suggestedSubtypes.length > 0" class="spec-chips-section">
              <span class="spec-chips-title">SUGGESTED SPECIALTIES / FIELDS:</span>
              <div class="spec-chips-grid">
                <button
                  v-for="chip in suggestedSubtypes"
                  :key="chip"
                  type="button"
                  class="spec-chip-btn"
                  :class="{ active: specSubtypeInput.toLowerCase() === chip.toLowerCase() }"
                  @click="specSubtypeInput = chip"
                >
                  {{ chip }}
                </button>
              </div>
            </div>

            <!-- Custom Starting Rank Input -->
            <div class="spec-form-group">
              <div class="spec-label-row">
                <label>Starting Rank</label>
                <span class="spec-label-hint">{{ Math.ceil((Number(initialRankInput) || 0) / 2) }} PP Cost (1 PP = 2 Ranks)</span>
              </div>
              <div class="spec-custom-rank-wrap">
                <button 
                  type="button" 
                  class="rank-step-btn" 
                  :disabled="(Number(initialRankInput) || 0) <= 0"
                  @click="initialRankInput = Math.max(0, (Number(initialRankInput) || 0) - 1)"
                >
                  <i class="ri-subtract-line"></i>
                </button>
                <input
                  v-model.number="initialRankInput"
                  type="number"
                  min="0"
                  max="30"
                  class="spec-rank-input"
                  placeholder="0"
                  @keyup.enter="confirmAddSpecialization"
                />
                <button 
                  type="button" 
                  class="rank-step-btn"
                  @click="initialRankInput = (Number(initialRankInput) || 0) + 1"
                >
                  <i class="ri-add-line"></i>
                </button>
              </div>
            </div>
          </div>

          <div class="spec-modal-footer">
            <button type="button" class="spec-btn-cancel" @click="showSpecModal = false">Cancel</button>
            <button type="button" class="spec-btn-confirm" @click="confirmAddSpecialization">
              <i class="ri-check-line"></i> Add Specialization
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Skills Toolbar: Category Pills & Compact Search -->
    <div class="sheet-skills-toolbar">
      <div class="skills-cat-pills" v-drag-scroll>
        <button
          v-for="cat in categories"
          :key="cat"
          type="button"
          class="skill-cat-pill"
          :class="{ active: activeCategory === cat }"
          @click="activeCategory = cat"
        >
          <span class="cat-pill-text">{{ cat }}</span>
          <span v-if="cat === 'Trained'" class="cat-pill-count">{{ trainedSkillsCount }}</span>
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
        >
          <i class="ri-close-circle-line"></i>
        </button>
      </div>
    </div>

    <!-- 4-Column Table Header (Zero Truncation Layout) -->
    <div class="sheet-skills-table-header">
      <span class="th-abil">Abil</span>
      <span class="th-name">Skill Name</span>
      <span class="th-rank">Rank</span>
      <span class="th-roll">Roll</span>
    </div>

    <!-- Scrollable Skills List -->
    <div class="sheet-skills-list">
      <template v-if="filteredRuleSkills.length === 0">
        <div class="empty-hint">
          <i class="ri-search-eye-line empty-icon"></i>
          <span>No skills found matching "{{ searchQuery }}".</span>
        </div>
      </template>

      <template v-else>
        <template v-for="ruleSkill in filteredRuleSkills" :key="ruleSkill.name">
          <!-- Specialization skills (Close Combat, Ranged Combat, Expertise) -->
          <template v-if="ruleSkill.requiresSubtype">
            <!-- Unspecialized row with + Spec prompt when 0 specializations added -->
            <div
              v-if="getSubtypeInstances(ruleSkill.name).length === 0"
              class="sheet-skill-row spec-unspecialized-row"
              :class="{ 'is-absent-row': heroStore.isAbilityAbsent(ruleSkill.ability) }"
            >
              <span 
                class="sheet-skill-ab-tag"
                :class="`ab-${ruleSkill.ability.toLowerCase()}`"
              >
                {{ ruleSkill.ability }}
              </span>

              <div class="sheet-skill-info" @click="openSkillInspector(ruleSkill)">
                <div class="sheet-skill-title-row">
                  <span class="sheet-skill-name is-clickable">{{ ruleSkill.name }}</span>
                </div>
              </div>

              <div class="spec-unspecialized-action">
                <button
                  type="button"
                  class="btn-spec-inline-add"
                  :disabled="heroStore.isAbilityAbsent(ruleSkill.ability)"
                  @click="openInlineSpecModal(ruleSkill.name)"
                >
                  <i class="ri-add-line"></i> Spec
                </button>
              </div>
            </div>

            <!-- Standalone rows when one or more specializations exist -->
            <template v-else>
              <div
                v-for="inst in getSubtypeInstances(ruleSkill.name)"
                :key="inst.id || (ruleSkill.name + '_' + inst.subtype)"
                class="sheet-skill-row"
                :class="{ 
                  'is-trained': !heroStore.isAbilityAbsent(ruleSkill.ability) && (Number(inst.ranks ?? inst.rank) || 0) + getEnhancedRanks(ruleSkill.name, inst.subtype) > 0,
                  'is-signature': !heroStore.isAbilityAbsent(ruleSkill.ability) && isSignatureSkill(calculateTotalBonus(ruleSkill.ability, inst.ranks, getEnhancedRanks(ruleSkill.name, inst.subtype), ruleSkill.name), inst.ranks),
                  'is-absent-row': heroStore.isAbilityAbsent(ruleSkill.ability)
                }"
              >
                <!-- Ability tag -->
                <span 
                  class="sheet-skill-ab-tag"
                  :class="`ab-${ruleSkill.ability.toLowerCase()}`"
                >
                  {{ ruleSkill.ability }}
                </span>

                <!-- Name with full category prefix and hover delete button -->
                <div class="sheet-skill-info" @click="openSkillInspector(ruleSkill, inst)">
                  <div class="sheet-skill-title-row">
                    <span 
                      class="sheet-skill-name is-clickable"
                    >
                      {{ inst.subtype || ruleSkill.name }}
                    </span>
                    <span
                      v-if="isUntrainedLocked(ruleSkill.name, (inst.ranks || 0))"
                      class="sheet-skill-locked-tag"
                      title="Trained Only (Requires Ranks or Jack-of-all-Trades)"
                    >
                      <i class="ri-lock-line"></i>
                    </span>
                    <button
                      type="button"
                      class="btn-delete-spec-hover"
                      @click.stop="deleteSpecialization(inst)"
                    >
                      <i class="ri-close-line"></i>
                    </button>
                  </div>
                </div>

                <!-- Rank Stepper Column -->
                <div class="sheet-skill-stepper-col">
                  <div class="stepper-compact" :class="{ 'has-ranks': (inst.ranks || 0) > 0, 'is-disabled-stepper': heroStore.isAbilityAbsent(ruleSkill.ability) }">
                    <button
                      type="button"
                      class="step-btn-xs"
                      :disabled="heroStore.isAbilityAbsent(ruleSkill.ability) || (inst.ranks || 0) <= 0"
                      @click="stepSpecialization(inst, -1)"
                    >-</button>
                    <span class="step-val-xs">
                      {{ heroStore.isAbilityAbsent(ruleSkill.ability) ? '-' : (inst.ranks || 0) }}
                      <span
                        v-if="!heroStore.isAbilityAbsent(ruleSkill.ability) && getEnhancedRanks(ruleSkill.name, inst.subtype) > 0"
                        class="enh-pip-tag"
                      >+{{ getEnhancedRanks(ruleSkill.name, inst.subtype) }}p</span>
                    </span>
                    <button
                      type="button"
                      class="step-btn-xs"
                      :disabled="heroStore.isAbilityAbsent(ruleSkill.ability)"
                      @click="stepSpecialization(inst, 1)"
                    >+</button>
                  </div>
                </div>

                <!-- Roll Button -->
                <button
                  type="button"
                  class="sheet-skill-roll-btn"
                  :class="{ 
                    'is-absent-btn': heroStore.isAbilityAbsent(ruleSkill.ability) || (ruleSkill.name === 'Close Combat' && heroStore.conditionModifiers.cannotCloseAttack),
                    'is-locked-btn': isUntrainedLocked(ruleSkill.name, (inst.ranks || 0)),
                    'btn-trained': !heroStore.isAbilityAbsent(ruleSkill.ability) && (Number(inst.ranks ?? inst.rank) || 0) + getEnhancedRanks(ruleSkill.name, inst.subtype) > 0,
                    'btn-signature': !heroStore.isAbilityAbsent(ruleSkill.ability) && isSignatureSkill(calculateTotalBonus(ruleSkill.ability, inst.ranks, getEnhancedRanks(ruleSkill.name, inst.subtype), ruleSkill.name), inst.ranks)
                  }"
                  :disabled="heroStore.isAbilityAbsent(ruleSkill.ability) || (ruleSkill.name === 'Close Combat' && heroStore.conditionModifiers.cannotCloseAttack)"
                  @click="handleSkillRoll(inst.subtype || ruleSkill.name, calculateTotalBonus(ruleSkill.ability, inst.ranks, getEnhancedRanks(ruleSkill.name, inst.subtype), ruleSkill.name), (inst.ranks || 0), ruleSkill.name)"
                >
                  <i :class="(heroStore.isAbilityAbsent(ruleSkill.ability) || (ruleSkill.name === 'Close Combat' && heroStore.conditionModifiers.cannotCloseAttack)) ? 'ri-close-line' : (isUntrainedLocked(ruleSkill.name, (inst.ranks || 0)) ? 'ri-lock-line' : 'ri-dice-line')"></i>
                  <span class="skill-roll-val">
                    {{ heroStore.isAbilityAbsent(ruleSkill.ability) ? '-' : formatMod(calculateTotalBonus(ruleSkill.ability, inst.ranks, getEnhancedRanks(ruleSkill.name, inst.subtype), ruleSkill.name)) }}
                  </span>
                </button>
              </div>
            </template>
          </template>

          <!-- 2. Standard Non-Subtype Skills (Acrobatics, Athletics, Deception, etc.) -->
          <template v-else>
            <div
              class="sheet-skill-row"
              :class="{ 
                'is-trained': !heroStore.isAbilityAbsent(ruleSkill.ability) && isStandardTrained(ruleSkill.name),
                'is-signature': !heroStore.isAbilityAbsent(ruleSkill.ability) && isSignatureSkill(calculateTotalBonus(ruleSkill.ability, getStandardRanks(ruleSkill.name), getEnhancedRanks(ruleSkill.name)), getStandardRanks(ruleSkill.name)) && isStandardTrained(ruleSkill.name),
                'is-absent-row': heroStore.isAbilityAbsent(ruleSkill.ability)
              }"
            >
              <!-- Ability Tag -->
              <span 
                class="sheet-skill-ab-tag"
                :class="`ab-${ruleSkill.ability.toLowerCase()}`"
              >
                {{ ruleSkill.ability }}
              </span>

              <!-- Name -->
              <div class="sheet-skill-info" @click="openSkillInspector(ruleSkill)">
                <div class="sheet-skill-title-row">
                  <span 
                    class="sheet-skill-name is-clickable"
                  >{{ ruleSkill.name }}</span>
                  <span
                    v-if="isUntrainedLocked(ruleSkill.name, getStandardRanks(ruleSkill.name))"
                    class="sheet-skill-locked-tag"
                    title="Trained Only (Requires Ranks or Jack-of-all-Trades)"
                  >
                    <i class="ri-lock-line"></i>
                  </span>
                </div>
              </div>

              <!-- Rank Stepper Column -->
              <div class="sheet-skill-stepper-col">
                <div class="stepper-compact" :class="{ 'has-ranks': getStandardRanks(ruleSkill.name) > 0, 'is-disabled-stepper': heroStore.isAbilityAbsent(ruleSkill.ability) }">
                  <button
                    type="button"
                    class="step-btn-xs"
                    :disabled="heroStore.isAbilityAbsent(ruleSkill.ability) || getStandardRanks(ruleSkill.name) <= 0"
                    @click="stepStandardSkill(ruleSkill.name, -1)"
                  >-</button>
                  <span class="step-val-xs">
                    {{ heroStore.isAbilityAbsent(ruleSkill.ability) ? '-' : getStandardRanks(ruleSkill.name) }}
                    <span
                      v-if="!heroStore.isAbilityAbsent(ruleSkill.ability) && getEnhancedRanks(ruleSkill.name) > 0"
                      class="enh-pip-tag"
                    >+{{ getEnhancedRanks(ruleSkill.name) }}p</span>
                  </span>
                  <button
                    type="button"
                    class="step-btn-xs"
                    :disabled="heroStore.isAbilityAbsent(ruleSkill.ability)"
                    @click="stepStandardSkill(ruleSkill.name, 1)"
                  >+</button>
                </div>
              </div>

              <!-- Roll Button (Trained vs Untrained visual hierarchy) -->
              <button
                type="button"
                class="sheet-skill-roll-btn"
                :class="{ 
                  'is-absent-btn': heroStore.isAbilityAbsent(ruleSkill.ability),
                  'is-locked-btn': isUntrainedLocked(ruleSkill.name, getStandardRanks(ruleSkill.name)),
                  'btn-trained': !heroStore.isAbilityAbsent(ruleSkill.ability) && isStandardTrained(ruleSkill.name),
                  'btn-signature': !heroStore.isAbilityAbsent(ruleSkill.ability) && isSignatureSkill(calculateTotalBonus(ruleSkill.ability, getStandardRanks(ruleSkill.name), getEnhancedRanks(ruleSkill.name)), getStandardRanks(ruleSkill.name)) && isStandardTrained(ruleSkill.name)
                }"
                :disabled="heroStore.isAbilityAbsent(ruleSkill.ability)"
                @click="handleSkillRoll(ruleSkill.name, calculateTotalBonus(ruleSkill.ability, getStandardRanks(ruleSkill.name), getEnhancedRanks(ruleSkill.name)), getStandardRanks(ruleSkill.name))"
              >
                <i :class="heroStore.isAbilityAbsent(ruleSkill.ability) ? 'ri-close-line' : (isUntrainedLocked(ruleSkill.name, getStandardRanks(ruleSkill.name)) ? 'ri-lock-line' : 'ri-dice-line')"></i>
                <span class="skill-roll-val">
                  {{ heroStore.isAbilityAbsent(ruleSkill.ability) ? '-' : formatMod(calculateTotalBonus(ruleSkill.ability, getStandardRanks(ruleSkill.name), getEnhancedRanks(ruleSkill.name))) }}
                </span>
              </button>
            </div>
          </template>
        </template>
      </template>
    </div>
  </div>
</template>

<script setup>
import { useHeroStore } from '../../stores/heroStore.js';
import { useUiStore } from '../../stores/uiStore.js';
import { useSkillsWorkflow } from '../../rules/useSkillsWorkflow.js';

const heroStore = useHeroStore();
const uiStore = useUiStore();

import { isSkillUntrainedLocked } from '../../rules/skills.js';

const {
  categories,
  activeCategory,
  searchQuery,
  showSpecModal,
  selectedBaseSkill,
  specSubtypeInput,
  initialRankInput,
  specInputRef,
  subtypeSkills,
  currentSelectedAbility,
  suggestedSubtypes,
  totalRanksBought,
  trainedSkillsCount,
  filteredRuleSkills,
  getSubtypeInstances,
  getStandardRanks,
  getEnhancedRanks,
  isStandardTrained,
  isSpecializationTrained,
  getAdvantageNameForSkill,
  getAdvantageBonusForSkill,
  calculateTotalBonus,
  formatMod,
  stepStandardSkill,
  stepSpecialization,
  deleteSpecialization,
  openAddSpecializationModal,
  openInlineSpecModal,
  getPlaceholderForSkill,
  confirmAddSpecialization,
  isSignatureSkill,
  rollSkill
} = useSkillsWorkflow(heroStore, uiStore, { includeCircumstance: true });

function isUntrainedLocked(skillName, ranks) {
  return isSkillUntrainedLocked(skillName, ranks, heroStore, uiStore.bypassTrainedOnly);
}

function handleSkillRoll(skillTitle, bonus, ranks, baseSkill = null) {
  if (isUntrainedLocked(baseSkill || skillTitle, ranks)) {
    uiStore.showToast(`Trained Only: ${skillTitle} cannot be rolled untrained without ranks or Jack-of-all-Trades.`, 'warn', 3500);
    return;
  }
  rollSkill(skillTitle, bonus, baseSkill);
}

function openSkillInspector(ruleSkill, inst = null) {
  const isSubtype = !!ruleSkill.requiresSubtype;
  const skillName = ruleSkill.name;
  const subtype = inst?.subtype || '';
  const displayName = subtype ? `${skillName}: ${subtype}` : skillName;
  
  uiStore.openInspector(
    'skill',
    {
      name: skillName,
      subtype: subtype,
      ability: ruleSkill.ability,
      category: ruleSkill.category,
      requiresSubtype: isSubtype,
      instId: inst?.id || null
    },
    displayName,
    `${ruleSkill.ability} | ${ruleSkill.category} Skill`
  );
}
</script>

<style scoped>
/* Card Header Custom Elements */
.dndb-skills-header-right {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.skills-cond-debuff-badge {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  font-weight: 800;
  padding: 0.15rem 0.45rem;
  border-radius: var(--radius-xs, 4px);
  text-transform: uppercase;
}

.skills-cond-debuff-badge.danger {
  background: rgba(239, 68, 68, 0.18);
  border: 1px solid rgba(239, 68, 68, 0.35);
  color: #fca5a5;
}

.skills-cond-debuff-badge.warn {
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: #fcd34d;
}

.skills-budget-pill {
  display: inline-flex;
  align-items: center;
  height: 26px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0 0.55rem;
  border-radius: var(--radius-xs, 4px);
  gap: 0.45rem;
  box-sizing: border-box;
}

.budget-item {
  display: inline-flex;
  align-items: baseline;
  gap: 0.2rem;
}

.budget-num {
  font-family: var(--font-mono, monospace);
  font-size: 0.76rem;
  font-weight: 800;
  color: #f1f5f9;
  line-height: 1;
}

.budget-lbl {
  font-size: 0.62rem;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.budget-item.pp .budget-num {
  color: #60a5fa;
}

.budget-item.pp .budget-lbl {
  color: rgba(96, 165, 250, 0.8);
}

.budget-divider {
  width: 1px;
  height: 12px;
  background: rgba(255, 255, 255, 0.16);
  margin: 0 0.05rem;
}

.btn-spec-add {
  height: 26px;
  background: rgba(0, 111, 184, 0.15);
  border: 1px solid rgba(0, 111, 184, 0.4);
  color: #38bdf8;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0 0.55rem;
  border-radius: var(--radius-xs, 4px);
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
  box-sizing: border-box;
  transition: all var(--trans-fast);
}

.btn-spec-add:hover {
  background: var(--accent-primary);
  border-color: var(--accent-secondary);
  color: #fff;
  box-shadow: 0 2px 8px rgba(0, 111, 184, 0.35);
}

.btn-spec-add:active {
  transform: scale(0.96);
}

.btn-trained-bypass {
  height: 24px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: var(--text-muted);
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0 0.5rem;
  border-radius: var(--radius-xs, 4px);
  display: inline-flex;
  align-items: center;
  gap: 0.28rem;
  cursor: pointer;
  box-sizing: border-box;
  transition: all var(--trans-fast);
}

.btn-trained-bypass:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border-color: rgba(255, 255, 255, 0.2);
}

.btn-trained-bypass.is-active {
  background: rgba(245, 158, 11, 0.18);
  border-color: rgba(245, 158, 11, 0.5);
  color: #fbbf24;
  box-shadow: 0 0 8px rgba(245, 158, 11, 0.2);
}

.btn-trained-bypass.is-active:hover {
  background: rgba(245, 158, 11, 0.28);
  border-color: #f59e0b;
  color: #fef3c7;
}

/* Toolbar & Filter Pills */
.sheet-skills-toolbar {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  margin-bottom: 0.55rem;
  flex-shrink: 0;
}

.skills-cat-pills {
  display: flex;
  align-items: center;
  gap: 0.3rem;
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
  border-radius: var(--radius-pill);
  color: var(--text-muted);
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.18rem 0.55rem;
  cursor: pointer;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  transition: all var(--trans-fast);
}

.skill-cat-pill:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.skill-cat-pill:active {
  transform: scale(0.96);
}

.skill-cat-pill.active {
  background: rgba(0, 111, 184, 0.25);
  border-color: var(--accent-secondary);
  color: #fff;
  box-shadow: 0 1px 6px rgba(0, 111, 184, 0.3);
}

.cat-pill-count {
  background: var(--accent-primary);
  color: #fff;
  font-size: 0.6rem;
  font-weight: 800;
  padding: 0.05rem 0.3rem;
  border-radius: var(--radius-xs, 3px);
  line-height: 1;
}

.skills-search-wrap {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(15, 15, 22, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-sm);
  padding: 0.3rem 0.6rem;
  transition: border-color var(--trans-fast);
}

.skills-search-wrap:focus-within {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 2px rgba(0, 111, 184, 0.2);
}

.search-icon {
  color: var(--text-muted);
  font-size: 0.85rem;
  flex-shrink: 0;
}

.skills-search-input {
  background: transparent;
  border: none;
  color: #fff;
  font-size: 0.78rem;
  font-family: inherit;
  outline: none;
  width: 100%;
}

.skills-search-input:focus-visible {
  outline: 2px solid var(--accent-secondary);
  outline-offset: 2px;
}

.skills-search-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}



/* 4-Column Table Header */
.sheet-skills-table-header {
  display: grid;
  grid-template-columns: 30px minmax(0, 1fr) auto 54px;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.45rem;
  font-size: 0.64rem;
  font-weight: 800;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  margin-bottom: 0.35rem;
  flex-shrink: 0;
}

.th-abil {
  text-align: center;
}

.th-rank {
  text-align: center;
}

.th-roll {
  text-align: center;
}

/* Scrollable List */
.sheet-skills-list {
  display: flex;
  flex-direction: column;
  gap: 0.28rem;
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior-y: auto;
  will-change: scroll-position;
  padding-right: 2px;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 111, 184, 0.4) rgba(15, 15, 20, 0.45);
}

/* Skill Rows (Zero Truncation Grid) */
.sheet-skill-row {
  display: grid;
  grid-template-columns: 30px minmax(0, 1fr) auto 54px;
  align-items: center;
  gap: 0.4rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-left: 2.5px solid transparent;
  border-radius: var(--radius-sm);
  padding: 0.32rem 0.45rem;
  transition: background-color var(--trans-fast), border-color var(--trans-fast);
}

.sheet-skill-row:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.12);
}

.sheet-skill-row.is-trained {
  background: rgba(16, 185, 129, 0.035);
  border-left-color: #10b981;
}

.sheet-skill-row.is-signature {
  background: rgba(0, 111, 184, 0.06);
  border-left-color: var(--accent-primary);
}

/* Ability Badges (Refined Triad Calibration) */
.sheet-skill-ab-tag {
  font-size: 0.63rem;
  font-weight: 800;
  padding: 0.12rem 0;
  border-radius: 3px;
  text-align: center;
  text-transform: uppercase;
  font-family: var(--font-mono, monospace);
  display: block;
  width: 100%;
  letter-spacing: 0.02em;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-secondary);
}

/* Physical */
.ab-fgt, .ab-str, .ab-sta {
  background: rgba(239, 68, 68, 0.08);
  border-color: rgba(239, 68, 68, 0.25);
  color: #fca5a5;
}

.ab-agl {
  background: rgba(16, 185, 129, 0.08);
  border-color: rgba(16, 185, 129, 0.25);
  color: #6ee7b7;
}

/* Mental & Dexterity */
.ab-dex, .ab-int, .ab-awe {
  background: rgba(56, 189, 248, 0.08);
  border-color: rgba(56, 189, 248, 0.25);
  color: #7dd3fc;
}

/* Presence */
.ab-pre {
  background: rgba(245, 158, 11, 0.08);
  border-color: rgba(245, 158, 11, 0.25);
  color: #fde68a;
}

/* Skill Info (Name & Math Formula) */
.sheet-skill-info {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
}

.sheet-skill-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.35rem;
  min-width: 0;
}

.sheet-skill-name {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.25;
  flex: 1;
  min-width: 0;
}

.sheet-skill-name.is-clickable {
  cursor: pointer;
  transition: color var(--trans-fast);
}

.sheet-skill-name.is-clickable:hover {
  color: #38bdf8;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.sheet-skill-row.is-trained .sheet-skill-name {
  color: #fff;
  font-weight: 800;
}

.sig-badge {
  font-size: 0.54rem;
  font-weight: 800;
  color: #38bdf8;
  background: rgba(0, 111, 184, 0.2);
  border: 1px solid rgba(0, 111, 184, 0.4);
  padding: 0.04rem 0.25rem;
  border-radius: 2px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  flex-shrink: 0;
  line-height: 1.1;
}

.sheet-skill-math {
  font-size: 0.65rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 0.2rem;
  font-family: var(--font-mono, monospace);
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.math-base-quiet {
  opacity: 0.65;
}

.math-rk {
  color: #e2e8f0;
  font-weight: 700;
}

.math-operator {
  opacity: 0.4;
}

.enh-math-tag {
  color: #38bdf8;
  font-weight: 700;
}

.enh-math-tag.adv {
  color: #fbbf24;
}

.spec-adv-chip {
  font-size: 0.6rem;
  font-weight: 800;
  color: #fbbf24;
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.3);
  padding: 0.05rem 0.32rem;
  border-radius: 3px;
  letter-spacing: 0.02em;
  white-space: nowrap;
  flex-shrink: 0;
}

/* Stepper Column */
.sheet-skill-stepper-col {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  position: relative;
}

.btn-delete-spec-hover {
  display: none;
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 0.85rem;
  padding: 0;
  width: 14px;
  height: 14px;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: color var(--trans-fast);
}

.sheet-skill-row:hover .btn-delete-spec-hover {
  display: flex;
}

.btn-delete-spec-hover:hover {
  color: #ef4444;
  opacity: 1;
}

.stepper-compact {
  display: inline-flex;
  align-items: center;
  gap: 0.15rem;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: var(--radius-xs);
  padding: 1px 2px;
}

.stepper-compact.has-ranks {
  background: rgba(0, 0, 0, 0.45);
  border-color: rgba(56, 189, 248, 0.25);
}



.stepper-compact.has-ranks .step-val-xs {
  color: #38bdf8;
  font-weight: 900;
}

.enh-pip-tag {
  font-size: 0.6rem;
  color: #38bdf8;
}

/* Roll Button (Tactile Monospace D20) */
.sheet-skill-roll-btn {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-xs, 4px);
  color: var(--text-secondary);
  height: 25px;
  padding: 0 0.35rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.28rem;
  cursor: pointer;
  transition: all var(--trans-fast);
  font-family: var(--font-mono, monospace);
  font-variant-numeric: tabular-nums;
  width: 100%;
  box-sizing: border-box;
}

.sheet-skill-roll-btn i {
  font-size: 0.82rem;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: currentColor;
  opacity: 0.85;
  transition: opacity var(--trans-fast), transform var(--trans-fast);
}

.sheet-skill-roll-btn .skill-roll-val {
  font-size: 0.84rem;
  font-weight: 800;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
  color: currentColor;
}

.sheet-skill-roll-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.25);
  color: #fff;
  transform: translateY(-1px);
}

.sheet-skill-roll-btn:hover i {
  opacity: 1;
  transform: rotate(12deg);
}

.sheet-skill-roll-btn:active {
  transform: translateY(1px) scale(0.97);
}

/* Trained Roll Button */
.sheet-skill-roll-btn.btn-trained {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.35);
  color: #6ee7b7;
}

.sheet-skill-roll-btn.btn-trained:hover {
  background: #10b981;
  border-color: #34d399;
  color: #09090b;
  box-shadow: var(--shadow-sm);
}

/* Signature Roll Button */
.sheet-skill-roll-btn.btn-signature {
  background: rgba(0, 111, 184, 0.15);
  border-color: rgba(0, 111, 184, 0.45);
  color: #38bdf8;
  font-weight: 800;
}

.sheet-skill-roll-btn.btn-signature:hover {
  background: var(--accent-primary);
  border-color: var(--accent-secondary);
  color: #fff;
  box-shadow: var(--shadow-sm);
}

/* Trained Only Lock Visuals */
.sheet-skill-locked-tag {
  display: inline-flex;
  align-items: center;
  font-size: 0.68rem;
  color: #fca5a5;
  margin-left: 0.35rem;
  opacity: 0.85;
}

.sheet-skill-roll-btn.is-locked-btn {
  background: rgba(239, 68, 68, 0.08);
  border-color: rgba(239, 68, 68, 0.28);
  color: #fca5a5;
}

.sheet-skill-roll-btn.is-locked-btn:hover {
  background: rgba(239, 68, 68, 0.18);
  border-color: rgba(239, 68, 68, 0.5);
  color: #fff;
}

.spec-unspecialized-row {
  border-style: dashed;
  border-color: rgba(255, 255, 255, 0.08);
}

.spec-unspecialized-action {
  grid-column: 3 / 5;
  justify-self: end;
  display: flex;
  align-items: center;
}

.btn-spec-inline-add {
  background: rgba(56, 189, 248, 0.1);
  border: 1px solid rgba(56, 189, 248, 0.3);
  color: #7dd3fc;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.22rem 0.6rem;
  border-radius: var(--radius-xs);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  transition: all var(--trans-fast);
  white-space: nowrap;
}

.btn-spec-inline-add:hover {
  background: rgba(56, 189, 248, 0.22);
  border-color: #38bdf8;
  color: #fff;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(56, 189, 248, 0.2);
}

.btn-spec-inline-add:active {
  transform: scale(0.95);
}

.empty-hint {
  padding: 2.5rem 1rem;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.82rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.empty-icon {
  font-size: 1.5rem;
  opacity: 0.4;
}

/* Modal Styling */
.spec-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  z-index: var(--z-modal-backdrop, 80);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.spec-modal-card {
  background: #12121a;
  border: 1px solid rgba(0, 111, 184, 0.4);
  border-radius: var(--radius-lg);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
  width: 100%;
  max-width: 460px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: var(--z-modal, 90);
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
  padding: 0.9rem 1.25rem;
  background: rgba(0, 111, 184, 0.1);
  border-bottom: 1px solid rgba(0, 111, 184, 0.25);
}

.spec-modal-header h4 {
  font-size: 0.95rem;
  font-weight: 800;
  color: #fff;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.spec-modal-header h4 i {
  color: var(--accent-primary);
}

.spec-modal-close {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 1.1rem;
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

.spec-form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.spec-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.spec-form-group label {
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.spec-label-hint {
  font-size: 0.68rem;
  color: #38bdf8;
}

.spec-select, .spec-input {
  background: rgba(20, 20, 30, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--radius-sm);
  color: #fff;
  padding: 0.55rem 0.75rem;
  font-size: 0.84rem;
  font-family: inherit;
  outline: none;
  transition: border-color var(--trans-fast), box-shadow var(--trans-fast);
}

.spec-select:focus, .spec-input:focus {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(0, 111, 184, 0.25);
}

.spec-select:focus-visible, .spec-input:focus-visible {
  outline: 2px solid var(--accent-secondary);
  outline-offset: 2px;
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
  background: rgba(0, 111, 184, 0.15);
  border-color: rgba(0, 111, 184, 0.4);
  color: #fff;
}

.spec-chip-btn.active {
  background: var(--accent-primary);
  border-color: var(--accent-secondary);
  color: #fff;
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
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(0, 111, 184, 0.25);
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
  background: rgba(0, 111, 184, 0.2);
  border-color: var(--accent-secondary);
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

.spec-btn-cancel {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: var(--text-secondary);
  padding: 0.4rem 0.85rem;
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--trans-fast);
}

.spec-btn-cancel:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
}

.spec-btn-confirm {
  background: linear-gradient(135deg, #006fb8, #005a96);
  border: 1px solid #2a8fd6;
  color: #fff;
  padding: 0.4rem 1rem;
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  cursor: pointer;
  transition: all var(--trans-fast);
  box-shadow: 0 2px 10px rgba(0, 111, 184, 0.35);
}

.spec-btn-confirm:hover {
  background: #005a96;
  box-shadow: var(--shadow-sm);
}

.spec-btn-confirm:active {
  transform: scale(0.96);
}

.sheet-skill-roll-btn.is-absent-btn {
  opacity: 0.55;
  cursor: not-allowed;
  background: rgba(239, 68, 68, 0.08) !important;
  border-color: rgba(239, 68, 68, 0.25) !important;
  color: #f87171 !important;
}

.sheet-skill-roll-btn.is-absent-btn:hover {
  transform: none !important;
  box-shadow: none !important;
}

.sheet-skill-row.is-absent-row {
  opacity: 0.72;
}

.is-disabled-stepper button:disabled {
  opacity: 0.25;
  cursor: not-allowed;
}
</style>
