<template>
  <Teleport to="body">
    <div v-if="uiStore.modals.printOfficial" class="gr-modal-overlay" @click.self="uiStore.closeModal('printOfficial')">
      <div id="official-print" class="gr-modal-container">
        <!-- TOP ACTION BAR -->
        <div class="gr-modal-bar">
          <div class="gr-modal-bar-left">
            <div class="gr-modal-title">
              <i class="ri-printer-line gr-modal-title-icon"></i>
              Deluxe Character Sheet (PDF)
            </div>
            <span class="gr-modal-subtitle">Classic 3E Format</span>
          </div>

          <!-- Custom Percentage Zoom Control -->
          <div class="gr-custom-zoom" role="group" aria-label="Custom View Scale" title="Zoom controls (Ctrl + Mouse Scroll / Ctrl + +/-)">
            <span class="gr-zoom-label">
              <i class="ri-zoom-in-line"></i> View:
            </span>

            <div class="gr-zoom-bar">
              <button
                type="button"
                class="gr-zoom-btn-step"
                title="Zoom Out (-5%)"
                :disabled="zoomPercent <= 25"
                @click="adjustZoom(-5)"
              >
                <i class="ri-subtract-line"></i>
              </button>

              <input
                type="range"
                v-model.number="zoomPercent"
                min="25"
                max="200"
                step="1"
                class="gr-zoom-slider"
                title="Drag or use Ctrl + Mouse Scroll to zoom PDF"
              />

              <button
                type="button"
                class="gr-zoom-btn-step"
                title="Zoom In (+5%)"
                :disabled="zoomPercent >= 200"
                @click="adjustZoom(5)"
              >
                <i class="ri-add-line"></i>
              </button>

              <div class="gr-zoom-input-box">
                <input
                  type="number"
                  v-model.number="zoomInputVal"
                  min="25"
                  max="200"
                  class="gr-zoom-input font-mono"
                  @input="onDirectInput"
                  @change="commitDirectInput"
                  @keydown.enter="commitDirectInput"
                  title="Type custom percentage (25 - 200) and press Enter"
                />
                <span class="gr-zoom-percent-sign font-mono">%</span>
              </div>
            </div>
          </div>

          <div style="display: flex; gap: 0.5rem; align-items: center;">
            <label class="gr-page-toggle-label" title="Always include Page 2 (Continuation sheet) for extra manual notes & powers">
              <input type="checkbox" v-model="uiStore.alwaysIncludePage2" class="gr-page-toggle-checkbox" />
              <span>Page 2</span>
            </label>
            <button class="btn btn-primary btn-sm" @click="handlePrint">
              <i class="ri-printer-line"></i> Print / Save PDF
            </button>
            <button class="btn btn-secondary btn-sm" @click="uiStore.closeModal('printOfficial')">
              <i class="ri-close-line"></i> Close
            </button>
          </div>
        </div>

        <!-- PREVIEW CONTAINER WITH DYNAMIC SCALER -->
        <div class="gr-preview-scroll" ref="scrollContainer">
          <div class="gr-sheet-scaler-wrap" :style="wrapperStyle">
            <div class="gr-sheet-scaler" :style="scalerStyle">
              <GreenRoninSheet ref="sheetRef" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useUiStore } from '../../stores/uiStore.js';
import GreenRoninSheet from './GreenRoninSheet.vue';

const uiStore = useUiStore();

const scrollContainer = ref(null);
const sheetRef = ref(null);
const sheetHeight = ref(1123);

// Calculate a comfortable default zoom on open based on available screen height
function calculateDefaultZoom() {
  if (typeof window === 'undefined') return 100;
  const availableHeight = Math.max(300, window.innerHeight - 130);
  const fitPercent = Math.round((availableHeight / 1123) * 100);
  const rounded = Math.round(fitPercent / 5) * 5;
  return Math.min(100, Math.max(35, rounded));
}

const zoomPercent = ref(calculateDefaultZoom());
const zoomInputVal = ref(zoomPercent.value);

watch(zoomPercent, (newVal) => {
  zoomInputVal.value = newVal;
});

function adjustZoom(delta) {
  const current = Number(zoomPercent.value) || 100;
  const updated = Math.min(200, Math.max(25, current + delta));
  zoomPercent.value = updated;
}

function onDirectInput(e) {
  const val = Number(e.target.value);
  if (!isNaN(val) && val >= 25 && val <= 200) {
    zoomPercent.value = val;
  }
}

function commitDirectInput() {
  let val = Number(zoomInputVal.value);
  if (isNaN(val) || val < 25) {
    val = 25;
  } else if (val > 200) {
    val = 200;
  }
  zoomInputVal.value = val;
  zoomPercent.value = val;
}

const scaleValue = computed(() => {
  return Number(((zoomPercent.value || 100) / 100).toFixed(3));
});

function measureSheet() {
  if (sheetRef.value?.$el) {
    const h = sheetRef.value.$el.offsetHeight;
    if (h && h > 100) {
      sheetHeight.value = h;
    }
  }
}

const scalerStyle = computed(() => {
  return {
    transform: `scale(${scaleValue.value})`,
    transformOrigin: 'top center'
  };
});

const wrapperStyle = computed(() => {
  if (Math.abs(scaleValue.value - 1) < 0.01) {
    return {
      width: '794px',
      height: `${sheetHeight.value}px`
    };
  }
  return {
    width: `${Math.round(794 * scaleValue.value)}px`,
    height: `${Math.round(sheetHeight.value * scaleValue.value)}px`
  };
});

function handlePrint() {
  window.print();
}

// Handle Ctrl + Mouse Wheel (and trackpad pinch) to zoom PDF instead of browser window
function handleWheelZoom(e) {
  if (!uiStore.modals.printOfficial) return;
  if (e.ctrlKey || e.metaKey) {
    e.preventDefault();
    const step = Math.abs(e.deltaY) < 40 ? Math.max(1, Math.round(Math.abs(e.deltaY) / 8)) : 5;
    const delta = e.deltaY < 0 ? step : -step;
    adjustZoom(delta);
  }
}

// Handle Ctrl + +/- / 0 keyboard zoom shortcuts
function handleKeyDown(e) {
  if (!uiStore.modals.printOfficial) return;
  if (e.ctrlKey || e.metaKey) {
    if (e.key === '=' || e.key === '+') {
      e.preventDefault();
      adjustZoom(5);
    } else if (e.key === '-' || e.key === '_') {
      e.preventDefault();
      adjustZoom(-5);
    } else if (e.key === '0') {
      e.preventDefault();
      zoomPercent.value = calculateDefaultZoom();
    }
  }
}

let isListenerAttached = false;

function addZoomListeners() {
  if (isListenerAttached) return;
  window.addEventListener('wheel', handleWheelZoom, { passive: false });
  window.addEventListener('keydown', handleKeyDown);
  isListenerAttached = true;
}

function removeZoomListeners() {
  if (!isListenerAttached) return;
  window.removeEventListener('wheel', handleWheelZoom);
  window.removeEventListener('keydown', handleKeyDown);
  isListenerAttached = false;
}

watch(() => uiStore.modals.printOfficial, (isOpen) => {
  if (isOpen) {
    addZoomListeners();
    nextTick(() => {
      measureSheet();
    });
  } else {
    removeZoomListeners();
  }
});

let resizeObserver = null;

onMounted(() => {
  if (uiStore.modals.printOfficial) {
    addZoomListeners();
  }
  nextTick(() => {
    measureSheet();
    if (sheetRef.value?.$el && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        measureSheet();
      });
      resizeObserver.observe(sheetRef.value.$el);
    }
  });
});

onUnmounted(() => {
  removeZoomListeners();
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});
</script>

<style scoped>
.gr-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10, 15, 25, 0.9);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.25rem 1.5rem;
  overflow-y: auto;
}

.gr-modal-container {
  width: 100%;
  max-width: 1120px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.gr-modal-bar {
  position: sticky;
  top: 0;
  width: 100%;
  background: var(--bg-card, #0f172a);
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
  border-radius: var(--radius-md, 8px);
  padding: 0.65rem 1.15rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.85rem;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
  z-index: 100;
  box-shadow: var(--shadow-md, 0 4px 12px rgba(0, 0, 0, 0.4));
}

.gr-modal-bar-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.gr-modal-title {
  font-family: var(--font-heading, inherit);
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary, #fff);
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.gr-modal-title-icon {
  color: var(--accent-secondary, #2a8fd6);
  font-size: 1.15rem;
}

.gr-modal-subtitle {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-secondary, #94a3b8);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-xs, 4px);
  letter-spacing: 0.02em;
}

.gr-page-toggle-label {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-secondary, #94a3b8);
  cursor: pointer;
  user-select: none;
  padding: 0.28rem 0.55rem;
  border-radius: var(--radius-sm, 6px);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.12));
  transition: all 0.15s ease;
}

.gr-page-toggle-label:hover {
  background: rgba(255, 255, 255, 0.12);
  color: var(--text-primary, #ffffff);
}

.gr-page-toggle-checkbox {
  accent-color: var(--accent-primary, #0284c7);
  cursor: pointer;
}

/* Custom Percentage Zoom Toolbar */
.gr-custom-zoom {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--bg-input, #0b1122);
  padding: 0.25rem 0.65rem;
  border-radius: var(--radius-sm, 6px);
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
}

.gr-zoom-label {
  font-size: 0.76rem;
  font-weight: 600;
  color: var(--text-secondary, #94a3b8);
  display: flex;
  align-items: center;
  gap: 4px;
}

.gr-zoom-bar {
  display: flex;
  align-items: center;
  gap: 6px;
}

.gr-zoom-btn-step {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-secondary, #94a3b8);
  width: 24px;
  height: 24px;
  border-radius: var(--radius-xs, 4px);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all var(--trans-fast, 0.15s ease);
}

.gr-zoom-btn-step:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  border-color: rgba(255, 255, 255, 0.2);
}

.gr-zoom-btn-step:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.gr-zoom-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 80px;
  height: 4px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
  transition: background 0.15s ease;
}

.gr-zoom-slider:hover {
  background: rgba(255, 255, 255, 0.25);
}

.gr-zoom-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--accent-secondary, #2a8fd6);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
  cursor: pointer;
  transition: transform 0.1s ease;
}

.gr-zoom-slider::-webkit-slider-thumb:hover {
  transform: scale(1.15);
}

.gr-zoom-slider::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--accent-secondary, #2a8fd6);
  border: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
  cursor: pointer;
}

.gr-zoom-input-box {
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--radius-xs, 4px);
  padding: 0 4px;
  height: 24px;
  transition: border-color 0.15s ease;
}

.gr-zoom-input-box:focus-within {
  border-color: var(--accent-secondary, #2a8fd6);
}

.gr-zoom-input {
  width: 36px;
  border: none;
  background: transparent;
  color: var(--text-primary, #f8fafc);
  font-size: 0.78rem;
  font-weight: 700;
  text-align: right;
  outline: none;
  padding: 0;
  -moz-appearance: textfield;
}

.gr-zoom-input::-webkit-outer-spin-button,
.gr-zoom-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.gr-zoom-percent-sign {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-secondary, #94a3b8);
  margin-left: 2px;
  user-select: none;
}

@media (max-width: 768px) {
  .gr-zoom-slider {
    display: none;
  }
}

/* Scaler container */
.gr-preview-scroll {
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
}

.gr-sheet-scaler-wrap {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  position: relative;
  transition: width 0.2s ease, height 0.2s ease;
}

.gr-sheet-scaler {
  width: 794px;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

@media print {
  .gr-modal-overlay {
    position: static !important;
    background: transparent !important;
    padding: 0 !important;
    overflow: visible !important;
  }
  .gr-modal-container {
    max-width: none !important;
    width: 100% !important;
  }
  .gr-modal-bar {
    display: none !important;
  }
  .gr-preview-scroll {
    overflow: visible !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  .gr-sheet-scaler-wrap {
    display: block !important;
    width: 100% !important;
    height: auto !important;
  }
  .gr-sheet-scaler {
    width: 100% !important;
    transform: none !important;
  }
}
</style>
