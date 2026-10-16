# Mutants & Masterminds 3e Character Builder - Design System

> **Tabletop Tactical Cockpit & Interactive Play Sheet Standard**  
> Calibrated for high-density gameplay ergonomics, rapid d20 rolls, and precise point-budgeting.  
> Adheres strictly to the `/design-taste-frontend` anti-slop frontend specification.

---

## 0. Design Read & Brief Inference
- **Reading as:** Tabletop RPG tactical character builder and interactive play cockpit for *Mutants & Masterminds 3e*, engineered for players and Game Masters requiring immediate lookup, precise point budgeting, and fast in-combat rolls.
- **Foundation & Aesthetic:** *Hybrid Tactical Tabletop* (Vue 3 + CSS Grid + Contextual Sliding Inspector + Tabular Monospace + Phosphor/Remix icons).
- **Vibe:** Atmospheric superhero command center — tactical, dense, high-contrast, zero marketing fluff.

---

## 1. The Three Dials (Core Configuration)

| Dial | Value | Specification & Tactical Rationale |
|---|:---:|---|
| **`DESIGN_VARIANCE`** | **4** | **Structured Symmetry:** Strict grid alignment, predictable column modularity, zero artsy/chaotic layout shifts during live play. |
| **`MOTION_INTENSITY`** | **4** | **Tactile Feedback:** Rapid micro-physics on click (`:active:scale-95`), smooth sliding contextual drawers (`0.18s cubic-bezier(0.16, 1, 0.3, 1)`), real-time Dice HUD roll bounce, zero continuous distracting loops. |
| **`VISUAL_DENSITY`** | **9** | **Tactical Cockpit:** Packed, high-density data metrics. Compact steppers, tabular monospaced numbers, tight padding, and maximized above-the-fold screen real estate. |

---

## 2. Tactical Cockpit Architecture (D&D Beyond & Roll20 Standards)

### 2.A 3-Column Tactical Layout (Desktop ≥ 1024px)
The screen layout is divided into three purpose-built functional zones:

1. **Left Column (24–26% — Core Foundation):**
   - **Abilities Matrix:** 8 core M&M abilities (STR, STA, AGL, DEX, FGT, INT, AWE, PRE) with primary Modifier/Rank display.
   - **Defenses Block:** Dodge, Parry, Fortitude, Toughness, Will, including PL trade-off markers.
   - **Senses & Movement:** Speed ranks, sensory traits, initiative summary.
   - **Skills Table:** Dense alphabetical list with trained-only filters and interactive roll chips.

2. **Center Column (50–52% — Active Gameplay Hub):**
   - **Hero Header Strip (Max 12% Viewport Height):** Identity, Archetype, Power Level, and live **Power Point (PP) Budget Meter**.
   - **Sticky Combat Bar:** Active Damage Conditions track, Toughness penalty counters (`-1, -2, -3...`), Hero Points reserve, and Initiative stepper.
   - **Tabbed Action Hub:** High-density tabs (`[ Attacks | Powers | Advantages | Equipment | Complications | Bio ]`) enabling rapid combat action selection without full-page reloads.

3. **Right Column / Sliding Contextual Drawer (24–28% — Inspector):**
   - Reserved for the **Contextual Detail Inspector Drawer** (`SheetInspectorDrawer.vue`).
   - Slides in smoothly from the right edge when any Ability, Skill, Power, Advantage, Equipment item, or Rule is clicked.
   - **Ability & Skill Tactical Ledgers:**
     - Vertical accounting table with uniform `1rem` (16px) `font-weight: 800` `font-mono` numerals.
     - Transparent breakdown: Total Modifier, Governing Ability, Base Rank stepper (`- / +`), Power Bonus, Advantage Bonus, Condition Penalty (`-2` Impaired / `-5` Disabled), and PP Cost.
     - D&D Beyond-style editorial section: Overview, Routine Checks (Take 10), Difficulty Benchmark (DC 10 to DC 30+) reference table, specialized skill action tasks, and specialization management.
   - **The Sheet Never Leaves View:** Players can read full rule descriptions, flat extras, or modifiers while simultaneously keeping all combat stats and roll chips visible on the left.

### 2.B Mobile Ergonomics (< 768px)
- **Sticky Top Combat Header:** Pinned horizontal bar containing current Toughness penalties, Hero Points, and Initiative.
- **Bottom Mode Switcher:** Fixed bottom thumb bar with icon tabs (`[ Combat | Skills | Actions | Powers | Gear | Bio ]`).
- **Bottom Sheet Inspector:** The inspector drawer transforms into an ergonomic swipeable bottom sheet (`sheet-bottom` with swipe-to-dismiss gesture), keeping tap targets within single-thumb reach.

---

## 3. Interactive Click-to-Roll & Real-Time Dice HUD

### 3.A Click-to-Roll Visual Affordance
* **Static Roll Numbers are STRICTLY BANNED:** Every Attack Bonus (`+10`), Resistance Check DC (`DC 20`), Defense check, and Skill modifier must render as an **interactive d20 chip** (`.d20-chip`).
* **Visual Signature:**
  - Badge style with subtle border (`border: 1px solid var(--accent-primary-soft)`).
  - Subtle d20 icon (`ri-dice-line` or Phosphor dice).
  - Hover state: `hover:border-accent-primary hover:bg-accent-primary/15`.
  - Active tactile feedback: `:active:scale-95` on click.

### 3.B Real-Time Dice HUD Mechanics (`DiceRollHud.vue`)
Clicking any rollable chip triggers the non-blocking floating Dice HUD:
- **Instant Roll Breakdown:** Displays `1d20 [14] + 8 (Bonus) = 22 vs DC 18 [SUCCESS]` with zero lag.
- **Critical Success (Nat 20):** Vivid Emerald/Gold glow (`#10b981` / `#f59e0b`) with confetti/crit banner.
- **Critical Failure (Nat 1):** Crimson alert glow (`#ef4444`) with immediate tactical warning.
- **Hero Point Reroll Button:** Direct 1-click trigger that spends 1 Hero Point, rerolling the d20 and applying the M&M 3e rule (+10 boost if roll is 1–10).
- **VTT Payload:** Formats roll payload for external clipboard or Roll20/Foundry chat export.

---

## 4. Mutants & Masterminds 3e Specific Mechanical Systems

### 4.A Damage & Conditions Ladder (No HP System)
Mutants & Masterminds 3e does **not** use Hit Points (HP). The interface must reflect this unique damage mechanic:
- **Bruise / Toughness Penalty Counter:** Numeric stepper (`+ / -`) tracking cumulative `-1` penalties to Toughness checks.
- **Graded Condition Chips:** Prominent badges for active conditions:
  - `Bruised` (cumulative penalty)
  - `Dazed` (limited to standard action)
  - `Staggered` (half speed + dazed; second staggered = incapacitated)
  - `Incapacitated` (defenseless, stunned, unconscious)
  - `Defenseless` / `Prone` / `Hindered`
- Clicking any condition chip displays an inline tooltip or inspector drawer explaining the exact mechanical penalty.

### 4.B Power Point (PP) Budget Tracker
- **Budget Formula:** `Total PP = 15 × Power Level`.
- **Persistent Budget Ribbon:** Always visible at the top of the builder view, broken down into 5 discrete categories:
  $$\text{Total Spent} = \text{Abilities} + \text{Defenses} + \text{Skills} + \text{Advantages} + \text{Powers}$$
- Real-time indicator showing **Remaining PP** (Green when balanced, Amber when remaining, Crimson pulse when over-budget).

### 4.C Power Level (PL) Caps & Trade-off Validation
The design system enforces visual limit indicators for M&M 3e trade-off rules:
- **Offensive PL Cap:** $\text{Attack Bonus} + \text{Effect Rank} \le 2 \times \text{PL}$
- **Defensive PL Caps:** 
  - $\text{Dodge} + \text{Toughness} \le 2 \times \text{PL}$
  - $\text{Parry} + \text{Toughness} \le 2 \times \text{PL}$
  - $\text{Fortitude} + \text{Will} \le 2 \times \text{PL}$
- Exceeding any cap flags the specific stat chip with a warning pill and amber border.

### 4.D Modifier vs. Base Score Visual Hierarchy
- In d20 M&M 3e, the **Rank/Modifier** is the primary actionable value used in 95% of gameplay.
- **Visual Rule:**
  - **Rank / Modifier:** Primary, large prominent display (`text-2xl md:text-3xl font-bold font-mono`).
  - **Base PP Cost:** Subordinate secondary label or badge (`text-xs text-secondary font-mono`).

---

## 5. Anti-Modal Architecture & Anti-Nesting Rules

### 5.A Prohibition of "Modal Pop-Up Hell"
- **Lookup Operations:** Inspecting Powers, Advantages, Equipment, Conditions, or Rules **MUST NEVER** open a full-screen center modal with a darkened backdrop.
- All lookups use the **Right Sliding Inspector Drawer** (`SheetInspectorDrawer.vue`), preserving sheet interactivity.
- **Allowed Modals (Administrative Disruptions Only):**
  - Full Character JSON Export / Import (`ExportImportModal.vue`)
  - Printable Character Sheet preview (`GreenRoninPrintModal.vue`, `Roll20PrintModal.vue`)
  - Destructive character wipe / reset dialog

### 5.B Anti-Nesting Rule ("Box Soup" Ban)
- **BANNED:** Nesting 3 or more bordered cards (`.sheet-card > .card-body > .sub-card`).
- **Prescribed Structure:**
  - Single primary surface card (`--bg-card: #0f172a` with subtle border `rgba(255, 255, 255, 0.08)`).
  - Internal groupings separated by **clean hairline dividers** (`divide-y divide-white/5` or `border-b border-white/5`), subtle background tone shifts (`--bg-input: #0b1122`), or deliberate tabular whitespace.
  - No redundant padding layers that squeeze readable text.

---

## 6. Color System: Calibrated Dark Tactical Tokens

The palette eliminates random "rainbow slop" (no 9 competing bright hues), centering on **Atmospheric Obsidian / Midnight** with role-specific semantic tokens strictly exceeding WCAG AA (contrast ratio $\ge 4.5:1$).

### 6.A Theme Foundations (Obsidian Tactical Dark Base)
- **Page Background (`--bg-app`):** `#080d1a` (Deep atmospheric midnight)
- **Card Surface (`--bg-card`):** `#0f172a` (Solid slate-900 surface)
- **Elevated / Input Surface (`--bg-input`):** `#0b1122` (Subtle dark inset)
- **Card Hover Surface (`--bg-card-hover`):** `#172033`
- **Hairline Border (`--border-color`):** `rgba(255, 255, 255, 0.08)`
- **Subtle Divider (`--border-subtle`):** `rgba(255, 255, 255, 0.04)`
- **Text Primary (`--text-primary`):** `#f8fafc` (Contrast > 15:1 against card background)
- **Text Secondary (`--text-secondary`):** `#94a3b8` (Contrast > 6.9:1)
- **Text Muted (`--text-muted`):** `#cbd5e1` (Contrast > 11:1, exceeds WCAG AA)

### 6.B Semantic Role-Specific Accents
Rather than coloring every action type with a different pastel color, tokens are strictly mapped to mechanical tabletop roles:

| Role | Token & Hex | Use Case |
|---|---|---|
| **Primary Brand & Interactive** | `--accent-primary: #006fb8`<br>`--accent-secondary: #2a8fd6` | Active navigation tabs, primary CTAs, focus rings, selected state highlights. |
| **Combat, Lethal & Damage** | `--accent-danger: #ef4444`<br>`--accent-crimson: #dc2626` | Toughness damage track, Bruise counters, Critical Fumble alert (Nat 1), attack triggers. |
| **Hero Points & Inspiration** | `--accent-amber: #f59e0b`<br>`--accent-gold: #d97706` | Hero Point reserves, Critical Hit banner (Nat 20), core ability modifier highlights. |
| **Buffs, Trained & Equipped** | `--accent-emerald: #10b981`<br>`--accent-green: #059669` | Trained skill indicators, active defensive buffs, equipped gear status. |
| **Powers & Arcane Energy** | `--accent-sapphire: #0284c7`<br>`--accent-cyan: #06b6d4` | Power Point allocation badges, Power effect cards, device modifications. |

---

## 7. Typography & Tabular Numerals

### 7.A Font Family Allocations
- **Headings & Action Labels:** `'Barlow', system-ui, sans-serif` (700 Bold, 600 SemiBold) — Compact, assertive, modern superhero comic typography.
- **Body, Rule Descriptions & Notes:** `'Roboto', system-ui, sans-serif` (400 Regular, 500 Medium) — Utilitarian, clean readability for dense multi-line rules text.
- **Measurements, Ranks, DCs & D20 Rolls:** `'Geist Mono', 'JetBrains Mono', monospace` — **Mandatory tabular figures (`tnum`)** for all numbers to eliminate horizontal jitter during live stat adjustment.

### 7.B Typography Constraints
- **CTA Wrap Ban:** All primary button labels must fit on a single line at desktop (`whitespace-nowrap`).
- **No Em-Dashes in UI Copy:** UI labels and descriptions strictly avoid em-dashes (`—`); use colons, parentheticals, or clean spacing instead.
- **Contrast Guarantee:** Every numerical badge and label must maintain WCAG AA minimum 4.5:1 contrast against its background card.

---

## 8. Mobile Ergonomics & Touch Guidelines
- **Minimum Tap Target:** Interactive steppers (`+ / -`), dice chips, tabs, and drawer close buttons must provide a minimum touch hitbox of **44 × 44px**.
- **Keyboard Traps & Esc Handlers:** The `SheetInspectorDrawer` and administrative modals must dismiss instantly on `Escape` keypress.
- **Scroll Isolation:** The sliding drawer scroller (`.drawer-body-scroller`) uses `overscroll-behavior: contain` to prevent chaining scroll events to the underlying sheet.

---

## 9. Pre-Flight Design Audit Checklist

Before delivering or modifying any character sheet component, verify every item below:

- [ ] **Density Verified**: Layout fits core vitals and combat stats above the fold without excessive empty whitespace (`VISUAL_DENSITY: 9`).
- [ ] **No Modal Hell for Lookups**: Power/Advantage/Equipment/Rule lookups open in `SheetInspectorDrawer`, NOT in a full-screen center modal overlay.
- [ ] **Click-to-Roll Ubiquity**: Attack bonuses, DCs, Defenses, and Skill bonuses are interactive d20 chips (`:hover`, `:active:scale-95`).
- [ ] **Tabular Numerals**: All ranks, modifiers, PP counts, and roll values use monospaced tabular numerals (`font-mono` / `tnum`).
- [ ] **Modifier-First Hierarchy**: Ability rank/modifier is rendered larger than the base PP cost.
- [ ] **No Box Soup**: No 3+ nested bordered cards; inner sections use dividers or background tone shifts.
- [ ] **Color Restraint**: Colors belong strictly to the 5 semantic roles; no uncalibrated rainbow buttons.
- [ ] **M&M 3e Integrity**: Damage is tracked via Toughness Bruises and condition chips, not an HP bar.
- [ ] **PL Limits Monitored**: Over-budget Power Points or illegal PL trade-offs display clear visual alert badges.
- [ ] **Contrast AA Compliant**: All text and badge elements pass WCAG AA $\ge 4.5:1$ contrast against their respective backgrounds.
