/* storage.js — autosave + import/export project file */
import { state, serialize, deserialize, emit } from './state.js';
import { downloadBlob, toast, debounce } from './utils.js';

const KEY = 'azeel.project.v1';
const META = 'azeel.meta.v1';

export const initStorage = () => {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      // ask once on load via meta flag
      const meta = JSON.parse(localStorage.getItem(META) || '{}');
      const ageMin = (Date.now() - (meta.updated || 0)) / 60000;
      if (confirm(`Restore your last design from ${ageMin < 1 ? 'just now' : Math.round(ageMin) + ' min ago'}?`)) {
        deserialize(raw);
      }
    }
  } catch {}
  const save = debounce(() => {
    try {
      localStorage.setItem(KEY, serialize());
      localStorage.setItem(META, JSON.stringify({ updated: Date.now() }));
    } catch (e) { /* quota — ignore */ }
  }, 600);
  // subscribe via dynamic import to avoid circular
  import('./state.js').then(m => m.subscribe(save));
};

export const saveProjectFile = () => {
  const blob = new Blob([serialize()], { type: 'application/json' });
  downloadBlob(blob, (state.meta.name || 'azeel') + '.azeel.json');
  toast('Project file saved', 'success');
};

export const loadProjectFile = (file) => {
  const r = new FileReader();
  r.onload = () => {
    if (deserialize(r.result)) toast('Project loaded', 'success');
    else toast('Invalid project file', 'error');
  };
  r.readAsText(file);
};

export const resetProject = () => {
  if (!confirm('Reset the project? This clears the current design.')) return;
  state.canvas = { width: 1280, height: 720, bg: '#111827' };
  state.layers = [];
  state.selectedId = null;
  emit('reset');
  localStorage.removeItem(KEY);
};
