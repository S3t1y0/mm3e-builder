<template>
  <div class="sheet-card powers-deck-section">
    <div class="card-header-row">
      <div class="card-title-group">
        <i class="ri-flashlight-line icon-primary"></i>
        <h3>Powers & Devices Deck</h3>
      </div>

      <div class="header-right-actions">
        <button
          v-if="heroStore.character.powers.length > 0"
          type="button"
          class="btn-expand-all"
          :title="isAllExpanded ? 'Collapse All Powers' : 'Expand All Powers'"
          @click="toggleExpandAll"
        >
          <i :class="isAllExpanded ? 'ri-contract-up-down-line' : 'ri-expand-up-down-line'"></i>
          <span>{{ isAllExpanded ? 'Collapse All' : 'Expand All' }}</span>
        </button>

        <button
          v-if="heroStore.character.powers.length > 0"
          type="button"
          class="btn-toggle-all-powers"
          :class="{ 'all-active': isAnyPowerActive, 'all-off': !isAnyPowerActive }"
          :title="isAnyPowerActive ? 'Deactivate all powers' : 'Activate all powers'"
          @click="handleToggleAllPowers"
        >
          <i :class="isAnyPowerActive ? 'ri-toggle-fill' : 'ri-toggle-line'"></i>
          <span>{{ isAnyPowerActive ? 'Disable All' : 'Enable All' }}</span>
        </button>

        <div class="create-power-btn-group">
          <button type="button" class="btn-create-p" @click="handleCreatePower('standard')">
            <i class="ri-flashlight-line"></i> + Standard
          </button>
          <button type="button" class="btn-create-p compound" @click="handleCreatePower('compound')">
            <i class="ri-stack-line"></i> + Compound
          </button>
          <button type="button" class="btn-create-p dev" @click="handleCreatePower('device')">
            <i class="ri-shield-keyhole-line"></i> + Device
          </button>
        </div>
        <span class="header-total-badge">{{ heroStore.totalPowerPP }} PP Total</span>
      </div>
    </div>

    <!-- Empty Powers Hint -->
    <div v-if="heroStore.character.powers.length === 0" class="empty-powers-box">
      <i class="ri-flashlight-line"></i>
      <p>No powers added yet. Select + Standard, + Compound, or + Device to open Power Studio.</p>
    </div>

    <!-- Powers Cards List -->
    <div v-else class="powers-cards-deck">
      <div
        v-for="(pow, idx) in heroStore.character.powers"
        :key="pow.id || idx"
        class="power-item-card"
        :class="{
          'type-device': pow.type === 'device',
          'type-compound': pow.type === 'compound',
          'type-array': pow.type === 'array' || (Array.isArray(pow.alternateEffects) && pow.alternateEffects.length > 0),
          'type-standard': pow.type === 'standard' && (!Array.isArray(pow.alternateEffects) || pow.alternateEffects.length === 0),
          'is-deactivated': pow.active === false
        }"
      >
        <!-- Card Top Header (Row 1: Identity & Primary Actions) -->
        <div class="pow-card-header">
          <div class="pow-title-area">
            <!-- Active / Offline Switch -->
            <button
              type="button"
              class="power-toggle-btn"
              :class="{ 'is-active': pow.active !== false, 'is-off': pow.active === false }"
              :title="pow.active !== false ? 'Power is Active (Click to Deactivate)' : 'Power is Offline (Click to Activate)'"
              @click.stop="handleTogglePower(pow)"
            >
              <i :class="pow.active !== false ? 'ri-toggle-fill' : 'ri-toggle-line'"></i>
              <span class="toggle-status-text">{{ pow.active !== false ? 'ACTIVE' : 'OFFLINE' }}</span>
            </button>

            <h4 class="pow-name" :title="pow.name || 'Unnamed Power'">{{ pow.name || 'Unnamed Power' }}</h4>

            <!-- Structure Type Badge (Device / Compound / Array) -->
            <span v-if="pow.type && pow.type !== 'standard'" class="structure-badge" :class="`badge-${pow.type}`">
              {{ pow.type === 'compound' ? `COMPOUND (${pow.compoundEffects?.length || 0})` : pow.type.toUpperCase() }}
            </span>
            <span v-else-if="Array.isArray(pow.alternateEffects) && pow.alternateEffects.length > 0" class="structure-badge badge-array">
              ARRAY
            </span>
          </div>

          <div class="pow-card-actions">
            <span class="pow-cost-badge">{{ getPowerCost(pow) }} PP</span>

            <!-- Broadcast to Roll20 VTT Button -->
            <button
              type="button"
              class="btn-send-vtt"
              title="Broadcast power details to Roll20 chat"
              @click="broadcastPower(pow)"
            >
              <i class="ri-broadcast-line"></i>
            </button>

            <!-- Edit in Power Studio -->
            <button
              type="button"
              class="btn-edit-power"
              title="Edit in Power Studio Tab"
              @click="handleEditPower(idx, pow)"
            >
              <i class="ri-edit-line"></i>
              <span>Edit</span>
            </button>

            <!-- Expand / Collapse Toggle -->
            <button
              type="button"
              class="btn-toggle-expand"
              :class="{ expanded: isExpanded(pow.id || idx) }"
              :title="isExpanded(pow.id || idx) ? 'Collapse details' : 'Expand full rules & mechanics'"
              @click="toggleExpand(pow.id || idx)"
            >
              <span>{{ isExpanded(pow.id || idx) ? 'Less' : 'Details' }}</span>
              <i :class="isExpanded(pow.id || idx) ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'"></i>
            </button>

            <!-- Delete Power -->
            <button
              type="button"
              class="btn-del-power"
              title="Delete Power"
              @click="heroStore.removePower(idx)"
            >
              <i class="ri-delete-bin-line"></i>
            </button>
          </div>
        </div>

        <!-- Card Sub-Meta Strip (Row 2: Subtle Editorial Details) -->
        <div v-if="hasPowerSubMeta(pow)" class="pow-card-submeta">
          <span v-if="pow.type === 'device'" class="submeta-item">
            <i class="ri-shield-keyhole-line text-cyan"></i>
            <span>{{ pow.deviceConfig?.descriptor || 'High-Tech Device' }}</span>
          </span>
          <span v-if="pow.type === 'device'" class="submeta-dot">•</span>
          <span v-if="pow.type === 'device'" class="submeta-item">
            Toughness {{ pow.deviceConfig?.toughness || 10 }}
          </span>
          <template v-if="pow.type === 'device' && pow.deviceConfig?.type && pow.deviceConfig.type !== 'none'">
            <span class="submeta-dot">•</span>
            <span class="submeta-item removable-text">
              <i class="ri-hand-coin-line"></i>
              {{ pow.deviceConfig.type === 'easily_removable' ? 'Easily Removable (-2/5 PP)' : 'Removable (-1/5 PP)' }}
            </span>
          </template>
          <template v-if="pow.activation && pow.activation !== 'none'">
            <span class="submeta-dot">•</span>
            <span class="submeta-item flaw-text">
              <i class="ri-timer-flash-line"></i>
              Activation: {{ pow.activation === 'move' ? 'Move (-1 PP)' : 'Standard (-2 PP)' }}
            </span>
          </template>
        </div>

        <!-- ================================================================= -->
        <!-- GLANCE SUMMARY (Mode Less Quick Reference) -->
        <!-- ================================================================= -->
        
        <!-- Case 1: Standard or Array Power Glance -->
        <div
          v-if="pow.type !== 'device' && pow.type !== 'compound' && (!isExpanded(pow.id || idx) || pow.type === 'array' || (Array.isArray(pow.alternateEffects) && pow.alternateEffects.length > 0))"
          class="pow-glance-summary"
          :class="{ 'is-expanded-mode-strip': isExpanded(pow.id || idx) }"
        >
          <!-- Array Slot Switcher Bar (if Array or has Alternate Effects) -->
          <div v-if="pow.type === 'array' || pow.alternateEffects?.length > 0" class="array-glance-switcher">
            <span class="glance-label"><i class="ri-shuffle-line"></i> Mode:</span>
            <div class="slot-buttons-group">
              <button
                type="button"
                class="slot-btn"
                :class="{ active: (pow.activeSlotId || 'main') === 'main' }"
                @click="heroStore.setActivePowerSlot(pow.id, 'main')"
              >
                ★ {{ pow.mainEffect?.name || 'Primary' }}
              </button>
              <button
                v-for="alt in (pow.alternateEffects || [])"
                :key="alt.id"
                type="button"
                class="slot-btn"
                :class="{ active: pow.activeSlotId === alt.id }"
                @click="heroStore.setActivePowerSlot(pow.id, alt.id)"
              >
                {{ alt.name }}
              </button>
            </div>
          </div>

          <!-- Active Effect Quick Parameters Strip (Collapsed Mode Less) -->
          <div v-if="!isExpanded(pow.id || idx)" class="glance-combat-flow">
            <div class="glance-specs-flow">
              <span class="glance-spec-item effect-main">
                <strong class="glance-effect-name">{{ getActiveEffect(pow).baseEffect }}</strong>
                <span class="glance-rank-pill">{{ getActiveEffect(pow).ranks }}R</span>
                <small v-if="getEffectConfigDetails(getActiveEffect(pow))?.quickText" class="glance-config-text">
                  ({{ getEffectConfigDetails(getActiveEffect(pow)).quickText }})
                </small>
              </span>
              <span class="glance-spec-item">
                <i class="ri-flashlight-line"></i> {{ getActiveEffect(pow).action || 'Standard' }}
              </span>
              <span class="glance-spec-item">
                <i class="ri-focus-line"></i> {{ formatRange(getActiveEffect(pow)) }}
              </span>
              <span v-if="calculateDC(getActiveEffect(pow))" class="glance-spec-item dc-highlight">
                <i class="ri-shield-check-line"></i> {{ calculateDC(getActiveEffect(pow)) }}
              </span>
            </div>

            <!-- Modifiers Inline Flow (Extras, Flaws, Linked) -->
            <div
              v-if="((getActiveEffect(pow).extras?.length || 0) + (getActiveEffect(pow).flaws?.length || 0) + (getActiveLinkedEffects(pow)?.length || 0) > 0)"
              class="glance-inline-mods"
            >
              <span v-if="getActiveEffect(pow).extras?.length > 0" class="inline-mod-segment extra">
                <strong class="mod-type-lbl">+Extras:</strong>
                {{ formatModifiersInline(getActiveEffect(pow).extras) }}
              </span>
              <span v-if="getActiveEffect(pow).flaws?.length > 0" class="inline-mod-segment flaw">
                <strong class="mod-type-lbl">-Flaws:</strong>
                {{ formatModifiersInline(getActiveEffect(pow).flaws) }}
              </span>
              <span v-if="getActiveLinkedEffects(pow)?.length > 0" class="inline-mod-segment linked">
                <strong class="mod-type-lbl"><i class="ri-links-line"></i> Linked:</strong>
                {{ formatLinkedInline(getActiveLinkedEffects(pow)) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Case 2: Device Tactical Systems Chips Roster (Collapsed Mode Less) -->
        <div v-else-if="pow.type === 'device' && !isExpanded(pow.id || idx)" class="pow-glance-summary device-tactical-glance">
          <div class="device-tactical-roster">
            <div
              v-for="(sub, sIdx) in (pow.devicePowers || [])"
              :key="sub.id || sIdx"
              class="device-system-chip"
              :class="{
                'is-chip-offline': sub.active === false || pow.active === false
              }"
              @click="setActiveDeviceSubIndex(pow.id || idx, sIdx); toggleExpand(pow.id || idx)"
            >
              <!-- Interactive online/offline toggle dot -->
              <button
                type="button"
                class="chip-toggle-dot-btn"
                :class="{
                  online: sub.active !== false && pow.active !== false,
                  offline: sub.active === false || pow.active === false
                }"
                :disabled="pow.active === false"
                :title="pow.active === false ? 'Parent device is Offline' : (sub.active !== false ? 'System is Active (Click to Deactivate)' : 'System is Offline (Click to Activate)')"
                @click.stop="handleToggleSubPower(pow, sIdx, sub)"
              >
                <span class="chip-status-dot"></span>
              </button>

              <!-- Effect Icon -->
              <i :class="getEffectIcon(getSubPowerActiveEffect(sub).baseEffect)" class="chip-icon"></i>

              <!-- System Name & Effect Ranks -->
              <div class="chip-label-group">
                <strong class="chip-sys-name">{{ sub.name || `System ${sIdx + 1}` }}</strong>
                <span class="chip-sys-effect">
                  {{ getSubPowerActiveEffect(sub).baseEffect }} {{ getSubPowerActiveEffect(sub).ranks }}R
                  <small v-if="getEffectConfigDetails(getSubPowerActiveEffect(sub))?.quickText" class="chip-quick-text">
                    ({{ getEffectConfigDetails(getSubPowerActiveEffect(sub)).quickText }})
                  </small>
                </span>
              </div>

              <!-- DC Pill (if applicable) -->
              <span
                v-if="calculateDC(getSubPowerActiveEffect(sub))"
                class="chip-dc-tag"
                :title="calculateDC(getSubPowerActiveEffect(sub))"
              >
                {{ calculateCompactDC(getSubPowerActiveEffect(sub)) || calculateDC(getSubPowerActiveEffect(sub)) }}
              </span>

              <!-- Micro Roll20 Broadcast Button -->
              <button
                type="button"
                class="chip-vtt-btn"
                title="Broadcast this system to Roll20"
                @click.stop="broadcastSubPower(pow, sub, sIdx)"
              >
                <i class="ri-broadcast-line"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Case 3: Compound Tactical Systems Chips Roster (Collapsed Mode Less) -->
        <div v-else-if="pow.type === 'compound' && !isExpanded(pow.id || idx)" class="pow-glance-summary compound-tactical-glance">
          <div class="compound-tactical-roster">
            <div
              v-for="(sub, sIdx) in (pow.compoundEffects || [])"
              :key="sub.id || sIdx"
              class="compound-system-chip"
              :class="{
                'is-primary': isCompoundSubPrimary(pow, sub, sIdx),
                'is-chip-offline': sub.active === false || pow.active === false
              }"
              :title="isCompoundSubPrimary(pow, sub, sIdx) ? `[Primary Action] ${sub.name || 'Component'}` : (sub.name || 'Component')"
              @click="setActiveCompoundSubIndex(pow.id || idx, sIdx); toggleExpand(pow.id || idx)"
            >
              <!-- Primary / Effect Icon -->
              <span
                class="compound-icon-wrapper"
                :class="{ 'is-primary-icon': isCompoundSubPrimary(pow, sub, sIdx) }"
                :title="isCompoundSubPrimary(pow, sub, sIdx) ? 'Primary Action Effect' : getSubPowerActiveEffect(sub).baseEffect"
              >
                <i :class="isCompoundSubPrimary(pow, sub, sIdx) ? 'ri-star-fill' : getEffectIcon(getSubPowerActiveEffect(sub).baseEffect)"></i>
              </span>

              <!-- Component Name & Effect Ranks -->
              <div class="chip-label-group">
                <div class="chip-title-line">
                  <strong class="chip-sys-name">{{ sub.name || `Component #${sIdx + 1}` }}</strong>
                  <span v-if="sub.alternateEffects?.length > 0" class="array-indicator-pill">ARRAY</span>
                </div>
                <span class="chip-sys-effect">
                  {{ getSubPowerActiveEffect(sub).baseEffect }} {{ getSubPowerActiveEffect(sub).ranks || 1 }}R
                  <small v-if="getEffectConfigDetails(getSubPowerActiveEffect(sub))?.quickText" class="chip-quick-text">
                    ({{ getEffectConfigDetails(getSubPowerActiveEffect(sub)).quickText }})
                  </small>
                </span>
              </div>

              <!-- DC Pill (if applicable) -->
              <span
                v-if="calculateDC(getSubPowerActiveEffect(sub))"
                class="chip-dc-tag compound"
                :title="calculateDC(getSubPowerActiveEffect(sub))"
              >
                {{ calculateCompactDC(getSubPowerActiveEffect(sub)) || calculateDC(getSubPowerActiveEffect(sub)) }}
              </span>

              <!-- Micro Roll20 Broadcast Button -->
              <button
                type="button"
                class="chip-vtt-btn compound"
                title="Broadcast this component to Roll20"
                @click.stop="broadcastSubPower(pow, sub, sIdx)"
              >
                <i class="ri-broadcast-line"></i>
              </button>
            </div>
          </div>

          <!-- Shared Suite Modifiers Strip (if any) -->
          <div v-if="(pow.sharedModifiers || []).length > 0" class="compound-shared-mods-row">
            <span class="shared-label"><i class="ri-links-line"></i> Shared Suite:</span>
            <span class="shared-inline-text">
              {{ formatModifiersInline(pow.sharedModifiers) }}
            </span>
          </div>
        </div>

        <!-- ================================================================= -->
        <!-- EXPANDED DOSSIER DRAWER (Slide-down with detailed rules & mechanics) -->
        <!-- ================================================================= -->
        <div v-if="isExpanded(pow.id || idx)" class="pow-expanded-drawer">
          <!-- Standard / Array Detailed Breakdown -->
          <div v-if="pow.type !== 'device' && pow.type !== 'compound'" class="drawer-content-flow">
            <!-- 1. Base Effect Official Rules & Mechanics -->
            <div class="dossier-block effect-rules-block">
              <div class="dossier-block-head">
                <div class="dossier-head-left">
                  <i class="ri-flashlight-line dossier-effect-icon"></i>
                  <span v-if="getActiveSlotTitle(pow)" class="active-stunt-mode-title">{{ getActiveSlotTitle(pow) }}:</span>
                  <span class="sub-effect-chip standard-effect-chip">
                    <strong class="sub-effect-name">{{ getActiveEffect(pow).baseEffect }}</strong>
                    <span class="sub-effect-rank">Rank {{ getActiveEffect(pow).ranks }}</span>
                  </span>
                </div>
                <button
                  type="button"
                  class="btn-effect-vtt"
                  title="Broadcast Base Effect rules to Roll20"
                  @click.stop="broadcastEffect(pow, getActiveEffect(pow))"
                >
                  <i class="ri-broadcast-line"></i>
                  <span>Broadcast Effect</span>
                </button>
              </div>

              <!-- Combat Specs Matrix Grid (Placed First for instant battle reference) -->
              <div class="dossier-specs-grid">
                <div class="spec-item">
                  <span class="spec-label"><i class="ri-flashlight-line"></i> Action</span>
                  <span class="spec-value">{{ getActiveEffect(pow).action || 'Standard' }}</span>
                </div>
                <div class="spec-item">
                  <span class="spec-label"><i class="ri-focus-line"></i> Range</span>
                  <span class="spec-value">{{ formatRange(getActiveEffect(pow)) }}</span>
                </div>
                <div class="spec-item">
                  <span class="spec-label"><i class="ri-time-line"></i> Duration</span>
                  <span class="spec-value">{{ getActiveEffect(pow).duration || 'Instant' }}</span>
                </div>
                <div v-if="hasResistanceCheck(getActiveEffect(pow))" class="spec-item">
                  <span class="spec-label"><i class="ri-shield-check-line"></i> Resistance Check</span>
                  <span class="spec-value highlight">{{ calculateDC(getActiveEffect(pow)) || (getActiveEffect(pow).resistance ? `vs ${getActiveEffect(pow).resistance}` : '') }}</span>
                </div>
              </div>

              <!-- Official Rulebook Callout Reference -->
              <div class="rulebook-callout-box">
                <span class="rulebook-caption">
                  <i class="ri-book-open-line"></i> Official Rulebook Mechanics:
                </span>
                <p class="dossier-desc-text">
                  {{ getEffectDesc(getActiveEffect(pow).baseEffect) }}
                </p>
              </div>
            </div>

            <!-- Configured Choices / Selections Block (e.g. Senses, Enhanced Trait, Movement, Immunity) -->
            <div v-if="getEffectConfigDetails(getActiveEffect(pow))" class="dossier-block config-choices-block">
              <div class="dossier-block-head config-head">
                <div class="dossier-head-left">
                  <i class="ri-checkbox-circle-fill"></i>
                  <span>{{ getEffectConfigDetails(getActiveEffect(pow)).title }}</span>
                </div>
                <span class="dossier-config-badge">{{ getEffectConfigDetails(getActiveEffect(pow)).badge }}</span>
              </div>
              <div class="config-choices-grid">
                <div
                  v-for="item in getEffectConfigDetails(getActiveEffect(pow)).items"
                  :key="item.name"
                  class="config-choice-card"
                >
                  <div class="config-choice-top">
                    <i :class="item.icon || 'ri-checkbox-circle-line'" class="choice-icon"></i>
                    <strong class="choice-name">{{ item.name }}</strong>
                    <span v-if="item.pts" class="choice-pts">{{ item.pts }} PP</span>
                    <span v-else-if="item.ranks" class="choice-pts">Rank {{ item.ranks }}</span>
                  </div>
                  <p v-if="item.desc" class="choice-desc">{{ item.desc }}</p>
                </div>
              </div>
            </div>

            <!-- 2. Extras Applied with Descriptions -->
            <div v-if="getActiveEffect(pow).extras?.length > 0" class="dossier-block extras-block">
              <div class="dossier-block-head extra-head">
                <i class="ri-add-circle-line"></i>
                <span>Applied Extras ({{ getActiveEffect(pow).extras.length }})</span>
              </div>
              <div class="dossier-mods-list">
                <div
                  v-for="(extra, eIdx) in getActiveEffect(pow).extras"
                  :key="'de_' + eIdx"
                  class="dossier-mod-card extra-mod"
                >
                  <div class="dossier-mod-top">
                    <strong class="dossier-mod-name">
                      {{ extra.name }}
                      <span v-if="extra.customText" class="dossier-mod-custom-text">: {{ extra.customText }}</span>
                    </strong>
                    <span class="dossier-cost-tag extra">
                      {{ extra.cost >= 0 ? `+${extra.cost}` : extra.cost }} {{ extra.type === 'per_rank' ? 'PP/R' : 'Flat' }}
                    </span>
                    <span v-if="(extra.ranks || 1) > 1" class="dossier-rank-badge">Rank {{ extra.ranks }}</span>
                    <button
                      type="button"
                      class="btn-mod-vtt extra"
                      title="Broadcast Extra to Roll20"
                      @click.stop="broadcastExtra(pow, extra)"
                    >
                      <i class="ri-broadcast-line"></i>
                      <span>Roll20</span>
                    </button>
                  </div>
                  <p class="dossier-mod-desc">{{ extra.desc || getModifierInfo(extra.name, false).desc }}</p>
                </div>
              </div>
            </div>

            <!-- 3. Flaws Applied with Descriptions -->
            <div v-if="getActiveEffect(pow).flaws?.length > 0" class="dossier-block flaws-block">
              <div class="dossier-block-head flaw-head">
                <i class="ri-indeterminate-circle-line"></i>
                <span>Applied Flaws ({{ getActiveEffect(pow).flaws.length }})</span>
              </div>
              <div class="dossier-mods-list">
                <div
                  v-for="(flaw, fIdx) in getActiveEffect(pow).flaws"
                  :key="'df_' + fIdx"
                  class="dossier-mod-card flaw-mod"
                >
                  <div class="dossier-mod-top">
                    <strong class="dossier-mod-name">
                      {{ flaw.name }}
                      <span v-if="flaw.customText" class="dossier-mod-custom-text">: {{ flaw.customText }}</span>
                    </strong>
                    <span class="dossier-cost-tag flaw">
                      {{ flaw.cost }} {{ flaw.type === 'per_rank' ? 'PP/R' : 'Flat' }}
                    </span>
                    <span v-if="(flaw.ranks || 1) > 1" class="dossier-rank-badge">Rank {{ flaw.ranks }}</span>
                    <button
                      type="button"
                      class="btn-mod-vtt flaw"
                      title="Broadcast Flaw to Roll20"
                      @click.stop="broadcastFlaw(pow, flaw)"
                    >
                      <i class="ri-broadcast-line"></i>
                      <span>Roll20</span>
                    </button>
                  </div>
                  <p class="dossier-mod-desc">{{ flaw.desc || getModifierInfo(flaw.name, true).desc }}</p>
                </div>
              </div>
            </div>

            <!-- 4. Linked Effects (Simultaneous Powers) -->
            <div v-if="getActiveLinkedEffects(pow).length > 0" class="dossier-block linked-block">
              <div class="dossier-block-head linked-head">
                <div class="dossier-head-left">
                  <i class="ri-links-line"></i>
                  <span>Simultaneous Linked Effects ({{ getActiveLinkedEffects(pow).length }})</span>
                </div>
                <span class="linked-suite-hint">Active together on the exact same action</span>
              </div>
              <div class="linked-effects-roster">
                <div
                  v-for="(linked, lIdx) in getActiveLinkedEffects(pow)"
                  :key="'dl_' + lIdx"
                  class="linked-full-dossier-card"
                >
                  <!-- 1. Master Header Card -->
                  <div class="linked-card-master-header">
                    <div class="linked-master-left">
                      <div class="linked-index-badge">
                        <i class="ri-links-line"></i>
                        <span>#{{ lIdx + 1 }}</span>
                      </div>
                      <div class="linked-title-group">
                        <div class="linked-title-row">
                          <h5 class="linked-heading">{{ getLinkedDisplayName(linked) }}</h5>
                          <span class="linked-effect-chip">
                            <strong class="linked-effect-name">{{ linked.baseEffect }}</strong>
                            <span class="linked-effect-rank">Rank {{ linked.ranks }}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div class="linked-master-actions">
                      <span v-if="calculateDC(linked)" class="linked-dc-tag">
                        {{ calculateDC(linked) }}
                      </span>
                      <button
                        type="button"
                        class="btn-linked-broadcast"
                        title="Broadcast Linked Effect to Roll20"
                        @click.stop="broadcastEffect(pow, linked, true)"
                      >
                        <i class="ri-broadcast-line"></i>
                        <span>Roll20</span>
                      </button>
                    </div>
                  </div>

                  <!-- 2. Specs Matrix Grid (Placed First for instant battle reference) -->
                  <div class="dossier-specs-grid linked-specs-grid">
                    <div class="spec-item">
                      <span class="spec-label"><i class="ri-flashlight-line"></i> Action</span>
                      <span class="spec-value">{{ linked.action || 'Standard' }}</span>
                    </div>
                    <div class="spec-item">
                      <span class="spec-label"><i class="ri-focus-line"></i> Range</span>
                      <span class="spec-value">{{ formatRange(linked) }}</span>
                    </div>
                    <div class="spec-item">
                      <span class="spec-label"><i class="ri-time-line"></i> Duration</span>
                      <span class="spec-value">{{ linked.duration || 'Instant' }}</span>
                    </div>
                    <div v-if="hasResistanceCheck(linked)" class="spec-item">
                      <span class="spec-label"><i class="ri-shield-check-line"></i> Resistance Check</span>
                      <span class="spec-value highlight">{{ calculateDC(linked) || (linked.resistance ? `vs ${linked.resistance}` : '') }}</span>
                    </div>
                  </div>

                  <!-- 3. Configured Choices / Selections Block -->
                  <div v-if="getEffectConfigDetails(linked)" class="linked-config-block">
                    <div class="linked-config-head">
                      <div class="dossier-head-left">
                        <i class="ri-checkbox-circle-fill"></i>
                        <span>{{ getEffectConfigDetails(linked).title }}</span>
                      </div>
                      <span class="dossier-config-badge">{{ getEffectConfigDetails(linked).badge }}</span>
                    </div>
                    <div class="config-choices-grid">
                      <div
                        v-for="item in getEffectConfigDetails(linked).items"
                        :key="item.name"
                        class="config-choice-card linked-choice-card"
                      >
                        <div class="config-choice-top">
                          <i :class="item.icon || 'ri-focus-3-line'" class="choice-icon"></i>
                          <strong class="choice-name">{{ item.name }}</strong>
                          <span v-if="item.pts" class="choice-pts">{{ item.pts }} PP</span>
                          <span v-else-if="item.ranks" class="choice-pts">Rank {{ item.ranks }}</span>
                        </div>
                        <p v-if="item.desc" class="choice-desc">{{ item.desc }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- 4. Official Rules Reference in Callout Box -->
                  <div class="rulebook-callout-box linked">
                    <span class="rulebook-caption">
                      <i class="ri-book-open-line"></i> Official Rulebook Mechanics:
                    </span>
                    <p class="dossier-desc-text linked-rules-text">
                      {{ getEffectDesc(linked.baseEffect) }}
                    </p>
                  </div>

                  <!-- 5. Applied Modifiers Section with Rules Description -->
                  <div
                    v-if="(linked.extras?.length || 0) + (linked.flaws?.length || 0) > 0"
                    class="linked-mods-details-block"
                  >
                    <div class="sub-dossier-label linked-mods-heading">
                      <i class="ri-shield-star-line"></i>
                      <span>Active Modifiers ({{ (linked.extras?.length || 0) + (linked.flaws?.length || 0) }})</span>
                    </div>
                    <div class="dossier-mods-grid sub-mods-grid">
                      <div
                        v-for="extra in (linked.extras || [])"
                        :key="'plnk_extra_' + extra.name"
                        class="dossier-mod-card extra-mod"
                      >
                        <div class="dossier-mod-top">
                          <strong class="dossier-mod-name">
                            {{ extra.name }}
                            <span v-if="extra.customText" class="dossier-mod-custom-text">: {{ extra.customText }}</span>
                          </strong>
                          <span class="dossier-cost-tag extra">
                            +{{ extra.cost }} {{ extra.type === 'per_rank' ? 'PP/R' : 'Flat' }}
                          </span>
                          <span v-if="(extra.ranks || 1) > 1" class="dossier-rank-badge">Rank {{ extra.ranks }}</span>
                          <button
                            type="button"
                            class="btn-mod-vtt extra"
                            title="Broadcast Extra to Roll20"
                            @click.stop="broadcastExtra({ name: `${pow.name} - ${getLinkedDisplayName(linked)}` }, extra, linked.baseEffect)"
                          >
                            <i class="ri-broadcast-line"></i>
                            <span>Roll20</span>
                          </button>
                        </div>
                        <p class="dossier-mod-desc">{{ extra.desc || getModifierInfo(extra.name, false).desc }}</p>
                      </div>

                      <div
                        v-for="flaw in (linked.flaws || [])"
                        :key="'plnk_flaw_' + flaw.name"
                        class="dossier-mod-card flaw-mod"
                      >
                        <div class="dossier-mod-top">
                          <strong class="dossier-mod-name">
                            {{ flaw.name }}
                            <span v-if="flaw.customText" class="dossier-mod-custom-text">: {{ flaw.customText }}</span>
                          </strong>
                          <span class="dossier-cost-tag flaw">
                            {{ flaw.cost }} {{ flaw.type === 'per_rank' ? 'PP/R' : 'Flat' }}
                          </span>
                          <span v-if="(flaw.ranks || 1) > 1" class="dossier-rank-badge">Rank {{ flaw.ranks }}</span>
                          <button
                            type="button"
                            class="btn-mod-vtt flaw"
                            title="Broadcast Flaw to Roll20"
                            @click.stop="broadcastFlaw({ name: `${pow.name} - ${getLinkedDisplayName(linked)}` }, flaw, linked.baseEffect)"
                          >
                            <i class="ri-broadcast-line"></i>
                            <span>Roll20</span>
                          </button>
                        </div>
                        <p class="dossier-mod-desc">{{ flaw.desc || getModifierInfo(flaw.name, true).desc }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Compound Power Detailed Breakdown -->
          <div v-else-if="pow.type === 'compound'" class="drawer-content-flow compound-drawer-flow">
            <div
              v-if="(pow.sharedModifiers || []).length > 0"
              class="sub-dossier-block compound-shared-block"
            >
              <div class="sub-dossier-label">
                <i class="ri-shield-star-line"></i>
                <span>Shared Suite Modifiers ({{ pow.sharedModifiers.length }})</span>
              </div>
              <div class="dossier-mods-grid sub-mods-grid">
                <div
                  v-for="mod in pow.sharedModifiers"
                  :key="'c_shared_' + mod.name"
                  class="dossier-mod-card"
                  :class="mod.type === 'flaw' || (Number(mod.cost) < 0) ? 'flaw-mod' : 'extra-mod'"
                >
                  <div class="dossier-mod-top">
                    <strong class="dossier-mod-name">
                      {{ mod.name }}
                      <span v-if="mod.customText" class="dossier-mod-custom-text">: {{ mod.customText }}</span>
                    </strong>
                    <span class="dossier-cost-tag" :class="mod.type === 'flaw' || (Number(mod.cost) < 0) ? 'flaw' : 'extra'">
                      {{ mod.cost >= 0 ? `+${mod.cost}` : mod.cost }} {{ mod.type === 'flat' ? 'Flat' : 'PP/R' }}
                    </span>
                    <button
                      type="button"
                      class="btn-mod-vtt"
                      :class="mod.type === 'flaw' || (Number(mod.cost) < 0) ? 'flaw' : 'extra'"
                      title="Broadcast Shared Modifier to Roll20"
                      @click.stop="mod.type === 'flaw' || (Number(mod.cost) < 0) ? broadcastFlaw(pow, mod) : broadcastExtra(pow, mod)"
                    >
                      <i class="ri-broadcast-line"></i>
                      <span>Roll20</span>
                    </button>
                  </div>
                  <p class="dossier-mod-desc">{{ mod.desc || getModifierInfo(mod.name, mod.type === 'flaw' || (Number(mod.cost) < 0)).desc }}</p>
                </div>
              </div>
            </div>

            <!-- Compound Components Tab Navigation Bar (Visible when > 1 component) -->
            <div v-if="(pow.compoundEffects || []).length > 1" class="device-systems-nav-bar compound-components-nav">
              <div class="systems-tab-scroll">
                <button
                  v-for="(sub, sIdx) in (pow.compoundEffects || [])"
                  :key="sub.id || sIdx"
                  type="button"
                  class="device-tab-item compound-tab-item"
                  :class="{
                    active: getActiveCompoundSubIndex(pow.id || idx) === sIdx,
                    'is-primary-tab': isCompoundSubPrimary(pow, sub, sIdx)
                  }"
                  @click.stop="setActiveCompoundSubIndex(pow.id || idx, sIdx)"
                >
                  <i :class="isCompoundSubPrimary(pow, sub, sIdx) ? 'ri-star-fill' : getEffectIcon(getSubPowerActiveEffect(sub).baseEffect)" class="tab-icon"></i>
                  <span class="tab-label">{{ sub.name || `Component #${sIdx + 1}` }}</span>
                  <span v-if="isCompoundSubPrimary(pow, sub, sIdx)" class="tab-primary-badge">PRIMARY</span>
                  <span class="tab-ranks-pill">{{ getSubPowerActiveEffect(sub).ranks || 1 }}R</span>
                </button>
              </div>
            </div>

            <!-- Single Focused Sub-Effect Details Dossier -->
            <template v-if="(pow.compoundEffects || []).length > 0">
              <template
                v-for="({ sub, idx: sIdx }) in [getSelectedCompoundSub(pow, pow.id || idx)]"
                :key="'csub_' + sIdx"
              >
                <div
                  v-if="sub"
                  class="dossier-sub-power-card compound-sub-card"
                >
                  <!-- Sub-Effect Master Header -->
                  <div class="sub-card-master-header">
                    <div class="sub-sys-title-block">
                  <div class="sub-sys-title-line">
                    <h4 class="sub-sys-heading">{{ sub.name || `Component #${sIdx + 1}` }}</h4>
                    <span
                      class="sub-effect-chip"
                      :class="{ 'is-primary-effect': isCompoundSubPrimary(pow, sub, sIdx) }"
                    >
                      <strong class="sub-effect-name">{{ getSubPowerActiveEffect(sub).baseEffect }}</strong>
                      <span class="sub-effect-rank">Rank {{ getSubPowerActiveEffect(sub).ranks || 1 }}</span>
                    </span>
                    <span v-if="sub.alternateEffects?.length > 0" class="sub-array-indicator">
                      <i class="ri-shuffle-line"></i> Array ({{ sub.alternateEffects.length + 1 }} Modes)
                    </span>
                  </div>
                </div>
                <div class="sub-sys-actions">
                  <span v-if="calculateDC(getSubPowerActiveEffect(sub))" class="sub-dc-tag-lg">
                    {{ calculateDC(getSubPowerActiveEffect(sub)) }}
                  </span>
                  <button
                    type="button"
                    class="btn-send-vtt-sub"
                    title="Broadcast this Sub-Effect to Roll20"
                    @click.stop="broadcastSubPower(pow, sub, sIdx)"
                  >
                    <i class="ri-broadcast-line"></i>
                    <span>Roll20</span>
                  </button>
                </div>
              </div>

              <!-- Sub-Effect Alternate Modes Switcher (if alternate stunts exist) -->
              <div
                v-if="sub.alternateEffects?.length > 0"
                class="array-glance-switcher sub-array-switcher"
              >
                <span class="glance-label"><i class="ri-shuffle-line"></i> Mode:</span>
                <div class="slot-buttons-group">
                  <button
                    type="button"
                    class="slot-btn"
                    :class="{ active: (sub.activeSlotId || 'main') === 'main' }"
                    @click="heroStore.setActiveCompoundSubSlot(pow.id, sIdx, 'main')"
                  >
                    ★ {{ sub.effect?.name || sub.name || 'Primary' }}
                  </button>
                  <button
                    v-for="alt in sub.alternateEffects"
                    :key="'comp_alt_slot_' + alt.id"
                    type="button"
                    class="slot-btn"
                    :class="{ active: sub.activeSlotId === alt.id }"
                    @click="heroStore.setActiveCompoundSubSlot(pow.id, sIdx, alt.id)"
                  >
                    {{ alt.name }}
                  </button>
                </div>
              </div>

              <!-- Sub Base Effect Rules & Mechanics -->
              <div class="sub-dossier-block sub-rules-block">
                <!-- Combat Specs Matrix Grid -->
                <div class="dossier-specs-grid sub-specs">
                  <div class="spec-item">
                    <span class="spec-label"><i class="ri-flashlight-line"></i> Action</span>
                    <span class="spec-value">{{ getSubPowerActiveEffect(sub).action || 'Standard' }}</span>
                  </div>
                  <div class="spec-item">
                    <span class="spec-label"><i class="ri-focus-line"></i> Range</span>
                    <span class="spec-value">{{ formatRange(getSubPowerActiveEffect(sub)) }}</span>
                  </div>
                  <div class="spec-item">
                    <span class="spec-label"><i class="ri-time-line"></i> Duration</span>
                    <span class="spec-value">{{ getSubPowerActiveEffect(sub).duration || 'Instant' }}</span>
                  </div>
                  <div v-if="hasResistanceCheck(getSubPowerActiveEffect(sub))" class="spec-item">
                    <span class="spec-label"><i class="ri-shield-check-line"></i> Resistance Check</span>
                    <span class="spec-value highlight">
                      {{ calculateDC(getSubPowerActiveEffect(sub)) || (getSubPowerActiveEffect(sub).resistance ? `vs ${getSubPowerActiveEffect(sub).resistance}` : '') }}
                    </span>
                  </div>
                </div>

                <!-- Sub-Effect Modifiers (Extras & Flaws) -->
                <div
                  v-if="(getSubPowerActiveEffect(sub).extras?.length || 0) + (getSubPowerActiveEffect(sub).flaws?.length || 0) > 0"
                  class="linked-mods-container sub-mods-container"
                >
                  <div v-if="getSubPowerActiveEffect(sub).extras?.length > 0" class="linked-mod-row">
                    <span class="mod-row-label extra"><i class="ri-add-circle-line"></i> Extras:</span>
                    <div class="mod-row-tags">
                      <span v-for="e in getSubPowerActiveEffect(sub).extras" :key="e.name" class="glance-mod-tag extra">
                        +{{ e.name }}{{ e.customText ? ` (${e.customText})` : '' }}{{ (e.ranks || 1) > 1 ? ` x${e.ranks}` : '' }}
                      </span>
                    </div>
                  </div>
                  <div v-if="getSubPowerActiveEffect(sub).flaws?.length > 0" class="linked-mod-row">
                    <span class="mod-row-label flaw"><i class="ri-indeterminate-circle-line"></i> Flaws:</span>
                    <div class="mod-row-tags">
                      <span v-for="f in getSubPowerActiveEffect(sub).flaws" :key="f.name" class="glance-mod-tag flaw">
                        -{{ f.name }}{{ f.customText ? ` (${f.customText})` : '' }}{{ (f.ranks || 1) > 1 ? ` x${f.ranks}` : '' }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Official Rulebook Callout Reference -->
                <div class="rulebook-callout-box">
                  <span class="rulebook-caption">
                    <i class="ri-book-open-line"></i> Official Rulebook Mechanics:
                  </span>
                  <p class="dossier-desc-text sub">
                    {{ getEffectDesc(getSubPowerActiveEffect(sub).baseEffect) }}
                  </p>
                </div>

                <!-- Sub-power Extras & Flaws Detailed Roster with Rules Description -->
                <div
                  v-if="(getSubPowerActiveEffect(sub).extras?.length || 0) + (getSubPowerActiveEffect(sub).flaws?.length || 0) > 0"
                  class="sub-dossier-block sub-mods-block"
                >
                  <div class="sub-dossier-label">
                    <i class="ri-shield-star-line"></i>
                    <span>Active Modifiers ({{ (getSubPowerActiveEffect(sub).extras?.length || 0) + (getSubPowerActiveEffect(sub).flaws?.length || 0) }})</span>
                  </div>
                  <div class="dossier-mods-grid sub-mods-grid">
                    <div
                      v-for="extra in (getSubPowerActiveEffect(sub).extras || [])"
                      :key="'csub_extra_' + extra.name"
                      class="dossier-mod-card extra-mod"
                    >
                      <div class="dossier-mod-top">
                        <strong class="dossier-mod-name">
                          {{ extra.name }}
                          <span v-if="extra.customText" class="dossier-mod-custom-text">: {{ extra.customText }}</span>
                        </strong>
                        <span class="dossier-cost-tag extra">
                          +{{ extra.cost }} {{ extra.type === 'per_rank' ? 'PP/R' : 'Flat' }}
                        </span>
                        <span v-if="(extra.ranks || 1) > 1" class="dossier-rank-badge">Rank {{ extra.ranks }}</span>
                        <button
                          type="button"
                          class="btn-mod-vtt extra"
                          title="Broadcast Extra to Roll20"
                          @click.stop="broadcastExtra({ name: `${pow.name} - ${sub.name || 'Component'}` }, extra, getSubPowerActiveEffect(sub).baseEffect)"
                        >
                          <i class="ri-broadcast-line"></i>
                          <span>Roll20</span>
                        </button>
                      </div>
                      <p class="dossier-mod-desc">{{ extra.desc || getModifierInfo(extra.name, false).desc }}</p>
                    </div>

                    <div
                      v-for="flaw in (getSubPowerActiveEffect(sub).flaws || [])"
                      :key="'csub_flaw_' + flaw.name"
                      class="dossier-mod-card flaw-mod"
                    >
                      <div class="dossier-mod-top">
                        <strong class="dossier-mod-name">
                          {{ flaw.name }}
                          <span v-if="flaw.customText" class="dossier-mod-custom-text">: {{ flaw.customText }}</span>
                        </strong>
                        <span class="dossier-cost-tag flaw">
                          {{ flaw.cost }} {{ flaw.type === 'per_rank' ? 'PP/R' : 'Flat' }}
                        </span>
                        <span v-if="(flaw.ranks || 1) > 1" class="dossier-rank-badge">Rank {{ flaw.ranks }}</span>
                        <button
                          type="button"
                          class="btn-mod-vtt flaw"
                          title="Broadcast Flaw to Roll20"
                          @click.stop="broadcastFlaw({ name: `${pow.name} - ${sub.name || 'Component'}` }, flaw, getSubPowerActiveEffect(sub).baseEffect)"
                        >
                          <i class="ri-broadcast-line"></i>
                          <span>Roll20</span>
                        </button>
                      </div>
                      <p class="dossier-mod-desc">{{ flaw.desc || getModifierInfo(flaw.name, true).desc }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Sub-Effect Configured Choices Block (e.g. Senses, Affliction, Movement, Immunity) -->
              <div v-if="getEffectConfigDetails(getSubPowerActiveEffect(sub))" class="sub-dossier-block config-choices-block sub">
                <div class="sub-dossier-label config-head">
                  <div class="dossier-head-left">
                    <i class="ri-checkbox-circle-fill"></i>
                    <span>{{ getEffectConfigDetails(getSubPowerActiveEffect(sub)).title }}</span>
                  </div>
                  <span class="dossier-config-badge sub">{{ getEffectConfigDetails(getSubPowerActiveEffect(sub)).badge }}</span>
                </div>
                <div class="config-choices-grid">
                  <div
                    v-for="item in getEffectConfigDetails(getSubPowerActiveEffect(sub)).items"
                    :key="item.name"
                    class="config-choice-card"
                  >
                    <div class="config-choice-top">
                      <i :class="item.icon || 'ri-checkbox-circle-line'" class="choice-icon"></i>
                      <strong class="choice-name">{{ item.name }}</strong>
                      <span v-if="item.pts" class="choice-pts">{{ item.pts }} PP</span>
                      <span v-else-if="item.ranks" class="choice-pts">Rank {{ item.ranks }}</span>
                    </div>
                    <p v-if="item.desc" class="choice-desc">{{ item.desc }}</p>
                  </div>
                </div>
              </div>

              <!-- Simultaneous Linked Effects Pod (if this compound sub-effect has linked effects) -->
              <div v-if="getSubPowerActiveLinkedEffects(sub).length > 0" class="sub-dossier-block sub-linked-block">
                <div class="sub-dossier-label linked-accent">
                  <div class="dossier-head-left">
                    <i class="ri-links-line"></i>
                    <span>Simultaneous Linked Effects ({{ getSubPowerActiveLinkedEffects(sub).length }})</span>
                  </div>
                  <span class="linked-suite-hint">Active together on the exact same action</span>
                </div>
                <div class="linked-effects-roster">
                  <div
                    v-for="(linked, lIdx) in getSubPowerActiveLinkedEffects(sub)"
                    :key="'csub_lnk_' + lIdx"
                    class="linked-full-dossier-card"
                  >
                    <div class="linked-card-master-header">
                      <div class="linked-master-left">
                        <div class="linked-index-badge">
                          <i class="ri-links-line"></i>
                          <span>#{{ lIdx + 1 }}</span>
                        </div>
                        <div class="linked-title-group">
                          <div class="linked-title-row">
                            <h5 class="linked-heading">{{ getLinkedDisplayName(linked) }}</h5>
                            <span class="linked-effect-chip">
                              <strong class="linked-effect-name">{{ linked.baseEffect }}</strong>
                              <span class="linked-effect-rank">Rank {{ linked.ranks }}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div class="linked-master-actions">
                        <span v-if="calculateDC(linked)" class="linked-dc-tag">
                          {{ calculateDC(linked) }}
                        </span>
                        <button
                          type="button"
                          class="btn-linked-broadcast"
                          title="Broadcast Linked Effect to Roll20"
                          @click.stop="broadcastEffect({ name: `${pow.name} - ${sub.name}` }, linked, true)"
                        >
                          <i class="ri-broadcast-line"></i>
                          <span>Roll20</span>
                        </button>
                      </div>
                    </div>

                    <!-- Specs Matrix -->
                    <div class="dossier-specs-grid linked-specs-grid">
                      <div class="spec-item">
                        <span class="spec-label"><i class="ri-flashlight-line"></i> Action</span>
                        <span class="spec-value">{{ linked.action || 'Standard' }}</span>
                      </div>
                      <div class="spec-item">
                        <span class="spec-label"><i class="ri-focus-line"></i> Range</span>
                        <span class="spec-value">{{ formatRange(linked) }}</span>
                      </div>
                      <div class="spec-item">
                        <span class="spec-label"><i class="ri-time-line"></i> Duration</span>
                        <span class="spec-value">{{ linked.duration || 'Instant' }}</span>
                      </div>
                      <div v-if="hasResistanceCheck(linked)" class="spec-item">
                        <span class="spec-label"><i class="ri-shield-check-line"></i> Resistance Check</span>
                        <span class="spec-value highlight">{{ calculateDC(linked) || (linked.resistance ? `vs ${linked.resistance}` : '') }}</span>
                      </div>
                    </div>

                    <!-- Rulebook Mechanics for Linked Effect -->
                    <div class="rulebook-callout-box linked">
                      <span class="rulebook-caption">
                        <i class="ri-book-open-line"></i> Official Rulebook Mechanics:
                      </span>
                      <p class="dossier-desc-text linked-rules-text">
                        {{ getEffectDesc(linked.baseEffect) }}
                      </p>
                    </div>

                    <!-- Modifiers for Linked Effect with Rules Description -->
                    <div
                      v-if="(linked.extras?.length || 0) + (linked.flaws?.length || 0) > 0"
                      class="linked-mods-details-block"
                    >
                      <div class="sub-dossier-label linked-mods-heading">
                        <i class="ri-shield-star-line"></i>
                        <span>Active Modifiers ({{ (linked.extras?.length || 0) + (linked.flaws?.length || 0) }})</span>
                      </div>
                      <div class="dossier-mods-grid sub-mods-grid">
                        <div
                          v-for="extra in (linked.extras || [])"
                          :key="'clnk_extra_' + extra.name"
                          class="dossier-mod-card extra-mod"
                        >
                          <div class="dossier-mod-top">
                            <strong class="dossier-mod-name">
                              {{ extra.name }}
                              <span v-if="extra.customText" class="dossier-mod-custom-text">: {{ extra.customText }}</span>
                            </strong>
                            <span class="dossier-cost-tag extra">
                              +{{ extra.cost }} {{ extra.type === 'per_rank' ? 'PP/R' : 'Flat' }}
                            </span>
                            <span v-if="(extra.ranks || 1) > 1" class="dossier-rank-badge">Rank {{ extra.ranks }}</span>
                            <button
                              type="button"
                              class="btn-mod-vtt extra"
                              title="Broadcast Extra to Roll20"
                              @click.stop="broadcastExtra({ name: `${pow.name} - ${sub.name || 'Component'} (${getLinkedDisplayName(linked)})` }, extra, linked.baseEffect)"
                            >
                              <i class="ri-broadcast-line"></i>
                              <span>Roll20</span>
                            </button>
                          </div>
                          <p class="dossier-mod-desc">{{ extra.desc || getModifierInfo(extra.name, false).desc }}</p>
                        </div>

                        <div
                          v-for="flaw in (linked.flaws || [])"
                          :key="'clnk_flaw_' + flaw.name"
                          class="dossier-mod-card flaw-mod"
                        >
                          <div class="dossier-mod-top">
                            <strong class="dossier-mod-name">
                              {{ flaw.name }}
                              <span v-if="flaw.customText" class="dossier-mod-custom-text">: {{ flaw.customText }}</span>
                            </strong>
                            <span class="dossier-cost-tag flaw">
                              {{ flaw.cost }} {{ flaw.type === 'per_rank' ? 'PP/R' : 'Flat' }}
                            </span>
                            <span v-if="(flaw.ranks || 1) > 1" class="dossier-rank-badge">Rank {{ flaw.ranks }}</span>
                            <button
                              type="button"
                              class="btn-mod-vtt flaw"
                              title="Broadcast Flaw to Roll20"
                              @click.stop="broadcastFlaw({ name: `${pow.name} - ${sub.name || 'Component'} (${getLinkedDisplayName(linked)})` }, flaw, linked.baseEffect)"
                            >
                              <i class="ri-broadcast-line"></i>
                              <span>Roll20</span>
                            </button>
                          </div>
                          <p class="dossier-mod-desc">{{ flaw.desc || getModifierInfo(flaw.name, true).desc }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </template>
      </div>

          <!-- Device Detailed Breakdown -->
          <div v-else class="drawer-content-flow device-flow">
            <!-- Systems Tab Switcher Bar (Visible when Expanded to Navigate Dossiers) -->
            <div v-if="(pow.devicePowers || []).length > 1" class="device-systems-nav-bar expanded-systems-nav">
              <div class="systems-tab-scroll">
                <button
                  v-for="(sub, sIdx) in (pow.devicePowers || [])"
                  :key="sub.id || sIdx"
                  type="button"
                  class="device-tab-item"
                  :class="{
                    active: getActiveDeviceSubIndex(pow.id || idx) === sIdx,
                    'is-sub-offline': sub.active === false || pow.active === false
                  }"
                  @click="setActiveDeviceSubIndex(pow.id || idx, sIdx)"
                >
                  <span
                    class="tab-status-dot"
                    :class="{ online: sub.active !== false && pow.active !== false }"
                    :title="sub.active !== false && pow.active !== false ? 'Online' : 'Offline'"
                  ></span>
                  <i :class="getEffectIcon(getSubPowerActiveEffect(sub).baseEffect)" class="tab-icon"></i>
                  <span class="tab-label">{{ sub.name || `System ${sIdx + 1}` }}</span>
                  <span class="tab-ranks-pill">{{ getSubPowerActiveEffect(sub).ranks }}R</span>
                </button>
              </div>
            </div>

            <!-- Single Focused Sub-System Details Dossier -->
            <template v-if="(pow.devicePowers || []).length > 0">
              <div
                v-for="({ sub, idx: sIdx }) in [getSelectedDeviceSub(pow, pow.id || idx)]"
                :key="'dsub_' + sIdx"
                class="dossier-sub-power-card"
              >
                <!-- Sub-System Master Header -->
                <div class="sub-card-master-header">
                  <button
                    type="button"
                    class="sub-power-toggle-btn master-toggle"
                    :class="{
                      'is-active': sub.active !== false && pow.active !== false,
                      'is-off': sub.active === false || pow.active === false
                    }"
                    :disabled="pow.active === false"
                    :title="pow.active === false ? 'Parent device is Offline' : (sub.active !== false ? 'System is Active (Click to Deactivate)' : 'System is Offline (Click to Activate)')"
                    @click.stop="handleToggleSubPower(pow, sIdx, sub)"
                  >
                    <i :class="sub.active !== false && pow.active !== false ? 'ri-checkbox-circle-fill' : 'ri-close-circle-line'"></i>
                    <span class="sub-toggle-text">{{ sub.active !== false && pow.active !== false ? 'ONLINE' : 'OFFLINE' }}</span>
                  </button>
                  <div class="sub-sys-title-block">
                    <div class="sub-sys-title-line">
                      <h4 class="sub-sys-heading">{{ sub.name }}</h4>
                      <span class="sub-effect-chip">
                        <strong class="sub-effect-name">{{ getSubPowerActiveEffect(sub).baseEffect }}</strong>
                        <span class="sub-effect-rank">Rank {{ getSubPowerActiveEffect(sub).ranks }}</span>
                      </span>
                      <span v-if="sub.alternateEffects?.length > 0" class="sub-array-indicator">
                        <i class="ri-shuffle-line"></i> Array ({{ sub.alternateEffects.length + 1 }} Modes)
                      </span>
                    </div>
                  </div>
                  <div class="sub-sys-actions">
                    <span v-if="calculateDC(getSubPowerActiveEffect(sub))" class="sub-dc-tag-lg">
                      {{ calculateDC(getSubPowerActiveEffect(sub)) }}
                    </span>
                    <button
                      type="button"
                      class="btn-send-vtt-sub"
                      title="Broadcast this Sub-System to Roll20"
                      @click.stop="broadcastSubPower(pow, sub, sIdx)"
                    >
                      <i class="ri-broadcast-line"></i>
                      <span>Roll20</span>
                    </button>
                  </div>
                </div>

                <!-- Sub-Power Array Mode Switcher (Horizontal Menu like regular array powers) -->
                <div
                  v-if="sub.alternateEffects?.length > 0"
                  class="array-glance-switcher sub-array-switcher"
                >
                  <span class="glance-label"><i class="ri-shuffle-line"></i> Mode:</span>
                  <div class="slot-buttons-group">
                    <button
                      type="button"
                      class="slot-btn"
                      :class="{ active: (sub.activeSlotId || 'main') === 'main' }"
                      @click="heroStore.setActiveDeviceSubSlot(pow.id, sIdx, 'main')"
                    >
                      ★ {{ sub.effect?.name || 'Primary' }}
                    </button>
                    <button
                      v-for="alt in sub.alternateEffects"
                      :key="'sub_alt_slot_' + alt.id"
                      type="button"
                      class="slot-btn"
                      :class="{ active: sub.activeSlotId === alt.id }"
                      @click="heroStore.setActiveDeviceSubSlot(pow.id, sIdx, alt.id)"
                    >
                      {{ alt.name }}
                    </button>
                  </div>
                </div>

                <!-- Sub Base Effect Rules & Mechanics -->
                <div class="sub-dossier-block sub-rules-block">
                  <!-- Combat Specs Matrix Grid (Placed First for instant battle reference) -->
                  <div class="dossier-specs-grid sub-specs">
                    <div class="spec-item">
                      <span class="spec-label"><i class="ri-flashlight-line"></i> Action</span>
                      <span class="spec-value">{{ getSubPowerActiveEffect(sub).action || 'Standard' }}</span>
                    </div>
                    <div class="spec-item">
                      <span class="spec-label"><i class="ri-focus-line"></i> Range</span>
                      <span class="spec-value">{{ formatRange(getSubPowerActiveEffect(sub)) }}</span>
                    </div>
                    <div class="spec-item">
                      <span class="spec-label"><i class="ri-time-line"></i> Duration</span>
                      <span class="spec-value">{{ getSubPowerActiveEffect(sub).duration || 'Instant' }}</span>
                    </div>
                    <div v-if="hasResistanceCheck(getSubPowerActiveEffect(sub))" class="spec-item">
                      <span class="spec-label"><i class="ri-shield-check-line"></i> Resistance Check</span>
                      <span class="spec-value highlight">{{ calculateDC(getSubPowerActiveEffect(sub)) || (getSubPowerActiveEffect(sub).resistance ? `vs ${getSubPowerActiveEffect(sub).resistance}` : '') }}</span>
                    </div>
                  </div>

                  <!-- Sub-Power Extras & Flaws Modifiers (e.g. Impervious) -->
                  <div
                    v-if="(getSubPowerActiveEffect(sub).extras?.length || 0) + (getSubPowerActiveEffect(sub).flaws?.length || 0) > 0"
                    class="linked-mods-container sub-mods-container"
                  >
                    <div v-if="getSubPowerActiveEffect(sub).extras?.length > 0" class="linked-mod-row">
                      <span class="mod-row-label extra"><i class="ri-add-circle-line"></i> Extras:</span>
                      <div class="mod-row-tags">
                        <span v-for="e in getSubPowerActiveEffect(sub).extras" :key="e.name" class="glance-mod-tag extra">
                          +{{ e.name }}{{ e.customText ? ` (${e.customText})` : '' }}{{ (e.ranks || 1) > 1 ? ` x${e.ranks}` : '' }}
                        </span>
                      </div>
                    </div>
                    <div v-if="getSubPowerActiveEffect(sub).flaws?.length > 0" class="linked-mod-row">
                      <span class="mod-row-label flaw"><i class="ri-indeterminate-circle-line"></i> Flaws:</span>
                      <div class="mod-row-tags">
                        <span v-for="f in getSubPowerActiveEffect(sub).flaws" :key="f.name" class="glance-mod-tag flaw">
                          -{{ f.name }}{{ f.customText ? ` (${f.customText})` : '' }}{{ (f.ranks || 1) > 1 ? ` x${f.ranks}` : '' }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Official Rulebook Callout Reference -->
                  <div class="rulebook-callout-box">
                    <span class="rulebook-caption">
                      <i class="ri-book-open-line"></i> Official Rulebook Mechanics:
                    </span>
                    <p class="dossier-desc-text sub">{{ getEffectDesc(getSubPowerActiveEffect(sub).baseEffect) }}</p>
                  </div>
                </div>

              <!-- Sub-power Configured Choices Block -->
              <div v-if="getEffectConfigDetails(getSubPowerActiveEffect(sub))" class="sub-dossier-block config-choices-block sub">
                <div class="sub-dossier-label config-head">
                  <div class="dossier-head-left">
                    <i class="ri-checkbox-circle-fill"></i>
                    <span>{{ getEffectConfigDetails(getSubPowerActiveEffect(sub)).title }}</span>
                  </div>
                  <span class="dossier-config-badge sub">{{ getEffectConfigDetails(getSubPowerActiveEffect(sub)).badge }}</span>
                </div>
                <div class="config-choices-grid">
                  <div
                    v-for="item in getEffectConfigDetails(getSubPowerActiveEffect(sub)).items"
                    :key="item.name"
                    class="config-choice-card"
                  >
                    <div class="config-choice-top">
                      <i :class="item.icon || 'ri-checkbox-circle-line'" class="choice-icon"></i>
                      <strong class="choice-name">{{ item.name }}</strong>
                      <span v-if="item.pts" class="choice-pts">{{ item.pts }} PP</span>
                      <span v-else-if="item.ranks" class="choice-pts">Rank {{ item.ranks }}</span>
                    </div>
                    <p v-if="item.desc" class="choice-desc">{{ item.desc }}</p>
                  </div>
                </div>
              </div>

              <!-- Simultaneous Linked Effects Pod (if sub-power has linked effects) -->
              <div v-if="getSubPowerActiveLinkedEffects(sub).length > 0" class="sub-dossier-block sub-linked-block">
                <div class="sub-dossier-label linked-accent">
                  <div class="dossier-head-left">
                    <i class="ri-links-line"></i>
                    <span>Simultaneous Linked Sub-Effects ({{ getSubPowerActiveLinkedEffects(sub).length }})</span>
                  </div>
                  <span class="linked-suite-hint">Active together on the exact same action</span>
                </div>
                <div class="linked-effects-roster">
                  <div
                    v-for="(linked, lIdx) in getSubPowerActiveLinkedEffects(sub)"
                    :key="'sub_dl_' + lIdx"
                    class="linked-full-dossier-card"
                  >
                    <!-- 1. Master Header Card -->
                    <div class="linked-card-master-header">
                      <div class="linked-master-left">
                        <div class="linked-index-badge">
                          <i class="ri-links-line"></i>
                          <span>#{{ lIdx + 1 }}</span>
                        </div>
                        <div class="linked-title-group">
                          <div class="linked-title-row">
                            <h5 class="linked-heading">{{ getLinkedDisplayName(linked) }}</h5>
                            <span class="linked-effect-chip">
                              <strong class="linked-effect-name">{{ linked.baseEffect }}</strong>
                              <span class="linked-effect-rank">Rank {{ linked.ranks }}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div class="linked-master-actions">
                        <span v-if="calculateDC(linked)" class="linked-dc-tag">
                          {{ calculateDC(linked) }}
                        </span>
                        <button
                          type="button"
                          class="btn-linked-broadcast"
                          title="Broadcast Linked Effect to Roll20"
                          @click.stop="broadcastEffect({ name: `${pow.name} - ${sub.name}` }, linked, true)"
                        >
                          <i class="ri-broadcast-line"></i>
                          <span>Roll20</span>
                        </button>
                      </div>
                    </div>

                    <!-- 2. Specs Matrix Grid (Placed First for instant battle reference) -->
                    <div class="dossier-specs-grid linked-specs-grid">
                      <div class="spec-item">
                        <span class="spec-label"><i class="ri-flashlight-line"></i> Action</span>
                        <span class="spec-value">{{ linked.action || 'Standard' }}</span>
                      </div>
                      <div class="spec-item">
                        <span class="spec-label"><i class="ri-focus-line"></i> Range</span>
                        <span class="spec-value">{{ formatRange(linked) }}</span>
                      </div>
                      <div class="spec-item">
                        <span class="spec-label"><i class="ri-time-line"></i> Duration</span>
                        <span class="spec-value">{{ linked.duration || 'Instant' }}</span>
                      </div>
                      <div v-if="hasResistanceCheck(linked)" class="spec-item">
                        <span class="spec-label"><i class="ri-shield-check-line"></i> Resistance Check</span>
                        <span class="spec-value highlight">{{ calculateDC(linked) || (linked.resistance ? `vs ${linked.resistance}` : '') }}</span>
                      </div>
                    </div>

                    <!-- 3. Configured Choices / Selections Block -->
                    <div v-if="getEffectConfigDetails(linked)" class="linked-config-block">
                      <div class="linked-config-head">
                        <div class="dossier-head-left">
                          <i class="ri-checkbox-circle-fill"></i>
                          <span>{{ getEffectConfigDetails(linked).title }}</span>
                        </div>
                        <span class="dossier-config-badge sub">{{ getEffectConfigDetails(linked).badge }}</span>
                      </div>
                      <div class="config-choices-grid">
                        <div
                          v-for="item in getEffectConfigDetails(linked).items"
                          :key="item.name"
                          class="config-choice-card linked-choice-card"
                        >
                          <div class="config-choice-top">
                            <i :class="item.icon || 'ri-focus-3-line'" class="choice-icon"></i>
                            <strong class="choice-name">{{ item.name }}</strong>
                            <span v-if="item.pts" class="choice-pts">{{ item.pts }} PP</span>
                            <span v-else-if="item.ranks" class="choice-pts">Rank {{ item.ranks }}</span>
                          </div>
                          <p v-if="item.desc" class="choice-desc">{{ item.desc }}</p>
                        </div>
                      </div>
                    </div>

                    <!-- 4. Official Rules Reference in Callout Box -->
                    <div class="rulebook-callout-box linked">
                      <span class="rulebook-caption">
                        <i class="ri-book-open-line"></i> Official Rulebook Mechanics:
                      </span>
                      <p class="dossier-desc-text linked-rules-text">
                        {{ getEffectDesc(linked.baseEffect) }}
                      </p>
                    </div>

                    <!-- 5. Applied Modifiers Section -->
                    <div
                      v-if="(linked.extras?.length || 0) + (linked.flaws?.length || 0) > 0"
                      class="linked-mods-container"
                    >
                      <div v-if="linked.extras?.length > 0" class="linked-mod-row">
                        <span class="mod-row-label extra"><i class="ri-add-circle-line"></i> Extras:</span>
                        <div class="mod-row-tags">
                          <span v-for="e in linked.extras" :key="e.name" class="glance-mod-tag extra">
                            +{{ e.name }}{{ (e.ranks || 1) > 1 ? ` x${e.ranks}` : '' }}
                          </span>
                        </div>
                      </div>
                      <div v-if="linked.flaws?.length > 0" class="linked-mod-row">
                        <span class="mod-row-label flaw"><i class="ri-indeterminate-circle-line"></i> Flaws:</span>
                        <div class="mod-row-tags">
                          <span v-for="f in linked.flaws" :key="f.name" class="glance-mod-tag flaw">
                            -{{ f.name }}{{ (f.ranks || 1) > 1 ? ` x${f.ranks}` : '' }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Sub-power Extras & Flaws Roster -->
              <div
                v-if="(getSubPowerActiveEffect(sub).extras?.length || 0) + (getSubPowerActiveEffect(sub).flaws?.length || 0) > 0"
                class="sub-dossier-block sub-mods-block"
              >
                <div class="sub-dossier-label">
                  <i class="ri-shield-star-line"></i>
                  <span>Active Modifiers ({{ (getSubPowerActiveEffect(sub).extras?.length || 0) + (getSubPowerActiveEffect(sub).flaws?.length || 0) }})</span>
                </div>
                <div class="dossier-mods-grid sub-mods-grid">
                  <div
                    v-for="extra in (getSubPowerActiveEffect(sub).extras || [])"
                    :key="'sub_extra_' + extra.name"
                    class="dossier-mod-card extra-mod"
                  >
                    <div class="dossier-mod-top">
                      <strong class="dossier-mod-name">
                        {{ extra.name }}
                        <span v-if="extra.customText" class="dossier-mod-custom-text">: {{ extra.customText }}</span>
                      </strong>
                      <span class="dossier-cost-tag extra">
                        +{{ extra.cost }} {{ extra.type === 'per_rank' ? 'PP/R' : 'Flat' }}
                      </span>
                      <span v-if="(extra.ranks || 1) > 1" class="dossier-rank-badge">Rank {{ extra.ranks }}</span>
                      <button
                        type="button"
                        class="btn-mod-vtt extra"
                        title="Broadcast Extra to Roll20"
                        @click.stop="broadcastExtra({ name: `${pow.name} - ${sub.name}` }, extra, getSubPowerActiveEffect(sub).baseEffect)"
                      >
                        <i class="ri-broadcast-line"></i>
                        <span>Roll20</span>
                      </button>
                    </div>
                    <p class="dossier-mod-desc">{{ extra.desc || getModifierInfo(extra.name, false).desc }}</p>
                  </div>

                  <div
                    v-for="flaw in (getSubPowerActiveEffect(sub).flaws || [])"
                    :key="'sub_flaw_' + flaw.name"
                    class="dossier-mod-card flaw-mod"
                  >
                    <div class="dossier-mod-top">
                      <strong class="dossier-mod-name">
                        {{ flaw.name }}
                        <span v-if="flaw.customText" class="dossier-mod-custom-text">: {{ flaw.customText }}</span>
                      </strong>
                      <span class="dossier-cost-tag flaw">
                        {{ flaw.cost }} {{ flaw.type === 'per_rank' ? 'PP/R' : 'Flat' }}
                      </span>
                      <span v-if="(flaw.ranks || 1) > 1" class="dossier-rank-badge">Rank {{ flaw.ranks }}</span>
                      <button
                        type="button"
                        class="btn-mod-vtt flaw"
                        title="Broadcast Flaw to Roll20"
                        @click.stop="broadcastFlaw({ name: `${pow.name} - ${sub.name}` }, flaw, getSubPowerActiveEffect(sub).baseEffect)"
                      >
                        <i class="ri-broadcast-line"></i>
                        <span>Roll20</span>
                      </button>
                    </div>
                    <p class="dossier-mod-desc">{{ flaw.desc || getModifierInfo(flaw.name, true).desc }}</p>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useHeroStore } from '../../stores/heroStore.js';
import { usePowerBuilderStore } from '../../stores/powerBuilderStore.js';
import { useUiStore } from '../../stores/uiStore.js';
import { BASE_EFFECTS, EXTRAS, FLAWS, CONFIGURABLE_EFFECTS, calculatePowerTotalCost, hasResistanceCheck } from '../../rules/powerEngine.js';
import { sendFeatureToVTT } from '../../services/vttBridge.js';

const heroStore = useHeroStore();
const builderStore = usePowerBuilderStore();
const uiStore = useUiStore();

function formatModifierList(mods, isFlaw = false) {
  if (!Array.isArray(mods) || mods.length === 0) return '';
  return mods.map(m => {
    const costSign = m.cost > 0 ? `+${m.cost}` : `${m.cost}`;
    const costPart = m.cost !== undefined ? ` (${costSign}${m.type === 'flat' ? ' flat' : '/r'})` : '';
    const rkPart = m.ranks && m.ranks > 1 ? ` x${m.ranks}` : '';
    const textPart = m.customText ? ` [${m.customText}]` : '';
    return `${m.name || 'Modifier'}${textPart}${rkPart}${costPart}`;
  }).join(', ');
}

function getLinkedDisplayName(linked) {
  if (!linked) return 'Linked Effect';
  const name = linked.name ? linked.name.trim() : '';
  const base = linked.baseEffect || 'Effect';

  if (!name || name === 'Unnamed Effect' || name.toLowerCase() === base.toLowerCase()) {
    return `${base} (Linked)`;
  }

  const linkedMatch = /^(.*)\s*\(Linked\)$/i.exec(name);
  if (linkedMatch) {
    const prefix = linkedMatch[1].trim();
    if (prefix.toLowerCase() !== base.toLowerCase() &&
        (prefix.toLowerCase() === 'affliction' || BASE_EFFECTS.some(b => b.name.toLowerCase() === prefix.toLowerCase()))) {
      return `${base} (Linked)`;
    }
    return name;
  }

  // If name matches another base effect name completely (stale non-linked default)
  if (BASE_EFFECTS.some(b => b.name.toLowerCase() === name.toLowerCase()) && name.toLowerCase() !== base.toLowerCase()) {
    return `${base} (Linked)`;
  }

  return name;
}

function getEffectCategory(baseName) {
  if (!baseName) return '';
  const ref = BASE_EFFECTS.find(b => b.name.toLowerCase() === baseName.toLowerCase());
  return ref?.category || '';
}

function formatLinkedEffectsList(list) {
  if (!Array.isArray(list) || list.length === 0) return '';
  return list.map(le => {
    const dcStr = calculateDC(le);
    const name = getLinkedDisplayName(le);
    const cfg = getEffectConfigDetails(le);
    const cfgStr = cfg?.quickText ? ` [${cfg.quickText}]` : '';
    return `${name} (Rank ${le.ranks || 1}${cfgStr}${dcStr ? ', ' + dcStr : ''})`;
  }).join('; ');
}

function getEffectConfigDetails(eff) {
  if (!eff || !eff.baseEffect) return null;
  const cfg = CONFIGURABLE_EFFECTS[eff.baseEffect];
  const c = eff.config || {};
  const base = eff.baseEffect;

  if (base === 'Senses') {
    const faculties = cfg?.faculties || [];
    const selected = Array.isArray(c.selectedFaculties) && c.selectedFaculties.length > 0
      ? c.selectedFaculties
      : (cfg?.defaultFaculties || ['darkvision']);
    
    const items = selected.map(idOrName => {
      const match = faculties.find(f => f.id === idOrName || f.name?.toLowerCase() === String(idOrName).toLowerCase());
      if (match) {
        return {
          id: match.id,
          name: match.name,
          pts: match.pts,
          desc: match.desc,
          category: match.category,
          icon: match.icon || 'ri-eye-line'
        };
      }
      return {
        id: idOrName,
        name: idOrName,
        pts: 1,
        desc: 'Superhuman sensory faculty enhancement.',
        category: 'Sensory',
        icon: 'ri-eye-line'
      };
    });

    return {
      type: 'senses',
      title: 'Configured Sensory Faculties',
      badge: `${items.length} Faculties • ${eff.ranks || 1} Ranks`,
      quickText: items.map(i => i.name).join(', '),
      items
    };
  }

  if (base === 'Enhanced Trait') {
    const cat = c.traitCategory || 'abilities';
    const trait = c.traitName || 'Strength';
    const ranks = eff.ranks || 1;
    const catLabels = {
      abilities: 'Ability Score',
      defenses: 'Defense Trait',
      skills: 'Skill Bonus',
      advantages: 'Combat Advantage'
    };
    const catIcons = {
      abilities: 'ri-bicep-line',
      defenses: 'ri-shield-line',
      skills: 'ri-tools-line',
      advantages: 'ri-award-line'
    };

    return {
      type: 'enhanced_trait',
      title: 'Enhanced Trait Target',
      badge: `${catLabels[cat] || 'Trait'} (+${ranks})`,
      quickText: `${trait} +${ranks}`,
      items: [{
        name: trait,
        ranks: ranks,
        category: catLabels[cat] || cat,
        desc: `Superhumanly enhances ${trait} by +${ranks} rank${ranks > 1 ? 's' : ''}, applying to all associated checks and rolls.`,
        icon: catIcons[cat] || 'ri-magic-line'
      }]
    };
  }

  if (base === 'Movement') {
    const modes = cfg?.modes || [];
    const selected = Array.isArray(c.selectedModes) && c.selectedModes.length > 0
      ? c.selectedModes
      : (cfg?.defaultModes || ['wall_crawling']);

    const items = selected.map(selItem => {
      const modeId = typeof selItem === 'object' && selItem ? selItem.id : selItem;
      const rankNum = typeof selItem === 'object' && selItem ? (selItem.ranks || 1) : 1;
      const match = modes.find(m => m.id === modeId);
      if (match) {
        return {
          id: match.id,
          name: match.name,
          ranks: rankNum,
          desc: match.desc,
          icon: match.icon || 'ri-footprint-line'
        };
      }
      return {
        id: modeId,
        name: modeId,
        ranks: rankNum,
        desc: 'Superhuman movement mode capability.',
        icon: 'ri-footprint-line'
      };
    });

    return {
      type: 'movement',
      title: 'Configured Movement Modes',
      badge: `${items.length} Modes Active`,
      quickText: items.map(i => `${i.name}${i.ranks > 1 ? ` ${i.ranks}` : ''}`).join(', '),
      items
    };
  }

  if (base === 'Immunity') {
    const presets = cfg?.presets || [];
    const selected = Array.isArray(c.selectedPresets) && c.selectedPresets.length > 0
      ? c.selectedPresets
      : (cfg?.defaultPresets || ['life_support']);

    const items = selected.map(id => {
      const match = presets.find(p => p.id === id);
      if (match) {
        return {
          id: match.id,
          name: match.name,
          ranks: match.ranks,
          category: match.category,
          desc: match.desc,
          icon: match.icon || 'ri-shield-check-line'
        };
      }
      return {
        id,
        name: id,
        ranks: 1,
        desc: 'Immunity to specified environmental hazard or attack effect.',
        icon: 'ri-shield-check-line'
      };
    });

    return {
      type: 'immunity',
      title: 'Configured Immunities',
      badge: `${items.length} Immunities • ${eff.ranks || 1} Ranks`,
      quickText: items.map(i => i.name).join(', '),
      items
    };
  }

  if (base === 'Affliction') {
    const limDegree = (eff.flaws || []).find(f => f.name === 'Limited Degree');
    const limRanks = limDegree ? (Number(limDegree.ranks) || 1) : 0;

    const first = Array.isArray(c.firstConditions) && c.firstConditions.length > 0
      ? c.firstConditions.join(' & ')
      : (c.firstDegree || 'Dazed');
    const second = Array.isArray(c.secondConditions) && c.secondConditions.length > 0
      ? c.secondConditions.join(' & ')
      : (c.secondDegree || 'Stunned');
    const third = Array.isArray(c.thirdConditions) && c.thirdConditions.length > 0
      ? c.thirdConditions.join(' & ')
      : (c.thirdDegree || 'Paralyzed');
    const res = c.resistance || eff.resistance || 'Fortitude';

    const isProg = (eff.extras || []).some(e => e.name === 'Progressive');
    const isCum = (eff.extras || []).some(e => e.name === 'Cumulative');
    let modeBadge = '';
    if (isProg) modeBadge = ' • Progressive';
    else if (isCum) modeBadge = ' • Cumulative';

    const items = [
      { name: '1st Degree', desc: `Target suffers: ${first}`, icon: 'ri-error-warning-line' }
    ];
    if (limRanks < 2) {
      items.push({ name: '2nd Degree', desc: `Target suffers: ${second}`, icon: 'ri-alert-line' });
    }
    if (limRanks < 1) {
      items.push({ name: '3rd Degree', desc: `Target suffers: ${third}`, icon: 'ri-skull-line' });
    }

    const quickParts = items.map(i => i.desc.replace('Target suffers: ', ''));

    return {
      type: 'affliction',
      title: 'Conditions & Degrees of Failure',
      badge: `Resisted by ${res}${modeBadge}`,
      quickText: quickParts.join(' / '),
      items
    };
  }

  if (base === 'Illusion') {
    const senses = Array.isArray(c.senses) && c.senses.length > 0 ? c.senses : ['Visual'];
    return {
      type: 'illusion',
      title: 'Sensory Impressions Affected',
      badge: `${senses.length} Senses (${eff.baseCost || senses.length} PP/R)`,
      quickText: senses.join(', '),
      items: senses.map(s => ({
        name: s,
        desc: `Projects holographic sensations affecting ${s} perception.`,
        icon: String(s).toLowerCase().includes('aud') ? 'ri-volume-up-line' : 'ri-eye-line'
      }))
    };
  }

  if (base === 'Weaken') {
    const trait = c.traitName || 'Stamina';
    const res = c.resistance || eff.resistance || 'Fortitude';
    return {
      type: 'weaken',
      title: 'Targeted Trait to Drain',
      badge: `Resisted by ${res}`,
      quickText: `Drains ${trait}`,
      items: [{
        name: `Target: ${trait}`,
        desc: `Target makes a ${res} resistance check vs DC 10 + Weaken rank. Each failure degree drains 1 rank of ${trait}.`,
        icon: 'ri-arrow-down-circle-line'
      }]
    };
  }

  if (base === 'Nullify') {
    const desc = c.descriptor === 'Custom' ? (c.customDescriptor || 'Custom') : (c.descriptor || 'Magic');
    return {
      type: 'nullify',
      title: 'Targeted Descriptor to Counter',
      badge: desc,
      quickText: `Counters: ${desc}`,
      items: [{
        name: desc,
        desc: `Counters and dispels powers with the "${desc}" descriptor.`,
        icon: 'ri-forbid-2-line'
      }]
    };
  }

  if (base === 'Morph') {
    const scopeNames = {
      1: 'Single Appearance (Exact Twin / Alter Ego)',
      2: 'Narrow Group (Single species, gender, or shape)',
      3: 'Broad Group (Any humanoid, animal, or machine)',
      4: 'Any Form (Any person, creature, or object of same mass)'
    };
    const scope = Number(c.scope) || 1;
    return {
      type: 'morph',
      title: 'Morph Scope of Forms',
      badge: `Scope Rank ${scope}`,
      quickText: scopeNames[scope] || `Rank ${scope}`,
      items: [{
        name: scopeNames[scope] || `Scope Rank ${scope}`,
        desc: `Grants +20 bonus to Deception checks to disguise as forms within this scope.`,
        icon: 'ri-user-shared-line'
      }]
    };
  }

  if (base === 'Variable') {
    const theme = c.theme || 'Magic / Sorcery';
    return {
      type: 'variable',
      title: 'Variable Power Theme',
      badge: `Theme: ${theme}`,
      quickText: theme,
      items: [{
        name: theme,
        desc: `Can allocate up to ${Number(eff.ranks || 1) * 5} PP to effects fitting the "${theme}" descriptor.`,
        icon: 'ri-magic-line'
      }]
    };
  }

  return null;
}

function broadcastPower(pow) {
  const cost = getPowerCost(pow);
  const eff = getActiveEffect(pow);
  const dc = calculateDC(eff);
  const range = formatRange(eff);
  const rules = getEffectDesc(eff?.baseEffect);
  const flavor = pow.description || pow.summary || pow.notes || '';
  const status = pow.active !== false ? 'ACTIVE' : 'OFFLINE';

  // Configured choices (Senses, Enhanced Trait, Movement, Immunity, etc.)
  const cfgDetails = getEffectConfigDetails(eff);
  const configuredChoices = cfgDetails?.quickText || '';
  const configuredTitle = cfgDetails?.title || 'Selections';

  // Descriptors
  const descriptors = Array.isArray(pow.descriptors) && pow.descriptors.length > 0
    ? pow.descriptors.join(', ')
    : '';

  // Extras & Flaws
  const extras = formatModifierList(eff?.extras, false);
  const flaws = formatModifierList(eff?.flaws, true);

  // Linked Effects
  const linkedList = getActiveLinkedEffects(pow);
  const linkedEffects = formatLinkedEffectsList(linkedList);

  // Array context
  let activeStuntName = '';
  let alternateStunts = '';
  const isArray = pow.type === 'array' || (Array.isArray(pow.alternateEffects) && pow.alternateEffects.length > 0);
  if (isArray) {
    if (pow.activeSlotId && pow.activeSlotId !== 'main') {
      const activeAlt = (pow.alternateEffects || []).find(a => a.id === pow.activeSlotId);
      activeStuntName = activeAlt?.name || 'Alternate Stunt';
    } else {
      activeStuntName = pow.mainEffect?.name || pow.name || 'Primary Stunt';
    }

    const stuntsList = [];
    if (pow.activeSlotId !== 'main') {
      stuntsList.push(`★ ${pow.mainEffect?.name || 'Primary Mode'}`);
    }
    (pow.alternateEffects || []).forEach(a => {
      if (a.id !== pow.activeSlotId) {
        stuntsList.push(a.name || 'Alternate Mode');
      }
    });
    alternateStunts = stuntsList.join(', ');
  }

  // Device context (works for Device container OR Removable flaw on any power)
  let deviceType = '';
  let deviceSystems = '';
  if (pow.type === 'device' || pow.deviceConfig?.type) {
    const devTypeVal = pow.deviceConfig?.type || (pow.type === 'device' ? 'removable' : '');
    if (devTypeVal === 'easily_removable') {
      deviceType = 'Easily Removable (-2/5 PP)';
    } else if (devTypeVal === 'removable') {
      deviceType = 'Removable (-1/5 PP)';
    }
  }
  if (pow.type === 'device' && Array.isArray(pow.devicePowers) && pow.devicePowers.length > 0) {
    deviceSystems = pow.devicePowers.map((s, idx) => {
      const sEff = getSubPowerActiveEffect(s);
      const sStatus = (pow.active !== false && s.active !== false) ? 'ONLINE' : 'OFFLINE';
      return `[${sStatus}] ${s.name || `System ${idx + 1}`} (${sEff.baseEffect || 'Effect'} Rank ${sEff.ranks || 1})`;
    }).join('; ');
  }

  // Compound context
  let compoundComponents = '';
  let sharedModifiers = '';
  if (pow.type === 'compound' && Array.isArray(pow.compoundEffects) && pow.compoundEffects.length > 0) {
    compoundComponents = pow.compoundEffects.map((s, idx) => {
      const sEff = getSubPowerActiveEffect(s);
      const priTag = (s.isPrimaryAction || s.isPrimary) ? '★ ' : '';
      const dc = calculateDC(sEff);
      const dcStr = dc ? ` [${dc}]` : '';
      return `${priTag}${s.name || `Component ${idx + 1}`} (${sEff?.baseEffect || 'Effect'} Rank ${sEff?.ranks || 1}${dcStr})`;
    }).join('; ');
    if (Array.isArray(pow.sharedModifiers) && pow.sharedModifiers.length > 0) {
      sharedModifiers = formatModifiersInline(pow.sharedModifiers);
    }
  }

  const effSummary = eff ? `${eff.baseEffect || 'Effect'} Rank ${eff.ranks || 1} (Action: ${eff.action || 'Standard'}, Range: ${range}, ${dc})` : '';
  const activation = (pow.activation && pow.activation !== 'none')
    ? (pow.activation === 'move' ? 'Move Action (-1 PP)' : 'Standard Action (-2 PP)')
    : '';

  sendFeatureToVTT({
    name: pow.name || 'Power',
    category: 'power',
    powerType: pow.type || 'standard',
    status,
    activation,
    deviceType,
    deviceSystems,
    compoundMode: pow.compoundMode || 'Suite (Simultaneous)',
    compoundComponents,
    sharedModifiers,
    arrayContext: isArray,
    activeStuntName,
    alternateStunts,
    baseEffect: eff?.baseEffect || '',
    effectRank: eff?.ranks || 1,
    configuredChoices,
    configuredTitle,
    dc,
    descriptors,
    action: eff?.action || 'Standard',
    range,
    duration: eff?.duration || 'Instant',
    cost: `${cost} PP`,
    extras,
    flaws,
    linkedEffects,
    flavor,
    rules,
    description: flavor || rules,
    details: effSummary
  }, heroStore.character);

  uiStore.showToast(`Broadcasted "${pow.name || 'Power'}" dossier to Roll20!`, 'info');
}

function broadcastSubPower(parentPow, subPow, subIdx) {
  const isCompound = parentPow.type === 'compound';
  const eff = getSubPowerActiveEffect(subPow);
  const dc = calculateDC(eff);
  const range = formatRange(eff);
  const rules = getEffectDesc(eff?.baseEffect);
  const flavor = subPow.description || subPow.summary || subPow.notes || '';
  const status = (parentPow.active !== false && subPow.active !== false) ? 'ACTIVE' : 'OFFLINE';

  const cfgDetails = getEffectConfigDetails(eff);
  const configuredChoices = cfgDetails?.quickText || '';
  const configuredTitle = cfgDetails?.title || 'Selections';

  const extras = formatModifierList(eff?.extras, false);
  const flaws = formatModifierList(eff?.flaws, true);

  const activation = (parentPow.activation && parentPow.activation !== 'none')
    ? (parentPow.activation === 'move' ? 'Move Action (-1 PP)' : 'Standard Action (-2 PP)')
    : '';

  const isPrimary = Boolean(subPow.isPrimaryAction || subPow.isPrimary);

  sendFeatureToVTT({
    name: subPow.name || (isCompound ? `Component ${subIdx + 1}` : `System ${subIdx + 1}`),
    componentName: subPow.name || (isCompound ? `Component ${subIdx + 1}` : `System ${subIdx + 1}`),
    systemName: subPow.name || `System ${subIdx + 1}`,
    parentDevice: !isCompound ? (parentPow.name || 'Device') : '',
    parentCompound: isCompound ? (parentPow.name || 'Compound Power') : '',
    category: isCompound ? 'compound_component' : 'device_subpower',
    isPrimary,
    status,
    activation,
    baseEffect: eff?.baseEffect || '',
    effectRank: eff?.ranks || 1,
    configuredChoices,
    configuredTitle,
    dc,
    action: eff?.action || 'Standard',
    range,
    duration: eff?.duration || 'Instant',
    extras,
    flaws,
    flavor,
    rules,
    description: flavor || rules
  }, heroStore.character);

  const label = isCompound ? 'component' : 'sub-system';
  uiStore.showToast(`Broadcasted ${label} "${subPow.name || (isCompound ? 'Component' : 'System')}" to Roll20!`, 'info');
}

function broadcastEffect(pow, effect, isLinked = false) {
  if (!effect || !effect.baseEffect) return;
  const dc = calculateDC(effect);
  const range = formatRange(effect);
  const rules = getEffectDesc(effect.baseEffect);
  const parentName = pow ? (pow.name || 'Power') : '';

  const cfgDetails = getEffectConfigDetails(effect);
  const configuredChoices = cfgDetails?.quickText || '';
  const configuredTitle = cfgDetails?.title || 'Selections';
  const activeTitle = getActiveSlotTitle(pow);
  const displayName = isLinked
    ? getLinkedDisplayName(effect)
    : (activeTitle ? `${activeTitle} (${effect.baseEffect || 'Effect'})` : (effect.baseEffect || 'Effect'));

  sendFeatureToVTT({
    name: displayName,
    category: 'power_effect',
    parentPower: isLinked ? `${parentName} (Linked)` : parentName,
    ranks: effect.ranks || 1,
    configuredChoices,
    configuredTitle,
    action: effect.action || 'Standard',
    range,
    duration: effect.duration || 'Instant',
    resistance: effect.resistance || '',
    dc,
    rules,
    description: rules
  }, heroStore.character);

  uiStore.showToast(`Broadcasted ${isLinked ? 'linked ' : ''}effect "${displayName}" to Roll20!`, 'info');
}

function broadcastExtra(pow, extra, parentEffectName = null) {
  if (!extra || !extra.name) return;
  const modInfo = getModifierInfo(extra.name, false);
  const category = modInfo.category || 'Combat & Utility Extra';
  const rawRules = extra.desc || modInfo.desc || '';
  const rules = extra.customText ? `Specification: ${extra.customText}\n\n${rawRules}` : rawRules;
  const costSign = extra.cost >= 0 ? `+${extra.cost}` : `${extra.cost}`;
  const costModifier = `${costSign} ${extra.type === 'per_rank' ? 'PP/r' : 'Flat'}`;
  const parentPowerName = pow ? (pow.name || 'Power') : '';
  const effName = parentEffectName || (pow ? getActiveEffect(pow)?.baseEffect : '');
  const displayName = extra.customText ? `${extra.name}: ${extra.customText}` : extra.name;

  sendFeatureToVTT({
    name: displayName,
    category: 'power_extra',
    parentPower: parentPowerName,
    effectName: effName,
    category,
    ranks: extra.ranks || 1,
    cost: costModifier,
    rules,
    description: rules
  }, heroStore.character);

  uiStore.showToast(`Broadcasted Extra "${displayName}" to Roll20!`, 'info');
}

function broadcastFlaw(pow, flaw, parentEffectName = null) {
  if (!flaw || !flaw.name) return;
  const modInfo = getModifierInfo(flaw.name, true);
  const category = modInfo.category || 'Limitation Flaw';
  const rawRules = flaw.desc || modInfo.desc || '';
  const rules = flaw.customText ? `Drawback: ${flaw.customText}\n\n${rawRules}` : rawRules;
  const costModifier = `${flaw.cost} ${flaw.type === 'per_rank' ? 'PP/r' : 'Flat'}`;
  const parentPowerName = pow ? (pow.name || 'Power') : '';
  const effName = parentEffectName || (pow ? getActiveEffect(pow)?.baseEffect : '');
  const displayName = flaw.customText ? `${flaw.name}: ${flaw.customText}` : flaw.name;

  sendFeatureToVTT({
    name: displayName,
    category: 'power_flaw',
    parentPower: parentPowerName,
    effectName: effName,
    category,
    ranks: flaw.ranks || 1,
    cost: costModifier,
    rules,
    description: rules
  }, heroStore.character);

  uiStore.showToast(`Broadcasted Flaw "${displayName}" to Roll20!`, 'info');
}

// Set tracking expanded cards
const expandedPowers = ref(new Set());

function isExpanded(id) {
  return expandedPowers.value.has(id);
}

function toggleExpand(id) {
  if (expandedPowers.value.has(id)) {
    expandedPowers.value.delete(id);
  } else {
    expandedPowers.value.add(id);
  }
}

const isAllExpanded = computed(() => {
  const total = heroStore.character.powers.length;
  return total > 0 && expandedPowers.value.size >= total;
});

function toggleExpandAll() {
  const allIds = heroStore.character.powers.map((p, i) => p.id || i);
  if (isAllExpanded.value) {
    expandedPowers.value.clear();
  } else {
    allIds.forEach(id => expandedPowers.value.add(id));
  }
}

const isAnyPowerActive = computed(() => {
  return (heroStore.character.powers || []).some(p => p.active !== false);
});

function handleTogglePower(pow) {
  const newState = heroStore.togglePower(pow.id);
  uiStore.showToast(`Power "${pow.name || 'Power'}" is now ${newState ? 'ACTIVE' : 'OFFLINE'}`, newState ? 'success' : 'info');
}

function handleToggleSubPower(pow, sIdx, sub) {
  if (pow.active === false) {
    uiStore.showToast(`Cannot toggle sub-power while device "${pow.name || 'Device'}" is OFFLINE`, 'warning');
    return;
  }
  const newState = heroStore.toggleDeviceSubPower(pow.id, sIdx);
  uiStore.showToast(`Sub-power "${sub.name || 'System'}" is now ${newState ? 'ACTIVE' : 'OFFLINE'}`, newState ? 'success' : 'info');
}

// Sub-Meta & Glance Helpers
function hasPowerSubMeta(pow) {
  if (!pow) return false;
  if (pow.activation && pow.activation !== 'none') return true;
  if (pow.type === 'device') return true;
  return false;
}

function formatModifiersInline(list) {
  if (!Array.isArray(list) || list.length === 0) return '';
  return list.map(m => {
    let s = m.name;
    if (m.customText) s += ` (${m.customText})`;
    if ((m.ranks || 1) > 1) s += ` x${m.ranks}`;
    return s;
  }).join(', ');
}

function formatLinkedInline(list) {
  if (!Array.isArray(list) || list.length === 0) return '';
  return list.map(l => {
    let s = `${getLinkedDisplayName(l)} ${l.ranks || 1}R`;
    const dc = calculateDC(l);
    if (dc) s += ` (${dc})`;
    return s;
  }).join(' • ');
}

// Device Container Sub-Power Tabs State
const activeDeviceTabs = ref({});

function getActiveDeviceSubIndex(powId) {
  if (activeDeviceTabs.value[powId] === undefined) {
    return 0; // Default to first system
  }
  return activeDeviceTabs.value[powId];
}

function setActiveDeviceSubIndex(powId, target) {
  activeDeviceTabs.value[powId] = target;
}

function getSelectedDeviceSub(pow, powId) {
  const list = pow?.devicePowers || [];
  if (list.length === 0) return { sub: null, idx: 0 };
  let idx = getActiveDeviceSubIndex(powId);
  if (idx === 'overview' || typeof idx !== 'number' || idx >= list.length || idx < 0) {
    idx = 0;
  }
  return { sub: list[idx], idx };
}

// Compound Power Component Tabs State
const activeCompoundTabs = ref({});

function getActiveCompoundSubIndex(powId) {
  if (activeCompoundTabs.value[powId] === undefined) {
    return 0; // Default to first component
  }
  return activeCompoundTabs.value[powId];
}

function setActiveCompoundSubIndex(powId, target) {
  activeCompoundTabs.value[powId] = target;
}

function getSelectedCompoundSub(pow, powId) {
  const list = pow?.compoundEffects || [];
  if (list.length === 0) return { sub: null, idx: 0 };
  let idx = getActiveCompoundSubIndex(powId);
  if (typeof idx !== 'number' || idx >= list.length || idx < 0) {
    idx = 0;
  }
  return { sub: list[idx], idx };
}

function isCompoundSubPrimary(pow, sub, sIdx) {
  if (!pow || !sub) return false;
  if (sub.isPrimaryAction || sub.isPrimary) return true;
  const hasExplicitPrimary = (pow.compoundEffects || []).some(c => c.isPrimaryAction || c.isPrimary);
  return !hasExplicitPrimary && sIdx === 0;
}

function getEffectIcon(baseEffect) {
  const base = (baseEffect || '').toLowerCase();
  if (['damage', 'blast', 'strike'].includes(base)) return 'ri-sword-line';
  if (['protection', 'force field', 'deflect'].includes(base)) return 'ri-shield-fill';
  if (['immunity'].includes(base)) return 'ri-shield-cross-fill';
  if (['senses'].includes(base)) return 'ri-eye-fill';
  if (['flight', 'speed', 'leaping', 'teleport', 'movement', 'swimming', 'burrowing'].includes(base)) return 'ri-flight-takeoff-fill';
  if (['enhanced trait'].includes(base)) return 'ri-user-star-fill';
  if (['affliction', 'weaken', 'nullify', 'mind control'].includes(base)) return 'ri-skull-fill';
  if (['healing', 'regeneration', 'immortality'].includes(base)) return 'ri-heart-pulse-fill';
  if (['create', 'illusion', 'transform', 'morph', 'variable'].includes(base)) return 'ri-magic-fill';
  if (['communication', 'comprehend', 'remote sensing'].includes(base)) return 'ri-broadcast-fill';
  return 'ri-flashlight-fill';
}

function handleToggleAllPowers() {
  const targetState = !isAnyPowerActive.value;
  heroStore.toggleAllPowers(targetState);
  uiStore.showToast(targetState ? 'All powers ACTIVATED' : 'All powers DEACTIVATED', targetState ? 'success' : 'info');
}

function getPowerCost(power) {
  return calculatePowerTotalCost(power);
}

function handleCreatePower(type) {
  builderStore.openNewPower(type);
}

function handleEditPower(idx, pow) {
  builderStore.openEditPower(idx, pow);
}

function getActiveEffect(pow) {
  if (!pow) return {};
  const hasAlts = Array.isArray(pow.alternateEffects) && pow.alternateEffects.length > 0;
  if ((pow.type === 'array' || hasAlts) && pow.activeSlotId && pow.activeSlotId !== 'main') {
    const alt = pow.alternateEffects.find(a => a.id === pow.activeSlotId);
    if (alt && alt.effect) return alt.effect;
  }
  return pow.mainEffect || {};
}

function getActiveLinkedEffects(pow) {
  if (!pow) return [];
  const hasAlts = Array.isArray(pow.alternateEffects) && pow.alternateEffects.length > 0;
  if ((pow.type === 'array' || hasAlts) && pow.activeSlotId && pow.activeSlotId !== 'main') {
    const alt = pow.alternateEffects.find(a => a.id === pow.activeSlotId);
    if (alt) {
      if (Array.isArray(alt.linkedEffects)) return alt.linkedEffects;
      if (alt.effect && Array.isArray(alt.effect.linkedEffects)) return alt.effect.linkedEffects;
    }
  }
  return pow.linkedEffects || [];
}

function getActiveSlotTitle(pow) {
  if (!pow) return '';
  const hasAlts = Array.isArray(pow.alternateEffects) && pow.alternateEffects.length > 0;
  if ((pow.type === 'array' || hasAlts) && pow.activeSlotId && pow.activeSlotId !== 'main') {
    const alt = pow.alternateEffects.find(a => a.id === pow.activeSlotId);
    return alt?.name || '';
  }
  return '';
}

function getSubPowerActiveEffect(sub) {
  if (sub.alternateEffects?.length > 0 && sub.activeSlotId && sub.activeSlotId !== 'main') {
    const alt = sub.alternateEffects.find(a => a.id === sub.activeSlotId);
    if (alt && alt.effect) return alt.effect;
  }
  return sub.effect || {};
}

function getSubPowerActiveLinkedEffects(sub) {
  if (!sub) return [];
  if (sub.alternateEffects?.length > 0 && sub.activeSlotId && sub.activeSlotId !== 'main') {
    const alt = sub.alternateEffects.find(a => a.id === sub.activeSlotId);
    if (alt && Array.isArray(alt.linkedEffects)) return alt.linkedEffects;
    if (alt && alt.effect && Array.isArray(alt.effect.linkedEffects)) return alt.effect.linkedEffects;
  }
  if (Array.isArray(sub.linkedEffects)) return sub.linkedEffects;
  if (sub.effect && Array.isArray(sub.effect.linkedEffects)) return sub.effect.linkedEffects;
  return [];
}

function calculateDC(eff) {
  if (!eff || !eff.baseEffect) return '';
  const ranks = Number(eff.ranks) || 0;
  const base = (eff.baseEffect || '').toLowerCase();
  if (base === 'damage' || base === 'blast') {
    return `DC ${15 + ranks} vs ${eff.resistance || 'Toughness'}`;
  }
  if (['affliction', 'weaken', 'nullify', 'mind control'].includes(base)) {
    return `DC ${10 + ranks} vs ${eff.resistance || 'Fortitude'}`;
  }
  if (base === 'mind reading') {
    return `DC ${10 + ranks} vs ${eff.resistance || 'Will'}`;
  }
  const extras = Array.isArray(eff.extras) ? eff.extras : [];
  const hasAttackExtra = extras.some(x => (x.name || '').trim().toLowerCase() === 'attack');
  if (hasAttackExtra) {
    return `DC ${10 + ranks} vs ${eff.resistance || 'Dodge'}`;
  }
  const nonResistanceEffects = [
    'senses', 'enhanced trait', 'movement', 'immunity', 'flight', 'speed', 'quickness',
    'leaping', 'swimming', 'growth', 'shrinking', 'morph', 'variable', 'comprehend',
    'feature', 'protection', 'regeneration', 'immortality', 'elongation', 'invisibility',
    'insubstantial', 'burrowing', 'teleport', 'deflect', 'healing', 'remote sensing',
    'create', 'illusion', 'transform', 'communication', 'luck control', 'extra limbs', 'environment', 'summon'
  ];
  if (nonResistanceEffects.includes(base) || eff.action === 'None' || (!eff.resistance || eff.resistance === 'None' || eff.resistance === 'none')) {
    return '';
  }
  return eff.resistance && eff.resistance !== 'Toughness' ? `vs ${eff.resistance}` : '';
}

function calculateCompactDC(eff) {
  if (!eff || !eff.baseEffect) return '';
  const ranks = Number(eff.ranks) || 0;
  const base = (eff.baseEffect || '').toLowerCase();
  const res = eff.resistance ? eff.resistance.slice(0, 4) : '';
  if (base === 'damage' || base === 'blast') {
    return `DC ${15 + ranks} ${res || 'Tou'}`;
  }
  if (['affliction', 'weaken', 'nullify', 'mind control'].includes(base)) {
    return `DC ${10 + ranks} ${res || 'Fort'}`;
  }
  if (base === 'mind reading') {
    return `DC ${10 + ranks} ${res || 'Will'}`;
  }
  const extras = Array.isArray(eff.extras) ? eff.extras : [];
  const hasAttackExtra = extras.some(x => (x.name || '').trim().toLowerCase() === 'attack');
  if (hasAttackExtra) {
    return `DC ${10 + ranks} ${res || 'Dod'}`;
  }
  return '';
}

function formatRange(eff) {
  if (!eff) return 'Close';
  const range = eff.range || 'Close';
  const ranks = Number(eff.ranks) || 0;
  if (range === 'Ranged') {
    return `Ranged (${ranks * 25}/${ranks * 50}/${ranks * 100} ft)`;
  }
  return range;
}

function getEffectDesc(baseName) {
  const match = BASE_EFFECTS.find(b => b.name?.toLowerCase() === (baseName || '').toLowerCase());
  return match?.desc || 'Official superhuman power effect rules.';
}

function getModifierInfo(modName, isFlaw = false) {
  const catalog = isFlaw ? FLAWS : EXTRAS;
  const match = catalog.find(m => m.name?.toLowerCase() === (modName || '').toLowerCase());
  return {
    category: match?.category || (isFlaw ? 'Limitation' : 'Combat & Utility'),
    desc: match?.desc || 'Applies modifier rules to this power effect.'
  };
}
</script>

<style scoped>
.powers-deck-section {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1.25rem;
  box-shadow: var(--shadow-sm);
}

.card-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.85rem;
  padding-bottom: 0.65rem;
  border-bottom: 1px solid var(--border-subtle);
  flex-wrap: wrap;
  gap: 0.75rem;
}

.card-title-group {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.icon-primary {
  font-size: 1.25rem;
  color: #a855f7;
}

.card-title-group h3 {
  font-size: 1.05rem;
  font-weight: 800;
  margin: 0;
}

.cost-tag-badge {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.15rem 0.55rem;
  border-radius: var(--radius-pill);
  background: rgba(168, 85, 247, 0.15);
  color: #ddd6fe;
  border: 1px solid rgba(168, 85, 247, 0.3);
}

.header-right-actions {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex-wrap: wrap;
}

.btn-expand-all {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.28rem 0.6rem;
  border-radius: var(--radius-xs);
  cursor: pointer;
  transition: color var(--trans-fast), background-color var(--trans-fast), border-color var(--trans-fast);
}

.btn-expand-all:hover {
  background: var(--bg-card-hover);
  color: var(--text-primary);
  border-color: var(--border-color);
}

.btn-expand-all:active {
  transform: scale(0.96);
}

.create-power-btn-group {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.btn-create-p {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  color: var(--text-primary);
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.3rem 0.6rem;
  border-radius: var(--radius-xs);
  cursor: pointer;
  transition: background-color var(--trans-fast), color var(--trans-fast), transform var(--trans-fast);
}

.btn-create-p:hover {
  background: var(--accent-primary);
  color: #fff;
}

.btn-create-p.dev:hover {
  background: #f59e0b;
  color: #fff;
}

.btn-create-p.compound:hover {
  background: #0ea5e9;
  color: #fff;
}

.btn-create-p.arr:hover {
  background: #8b5cf6;
  color: #fff;
}

.btn-create-p:active {
  transform: scale(0.96);
}

.header-total-badge {
  font-size: 0.78rem;
  font-weight: 800;
  color: #60a5fa;
  background: rgba(0, 111, 184, 0.12);
  border: 1px solid rgba(0, 111, 184, 0.3);
  padding: 0.2rem 0.65rem;
  border-radius: var(--radius-pill);
  font-variant-numeric: tabular-nums;
}

.empty-powers-box {
  padding: 2.5rem;
  text-align: center;
  color: var(--text-muted);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.empty-powers-box i {
  font-size: 2.2rem;
}

.powers-cards-deck {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.power-item-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 0.85rem 0.95rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  transition: border-color var(--trans-fast), box-shadow var(--trans-fast), opacity var(--trans-fast);
}

.power-item-card:hover {
  border-color: var(--border-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.power-item-card.is-deactivated {
  opacity: 0.65;
  border-style: dashed;
  background: rgba(15, 23, 42, 0.45);
  filter: grayscale(0.25);
}

.power-item-card.is-deactivated:hover {
  opacity: 0.9;
  filter: grayscale(0);
}

.power-item-card.is-deactivated .pow-name {
  color: var(--text-muted);
  text-decoration: line-through;
  text-decoration-color: rgba(239, 68, 68, 0.6);
}

.pow-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  flex-wrap: nowrap;
}

.pow-title-area {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-wrap: nowrap;
  min-width: 0;
  flex: 1 1 auto;
}

/* Power Active / Inactive Toggle Switch */
.power-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.35);
  color: #34d399;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  padding: 0.2rem 0.55rem;
  border-radius: var(--radius-pill);
  cursor: pointer;
  transition: all var(--trans-fast);
  user-select: none;
  flex-shrink: 0;
}

.power-toggle-btn i {
  font-size: 0.88rem;
  line-height: 1;
}

.power-toggle-btn:hover {
  filter: brightness(1.2);
  transform: translateY(-1px);
}

.power-toggle-btn.is-off {
  background: rgba(100, 116, 139, 0.15);
  border-color: rgba(148, 163, 184, 0.28);
  color: #94a3b8;
}

.power-toggle-btn.is-off:hover {
  border-color: rgba(148, 163, 184, 0.5);
  color: var(--text-secondary);
}

/* Header Batch Toggle All Powers */
.btn-toggle-all-powers {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.3rem 0.65rem;
  border-radius: var(--radius-xs);
  cursor: pointer;
  transition: all var(--trans-fast);
}

.btn-toggle-all-powers:hover {
  background: var(--bg-card);
  color: var(--text-primary);
  border-color: var(--border-color);
}

.btn-toggle-all-powers.all-off {
  color: #fca5a5;
  border-color: rgba(239, 68, 68, 0.3);
}

/* Device Sub-Power Toggle Button & Tile */
.sub-power-toggle-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: #34d399;
  font-size: 0.95rem;
  cursor: pointer;
  padding: 0;
  transition: color var(--trans-fast), transform var(--trans-fast);
  line-height: 1;
}

.sub-power-toggle-btn:hover:not(:disabled) {
  transform: scale(1.18);
}

.sub-power-toggle-btn.is-off {
  color: #64748b;
}

.sub-power-toggle-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.sub-power-toggle-btn.master-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  padding: 0.22rem 0.55rem;
  border-radius: var(--radius-xs);
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.35);
  color: #34d399;
  cursor: pointer;
  transition: all var(--trans-fast);
}

.sub-power-toggle-btn.master-toggle:hover:not(:disabled) {
  background: rgba(16, 185, 129, 0.25);
  transform: none;
}

.sub-power-toggle-btn.master-toggle.is-off {
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.3);
  color: #f87171;
}

.sub-power-toggle-btn.master-toggle.is-off:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.22);
}

.sub-system-tile.is-sub-deactivated {
  opacity: 0.65;
  border-style: dashed;
  background: rgba(15, 23, 42, 0.35);
}

.sub-system-tile.is-sub-deactivated .sub-tile-name {
  color: var(--text-muted);
  text-decoration: line-through;
  text-decoration-color: rgba(239, 68, 68, 0.5);
}

.pow-name {
  font-size: 0.92rem;
  font-weight: 800;
  color: #fff;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.structure-badge {
  font-size: 0.62rem;
  font-weight: 800;
  padding: 0.1rem 0.45rem;
  border-radius: var(--radius-xs);
  letter-spacing: var(--letter-spacing-caps);
  flex-shrink: 0;
}

.badge-device { background: rgba(245, 158, 11, 0.2); color: #fde68a; }
.badge-compound { background: rgba(14, 165, 233, 0.2); color: #7dd3fc; border: 1px solid rgba(14, 165, 233, 0.35); }
.badge-array { background: rgba(139, 92, 246, 0.2); color: #ddd6fe; }
.badge-standard { background: rgba(59, 130, 246, 0.2); color: #bfdbfe; }

.compound-suite-badge {
  font-size: 0.65rem;
  color: #38bdf8;
  font-weight: 700;
  background: rgba(14, 165, 233, 0.12);
  padding: 0.1rem 0.45rem;
  border-radius: var(--radius-xs);
  border: 1px solid rgba(14, 165, 233, 0.25);
}

.compound-tactical-glance {
  padding: 0.2rem 0;
  background: transparent;
  border: none;
}

.compound-tactical-roster {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 0.45rem;
  padding: 0.15rem 0;
}

.compound-system-chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(15, 23, 42, 0.55);
  border: 1px solid rgba(14, 165, 233, 0.22);
  border-radius: var(--radius-xs);
  padding: 0.35rem 0.55rem;
  transition: all var(--trans-fast);
  cursor: pointer;
  min-width: 0;
}

.compound-system-chip:hover {
  background: rgba(14, 165, 233, 0.12);
  border-color: rgba(14, 165, 233, 0.45);
  transform: translateY(-1px);
}

.compound-system-chip.is-primary {
  border-color: rgba(14, 165, 233, 0.45);
  background: rgba(14, 165, 233, 0.08);
}

.compound-icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background: rgba(14, 165, 233, 0.15);
  color: #38bdf8;
  font-size: 0.88rem;
  flex-shrink: 0;
}

.compound-icon-wrapper.is-primary-icon {
  background: rgba(245, 158, 11, 0.18);
  color: #fbbf24;
}

.primary-action-pill {
  font-size: 0.58rem;
  font-weight: 800;
  padding: 0.05rem 0.3rem;
  border-radius: 3px;
  background: rgba(245, 158, 11, 0.2);
  color: #fde68a;
  border: 1px solid rgba(245, 158, 11, 0.35);
  letter-spacing: var(--letter-spacing-caps);
  line-height: 1.1;
}

.chip-label-group {
  display: flex;
  flex-direction: column;
  gap: 0.08rem;
  flex: 1;
  min-width: 0;
}

.chip-title-line {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  min-width: 0;
}

.chip-sys-name {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chip-sys-effect {
  font-size: 0.74rem;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chip-quick-text {
  color: var(--text-muted);
  font-style: italic;
}

.chip-dc-tag.compound {
  font-size: 0.62rem;
  font-weight: 800;
  padding: 0.08rem 0.32rem;
  border-radius: 3px;
  background: rgba(14, 165, 233, 0.15);
  color: #7dd3fc;
  border: 1px solid rgba(14, 165, 233, 0.3);
  flex-shrink: 0;
  white-space: nowrap;
}

.chip-vtt-btn.compound {
  background: transparent;
  border: 1px solid rgba(14, 165, 233, 0.25);
  color: #38bdf8;
  border-radius: 3px;
  width: 22px;
  height: 22px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all var(--trans-fast);
  flex-shrink: 0;
}

.chip-vtt-btn.compound:hover {
  background: rgba(14, 165, 233, 0.25);
  color: #f0f9ff;
  border-color: rgba(14, 165, 233, 0.6);
  transform: scale(1.08);
}


.compound-shared-mods-row {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.74rem;
  color: var(--text-secondary);
  padding: 0.25rem 0.2rem 0 0.2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  margin-top: 0.35rem;
}

.shared-label {
  font-weight: 700;
  color: #a78bfa;
}

.shared-inline-text {
  color: var(--text-primary);
}

.compound-shared-meta-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.55rem;
}

.compound-shared-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.72rem;
  font-weight: 700;
  color: #a78bfa;
  background: rgba(167, 139, 250, 0.12);
  padding: 0.18rem 0.55rem;
  border-radius: var(--radius-xs);
  border: 1px solid rgba(167, 139, 250, 0.25);
}

.sub-mods-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0.5rem;
}

.device-removable-badge {
  font-size: 0.65rem;
  color: #34d399;
  font-weight: 700;
}

.activation-flaw-badge {
  font-size: 0.65rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.35);
  padding: 0.1rem 0.45rem;
  border-radius: var(--radius-xs);
}

.pow-card-actions {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-shrink: 0;
  margin-left: auto;
}

.pow-cost-badge {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--accent-primary);
  background: rgba(0, 111, 184, 0.12);
  border: 1px solid rgba(0, 111, 184, 0.3);
  padding: 0.15rem 0.55rem;
  border-radius: var(--radius-pill);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  flex-shrink: 0;
}

.btn-send-vtt {
  flex-shrink: 0;
}

.btn-edit-power {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  color: var(--text-primary);
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.22rem 0.55rem;
  border-radius: var(--radius-xs);
  cursor: pointer;
  transition: background-color var(--trans-fast), color var(--trans-fast), transform var(--trans-fast);
  white-space: nowrap;
  flex-shrink: 0;
}

.btn-edit-power:hover {
  background: var(--accent-primary);
  color: #fff;
}

.btn-edit-power:active {
  transform: scale(0.96);
}

.btn-toggle-expand {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.22rem 0.55rem;
  border-radius: var(--radius-xs);
  cursor: pointer;
  transition: all var(--trans-fast);
  white-space: nowrap;
  flex-shrink: 0;
}

.btn-toggle-expand:hover {
  background: var(--bg-surface);
  color: var(--text-primary);
  border-color: var(--border-color);
}

.btn-toggle-expand.expanded {
  background: rgba(59, 130, 246, 0.15);
  color: #93c5fd;
  border-color: rgba(59, 130, 246, 0.4);
}

.btn-toggle-expand:active {
  transform: scale(0.96);
}

.btn-del-power {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 0.95rem;
  padding: 0.2rem;
  display: inline-flex;
  align-items: center;
  transition: color var(--trans-fast);
  flex-shrink: 0;
}

.btn-del-power:hover {
  color: #f87171;
}

/* ==========================================================================
   GLANCE SUMMARY STYLES
   ========================================================================== */
.pow-glance-summary {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xs);
  padding: 0.55rem 0.75rem;
}

.pow-glance-summary.is-expanded-mode-strip {
  background: transparent;
  border: none;
  padding: 0;
  margin-bottom: 0.35rem;
}

.pow-glance-summary.is-expanded-mode-strip .array-glance-switcher {
  padding-bottom: 0.35rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

/* Option 4.A: Underline Tab Rail (Clean open switcher with active underline indicator) */
.array-glance-switcher,
.sub-array-switcher {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding: 0.15rem 0 0.4rem 0;
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 0;
  margin: 0.35rem 0 0.55rem 0;
}

.glance-label {
  font-size: 0.68rem;
  font-weight: 800;
  color: #38bdf8;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.slot-buttons-group {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.slot-btn {
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--text-secondary);
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.55rem;
  border-radius: 0;
  cursor: pointer;
  transition: all var(--trans-fast);
  white-space: nowrap;
}

.slot-btn:hover {
  background: rgba(255, 255, 255, 0.04);
  color: #fff;
  border-bottom-color: rgba(56, 189, 248, 0.4);
}

.slot-btn.active {
  background: transparent;
  color: #38bdf8;
  border-bottom-color: #38bdf8;
  font-weight: 800;
  box-shadow: none;
}

/* De-boxed Flowing Glance Summary Row (Collapsed State) */
.glance-specs-flow {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.35rem 0.65rem;
  padding: 0.2rem 0.15rem;
  font-size: 0.78rem;
  color: var(--text-secondary);
}

.glance-spec-item {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  line-height: 1.3;
}

.glance-specs-flow .glance-spec-item:not(:last-child)::after {
  content: '•';
  color: rgba(255, 255, 255, 0.25);
  margin-left: 0.65rem;
  font-weight: 400;
  font-size: 0.8rem;
}

.glance-spec-item.effect-main {
  color: var(--text-primary);
  font-size: 0.85rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.glance-effect-name {
  color: #38bdf8;
  font-weight: 800;
  font-size: 0.88rem;
  letter-spacing: 0.01em;
}

.glance-rank-pill {
  font-size: 0.72rem;
  font-weight: 800;
  color: #7dd3fc;
  background: rgba(56, 189, 248, 0.16);
  border: 1px solid rgba(56, 189, 248, 0.3);
  padding: 0.04rem 0.32rem;
  border-radius: 3px;
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
}

.glance-spec-item i {
  color: #94a3b8;
  font-size: 0.82rem;
}

.glance-spec-item.dc-highlight {
  color: #38bdf8;
  font-weight: 700;
}

.glance-spec-item.dc-highlight i {
  color: #38bdf8;
}

.glance-modifiers-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  padding-top: 0.2rem;
}

.glance-mod-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.15rem 0.45rem;
  border-radius: var(--radius-xs);
  font-variant-numeric: tabular-nums;
}

.glance-mod-tag.extra {
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.35);
  color: #a7f3d0;
}

.glance-mod-tag.flaw {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.35);
  color: #fecaca;
}

.glance-mod-tag.linked {
  background: rgba(6, 182, 212, 0.15);
  border: 1px solid rgba(6, 182, 212, 0.35);
  color: #a5f3fc;
}

/* Card Sub-Meta Strip (Row 2: Subtle Editorial Details) */
.pow-card-submeta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.35rem 0.55rem;
  font-size: 0.74rem;
  color: var(--text-secondary);
  padding: 0.15rem 0.2rem 0.45rem 0.2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  margin-bottom: 0.45rem;
}

.submeta-item {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  line-height: 1.3;
}

.submeta-dot {
  color: rgba(255, 255, 255, 0.25);
  font-size: 0.75rem;
}

.submeta-item.removable-text {
  color: #34d399;
  font-weight: 600;
}

.submeta-item.flaw-text {
  color: #fbbf24;
  font-weight: 600;
}

/* ==========================================================================
   COMBAT SPECS & INLINE MODIFIERS (Mode Less)
   ========================================================================== */
.glance-combat-flow {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.glance-inline-mods {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.35rem 0.75rem;
  font-size: 0.74rem;
  color: var(--text-secondary);
  padding: 0.25rem 0.15rem 0 0.15rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.inline-mod-segment {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  line-height: 1.3;
}

.inline-mod-segment.extra .mod-type-lbl {
  color: #34d399;
}

.inline-mod-segment.flaw .mod-type-lbl {
  color: #f87171;
}

.inline-mod-segment.linked .mod-type-lbl {
  color: #818cf8;
}

.mod-type-lbl {
  font-weight: 700;
  font-size: 0.72rem;
}

/* ==========================================================================
   DEVICE TACTICAL SYSTEMS CHIPS ROSTER (Mode Less)
   ========================================================================== */
.device-tactical-glance {
  padding: 0.2rem 0;
  background: transparent;
  border: none;
}

.device-tactical-roster {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 0.45rem;
  padding: 0.1rem 0;
}

.device-system-chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(245, 158, 11, 0.25);
  border-radius: var(--radius-xs);
  padding: 0.35rem 0.6rem;
  transition: all var(--trans-fast);
  cursor: pointer;
  min-width: 0;
}

.device-system-chip:hover {
  background: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.5);
  transform: translateY(-1px);
}

.device-system-chip.is-chip-offline {
  opacity: 0.55;
  border-style: dashed;
  border-color: rgba(148, 163, 184, 0.25);
  background: rgba(15, 23, 42, 0.25);
}

.device-system-chip.is-chip-offline .chip-sys-name {
  color: var(--text-muted);
  text-decoration: line-through;
  text-decoration-color: rgba(239, 68, 68, 0.5);
}

.chip-toggle-dot-btn {
  background: transparent;
  border: none;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

.chip-status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #64748b;
  transition: all var(--trans-fast);
}

.chip-toggle-dot-btn.online .chip-status-dot {
  background: #10b981;
  box-shadow: 0 0 6px rgba(16, 185, 129, 0.8);
}

.chip-toggle-dot-btn.offline .chip-status-dot {
  background: #ef4444;
  box-shadow: 0 0 5px rgba(239, 68, 68, 0.6);
}

.chip-icon {
  font-size: 0.88rem;
  color: #fbbf24;
  flex-shrink: 0;
}

.chip-label-group {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
  line-height: 1.25;
}

.chip-sys-name {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chip-sys-effect {
  font-size: 0.74rem;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chip-quick-text {
  color: var(--text-muted);
}

.chip-dc-tag {
  font-size: 0.65rem;
  font-weight: 800;
  color: #38bdf8;
  background: rgba(14, 165, 233, 0.12);
  border: 1px solid rgba(14, 165, 233, 0.28);
  padding: 0.1rem 0.38rem;
  border-radius: 3px;
  white-space: nowrap;
  flex-shrink: 0;
}

.chip-vtt-btn {
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-muted);
  border-radius: var(--radius-xs);
  padding: 0.2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all var(--trans-fast);
  flex-shrink: 0;
}

.chip-vtt-btn:hover {
  background: rgba(0, 111, 184, 0.2);
  border-color: rgba(0, 111, 184, 0.4);
  color: #38bdf8;
  transform: scale(1.1);
}

/* Expanded Systems Nav Bar */
.expanded-systems-nav {
  margin-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 0.4rem;
}

/* Horizontal Systems Nav Bar */
.device-systems-nav-bar {
  display: flex;
  align-items: center;
  padding: 0.2rem 0 0.35rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  overflow-x: auto;
}

.systems-tab-scroll {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  min-width: 0;
  width: 100%;
}

.device-tab-item {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.24rem 0.55rem;
  border-radius: var(--radius-xs);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  white-space: nowrap;
  transition: all var(--trans-fast);
  flex-shrink: 0;
}

.device-tab-item:hover {
  background: var(--bg-card-hover);
  color: var(--text-primary);
  border-color: rgba(245, 158, 11, 0.35);
}

.device-tab-item.active {
  background: rgba(245, 158, 11, 0.15);
  border-color: #f59e0b;
  color: #fbbf24;
  font-weight: 800;
  box-shadow: 0 0 10px rgba(245, 158, 11, 0.2);
}

.device-tab-item.overview-tab {
  margin-left: auto;
  border-color: rgba(56, 189, 248, 0.3);
  color: #38bdf8;
}

.device-tab-item.overview-tab:hover {
  border-color: #38bdf8;
}

.device-tab-item.overview-tab.active {
  background: rgba(56, 189, 248, 0.15);
  border-color: #38bdf8;
  color: #f0f9ff;
  box-shadow: var(--shadow-sm);
}

/* Compound Components Nav Tabs */
.device-systems-nav-bar.compound-components-nav {
  border-color: rgba(14, 165, 233, 0.15);
  margin-bottom: 0.6rem;
}

.compound-tab-item {
  border-color: rgba(14, 165, 233, 0.22);
}

.compound-tab-item:hover {
  background: rgba(14, 165, 233, 0.1);
  color: var(--text-primary);
  border-color: rgba(14, 165, 233, 0.45);
}

.compound-tab-item.active {
  background: rgba(14, 165, 233, 0.15);
  border-color: #0284c7;
  color: #38bdf8;
  box-shadow: 0 0 10px rgba(14, 165, 233, 0.25);
}

.compound-tab-item.active .tab-icon {
  color: #7dd3fc;
}

.compound-tab-item.is-primary-tab {
  border-color: rgba(245, 158, 11, 0.35);
}

.compound-tab-item.is-primary-tab.active {
  border-color: #f59e0b;
  color: #fbbf24;
  box-shadow: 0 0 10px rgba(245, 158, 11, 0.25);
}

.tab-primary-badge {
  font-size: 0.55rem;
  font-weight: 800;
  padding: 0.02rem 0.25rem;
  border-radius: 2px;
  background: rgba(245, 158, 11, 0.2);
  color: #fde68a;
  border: 1px solid rgba(245, 158, 11, 0.35);
  letter-spacing: var(--letter-spacing-caps);
  line-height: 1.1;
}

.device-tab-item.is-sub-offline {
  opacity: 0.65;
}

.tab-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #64748b;
  flex-shrink: 0;
  transition: all var(--trans-fast);
}

.tab-status-dot.online {
  background: #10b981;
  box-shadow: 0 0 5px #10b981;
}

.tab-icon {
  font-size: 0.8rem;
  color: #fbbf24;
}

.device-tab-item.active .tab-icon {
  color: #fef08a;
}

.tab-label {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tab-ranks-pill {
  font-size: 0.6rem;
  background: rgba(0, 0, 0, 0.3);
  color: var(--text-muted);
  padding: 0.05rem 0.28rem;
  border-radius: 3px;
  font-variant-numeric: tabular-nums;
}

.device-tab-item.active .tab-ranks-pill {
  background: rgba(245, 158, 11, 0.25);
  color: #fef08a;
}

/* Active System Console Card */
.device-active-system-card {
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(245, 158, 11, 0.22);
  border-radius: var(--radius-xs);
  padding: 0.6rem 0.8rem;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  margin-top: 0.25rem;
  transition: all var(--trans-fast);
}

.device-active-system-card:hover {
  border-color: rgba(245, 158, 11, 0.4);
}

.device-active-system-card.is-card-offline {
  opacity: 0.65;
  border-style: dashed;
  background: rgba(15, 23, 42, 0.3);
}

.device-active-system-card.is-card-offline .active-sys-name {
  color: var(--text-muted);
  text-decoration: line-through;
  text-decoration-color: rgba(239, 68, 68, 0.6);
}

.active-sys-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.active-sys-identity {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-wrap: wrap;
  min-width: 0;
  flex: 1;
}

.sub-toggle-text {
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  margin-left: 0.2rem;
}

.active-sys-name {
  font-size: 0.88rem;
  font-weight: 800;
  color: #fff;
  white-space: nowrap;
}

.active-sys-effect-badge {
  font-size: 0.7rem;
  font-weight: 700;
  color: #fde68a;
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.25);
  padding: 0.12rem 0.45rem;
  border-radius: 3px;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.active-sys-config-text {
  color: #cbd5e1;
  font-size: 0.67rem;
  font-weight: normal;
}

.active-sys-actions {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-shrink: 0;
}

.sub-dc-pill {
  font-size: 0.68rem;
  font-weight: 800;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.25);
  padding: 0.12rem 0.42rem;
  border-radius: 3px;
  font-variant-numeric: tabular-nums;
}

/* Parameters Strip */
.active-sys-params-strip {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex-wrap: wrap;
  font-size: 0.68rem;
  color: var(--text-muted);
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.04);
  padding: 0.25rem 0.55rem;
  border-radius: 3px;
}

.active-sys-param {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
}

.active-sys-param i {
  color: #fbbf24;
}

.active-sys-param strong {
  color: var(--text-primary);
}

/* Array Stunts inside active sub */
.sub-array-pills-wrap {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
  padding-top: 0.25rem;
}

.sub-pills-label {
  font-size: 0.64rem;
  font-weight: 700;
  color: #38bdf8;
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
}

.sub-mode-pills {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.sub-mode-pill {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: var(--text-secondary);
  font-size: 0.66rem;
  font-weight: 600;
  padding: 0.12rem 0.45rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all var(--trans-fast);
  white-space: nowrap;
}

.sub-mode-pill:hover {
  background: rgba(168, 85, 247, 0.18);
  color: #e9d5ff;
  border-color: rgba(168, 85, 247, 0.4);
}

.sub-mode-pill.active {
  background: #a855f7;
  color: #ffffff;
  border-color: #a855f7;
  box-shadow: 0 0 8px rgba(168, 85, 247, 0.45);
}

/* Modifiers & Linked strip */
.active-sys-mods-strip {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
  padding-top: 0.2rem;
}

.sub-linked-badge {
  background: rgba(6, 182, 212, 0.15);
  border: 1px solid rgba(6, 182, 212, 0.35);
  color: #a5f3fc;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.1rem 0.4rem;
  border-radius: 3px;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

/* Overview Dense List */
.device-overview-dense-list {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  margin-top: 0.3rem;
}

.overview-row-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(245, 158, 11, 0.15);
  border-radius: var(--radius-xs);
  padding: 0.35rem 0.6rem;
  cursor: pointer;
  transition: all var(--trans-fast);
}

.overview-row-item:hover {
  background: rgba(245, 158, 11, 0.08);
  border-color: rgba(245, 158, 11, 0.4);
  transform: translateX(2px);
}

.overview-row-item.is-offline {
  opacity: 0.6;
  border-style: dashed;
}

.overview-row-item.is-offline .ov-name {
  color: var(--text-muted);
  text-decoration: line-through;
}

.ov-left {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  min-width: 0;
  flex: 1;
}

.ov-icon {
  font-size: 0.82rem;
  color: #fbbf24;
  flex-shrink: 0;
}

.ov-name {
  font-size: 0.78rem;
  font-weight: 800;
  color: #fff;
  white-space: nowrap;
}

.ov-effect-badge {
  font-size: 0.68rem;
  color: #fde68a;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ov-config-text {
  color: #cbd5e1;
  font-size: 0.65rem;
  font-weight: normal;
}

.ov-right {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-shrink: 0;
}

.ov-action-chip {
  font-size: 0.62rem;
  font-weight: 700;
  color: var(--text-muted);
  background: rgba(255, 255, 255, 0.05);
  padding: 0.1rem 0.35rem;
  border-radius: 3px;
}

.ov-dc-chip {
  font-size: 0.65rem;
  font-weight: 800;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.12);
  padding: 0.1rem 0.35rem;
  border-radius: 3px;
}

.sub-power-toggle-btn.mini {
  font-size: 0.82rem;
}

/* ==========================================================================
   EXPANDED DOSSIER DRAWER STYLES
   ========================================================================== */
.pow-expanded-drawer {
  background: transparent;
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 0;
  padding: 0.85rem 0 0.25rem 0;
  margin-top: 0.75rem;
  animation: fadeIn 180ms ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

.drawer-content-flow {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.dossier-block {
  background: transparent;
  border: none;
  border-radius: 0;
  padding: 0.75rem 0 0 0;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.dossier-block:first-child,
.dossier-block:first-of-type {
  border-top: none;
  padding-top: 0;
}

.dossier-block-head {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.82rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-primary);
}

.dossier-block-head.extra-head { color: #34d399; }
.dossier-block-head.flaw-head { color: #f87171; }
.dossier-block-head.linked-head { color: #22d3ee; }
.dossier-block-head.array-head { color: #38bdf8; }
.dossier-block-head.dev-head { color: #fbbf24; }

/* Rulebook Reference Section (Option 3.C: Always visible, completely de-boxed) */
.rulebook-callout-box {
  background: transparent;
  border: none;
  border-left: none;
  border-radius: 0;
  padding: 0.25rem 0 0 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-top: 0.15rem;
  border-top: none;
}

.rulebook-callout-box.linked {
  background: transparent;
  border: none;
  border-left: none;
}

.rulebook-caption {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #64748b;
  margin-bottom: 0.2rem;
}

.rulebook-caption i {
  color: #64748b;
}

.dossier-desc-text {
  font-size: 0.82rem;
  line-height: 1.6;
  color: #cbd5e1;
  margin: 0;
  white-space: pre-line;
  text-wrap: pretty;
}

.dossier-desc-text.sub {
  font-size: 0.82rem;
  line-height: 1.6;
  color: #cbd5e1;
}

/* De-boxed Horizontal Parameters Bar (Option 2.A: Flowing Inline Dot-Separated Strip) */
.dossier-specs-grid {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.35rem 0.65rem;
  padding: 0.25rem 0;
  background: transparent;
  border: none;
  border-radius: 0;
  margin: 0.2rem 0;
}

.spec-item {
  background: transparent;
  border: none;
  padding: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.spec-item:hover {
  border-color: transparent;
}

.dossier-specs-grid .spec-item:not(:last-child)::after {
  content: '•';
  color: rgba(255, 255, 255, 0.25);
  margin-left: 0.65rem;
  font-weight: 400;
  font-size: 0.8rem;
}

.spec-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.spec-value {
  font-size: 0.84rem;
  font-weight: 800;
  color: #ffffff;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.spec-value.highlight {
  color: #38bdf8;
}

/* Extras & Flaws Dossier List (De-boxed flat editorial) */
.dossier-mods-list {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.dossier-mod-card {
  background: transparent;
  border: none;
  border-left: 2px solid #34d399;
  border-radius: 0;
  padding: 0.25rem 0 0.25rem 0.65rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.dossier-mod-card.extra-mod {
  border-left: 2px solid #34d399;
}

.dossier-mod-card.flaw-mod {
  border-left: 2px solid #f87171;
}

.dossier-mod-top {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.76rem;
  flex-wrap: wrap;
}

.dossier-cat-badge {
  font-size: 0.6rem;
  font-weight: 800;
  text-transform: uppercase;
  padding: 0.1rem 0.35rem;
  border-radius: var(--radius-xs);
}

.dossier-cat-badge.extra {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
}

.dossier-cat-badge.flaw {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

.dossier-mod-name {
  color: var(--text-primary);
}

.dossier-mod-custom-text {
  font-weight: 600;
  color: #93c5fd;
  font-size: 0.85em;
}

.dossier-cost-tag {
  font-size: 0.68rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  margin-left: auto;
}

.dossier-cost-tag.extra { color: #34d399; }
.dossier-cost-tag.flaw { color: #f87171; }

.dossier-rank-badge {
  font-size: 0.65rem;
  font-weight: 800;
  background: rgba(255, 255, 255, 0.08);
  padding: 0.1rem 0.35rem;
  border-radius: var(--radius-xs);
  color: var(--text-secondary);
}

.dossier-mod-desc {
  font-size: 0.8rem;
  line-height: 1.55;
  color: #cbd5e1;
  margin: 0;
}

/* Linked Effects Dossier (Option 1.B: Flat Editorial with Hairline Dividers) */
.linked-suite-hint {
  font-size: 0.68rem;
  color: var(--text-muted);
  font-weight: 500;
  text-transform: none;
  letter-spacing: normal;
  margin-left: auto;
}

.linked-effects-roster {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.linked-full-dossier-card {
  background: transparent;
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 0;
  padding: 0.75rem 0 0.25rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  transition: none;
}

.linked-full-dossier-card:first-child,
.linked-full-dossier-card:first-of-type {
  border-top: none;
  padding-top: 0.15rem;
}

.linked-full-dossier-card:hover {
  border-color: transparent;
}

/* Master Header Card */
.linked-card-master-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  flex-wrap: wrap;
  padding-bottom: 0.35rem;
  border-bottom: none;
}

.linked-master-left {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  flex-wrap: wrap;
  min-width: 0;
  flex: 1;
}

.linked-index-badge {
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  background: rgba(6, 182, 212, 0.16);
  color: #22d3ee;
  border: 1px solid rgba(6, 182, 212, 0.35);
  padding: 0.14rem 0.45rem;
  border-radius: var(--radius-xs);
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  letter-spacing: 0.03em;
  flex-shrink: 0;
}

.linked-title-group {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
}

.linked-title-row {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-wrap: wrap;
}

.linked-heading {
  font-size: 0.94rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0;
  letter-spacing: -0.01em;
}

.linked-effect-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.78rem;
  line-height: 1.25;
  padding: 0.14rem 0.45rem;
  border-radius: 5px;
  background: rgba(6, 182, 212, 0.12);
  border: 1px solid rgba(6, 182, 212, 0.3);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
  white-space: nowrap;
  vertical-align: middle;
}

.linked-effect-chip .linked-effect-name {
  font-size: 0.78rem;
  font-weight: 800;
  color: #22d3ee;
  letter-spacing: 0.01em;
}

.linked-effect-chip .linked-effect-rank {
  font-size: 0.72rem;
  font-weight: 700;
  color: #a5f3fc;
  background: rgba(6, 182, 212, 0.2);
  border: 1px solid rgba(6, 182, 212, 0.25);
  padding: 0.04rem 0.3rem;
  border-radius: 3px;
  font-variant-numeric: tabular-nums;
}



.linked-master-actions {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-left: auto;
  flex-shrink: 0;
}

.linked-dc-tag {
  font-size: 0.74rem;
  font-weight: 800;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.1);
  border: 1px solid rgba(56, 189, 248, 0.25);
  padding: 0.15rem 0.45rem;
  border-radius: var(--radius-xs);
  font-variant-numeric: tabular-nums;
}

.btn-linked-broadcast {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.68rem;
  font-weight: 700;
  background: rgba(6, 182, 212, 0.14);
  border: 1px solid rgba(6, 182, 212, 0.35);
  color: #67e8f9;
  padding: 0.18rem 0.5rem;
  border-radius: var(--radius-xs);
  cursor: pointer;
  transition: all var(--trans-fast);
}

.btn-linked-broadcast:hover {
  background: #0891b2;
  border-color: #06b6d4;
  color: #ffffff;
}

/* Rules Text */
.linked-rules-text {
  font-size: 0.84rem;
  line-height: 1.65;
  color: #e2e8f0;
}

/* Specs Matrix Grid - Exact match with Main Effect */
.linked-specs-grid {
  border-top: none;
  padding-top: 0.45rem;
}

/* Configured Choices Block inside Linked Dossier (De-boxed) */
.linked-config-block {
  background: transparent;
  border: none;
  border-radius: 0;
  padding: 0.35rem 0 0 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.linked-config-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.4rem;
  font-size: 0.72rem;
  font-weight: 800;
  color: #22d3ee;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.linked-choice-card {
  border-color: var(--border-color);
}

/* Applied Modifiers Section inside Linked Dossier */
.linked-mods-container {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding-top: 0.35rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.linked-mod-row {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-wrap: wrap;
  font-size: 0.72rem;
}

.mod-row-label {
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.mod-row-label.extra { color: #34d399; }
.mod-row-label.flaw { color: #f87171; }

.mod-row-tags {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.linked-mods-details-block {
  margin-top: 0.45rem;
  padding-top: 0.4rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.linked-mods-heading {
  font-size: 0.7rem;
  color: #38bdf8;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin-bottom: 0.15rem;
}

.compound-shared-block {
  margin-bottom: 0.5rem;
}


/* Array Stunts Table */
.array-stunts-table {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.stunt-row {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.45rem 0.65rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xs);
  cursor: pointer;
  transition: border-color var(--trans-fast), background-color var(--trans-fast);
}

.stunt-row:hover {
  border-color: #8b5cf6;
  background: rgba(139, 92, 246, 0.08);
}

.stunt-row.active {
  border-color: #8b5cf6;
  background: rgba(139, 92, 246, 0.18);
}

.stunt-status {
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  min-width: 60px;
}

.active-dot { color: #10b981; font-weight: 800; }
.inactive-dot { color: var(--text-muted); }

.stunt-info {
  display: flex;
  flex-direction: column;
  gap: 0.05rem;
  font-size: 0.74rem;
}

.stunt-info strong { color: var(--text-primary); }
.stunt-info span { font-size: 0.68rem; color: var(--text-secondary); }

/* Device & Compound Sub-Power Dossier Cards (Option 1.B: Flat Editorial with Hairline Dividers) */
.dossier-sub-power-card {
  background: transparent;
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 0;
  padding: 0.95rem 0 0.35rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  margin-bottom: 0;
}

.dossier-sub-power-card:first-child,
.dossier-sub-power-card:first-of-type {
  border-top: none;
  padding-top: 0.15rem;
}

.sub-card-master-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding-bottom: 0.35rem;
  border-bottom: none;
}

.sub-sys-badge-lg {
  background: rgba(245, 158, 11, 0.2);
  border: 1px solid rgba(245, 158, 11, 0.4);
  color: #fbbf24;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 0.22rem 0.55rem;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  letter-spacing: 0.06em;
}

.sub-sys-badge-lg.compound-badge {
  background: rgba(99, 102, 241, 0.2);
  border: 1px solid rgba(99, 102, 241, 0.45);
  color: #818cf8;
}

.sub-sys-badge-lg.compound-badge.is-primary {
  background: rgba(234, 179, 8, 0.2);
  border: 1px solid rgba(234, 179, 8, 0.45);
  color: #fbbf24;
}

.sub-sys-title-block {
  flex: 1;
  min-width: 200px;
}

.sub-sys-title-line {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.sub-sys-heading {
  font-size: 1.02rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.015em;
  margin: 0;
  display: inline-flex;
  align-items: center;
}

.sub-effect-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.38rem;
  font-size: 0.82rem;
  line-height: 1.25;
  padding: 0.18rem 0.52rem;
  border-radius: var(--radius-sm, 6px);
  background: rgba(14, 165, 233, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.32);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  white-space: nowrap;
  vertical-align: middle;
}

.sub-effect-chip .sub-effect-name {
  font-size: 0.82rem;
  font-weight: 800;
  color: #38bdf8;
  letter-spacing: 0.01em;
}

.sub-effect-chip .sub-effect-rank {
  font-size: 0.74rem;
  font-weight: 700;
  color: #bae6fd;
  background: rgba(56, 189, 248, 0.18);
  border: 1px solid rgba(56, 189, 248, 0.28);
  padding: 0.04rem 0.35rem;
  border-radius: 3px;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
}

.sub-effect-chip.is-primary-effect {
  background: rgba(245, 158, 11, 0.14);
  border-color: rgba(245, 158, 11, 0.38);
}

.sub-effect-chip.is-primary-effect .sub-effect-name {
  color: #fde047;
}

.sub-effect-chip.is-primary-effect .sub-effect-rank {
  color: #fef08a;
  background: rgba(245, 158, 11, 0.22);
  border-color: rgba(245, 158, 11, 0.32);
}

.sub-array-indicator {
  font-size: 0.72rem;
  font-weight: 700;
  color: #7dd3fc;
  background: rgba(56, 189, 248, 0.1);
  border: 1px solid rgba(56, 189, 248, 0.25);
  padding: 0.14rem 0.45rem;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  white-space: nowrap;
}

.sub-sys-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sub-dc-tag-lg {
  font-size: 0.78rem;
  font-weight: 800;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.3);
  padding: 0.18rem 0.5rem;
  border-radius: 4px;
  font-variant-numeric: tabular-nums;
}

.btn-send-vtt-sub {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: rgba(0, 111, 184, 0.12);
  border: 1px solid rgba(0, 111, 184, 0.3);
  color: #38bdf8;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.18rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all var(--trans-fast);
}

.btn-send-vtt-sub:hover {
  background: var(--accent-primary);
  color: #ffffff;
  border-color: var(--accent-primary);
  box-shadow: var(--shadow-sm);
}

.dossier-head-left {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.active-stunt-mode-title {
  color: #a78bfa;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.sub-dossier-label-flex {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.btn-effect-vtt {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: rgba(56, 189, 248, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.3);
  color: #7dd3fc;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.18rem 0.5rem;
  border-radius: var(--radius-xs);
  cursor: pointer;
  transition: all var(--trans-fast);
}

.btn-effect-vtt:hover {
  background: #0284c7;
  color: #ffffff;
  border-color: #38bdf8;
  box-shadow: 0 0 10px rgba(56, 189, 248, 0.4);
}

.btn-effect-vtt.sub {
  font-size: 0.65rem;
  padding: 0.15rem 0.45rem;
}

.btn-mod-vtt {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.12rem 0.4rem;
  border-radius: var(--radius-xs);
  cursor: pointer;
  transition: all var(--trans-fast);
  border: 1px solid transparent;
}

.btn-mod-vtt.extra {
  background: rgba(16, 185, 129, 0.15);
  border-color: rgba(16, 185, 129, 0.35);
  color: #6ee7b7;
}

.btn-mod-vtt.extra:hover {
  background: #059669;
  border-color: #34d399;
  color: #ffffff;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
}

.btn-mod-vtt.flaw {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.35);
  color: #fca5a5;
}

.btn-mod-vtt.flaw:hover {
  background: #dc2626;
  border-color: #f87171;
  color: #ffffff;
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.4);
}

.btn-mod-vtt.linked {
  background: rgba(6, 182, 212, 0.15);
  border-color: rgba(6, 182, 212, 0.35);
  color: #67e8f9;
}

.btn-mod-vtt.linked:hover {
  background: #0891b2;
  border-color: #22d3ee;
  color: #ffffff;
  box-shadow: 0 0 8px rgba(6, 182, 212, 0.4);
}

.linked-actions {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-left: auto;
}

.sub-dossier-block {
  background: transparent;
  border: none;
  border-radius: 0;
  padding: 0.75rem 0 0 0;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.sub-dossier-block:first-of-type,
.sub-dossier-block:first-child {
  border-top: none;
  padding-top: 0;
}

.sub-dossier-label {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.74rem;
  font-weight: 800;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.sub-dossier-label.array-accent {
  color: #38bdf8;
}

.sub-dossier-label.linked-accent {
  color: #22d3ee;
}

.sub-array-block {
  background: transparent;
  border: none;
  border-top: 1px solid rgba(56, 189, 248, 0.2);
  padding-top: 0.75rem;
}

.sub-linked-block {
  background: transparent;
  border: none;
  border-top: 1px solid rgba(34, 211, 238, 0.2);
  padding-top: 0.75rem;
}

.sub-specs {
  margin-top: 0.15rem;
}

.sub-mods-grid {
  margin-top: 0.15rem;
}

.glance-config-text {
  font-size: 0.68rem;
  color: #38bdf8;
  font-weight: 700;
  margin-left: 0.25rem;
}

.sub-config-text {
  font-size: 0.68rem;
  color: #38bdf8;
  font-weight: 700;
  margin-left: 0.2rem;
}

/* Configured Choices Dossier Block (De-boxed flat editorial) */
.config-choices-block {
  background: transparent;
  border: none;
  border-left: none;
}

.config-choices-block.sub {
  background: transparent;
  border: none;
  border-left: none;
}

.dossier-block-head.config-head {
  color: #38bdf8;
}

.sub-dossier-label.config-head {
  color: #38bdf8;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  justify-content: space-between;
  width: 100%;
}

.dossier-config-badge {
  font-size: 0.68rem;
  font-weight: 800;
  padding: 0.12rem 0.5rem;
  border-radius: var(--radius-pill);
  background: rgba(139, 92, 246, 0.2);
  color: #ddd6fe;
  border: 1px solid rgba(139, 92, 246, 0.35);
  margin-left: auto;
}

.dossier-config-badge.sub {
  font-size: 0.62rem;
  padding: 0.1rem 0.4rem;
}

.config-choices-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.config-choice-card {
  background: transparent;
  border: none;
  border-left: 2px solid rgba(139, 92, 246, 0.45);
  border-radius: 0;
  padding: 0.25rem 0 0.25rem 0.6rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  transition: border-color var(--trans-fast);
}

.config-choice-card:hover {
  border-left-color: rgba(139, 92, 246, 0.8);
}

.config-choice-top {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.88rem;
}

.choice-icon {
  font-size: 1rem;
  color: #c084fc;
}

.choice-name {
  color: #f8fafc;
  font-weight: 800;
  font-size: 0.9rem;
}

.choice-pts {
  font-size: 0.72rem;
  font-weight: 800;
  padding: 0.12rem 0.45rem;
  border-radius: var(--radius-xs);
  background: rgba(168, 85, 247, 0.2);
  color: #f3e8ff;
  border: 1px solid rgba(168, 85, 247, 0.35);
  margin-left: auto;
}

.choice-desc {
  font-size: 0.8rem;
  line-height: 1.55;
  color: #cbd5e1;
  margin: 0;
}

/* ==========================================================================
   DEVICE DOSSIER ALL SYSTEMS ROSTER STYLES (when 'overview' tab is active)
   ========================================================================== */

/* Dossier All Systems Summary Roster (when 'overview' is selected) */
.dossier-all-systems-roster {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.2rem;
}

.dossier-roster-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
  background: rgba(15, 23, 42, 0.55);
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: var(--radius-xs);
  padding: 0.55rem 0.85rem;
  cursor: pointer;
  transition: all var(--trans-fast);
}

.dossier-roster-row:hover {
  background: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.45);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.dossier-roster-row.is-offline {
  opacity: 0.65;
  border-style: dashed;
  background: rgba(15, 23, 42, 0.3);
}

.dossier-roster-row.is-offline .roster-name {
  color: var(--text-muted);
  text-decoration: line-through;
}

.roster-left {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  min-width: 220px;
  flex: 1;
}

.roster-sys-badge {
  font-size: 0.68rem;
  font-weight: 800;
  color: #fbbf24;
  background: rgba(245, 158, 11, 0.18);
  border: 1px solid rgba(245, 158, 11, 0.35);
  padding: 0.12rem 0.42rem;
  border-radius: 3px;
  letter-spacing: 0.04em;
  flex-shrink: 0;
}

.roster-icon {
  font-size: 0.95rem;
  color: #fbbf24;
  flex-shrink: 0;
}

.roster-title-group {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.roster-name {
  font-size: 0.84rem;
  font-weight: 800;
  color: #ffffff;
}

.roster-effect-chip {
  font-size: 0.7rem;
  font-weight: 600;
  color: #fde68a;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.roster-middle {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-wrap: wrap;
}

.roster-meta-pill {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--text-muted);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0.15rem 0.45rem;
  border-radius: 3px;
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
}

.roster-dc-pill {
  font-size: 0.7rem;
  font-weight: 800;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.25);
  padding: 0.15rem 0.45rem;
  border-radius: 3px;
  font-variant-numeric: tabular-nums;
}

.roster-right {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-shrink: 0;
}

.btn-inspect-system {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.35);
  color: #fde68a;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.2rem 0.55rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all var(--trans-fast);
}

.btn-inspect-system:hover {
  background: #f59e0b;
  color: #09090b;
  border-color: #fbbf24;
  font-weight: 800;
  box-shadow: var(--shadow-sm);
}
</style>
