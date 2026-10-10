# Graph Report - mm3e-builder-vue  (2026-10-10)

## Corpus Check
- 76 files · ~609,253 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 11 file(s) not represented in the graph (top: .css 6, (none) 2, .ico 1)

## Summary
- 1152 nodes · 1939 edges · 65 communities (62 shown, 3 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 16 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0969ed6b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- EffectConfigurator.vue
- exporters.js
- PowersDeck.vue
- CustomEquipmentModal.vue
- StepSkills.vue
- vue
- ModifierInspectorModal.vue
- SkillsTable.vue
- StepAdvantages.vue
- DiceRollHud.vue
- EquipmentWorkshop.vue
- ExportImportModal.vue
- StepEquipment.vue
- AdvantageLibraryModal.vue
- powerEngine.js
- ComplicationsHub.vue
- Mutants & Masterminds 3e Character Builder
- updateConfig
- App.vue
- CostBreakdownSidebar.vue
- AdvantagesList.vue
- heroStore.js
- StepComplications.vue
- equipmentCalculator.js
- EffectEditorCanvas.vue
- PowerStudioWorkspace.vue
- TargetedAttacksList.vue
- ConditionsTracker.vue
- ConditionPickerModal.vue
- HeroHeader.vue
- StepReview.vue
- seamlessScroll.js
- EffectsLibraryModal.vue
- GreenRoninSheet.vue
- usePowerBuilderStore
- TabbedActionHub.vue
- package.json
- RulesReference.vue
- main.js
- CompoundPowerStudio.vue
- CombatInitiativeCard.vue
- Mutants & Masterminds 3e Character Builder - Design System
- attacks.js
- DeviceContainerStudio.vue
- SubPowerArrayWorkbench.vue
- isMotivation
- advantages.js
- regenerateDescription
- AbilitiesMatrix.vue
- CharacterWizard.vue
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
- `getCalculatedAtkBonus()` --calls--> `getCombatSkillBonus()`  [EXTRACTED]
  src/components/modals/CustomEquipmentModal.vue → src/rules/skills.js
- `getSubEffectCost()` --calls--> `calculateEffectCost()`  [EXTRACTED]
  src/components/power-studio/CompoundPowerStudio.vue → src/rules/powerEngine.js
- `activeEffCost` --calls--> `calculateEffectCost()`  [EXTRACTED]
  src/components/power-studio/CostBreakdownSidebar.vue → src/rules/powerEngine.js
- `getSubPowerCost()` --calls--> `calculateEffectCost()`  [EXTRACTED]
  src/components/power-studio/DeviceContainerStudio.vue → src/rules/powerEngine.js
- `ensureInitialized()` --calls--> `normalizeEffect()`  [EXTRACTED]
  src/components/power-studio/EffectConfigurator.vue → src/rules/powerEngine.js

## Import Cycles
- None detected.

## Communities (65 total, 3 thin omitted)

### Community 0 - "EffectConfigurator.vue"
Cohesion: 0.03
Nodes (53): afflictionResistanceOptions, allComprehendModes, allEnvironmentElements, allMovementModes, altResistanceMod, AVAILABLE_CUSTOM_ICONS, calculatedBaseCostDisplay, cfg (+45 more)

### Community 1 - "exporters.js"
Cohesion: 0.05
Nodes (43): lz-string, loadFromHash(), activeTextContent, copied, heroStore, textFormat, uiStore, abilityList (+35 more)

### Community 2 - "PowersDeck.vue"
Cohesion: 0.07
Nodes (33): activeCompoundTabs, activeDeviceTabs, broadcastEffect(), broadcastExtra(), broadcastFlaw(), broadcastPower(), broadcastSubPower(), builderStore (+25 more)

### Community 3 - "CustomEquipmentModal.vue"
Cohesion: 0.05
Nodes (23): armorConfig, budgetInfo, calculatedTotalCost, categoryCards, currentStep, customDescription, gadgetConfig, getCalculatedAtkBonus() (+15 more)

### Community 4 - "StepSkills.vue"
Cohesion: 0.07
Nodes (34): activeCategory, calculateTotalBonus(), categories, filteredSkills, focusInputRef, getAdvantageBonusForSkill(), getAdvantageNameForSkill(), getEnhancedRanks() (+26 more)

### Community 5 - "vue"
Cohesion: 0.05
Nodes (31): vue, combatDefenses, condMods, defensiveRollBonus, enhDefenses, equipmentArmorBonus, equipmentShieldBonus, heroStore (+23 more)

### Community 6 - "ModifierInspectorModal.vue"
Cohesion: 0.07
Nodes (29): activeCategory, activeTab, baseCatalog, builderStore, calculatedExtrasPerRank, calculatedFlawsPerRank, categories, compatibleCount (+21 more)

### Community 7 - "SkillsTable.vue"
Cohesion: 0.07
Nodes (24): activeCategory, calculateTotalBonus(), categories, currentSelectedAbility, filteredRuleSkills, getAdvantageBonusForSkill(), getAdvantageNameForSkill(), getEnhancedRanks() (+16 more)

### Community 8 - "StepAdvantages.vue"
Cohesion: 0.07
Nodes (25): activeCategory, activeCategoryBreakdown, activeSpecAdv, addAdvantage(), catalogScrollRef, confirmAddWithSpec(), confirmCreateCustomAdv(), customForm (+17 more)

### Community 9 - "DiceRollHud.vue"
Cohesion: 0.08
Nodes (21): dismissRoll(), displayD20, heroPointsCount, heroStore, isHistoryOpen, isHovered, isRolling, progressPercent (+13 more)

### Community 10 - "EquipmentWorkshop.vue"
Cohesion: 0.09
Nodes (20): activeFilter, budgetInfo, customStudioCategory, exportRoll20(), filteredPresets, filteredResources, getCategoryCount(), getResIconClass() (+12 more)

### Community 11 - "ExportImportModal.vue"
Cohesion: 0.08
Nodes (19): activeMode, copied, exportJsonString, exportSizeKb, fileInputRef, formattedLastSaved, handleDownload(), handleExportSlot() (+11 more)

### Community 12 - "StepEquipment.vue"
Cohesion: 0.09
Nodes (18): activeFilter, budgetInfo, customStudioCategory, filteredPresets, filteredResources, getCategoryCount(), getResIconClass(), getSubtypeLabel() (+10 more)

### Community 13 - "AdvantageLibraryModal.vue"
Cohesion: 0.08
Nodes (15): activeCategory, activeSpecAdv, customForm, filteredAdvantages, gridRef, heroStore, searchInputRef, searchQuery (+7 more)

### Community 14 - "powerEngine.js"
Cohesion: 0.20
Nodes (21): BASE_EFFECT_ICONS, calculatePowerCombatMetrics(), calculatePowerDetailedBreakdown(), COMMON_LINKED_COMBOS, CONFIGURABLE_EFFECTS, createAlternateSlotFromEffect(), createEmptyCompoundEffect(), createEmptyDeviceSubPower() (+13 more)

### Community 15 - "ComplicationsHub.vue"
Cohesion: 0.08
Nodes (15): activeCatalogPresets, allComplications, broadcastComplication(), editingId, formDesc, formKind, formName, formType (+7 more)

### Community 16 - "Mutants & Masterminds 3e Character Builder"
Cohesion: 0.09
Nodes (22): Application Modules, Character Creation Wizard, Chrome Installation Guide, Contents, Contributing, Development Commands, Dice Mechanics & VTT Bridge, Equipment & Resources (+14 more)

### Community 17 - "updateConfig"
Cohesion: 0.09
Nodes (23): applyAfflictionPreset(), applyTraitPreset(), deleteCustomSubItem(), deleteCustomTrait(), selectAfflictionResistance(), selectMorphScope(), selectNullifyDescriptor(), selectTraitCategory() (+15 more)

### Community 18 - "App.vue"
Cohesion: 0.12
Nodes (13): builderStore, heroStore, isEmbed, isToolsOpen, runtimeError, toolsDropdownRef, uiStore, uiStore (+5 more)

### Community 19 - "CostBreakdownSidebar.vue"
Cohesion: 0.10
Nodes (19): activeEffCost, builderStore, combatProfile, heroStore, isEditingExisting, isOverBudget, originalPowerCost, powerCostDelta (+11 more)

### Community 20 - "AdvantagesList.vue"
Cohesion: 0.13
Nodes (16): availableCategories, broadcastAdvantage(), editForm, editingAdv, effectiveAdvantages, filteredAdvantages, getAdvCategory(), getAdvDesc() (+8 more)

### Community 21 - "heroStore.js"
Cohesion: 0.14
Nodes (15): abilitiesList, heroStore, ARCHETYPES, calculateConditionModifiers(), COMBINED_MAP, DEATH_FAILURE_LIMIT, DEBILITATED_EFFECTS, DYING_DC (+7 more)

### Community 22 - "StepComplications.vue"
Cohesion: 0.09
Nodes (14): complicationCategories, editingId, generalComplications, heroStore, modalMode, motivations, narrativeStatus, newCompDesc (+6 more)

### Community 23 - "equipmentCalculator.js"
Cohesion: 0.16
Nodes (17): costBreakdown, ARMOR_EXTRAS, calculateArmorCost(), calculateGadgetCost(), calculateHQCost(), calculateTotalEquipmentCost(), calculateVehicleCost(), calculateWeaponCost() (+9 more)

### Community 24 - "EffectEditorCanvas.vue"
Cohesion: 0.11
Nodes (10): builderStore, currentBaseInfo, currentHeaderName, currentSlotRef, effectCategories, heroStore, isCompoundSlot, props (+2 more)

### Community 25 - "PowerStudioWorkspace.vue"
Cohesion: 0.13
Nodes (14): calculatedTotalPPDisplay, effectCost, netEffectCost, builderStore, canvasKey, canvasTitle, currentPowerSelectValue, getSlotCombinedValue() (+6 more)

### Community 26 - "TargetedAttacksList.vue"
Cohesion: 0.16
Nodes (11): currentFilter, expandedAttackIds, filteredAttacks, getAttackButtonTitle(), getEffectiveAttackBonus(), handleRollAttack(), handleSwitchAndRoll(), handleTurnOnAndRoll() (+3 more)

### Community 27 - "ConditionsTracker.vue"
Cohesion: 0.12
Nodes (8): ABILITY_CODES, activeConditions, activeDebilitatedSummary, heroStore, hoveredAbility, isDebilitatedDrawerOpen, isDirectlyActive(), isInheritedActive()

### Community 28 - "ConditionPickerModal.vue"
Cohesion: 0.13
Nodes (11): ABILITY_CODES, activeCount, activeDebilitatedSummary, filteredConditions, filterTab, heroStore, hoveredAbility, isDirectlyActive() (+3 more)

### Community 29 - "HeroHeader.vue"
Cohesion: 0.15
Nodes (11): allConditions, activeConditionItems, conditionDescMap, heroInitials, heroStore, rollInitiative(), showBioDrawer, uiStore (+3 more)

### Community 30 - "StepReview.vue"
Cohesion: 0.23
Nodes (14): finishWizard(), finishWizard(), heroStore, isComplicationsValid, isDefenseCapsValid, maxCap, uiStore, getEmbedType() (+6 more)

### Community 31 - "seamlessScroll.js"
Cohesion: 0.31
Nodes (13): applyScrollStep(), findParentScroller(), findScrollableContainer(), getMainViewport(), getModalContainer(), getNormalizedDelta(), hasActiveModal(), initSeamlessScroll() (+5 more)

### Community 32 - "EffectsLibraryModal.vue"
Cohesion: 0.15
Nodes (7): activeCategory, builderStore, filteredEffects, rangeFilter, searchInputRef, searchQuery, BASE_EFFECTS

### Community 33 - "GreenRoninSheet.vue"
Cohesion: 0.18
Nodes (8): allPowers, displayAttacks, getSkillAbility(), hasPage2Content, heroStore, overflowPowers, primaryPowers, trainedSkills

### Community 34 - "usePowerBuilderStore"
Cohesion: 0.18
Nodes (10): builderStore, arrayCapacity, builderStore, capacityPercent, getSlotCost(), hasAlternateEffects, headroom, highestSlotCost (+2 more)

### Community 35 - "TabbedActionHub.vue"
Cohesion: 0.18
Nodes (10): activeTab, advantagesCount, attacksCount, complicationsCount, conditionsCount, equipmentCount, heroStore, powersCount (+2 more)

### Community 36 - "package.json"
Cohesion: 0.20
Nodes (9): description, name, private, type, version, pinia, @vercel/analytics, vite (+1 more)

### Community 37 - "RulesReference.vue"
Cohesion: 0.18
Nodes (10): activeSection, combatActions, combatManeuvers, filteredActions, filteredBasicConditions, filteredCombinedConditions, filteredManeuvers, measurementRows (+2 more)

### Community 38 - "main.js"
Cohesion: 0.20
Nodes (9): remixicon, app, pinia, src_styles_builder, src_styles_green_ronin_sheet, src_styles_main, src_styles_roll20_print, src_styles_sheet (+1 more)

### Community 39 - "CompoundPowerStudio.vue"
Cohesion: 0.22
Nodes (9): activeSub, builderStore, editorCanvasTitle, getEffectIcon(), getSubEffectCost(), validation, getEffectIcon(), getEffectIcon() (+1 more)

### Community 40 - "CombatInitiativeCard.vue"
Cohesion: 0.20
Nodes (7): baseAgl, hasSeizeInitiative, heroStore, improvedInitBonus, improvedInitRanks, initiativeTotal, uiStore

### Community 41 - "Mutants & Masterminds 3e Character Builder - Design System"
Cohesion: 0.22
Nodes (8): 1. Dials & Tone, 2. Color System, 3. Typography, 4. Mobile Ergonomics & Accessibility, Core Brand Tokens, Mutants & Masterminds 3e Character Builder - Design System, Rule Category Accents (Calibrated for WCAG AA >= 4.5:1), Theme Foundations (Dark Mode - Default Tabletop Theme)

### Community 42 - "attacks.js"
Cohesion: 0.33
Nodes (8): compiledAttacks, buildEffectBreakdown(), calculateDegrees(), compileTargetedAttacks(), processEffect(), BASIC_CONDITIONS, CONDITION_BRIEF_EFFECTS, getCombatSkillBonus()

### Community 43 - "DeviceContainerStudio.vue"
Cohesion: 0.25
Nodes (6): builderStore, discountAmount, editorCanvasTitle, getSubPowerCost(), hasActiveSubArray, calculateDeviceDiscount()

### Community 44 - "SubPowerArrayWorkbench.vue"
Cohesion: 0.25
Nodes (8): arrayCapacity, builderStore, capacityPercent, getSlotEffectCost(), headroom, highestSlotCost, isCapacityOverflow, props

### Community 45 - "isMotivation"
Cohesion: 0.25
Nodes (9): adjustHeroPoints(), getCategoryLabel(), getComplicationIcon(), openEdit(), triggerTrait(), getComplicationIcon(), openEditDialog(), findComplicationPreset() (+1 more)

### Community 46 - "advantages.js"
Cohesion: 0.25
Nodes (7): deleteInstance(), ADVANTAGE_CATEGORIES, ADVANTAGE_COST_PER_RANK, ADVANTAGES, ADVANTAGES_CATALOG, formatAdvantageDisplayName(), getAdvantageRule()

### Community 47 - "regenerateDescription"
Cohesion: 0.32
Nodes (8): ensureItemName(), getNameSuggestions(), goToStep(), nextStep(), regenerateDescription(), selectCategory(), selectGadgetPack(), generateEquipmentDescription()

### Community 48 - "AbilitiesMatrix.vue"
Cohesion: 0.32
Nodes (6): ABILITIES_CONFIG, getEffectiveRank(), getEnhancedRanks(), handleRollCheck(), heroStore, uiStore

### Community 49 - "CharacterWizard.vue"
Cohesion: 0.29
Nodes (6): activeStepComponent, activeStepInfo, currentStep, heroStore, steps, uiStore

### Community 50 - "StepConcept.vue"
Cohesion: 0.29
Nodes (3): heroStore, origins, uiStore

### Community 51 - "initDragScroll"
Cohesion: 0.48
Nodes (5): initDragScroll(), onMouseDown(), onMouseMove(), onMouseUp(), stopMomentum()

### Community 52 - "dependencies"
Cohesion: 0.33
Nodes (6): dependencies, lz-string, pinia, remixicon, @vercel/analytics, vue

### Community 53 - "scripts"
Cohesion: 0.50
Nodes (4): scripts, build, dev, preview

### Community 54 - "saveEquipmentItem"
Cohesion: 0.67
Nodes (4): closeModal(), emit, getSpeedMph(), saveEquipmentItem()

### Community 55 - "getDegreeCondition"
Cohesion: 0.50
Nodes (4): getDegreeCondition(), isPresetActive(), onConditionSelect(), toggleAfflictionModifier()

### Community 56 - "complications.js"
Cohesion: 0.50
Nodes (3): COMPLICATIONS_CATALOG, MOTIVATIONS_CATALOG, validateNarrativeTraits()

### Community 57 - "defenses.js"
Cohesion: 0.50
Nodes (3): COMBAT_INITIATIVE, DEFENSE_COST_PER_RANK, DEFENSES

### Community 58 - "vercel.json"
Cohesion: 0.50
Nodes (3): cleanUrls, headers, rewrites

### Community 59 - "devDependencies"
Cohesion: 0.67
Nodes (3): devDependencies, vite, @vitejs/plugin-vue

### Community 60 - "addAdvantage"
Cohesion: 0.67
Nodes (3): addAdvantage(), confirmAddWithSpec(), confirmCreateCustomAdv()

### Community 61 - "onVehicleSizeChange"
Cohesion: 0.67
Nodes (3): getVehicleBaseStr(), getVehicleBaseTough(), onVehicleSizeChange()

## Knowledge Gaps
- **476 isolated node(s):** `name`, `private`, `version`, `description`, `type` (+471 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 711 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vue` connect `vue` to `EffectConfigurator.vue`, `exporters.js`, `PowersDeck.vue`, `CustomEquipmentModal.vue`, `StepSkills.vue`, `ModifierInspectorModal.vue`, `SkillsTable.vue`, `StepAdvantages.vue`, `DiceRollHud.vue`, `EquipmentWorkshop.vue`, `ExportImportModal.vue`, `StepEquipment.vue`, `AdvantageLibraryModal.vue`, `ComplicationsHub.vue`, `App.vue`, `CostBreakdownSidebar.vue`, `AdvantagesList.vue`, `StepComplications.vue`, `EffectEditorCanvas.vue`, `PowerStudioWorkspace.vue`, `TargetedAttacksList.vue`, `ConditionsTracker.vue`, `ConditionPickerModal.vue`, `HeroHeader.vue`, `StepReview.vue`, `EffectsLibraryModal.vue`, `GreenRoninSheet.vue`, `usePowerBuilderStore`, `TabbedActionHub.vue`, `package.json`, `RulesReference.vue`, `main.js`, `CompoundPowerStudio.vue`, `CombatInitiativeCard.vue`, `DeviceContainerStudio.vue`, `SubPowerArrayWorkbench.vue`, `CharacterWizard.vue`?**
  _High betweenness centrality (0.372) - this node is a cross-community bridge._
- **Why does `useHeroStore` connect `heroStore.js` to `exporters.js`, `PowersDeck.vue`, `CustomEquipmentModal.vue`, `StepSkills.vue`, `vue`, `SkillsTable.vue`, `StepAdvantages.vue`, `DiceRollHud.vue`, `EquipmentWorkshop.vue`, `ExportImportModal.vue`, `StepEquipment.vue`, `AdvantageLibraryModal.vue`, `powerEngine.js`, `ComplicationsHub.vue`, `App.vue`, `CostBreakdownSidebar.vue`, `AdvantagesList.vue`, `StepComplications.vue`, `EffectEditorCanvas.vue`, `PowerStudioWorkspace.vue`, `TargetedAttacksList.vue`, `ConditionsTracker.vue`, `ConditionPickerModal.vue`, `HeroHeader.vue`, `StepReview.vue`, `GreenRoninSheet.vue`, `TabbedActionHub.vue`, `CombatInitiativeCard.vue`, `AbilitiesMatrix.vue`, `CharacterWizard.vue`, `StepConcept.vue`?**
  _High betweenness centrality (0.098) - this node is a cross-community bridge._
- **Why does `useUiStore` connect `App.vue` to `exporters.js`, `PowersDeck.vue`, `CustomEquipmentModal.vue`, `StepSkills.vue`, `vue`, `ModifierInspectorModal.vue`, `SkillsTable.vue`, `StepAdvantages.vue`, `EquipmentWorkshop.vue`, `ExportImportModal.vue`, `StepEquipment.vue`, `AdvantageLibraryModal.vue`, `ComplicationsHub.vue`, `AdvantagesList.vue`, `PowerStudioWorkspace.vue`, `TargetedAttacksList.vue`, `ConditionPickerModal.vue`, `HeroHeader.vue`, `StepReview.vue`, `TabbedActionHub.vue`, `CombatInitiativeCard.vue`, `AbilitiesMatrix.vue`, `CharacterWizard.vue`, `StepConcept.vue`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _476 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `EffectConfigurator.vue` be split into smaller, more focused modules?**
  _Cohesion score 0.027777777777777776 - nodes in this community are weakly interconnected._
- **Should `exporters.js` be split into smaller, more focused modules?**
  _Cohesion score 0.0544464609800363 - nodes in this community are weakly interconnected._
- **Should `PowersDeck.vue` be split into smaller, more focused modules?**
  _Cohesion score 0.07183673469387755 - nodes in this community are weakly interconnected._