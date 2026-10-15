import { ref, computed, nextTick } from 'vue';
import {
  SKILLS,
  SKILL_CATEGORIES,
  getSubtypeInstances as getInstances,
  getStandardRanks as getBaseRanks,
  getEnhancedRanks as getEnhRanks,
  isStandardTrained as checkStandardTrained,
  isSpecializationTrained,
  getAdvantageNameForSkill,
  getAdvantageBonusForSkill as getAdvBonus,
  calculateTotalSkillBonus,
  formatMod,
  getPlaceholderForSkill,
  isSignatureSkill,
  getTrainedSkillsCount,
  filterRuleSkills
} from '../rules/skills.js';

/**
 * Shared composable providing unified reactive state, calculations, and actions
 * for Skills across the Wizard (StepSkills) and Character Sheet (SkillsTable).
 */
export function useSkillsWorkflow(heroStore, uiStore, options = {}) {
  const includeCircumstance = options.includeCircumstance ?? false;

  const categories = SKILL_CATEGORIES;
  const activeCategory = ref('All');
  const searchQuery = ref('');

  // Specialization dialog state
  const showSpecialtyDialog = ref(false);
  const specialtyType = ref('Close Combat');
  const specialtyFocus = ref('');
  const initialRankInput = ref(2);
  const focusInputRef = ref(null);

  // Aliases for SkillsTable backward-compatibility
  const showSpecModal = showSpecialtyDialog;
  const selectedBaseSkill = specialtyType;
  const specSubtypeInput = specialtyFocus;
  const specInputRef = focusInputRef;

  const subtypeSkills = computed(() => {
    return SKILLS.filter(s => s.requiresSubtype);
  });

  const currentSelectedAbility = computed(() => {
    const current = SKILLS.find(s => s.name === specialtyType.value);
    return current?.ability || 'FGT';
  });

  const suggestedSubtypes = computed(() => {
    const current = SKILLS.find(s => s.name === specialtyType.value);
    return current?.commonSubtypes || [];
  });

  const totalRanks = computed(() => {
    return (heroStore.character?.skills || []).reduce((sum, s) => {
      return sum + (parseInt(s.ranks ?? s.rank ?? 0, 10) || 0);
    }, 0);
  });
  const totalRanksBought = totalRanks;

  const trainedCount = computed(() => {
    const skills = heroStore.character?.skills || [];
    const enh = heroStore.activeEnhancedTraits?.skills || {};
    return getTrainedSkillsCount(skills, enh);
  });
  const trainedSkillsCount = trainedCount;

  const filteredSkills = computed(() => {
    const skills = heroStore.character?.skills || [];
    const enh = heroStore.activeEnhancedTraits?.skills || {};
    return filterRuleSkills(skills, enh, activeCategory.value, searchQuery.value);
  });
  const filteredRuleSkills = filteredSkills;

  function getSubtypeInstances(skillName) {
    return getInstances(heroStore.character?.skills || [], skillName);
  }

  function getStandardRanks(skillName) {
    return getBaseRanks(heroStore.character?.skills || [], skillName);
  }

  function getEnhancedRanks(skillName, subtype = '') {
    return getEnhRanks(heroStore.activeEnhancedTraits?.skills || {}, skillName, subtype);
  }

  function isStandardTrained(skillName) {
    return checkStandardTrained(heroStore.character?.skills || [], heroStore.activeEnhancedTraits?.skills || {}, skillName);
  }

  function getAdvantageBonusForSkill(skillName) {
    return getAdvBonus(skillName, heroStore);
  }

  function calculateTotalBonus(abilityKey, ranks, enhRanks = 0, skillName = '') {
    return calculateTotalSkillBonus({
      abilityKey,
      ranks,
      enhRanks,
      skillName,
      heroStore,
      includeCircumstance
    });
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
  const deleteSpecialization = removeSpecialtySkill;

  function openAddSpecialtyDialog(skillName = 'Close Combat') {
    specialtyType.value = skillName;
    specialtyFocus.value = '';
    initialRankInput.value = 2;
    showSpecialtyDialog.value = true;
    nextTick(() => {
      focusInputRef.value?.focus();
    });
  }
  const openAddSpecializationModal = () => openAddSpecialtyDialog('Close Combat');
  const openInlineSpecModal = (skillName) => openAddSpecialtyDialog(skillName);

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
  const confirmAddSpecialization = confirmSpecialtySkill;

  function rollSkill(skillTitle, bonus, baseSkill = null) {
    const isCloseCombat = (baseSkill === 'Close Combat') || skillTitle.toLowerCase().includes('close combat');
    if (isCloseCombat && heroStore.conditionModifiers?.cannotCloseAttack) {
      uiStore.showToast('Cannot make close attacks while Fighting is Debilitated', 'error');
      return;
    }
    const circ = heroStore.circumstancePenalty || 0;
    const extra = circ !== 0 ? {
      conditionPenalty: circ,
      conditionNote: heroStore.conditionModifiers?.isDisabled ? 'Disabled (-5)' : 'Impaired (-2)'
    } : {};
    heroStore.rollCheck(skillTitle, bonus, null, 'Skill', extra);
  }

  return {
    categories,
    activeCategory,
    searchQuery,
    showSpecialtyDialog,
    specialtyType,
    specialtyFocus,
    initialRankInput,
    focusInputRef,
    showSpecModal,
    selectedBaseSkill,
    specSubtypeInput,
    specInputRef,
    subtypeSkills,
    currentSelectedAbility,
    suggestedSubtypes,
    totalRanks,
    totalRanksBought,
    trainedCount,
    trainedSkillsCount,
    filteredSkills,
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
    removeSpecialtySkill,
    deleteSpecialization,
    openAddSpecialtyDialog,
    openAddSpecializationModal,
    openInlineSpecModal,
    getPlaceholderForSkill,
    confirmSpecialtySkill,
    confirmAddSpecialization,
    isSignatureSkill,
    rollSkill
  };
}
