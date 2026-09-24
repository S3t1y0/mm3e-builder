# Mutants & Masterminds 3e (MM3e) - JSON Data Schema & Specification

> **Audience**: AI Coding Agents, Large Language Models (LLMs), Automation Pipelines, and Developers.  
> **Purpose**: The definitive, authoritative specification for importing, exporting, and generating valid Mutants & Masterminds 3rd Edition (M&M 3e) character, roster, and campaign session data for `mm3e-dm-screen-vue` and `mm3e-builder-vue`.

---

## 1. Document Architecture & Payload Topologies

The Mutants & Masterminds 3e web applications exchange data in four primary payload topologies:

### Type A: Multi-Character Campaign Roster Bundle (Recommended for Team & Encounter Files)
An envelope object containing campaign metadata and an array of character documents, OR a direct JSON array of characters.
* **File convention**: `roster_*.json`, `heroes.json`, `villains.json`, `encounter_*.json`.
* **Root structure**:
  ```json
  {
    "schemaVersion": "1.0",
    "app": "mm3e-dm-screen",
    "exportedAt": "2026-09-22T12:00:00.000Z",
    "campaign": "Emerald City Knights",
    "characters": [
      { /* Character 1 */ },
      { /* Character 2 */ }
    ]
  }
  ```
  *(Note: An array at root `[ { ... }, { ... } ]` or `{ "roster": [...] }` / `{ "combatants": [...] }` is also accepted automatically).*

### Type B: Standalone Character Document
A single character root object representing one hero, villain, boss, or NPC.
* **File convention**: `hero_name_mm3e.json`, `character.json`, or single character exports.
* **Root structure**: The character object itself (starts with `{"id": "...", "name": "...", "powerLevel": 10, ...}`).

### Type C: Full DM Screen Multi-Faction Session Export
A complete DM screen session backup containing separated hero, villain, and NPC rosters, alongside session notes.
* **File convention**: `dm_screen_session_*.json`.
* **Root structure**:
  ```json
  {
    "heroes": [ { /* Hero 1 */ } ],
    "villains": [ { /* Villain 1 */ } ],
    "npcs": [ { /* NPC 1 */ } ],
    "quickNotes": "Campaign session scratchpad notes...",
    "updatedAt": "2026-09-22T12:00:00.000Z"
  }
  ```

### Type D: Cloudflare KV Shortlinks & LZ-String Compressed URL Hashes
* **Cloudflare KV**: URL hash `#s=<shortId>` (e.g. `https://mm3e.app/#s=k9x2ab`). Fetches pure JSON from the Cloudflare Worker API.
* **LZ-String URL hash**: `#share=<compressed>` or `#hero=<compressed>`. Decoded via `LZString.decompressFromEncodedURIComponent()`.

---

## 2. Core Architectural Principles & Golden Laws

Any AI agent or tool generating M&M 3e JSON **MUST** verify and enforce these foundational laws:

### Law 1: Native Power Model & Dynamic Attack Compilation
* All combat actions, weapon profiles, and powers are compiled dynamically by `attacks.js` from native character data.
* **Automatic Discovery**: The rules engine automatically parses and compiles:
  1. Standard powers (`mainEffect` and top-level `linkedEffects`).
  2. Array powers (`mainEffect`, top-level `linkedEffects`, `alternateEffects`, and their nested `alternateEffects[].linkedEffects`).
  3. Device powers (`devicePowers[].effect`, `devicePowers[].linkedEffects`, `devicePowers[].alternateEffects`, and their nested `linkedEffects`).
  4. Compound powers (`compoundEffects[].effect`, `compoundEffects[].linkedEffects`, `compoundEffects[].alternateEffects`, and their nested `linkedEffects`).
  5. Equipped weapons and equipment from `resources` (e.g. Swords, Blaster Pistols, Sniper Rifles).
  6. Basic Unarmed strikes derived from `abilities.STR` and Close Combat skills.
* **Explicit / Custom Attacks**: An explicit `attacks` or `customAttacks` array in the JSON document is fully supported for user-defined macros or custom DM actions, but is **not required** for standard powers to register in combat panels.

### Law 2: Strict Adherence to Power Level (PL) Caps ($2 \times \text{PL}$)
For any character of Power Level **$\text{PL}$**:
1. **Attack Bonus + Effect Rank $\le 2 \times \text{PL}$**:
   $$\text{Attack Bonus} + \text{Effect Rank} \le 2 \times \text{PL}$$
   * *Damage Effect DC*: $\text{DC} = 15 + \text{Damage Rank}$
   * *Affliction / Weaken / Nullify DC*: $\text{DC} = 10 + \text{Effect Rank}$
   * *Example at PL 8 ($2 \times \text{PL} = 16$)*: An attack with $+10$ to hit may have at most Rank $6$ Damage ($\text{DC } 21 \text{ Toughness}$).
   * *Example at PL 10 ($2 \times \text{PL} = 20$)*: An attack with $+12$ to hit may have at most Rank $8$ Affliction ($\text{DC } 18 \text{ Will}$).
2. **Dodge + Toughness $\le 2 \times \text{PL}$**:
   $$\text{Dodge} + \text{Toughness} \le 2 \times \text{PL}$$
3. **Parry + Toughness $\le 2 \times \text{PL}$**:
   $$\text{Parry} + \text{Toughness} \le 2 \times \text{PL}$$
4. **Fortitude + Will $\le 2 \times \text{PL}$**:
   $$\text{Fortitude} + \text{Will} \le 2 \times \text{PL}$$
5. **Skill Total Bonus $\le \text{PL} + 10$**:
   $$\text{Ability Modifier} + \text{Skill Ranks} \le \text{PL} + 10$$
   *(Example: At PL 8, maximum skill bonus is $18$. At PL 10, maximum is $20$.)*

### Law 3: Defense Math Consistency
* $\text{Dodge} = \text{abilities.AGL} + \text{defensesBought.DODGE}$
* $\text{Parry} = \text{abilities.FGT} + \text{defensesBought.PARRY}$
* $\text{Fortitude} = \text{abilities.STA} + \text{defensesBought.FORTITUDE}$
* $\text{Toughness} = \text{abilities.STA} + \text{defensesBought.TOUGHNESS} + \text{Protection Ranks} + \text{Defensive Roll Ranks}$
* $\text{Will} = \text{abilities.AWE} + \text{defensesBought.WILL}$
* Provide **both** `defensesBought` (purchased point investments) and `defenses` (evaluated totals).

### Law 4: Strength-Based Damage Accounting
* When an attack, weapon, or power has the `"Strength-based"` extra (e.g. swords, claws, warhammers, unarmed strikes):
  $$\text{Total Damage Rank} = \text{Base Weapon/Power Rank} + \text{abilities.STR}$$
* You **MUST** ensure:
  $$\text{Attack Bonus} + (\text{Base Weapon Rank} + \text{abilities.STR}) \le 2 \times \text{PL}$$

### Law 5: Area and Perception Attacks Have No Attack Check
* **Area Attacks (Burst, Cone, Line, Shapeable, Cylinder)**:
  * Targets do not get hit by an attack roll; instead, targets make a **Dodge check (DC $10 + \text{Rank}$)** to halve the effect rank.
  * In attacks: Set `"bonus": 0`, `"crit": "-"`, `"targetDefense": "Dodge"`.
  * The effect rank cannot exceed $\text{PL}$.
* **Perception Range Attacks**:
  * Automatically hit without an attack roll.
  * Set `"bonus": 0`, `"crit": "-"`, `"range": "Perception"`.
  * The effect rank cannot exceed $\text{PL}$.

### Law 6: Key Casing and Strict Enumerations
* **Abilities**: Strictly 8 uppercase 3-letter keys: `STR`, `STA`, `AGL`, `DEX`, `FGT`, `INT`, `AWE`, `PRE`.
* **Defenses Bought**: Strictly 5 uppercase keys: `DODGE`, `PARRY`, `FORTITUDE`, `TOUGHNESS`, `WILL`.
* **Defenses Total**: Strictly 5 lowercase keys: `dodge`, `parry`, `fortitude`, `toughness`, `will`.
* **Faction**: Exactly one of `"heroes" | "villains" | "npcs"` (lowercase plural).
* **Role**: Exactly one of `"Hero" | "Boss" | "Lieutenant" | "Minion" | "Ally" | "Specialist" | "Civilian"` (capitalized singular).

### Law 7: DC String Format
Every attack's `dc` property **MUST** be formatted as a readable string indicating both target number and defense:
* Damage: `"DC 25 Toughness"`
* Affliction: `"DC 18 Dodge"` or `"DC 20 Fortitude"` or `"DC 19 Will"`
* Weaken: `"DC 18 Fortitude"`
* Area Dodge Check: `"DC 18 Dodge (Area Check)"`

### Law 8: Device Powers & Sub-Powers Architecture
* A device is a physical power collection with `"type": "device"` (formerly `"container"`; `"container"` is automatically normalized to `"device"` according to official M&M 3e rules), configured with `"deviceConfig": { "type": "removable" | "easily_removable", "toughness": 10 }`.
* Sub-powers are placed in `devicePowers: [...]`.
* If a sub-power activates multiple effects simultaneously (e.g. Damage + Affliction), place simultaneous effects in `sub.linkedEffects: [...]`.
* If a sub-power has alternate firing modes, place them in `sub.alternateEffects: [...]`. Each alternate slot can also have its own `linkedEffects: [...]`.
* During export, `shareService.js` preserves `devicePowers` along with their `linkedEffects`, `alternateEffects`, `activeSlotId`, `active`, and `descriptors`.

### Law 9: Equipment vs. Powers Accounting
* **Equipment**: Purchased via the `Equipment` advantage using Equipment Points (EP), where $1 \text{ PP} = 5 \text{ EP}$. Stored in `resources: [...]`. Equipment cannot exceed $\text{Equipment Ranks} \times 5$ EP.
* **Devices**: Purchased with regular Power Points (PP) as powers with the Removable flaw discount ($-1 \text{ PP}$ per $5 \text{ PP}$ for Removable; $-2 \text{ PP}$ per $5 \text{ PP}$ for Easily Removable). Stored in `powers: [...]`.

### Law 10: Compound Powers & Multi-Effect Suites Architecture (DHH p. 136-137 & p. 147)
* A compound power groups multiple distinct effects or linked combos under a single conceptual power heading:
  * Set `"type": "compound"`.
  * Components are listed in `compoundEffects: [...]`. Each component is an independent effect object with `{ id, name, isPrimaryAction, isLinked, effect, linkedEffects, alternateEffects, active }`.
  * **Primary Action**: Exactly one component should have `"isPrimaryAction": true` (defaulting to the first component if unspecified), serving as the primary carrier action.
  * **Linked Components**: When `"isLinked": true`, the sub-effect acts simultaneously on the primary carrier's check and MUST match the primary effect's Action and Range (per DHH p. 147 rules).
  * **Shared Suite Modifiers**: Suite-wide modifiers that apply to the overall compound power (such as Activation, Noticeable, Quirk, Removable) are stored in `sharedModifiers: [...]`.
  * **Device Discount Integration**: If a compound power represents a physical device (e.g., a mystic talisman or composite battle-suit), provide `"deviceConfig": { "type": "removable" | "easily_removable", "toughness": 10 }` to apply the appropriate flat Removable discount.
  * During import/export, `shareService.js` and `builderAdapter.js` fully preserve `compoundEffects`, `sharedModifiers`, `compoundMode`, `activation`, and `activationCost`.

---

## 3. Quick Power Level (PL) Limits Reference

| Power Level (PL) | Max Attack + Effect Cap ($2 \times \text{PL}$) | Max Defense Sums (Dodge+Tough, Fort+Will) | Max Skill Bonus ($\text{PL} + 10$) | Standard Damage DC Range | Standard Affliction DC Range |
| :---: | :---: | :---: | :---: | :---: | :---: |
| **PL 6** (Street Level / Sidekick) | **12** (e.g. +6 / 6 dmg, +8 / 4 dmg) | **12** | **16** | DC 18 - 21 | DC 13 - 16 |
| **PL 8** (Teen Hero / Vigilante) | **16** (e.g. +8 / 8 dmg, +10 / 6 dmg) | **16** | **18** | DC 20 - 23 | DC 15 - 18 |
| **PL 10** (Standard Superhero / Avenger) | **20** (e.g. +10 / 10 dmg, +12 / 8 dmg) | **20** | **20** | DC 22 - 25 | DC 17 - 20 |
| **PL 12** (Cosmic Hero / Mastermind) | **24** (e.g. +12 / 12 dmg, +14 / 10 dmg) | **24** | **22** | DC 24 - 27 | DC 19 - 22 |
| **PL 14** (World-Ender / Major God) | **28** (e.g. +14 / 14 dmg, +16 / 12 dmg) | **28** | **24** | DC 26 - 29 | DC 21 - 24 |

---

## 4. Complete TypeScript Schema Definitions

```typescript
/**
 * Multi-character Campaign Roster Envelope.
 */
export interface RosterBundleEnvelope {
  schemaVersion: "1.0";
  app: "mm3e-dm-screen" | "mm3e-builder";
  exportedAt: string; // ISO 8601 string, e.g. "2026-09-22T12:00:00.000Z"
  campaign?: string;  // Optional campaign title, e.g. "Emerald City Knights"
  characters: CharacterSchema[];
}

/**
 * Full DM Screen Multi-Faction Session Envelope.
 */
export interface DmScreenSessionEnvelope {
  heroes: CharacterSchema[];
  villains: CharacterSchema[];
  npcs: CharacterSchema[];
  quickNotes?: string;
  updatedAt?: string;
}

/**
 * Full Mutants & Masterminds 3e Character Document.
 */
export interface CharacterSchema {
  // Identity & Meta
  id: string;                      // Unique ID (e.g. "char_spiderman_pl8" or "villain_doc_ock_pl10")
  name: string;                    // Hero/Villain/Character name
  identity?: string;                // Real name or secret alias (e.g. "Peter Parker")
  player?: string;                  // Source or player tag (e.g. "DM Roster", "Player 1")
  isSecretIdentity?: boolean;       // Defaults to true
  baseOfOperations?: string;        // e.g. "Queens, New York"
  powerLevel: number;              // 1 to 20 (Standard: 8 to 12)
  heroPoints?: number;              // Standard: 1 for Heroes, 0 for Villains/NPCs
  faction: "heroes" | "villains" | "npcs";
  role: "Hero" | "Boss" | "Lieutenant" | "Minion" | "Ally" | "Specialist" | "Civilian";

  // Core Numerical Traits
  abilities: AbilitiesBlock;
  defensesBought: DefensesBoughtBlock;
  defenses?: DefensesTotalBlock;    // Total computed defenses

  // Skills & Advantages
  skills: SkillItem[];
  advantages: AdvantageItem[];

  // Powers & Equipment
  powers: PowerItem[];
  resources?: ResourceItem[];       // Equipment, weapons, armor, headquarters, vehicles
  customAttacks?: AttackItem[];     // User-defined / pre-compiled attacks
  attacks?: AttackItem[];           // Compatible with DM Screen tactical attack listings

  // Roleplay, Complications, & Strategy
  complications?: ComplicationItem[];
  tactics?: TacticsBlock | string;
  demeanor?: string;
  gmNotes?: string;
  notes?: string;

  // Runtime Tracking (Optional initial state)
  injuries?: number;                // Cumulative bruise count (-1 Toughness each)
  bruises?: number;                 // Alias for injuries
  activeConditions?: string[];      // e.g. ["Dazed", "Vulnerable"]
  dyingFailures?: number;           // 0 to 3
  isDyingStable?: boolean;          // true if stabilized
}

/**
 * 8 Core Abilities (Exact uppercase 3-letter keys).
 */
export interface AbilitiesBlock {
  STR: number;  // Strength: lifting, close damage, Athletics
  STA: number;  // Stamina: health, Toughness, Fortitude
  AGL: number;  // Agility: Dodge, Acrobatics, Stealth, Initiative
  DEX: number;  // Dexterity: ranged attack checks, Sleight of Hand, Vehicles
  FGT: number;  // Fighting: close attack checks, Parry
  INT: number;  // Intellect: Technology, Investigation, Treatment, Expertise
  AWE: number;  // Awareness: Will defense, Perception, Insight
  PRE: number;  // Presence: Deception, Intimidation, Persuasion
}

/**
 * Explicit Defenses Bought with Power Points.
 */
export interface DefensesBoughtBlock {
  DODGE: number;
  PARRY: number;
  FORTITUDE: number;
  TOUGHNESS: number;
  WILL: number;
}

/**
 * Total Evaluated Defenses.
 */
export interface DefensesTotalBlock {
  dodge: number;     // AGL + DODGE
  parry: number;     // FGT + PARRY
  fortitude: number; // STA + FORTITUDE
  toughness: number; // STA + TOUGHNESS + Protection + Defensive Roll
  will: number;      // AWE + WILL
}

/**
 * Skill Entry.
 */
export interface SkillItem {
  id?: string;
  name: 
    | "Acrobatics" 
    | "Athletics" 
    | "Close Combat" 
    | "Deception" 
    | "Expertise" 
    | "Insight" 
    | "Intimidation" 
    | "Investigation" 
    | "Perception" 
    | "Persuasion" 
    | "Ranged Combat" 
    | "Sleight of Hand" 
    | "Stealth" 
    | "Technology" 
    | "Treatment" 
    | "Vehicles";
  subtype?: string;  // Required for Close Combat, Ranged Combat, Expertise (e.g. "Unarmed", "Science")
  ranks: number;
  total?: number;    // Computed: ability + ranks
}

/**
 * Advantage Entry.
 */
export interface AdvantageItem {
  id?: string;
  name: string;      // e.g. "Power Attack", "Agile Feint", "Improved Initiative", "Defensive Roll"
  ranks?: number;    // Defaults to 1 if omitted
  subtype?: string;  // e.g. "Unarmed" for Improved Critical or "Criminals" for Favored Foe
  category?: "Combat" | "Fortune" | "General" | "Skill";
  desc?: string;
}

/**
 * Power Entry (Standard, Array, Device, Compound).
 */
export interface PowerItem {
  id: string;
  name: string;
  type: "standard" | "array" | "device" | "container" | "compound";
  descriptors?: string[];
  summary?: string;
  cost?: number;
  mainEffect?: EffectItem;
  linkedEffects?: EffectItem[];       // Top-level linked effects (for standard / array powers)
  alternateEffects?: AlternateEffectItem[];
  deviceConfig?: DeviceConfig;        // Present when type is "device" or physical compound suite
  devicePowers?: DeviceSubPowerItem[]; // Array of sub-powers inside the device
  compoundEffects?: CompoundEffectItem[]; // Sub-effects inside a compound power
  sharedModifiers?: SharedModifierItem[]; // Suite-wide modifiers (activation, quirks, flaws)
  compoundMode?: "suite" | "linked";  // Mode of compound power
  active?: boolean;
  activeSlotId?: string;
  activation?: "none" | "move" | "standard";
  activationCost?: number;            // -1 PP for Move, -2 PP for Standard
  notes?: string;
}

/**
 * Component Effect inside a Compound Power.
 */
export interface CompoundEffectItem {
  id: string;
  name: string;
  isPrimaryAction?: boolean;          // Designates the primary carrier check
  isLinked?: boolean;                 // Linked to primary action (matches Action & Range)
  linkGroupId?: string;               // Optional link group identifier
  effect: EffectItem;                 // Primary effect of this component
  mainEffect?: EffectItem;            // Backward-compatible alias for effect
  linkedEffects?: EffectItem[];       // Direct simultaneous linked sub-effects
  alternateEffects?: AlternateEffectItem[]; // Sub-array modes within this component
  active?: boolean;
  activeSlotId?: string;
  descriptors?: string[];
}

/**
 * Shared Modifier applying to a Compound Power Suite.
 */
export interface SharedModifierItem {
  name: string;
  cost: number;                       // Point modifier (e.g. -2 for Standard Activation)
  type?: "flat" | "per_rank";
  customText?: string;
  desc?: string;
}

/**
 * Sub-Power inside a Device.
 */
export interface DeviceSubPowerItem {
  id: string;
  name: string;
  effect: EffectItem;                 // Primary effect of this sub-power
  mainEffect?: EffectItem;             // Backward-compatible alias for effect
  active?: boolean;
  activeSlotId?: string;              // "main" or alternate slot ID
  linkedEffects?: EffectItem[];        // Simultaneous effects linked to this sub-power!
  alternateEffects?: AlternateEffectItem[]; // Sub-array modes within this sub-power
  descriptors?: string[];
}

/**
 * Alternate Effect / Array Slot.
 */
export interface AlternateEffectItem {
  id: string;
  name: string;
  isDynamic?: boolean;                // Dynamic alternate effect (+2 PP instead of +1 PP)
  effect: EffectItem;
  linkedEffects?: EffectItem[];        // Simultaneous effects linked to this alternate slot!
  descriptors?: string[];
}

/**
 * Device Configuration Block.
 */
export interface DeviceConfig {
  type: "none" | "removable" | "easily_removable";
  descriptor?: string;
  toughness?: number;                 // Standard: 10
  flawCost?: number;                  // Removable: -1 PP per 5 PP; Easily Removable: -2 PP per 5 PP
}

/**
 * Individual Effect within a Power.
 */
export interface EffectItem {
  id?: string;
  name?: string;
  baseEffect: 
    | "Damage" 
    | "Affliction" 
    | "Protection" 
    | "Senses" 
    | "Movement" 
    | "Flight" 
    | "Speed" 
    | "Quickness" 
    | "Weaken" 
    | "Nullify" 
    | "Move Object" 
    | "Create" 
    | "Illusion" 
    | "Morph" 
    | "Regeneration" 
    | "Immunity" 
    | "Enhanced Trait" 
    | "Teleport";
  ranks: number;
  baseCost?: number;
  action?: "Standard" | "Move" | "Free" | "Reaction" | "None";
  range?: "Personal" | "Close" | "Ranged" | "Perception";
  duration?: "Instant" | "Sustained" | "Continuous" | "Permanent";
  resistance?: "Toughness" | "Fortitude" | "Will" | "Dodge" | "None";
  desc?: string;
  extras?: ModifierItem[];
  flaws?: ModifierItem[];
  config?: SensesConfig | AfflictionConfig | Record<string, any>; // Effect-specific configs (see Section 7 for details)
}

/**
 * Configuration schema for Senses effect (baseEffect: "Senses").
 */
export interface SensesConfig {
  faculty?: string;                   // Legacy single-string faculty
  selectedFaculties: string[];        // Array of faculty IDs (e.g. ["darkvision", "infravision", "tremorsense"])
}

/**
 * Configuration schema for Affliction effect (baseEffect: "Affliction").
 */
export interface AfflictionConfig {
  resistance?: "Fortitude" | "Will" | "Dodge" | "Parry" | "Toughness";
  preset?: "custom" | "stun" | "sleep" | "mind_control" | "entangle" | "sickness" | "terror";
  // Display and backwards-compatible joined condition strings
  firstDegree?: string;               // e.g. "Dazed" or "Dazed & Vulnerable"
  secondDegree?: string;              // e.g. "Stunned" or "Defenseless & Immobile"
  thirdDegree?: string;               // e.g. "Incapacitated"
  // Multi-condition arrays for Extra Condition extra (max items = 1 + extraConditionRanks)
  firstConditions?: string[];         // e.g. ["Dazed", "Vulnerable"]
  secondConditions?: string[];        // e.g. ["Defenseless", "Immobile"]
  thirdConditions?: string[];         // e.g. ["Incapacitated"]
}

export interface ModifierItem {
  id?: string;
  name: string;
  cost: number;
  type: "per_rank" | "flat";
  ranks?: number;
  desc?: string;
  customText?: string;
  config?: Record<string, any>;
}

/**
 * Tactical Combat Attack Item.
 */
export interface AttackItem {
  id: string;
  name: string;
  bonus: number;                      // Attack roll modifier (0 for Area or Perception)
  action: "Standard" | "Move" | "Free" | "Reaction";
  range: "Close" | "Ranged" | "Personal" | "Perception";
  crit: string;                       // "20" | "19-20" | "18-20" | "-"
  dc: string;                         // "DC 25 Toughness" | "DC 20 Fortitude"
  targetDefense: "Parry" | "Dodge";
  resistance: "Toughness" | "Fortitude" | "Will" | "Dodge";
  effectType: "Damage" | "Affliction" | "Weaken" | "Move Object" | "Nullify" | "Control";
  descriptors?: string[];
  degrees?: AttackDegree[];
}

export interface AttackDegree {
  degree: "1st" | "2nd" | "3rd" | "4th";
  label: string;                      // e.g. "Bruise (-1 Toughness penalty)"
}

export interface ResourceItem {
  id: string;
  name: string;
  category?: "equipment" | "weapon" | "armor" | "vehicle" | "headquarters";
  type?: "Gear" | "Weapon" | "Armor" | "Vehicle" | "Headquarters";
  subtype?: string;
  epCost: number;
  status?: "equipped" | "carried" | "stored";
  weapon?: {
    range: "Close" | "Ranged";
    traits: string[];
    damageRank?: number;
    attackBonus?: number;
  };
  armor?: {
    protectionRank: number;
  };
  vehicle?: Record<string, any>;
  hq?: Record<string, any>;
  desc?: string;
}

export interface ComplicationItem {
  id?: string;
  name: string;
  type: "Motivation" | "Complication";
  category?: string;
  desc: string;
  icon?: string;
}

export interface TacticsBlock {
  opening?: string;
  combos?: string;
  retreat?: string;
  combat?: string;
  roleplay?: string;
}
```

---

## 5. Standard Degrees of Failure Templates

When crafting the `"degrees"` array for an attack, adhere strictly to the official M&M 3e rules:

### Damage Attacks (`resistance: "Toughness"`)
```json
"degrees": [
  { "degree": "1st", "label": "Bruise (-1 Toughness penalty)" },
  { "degree": "2nd", "label": "Dazed + Bruise" },
  { "degree": "3rd", "label": "Staggered + Bruise" },
  { "degree": "4th", "label": "Incapacitated" }
]
```

### Snare / Binding Afflictions (`resistance: "Dodge"` or `"Fortitude"`)
*Degree track: Hindered & Vulnerable $\rightarrow$ Defenseless & Immobilized $\rightarrow$ Incapacitated*
```json
"degrees": [
  { "degree": "1st", "label": "Hindered & Vulnerable" },
  { "degree": "2nd", "label": "Defenseless & Immobilized" },
  { "degree": "3rd", "label": "Incapacitated" }
]
```

### Stun / Shockwave Afflictions (`resistance: "Fortitude"`)
*Degree track: Dazed $\rightarrow$ Stunned $\rightarrow$ Incapacitated*
```json
"degrees": [
  { "degree": "1st", "label": "Dazed & Vulnerable" },
  { "degree": "2nd", "label": "Stunned & Prone" },
  { "degree": "3rd", "label": "Incapacitated" }
]
```

### Mental Control / Telepathic Afflictions (`resistance: "Will"`)
*Degree track: Dazed $\rightarrow$ Compelled $\rightarrow$ Controlled*
```json
"degrees": [
  { "degree": "1st", "label": "Dazed (Enthralled / Hesitant)" },
  { "degree": "2nd", "label": "Compelled (Follows direct orders)" },
  { "degree": "3rd", "label": "Controlled (Complete mental puppet)" }
]
```

> **Dynamic Affliction Support**: For complete condition tables (all 21 conditions across 3 degrees), archetype presets (`stun`, `sleep`, `entangle`, `mind_control`, etc.), and dynamic modifier rules (`Extra Condition`, `Limited Degree`, `Alternate Resistance`), refer to [Section 7.8: Affliction Degrees & Modifiers Architecture](#8-affliction-degrees--modifiers-architecture-configfirstconditions-etc).

---

## 6. Device Architecture & Sub-Powers

A `device` (formerly `"container"` in earlier versions; `"container"` is supported as a backward-compatible alias but `"device"` is canonical according to official M&M 3e rules) groups multiple simultaneous sub-powers that share a single physical item container (such as powered armor, utility belt, mystic staff, or cybernetic implant).

### 1. Structural Requirements
1. **Root Type**: Set `"type": "device"` (legacy `"container"` is automatically normalized to `"device"`).
2. **Device Config**: Specify `"deviceConfig": { "type": "removable" | "easily_removable", "toughness": 10 }`.
3. **Sub-Powers Array (`devicePowers`)**:
   - Each item in `devicePowers` is an independent sub-power (`id`, `name`, `effect`).
   - **Linked Sub-Effects (`linkedEffects`)**: When a sub-power activates multiple effects simultaneously (e.g. an Ion Beam dealing Damage while also inflicting a Stun Affliction), place the simultaneous effects inside the sub-power's `linkedEffects` array.
   - **Alternate Modes (`alternateEffects`)**: If a sub-power has alternative firing modes (an array within the device), place them in `alternateEffects`. Alternate slots can also possess their own `linkedEffects`.

### 2. Golden Schema Pattern
```json
{
  "id": "pow_cyber_battlesuit",
  "name": "MK-V Cyber Battlesuit",
  "type": "device",
  "descriptors": ["Technology", "Armor"],
  "deviceConfig": {
    "type": "removable",
    "descriptor": "Exoskeleton Suit",
    "toughness": 10
  },
  "devicePowers": [
    {
      "id": "sub_suit_armor",
      "name": "Composite Plating",
      "effect": {
        "name": "Armor Plating",
        "baseEffect": "Protection",
        "ranks": 8,
        "action": "None",
        "range": "Personal",
        "duration": "Continuous",
        "extras": [
          { "name": "Impervious", "ranks": 8, "cost": 1, "type": "per_rank" }
        ]
      },
      "linkedEffects": [],
      "alternateEffects": []
    },
    {
      "id": "sub_plasma_cannon",
      "name": "Heavy Plasma Cannon",
      "effect": {
        "name": "Plasma Blast",
        "baseEffect": "Damage",
        "ranks": 10,
        "action": "Standard",
        "range": "Ranged",
        "resistance": "Toughness"
      },
      "linkedEffects": [
        {
          "name": "Thermal Burn",
          "baseEffect": "Affliction",
          "ranks": 10,
          "action": "Standard",
          "range": "Ranged",
          "resistance": "Fortitude",
          "desc": "Impaired / Disabled / Incapacitated"
        }
      ],
      "alternateEffects": [
        {
          "id": "alt_emp_shockwave",
          "name": "EMP Shockwave",
          "isDynamic": false,
          "effect": {
            "name": "Nullify Electronics",
            "baseEffect": "Nullify",
            "ranks": 10,
            "action": "Standard",
            "range": "Close"
          },
          "linkedEffects": [
            {
              "name": "Concussive Shock",
              "baseEffect": "Damage",
              "ranks": 10,
              "action": "Standard",
              "range": "Close"
            }
          ]
        }
      ]
    }
  ]
}
```

---

## 7. Compound Powers Architecture (Multi-Effect Suites & Linked Combos)

A `compound` power groups multiple distinct effects or linked combat actions under a single unified power entry (per *Deluxe Hero's Handbook*, pp. 136-137 and p. 147). This architecture is essential for:
1. **Multi-Effect Combat Strikes (Linked Combos)**: Attacks where hitting once delivers multiple effects simultaneously (e.g., Claws dealing Damage + Poison Affliction + Weaken Stamina).
2. **Thematic Power Suites**: Collections of related abilities that share a common theme, power source, or activation restriction (e.g., Dragon Transformation Suite granting Flight, Dragon Scales, and Fire Breath).

### 1. Structural Requirements
1. **Root Type**: Set `"type": "compound"`.
2. **Compound Mode**: `"compoundMode": "suite" | "linked"`.
3. **Components Array (`compoundEffects`)**:
   - Each item in `compoundEffects` represents a component effect (`id`, `name`, `effect`, `isPrimaryAction`, `isLinked`).
   - **Primary Action (`isPrimaryAction`)**: Set `"isPrimaryAction": true` on the effect that performs the attack roll or main action. If unspecified, the first component (#1) defaults to primary.
   - **Linked Components (`isLinked`)**: Set `"isLinked": true` when this component triggers simultaneously with the primary action. Under M&M 3e rules (DHH p. 147), **all linked components MUST have identical Range and Action** (e.g. if the primary attack is Close Standard, linked Afflictions or Weakens must also be Close Standard).
   - **Nested Linked Effects (`linkedEffects`)**: Components can also contain their own direct linked effects.
   - **Sub-Arrays (`alternateEffects`)**: Individual components within a compound power can have their own alternate firing modes / alternate slots!
4. **Shared Suite Modifiers (`sharedModifiers`)**:
   - Modifiers that apply to the overall compound suite rather than a single component (e.g., Activation Move Action -1 PP, Noticeable -1 PP, Quirk -1 PP).
   - Array of objects: `[ { "name": "Activation", "cost": -2, "type": "flat", "customText": "Standard Action" } ]`.
5. **Activation Accounting**:
   - `"activation": "none" | "move" | "standard"`.
   - `"activationCost": 0 | -1 | -2`.
6. **Device Discount Integration (`deviceConfig`)**:
   - If the compound suite represents a physical item (e.g. Mystic Amulet or Prototype Exosuit), adding `"deviceConfig": { "type": "removable" | "easily_removable", "toughness": 10 }` applies the appropriate Removable discount across the entire suite.

### 2. Golden Schema Pattern: Linked Strike & Venom Combo
```json
{
  "id": "pow_venom_sting",
  "name": "Toxic Stinger Combo",
  "type": "compound",
  "compoundMode": "linked",
  "descriptors": ["Biological", "Piercing", "Toxic"],
  "compoundEffects": [
    {
      "id": "comp_stinger_damage",
      "name": "Stinger Strike",
      "isPrimaryAction": true,
      "isLinked": false,
      "effect": {
        "name": "Damage",
        "baseEffect": "Damage",
        "ranks": 10,
        "action": "Standard",
        "range": "Close",
        "resistance": "Toughness",
        "extras": [
          { "name": "Penetrating", "ranks": 5, "cost": 1, "type": "per_rank" }
        ]
      },
      "linkedEffects": [],
      "alternateEffects": []
    },
    {
      "id": "comp_neurotoxin",
      "name": "Neurotoxin Venom",
      "isPrimaryAction": false,
      "isLinked": true,
      "effect": {
        "name": "Affliction",
        "baseEffect": "Affliction",
        "ranks": 10,
        "action": "Standard",
        "range": "Close",
        "resistance": "Fortitude",
        "desc": "Dazed / Stunned / Paralyzed",
        "extras": [
          { "name": "Cumulative", "cost": 1, "type": "per_rank" }
        ]
      },
      "linkedEffects": [],
      "alternateEffects": []
    }
  ]
}
```

### 3. Golden Schema Pattern: Multi-Component Suite with Shared Activation
```json
{
  "id": "pow_dragon_avatar",
  "name": "Dragon Avatar Transformation",
  "type": "compound",
  "compoundMode": "suite",
  "descriptors": ["Magic", "Draconic", "Fire"],
  "activation": "standard",
  "activationCost": -2,
  "sharedModifiers": [
    {
      "name": "Activation",
      "cost": -2,
      "type": "flat",
      "customText": "Standard Action"
    },
    {
      "name": "Noticeable",
      "cost": -1,
      "type": "flat",
      "customText": "Fiery Aura & Glowing Scales"
    }
  ],
  "compoundEffects": [
    {
      "id": "comp_dragon_wings",
      "name": "Draconic Wings",
      "isPrimaryAction": false,
      "effect": {
        "name": "Flight",
        "baseEffect": "Flight",
        "ranks": 6,
        "action": "Move",
        "range": "Personal",
        "duration": "Sustained"
      }
    },
    {
      "id": "comp_dragon_scales",
      "name": "Dragon Scales",
      "isPrimaryAction": false,
      "effect": {
        "name": "Protection",
        "baseEffect": "Protection",
        "ranks": 8,
        "action": "None",
        "range": "Personal",
        "duration": "Continuous",
        "extras": [
          { "name": "Impervious", "ranks": 8, "cost": 1, "type": "per_rank" }
        ]
      }
    },
    {
      "id": "comp_fire_breath",
      "name": "Fire Breath Cannon",
      "isPrimaryAction": true,
      "effect": {
        "name": "Fire Breath",
        "baseEffect": "Damage",
        "ranks": 10,
        "action": "Standard",
        "range": "Close",
        "duration": "Instant",
        "resistance": "Toughness",
        "extras": [
          { "name": "Area", "desc": "Cone 60ft", "cost": 1, "type": "per_rank" }
        ]
      }
    }
  ]
}
```

---

## 8. Configurable Effect Catalogs & Sub-Systems

The MM3e rules engine provides deep, structured sub-system configurations for complex powers (Senses, Immunity, Movement, Comprehend, Environment, and Affliction). All effect-specific parameters reside under `effect.config`.

### 1. Engine & Schema Mechanics (Senses)
* **Property Path**: `effect.config.selectedFaculties` (array of faculty ID strings, names, or faculty objects).
* **Base Cost**: In M&M 3e, the base cost of `Senses` is **1 PP per rank** (`baseCost: 1`).
* **Ranks Computation**: The engine (`powerEngine.js`) automatically computes the effect's `ranks` as the **sum of point costs (`pts`)** of all chosen faculties:
  $$\text{ranks} = \sum_{f \in \text{selectedFaculties}} f.\text{pts}$$
  $$\text{Total Cost (PP)} = \text{ranks} \times \text{costPerRank} \text{ (modifiers applied)}$$
  *(Example: Selecting `darkvision` (2 pts) + `infravision` (1 pt) produces `ranks: 3`, costing 3 PP).*
* **Accepted Item Formats**:
  1. **Faculty ID strings (Recommended)**: `["darkvision", "infravision", "tremorsense"]`
  2. **Faculty Name strings**: `["Darkvision", "Infravision", "Tremorsense"]`
  3. **Faculty Objects**: `[ { "id": "darkvision", "name": "Darkvision", "pts": 2 } ]`
* **Backward Compatibility**: Single legacy strings in `effect.config.faculty: "darkvision"` are automatically migrated into `effect.config.selectedFaculties: ["darkvision"]` during normalization.
* **UI Presentation**:
  - **Senses Card (`SensesCard.vue`)**: Detects any active power with `baseEffect: "Senses"` and renders each faculty as an interactive sensory badge with its respective icon in the DM screen and character sheet sensory widget (`specialSenses`).
  - **Powers Deck (`PowersDeck.vue`)**: Displays a horizontal ribbon badge list for each faculty on the power card.
  - **Effect Configurator (`EffectConfigurator.vue`)**: Provides a visual multi-select library categorized by sensory types with instant point cost tallying.

---

### 2. Complete Reference Catalog (All 28 SelectedFaculties)

| ID (`id`) | Faculty Name (`name`) | Category (`category`) | Cost (`pts`) | Remix Icon (`icon`) | Official M&M 3e Rules Description & Tactical Utility |
| :--- | :--- | :---: | :---: | :--- | :--- |
| **Visual Category** (`visual`) | | | | | |
| `darkvision` | **Darkvision** | `visual` | **2** | `ri-eye-line` | See in total darkness as if normal daylight without requiring any light source. Completely negates total concealment from non-magical darkness. |
| `low_light` | **Low-Light Vision** | `visual` | **1** | `ri-contrast-line` | Ignore all visual penalties and miss chances imposed by dim lighting conditions, shadows, or twilight. |
| `infravision` | **Infravision** | `visual` | **1** | `ri-fire-line` | Perceive thermal infrared radiation patterns, heat signatures, and warm bodies. Can track warm footprints and detect living targets through pitch darkness. |
| `ultravision` | **Ultravision** | `visual` | **1** | `ri-sun-line` | Perceive ultraviolet frequencies, energy trails, radioactive leaks, and subtle fluorescent security markings invisible to normal eyes. |
| `microscopic` | **Microscopic Vision (Dust)** | `visual` | **1** | `ri-zoom-in-line` | Inspect microscopic details down to dust-particle scale (size rank -8) clearly without magnification equipment. |
| `microscopic_2` | **Microscopic Vision (Cellular)** | `visual` | **2** | `ri-microscope-line` | Inspect individual biological cells, bacteria, microscopic viruses, and DNA/molecular structures (size rank -12). |
| `penetrates_concealment_vis` | **Penetrates Concealment (Visual)** | `visual` | **4** | `ri-scan-line` | **X-Ray Vision**: Visually perceive through solid barriers (brick walls, steel doors, dense smoke, lead). Negates physical concealment. |
| `counters_concealment_vis` | **Counters Concealment (Visual)** | `visual` | **2** | `ri-eye-fill` | Ignore all visual concealment: see completely through invisibility, optical camouflage, smoke screens, and dense fog. |
| `counters_illusion_vis` | **Counters Illusion (Visual)** | `visual` | **2** | `ri-shield-check-line` | Automatically discern and see straight through all optical and holographic illusions without requiring an Insight check. |
| **Auditory Category** (`auditory`) | | | | | |
| `ultra_hearing` | **Ultra-Hearing** | `auditory` | **1** | `ri-volume-up-line` | Hear very high ultrasonic (dog whistles, sonar pings) and extremely low infrasonic frequencies far beyond normal human range. |
| `auditory_radar` | **Auditory Radar (Echolocation)** | `auditory` | **2** | `ri-broadcast-line` | **Accurate Auditory Sense**: Precise sonic reflection mapping physical surroundings via sound waves bouncing off surfaces (e.g. bat or dolphin echolocation). |
| `counters_concealment_aud` | **Counters Concealment (Auditory)** | `auditory` | **2** | `ri-sound-module-line` | Hear clearly through silence spells/fields, intense white noise, sonic dampeners, and deafening environments. |
| **Mental & Exotic Category** (`mental`) | | | | | |
| `danger_sense` | **Danger Sense** | `mental` | **1** | `ri-alarm-warning-line` | Uncanny early warning of impending danger. Make an immediate Perception check (DC 10) to avoid being surprised in ambush situations. |
| `radio` | **Radio** | `mental` | **1** | `ri-radio-line` | Sense and receive radio waves, cellular networks, WiFi signals, police bands, and wireless data broadcasts directly in mind/systems. |
| `radar` | **Radar** | `mental` | **3** | `ri-radar-line` | **Accurate, Radius, Radio Sense**: 360-degree high-frequency radio echolocation perceiving physical shapes, velocity, and distance in complete darkness. |
| `mental_awareness` | **Mental Awareness** | `mental` | **1** | `ri-brain-line` | Detect the presence, location, psychic emanations, and mental power usage of sentient minds within sensory range. |
| `magic_awareness` | **Mystical Awareness** | `mental` | **1** | `ri-sparkling-line` | Sense the presence of magic, eldritch auras, active enchantments, mystical conduits, and supernatural entities. |
| `postcognition` | **Postcognition** | `mental` | **4** | `ri-history-line` | Perceive past events that transpired at your current location via psychometric or temporal retrocognition visions. |
| `precognition` | **Precognition** | `mental` | **4** | `ri-compass-3-line` | Receive glimpses, premonitions, and prophetic visions of future events and impending threats. |
| **Tactile & Olfactory Category** (`tactile`) | | | | | |
| `acute_scent` | **Acute Scent** | `tactile` | **1** | `ri-drop-line` | Distinguish subtle and identical scent profiles; uniquely identify individuals, poisons, or materials by smell alone. |
| `tracking` | **Tracking** | `tactile` | **1** | `ri-footprint-line` | Track targets by following scent trails, thermal footprints, or psychic traces at full movement speed with Perception checks. |
| `tremorsense` | **Tremorsense** | `tactile` | **2** | `ri-pulse-line` | Detect seismic vibrations and underground movements traveling through the ground or physical surfaces in contact with the character. |
| `analytical_taste` | **Analytical Taste** | `tactile` | **1** | `ri-test-tube-line` | Instantly identify exact chemical compounds, trace toxins, drugs, and elemental ingredients upon tasting a minute sample. |
| **Spatial & Utility Category** (`spatial`) | | | | | |
| `direction_sense` | **Direction Sense** | `spatial` | **1** | `ri-compass-line` | Internal 3D gyro-compass: always intuitively know true north, geographic orientation, elevation, and heading underground or in space. |
| `distance_sense` | **Distance Sense** | `spatial` | **1** | `ri-ruler-line` | Internal laser rangefinder: judge precise distances, ranges, altitudes, and object dimensions instantly with microscopic accuracy. |
| `time_sense` | **Time Sense** | `spatial` | **1** | `ri-time-line` | Internal atomic clock: always know the exact elapsed time, local time, and duration down to fractions of a second. |
| `extended_sense` | **Extended Sense** | `spatial` | **1** | `ri-fullscreen-line` | Multiplies the distance range increment of a sense by 10 (reducing the -1 per 10 feet distance penalty to -1 per 100 feet per rank). |
| `radius` | **Radius (360 Degree Sense)** | `spatial` | **1** | `ri-circle-line` | Perceive all directions (360 degrees) simultaneously around the character without turning or having blind spots. |

---

### 3. Canonical JSON Config Examples

#### Example A: Superhuman Sensory Package (Standalone Power)
```json
{
  "id": "pow_super_senses",
  "name": "Superhuman Senses",
  "type": "standard",
  "descriptors": ["Mutation", "Sensory"],
  "mainEffect": {
    "id": "eff_senses_mutant",
    "name": "Apex Sensory Suite",
    "baseEffect": "Senses",
    "ranks": 5,
    "action": "None",
    "range": "Personal",
    "duration": "Continuous",
    "baseCost": 1,
    "config": {
      "selectedFaculties": [
        "darkvision",
        "ultra_hearing",
        "acute_scent",
        "tracking"
      ]
    }
  }
}
```
*Note on Ranks Math*: `darkvision` (2) + `ultra_hearing` (1) + `acute_scent` (1) + `tracking` (1) = **5 Ranks** (Cost: 5 PP).

#### Example B: High-Tech Cybernetic Sensory Helmet (Inside a Device Container)
```json
{
  "id": "pow_cyber_helmet",
  "name": "Tactical Recon Visor",
  "type": "device",
  "descriptors": ["Technology", "Cyberware"],
  "deviceConfig": {
    "type": "removable",
    "descriptor": "Sensor Visor",
    "toughness": 8
  },
  "devicePowers": [
    {
      "id": "sub_tactical_optics",
      "name": "Tactical Sensor Array",
      "effect": {
        "id": "eff_hud_senses",
        "name": "Multispectral Scanners",
        "baseEffect": "Senses",
        "ranks": 6,
        "action": "None",
        "range": "Personal",
        "duration": "Continuous",
        "baseCost": 1,
        "config": {
          "selectedFaculties": [
            "infravision",
            "radio",
            "distance_sense",
            "direction_sense",
            "time_sense",
            "danger_sense"
          ]
        }
      },
      "linkedEffects": [],
      "alternateEffects": []
    }
  ]
}
```
*Note on Ranks Math*: `infravision` (1) + `radio` (1) + `distance_sense` (1) + `direction_sense` (1) + `time_sense` (1) + `danger_sense` (1) = **6 Ranks** (Cost: 6 PP before device removable discount).

---

### 4. Immunity Scope Catalog (`config.selectedPresets`)

The `Immunity` effect protects against specific hazards, environments, damage types, or defense checks. Configured under `effect.config.selectedPresets`.

* **Property Path**: `effect.config.selectedPresets: string[]`
* **Ranks Computation**: $\text{ranks} = \sum_{p \in \text{selectedPresets}} p.\text{ranks}$
* **Accepted Formats**: Array of preset IDs (e.g. `["life_support"]` or `["fire", "radiation"]`).

| ID (`id`) | Preset Name (`name`) | Category | Cost (`ranks`) | Description & Scope |
| :--- | :--- | :---: | :---: | :--- |
| `aging` | Aging | `survival` | **1** | Immune to aging effects and natural death by old age. |
| `disease` | Disease | `survival` | **1** | Immune to all biological infections, viruses, and diseases. |
| `poison` | Poison | `survival` | **1** | Immune to natural, chemical, and synthetic toxins and venoms. |
| `sleep` | Need for Sleep | `survival` | **1** | Never need sleep or suffer from exhaustion/sleep deprivation. |
| `starvation` | Starvation & Thirst | `survival` | **1** | Do not need food, nourishment, or water to survive. |
| `suffocation_partial` | Suffocation (Hold Breath) | `survival` | **1** | Can hold breath indefinitely without suffocating. |
| `suffocation_all` | Suffocation (No Breathing) | `survival` | **2** | Completely do not breathe air or gas; vacuum & gas proof. |
| `env_cold` | Environmental Cold | `survival` | **1** | Unaffected by freezing atmospheric cold temperatures. |
| `env_heat` | Environmental Heat | `survival` | **1** | Unaffected by intense desert or atmospheric heat. |
| `radiation` | Radiation | `survival` | **1** | Immune to ambient, solar, and nuclear environmental radiation. |
| `vacuum` | Vacuum | `survival` | **1** | Unaffected by decompression and zero-pressure vacuum of space. |
| `critical` | Critical Hits | `survival` | **2** | Opponents cannot score critical hits against you. |
| `alteration` | Alteration Effects | `biological` | **5** | Immune to shape-changing, petrification, and transmutation attacks. |
| `entrapment` | Entrapment | `biological` | **5** | Immune to snares, tangles, nets, and physical binds. |
| `fatigue` | Fatigue Effects | `biological` | **5** | Immune to powers that inflict fatigued or exhausted conditions. |
| `sensory` | Sensory Afflictions | `biological` | **5** | Immune to dazzle, blinding flash, and sensory overloading attacks. |
| `interaction` | Interaction Skills | `biological` | **5** | Immune to Deception, Intimidation, and Persuasion checks. |
| `life_support` | **Life Support** | `descriptors` | **10** | Complete survival suite: disease, poison, environmental cold/heat/radiation/vacuum, suffocation, and starvation. |
| `fire` | Fire / Heat | `descriptors` | **10** | Immune to all fire, heat, plasma, and thermal damage effects. |
| `cold` | Cold / Ice | `descriptors` | **10** | Immune to all cold, frost, freezing, and cryo damage effects. |
| `electricity` | Electricity | `descriptors` | **10** | Immune to all lightning, shock, voltage, and electrical damage. |
| `magic` | Magic | `descriptors` | **10** | Immune to all mystical, arcane, eldritch, and spell effects. |
| `mental` | Mental Effects | `descriptors` | **10** | Immune to all psychic, psionic, and telepathic powers. |
| `energy` | All Energy | `descriptors` | **20** | Immune to all energy-based damage (fire, electricity, lasers, radiation, plasma). |
| `physical` | All Physical | `descriptors` | **20** | Immune to all kinetic, bludgeoning, piercing, and slashing physical attacks. |
| `fortitude` | All Fortitude Effects | `defenses` | **30** | Immune to any effect requiring a Fortitude resistance check. |
| `will` | All Will Effects | `defenses` | **30** | Immune to any effect requiring a Will resistance check. |
| `lethal` | All Lethal Damage | `defenses` | **30** | Cannot suffer lethal harm or deadly injury. |

---

### 5. Movement Modes Catalog (`config.selectedModes`)

The `Movement` effect grants superhuman locomotion. Configured under `effect.config.selectedModes`.

* **Property Path**: `effect.config.selectedModes: (string | { id: string, ranks: number })[]`
* **Ranks Computation**: $\text{ranks} = \sum_{m \in \text{selectedModes}} m.\text{ranks}$

| ID (`id`) | Mode Name (`name`) | Max Ranks | Description |
| :--- | :--- | :---: | :--- |
| `wall_crawling` | Wall-crawling | 2 | Climb walls and ceilings (Rank 1: -1 speed rank, Rank 2: full speed). |
| `safe_fall` | Safe Fall | 1 | Fall any distance without suffering damage or injury. |
| `water_walking` | Water Walking | 1 | Walk or run across liquid surfaces without sinking. |
| `dimension_travel` | Dimension Travel | 3 | Travel across dimensions (Rank 1: single, 2: related group, 3: any dimension). |
| `env_adaptation` | Environmental Adaptation | 1 | Move without penalty in hostile environment (Aquatic, Zero-G, Extreme Cold). |
| `permeate` | Permeate | 3 | Pass through solid obstacles (Rank 1: speed -2, 2: speed -1, 3: full speed). |
| `slithering` | Slithering | 1 | Move full speed while prone and squeeze through tight openings. |
| `space_travel` | Space Travel | 3 | Fly through vacuum of space (Rank 1: solar system, 2: star systems, 3: galaxies). |
| `swinging` | Swinging | 1 | Swing through city or forest obstacles at normal movement speed. |
| `trackless` | Trackless | 2 | Leave no visual trail (Rank 1) or no sensory trail of any kind (Rank 2). |

---

### 6. Comprehend Modes Catalog (`config.selectedModes`)

The `Comprehend` effect allows understanding languages, creatures, or objects. Configured under `effect.config.selectedModes`.

* **Property Path**: `effect.config.selectedModes: string[]`
* **Ranks Computation**: $\text{ranks} = \sum_{m \in \text{selectedModes}} m.\text{ranks}$

| ID (`id`) | Mode Name (`name`) | Cost (`ranks`) | Description |
| :--- | :--- | :---: | :--- |
| `languages_understand` | Languages: Understand Spoken | **1** | Understand all spoken languages spoken to you. |
| `languages_speak` | Languages: Speak Any One | **1** | Speak any language, one language at a time. |
| `languages_read` | Languages: Read All | **1** | Understand and read any written language or script. |
| `languages_understood` | Languages: Understood by All | **1** | Anyone who can hear you understands your speech. |
| `animals_understand` | Animals: Understand | **1** | Understand communications and sounds of all animals. |
| `animals_speak` | Animals: Speak | **1** | Speak to and converse bidirectionally with animals. |
| `plants` | Plants: Speak & Understand | **1** | Communicate bidirectionally with plant life and flora. |
| `machines` | Machines: Speak & Understand | **2** | Communicate fluently with electronics, computers, and AI. |
| `spirits` | Spirits: Speak & Understand | **2** | Communicate with spirits, ghosts, and astral souls. |
| `objects` | Objects: Read Impressions | **2** | Read psychometric impressions left on physical items. |

---

### 7. Environment Elements Catalog (`config.selectedElements`)

The `Environment` effect creates area environmental hazards. Configured under `effect.config.selectedElements`.

* **Property Path**: `effect.config.selectedElements: string[]`
* **Cost Computation**: Base cost per rank equals the sum of chosen element costs: $\text{baseCost} = \sum_{e \in \text{selectedElements}} e.\text{cost}$.

| ID (`id`) | Element Name (`name`) | Cost / Rank (`cost`) | Description & Hazard Check |
| :--- | :--- | :---: | :--- |
| `cold_1` | Intense Cold | **1 PP** | Extreme low temperature exposure hazard checks. |
| `cold_2` | Extreme Cold | **2 PP** | Severe freezing and frostbite hazard checks. |
| `heat_1` | Intense Heat | **1 PP** | Extreme high temperature exposure hazard checks. |
| `heat_2` | Extreme Heat | **2 PP** | Severe heatstroke and heat exhaustion hazard checks. |
| `impede_1` | Impede Movement (-1) | **1 PP** | Reduces ground movement speed rank by 1 in area. |
| `impede_2` | Impede Movement (-2) | **2 PP** | Reduces ground movement speed rank by 2 in area. |
| `light_1` | Bright Light | **1 PP** | Daylight level illumination dispelling shadow. |
| `light_2` | Blinding Light | **2 PP** | Blinding glare imposing -5 penalty to visual Perception. |
| `vis_1` | Visibility (-2) | **1 PP** | Fog or smoke imposing -2 penalty to visual Perception. |
| `vis_2` | Total Concealment | **2 PP** | Impenetrable obscurement providing Total Concealment. |

---

### 8. Affliction Degrees & Modifiers Architecture (`config.firstConditions`, etc.)

The `Affliction` effect imposes debilitating conditions upon a target across up to three degrees of failure. In the MM3e rules engine, Affliction is dynamic: condition sets change and re-evaluate based on applied extras (`Extra Condition`), flaws (`Limited Degree`), and defenses (`Alternate Resistance`).

#### 1. Engine & Schema Mechanics

* **Base Cost**: **1 PP per rank** (`baseCost: 1`). Action: `Standard`, Range: `Close`, Duration: `Instant`.
* **Standard Resistance DC**: $\text{DC} = 10 + \text{Effect Rank}$ (e.g. Rank 8 Affliction requires DC 18 resistance check).
* **Dual Property Synchronization**: The engine (`powerEngine.js`) maintains automatic bidirectional synchronization between condition arrays (`firstConditions`) and display strings (`firstDegree`):
  - When editing arrays (`firstConditions: ["Dazed", "Vulnerable"]`), the engine automatically joins them into formatted display strings (`firstDegree: "Dazed & Vulnerable"`).
  - When importing legacy data with joined strings, the engine automatically splits and normalizes them into condition arrays.
  - The root `effect.resistance` is always kept in sync with `effect.config.resistance`.

```typescript
export interface AfflictionConfig {
  resistance?: "Fortitude" | "Will" | "Dodge" | "Parry" | "Toughness";
  preset?: "custom" | "stun" | "sleep" | "mind_control" | "entangle" | "sickness" | "terror";
  // Display & legacy strings (joined with " & ")
  firstDegree?: string;               // e.g. "Dazed & Vulnerable"
  secondDegree?: string;              // e.g. "Defenseless & Immobile"
  thirdDegree?: string;               // e.g. "Incapacitated"
  // Multi-condition arrays (up to 1 + Extra Condition ranks)
  firstConditions?: string[];         // e.g. ["Dazed", "Vulnerable"]
  secondConditions?: string[];        // e.g. ["Defenseless", "Immobile"]
  thirdConditions?: string[];         // e.g. ["Incapacitated"]
}
```

#### 2. Complete Conditions Catalog by Degree (All 21 Conditions)

According to official M&M 3e rules, conditions are organized into three distinct tiers:

##### First Degree Conditions (Minor Impediment)
| Condition (`name`) | Category | Mechanical Rules & Tactical Effects |
| :--- | :---: | :--- |
| **Dazed** | Standard | Target is limited to a free action and a single standard or move action per turn. |
| **Fatigued** | Environmental / Drain | Target is hindered (-1 speed rank) and cannot take sprint actions. Recovers after 1 hour of rest. |
| **Hindered** | Movement | Target movement speed rank is reduced by 1 (half ground and special movement speed). |
| **Impaired** | Competence | Target suffers a -2 circumstance penalty to all checks and attack rolls. |
| **Vulnerable** | Defense | Target active defenses (Dodge and Parry) are halved (rounded up). Vulnerable targets cannot defend effectively. |
| **Entranced** | Mental / Sensory | Target is fascinated and can take no actions other than paying attention to the enthralling effect. Danger or attack breaks this immediately. |

##### Second Degree Conditions (Major Impairment)
| Condition (`name`) | Category | Mechanical Rules & Tactical Effects |
| :--- | :---: | :--- |
| **Compelled** | Mental | Target is forced to obey commands from the attacker in place of normal actions. Target can fight back with a contested check. |
| **Defenseless** | Defense | Active defenses (Dodge and Parry) become 0. Attackers gain +5 circumstance bonus or can make routine attacks; susceptible to critical hits. |
| **Disabled** | Competence | Target suffers a -5 circumstance penalty to all checks, attack rolls, and saving throws. |
| **Exhausted** | Environmental / Drain | Target is hindered, impaired, and vulnerable, moving at speed rank -2. Recovers to fatigued after 1 hour of rest. |
| **Immobile** | Movement | Target has speed rank -5 and cannot move from their spot, though they can still take actions not requiring movement. |
| **Prone** | Position | Target is lying flat; -5 circumstance penalty on close attacks, opponents get +5 close attack bonus, but opponents suffer -5 on ranged attacks. |
| **Stunned** | Incapacitation | Target cannot take any actions (free, move, or standard) and is defenseless. |

##### Third Degree Conditions (Total Incapacitation or Removal)
| Condition (`name`) | Category | Mechanical Rules & Tactical Effects |
| :--- | :---: | :--- |
| **Asleep** | Consciousness | Target is helpless, unconscious, defenseless, and unaware. Awakened only by damage, loud noises, or being shaken. |
| **Blind** | Sensory | Target cannot see; visually unaware, vulnerable, -5 penalty on sight-dependent checks, and movement speed halved. |
| **Controlled** | Mental | Target is completely taken over mentally or physically by the attacker, taking whatever actions the attacker dictates without resisting. |
| **Deaf** | Sensory | Target cannot hear; auditory unaware, automatically fails auditory checks, and suffers a -2 penalty to initiative. |
| **Incapacitated** | Defeat | Target is defenseless, stunned, and unaware. Target is unconscious, knocked out, or helpless, and completely out of combat. |
| **Paralyzed** | Physical Lock | Target is frozen in place; physically defenseless, immobile, and incapacitated, although mental faculties remain functional. |
| **Transformed** | Shape / Trait | Target traits, bodily form, or mindset are completely replaced or altered by the attacker according to the power descriptor. |
| **Unaware** | Sensory | Target is completely oblivious to sensory inputs, automatically failing all Perception checks for affected senses. |

---

#### 3. Quick Presets Reference Table

The system provides 6 canonical M&M 3e archetype presets that automatically configure degrees, resistance defenses, and required extras:

| Preset Key (`preset`) | Name | Resistance | 1st Degree | 2nd Degree | 3rd Degree | Built-in Extras / Flaws | Cost / Rank |
| :--- | :--- | :---: | :--- | :--- | :--- | :--- | :---: |
| `stun` | Stun Attack | `Fortitude` | Dazed | Stunned | Incapacitated | None | **1 PP** |
| `sleep` | Sleep / Sedative | `Fortitude` | Fatigued | Exhausted | Asleep | None | **1 PP** |
| `mind_control` | Mind Control | `Will` | Dazed | Compelled | Controlled | None | **1 PP** |
| `entangle` | Entangle / Snare | `Dodge` | Hindered & Vulnerable | Defenseless & Immobile | Incapacitated | Extra Condition 1, Alternate Resistance (Dodge) | **2 PP** |
| `sickness` | Nausea / Illness | `Fortitude` | Impaired | Disabled | Incapacitated | None | **1 PP** |
| `terror` | Terrify / Phobia | `Will` | Dazed | Compelled | Incapacitated | None | **1 PP** |

---

#### 4. Modifier Transformations & Dynamic Architecture

Affliction dynamically reacts to modifiers configured in `effect.extras` and `effect.flaws`:

##### A. Extra Condition (`hasRanks: true, maxRanks: 2`)
* **Mechanical Effect**: The target suffers multiple simultaneous conditions at each degree of failure.
  - **Rank 1 (+1 PP / rank)**: Imposes **2 conditions** per degree (e.g. `["Hindered", "Vulnerable"]` at 1st degree).
  - **Rank 2 (+2 PP / rank)**: Imposes **3 conditions** per degree.
* **Schema Effect**:
  - `config.firstConditions.length <= 1 + extraConditionRanks`
  - `config.secondConditions.length <= 1 + extraConditionRanks`
  - `config.thirdConditions.length <= 1 + extraConditionRanks`
  - When Extra Condition is removed or reduced, excessive conditions in arrays are trimmed safely.

##### B. Limited Degree (`hasRanks: true, maxRanks: 2`)
* **Mechanical Effect**: Caps the maximum degree of failure an Affliction can inflict upon a target.
  - **Rank 1 (-1 PP / rank)**: Target cannot suffer 3rd degree conditions. The 3rd degree is locked and cannot be reached.
  - **Rank 2 (-2 PP / rank)**: Target cannot suffer 2nd or 3rd degree conditions. The power inflicts only 1st degree conditions.
* **Schema Effect & Combat Compilation**:
  - In `attacks.js`, degrees above `3 - limitedDegreeRanks` are omitted from the attack roll's combat card `degrees` array.
  - In the UI, locked degrees display an explicit lock indicator and are excluded from resistance degree counters.

##### C. Alternate Resistance (`flat: +0` or `per_rank: +1`)
* **Mechanical Effect**: Shifts the initial resistance check from standard Fortitude or Will to Dodge, Parry, or Toughness.
* **Schema Effect**:
  - `config.resistance` updates to chosen defense.
  - Root `effect.resistance` updates to match.
  - Canonical defense colors are rendered according to `DESIGN.md`:
    - Fortitude: `#10b981` (Emerald)
    - Will: `#c084fc` (Purple)
    - Dodge: `#38bdf8` (Sky Blue)
    - Parry: `#818cf8` (Indigo)
    - Toughness: `#34d399` (Mint)

##### D. Cumulative & Progressive Extras
* **Cumulative (+1 PP / rank)**: Degrees of failure stack across multiple turns. A target suffering 1st degree failure who fails another resistance check progresses to 2nd degree.
* **Progressive (+2 PP / rank)**: Target must make a new resistance check each round or minute; failure automatically worsens the condition by one degree without needing further attacks.

##### E. Instant Recovery Flaw (-1 PP / rank)
* **Mechanical Effect**: All afflicted conditions automatically end at the start of the target's next turn without requiring a recovery check.

---

#### 5. Golden Schema Patterns for Affliction (JSON)

##### Pattern A: Mental Hypnosis (Standard Will Affliction, Rank 8)
```json
{
  "id": "eff_hypnosis",
  "name": "Hypnotic Gaze",
  "baseEffect": "Affliction",
  "ranks": 8,
  "baseCost": 1,
  "action": "Standard",
  "range": "Ranged",
  "duration": "Instant",
  "resistance": "Will",
  "extras": [
    { "name": "Ranged", "cost": 1, "type": "per_rank", "ranks": 1 }
  ],
  "flaws": [],
  "config": {
    "preset": "mind_control",
    "resistance": "Will",
    "firstDegree": "Dazed",
    "secondDegree": "Compelled",
    "thirdDegree": "Controlled",
    "firstConditions": ["Dazed"],
    "secondConditions": ["Compelled"],
    "thirdConditions": ["Controlled"]
  }
}
```

##### Pattern B: Cryo-Gel Snare (Multi-Condition, Alternate Resistance Dodge, Limited Degree, Rank 10)
```json
{
  "id": "eff_cryo_snare",
  "name": "Cryo-Gel Foam",
  "baseEffect": "Affliction",
  "ranks": 10,
  "baseCost": 1,
  "action": "Standard",
  "range": "Ranged",
  "duration": "Instant",
  "resistance": "Dodge",
  "extras": [
    { "name": "Ranged", "cost": 1, "type": "per_rank", "ranks": 1 },
    { "name": "Extra Condition", "cost": 1, "type": "per_rank", "ranks": 1, "desc": "Imposes 2 conditions per degree" },
    { "name": "Alternate Resistance (Dodge)", "cost": 0, "type": "flat", "ranks": 1 }
  ],
  "flaws": [
    { "name": "Limited Degree", "cost": -1, "type": "per_rank", "ranks": 1, "desc": "Cannot cause 3rd degree conditions" }
  ],
  "config": {
    "preset": "entangle",
    "resistance": "Dodge",
    "firstDegree": "Hindered & Vulnerable",
    "secondDegree": "Defenseless & Immobile",
    "thirdDegree": "Incapacitated",
    "firstConditions": ["Hindered", "Vulnerable"],
    "secondConditions": ["Defenseless", "Immobile"],
    "thirdConditions": ["Incapacitated"]
  }
}
```
*Note on Ranks Math*: Base 1 + Ranged (+1) + Extra Condition (+1) - Limited Degree (-1) = **2 PP per rank** (Total Cost: 20 PP).

##### Pattern C: Neuro-Toxin Dart (Progressive Cumulative Poison, Rank 6)
```json
{
  "id": "eff_neuro_toxin",
  "name": "Paralytic Neurotoxin",
  "baseEffect": "Affliction",
  "ranks": 6,
  "baseCost": 1,
  "action": "Standard",
  "range": "Ranged",
  "duration": "Instant",
  "resistance": "Fortitude",
  "extras": [
    { "name": "Ranged", "cost": 1, "type": "per_rank", "ranks": 1 },
    { "name": "Progressive", "cost": 2, "type": "per_rank", "ranks": 1, "desc": "Worsens every round until checked" },
    { "name": "Cumulative", "cost": 1, "type": "per_rank", "ranks": 1, "desc": "Degrees stack across attacks" }
  ],
  "flaws": [],
  "config": {
    "preset": "custom",
    "resistance": "Fortitude",
    "firstDegree": "Impaired",
    "secondDegree": "Disabled",
    "thirdDegree": "Paralyzed",
    "firstConditions": ["Impaired"],
    "secondConditions": ["Disabled"],
    "thirdConditions": ["Paralyzed"]
  }
}
```
*Note on Ranks Math*: Base 1 + Ranged (+1) + Progressive (+2) + Cumulative (+1) = **5 PP per rank** (Total Cost: 30 PP).

---

### 9. Other Configurable Effects Reference

| Effect (`baseEffect`) | Configuration Keys (`effect.config`) | Allowed Values & Types | Example Config |
| :--- | :--- | :--- | :--- |
| **Enhanced Trait** | `traitCategory`, `traitName` | Categories: `"abilities"`, `"defenses"`, `"skills"`, `"advantages"`. `traitName`: exact trait name. | `{ "traitCategory": "abilities", "traitName": "Strength" }` |
| **Morph** | `scope` | `1` (Single Form, 5 PP), `2` (Narrow Group, 10 PP), `3` (Broad Group, 15 PP), `4` (Any Form, 20 PP). | `{ "scope": 2 }` |
| **Weaken** | `resistance`, `targetCategory`, `targetTrait` | `resistance`: `"Fortitude"` \| `"Will"`. Category: `"abilities"` \| `"defenses"` \| `"broad"`. Trait: name. | `{ "resistance": "Fortitude", "targetCategory": "abilities", "targetTrait": "Stamina" }` |
| **Nullify** | `descriptor` | Descriptor string (`"Magic"`, `"Fire"`, `"Technology"`, `"Mental / Psionic"`, etc.). | `{ "descriptor": "Magic" }` |
| **Illusion** | `senses` | Array of strings (`["Visual"]`, `["Visual", "Auditory"]`, etc.). | `{ "senses": ["Visual", "Auditory"] }` |
| **Variable** | `theme` | Theme string (`"Magic / Sorcery"`, `"Cosmic Energy"`, `"Shape-shifting"`, etc.). | `{ "theme": "Magic / Sorcery" }` |

---

## 9. Golden Reference Examples

### Example 1: Standalone Battlesuit Hero with Linked Sub-Powers (PL 10)

```json
{
  "id": "char_arsenal_armor_pl10",
  "name": "Arsenal",
  "identity": "Alexander Ross",
  "player": "Hero Roster",
  "isSecretIdentity": true,
  "baseOfOperations": "Stark Tower / New York",
  "powerLevel": 10,
  "heroPoints": 1,
  "faction": "heroes",
  "role": "Hero",
  "abilities": {
    "STR": 2,
    "STA": 2,
    "AGL": 2,
    "DEX": 4,
    "FGT": 4,
    "INT": 6,
    "AWE": 2,
    "PRE": 1
  },
  "defensesBought": {
    "DODGE": 6,
    "PARRY": 4,
    "FORTITUDE": 6,
    "WILL": 6,
    "TOUGHNESS": 0
  },
  "defenses": {
    "dodge": 8,
    "parry": 8,
    "fortitude": 8,
    "toughness": 12,
    "will": 8
  },
  "skills": [
    { "name": "Acrobatics", "ranks": 4 },
    { "name": "Expertise", "subtype": "Engineering", "ranks": 8 },
    { "name": "Insight", "ranks": 4 },
    { "name": "Perception", "ranks": 6 },
    { "name": "Ranged Combat", "subtype": "Battlesuit Weapons", "ranks": 6 },
    { "name": "Technology", "ranks": 10 }
  ],
  "advantages": [
    { "name": "All-out Attack", "ranks": 1 },
    { "name": "Improved Initiative", "ranks": 1 },
    { "name": "Inventor", "ranks": 1 },
    { "name": "Move-by Action", "ranks": 1 },
    { "name": "Power Attack", "ranks": 1 }
  ],
  "powers": [
    {
      "id": "pow_arsenal_battlesuit",
      "name": "Apex Exoskeleton Battlesuit",
      "type": "device",
      "descriptors": ["Technology", "Armor"],
      "deviceConfig": {
        "type": "removable",
        "descriptor": "High-Tech Powered Armor",
        "toughness": 10
      },
      "devicePowers": [
        {
          "id": "sub_composite_armor",
          "name": "Reinforced Composite Armor",
          "effect": {
            "name": "Protection",
            "baseEffect": "Protection",
            "ranks": 10,
            "action": "None",
            "range": "Personal",
            "duration": "Continuous",
            "extras": [
              { "name": "Impervious", "ranks": 8, "cost": 1, "type": "per_rank" }
            ]
          },
          "linkedEffects": [],
          "alternateEffects": []
        },
        {
          "id": "sub_ion_cannon",
          "name": "Ion Particle Cannon",
          "effect": {
            "name": "Ion Blast",
            "baseEffect": "Damage",
            "ranks": 10,
            "action": "Standard",
            "range": "Ranged",
            "resistance": "Toughness"
          },
          "linkedEffects": [
            {
              "name": "Paralyzing Bio-Shock",
              "baseEffect": "Affliction",
              "ranks": 10,
              "action": "Standard",
              "range": "Ranged",
              "resistance": "Fortitude",
              "desc": "Dazed / Stunned / Incapacitated"
            }
          ],
          "alternateEffects": [
            {
              "id": "alt_overload_burst",
              "name": "Overload Burst",
              "isDynamic": false,
              "effect": {
                "name": "EMP Pulse",
                "baseEffect": "Damage",
                "ranks": 10,
                "action": "Standard",
                "range": "Close",
                "extras": [
                  { "name": "Area", "desc": "Burst 30ft", "cost": 1, "type": "per_rank" }
                ]
              },
              "linkedEffects": [
                {
                  "name": "System Nullification",
                  "baseEffect": "Nullify",
                  "ranks": 10,
                  "action": "Standard",
                  "range": "Close",
                  "extras": [
                    { "name": "Area", "desc": "Burst 30ft", "cost": 1, "type": "per_rank" }
                  ]
                }
              ]
            }
          ]
        },
        {
          "id": "sub_thrusters",
          "name": "Vector Thrusters",
          "effect": {
            "name": "Flight",
            "baseEffect": "Flight",
            "ranks": 7,
            "action": "Move",
            "range": "Personal",
            "duration": "Sustained",
            "desc": "250 MPH flight speed"
          },
          "linkedEffects": [],
          "alternateEffects": []
        }
      ]
    }
  ],
  "complications": [
    {
      "id": "comp_power_recharge",
      "name": "Power Depletion",
      "type": "Complication",
      "desc": "Protracted battles or extreme energy draws drain suit capacitors, requiring emergency reboot."
    },
    {
      "id": "comp_responsibility",
      "name": "Tech Monopoly",
      "type": "Motivation",
      "desc": "Determined to keep military hardware and high-grade weapon tech out of corporate and criminal cartels."
    }
  ],
  "tactics": {
    "opening": "Strafes from the air using Vector Thrusters to target high-threat combatants with the Ion Particle Cannon.",
    "combos": "Dives into dense formations and triggers the Overload Burst area effect, disabling tech while delivering concussive damage.",
    "retreat": "Engages full-power afterburners to ascend into the clouds and disengage."
  },
  "notes": "PL 10 Battlesuit. High Toughness (12) and Ranged Offensive capabilities.",
  "activeConditions": []
}
```

---

### Example 2: Multi-Character Encounter Bundle Envelope (Boss + Minion, PL 10)

```json
{
  "schemaVersion": "1.0",
  "app": "mm3e-dm-screen",
  "exportedAt": "2026-09-22T12:00:00.000Z",
  "campaign": "Spider-Man Rogues Gallery",
  "characters": [
    {
      "id": "char_green_goblin_pl10",
      "name": "Green Goblin",
      "identity": "Norman Osborn",
      "player": "DM Roster",
      "isSecretIdentity": true,
      "powerLevel": 10,
      "heroPoints": 0,
      "faction": "villains",
      "role": "Boss",
      "abilities": {
        "STR": 6,
        "STA": 6,
        "AGL": 4,
        "DEX": 3,
        "FGT": 8,
        "INT": 6,
        "AWE": 2,
        "PRE": 3
      },
      "defensesBought": {
        "DODGE": 4,
        "PARRY": 2,
        "FORTITUDE": 3,
        "WILL": 7,
        "TOUGHNESS": 0
      },
      "defenses": {
        "dodge": 8,
        "parry": 10,
        "fortitude": 9,
        "toughness": 10,
        "will": 9
      },
      "skills": [
        { "name": "Acrobatics", "ranks": 6 },
        { "name": "Close Combat", "subtype": "Unarmed", "ranks": 2 },
        { "name": "Deception", "ranks": 8 },
        { "name": "Intimidation", "ranks": 7 },
        { "name": "Perception", "ranks": 5 },
        { "name": "Ranged Combat", "subtype": "Pumpkin Bombs", "ranks": 7 },
        { "name": "Technology", "ranks": 8 }
      ],
      "advantages": [
        { "name": "All-out Attack", "ranks": 1 },
        { "name": "Improved Initiative", "ranks": 1 },
        { "name": "Move-by Action", "ranks": 1 },
        { "name": "Power Attack", "ranks": 1 },
        { "name": "Startle", "ranks": 1 }
      ],
      "powers": [
        {
          "id": "pow_goblin_body_armor",
          "name": "Goblin Mail Armor",
          "type": "standard",
          "descriptors": ["Technology", "Armor"],
          "mainEffect": {
            "baseEffect": "Protection",
            "ranks": 4,
            "action": "None",
            "range": "Personal",
            "duration": "Permanent"
          }
        },
        {
          "id": "pow_pumpkin_bombs",
          "name": "Pumpkin Bomb Arsenal",
          "type": "standard",
          "descriptors": ["Technology", "Explosive"],
          "mainEffect": {
            "baseEffect": "Damage",
            "ranks": 10,
            "action": "Standard",
            "range": "Ranged",
            "duration": "Instant",
            "extras": [
              { "name": "Area", "desc": "Burst 30ft", "cost": 1, "type": "per_rank" }
            ]
          }
        }
      ],
      "complications": [
        {
          "id": "comp_goblin_insanity",
          "name": "Psychopathic Megalomania",
          "type": "Motivation",
          "desc": "Obsessed with proving superiority over Spider-Man and dominating criminal empires."
        }
      ],
      "tactics": {
        "opening": "Bombards the battlefield with Area Burst Pumpkin Bombs while hovering out of melee range on his glider.",
        "combos": "Uses Startle to feint with Intimidation, then swoops in with Move-by Action for a heavy strike."
      }
    },
    {
      "id": "char_goblin_goon_pl5",
      "name": "Goblin Gang Henchman",
      "player": "DM Roster",
      "powerLevel": 5,
      "faction": "villains",
      "role": "Minion",
      "abilities": {
        "STR": 1,
        "STA": 1,
        "AGL": 1,
        "DEX": 1,
        "FGT": 2,
        "INT": 0,
        "AWE": 0,
        "PRE": 0
      },
      "defensesBought": {
        "DODGE": 2,
        "PARRY": 2,
        "FORTITUDE": 2,
        "WILL": 1,
        "TOUGHNESS": 0
      },
      "defenses": {
        "dodge": 3,
        "parry": 4,
        "fortitude": 3,
        "toughness": 3,
        "will": 1
      },
      "skills": [
        { "name": "Athletics", "ranks": 2 },
        { "name": "Close Combat", "subtype": "Club", "ranks": 2 },
        { "name": "Intimidation", "ranks": 3 },
        { "name": "Ranged Combat", "subtype": "Pistols", "ranks": 3 }
      ],
      "advantages": [
        { "name": "Equipment", "ranks": 2 }
      ],
      "powers": [
        {
          "id": "pow_goon_vest",
          "name": "Tactical Vest",
          "type": "standard",
          "descriptors": ["Equipment", "Armor"],
          "mainEffect": {
            "baseEffect": "Protection",
            "ranks": 2
          }
        }
      ]
    }
  ]
}
```

---

### Example 3: Standalone Martial Sorcerer with Compound Power Suite (PL 10)

```json
{
  "id": "char_sorcerer_monk_pl10",
  "name": "Kenshiro Storm",
  "identity": "Ren Tanaka",
  "player": "Hero Roster",
  "isSecretIdentity": false,
  "baseOfOperations": "Kyoto Dojo / Sanctuary",
  "powerLevel": 10,
  "heroPoints": 1,
  "faction": "heroes",
  "role": "Hero",
  "abilities": {
    "STR": 4,
    "STA": 4,
    "AGL": 4,
    "DEX": 2,
    "FGT": 8,
    "INT": 2,
    "AWE": 6,
    "PRE": 2
  },
  "defensesBought": {
    "DODGE": 4,
    "PARRY": 2,
    "FORTITUDE": 6,
    "WILL": 4,
    "TOUGHNESS": 0
  },
  "defenses": {
    "dodge": 8,
    "parry": 10,
    "fortitude": 10,
    "toughness": 10,
    "will": 10
  },
  "skills": [
    { "name": "Acrobatics", "ranks": 6 },
    { "name": "Athletics", "ranks": 6 },
    { "name": "Close Combat", "subtype": "Thunder Strike", "ranks": 2 },
    { "name": "Expertise", "subtype": "Arcane Lore", "ranks": 6 },
    { "name": "Insight", "ranks": 6 },
    { "name": "Perception", "ranks": 6 }
  ],
  "advantages": [
    { "name": "Agile Feint", "ranks": 1, "category": "Combat" },
    { "name": "Improved Initiative", "ranks": 2, "category": "Combat" },
    { "name": "Move-by Action", "ranks": 1, "category": "Combat" },
    { "name": "Uncanny Dodge", "ranks": 1, "category": "Combat" },
    { "name": "Defensive Roll", "ranks": 6, "category": "Combat" }
  ],
  "powers": [
    {
      "id": "pow_storm_strike",
      "name": "Thunderclap Ki Palm",
      "type": "compound",
      "compoundMode": "linked",
      "descriptors": ["Ki", "Electricity", "Sonic"],
      "compoundEffects": [
        {
          "id": "comp_thunder_damage",
          "name": "Thunder Strike",
          "isPrimaryAction": true,
          "isLinked": false,
          "effect": {
            "name": "Damage",
            "baseEffect": "Damage",
            "ranks": 10,
            "action": "Standard",
            "range": "Close",
            "resistance": "Toughness",
            "extras": [
              { "name": "Penetrating", "ranks": 4, "cost": 1, "type": "per_rank" }
            ]
          },
          "linkedEffects": [],
          "alternateEffects": []
        },
        {
          "id": "comp_sonic_stun",
          "name": "Stunning Concussion",
          "isPrimaryAction": false,
          "isLinked": true,
          "effect": {
            "name": "Affliction",
            "baseEffect": "Affliction",
            "ranks": 10,
            "action": "Standard",
            "range": "Close",
            "resistance": "Fortitude",
            "desc": "Dazed / Stunned / Incapacitated"
          },
          "linkedEffects": [],
          "alternateEffects": []
        }
      ]
    },
    {
      "id": "pow_storm_stride",
      "name": "Storm Walker Suite",
      "type": "compound",
      "compoundMode": "suite",
      "descriptors": ["Ki", "Wind"],
      "compoundEffects": [
        {
          "id": "comp_wind_flight",
          "name": "Wind Gliding",
          "isPrimaryAction": false,
          "effect": {
            "name": "Flight",
            "baseEffect": "Flight",
            "ranks": 4,
            "action": "Move",
            "range": "Personal",
            "duration": "Sustained"
          }
        },
        {
          "id": "comp_spirit_sense",
          "name": "Chi Awareness",
          "isPrimaryAction": false,
          "effect": {
            "name": "Senses",
            "baseEffect": "Senses",
            "ranks": 3,
            "action": "None",
            "range": "Personal",
            "duration": "Continuous",
            "config": {
              "selectedFaculties": ["awareness", "darkvision"]
            }
          }
        }
      ]
    }
  ],
  "complications": [
    {
      "id": "comp_honor_code",
      "name": "Code of the Dojo",
      "type": "Honor",
      "desc": "Must protect the weak and never strike an unarmed surrender."
    }
  ],
  "notes": "PL 10 Martial Artist with Compound Strike (Damage 10 + Affliction 10) and Storm Suite."
}
```

---

## 10. Common AI Hallucinations & Antipatterns

| Antipattern / Failure Mode | Why It Breaks the System | What the AI Must Do Instead |
| :--- | :--- | :--- |
| **Using `container` instead of `device`** | Legacy alias; although normalized internally, modern specs require `"type": "device"` to match rulebooks. | Use `"type": "device"` for battlesuits, weapons, utility belts, and physical gadgets. |
| **Omitting `compoundEffects` on compound powers** | Breaks compound power structure, rendering it empty in the builder and DM screen. | Always supply `"compoundEffects": [...]` containing components with `id`, `name`, `effect`, `isPrimaryAction`, and `isLinked`. |
| **Mismatched Range or Action on Linked components** | Per DHH p. 147, linked effects must act on the same action and range. Mixing Ranged Damage with Close Affliction is illegal in M&M 3e rules. | Harmonize linked components to share identical `range` and `action` (e.g. both Close Standard). |
| **Omitting `linkedEffects` on sub-powers** | Simultaneous linked abilities (e.g. Damage + Affliction) will fail to register or be stripped during export. | Place simultaneous sub-effects inside `devicePowers[].linkedEffects`. |
| **Stripping `deviceConfig` on devices** | Power point calculation cannot apply the Removable / Easily Removable flaw discount. | Always supply `"deviceConfig": { "type": "removable" \| "easily_removable", "toughness": 10 }`. |
| **Omitting or misconfiguring `selectedFaculties`** | Using a raw string or omitting `config.selectedFaculties` causes the Senses effect to default back to basic Darkvision and break sensory widgets. | Always supply `config: { "selectedFaculties": ["darkvision", "infravision", ...] }`, and set `ranks` equal to the sum of faculty points (`pts`). |
| **Numeric Damage DC (`"dc": 8`)** | The UI expects a formatted string for quick DM reference. | Write `"dc": "DC 23 Toughness"` ($15 + 8$). |
| **Damage DC formula on Affliction** | Calculating Affliction DC as $15 + \text{Rank}$ over-tunes difficulty. | For Affliction / Weaken: $\text{DC} = 10 + \text{Rank}$ (e.g. Rank 8 is `"DC 18 Dodge"`). |
| **Area attack with to-hit bonus** | In M&M 3e rules, Area attacks automatically hit their area; rolling to hit is illegal. | Set `"bonus": 0`, `"crit": "-"`, and `"targetDefense": "Dodge"`. |
| **Forgetting Strength-based math** | A hero with STR 6 who has a Rank 4 sword deals Rank 10 damage ($6 + 4$). If their attack bonus is $+8$, $8 + 10 = 18 > 16$ (PL 8 illegal!). | Factor STR into effect rank before calculating attack bonus cap. |
| **Lowercase or full ability names** | Writing `"strength": 5` or `"str": 5` results in $0$ STR in the builder. | Use strict uppercase 3-letter keys: `STR`, `STA`, `AGL`, `DEX`, `FGT`, `INT`, `AWE`, `PRE`. |
| **Non-standard Faction strings** | Using `"enemies"`, `"allies"`, or `"monsters"` breaks tactical faction filtering. | Use strictly `"heroes"`, `"villains"`, or `"npcs"`. |
| **Non-standard Role strings** | Using `"Tank"`, `"DPS"`, or `"Leader"` breaks minion/boss logic. | Use strictly `"Boss"`, `"Lieutenant"`, `"Minion"`, `"Hero"`, `"Ally"`, `"Specialist"`, or `"Civilian"`. |
| **Omitting `defensesBought`** | When exported back to the Character Builder, all defenses reset to base ability scores. | Always compute `defensesBought: { DODGE, PARRY, FORTITUDE, TOUGHNESS, WILL }`. |
| **Confusing Equipment with Devices** | Equipment bought with PP directly breaks budget; devices bought with EP lack removable flaw accounting. | Equipment is bought via the `Equipment` advantage in `resources`. Devices are powers in `powers` with `deviceConfig`. |

---

## 11. AI System Prompt Template (Ready to Copy-Paste)

Developers and GMs can provide the following prompt to any external LLM to ensure 100% schema compliance:

```text
You are an expert Mutants & Masterminds 3rd Edition (M&M 3e) character architect. 
Generate a character (or multi-character bundle) conforming strictly to the MM3e JSON Specification:

1. Powers, Devices, and Compound Suites:
   - For Devices: use type "device", provide deviceConfig: { type: "removable" | "easily_removable", toughness: 10 }, and list sub-powers in devicePowers: [].
   - For Compound Powers: use type "compound", set compoundMode: "linked" | "suite", and list sub-effects in compoundEffects: []. Designate isPrimaryAction: true on the carrier attack, and isLinked: true on simultaneous rider effects (ensuring matching Range and Action).
   - If a sub-power has simultaneous linked effects, place them in linkedEffects: [].
   - If a sub-power has alternate firing modes, place them in alternateEffects: [].
   - For Senses effects: set baseEffect: "Senses", provide config: { selectedFaculties: ["faculty_id", ...] }, and ensure ranks equals the sum of faculty point costs (pts).
2. Obey strict Power Level caps:
   - Attack Bonus + Effect Rank <= 2 * PL
   - Dodge + Toughness <= 2 * PL
   - Parry + Toughness <= 2 * PL
   - Fortitude + Will <= 2 * PL
   - Ability Modifier + Skill Ranks <= PL + 10
3. Factor "Strength-based" damage: Total Damage Rank = Base Weapon Rank + STR.
4. Use exact casing:
   - abilities: { STR, STA, AGL, DEX, FGT, INT, AWE, PRE }
   - defensesBought: { DODGE, PARRY, FORTITUDE, TOUGHNESS, WILL }
   - defenses: { dodge, parry, fortitude, toughness, will }
   - faction: "heroes" | "villains" | "npcs"
   - role: "Hero" | "Boss" | "Lieutenant" | "Minion" | "Ally" | "Specialist" | "Civilian"
5. Output pure, valid JSON with no markdown wrapping or conversational commentary.
```

