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
</style>
