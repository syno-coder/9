/* tools.js — sidebar tool panels (templates/upload/text/shapes/stickers/adjust/resize) */
import { state, addLayer, getSelected, updateLayer, setCanvas, emit } from './state.js';
import { commit } from './history.js';
import { fitToScreen } from './canvasEngine.js';
import { fileToDataURL, loadImage, sanitizeText, toast, $, $$ } from './utils.js';
import { TEMPLATES, applyTemplate } from './templates.js';

const STICKERS = {
  Gaming: ['🎮','🕹️','🎯','🏆','💥','⚡','🔥','👾'],
  Tech: ['💻','📱','⚙️','🤖','🚀','🛰️','🧠','🔧'],
  Podcast: ['🎙️','🎧','🔊','🎵','📻','🗣️','🎚️','🔉'],
  Social: ['❤️','👍','💬','🔔','📢','✨','📈','🎉'],
  Arrows: ['➡️','⬅️','⬆️','⬇️','↗️','↘️','🔁','🔄'],
  Emojis: ['😂','😍','😎','🤯','😱','🥳','😤','🤩'],
  Badges: ['⭐','💎','🥇','🏅','✅','🆕','💯','🎁'],
};

const PANELS = {
  templates: () => `
    <h3 class="tp-title">Templates</h3>
    <div class="tp-section">
      <input id="tplSearch" placeholder="Search templates…" />
    </div>
    <div class="tp-section">
      <div class="btn-row" id="tplFilters">
        <button class="chip-btn active" data-cat="">All</button>
        <button class="chip-btn" data-cat="Gaming">Gaming</button>
        <button class="chip-btn" data-cat="Vlog">Vlog</button>
        <button class="chip-btn" data-cat="Tech">Tech</button>
        <button class="chip-btn" data-cat="Podcast">Podcast</button>
        <button class="chip-btn" data-cat="Education">Education</button>
      </div>
    </div>
    <div class="tp-templates" id="tplGrid"></div>
  `,
  upload: () => `
    <h3 class="tp-title">Upload</h3>
    <div class="upload-zone" id="uploadZone">
      <div class="uz-icon">⬆</div>
      <b>Drag & drop image</b>
      <div class="muted small mt-12">or click to browse · PNG, JPG, WEBP</div>
    </div>
    <div class="tp-section mt-32">
      <h4>Tips</h4>
      <p class="muted small">Uploaded images become a new layer. Use the Properties panel to crop, adjust and reposition.</p>
    </div>
  `,
  text: () => `
    <h3 class="tp-title">Add text</h3>
    <div class="tp-section">
      <button class="btn btn-primary full" data-add-text="heading">Add Heading</button>
    </div>
    <div class="tp-section">
      <button class="btn btn-ghost full" data-add-text="subheading">Add Subheading</button>
    </div>
    <div class="tp-section">
      <button class="btn btn-ghost full" data-add-text="body">Add Body</button>
    </div>
    <div class="tp-section">
      <h4>Text presets</h4>
      <div class="btn-row">
        <button class="chip-btn" data-text-preset="impact">Impact</button>
        <button class="chip-btn" data-text-preset="neon">Neon</button>
        <button class="chip-btn" data-text-preset="outline">Outline</button>
        <button class="chip-btn" data-text-preset="badge">Badge</button>
      </div>
    </div>
  `,
  shapes: () => `
    <h3 class="tp-title">Shapes</h3>
    <div class="sticker-grid">
      <button class="sticker-btn" data-shape="rect" title="Rectangle">▭</button>
      <button class="sticker-btn" data-shape="rect-r" title="Rounded">▢</button>
      <button class="sticker-btn" data-shape="circle" title="Circle">●</button>
      <button class="sticker-btn" data-shape="triangle" title="Triangle">▲</button>
      <button class="sticker-btn" data-shape="arrow" title="Arrow">➤</button>
    </div>
  `,
  stickers: () => {
    const cats = Object.entries(STICKERS).map(([cat, items]) => `
      <div class="tp-section">
        <h4>${cat}</h4>
        <div class="sticker-grid">
          ${items.map(g => `<button class="sticker-btn" data-sticker="${g}">${g}</button>`).join('')}
        </div>
      </div>`).join('');
    return `<h3 class="tp-title">Stickers</h3>${cats}`;
  },
  adjust: () => {
    const sel = getSelected();
    if (!sel || sel.type !== 'image') return `<h3 class="tp-title">Adjust</h3><p class="muted small">Select an image layer to adjust filters.</p>`;
    const f = sel.filters || { brightness: 100, contrast: 100, saturate: 100, blur: 0 };
    return `
      <h3 class="tp-title">Adjust image</h3>
      ${sliderRow('Brightness', 'brightness', f.brightness, 0, 200)}
      ${sliderRow('Contrast', 'contrast', f.contrast, 0, 200)}
      ${sliderRow('Saturation', 'saturate', f.saturate, 0, 200)}
      ${sliderRow('Blur', 'blur', f.blur, 0, 20)}
      <button class="btn btn-ghost full mt-12" id="resetFilters">Reset</button>
      <div class="tp-section mt-32">
        <h4>Background</h4>
        <button class="btn btn-ghost full" id="bgRemoveBtn">Remove background</button>
        <p class="muted small mt-12">Background removal requires an external API. Add your API key in <code>js/editor/tools.js</code>.</p>
      </div>
    `;
  },
  resize: () => {
    const c = state.canvas;
    return `
      <h3 class="tp-title">Canvas size</h3>
      <div class="tp-section">
        <h4>Presets</h4>
        <div class="btn-row" id="presetRow">
          <button class="chip-btn" data-preset="1280x720">YT Thumb</button>
          <button class="chip-btn" data-preset="2560x1440">YT Banner</button>
          <button class="chip-btn" data-preset="1080x1920">Reels</button>
          <button class="chip-btn" data-preset="1080x1080">IG Post</button>
          <button class="chip-btn" data-preset="820x312">FB Cover</button>
        </div>
      </div>
      <div class="tp-section">
        <h4>Custom</h4>
        <div class="prop-grid">
          <label>Width <input type="number" id="cw" value="${c.width}" min="100" max="6000" /></label>
          <label>Height <input type="number" id="ch" value="${c.height}" min="100" max="6000" /></label>
        </div>
        <button class="btn btn-primary full" id="applyResize">Apply size</button>
      </div>
      <div class="tp-section">
        <h4>Background</h4>
        <input type="color" id="cbg" value="${c.bg || '#111827'}" />
      </div>
    `;
  },
};

const sliderRow = (label, key, val, min, max) => `
  <div class="prop-row">
    <label>${label}</label>
    <input type="range" data-filter="${key}" min="${min}" max="${max}" value="${val}" />
    <span class="val" data-filterval="${key}">${val}</span>
  </div>`;

let currentPanel = null;
let panelEl, sheetEl, sheetBody, sheetTitle, sheetBackdrop;

export const initTools = () => {
  panelEl = document.getElementById('toolPanel');
  sheetEl = document.getElementById('sheet');
  sheetBody = document.getElementById('sheetBody');
  sheetTitle = document.getElementById('sheetTitle');
  sheetBackdrop = document.getElementById('sheetBackdrop');

  $$('.left-bar .tool, .bottom-bar .bb-tool').forEach(btn => {
    btn.addEventListener('click', () => openPanel(btn.dataset.panel));
  });

  document.getElementById('sheetClose').addEventListener('click', closeSheet);
  sheetBackdrop.addEventListener('click', closeSheet);

  openPanel('templates');
};

const openPanel = (name) => {
  if (!name) return;
  if (name === 'layers') {
    renderInto(sheetBody, document.getElementById('rbLayers').innerHTML);
    sheetTitle.textContent = 'Layers';
    showSheet();
    return;
  }
  currentPanel = name;
  const html = (PANELS[name] || (() => '<p class="muted small">Coming soon.</p>'))();

  if (window.matchMedia('(max-width: 760px)').matches) {
    sheetTitle.textContent = name.charAt(0).toUpperCase() + name.slice(1);
    renderInto(sheetBody, html);
    showSheet();
    bindPanel(sheetBody, name);
  } else {
    renderInto(panelEl, html);
    bindPanel(panelEl, name);
  }
  $$('.left-bar .tool').forEach(b => b.classList.toggle('active', b.dataset.panel === name));
  $$('.bottom-bar .bb-tool').forEach(b => b.classList.toggle('active', b.dataset.panel === name));
};

const renderInto = (el, html) => { el.innerHTML = html; };

const showSheet = () => {
  sheetEl.hidden = false;
  sheetBackdrop.hidden = false;
};
const closeSheet = () => {
  sheetEl.hidden = true;
  sheetBackdrop.hidden = true;
};

const bindPanel = (root, name) => {
  if (name === 'templates') bindTemplatesPanel(root);
  if (name === 'upload') bindUploadPanel(root);
  if (name === 'text') bindTextPanel(root);
  if (name === 'shapes') bindShapesPanel(root);
  if (name === 'stickers') bindStickersPanel(root);
  if (name === 'adjust') bindAdjustPanel(root);
  if (name === 'resize') bindResizePanel(root);
};

const bindTemplatesPanel = (root) => {
  const grid = root.querySelector('#tplGrid');
  const search = root.querySelector('#tplSearch');
  const filters = root.querySelector('#tplFilters');
  let cat = '';
  const render = () => {
    const q = (search.value || '').toLowerCase();
    const list = TEMPLATES.filter(t => (!cat || t.category === cat) && (!q || t.name.toLowerCase().includes(q)));
    grid.innerHTML = list.map(t => `
      <div class="tpl-card" data-id="${t.id}">
        <div class="tpl-thumb"><canvas data-tpl-thumb="${t.id}"></canvas></div>
        <div class="tpl-meta"><b>${t.name}</b><span>${t.category}</span></div>
      </div>`).join('');
    list.forEach(t => {
      const c = grid.querySelector(`[data-tpl-thumb="${t.id}"]`);
      if (c) renderThumbnail(c, t);
    });
    grid.querySelectorAll('.tpl-card').forEach(card => {
      card.addEventListener('click', () => {
        const t = TEMPLATES.find(x => x.id === card.dataset.id);
        applyTemplate(t);
        commit();
        fitToScreen();
        closeSheet();
        toast('Template applied', 'success');
      });
    });
  };
  search.addEventListener('input', render);
  filters.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
    filters.querySelectorAll('button').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    cat = b.dataset.cat; render();
  }));
  render();
};

const renderThumbnail = async (canvasEl, tpl) => {
  await new Promise(r => requestAnimationFrame(r));
  const w = canvasEl.clientWidth || 220, h = canvasEl.clientHeight || 124;
  canvasEl.width = w; canvasEl.height = h;
  const ctx = canvasEl.getContext('2d');
  const sx = w / tpl.canvas.width, sy = h / tpl.canvas.height;
  const s = Math.min(sx, sy);
  ctx.fillStyle = tpl.canvas.bg || '#111';
  ctx.fillRect(0, 0, w, h);
  ctx.save();
  ctx.scale(s, s);
  const { renderTo } = await import('./renderer.js');
  renderTo(ctx, tpl.canvas, tpl.layers);
  ctx.restore();
};

const bindUploadPanel = (root) => {
  const zone = root.querySelector('#uploadZone');
  const input = document.getElementById('fileInput');
  zone.addEventListener('click', () => input.click());
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag'));
  zone.addEventListener('drop', async e => {
    e.preventDefault(); zone.classList.remove('drag');
    const f = e.dataTransfer.files?.[0];
    if (f) await handleImageFile(f);
  });
  input.onchange = async () => { if (input.files[0]) { await handleImageFile(input.files[0]); input.value=''; } };
};

export const handleImageFile = async (file) => {
  if (!file.type.startsWith('image/')) { toast('Not an image file', 'error'); return; }
  const dataURL = await fileToDataURL(file);
  const img = await loadImage(dataURL);
  const c = state.canvas;
  const ratio = Math.min(c.width / img.naturalWidth, c.height / img.naturalHeight, 1);
  const w = img.naturalWidth * ratio, h = img.naturalHeight * ratio;
  addLayer({
    type: 'image', name: file.name.slice(0, 40),
    src: dataURL,
    x: (c.width - w) / 2, y: (c.height - h) / 2,
    w, h, filters: { brightness: 100, contrast: 100, saturate: 100, blur: 0 },
  });
  commit();
  closeSheet();
  toast('Image added', 'success');
};

const bindTextPanel = (root) => {
  root.querySelectorAll('[data-add-text]').forEach(b => {
    b.addEventListener('click', () => {
      const k = b.dataset.addText;
      const presets = {
        heading: { text: 'YOUR HEADLINE', fontSize: 96, fontWeight: 900, fontFamily: 'Anton', w: 760, h: 130, color: '#ffffff', strokeWidth: 0, shadowBlur: 16, shadowColor: 'rgba(0,0,0,0.6)', align: 'left' },
        subheading: { text: 'Subheading text', fontSize: 48, fontWeight: 700, fontFamily: 'Inter', w: 520, h: 70, color: '#22D3EE', align: 'left' },
        body: { text: 'Body copy goes here. Edit me.', fontSize: 28, fontWeight: 500, fontFamily: 'Inter', w: 480, h: 80, color: '#F8FAFC', align: 'left' },
      };
      const c = state.canvas;
      const p = presets[k];
      addLayer({ type: 'text', name: p.text.slice(0, 30), x: (c.width - p.w) / 2, y: (c.height - p.h) / 2, ...p });
      commit(); closeSheet(); toast('Text added', 'success');
    });
  });
  root.querySelectorAll('[data-text-preset]').forEach(b => {
    b.addEventListener('click', () => {
      const sel = getSelected();
      if (!sel || sel.type !== 'text') { toast('Select a text layer first'); return; }
      const presets = {
        impact: { fontFamily: 'Anton', fontWeight: 900, color: '#ffffff', strokeColor: '#000', strokeWidth: 6, shadowBlur: 0 },
        neon: { color: '#22D3EE', strokeWidth: 0, shadowColor: '#22D3EE', shadowBlur: 28 },
        outline: { color: 'transparent', strokeColor: '#ffffff', strokeWidth: 4 },
        badge: { color: '#0B0F19', bgColor: '#22D3EE', padding: 14, bgRadius: 10, strokeWidth: 0, shadowBlur: 0 },
      };
      updateLayer(sel.id, presets[b.dataset.textPreset]);
      commit();
    });
  });
};

const bindShapesPanel = (root) => {
  root.querySelectorAll('[data-shape]').forEach(b => {
    b.addEventListener('click', () => {
      const k = b.dataset.shape;
      const c = state.canvas;
      const base = { type: 'shape', x: (c.width - 240) / 2, y: (c.height - 240) / 2, w: 240, h: 240, fill: '#22D3EE', strokeWidth: 0, stroke: '#000' };
      const map = {
        'rect': { shape: 'rect', radius: 0, name: 'Rectangle' },
        'rect-r': { shape: 'rect', radius: 28, name: 'Rounded' },
        'circle': { shape: 'circle', name: 'Circle' },
        'triangle': { shape: 'triangle', name: 'Triangle' },
        'arrow': { shape: 'arrow', name: 'Arrow', fill: '#A78BFA', w: 320, h: 140 },
      };
      addLayer({ ...base, ...map[k] });
      commit(); closeSheet();
    });
  });
};

const bindStickersPanel = (root) => {
  root.querySelectorAll('[data-sticker]').forEach(b => {
    b.addEventListener('click', () => {
      const c = state.canvas;
      addLayer({ type: 'sticker', name: 'Sticker', glyph: b.dataset.sticker, x: (c.width - 160) / 2, y: (c.height - 160) / 2, w: 160, h: 160 });
      commit(); closeSheet();
    });
  });
};

const bindAdjustPanel = (root) => {
  root.querySelectorAll('[data-filter]').forEach(inp => {
    inp.addEventListener('input', () => {
      const sel = getSelected(); if (!sel || sel.type !== 'image') return;
      const f = { ...(sel.filters || {}) };
      f[inp.dataset.filter] = +inp.value;
      updateLayer(sel.id, { filters: f });
      const v = root.querySelector(`[data-filterval="${inp.dataset.filter}"]`);
      if (v) v.textContent = inp.value;
    });
    inp.addEventListener('change', commit);
  });
  const reset = root.querySelector('#resetFilters');
  if (reset) reset.addEventListener('click', () => {
    const sel = getSelected(); if (!sel) return;
    updateLayer(sel.id, { filters: { brightness: 100, contrast: 100, saturate: 100, blur: 0 } });
    commit(); openPanel('adjust');
  });
  const bg = root.querySelector('#bgRemoveBtn');
  if (bg) bg.addEventListener('click', () => {
    toast('Connect a background-removal API to enable this feature.', 'error');
  });
};

const bindResizePanel = (root) => {
  root.querySelectorAll('[data-preset]').forEach(b => {
    b.addEventListener('click', () => {
      const [w, h] = b.dataset.preset.split('x').map(Number);
      const ok = confirm('Scale content to fit the new canvas? (Cancel to keep original positions)');
      applyCanvasResize(w, h, ok);
    });
  });
  root.querySelector('#applyResize').addEventListener('click', () => {
    const w = +root.querySelector('#cw').value;
    const h = +root.querySelector('#ch').value;
    if (!w || !h) return;
    const ok = confirm('Scale content to fit the new canvas?');
    applyCanvasResize(w, h, ok);
  });
  root.querySelector('#cbg').addEventListener('input', e => {
    setCanvas(state.canvas.width, state.canvas.height, e.target.value);
  });
  root.querySelector('#cbg').addEventListener('change', commit);
};

const applyCanvasResize = (w, h, scaleContent) => {
  if (scaleContent) {
    const sx = w / state.canvas.width, sy = h / state.canvas.height;
    state.layers.forEach(l => {
      l.x *= sx; l.y *= sy; l.w *= sx; l.h *= sy;
      if (l.type === 'text' && l.fontSize) l.fontSize *= Math.min(sx, sy);
    });
  }
  setCanvas(w, h);
  fitToScreen();
  commit();
};

export const refreshCurrentPanel = () => { if (currentPanel) openPanel(currentPanel); };
