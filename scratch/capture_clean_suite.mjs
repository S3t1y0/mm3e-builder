import fs from 'fs';
import path from 'path';

const CAMOFOX_URL = 'http://localhost:9377';
const APP_URL = 'http://localhost:8080/';
const artifactDir = 'C:\\Users\\Caniago\\.gemini\\antigravity-ide\\brain\\c934c1d3-22e2-4ce9-aff5-93d26f380de0';

async function run() {
  const userId = 'tester';
  const sessionKey = 'powers-clean-' + Date.now();

  console.log('1. Creating Camofox tab...');
  const createRes = await fetch(`${CAMOFOX_URL}/tabs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: APP_URL, userId, sessionKey })
  });
  const { tabId } = await createRes.json();
  console.log('Tab created:', tabId);
  await new Promise(r => setTimeout(r, 2500));

  async function evalInTab(code) {
    const res = await fetch(`${CAMOFOX_URL}/tabs/${tabId}/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expression: code, userId, sessionKey })
    });
    const data = await res.json();
    return data.result !== undefined ? data.result : data;
  }

  async function saveScreenshot(filename) {
    const snapRes = await fetch(`${CAMOFOX_URL}/tabs/${tabId}/snapshot?userId=${userId}&sessionKey=${sessionKey}&includeScreenshot=true`);
    const snapData = await snapRes.json();
    if (snapData.screenshot) {
      const outPath = path.join(artifactDir, filename);
      const rawData = typeof snapData.screenshot === 'string' ? snapData.screenshot : (snapData.screenshot.data || '');
      const base64Data = rawData.replace(/^data:image\/\w+;base64,/, '');
      fs.writeFileSync(outPath, Buffer.from(base64Data, 'base64'));
      console.log(`   [Screenshot Saved]: ${filename}`);
    } else {
      console.warn(`   [Warning]: No screenshot data for ${filename}`);
    }
  }

  console.log('2. Resetting character and configuring powers...');
  const setupResult = await evalInTab(`
    (async () => {
      // Wait for store to be available if needed
      let tries = 0;
      while (!window.store && tries < 20) {
        await new Promise(r => setTimeout(r, 100));
        tries++;
      }
      if (!window.store) {
        const mod = await import('/js/state.js');
        window.store = mod.store;
      }

      window.store.resetCharacter();
      window.store.character.name = 'Apex Guardian';

      // 1. Titan Strike (Deactivated)
      window.store.addPower({
        id: 'pow_titan',
        name: 'Titan Strike',
        summary: 'Crushing kinetic shockwave',
        type: 'standard',
        descriptors: ['Kinetic', 'Bludgeoning'],
        active: false,
        mainEffect: {
          baseEffect: 'Damage',
          name: 'Titan Strike',
          ranks: 10,
          baseCost: 1,
          range: 'Close',
          action: 'Standard',
          duration: 'Instant',
          resistance: 'Toughness',
          extras: [],
          flaws: []
        },
        linkedEffects: [],
        alternateEffects: []
      });

      // 2. Elemental Arsenal Array (Active, slot: Cryo Freeze)
      window.store.addPower({
        id: 'pow_elemental',
        name: 'Elemental Arsenal',
        summary: 'Mastery over fire, ice, and lightning',
        type: 'array',
        descriptors: ['Elemental', 'Magic'],
        active: true,
        activeSlotId: 'alt_ice_freeze',
        mainEffect: {
          baseEffect: 'Blast',
          name: 'Hellfire Blast',
          ranks: 10,
          baseCost: 2,
          range: 'Ranged',
          action: 'Standard',
          duration: 'Instant',
          resistance: 'Toughness',
          extras: [],
          flaws: []
        },
        linkedEffects: [],
        alternateEffects: [
          {
            id: 'alt_ice_freeze',
            name: 'Cryo Freeze',
            isDynamic: false,
            effect: {
              baseEffect: 'Affliction',
              name: 'Cryo Freeze',
              ranks: 10,
              baseCost: 1,
              range: 'Ranged',
              action: 'Standard',
              duration: 'Instant',
              resistance: 'Fortitude',
              extras: [],
              flaws: []
            }
          },
          {
            id: 'alt_lightning_bolt',
            name: 'Chain Lightning',
            isDynamic: false,
            effect: {
              baseEffect: 'Damage',
              name: 'Chain Lightning',
              ranks: 10,
              baseCost: 1,
              range: 'Ranged',
              action: 'Standard',
              duration: 'Instant',
              resistance: 'Toughness',
              extras: [{ name: 'Area', cost: 1, type: 'per_rank', ranks: 1 }],
              flaws: []
            }
          }
        ]
      });

      return {
        count: window.store.character.powers.length,
        powers: window.store.character.powers.map(p => ({ name: p.name, active: p.active, slot: p.activeSlotId }))
      };
    })()
  `);
  console.log('Setup result:', setupResult);
  await new Promise(r => setTimeout(r, 600));

  // 1. Screenshot of Deactivated Power (Titan Strike)
  console.log('3. Capturing Deactivated Power Card (Titan Strike)...');
  await evalInTab(`
    document.querySelectorAll('.power-cascade-card')[0]?.scrollIntoView({ behavior: 'instant', block: 'center' });
  `);
  await new Promise(r => setTimeout(r, 800));
  await saveScreenshot('sheet_power_deactivated_verified.png');

  // 2. Screenshot of Array with Cryo Freeze active
  console.log('4. Capturing Array Power Card (Cryo Freeze Active In Use)...');
  await evalInTab(`
    document.querySelectorAll('.power-cascade-card')[1]?.scrollIntoView({ behavior: 'instant', block: 'center' });
  `);
  await new Promise(r => setTimeout(r, 800));
  await saveScreenshot('sheet_array_slot_active_verified.png');

  // 3. Screenshot of Targeted Effects
  console.log('5. Capturing Targeted Effects (Active, Standby, Deactivated)...');
  await evalInTab(`
    document.getElementById('targeted-effects-container')?.scrollIntoView({ behavior: 'instant', block: 'center' });
  `);
  await new Promise(r => setTimeout(r, 800));
  await saveScreenshot('targeted_effects_array_verified.png');

  // Close tab
  await fetch(`${CAMOFOX_URL}/tabs/${tabId}/close`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, sessionKey })
  });

  console.log('Finished cleanly!');
}

run().catch(console.error);
