# Graph Report - mm3e-builder-vue  (2026-10-10)

## Corpus Check
- 77 files · ~610,391 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 11 file(s) not represented in the graph (top: .css 6, (none) 2, .ico 1)

## Summary
- 1163 nodes · 1949 edges · 68 communities (65 shown, 3 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 16 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1e2da815`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- EffectConfigurator.vue
- PowersDeck.vue
- exporters.js
- StepEquipment.vue
- CustomEquipmentModal.vue
- ModifierInspectorModal.vue
- SkillsTable.vue
- StepAdvantages.vue
- DiceRollHud.vue
- EquipmentWorkshop.vue
- ExportImportModal.vue
- StepSkills.vue
- AdvantageLibraryModal.vue
- powerEngine.js
- Mutants & Masterminds 3e Character Builder
- updateConfig
- ComplicationsHub.vue
- CharacterWizard.vue
- App.vue
- CostBreakdownSidebar.vue
- AdvantagesList.vue
- StepComplications.vue
- equipmentCalculator.js
- EffectEditorCanvas.vue
- PowerStudioWorkspace.vue
- TargetedAttacksList.vue
- Anti-Slop Audit Report (Siklus 2): MM3E Character Builder
- GreenRoninSheet.vue
- heroStore.js
- vue
- HeroHeader.vue
- ConditionsTracker.vue
- Roll20PrintModal.vue
- seamlessScroll.js
- ConditionPickerModal.vue
- EffectsLibraryModal.vue
- DefensesBlock.vue
- StepDefenses.vue
- usePowerBuilderStore
- TabbedActionHub.vue
- package.json
- main.js
- CompoundPowerStudio.vue
- RulesReference.vue
- CombatInitiativeCard.vue
- Mutants & Masterminds 3e Character Builder - Design System
- DeviceContainerStudio.vue
- SubPowerArrayWorkbench.vue
- isMotivation
- useHeroStore
- advantages.js
- regenerateDescription
- AbilitiesMatrix.vue
- StepConcept.vue
- initDragScroll
- dependencies
- scripts
- saveEquipmentItem
- getDegreeCondition
- complications.js
- defenses.js
- vercel.json
- devDependencies
- addAdvantage
- onVehicleSizeChange
- abilities.js
- saveCustomSubItem
- editCustomSubItem

## God Nodes (most connected - your core abstractions)
1. `useHeroStore` - 44 edges
2. `vue` - 43 edges
3. `useUiStore` - 30 edges
4. `calculateEffectCost()` - 29 edges
5. `updateConfig()` - 27 edges
6. `calculatePowerTotalCost()` - 19 edges
7. `usePowerBuilderStore` - 17 edges
8. `isMotivation()` - 14 edges
9. `sendFeatureToVTT()` - 14 edges
10. `broadcastPower()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `getSubEffectCost()` --calls--> `calculateEffectCost()`  [EXTRACTED]
  src/components/power-studio/CompoundPowerStudio.vue → src/rules/powerEngine.js
- `activeEffCost` --calls--> `calculateEffectCost()`  [EXTRACTED]
  src/components/power-studio/CostBreakdownSidebar.vue → src/rules/powerEngine.js
- `getSubPowerCost()` --calls--> `calculateEffectCost()`  [EXTRACTED]
  src/components/power-studio/DeviceContainerStudio.vue → src/rules/powerEngine.js
- `ensureInitialized()` --calls--> `normalizeEffect()`  [EXTRACTED]
  src/components/power-studio/EffectConfigurator.vue → src/rules/powerEngine.js
- `arrayCapacity` --calls--> `calculateEffectCost()`  [EXTRACTED]
  src/components/power-studio/SubPowerArrayWorkbench.vue → src/rules/powerEngine.js

## Import Cycles
- None detected.

## Communities (68 total, 3 thin omitted)

### Community 0 - "EffectConfigurator.vue"
Cohesion: 0.03
Nodes (53): afflictionResistanceOptions, allComprehendModes, allEnvironmentElements, allMovementModes, altResistanceMod, AVAILABLE_CUSTOM_ICONS, calculatedBaseCostDisplay, cfg (+45 more)

### Community 1 - "PowersDeck.vue"
Cohesion: 0.07
Nodes (35): broadcastComplication(), exportRoll20(), activeCompoundTabs, activeDeviceTabs, broadcastEffect(), broadcastExtra(), broadcastFlaw(), broadcastPower() (+27 more)

### Community 2 - "exporters.js"
Cohesion: 0.08
Nodes (34): lz-string, loadFromHash(), activeTextContent, copied, heroStore, textFormat, uiStore, macrosList (+26 more)

### Community 3 - "StepEquipment.vue"
Cohesion: 0.07
Nodes (32): getCalculatedAtkBonus(), activeFilter, budgetInfo, customStudioCategory, filteredPresets, filteredResources, getCategoryCount(), getResIconClass() (+24 more)

### Community 4 - "CustomEquipmentModal.vue"
Cohesion: 0.05
Nodes (22): armorConfig, budgetInfo, calculatedTotalCost, categoryCards, currentStep, customDescription, gadgetConfig, getHQBaseTough() (+14 more)

### Community 5 - "ModifierInspectorModal.vue"
Cohesion: 0.07
Nodes (29): activeCategory, activeTab, baseCatalog, builderStore, calculatedExtrasPerRank, calculatedFlawsPerRank, categories, compatibleCount (+21 more)

### Community 6 - "SkillsTable.vue"
Cohesion: 0.07
Nodes (24): activeCategory, calculateTotalBonus(), categories, currentSelectedAbility, filteredRuleSkills, getAdvantageBonusForSkill(), getAdvantageNameForSkill(), getEnhancedRanks() (+16 more)

### Community 7 - "StepAdvantages.vue"
Cohesion: 0.07
Nodes (25): activeCategory, activeCategoryBreakdown, activeSpecAdv, addAdvantage(), catalogScrollRef, confirmAddWithSpec(), confirmCreateCustomAdv(), customForm (+17 more)

### Community 8 - "DiceRollHud.vue"
Cohesion: 0.08
Nodes (21): dismissRoll(), displayD20, heroPointsCount, heroStore, isHistoryOpen, isHovered, isRolling, progressPercent (+13 more)

### Community 9 - "EquipmentWorkshop.vue"
Cohesion: 0.09
Nodes (19): activeFilter, budgetInfo, customStudioCategory, filteredPresets, filteredResources, getCategoryCount(), getResIconClass(), getSubtypeLabel() (+11 more)

### Community 10 - "ExportImportModal.vue"
Cohesion: 0.08
Nodes (19): activeMode, copied, exportJsonString, exportSizeKb, fileInputRef, formattedLastSaved, handleDownload(), handleExportSlot() (+11 more)

### Community 11 - "StepSkills.vue"
Cohesion: 0.09
Nodes (22): activeCategory, calculateTotalBonus(), categories, filteredSkills, focusInputRef, getAdvantageBonusForSkill(), getAdvantageNameForSkill(), getEnhancedRanks() (+14 more)

### Community 12 - "AdvantageLibraryModal.vue"
Cohesion: 0.08
Nodes (15): activeCategory, activeSpecAdv, customForm, filteredAdvantages, gridRef, heroStore, searchInputRef, searchQuery (+7 more)

### Community 13 - "powerEngine.js"
Cohesion: 0.20
Nodes (21): BASE_EFFECT_ICONS, calculatePowerCombatMetrics(), calculatePowerDetailedBreakdown(), COMMON_LINKED_COMBOS, CONFIGURABLE_EFFECTS, createAlternateSlotFromEffect(), createEmptyCompoundEffect(), createEmptyDeviceSubPower() (+13 more)

### Community 14 - "Mutants & Masterminds 3e Character Builder"
Cohesion: 0.09
Nodes (22): Application Modules, Character Creation Wizard, Chrome Installation Guide, Contents, Contributing, Development Commands, Dice Mechanics & VTT Bridge, Equipment & Resources (+14 more)

### Community 15 - "updateConfig"
Cohesion: 0.09
Nodes (23): applyAfflictionPreset(), applyTraitPreset(), deleteCustomSubItem(), deleteCustomTrait(), selectAfflictionResistance(), selectMorphScope(), selectNullifyDescriptor(), selectTraitCategory() (+15 more)

### Community 16 - "ComplicationsHub.vue"
Cohesion: 0.09
Nodes (14): activeCatalogPresets, allComplications, editingId, formDesc, formKind, formName, formType, generalComplications (+6 more)

### Community 17 - "CharacterWizard.vue"
Cohesion: 0.15
Nodes (20): activeStepComponent, activeStepInfo, currentStep, finishWizard(), heroStore, steps, uiStore, finishWizard() (+12 more)

### Community 18 - "App.vue"
Cohesion: 0.12
Nodes (13): builderStore, heroStore, isEmbed, isToolsOpen, runtimeError, toolsDropdownRef, uiStore, uiStore (+5 more)

### Community 19 - "CostBreakdownSidebar.vue"
Cohesion: 0.10
Nodes (19): activeEffCost, builderStore, combatProfile, heroStore, isEditingExisting, isOverBudget, originalPowerCost, powerCostDelta (+11 more)

### Community 20 - "AdvantagesList.vue"
Cohesion: 0.13
Nodes (16): availableCategories, broadcastAdvantage(), editForm, editingAdv, effectiveAdvantages, filteredAdvantages, getAdvCategory(), getAdvDesc() (+8 more)

### Community 21 - "StepComplications.vue"
Cohesion: 0.09
Nodes (14): complicationCategories, editingId, generalComplications, heroStore, modalMode, motivations, narrativeStatus, newCompDesc (+6 more)

### Community 22 - "equipmentCalculator.js"
Cohesion: 0.16
Nodes (17): costBreakdown, ARMOR_EXTRAS, calculateArmorCost(), calculateGadgetCost(), calculateHQCost(), calculateTotalEquipmentCost(), calculateVehicleCost(), calculateWeaponCost() (+9 more)

### Community 23 - "EffectEditorCanvas.vue"
Cohesion: 0.11
Nodes (10): builderStore, currentBaseInfo, currentHeaderName, currentSlotRef, effectCategories, heroStore, isCompoundSlot, props (+2 more)

### Community 24 - "PowerStudioWorkspace.vue"
Cohesion: 0.13
Nodes (14): calculatedTotalPPDisplay, effectCost, netEffectCost, builderStore, canvasKey, canvasTitle, currentPowerSelectValue, getSlotCombinedValue() (+6 more)

### Community 25 - "TargetedAttacksList.vue"
Cohesion: 0.16
Nodes (11): currentFilter, expandedAttackIds, filteredAttacks, getAttackButtonTitle(), getEffectiveAttackBonus(), handleRollAttack(), handleSwitchAndRoll(), handleTurnOnAndRoll() (+3 more)

### Community 26 - "Anti-Slop Audit Report (Siklus 2): MM3E Character Builder"
Cohesion: 0.12
Nodes (16): Anti-Slop Audit Report (Siklus 2): MM3E Character Builder, Daftar Temuan Audit Siklus 2 (Numbered Findings List), Delivery Gate: Remediation Summary (PASS), Executive Summary, [F-13] Penekanan Fokus Outline (`outline: none`) di Komponen & Modal Tanpa `:focus-visible` Spesifik, [F-14] Kontras Warna Slate-500 (`#64748b`) pada Lembar Karakter Cetak PDF Kertas Putih, [F-15] Animasi Looping Tanpa Henti pada Ikon Perlengkapan Terpasang, [F-16] Ikon Tongkat Sihir (`ri-magic-line`) Sebagai Fallback Tombol Aksi & Kondisi Penyembuhan (+8 more)

### Community 27 - "GreenRoninSheet.vue"
Cohesion: 0.14
Nodes (13): allPowers, compiledAttacks, displayAttacks, getSkillAbility(), hasPage2Content, heroStore, overflowPowers, primaryPowers (+5 more)

### Community 28 - "heroStore.js"
Cohesion: 0.21
Nodes (12): ARCHETYPES, calculateDegrees(), BASIC_CONDITIONS, calculateConditionModifiers(), COMBINED_CONDITIONS, COMBINED_MAP, CONDITION_BRIEF_EFFECTS, DEATH_FAILURE_LIMIT (+4 more)

### Community 29 - "vue"
Cohesion: 0.14
Nodes (11): vue, activePerceptionMod, aweMod, heroStore, passivePerception, percRanks, specialSenses, uiStore (+3 more)

### Community 30 - "HeroHeader.vue"
Cohesion: 0.16
Nodes (10): allConditions, activeConditionItems, conditionDescMap, heroInitials, heroStore, rollInitiative(), showBioDrawer, uiStore (+2 more)

### Community 31 - "ConditionsTracker.vue"
Cohesion: 0.14
Nodes (7): ABILITY_CODES, activeConditions, heroStore, isDebilitatedDrawerOpen, isDirectlyActive(), isInheritedActive(), DEBILITATED_EFFECTS

### Community 32 - "Roll20PrintModal.vue"
Cohesion: 0.14
Nodes (9): abilityList, basicConditions, currentTab, defenseList, filteredMacros, heroStore, macroFilter, movementData (+1 more)

### Community 33 - "seamlessScroll.js"
Cohesion: 0.31
Nodes (13): applyScrollStep(), findParentScroller(), findScrollableContainer(), getMainViewport(), getModalContainer(), getNormalizedDelta(), hasActiveModal(), initSeamlessScroll() (+5 more)

### Community 34 - "ConditionPickerModal.vue"
Cohesion: 0.17
Nodes (9): ABILITY_CODES, activeCount, filteredConditions, filterTab, heroStore, isDirectlyActive(), isInheritedActive(), searchQuery (+1 more)

### Community 35 - "EffectsLibraryModal.vue"
Cohesion: 0.15
Nodes (7): activeCategory, builderStore, filteredEffects, rangeFilter, searchInputRef, searchQuery, BASE_EFFECTS

### Community 36 - "DefensesBlock.vue"
Cohesion: 0.15
Nodes (10): combatDefenses, condMods, defensiveRollBonus, enhDefenses, equipmentArmorBonus, equipmentShieldBonus, heroStore, protectionBonus (+2 more)

### Community 37 - "StepDefenses.vue"
Cohesion: 0.15
Nodes (10): dodgeTotal, fortitudeTotal, heroStore, isStaAbsent, maxCap, parryTotal, setDefense(), singleWillCap (+2 more)

### Community 38 - "usePowerBuilderStore"
Cohesion: 0.18
Nodes (10): builderStore, arrayCapacity, builderStore, capacityPercent, getSlotCost(), hasAlternateEffects, headroom, highestSlotCost (+2 more)

### Community 39 - "TabbedActionHub.vue"
Cohesion: 0.18
Nodes (10): activeTab, advantagesCount, attacksCount, complicationsCount, conditionsCount, equipmentCount, heroStore, powersCount (+2 more)

### Community 40 - "package.json"
Cohesion: 0.20
Nodes (9): description, name, private, type, version, pinia, @vercel/analytics, vite (+1 more)

### Community 41 - "main.js"
Cohesion: 0.20
Nodes (9): remixicon, app, pinia, src_styles_builder, src_styles_green_ronin_sheet, src_styles_main, src_styles_roll20_print, src_styles_sheet (+1 more)

### Community 42 - "CompoundPowerStudio.vue"
Cohesion: 0.22
Nodes (9): activeSub, builderStore, editorCanvasTitle, getEffectIcon(), getSubEffectCost(), validation, getEffectIcon(), getEffectIcon() (+1 more)

### Community 43 - "RulesReference.vue"
Cohesion: 0.20
Nodes (9): activeSection, combatActions, combatManeuvers, filteredActions, filteredBasicConditions, filteredCombinedConditions, filteredManeuvers, measurementRows (+1 more)

### Community 44 - "CombatInitiativeCard.vue"
Cohesion: 0.20
Nodes (7): baseAgl, hasSeizeInitiative, heroStore, improvedInitBonus, improvedInitRanks, initiativeTotal, uiStore

### Community 45 - "Mutants & Masterminds 3e Character Builder - Design System"
Cohesion: 0.22
Nodes (8): 1. Dials & Tone, 2. Color System, 3. Typography, 4. Mobile Ergonomics & Accessibility, Core Brand Tokens, Mutants & Masterminds 3e Character Builder - Design System, Rule Category Accents (Calibrated for WCAG AA >= 4.5:1), Theme Foundations (Dark Mode - Default Tabletop Theme)

### Community 46 - "DeviceContainerStudio.vue"
Cohesion: 0.25
Nodes (6): builderStore, discountAmount, editorCanvasTitle, getSubPowerCost(), hasActiveSubArray, calculateDeviceDiscount()

### Community 47 - "SubPowerArrayWorkbench.vue"
Cohesion: 0.25
Nodes (8): arrayCapacity, builderStore, capacityPercent, getSlotEffectCost(), headroom, highestSlotCost, isCapacityOverflow, props

### Community 48 - "isMotivation"
Cohesion: 0.25
Nodes (9): adjustHeroPoints(), getCategoryLabel(), getComplicationIcon(), openEdit(), triggerTrait(), getComplicationIcon(), openEditDialog(), findComplicationPreset() (+1 more)

### Community 49 - "useHeroStore"
Cohesion: 0.22
Nodes (6): abilitiesList, heroStore, createDefaultCharacter(), getSavedRoster(), getStoredCharacter(), useHeroStore

### Community 50 - "advantages.js"
Cohesion: 0.25
Nodes (7): deleteInstance(), ADVANTAGE_CATEGORIES, ADVANTAGE_COST_PER_RANK, ADVANTAGES, ADVANTAGES_CATALOG, formatAdvantageDisplayName(), getAdvantageRule()

### Community 51 - "regenerateDescription"
Cohesion: 0.32
Nodes (8): ensureItemName(), getNameSuggestions(), goToStep(), nextStep(), regenerateDescription(), selectCategory(), selectGadgetPack(), generateEquipmentDescription()

### Community 52 - "AbilitiesMatrix.vue"
Cohesion: 0.32
Nodes (6): ABILITIES_CONFIG, getEffectiveRank(), getEnhancedRanks(), handleRollCheck(), heroStore, uiStore

### Community 53 - "StepConcept.vue"
Cohesion: 0.29
Nodes (3): heroStore, origins, uiStore

### Community 54 - "initDragScroll"
Cohesion: 0.48
Nodes (5): initDragScroll(), onMouseDown(), onMouseMove(), onMouseUp(), stopMomentum()

### Community 55 - "dependencies"
Cohesion: 0.33
Nodes (6): dependencies, lz-string, pinia, remixicon, @vercel/analytics, vue

### Community 56 - "scripts"
Cohesion: 0.50
Nodes (4): scripts, build, dev, preview

### Community 57 - "saveEquipmentItem"
Cohesion: 0.67
Nodes (4): closeModal(), emit, getSpeedMph(), saveEquipmentItem()

### Community 58 - "getDegreeCondition"
Cohesion: 0.50
Nodes (4): getDegreeCondition(), isPresetActive(), onConditionSelect(), toggleAfflictionModifier()

### Community 59 - "complications.js"
Cohesion: 0.50
Nodes (3): COMPLICATIONS_CATALOG, MOTIVATIONS_CATALOG, validateNarrativeTraits()

### Community 60 - "defenses.js"
Cohesion: 0.50
Nodes (3): COMBAT_INITIATIVE, DEFENSE_COST_PER_RANK, DEFENSES

### Community 61 - "vercel.json"
Cohesion: 0.50
Nodes (3): cleanUrls, headers, rewrites

### Community 62 - "devDependencies"
Cohesion: 0.67
Nodes (3): devDependencies, vite, @vitejs/plugin-vue

### Community 63 - "addAdvantage"
Cohesion: 0.67
Nodes (3): addAdvantage(), confirmAddWithSpec(), confirmCreateCustomAdv()

### Community 64 - "onVehicleSizeChange"
Cohesion: 0.67
Nodes (3): getVehicleBaseStr(), getVehicleBaseTough(), onVehicleSizeChange()

## Knowledge Gaps
- **483 isolated node(s):** `name`, `private`, `version`, `description`, `type` (+478 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 717 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vue` connect `vue` to `EffectConfigurator.vue`, `PowersDeck.vue`, `exporters.js`, `StepEquipment.vue`, `CustomEquipmentModal.vue`, `ModifierInspectorModal.vue`, `SkillsTable.vue`, `StepAdvantages.vue`, `DiceRollHud.vue`, `EquipmentWorkshop.vue`, `ExportImportModal.vue`, `StepSkills.vue`, `AdvantageLibraryModal.vue`, `ComplicationsHub.vue`, `CharacterWizard.vue`, `App.vue`, `CostBreakdownSidebar.vue`, `AdvantagesList.vue`, `StepComplications.vue`, `EffectEditorCanvas.vue`, `PowerStudioWorkspace.vue`, `TargetedAttacksList.vue`, `GreenRoninSheet.vue`, `HeroHeader.vue`, `ConditionsTracker.vue`, `Roll20PrintModal.vue`, `ConditionPickerModal.vue`, `EffectsLibraryModal.vue`, `DefensesBlock.vue`, `StepDefenses.vue`, `usePowerBuilderStore`, `TabbedActionHub.vue`, `package.json`, `main.js`, `CompoundPowerStudio.vue`, `RulesReference.vue`, `CombatInitiativeCard.vue`, `DeviceContainerStudio.vue`, `SubPowerArrayWorkbench.vue`?**
  _High betweenness centrality (0.340) - this node is a cross-community bridge._
- **Why does `useHeroStore` connect `useHeroStore` to `PowersDeck.vue`, `exporters.js`, `StepEquipment.vue`, `CustomEquipmentModal.vue`, `SkillsTable.vue`, `StepAdvantages.vue`, `DiceRollHud.vue`, `EquipmentWorkshop.vue`, `ExportImportModal.vue`, `StepSkills.vue`, `AdvantageLibraryModal.vue`, `powerEngine.js`, `ComplicationsHub.vue`, `CharacterWizard.vue`, `App.vue`, `CostBreakdownSidebar.vue`, `AdvantagesList.vue`, `StepComplications.vue`, `EffectEditorCanvas.vue`, `PowerStudioWorkspace.vue`, `TargetedAttacksList.vue`, `GreenRoninSheet.vue`, `heroStore.js`, `vue`, `HeroHeader.vue`, `ConditionsTracker.vue`, `Roll20PrintModal.vue`, `ConditionPickerModal.vue`, `DefensesBlock.vue`, `StepDefenses.vue`, `TabbedActionHub.vue`, `CombatInitiativeCard.vue`, `AbilitiesMatrix.vue`, `StepConcept.vue`?**
  _High betweenness centrality (0.098) - this node is a cross-community bridge._
- **Why does `useUiStore` connect `App.vue` to `PowersDeck.vue`, `exporters.js`, `StepEquipment.vue`, `CustomEquipmentModal.vue`, `ModifierInspectorModal.vue`, `SkillsTable.vue`, `StepAdvantages.vue`, `EquipmentWorkshop.vue`, `ExportImportModal.vue`, `StepSkills.vue`, `AdvantageLibraryModal.vue`, `ComplicationsHub.vue`, `CharacterWizard.vue`, `AdvantagesList.vue`, `PowerStudioWorkspace.vue`, `TargetedAttacksList.vue`, `vue`, `HeroHeader.vue`, `Roll20PrintModal.vue`, `ConditionPickerModal.vue`, `DefensesBlock.vue`, `TabbedActionHub.vue`, `CombatInitiativeCard.vue`, `AbilitiesMatrix.vue`, `StepConcept.vue`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _483 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `EffectConfigurator.vue` be split into smaller, more focused modules?**
  _Cohesion score 0.027777777777777776 - nodes in this community are weakly interconnected._
- **Should `PowersDeck.vue` be split into smaller, more focused modules?**
  _Cohesion score 0.06787330316742081 - nodes in this community are weakly interconnected._
- **Should `exporters.js` be split into smaller, more focused modules?**
  _Cohesion score 0.07822410147991543 - nodes in this community are weakly interconnected._