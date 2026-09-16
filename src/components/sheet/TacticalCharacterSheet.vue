<template>
  <div class="dndb-sheet-view" ref="sheetViewRef">
    <!-- Hero Identity & Combat Vitals Banner -->
    <HeroHeader />

    <!-- Core Abilities Ribbon -->
    <AbilitiesMatrix />

    <!-- 3-Column Tabletop Grid -->
    <div class="dndb-sheet-grid" ref="sheetGridRef">
      <!-- COLUMN 1 (LEFT): DEFENSES & SENSES -->
      <div class="dndb-col dndb-col-left" ref="colLeftRef">
        <DefensesBlock />
        <SensesCard />
      </div>

      <!-- COLUMN 2 (CENTER): SKILLS TABLE -->
      <div class="dndb-col dndb-col-center">
        <SkillsTable />
      </div>

      <!-- COLUMN 3 (RIGHT): TABBED ACTION & CONTENT HUB -->
      <div class="dndb-col dndb-col-right">
        <TabbedActionHub />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import HeroHeader from './HeroHeader.vue';
import AbilitiesMatrix from './AbilitiesMatrix.vue';
import DefensesBlock from './DefensesBlock.vue';
import SensesCard from './SensesCard.vue';
import SkillsTable from './SkillsTable.vue';
import TabbedActionHub from './TabbedActionHub.vue';

const sheetViewRef = ref(null);
const sheetGridRef = ref(null);
const colLeftRef = ref(null);

let resizeObserver = null;

function syncColHeights() {
  if (!sheetGridRef.value || !colLeftRef.value) return;
  if (window.innerWidth > 768) {
    const h = colLeftRef.value.offsetHeight;
    if (h > 300) {
      sheetGridRef.value.style.setProperty('--dndb-col1-height', `${h}px`);
    }
  } else {
    sheetGridRef.value.style.removeProperty('--dndb-col1-height');
  }
}

onMounted(() => {
  nextTick(() => {
    syncColHeights();
    window.addEventListener('resize', syncColHeights);

    if (window.ResizeObserver && colLeftRef.value) {
      resizeObserver = new ResizeObserver(() => {
        syncColHeights();
      });
      resizeObserver.observe(colLeftRef.value);
    }
  });
});

onUnmounted(() => {
  window.removeEventListener('resize', syncColHeights);
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});
</script>

<style scoped>
/* Scoped styles are handled globally by sheet.css .dndb-sheet-view, .dndb-sheet-grid, etc. */
</style>
