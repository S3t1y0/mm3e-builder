<template>
  <div class="compound-power-studio">
    <!-- M&M 3e Linked Consistency Alert Banner -->
    <div
      v-if="validation.linkedMismatchCount > 0"
      class="linked-warning-card"
    >
      <div class="warning-left">
        <i class="ri-error-warning-fill"></i>
        <div class="warning-text">
          <h5 class="warning-title">Linked Effect Rule Discrepancy (DHH p. 147)</h5>
          <p class="warning-desc">
            Effects linked to trigger together must have the same Action and Range as the Primary Effect ({{ validation.primaryAction }}, {{ validation.primaryRange }}).
          </p>
          <ul class="warning-bullets">
            <li v-for="(warn, wIdx) in validation.warnings" :key="'warn_' + wIdx">
              {{ warn.message }}
            </li>
          </ul>
        </div>
      </div>
      <button
        type="button"
        class="btn-harmonize"
        @click="builderStore.harmonizeLinkedCompoundEffects"
      >
        <i class="ri-equalizer-line"></i>
        <span>Align with Primary Effect</span>
      </button>
    </div>

    <!-- Sub-Effects Horizontal Tabs Bar -->
    <div class="compound-tabs-nav-bar">
      <div class="compound-tabs-scroll">
        <button
          v-for="(sub, idx) in builderStore.power.compoundEffects"
          :key="sub.id || idx"
          type="button"
          class="compound-tab-item"
          :class="{
            active: builderStore.activeCompoundIndex === idx,
            'is-primary': sub.isPrimaryAction,
            'is-linked': sub.isLinked
          }"
          @click="builderStore.selectCompoundEffect(idx)"
        >
          <div class="tab-indicator-cluster">
            <span
              v-if="sub.isPrimaryAction"
              class="badge-primary-action"
              title="Primary Action (Sets Action & Range baseline for Linked Effects)"
            >
              PRI
            </span>
            <span
              v-else-if="sub.isLinked"
              class="badge-linked"
              title="Linked to trigger simultaneously with Primary Action"
            >
              <i class="ri-links-line"></i>
            </span>
            <span
              v-else
              class="badge-standalone"
              title="Standalone suite trait"
            >
              <i class="ri-checkbox-blank-circle-line"></i>
            </span>
          </div>

          <i :class="getEffectIcon(sub.effect?.baseEffect)" class="tab-icon"></i>

          <div class="tab-label-group">
            <span class="tab-title">{{ sub.name || `Component #${idx + 1}` }}</span>
            <span class="tab-subtitle">{{ sub.effect?.baseEffect }} {{ sub.effect?.ranks }}R</span>
          </div>

          <span class="tab-cost-chip">{{ getSubEffectCost(sub) }} PP</span>

          <!-- Delete button if more than 1 -->
          <button
            v-if="builderStore.power.compoundEffects?.length > 1"
            type="button"
            class="tab-close-icon"
            title="Remove this sub-effect"
            @click.stop="builderStore.removeCompoundEffect(idx)"
          >
            <i class="ri-close-line"></i>
          </button>
        </button>
      </div>

      <!-- Add Sub-Effect Button -->
      <button
        type="button"
        class="btn-add-compound-effect"
        @click="builderStore.addCompoundEffect('New Effect', 'Damage', true)"
      >
        <i class="ri-add-line"></i>
        <span>Add Sub-Effect</span>
      </button>
    </div>

    <!-- Active Component Controls & Canvas -->
    <div v-if="activeSub" class="active-component-workspace">
      <div class="component-meta-row">
        <div class="name-input-group">
          <label class="meta-label">Component Name</label>
          <input
            v-model="activeSub.name"
            type="text"
            class="component-name-field"
            placeholder="e.g. Frostbite Damage, Hypothermia Affliction..."
          />
        </div>

        <div class="linking-controls-group">
          <button
            type="button"
            class="btn-primary-toggle"
            :class="{ active: activeSub.isPrimaryAction }"
            @click="builderStore.setPrimaryCompoundEffect(builderStore.activeCompoundIndex)"
            :title="activeSub.isPrimaryAction ? 'Current Primary Effect' : 'Designate as Primary Effect'"
          >
            <i :class="activeSub.isPrimaryAction ? 'ri-star-fill' : 'ri-star-line'"></i>
            <span>{{ activeSub.isPrimaryAction ? 'Primary Action Effect' : 'Make Primary' }}</span>
          </button>

          <!-- Reorder Buttons -->
          <div class="reorder-btn-group">
            <button
              type="button"
              class="btn-reorder"
              :disabled="builderStore.activeCompoundIndex === 0"
              @click="builderStore.reorderCompoundEffects(builderStore.activeCompoundIndex, builderStore.activeCompoundIndex - 1)"
              title="Move Left / Earlier"
            >
              <i class="ri-arrow-left-s-line"></i>
            </button>
            <button
              type="button"
              class="btn-reorder"
              :disabled="builderStore.activeCompoundIndex >= (builderStore.power.compoundEffects?.length || 1) - 1"
              @click="builderStore.reorderCompoundEffects(builderStore.activeCompoundIndex, builderStore.activeCompoundIndex + 1)"
              title="Move Right / Later"
            >
              <i class="ri-arrow-right-s-line"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Effect Canvas for the active editing target -->
      <EffectEditorCanvas
        :key="'comp_canvas_' + activeSub.id + '_' + (activeSub.effect?.id || 'eff')"
        :effect="activeSub.effect"
        :title="editorCanvasTitle"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { usePowerBuilderStore } from '../../stores/powerBuilderStore.js';
import { calculateEffectCost, getBaseEffectIcon } from '../../rules/powerEngine.js';
import EffectEditorCanvas from './EffectEditorCanvas.vue';

const builderStore = usePowerBuilderStore();

const activeSub = computed(() => {
  return builderStore.activeCompoundEffect;
});

const validation = computed(() => {
  return builderStore.compoundValidation;
});

const editorCanvasTitle = computed(() => {
  if (!activeSub.value) return 'Component Effect Editor';
  const role = activeSub.value.isPrimaryAction ? 'Primary Action' : (activeSub.value.isLinked ? 'Linked Component' : 'Suite Trait');
  return `Editing: ${activeSub.value.name || 'Component Effect'} [${role}]`;
});

function getSubEffectCost(sub) {
  if (!sub || !sub.effect) return 0;
  return calculateEffectCost(sub.effect, 0).totalCost;
}

function getEffectIcon(baseEffect) {
  return getBaseEffectIcon(baseEffect);
}
</script>

<style scoped>
.compound-power-studio {
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
}

/* Consistency Warning Banner */
.linked-warning-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.35);
  border-radius: var(--radius-md);
  padding: 0.85rem 1.15rem;
}

.warning-left {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.warning-left i {
  color: #fbbf24;
  font-size: 1.35rem;
  margin-top: 0.1rem;
}

.warning-title {
  margin: 0 0 0.2rem 0;
  font-size: 0.82rem;
  font-weight: 800;
  color: #fbbf24;
}

.warning-desc {
  margin: 0;
  font-size: 0.74rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.warning-bullets {
  margin: 0.35rem 0 0 1rem;
  padding: 0;
  font-size: 0.72rem;
  color: #fef08a;
  line-height: 1.35;
}

.btn-harmonize {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: #f59e0b;
  color: #000;
  font-size: 0.75rem;
  font-weight: 800;
  padding: 0.5rem 0.85rem;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  white-space: nowrap;
  transition: all var(--trans-fast);
}

.btn-harmonize:hover {
  background: #fbbf24;
  transform: translateY(-1px);
}

/* Sub-Effects Horizontal Tabs Bar */
.compound-tabs-nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.85rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 0.5rem 0.75rem;
}

.compound-tabs-scroll {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  overflow-x: auto;
  scrollbar-width: thin;
  flex: 1;
}

.compound-tab-item {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.5rem 0.75rem;
  background: var(--bg-surface);
  border: 1.5px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  cursor: pointer;
  white-space: nowrap;
  transition: all var(--trans-fast);
  color: var(--text-secondary);
}

.compound-tab-item:hover {
  background: var(--bg-card-hover);
  border-color: var(--border-color);
  color: var(--text-primary);
}

.compound-tab-item.active {
  background: rgba(139, 92, 246, 0.15);
  border-color: #8b5cf6;
  color: var(--text-primary);
  box-shadow: 0 0 0 1px rgba(139, 92, 246, 0.3);
}

.tab-indicator-cluster {
  display: flex;
  align-items: center;
}

.badge-primary-action {
  font-size: 0.62rem;
  font-weight: 900;
  padding: 0.1rem 0.35rem;
  background: #eab308;
  color: #000;
  border-radius: var(--radius-xs);
  letter-spacing: 0.5px;
}

.badge-linked {
  color: #38bdf8;
  font-size: 0.85rem;
}

.badge-standalone {
  color: var(--text-muted);
  font-size: 0.75rem;
}

.tab-icon {
  font-size: 0.95rem;
  color: #c084fc;
}

.tab-label-group {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.tab-title {
  font-size: 0.78rem;
  font-weight: 700;
  line-height: 1.2;
}

.tab-subtitle {
  font-size: 0.66rem;
  color: var(--text-muted);
  font-family: var(--font-mono);
}

.tab-cost-chip {
  font-size: 0.68rem;
  font-family: var(--font-mono);
  font-weight: 800;
  padding: 0.15rem 0.4rem;
  background: rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-xs);
  color: var(--text-primary);
}

.tab-close-icon {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.1rem;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  border-radius: 50%;
  margin-left: 0.2rem;
  transition: all var(--trans-fast);
}

.tab-close-icon:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.btn-add-compound-effect {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(139, 92, 246, 0.15);
  border: 1px dashed rgba(139, 92, 246, 0.4);
  border-radius: var(--radius-sm);
  color: #c084fc;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.55rem 0.85rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all var(--trans-fast);
}

.btn-add-compound-effect:hover {
  background: rgba(139, 92, 246, 0.25);
  border-color: #8b5cf6;
  color: #fff;
}

/* Active Component Workspace */
.active-component-workspace {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.component-meta-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 0.75rem 1rem;
}

@media (max-width: 800px) {
  .component-meta-row {
    flex-direction: column;
    align-items: stretch;
  }
}

.name-input-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  flex: 1;
}

.meta-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-caps);
}

.component-name-field {
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xs);
  padding: 0.45rem 0.65rem;
  font-size: 0.84rem;
  color: var(--text-primary);
  outline: none;
}

.component-name-field:focus {
  border-color: #8b5cf6;
}

.linking-controls-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.45rem 0.75rem;
  font-size: 0.74rem;
  font-weight: 700;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xs);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--trans-fast);
}

.btn-primary-toggle.active {
  background: rgba(234, 179, 8, 0.15);
  border-color: #eab308;
  color: #fde047;
}

.btn-link-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.45rem 0.75rem;
  font-size: 0.74rem;
  font-weight: 700;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xs);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--trans-fast);
}

.btn-link-toggle.active {
  background: rgba(56, 189, 248, 0.15);
  border-color: #38bdf8;
  color: #38bdf8;
}

.reorder-btn-group {
  display: flex;
  gap: 0.2rem;
}

.btn-reorder {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xs);
  color: var(--text-secondary);
  cursor: pointer;
}

.btn-reorder:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.btn-reorder:not(:disabled):hover {
  background: var(--bg-card-hover);
  border-color: var(--border-color);
  color: var(--text-primary);
}
</style>
