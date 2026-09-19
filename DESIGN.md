# Mutants & Masterminds 3e Character Builder - Design System

Based on the **Demiplane** tabletop gaming interface specification ([demiplane.com-design.md](file:///c:/Users/Caniago/Downloads/Tes/mm3e-builder-vue/demiplane.com-design.md)).

## 1. Dials & Tone
- **Dial:** `ENERGY 2 (Balanced) / RHYTHM 2 (Consistent with functional breaks) / MOTION 1 (Restrained)`
- **Reading as:** Tabletop RPG tactical character builder and interactive play sheet for Mutants & Masterminds 3e, engineered for players and Game Masters requiring immediate lookup, precise point budgeting, and fast in-combat rolls.
- **Mood:** Atmospheric superhero gaming hub: cinematic, precise, reliable, high-contrast.

## 2. Color System
The palette centers around Demiplane sapphire blue, deep atmospheric midnight, and neutral slate, supplemented by functional category accents calibrated for WCAG AA contrast.

### Core Brand Tokens
- **Primary Brand (`--color-primary`):** `#006fb8` (Saturated sapphire blue for primary interactive highlights, active tabs, and main CTAs).
- **Primary Strong (`--color-primary-strong`):** `#005a96` (Deeper sapphire for hover states).
- **Primary Soft (`--color-primary-soft`):** `#2a8fd6` (Accessible focus rings, glowing accents, and active markers).
- **Overlay & Scrim (`--color-overlay`):** `#0b1020` (Atmospheric deep midnight base).

### Theme Foundations (Dark Mode - Default Tabletop Theme)
*Operational Justification:* The fixed dark aesthetic is engineered specifically for low-light tabletop gaming rooms, reducing glare during extended 4+ hour campaign sessions and matching standard digital VTT interfaces (Roll20, Foundry, Demiplane).

- **Page Background:** `#080d1a`
- **Surface / Nav:** `rgba(11, 16, 32, 0.95)`
- **Card Background:** `#0f172a`
- **Card Content Area:** `#0b1122`
- **Border Subtle:** `rgba(255, 255, 255, 0.08)`
- **Border Card:** `rgba(255, 255, 255, 0.12)`
- **Text Primary:** `#f8fafc` (Contrast > 15:1 against card background)
- **Text Secondary:** `#94a3b8` (Contrast > 6.9:1 against card background)
- **Text Muted:** `#cbd5e1` (Contrast > 11:1 on dark base, strictly exceeding WCAG AA 4.5:1)
- **Input Placeholder:** `#94a3b8` (Contrast > 4.5:1)

### Rule Category Accents (Calibrated for WCAG AA >= 4.5:1)
- **Movement / Speed:** `#f59e0b` (Dark text: `#fbbf24`)
- **Standard Action / Attack:** `#ef4444` (Dark text: `#f87171`)
- **Free Action:** `#10b981` (Dark text: `#34d399`)
- **Reaction:** `#06b6d4` (Dark text: `#22d3ee`)
- **Combat Maneuvers:** `#8b5cf6` (Dark text: `#c4b5fd`)
- **Tactical Modifiers:** `#14b8a6` (Dark text: `#2dd4bf`)
- **Conditions / Injuries:** `#f43f5e` (Dark text: `#fb7185`)
- **Hero Points:** `#eab308` (Dark text: `#fde047`) - Narrative token reserves.
- **Powers & Devices:** `#006fb8` (Dark text: `#60a5fa`)

## 3. Typography
- **Headings & UI Action Labels:** `Barlow` (700 Bold, 600 SemiBold) - Compact, assertive superhero gaming profile.
- **Body, Subtitles & Mechanical Rules:** `Roboto` (400 Regular, 500 Medium) - Utilitarian clarity for dense rule texts.
- **Measurements, Ranks & D20 Rolls:** `Geist Mono` / `JetBrains Mono` - Tabular numerals for strict vertical alignment in stats tables and combat dice results.

## 4. Mobile Ergonomics & Accessibility
- **Minimum Tap Target:** Every interactive element (stepper buttons, rank adjustments, modal dismissals, filters) must have a touchable target of at least 44x44px (`min-width: 44px; min-height: 44px;` or touch hitbox pseudo-element).
- **Keyboard Navigation:** All modals and dialogs must close immediately on `Escape`. All interactive elements must exhibit a high-contrast focus indicator (`--color-primary-soft: #2a8fd6`).
- **Copywriting Hygiene:** No em dashes (`—`) in UI copy; use standard hyphens or colons instead.
- **Icon Integrity:** No generic AI lightning or sparkle glyphs as default icons; use contextually accurate RPG icons (shield emblems, d20 dice, combat swords).
- **Glassmorphism Restraint:** Blur effects are restricted to modal backdrops only; standard cards and headers use opaque or high-opacity matte surfaces.
- **Modal Scroll Containment & Body Scroll Lock:** All floating windows, dialogs, and modal backdrops must strictly isolate scroll chaining using CSS `overscroll-behavior: contain` and document-level scroll locking (`html.modal-open, body.modal-open { overflow: hidden !important; }`). Scrolling inside or hovering over any modal or floating window must never cause the underlying application page to scroll.
