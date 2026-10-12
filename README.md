# Mutants & Masterminds 3e Character Builder

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Vue 3](https://img.shields.io/badge/Vue-3.5-42b883.svg?logo=vue.js)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-339933.svg?logo=node.js)](https://nodejs.org/)

A web-based character builder, interactive play sheet, and power construction workspace for Mutants & Masterminds 3rd Edition (D20 Hero System).

Live deployment: https://mm3e-builder.vercel.app/

---

## Contents

- [Overview](#overview)
- [Application Modules](#application-modules)
  - [Tactical Character Sheet](#tactical-character-sheet)
  - [Character Creation Wizard](#character-creation-wizard)
  - [Power Studio](#power-studio)
  - [Equipment & Resources](#equipment--resources)
  - [Export & Printing Suite](#export--printing-suite)
  - [Dice Mechanics & VTT Bridge](#dice-mechanics--vtt-bridge)
  - [Storage & Portability](#storage--portability)
- [Architecture & Directory Layout](#architecture--directory-layout)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Requirements](#requirements)
  - [Installation](#installation)
  - [Development Commands](#development-commands)
- [Roll20 Companion Extension](#roll20-companion-extension)
  - [Installation Guide](#installation-guide)
  - [Usage with Roll20](#usage-with-roll20)
- [Contributing](#contributing)
- [License & Legal](#license--legal)

---

## Overview

Mutants & Masterminds 3e character creation requires calculating power point costs across ability scores, defense trade-offs, skills, combat advantages, and customized superpowers within fixed Power Point budgets and Power Level (PL) caps.

This application handles all point calculations and rules verification directly in the browser:
- Fractional cost rules (when flaws reduce costs below 1 PP per rank)
- Alternate effect arrays (standard 1 PP and dynamic 2 PP slots)
- Removable devices (-1 PP per 5 PP or -2 PP per 5 PP)
- Linked power structures and synchronized action/range locks
- Real-time defense calculations factoring equipment, advantages, and powers
- Local-first architecture: no login required, zero server storage, complete offline functionality

---

## Application Modules

### Tactical Character Sheet

Designed for active tabletop play with a responsive three-column layout:
- **Abilities & Defenses**: The eight core ability scores alongside Dodge, Parry, Fortitude, Toughness, and Will. Real-time calculations factor in base abilities, purchased defense ranks, equipped armor (Protection), active shields, and Defensive Roll advantage ranks.
- **Skills Table**: Complete listing of M&M 3e skills with ability modifiers, purchased ranks, and total bonuses. Clicking a skill triggers an immediate d20 roll check.
- **Actions & Targeted Attacks**: Combines unarmed strikes, weapons, and damaging powers into a single combat roster. Calculates attack bonuses using Fighting/Dexterity scores, Close/Ranged Attack advantages, and specializations.
- **Vitals & Damage Conditions**: Tracks bruised damage penalties, active conditions (Dazed, Staggered, Incapacitated), and Hero Points. Includes automated Hero Point d20 rerolls (treating rolls of 1-10 as 11-20).

### Character Creation Wizard

A guided nine-step workflow for building a hero from concept to complete sheet:
1. **Concept**: Character name, secret identity, origin, and archetype templates (Battlesuit, Speedster, Martial Artist, Mystic, Energy Controller, and others).
2. **Abilities**: Allocate points across Strength, Stamina, Agility, Dexterity, Fighting, Intellect, Awareness, and Presence.
3. **Defenses**: Purchase defense ranks with live trade-off cap checks (Dodge/Parry + Toughness <= 2 x PL; Fortitude + Will <= 2 x PL).
4. **Skills**: Select and rank standard or custom skills (1 PP per 2 ranks).
5. **Advantages**: Filter and select combat, fortune, and general advantages.
6. **Powers**: Build superpowers within the remaining Power Point budget.
7. **Equipment**: Purchase gear, weapons, utility gadgets, vehicles, and headquarters using Equipment Points (EP).
8. **Complications**: Select motivations and dramatic hooks for earning Hero Points.
9. **Review**: Comprehensive point audit and rules verification prior to finalizing the character sheet.

### Power Studio

A dedicated construction workshop for creating superpowers compliant with the M&M 3e System Reference Document (SRD):
- **Base Effect Engine**: 40+ standard effects including Damage, Affliction, Move Object, Senses, Protection, Flight, and Concealment.
- **Dedicated Sub-Configurators**:
  - **Affliction**: 1st, 2nd, and 3rd degree failure conditions with Fortitude or Will saves; built-in presets (Stun, Sleep, Mind Control, Entangle, Nausea, Terror).
  - **Senses**: Multi-select sensory faculties (Darkvision, Infravision, Radar, Counters Concealment, Precognition) with automatic rank summation.
  - **Immunity**: Categorized protections (survival hazards, biological effects, elemental descriptors, lethal damage, defense saves).
  - **Concealment**: Sensory obscurement across visual, auditory, olfactory, radio, mental, or all senses with blending/passive modifiers.
  - **Movement**: Locomotion modes (Wall-crawling, Safe Fall, Water Walking, Dimension Travel, Permeate, Slithering, Space Travel, Swinging) with rank steppers.
  - **Environment**: Ambient hazards (extreme cold, extreme heat, movement impediments, daylight, visibility obscurement) with PP/rank calculations.
  - **Comprehend**: Language understanding, animal/plant communication, machine interfacing, spirit communication, and psychometry.
  - **Enhanced Trait**: Multi-target ability, defense, skill, or advantage enhancements with category-specific cost ratios.
  - **Illusion, Morph, Weaken, Nullify, Variable**: Full parameter controls, descriptors, and scope settings.
- **Modifiers Engine**: Extras and flaws catalog with compatibility filtering, flat modifiers, and per-rank scaling. Handles fractional net costs (1 PP per 2 ranks, 1 PP per 3 ranks, etc.).
- **Alternate Arrays**: Organize primary effects alongside standard alternate slots (1 PP) or dynamic alternate slots (2 PP) with capacity metering.
- **Removable Devices**: Package powers into removable (-1 PP per 5 PP) or easily removable (-2 PP per 5 PP) devices.

### Equipment & Resources

- **Budget Tracking**: Converts ranks in the Equipment advantage into Equipment Points (1 PP = 5 EP).
- **Gear Catalog**: Standard weapons, protective armor, utility items, vehicles, and headquarters with point costs and rules descriptions.
- **Custom Equipment Studio**: Create custom gear with user-defined attack bonuses, damage ranks, protection values, active defense ratings, and traits.

### Export & Printing Suite

Export character builds into multiple formats:
- **Green Ronin Deluxe Print Sheet**: High-fidelity, print-ready CSS layout styled after the official Green Ronin two-page character sheet.
- **Markdown Export**: Structured, readable markdown formatted for documentation, wikis, or GitHub issues.
- **BBCode Export**: BBCode formatted blocks for tabletop RPG forums and play-by-post websites.
- **Plain Text Export**: Monospace plain text summary designed for discord or text editors.
- **JSON Backup**: Raw character state serialization for backup and migration.
- **Roll20 Macro Export**: Chat macros formatted for the default Roll20 template.

### Dice Mechanics & VTT Bridge

- **Cryptographic Dice Roller**: Rolls use `window.crypto.getRandomValues()` with rejection sampling to eliminate modulo bias. Every d20 outcome has an exact 5.0% probability.
- **Degree of Success Calculator**: Compares attack and resistance rolls against target Difficulty Classes (DC) to calculate degrees of success or failure.
- **Roll20 Companion Extension**: Dispatches roll events that the companion Chrome extension catches and posts directly to Roll20 campaign chat.
- **Embed Bridge**: Bidirectional iframe postMessage communication for embedding the sheet or wizard inside external tools such as GM screens.

### Storage & Portability

- **Local Storage Vault**: Saves character data in the browser with undo and redo history. No server account or external database required.
- **Link Sharing**: Compresses character state into a URL hash using LZ-String, allowing character builds to be shared via a single link.

---

## Architecture & Directory Layout

The codebase separates static rules data, calculation logic, state stores, and UI components into dedicated modules:

```
mm3e-builder-vue/
├── index.html                  # HTML entry point
├── package.json                # Dependencies and npm scripts
├── vite.config.js              # Vite configuration
├── public/                     # Static assets (logo banner, icons, robots, sitemap)
└── src/
    ├── App.vue                 # App shell, navigation bar, modal manager
    ├── main.js                 # App initialization and extension bridge registration
    ├── data/                   # Static rules catalogs and effect databases
    │   ├── baseEffects.js      # Base effect catalog (costs, actions, ranges, durations)
    │   ├── configurableEffects.js # Customizer schemas for complex effects
    │   ├── extras.js           # Official extras catalog and compatibility tags
    │   ├── flaws.js            # Official flaws catalog and compatibility tags
    │   ├── modifierCategories.js # Modifier taxonomy (Combat, Sensory, Utility, etc.)
    │   └── index.js            # Unified data re-export index
    ├── rules/                  # Calculation logic and rules validation
    │   ├── abilities.js        # Core ability score definitions and cost rates
    │   ├── advantages.js       # Advantage database and prerequisites
    │   ├── archetypes.js       # Pre-configured hero archetype templates
    │   ├── attacks.js          # Targeted attack routine compiler
    │   ├── complications.js    # Standard complication database
    │   ├── conditions.js       # Status condition definitions and penalties
    │   ├── defenses.js         # Defense types and trade-off formulas
    │   ├── equipmentCalculator.js # EP budgeting and deficit calculations
    │   ├── powerCalculator.js  # Fractional cost math and alternate array headroom
    │   ├── powerEngine.js      # Facade connecting data and calculation modules
    │   ├── powerFormatter.js   # Human-readable power strings and notations
    │   ├── powerNormalizer.js  # Schema migration and default normalization
    │   ├── powerRuleDescriptions.js # Mechanical rules summaries
    │   ├── powerValidator.js   # PL caps and legality validation
    │   ├── resources.js        # Weapons, armor, vehicles, and HQ catalog
    │   └── skills.js           # Skill list, ability baselines, and trained-only flags
    ├── components/
    │   ├── modals/             # Vault, JSON, Share, Print, and Export modals
    │   │   ├── GreenRoninPrintModal.vue # Deluxe sheet print preview modal
    │   │   ├── GreenRoninSheet.vue      # Deluxe two-page official sheet component
    │   │   ├── MarkdownExportModal.vue  # Multi-format text/markdown export modal
    │   │   └── ...                      # Condition, Equipment, Advantage modals
    │   ├── power-studio/       # Power Studio editor, array workbenches, and canvases
    │   │   ├── EffectConfigurator.vue   # Master configuration router
    │   │   ├── EffectEditorCanvas.vue   # Main effect property and rank editor
    │   │   ├── ModifierInspectorModal.vue # Extras and flaws browser
    │   │   └── configs/                 # 13 dedicated sub-effect configurators
    │   │       ├── AfflictionConfig.vue
    │   │       ├── SensesConfig.vue
    │   │       ├── ImmunityConfig.vue
    │   │       ├── ConcealmentConfig.vue
    │   │       ├── MovementConfig.vue
    │   │       ├── EnvironmentConfig.vue
    │   │       └── ... (Comprehend, Trait, Illusion, Morph, Nullify, Variable, Weaken)
    │   ├── rules/              # Reference reader modal for game rules
    │   ├── sheet/              # Interactive 3-column tactical character sheet
    │   └── wizard/             # 9-step character creation wizard
    ├── services/
    │   ├── embedBridge.js      # Iframe postMessage bridge for GM screen embeds
    │   ├── shareService.js     # Character state pruning and LZ-String compression
    │   └── vttBridge.js        # Event dispatcher for the Roll20 Chrome extension
    ├── stores/
    │   ├── heroStore.js        # Reactive store for character stats and point budgets
    │   ├── powerBuilderStore.js # Power Studio active power editing state
    │   └── uiStore.js          # Navigation tabs, toast notifications, active modals
    ├── styles/
    │   ├── builder.css         # Power Studio styling
    │   ├── green-ronin-sheet.css # Authentic print stylesheet for official sheet layout
    │   ├── main.css            # Base design tokens, resets, and utilities
    │   ├── roll20-print.css    # Roll20 macro export and quick print preview
    │   ├── sheet.css           # Tabletop character sheet styling
    │   ├── wizard.css          # Creation wizard styling
    │   └── components/
    │       └── effect-configurator.css # Sub-configurator container and card styles
    └── utils/
        ├── diceRoller.js       # CSPRNG d20 roller with rejection sampling
        ├── dragScroll.js       # Mouse drag-to-scroll handler with momentum
        ├── seamlessScroll.js   # Momentum scrolling and scroll isolation
        ├── urlSync.js          # Browser history and hash synchronization
        └── exporters/          # Multi-format serialization engines
            ├── bbcode.js       # BBCode export formatter
            ├── helpers.js      # Shared text formatting utilities
            ├── jsonBackup.js   # JSON backup and import handler
            ├── markdown.js     # Markdown export formatter
            ├── plainText.js    # Monospace text export formatter
            └── roll20.js       # Roll20 chat macro compiler
```

---

## Tech Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| Framework | Vue 3.5 | Composition API with `<script setup>` single-file components |
| Bundler | Vite 8.3 | ES module development server and production bundler |
| State Management | Pinia 4 | Centralized store for hero data, rules math, and UI state |
| Icons | Remix Icon 4 | Vector iconography loaded via local font files |
| Compression | LZ-String | URL-safe string compression for build sharing links |
| Styling | Vanilla CSS | Design tokens, flexbox/grid layouts, zero CSS framework overhead |

---

## Getting Started

### Requirements

- Node.js 18.0.0 or later
- npm (included with Node.js)

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/your-username/mm3e-builder.git
cd mm3e-builder/mm3e-builder-vue
npm install
```

### Development Commands

```bash
# Start local development server
npm run dev

# Compile production bundle to dist/
npm run build

# Preview production build locally
npm run preview
```

The compiled output in `dist/` contains static HTML, CSS, and JavaScript files suitable for deployment on any static web host (Vercel, Netlify, GitHub Pages, or local web servers).

---

## Roll20 Companion Extension

The companion Chrome extension forwards dice rolls, power checks, and damage routines from this builder directly into Roll20 campaign chat.

Download link:
- [MM3e Roll20 Companion Extension (Google Drive)](https://drive.google.com/drive/folders/1tflkEmJ_PO4pA3uryxj_2uIo3ROJYfQ4?usp=sharing)

### Installation Guide

1. **Download and Extract**:
   - Download the extension files from the Google Drive link.
   - Extract the `.zip` archive into a folder on your drive (e.g., `Documents/mm3e-extension`). Do not delete this folder after installation, as Chrome loads extension files directly from this directory.

2. **Open Extensions Manager**:
   - In Google Chrome, navigate to `chrome://extensions/` in the address bar.
   - Alternatively, open Chrome settings via the top-right menu, select **Extensions**, and click **Manage Extensions**.

3. **Enable Developer Mode**:
   - Turn on the **Developer mode** toggle in the top-right corner of the Extensions page.

4. **Load the Unpacked Extension**:
   - Click the **Load unpacked** button in the top-left toolbar.
   - Select the extracted extension directory (the folder containing `manifest.json`).

5. **Verify and Pin**:
   - Verify the extension appears active in your extensions list.
   - Click the puzzle piece icon near the browser address bar and pin the extension for easy status verification.

### Usage with Roll20

1. Open your Roll20 campaign session in a Chrome tab.
2. Open the MM3e Character Builder in another tab or a separate window.
3. Click any roll button on the character sheet (ability check, skill check, attack roll, or power effect).
4. The roll result, modifiers, and calculated degrees of success or failure will appear immediately in your Roll20 game chat.

---

## Contributing

Bug reports, rule clarification PRs, and suggestions are welcome.

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/my-feature`).
3. Commit your changes (`git commit -m "Add descriptive commit message"`).
4. Push to your branch (`git push origin feature/my-feature`).
5. Open a Pull Request.

When reporting calculation bugs, please include the expected rulebook formula and the relevant page number or section from the M&M 3e Hero's Handbook.

---

## License & Legal

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

### Legal Notice & OGL

- *Mutants & Masterminds*, *M&M*, and the *D20 Hero System* are trademarks of Green Ronin Publishing, LLC.
- This software is an independent, community-created tool for tabletop roleplaying use under the Open Game License (OGL v1.0a).
- All game mechanics, rule definitions, and referenced game terms remain the intellectual property of Green Ronin Publishing.
