import { ref, computed, provide, inject } from 'vue';

export const AVAILABLE_CUSTOM_ICONS = [
  'ri-eye-line', 'ri-eye-fill', 'ri-scan-line', 'ri-radar-line',
  'ri-shield-star-line', 'ri-shield-flash-line', 'ri-shield-check-line',
  'ri-fire-fill', 'ri-snowflake-line', 'ri-temp-cold-line',
  'ri-pulse-line', 'ri-brain-line', 'ri-earth-line',
  'ri-flashlight-line', 'ri-speed-line', 'ri-footprint-line',
  'ri-broadcast-line', 'ri-cpu-line', 'ri-settings-4-line', 'ri-drop-line',
  'ri-route-line', 'ri-planet-line', 'ri-rocket-line', 'ri-ghost-line',
  'ri-atom-line', 'ri-history-line', 'ri-umbrella-line', 'ri-walk-line',
  'ri-boxing-line', 'ri-drag-move-2-line'
];

/**
 * Composable for child effect configurators (Senses, Movement, Immunity, etc.)
 * to interact with the parent custom sub-effect / target modal with zero boilerplate.
 */
export function useCustomSubModal(emit, props = null) {
  const customSubModal = inject('customSubModal', null);

  function updateConfig() {
    emit?.('update');
  }

  function openCustomSubModal(type) {
    if (customSubModal?.open) {
      customSubModal.open(type);
    } else {
      emit?.('open-custom', type);
    }
  }

  function editCustomSubItem(item) {
    customSubModal?.edit?.(item);
  }

  function deleteCustomSubItem(itemId) {
    customSubModal?.delete?.(itemId);
  }

  function isCustomTrait(traitName) {
    return customSubModal?.isTrait
      ? customSubModal.isTrait(traitName)
      : (props?.effect?.config?.customItems || []).some(c => c.name === traitName || c.id === traitName);
  }

  function editCustomTrait(traitName) {
    customSubModal?.editTrait?.(traitName);
  }

  function deleteCustomTrait(traitName) {
    customSubModal?.deleteTrait?.(traitName);
  }

  return {
    customSubModal,
    updateConfig,
    openCustomSubModal,
    editCustomSubItem,
    deleteCustomSubItem,
    isCustomTrait,
    editCustomTrait,
    deleteCustomTrait
  };
}

/**
 * Host coordinator composable for EffectConfigurator.vue.
 * Manages modal visibility, form state, icon picker, validation, and child injection.
 */
export function useCustomSubModalHost(props, cfg, updateConfig) {
  const showCustomSubModal = ref(false);
  const customSubModalTargetEffect = ref('Senses');
  const editingCustomId = ref(null);

  const customForm = ref({
    id: null,
    name: '',
    category: '',
    pts: 1,
    desc: '',
    icon: 'ri-flashlight-line',
    appliedTraits: []
  });

  const customCategoryOptions = computed(() => {
    const base = customSubModalTargetEffect.value;
    if (base === 'Senses') {
      return [
        { id: 'visual', label: 'Visual' },
        { id: 'auditory', label: 'Auditory' },
        { id: 'mental', label: 'Mental & Exotic' },
        { id: 'tactile', label: 'Tactile & Olfactory' },
        { id: 'spatial', label: 'Spatial & Utility' }
      ];
    }
    if (base === 'Immunity') {
      return [
        { id: 'survival', label: 'Survival & Env' },
        { id: 'biological', label: 'Biological & Sensory' },
        { id: 'descriptors', label: 'Descriptors' },
        { id: 'defenses', label: 'Defense Checks' }
      ];
    }
    if (base === 'Concealment') {
      return [
        { id: 'visual', label: 'Visual' },
        { id: 'auditory', label: 'Auditory' },
        { id: 'olfactory', label: 'Olfactory' },
        { id: 'radio', label: 'Radio' },
        { id: 'mental_exotic', label: 'Mental & Exotic' }
      ];
    }
    if (base === 'Enhanced Trait') {
      return [
        { id: 'abilities', label: 'Abilities' },
        { id: 'defenses', label: 'Defenses' },
        { id: 'skills', label: 'Skills' },
        { id: 'advantages', label: 'Advantages' }
      ];
    }
    return [];
  });

  const getCustomNamePlaceholder = computed(() => {
    const base = customSubModalTargetEffect.value;
    switch (base) {
      case 'Senses': return 'e.g. Cosmic Energy Sight, Leyline Tracker...';
      case 'Immunity': return 'e.g. Alien Radiation, Chrono-Displacement...';
      case 'Movement': return 'e.g. Gravity Inversion, Shadow Stride...';
      case 'Comprehend': return 'e.g. Alien Dialects, Quantum Frequencies...';
      case 'Environment': return 'e.g. Temporal Distortion, Corrosive Atmosphere...';
      case 'Concealment': return 'e.g. Quantum Obscurement, Astral Stealth...';
      case 'Enhanced Trait': return 'e.g. Hyper-Intuition, Alien Reflexes...';
      default: return 'Enter custom name...';
    }
  });

  const getCustomCostLabel = computed(() => {
    const base = customSubModalTargetEffect.value;
    if (base === 'Environment') return 'Base Cost (PP/Rank)';
    if (base === 'Enhanced Trait') return 'Cost (PP/Rank)';
    return 'Ranks / Cost';
  });

  const getCustomCostUnit = computed(() => {
    const base = customSubModalTargetEffect.value;
    if (base === 'Environment' || base === 'Enhanced Trait') return 'PP/R';
    return 'Ranks';
  });

  function openCustomSubModal(baseEffectName) {
    customSubModalTargetEffect.value = baseEffectName || props.effect?.baseEffect || 'Senses';
    editingCustomId.value = null;

    const defaultCat = customCategoryOptions.value[0]?.id || '';
    const defaultIcon = customSubModalTargetEffect.value === 'Senses' ? 'ri-eye-line'
      : customSubModalTargetEffect.value === 'Immunity' ? 'ri-shield-line'
      : customSubModalTargetEffect.value === 'Movement' ? 'ri-footprint-line'
      : customSubModalTargetEffect.value === 'Environment' ? 'ri-earth-line'
      : customSubModalTargetEffect.value === 'Enhanced Trait' ? 'ri-award-line'
      : 'ri-flashlight-line';

    let defaultPts = 1;
    if (customSubModalTargetEffect.value === 'Enhanced Trait') {
      const cat = props.effect?.config?.traitCategory || 'abilities';
      defaultPts = cat === 'defenses' ? 1 : (cat === 'advantages' ? 1 : (cat === 'skills' ? 0.5 : 2));
    }

    customForm.value = {
      id: null,
      name: '',
      category: defaultCat,
      pts: defaultPts,
      desc: '',
      icon: defaultIcon,
      appliedTraits: []
    };

    showCustomSubModal.value = true;
  }

  function editCustomSubItem(item) {
    customSubModalTargetEffect.value = props.effect?.baseEffect || 'Senses';
    editingCustomId.value = item.id;
    customForm.value = {
      id: item.id,
      name: item.name,
      category: item.category || '',
      pts: item.pts || item.ranks || item.cost || 1,
      desc: item.desc || '',
      icon: item.icon || 'ri-flashlight-line',
      appliedTraits: Array.isArray(item.appliedTraits) ? [...item.appliedTraits] : []
    };
    showCustomSubModal.value = true;
  }

  function closeCustomSubModal() {
    showCustomSubModal.value = false;
    editingCustomId.value = null;
  }

  function saveCustomSubItem() {
    if (!customForm.value.name.trim() || !props.effect) return;
    props.effect.config = props.effect.config || {};
    if (!Array.isArray(props.effect.config.customItems)) {
      props.effect.config.customItems = [];
    }

    const itemId = editingCustomId.value || ('custom_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4));
    const ptsVal = Number(customForm.value.pts) || 1;

    const customObj = {
      id: itemId,
      name: customForm.value.name.trim(),
      pts: ptsVal,
      ranks: ptsVal,
      cost: ptsVal,
      category: customForm.value.category,
      desc: customForm.value.desc ? customForm.value.desc.trim() : `Custom ${customSubModalTargetEffect.value} trait`,
      icon: customForm.value.icon || 'ri-flashlight-line',
      isCustom: true,
      appliedTraits: [...customForm.value.appliedTraits]
    };

    const existingIdx = props.effect.config.customItems.findIndex(c => c.id === itemId);
    if (existingIdx !== -1) {
      props.effect.config.customItems[existingIdx] = customObj;
    } else {
      props.effect.config.customItems.push(customObj);
    }

    // Auto-select newly created custom item into active list
    const base = props.effect.baseEffect;
    if (base === 'Senses') {
      if (!Array.isArray(props.effect.config.selectedFaculties)) props.effect.config.selectedFaculties = [];
      if (!props.effect.config.selectedFaculties.includes(itemId)) {
        props.effect.config.selectedFaculties.push(itemId);
      }
    } else if (base === 'Immunity') {
      if (!Array.isArray(props.effect.config.selectedPresets)) props.effect.config.selectedPresets = [];
      if (!props.effect.config.selectedPresets.includes(itemId)) {
        props.effect.config.selectedPresets.push(itemId);
      }
    } else if (base === 'Movement') {
      if (!Array.isArray(props.effect.config.selectedModes)) props.effect.config.selectedModes = [];
      if (!props.effect.config.selectedModes.some(m => (typeof m === 'object' ? m.id === itemId : m === itemId))) {
        props.effect.config.selectedModes.push({ id: itemId, name: customObj.name, ranks: customObj.ranks });
      }
    } else if (base === 'Comprehend') {
      if (!Array.isArray(props.effect.config.selectedModes)) props.effect.config.selectedModes = [];
      if (!props.effect.config.selectedModes.includes(itemId)) {
        props.effect.config.selectedModes.push(itemId);
      }
    } else if (base === 'Environment') {
      if (!Array.isArray(props.effect.config.selectedElements)) props.effect.config.selectedElements = [];
      if (!props.effect.config.selectedElements.includes(itemId)) {
        props.effect.config.selectedElements.push(itemId);
      }
    } else if (base === 'Concealment') {
      if (!Array.isArray(props.effect.config.selectedSenses)) props.effect.config.selectedSenses = [];
      if (!props.effect.config.selectedSenses.includes(itemId)) {
        props.effect.config.selectedSenses.push(itemId);
      }
    } else if (base === 'Enhanced Trait') {
      if (!Array.isArray(props.effect.config.selectedTraits)) props.effect.config.selectedTraits = [];
      if (!props.effect.config.selectedTraits.includes(customObj.name)) {
        props.effect.config.selectedTraits.push(customObj.name);
      }
      props.effect.config.traitName = customObj.name;
    }

    updateConfig();
    closeCustomSubModal();
  }

  function deleteCustomSubItem(itemId) {
    if (!props.effect?.config?.customItems) return;
    props.effect.config.customItems = props.effect.config.customItems.filter(c => c.id !== itemId);

    const base = props.effect.baseEffect;
    if (base === 'Senses' && Array.isArray(props.effect.config.selectedFaculties)) {
      props.effect.config.selectedFaculties = props.effect.config.selectedFaculties.filter(id => id !== itemId);
      if (props.effect.config.selectedFaculties.length === 0 && cfg.value?.defaultFaculties) {
        props.effect.config.selectedFaculties = [...cfg.value.defaultFaculties];
      }
    } else if (base === 'Immunity' && Array.isArray(props.effect.config.selectedPresets)) {
      props.effect.config.selectedPresets = props.effect.config.selectedPresets.filter(id => id !== itemId);
      if (props.effect.config.selectedPresets.length === 0 && cfg.value?.defaultPresets) {
        props.effect.config.selectedPresets = [...cfg.value.defaultPresets];
      }
    } else if (base === 'Movement' && Array.isArray(props.effect.config.selectedModes)) {
      props.effect.config.selectedModes = props.effect.config.selectedModes.filter(m => (typeof m === 'object' ? m.id !== itemId : m !== itemId));
      if (props.effect.config.selectedModes.length === 0 && cfg.value?.defaultModes) {
        props.effect.config.selectedModes = [{ id: 'wall_crawling', name: 'Wall-crawling', ranks: 1 }];
      }
    } else if (base === 'Comprehend' && Array.isArray(props.effect.config.selectedModes)) {
      props.effect.config.selectedModes = props.effect.config.selectedModes.filter(id => id !== itemId);
      if (props.effect.config.selectedModes.length === 0 && cfg.value?.defaultModes) {
        props.effect.config.selectedModes = [...cfg.value.defaultModes];
      }
    } else if (base === 'Environment' && Array.isArray(props.effect.config.selectedElements)) {
      props.effect.config.selectedElements = props.effect.config.selectedElements.filter(id => id !== itemId);
      if (props.effect.config.selectedElements.length === 0 && cfg.value?.defaultElements) {
        props.effect.config.selectedElements = [...cfg.value.defaultElements];
      }
    } else if (base === 'Concealment' && Array.isArray(props.effect.config.selectedSenses)) {
      props.effect.config.selectedSenses = props.effect.config.selectedSenses.filter(id => id !== itemId);
      if (props.effect.config.selectedSenses.length === 0 && cfg.value?.defaultSenses) {
        props.effect.config.selectedSenses = [...cfg.value.defaultSenses];
      }
    }

    updateConfig();
  }

  function isCustomTrait(traitName) {
    return (props.effect?.config?.customItems || []).some(c => c.name === traitName || c.id === traitName);
  }

  function editCustomTrait(traitName) {
    const item = (props.effect?.config?.customItems || []).find(c => c.name === traitName || c.id === traitName);
    if (item) {
      editCustomSubItem(item);
    }
  }

  function deleteCustomTrait(traitName) {
    const item = (props.effect?.config?.customItems || []).find(c => c.name === traitName || c.id === traitName);
    if (item) {
      props.effect.config.customItems = props.effect.config.customItems.filter(c => c.id !== item.id);
    }
    if (Array.isArray(props.effect?.config?.selectedTraits)) {
      props.effect.config.selectedTraits = props.effect.config.selectedTraits.filter(t => t !== traitName);
      if (props.effect.config.selectedTraits.length === 0) {
        const defaultT = cfg.value?.categories?.[props.effect?.config?.traitCategory || 'abilities']?.traits?.[0] || 'Strength';
        props.effect.config.selectedTraits = [defaultT];
        props.effect.config.traitName = defaultT;
      }
    }
    updateConfig();
  }

  // Provide custom item actions to child configurators
  provide('customSubModal', {
    open: openCustomSubModal,
    edit: editCustomSubItem,
    delete: deleteCustomSubItem,
    isTrait: isCustomTrait,
    editTrait: editCustomTrait,
    deleteTrait: deleteCustomTrait
  });

  return {
    showCustomSubModal,
    customSubModalTargetEffect,
    editingCustomId,
    customForm,
    AVAILABLE_CUSTOM_ICONS,
    customCategoryOptions,
    getCustomNamePlaceholder,
    getCustomCostLabel,
    getCustomCostUnit,
    openCustomSubModal,
    editCustomSubItem,
    closeCustomSubModal,
    saveCustomSubItem,
    deleteCustomSubItem,
    isCustomTrait,
    editCustomTrait,
    deleteCustomTrait
  };
}
