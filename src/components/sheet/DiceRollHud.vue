<template>
  <div
    v-if="heroStore.lastRoll"
    class="dice-roll-hud-dock"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- MAIN TACTICAL TOAST CARD -->
    <div
      class="tactical-roll-card"
      :class="{
        'is-crit': heroStore.lastRoll.isCrit,
        'is-fumble': heroStore.lastRoll.isCritFail,
        'is-reroll': heroStore.lastRoll.isHeroPointReroll,
        'is-rolling-anim': isRolling
      }"
    >
      <!-- Auto-dismiss Progress Bar -->
      <div class="roll-timer-bar-track">
        <div class="roll-timer-bar-fill" :style="{ width: `${progressPercent}%` }"></div>
      </div>

      <div class="card-main-body">
        <!-- 1. DIE & IDENTITY -->
        <div class="die-identity-group">
          <!-- Animated D20 Emblem Box -->
          <div
            class="d20-emblem-box"
            :class="{
              'die-gold': heroStore.lastRoll.isCrit,
              'die-red': heroStore.lastRoll.isCritFail,
              'die-cyan': heroStore.lastRoll.isHeroPointReroll,
              'die-rolling': isRolling
            }"
          >
            <i class="ri-dice-fill dice-icon"></i>
            <span class="d20-val">{{ isRolling ? displayD20 : heroStore.lastRoll.d20 }}</span>
          </div>

          <!-- Roll Title & Formula Info -->
          <div class="roll-meta-info">
            <div class="roll-header-line">
              <span class="roll-name">{{ heroStore.lastRoll.name }}</span>
              <span v-if="heroStore.lastRoll.category" class="category-tag">
                {{ heroStore.lastRoll.category }}
              </span>
            </div>

            <!-- Badges (Crit / Fumble / Hero Point / VTT) -->
            <div class="badges-row">
              <span v-if="heroStore.lastRoll.isCrit" class="roll-badge crit-badge">
                <i class="ri-sparkling-fill"></i> CRITICAL HIT (Nat 20)!
              </span>
              <span v-else-if="heroStore.lastRoll.isCritFail" class="roll-badge fumble-badge">
                <i class="ri-alert-fill"></i> CRITICAL FAILURE (Nat 1)!
              </span>
              <span v-if="heroStore.lastRoll.isHeroPointReroll" class="roll-badge reroll-badge">
                <i class="ri-flashlight-fill"></i> Hero Point Reroll
                <template v-if="heroStore.lastRoll.isBoosted"> (+10 Boost)</template>
              </span>
              <span v-if="vttStatus" class="roll-badge vtt-badge" :class="{ 'vtt-ok': vttStatus.success, 'vtt-err': !vttStatus.success }">
                <i :class="vttStatus.success ? 'ri-broadcast-line' : 'ri-error-warning-line'"></i>
                {{ vttStatus.text }}
              </span>
              <span v-if="heroStore.lastRoll.dcDescription" class="dc-info-chip">
                {{ heroStore.lastRoll.dcDescription }}
              </span>
            </div>

            <!-- Mathematical Formula Breakdown -->
            <div class="formula-line">
              <span class="formula-segment">
                Dadu: <strong>{{ isRolling ? displayD20 : heroStore.lastRoll.d20 }}</strong>
              </span>
              <span class="formula-sep">+</span>
              <span class="formula-segment">
                Mod: <strong>{{ formatMod(heroStore.lastRoll.modifier) }}</strong>
              </span>
              <span class="formula-sep">=</span>
              <span class="formula-result">Total <strong>{{ isRolling ? '...' : heroStore.lastRoll.total }}</strong></span>
            </div>
          </div>
        </div>

        <!-- 2. TOTAL SCORE DISPLAY -->
        <div class="total-score-block">
          <span class="score-label">TOTAL</span>
          <div
            class="score-number"
            :class="{
              'score-gold': heroStore.lastRoll.isCrit,
              'score-red': heroStore.lastRoll.isCritFail,
              'score-cyan': heroStore.lastRoll.isHeroPointReroll
            }"
          >
            {{ isRolling ? '...' : heroStore.lastRoll.total }}
          </div>
        </div>

        <!-- 3. ACTIONS: HERO POINT REROLL & CONTROLS -->
        <div class="card-side-actions">
          <!-- Hero Point Reroll Button -->
          <button
            type="button"
            class="btn-hp-reroll"
            :disabled="heroPointsCount <= 0 || isRolling"
            :title="heroPointsCount > 0 ? `Spend 1 Hero Point to reroll (Result 1..10 gets +10) • ${heroPointsCount} HP remaining` : 'No Hero Points remaining'"
            @click="handleHeroPointReroll"
          >
            <i class="ri-flashlight-fill"></i>
            <span>Reroll ({{ heroPointsCount }} HP)</span>
          </button>

          <div class="mini-tool-buttons">
            <!-- Toggle History Drawer Button -->
            <button
              type="button"
              class="btn-hud-tool"
              :class="{ active: isHistoryOpen }"
              :title="isHistoryOpen ? 'Close Roll History' : 'View Recent Rolls History'"
              @click="isHistoryOpen = !isHistoryOpen"
            >
              <i class="ri-history-line"></i>
            </button>

            <!-- Dismiss Button -->
            <button
              type="button"
              class="btn-hud-tool btn-close"
              title="Dismiss Notification"
              @click="dismissRoll"
            >
              <i class="ri-close-line"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- RECENT ROLLS HISTORY DRAWER (Collapsible) -->
    <transition name="drawer-fade">
      <div v-if="isHistoryOpen" class="history-drawer-panel">
        <div class="history-drawer-header">
          <div class="history-title-group">
            <i class="ri-history-line"></i>
            <strong>Recent Dice Rolls</strong>
            <span class="history-count">({{ heroStore.rollHistory?.length || 0 }})</span>
          </div>
          <button
            type="button"
            class="btn-history-close"
            @click="isHistoryOpen = false"
          >
            <i class="ri-close-line"></i>
          </button>
        </div>

        <div v-if="!heroStore.rollHistory || heroStore.rollHistory.length === 0" class="history-empty">
          No previous rolls in current session.
        </div>
        <div v-else class="history-list">
          <div
            v-for="(r, rIdx) in heroStore.rollHistory"
            :key="r.id || rIdx"
            class="history-row"
            :class="{ 'crit-row': r.isCrit, 'fumble-row': r.isCritFail }"
            @click="selectHistoryRoll(r)"
          >
            <div class="h-die-badge" :class="{ 'die-gold': r.isCrit, 'die-red': r.isCritFail }">
              {{ r.d20 }}
            </div>
            <div class="h-info-col">
              <span class="h-name">{{ r.name }}</span>
              <span class="h-calc">d20 ({{ r.d20 }}) + {{ r.modifier }} = <strong>{{ r.total }}</strong></span>
            </div>
            <div class="h-right-col">
              <span class="h-total">{{ r.total }}</span>
              <span class="h-time">{{ r.timestamp }}</span>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useHeroStore } from '../../stores/heroStore.js';
import { onBridgeStatus } from '../../services/vttBridge.js';
import { rollD20 } from '../../utils/diceRoller.js';

const heroStore = useHeroStore();

// Rolling Scramble State
const isRolling = ref(false);
const displayD20 = ref(20);
let scrambleInterval = null;

// Timer State
const AUTO_DISMISS_MS = 6500;
const progressPercent = ref(100);
const isHovered = ref(false);
const isHistoryOpen = ref(false);
const vttStatus = ref(null);
let timerInterval = null;
let remainingMs = AUTO_DISMISS_MS;
let cleanupBridge = null;

const heroPointsCount = computed(() => {
  return Number(heroStore.character.heroPoints) || 0;
});

function formatMod(mod) {
  const n = Number(mod) || 0;
  return n >= 0 ? `+${n}` : `${n}`;
}

// Scramble rolling suspense effect on new roll
function triggerRollAnimation() {
  if (scrambleInterval) clearInterval(scrambleInterval);
  isRolling.value = true;
  let counter = 0;
  const maxTicks = 8; // ~320ms duration

  scrambleInterval = setInterval(() => {
    displayD20.value = rollD20();
    counter++;
    if (counter >= maxTicks) {
      clearInterval(scrambleInterval);
      scrambleInterval = null;
      displayD20.value = heroStore.lastRoll ? heroStore.lastRoll.d20 : 20;
      isRolling.value = false;
    }
  }, 40);
}

// Auto-dismiss countdown timer logic
function startTimer() {
  stopTimer();
  remainingMs = AUTO_DISMISS_MS;
  progressPercent.value = 100;

  timerInterval = setInterval(() => {
    if (!isHovered.value && !isHistoryOpen.value) {
      remainingMs -= 80;
      progressPercent.value = Math.max(0, (remainingMs / AUTO_DISMISS_MS) * 100);
      if (remainingMs <= 0) {
        dismissRoll();
      }
    }
  }, 80);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function handleMouseEnter() {
  isHovered.value = true;
}

function handleMouseLeave() {
  isHovered.value = false;
}

function dismissRoll() {
  stopTimer();
  heroStore.clearLastRoll();
  isHistoryOpen.value = false;
}

function handleHeroPointReroll() {
  heroStore.rerollWithHeroPoint();
}

function selectHistoryRoll(r) {
  heroStore.lastRoll = { ...r };
}

// Watch for lastRoll changes to retrigger animation and reset timer
watch(
  () => heroStore.lastRoll?.id,
  (newId) => {
    vttStatus.value = null;
    if (newId) {
      triggerRollAnimation();
      startTimer();
    } else {
      stopTimer();
    }
  },
  { immediate: true }
);

onMounted(() => {
  if (heroStore.lastRoll) {
    startTimer();
  }

  cleanupBridge = onBridgeStatus((detail) => {
    if (detail && detail.success && detail.deliveredCount > 0) {
      vttStatus.value = {
        success: true,
        text: `Sent to Roll20 (${detail.deliveredCount} game${detail.deliveredCount > 1 ? 's' : ''})`
      };
    } else if (detail && !detail.success && detail.error) {
      vttStatus.value = {
        success: false,
        text: detail.error
      };
    }
  });
});

onBeforeUnmount(() => {
  stopTimer();
  if (scrambleInterval) clearInterval(scrambleInterval);
  if (cleanupBridge) cleanupBridge();
});
</script>

<style scoped>
/* DOCK POSITIONING: BOTTOM-RIGHT */
.dice-roll-hud-dock {
  position: fixed;
  bottom: 1.75rem;
  right: 1.75rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.65rem;
  max-width: 520px;
  width: calc(100vw - 3.5rem);
  pointer-events: none; /* children re-enable pointer-events */
}

/* TACTICAL CARD */
.tactical-roll-card {
  pointer-events: auto;
  width: 100%;
  background: rgba(15, 23, 42, 0.94);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1.5px solid rgba(255, 255, 255, 0.14);
  border-radius: var(--radius-md);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.7), 0 0 1px rgba(255, 255, 255, 0.3);
  overflow: hidden;
  position: relative;
  transition: border-color var(--trans-fast), box-shadow var(--trans-fast), transform var(--trans-fast);
  animation: cardSlideUp 0.32s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes cardSlideUp {
  from {
    opacity: 0;
    transform: translateY(24px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.tactical-roll-card:hover {
  border-color: rgba(255, 255, 255, 0.28);
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.8), 0 0 20px rgba(56, 189, 248, 0.15);
}

/* TIMER BAR */
.roll-timer-bar-track {
  width: 100%;
  height: 3px;
  background: rgba(255, 255, 255, 0.08);
}

.roll-timer-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #38bdf8, #818cf8);
  transition: width 0.08s linear;
}

/* SPECIAL CARD STATES */
.tactical-roll-card.is-crit {
  border-color: #fbbf24;
  box-shadow: 0 0 30px rgba(251, 191, 36, 0.4), 0 16px 40px rgba(0, 0, 0, 0.8);
}
.tactical-roll-card.is-crit .roll-timer-bar-fill {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}

.tactical-roll-card.is-fumble {
  border-color: #ef4444;
  box-shadow: 0 0 30px rgba(239, 68, 68, 0.4), 0 16px 40px rgba(0, 0, 0, 0.8);
}
.tactical-roll-card.is-fumble .roll-timer-bar-fill {
  background: linear-gradient(90deg, #b91c1c, #ef4444);
}

.tactical-roll-card.is-reroll {
  border-color: #38bdf8;
  box-shadow: 0 0 28px rgba(56, 189, 248, 0.35), 0 16px 40px rgba(0, 0, 0, 0.8);
}

/* MAIN CARD BODY */
.card-main-body {
  padding: 0.85rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.85rem;
}

/* 1. DIE & IDENTITY */
.die-identity-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
  flex: 1;
}

/* D20 EMBLEM BOX */
.d20-emblem-box {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-sm);
  background: rgba(15, 23, 42, 0.8);
  border: 1.5px solid rgba(56, 189, 248, 0.4);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  transition: transform var(--trans-fast), border-color var(--trans-fast);
}

.d20-emblem-box .dice-icon {
  font-size: 0.95rem;
  color: #38bdf8;
  line-height: 1;
  transition: transform 0.2s ease;
}

.d20-emblem-box.die-rolling .dice-icon {
  animation: diceSpin 0.35s infinite linear;
}

@keyframes diceSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.d20-val {
  font-size: 1.15rem;
  font-weight: 900;
  color: #fff;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}

.d20-emblem-box.die-gold {
  border-color: #fbbf24;
  background: rgba(251, 191, 36, 0.15);
}
.d20-emblem-box.die-gold .dice-icon,
.d20-emblem-box.die-gold .d20-val {
  color: #fbbf24;
}

.d20-emblem-box.die-red {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.15);
}
.d20-emblem-box.die-red .dice-icon,
.d20-emblem-box.die-red .d20-val {
  color: #f87171;
}

.d20-emblem-box.die-cyan {
  border-color: #38bdf8;
  background: rgba(56, 189, 248, 0.15);
}
.d20-emblem-box.die-cyan .dice-icon,
.d20-emblem-box.die-cyan .d20-val {
  color: #38bdf8;
}

/* ROLL META INFO */
.roll-meta-info {
  display: flex;
  flex-direction: column;
  gap: 0.22rem;
  min-width: 0;
}

.roll-header-line {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-wrap: wrap;
}

.roll-name {
  font-size: 0.92rem;
  font-weight: 800;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 220px;
}

.category-tag {
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 0.05rem 0.35rem;
  border-radius: var(--radius-xs);
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-secondary);
}

/* BADGES */
.badges-row {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.roll-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.65rem;
  font-weight: 900;
  padding: 0.1rem 0.45rem;
  border-radius: var(--radius-pill);
  letter-spacing: 0.02em;
}

.crit-badge {
  background: #fbbf24;
  color: #000;
  box-shadow: 0 0 10px rgba(251, 191, 36, 0.6);
  animation: pulseCrit 1s infinite alternate;
}

@keyframes pulseCrit {
  from { transform: scale(1); }
  to { transform: scale(1.04); }
}

.fumble-badge {
  background: #ef4444;
  color: #fff;
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.6);
}

.reroll-badge {
  background: rgba(56, 189, 248, 0.2);
  border: 1px solid rgba(56, 189, 248, 0.45);
  color: #7dd3fc;
}

.roll-badge.vtt-badge {
  background: rgba(16, 185, 129, 0.18);
  border: 1px solid rgba(16, 185, 129, 0.4);
  color: #34d399;
  letter-spacing: 0.3px;
}

.roll-badge.vtt-badge.vtt-err {
  background: rgba(239, 68, 68, 0.18);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #f87171;
}

.dc-info-chip {
  font-size: 0.65rem;
  font-weight: 700;
  background: rgba(148, 163, 184, 0.12);
  border: 1px solid rgba(148, 163, 184, 0.25);
  color: #cbd5e1;
  padding: 0.1rem 0.4rem;
  border-radius: var(--radius-xs);
}

/* FORMULA LINE */
.formula-line {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.72rem;
  color: var(--text-muted);
}

.formula-segment strong {
  color: var(--text-secondary);
}

.formula-sep {
  color: rgba(255, 255, 255, 0.3);
}

.formula-result strong {
  color: #34d399;
}

/* 2. TOTAL SCORE BLOCK */
.total-score-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 0.5rem;
  border-left: 1px solid rgba(255, 255, 255, 0.08);
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}

.score-label {
  font-size: 0.58rem;
  font-weight: 800;
  color: var(--text-muted);
  letter-spacing: var(--letter-spacing-caps);
  text-transform: uppercase;
}

.score-number {
  font-size: 1.85rem;
  font-weight: 900;
  color: #34d399;
  line-height: 1.05;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}

.score-number.score-gold {
  color: #fbbf24;
  text-shadow: 0 0 16px rgba(251, 191, 36, 0.6);
}

.score-number.score-red {
  color: #f87171;
  text-shadow: 0 0 16px rgba(239, 68, 68, 0.6);
}

.score-number.score-cyan {
  color: #38bdf8;
  text-shadow: 0 0 16px rgba(56, 189, 248, 0.6);
}

/* 3. CARD SIDE ACTIONS */
.card-side-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.4rem;
  flex-shrink: 0;
}

.btn-hp-reroll {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: rgba(56, 189, 248, 0.15);
  border: 1px solid rgba(56, 189, 248, 0.4);
  color: #7dd3fc;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 0.32rem 0.65rem;
  border-radius: var(--radius-xs);
  cursor: pointer;
  transition: all var(--trans-fast);
  white-space: nowrap;
}

.btn-hp-reroll:hover:not(:disabled) {
  background: #0284c7;
  color: #fff;
  border-color: #38bdf8;
  box-shadow: 0 2px 10px rgba(56, 189, 248, 0.35);
  transform: translateY(-1px);
}

.btn-hp-reroll:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  border-color: rgba(255, 255, 255, 0.1);
  color: var(--text-muted);
}

.mini-tool-buttons {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.btn-hud-tool {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: var(--radius-xs);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-muted);
  cursor: pointer;
  font-size: 0.85rem;
  transition: all var(--trans-fast);
}

.btn-hud-tool:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}

.btn-hud-tool.active {
  background: rgba(56, 189, 248, 0.2);
  border-color: rgba(56, 189, 248, 0.45);
  color: #38bdf8;
}

.btn-close:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  border-color: rgba(239, 68, 68, 0.4);
}

/* RECENT ROLLS HISTORY DRAWER */
.history-drawer-panel {
  pointer-events: auto;
  width: 100%;
  background: rgba(15, 23, 42, 0.97);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1.5px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--radius-md);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.7);
  max-height: 260px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.history-drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.55rem 0.85rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.25);
}

.history-title-group {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.78rem;
  color: var(--text-primary);
}

.history-title-group i {
  color: #38bdf8;
}

.history-count {
  font-size: 0.7rem;
  color: var(--text-muted);
}

.btn-history-close {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  padding: 0;
}

.btn-history-close:hover {
  color: #fff;
}

.history-empty {
  padding: 1.25rem;
  text-align: center;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.history-list {
  overflow-y: auto;
  padding: 0.35rem 0.45rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.history-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.55rem;
  padding: 0.4rem 0.55rem;
  border-radius: var(--radius-xs);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid transparent;
  cursor: pointer;
  transition: all var(--trans-fast);
}

.history-row:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.12);
}

.history-row.crit-row {
  border-color: rgba(251, 191, 36, 0.3);
  background: rgba(251, 191, 36, 0.05);
}

.history-row.fumble-row {
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.05);
}

.h-die-badge {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background: rgba(56, 189, 248, 0.15);
  border: 1px solid rgba(56, 189, 248, 0.35);
  color: #7dd3fc;
  font-size: 0.72rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.h-die-badge.die-gold {
  border-color: #fbbf24;
  color: #fbbf24;
  background: rgba(251, 191, 36, 0.2);
}

.h-die-badge.die-red {
  border-color: #ef4444;
  color: #f87171;
  background: rgba(239, 68, 68, 0.2);
}

.h-info-col {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  flex: 1;
  min-width: 0;
}

.h-name {
  font-size: 0.74rem;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.h-calc {
  font-size: 0.65rem;
  color: var(--text-muted);
}

.h-calc strong {
  color: #34d399;
}

.h-right-col {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.1rem;
}

.h-total {
  font-size: 0.95rem;
  font-weight: 900;
  color: #34d399;
  line-height: 1;
}

.h-time {
  font-size: 0.6rem;
  color: var(--text-muted);
}

/* RESPONSIVENESS */
@media (max-width: 640px) {
  .dice-roll-hud-dock {
    bottom: 1rem;
    right: 1rem;
    left: 1rem;
    width: auto;
    max-width: none;
  }

  .card-main-body {
    flex-wrap: wrap;
    gap: 0.65rem;
  }

  .roll-name {
    max-width: 140px;
  }
}
</style>
