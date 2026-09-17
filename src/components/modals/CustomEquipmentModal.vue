<template>
  <transition name="modal-pop">
    <div v-if="modelValue" class="eq-modal-backdrop" @click.self="closeModal">
      <div class="eq-studio-card">
        <!-- Studio Header -->
        <div class="eq-studio-header">
          <div class="header-branding">
            <span class="studio-badge"><i class="ri-tools-fill"></i> GEAR FORGE</span>
            <h3 class="studio-title">Custom Equipment Studio</h3>
          </div>

          <!-- Stepper Indicator in Header -->
          <div class="studio-stepper">
            <button
              v-for="st in steps"
              :key="st.num"
              type="button"
              class="stepper-tab"
              :class="{
                active: currentStep === st.num,
                completed: currentStep > st.num
              }"
              @click="goToStep(st.num)"
            >
              <span class="step-num">
                <i v-if="currentStep > st.num" class="ri-check-line"></i>
                <span v-else>{{ st.num }}</span>
              </span>
              <span class="step-label">{{ st.label }}</span>
            </button>
          </div>

          <button type="button" class="studio-close-btn" @click="closeModal" title="Close Studio">
            <i class="ri-close-line"></i>
          </button>
        </div>

        <!-- Studio 2-Column Body -->
        <div class="eq-studio-body">
          <!-- Left Column: Step Content (65%) -->
          <div class="eq-step-workspace">
            <!-- ======================================================= -->
            <!-- STEP 1: CATEGORY & IDENTITY -->
            <!-- ======================================================= -->
            <div v-if="currentStep === 1" class="step-pane">
              <div class="step-pane-head">
                <h4>1. Choose Equipment Category & Identity</h4>
                <p>Select the official M&M 3e equipment domain and name your custom gear.</p>
              </div>

              <!-- 5 Category Cards Grid -->
              <div class="category-cards-grid">
                <button
                  v-for="cat in categoryCards"
                  :key="cat.id"
                  type="button"
                  class="cat-select-card"
                  :class="{ selected: selectedCategory === cat.id }"
                  @click="selectCategory(cat.id)"
                >
                  <div class="cat-card-icon">
                    <i :class="cat.icon"></i>
                  </div>
                  <div class="cat-card-info">
                    <strong class="cat-card-title">{{ cat.label }}</strong>
                    <span class="cat-card-desc">{{ cat.desc }}</span>
                  </div>
                  <span v-if="selectedCategory === cat.id" class="cat-selected-check">
                    <i class="ri-checkbox-circle-fill"></i>
                  </span>
                </button>
              </div>

              <!-- Item Name Input -->
              <div class="eq-form-group mt-4">
                <div class="eq-label-row">
                  <label for="eq-item-name">Item Name *</label>
                  <span class="eq-hint-text">Choose a distinctive, realistic superhero or tactical name</span>
                </div>
                <input
                  id="eq-item-name"
                  v-model="itemName"
                  type="text"
                  class="eq-text-input"
                  :placeholder="getNamePlaceholder(selectedCategory)"
                  @keyup.enter="nextStep"
                />
              </div>

              <!-- Suggestions Chips -->
              <div class="preset-name-suggestions">
                <span class="sug-label">QUICK IDEAS:</span>
                <div class="sug-chips">
                  <button
                    v-for="sug in getNameSuggestions(selectedCategory)"
                    :key="sug"
                    type="button"
                    class="sug-chip"
                    @click="itemName = sug"
                  >
                    {{ sug }}
                  </button>
                </div>
              </div>
            </div>

            <!-- ======================================================= -->
            <!-- STEP 2: BASE MECHANICAL SPECS -->
            <!-- ======================================================= -->
            <div v-else-if="currentStep === 2" class="step-pane">
              <div class="step-pane-head">
                <h4>2. Configure Base Mechanical Specifications</h4>
                <p>Set up fundamental power ranks, size, strength, and core combat properties.</p>
              </div>

              <!-- 2A. WEAPONS SPEC FORM -->
              <div v-if="selectedCategory === 'Weapons'" class="spec-form-section">
                <!-- Range Mode Toggle -->
                <div class="spec-toggle-row">
                  <label>Weapon Type & Range</label>
                  <div class="range-toggle-group">
                    <button
                      type="button"
                      class="toggle-btn"
                      :class="{ active: weaponConfig.rangeType === 'Close' }"
                      @click="weaponConfig.rangeType = 'Close'"
                    >
                      <i class="ri-sword-line"></i> Melee (1 EP/Rk)
                    </button>
                    <button
                      type="button"
                      class="toggle-btn"
                      :class="{ active: weaponConfig.rangeType === 'Ranged' }"
                      @click="weaponConfig.rangeType = 'Ranged'"
                    >
                      <i class="ri-focus-2-line"></i> Ranged (2 EP/Rk)
                    </button>
                  </div>
                </div>

                <!-- Damage Rank Stepper -->
                <div class="spec-stepper-box">
                  <div class="stepper-box-info">
                    <span class="box-title">Damage Rank</span>
                    <span class="box-desc">
                      Base damage output ({{ weaponConfig.rangeType === 'Ranged' ? '2 EP per rank' : '1 EP per rank' }}).
                    </span>
                  </div>
                  <div class="studio-stepper-ctrl">
                    <button
                      type="button"
                      class="btn-step"
                      :disabled="weaponConfig.damageRank <= 1"
                      @click="weaponConfig.damageRank = Math.max(1, weaponConfig.damageRank - 1)"
                    >-</button>
                    <span class="step-display-val">{{ weaponConfig.damageRank }}</span>
                    <button
                      type="button"
                      class="btn-step"
                      @click="weaponConfig.damageRank = weaponConfig.damageRank + 1"
                    >+</button>
                    <span class="step-cost-subtle">
                      {{ weaponConfig.damageRank * (weaponConfig.rangeType === 'Ranged' ? 2 : 1) }} EP
                    </span>
                  </div>
                </div>

                <!-- Strength-Based Option (Melee Only) -->
                <div v-if="weaponConfig.rangeType === 'Close'" class="spec-checkbox-box">
                  <label class="custom-chk-label">
                    <input v-model="weaponConfig.isStrengthBased" type="checkbox" />
                    <span class="chk-custom"></span>
                    <div class="chk-text">
                      <strong>Strength-Based Damage (+0 EP)</strong>
                      <span>Adds hero's STR rank ({{ heroStore.effectiveAbilities.STR || 0 }}) to the attack's final Damage DC.</span>
                    </div>
                  </label>
                </div>

                <!-- Attack Bonus Modifier -->
                <div class="spec-stepper-box">
                  <div class="stepper-box-info">
                    <span class="box-title">Accurate / Built-in Attack Bonus</span>
                    <span class="box-desc">Laser sight, balanced grip, or optics (+1 EP per +1 bonus).</span>
                  </div>
                  <div class="studio-stepper-ctrl">
                    <button
                      type="button"
                      class="btn-step"
                      :disabled="weaponConfig.laserSightRanks <= 0"
                      @click="weaponConfig.laserSightRanks = Math.max(0, weaponConfig.laserSightRanks - 1); weaponConfig.laserSight = weaponConfig.laserSightRanks > 0"
                    >-</button>
                    <span class="step-display-val">+{{ weaponConfig.laserSightRanks }}</span>
                    <button
                      type="button"
                      class="btn-step"
                      @click="weaponConfig.laserSightRanks = weaponConfig.laserSightRanks + 1; weaponConfig.laserSight = true"
                    >+</button>
                    <span class="step-cost-subtle">{{ weaponConfig.laserSightRanks }} EP</span>
                  </div>
                </div>
              </div>

              <!-- 2B. ARMOR SPEC FORM -->
              <div v-else-if="selectedCategory === 'Armor'" class="spec-form-section">
                <!-- Protection Rank Stepper -->
                <div class="spec-stepper-box">
                  <div class="stepper-box-info">
                    <span class="box-title">Protection Rank (Toughness Bonus)</span>
                    <span class="box-desc">+1 Toughness bonus per rank (1 EP per rank).</span>
                  </div>
                  <div class="studio-stepper-ctrl">
                    <button
                      type="button"
                      class="btn-step"
                      :disabled="armorConfig.protectionRank <= 1"
                      @click="armorConfig.protectionRank = Math.max(1, armorConfig.protectionRank - 1)"
                    >-</button>
                    <span class="step-display-val">+{{ armorConfig.protectionRank }}</span>
                    <button
                      type="button"
                      class="btn-step"
                      @click="armorConfig.protectionRank = armorConfig.protectionRank + 1"
                    >+</button>
                    <span class="step-cost-subtle">{{ armorConfig.protectionRank }} EP</span>
                  </div>
                </div>

                <!-- Impervious Toughness Stepper -->
                <div class="spec-stepper-box">
                  <div class="stepper-box-info">
                    <span class="box-title">Impervious Toughness</span>
                    <span class="box-desc">Automatically shrugs off damage ranks of &le; &lceil;Impervious/2&rceil; (1 EP per rank).</span>
                  </div>
                  <div class="studio-stepper-ctrl">
                    <button
                      type="button"
                      class="btn-step"
                      :disabled="armorConfig.imperviousRank <= 0"
                      @click="armorConfig.imperviousRank = Math.max(0, armorConfig.imperviousRank - 1)"
                    >-</button>
                    <span class="step-display-val">{{ armorConfig.imperviousRank }}</span>
                    <button
                      type="button"
                      class="btn-step"
                      @click="armorConfig.imperviousRank = armorConfig.imperviousRank + 1"
                    >+</button>
                    <span class="step-cost-subtle">{{ armorConfig.imperviousRank }} EP</span>
                  </div>
                </div>

                <!-- Active Shield Stepper -->
                <div class="spec-stepper-box">
                  <div class="stepper-box-info">
                    <span class="box-title">Tactical Shield / Active Defense</span>
                    <span class="box-desc">Deflection shield adding bonus to Dodge and Parry defenses (1 EP per rank).</span>
                  </div>
                  <div class="studio-stepper-ctrl">
                    <button
                      type="button"
                      class="btn-step"
                      :disabled="armorConfig.shieldRank <= 0"
                      @click="armorConfig.shieldRank = Math.max(0, armorConfig.shieldRank - 1)"
                    >-</button>
                    <span class="step-display-val">+{{ armorConfig.shieldRank }}</span>
                    <button
                      type="button"
                      class="btn-step"
                      @click="armorConfig.shieldRank = armorConfig.shieldRank + 1"
                    >+</button>
                    <span class="step-cost-subtle">{{ armorConfig.shieldRank }} EP</span>
                  </div>
                </div>
              </div>

              <!-- 2C. VEHICLES SPEC FORM -->
              <div v-else-if="selectedCategory === 'Vehicle'" class="spec-form-section">
                <!-- Vehicle Size Selector -->
                <div class="eq-form-group">
                  <label>Vehicle Size Category</label>
                  <select v-model="vehicleConfig.size" class="eq-select" @change="onVehicleSizeChange">
                    <option v-for="sz in VEHICLE_SIZES" :key="sz.size" :value="sz.size">
                      {{ sz.size }} (Base STR {{ sz.strBase }}, Def {{ sz.defMod }}, Tough {{ sz.toughBase }}) — {{ sz.epCost }} EP
                    </option>
                  </select>
                </div>

                <!-- Strength Stepper -->
                <div class="spec-stepper-box">
                  <div class="stepper-box-info">
                    <span class="box-title">Vehicle Strength (STR)</span>
                    <span class="box-desc">Base for {{ vehicleConfig.size }} is {{ getVehicleBaseStr(vehicleConfig.size) }}. +1 EP per STR above base.</span>
                  </div>
                  <div class="studio-stepper-ctrl">
                    <button
                      type="button"
                      class="btn-step"
                      :disabled="vehicleConfig.str <= getVehicleBaseStr(vehicleConfig.size)"
                      @click="vehicleConfig.str = Math.max(getVehicleBaseStr(vehicleConfig.size), vehicleConfig.str - 1)"
                    >-</button>
                    <span class="step-display-val">{{ vehicleConfig.str }}</span>
                    <button
                      type="button"
                      class="btn-step"
                      @click="vehicleConfig.str = vehicleConfig.str + 1"
                    >+</button>
                    <span class="step-cost-subtle">+{{ Math.max(0, vehicleConfig.str - getVehicleBaseStr(vehicleConfig.size)) }} EP</span>
                  </div>
                </div>

                <!-- Movement Mode & Speed Stepper -->
                <div class="spec-dual-row">
                  <div class="eq-form-group">
                    <label>Movement Mode</label>
                    <select v-model="vehicleConfig.speedType" class="eq-select">
                      <option value="Ground">Ground (Wheeled / Treads)</option>
                      <option value="Flight">Flight (Air / Turbofan)</option>
                      <option value="Swimming">Swimming (Marine / Sub)</option>
                      <option value="Space">Spaceflight</option>
                    </select>
                  </div>

                  <div class="spec-stepper-box speed-box">
                    <div class="stepper-box-info">
                      <span class="box-title">Speed Rank ({{ getSpeedMph(vehicleConfig.speedRank) }})</span>
                      <span class="box-desc">1 EP per rank of movement.</span>
                    </div>
                    <div class="studio-stepper-ctrl">
                      <button
                        type="button"
                        class="btn-step"
                        :disabled="vehicleConfig.speedRank <= 1"
                        @click="vehicleConfig.speedRank = Math.max(1, vehicleConfig.speedRank - 1)"
                      >-</button>
                      <span class="step-display-val">{{ vehicleConfig.speedRank }}</span>
                      <button
                        type="button"
                        class="btn-step"
                        @click="vehicleConfig.speedRank = vehicleConfig.speedRank + 1"
                      >+</button>
                      <span class="step-cost-subtle">{{ vehicleConfig.speedRank }} EP</span>
                    </div>
                  </div>
                </div>

                <!-- Vehicle Toughness & Impervious -->
                <div class="spec-stepper-box">
                  <div class="stepper-box-info">
                    <span class="box-title">Toughness & Armor Plating</span>
                    <span class="box-desc">Base for {{ vehicleConfig.size }} is {{ getVehicleBaseTough(vehicleConfig.size) }}. +1 EP per Toughness above base.</span>
                  </div>
                  <div class="studio-stepper-ctrl">
                    <button
                      type="button"
                      class="btn-step"
                      :disabled="vehicleConfig.toughness <= getVehicleBaseTough(vehicleConfig.size)"
                      @click="vehicleConfig.toughness = Math.max(getVehicleBaseTough(vehicleConfig.size), vehicleConfig.toughness - 1)"
                    >-</button>
                    <span class="step-display-val">{{ vehicleConfig.toughness }}</span>
                    <button
                      type="button"
                      class="btn-step"
                      @click="vehicleConfig.toughness = vehicleConfig.toughness + 1"
                    >+</button>
                    <span class="step-cost-subtle">+{{ Math.max(0, vehicleConfig.toughness - getVehicleBaseTough(vehicleConfig.size)) }} EP</span>
                  </div>
                </div>
              </div>

              <!-- 2D. HEADQUARTERS SPEC FORM -->
              <div v-else-if="selectedCategory === 'Headquarters'" class="spec-form-section">
                <!-- HQ Size Selector -->
                <div class="eq-form-group">
                  <label>Headquarters Size Category</label>
                  <select v-model="hqConfig.size" class="eq-select" @change="onHQSizeChange">
                    <option v-for="sz in HQ_SIZES" :key="sz.size" :value="sz.size">
                      {{ sz.size }} (Base Toughness {{ sz.toughBase }}) — {{ sz.epCost }} EP — {{ sz.desc }}
                    </option>
                  </select>
                </div>

                <!-- HQ Toughness Stepper -->
                <div class="spec-stepper-box">
                  <div class="stepper-box-info">
                    <span class="box-title">Structural Toughness</span>
                    <span class="box-desc">Base for {{ hqConfig.size }} is {{ getHQBaseTough(hqConfig.size) }}. +1 EP per Toughness above base.</span>
                  </div>
                  <div class="studio-stepper-ctrl">
                    <button
                      type="button"
                      class="btn-step"
                      :disabled="hqConfig.toughness <= getHQBaseTough(hqConfig.size)"
                      @click="hqConfig.toughness = Math.max(getHQBaseTough(hqConfig.size), hqConfig.toughness - 1)"
                    >-</button>
                    <span class="step-display-val">{{ hqConfig.toughness }}</span>
                    <button
                      type="button"
                      class="btn-step"
                      @click="hqConfig.toughness = hqConfig.toughness + 1"
                    >+</button>
                    <span class="step-cost-subtle">+{{ Math.max(0, hqConfig.toughness - getHQBaseTough(hqConfig.size)) }} EP</span>
                  </div>
                </div>
              </div>

              <!-- 2E. GADGETS SPEC FORM -->
              <div v-else-if="selectedCategory === 'Gadget'" class="spec-form-section">
                <div class="gadget-mode-tabs">
                  <button
                    type="button"
                    class="g-mode-btn"
                    :class="{ active: gadgetConfig.mode === 'pack' }"
                    @click="gadgetConfig.mode = 'pack'"
                  >
                    <i class="ri-archive-line"></i> Standard Gadget Presets
                  </button>
                  <button
                    type="button"
                    class="g-mode-btn"
                    :class="{ active: gadgetConfig.mode === 'custom' }"
                    @click="gadgetConfig.mode = 'custom'"
                  >
                    <i class="ri-magic-line"></i> Custom Invention / Device
                  </button>
                </div>

                <!-- Pack Selection Grid -->
                <div v-if="gadgetConfig.mode === 'pack'" class="gadget-packs-grid">
                  <button
                    v-for="pk in GADGET_PACKS"
                    :key="pk.id"
                    type="button"
                    class="gadget-pack-card"
                    :class="{ active: gadgetConfig.presetPackId === pk.id }"
                    @click="selectGadgetPack(pk)"
                  >
                    <div class="g-pack-top">
                      <strong>{{ pk.name }}</strong>
                      <span class="g-pack-cost">{{ pk.cost }} EP</span>
                    </div>
                    <span class="g-pack-cat">{{ pk.category }}</span>
                    <p class="g-pack-desc">{{ pk.desc }}</p>
                  </button>
                </div>

                <!-- Custom Gadget Cost -->
                <div v-else class="custom-gadget-fields">
                  <div class="spec-stepper-box">
                    <div class="stepper-box-info">
                      <span class="box-title">Custom Device Equipment Cost (EP)</span>
                      <span class="box-desc">1 Equipment Point per rank of utility effect.</span>
                    </div>
                    <div class="studio-stepper-ctrl">
                      <button
                        type="button"
                        class="btn-step"
                        :disabled="gadgetConfig.customCost <= 1"
                        @click="gadgetConfig.customCost = Math.max(1, gadgetConfig.customCost - 1)"
                      >-</button>
                      <span class="step-display-val">{{ gadgetConfig.customCost }}</span>
                      <button
                        type="button"
                        class="btn-step"
                        @click="gadgetConfig.customCost = gadgetConfig.customCost + 1"
                      >+</button>
                      <span class="step-cost-subtle">{{ gadgetConfig.customCost }} EP</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- ======================================================= -->
            <!-- STEP 3: TRAITS, FEATURES & AMENITIES -->
            <!-- ======================================================= -->
            <div v-else-if="currentStep === 3" class="step-pane">
              <div class="step-pane-head">
                <h4>3. Enhance with Traits, Features & Amenities</h4>
                <p>Customize tactical capabilities, extras, and amenities (each with automatic EP calculations).</p>
              </div>

              <!-- 3A. WEAPONS TRAITS -->
              <div v-if="selectedCategory === 'Weapons'" class="traits-section">
                <!-- Critical Threat Selector (Expanded to 4 Ranks) -->
                <div class="trait-group-box">
                  <div class="trait-group-head">
                    <strong>Critical Threat Rating</strong>
                    <span class="badge-tag">Improved Critical (Max 4 Ranks)</span>
                  </div>
                  <div class="crit-pills">
                    <button
                      type="button"
                      class="crit-pill"
                      :class="{ active: weaponConfig.critBonus === 0 }"
                      @click="weaponConfig.critBonus = 0"
                    >
                      Natural 20 (0 EP)
                    </button>
                    <button
                      type="button"
                      class="crit-pill"
                      :class="{ active: weaponConfig.critBonus === 1 }"
                      @click="weaponConfig.critBonus = 1"
                    >
                      19-20 (+1 EP)
                    </button>
                    <button
                      type="button"
                      class="crit-pill"
                      :class="{ active: weaponConfig.critBonus === 2 }"
                      @click="weaponConfig.critBonus = 2"
                    >
                      18-20 (+2 EP)
                    </button>
                    <button
                      type="button"
                      class="crit-pill"
                      :class="{ active: weaponConfig.critBonus === 3 }"
                      @click="weaponConfig.critBonus = 3"
                    >
                      17-20 (+3 EP)
                    </button>
                    <button
                      type="button"
                      class="crit-pill"
                      :class="{ active: weaponConfig.critBonus === 4 }"
                      @click="weaponConfig.critBonus = 4"
                    >
                      16-20 (+4 EP)
                    </button>
                  </div>
                </div>

                <!-- Tactical Trait Chips with Custom Ranks -->
                <div class="trait-chips-grid mt-3">
                  <!-- 1. Multiattack -->
                  <div
                    class="trait-chip-card"
                    :class="{ active: weaponConfig.multiattack }"
                  >
                    <div class="chip-top">
                      <label class="chip-title-label">
                        <input
                          type="checkbox"
                          v-model="weaponConfig.multiattack"
                          @change="onToggleMultiattack"
                        />
                        <span class="chk-custom-sm"></span>
                        <strong>Multiattack</strong>
                      </label>

                      <!-- Inline Rank Stepper when active -->
                      <div v-if="weaponConfig.multiattack" class="trait-inline-stepper">
                        <button
                          type="button"
                          class="btn-trait-step"
                          :disabled="weaponConfig.multiattackRanks <= 1"
                          @click="stepMultiattack(-1)"
                        >-</button>
                        <span class="trait-step-val">{{ weaponConfig.multiattackRanks }} Rk</span>
                        <button
                          type="button"
                          class="btn-trait-step"
                          :disabled="weaponConfig.multiattackRanks >= weaponConfig.damageRank"
                          @click="stepMultiattack(1)"
                        >+</button>
                        <span class="chip-cost">+{{ weaponConfig.multiattackRanks }} EP</span>
                      </div>
                      <span v-else class="chip-cost-inactive">+1 EP / Rk</span>
                    </div>
                    <p>Spray fire or multi-target volley. Partial modifier: up to {{ weaponConfig.damageRank }} damage ranks.</p>
                  </div>

                  <!-- 2. Burst Area -->
                  <div
                    v-if="weaponConfig.rangeType === 'Ranged'"
                    class="trait-chip-card"
                    :class="{ active: weaponConfig.burstArea }"
                  >
                    <div class="chip-top">
                      <label class="chip-title-label">
                        <input
                          type="checkbox"
                          v-model="weaponConfig.burstArea"
                          @change="onToggleBurstArea"
                        />
                        <span class="chk-custom-sm"></span>
                        <strong>Area (Burst 30 ft)</strong>
                      </label>

                      <!-- Inline Rank Stepper when active -->
                      <div v-if="weaponConfig.burstArea" class="trait-inline-stepper">
                        <button
                          type="button"
                          class="btn-trait-step"
                          :disabled="weaponConfig.burstAreaRanks <= 1"
                          @click="stepBurstArea(-1)"
                        >-</button>
                        <span class="trait-step-val">{{ weaponConfig.burstAreaRanks }} Rk</span>
                        <button
                          type="button"
                          class="btn-trait-step"
                          :disabled="weaponConfig.burstAreaRanks >= weaponConfig.damageRank"
                          @click="stepBurstArea(1)"
                        >+</button>
                        <span class="chip-cost">+{{ weaponConfig.burstAreaRanks }} EP</span>
                      </div>
                      <span v-else class="chip-cost-inactive">+1 EP / Rk</span>
                    </div>
                    <p>Explosive blast radius. Partial modifier: up to {{ weaponConfig.damageRank }} damage ranks.</p>
                  </div>

                  <!-- 3. Penetrating -->
                  <div
                    class="trait-chip-card"
                    :class="{ active: weaponConfig.penetratingRank > 0 }"
                  >
                    <div class="chip-top">
                      <label class="chip-title-label">
                        <input
                          type="checkbox"
                          :checked="weaponConfig.penetratingRank > 0"
                          @change="togglePenetratingCheckbox"
                        />
                        <span class="chk-custom-sm"></span>
                        <strong>Penetrating</strong>
                      </label>

                      <div v-if="weaponConfig.penetratingRank > 0" class="trait-inline-stepper">
                        <button
                          type="button"
                          class="btn-trait-step"
                          :disabled="weaponConfig.penetratingRank <= 1"
                          @click="stepPenetrating(-1)"
                        >-</button>
                        <span class="trait-step-val">{{ weaponConfig.penetratingRank }} Rk</span>
                        <button
                          type="button"
                          class="btn-trait-step"
                          :disabled="weaponConfig.penetratingRank >= weaponConfig.damageRank"
                          @click="stepPenetrating(1)"
                        >+</button>
                        <span class="chip-cost">+{{ weaponConfig.penetratingRank }} EP</span>
                      </div>
                      <span v-else class="chip-cost-inactive">+1 EP / Rk</span>
                    </div>
                    <p>Overcomes Impervious Toughness up to chosen rank (max {{ weaponConfig.damageRank }}).</p>
                  </div>

                  <!-- 4. Reach (Melee only) -->
                  <div
                    v-if="weaponConfig.rangeType === 'Close'"
                    class="trait-chip-card"
                    :class="{ active: weaponConfig.reachRank > 0 }"
                  >
                    <div class="chip-top">
                      <label class="chip-title-label">
                        <input
                          type="checkbox"
                          :checked="weaponConfig.reachRank > 0"
                          @change="toggleReachCheckbox"
                        />
                        <span class="chk-custom-sm"></span>
                        <strong>Reach</strong>
                      </label>

                      <div v-if="weaponConfig.reachRank > 0" class="trait-inline-stepper">
                        <button
                          type="button"
                          class="btn-trait-step"
                          :disabled="weaponConfig.reachRank <= 1"
                          @click="weaponConfig.reachRank = Math.max(1, weaponConfig.reachRank - 1)"
                        >-</button>
                        <span class="trait-step-val">{{ weaponConfig.reachRank * 5 }} ft</span>
                        <button
                          type="button"
                          class="btn-trait-step"
                          :disabled="weaponConfig.reachRank >= 6"
                          @click="weaponConfig.reachRank = Math.min(6, weaponConfig.reachRank + 1)"
                        >+</button>
                        <span class="chip-cost">+{{ weaponConfig.reachRank }} EP</span>
                      </div>
                      <span v-else class="chip-cost-inactive">+1 EP / 5 ft</span>
                    </div>
                    <p>Extends melee striking reach by +5 feet per rank (max 30 ft).</p>
                  </div>

                  <!-- 5. Improved Range (Ranged only) -->
                  <div
                    v-if="weaponConfig.rangeType === 'Ranged'"
                    class="trait-chip-card"
                    :class="{ active: (weaponConfig.improvedRangeRanks || 0) > 0 }"
                  >
                    <div class="chip-top">
                      <label class="chip-title-label">
                        <input
                          type="checkbox"
                          :checked="(weaponConfig.improvedRangeRanks || 0) > 0"
                          @change="toggleImprovedRangeCheckbox"
                        />
                        <span class="chk-custom-sm"></span>
                        <strong>Improved Range</strong>
                      </label>

                      <div v-if="(weaponConfig.improvedRangeRanks || 0) > 0" class="trait-inline-stepper">
                        <button
                          type="button"
                          class="btn-trait-step"
                          :disabled="weaponConfig.improvedRangeRanks <= 1"
                          @click="weaponConfig.improvedRangeRanks = Math.max(1, weaponConfig.improvedRangeRanks - 1)"
                        >-</button>
                        <span class="trait-step-val">{{ weaponConfig.improvedRangeRanks }} Rk</span>
                        <button
                          type="button"
                          class="btn-trait-step"
                          :disabled="weaponConfig.improvedRangeRanks >= 4"
                          @click="weaponConfig.improvedRangeRanks = Math.min(4, weaponConfig.improvedRangeRanks + 1)"
                        >+</button>
                        <span class="chip-cost">+{{ weaponConfig.improvedRangeRanks }} EP</span>
                      </div>
                      <span v-else class="chip-cost-inactive">+1 EP / Rk</span>
                    </div>
                    <p>Doubles short, medium, and long range increments per rank (max 4 ranks).</p>
                  </div>

                  <!-- 6. Ricochet (Ranged only) -->
                  <div
                    v-if="weaponConfig.rangeType === 'Ranged'"
                    class="trait-chip-card"
                    :class="{ active: (weaponConfig.ricochetRanks || 0) > 0 }"
                  >
                    <div class="chip-top">
                      <label class="chip-title-label">
                        <input
                          type="checkbox"
                          :checked="(weaponConfig.ricochetRanks || 0) > 0"
                          @change="toggleRicochetCheckbox"
                        />
                        <span class="chk-custom-sm"></span>
                        <strong>Ricochet</strong>
                      </label>

                      <div v-if="(weaponConfig.ricochetRanks || 0) > 0" class="trait-inline-stepper">
                        <button
                          type="button"
                          class="btn-trait-step"
                          :disabled="weaponConfig.ricochetRanks <= 1"
                          @click="weaponConfig.ricochetRanks = Math.max(1, weaponConfig.ricochetRanks - 1)"
                        >-</button>
                        <span class="trait-step-val">{{ weaponConfig.ricochetRanks }} Rk</span>
                        <button
                          type="button"
                          class="btn-trait-step"
                          :disabled="weaponConfig.ricochetRanks >= 5"
                          @click="weaponConfig.ricochetRanks = Math.min(5, weaponConfig.ricochetRanks + 1)"
                        >+</button>
                        <span class="chip-cost">+{{ weaponConfig.ricochetRanks }} EP</span>
                      </div>
                      <span v-else class="chip-cost-inactive">+1 EP / Rk</span>
                    </div>
                    <p>Allows attacks to bounce off hard surfaces around 1 corner per rank (max 5).</p>
                  </div>

                  <!-- 7. Homing (Ranged only) -->
                  <div
                    v-if="weaponConfig.rangeType === 'Ranged'"
                    class="trait-chip-card"
                    :class="{ active: (weaponConfig.homingRanks || 0) > 0 }"
                  >
                    <div class="chip-top">
                      <label class="chip-title-label">
                        <input
                          type="checkbox"
                          :checked="(weaponConfig.homingRanks || 0) > 0"
                          @change="toggleHomingCheckbox"
                        />
                        <span class="chk-custom-sm"></span>
                        <strong>Homing</strong>
                      </label>

                      <div v-if="(weaponConfig.homingRanks || 0) > 0" class="trait-inline-stepper">
                        <button
                          type="button"
                          class="btn-trait-step"
                          :disabled="weaponConfig.homingRanks <= 1"
                          @click="weaponConfig.homingRanks = Math.max(1, weaponConfig.homingRanks - 1)"
                        >-</button>
                        <span class="trait-step-val">{{ weaponConfig.homingRanks }} Rk</span>
                        <button
                          type="button"
                          class="btn-trait-step"
                          :disabled="weaponConfig.homingRanks >= 4"
                          @click="weaponConfig.homingRanks = Math.min(4, weaponConfig.homingRanks + 1)"
                        >+</button>
                        <span class="chip-cost">+{{ weaponConfig.homingRanks }} EP</span>
                      </div>
                      <span v-else class="chip-cost-inactive">+1 EP / Rk</span>
                    </div>
                    <p>Allows 1 reroll on following rounds if an attack misses (guided missile/tracer).</p>
                  </div>

                  <!-- 8. Subtle / Silencer (Flat 1 EP) -->
                  <div
                    class="trait-chip-card"
                    :class="{ active: weaponConfig.subtle }"
                    @click="weaponConfig.subtle = !weaponConfig.subtle"
                  >
                    <div class="chip-top">
                      <label class="chip-title-label" @click.stop>
                        <input type="checkbox" v-model="weaponConfig.subtle" />
                        <span class="chk-custom-sm"></span>
                        <strong>{{ weaponConfig.rangeType === 'Ranged' ? 'Silencer / Suppressed' : 'Subtle (Concealable)' }}</strong>
                      </label>
                      <span class="chip-cost" :class="{ 'chip-cost-inactive': !weaponConfig.subtle }">+1 EP</span>
                    </div>
                    <p>{{ weaponConfig.rangeType === 'Ranged' ? 'Acoustic suppressor requiring DC 20 Perception check to locate.' : 'Easily concealable weapon (cane sword, boot dagger, hideout sleeve).' }}</p>
                  </div>

                  <!-- 9. Thrown (Melee only, Flat 1 EP) -->
                  <div
                    v-if="weaponConfig.rangeType === 'Close'"
                    class="trait-chip-card"
                    :class="{ active: weaponConfig.thrown }"
                    @click="weaponConfig.thrown = !weaponConfig.thrown"
                  >
                    <div class="chip-top">
                      <label class="chip-title-label" @click.stop>
                        <input type="checkbox" v-model="weaponConfig.thrown" />
                        <span class="chk-custom-sm"></span>
                        <strong>Thrown Weapon</strong>
                      </label>
                      <span class="chip-cost" :class="{ 'chip-cost-inactive': !weaponConfig.thrown }">+1 EP</span>
                    </div>
                    <p>Aerodynamically balanced for thrown attacks at short range (tomahawks, knives).</p>
                  </div>
                </div>
              </div>

              <!-- 3B. ARMOR EXTRAS -->
              <div v-else-if="selectedCategory === 'Armor'" class="traits-section">
                <div class="trait-chips-grid">
                  <div
                    v-for="extra in ARMOR_EXTRAS"
                    :key="extra.id"
                    class="trait-chip-card"
                    :class="{ active: isArmorExtraActive(extra.id) }"
                    @click="toggleArmorExtra(extra)"
                  >
                    <div class="chip-top">
                      <strong>{{ extra.label }}</strong>
                      <span class="chip-cost">+{{ extra.cost }} EP</span>
                    </div>
                    <p>{{ extra.desc }}</p>
                  </div>
                </div>
              </div>

              <!-- 3C. VEHICLE FEATURES -->
              <div v-else-if="selectedCategory === 'Vehicle'" class="traits-section">
                <div class="features-summary-hint">
                  <span>SELECT VEHICLE AMENITIES (+1 EP each):</span>
                  <span class="features-count-tag">{{ vehicleConfig.features.length }} selected</span>
                </div>
                <div class="features-chips-grid">
                  <button
                    v-for="feat in VEHICLE_FEATURES"
                    :key="feat"
                    type="button"
                    class="feature-toggle-pill"
                    :class="{ active: vehicleConfig.features.includes(feat) }"
                    @click="toggleVehicleFeature(feat)"
                  >
                    <i :class="vehicleConfig.features.includes(feat) ? 'ri-checkbox-circle-fill' : 'ri-add-line'"></i>
                    <span>{{ feat }}</span>
                  </button>
                </div>
              </div>

              <!-- 3D. HQ FEATURES -->
              <div v-else-if="selectedCategory === 'Headquarters'" class="traits-section">
                <div class="features-summary-hint">
                  <span>SELECT HEADQUARTERS AMENITIES (+1 EP each):</span>
                  <span class="features-count-tag">{{ hqConfig.features.length }} selected</span>
                </div>
                <div class="features-chips-grid">
                  <button
                    v-for="feat in HQ_FEATURES"
                    :key="feat.name"
                    type="button"
                    class="feature-toggle-pill"
                    :class="{ active: hqConfig.features.includes(feat.name) }"
                    :title="feat.desc"
                    @click="toggleHQFeature(feat.name)"
                  >
                    <i :class="hqConfig.features.includes(feat.name) ? 'ri-checkbox-circle-fill' : 'ri-add-line'"></i>
                    <span>{{ feat.name }}</span>
                  </button>
                </div>
              </div>

              <!-- 3E. GADGET FEATURES -->
              <div v-else-if="selectedCategory === 'Gadget'" class="traits-section">
                <div class="eq-form-group">
                  <label>Custom Gadget Effect / Traits Description</label>
                  <textarea
                    v-model="gadgetConfig.customDesc"
                    rows="4"
                    class="eq-textarea"
                    placeholder="e.g. Movement 1 (Swinging), Senses 2 (Darkvision), or +2 to Treatment checks..."
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- ======================================================= -->
            <!-- STEP 4: REVIEW & FINALIZE -->
            <!-- ======================================================= -->
            <div v-else-if="currentStep === 4" class="step-pane">
              <div class="step-pane-head">
                <h4>4. Review & Finalize Equipment</h4>
                <p>Inspect combat metrics, auto-generated M&M 3e rules text, and set item readiness.</p>
              </div>

              <!-- Tactical Stat Preview Card -->
              <div class="tactical-preview-card">
                <div class="preview-card-header">
                  <div class="preview-title-box">
                    <span class="preview-icon"><i :class="getCategoryIcon(selectedCategory)"></i></span>
                    <div>
                      <strong class="preview-name">{{ itemName || 'Unnamed Equipment' }}</strong>
                      <span class="preview-type">{{ selectedCategory.toUpperCase() }}</span>
                    </div>
                  </div>
                  <span class="preview-ep-badge">{{ calculatedTotalCost }} EP</span>
                </div>

                <!-- Tactical Chips -->
                <div v-if="selectedCategory === 'Weapons'" class="preview-chips-row">
                  <span class="prev-chip chip-atk">
                    <i class="ri-crosshair-2-line"></i> Atk +{{ getCalculatedAtkBonus() }}
                  </span>
                  <span class="prev-chip chip-dc">
                    <i class="ri-shield-flash-line"></i> DC {{ getCalculatedDC() }} Toughness
                  </span>
                  <span class="prev-chip chip-range">
                    {{ weaponConfig.rangeType === 'Ranged' ? 'Ranged' : (weaponConfig.isStrengthBased ? 'Melee (STR)' : 'Close') }}
                  </span>
                  <span v-if="weaponConfig.critBonus > 0" class="prev-chip chip-crit">
                    Crit {{ 20 - weaponConfig.critBonus }}-20
                  </span>
                </div>

                <div v-else-if="selectedCategory === 'Armor'" class="preview-chips-row">
                  <span class="prev-chip chip-armor">
                    <i class="ri-shield-line"></i> +{{ armorConfig.protectionRank }} Protection
                  </span>
                  <span v-if="armorConfig.imperviousRank > 0" class="prev-chip chip-imperv">
                    Impervious {{ armorConfig.imperviousRank }}
                  </span>
                  <span v-if="armorConfig.shieldRank > 0" class="prev-chip chip-shield">
                    +{{ armorConfig.shieldRank }} Shield
                  </span>
                </div>

                <div v-else-if="selectedCategory === 'Vehicle'" class="preview-chips-row">
                  <span class="prev-chip">Size: {{ vehicleConfig.size }}</span>
                  <span class="prev-chip">STR: {{ vehicleConfig.str }}</span>
                  <span class="prev-chip">Speed: {{ getSpeedMph(vehicleConfig.speedRank) }}</span>
                  <span class="prev-chip">Toughness: {{ vehicleConfig.toughness }}</span>
                </div>

                <div v-else-if="selectedCategory === 'Headquarters'" class="preview-chips-row">
                  <span class="prev-chip">Size: {{ hqConfig.size }}</span>
                  <span class="prev-chip">Toughness: {{ hqConfig.toughness }}</span>
                  <span class="prev-chip">{{ hqConfig.features.length }} Amenities</span>
                </div>

                <!-- Rules Text Box -->
                <div class="eq-form-group mt-3">
                  <div class="eq-label-row">
                    <label>Auto-Generated Rules Text</label>
                    <button type="button" class="btn-refresh-text" @click="regenerateDescription">
                      <i class="ri-refresh-line"></i> Reset Text
                    </button>
                  </div>
                  <textarea
                    v-model="customDescription"
                    rows="3"
                    class="eq-textarea"
                    placeholder="Rules description..."
                  ></textarea>
                </div>

                <!-- Initial Status Selector -->
                <div class="status-select-row mt-3">
                  <label>Initial Gear Status:</label>
                  <div class="status-options">
                    <button
                      type="button"
                      class="status-opt-btn"
                      :class="{ active: itemStatus === 'equipped' }"
                      @click="itemStatus = 'equipped'"
                    >
                      <i class="ri-checkbox-circle-line"></i> Equipped
                    </button>
                    <button
                      type="button"
                      class="status-opt-btn"
                      :class="{ active: itemStatus === 'carried' }"
                      @click="itemStatus = 'carried'"
                    >
                      <i class="ri-inbox-line"></i> In Bag / Carried
                    </button>
                    <button
                      type="button"
                      class="status-opt-btn"
                      :class="{ active: itemStatus === 'stored' }"
                      @click="itemStatus = 'stored'"
                    >
                      <i class="ri-archive-line"></i> Stored
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Wizard Bottom Nav Controls -->
            <div class="step-nav-footer">
              <button
                v-if="currentStep > 1"
                type="button"
                class="btn-step-prev"
                @click="prevStep"
              >
                <i class="ri-arrow-left-line"></i> Back
              </button>
              <div class="footer-spacer"></div>
              <button
                v-if="currentStep < 4"
                type="button"
                class="btn-step-next"
                @click="nextStep"
              >
                Next Step <i class="ri-arrow-right-line"></i>
              </button>
              <button
                v-else
                type="button"
                class="btn-step-save"
                @click="saveEquipmentItem"
              >
                <i class="ri-check-line"></i> Create & Add to Sheet
              </button>
            </div>
          </div>

          <!-- Right Column: Live Bill of Materials (BOM) & Budget HUD (35%) -->
          <div class="eq-live-bom-panel">
            <div class="bom-head">
              <i class="ri-calculator-line bom-icon"></i>
              <strong class="bom-title">LIVE COST BREAKDOWN</strong>
            </div>

            <!-- Current Item Card Preview -->
            <div class="bom-item-summary">
              <strong class="bom-item-name">{{ itemName || 'New Custom Item' }}</strong>
              <div class="bom-tags-row">
                <span class="bom-cat-badge">{{ selectedCategory }}</span>
                <span class="bom-cost-total">{{ calculatedTotalCost }} EP</span>
              </div>
            </div>

            <!-- Item Cost Breakdown Lines -->
            <div class="bom-breakdown-list">
              <div
                v-for="line in costBreakdown.breakdown"
                :key="line.label"
                class="bom-line-item"
              >
                <span class="bom-line-label">{{ line.label }}</span>
                <span class="bom-line-cost tabular-nums">{{ line.cost >= 0 ? `+${line.cost}` : line.cost }} EP</span>
              </div>
            </div>

            <div class="bom-divider"></div>

            <!-- Total Cost Summary -->
            <div class="bom-total-row">
              <span class="bom-total-label">TOTAL EQUIPMENT COST:</span>
              <span class="bom-total-val tabular-nums">{{ calculatedTotalCost }} EP</span>
            </div>

            <!-- Hero Budget Impact Box -->
            <div class="bom-budget-box" :class="projectedBudgetInfo.isOverBudget ? 'is-deficit' : 'is-balanced'">
              <div class="budget-box-head">
                <i :class="projectedBudgetInfo.isOverBudget ? 'ri-alert-line' : 'ri-checkbox-circle-line'"></i>
                <strong>HERO EP BUDGET IMPACT</strong>
              </div>

              <div class="budget-progress-track">
                <div
                  class="budget-progress-fill"
                  :style="{ width: `${Math.min(100, (projectedBudgetInfo.projectedUsed / Math.max(1, projectedBudgetInfo.capacity)) * 100)}%` }"
                ></div>
              </div>

              <div class="budget-stats-grid">
                <div class="b-stat">
                  <span>Current Used:</span>
                  <strong class="tabular-nums">{{ budgetInfo.totalEP }} EP</strong>
                </div>
                <div class="b-stat">
                  <span>After Adding:</span>
                  <strong class="tabular-nums" :class="{ 'text-danger': projectedBudgetInfo.isOverBudget }">
                    {{ projectedBudgetInfo.projectedUsed }} EP
                  </strong>
                </div>
                <div class="b-stat full">
                  <span>Available Capacity:</span>
                  <strong class="tabular-nums">{{ budgetInfo.maxEP }} EP ({{ budgetInfo.ranks }} Rks)</strong>
                </div>
              </div>

              <div v-if="projectedBudgetInfo.isOverBudget" class="budget-alert-action">
                <p class="budget-deficit-text">
                  Deficit of <strong>{{ projectedBudgetInfo.deficit }} EP</strong>. Requires Rank {{ projectedBudgetInfo.neededRanks }} Equipment.
                </p>
                <button type="button" class="btn-quick-sync" @click="syncEquipmentAdvantage">
                  <i class="ri-flashlight-line"></i> Auto-Sync (+{{ projectedBudgetInfo.neededRanks - budgetInfo.ranks }} PP)
                </button>
              </div>
              <div v-else class="budget-ok-badge">
                <i class="ri-check-line"></i>
                <span>Remaining: <strong>{{ projectedBudgetInfo.remaining }} EP</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useHeroStore } from '../../stores/heroStore.js';
import { useUiStore } from '../../stores/uiStore.js';
import { VEHICLE_SIZES, VEHICLE_FEATURES, HQ_FEATURES } from '../../rules/resources.js';
import {
  HQ_SIZES,
  SPEED_RANK_TABLE,
  ARMOR_EXTRAS,
  GADGET_PACKS,
  calculateTotalEquipmentCost,
  generateEquipmentDescription
} from '../../rules/equipmentCalculator.js';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  initialCategory: {
    type: String,
    default: 'Weapons'
  }
});

const emit = defineEmits(['update:modelValue', 'item-created']);

const heroStore = useHeroStore();
const uiStore = useUiStore();

// Stepper
const currentStep = ref(1);
const steps = [
  { num: 1, label: 'Identity' },
  { num: 2, label: 'Specs' },
  { num: 3, label: 'Traits' },
  { num: 4, label: 'Finalize' }
];

// Selection State
const selectedCategory = ref('Weapons');
const itemName = ref('');
const itemStatus = ref('equipped');
const customDescription = ref('');

// Category Configuration States
const weaponConfig = ref({
  rangeType: 'Close',
  damageRank: 3,
  isStrengthBased: true,
  critBonus: 0,
  multiattack: false,
  multiattackRanks: 3,
  burstArea: false,
  burstAreaRanks: 3,
  penetratingRank: 0,
  reachRank: 0,
  subtle: false,
  thrown: false,
  laserSight: false,
  laserSightRanks: 0,
  improvedRange: false,
  improvedRangeRanks: 0,
  ricochet: false,
  ricochetRanks: 0,
  homing: false,
  homingRanks: 0
});

// Clamp ranked traits to damage rank when damage rank is reduced
watch(
  () => weaponConfig.value.damageRank,
  (newDmg) => {
    if (weaponConfig.value.multiattackRanks > newDmg) {
      weaponConfig.value.multiattackRanks = newDmg;
    }
    if (weaponConfig.value.burstAreaRanks > newDmg) {
      weaponConfig.value.burstAreaRanks = newDmg;
    }
    if (weaponConfig.value.penetratingRank > newDmg) {
      weaponConfig.value.penetratingRank = newDmg;
    }
  }
);


const armorConfig = ref({
  protectionRank: 3,
  imperviousRank: 0,
  shieldRank: 0,
  subtle: false,
  immunities: [],
  secondChance: false
});

const vehicleConfig = ref({
  size: 'Medium',
  str: 2,
  speedType: 'Ground',
  speedRank: 5,
  defense: 1,
  toughness: 6,
  impervious: 0,
  features: []
});

const hqConfig = ref({
  size: 'Medium',
  toughness: 8,
  features: []
});

const gadgetConfig = ref({
  mode: 'pack',
  presetPackId: 'commlink',
  customCost: 2,
  customDesc: ''
});

// Category definition cards
const categoryCards = [
  { id: 'Weapons', label: 'Weapons', icon: 'ri-sword-line', desc: 'Melee blades, firearms, energy weapons & blasters' },
  { id: 'Armor', label: 'Armor & Defense', icon: 'ri-shield-line', desc: 'Ballistic vests, power suits, tactical shields & hazmat' },
  { id: 'Vehicle', label: 'Vehicles', icon: 'ri-car-line', desc: 'Motorcycles, sports cars, armored vans, jets & ships' },
  { id: 'Headquarters', label: 'Headquarters', icon: 'ri-building-line', desc: 'Secret batcaves, skyscrapers, bunkers & orbital stations' },
  { id: 'Gadget', label: 'Gadgets & Tech', icon: 'ri-smartphone-line', desc: 'Commlinks, tool kits, night vision optics & custom tools' }
];

// Ensure item name always has a sensible, genre-fitting default
function ensureItemName() {
  if (!itemName.value || !itemName.value.trim()) {
    const suggestions = getNameSuggestions(selectedCategory.value);
    itemName.value = (suggestions && suggestions[0]) || `Custom ${selectedCategory.value}`;
  }
}

// Initialize on category change
watch(
  () => props.initialCategory,
  (newCat) => {
    if (newCat) selectCategory(newCat);
    else ensureItemName();
  },
  { immediate: true }
);

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      currentStep.value = 1;
      if (props.initialCategory) {
        selectCategory(props.initialCategory);
      } else {
        ensureItemName();
      }
    }
  }
);

function selectCategory(catId) {
  const prevCat = selectedCategory.value;
  selectedCategory.value = catId;
  const prevSuggestions = getNameSuggestions(prevCat) || [];
  // If item name was empty or matched one of the default suggestions of the previous category, update it to the new category default
  if (!itemName.value || !itemName.value.trim() || prevSuggestions.includes(itemName.value.trim())) {
    const newSuggestions = getNameSuggestions(catId);
    itemName.value = (newSuggestions && newSuggestions[0]) || `Custom ${catId}`;
  }
  regenerateDescription();
}

function goToStep(num) {
  ensureItemName();
  currentStep.value = Math.max(1, Math.min(4, Number(num) || 1));
  if (currentStep.value === 4) {
    regenerateDescription();
  }
}

function nextStep() {
  ensureItemName();
  if (currentStep.value < 4) {
    currentStep.value++;
    if (currentStep.value === 4) {
      regenerateDescription();
    }
  }
}

function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
}

function closeModal() {
  emit('update:modelValue', false);
}

// =========================================================================
// Reactive Calculations
// =========================================================================

const costBreakdown = computed(() => {
  const cat = selectedCategory.value;
  let cfg = {};
  if (cat === 'Weapons') cfg = weaponConfig.value;
  else if (cat === 'Armor') cfg = armorConfig.value;
  else if (cat === 'Vehicle') cfg = vehicleConfig.value;
  else if (cat === 'Headquarters') cfg = hqConfig.value;
  else cfg = gadgetConfig.value;

  return calculateTotalEquipmentCost(cat, cfg);
});

const calculatedTotalCost = computed(() => costBreakdown.value.total);

// Hero Budget Calculations
const budgetInfo = computed(() => heroStore.getEquipmentBudgetInfo());

const projectedBudgetInfo = computed(() => {
  const currentTotal = budgetInfo.value.totalEP;
  const capacity = budgetInfo.value.maxEP;
  const itemCost = calculatedTotalCost.value;
  const projectedUsed = currentTotal + itemCost;
  const isOverBudget = projectedUsed > capacity;
  const deficit = Math.max(0, projectedUsed - capacity);
  const neededRanks = Math.ceil(projectedUsed / 5);
  const remaining = Math.max(0, capacity - projectedUsed);

  return {
    projectedUsed,
    capacity,
    isOverBudget,
    deficit,
    neededRanks,
    remaining
  };
});

function syncEquipmentAdvantage() {
  const targetRanks = projectedBudgetInfo.value.neededRanks;
  heroStore.setAdvantageRank('Equipment', targetRanks);
  uiStore.showToast(`Updated Equipment Advantage to Rank ${targetRanks} (${targetRanks * 5} EP capacity)!`, 'success');
}

// =========================================================================
// Helpers for Category Configuration
// =========================================================================

function getNamePlaceholder(cat) {
  if (cat === 'Weapons') return 'e.g. Plasma Carbine, Vibro-Blade, Dual Pistols...';
  if (cat === 'Armor') return 'e.g. Nanotech Vest, Titanium Exoskeleton, Tactical Shield...';
  if (cat === 'Vehicle') return 'e.g. Shadow Cruiser, Supersonic Jet, SWAT Tactical Van...';
  if (cat === 'Headquarters') return 'e.g. Subterranean Batcave, Downtown Penthouse, Orbital Spire...';
  return 'e.g. Grappling Hook Launcher, Secure Smartphone, Sensor Array...';
}

function getNameSuggestions(cat) {
  if (cat === 'Weapons') return ['Plasma Carbine', 'Tactical Combat Knife', 'Heavy Sniper Rifle', 'Energy Katana', 'Submachine Gun'];
  if (cat === 'Armor') return ['Reinforced Ballistic Vest', 'Kevlar Undercover Suit', 'Riot Shield', 'Exo-Armor Mesh'];
  if (cat === 'Vehicle') return ['Stealth Interceptor', 'Armored SWAT Carrier', 'Hover Motorcycle', 'Marine Speedboat'];
  if (cat === 'Headquarters') return ['Industrial Warehouse Lair', 'Downtown High-Rise Spire', 'Fortified Bunker', 'Mountain Cavern Complex'];
  return ['Grappling Hook Gun', 'Night Vision Goggles', 'Masterwork Hack Kit', 'Tactical Flashlight'];
}

function getCategoryIcon(cat) {
  if (cat === 'Weapons') return 'ri-sword-line';
  if (cat === 'Armor') return 'ri-shield-line';
  if (cat === 'Vehicle') return 'ri-car-line';
  if (cat === 'Headquarters') return 'ri-building-line';
  return 'ri-smartphone-line';
}

function getVehicleBaseStr(sz) {
  return VEHICLE_SIZES.find(s => s.size === sz)?.strBase ?? 2;
}

function getVehicleBaseTough(sz) {
  return VEHICLE_SIZES.find(s => s.size === sz)?.toughBase ?? 6;
}

function onVehicleSizeChange() {
  const sz = vehicleConfig.value.size;
  vehicleConfig.value.str = getVehicleBaseStr(sz);
  vehicleConfig.value.toughness = getVehicleBaseTough(sz);
  vehicleConfig.value.defense = VEHICLE_SIZES.find(s => s.size === sz)?.defMod ?? 1;
}

function getSpeedMph(rank) {
  return SPEED_RANK_TABLE.find(s => s.rank === Number(rank))?.mph || `${rank} Rks`;
}

function getHQBaseTough(sz) {
  return HQ_SIZES.find(s => s.size === sz)?.toughBase ?? 8;
}

function onHQSizeChange() {
  hqConfig.value.toughness = getHQBaseTough(hqConfig.value.size);
}

function selectGadgetPack(pk) {
  gadgetConfig.value.presetPackId = pk.id;
  itemName.value = pk.name;
  regenerateDescription();
}

// Trait Toggles & Steppers
function onToggleMultiattack() {
  if (weaponConfig.value.multiattack) {
    if (!weaponConfig.value.multiattackRanks || weaponConfig.value.multiattackRanks <= 0) {
      weaponConfig.value.multiattackRanks = weaponConfig.value.damageRank;
    }
  }
}

function stepMultiattack(delta) {
  const current = weaponConfig.value.multiattackRanks || weaponConfig.value.damageRank;
  const max = weaponConfig.value.damageRank;
  weaponConfig.value.multiattackRanks = Math.max(1, Math.min(max, current + delta));
}

function onToggleBurstArea() {
  if (weaponConfig.value.burstArea) {
    if (!weaponConfig.value.burstAreaRanks || weaponConfig.value.burstAreaRanks <= 0) {
      weaponConfig.value.burstAreaRanks = weaponConfig.value.damageRank;
    }
  }
}

function stepBurstArea(delta) {
  const current = weaponConfig.value.burstAreaRanks || weaponConfig.value.damageRank;
  const max = weaponConfig.value.damageRank;
  weaponConfig.value.burstAreaRanks = Math.max(1, Math.min(max, current + delta));
}

function togglePenetratingCheckbox() {
  if (weaponConfig.value.penetratingRank > 0) {
    weaponConfig.value.penetratingRank = 0;
  } else {
    weaponConfig.value.penetratingRank = weaponConfig.value.damageRank;
  }
}

function stepPenetrating(delta) {
  const current = weaponConfig.value.penetratingRank;
  const max = weaponConfig.value.damageRank;
  weaponConfig.value.penetratingRank = Math.max(1, Math.min(max, current + delta));
}

function toggleReachCheckbox() {
  if (weaponConfig.value.reachRank > 0) {
    weaponConfig.value.reachRank = 0;
  } else {
    weaponConfig.value.reachRank = 1;
  }
}

function toggleImprovedRangeCheckbox() {
  if ((weaponConfig.value.improvedRangeRanks || 0) > 0) {
    weaponConfig.value.improvedRangeRanks = 0;
    weaponConfig.value.improvedRange = false;
  } else {
    weaponConfig.value.improvedRangeRanks = 1;
    weaponConfig.value.improvedRange = true;
  }
}

function toggleRicochetCheckbox() {
  if ((weaponConfig.value.ricochetRanks || 0) > 0) {
    weaponConfig.value.ricochetRanks = 0;
    weaponConfig.value.ricochet = false;
  } else {
    weaponConfig.value.ricochetRanks = 1;
    weaponConfig.value.ricochet = true;
  }
}

function toggleHomingCheckbox() {
  if ((weaponConfig.value.homingRanks || 0) > 0) {
    weaponConfig.value.homingRanks = 0;
    weaponConfig.value.homing = false;
  } else {
    weaponConfig.value.homingRanks = 1;
    weaponConfig.value.homing = true;
  }
}

function togglePenetrating() {
  togglePenetratingCheckbox();
}


function isArmorExtraActive(extraId) {
  if (extraId === 'Subtle') return armorConfig.value.subtle;
  if (extraId === 'SecondChance') return armorConfig.value.secondChance;
  return (armorConfig.value.immunities || []).includes(extraId.replace('Immunity', ''));
}

function toggleArmorExtra(extra) {
  if (extra.id === 'Subtle') {
    armorConfig.value.subtle = !armorConfig.value.subtle;
  } else if (extra.id === 'SecondChance') {
    armorConfig.value.secondChance = !armorConfig.value.secondChance;
  } else {
    const key = extra.id.replace('Immunity', '');
    const arr = armorConfig.value.immunities || [];
    const idx = arr.indexOf(key);
    if (idx !== -1) arr.splice(idx, 1);
    else arr.push(key);
    armorConfig.value.immunities = [...arr];
  }
}

function toggleVehicleFeature(feat) {
  const arr = vehicleConfig.value.features;
  const idx = arr.indexOf(feat);
  if (idx !== -1) arr.splice(idx, 1);
  else arr.push(feat);
}

function toggleHQFeature(featName) {
  const arr = hqConfig.value.features;
  const idx = arr.indexOf(featName);
  if (idx !== -1) arr.splice(idx, 1);
  else arr.push(featName);
}

// Tactical Stats Preview Calculations
function getCalculatedAtkBonus() {
  try {
    const isRanged = weaponConfig.value.rangeType === 'Ranged';
    const skills = heroStore.character?.skills || [];
    const abilBonus = isRanged
      ? Number(heroStore.effectiveAbilities?.DEX || 0)
      : Number(heroStore.effectiveAbilities?.FGT || 0);

    const skillMatch = isRanged
      ? skills.find(s => s?.name === 'Ranged Combat')
      : skills.find(s => s?.name === 'Close Combat');

    const skillBonus = skillMatch ? (Number(skillMatch.ranks) || 0) : 0;
    const gearBonus = weaponConfig.value.laserSight ? Number(weaponConfig.value.laserSightRanks || 1) : 0;

    return abilBonus + skillBonus + gearBonus;
  } catch (e) {
    console.error('Error calculating attack bonus:', e);
    return 0;
  }
}

function getCalculatedDC() {
  try {
    const dmg = Number(weaponConfig.value.damageRank) || 1;
    const str = Number(heroStore.effectiveAbilities?.STR || 0);
    const isStrBased = weaponConfig.value.rangeType === 'Close' && weaponConfig.value.isStrengthBased;
    return 15 + (isStrBased ? (str + dmg) : dmg);
  } catch (e) {
    console.error('Error calculating DC:', e);
    return 15;
  }
}

function regenerateDescription() {
  try {
    const cat = selectedCategory.value;
    let cfg = {};
    if (cat === 'Weapons') cfg = weaponConfig.value;
    else if (cat === 'Armor') cfg = armorConfig.value;
    else if (cat === 'Vehicle') cfg = vehicleConfig.value;
    else if (cat === 'Headquarters') cfg = hqConfig.value;
    else cfg = gadgetConfig.value;

    customDescription.value = generateEquipmentDescription(cat, cfg);
  } catch (e) {
    console.error('Error regenerating description:', e);
  }
}

// =========================================================================
// Save to Hero Sheet
// =========================================================================

function saveEquipmentItem() {
  ensureItemName();
  const name = itemName.value.trim();
  if (!name) {
    uiStore.showToast('Please enter an item name', 'error');
    currentStep.value = 1;
    return;
  }

  const cat = selectedCategory.value;
  const totalEP = calculatedTotalCost.value;

  // Build resource object structure compatible with M&M 3e sheet
  const newResource = {
    id: 'res_' + Date.now() + Math.random().toString(36).substr(2, 4),
    name,
    type: cat === 'Weapons' ? 'Gear' : (cat === 'Armor' ? 'Gear' : cat),
    subtype: cat === 'Weapons'
      ? (weaponConfig.value.rangeType === 'Ranged' ? 'weapon_ranged' : 'weapon_melee')
      : (cat === 'Armor' ? (armorConfig.value.shieldRank > 0 ? 'shield' : 'armor') : cat.toLowerCase()),
    epCost: totalEP,
    status: itemStatus.value,
    desc: customDescription.value.trim()
  };

  if (cat === 'Weapons') {
    newResource.weapon = {
      isStrengthBased: weaponConfig.value.rangeType === 'Close' && weaponConfig.value.isStrengthBased,
      damageRank: weaponConfig.value.damageRank,
      attackBonus: weaponConfig.value.laserSight ? Number(weaponConfig.value.laserSightRanks || 1) : 0,
      range: weaponConfig.value.rangeType === 'Ranged' ? 'Ranged' : 'Close',
      crit: weaponConfig.value.critBonus > 0 ? `${20 - weaponConfig.value.critBonus}-20` : '20',
      resistance: 'Toughness',
      traits: [
        ...(weaponConfig.value.multiattack ? [weaponConfig.value.multiattackRanks < weaponConfig.value.damageRank ? `Multiattack ${weaponConfig.value.multiattackRanks}` : 'Multiattack'] : []),
        ...(weaponConfig.value.burstArea ? [weaponConfig.value.burstAreaRanks < weaponConfig.value.damageRank ? `Area Burst ${weaponConfig.value.burstAreaRanks}` : 'Area Burst'] : []),
        ...(weaponConfig.value.penetratingRank > 0 ? [`Penetrating ${weaponConfig.value.penetratingRank}`] : []),
        ...(weaponConfig.value.reachRank > 0 ? [`Reach ${weaponConfig.value.reachRank} (${weaponConfig.value.reachRank * 5} ft)`] : []),
        ...(weaponConfig.value.improvedRangeRanks > 0 ? [`Improved Range ${weaponConfig.value.improvedRangeRanks}`] : []),
        ...(weaponConfig.value.ricochetRanks > 0 ? [`Ricochet ${weaponConfig.value.ricochetRanks}`] : []),
        ...(weaponConfig.value.homingRanks > 0 ? [`Homing ${weaponConfig.value.homingRanks}`] : []),
        ...(weaponConfig.value.subtle ? [weaponConfig.value.rangeType === 'Ranged' ? 'Suppressed' : 'Subtle'] : []),
        ...(weaponConfig.value.thrown ? ['Thrown'] : [])
      ]
    };
  } else if (cat === 'Armor') {
    newResource.armor = {
      protectionRank: armorConfig.value.protectionRank,
      imperviousRank: armorConfig.value.imperviousRank,
      shieldRank: armorConfig.value.shieldRank,
      subtle: armorConfig.value.subtle,
      immunities: armorConfig.value.immunities
    };
  } else if (cat === 'Vehicle') {
    newResource.vehicle = {
      size: vehicleConfig.value.size,
      str: vehicleConfig.value.str,
      speedRank: vehicleConfig.value.speedRank,
      speedType: vehicleConfig.value.speedType,
      speedMph: getSpeedMph(vehicleConfig.value.speedRank),
      defense: vehicleConfig.value.defense,
      toughness: vehicleConfig.value.toughness,
      impervious: vehicleConfig.value.impervious,
      features: [...vehicleConfig.value.features]
    };
  } else if (cat === 'Headquarters') {
    newResource.hq = {
      size: hqConfig.value.size,
      toughness: hqConfig.value.toughness,
      features: [...hqConfig.value.features]
    };
  }

  heroStore.addResource(newResource);
  uiStore.showToast(`Forged & added "${name}" (${totalEP} EP) to equipment!`, 'success');
  emit('item-created', newResource);
  closeModal();
}
</script>

<style scoped>
/* Modal Pop & Backdrop */
.eq-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(4, 7, 14, 0.82);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  padding: 1rem;
}

.eq-studio-card {
  background: #090d16;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg, 16px);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(56, 189, 248, 0.15);
  width: 100%;
  max-width: 1120px;
  height: 88vh;
  max-height: 860px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

/* Header */
.eq-studio-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1.5rem;
  background: rgba(15, 23, 42, 0.75);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  gap: 1rem;
  flex-shrink: 0;
}

.header-branding {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.studio-badge {
  font-size: 0.65rem;
  font-weight: 900;
  letter-spacing: 0.12em;
  color: #38bdf8;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.studio-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: #fff;
  margin: 0;
  letter-spacing: -0.01em;
}

/* Stepper Indicator in Header */
.studio-stepper {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  background: rgba(0, 0, 0, 0.35);
  padding: 0.25rem 0.4rem;
  border-radius: var(--radius-pill, 9999px);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.stepper-tab {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.25rem 0.65rem;
  border-radius: var(--radius-pill, 9999px);
  cursor: pointer;
  transition: all var(--trans-fast, 0.15s ease);
}

.stepper-tab:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.05);
}

.stepper-tab.active {
  background: #38bdf8;
  color: #090d16;
  font-weight: 800;
}

.stepper-tab.completed {
  color: #38bdf8;
}

.step-num {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-family: var(--font-mono, monospace);
}

.stepper-tab.active .step-num {
  background: #090d16;
  color: #38bdf8;
  font-weight: 900;
}

.studio-close-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 1.1rem;
}

.studio-close-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: #ef4444;
  color: #fff;
}

/* Studio 2-Column Body */
.eq-studio-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  flex: 1;
  overflow: hidden;
}

/* Step Workspace (Left 65%) */
.eq-step-workspace {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
}

.step-pane {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.step-pane-head h4 {
  font-size: 1.05rem;
  font-weight: 800;
  color: #fff;
  margin: 0 0 0.25rem 0;
}

.step-pane-head p {
  font-size: 0.78rem;
  color: #94a3b8;
  margin: 0;
}

/* Category Selection Grid (Step 1) */
.category-cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.cat-select-card {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-md, 10px);
  padding: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-align: left;
  cursor: pointer;
  transition: all var(--trans-fast, 0.15s ease);
  position: relative;
}

.cat-select-card:hover {
  background: rgba(30, 41, 59, 0.7);
  border-color: rgba(56, 189, 248, 0.3);
  transform: translateY(-1px);
}

.cat-select-card.selected {
  background: rgba(56, 189, 248, 0.1);
  border-color: #38bdf8;
  box-shadow: 0 0 15px rgba(56, 189, 248, 0.15);
}

.cat-card-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: #38bdf8;
  flex-shrink: 0;
}

.cat-card-info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.cat-card-title {
  font-size: 0.88rem;
  font-weight: 800;
  color: #fff;
}

.cat-card-desc {
  font-size: 0.7rem;
  color: #94a3b8;
  line-height: 1.25;
}

.cat-selected-check {
  position: absolute;
  top: 0.65rem;
  right: 0.65rem;
  color: #38bdf8;
  font-size: 1.1rem;
}

/* Form Groups & Inputs */
.eq-form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.eq-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.eq-form-group label,
.eq-label-row label {
  font-size: 0.78rem;
  font-weight: 700;
  color: #e2e8f0;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.eq-hint-text {
  font-size: 0.68rem;
  color: #64748b;
}

.eq-text-input,
.eq-select,
.eq-textarea {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-sm, 6px);
  padding: 0.55rem 0.75rem;
  color: #fff;
  font-size: 0.85rem;
  transition: all 0.15s ease;
  width: 100%;
  box-sizing: border-box;
}

.eq-text-input:focus,
.eq-select:focus,
.eq-textarea:focus {
  border-color: #38bdf8;
  outline: none;
  background: rgba(15, 23, 42, 0.6);
  box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.2);
}

.preset-name-suggestions {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-top: -0.5rem;
}

.sug-label {
  font-size: 0.65rem;
  font-weight: 800;
  color: #64748b;
  letter-spacing: 0.05em;
}

.sug-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.sug-chip {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #94a3b8;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.2rem 0.55rem;
  border-radius: var(--radius-pill, 9999px);
  cursor: pointer;
  transition: all 0.15s ease;
}

.sug-chip:hover {
  background: rgba(56, 189, 248, 0.15);
  border-color: #38bdf8;
  color: #fff;
}

/* Stepper Boxes & Controls */
.spec-form-section {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.spec-toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
}

.range-toggle-group {
  display: flex;
  gap: 0.35rem;
}

.toggle-btn {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #94a3b8;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.3rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  transition: all 0.15s ease;
}

.toggle-btn.active {
  background: rgba(56, 189, 248, 0.2);
  border-color: #38bdf8;
  color: #38bdf8;
}

.spec-stepper-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1rem;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  gap: 1rem;
}

.stepper-box-info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.box-title {
  font-size: 0.85rem;
  font-weight: 800;
  color: #fff;
}

.box-desc {
  font-size: 0.72rem;
  color: #94a3b8;
}

.studio-stepper-ctrl {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(0, 0, 0, 0.35);
  padding: 0.2rem 0.4rem;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}

.btn-step {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.1s ease;
}

.btn-step:hover:not(:disabled) {
  background: #38bdf8;
  color: #090d16;
}

.btn-step:active:not(:disabled) {
  transform: scale(0.92);
}

.btn-step:disabled {
  opacity: 0.2;
  cursor: not-allowed;
}

.step-display-val {
  font-size: 0.95rem;
  font-weight: 900;
  min-width: 32px;
  text-align: center;
  color: #fff;
  font-family: var(--font-mono, monospace);
  font-variant-numeric: tabular-nums;
}

.step-cost-subtle {
  font-size: 0.72rem;
  font-weight: 700;
  color: #38bdf8;
  font-family: var(--font-mono, monospace);
  margin-left: 0.2rem;
}

.spec-checkbox-box {
  padding: 0.75rem 1rem;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
}

.custom-chk-label {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  cursor: pointer;
}

.custom-chk-label input {
  display: none;
}

.chk-custom {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(0, 0, 0, 0.4);
  margin-top: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.custom-chk-label input:checked + .chk-custom {
  background: #38bdf8;
  border-color: #38bdf8;
}

.custom-chk-label input:checked + .chk-custom::after {
  content: '✓';
  color: #090d16;
  font-size: 0.75rem;
  font-weight: 900;
}

.chk-text {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.chk-text strong {
  font-size: 0.82rem;
  color: #fff;
}

.chk-text span {
  font-size: 0.7rem;
  color: #94a3b8;
}

.spec-dual-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

/* Gadget Packs Grid */
.gadget-mode-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.g-mode-btn {
  flex: 1;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #94a3b8;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  transition: all 0.15s ease;
}

.g-mode-btn.active {
  background: rgba(56, 189, 248, 0.15);
  border-color: #38bdf8;
  color: #38bdf8;
}

.gadget-packs-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.6rem;
  max-height: 380px;
  overflow-y: auto;
}

.gadget-pack-card {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 0.65rem 0.8rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.gadget-pack-card:hover {
  background: rgba(30, 41, 59, 0.7);
  border-color: rgba(56, 189, 248, 0.3);
}

.gadget-pack-card.active {
  background: rgba(56, 189, 248, 0.12);
  border-color: #38bdf8;
}

.g-pack-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.g-pack-top strong {
  font-size: 0.8rem;
  color: #fff;
}

.g-pack-cost {
  font-size: 0.7rem;
  font-weight: 800;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.15);
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
}

.g-pack-cat {
  font-size: 0.65rem;
  color: #94a3b8;
  text-transform: uppercase;
  font-weight: 700;
}

.g-pack-desc {
  font-size: 0.68rem;
  color: #cbd5e1;
  margin: 0;
  line-height: 1.25;
}

/* Step 3: Traits & Qualities */
.traits-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.trait-group-box {
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.trait-group-head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.trait-group-head strong {
  font-size: 0.85rem;
  color: #fff;
}

.badge-tag {
  font-size: 0.65rem;
  font-weight: 800;
  color: #fbbf24;
  background: rgba(245, 158, 11, 0.15);
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
}

.crit-pills {
  display: flex;
  gap: 0.35rem;
}

.crit-pill {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #94a3b8;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.25rem 0.55rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.crit-pill.active {
  background: rgba(56, 189, 248, 0.2);
  border-color: #38bdf8;
  color: #38bdf8;
}

.trait-chips-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.65rem;
}

.trait-chip-card {
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.trait-chip-card:hover {
  background: rgba(30, 41, 59, 0.6);
  border-color: rgba(56, 189, 248, 0.3);
}

.trait-chip-card.active {
  background: rgba(56, 189, 248, 0.12);
  border-color: #38bdf8;
}

.chip-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chip-top strong {
  font-size: 0.8rem;
  color: #fff;
}

.chip-cost {
  font-size: 0.7rem;
  font-weight: 800;
  color: #38bdf8;
  font-family: var(--font-mono, monospace);
}

.chip-title-label {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  cursor: pointer;
  user-select: none;
}

.chip-title-label input {
  display: none;
}

.chk-custom-sm {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.chip-title-label input:checked + .chk-custom-sm {
  background: #38bdf8;
  border-color: #38bdf8;
}

.chip-title-label input:checked + .chk-custom-sm::after {
  content: '✓';
  color: #090d16;
  font-size: 0.68rem;
  font-weight: 900;
}

.trait-inline-stepper {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  background: rgba(0, 0, 0, 0.4);
  padding: 0.15rem 0.35rem;
  border-radius: 6px;
  border: 1px solid rgba(56, 189, 248, 0.25);
}

.btn-trait-step {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.1s ease;
}

.btn-trait-step:hover:not(:disabled) {
  background: #38bdf8;
  color: #090d16;
  border-color: #38bdf8;
}

.btn-trait-step:active:not(:disabled) {
  transform: scale(0.92);
}

.btn-trait-step:disabled {
  opacity: 0.25;
  cursor: not-allowed;
}

.trait-step-val {
  font-size: 0.75rem;
  font-weight: 800;
  color: #fff;
  min-width: 32px;
  text-align: center;
  font-family: var(--font-mono, monospace);
  font-variant-numeric: tabular-nums;
}

.chip-cost-inactive {
  color: #64748b;
  font-size: 0.7rem;
  font-weight: 700;
  font-family: var(--font-mono, monospace);
}

.trait-chip-card p {
  font-size: 0.68rem;
  color: #94a3b8;
  margin: 0;
  line-height: 1.25;
}

.features-summary-hint {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.72rem;
  font-weight: 800;
  color: #94a3b8;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}

.features-count-tag {
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.15);
  padding: 0.1rem 0.45rem;
  border-radius: var(--radius-pill, 9999px);
}

.features-chips-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  max-height: 380px;
  overflow-y: auto;
}

.feature-toggle-pill {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #94a3b8;
  font-size: 0.74rem;
  font-weight: 600;
  padding: 0.3rem 0.65rem;
  border-radius: var(--radius-pill, 9999px);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  transition: all 0.15s ease;
}

.feature-toggle-pill:hover {
  background: rgba(30, 41, 59, 0.8);
  color: #fff;
}

.feature-toggle-pill.active {
  background: rgba(56, 189, 248, 0.15);
  border-color: #38bdf8;
  color: #38bdf8;
  font-weight: 700;
}

/* Step 4: Review */
.tactical-preview-card {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.preview-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.preview-title-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.preview-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.preview-name {
  font-size: 1rem;
  font-weight: 800;
  color: #fff;
  display: block;
}

.preview-type {
  font-size: 0.65rem;
  font-weight: 800;
  color: #94a3b8;
  letter-spacing: 0.05em;
}

.preview-ep-badge {
  font-size: 0.95rem;
  font-weight: 900;
  color: #38bdf8;
  font-family: var(--font-mono, monospace);
  background: rgba(56, 189, 248, 0.15);
  border: 1px solid rgba(56, 189, 248, 0.35);
  padding: 0.25rem 0.65rem;
  border-radius: 6px;
}

.preview-chips-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.prev-chip {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.05);
  color: #cbd5e1;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-family: var(--font-mono, monospace);
}

.prev-chip.chip-atk {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
}

.prev-chip.chip-dc {
  background: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
}

.prev-chip.chip-armor {
  background: rgba(16, 185, 129, 0.15);
  color: #6ee7b7;
}

.btn-refresh-text {
  background: transparent;
  border: none;
  color: #38bdf8;
  font-size: 0.68rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.2rem;
}

.status-select-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.status-select-row label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #94a3b8;
}

.status-options {
  display: flex;
  gap: 0.35rem;
}

.status-opt-btn {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #94a3b8;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.25rem 0.55rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  transition: all 0.15s ease;
}

.status-opt-btn.active {
  background: rgba(16, 185, 129, 0.15);
  border-color: #10b981;
  color: #6ee7b7;
}

/* Step Navigation Footer */
.step-nav-footer {
  padding: 1rem 1.5rem;
  background: rgba(15, 23, 42, 0.7);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}

.footer-spacer {
  flex: 1;
}

.btn-step-prev {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
  font-size: 0.8rem;
  font-weight: 700;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  transition: all 0.15s ease;
}

.btn-step-prev:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}

.btn-step-next {
  background: #38bdf8;
  border: 1px solid #7dd3fc;
  color: #090d16;
  font-size: 0.82rem;
  font-weight: 800;
  padding: 0.5rem 1.25rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  transition: all 0.15s ease;
}

.btn-step-next:hover {
  background: #7dd3fc;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(56, 189, 248, 0.3);
}

.btn-step-save {
  background: linear-gradient(135deg, #10b981, #059669);
  border: 1px solid #34d399;
  color: #fff;
  font-size: 0.82rem;
  font-weight: 800;
  padding: 0.5rem 1.25rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  transition: all 0.15s ease;
}

.btn-step-save:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

/* Right Column: Live BOM & Budget HUD (35%) */
.eq-live-bom-panel {
  background: #080c14;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
}

.bom-head {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: #38bdf8;
}

.bom-icon {
  font-size: 1.1rem;
}

.bom-title {
  font-size: 0.75rem;
  font-weight: 900;
  letter-spacing: 0.08em;
}

.bom-item-summary {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.bom-item-name {
  font-size: 0.9rem;
  font-weight: 800;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bom-tags-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.bom-cat-badge {
  font-size: 0.65rem;
  font-weight: 800;
  color: #94a3b8;
  background: rgba(255, 255, 255, 0.06);
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
}

.bom-cost-total {
  font-size: 0.85rem;
  font-weight: 900;
  color: #38bdf8;
  font-family: var(--font-mono, monospace);
}

/* Cost Breakdown Lines */
.bom-breakdown-list {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  flex: 1;
}

.bom-line-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.72rem;
  color: #cbd5e1;
  padding-bottom: 0.35rem;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.06);
}

.bom-line-cost {
  color: #38bdf8;
  font-weight: 700;
  font-family: var(--font-mono, monospace);
}

.bom-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
}

.bom-total-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.25rem 0;
}

.bom-total-label {
  font-size: 0.72rem;
  font-weight: 800;
  color: #94a3b8;
}

.bom-total-val {
  font-size: 1.1rem;
  font-weight: 900;
  color: #38bdf8;
  font-family: var(--font-mono, monospace);
}

/* Budget Impact Box */
.bom-budget-box {
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.bom-budget-box.is-deficit {
  border-color: rgba(239, 68, 68, 0.4);
  background: rgba(239, 68, 68, 0.05);
}

.bom-budget-box.is-balanced {
  border-color: rgba(16, 185, 129, 0.3);
}

.budget-box-head {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.68rem;
  font-weight: 900;
  color: #94a3b8;
  letter-spacing: 0.05em;
}

.is-deficit .budget-box-head {
  color: #ef4444;
}

.is-balanced .budget-box-head {
  color: #10b981;
}

.budget-progress-track {
  height: 6px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: var(--radius-pill, 9999px);
  overflow: hidden;
}

.budget-progress-fill {
  height: 100%;
  background: #38bdf8;
  transition: width 0.2s ease;
}

.is-deficit .budget-progress-fill {
  background: #ef4444;
}

.budget-stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.4rem;
  font-size: 0.68rem;
}

.b-stat {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.b-stat.full {
  grid-column: span 2;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 0.3rem;
}

.b-stat span {
  color: #64748b;
}

.b-stat strong {
  color: #e2e8f0;
  font-family: var(--font-mono, monospace);
}

.text-danger {
  color: #ef4444 !important;
}

.budget-alert-action {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.budget-deficit-text {
  font-size: 0.68rem;
  color: #fca5a5;
  margin: 0;
  line-height: 1.25;
}

.btn-quick-sync {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #fca5a5;
  font-size: 0.7rem;
  font-weight: 800;
  padding: 0.35rem 0.6rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  transition: all 0.15s ease;
}

.btn-quick-sync:hover {
  background: #dc2626;
  color: #fff;
}

.budget-ok-badge {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.72rem;
  color: #6ee7b7;
}

/* Mobile Responsiveness */
@media (max-width: 900px) {
  .eq-studio-card {
    height: 96vh;
  }
  .eq-studio-body {
    grid-template-columns: 1fr;
    overflow-y: auto;
  }
  .eq-step-workspace {
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }
  .category-cards-grid,
  .trait-chips-grid,
  .gadget-packs-grid {
    grid-template-columns: 1fr;
  }
}
</style>
