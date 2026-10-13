# Graph Report - mm3e-builder-vue  (2026-10-13)

## Corpus Check
- 108 files · ~615,560 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 12 file(s) not represented in the graph (top: .css 7, (none) 2, .ico 1)

## Summary
- 1368 nodes · 2377 edges · 69 communities (66 shown, 3 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 26 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `be078773`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- helpers.js
- package.json
- PowersDeck.vue
- StepEquipment.vue
- CustomEquipmentModal.vue
- GreenRoninSheet.vue
- ModifierInspectorModal.vue
- TabbedActionHub.vue
- CharacterWizard.vue
- ExportImportModal.vue
- SkillsTable.vue
- StepAdvantages.vue
- EffectEditorCanvas.vue
- powerCalculator.js
- DiceRollHud.vue
- EquipmentWorkshop.vue
- AfflictionConfig.vue
- EffectConfigurator.vue
- StepSkills.vue
- calculateEffectCost
- AdvantageLibraryModal.vue
- powerBuilderStore.js
- Mutants & Masterminds 3e Character Builder
- ComplicationsHub.vue
- EnhancedTraitConfig.vue
- AdvantagesList.vue
- StepComplications.vue
- App.vue
- equipmentCalculator.js
- EffectsLibraryModal.vue
- ConcealmentConfig.vue
- SensesConfig.vue
- ConditionsTracker.vue
- heroStore.js
- ConditionPickerModal.vue
- attacks.js
- Roll20PrintModal.vue
- exporters/index.js
- ImmunityConfig.vue
- CostBreakdownSidebar.vue
- MovementConfig.vue
- DefensesBlock.vue
- ComprehendConfig.vue
- EnvironmentConfig.vue
- ShareModal.vue
- RulesReference.vue
- HeroHeader.vue
- advantages.js
- WeakenConfig.vue
- CombatInitiativeCard.vue
- Mutants & Masterminds 3e Character Builder - Design System
- SubPowerArrayWorkbench.vue
- useUiStore
- isMotivation
- regenerateDescription
- vue
- IllusionConfig.vue
- StepConcept.vue
- NullifyConfig.vue
- VariableConfig.vue
- TacticalCharacterSheet.vue
- StepAbilities.vue
- saveEquipmentItem
- complications.js
- defenses.js
- addAdvantage
- onVehicleSizeChange
- abilities.js
- vercel.json

## God Nodes (most connected - your core abstractions)
1. `vue` - 57 edges
2. `useHeroStore` - 45 edges
3. `calculateEffectCost()` - 33 edges
4. `useUiStore` - 31 edges
5. `calculatePowerTotalCost()` - 21 edges
6. `usePowerBuilderStore` - 17 edges
7. `normalizePower()` - 15 edges
8. `normalizeEffect()` - 15 edges
9. `sendFeatureToVTT()` - 14 edges
10. `compileExportData()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `getSubEffectCost()` --calls--> `calculateEffectCost()`  [EXTRACTED]
  src/components/power-studio/CompoundPowerStudio.vue → src/rules/powerCalculator.js
- `originalPowerCost` --calls--> `calculatePowerTotalCost()`  [EXTRACTED]
  src/components/power-studio/CostBreakdownSidebar.vue → src/rules/powerCalculator.js
- `activeEffCost` --calls--> `calculateEffectCost()`  [EXTRACTED]
  src/components/power-studio/CostBreakdownSidebar.vue → src/rules/powerCalculator.js
- `getSubPowerCost()` --calls--> `calculateEffectCost()`  [EXTRACTED]
  src/components/power-studio/DeviceContainerStudio.vue → src/rules/powerCalculator.js
- `ensureInitialized()` --calls--> `normalizeEffect()`  [EXTRACTED]
  src/components/power-studio/EffectConfigurator.vue → src/rules/powerNormalizer.js

## Import Cycles
- None detected.

## Communities (69 total, 3 thin omitted)

### Community 0 - "helpers.js"
Cohesion: 0.05
Nodes (63): activeTextContent, { copy, copied }, exportMode, heroStore, textFormat, uiStore, macrosList, activePerceptionMod (+55 more)

### Community 1 - "package.json"
Cohesion: 0.05
Nodes (49): dependencies, lz-string, pinia, radash, remixicon, valibot, @vercel/analytics, vue (+41 more)

### Community 2 - "PowersDeck.vue"
Cohesion: 0.07
Nodes (35): broadcastComplication(), exportRoll20(), activeCompoundTabs, activeDeviceTabs, broadcastEffect(), broadcastExtra(), broadcastFlaw(), broadcastPower() (+27 more)

### Community 3 - "StepEquipment.vue"
Cohesion: 0.07
Nodes (32): getCalculatedAtkBonus(), activeFilter, budgetInfo, customStudioCategory, filteredPresets, filteredResources, getCategoryCount(), getResIconClass() (+24 more)

### Community 4 - "CustomEquipmentModal.vue"
Cohesion: 0.05
Nodes (22): armorConfig, budgetInfo, calculatedTotalCost, categoryCards, currentStep, customDescription, gadgetConfig, getHQBaseTough() (+14 more)

### Community 5 - "GreenRoninSheet.vue"
Cohesion: 0.07
Nodes (31): addZoomListeners(), adjustZoom(), calculateDefaultZoom(), handleKeyDown(), handleWheelZoom(), removeZoomListeners(), scalerStyle, scaleValue (+23 more)

### Community 6 - "ModifierInspectorModal.vue"
Cohesion: 0.07
Nodes (29): activeCategory, activeTab, baseCatalog, builderStore, calculatedExtrasPerRank, calculatedFlawsPerRank, categories, compatibleCount (+21 more)

### Community 7 - "TabbedActionHub.vue"
Cohesion: 0.07
Nodes (26): activeTab, advantagesCount, attacksCount, complicationsCount, conditionsCount, equipmentCount, heroStore, powersCount (+18 more)

### Community 8 - "CharacterWizard.vue"
Cohesion: 0.08
Nodes (30): activeStepComponent, activeStepInfo, currentStep, finishWizard(), heroStore, steps, uiStore, dodgeTotal (+22 more)

### Community 9 - "ExportImportModal.vue"
Cohesion: 0.07
Nodes (24): valibot, activeMode, { copy, copied }, exportJsonString, exportSizeKb, fileInputRef, formattedLastSaved, handleDownload() (+16 more)

### Community 10 - "SkillsTable.vue"
Cohesion: 0.07
Nodes (24): activeCategory, calculateTotalBonus(), categories, currentSelectedAbility, filteredRuleSkills, getAdvantageBonusForSkill(), getAdvantageNameForSkill(), getEnhancedRanks() (+16 more)

### Community 11 - "StepAdvantages.vue"
Cohesion: 0.07
Nodes (25): activeCategory, activeCategoryBreakdown, activeSpecAdv, addAdvantage(), catalogScrollRef, confirmAddWithSpec(), confirmCreateCustomAdv(), customForm (+17 more)

### Community 12 - "EffectEditorCanvas.vue"
Cohesion: 0.07
Nodes (22): activeSub, builderStore, editorCanvasTitle, getEffectIcon(), getSubEffectCost(), validation, builderStore, currentBaseInfo (+14 more)

### Community 13 - "powerCalculator.js"
Cohesion: 0.14
Nodes (23): EXTRAS, FLAWS, src_data_index_base_effects, src_data_index_configurable_effects, src_data_index_extras, src_data_index_flaws, MODIFIER_CATEGORIES, calculateComponentCost() (+15 more)

### Community 14 - "DiceRollHud.vue"
Cohesion: 0.08
Nodes (21): dismissRoll(), displayD20, heroPointsCount, heroStore, isHistoryOpen, isHovered, isRolling, progressPercent (+13 more)

### Community 15 - "EquipmentWorkshop.vue"
Cohesion: 0.09
Nodes (19): activeFilter, budgetInfo, customStudioCategory, filteredPresets, filteredResources, getCategoryCount(), getResIconClass(), getSubtypeLabel() (+11 more)

### Community 16 - "AfflictionConfig.vue"
Cohesion: 0.09
Nodes (26): afflictionResistanceOptions, altResistanceMod, applyAfflictionPreset(), cfg, conditionsPerDegree, emit, extraConditionMod, extraConditionRanks (+18 more)

### Community 17 - "EffectConfigurator.vue"
Cohesion: 0.08
Nodes (26): activeSubConfigComponent, AVAILABLE_CUSTOM_ICONS, calculatedBaseCostDisplay, cfg, closeCustomSubModal(), customCategoryOptions, customForm, customSubModalTargetEffect (+18 more)

### Community 18 - "StepSkills.vue"
Cohesion: 0.09
Nodes (22): activeCategory, calculateTotalBonus(), categories, filteredSkills, focusInputRef, getAdvantageBonusForSkill(), getAdvantageNameForSkill(), getEnhancedRanks() (+14 more)

### Community 19 - "calculateEffectCost"
Cohesion: 0.09
Nodes (22): calculatedTotalPPDisplay, effectCost, netEffectCost, builderStore, canvasKey, canvasTitle, currentPowerSelectValue, getSlotCombinedValue() (+14 more)

### Community 20 - "AdvantageLibraryModal.vue"
Cohesion: 0.08
Nodes (15): activeCategory, activeSpecAdv, customForm, filteredAdvantages, gridRef, heroStore, searchInputRef, searchQuery (+7 more)

### Community 21 - "powerBuilderStore.js"
Cohesion: 0.10
Nodes (20): builderStore, discountAmount, editorCanvasTitle, getSubPowerCost(), hasActiveSubArray, builderStore, calculateDeviceDiscount(), src_rules_powerengine_calculatedevicediscount (+12 more)

### Community 22 - "Mutants & Masterminds 3e Character Builder"
Cohesion: 0.08
Nodes (23): Application Modules, Architecture & Directory Layout, Character Creation Wizard, Contents, Contributing, Development Commands, Dice Mechanics & VTT Bridge, Equipment & Resources (+15 more)

### Community 23 - "ComplicationsHub.vue"
Cohesion: 0.09
Nodes (14): activeCatalogPresets, allComplications, editingId, formDesc, formKind, formName, formType, generalComplications (+6 more)

### Community 24 - "EnhancedTraitConfig.vue"
Cohesion: 0.11
Nodes (16): applyTraitPreset(), calculatedBaseCostDisplay, cfg, currentCategoryObj, currentTraitCategory, customSubModal, emit, filteredTraits (+8 more)

### Community 25 - "AdvantagesList.vue"
Cohesion: 0.13
Nodes (16): availableCategories, broadcastAdvantage(), editForm, editingAdv, effectiveAdvantages, filteredAdvantages, getAdvCategory(), getAdvDesc() (+8 more)

### Community 26 - "StepComplications.vue"
Cohesion: 0.09
Nodes (14): complicationCategories, editingId, generalComplications, heroStore, modalMode, motivations, narrativeStatus, newCompDesc (+6 more)

### Community 27 - "App.vue"
Cohesion: 0.14
Nodes (12): builderStore, heroStore, isEmbed, isToolsOpen, runtimeError, toolsDropdownRef, uiStore, getTargetPathname() (+4 more)

### Community 28 - "equipmentCalculator.js"
Cohesion: 0.16
Nodes (17): costBreakdown, ARMOR_EXTRAS, calculateArmorCost(), calculateGadgetCost(), calculateHQCost(), calculateTotalEquipmentCost(), calculateVehicleCost(), calculateWeaponCost() (+9 more)

### Community 29 - "EffectsLibraryModal.vue"
Cohesion: 0.12
Nodes (11): activeCategory, builderStore, filteredEffects, rangeFilter, searchInputRef, searchQuery, BASE_EFFECT_ICONS, BASE_EFFECTS (+3 more)

### Community 30 - "ConcealmentConfig.vue"
Cohesion: 0.14
Nodes (12): cfg, concealmentSearch, customSubModal, emit, filteredConcealments, openCustomSubModal(), props, selectedConcealmentCategory (+4 more)

### Community 31 - "SensesConfig.vue"
Cohesion: 0.14
Nodes (12): cfg, customSubModal, emit, filteredFaculties, openCustomSubModal(), props, selectedFacultiesList, selectedSensesCategory (+4 more)

### Community 32 - "ConditionsTracker.vue"
Cohesion: 0.12
Nodes (8): ABILITY_CODES, activeConditions, activeDebilitatedSummary, heroStore, hoveredAbility, isDebilitatedDrawerOpen, isDirectlyActive(), isInheritedActive()

### Community 33 - "heroStore.js"
Cohesion: 0.19
Nodes (13): ARCHETYPES, calculateConditionModifiers(), COMBINED_MAP, DEATH_FAILURE_LIMIT, DEBILITATED_EFFECTS, DYING_DC, evaluateDyingFortitudeCheck(), resolveActiveConditionSet() (+5 more)

### Community 34 - "ConditionPickerModal.vue"
Cohesion: 0.13
Nodes (11): ABILITY_CODES, activeCount, activeDebilitatedSummary, filteredConditions, filterTab, heroStore, hoveredAbility, isDirectlyActive() (+3 more)

### Community 35 - "attacks.js"
Cohesion: 0.21
Nodes (15): allConditions, compiledAttacks, effectRangeDetails, activeConditionItems, buildEffectBreakdown(), calculateDegrees(), compileTargetedAttacks(), mergeLinkedAttackEffects() (+7 more)

### Community 36 - "Roll20PrintModal.vue"
Cohesion: 0.12
Nodes (11): abilityList, basicConditions, { copy }, currentTab, defenseList, filteredMacros, heroStore, macroFilter (+3 more)

### Community 37 - "exporters/index.js"
Cohesion: 0.20
Nodes (10): lz-string, loadFromHash(), generateLink(), base64UrlToUint8(), clearShareHash(), CLOUDFLARE_WORKER_URL, fetchSharedCharacterFromKv(), generateShareUrl() (+2 more)

### Community 38 - "ImmunityConfig.vue"
Cohesion: 0.16
Nodes (10): cfg, customSubModal, emit, filteredImmunities, immunitySearch, openCustomSubModal(), props, selectedImmunityCategory (+2 more)

### Community 39 - "CostBreakdownSidebar.vue"
Cohesion: 0.13
Nodes (14): activeEffCost, budgetPercentages, builderStore, combatProfile, heroStore, isEditingExisting, isOverBudget, originalPowerCost (+6 more)

### Community 40 - "MovementConfig.vue"
Cohesion: 0.19
Nodes (9): allMovementModes, cfg, customSubModal, emit, openCustomSubModal(), props, stepMovementMode(), toggleMovementMode() (+1 more)

### Community 41 - "DefensesBlock.vue"
Cohesion: 0.15
Nodes (10): combatDefenses, condMods, defensiveRollBonus, enhDefenses, equipmentArmorBonus, equipmentShieldBonus, heroStore, protectionBonus (+2 more)

### Community 42 - "ComprehendConfig.vue"
Cohesion: 0.21
Nodes (8): allComprehendModes, cfg, customSubModal, emit, openCustomSubModal(), props, toggleComprehend(), updateConfig()

### Community 43 - "EnvironmentConfig.vue"
Cohesion: 0.21
Nodes (8): allEnvironmentElements, cfg, customSubModal, emit, openCustomSubModal(), props, toggleEnvironment(), updateConfig()

### Community 44 - "ShareModal.vue"
Cohesion: 0.18
Nodes (8): characterShareInfo, { copy, copied }, forceOffline, hasActiveShareLink, heroStore, isGenerating, shareData, uiStore

### Community 45 - "RulesReference.vue"
Cohesion: 0.18
Nodes (10): activeSection, combatActions, combatManeuvers, filteredActions, filteredBasicConditions, filteredCombinedConditions, filteredManeuvers, measurementRows (+2 more)

### Community 46 - "HeroHeader.vue"
Cohesion: 0.18
Nodes (6): conditionDescMap, heroInitials, heroStore, rollInitiative(), showBioDrawer, uiStore

### Community 47 - "advantages.js"
Cohesion: 0.22
Nodes (8): deleteInstance(), CONFIGURABLE_EFFECTS, ADVANTAGE_CATEGORIES, ADVANTAGE_COST_PER_RANK, ADVANTAGES, ADVANTAGES_CATALOG, formatAdvantageDisplayName(), getAdvantageRule()

### Community 48 - "WeakenConfig.vue"
Cohesion: 0.29
Nodes (8): cfg, currentWeakenCategory, emit, props, selectWeakenCategory(), selectWeakenResistance(), selectWeakenTrait(), updateConfig()

### Community 49 - "CombatInitiativeCard.vue"
Cohesion: 0.20
Nodes (7): baseAgl, hasSeizeInitiative, heroStore, improvedInitBonus, improvedInitRanks, initiativeTotal, uiStore

### Community 50 - "Mutants & Masterminds 3e Character Builder - Design System"
Cohesion: 0.22
Nodes (8): 1. Dials & Tone, 2. Color System, 3. Typography, 4. Mobile Ergonomics & Accessibility, Core Brand Tokens, Mutants & Masterminds 3e Character Builder - Design System, Rule Category Accents (Calibrated for WCAG AA >= 4.5:1), Theme Foundations (Dark Mode - Default Tabletop Theme)

### Community 51 - "SubPowerArrayWorkbench.vue"
Cohesion: 0.25
Nodes (8): arrayCapacity, builderStore, capacityPercent, getSlotEffectCost(), headroom, highestSlotCost, isCapacityOverflow, props

### Community 52 - "useUiStore"
Cohesion: 0.28
Nodes (7): ABILITIES_CONFIG, getEffectiveRank(), getEnhancedRanks(), handleRollCheck(), heroStore, uiStore, useUiStore

### Community 53 - "isMotivation"
Cohesion: 0.25
Nodes (9): adjustHeroPoints(), getCategoryLabel(), getComplicationIcon(), openEdit(), triggerTrait(), getComplicationIcon(), openEditDialog(), findComplicationPreset() (+1 more)

### Community 54 - "regenerateDescription"
Cohesion: 0.32
Nodes (8): ensureItemName(), getNameSuggestions(), goToStep(), nextStep(), regenerateDescription(), selectCategory(), selectGadgetPack(), generateEquipmentDescription()

### Community 55 - "vue"
Cohesion: 0.38
Nodes (6): vue, cfg, emit, props, selectMorphScope(), updateConfig()

### Community 56 - "IllusionConfig.vue"
Cohesion: 0.38
Nodes (5): cfg, emit, props, toggleIllusionSense(), updateConfig()

### Community 57 - "StepConcept.vue"
Cohesion: 0.29
Nodes (3): heroStore, origins, uiStore

### Community 58 - "NullifyConfig.vue"
Cohesion: 0.47
Nodes (5): cfg, emit, props, selectNullifyDescriptor(), updateConfig()

### Community 59 - "VariableConfig.vue"
Cohesion: 0.47
Nodes (5): cfg, emit, props, selectVariableTheme(), updateConfig()

### Community 60 - "TacticalCharacterSheet.vue"
Cohesion: 0.40
Nodes (3): colLeftRef, sheetGridRef, sheetViewRef

### Community 62 - "saveEquipmentItem"
Cohesion: 0.67
Nodes (4): closeModal(), emit, getSpeedMph(), saveEquipmentItem()

### Community 63 - "complications.js"
Cohesion: 0.50
Nodes (3): COMPLICATIONS_CATALOG, MOTIVATIONS_CATALOG, validateNarrativeTraits()

### Community 64 - "defenses.js"
Cohesion: 0.50
Nodes (3): COMBAT_INITIATIVE, DEFENSE_COST_PER_RANK, DEFENSES

### Community 65 - "addAdvantage"
Cohesion: 0.67
Nodes (3): addAdvantage(), confirmAddWithSpec(), confirmCreateCustomAdv()

### Community 66 - "onVehicleSizeChange"
Cohesion: 0.67
Nodes (3): getVehicleBaseStr(), getVehicleBaseTough(), onVehicleSizeChange()

## Knowledge Gaps
- **532 isolated node(s):** `name`, `private`, `version`, `description`, `type` (+527 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 798 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vue` connect `vue` to `helpers.js`, `package.json`, `PowersDeck.vue`, `StepEquipment.vue`, `CustomEquipmentModal.vue`, `GreenRoninSheet.vue`, `ModifierInspectorModal.vue`, `TabbedActionHub.vue`, `CharacterWizard.vue`, `ExportImportModal.vue`, `SkillsTable.vue`, `StepAdvantages.vue`, `EffectEditorCanvas.vue`, `DiceRollHud.vue`, `EquipmentWorkshop.vue`, `AfflictionConfig.vue`, `EffectConfigurator.vue`, `StepSkills.vue`, `calculateEffectCost`, `AdvantageLibraryModal.vue`, `powerBuilderStore.js`, `ComplicationsHub.vue`, `EnhancedTraitConfig.vue`, `AdvantagesList.vue`, `StepComplications.vue`, `App.vue`, `EffectsLibraryModal.vue`, `ConcealmentConfig.vue`, `SensesConfig.vue`, `ConditionsTracker.vue`, `ConditionPickerModal.vue`, `Roll20PrintModal.vue`, `ImmunityConfig.vue`, `CostBreakdownSidebar.vue`, `MovementConfig.vue`, `DefensesBlock.vue`, `ComprehendConfig.vue`, `EnvironmentConfig.vue`, `ShareModal.vue`, `RulesReference.vue`, `HeroHeader.vue`, `WeakenConfig.vue`, `CombatInitiativeCard.vue`, `SubPowerArrayWorkbench.vue`, `IllusionConfig.vue`, `NullifyConfig.vue`, `VariableConfig.vue`, `TacticalCharacterSheet.vue`?**
  _High betweenness centrality (0.393) - this node is a cross-community bridge._
- **Why does `useHeroStore` connect `heroStore.js` to `helpers.js`, `PowersDeck.vue`, `StepEquipment.vue`, `CustomEquipmentModal.vue`, `GreenRoninSheet.vue`, `TabbedActionHub.vue`, `CharacterWizard.vue`, `ExportImportModal.vue`, `SkillsTable.vue`, `StepAdvantages.vue`, `EffectEditorCanvas.vue`, `powerCalculator.js`, `DiceRollHud.vue`, `EquipmentWorkshop.vue`, `StepSkills.vue`, `calculateEffectCost`, `AdvantageLibraryModal.vue`, `powerBuilderStore.js`, `ComplicationsHub.vue`, `AdvantagesList.vue`, `StepComplications.vue`, `App.vue`, `ConditionsTracker.vue`, `ConditionPickerModal.vue`, `Roll20PrintModal.vue`, `CostBreakdownSidebar.vue`, `DefensesBlock.vue`, `ShareModal.vue`, `HeroHeader.vue`, `CombatInitiativeCard.vue`, `useUiStore`, `StepConcept.vue`, `StepAbilities.vue`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Why does `useUiStore` connect `useUiStore` to `helpers.js`, `PowersDeck.vue`, `StepEquipment.vue`, `CustomEquipmentModal.vue`, `GreenRoninSheet.vue`, `ModifierInspectorModal.vue`, `TabbedActionHub.vue`, `CharacterWizard.vue`, `ExportImportModal.vue`, `SkillsTable.vue`, `StepAdvantages.vue`, `EquipmentWorkshop.vue`, `StepSkills.vue`, `calculateEffectCost`, `AdvantageLibraryModal.vue`, `ComplicationsHub.vue`, `AdvantagesList.vue`, `App.vue`, `ConditionPickerModal.vue`, `Roll20PrintModal.vue`, `DefensesBlock.vue`, `ShareModal.vue`, `HeroHeader.vue`, `CombatInitiativeCard.vue`, `StepConcept.vue`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _532 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `helpers.js` be split into smaller, more focused modules?**
  _Cohesion score 0.052531645569620256 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05152394775036284 - nodes in this community are weakly interconnected._
- **Should `PowersDeck.vue` be split into smaller, more focused modules?**
  _Cohesion score 0.06787330316742081 - nodes in this community are weakly interconnected._