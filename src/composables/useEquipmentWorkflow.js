import { ref, computed } from 'vue';
import { RESOURCE_PRESETS } from '../rules/resources.js';
import {
  isWeapon,
  isShield,
  isArmor,
  getShieldBonus,
  getWeaponAttackBonus as calcWeaponAttackBonus,
  getWeaponDC as calcWeaponDC,
  getWeaponResistance,
  getWeaponRange,
  getArmorProtection,
  getResIconClass,
  getSubtypeLabel,
  formatEquipmentStatus,
  getItemCategoryKey,
  getEquipmentCategoryCount,
  filterEquipmentResources,
  filterEquipmentPresets
} from '../rules/equipmentCalculator.js';

/**
 * Shared composable providing unified reactive state and actions
 * for Equipment workflow across the Wizard and Character Sheet.
 */
export function useEquipmentWorkflow(heroStore, uiStore) {
  const activeFilter = ref('all');
  const showPresetModal = ref(false);
  const showCustomStudio = ref(false);
  const customStudioCategory = ref('Weapons');
  const presetSearch = ref('');

  const budgetInfo = computed(() => {
    return heroStore.getEquipmentBudgetInfo();
  });

  function openCustomStudio(cat = 'Weapons') {
    customStudioCategory.value = cat;
    showCustomStudio.value = true;
    showPresetModal.value = false;
  }

  function getCategoryCount(catId) {
    return getEquipmentCategoryCount(heroStore.character?.resources || [], catId);
  }

  const filteredResources = computed(() => {
    return filterEquipmentResources(heroStore.character?.resources || [], activeFilter.value);
  });

  const filteredPresets = computed(() => {
    return filterEquipmentPresets(RESOURCE_PRESETS, presetSearch.value);
  });

  function syncEquipmentAdvantage() {
    heroStore.syncEquipmentAdvantage();
    uiStore.showToast('Synchronized Equipment Advantage PP budget!', 'success');
  }

  function toggleStatus(id) {
    heroStore.toggleResourceStatus(id);
  }

  function formatStatus(status) {
    return formatEquipmentStatus(status);
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

  function getWeaponAttackBonus(item) {
    return calcWeaponAttackBonus(item, heroStore);
  }

  function getWeaponDC(item) {
    return calcWeaponDC(item, heroStore);
  }

  return {
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
    getWeaponAttackBonus,
    getWeaponDC,
    getWeaponResistance,
    getWeaponRange,
    getShieldBonus,
    getArmorProtection,
    getResIconClass,
    getSubtypeLabel,
    getItemCategoryKey,
    isWeapon,
    isShield,
    isArmor
  };
}
