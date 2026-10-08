<template>
  <div class="green-ronin-sheet-wrapper print-target">
    <!-- ================= PAGE 1: CORE OFFICIAL CHARACTER SHEET ================= -->
    <div class="gr-page gr-page-1">
      <!-- 1. TOP HEADER BANNER -->
      <header class="gr-card gr-header">
        <div class="gr-logo-wrap">
          <img src="/mm-logo-vector.svg" alt="Mutants &amp; Masterminds" class="gr-logo-img" />
        </div>

        <div class="gr-meta-grid">
          <!-- Row 1: Hero & Player -->
          <div class="gr-meta-row">
            <div class="gr-meta-item" style="flex: 1.5;">
              <span class="gr-meta-label">HERO:</span>
              <span class="gr-meta-line">{{ heroStore.character.name || '' }}</span>
            </div>
            <div class="gr-meta-item" style="flex: 1;">
              <span class="gr-meta-label">PLAYER:</span>
              <span class="gr-meta-line">{{ heroStore.character.player || '' }}</span>
            </div>
          </div>

          <!-- Row 2: Identity & Secret/Public -->
          <div class="gr-meta-row">
            <div class="gr-meta-item" style="flex: 2;">
              <span class="gr-meta-label">IDENTITY:</span>
              <span class="gr-meta-line">{{ heroStore.character.identity || '' }}</span>
            </div>
            <div class="gr-radio-group">
              <span class="gr-radio-option" @click="heroStore.character.isSecretIdentity = true">
                <span class="gr-radio-circle" :class="{ active: heroStore.character.isSecretIdentity !== false }"></span>
                <span>SECRET</span>
              </span>
              <span class="gr-radio-option" @click="heroStore.character.isSecretIdentity = false">
                <span class="gr-radio-circle" :class="{ active: heroStore.character.isSecretIdentity === false }"></span>
                <span>PUBLIC</span>
              </span>
            </div>
          </div>

          <!-- Row 3: Physical Traits -->
          <div class="gr-meta-row">
            <div class="gr-meta-item">
              <span class="gr-meta-label">GENDER:</span>
              <span class="gr-meta-line">{{ heroStore.character.gender || '' }}</span>
            </div>
            <div class="gr-meta-item">
              <span class="gr-meta-label">AGE:</span>
              <span class="gr-meta-line">{{ heroStore.character.age || '' }}</span>
            </div>
            <div class="gr-meta-item">
              <span class="gr-meta-label">HEIGHT:</span>
              <span class="gr-meta-line">{{ heroStore.character.height || '' }}</span>
            </div>
            <div class="gr-meta-item">
              <span class="gr-meta-label">WEIGHT:</span>
              <span class="gr-meta-line">{{ heroStore.character.weight || '' }}</span>
            </div>
            <div class="gr-meta-item">
              <span class="gr-meta-label">EYES:</span>
              <span class="gr-meta-line">{{ heroStore.character.eyes || '' }}</span>
            </div>
            <div class="gr-meta-item">
              <span class="gr-meta-label">HAIR:</span>
              <span class="gr-meta-line">{{ heroStore.character.hair || '' }}</span>
            </div>
          </div>

          <!-- Row 4: Affiliation, Base, PL -->
          <div class="gr-meta-row">
            <div class="gr-meta-item" style="flex: 1.5;">
              <span class="gr-meta-label">GROUP AFFILIATION:</span>
              <span class="gr-meta-line">{{ heroStore.character.groupAffiliation || '' }}</span>
            </div>
            <div class="gr-meta-item" style="flex: 1.2;">
              <span class="gr-meta-label">BASE OF OPERATIONS:</span>
              <span class="gr-meta-line">{{ heroStore.character.baseOfOperations || '' }}</span>
            </div>
            <div class="gr-meta-item" style="flex: 0.65;">
              <span class="gr-meta-label">POWER LEVEL:</span>
              <span class="gr-meta-line font-mono" style="font-weight: 900; color: #0f172a;">{{ heroStore.character.powerLevel || 10 }}</span>
            </div>
          </div>

          <!-- Row 5: Power Point Totals Equation -->
          <div class="gr-pp-totals-row">
            <span class="gr-meta-label">POWER POINT TOTALS:</span>
            <span>ABILITIES <span class="gr-hl-num">[{{ heroStore.abilitiesCost }}]</span></span> • 
            <span>POWERS <span class="gr-hl-num">[{{ heroStore.powersCost }}]</span></span> • 
            <span>ADVANTAGES <span class="gr-hl-num">[{{ heroStore.advantagesCost }}]</span></span> • 
            <span>SKILLS <span class="gr-hl-num">[{{ heroStore.skillsCost }}]</span></span> • 
            <span>DEFENSES <span class="gr-hl-num">[{{ heroStore.defensesCost }}]</span></span>
            <span class="gr-pp-total-eq">
              = <span class="gr-hl-num" style="font-size: 11px;">[{{ heroStore.totalSpentPP }}]</span> / {{ heroStore.totalBudgetPP }} PP
            </span>
          </div>
        </div>
      </header>

      <!-- 2. ROW 1: ABILITIES + OFFENSE + DEFENSES -->
      <div class="gr-stats-layout">
        <!-- Left Column: Abilities (top) & Offense (bottom) -->
        <div class="gr-left-combat-col">
          <!-- 8 Abilities Grid (2 rows of 4) -->
          <div class="gr-card gr-abilities-grid">
            <div class="gr-ability-badge">
              <span class="gr-ability-name">STRENGTH</span>
              <span class="gr-ability-score">{{ formatMod(heroStore.effectiveAbilities.STR) }}</span>
            </div>
            <div class="gr-ability-badge">
              <span class="gr-ability-name">AGILITY</span>
              <span class="gr-ability-score">{{ formatMod(heroStore.effectiveAbilities.AGL) }}</span>
            </div>
            <div class="gr-ability-badge">
              <span class="gr-ability-name">FIGHTING</span>
              <span class="gr-ability-score">{{ formatMod(heroStore.effectiveAbilities.FGT) }}</span>
            </div>
            <div class="gr-ability-badge">
              <span class="gr-ability-name">AWARENESS</span>
              <span class="gr-ability-score">{{ formatMod(heroStore.effectiveAbilities.AWE) }}</span>
            </div>
            <div class="gr-ability-badge">
              <span class="gr-ability-name">STAMINA</span>
              <span class="gr-ability-score">{{ formatMod(heroStore.effectiveAbilities.STA) }}</span>
            </div>
            <div class="gr-ability-badge">
              <span class="gr-ability-name">DEXTERITY</span>
              <span class="gr-ability-score">{{ formatMod(heroStore.effectiveAbilities.DEX) }}</span>
            </div>
            <div class="gr-ability-badge">
              <span class="gr-ability-name">INTELLECT</span>
              <span class="gr-ability-score">{{ formatMod(heroStore.effectiveAbilities.INT) }}</span>
            </div>
            <div class="gr-ability-badge">
              <span class="gr-ability-name">PRESENCE</span>
              <span class="gr-ability-score">{{ formatMod(heroStore.effectiveAbilities.PRE) }}</span>
            </div>
          </div>

          <!-- Offense Block (3 Lined Rows matching official sheet) -->
          <div class="gr-card gr-offense-card">
            <div class="gr-offense-header-row">
              <span class="gr-offense-title">OFFENSE</span>
              <div class="gr-initiative-pill">
                <span class="gr-initiative-label">INITIATIVE</span>
                <span class="gr-initiative-box">{{ formatMod(heroStore.initiativeTotal) }}</span>
              </div>
            </div>

            <div class="gr-attack-rows">
              <div v-for="(atk, aIdx) in displayAttacks" :key="atk.id || aIdx" class="gr-attack-row">
                <span class="gr-attack-name" :title="atk.name">{{ atk.name }}</span>
                <span class="gr-attack-bonus-box">{{ atk.rollBonus !== null ? formatMod(atk.rollBonus) : 'Area' }}</span>
                <span class="gr-attack-dc-line">{{ atk.dcDescription || `DC ${atk.dc} vs ${atk.resistance || 'Toughness'}` }}</span>
                <span class="gr-attack-crit">{{ atk.range || 'Close' }} • {{ atk.crit ? `Crit ${atk.crit}` : 'Crit 20' }}</span>
              </div>
              <!-- Empty blank lines to always maintain 3 clean physical rows -->
              <div v-for="i in Math.max(0, 3 - displayAttacks.length)" :key="'atk_blank_' + i" class="gr-attack-row gr-attack-blank">
                <span class="gr-attack-name"></span>
                <span class="gr-attack-bonus-box empty"></span>
                <span class="gr-attack-dc-line"></span>
                <span class="gr-attack-crit"></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Vertical Defense Card -->
        <div class="gr-card gr-defense-card">
          <div class="gr-defense-title-bar">DEFENSE</div>
          <div class="gr-defense-row">
            <div class="gr-defense-label">
              <span class="gr-defense-name">DODGE</span>
              <span class="gr-defense-base">(AGL)</span>
            </div>
            <span class="gr-defense-val">{{ heroStore.defenseTotals.DODGE }}</span>
          </div>
          <div class="gr-defense-row">
            <div class="gr-defense-label">
              <span class="gr-defense-name">PARRY</span>
              <span class="gr-defense-base">(FGT)</span>
            </div>
            <span class="gr-defense-val">{{ heroStore.defenseTotals.PARRY }}</span>
          </div>
          <div class="gr-defense-row">
            <div class="gr-defense-label">
              <span class="gr-defense-name">FORTITUDE</span>
              <span class="gr-defense-base">(STA)</span>
            </div>
            <span class="gr-defense-val">{{ heroStore.defenseTotals.FORTITUDE }}</span>
          </div>
          <div class="gr-defense-row">
            <div class="gr-defense-label">
              <span class="gr-defense-name">TOUGHNESS</span>
              <span class="gr-defense-base">(STA)</span>
            </div>
            <span class="gr-defense-val">{{ heroStore.defenseTotals.TOUGHNESS }}</span>
          </div>
          <div class="gr-defense-row">
            <div class="gr-defense-label">
              <span class="gr-defense-name">WILL</span>
              <span class="gr-defense-base">(AWE)</span>
            </div>
            <span class="gr-defense-val">{{ heroStore.defenseTotals.WILL }}</span>
          </div>
        </div>
      </div>

      <!-- 3. ROW 2: NOTES BAR -->
      <div class="gr-card gr-notes-bar">
        <span class="gr-notes-label">NOTES</span>
        <span class="gr-notes-text">
          {{ heroStore.character.notes ? heroStore.character.notes.slice(0, 160) : (heroStore.character.identity ? `Secret Identity: ${heroStore.character.identity}. ` : '') + 'Standard heroic campaign baseline.' }}
        </span>
      </div>

      <!-- 4. ROW 3: ADVANTAGES & SKILLS -->
      <div class="gr-mid-grid">
        <!-- Left: Advantages (Clean flowing list, matching physical character sheet) -->
        <div class="gr-card gr-advantages-card">
          <span class="gr-card-title">ADVANTAGES</span>
          <div v-if="heroStore.character.advantages?.length" class="gr-advantages-prose">
            <span v-for="(adv, aIdx) in heroStore.character.advantages" :key="adv.id || adv.name">
              <span class="gr-adv-name">{{ adv.name }}</span>
              <strong v-if="(adv.ranks || 1) > 1" class="gr-adv-rank"> {{ adv.ranks }}</strong>{{ aIdx < heroStore.character.advantages.length - 1 ? ', ' : '.' }}
            </span>
          </div>
          <div v-else class="gr-empty-hint">
            No combat advantages purchased.
          </div>
        </div>

        <!-- Right: Skills (2 Tabular Columns with neat dotted leader lines) -->
        <div class="gr-card gr-skills-card">
          <span class="gr-card-title">SKILLS</span>
          <div v-if="trainedSkills.length" class="gr-skills-columns">
            <div v-for="sk in trainedSkills" :key="sk.id" class="gr-skill-row">
              <div class="gr-skill-name-wrap">
                <span class="gr-skill-title">{{ sk.displayName }}</span>
                <span class="gr-skill-stat">({{ sk.abilityCode }})</span>
              </div>
              <span class="gr-skill-leader"></span>
              <span class="gr-skill-score">{{ formatMod(sk.totalBonus) }}</span>
            </div>
          </div>
          <div v-else class="gr-empty-hint">
            No skill ranks purchased.
          </div>
        </div>
      </div>

      <!-- 5. ROW 4: POWERS & DEVICES (Ruled Notebook Lines) -->
      <div class="gr-card gr-powers-card">
        <span class="gr-card-title">POWERS &amp; DEVICES</span>
        <div v-if="primaryPowers.length" class="gr-powers-list">
          <div v-for="p in primaryPowers" :key="p.id" class="gr-power-entry">
            <div class="gr-power-main-line">
              <span class="gr-power-header">{{ p.name }}:</span>
              <span> {{ formatPowerMainLine(p) }}</span>
              <span class="gr-power-cost-badge">{{ calculatePowerTotalCost(p) }} PP</span>
            </div>
            <!-- Sub / Alternate Effects -->
            <div v-for="(sub, sIdx) in getSubEffects(p)" :key="sIdx" class="gr-power-sub-entry">
              • {{ sub }}
            </div>
          </div>
        </div>
        <div v-else class="gr-empty-hint" style="padding-top: 10px;">
          No powers or device containers configured.
        </div>
      </div>

      <!-- 6. ROW 5: GEAR & EQUIPMENT -->
      <div class="gr-card gr-gear-card">
        <span class="gr-card-title">GEAR &amp; EQUIPMENT</span>
        <div v-if="heroStore.character.resources?.length" class="gr-gear-list">
          <span v-for="(item, idx) in heroStore.character.resources.slice(0, 8)" :key="item.id || item.name" class="gr-gear-item">
            <strong>{{ item.name }}</strong><span v-if="item.cost" style="color: #0369a1;"> ({{ item.cost }} EP)</span>{{ idx < Math.min(8, heroStore.character.resources.length) - 1 ? ', ' : '' }}
          </span>
        </div>
        <div v-else class="gr-empty-hint">
          No standard equipment or weapons equipped.
        </div>
      </div>

      <!-- 7. ROW 6: COMPLICATIONS & POWER POINTS / HERO POINTS -->
      <div class="gr-footer-layout">
        <!-- Complications (Left) -->
        <div class="gr-card gr-complications-card">
          <span class="gr-card-title">COMPLICATIONS</span>
          <div v-if="heroStore.character.complications?.length" class="gr-complications-content">
            <div v-for="c in heroStore.character.complications.slice(0, 3)" :key="c.id" class="gr-comp-line">
              <strong>{{ c.name }}:</strong> <span>{{ c.desc || 'Standard heroic complication.' }}</span>
            </div>
          </div>
          <div v-else class="gr-empty-hint">
            Motivation: Justice &amp; Responsibility. Add complications to award extra Hero Points during play.
          </div>
        </div>

        <!-- Power Points & Hero Points (Right) -->
        <div class="gr-points-col">
          <div class="gr-card gr-points-box">
            <span class="gr-points-title">POWER POINTS</span>
            <span class="gr-points-value">{{ heroStore.totalSpentPP }} / {{ heroStore.totalBudgetPP }}</span>
          </div>
          <div class="gr-card gr-points-box">
            <span class="gr-points-title">HERO POINTS</span>
            <span class="gr-points-value">{{ heroStore.character.heroPoints || 1 }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ================= PAGE 2: EXTENDED OVERFLOW SHEET ================= -->
    <div v-if="hasPage2Content" class="gr-page gr-page-2">
      <!-- Page 2 Header -->
      <header class="gr-card gr-page-2-header">
        <div style="display: flex; align-items: center; gap: 10px;">
          <img src="/mm-logo-vector.svg" alt="Mutants &amp; Masterminds" style="height: 30px; object-fit: contain;" />
          <span class="gr-page-2-title">OFFICIAL CHARACTER SHEET — PAGE 2</span>
        </div>
        <div style="font-size: 10.5px; font-weight: 900; color: #0f172a;">
          {{ heroStore.character.name || 'Hero' }} • PL {{ heroStore.character.powerLevel || 10 }}
        </div>
      </header>

      <div class="gr-page-2-content">
        <!-- Overflow Powers -->
        <div class="gr-card gr-overflow-powers">
          <span class="gr-card-title">POWERS &amp; DEVICES (CONTINUED)</span>
          <div v-if="overflowPowers.length" class="gr-powers-list">
            <div v-for="p in overflowPowers" :key="p.id" class="gr-power-entry">
              <div class="gr-power-main-line">
                <span class="gr-power-header">{{ p.name }}:</span>
                <span> {{ formatPowerMainLine(p) }}</span>
                <span class="gr-power-cost-badge">{{ calculatePowerTotalCost(p) }} PP</span>
              </div>
              <div v-for="(sub, sIdx) in getSubEffects(p)" :key="sIdx" class="gr-power-sub-entry">
                • {{ sub }}
              </div>
            </div>
          </div>
          <div v-else class="gr-empty-hint" style="padding-top: 10px;">
            All character powers fit on Page 1.
          </div>
        </div>

        <!-- Overflow Equipment & Vehicles -->
        <div class="gr-card gr-overflow-equipment">
          <span class="gr-card-title">EQUIPMENT, WEAPONS &amp; VEHICLES</span>
          <div v-if="heroStore.character.resources?.length" class="gr-gear-list">
            <span v-for="item in heroStore.character.resources" :key="item.id || item.name" class="gr-gear-pill">
              <strong>{{ item.name }}</strong>
              <span v-if="item.cost" style="color: #0284c7; font-weight: 700;">({{ item.cost }} EP)</span>
              <span v-if="item.desc" style="color: #64748b;">— {{ item.desc }}</span>
            </span>
          </div>
          <div v-else class="gr-empty-hint">
            No equipment or vehicles registered.
          </div>
        </div>

        <!-- Background & Full Complications -->
        <div class="gr-card gr-overflow-bio">
          <span class="gr-card-title">HERO BACKGROUND &amp; COMPLICATIONS DETAIL</span>
          <div style="font-size: 9.5px; line-height: 1.45; color: #334155;">
            <div v-if="heroStore.character.notes" style="margin-bottom: 8px;">
              <strong style="color: #0f172a;">Background Story &amp; Tactics:</strong>
              <p style="margin: 2px 0;">{{ heroStore.character.notes }}</p>
            </div>
            <div v-if="heroStore.character.complications?.length">
              <strong style="color: #0f172a;">All Complications:</strong>
              <div v-for="c in heroStore.character.complications" :key="c.id" style="margin-top: 3px;">
                <strong>• {{ c.name }}:</strong> {{ c.desc || 'No description provided.' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useHeroStore } from '../../stores/heroStore.js';
import { compileTargetedAttacks } from '../../rules/attacks.js';
import { calculatePowerTotalCost } from '../../rules/powerEngine.js';

const heroStore = useHeroStore();

// Format modifier helper (+5, -2, +0)
function formatMod(val) {
  const num = Number(val) || 0;
  return num >= 0 ? `+${num}` : `${num}`;
}

// Skill ability code resolver
function getSkillAbility(skillName) {
  const clean = (skillName || '').toLowerCase().trim();
  if (clean.includes('acrobatics') || clean.includes('stealth')) return 'AGL';
  if (clean.includes('athletics')) return 'STR';
  if (clean.includes('close combat') || clean.includes('fighting')) return 'FGT';
  if (clean.includes('ranged combat') || clean.includes('sleight of hand') || clean.includes('vehicles')) return 'DEX';
  if (clean.includes('deception') || clean.includes('intimidation') || clean.includes('persuasion')) return 'PRE';
  if (clean.includes('insight') || clean.includes('perception')) return 'AWE';
  if (clean.includes('expertise') || clean.includes('investigation') || clean.includes('technology') || clean.includes('treatment')) return 'INT';
  return 'FGT';
}

// Attacks compilation (exactly 3 rows on Page 1)
const compiledAttacks = computed(() => {
  return compileTargetedAttacks(
    heroStore.character,
    heroStore.effectiveAbilities,
    (name) => heroStore.getAdvantageRanks(name)
  );
});

const displayAttacks = computed(() => {
  return (compiledAttacks.value || []).slice(0, 3);
});

// Trained Skills
const trainedSkills = computed(() => {
  const skills = heroStore.character.skills || [];
  return skills
    .filter(sk => (Number(sk.ranks) || 0) > 0 || sk.subtype)
    .map(sk => {
      const abl = getSkillAbility(sk.name);
      const ablMod = heroStore.effectiveAbilities[abl] || 0;
      const total = (Number(sk.ranks) || 0) + ablMod;
      let displayName = sk.name;
      if (sk.subtype) {
        // Clean compact specialty display
        displayName = `${sk.name}: ${sk.subtype}`;
      }
      return {
        id: sk.id || sk.name,
        displayName,
        abilityCode: abl,
        ranks: sk.ranks || 0,
        totalBonus: total
      };
    });
});

// Powers splitting for adaptive 1 vs 2 pages
const allPowers = computed(() => heroStore.character.powers || []);

const primaryPowers = computed(() => {
  if (allPowers.value.length <= 4) {
    return allPowers.value;
  }
  return allPowers.value.slice(0, 3);
});

const overflowPowers = computed(() => {
  if (allPowers.value.length <= 4) return [];
  return allPowers.value.slice(3);
});

const hasPage2Content = computed(() => {
  return (
    allPowers.value.length > 4 ||
    (heroStore.character.resources?.length || 0) > 8 ||
    (heroStore.character.notes?.length || 0) > 160 ||
    (heroStore.character.complications?.length || 0) > 3
  );
});

// Format primary line of power in official Green Ronin statblock format
function formatPowerMainLine(power) {
  if (!power) return '';
  const eff = power.mainEffect || {};
  const base = eff.baseEffect || power.baseEffect || 'Effect';
  const ranks = eff.ranks || power.ranks || 1;
  const descriptors = Array.isArray(power.descriptors) && power.descriptors.length
    ? ` (${power.descriptors.join(', ')})`
    : '';

  const extras = (eff.extras || []).map(e => e.name).join(', ');
  const flaws = (eff.flaws || []).map(f => f.name).join(', ');
  const mods = [extras, flaws].filter(Boolean).join('; ');

  if (power.type === 'device') {
    const devType = power.deviceConfig?.type === 'easily_removable' ? 'Easily Removable Device' : 'Removable Device';
    return `${devType} (${base} ${ranks}${descriptors}${mods ? ' • ' + mods : ''})`;
  }

  let line = `${base} ${ranks}${descriptors}`;
  if (mods) {
    line += ` • ${mods}`;
  }
  return line;
}

// Sub effects (alternate effects, device items, linked effects) without redundant machine prefixes
function getSubEffects(power) {
  const list = [];
  if (!power) return list;

  // Alternate Effects
  if (Array.isArray(power.alternateEffects) && power.alternateEffects.length) {
    power.alternateEffects.forEach(alt => {
      const eff = alt.effect || alt;
      const base = eff.baseEffect || alt.name || 'Alternate Effect';
      const ranks = eff.ranks || alt.ranks || 1;
      list.push(`Alternate Effect: ${alt.name || base}: ${base} ${ranks} • ${alt.cost || 1} PP`);
    });
  }

  // Linked Effects
  if (Array.isArray(power.linkedEffects) && power.linkedEffects.length) {
    power.linkedEffects.forEach(link => {
      const eff = link.effect || link;
      list.push(`Linked: ${link.name || eff.baseEffect}: ${eff.baseEffect || 'Effect'} ${eff.ranks || 1}`);
    });
  }

  // Device Powers (Clean bullet points without "Device Item:")
  if (power.type === 'device' && Array.isArray(power.devicePowers)) {
    power.devicePowers.forEach(sub => {
      const eff = sub.effect || {};
      const base = eff.baseEffect || sub.baseEffect || 'Effect';
      const ranks = eff.ranks || sub.ranks || 1;
      const extras = (eff.extras || []).map(e => e.name).join(', ');
      const desc = extras ? `${base} ${ranks}, ${extras}` : `${base} ${ranks}`;
      list.push(`${sub.name || 'Component'}: ${desc}`);
    });
  }

  return list;
}
</script>
