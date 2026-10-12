<template>
      <div  class="config-body config-affliction">
      <div class="affliction-modifiers-strip">
        <span class="strip-label">
          <i class="ri-equalizer-line"></i> Affliction Modifiers & Mechanics:
        </span>
        <div class="strip-chips-row">
          <div class="mod-chip-group">
            <button
              type="button"
              class="mod-toggle-chip"
              :class="{ active: extraConditionRanks > 0 }"
              @click="toggleAfflictionModifier('Extra Condition', false)"
              title="Add extra condition per degree (+1 PP/rank per rank)"
            >
              <i class="ri-add-circle-line"></i>
              <span>Extra Condition</span>
              <span v-if="extraConditionRanks > 0" class="chip-rank-badge">Rk {{ extraConditionRanks }}</span>
            </button>
            <div v-if="extraConditionRanks > 0" class="chip-step-controls">
              <button
                type="button"
                class="step-btn"
                :disabled="extraConditionRanks <= 1"
                @click.stop="stepModifierRanks('Extra Condition', false, -1)"
              >-</button>
              <button
                type="button"
                class="step-btn"
                :disabled="extraConditionRanks >= 2"
                @click.stop="stepModifierRanks('Extra Condition', false, 1)"
              >+</button>
            </div>
          </div>
          <div class="mod-chip-group">
            <button
              type="button"
              class="mod-toggle-chip flaw"
              :class="{ active: limitedDegreeRanks > 0 }"
              @click="toggleAfflictionModifier('Limited Degree', true)"
              title="Limit max degrees of failure (-1 PP/rank per rank)"
            >
              <i class="ri-indeterminate-circle-line"></i>
              <span>Limited Degree</span>
              <span v-if="limitedDegreeRanks > 0" class="chip-rank-badge flaw">Rk {{ limitedDegreeRanks }}</span>
            </button>
            <div v-if="limitedDegreeRanks > 0" class="chip-step-controls">
              <button
                type="button"
                class="step-btn"
                :disabled="limitedDegreeRanks <= 1"
                @click.stop="stepModifierRanks('Limited Degree', true, -1)"
              >-</button>
              <button
                type="button"
                class="step-btn"
                :disabled="limitedDegreeRanks >= 2"
                @click.stop="stepModifierRanks('Limited Degree', true, 1)"
              >+</button>
            </div>
          </div>
          <button
            type="button"
            class="mod-toggle-chip"
            :class="{ active: isCumulative }"
            @click="toggleAfflictionModifier('Cumulative', false)"
            title="Degrees accumulate over successive failed checks (+1 PP/rank)"
          >
            <i class="ri-stack-line"></i>
            <span>Cumulative</span>
          </button>
          <button
            type="button"
            class="mod-toggle-chip"
            :class="{ active: isProgressive }"
            @click="toggleAfflictionModifier('Progressive', false)"
            title="Condition escalates round-by-round until resisted (+2 PP/rank)"
          >
            <i class="ri-flashlight-fill"></i>
            <span>Progressive</span>
          </button>
          <button
            type="button"
            class="mod-toggle-chip"
            :class="{ active: Boolean(altResistanceMod) }"
            @click="toggleAfflictionModifier('Alternate Resistance', false)"
            title="Resisted by Dodge, Parry, Toughness, or Will (+0 or +1 PP/rank)"
          >
            <i class="ri-shield-flash-line"></i>
            <span>Alternate Res.</span>
          </button>
          <button
            type="button"
            class="mod-toggle-chip flaw"
            :class="{ active: hasInstantRecovery }"
            @click="toggleAfflictionModifier('Instant Recovery', true)"
            title="Target instantly recovers when effect ceases (-1 PP/rank)"
          >
            <i class="ri-speed-line"></i>
            <span>Instant Recovery</span>
          </button>
        </div>
      </div>
      <div v-if="progressionBadge" class="affliction-progression-ribbon" :class="progressionBadge.type">
        <div class="progression-ribbon-left">
          <i :class="progressionBadge.icon"></i>
          <div class="progression-text-col">
            <span class="progression-title">{{ progressionBadge.label }}</span>
            <span class="progression-desc">{{ progressionBadge.desc }}</span>
          </div>
        </div>
        <div class="progression-track-stepper">
          <div class="step-pill" :class="{ disabled: !isDegree1Active }">
            <span class="pill-deg">1st</span>
            <span class="pill-name">{{ getDegreeSummary(1) }}</span>
          </div>
          <i class="ri-arrow-right-line step-arrow"></i>
          <div class="step-pill" :class="{ disabled: !isDegree2Active }">
            <span class="pill-deg">2nd</span>
            <span class="pill-name">{{ isDegree2Active ? getDegreeSummary(2) : 'Eliminated' }}</span>
          </div>
          <i class="ri-arrow-right-line step-arrow"></i>
          <div class="step-pill" :class="{ disabled: !isDegree3Active }">
            <span class="pill-deg">3rd</span>
            <span class="pill-name">{{ isDegree3Active ? getDegreeSummary(3) : 'Eliminated' }}</span>
          </div>
        </div>
      </div>
      <div class="affliction-presets-section">
        <span class="section-label">
          <i class="ri-bookmark-line"></i> Quick Affliction Presets:
        </span>
        <div class="presets-chips-row">
          <button
            v-for="preset in cfg.presets"
            :key="preset.id"
            type="button"
            class="preset-chip-btn"
            :class="{ active: isPresetActive(preset) }"
            @click="applyAfflictionPreset(preset)"
          >
            <span class="preset-name">{{ preset.name }}</span>
            <span class="preset-res">Resisted by {{ preset.res }}</span>
          </button>
        </div>
      </div>
      <div class="degrees-grid" :class="{ 'has-multi-conditions': conditionsPerDegree > 1 }">
        <div class="degree-box deg-box-1" :class="{ 'eliminated-box': !isDegree1Active }">
          <div class="degree-header deg-1">
            <div class="deg-title-group">
              <span class="degree-num">1st Degree</span>
              <span class="degree-sub">Failure by 1-5</span>
            </div>
            <span v-if="conditionsPerDegree > 1" class="multi-cond-badge">
              {{ conditionsPerDegree }} Conditions
            </span>
          </div>

          <div class="degree-conditions-container">
            <div class="condition-slot">
              <label v-if="conditionsPerDegree > 1" class="cond-slot-label">Condition 1:</label>
              <select
                :value="getDegreeCondition('first', 0)"
                class="degree-select select-input"
                @change="onConditionSelect('first', 0, $event.target.value)"
              >
                <option v-for="cond in cfg.firstDegree" :key="cond" :value="cond">
                  {{ cond }}
                </option>
              </select>
            </div>
            <div v-if="conditionsPerDegree >= 2" class="condition-slot">
              <label class="cond-slot-label">Condition 2 (+Extra):</label>
              <select
                :value="getDegreeCondition('first', 1)"
                class="degree-select select-input slot-secondary"
                @change="onConditionSelect('first', 1, $event.target.value)"
              >
                <option v-for="cond in cfg.firstDegree" :key="cond" :value="cond">
                  {{ cond }}
                </option>
              </select>
            </div>
            <div v-if="conditionsPerDegree >= 3" class="condition-slot">
              <label class="cond-slot-label">Condition 3 (+Extra Rk 2):</label>
              <select
                :value="getDegreeCondition('first', 2)"
                class="degree-select select-input slot-tertiary"
                @change="onConditionSelect('first', 2, $event.target.value)"
              >
                <option v-for="cond in cfg.firstDegree" :key="cond" :value="cond">
                  {{ cond }}
                </option>
              </select>
            </div>
          </div>
          <span class="degree-note">Mild impairing condition</span>
        </div>
        <div class="degree-box deg-box-2" :class="{ 'eliminated-box': !isDegree2Active }">
          <div class="degree-header deg-2">
            <div class="deg-title-group">
              <span class="degree-num">2nd Degree</span>
              <span class="degree-sub">Failure by 6-10</span>
            </div>
            <span v-if="!isDegree2Active" class="eliminated-badge">
              <i class="ri-lock-line"></i> Eliminated
            </span>
            <span v-else-if="conditionsPerDegree > 1" class="multi-cond-badge">
              {{ conditionsPerDegree }} Conditions
            </span>
          </div>
          <div v-if="isDegree2Active" class="degree-conditions-container">
            <div class="condition-slot">
              <label v-if="conditionsPerDegree > 1" class="cond-slot-label">Condition 1:</label>
              <select
                :value="getDegreeCondition('second', 0)"
                class="degree-select select-input"
                @change="onConditionSelect('second', 0, $event.target.value)"
              >
                <option v-for="cond in cfg.secondDegree" :key="cond" :value="cond">
                  {{ cond }}
                </option>
              </select>
            </div>
            <div v-if="conditionsPerDegree >= 2" class="condition-slot">
              <label class="cond-slot-label">Condition 2 (+Extra):</label>
              <select
                :value="getDegreeCondition('second', 1)"
                class="degree-select select-input slot-secondary"
                @change="onConditionSelect('second', 1, $event.target.value)"
              >
                <option v-for="cond in cfg.secondDegree" :key="cond" :value="cond">
                  {{ cond }}
                </option>
              </select>
            </div>
            <div v-if="conditionsPerDegree >= 3" class="condition-slot">
              <label class="cond-slot-label">Condition 3 (+Extra Rk 2):</label>
              <select
                :value="getDegreeCondition('second', 2)"
                class="degree-select select-input slot-tertiary"
                @change="onConditionSelect('second', 2, $event.target.value)"
              >
                <option v-for="cond in cfg.secondDegree" :key="cond" :value="cond">
                  {{ cond }}
                </option>
              </select>
            </div>
            <span class="degree-note">Significant debilitating condition</span>
          </div>
          <div v-else class="eliminated-lock-card">
            <i class="ri-forbid-2-line lock-icon"></i>
            <span class="eliminated-title">Eliminated by Limited Degree (Rank 2)</span>
            <p class="eliminated-desc">Target only suffers first-degree conditions; second and third degrees cannot be achieved.</p>
          </div>
        </div>
        <div class="degree-box deg-box-3" :class="{ 'eliminated-box': !isDegree3Active }">
          <div class="degree-header deg-3">
            <div class="deg-title-group">
              <span class="degree-num">3rd Degree</span>
              <span class="degree-sub">Failure by 11+</span>
            </div>
            <span v-if="!isDegree3Active" class="eliminated-badge">
              <i class="ri-lock-line"></i> Eliminated
            </span>
            <span v-else-if="conditionsPerDegree > 1" class="multi-cond-badge">
              {{ conditionsPerDegree }} Conditions
            </span>
          </div>
          <div v-if="isDegree3Active" class="degree-conditions-container">
            <div class="condition-slot">
              <label v-if="conditionsPerDegree > 1" class="cond-slot-label">Condition 1:</label>
              <select
                :value="getDegreeCondition('third', 0)"
                class="degree-select select-input"
                @change="onConditionSelect('third', 0, $event.target.value)"
              >
                <option v-for="cond in cfg.thirdDegree" :key="cond" :value="cond">
                  {{ cond }}
                </option>
              </select>
            </div>
            <div v-if="conditionsPerDegree >= 2" class="condition-slot">
              <label class="cond-slot-label">Condition 2 (+Extra):</label>
              <select
                :value="getDegreeCondition('third', 1)"
                class="degree-select select-input slot-secondary"
                @change="onConditionSelect('third', 1, $event.target.value)"
              >
                <option v-for="cond in cfg.thirdDegree" :key="cond" :value="cond">
                  {{ cond }}
                </option>
              </select>
            </div>
            <div v-if="conditionsPerDegree >= 3" class="condition-slot">
              <label class="cond-slot-label">Condition 3 (+Extra Rk 2):</label>
              <select
                :value="getDegreeCondition('third', 2)"
                class="degree-select select-input slot-tertiary"
                @change="onConditionSelect('third', 2, $event.target.value)"
              >
                <option v-for="cond in cfg.thirdDegree" :key="cond" :value="cond">
                  {{ cond }}
                </option>
              </select>
            </div>
            <span class="degree-note">Total incapacitating condition</span>
          </div>
          <div v-else class="eliminated-lock-card">
            <i class="ri-forbid-2-line lock-icon"></i>
            <span class="eliminated-title">Eliminated by Limited Degree (Rank {{ limitedDegreeRanks }})</span>
            <p class="eliminated-desc">Third-degree conditions (Incapacitated, Paralyzed, etc.) can never be achieved.</p>
          </div>
        </div>
      </div>
      <div class="resistance-defense-row">
        <div class="res-label-wrap">
          <label class="res-label">
            <i class="ri-shield-line"></i> Resistance Defense Check:
          </label>
          <span v-if="altResistanceMod" class="alt-res-badge">
            <i class="ri-shield-cross-line"></i> Alternate Resistance Active
          </span>
        </div>
        <div class="res-toggle-group">
          <button
            v-for="resOpt in afflictionResistanceOptions"
            :key="resOpt"
            type="button"
            class="res-btn"
            :class="['res-' + resOpt.toLowerCase(), { active: (effect.config?.resistance || effect.resistance) === resOpt }]"
            @click="selectAfflictionResistance(resOpt)"
          >
            <i :class="getDefenseIcon(resOpt)"></i>
            <span>{{ resOpt }}</span>
          </button>
        </div>
        <span class="res-help-text">
          Target makes a <strong>{{ effect.config?.resistance || effect.resistance || 'Fortitude' }}</strong> resistance check vs <strong>DC {{ 10 + (Number(effect.ranks) || 1) }}</strong> (DC 10 + Effect Rank).
        </span>
      </div>
      <div v-if="hasInstantRecovery" class="mechanic-callout-box instant-recovery-callout">
        <i class="ri-speed-line callout-icon"></i>
        <div class="callout-content">
          <span class="callout-title">Instant Recovery Flaw Active</span>
          <span class="callout-desc">Target recovers immediately from all conditions the moment the effect stops being applied (no lingering recovery checks needed).</span>
        </div>
      </div>
    </div>

</template>

<script setup>
import { computed } from 'vue';
import { EXTRAS, FLAWS, normalizeModifier } from '../../../rules/powerEngine.js';

const props = defineProps({
  effect: { type: Object, required: true },
  cfg: { type: Object, required: true }
});
const cfg = computed(() => props.cfg);
const emit = defineEmits(['update']);

function updateConfig() {
  emit('update');
}


const extraConditionMod = computed(() =>
  (props.effect?.extras || []).find(e => e.name === 'Extra Condition')
);
const extraConditionRanks = computed(() =>
  extraConditionMod.value ? (Number(extraConditionMod.value.ranks) || 1) : 0
);
const conditionsPerDegree = computed(() => 1 + extraConditionRanks.value);

const limitedDegreeMod = computed(() =>
  (props.effect?.flaws || []).find(f => f.name === 'Limited Degree')
);
const limitedDegreeRanks = computed(() =>
  limitedDegreeMod.value ? (Number(limitedDegreeMod.value.ranks) || 1) : 0
);

const isDegree1Active = computed(() => true);
const isDegree2Active = computed(() => limitedDegreeRanks.value < 2);
const isDegree3Active = computed(() => limitedDegreeRanks.value < 1);

const altResistanceMod = computed(() =>
  (props.effect?.extras || []).find(e => e.name === 'Alternate Resistance') ||
  (props.effect?.flaws || []).find(f => f.name === 'Alternate Resistance')
);
const afflictionResistanceOptions = computed(() => {
  if (altResistanceMod.value) {
    return ['Fortitude', 'Will', 'Dodge', 'Parry', 'Toughness'];
  }
  return cfg.value?.resistanceOptions || ['Fortitude', 'Will'];
});

const isProgressive = computed(() =>
  (props.effect?.extras || []).some(e => e.name === 'Progressive')
);
const isCumulative = computed(() =>
  (props.effect?.extras || []).some(e => e.name === 'Cumulative')
);
const progressionBadge = computed(() => {
  if (isProgressive.value) {
    return {
      label: 'Progressive Auto-Escalation Track',
      desc: 'Target must make a recurring resistance check each round; failure advances condition to the next degree.',
      icon: 'ri-flashlight-fill',
      type: 'progressive'
    };
  }
  if (isCumulative.value) {
    return {
      label: 'Cumulative Stacking Track',
      desc: 'Subsequent failed checks accumulate degrees of failure towards higher degree conditions.',
      icon: 'ri-stack-line',
      type: 'cumulative'
    };
  }
  return null;
});

const hasInstantRecovery = computed(() =>
  (props.effect?.flaws || []).some(f => f.name === 'Instant Recovery')
);

function getDefenseIcon(resOpt) {
  switch (resOpt) {
    case 'Fortitude': return 'ri-shield-cross-line';
    case 'Will': return 'ri-mental-health-line';
    case 'Dodge': return 'ri-run-line';
    case 'Parry': return 'ri-sword-line';
    case 'Toughness': return 'ri-shield-flash-line';
    default: return 'ri-shield-line';
  }
}

function getDegreeCondition(degreeKey, slotIndex) {
  const c = props.effect?.config;
  if (!c) return '';
  const keyArr = `${degreeKey}Conditions`;
  if (Array.isArray(c[keyArr]) && c[keyArr][slotIndex]) {
    return c[keyArr][slotIndex];
  }
  if (degreeKey === 'first') {
    const defs = ['Dazed', 'Vulnerable', 'Hindered'];
    return defs[slotIndex] || 'Dazed';
  }
  if (degreeKey === 'second') {
    const defs = ['Stunned', 'Defenseless', 'Immobile'];
    return defs[slotIndex] || 'Stunned';
  }
  if (degreeKey === 'third') {
    const defs = ['Paralyzed', 'Incapacitated', 'Controlled'];
    return defs[slotIndex] || 'Paralyzed';
  }
  return '';
}

function onConditionSelect(degreeKey, slotIndex, val) {
  props.effect.config = props.effect.config || {};
  const keyArr = `${degreeKey}Conditions`;
  const keyStr = `${degreeKey}Degree`;
  
  let currentArr = Array.isArray(props.effect.config[keyArr])
    ? [...props.effect.config[keyArr]]
    : [getDegreeCondition(degreeKey, 0), getDegreeCondition(degreeKey, 1), getDegreeCondition(degreeKey, 2)];

  currentArr[slotIndex] = val;
  props.effect.config[keyArr] = currentArr;
  props.effect.config[keyStr] = currentArr.slice(0, conditionsPerDegree.value).filter(Boolean).join(' & ');
  updateConfig();
}

function getDegreeSummary(degreeNum) {
  const c = props.effect?.config;
  if (!c) return '';
  if (degreeNum === 1) return c.firstDegree || 'Dazed';
  if (degreeNum === 2) return c.secondDegree || 'Stunned';
  if (degreeNum === 3) return c.thirdDegree || 'Paralyzed';
  return '';
}

function isPresetActive(preset) {
  const c = props.effect?.config;
  if (!c) return false;
  return getDegreeCondition('first', 0) === preset.first &&
    getDegreeCondition('second', 0) === preset.second &&
    getDegreeCondition('third', 0) === preset.third &&
    (c.resistance || props.effect.resistance) === preset.res;
}

function applyAfflictionPreset(preset) {
  props.effect.config = props.effect.config || {};
  props.effect.config.preset = preset.id;

  const p1 = preset.first || 'Dazed';
  const p2 = preset.second || 'Stunned';
  const p3 = preset.third || 'Paralyzed';

  const secPairs = {
    'Dazed': 'Vulnerable',
    'Fatigued': 'Hindered',
    'Hindered': 'Vulnerable',
    'Impaired': 'Vulnerable',
    'Vulnerable': 'Dazed',
    'Entranced': 'Vulnerable',
    'Stunned': 'Defenseless',
    'Exhausted': 'Immobile',
    'Compelled': 'Defenseless',
    'Immobile': 'Defenseless',
    'Disabled': 'Defenseless',
    'Paralyzed': 'Incapacitated',
    'Asleep': 'Unaware',
    'Controlled': 'Defenseless',
    'Incapacitated': 'Paralyzed'
  };

  const s1 = secPairs[p1] || (cfg.value?.firstDegree?.find(x => x !== p1) || 'Vulnerable');
  const s2 = secPairs[p2] || (cfg.value?.secondDegree?.find(x => x !== p2) || 'Defenseless');
  const s3 = secPairs[p3] || (cfg.value?.thirdDegree?.find(x => x !== p3) || 'Incapacitated');

  const t1 = cfg.value?.firstDegree?.find(x => x !== p1 && x !== s1) || 'Hindered';
  const t2 = cfg.value?.secondDegree?.find(x => x !== p2 && x !== s2) || 'Disabled';
  const t3 = cfg.value?.thirdDegree?.find(x => x !== p3 && x !== s3) || 'Blind';

  props.effect.config.firstConditions = [p1, s1, t1];
  props.effect.config.secondConditions = [p2, s2, t2];
  props.effect.config.thirdConditions = [p3, s3, t3];

  props.effect.config.firstDegree = props.effect.config.firstConditions.slice(0, conditionsPerDegree.value).join(' & ');
  props.effect.config.secondDegree = props.effect.config.secondConditions.slice(0, conditionsPerDegree.value).join(' & ');
  props.effect.config.thirdDegree = props.effect.config.thirdConditions.slice(0, conditionsPerDegree.value).join(' & ');

  props.effect.config.resistance = preset.res;
  props.effect.resistance = preset.res;
  updateConfig();
}

function selectAfflictionResistance(resOpt) {
  props.effect.config = props.effect.config || {};
  props.effect.config.resistance = resOpt;
  props.effect.resistance = resOpt;
  updateConfig();
}

function toggleAfflictionModifier(modName, isFlaw = false) {
  if (!props.effect) return;
  const list = isFlaw
    ? (props.effect.flaws = Array.isArray(props.effect.flaws) ? props.effect.flaws : [])
    : (props.effect.extras = Array.isArray(props.effect.extras) ? props.effect.extras : []);
  
  const idx = list.findIndex(m => m.name === modName);
  if (idx !== -1) {
    list.splice(idx, 1);
    if (modName === 'Extra Condition' && props.effect.config) {
      if (props.effect.config.firstConditions?.[0]) props.effect.config.firstDegree = props.effect.config.firstConditions[0];
      if (props.effect.config.secondConditions?.[0]) props.effect.config.secondDegree = props.effect.config.secondConditions[0];
      if (props.effect.config.thirdConditions?.[0]) props.effect.config.thirdDegree = props.effect.config.thirdConditions[0];
    }
  } else {
    const source = isFlaw ? FLAWS : EXTRAS;
    const found = source.find(m => m.name === modName) || { name: modName, cost: isFlaw ? -1 : 1, type: 'per_rank' };
    list.push(normalizeModifier({
      name: found.name,
      cost: found.cost,
      type: found.type,
      ranks: 1,
      hasRanks: found.hasRanks,
      maxRanks: found.maxRanks,
      desc: found.desc,
      category: found.category,
      options: found.options
    }));
    if (modName === 'Extra Condition' && props.effect.config) {
      const p1 = getDegreeCondition('first', 0);
      const s1 = getDegreeCondition('first', 1);
      props.effect.config.firstDegree = `${p1} & ${s1}`;

      const p2 = getDegreeCondition('second', 0);
      const s2 = getDegreeCondition('second', 1);
      props.effect.config.secondDegree = `${p2} & ${s2}`;

      const p3 = getDegreeCondition('third', 0);
      const s3 = getDegreeCondition('third', 1);
      props.effect.config.thirdDegree = `${p3} & ${s3}`;
    }
  }
  updateConfig();
}

function stepModifierRanks(modName, isFlaw = false, delta = 1) {
  if (!props.effect) return;
  const list = isFlaw ? props.effect.flaws : props.effect.extras;
  if (!Array.isArray(list)) return;
  const mod = list.find(m => m.name === modName);
  if (mod) {
    const current = Number(mod.ranks) || 1;
    const next = Math.max(1, Math.min(2, current + delta));
    mod.ranks = next;
    if (modName === 'Extra Condition' && props.effect.config) {
      const perDeg = 1 + next;
      if (props.effect.config.firstConditions) {
        props.effect.config.firstDegree = props.effect.config.firstConditions.slice(0, perDeg).join(' & ');
      }
      if (props.effect.config.secondConditions) {
        props.effect.config.secondDegree = props.effect.config.secondConditions.slice(0, perDeg).join(' & ');
      }
      if (props.effect.config.thirdConditions) {
        props.effect.config.thirdDegree = props.effect.config.thirdConditions.slice(0, perDeg).join(' & ');
      }
    }
    updateConfig();
  }
}

</script>
