/* state.js — central editor state */
import { uid } from './utils.js';

export const state = {
  canvas: { width: 1280, height: 720, bg: '#111827' },
  layers: [], // {id,type,name,visible,locked, x,y,w,h, rotation, opacity, ...typeProps}
  selectedId: null,
  zoom: 1,
  pan: { x: 0, y: 0 },
  meta: { name: 'Untitled design', updated: Date.now() },
};

const listeners = new Set();
export const subscribe = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
export const emit = (kind = 'change') => { for (const fn of listeners) fn(kind); };

export const getSelected = () => state.layers.find(l => l.id === state.selectedId) || null;

export const addLayer = (layer) => {
  const l = { id: uid('lyr'), visible: true, locked: false, opacity: 1, rotation: 0, ...layer };
  state.layers.push(l);
  state.selectedId = l.id;
  emit('add');
  return l;
};

export const updateLayer = (id, patch) => {
  const l = state.layers.find(x => x.id === id);
  if (!l || l.locked) return;
  Object.assign(l, patch);
  emit('update');
};

export const removeLayer = (id) => {
  const i = state.layers.findIndex(x => x.id === id);
  if (i < 0) return;
  state.layers.splice(i, 1);
  if (state.selectedId === id) state.selectedId = null;
  emit('remove');
};

export const reorderLayer = (id, dir) => {
  const i = state.layers.findIndex(x => x.id === id);
  if (i < 0) return;
  const layer = state.layers[i];
  state.layers.splice(i, 1);
  let ni = i;
  if (dir === 'up') ni = Math.min(state.layers.length, i + 1);
  if (dir === 'down') ni = Math.max(0, i - 1);
  if (dir === 'top') ni = state.layers.length;
  if (dir === 'bottom') ni = 0;
  state.layers.splice(ni, 0, layer);
  emit('reorder');
};

export const moveLayerToIndex = (id, idx) => {
  const i = state.layers.findIndex(x => x.id === id);
  if (i < 0) return;
  const [l] = state.layers.splice(i, 1);
  state.layers.splice(idx, 0, l);
  emit('reorder');
};

export const select = (id) => { state.selectedId = id; emit('select'); };

export const duplicateLayer = (id) => {
  const l = state.layers.find(x => x.id === id);
  if (!l) return;
  const copy = JSON.parse(JSON.stringify(l));
  copy.id = uid('lyr');
  copy.x += 20; copy.y += 20;
  copy.name = (l.name || 'Layer') + ' copy';
  state.layers.push(copy);
  state.selectedId = copy.id;
  emit('add');
};

export const setCanvas = (w, h, bg) => {
  state.canvas.width = w;
  state.canvas.height = h;
  if (bg) state.canvas.bg = bg;
  emit('canvas');
};

export const serialize = () => JSON.stringify({ v: 1, ...state });
export const deserialize = (json) => {
  try {
    const data = typeof json === 'string' ? JSON.parse(json) : json;
    if (!data || !data.canvas || !Array.isArray(data.layers)) return false;
    state.canvas = data.canvas;
    state.layers = data.layers;
    state.selectedId = null;
    state.zoom = data.zoom || 1;
    state.pan = data.pan || { x: 0, y: 0 };
    state.meta = data.meta || { name: 'Untitled', updated: Date.now() };
    emit('load');
    return true;
  } catch { return false; }
};
