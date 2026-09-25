<template>
  <div v-if="uiStore.modals.share" class="modal-backdrop" @click.self="uiStore.closeModal('share')">
    <div class="modal-card">
      <!-- HEADER -->
      <div class="modal-header">
        <div class="modal-header-left">
          <div class="modal-icon">
            <i class="ri-share-forward-line"></i>
          </div>
          <div>
            <h2 class="modal-title">Share Character</h2>
            <p class="modal-sub">Create a link to view or play this character sheet</p>
          </div>
        </div>
        <button class="btn btn-ghost btn-sm" @click="uiStore.closeModal('share')" aria-label="Close">
          <i class="ri-close-line" style="font-size: 1.25rem;"></i>
        </button>
      </div>

      <!-- BODY -->
      <div class="modal-body">
        <!-- Hero Summary Strip -->
        <div class="hero-share-card">
          <div class="hero-share-title-row">
            <div class="hero-share-name">
              {{ heroStore.character.name || 'Hero' }}
              <span class="badge badge-primary">PL {{ heroStore.character.powerLevel || 10 }}</span>
            </div>
            <span v-if="hasActiveShareLink" class="status-pill">
              Synced
            </span>
          </div>
          <div class="hero-share-meta">
            {{ heroStore.totalSpentPP }} / {{ heroStore.totalBudgetPP }} PP • {{ heroStore.character.powers?.length || 0 }} Powers • {{ heroStore.character.skills?.length || 0 }} Skills
          </div>
        </div>

        <!-- URL Input Section -->
        <div class="share-input-section mt-3">
          <label class="share-input-label">Share link</label>

          <!-- Loading State -->
          <div v-if="isGenerating" class="generating-box">
            <i class="ri-loader-4-line spin-icon"></i>
            <span>Generating link...</span>
          </div>

          <!-- Active URL Row -->
          <div v-else class="share-url-row">
            <input
              type="text"
              readonly
              :value="shareData.url"
              class="share-url-input"
              @click="$event.target.select()"
            />
            <button class="btn btn-primary" :disabled="!shareData.url" @click="copyLink">
              <i :class="copied ? 'ri-check-line' : 'ri-file-copy-line'"></i>
              {{ copied ? 'Copied' : 'Copy' }}
            </button>
          </div>
        </div>

        <!-- Dynamic Link Sync Panel -->
        <div v-if="shareData.type === 'kv' && hasActiveShareLink" class="dynamic-share-panel mt-3">
          <div class="dynamic-panel-header">
            <div class="dynamic-title-group">
              <span class="dynamic-panel-title">Dynamic link</span>
              <span class="version-chip">v{{ characterShareInfo?.version || 1 }}</span>
            </div>
            <span v-if="characterShareInfo?.updatedAt" class="dynamic-updated-time">
              Updated {{ formatUpdatedTime(characterShareInfo.updatedAt) }}
            </span>
          </div>
          <p class="dynamic-panel-desc">
            This link updates when you save changes, so anyone with the link always sees your latest sheet.
          </p>
          <div class="dynamic-panel-buttons">
            <button
              class="btn btn-sm btn-update-link"
              :disabled="isGenerating"
              @click="generateLink(false)"
            >
              <i class="ri-refresh-line" :class="{ 'spin-icon': isGenerating }"></i>
              Update Link
            </button>
            <button
              class="btn btn-sm btn-new-link"
              :disabled="isGenerating"
              title="Create a separate link with its own address"
              @click="generateLink(true)"
            >
              <i class="ri-add-line"></i>
              Create New Link
            </button>
          </div>
        </div>

        <!-- Offline Option Toggle -->
        <div class="share-options-row mt-3">
          <label class="offline-option-label">
            <input
              type="checkbox"
              v-model="forceOffline"
              class="offline-checkbox"
            />
            <span class="offline-text">
              <strong>Standalone offline link</strong>
              <small>Embed all character data directly in the link so it opens without a network connection</small>
            </span>
          </label>
        </div>
      </div>

      <!-- FOOTER -->
      <div class="modal-footer">
        <button class="btn btn-secondary btn-sm" @click="uiStore.closeModal('share')">
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useHeroStore } from '../../stores/heroStore.js';
import { useUiStore } from '../../stores/uiStore.js';
import { generateShareUrl } from '../../services/shareService.js';

const heroStore = useHeroStore();
const uiStore = useUiStore();

const copied = ref(false);
const isGenerating = ref(false);
const forceOffline = ref(false);

const shareData = ref({
  url: '',
  type: 'kv',
  id: null,
  editToken: null,
  updated: false,
  isNew: false,
  version: 1,
  updatedAt: null,
  originalSize: 0,
  compressedSize: 0,
  ratio: 0,
  charCount: 0
});

const characterShareInfo = computed(() => heroStore.character?.shareInfo || null);
const hasActiveShareLink = computed(() => {
  return Boolean(characterShareInfo.value?.id && characterShareInfo.value?.editToken);
});

function formatUpdatedTime(isoStr) {
  if (!isoStr) return '';
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  } catch (e) {
    return isoStr;
  }
}

async function generateLink(forceNew = false) {
  isGenerating.value = true;
  try {
    const result = await generateShareUrl(heroStore.character, {
      forceOffline: forceOffline.value,
      forceNew
    });
    shareData.value = result;

    if (result.type === 'kv' && result.id && result.editToken) {
      heroStore.setShareInfo({
        id: result.id,
        editToken: result.editToken,
        version: result.version || 1,
        updatedAt: result.updatedAt || new Date().toISOString()
      });

      if (result.updated) {
        uiStore.showToast('Character link updated.', 'success');
      } else if (result.isNew && !forceNew) {
        uiStore.showToast('Share link created.', 'success');
      } else if (forceNew) {
        uiStore.showToast('New separate link created.', 'success');
      }
    }
  } catch (err) {
    console.error('Share generation error:', err);
    uiStore.showToast('Could not generate short link, falling back to offline link.', 'warning');
  } finally {
    isGenerating.value = false;
  }
}

// Generate link whenever modal opens
watch(() => uiStore.modals.share, (isOpen) => {
  if (isOpen) {
    copied.value = false;
    generateLink(false);
  }
});

// Regenerate link when toggling forceOffline
watch(forceOffline, () => {
  if (uiStore.modals.share) {
    generateLink(false);
  }
});

async function copyLink() {
  if (!shareData.value.url) return;
  try {
    await navigator.clipboard.writeText(shareData.value.url);
    copied.value = true;
    uiStore.showToast('Link copied to clipboard.', 'success');
    setTimeout(() => { copied.value = false; }, 2000);
  } catch (err) {
    uiStore.showToast('Failed to copy link.', 'error');
  }
}
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
}

.modal-card {
  width: 100%;
  max-width: 520px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-subtle);
}

.modal-header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.modal-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  background: rgba(168, 85, 247, 0.15);
  border: 1px solid rgba(168, 85, 247, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: #c084fc;
}

.modal-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.01em;
  margin: 0;
}

.modal-sub {
  font-size: 0.78rem;
  color: var(--text-secondary);
  margin: 0.15rem 0 0 0;
}

.modal-body {
  padding: 1.25rem 1.5rem;
}

.hero-share-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 0.85rem 1rem;
}

.hero-share-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hero-share-name {
  font-weight: 700;
  color: #fff;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.status-pill {
  font-size: 0.72rem;
  font-weight: 600;
  color: #34d399;
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.25);
  padding: 2px 7px;
  border-radius: 4px;
}

.hero-share-meta {
  font-size: 0.78rem;
  color: var(--text-secondary);
  margin-top: 0.35rem;
}

.share-input-section {
  display: flex;
  flex-direction: column;
}

.share-input-label {
  font-size: 0.76rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 0.4rem;
}

.generating-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: var(--bg-input);
  border: 1px dashed var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 0.75rem;
  color: var(--text-secondary);
  font-size: 0.82rem;
}

.spin-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.share-url-row {
  display: flex;
  gap: 0.5rem;
}

.share-url-input {
  flex: 1;
  background: var(--bg-input);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 0.65rem 0.85rem;
  color: #93c5fd;
  font-family: monospace;
  font-size: 0.82rem;
  cursor: text;
}

.share-url-input:focus {
  outline: none;
  border-color: var(--accent-primary);
}

.dynamic-share-panel {
  background: rgba(16, 185, 129, 0.05);
  border: 1px solid rgba(52, 211, 153, 0.25);
  border-radius: var(--radius-md);
  padding: 0.85rem 1rem;
}

.dynamic-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.35rem;
}

.dynamic-title-group {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.dynamic-panel-title {
  font-size: 0.82rem;
  font-weight: 600;
  color: #34d399;
}

.version-chip {
  background: rgba(52, 211, 153, 0.15);
  color: #a7f3d0;
  border: 1px solid rgba(52, 211, 153, 0.3);
  padding: 1px 5px;
  border-radius: 3px;
  font-size: 0.68rem;
  font-weight: 700;
}

.dynamic-updated-time {
  font-size: 0.72rem;
  color: var(--text-muted);
}

.dynamic-panel-desc {
  font-size: 0.76rem;
  color: var(--text-secondary);
  line-height: 1.4;
  margin: 0 0 0.75rem 0;
}

.dynamic-panel-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-update-link {
  background: #059669;
  color: #fff;
  border: 1px solid #10b981;
  font-weight: 600;
  font-size: 0.78rem;
  padding: 0.35rem 0.75rem;
  border-radius: var(--radius-sm);
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  cursor: pointer;
  transition: background 0.15s ease;
}

.btn-update-link:hover:not(:disabled) {
  background: #10b981;
}

.btn-new-link {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  border: 1px solid var(--border-subtle);
  font-weight: 600;
  font-size: 0.78rem;
  padding: 0.35rem 0.75rem;
  border-radius: var(--radius-sm);
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.btn-new-link:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.share-options-row {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 0.6rem 0.85rem;
}

.offline-option-label {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.offline-checkbox {
  margin-top: 2px;
  accent-color: var(--accent-primary);
}

.offline-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.offline-text strong {
  font-size: 0.75rem;
  color: #fff;
  font-weight: 600;
}

.offline-text small {
  font-size: 0.7rem;
  color: var(--text-muted);
  line-height: 1.35;
}

.modal-footer {
  padding: 0.85rem 1.5rem;
  border-top: 1px solid var(--border-subtle);
  display: flex;
  justify-content: flex-end;
  background: var(--bg-card);
}
</style>
