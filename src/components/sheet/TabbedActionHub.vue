<template>
  <div class="dndb-tabbed-hub">
    <!-- Tab Navigation Header -->
    <nav class="dndb-hub-nav">
      <button
        type="button"
        class="dndb-hub-tab-btn"
        :class="{ active: activeTab === 'actions' }"
        @click="activeTab = 'actions'"
        title="Combat maneuvers, weapon strikes, and power attacks"
      >
        <i class="ri-sword-line"></i>
        <span>Actions</span>
        <span class="hub-tab-badge">{{ attacksCount }}</span>
      </button>

      <button
        type="button"
        class="dndb-hub-tab-btn"
        :class="{ active: activeTab === 'powers' }"
        @click="activeTab = 'powers'"
        title="Superhuman powers, dynamic arrays, and removable devices"
      >
        <i class="ri-flashlight-line"></i>
        <span>Powers</span>
        <span class="hub-tab-badge">{{ powersCount }}</span>
      </button>

      <button
        type="button"
        class="dndb-hub-tab-btn"
        :class="{ active: activeTab === 'advantages' }"
        @click="activeTab = 'advantages'"
        title="Combat feats, fortune, and general advantages"
      >
        <i class="ri-medal-line"></i>
        <span>Advantages</span>
        <span class="hub-tab-badge">{{ advantagesCount }}</span>
      </button>

      <button
        type="button"
        class="dndb-hub-tab-btn"
        :class="{ active: activeTab === 'equipment' }"
        @click="activeTab = 'equipment'"
        title="Weapons, ballistic armor, utility gadgets, vehicles, and HQ"
      >
        <i class="ri-archive-line"></i>
        <span>Equipment</span>
        <span class="hub-tab-badge">{{ equipmentCount }}</span>
      </button>

      <button
        type="button"
        class="dndb-hub-tab-btn"
        :class="{ active: activeTab === 'conditions' }"
        @click="activeTab = 'conditions'"
        title="Injuries, bruises, debuffs, and condition penalties"
      >
        <i class="ri-heart-pulse-line"></i>
        <span>Conditions</span>
        <span v-if="conditionsCount > 0 || (heroStore.character.injuries || 0) > 0" class="hub-tab-badge badge-warn">
          {{ conditionsCount + (heroStore.character.injuries > 0 ? 1 : 0) }}
        </span>
      </button>

      <button
        type="button"
        class="dndb-hub-tab-btn"
        :class="{ active: activeTab === 'complications' }"
        @click="activeTab = 'complications'"
        title="Heroic motivations and dramatic complications for Hero Points"
      >
        <i class="ri-alert-line"></i>
        <span>Complications</span>
        <span class="hub-tab-badge">{{ complicationsCount }}</span>
      </button>
    </nav>

    <!-- Scrollable Tab Panes Container -->
    <!-- Tab 1: Actions & Attacks -->
    <div class="dndb-tab-pane" :class="{ active: activeTab === 'actions' }">
      <TargetedAttacksList />
    </div>

    <!-- Tab 2: Powers Deck -->
    <div class="dndb-tab-pane" :class="{ active: activeTab === 'powers' }">
      <PowersDeck />
    </div>

    <!-- Tab 3: Advantages List -->
    <div class="dndb-tab-pane" :class="{ active: activeTab === 'advantages' }">
      <AdvantagesList />
    </div>

    <!-- Tab 4: Equipment & Resources Workshop -->
    <div id="dndb-tab-pane-equipment" class="dndb-tab-pane" :class="{ active: activeTab === 'equipment' }">
      <EquipmentWorkshop />
    </div>

    <!-- Tab 5: Conditions & Injuries Tracker -->
    <div class="dndb-tab-pane" :class="{ active: activeTab === 'conditions' }">
      <ConditionsTracker />
    </div>

    <!-- Tab 6: Complications & Motivations -->
    <div class="dndb-tab-pane" :class="{ active: activeTab === 'complications' }">
      <ComplicationsHub />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useHeroStore } from '../../stores/heroStore.js';
import TargetedAttacksList from './TargetedAttacksList.vue';
import PowersDeck from './PowersDeck.vue';
import AdvantagesList from './AdvantagesList.vue';
import EquipmentWorkshop from './EquipmentWorkshop.vue';
import ConditionsTracker from './ConditionsTracker.vue';
import ComplicationsHub from './ComplicationsHub.vue';

const heroStore = useHeroStore();

const activeTab = ref('actions');

const attacksCount = computed(() => {
  return (heroStore.allTargetedAttacks || []).length;
});

const powersCount = computed(() => {
  return (heroStore.character.powers || []).length;
});

const advantagesCount = computed(() => {
  return (heroStore.character.advantages || []).length;
});

const equipmentCount = computed(() => {
  return (heroStore.character.resources || []).length;
});

const conditionsCount = computed(() => {
  return (heroStore.character.activeConditions || []).length;
});

const complicationsCount = computed(() => {
  return (heroStore.character.complications || []).length;
});
</script>

<style scoped>
.hub-tab-badge.badge-warn {
  background: rgba(239, 68, 68, 0.25) !important;
  color: #f87171 !important;
  border: 1px solid rgba(239, 68, 68, 0.4);
}

:deep(.sheet-card) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
}

:deep(.card) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
}
</style>
