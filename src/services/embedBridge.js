/**
 * MM3e Builder Embed Bridge Service
 * Facilitates bidirectional iframe communication between mm3e-builder-vue and mm3e-dm-screen-vue.
 */

let isInitialized = false;
let updateTimer = null;
let currentParentOrigin = '*';

/**
 * Checks whether the application is running in embedded iframe mode.
 * @returns {boolean}
 */
export function isEmbedMode() {
  if (typeof window === 'undefined') return false;
  try {
    const params = new URLSearchParams(window.location.search);
    const embedParam = params.get('embed');
    const isParamEmbed = embedParam === 'sheet' || embedParam === 'true' || embedParam === '1';
    const isFramed = window.self !== window.top;
    return isParamEmbed || isFramed;
  } catch (e) {
    return false;
  }
}

/**
 * Initializes the message listener and performs the handshake with the parent window.
 * @param {Object} callbacks - Handler callbacks for parent messages
 * @param {Function} callbacks.onLoadCharacter - Called when parent sends MM3E_LOAD_CHARACTER
 * @param {Function} [callbacks.onUpdateField] - Optional field-level update handler
 */
export function initEmbedBridge(callbacks = {}) {
  if (typeof window === 'undefined' || isInitialized) return;
  isInitialized = true;

  window.addEventListener('message', (event) => {
    // Only accept messages with expected structure
    const data = event.data;
    if (!data || typeof data !== 'object') return;
    if (data.source !== 'mm3e-dm-screen') return;

    // Track origin for targeted replies if available
    if (event.origin && event.origin !== 'null') {
      currentParentOrigin = event.origin;
    }

    switch (data.type) {
      case 'MM3E_LOAD_CHARACTER':
        if (typeof callbacks.onLoadCharacter === 'function') {
          callbacks.onLoadCharacter(data.payload?.character, data.payload);
          // Acknowledge receipt
          postToParent('MM3E_CHARACTER_LOADED', {
            characterId: data.payload?.character?.id,
            characterName: data.payload?.character?.name
          });
        }
        break;

      case 'MM3E_UPDATE_FIELD':
        if (typeof callbacks.onUpdateField === 'function') {
          callbacks.onUpdateField(data.payload);
        }
        break;

      case 'MM3E_PING':
        postToParent('MM3E_PONG', { time: Date.now() });
        break;

      default:
        break;
    }
  });

  // Signal to parent that builder is mounted and ready
  postToParent('MM3E_BUILDER_READY', {
    version: '1.0.0',
    capabilities: ['dice-roll', 'edit-sync', 'power-studio', 'condition-matrix']
  });
}

/**
 * Sends a structured postMessage to window.parent
 * @param {string} type - Message type
 * @param {Object} payload - Message payload
 */
export function postToParent(type, payload = {}) {
  if (typeof window === 'undefined' || window.self === window.top) return;

  try {
    window.parent.postMessage({
      source: 'mm3e-builder',
      type,
      payload,
      timestamp: Date.now()
    }, currentParentOrigin || '*');
  } catch (err) {
    console.warn('[EmbedBridge] Failed to post message to parent:', err);
  }
}

/**
 * Sends a debounced character update notification to the parent DM screen.
 * @param {Object} character - Active character object
 * @param {number} [delayMs=300] - Debounce delay in ms
 */
export function sendCharacterUpdate(character, delayMs = 300) {
  if (!isEmbedMode()) return;
  if (!character) return;

  if (updateTimer) {
    clearTimeout(updateTimer);
  }

  updateTimer = setTimeout(() => {
    try {
      const cloned = JSON.parse(JSON.stringify(character));
      postToParent('MM3E_CHARACTER_UPDATED', { character: cloned });
    } catch (e) {
      console.warn('[EmbedBridge] Failed to clone character for update:', e);
    }
  }, delayMs);
}

/**
 * Relays a dice roll event to the parent DM screen.
 * @param {Object} rollData - The roll object from heroStore.lastRoll
 * @param {Object} [character] - The active character
 */
export function sendDiceRoll(rollData, character = null) {
  if (!isEmbedMode()) return;
  if (!rollData) return;

  postToParent('MM3E_DICE_ROLL', {
    roll: rollData,
    characterName: character?.name || 'Character'
  });
}
