<template>
  <Teleport to="body">
    <div
      v-if="uiStore.modals.exportStructure"
      class="modal-backdrop"
      @click.self="closeModal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-structure-modal-title"
    >
    <div class="modal-dialog export-structure-dialog">
      <header class="export-modal-header">
        <div class="header-title-wrap">
          <div class="header-icon-badge">
            <i class="ri-equalizer-line"></i>
          </div>
          <div>
            <h2 id="export-structure-modal-title" class="header-title">Export Structure &amp; Detail Settings</h2>
            <p class="header-subtitle">
              Customize power profiling depth, rules references, and visible sections across text exports and Deluxe PDF sheet.
            </p>
          </div>
        </div>

        <button class="btn-modal-close" @click="closeModal" title="Close Settings">
          <i class="ri-close-line"></i>
        </button>
      </header>

      <div class="presets-banner">
        <div class="presets-banner-left">
          <span class="presets-label">QUICK PRESET:</span>
          <div class="preset-buttons">
            <button
              class="preset-btn"
              :class="{ active: currentPreset === 'full' }"
              @click="uiStore.applyExportPreset('full')"
              title="All 16 skills, full effect & modifier rules definitions"
            >
              <i class="ri-file-list-3-line"></i> Full Reference
            </button>
            <button
              class="preset-btn"
              :class="{ active: currentPreset === 'compact' }"
              @click="uiStore.applyExportPreset('compact')"
              title="Clean statblock, trained skills only, no verbose rules descriptions"
            >
              <i class="ri-compass-3-line"></i> Compact Statblock
            </button>
            <button
              class="preset-btn"
              :class="{ active: currentPreset === 'minimal' }"
              @click="uiStore.applyExportPreset('minimal')"
              title="Core stats & powers only; hides equipment, skills, and complications"
            >
              <i class="ri-focus-3-line"></i> Minimalist
            </button>
            <button
              class="preset-btn preset-reset-btn"
              @click="uiStore.resetExportOptions()"
              title="Reset all settings to default Mutants & Masterminds 3E structure"
            >
              <i class="ri-restart-line"></i> Reset Defaults
            </button>
          </div>
        </div>
        <div class="preset-status-tag" :class="'tag-' + currentPreset">
          {{ currentPresetLabel }}
        </div>
      </div>

      <div class="export-modal-body">
        <div class="options-controls-col">
          <div class="options-group">
            <div class="group-header">
              <i class="ri-book-read-line group-icon"></i>
              <span class="group-title">Power Profiling &amp; Rules Depth</span>
            </div>

            <div class="group-items">
              <label class="toggle-card" :class="{ active: uiStore.exportOptions.powerMechanics }">
                <div class="toggle-info">
                  <span class="toggle-name">Power Mechanics Profile</span>
                  <span class="toggle-hint">Action, Range, Duration, DC, and Speed line (e.g. <em>Free Action • Personal Range</em>).</span>
                </div>
                <input
                  type="checkbox"
                  class="toggle-switch"
                  :checked="uiStore.exportOptions.powerMechanics"
                  @change="uiStore.setExportOption('powerMechanics', $event.target.checked)"
                />
              </label>

              <label class="toggle-card" :class="{ active: uiStore.exportOptions.effectRules }">
                <div class="toggle-info">
                  <span class="toggle-name">Base Effect Rules Reference</span>
                  <span class="toggle-hint">Official M&amp;M 3E definitions explaining what each base power effect does mechanically.</span>
                </div>
                <input
                  type="checkbox"
                  class="toggle-switch"
                  :checked="uiStore.exportOptions.effectRules"
                  @change="uiStore.setExportOption('effectRules', $event.target.checked)"
                />
              </label>

              <label class="toggle-card" :class="{ active: uiStore.exportOptions.modifierRules }">
                <div class="toggle-info">
                  <span class="toggle-name">Extra &amp; Flaw Rules Definitions</span>
                  <span class="toggle-hint">Rules explanations for applied extras, flaws, and feats in full text.</span>
                </div>
                <input
                  type="checkbox"
                  class="toggle-switch"
                  :checked="uiStore.exportOptions.modifierRules"
                  @change="uiStore.setExportOption('modifierRules', $event.target.checked)"
                />
              </label>
            </div>
          </div>

          <div class="options-group">
            <div class="group-header">
              <i class="ri-layout-grid-line group-icon"></i>
              <span class="group-title">Sheet Section Visibility</span>
            </div>

            <div class="group-items">
              <label class="toggle-card" :class="{ active: uiStore.exportOptions.showPowers }">
                <div class="toggle-info">
                  <span class="toggle-name">Powers &amp; Devices</span>
                  <span class="toggle-hint">Main powers, containers, alternate effects, and dynamic slots.</span>
                </div>
                <input
                  type="checkbox"
                  class="toggle-switch"
                  :checked="uiStore.exportOptions.showPowers"
                  @change="uiStore.setExportOption('showPowers', $event.target.checked)"
                />
              </label>

              <label class="toggle-card" :class="{ active: uiStore.exportOptions.showOffense }">
                <div class="toggle-info">
                  <span class="toggle-name">Offense &amp; Attack Matrix</span>
                  <span class="toggle-hint">Initiative score and attack roll, DC, and crit profiles.</span>
                </div>
                <input
                  type="checkbox"
                  class="toggle-switch"
                  :checked="uiStore.exportOptions.showOffense"
                  @change="uiStore.setExportOption('showOffense', $event.target.checked)"
                />
              </label>

              <div class="toggle-card toggle-card-complex" :class="{ active: uiStore.exportOptions.showSkills }">
                <div class="toggle-complex-row">
                  <div class="toggle-info">
                    <span class="toggle-name">Skills &amp; Specialties</span>
                    <span class="toggle-hint">Skill ranks, ability scores, and total D20 bonuses.</span>
                  </div>
                  <input
                    type="checkbox"
                    class="toggle-switch"
                    :checked="uiStore.exportOptions.showSkills"
                    @change="uiStore.setExportOption('showSkills', $event.target.checked)"
                  />
                </div>

                <div v-if="uiStore.exportOptions.showSkills" class="skills-submode-row">
                  <span class="submode-label">Display Mode:</span>
                  <div class="submode-pills">
                    <button
                      type="button"
                      class="submode-pill"
                      :class="{ active: uiStore.exportOptions.skillsMode === 'all' }"
                      @click="uiStore.setExportOption('skillsMode', 'all')"
                    >
                      All 16 Core Skills
                    </button>
                    <button
                      type="button"
                      class="submode-pill"
                      :class="{ active: uiStore.exportOptions.skillsMode === 'trained' }"
                      @click="uiStore.setExportOption('skillsMode', 'trained')"
                    >
                      Trained Only
                    </button>
                  </div>
                </div>
              </div>

              <label class="toggle-card" :class="{ active: uiStore.exportOptions.showAdvantages }">
                <div class="toggle-info">
                  <span class="toggle-name">Combat Advantages</span>
                  <span class="toggle-hint">Purchased combat, skill, and general advantages.</span>
                </div>
                <input
                  type="checkbox"
                  class="toggle-switch"
                  :checked="uiStore.exportOptions.showAdvantages"
                  @change="uiStore.setExportOption('showAdvantages', $event.target.checked)"
                />
              </label>

              <label class="toggle-card" :class="{ active: uiStore.exportOptions.showEquipment }">
                <div class="toggle-info">
                  <span class="toggle-name">Gear, Equipment &amp; Vehicles</span>
                  <span class="toggle-hint">Purchased equipment items, weapon descriptions, and EP budget.</span>
                </div>
                <input
                  type="checkbox"
                  class="toggle-switch"
                  :checked="uiStore.exportOptions.showEquipment"
                  @change="uiStore.setExportOption('showEquipment', $event.target.checked)"
                />
              </label>

              <label class="toggle-card" :class="{ active: uiStore.exportOptions.showMovement }">
                <div class="toggle-info">
                  <span class="toggle-name">Movement Modes</span>
                  <span class="toggle-hint">Movement velocities in MPH and feet/round.</span>
                </div>
                <input
                  type="checkbox"
                  class="toggle-switch"
                  :checked="uiStore.exportOptions.showMovement"
                  @change="uiStore.setExportOption('showMovement', $event.target.checked)"
                />
              </label>

              <label class="toggle-card" :class="{ active: uiStore.exportOptions.showComplications }">
                <div class="toggle-info">
                  <span class="toggle-name">Motivations &amp; Complications</span>
                  <span class="toggle-hint">Hero motivations and roleplaying complications that award extra Hero Points.</span>
                </div>
                <input
                  type="checkbox"
                  class="toggle-switch"
                  :checked="uiStore.exportOptions.showComplications"
                  @change="uiStore.setExportOption('showComplications', $event.target.checked)"
                />
              </label>

              <label class="toggle-card" :class="{ active: uiStore.exportOptions.showNotes }">
                <div class="toggle-info">
                  <span class="toggle-name">Background Notes &amp; Tactics</span>
                  <span class="toggle-hint">Tactical combat profile and hero history notes.</span>
                </div>
                <input
                  type="checkbox"
                  class="toggle-switch"
                  :checked="uiStore.exportOptions.showNotes"
                  @change="uiStore.setExportOption('showNotes', $event.target.checked)"
                />
              </label>
            </div>
          </div>
        </div>

        <div class="preview-col">
          <div class="preview-header">
            <div class="preview-title-wrap">
              <i class="ri-eye-line preview-icon"></i>
              <span class="preview-title">Real-Time Live Sheet Preview</span>
            </div>

            <div class="preview-actions">
              <div class="preview-format-tabs">
                <button
                  class="preview-tab"
                  :class="{ active: previewFormat === 'plain' }"
                  @click="previewFormat = 'plain'"
                >
                  Plain Text
                </button>
                <button
                  class="preview-tab"
                  :class="{ active: previewFormat === 'markdown' }"
                  @click="previewFormat = 'markdown'"
                >
                  Markdown
                </button>
              </div>

              <button class="btn-copy-preview" @click="copyPreviewText" :title="copied ? 'Copied!' : 'Copy Preview'">
                <i :class="copied ? 'ri-check-line' : 'ri-file-copy-line'"></i>
                <span>{{ copied ? 'Copied' : 'Copy' }}</span>
              </button>
            </div>
          </div>

          <div class="preview-body">
            <pre class="preview-code-block">{{ livePreviewText }}</pre>
          </div>
        </div>
      </div>

      <footer class="export-modal-footer">
        <div class="footer-hint">
          <i class="ri-save-line"></i>
          <span>Settings automatically sync and persist in your browser storage.</span>
        </div>

        <button class="btn-modal-done" @click="closeModal">
          <i class="ri-check-line"></i>
          <span>Done &amp; Apply</span>
        </button>
      </footer>
    </div>
  </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useHeroStore } from '../../stores/heroStore.js';
import { useUiStore } from '../../stores/uiStore.js';
import { buildPlainTextSheet } from '../../utils/exporters/plainText.js';
import { buildMarkdownSheet } from '../../utils/exporters/markdown.js';
import { syncBodyScrollLock } from '../../utils/seamlessScroll.js';

const heroStore = useHeroStore();
const uiStore = useUiStore();

const previewFormat = ref('plain');
const copied = ref(false);

const currentPreset = computed(() => uiStore.currentExportPreset);

const currentPresetLabel = computed(() => {
  switch (currentPreset.value) {
    case 'full': return 'PRESET: FULL REFERENCE';
    case 'compact': return 'PRESET: COMPACT STATBLOCK';
    case 'minimal': return 'PRESET: MINIMALIST';
    default: return 'CUSTOM CONFIGURATION';
  }
});

const livePreviewText = computed(() => {
  const char = heroStore.character;
  const opts = uiStore.exportOptions;
  if (previewFormat.value === 'markdown') {
    return buildMarkdownSheet(char, heroStore, opts);
  }
  return buildPlainTextSheet(char, heroStore, opts);
});

function closeModal() {
  uiStore.closeModal('exportStructure');
}

function onKeyDown(e) {
  if (e.key === 'Escape' && uiStore.modals.exportStructure) {
    closeModal();
  }
}

watch(
  () => uiStore.modals.exportStructure,
  (isOpen) => {
    if (typeof document !== 'undefined') {
      if (isOpen) {
        document.documentElement.classList.add('modal-open');
        document.body.classList.add('modal-open');
      } else {
        document.documentElement.classList.remove('modal-open');
        document.body.classList.remove('modal-open');
      }
    }
    syncBodyScrollLock();
  },
  { immediate: true }
);

onMounted(() => {
  window.addEventListener('keydown', onKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown);
  if (typeof document !== 'undefined') {
    document.documentElement.classList.remove('modal-open');
    document.body.classList.remove('modal-open');
  }
  syncBodyScrollLock();
});

async function copyPreviewText() {
  try {
    await navigator.clipboard.writeText(livePreviewText.value);
    copied.value = true;
    uiStore.showToast('Preview text copied to clipboard', 'info');
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    uiStore.showToast('Failed to copy to clipboard', 'error');
  }
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(10, 15, 29, 0.82);
  backdrop-filter: blur(8px);
  z-index: 10050;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
  overscroll-behavior: contain;
}

.export-structure-dialog {
  background: var(--bg-card, #0f172a);
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.12));
  border-radius: var(--radius-lg, 14px);
  width: 100%;
  max-width: 1180px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.05);
  overflow: hidden;
  overscroll-behavior: contain;
  animation: modalFadeIn 0.18s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.97) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.export-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.15rem 1.5rem;
  border-bottom: 1px solid #1e293b;
  background: #111c34;
}

.header-title-wrap {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.header-icon-badge {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(6, 182, 212, 0.15));
  border: 1px solid rgba(14, 165, 233, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #38bdf8;
  font-size: 1.35rem;
  flex-shrink: 0;
}

.header-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: #f8fafc;
}

.header-subtitle {
  margin: 0.2rem 0 0;
  font-size: 0.8rem;
  color: #94a3b8;
  line-height: 1.35;
}

.btn-modal-close {
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 1.35rem;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-modal-close:hover {
  background: #1e293b;
  color: #f1f5f9;
}

.presets-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1.5rem;
  background: #0d1527;
  border-bottom: 1px solid #1e293b;
  flex-wrap: wrap;
}

.presets-banner-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.presets-label {
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  color: #64748b;
}

.preset-buttons {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.preset-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: #1e293b;
  border: 1px solid #334155;
  color: #cbd5e1;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.35rem 0.7rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.preset-btn:hover {
  background: #334155;
  color: #f8fafc;
  border-color: #475569;
}

.preset-btn.active {
  background: var(--accent-primary, #006fb8);
  border-color: var(--accent-secondary, #2a8fd6);
  color: #ffffff;
  font-weight: 700;
  box-shadow: none;
}

.preset-reset-btn {
  background: transparent;
  border-color: #334155;
  color: #94a3b8;
}

.preset-reset-btn:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.4);
  color: #fca5a5;
}

.preset-status-tag {
  font-size: 0.68rem;
  font-weight: 800;
  padding: 0.25rem 0.65rem;
  border-radius: 4px;
  letter-spacing: 0.06em;
}

.tag-full {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.tag-compact {
  background: rgba(14, 165, 233, 0.15);
  color: #38bdf8;
  border: 1px solid rgba(14, 165, 233, 0.3);
}

.tag-minimal {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.tag-custom {
  background: rgba(51, 65, 85, 0.5);
  color: #cbd5e1;
  border: 1px solid #475569;
}

.export-modal-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.options-controls-col {
  padding: 1.25rem 1.5rem;
  overflow-y: auto;
  border-right: 1px solid #1e293b;
  display: flex;
  flex-direction: column;
  gap: 1.35rem;
  background: #0f172a;
  overscroll-behavior: contain;
}

.options-group {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding-bottom: 0.35rem;
  border-bottom: 1px solid #1e293b;
}

.group-icon {
  font-size: 0.95rem;
  color: #38bdf8;
}

.group-title {
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #e2e8f0;
}

.group-items {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.toggle-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.85rem;
  padding: 0.65rem 0.85rem;
  background: #131d33;
  border: 1px solid #202d46;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.toggle-card:hover {
  background: #17233d;
  border-color: #334155;
}

.toggle-card.active {
  background: rgba(14, 165, 233, 0.07);
  border-color: rgba(14, 165, 233, 0.35);
}

.toggle-info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.toggle-name {
  font-size: 0.82rem;
  font-weight: 700;
  color: #f1f5f9;
}

.toggle-hint {
  font-size: 0.72rem;
  color: #94a3b8;
  line-height: 1.3;
}

.toggle-switch {
  width: 18px;
  height: 18px;
  accent-color: #0284c7;
  cursor: pointer;
  flex-shrink: 0;
}

.toggle-card-complex {
  flex-direction: column;
  align-items: stretch;
  cursor: default;
}

.toggle-complex-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.85rem;
}

.skills-submode-row {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.submode-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: #94a3b8;
}

.submode-pills {
  display: flex;
  gap: 0.35rem;
}

.submode-pill {
  background: #1e293b;
  border: 1px solid #334155;
  color: #94a3b8;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.2rem 0.55rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.submode-pill:hover {
  color: #f1f5f9;
  border-color: #475569;
}

.submode-pill.active {
  background: #0284c7;
  border-color: #38bdf8;
  color: #ffffff;
  font-weight: 700;
}

/* Right Column: Preview */
.preview-col {
  display: flex;
  flex-direction: column;
  background: #090e1a;
  min-height: 0;
  overflow: hidden;
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  background: #0e1526;
  border-bottom: 1px solid #1e293b;
}

.preview-title-wrap {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.preview-icon {
  color: #10b981;
  font-size: 0.95rem;
}

.preview-title {
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #e2e8f0;
}

.preview-actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.preview-format-tabs {
  display: flex;
  background: #1e293b;
  padding: 2px;
  border-radius: 6px;
  border: 1px solid #334155;
}

.preview-tab {
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.2rem 0.55rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.preview-tab:hover {
  color: #f1f5f9;
}

.preview-tab.active {
  background: var(--accent-primary, #006fb8);
  color: #ffffff;
  font-weight: 700;
}

.btn-copy-preview {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: #1e293b;
  border: 1px solid #334155;
  color: #cbd5e1;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.3rem 0.65rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-copy-preview:hover {
  background: #334155;
  color: #f8fafc;
}

.preview-body {
  flex: 1;
  overflow: auto;
  padding: 1rem 1.25rem;
  overscroll-behavior: contain;
}

.preview-code-block {
  margin: 0;
  font-family: 'Consolas', 'Fira Code', 'Monaco', monospace;
  font-size: 0.74rem;
  line-height: 1.5;
  color: #cbd5e1;
  white-space: pre-wrap;
  word-break: break-word;
  user-select: text;
}

.export-modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.9rem 1.5rem;
  border-top: 1px solid #1e293b;
  background: #111c34;
}

.footer-hint {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.75rem;
  color: #64748b;
}

.footer-hint i {
  color: #10b981;
}

.btn-modal-done {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  background: var(--accent-primary, #006fb8);
  border: 1px solid var(--accent-secondary, #2a8fd6);
  color: #ffffff;
  font-size: 0.85rem;
  font-weight: 700;
  padding: 0.55rem 1.25rem;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  transition: all 0.15s ease;
}

.btn-modal-done:hover {
  background: var(--accent-primary-hover, #005a96);
  transform: translateY(-1px);
}

/* Keyboard focus indicators */
.btn-modal-close:focus-visible,
.preset-btn:focus-visible,
.submode-pill:focus-visible,
.preview-tab:focus-visible,
.btn-copy-preview:focus-visible,
.btn-modal-done:focus-visible {
  outline: 2px solid var(--border-focus, #2a8fd6);
  outline-offset: 2px;
}

.toggle-card:focus-within {
  border-color: var(--border-focus, #2a8fd6);
}

.toggle-switch:focus-visible {
  outline: 2px solid var(--border-focus, #2a8fd6);
  outline-offset: 2px;
}

@media (max-width: 900px) {
  .export-modal-body {
    grid-template-columns: 1fr;
  }
  .options-controls-col {
    border-right: none;
    border-bottom: 1px solid #1e293b;
    max-height: 45vh;
  }
}
</style>
