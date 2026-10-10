<template>
  <div class="dndb-hero-banner-wrapper">
    <!-- Hero Vitals & Identity Bar -->
    <section class="dndb-hero-banner" :class="{ 'drawer-expanded': showBioDrawer }">
      <div class="dndb-hero-identity">
        <!-- Dynamic Hero Crest / Initials Emblem (F-12) -->
        <div class="dndb-avatar-crest" :title="heroStore.character.name ? `Hero Crest: ${heroStore.character.name}` : 'Hero Crest'">
          <span v-if="heroInitials" class="avatar-initials">{{ heroInitials }}</span>
          <i v-else class="ri-shield-star-line"></i>
        </div>

        <div class="dndb-name-block">
          <!-- Row 1: Hero Name & Status Pill -->
          <div class="dndb-hero-name-row">
            <input
              v-model="heroStore.character.name"
              type="text"
              class="dndb-name-input"
              placeholder="Hero Name / Codename"
              @change="heroStore.pushHistory()"
            />
            <span v-if="heroStore.isDead" class="hero-status-pill deceased" title="Hero has suffered 3 degrees of failure and is deceased">
              <i class="ri-skull-line"></i> DECEASED
            </span>
            <span v-else-if="heroStore.isDying" class="hero-status-pill dying" title="Hero is near death. Fortitude DC 15 required each round">
              <i class="ri-heart-pulse-fill"></i> DYING ({{ heroStore.character.dyingFailures || 0 }}/3)
            </span>
            <span v-else-if="heroStore.character.isDyingStable && !heroStore.isDying" class="hero-status-pill stable" title="Hero has been stabilized and remains incapacitated">
              <i class="ri-heart-add-line"></i> STABILIZED
            </span>
          </div>

          <!-- Row 2: Sub-Identity Metadata Badges / Fields -->
          <div class="dndb-sub-identity-row">
            <div class="sub-meta-pill" title="Real Identity">
              <i :class="heroStore.character.isSecretIdentity ? 'ri-shield-keyhole-line' : 'ri-user-line'" class="sub-meta-icon"></i>
              <input
                v-model="heroStore.character.identity"
                type="text"
                class="sub-meta-input"
                placeholder="Real Identity"
                @change="heroStore.pushHistory()"
              />
            </div>

            <div class="sub-meta-pill" title="Player Name">
              <i class="ri-user-smile-line sub-meta-icon"></i>
              <input
                v-model="heroStore.character.player"
                type="text"
                class="sub-meta-input"
                placeholder="Player Name"
                @change="heroStore.pushHistory()"
              />
            </div>

            <div class="sub-meta-pill" title="Base of Operations">
              <i class="ri-building-line sub-meta-icon"></i>
              <input
                v-model="heroStore.character.baseOfOperations"
                type="text"
                class="sub-meta-input"
                placeholder="Base of Operations"
                @change="heroStore.pushHistory()"
              />
            </div>

            <button
              type="button"
              class="btn-bio-drawer-toggle"
              :class="{ active: showBioDrawer }"
              @click="showBioDrawer = !showBioDrawer"
              title="Edit Physical Demographics, Affiliation & Cover Dossier"
            >
              <i class="ri-fingerprint-line"></i>
              <span>Bio & Traits</span>
              <i class="ri-arrow-down-s-line toggle-arrow"></i>
            </button>
          </div>

          <!-- Row 3: Integrated Combat Conditions Row -->
          <div class="dndb-conditions-row" role="region" aria-label="Combat Conditions">
            <!-- When healthy / no conditions active -->
            <div v-if="activeConditionItems.length === 0" class="cond-healthy-wrap">
              <span class="cond-healthy-pill" title="Hero is unhindered with no debilitating combat conditions">
                <i class="ri-shield-check-fill"></i>
                <span>Unhindered</span>
              </span>
              <button
                type="button"
                class="btn-cond-quick-add"
                @click="uiStore.openModal('conditions')"
                title="Apply a combat condition (Dazed, Vulnerable, Stunned, etc.)"
              >
                <i class="ri-add-line"></i>
                <span>Condition</span>
              </button>
            </div>

            <!-- When active conditions exist -->
            <div v-else class="cond-active-chips-wrap">
              <span class="cond-strip-label" title="Active combat conditions affecting this character">
                <i class="ri-heart-pulse-fill"></i>
                <span>CONDITIONS ({{ activeConditionItems.length }}):</span>
              </span>

              <div
                v-for="item in activeConditionItems"
                :key="item.name"
                class="dndb-cond-chip"
                :class="{ 'is-severe': item.isSevere }"
                :title="item.desc ? `${item.name}: ${item.desc}` : item.name"
              >
                <span class="cond-chip-name">{{ item.displayName || item.name }}</span>
                <span v-if="item.briefEffect" class="cond-chip-effect">{{ item.briefEffect }}</span>
                <button
                  type="button"
                  class="btn-cond-dismiss"
                  @click.stop="heroStore.toggleCondition(item.name)"
                  :title="`Remove ${item.name} condition`"
                  :aria-label="`Remove ${item.name}`"
                >
                  <i class="ri-close-line"></i>
                </button>
              </div>

              <button
                type="button"
                class="btn-cond-quick-add"
                @click="uiStore.openModal('conditions')"
                title="Add another combat condition"
              >
                <i class="ri-add-line"></i>
                <span>Add</span>
              </button>

              <button
                v-if="activeConditionItems.length > 1"
                type="button"
                class="btn-cond-clear-all"
                @click="heroStore.clearConditions()"
                title="Clear all active combat conditions"
              >
                <i class="ri-restart-line"></i>
                <span>Clear All</span>
              </button>

              <button
                type="button"
                class="btn-cond-view-tracker"
                @click="openTrackerTab"
                title="Open full Conditions &amp; Injuries Tracker in Action Hub"
              >
                <i class="ri-external-link-line"></i>
                <span>Tracker</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Hero Vitals Dock (PL, HP, Injuries, Speed, Init, PP) -->
      <div class="dndb-hero-vitals-dock">
        <!-- Power Level Stepper -->
        <div class="dndb-vital-box pl-box">
          <span class="dndb-vital-label">POWER LEVEL</span>
          <div class="dndb-vital-stepper">
            <button
              type="button"
              class="step-btn-xs"
              :disabled="heroStore.character.powerLevel <= 1"
              title="Decrease PL"
              @click="setPL(heroStore.character.powerLevel - 1)"
            >-</button>
            <strong class="dndb-vital-val font-mono">{{ heroStore.character.powerLevel }}</strong>
            <button
              type="button"
              class="step-btn-xs"
              :disabled="heroStore.character.powerLevel >= 20"
              title="Increase PL"
              @click="setPL(heroStore.character.powerLevel + 1)"
            >+</button>
          </div>
        </div>

        <!-- Hero Points Stepper -->
        <div class="dndb-vital-box hp-box">
          <span class="dndb-vital-label">HERO POINTS</span>
          <div class="dndb-vital-stepper">
            <button
              type="button"
              class="step-btn-xs"
              :disabled="(heroStore.character.heroPoints || 0) <= 0"
              title="Spend Hero Point"
              @click="adjustHeroPoints(-1)"
            >-</button>
            <strong class="dndb-vital-val font-mono">{{ heroStore.character.heroPoints ?? 1 }}</strong>
            <button
              type="button"
              class="step-btn-xs"
              title="Gain Hero Point"
              @click="adjustHeroPoints(1)"
            >+</button>
          </div>
        </div>

        <!-- Damage & Injuries Stepper (Quick Combat Vitals) -->
        <div
          class="dndb-vital-box damage-box"
          :class="{ 'has-injuries': heroStore.character.injuries > 0 }"
          title="Tracks cumulative bruised penalties from failed Toughness checks"
        >
          <span class="dndb-vital-label"><i class="ri-shield-cross-line"></i> BRUISES & INJURIES</span>
          <div class="dndb-vital-stepper">
            <button
              type="button"
              class="step-btn-xs"
              :disabled="heroStore.character.injuries <= 0"
              title="Recover 1 bruise (1 minute rest)"
              @click="heroStore.adjustInjuries(-1)"
            >-</button>
            <strong class="dndb-vital-val font-mono" :class="{ wounded: heroStore.character.injuries > 0 }">
              {{ heroStore.character.injuries || 0 }}
            </strong>
            <button
              type="button"
              class="step-btn-xs"
              title="Add 1 bruise (+1 injury penalty)"
              @click="heroStore.adjustInjuries(1)"
            >+</button>
          </div>
          <div v-if="heroStore.character.injuries > 0" class="dndb-injury-status-row">
            <span class="dndb-vital-sub wounded">
              <i class="ri-arrow-down-line"></i> -{{ heroStore.character.injuries }} Toughness
            </span>
            <button
              type="button"
              class="btn-injury-quick-heal"
              title="Heal all injuries (Reset to 0)"
              @click="heroStore.clearInjuries()"
            >
              <i class="ri-first-aid-kit-line"></i>
            </button>
          </div>
        </div>

        <!-- Speed / Movement Badge -->
        <div
          class="dndb-vital-box speed-box"
          :class="{
            'is-immobile': heroStore.speedTotal.isImmobile,
            'is-hindered': heroStore.speedTotal.isHindered
          }"
          :title="heroStore.speedTotal.isImmobile ? 'Immobile: Speed 0 (cannot move)' : (heroStore.speedTotal.isHindered ? 'Hindered: Moves at half speed' : 'Normal movement speed')"
        >
          <span class="dndb-vital-label">SPEED</span>
          <strong class="dndb-vital-val font-mono">{{ heroStore.speedTotal.val }}</strong>
          <span class="dndb-vital-sub">{{ heroStore.speedTotal.sub }}</span>
        </div>

        <!-- Initiative Badge -->
        <div class="dndb-vital-box init-box" title="Click to Roll Initiative" @click="rollInitiative">
          <span class="dndb-vital-label">INITIATIVE</span>
          <strong class="dndb-vital-val font-mono">
            {{ heroStore.initiativeTotal >= 0 ? `+${heroStore.initiativeTotal}` : heroStore.initiativeTotal }}
          </strong>
          <span class="dndb-vital-sub"><i class="ri-dice-line"></i> ROLL</span>
        </div>

        <!-- PP Summary Meter -->
        <div class="dndb-vital-box pp-box">
          <span class="dndb-vital-label">POWER POINTS</span>
          <div class="dndb-pp-val-row font-mono">
            <span id="dndb-pp-spent">{{ heroStore.totalSpentPP }}</span> / <span id="dndb-pp-budget">{{ heroStore.totalBudgetPP }}</span> PP
          </div>
          <div class="dndb-pp-mini-bar">
            <div
              class="dndb-pp-progress-fill"
              :class="{ overbudget: heroStore.remainingPP < 0 }"
              :style="{ width: Math.min(100, Math.max(0, Math.round((heroStore.totalSpentPP / heroStore.totalBudgetPP) * 100))) + '%' }"
            ></div>
          </div>
        </div>
      </div>
    </section>

    <!-- FULL-WIDTH TACTICAL DOSSIER: BIO & PHYSICAL PROFILE -->
    <div
      class="dndb-bio-drawer-fullwidth"
      :class="{ open: showBioDrawer }"
      aria-label="Character Physical Profile and Affiliation Dossier"
    >
      <div class="drawer-content-clip">
        <div class="drawer-inner-envelope">
          <div class="dossier-header-bar">
            <div class="dossier-tag">
              <i class="ri-profile-line"></i>
              <span>HERO DOSSIER & BIOMETRIC PROFILE</span>
            </div>
            <div class="dossier-meta-badge">
              <span
                class="classification-badge"
                :class="heroStore.character.isSecretIdentity ? 'is-secret' : 'is-public'"
              >
                <i :class="heroStore.character.isSecretIdentity ? 'ri-lock-password-line' : 'ri-global-line'"></i>
                <span>{{ heroStore.character.isSecretIdentity ? 'Classified / Secret Identity' : 'Public Persona' }}</span>
              </span>
            </div>
          </div>

          <div class="dossier-body-grid">
            <!-- Left Wing: Cover & Affiliation -->
            <div class="dossier-card cover-card">
              <div class="dossier-card-title">
                <i class="ri-shield-user-line"></i>
                <span>Cover & Agency Affiliation</span>
              </div>

              <div class="cover-fields-stack">
                <!-- Identity Classification Switch -->
                <div class="dossier-form-group">
                  <label class="dossier-label">Identity Classification</label>
                  <div class="identity-switch-group">
                    <button
                      type="button"
                      class="id-switch-btn"
                      :class="{ active: heroStore.character.isSecretIdentity }"
                      @click="setIdentityStatus(true)"
                    >
                      <i class="ri-shield-keyhole-fill"></i>
                      <span>Secret Identity</span>
                    </button>
                    <button
                      type="button"
                      class="id-switch-btn"
                      :class="{ active: !heroStore.character.isSecretIdentity }"
                      @click="setIdentityStatus(false)"
                    >
                      <i class="ri-global-line"></i>
                      <span>Public Identity</span>
                    </button>
                  </div>
                </div>

                <!-- Group Affiliation -->
                <div class="dossier-form-group">
                  <label class="dossier-label">Group Affiliation / Team</label>
                  <div class="dossier-input-wrap">
                    <i class="ri-team-line input-icon"></i>
                    <input
                      v-model="heroStore.character.groupAffiliation"
                      type="text"
                      class="dossier-input"
                      placeholder="e.g. Freedom League, Sentinels, Titans"
                      @change="heroStore.pushHistory()"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Wing: Biometrics & Physical Characteristics Bento -->
            <div class="dossier-card biometrics-card">
              <div class="dossier-card-title">
                <i class="ri-fingerprint-line"></i>
                <span>Physical Characteristics & Demographics</span>
              </div>

              <div class="biometrics-tiles-grid">
                <!-- Gender -->
                <div class="bio-tile">
                  <div class="tile-label">
                    <i class="ri-genderless-line"></i>
                    <span>GENDER</span>
                  </div>
                  <input
                    v-model="heroStore.character.gender"
                    type="text"
                    class="bio-tile-input"
                    placeholder="e.g. Female"
                    @change="heroStore.pushHistory()"
                  />
                </div>

                <!-- Age -->
                <div class="bio-tile">
                  <div class="tile-label">
                    <i class="ri-calendar-line"></i>
                    <span>AGE</span>
                  </div>
                  <input
                    v-model="heroStore.character.age"
                    type="text"
                    class="bio-tile-input"
                    placeholder="e.g. 28"
                    @change="heroStore.pushHistory()"
                  />
                </div>

                <!-- Height -->
                <div class="bio-tile">
                  <div class="tile-label">
                    <i class="ri-ruler-line"></i>
                    <span>HEIGHT</span>
                  </div>
                  <input
                    v-model="heroStore.character.height"
                    type="text"
                    class="bio-tile-input"
                    placeholder="e.g. 5'10&quot;"
                    @change="heroStore.pushHistory()"
                  />
                </div>

                <!-- Weight -->
                <div class="bio-tile">
                  <div class="tile-label">
                    <i class="ri-scales-3-line"></i>
                    <span>WEIGHT</span>
                  </div>
                  <input
                    v-model="heroStore.character.weight"
                    type="text"
                    class="bio-tile-input"
                    placeholder="e.g. 155 lbs"
                    @change="heroStore.pushHistory()"
                  />
                </div>

                <!-- Eyes -->
                <div class="bio-tile">
                  <div class="tile-label">
                    <i class="ri-eye-line"></i>
                    <span>EYES</span>
                  </div>
                  <input
                    v-model="heroStore.character.eyes"
                    type="text"
                    class="bio-tile-input"
                    placeholder="e.g. Blue"
                    @change="heroStore.pushHistory()"
                  />
                </div>

                <!-- Hair -->
                <div class="bio-tile">
                  <div class="tile-label">
                    <i class="ri-scissors-line"></i>
                    <span>HAIR</span>
                  </div>
                  <input
                    v-model="heroStore.character.hair"
                    type="text"
                    class="bio-tile-input"
                    placeholder="e.g. Auburn"
                    @change="heroStore.pushHistory()"
                  />
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
import { useUiStore } from '../../stores/uiStore.js';

const showBioDrawer = ref(false);
import {
  BASIC_CONDITIONS,
  COMBINED_CONDITIONS,
  DEBILITATED_EFFECTS,
  getConditionBriefEffect,
  isConditionSevere
} from '../../rules/conditions.js';

const heroStore = useHeroStore();
const uiStore = useUiStore();

const heroInitials = computed(() => {
  const name = heroStore.character.name?.trim();
  if (!name) return '';
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
});

const conditionDescMap = computed(() => {
  const map = {};
  for (const c of BASIC_CONDITIONS) {
    map[c.name] = c.desc;
  }
  for (const c of COMBINED_CONDITIONS) {
    map[c.name] = c.desc;
  }
  for (const [code, info] of Object.entries(DEBILITATED_EFFECTS)) {
    map[`Debilitated:${code}`] = info.desc;
  }
  return map;
});

const activeConditionItems = computed(() => {
  const active = heroStore.character.activeConditions || [];
  return active.map(name => {
    let displayName = name;
    if (name.startsWith('Debilitated:')) {
      const code = name.split(':')[1]?.toUpperCase();
      displayName = `Debilitated (${code})`;
    }
    return {
      name,
      displayName,
      briefEffect: getConditionBriefEffect(name),
      isSevere: isConditionSevere(name),
      desc: conditionDescMap.value[name] || ''
    };
  });
});

function setIdentityStatus(isSecret) {
  heroStore.character.isSecretIdentity = isSecret;
  heroStore.pushHistory();
}

function openTrackerTab() {
  uiStore.setActiveActionHubTab('conditions');
  const hubEl = document.querySelector('.dndb-tabbed-hub');
  if (hubEl) {
    hubEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function setPL(newPL) {
  heroStore.character.powerLevel = Math.max(1, Math.min(20, newPL));
  heroStore.pushHistory();
}

function adjustHeroPoints(delta) {
  const cur = heroStore.character.heroPoints ?? 1;
  heroStore.character.heroPoints = Math.max(0, cur + delta);
  heroStore.pushHistory();
}

function rollInitiative() {
  heroStore.rollInitiative();
}
</script>

<style scoped>
/* Wrapper and Banner Expansion */
.dndb-hero-banner-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.dndb-hero-banner.drawer-expanded {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  border-bottom: 1px solid rgba(56, 189, 248, 0.25);
}

.hero-status-pill {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 800;
  padding: 0.22rem 0.55rem;
  border-radius: var(--radius-xs, 4px);
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.hero-status-pill.deceased {
  background: rgba(239, 68, 68, 0.25);
  border: 1px solid #ef4444;
  color: #ffffff;
}

.hero-status-pill.dying {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.45);
  color: #fca5a5;
}

.hero-status-pill.stable {
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.4);
  color: #a7f3d0;
}

/* Sub-Identity Metadata Pills */
.sub-meta-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-xs, 5px);
  padding: 0.18rem 0.5rem;
  transition: all 0.15s ease;
}

.sub-meta-pill:hover,
.sub-meta-pill:focus-within {
  background: rgba(15, 23, 42, 0.7);
  border-color: rgba(56, 189, 248, 0.35);
  box-shadow: 0 0 8px rgba(56, 189, 248, 0.12);
}

.sub-meta-icon {
  font-size: 0.8rem;
  color: #38bdf8;
  opacity: 0.85;
}

.sub-meta-input {
  background: transparent;
  border: none;
  outline: none;
  color: #e2e8f0;
  font-size: 0.82rem;
  font-family: inherit;
  width: 125px;
}

.sub-meta-input:focus {
  color: #fff;
}

.sub-meta-input:focus-visible {
  outline: 2px solid var(--accent-secondary, #2a8fd6);
  outline-offset: 2px;
  border-radius: 2px;
}

.sub-meta-input::placeholder {
  color: var(--text-secondary, #94a3b8);
  font-size: 0.76rem;
}

/* Bio & Traits Toggle Button */
.btn-bio-drawer-toggle {
  background: rgba(56, 189, 248, 0.08);
  border: 1px solid rgba(56, 189, 248, 0.25);
  border-radius: var(--radius-xs, 5px);
  color: #38bdf8;
  font-size: 0.76rem;
  font-weight: 700;
  padding: 0.22rem 0.65rem;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
  user-select: none;
}

.btn-bio-drawer-toggle:hover {
  background: rgba(56, 189, 248, 0.18);
  border-color: #38bdf8;
  color: #fff;
}

.btn-bio-drawer-toggle.active {
  background: #0284c7;
  border-color: #38bdf8;
  color: #fff;
}

.toggle-arrow {
  font-size: 0.85rem;
  display: inline-block;
  transition: transform 0.2s cubic-bezier(0.2, 0, 0, 1);
  will-change: transform;
}

.btn-bio-drawer-toggle.active .toggle-arrow {
  transform: rotate(180deg);
}

/* Full-Width Slide-Down Drawer Container (Zero-Reflow GPU Animation) */
.dndb-bio-drawer-fullwidth {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.2s cubic-bezier(0.2, 0, 0, 1),
              border-color 0.2s ease,
              box-shadow 0.2s ease;
  background: rgba(10, 15, 29, 0.98);
  border: 1px solid transparent;
  border-top: none;
  border-bottom-left-radius: var(--radius-lg, 10px);
  border-bottom-right-radius: var(--radius-lg, 10px);
  overflow: hidden;
  box-shadow: none;
  position: relative;
}

.dndb-bio-drawer-fullwidth.open {
  grid-template-rows: 1fr;
  border-color: rgba(56, 189, 248, 0.3);
  box-shadow: 0 16px 36px -6px rgba(0, 0, 0, 0.6);
}

.drawer-content-clip {
  min-height: 0;
  overflow: hidden;
}

.drawer-inner-envelope {
  padding: 1.1rem 1.4rem 1.35rem 1.4rem;
  opacity: 0;
  transform: translateY(-8px);
  transition: opacity 0.18s cubic-bezier(0.2, 0, 0, 1),
              transform 0.18s cubic-bezier(0.2, 0, 0, 1);
  will-change: opacity, transform;
}

.dndb-bio-drawer-fullwidth.open .drawer-inner-envelope {
  opacity: 1;
  transform: translateY(0);
}

/* Dossier Header Bar */
.dossier-header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.85rem;
  padding-bottom: 0.6rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.dossier-tag {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #94a3b8;
  text-transform: uppercase;
}

.dossier-tag i {
  color: #38bdf8;
  font-size: 0.85rem;
}

.classification-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.2rem 0.6rem;
  border-radius: var(--radius-pill, 9999px);
  letter-spacing: 0.03em;
}

.classification-badge.is-secret {
  background: rgba(14, 165, 233, 0.15);
  border: 1px solid rgba(56, 189, 248, 0.4);
  color: #38bdf8;
}

.classification-badge.is-public {
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(52, 211, 153, 0.4);
  color: #34d399;
}

/* Dossier Body Grid (2 Columns: 360px / 1fr) */
.dossier-body-grid {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 1rem;
}

@media (max-width: 980px) {
  .dossier-body-grid {
    grid-template-columns: 1fr;
  }
}

/* Dossier Cards (Double-Bezel Inner Core) */
.dossier-card {
  background: rgba(15, 23, 42, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.06);
}

.dossier-card-title {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: #cbd5e1;
  text-transform: uppercase;
}

.dossier-card-title i {
  color: #38bdf8;
  font-size: 0.85rem;
}

/* Cover Stack */
.cover-fields-stack {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.dossier-form-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.dossier-label {
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: #94a3b8;
  text-transform: uppercase;
}

.identity-switch-group {
  display: flex;
  gap: 0.4rem;
}

.id-switch-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  background: rgba(2, 6, 23, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.4rem 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.id-switch-btn:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
}

.id-switch-btn.active {
  background: rgba(14, 165, 233, 0.18);
  border-color: #38bdf8;
  color: #38bdf8;
}

.dossier-input-wrap {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  background: rgba(2, 6, 23, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 0.35rem 0.6rem;
  transition: border-color 0.15s ease;
}

.dossier-input-wrap:focus-within {
  border-color: #38bdf8;
}

.input-icon {
  color: #38bdf8;
  font-size: 0.85rem;
  opacity: 0.85;
}

.dossier-input {
  background: transparent;
  border: none;
  outline: none;
  color: #f8fafc;
  font-size: 0.82rem;
  width: 100%;
}

.dossier-input:focus-visible {
  outline: 2px solid var(--accent-secondary, #2a8fd6);
  outline-offset: 2px;
}

.dossier-input::placeholder {
  color: var(--text-secondary, #94a3b8);
}

/* Biometrics Bento Grid */
.biometrics-tiles-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.55rem;
}

@media (max-width: 600px) {
  .biometrics-tiles-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.bio-tile {
  background: rgba(2, 6, 23, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 6px;
  padding: 0.45rem 0.6rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  transition: all 0.15s ease;
}

.bio-tile:focus-within {
  border-color: rgba(56, 189, 248, 0.5);
  background: rgba(2, 6, 23, 0.85);
}

.tile-label {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.64rem;
  font-weight: 800;
  color: #94a3b8;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.tile-label i {
  color: #38bdf8;
  font-size: 0.74rem;
}

.bio-tile-input {
  background: transparent;
  border: none;
  outline: none;
  color: #f8fafc;
  font-size: 0.84rem;
  font-weight: 600;
  padding: 0;
  width: 100%;
}

.bio-tile-input:focus-visible {
  outline: 2px solid var(--accent-secondary, #2a8fd6);
  outline-offset: 2px;
}

.bio-tile-input::placeholder {
  color: var(--text-secondary, #94a3b8);
  font-weight: normal;
  font-size: 0.78rem;
}
</style>
