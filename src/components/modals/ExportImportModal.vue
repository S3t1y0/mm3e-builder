<template>
  <div v-if="uiStore.modals.exportImport" class="modal-backdrop" @click.self="uiStore.closeModal('exportImport')">
    <div class="modal-card">
      <!-- HEADER -->
      <div class="modal-header">
        <div style="display: flex; align-items: center; gap: 0.65rem;">
          <div class="modal-icon">
            <i class="ri-hard-drive-2-line"></i>
          </div>
          <div>
            <h2 class="modal-title">Storage & Hero Backup</h2>
            <p class="modal-sub">Manage browser local storage, download JSON backups, or import characters</p>
          </div>
        </div>
        <button class="btn btn-ghost btn-sm" @click="uiStore.closeModal('exportImport')">
          <i class="ri-close-line" style="font-size: 1.25rem;"></i>
        </button>
      </div>

      <!-- TABS -->
      <div class="modal-tabs">
        <button
          class="modal-tab-btn"
          :class="{ active: activeMode === 'storage' }"
          @click="activeMode = 'storage'"
        >
          <i class="ri-hard-drive-2-line"></i> Local Storage Vault
          <span v-if="heroStore.savedRoster?.length" class="tab-count-pill">{{ heroStore.savedRoster.length }}</span>
        </button>
        <button
          class="modal-tab-btn"
          :class="{ active: activeMode === 'export' }"
          @click="activeMode = 'export'"
        >
          <i class="ri-download-2-line"></i> Export JSON
        </button>
        <button
          class="modal-tab-btn"
          :class="{ active: activeMode === 'import' }"
          @click="activeMode = 'import'"
        >
          <i class="ri-upload-2-line"></i> Import JSON
        </button>
      </div>

      <!-- TAB 1: LOCAL STORAGE VAULT -->
      <div v-if="activeMode === 'storage'" class="modal-body">
        <!-- Live Auto-Save Status Banner -->
        <div class="vault-status-card mb-3">
          <div class="vault-status-header">
            <div class="vault-status-indicator">
              <span class="status-pulse-dot" :class="{ 'saving-pulse': heroStore.isSaving }"></span>
              <div class="vault-status-title-group">
                <div class="vault-status-title">
                  Auto-Save Active
                  <span class="badge badge-success-subtle">
                    <i class="ri-shield-check-line"></i> Protected
                  </span>
                </div>
                <div class="vault-status-desc">
                  Hero data automatically saves to your browser with every change. Your character will not be lost if the tab closes or browser restarts.
                </div>
              </div>
            </div>
            <div class="vault-status-actions">
              <button
                class="btn btn-secondary btn-sm"
                @click="handleForceSave"
                :disabled="heroStore.isSaving"
                title="Force save to LocalStorage now"
              >
                <i :class="heroStore.isSaving ? 'ri-loader-4-line spin' : 'ri-save-line'"></i>
                <span>{{ heroStore.isSaving ? 'Saving...' : 'Save Now' }}</span>
              </button>
              <button
                class="btn btn-primary btn-sm"
                @click="handleSaveSnapshot"
                title="Save permanent backup slot to vault"
              >
                <i class="ri-bookmark-3-line"></i>
                <span>Save Snapshot to Vault</span>
              </button>
            </div>
          </div>

          <div class="vault-meta-row mt-3">
            <div class="vault-meta-item">
              <span class="meta-label">Active Hero:</span>
              <strong class="meta-val">{{ heroStore.character.name || 'Hero Name' }} (PL {{ heroStore.character.powerLevel || 10 }})</strong>
            </div>
            <div class="vault-meta-item">
              <span class="meta-label">Status:</span>
              <span class="meta-val text-accent">
                {{ heroStore.isSaving ? 'Saving to memory...' : 'Safely Saved' }}
              </span>
            </div>
            <div class="vault-meta-item">
              <span class="meta-label">Last Saved:</span>
              <span class="meta-val">{{ formattedLastSaved }}</span>
            </div>
          </div>
        </div>

        <!-- Saved Roster Slots List -->
        <div class="vault-roster-section">
          <div class="roster-section-header">
            <div>
              <h3 class="roster-title">
                <i class="ri-folder-user-line"></i> Character Vault Slots
              </h3>
              <p class="roster-subtitle">Store multiple character profiles or version checkpoints without downloading files.</p>
            </div>
            <div class="roster-badge-count">
              {{ heroStore.savedRoster?.length || 0 }} Saved Slots
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="!heroStore.savedRoster || heroStore.savedRoster.length === 0" class="empty-vault-card">
            <div class="empty-vault-icon">
              <i class="ri-inbox-archive-line"></i>
            </div>
            <div class="empty-vault-title">No Saved Character Slots</div>
            <div class="empty-vault-sub">
              Your active character is already secured by auto-save. Create a permanent snapshot to switch characters anytime.
            </div>
            <button class="btn btn-secondary btn-sm mt-3" @click="handleSaveSnapshot">
              <i class="ri-bookmark-3-line"></i> Save Active Hero to Vault
            </button>
          </div>

          <!-- Roster Cards -->
          <div v-else class="roster-grid">
            <div v-for="slot in heroStore.savedRoster" :key="slot.id" class="roster-item-card">
              <div class="roster-item-main">
                <div class="roster-avatar">
                  <i class="ri-shield-user-fill"></i>
                </div>
                <div class="roster-item-info">
                  <div class="roster-item-title-row">
                    <span class="roster-hero-name">{{ slot.name || 'Hero Name' }}</span>
                    <span class="badge badge-primary">PL {{ slot.powerLevel || 10 }}</span>
                    <span class="badge badge-subtle">{{ slot.archetype || 'Custom' }}</span>
                  </div>
                  <div class="roster-item-meta">
                    <span><i class="ri-coins-line"></i> {{ slot.spentPP ?? '?' }} / {{ slot.budgetPP ?? '?' }} PP</span>
                    <span class="meta-separator">•</span>
                    <span><i class="ri-time-line"></i> {{ formatSlotDate(slot.savedAt) }}</span>
                    <span v-if="slot.player" class="meta-separator">•</span>
                    <span v-if="slot.player"><i class="ri-user-line"></i> {{ slot.player }}</span>
                  </div>
                </div>
              </div>

              <div class="roster-item-actions">
                <button
                  class="btn btn-outline-primary btn-sm"
                  @click="handleLoadSlot(slot)"
                  title="Load this character into active sheet"
                >
                  <i class="ri-login-box-line"></i> Load
                </button>
                <button
                  class="btn btn-secondary btn-sm"
                  @click="handleExportSlot(slot)"
                  title="Download JSON file for this character"
                >
                  <i class="ri-download-2-line"></i>
                </button>
                <button
                  class="btn btn-ghost-danger btn-sm"
                  @click="handleDeleteSlot(slot)"
                  title="Delete this slot from vault"
                >
                  <i class="ri-delete-bin-line"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Storage Footprint Bar -->
        <div class="vault-storage-footer mt-3">
          <div class="storage-usage-info">
            <i class="ri-database-2-line"></i>
            <span>Browser Storage Usage: <strong>~{{ totalStorageKb }} KB</strong> (HTML5 LocalStorage)</span>
          </div>
          <button
            v-if="heroStore.savedRoster && heroStore.savedRoster.length > 0"
            class="btn btn-ghost-danger btn-xs"
            @click="handleClearAllVault"
          >
            <i class="ri-delete-bin-2-line"></i> Clear All Slots
          </button>
        </div>
      </div>

      <!-- TAB 2: EXPORT -->
      <div v-else-if="activeMode === 'export'" class="modal-body">
        <div class="export-summary-box mb-3">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
            <div>
              <div style="font-weight: 700; color: #fff; font-size: 1rem;">
                {{ heroStore.character.name || 'Hero Name' }} (PL {{ heroStore.character.powerLevel || 10 }})
              </div>
              <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.15rem;">
                {{ heroStore.character.powers?.length || 0 }} Powers • {{ heroStore.character.skills?.length || 0 }} Skills • {{ heroStore.character.advantages?.length || 0 }} Advantages
              </div>
            </div>
            <div style="display: flex; gap: 0.5rem;">
              <button class="btn btn-primary btn-sm" @click="handleDownload">
                <i class="ri-download-line"></i> Download File
              </button>
              <button class="btn btn-secondary btn-sm" @click="handleCopyExport">
                <i :class="copied ? 'ri-check-line' : 'ri-file-copy-line'"></i>
                {{ copied ? 'Copied!' : 'Copy JSON' }}
              </button>
            </div>
          </div>
        </div>

        <div class="code-preview-header">
          <span>JSON RAW PREVIEW ({{ exportSizeKb }} KB)</span>
          <span style="color: var(--text-muted);">Formatted with 2 spaces indentation</span>
        </div>
        <pre class="json-code-box"><code>{{ exportJsonString }}</code></pre>
      </div>

      <!-- TAB 3: IMPORT -->
      <div v-else-if="activeMode === 'import'" class="modal-body">
        <div class="import-upload-zone" @dragover.prevent @drop.prevent="handleFileDrop" @click="triggerFileInput">
          <input
            type="file"
            ref="fileInputRef"
            accept=".json"
            style="display: none;"
            @change="handleFileSelect"
          />
          <div class="upload-icon-circle">
            <i class="ri-file-upload-line"></i>
          </div>
          <div style="font-weight: 700; color: #fff; font-size: 0.95rem; margin-top: 0.5rem;">
            Click to Browse or Drag & Drop .JSON File
          </div>
          <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 0.25rem;">
            Supports all Mutants & Masterminds 3E builder character files
          </div>
        </div>

        <div style="display: flex; align-items: center; margin: 1rem 0; gap: 0.75rem;">
          <div style="flex: 1; height: 1px; background: var(--border-subtle);"></div>
          <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700;">OR PASTE JSON DIRECTLY</span>
          <div style="flex: 1; height: 1px; background: var(--border-subtle);"></div>
        </div>

        <textarea
          v-model="rawImportText"
          class="import-textarea"
          placeholder='Paste character JSON data here... (e.g. { "name": "Kamen Rider G3", "powerLevel": 8, ... })'
          @input="validateImportJson"
        ></textarea>

        <!-- PARSED PREVIEW & VALIDATION FEEDBACK -->
        <div v-if="parsedPreview" class="parsed-hero-card mt-3">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;">
            <div style="display: flex; align-items: center; gap: 0.65rem;">
              <div class="parsed-avatar">
                <i class="ri-shield-user-fill"></i>
              </div>
              <div>
                <div style="font-weight: 800; color: #fff; font-size: 0.95rem;">
                  {{ parsedPreview.name || 'Hero Name' }}
                  <span class="badge badge-primary" style="margin-left: 0.35rem; font-size: 0.7rem;">PL {{ parsedPreview.powerLevel || 10 }}</span>
                </div>
                <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 0.15rem;">
                  Identity: {{ parsedPreview.identity || 'Secret' }} • Player: {{ parsedPreview.player || 'None' }}
                </div>
              </div>
            </div>
            <button class="btn btn-primary btn-sm" @click="applyImport">
              <i class="ri-check-double-line"></i> Load Character to Sheet
            </button>
          </div>

          <div class="stats-mini-row mt-2">
            <div class="mini-stat-pill">
              <span class="stat-label">Powers:</span>
              <span class="stat-val">{{ parsedPreview.powers?.length || 0 }}</span>
            </div>
            <div class="mini-stat-pill">
              <span class="stat-label">Skills:</span>
              <span class="stat-val">{{ parsedPreview.skills?.length || 0 }}</span>
            </div>
            <div class="mini-stat-pill">
              <span class="stat-label">Advantages:</span>
              <span class="stat-val">{{ parsedPreview.advantages?.length || 0 }}</span>
            </div>
            <div class="mini-stat-pill">
              <span class="stat-label">STR:</span>
              <span class="stat-val">{{ parsedPreview.abilities?.STR ?? 0 }}</span>
            </div>
            <div class="mini-stat-pill">
              <span class="stat-label">STA:</span>
              <span class="stat-val">{{ parsedPreview.abilities?.STA ?? 0 }}</span>
            </div>
          </div>
        </div>

        <div v-else-if="importError" class="import-error-banner mt-2">
          <i class="ri-error-warning-line"></i>
          <span>{{ importError }}</span>
        </div>
      </div>

      <!-- FOOTER -->
      <div class="modal-footer">
        <button class="btn btn-secondary btn-sm" @click="uiStore.closeModal('exportImport')">
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useHeroStore } from '../../stores/heroStore.js';
import { useUiStore } from '../../stores/uiStore.js';
import { downloadCharacterJson } from '../../utils/exporters.js';

const heroStore = useHeroStore();
const uiStore = useUiStore();

const activeMode = ref(uiStore.exportImportInitialTab || 'storage');
const copied = ref(false);
const rawImportText = ref('');
const parsedPreview = ref(null);
const importError = ref('');
const fileInputRef = ref(null);

const exportJsonString = computed(() => {
  return JSON.stringify(heroStore.character, null, 2);
});

const exportSizeKb = computed(() => {
  return (new Blob([exportJsonString.value]).size / 1024).toFixed(2);
});

const formattedLastSaved = computed(() => {
  if (!heroStore.lastSavedTimestamp) return 'Never saved';
  const d = new Date(heroStore.lastSavedTimestamp);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
});

const totalStorageKb = computed(() => {
  if (typeof localStorage === 'undefined') return '0.00';
  let totalBytes = 0;
  try {
    for (let key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
        totalBytes += (localStorage[key].length + key.length) * 2;
      }
    }
  } catch (e) {}
  return (totalBytes / 1024).toFixed(2);
});

function formatSlotDate(ts) {
  if (!ts) return '-';
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function handleForceSave() {
  heroStore.saveToStorage();
  uiStore.showToast('Character data saved to local storage!', 'success');
}

function handleSaveSnapshot() {
  const heroName = heroStore.character.name?.trim() || 'Hero Name';
  const res = heroStore.saveCurrentToRoster(heroName);
  if (res) {
    uiStore.showToast(`Snapshot "${heroName}" saved to Vault!`, 'success');
  } else {
    uiStore.showToast('Failed to save snapshot to Vault.', 'error');
  }
}

function handleLoadSlot(slot) {
  if (!slot || !slot.id) return;
  if (confirm(`Load hero "${slot.name || 'Hero'}" into active sheet? Any unsaved changes will be overwritten.`)) {
    const success = heroStore.loadFromRoster(slot.id);
    if (success) {
      uiStore.showToast(`Hero "${slot.name || 'Hero'}" loaded into sheet!`, 'success');
      uiStore.closeModal('exportImport');
    } else {
      uiStore.showToast('Failed to load character from this slot.', 'error');
    }
  }
}

function handleExportSlot(slot) {
  if (!slot?.character) return;
  downloadCharacterJson(slot.character);
  uiStore.showToast(`JSON file for "${slot.name || 'Hero'}" downloaded!`, 'success');
}

function handleDeleteSlot(slot) {
  if (!slot || !slot.id) return;
  if (confirm(`Delete slot "${slot.name || 'Hero'}" from local Vault?`)) {
    heroStore.deleteFromRoster(slot.id);
    uiStore.showToast(`Slot "${slot.name || 'Hero'}" deleted.`, 'info');
  }
}

function handleClearAllVault() {
  if (confirm('WARNING: Are you sure you want to delete ALL hero slots in local Vault?')) {
    heroStore.clearAllRoster();
    uiStore.showToast('All Vault slots cleared.', 'info');
  }
}

function handleDownload() {
  downloadCharacterJson(heroStore.character);
  uiStore.showToast(`Downloaded "${heroStore.character.name || 'Hero'}" JSON file!`, 'success');
}

async function handleCopyExport() {
  try {
    await navigator.clipboard.writeText(exportJsonString.value);
    copied.value = true;
    uiStore.showToast('Character JSON copied to clipboard!', 'success');
    setTimeout(() => { copied.value = false; }, 2500);
  } catch (err) {
    uiStore.showToast('Failed to copy to clipboard', 'error');
  }
}

function triggerFileInput() {
  fileInputRef.value?.click();
}

function handleFileSelect(e) {
  const file = e.target.files?.[0];
  if (file) {
    readFile(file);
    e.target.value = '';
  }
}

function handleFileDrop(e) {
  const file = e.dataTransfer?.files?.[0];
  if (file) {
    readFile(file);
  }
}

function readFile(file) {
  const reader = new FileReader();
  reader.onload = (event) => {
    rawImportText.value = event.target?.result || '';
    validateImportJson();
  };
  reader.onerror = () => {
    importError.value = 'Failed to read file from disk';
  };
  reader.readAsText(file);
}

function validateImportJson() {
  importError.value = '';
  parsedPreview.value = null;

  const text = rawImportText.value.trim();
  if (!text) return;

  try {
    const obj = JSON.parse(text);
    if (!obj || typeof obj !== 'object') {
      importError.value = 'Invalid JSON: Content is not an object';
      return;
    }
    if (!obj.abilities && !obj.powers && !obj.name) {
      importError.value = 'Invalid Format: Missing M&M 3E character attributes';
      return;
    }
    parsedPreview.value = obj;
  } catch (e) {
    importError.value = 'JSON Syntax Error: ' + e.message;
  }
}

function applyImport() {
  if (!parsedPreview.value) return;
  heroStore.loadCharacter(parsedPreview.value);
  uiStore.showToast(`Loaded character "${parsedPreview.value.name || 'Hero'}" successfully!`, 'success');
  uiStore.closeModal('exportImport');
  rawImportText.value = '';
  parsedPreview.value = null;
}

watch(() => uiStore.modals.exportImport, (open) => {
  if (open) {
    activeMode.value = uiStore.exportImportInitialTab || 'storage';
    copied.value = false;
    importError.value = '';
    rawImportText.value = '';
    parsedPreview.value = null;
    heroStore.refreshRoster();
  }
});
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(10, 15, 29, 0.85);
  backdrop-filter: blur(8px);
  z-index: 9998;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  overscroll-behavior: contain;
}

.modal-card {
  width: 100%;
  max-width: 860px;
  max-height: 90vh;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  overscroll-behavior: contain;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-subtle);
}

.modal-icon {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-sm);
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: #60a5fa;
}

.modal-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.01em;
}

.modal-sub {
  font-size: 0.78rem;
  color: var(--text-secondary);
  margin-top: 0.15rem;
}

.modal-tabs {
  display: flex;
  background: var(--bg-input);
  border-bottom: 1px solid var(--border-subtle);
  padding: 0.35rem 1.5rem 0;
  gap: 0.5rem;
}

.modal-tab-btn {
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 700;
  padding: 0.65rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  transition: all 0.2s;
}

.modal-tab-btn:hover {
  color: #fff;
}

.modal-tab-btn.active {
  color: var(--accent-primary);
  border-bottom-color: var(--accent-primary);
}

.tab-count-pill {
  background: rgba(59, 130, 246, 0.25);
  color: #93c5fd;
  border: 1px solid rgba(59, 130, 246, 0.4);
  font-size: 0.7rem;
  padding: 0.1rem 0.45rem;
  border-radius: 999px;
  font-weight: 800;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
  overscroll-behavior: contain;
}

/* VAULT STATUS CARD */
.vault-status-card {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(15, 23, 42, 0.6) 100%);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: var(--radius-md);
  padding: 1.15rem 1.25rem;
}

.vault-status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.vault-status-indicator {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  flex: 1;
  min-width: 260px;
}

.status-pulse-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.7);
  margin-top: 0.35rem;
  flex-shrink: 0;
  animation: pulseDot 2s infinite ease-in-out;
}

.status-pulse-dot.saving-pulse {
  background: #f59e0b;
  box-shadow: 0 0 10px rgba(245, 158, 11, 0.8);
  animation: pulseDot 0.8s infinite ease-in-out;
}

@keyframes pulseDot {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.6;
  }
}

.vault-status-title-group {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.vault-status-title {
  font-size: 0.98rem;
  font-weight: 800;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.badge-success-subtle {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.3);
  font-size: 0.7rem;
  padding: 0.15rem 0.45rem;
  border-radius: var(--radius-xs);
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.vault-status-desc {
  font-size: 0.78rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.vault-status-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.vault-meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
  padding-top: 0.85rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.vault-meta-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.76rem;
}

.meta-label {
  color: var(--text-muted);
}

.meta-val {
  color: #fff;
  font-weight: 600;
}

/* ROSTER SECTION */
.vault-roster-section {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 1.15rem;
  margin-top: 1rem;
}

.roster-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.65rem;
  border-bottom: 1px solid var(--border-subtle);
}

.roster-title {
  font-size: 0.92rem;
  font-weight: 800;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.roster-subtitle {
  font-size: 0.74rem;
  color: var(--text-secondary);
  margin-top: 0.1rem;
}

.roster-badge-count {
  font-size: 0.74rem;
  color: var(--text-muted);
  font-weight: 700;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  border: 1px solid var(--border-subtle);
}

/* EMPTY STATE */
.empty-vault-card {
  text-align: center;
  padding: 2.25rem 1.5rem;
  background: rgba(255, 255, 255, 0.015);
  border: 1px dashed var(--border-subtle);
  border-radius: var(--radius-md);
}

.empty-vault-icon {
  font-size: 2.25rem;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.empty-vault-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #fff;
}

.empty-vault-sub {
  font-size: 0.78rem;
  color: var(--text-secondary);
  max-width: 440px;
  margin: 0.35rem auto 0;
  line-height: 1.45;
}

/* ROSTER GRID / CARDS */
.roster-grid {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  max-height: 280px;
  overflow-y: auto;
  padding-right: 0.25rem;
}

.roster-item-card {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 0.75rem 0.9rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.2s;
}

.roster-item-card:hover {
  background: rgba(30, 41, 59, 0.7);
  border-color: rgba(59, 130, 246, 0.4);
  transform: translateY(-1px);
}

.roster-item-main {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
}

.roster-avatar {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.roster-item-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
}

.roster-item-title-row {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-wrap: wrap;
}

.roster-hero-name {
  font-weight: 700;
  color: #fff;
  font-size: 0.88rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.badge-subtle {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-secondary);
  font-size: 0.68rem;
  padding: 0.1rem 0.4rem;
  border-radius: var(--radius-xs);
}

.roster-item-meta {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.72rem;
  color: var(--text-secondary);
  flex-wrap: wrap;
}

.meta-separator {
  color: var(--text-muted);
}

.roster-item-actions {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-shrink: 0;
}

.btn-outline-primary {
  background: transparent;
  border: 1px solid var(--accent-primary);
  color: var(--accent-primary);
  padding: 0.3rem 0.65rem;
  font-size: 0.76rem;
  font-weight: 700;
  border-radius: var(--radius-xs);
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-outline-primary:hover {
  background: var(--accent-primary);
  color: #fff;
}

.btn-ghost-danger {
  background: transparent;
  border: 1px solid transparent;
  color: #f87171;
  padding: 0.3rem 0.5rem;
  font-size: 0.76rem;
  border-radius: var(--radius-xs);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  transition: all 0.2s;
}

.btn-ghost-danger:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

/* VAULT STORAGE FOOTER */
.vault-storage-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.74rem;
  color: var(--text-muted);
  padding-top: 0.65rem;
  border-top: 1px solid var(--border-subtle);
  flex-wrap: wrap;
  gap: 0.5rem;
}

.storage-usage-info {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.storage-usage-info strong {
  color: var(--text-secondary);
}

/* EXPORT TAB STYLES */
.export-summary-box {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 1rem 1.25rem;
}

.code-preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--text-secondary);
  margin-bottom: 0.35rem;
}

.json-code-box {
  background: #0f172a;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 1rem;
  font-family: 'Geist Mono', monospace;
  font-size: 0.75rem;
  color: #93c5fd;
  max-height: 380px;
  overflow: auto;
  line-height: 1.45;
}

/* IMPORT TAB STYLES */
.import-upload-zone {
  border: 2px dashed rgba(59, 130, 246, 0.4);
  border-radius: var(--radius-md);
  padding: 2rem 1.5rem;
  text-align: center;
  background: rgba(59, 130, 246, 0.03);
  cursor: pointer;
  transition: all 0.2s;
}

.import-upload-zone:hover {
  border-color: var(--accent-primary);
  background: rgba(59, 130, 246, 0.08);
}

.upload-icon-circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.import-textarea {
  width: 100%;
  height: 150px;
  background: var(--bg-input);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 0.75rem;
  color: #fff;
  font-family: 'Geist Mono', monospace;
  font-size: 0.78rem;
  resize: vertical;
}

.import-textarea:focus {
  outline: none;
  border-color: var(--accent-primary);
}

.parsed-hero-card {
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: var(--radius-md);
  padding: 1rem 1.25rem;
}

.parsed-avatar {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-sm);
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.35rem;
}

.stats-mini-row {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.mini-stat-pill {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xs);
  padding: 0.2rem 0.55rem;
  font-size: 0.72rem;
  display: flex;
  gap: 0.3rem;
}

.stat-label {
  color: var(--text-secondary);
}

.stat-val {
  font-weight: 700;
  color: #fff;
}

.import-error-banner {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--radius-sm);
  padding: 0.65rem 1rem;
  color: #f87171;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.modal-footer {
  padding: 0.85rem 1.5rem;
  border-top: 1px solid var(--border-subtle);
  display: flex;
  justify-content: flex-end;
  background: var(--bg-card);
}

.spin {
  animation: spinLoader 0.9s linear infinite;
  display: inline-block;
}

@keyframes spinLoader {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
