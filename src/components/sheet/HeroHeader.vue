<template>
  <!-- Hero Vitals & Identity Bar -->
  <section class="dndb-hero-banner">
    <div class="dndb-hero-identity">
      <div class="dndb-avatar-crest" title="Tactical Operative Registry Emblem">
        <i class="ri-shield-star-fill"></i>
      </div>
      <div class="dndb-name-block">
        <div class="dndb-hero-name-row">
          <input
            v-model="heroStore.character.name"
            type="text"
            class="dndb-name-input"
            placeholder="Hero Codex / Codename"
            @change="heroStore.pushHistory()"
          />
          <span class="dndb-pl-pill">
            <i class="ri-shield-check-line"></i> PL <span class="font-mono">{{ heroStore.character.powerLevel }}</span>
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
            placeholder="Tactical Operative"
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
        <span class="dndb-vital-label"><i class="ri-shield-cross-line"></i> DAMAGE / BRUISES</span>
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
        <div class="dndb-injury-status-row">
          <span v-if="heroStore.character.injuries > 0" class="dndb-vital-sub wounded">
            <i class="ri-arrow-down-line"></i> -{{ heroStore.character.injuries }} Toughness
          </span>
          <span v-else class="dndb-vital-sub normal">
            <i class="ri-shield-check-line"></i> Full Toughness
          </span>
          <button
            v-if="heroStore.character.injuries > 0"
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
      <div class="dndb-vital-box speed-box">
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
import { useHeroStore } from '../../stores/heroStore.js';
import { useUiStore } from '../../stores/uiStore.js';

const heroStore = useHeroStore();
const uiStore = useUiStore();

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
  const initBonus = heroStore.initiativeTotal;
  heroStore.rollCheck('Initiative Roll', initBonus, null, 'Initiative');
}
</script>
