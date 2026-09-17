# Mutants & Masterminds 3e Character Builder

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Vue 3](https://img.shields.io/badge/Vue-3.5-42b883.svg?logo=vue.js)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-339933.svg?logo=node.js)](https://nodejs.org/)

A digital character builder, tactical character sheet, and power construction workspace for the Mutants & Masterminds 3rd Edition tabletop roleplaying game (D20 Hero System).

The application runs entirely in the browser. It handles Power Point (PP) bookkeeping, validates Power Level (PL) caps, calculates attack routines and defenses, and provides one-click d20 checks with direct Roll20 integration.

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
- [Contributing](#contributing)
- [License & Legal](#license--legal)

---

## Overview

Mutants & Masterminds 3e character creation requires balancing ability scores, defense trade-offs, skill ranks, combat advantages, and customized superpowers within fixed Power Point budgets and Power Level limits.

This application automates those calculations while keeping the process transparent. It supports fractional power costs, alternate effect arrays, removable devices, equipment point budgeting, and real-time defense bonuses from equipped gear.

---

## Application Modules

### Tactical Character Sheet

The main character sheet uses a three-column tabletop layout designed for active play sessions:

- **Abilities and Defenses**: Displays the eight core ability scores alongside Dodge, Parry, Fortitude, Toughness, and Will. Defense totals account for base scores, purchased ranks, equipped armor (protection), equipped shields (active defense), and Defensive Roll bonuses.
- **Skills Table**: Complete list of M&M 3e skills with ability modifiers, purchased ranks, and total bonuses. Each skill row includes a roll button to make checks with a single click.
- **Actions and Attacks**: Automatically compiles attacks from unarmed strikes, weapons, and damaging powers into a unified combat list. Attack rolls factor in dexterity/fighting scores, specialization skills, advantage ranks (Close Attack and Ranged Attack), and weapon modifiers.
- **Vitals and Status Tracking**: Tracks bruised conditions, dazed/staggered/incapacitated statuses, and Hero Points. Includes automatic d20 reroll mechanics (+10 bonus on rolls of 1 through 10).

### Character Creation Wizard

A guided nine-step workflow for building a hero from scratch:

1. **Concept**: Define hero name, secret identity, player, origin, and select from pre-configured archetypes (Battlesuit, Speedster, Martial Artist, Mystic, Energy Controller, and others).
2. **Abilities**: Allocate points across Strength, Stamina, Agility, Dexterity, Fighting, Intellect, Awareness, and Presence.
3. **Defenses**: Purchase defense ranks while monitoring trade-off limits ($2 \times \text{PL}$ caps for Dodge/Parry + Toughness and Fortitude + Will).
4. **Skills**: Select and rank standard and custom skills at 1 PP per 2 ranks.
5. **Advantages**: Choose combat, fortune, and general advantages with categorized filters.
6. **Powers**: Assign and configure power structures within the budget.
7. **Equipment**: Buy weapons, protective gear, gadgets, vehicles, and headquarters using Equipment Points.
8. **Complications**: Set up character motivations and dramatic hooks that earn Hero Points during sessions.
9. **Review**: Full point audit and rule check before finalizing the character.

### Power Studio

A dedicated workspace for creating custom superpowers according to official M&M 3e rules:

- **Effect Database**: Supports standard effects including Damage, Affliction, Move Object, Senses, Protection, Flight, and Concealment.
- **Modifiers Engine**: Handles flat modifiers and per-rank extras/flaws. When flaws reduce the net cost per rank below 1 PP, costs calculate as fractional ranks ($1\text{ PP} / 2\text{ Ranks}$, $1\text{ PP} / 3\text{ Ranks}$, etc.).
- **Alternate Arrays**: Organize primary effects alongside standard alternate slots (+1 PP) or dynamic alternate slots (+2 PP).
- **Removable Devices**: Package powers into removable (-1 PP per 5 PP) or easily removable (-2 PP per 5 PP) items with custom device toughness.

### Equipment & Resources

- **Budget Tracking**: Converts ranks in the Equipment advantage into Equipment Points at a rate of 1 PP = 5 EP.
- **Gear Catalog**: Weapons, armor, utility gadgets, vehicles, and headquarters presets with point costs and rules descriptions.
- **Custom Equipment Studio**: Create custom gear with tailored attack bonuses, damage ranks, protection values, active defense ratings, and traits.

### Dice Mechanics & VTT Bridge

- **Cryptographic Dice Roller**: Rolls use `window.crypto.getRandomValues()` with rejection sampling to eliminate modulo bias. Each d20 face has an exact $5.0\%$ probability.
- **Degree of Success Calculator**: Compares rolls against target Difficulty Classes (DC) to report degrees of success or failure.
- **Roll20 Macro Export**: Exports ready-to-use chat macros formatted for the default Roll20 template.
- **Browser Extension Bridge**: Emits roll events that the companion Chrome extension catches and posts directly to Roll20 campaign chat.

### Storage & Portability

- **Local Storage Vault**: Saves character data locally in the browser with an undo and redo history. No user accounts or remote database connections are needed.
- **JSON Export and Import**: Save characters to disk as formatted `.json` files or restore previously exported files.
- **Link Sharing**: Compresses character state into a URL hash using LZ-String, allowing full builds to be shared via a single link.

---

## Tech Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Framework** | Vue 3.5 | Composition API with `<script setup>` single-file components |
| **Bundler** | Vite 8.3 | Production builds compiled in under 600ms with ES modules |
| **State Management** | Pinia 4 | Centralized store for hero state, rules calculations, and UI navigation |
| **Icons** | Remix Icon 4 | Vector iconography loaded via local fonts |
| **Compression** | LZ-String | URL-safe string encoding for serverless character sharing |
| **Styling** | Vanilla CSS | Custom design tokens without third-party utility CSS bloat |

---

## Project Directory Layout

```
mm3e-builder-vue/
├── index.html                  # Application HTML entry point
├── package.json                # Dependencies and project scripts
├── vite.config.js              # Vite bundler configuration
└── src/
    ├── App.vue                 # Top navigation bar, active view switcher, modal triggers
    ├── main.js                 # App initialization and extension bridge registration
    ├── components/
    │   ├── modals/             # Vault, JSON export/import, share, and Roll20 modals
    │   ├── power-studio/       # Power construction studio and effect editor canvas
    │   ├── rules/              # Reference reader modal for game rules
    │   ├── sheet/              # Interactive 3-column tactical character sheet
    │   └── wizard/             # 9-step character creation wizard
    ├── rules/
    │   ├── archetypes.js       # Pre-configured hero archetype templates
    │   ├── attacks.js          # Targeted attack routine compiler
    │   ├── complications.js    # Standard complication database
    │   ├── equipmentCalculator.js # EP budgeting and deficit calculations
    │   ├── powerEngine.js      # Core rules engine, cost logic, and effect definitions
    │   └── resources.js        # Standard equipment, weapons, vehicles, and HQ catalog
    ├── services/
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
        ├── exporters.js        # Roll20 macro template generator and JSON formatters
        └── seamlessScroll.js   # Zero-stutter scroll chaining engine for dynamic containers
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

To send rolls and power actions directly from this builder into Roll20 campaign chat:

1. Open `chrome://extensions/` in Chrome or any Chromium-based browser.
2. Turn on **Developer mode** using the toggle in the upper-right corner.
3. Click **Load unpacked** and select the extension directory (`mm3e-extension-vue`).
4. Open both your Roll20 game session and this builder in the same browser. Clicking a roll button in the builder will post the check and its degrees of success into the Roll20 chat.

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
