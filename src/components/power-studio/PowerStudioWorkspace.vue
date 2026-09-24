<template>
  <div v-if="builderStore.isOpen" class="power-studio-fullscreen-window">
    <!-- TOP WORKSTATION COMMAND BAR (Compact ~54px Streamlined Header) -->
    <header class="workspace-header-bar">
      <div class="header-left-cluster">
        <button
          type="button"
          class="btn-back-sheet"
          @click="builderStore.closeModal"
          :title="uiStore.activeTab === 'wizard' ? 'Close Power Studio and return to Wizard' : 'Close Power Studio and return to Character Sheet'"
        >
          <i class="ri-arrow-left-line"></i>
          <span>{{ uiStore.activeTab === 'wizard' ? 'Back' : 'Back' }}</span>
        </button>

        <div class="power-title-editor">
          <input
            v-model="builderStore.power.name"
            type="text"
            class="power-name-input"
            placeholder="Power Name (e.g. Solar Blast, Aegis Suit)..."
          />
          <span class="power-type-badge" :class="builderStore.power.type">
            {{ builderStore.power.type === 'device' ? 'Device' : builderStore.power.type === 'compound' ? 'Compound' : 'Standard' }}
          </span>
        </div>

        <div class="power-switcher-dropdown-group" v-if="heroStore.character.powers?.length > 0">
          <select
            class="power-selector-select"
            :value="currentPowerSelectValue"
            @change="handlePowerSelectChange($event.target.value)"
          >
            <option value="custom" disabled hidden>Switch Power</option>
            <option
              v-for="(pow, pIdx) in heroStore.character.powers"
              :key="pow.id || pIdx"
              :value="pIdx"
            >
              {{ pow.name || `Power #${pIdx + 1}` }} ({{ calculatePowerTotalCost(pow) }} PP)
            </option>
            <option value="new_standard">+ New Standard</option>
            <option value="new_compound">+ New Compound</option>
            <option value="new_device">+ New Device</option>
          </select>
        </div>
      </div>

      <div class="header-actions-cluster">
        <button
          type="button"
          class="btn-studio-action btn-new-power"
          @click="builderStore.openNewPower('standard')"
          title="Create a new fresh power"
        >
          <i class="ri-add-line"></i>
          <span>New</span>
        </button>

        <button
          type="button"
          class="btn-studio-action btn-save-power"
          @click="handleSave"
        >
          <i class="ri-save-line"></i>
          <span>Save ({{ builderStore.totalCost }} PP)</span>
        </button>

        <button
          type="button"
          class="btn-close-window"
          @click="builderStore.closeModal"
          title="Close Window"
        >
          <i class="ri-close-line"></i>
        </button>
      </div>
    </header>

    <!-- MODERN 3-PANE MASTER-DETAIL WORKBENCH -->
    <main class="workspace-main-content">
      <!-- PANE 1: LEFT NAVIGATION RAIL (~280px) -->
      <aside class="workspace-rail-col">
        <!-- 1. Structure Selector (Compact Segmented Architecture & Activation) -->
        <StructureSelector />

        <!-- 2. ARCHITECTURE-SPECIFIC EFFECT / SLOT MASTER LIST -->

        <!-- STANDARD POWER: Primary Effect + Array Stunts -->
        <template v-if="builderStore.power.type === 'standard'">
          <!-- Primary Effect Card -->
          <div class="rail-section">
            <div class="rail-section-header">
              <span>Primary Effect</span>
              <button
                type="button"
                class="btn-rail-add"
                @click="builderStore.addLinkedEffect(builderStore.power, 'Affliction')"
                title="Link an effect to trigger simultaneously with Primary Effect"
              >
                <i class="ri-links-line"></i>
                <span>+ Link</span>
              </button>
            </div>
            <div
              class="rail-nav-item"
              :class="{ active: builderStore.activeTargetType === 'main' }"
              @click="selectMainEffect"
            >
              <div class="rail-item-icon-box">
                <i :class="getEffectIcon(builderStore.power.mainEffect?.baseEffect)"></i>
              </div>
              <div class="rail-item-main">
                <div class="rail-item-header-row">
                  <span class="rail-item-title">{{ builderStore.power.mainEffect?.name || builderStore.power.mainEffect?.baseEffect || 'Primary Effect' }}</span>
                  <span class="rail-item-cost-badge">{{ calculateEffectCost(builderStore.power.mainEffect, 0).totalCost }} PP</span>
                </div>
                <div class="rail-item-sub-row">
                  <span class="rail-item-subtitle">{{ builderStore.power.mainEffect?.baseEffect }} Rank {{ builderStore.power.mainEffect?.ranks }}</span>
                </div>
              </div>
            </div>

            <!-- Primary Effect's Linked Effects (Nested) -->
            <div v-if="builderStore.power.linkedEffects?.length" class="rail-nested-items-block">
              <div
                v-for="(lnk, lIdx) in builderStore.power.linkedEffects"
                :key="'main_lnk_' + lIdx"
                class="rail-nav-item rail-nested-item"
                :class="{ active: builderStore.activeTargetType === 'linked' && builderStore.activeLinkedIndex === lIdx }"
                @click="builderStore.selectLinkedForEditing(lIdx)"
              >
                <div class="rail-item-icon-box linked-box mini-box">
                  <i class="ri-links-line"></i>
                </div>
                <div class="rail-item-main">
                  <div class="rail-item-header-row">
                    <span class="rail-item-title">{{ lnk.name || lnk.baseEffect }}</span>
                    <span class="rail-item-cost-badge">{{ calculateEffectCost(lnk, 0).totalCost }} PP</span>
                  </div>
                  <div class="rail-item-sub-row">
                    <span class="rail-item-subtitle">{{ lnk.baseEffect }} R{{ lnk.ranks }}</span>
                    <div class="rail-item-actions">
                      <button
                        type="button"
                        class="btn-rail-remove"
                        title="Remove linked effect"
                        @click.stop="builderStore.removeLinkedEffect(builderStore.power, lIdx)"
                      >
                        <i class="ri-close-line"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Alternate Effects / Array Stunts -->
          <div class="rail-section">
            <div class="rail-section-header">
              <span>Alternate Stunts</span>
              <button
                type="button"
                class="btn-rail-add"
                @click="builderStore.addArraySlot(false)"
                title="Add Alternate Effect (1 PP slot cost)"
              >
                <i class="ri-add-line"></i>
                <span>Add Stunt</span>
              </button>
            </div>

            <!-- Empty Stunts Notice -->
            <div
              v-if="!builderStore.power.alternateEffects?.length"
              class="rail-empty-hint"
              @click="builderStore.addArraySlot(false)"
            >
              <i class="ri-shuffle-line"></i>
              <span>No Alternate Stunts. Click to add a 1 PP switch (e.g. alternate weapon or spell).</span>
            </div>

            <!-- Stunts List -->
            <div v-else class="rail-items-list">
              <div
                v-for="(slot, sIdx) in builderStore.power.alternateEffects"
                :key="slot.id || ('slot_' + sIdx)"
                class="rail-slot-wrapper"
              >
                <div
                  class="rail-nav-item"
                  :class="{ active: builderStore.activeTargetType === 'slot' && builderStore.activeSlotIndex === sIdx }"
                  @click="builderStore.selectSlotForEditing(false, sIdx)"
                >
                  <div class="rail-item-icon-box alt-slot-box">
                    <i :class="getEffectIcon(slot.effect?.baseEffect)"></i>
                  </div>

                  <div class="rail-item-main">
                    <div class="rail-item-header-row">
                      <span class="rail-item-title">{{ slot.name || slot.effect?.baseEffect || ('Stunt #' + (sIdx + 1)) }}</span>
                      <span class="rail-item-cost-badge">{{ slot.isDynamic ? '2 PP' : '1 PP' }}</span>
                    </div>
                    <div class="rail-item-sub-row">
                      <span class="rail-item-subtitle">{{ slot.effect?.baseEffect }} R{{ slot.effect?.ranks }} ({{ getSlotCombinedValue(slot) }} PP)</span>
                      <div class="rail-item-actions">
                        <!-- Dynamic / Alternate Toggle Pill -->
                        <button
                          type="button"
                          class="btn-slot-dynamic-toggle"
                          :class="{ dynamic: slot.isDynamic }"
                          @click.stop="builderStore.toggleSlotDynamic(false, sIdx)"
                          :title="slot.isDynamic ? 'Dynamic Stunt (2 PP, share points concurrently)' : 'Standard Alternate (1 PP, exclusive)'"
                        >
                          {{ slot.isDynamic ? 'Dyn' : 'Alt' }}
                        </button>
                        <!-- Link button for slot -->
                        <button
                          type="button"
                          class="btn-rail-link-mini"
                          title="Add Linked Effect to this Stunt"
                          @click.stop="builderStore.selectSlotForEditing(false, sIdx); builderStore.addLinkedEffect(slot, 'Affliction')"
                        >
                          <i class="ri-links-line"></i>
                        </button>
                        <!-- Remove button -->
                        <button
                          type="button"
                          class="btn-rail-remove"
                          title="Remove this alternate stunt"
                          @click.stop="builderStore.removeArraySlot(false, sIdx)"
                        >
                          <i class="ri-close-line"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Slot's Linked Effects (Nested) -->
                <div v-if="slot.linkedEffects?.length" class="rail-nested-items-block">
                  <div
                    v-for="(sLnk, slIdx) in slot.linkedEffects"
                    :key="'slot_' + sIdx + '_lnk_' + slIdx"
                    class="rail-nav-item rail-nested-item"
                    :class="{ active: builderStore.activeTargetType === 'slot_linked' && builderStore.activeSlotIndex === sIdx && builderStore.activeLinkedIndex === slIdx }"
                    @click="builderStore.selectSlotLinkedForEditing(sIdx, slIdx, false)"
                  >
                    <div class="rail-item-icon-box linked-box mini-box">
                      <i class="ri-links-line"></i>
                    </div>
                    <div class="rail-item-main">
                      <div class="rail-item-header-row">
                        <span class="rail-item-title">{{ sLnk.name || sLnk.baseEffect }}</span>
                        <span class="rail-item-cost-badge">{{ calculateEffectCost(sLnk, 0).totalCost }} PP</span>
                      </div>
                      <div class="rail-item-sub-row">
                        <span class="rail-item-subtitle">{{ sLnk.baseEffect }} R{{ sLnk.ranks }}</span>
                        <div class="rail-item-actions">
                          <button
                            type="button"
                            class="btn-rail-remove"
                            title="Remove linked effect from stunt"
                            @click.stop="builderStore.removeLinkedEffect(slot, slIdx)"
                          >
                            <i class="ri-close-line"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- COMPOUND POWER: Trait Suite Master List -->
        <template v-else-if="builderStore.power.type === 'compound'">
          <!-- Sub-Effects Suite -->
          <div class="rail-section">
            <div class="rail-section-header">
              <span>Compound Sub-Effects</span>
              <button
                type="button"
                class="btn-rail-add"
                @click="builderStore.addCompoundEffect('New Effect', 'Damage')"
                title="Add Sub-Effect to Compound Power"
              >
                <i class="ri-add-line"></i>
                <span>Add Effect</span>
              </button>
            </div>

            <div class="rail-items-list">
              <div
                v-for="(sub, cIdx) in builderStore.power.compoundEffects"
                :key="sub.id || ('compound_' + cIdx)"
                class="rail-compound-group"
              >
                <div
                  class="rail-nav-item"
                  :class="{ active: builderStore.activeTargetType === 'compound' && builderStore.activeCompoundIndex === cIdx }"
                  @click="builderStore.selectCompoundEffect(cIdx)"
                >
                  <!-- Base Effect Icon Box -->
                  <div class="rail-item-icon-box compound-box" :class="{ 'is-primary': sub.isPrimaryAction }">
                    <i :class="getEffectIcon(sub.effect?.baseEffect)"></i>
                  </div>

                  <div class="rail-item-main">
                    <div class="rail-item-header-row">
                      <span class="rail-item-title">
                        {{ sub.name || `Component #${cIdx + 1}` }}
                        <small v-if="sub.isPrimaryAction" class="pri-indicator">PRI</small>
                      </span>
                      <span class="rail-item-cost-badge">{{ getSubEffectCost(sub) }} PP</span>
                    </div>
                    <div class="rail-item-sub-row">
                      <span class="rail-item-subtitle">{{ sub.effect?.baseEffect }} Rank {{ sub.effect?.ranks }}</span>
                      <div class="rail-item-actions">
                        <button
                          type="button"
                          class="btn-rail-stunt-mini"
                          title="Add Alternate Stunt to this sub-effect"
                          @click.stop="builderStore.addCompoundArraySlot(cIdx)"
                        >
                          <i class="ri-shuffle-line"></i>
                        </button>
                        <div class="rail-reorder-actions" @click.stop>
                          <button
                            type="button"
                            class="btn-reorder-mini"
                            :disabled="cIdx === 0"
                            @click="builderStore.reorderCompoundEffects(cIdx, cIdx - 1)"
                            title="Move up"
                          >
                            <i class="ri-arrow-up-s-line"></i>
                          </button>
                          <button
                            type="button"
                            class="btn-reorder-mini"
                            :disabled="cIdx >= (builderStore.power.compoundEffects?.length || 1) - 1"
                            @click="builderStore.reorderCompoundEffects(cIdx, cIdx + 1)"
                            title="Move down"
                          >
                            <i class="ri-arrow-down-s-line"></i>
                          </button>
                        </div>
                        <button
                          v-if="builderStore.power.compoundEffects?.length > 1"
                          type="button"
                          class="btn-rail-remove"
                          title="Remove this sub-effect"
                          @click.stop="builderStore.removeCompoundEffect(cIdx)"
                        >
                          <i class="ri-close-line"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Sub-effect's Linked Effects (Nested) -->
                <div v-if="sub.linkedEffects?.length" class="rail-nested-items-block">
                  <div
                    v-for="(cLnk, clIdx) in sub.linkedEffects"
                    :key="'comp_' + cIdx + '_lnk_' + clIdx"
                    class="rail-nav-item rail-nested-item"
                    :class="{ active: builderStore.activeTargetType === 'compound_linked' && builderStore.activeCompoundIndex === cIdx && builderStore.activeLinkedIndex === clIdx }"
                    @click="builderStore.activeCompoundIndex = cIdx; builderStore.selectLinkedForEditing(clIdx)"
                  >
                    <div class="rail-item-icon-box linked-box mini-box">
                      <i class="ri-links-line"></i>
                    </div>
                    <div class="rail-item-main">
                      <div class="rail-item-header-row">
                        <span class="rail-item-title">{{ cLnk.name || cLnk.baseEffect }}</span>
                        <span class="rail-item-cost-badge">{{ calculateEffectCost(cLnk, 0).totalCost }} PP</span>
                      </div>
                      <div class="rail-item-sub-row">
                        <span class="rail-item-subtitle">{{ cLnk.baseEffect }} R{{ cLnk.ranks }}</span>
                        <div class="rail-item-actions">
                          <button
                            type="button"
                            class="btn-rail-remove"
                            title="Remove linked effect"
                            @click.stop="builderStore.removeLinkedEffect(sub, clIdx)"
                          >
                            <i class="ri-close-line"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Sub-effect's Alternate Stunts Array (Nested) -->
                <div v-if="sub.alternateEffects?.length" class="rail-nested-items-block">
                  <div
                    v-for="(cSlot, csIdx) in sub.alternateEffects"
                    :key="'comp_' + cIdx + '_slot_' + csIdx"
                    class="rail-slot-wrapper"
                  >
                    <div
                      class="rail-nav-item rail-nested-item"
                      :class="{ active: builderStore.activeTargetType === 'compound_slot' && builderStore.activeCompoundIndex === cIdx && builderStore.activeSlotIndex === csIdx }"
                      @click="builderStore.activeCompoundIndex = cIdx; builderStore.selectSlotForEditing(false, csIdx, true)"
                    >
                      <div class="rail-item-icon-box alt-slot-box">
                        <i :class="getEffectIcon(cSlot.effect?.baseEffect)"></i>
                      </div>
                      <div class="rail-item-main">
                        <div class="rail-item-header-row">
                          <span class="rail-item-title">{{ cSlot.name || cSlot.effect?.baseEffect || ('Stunt #' + (csIdx + 1)) }}</span>
                          <span class="rail-item-cost-badge">{{ cSlot.isDynamic ? '2 PP' : '1 PP' }}</span>
                        </div>
                        <div class="rail-item-sub-row">
                          <span class="rail-item-subtitle">{{ cSlot.effect?.baseEffect }} R{{ cSlot.effect?.ranks }} ({{ getSlotCombinedValue(cSlot) }} PP)</span>
                          <div class="rail-item-actions">
                            <button
                              type="button"
                              class="btn-slot-dynamic-toggle"
                              :class="{ dynamic: cSlot.isDynamic }"
                              @click.stop="builderStore.toggleCompoundSlotDynamic(cIdx, csIdx)"
                              :title="cSlot.isDynamic ? 'Dynamic Stunt (2 PP)' : 'Alternate Stunt (1 PP)'"
                            >
                              {{ cSlot.isDynamic ? 'Dyn' : 'Alt' }}
                            </button>
                            <button
                              type="button"
                              class="btn-rail-link-mini"
                              title="Add Linked Effect to this Stunt"
                              @click.stop="builderStore.activeCompoundIndex = cIdx; builderStore.selectSlotForEditing(false, csIdx, true); builderStore.addLinkedEffect(cSlot, 'Affliction')"
                            >
                              <i class="ri-links-line"></i>
                            </button>
                            <button
                              type="button"
                              class="btn-rail-remove"
                              title="Remove stunt"
                              @click.stop="builderStore.removeCompoundArraySlot(cIdx, csIdx)"
                            >
                              <i class="ri-close-line"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Compound Stunt's Linked Effects (Nested deeper) -->
                    <div v-if="cSlot.linkedEffects?.length" class="rail-deeply-nested-block">
                      <div
                        v-for="(csLnk, cslIdx) in cSlot.linkedEffects"
                        :key="'comp_' + cIdx + '_slot_' + csIdx + '_lnk_' + cslIdx"
                        class="rail-nav-item rail-deep-nested-item"
                        :class="{ active: builderStore.activeTargetType === 'compound_slot_linked' && builderStore.activeCompoundIndex === cIdx && builderStore.activeSlotIndex === csIdx && builderStore.activeLinkedIndex === cslIdx }"
                        @click="builderStore.activeCompoundIndex = cIdx; builderStore.selectSlotLinkedForEditing(csIdx, cslIdx, true)"
                      >
                        <div class="rail-item-icon-box linked-box mini-box">
                          <i class="ri-links-line"></i>
                        </div>
                        <div class="rail-item-main">
                          <div class="rail-item-header-row">
                            <span class="rail-item-title">{{ csLnk.name || csLnk.baseEffect }}</span>
                            <span class="rail-item-cost-badge">{{ calculateEffectCost(csLnk, 0).totalCost }} PP</span>
                          </div>
                          <div class="rail-item-sub-row">
                            <span class="rail-item-subtitle">{{ csLnk.baseEffect }} R{{ csLnk.ranks }}</span>
                            <div class="rail-item-actions">
                              <button
                                type="button"
                                class="btn-rail-remove"
                                title="Remove linked effect from stunt"
                                @click.stop="builderStore.removeLinkedEffect(cSlot, cslIdx)"
                              >
                                <i class="ri-close-line"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- DEVICE SUITE: Independent Powers -->
        <template v-else-if="builderStore.power.type === 'device'">
          <!-- Device Powers -->
          <div class="rail-section">
            <div class="rail-section-header">
              <span>Device Powers</span>
              <button
                type="button"
                class="btn-rail-add"
                @click="builderStore.addDeviceSubPower('New Power', 'Damage')"
                title="Add Power to Device"
              >
                <i class="ri-add-line"></i>
                <span>Add Power</span>
              </button>
            </div>

            <div class="rail-items-list">
              <div
                v-for="(sub, dIdx) in builderStore.power.devicePowers"
                :key="sub.id || ('device_' + dIdx)"
                class="rail-compound-group"
              >
                <div
                  class="rail-nav-item"
                  :class="{ active: builderStore.activeSubPowerIndex === dIdx && builderStore.activeTargetType === 'main' }"
                  @click="builderStore.selectSubPower(dIdx)"
                >
                  <div class="rail-item-icon-box device-box">
                    <i :class="getEffectIcon(sub.effect?.baseEffect)"></i>
                  </div>

                  <div class="rail-item-main">
                    <div class="rail-item-header-row">
                      <span class="rail-item-title">{{ sub.name || `Power #${dIdx + 1}` }}</span>
                      <span class="rail-item-cost-badge">{{ getSubPowerCost(sub) }} PP</span>
                    </div>
                    <div class="rail-item-sub-row">
                      <span class="rail-item-subtitle">{{ sub.effect?.baseEffect }} Rank {{ sub.effect?.ranks }}</span>
                      <div class="rail-item-actions">
                        <button
                          type="button"
                          class="btn-rail-stunt-mini"
                          title="Add Alternate Stunt to this Power"
                          @click.stop="builderStore.activeSubPowerIndex = dIdx; builderStore.addArraySlot(true)"
                        >
                          <i class="ri-shuffle-line"></i>
                        </button>
                        <button
                          v-if="builderStore.power.devicePowers?.length > 1"
                          type="button"
                          class="btn-rail-remove"
                          title="Remove this power"
                          @click.stop="builderStore.removeDeviceSubPower(dIdx)"
                        >
                          <i class="ri-close-line"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Sub-power's Linked Effects -->
                <div v-if="sub.linkedEffects?.length" class="rail-nested-items-block">
                  <div
                    v-for="(dLnk, dlIdx) in sub.linkedEffects"
                    :key="'dev_' + dIdx + '_lnk_' + dlIdx"
                    class="rail-nav-item rail-nested-item"
                    :class="{ active: builderStore.activeTargetType === 'linked' && builderStore.activeSubPowerIndex === dIdx && builderStore.activeLinkedIndex === dlIdx }"
                    @click="builderStore.activeSubPowerIndex = dIdx; builderStore.selectLinkedForEditing(dlIdx)"
                  >
                    <div class="rail-item-icon-box linked-box mini-box">
                      <i class="ri-links-line"></i>
                    </div>
                    <div class="rail-item-main">
                      <div class="rail-item-header-row">
                        <span class="rail-item-title">{{ dLnk.name || dLnk.baseEffect }}</span>
                        <span class="rail-item-cost-badge">{{ calculateEffectCost(dLnk, 0).totalCost }} PP</span>
                      </div>
                      <div class="rail-item-sub-row">
                        <span class="rail-item-subtitle">{{ dLnk.baseEffect }} R{{ dLnk.ranks }}</span>
                        <div class="rail-item-actions">
                          <button
                            type="button"
                            class="btn-rail-remove"
                            title="Remove linked effect"
                            @click.stop="builderStore.removeLinkedEffect(sub, dlIdx)"
                          >
                            <i class="ri-close-line"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Sub-power's Alternate Stunts -->
                <div v-if="sub.alternateEffects?.length" class="rail-nested-items-block">
                  <div
                    v-for="(dSlot, dsIdx) in sub.alternateEffects"
                    :key="'dev_' + dIdx + '_slot_' + dsIdx"
                    class="rail-slot-wrapper"
                  >
                    <div
                      class="rail-nav-item rail-nested-item"
                      :class="{ active: builderStore.activeTargetType === 'slot' && builderStore.activeSubPowerIndex === dIdx && builderStore.activeSlotIndex === dsIdx }"
                      @click="builderStore.activeSubPowerIndex = dIdx; builderStore.selectSlotForEditing(true, dsIdx)"
                    >
                      <div class="rail-item-icon-box alt-slot-box">
                        <i :class="getEffectIcon(dSlot.effect?.baseEffect)"></i>
                      </div>
                      <div class="rail-item-main">
                        <div class="rail-item-header-row">
                          <span class="rail-item-title">{{ dSlot.name || dSlot.effect?.baseEffect || ('Stunt #' + (dsIdx + 1)) }}</span>
                          <span class="rail-item-cost-badge">{{ dSlot.isDynamic ? '2 PP' : '1 PP' }}</span>
                        </div>
                        <div class="rail-item-sub-row">
                          <span class="rail-item-subtitle">{{ dSlot.effect?.baseEffect }} R{{ dSlot.effect?.ranks }} ({{ getSlotCombinedValue(dSlot) }} PP)</span>
                          <div class="rail-item-actions">
                            <button
                              type="button"
                              class="btn-slot-dynamic-toggle"
                              :class="{ dynamic: dSlot.isDynamic }"
                              @click.stop="builderStore.toggleSlotDynamic(true, dsIdx)"
                              :title="dSlot.isDynamic ? 'Dynamic Stunt (2 PP)' : 'Alternate Stunt (1 PP)'"
                            >
                              {{ dSlot.isDynamic ? 'Dyn' : 'Alt' }}
                            </button>
                            <button
                              type="button"
                              class="btn-rail-link-mini"
                              title="Add Linked Effect to this Stunt"
                              @click.stop="builderStore.activeSubPowerIndex = dIdx; builderStore.selectSlotForEditing(true, dsIdx); builderStore.addLinkedEffect(dSlot, 'Affliction')"
                            >
                              <i class="ri-links-line"></i>
                            </button>
                            <button
                              type="button"
                              class="btn-rail-remove"
                              title="Remove stunt"
                              @click.stop="builderStore.removeArraySlot(true, dsIdx)"
                            >
                              <i class="ri-close-line"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Sub-power Stunt's Linked Effects -->
                    <div v-if="dSlot.linkedEffects?.length" class="rail-deeply-nested-block">
                      <div
                        v-for="(dslLnk, dslIdx) in dSlot.linkedEffects"
                        :key="'dev_' + dIdx + '_slot_' + dsIdx + '_lnk_' + dslIdx"
                        class="rail-nav-item rail-deep-nested-item"
                        :class="{ active: builderStore.activeTargetType === 'slot_linked' && builderStore.activeSubPowerIndex === dIdx && builderStore.activeSlotIndex === dsIdx && builderStore.activeLinkedIndex === dslIdx }"
                        @click="builderStore.activeSubPowerIndex = dIdx; builderStore.selectSlotLinkedForEditing(dsIdx, dslIdx, false)"
                      >
                        <div class="rail-item-icon-box linked-box mini-box">
                          <i class="ri-links-line"></i>
                        </div>
                        <div class="rail-item-main">
                          <div class="rail-item-header-row">
                            <span class="rail-item-title">{{ dslLnk.name || dslLnk.baseEffect }}</span>
                            <span class="rail-item-cost-badge">{{ calculateEffectCost(dslLnk, 0).totalCost }} PP</span>
                          </div>
                          <div class="rail-item-sub-row">
                            <span class="rail-item-subtitle">{{ dslLnk.baseEffect }} R{{ dslLnk.ranks }}</span>
                            <div class="rail-item-actions">
                              <button
                                type="button"
                                class="btn-rail-remove"
                                title="Remove linked effect from stunt"
                                @click.stop="builderStore.removeLinkedEffect(dSlot, dslIdx)"
                              >
                                <i class="ri-close-line"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </aside>

      <!-- PANE 2: CENTER STAGE (Crafting Canvas flex: 1) -->
      <section class="workspace-center-col">
        <EffectEditorCanvas
          :key="canvasKey"
          :effect="builderStore.currentEditingEffect"
          :title="canvasTitle"
        />
      </section>

      <!-- PANE 3: RIGHT DOCK (~280px Live Math & Combat Profile) -->
      <aside class="workspace-sidebar-col">
        <CostBreakdownSidebar />
      </aside>
    </main>

    <!-- MODIFIERS INSPECTOR MODAL -->
    <ModifierInspectorModal />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { usePowerBuilderStore } from '../../stores/powerBuilderStore.js';
import { useHeroStore } from '../../stores/heroStore.js';
import { useUiStore } from '../../stores/uiStore.js';
import { calculatePowerTotalCost, calculateEffectCost } from '../../rules/powerEngine.js';

import StructureSelector from './StructureSelector.vue';
import EffectEditorCanvas from './EffectEditorCanvas.vue';
import CostBreakdownSidebar from './CostBreakdownSidebar.vue';
import ModifierInspectorModal from './ModifierInspectorModal.vue';

const builderStore = usePowerBuilderStore();
const heroStore = useHeroStore();
const uiStore = useUiStore();

const currentPowerSelectValue = computed(() => {
  if (builderStore.editingIndex >= 0 && builderStore.editingIndex < (heroStore.character.powers?.length || 0)) {
    return builderStore.editingIndex;
  }
  return 'custom';
});

const canvasKey = computed(() => {
  return `${builderStore.power.type}_${builderStore.activeTargetType}_${builderStore.activeCompoundIndex}_${builderStore.activeSubPowerIndex}_${builderStore.activeSlotIndex}_${builderStore.activeLinkedIndex}_${builderStore.currentEditingEffect?.id || builderStore.currentEditingEffect?.baseEffect || 'eff'}`;
});

const canvasTitle = computed(() => {
  if (builderStore.power.type === 'compound') {
    if (builderStore.activeTargetType === 'compound_slot_linked') {
      return 'Compound Stunt Linked';
    }
    if (builderStore.activeTargetType === 'compound_slot') {
      return 'Compound Stunt';
    }
    if (builderStore.activeTargetType === 'compound_linked') {
      return 'Compound Linked Effect';
    }
    return 'Compound Sub-Effect';
  }
  if (builderStore.power.type === 'device') {
    if (builderStore.activeTargetType === 'slot_linked') {
      return 'Stunt Linked Effect';
    }
    if (builderStore.activeTargetType === 'slot') {
      return 'Alternate Stunt';
    }
    if (builderStore.activeTargetType === 'linked') {
      return 'Linked Effect';
    }
    return 'Device Sub-Power';
  }
  if (builderStore.activeTargetType === 'slot_linked') {
    return 'Stunt Linked Effect';
  }
  if (builderStore.activeTargetType === 'slot') {
    return 'Alternate Stunt';
  }
  if (builderStore.activeTargetType === 'linked') {
    return 'Linked Effect';
  }
  return 'Primary Effect';
});

function selectMainEffect() {
  builderStore.activeTargetType = 'main';
  builderStore.activeSlotIndex = 0;
}

function getSubEffectCost(sub) {
  if (!sub?.effect) return 0;
  const mainCost = calculateEffectCost(sub.effect, 0).totalCost;
  const linkedCost = (sub.linkedEffects || []).reduce((sum, l) => sum + calculateEffectCost(l, 0).totalCost, 0);
  const altCost = (sub.alternateEffects || []).reduce((sum, a) => sum + (a.isDynamic ? 2 : 1), 0);
  return mainCost + linkedCost + altCost;
}

function getSubPowerCost(sub) {
  if (!sub?.effect) return 0;
  const mainCost = calculateEffectCost(sub.effect, 0).totalCost;
  const linkedCost = (sub.linkedEffects || []).reduce((sum, l) => sum + calculateEffectCost(l, 0).totalCost, 0);
  const altCost = (sub.alternateEffects || []).reduce((sum, a) => sum + (a.isDynamic ? 2 : 1), 0);
  return mainCost + linkedCost + altCost;
}

function getSlotCombinedValue(slot) {
  if (!slot?.effect) return 0;
  const mainCost = calculateEffectCost(slot.effect, 0).totalCost;
  const linkedCost = (slot.linkedEffects || []).reduce((sum, l) => sum + calculateEffectCost(l, 0).totalCost, 0);
  return mainCost + linkedCost;
}

function getEffectIcon(baseEffect) {
  const map = {
    Damage: 'ri-sword-line',
    Blast: 'ri-flashlight-line',
    Affliction: 'ri-virus-line',
    Protection: 'ri-shield-line',
    Flight: 'ri-flight-takeoff-line',
    Speed: 'ri-run-line',
    Quickness: 'ri-timer-flash-line',
    'Enhanced Trait': 'ri-arrow-up-circle-line',
    Healing: 'ri-heart-pulse-line',
    Weaken: 'ri-arrow-down-circle-line',
    'Move Object': 'ri-hand-coin-line',
    Environment: 'ri-sun-cloud-line',
    Concealment: 'ri-eye-close-line',
    Senses: 'ri-radar-line',
    Immunity: 'ri-shield-cross-line',
    Regeneration: 'ri-refresh-line'
  };
  return map[baseEffect] || 'ri-flashlight-line';
}

function handlePowerSelectChange(val) {
  if (val === 'new_standard') {
    builderStore.openNewPower('standard');
  } else if (val === 'new_compound') {
    builderStore.openNewPower('compound');
  } else if (val === 'new_device') {
    builderStore.openNewPower('device');
  } else {
    const pIdx = Number(val);
    const rawPower = heroStore.character.powers[pIdx];
    if (rawPower) {
      builderStore.openEditPower(pIdx, rawPower);
    }
  }
}

function handleSave() {
  if (!builderStore.power.name || builderStore.power.name.trim() === '') {
    builderStore.power.name = builderStore.power.type === 'device' ? 'Unnamed Device' : builderStore.power.type === 'compound' ? 'Unnamed Compound Power' : 'Unnamed Power';
  }

  if (builderStore.editingIndex === -1) {
    heroStore.addPower(builderStore.power);
    uiStore.showToast(`Saved power: ${builderStore.power.name}`, 'success');
  } else {
    heroStore.updatePower(builderStore.editingIndex, builderStore.power);
    uiStore.showToast(`Updated power: ${builderStore.power.name}`, 'success');
  }

  builderStore.closeModal();
}
</script>

<style scoped>
.power-studio-fullscreen-window {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  z-index: var(--z-modal, 90);
  background: var(--bg-main, #0b0f19);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

/* ==========================================================================
   COMPACT WORKSTATION HEADER BAR (~54px)
   ========================================================================== */
.workspace-header-bar {
  height: 54px;
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98));
  border-bottom: 1.5px solid var(--border-color);
  padding: 0 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  flex-shrink: 0;
}

.header-left-cluster {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  flex: 1;
  min-width: 0;
}

.btn-back-sheet {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.76rem;
  font-weight: 700;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xs);
  color: var(--text-secondary);
  padding: 0.35rem 0.65rem;
  cursor: pointer;
  transition: all var(--trans-fast);
  white-space: nowrap;
}

.btn-back-sheet:hover {
  background: var(--bg-card-hover);
  color: var(--text-primary);
  border-color: var(--border-color);
}

.power-title-editor {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  max-width: 480px;
  min-width: 180px;
}

.power-name-input {
  width: 100%;
  background: transparent;
  border: 1px solid transparent;
  color: #fff;
  font-size: 1.05rem;
  font-weight: 800;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-xs);
  outline: none;
  font-family: inherit;
  transition: all var(--trans-fast);
}

.power-name-input:hover,
.power-name-input:focus {
  background: var(--bg-surface);
  border-color: var(--border-color);
}

.power-type-badge {
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.15rem 0.45rem;
  border-radius: var(--radius-xs);
  background: rgba(0, 111, 184, 0.15);
  border: 1px solid rgba(0, 111, 184, 0.35);
  color: #38bdf8;
  white-space: nowrap;
}

.power-type-badge.compound {
  background: rgba(14, 165, 233, 0.15);
  border-color: rgba(14, 165, 233, 0.35);
}

.power-type-badge.device {
  background: rgba(16, 185, 129, 0.15);
  border-color: rgba(16, 185, 129, 0.35);
  color: #34d399;
}

.power-switcher-dropdown-group {
  display: flex;
  align-items: center;
}

.power-selector-select {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  font-size: 0.74rem;
  font-weight: 700;
  padding: 0.3rem 0.6rem;
  border-radius: var(--radius-xs);
  outline: none;
  cursor: pointer;
  max-width: 180px;
}

.power-selector-select option {
  background-color: #0f172a;
  color: #f8fafc;
}

.header-actions-cluster {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-shrink: 0;
}

.btn-studio-action {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.76rem;
  font-weight: 700;
  padding: 0.35rem 0.75rem;
  border-radius: var(--radius-xs);
  cursor: pointer;
  transition: all var(--trans-fast);
  white-space: nowrap;
}

.btn-new-power {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
}

.btn-new-power:hover {
  background: var(--bg-card-hover);
  color: var(--text-primary);
}

.btn-save-power {
  background: var(--accent-primary);
  border: 1px solid var(--accent-primary-hover);
  color: #fff;
  box-shadow: var(--shadow-sm);
}

.btn-save-power:hover {
  background: var(--accent-primary-hover);
}

.btn-close-window {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: var(--radius-xs);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--trans-fast);
}

.btn-close-window:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

/* ==========================================================================
   MODERN 3-PANE MASTER-DETAIL LAYOUT
   ========================================================================== */
.workspace-main-content {
  flex: 1;
  display: grid;
  grid-template-columns: 310px minmax(0, 1fr) 300px;
  gap: 1.15rem;
  padding: 0.85rem 1.15rem;
  box-sizing: border-box;
  overflow: hidden;
  height: calc(100vh - 54px);
}

@media (max-width: 1200px) {
  .workspace-main-content {
    grid-template-columns: 290px minmax(0, 1fr) 280px;
    gap: 0.85rem;
    padding: 0.65rem;
  }
}

@media (max-width: 980px) {
  .workspace-main-content {
    grid-template-columns: 1fr;
    overflow-y: auto;
    height: auto;
  }
}

/* ==========================================================================
   PANE 1: LEFT NAVIGATION RAIL
   ========================================================================== */
.workspace-rail-col {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  overflow-y: auto;
  min-width: 0;
  padding-right: 0.25rem;
}

.rail-section {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 0.65rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.rail-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  padding: 0 0.2rem;
}

.btn-rail-add {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.2rem 0.45rem;
  font-size: 0.68rem;
  font-weight: 700;
  background: rgba(0, 111, 184, 0.12);
  border: 1px solid rgba(0, 111, 184, 0.25);
  border-radius: var(--radius-xs);
  color: var(--accent-primary);
  cursor: pointer;
  transition: all var(--trans-fast);
}

.btn-rail-add:hover {
  background: var(--accent-primary);
  color: #fff;
}

.rail-items-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.rail-nav-item {
  display: flex;
  align-items: flex-start;
  gap: 0.55rem;
  padding: 0.48rem 0.55rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xs);
  cursor: pointer;
  transition: all var(--trans-fast);
  min-width: 0;
}

.rail-nav-item:hover {
  background: var(--bg-card-hover);
  border-color: var(--border-color);
}

.rail-nav-item.active {
  background: rgba(0, 111, 184, 0.12);
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 1px rgba(0, 111, 184, 0.35);
}

.rail-item-icon-box {
  width: 28px;
  height: 28px;
  background: rgba(0, 111, 184, 0.15);
  border: 1px solid rgba(0, 111, 184, 0.3);
  color: var(--accent-primary);
  border-radius: var(--radius-xs);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  flex-shrink: 0;
  margin-top: 0.1rem;
}

.rail-item-icon-box.alt-slot-box {
  background: rgba(14, 165, 233, 0.12);
  border-color: rgba(14, 165, 233, 0.3);
  color: #38bdf8;
}

.rail-item-icon-box.device-box {
  background: rgba(16, 185, 129, 0.12);
  border-color: rgba(16, 185, 129, 0.3);
  color: #34d399;
}

.rail-item-icon-box.compound-box {
  background: rgba(99, 102, 241, 0.12);
  border-color: rgba(99, 102, 241, 0.3);
  color: #818cf8;
}

.rail-item-icon-box.compound-box.is-primary {
  background: rgba(234, 179, 8, 0.15);
  border-color: rgba(234, 179, 8, 0.4);
  color: #fde047;
}

.pri-indicator {
  display: inline-block;
  font-size: 0.58rem;
  font-weight: 800;
  color: #fde047;
  background: rgba(234, 179, 8, 0.18);
  border: 1px solid rgba(234, 179, 8, 0.35);
  border-radius: 3px;
  padding: 0.05rem 0.25rem;
  margin-left: 0.3rem;
  vertical-align: middle;
}

.rail-item-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.rail-item-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.35rem;
  min-width: 0;
}

.rail-item-title {
  font-size: 0.78rem;
  font-weight: 800;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  flex: 1;
}

.rail-item-cost-badge {
  font-size: 0.67rem;
  font-weight: 800;
  color: var(--accent-secondary);
  font-family: var(--font-mono);
  white-space: nowrap;
  flex-shrink: 0;
  background: rgba(56, 189, 248, 0.08);
  padding: 0.08rem 0.32rem;
  border-radius: 3px;
  border: 1px solid rgba(56, 189, 248, 0.2);
}

.rail-item-sub-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.35rem;
  min-width: 0;
}

.rail-item-subtitle {
  font-size: 0.67rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  flex: 1;
}

.rail-item-actions {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  flex-shrink: 0;
}

.btn-rail-remove {
  background: transparent;
  border: none;
  color: var(--text-muted);
  padding: 0.2rem;
  font-size: 0.85rem;
  cursor: pointer;
  border-radius: var(--radius-xs);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--trans-fast);
}

.btn-rail-remove:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.15);
}

.btn-slot-dynamic-toggle {
  padding: 0.08rem 0.3rem;
  font-size: 0.62rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xs);
  color: var(--text-muted);
  cursor: pointer;
  transition: all var(--trans-fast);
}

.btn-slot-dynamic-toggle.dynamic {
  background: rgba(234, 179, 8, 0.15);
  border-color: rgba(234, 179, 8, 0.4);
  color: #fde047;
}

.rail-empty-hint {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.65rem 0.55rem;
  border: 1px dashed var(--border-subtle);
  border-radius: var(--radius-xs);
  color: var(--text-muted);
  font-size: 0.7rem;
  line-height: 1.35;
  cursor: pointer;
  transition: all var(--trans-fast);
}

.rail-empty-hint:hover {
  border-color: var(--accent-primary);
  color: var(--text-secondary);
  background: rgba(0, 111, 184, 0.05);
}

.rail-empty-hint i {
  font-size: 1rem;
  color: var(--text-muted);
  flex-shrink: 0;
}

/* Compound Suite Specific */
.rail-role-badge {
  width: 26px;
  height: 26px;
  border-radius: var(--radius-xs);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: 800;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--border-subtle);
  color: var(--text-muted);
  flex-shrink: 0;
}

.rail-role-badge.primary {
  background: rgba(234, 179, 8, 0.15);
  border-color: #eab308;
  color: #fde047;
}

.rail-role-badge.linked {
  background: rgba(56, 189, 248, 0.15);
  border-color: #38bdf8;
  color: #38bdf8;
}

.rail-reorder-actions {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.btn-reorder-mini {
  background: transparent;
  border: none;
  color: var(--text-muted);
  padding: 0;
  font-size: 0.75rem;
  line-height: 1;
  cursor: pointer;
}

.btn-reorder-mini:disabled {
  opacity: 0.25;
  cursor: not-allowed;
}

.btn-reorder-mini:not(:disabled):hover {
  color: #fff;
}

.rail-alert-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.35);
  border-radius: var(--radius-xs);
  padding: 0.45rem 0.65rem;
}

.alert-content {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.7rem;
  color: #fbbf24;
}

.btn-rail-harmonize {
  padding: 0.2rem 0.45rem;
  font-size: 0.68rem;
  font-weight: 800;
  background: #f59e0b;
  border: none;
  border-radius: var(--radius-xs);
  color: #000;
  cursor: pointer;
  white-space: nowrap;
}

/* Device Discount Pills */
.device-discount-pill-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.btn-discount-pill {
  padding: 0.35rem 0.55rem;
  font-size: 0.72rem;
  font-weight: 700;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xs);
  color: var(--text-secondary);
  cursor: pointer;
  text-align: left;
  transition: all var(--trans-fast);
}

.btn-discount-pill:hover {
  background: var(--bg-card-hover);
  border-color: var(--border-color);
}

.btn-discount-pill.active {
  background: rgba(16, 185, 129, 0.15);
  border-color: #34d399;
  color: #34d399;
}

/* ==========================================================================
   PANE 2: CENTER STAGE
   ========================================================================== */
.workspace-center-col {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  min-width: 0;
  padding-right: 0.25rem;
}

/* ==========================================================================
   PANE 3: RIGHT DOCK
   ========================================================================== */
.workspace-sidebar-col {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  min-width: 0;
}

/* ==========================================================================
   NESTED RAIL HIERARCHY STYLES
   ========================================================================== */
.rail-compound-group,
.rail-slot-wrapper {
  display: flex;
  flex-direction: column;
}

.rail-nested-items-block {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding-left: 0.85rem;
  border-left: 2px solid rgba(255, 255, 255, 0.08);
  margin-left: 0.75rem;
  margin-top: 0.25rem;
  margin-bottom: 0.35rem;
}

.rail-deeply-nested-block {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding-left: 0.85rem;
  border-left: 2px solid rgba(255, 255, 255, 0.08);
  margin-left: 0.75rem;
  margin-top: 0.25rem;
  margin-bottom: 0.35rem;
}

.rail-nav-item.rail-nested-item {
  padding: 0.38rem 0.5rem;
  background: rgba(255, 255, 255, 0.02);
  border-color: rgba(255, 255, 255, 0.06);
}

.rail-nav-item.rail-nested-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: var(--border-color);
}

.rail-nav-item.rail-deep-nested-item {
  padding: 0.32rem 0.45rem;
  background: rgba(255, 255, 255, 0.015);
  border-color: rgba(255, 255, 255, 0.05);
}

.rail-item-icon-box.mini-box {
  width: 22px;
  height: 22px;
  font-size: 0.75rem;
}

.rail-item-icon-box.linked-box {
  background: rgba(52, 211, 153, 0.12);
  border-color: rgba(52, 211, 153, 0.3);
  color: #34d399;
}

.btn-rail-link-mini,
.btn-rail-stunt-mini {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  padding: 0;
  font-size: 0.75rem;
  color: var(--text-muted);
  background: transparent;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xs);
  cursor: pointer;
  transition: all var(--trans-fast);
  flex-shrink: 0;
}

.btn-rail-link-mini:hover {
  color: #34d399;
  border-color: rgba(52, 211, 153, 0.4);
  background: rgba(52, 211, 153, 0.1);
}

.btn-rail-stunt-mini:hover {
  color: #38bdf8;
  border-color: rgba(56, 189, 248, 0.4);
  background: rgba(56, 189, 248, 0.1);
}
</style>
