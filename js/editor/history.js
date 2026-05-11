/* history.js — undo/redo (bounded snapshots) */
import { state, emit } from './state.js';

const past = [];
const future = [];
const MAX = 40;
let lastSnapshot = null;
let scheduled = false;

const snap = () => JSON.stringify({ canvas: state.canvas, layers: state.layers, selectedId: state.selectedId });

export const initHistory = () => {
  lastSnapshot = snap();
};

export const commit = () => {
  // debounce so dragging doesn't flood
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    const cur = snap();
    if (cur === lastSnapshot) return;
    past.push(lastSnapshot);
    if (past.length > MAX) past.shift();
    future.length = 0;
    lastSnapshot = cur;
    emit('history');
  });
};

const apply = (s) => {
  const d = JSON.parse(s);
  state.canvas = d.canvas;
  state.layers = d.layers;
  state.selectedId = d.selectedId;
  emit('history-apply');
};

export const undo = () => {
  if (!past.length) return;
  future.push(lastSnapshot);
  const prev = past.pop();
  lastSnapshot = prev;
  apply(prev);
};

export const redo = () => {
  if (!future.length) return;
  past.push(lastSnapshot);
  const nxt = future.pop();
  lastSnapshot = nxt;
  apply(nxt);
};

export const canUndo = () => past.length > 0;
export const canRedo = () => future.length > 0;
