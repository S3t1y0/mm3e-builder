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

export function printSheet() {
  printRoll20Sheet();
}
