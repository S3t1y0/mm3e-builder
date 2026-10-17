<template>
  <div class="green-ronin-sheet-wrapper print-target">
    <!-- Page 1: Core Deluxe Character Sheet -->
    <div class="gr-page gr-page-1">
      <!-- Header Section -->
      <header class="gr-card gr-header">
        <div class="gr-logo-wrap">
          <img src="/mm-logo.png" alt="Mutants &amp; Masterminds" class="gr-logo-img" />
        </div>

        <div class="gr-meta-grid">
          <!-- Sub-column Left: Identity & Core Metadata -->
          <div class="gr-meta-subcol gr-meta-subcol-left">
            <div class="gr-meta-item">
              <span class="gr-meta-label">HERO:</span>
              <input
                v-model="heroStore.character.name"
                type="text"
                class="gr-meta-input"
                placeholder="Hero Name"
                autocomplete="off"
                @change="heroStore.pushHistory()"
              />
            </div>
            <div class="gr-meta-item">
              <span class="gr-meta-label">PLAYER:</span>
              <input
                v-model="heroStore.character.player"
                type="text"
                class="gr-meta-input"
                placeholder="Player Name"
                autocomplete="off"
                @change="heroStore.pushHistory()"
              />
            </div>
            <div class="gr-meta-item">
              <span class="gr-meta-label">IDENTITY:</span>
              <input
                v-model="heroStore.character.identity"
                type="text"
                class="gr-meta-input"
                placeholder="Real Identity"
                autocomplete="off"
                @change="heroStore.pushHistory()"
              />
            </div>
            <div class="gr-radio-group" role="radiogroup" aria-label="Identity Type">
              <span
                class="gr-radio-option"
                role="radio"
                :aria-checked="heroStore.character.isSecretIdentity !== false"
                tabindex="0"
                @click="heroStore.character.isSecretIdentity = true; heroStore.pushHistory()"
                @keydown.space.prevent="heroStore.character.isSecretIdentity = true; heroStore.pushHistory()"
                @keydown.enter.prevent="heroStore.character.isSecretIdentity = true; heroStore.pushHistory()"
              >
                <span class="gr-radio-circle" :class="{ active: heroStore.character.isSecretIdentity !== false }"></span>
                <span>SECRET</span>
              </span>
              <span
                class="gr-radio-option"
                role="radio"
                :aria-checked="heroStore.character.isSecretIdentity === false"
                tabindex="0"
                @click="heroStore.character.isSecretIdentity = false; heroStore.pushHistory()"
                @keydown.space.prevent="heroStore.character.isSecretIdentity = false; heroStore.pushHistory()"
                @keydown.enter.prevent="heroStore.character.isSecretIdentity = false; heroStore.pushHistory()"
              >
                <span class="gr-radio-circle" :class="{ active: heroStore.character.isSecretIdentity === false }"></span>
                <span>PUBLIC</span>
              </span>
            </div>
          </div>

          <!-- Sub-column Right: Physical Traits, Affiliation & PL -->
          <div class="gr-meta-subcol gr-meta-subcol-right">
            <!-- Row 1: Gender, Age, Height -->
            <div class="gr-traits-row">
              <div class="gr-meta-item">
                <span class="gr-meta-label">GENDER:</span>
                <input
                  v-model="heroStore.character.gender"
                  type="text"
                  class="gr-meta-input"
                  placeholder="Gender"
                  autocomplete="off"
                  @change="heroStore.pushHistory()"
                />
              </div>
              <div class="gr-meta-item">
                <span class="gr-meta-label">AGE:</span>
                <input
                  v-model="heroStore.character.age"
                  type="text"
                  class="gr-meta-input"
                  placeholder="Age"
                  autocomplete="off"
                  @change="heroStore.pushHistory()"
                />
              </div>
              <div class="gr-meta-item">
                <span class="gr-meta-label">HEIGHT:</span>
                <input
                  v-model="heroStore.character.height"
                  type="text"
                  class="gr-meta-input"
                  placeholder="Height"
                  autocomplete="off"
                  @change="heroStore.pushHistory()"
                />
              </div>
            </div>

            <!-- Row 2: Weight, Eyes, Hair -->
            <div class="gr-traits-row">
              <div class="gr-meta-item">
                <span class="gr-meta-label">WEIGHT:</span>
                <input
                  v-model="heroStore.character.weight"
                  type="text"
                  class="gr-meta-input"
                  placeholder="Weight"
                  autocomplete="off"
                  @change="heroStore.pushHistory()"
                />
              </div>
              <div class="gr-meta-item">
                <span class="gr-meta-label">EYES:</span>
                <input
                  v-model="heroStore.character.eyes"
                  type="text"
                  class="gr-meta-input"
                  placeholder="Eyes"
                  autocomplete="off"
                  @change="heroStore.pushHistory()"
                />
              </div>
              <div class="gr-meta-item">
                <span class="gr-meta-label">HAIR:</span>
                <input
                  v-model="heroStore.character.hair"
                  type="text"
                  class="gr-meta-input"
                  placeholder="Hair"
                  autocomplete="off"
                  @change="heroStore.pushHistory()"
                />
              </div>
            </div>

            <!-- Row 3: Group Affiliation -->
            <div class="gr-meta-item">
              <span class="gr-meta-label">GROUP AFFILIATION:</span>
              <input
                v-model="heroStore.character.groupAffiliation"
                type="text"
                class="gr-meta-input"
                placeholder="Group Affiliation"
                autocomplete="off"
                @change="heroStore.pushHistory()"
              />
            </div>

            <!-- Row 4: Base of Operations & Power Level -->
            <div class="gr-traits-row">
              <div class="gr-meta-item" style="flex: 1.6;">
                <span class="gr-meta-label">BASE:</span>
                <input
                  v-model="heroStore.character.baseOfOperations"
                  type="text"
                  class="gr-meta-input"
                  placeholder="Base of Operations"
                  autocomplete="off"
                  @change="heroStore.pushHistory()"
                />
              </div>
              <div class="gr-meta-item" style="flex: 1; justify-content: flex-end;">
                <span class="gr-meta-label">POWER LEVEL:</span>
                <span class="gr-meta-line font-mono" style="font-weight: 900; color: #0f172a; flex: 0.6; text-align: center;">{{ heroStore.character.powerLevel || 10 }}</span>
              </div>
            </div>
          </div>

          <!-- Bottom: Power Point Totals Equation -->
          <div class="gr-pp-totals-row">
            <span class="gr-meta-label">POWER POINT TOTALS:</span>
            <span>ABILITIES <span class="gr-hl-num">[{{ heroStore.abilitiesCost }}]</span></span> • 
            <span>POWERS <span class="gr-hl-num">[{{ heroStore.powersCost }}]</span></span> • 
            <span>ADVANTAGES <span class="gr-hl-num">[{{ heroStore.advantagesCost }}]</span></span> • 
            <span>SKILLS <span class="gr-hl-num">[{{ heroStore.skillsCost }}]</span></span> • 
            <span>DEFENSES <span class="gr-hl-num">[{{ heroStore.defensesCost }}]</span></span>
            <span class="gr-pp-total-eq">
              = <span class="gr-hl-num" style="font-size: 11px;">[{{ heroStore.totalSpentPP }}]</span> / {{ heroStore.totalBudgetPP }} PP
            </span>
          </div>
        </div>
      </header>

      <!-- Abilities, Offense, and Defenses -->
      <div class="gr-stats-layout">
        <!-- Left Column: Abilities (top) & Offense (bottom) -->
        <div class="gr-left-combat-col">
          <!-- 8 Abilities Grid (2 rows of 4) -->
          <div class="gr-card gr-abilities-grid">
            <div class="gr-ability-badge">
              <span class="gr-ability-name">STRENGTH</span>
              <span class="gr-ability-score">{{ formatMod(heroStore.effectiveAbilities.STR) }}</span>
            </div>
            <div class="gr-ability-badge">
              <span class="gr-ability-name">AGILITY</span>
              <span class="gr-ability-score">{{ formatMod(heroStore.effectiveAbilities.AGL) }}</span>
            </div>
            <div class="gr-ability-badge">
              <span class="gr-ability-name">FIGHTING</span>
              <span class="gr-ability-score">{{ formatMod(heroStore.effectiveAbilities.FGT) }}</span>
            </div>
            <div class="gr-ability-badge">
              <span class="gr-ability-name">AWARENESS</span>
              <span class="gr-ability-score">{{ formatMod(heroStore.effectiveAbilities.AWE) }}</span>
            </div>
            <div class="gr-ability-badge">
              <span class="gr-ability-name">STAMINA</span>
              <span class="gr-ability-score">{{ formatMod(heroStore.effectiveAbilities.STA) }}</span>
            </div>
            <div class="gr-ability-badge">
              <span class="gr-ability-name">DEXTERITY</span>
              <span class="gr-ability-score">{{ formatMod(heroStore.effectiveAbilities.DEX) }}</span>
            </div>
            <div class="gr-ability-badge">
              <span class="gr-ability-name">INTELLECT</span>
              <span class="gr-ability-score">{{ formatMod(heroStore.effectiveAbilities.INT) }}</span>
            </div>
            <div class="gr-ability-badge">
              <span class="gr-ability-name">PRESENCE</span>
              <span class="gr-ability-score">{{ formatMod(heroStore.effectiveAbilities.PRE) }}</span>
            </div>
          </div>

          <!-- Offense Block (3 Lined Rows) -->
          <div v-if="uiStore.exportOptions.showOffense" class="gr-card gr-offense-card">
            <div class="gr-offense-header-row">
              <span class="gr-offense-title">OFFENSE</span>
              <div class="gr-initiative-pill">
                <span class="gr-initiative-label">INITIATIVE</span>
                <span class="gr-initiative-box">{{ formatMod(heroStore.initiativeTotal) }}</span>
              </div>
            </div>

            <div class="gr-attack-rows">
              <div v-for="(atk, aIdx) in displayAttacks" :key="atk.id || aIdx" class="gr-attack-row">
                <span class="gr-attack-name">{{ atk.name }}</span>
                <span class="gr-attack-bonus-box">{{ atk.rollBonus !== null ? formatMod(atk.rollBonus) : 'Area' }}</span>
                <span class="gr-attack-dc-line">{{ atk.dcDescription || `DC ${atk.dc} vs ${atk.resistance || 'Toughness'}` }}</span>
                <span class="gr-attack-crit">{{ atk.range || 'Close' }} • {{ atk.crit ? `Crit ${atk.crit}` : 'Crit 20' }}</span>
              </div>
              <!-- Empty blank lines to always maintain 3 clean physical rows -->
              <div v-for="i in Math.max(0, 3 - displayAttacks.length)" :key="'atk_blank_' + i" class="gr-attack-row gr-attack-blank">
                <span class="gr-attack-name"></span>
                <span class="gr-attack-bonus-box empty"></span>
                <span class="gr-attack-dc-line"></span>
                <span class="gr-attack-crit"></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Vertical Defense Card -->
        <div class="gr-card gr-defense-card">
          <div class="gr-defense-title-bar">DEFENSE</div>
          <div class="gr-defense-row">
            <div class="gr-defense-label">
              <span class="gr-defense-name">DODGE</span>
              <span class="gr-defense-base">(AGL)</span>
            </div>
            <span class="gr-defense-val">{{ heroStore.defenseTotals.DODGE }}</span>
          </div>
          <div class="gr-defense-row">
            <div class="gr-defense-label">
              <span class="gr-defense-name">PARRY</span>
              <span class="gr-defense-base">(FGT)</span>
            </div>
            <span class="gr-defense-val">{{ heroStore.defenseTotals.PARRY }}</span>
          </div>
          <div class="gr-defense-row">
            <div class="gr-defense-label">
              <span class="gr-defense-name">FORTITUDE</span>
              <span class="gr-defense-base">(STA)</span>
            </div>
            <span class="gr-defense-val">{{ heroStore.defenseTotals.FORTITUDE !== null ? heroStore.defenseTotals.FORTITUDE : '-' }}</span>
          </div>
          <div class="gr-defense-row">
            <div class="gr-defense-label">
              <span class="gr-defense-name">TOUGHNESS</span>
              <span class="gr-defense-base">(STA)</span>
            </div>
            <span class="gr-defense-val">{{ heroStore.defenseTotals.TOUGHNESS }}</span>
          </div>
          <div class="gr-defense-row">
            <div class="gr-defense-label">
              <span class="gr-defense-name">WILL</span>
              <span class="gr-defense-base">(AWE)</span>
            </div>
            <span class="gr-defense-val">{{ heroStore.defenseTotals.WILL }}</span>
          </div>
        </div>
      </div>

      <!-- Notes Bar -->
      <!-- Notes Bar -->
      <div v-if="uiStore.exportOptions.showNotes" class="gr-card gr-notes-bar">
        <label class="gr-notes-label" for="gr-input-notes">NOTES</label>
        <input
          id="gr-input-notes"
          v-model="heroStore.character.notes"
          type="text"
          class="gr-notes-input"
          placeholder="Brief character notes..."
          maxlength="160"
          autocomplete="off"
          @change="heroStore.pushHistory()"
        />
      </div>

      <!-- Advantages and Skills -->
      <div v-if="uiStore.exportOptions.showAdvantages || uiStore.exportOptions.showSkills" class="gr-mid-grid">
        <!-- Left: Advantages (Clean flowing list, matching physical character sheet) -->
        <div v-if="uiStore.exportOptions.showAdvantages" class="gr-card gr-advantages-card">
          <span class="gr-card-title">ADVANTAGES</span>
          <div v-if="heroStore.character.advantages?.length" class="gr-advantages-prose">
            <span v-for="(adv, aIdx) in heroStore.character.advantages" :key="adv.id || adv.name">
              <span class="gr-adv-name">{{ adv.name }}{{ adv.specification ? ` (${adv.specification})` : '' }}</span>
              <strong v-if="(adv.ranks || 1) > 1" class="gr-adv-rank"> {{ adv.ranks }}</strong>{{ aIdx < heroStore.character.advantages.length - 1 ? ', ' : '.' }}
            </span>
          </div>
          <div v-else class="gr-empty-hint">
            No combat advantages purchased.
          </div>
        </div>

        <!-- Right: Skills (2 Tabular Columns with neat dotted leader lines) -->
        <div v-if="uiStore.exportOptions.showSkills" class="gr-card gr-skills-card">
          <span class="gr-card-title">SKILLS</span>
          <div v-if="displaySkills.length" class="gr-skills-columns">
            <div v-for="sk in displaySkills" :key="sk.id" class="gr-skill-row">
              <div class="gr-skill-name-wrap">
                <span class="gr-skill-title">{{ sk.displayName }}</span>
                <span class="gr-skill-stat">({{ sk.abilityCode }})</span>
              </div>
              <span class="gr-skill-leader"></span>
              <span class="gr-skill-score">{{ formatMod(sk.totalBonus) }}</span>
            </div>
          </div>
          <div v-else class="gr-empty-hint">
            No skill ranks purchased.
          </div>
        </div>
      </div>

      <!-- Powers & Devices -->
      <div v-if="uiStore.exportOptions.showPowers" class="gr-card gr-powers-card">
        <span class="gr-card-title">POWERS &amp; DEVICES</span>
        <div v-if="primaryPowers.length" class="gr-powers-list">
          <div v-for="p in primaryPowers" :key="p.id" class="gr-power-entry">
            <!-- Power Header Row -->
            <div class="gr-power-row gr-power-heading-row">
              <strong class="gr-power-name">{{ p.name }}:</strong>
              <span v-if="getPowerBlock(p).structureBadge" class="gr-power-badge">{{ getPowerBlock(p).structureBadge }}</span>
              <span class="gr-power-main-effect">{{ getPowerBlock(p).mainLine }}</span>
              <span class="gr-power-cost-badge">{{ getPowerBlock(p).totalCost }} PP</span>
            </div>

            <!-- Mechanics Line (Action, Range, Duration, DC) -->
            <div v-if="uiStore.exportOptions.powerMechanics && getPowerBlock(p).mechanicsLine" class="gr-power-row gr-power-mechanics-line">
              <span class="gr-power-mech-text">{{ getPowerBlock(p).mechanicsLine }}</span>
            </div>

            <!-- Special Config or Modifiers -->
            <div v-if="(uiStore.exportOptions.powerMechanics && getPowerBlock(p).specialConfigLine) || getPowerBlock(p).modifiersLine" class="gr-power-row gr-power-detail-line">
              <span v-if="uiStore.exportOptions.powerMechanics && getPowerBlock(p).specialConfigLine" class="gr-power-config-text">{{ getPowerBlock(p).specialConfigLine }}</span>
              <span v-if="uiStore.exportOptions.powerMechanics && getPowerBlock(p).specialConfigLine && getPowerBlock(p).modifiersLine" class="gr-power-sep">•</span>
              <span v-if="getPowerBlock(p).modifiersLine" class="gr-power-mods-text">{{ getPowerBlock(p).modifiersLine }}</span>
            </div>

            <!-- Rule description -->
            <div
              v-if="uiStore.exportOptions.effectRules"
              v-for="(descLine, dIdx) in (getPowerBlock(p).effectRuleDescs?.length ? getPowerBlock(p).effectRuleDescs : [getPowerBlock(p).effectRuleDesc].filter(Boolean))"
              :key="'p1-desc-' + dIdx"
              class="gr-power-row gr-power-rule-desc"
            >
              <strong class="gr-effect-rule-name">
                {{ dIdx === 0 ? (getPowerBlock(p).effectBaseName || 'Effect') + ':' : '•' }}
              </strong>
              <span class="gr-power-rule-text">{{ descLine }}</span>
            </div>

            <!-- Applied modifiers -->
            <template v-if="uiStore.exportOptions.modifierRules" v-for="(modRule, mIdx) in getPowerBlock(p).modifierRules" :key="'p1-mod-' + mIdx">
              <div
                v-for="(line, lIdx) in (modRule.lines?.length ? modRule.lines : [modRule.desc])"
                :key="'p1-mod-' + mIdx + '-l-' + lIdx"
                class="gr-power-row gr-power-mod-rule"
                :class="{ 'gr-mod-rule-continuation-row': lIdx > 0 }"
              >
                <span v-if="lIdx === 0" class="gr-mod-rule-bullet">•</span>
                <span v-else class="gr-mod-rule-indent"></span>
                <strong v-if="lIdx === 0" class="gr-mod-rule-name">{{ modRule.name }}:</strong>
                <span class="gr-mod-rule-text">{{ line }}</span>
              </div>
            </template>

            <!-- Nested effect systems -->
            <template v-for="(sub, sIdx) in getPowerBlock(p).subEntries" :key="sIdx">
              <div class="gr-power-row gr-power-sub-entry" :class="{ 'gr-power-linked-row': sub.isLinked }">
                <span v-if="!sub.isLinked" class="gr-sub-bullet">•</span>
                <strong class="gr-sub-label">{{ sub.label }}:</strong>
                <span class="gr-sub-details">{{ sub.details || sub.effectName }}</span>
                <span v-if="sub.costBadge" class="gr-sub-cost-badge">{{ sub.costBadge }}</span>
              </div>
              <div
                v-if="uiStore.exportOptions.effectRules"
                v-for="(subDesc, sdIdx) in (sub.effectRuleDescs?.length ? sub.effectRuleDescs : [sub.effectRuleDesc].filter(Boolean))"
                :key="'p1-subdesc-' + sIdx + '-' + sdIdx"
                class="gr-power-row gr-power-sub-rule-desc"
                :class="{ 'gr-power-linked-rule-desc': sub.isLinked }"
              >
                <strong class="gr-effect-rule-name">
                  {{ sdIdx === 0 ? (sub.effectBaseName || 'Effect') + ':' : '•' }}
                </strong>
                <span class="gr-power-rule-text">{{ subDesc }}</span>
              </div>
              <template v-if="uiStore.exportOptions.modifierRules" v-for="(smRule, smIdx) in sub.modifierRules" :key="'p1-submod-' + sIdx + '-' + smIdx">
                <div
                  v-for="(sLine, slIdx) in (smRule.lines?.length ? smRule.lines : [smRule.desc])"
                  :key="'p1-submod-' + sIdx + '-' + smIdx + '-l-' + slIdx"
                  class="gr-power-row gr-power-sub-mod-rule"
                  :class="{ 'gr-mod-rule-continuation-row': slIdx > 0, 'gr-power-linked-mod-rule': sub.isLinked }"
                >
                  <span v-if="slIdx === 0" class="gr-mod-rule-bullet">•</span>
                  <span v-else class="gr-mod-rule-indent"></span>
                  <strong v-if="slIdx === 0" class="gr-mod-rule-name">{{ smRule.name }}:</strong>
                  <span class="gr-mod-rule-text">{{ sLine }}</span>
                </div>
              </template>
            </template>
          </div>
          <!-- Ruled rows filling remaining capacity for manual filling -->
          <div v-for="n in emptyPrimaryLinesCount" :key="'p-empty-' + n" class="gr-power-row gr-power-empty-row">
            <input
              v-model="getManualLine('primary', n - 1).text"
              type="text"
              class="gr-power-empty-input"
              placeholder=""
              autocomplete="off"
              @change="heroStore.pushHistory()"
            />
          </div>
        </div>
        <div v-else class="gr-powers-list">
          <div v-for="n in PRIMARY_POWERS_CAPACITY" :key="'p-empty-none-' + n" class="gr-power-row gr-power-empty-row">
            <input
              v-model="getManualLine('primary', n - 1).text"
              type="text"
              class="gr-power-empty-input"
              :placeholder="n === 1 ? 'Write or type powers and devices...' : ''"
              autocomplete="off"
              @change="heroStore.pushHistory()"
            />
          </div>
        </div>
      </div>

      <!-- Gear & Equipment -->
      <div v-if="uiStore.exportOptions.showEquipment" class="gr-card gr-gear-card">
        <span class="gr-card-title">GEAR &amp; EQUIPMENT</span>
        <div v-if="formattedEquipment.length" class="gr-gear-list">
          <div v-for="item in formattedEquipment.slice(0, 6)" :key="item.id || item.name" class="gr-gear-item-line">
            <strong class="gr-gear-name">{{ item.name }}</strong>
            <span class="gr-gear-ep">({{ item.cost }} EP)</span>
            <span v-if="item.tacticalSummary" class="gr-gear-stats">[{{ item.tacticalSummary }}]</span>
            <span v-else-if="item.desc" class="gr-gear-desc">: {{ item.desc }}</span>
          </div>
          <div v-if="formattedEquipment.length > 6" class="gr-gear-overflow-note">
            +{{ formattedEquipment.length - 6 }} more items detailed on Page 2
          </div>
        </div>
        <div v-else class="gr-empty-hint">
          No standard equipment or weapons equipped.
        </div>
      </div>

      <!-- Complications & Points -->
      <div class="gr-footer-layout">
        <!-- Complications (Left) -->
        <div v-if="uiStore.exportOptions.showComplications" class="gr-card gr-complications-card">
          <span class="gr-card-title">COMPLICATIONS</span>
          <div v-if="heroStore.character.complications?.length" class="gr-complications-content">
            <div v-for="c in heroStore.character.complications.slice(0, 3)" :key="c.id" class="gr-comp-line">
              <strong class="gr-comp-title">{{ c.name }}:</strong>
              <input
                v-model="c.desc"
                type="text"
                class="gr-comp-desc-input"
                placeholder="Complication description..."
                autocomplete="off"
                @change="heroStore.pushHistory()"
              />
            </div>
          </div>
          <div v-else class="gr-empty-hint">
            Motivation: Justice &amp; Responsibility. Add complications to award extra Hero Points during play.
          </div>
        </div>

        <!-- Power Points & Hero Points (Right) -->
        <div class="gr-points-col">
          <div class="gr-card gr-points-box">
            <span class="gr-points-title">POWER POINTS</span>
            <span class="gr-points-value">{{ heroStore.totalSpentPP }} / {{ heroStore.totalBudgetPP }}</span>
          </div>
          <div class="gr-card gr-points-box">
            <span class="gr-points-title">HERO POINTS</span>
            <span class="gr-points-value">{{ heroStore.character.heroPoints || 1 }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Page 2: Extended Overflow Sheet -->
    <div v-if="hasPage2Content" class="gr-page gr-page-2">
      <!-- Page 2 Header -->
      <header class="gr-card gr-page-2-header">
        <div style="display: flex; align-items: center; gap: 10px;">
          <img src="/mm-logo.png" alt="Mutants &amp; Masterminds" style="height: 30px; object-fit: contain;" />
          <span class="gr-page-2-title">DELUXE CHARACTER SHEET - PAGE 2</span>
        </div>
        <div style="font-size: 10.5px; font-weight: 900; color: #0f172a;">
          {{ heroStore.character.name || 'Hero' }} • PL {{ heroStore.character.powerLevel || 10 }}
        </div>
      </header>

      <div class="gr-page-2-content">
        <!-- Overflow Powers -->
        <div v-if="uiStore.exportOptions.showPowers" class="gr-card gr-overflow-powers">
          <span class="gr-card-title">POWERS &amp; DEVICES (CONTINUED)</span>
          <div v-if="overflowPowers.length" class="gr-powers-list">
            <div v-for="p in overflowPowers" :key="p.id" class="gr-power-entry">
              <!-- Power Header Row -->
              <div class="gr-power-row gr-power-heading-row">
                <strong class="gr-power-name">{{ p.name }}:</strong>
                <span v-if="getPowerBlock(p).structureBadge" class="gr-power-badge">{{ getPowerBlock(p).structureBadge }}</span>
                <span class="gr-power-main-effect">{{ getPowerBlock(p).mainLine }}</span>
                <span class="gr-power-cost-badge">{{ getPowerBlock(p).totalCost }} PP</span>
              </div>

              <!-- Mechanics Line (Action, Range, Duration, DC) -->
              <div v-if="uiStore.exportOptions.powerMechanics && getPowerBlock(p).mechanicsLine" class="gr-power-row gr-power-mechanics-line">
                <span class="gr-power-mech-text">{{ getPowerBlock(p).mechanicsLine }}</span>
              </div>

              <!-- Special Config or Modifiers -->
              <div v-if="(uiStore.exportOptions.powerMechanics && getPowerBlock(p).specialConfigLine) || getPowerBlock(p).modifiersLine" class="gr-power-row gr-power-detail-line">
                <span v-if="uiStore.exportOptions.powerMechanics && getPowerBlock(p).specialConfigLine" class="gr-power-config-text">{{ getPowerBlock(p).specialConfigLine }}</span>
                <span v-if="uiStore.exportOptions.powerMechanics && getPowerBlock(p).specialConfigLine && getPowerBlock(p).modifiersLine" class="gr-power-sep">•</span>
                <span v-if="getPowerBlock(p).modifiersLine" class="gr-power-mods-text">{{ getPowerBlock(p).modifiersLine }}</span>
              </div>

              <!-- Rule description -->
              <div
                v-if="uiStore.exportOptions.effectRules"
                v-for="(descLine, dIdx) in (getPowerBlock(p).effectRuleDescs?.length ? getPowerBlock(p).effectRuleDescs : [getPowerBlock(p).effectRuleDesc].filter(Boolean))"
                :key="'p2-desc-' + dIdx"
                class="gr-power-row gr-power-rule-desc"
              >
                <strong class="gr-effect-rule-name">
                  {{ dIdx === 0 ? (getPowerBlock(p).effectBaseName || 'Effect') + ':' : '•' }}
                </strong>
                <span class="gr-power-rule-text">{{ descLine }}</span>
              </div>

              <!-- Applied modifiers -->
              <template v-if="uiStore.exportOptions.modifierRules" v-for="(modRule, mIdx) in getPowerBlock(p).modifierRules" :key="'p2-mod-' + mIdx">
                <div
                  v-for="(line, lIdx) in (modRule.lines?.length ? modRule.lines : [modRule.desc])"
                  :key="'p2-mod-' + mIdx + '-l-' + lIdx"
                  class="gr-power-row gr-power-mod-rule"
                  :class="{ 'gr-mod-rule-continuation-row': lIdx > 0 }"
                >
                  <span v-if="lIdx === 0" class="gr-mod-rule-bullet">•</span>
                  <span v-else class="gr-mod-rule-indent"></span>
                  <strong v-if="lIdx === 0" class="gr-mod-rule-name">{{ modRule.name }}:</strong>
                  <span class="gr-mod-rule-text">{{ line }}</span>
                </div>
              </template>

              <!-- Nested effect systems -->
              <template v-for="(sub, sIdx) in getPowerBlock(p).subEntries" :key="sIdx">
                <div class="gr-power-row gr-power-sub-entry" :class="{ 'gr-power-linked-row': sub.isLinked }">
                  <span v-if="!sub.isLinked" class="gr-sub-bullet">•</span>
                  <strong class="gr-sub-label">{{ sub.label }}:</strong>
                  <span class="gr-sub-details">{{ sub.details || sub.effectName }}</span>
                  <span v-if="sub.costBadge" class="gr-sub-cost-badge">{{ sub.costBadge }}</span>
                </div>
                <div
                  v-if="uiStore.exportOptions.effectRules"
                  v-for="(subDesc, sdIdx) in (sub.effectRuleDescs?.length ? sub.effectRuleDescs : [sub.effectRuleDesc].filter(Boolean))"
                  :key="'p2-subdesc-' + sIdx + '-' + sdIdx"
                  class="gr-power-row gr-power-sub-rule-desc"
                  :class="{ 'gr-power-linked-rule-desc': sub.isLinked }"
                >
                  <strong class="gr-effect-rule-name">
                    {{ sdIdx === 0 ? (sub.effectBaseName || 'Effect') + ':' : '•' }}
                  </strong>
                  <span class="gr-power-rule-text">{{ subDesc }}</span>
                </div>
                <template v-if="uiStore.exportOptions.modifierRules" v-for="(smRule, smIdx) in sub.modifierRules" :key="'p2-submod-' + sIdx + '-' + smIdx">
                  <div
                    v-for="(sLine, slIdx) in (smRule.lines?.length ? smRule.lines : [smRule.desc])"
                    :key="'p2-submod-' + sIdx + '-' + smIdx + '-l-' + slIdx"
                    class="gr-power-row gr-power-sub-mod-rule"
                    :class="{ 'gr-mod-rule-continuation-row': slIdx > 0, 'gr-power-linked-mod-rule': sub.isLinked }"
                  >
                    <span v-if="slIdx === 0" class="gr-mod-rule-bullet">•</span>
                    <span v-else class="gr-mod-rule-indent"></span>
                    <strong v-if="slIdx === 0" class="gr-mod-rule-name">{{ smRule.name }}:</strong>
                    <span class="gr-mod-rule-text">{{ sLine }}</span>
                  </div>
                </template>
              </template>
            </div>
            <!-- Ruled lines filling Page 2 capacity for manual filling -->
            <div v-for="n in emptyOverflowLinesCount" :key="'o-empty-' + n" class="gr-power-row gr-power-empty-row">
              <input
                v-model="getManualLine('overflow', n - 1).text"
                type="text"
                class="gr-power-empty-input"
                placeholder=""
                autocomplete="off"
                @change="heroStore.pushHistory()"
              />
            </div>
          </div>
          <div v-else class="gr-powers-list">
            <div v-for="n in OVERFLOW_POWERS_CAPACITY" :key="'o-empty-none-' + n" class="gr-power-row gr-power-empty-row">
              <input
                v-model="getManualLine('overflow', n - 1).text"
                type="text"
                class="gr-power-empty-input"
                :placeholder="n === 1 ? 'Continued powers and device notes...' : ''"
                autocomplete="off"
                @change="heroStore.pushHistory()"
              />
            </div>
          </div>
        </div>

        <!-- Overflow Equipment & Vehicles -->
        <div v-if="uiStore.exportOptions.showEquipment" class="gr-card gr-overflow-equipment">
          <span class="gr-card-title">EQUIPMENT, WEAPONS &amp; VEHICLES (DETAILED SPECIFICATIONS)</span>
          <div v-if="equipmentCategories.length" class="gr-equipment-cat-list">
            <div v-for="cat in equipmentCategories" :key="cat.key" class="gr-equipment-cat-block">
              <div class="gr-equipment-cat-header">
                <span class="gr-cat-title">{{ cat.label }}</span>
                <span class="gr-cat-ep font-mono">{{ cat.totalEP }} EP</span>
              </div>
              <div class="gr-equipment-cat-items">
                <div v-for="item in cat.items" :key="item.id || item.name" class="gr-equipment-detail-item">
                  <div class="gr-item-headline">
                    <strong class="gr-item-name">{{ item.name }}</strong>
                    <span class="gr-item-cost">({{ item.cost }} EP)</span>
                    <span class="gr-item-status" :class="'status-' + (item.status || 'equipped')">[{{ item.statusLabel }}]</span>
                  </div>
                  <div v-if="item.tacticalSummary" class="gr-item-stats">
                    <strong>Stats:</strong> {{ item.tacticalSummary }}
                  </div>
                  <div v-if="item.desc" class="gr-item-desc">
                    {{ item.desc }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="gr-empty-hint">
            No equipment or vehicles registered.
          </div>
        </div>

        <!-- Background & Full Complications -->
        <div v-if="uiStore.exportOptions.showNotes || uiStore.exportOptions.showComplications" class="gr-card gr-overflow-bio">
          <span class="gr-card-title">HERO BACKGROUND &amp; COMPLICATIONS DETAIL</span>
          <div class="gr-bio-edit-wrap">
            <div v-if="uiStore.exportOptions.showNotes" style="margin-bottom: 8px;">
              <label class="gr-bio-heading" for="gr-bio-tactics">
                <strong>Background Story &amp; Tactics:</strong>
              </label>
              <textarea
                id="gr-bio-tactics"
                v-model="heroStore.character.notes"
                class="gr-bio-textarea"
                placeholder="Hero background, origin story, motivations, and tactical combat profile..."
                rows="4"
                @change="heroStore.pushHistory()"
              ></textarea>
            </div>
            <div v-if="uiStore.exportOptions.showComplications && heroStore.character.complications?.length">
              <strong style="color: #0f172a;">All Complications:</strong>
              <div v-for="c in heroStore.character.complications" :key="c.id" class="gr-comp-detail-row">
                <strong class="gr-comp-name">• {{ c.name }}:</strong>
                <input
                  v-model="c.desc"
                  type="text"
                  class="gr-comp-desc-input"
                  placeholder="Complication description..."
                  @change="heroStore.pushHistory()"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useHeroStore } from '../../stores/heroStore.js';
import { useUiStore } from '../../stores/uiStore.js';
import { compileTargetedAttacks } from '../../rules/attacks.js';
import { calculatePowerTotalCost } from '../../rules/powerEngine.js';
import { formatPowerStatblock } from '../../rules/powerFormatter.js';
import { getAllCharacterSkills, formatMod, getSkillAbility, formatEquipmentItem } from '../../utils/exporters/helpers.js';

const heroStore = useHeroStore();
const uiStore = useUiStore();

// Equipment compilation
const formattedEquipment = computed(() => {
  const raw = heroStore.character.resources || [];
  return raw.map(r => formatEquipmentItem(r, heroStore)).filter(Boolean);
});

const equipmentCategories = computed(() => {
  const defs = [
    { key: 'weapon', label: 'Weapons' },
    { key: 'armor', label: 'Armor & Shields' },
    { key: 'vehicle', label: 'Vehicles' },
    { key: 'hq', label: 'Headquarters' },
    { key: 'gadget', label: 'Gadgets & Gear' }
  ];
  return defs.map(cat => {
    const items = formattedEquipment.value.filter(r => r.categoryKey === cat.key);
    return {
      key: cat.key,
      label: cat.label,
      items,
      totalEP: items.reduce((sum, r) => sum + r.cost, 0)
    };
  }).filter(g => g.items.length > 0);
});

// Attacks compilation (exactly 3 rows on Page 1)
const compiledAttacks = computed(() => {
  return compileTargetedAttacks(
    heroStore.character,
    heroStore.effectiveAbilities,
    (name) => heroStore.getAdvantageRanks(name)
  );
});

const displayAttacks = computed(() => {
  return (compiledAttacks.value || []).slice(0, 3);
});

// Trained Skills
const trainedSkills = computed(() => {
  const skills = heroStore.character.skills || [];
  return skills
    .filter(sk => (Number(sk.ranks) || 0) > 0 || sk.subtype)
    .map(sk => {
      const abl = getSkillAbility(sk.name);
      const isAbsent = heroStore.isAbilityAbsent(abl);
      const ablMod = isAbsent ? null : (heroStore.effectiveAbilities[abl] || 0);
      const total = isAbsent ? null : ((Number(sk.ranks) || 0) + ablMod);
      let displayName = sk.name;
      if (sk.subtype) {
        // Clean compact specialty display
        displayName = `${sk.name}: ${sk.subtype}`;
      }
      return {
        id: sk.id || sk.name,
        displayName,
        abilityCode: abl,
        ranks: sk.ranks || 0,
        totalBonus: total
      };
    });
});

// Display Skills (handles All 16 Core Skills vs Trained Only switch)
const displaySkills = computed(() => {
  if (uiStore.exportOptions.skillsMode === 'all') {
    return getAllCharacterSkills(heroStore.character, heroStore).map((sk, idx) => ({
      id: sk.id || `${sk.name}-${sk.subtype || idx}`,
      displayName: sk.displayName,
      abilityCode: sk.abilityCode,
      ranks: sk.ranks,
      totalBonus: sk.totalBonus
    }));
  }
  return trainedSkills.value;
});

function getPowerBlock(power) {
  return formatPowerStatblock(power, { powerMechanics: uiStore.exportOptions.powerMechanics });
}

// Layout row limits for A4 page budget
const PRIMARY_POWERS_CAPACITY = 25;
const OVERFLOW_POWERS_CAPACITY = 24;

function getManualLine(section, index) {
  if (!heroStore.character.manualPowers) {
    heroStore.character.manualPowers = { primary: [], overflow: [] };
  }
  if (!Array.isArray(heroStore.character.manualPowers[section])) {
    heroStore.character.manualPowers[section] = [];
  }
  while (heroStore.character.manualPowers[section].length <= index) {
    heroStore.character.manualPowers[section].push({ text: '' });
  }
  return heroStore.character.manualPowers[section][index];
}

function getPowerRowCount(power) {
  if (!power) return 0;
  const block = getPowerBlock(power);
  let count = 1;
  if (uiStore.exportOptions.powerMechanics && block.mechanicsLine) count += 1;
  if ((uiStore.exportOptions.powerMechanics && block.specialConfigLine) || block.modifiersLine) count += 1;
  if (uiStore.exportOptions.effectRules) {
    count += (block.effectRuleDescs?.length || (block.effectRuleDesc ? 1 : 0));
  }
  if (uiStore.exportOptions.modifierRules) {
    for (const mr of (block.modifierRules || [])) {
      count += (mr.lines?.length || 1);
    }
  }
  for (const sub of (block.subEntries || [])) {
    count += 1;
    if (uiStore.exportOptions.effectRules) {
      count += (sub.effectRuleDescs?.length || (sub.effectRuleDesc ? 1 : 0));
    }
    if (uiStore.exportOptions.modifierRules) {
      for (const smr of (sub.modifierRules || [])) {
        count += (smr.lines?.length || 1);
      }
    }
  }
  return count;
}

// Powers splitting for adaptive 1 vs 2 pages
const allPowers = computed(() => heroStore.character.powers || []);

const totalPowerRows = computed(() => {
  return allPowers.value.reduce((sum, p) => sum + getPowerRowCount(p), 0);
});

const primaryPowers = computed(() => {
  const powers = allPowers.value;
  if (!powers.length) return [];
  // If all powers fit on Page 1, keep them all on Page 1
  if (totalPowerRows.value <= PRIMARY_POWERS_CAPACITY) {
    return powers;
  }
  const result = [];
  let currentRows = 0;
  for (const p of powers) {
    const rows = getPowerRowCount(p);
    if (result.length > 0 && currentRows + rows > PRIMARY_POWERS_CAPACITY) {
      break;
    }
    result.push(p);
    currentRows += rows;
  }
  return result;
});

const overflowPowers = computed(() => {
  const powers = allPowers.value;
  const primaryCount = primaryPowers.value.length;
  return powers.slice(primaryCount);
});

const primaryRowsCount = computed(() => {
  return primaryPowers.value.reduce((sum, p) => sum + getPowerRowCount(p), 0);
});

const emptyPrimaryLinesCount = computed(() => {
  return Math.max(0, PRIMARY_POWERS_CAPACITY - primaryRowsCount.value);
});

const overflowRowsCount = computed(() => {
  return overflowPowers.value.reduce((sum, p) => sum + getPowerRowCount(p), 0);
});

const emptyOverflowLinesCount = computed(() => {
  return Math.max(0, OVERFLOW_POWERS_CAPACITY - overflowRowsCount.value);
});

const hasPage2Content = computed(() => {
  return (
    Boolean(uiStore.alwaysIncludePage2) ||
    (uiStore.exportOptions.showPowers && overflowPowers.value.length > 0) ||
    (uiStore.exportOptions.showEquipment && (heroStore.character.resources?.length || 0) > 4) ||
    (uiStore.exportOptions.showNotes && (heroStore.character.notes?.length || 0) > 160) ||
    (uiStore.exportOptions.showComplications && (heroStore.character.complications?.length || 0) > 3)
  );
});
</script>
