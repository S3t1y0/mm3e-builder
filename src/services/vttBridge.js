/**
 * MM3e Vue to Roll20 VTT Bridge Service
 * Manages communication between MM3e Builder (Vue 3) and the MM3e Vue Chrome Extension.
 */

/**
 * Checks whether the MM3e Vue to Roll20 VTT Bridge Chrome extension is installed and active.
 * @returns {boolean}
 */
export function isVTTBridgeActive() {
  if (typeof document === 'undefined') return false;
  return document.documentElement.getAttribute('data-mm3e-bridge-active') === 'true';
}

/**
 * Synchronizes current active hero telemetry with the window for the extension listener.
 * @param {Object} character 
 * @param {number} spentPP 
 * @param {number} totalPP 
 */
export function syncActiveHero(character, spentPP = 0, totalPP = 150) {
  if (typeof window === 'undefined') return;
  window.__MM3E_ACTIVE_HERO__ = {
    name: character?.name || 'Hero',
    powerLevel: Number(character?.powerLevel) || 10,
    spentPP,
    totalPP,
    updatedAt: Date.now()
  };
}

/**
 * Dispatches a dice roll payload to the Chrome extension via custom event.
 * @param {Object} rollData - The roll outcome from heroStore
 * @param {Object} character - The active character
 * @returns {boolean} Whether the event was dispatched
 */
export function sendRollToVTT(rollData, character = null) {
  if (typeof window === 'undefined' || !rollData) return false;

  const charName = character?.name || window.__MM3E_ACTIVE_HERO__?.name || 'Hero';
  const category = (rollData.category || 'check').toLowerCase();

  // Normalize roll type to match Roll20 macro builders (attack, defense, skill, initiative, check)
  let rollType = 'check';
  if (category.includes('attack')) rollType = 'attack';
  else if (category.includes('defense') || category.includes('save') || category.includes('resistance')) rollType = 'defense';
  else if (category.includes('initiative')) rollType = 'initiative';
  else if (category.includes('skill')) rollType = 'skill';

  const payload = {
    characterName: charName,
    rollName: rollData.name || 'Check',
    type: rollType,
    category: rollData.category || 'General',
    bonus: Number(rollData.modifier) || 0,
    d20: Number(rollData.d20),
    rawD20: rollData.rawD20,
    total: Number(rollData.total),
    isCrit: !!rollData.isCrit,
    isCritFail: !!rollData.isCritFail,
    isHeroPointReroll: !!rollData.isHeroPointReroll,
    isBoosted: !!rollData.isBoosted,
    dc: rollData.dc || null,
    degrees: rollData.degrees || null,
    resistance: rollData.resistance || null,
    effectRank: rollData.effectRank || null,
    descriptor: rollData.descriptor || null,
    range: rollData.range || null,
    builderSource: 'mm3e-builder-vue',
    builderVersion: '2.0.0',
    timestamp: Date.now()
  };

  try {
    window.dispatchEvent(new CustomEvent('mm3e-vtt-roll', { detail: payload }));
    return true;
  } catch (err) {
    console.warn('[VTT Bridge] Failed to dispatch mm3e-vtt-roll:', err);
    return false;
  }
}

/**
 * Dispatches a feature card payload (Power, Advantage, Equipment, Complication) to Roll20.
 * @param {Object} featureData 
 * @param {Object} character 
 * @returns {boolean} Whether the event was dispatched
 */
export function sendFeatureToVTT(featureData, character = null) {
  if (typeof window === 'undefined' || !featureData) return false;

  const charName = character?.name || window.__MM3E_ACTIVE_HERO__?.name || 'Hero';

  const payload = {
    name: featureData.name || 'Feature Card',
    category: featureData.category || 'feature', // power, advantage, equipment, complication
    type: featureData.type || featureData.category || 'Feature',
    subtype: featureData.subtype || '',
    ranks: featureData.ranks || 0,
    cost: featureData.cost || 0,
    action: featureData.action || '',
    range: featureData.range || '',
    duration: featureData.duration || '',
    description: featureData.description || featureData.desc || '',
    details: featureData.details || '',
    ...featureData,
    characterName: charName,
    builderSource: 'mm3e-builder-vue',
    builderVersion: '2.0.0',
    timestamp: Date.now()
  };

  try {
    window.dispatchEvent(new CustomEvent('mm3e-vtt-feature', { detail: payload }));
    return true;
  } catch (err) {
    console.warn('[VTT Bridge] Failed to dispatch mm3e-vtt-feature:', err);
    return false;
  }
}

/**
 * Attaches a listener for delivery status feedback from the Chrome extension.
 * @param {Function} callback 
 * @returns {Function} cleanup function
 */
export function onBridgeStatus(callback) {
  if (typeof window === 'undefined' || typeof callback !== 'function') return () => {};

  const handler = (event) => {
    callback(event.detail || {});
  };

  window.addEventListener('mm3e-bridge-status', handler);
  return () => window.removeEventListener('mm3e-bridge-status', handler);
}

/**
 * Attaches a listener for when the Chrome extension connects.
 * @param {Function} callback 
 * @returns {Function} cleanup function
 */
export function onBridgeConnected(callback) {
  if (typeof window === 'undefined' || typeof callback !== 'function') return () => {};

  const handler = (event) => {
    callback(event.detail || {});
  };

  window.addEventListener('mm3e-bridge-connected', handler);
  return () => window.removeEventListener('mm3e-bridge-connected', handler);
}
