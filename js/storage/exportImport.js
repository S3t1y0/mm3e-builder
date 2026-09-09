// js/storage/exportImport.js
import { store } from '../state.js';
import { printRoll20Sheet } from '../components/roll20Print.js';

export function exportToJson() {
  const data = JSON.stringify(store.character, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeName = (store.character.name || 'Hero').replace(/[^a-z0-9_-]/gi, '_');
  a.href = url;
  a.download = `${safeName}_mm3e.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importFromJson(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const obj = JSON.parse(e.target.result);
        if (obj && typeof obj === 'object') {
          store.loadCharacter(obj);
          resolve(obj);
        } else {
          reject(new Error('Invalid character JSON format'));
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export function exportToCsv() {
  const char = store.character;
  const rows = [];
  rows.push(['Character Name', char.name]);
  rows.push(['Player', char.player]);
  rows.push(['Power Level', char.powerLevel]);
  rows.push(['Hero Points', char.heroPoints]);
  rows.push(['Total Spent PP', store.getTotalSpentPP()]);
  rows.push(['Total Budget PP', store.getTotalBudgetPP()]);
  rows.push([]);
  rows.push(['ABILITY', 'SCORE', 'PP SPENT']);
  for (const [k, v] of Object.entries(char.abilities)) {
    rows.push([k, v, v * 2]);
  }
  rows.push([]);
  rows.push(['DEFENSE', 'TOTAL', 'BOUGHT PP']);
  for (const [k, v] of Object.entries(char.defensesBought)) {
    rows.push([k, store.getDefenseTotal(k), v]);
  }
  rows.push([]);
  rows.push(['POWERS', 'COST']);
  for (const p of char.powers) {
    rows.push([p.name, `${p.baseEffect} ${p.ranks}`]);
  }

  const csvContent = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeName = (char.name || 'Hero').replace(/[^a-z0-9_-]/gi, '_');
  a.href = url;
  a.download = `${safeName}_mm3e.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function printSheet() {
  printRoll20Sheet();
}
