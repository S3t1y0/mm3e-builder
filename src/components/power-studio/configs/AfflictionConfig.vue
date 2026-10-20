<template>
  <div class="config-body config-affliction">
    <!-- Level 1: Quick Presets Bar (Pills Ramping) -->
    <div class="affliction-presets-section">
      <div class="presets-header-row">
        <span class="section-label">
          <i class="ri-bookmark-3-line"></i> Quick Affliction Presets:
        </span>
      </div>
      <div class="presets-chips-row">
        <button
          v-for="preset in cfg.presets"
          :key="preset.id"
          type="button"
          class="preset-chip-btn"
          :class="['res-accent-' + (preset.res || 'fortitude').toLowerCase(), { active: isPresetActive(preset) }]"
          @click="applyAfflictionPreset(preset)"
        >
          <span class="preset-defense-dot"></span>
          <span class="preset-name">{{ preset.name }}</span>
          <span class="preset-res">{{ preset.res }}</span>
        </button>
      </div>
    </div>

    <!-- Level 2: Modifiers & Mechanics Strip (Segmented Rank Counters) -->
    <div class="affliction-modifiers-strip">
      <div class="strip-header-row">
        <span class="strip-label">
          <i class="ri-equalizer-line"></i> Affliction Modifiers & Mechanics:
        </span>
      </div>
      <div class="strip-chips-row">
        <!-- Segmented Extra Condition -->
        <div class="segmented-mod-group" :class="{ active: extraConditionRanks > 0 }">
          <span class="seg-label">
            <i class="ri-add-circle-line"></i> Extra Cond
          </span>
          <div class="segmented-rank-control">
            <button
              type="button"
              class="seg-btn"
              :class="{ active: extraConditionRanks === 0 }"
              @click="setModifierRank('Extra Condition', false, 0)"
            >0</button>
            <button
              type="button"
              class="seg-btn"
              :class="{ active: extraConditionRanks === 1 }"
              @click="setModifierRank('Extra Condition', false, 1)"
            >1</button>
            <button
              type="button"
              class="seg-btn"
              :class="{ active: extraConditionRanks === 2 }"
              @click="setModifierRank('Extra Condition', false, 2)"
            >2</button>
          </div>
        </div>

        <!-- Segmented Limited Degree -->
        <div class="segmented-mod-group flaw" :class="{ active: limitedDegreeRanks > 0 }">
          <span class="seg-label">
            <i class="ri-indeterminate-circle-line"></i> Limited Deg
          </span>
          <div class="segmented-rank-control flaw">
            <button
              type="button"
              class="seg-btn"
              :class="{ active: limitedDegreeRanks === 0 }"
              @click="setModifierRank('Limited Degree', true, 0)"
            >0</button>
            <button
              type="button"
              class="seg-btn"
              :class="{ active: limitedDegreeRanks === 1 }"
              @click="setModifierRank('Limited Degree', true, 1)"
            >1</button>
            <button
              type="button"
              class="seg-btn"
              :class="{ active: limitedDegreeRanks === 2 }"
              @click="setModifierRank('Limited Degree', true, 2)"
            >2</button>
          </div>
        </div>

        <!-- Toggle Chips -->
        <button
          type="button"
          class="mod-toggle-chip"
          :class="{ active: isCumulative }"
          @click="toggleAfflictionModifier('Cumulative', false)"
        >
          <i class="ri-stack-line"></i>
          <span>Cumulative</span>
        </button>

        <button
          type="button"
          class="mod-toggle-chip"
          :class="{ active: isProgressive }"
          @click="toggleAfflictionModifier('Progressive', false)"
        >
          <i class="ri-history-line"></i>
          <span>Progressive</span>
        </button>

        <button
          type="button"
          class="mod-toggle-chip"
          :class="{ active: Boolean(altResistanceMod) }"
          @click="toggleAfflictionModifier('Alternate Resistance', false)"
        >
          <i class="ri-shield-flash-line"></i>
          <span>Alternate Res.</span>
        </button>

        <button
          type="button"
          class="mod-toggle-chip flaw"
          :class="{ active: hasInstantRecovery }"
          @click="toggleAfflictionModifier('Instant Recovery', true)"
        >
          <i class="ri-speed-line"></i>
          <span>Instant Recovery</span>
        </button>
      </div>
    </div>

    <!-- Contextual Progression Ribbon -->
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

    <!-- Level 3: Resistance Check & Save DC Banner (Moved Above Degrees) -->
    <div class="resistance-defense-row">
      <div class="res-left-col">
        <div class="res-label-wrap">
          <span class="res-label">
            <i class="ri-shield-check-line"></i> Target Resistance Check:
          </span>
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
            :class="['res-' + resOpt.toLowerCase(), { active: activeResistance === resOpt }]"
            @click="selectAfflictionResistance(resOpt)"
          >
            <i :class="getDefenseIcon(resOpt)"></i>
            <span>{{ resOpt }}</span>
          </button>
        </div>
      </div>

      <!-- Live Dynamic DC Formula Badge -->
      <div class="res-dc-callout-pill" :class="'dc-' + activeResistance.toLowerCase()">
        <div class="dc-calc-badge">
          <span class="dc-calc-formula">DC 10 + Rk {{ Number(effect.ranks) || 1 }}</span>
          <span class="dc-calc-val">DC {{ saveDC }}</span>
        </div>
        <div class="dc-calc-target">
          <span class="dc-target-label">Resisted by</span>
          <span class="dc-target-name">{{ activeResistance }}</span>
        </div>
      </div>
    </div>

    <!-- Level 4: 3-Column Polished Degrees Grid -->
    <div class="degrees-grid" :class="{ 'has-multi-conditions': conditionsPerDegree > 1 }">
      <!-- 1st Degree Card -->
      <div class="degree-box deg-box-1" :class="{ 'eliminated-box': !isDegree1Active }">
        <div class="degree-header deg-1">
          <div class="deg-title-group">
            <span class="degree-badge-indicator">1</span>
            <div class="deg-title-text">
              <span class="degree-num">1st Degree</span>
              <span class="degree-sub">Failure by 1–5</span>
            </div>
          </div>
          <span v-if="conditionsPerDegree > 1" class="multi-cond-badge">
            +{{ extraConditionRanks }} Extra
          </span>
        </div>

        <div class="degree-conditions-container">
          <div class="condition-slot">
            <label v-if="conditionsPerDegree > 1" class="cond-slot-label">Condition 1</label>
            <div class="select-wrap">
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
          </div>
          <div v-if="conditionsPerDegree >= 2" class="condition-slot">
            <label class="cond-slot-label">Condition 2 (+Extra)</label>
            <div class="select-wrap">
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
          </div>
          <div v-if="conditionsPerDegree >= 3" class="condition-slot">
            <label class="cond-slot-label">Condition 3 (+Extra Rk 2)</label>
            <div class="select-wrap">
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
        </div>
        <div class="degree-footer-note">
          <i class="ri-information-line"></i>
          <span>Mild impairing condition</span>
        </div>
      </div>

      <!-- 2nd Degree Card -->
      <div class="degree-box deg-box-2" :class="{ 'eliminated-box': !isDegree2Active }">
        <div class="degree-header deg-2">
          <div class="deg-title-group">
            <span class="degree-badge-indicator">2</span>
            <div class="deg-title-text">
              <span class="degree-num">2nd Degree</span>
              <span class="degree-sub">Failure by 6–10</span>
            </div>
          </div>
          <span v-if="!isDegree2Active" class="eliminated-badge">
            <i class="ri-lock-2-line"></i> Eliminated
          </span>
          <span v-else-if="conditionsPerDegree > 1" class="multi-cond-badge">
            +{{ extraConditionRanks }} Extra
          </span>
        </div>

        <div v-if="isDegree2Active" class="degree-conditions-container">
          <div class="condition-slot">
            <label v-if="conditionsPerDegree > 1" class="cond-slot-label">Condition 1</label>
            <div class="select-wrap">
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
          </div>
          <div v-if="conditionsPerDegree >= 2" class="condition-slot">
            <label class="cond-slot-label">Condition 2 (+Extra)</label>
            <div class="select-wrap">
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
          </div>
          <div v-if="conditionsPerDegree >= 3" class="condition-slot">
            <label class="cond-slot-label">Condition 3 (+Extra Rk 2)</label>
            <div class="select-wrap">
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
          </div>
          <div class="degree-footer-note">
            <i class="ri-alert-line"></i>
            <span>Significant debilitating condition</span>
          </div>
        </div>
        <div v-else class="clean-muted-card">
          <div class="muted-badge-pill">
            <i class="ri-lock-2-line"></i>
            <span>Eliminated (Limited Degree Rk {{ limitedDegreeRanks }})</span>
          </div>
          <p class="muted-desc">Target only suffers first-degree conditions; second and third degrees cannot be achieved.</p>
        </div>
      </div>

      <!-- 3rd Degree Card -->
      <div class="degree-box deg-box-3" :class="{ 'eliminated-box': !isDegree3Active }">
        <div class="degree-header deg-3">
          <div class="deg-title-group">
            <span class="degree-badge-indicator">3</span>
            <div class="deg-title-text">
              <span class="degree-num">3rd Degree</span>
              <span class="degree-sub">Failure by 11+</span>
            </div>
          </div>
          <span v-if="!isDegree3Active" class="eliminated-badge">
            <i class="ri-lock-2-line"></i> Eliminated
          </span>
          <span v-else-if="conditionsPerDegree > 1" class="multi-cond-badge">
            +{{ extraConditionRanks }} Extra
          </span>
        </div>

        <div v-if="isDegree3Active" class="degree-conditions-container">
          <div class="condition-slot">
            <label v-if="conditionsPerDegree > 1" class="cond-slot-label">Condition 1</label>
            <div class="select-wrap">
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
          </div>
          <div v-if="conditionsPerDegree >= 2" class="condition-slot">
            <label class="cond-slot-label">Condition 2 (+Extra)</label>
            <div class="select-wrap">
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
          </div>
          <div v-if="conditionsPerDegree >= 3" class="condition-slot">
            <label class="cond-slot-label">Condition 3 (+Extra Rk 2)</label>
            <div class="select-wrap">
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
          </div>
          <div class="degree-footer-note">
            <i class="ri-skull-line"></i>
            <span>Total incapacitating condition</span>
          </div>
        </div>
        <div v-else class="clean-muted-card">
          <div class="muted-badge-pill">
            <i class="ri-lock-2-line"></i>
            <span>Eliminated (Limited Degree Rk {{ limitedDegreeRanks }})</span>
          </div>
          <p class="muted-desc">Third-degree conditions (Incapacitated, Paralyzed, etc.) can never be achieved.</p>
        </div>
      </div>
    </div>

    <!-- Instant Recovery Flaw Callout -->
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
import { computed, onMounted } from 'vue';
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
      icon: 'ri-history-line',
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

const activeResistance = computed(() =>
  props.effect?.config?.resistance || props.effect?.resistance || 'Fortitude'
);

const saveDC = computed(() =>
  10 + (Number(props.effect?.ranks) || 1)
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

function syncConditionsWithModifier(perDeg = conditionsPerDegree.value) {
  if (!props.effect) return;
  props.effect.config = props.effect.config || {};
  const p1 = getDegreeCondition('first', 0);
  const s1 = getDegreeCondition('first', 1);
  const t1 = getDegreeCondition('first', 2);
  const p2 = getDegreeCondition('second', 0);
  const s2 = getDegreeCondition('second', 1);
  const t2 = getDegreeCondition('second', 2);
  const p3 = getDegreeCondition('third', 0);
  const s3 = getDegreeCondition('third', 1);
  const t3 = getDegreeCondition('third', 2);

  props.effect.config.firstConditions = [p1, s1, t1].slice(0, perDeg);
  props.effect.config.firstDegree = props.effect.config.firstConditions.join(' & ');

  props.effect.config.secondConditions = [p2, s2, t2].slice(0, perDeg);
  props.effect.config.secondDegree = props.effect.config.secondConditions.join(' & ');

  props.effect.config.thirdConditions = [p3, s3, t3].slice(0, perDeg);
  props.effect.config.thirdDegree = props.effect.config.thirdConditions.join(' & ');

  if (!props.effect.config.resistance && props.effect.resistance) {
    props.effect.config.resistance = props.effect.resistance;
  }
}

function onConditionSelect(degreeKey, slotIndex, val) {
  props.effect.config = props.effect.config || {};
  const keyArr = `${degreeKey}Conditions`;
  const keyStr = `${degreeKey}Degree`;
  
  let currentArr = Array.isArray(props.effect.config[keyArr])
    ? [...props.effect.config[keyArr]]
    : [getDegreeCondition(degreeKey, 0), getDegreeCondition(degreeKey, 1), getDegreeCondition(degreeKey, 2)];

  currentArr[slotIndex] = val;
  for (let i = 0; i < conditionsPerDegree.value; i++) {
    if (!currentArr[i]) {
      currentArr[i] = getDegreeCondition(degreeKey, i);
    }
  }
  props.effect.config[keyArr] = currentArr;
  props.effect.config[keyStr] = currentArr.slice(0, conditionsPerDegree.value).filter(Boolean).join(' & ');
  updateConfig();
}

onMounted(() => {
  if (props.effect) {
    const c = props.effect.config;
    if (!c || !Array.isArray(c.firstConditions) || c.firstConditions.length < conditionsPerDegree.value) {
      syncConditionsWithModifier(conditionsPerDegree.value);
    }
  }
});

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
    if (modName === 'Extra Condition') {
      syncConditionsWithModifier(1);
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
    if (modName === 'Extra Condition') {
      syncConditionsWithModifier(2);
    }
  }
  updateConfig();
}

function setModifierRank(modName, isFlaw = false, targetRank = 0) {
  if (!props.effect) return;
  const list = isFlaw
    ? (props.effect.flaws = Array.isArray(props.effect.flaws) ? props.effect.flaws : [])
    : (props.effect.extras = Array.isArray(props.effect.extras) ? props.effect.extras : []);

  const idx = list.findIndex(m => m.name === modName);

  if (targetRank <= 0) {
    if (idx !== -1) {
      list.splice(idx, 1);
      if (modName === 'Extra Condition') {
        syncConditionsWithModifier(1);
      }
    }
  } else {
    if (idx !== -1) {
      list[idx].ranks = targetRank;
    } else {
      const source = isFlaw ? FLAWS : EXTRAS;
      const found = source.find(m => m.name === modName) || { name: modName, cost: isFlaw ? -1 : 1, type: 'per_rank' };
      list.push(normalizeModifier({
        name: found.name,
        cost: found.cost,
        type: found.type,
        ranks: targetRank,
        hasRanks: found.hasRanks,
        maxRanks: found.maxRanks,
        desc: found.desc,
        category: found.category,
        options: found.options
      }));
    }

    if (modName === 'Extra Condition') {
      syncConditionsWithModifier(1 + targetRank);
    }
  }
  updateConfig();
}
</script>
