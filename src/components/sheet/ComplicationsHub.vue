<template>
  <div class="complications-hub">
    <!-- Toolbar Header -->
    <div class="dndb-pane-toolbar">
      <div class="dndb-pane-info">
        <span class="dndb-pane-title">Motivations & Complications</span>
        <span class="comp-summary-counts">
          {{ motivations.length }} Motivation{{ motivations.length === 1 ? '' : 's' }} • {{ generalComplications.length }} Complication{{ generalComplications.length === 1 ? '' : 's' }}
        </span>
      </div>
      <div class="dndb-pane-actions">
        <button type="button" class="btn-primary-xs" @click="showAddModal = true">
          <i class="ri-add-line"></i> Add Complication
        </button>
      </div>
    </div>

    <!-- Hero Points Gameplay Callout Banner -->
    <div class="comp-hp-callout">
      <div class="comp-hp-info">
        <div class="comp-hp-badge">
          <i class="ri-copper-diamond-line"></i>
          <span>{{ heroStore.character.heroPoints || 0 }} HERO POINT{{ (heroStore.character.heroPoints || 0) === 1 ? '' : 'S' }}</span>
        </div>
        <div class="comp-hp-text">
          <strong>M&M 3E Hero Points Engine:</strong> When a complication hinders you during the story, the GM awards you <strong>+1 Hero Point</strong> to fuel heroic effort, rerolls, and power stunts.
        </div>
      </div>
      <button type="button" class="btn-award-hp" @click="awardHeroPoint" title="Award +1 Hero Point to current sheet">
        <i class="ri-add-circle-line"></i> +1 Hero Point
      </button>
    </div>

    <!-- Empty State with Quick Presets -->
    <div v-if="allComplications.length === 0" class="comp-empty-state">
      <div class="comp-empty-icon"><i class="ri-shield-user-line"></i></div>
      <h4 class="comp-empty-title">No Complications Defined</h4>
      <p class="comp-empty-desc">
        Official Mutants & Masterminds 3rd Edition rules require each hero to have at least <strong>1 Motivation</strong> and <strong>1 Complication</strong> (0 PP cost).
      </p>
      <div class="comp-preset-quick-row">
        <button type="button" class="comp-preset-btn" @click="quickAdd('Motivation', 'Justice', 'Driven by an unwavering need to bring wrongdoers to justice.')">
          <i class="ri-scales-3-line"></i> + Justice (Motivation)
        </button>
        <button type="button" class="comp-preset-btn" @click="quickAdd('Motivation', 'Responsibility', 'Believes that great power carries an absolute moral responsibility.')">
          <i class="ri-shield-user-line"></i> + Responsibility (Motivation)
        </button>
        <button type="button" class="comp-preset-btn" @click="quickAdd('Complication', 'Secret Identity', 'Must protect mundane personal identity and civilian career.')">
          <i class="ri-spy-line"></i> + Secret Identity
        </button>
        <button type="button" class="comp-preset-btn" @click="quickAdd('Complication', 'Enemy', 'Targeted by a recurring arch-nemesis or rogue syndicate.')">
          <i class="ri-skull-line"></i> + Enemy
        </button>
        <button type="button" class="comp-preset-btn" @click="quickAdd('Complication', 'Weakness', 'Vulnerable to a specific substance or frequency that bypasses defenses.')">
          <i class="ri-radioactive-line"></i> + Weakness
        </button>
      </div>
    </div>

    <div v-else class="comp-sections-wrapper">
      <!-- 1. Heroic Motivations Section -->
      <div class="comp-group-section motivation-group">
        <div class="comp-group-header">
          <div class="comp-group-title">
            <i class="ri-compass-3-line"></i>
            <span>HEROIC MOTIVATIONS</span>
            <span class="comp-group-count">{{ motivations.length }}</span>
          </div>
          <button type="button" class="btn-ghost-xs" @click="openAddForType('Motivation')">
            <i class="ri-add-line"></i> Add Motivation
          </button>
        </div>

        <div v-if="motivations.length === 0" class="comp-group-empty">
          No motivation specified. Every hero needs a driving motive to act!
        </div>

        <div v-else class="comp-items-grid">
          <div
            v-for="item in motivations"
            :key="item.id"
            class="comp-card card-motivation"
          >
            <div class="comp-card-header">
              <div class="comp-card-title-row">
                <span class="comp-type-pill motivation">MOTIVATION</span>
                <strong class="comp-name">{{ item.name }}</strong>
              </div>
              <div class="comp-card-actions">
                <button type="button" class="btn-icon-subtle" @click="broadcastComplication(item)" title="Broadcast to Roll20">
                  <i class="ri-broadcast-line"></i>
                </button>
                <button type="button" class="btn-icon-subtle" @click="copyText(item)" title="Copy Text">
                  <i class="ri-clipboard-line"></i>
                </button>
                <button type="button" class="btn-icon-subtle btn-delete" @click="removeComp(item.id, item.name)" title="Remove">
                  <i class="ri-delete-bin-line"></i>
                </button>
              </div>
            </div>
            <p v-if="item.desc" class="comp-desc">{{ item.desc }}</p>
          </div>
        </div>
      </div>

      <!-- 2. General Complications Section -->
      <div class="comp-group-section general-group">
        <div class="comp-group-header">
          <div class="comp-group-title">
            <i class="ri-alert-line"></i>
            <span>DRAMATIC COMPLICATIONS & FLAWS</span>
            <span class="comp-group-count">{{ generalComplications.length }}</span>
          </div>
          <button type="button" class="btn-ghost-xs" @click="openAddForType('Complication')">
            <i class="ri-add-line"></i> Add Complication
          </button>
        </div>

        <div v-if="generalComplications.length === 0" class="comp-group-empty">
          No complications defined yet. Add enemies, quirks, secret identities, or personal flaws!
        </div>

        <div v-else class="comp-items-grid">
          <div
            v-for="item in generalComplications"
            :key="item.id"
            class="comp-card card-complication"
          >
            <div class="comp-card-header">
              <div class="comp-card-title-row">
                <span class="comp-type-pill complication">{{ (item.type || 'COMPLICATION').toUpperCase() }}</span>
                <strong class="comp-name">{{ item.name }}</strong>
              </div>
              <div class="comp-card-actions">
                <button type="button" class="btn-icon-subtle" @click="broadcastComplication(item)" title="Broadcast to Roll20">
                  <i class="ri-broadcast-line"></i>
                </button>
                <button type="button" class="btn-icon-subtle" @click="copyText(item)" title="Copy Text">
                  <i class="ri-clipboard-line"></i>
                </button>
                <button type="button" class="btn-icon-subtle btn-delete" @click="removeComp(item.id, item.name)" title="Remove">
                  <i class="ri-delete-bin-line"></i>
                </button>
              </div>
            </div>
            <p v-if="item.desc" class="comp-desc">{{ item.desc }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Complication Modal -->
    <transition name="fade">
      <div v-if="showAddModal" class="comp-modal-backdrop" @click.self="showAddModal = false">
        <div class="comp-modal-card" :class="formType === 'Motivation' ? 'theme-motivation' : 'theme-complication'">
          <div class="comp-modal-header">
            <h4>
              <i :class="formType === 'Motivation' ? 'ri-compass-3-fill' : 'ri-alert-fill'"></i>
              {{ formType === 'Motivation' ? 'Add Heroic Motivation' : 'Add Dramatic Complication' }}
            </h4>
            <button type="button" class="comp-modal-close" @click="showAddModal = false">
              <i class="ri-close-line"></i>
            </button>
          </div>

          <div class="comp-modal-body">
            <!-- TOP SEGMENTED SWITCHER -->
            <div class="narrative-segmented-nav">
              <button
                type="button"
                class="segmented-btn"
                :class="{ active: formType === 'Motivation', 'btn-tab-motivation': true }"
                @click="formType = 'Motivation'"
              >
                <i class="ri-compass-3-line"></i>
                <span class="segmented-label">Heroic Motivation</span>
                <span class="segmented-pill">Core Drive</span>
              </button>
              <button
                type="button"
                class="segmented-btn"
                :class="{ active: formType !== 'Motivation', 'btn-tab-complication': true }"
                @click="formType = (formType === 'Motivation' ? 'Complication' : formType)"
              >
                <i class="ri-alert-line"></i>
                <span class="segmented-label">Dramatic Complication</span>
                <span class="segmented-pill">+1 Hero Point</span>
              </button>
            </div>

            <div v-if="formType !== 'Motivation'" class="comp-form-group">
              <label>Complication Category</label>
              <select v-model="formType">
                <option value="Complication">General Complication / Flaw</option>
                <option value="Enemy">Enemy / Arch-Nemesis</option>
                <option value="Secret Identity">Secret Identity</option>
                <option value="Weakness">Weakness / Vulnerability</option>
                <option value="Power Loss">Power Loss</option>
                <option value="Phobia">Phobia</option>
                <option value="Relationship">Relationship / Dependent</option>
                <option value="Responsibility">Responsibility</option>
                <option value="Quirk">Quirk / Habit</option>
                <option value="Reputation">Reputation</option>
                <option value="Disability">Disability</option>
                <option value="Honor">Honor</option>
                <option value="Temper">Temper</option>
              </select>
            </div>

            <div class="comp-form-group">
              <label>{{ formType === 'Motivation' ? 'Motivation Title / Conviction *' : 'Name / Descriptor *' }}</label>
              <input
                v-model="formName"
                type="text"
                :placeholder="formType === 'Motivation' ? 'e.g. Motivation: Justice, Doing Good...' : 'e.g. Secret Identity, Arch-Nemesis, Greed, Responsibility...'"
              />
            </div>

            <!-- Quick presets suggestions -->
            <div class="comp-suggestions-row">
              <span class="comp-sugg-title">Presets:</span>
              <button
                v-for="sugg in (formType === 'Motivation' ? motivationPresets : complicationPresets)"
                :key="sugg.name"
                type="button"
                class="comp-sugg-btn"
                @click="applySuggestion(sugg)"
              >
                {{ sugg.name }}
              </button>
            </div>

            <div class="comp-form-group">
              <label>{{ formType === 'Motivation' ? 'Moral Creed & Narrative Drive' : 'Description & Story Hook' }}</label>
              <textarea
                v-model="formDesc"
                rows="3"
                :placeholder="formType === 'Motivation' ? 'Describe what drives your hero to risk everything and make sacrifices...' : 'Explain how this complication manifests during roleplay to earn Hero Points...'"
              ></textarea>
            </div>
          </div>

          <div class="comp-modal-footer">
            <button type="button" class="btn-cancel" @click="showAddModal = false">Cancel</button>
            <button
              type="button"
              class="btn-save"
              :class="formType === 'Motivation' ? 'btn-save-motivation' : 'btn-save-complication'"
              @click="saveComplication"
            >
              <i :class="formType === 'Motivation' ? 'ri-compass-3-fill' : 'ri-check-line'"></i>
              {{ formType === 'Motivation' ? 'Add Motivation' : 'Add Complication' }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useHeroStore } from '../../stores/heroStore.js';
import { useUiStore } from '../../stores/uiStore.js';
import { sendFeatureToVTT } from '../../services/vttBridge.js';

const heroStore = useHeroStore();
const uiStore = useUiStore();

const showAddModal = ref(false);
const formType = ref('Motivation');
const formName = ref('');
const formDesc = ref('');

const motivationPresets = [
  { name: 'Justice', desc: 'Driven by an uncompromising need to see wrongdoers brought to justice.' },
  { name: 'Responsibility', desc: 'Believes that anyone with extraordinary power has an absolute duty to protect others.' },
  { name: 'Doing Good', desc: 'Simply motivated by altruism and wanting to make the world a better, safer place.' },
  { name: 'Thrills', desc: 'Addicted to the adrenaline rush and excitement of superhero action.' },
  { name: 'Acceptance', desc: 'Seeks to prove themselves worthy of public trust and peer recognition.' },
  { name: 'Patriotism', desc: 'Dedicated to defending their homeland, constitution, and democratic ideals.' }
];

const complicationPresets = [
  { name: 'Secret Identity', desc: 'Must maintain a normal civilian career and personal life without revealing heroic persona.' },
  { name: 'Enemy', desc: 'Pursued by a persistent arch-villain or hostile syndicate dedicated to their ruin.' },
  { name: 'Weakness', desc: 'Possesses a severe vulnerability to a specific frequency, mineral, or energy type.' },
  { name: 'Phobia', desc: 'Paralyzed by an irrational dread when confronted with specific situations.' },
  { name: 'Relationship', desc: 'Has close family members, loved ones, or civilian wards who can be endangered.' },
  { name: 'Temper', desc: 'Prone to losing self-control and attacking fiercely when provoked or insulted.' }
];

const allComplications = computed(() => {
  return heroStore.character.complications || [];
});

const motivations = computed(() => {
  return allComplications.value.filter(c => (c.type || '').toLowerCase() === 'motivation');
});

const generalComplications = computed(() => {
  return allComplications.value.filter(c => (c.type || '').toLowerCase() !== 'motivation');
});

function awardHeroPoint() {
  heroStore.adjustHeroPoints(1);
  uiStore.showToast('Awarded +1 Hero Point!', 'success');
}

function quickAdd(type, name, desc) {
  heroStore.addComplication(type, name, desc);
  uiStore.showToast(`Added ${name}!`, 'success');
}

function openAddForType(type) {
  formType.value = type;
  formName.value = '';
  formDesc.value = '';
  showAddModal.value = true;
}

function applySuggestion(sugg) {
  formName.value = sugg.name;
  formDesc.value = sugg.desc;
}

function saveComplication() {
  if (!formName.value.trim()) {
    uiStore.showToast('Please enter a name for the complication', 'error');
    return;
  }
  heroStore.addComplication(formType.value, formName.value.trim(), formDesc.value.trim());
  uiStore.showToast(`Added ${formName.value}!`, 'success');
  formName.value = '';
  formDesc.value = '';
  showAddModal.value = false;
}

function removeComp(id, name) {
  const comps = heroStore.character.complications || [];
  const idx = comps.findIndex(c => c.id === id || c.name === name);
  if (idx !== -1) {
    heroStore.removeComplication(idx);
    uiStore.showToast(`Removed ${name}`, 'info');
  }
}

function copyText(item) {
  const text = `**${item.name}** [${item.type}]\n${item.desc || ''}`;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
    uiStore.showToast(`Copied ${item.name} to clipboard!`, 'info');
  }
}

function broadcastComplication(item) {
  sendFeatureToVTT({
    name: `${item.type || 'Complication'}: ${item.name}`,
    category: 'complication',
    type: item.type || 'Complication',
    subtype: item.name || '',
    description: item.desc || '',
    details: `${item.type || 'Complication'} • ${item.name}`
  }, heroStore.character);

  uiStore.showToast(`Broadcasted "${item.name}" to Roll20!`, 'info');
}
</script>

<style scoped>
.complications-hub {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comp-summary-counts {
  font-size: 0.72rem;
  color: var(--text-muted);
  font-weight: 600;
}

.btn-primary-xs {
  background: #dc2626;
  border: 1px solid #ef4444;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 800;
  padding: 0.3rem 0.75rem;
  border-radius: var(--radius-xs);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.btn-primary-xs:hover {
  background: #ef4444;
}

.btn-ghost-xs {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: var(--text-secondary);
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: var(--radius-xs);
  cursor: pointer;
}

.btn-ghost-xs:hover {
  background: rgba(220, 38, 38, 0.15);
  border-color: #ef4444;
  color: #fff;
}

/* Callout Banner */
.comp-hp-callout {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  background: linear-gradient(135deg, rgba(220, 38, 38, 0.08) 0%, rgba(15, 15, 20, 0.6) 100%);
  border: 1px solid rgba(220, 38, 38, 0.3);
  border-radius: var(--radius-md);
  padding: 0.85rem 1.15rem;
  flex-wrap: wrap;
}

.comp-hp-info {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  flex: 1;
  min-width: 260px;
}

.comp-hp-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 900;
  padding: 0.35rem 0.75rem;
  border-radius: var(--radius-pill);
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.4);
  white-space: nowrap;
}

.comp-hp-text {
  font-size: 0.76rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.btn-award-hp {
  background: rgba(220, 38, 38, 0.15);
  border: 1px solid rgba(220, 38, 38, 0.4);
  color: #fca5a5;
  font-size: 0.75rem;
  font-weight: 800;
  padding: 0.35rem 0.85rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  transition: all var(--trans-fast);
}

.btn-award-hp:hover {
  background: #dc2626;
  color: #fff;
  border-color: #ef4444;
}

/* Empty State */
.comp-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2.5rem 1.5rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px dashed rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  gap: 0.65rem;
}

.comp-empty-icon {
  font-size: 2.4rem;
  color: rgba(220, 38, 38, 0.4);
}

.comp-empty-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: #fff;
  margin: 0;
}

.comp-empty-desc {
  font-size: 0.78rem;
  color: var(--text-muted);
  max-width: 480px;
  margin: 0;
  line-height: 1.4;
}

.comp-preset-quick-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  margin-top: 0.75rem;
}

.comp-preset-btn {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: var(--text-secondary);
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.3rem 0.65rem;
  border-radius: var(--radius-pill);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  transition: all var(--trans-fast);
}

.comp-preset-btn:hover {
  background: rgba(220, 38, 38, 0.2);
  border-color: #ef4444;
  color: #fff;
}

/* Sections */
.comp-sections-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.comp-group-section {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.comp-group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 0.45rem;
  border-bottom: 1px solid var(--border-subtle);
}

.comp-group-title {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.8rem;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.comp-group-title i {
  color: #ef4444;
}

.comp-group-count {
  font-size: 0.65rem;
  background: rgba(255, 255, 255, 0.08);
  padding: 0.08rem 0.4rem;
  border-radius: var(--radius-pill);
  color: var(--text-muted);
}

.comp-group-empty {
  padding: 1rem;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.76rem;
  font-style: italic;
}

.comp-items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 0.75rem;
}

.comp-card {
  background: rgba(20, 20, 28, 0.6);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  transition: all var(--trans-fast);
}

.comp-card:hover {
  border-color: rgba(220, 38, 38, 0.3);
  background: rgba(25, 25, 35, 0.8);
}

.card-motivation {
  border-left: 3px solid #38bdf8;
}

.card-complication {
  border-left: 3px solid #f87171;
}

.comp-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
}

.comp-card-title-row {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.comp-type-pill {
  font-size: 0.6rem;
  font-weight: 800;
  padding: 0.08rem 0.35rem;
  border-radius: 3px;
  width: fit-content;
  letter-spacing: 0.04em;
}

.comp-type-pill.motivation {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
}

.comp-type-pill.complication {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
}

.comp-name {
  font-size: 0.88rem;
  font-weight: 800;
  color: #fff;
}

.comp-card-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.btn-icon-subtle {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 0.85rem;
  padding: 0.2rem;
  border-radius: 3px;
  transition: all var(--trans-fast);
}

.btn-icon-subtle:hover {
  color: #fff;
}

.btn-icon-subtle.btn-delete:hover {
  color: #ef4444;
}

.comp-desc {
  font-size: 0.74rem;
  color: var(--text-secondary);
  line-height: 1.4;
  margin: 0;
}

/* Modal */
.comp-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
}

.comp-modal-card {
  background: #14141e;
  border: 1px solid rgba(220, 38, 38, 0.4);
  border-radius: var(--radius-lg);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.comp-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1.15rem;
  background: rgba(220, 38, 38, 0.08);
  border-bottom: 1px solid rgba(220, 38, 38, 0.25);
}

.comp-modal-header h4 {
  font-size: 0.95rem;
  font-weight: 800;
  color: #fff;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.comp-modal-close {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 1.1rem;
  cursor: pointer;
}

.comp-modal-close:hover {
  color: #fff;
}

.comp-modal-body {
  padding: 1.15rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.comp-form-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.comp-form-group label {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
}

.comp-form-group select, .comp-form-group input, .comp-form-group textarea {
  background: rgba(20, 20, 28, 0.9);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: #fff;
  padding: 0.45rem 0.65rem;
  font-size: 0.82rem;
  font-family: inherit;
  outline: none;
}

.comp-suggestions-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem;
}

.comp-sugg-title {
  font-size: 0.68rem;
  color: var(--text-muted);
  font-weight: 600;
}

.comp-sugg-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-pill);
  color: var(--text-secondary);
  font-size: 0.66rem;
  padding: 0.12rem 0.45rem;
  cursor: pointer;
}

.comp-sugg-btn:hover {
  background: rgba(220, 38, 38, 0.2);
  border-color: #ef4444;
  color: #fff;
}

.comp-modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.65rem;
  padding: 0.75rem 1.15rem;
  background: rgba(10, 10, 15, 0.5);
  border-top: 1px solid var(--border-subtle);
}

.btn-cancel {
  background: transparent;
  border: 1px solid var(--border-subtle);
  color: var(--text-muted);
  padding: 0.35rem 0.75rem;
  border-radius: var(--radius-sm);
  font-size: 0.78rem;
  cursor: pointer;
}

.btn-save {
  background: #dc2626;
  border: 1px solid #ef4444;
  color: #fff;
  padding: 0.35rem 0.85rem;
  border-radius: var(--radius-sm);
  font-size: 0.78rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-save-motivation {
  background: linear-gradient(135deg, #7c3aed, #9333ea);
  border-color: #a855f7;
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
}

.btn-save-motivation:hover {
  background: linear-gradient(135deg, #6d28d9, #7e22ce);
}

.btn-save-complication {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  border-color: #ef4444;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
}

.btn-save-complication:hover {
  background: linear-gradient(135deg, #b91c1c, #991b1b);
}

.comp-modal-card.theme-motivation {
  border-color: rgba(168, 85, 247, 0.45);
  box-shadow: 0 20px 50px rgba(124, 58, 237, 0.2);
}

.comp-modal-card.theme-motivation .comp-modal-header {
  background: rgba(168, 85, 247, 0.1);
  border-bottom-color: rgba(168, 85, 247, 0.3);
}

.comp-modal-card.theme-motivation .comp-modal-header h4 i {
  color: #c084fc;
}

.comp-modal-card.theme-complication {
  border-color: rgba(244, 63, 94, 0.45);
  box-shadow: 0 20px 50px rgba(225, 29, 72, 0.2);
}

.comp-modal-card.theme-complication .comp-modal-header {
  background: rgba(244, 63, 94, 0.1);
  border-bottom-color: rgba(244, 63, 94, 0.3);
}

.comp-modal-card.theme-complication .comp-modal-header h4 i {
  color: #fb7185;
}

/* TOP SEGMENTED SWITCHER IN MODAL */
.narrative-segmented-nav {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.35rem;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 0.3rem;
  margin-bottom: 0.5rem;
}

.segmented-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.15rem;
  padding: 0.55rem 0.5rem;
  border-radius: 8px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.segmented-btn i {
  font-size: 1.1rem;
}

.segmented-btn .segmented-label {
  font-size: 0.8rem;
  font-weight: 700;
}

.segmented-btn .segmented-pill {
  font-size: 0.65rem;
  font-weight: 600;
  opacity: 0.7;
}

.segmented-btn:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.04);
}

.segmented-btn.active.btn-tab-motivation {
  background: rgba(168, 85, 247, 0.18);
  border-color: rgba(168, 85, 247, 0.5);
  color: #e9d5ff;
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.2);
}

.segmented-btn.active.btn-tab-motivation .segmented-pill {
  color: #c084fc;
  opacity: 1;
}

.segmented-btn.active.btn-tab-complication {
  background: rgba(244, 63, 94, 0.18);
  border-color: rgba(244, 63, 94, 0.5);
  color: #ffe4e6;
  box-shadow: 0 4px 12px rgba(225, 29, 72, 0.2);
}

.segmented-btn.active.btn-tab-complication .segmented-pill {
  color: #fb7185;
  opacity: 1;
}
</style>
