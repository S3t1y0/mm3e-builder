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
            <div class="spec-group-container" :class="{ 'has-specs': getSubtypeInstances(ruleSkill.name).length > 0 }">
              <!-- Specialization Category Header / Hub Row -->
              <div class="spec-parent-row">
                <span 
                  class="sheet-skill-ab-tag"
                  :class="`ab-${ruleSkill.ability.toLowerCase()}`"
                  :title="`Governed by ${ruleSkill.ability} (${heroStore.effectiveAbilities?.[ruleSkill.ability] || 0})`"
                >
                  {{ ruleSkill.ability }}
                </span>

                <div class="sheet-skill-info spec-parent-info">
                  <div class="sheet-skill-title-row">
                    <span class="spec-parent-name">{{ ruleSkill.name }}</span>
                    <span 
                      v-if="getSubtypeInstances(ruleSkill.name).length > 0"
                      class="spec-count-tag"
                      :title="`${getSubtypeInstances(ruleSkill.name).length} specialization(s) active`"
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
                  <div class="sheet-skill-math">
                    <span v-if="getSubtypeInstances(ruleSkill.name).length === 0" class="math-base-quiet">
                      Requires specialization (e.g. {{ ruleSkill.name === 'Close Combat' ? 'Unarmed, Swords' : (ruleSkill.name === 'Ranged Combat' ? 'Firearms, Bows' : 'Science, Magic') }})
                    </span>
                    <span v-else class="math-base-quiet">
                      {{ getSubtypeInstances(ruleSkill.name).length }} specialization{{ getSubtypeInstances(ruleSkill.name).length > 1 ? 's' : '' }} • Base {{ ruleSkill.ability }} {{ heroStore.effectiveAbilities?.[ruleSkill.ability] || 0 }}
                    </span>
                  </div>
                </div>

                <!-- Action: Quick Add Specialization -->
                <div class="spec-parent-actions">
                  <button
                    type="button"
                    class="btn-spec-inline-add"
                    @click="openInlineSpecModal(ruleSkill.name)"
                    :title="`Add new ${ruleSkill.name} specialization`"
                  >
                    <i class="ri-add-line"></i> Spec
                  </button>
                </div>
              </div>

              <!-- Specialization Child Rows (Zero-Truncation Sub-List) -->
              <div v-if="getSubtypeInstances(ruleSkill.name).length > 0" class="spec-instances-list">
                <div
                  v-for="inst in getSubtypeInstances(ruleSkill.name)"
                  :key="inst.id || (ruleSkill.name + '_' + inst.subtype)"
                  class="sheet-skill-row is-specialization"
                  :class="{ 
                    'is-trained': (Number(inst.ranks ?? inst.rank) || 0) + getEnhancedRanks(ruleSkill.name, inst.subtype) > 0,
                    'is-signature': isSignatureSkill(calculateTotalBonus(ruleSkill.ability, inst.ranks, getEnhancedRanks(ruleSkill.name, inst.subtype), ruleSkill.name), inst.ranks)
                  }"
                  :title="ruleSkill.desc"
                >
                  <!-- Minimal Tree Marker -->
                  <div class="spec-tree-marker" aria-hidden="true">
                    <i class="ri-corner-down-right-line"></i>
                  </div>

                  <!-- Name & Formula Breakdown (Zero Truncation) -->
                  <div class="sheet-skill-info spec-child-info">
                    <div class="sheet-skill-title-row">
                      <span class="spec-subtype-name" :title="inst.subtype || 'General'">{{ inst.subtype || 'General' }}</span>
                    </div>
                    <div class="sheet-skill-math">
                      <span>{{ ruleSkill.ability }} {{ heroStore.effectiveAbilities?.[ruleSkill.ability] || 0 }}</span>
                      <span class="math-operator">+</span>
                      <span class="math-rk">{{ inst.ranks || 0 }} Rk</span>
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
                    <div class="stepper-compact has-ranks">
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

                  <!-- Child Roll Button -->
                  <button
                    type="button"
                    class="sheet-skill-roll-btn"
                    :class="{ 
                      'btn-trained': (Number(inst.ranks ?? inst.rank) || 0) + getEnhancedRanks(ruleSkill.name, inst.subtype) > 0,
                      'btn-signature': isSignatureSkill(calculateTotalBonus(ruleSkill.ability, inst.ranks, getEnhancedRanks(ruleSkill.name, inst.subtype), ruleSkill.name), inst.ranks)
                    }"
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
            </div>
          </template>

          <!-- 2. Standard Non-Subtype Skills (Acrobatics, Athletics, Deception, etc.) -->
          <template v-else>
            <div
              class="sheet-skill-row"
              :class="{ 
                'is-trained': isStandardTrained(ruleSkill.name),
                'is-signature': isSignatureSkill(calculateTotalBonus(ruleSkill.ability, getStandardRanks(ruleSkill.name), getEnhancedRanks(ruleSkill.name)), getStandardRanks(ruleSkill.name)) && isStandardTrained(ruleSkill.name)
              }"
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
                  <template v-if="getStandardRanks(ruleSkill.name) > 0 || getEnhancedRanks(ruleSkill.name) > 0">
                    <span>{{ ruleSkill.ability }} {{ heroStore.effectiveAbilities?.[ruleSkill.ability] || 0 }}</span>
                    <span class="math-operator">+</span>
                    <span class="math-rk">{{ getStandardRanks(ruleSkill.name) }} Rk</span>
                    <span 
                      v-if="getEnhancedRanks(ruleSkill.name) > 0" 
                      class="enh-math-tag"
                      :title="`+${getEnhancedRanks(ruleSkill.name)} from Power`"
                    >
                      +{{ getEnhancedRanks(ruleSkill.name) }}p
                    </span>
                  </template>
                  <template v-else>
                    <span class="math-base-quiet">Base {{ ruleSkill.ability }} {{ heroStore.effectiveAbilities?.[ruleSkill.ability] || 0 }}</span>
                  </template>
                </div>
              </div>

              <!-- Rank Stepper Column -->
              <div class="sheet-skill-stepper-col">
                <div class="stepper-compact" :class="{ 'has-ranks': getStandardRanks(ruleSkill.name) > 0 }">
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

              <!-- Roll Button (Trained vs Untrained visual hierarchy) -->
              <button
                type="button"
                class="sheet-skill-roll-btn"
                :class="{ 
                  'btn-trained': isStandardTrained(ruleSkill.name),
                  'btn-signature': isSignatureSkill(calculateTotalBonus(ruleSkill.ability, getStandardRanks(ruleSkill.name), getEnhancedRanks(ruleSkill.name)), getStandardRanks(ruleSkill.name)) && isStandardTrained(ruleSkill.name)
                }"
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

function isSignatureSkill(bonus, ranks) {
  return (Number(ranks) || 0) >= 5 || (Number(bonus) || 0) >= 10;
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
  grid-template-columns: 32px minmax(0, 1fr) auto 60px;
  align-items: center;
  gap: 0.5rem;
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
  overscroll-behavior: auto;
  padding-right: 2px;
  scrollbar-width: thin;
  scrollbar-color: rgba(220, 38, 38, 0.4) rgba(15, 15, 20, 0.45);
}

/* Skill Rows (Zero Truncation Grid) */
.sheet-skill-row {
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr) auto 60px;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-left: 2.5px solid transparent;
  border-radius: var(--radius-sm);
  padding: 0.32rem 0.55rem;
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
  background: rgba(220, 38, 38, 0.04);
  border-left-color: var(--accent-primary);
}

.sheet-skill-row.is-specialization {
  background: rgba(56, 189, 248, 0.025);
  border-left-color: #38bdf8;
  border-radius: var(--radius-xs);
  padding: 0.26rem 0.45rem;
}

.sheet-skill-row.is-specialization:hover {
  background: rgba(56, 189, 248, 0.06);
  border-color: rgba(56, 189, 248, 0.25);
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
}

.sheet-skill-row.is-trained .sheet-skill-name {
  color: #fff;
  font-weight: 800;
}

.sig-badge {
  font-size: 0.54rem;
  font-weight: 800;
  color: #fca5a5;
  background: rgba(220, 38, 38, 0.2);
  border: 1px solid rgba(220, 38, 38, 0.4);
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

.step-btn-xs {
  width: 18px;
  height: 18px;
  font-size: 0.72rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-secondary);
  border-radius: 2px;
  cursor: pointer;
  transition: all var(--trans-fast);
}

.step-btn-xs:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
}

.step-btn-xs:active:not(:disabled) {
  transform: scale(0.92);
}

.step-btn-xs:disabled {
  opacity: 0.2;
  cursor: not-allowed;
}

.step-val-xs {
  font-size: 0.74rem;
  font-weight: 700;
  min-width: 15px;
  text-align: center;
  color: var(--text-muted);
  font-family: var(--font-mono, monospace);
  font-variant-numeric: tabular-nums;
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
  background: rgba(220, 38, 38, 0.15);
  border-color: rgba(239, 68, 68, 0.45);
  color: #fca5a5;
  font-weight: 800;
}

.sheet-skill-roll-btn.btn-signature:hover {
  background: #dc2626;
  border-color: #ef4444;
  color: #fff;
  box-shadow: var(--shadow-sm);
}

/* Specialization Grouping (Dashboard Hardening) */
.spec-group-container {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  background: rgba(15, 23, 42, 0.35);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 0.35rem;
  transition: border-color var(--trans-fast);
}

.spec-group-container.has-specs {
  border-color: rgba(56, 189, 248, 0.25);
}

.spec-parent-row {
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.5rem;
  padding: 0.2rem 0.3rem;
}

.spec-parent-info {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
}

.spec-parent-name {
  font-size: 0.82rem;
  font-weight: 800;
  color: #fff;
  letter-spacing: 0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.spec-count-tag {
  background: rgba(56, 189, 248, 0.15);
  border: 1px solid rgba(56, 189, 248, 0.35);
  color: #38bdf8;
  font-size: 0.6rem;
  font-weight: 800;
  padding: 0.05rem 0.3rem;
  border-radius: 9999px;
  line-height: 1;
  flex-shrink: 0;
}

.spec-parent-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
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

.spec-instances-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding-left: 0.35rem;
  margin-top: 0.15rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 0.35rem;
}

.spec-tree-marker {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #38bdf8;
  font-size: 0.85rem;
  opacity: 0.75;
}

/* Zero Truncation Subtype Name */
.spec-child-info {
  min-width: 0;
}

.spec-subtype-name {
  font-size: 0.82rem;
  font-weight: 800;
  color: #e2e8f0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.25;
}

.sheet-skill-row.is-trained .spec-subtype-name {
  color: #fff;
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
  border: 1px solid rgba(220, 38, 38, 0.35);
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
  box-shadow: var(--shadow-sm);
}

.spec-btn-confirm:active {
  transform: scale(0.96);
}
</style>
