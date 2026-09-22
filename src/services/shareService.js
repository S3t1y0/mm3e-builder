import LZString from 'lz-string';

export const CLOUDFLARE_WORKER_URL = 'https://mm3e-worker.tiyocaniago.workers.dev';

/**
 * Prunes static metadata, redundant descriptors, and empty objects
 * to ensure the payload remains minimal (< 5 KB) before KV storage or URL compression.
 */
export function pruneCharacterForShare(rawChar) {
  if (!rawChar || typeof rawChar !== 'object') return rawChar;

  const pruneModifier = (m) => {
    if (!m) return m;
    const out = { name: m.name };
    if (m.cost !== undefined) out.cost = m.cost;
    if (m.ranks && m.ranks !== 1) out.ranks = m.ranks;
    if (m.type && m.type !== 'per_rank') out.type = m.type;
    if (m.customText) out.customText = m.customText;
    if (m.config && Object.keys(m.config).length > 0 && Object.values(m.config).some(v => v !== '' && v !== undefined)) {
      out.config = m.config;
    }
    return out;
  };

  const pruneEffect = (eff) => {
    if (!eff) return eff;
    const out = {
      baseEffect: eff.baseEffect || eff.name || eff.effectType,
      ranks: eff.ranks || 1
    };
    if (eff.name && eff.name !== out.baseEffect) out.name = eff.name;
    if (eff.id) out.id = eff.id;
    if (eff.action && eff.action !== 'Standard') out.action = eff.action;
    if (eff.range && eff.range !== 'Close') out.range = eff.range;
    if (eff.duration && eff.duration !== 'Instant') out.duration = eff.duration;
    if (eff.resistance && eff.resistance !== 'Toughness') out.resistance = eff.resistance;
    if (eff.baseCost !== undefined) out.baseCost = eff.baseCost;
    if (Array.isArray(eff.extras) && eff.extras.length > 0) {
      out.extras = eff.extras.map(pruneModifier);
    }
    if (Array.isArray(eff.flaws) && eff.flaws.length > 0) {
      out.flaws = eff.flaws.map(pruneModifier);
    }
    if (eff.config && Object.keys(eff.config).length > 0 && Object.values(eff.config).some(v => v !== '' && v !== undefined)) {
      out.config = eff.config;
    }
    return out;
  };

  const prunePower = (p) => {
    if (!p) return p;
    const out = {
      id: p.id,
      name: p.name,
      type: p.type || 'standard'
    };
    if (p.mainEffect) out.mainEffect = pruneEffect(p.mainEffect);
    if (Array.isArray(p.linkedEffects) && p.linkedEffects.length > 0) {
      out.linkedEffects = p.linkedEffects.map(pruneEffect);
    }
    if (Array.isArray(p.alternateEffects) && p.alternateEffects.length > 0) {
      out.alternateEffects = p.alternateEffects.map(ae => {
        const altOut = {
          id: ae.id,
          name: ae.name,
          isDynamic: Boolean(ae.isDynamic),
          effect: pruneEffect(ae.effect || ae.mainEffect || ae)
        };
        const rawAltLinked = (Array.isArray(ae.linkedEffects) && ae.linkedEffects.length > 0)
          ? ae.linkedEffects
          : (Array.isArray(ae.effect?.linkedEffects) ? ae.effect.linkedEffects : []);
        if (rawAltLinked.length > 0) {
          altOut.linkedEffects = rawAltLinked.map(pruneEffect);
        }
        return altOut;
      });
    }
    if (p.deviceConfig && p.deviceConfig.type && p.deviceConfig.type !== 'none') {
      out.deviceConfig = p.deviceConfig;
    }
    if (Array.isArray(p.devicePowers) && p.devicePowers.length > 0) {
      out.devicePowers = p.devicePowers.map(dp => {
        const subOut = {
          id: dp.id,
          name: dp.name,
          effect: pruneEffect(dp.effect || dp.mainEffect || dp)
        };
        const rawSubLinked = (Array.isArray(dp.linkedEffects) && dp.linkedEffects.length > 0)
          ? dp.linkedEffects
          : (Array.isArray(dp.effect?.linkedEffects) && dp.effect.linkedEffects.length > 0
            ? dp.effect.linkedEffects
            : (Array.isArray(dp.mainEffect?.linkedEffects) ? dp.mainEffect.linkedEffects : []));
        if (rawSubLinked.length > 0) {
          subOut.linkedEffects = rawSubLinked.map(pruneEffect);
        }
        if (Array.isArray(dp.alternateEffects) && dp.alternateEffects.length > 0) {
          subOut.alternateEffects = dp.alternateEffects.map(ae => {
            const altOut = {
              id: ae.id,
              name: ae.name,
              isDynamic: Boolean(ae.isDynamic),
              effect: pruneEffect(ae.effect || ae.mainEffect || ae)
            };
            const rawAltLinked = (Array.isArray(ae.linkedEffects) && ae.linkedEffects.length > 0)
              ? ae.linkedEffects
              : (Array.isArray(ae.effect?.linkedEffects) ? ae.effect.linkedEffects : []);
            if (rawAltLinked.length > 0) {
              altOut.linkedEffects = rawAltLinked.map(pruneEffect);
            }
            return altOut;
          });
        }
        if (dp.activeSlotId && dp.activeSlotId !== 'main') subOut.activeSlotId = dp.activeSlotId;
        if (dp.active !== undefined && dp.active !== true) subOut.active = dp.active;
        if (Array.isArray(dp.descriptors) && dp.descriptors.length > 0) subOut.descriptors = dp.descriptors;
        return subOut;
      });
    }
    if (Array.isArray(p.descriptors) && p.descriptors.length > 0) {
      out.descriptors = p.descriptors;
    }
    if (p.notes) out.notes = p.notes;
    if (p.activeSlotId && p.activeSlotId !== 'main') out.activeSlotId = p.activeSlotId;
    if (p.active !== undefined && p.active !== true) out.active = p.active;
    return out;
  };

  const out = {
    id: rawChar.id,
    name: rawChar.name,
    player: rawChar.player || '',
    identity: rawChar.identity || '',
    isSecretIdentity: Boolean(rawChar.isSecretIdentity),
    baseOfOperations: rawChar.baseOfOperations || '',
    powerLevel: rawChar.powerLevel || 10,
    heroPoints: rawChar.heroPoints || 1,
    abilities: rawChar.abilities || {},
    defensesBought: rawChar.defensesBought || {},
    skills: (Array.isArray(rawChar.skills) ? rawChar.skills : [])
      .filter(s => (s.ranks || 0) > 0)
      .map(s => ({ name: s.name, ranks: s.ranks, subtype: s.subtype || '' })),
    advantages: (Array.isArray(rawChar.advantages) ? rawChar.advantages : [])
      .map(a => ({ name: a.name, ranks: a.ranks || 1 })),
    powers: (Array.isArray(rawChar.powers) ? rawChar.powers : []).map(prunePower)
  };

  if (rawChar.notes) out.notes = rawChar.notes;
  if (Array.isArray(rawChar.customAttacks) && rawChar.customAttacks.length > 0) {
    out.customAttacks = rawChar.customAttacks;
  }
  if (Array.isArray(rawChar.resources) && rawChar.resources.length > 0) {
    out.resources = rawChar.resources;
  }
  if (Array.isArray(rawChar.complications) && rawChar.complications.length > 0) {
    out.complications = rawChar.complications.map(c => ({
      type: c.type || 'Complication',
      category: c.category || '',
      name: c.name || '',
      desc: c.desc || '',
      icon: c.icon || ''
    }));
  }

  return out;
}

/**
 * Decodes legacy base64url string to Uint8Array for backward compatibility with Deflate slugs.
 */
function base64UrlToUint8(base64url) {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Generates a shareable URL for the character.
 * Tries Cloudflare Worker KV first for an ultra-compact ~30 character URL (#s=<id>).
 * Gracefully falls back to LZ-String URL hash (#hero=<slug>) if Cloudflare is unreachable or offline mode is requested.
 *
 * @param {Object} character - Full hero character state
 * @param {Object} options - { forceOffline: boolean }
 * @returns {Promise<{ url: string, type: 'kv'|'compressed', id: string|null, originalSize: number, compressedSize: number, ratio: number, charCount: number }>}
 */
export async function generateShareUrl(character, { forceOffline = false } = {}) {
  const baseUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}`
    : 'https://localhost/';
  const pruned = pruneCharacterForShare(character);
  const jsonStr = JSON.stringify(pruned);

  // 1. Try Cloudflare Worker KV API if not forced offline
  if (!forceOffline) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(`${CLOUDFLARE_WORKER_URL}/api/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: jsonStr,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && data.id) {
          const url = `${baseUrl}#s=${data.id}`;
          return {
            url,
            type: 'kv',
            id: data.id,
            originalSize: jsonStr.length,
            compressedSize: data.id.length,
            ratio: Math.round((1 - data.id.length / jsonStr.length) * 100),
            charCount: url.length
          };
        }
      }
    } catch (err) {
      console.warn('Cloudflare Worker KV not reachable, falling back to local compression slug:', err);
    }
  }

  // 2. Fallback: Stateless URL compression using LZ-String
  const compressed = LZString.compressToEncodedURIComponent(jsonStr);
  const url = `${baseUrl}#hero=${compressed}`;
  return {
    url,
    type: 'compressed',
    id: null,
    originalSize: jsonStr.length,
    compressedSize: compressed.length,
    ratio: Math.round((1 - compressed.length / jsonStr.length) * 100),
    charCount: url.length
  };
}

/**
 * Fetches character data from Cloudflare Worker KV by ID.
 * @param {string} id
 * @returns {Promise<Object>}
 */
export async function fetchSharedCharacterFromKv(id) {
  if (!id) throw new Error('Invalid or empty share ID.');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  const res = await fetch(`${CLOUDFLARE_WORKER_URL}/api/get?id=${encodeURIComponent(id)}`, {
    signal: controller.signal
  });
  clearTimeout(timeoutId);

  if (!res.ok) {
    throw new Error(`Failed to retrieve character from Cloudflare KV (HTTP ${res.status})`);
  }

  const data = await res.json();
  if (!data || typeof data !== 'object') {
    throw new Error('Received invalid character payload from Cloudflare KV.');
  }

  return data;
}

/**
 * Universal hash parser that supports:
 * - #s=<id> (Cloudflare Worker KV short link)
 * - #hero=<slug> (LZ-String compressed)
 * - #share=<slug> (Legacy Deflate / LZ-String compressed)
 *
 * @param {string} hash
 * @returns {Promise<Object|null>}
 */
export async function parseSharedCharacterFromHash(hash) {
  if (!hash) return null;
  const cleanHash = hash.startsWith('#') ? hash.slice(1) : hash;

  // 1. Cloudflare KV Short Link (#s=xxxxxx)
  if (cleanHash.startsWith('s=')) {
    const id = cleanHash.slice(2).trim();
    if (id) {
      return await fetchSharedCharacterFromKv(id);
    }
  }

  // 2. Compressed slug (#hero=... or #share=...)
  let slug = '';
  if (cleanHash.startsWith('hero=')) {
    slug = cleanHash.slice(5).trim();
  } else if (cleanHash.startsWith('share=')) {
    slug = cleanHash.slice(6).trim();
  } else if (cleanHash.startsWith('data=')) {
    slug = cleanHash.slice(5).trim();
  }

  if (!slug) return null;

  // Try LZ-String decompression first
  try {
    const decompressed = LZString.decompressFromEncodedURIComponent(slug);
    if (decompressed) {
      const char = JSON.parse(decompressed);
      if (char && typeof char === 'object') return char;
    }
  } catch (err) {
    // Continue to fallback
  }

  // Fallback: Try browser DecompressionStream for legacy raw deflate Base64URL slugs
  if (typeof DecompressionStream !== 'undefined') {
    try {
      const bytes = base64UrlToUint8(slug);
      const ds = new DecompressionStream('deflate-raw');
      const writer = ds.writable.getWriter();
      writer.write(bytes);
      writer.close();

      const text = await new Response(ds.readable).text();
      const char = JSON.parse(text);
      if (char && typeof char === 'object') return char;
    } catch (err) {
      console.warn('Fallback DecompressionStream failed:', err);
    }
  }

  return null;
}

/**
 * Clears the share hash from the browser address bar without triggering a reload.
 */
export function clearShareHash() {
  if (typeof window === 'undefined') return;
  const hash = window.location.hash;
  if (
    hash.startsWith('#s=') ||
    hash.startsWith('#hero=') ||
    hash.startsWith('#share=') ||
    hash.startsWith('#data=')
  ) {
    const cleanUrl = `${window.location.pathname}${window.location.search}`;
    window.history.replaceState(null, document.title, cleanUrl);
  }
}
