# Graph Report - mm3e-builder-vue  (2026-10-14)

## Corpus Check
- 109 files · ~619,103 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 12 file(s) not represented in the graph (top: .css 7, (none) 2, .ico 1)

## Summary
- 1385 nodes · 2415 edges · 82 communities (79 shown, 3 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 27 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d7dbf3c7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ExportStructureModal.vue
- PowersDeck.vue
- CustomEquipmentModal.vue
- ModifierInspectorModal.vue
- ExportImportModal.vue
- SkillsTable.vue
- StepAdvantages.vue
- EffectEditorCanvas.vue
- DiceRollHud.vue
- StepSkills.vue
- AfflictionConfig.vue
- EffectConfigurator.vue
- powerBuilderStore.js
- EquipmentWorkshop.vue
- StepEquipment.vue
- AdvantageLibraryModal.vue
- Mutants & Masterminds 3e Character Builder
- TargetedAttacksList.vue
- EnhancedTraitConfig.vue
- calculateEffectCost
- ComplicationsHub.vue
- CharacterWizard.vue
- AdvantagesList.vue
- StepComplications.vue
- GreenRoninPrintModal.vue
- equipmentCalculator.js
- GreenRoninSheet.vue
- powerCalculator.js
- App.vue
- ConcealmentConfig.vue
- SensesConfig.vue
- ConditionsTracker.vue
- heroStore.js
- ConditionPickerModal.vue
- attacks.js
- Roll20PrintModal.vue
- PowerStudioWorkspace.vue
- powerFormatter.js
- package.json
- ImmunityConfig.vue
- CostBreakdownSidebar.vue
- SensesCard.vue
- MovementConfig.vue
- EffectsLibraryModal.vue
- seamlessScroll.js
- helpers.js
- DefensesBlock.vue
- StepDefenses.vue
- powerRuleDescriptions.js
- ComprehendConfig.vue
- EnvironmentConfig.vue
- TabbedActionHub.vue
- skills.js
- main.js
- RulesReference.vue
- HeroHeader.vue
- uiStore.js
- WeakenConfig.vue
- DeviceContainerStudio.vue
- CombatInitiativeCard.vue
- Mutants & Masterminds 3e Character Builder - Design System
- dependencies
- advantages.js
- isMotivation
- regenerateDescription
- AbilitiesMatrix.vue
- vue
- IllusionConfig.vue
- calculatePowerTotalCost
- initDragScroll
- MorphConfig.vue
- NullifyConfig.vue
- getCombatSkillBonus
- StepAbilities.vue
- scripts
- saveEquipmentItem
- complications.js
- defenses.js
- addAdvantage
- onVehicleSizeChange
- abilities.js
- vercel.json

## God Nodes (most connected - your core abstractions)
1. `vue` - 58 edges
2. `useHeroStore` - 46 edges
3. `calculateEffectCost()` - 33 edges
4. `useUiStore` - 33 edges
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

## Communities (82 total, 3 thin omitted)

### Community 0 - "ExportStructureModal.vue"
Cohesion: 0.06
Nodes (40): lz-string, loadFromHash(), closeModal(), copied, currentPreset, currentPresetLabel, heroStore, livePreviewText (+32 more)

### Community 1 - "PowersDeck.vue"
Cohesion: 0.07
Nodes (35): broadcastComplication(), exportRoll20(), activeCompoundTabs, activeDeviceTabs, broadcastEffect(), broadcastExtra(), broadcastFlaw(), broadcastPower() (+27 more)

### Community 2 - "CustomEquipmentModal.vue"
Cohesion: 0.05
Nodes (22): armorConfig, budgetInfo, calculatedTotalCost, categoryCards, currentStep, customDescription, gadgetConfig, getHQBaseTough() (+14 more)

### Community 3 - "ModifierInspectorModal.vue"
Cohesion: 0.07
Nodes (29): activeCategory, activeTab, baseCatalog, builderStore, calculatedExtrasPerRank, calculatedFlawsPerRank, categories, compatibleCount (+21 more)

### Community 4 - "ExportImportModal.vue"
Cohesion: 0.07
Nodes (24): valibot, activeMode, { copy, copied }, exportJsonString, exportSizeKb, fileInputRef, formattedLastSaved, handleDownload() (+16 more)

### Community 5 - "SkillsTable.vue"
Cohesion: 0.07
Nodes (24): activeCategory, calculateTotalBonus(), categories, currentSelectedAbility, filteredRuleSkills, getAdvantageBonusForSkill(), getAdvantageNameForSkill(), getEnhancedRanks() (+16 more)

### Community 6 - "StepAdvantages.vue"
Cohesion: 0.07
Nodes (25): activeCategory, activeCategoryBreakdown, activeSpecAdv, addAdvantage(), catalogScrollRef, confirmAddWithSpec(), confirmCreateCustomAdv(), customForm (+17 more)

### Community 7 - "EffectEditorCanvas.vue"
Cohesion: 0.07
Nodes (22): activeSub, builderStore, editorCanvasTitle, getEffectIcon(), getSubEffectCost(), validation, builderStore, currentBaseInfo (+14 more)

### Community 8 - "DiceRollHud.vue"
Cohesion: 0.08
Nodes (21): dismissRoll(), displayD20, heroPointsCount, heroStore, isHistoryOpen, isHovered, isRolling, progressPercent (+13 more)

### Community 9 - "StepSkills.vue"
Cohesion: 0.09
Nodes (23): activeCategory, calculateTotalBonus(), categories, filteredSkills, focusInputRef, getAdvantageBonusForSkill(), getAdvantageNameForSkill(), getEnhancedRanks() (+15 more)

### Community 10 - "AfflictionConfig.vue"
Cohesion: 0.09
Nodes (26): afflictionResistanceOptions, altResistanceMod, applyAfflictionPreset(), cfg, conditionsPerDegree, emit, extraConditionMod, extraConditionRanks (+18 more)

### Community 11 - "EffectConfigurator.vue"
Cohesion: 0.08
Nodes (26): activeSubConfigComponent, AVAILABLE_CUSTOM_ICONS, calculatedBaseCostDisplay, cfg, closeCustomSubModal(), customCategoryOptions, customForm, customSubModalTargetEffect (+18 more)

### Community 12 - "powerBuilderStore.js"
Cohesion: 0.13
Nodes (25): calculatePowerCombatMetrics(), calculatePowerDetailedBreakdown(), src_rules_powerengine_calculatepowercombatmetrics, src_rules_powerengine_calculatepowerdetailedbreakdown, src_rules_powerengine_createemptycompoundeffect, src_rules_powerengine_createemptydevicesubpower, src_rules_powerengine_createemptyeffect, src_rules_powerengine_createemptypower (+17 more)

### Community 13 - "EquipmentWorkshop.vue"
Cohesion: 0.10
Nodes (17): activeFilter, budgetInfo, customStudioCategory, filteredPresets, filteredResources, getCategoryCount(), getResIconClass(), getSubtypeLabel() (+9 more)

### Community 14 - "StepEquipment.vue"
Cohesion: 0.10
Nodes (17): activeFilter, budgetInfo, customStudioCategory, filteredPresets, filteredResources, getCategoryCount(), getResIconClass(), getSubtypeLabel() (+9 more)

### Community 15 - "AdvantageLibraryModal.vue"
Cohesion: 0.08
Nodes (15): activeCategory, activeSpecAdv, customForm, filteredAdvantages, gridRef, heroStore, searchInputRef, searchQuery (+7 more)

### Community 16 - "Mutants & Masterminds 3e Character Builder"
Cohesion: 0.08
Nodes (23): Application Modules, Architecture & Directory Layout, Character Creation Wizard, Contents, Contributing, Development Commands, Dice Mechanics & VTT Bridge, Equipment & Resources (+15 more)

### Community 17 - "TargetedAttacksList.vue"
Cohesion: 0.11
Nodes (14): activeLinkedTracks, currentFilter, expandedAttackIds, filteredAttacks, getActiveTrack(), getActiveTrackIndex(), getAttackButtonTitle(), getEffectiveAttackBonus() (+6 more)

### Community 18 - "EnhancedTraitConfig.vue"
Cohesion: 0.11
Nodes (17): applyTraitPreset(), calculatedBaseCostDisplay, calculatedTotalPPDisplay, cfg, currentCategoryObj, currentTraitCategory, customSubModal, emit (+9 more)

### Community 19 - "calculateEffectCost"
Cohesion: 0.11
Nodes (21): effectCost, netEffectCost, arrayCapacity, builderStore, capacityPercent, getSlotEffectCost(), headroom, highestSlotCost (+13 more)

### Community 20 - "ComplicationsHub.vue"
Cohesion: 0.09
Nodes (14): activeCatalogPresets, allComplications, editingId, formDesc, formKind, formName, formType, generalComplications (+6 more)

### Community 21 - "CharacterWizard.vue"
Cohesion: 0.15
Nodes (20): activeStepComponent, activeStepInfo, currentStep, finishWizard(), heroStore, steps, uiStore, finishWizard() (+12 more)

### Community 22 - "AdvantagesList.vue"
Cohesion: 0.13
Nodes (16): availableCategories, broadcastAdvantage(), editForm, editingAdv, effectiveAdvantages, filteredAdvantages, getAdvCategory(), getAdvDesc() (+8 more)

### Community 23 - "StepComplications.vue"
Cohesion: 0.09
Nodes (14): complicationCategories, editingId, generalComplications, heroStore, modalMode, motivations, narrativeStatus, newCompDesc (+6 more)

### Community 24 - "GreenRoninPrintModal.vue"
Cohesion: 0.14
Nodes (15): addZoomListeners(), adjustZoom(), calculateDefaultZoom(), handleKeyDown(), handleWheelZoom(), removeZoomListeners(), scalerStyle, scaleValue (+7 more)

### Community 25 - "equipmentCalculator.js"
Cohesion: 0.16
Nodes (17): costBreakdown, ARMOR_EXTRAS, calculateArmorCost(), calculateGadgetCost(), calculateHQCost(), calculateTotalEquipmentCost(), calculateVehicleCost(), calculateWeaponCost() (+9 more)

### Community 26 - "GreenRoninSheet.vue"
Cohesion: 0.14
Nodes (16): allPowers, displayAttacks, emptyOverflowLinesCount, emptyPrimaryLinesCount, getPowerBlock(), getPowerRowCount(), getSkillAbility(), hasPage2Content (+8 more)

### Community 27 - "powerCalculator.js"
Cohesion: 0.19
Nodes (11): BASE_EFFECT_ICONS, BASE_EFFECTS, EFFECT_CATEGORIES, CONFIGURABLE_EFFECTS, EXTRAS, FLAWS, src_data_index_base_effects, src_data_index_configurable_effects (+3 more)

### Community 28 - "App.vue"
Cohesion: 0.14
Nodes (12): builderStore, heroStore, isEmbed, isToolsOpen, runtimeError, toolsDropdownRef, uiStore, getTargetPathname() (+4 more)

### Community 29 - "ConcealmentConfig.vue"
Cohesion: 0.14
Nodes (12): cfg, concealmentSearch, customSubModal, emit, filteredConcealments, openCustomSubModal(), props, selectedConcealmentCategory (+4 more)

### Community 30 - "SensesConfig.vue"
Cohesion: 0.14
Nodes (12): cfg, customSubModal, emit, filteredFaculties, openCustomSubModal(), props, selectedFacultiesList, selectedSensesCategory (+4 more)

### Community 31 - "ConditionsTracker.vue"
Cohesion: 0.12
Nodes (8): ABILITY_CODES, activeConditions, activeDebilitatedSummary, heroStore, hoveredAbility, isDebilitatedDrawerOpen, isDirectlyActive(), isInheritedActive()

### Community 32 - "heroStore.js"
Cohesion: 0.19
Nodes (13): ARCHETYPES, calculateConditionModifiers(), COMBINED_MAP, DEATH_FAILURE_LIMIT, DEBILITATED_EFFECTS, DYING_DC, evaluateDyingFortitudeCheck(), resolveActiveConditionSet() (+5 more)

### Community 33 - "ConditionPickerModal.vue"
Cohesion: 0.13
Nodes (11): ABILITY_CODES, activeCount, activeDebilitatedSummary, filteredConditions, filterTab, heroStore, hoveredAbility, isDirectlyActive() (+3 more)

### Community 34 - "attacks.js"
Cohesion: 0.21
Nodes (15): allConditions, compiledAttacks, effectRangeDetails, activeConditionItems, buildEffectBreakdown(), calculateDegrees(), compileTargetedAttacks(), mergeLinkedAttackEffects() (+7 more)

### Community 35 - "Roll20PrintModal.vue"
Cohesion: 0.12
Nodes (11): abilityList, basicConditions, { copy }, currentTab, defenseList, filteredMacros, heroStore, macroFilter (+3 more)

### Community 36 - "PowerStudioWorkspace.vue"
Cohesion: 0.13
Nodes (11): builderStore, canvasKey, canvasTitle, currentPowerSelectValue, getSlotCombinedValue(), getSubEffectCost(), getSubPowerCost(), heroStore (+3 more)

### Community 37 - "powerFormatter.js"
Cohesion: 0.31
Nodes (14): formatMeasurementDistance(), calculateDC(), formatEffectInlineSummary(), formatEffectMechanics(), formatLinkedSubEntry(), formatModifiers(), formatPowerStatblock(), formatRange() (+6 more)

### Community 38 - "package.json"
Cohesion: 0.14
Nodes (13): description, devDependencies, vite, @vitejs/plugin-vue, name, private, type, version (+5 more)

### Community 39 - "ImmunityConfig.vue"
Cohesion: 0.16
Nodes (10): cfg, customSubModal, emit, filteredImmunities, immunitySearch, openCustomSubModal(), props, selectedImmunityCategory (+2 more)

### Community 40 - "CostBreakdownSidebar.vue"
Cohesion: 0.13
Nodes (14): activeEffCost, budgetPercentages, builderStore, combatProfile, heroStore, isEditingExisting, isOverBudget, originalPowerCost (+6 more)

### Community 41 - "SensesCard.vue"
Cohesion: 0.13
Nodes (11): activePerceptionMod, aweMod, heroStore, passivePerception, percRanks, specialSenses, uiStore, colLeftRef (+3 more)

### Community 42 - "MovementConfig.vue"
Cohesion: 0.19
Nodes (9): allMovementModes, cfg, customSubModal, emit, openCustomSubModal(), props, stepMovementMode(), toggleMovementMode() (+1 more)

### Community 43 - "EffectsLibraryModal.vue"
Cohesion: 0.14
Nodes (8): activeCategory, builderStore, filteredEffects, rangeFilter, searchInputRef, searchQuery, src_rules_powerengine_base_effects, src_rules_powerengine_effect_categories

### Community 44 - "seamlessScroll.js"
Cohesion: 0.31
Nodes (13): applyScrollStep(), findParentScroller(), findScrollableContainer(), getMainViewport(), getModalContainer(), getNormalizedDelta(), hasActiveModal(), initSeamlessScroll() (+5 more)

### Community 45 - "helpers.js"
Cohesion: 0.24
Nodes (11): displaySkills, macrosList, resolveEffectRulesBlock(), CORE_SKILLS, formatEffectRulesBBCode(), formatEffectRulesMarkdown(), formatEffectRulesPlainText(), getAllCharacterSkills() (+3 more)

### Community 46 - "DefensesBlock.vue"
Cohesion: 0.15
Nodes (10): combatDefenses, condMods, defensiveRollBonus, enhDefenses, equipmentArmorBonus, equipmentShieldBonus, heroStore, protectionBonus (+2 more)

### Community 47 - "StepDefenses.vue"
Cohesion: 0.15
Nodes (10): dodgeTotal, fortitudeTotal, heroStore, isStaAbsent, maxCap, parryTotal, setDefense(), singleWillCap (+2 more)

### Community 48 - "powerRuleDescriptions.js"
Cohesion: 0.19
Nodes (12): MEASUREMENT_DISTANCE_TABLE, src_rules_powerengine_extras, src_rules_powerengine_flaws, EFFECT_RULE_SUMMARIES, formatSpeedRank(), formatTimeRank(), getDynamicEffectRuleSummary(), getEffectRuleSummary() (+4 more)

### Community 49 - "ComprehendConfig.vue"
Cohesion: 0.21
Nodes (8): allComprehendModes, cfg, customSubModal, emit, openCustomSubModal(), props, toggleComprehend(), updateConfig()

### Community 50 - "EnvironmentConfig.vue"
Cohesion: 0.21
Nodes (8): allEnvironmentElements, cfg, customSubModal, emit, openCustomSubModal(), props, toggleEnvironment(), updateConfig()

### Community 51 - "TabbedActionHub.vue"
Cohesion: 0.18
Nodes (10): activeTab, advantagesCount, attacksCount, complicationsCount, conditionsCount, equipmentCount, heroStore, powersCount (+2 more)

### Community 52 - "skills.js"
Cohesion: 0.27
Nodes (11): CLOSE_CATEGORIES, findMatchingCombatSkill(), getCombatSkillMatchScore(), isCloseCombatMatch(), isRangedCombatMatch(), normalizeCombatTerm(), RANGED_CATEGORIES, SKILL_RANKS_PER_PP (+3 more)

### Community 53 - "main.js"
Cohesion: 0.18
Nodes (10): pinia, remixicon, app, pinia, src_styles_builder, src_styles_green_ronin_sheet, src_styles_main, src_styles_roll20_print (+2 more)

### Community 54 - "RulesReference.vue"
Cohesion: 0.18
Nodes (10): activeSection, combatActions, combatManeuvers, filteredActions, filteredBasicConditions, filteredCombinedConditions, filteredManeuvers, measurementRows (+2 more)

### Community 55 - "HeroHeader.vue"
Cohesion: 0.18
Nodes (6): conditionDescMap, heroInitials, heroStore, rollInitiative(), showBioDrawer, uiStore

### Community 56 - "uiStore.js"
Cohesion: 0.22
Nodes (6): heroStore, origins, uiStore, DEFAULT_EXPORT_OPTIONS, loadStoredExportOptions(), useUiStore

### Community 57 - "WeakenConfig.vue"
Cohesion: 0.29
Nodes (8): cfg, currentWeakenCategory, emit, props, selectWeakenCategory(), selectWeakenResistance(), selectWeakenTrait(), updateConfig()

### Community 58 - "DeviceContainerStudio.vue"
Cohesion: 0.22
Nodes (7): builderStore, discountAmount, editorCanvasTitle, getSubPowerCost(), hasActiveSubArray, calculateDeviceDiscount(), src_rules_powerengine_calculatedevicediscount

### Community 59 - "CombatInitiativeCard.vue"
Cohesion: 0.20
Nodes (7): baseAgl, hasSeizeInitiative, heroStore, improvedInitBonus, improvedInitRanks, initiativeTotal, uiStore

### Community 60 - "Mutants & Masterminds 3e Character Builder - Design System"
Cohesion: 0.22
Nodes (8): 1. Dials & Tone, 2. Color System, 3. Typography, 4. Mobile Ergonomics & Accessibility, Core Brand Tokens, Mutants & Masterminds 3e Character Builder - Design System, Rule Category Accents (Calibrated for WCAG AA >= 4.5:1), Theme Foundations (Dark Mode - Default Tabletop Theme)

### Community 61 - "dependencies"
Cohesion: 0.22
Nodes (9): dependencies, lz-string, pinia, radash, remixicon, valibot, @vercel/analytics, vue (+1 more)

### Community 62 - "advantages.js"
Cohesion: 0.25
Nodes (7): deleteInstance(), ADVANTAGE_CATEGORIES, ADVANTAGE_COST_PER_RANK, ADVANTAGES, ADVANTAGES_CATALOG, formatAdvantageDisplayName(), getAdvantageRule()

### Community 63 - "isMotivation"
Cohesion: 0.25
Nodes (9): adjustHeroPoints(), getCategoryLabel(), getComplicationIcon(), openEdit(), triggerTrait(), getComplicationIcon(), openEditDialog(), findComplicationPreset() (+1 more)

### Community 64 - "regenerateDescription"
Cohesion: 0.32
Nodes (8): ensureItemName(), getNameSuggestions(), goToStep(), nextStep(), regenerateDescription(), selectCategory(), selectGadgetPack(), generateEquipmentDescription()

### Community 65 - "AbilitiesMatrix.vue"
Cohesion: 0.32
Nodes (6): ABILITIES_CONFIG, getEffectiveRank(), getEnhancedRanks(), handleRollCheck(), heroStore, uiStore

### Community 66 - "vue"
Cohesion: 0.38
Nodes (6): vue, cfg, emit, props, selectVariableTheme(), updateConfig()

### Community 67 - "IllusionConfig.vue"
Cohesion: 0.38
Nodes (5): cfg, emit, props, toggleIllusionSense(), updateConfig()

### Community 68 - "calculatePowerTotalCost"
Cohesion: 0.33
Nodes (5): builderStore, getPowerCost(), heroStore, calculatePowerTotalCost(), src_rules_powerengine_calculatepowertotalcost

### Community 69 - "initDragScroll"
Cohesion: 0.48
Nodes (5): initDragScroll(), onMouseDown(), onMouseMove(), onMouseUp(), stopMomentum()

### Community 70 - "MorphConfig.vue"
Cohesion: 0.47
Nodes (5): cfg, emit, props, selectMorphScope(), updateConfig()

### Community 71 - "NullifyConfig.vue"
Cohesion: 0.47
Nodes (5): cfg, emit, props, selectNullifyDescriptor(), updateConfig()

### Community 72 - "getCombatSkillBonus"
Cohesion: 0.40
Nodes (5): getCalculatedAtkBonus(), getWeaponAttackBonus(), rollWeaponAttack(), getWeaponAttackBonus(), getCombatSkillBonus()

### Community 74 - "scripts"
Cohesion: 0.50
Nodes (4): scripts, build, dev, preview

### Community 75 - "saveEquipmentItem"
Cohesion: 0.67
Nodes (4): closeModal(), emit, getSpeedMph(), saveEquipmentItem()

### Community 76 - "complications.js"
Cohesion: 0.50
Nodes (3): COMPLICATIONS_CATALOG, MOTIVATIONS_CATALOG, validateNarrativeTraits()

### Community 77 - "defenses.js"
Cohesion: 0.50
Nodes (3): COMBAT_INITIATIVE, DEFENSE_COST_PER_RANK, DEFENSES

### Community 78 - "addAdvantage"
Cohesion: 0.67
Nodes (3): addAdvantage(), confirmAddWithSpec(), confirmCreateCustomAdv()

### Community 79 - "onVehicleSizeChange"
Cohesion: 0.67
Nodes (3): getVehicleBaseStr(), getVehicleBaseTough(), onVehicleSizeChange()

## Knowledge Gaps
- **538 isolated node(s):** `name`, `private`, `version`, `description`, `type` (+533 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 807 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vue` connect `vue` to `ExportStructureModal.vue`, `PowersDeck.vue`, `CustomEquipmentModal.vue`, `ModifierInspectorModal.vue`, `ExportImportModal.vue`, `SkillsTable.vue`, `StepAdvantages.vue`, `EffectEditorCanvas.vue`, `DiceRollHud.vue`, `StepSkills.vue`, `AfflictionConfig.vue`, `EffectConfigurator.vue`, `EquipmentWorkshop.vue`, `StepEquipment.vue`, `AdvantageLibraryModal.vue`, `TargetedAttacksList.vue`, `EnhancedTraitConfig.vue`, `calculateEffectCost`, `ComplicationsHub.vue`, `CharacterWizard.vue`, `AdvantagesList.vue`, `StepComplications.vue`, `GreenRoninPrintModal.vue`, `GreenRoninSheet.vue`, `App.vue`, `ConcealmentConfig.vue`, `SensesConfig.vue`, `ConditionsTracker.vue`, `ConditionPickerModal.vue`, `Roll20PrintModal.vue`, `PowerStudioWorkspace.vue`, `package.json`, `ImmunityConfig.vue`, `CostBreakdownSidebar.vue`, `SensesCard.vue`, `MovementConfig.vue`, `EffectsLibraryModal.vue`, `DefensesBlock.vue`, `StepDefenses.vue`, `ComprehendConfig.vue`, `EnvironmentConfig.vue`, `TabbedActionHub.vue`, `main.js`, `RulesReference.vue`, `HeroHeader.vue`, `WeakenConfig.vue`, `DeviceContainerStudio.vue`, `CombatInitiativeCard.vue`, `IllusionConfig.vue`, `MorphConfig.vue`, `NullifyConfig.vue`?**
  _High betweenness centrality (0.373) - this node is a cross-community bridge._
- **Why does `useHeroStore` connect `heroStore.js` to `ExportStructureModal.vue`, `PowersDeck.vue`, `CustomEquipmentModal.vue`, `ExportImportModal.vue`, `SkillsTable.vue`, `StepAdvantages.vue`, `EffectEditorCanvas.vue`, `DiceRollHud.vue`, `StepSkills.vue`, `powerBuilderStore.js`, `EquipmentWorkshop.vue`, `StepEquipment.vue`, `AdvantageLibraryModal.vue`, `TargetedAttacksList.vue`, `ComplicationsHub.vue`, `CharacterWizard.vue`, `AdvantagesList.vue`, `StepComplications.vue`, `GreenRoninSheet.vue`, `App.vue`, `ConditionsTracker.vue`, `ConditionPickerModal.vue`, `Roll20PrintModal.vue`, `PowerStudioWorkspace.vue`, `CostBreakdownSidebar.vue`, `SensesCard.vue`, `DefensesBlock.vue`, `StepDefenses.vue`, `TabbedActionHub.vue`, `HeroHeader.vue`, `uiStore.js`, `CombatInitiativeCard.vue`, `AbilitiesMatrix.vue`, `calculatePowerTotalCost`, `StepAbilities.vue`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **Why does `useUiStore` connect `uiStore.js` to `ExportStructureModal.vue`, `PowersDeck.vue`, `CustomEquipmentModal.vue`, `ModifierInspectorModal.vue`, `ExportImportModal.vue`, `SkillsTable.vue`, `StepAdvantages.vue`, `StepSkills.vue`, `EquipmentWorkshop.vue`, `StepEquipment.vue`, `AdvantageLibraryModal.vue`, `TargetedAttacksList.vue`, `ComplicationsHub.vue`, `CharacterWizard.vue`, `AdvantagesList.vue`, `GreenRoninPrintModal.vue`, `GreenRoninSheet.vue`, `App.vue`, `ConditionPickerModal.vue`, `Roll20PrintModal.vue`, `PowerStudioWorkspace.vue`, `SensesCard.vue`, `DefensesBlock.vue`, `TabbedActionHub.vue`, `HeroHeader.vue`, `CombatInitiativeCard.vue`, `AbilitiesMatrix.vue`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _538 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ExportStructureModal.vue` be split into smaller, more focused modules?**
  _Cohesion score 0.05649350649350649 - nodes in this community are weakly interconnected._
- **Should `PowersDeck.vue` be split into smaller, more focused modules?**
  _Cohesion score 0.06787330316742081 - nodes in this community are weakly interconnected._
- **Should `CustomEquipmentModal.vue` be split into smaller, more focused modules?**
  _Cohesion score 0.05121951219512195 - nodes in this community are weakly interconnected._