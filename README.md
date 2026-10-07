# Mutants & Masterminds 3e Character Builder

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Vue 3](https://img.shields.io/badge/Vue-3.5-42b883.svg?logo=vue.js)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-339933.svg?logo=node.js)](https://nodejs.org/)

A web-based character builder, tactical play sheet, and power construction workspace for Mutants & Masterminds 3rd Edition (D20 Hero System).

Live deployment: https://mm3e-builder.vercel.app/

---

## Contents

- [Overview](#overview)
- [Application Modules](#application-modules)
  - [Tactical Character Sheet](#tactical-character-sheet)
  - [Character Creation Wizard](#character-creation-wizard)
  - [Power Studio](#power-studio)
  - [Equipment & Resources](#equipment--resources)
  - [Dice Mechanics & VTT Bridge](#dice-mechanics--vtt-bridge)
  - [Storage & Portability](#storage--portability)
- [Tech Stack](#tech-stack)
- [Project Directory Layout](#project-directory-layout)
- [Getting Started](#getting-started)
  - [Requirements](#requirements)
  - [Installation](#installation)
  - [Development Commands](#development-commands)
- [Roll20 Companion Extension](#roll20-companion-extension)
  - [Chrome Installation Guide](#chrome-installation-guide)
  - [How to Use with Roll20](#how-to-use-with-roll20)
- [Contributing](#contributing)
- [License & Legal](#license--legal)

---

## Overview

Mutants & Masterminds 3e character creation requires balancing ability scores, defense trade-offs, skill ranks, combat advantages, and customized superpowers within fixed Power Point budgets and Power Level limits.

This application calculates those point totals and rules constraints directly in the browser. It handles fractional power costs, alternate effect arrays, removable devices, equipment point budgets, and real-time defense bonuses from equipped gear. All data stays local to your browser, with options to export to JSON or share builds via encoded URL hashes.

---

## Application Modules

### Tactical Character Sheet

The character sheet uses a three-column tabletop layout designed for active game sessions:

- **Abilities and Defenses**: Displays the eight core ability scores alongside Dodge, Parry, Fortitude, Toughness, and Will. Defense totals factor in base ability scores, purchased ranks, equipped armor (protection), shields (active defense), and Defensive Roll advantage bonuses.
- **Skills Table**: Complete listing of M&M 3e skills with ability modifiers, purchased ranks, and total bonuses. Each skill includes an action button to roll a d20 check directly.
- **Actions and Attacks Compiler**: Gathers unarmed attacks, weapons, and damaging powers into a unified combat roster. Attack calculations account for Dexterity or Fighting scores, skill specializations, combat advantages (Close Attack and Ranged Attack), and weapon properties.
- **Vitals and Status Tracking**: Tracks bruised damage conditions, active statuses (dazed, staggered, incapacitated), and Hero Points. Includes automated d20 reroll rules (treating rolls of 1 through 10 as 11 through 20).

### Character Creation Wizard

A guided nine-step workflow for creating a hero from concept to complete sheet:

1. **Concept**: Set character name, secret identity, player name, origin, and optionally apply pre-configured archetype templates (Battlesuit, Speedster, Martial Artist, Mystic, Energy Controller, and others).
2. **Abilities**: Distribute points across Strength, Stamina, Agility, Dexterity, Fighting, Intellect, Awareness, and Presence.
3. **Defenses**: Purchase defense ranks while monitoring trade-off caps (Dodge/Parry + Toughness <= 2 x PL; Fortitude + Will <= 2 x PL).
4. **Skills**: Select and rank standard or custom skills at 1 PP per 2 ranks.
5. **Advantages**: Choose combat, fortune, and general advantages with categorized filters.
6. **Powers**: Construct power structures within the target Power Point budget.
7. **Equipment**: Purchase weapons, armor, utility gadgets, vehicles, and headquarters using Equipment Points.
8. **Complications**: Select character motivations and dramatic hooks that earn Hero Points during play.
9. **Review**: Full point audit and rule check before finalizing the character sheet.

### Power Studio

A workspace for building custom superpowers according to M&M 3e System Reference Document (SRD) rules:

- **Effect Database**: Supports standard effects including Damage, Affliction, Move Object, Senses, Protection, Flight, and Concealment.
- **Specialized Sub-Libraries**:
  - **Concealment Library**: Multi-select sensory obscurement across Visual (single sense at 2 ranks, all visual at 4 ranks), Auditory (1 rank single, 2 ranks type), Olfactory, Radio, Mental, Exotic, or All Senses (10 ranks). Includes SRD modifiers such as Blending and Passive.
  - **Senses Library**: Categorized sensory faculties (Visual, Auditory, Mental, Tactile, Spatial) including Darkvision, Infravision, Radar, Counters Concealment, and Precognition.
  - **Comprehend Library**: Modes for understanding, speaking, and reading languages, communicating with animals or plants, interfacing with machines, speaking with spirits, and psychometry.
  - **Immunity Library**: Categorized protections covering survival hazards (disease, poison, suffocation, vacuum, starvation), biological effects, common descriptors (Fire, Cold, Electricity, Energy, Physical), and defense checks (Fortitude, Will, Lethal Damage).
  - **Movement Library**: Superhuman locomotion modes including Wall-crawling, Safe Fall, Water Walking, Dimension Travel, Permeate, Slithering, Space Travel, and Swinging.
  - **Environment Library**: Environmental hazards including extreme cold, extreme heat, movement impediments, daylight, and visibility obscurement.
  - **Affliction Builder**: Configure 1st, 2nd, and 3rd degree conditions with Fortitude or Will resistance checks, with presets for Stun, Sleep, Mind Control, Entangle, Nausea, and Terror.
- **Modifiers Engine**: Handles flat modifiers and per-rank extras and flaws. When flaws reduce the net cost per rank below 1 PP, costs calculate as fractional ranks (1 PP per 2 ranks, 1 PP per 3 ranks, etc.).
- **Alternate Arrays**: Organize primary effects alongside standard alternate slots (+1 PP) or dynamic alternate slots (+2 PP).
- **Removable Devices**: Package powers into removable (-1 PP per 5 PP) or easily removable (-2 PP per 5 PP) items with custom device toughness.

### Equipment & Resources

- **Budget Tracking**: Converts ranks in the Equipment advantage into Equipment Points at a rate of 1 PP = 5 EP.
- **Gear Catalog**: Standard weapons, protective armor, utility items, vehicles, and headquarters with point costs and rules descriptions.
- **Custom Equipment Studio**: Create custom gear with user-defined attack bonuses, damage ranks, protection values, active defense ratings, and traits.

### Dice Mechanics & VTT Bridge

- **Cryptographic Dice Roller**: Rolls use `window.crypto.getRandomValues()` with rejection sampling to eliminate modulo bias. Each d20 outcome has an exact 5.0% probability.
- **Degree of Success Calculator**: Compares attack and resistance rolls against target Difficulty Classes (DC) to calculate degrees of success or failure.
- **Roll20 Companion Extension**: Dispatches roll events that the companion Chrome extension catches and posts directly to Roll20 campaign chat.
- **Roll20 Macro Export**: Generates chat macros formatted for the default Roll20 template.
- **Embed Bridge**: Provides bidirectional iframe communication for embedding the sheet or wizard inside external tools such as GM screens.

### Storage & Portability

- **Local Storage Vault**: Saves character data in the browser with undo and redo history. No server account or external database connection is required.
- **JSON Export and Import**: Save characters to disk as formatted `.json` files or restore previously exported files.
- **Link Sharing**: Compresses character state into a URL hash using LZ-String, allowing character builds to be shared via a single link.

---

## Tech Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| Framework | Vue 3.5 | Composition API with `<script setup>` single-file components |
| Bundler | Vite 8.3 | ES module development server and static production builds |
| State Management | Pinia 4 | Centralized store for hero state, rules calculations, and UI navigation |
| Icons | Remix Icon 4 | Vector iconography loaded via local fonts |
| Compression | LZ-String | URL-safe string compression for character sharing links |
| Styling | Vanilla CSS | Custom design tokens and component-scoped stylesheets |

---

## Project Directory Layout

```
mm3e-builder-vue/
├── index.html                  # Application HTML entry point
├── package.json                # Dependencies and project scripts
├── vite.config.js              # Vite bundler configuration
├── public/                     # Static assets (SVG logo banner, icons, robots, sitemap)
└── src/
    ├── App.vue                 # Top navigation bar, active view switcher, modal triggers
    ├── main.js                 # App initialization and extension bridge registration
    ├── components/
    │   ├── modals/             # Vault, JSON export/import, share, and Roll20 modals
    │   ├── power-studio/       # Power Studio editor, array workbenches, and effect configurators
    │   ├── rules/              # Reference reader modal for game rules
    │   ├── sheet/              # Interactive 3-column tactical character sheet
    │   └── wizard/             # 9-step character creation wizard
    ├── rules/
    │   ├── abilities.js        # Core ability score definitions and cost rates
    │   ├── advantages.js       # Advantage database and prerequisites
    │   ├── archetypes.js       # Pre-configured hero archetype templates
    │   ├── attacks.js          # Targeted attack routine compiler
    │   ├── complications.js    # Standard complication database
    │   ├── conditions.js       # Status condition definitions and penalties
    │   ├── defenses.js         # Defense types and trade-off formulas
    │   ├── equipmentCalculator.js # EP budgeting and deficit calculations
    │   ├── powerEngine.js      # Core rules engine, effect sub-libraries, and cost logic
    │   ├── resources.js        # Standard equipment, weapons, vehicles, and HQ catalog
    │   └── skills.js           # Skill list, ability baselines, and trained-only flags
    ├── services/
    │   ├── embedBridge.js      # Iframe communication bridge for GM screen embeds
    │   ├── shareService.js     # Character state pruning and LZ-String link compression
    │   └── vttBridge.js        # Event dispatcher for the Roll20 Chrome extension
    ├── stores/
    │   ├── heroStore.js        # Primary reactive store (abilities, defenses, PP budget)
    │   ├── powerBuilderStore.js # Power Studio editor state and modifier tracking
    │   └── uiStore.js          # Active view tabs, toast notifications, and modal visibility
    ├── styles/
    │   ├── builder.css         # Power Studio styling
    │   ├── main.css            # Base CSS tokens, reset, typography, and utility classes
    │   ├── roll20-print.css    # Print stylesheet and Roll20 macro export preview
    │   ├── sheet.css           # Character sheet 3-column tabletop layout
    │   └── wizard.css          # Character creation wizard layout and node track
    └── utils/
        ├── diceRoller.js       # CSPRNG d20 roller with rejection sampling
        ├── dragScroll.js       # Mouse drag-to-scroll handler with momentum
        ├── exporters.js        # Roll20 macro template generator and JSON formatters
        └── seamlessScroll.js   # Momentum scrolling and modal scroll isolation handler
```

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

The compiled output in `dist/` contains static HTML, CSS, and JavaScript files suitable for deployment on any static web server or host.

---

## Roll20 Companion Extension

The companion extension connects this character builder to Roll20 tabletop sessions, forwarding dice rolls, power checks, and damage routines directly into campaign chat.

Download link:
- [MM3e Roll20 Companion Extension (Google Drive)](https://drive.google.com/drive/folders/1tflkEmJ_PO4pA3uryxj_2uIo3ROJYfQ4?usp=sharing)

### Chrome Installation Guide

1. **Download and Extract**:
   - Open the Google Drive link and download the extension files to your computer.
   - If the download is a `.zip` archive, extract it to a permanent folder on your drive (such as `Documents/mm3e-extension`). Do not delete this folder after installing, as Chrome loads extension files directly from this directory.

2. **Open Extensions Manager**:
   - In Google Chrome, enter `chrome://extensions/` in the address bar and press Enter.
   - Alternatively, open Chrome settings via the top-right three dots menu, navigate to **Extensions**, and click **Manage Extensions**.

3. **Enable Developer Mode**:
   - Turn on the **Developer mode** toggle in the top-right corner of the Extensions page.

4. **Load the Unpacked Extension**:
   - Click the **Load unpacked** button in the top-left toolbar.
   - Select the extracted extension directory (the folder containing `manifest.json`).

5. **Verify and Pin (Optional)**:
   - Ensure the extension appears active in your extensions list.
   - Click the puzzle piece icon near the browser address bar and pin the extension for easy status verification.

### How to Use with Roll20

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
