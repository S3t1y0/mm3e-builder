# Mutants & Masterminds 3e Character Builder

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Vue 3](https://img.shields.io/badge/Vue-3.5-42b883.svg?logo=vue.js)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-339933.svg?logo=node.js)](https://nodejs.org/)

A web-based character builder, interactive sheet, and power constructor for the **Mutants & Masterminds 3rd Edition** tabletop roleplaying game (D20 Hero System).

Designed for both players and Game Masters, this tool provides real-time Power Point (PP) calculation, rule validation according to Power Level (PL) caps, an interactive character sheet with one-click dice rolling, and direct integration with Roll20.

---

## Table of Contents

- [Features](#features)
  - [Character Creation Wizard](#character-creation-wizard)
  - [Interactive Character Sheet](#interactive-character-sheet)
  - [Dynamic Advantage Engine](#dynamic-advantage-engine)
  - [Power Studio](#power-studio)
  - [Equipment & Vehicles](#equipment--vehicles)
  - [Roll20 & VTT Integration](#roll20--vtt-integration)
  - [Data Portability & Sharing](#data-portability--sharing)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Development & Build Scripts](#development--build-scripts)
- [Companion Chrome Extension](#companion-chrome-extension)
- [Contributing](#contributing)
- [License & Legal](#license--legal)

---

## Features

### Character Creation Wizard
- **Guided Step-by-Step Workflow**: Set up character identity, abilities, defenses, skills, advantages, powers, equipment, and complications in an organized sequence.
- **Power Level Cap Enforcement**: Automatically checks trade-offs and limits for Attack + Effect rank and Active Defense + Toughness against standard PL caps ($2 \times \text{PL}$).
- **Instant Archetypes**: Includes pre-configured archetype presets (Battlesuit, Speedster, Martial Artist, Mystic, Energy Controller, and more) for quick-start sessions.

### Interactive Character Sheet
- **Three-Column Dashboard**: View vitals, combat actions, abilities, defenses, skills, and full powers list in a structured tabletop view.
- **One-Click Dice Rolling**: Roll ability checks, skill checks, defense saves, and attacks directly from the interface with all modifiers pre-calculated.
- **Cryptographic Randomness**: D20 dice rolls use the browser's native `crypto.getRandomValues()` with rejection sampling to eliminate modulo bias, ensuring fair, uniform probability ($5.0\%$ per face).
- **Combat Vitals Tracker**: Live tracking for conditions (Bruised, Dazed, Staggered, Incapacitated), injury counters, and Hero Point rerolls (adding $+10$ on rolls of 1–10).

### Dynamic Advantage Engine
Advantages directly affect character statistics and calculations:
- `Close Attack` & `Ranged Attack`: Add accurate bonus ranks to combat skills and targeted attack routines.
- `Defensive Roll`: Adds active Toughness defense bonus.
- `Improved Initiative`: Updates initiative check modifiers.
- `Throwing Mastery`: Adds damage ranks to thrown attacks.
- `Improved Critical`: Expands critical threat ranges (19–20, 18–20) on attacks.

### Power Studio
- **Full Effect Library**: Comprehensive database of M&M 3e effects (Damage, Affliction, Move Object, Senses, Protection, Flight, Concealment, etc.).
- **Extras & Flaws**: Apply standard and custom modifiers with automatic cost adjustments (flat point modifications and per-rank fractional calculations down to $1/\text{Rank}$).
- **Alternate Effects (Arrays)**: Create primary power arrays with alternate and dynamic slots.
- **Device Containers**: Build equipment-based powers with removable or easily removable flaws, dedicated device toughness, and bundled sub-powers.

### Equipment & Vehicles
- **Equipment Points (EP) Accounting**: Automatic budget tracking based on the character's *Equipment* advantage rank ($5 \times \text{Rank}$).
- **Categories**: Manage weapons, protective gear, tactical gadgets, vehicles, and headquarters with detailed features.

### Roll20 & VTT Integration
- **Macro Exporter**: Generate ready-to-use Roll20 default chat template macros for initiative, checks, saves, and attacks.
- **VTT Bridge**: Dispatches roll events to the companion browser extension to automatically post rolls and formatted cards straight into Roll20 campaign chat.

### Data Portability & Sharing
- **Offline First**: All data is saved in local browser storage—no accounts or database connection required.
- **JSON Import / Export**: Save and backup characters as standard `.json` files.
- **Shareable URLs**: Compress and encode character builds into URL hashes using LZ-String compression for sharing builds via links.

---

## Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | [Vue 3](https://vuejs.org/) | Modern Composition API with `<script setup>` SFCs |
| **Build Tool** | [Vite 8](https://vitejs.dev/) | Development server with instant HMR and optimized production build |
| **State** | [Pinia 4](https://pinia.vuejs.org/) | Centralized reactive store for character data, history, and UI state |
| **Icons** | [Remix Icon 4](https://remixicon.com/) | Consistent open-source iconography |
| **Compression** | [LZ-String](https://github.com/pieroxy/lz-string) | URL-safe string compression for character link sharing |
| **Styling** | Vanilla CSS | Custom responsive layout with CSS variables and design tokens |

---

## Project Structure

```
mm3e-builder/
├── index.html                  # Application entry HTML
├── package.json                # Project dependencies and npm scripts
├── vite.config.js              # Vite bundler configuration
└── src/
    ├── App.vue                 # Top navigation and active view switcher
    ├── main.js                 # Application bootstrap and plugin registration
    ├── components/
    │   ├── modals/             # Condition picker, export/import, and share modals
    │   ├── power-studio/       # Power builder, effect editors, and modifier inspector
    │   ├── sheet/              # Character sheet, vitals header, abilities ribbon, attack list
    │   └── wizard/             # 7-step character creation wizard
    ├── rules/
    │   ├── archetypes.js       # Predefined hero archetypes
    │   ├── attacks.js          # Combat calculations and targeted attacks compiler
    │   ├── complications.js    # Character complication catalog
    │   ├── powerEngine.js      # Core rules engine, cost calculator, and effect database
    │   └── resources.js        # Equipment, weapons, vehicles, and headquarters catalog
    ├── services/
    │   └── vttBridge.js        # Window dispatch bridge for the companion Chrome extension
    ├── stores/
    │   ├── heroStore.js        # Character state, actions, undo/redo history, and rolls
    │   └── uiStore.js          # Navigation, modal visibility, and toast notifications
    ├── styles/
    │   ├── builder.css         # Power Studio styling
    │   ├── main.css            # Base tokens, reset, typography, and utility classes
    │   ├── roll20-print.css    # Print stylesheet and Roll20 macro export styles
    │   ├── sheet.css           # Character sheet layout and card components
    │   └── wizard.css          # Creation wizard step styling
    └── utils/
        ├── diceRoller.js       # CSPRNG dice roller with rejection sampling
        └── exporters.js        # Roll20 macro text generators and JSON export helpers
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) version 18.0.0 or higher
- `npm` (bundled with Node.js)

### Installation

Clone the repository and install dependencies:

```bash
# Clone the repository
git clone https://github.com/your-username/mm3e-builder.git

# Enter project directory
cd mm3e-builder

# Install dependencies
npm install
```

### Development & Build Scripts

```bash
# Start local development server with Hot Module Replacement (HMR)
npm run dev

# Compile and minify for production deployment
npm run build

# Preview production build locally
npm run preview
```

The production output will be generated in the `dist/` directory, ready to be deployed to any static web hosting service (such as GitHub Pages, Cloudflare Pages, Vercel, or Netlify).

---

## Companion Chrome Extension

For direct integration with **Roll20**, a companion Chrome extension is available in the `mm3e-extension-vue` directory. 

When installed, the extension automatically listens for dice rolls and power activations from this builder and posts them directly into your active Roll20 campaign chat with custom formatting.

To load the extension in Chrome / Chromium:
1. Open `chrome://extensions/` in your browser.
2. Enable **Developer mode** in the top-right corner.
3. Click **Load unpacked** and select the `mm3e-extension-vue` folder.

---

## Contributing

Contributions, bug reports, and suggestions are welcome!

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/my-feature`).
3. Commit your changes (`git commit -m "Add new feature"`).
4. Push to the branch (`git push origin feature/my-feature`).
5. Open a Pull Request.

If you find a bug or rule calculation discrepancy, please open an issue describing the expected rulebook outcome versus the actual result.

---

## License & Legal

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

### Disclaimer & Open Game License
- *Mutants & Masterminds*, *M&M*, and the *D20 Hero System* are trademarks of **Green Ronin Publishing, LLC**.
- This software is an independent, community-created tool for personal and tabletop gaming use under the Open Game License (OGL v1.0a).
- No copyright infringement is intended. All game mechanics, rule definitions, and referenced game terms remain the intellectual property of their respective copyright holders.
