<template>
  <div class="card conditions-card">
    <div class="conditions-header">
      <div class="title-with-badge">
        <span class="icon"><i class="ri-heart-pulse-line"></i></span>
        <h3 class="section-title">Conditions & Injuries Tracker</h3>
        <span v-if="activeConditions.length > 0" class="badge badge-warning" style="font-size: 0.72rem;">
          {{ activeConditions.length }} Active
        </span>
      </div>
      <button
        v-if="activeConditions.length > 0 || heroStore.character.injuries > 0"
        class="btn btn-secondary btn-xs text-danger"
        @click="clearAll"
      >
        <i class="ri-restart-line"></i> Clear All
      </button>
    </div>

    <!-- DAMAGE & INJURIES TRACKER PANEL -->
    <div class="injury-panel mb-3" :class="{ 'has-injuries': heroStore.character.injuries > 0 }">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.65rem;">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <div class="injury-icon">
            <i class="ri-shield-cross-line"></i>
          </div>
          <div>
            <div style="font-size: 0.85rem; font-weight: 800; color: #fff;">Cumulative Bruises (Damage)</div>
            <div style="font-size: 0.72rem; color: var(--text-secondary);">-1 cumulative penalty on Toughness resistance checks per bruise.</div>
          </div>
        </div>

        <div v-if="heroStore.character.injuries > 0" class="injury-debuff-pill active">
          <i class="ri-arrow-down-line"></i>
          <span>-{{ heroStore.character.injuries }} Toughness Resistance</span>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span style="font-size: 0.72rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase;">BRUISES:</span>
          <div class="stepper-box">
            <button
              class="btn btn-secondary btn-xs"
              :disabled="heroStore.character.injuries <= 0"
              @click="heroStore.adjustInjuries(-1)"
            >-</button>
            <span class="stepper-value" :class="{ wounded: heroStore.character.injuries > 0 }">
              {{ heroStore.character.injuries || 0 }}
            </span>
            <button
              class="btn btn-secondary btn-xs"
              @click="heroStore.adjustInjuries(1)"
            >+</button>
          </div>
        </div>

        <div style="display: flex; gap: 0.35rem;">
          <button
            class="btn btn-secondary btn-xs"
            :disabled="heroStore.character.injuries <= 0"
            @click="heroStore.adjustInjuries(-1)"
          >
            <i class="ri-time-line"></i> Rest 1 Min (-1)
          </button>
          <button
            class="btn btn-secondary btn-xs text-danger"
            :disabled="heroStore.character.injuries <= 0"
            @click="heroStore.clearInjuries()"
          >
            <i class="ri-first-aid-kit-line"></i> Heal All
          </button>
        </div>
      </div>
    </div>

    <!-- DYING SURVIVAL & STABILIZATION MONITOR -->
    <div
      v-if="heroStore.isDying || heroStore.character.dyingFailures > 0 || heroStore.character.isDyingStable"
      class="dying-monitor-panel mb-3"
      :class="{
        'is-deceased': heroStore.isDead,
        'is-stable': heroStore.character.isDyingStable && !heroStore.isDying
      }"
    >
      <div class="dying-monitor-head">
        <div class="dying-title-group">
          <div class="dying-icon-wrap" :class="{ dead: heroStore.isDead, stable: heroStore.character.isDyingStable && !heroStore.isDying }">
            <i :class="heroStore.isDead ? 'ri-skull-line' : (heroStore.character.isDyingStable && !heroStore.isDying ? 'ri-heart-add-line' : 'ri-heart-pulse-fill')"></i>
          </div>
          <div>
            <div class="dying-title-text">
              {{ heroStore.isDead ? 'Hero Deceased (3 Degrees of Failure)' : (heroStore.character.isDyingStable && !heroStore.isDying ? 'Hero Stabilized (Incapacitated)' : 'Dying Condition: Fortitude Survival Monitor') }}
            </div>
            <div class="dying-sub-text">
              {{ heroStore.isDead
                ? 'Character has succumbed to mortal trauma. GM intervention or resurrection required.'
                : (heroStore.character.isDyingStable && !heroStore.isDying
                  ? 'Character is no longer dying but remains incapacitated until awakened or healed.'
                  : 'DC 15 Fortitude check required each round. 2+ degrees of success stabilizes; 3 total failure degrees cause death.')
              }}
            </div>
          </div>
        </div>

        <div class="dying-badge" :class="{ dead: heroStore.isDead, stable: heroStore.character.isDyingStable && !heroStore.isDying }">
          {{ heroStore.isDead ? 'DECEASED' : (heroStore.character.isDyingStable && !heroStore.isDying ? 'STABLE' : `${heroStore.character.dyingFailures || 0} / 3 FAILURES`) }}
        </div>
      </div>

      <!-- Diehard Advantage Callout Banner -->
      <div v-if="heroStore.hasDiehard && heroStore.isDying && !heroStore.isDead" class="diehard-banner">
        <div class="diehard-info">
          <i class="ri-shield-star-line"></i>
          <span><strong>Diehard Advantage:</strong> Automatically stabilize per M&amp;M 3e rules.</span>
        </div>
        <button
          type="button"
          class="btn-diehard-action"
          @click="heroStore.stabilizeHero('Diehard Advantage (Auto-Stabilize)')"
        >
          Auto-Stabilize Now
        </button>
      </div>

      <!-- Death Clock Pips Row -->
      <div v-if="!heroStore.character.isDyingStable || heroStore.isDying" class="death-clock-row">
        <span class="death-clock-label">DEATH CLOCK:</span>
        <div class="failure-pips-flex">
          <div
            v-for="pip in 3"
            :key="pip"
            class="failure-pip"
            :class="{
              filled: (heroStore.character.dyingFailures || 0) >= pip,
              lethal: pip === 3 && (heroStore.character.dyingFailures || 0) >= 3
            }"
            :title="pip === 3 ? '3rd Degree Failure: Mortal Death' : `${pip} Degree of Failure`"
          >
            <span class="pip-num">{{ pip }}</span>
            <span class="pip-state">
              {{ pip === 3 ? 'Death' : (pip === 2 ? 'Critical' : 'Near Brink') }}
            </span>
          </div>
        </div>

        <div class="stepper-box">
          <button
            type="button"
            class="btn btn-secondary btn-xs"
            :disabled="(heroStore.character.dyingFailures || 0) <= 0"
            @click="heroStore.adjustDyingFailures(-1)"
            title="Remove 1 failure degree"
          >-</button>
          <span class="stepper-value" :class="{ wounded: (heroStore.character.dyingFailures || 0) > 0 }">
            {{ heroStore.character.dyingFailures || 0 }}
          </span>
          <button
            type="button"
            class="btn btn-secondary btn-xs"
            :disabled="(heroStore.character.dyingFailures || 0) >= 3"
            @click="heroStore.adjustDyingFailures(1)"
            title="Add 1 failure degree"
          >+</button>
        </div>
      </div>

      <!-- Tactical Action Controls -->
      <div class="dying-actions-grid">
        <!-- 1. Primary Roll Check -->
        <button
          v-if="!heroStore.isDead"
          type="button"
          class="btn-dying-roll"
          @click="handleRollDying"
          title="Roll d20 + Fortitude vs DC 15"
        >
          <i class="ri-dice-line"></i>
          <span>Roll Fortitude Survival (DC 15, Bonus {{ heroStore.effectiveCombatDefenses.FORTITUDE >= 0 ? `+${heroStore.effectiveCombatDefenses.FORTITUDE}` : heroStore.effectiveCombatDefenses.FORTITUDE }})</span>
        </button>

        <!-- 2. Spend Hero Point (Escape Death) -->
        <button
          v-if="!heroStore.isDead"
          type="button"
          class="btn-dying-sec"
          :disabled="heroStore.character.heroPoints <= 0"
          @click="heroStore.spendHeroPointToStabilize()"
          :title="heroStore.character.heroPoints > 0 ? 'Spend 1 Hero Point to automatically stabilize' : 'No Hero Points available'"
        >
          <i class="ri-copper-coin-line"></i>
          <span>Spend 1 HP (Escape Death)</span>
        </button>

        <!-- 3. Ally Treatment Check (DC 15) -->
        <button
          v-if="!heroStore.isDead"
          type="button"
          class="btn-dying-sec"
          @click="heroStore.stabilizeHero('Ally Treatment Check (DC 15)')"
          title="Record successful Treatment check (DC 15) made by an ally"
        >
          <i class="ri-first-aid-kit-line"></i>
          <span>Ally Treatment (DC 15)</span>
        </button>

        <!-- 4. Healing Power / Auto-Stabilize -->
        <button
          v-if="!heroStore.isDead"
          type="button"
          class="btn-dying-sec"
          @click="heroStore.stabilizeHero('Healing Power Effect')"
          title="Stabilize character via Healing power effect"
        >
          <i class="ri-magic-line"></i>
          <span>Heal / Auto-Stabilize</span>
        </button>

        <!-- 5. Reset / Revive -->
        <button
          type="button"
          class="btn-dying-reset"
          @click="handleResetDying"
          title="Reset failure counter and dying state"
        >
          <i class="ri-restart-line"></i>
          <span>{{ heroStore.isDead ? 'Revive / Reset' : 'Reset Tracker' }}</span>
        </button>
      </div>
    </div>

    <!-- TACTICAL COMBAT STATUS / ACTIVE MODIFIERS -->
    <div v-if="heroStore.conditionModifiers.hasMods" class="tactical-status-banner mb-3">
      <div class="tactical-status-head">
        <i class="ri-shield-flash-line"></i>
        <span>Active Combat Effects &amp; Penalties</span>
      </div>
      <div class="tactical-tags-flex">
        <span
          v-for="(tag, idx) in heroStore.conditionModifiers.tags"
          :key="idx"
          class="tactical-tag"
          :class="tag.type"
          :title="tag.reason"
        >
          {{ tag.label }}
        </span>
      </div>
    </div>

    <!-- BASIC CONDITIONS -->
    <div class="mb-3">
      <div class="cond-group-title">BASIC CONDITIONS</div>
      <div class="cond-chips-flex">
        <button
          v-for="c in BASIC_CONDITIONS"
          :key="c.name"
          class="cond-chip"
          :class="{
            active: isDirectlyActive(c.name),
            'active-inherited': isInheritedActive(c.name)
          }"
          :title="isInheritedActive(c.name) ? `${c.name} (Active via combined condition)` : c.desc"
          @click="heroStore.toggleCondition(c.name)"
        >
          <span class="chip-dot"></span>
          <span>{{ c.name }}</span>
        </button>
      </div>
    </div>

    <!-- COMBINED CONDITIONS -->
    <div>
      <div class="cond-group-title">COMBINED CONDITIONS</div>
      <div class="cond-chips-flex">
        <button
          v-for="c in COMBINED_CONDITIONS"
          :key="c.name"
          class="cond-chip combined"
          :class="{ active: isDirectlyActive(c.name) }"
          :title="c.components ? c.components.join(' + ') + ': ' + c.desc : c.desc"
          @click="heroStore.toggleCondition(c.name)"
        >
          <span class="chip-dot"></span>
          <span>{{ c.name }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useHeroStore } from '../../stores/heroStore.js';
import { BASIC_CONDITIONS, COMBINED_CONDITIONS } from '../../rules/conditions.js';

const heroStore = useHeroStore();

const activeConditions = computed(() => heroStore.character.activeConditions || []);

function isDirectlyActive(name) {
  return activeConditions.value.includes(name);
}

function isInheritedActive(name) {
  if (isDirectlyActive(name)) return false;
  return heroStore.activeConditionSet.has(name);
}

function clearAll() {
  heroStore.clearConditions();
  heroStore.clearInjuries();
}

function handleRollDying() {
  heroStore.rollDyingCheck();
}

function handleResetDying() {
  heroStore.resetDyingTracker();
}
</script>

<style scoped>
.conditions-card {
  padding: 1.15rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
}

.conditions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.85rem;
}

.title-with-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.icon {
  color: #f43f5e;
  font-size: 1.15rem;
}

.section-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: #fff;
  margin: 0;
}

.injury-panel {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 0.75rem 1rem;
  transition: all 0.2s ease;
}

.injury-panel.has-injuries {
  border-color: rgba(239, 68, 68, 0.45);
  background: rgba(239, 68, 68, 0.06);
}

.injury-icon {
  width: 30px;
  height: 30px;
  border-radius: var(--radius-sm);
  background: rgba(239, 68, 68, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f87171;
  font-size: 1rem;
}

.injury-debuff-pill {
  font-size: 0.75rem;
  font-weight: 700;
  color: #10b981;
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.25);
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.injury-debuff-pill.active {
  color: #f87171;
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.35);
}

.stepper-box {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.stepper-value {
  font-weight: 800;
  font-size: 0.95rem;
  color: #fff;
  min-width: 24px;
  text-align: center;
}

.stepper-value.wounded {
  color: #f87171;
}

.cond-group-title {
  font-size: 0.68rem;
  font-weight: 800;
  color: var(--text-secondary);
  letter-spacing: 0.04em;
  margin-bottom: 0.4rem;
}

.cond-chips-flex {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.cond-chip {
  padding: 0.25rem 0.55rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-subtle);
  background: var(--bg-card);
  color: var(--text-secondary);
  font-size: 0.72rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.chip-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
}

.cond-chip:hover {
  background: var(--bg-card-hover);
  color: #fff;
}

.cond-chip.active {
  border-color: #f43f5e;
  background: rgba(244, 63, 94, 0.18);
  color: #fda4af;
  font-weight: 700;
}

.cond-chip.active .chip-dot {
  background: #f43f5e;
}

.cond-chip.combined.active {
  border-color: #a855f7;
  background: rgba(168, 85, 247, 0.18);
  color: #d8b4fe;
}

.cond-chip.combined.active .chip-dot {
  background: #a855f7;
}

.cond-chip.active-inherited {
  background: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.35);
  color: #fde68a;
}

.cond-chip.active-inherited .chip-dot {
  background: #f59e0b;
}

.tactical-status-banner {
  background: rgba(225, 29, 72, 0.08);
  border: 1px solid rgba(225, 29, 72, 0.25);
  border-radius: var(--radius-sm);
  padding: 0.6rem 0.85rem;
}

.tactical-status-head {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #fda4af;
  margin-bottom: 0.4rem;
}

.tactical-tags-flex {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.tactical-tag {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-xs, 4px);
  display: inline-flex;
  align-items: center;
}

.tactical-tag.danger {
  background: rgba(239, 68, 68, 0.18);
  border: 1px solid rgba(239, 68, 68, 0.35);
  color: #fca5a5;
}

.tactical-tag.warning {
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: #fcd34d;
}

/* DYING SURVIVAL & STABILIZATION MONITOR */
.dying-monitor-panel {
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(244, 63, 94, 0.4);
  border-radius: var(--radius-sm);
  padding: 0.85rem 1rem;
  transition: all 0.2s ease;
}

.dying-monitor-panel.is-deceased {
  background: rgba(153, 27, 27, 0.15);
  border-color: rgba(239, 68, 68, 0.7);
}

.dying-monitor-panel.is-stable {
  background: rgba(16, 185, 129, 0.08);
  border-color: rgba(16, 185, 129, 0.4);
}

.dying-monitor-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.dying-title-group {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  flex: 1;
  min-width: 240px;
}

.dying-icon-wrap {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  background: rgba(244, 63, 94, 0.18);
  border: 1px solid rgba(244, 63, 94, 0.35);
  color: #fb7185;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.dying-icon-wrap.dead {
  background: rgba(239, 68, 68, 0.25);
  border-color: rgba(239, 68, 68, 0.6);
  color: #fca5a5;
}

.dying-icon-wrap.stable {
  background: rgba(16, 185, 129, 0.18);
  border-color: rgba(16, 185, 129, 0.4);
  color: #6ee7b7;
}

.dying-title-text {
  font-size: 0.88rem;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.25;
}

.dying-sub-text {
  font-size: 0.72rem;
  color: var(--text-secondary);
  line-height: 1.35;
  margin-top: 0.2rem;
}

.dying-badge {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 800;
  padding: 0.22rem 0.6rem;
  border-radius: var(--radius-xs, 4px);
  background: rgba(244, 63, 94, 0.15);
  border: 1px solid rgba(244, 63, 94, 0.35);
  color: #fecdd3;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.dying-badge.dead {
  background: rgba(153, 27, 27, 0.5);
  border-color: #ef4444;
  color: #ffffff;
}

.dying-badge.stable {
  background: rgba(16, 185, 129, 0.15);
  border-color: rgba(16, 185, 129, 0.4);
  color: #a7f3d0;
}

.diehard-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.35);
  border-radius: var(--radius-xs, 4px);
  padding: 0.45rem 0.75rem;
  margin-bottom: 0.75rem;
  font-size: 0.75rem;
  color: #fde68a;
}

.diehard-info {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.btn-diehard-action {
  font-size: 0.72rem;
  font-weight: 800;
  color: #09090b;
  background: #f59e0b;
  border: none;
  border-radius: var(--radius-xs, 4px);
  padding: 0.25rem 0.65rem;
  cursor: pointer;
  transition: all var(--trans-fast, 0.15s ease);
}

.btn-diehard-action:hover {
  background: #fbbf24;
}

.death-clock-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: 0.55rem 0;
  border-top: 1px dashed var(--border-subtle);
  border-bottom: 1px dashed var(--border-subtle);
  margin-bottom: 0.75rem;
}

.death-clock-label {
  font-size: 0.68rem;
  font-weight: 800;
  color: var(--text-secondary);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.failure-pips-flex {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.failure-pip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 60px;
  padding: 0.3rem 0.45rem;
  border-radius: var(--radius-xs, 4px);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.12);
  transition: all 0.2s ease;
}

.failure-pip .pip-num {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--text-muted);
}

.failure-pip .pip-state {
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--text-muted);
}

.failure-pip.filled {
  background: rgba(239, 68, 68, 0.18);
  border-color: rgba(239, 68, 68, 0.5);
}

.failure-pip.filled .pip-num,
.failure-pip.filled .pip-state {
  color: #fca5a5;
}

.failure-pip.lethal.filled {
  background: rgba(153, 27, 27, 0.45);
  border-color: #ef4444;
}

.failure-pip.lethal.filled .pip-num,
.failure-pip.lethal.filled .pip-state {
  color: #ffffff;
}

.dying-actions-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  align-items: center;
}

.btn-dying-roll {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.78rem;
  font-weight: 800;
  background: #e11d48;
  color: #ffffff;
  border: none;
  border-radius: var(--radius-xs, 4px);
  padding: 0.45rem 0.85rem;
  cursor: pointer;
  transition: all var(--trans-fast, 0.15s ease);
}

.btn-dying-roll:hover {
  background: #f43f5e;
  transform: translateY(-1px);
}

.btn-dying-sec {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.72rem;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--border-subtle);
  color: var(--text-primary);
  border-radius: var(--radius-xs, 4px);
  padding: 0.4rem 0.65rem;
  cursor: pointer;
  transition: all var(--trans-fast, 0.15s ease);
}

.btn-dying-sec:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  border-color: var(--border-color);
}

.btn-dying-sec:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.btn-dying-reset {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.72rem;
  font-weight: 700;
  background: transparent;
  border: 1px dashed rgba(255, 255, 255, 0.2);
  color: var(--text-secondary);
  border-radius: var(--radius-xs, 4px);
  padding: 0.4rem 0.65rem;
  cursor: pointer;
  transition: all var(--trans-fast, 0.15s ease);
}

.btn-dying-reset:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  border-color: rgba(255, 255, 255, 0.4);
}
</style>
