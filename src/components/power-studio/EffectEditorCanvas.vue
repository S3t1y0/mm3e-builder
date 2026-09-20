<template>
  <div v-if="effect" class="effect-editor-canvas">
    <!-- Header Banner of Canvas -->
    <div class="canvas-header">
      <div class="canvas-title-group">
        <span v-if="title" class="canvas-badge">{{ title }}</span>
        <h4 class="canvas-effect-name">{{ effect.name || effect.baseEffect }}</h4>
      </div>
      <div class="canvas-cost-pill">
        <span class="cost-calc-label">Cost:</span>
        <span class="cost-calc-val">{{ effectCost.totalCost }} PP</span>
      </div>
    </div>

    <!-- Core Effect Form Grid -->
    <div class="canvas-form-grid">
      <!-- Effect Name -->
      <div class="form-group span-full">
        <label class="field-label">Custom Effect Name</label>
        <div class="input-with-icon">
          <i class="ri-edit-line"></i>
          <input
            v-model="effect.name"
            type="text"
            class="text-input"
            placeholder="e.g. Plasma Burst, Kinetic Barrier..."
          />
        </div>
      </div>

      <!-- Base Effect Banner & Catalog Trigger (Split 2-Column Layout) -->
      <div class="form-group span-full">
        <div class="base-effect-card split-layout">
          <!-- Left Column: Identity & Selection Controls (~38%) -->
          <div class="base-col-control">
            <div class="base-col-identity">
              <div class="base-effect-icon-box">
                <i class="ri-flashlight-line"></i>
              </div>
              <div class="base-identity-text">
                <div class="base-effect-name-row">
                  <span class="base-effect-title">{{ effect.baseEffect || 'Damage' }}</span>
                  <span class="badge badge-accent">{{ currentBaseInfo?.category || 'Effect' }}</span>
                  <span class="base-effect-cost-tag">{{ currentBaseInfo?.cost || 1 }} PP / Rank</span>
                </div>
              </div>
            </div>

            <div class="base-col-actions">
              <button
                type="button"
                class="btn-open-effects-catalog"
                @click="builderStore.openEffectsLibrary(effect)"
              >
                <i class="ri-book-open-line"></i>
                <span>Browse Effects Library ({{ BASE_EFFECTS.length }} Effects)</span>
              </button>

              <div class="base-rank-stepper-box">
                <label class="base-rank-label">
                  <span>Effect Rank:</span>
                </label>
                <div class="rank-stepper-row">
                  <button
                    type="button"
                    class="btn-step"
                    :disabled="effect.ranks <= 1"
                    @click="builderStore.updateEffectRank(effect, -1)"
                    title="Decrease Rank"
                  >
                    <i class="ri-subtract-line"></i>
                  </button>
                  <span class="rank-display">Rank {{ effect.ranks }}</span>
                  <button
                    type="button"
                    class="btn-step"
                    @click="builderStore.updateEffectRank(effect, 1)"
                    title="Increase Rank"
                  >
                    <i class="ri-add-line"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Official Rules & Mechanics (~62%) -->
          <div class="base-col-details">
            <div class="base-details-header">
              <i class="ri-file-list-3-line"></i>
              <span class="base-details-title">Effect Rules & Mechanics</span>
            </div>
            <p class="base-effect-desc">{{ currentBaseInfo?.desc || 'Official M&M 3E base effect.' }}</p>
          </div>
        </div>
      </div>

      <!-- Effect Configurator (Enhanced Trait, Senses, Affliction, Illusion, Immunity, Movement, etc.) -->
      <EffectConfigurator :effect="effect" class="span-full" />

      <!-- Combat Parameters (Action, Range, Duration, Resistance) -->
      <div class="form-group span-full">
        <label class="field-label">Action & Timing Parameters</label>
        <div class="params-row">
          <div class="param-chip">
            <span class="param-label">Action:</span>
            <span class="param-value">{{ effect.action || 'Standard' }}</span>
          </div>
          <div class="param-chip">
            <span class="param-label">Range:</span>
            <span class="param-value">{{ effect.range || 'Close' }}</span>
          </div>
          <div class="param-chip">
            <span class="param-label">Duration:</span>
            <span class="param-value">{{ effect.duration || 'Instant' }}</span>
          </div>
          <div class="param-chip">
            <span class="param-label">Resisted By:</span>
            <span class="param-value highlight">{{ effect.resistance || 'Toughness' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modifiers Section (Extras & Flaws) -->
    <div class="canvas-modifiers-section">
      <div class="modifiers-section-header">
        <div class="sec-title">
          <i class="ri-tools-line"></i>
          <span>Applied Extras & Flaws</span>
        </div>
        <button
          type="button"
          class="btn-browse-mods"
          @click="builderStore.openModifierInspector(effect)"
        >
          <i class="ri-add-line"></i>
          <span>Browse Extras / Flaws</span>
        </button>
      </div>

      <!-- Applied Extras List -->
      <div class="mods-category-block">
        <div class="mods-block-header">
          <span class="mods-subhead extras-head">
            <i class="ri-add-circle-line"></i> Extras ({{ effect.extras?.length || 0 }})
          </span>
        </div>

        <div v-if="effect.extras && effect.extras.length > 0" class="applied-cards-grid">
          <div
            v-for="(extra, idx) in effect.extras"
            :key="extra.name + '_' + idx"
            class="modifier-card mod-card-extra"
          >
            <!-- Card Header: Title, Cost Badge, Delete -->
            <div class="mod-card-header">
              <div class="mod-card-identity">
                <span class="mod-card-title">{{ extra.name }}</span>
                <span v-if="extra.customText" class="mod-card-custom-preview">: {{ extra.customText }}</span>
              </div>
              <div class="mod-card-header-actions">
                <span class="mod-card-cost extra-cost">
                  {{ formatModCost(extra, false) }}
                </span>
                <button
                  type="button"
                  class="mod-card-del-btn"
                  title="Remove Extra"
                  @click="builderStore.removeModifierFromTarget(effect, false, extra.id || idx)"
                >
                  <i class="ri-close-line"></i>
                </button>
              </div>
            </div>

            <!-- Card Body: Description of Effect & Rules -->
            <div class="mod-card-body">
              <p class="mod-card-desc">{{ getModifierMeta(extra, false).desc }}</p>

              <!-- Custom Player Specification Input -->
              <div
                v-if="getModifierMeta(extra, false).hasCustomText || extra.customText !== undefined"
                class="mod-custom-text-wrapper"
              >
                <label class="mod-custom-text-label">
                  <i class="ri-edit-line"></i>
                  <span>{{ getModifierMeta(extra, false).customTextLabel || 'Specification / Detail:' }}</span>
                </label>
                <input
                  v-model="extra.customText"
                  type="text"
                  class="form-control form-control-sm mod-custom-input"
                  :placeholder="getModifierMeta(extra, false).customTextPlaceholder || 'Specify details...'"
                  @input="onModifierCustomTextInput(extra)"
                />
              </div>

              <!-- Optional Variant Chips (if options exist) -->
              <div
                v-if="getModifierMeta(extra, false).options?.length > 0"
                class="mod-card-options-wrapper"
              >
                <span class="mod-options-label">Active Variant:</span>
                <div class="mod-options-pills">
                  <button
                    v-for="opt in getModifierMeta(extra, false).options"
                    :key="opt.id"
                    type="button"
                    class="mod-option-pill extra-opt"
                    :class="{ active: (getSelectedOptionId(extra) || getModifierMeta(extra, false).options[0]?.id) === opt.id }"
                    @click="setModifierOptionDirect(extra, opt)"
                  >
                    {{ opt.label }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Card Footer: Stepper & Subtotal impact -->
            <div class="mod-card-footer">
              <div v-if="extra.hasRanks || getModifierMeta(extra, false).hasRanks" class="mod-card-stepper">
                <span class="stepper-label">Ranks:</span>
                <div class="stepper-group">
                  <button
                    type="button"
                    class="step-btn"
                    :disabled="(extra.ranks || 1) <= 1"
                    @click="builderStore.stepModifierRank(extra, -1)"
                  >-</button>
                  <span class="step-value">R{{ extra.ranks || 1 }}</span>
                  <button
                    type="button"
                    class="step-btn"
                    @click="builderStore.stepModifierRank(extra, 1)"
                  >+</button>
                </div>
              </div>
              <div v-else class="mod-card-flat-info">
                <i class="ri-shield-flash-line"></i>
                <span>Fixed Extra</span>
              </div>

              <div class="mod-card-subtotal">
                <span class="subtotal-label">Subtotal:</span>
                <span class="subtotal-val extra-text">
                  {{ calculateModSubtotal(extra, false) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-mods-notice">
          <i class="ri-information-line"></i>
          <span>No extras applied. Click "Browse Extras / Flaws" to add Multiattack, Area, Penetrating, etc.</span>
        </div>
      </div>

      <!-- Applied Flaws List -->
      <div class="mods-category-block">
        <div class="mods-block-header">
          <span class="mods-subhead flaws-head">
            <i class="ri-indeterminate-circle-line"></i> Flaws ({{ effect.flaws?.length || 0 }})
          </span>
        </div>

        <div v-if="effect.flaws && effect.flaws.length > 0" class="applied-cards-grid">
          <div
            v-for="(flaw, idx) in effect.flaws"
            :key="flaw.name + '_' + idx"
            class="modifier-card mod-card-flaw"
          >
            <!-- Card Header: Title, Cost Badge, Delete -->
            <div class="mod-card-header">
              <div class="mod-card-identity">
                <span class="mod-card-title">{{ flaw.name }}</span>
                <span v-if="flaw.customText" class="mod-card-custom-preview">: {{ flaw.customText }}</span>
              </div>
              <div class="mod-card-header-actions">
                <span class="mod-card-cost flaw-cost">
                  {{ formatModCost(flaw, true) }}
                </span>
                <button
                  type="button"
                  class="mod-card-del-btn"
                  title="Remove Flaw"
                  @click="builderStore.removeModifierFromTarget(effect, true, flaw.id || idx)"
                >
                  <i class="ri-close-line"></i>
                </button>
              </div>
            </div>

            <!-- Card Body: Description of Effect & Rules -->
            <div class="mod-card-body">
              <p class="mod-card-desc">{{ getModifierMeta(flaw, true).desc }}</p>

              <!-- Custom Player Specification Input -->
              <div
                v-if="getModifierMeta(flaw, true).hasCustomText || flaw.customText !== undefined"
                class="mod-custom-text-wrapper"
              >
                <label class="mod-custom-text-label">
                  <i class="ri-edit-line"></i>
                  <span>{{ getModifierMeta(flaw, true).customTextLabel || 'Specification / Detail:' }}</span>
                </label>
                <input
                  v-model="flaw.customText"
                  type="text"
                  class="form-control form-control-sm mod-custom-input"
                  :placeholder="getModifierMeta(flaw, true).customTextPlaceholder || 'Specify details...'"
                  @input="onModifierCustomTextInput(flaw)"
                />
              </div>

              <!-- Optional Variant Chips (if options exist) -->
              <div
                v-if="getModifierMeta(flaw, true).options?.length > 0"
                class="mod-card-options-wrapper"
              >
                <span class="mod-options-label">Active Variant:</span>
                <div class="mod-options-pills">
                  <button
                    v-for="opt in getModifierMeta(flaw, true).options"
                    :key="opt.id"
                    type="button"
                    class="mod-option-pill flaw-opt"
                    :class="{ active: (getSelectedOptionId(flaw) || getModifierMeta(flaw, true).options[0]?.id) === opt.id }"
                    @click="setModifierOptionDirect(flaw, opt)"
                  >
                    {{ opt.label }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Card Footer: Stepper & Subtotal impact -->
            <div class="mod-card-footer">
              <div v-if="flaw.hasRanks || getModifierMeta(flaw, true).hasRanks" class="mod-card-stepper">
                <span class="stepper-label">Ranks:</span>
                <div class="stepper-group">
                  <button
                    type="button"
                    class="step-btn"
                    :disabled="(flaw.ranks || 1) <= 1"
                    @click="builderStore.stepModifierRank(flaw, -1)"
                  >-</button>
                  <span class="step-value">R{{ flaw.ranks || 1 }}</span>
                  <button
                    type="button"
                    class="step-btn"
                    @click="builderStore.stepModifierRank(flaw, 1)"
                  >+</button>
                </div>
              </div>
              <div v-else class="mod-card-flat-info">
                <i class="ri-alert-line"></i>
                <span>Fixed Limitation</span>
              </div>

              <div class="mod-card-subtotal">
                <span class="subtotal-label">Discount:</span>
                <span class="subtotal-val flaw-text">
                  {{ calculateModSubtotal(flaw, true) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-mods-notice">
          <i class="ri-information-line"></i>
          <span>No flaws applied. Click "Browse Extras / Flaws" to add Noticeable, Quirk, Tiring, Unreliable, etc.</span>
        </div>
      </div>
    </div>

    <!-- LINKED EFFECTS SUITE (SIMULTANEOUS POWERS) -->
    <div class="canvas-linked-section">
      <div class="linked-section-header">
        <div class="sec-title">
          <i class="ri-links-line"></i>
          <span>Linked Effects (Simultaneous Powers)</span>
          <span class="badge badge-secondary">{{ linkedEffectsList.length }}</span>
        </div>
        <button
          type="button"
          class="btn-add-linked"
          @click="handleAddLinkedEffect"
        >
          <i class="ri-add-line"></i>
          <span>Add Linked Effect</span>
        </button>
      </div>

      <div class="linked-guidance-note">
        <i class="ri-information-line"></i>
        <span>
          <strong>Simultaneous Action:</strong> Linked effects occur together on the exact same action (e.g., Strike + Affliction, or Blast + Weaken). Each linked effect is bought with its own ranks, extras, and flaws.
        </span>
      </div>

      <!-- Linked Effects Cards List -->
      <div v-if="linkedEffectsList.length > 0" class="linked-effects-grid">
        <div
          v-for="(linkedEff, lIdx) in linkedEffectsList"
          :key="linkedEff.id || ('linked_' + lIdx)"
          class="linked-studio-card"
          :class="{ 'is-collapsed': isLinkedCollapsed(linkedEff, lIdx) }"
        >
          <!-- Card Top Bar / Dossier Header -->
          <div class="linked-card-top-bar">
            <div class="linked-top-left">
              <span class="linked-number-badge">
                <i class="ri-links-line"></i>
                #{{ lIdx + 1 }} Linked
              </span>
              <div class="linked-name-wrapper">
                <input
                  v-model="linkedEff.name"
                  type="text"
                  class="linked-title-input"
                  :placeholder="`${linkedEff.baseEffect || 'Effect'} (Linked)`"
                />
              </div>
            </div>

            <div class="linked-top-right">
              <span class="linked-cost-tag">{{ getLinkedCost(linkedEff) }} PP</span>

              <!-- Collapse / Expand Toggle Button -->
              <button
                type="button"
                class="btn-toggle-linked"
                :title="isLinkedCollapsed(linkedEff, lIdx) ? 'Expand Details' : 'Collapse Details'"
                @click="toggleLinkedCollapse(linkedEff, lIdx)"
              >
                <i :class="isLinkedCollapsed(linkedEff, lIdx) ? 'ri-arrow-down-s-line' : 'ri-arrow-up-s-line'"></i>
              </button>

              <!-- Remove Button -->
              <button
                type="button"
                class="btn-remove-linked"
                title="Remove Linked Effect"
                @click="handleRemoveLinkedEffect(lIdx)"
              >
                <i class="ri-close-line"></i>
              </button>
            </div>
          </div>

          <!-- Summary Strip when Collapsed -->
          <div
            v-if="isLinkedCollapsed(linkedEff, lIdx)"
            class="linked-collapsed-summary"
            @click="toggleLinkedCollapse(linkedEff, lIdx)"
          >
            <div class="collapsed-summary-left">
              <span class="collapsed-base-chip">
                <i class="ri-magic-line"></i>
                {{ linkedEff.baseEffect }}
              </span>
              <span class="collapsed-rank-chip">Rank {{ linkedEff.ranks }}</span>
              <span class="collapsed-param-chip">{{ linkedEff.action || 'Standard' }}</span>
              <span class="collapsed-param-chip">{{ linkedEff.range || 'Close' }}</span>
              <span class="collapsed-param-chip highlight">{{ linkedEff.resistance || 'Toughness' }}</span>
            </div>
            <div class="collapsed-summary-right">
              <span class="collapsed-mods-count">
                <i class="ri-tools-line"></i>
                {{ (linkedEff.extras?.length || 0) + (linkedEff.flaws?.length || 0) }} Modifiers
              </span>
              <span class="collapsed-expand-hint">Click to expand <i class="ri-arrow-down-s-line"></i></span>
            </div>
          </div>

          <!-- Expanded Body (Full Parity with Main Power) -->
          <div v-else class="linked-expanded-body">
            <!-- 1. Base Effect Banner & Library / Quick Switch (Split Layout) -->
            <div class="base-effect-card split-layout linked-base-card">
              <!-- Left Column: Identity & Selection Controls -->
              <div class="base-col-control">
                <div class="base-col-identity">
                  <div class="base-effect-icon-box linked-icon-box">
                    <i class="ri-magic-line"></i>
                  </div>
                  <div class="base-identity-text">
                    <div class="base-effect-name-row">
                      <span class="base-effect-title">{{ linkedEff.baseEffect || 'Affliction' }}</span>
                      <span class="badge badge-accent linked-badge-accent">{{ getLinkedBaseInfo(linkedEff).category }}</span>
                      <span class="base-effect-cost-tag linked-cost-pill">{{ getLinkedBaseInfo(linkedEff).cost }} PP / Rank</span>
                    </div>
                    <span class="base-type-subtitle">Linked Simultaneous Effect</span>
                  </div>
                </div>

                <div class="base-col-actions">
                  <button
                    type="button"
                    class="btn-open-effects-catalog linked-catalog-btn"
                    @click="builderStore.openEffectsLibrary(linkedEff)"
                  >
                    <i class="ri-book-open-line"></i>
                    <span>Browse Effects Library ({{ BASE_EFFECTS.length }} Effects)</span>
                  </button>

                  <div class="base-rank-stepper-box">
                    <label class="base-rank-label">
                      <i class="ri-bar-chart-line"></i>
                      <span>Effect Rank:</span>
                    </label>
                    <div class="rank-stepper-row">
                      <button
                        type="button"
                        class="btn-step"
                        :disabled="linkedEff.ranks <= 1"
                        @click="builderStore.updateEffectRank(linkedEff, -1)"
                        title="Decrease Rank"
                      >
                        <i class="ri-subtract-line"></i>
                      </button>
                      <span class="rank-display">Rank {{ linkedEff.ranks }}</span>
                      <button
                        type="button"
                        class="btn-step"
                        @click="builderStore.updateEffectRank(linkedEff, 1)"
                        title="Increase Rank"
                      >
                        <i class="ri-add-line"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right Column: Official Rules & Mechanics Description -->
              <div class="base-col-details">
                <div class="base-details-header">
                  <i class="ri-file-list-3-line"></i>
                  <span class="base-details-title">Effect Rules & Mechanics</span>
                </div>
                <p class="base-effect-desc">{{ getLinkedBaseInfo(linkedEff).desc }}</p>
              </div>
            </div>

            <!-- Linked Effect Configurator -->
            <EffectConfigurator :effect="linkedEff" :is-linked="true" class="span-full" />

            <!-- 2. Action / Timing Parameters Row -->
            <div class="linked-params-rank-grid">
              <!-- Combat Parameters -->
              <div class="linked-params-field" style="grid-column: 1 / -1;">
                <label class="field-label">Action & Timing Parameters</label>
                <div class="params-row">
                  <div class="param-chip">
                    <span class="param-label">Action:</span>
                    <span class="param-value">{{ linkedEff.action || 'Standard' }}</span>
                  </div>
                  <div class="param-chip">
                    <span class="param-label">Range:</span>
                    <span class="param-value">{{ linkedEff.range || 'Close' }}</span>
                  </div>
                  <div class="param-chip">
                    <span class="param-label">Duration:</span>
                    <span class="param-value">{{ linkedEff.duration || 'Instant' }}</span>
                  </div>
                  <div class="param-chip">
                    <span class="param-label">Resisted By:</span>
                    <span class="param-value highlight">{{ linkedEff.resistance || 'Toughness' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 3. Applied Extras & Flaws for Linked Effect (Modular Cards Grid) -->
            <div class="linked-modifiers-container">
              <div class="modifiers-section-header linked-mods-header">
                <div class="sec-title">
                  <i class="ri-tools-line"></i>
                  <span>Applied Extras & Flaws (Linked #{{ lIdx + 1 }})</span>
                </div>
                <button
                  type="button"
                  class="btn-browse-mods linked-btn-browse-mods"
                  @click="builderStore.openModifierInspector(linkedEff)"
                >
                  <i class="ri-add-line"></i>
                  <span>Browse Extras / Flaws</span>
                </button>
              </div>

              <!-- Linked Extras Sub-block -->
              <div class="mods-category-block">
                <div class="mods-block-header">
                  <span class="mods-subhead extras-head">
                    <i class="ri-add-circle-line"></i> Extras ({{ linkedEff.extras?.length || 0 }})
                  </span>
                </div>

                <div v-if="linkedEff.extras && linkedEff.extras.length > 0" class="applied-cards-grid">
                  <div
                    v-for="(extra, xIdx) in linkedEff.extras"
                    :key="extra.name + '_' + xIdx"
                    class="modifier-card mod-card-extra"
                  >
                    <!-- Header -->
                    <div class="mod-card-header">
                      <div class="mod-card-identity">
                        <span class="mod-cat-badge extra-badge">
                          {{ getModifierMeta(extra, false).category }}
                        </span>
                        <span class="mod-card-title">{{ extra.name }}</span>
                        <span v-if="extra.customText" class="mod-card-custom-preview">: {{ extra.customText }}</span>
                      </div>
                      <div class="mod-card-header-actions">
                        <span class="mod-card-cost extra-cost">
                          {{ formatModCost(extra, false) }}
                        </span>
                        <button
                          type="button"
                          class="mod-card-del-btn"
                          title="Remove Extra"
                          @click="builderStore.removeModifierFromTarget(linkedEff, false, extra.id || xIdx)"
                        >
                          <i class="ri-close-line"></i>
                        </button>
                      </div>
                    </div>

                    <!-- Body: Rules Description & Variant Options -->
                    <div class="mod-card-body">
                      <p class="mod-card-desc">{{ getModifierMeta(extra, false).desc }}</p>

                      <!-- Custom Player Specification Input -->
                      <div
                        v-if="getModifierMeta(extra, false).hasCustomText || extra.customText !== undefined"
                        class="mod-custom-text-wrapper"
                      >
                        <label class="mod-custom-text-label">
                          <i class="ri-edit-line"></i>
                          <span>{{ getModifierMeta(extra, false).customTextLabel || 'Specification / Detail:' }}</span>
                        </label>
                        <input
                          v-model="extra.customText"
                          type="text"
                          class="form-control form-control-sm mod-custom-input"
                          :placeholder="getModifierMeta(extra, false).customTextPlaceholder || 'Specify details...'"
                          @input="onModifierCustomTextInput(extra)"
                        />
                      </div>

                      <div
                        v-if="getModifierMeta(extra, false).options?.length > 0"
                        class="mod-card-options-wrapper"
                      >
                        <span class="mod-options-label">Active Variant:</span>
                        <div class="mod-options-pills">
                          <button
                            v-for="opt in getModifierMeta(extra, false).options"
                            :key="opt.id"
                            type="button"
                            class="mod-option-pill extra-opt"
                            :class="{ active: (getSelectedOptionId(extra) || getModifierMeta(extra, false).options[0]?.id) === opt.id }"
                            @click="setModifierOptionDirect(extra, opt)"
                          >
                            {{ opt.label }}
                          </button>
                        </div>
                      </div>
                    </div>

                    <!-- Footer: Stepper / Subtotal -->
                    <div class="mod-card-footer">
                      <div v-if="extra.hasRanks || getModifierMeta(extra, false).hasRanks" class="mod-card-stepper">
                        <span class="stepper-label">Ranks:</span>
                        <div class="stepper-group">
                          <button
                            type="button"
                            class="step-btn"
                            :disabled="(extra.ranks || 1) <= 1"
                            @click="builderStore.stepModifierRank(extra, -1)"
                          >-</button>
                          <span class="step-value">R{{ extra.ranks || 1 }}</span>
                          <button
                            type="button"
                            class="step-btn"
                            @click="builderStore.stepModifierRank(extra, 1)"
                          >+</button>
                        </div>
                      </div>
                      <div v-else class="mod-card-flat-info">
                        <i class="ri-shield-flash-line"></i>
                        <span>Fixed Extra</span>
                      </div>

                      <div class="mod-card-subtotal">
                        <span class="subtotal-label">Subtotal:</span>
                        <span class="subtotal-val extra-text">
                          {{ calculateModSubtotal(extra, false) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-else class="empty-mods-notice">
                  <i class="ri-information-line"></i>
                  <span>No extras applied to this linked effect. Click "Browse Extras / Flaws" to add Multiattack, Area, Cumulative, etc.</span>
                </div>
              </div>

              <!-- Linked Flaws Sub-block -->
              <div class="mods-category-block">
                <div class="mods-block-header">
                  <span class="mods-subhead flaws-head">
                    <i class="ri-indeterminate-circle-line"></i> Flaws ({{ linkedEff.flaws?.length || 0 }})
                  </span>
                </div>

                <div v-if="linkedEff.flaws && linkedEff.flaws.length > 0" class="applied-cards-grid">
                  <div
                    v-for="(flaw, fIdx) in linkedEff.flaws"
                    :key="flaw.name + '_' + fIdx"
                    class="modifier-card mod-card-flaw"
                  >
                    <!-- Header -->
                    <div class="mod-card-header">
                      <div class="mod-card-identity">
                        <span class="mod-cat-badge flaw-badge">
                          {{ getModifierMeta(flaw, true).category }}
                        </span>
                        <span class="mod-card-title">{{ flaw.name }}</span>
                        <span v-if="flaw.customText" class="mod-card-custom-preview">: {{ flaw.customText }}</span>
                      </div>
                      <div class="mod-card-header-actions">
                        <span class="mod-card-cost flaw-cost">
                          {{ formatModCost(flaw, true) }}
                        </span>
                        <button
                          type="button"
                          class="mod-card-del-btn"
                          title="Remove Flaw"
                          @click="builderStore.removeModifierFromTarget(linkedEff, true, flaw.id || fIdx)"
                        >
                          <i class="ri-close-line"></i>
                        </button>
                      </div>
                    </div>

                    <!-- Body: Rules Description & Variant Options -->
                    <div class="mod-card-body">
                      <p class="mod-card-desc">{{ getModifierMeta(flaw, true).desc }}</p>

                      <!-- Custom Player Specification Input -->
                      <div
                        v-if="getModifierMeta(flaw, true).hasCustomText || flaw.customText !== undefined"
                        class="mod-custom-text-wrapper"
                      >
                        <label class="mod-custom-text-label">
                          <i class="ri-edit-line"></i>
                          <span>{{ getModifierMeta(flaw, true).customTextLabel || 'Specification / Detail:' }}</span>
                        </label>
                        <input
                          v-model="flaw.customText"
                          type="text"
                          class="form-control form-control-sm mod-custom-input"
                          :placeholder="getModifierMeta(flaw, true).customTextPlaceholder || 'Specify details...'"
                          @input="onModifierCustomTextInput(flaw)"
                        />
                      </div>

                      <div
                        v-if="getModifierMeta(flaw, true).options?.length > 0"
                        class="mod-card-options-wrapper"
                      >
                        <span class="mod-options-label">Active Variant:</span>
                        <div class="mod-options-pills">
                          <button
                            v-for="opt in getModifierMeta(flaw, true).options"
                            :key="opt.id"
                            type="button"
                            class="mod-option-pill flaw-opt"
                            :class="{ active: (getSelectedOptionId(flaw) || getModifierMeta(flaw, true).options[0]?.id) === opt.id }"
                            @click="setModifierOptionDirect(flaw, opt)"
                          >
                            {{ opt.label }}
                          </button>
                        </div>
                      </div>
                    </div>

                    <!-- Footer: Stepper / Discount Subtotal -->
                    <div class="mod-card-footer">
                      <div v-if="flaw.hasRanks || getModifierMeta(flaw, true).hasRanks" class="mod-card-stepper">
                        <span class="stepper-label">Ranks:</span>
                        <div class="stepper-group">
                          <button
                            type="button"
                            class="step-btn"
                            :disabled="(flaw.ranks || 1) <= 1"
                            @click="builderStore.stepModifierRank(flaw, -1)"
                          >-</button>
                          <span class="step-value">R{{ flaw.ranks || 1 }}</span>
                          <button
                            type="button"
                            class="step-btn"
                            @click="builderStore.stepModifierRank(flaw, 1)"
                          >+</button>
                        </div>
                      </div>
                      <div v-else class="mod-card-flat-info">
                        <i class="ri-alert-line"></i>
                        <span>Fixed Limitation</span>
                      </div>

                      <div class="mod-card-subtotal">
                        <span class="subtotal-label">Discount:</span>
                        <span class="subtotal-val flaw-text">
                          {{ calculateModSubtotal(flaw, true) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-else class="empty-mods-notice">
                  <i class="ri-information-line"></i>
                  <span>No flaws applied to this linked effect. Click "Browse Extras / Flaws" to add Resistible, Limited, Grab-Based, etc.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-linked-card" @click="handleAddLinkedEffect">
        <i class="ri-link-m"></i>
        <p class="empty-linked-title">No Linked Effects Attached</p>
        <p class="empty-linked-sub">Click here to attach a secondary effect (e.g. poison, debuff, or sensory burst) that fires on the same action.</p>
      </div>
    </div>

    <!-- Effects Library Modal Mount -->
    <EffectsLibraryModal />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { usePowerBuilderStore } from '../../stores/powerBuilderStore.js';
import { useHeroStore } from '../../stores/heroStore.js';
import { BASE_EFFECTS, EXTRAS, FLAWS, calculateEffectCost } from '../../rules/powerEngine.js';
import EffectsLibraryModal from './EffectsLibraryModal.vue';
import EffectConfigurator from './EffectConfigurator.vue';

const heroStore = useHeroStore();
const builderStore = usePowerBuilderStore();

const props = defineProps({
  effect: {
    type: Object,
    required: true
  },
  title: {
    type: String,
    default: 'Effect Editor'
  }
});

const effectCategories = ['Attack', 'Defense', 'Movement', 'Sensory', 'Control & Utility'];

function getEffectsByCategory(category) {
  return BASE_EFFECTS.filter(b => b.category === category);
}

const effectCost = computed(() => {
  return calculateEffectCost(props.effect, 0);
});

const currentBaseInfo = computed(() => {
  return BASE_EFFECTS.find(b => b.name === props.effect.baseEffect) || {
    name: props.effect.baseEffect,
    category: 'Superhuman',
    cost: props.effect.baseCost || 1,
    desc: 'Superhuman base effect.'
  };
});

const linkedEffectsList = computed(() => {
  if (Array.isArray(props.effect.linkedEffects) && props.effect.linkedEffects.length > 0) {
    return props.effect.linkedEffects;
  }
  if (builderStore.power.type === 'device') {
    return builderStore.activeSubPower?.linkedEffects || [];
  }
  if (builderStore.activeTargetType === 'slot') {
    return builderStore.power.alternateEffects?.[builderStore.activeSlotIndex]?.linkedEffects || [];
  }
  return builderStore.power.linkedEffects || [];
});

function handleAddLinkedEffect() {
  builderStore.addLinkedEffect(props.effect, 'Affliction');
}

function handleRemoveLinkedEffect(idx) {
  builderStore.removeLinkedEffect(props.effect, idx);
}

function getLinkedCost(linkedEff) {
  return calculateEffectCost(linkedEff, 0).totalCost;
}

function handleBaseChange(newBase) {
  builderStore.setEffectBase(props.effect, newBase);
}

// Linked Effects Handlers & Collapse State
const collapsedLinkedMap = ref({});

function isLinkedCollapsed(linkedEff, idx) {
  const key = linkedEff.id || `l_${idx}`;
  return !!collapsedLinkedMap.value[key];
}

function toggleLinkedCollapse(linkedEff, idx) {
  const key = linkedEff.id || `l_${idx}`;
  collapsedLinkedMap.value[key] = !collapsedLinkedMap.value[key];
}

function getLinkedBaseInfo(linkedEff) {
  return BASE_EFFECTS.find(b => b.name === linkedEff?.baseEffect) || {
    name: linkedEff?.baseEffect || 'Effect',
    category: 'Superhuman',
    cost: linkedEff?.baseCost || 1,
    desc: 'Official M&M 3E superhuman base effect.'
  };
}

function handleLinkedBaseChange(linkedEff, newBase) {
  builderStore.setEffectBase(linkedEff, newBase);
}

// Helpers for Applied Extras & Flaws Master-Detail Cards
function getModifierMeta(mod, isFlaw = false) {
  const catalog = isFlaw ? FLAWS : EXTRAS;
  const match = catalog.find(item => (item.name || '').toLowerCase() === (mod.name || '').toLowerCase());
  return {
    name: mod.name,
    category: mod.category || match?.category || (isFlaw ? 'Limitation' : 'Combat & Utility'),
    desc: mod.desc || match?.desc || 'Applies mechanical rules and modifications to this power effect.',
    options: match?.options || mod.options || [],
    hasConfig: match?.hasConfig || mod.hasConfig || false,
    hasRanks: mod.hasRanks ?? match?.hasRanks ?? false,
    hasCustomText: mod.hasCustomText ?? match?.hasCustomText ?? false,
    customTextLabel: mod.customTextLabel || match?.customTextLabel || 'Specification / Detail:',
    customTextPlaceholder: mod.customTextPlaceholder || match?.customTextPlaceholder || 'Specify details...',
    costDisplay: match?.costDisplay || ''
  };
}

function onModifierCustomTextInput(mod) {
  if (mod) {
    if (!mod.config) mod.config = {};
    mod.config.customText = mod.customText;
    heroStore.pushHistory();
  }
}

function getSelectedOptionId(mod) {
  return mod?.config?.optionId || mod?.optionId || null;
}

function setModifierOptionDirect(mod, opt) {
  mod.config = mod.config || {};
  mod.config.optionId = opt.id;
  if (opt.cost !== undefined) mod.cost = opt.cost;
  if (opt.type !== undefined) mod.type = opt.type;
}

function formatModCost(mod, isFlaw = false) {
  const cost = Number(mod.cost) || 0;
  const prefix = (!isFlaw && cost >= 0) ? `+${cost}` : `${cost}`;
  if (mod.type === 'per_rank') return `${prefix} PP/R`;
  if (mod.type === 'flat_per_rank') return `${prefix} Flat/R`;
  return `${prefix} Flat`;
}

function calculateModSubtotal(mod, isFlaw = false) {
  const ranks = Number(mod.ranks) || 1;
  const cost = Number(mod.cost) || 0;
  if (mod.type === 'per_rank') {
    return isFlaw ? `${cost} PP/Rank` : `+${cost} PP/Rank`;
  }
  if (mod.type === 'flat_per_rank') {
    const total = cost * ranks;
    return isFlaw ? `${total} PP Flat` : `+${total} PP Flat`;
  }
  return isFlaw ? `${cost} PP Flat` : `+${cost} PP Flat`;
}
</script>

<style scoped>
.effect-editor-canvas {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1.15rem;
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
}

.canvas-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-subtle);
  padding-bottom: 0.75rem;
}

.canvas-title-group {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.canvas-badge {
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--accent-primary);
  letter-spacing: 0.06em;
}

.canvas-effect-name {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
}

.canvas-cost-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: rgba(0, 111, 184, 0.1);
  border: 1px solid rgba(0, 111, 184, 0.25);
  padding: 0.25rem 0.65rem;
  border-radius: var(--radius-xs);
}

.cost-calc-label {
  font-size: 0.7rem;
  color: var(--text-muted);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.cost-calc-val {
  font-size: 0.88rem;
  font-weight: 900;
  color: var(--accent-primary);
  font-variant-numeric: tabular-nums;
}

.canvas-form-grid {
  display: grid;
  grid-template-columns: minmax(180px, 1.5fr) minmax(180px, 1.5fr) minmax(130px, 1fr);
  gap: 0.85rem;
}

.span-full {
  grid-column: 1 / -1;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field-label {
  font-size: 0.74rem;
  font-weight: 700;
  color: var(--text-secondary);
}

.input-with-icon,
.select-with-icon {
  display: flex;
  align-items: center;
  position: relative;
}

.input-with-icon i,
.select-with-icon i {
  position: absolute;
  left: 0.75rem;
  color: var(--text-muted);
  font-size: 0.9rem;
  pointer-events: none;
}

.text-input,
.select-input {
  width: 100%;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  color: var(--text-primary);
  padding: 0.5rem 0.75rem 0.5rem 2.2rem;
  border-radius: var(--radius-sm);
  font-size: 0.84rem;
  font-family: inherit;
  outline: none;
  transition: border-color var(--trans-fast), box-shadow var(--trans-fast), background-color var(--trans-fast);
}

.text-input:focus,
.select-input:focus {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 2px rgba(0, 111, 184, 0.25);
}

.rank-stepper-row {
  display: flex;
  align-items: center;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 0.2rem;
}

.btn-step {
  width: 32px;
  height: 32px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  color: var(--text-primary);
  border-radius: calc(var(--radius-sm) - 0.2rem);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  transition: background-color var(--trans-fast), border-color var(--trans-fast), color var(--trans-fast), transform var(--trans-fast);
}

.btn-step:hover:not(:disabled) {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
  color: #fff;
}

.btn-step:active:not(:disabled) {
  transform: scale(0.95);
}

.btn-step:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.rank-display {
  flex: 1;
  text-align: center;
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}

.params-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.5rem;
}

.param-chip {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xs);
  padding: 0.4rem 0.65rem;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.param-label {
  font-size: 0.65rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.param-value {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-primary);
}

.param-value.highlight {
  color: var(--text-primary);
}

.canvas-modifiers-section {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding-top: 1.15rem;
  margin-top: 0.25rem;
}

.modifiers-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sec-title {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.sec-title i {
  color: var(--accent-primary);
}

.btn-browse-mods {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  font-size: 0.74rem;
  font-weight: 700;
  padding: 0.35rem 0.75rem;
  border-radius: var(--radius-xs);
  cursor: pointer;
  transition: background-color var(--trans-fast), border-color var(--trans-fast), color var(--trans-fast), transform var(--trans-fast);
}

.btn-browse-mods:hover {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
  color: #fff;
}

.btn-browse-mods:active {
  transform: scale(0.96);
}

.btn-browse-mods:hover {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
  color: #fff;
}

.mods-category-block {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.mods-block-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.mods-subhead {
  font-size: 0.74rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.extras-head { color: var(--text-secondary); }
.flaws-head { color: var(--text-secondary); }
.extras-head i { color: #34d399; }
.flaws-head i { color: #f87171; }

.applied-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 0.75rem;
}

.modifier-card {
  background: var(--bg-card);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
  padding: 0.8rem 0.95rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  position: relative;
  transition: border-color var(--trans-fast), box-shadow var(--trans-fast);
}

.modifier-card.mod-card-extra {
  border-color: rgba(16, 185, 129, 0.28);
  background: linear-gradient(180deg, rgba(16, 185, 129, 0.05) 0%, var(--bg-card) 45%);
}

.modifier-card.mod-card-extra:hover {
  border-color: rgba(16, 185, 129, 0.45);
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.08);
}

.modifier-card.mod-card-flaw {
  border-color: rgba(239, 68, 68, 0.28);
  background: linear-gradient(180deg, rgba(239, 68, 68, 0.05) 0%, var(--bg-card) 45%);
}

.modifier-card.mod-card-flaw:hover {
  border-color: rgba(239, 68, 68, 0.45);
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.08);
}

.mod-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.mod-card-identity {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  min-width: 0;
}

.mod-cat-badge {
  font-size: 0.62rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.15rem 0.4rem;
  border-radius: var(--radius-xs);
  white-space: nowrap;
}

.extra-badge {
  background: rgba(16, 185, 129, 0.2);
  border: 1px solid rgba(16, 185, 129, 0.35);
  color: #34d399;
}

.flaw-badge {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.35);
  color: #f87171;
}

.mod-card-title {
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mod-card-header-actions {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;
}

.mod-card-cost {
  font-size: 0.72rem;
  font-weight: 800;
  padding: 0.18rem 0.5rem;
  border-radius: var(--radius-xs);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
}

.extra-cost {
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #a7f3d0;
}

.flaw-cost {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fecaca;
}

.mod-card-del-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  border-radius: var(--radius-xs);
  transition: color var(--trans-fast), background var(--trans-fast), transform var(--trans-fast);
}

.mod-card-del-btn:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.15);
}

.mod-card-del-btn:active {
  transform: scale(0.92);
}

.mod-card-body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mod-card-custom-preview {
  font-size: 0.8rem;
  font-weight: 600;
  color: #60a5fa;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 160px;
}

.mod-custom-text-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  background: rgba(0, 0, 0, 0.28);
  padding: 0.45rem 0.6rem;
  border-radius: var(--radius-xs);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.mod-custom-text-label {
  font-size: 0.68rem;
  font-weight: 700;
  color: #93c5fd;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin: 0;
}

.mod-custom-input {
  width: 100%;
  font-size: 0.78rem;
  padding: 0.3rem 0.5rem;
  background: rgba(11, 17, 34, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: var(--radius-xs);
  color: var(--text-primary);
  transition: border-color var(--trans-fast), box-shadow var(--trans-fast);
}

.mod-custom-input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 2px rgba(0, 111, 184, 0.3);
}

.mod-custom-input::placeholder {
  color: #64748b;
  font-style: italic;
}

.mod-card-desc {
  font-size: 0.75rem;
  line-height: 1.5;
  color: var(--text-secondary);
  margin: 0;
  white-space: pre-line;
}

.mod-card-options-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.28rem;
  background: rgba(0, 0, 0, 0.25);
  padding: 0.4rem 0.55rem;
  border-radius: var(--radius-xs);
  border: 1px solid var(--border-subtle);
}

.mod-options-label {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.mod-options-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.mod-option-pill {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.18rem 0.45rem;
  border-radius: var(--radius-xs);
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--trans-fast);
}

.mod-option-pill:hover {
  border-color: var(--accent-primary);
  color: var(--text-primary);
}

.mod-option-pill:active {
  transform: scale(0.96);
}

.mod-option-pill.active {
  background: rgba(16, 185, 129, 0.22);
  border-color: rgba(16, 185, 129, 0.55);
  color: #a7f3d0;
  font-weight: 800;
}

.mod-option-pill.flaw-opt.active {
  background: rgba(239, 68, 68, 0.22);
  border-color: rgba(239, 68, 68, 0.55);
  color: #fecaca;
  font-weight: 800;
}

.mod-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border-subtle);
  margin-top: auto;
  gap: 0.5rem;
}

.mod-card-stepper {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.stepper-label {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.stepper-group {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  background: rgba(0, 0, 0, 0.3);
  padding: 0.12rem 0.35rem;
  border-radius: var(--radius-xs);
  border: 1px solid var(--border-subtle);
}

.step-btn {
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: 0.78rem;
  font-weight: 900;
  cursor: pointer;
  padding: 0 0.25rem;
  border-radius: 2px;
  transition: background var(--trans-fast), transform var(--trans-fast);
}

.step-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.15);
}

.step-btn:active:not(:disabled) {
  transform: scale(0.92);
}

.step-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.step-value {
  font-size: 0.74rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  padding: 0 0.2rem;
}

.mod-card-flat-info {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--text-muted);
}

.mod-card-flat-info i {
  font-size: 0.75rem;
}

.mod-card-subtotal {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  margin-left: auto;
}

.subtotal-label {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.subtotal-val {
  font-size: 0.78rem;
  font-weight: 900;
  font-variant-numeric: tabular-nums;
}

.extra-text {
  color: #34d399;
}

.flaw-text {
  color: #f87171;
}

.empty-mods-notice {
  font-size: 0.76rem;
  color: var(--text-muted);
  font-style: italic;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.6rem 0.85rem;
  background: rgba(255, 255, 255, 0.02);
  border-radius: var(--radius-xs);
  border: 1px dashed var(--border-subtle);
}

.empty-mods-notice i {
  font-size: 0.95rem;
  opacity: 0.7;
}

/* ==========================================================================
   BASE EFFECT BANNER & CATALOG LAUNCHER
   ========================================================================== */
.base-effect-card.split-layout {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 1.15rem 1.25rem;
  display: grid;
  grid-template-columns: minmax(320px, 1fr) 1.6fr;
  gap: 1.5rem;
  align-items: stretch;
  position: relative;
  box-shadow: var(--shadow-sm);
}

@media (max-width: 900px) {
  .base-effect-card.split-layout {
    grid-template-columns: 1fr;
    gap: 1.15rem;
  }
}

.base-col-control {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1rem;
}

.base-col-identity {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
}

.base-effect-icon-box {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-xs);
  background: rgba(0, 111, 184, 0.12);
  border: 1px solid rgba(0, 111, 184, 0.3);
  color: var(--accent-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.35rem;
  flex-shrink: 0;
  margin-top: 2px;
}

.base-identity-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.base-effect-name-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.base-effect-title {
  font-size: 1.15rem;
  font-weight: 900;
  color: #fff;
  letter-spacing: -0.01em;
}

.base-effect-cost-tag {
  font-size: 0.74rem;
  font-weight: 700;
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-color);
  padding: 0.12rem 0.45rem;
  border-radius: var(--radius-xs);
  font-variant-numeric: tabular-nums;
}

.base-type-subtitle {
  font-size: 0.68rem;
  color: var(--text-muted);
  font-weight: 600;
}

.base-col-actions {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.btn-open-effects-catalog {
  background: var(--accent-primary);
  color: #fff;
  border: 1px solid var(--accent-primary-hover);
  border-radius: var(--radius-xs);
  padding: 0.5rem 0.85rem;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  box-shadow: var(--shadow-sm);
  transition: background-color var(--trans-fast), border-color var(--trans-fast), transform var(--trans-fast);
  width: 100%;
}

.btn-open-effects-catalog:hover {
  background: var(--accent-primary-hover);
  border-color: var(--accent-primary);
  transform: translateY(-1px);
}

.btn-open-effects-catalog:active {
  transform: scale(0.97);
}

.base-rank-stepper-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.65rem;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xs);
  padding: 0.35rem 0.65rem;
}

.base-rank-label {
  font-size: 0.72rem;
  color: var(--text-secondary);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  white-space: nowrap;
}

.base-rank-label i {
  color: var(--accent-primary);
  font-size: 0.85rem;
}

.base-rank-stepper-box .rank-stepper-row {
  flex: 1;
  max-width: 170px;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  padding: 0.15rem;
  border-radius: var(--radius-xs);
}

.base-rank-stepper-box .btn-step {
  width: 26px;
  height: 26px;
  font-size: 0.85rem;
}

.base-rank-stepper-box .rank-display {
  font-size: 0.84rem;
  font-weight: 800;
  color: #fff;
}

/* Right Column: Rules & Mechanics */
.base-col-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  border-left: 1px solid rgba(255, 255, 255, 0.08);
  padding-left: 1.5rem;
  justify-content: center;
}

@media (max-width: 900px) {
  .base-col-details {
    border-left: none;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    padding-left: 0;
    padding-top: 1rem;
  }
}

.base-details-header {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.base-details-header i {
  color: var(--accent-primary);
  font-size: 0.85rem;
}

.base-effect-desc {
  font-size: 0.76rem;
  color: var(--text-secondary);
  line-height: 1.55;
  margin: 0;
}

/* ==========================================================================
   LINKED EFFECTS SUITE (SIMULTANEOUS POWERS)
   ========================================================================== */
.canvas-linked-section {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.linked-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-add-linked {
  background: rgba(0, 111, 184, 0.12);
  border: 1px solid rgba(0, 111, 184, 0.3);
  color: #38bdf8;
  border-radius: var(--radius-xs);
  padding: 0.35rem 0.75rem;
  font-size: 0.76rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  transition: background-color var(--trans-fast), border-color var(--trans-fast), transform var(--trans-fast);
}

.btn-add-linked:hover {
  background: var(--accent-primary);
  border-color: var(--accent-primary-hover);
  color: #fff;
}

.btn-add-linked:active {
  transform: scale(0.96);
}

.linked-guidance-note {
  padding: 0.45rem 0.65rem;
  background: rgba(59, 130, 246, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: var(--radius-xs);
  display: flex;
  align-items: flex-start;
  gap: 0.45rem;
  font-size: 0.72rem;
  color: var(--text-secondary);
  line-height: 1.45;
}

.linked-guidance-note i {
  color: #60a5fa;
  font-size: 0.9rem;
  margin-top: 0.05rem;
  flex-shrink: 0;
}

.linked-effects-grid {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

/* ==========================================================================
   LINKED STUDIO CARD STYLES
   ========================================================================== */
.linked-studio-card {
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 1rem 1.15rem;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  position: relative;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  transition: border-color var(--trans-fast), box-shadow var(--trans-fast), background-color var(--trans-fast);
}

.linked-studio-card:hover {
  border-color: var(--border-color-hover, rgba(255, 255, 255, 0.2));
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.linked-studio-card.is-collapsed {
  padding: 0.75rem 1rem;
  gap: 0.5rem;
  background: rgba(15, 23, 42, 0.55);
}

/* Card Top Bar / Dossier Header */
.linked-card-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.linked-top-left {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex: 1;
  min-width: 240px;
}

.linked-number-badge {
  font-size: 0.72rem;
  font-weight: 800;
  color: #38bdf8;
  background: rgba(6, 182, 212, 0.15);
  border: 1px solid rgba(6, 182, 212, 0.35);
  padding: 0.22rem 0.55rem;
  border-radius: var(--radius-xs);
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  white-space: nowrap;
  letter-spacing: 0.02em;
}

.linked-number-badge i {
  font-size: 0.82rem;
  color: #06b6d4;
}

.linked-name-wrapper {
  flex: 1;
  min-width: 160px;
}

.linked-title-input {
  width: 100%;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  color: #fff;
  font-size: 0.92rem;
  font-weight: 800;
  padding: 0.3rem 0.65rem;
  border-radius: var(--radius-xs);
  outline: none;
  font-family: inherit;
  transition: border-color var(--trans-fast), background-color var(--trans-fast), box-shadow var(--trans-fast);
}

.linked-title-input:hover,
.linked-title-input:focus {
  background: var(--bg-surface);
  border-color: #06b6d4;
  box-shadow: 0 0 0 2px rgba(6, 182, 212, 0.2);
}

.linked-top-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.linked-cost-tag {
  font-size: 0.82rem;
  font-weight: 900;
  color: #22d3ee;
  background: rgba(6, 182, 212, 0.14);
  border: 1px solid rgba(6, 182, 212, 0.35);
  padding: 0.2rem 0.6rem;
  border-radius: var(--radius-xs);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
}

.btn-toggle-linked {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  border-radius: var(--radius-xs);
  padding: 0.25rem 0.45rem;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color var(--trans-fast), border-color var(--trans-fast), background-color var(--trans-fast), transform var(--trans-fast);
}

.btn-toggle-linked:hover {
  color: #38bdf8;
  border-color: rgba(6, 182, 212, 0.4);
  background: rgba(6, 182, 212, 0.1);
}

.btn-toggle-linked:active {
  transform: scale(0.95);
}

.btn-remove-linked {
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 0.95rem;
  padding: 0.25rem;
  border-radius: var(--radius-xs);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color var(--trans-fast), background var(--trans-fast), border-color var(--trans-fast);
}

.btn-remove-linked:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.25);
}

/* Collapsed Summary Strip */
.linked-collapsed-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  background: rgba(6, 182, 212, 0.06);
  border: 1px dashed rgba(6, 182, 212, 0.25);
  border-radius: var(--radius-xs);
  padding: 0.45rem 0.75rem;
  cursor: pointer;
  transition: background-color var(--trans-fast), border-color var(--trans-fast);
  flex-wrap: wrap;
}

.linked-collapsed-summary:hover {
  background: rgba(6, 182, 212, 0.12);
  border-color: rgba(6, 182, 212, 0.45);
}

.collapsed-summary-left {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-wrap: wrap;
}

.collapsed-base-chip {
  font-size: 0.74rem;
  font-weight: 800;
  color: #fff;
  background: rgba(6, 182, 212, 0.2);
  border: 1px solid rgba(6, 182, 212, 0.35);
  padding: 0.15rem 0.45rem;
  border-radius: var(--radius-xs);
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.collapsed-base-chip i {
  color: #38bdf8;
}

.collapsed-rank-chip {
  font-size: 0.72rem;
  font-weight: 800;
  color: #e2e8f0;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  padding: 0.15rem 0.45rem;
  border-radius: var(--radius-xs);
  font-variant-numeric: tabular-nums;
}

.collapsed-param-chip {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--text-muted);
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid var(--border-subtle);
  padding: 0.12rem 0.4rem;
  border-radius: var(--radius-xs);
}

.collapsed-param-chip.highlight {
  color: #38bdf8;
  border-color: rgba(56, 189, 248, 0.3);
}

.collapsed-summary-right {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.collapsed-mods-count {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--text-secondary);
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.collapsed-mods-count i {
  color: #38bdf8;
}

.collapsed-expand-hint {
  font-size: 0.68rem;
  color: #38bdf8;
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  font-weight: 700;
}

/* Expanded Body */
.linked-expanded-body {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

/* Linked Base Card Overrides */
.base-effect-card.split-layout.linked-base-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

.linked-icon-box {
  background: rgba(0, 111, 184, 0.12) !important;
  border: 1px solid rgba(0, 111, 184, 0.3) !important;
  color: var(--accent-primary) !important;
}

.linked-badge-accent {
  background: rgba(0, 111, 184, 0.15) !important;
  color: #38bdf8 !important;
  border: 1px solid rgba(0, 111, 184, 0.3) !important;
}

.linked-cost-pill {
  color: var(--text-secondary) !important;
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid var(--border-color) !important;
}

.linked-catalog-btn {
  background: var(--accent-primary) !important;
  border: 1px solid var(--accent-primary-hover) !important;
  box-shadow: var(--shadow-sm) !important;
}

.linked-catalog-btn:hover {
  background: var(--accent-primary-hover) !important;
}

/* Linked Rank & Parameters Row */
.linked-params-rank-grid {
  display: grid;
  grid-template-columns: minmax(180px, 220px) 1fr;
  gap: 0.85rem;
  align-items: start;
}

@media (max-width: 768px) {
  .linked-params-rank-grid {
    grid-template-columns: 1fr;
  }
}

.linked-rank-field,
.linked-params-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

/* Linked Modifiers Container */
.linked-modifiers-container {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  border-top: 1px solid rgba(6, 182, 212, 0.2);
  padding-top: 0.85rem;
}

.linked-mods-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.linked-btn-browse-mods {
  background: rgba(6, 182, 212, 0.14) !important;
  border: 1px solid rgba(6, 182, 212, 0.4) !important;
  color: #67e8f9 !important;
}

.linked-btn-browse-mods:hover {
  background: #0891b2 !important;
  border-color: #06b6d4 !important;
  color: #fff !important;
}

.empty-linked-card {
  background: var(--bg-surface);
  border: 1.5px dashed var(--border-subtle);
  border-radius: var(--radius-xs);
  padding: 1.5rem 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  cursor: pointer;
  transition: border-color var(--trans-fast), background-color var(--trans-fast), transform var(--trans-fast);
}

.empty-linked-card:hover {
  border-color: #34d399;
  background: rgba(16, 185, 129, 0.04);
}

.empty-linked-card:active {
  transform: scale(0.98);
}

.empty-linked-card i {
  font-size: 1.5rem;
  color: var(--text-muted);
  margin-bottom: 0.35rem;
  display: inline-block;
}

.empty-linked-card:hover i {
  color: #34d399;
}

.empty-linked-title {
  font-size: 0.8rem;
  font-weight: 800;
  color: var(--text-secondary);
  margin-bottom: 0.15rem;
  max-width: 100%;
  margin-left: auto;
  margin-right: auto;
  text-align: center;
}

.empty-linked-sub {
  font-size: 0.72rem;
  color: var(--text-muted);
  margin: 0;
  max-width: 65ch;
  margin-left: auto;
  margin-right: auto;
  text-align: center;
}
</style>
