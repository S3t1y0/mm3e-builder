// Dice roller utility using Web Crypto API when available with Math.random fallback

export function isCryptoAvailable() {
  const c = (typeof window !== 'undefined' && window.crypto) 
    ? window.crypto 
    : (typeof globalThis !== 'undefined' && globalThis.crypto ? globalThis.crypto : null);
  return !!(c && typeof c.getRandomValues === 'function');
}

function getCrypto() {
  if (typeof window !== 'undefined' && window.crypto) return window.crypto;
  if (typeof globalThis !== 'undefined' && globalThis.crypto) return globalThis.crypto;
  return null;
}

const uint32Buffer = new Uint32Array(1);

export function rollDie(sides = 20) {
  const nSides = Math.max(1, Math.floor(Number(sides) || 20));
  if (nSides === 1) return 1;

  const cryptoObj = getCrypto();
  if (cryptoObj && typeof cryptoObj.getRandomValues === 'function') {
    const limit = Math.floor(4294967296 / nSides) * nSides;
    let rand;
    do {
      cryptoObj.getRandomValues(uint32Buffer);
      rand = uint32Buffer[0];
    } while (rand >= limit);

    return (rand % nSides) + 1;
  }

  return Math.floor(Math.random() * nSides) + 1;
}

export function rollD20() {
  return rollDie(20);
}

export function rollMultiple(count = 1, sides = 20) {
  const rolls = [];
  const n = Math.max(1, Math.floor(Number(count) || 1));
  for (let i = 0; i < n; i++) {
    rolls.push(rollDie(sides));
  }
  return rolls;
}
