<template>
  <div class="dndb-card dndb-skills-card">
    <!-- Card Header -->
    <div class="dndb-card-header">
      <div class="dndb-card-title-wrap">
        <i class="ri-focus-3-line dndb-card-icon"></i>
        <h3 class="dndb-card-title">SKILLS</h3>
      </div>
      <div class="dndb-skills-header-right">
        <div class="skills-budget-pill" :title="`Total points invested in skills: ${heroStore.totalSkillPP} PP (${totalRanksBought} Ranks)`">
          <span class="budget-ranks">{{ totalRanksBought }} Rks</span>
          <span class="budget-divider">•</span>
          <span class="budget-pp">{{ heroStore.totalSkillPP }} PP</span>
        </div>
        <button 
          type="button" 
          class="btn-spec-add" 
          @click="openAddSpecializationModal()"
          title="Add Specialization (Close Combat, Ranged Combat, Expertise)"
        >
          <i class="ri-add-line"></i> Spec
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
            <button type="button" class="spec-modal-close" @click="showSpecModal = false" title="Close">
              <i class="ri-close-line"></i>
            </button>
          </div>

          <div class="spec-modal-body">
            <div class="spec-form-group">
              <label>Skill Base</label>
              <select v-model="selectedBaseSkill" class="spec-select">
                <option v-for="sk in subtypeSkills" :key="sk.name" :value="sk.name">
                  {{ sk.name }} ({{ sk.ability }})
                </option>
              </select>
            </div>

            <div class="spec-form-group">
              <div class="spec-label-row">
                <label>Specialization / Subtype</label>
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
              <span class="spec-chips-title">SUGGESTED SPECIALIZATIONS:</span>
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
                  title="Decrease Rank"
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
                  title="Increase Rank"
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
      <div class="skills-cat-pills">
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
          title="Clear search"
        >
          <i class="ri-close-circle-line"></i>
        </button>
      </div>
    </div>

    <!-- 4-Column Table Header (Zero Truncation Layout) -->
    <div class="sheet-skills-table-header">
      <span class="th-abil">Abil</span>
      <span class="th-name">Skill Name & Formula</span>
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
          <!-- 1. Specialization Skills Group (Close Combat, Ranged Combat, Expertise) -->
          <template v-if="ruleSkill.requiresSubtype">
            <div class="spec-group-container">
              <!-- Specialization Group Header -->
              <div class="spec-group-header">
                <div class="spec-group-left">
                  <span 
                    class="sheet-skill-ab-tag"
                    :class="`ab-${ruleSkill.ability.toLowerCase()}`"
                    :title="`Governed by ${ruleSkill.ability} (${heroStore.effectiveAbilities?.[ruleSkill.ability] || 0})`"
                  >
                    {{ ruleSkill.ability }}
                  </span>
                  <div class="spec-group-title-wrap">
                    <span class="spec-group-name">{{ ruleSkill.name }}</span>
                    <span 
                      v-if="getSubtypeInstances(ruleSkill.name).length > 0"
                      class="spec-count-tag"
                      :title="`${getSubtypeInstances(ruleSkill.name).length} specialization(s) trained`"
                    >
                      {{ getSubtypeInstances(ruleSkill.name).length }}
                    </span>
                    <span
                      v-if="getAdvantageBonusForSkill(ruleSkill.name) > 0"
                      class="spec-adv-chip"
                      :title="`+${getAdvantageBonusForSkill(ruleSkill.name)} from ${getAdvantageNameForSkill(ruleSkill.name)} Advantage`"
                    >
                      +{{ getAdvantageBonusForSkill(ruleSkill.name) }} {{ getAdvantageNameForSkill(ruleSkill.name) }}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  class="btn-spec-inline-add"
                  @click="openInlineSpecModal(ruleSkill.name)"
                  :title="`Add new ${ruleSkill.name} specialization`"
                >
                  <i class="ri-add-line"></i> Add Spec
                </button>
              </div>

              <!-- Specialization Child Rows (If already added) -->
              <div v-if="getSubtypeInstances(ruleSkill.name).length > 0" class="spec-instances-list">
                <div
                  v-for="inst in getSubtypeInstances(ruleSkill.name)"
                  :key="inst.id || (ruleSkill.name + '_' + inst.subtype)"
                  class="sheet-skill-row is-specialization"
                  :class="{ 'is-trained': (Number(inst.ranks ?? inst.rank) || 0) + getEnhancedRanks(ruleSkill.name, inst.subtype) > 0 }"
                  :title="ruleSkill.desc"
                >
                  <!-- Ability Pip connector -->
                  <div class="spec-connector-node">
                    <i class="ri-corner-down-right-line"></i>
                  </div>

                  <!-- Name & Formula Breakdown -->
                  <div class="sheet-skill-info">
                    <div class="sheet-skill-title-row">
                      <span class="spec-subtype-name">{{ inst.subtype || 'General' }}</span>
                      <span class="spec-badge-chip">SPEC</span>
                    </div>
                    <div class="sheet-skill-math">
                      <span>{{ ruleSkill.ability }} {{ heroStore.effectiveAbilities?.[ruleSkill.ability] || 0 }}</span>
                      <span class="math-operator">+</span>
                      <span>Rk {{ inst.ranks || 0 }}</span>
                      <span 
                        v-if="getEnhancedRanks(ruleSkill.name, inst.subtype) > 0" 
                        class="enh-math-tag"
                        :title="`+${getEnhancedRanks(ruleSkill.name, inst.subtype)} from Power`"
                      >
                        +{{ getEnhancedRanks(ruleSkill.name, inst.subtype) }}p
                      </span>
                      <span
                        v-if="getAdvantageBonusForSkill(ruleSkill.name) > 0"
                        class="enh-math-tag adv"
                        :title="`+${getAdvantageBonusForSkill(ruleSkill.name)} from ${getAdvantageNameForSkill(ruleSkill.name)} Advantage`"
                      >
                        +{{ getAdvantageBonusForSkill(ruleSkill.name) }} Adv
                      </span>
                    </div>
                  </div>

                  <!-- Rank Stepper + Delete -->
                  <div class="sheet-skill-stepper-col">
                    <div class="stepper-compact">
                      <button
                        type="button"
                        class="step-btn-xs"
                        :disabled="(inst.ranks || 0) <= 0"
                        @click="stepSpecialization(inst, -1)"
                        title="Decrease Rank"
                      >-</button>
                      <span class="step-val-xs">
                        {{ inst.ranks || 0 }}
                        <span
                          v-if="getEnhancedRanks(ruleSkill.name, inst.subtype) > 0"
                          class="enh-pip-tag"
                          :title="`+${getEnhancedRanks(ruleSkill.name, inst.subtype)} from Power`"
                        >+{{ getEnhancedRanks(ruleSkill.name, inst.subtype) }}p</span>
                      </span>
                      <button
                        type="button"
                        class="step-btn-xs"
                        @click="stepSpecialization(inst, 1)"
                        title="Increase Rank"
                      >+</button>
                    </div>

                    <button
                      type="button"
                      class="btn-delete-spec"
                      @click="deleteSpecialization(inst)"
                      title="Remove Specialization"
                    >
                      <i class="ri-close-line"></i>
                    </button>
                  </div>

                  <!-- Roll Button -->
                  <button
                    type="button"
                    class="sheet-skill-roll-btn"
                    :class="{ 'has-bonus': calculateTotalBonus(ruleSkill.ability, inst.ranks, getEnhancedRanks(ruleSkill.name, inst.subtype), ruleSkill.name) > 0 }"
                    @click="rollSkill(ruleSkill.name + ': ' + (inst.subtype || 'General'), calculateTotalBonus(ruleSkill.ability, inst.ranks, getEnhancedRanks(ruleSkill.name, inst.subtype), ruleSkill.name))"
                    :title="`Roll ${ruleSkill.name} (${inst.subtype}) check`"
                  >
                    <i class="ri-dice-line"></i>
                    <span class="skill-roll-val">
                      {{ formatMod(calculateTotalBonus(ruleSkill.ability, inst.ranks, getEnhancedRanks(ruleSkill.name, inst.subtype), ruleSkill.name)) }}
                    </span>
                  </button>
                </div>
              </div>

              <!-- Specialization Empty State (No instances yet) -->
              <div 
                v-else 
                class="spec-group-empty"
                @click="openInlineSpecModal(ruleSkill.name)"
                title="Click to add specialization"
              >
                <i class="ri-add-circle-line"></i>
                <span v-if="getAdvantageBonusForSkill(ruleSkill.name) > 0">
                  No specializations added. Base check: <strong>{{ formatMod(calculateTotalBonus(ruleSkill.ability, 0, 0, ruleSkill.name)) }}</strong> ({{ ruleSkill.ability }} + {{ getAdvantageBonusForSkill(ruleSkill.name) }} Adv). Click to specialize.
                </span>
                <span v-else>No specializations added yet. Click to specialize.</span>
              </div>
            </div>
          </template>

          <!-- 2. Standard Non-Subtype Skills (Acrobatics, Athletics, Deception, etc.) -->
          <template v-else>
            <div
              class="sheet-skill-row"
              :class="{ 'is-trained': isStandardTrained(ruleSkill.name) }"
              :title="ruleSkill.desc"
            >
              <!-- Ability Tag -->
              <span 
                class="sheet-skill-ab-tag"
                :class="`ab-${ruleSkill.ability.toLowerCase()}`"
                :title="`Governed by ${ruleSkill.ability} (${heroStore.effectiveAbilities?.[ruleSkill.ability] || 0})`"
              >
                {{ ruleSkill.ability }}
              </span>

              <!-- Name & Math Formula Breakdown -->
              <div class="sheet-skill-info">
                <div class="sheet-skill-title-row">
                  <span class="sheet-skill-name">{{ ruleSkill.name }}</span>
                </div>
                <div class="sheet-skill-math">
                  <span>{{ ruleSkill.ability }} {{ heroStore.effectiveAbilities?.[ruleSkill.ability] || 0 }}</span>
                  <span class="math-operator">+</span>
                  <span>Rk {{ getStandardRanks(ruleSkill.name) }}</span>
                  <span 
                    v-if="getEnhancedRanks(ruleSkill.name) > 0" 
                    class="enh-math-tag"
                    :title="`+${getEnhancedRanks(ruleSkill.name)} from Power`"
                  >
                    +{{ getEnhancedRanks(ruleSkill.name) }}p
                  </span>
                </div>
              </div>

              <!-- Rank Stepper Column -->
              <div class="sheet-skill-stepper-col">
                <div class="stepper-compact">
                  <button
                    type="button"
                    class="step-btn-xs"
                    :disabled="getStandardRanks(ruleSkill.name) <= 0"
                    @click="stepStandardSkill(ruleSkill.name, -1)"
                    title="Decrease Rank"
                  >-</button>
                  <span class="step-val-xs">
                    {{ getStandardRanks(ruleSkill.name) }}
                    <span
                      v-if="getEnhancedRanks(ruleSkill.name) > 0"
                      class="enh-pip-tag"
                      :title="`+${getEnhancedRanks(ruleSkill.name)} from Power`"
                    >+{{ getEnhancedRanks(ruleSkill.name) }}p</span>
                  </span>
                  <button
                    type="button"
                    class="step-btn-xs"
                    @click="stepStandardSkill(ruleSkill.name, 1)"
                    title="Increase Rank"
                  >+</button>
                </div>
              </div>

              <!-- Roll Button -->
              <button
                type="button"
                class="sheet-skill-roll-btn"
                :class="{ 'has-bonus': calculateTotalBonus(ruleSkill.ability, getStandardRanks(ruleSkill.name), getEnhancedRanks(ruleSkill.name)) > 0 }"
                @click="rollSkill(ruleSkill.name, calculateTotalBonus(ruleSkill.ability, getStandardRanks(ruleSkill.name), getEnhancedRanks(ruleSkill.name)))"
                :title="`Roll ${ruleSkill.name} check (d20 + ${calculateTotalBonus(ruleSkill.ability, getStandardRanks(ruleSkill.name), getEnhancedRanks(ruleSkill.name))})`"
              >
                <i class="ri-dice-line"></i>
                <span class="skill-roll-val">
                  {{ formatMod(calculateTotalBonus(ruleSkill.ability, getStandardRanks(ruleSkill.name), getEnhancedRanks(ruleSkill.name))) }}
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
import { ref, computed, nextTick } from 'vue';
import { useHeroStore } from '../../stores/heroStore.js';
import { useUiStore } from '../../stores/uiStore.js';
import { SKILLS } from '../../rules/skills.js';

const heroStore = useHeroStore();
const uiStore = useUiStore();

const categories = ['All', 'Trained', 'Combat', 'Physical', 'Mental', 'Interaction'];
const activeCategory = ref('All');
const searchQuery = ref('');

const showSpecModal = ref(false);
const selectedBaseSkill = ref('Close Combat');
const specSubtypeInput = ref('');
const initialRankInput = ref(2);
const specInputRef = ref(null);

const subtypeSkills = computed(() => {
  return SKILLS.filter(s => s.requiresSubtype);
});

const currentSelectedAbility = computed(() => {
  const current = SKILLS.find(s => s.name === selectedBaseSkill.value);
  return current?.ability || 'FGT';
});

const suggestedSubtypes = computed(() => {
  const current = SKILLS.find(s => s.name === selectedBaseSkill.value);
  return current?.commonSubtypes || [];
});

const totalRanksBought = computed(() => {
  return (heroStore.character?.skills || []).reduce((sum, s) => {
    return sum + (parseInt(s.ranks ?? s.rank ?? 0, 10) || 0);
  }, 0);
});

const trainedSkillsCount = computed(() => {
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

const filteredRuleSkills = computed(() => {
  const added = heroStore.character?.skills || [];
  const q = searchQuery.value.toLowerCase().trim();

  return SKILLS.filter(s => {
    // 1. Category Filter
    if (activeCategory.value === 'Trained') {
      if (s.requiresSubtype) {
        const hasTrainedSpec = getSubtypeInstances(s.name).some(inst => 
          (inst.ranks || 0) > 0 || getEnhancedRanks(s.name, inst.subtype) > 0
        );
        if (!hasTrainedSpec) return false;
      } else {
        if (!isStandardTrained(s.name)) return false;
      }
    } else if (activeCategory.value !== 'All') {
      if ((s.category || '').toLowerCase() !== activeCategory.value.toLowerCase()) {
        return false;
      }
    }

    // 2. Search Query Match
    if (!q) return true;
    if (s.name.toLowerCase().includes(q)) return true;
    if (s.ability.toLowerCase().includes(q)) return true;
    if (s.desc && s.desc.toLowerCase().includes(q)) return true;

    // Subtype matching
    if (s.requiresSubtype) {
      const matchingInstance = added.some(inst =>
        inst.name.toLowerCase() === s.name.toLowerCase() &&
        inst.subtype &&
        inst.subtype.toLowerCase().includes(q)
      );
      if (matchingInstance) return true;
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

function deleteSpecialization(inst) {
  const skills = heroStore.character?.skills || [];
  const idx = skills.findIndex(s => s === inst || (s.name === inst.name && (s.subtype || '') === (inst.subtype || '')));
  if (idx !== -1) {
    heroStore.removeSkill(idx);
    uiStore.showToast(`Removed ${inst.name} (${inst.subtype})`, 'info');
  }
}

function openAddSpecializationModal() {
  selectedBaseSkill.value = 'Close Combat';
  specSubtypeInput.value = '';
  initialRankInput.value = 2;
  showSpecModal.value = true;
  nextTick(() => {
    specInputRef.value?.focus();
  });
}

function openInlineSpecModal(skillName) {
  selectedBaseSkill.value = skillName;
  specSubtypeInput.value = '';
  initialRankInput.value = 2;
  showSpecModal.value = true;
  nextTick(() => {
    specInputRef.value?.focus();
  });
}

function getPlaceholderForSkill(skillName) {
  if (skillName === 'Close Combat') return 'e.g. Unarmed, Swords, Knives, Claws...';
  if (skillName === 'Ranged Combat') return 'e.g. Firearms, Bows, Energy Blast, Thrown...';
  if (skillName === 'Expertise') return 'e.g. Science, Technology, Magic, Criminology...';
  return 'Specialization name...';
}

function confirmAddSpecialization() {
  const sub = specSubtypeInput.value.trim();
  if (!sub) {
    uiStore.showToast('Please enter a specialization name (e.g. Unarmed, Swords)', 'error');
    return;
  }
  heroStore.setSkillRank(selectedBaseSkill.value, sub, initialRankInput.value);
  uiStore.showToast(`Added ${selectedBaseSkill.value}: ${sub} (+${initialRankInput.value} ranks)`, 'success');
  specSubtypeInput.value = '';
  showSpecModal.value = false;
}

function rollSkill(skillTitle, bonus) {
  heroStore.rollCheck(skillTitle, bonus, null, 'Skill');
}
</script>

<style scoped>
/* Card Header Custom Elements */
.dndb-skills-header-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.skills-budget-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.2rem 0.55rem;
  border-radius: var(--radius-pill);
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--text-secondary);
  font-variant-numeric: tabular-nums;
}

.budget-ranks {
  color: #94a3b8;
}

.budget-divider {
  color: rgba(255, 255, 255, 0.2);
}

.budget-pp {
  color: #ef4444;
  font-weight: 800;
}

.btn-spec-add {
  background: linear-gradient(135deg, rgba(220, 38, 38, 0.2), rgba(185, 28, 28, 0.3));
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #fca5a5;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.22rem 0.6rem;
  border-radius: var(--radius-sm);
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
  transition: all var(--trans-fast);
}

.btn-spec-add:hover {
  background: #dc2626;
  border-color: #ef4444;
  color: #fff;
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.4);
}

.btn-spec-add:active {
  transform: scale(0.96);
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
  background: rgba(220, 38, 38, 0.25);
  border-color: #ef4444;
  color: #fff;
  box-shadow: 0 1px 6px rgba(220, 38, 38, 0.3);
}

.cat-pill-count {
  background: #ef4444;
  color: #fff;
  font-size: 0.6rem;
  font-weight: 800;
  padding: 0.05rem 0.3rem;
  border-radius: 9999px;
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
  border-color: #ef4444;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.15);
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

.skills-search-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.clear-search-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  font-size: 0.9rem;
}

.clear-search-btn:hover {
  color: #fff;
}

/* 4-Column Table Header */
.sheet-skills-table-header {
  display: grid;
  grid-template-columns: 36px 1fr 66px 48px;
  align-items: center;
  gap: 0.45rem;
  padding: 0.3rem 0.55rem;
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
  padding-right: 2px;
  scrollbar-width: thin;
  scrollbar-color: rgba(220, 38, 38, 0.4) rgba(15, 15, 20, 0.45);
}

/* Skill Rows (Zero Truncation Grid) */
.sheet-skill-row {
  display: grid;
  grid-template-columns: 36px 1fr 66px 48px;
  align-items: center;
  gap: 0.45rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-left: 3px solid transparent;
  border-radius: var(--radius-sm);
  padding: 0.35rem 0.55rem;
  transition: background-color var(--trans-fast), border-color var(--trans-fast);
}

.sheet-skill-row:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.12);
}

.sheet-skill-row.is-trained {
  background: rgba(16, 185, 129, 0.03);
  border-left-color: #10b981;
}

.sheet-skill-row.is-specialization {
  background: rgba(192, 132, 252, 0.03);
  border-left-color: #c084fc;
}

/* Ability Badges & Color Coding */
.sheet-skill-ab-tag {
  font-size: 0.64rem;
  font-weight: 800;
  padding: 0.12rem 0;
  border-radius: 3px;
  text-align: center;
  text-transform: uppercase;
  font-family: var(--font-mono, monospace);
  display: block;
  width: 100%;
  letter-spacing: 0.02em;
}

/* Ability Color Variations */
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
  background: rgba(168, 85, 247, 0.15);
  border: 1px solid rgba(168, 85, 247, 0.35);
  color: #c084fc;
}

.ab-sta {
  background: rgba(244, 63, 94, 0.15);
  border: 1px solid rgba(244, 63, 94, 0.35);
  color: #fb7185;
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
  gap: 0.35rem;
  overflow: hidden;
}

.sheet-skill-name {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}

.sheet-skill-row.is-trained .sheet-skill-name {
  color: #fff;
}

.sheet-skill-math {
  font-size: 0.66rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 0.2rem;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.math-operator {
  opacity: 0.5;
}

.enh-math-tag {
  color: #38bdf8;
  font-weight: 700;
}

.enh-math-tag.adv {
  color: #fbbf24;
}

.spec-adv-chip {
  font-size: 0.62rem;
  font-weight: 800;
  color: #fbbf24;
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.35);
  padding: 0.08rem 0.38rem;
  border-radius: 3px;
  letter-spacing: 0.02em;
}

/* Stepper Column */
.sheet-skill-stepper-col {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
}

.stepper-compact {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  padding: 1px 3px;
}

.step-btn-xs {
  width: 19px;
  height: 19px;
  font-size: 0.72rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: var(--text-secondary);
  border-radius: 3px;
  cursor: pointer;
  transition: all var(--trans-fast);
}

.step-btn-xs:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.step-btn-xs:active:not(:disabled) {
  transform: scale(0.92);
}

.step-btn-xs:disabled {
  opacity: 0.25;
  cursor: not-allowed;
}

.step-val-xs {
  font-size: 0.74rem;
  font-weight: 800;
  min-width: 16px;
  text-align: center;
  color: #e2e8f0;
  font-variant-numeric: tabular-nums;
}

.enh-pip-tag {
  font-size: 0.6rem;
  color: #38bdf8;
}

/* Roll Button */
.sheet-skill-roll-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 4px;
  color: var(--text-secondary);
  padding: 0.22rem 0.35rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  cursor: pointer;
  transition: all var(--trans-fast);
  font-variant-numeric: tabular-nums;
  width: 100%;
  box-sizing: border-box;
}

.sheet-skill-roll-btn:hover {
  background: #dc2626;
  border-color: #ef4444;
  color: #fff;
  box-shadow: 0 0 10px rgba(220, 38, 38, 0.4);
}

.sheet-skill-roll-btn:active {
  transform: scale(0.95);
}

.sheet-skill-roll-btn.has-bonus {
  background: rgba(220, 38, 38, 0.12);
  border-color: rgba(239, 68, 68, 0.3);
  color: #fff;
}

.sheet-skill-roll-btn i {
  font-size: 0.75rem;
}

.skill-roll-val {
  font-size: 0.78rem;
  font-weight: 900;
}

/* Specialization Grouping */
.spec-group-container {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  background: rgba(20, 20, 30, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: var(--radius-sm);
  padding: 0.35rem;
}

.spec-group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.15rem 0.25rem;
}

.spec-group-left {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.spec-group-left .sheet-skill-ab-tag {
  width: 36px;
}

.spec-group-title-wrap {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.spec-group-name {
  font-size: 0.8rem;
  font-weight: 800;
  color: #fff;
  letter-spacing: 0.02em;
}

.spec-count-tag {
  background: rgba(192, 132, 252, 0.2);
  border: 1px solid rgba(192, 132, 252, 0.4);
  color: #c084fc;
  font-size: 0.62rem;
  font-weight: 800;
  padding: 0.05rem 0.35rem;
  border-radius: 9999px;
  line-height: 1;
}

.btn-spec-inline-add {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: var(--text-secondary);
  font-size: 0.66rem;
  font-weight: 700;
  padding: 0.15rem 0.45rem;
  border-radius: 3px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  transition: all var(--trans-fast);
}

.btn-spec-inline-add:hover {
  background: rgba(220, 38, 38, 0.2);
  border-color: #ef4444;
  color: #fff;
}

.btn-spec-inline-add:active {
  transform: scale(0.95);
}

.spec-instances-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding-left: 0.5rem;
}

.spec-connector-node {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c084fc;
  font-size: 0.85rem;
  opacity: 0.8;
}

.spec-subtype-name {
  font-size: 0.8rem;
  font-weight: 800;
  color: #e2e8f0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.spec-badge-chip {
  background: rgba(192, 132, 252, 0.15);
  border: 1px solid rgba(192, 132, 252, 0.3);
  color: #c084fc;
  font-size: 0.55rem;
  font-weight: 800;
  padding: 0.05rem 0.25rem;
  border-radius: 2px;
  letter-spacing: 0.04em;
  flex-shrink: 0;
}

.btn-delete-spec {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 0.85rem;
  padding: 0.1rem;
  display: flex;
  align-items: center;
  transition: color var(--trans-fast);
}

.btn-delete-spec:hover {
  color: #ef4444;
}

.spec-group-empty {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.6rem;
  background: rgba(255, 255, 255, 0.015);
  border: 1px dashed rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: var(--text-muted);
  font-size: 0.72rem;
  cursor: pointer;
  transition: all var(--trans-fast);
  margin-top: 0.15rem;
}

.spec-group-empty:hover {
  background: rgba(220, 38, 38, 0.06);
  border-color: rgba(239, 68, 68, 0.3);
  color: #fca5a5;
}

.spec-group-empty i {
  font-size: 0.85rem;
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

/* Modal Redesign */
.spec-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.spec-modal-card {
  background: #12121a;
  border: 1px solid rgba(220, 38, 38, 0.35);
  border-radius: var(--radius-lg);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
  width: 100%;
  max-width: 460px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
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
  background: rgba(220, 38, 38, 0.08);
  border-bottom: 1px solid rgba(220, 38, 38, 0.2);
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
  color: #ef4444;
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
  color: #ef4444;
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
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
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
  background: rgba(220, 38, 38, 0.15);
  border-color: rgba(239, 68, 68, 0.4);
  color: #fff;
}

.spec-chip-btn.active {
  background: #dc2626;
  border-color: #ef4444;
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
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
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
  background: rgba(220, 38, 38, 0.2);
  border-color: #ef4444;
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
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  border: 1px solid #ef4444;
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
  box-shadow: 0 2px 10px rgba(220, 38, 38, 0.35);
}

.spec-btn-confirm:hover {
  background: #ef4444;
  box-shadow: 0 4px 14px rgba(220, 38, 38, 0.5);
}

.spec-btn-confirm:active {
  transform: scale(0.96);
}
</style>
