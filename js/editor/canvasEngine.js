/* canvasEngine.js — viewport, zoom/pan, gestures, selection, drag/resize/rotate */
import { state, getSelected, updateLayer, select, emit, subscribe } from './state.js';
import { renderTo, hitTest, setRedrawCallback, requestRedraw } from './renderer.js';
import { commit } from './history.js';
import { clamp } from './utils.js';

let canvas, ctx, wrap, stage, overlay, areaEl;
let dpr = Math.min(window.devicePixelRatio || 1, 2);
let needsRedraw = true;

export const initCanvas = () => {
  canvas = document.getElementById('mainCanvas');
  ctx = canvas.getContext('2d');
  wrap = document.getElementById('canvasWrap');
  stage = document.getElementById('canvasStage');
  overlay = document.getElementById('overlay');
  areaEl = document.getElementById('canvasArea');

  setRedrawCallback(() => { needsRedraw = true; });
  subscribe(() => { needsRedraw = true; updateOverlay(); });

  bindGestures();
  resizeCanvasBacking();
  fitToScreen();

  const loop = () => {
    if (needsRedraw) { paint(); needsRedraw = false; }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  window.addEventListener('resize', () => { resizeCanvasBacking(); needsRedraw = true; updateOverlay(); });
};

const resizeCanvasBacking = () => {
  const { width, height } = state.canvas;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  applyTransform();
};

const paint = () => {
  resizeCanvasBackingIfChanged();
  renderTo(ctx);
};

let lastSize = { w: 0, h: 0 };
const resizeCanvasBackingIfChanged = () => {
  if (lastSize.w !== state.canvas.width || lastSize.h !== state.canvas.height) {
    resizeCanvasBacking();
    lastSize = { w: state.canvas.width, h: state.canvas.height };
  }
};

const applyTransform = () => {
  stage.style.transform = `translate(${state.pan.x}px, ${state.pan.y}px) scale(${state.zoom})`;
  const zl = document.getElementById('zoomLabel');
  if (zl) zl.textContent = Math.round(state.zoom * 100) + '%';
};

export const fitToScreen = () => {
  const rect = areaEl.getBoundingClientRect();
  const pad = 60;
  const sx = (rect.width - pad) / state.canvas.width;
  const sy = (rect.height - pad) / state.canvas.height;
  state.zoom = Math.max(0.05, Math.min(sx, sy, 2));
  state.pan = { x: 0, y: 0 };
  applyTransform();
  needsRedraw = true;
  updateOverlay();
};

export const zoomBy = (factor, origin) => {
  const old = state.zoom;
  state.zoom = clamp(old * factor, 0.05, 8);
  if (origin) {
    const rect = stage.getBoundingClientRect();
    const cx = origin.x - rect.left, cy = origin.y - rect.top;
    const dz = state.zoom / old - 1;
    state.pan.x -= cx * dz;
    state.pan.y -= cy * dz;
  }
  applyTransform();
  updateOverlay();
};

const screenToCanvas = (clientX, clientY) => {
  const rect = stage.getBoundingClientRect();
  return {
    x: (clientX - rect.left) / state.zoom,
    y: (clientY - rect.top) / state.zoom,
  };
};

/* ---------- GESTURES ---------- */
let pointers = new Map();
let dragMode = null; // 'move' | 'resize' | 'rotate' | 'pan' | null
let dragStart = null;
let pinchStart = null;

const bindGestures = () => {
  wrap.addEventListener('pointerdown', onPointerDown);
  wrap.addEventListener('pointermove', onPointerMove);
  wrap.addEventListener('pointerup', onPointerUp);
  wrap.addEventListener('pointercancel', onPointerUp);
  wrap.addEventListener('wheel', onWheel, { passive: false });
  wrap.addEventListener('contextmenu', e => e.preventDefault());
};

const onPointerDown = (e) => {
  wrap.setPointerCapture(e.pointerId);
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

  if (pointers.size === 2) {
    const pts = [...pointers.values()];
    pinchStart = { dist: dist(pts[0], pts[1]), zoom: state.zoom, mid: midpoint(pts[0], pts[1]), pan: { ...state.pan } };
    dragMode = null;
    return;
  }

  // handle controls (resize/rotate) come from overlay
  if (e.target && e.target.dataset && e.target.dataset.handle) {
    const sel = getSelected(); if (!sel) return;
    dragMode = e.target.dataset.handle === 'rotate' ? 'rotate' : 'resize';
    dragStart = {
      x: e.clientX, y: e.clientY,
      handle: e.target.dataset.handle,
      layer: { ...sel },
    };
    return;
  }

  if (e.button === 1 || e.shiftKey) {
    dragMode = 'pan';
    dragStart = { x: e.clientX, y: e.clientY, pan: { ...state.pan } };
    return;
  }

  const p = screenToCanvas(e.clientX, e.clientY);
  const hit = hitTest(p.x, p.y);
  if (hit) {
    select(hit.id);
    dragMode = 'move';
    dragStart = { x: e.clientX, y: e.clientY, layer: { ...hit } };
  } else {
    select(null);
    dragMode = 'pan';
    dragStart = { x: e.clientX, y: e.clientY, pan: { ...state.pan } };
  }
};

const onPointerMove = (e) => {
  if (pointers.has(e.pointerId)) pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

  if (pointers.size === 2 && pinchStart) {
    const pts = [...pointers.values()];
    const d = dist(pts[0], pts[1]);
    const factor = d / pinchStart.dist;
    state.zoom = clamp(pinchStart.zoom * factor, 0.05, 8);
    applyTransform();
    updateOverlay();
    return;
  }

  if (!dragMode || !dragStart) return;

  if (dragMode === 'pan') {
    state.pan.x = dragStart.pan.x + (e.clientX - dragStart.x);
    state.pan.y = dragStart.pan.y + (e.clientY - dragStart.y);
    applyTransform(); updateOverlay();
    return;
  }
  if (dragMode === 'move') {
    const dx = (e.clientX - dragStart.x) / state.zoom;
    const dy = (e.clientY - dragStart.y) / state.zoom;
    updateLayer(dragStart.layer.id, { x: dragStart.layer.x + dx, y: dragStart.layer.y + dy });
    return;
  }
  if (dragMode === 'resize') {
    const dx = (e.clientX - dragStart.x) / state.zoom;
    const dy = (e.clientY - dragStart.y) / state.zoom;
    const L = dragStart.layer;
    let nx = L.x, ny = L.y, nw = L.w, nh = L.h;
    const h = dragStart.handle;
    if (h.includes('e')) nw = Math.max(20, L.w + dx);
    if (h.includes('s')) nh = Math.max(20, L.h + dy);
    if (h.includes('w')) { nw = Math.max(20, L.w - dx); nx = L.x + (L.w - nw); }
    if (h.includes('n')) { nh = Math.max(20, L.h - dy); ny = L.y + (L.h - nh); }
    updateLayer(L.id, { x: nx, y: ny, w: nw, h: nh });
    return;
  }
  if (dragMode === 'rotate') {
    const L = dragStart.layer;
    const cx = L.x + L.w / 2, cy = L.y + L.h / 2;
    const p = screenToCanvas(e.clientX, e.clientY);
    const ang = Math.atan2(p.y - cy, p.x - cx) * 180 / Math.PI + 90;
    updateLayer(L.id, { rotation: Math.round(ang) });
    return;
  }
};

const onPointerUp = (e) => {
  pointers.delete(e.pointerId);
  if (pointers.size < 2) pinchStart = null;
  if (dragMode && dragMode !== 'pan') commit();
  dragMode = null;
  dragStart = null;
};

const onWheel = (e) => {
  e.preventDefault();
  if (e.ctrlKey || e.metaKey) {
    zoomBy(e.deltaY < 0 ? 1.1 : 1 / 1.1, { x: e.clientX, y: e.clientY });
  } else {
    state.pan.x -= e.deltaX;
    state.pan.y -= e.deltaY;
    applyTransform(); updateOverlay();
  }
};

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const midpoint = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

/* ---------- OVERLAY (selection box) ---------- */
const updateOverlay = () => {
  if (!overlay) return;
  overlay.replaceChildren();
  const sel = getSelected();
  const empty = document.getElementById('emptyHint');
  if (empty) empty.classList.toggle('hidden', state.layers.length > 0);
  if (!sel) return;

  const box = document.createElement('div');
  box.className = 'sel-box';
  box.style.left = sel.x + 'px';
  box.style.top = sel.y + 'px';
  box.style.width = sel.w + 'px';
  box.style.height = sel.h + 'px';
  box.style.transform = `rotate(${sel.rotation || 0}deg)`;
  box.style.transformOrigin = 'center';

  const handles = ['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'];
  for (const h of handles) {
    const handle = document.createElement('div');
    handle.className = 'sel-handle';
    handle.dataset.handle = h;
    const pos = handlePos(h);
    handle.style.left = pos.x + 'px';
    handle.style.top = pos.y + 'px';
    handle.style.transform = 'translate(-50%,-50%)';
    handle.style.cursor = handleCursor(h);
    box.appendChild(handle);
  }

  const rot = document.createElement('div');
  rot.className = 'sel-rotate';
  rot.dataset.handle = 'rotate';
  rot.style.left = '50%';
  rot.style.top = '-22px';
  rot.style.transform = 'translate(-50%,-50%)';
  box.appendChild(rot);

  overlay.appendChild(box);

  // overlay scaled with stage CSS transform via parent, position relative to canvas px
  // because overlay sits inside .canvas-stage (already scaled)
};

const handlePos = (h) => {
  // relative to box (uses CSS positions so dimensions in px, box already sized)
  const map = {
    nw: { x: 0, y: 0 }, ne: { x: '100%', y: 0 }, sw: { x: 0, y: '100%' }, se: { x: '100%', y: '100%' },
    n: { x: '50%', y: 0 }, s: { x: '50%', y: '100%' }, e: { x: '100%', y: '50%' }, w: { x: 0, y: '50%' },
  };
  return map[h];
};
const handleCursor = (h) => ({
  nw: 'nwse-resize', se: 'nwse-resize', ne: 'nesw-resize', sw: 'nesw-resize',
  n: 'ns-resize', s: 'ns-resize', e: 'ew-resize', w: 'ew-resize',
}[h]);

export { canvas as mainCanvas };
