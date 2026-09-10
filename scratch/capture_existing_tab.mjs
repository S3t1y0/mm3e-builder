import fs from 'fs';
import path from 'path';

const CAMOFOX_URL = 'http://localhost:9377';
const tabId = 'ee11a067-77ca-4cec-93a9-d4a4b463af86';
const artifactDir = 'C:\\Users\\Caniago\\.gemini\\antigravity-ide\\brain\\c934c1d3-22e2-4ce9-aff5-93d26f380de0';

async function evalInTab(code) {
  const res = await fetch(`${CAMOFOX_URL}/tabs/${tabId}/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ expression: code })
  });
  const data = await res.json();
  return data.result !== undefined ? data.result : data;
}

async function saveScreenshot(filename) {
  const snapRes = await fetch(`${CAMOFOX_URL}/tabs/${tabId}/snapshot?includeScreenshot=true`);
  const snapData = await snapRes.json();
  if (snapData.screenshot) {
    const outPath = path.join(artifactDir, filename);
    const rawData = typeof snapData.screenshot === 'string' ? snapData.screenshot : (snapData.screenshot.data || '');
    const base64Data = rawData.replace(/^data:image\/\w+;base64,/, '');
    fs.writeFileSync(outPath, Buffer.from(base64Data, 'base64'));
    console.log(`[Saved Screenshot]: ${filename}`);
  } else {
    console.warn(`[Warning]: No screenshot data for ${filename}`);
  }
}

async function run() {
  console.log('1. Scrolling to Titan Strike (Deactivated)...');
  await evalInTab(`
    document.querySelectorAll('.power-cascade-card')[0]?.scrollIntoView({ behavior: 'instant', block: 'center' });
  `);
  await new Promise(r => setTimeout(r, 600));
  await saveScreenshot('sheet_power_deactivated_verified.png');

  console.log('2. Scrolling to Elemental Arsenal (Cryo Freeze active in use)...');
  await evalInTab(`
    document.querySelectorAll('.power-cascade-card')[1]?.scrollIntoView({ behavior: 'instant', block: 'center' });
  `);
  await new Promise(r => setTimeout(r, 600));
  await saveScreenshot('sheet_array_slot_active_verified.png');

  console.log('3. Scrolling to Targeted Effects (Active, Standby, Deactivated)...');
  await evalInTab(`
    document.getElementById('targeted-effects-container')?.scrollIntoView({ behavior: 'instant', block: 'center' });
  `);
  await new Promise(r => setTimeout(r, 600));
  await saveScreenshot('targeted_effects_array_verified.png');

  console.log('All 3 verification screenshots captured successfully!');
}

run().catch(console.error);
