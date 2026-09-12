# Mutants & Masterminds 3E: Hero Registry & Tactical Sheet Manager

A modern, responsive, zero-dependency web application designed for character creation, power budgeting, live combat tracking, and sheet management for the *Mutants & Masterminds 3rd Edition* tabletop roleplaying game (d20 Hero System by Green Ronin Publishing).

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
  - [D&D Beyond Style 3-Tier Tactical Dashboard](#dd-beyond-style-3-tier-tactical-dashboard)
  - [Universal 1-Click D20 Dice Roller HUD](#universal-1-click-d20-dice-roller-hud)
  - [Guided Character Wizard & Archetypes](#guided-character-wizard--archetypes)
  - [Modular Power Studio Engine](#modular-power-studio-engine)
  - [Combat Tracking & Condition Simulator](#combat-tracking--condition-simulator)
  - [Equipment & Headquarters Manager](#equipment--headquarters-manager)
  - [Official Roll20 Compatibility & Print-to-PDF](#official-roll20-compatibility--print-to-pdf)
  - [Data Portability & State Management](#data-portability--state-management)
- [Architecture & Technology Stack](#architecture--technology-stack)
- [Directory Structure](#directory-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Running Locally](#running-locally)
- [Deployment](#deployment)
  - [Deploying to GitHub Pages](#deploying-to-github-pages)
- [Design Standards](#design-standards)
- [Disclaimer & Legal Notice](#disclaimer--legal-notice)

---

## Overview

The Mutants & Masterminds 3E Hero Registry modernizes tabletop superhero gaming. Built entirely on native web standards without bulky external frameworks, it pairs the deep point-buy mechanics of the d20 Hero System with the sleek, glanceable UX inspired by contemporary tabletop platforms like D&D Beyond.

The application handles real-time Power Point (PP) budgets, automated Power Level (PL) trade-off caps, modular power calculations with dynamic extras and flaws, active combat conditions, and instant one-click dice rolls.

---

## Key Features

### D&D Beyond Style 3-Tier Tactical Dashboard

- **Tier 1: Hero Identity & Combat Vitals Banner**:
  - Hero Crest avatar with dark crimson shield styling.
  - Live character fields: Hero Name, Alter Ego / Real Name, Player Name, and Base of Operations.
  - Interactive Power Level (PL) stepper with real-time budget scaling.
  - Hero Points tracker stepper (`-` / `+`) for fast in-combat tracking.
  - Dynamic Speed & Movement rate calculator (`30 ft. Normal Walk`, Flight, Speed ranks).
  - 1-Click Initiative Roll box triggering the dice roller HUD.
  - Live Power Points (PP) budget progress meter with visual alert states when over budget.

- **Tier 2: 8 Abilities Ribbon (Horizontal Dock)**:
  - Concise 8-column layout featuring all core abilities: STR, STA, AGL, DEX, FGT, INT, AWE, and PRE.
  - Large modifier values, current PP costs, rank stepper controls, and instant 1-click ability check roll buttons.

- **Tier 3: 3-Column Tactical Tabletop Grid**:
  - **Column 1 (Defenses & Senses)**:
    - Resistance checks: Dodge, Parry, Fortitude, Toughness, and Will with rank steppers and 1-click saving throw buttons.
    - Senses & Passive Perception tracker automatically factoring Awareness and active sensory powers (Darkvision, Radio Sense, etc.).
    - Quick Conditions glance overview with direct shortcut to the combat simulator.
  - **Column 2 (Skills Table with Status Pips)**:
    - Alphabetical skill roster with visual status indicators: Trained, Specialized, and Untrained.
    - Live category filtering (`All`, `Combat`, `Physical`, `Mental`, `Interaction`) and instant search.
    - Instant 1-click d20 skill rolls with bonus breakdowns.
    - Integrated Close Combat, Ranged Combat, and Expertise specialization manager with popular presets.
    - Independent scroll container bounded to maintain viewport stability.
  - **Column 3 (Tabbed Action & Content Hub)**:
    - `ACTIONS` Tab: Targeted combat profiles (Unarmed, Weapons, Powers, Custom attacks) with calculated attack bonuses, damage ranks, critical ranges, and resistance check DCs.
    - `POWERS` Tab: Modular power suites cascade with active power toggle switches, array slot selectors, and internal smooth scrolling.
    - `ADVANTAGES` Tab: Complete traits roster with instant access to the 56-choice standard advantage catalog.
    - `CONDITIONS` Tab: Full interactive conditions simulator for tracking damage states.

### Universal 1-Click D20 Dice Roller HUD

- Floating tabletop dice roller overlay appearing instantly on any roll action.
- Displays d20 dice roll, modifier bonuses, critical success alerts (Natural 20), and total result.
- Provides immediate Target DC difficulty checks and effect descriptions.
- Non-intrusive backdrop dismissal and keyboard accessibility.

### Guided Character Wizard & Archetypes

- Step-by-step guided creation workflow for new players and quick NPC generation.
- Built-in superhero archetype presets: Battlesuit, Speedster, Mystic, Paragon, Martial Artist, Crime Fighter, and more.
- Guided ability point distribution, advantage selection, and power suite scaffolding.

### Modular Power Studio Engine

- Comprehensive implementation of the Mutants & Masterminds 3rd Edition effect system.
- Real-time cost calculations:
  - Base effect ranks, action types (Standard, Move, Free, Reaction), ranges (Close, Ranged, Perception), and durations (Instant, Sustained, Continuous, Permanent).
  - Extras (+1 to +5 PP/rank or flat modifiers).
  - Flaws (-1 to -5 PP/rank) with fractional cost handling down to rule minimums (e.g., 1 PP per 2 ranks).
  - Flat Feats and Drawbacks.
  - Dynamic Arrays and Alternative Effects (1 PP alternate power rules).

### Combat Tracking & Condition Simulator

- Full support for cumulative damage conditions: Bruised, Dazed, Staggered, and Incapacitated.
- Combined conditions simulator: Blind, Deaf, Exhausted, Fatigued, Bound, Defenseless, Paralyzed, Prone, Restrained, Stunned, Surprised, and Vulnerable.
- Real-time combat penalty propagation to active defenses and checks.

### Equipment & Headquarters Manager

- Dedicated inventory system for Gear, Gadgets, Combat Vehicles, and Headquarters.
- Equipment Point (EP) budget tracker linked directly to Equipment advantage ranks (1 PP = 5 EP).
- One-click advantage synchronization to balance purchased ranks with equipment loadout.

### Official Roll20 Compatibility & Print-to-PDF

- **Roll20 Sheet Preview**: In-app modal replicating the exact visual layout, typography, and structure of the official Roll20 M&M 3E character sheet.
- **Vector Print Engine**: High-fidelity `@media print` rules optimized for Letter and A4 portrait layouts, generating crisp PDF character sheets ready for physical table sessions.

### Data Portability & State Management

- **1-Click Compressed URL Sharing (Serverless)**: Generate compact, permanent share links using native browser `CompressionStream('deflate-raw')` and Base64URL slugs (~200 - 450 bytes) in URL hash tags (`#hero=...`). Zero backend, zero database, zero external dependencies, 100% compatible with GitHub Pages.
- Reactive Local Storage: Automatic persistence across browser sessions.
- Full History Stack: Undo (`Ctrl+Z`) and Redo (`Ctrl+Y` / `Ctrl+Shift+Z`) state tracking via keyboard shortcuts and slide-out menu drawer.
- Profile Export & Import: Complete character save files in human-readable JSON format.

---

## Architecture & Technology Stack

The application strictly adheres to a zero-dependency, vanilla web architecture for lightning-fast loads, zero build friction, and long-term durability:

- **Structure**: Semantic HTML5 with accessible landmarks and ARIA attributes.
- **Styling**: Vanilla CSS3 using custom properties, CSS Grid, Flexbox, glassmorphism backdrops, and dedicated print stylesheets.
- **Logic**: Native ECMAScript Modules (ESM).
- **State Pattern**: Centralized reactive Store (`js/state.js`) using an Observer pattern and immutable snapshots.
- **Typography**: Inter (Google Fonts) with tabular numeral formatting (`tnum`) for number stability.
- **Icons**: Remix Icon library.

---

## Directory Structure

```text
mm3e-builder/
├── assets/                  # Static assets and graphic resources
│   └── roll20/              # Roll20 sheet textures, icons, and badges
├── css/
│   ├── main.css             # Design tokens, typography, header, drawer, and global resets
│   ├── sheet.css            # D&D Beyond-style 3-Tier dashboard and tactical grid
│   ├── builder.css          # Modular Power Studio and effects cascade styling
│   ├── wizard.css           # Step-by-step guided character wizard styles
│   └── roll20-print.css     # Official Roll20 preview and print-to-PDF stylesheets
├── js/
│   ├── app.js               # Application bootstrap, navigation, and view coordinator
│   ├── state.js             # Central character state, PP calculations, and history stack
│   ├── components/
│   │   ├── advantageModal.js    # Advantage selection and customization modal (56 choices)
│   │   ├── conditionsTracker.js # Combat conditions simulator and status tracker
│   │   ├── notifications.js     # Toast notifications and confirmation dialogs
│   │   ├── powerBuilder.js      # Interactive Modular Power Studio and modifier builder
│   │   ├── quickDiceRoller.js   # Universal 1-Click D20 Dice Roller HUD with critical hit checks
│   │   ├── references.js        # Rulebook quick-reference tables and measures chart
│   │   ├── resourceModal.js     # Equipment, vehicles, and headquarters manager
│   │   ├── roll20Print.js       # Roll20 sheet generator and print controller
│   │   ├── shareModal.js        # 1-Click compressed share URL modal and clipboard exporter
│   │   ├── skillModal.js        # Skill specialization and rank editor
│   │   ├── targetedEffects.js   # Combat attack profiles and offensive effect manager
│   │   └── wizard/
│   │       ├── stepAbilities.js # Guided ability point allocation step
│   │       └── wizardController.js # Step-by-step wizard state machine and templates
│   ├── rules/
│   │   ├── abilities.js         # Core ability constants and abbreviations
│   │   ├── advantages.js        # Advantage library and metadata
│   │   ├── archetypes.js        # Pre-built superhero archetype templates
│   │   ├── conditions.js        # Standard and combined condition rules
│   │   ├── defenses.js          # Defense metrics and base ability links
│   │   ├── powerEngine.js       # D20 Hero System power calculation formulas and modifiers
│   │   ├── powers.js            # Unified power engine export interface
│   │   ├── resources.js         # Standard equipment and vehicle presets
│   │   └── skills.js            # Standard skill definitions and associated abilities
│   └── storage/
│       ├── exportImport.js      # Character JSON profile serialization and file transfer
│       └── shareUrl.js          # Native stream compression and Base64URL hash codecs
├── index.html               # Main single-page application entrypoint
├── serve.js                 # Zero-dependency local development server (Node.js)
└── README.md                # Project documentation
```

---

## Getting Started

### Prerequisites

- Any modern web browser with ES Module support (Chrome, Firefox, Safari, Edge).
- Node.js (version 18.x or newer) is optional, used solely for running the local development server.

### Running Locally

#### Method 1: Using the Built-In Node.js Server
Clone or download the repository, navigate to the project directory, and launch the local server:

```bash
node serve.js
```

Open your browser and navigate to:
```text
http://localhost:8080
```

#### Method 2: Using Any Static HTTP Server
Serve the directory with any standard static file server:

```bash
# Using npx serve
npx serve .

# Using Python 3
python -m http.server 8080
```

#### Method 3: Direct File Access
Because the project uses ES Modules (`import` / `export`), opening `index.html` directly via the `file://` protocol may trigger browser CORS restrictions. Serving through a local HTTP server or VS Code Live Server is recommended.

---

## Deployment

### Deploying to GitHub Pages

Because the project requires no build or compilation step, it can be deployed directly to GitHub Pages:

1. Commit your files to Git:
   ```bash
   git add .
   git commit -m "Deploy Mutants & Masterminds 3E Hero Registry"
   ```
2. Push to your GitHub repository:
   ```bash
   git push origin main
   ```
3. Enable GitHub Pages:
   - In your GitHub repository, open **Settings** > **Pages**.
   - Under **Build and deployment** > **Source**, select **Deploy from a branch**.
   - Select the `main` branch and `/ (root)` folder, then click **Save**.
4. The application will be published at `https://<your-username>.github.io/<your-repo-name>/`.

---

## Design Standards

The user interface follows strict design craftsmanship principles:
- **Unified Tabletop Crimson Theme**: Consistent primary accents (`#dc2626` / `#b91c1c` / `#ef4444`) tailored for a heroic tabletop atmosphere.
- **High-Contrast Readability**: WCAG AA compliant contrast across all cards, badges, and inputs.
- **Reduced Motion Support**: Complete `@media (prefers-reduced-motion: reduce)` guardrails.
- **Zero AI Slop**: Free of purple gradient clichés, unstyled placeholders, and automated filler text.

---

## Disclaimer & Legal Notice

This software is an unofficial, fan-created utility tool intended for personal tabletop gaming use.

- *Mutants & Masterminds*, the *d20 Hero System*, and associated trademarks are copyright of Green Ronin Publishing, LLC.
- Game rules, system mechanics, and terminology referenced herein are utilized under the terms of the Open Game License (OGL v1.0a).