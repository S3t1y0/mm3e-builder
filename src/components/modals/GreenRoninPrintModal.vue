<template>
  <Teleport to="body">
    <div v-if="uiStore.modals.printOfficial" class="gr-modal-overlay" @click.self="uiStore.closeModal('printOfficial')">
      <div id="official-print" class="gr-modal-container">
        <!-- TOP ACTION BAR -->
        <div class="gr-modal-bar">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div class="gr-modal-title">
              <i class="ri-printer-fill" style="margin-right: 0.4rem; color: #38bdf8;"></i>
              OFFICIAL CHARACTER SHEET (PDF)
            </div>
            <span class="gr-modal-badge">Green Ronin 3E Format</span>
          </div>

          <!-- Custom Percentage Zoom Control -->
          <div class="gr-custom-zoom" role="group" aria-label="Custom View Scale">
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
                title="Drag to adjust zoom"
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

watch(() => uiStore.modals.printOfficial, (isOpen) => {
  if (isOpen) {
    nextTick(() => {
      measureSheet();
    });
  }
});

let resizeObserver = null;

onMounted(() => {
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
  background: #0f172a;
  border: 1.5px solid #0284c7;
  border-radius: 8px;
  padding: 10px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 20px;
  z-index: 100;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
}

.gr-modal-title {
  font-family: var(--font-header, 'Trebuchet MS', sans-serif);
  font-size: 1.2rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: #fff;
  display: flex;
  align-items: center;
}

.gr-modal-badge {
  background: rgba(56, 189, 248, 0.15);
  border: 1px solid rgba(56, 189, 248, 0.4);
  color: #7dd3fc;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* Custom Percentage Zoom Toolbar */
.gr-custom-zoom {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(15, 23, 42, 0.85);
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid rgba(56, 189, 248, 0.25);
}

.gr-zoom-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: #94a3b8;
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
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(56, 189, 248, 0.3);
  color: #cbd5e1;
  width: 26px;
  height: 26px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.15s ease;
}

.gr-zoom-btn-step:hover:not(:disabled) {
  background: rgba(56, 189, 248, 0.25);
  color: #38bdf8;
  border-color: #38bdf8;
}

.gr-zoom-btn-step:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.gr-zoom-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 90px;
  height: 4px;
  background: rgba(56, 189, 248, 0.2);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
  transition: background 0.15s ease;
}

.gr-zoom-slider:hover {
  background: rgba(56, 189, 248, 0.4);
}

.gr-zoom-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #38bdf8;
  box-shadow: 0 0 6px rgba(56, 189, 248, 0.6);
  cursor: pointer;
  transition: transform 0.1s ease;
}

.gr-zoom-slider::-webkit-slider-thumb:hover {
  transform: scale(1.15);
}

.gr-zoom-slider::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #38bdf8;
  border: none;
  box-shadow: 0 0 6px rgba(56, 189, 248, 0.6);
  cursor: pointer;
}

.gr-zoom-input-box {
  display: flex;
  align-items: center;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(56, 189, 248, 0.4);
  border-radius: 4px;
  padding: 0 5px;
  height: 26px;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.gr-zoom-input-box:focus-within {
  border-color: #38bdf8;
  box-shadow: 0 0 0 1.5px rgba(56, 189, 248, 0.3);
}

.gr-zoom-input {
  width: 38px;
  border: none;
  background: transparent;
  color: #f8fafc;
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
  font-weight: 700;
  color: #38bdf8;
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
