<template>
  <div v-if="cfg" class="effect-configurator-container">
    <!-- Configurator Dossier Header -->
    <div class="config-header-strip">
      <div class="header-left">
        <div class="config-badge-icon">
          <i :class="getConfigIcon"></i>
        </div>
        <div class="header-titles">
          <div class="header-title-row">
            <span class="config-title">{{ cfg.label || 'Effect Specific Configuration' }}</span>
            <span class="config-type-tag">{{ effect.baseEffect }}</span>
          </div>
          <span class="config-subtitle">{{ getConfigSummaryText }}</span>
        </div>
      </div>

      <div class="header-right">
        <!-- Live Stat Pill -->
        <div v-if="statBadge" class="stat-pill" :class="statBadge.type">
          <i :class="statBadge.icon"></i>
          <span>{{ statBadge.text }}</span>
        </div>
      </div>
    </div>

    <!-- SUB-EDITOR: ENHANCED TRAIT (trait_picker) -->
    <div v-if="cfg.type === 'trait_picker'" class="config-body config-trait-picker">
      <div class="trait-picker-horizontal-layout">
        <!-- Left Column: Trait Category Sidebar -->
        <div class="trait-category-sidebar">
          <div class="sidebar-section-title">
            <i class="ri-folder-settings-line"></i>
            <span>1. Trait Category</span>
          </div>
          <div class="trait-category-list">
            <button
              v-for="(cat, catKey) in cfg.categories"
              :key="catKey"
              type="button"
              class="trait-cat-btn"
              :class="{ active: currentTraitCategory === catKey }"
              @click="selectTraitCategory(catKey)"
            >
              <div class="cat-btn-left">
                <i :class="getCategoryIcon(catKey)"></i>
                <span class="cat-label">{{ cat.label.split(' (')[0] }}</span>
              </div>
              <span class="cat-cost-badge">{{ cat.costDisplay }}</span>
            </button>
          </div>
        </div>

        <!-- Right Column: Trait Selector Main Box -->
        <div class="trait-selector-box">
          <div class="selector-header">
            <span class="selector-prompt">
              <i class="ri-focus-3-line"></i>
              <span>2. Choose Target {{ currentCategoryObj?.label.split(' (')[0] || 'Trait' }}:</span>
            </span>

            <!-- Search filter for advantages / skills -->
            <div v-if="currentTraitCategory === 'advantages' || currentTraitCategory === 'skills'" class="trait-search-wrapper">
              <i class="ri-search-line"></i>
              <input
                v-model="traitSearch"
                type="text"
                class="trait-search-input"
                :placeholder="`Filter ${currentCategoryObj?.label.split(' (')[0]}...`"
              />
              <button
                v-if="traitSearch"
                type="button"
                class="clear-search-btn"
                @click="traitSearch = ''"
              >
                <i class="ri-close-line"></i>
              </button>
            </div>
          </div>

          <!-- Chips Grid for Traits (Horizontal Wrap) -->
          <div class="trait-chips-grid" :class="{ 'scrollable-grid': currentTraitCategory === 'advantages' }">
            <button
              v-for="trait in filteredTraits"
              :key="trait"
              type="button"
              class="trait-chip"
              :class="{ active: effect.config?.traitName === trait }"
              @click="selectTrait(trait)"
            >
              <i v-if="effect.config?.traitName === trait" class="ri-check-line chip-check"></i>
              <span>{{ trait }}</span>
            </button>
            <div v-if="filteredTraits.length === 0" class="no-results-msg">
              No traits found matching "{{ traitSearch }}"
            </div>
          </div>
        </div>
      </div>

      <!-- Active Summary Alert -->
      <div class="config-summary-bar">
        <i class="ri-information-line"></i>
        <span>
          Enhancing: <strong>{{ effect.config?.traitName || 'Trait' }}</strong>
          ({{ currentCategoryObj?.label }}) &bull;
          Ranks: <strong>Rank {{ effect.ranks }}</strong> &bull;
          Calculated Base Cost: <strong>{{ currentCategoryObj?.costDisplay || effect.baseCost + ' PP/R' }}</strong>
        </span>
      </div>
    </div>

    <!-- SUB-EDITOR: SENSES (senses_multiselect_library) -->
    <div v-else-if="cfg.type === 'senses_multiselect_library'" class="config-body config-library">
      <!-- Active Selected Senses Horizontal Ribbon -->
      <div v-if="selectedFacultiesList.length > 0" class="selected-senses-ribbon">
        <div class="ribbon-title">
          <i class="ri-checkbox-circle-fill text-emerald"></i>
          <span>Active Senses ({{ totalSensesRanks }} {{ totalSensesRanks > 1 ? 'Ranks' : 'Rank' }}):</span>
        </div>
        <div class="ribbon-pills-row">
          <button
            v-for="fac in selectedFacultiesList"
            :key="fac.id"
            type="button"
            class="sense-active-pill"
            :disabled="selectedFacultiesList.length <= 1"
            @click="toggleFaculty(fac.id)"
            :title="selectedFacultiesList.length <= 1 ? 'At least one faculty is required' : 'Click to remove'"
          >
            <i :class="fac.icon || 'ri-eye-line'"></i>
            <span class="pill-name">{{ fac.name }}</span>
            <span class="pill-pts">+{{ fac.pts }} R</span>
            <i v-if="selectedFacultiesList.length > 1" class="ri-close-line pill-close"></i>
          </button>
        </div>
      </div>

      <!-- Library Filters Bar -->
      <div class="library-filter-bar">
        <div class="library-tabs">
          <button
            v-for="cat in cfg.categories"
            :key="cat.id"
            type="button"
            class="lib-tab-btn"
            :class="{ active: selectedSensesCategory === cat.id }"
            @click="selectedSensesCategory = cat.id"
          >
            {{ cat.label }}
            <span class="tab-count">
              {{ getSensesCountForCat(cat.id) }}
            </span>
          </button>
        </div>

        <div class="lib-search-box">
          <i class="ri-search-line"></i>
          <input
            v-model="sensesSearch"
            type="text"
            class="lib-search-input"
            placeholder="Search sensory faculties (e.g. Darkvision, Danger Sense)..."
          />
          <button v-if="sensesSearch" type="button" class="clear-search-btn" @click="sensesSearch = ''">
            <i class="ri-close-line"></i>
          </button>
        </div>
      </div>

      <!-- Faculties Cards Grid (Horizontal Layout) -->
      <div class="library-cards-grid horizontal-senses-grid">
        <div
          v-for="fac in filteredFaculties"
          :key="fac.id"
          class="lib-item-card horizontal-sense-card"
          :class="{ selected: isFacultySelected(fac.id) }"
          @click="toggleFaculty(fac.id)"
        >
          <div class="sense-card-left">
            <div class="card-icon-title">
              <i :class="fac.icon || 'ri-eye-line'"></i>
              <div class="sense-text-meta">
                <div class="sense-name-row">
                  <span class="card-title">{{ fac.name }}</span>
                  <span class="card-pts-badge">+{{ fac.pts }} {{ fac.pts > 1 ? 'Ranks' : 'Rank' }}</span>
                </div>
                <p class="card-desc">{{ fac.desc }}</p>
              </div>
            </div>
          </div>
          <div class="sense-card-right">
            <span class="selection-status">
              <i :class="isFacultySelected(fac.id) ? 'ri-checkbox-circle-fill' : 'ri-checkbox-blank-circle-line'"></i>
              <span class="status-label">{{ isFacultySelected(fac.id) ? 'Active' : 'Add' }}</span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- SUB-EDITOR: AFFLICTION (affliction_builder) -->
    <div v-else-if="cfg.type === 'affliction_builder'" class="config-body config-affliction">
      <!-- Quick Affliction Modifiers Strip (Interactive Fast Toggles) -->
      <div class="affliction-modifiers-strip">
        <span class="strip-label">
          <i class="ri-equalizer-line"></i> Affliction Modifiers & Mechanics:
        </span>
        <div class="strip-chips-row">
          <!-- Extra Condition Toggle -->
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

          <!-- Limited Degree Toggle -->
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

          <!-- Cumulative Toggle -->
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

          <!-- Progressive Toggle -->
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

          <!-- Alternate Resistance Toggle -->
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

          <!-- Instant Recovery Toggle -->
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

      <!-- Progression Track Ribbon (if Cumulative or Progressive) -->
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

      <!-- Quick Presets Carousel / Row -->
      <div class="affliction-presets-section">
        <span class="section-label">
          <i class="ri-flashlight-line"></i> Quick Affliction Presets:
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

      <!-- Degrees of Failure Grid -->
      <div class="degrees-grid" :class="{ 'has-multi-conditions': conditionsPerDegree > 1 }">
        <!-- 1st Degree -->
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
            <!-- Slot 1 (Primary Condition) -->
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

            <!-- Slot 2 (Secondary Condition if Extra Condition Rk >= 1) -->
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

            <!-- Slot 3 (Tertiary Condition if Extra Condition Rk >= 2) -->
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

        <!-- 2nd Degree -->
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

          <!-- Active State -->
          <div v-if="isDegree2Active" class="degree-conditions-container">
            <!-- Slot 1 -->
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

            <!-- Slot 2 -->
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

            <!-- Slot 3 -->
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

          <!-- Locked / Eliminated State -->
          <div v-else class="eliminated-lock-card">
            <i class="ri-forbid-2-line lock-icon"></i>
            <span class="eliminated-title">Eliminated by Limited Degree (Rank 2)</span>
            <p class="eliminated-desc">Target only suffers first-degree conditions; second and third degrees cannot be achieved.</p>
          </div>
        </div>

        <!-- 3rd Degree -->
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

          <!-- Active State -->
          <div v-if="isDegree3Active" class="degree-conditions-container">
            <!-- Slot 1 -->
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

            <!-- Slot 2 -->
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

            <!-- Slot 3 -->
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

          <!-- Locked / Eliminated State -->
          <div v-else class="eliminated-lock-card">
            <i class="ri-forbid-2-line lock-icon"></i>
            <span class="eliminated-title">Eliminated by Limited Degree (Rank {{ limitedDegreeRanks }})</span>
            <p class="eliminated-desc">Third-degree conditions (Incapacitated, Paralyzed, etc.) can never be achieved.</p>
          </div>
        </div>
      </div>

      <!-- Resistance Check Defense Toggle -->
      <div class="resistance-defense-row">
        <div class="res-label-wrap">
          <label class="res-label">
            <i class="ri-shield-line"></i> Resistance Defense Check:
          </label>
          <span v-if="altResistanceMod" class="alt-res-badge">
            <i class="ri-magic-line"></i> Alternate Resistance Active
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

      <!-- Special Mechanics Callout (Instant Recovery & Sense-Dependent) -->
      <div v-if="hasInstantRecovery" class="mechanic-callout-box instant-recovery-callout">
        <i class="ri-speed-line callout-icon"></i>
        <div class="callout-content">
          <span class="callout-title">Instant Recovery Flaw Active</span>
          <span class="callout-desc">Target recovers immediately from all conditions the moment the effect stops being applied (no lingering recovery checks needed).</span>
        </div>
      </div>
    </div>

    <!-- SUB-EDITOR: ILLUSION (senses_multiselect) -->
    <div v-else-if="cfg.type === 'senses_multiselect'" class="config-body config-illusion">
      <div class="illusion-intro">
        <span>Select sensory impressions affected. Base cost is <strong>1 PP per Rank per sense type</strong> (1 to 5 PP/Rank).</span>
      </div>
      <div class="illusion-senses-grid">
        <div
          v-for="s in cfg.senses"
          :key="s.id"
          class="illusion-sense-card"
          :class="{ selected: isIllusionSenseSelected(s.id) }"
          @click="toggleIllusionSense(s.id)"
        >
          <div class="sense-icon-col">
            <i :class="s.icon || 'ri-eye-line'"></i>
          </div>
          <div class="sense-text-col">
            <div class="sense-name-row">
              <span class="sense-name">{{ s.name }}</span>
              <span class="sense-badge">+1 PP/R</span>
            </div>
            <p class="sense-desc">{{ s.desc }}</p>
          </div>
          <div class="sense-toggle-check">
            <i :class="isIllusionSenseSelected(s.id) ? 'ri-checkbox-circle-fill' : 'ri-checkbox-blank-circle-line'"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- SUB-EDITOR: IMMUNITY (immunity_multiselect_library) -->
    <div v-else-if="cfg.type === 'immunity_multiselect_library'" class="config-body config-library">
      <div class="library-filter-bar">
        <div class="library-tabs">
          <button
            v-for="cat in cfg.categories"
            :key="cat.id"
            type="button"
            class="lib-tab-btn"
            :class="{ active: selectedImmunityCategory === cat.id }"
            @click="selectedImmunityCategory = cat.id"
          >
            {{ cat.label }}
            <span class="tab-count">
              {{ getImmunityCountForCat(cat.id) }}
            </span>
          </button>
        </div>

        <div class="lib-search-box">
          <i class="ri-search-line"></i>
          <input
            v-model="immunitySearch"
            type="text"
            class="lib-search-input"
            placeholder="Search immunities (e.g. Life Support, Fire, Aging)..."
          />
          <button v-if="immunitySearch" type="button" class="clear-search-btn" @click="immunitySearch = ''">
            <i class="ri-close-line"></i>
          </button>
        </div>
      </div>

      <div class="library-cards-grid">
        <div
          v-for="item in filteredImmunities"
          :key="item.id"
          class="lib-item-card"
          :class="{ selected: isImmunitySelected(item.id) }"
          @click="toggleImmunity(item.id)"
        >
          <div class="card-top">
            <div class="card-icon-title">
              <i :class="item.icon || 'ri-shield-line'"></i>
              <span class="card-title">{{ item.name }}</span>
            </div>
            <div class="card-pts-badge immunity-badge">
              {{ item.ranks }} {{ item.ranks > 1 ? 'Ranks' : 'Rank' }}
            </div>
          </div>
          <p class="card-desc">{{ item.desc }}</p>
          <div class="card-footer">
            <span class="selection-status">
              <i :class="isImmunitySelected(item.id) ? 'ri-checkbox-circle-fill' : 'ri-checkbox-blank-circle-line'"></i>
              {{ isImmunitySelected(item.id) ? 'Active (' + item.ranks + ' R)' : 'Click to Add' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- SUB-EDITOR: MOVEMENT (movement_multiselect_library) -->
    <div v-else-if="cfg.type === 'movement_multiselect_library'" class="config-body config-movement">
      <div class="movement-grid">
        <div
          v-for="mode in cfg.modes"
          :key="mode.id"
          class="movement-mode-card"
          :class="{ active: isMovementModeActive(mode.id) }"
        >
          <div class="mode-header" @click="toggleMovementMode(mode.id)">
            <div class="mode-identity">
              <i :class="mode.icon || 'ri-footprint-line'"></i>
              <span class="mode-name">{{ mode.name }}</span>
            </div>
            <div class="mode-check">
              <i :class="isMovementModeActive(mode.id) ? 'ri-checkbox-circle-fill' : 'ri-checkbox-blank-circle-line'"></i>
            </div>
          </div>

          <p class="mode-desc">{{ mode.desc }}</p>

          <div v-if="isMovementModeActive(mode.id)" class="mode-ranks-stepper">
            <span class="stepper-label">Purchased Ranks:</span>
            <div class="stepper-controls">
              <button
                type="button"
                class="step-btn"
                :disabled="getMovementModeRanks(mode.id) <= 1"
                @click="stepMovementMode(mode.id, -1)"
              >-</button>
              <span class="step-value">Rank {{ getMovementModeRanks(mode.id) }} / {{ mode.maxRanks }}</span>
              <button
                type="button"
                class="step-btn"
                :disabled="getMovementModeRanks(mode.id) >= mode.maxRanks"
                @click="stepMovementMode(mode.id, 1)"
              >+</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- SUB-EDITOR: MORPH (morph_scope) -->
    <div v-else-if="cfg.type === 'morph_scope'" class="config-body config-morph">
      <div class="morph-scopes-grid">
        <div
          v-for="scope in cfg.scopes"
          :key="scope.ranks"
          class="morph-scope-card"
          :class="{ active: (Number(effect.config?.scope) || 1) === scope.ranks }"
          @click="selectMorphScope(scope.ranks)"
        >
          <div class="scope-card-top">
            <span class="scope-ranks-tag">Rank {{ scope.ranks }}</span>
            <span class="scope-cost-badge">{{ scope.cost }} PP</span>
          </div>
          <span class="scope-name">{{ scope.name.split(' (')[0] }}</span>
          <p class="scope-desc">{{ scope.desc }}</p>
          <div class="scope-footer">
            <i :class="(Number(effect.config?.scope) || 1) === scope.ranks ? 'ri-radio-button-fill' : 'ri-checkbox-blank-circle-line'"></i>
            <span>{{ (Number(effect.config?.scope) || 1) === scope.ranks ? 'Selected Scope' : 'Select' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- SUB-EDITOR: WEAKEN (weaken_target) -->
    <div v-else-if="cfg.type === 'weaken_target'" class="config-body config-weaken">
      <div class="trait-picker-horizontal-layout">
        <div class="trait-category-sidebar">
          <div class="sidebar-section-title">
            <i class="ri-folder-settings-line"></i>
            <span>1. Target Category</span>
          </div>
          <div class="trait-category-list">
            <button
              v-for="(traits, catKey) in cfg.traitCategories"
              :key="catKey"
              type="button"
              class="trait-cat-btn"
              :class="{ active: currentWeakenCategory === catKey }"
              @click="selectWeakenCategory(catKey)"
            >
              <span class="cat-label">{{ formatWeakenCatLabel(catKey) }}</span>
            </button>
          </div>
        </div>

        <div class="trait-selector-box">
          <span class="selector-prompt">
            <i class="ri-focus-3-line"></i>
            <span>2. Target Trait to Drain/Weaken:</span>
          </span>
          <div class="trait-chips-grid">
            <button
              v-for="trait in cfg.traitCategories[currentWeakenCategory] || []"
              :key="trait"
              type="button"
              class="trait-chip"
              :class="{ active: effect.config?.traitName === trait }"
              @click="selectWeakenTrait(trait)"
            >
              <i v-if="effect.config?.traitName === trait" class="ri-check-line chip-check"></i>
              <span>{{ trait }}</span>
            </button>
          </div>
        </div>
      </div>

      <div class="resistance-defense-row">
        <label class="res-label">
          <i class="ri-shield-line"></i> Resisted By:
        </label>
        <div class="res-toggle-group">
          <button
            v-for="resOpt in cfg.resistanceOptions"
            :key="resOpt"
            type="button"
            class="res-btn"
            :class="{ active: (effect.config?.resistance || effect.resistance) === resOpt }"
            @click="selectWeakenResistance(resOpt)"
          >
            <i :class="resOpt === 'Fortitude' ? 'ri-shield-cross-line' : 'ri-mental-health-line'"></i>
            <span>{{ resOpt }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- SUB-EDITOR: NULLIFY (descriptor_spec) -->
    <div v-else-if="cfg.type === 'descriptor_spec'" class="config-body config-nullify">
      <div class="descriptor-intro">
        <span>Select or enter the specific descriptor/power type countered by Nullify:</span>
      </div>
      <div class="descriptor-chips-grid">
        <button
          v-for="desc in cfg.descriptors"
          :key="desc"
          type="button"
          class="trait-chip"
          :class="{ active: effect.config?.descriptor === desc }"
          @click="selectNullifyDescriptor(desc)"
        >
          <i v-if="effect.config?.descriptor === desc" class="ri-check-line chip-check"></i>
          <span>{{ desc }}</span>
        </button>
      </div>

      <div v-if="effect.config?.descriptor === 'Custom'" class="custom-desc-input-row">
        <label class="field-label">Custom Countered Descriptor:</label>
        <input
          v-model="effect.config.customDescriptor"
          type="text"
          class="text-input"
          placeholder="e.g. Divine Magic, Solar Energy, Kryptonite..."
          @input="updateConfig"
        />
      </div>
    </div>

    <!-- SUB-EDITOR: COMPREHEND (comprehend_multiselect_library) -->
    <div v-else-if="cfg.type === 'comprehend_multiselect_library'" class="config-body config-library">
      <div class="library-cards-grid">
        <div
          v-for="mode in cfg.modes"
          :key="mode.id"
          class="lib-item-card"
          :class="{ selected: isComprehendSelected(mode.id) }"
          @click="toggleComprehend(mode.id)"
        >
          <div class="card-top">
            <div class="card-icon-title">
              <i :class="mode.icon || 'ri-translate-2'"></i>
              <span class="card-title">{{ mode.name }}</span>
            </div>
            <div class="card-pts-badge">
              {{ mode.ranks }} {{ mode.ranks > 1 ? 'Ranks' : 'Rank' }}
            </div>
          </div>
          <p class="card-desc">{{ mode.desc }}</p>
          <div class="card-footer">
            <span class="selection-status">
              <i :class="isComprehendSelected(mode.id) ? 'ri-checkbox-circle-fill' : 'ri-checkbox-blank-circle-line'"></i>
              {{ isComprehendSelected(mode.id) ? 'Active (' + mode.ranks + ' R)' : 'Click to Add' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- SUB-EDITOR: ENVIRONMENT (environment_multiselect_library) -->
    <div v-else-if="cfg.type === 'environment_multiselect_library'" class="config-body config-library">
      <div class="library-cards-grid">
        <div
          v-for="el in cfg.elements"
          :key="el.id"
          class="lib-item-card"
          :class="{ selected: isEnvironmentSelected(el.id) }"
          @click="toggleEnvironment(el.id)"
        >
          <div class="card-top">
            <div class="card-icon-title">
              <i :class="el.icon || 'ri-earth-line'"></i>
              <span class="card-title">{{ el.name }}</span>
            </div>
            <div class="card-pts-badge">
              +{{ el.cost }} PP/R
            </div>
          </div>
          <p class="card-desc">{{ el.desc }}</p>
          <div class="card-footer">
            <span class="selection-status">
              <i :class="isEnvironmentSelected(el.id) ? 'ri-checkbox-circle-fill' : 'ri-checkbox-blank-circle-line'"></i>
              {{ isEnvironmentSelected(el.id) ? 'Selected (+ ' + el.cost + ' PP/R)' : 'Click to Add' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- SUB-EDITOR: VARIABLE (variable_theme) -->
    <div v-else-if="cfg.type === 'variable_theme'" class="config-body config-variable">
      <div class="descriptor-intro">
        <span>Choose the thematic descriptor and scope for this Variable power pool:</span>
      </div>
      <div class="descriptor-chips-grid">
        <button
          v-for="th in cfg.themes"
          :key="th"
          type="button"
          class="trait-chip"
          :class="{ active: effect.config?.theme === th }"
          @click="selectVariableTheme(th)"
        >
          <i v-if="effect.config?.theme === th" class="ri-check-line chip-check"></i>
          <span>{{ th }}</span>
        </button>
      </div>

      <div class="custom-desc-input-row">
        <label class="field-label">Custom Theme / Descriptor Descriptor:</label>
        <input
          v-model="effect.config.theme"
          type="text"
          class="text-input"
          placeholder="e.g. Technological Gadgets, Biomorphing, Mystic Spells..."
          @input="updateConfig"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue';
import { CONFIGURABLE_EFFECTS, EXTRAS, FLAWS, normalizeEffect, normalizeModifier } from '../../rules/powerEngine.js';

const props = defineProps({
  effect: {
    type: Object,
    required: true
  },
  isLinked: {
    type: Boolean,
    default: false
  }
});

const cfg = computed(() => {
  if (!props.effect || !props.effect.baseEffect) return null;
  return CONFIGURABLE_EFFECTS[props.effect.baseEffect] || null;
});

// Helper to ensure config object has valid schema and run normalizeEffect
function ensureInitialized() {
  if (!props.effect || !cfg.value) return;
  props.effect.config = props.effect.config || {};
  const norm = normalizeEffect(props.effect);
  Object.assign(props.effect, norm);
}

onMounted(() => {
  ensureInitialized();
});

watch(
  () => props.effect?.baseEffect,
  () => {
    ensureInitialized();
  }
);

function updateConfig() {
  if (!props.effect || !cfg.value) return;
  const norm = normalizeEffect(props.effect);
  Object.assign(props.effect, norm);
}

// Icon for dossier top
const getConfigIcon = computed(() => {
  const base = props.effect?.baseEffect;
  switch (base) {
    case 'Enhanced Trait': return 'ri-user-star-line';
    case 'Senses': return 'ri-eye-2-line';
    case 'Affliction': return 'ri-virus-line';
    case 'Illusion': return 'ri-ghost-line';
    case 'Immunity': return 'ri-shield-star-line';
    case 'Movement': return 'ri-walk-line';
    case 'Morph': return 'ri-user-shared-line';
    case 'Weaken': return 'ri-arrow-down-circle-line';
    case 'Nullify': return 'ri-forbid-2-line';
    case 'Comprehend': return 'ri-translate-2';
    case 'Environment': return 'ri-earth-line';
    case 'Variable': return 'ri-sparkling-2-line';
    default: return 'ri-settings-4-line';
  }
});

const getConfigSummaryText = computed(() => {
  const c = props.effect?.config;
  const base = props.effect?.baseEffect;
  if (!c) return 'Configure effect options and mechanics.';

  switch (base) {
    case 'Enhanced Trait': {
      const cat = c.traitCategory || 'abilities';
      const trait = c.traitName || 'Strength';
      const costStr = currentCategoryObj.value?.costDisplay || `${props.effect.baseCost} PP/R`;
      return `Target: ${trait} (${cat}) • ${costStr}`;
    }
    case 'Senses': {
      const count = (c.selectedFaculties || []).length;
      return `${count} sensory faculties selected • ${props.effect.ranks} Ranks`;
    }
    case 'Affliction': {
      let degs = [];
      degs.push(`1st: ${c.firstDegree || 'Dazed'}`);
      if (limitedDegreeRanks.value < 2) {
        degs.push(`2nd: ${c.secondDegree || 'Stunned'}`);
      }
      if (limitedDegreeRanks.value < 1) {
        degs.push(`3rd: ${c.thirdDegree || 'Paralyzed'}`);
      }
      let summary = `${degs.join(' | ')} (Resisted by ${c.resistance || props.effect.resistance || 'Fortitude'})`;
      if (isProgressive.value) summary += ' • Progressive';
      else if (isCumulative.value) summary += ' • Cumulative';
      if (extraConditionRanks.value > 0) summary += ` • Extra Cond (Rk ${extraConditionRanks.value})`;
      if (limitedDegreeRanks.value > 0) summary += ` • Limited Deg (Rk ${limitedDegreeRanks.value})`;
      return summary;
    }
    case 'Illusion': {
      const count = (c.senses || []).length;
      return `${count} senses affected • ${props.effect.baseCost} PP/Rank`;
    }
    case 'Immunity': {
      const count = (c.selectedPresets || []).length;
      return `${count} immunities active • ${props.effect.ranks} Ranks`;
    }
    case 'Movement': {
      const count = (c.selectedModes || []).length;
      return `${count} movement modes active • ${props.effect.ranks} Ranks`;
    }
    case 'Morph': {
      return `Scope Rank ${c.scope || 1} • ${props.effect.ranks * 5} PP`;
    }
    case 'Weaken': {
      return `Target: ${c.traitName || 'Stamina'} (Resisted by ${c.resistance || 'Fortitude'})`;
    }
    case 'Nullify': {
      return `Countered: ${c.descriptor === 'Custom' ? (c.customDescriptor || 'Custom') : (c.descriptor || 'Magic')}`;
    }
    case 'Comprehend': {
      const count = (c.selectedModes || []).length;
      return `${count} modes active • ${props.effect.ranks} Ranks`;
    }
    case 'Environment': {
      const count = (c.selectedElements || []).length;
      return `${count} hazards active • ${props.effect.baseCost} PP/Rank`;
    }
    case 'Variable': {
      return `Theme: ${c.theme || 'Magic / Sorcery'}`;
    }
    default:
      return 'Effect configuration parameters';
  }
});

const statBadge = computed(() => {
  const base = props.effect?.baseEffect;
  const c = props.effect?.config;
  if (!c) return null;

  if (base === 'Enhanced Trait') {
    return {
      type: 'badge-cost',
      icon: 'ri-coins-line',
      text: currentCategoryObj.value?.costDisplay || `${props.effect.baseCost} PP / Rank`
    };
  }
  if (base === 'Senses' || base === 'Immunity' || base === 'Movement' || base === 'Comprehend') {
    return {
      type: 'badge-ranks',
      icon: 'ri-medal-line',
      text: `Calculated Ranks: ${props.effect.ranks}`
    };
  }
  if (base === 'Illusion' || base === 'Environment') {
    return {
      type: 'badge-cost',
      icon: 'ri-coins-line',
      text: `Base Cost: ${props.effect.baseCost} PP/R`
    };
  }
  if (base === 'Affliction' || base === 'Weaken') {
    return {
      type: 'badge-res',
      icon: 'ri-shield-line',
      text: `Resisted by ${props.effect.resistance || 'Fortitude'}`
    };
  }
  return null;
});

/* =========================================================================
   1. ENHANCED TRAIT
   ========================================================================= */
const traitSearch = ref('');

const currentTraitCategory = computed(() => {
  return props.effect?.config?.traitCategory || 'abilities';
});

const currentCategoryObj = computed(() => {
  return cfg.value?.categories?.[currentTraitCategory.value] || null;
});

const filteredTraits = computed(() => {
  const list = currentCategoryObj.value?.traits || [];
  if (!traitSearch.value.trim()) return list;
  const q = traitSearch.value.toLowerCase();
  return list.filter(t => t.toLowerCase().includes(q));
});

function getCategoryIcon(catKey) {
  switch (catKey) {
    case 'abilities': return 'ri-boxing-line';
    case 'defenses': return 'ri-shield-line';
    case 'skills': return 'ri-tools-line';
    case 'advantages': return 'ri-medal-line';
    default: return 'ri-check-line';
  }
}

function selectTraitCategory(catKey) {
  props.effect.config = props.effect.config || {};
  props.effect.config.traitCategory = catKey;
  const catObj = cfg.value.categories[catKey];
  if (catObj && catObj.traits && catObj.traits.length > 0) {
    // If current trait not in new category, pick first
    if (!catObj.traits.includes(props.effect.config.traitName)) {
      props.effect.config.traitName = catObj.traits[0];
    }
  }
  updateConfig();
}

function selectTrait(trait) {
  props.effect.config = props.effect.config || {};
  props.effect.config.traitName = trait;
  updateConfig();
}

/* =========================================================================
   2. SENSES
   ========================================================================= */
const selectedSensesCategory = ref('all');
const sensesSearch = ref('');

const selectedFacultiesList = computed(() => {
  const sel = props.effect?.config?.selectedFaculties;
  if (!Array.isArray(sel) || !cfg.value?.faculties) return [];
  return cfg.value.faculties.filter(f => sel.includes(f.id));
});

const totalSensesRanks = computed(() => {
  return selectedFacultiesList.value.reduce((sum, f) => sum + (f.pts || 1), 0);
});

function getSensesCountForCat(catId) {
  if (!cfg.value?.faculties) return 0;
  if (catId === 'all') return cfg.value.faculties.length;
  return cfg.value.faculties.filter(f => f.category === catId).length;
}

const filteredFaculties = computed(() => {
  if (!cfg.value?.faculties) return [];
  return cfg.value.faculties.filter(f => {
    const matchCat = selectedSensesCategory.value === 'all' || f.category === selectedSensesCategory.value;
    if (!matchCat) return false;
    if (!sensesSearch.value.trim()) return true;
    const q = sensesSearch.value.toLowerCase();
    return f.name.toLowerCase().includes(q) || (f.desc && f.desc.toLowerCase().includes(q));
  });
});

function isFacultySelected(facId) {
  const sel = props.effect?.config?.selectedFaculties;
  return Array.isArray(sel) && sel.includes(facId);
}

function toggleFaculty(facId) {
  props.effect.config = props.effect.config || {};
  let list = Array.isArray(props.effect.config.selectedFaculties)
    ? [...props.effect.config.selectedFaculties]
    : [];

  if (list.includes(facId)) {
    if (list.length > 1) {
      list = list.filter(id => id !== facId);
    }
  } else {
    list.push(facId);
  }

  props.effect.config.selectedFaculties = list;
  updateConfig();
}

/* =========================================================================
   3. AFFLICTION (Dynamic Extras & Flaws Morphing)
   ========================================================================= */
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

/* =========================================================================
   4. ILLUSION
   ========================================================================= */
function isIllusionSenseSelected(senseId) {
  const sel = props.effect?.config?.senses;
  return Array.isArray(sel) && sel.includes(senseId);
}

function toggleIllusionSense(senseId) {
  props.effect.config = props.effect.config || {};
  let list = Array.isArray(props.effect.config.senses)
    ? [...props.effect.config.senses]
    : ['Visual'];

  if (list.includes(senseId)) {
    if (list.length > 1) {
      list = list.filter(s => s !== senseId);
    }
  } else {
    list.push(senseId);
  }

  props.effect.config.senses = list;
  updateConfig();
}

/* =========================================================================
   5. IMMUNITY
   ========================================================================= */
const selectedImmunityCategory = ref('all');
const immunitySearch = ref('');

function getImmunityCountForCat(catId) {
  if (!cfg.value?.presets) return 0;
  if (catId === 'all') return cfg.value.presets.length;
  return cfg.value.presets.filter(p => p.category === catId).length;
}

const filteredImmunities = computed(() => {
  if (!cfg.value?.presets) return [];
  return cfg.value.presets.filter(item => {
    const matchCat = selectedImmunityCategory.value === 'all' || item.category === selectedImmunityCategory.value;
    if (!matchCat) return false;
    if (!immunitySearch.value.trim()) return true;
    const q = immunitySearch.value.toLowerCase();
    return item.name.toLowerCase().includes(q) || (item.desc && item.desc.toLowerCase().includes(q));
  });
});

function isImmunitySelected(id) {
  const sel = props.effect?.config?.selectedPresets;
  return Array.isArray(sel) && sel.includes(id);
}

function toggleImmunity(id) {
  props.effect.config = props.effect.config || {};
  let list = Array.isArray(props.effect.config.selectedPresets)
    ? [...props.effect.config.selectedPresets]
    : [];

  if (list.includes(id)) {
    if (list.length > 1) {
      list = list.filter(i => i !== id);
    }
  } else {
    list.push(id);
  }

  props.effect.config.selectedPresets = list;
  updateConfig();
}

/* =========================================================================
   6. MOVEMENT
   ========================================================================= */
function isMovementModeActive(modeId) {
  const sel = props.effect?.config?.selectedModes;
  if (!Array.isArray(sel)) return false;
  return sel.some(m => (typeof m === 'object' ? m.id === modeId : m === modeId));
}

function getMovementModeRanks(modeId) {
  const sel = props.effect?.config?.selectedModes;
  if (!Array.isArray(sel)) return 1;
  const match = sel.find(m => (typeof m === 'object' ? m.id === modeId : m === modeId));
  if (match && typeof match === 'object') return Number(match.ranks) || 1;
  return 1;
}

function toggleMovementMode(modeId) {
  props.effect.config = props.effect.config || {};
  let sel = Array.isArray(props.effect.config.selectedModes)
    ? [...props.effect.config.selectedModes]
    : [];

  const exists = sel.some(m => (typeof m === 'object' ? m.id === modeId : m === modeId));
  if (exists) {
    if (sel.length > 1) {
      sel = sel.filter(m => (typeof m === 'object' ? m.id !== modeId : m !== modeId));
    }
  } else {
    const modeDef = cfg.value.modes?.find(m => m.id === modeId);
    sel.push({ id: modeId, name: modeDef?.name || modeId, ranks: 1 });
  }

  props.effect.config.selectedModes = sel;
  updateConfig();
}

function stepMovementMode(modeId, delta) {
  props.effect.config = props.effect.config || {};
  const sel = Array.isArray(props.effect.config.selectedModes)
    ? [...props.effect.config.selectedModes]
    : [];

  const idx = sel.findIndex(m => (typeof m === 'object' ? m.id === modeId : m === modeId));
  if (idx >= 0) {
    const modeDef = cfg.value.modes?.find(m => m.id === modeId);
    const max = modeDef?.maxRanks || 3;
    const currentRanks = typeof sel[idx] === 'object' ? (Number(sel[idx].ranks) || 1) : 1;
    const newRanks = Math.max(1, Math.min(max, currentRanks + delta));

    sel[idx] = { id: modeId, name: modeDef?.name || modeId, ranks: newRanks };
    props.effect.config.selectedModes = sel;
    updateConfig();
  }
}

/* =========================================================================
   7. MORPH
   ========================================================================= */
function selectMorphScope(scopeRanks) {
  props.effect.config = props.effect.config || {};
  props.effect.config.scope = scopeRanks;
  props.effect.ranks = scopeRanks;
  updateConfig();
}

/* =========================================================================
   8. WEAKEN
   ========================================================================= */
const currentWeakenCategory = ref('abilities');

function formatWeakenCatLabel(key) {
  switch (key) {
    case 'abilities': return 'Abilities';
    case 'defenses': return 'Defenses';
    case 'broad': return 'Broad Descriptor';
    default: return key;
  }
}

function selectWeakenCategory(catKey) {
  currentWeakenCategory.value = catKey;
  const list = cfg.value.traitCategories?.[catKey] || [];
  if (list.length > 0 && !list.includes(props.effect.config?.traitName)) {
    props.effect.config = props.effect.config || {};
    props.effect.config.traitName = list[0];
    updateConfig();
  }
}

function selectWeakenTrait(trait) {
  props.effect.config = props.effect.config || {};
  props.effect.config.traitName = trait;
  updateConfig();
}

function selectWeakenResistance(resOpt) {
  props.effect.config = props.effect.config || {};
  props.effect.config.resistance = resOpt;
  props.effect.resistance = resOpt;
  updateConfig();
}

/* =========================================================================
   9. NULLIFY
   ========================================================================= */
function selectNullifyDescriptor(desc) {
  props.effect.config = props.effect.config || {};
  props.effect.config.descriptor = desc;
  updateConfig();
}

/* =========================================================================
   10. COMPREHEND
   ========================================================================= */
function isComprehendSelected(modeId) {
  const sel = props.effect?.config?.selectedModes;
  return Array.isArray(sel) && sel.includes(modeId);
}

function toggleComprehend(modeId) {
  props.effect.config = props.effect.config || {};
  let sel = Array.isArray(props.effect.config.selectedModes)
    ? [...props.effect.config.selectedModes]
    : [];

  if (sel.includes(modeId)) {
    if (sel.length > 1) {
      sel = sel.filter(m => m !== modeId);
    }
  } else {
    sel.push(modeId);
  }

  props.effect.config.selectedModes = sel;
  updateConfig();
}

/* =========================================================================
   11. ENVIRONMENT
   ========================================================================= */
function isEnvironmentSelected(elId) {
  const sel = props.effect?.config?.selectedElements;
  return Array.isArray(sel) && sel.includes(elId);
}

function toggleEnvironment(elId) {
  props.effect.config = props.effect.config || {};
  let sel = Array.isArray(props.effect.config.selectedElements)
    ? [...props.effect.config.selectedElements]
    : [];

  if (sel.includes(elId)) {
    if (sel.length > 1) {
      sel = sel.filter(e => e !== elId);
    }
  } else {
    sel.push(elId);
  }

  props.effect.config.selectedElements = sel;
  updateConfig();
}

/* =========================================================================
   12. VARIABLE
   ========================================================================= */
function selectVariableTheme(theme) {
  props.effect.config = props.effect.config || {};
  props.effect.config.theme = theme;
  updateConfig();
}
</script>

<style scoped>
.effect-configurator-container {
  grid-column: 1 / -1;
  width: 100%;
  margin: 1.25rem 0;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(56, 239, 125, 0.25);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.effect-configurator-container:hover {
  border-color: rgba(56, 239, 125, 0.4);
}

/* Header Strip */
.config-header-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.9rem 1.25rem;
  background: linear-gradient(90deg, rgba(56, 239, 125, 0.08) 0%, rgba(79, 143, 247, 0.05) 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.config-badge-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: rgba(56, 239, 125, 0.15);
  border: 1px solid rgba(56, 239, 125, 0.3);
  color: #38ef7d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.header-titles {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.header-title-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.config-title {
  font-weight: 700;
  font-size: 0.95rem;
  color: #f1f5f9;
  letter-spacing: -0.01em;
}

.config-type-tag {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  background: rgba(79, 143, 247, 0.15);
  border: 1px solid rgba(79, 143, 247, 0.35);
  color: #60a5fa;
  letter-spacing: 0.04em;
}

.config-subtitle {
  font-size: 0.78rem;
  color: #94a3b8;
}

.header-right {
  display: flex;
  align-items: center;
}

.stat-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.stat-pill.badge-cost {
  background: rgba(234, 179, 8, 0.15);
  border: 1px solid rgba(234, 179, 8, 0.4);
  color: #facc15;
}

.stat-pill.badge-ranks {
  background: rgba(56, 239, 125, 0.15);
  border: 1px solid rgba(56, 239, 125, 0.4);
  color: #38ef7d;
}

.stat-pill.badge-res {
  background: rgba(168, 85, 247, 0.15);
  border: 1px solid rgba(168, 85, 247, 0.4);
  color: #c084fc;
}

/* Body */
.config-body {
  padding: 1.15rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* 1. Trait Picker Styles (Horizontal Master-Detail Layout) */
.trait-picker-horizontal-layout {
  display: flex;
  gap: 1rem;
  align-items: stretch;
}

@media (max-width: 860px) {
  .trait-picker-horizontal-layout {
    flex-direction: column;
  }
}

.trait-category-sidebar {
  width: 240px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

@media (max-width: 860px) {
  .trait-category-sidebar {
    width: 100%;
  }
}

.sidebar-section-title {
  font-size: 0.74rem;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.trait-category-list {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

@media (max-width: 860px) {
  .trait-category-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  }
}

.trait-cat-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.6rem 0.85rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #94a3b8;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s ease;
  text-align: left;
}

.trait-cat-btn:hover {
  background: rgba(255, 255, 255, 0.07);
  border-color: rgba(255, 255, 255, 0.18);
  color: #f8fafc;
}

.trait-cat-btn.active {
  background: rgba(79, 143, 247, 0.15);
  border-color: #3b82f6;
  color: #ffffff;
  box-shadow: 0 0 12px rgba(59, 130, 246, 0.25);
}

.cat-btn-left {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.cat-label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.cat-cost-badge {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #facc15;
}

.trait-selector-box {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 0.85rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.selector-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.selector-prompt {
  font-size: 0.82rem;
  font-weight: 600;
  color: #cbd5e1;
}

.trait-search-wrapper,
.lib-search-box {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  padding: 0.35rem 0.6rem;
  min-width: 220px;
}

.trait-search-input,
.lib-search-input {
  background: transparent;
  border: none;
  color: #f1f5f9;
  font-size: 0.8rem;
  outline: none;
  width: 100%;
}

.clear-search-btn {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 0.85rem;
  padding: 0;
  display: flex;
  align-items: center;
}

.clear-search-btn:hover {
  color: #f8fafc;
}

.trait-chips-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.trait-chips-grid.scrollable-grid {
  max-height: 200px;
  overflow-y: auto;
  padding-right: 0.35rem;
}

.trait-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.09);
  color: #cbd5e1;
  font-size: 0.82rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.trait-chip:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  transform: translateY(-1px);
}

.trait-chip.active {
  background: rgba(56, 239, 125, 0.18);
  border-color: #38ef7d;
  color: #ffffff;
  font-weight: 700;
  box-shadow: 0 0 10px rgba(56, 239, 125, 0.25);
}

.chip-check {
  color: #38ef7d;
  font-weight: bold;
}

.no-results-msg {
  padding: 0.75rem;
  font-size: 0.82rem;
  color: #94a3b8;
  font-style: italic;
  width: 100%;
}

.config-summary-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.85rem;
  border-radius: 6px;
  background: rgba(56, 239, 125, 0.06);
  border: 1px solid rgba(56, 239, 125, 0.2);
  color: #e2e8f0;
  font-size: 0.82rem;
}

.config-summary-bar i {
  color: #38ef7d;
  font-size: 1rem;
}

/* 2. Library Styles (Senses, Immunity, Comprehend, Environment) */
.library-filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.library-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.lib-tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.7rem;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #94a3b8;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.lib-tab-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #f1f5f9;
}

.lib-tab-btn.active {
  background: rgba(79, 143, 247, 0.18);
  border-color: #3b82f6;
  color: #ffffff;
}

.tab-count {
  font-size: 0.7rem;
  padding: 0.1rem 0.35rem;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.3);
  color: #cbd5e1;
}

/* Active Selected Senses Ribbon */
.selected-senses-ribbon {
  background: rgba(56, 239, 125, 0.06);
  border: 1px solid rgba(56, 239, 125, 0.25);
  border-radius: 8px;
  padding: 0.65rem 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.85rem;
  flex-wrap: wrap;
}

.ribbon-title {
  font-size: 0.76rem;
  font-weight: 800;
  color: #38ef7d;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  white-space: nowrap;
}

.ribbon-pills-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  align-items: center;
}

.sense-active-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(56, 239, 125, 0.15);
  border: 1px solid rgba(56, 239, 125, 0.35);
  color: #f1f5f9;
  border-radius: 999px;
  padding: 0.25rem 0.6rem;
  font-size: 0.76rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.sense-active-pill:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.4);
  color: #fca5a5;
}

.sense-active-pill:disabled {
  opacity: 0.75;
  cursor: default;
}

.sense-active-pill .pill-pts {
  font-size: 0.68rem;
  font-weight: 800;
  color: #38ef7d;
  background: rgba(0, 0, 0, 0.35);
  padding: 0.05rem 0.35rem;
  border-radius: 4px;
}

.sense-active-pill .pill-close {
  font-size: 0.8rem;
  color: #94a3b8;
}

.sense-active-pill:hover .pill-close {
  color: #ef4444;
}

/* Horizontal Senses Grid & Cards */
.horizontal-senses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)) !important;
  gap: 0.75rem;
}

.horizontal-sense-card {
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 0.75rem !important;
  padding: 0.75rem 0.95rem !important;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  transition: all 0.18s ease;
}

.horizontal-sense-card:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.horizontal-sense-card.selected {
  background: rgba(56, 239, 125, 0.08);
  border-color: #38ef7d;
  box-shadow: 0 4px 14px rgba(56, 239, 125, 0.15);
}

.sense-card-left {
  flex: 1;
  min-width: 0;
}

.sense-card-left .card-icon-title {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
}

.sense-card-left .card-icon-title > i {
  font-size: 1.25rem;
  color: #38ef7d;
  flex-shrink: 0;
  margin-top: 0.1rem;
}

.sense-text-meta {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
}

.sense-name-row {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-wrap: wrap;
}

.sense-name-row .card-title {
  font-size: 0.84rem;
  font-weight: 700;
  color: #f1f5f9;
}

.sense-card-left .card-desc {
  font-size: 0.74rem;
  color: #94a3b8;
  line-height: 1.4;
  margin: 0;
}

.sense-card-right {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.sense-card-right .selection-status {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.74rem;
  font-weight: 700;
  color: #64748b;
  padding: 0.3rem 0.55rem;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.15s ease;
}

.horizontal-sense-card.selected .sense-card-right .selection-status {
  color: #38ef7d;
  background: rgba(56, 239, 125, 0.12);
  border-color: rgba(56, 239, 125, 0.3);
}

.library-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 0.75rem;
  max-height: 380px;
  overflow-y: auto;
  padding-right: 0.35rem;
}

.lib-item-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.75rem 0.9rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  transition: all 0.18s ease;
}

.lib-item-card:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.lib-item-card.selected {
  background: rgba(56, 239, 125, 0.08);
  border-color: #38ef7d;
  box-shadow: 0 4px 14px rgba(56, 239, 125, 0.15);
}

.card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
}

.card-icon-title {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  color: #f1f5f9;
  font-weight: 600;
  font-size: 0.85rem;
}

.card-icon-title i {
  color: #38ef7d;
  font-size: 1rem;
}

.lib-item-card.selected .card-icon-title {
  color: #ffffff;
}

.card-pts-badge {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
  background: rgba(56, 239, 125, 0.15);
  border: 1px solid rgba(56, 239, 125, 0.35);
  color: #38ef7d;
  white-space: nowrap;
}

.card-pts-badge.immunity-badge {
  background: rgba(147, 51, 234, 0.18);
  border-color: rgba(168, 85, 247, 0.4);
  color: #c084fc;
}

.card-desc {
  font-size: 0.75rem;
  line-height: 1.35;
  color: #94a3b8;
  margin: 0;
}

.card-footer {
  display: flex;
  align-items: center;
  padding-top: 0.35rem;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

.selection-status {
  font-size: 0.72rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: #64748b;
}

.lib-item-card.selected .selection-status {
  color: #38ef7d;
}

/* 3. Affliction Styles */
.affliction-presets-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.section-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #cbd5e1;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.presets-chips-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.preset-chip-btn {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.15rem;
  padding: 0.45rem 0.75rem;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
}

.preset-chip-btn:hover {
  background: rgba(255, 255, 255, 0.07);
  border-color: rgba(255, 255, 255, 0.18);
}

.preset-chip-btn.active {
  background: rgba(168, 85, 247, 0.15);
  border-color: #a855f7;
  box-shadow: 0 0 10px rgba(168, 85, 247, 0.25);
}

.preset-name {
  font-size: 0.82rem;
  font-weight: 600;
  color: #f1f5f9;
}

.preset-res {
  font-size: 0.68rem;
  color: #94a3b8;
}

.preset-chip-btn.active .preset-res {
  color: #d8b4fe;
}

/* Quick Affliction Modifiers Strip */
.affliction-modifiers-strip {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.65rem 0.85rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.strip-label {
  font-size: 0.74rem;
  font-weight: 700;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.strip-chips-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.45rem;
}

.mod-chip-group {
  display: inline-flex;
  align-items: center;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.mod-toggle-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.32rem 0.65rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  color: #94a3b8;
  font-size: 0.76rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.mod-chip-group .mod-toggle-chip {
  border: none;
  border-radius: 0;
  background: transparent;
}

.mod-toggle-chip:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #f1f5f9;
}

.mod-toggle-chip.active {
  background: rgba(59, 130, 246, 0.2);
  border-color: #3b82f6;
  color: #93c5fd;
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.25);
}

.mod-toggle-chip.flaw.active {
  background: rgba(239, 68, 68, 0.18);
  border-color: #ef4444;
  color: #fca5a5;
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.25);
}

.chip-rank-badge {
  font-size: 0.65rem;
  font-weight: 800;
  padding: 0.05rem 0.3rem;
  border-radius: 4px;
  background: rgba(59, 130, 246, 0.35);
  color: #ffffff;
}

.chip-rank-badge.flaw {
  background: rgba(239, 68, 68, 0.35);
}

.chip-step-controls {
  display: inline-flex;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.25);
}

.chip-step-controls .step-btn {
  min-width: 32px;
  min-height: 32px;
  padding: 0.2rem 0.4rem;
  background: transparent;
  border: none;
  color: #cbd5e1;
  font-size: 0.8rem;
  font-weight: 800;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.chip-step-controls .step-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
}

.chip-step-controls .step-btn:focus-visible {
  outline: 2px solid #38bdf8;
  outline-offset: -2px;
}

.chip-step-controls .step-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* Progression Track Ribbon */
.affliction-progression-ribbon {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: 0.65rem 0.85rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.affliction-progression-ribbon.progressive {
  background: linear-gradient(90deg, rgba(6, 182, 212, 0.12) 0%, rgba(59, 130, 246, 0.08) 100%);
  border-color: rgba(6, 182, 212, 0.3);
  box-shadow: 0 0 12px rgba(6, 182, 212, 0.15);
}

.affliction-progression-ribbon.cumulative {
  background: linear-gradient(90deg, rgba(168, 85, 247, 0.12) 0%, rgba(99, 102, 241, 0.08) 100%);
  border-color: rgba(168, 85, 247, 0.3);
  box-shadow: 0 0 12px rgba(168, 85, 247, 0.15);
}

.progression-ribbon-left {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.affliction-progression-ribbon.progressive i {
  font-size: 1.25rem;
  color: #22d3ee;
}

.affliction-progression-ribbon.cumulative i {
  font-size: 1.25rem;
  color: #c084fc;
}

.progression-text-col {
  display: flex;
  flex-direction: column;
}

.progression-title {
  font-size: 0.82rem;
  font-weight: 700;
  color: #ffffff;
}

.progression-desc {
  font-size: 0.72rem;
  color: #94a3b8;
}

.progression-track-stepper {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.step-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.45rem;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.7rem;
}

.step-pill .pill-deg {
  font-weight: 800;
  color: #cbd5e1;
}

.step-pill .pill-name {
  color: #67e8f9;
  font-weight: 600;
}

.step-pill.disabled {
  opacity: 0.4;
  border-style: dashed;
}

.step-arrow {
  color: #64748b;
  font-size: 0.85rem;
}

/* Degrees Grid & Multi-Conditions */
.degrees-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.75rem;
}

.degree-box {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.06);
  position: relative;
  transition: all 0.2s ease;
}

.deg-title-group {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.multi-cond-badge {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.1rem 0.4rem;
  border-radius: 999px;
  background: rgba(56, 239, 125, 0.15);
  border: 1px solid rgba(56, 239, 125, 0.3);
  color: #4ade80;
}

.eliminated-badge {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.1rem 0.4rem;
  border-radius: 999px;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #f87171;
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
}

.degree-conditions-container {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.condition-slot {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.cond-slot-label {
  font-size: 0.68rem;
  font-weight: 600;
  color: #94a3b8;
}

.degree-select.slot-secondary {
  border-color: rgba(56, 239, 125, 0.35);
  background: #0f1c18;
}

.degree-select.slot-tertiary {
  border-color: rgba(234, 179, 8, 0.35);
  background: #1c180f;
}

/* Eliminated / Locked State */
.degree-box.eliminated-box {
  background: repeating-linear-gradient(
    -45deg,
    rgba(0, 0, 0, 0.35),
    rgba(0, 0, 0, 0.35) 8px,
    rgba(239, 68, 68, 0.04) 8px,
    rgba(239, 68, 68, 0.04) 16px
  );
  border-color: rgba(239, 68, 68, 0.2);
  opacity: 0.85;
}

.eliminated-lock-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 1.25rem 0.75rem;
  gap: 0.35rem;
}

.lock-icon {
  font-size: 1.75rem;
  color: #f87171;
  opacity: 0.8;
}

.eliminated-title {
  font-size: 0.78rem;
  font-weight: 700;
  color: #fca5a5;
}

.eliminated-desc {
  font-size: 0.68rem;
  color: #94a3b8;
  margin: 0;
  line-height: 1.35;
}

.degree-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.degree-num {
  font-size: 0.82rem;
  font-weight: 700;
  color: #f8fafc;
}

.degree-sub {
  font-size: 0.68rem;
  font-weight: 600;
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
}

.degree-header.deg-1 .degree-sub {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
}

.degree-header.deg-2 .degree-sub {
  background: rgba(234, 179, 8, 0.15);
  color: #facc15;
}

.degree-header.deg-3 .degree-sub {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
}

.degree-select {
  width: 100%;
  background: #111827;
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #f8fafc;
  padding: 0.45rem 0.6rem;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 500;
  outline: none;
}

.degree-note {
  font-size: 0.7rem;
  color: #64748b;
  font-style: italic;
}

/* Resistance Row Enhancements */
.resistance-defense-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: 0.65rem 0.85rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.res-label-wrap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.res-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #cbd5e1;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.alt-res-badge {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  background: rgba(168, 85, 247, 0.2);
  border: 1px solid rgba(168, 85, 247, 0.4);
  color: #d8b4fe;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.res-toggle-group {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.res-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.8rem;
  min-height: 36px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.res-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
}

.res-btn:focus-visible {
  outline: 2px solid #38bdf8;
  outline-offset: 2px;
}

/* DESIGN.md Canonical 5 Combat Defense Accents */
.res-btn.res-fortitude.active {
  background: rgba(16, 185, 129, 0.2);
  border-color: #10b981;
  color: #6ee7b7;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
}

.res-btn.res-will.active {
  background: rgba(192, 132, 252, 0.2);
  border-color: #c084fc;
  color: #e9d5ff;
  box-shadow: 0 0 10px rgba(192, 132, 252, 0.3);
}

.res-btn.res-dodge.active {
  background: rgba(56, 189, 248, 0.2);
  border-color: #38bdf8;
  color: #bae6fd;
  box-shadow: 0 0 10px rgba(56, 189, 248, 0.3);
}

.res-btn.res-parry.active {
  background: rgba(129, 140, 248, 0.2);
  border-color: #818cf8;
  color: #c7d2fe;
  box-shadow: 0 0 10px rgba(129, 140, 248, 0.3);
}

.res-btn.res-toughness.active {
  background: rgba(52, 211, 153, 0.2);
  border-color: #34d399;
  color: #a7f3d0;
  box-shadow: 0 0 10px rgba(52, 211, 153, 0.3);
}

.res-btn.active {
  background: rgba(56, 189, 248, 0.2);
  border-color: #38bdf8;
  color: #ffffff;
  box-shadow: 0 0 10px rgba(56, 189, 248, 0.3);
}

.res-help-text {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-left: auto;
}

.res-help-text strong {
  color: #f8fafc;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-variant-numeric: tabular-nums;
}

@media (pointer: coarse) {
  .mod-toggle-chip {
    min-height: 44px;
    padding: 0.45rem 0.85rem;
  }
  .chip-step-controls .step-btn {
    min-width: 44px;
    min-height: 44px;
  }
  .res-btn {
    min-height: 44px;
    padding: 0.5rem 1rem;
  }
  .preset-chip-btn {
    min-height: 44px;
  }
}

/* Mechanic Callout */
.mechanic-callout-box {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  padding: 0.65rem 0.85rem;
  border-radius: 8px;
}

.instant-recovery-callout {
  background: rgba(234, 179, 8, 0.08);
  border: 1px solid rgba(234, 179, 8, 0.25);
}

.instant-recovery-callout .callout-icon {
  font-size: 1.1rem;
  color: #facc15;
  margin-top: 0.1rem;
}

.instant-recovery-callout .callout-title {
  font-size: 0.78rem;
  font-weight: 700;
  color: #fef08a;
  display: block;
}

.instant-recovery-callout .callout-desc {
  font-size: 0.72rem;
  color: #cbd5e1;
}

/* 4. Illusion Styles */
.illusion-intro,
.descriptor-intro {
  font-size: 0.82rem;
  color: #cbd5e1;
}

.illusion-senses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.75rem;
}

.illusion-sense-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0.85rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  transition: all 0.18s ease;
}

.illusion-sense-card:hover {
  background: rgba(255, 255, 255, 0.07);
  border-color: rgba(255, 255, 255, 0.2);
}

.illusion-sense-card.selected {
  background: rgba(79, 143, 247, 0.12);
  border-color: #3b82f6;
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.15);
}

.sense-icon-col {
  width: 34px;
  height: 34px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  color: #60a5fa;
  flex-shrink: 0;
}

.sense-text-col {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  flex-grow: 1;
}

.sense-name-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sense-name {
  font-size: 0.82rem;
  font-weight: 600;
  color: #f1f5f9;
}

.sense-badge {
  font-size: 0.68rem;
  font-weight: 700;
  color: #facc15;
}

.sense-desc {
  font-size: 0.72rem;
  color: #94a3b8;
  margin: 0;
  line-height: 1.3;
}

.sense-toggle-check {
  font-size: 1.1rem;
  color: #64748b;
  flex-shrink: 0;
}

.illusion-sense-card.selected .sense-toggle-check {
  color: #3b82f6;
}

/* 5. Movement Styles */
.movement-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 0.75rem;
}

.movement-mode-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.75rem 0.85rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.18s ease;
}

.movement-mode-card.active {
  background: rgba(56, 239, 125, 0.08);
  border-color: #38ef7d;
  box-shadow: 0 4px 14px rgba(56, 239, 125, 0.15);
}

.mode-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.mode-identity {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #f1f5f9;
}

.mode-identity i {
  color: #38ef7d;
  font-size: 1rem;
}

.mode-check {
  font-size: 1.1rem;
  color: #64748b;
}

.movement-mode-card.active .mode-check {
  color: #38ef7d;
}

.mode-desc {
  font-size: 0.74rem;
  line-height: 1.35;
  color: #94a3b8;
  margin: 0;
}

.mode-ranks-stepper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.45rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.stepper-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: #cbd5e1;
}

.stepper-controls {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.step-btn {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: bold;
}

.step-btn:hover:not(:disabled) {
  background: rgba(56, 239, 125, 0.3);
  border-color: #38ef7d;
}

.step-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.step-value {
  font-size: 0.76rem;
  font-weight: 700;
  color: #38ef7d;
}

/* 6. Morph Scopes */
.morph-scopes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 0.75rem;
}

.morph-scope-card {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  padding: 0.85rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  transition: all 0.18s ease;
}

.morph-scope-card:hover {
  background: rgba(255, 255, 255, 0.07);
  border-color: rgba(255, 255, 255, 0.2);
}

.morph-scope-card.active {
  background: rgba(56, 239, 125, 0.1);
  border-color: #38ef7d;
  box-shadow: 0 4px 14px rgba(56, 239, 125, 0.2);
}

.scope-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.scope-ranks-tag {
  font-size: 0.75rem;
  font-weight: 700;
  color: #38ef7d;
}

.scope-cost-badge {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.3);
  color: #facc15;
}

.scope-name {
  font-size: 0.86rem;
  font-weight: 600;
  color: #ffffff;
}

.scope-desc {
  font-size: 0.74rem;
  line-height: 1.35;
  color: #94a3b8;
  margin: 0;
  flex-grow: 1;
}

.scope-footer {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.72rem;
  font-weight: 600;
  color: #64748b;
  padding-top: 0.4rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.morph-scope-card.active .scope-footer {
  color: #38ef7d;
}

/* 7. Descriptors / Custom Inputs */
.descriptor-chips-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.custom-desc-input-row {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-top: 0.5rem;
}

.field-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: #cbd5e1;
}

.text-input {
  background: #111827;
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #f8fafc;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.82rem;
  outline: none;
}

.text-input:focus {
  border-color: #38ef7d;
}
</style>
