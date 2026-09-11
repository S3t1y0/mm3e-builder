// js/storage/shareUrl.js
/**
 * 100% Serverless Character Sharing via Compressed URL Slugs
 * Uses native browser CompressionStream / DecompressionStream ('deflate-raw')
 * with Base64URL encoding for compact, permanent GitHub Pages links.
 */

/**
 * Encodes a Uint8Array into a URL-safe Base64 string without padding.
 * @param {Uint8Array} bytes
 * @returns {string}
 */
export function uint8ToBase64Url(bytes) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Decodes a URL-safe Base64 string back into a Uint8Array.
 * @param {string} base64url
 * @returns {Uint8Array}
 */
export function base64UrlToUint8(base64url) {
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
 * Compresses a character object into a compact Base64URL slug.
 * @param {Object} character
 * @returns {Promise<string>}
 */
export async function compressCharacterToSlug(character) {
  const json = JSON.stringify(character);
  const cs = new CompressionStream('deflate-raw');
  const writer = cs.writable.getWriter();
  writer.write(new TextEncoder().encode(json));
  writer.close();

  const compressedBuffer = await new Response(cs.readable).arrayBuffer();
  return uint8ToBase64Url(new Uint8Array(compressedBuffer));
}

/**
 * Decompresses a Base64URL slug back into a character object.
 * @param {string} slug
 * @returns {Promise<Object>}
 */
export async function decompressSlugToCharacter(slug) {
  if (!slug || typeof slug !== 'string') {
    throw new Error('Invalid or empty share slug.');
  }

  const bytes = base64UrlToUint8(slug.trim());
  const ds = new DecompressionStream('deflate-raw');
  const writer = ds.writable.getWriter();
  writer.write(bytes);
  writer.close();

  const jsonText = await new Response(ds.readable).text();
  const character = JSON.parse(jsonText);

  if (!character || typeof character !== 'object') {
    throw new Error('Decompressed payload is not a valid character object.');
  }

  return character;
}

/**
 * Generates the full shareable URL containing the compressed character slug.
 * @param {Object} character
 * @returns {Promise<string>}
 */
export async function generateShareUrl(character) {
  const slug = await compressCharacterToSlug(character);
  const baseUrl = `${window.location.origin}${window.location.pathname}`;
  return `${baseUrl}#hero=${slug}`;
}

/**
 * Inspects current window.location.hash for a shared character payload.
 * Supports #hero=<slug> and #share=<slug>.
 * @returns {Promise<Object|null>}
 */
export async function getSharedCharacterFromUrl() {
  const hash = window.location.hash;
  if (!hash) return null;

  let slug = '';
  if (hash.startsWith('#hero=')) {
    slug = hash.slice('#hero='.length);
  } else if (hash.startsWith('#share=')) {
    slug = hash.slice('#share='.length);
  }

  if (!slug) return null;

  try {
    return await decompressSlugToCharacter(slug);
  } catch (err) {
    console.warn('Failed to parse shared character from URL:', err);
    return null;
  }
}

/**
 * Removes the share hash from the address bar without reloading the page.
 */
export function clearShareHash() {
  if (window.location.hash.startsWith('#hero=') || window.location.hash.startsWith('#share=')) {
    const cleanUrl = `${window.location.pathname}${window.location.search}`;
    window.history.replaceState(null, document.title, cleanUrl);
  }
}
