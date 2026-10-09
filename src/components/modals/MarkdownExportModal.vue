<template>
  <div v-if="uiStore.modals.markdown" class="modal-backdrop" @click.self="uiStore.closeModal('markdown')">
    <div class="modal-card markdown-export-card">
      <!-- HEADER -->
      <div class="modal-header">
        <div class="modal-header-left">
          <div class="modal-icon icon-teal">
            <i class="ri-file-text-line"></i>
          </div>
          <div>
            <h2 class="modal-title">Text Character Sheet Export</h2>
            <p class="modal-sub">Formatted character sheets for Discord, GitHub, Obsidian, RPG forums, and plain text</p>
          </div>
        </div>
        <button class="btn btn-ghost btn-sm" @click="uiStore.closeModal('markdown')" aria-label="Close">
          <i class="ri-close-line" style="font-size: 1.25rem;"></i>
        </button>
      </div>

      <!-- BODY -->
      <div class="modal-body">
        <!-- Hero Summary Strip -->
        <div class="hero-summary-strip">
          <div class="hero-summary-left">
            <span class="hero-name">{{ heroStore.character.name || 'Hero' }}</span>
            <span class="badge badge-primary tabular-nums">PL {{ heroStore.character.powerLevel || 10 }}</span>
          </div>
          <div class="hero-summary-right tabular-nums">
            {{ heroStore.totalSpentPP }} / {{ heroStore.totalBudgetPP }} PP
          </div>
        </div>

        <!-- Format Switcher & Action Toolbar -->
        <div class="text-format-switch">
          <div class="format-tabs">
            <button
              class="modal-tab-btn"
              :class="{ active: textFormat === 'markdown' }"
              @click="textFormat = 'markdown'"
            >
              <i class="ri-markdown-line"></i> Markdown
            </button>
            <button
              class="modal-tab-btn"
              :class="{ active: textFormat === 'bbcode' }"
              @click="textFormat = 'bbcode'"
            >
              <i class="ri-code-box-line"></i> BBCode
            </button>
            <button
              class="modal-tab-btn"
              :class="{ active: textFormat === 'plain' }"
              @click="textFormat = 'plain'"
            >
              <i class="ri-file-text-line"></i> Plain Text
            </button>
          </div>

          <div class="format-actions">
            <button class="btn btn-secondary btn-sm" @click="downloadTextFile" title="Download as text file">
              <i class="ri-download-2-line"></i> Download .{{ textFormat === 'markdown' ? 'md' : 'txt' }}
            </button>
            <button class="btn btn-primary btn-sm" @click="copyTextExport">
              <i :class="copied ? 'ri-check-line' : 'ri-file-copy-line'"></i>
              {{ copied ? 'Copied!' : (textFormat === 'plain' ? 'Copy Plain Text' : `Copy ${textFormat.toUpperCase()}`) }}
            </button>
          </div>
        </div>

        <!-- Content Textarea -->
        <div class="textarea-wrapper">
          <textarea
            readonly
            class="text-export-textarea"
            :value="activeTextContent"
            @click="$event.target.select()"
            placeholder="No content available..."
          ></textarea>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useHeroStore } from '../../stores/heroStore.js';
import { useUiStore } from '../../stores/uiStore.js';
import { buildMarkdownSheet, buildBBCodeSheet, buildPlainTextSheet } from '../../utils/exporters.js';
import { trackEvent } from '../../utils/analytics.js';

const heroStore = useHeroStore();
const uiStore = useUiStore();

const textFormat = ref('markdown');
const copied = ref(false);

const activeTextContent = computed(() => {
  if (textFormat.value === 'markdown') {
    return buildMarkdownSheet(heroStore.character, heroStore);
  }
  if (textFormat.value === 'bbcode') {
    return buildBBCodeSheet(heroStore.character, heroStore);
  }
  return buildPlainTextSheet(heroStore.character, heroStore);
});

async function copyTextExport() {
  try {
    await navigator.clipboard.writeText(activeTextContent.value);
    copied.value = true;
    trackEvent('export_markdown', {
      format: textFormat.value,
      action: 'clipboard',
      pl: heroStore.character?.powerLevel || 10
    });
    const label = textFormat.value === 'plain' ? 'Plain Text' : textFormat.value.toUpperCase();
    uiStore.showToast(`${label} sheet copied to clipboard!`, 'success');
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (e) {
    uiStore.showToast('Failed to copy text', 'error');
  }
}

function downloadTextFile() {
  const safeName = (heroStore.character.name || 'Hero').replace(/[^a-z0-9_-]/gi, '_');
  const ext = textFormat.value === 'markdown' ? 'md' : 'txt';
  const filename = `${safeName}_sheet.${ext}`;
  const blob = new Blob([activeTextContent.value], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  trackEvent('export_markdown', {
    format: textFormat.value,
    action: 'download',
    pl: heroStore.character?.powerLevel || 10
  });
  uiStore.showToast(`Downloaded ${filename}`, 'success');
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
  overscroll-behavior: contain;
}

.modal-card {
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  background: var(--bg-card, #0f172a);
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
  border-radius: var(--radius-lg, 12px);
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
  border-bottom: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.04));
  background: var(--bg-card, #0f172a);
}

.modal-header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.modal-icon {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-sm, 6px);
  background: rgba(45, 212, 191, 0.15);
  border: 1px solid rgba(45, 212, 191, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: #2dd4bf;
  flex-shrink: 0;
}

.modal-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: #fff;
  margin: 0;
}

.modal-sub {
  font-size: 0.78rem;
  color: var(--text-secondary, #94a3b8);
  margin: 0.15rem 0 0 0;
}

.modal-body {
  padding: 1.25rem 1.5rem 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.hero-summary-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.65rem 1rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.04));
  border-radius: var(--radius-sm, 6px);
}

.hero-summary-left {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.hero-name {
  font-weight: 800;
  color: #fff;
  font-size: 0.95rem;
}

.hero-summary-right {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-secondary, #94a3b8);
}

.text-format-switch {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.format-tabs {
  display: flex;
  gap: 0.5rem;
}

.modal-tab-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
  border-radius: var(--radius-sm, 6px);
  color: var(--text-secondary, #94a3b8);
  font-size: 0.82rem;
  font-weight: 700;
  padding: 0.5rem 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  transition: all var(--trans-fast, 0.15s ease);
}

.modal-tab-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.modal-tab-btn.active {
  background: rgba(45, 212, 191, 0.15);
  border-color: rgba(45, 212, 191, 0.4);
  color: #2dd4bf;
}

.format-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.textarea-wrapper {
  width: 100%;
}

.text-export-textarea {
  width: 100%;
  height: 440px;
  background: #080d1a;
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
  border-radius: var(--radius-sm, 6px);
  padding: 1rem;
  color: #f1f5f9;
  font-family: var(--font-mono, monospace);
  font-size: 0.82rem;
  line-height: 1.55;
  resize: vertical;
  white-space: pre;
  tab-size: 2;
  transition: border-color var(--trans-fast, 0.15s ease);
}

.text-export-textarea:focus {
  outline: none;
  border-color: var(--accent-secondary, #2a8fd6);
  box-shadow: 0 0 0 1px var(--accent-secondary, #2a8fd6);
}

.text-export-textarea:focus-visible {
  outline: 2px solid var(--accent-secondary, #2a8fd6);
  outline-offset: 2px;
}

@media (max-width: 640px) {
  .text-format-switch {
    flex-direction: column;
    align-items: stretch;
  }
  .format-tabs {
    flex-direction: column;
  }
  .format-actions {
    justify-content: flex-end;
  }
  .text-export-textarea {
    height: 320px;
  }
}
</style>
