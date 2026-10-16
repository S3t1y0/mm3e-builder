<template>
  <Teleport to="body">
    <transition name="drawer-fade">
      <div
        v-if="isOpen"
        class="inspector-overlay-backdrop"
        @click.self="close"
        aria-hidden="true"
      ></div>
    </transition>

    <transition name="drawer-slide">
      <aside
        v-if="isOpen"
        class="inspector-sliding-drawer"
        :class="`inspector-type-${currentType}`"
        role="dialog"
        :aria-label="title || 'Detail Inspector'"
        aria-modal="false"
      >
        <!-- Top Drawer Header Ribbon -->
        <header class="drawer-header-ribbon">
          <div class="drawer-header-left">
            <span v-if="currentType !== 'ability' && currentType !== 'skill' && currentType !== 'defense'" class="drawer-type-badge" :class="badgeClass">
              <i :class="typeIcon"></i>
              <span>{{ typeLabel }}</span>
            </span>
            <div class="drawer-titles-wrap" :class="{ 'is-ability-title': currentType === 'ability' || currentType === 'skill' || currentType === 'defense' }">
              <div v-if="currentType === 'ability'" class="ability-title-row">
                <i :class="currentAbilityIcon" class="ability-title-icon" aria-hidden="true"></i>
                <h3 class="drawer-main-title">{{ title }}</h3>
              </div>
              <div v-else-if="currentType === 'skill'" class="ability-title-row">
                <i :class="currentSkillIcon" class="ability-title-icon skill-accent-icon" aria-hidden="true"></i>
                <div class="skill-title-block">
                  <h3 class="drawer-main-title">{{ title }}</h3>
                  <div class="skill-header-tags">
                    <span class="skill-header-ab-tag" :class="`ab-${(skAbilityKey || 'agl').toLowerCase()}`">{{ skAbilityKey }}</span>
                    <span class="skill-header-cat-tag">{{ skCategory }} Skill</span>
                  </div>
                </div>
              </div>
              <div v-else-if="currentType === 'defense'" class="ability-title-row">
                <i :class="currentDefenseIcon" class="ability-title-icon def-accent-icon" aria-hidden="true"></i>
                <div class="skill-title-block">
                  <h3 class="drawer-main-title">{{ title }}</h3>
                  <div class="skill-header-tags">
                    <span class="skill-header-ab-tag" :class="`ab-${(defBaseAbility || 'agl').toLowerCase()}`">{{ defBaseAbility }}</span>
                    <span class="skill-header-cat-tag">{{ defEditorial.type }}</span>
                  </div>
                </div>
              </div>
              <h3 v-else class="drawer-main-title">{{ title }}</h3>
              <span v-if="subtitle && currentType !== 'skill' && currentType !== 'defense'" class="drawer-sub-title">{{ subtitle }}</span>
            </div>
          </div>

          <div class="drawer-header-actions">
            <button
              type="button"
              class="btn-drawer-close"
              @click="close"
              aria-label="Close detail inspector"
            >
              <i class="ri-close-line"></i>
            </button>
          </div>
        </header>

        <!-- Scrollable Body with Overscroll Containment -->
        <div ref="scrollerRef" class="drawer-body-scroller">
          <!-- 0. ABILITY INSPECTOR -->
          <!-- 0. ABILITY INSPECTOR (D&D BEYOND VERTICAL ARCHITECTURE) -->
          <div v-if="currentType === 'ability' && data" class="inspector-content-pane ability-view">
            <!-- Vertical Tactical Ledger Table -->
            <div class="dndb-stat-ledger">
              <div class="ledger-row is-total-row">
                <span class="ledger-label">Total Modifier</span>
                <span class="ledger-val font-mono text-amber">
                  {{ isAbilityAbsent ? 'Absent (-)' : formatModifier(abTotalRank) }}
                </span>
              </div>

              <div class="ledger-row">
                <span class="ledger-label">Base Rank</span>
                <div class="ledger-val">
                  <div class="stepper-actions">
                    <button
                      type="button"
                      class="step-btn"
                      :disabled="isAbilityAbsent"
                      @click="decrementBaseRank"
                      aria-label="Decrease base rank"
                    >-</button>
                    <span class="rank-display font-mono">{{ isAbilityAbsent ? '-' : abBaseRank }}</span>
                    <button
                      type="button"
                      class="step-btn"
                      :disabled="isAbilityAbsent"
                      @click="incrementBaseRank"
                      aria-label="Increase base rank"
                    >+</button>
                  </div>
                </div>
              </div>

              <div class="ledger-row" :class="{ 'has-bonus': !isAbilityAbsent && abEnhancedRanks > 0 }">
                <span class="ledger-label">Bonus (Powers)</span>
                <span class="ledger-val font-mono" :class="abEnhancedRanks > 0 ? 'text-cyan' : 'text-muted'">
                  {{ isAbilityAbsent ? '-' : (abEnhancedRanks > 0 ? `+${abEnhancedRanks}` : '+0') }}
                </span>
              </div>

              <div class="ledger-row">
                <span class="ledger-label">Power Point Cost</span>
                <span class="ledger-val font-mono" :class="{ 'text-emerald': isAbilityAbsent }">
                  {{ isAbilityAbsent ? '-10 PP' : `${abPPSpent} PP` }}
                </span>
              </div>

              <div class="ledger-row ledger-row-status">
                <span class="ledger-label">Trait Status</span>
                <div class="ledger-val">
                  <button
                    type="button"
                    class="btn-absent-toggle"
                    :class="{ active: isAbilityAbsent }"
                    @click="toggleAbsent"
                  >
                    <i :class="isAbilityAbsent ? 'ri-alert-fill' : 'ri-checkbox-blank-circle-line'"></i>
                    <span>{{ isAbilityAbsent ? 'Absent (Restore)' : 'Set Absent' }}</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Red / Coral Accent Divider Rule like D&D Beyond -->
            <div class="dndb-ledger-divider" role="separator"></div>

            <!-- Primary Roll Action Button -->
            <div class="dndb-primary-action-wrap">
              <button
                type="button"
                class="btn-dndb-roll-action"
                :disabled="isAbilityAbsent"
                @click="rollAbilityCheck"
              >
                <i class="ri-dice-line"></i>
                <span>Roll {{ abName }} Check (d20{{ isAbilityAbsent ? '' : (abTotalRank >= 0 ? '+' + abTotalRank : abTotalRank) }})</span>
              </button>
            </div>

            <!-- Editorial Lore & Tabletop Rules Section (D&D Beyond Style) -->
            <div class="dndb-editorial-content">
              <!-- Core Overview Paragraph -->
              <p class="editorial-overview">
                {{ abEditorial.overview || abDesc }}
              </p>

              <!-- Ability Checks Explanation -->
              <div class="editorial-section">
                <h4 class="editorial-heading">
                  <i class="ri-focus-2-line"></i> {{ abEditorial.checksHeading || `${abName} Checks` }}
                </h4>
                <p class="editorial-prose">
                  {{ abEditorial.checks }}
                </p>
              </div>

              <!-- Special STR Benchmarks if STR -->
              <div v-if="abKey === 'STR'" class="editorial-section">
                <h4 class="editorial-heading">
                  <i class="ri-weight-line"></i> Lifting & Carrying Capacity
                </h4>
                <div class="str-benchmarks-card">
                  <div class="bm-row">
                    <span class="bm-label">Max Load (Heavy):</span>
                    <strong class="bm-val font-mono text-cyan">{{ strLiftingCapacity }}</strong>
                  </div>
                  <div class="bm-row">
                    <span class="bm-label">Melee Damage DC:</span>
                    <strong class="bm-val font-mono text-amber">DC {{ 15 + abTotalRank }} vs Toughness</strong>
                  </div>
                  <p class="bm-note">
                    Based on the M&M 3e Measurements Table. Lifting loads above maximum requires extra effort or power stunts.
                  </p>
                </div>
              </div>

              <!-- Linked Defenses Breakdown -->
              <div v-if="abLinkedDefensesWithValues.length" class="editorial-section">
                <h4 class="editorial-heading">
                  <i class="ri-shield-check-line"></i> Linked Defenses
                </h4>
                <div class="editorial-sub-list">
                  <article
                    v-for="def in abLinkedDefensesWithValues"
                    :key="def.name"
                    class="editorial-sub-card"
                  >
                    <header class="sub-card-header">
                      <strong class="sub-card-title">{{ def.name }} Defense</strong>
                      <span class="sub-card-badge def-badge font-mono">{{ def.currentValue }}</span>
                    </header>
                    <p class="sub-card-prose">{{ def.desc }}</p>
                  </article>
                </div>
              </div>

              <!-- Combat Initiative Breakdown if AGL -->
              <div v-if="abKey === 'AGL'" class="editorial-section">
                <h4 class="editorial-heading">
                  <i class="ri-timer-line"></i> Combat Initiative
                </h4>
                <div class="editorial-sub-list">
                  <article class="editorial-sub-card">
                    <header class="sub-card-header">
                      <strong class="sub-card-title">Initiative</strong>
                      <span class="sub-card-badge def-badge font-mono">{{ formatModifier(heroStore.initiativeTotal) }}</span>
                    </header>
                    <p class="sub-card-prose">
                      Sets turn order at the start of combat (1d20 + Agility rank + any Improved Initiative ranks).
                    </p>
                  </article>
                </div>
              </div>

              <!-- Governed Skills Breakdown -->
              <div v-if="abLinkedSkillsWithValues.length" class="editorial-section">
                <h4 class="editorial-heading">
                  <i class="ri-award-line"></i> Governed Skills
                </h4>
                <div class="editorial-sub-list">
                  <article
                    v-for="sk in abLinkedSkillsWithValues"
                    :key="sk.name"
                    class="editorial-sub-card"
                  >
                    <header class="sub-card-header">
                      <strong class="sub-card-title">{{ sk.name }}</strong>
                      <span class="sub-card-badge skill-badge font-mono">{{ sk.currentBonus }}</span>
                    </header>
                    <p class="sub-card-prose">{{ sk.desc }}</p>
                  </article>
                </div>
              </div>
            </div>

            <!-- Action Buttons Footer -->
            <div class="drawer-actions-strip">
              <button
                type="button"
                class="btn-drawer-action btn-broadcast"
                @click="broadcastAbility"
              >
                <i class="ri-broadcast-line"></i>
                <span>Broadcast to Roll20</span>
              </button>
            </div>
          </div>

          <!-- 0.5 SKILL INSPECTOR (D&D BEYOND VERTICAL ARCHITECTURE) -->
          <div v-else-if="currentType === 'skill' && data" class="inspector-content-pane skill-view">
            <!-- Meta Tags Strip: Action Type, Trained Status, Trait Tags -->
            <div class="skill-meta-tags-strip">
              <span class="skill-meta-tag is-action">
                <i class="ri-time-line"></i> {{ skillActionType }}
              </span>
              <span v-if="isSkillUntrainedLocked" class="skill-meta-tag is-locked">
                <i class="ri-lock-line"></i> Trained Only (Locked)
              </span>
              <span v-else-if="isTrainedOnly && uiStore.bypassTrainedOnly && !isSkillTrained && !hasJackOfAllTrades" class="skill-meta-tag is-bypassed">
                <i class="ri-lock-unlock-line"></i> Untrained (Bypassed)
              </span>
              <span v-else-if="isTrainedOnly && hasJackOfAllTrades && !isSkillTrained" class="skill-meta-tag is-jack">
                <i class="ri-shield-check-line"></i> Jack-of-all-Trades
              </span>
              <span v-else-if="isTrainedOnly" class="skill-meta-tag is-trained-req">
                <i class="ri-checkbox-circle-line"></i> Trained Only
              </span>
              <span v-else class="skill-meta-tag is-open">
                <i class="ri-check-line"></i> Usable Untrained
              </span>
              <span
                v-for="tr in skillTraits.filter(t => t !== 'Trained Only')"
                :key="tr"
                class="skill-meta-tag is-trait"
              >
                {{ tr }}
              </span>
            </div>

            <!-- Trained Only Lock Banner if Untrained Locked -->
            <div v-if="isSkillUntrainedLocked" class="skill-lock-callout">
              <div class="callout-icon-wrap"><i class="ri-lock-2-line"></i></div>
              <div class="callout-content">
                <strong class="callout-title">Trained Only Skill</strong>
                <p class="callout-text">
                  Official M&M 3e rules require at least 1 rank to attempt this skill. Untrained attempts automatically fail unless your hero possesses the <em>Jack-of-all-Trades</em> advantage.
                </p>
                <div class="callout-bypass-action">
                  <button
                    type="button"
                    class="btn-callout-bypass"
                    @click="uiStore.toggleBypassTrainedOnly(true)"
                  >
                    <i class="ri-lock-unlock-line"></i>
                    <span>Bypass Trained Only Restriction</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Vertical Tactical Ledger Table -->
            <div class="dndb-stat-ledger">
              <div class="ledger-row is-total-row">
                <span class="ledger-label">Total Modifier</span>
                <span class="ledger-val font-mono text-amber">
                  {{ isSkillAbsent ? 'Absent (-)' : formatModifier(skTotalBonus) }}
                </span>
              </div>

              <div class="ledger-row">
                <div class="ledger-label-wrap">
                  <span class="ledger-label">Governing Ability</span>
                  <span class="ledger-sub">{{ skAbilityName }} ({{ skAbilityKey }})</span>
                </div>
                <span class="ledger-val font-mono" :class="skAbilityMod >= 0 ? 'text-amber' : 'text-danger'">
                  {{ isSkillAbsent ? '-' : formatModifier(skAbilityMod) }}
                </span>
              </div>

              <div class="ledger-row">
                <span class="ledger-label">Base Rank</span>
                <div class="ledger-val">
                  <div class="stepper-actions">
                    <button
                      type="button"
                      class="step-btn"
                      :disabled="isSkillAbsent || skBaseRanks <= 0"
                      @click="decrementSkillRank"
                      aria-label="Decrease base skill rank"
                    >-</button>
                    <span class="rank-display font-mono">{{ isSkillAbsent ? '-' : skBaseRanks }}</span>
                    <button
                      type="button"
                      class="step-btn"
                      :disabled="isSkillAbsent"
                      @click="incrementSkillRank"
                      aria-label="Increase base skill rank"
                    >+</button>
                  </div>
                </div>
              </div>

              <div class="ledger-row" :class="{ 'has-bonus': !isSkillAbsent && skEnhancedRanks > 0 }">
                <span class="ledger-label">Bonus (Powers)</span>
                <span class="ledger-val font-mono" :class="skEnhancedRanks > 0 ? 'text-cyan' : 'text-muted'">
                  {{ isSkillAbsent ? '-' : (skEnhancedRanks > 0 ? `+${skEnhancedRanks}` : '+0') }}
                </span>
              </div>

              <div class="ledger-row" :class="{ 'has-bonus': !isSkillAbsent && skAdvantageBonus > 0 }">
                <div class="ledger-label-wrap">
                  <span class="ledger-label">Bonus (Advantages)</span>
                  <span v-if="skAdvantageName" class="ledger-sub">{{ skAdvantageName }}</span>
                </div>
                <span class="ledger-val font-mono" :class="skAdvantageBonus > 0 ? 'text-cyan' : 'text-muted'">
                  {{ isSkillAbsent ? '-' : (skAdvantageBonus > 0 ? `+${skAdvantageBonus}` : '+0') }}
                </span>
              </div>

              <div class="ledger-row" :class="{ 'has-penalty': !isSkillAbsent && skConditionPenalty !== 0 }">
                <div class="ledger-label-wrap">
                  <span class="ledger-label">Condition Penalty</span>
                  <span v-if="skConditionPenalty !== 0" class="ledger-sub">
                    {{ heroStore.conditionModifiers.isDisabled ? 'Disabled' : 'Impaired' }}
                  </span>
                </div>
                <span class="ledger-val font-mono" :class="skConditionPenalty !== 0 ? 'text-danger' : 'text-muted'">
                  {{ isSkillAbsent ? '-' : (skConditionPenalty !== 0 ? `${skConditionPenalty}` : '0') }}
                </span>
              </div>

              <div class="ledger-row">
                <span class="ledger-label">Power Point Cost</span>
                <span class="ledger-val font-mono text-emerald">
                  {{ isSkillAbsent ? '0 PP' : `${skPPCost} PP` }}
                </span>
              </div>

              <div class="ledger-row ledger-row-status">
                <span class="ledger-label">Training Status</span>
                <div class="ledger-val">
                  <span
                    class="skill-train-pill"
                    :class="isSkillTrained ? 'is-trained' : (uiStore.bypassTrainedOnly && isTrainedOnly ? 'is-bypassed' : 'is-untrained')"
                  >
                    <i :class="isSkillTrained ? 'ri-checkbox-circle-fill' : (uiStore.bypassTrainedOnly && isTrainedOnly ? 'ri-lock-unlock-line' : 'ri-record-circle-line')"></i>
                    <span>{{ isSkillTrained ? 'Trained' : (uiStore.bypassTrainedOnly && isTrainedOnly ? 'Untrained (Bypassed)' : 'Untrained') }}</span>
                  </span>
                </div>
              </div>
            </div>

            <!-- Red / Coral Accent Divider Rule like D&D Beyond -->
            <div class="dndb-ledger-divider" role="separator"></div>

            <!-- Primary Roll Action Button -->
            <div class="dndb-primary-action-wrap">
              <button
                v-if="isSkillUntrainedLocked"
                type="button"
                class="btn-dndb-roll-action is-locked-btn"
                @click="handleLockedRoll"
              >
                <i class="ri-lock-line"></i>
                <span>Trained Only (Requires Ranks or Jack-of-all-Trades)</span>
              </button>
              <button
                v-else
                type="button"
                class="btn-dndb-roll-action"
                :disabled="isSkillAbsent || (skName === 'Close Combat' && heroStore.conditionModifiers.cannotCloseAttack)"
                @click="rollSkillCheck"
              >
                <i class="ri-dice-line"></i>
                <span>Roll {{ skDisplayName }} Check (d20{{ isSkillAbsent ? '' : (skTotalBonus >= 0 ? '+' + skTotalBonus : skTotalBonus) }})</span>
              </button>
            </div>

            <!-- Editorial Lore & Tabletop Rules Section (D&D Beyond Style) -->
            <div class="dndb-editorial-content">
              <!-- Core Overview Paragraph -->
              <p class="editorial-overview">
                {{ skEditorial.overview || skDesc }}
              </p>

              <!-- Routine Checks Card -->
              <div v-if="skEditorial.routine" class="editorial-section">
                <h4 class="editorial-heading">
                  <i class="ri-checkbox-circle-line"></i> Routine Checks (Take 10)
                </h4>
                <p class="editorial-prose">{{ skEditorial.routine }}</p>
              </div>

              <!-- Difficulty Class Benchmark Table -->
              <div v-if="skEditorial.dcTable?.length" class="editorial-section">
                <h4 class="editorial-heading">
                  <i class="ri-table-line"></i> Difficulty Benchmark (DC)
                </h4>
                <div class="skill-dc-table-wrap">
                  <table class="skill-dc-table">
                    <thead>
                      <tr>
                        <th class="col-dc">DC</th>
                        <th class="col-difficulty">Difficulty</th>
                        <th class="col-example">Example / Circumstance</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="row in skEditorial.dcTable" :key="row.dc">
                        <td class="col-dc">
                          <span class="skill-dc-badge font-mono">{{ row.dc.startsWith('DC') || row.dc === 'Opp' || row.dc === 'Def' ? row.dc : `DC ${row.dc}` }}</span>
                        </td>
                        <td class="col-difficulty">{{ row.label }}</td>
                        <td class="col-example">{{ row.example }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Sub-Table: Athletics Jumping Distance -->
              <div v-if="skEditorial.jumpTable?.length" class="editorial-section">
                <h4 class="editorial-heading">
                  <i class="ri-arrow-up-circle-line"></i> Jumping Distance Formulas
                </h4>
                <div class="skill-dc-table-wrap">
                  <table class="skill-dc-table">
                    <thead>
                      <tr>
                        <th style="width: 140px;">Jump Type</th>
                        <th style="width: 140px;">Formula</th>
                        <th>Example / Distance</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="j in skEditorial.jumpTable" :key="j.type">
                        <td class="font-semibold text-white">{{ j.type }}</td>
                        <td class="font-mono text-cyan">{{ j.formula }}</td>
                        <td class="text-muted text-xs">{{ j.example }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Sub-Table: Athletics Climbing Surface Difficulties -->
              <div v-if="skEditorial.climbTable?.length" class="editorial-section">
                <h4 class="editorial-heading">
                  <i class="ri-compass-discover-line"></i> Climbing Terrain & Catching Falls
                </h4>
                <div class="skill-dc-table-wrap">
                  <table class="skill-dc-table">
                    <thead>
                      <tr>
                        <th>Surface / Condition</th>
                        <th style="width: 110px;">DC</th>
                        <th style="width: 130px;">Climbing Pace</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="c in skEditorial.climbTable" :key="c.surface">
                        <td class="font-semibold text-white">{{ c.surface }}</td>
                        <td class="font-mono text-amber">{{ c.dc }}</td>
                        <td class="text-muted text-xs">{{ c.speed }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Sub-Table: Acrobatics Balancing Difficulties -->
              <div v-if="skEditorial.balanceTable?.length" class="editorial-section">
                <h4 class="editorial-heading">
                  <i class="ri-scales-line"></i> Balancing Hazards & Vulnerability
                </h4>
                <div class="skill-dc-table-wrap">
                  <table class="skill-dc-table">
                    <thead>
                      <tr>
                        <th>Footing / Surface</th>
                        <th style="width: 90px;">DC</th>
                        <th>Condition Effect</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="b in skEditorial.balanceTable" :key="b.surface">
                        <td class="font-semibold text-white">{{ b.surface }}</td>
                        <td class="font-mono text-amber">{{ b.dc }}</td>
                        <td class="text-muted text-xs">{{ b.effect }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Sub-Table: Deception Circumstance Modifiers -->
              <div v-if="skEditorial.modifierTable?.length" class="editorial-section">
                <h4 class="editorial-heading">
                  <i class="ri-scales-3-line"></i> Lie Plausibility & Modifiers
                </h4>
                <div class="skill-dc-table-wrap">
                  <table class="skill-dc-table">
                    <thead>
                      <tr>
                        <th>Circumstance / Situation</th>
                        <th style="width: 90px;">Mod</th>
                        <th>Tactical Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="m in skEditorial.modifierTable" :key="m.situation">
                        <td class="font-semibold text-white">{{ m.situation }}</td>
                        <td class="font-mono" :class="m.mod.includes('-') ? 'text-emerald' : 'text-danger'">{{ m.mod }}</td>
                        <td class="text-muted text-xs">{{ m.note }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Sub-Table: Deception Disguise Familiarity -->
              <div v-if="skEditorial.disguiseTable?.length" class="editorial-section">
                <h4 class="editorial-heading">
                  <i class="ri-user-search-line"></i> Disguise Observer Familiarity
                </h4>
                <div class="skill-dc-table-wrap">
                  <table class="skill-dc-table">
                    <thead>
                      <tr>
                        <th>Observer Relationship</th>
                        <th style="width: 80px;">Bonus</th>
                        <th>Detection Detail</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="d in skEditorial.disguiseTable" :key="d.observer">
                        <td class="font-semibold text-white">{{ d.observer }}</td>
                        <td class="font-mono text-cyan">{{ d.bonus }}</td>
                        <td class="text-muted text-xs">{{ d.note }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Sub-Table: Insight Mental & Illusion Detection -->
              <div v-if="skEditorial.mentalTable?.length" class="editorial-section">
                <h4 class="editorial-heading">
                  <i class="ri-brain-line"></i> Mental Detection Difficulties
                </h4>
                <div class="skill-dc-table-wrap">
                  <table class="skill-dc-table">
                    <thead>
                      <tr>
                        <th>Detection Focus</th>
                        <th style="width: 110px;">DC</th>
                        <th>Resolution Detail</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="m in skEditorial.mentalTable" :key="m.detection">
                        <td class="font-semibold text-white">{{ m.detection }}</td>
                        <td class="font-mono text-amber">{{ m.dc }}</td>
                        <td class="text-muted text-xs">{{ m.note }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Sub-Table: Intimidation Demoralize Degrees -->
              <div v-if="skEditorial.demoralizeTable?.length" class="editorial-section">
                <h4 class="editorial-heading">
                  <i class="ri-sword-line"></i> Demoralize Degrees of Success
                </h4>
                <div class="skill-dc-table-wrap">
                  <table class="skill-dc-table">
                    <thead>
                      <tr>
                        <th>Check Difference</th>
                        <th>Condition Inflicted</th>
                        <th style="width: 120px;">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="d in skEditorial.demoralizeTable" :key="d.degree">
                        <td class="font-semibold text-white">{{ d.degree }}</td>
                        <td class="font-mono text-cyan text-xs">{{ d.effect }}</td>
                        <td class="text-muted text-xs">{{ d.duration }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Sub-Table: Investigation Search Time -->
              <div v-if="skEditorial.searchTable?.length" class="editorial-section">
                <h4 class="editorial-heading">
                  <i class="ri-time-line"></i> Area Search Times & Coverage
                </h4>
                <div class="skill-dc-table-wrap">
                  <table class="skill-dc-table">
                    <thead>
                      <tr>
                        <th>Area Size</th>
                        <th style="width: 130px;">Time Required</th>
                        <th style="width: 90px;">DC</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="s in skEditorial.searchTable" :key="s.area">
                        <td class="font-semibold text-white">{{ s.area }}</td>
                        <td class="font-mono text-cyan text-xs">{{ s.time }}</td>
                        <td class="font-mono text-amber">{{ s.dc }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Sub-Table: Investigation Evidence Modifiers -->
              <div v-if="skEditorial.evidenceTable?.length" class="editorial-section">
                <h4 class="editorial-heading">
                  <i class="ri-fingerprint-line"></i> Forensic Degradation & Modifiers
                </h4>
                <div class="skill-dc-table-wrap">
                  <table class="skill-dc-table">
                    <thead>
                      <tr>
                        <th>Crime Scene Condition</th>
                        <th style="width: 100px;">DC Mod</th>
                        <th>Impact</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="e in skEditorial.evidenceTable" :key="e.condition">
                        <td class="font-semibold text-white">{{ e.condition }}</td>
                        <td class="font-mono text-danger">{{ e.mod }}</td>
                        <td class="text-muted text-xs">{{ e.note }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Sub-Table: Perception Sensory Barriers -->
              <div v-if="skEditorial.sensoryTable?.length" class="editorial-section">
                <h4 class="editorial-heading">
                  <i class="ri-volume-up-line"></i> Distance & Barrier Penalties
                </h4>
                <div class="skill-dc-table-wrap">
                  <table class="skill-dc-table">
                    <thead>
                      <tr>
                        <th>Obstacle / Condition</th>
                        <th style="width: 110px;">Modifier</th>
                        <th>Sensory Context</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="p in skEditorial.sensoryTable" :key="p.factor">
                        <td class="font-semibold text-white">{{ p.factor }}</td>
                        <td class="font-mono" :class="p.mod.includes('-') ? 'text-danger' : 'text-amber'">{{ p.mod }}</td>
                        <td class="text-muted text-xs">{{ p.note }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Sub-Table: Persuasion Attitude Ladder -->
              <div v-if="skEditorial.attitudeLadder?.length" class="editorial-section">
                <h4 class="editorial-heading">
                  <i class="ri-user-smile-line"></i> 5-Step Attitude Ladder
                </h4>
                <div class="skill-dc-table-wrap">
                  <table class="skill-dc-table">
                    <thead>
                      <tr>
                        <th style="width: 88px;">Attitude</th>
                        <th>Target Demeanor & Reaction</th>
                        <th style="width: 115px; text-align: right;">Shift DC</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="a in skEditorial.attitudeLadder" :key="a.attitude">
                        <td>
                          <span class="attitude-badge" :class="'att-' + a.attitude.toLowerCase()">{{ a.attitude }}</span>
                        </td>
                        <td class="text-muted text-xs">{{ a.reaction }}</td>
                        <td class="font-mono text-cyan text-xs" style="text-align: right; white-space: nowrap;">{{ a.shiftDC }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Sub-Table: Sleight of Hand Escape Table -->
              <div v-if="skEditorial.escapeTable?.length" class="editorial-section">
                <h4 class="editorial-heading">
                  <i class="ri-key-line"></i> Escape Restraints Difficulties
                </h4>
                <div class="skill-dc-table-wrap">
                  <table class="skill-dc-table">
                    <thead>
                      <tr>
                        <th>Restraint Type</th>
                        <th style="width: 90px;">DC</th>
                        <th style="width: 100px;">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="e in skEditorial.escapeTable" :key="e.restraint">
                        <td class="font-semibold text-white">{{ e.restraint }}</td>
                        <td class="font-mono text-amber">{{ e.dc }}</td>
                        <td class="text-muted text-xs">{{ e.time }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Sub-Table: Technology Security Levels -->
              <div v-if="skEditorial.securityTable?.length" class="editorial-section">
                <h4 class="editorial-heading">
                  <i class="ri-shield-keyhole-line"></i> Security & Mainframe Levels
                </h4>
                <div class="skill-dc-table-wrap">
                  <table class="skill-dc-table">
                    <thead>
                      <tr>
                        <th>Security Tier</th>
                        <th style="width: 90px;">DC</th>
                        <th>Example Systems</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="s in skEditorial.securityTable" :key="s.level">
                        <td class="font-semibold text-white">{{ s.level }}</td>
                        <td class="font-mono text-amber">{{ s.dc }}</td>
                        <td class="text-muted text-xs">{{ s.example }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Sub-Table: Treatment Procedures Table -->
              <div v-if="skEditorial.treatmentTable?.length" class="editorial-section">
                <h4 class="editorial-heading">
                  <i class="ri-first-aid-kit-line"></i> Medical Procedures & Triage
                </h4>
                <div class="skill-dc-table-wrap">
                  <table class="skill-dc-table">
                    <thead>
                      <tr>
                        <th>Procedure</th>
                        <th style="width: 90px;">DC</th>
                        <th style="width: 110px;">Action</th>
                        <th>Effect</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="t in skEditorial.treatmentTable" :key="t.procedure">
                        <td class="font-semibold text-white">{{ t.procedure }}</td>
                        <td class="font-mono text-amber">{{ t.dc }}</td>
                        <td class="text-cyan text-xs font-mono">{{ t.action }}</td>
                        <td class="text-muted text-xs">{{ t.effect }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Sub-Table: Vehicles Maneuver Table -->
              <div v-if="skEditorial.maneuverTable?.length" class="editorial-section">
                <h4 class="editorial-heading">
                  <i class="ri-roadster-line"></i> Tactical Maneuvers & Crash Mitigation
                </h4>
                <div class="skill-dc-table-wrap">
                  <table class="skill-dc-table">
                    <thead>
                      <tr>
                        <th>Maneuver</th>
                        <th style="width: 90px;">DC</th>
                        <th>Tactical Effect</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="v in skEditorial.maneuverTable" :key="v.maneuver">
                        <td class="font-semibold text-white">{{ v.maneuver }}</td>
                        <td class="font-mono text-amber">{{ v.dc }}</td>
                        <td class="text-muted text-xs">{{ v.effect }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Specialized Action Tasks -->
              <div v-if="skEditorial.tasks?.length" class="editorial-section">
                <h4 class="editorial-heading">
                  <i class="ri-list-check-2"></i> Specialized Skill Actions
                </h4>
                <div class="editorial-sub-list">
                  <article
                    v-for="t in skEditorial.tasks"
                    :key="t.name"
                    class="editorial-sub-card"
                  >
                    <header class="sub-card-header">
                      <strong class="sub-card-title">{{ t.name }}</strong>
                    </header>
                    <p class="sub-card-prose">{{ t.desc }}</p>
                  </article>
                </div>
              </div>

              <!-- Synergistic Advantages List -->
              <div v-if="synergyAdvantagesStatus?.length" class="editorial-section">
                <h4 class="editorial-heading">
                  <i class="ri-medal-line"></i> Synergistic Advantages
                </h4>
                <div class="synergy-adv-grid">
                  <div
                    v-for="adv in synergyAdvantagesStatus"
                    :key="adv.name"
                    class="synergy-adv-chip"
                    :class="{ 'is-active': adv.hasAdvantage }"
                  >
                    <i :class="adv.hasAdvantage ? 'ri-checkbox-circle-fill text-emerald' : 'ri-checkbox-blank-circle-line text-muted'"></i>
                    <span class="adv-chip-name">{{ adv.name }}</span>
                    <span v-if="adv.hasAdvantage" class="adv-chip-rank font-mono">+{{ adv.ranks }}</span>
                  </div>
                </div>
              </div>

              <!-- Specialization Management Strip if subtype -->
              <div v-if="skConfig.requiresSubtype && skSubtype" class="editorial-section">
                <h4 class="editorial-heading">
                  <i class="ri-settings-4-line"></i> Specialization Management
                </h4>
                <div class="spec-manage-strip">
                  <button
                    type="button"
                    class="btn-delete-spec-drawer"
                    @click="removeSpecializationFromDrawer"
                  >
                    <i class="ri-delete-bin-line"></i> Remove This Specialization
                  </button>
                </div>
              </div>
            </div>

            <!-- Action Buttons Footer -->
            <div class="drawer-actions-strip">
              <button
                type="button"
                class="btn-drawer-action btn-broadcast"
                @click="broadcastSkill"
              >
                <i class="ri-broadcast-line"></i>
                <span>Broadcast to Roll20</span>
              </button>
            </div>
          </div>

          <!-- 0.5 DEFENSE INSPECTOR (D&D BEYOND TACTICAL ARCHITECTURE) -->
          <div v-else-if="currentType === 'defense' && data" class="inspector-content-pane defense-view">
            <!-- Vertical Tactical Ledger Table -->
            <div class="dndb-stat-ledger">
              <div class="ledger-row is-total-row">
                <span class="ledger-label">Total Resistance Rank</span>
                <span class="ledger-val font-mono" :class="isDefStaAbsent && defKey === 'FORTITUDE' ? 'text-emerald' : 'text-cyan'">
                  {{ isDefStaAbsent && defKey === 'FORTITUDE' ? 'Immune (-)' : formatModifier(defTotalValue) }}
                  <span v-if="!(isDefStaAbsent && defKey === 'FORTITUDE')" class="total-dc-pill font-mono">DC {{ 10 + (defTotalValue || 0) }}</span>
                </span>
              </div>

              <!-- Base Ability Row -->
              <div class="ledger-row">
                <span class="ledger-label">
                  Base Ability ({{ defBaseAbility }})
                </span>
                <span class="ledger-val font-mono" :class="isDefStaAbsent && defBaseAbility === 'STA' ? 'text-muted' : 'text-slate-200'">
                  {{ isDefStaAbsent && defBaseAbility === 'STA' ? '-' : formatModifier(defBaseRank) }}
                </span>
              </div>

              <!-- Purchased Ranks Row (For Dodge, Parry, Fortitude, Will) -->
              <div v-if="defKey !== 'TOUGHNESS'" class="ledger-row">
                <span class="ledger-label">Purchased Ranks (1 PP/ea)</span>
                <div class="ledger-val">
                  <span v-if="isDefStaAbsent && defKey === 'FORTITUDE'" class="text-muted font-mono">Absent</span>
                  <div v-else class="stepper-actions">
                    <button
                      type="button"
                      class="step-btn"
                      :disabled="defBoughtRanks <= 0"
                      @click="stepDefenseRank(-1)"
                      aria-label="Decrease defense rank"
                    >-</button>
                    <span class="rank-display font-mono">{{ defBoughtRanks }}</span>
                    <button
                      type="button"
                      class="step-btn"
                      @click="stepDefenseRank(1)"
                      aria-label="Increase defense rank"
                    >+</button>
                  </div>
                </div>
              </div>

              <!-- Toughness Derived Breakdown Rows -->
              <template v-if="defKey === 'TOUGHNESS'">
                <div class="ledger-row" :class="{ 'has-bonus': defProtectionBonus > 0 }">
                  <span class="ledger-label">Protection (Powers)</span>
                  <span class="ledger-val font-mono" :class="defProtectionBonus > 0 ? 'text-cyan' : 'text-muted'">
                    {{ defProtectionBonus > 0 ? `+${defProtectionBonus}` : '+0' }}
                  </span>
                </div>
                <div class="ledger-row" :class="{ 'has-bonus': defDefensiveRollBonus > 0 }">
                  <span class="ledger-label">Defensive Roll (Advantage)</span>
                  <span class="ledger-val font-mono" :class="defDefensiveRollBonus > 0 ? (heroStore.conditionModifiers.defRollLost > 0 ? 'text-crimson' : 'text-cyan') : 'text-muted'">
                    {{ defDefensiveRollBonus > 0 ? (heroStore.conditionModifiers.defRollLost > 0 ? '0 (Lost)' : `+${defDefensiveRollBonus}`) : '+0' }}
                  </span>
                </div>
                <div class="ledger-row" :class="{ 'has-bonus': defEquipmentArmorBonus > 0 }">
                  <span class="ledger-label">Body Armor (Equipment)</span>
                  <span class="ledger-val font-mono" :class="defEquipmentArmorBonus > 0 ? 'text-cyan' : 'text-muted'">
                    {{ defEquipmentArmorBonus > 0 ? `+${defEquipmentArmorBonus}` : '+0' }}
                  </span>
                </div>
              </template>

              <!-- Enhanced Powers Bonus -->
              <div v-if="defKey !== 'TOUGHNESS' && defEnhRanks > 0" class="ledger-row has-bonus">
                <span class="ledger-label">Enhanced Traits (Powers)</span>
                <span class="ledger-val font-mono text-cyan">+{{ defEnhRanks }}</span>
              </div>

              <!-- Equipment Shield Bonus (Dodge/Parry) -->
              <div v-if="defShieldBonus > 0" class="ledger-row has-bonus">
                <span class="ledger-label">Shield (Equipment)</span>
                <span class="ledger-val font-mono text-cyan">+{{ defShieldBonus }}</span>
              </div>

              <!-- Condition Modifiers -->
              <div v-if="heroStore.character.injuries > 0 && defKey === 'TOUGHNESS'" class="ledger-row is-penalty-row">
                <span class="ledger-label">Bruised Penalties</span>
                <span class="ledger-val font-mono text-crimson">-{{ heroStore.character.injuries }}</span>
              </div>
              <div v-if="heroStore.conditionModifiers.isDefenseless && (defKey === 'DODGE' || defKey === 'PARRY')" class="ledger-row is-penalty-row">
                <span class="ledger-label">Defenseless Condition</span>
                <span class="ledger-val font-mono text-crimson">Set to 0</span>
              </div>
              <div v-else-if="heroStore.conditionModifiers.isVulnerable && (defKey === 'DODGE' || defKey === 'PARRY')" class="ledger-row is-penalty-row">
                <span class="ledger-label">Vulnerable Condition</span>
                <span class="ledger-val font-mono text-amber">Halved</span>
              </div>
              <div v-if="heroStore.conditionModifiers.isProne && (defKey === 'DODGE' || defKey === 'PARRY')" class="ledger-row" :class="defKey === 'DODGE' ? 'has-bonus' : 'is-penalty-row'">
                <span class="ledger-label">Prone Posture</span>
                <span class="ledger-val font-mono" :class="defKey === 'DODGE' ? 'text-emerald' : 'text-crimson'">
                  {{ defKey === 'DODGE' ? '+5 vs Ranged (>10ft)' : '-5 vs Close' }}
                </span>
              </div>
              <div v-if="heroStore.conditionModifiers.checkPenalty !== 0 && (defKey === 'FORTITUDE' || defKey === 'WILL')" class="ledger-row is-penalty-row">
                <span class="ledger-label">Condition Penalty ({{ heroStore.conditionModifiers.isDisabled ? 'Disabled' : 'Impaired' }})</span>
                <span class="ledger-val font-mono text-crimson">{{ heroStore.conditionModifiers.checkPenalty }}</span>
              </div>

              <!-- Point Budget Cost -->
              <div v-if="defKey !== 'TOUGHNESS'" class="ledger-row">
                <span class="ledger-label">Power Point Cost</span>
                <span class="ledger-val font-mono text-emerald">
                  {{ isDefStaAbsent && defKey === 'FORTITUDE' ? '0 PP (Immune)' : `${defBoughtRanks} PP` }}
                </span>
              </div>
            </div>

            <!-- Red / Coral Accent Divider Rule like D&D Beyond -->
            <div class="dndb-ledger-divider" role="separator"></div>

            <!-- Primary Roll Action Button -->
            <div class="dndb-primary-action-wrap">
              <button
                type="button"
                class="btn-dndb-roll-action"
                :class="{ 'is-dying-action': heroStore.isDying && defKey === 'FORTITUDE' }"
                :disabled="isDefStaAbsent && defKey === 'FORTITUDE'"
                @click="rollDefenseCheck"
              >
                <i :class="heroStore.isDying && defKey === 'FORTITUDE' ? 'ri-skull-line' : 'ri-dice-line'"></i>
                <span v-if="isDefStaAbsent && defKey === 'FORTITUDE'">Immune to Fortitude Checks</span>
                <span v-else-if="heroStore.isDying && defKey === 'FORTITUDE'">Roll Dying Stabilization Check (DC 15)</span>
                <span v-else>Roll {{ defName }} Resistance (d20{{ formatModifier(defTotalValue) }})</span>
              </button>
            </div>

            <!-- 1. Paired PL Cap Audit Card -->
            <div class="def-pl-audit-card" :class="defPlCapInfo.statusClass">
              <div class="audit-card-header">
                <div class="audit-title-wrap">
                  <i :class="defPlCapInfo.isExceeded ? 'ri-error-warning-fill' : 'ri-shield-check-fill'"></i>
                  <span class="audit-title">PL {{ heroStore.character.powerLevel }} Defense Cap Audit</span>
                </div>
                <span class="audit-status-badge font-mono" :class="defPlCapInfo.statusClass">
                  {{ defPlCapInfo.statusLabel }}
                </span>
              </div>

              <!-- Discrete pairing rows for high density & instant scannability -->
              <div class="audit-pairs-list">
                <div
                  v-for="(pair, idx) in defPlCapInfo.pairs"
                  :key="idx"
                  class="audit-pair-row font-mono"
                  :class="{ 'pair-exceeded': pair.isExceeded }"
                >
                  <div class="pair-formula">
                    <span class="pair-formula-text">{{ pair.formula }}</span>
                    <span class="pair-eq">=</span>
                    <strong class="pair-sum">{{ pair.sum }}</strong>
                    <span class="pair-cap">/ {{ pair.maxCap }}</span>
                  </div>
                  <span
                    class="pair-mini-badge"
                    :class="pair.isExceeded ? 'badge-bad' : 'badge-ok'"
                  >
                    {{ pair.badge }}
                  </span>
                </div>
              </div>

              <p class="audit-note-text">
                {{ defPlCapInfo.note }}
              </p>
            </div>

            <!-- 2. Impervious & Injury Status (Exclusively on Toughness) -->
            <div v-if="defKey === 'TOUGHNESS'" class="editorial-section toughness-workshop-section">
              <h4 class="editorial-heading">
                <i class="ri-shield-cross-line"></i> Impervious & Injury Status
              </h4>
              <div class="workshop-cards-grid">
                <!-- Impervious Threshold Card -->
                <div class="workshop-mini-card">
                  <div class="mini-card-header">
                    <span class="mini-card-label">Impervious Threshold</span>
                    <strong class="mini-card-val font-mono text-cyan">
                      {{ defImperviousThreshold > 0 ? `Damage ≤ ${defImperviousThreshold}` : 'Inactive' }}
                    </strong>
                  </div>
                  <p class="mini-card-desc">
                    {{ defImperviousThreshold > 0
                      ? `Attacks with Damage rank ${defImperviousThreshold} or lower are automatically ignored without requiring a resistance check.`
                      : 'No Impervious extra currently applied to Protection or Toughness.' }}
                  </p>
                </div>

                <!-- Bruised Injury Tracker -->
                <div class="workshop-mini-card" :class="{ 'has-injuries': heroStore.character.injuries > 0 }">
                  <div class="mini-card-header">
                    <span class="mini-card-label">Active Bruises</span>
                    <div class="injury-counter-wrap">
                      <button
                        type="button"
                        class="btn-injury-step"
                        :disabled="!heroStore.character.injuries || heroStore.character.injuries <= 0"
                        @click="healInjury"
                        aria-label="Heal 1 Bruise"
                      >-</button>
                      <strong class="injury-num font-mono" :class="heroStore.character.injuries > 0 ? 'text-crimson' : 'text-slate-300'">
                        {{ heroStore.character.injuries || 0 }}
                      </strong>
                      <button
                        type="button"
                        class="btn-injury-step"
                        @click="addInjury"
                        aria-label="Add 1 Bruise"
                      >+</button>
                    </div>
                  </div>
                  <p class="mini-card-desc">
                    Each bruise imposes a cumulative -1 penalty on subsequent Toughness resistance checks.
                  </p>
                </div>
              </div>
            </div>

            <!-- 3. Editorial Lore & Tabletop Rules Section (D&D Beyond Style) -->
            <div class="dndb-editorial-content">
              <!-- Core Overview Paragraph -->
              <p class="editorial-overview">
                {{ defEditorial.overview }}
              </p>

              <!-- Active Defense / Operational Rules -->
              <div class="editorial-section">
                <h4 class="editorial-heading">
                  <i class="ri-focus-2-line"></i> Operational & Combat Rules
                </h4>
                <p class="editorial-prose">
                  {{ defEditorial.activeDefenseRules }}
                </p>
              </div>

              <!-- Hazards Resisted Sub-list -->
              <div v-if="defEditorial.hazardsResisted?.length" class="editorial-section">
                <h4 class="editorial-heading">
                  <i class="ri-shield-cross-line"></i> Hazards Resisted
                </h4>
                <div class="editorial-sub-list">
                  <article
                    v-for="haz in defEditorial.hazardsResisted"
                    :key="haz.name"
                    class="editorial-sub-card"
                  >
                    <header class="sub-card-header">
                      <strong class="sub-card-title">{{ haz.name }}</strong>
                    </header>
                    <p class="sub-card-prose">{{ haz.desc }}</p>
                  </article>
                </div>
              </div>

              <!-- Damage Conditions Ladder (Toughness only) -->
              <div v-if="defKey === 'TOUGHNESS' && defEditorial.damageConditions?.length" class="editorial-section">
                <h4 class="editorial-heading">
                  <i class="ri-heart-pulse-fill"></i> Toughness Failure Ladder (Damage Degrees)
                </h4>
                <div class="degrees-ladder-list">
                  <div
                    v-for="(deg, dIdx) in defEditorial.damageConditions"
                    :key="deg.degree"
                    class="degree-card"
                    :class="[`deg-${['first', 'second', 'third', 'fourth'][dIdx] || 'first'}`]"
                  >
                    <header class="deg-header">
                      <strong class="deg-pill">{{ deg.degree }}</strong>
                    </header>
                    <p class="deg-effect">{{ deg.effect }}</p>
                  </div>
                </div>
              </div>

              <!-- Tactical Trade-off Advice -->
              <div v-if="defEditorial.tradeoffAdvice" class="editorial-section">
                <h4 class="editorial-heading">
                  <i class="ri-scales-3-line"></i> Tactical Trade-Off Guide
                </h4>
                <p class="editorial-prose">
                  {{ defEditorial.tradeoffAdvice }}
                </p>
              </div>

              <!-- Synergistic Advantages List -->
              <div v-if="defEditorial.synergisticAdvantages?.length" class="editorial-section">
                <h4 class="editorial-heading">
                  <i class="ri-award-line"></i> Synergistic Advantages
                </h4>
                <div class="synergy-adv-grid">
                  <div
                    v-for="advName in defEditorial.synergisticAdvantages"
                    :key="advName"
                    class="synergy-adv-chip is-clickable"
                    :class="{ 'is-active': hasAdvantage(advName) }"
                    @click="openSynergyAdvantage(advName)"
                    role="button"
                    tabindex="0"
                    :aria-label="`Inspect ${advName} advantage`"
                  >
                    <i :class="hasAdvantage(advName) ? 'ri-checkbox-circle-fill text-emerald' : 'ri-checkbox-blank-circle-line'"></i>
                    <span class="adv-chip-name">{{ advName }}</span>
                    <span v-if="hasAdvantage(advName)" class="adv-chip-rank font-mono">
                      Rank {{ getAdvantageCurrentRank(advName) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons Footer -->
            <div class="drawer-actions-strip">
              <button
                type="button"
                class="btn-drawer-action btn-broadcast"
                @click="broadcastDefense"
              >
                <i class="ri-broadcast-line"></i>
                <span>Broadcast to Roll20</span>
              </button>
            </div>
          </div>

          <!-- 1. ADVANTAGE INSPECTOR -->
          <div v-else-if="currentType === 'advantage' && data" class="inspector-content-pane advantage-view">
            <!-- Vertical Tactical Ledger Table -->
            <div class="dndb-stat-ledger">
              <div class="ledger-row is-total-row">
                <span class="ledger-label">Category</span>
                <span class="ledger-val text-amber font-mono">{{ advCategory }}</span>
              </div>
              <div class="ledger-row">
                <span class="ledger-label">Total Cost</span>
                <span class="ledger-val font-mono text-cyan">{{ advCost }} PP</span>
              </div>
              <div class="ledger-row">
                <span class="ledger-label">Ranks</span>
                <span class="ledger-val font-mono">{{ data.ranks || 1 }}</span>
              </div>
              <div v-if="data.specification" class="ledger-row">
                <span class="ledger-label">Specification</span>
                <span class="ledger-val text-emerald">{{ data.specification }}</span>
              </div>
            </div>

            <div class="dndb-ledger-divider" role="separator"></div>

            <!-- Benefit / Description Section -->
            <div class="drawer-section">
              <h4 class="section-heading">
                <i class="ri-shield-star-line"></i> Benefit & Rules
              </h4>
              <p class="rules-prose">
                {{ fullAdvDesc }}
              </p>
            </div>

            <!-- Mechanical Details / Presets if present -->
            <div v-if="advRule?.notes" class="drawer-section">
              <h4 class="section-heading">
                <i class="ri-information-line"></i> Tactical Notes & Circumstances
              </h4>
              <p class="rules-prose sub-notes">
                {{ advRule.notes }}
              </p>
            </div>

            <div v-if="advRule?.specificationSuggestions?.length" class="drawer-section">
              <h4 class="section-heading">
                <i class="ri-list-check"></i> Standard Options / Examples
              </h4>
              <div class="spec-examples-wrap">
                <span
                  v-for="sugg in advRule.specificationSuggestions"
                  :key="sugg"
                  class="spec-example-chip"
                >
                  {{ sugg }}
                </span>
              </div>
            </div>

            <!-- Action Buttons Footer -->
            <div class="drawer-actions-strip">
              <button
                type="button"
                class="btn-drawer-action btn-broadcast"
                @click="broadcastAdvantage"
              >
                <i class="ri-broadcast-line"></i>
                <span>Broadcast to Roll20</span>
              </button>
            </div>
          </div>

          <!-- 2. POWER INSPECTOR -->
          <div v-else-if="currentType === 'power' && data" class="inspector-content-pane power-view">
            <!-- Vertical Tactical Ledger Table -->
            <div class="dndb-stat-ledger">
              <div class="ledger-row is-total-row">
                <span class="ledger-label">Power Structure</span>
                <span class="ledger-val text-cyan font-mono">{{ (data.type || 'Standard').toUpperCase() }}</span>
              </div>
              <div class="ledger-row">
                <span class="ledger-label">Total Cost</span>
                <span class="ledger-val font-mono text-amber">{{ powerTotalCost }} PP</span>
              </div>
              <div class="ledger-row">
                <span class="ledger-label">Action</span>
                <span class="ledger-val font-mono">{{ primaryAction }}</span>
              </div>
              <div class="ledger-row">
                <span class="ledger-label">Range</span>
                <span class="ledger-val font-mono">{{ primaryRange }}</span>
              </div>
              <div class="ledger-row">
                <span class="ledger-label">Duration</span>
                <span class="ledger-val font-mono">{{ primaryDuration }}</span>
              </div>
            </div>

            <div class="dndb-ledger-divider" role="separator"></div>

            <!-- Descriptors -->
            <div v-if="powerDescriptors.length" class="drawer-section">
              <h4 class="section-heading">
                <i class="ri-price-tag-3-line"></i> Descriptors
              </h4>
              <div class="chips-flex-row">
                <span v-for="desc in powerDescriptors" :key="desc" class="descriptor-pill">
                  {{ desc }}
                </span>
              </div>
            </div>

            <!-- Base Effect Description -->
            <div class="drawer-section">
              <h4 class="section-heading">
                <i class="ri-flashlight-line"></i> Primary Effect Mechanics
              </h4>
              <div class="power-effect-box">
                <div class="effect-box-header">
                  <strong>{{ data.effectType || data.name }}</strong>
                  <span class="font-mono text-cyan">Rank {{ data.ranks || 1 }}</span>
                </div>
                <p class="rules-prose mt-1">
                  {{ data.description || 'Custom superhero ability or technological device.' }}
                </p>
              </div>
            </div>

            <!-- Modifiers (Extras & Flaws) -->
            <div v-if="allModifiers.length" class="drawer-section">
              <h4 class="section-heading">
                <i class="ri-equalizer-line"></i> Modifiers (Extras & Flaws)
              </h4>
              <div class="modifiers-list">
                <div
                  v-for="mod in allModifiers"
                  :key="mod.name"
                  class="mod-row"
                  :class="mod.type === 'extra' ? 'is-extra' : 'is-flaw'"
                >
                  <div class="mod-info">
                    <span class="mod-tag" :class="mod.type">
                      {{ mod.type === 'extra' ? '+Extra' : '-Flaw' }}
                    </span>
                    <strong class="mod-name">{{ mod.name }}</strong>
                    <span v-if="mod.ranks" class="mod-rank">Rank {{ mod.ranks }}</span>
                  </div>
                  <span class="mod-cost font-mono">
                    {{ formatModCost(mod) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Device Specs if Device -->
            <div v-if="data.type === 'device'" class="drawer-section">
              <h4 class="section-heading">
                <i class="ri-shield-keyhole-line"></i> Device Attributes
              </h4>
              <div class="device-specs-grid">
                <div class="spec-item">
                  <span class="spec-k">Removable:</span>
                  <span class="spec-v">{{ data.deviceConfig?.type === 'easily_removable' ? 'Easily Removable (-2 PP per 5)' : 'Removable (-1 PP per 5)' }}</span>
                </div>
                <div class="spec-item">
                  <span class="spec-k">Toughness:</span>
                  <span class="spec-v font-mono">{{ data.deviceConfig?.toughness || 10 }}</span>
                </div>
                <div class="spec-item">
                  <span class="spec-k">Descriptor:</span>
                  <span class="spec-v">{{ data.deviceConfig?.descriptor || 'Technology' }}</span>
                </div>
              </div>
            </div>

            <!-- Alternate Effects if Array -->
            <div v-if="data.alternateEffects?.length" class="drawer-section">
              <h4 class="section-heading">
                <i class="ri-stack-line"></i> Alternate Effects in Array ({{ data.alternateEffects.length }})
              </h4>
              <div class="alternate-effects-list">
                <div
                  v-for="(ae, idx) in data.alternateEffects"
                  :key="ae.id || idx"
                  class="ae-row"
                >
                  <div class="ae-title-row">
                    <span class="ae-index font-mono">Alt {{ idx + 1 }}</span>
                    <strong class="ae-name">{{ ae.name }}</strong>
                    <span class="ae-cost font-mono">1 PP</span>
                  </div>
                  <p class="ae-desc">{{ ae.description || ae.effectType }}</p>
                </div>
              </div>
            </div>

            <!-- Action Buttons Footer -->
            <div class="drawer-actions-strip">
              <button
                type="button"
                class="btn-drawer-action btn-broadcast"
                @click="broadcastPower"
              >
                <i class="ri-broadcast-line"></i>
                <span>Broadcast to Roll20</span>
              </button>
              <button
                type="button"
                class="btn-drawer-action btn-edit-studio"
                @click="openInPowerStudio"
              >
                <i class="ri-edit-line"></i>
                <span>Edit in Power Studio</span>
              </button>
            </div>
          </div>

          <!-- 3. EQUIPMENT INSPECTOR -->
          <div v-else-if="currentType === 'equipment' && data" class="inspector-content-pane equipment-view">
            <!-- Vertical Tactical Ledger Table -->
            <div class="dndb-stat-ledger">
              <div class="ledger-row is-total-row">
                <span class="ledger-label">Category</span>
                <span class="ledger-val text-emerald font-mono">{{ (data.category || data.type || 'Equipment').toUpperCase() }}</span>
              </div>
              <div class="ledger-row">
                <span class="ledger-label">Equipment Cost</span>
                <span class="ledger-val font-mono text-amber">{{ data.epCost ?? data.cost ?? 0 }} EP</span>
              </div>
              <div class="ledger-row">
                <span class="ledger-label">Carrying Status</span>
                <div class="ledger-val">
                  <button
                    type="button"
                    class="eq-status-cycler-btn"
                    :class="`status-${data.status || 'equipped'}`"
                    @click="cycleStatus"
                  >
                    <span class="status-dot"></span>
                    <span>{{ formatStatus(data.status) }}</span>
                  </button>
                </div>
              </div>
            </div>

            <div class="dndb-ledger-divider" role="separator"></div>

            <!-- Weapon Combat Specs if Weapon -->
            <div v-if="isWeapon(data)" class="drawer-section">
              <h4 class="section-heading">
                <i class="ri-sword-line"></i> Weapon Combat Profile
              </h4>
              <div class="weapon-stats-grid">
                <div class="weapon-stat-card">
                  <span class="w-label">Attack Bonus</span>
                  <button
                    type="button"
                    class="w-roll-chip"
                    @click="rollWeaponAtk"
                  >
                    <i class="ri-dice-line"></i>
                    <span class="font-mono">+{{ weaponAtkBonus }}</span>
                  </button>
                </div>
                <div class="weapon-stat-card">
                  <span class="w-label">Damage / DC</span>
                  <span class="w-val font-mono">DC {{ weaponDC }} vs {{ weaponResistance }}</span>
                </div>
                <div class="weapon-stat-card">
                  <span class="w-label">Range</span>
                  <span class="w-val">{{ weaponRange }}</span>
                </div>
                <div class="weapon-stat-card">
                  <span class="w-label">Critical Threat</span>
                  <span class="w-val font-mono">{{ data.weapon?.crit || '20' }}</span>
                </div>
              </div>

              <!-- Weapon Traits -->
              <div v-if="data.weapon?.traits?.length" class="mt-2">
                <span class="cell-label">SPECIAL TRAITS:</span>
                <div class="chips-flex-row mt-1">
                  <span v-for="tr in data.weapon.traits" :key="tr" class="trait-pill">
                    {{ tr }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Armor / Protection if Armor -->
            <div v-if="isArmor(data)" class="drawer-section">
              <h4 class="section-heading">
                <i class="ri-shield-line"></i> Protection & Defense
              </h4>
              <div class="protection-metric-box">
                <div class="prot-row">
                  <span class="prot-label">Toughness Bonus:</span>
                  <span class="prot-val font-mono text-emerald">+{{ data.armor?.toughnessBonus || data.bonus || 1 }}</span>
                </div>
                <div v-if="data.armor?.activeDefense" class="prot-row">
                  <span class="prot-label">Active Defense (Dodge/Parry):</span>
                  <span class="prot-val font-mono text-emerald">+{{ data.armor.activeDefense }}</span>
                </div>
              </div>
            </div>

            <!-- Full Description & Notes -->
            <div class="drawer-section">
              <h4 class="section-heading">
                <i class="ri-file-text-line"></i> Specifications & Description
              </h4>
              <p class="rules-prose">
                {{ data.description || 'Standard tactical superhero equipment.' }}
              </p>
            </div>

            <!-- Action Buttons Footer -->
            <div class="drawer-actions-strip">
              <button
                type="button"
                class="btn-drawer-action btn-broadcast"
                @click="broadcastEquipment"
              >
                <i class="ri-broadcast-line"></i>
                <span>Broadcast to Roll20</span>
              </button>
            </div>
          </div>

          <!-- 4. ATTACK / COMBAT EFFECT INSPECTOR -->
          <div v-else-if="currentType === 'attack' && data" class="inspector-content-pane attack-view">
            <!-- Quick Stat Bar -->
            <div class="drawer-stat-bar">
              <div class="stat-cell">
                <span class="cell-label">ATTACK RANGE</span>
                <span class="cell-val text-cyan">{{ data.range }}</span>
              </div>
              <div class="stat-cell">
                <span class="cell-label">CHECK BONUS</span>
                <button
                  type="button"
                  class="attack-check-roll-btn"
                  @click="rollAttackCheck"
                >
                  <i class="ri-dice-line"></i>
                  <span class="font-mono">{{ attackBonusDisplay }}</span>
                </button>
              </div>
              <div class="stat-cell">
                <span class="cell-label">RESISTANCE DC</span>
                <span class="cell-val font-mono text-amber">DC {{ data.dc }} vs {{ data.resistance }}</span>
              </div>
              <div class="stat-cell">
                <span class="cell-label">CRIT</span>
                <span class="cell-val font-mono">{{ data.crit || 20 }}</span>
              </div>
            </div>

            <!-- Target Defense Check Guide -->
            <div class="drawer-section">
              <h4 class="section-heading">
                <i class="ri-shield-check-line"></i> Target Resistance Check Rule
              </h4>
              <div class="dc-formula-card">
                <div class="formula-line">
                  <span class="formula-label">Target Roll:</span>
                  <strong>d20 + {{ data.resistance }} Modifier</strong>
                </div>
                <div class="formula-line">
                  <span class="formula-label">Difficulty Class (DC):</span>
                  <strong class="text-amber">DC {{ data.dc }}</strong>
                  <span class="formula-sub">({{ data.dcDescription || `${data.effectName} DC` }})</span>
                </div>
              </div>
            </div>

            <!-- Failure Degrees Ladder -->
            <div class="drawer-section">
              <h4 class="section-heading">
                <i class="ri-list-ordered"></i> Degrees of Failure Outcome Ladder
              </h4>
              <div class="degrees-ladder-list">
                <div class="degree-card deg-first">
                  <div class="deg-header">
                    <span class="deg-pill">1st Degree Failure</span>
                    <span class="deg-math font-mono">Missed DC by 1 to 5</span>
                  </div>
                  <p class="deg-effect">
                    <strong>Bruised / Penalty:</strong> -1 cumulative penalty to future Toughness checks against damage.
                  </p>
                </div>

                <div class="degree-card deg-second">
                  <div class="deg-header">
                    <span class="deg-pill">2nd Degree Failure</span>
                    <span class="deg-math font-mono">Missed DC by 6 to 10</span>
                  </div>
                  <p class="deg-effect">
                    <strong>Dazed:</strong> Limited to a free action and a single standard action per turn, plus -1 Toughness penalty.
                  </p>
                </div>

                <div class="degree-card deg-third">
                  <div class="deg-header">
                    <span class="deg-pill">3rd Degree Failure</span>
                    <span class="deg-math font-mono">Missed DC by 11 to 15</span>
                  </div>
                  <p class="deg-effect">
                    <strong>Staggered:</strong> Limited to a standard action, cannot move and attack, and second Staggered result causes Incapacitated!
                  </p>
                </div>

                <div class="degree-card deg-fourth">
                  <div class="deg-header">
                    <span class="deg-pill">4th Degree Failure</span>
                    <span class="deg-math font-mono">Missed DC by 16+</span>
                  </div>
                  <p class="deg-effect">
                    <strong>Incapacitated:</strong> Defenseless, Stunned, and Unaware. The target is out of the fight!
                  </p>
                </div>
              </div>
            </div>

            <!-- Action Buttons Footer -->
            <div class="drawer-actions-strip">
              <button
                type="button"
                class="btn-drawer-action btn-attack-trigger"
                @click="rollAttackCheck"
              >
                <i class="ri-dice-line"></i>
                <span>Roll Attack Check ({{ attackBonusDisplay }})</span>
              </button>
            </div>
          </div>

          <!-- 5. FALLBACK / RULE INSPECTOR -->
          <div v-else class="inspector-content-pane fallback-view">
            <div class="drawer-section">
              <h4 class="section-heading">
                <i class="ri-book-open-line"></i> Game Rule Reference
              </h4>
              <p class="rules-prose">
                {{ data?.description || data?.text || 'Standard Mutants & Masterminds 3rd Edition tactical rules and reference mechanics.' }}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { useUiStore } from '../../stores/uiStore.js';
import { useHeroStore } from '../../stores/heroStore.js';
import { usePowerBuilderStore } from '../../stores/powerBuilderStore.js';
import { getAdvantageRule } from '../../rules/advantages.js';
import { calculatePowerTotalCost } from '../../rules/powerEngine.js';
import { ABILITIES, formatModifier, ABILITY_EDITORIAL } from '../../rules/abilities.js';
import { SKILL_ICONS, SKILL_EDITORIAL } from '../../rules/skillsEditorial.js';
import { DEFENSE_ICONS, DEFENSE_EDITORIAL } from '../../rules/defensesEditorial.js';
import {
  SKILLS,
  getEnhancedRanks,
  getAdvantageNameForSkill,
  getAdvantageBonusForSkill as getAdvBonus,
  calculateTotalSkillBonus,
  isSkillTrainedOnly
} from '../../rules/skills.js';
import { sendFeatureToVTT, isVTTBridgeActive } from '../../services/vttBridge.js';

const uiStore = useUiStore();
const heroStore = useHeroStore();
const builderStore = usePowerBuilderStore();

const scrollerRef = ref(null);

watch([() => uiStore.inspector?.data, () => uiStore.inspector?.isOpen], () => {
  nextTick(() => {
    if (scrollerRef.value) {
      scrollerRef.value.scrollTop = 0;
    }
    setTimeout(() => {
      if (scrollerRef.value) {
        scrollerRef.value.scrollTop = 0;
      }
    }, 40);
  });
});

const isOpen = computed(() => uiStore.inspector?.isOpen || false);
const currentType = computed(() => uiStore.inspector?.type || 'rule');
const data = computed(() => uiStore.inspector?.data || null);
const title = computed(() => {
  if (currentType.value === 'ability') {
    return isAbilityAbsent.value ? `${abName.value} (Absent)` : `${abName.value} ${formatModifier(abTotalRank.value)}`;
  }
  if (currentType.value === 'skill') {
    const nameStr = skSubtype.value ? `${skName.value}: ${skSubtype.value}` : skName.value;
    return isSkillAbsent.value ? `${nameStr} (Absent)` : `${nameStr} ${formatModifier(skTotalBonus.value)}`;
  }
  if (currentType.value === 'defense') {
    const totalVal = heroStore.effectiveCombatDefenses[defKey.value];
    const modStr = isDefStaAbsent.value && defKey.value === 'FORTITUDE' ? 'Immune (-)' : formatModifier(totalVal);
    return `${defName.value} Defense (${modStr})`;
  }
  return uiStore.inspector?.title || 'Details';
});
const subtitle = computed(() => {
  if (currentType.value === 'ability' || currentType.value === 'skill') {
    return '';
  }
  if (currentType.value === 'defense') {
    return `${defEditorial.value.type || 'Defense'} • ${defEditorial.value.cost || '1 PP / Rank'}`;
  }
  return uiStore.inspector?.subtitle || '';
});

function close() {
  uiStore.closeInspector();
}

function handleKeydown(e) {
  if (e.key === 'Escape' && isOpen.value) {
    close();
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});

// Category & Badge Computeds
const typeIcon = computed(() => {
  switch (currentType.value) {
    case 'ability': return 'ri-dashboard-3-line';
    case 'skill': return currentSkillIcon.value;
    case 'defense': return currentDefenseIcon.value;
    case 'advantage': return 'ri-medal-line';
    case 'power': return 'ri-flashlight-line';
    case 'equipment': return 'ri-archive-line';
    case 'attack': return 'ri-sword-line';
    default: return 'ri-book-open-line';
  }
});

const typeLabel = computed(() => {
  switch (currentType.value) {
    case 'ability': return 'Ability Score';
    case 'skill': return 'Skill';
    case 'defense': return 'Defense Trait';
    case 'advantage': return 'Advantage';
    case 'power': return 'Power / Device';
    case 'equipment': return 'Equipment';
    case 'attack': return 'Attack Maneuver';
    default: return 'Rule Guide';
  }
});

const badgeClass = computed(() => {
  switch (currentType.value) {
    case 'ability': return 'badge-amber';
    case 'skill': return 'badge-emerald';
    case 'defense': return 'badge-cyan';
    case 'advantage': return 'badge-amber';
    case 'power': return 'badge-cyan';
    case 'equipment': return 'badge-emerald';
    case 'attack': return 'badge-crimson';
    default: return 'badge-slate';
  }
});

// --- ABILITY SPECIFICS ---
function getStrengthLiftingCapacity(rank) {
  const r = Number(rank);
  if (Number.isNaN(r)) return '-';
  const table = {
    '-5': '1.5 lbs',
    '-4': '3 lbs',
    '-3': '6 lbs',
    '-2': '12 lbs',
    '-1': '25 lbs',
    '0': '50 lbs',
    '1': '100 lbs',
    '2': '200 lbs',
    '3': '400 lbs',
    '4': '800 lbs',
    '5': '1,600 lbs',
    '6': '3,200 lbs (1.5 tons)',
    '7': '3 tons',
    '8': '6 tons',
    '9': '12 tons',
    '10': '25 tons',
    '11': '50 tons',
    '12': '100 tons',
    '13': '200 tons',
    '14': '400 tons',
    '15': '800 tons',
    '16': '1,600 tons',
    '17': '3,200 tons',
    '18': '6,400 tons',
    '19': '12,500 tons',
    '20': '25,000 tons'
  };
  if (r < -5) return '< 1 lb';
  if (r > 20) return `${Math.round(25000 * Math.pow(2, r - 20)).toLocaleString()} tons`;
  return table[String(r)] || `${r * 50} lbs`;
}

const abKey = computed(() => data.value?.key || 'STR');

const ABILITY_ICONS = {
  STR: 'ri-boxing-line',
  STA: 'ri-heart-pulse-line',
  AGL: 'ri-run-line',
  DEX: 'ri-focus-3-line',
  FGT: 'ri-sword-line',
  INT: 'ri-brain-line',
  AWE: 'ri-eye-line',
  PRE: 'ri-vip-crown-line'
};

const currentAbilityIcon = computed(() => {
  return ABILITY_ICONS[abKey.value] || 'ri-shield-star-line';
});

const abConfig = computed(() => ABILITIES.find(a => a.key === abKey.value) || data.value || {});
const abName = computed(() => abConfig.value.name || data.value?.name || 'Strength');
const abDesc = computed(() => data.value?.desc || abConfig.value.desc || 'Physical and mental attribute.');
const abAbsentDesc = computed(() => data.value?.absentDesc || 'Absent trait with zero function.');
const isAbilityAbsent = computed(() => heroStore.isAbilityAbsent(abKey.value));
const abBaseRank = computed(() => Number(heroStore.character.abilities[abKey.value]) || 0);
const abEnhancedRanks = computed(() => heroStore.activeEnhancedTraits?.abilities?.[abKey.value] || 0);
const abTotalRank = computed(() => abBaseRank.value + abEnhancedRanks.value);
const abPPSpent = computed(() => isAbilityAbsent.value ? -10 : abBaseRank.value * 2);
const abLinkedDefenses = computed(() => abConfig.value.linkedDefenses || []);
const strLiftingCapacity = computed(() => getStrengthLiftingCapacity(abTotalRank.value));

const abEditorial = computed(() => {
  return ABILITY_EDITORIAL[abKey.value] || {};
});

function getSkillBonus(skillName) {
  if (isAbilityAbsent.value) return '-';
  const base = abTotalRank.value;
  const bought = (heroStore.character.skills || []).find(s => (s.name || '').toLowerCase() === skillName.toLowerCase());
  const boughtRanks = Number(bought?.ranks ?? bought?.rank ?? 0);
  const enhanced = heroStore.activeEnhancedTraits?.skills?.[skillName] || 0;
  const total = base + boughtRanks + enhanced;
  return formatModifier(total);
}

const abLinkedDefensesWithValues = computed(() => {
  return (abEditorial.value.defenses || []).map(def => {
    const key = def.name.toUpperCase();
    let val = null;
    if (key === 'INITIATIVE') {
      val = heroStore.initiativeTotal;
    } else {
      val = heroStore.effectiveCombatDefenses?.[key] ?? heroStore.defenseTotals?.[key];
    }
    const sign = (val !== null && val !== undefined) ? formatModifier(val) : '-';
    return {
      ...def,
      currentValue: sign
    };
  });
});

const abLinkedSkillsWithValues = computed(() => {
  return (abEditorial.value.skills || []).map(sk => ({
    ...sk,
    currentBonus: getSkillBonus(sk.name)
  }));
});

function incrementBaseRank() {
  if (isAbilityAbsent.value) return;
  heroStore.setAbility(abKey.value, abBaseRank.value + 1);
}

function decrementBaseRank() {
  if (isAbilityAbsent.value) return;
  heroStore.setAbility(abKey.value, abBaseRank.value - 1);
}

function toggleAbsent() {
  heroStore.toggleAbsentAbility(abKey.value);
}

function rollAbilityCheck() {
  if (isAbilityAbsent.value) return;
  const outcome = heroStore.rollCheck(`${abName.value} (${abKey.value}) Check`, abTotalRank.value, null, 'Ability');
  if (outcome) {
    const modStr = abTotalRank.value >= 0 ? `+${abTotalRank.value}` : `${abTotalRank.value}`;
    uiStore.showToast(`Rolled ${abName.value} Check: d20(${outcome.d20}) ${modStr} = ${outcome.total}`, 'info', 3000);
  }
}

function dispatchOrCopyMacro(featureData, macroString, entityName) {
  const dispatched = sendFeatureToVTT(featureData, heroStore.character);
  const bridgeActive = isVTTBridgeActive();

  if (bridgeActive && dispatched) {
    uiStore.showToast(`Broadcasted ${entityName} to Roll20 via VTT Bridge`, 'success', 2500);
  } else {
    if (typeof navigator !== 'undefined' && navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(macroString).catch(() => {});
    }
    uiStore.showToast(`Dispatched to VTT & copied Roll20 macro to clipboard`, 'info', 2500);
  }
}

function broadcastAbility() {
  if (!data.value) return;
  const modStr = isAbilityAbsent.value ? 'Absent (-)' : formatModifier(abTotalRank.value);
  const macro = `&{template:default} {{name=Ability: ${abName.value} (${abKey.value})}} {{Rank=${abBaseRank.value}}} {{Enhanced=+${abEnhancedRanks.value}}} {{Modifier=${modStr}}} {{PP Cost=${abPPSpent.value} PP}}`;
  const featureData = {
    name: `${abName.value} (${abKey.value})`,
    category: 'ability',
    type: 'Ability Score',
    ranks: abBaseRank.value,
    enhancedRanks: abEnhancedRanks.value,
    modifier: abTotalRank.value,
    cost: abPPSpent.value,
    description: isAbilityAbsent.value ? abAbsentDesc.value : abDesc.value
  };
  dispatchOrCopyMacro(featureData, macro, abName.value);
}

// --- SKILL SPECIFICS ---
const skName = computed(() => data.value?.name || 'Acrobatics');
const skSubtype = computed(() => data.value?.subtype || '');
const skDisplayName = computed(() => skSubtype.value ? `${skName.value} (${skSubtype.value})` : skName.value);
const skConfig = computed(() => SKILLS.find(s => s.name === skName.value) || data.value || {});
const skDesc = computed(() => skConfig.value.desc || 'Standard M&M 3e skill.');
const skAbilityKey = computed(() => skConfig.value.ability || data.value?.ability || 'AGL');
const skAbilityName = computed(() => {
  const ab = ABILITIES.find(a => a.key === skAbilityKey.value);
  return ab?.name || skAbilityKey.value;
});
const skCategory = computed(() => skConfig.value.category || data.value?.category || 'Physical');
const currentSkillIcon = computed(() => SKILL_ICONS[skName.value] || 'ri-focus-3-line');
const skEditorial = computed(() => SKILL_EDITORIAL[skName.value] || {});
const isSkillAbsent = computed(() => heroStore.isAbilityAbsent(skAbilityKey.value));

const skAbilityMod = computed(() => {
  if (isSkillAbsent.value) return 0;
  const base = Number(heroStore.character.abilities?.[skAbilityKey.value]) || 0;
  const enh = heroStore.activeEnhancedTraits?.abilities?.[skAbilityKey.value] || 0;
  return base + enh;
});

const skBaseRanks = computed(() => {
  if (skConfig.value.requiresSubtype) {
    const inst = (heroStore.character.skills || []).find(s => 
      (s.name || '').toLowerCase() === skName.value.toLowerCase() &&
      (s.subtype || '').toLowerCase() === skSubtype.value.toLowerCase()
    );
    return Number(inst?.ranks ?? inst?.rank ?? 0);
  }
  const standard = (heroStore.character.skills || []).find(s => (s.name || '').toLowerCase() === skName.value.toLowerCase());
  return Number(standard?.ranks ?? standard?.rank ?? 0);
});

const skEnhancedRanks = computed(() => {
  return getEnhancedRanks(heroStore.activeEnhancedTraits?.skills || {}, skName.value, skSubtype.value);
});

const skAdvantageName = computed(() => {
  return getAdvantageNameForSkill(skName.value);
});

const skAdvantageBonus = computed(() => {
  return getAdvBonus(skName.value, heroStore);
});

const skConditionPenalty = computed(() => {
  return heroStore.circumstancePenalty || 0;
});

const skTotalBonus = computed(() => {
  if (isSkillAbsent.value) return 0;
  return calculateTotalSkillBonus({
    abilityKey: skAbilityKey.value,
    ranks: skBaseRanks.value,
    enhRanks: skEnhancedRanks.value,
    skillName: skName.value,
    heroStore,
    includeCircumstance: true
  });
});

const skPPCost = computed(() => {
  return Math.ceil(skBaseRanks.value / 2);
});

const isSkillTrained = computed(() => {
  return (skBaseRanks.value + skEnhancedRanks.value) > 0;
});

const isTrainedOnly = computed(() => {
  return skConfig.value.trainedOnly || skEditorial.value.trainedOnly || false;
});

const hasJackOfAllTrades = computed(() => {
  return (heroStore.getAdvantageRanks('Jack-of-all-trades') || 0) > 0 ||
         (heroStore.getAdvantageRanks('Jack-of-All-Trades') || 0) > 0;
});

const isSkillUntrainedLocked = computed(() => {
  if (uiStore.bypassTrainedOnly) return false;
  if (!isTrainedOnly.value) return false;
  if (isSkillTrained.value) return false;
  return !hasJackOfAllTrades.value;
});

const skillActionType = computed(() => {
  return skEditorial.value.action || skConfig.value.actionType || 'Standard Action';
});

const skillTraits = computed(() => {
  return skEditorial.value.traits || skConfig.value.traits || [];
});

const synergyAdvantagesStatus = computed(() => {
  const list = skEditorial.value.synergyAdvantages || [];
  return list.map(name => {
    const ranks = heroStore.getAdvantageRanks(name);
    return {
      name,
      hasAdvantage: ranks > 0,
      ranks
    };
  });
});

function handleLockedRoll() {
  uiStore.showToast(`Trained Only: ${skDisplayName.value} cannot be rolled untrained without ranks or Jack-of-all-Trades.`, 'warn', 4000);
}

function incrementSkillRank() {
  if (isSkillAbsent.value) return;
  const newRank = skBaseRanks.value + 1;
  heroStore.setSkillRank(skName.value, skSubtype.value || '', newRank);
}

function decrementSkillRank() {
  if (isSkillAbsent.value) return;
  const newRank = Math.max(0, skBaseRanks.value - 1);
  heroStore.setSkillRank(skName.value, skSubtype.value || '', newRank);
}

function removeSpecializationFromDrawer() {
  if (!skConfig.value.requiresSubtype || !skSubtype.value) return;
  const inst = (heroStore.character.skills || []).find(s => 
    (s.name || '').toLowerCase() === skName.value.toLowerCase() &&
    (s.subtype || '').toLowerCase() === skSubtype.value.toLowerCase()
  );
  if (inst) {
    heroStore.removeSkill(inst.id || inst.name);
    uiStore.showToast(`Removed ${skName.value}: ${skSubtype.value}`, 'info', 2000);
    close();
  }
}

function rollSkillCheck() {
  if (isSkillAbsent.value) return;
  const label = skSubtype.value ? `${skName.value} (${skSubtype.value})` : skName.value;
  const outcome = heroStore.rollCheck(`${label} Check`, skTotalBonus.value, null, 'Skill');
  if (outcome) {
    const modStr = skTotalBonus.value >= 0 ? `+${skTotalBonus.value}` : `${skTotalBonus.value}`;
    uiStore.showToast(`Rolled ${label} Check: d20(${outcome.d20}) ${modStr} = ${outcome.total}`, 'info', 3000);
  }
}

function broadcastSkill() {
  if (!data.value) return;
  const label = skSubtype.value ? `${skName.value} (${skSubtype.value})` : skName.value;
  const modStr = isSkillAbsent.value ? 'Absent (-)' : formatModifier(skTotalBonus.value);
  const macro = `&{template:default} {{name=Skill: ${label}}} {{Governing=${skAbilityKey.value} (${formatModifier(skAbilityMod.value)})}} {{Base Rank=${skBaseRanks.value}}} {{Powers=+${skEnhancedRanks.value}}} {{Bonus=${modStr}}} {{PP Cost=${skPPCost.value} PP}}`;
  const featureData = {
    name: label,
    category: 'skill',
    type: `${skAbilityKey.value} Skill`,
    ranks: skBaseRanks.value,
    enhancedRanks: skEnhancedRanks.value,
    modifier: skTotalBonus.value,
    cost: skPPCost.value,
    description: skEditorial.value.overview || ''
  };
  dispatchOrCopyMacro(featureData, macro, label);
}

// --- DEFENSE SPECIFICS ---
const defKey = computed(() => (data.value?.key || 'DODGE').toUpperCase());
const defEditorial = computed(() => DEFENSE_EDITORIAL[defKey.value] || {});
const defName = computed(() => defEditorial.value.name || data.value?.name || 'Defense');
const defBaseAbility = computed(() => defEditorial.value.baseAbility || 'AGL');
const currentDefenseIcon = computed(() => DEFENSE_ICONS[defKey.value] || 'ri-shield-fill');

const isDefStaAbsent = computed(() => {
  return defBaseAbility.value === 'STA' && heroStore.isAbilityAbsent('STA');
});

const defBaseRank = computed(() => {
  if (isDefStaAbsent.value && defBaseAbility.value === 'STA') return 0;
  return Number(heroStore.character.abilities[defBaseAbility.value]) || 0;
});

const defBoughtRanks = computed(() => {
  if (defKey.value === 'TOUGHNESS') return 0;
  return Number(heroStore.character.defensesBought?.[defKey.value]) || 0;
});

const defEnhRanks = computed(() => {
  return Number(heroStore.activeEnhancedTraits?.defenses?.[defKey.value]) || 0;
});

const defShieldBonus = computed(() => {
  if (defKey.value === 'DODGE' || defKey.value === 'PARRY') {
    return heroStore.equipmentShieldBonus || 0;
  }
  return 0;
});

const defProtectionBonus = computed(() => {
  if (defKey.value !== 'TOUGHNESS') return 0;
  let bonus = 0;
  for (const effect of heroStore.activeEffects) {
    const b = (effect.baseEffect || effect.name || '').toLowerCase();
    if (b === 'protection') {
      bonus += (parseInt(effect.ranks, 10) || 0);
    }
  }
  return bonus;
});

const defEquipmentArmorBonus = computed(() => {
  if (defKey.value !== 'TOUGHNESS') return 0;
  return heroStore.equipmentArmorBonus || 0;
});

const defDefensiveRollBonus = computed(() => {
  if (defKey.value !== 'TOUGHNESS') return 0;
  return heroStore.getAdvantageRanks('Defensive Roll');
});

const defTotalValue = computed(() => {
  if (isDefStaAbsent.value && defKey.value === 'FORTITUDE') return null;
  return heroStore.effectiveCombatDefenses[defKey.value] ?? 0;
});

const defImperviousThreshold = computed(() => {
  let impRanks = 0;
  for (const effect of heroStore.activeEffects) {
    if (effect.extras) {
      for (const ex of effect.extras) {
        if ((ex.name || ex.id || '').toLowerCase().includes('impervious')) {
          impRanks = Math.max(impRanks, parseInt(effect.ranks, 10) || 0);
        }
      }
    }
  }
  return Math.ceil(impRanks / 2);
});

function stepDefenseRank(delta) {
  if (defKey.value === 'TOUGHNESS' || isDefStaAbsent.value) return;
  const current = defBoughtRanks.value;
  heroStore.setDefense(defKey.value, Math.max(0, current + delta));
}

function rollDefenseCheck() {
  if (isDefStaAbsent.value && defKey.value === 'FORTITUDE') return;
  if (defKey.value === 'FORTITUDE' && heroStore.isDying) {
    heroStore.rollDyingCheck();
    return;
  }
  const extra = {};
  if (heroStore.conditionModifiers.checkPenalty !== 0 && (defKey.value === 'FORTITUDE' || defKey.value === 'WILL')) {
    extra.conditionPenalty = heroStore.conditionModifiers.checkPenalty;
  }
  if (heroStore.character.injuries > 0 && defKey.value === 'TOUGHNESS') {
    extra.injuryPenalty = -heroStore.character.injuries;
  }
  const outcome = heroStore.rollCheck(`${defName.value} Resistance`, defTotalValue.value, null, 'Defense', extra);
  if (outcome) {
    const modStr = formatModifier(defTotalValue.value);
    uiStore.showToast(`Rolled ${defName.value} Resistance Check: d20(${outcome.d20}) ${modStr} = ${outcome.total}`, 'info', 3000);
  }
}

function addInjury() {
  heroStore.character.injuries = (heroStore.character.injuries || 0) + 1;
  heroStore.pushHistory();
}

function healInjury() {
  if (heroStore.character.injuries > 0) {
    heroStore.character.injuries--;
    heroStore.pushHistory();
  }
}

const defPlCapInfo = computed(() => {
  const pl = heroStore.character.powerLevel || 10;
  const maxCap = pl * 2;
  const cDefs = heroStore.effectiveCombatDefenses;

  if (defKey.value === 'DODGE' || defKey.value === 'PARRY') {
    const primary = defKey.value === 'DODGE' ? (cDefs.DODGE || 0) : (cDefs.PARRY || 0);
    const paired = cDefs.TOUGHNESS || 0;
    const sum = primary + paired;
    const isExceeded = sum > maxCap;
    return {
      pairs: [
        {
          name: `${defName.value} + Toughness`,
          formula: `${defName.value} (${primary}) + Tough (${paired})`,
          sum,
          maxCap,
          isExceeded,
          badge: isExceeded ? `+${sum - maxCap} EXCEEDED` : 'LEGAL'
        }
      ],
      sum,
      maxCap,
      isExceeded,
      excess: sum - maxCap,
      statusLabel: isExceeded ? `Exceeds Cap (+${sum - maxCap})` : 'Within PL Cap',
      statusClass: isExceeded ? 'cap-exceeded' : 'cap-legal',
      note: isExceeded
        ? `Combined total (${sum}) exceeds the PL ${pl} limit of ${maxCap}. Lower ${defName.value} or Toughness.`
        : `${defName.value} and Toughness are within the PL ${pl} cap (${sum}/${maxCap}).`
    };
  }

  if (defKey.value === 'TOUGHNESS') {
    const tough = cDefs.TOUGHNESS || 0;
    const dodge = cDefs.DODGE || 0;
    const parry = cDefs.PARRY || 0;
    const dodgeSum = dodge + tough;
    const parrySum = parry + tough;
    const isDodgeExceeded = dodgeSum > maxCap;
    const isParryExceeded = parrySum > maxCap;
    const isExceeded = isDodgeExceeded || isParryExceeded;

    const pairs = [
      {
        name: 'Dodge + Toughness',
        formula: `Dodge (${dodge}) + Tough (${tough})`,
        sum: dodgeSum,
        maxCap,
        isExceeded: isDodgeExceeded,
        badge: isDodgeExceeded ? `+${dodgeSum - maxCap} EXCEEDED` : 'LEGAL'
      },
      {
        name: 'Parry + Toughness',
        formula: `Parry (${parry}) + Tough (${tough})`,
        sum: parrySum,
        maxCap,
        isExceeded: isParryExceeded,
        badge: isParryExceeded ? `+${parrySum - maxCap} EXCEEDED` : 'LEGAL'
      }
    ];

    const maxExcess = Math.max(0, dodgeSum - maxCap, parrySum - maxCap);

    return {
      pairs,
      sum: Math.max(dodgeSum, parrySum),
      maxCap,
      isExceeded,
      excess: maxExcess,
      statusLabel: isExceeded ? `Exceeds Cap (+${maxExcess})` : 'Within PL Cap',
      statusClass: isExceeded ? 'cap-exceeded' : 'cap-legal',
      note: isExceeded
        ? `One or both pairings exceed the PL ${pl} limit (${maxCap}). Lower Dodge, Parry, or Toughness.`
        : `Both Dodge and Parry pairings are within the PL ${pl} cap (Max ${maxCap}).`
    };
  }

  if (defKey.value === 'FORTITUDE' || defKey.value === 'WILL') {
    if (isDefStaAbsent.value) {
      const willVal = cDefs.WILL || 0;
      const isExceeded = willVal > pl;
      return {
        pairs: [
          {
            name: 'Will Solo Cap',
            formula: `Will (${willVal}) (Absent STA)`,
            sum: willVal,
            maxCap: pl,
            isExceeded,
            badge: isExceeded ? `+${willVal - pl} EXCEEDED` : 'LEGAL'
          }
        ],
        sum: willVal,
        maxCap: pl,
        isExceeded,
        excess: willVal - pl,
        statusLabel: isExceeded ? `Exceeds Cap (+${willVal - pl})` : 'Within PL Cap',
        statusClass: isExceeded ? 'cap-exceeded' : 'cap-legal',
        note: isExceeded
          ? `Will (${willVal}) exceeds the solo PL ${pl} cap for characters with Absent Stamina.`
          : `Will (${willVal}) is within the solo PL ${pl} cap for characters with Absent Stamina.`
      };
    }

    const fort = cDefs.FORTITUDE || 0;
    const will = cDefs.WILL || 0;
    const sum = fort + will;
    const isExceeded = sum > maxCap;
    return {
      pairs: [
        {
          name: 'Fortitude + Will',
          formula: `Fort (${fort}) + Will (${will})`,
          sum,
          maxCap,
          isExceeded,
          badge: isExceeded ? `+${sum - maxCap} EXCEEDED` : 'LEGAL'
        }
      ],
      sum,
      maxCap,
      isExceeded,
      excess: sum - maxCap,
      statusLabel: isExceeded ? `Exceeds Cap (+${sum - maxCap})` : 'Within PL Cap',
      statusClass: isExceeded ? 'cap-exceeded' : 'cap-legal',
      note: isExceeded
        ? `Fortitude + Will (${sum}) exceeds the PL ${pl} limit (${maxCap}). Lower Fortitude or Will ranks.`
        : `Fortitude and Will are within the PL ${pl} cap (${sum}/${maxCap}).`
    };
  }

  return { pairs: [], sum: 0, maxCap: 20, isExceeded: false, statusLabel: 'Legal', statusClass: 'cap-legal', note: '' };
});

function hasAdvantage(advName) {
  if (!heroStore.character.advantages) return false;
  return heroStore.character.advantages.some(a => (a.name || '').toLowerCase() === advName.toLowerCase());
}

function getAdvantageCurrentRank(advName) {
  const found = heroStore.character.advantages?.find(a => (a.name || '').toLowerCase() === advName.toLowerCase());
  return found ? (found.ranks || 1) : 0;
}

function openSynergyAdvantage(advName) {
  const rule = getAdvantageRule(advName);
  uiStore.openInspector(
    'advantage',
    {
      name: advName,
      ranks: getAdvantageCurrentRank(advName),
      category: rule?.category || 'General',
      cost: rule?.cost || 1,
      description: rule?.desc || ''
    },
    advName,
    rule?.category ? `${rule.category} Advantage` : 'Advantage'
  );
}

function broadcastDefense() {
  if (!data.value) return;
  const modStr = isDefStaAbsent.value && defKey.value === 'FORTITUDE' ? 'Immune (-)' : formatModifier(defTotalValue.value);
  const macro = `&{template:default} {{name=${defName.value} Defense}} {{Base ${defBaseAbility.value}=${formatModifier(defBaseRank.value)}}} {{Purchased=${defBoughtRanks.value} PP}} {{Total Defense=${modStr}}} {{Resistance DC=${isDefStaAbsent.value ? 'Immune' : 10 + (defTotalValue.value || 0)}}}`;
  const featureData = {
    name: `${defName.value} Defense`,
    category: 'defense',
    type: defEditorial.value.type,
    ranks: defBoughtRanks.value,
    modifier: defTotalValue.value,
    description: defEditorial.value.overview || ''
  };
  dispatchOrCopyMacro(featureData, macro, `${defName.value} Defense`);
}

// --- ADVANTAGE SPECIFICS ---
const advRule = computed(() => {
  if (!data.value || currentType.value !== 'advantage') return null;
  return getAdvantageRule(data.value.name);
});

const advCategory = computed(() => {
  if (advRule.value?.category) return advRule.value.category;
  return data.value?.category || 'General';
});

const advCost = computed(() => {
  const rks = data.value?.ranks || 1;
  const costPer = advRule.value?.costPerRank || 1;
  return rks * costPer;
});

const fullAdvDesc = computed(() => {
  if (!data.value) return '';
  return advRule.value?.desc || data.value.desc || data.value.description || 'Expert tabletop advantage providing tactical combat and fortune options.';
});

function broadcastAdvantage() {
  if (!data.value) return;
  const name = data.value.displayName || data.value.name;
  const desc = fullAdvDesc.value;
  const macro = `&{template:default} {{name=Advantage: ${name}}} {{Category=${advCategory.value}}} {{Ranks=${data.value.ranks || 1}}} {{Benefit=${desc}}}`;
  const featureData = {
    name,
    category: 'advantage',
    type: 'Advantage',
    ranks: data.value.ranks || 1,
    cost: advCost.value,
    description: desc,
    specification: data.value.specification || ''
  };
  dispatchOrCopyMacro(featureData, macro, name);
}

// --- POWER SPECIFICS ---
const powerTotalCost = computed(() => {
  if (!data.value) return 0;
  return calculatePowerTotalCost(data.value);
});

const primaryAction = computed(() => {
  if (!data.value) return 'Standard';
  return data.value.action || 'Standard';
});

const primaryRange = computed(() => {
  if (!data.value) return 'Close';
  return data.value.range || 'Close';
});

const primaryDuration = computed(() => {
  if (!data.value) return 'Instant';
  return data.value.duration || 'Instant';
});

const powerDescriptors = computed(() => {
  if (!data.value) return [];
  if (Array.isArray(data.value.descriptors)) return data.value.descriptors;
  if (typeof data.value.descriptors === 'string') {
    return data.value.descriptors.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
});

const allModifiers = computed(() => {
  if (!data.value) return [];
  const extras = (data.value.extras || []).map(e => ({ ...e, type: 'extra' }));
  const flaws = (data.value.flaws || []).map(f => ({ ...f, type: 'flaw' }));
  return [...extras, ...flaws];
});

function formatModCost(mod) {
  const sign = mod.type === 'extra' ? '+' : '-';
  const val = Math.abs(mod.costPerRank || mod.cost || 1);
  return `${sign}${val} PP/rank`;
}

function broadcastPower() {
  if (!data.value) return;
  const name = data.value.name;
  const macro = `&{template:default} {{name=Power: ${name}}} {{Type=${data.value.type || 'Standard'}}} {{Cost=${powerTotalCost.value} PP}} {{Action=${primaryAction.value}}} {{Range=${primaryRange.value}}} {{Duration=${primaryDuration.value}}}`;
  const featureData = {
    name,
    category: 'power',
    type: data.value.type || 'Standard',
    ranks: data.value.ranks || 1,
    cost: powerTotalCost.value,
    action: primaryAction.value,
    range: primaryRange.value,
    duration: primaryDuration.value,
    description: data.value.description || ''
  };
  dispatchOrCopyMacro(featureData, macro, name);
}

function openInPowerStudio() {
  if (!data.value) return;
  close();
  builderStore.loadPower(data.value);
}

// --- EQUIPMENT SPECIFICS ---
function isWeapon(item) {
  if (!item) return false;
  const cat = (item.category || item.type || '').toLowerCase();
  return cat.includes('weapon') || Boolean(item.weapon);
}

function isArmor(item) {
  if (!item) return false;
  const cat = (item.category || item.type || '').toLowerCase();
  return cat.includes('armor') || Boolean(item.armor);
}

const weaponAtkBonus = computed(() => {
  if (!data.value) return 0;
  const range = data.value.weapon?.range || 'Close';
  const abl = range === 'Ranged' ? (heroStore.character.abilities?.DEX || 0) : (heroStore.character.abilities?.FGT || 0);
  return abl;
});

const weaponDC = computed(() => {
  if (!data.value) return 15;
  const dmg = data.value.weapon?.damageBonus || data.value.weapon?.rank || 1;
  const str = heroStore.character.abilities?.STR || 0;
  return 15 + dmg + (data.value.weapon?.strengthBased ? str : 0);
});

const weaponResistance = computed(() => {
  return data.value?.weapon?.resistance || 'Toughness';
});

const weaponRange = computed(() => {
  return data.value?.weapon?.range || 'Close';
});

function formatStatus(status) {
  if (status === 'carried') return 'Carried in Bag';
  if (status === 'stored') return 'Stored at Base';
  return 'Active / Equipped';
}

function cycleStatus() {
  if (!data.value) return;
  const current = data.value.status || 'equipped';
  const next = current === 'equipped' ? 'carried' : (current === 'carried' ? 'stored' : 'equipped');
  data.value.status = next;
  heroStore.saveToStorage();
}

function rollWeaponAtk() {
  if (!data.value) return;
  const name = data.value.name;
  const bonus = weaponAtkBonus.value;
  heroStore.rollCheck(`${name} Strike`, bonus, 10, 'Attack');
}

function broadcastEquipment() {
  if (!data.value) return;
  const name = data.value.name;
  const cost = data.value.epCost ?? data.value.cost ?? 0;
  const macro = `&{template:default} {{name=Gear: ${name}}} {{Category=${data.value.category || 'Equipment'}}} {{Cost=${cost} EP}} {{Status=${formatStatus(data.value.status)}}}`;
  const featureData = {
    name,
    category: 'equipment',
    type: data.value.category || 'Equipment',
    cost,
    status: data.value.status || 'equipped',
    description: data.value.description || ''
  };
  dispatchOrCopyMacro(featureData, macro, name);
}

// --- ATTACK SPECIFICS ---
const attackBonusDisplay = computed(() => {
  if (!data.value) return '+0';
  const b = data.value.rollBonus !== null ? (data.value.effectiveBonus ?? data.value.rollBonus ?? 0) : 0;
  return b >= 0 ? `+${b}` : `${b}`;
});

function rollAttackCheck() {
  if (!data.value) return;
  const atk = data.value;
  const bonus = atk.rollBonus !== null ? (atk.effectiveBonus ?? atk.rollBonus ?? 0) : 0;
  heroStore.rollCheck(`${atk.name} Attack`, bonus, 10, 'Attack');
}
</script>

<style scoped>
/* Backdrop overlay */
.inspector-overlay-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(4, 7, 15, 0.45);
  backdrop-filter: blur(2px);
  z-index: 1040;
}

/* Sliding Drawer Container */
.inspector-sliding-drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 440px;
  max-width: 92vw;
  background: #0f172a;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.65);
  display: flex;
  flex-direction: column;
  z-index: 1050;
  overscroll-behavior: contain;
  user-select: text;
  -webkit-user-select: text;
}

/* Transitions */
.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 0.22s ease;
}

.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}

.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: transform 0.26s cubic-bezier(0.16, 1, 0.3, 1);
}

.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateX(100%);
}

/* Mobile Responsive Drawer (Bottom Sheet) */
@media (max-width: 768px) {
  .inspector-sliding-drawer {
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    max-width: 100vw;
    max-height: 85vh;
    border-left: none;
    border-top: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 16px 16px 0 0;
    box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.7);
  }

  .drawer-slide-enter-from,
  .drawer-slide-leave-to {
    transform: translateY(100%);
  }
}

/* Header Ribbon */
.drawer-header-ribbon {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.95rem 1.15rem;
  background: #111827;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}

.drawer-header-left {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  min-width: 0;
}

.drawer-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  flex-shrink: 0;
}

.badge-amber {
  background: rgba(245, 158, 11, 0.16);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.35);
}

.badge-cyan {
  background: rgba(14, 165, 233, 0.16);
  color: #38bdf8;
  border: 1px solid rgba(14, 165, 233, 0.35);
}

.badge-emerald {
  background: rgba(16, 185, 129, 0.16);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.35);
}

.badge-crimson {
  background: rgba(239, 68, 68, 0.16);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.35);
}

.badge-slate {
  background: rgba(100, 116, 139, 0.16);
  color: #94a3b8;
  border: 1px solid rgba(100, 116, 139, 0.35);
}

.drawer-titles-wrap {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.ability-title-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.ability-title-icon {
  font-size: 1.35rem;
  color: #f59e0b;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.is-ability-title .drawer-main-title {
  font-size: 1.15rem;
}

.drawer-main-title {
  font-size: 1rem;
  font-weight: 800;
  color: #f8fafc;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.01em;
}

.drawer-sub-title {
  font-size: 0.72rem;
  color: #94a3b8;
  text-transform: capitalize;
}

.drawer-header-actions {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;
}

.btn-drawer-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-drawer-close:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.4);
  color: #f87171;
}

/* Body Scroller */
/* Body Scroller & Pane */
.drawer-body-scroller {
  flex: 1;
  overflow-y: auto;
  padding: 1.15rem;
  overscroll-behavior: contain;
  user-select: text;
  -webkit-user-select: text;
}

.inspector-content-pane {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* D&D Beyond-Style Vertical Stat Ledger */
.dndb-stat-ledger {
  display: flex;
  flex-direction: column;
  background: rgba(17, 24, 39, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  overflow: hidden;
}

.ledger-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.62rem 0.85rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: background 0.12s ease;
}

.ledger-row:last-child {
  border-bottom: none;
}

.ledger-row.is-total-row {
  background: rgba(245, 158, 11, 0.04);
}

.ledger-row.has-bonus {
  background: rgba(14, 165, 233, 0.04);
}

.ledger-label-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.ledger-label {
  font-size: 0.82rem;
  font-weight: 700;
  color: #f1f5f9;
  letter-spacing: -0.01em;
}

.ledger-sub {
  font-size: 0.68rem;
  color: #94a3b8;
  line-height: 1.3;
}

.ledger-val {
  font-size: 1rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  text-align: right;
  flex-shrink: 0;
}

.ledger-val.text-lg {
  font-size: 1rem;
}

.ledger-row-status .btn-absent-toggle {
  padding: 0.25rem 0.55rem;
  font-size: 0.72rem;
}

/* Red / Coral Accent Divider Line (D&D Beyond signature) */
.dndb-ledger-divider {
  height: 1px;
  background: rgba(239, 68, 68, 0.35);
  margin: -0.25rem 0;
  width: 100%;
}

/* Primary Roll Action */
.dndb-primary-action-wrap {
  margin-bottom: 0;
}

.btn-dndb-roll-action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.65rem 1rem;
  background: #0284c7;
  border: 1px solid #38bdf8;
  border-radius: 6px;
  color: #ffffff;
  font-size: 0.85rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.btn-dndb-roll-action:hover:not(:disabled) {
  background: #0ea5e9;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(14, 165, 233, 0.25);
}

.btn-dndb-roll-action:active:not(:disabled) {
  transform: scale(0.98);
}

.btn-dndb-roll-action:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: #1e293b;
  border-color: rgba(255, 255, 255, 0.08);
}

.btn-dndb-roll-action:focus-visible {
  outline: 2px solid #38bdf8;
  outline-offset: 2px;
}

/* D&D Beyond-Style Editorial Content */
.dndb-editorial-content {
  display: flex;
  flex-direction: column;
  gap: 1.35rem;
}

.editorial-overview {
  font-size: 0.86rem;
  line-height: 1.65;
  color: #cbd5e1;
  margin: 0;
  border-left: 3px solid rgba(56, 189, 248, 0.45);
  padding: 0.65rem 0.95rem;
  background: rgba(14, 165, 233, 0.04);
  border-radius: 0 6px 6px 0;
}

.editorial-section {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.editorial-heading {
  font-size: 0.86rem;
  font-weight: 800;
  color: #f8fafc;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  letter-spacing: -0.01em;
}

.editorial-heading i {
  color: #38bdf8;
}

.editorial-prose {
  font-size: 0.83rem;
  line-height: 1.55;
  color: #94a3b8;
  margin: 0;
}

.editorial-sub-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.editorial-sub-card {
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  padding: 0.65rem 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  transition: border-color 0.15s ease;
}

.editorial-sub-card:hover {
  border-color: rgba(255, 255, 255, 0.12);
}

.sub-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sub-card-title {
  font-size: 0.84rem;
  font-weight: 700;
  color: #f1f5f9;
}

.sub-card-badge {
  font-size: 0.72rem;
  font-weight: 800;
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
}

.sub-card-badge.def-badge {
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #34d399;
}

.sub-card-badge.skill-badge {
  background: rgba(2, 132, 199, 0.15);
  border: 1px solid rgba(56, 189, 248, 0.3);
  color: #38bdf8;
}

.sub-card-prose {
  font-size: 0.78rem;
  line-height: 1.45;
  color: #94a3b8;
  margin: 0;
}

/* Skill Specific Styles in Inspector */
.skill-accent-icon {
  color: #38bdf8 !important;
}

.skill-title-block {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.skill-header-tags {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.skill-header-ab-tag {
  font-size: 0.65rem;
  font-weight: 800;
  padding: 0.08rem 0.35rem;
  border-radius: 3px;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.skill-header-cat-tag {
  font-size: 0.68rem;
  color: #94a3b8;
  font-weight: 600;
}

.skill-train-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 0.2rem 0.55rem;
  border-radius: 4px;
}

.skill-train-pill.is-trained {
  background: rgba(16, 185, 129, 0.16);
  border: 1px solid rgba(16, 185, 129, 0.35);
  color: #34d399;
}

.skill-train-pill.is-untrained {
  background: rgba(100, 116, 139, 0.16);
  border: 1px solid rgba(100, 116, 139, 0.3);
  color: #94a3b8;
}

.skill-dc-table-wrap {
  background: rgba(17, 24, 39, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  overflow-x: auto;
  overflow-y: hidden;
  margin-top: 0.25rem;
}

.skill-dc-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
  text-align: left;
}

.skill-dc-table th {
  padding: 0.45rem 0.65rem;
  background: rgba(255, 255, 255, 0.03);
  color: #94a3b8;
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  white-space: nowrap;
}

.skill-dc-table td {
  padding: 0.48rem 0.65rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  vertical-align: middle;
  line-height: 1.4;
}

.skill-dc-table tbody tr:last-child td {
  border-bottom: none;
}

.skill-dc-table tbody tr:hover {
  background: rgba(255, 255, 255, 0.025);
}

.skill-dc-table .col-dc {
  width: 68px;
  white-space: nowrap;
}

.skill-dc-table .col-difficulty {
  width: 92px;
  font-weight: 700;
  color: #f1f5f9;
  white-space: nowrap;
}

.skill-dc-table .col-example {
  color: #cbd5e1;
  font-size: 0.76rem;
}

.skill-dc-badge {
  font-size: 0.72rem;
  font-weight: 800;
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.25);
  padding: 0.1rem 0.35rem;
  border-radius: 3px;
  display: inline-block;
  white-space: nowrap;
}

/* Meta Tags Strip in Skill View */
.skill-meta-tags-strip {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
}

.skill-meta-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.28rem;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.18rem 0.5rem;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #cbd5e1;
}

.skill-meta-tag.is-action {
  background: rgba(2, 132, 199, 0.15);
  border-color: rgba(56, 189, 248, 0.35);
  color: #38bdf8;
}

.skill-meta-tag.is-locked {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.4);
  color: #fca5a5;
}

.skill-meta-tag.is-jack {
  background: rgba(168, 85, 247, 0.15);
  border-color: rgba(168, 85, 247, 0.35);
  color: #c084fc;
}

.skill-meta-tag.is-trained-req {
  background: rgba(245, 158, 11, 0.12);
  border-color: rgba(245, 158, 11, 0.3);
  color: #fbbf24;
}

.skill-meta-tag.is-open {
  background: rgba(16, 185, 129, 0.12);
  border-color: rgba(16, 185, 129, 0.3);
  color: #34d399;
}

.skill-meta-tag.is-trait {
  background: rgba(100, 116, 139, 0.15);
  border-color: rgba(100, 116, 139, 0.3);
  color: #94a3b8;
}

.skill-meta-tag.is-bypassed {
  background: rgba(245, 158, 11, 0.15);
  border-color: rgba(245, 158, 11, 0.35);
  color: #fbbf24;
}

.skill-train-pill.is-bypassed {
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.35);
  color: #fbbf24;
}

/* Trained Only Lock Callout Banner */
.skill-lock-callout {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  padding: 0.65rem 0.85rem;
  border-radius: 6px;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.35);
  margin-bottom: 0.85rem;
}

.skill-lock-callout .callout-icon-wrap {
  font-size: 1.1rem;
  color: #ef4444;
  margin-top: 0.1rem;
  flex-shrink: 0;
}

.skill-lock-callout .callout-title {
  display: block;
  font-size: 0.78rem;
  font-weight: 800;
  color: #fca5a5;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.skill-lock-callout .callout-text {
  font-size: 0.75rem;
  color: #cbd5e1;
  margin: 0.2rem 0 0;
  line-height: 1.4;
}

.callout-bypass-action {
  margin-top: 0.6rem;
}

.btn-callout-bypass {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.5);
  color: #fecaca;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.32rem 0.65rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-callout-bypass:hover {
  background: rgba(239, 68, 68, 0.35);
  border-color: #f87171;
  color: #fff;
  transform: translateY(-1px);
}

.btn-callout-bypass:active {
  transform: translateY(0);
}

/* Locked Roll Button */
.btn-dndb-roll-action.is-locked-btn {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.4);
  color: #fca5a5;
}

.btn-dndb-roll-action.is-locked-btn:hover {
  background: rgba(239, 68, 68, 0.25);
  border-color: #ef4444;
  color: #fff;
}

/* Attitude Badges */
.attitude-badge {
  display: inline-block;
  font-size: 0.68rem;
  font-weight: 800;
  padding: 0.12rem 0.45rem;
  border-radius: 3px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.attitude-badge.att-hostile {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #f87171;
}

.attitude-badge.att-unfavorable {
  background: rgba(245, 158, 11, 0.2);
  border: 1px solid rgba(245, 158, 11, 0.4);
  color: #fbbf24;
}

.attitude-badge.att-indifferent {
  background: rgba(100, 116, 139, 0.2);
  border: 1px solid rgba(100, 116, 139, 0.4);
  color: #94a3b8;
}

.attitude-badge.att-favorable {
  background: rgba(16, 185, 129, 0.2);
  border: 1px solid rgba(16, 185, 129, 0.4);
  color: #34d399;
}

.attitude-badge.att-helpful {
  background: rgba(2, 132, 199, 0.2);
  border: 1px solid rgba(56, 189, 248, 0.4);
  color: #38bdf8;
}

/* Synergistic Advantages Grid */
.synergy-adv-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.4rem;
}

.synergy-adv-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.55rem;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 0.75rem;
  color: #94a3b8;
  transition: all 0.15s ease;
}

.synergy-adv-chip.is-active {
  background: rgba(16, 185, 129, 0.12);
  border-color: rgba(16, 185, 129, 0.35);
  color: #f1f5f9;
}

.synergy-adv-chip .adv-chip-name {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.synergy-adv-chip .adv-chip-rank {
  margin-left: auto;
  font-size: 0.68rem;
  font-weight: 800;
  color: #34d399;
}

.spec-manage-strip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.btn-delete-spec-drawer {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.85rem;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #f87171;
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-delete-spec-drawer:hover {
  background: rgba(239, 68, 68, 0.22);
  border-color: rgba(239, 68, 68, 0.5);
  color: #fff;
}

/* STR Benchmarks Card */
.str-benchmarks-card {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 6px;
  padding: 0.75rem 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.bm-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.82rem;
}

.bm-label {
  color: #94a3b8;
  font-weight: 600;
}

.bm-val {
  font-size: 0.95rem;
  font-weight: 800;
}

.bm-note {
  font-size: 0.72rem;
  color: #64748b;
  margin: 0.2rem 0 0;
  line-height: 1.4;
}

/* Stat Bar */
.drawer-stat-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #111827;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 6px;
  padding: 0.65rem 0.85rem;
  flex-wrap: wrap;
}

.stat-cell {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  flex: 1;
  min-width: 70px;
}

.cell-label {
  font-size: 0.6rem;
  font-weight: 800;
  color: #64748b;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.cell-val {
  font-size: 0.85rem;
  font-weight: 700;
  color: #f1f5f9;
}

.text-amber { color: #fbbf24; }
.text-cyan { color: #38bdf8; }
.text-emerald { color: #34d399; }
.text-crimson { color: #f87171; }

/* Sections */
.drawer-section {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  border-bottom: 1px solid rgba(51, 65, 85, 0.35);
  padding-bottom: 0.95rem;
}

.drawer-section:last-of-type {
  border-bottom: none;
}

.section-heading {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.78rem;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin: 0;
}

.rules-prose {
  font-size: 0.84rem;
  line-height: 1.5;
  color: #cbd5e1;
  margin: 0;
}

.rules-prose.sub-notes {
  font-size: 0.8rem;
  color: #94a3b8;
}

/* Modifiers list */
.modifiers-list {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.mod-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.4rem 0.6rem;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.mod-info {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.mod-tag {
  font-size: 0.62rem;
  font-weight: 800;
  padding: 0.1rem 0.35rem;
  border-radius: 3px;
  text-transform: uppercase;
}

.mod-tag.extra {
  background: rgba(14, 165, 233, 0.15);
  color: #38bdf8;
}

.mod-tag.flaw {
  background: rgba(244, 63, 94, 0.15);
  color: #fb7185;
}

.mod-name {
  font-size: 0.82rem;
  color: #f1f5f9;
}

.mod-rank {
  font-size: 0.72rem;
  color: #94a3b8;
}

.mod-cost {
  font-size: 0.78rem;
  font-weight: 700;
  color: #38bdf8;
}

/* Status Cycler Button in Inspector */
.eq-status-cycler-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.55rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  border: 1px solid transparent;
}

.eq-status-cycler-btn.status-equipped {
  background: rgba(16, 185, 129, 0.16);
  border-color: rgba(16, 185, 129, 0.35);
  color: #34d399;
}

.eq-status-cycler-btn.status-carried {
  background: rgba(100, 116, 139, 0.16);
  border-color: rgba(100, 116, 139, 0.35);
  color: #cbd5e1;
}

.eq-status-cycler-btn.status-stored {
  background: rgba(51, 65, 85, 0.2);
  border-color: rgba(51, 65, 85, 0.4);
  color: #64748b;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

/* Weapon Stats Grid */
.weapon-stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.weapon-stat-card {
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 5px;
  padding: 0.5rem 0.65rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.w-label {
  font-size: 0.6rem;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
}

.w-roll-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: rgba(2, 132, 199, 0.2);
  border: 1px solid rgba(56, 189, 248, 0.4);
  color: #38bdf8;
  padding: 0.2rem 0.45rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 800;
  cursor: pointer;
  width: fit-content;
  transition: all 0.15s ease;
}

.w-roll-chip:hover {
  background: rgba(2, 132, 199, 0.35);
  border-color: #38bdf8;
}

.w-roll-chip:active {
  transform: scale(0.96);
}

.w-val {
  font-size: 0.82rem;
  font-weight: 700;
  color: #f1f5f9;
}

/* Attack Check Button */
.attack-check-roll-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: rgba(2, 132, 199, 0.18);
  border: 1px solid rgba(56, 189, 248, 0.4);
  color: #38bdf8;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.15s ease;
}

.attack-check-roll-btn:hover {
  background: rgba(2, 132, 199, 0.3);
  border-color: #38bdf8;
}

/* DC Formula Card */
.dc-formula-card {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 6px;
  padding: 0.65rem 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.formula-line {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.82rem;
  color: #cbd5e1;
}

.formula-label {
  font-size: 0.7rem;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
}

.formula-sub {
  font-size: 0.72rem;
  color: #94a3b8;
}

/* Degrees Ladder */
.degrees-ladder-list {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.degree-card {
  padding: 0.55rem 0.75rem;
  border-radius: 5px;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-left: 3px solid #64748b;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.degree-card.deg-first { border-left-color: #38bdf8; }
.degree-card.deg-second { border-left-color: #fbbf24; }
.degree-card.deg-third { border-left-color: #f97316; }
.degree-card.deg-fourth { border-left-color: #ef4444; }

.deg-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.deg-pill {
  font-size: 0.72rem;
  font-weight: 800;
  color: #f1f5f9;
}

.deg-math {
  font-size: 0.7rem;
  color: #94a3b8;
}

.deg-effect {
  font-size: 0.78rem;
  color: #cbd5e1;
  margin: 0;
  line-height: 1.4;
}

/* Action Buttons Strip */
.drawer-actions-strip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-top: 0.5rem;
}

.btn-drawer-action {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.6rem 0.9rem;
  border-radius: 5px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.btn-drawer-action.btn-broadcast {
  background: rgba(2, 132, 199, 0.15);
  border: 1px solid rgba(56, 189, 248, 0.35);
  color: #38bdf8;
}

.btn-drawer-action.btn-broadcast:hover {
  background: rgba(2, 132, 199, 0.28);
  border-color: #38bdf8;
}

.btn-drawer-action.btn-edit-studio {
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.35);
  color: #fbbf24;
}

.btn-drawer-action.btn-edit-studio:hover {
  background: rgba(245, 158, 11, 0.28);
  border-color: #fbbf24;
}

.btn-drawer-action.btn-attack-trigger {
  background: #0284c7;
  border: 1px solid #38bdf8;
  color: #fff;
}

.btn-drawer-action.btn-attack-trigger:hover {
  background: #0ea5e9;
}

.chips-flex-row {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.descriptor-pill,
.trait-pill {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.12rem 0.45rem;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #cbd5e1;
}

.spec-examples-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.spec-example-chip {
  font-size: 0.72rem;
  padding: 0.2rem 0.45rem;
  border-radius: 4px;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.25);
  color: #fbbf24;
}

/* Ability View Specifics */
.ability-drawer-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  background: rgba(0, 0, 0, 0.25);
  padding: 0.65rem 0.85rem;
  border-radius: 6px;
  border: 1px solid var(--border-subtle);
}

.rank-stepper-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stepper-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
}

.stepper-actions {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  background: rgba(255, 255, 255, 0.04);
  padding: 2px 4px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.step-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  color: #f1f5f9;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.step-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.18);
  border-color: rgba(255, 255, 255, 0.3);
}

.step-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

/* Accessibility: focus-visible keyboard outlines */
.btn-drawer-close:focus-visible,
.btn-drawer-roll:focus-visible,
.btn-absent-toggle:focus-visible,
.step-btn:focus-visible,
.btn-drawer-action:focus-visible,
.attack-check-roll-btn:focus-visible,
.w-roll-chip:focus-visible,
.eq-status-cycler-btn:focus-visible {
  outline: 2px solid #38bdf8;
  outline-offset: 2px;
}

/* Mobile & Touch ergonomics: 44px minimum tap target */
@media (pointer: coarse) {
  .btn-drawer-close {
    min-width: 44px;
    min-height: 44px;
  }

  .btn-absent-toggle {
    min-height: 44px;
    padding: 0.5rem 0.85rem;
  }

  .step-btn {
    min-width: 36px;
    min-height: 36px;
  }
}

.rank-display {
  font-size: 1rem;
  font-weight: 800;
  min-width: 1.8rem;
  text-align: center;
  color: var(--text-primary);
}

.btn-drawer-roll {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.45rem 0.85rem;
  background: var(--accent-primary);
  border: 1px solid var(--accent-secondary);
  border-radius: 5px;
  color: #fff;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-drawer-roll:hover:not(:disabled) {
  background: var(--accent-primary-hover);
  transform: translateY(-1px);
}

.btn-drawer-roll:active:not(:disabled) {
  transform: scale(0.96);
}

.btn-drawer-roll:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-absent-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.25);
  color: #fca5a5;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.35rem 0.65rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-absent-toggle:hover {
  background: rgba(239, 68, 68, 0.18);
  border-color: rgba(239, 68, 68, 0.45);
}

.btn-absent-toggle.active {
  background: rgba(239, 68, 68, 0.25);
  border-color: #ef4444;
  color: #fff;
}

.absent-warning-text {
  font-size: 0.72rem;
  color: #fca5a5;
  margin-top: 0.35rem;
  line-height: 1.35;
}

.derived-stats-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.derived-k {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.derived-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.2rem 0.55rem;
  border-radius: 4px;
}

.defense-chip {
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #34d399;
}

.skill-chip {
  background: rgba(2, 132, 199, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.3);
  color: #38bdf8;
}

.str-lift-metric-box {
  background: rgba(0, 0, 0, 0.25);
  padding: 0.65rem 0.85rem;
  border-radius: 6px;
  border: 1px solid var(--border-subtle);
}

.lift-main-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.lift-label {
  font-size: 0.78rem;
  color: var(--text-secondary);
}

.lift-val {
  font-size: 0.95rem;
  font-weight: 800;
}

/* Defense View Specifics */
.def-accent-icon {
  color: #38bdf8;
  filter: drop-shadow(0 0 10px rgba(56, 189, 248, 0.35));
}

.total-dc-pill {
  font-size: 0.65rem;
  font-weight: 800;
  color: #fbbf24;
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.35);
  padding: 0.1rem 0.35rem;
  border-radius: 3px;
  margin-left: 0.4rem;
  letter-spacing: 0.02em;
}

.btn-dndb-roll-action.is-dying-action {
  background: rgba(239, 68, 68, 0.2) !important;
  border-color: #ef4444 !important;
  color: #fca5a5 !important;
  animation: pulse-danger 1.8s infinite;
}

.def-pl-audit-card {
  padding: 0.8rem 0.95rem;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.def-pl-audit-card.cap-legal {
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.25);
}

.def-pl-audit-card.cap-exceeded {
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.4);
}

.audit-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.audit-title-wrap {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.def-pl-audit-card.cap-legal .audit-title-wrap {
  color: #34d399;
}

.def-pl-audit-card.cap-exceeded .audit-title-wrap {
  color: #f87171;
}

.audit-status-badge {
  font-size: 0.65rem;
  font-weight: 800;
  padding: 0.1rem 0.4rem;
  border-radius: 3px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.audit-status-badge.cap-legal {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.4);
}

.audit-status-badge.cap-exceeded {
  background: rgba(239, 68, 68, 0.25);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.5);
}

.audit-pairs-list {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  margin: 0.1rem 0;
}

.audit-pair-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.35rem;
  padding: 0.35rem 0.5rem;
  background: rgba(0, 0, 0, 0.32);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 4px;
  font-size: 0.77rem;
}

.audit-pair-row.pair-exceeded {
  border-color: rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.08);
}

.pair-formula {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: #e2e8f0;
  white-space: nowrap;
}

.pair-formula-text {
  color: #cbd5e1;
}

.pair-eq {
  color: #64748b;
  font-weight: 600;
}

.pair-sum {
  color: #f8fafc;
  font-weight: 800;
}

.pair-exceeded .pair-sum {
  color: #fca5a5;
}

.pair-cap {
  color: #94a3b8;
  font-size: 0.76rem;
}

.pair-mini-badge {
  font-size: 0.65rem;
  font-weight: 800;
  padding: 0.12rem 0.45rem;
  border-radius: 3px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  white-space: nowrap;
  flex-shrink: 0;
}

.pair-mini-badge.badge-ok {
  background: rgba(16, 185, 129, 0.18);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.35);
}

.pair-mini-badge.badge-bad {
  background: rgba(239, 68, 68, 0.25);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.5);
}

.audit-note-text {
  font-size: 0.76rem;
  color: #cbd5e1;
  margin: 0;
  line-height: 1.5;
  padding-top: 0.5rem;
  border-top: 1px dashed rgba(255, 255, 255, 0.08);
}

.toughness-workshop-section {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.workshop-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 0.65rem;
}

.workshop-mini-card {
  background: rgba(0, 0, 0, 0.28);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 6px;
  padding: 0.75rem 0.85rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.55rem;
  min-height: 100px;
}

.workshop-mini-card.has-injuries {
  border-color: rgba(239, 68, 68, 0.4);
  background: rgba(239, 68, 68, 0.06);
}

.mini-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.mini-card-label {
  font-size: 0.68rem;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.mini-card-val {
  font-size: 0.85rem;
  font-weight: 800;
}

.mini-card-desc {
  font-size: 0.74rem;
  color: #cbd5e1;
  margin: 0;
  line-height: 1.45;
}

.injury-counter-wrap {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.btn-injury-step {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 3px;
  color: #f1f5f9;
  font-size: 0.85rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-injury-step:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.18);
  border-color: #38bdf8;
}

.btn-injury-step:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.injury-num {
  font-size: 0.95rem;
  min-width: 1.2rem;
  text-align: center;
}

.synergy-adv-chip.is-clickable {
  cursor: pointer;
}

.synergy-adv-chip.is-clickable:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
}

.synergy-adv-chip.is-clickable:hover .adv-chip-name {
  color: #38bdf8;
}
</style>
