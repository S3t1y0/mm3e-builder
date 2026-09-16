<template>
  <div v-if="uiStore.modals.share" class="modal-backdrop" @click.self="uiStore.closeModal('share')">
    <div class="modal-card">
      <!-- HEADER -->
      <div class="modal-header">
        <div style="display: flex; align-items: center; gap: 0.65rem;">
          <div class="modal-icon">
            <i class="ri-share-forward-fill"></i>
          </div>
          <div>
            <h2 class="modal-title">Share Character Link</h2>
            <p class="modal-sub">Cloudflare Worker KV shortlink with offline compression fallback</p>
          </div>
        </div>
        <button class="btn btn-ghost btn-sm" @click="uiStore.closeModal('share')">
          <i class="ri-close-line" style="font-size: 1.25rem;"></i>
        </button>
      </div>

      <!-- BODY -->
      <div class="modal-body">
        <!-- Hero Summary Strip -->
        <div class="hero-share-card mb-3">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="font-weight: 800; color: #fff; font-size: 1.05rem;">
              {{ heroStore.character.name || 'Hero Name' }}
              <span class="badge badge-primary" style="margin-left: 0.35rem; font-size: 0.72rem;">PL {{ heroStore.character.powerLevel || 10 }}</span>
            </div>
            <div v-if="shareData.type" class="link-type-badge-container">
              <span v-if="shareData.type === 'kv'" class="badge-kv-tag">
                <i class="ri-flashlight-fill"></i> Cloudflare KV Link
              </span>
              <span v-else class="badge-compressed-tag">
                <i class="ri-archive-line"></i> Compressed URL
              </span>
            </div>
          </div>
          <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.3rem;">
            {{ heroStore.totalSpentPP }} / {{ heroStore.totalBudgetPP }} PP • {{ heroStore.character.powers?.length || 0 }} Powers • {{ heroStore.character.skills?.length || 0 }} Skills
          </div>
        </div>

        <!-- URL Input Section -->
        <div class="share-input-section">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
            <label style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary);">
              SHAREABLE URL LINK
            </label>
            <span v-if="!isGenerating && shareData.charCount" style="font-size: 0.72rem; color: var(--text-muted);">
              {{ shareData.charCount }} characters
            </span>
          </div>

          <!-- Loading State -->
          <div v-if="isGenerating" class="generating-box">
            <i class="ri-loader-4-line spin-icon"></i>
            <span>Connecting to Cloudflare Worker KV...</span>
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
              {{ copied ? 'Copied!' : 'Copy Link' }}
            </button>
          </div>
        </div>

        <!-- Mode Toggle & Regeneration -->
        <div class="share-controls-strip mt-3">
          <label class="toggle-offline-label">
            <input
              type="checkbox"
              v-model="forceOffline"
              class="offline-checkbox"
            />
            <span class="toggle-text">
              <strong>Prefer Stateless Offline Link</strong>
              <small>Encode entire hero into URL hash without contacting Cloudflare</small>
            </span>
          </label>
          <button
            class="btn btn-ghost btn-xs"
            :disabled="isGenerating"
            title="Regenerate link with latest sheet updates"
            @click="generateLink"
          >
            <i class="ri-refresh-line" :class="{ 'spin-icon': isGenerating }"></i>
            Regenerate
          </button>
        </div>

        <!-- Compression / Link Metrics -->
        <div class="compression-metrics-grid mt-3">
          <div class="metric-card">
            <div class="metric-label">RAW JSON PAYLOAD</div>
            <div class="metric-val">{{ (shareData.originalSize / 1024).toFixed(1) }} KB</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">LINK TYPE</div>
            <div class="metric-val" :class="shareData.type === 'kv' ? 'text-kv' : 'text-primary'">
              {{ shareData.type === 'kv' ? 'KV (~32 chars)' : 'Hash Slug' }}
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-label">SIZE REDUCTION</div>
            <div class="metric-val text-success">-{{ shareData.ratio }}%</div>
          </div>
        </div>

        <!-- Callout Explainer -->
        <div class="how-it-works-box mt-3">
          <div style="display: flex; gap: 0.65rem; align-items: flex-start;">
            <i :class="shareData.type === 'kv' ? 'ri-flashlight-line text-kv' : 'ri-lightbulb-line'" style="font-size: 1.15rem; margin-top: 0.1rem;"></i>
            <div style="font-size: 0.78rem; line-height: 1.45; color: var(--text-secondary);">
              <template v-if="shareData.type === 'kv'">
                <strong style="color: #fff;">Ultra-Compact Cloudflare KV Shortlink:</strong>
                Your character payload is pruned and stored in Cloudflare Worker KV. The resulting ~30-character link (#s=...) is ideal for Discord, chat, and mobile sharing.
              </template>
              <template v-else>
                <strong style="color: #fff;">Stateless Zero-Backend URL:</strong>
                Full character data is compressed directly into the URL hash using LZ-String. It requires zero server storage and will work permanently even without internet.
              </template>
            </div>
          </div>
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
import { ref, watch } from 'vue';
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
  originalSize: 0,
  compressedSize: 0,
  ratio: 0,
  charCount: 0
});

async function generateLink() {
  isGenerating.value = true;
  try {
    const result = await generateShareUrl(heroStore.character, {
      forceOffline: forceOffline.value
    });
    shareData.value = result;
  } catch (err) {
    console.error('Share generation error:', err);
    uiStore.showToast('Failed to generate short link, falling back to local URL.', 'warning');
  } finally {
    isGenerating.value = false;
  }
}

// Generate link whenever modal opens
watch(() => uiStore.modals.share, (isOpen) => {
  if (isOpen) {
    copied.value = false;
    generateLink();
  }
});

// Regenerate link when toggling forceOffline
watch(forceOffline, () => {
  if (uiStore.modals.share) {
    generateLink();
  }
});

async function copyLink() {
  if (!shareData.value.url) return;
  try {
    await navigator.clipboard.writeText(shareData.value.url);
    copied.value = true;
    uiStore.showToast('Share link copied to clipboard!', 'success');
    setTimeout(() => { copied.value = false; }, 2500);
  } catch (err) {
    uiStore.showToast('Failed to copy link', 'error');
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
  max-width: 650px;
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

.modal-icon {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-sm);
  background: rgba(168, 85, 247, 0.15);
  border: 1px solid rgba(168, 85, 247, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: #c084fc;
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

.modal-body {
  padding: 1.5rem;
}

.hero-share-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 0.85rem 1.15rem;
}

.badge-kv-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.35);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.72rem;
  font-weight: 700;
}

.badge-compressed-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.35);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.72rem;
  font-weight: 700;
}

.text-kv {
  color: #34d399;
}

.share-input-section {
  display: flex;
  flex-direction: column;
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
  color: #93c5fd;
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
  font-family: 'Geist Mono', monospace;
  font-size: 0.82rem;
  cursor: text;
}

.share-url-input:focus {
  outline: none;
  border-color: var(--accent-primary);
}

.share-controls-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 0.5rem 0.85rem;
}

.toggle-offline-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.offline-checkbox {
  accent-color: var(--accent-primary);
  width: 15px;
  height: 15px;
}

.toggle-text {
  display: flex;
  flex-direction: column;
}

.toggle-text strong {
  font-size: 0.75rem;
  color: #fff;
}

.toggle-text small {
  font-size: 0.68rem;
  color: var(--text-muted);
}

.compression-metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.metric-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 0.75rem;
  text-align: center;
}

.metric-label {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--text-muted);
}

.metric-val {
  font-size: 1.05rem;
  font-weight: 800;
  color: #fff;
  margin-top: 0.25rem;
}

.text-primary {
  color: var(--accent-primary);
}

.text-success {
  color: #34d399;
}

.how-it-works-box {
  background: rgba(16, 185, 129, 0.04);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: var(--radius-md);
  padding: 0.85rem 1rem;
}

.modal-footer {
  padding: 0.85rem 1.5rem;
  border-top: 1px solid var(--border-subtle);
  display: flex;
  justify-content: flex-end;
  background: var(--bg-card);
}
</style>
