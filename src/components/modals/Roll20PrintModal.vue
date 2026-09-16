<template>
  <div v-if="uiStore.modals.roll20" class="r20-modal-overlay" @click.self="uiStore.closeModal('roll20')">
    <div class="r20-modal-container">
      <!-- TOP ACTION BAR -->
      <div class="r20-modal-bar">
        <div style="display: flex; align-items: center; gap: 1rem;">
          <div class="r20-modal-title">
            <i class="ri-printer-fill" style="margin-right: 0.35rem;"></i>
            ROLL20 CHARACTER SHEET & EXPORT
          </div>
          <div class="r20-tab-pills">
            <button
              class="r20-tab-pill"
              :class="{ active: currentTab === 'preview' }"
              @click="currentTab = 'preview'"
            >
              <i class="ri-newspaper-line"></i> Sheet Preview
            </button>
            <button
              class="r20-tab-pill"
              :class="{ active: currentTab === 'macros' }"
              @click="currentTab = 'macros'"
            >
              <i class="ri-terminal-box-line"></i> Roll20 Macros
            </button>
            <button
              class="r20-tab-pill"
              :class="{ active: currentTab === 'text' }"
              @click="currentTab = 'text'"
            >
              <i class="ri-file-text-line"></i> Markdown & BBCode
            </button>
          </div>
        </div>

        <div style="display: flex; gap: 0.5rem; align-items: center;">
          <button v-if="currentTab === 'preview'" class="btn btn-primary btn-sm" @click="handlePrint">
            <i class="ri-printer-line"></i> Print / Save PDF
          </button>
          <button class="btn btn-secondary btn-sm" @click="uiStore.closeModal('roll20')">
            <i class="ri-close-line"></i> Close
          </button>
        </div>
      </div>

      <!-- TAB 1: SHEET PREVIEW -->
      <div v-if="currentTab === 'preview'" class="r20-preview-scroll">
        <!-- ================= PAGE 1: CORE COMBAT SHEET ================= -->
        <div class="roll20-sheet r20-page-1 print-target">
          <!-- HEADER BANNER -->
          <header class="r20-header">
            <div class="r20-price-stamp">
              <span class="price-num">12¢</span>
              <span class="price-label">PL {{ heroStore.character.powerLevel || 10 }}</span>
            </div>

            <div class="r20-title-block">
              <div style="font-family: var(--r20-font-header); font-size: 1.65rem; color: #ffcd29; text-shadow: 2px 2px 0 #2a2522; letter-spacing: 2px;">
                MUTANTS &amp; MASTERMINDS
              </div>
              <div class="r20-real-name-bar">Real Identity: {{ heroStore.character.identity || 'Classified' }}</div>
              <h1 class="r20-hero-name">{{ (heroStore.character.name || 'Hero Name').toUpperCase() }}</h1>
              <div class="r20-pp-equation">
                Ability <span class="highlight">{{ heroStore.abilitiesCost }}</span> + 
                Defense <span class="highlight">{{ heroStore.defensesCost }}</span> + 
                Skill <span class="highlight">{{ heroStore.skillsCost }}</span> + 
                Advantage <span class="highlight">{{ heroStore.advantagesCost }}</span> + 
                Powers <span class="highlight">{{ heroStore.powersCost }}</span> = 
                Total <span class="highlight">{{ heroStore.totalSpentPP }} / {{ heroStore.totalBudgetPP }} PP</span>
              </div>
            </div>

            <div class="r20-header-right">
              <div class="r20-hero-points-badge">
                <span>HERO POINTS</span>
                <span class="r20-hero-points-val">{{ heroStore.character.heroPoints || 1 }}</span>
              </div>
              <div class="r20-complications-box">
                <div class="r20-complications-header">COMPLICATIONS</div>
                <div class="r20-complications-content">
                  <div v-if="heroStore.character.complications?.length">
                    <div v-for="c in heroStore.character.complications" :key="c.id" style="line-height: 1.25; margin-bottom: 2px;">
                      <strong>{{ c.name }}</strong>
                    </div>
                  </div>
                  <div v-else style="font-style: italic; font-size: 0.75rem;">
                    Motivation: Justice / Responsibility.<br>Personal relationships, secret identity.
                  </div>
                </div>
              </div>
            </div>
          </header>

          <!-- CONDITIONS & MOVEMENT ROW -->
          <div class="r20-cond-move-row">
            <!-- Conditions Panel -->
            <div class="r20-panel">
              <div class="r20-panel-title conditions-title">
                <span>CONDITIONS</span>
                <small style="font-size: 0.75rem; color: #ffcd29;">Damage &amp; Penalties</small>
              </div>
              <div class="r20-conditions-body">
                <div class="r20-damage-track">
                  <span>BRUISES / DAMAGE:</span>
                  <label><input type="checkbox" :checked="(heroStore.character.injuries || 0) >= 1"> -1</label>
                  <label><input type="checkbox" :checked="(heroStore.character.injuries || 0) >= 2"> -2</label>
                  <label><input type="checkbox" :checked="(heroStore.character.injuries || 0) >= 3"> -3</label>
                  <label><input type="checkbox" :checked="(heroStore.character.injuries || 0) >= 4"> -4</label>
                  <label><input type="checkbox" :checked="(heroStore.character.injuries || 0) >= 5"> -5</label>
                  <span style="margin-left: 10px; color: var(--r20-red);">• STAGGERED: <input type="checkbox" :checked="heroStore.character.activeConditions?.includes('Staggered')"></span>
                  <span style="color: var(--r20-red);">• INCAPACITATED: <input type="checkbox" :checked="heroStore.character.activeConditions?.includes('Incapacitated')"></span>
                </div>
                <div class="r20-condition-chips-grid">
                  <label v-for="cond in basicConditions" :key="cond" class="r20-cond-chip">
                    <input type="checkbox" :checked="heroStore.character.activeConditions?.includes(cond)">
                    <span>{{ cond }}</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Movement Panel -->
            <div class="r20-panel">
              <div class="r20-panel-title movement-title">
                <span>MOVEMENT</span>
              </div>
              <div class="r20-movement-body">
                <div class="r20-move-item">
                  <strong>Ground (Rank 0)</strong>
                  <span>2 mph • 30 ft/rnd</span>
                </div>
                <div v-for="m in movementData" :key="m.type" class="r20-move-item">
                  <strong>{{ m.type }} (Rank {{ m.rank }})</strong>
                  <span>{{ m.speed }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- DEFENSES & ATTACKS ROW -->
          <div class="r20-defense-attack-row">
            <!-- Defenses Panel -->
            <div class="r20-panel">
              <div class="r20-panel-title defenses-title">
                <span>DEFENSES</span>
              </div>
              <table class="r20-defense-table">
                <thead>
                  <tr>
                    <th style="text-align: left;">Defense</th>
                    <th>Total</th>
                    <th>Base</th>
                    <th>Bought</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="d in defenseList" :key="d.code">
                    <td class="r20-def-name-cell">
                      {{ d.name }} <span class="r20-def-sub">({{ d.abl }})</span>
                    </td>
                    <td><span class="r20-def-total-badge">{{ heroStore.getDefenseTotal(d.code) }}</span></td>
                    <td><span class="r20-def-pill">{{ heroStore.getDefenseBase(d.code) }}</span></td>
                    <td><span class="r20-def-pill">{{ d.code === 'TOUGHNESS' ? '+' + (heroStore.getDefenseTotal('TOUGHNESS') - heroStore.getDefenseBase('TOUGHNESS')) : (heroStore.character.defensesBought?.[d.code] || 0) }}</span></td>
                  </tr>
                </tbody>
              </table>
              <div class="r20-hits-box">
                <span>CURRENT INJURIES / HITS</span>
                <span class="r20-hits-val">{{ heroStore.character.injuries || 0 }}</span>
              </div>
            </div>

            <!-- Attacks & Initiative Panel -->
            <div class="r20-panel">
              <div class="r20-panel-title attacks-title">
                <span>ATTACKS &amp; INITIATIVE</span>
                <div class="r20-init-badge">
                  <span>INITIATIVE:</span>
                  <span class="r20-init-val">+{{ heroStore.getDefenseBase('INITIATIVE') }}</span>
                </div>
              </div>
              <table class="r20-attack-table">
                <thead>
                  <tr>
                    <th style="text-align: left;">Attack Name</th>
                    <th>Bonus</th>
                    <th>Rnk</th>
                    <th>Descriptor</th>
                    <th>DC</th>
                    <th>Crit</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="atk in heroStore.targetedAttacks" :key="atk.id">
                    <td class="r20-attack-name-cell">{{ atk.name }}</td>
                    <td>
                      <span class="r20-attack-bonus-badge">
                        {{ (atk.isArea || atk.isPerception || atk.rollBonus === 'Auto') ? 'Auto' : (Number(atk.rollBonus) >= 0 ? '+' + atk.rollBonus : atk.rollBonus) }}
                      </span>
                    </td>
                    <td>{{ atk.effectRank ?? atk.rank ?? 0 }}</td>
                    <td>{{ atk.descriptor || atk.effectName || 'Damage' }}</td>
                    <td><span class="r20-dc-badge">{{ atk.dc || 15 }}</span></td>
                    <td>20</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 8 ABILITIES ROW -->
          <div class="r20-abilities-row">
            <div v-for="abl in abilityList" :key="abl.code" class="r20-ability-capsule">
              <div class="r20-abl-badge">{{ heroStore.effectiveAbilities[abl.code] ?? 0 }}</div>
              <div class="r20-abl-name">{{ abl.name }}</div>
              <div class="r20-abl-pill">MOD: {{ (heroStore.effectiveAbilities[abl.code] ?? 0) >= 0 ? '+' + (heroStore.effectiveAbilities[abl.code] ?? 0) : heroStore.effectiveAbilities[abl.code] }}</div>
            </div>
          </div>

          <!-- 3-COLUMN LOWER SECTION -->
          <div class="r20-three-col-row">
            <!-- COLUMN 1: ADVANTAGES -->
            <div class="r20-panel">
              <div class="r20-panel-title advantages-title">
                <span>ADVANTAGES</span>
                <small style="font-size: 0.75rem; color: #ffcd29;">{{ heroStore.character.advantages?.length || 0 }} Trained</small>
              </div>
              <div class="r20-adv-list">
                <div v-if="!heroStore.character.advantages?.length" style="color: #777; padding: 6px; font-style: italic;">
                  No advantages purchased.
                </div>
                <div v-for="adv in heroStore.character.advantages" :key="adv.name" class="r20-adv-item">
                  <span class="r20-adv-name">{{ adv.name }}</span>
                  <span class="r20-adv-rank">{{ adv.ranks || 1 }}</span>
                </div>
              </div>
            </div>

            <!-- COLUMN 2: POWERS -->
            <div class="r20-panel">
              <div class="r20-panel-title attacks-title">
                <span>POWERS</span>
                <small style="font-size: 0.75rem; color: #ffcd29;">{{ heroStore.character.powers?.length || 0 }} Powers</small>
              </div>
              <div class="r20-powers-list">
                <div v-if="!heroStore.character.powers?.length" style="color: #777; padding: 6px; font-style: italic;">
                  No powers defined.
                </div>
                <div v-for="p in heroStore.character.powers" :key="p.id" class="r20-power-card">
                  <div class="r20-power-header">
                    <span class="r20-power-name">{{ p.name || p.baseEffect }}</span>
                    <span class="r20-power-cost">Cost: {{ calculatePowerTotalCost(p) }} PP</span>
                  </div>
                  <div class="r20-power-body">
                    <div class="r20-power-tags">
                      <span class="r20-tag">{{ p.mainEffect?.baseEffect || p.baseEffect || 'Effect' }}</span>
                      <span class="r20-tag">{{ p.mainEffect?.action || 'Standard' }}</span>
                      <span class="r20-tag">{{ p.mainEffect?.range || 'Close' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- COLUMN 3: SKILLS -->
            <div class="r20-panel">
              <div class="r20-panel-title skills-title">
                <span>SKILLS</span>
                <small style="font-size: 0.75rem; color: #ffcd29;">{{ heroStore.character.skills?.length || 0 }} Trained</small>
              </div>
              <div class="r20-skills-list">
                <div v-for="sk in heroStore.character.skills" :key="sk.id" class="r20-skill-item">
                  <span class="r20-skill-bonus">+{{ (sk.ranks || 0) + (heroStore.effectiveAbilities[getSkillAbility(sk.name)] || 0) }}</span>
                  <span class="r20-skill-name">{{ sk.name }}{{ sk.subtype ? ` (${sk.subtype})` : '' }}</span>
                  <span class="r20-skill-breakdown">Rnk {{ sk.ranks }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ================= PAGE 2: BIO & EQUIPMENT ================= -->
        <div class="roll20-sheet r20-page-2 print-target mt-4">
          <div class="r20-panel" style="margin-bottom: 15px;">
            <div class="r20-panel-title">
              <span>CHARACTER BACKGROUND &amp; BIOGRAPHY</span>
              <span style="font-size: 0.85rem; color: #ffcd29;">{{ heroStore.character.name || 'Hero' }}</span>
            </div>
            <div class="r20-bio-grid">
              <div class="r20-bio-item"><strong>Hero Name:</strong> {{ heroStore.character.name || 'Hero' }}</div>
              <div class="r20-bio-item"><strong>Real Identity:</strong> {{ heroStore.character.identity || 'Secret Alter Ego' }}</div>
              <div class="r20-bio-item"><strong>Status:</strong> {{ heroStore.character.isSecretIdentity ? 'Secret Identity' : 'Public ID' }}</div>
              <div class="r20-bio-item"><strong>Player:</strong> {{ heroStore.character.player || '-' }}</div>
              <div class="r20-bio-item"><strong>Power Level:</strong> {{ heroStore.character.powerLevel || 10 }}</div>
              <div class="r20-bio-item"><strong>Base of Operations:</strong> {{ heroStore.character.baseOfOperations || 'Freedom City' }}</div>
            </div>
          </div>

          <div class="r20-equip-grid">
            <div class="r20-panel">
              <div class="r20-panel-title complications-title">
                <span>MOTIVATIONS &amp; COMPLICATIONS</span>
              </div>
              <div style="padding: 12px 14px; font-size: 0.85rem; line-height: 1.45;">
                <div v-if="heroStore.character.complications?.length">
                  <p v-for="c in heroStore.character.complications" :key="c.id" style="margin-bottom: 0.5rem;">
                    <strong>{{ c.name }} ({{ c.type || 'Motivation' }}):</strong>
                    <span> {{ c.desc || 'No details provided.' }}</span>
                  </p>
                </div>
                <div v-else style="color: #666; font-style: italic;">
                  No complications defined. Add complications to earn Hero Points during gameplay.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 2: ROLL20 MACROS -->
      <div v-else-if="currentTab === 'macros'" class="r20-tab-scroll">
        <div class="macro-header-bar mb-3">
          <div>
            <div style="font-weight: 800; color: #fff; font-size: 1.05rem;">
              Ready-to-Use Roll20 Macro Commands
            </div>
            <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.2rem;">
              Compatible with Roll20 Default Template and Quick Chat /roll format
            </div>
          </div>
          <button class="btn btn-primary btn-sm" @click="copyAllMacros">
            <i class="ri-file-copy-2-line"></i> Copy All Macros
          </button>
        </div>

        <div class="macro-category-row mb-3">
          <button
            v-for="cat in ['All', 'Attacks', 'Defenses', 'Abilities', 'Initiative']"
            :key="cat"
            class="cat-filter-btn"
            :class="{ active: macroFilter === cat }"
            @click="macroFilter = cat"
          >
            {{ cat }}
          </button>
        </div>

        <div class="macros-grid">
          <div v-for="m in filteredMacros" :key="m.title" class="macro-card">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="macro-title">{{ m.title }}</span>
              <span class="badge" style="background: rgba(59, 130, 246, 0.2); color: #93c5fd; font-size: 0.68rem;">{{ m.category }}</span>
            </div>
            <div class="macro-code-box mt-2">
              <code>{{ m.command }}</code>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem;">
              <span style="font-size: 0.72rem; color: var(--text-muted);">Format: &amp;{template:default}</span>
              <button class="btn btn-secondary btn-xs" @click="copySingleMacro(m.command)">
                <i class="ri-file-copy-line"></i> Copy
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 3: TEXT EXPORT (MARKDOWN & BBCODE) -->
      <div v-else class="r20-tab-scroll">
        <div class="text-format-switch mb-3">
          <div style="display: flex; gap: 0.5rem;">
            <button
              class="modal-tab-btn"
              :class="{ active: textFormat === 'markdown' }"
              @click="textFormat = 'markdown'"
            >
              <i class="ri-markdown-line"></i> Markdown (Discord / GitHub / Obsidian)
            </button>
            <button
              class="modal-tab-btn"
              :class="{ active: textFormat === 'bbcode' }"
              @click="textFormat = 'bbcode'"
            >
              <i class="ri-code-box-line"></i> BBCode (Classic RPG Forums)
            </button>
          </div>
          <button class="btn btn-primary btn-sm" @click="copyTextExport">
            <i class="ri-file-copy-line"></i> Copy {{ textFormat.toUpperCase() }}
          </button>
        </div>

        <textarea
          readonly
          class="text-export-textarea"
          :value="activeTextContent"
          @click="$event.target.select()"
        ></textarea>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useHeroStore } from '../../stores/heroStore.js';
import { useUiStore } from '../../stores/uiStore.js';
import { calculatePowerTotalCost } from '../../rules/powerEngine.js';
import { generateRoll20Macros, buildMarkdownSheet, buildBBCodeSheet } from '../../utils/exporters.js';

const heroStore = useHeroStore();
const uiStore = useUiStore();

const currentTab = ref('preview');
const macroFilter = ref('All');
const textFormat = ref('markdown');

const basicConditions = [
  'Dazed', 'Defenseless', 'Disabled', 'Fatigued',
  'Hindered', 'Immobile', 'Impaired', 'Stunned',
  'Transformed', 'Unaware', 'Vulnerable', 'Weakened'
];

const abilityList = [
  { code: 'STR', name: 'STRENGTH' },
  { code: 'STA', name: 'STAMINA' },
  { code: 'AGL', name: 'AGILITY' },
  { code: 'DEX', name: 'DEXTERITY' },
  { code: 'FGT', name: 'FIGHTING' },
  { code: 'INT', name: 'INTELLECT' },
  { code: 'AWE', name: 'AWARENESS' },
  { code: 'PRE', name: 'PRESENCE' }
];

const defenseList = [
  { code: 'DODGE', name: 'Dodge', abl: 'AGL' },
  { code: 'PARRY', name: 'Parry', abl: 'FGT' },
  { code: 'FORTITUDE', name: 'Fortitude', abl: 'STA' },
  { code: 'TOUGHNESS', name: 'Toughness', abl: 'STA' },
  { code: 'WILL', name: 'Will', abl: 'AWE' }
];

const movementData = computed(() => {
  const list = [];
  for (const p of (heroStore.character.powers || [])) {
    const eff = p.mainEffect || p;
    const name = (eff.baseEffect || eff.name || '').toLowerCase();
    if (name.includes('flight')) list.push({ type: 'Flight', rank: eff.ranks || 1, speed: `${eff.ranks * 30} mph` });
    if (name.includes('speed')) list.push({ type: 'Enhanced Ground', rank: eff.ranks || 1, speed: `${eff.ranks * 30} mph` });
    if (name.includes('teleport')) list.push({ type: 'Teleport', rank: eff.ranks || 1, speed: `Rank ${eff.ranks}` });
  }
  return list;
});

function getSkillAbility(name) {
  const map = {
    'Acrobatics': 'AGL', 'Athletics': 'STR', 'Close Combat': 'FGT', 'Deception': 'PRE',
    'Expertise': 'INT', 'Insight': 'AWE', 'Intimidation': 'PRE', 'Investigation': 'INT',
    'Perception': 'AWE', 'Persuasion': 'PRE', 'Ranged Combat': 'DEX', 'Sleight of Hand': 'DEX',
    'Stealth': 'AGL', 'Technology': 'INT', 'Treatment': 'INT', 'Vehicles': 'DEX'
  };
  return map[name] || 'INT';
}

const macrosList = computed(() => {
  return generateRoll20Macros(heroStore.character, heroStore);
});

const filteredMacros = computed(() => {
  if (macroFilter.value === 'All') return macrosList.value;
  return macrosList.value.filter(m => m.category === macroFilter.value);
});

const activeTextContent = computed(() => {
  if (textFormat.value === 'markdown') {
    return buildMarkdownSheet(heroStore.character, heroStore);
  }
  return buildBBCodeSheet(heroStore.character, heroStore);
});

function handlePrint() {
  window.print();
}

async function copySingleMacro(cmd) {
  try {
    await navigator.clipboard.writeText(cmd);
    uiStore.showToast('Macro copied to clipboard!', 'success');
  } catch (e) {
    uiStore.showToast('Failed to copy macro', 'error');
  }
}

async function copyAllMacros() {
  const text = macrosList.value.map(m => `# --- ${m.title} ---\n${m.command}\n`).join('\n');
  try {
    await navigator.clipboard.writeText(text);
    uiStore.showToast('All macros copied to clipboard!', 'success');
  } catch (e) {
    uiStore.showToast('Failed to copy macros', 'error');
  }
}

async function copyTextExport() {
  try {
    await navigator.clipboard.writeText(activeTextContent.value);
    uiStore.showToast(`${textFormat.value.toUpperCase()} sheet copied to clipboard!`, 'success');
  } catch (e) {
    uiStore.showToast('Failed to copy text', 'error');
  }
}
</script>

<style scoped>
.r20-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10, 10, 15, 0.88);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  overflow-y: auto;
}

.r20-modal-container {
  width: 100%;
  max-width: 1120px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.r20-modal-bar {
  position: sticky;
  top: 0;
  width: 100%;
  background: #1e1b19;
  border: 2px solid var(--r20-yellow);
  border-radius: 8px;
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  z-index: 100;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
}

.r20-modal-title {
  font-family: var(--r20-font-header);
  font-size: 1.4rem;
  letter-spacing: 1px;
  color: var(--r20-yellow);
  display: flex;
  align-items: center;
}

.r20-tab-pills {
  display: flex;
  gap: 0.4rem;
}

.r20-tab-pill {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(240, 189, 23, 0.3);
  color: #fff;
  border-radius: 4px;
  padding: 0.35rem 0.75rem;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  transition: all 0.2s;
}

.r20-tab-pill.active {
  background: var(--r20-yellow);
  color: #2a2522;
  border-color: var(--r20-yellow);
}

.r20-preview-scroll {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
}

.r20-tab-scroll {
  width: 100%;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
}

.macro-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-subtle);
}

.macro-category-row {
  display: flex;
  gap: 0.4rem;
}

.cat-filter-btn {
  background: var(--bg-input);
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  border-radius: var(--radius-xs);
  padding: 0.3rem 0.65rem;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
}

.cat-filter-btn.active {
  background: rgba(59, 130, 246, 0.2);
  border-color: var(--accent-primary);
  color: #93c5fd;
}

.macros-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 0.85rem;
}

.macro-card {
  background: var(--bg-input);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 0.85rem;
}

.macro-title {
  font-weight: 700;
  color: #fff;
  font-size: 0.85rem;
}

.macro-code-box {
  background: #0f172a;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xs);
  padding: 0.6rem;
  font-family: 'Geist Mono', monospace;
  font-size: 0.75rem;
  color: #60a5fa;
  word-break: break-all;
  line-height: 1.4;
}

.text-format-switch {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.text-export-textarea {
  width: 100%;
  height: 500px;
  background: #0f172a;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 1rem;
  color: #e2e8f0;
  font-family: 'Geist Mono', monospace;
  font-size: 0.82rem;
  line-height: 1.5;
  resize: vertical;
}

.text-export-textarea:focus {
  outline: none;
  border-color: var(--accent-primary);
}
</style>
