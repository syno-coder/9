/* utils.js — shared helpers */
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

export const uid = (p = 'id') => p + '_' + Math.random().toString(36).slice(2, 9);

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export const debounce = (fn, ms = 200) => {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
};

export const throttle = (fn, ms = 16) => {
  let last = 0, pending;
  return (...args) => {
    const now = Date.now();
    if (now - last >= ms) { last = now; fn(...args); }
    else { clearTimeout(pending); pending = setTimeout(() => { last = Date.now(); fn(...args); }, ms - (now - last)); }
  };
};

// Safe text — never use innerHTML with user input
export const setText = (el, text) => { el.textContent = text == null ? '' : String(text); };

export const sanitizeText = (s) => String(s ?? '').replace(/[\u0000-\u001F\u007F]/g, '').slice(0, 5000);

export const downloadBlob = (blob, name) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
};

export const toast = (msg, type = '') => {
  const host = document.getElementById('toastHost');
  if (!host) return;
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  setText(el, msg);
  host.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateY(8px)'; el.style.transition = 'all .25s'; }, 2200);
  setTimeout(() => el.remove(), 2600);
};

export const loadImage = (src) => new Promise((res, rej) => {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => res(img);
  img.onerror = rej;
  img.src = src;
});

export const fileToDataURL = (file) => new Promise((res, rej) => {
  const r = new FileReader();
  r.onload = () => res(r.result);
  r.onerror = rej;
  r.readAsDataURL(file);
});

export const rotatePoint = (cx, cy, x, y, angle) => {
  const rad = angle * Math.PI / 180;
  const c = Math.cos(rad), s = Math.sin(rad);
  return { x: cx + (x - cx) * c - (y - cy) * s, y: cy + (x - cx) * s + (y - cy) * c };
};
