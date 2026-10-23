<template>
  <div
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
            <!-- Active / Offline Switch (Tactile Dot Toggle) -->
            <button
              type="button"
              class="power-toggle-btn tactile-dot"
              :class="{ 'is-active': pow.active !== false, 'is-off': pow.active === false }"
              :title="pow.active !== false ? 'Power Active (Click to Deactivate)' : 'Power Offline (Click to Activate)'"
              @click.stop="handleTogglePower(pow)"
            >
              <span class="status-glow-dot"></span>
            </button>

            <h4 class="pow-name" :title="pow.name || 'Unnamed Power'">{{ pow.name || 'Unnamed Power' }}</h4>
          </div>

          <div class="pow-card-actions">
            <span class="pow-cost-badge">{{ getPowerCost(pow) }} PP</span>

            <!-- Broadcast to Roll20 VTT Button -->
            <button
              type="button"
              class="btn-send-vtt"
              title="Broadcast Power to Roll20"
              @click.stop="broadcastPower(pow)"
            >
              <i class="ri-broadcast-line"></i>
            </button>

            <!-- Edit in Power Studio -->
            <button
              type="button"
              class="btn-edit-power"
              title="Edit in Power Studio"
              @click.stop="handleEditPower(idx, pow)"
            >
              <i class="ri-edit-line"></i>
            </button>

            <!-- Expand / Collapse Toggle -->
            <button
              type="button"
              class="btn-toggle-expand"
              :class="{ expanded: isExpanded(pow.id || idx) }"
              :title="isExpanded(pow.id || idx) ? 'Collapse Details' : 'Expand Details'"
              @click.stop="toggleExpand(pow.id || idx)"
            >
              <i :class="isExpanded(pow.id || idx) ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'"></i>
            </button>

            <!-- Delete Power -->
            <button
              type="button"
              class="btn-del-power"
              title="Delete Power"
              @click.stop="heroStore.removePower(idx)"
            >
              <i class="ri-delete-bin-line"></i>
            </button>
          </div>
        </div>

        <!-- Card Sub-Meta Strip (Row 2: Structure Tag & Subtle Editorial Details) -->
        <div v-if="hasPowerSubMeta(pow)" class="pow-card-submeta">
          <!-- Structure Type Tag -->
          <span v-if="pow.type === 'device'" class="structure-badge badge-device">DEVICE</span>
          <span v-else-if="pow.type === 'compound'" class="structure-badge badge-compound">COMPOUND ({{ pow.compoundEffects?.length || 0 }})</span>
          <span v-else-if="pow.type === 'array' || (Array.isArray(pow.alternateEffects) && pow.alternateEffects.length > 0)" class="structure-badge badge-array">
            ARRAY ({{ (pow.alternateEffects?.length || 0) + 1 }} MODES)
          </span>

          <!-- Device Details -->
          <template v-if="pow.type === 'device'">
            <span class="submeta-dot">•</span>
            <span class="submeta-item">
              <i class="ri-shield-keyhole-line text-cyan"></i>
              <span>{{ pow.deviceConfig?.descriptor || 'High-Tech Equipment' }}</span>
            </span>
            <span class="submeta-dot">•</span>
            <span class="submeta-item">
              Toughness {{ pow.deviceConfig?.toughness || 10 }}
            </span>
            <template v-if="pow.deviceConfig?.type && pow.deviceConfig.type !== 'none'">
              <span class="submeta-dot">•</span>
              <span class="submeta-item removable-text">
                <i class="ri-hand-coin-line"></i>
                {{ pow.deviceConfig.type === 'easily_removable' ? 'Easily Removable (-2/5 PP)' : 'Removable (-1/5 PP)' }}
              </span>
            </template>
          </template>

          <!-- Compound Details -->
          <template v-else-if="pow.type === 'compound'">
            <template v-if="pow.sharedModifiers?.length > 0">
              <span class="submeta-dot">•</span>
              <span class="submeta-item">
                <i class="ri-links-line"></i>
                <span>Shared: {{ formatModifiersInline(pow.sharedModifiers) }}</span>
              </span>
            </template>
            <template v-if="getPowerDescriptorsText(pow)">
              <span class="submeta-dot">•</span>
              <span class="submeta-item">
                <i class="ri-price-tag-3-line"></i>
                <span>{{ getPowerDescriptorsText(pow) }}</span>
              </span>
            </template>
          </template>

          <!-- Array Details -->
          <template v-else-if="pow.type === 'array' || (Array.isArray(pow.alternateEffects) && pow.alternateEffects.length > 0)">
            <template v-if="pow.dynamic">
              <span class="submeta-dot">•</span>
              <span class="submeta-item text-amber">
                <i class="ri-shuffle-line"></i>
                <span>Dynamic Array</span>
              </span>
            </template>
            <template v-if="getPowerDescriptorsText(pow)">
              <span class="submeta-dot">•</span>
              <span class="submeta-item">
                <i class="ri-price-tag-3-line"></i>
                <span>{{ getPowerDescriptorsText(pow) }}</span>
              </span>
            </template>
          </template>

          <!-- Standard Power Descriptor -->
          <template v-else-if="getPowerDescriptorsText(pow)">
            <span class="submeta-item">
              <i class="ri-price-tag-3-line"></i>
              <span>{{ getPowerDescriptorsText(pow) }}</span>
            </span>
          </template>

          <!-- Activation Flaw -->
          <template v-if="pow.activation && pow.activation !== 'none'">
            <span v-if="pow.type !== 'standard' || getPowerDescriptorsText(pow)" class="submeta-dot">•</span>
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
                <i class="ri-star-fill" style="color: #fbbf24; font-size: 0.75rem; margin-right: 2px;"></i> {{ pow.mainEffect?.name || 'Primary' }}
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
                <i class="ri-play-circle-line"></i> {{ getActiveEffect(pow).action || 'Standard' }}
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
              >
                {{ calculateCompactDC(getSubPowerActiveEffect(sub)) || calculateDC(getSubPowerActiveEffect(sub)) }}
              </span>

              <!-- Micro Roll20 Broadcast Button -->
              <button
                type="button"
                class="chip-vtt-btn"
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
              @click="setActiveCompoundSubIndex(pow.id || idx, sIdx); toggleExpand(pow.id || idx)"
            >
              <!-- Primary / Effect Icon -->
              <span
                class="compound-icon-wrapper"
                :class="{ 'is-primary-icon': isCompoundSubPrimary(pow, sub, sIdx) }"
              >
                <i :class="isCompoundSubPrimary(pow, sub, sIdx) ? 'ri-star-fill' : getEffectIcon(getSubPowerActiveEffect(sub).baseEffect)"></i>
              </span>

              <!-- Component Name & Effect Ranks -->
              <div class="chip-label-group">
                <div class="chip-title-line">
                  <strong class="chip-sys-name">{{ sub.name || `Component #${sIdx + 1}` }}</strong>
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
              >
                {{ calculateCompactDC(getSubPowerActiveEffect(sub)) || calculateDC(getSubPowerActiveEffect(sub)) }}
              </span>

              <!-- Micro Roll20 Broadcast Button -->
              <button
                type="button"
                class="chip-vtt-btn compound"
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
            <!-- 1. Base Effect Core Rules & Mechanics -->
            <div class="dossier-block effect-rules-block">
              <div class="sub-card-master-header standard-power-master-header">
                <div class="sub-sys-title-block">
                  <div class="sub-sys-title-line">
                    <span v-if="getActiveSlotTitle(pow)" class="active-stunt-mode-title">{{ getActiveSlotTitle(pow) }}:</span>
                    <h4
                      v-if="getActiveEffect(pow).name && !isEffectNameRedundant(getActiveEffect(pow).name, getActiveEffect(pow).baseEffect) && !isEffectNameRedundant(pow.name, getActiveEffect(pow).name)"
                      class="sub-sys-heading standard-effect-custom-heading"
                    >
                      {{ getActiveEffect(pow).name }}
                    </h4>
                    <span class="sub-effect-chip standard-effect-chip">
                      <strong v-if="getActiveEffect(pow).baseEffect || getActiveEffect(pow).name" class="sub-effect-name">{{ getActiveEffect(pow).baseEffect || getActiveEffect(pow).name }}</strong>
                      <span class="sub-effect-rank">Rank {{ getActiveEffect(pow).ranks }}</span>
                    </span>
                  </div>
                </div>
                <div class="sub-sys-actions">
                  <span v-if="calculateDC(getActiveEffect(pow))" class="sub-dc-tag-lg">
                    {{ calculateDC(getActiveEffect(pow)) }}
                  </span>
                  <button
                    type="button"
                    class="btn-send-vtt-sub"
                    title="Broadcast Effect to Roll20"
                    @click.stop="broadcastEffect(pow, getActiveEffect(pow))"
                  >
                    <i class="ri-broadcast-line"></i>
                  </button>
                </div>
              </div>

              <!-- Combat Specs Matrix Grid (Placed First for instant battle reference) -->
              <div class="dossier-specs-grid">
                <div class="spec-item">
                  <span class="spec-label"><i class="ri-play-circle-line"></i> Action</span>
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

              <!-- Core Rulebook Callout Reference -->
              <div class="rulebook-callout-box">
                <span class="rulebook-caption">
                  <i class="ri-book-open-line"></i> Core Rulebook Mechanics:
                </span>
                <p class="dossier-desc-text">
                  {{ getEffectDesc(getActiveEffect(pow).baseEffect) }}
                </p>
              </div>
            </div>

            <!-- Configured Choices / Selections Block (e.g. Senses, Enhanced Trait, Movement, Immunity) -->
            <div v-if="getEffectConfigDetails(getActiveEffect(pow))" class="dossier-block config-choices-block">
              <div v-if="getEffectConfigDetails(getActiveEffect(pow)).title" class="dossier-block-head config-head">
                <div class="dossier-head-left">
                  <i class="ri-equalizer-line"></i>
                  <span>{{ getEffectConfigDetails(getActiveEffect(pow)).title }}</span>
                </div>
              </div>
              <div class="config-choices-flat-list">
                <div
                  v-for="item in getEffectConfigDetails(getActiveEffect(pow)).items"
                  :key="item.name"
                  class="config-flat-item"
                >
                  <div class="config-flat-head">
                    <div class="config-flat-identity">
                      <i :class="item.icon || 'ri-checkbox-circle-line'" class="choice-icon"></i>
                      <strong class="choice-name">{{ item.name }}</strong>
                    </div>
                    <span v-if="item.pts" class="choice-pts">{{ item.pts }} PP</span>
                    <span v-else-if="item.ranks" class="choice-pts">Rank {{ item.ranks }}</span>
                  </div>
                  <p v-if="item.desc" class="config-flat-desc">{{ item.desc }}</p>
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
                    </button>
                  </div>
                  <p class="dossier-mod-desc">{{ flaw.desc || getModifierInfo(flaw.name, true).desc }}</p>
                </div>
              </div>
            </div>

            <!-- 4. Linked Effects (Simultaneous Powers) -->
            <!-- 4. Linked Effects (Simultaneous Powers) -->
            <div v-if="getActiveLinkedEffects(pow).length > 0" class="dossier-block linked-block">
              <div
                class="dossier-block-head linked-head is-clickable-section"
                role="button"
                tabindex="0"
                :aria-expanded="!isLinkedSectionCollapsed(String(pow.id ?? idx) + '_std_linked')"
                @click="toggleLinkedSection(String(pow.id ?? idx) + '_std_linked')"
                @keydown.enter.prevent="toggleLinkedSection(String(pow.id ?? idx) + '_std_linked')"
                @keydown.space.prevent="toggleLinkedSection(String(pow.id ?? idx) + '_std_linked')"
              >
                <div class="dossier-head-left">
                  <i class="ri-links-line"></i>
                  <span>Simultaneous Linked Effects ({{ getActiveLinkedEffects(pow).length }})</span>
                </div>
                <div class="linked-section-right">
                  <span class="linked-suite-hint">Active together on the exact same action</span>
                  <button
                    type="button"
                    class="btn-toggle-linked-section"
                    :class="{ expanded: !isLinkedSectionCollapsed(String(pow.id ?? idx) + '_std_linked') }"
                    :title="!isLinkedSectionCollapsed(String(pow.id ?? idx) + '_std_linked') ? 'Collapse Linked Section' : 'Expand Linked Section'"
                    @click.stop="toggleLinkedSection(String(pow.id ?? idx) + '_std_linked')"
                  >
                    <i :class="!isLinkedSectionCollapsed(String(pow.id ?? idx) + '_std_linked') ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'"></i>
                  </button>
                </div>
              </div>
              <div v-show="!isLinkedSectionCollapsed(String(pow.id ?? idx) + '_std_linked')" class="linked-effects-roster">
                <div
                  v-for="(linked, lIdx) in getActiveLinkedEffects(pow)"
                  :key="'dl_' + lIdx"
                  class="linked-full-dossier-card"
                >
                  <!-- 1. Master Header Card -->
                  <div
                    class="linked-card-master-header is-clickable"
                    role="button"
                    tabindex="0"
                    :aria-expanded="isLinkedCardExpanded(String(pow.id ?? idx) + '_std_linked_' + lIdx)"
                    @click="toggleLinkedCard(String(pow.id ?? idx) + '_std_linked_' + lIdx)"
                    @keydown.enter.prevent="toggleLinkedCard(String(pow.id ?? idx) + '_std_linked_' + lIdx)"
                    @keydown.space.prevent="toggleLinkedCard(String(pow.id ?? idx) + '_std_linked_' + lIdx)"
                  >
                    <div class="linked-master-left">
                      <div class="linked-title-group">
                        <div class="linked-title-row">
                          <h5 class="linked-heading">{{ getLinkedDisplayName(linked) }}</h5>
                          <span class="linked-effect-chip">
                            <strong v-if="linked.baseEffect || linked.name" class="linked-effect-name">{{ linked.baseEffect || linked.name }}</strong>
                            <span class="linked-effect-rank">Rank {{ linked.ranks }}</span>
                          </span>
                        </div>
                        <div class="linked-inline-specs">
                          <span class="inline-spec-pill"><i class="ri-flashlight-line"></i> {{ linked.action || 'Standard' }}</span>
                          <span class="inline-spec-dot">•</span>
                          <span class="inline-spec-pill"><i class="ri-focus-line"></i> {{ formatRange(linked) }}</span>
                          <span class="inline-spec-dot">•</span>
                          <span class="inline-spec-pill"><i class="ri-time-line"></i> {{ linked.duration || 'Instant' }}</span>
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
                      </button>
                      <button
                        type="button"
                        class="btn-toggle-linked-card"
                        :class="{ expanded: isLinkedCardExpanded(String(pow.id ?? idx) + '_std_linked_' + lIdx) }"
                        :title="isLinkedCardExpanded(String(pow.id ?? idx) + '_std_linked_' + lIdx) ? 'Collapse Details' : 'Expand Details'"
                        @click.stop="toggleLinkedCard(String(pow.id ?? idx) + '_std_linked_' + lIdx)"
                      >
                        <i :class="isLinkedCardExpanded(String(pow.id ?? idx) + '_std_linked_' + lIdx) ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'"></i>
                      </button>
                    </div>
                  </div>

                  <!-- 2. Expanded Details Body -->
                  <div v-show="isLinkedCardExpanded(String(pow.id ?? idx) + '_std_linked_' + lIdx)" class="linked-card-expanded-body">
                    <!-- Specs Matrix Grid (Placed First for instant battle reference) -->
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

                    <!-- Configured Choices / Selections Block -->
                    <div v-if="getEffectConfigDetails(linked)" class="linked-config-block">
                      <div v-if="getEffectConfigDetails(linked).title" class="linked-config-head">
                        <div class="dossier-head-left">
                          <i class="ri-equalizer-line"></i>
                          <span>{{ getEffectConfigDetails(linked).title }}</span>
                        </div>
                      </div>
                      <div class="config-choices-flat-list">
                        <div
                          v-for="item in getEffectConfigDetails(linked).items"
                          :key="item.name"
                          class="config-flat-item"
                        >
                          <div class="config-flat-head">
                            <div class="config-flat-identity">
                              <i :class="item.icon || 'ri-focus-3-line'" class="choice-icon"></i>
                              <strong class="choice-name">{{ item.name }}</strong>
                            </div>
                            <span v-if="item.pts" class="choice-pts">{{ item.pts }} PP</span>
                            <span v-else-if="item.ranks" class="choice-pts">Rank {{ item.ranks }}</span>
                          </div>
                          <p v-if="item.desc" class="config-flat-desc">{{ item.desc }}</p>
                        </div>
                      </div>
                    </div>

                    <!-- Core Rules Reference in Callout Box -->
                    <div class="rulebook-callout-box linked">
                      <span class="rulebook-caption">
                        <i class="ri-book-open-line"></i> Core Rulebook Mechanics:
                      </span>
                      <p class="dossier-desc-text linked-rules-text">
                        {{ getEffectDesc(linked.baseEffect) }}
                      </p>
                    </div>

                    <!-- Applied Modifiers Section with Rules Description -->
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
                      :title="`Broadcast ${mod.type === 'flaw' || (Number(mod.cost) < 0) ? 'Flaw' : 'Extra'} to Roll20`"
                      @click.stop="mod.type === 'flaw' || (Number(mod.cost) < 0) ? broadcastFlaw(pow, mod) : broadcastExtra(pow, mod)"
                    >
                      <i class="ri-broadcast-line"></i>
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
                      <strong v-if="getSubPowerActiveEffect(sub).baseEffect || getSubPowerActiveEffect(sub).name" class="sub-effect-name">{{ getSubPowerActiveEffect(sub).baseEffect || getSubPowerActiveEffect(sub).name }}</strong>
                      <span class="sub-effect-rank">Rank {{ getSubPowerActiveEffect(sub).ranks || 1 }}</span>
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
                    title="Broadcast Component to Roll20"
                    @click.stop="broadcastSubPower(pow, sub, sIdx)"
                  >
                    <i class="ri-broadcast-line"></i>
                  </button>
                </div>
              </div>

              <!-- Sub-Effect Alternate Modes Switcher (if alternate effects exist) -->
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
                    <i class="ri-focus-3-line sub-slot-primary-icon"></i> {{ sub.effect?.name || sub.name || 'Primary' }}
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

                <!-- Core Rulebook Callout Reference -->
                <div class="rulebook-callout-box">
                  <span class="rulebook-caption">
                    <i class="ri-book-open-line"></i> Core Rulebook Mechanics:
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
                        </button>
                      </div>
                      <p class="dossier-mod-desc">{{ flaw.desc || getModifierInfo(flaw.name, true).desc }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Sub-Effect Configured Choices Block (e.g. Senses, Affliction, Movement, Immunity) -->
              <div v-if="getEffectConfigDetails(getSubPowerActiveEffect(sub))" class="sub-dossier-block config-choices-block sub">
                <div v-if="getEffectConfigDetails(getSubPowerActiveEffect(sub)).title" class="sub-dossier-label config-head">
                  <div class="dossier-head-left">
                    <i class="ri-equalizer-line"></i>
                    <span>{{ getEffectConfigDetails(getSubPowerActiveEffect(sub)).title }}</span>
                  </div>
                </div>
                <div class="config-choices-flat-list">
                  <div
                    v-for="item in getEffectConfigDetails(getSubPowerActiveEffect(sub)).items"
                    :key="item.name"
                    class="config-flat-item"
                  >
                    <div class="config-flat-head">
                      <div class="config-flat-identity">
                        <i :class="item.icon || 'ri-checkbox-circle-line'" class="choice-icon"></i>
                        <strong class="choice-name">{{ item.name }}</strong>
                      </div>
                      <span v-if="item.pts" class="choice-pts">{{ item.pts }} PP</span>
                      <span v-else-if="item.ranks" class="choice-pts">Rank {{ item.ranks }}</span>
                    </div>
                    <p v-if="item.desc" class="config-flat-desc">{{ item.desc }}</p>
                  </div>
                </div>
              </div>

              <!-- Simultaneous Linked Effects Pod (if this compound sub-effect has linked effects) -->
              <div v-if="getSubPowerActiveLinkedEffects(sub).length > 0" class="sub-dossier-block sub-linked-block">
                <div
                  class="sub-dossier-label linked-accent is-clickable-section"
                  role="button"
                  tabindex="0"
                  :aria-expanded="!isLinkedSectionCollapsed(String(pow.id ?? idx) + '_cmp_' + sIdx + '_linked')"
                  @click="toggleLinkedSection(String(pow.id ?? idx) + '_cmp_' + sIdx + '_linked')"
                  @keydown.enter.prevent="toggleLinkedSection(String(pow.id ?? idx) + '_cmp_' + sIdx + '_linked')"
                  @keydown.space.prevent="toggleLinkedSection(String(pow.id ?? idx) + '_cmp_' + sIdx + '_linked')"
                >
                  <div class="dossier-head-left">
                    <i class="ri-links-line"></i>
                    <span>Simultaneous Linked Effects ({{ getSubPowerActiveLinkedEffects(sub).length }})</span>
                  </div>
                  <div class="linked-section-right">
                    <span class="linked-suite-hint">Active together on the exact same action</span>
                    <button
                      type="button"
                      class="btn-toggle-linked-section"
                      :class="{ expanded: !isLinkedSectionCollapsed(String(pow.id ?? idx) + '_cmp_' + sIdx + '_linked') }"
                      :title="!isLinkedSectionCollapsed(String(pow.id ?? idx) + '_cmp_' + sIdx + '_linked') ? 'Collapse Linked Section' : 'Expand Linked Section'"
                      @click.stop="toggleLinkedSection(String(pow.id ?? idx) + '_cmp_' + sIdx + '_linked')"
                    >
                      <i :class="!isLinkedSectionCollapsed(String(pow.id ?? idx) + '_cmp_' + sIdx + '_linked') ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'"></i>
                    </button>
                  </div>
                </div>
                <div v-show="!isLinkedSectionCollapsed(String(pow.id ?? idx) + '_cmp_' + sIdx + '_linked')" class="linked-effects-roster">
                  <div
                    v-for="(linked, lIdx) in getSubPowerActiveLinkedEffects(sub)"
                    :key="'csub_lnk_' + lIdx"
                    class="linked-full-dossier-card"
                  >
                    <div
                      class="linked-card-master-header is-clickable"
                      role="button"
                      tabindex="0"
                      :aria-expanded="isLinkedCardExpanded(String(pow.id ?? idx) + '_cmp_' + sIdx + '_linked_' + lIdx)"
                      @click="toggleLinkedCard(String(pow.id ?? idx) + '_cmp_' + sIdx + '_linked_' + lIdx)"
                      @keydown.enter.prevent="toggleLinkedCard(String(pow.id ?? idx) + '_cmp_' + sIdx + '_linked_' + lIdx)"
                      @keydown.space.prevent="toggleLinkedCard(String(pow.id ?? idx) + '_cmp_' + sIdx + '_linked_' + lIdx)"
                    >
                      <div class="linked-master-left">
                        <div class="linked-title-group">
                          <div class="linked-title-row">
                            <h5 class="linked-heading">{{ getLinkedDisplayName(linked) }}</h5>
                            <span class="linked-effect-chip">
                              <strong v-if="linked.baseEffect || linked.name" class="linked-effect-name">{{ linked.baseEffect || linked.name }}</strong>
                              <span class="linked-effect-rank">Rank {{ linked.ranks }}</span>
                            </span>
                          </div>
                          <div class="linked-inline-specs">
                            <span class="inline-spec-pill"><i class="ri-flashlight-line"></i> {{ linked.action || 'Standard' }}</span>
                            <span class="inline-spec-dot">•</span>
                            <span class="inline-spec-pill"><i class="ri-focus-line"></i> {{ formatRange(linked) }}</span>
                            <span class="inline-spec-dot">•</span>
                            <span class="inline-spec-pill"><i class="ri-time-line"></i> {{ linked.duration || 'Instant' }}</span>
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
                        </button>
                        <button
                          type="button"
                          class="btn-toggle-linked-card"
                          :class="{ expanded: isLinkedCardExpanded(String(pow.id ?? idx) + '_cmp_' + sIdx + '_linked_' + lIdx) }"
                          :title="isLinkedCardExpanded(String(pow.id ?? idx) + '_cmp_' + sIdx + '_linked_' + lIdx) ? 'Collapse Details' : 'Expand Details'"
                          @click.stop="toggleLinkedCard(String(pow.id ?? idx) + '_cmp_' + sIdx + '_linked_' + lIdx)"
                        >
                          <i :class="isLinkedCardExpanded(String(pow.id ?? idx) + '_cmp_' + sIdx + '_linked_' + lIdx) ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'"></i>
                        </button>
                      </div>
                    </div>

                    <!-- 2. Expanded Details Body -->
                    <div v-show="isLinkedCardExpanded(String(pow.id ?? idx) + '_cmp_' + sIdx + '_linked_' + lIdx)" class="linked-card-expanded-body">

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
                        <i class="ri-book-open-line"></i> Core Rulebook Mechanics:
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
                    class="sub-power-toggle-btn master-toggle tactile-dot"
                    :class="{
                      'is-active': sub.active !== false && pow.active !== false,
                      'is-off': sub.active === false || pow.active === false
                    }"
                    :disabled="pow.active === false"
                    :title="sub.active !== false && pow.active !== false ? 'System Online (Click to Deactivate)' : 'System Offline (Click to Activate)'"
                    @click.stop="handleToggleSubPower(pow, sIdx, sub)"
                  >
                    <span class="status-glow-dot sub-dot"></span>
                  </button>
                  <div class="sub-sys-title-block">
                    <div class="sub-sys-title-line">
                      <h4 class="sub-sys-heading">{{ sub.name }}</h4>
                      <span class="sub-effect-chip">
                        <strong v-if="getSubPowerActiveEffect(sub).baseEffect || getSubPowerActiveEffect(sub).name" class="sub-effect-name">{{ getSubPowerActiveEffect(sub).baseEffect || getSubPowerActiveEffect(sub).name }}</strong>
                        <span class="sub-effect-rank">Rank {{ getSubPowerActiveEffect(sub).ranks }}</span>
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
                      title="Broadcast System to Roll20"
                      @click.stop="broadcastSubPower(pow, sub, sIdx)"
                    >
                      <i class="ri-broadcast-line"></i>
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
                      <i class="ri-star-fill" style="color: #fbbf24; font-size: 0.75rem; margin-right: 2px;"></i> {{ sub.effect?.name || 'Primary' }}
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

                  <!-- Core Rulebook Callout Reference -->
                  <div class="rulebook-callout-box">
                    <span class="rulebook-caption">
                      <i class="ri-book-open-line"></i> Core Rulebook Mechanics:
                    </span>
                    <p class="dossier-desc-text sub">{{ getEffectDesc(getSubPowerActiveEffect(sub).baseEffect) }}</p>
                  </div>
                </div>

              <!-- Sub-power Configured Choices Block -->
              <div v-if="getEffectConfigDetails(getSubPowerActiveEffect(sub))" class="sub-dossier-block config-choices-block sub">
                <div v-if="getEffectConfigDetails(getSubPowerActiveEffect(sub)).title" class="sub-dossier-label config-head">
                  <div class="dossier-head-left">
                    <i class="ri-equalizer-line"></i>
                    <span>{{ getEffectConfigDetails(getSubPowerActiveEffect(sub)).title }}</span>
                  </div>
                </div>
                <div class="config-choices-flat-list">
                  <div
                    v-for="item in getEffectConfigDetails(getSubPowerActiveEffect(sub)).items"
                    :key="item.name"
                    class="config-flat-item"
                  >
                    <div class="config-flat-head">
                      <div class="config-flat-identity">
                        <i :class="item.icon || 'ri-checkbox-circle-line'" class="choice-icon"></i>
                        <strong class="choice-name">{{ item.name }}</strong>
                      </div>
                      <span v-if="item.pts" class="choice-pts">{{ item.pts }} PP</span>
                      <span v-else-if="item.ranks" class="choice-pts">Rank {{ item.ranks }}</span>
                    </div>
                    <p v-if="item.desc" class="config-flat-desc">{{ item.desc }}</p>
                  </div>
                </div>
              </div>

              <!-- Simultaneous Linked Effects Pod (if sub-power has linked effects) -->
              <div v-if="getSubPowerActiveLinkedEffects(sub).length > 0" class="sub-dossier-block sub-linked-block">
                <div
                  class="sub-dossier-label linked-accent is-clickable-section"
                  role="button"
                  tabindex="0"
                  :aria-expanded="!isLinkedSectionCollapsed(String(pow.id ?? idx) + '_dev_' + sIdx + '_linked')"
                  @click="toggleLinkedSection(String(pow.id ?? idx) + '_dev_' + sIdx + '_linked')"
                  @keydown.enter.prevent="toggleLinkedSection(String(pow.id ?? idx) + '_dev_' + sIdx + '_linked')"
                  @keydown.space.prevent="toggleLinkedSection(String(pow.id ?? idx) + '_dev_' + sIdx + '_linked')"
                >
                  <div class="dossier-head-left">
                    <i class="ri-links-line"></i>
                    <span>Simultaneous Linked Sub-Effects ({{ getSubPowerActiveLinkedEffects(sub).length }})</span>
                  </div>
                  <div class="linked-section-right">
                    <span class="linked-suite-hint">Active together on the exact same action</span>
                    <button
                      type="button"
                      class="btn-toggle-linked-section"
                      :class="{ expanded: !isLinkedSectionCollapsed(String(pow.id ?? idx) + '_dev_' + sIdx + '_linked') }"
                      :title="!isLinkedSectionCollapsed(String(pow.id ?? idx) + '_dev_' + sIdx + '_linked') ? 'Collapse Linked Section' : 'Expand Linked Section'"
                      @click.stop="toggleLinkedSection(String(pow.id ?? idx) + '_dev_' + sIdx + '_linked')"
                    >
                      <i :class="!isLinkedSectionCollapsed(String(pow.id ?? idx) + '_dev_' + sIdx + '_linked') ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'"></i>
                    </button>
                  </div>
                </div>
                <div v-show="!isLinkedSectionCollapsed(String(pow.id ?? idx) + '_dev_' + sIdx + '_linked')" class="linked-effects-roster">
                  <div
                    v-for="(linked, lIdx) in getSubPowerActiveLinkedEffects(sub)"
                    :key="'sub_dl_' + lIdx"
                    class="linked-full-dossier-card"
                  >
                    <!-- 1. Master Header Card -->
                    <div
                      class="linked-card-master-header is-clickable"
                      role="button"
                      tabindex="0"
                      :aria-expanded="isLinkedCardExpanded(String(pow.id ?? idx) + '_dev_' + sIdx + '_linked_' + lIdx)"
                      @click="toggleLinkedCard(String(pow.id ?? idx) + '_dev_' + sIdx + '_linked_' + lIdx)"
                      @keydown.enter.prevent="toggleLinkedCard(String(pow.id ?? idx) + '_dev_' + sIdx + '_linked_' + lIdx)"
                      @keydown.space.prevent="toggleLinkedCard(String(pow.id ?? idx) + '_dev_' + sIdx + '_linked_' + lIdx)"
                    >
                      <div class="linked-master-left">
                        <div class="linked-title-group">
                          <div class="linked-title-row">
                            <h5 class="linked-heading">{{ getLinkedDisplayName(linked) }}</h5>
                            <span class="linked-effect-chip">
                              <strong v-if="linked.baseEffect || linked.name" class="linked-effect-name">{{ linked.baseEffect || linked.name }}</strong>
                              <span class="linked-effect-rank">Rank {{ linked.ranks }}</span>
                            </span>
                          </div>
                          <div class="linked-inline-specs">
                            <span class="inline-spec-pill"><i class="ri-flashlight-line"></i> {{ linked.action || 'Standard' }}</span>
                            <span class="inline-spec-dot">•</span>
                            <span class="inline-spec-pill"><i class="ri-focus-line"></i> {{ formatRange(linked) }}</span>
                            <span class="inline-spec-dot">•</span>
                            <span class="inline-spec-pill"><i class="ri-time-line"></i> {{ linked.duration || 'Instant' }}</span>
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
                        </button>
                        <button
                          type="button"
                          class="btn-toggle-linked-card"
                          :class="{ expanded: isLinkedCardExpanded(String(pow.id ?? idx) + '_dev_' + sIdx + '_linked_' + lIdx) }"
                          :title="isLinkedCardExpanded(String(pow.id ?? idx) + '_dev_' + sIdx + '_linked_' + lIdx) ? 'Collapse Details' : 'Expand Details'"
                          @click.stop="toggleLinkedCard(String(pow.id ?? idx) + '_dev_' + sIdx + '_linked_' + lIdx)"
                        >
                          <i :class="isLinkedCardExpanded(String(pow.id ?? idx) + '_dev_' + sIdx + '_linked_' + lIdx) ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'"></i>
                        </button>
                      </div>
                    </div>

                    <!-- 2. Expanded Details Body -->
                    <div v-show="isLinkedCardExpanded(String(pow.id ?? idx) + '_dev_' + sIdx + '_linked_' + lIdx)" class="linked-card-expanded-body">

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
                      <div v-if="getEffectConfigDetails(linked).title" class="linked-config-head">
                        <div class="dossier-head-left">
                          <i class="ri-equalizer-line"></i>
                          <span>{{ getEffectConfigDetails(linked).title }}</span>
                        </div>
                      </div>
                      <div class="config-choices-flat-list">
                        <div
                          v-for="item in getEffectConfigDetails(linked).items"
                          :key="item.name"
                          class="config-flat-item"
                        >
                          <div class="config-flat-head">
                            <div class="config-flat-identity">
                              <i :class="item.icon || 'ri-focus-3-line'" class="choice-icon"></i>
                              <strong class="choice-name">{{ item.name }}</strong>
                            </div>
                            <span v-if="item.pts" class="choice-pts">{{ item.pts }} PP</span>
                            <span v-else-if="item.ranks" class="choice-pts">Rank {{ item.ranks }}</span>
                          </div>
                          <p v-if="item.desc" class="config-flat-desc">{{ item.desc }}</p>
                        </div>
                      </div>
                    </div>

                    <!-- 4. Core Rules Reference in Callout Box -->
                    <div class="rulebook-callout-box linked">
                      <span class="rulebook-caption">
                        <i class="ri-book-open-line"></i> Core Rulebook Mechanics:
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
</template>

<script setup>
import { ref } from 'vue';
import { useHeroStore } from '../../../stores/heroStore.js';
import { usePowerBuilderStore } from '../../../stores/powerBuilderStore.js';
import { useUiStore } from '../../../stores/uiStore.js';
import { hasResistanceCheck } from '../../../rules/powerEngine.js';
import {
  formatModifierList,
  getLinkedDisplayName,
  getEffectCategory,
  formatLinkedEffectsList,
  getEffectConfigDetails,
  broadcastPower,
  broadcastSubPower,
  broadcastEffect,
  broadcastExtra,
  broadcastFlaw,
  hasPowerSubMeta,
  getPowerDescriptorsText,
  formatModifiersInline,
  formatLinkedInline,
  getEffectIcon,
  getPowerCost,
  getActiveEffect,
  getActiveLinkedEffects,
  getActiveSlotTitle,
  getSubPowerActiveEffect,
  getSubPowerActiveLinkedEffects,
  calculateDC,
  calculateCompactDC,
  formatRange,
  getEffectDesc,
  getModifierInfo,
  isEffectNameRedundant
} from './powersDeckHelper.js';

const props = defineProps({
  pow: { type: Object, required: true },
  idx: { type: Number, required: true },
  isExpanded: { type: Boolean, default: false }
});

const emit = defineEmits(['toggle-expand']);

const heroStore = useHeroStore();
const builderStore = usePowerBuilderStore();
const uiStore = useUiStore();

function isExpanded(_id) {
  return props.isExpanded;
}

function toggleExpand(_id) {
  emit('toggle-expand');
}

function handleEditPower(idx, pow) {
  if (typeof builderStore.openPowerForEdit === 'function') {
    builderStore.openPowerForEdit(idx, pow);
  } else if (typeof builderStore.openEditPower === 'function') {
    builderStore.openEditPower(idx, pow);
  } else {
    console.warn('[PowerCard] Power builder store edit action not found');
  }
}

function handleTogglePower(pow) {
  pow.active = pow.active === false ? true : false;
  heroStore.saveToStorage();
}

function handleToggleSubPower(pow, sIdx, sub) {
  sub.active = sub.active === false ? true : false;
  heroStore.saveToStorage();
}

const activeDeviceTabs = ref({});
function getActiveDeviceSubIndex(powId) {
  const key = String(powId ?? '');
  if (activeDeviceTabs.value[key] === undefined) {
    return 0;
  }
  return activeDeviceTabs.value[key];
}
function setActiveDeviceSubIndex(powId, target) {
  activeDeviceTabs.value[String(powId ?? '')] = target;
}
function getSelectedDeviceSub(pow, powId) {
  const subs = Array.isArray(pow.devicePowers) ? pow.devicePowers : [];
  if (subs.length === 0) return { sub: null, idx: 0 };
  const targetIdx = getActiveDeviceSubIndex(powId);
  const boundedIdx = targetIdx >= 0 && targetIdx < subs.length ? targetIdx : 0;
  return {
    sub: subs[boundedIdx],
    idx: boundedIdx
  };
}

const activeCompoundTabs = ref({});
function getActiveCompoundSubIndex(powId) {
  const key = String(powId ?? '');
  if (activeCompoundTabs.value[key] === undefined) {
    return 0;
  }
  return activeCompoundTabs.value[key];
}
function setActiveCompoundSubIndex(powId, target) {
  activeCompoundTabs.value[String(powId ?? '')] = target;
}
function getSelectedCompoundSub(pow, powId) {
  const subs = Array.isArray(pow.compoundEffects)
    ? pow.compoundEffects
    : (Array.isArray(pow.compoundPowers) ? pow.compoundPowers : []);
  if (subs.length === 0) return { sub: null, idx: 0 };
  const targetIdx = getActiveCompoundSubIndex(powId);
  const boundedIdx = targetIdx >= 0 && targetIdx < subs.length ? targetIdx : 0;
  return {
    sub: subs[boundedIdx],
    idx: boundedIdx
  };
}

function isCompoundSubPrimary(pow, sub, sIdx) {
  if (sub?.isPrimaryAction) return true;
  if (!pow?.compoundEffects?.some(c => c.isPrimaryAction) && sIdx === 0) return true;
  return false;
}

// Collapsible Linked Effects Management
const collapsedLinkedSections = ref(new Set());
const expandedLinkedCards = ref(new Set());

function isLinkedSectionCollapsed(key) {
  return collapsedLinkedSections.value.has(key);
}

function toggleLinkedSection(key) {
  const next = new Set(collapsedLinkedSections.value);
  if (next.has(key)) {
    next.delete(key);
  } else {
    next.add(key);
  }
  collapsedLinkedSections.value = next;
}

function isLinkedCardExpanded(key) {
  return expandedLinkedCards.value.has(key);
}

function toggleLinkedCard(key) {
  const next = new Set(expandedLinkedCards.value);
  if (next.has(key)) {
    next.delete(key);
  } else {
    next.add(key);
  }
  expandedLinkedCards.value = next;
}
</script>

<style scoped src="./powerCard.css"></style>
