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

          <div style="display: flex; gap: 0.5rem; align-items: center;">
            <button class="btn btn-primary btn-sm" @click="handlePrint">
              <i class="ri-printer-line"></i> Print / Save PDF
            </button>
            <button class="btn btn-secondary btn-sm" @click="uiStore.closeModal('printOfficial')">
              <i class="ri-close-line"></i> Close
            </button>
          </div>
        </div>

        <!-- PREVIEW CONTAINER -->
        <div class="gr-preview-scroll">
          <GreenRoninSheet />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { useUiStore } from '../../stores/uiStore.js';
import { useHeroStore } from '../../stores/heroStore.js';
import GreenRoninSheet from './GreenRoninSheet.vue';
import { trackEvent } from '../../utils/analytics.js';

const uiStore = useUiStore();
const heroStore = useHeroStore();

function handlePrint() {
  trackEvent('print_official_pdf', {
    pl: heroStore.character?.powerLevel || 10,
    totalPP: heroStore.totalSpentPP || 0
  });
  window.print();
}
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
  max-width: 1080px;
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

.gr-preview-scroll {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
}
</style>
