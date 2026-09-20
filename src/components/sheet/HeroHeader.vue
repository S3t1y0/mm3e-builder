<template>
  <!-- Hero Vitals & Identity Bar -->
  <section class="dndb-hero-banner">
    <div class="dndb-hero-identity">
      <div class="dndb-avatar-crest" title="Hero Crest">
        <i class="ri-shield-star-fill"></i>
      </div>
      <div class="dndb-name-block">
        <div class="dndb-hero-name-row">
          <input
            v-model="heroStore.character.name"
            type="text"
            class="dndb-name-input"
            placeholder="Hero Name / Codename"
            @change="heroStore.pushHistory()"
          />
          <span v-if="heroStore.isDead" class="hero-status-pill deceased" title="Hero has suffered 3 degrees of failure and is deceased">
            <i class="ri-skull-line"></i> DECEASED
          </span>
          <span v-else-if="heroStore.isDying" class="hero-status-pill dying" title="Hero is near death. Fortitude DC 15 required each round">
            <i class="ri-heart-pulse-fill"></i> DYING ({{ heroStore.character.dyingFailures || 0 }}/3)
          </span>
          <span v-else-if="heroStore.character.isDyingStable && !heroStore.isDying" class="hero-status-pill stable" title="Hero has been stabilized and remains incapacitated">
            <i class="ri-heart-add-line"></i> STABILIZED
          </span>
        </div>
        <div class="dndb-sub-identity-row">
          <input
            v-model="heroStore.character.identity"
            type="text"
            class="dndb-sub-input"
            placeholder="Real Identity (Secret / Public)"
            @change="heroStore.pushHistory()"
          />
          <span class="dndb-dot-sep">•</span>
          <input
            v-model="heroStore.character.player"
            type="text"
            class="dndb-sub-input"
            placeholder="Player Name"
            @change="heroStore.pushHistory()"
          />
          <span class="dndb-dot-sep">•</span>
          <input
            v-model="heroStore.character.baseOfOperations"
            type="text"
            class="dndb-sub-input"
            placeholder="Base of Operations"
            @change="heroStore.pushHistory()"
          />
        </div>

        <!-- INTEGRATED COMBAT CONDITIONS STRIP (OPTION 1) -->
        <div class="dndb-conditions-row" role="region" aria-label="Combat Conditions">
          <!-- When healthy / no conditions active -->
          <div v-if="activeConditionItems.length === 0" class="cond-healthy-wrap">
            <span class="cond-healthy-pill" title="Hero is unhindered with no debilitating combat conditions">
              <i class="ri-shield-check-fill"></i>
              <span>Unhindered</span>
            </span>
            <button
              type="button"
              class="btn-cond-quick-add"
              @click="uiStore.openModal('conditions')"
              title="Apply a combat condition (Dazed, Vulnerable, Stunned, etc.)"
            >
              <i class="ri-add-line"></i>
              <span>Condition</span>
            </button>
          </div>

          <!-- When active conditions exist -->
          <div v-else class="cond-active-chips-wrap">
            <span class="cond-strip-label" title="Active combat conditions affecting this character">
              <i class="ri-heart-pulse-fill"></i>
              <span>CONDITIONS ({{ activeConditionItems.length }}):</span>
            </span>

            <div
              v-for="item in activeConditionItems"
              :key="item.name"
              class="dndb-cond-chip"
              :class="{ 'is-severe': item.isSevere }"
              :title="item.desc ? `${item.name}: ${item.desc}` : item.name"
            >
              <span class="cond-chip-name">{{ item.name }}</span>
              <span v-if="item.briefEffect" class="cond-chip-effect">{{ item.briefEffect }}</span>
              <button
                type="button"
                class="btn-cond-dismiss"
                @click.stop="heroStore.toggleCondition(item.name)"
                :title="`Remove ${item.name} condition`"
                :aria-label="`Remove ${item.name}`"
              >
                <i class="ri-close-line"></i>
              </button>
            </div>

            <button
              type="button"
              class="btn-cond-quick-add"
              @click="uiStore.openModal('conditions')"
              title="Add another combat condition"
            >
              <i class="ri-add-line"></i>
              <span>Add</span>
            </button>

            <button
              v-if="activeConditionItems.length > 1"
              type="button"
              class="btn-cond-clear-all"
              @click="heroStore.clearConditions()"
              title="Clear all active combat conditions"
            >
              <i class="ri-restart-line"></i>
              <span>Clear All</span>
            </button>

            <button
              type="button"
              class="btn-cond-view-tracker"
              @click="openTrackerTab"
              title="Open full Conditions &amp; Injuries Tracker in Action Hub"
            >
              <i class="ri-external-link-line"></i>
              <span>Tracker</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="dndb-hero-vitals-dock">
      <!-- Power Level Stepper -->
      <div class="dndb-vital-box pl-box">
        <span class="dndb-vital-label">POWER LEVEL</span>
        <div class="dndb-vital-stepper">
          <button
            type="button"
            class="step-btn-xs"
            :disabled="heroStore.character.powerLevel <= 1"
            title="Decrease PL"
            @click="setPL(heroStore.character.powerLevel - 1)"
          >-</button>
          <strong class="dndb-vital-val font-mono">{{ heroStore.character.powerLevel }}</strong>
          <button
            type="button"
            class="step-btn-xs"
            :disabled="heroStore.character.powerLevel >= 20"
            title="Increase PL"
            @click="setPL(heroStore.character.powerLevel + 1)"
          >+</button>
        </div>
      </div>

      <!-- Hero Points Stepper -->
      <div class="dndb-vital-box hp-box">
        <span class="dndb-vital-label">HERO POINTS</span>
        <div class="dndb-vital-stepper">
          <button
            type="button"
            class="step-btn-xs"
            :disabled="(heroStore.character.heroPoints || 0) <= 0"
            title="Spend Hero Point"
            @click="adjustHeroPoints(-1)"
          >-</button>
          <strong class="dndb-vital-val font-mono">{{ heroStore.character.heroPoints ?? 1 }}</strong>
          <button
            type="button"
            class="step-btn-xs"
            title="Gain Hero Point"
            @click="adjustHeroPoints(1)"
          >+</button>
        </div>
      </div>

      <!-- Damage & Injuries Stepper (Quick Combat Vitals) -->
      <div
        class="dndb-vital-box damage-box"
        :class="{ 'has-injuries': heroStore.character.injuries > 0 }"
        title="Tracks cumulative bruised penalties from failed Toughness checks"
      >
        <span class="dndb-vital-label"><i class="ri-shield-cross-line"></i> BRUISES & INJURIES</span>
        <div class="dndb-vital-stepper">
          <button
            type="button"
            class="step-btn-xs"
            :disabled="heroStore.character.injuries <= 0"
            title="Recover 1 bruise (1 minute rest)"
            @click="heroStore.adjustInjuries(-1)"
          >-</button>
          <strong class="dndb-vital-val font-mono" :class="{ wounded: heroStore.character.injuries > 0 }">
            {{ heroStore.character.injuries || 0 }}
          </strong>
          <button
            type="button"
            class="step-btn-xs"
            title="Add 1 bruise (+1 injury penalty)"
            @click="heroStore.adjustInjuries(1)"
          >+</button>
        </div>
        <div v-if="heroStore.character.injuries > 0" class="dndb-injury-status-row">
          <span class="dndb-vital-sub wounded">
            <i class="ri-arrow-down-line"></i> -{{ heroStore.character.injuries }} Toughness
          </span>
          <button
            type="button"
            class="btn-injury-quick-heal"
            title="Heal all injuries (Reset to 0)"
            @click="heroStore.clearInjuries()"
          >
            <i class="ri-first-aid-kit-line"></i>
          </button>
        </div>
      </div>

      <!-- Speed / Movement Badge -->
      <div
        class="dndb-vital-box speed-box"
        :class="{
          'is-immobile': heroStore.speedTotal.isImmobile,
          'is-hindered': heroStore.speedTotal.isHindered
        }"
        :title="heroStore.speedTotal.isImmobile ? 'Immobile: Speed 0 (cannot move)' : (heroStore.speedTotal.isHindered ? 'Hindered: Moves at half speed' : 'Normal movement speed')"
      >
        <span class="dndb-vital-label">SPEED</span>
        <strong class="dndb-vital-val font-mono">{{ heroStore.speedTotal.val }}</strong>
        <span class="dndb-vital-sub">{{ heroStore.speedTotal.sub }}</span>
      </div>

      <!-- Initiative Badge -->
      <div class="dndb-vital-box init-box" title="Click to Roll Initiative" @click="rollInitiative">
        <span class="dndb-vital-label">INITIATIVE</span>
        <strong class="dndb-vital-val font-mono">
          {{ heroStore.initiativeTotal >= 0 ? `+${heroStore.initiativeTotal}` : heroStore.initiativeTotal }}
        </strong>
        <span class="dndb-vital-sub"><i class="ri-dice-line"></i> ROLL</span>
      </div>

      <!-- PP Summary Meter -->
      <div class="dndb-vital-box pp-box">
        <span class="dndb-vital-label">POWER POINTS</span>
        <div class="dndb-pp-val-row font-mono">
          <span id="dndb-pp-spent">{{ heroStore.totalSpentPP }}</span> / <span id="dndb-pp-budget">{{ heroStore.totalBudgetPP }}</span> PP
        </div>
        <div class="dndb-pp-mini-bar">
          <div
            class="dndb-pp-progress-fill"
            :class="{ overbudget: heroStore.remainingPP < 0 }"
            :style="{ width: Math.min(100, Math.max(0, Math.round((heroStore.totalSpentPP / heroStore.totalBudgetPP) * 100))) + '%' }"
          ></div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { useHeroStore } from '../../stores/heroStore.js';
import { useUiStore } from '../../stores/uiStore.js';
import {
  BASIC_CONDITIONS,
  COMBINED_CONDITIONS,
  getConditionBriefEffect,
  isConditionSevere
} from '../../rules/conditions.js';

const heroStore = useHeroStore();
const uiStore = useUiStore();

const conditionDescMap = computed(() => {
  const map = {};
  for (const c of BASIC_CONDITIONS) {
    map[c.name] = c.desc;
  }
  for (const c of COMBINED_CONDITIONS) {
    map[c.name] = c.desc;
  }
  return map;
});

const activeConditionItems = computed(() => {
  const active = heroStore.character.activeConditions || [];
  return active.map(name => ({
    name,
    briefEffect: getConditionBriefEffect(name),
    isSevere: isConditionSevere(name),
    desc: conditionDescMap.value[name] || ''
  }));
});

function openTrackerTab() {
  uiStore.setActiveActionHubTab('conditions');
  const hubEl = document.querySelector('.dndb-tabbed-hub');
  if (hubEl) {
    hubEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function setPL(newPL) {
  heroStore.character.powerLevel = Math.max(1, Math.min(20, newPL));
  heroStore.pushHistory();
}

function adjustHeroPoints(delta) {
  const cur = heroStore.character.heroPoints ?? 1;
  heroStore.character.heroPoints = Math.max(0, cur + delta);
  heroStore.pushHistory();
}

function rollInitiative() {
  heroStore.rollInitiative();
}
</script>

<style scoped>
.hero-status-pill {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 800;
  padding: 0.22rem 0.55rem;
  border-radius: var(--radius-xs, 4px);
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.hero-status-pill.deceased {
  background: rgba(239, 68, 68, 0.25);
  border: 1px solid #ef4444;
  color: #ffffff;
}

.hero-status-pill.dying {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.45);
  color: #fca5a5;
}

.hero-status-pill.stable {
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.4);
  color: #a7f3d0;
}
</style>

