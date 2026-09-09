# Mutants & Masterminds 3E Character Builder & Sheet Manager

A modern, responsive, zero-dependency web application designed for character creation, power budgeting, and sheet management for the *Mutants & Masterminds 3rd Edition* tabletop roleplaying game (d20 Hero System by Green Ronin Publishing).

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
  - [Character Management & Rule Validation](#character-management--rule-validation)
  - [Modular Power Builder](#modular-power-builder)
  - [Equipment & Resource Tracking](#equipment--resource-tracking)
  - [Official Roll20 Compatibility & Print-to-PDF](#official-roll20-compatibility--print-to-pdf)
  - [Combat Tracking & Reference Library](#combat-tracking--reference-library)
  - [Data Portability & State Management](#data-portability--state-management)
- [Architecture & Technology Stack](#architecture--technology-stack)
- [Directory Structure](#directory-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Running Locally](#running-locally)
- [Deployment](#deployment)
  - [Deploying to GitHub Pages](#deploying-to-github-pages)
- [Disclaimer & Legal Notice](#disclaimer--legal-notice)

---

## Overview

The M&M 3E Character Builder simplifies the complex math of character creation in *Mutants & Masterminds 3rd Edition*. Built entirely on modern native web standards, it handles real-time Power Point (PP) calculations, Power Level (PL) trade-off cap validations, equipment budgets, and conditional modifiers without requiring external frameworks or compilation pipelines.

---

## Key Features

### Character Management & Rule Validation
- Full support for the 8 core abilities: Strength, Stamina, Agility, Dexterity, Fighting, Intellect, Awareness, and Presence.
- Dynamic Defense calculation: Dodge, Parry, Fortitude, Toughness, and Will, automatically accounting for base abilities, purchased defense ranks, and active modifiers.
- Power Level Cap Enforcement: Automated trade-off validation for standard rule limits:
  - Dodge + Toughness <= 2 x PL
  - Parry + Toughness <= 2 x PL
  - Fortitude + Will <= 2 x PL
  - Attack Bonus + Effect Rank <= 2 x PL
- Non-blocking visual alerts when character metrics exceed power level guidelines.

### Modular Power Builder
- Interactive Power Builder with support for standard M&M 3E effect types, descriptors, ranges, and action types.
- Modifiers Engine:
  - Extras: Adjust cost per rank (+1 to +5 PP/rank) or flat cost bonuses.
  - Flaws: Reduce cost per rank (-1 to -5 PP/rank) with support for fractional costs (e.g., 1 PP per 2 ranks) down to rule minimums.
  - Flat Modifiers: Dynamic flat cost adjustments for power feats and minor drawbacks.
- Real-time total point calculation with automated cost breakdown.

### Equipment & Resource Tracking
- Dedicated inventory and equipment ledger categorized by Gear, Gadgets, Combat Vehicles, and Headquarters.
- Equipment Point (EP) budget tracker linked directly to the character's Equipment advantage ranks (1 PP = 5 EP).
- One-click advantage synchronization to automatically adjust the Equipment advantage rank to cover current inventory EP.

### Official Roll20 Compatibility & Print-to-PDF
- Roll20 Sheet Preview: In-app modal viewer replicating the exact visual hierarchy, fonts, and layout of the official Roll20 Mutants & Masterminds 3E character sheet.
- High-Fidelity Print Engine: Custom `@media print` CSS rules formatted specifically for standard Letter and A4 portrait layouts, outputting vector-sharp PDF character sheets ready for tabletop play.

### Combat Tracking & Reference Library
- Targeted Combat Effects: Manage standard melee attacks, ranged attacks, and custom power attacks with calculated attack bonuses, damage ranks, critical ranges, and resistance defenses.
- Condition Tracker: Live tracking of cumulative damage conditions (Bruised, Dazed, Staggered, Incapacitated) and status penalties.
- Reference Manual: Integrated tables for Action Types (Standard, Move, Free, Reaction), Condition definitions, and the Rank & Measures chart.

### Data Portability & State Management
- Reactive Local Storage: Changes persist automatically in browser storage across page reloads.
- Full Undo / Redo Stack: Step-by-step history management via toolbar controls or keyboard shortcuts (`Ctrl+Z`, `Ctrl+Shift+Z`).
- Profile Export & Import: Complete character save files in human-readable JSON.
- Spreadsheet Export: Tabular export to CSV / Excel format.

---

## Architecture & Technology Stack

The application adheres to a zero-dependency, vanilla web architecture for optimal performance, instant load times, and long-term maintainability.

- **Markup**: Semantic HTML5 with accessible structures.
- **Styling**: Vanilla CSS3 utilizing Custom Properties (CSS variables), CSS Grid, Flexbox, glassmorphism filters, and dedicated print stylesheets.
- **Client Logic**: Modular JavaScript (ECMAScript 2022+ ES Modules).
- **State Pattern**: Centralized reactive Store (`js/state.js`) implementing an Observer pattern with an immutable history stack.
- **Icons**: Remix Icon CDN.
- **Typography**: Inter font family (Google Fonts CDN) with tabular numerals enabled for layout stability.

---

## Directory Structure

```text
mm3e-builder/
├── assets/                  # Static assets and graphic resources
├── css/
│   ├── main.css             # Base variables, layout, typography, and menubar
│   ├── sheet.css            # Character sheet components, cards, tables, and modals
│   └── roll20-print.css     # Official Roll20 preview and print-to-PDF styles
├── js/
│   ├── app.js               # Application bootstrap, navigation, and view coordinator
│   ├── state.js             # Central character state, PP calculations, and history stack
│   ├── components/
│   │   ├── advantageModal.js    # Advantage selection and customization modal
│   │   ├── conditionsTracker.js # Combat conditions state tracker
│   │   ├── notifications.js     # Toast notifications and confirmation dialogs
│   │   ├── powerBuilder.js      # Interactive power and modifier builder
│   │   ├── references.js        # Rulebook quick-reference tables
│   │   ├── resourceModal.js     # Equipment, vehicles, and headquarters manager
│   │   ├── roll20Print.js       # Roll20 sheet generator and print controller
│   │   ├── skillModal.js        # Skill specialization and rank editor
│   │   └── targetedEffects.js   # Attack and offensive effect manager
│   ├── rules/
│   │   ├── abilities.js         # Core ability constants and abbreviations
│   │   ├── advantages.js        # Advantage library and metadata
│   │   ├── defenses.js          # Defense metrics and base ability links
│   │   ├── powers.js            # Power calculation formulas and modifier tables
│   │   ├── resources.js         # Standard equipment and vehicle presets
│   │   └── skills.js            # Standard skill definitions and associated abilities
│   └── storage/
│       └── exportImport.js      # JSON and CSV serialization / deserialization
├── index.html               # Main single-page application entrypoint
├── serve.js                 # Zero-dependency local development server (Node.js)
└── README.md                # Project documentation
```

---

## Getting Started

### Prerequisites
- Any modern web browser supporting ES Modules (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari).
- Node.js (version 18.x or newer) is optional, used only for running the included local development server.

### Running Locally

#### Method 1: Using the Built-In Node.js Server
Clone or download the repository, navigate to the project directory, and start the static server:

```bash
node serve.js
```

Open your browser and navigate to:
```text
http://localhost:8080
```

#### Method 2: Using Any Static HTTP Server
You can serve the directory using any static file server:

```bash
# Using npx serve
npx serve .

# Using Python 3
python -m http.server 8080
```

#### Method 3: Direct File Access
Because the project uses ES Modules (`import` / `export`), opening `index.html` directly via the `file://` protocol may trigger browser CORS restrictions. Running through a local HTTP server or a browser extension like VS Code Live Server is recommended.

---

## Deployment

### Deploying to GitHub Pages

Because the project requires no compilation step, it can be hosted directly on GitHub Pages:

1. Initialize a Git repository (if not already initialized) and commit your files:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of M&M 3E Character Builder"
   ```
2. Create a new repository on GitHub and link the remote:
   ```bash
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git branch -M main
   git push -u origin main
   ```
3. Enable GitHub Pages:
   - Go to your repository settings on GitHub (**Settings** > **Pages**).
   - Under **Build and deployment** > **Source**, select **Deploy from a branch**.
   - Choose the `main` branch and `/ (root)` folder, then click **Save**.
4. The site will be live at `https://<your-username>.github.io/<your-repo-name>/`.

---

## Disclaimer & Legal Notice

This software is an unofficial, fan-created utility tool intended for personal tabletop gaming use.

- *Mutants & Masterminds*, the *d20 Hero System*, and associated trademarks are copyright of Green Ronin Publishing, LLC.
- Game rules, system mechanics, and terminology referenced herein are utilized under the terms of the Open Game License (OGL v1.0a).