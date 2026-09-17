<template>
  <div class="sheet-card powers-deck-section">
    <div class="card-header-row">
      <div class="card-title-group">
        <i class="ri-flashlight-line icon-primary"></i>
        <h3>Powers & Devices Deck</h3>
        <span class="cost-tag-badge">Custom System</span>
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
      <p>No powers added yet. Click "+ Standard" or "+ Device" to launch Power Studio.</p>
    </div>

    <!-- Powers Cards List -->
    <div v-else class="powers-cards-deck">
      <div
        v-for="(pow, idx) in heroStore.character.powers"
        :key="pow.id || idx"
        class="power-item-card"
        :class="{
          'type-device': pow.type === 'device',
          'type-array': pow.type === 'array',
          'type-standard': pow.type === 'standard',
          'is-deactivated': pow.active === false
        }"
      >
        <!-- Card Top Header -->
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

            <h4 class="pow-name">{{ pow.name || 'Unnamed Power' }}</h4>
            <span class="structure-badge" :class="`badge-${pow.type}`">
              {{ pow.type.toUpperCase() }}
            </span>
            <span v-if="pow.activation && pow.activation !== 'none'" class="activation-flaw-badge">
              <i class="ri-timer-flash-line"></i>
              {{ pow.activation === 'move' ? 'Activation (Move, -1 PP)' : 'Activation (Standard, -2 PP)' }}
            </span>
            <span v-if="pow.type === 'device'" class="device-removable-badge">
              {{ pow.deviceConfig?.type === 'easily_removable' ? 'Easily Removable (-2/5 PP)' : 'Removable (-1/5 PP)' }}
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

        <!-- ================================================================= -->
        <!-- GLANCE SUMMARY (Always visible on card) -->
        <!-- ================================================================= -->
        
        <!-- Case 1: Standard or Array Power Glance -->
        <div v-if="pow.type !== 'device'" class="pow-glance-summary">
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

          <!-- Active Effect Quick Parameters Strip -->
          <div class="glance-params-row">
            <div class="glance-param-pill base">
              <span class="param-k">Effect</span>
              <span class="param-v">
                {{ getActiveEffect(pow).baseEffect }} {{ getActiveEffect(pow).ranks }}R
                <small v-if="getEffectConfigDetails(getActiveEffect(pow))?.quickText" class="glance-config-text">
                  • {{ getEffectConfigDetails(getActiveEffect(pow)).quickText }}
                </small>
              </span>
            </div>
            <div class="glance-param-pill">
              <span class="param-k">Action</span>
              <span class="param-v">{{ getActiveEffect(pow).action || 'Standard' }}</span>
            </div>
            <div class="glance-param-pill">
              <span class="param-k">Range</span>
              <span class="param-v">{{ getActiveEffect(pow).range || 'Close' }}</span>
            </div>
            <div v-if="calculateDC(getActiveEffect(pow))" class="glance-param-pill dc">
              <span class="param-k">Save / DC</span>
              <span class="param-v">{{ calculateDC(getActiveEffect(pow)) }}</span>
            </div>
          </div>

          <!-- Glance Modifier Chips (Extras, Flaws, Linked) -->
          <div
            v-if="(getActiveEffect(pow).extras?.length || 0) + (getActiveEffect(pow).flaws?.length || 0) + (getActiveLinkedEffects(pow)?.length || 0) > 0"
            class="glance-modifiers-row"
          >
            <!-- Extras Badges -->
            <span
              v-for="(extra, eIdx) in getActiveEffect(pow).extras"
              :key="'ge_' + eIdx"
              class="glance-mod-tag extra"
            >
              <i class="ri-add-circle-fill"></i>
              <span>{{ extra.name }}{{ (extra.ranks || 1) > 1 ? ` R${extra.ranks}` : '' }}</span>
            </span>

            <!-- Flaws Badges -->
            <span
              v-for="(flaw, fIdx) in getActiveEffect(pow).flaws"
              :key="'gf_' + fIdx"
              class="glance-mod-tag flaw"
            >
              <i class="ri-indeterminate-circle-fill"></i>
              <span>{{ flaw.name }}{{ (flaw.ranks || 1) > 1 ? ` R${flaw.ranks}` : '' }}</span>
            </span>

            <!-- Linked Effects Badges -->
            <span
              v-for="(link, lIdx) in getActiveLinkedEffects(pow)"
              :key="'gl_' + lIdx"
              class="glance-mod-tag linked"
            >
              <i class="ri-link-m"></i>
              <span>Linked: {{ link.baseEffect || link.name }} {{ link.ranks }}R</span>
            </span>
          </div>
        </div>

        <!-- Case 2: Device Container Glance -->
        <div v-else class="pow-glance-summary device">
          <div class="device-glance-meta">
            <div class="dev-meta-left">
              <span class="dev-desc-tag"><i class="ri-shield-keyhole-line"></i> {{ pow.deviceConfig?.descriptor || 'High-Tech Device' }}</span>
              <span class="dev-stat-tag">Toughness {{ pow.deviceConfig?.toughness || 10 }}</span>
              <span class="dev-count-tag">{{ (pow.devicePowers || []).length }} Systems</span>
            </div>
            <div class="dev-meta-right">
              <span v-if="pow.activation && pow.activation !== 'none'" class="dev-activation-note">
                <i class="ri-timer-flash-line"></i> {{ pow.activation === 'move' ? 'Move Activation' : 'Standard Activation' }}
              </span>
            </div>
          </div>

          <!-- Systems Tab Switcher Bar -->
          <div class="device-systems-nav-bar">
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

              <!-- Overview Tab -->
              <button
                type="button"
                class="device-tab-item overview-tab"
                :class="{ active: getActiveDeviceSubIndex(pow.id || idx) === 'overview' }"
                @click="setActiveDeviceSubIndex(pow.id || idx, 'overview')"
                title="View All Systems Summary Table"
              >
                <i class="ri-dashboard-line"></i>
                <span>All Systems</span>
              </button>
            </div>
          </div>

          <!-- TAB VIEW 1: Focused Active Sub-System Console -->
          <template v-if="getActiveDeviceSubIndex(pow.id || idx) !== 'overview'">
            <div
              v-if="(pow.devicePowers || [])[getActiveDeviceSubIndex(pow.id || idx)]"
              class="device-active-system-card"
              :class="{ 'is-card-offline': (pow.devicePowers || [])[getActiveDeviceSubIndex(pow.id || idx)].active === false || pow.active === false }"
            >
              <!-- Card Top Row: Mini Toggle, Name, Effect, DC, Broadcast -->
              <div class="active-sys-top-bar">
                <div class="active-sys-identity">
                  <button
                    type="button"
                    class="sub-power-toggle-btn"
                    :class="{
                      'is-active': (pow.devicePowers || [])[getActiveDeviceSubIndex(pow.id || idx)].active !== false && pow.active !== false,
                      'is-off': (pow.devicePowers || [])[getActiveDeviceSubIndex(pow.id || idx)].active === false || pow.active === false
                    }"
                    :disabled="pow.active === false"
                    :title="pow.active === false ? 'Parent device is Offline' : ((pow.devicePowers || [])[getActiveDeviceSubIndex(pow.id || idx)].active !== false ? 'System is Active (Click to Deactivate)' : 'System is Offline (Click to Activate)')"
                    @click.stop="handleToggleSubPower(pow, getActiveDeviceSubIndex(pow.id || idx), (pow.devicePowers || [])[getActiveDeviceSubIndex(pow.id || idx)])"
                  >
                    <i :class="(pow.devicePowers || [])[getActiveDeviceSubIndex(pow.id || idx)].active !== false && pow.active !== false ? 'ri-checkbox-circle-fill' : 'ri-close-circle-line'"></i>
                    <span class="sub-toggle-text">{{ (pow.devicePowers || [])[getActiveDeviceSubIndex(pow.id || idx)].active !== false && pow.active !== false ? 'ONLINE' : 'OFFLINE' }}</span>
                  </button>

                  <strong class="active-sys-name">{{ (pow.devicePowers || [])[getActiveDeviceSubIndex(pow.id || idx)].name }}</strong>

                  <span class="active-sys-effect-badge">
                    {{ getSubPowerActiveEffect((pow.devicePowers || [])[getActiveDeviceSubIndex(pow.id || idx)]).baseEffect }}
                    {{ getSubPowerActiveEffect((pow.devicePowers || [])[getActiveDeviceSubIndex(pow.id || idx)]).ranks }}R
                    <small v-if="getEffectConfigDetails(getSubPowerActiveEffect((pow.devicePowers || [])[getActiveDeviceSubIndex(pow.id || idx)]))?.quickText" class="active-sys-config-text">
                      • {{ getEffectConfigDetails(getSubPowerActiveEffect((pow.devicePowers || [])[getActiveDeviceSubIndex(pow.id || idx)])).quickText }}
                    </small>
                  </span>
                </div>

                <div class="active-sys-actions">
                  <span v-if="calculateDC(getSubPowerActiveEffect((pow.devicePowers || [])[getActiveDeviceSubIndex(pow.id || idx)]))" class="sub-dc-pill">
                    {{ calculateDC(getSubPowerActiveEffect((pow.devicePowers || [])[getActiveDeviceSubIndex(pow.id || idx)])) }}
                  </span>
                  <button
                    type="button"
                    class="btn-send-vtt-xs"
                    title="Broadcast this Sub-System to Roll20"
                    @click.stop="broadcastSubPower(pow, (pow.devicePowers || [])[getActiveDeviceSubIndex(pow.id || idx)], getActiveDeviceSubIndex(pow.id || idx))"
                  >
                    <i class="ri-broadcast-line"></i>
                  </button>
                </div>
              </div>

              <!-- Parameters Strip -->
              <div class="active-sys-params-strip">
                <span class="active-sys-param">
                  <i class="ri-timer-line"></i> Action: <strong>{{ getSubPowerActiveEffect((pow.devicePowers || [])[getActiveDeviceSubIndex(pow.id || idx)]).action || 'Standard' }}</strong>
                </span>
                <span class="active-sys-param">
                  <i class="ri-crosshair-2-line"></i> Range: <strong>{{ formatRange(getSubPowerActiveEffect((pow.devicePowers || [])[getActiveDeviceSubIndex(pow.id || idx)])) }}</strong>
                </span>
                <span class="active-sys-param">
                  <i class="ri-time-line"></i> Duration: <strong>{{ getSubPowerActiveEffect((pow.devicePowers || [])[getActiveDeviceSubIndex(pow.id || idx)]).duration || 'Instant' }}</strong>
                </span>
                <span v-if="calculateDC(getSubPowerActiveEffect((pow.devicePowers || [])[getActiveDeviceSubIndex(pow.id || idx)])) && getSubPowerActiveEffect((pow.devicePowers || [])[getActiveDeviceSubIndex(pow.id || idx)]).resistance" class="active-sys-param">
                  <i class="ri-shield-line"></i> vs <strong>{{ getSubPowerActiveEffect((pow.devicePowers || [])[getActiveDeviceSubIndex(pow.id || idx)]).resistance }}</strong>
                </span>
              </div>

              <!-- Array Stunt Switcher Pills (if sub has Alternate Effects) -->
              <div v-if="(pow.devicePowers || [])[getActiveDeviceSubIndex(pow.id || idx)].alternateEffects?.length > 0" class="sub-array-pills-wrap">
                <span class="sub-pills-label"><i class="ri-shuffle-line"></i> Mode:</span>
                <div class="sub-mode-pills" @click.stop>
                  <button
                    type="button"
                    class="sub-mode-pill"
                    :class="{ active: ((pow.devicePowers || [])[getActiveDeviceSubIndex(pow.id || idx)].activeSlotId || 'main') === 'main' }"
                    @click="heroStore.setActiveDeviceSubSlot(pow.id, getActiveDeviceSubIndex(pow.id || idx), 'main')"
                  >
                    ★ {{ (pow.devicePowers || [])[getActiveDeviceSubIndex(pow.id || idx)].effect?.name || 'Primary' }}
                  </button>
                  <button
                    v-for="alt in (pow.devicePowers || [])[getActiveDeviceSubIndex(pow.id || idx)].alternateEffects"
                    :key="'pill_' + alt.id"
                    type="button"
                    class="sub-mode-pill"
                    :class="{ active: (pow.devicePowers || [])[getActiveDeviceSubIndex(pow.id || idx)].activeSlotId === alt.id }"
                    @click="heroStore.setActiveDeviceSubSlot(pow.id, getActiveDeviceSubIndex(pow.id || idx), alt.id)"
                  >
                    {{ alt.name }}
                  </button>
                </div>
              </div>

              <!-- Linked & Modifiers Row -->
              <div
                v-if="getSubPowerActiveLinkedEffects((pow.devicePowers || [])[getActiveDeviceSubIndex(pow.id || idx)]).length > 0 ||
                      (getSubPowerActiveEffect((pow.devicePowers || [])[getActiveDeviceSubIndex(pow.id || idx)]).extras?.length || 0) + (getSubPowerActiveEffect((pow.devicePowers || [])[getActiveDeviceSubIndex(pow.id || idx)]).flaws?.length || 0) > 0"
                class="active-sys-mods-strip"
              >
                <!-- Linked badges -->
                <span
                  v-for="(lnk, lIdx) in getSubPowerActiveLinkedEffects((pow.devicePowers || [])[getActiveDeviceSubIndex(pow.id || idx)])"
                  :key="'slnk_' + lIdx"
                  class="sub-linked-badge"
                >
                  <i class="ri-links-line"></i> +Linked: {{ lnk.name || lnk.baseEffect }} ({{ lnk.ranks }}R)
                </span>

                <!-- Extras -->
                <span
                  v-for="e in getSubPowerActiveEffect((pow.devicePowers || [])[getActiveDeviceSubIndex(pow.id || idx)]).extras"
                  :key="'e_' + e.name"
                  class="glance-mod-tag extra"
                >
                  +{{ e.name }}
                </span>

                <!-- Flaws -->
                <span
                  v-for="f in getSubPowerActiveEffect((pow.devicePowers || [])[getActiveDeviceSubIndex(pow.id || idx)]).flaws"
                  :key="'f_' + f.name"
                  class="glance-mod-tag flaw"
                >
                  -{{ f.name }}
                </span>
              </div>
            </div>
          </template>

          <!-- TAB VIEW 2: Overview Dense List (When 'overview' is selected) -->
          <div v-else class="device-overview-dense-list">
            <div
              v-for="(sub, sIdx) in (pow.devicePowers || [])"
              :key="'ov_' + (sub.id || sIdx)"
              class="overview-row-item"
              :class="{ 'is-offline': sub.active === false || pow.active === false }"
              @click="setActiveDeviceSubIndex(pow.id || idx, sIdx)"
            >
              <div class="ov-left">
                <button
                  type="button"
                  class="sub-power-toggle-btn mini"
                  :class="{
                    'is-active': sub.active !== false && pow.active !== false,
                    'is-off': sub.active === false || pow.active === false
                  }"
                  :disabled="pow.active === false"
                  @click.stop="handleToggleSubPower(pow, sIdx, sub)"
                >
                  <i :class="sub.active !== false && pow.active !== false ? 'ri-checkbox-circle-fill' : 'ri-close-circle-line'"></i>
                </button>
                <i :class="getEffectIcon(getSubPowerActiveEffect(sub).baseEffect)" class="ov-icon"></i>
                <strong class="ov-name">{{ sub.name }}</strong>
                <span class="ov-effect-badge">
                  {{ getSubPowerActiveEffect(sub).baseEffect }} {{ getSubPowerActiveEffect(sub).ranks }}R
                  <small v-if="getEffectConfigDetails(getSubPowerActiveEffect(sub))?.quickText" class="ov-config-text">
                    ({{ getEffectConfigDetails(getSubPowerActiveEffect(sub)).quickText }})
                  </small>
                </span>
              </div>

              <div class="ov-right">
                <span class="ov-action-chip">{{ getSubPowerActiveEffect(sub).action || 'Std' }}</span>
                <span v-if="calculateDC(getSubPowerActiveEffect(sub))" class="ov-dc-chip">
                  {{ calculateDC(getSubPowerActiveEffect(sub)) }}
                </span>
                <button
                  type="button"
                  class="btn-send-vtt-xs"
                  title="Broadcast this system to Roll20"
                  @click.stop="broadcastSubPower(pow, sub, sIdx)"
                >
                  <i class="ri-broadcast-line"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ================================================================= -->
        <!-- EXPANDED DOSSIER DRAWER (Slide-down with detailed rules & mechanics) -->
        <!-- ================================================================= -->
        <div v-if="isExpanded(pow.id || idx)" class="pow-expanded-drawer">
          <!-- Standard / Array Detailed Breakdown -->
          <div v-if="pow.type !== 'device'" class="drawer-content-flow">
            <!-- 1. Base Effect Official Rules & Mechanics -->
            <div class="dossier-block effect-rules-block">
              <div class="dossier-block-head">
                <div class="dossier-head-left">
                  <i class="ri-book-open-line"></i>
                  <span>Base Effect: {{ getActiveEffect(pow).baseEffect }} (Rank {{ getActiveEffect(pow).ranks }})</span>
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
              <p class="dossier-desc-text">
                {{ getEffectDesc(getActiveEffect(pow).baseEffect) }}
              </p>
              <div class="dossier-specs-grid">
                <div class="spec-item">
                  <span class="spec-label">Action</span>
                  <span class="spec-value">{{ getActiveEffect(pow).action || 'Standard' }}</span>
                </div>
                <div class="spec-item">
                  <span class="spec-label">Range</span>
                  <span class="spec-value">{{ formatRange(getActiveEffect(pow)) }}</span>
                </div>
                <div class="spec-item">
                  <span class="spec-label">Duration</span>
                  <span class="spec-value">{{ getActiveEffect(pow).duration || 'Instant' }}</span>
                </div>
                <div v-if="calculateDC(getActiveEffect(pow))" class="spec-item">
                  <span class="spec-label">Resistance Check</span>
                  <span class="spec-value highlight">{{ calculateDC(getActiveEffect(pow)) }}</span>
                </div>
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
                    <span class="dossier-cat-badge extra">{{ getModifierInfo(extra.name, false).category }}</span>
                    <strong class="dossier-mod-name">{{ extra.name }}</strong>
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
                    <span class="dossier-cat-badge flaw">{{ getModifierInfo(flaw.name, true).category }}</span>
                    <strong class="dossier-mod-name">{{ flaw.name }}</strong>
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
                <i class="ri-links-line"></i>
                <span>Simultaneous Linked Effects ({{ getActiveLinkedEffects(pow).length }})</span>
              </div>
              <div class="linked-effects-roster">
                <div
                  v-for="(linked, lIdx) in getActiveLinkedEffects(pow)"
                  :key="'dl_' + lIdx"
                  class="dossier-linked-card"
                >
                  <div class="linked-card-top">
                    <div class="linked-id-group">
                      <span class="linked-chain-badge"><i class="ri-link-m"></i> Linked</span>
                      <strong class="linked-name">{{ linked.name || linked.baseEffect }}</strong>
                      <span class="linked-ranks-pill">Rank {{ linked.ranks }}</span>
                    </div>
                    <div class="linked-actions">
                      <span class="linked-dc-pill">{{ calculateDC(linked) }}</span>
                      <button
                        type="button"
                        class="btn-mod-vtt linked"
                        title="Broadcast Linked Effect to Roll20"
                        @click.stop="broadcastEffect(pow, linked, true)"
                      >
                        <i class="ri-broadcast-line"></i>
                        <span>Roll20</span>
                      </button>
                    </div>
                  </div>
                  <p class="dossier-desc-text sub">{{ getEffectDesc(linked.baseEffect) }}</p>
                  <div class="linked-specs-row">
                    <span><strong>Action:</strong> {{ linked.action || 'Standard' }}</span>
                    <span><strong>Range:</strong> {{ linked.range || 'Close' }}</span>
                    <span><strong>Resist:</strong> {{ linked.resistance || 'Fortitude' }}</span>
                    <span v-if="linked.extras?.length > 0" class="linked-extras-text">
                      <strong>+Extras:</strong> {{ linked.extras.map(e => e.name).join(', ') }}
                    </span>
                    <span v-if="linked.flaws?.length > 0" class="linked-flaws-text">
                      <strong>-Flaws:</strong> {{ linked.flaws.map(f => f.name).join(', ') }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 5. Array Stunts Explorer (if Array or has Alternate Effects) -->
            <div v-if="pow.alternateEffects?.length > 0" class="dossier-block array-stunts-block">
              <div class="dossier-block-head array-head">
                <i class="ri-shuffle-line"></i>
                <span>Alternate Array Stunt Modes ({{ pow.alternateEffects.length + 1 }} Total)</span>
              </div>
              <div class="array-stunts-table">
                <div
                  class="stunt-row"
                  :class="{ active: (pow.activeSlotId || 'main') === 'main' }"
                  @click="heroStore.setActivePowerSlot(pow.id, 'main')"
                >
                  <div class="stunt-status">
                    <span v-if="(pow.activeSlotId || 'main') === 'main'" class="active-dot">• ACTIVE</span>
                    <span v-else class="inactive-dot">Anchor</span>
                  </div>
                  <div class="stunt-info">
                    <strong>★ {{ pow.mainEffect?.name || 'Primary' }}</strong>
                    <span>{{ pow.mainEffect?.baseEffect }} {{ pow.mainEffect?.ranks }}R ({{ pow.mainEffect?.range || 'Close' }}, {{ calculateDC(pow.mainEffect) }})</span>
                  </div>
                </div>
                <div
                  v-for="alt in pow.alternateEffects"
                  :key="'alt_row_' + alt.id"
                  class="stunt-row"
                  :class="{ active: pow.activeSlotId === alt.id }"
                  @click="heroStore.setActivePowerSlot(pow.id, alt.id)"
                >
                  <div class="stunt-status">
                    <span v-if="pow.activeSlotId === alt.id" class="active-dot">• ACTIVE</span>
                    <span v-else class="inactive-dot">Alternate</span>
                  </div>
                  <div class="stunt-info">
                    <strong>{{ alt.name }}</strong>
                    <span>{{ alt.effect?.baseEffect }} {{ alt.effect?.ranks }}R ({{ alt.effect?.range || 'Close' }}, {{ calculateDC(alt.effect) }})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Device Container Detailed Breakdown -->
          <div v-else class="drawer-content-flow device-flow">
            <div class="dossier-block device-meta-block">
              <div class="dossier-block-head dev-head">
                <i class="ri-shield-keyhole-line"></i>
                <span>Device Specifications</span>
              </div>
              <div class="dossier-specs-grid">
                <div class="spec-item">
                  <span class="spec-label">Container Type</span>
                  <span class="spec-value">{{ pow.deviceConfig?.type === 'easily_removable' ? 'Easily Removable (-2/5 PP)' : 'Removable (-1/5 PP)' }}</span>
                </div>
                <div class="spec-item">
                  <span class="spec-label">Item Toughness</span>
                  <span class="spec-value">Toughness {{ pow.deviceConfig?.toughness || 10 }}</span>
                </div>
                <div class="spec-item">
                  <span class="spec-label">Descriptor</span>
                  <span class="spec-value">{{ pow.deviceConfig?.descriptor || 'Personal Gear' }}</span>
                </div>
              </div>
            </div>



            <!-- Tab 1: Single Focused Sub-System Details Dossier -->
            <template v-if="getActiveDeviceSubIndex(pow.id || idx) !== 'overview' && (pow.devicePowers || []).length > 0">
              <div
                v-for="({ sub, idx: sIdx }) in [getSelectedDeviceSub(pow, pow.id || idx)]"
                :key="'dsub_' + sIdx"
                class="dossier-sub-power-card"
              >
                <!-- Sub-System Master Header -->
                <div class="sub-card-master-header">
                <div class="sub-sys-badge-lg">
                  <i class="ri-flashlight-fill"></i>
                  <span>SYS-{{ sIdx + 1 < 10 ? '0' + (sIdx + 1) : (sIdx + 1) }}</span>
                </div>
                <div class="sub-sys-title-block">
                  <div class="sub-sys-title-line">
                    <h4 class="sub-sys-heading">{{ sub.name }}</h4>
                    <span class="sub-effect-chip">{{ getSubPowerActiveEffect(sub).baseEffect }} (Rank {{ getSubPowerActiveEffect(sub).ranks }})</span>
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

              <!-- Sub Base Effect Rules & Mechanics -->
              <div class="sub-dossier-block sub-rules-block">
                <div class="sub-dossier-label sub-dossier-label-flex">
                  <div class="dossier-head-left">
                    <i class="ri-book-open-line"></i>
                    <span>Active Effect Mechanics: {{ getSubPowerActiveEffect(sub).baseEffect }}</span>
                  </div>
                  <button
                    type="button"
                    class="btn-effect-vtt sub"
                    title="Broadcast Sub-Effect rules to Roll20"
                    @click.stop="broadcastEffect({ name: `${pow.name} - ${sub.name}` }, getSubPowerActiveEffect(sub))"
                  >
                    <i class="ri-broadcast-line"></i>
                    <span>Broadcast Effect</span>
                  </button>
                </div>
                <p class="dossier-desc-text sub">{{ getEffectDesc(getSubPowerActiveEffect(sub).baseEffect) }}</p>
                <div class="dossier-specs-grid sub-specs">
                  <div class="spec-item">
                    <span class="spec-label">Action</span>
                    <span class="spec-value">{{ getSubPowerActiveEffect(sub).action || 'Standard' }}</span>
                  </div>
                  <div class="spec-item">
                    <span class="spec-label">Range</span>
                    <span class="spec-value">{{ formatRange(getSubPowerActiveEffect(sub)) }}</span>
                  </div>
                  <div class="spec-item">
                    <span class="spec-label">Duration</span>
                    <span class="spec-value">{{ getSubPowerActiveEffect(sub).duration || 'Instant' }}</span>
                  </div>
                  <div v-if="calculateDC(getSubPowerActiveEffect(sub))" class="spec-item">
                    <span class="spec-label">Resistance</span>
                    <span class="spec-value">{{ getSubPowerActiveEffect(sub).resistance ? `DC Check vs ${getSubPowerActiveEffect(sub).resistance}` : 'None' }}</span>
                  </div>
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

              <!-- Array Stunt Matrix (if sub-power has Alternate Effects) -->
              <div v-if="sub.alternateEffects?.length > 0" class="sub-dossier-block sub-array-block">
                <div class="sub-dossier-label array-accent">
                  <i class="ri-shuffle-line"></i>
                  <span>Sub-System Array Stunts ({{ sub.alternateEffects.length + 1 }} Modes Available)</span>
                </div>
                <div class="array-stunts-table">
                  <div
                    class="stunt-row"
                    :class="{ active: (sub.activeSlotId || 'main') === 'main' }"
                    @click="heroStore.setActiveDeviceSubSlot(pow.id, sIdx, 'main')"
                  >
                    <div class="stunt-status">
                      <span v-if="(sub.activeSlotId || 'main') === 'main'" class="active-dot">• ACTIVE</span>
                      <span v-else class="inactive-dot">Anchor</span>
                    </div>
                    <div class="stunt-info">
                      <strong>★ {{ sub.effect?.name || 'Primary Mode' }}</strong>
                      <span>{{ sub.effect?.baseEffect }} {{ sub.effect?.ranks }}R ({{ sub.effect?.range || 'Close' }}, {{ calculateDC(sub.effect) }})</span>
                    </div>
                  </div>
                  <div
                    v-for="alt in sub.alternateEffects"
                    :key="'sub_alt_row_' + alt.id"
                    class="stunt-row"
                    :class="{ active: sub.activeSlotId === alt.id }"
                    @click="heroStore.setActiveDeviceSubSlot(pow.id, sIdx, alt.id)"
                  >
                    <div class="stunt-status">
                      <span v-if="sub.activeSlotId === alt.id" class="active-dot">• ACTIVE</span>
                      <span v-else class="inactive-dot">Alternate</span>
                    </div>
                    <div class="stunt-info">
                      <strong>{{ alt.name }}</strong>
                      <span>{{ alt.effect?.baseEffect }} {{ alt.effect?.ranks }}R ({{ alt.effect?.range || 'Close' }}, {{ calculateDC(alt.effect) }})</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Simultaneous Linked Effects Pod (if sub-power has linked effects) -->
              <div v-if="getSubPowerActiveLinkedEffects(sub).length > 0" class="sub-dossier-block sub-linked-block">
                <div class="sub-dossier-label linked-accent">
                  <i class="ri-links-line"></i>
                  <span>Simultaneous Linked Sub-Effects ({{ getSubPowerActiveLinkedEffects(sub).length }})</span>
                </div>
                <div class="linked-effects-roster">
                  <div
                    v-for="(linked, lIdx) in getSubPowerActiveLinkedEffects(sub)"
                    :key="'sub_dl_' + lIdx"
                    class="dossier-linked-card"
                  >
                    <div class="linked-card-top">
                      <div class="linked-id-group">
                        <span class="linked-chain-badge"><i class="ri-link-m"></i> Linked</span>
                        <strong class="linked-name">{{ linked.name || linked.baseEffect }}</strong>
                        <span class="linked-ranks-pill">Rank {{ linked.ranks }}</span>
                      </div>
                      <div class="linked-actions">
                        <span class="linked-dc-pill">{{ calculateDC(linked) }}</span>
                        <button
                          type="button"
                          class="btn-mod-vtt linked"
                          title="Broadcast Linked Effect to Roll20"
                          @click.stop="broadcastEffect({ name: `${pow.name} - ${sub.name}` }, linked, true)"
                        >
                          <i class="ri-broadcast-line"></i>
                          <span>Roll20</span>
                        </button>
                      </div>
                    </div>
                    <p class="dossier-desc-text sub">{{ getEffectDesc(linked.baseEffect) }}</p>
                    <div class="linked-specs-row">
                      <span><strong>Action:</strong> {{ linked.action || 'Standard' }}</span>
                      <span><strong>Range:</strong> {{ linked.range || 'Close' }}</span>
                      <span><strong>Resist:</strong> {{ linked.resistance || 'Fortitude' }}</span>
                      <span v-if="linked.extras?.length > 0" class="linked-extras-text">
                        <strong>+Extras:</strong> {{ linked.extras.map(e => e.name).join(', ') }}
                      </span>
                      <span v-if="linked.flaws?.length > 0" class="linked-flaws-text">
                        <strong>-Flaws:</strong> {{ linked.flaws.map(f => f.name).join(', ') }}
                      </span>
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
                      <span class="dossier-cat-badge extra">{{ getModifierInfo(extra.name, false).category }}</span>
                      <strong class="dossier-mod-name">{{ extra.name }}</strong>
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
                      <span class="dossier-cat-badge flaw">{{ getModifierInfo(flaw.name, true).category }}</span>
                      <strong class="dossier-mod-name">{{ flaw.name }}</strong>
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

          <!-- Tab 2: All Systems Summary Roster (when 'overview' tab is active) -->
          <div v-else class="dossier-all-systems-roster">
            <div
              v-for="(sItem, sI) in (pow.devicePowers || [])"
              :key="'dall_' + (sItem.id || sI)"
              class="dossier-roster-row"
              :class="{ 'is-offline': sItem.active === false || pow.active === false }"
              @click="setActiveDeviceSubIndex(pow.id || idx, sI)"
            >
              <div class="roster-left">
                <span class="roster-sys-badge">SYS-{{ sI + 1 < 10 ? '0' + (sI + 1) : (sI + 1) }}</span>
                <button
                  type="button"
                  class="sub-power-toggle-btn mini"
                  :class="{
                    'is-active': sItem.active !== false && pow.active !== false,
                    'is-off': sItem.active === false || pow.active === false
                  }"
                  :disabled="pow.active === false"
                  title="Toggle System Active / Offline"
                  @click.stop="handleToggleSubPower(pow, sI, sItem)"
                >
                  <i :class="sItem.active !== false && pow.active !== false ? 'ri-checkbox-circle-fill' : 'ri-close-circle-line'"></i>
                </button>
                <i :class="getEffectIcon(getSubPowerActiveEffect(sItem).baseEffect)" class="roster-icon"></i>
                <div class="roster-title-group">
                  <strong class="roster-name">{{ sItem.name }}</strong>
                  <span class="roster-effect-chip">
                    {{ getSubPowerActiveEffect(sItem).baseEffect }} (Rank {{ getSubPowerActiveEffect(sItem).ranks }})
                    <small v-if="getEffectConfigDetails(getSubPowerActiveEffect(sItem))?.quickText">
                      • {{ getEffectConfigDetails(getSubPowerActiveEffect(sItem)).quickText }}
                    </small>
                  </span>
                </div>
              </div>

              <div class="roster-middle">
                <span class="roster-meta-pill"><i class="ri-timer-line"></i> {{ getSubPowerActiveEffect(sItem).action || 'Standard' }}</span>
                <span class="roster-meta-pill"><i class="ri-crosshair-2-line"></i> {{ formatRange(getSubPowerActiveEffect(sItem)) }}</span>
                <span v-if="calculateDC(getSubPowerActiveEffect(sItem))" class="roster-dc-pill">
                  {{ calculateDC(getSubPowerActiveEffect(sItem)) }}
                </span>
              </div>

              <div class="roster-right">
                <button
                  type="button"
                  class="btn-send-vtt-sub"
                  title="Broadcast this Sub-System to Roll20"
                  @click.stop="broadcastSubPower(pow, sItem, sI)"
                >
                  <i class="ri-broadcast-line"></i>
                  <span>Roll20</span>
                </button>
                <button
                  type="button"
                  class="btn-inspect-system"
                  title="Inspect System Mechanics"
                  @click.stop="setActiveDeviceSubIndex(pow.id || idx, sI)"
                >
                  <span>Details</span>
                  <i class="ri-arrow-right-s-line"></i>
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

<script setup>
import { ref, computed } from 'vue';
import { useHeroStore } from '../../stores/heroStore.js';
import { usePowerBuilderStore } from '../../stores/powerBuilderStore.js';
import { useUiStore } from '../../stores/uiStore.js';
import { BASE_EFFECTS, EXTRAS, FLAWS, CONFIGURABLE_EFFECTS, calculatePowerTotalCost } from '../../rules/powerEngine.js';
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
    return `${m.name || 'Modifier'}${rkPart}${costPart}`;
  }).join(', ');
}

function formatLinkedEffectsList(list) {
  if (!Array.isArray(list) || list.length === 0) return '';
  return list.map(le => {
    const dcStr = calculateDC(le);
    return `${le.baseEffect || 'Effect'} (Rank ${le.ranks || 1}${dcStr ? ', ' + dcStr : ''})`;
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
    const first = c.firstDegree || 'Dazed';
    const second = c.secondDegree || 'Stunned';
    const third = c.thirdDegree || 'Paralyzed';
    const res = c.resistance || eff.resistance || 'Fortitude';

    return {
      type: 'affliction',
      title: 'Conditions & Degrees of Failure',
      badge: `Resisted by ${res}`,
      quickText: `${first} / ${second} / ${third}`,
      items: [
        { name: '1st Degree', desc: `Target suffers: ${first}`, icon: 'ri-error-warning-line' },
        { name: '2nd Degree', desc: `Target suffers: ${second}`, icon: 'ri-alert-line' },
        { name: '3rd Degree', desc: `Target suffers: ${third}`, icon: 'ri-skull-line' }
      ]
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
  if (pow.type === 'array') {
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

  // Device context
  let deviceType = '';
  let deviceSystems = '';
  if (pow.type === 'device') {
    deviceType = pow.deviceConfig?.type === 'easily_removable' ? 'Easily Removable (-2/5 PP)' : 'Removable (-1/5 PP)';
    if (Array.isArray(pow.devicePowers) && pow.devicePowers.length > 0) {
      deviceSystems = pow.devicePowers.map((s, idx) => {
        const sEff = getSubPowerActiveEffect(s);
        const sStatus = (pow.active !== false && s.active !== false) ? 'ONLINE' : 'OFFLINE';
        return `[${sStatus}] ${s.name || `System ${idx + 1}`} (${sEff.baseEffect || 'Effect'} Rank ${sEff.ranks || 1})`;
      }).join('; ');
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
    arrayContext: pow.type === 'array',
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

  sendFeatureToVTT({
    name: subPow.name || `System ${subIdx + 1}`,
    systemName: subPow.name || `System ${subIdx + 1}`,
    parentDevice: parentPow.name || 'Device Container',
    category: 'device_subpower',
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

  uiStore.showToast(`Broadcasted sub-system "${subPow.name || 'System'}" to Roll20!`, 'info');
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

  sendFeatureToVTT({
    name: `${effect.baseEffect || 'Effect'}`,
    category: 'power_effect',
    parentPower: parentName,
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

  uiStore.showToast(`Broadcasted effect "${effect.baseEffect}" to Roll20!`, 'info');
}

function broadcastExtra(pow, extra, parentEffectName = null) {
  if (!extra || !extra.name) return;
  const modInfo = getModifierInfo(extra.name, false);
  const category = modInfo.category || 'Combat & Utility Extra';
  const rules = extra.desc || modInfo.desc || '';
  const costSign = extra.cost >= 0 ? `+${extra.cost}` : `${extra.cost}`;
  const costModifier = `${costSign} ${extra.type === 'per_rank' ? 'PP/r' : 'Flat'}`;
  const parentPowerName = pow ? (pow.name || 'Power') : '';
  const effName = parentEffectName || (pow ? getActiveEffect(pow)?.baseEffect : '');

  sendFeatureToVTT({
    name: extra.name,
    category: 'power_extra',
    parentPower: parentPowerName,
    effectName: effName,
    category,
    ranks: extra.ranks || 1,
    cost: costModifier,
    rules,
    description: rules
  }, heroStore.character);

  uiStore.showToast(`Broadcasted Extra "${extra.name}" to Roll20!`, 'info');
}

function broadcastFlaw(pow, flaw, parentEffectName = null) {
  if (!flaw || !flaw.name) return;
  const modInfo = getModifierInfo(flaw.name, true);
  const category = modInfo.category || 'Limitation Flaw';
  const rules = flaw.desc || modInfo.desc || '';
  const costModifier = `${flaw.cost} ${flaw.type === 'per_rank' ? 'PP/r' : 'Flat'}`;
  const parentPowerName = pow ? (pow.name || 'Power') : '';
  const effName = parentEffectName || (pow ? getActiveEffect(pow)?.baseEffect : '');

  sendFeatureToVTT({
    name: flaw.name,
    category: 'power_flaw',
    parentPower: parentPowerName,
    effectName: effName,
    category,
    ranks: flaw.ranks || 1,
    cost: costModifier,
    rules,
    description: rules
  }, heroStore.character);

  uiStore.showToast(`Broadcasted Flaw "${flaw.name}" to Roll20!`, 'info');
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

function getEffectIcon(baseEffect) {
  const base = (baseEffect || '').toLowerCase();
  if (['damage', 'blast', 'strike'].includes(base)) return 'ri-sword-fill';
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
  if (pow.type === 'array' && pow.activeSlotId && pow.activeSlotId !== 'main') {
    const alt = (pow.alternateEffects || []).find(a => a.id === pow.activeSlotId);
    if (alt && alt.effect) return alt.effect;
  }
  return pow.mainEffect || {};
}

function getActiveLinkedEffects(pow) {
  if (pow.type === 'array' && pow.activeSlotId && pow.activeSlotId !== 'main') {
    const alt = (pow.alternateEffects || []).find(a => a.id === pow.activeSlotId);
    if (alt && alt.linkedEffects) return alt.linkedEffects;
  }
  return pow.linkedEffects || [];
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
  if (base === 'damage') {
    return `DC ${15 + ranks} vs ${eff.resistance || 'Toughness'}`;
  }
  if (['affliction', 'weaken', 'nullify', 'mind control'].includes(base)) {
    return `DC ${10 + ranks} vs ${eff.resistance || 'Fortitude'}`;
  }
  const nonResistanceEffects = [
    'senses', 'enhanced trait', 'movement', 'immunity', 'flight', 'speed', 'quickness',
    'leaping', 'swimming', 'growth', 'shrinking', 'morph', 'variable', 'comprehend',
    'feature', 'protection', 'regeneration', 'immortality', 'elongation', 'invisibility',
    'insubstantial', 'burrowing', 'teleport', 'deflect', 'healing', 'remote sensing',
    'create', 'illusion', 'transform', 'communication', 'luck control'
  ];
  if (nonResistanceEffects.includes(base) || eff.action === 'None' || (!eff.resistance || eff.resistance === 'None')) {
    return '';
  }
  return eff.resistance && eff.resistance !== 'Toughness' ? `vs ${eff.resistance}` : '';
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
  color: #f43f5e;
  background: rgba(225, 29, 72, 0.12);
  border: 1px solid rgba(225, 29, 72, 0.3);
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

.power-item-card.type-device { border-left: 3px solid #f59e0b; }
.power-item-card.type-array { border-left: 3px solid #8b5cf6; }
.power-item-card.type-standard { border-left: 3px solid #3b82f6; }

.pow-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.pow-title-area {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  flex-wrap: wrap;
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
  font-size: 0.95rem;
  font-weight: 800;
  color: #fff;
  margin: 0;
}

.structure-badge {
  font-size: 0.62rem;
  font-weight: 800;
  padding: 0.1rem 0.45rem;
  border-radius: var(--radius-xs);
  letter-spacing: var(--letter-spacing-caps);
}

.badge-device { background: rgba(245, 158, 11, 0.2); color: #fde68a; }
.badge-array { background: rgba(139, 92, 246, 0.2); color: #ddd6fe; }
.badge-standard { background: rgba(59, 130, 246, 0.2); color: #bfdbfe; }

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
  gap: 0.45rem;
}

.pow-cost-badge {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--accent-primary);
  background: rgba(220, 38, 38, 0.12);
  border: 1px solid rgba(220, 38, 38, 0.3);
  padding: 0.15rem 0.55rem;
  border-radius: var(--radius-pill);
  font-variant-numeric: tabular-nums;
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

.array-glance-switcher {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  flex-wrap: wrap;
  padding-bottom: 0.35rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.glance-label {
  font-size: 0.68rem;
  font-weight: 800;
  color: #38bdf8;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.slot-buttons-group {
  display: flex;
  gap: 0.3rem;
  flex-wrap: wrap;
}

.slot-btn {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.18rem 0.55rem;
  border-radius: var(--radius-pill);
  cursor: pointer;
  transition: all var(--trans-fast);
}

.slot-btn:hover {
  border-color: var(--accent-primary);
  color: #fff;
}

.slot-btn.active {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
  color: #fff;
  font-weight: 800;
}

.glance-params-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 0.45rem;
}

.glance-param-pill {
  background: rgba(0, 0, 0, 0.28);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xs);
  padding: 0.3rem 0.55rem;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.param-k {
  font-size: 0.62rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 700;
}

.param-v {
  font-size: 0.78rem;
  font-weight: 800;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.glance-param-pill.base .param-v { color: var(--accent-primary); }
.glance-param-pill.dc .param-v { color: #38bdf8; }

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

/* Device Glance */
.device-glance-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  font-size: 0.72rem;
  font-weight: 700;
}

.dev-desc-tag { color: #fbbf24; }
.dev-stat-tag { color: var(--text-secondary); }
.dev-count-tag {
  background: rgba(245, 158, 11, 0.15);
  color: #fde68a;
  padding: 0.1rem 0.4rem;
  border-radius: var(--radius-xs);
}

/* ==========================================================================
   DEVICE CONTAINER: TABBED SYSTEM SWITCHER STYLES
   ========================================================================== */
.device-glance-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  flex-wrap: wrap;
  font-size: 0.72rem;
  font-weight: 700;
  padding-bottom: 0.25rem;
}

.dev-meta-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.dev-desc-tag { color: #fbbf24; }
.dev-stat-tag { color: var(--text-secondary); }
.dev-count-tag {
  background: rgba(245, 158, 11, 0.15);
  color: #fde68a;
  padding: 0.1rem 0.4rem;
  border-radius: var(--radius-xs);
  font-size: 0.68rem;
}

.dev-activation-note {
  font-size: 0.68rem;
  font-weight: 700;
  color: #fbbf24;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.25);
  padding: 0.1rem 0.4rem;
  border-radius: var(--radius-xs);
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
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
  background: rgba(0, 0, 0, 0.22);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xs);
  padding: 0.75rem;
  margin-top: 0.15rem;
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
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xs);
  padding: 0.65rem 0.8rem;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.dossier-block-head {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.74rem;
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

.dossier-desc-text {
  font-size: 0.75rem;
  line-height: 1.5;
  color: var(--text-secondary);
  margin: 0;
  white-space: pre-line;
}

.dossier-desc-text.sub {
  font-size: 0.72rem;
  color: var(--text-muted);
}

.dossier-specs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 0.45rem;
  padding-top: 0.45rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.spec-item {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.spec-label {
  font-size: 0.62rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.spec-value {
  font-size: 0.76rem;
  font-weight: 800;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}

.spec-value.highlight {
  color: #38bdf8;
}

/* Extras & Flaws Dossier List */
.dossier-mods-list {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.dossier-mod-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xs);
  padding: 0.5rem 0.65rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.dossier-mod-card.extra-mod {
  border-left: 3px solid #10b981;
}

.dossier-mod-card.flaw-mod {
  border-left: 3px solid #ef4444;
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
  font-size: 0.72rem;
  line-height: 1.45;
  color: var(--text-secondary);
  margin: 0;
}

/* Linked Effects Dossier */
.linked-effects-roster {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.dossier-linked-card {
  background: var(--bg-surface);
  border: 1px solid rgba(6, 182, 212, 0.3);
  border-left: 3px solid #06b6d4;
  border-radius: var(--radius-xs);
  padding: 0.55rem 0.7rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.linked-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.linked-id-group {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.78rem;
}

.linked-chain-badge {
  font-size: 0.62rem;
  font-weight: 800;
  text-transform: uppercase;
  background: rgba(6, 182, 212, 0.2);
  color: #22d3ee;
  padding: 0.1rem 0.35rem;
  border-radius: var(--radius-xs);
}

.linked-ranks-pill {
  font-size: 0.65rem;
  font-weight: 800;
  background: rgba(255, 255, 255, 0.08);
  padding: 0.1rem 0.35rem;
  border-radius: var(--radius-xs);
  color: var(--text-secondary);
}

.linked-dc-pill {
  font-size: 0.74rem;
  font-weight: 800;
  color: #38bdf8;
  font-variant-numeric: tabular-nums;
}

.linked-specs-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  font-size: 0.72rem;
  color: var(--text-secondary);
  padding-top: 0.3rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.linked-specs-row strong { color: var(--text-primary); }
.linked-extras-text { color: #34d399; }
.linked-flaws-text { color: #f87171; }

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

/* Device Sub-Power Dossier Cards */
.dossier-sub-power-card {
  background: var(--bg-card);
  border: 1px solid rgba(245, 158, 11, 0.25);
  border-left: 4px solid #f59e0b;
  border-radius: var(--radius-xs);
  padding: 0.85rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.sub-card-master-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding-bottom: 0.6rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
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
  font-size: 0.96rem;
  font-weight: 800;
  color: #fff;
  margin: 0;
}

.sub-effect-chip {
  font-size: 0.72rem;
  font-weight: 700;
  color: #fde68a;
  background: rgba(245, 158, 11, 0.12);
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
}

.sub-array-indicator {
  font-size: 0.68rem;
  font-weight: 700;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.3);
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
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
  background: rgba(225, 29, 72, 0.12);
  border: 1px solid rgba(225, 29, 72, 0.3);
  color: #ffe4e6;
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
  background: rgba(0, 0, 0, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: var(--radius-xs);
  padding: 0.65rem 0.8rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sub-dossier-label {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.sub-dossier-label.array-accent {
  color: #38bdf8;
}

.sub-dossier-label.linked-accent {
  color: #38bdf8;
}

.sub-array-block {
  border-color: rgba(56, 189, 248, 0.25);
  background: rgba(56, 189, 248, 0.04);
}

.sub-linked-block {
  border-color: rgba(6, 182, 212, 0.25);
  background: rgba(6, 182, 212, 0.04);
}

.sub-specs {
  margin-top: 0.25rem;
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

/* Configured Choices Dossier Block */
.config-choices-block {
  border-left: 3px solid #0ea5e9;
  background: rgba(14, 165, 233, 0.05);
  border-color: rgba(14, 165, 233, 0.25);
}

.config-choices-block.sub {
  border-left: 3px solid #0ea5e9;
  background: rgba(14, 165, 233, 0.04);
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
  background: var(--bg-surface);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: var(--radius-xs);
  padding: 0.5rem 0.65rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.config-choice-top {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.78rem;
}

.choice-icon {
  font-size: 0.9rem;
  color: #a855f7;
}

.choice-name {
  color: var(--text-primary);
  font-weight: 800;
}

.choice-pts {
  font-size: 0.65rem;
  font-weight: 800;
  padding: 0.08rem 0.4rem;
  border-radius: var(--radius-xs);
  background: rgba(168, 85, 247, 0.15);
  color: #ddd6fe;
  margin-left: auto;
}

.choice-desc {
  font-size: 0.7rem;
  line-height: 1.4;
  color: var(--text-secondary);
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
