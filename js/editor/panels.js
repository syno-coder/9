/* propertiesPanel.js + layersPanel.js (combined) */
import { state, getSelected, updateLayer, removeLayer, reorderLayer, moveLayerToIndex, duplicateLayer, select, subscribe } from './state.js';
import { commit } from './history.js';
import { sanitizeText, $$ } from './utils.js';

let propsEl, layersEl;

export const initPanels = () => {
  propsEl = document.getElementById('rbProps');
  layersEl = document.getElementById('rbLayers');
  $$('.rb-tab').forEach(t => t.addEventListener('click', () => {
    $$('.rb-tab').forEach(x => x.classList.toggle('active', x === t));
    propsEl.hidden = t.dataset.tab !== 'props';
    layersEl.hidden = t.dataset.tab !== 'layers';
  }));
  subscribe(() => { renderProps(); renderLayers(); });
  renderProps(); renderLayers();
};

const renderProps = () => {
  const sel = getSelected();
  if (!sel) {
    propsEl.innerHTML = `<p class="muted small">Select a layer to edit its properties.</p>
    <div class="tp-section" style="margin-top:18px">
      <h4>Canvas</h4>
      <div class="prop-row"><label>Width</label><span class="val">${state.canvas.width}px</span></div>
      <div class="prop-row"><label>Height</label><span class="val">${state.canvas.height}px</span></div>
      <div class="prop-row"><label>Background</label><input type="color" id="canvasBg" value="${state.canvas.bg || '#111827'}" /></div>
    </div>`;
    const cb = document.getElementById('canvasBg');
    if (cb) {
      cb.addEventListener('input', e => { state.canvas.bg = e.target.value; import('./state.js').then(m => m.emit('canvas')); });
      cb.addEventListener('change', commit);
    }
    return;
  }

  let html = `
    <div class="prop-row"><label>Name</label><input id="pName" value="${escapeHtml(sel.name || '')}" /></div>
    <div class="prop-grid">
      <label>X<input type="number" id="pX" value="${Math.round(sel.x)}"/></label>
      <label>Y<input type="number" id="pY" value="${Math.round(sel.y)}"/></label>
      <label>W<input type="number" id="pW" value="${Math.round(sel.w)}"/></label>
      <label>H<input type="number" id="pH" value="${Math.round(sel.h)}"/></label>
    </div>
    <div class="prop-row"><label>Rotation</label><input type="range" id="pR" min="-180" max="180" value="${sel.rotation || 0}"/><span class="val">${Math.round(sel.rotation||0)}°</span></div>
    <div class="prop-row"><label>Opacity</label><input type="range" id="pO" min="0" max="100" value="${Math.round((sel.opacity ?? 1) * 100)}"/><span class="val">${Math.round((sel.opacity??1)*100)}%</span></div>
  `;

  if (sel.type === 'text') {
    html += `
      <h4 style="margin-top:14px">Text</h4>
      <div class="prop-row"><label>Content</label><textarea id="tText" rows="2">${escapeHtml(sel.text || '')}</textarea></div>
      <div class="prop-grid">
        <label>Font<select id="tFont">
          ${['Inter','Poppins','Anton','Bebas Neue','Montserrat'].map(f => `<option ${sel.fontFamily===f?'selected':''}>${f}</option>`).join('')}
        </select></label>
        <label>Weight<select id="tWeight">
          ${[400,500,600,700,800,900].map(w => `<option ${sel.fontWeight==w?'selected':''}>${w}</option>`).join('')}
        </select></label>
      </div>
      <div class="prop-row"><label>Size</label><input type="range" id="tSize" min="10" max="400" value="${sel.fontSize||64}"/><span class="val">${sel.fontSize||64}</span></div>
      <div class="prop-row"><label>Line ht</label><input type="range" id="tLh" min="80" max="200" value="${Math.round((sel.lineHeight||1.15)*100)}"/><span class="val">${Math.round((sel.lineHeight||1.15)*100)}%</span></div>
      <div class="prop-row"><label>Color</label><input type="color" id="tColor" value="${sel.color || '#ffffff'}"/></div>
      <div class="prop-row"><label>Align</label>
        <div class="btn-row">
          ${['left','center','right'].map(a => `<button class="chip-btn ${sel.align===a?'active':''}" data-align="${a}">${a}</button>`).join('')}
        </div>
      </div>
      <h4 style="margin-top:14px">Stroke</h4>
      <div class="prop-row"><label>Width</label><input type="range" id="tSw" min="0" max="20" value="${sel.strokeWidth||0}"/><span class="val">${sel.strokeWidth||0}</span></div>
      <div class="prop-row"><label>Color</label><input type="color" id="tSc" value="${sel.strokeColor||'#000000'}"/></div>
      <h4 style="margin-top:14px">Shadow / Glow</h4>
      <div class="prop-row"><label>Blur</label><input type="range" id="tShB" min="0" max="60" value="${sel.shadowBlur||0}"/><span class="val">${sel.shadowBlur||0}</span></div>
      <div class="prop-row"><label>Color</label><input type="color" id="tShC" value="${(sel.shadowColor||'#000000').slice(0,7)}"/></div>
      <h4 style="margin-top:14px">Background</h4>
      <div class="prop-row"><label>Color</label><input type="color" id="tBg" value="${(sel.bgColor && sel.bgColor !== 'transparent') ? sel.bgColor : '#000000'}"/></div>
      <button class="chip-btn" id="tBgClear">Clear background</button>
    `;
  }
  if (sel.type === 'shape') {
    html += `
      <h4 style="margin-top:14px">Shape</h4>
      <div class="prop-row"><label>Fill</label><input type="color" id="sFill" value="${sel.fill||'#22D3EE'}"/></div>
      <div class="prop-row"><label>Stroke</label><input type="color" id="sStroke" value="${sel.stroke||'#000000'}"/></div>
      <div class="prop-row"><label>Stroke W</label><input type="range" id="sSw" min="0" max="30" value="${sel.strokeWidth||0}"/><span class="val">${sel.strokeWidth||0}</span></div>
      ${sel.shape==='rect' ? `<div class="prop-row"><label>Radius</label><input type="range" id="sR" min="0" max="200" value="${sel.radius||0}"/><span class="val">${sel.radius||0}</span></div>`:''}
    `;
  }
  if (sel.type === 'image') {
    const f = sel.filters || { brightness: 100, contrast: 100, saturate: 100, blur: 0 };
    html += `
      <h4 style="margin-top:14px">Filters</h4>
      <div class="prop-row"><label>Brightness</label><input type="range" data-f="brightness" min="0" max="200" value="${f.brightness}"/><span class="val">${f.brightness}</span></div>
      <div class="prop-row"><label>Contrast</label><input type="range" data-f="contrast" min="0" max="200" value="${f.contrast}"/><span class="val">${f.contrast}</span></div>
      <div class="prop-row"><label>Saturate</label><input type="range" data-f="saturate" min="0" max="200" value="${f.saturate}"/><span class="val">${f.saturate}</span></div>
      <div class="prop-row"><label>Blur</label><input type="range" data-f="blur" min="0" max="20" value="${f.blur}"/><span class="val">${f.blur}</span></div>
    `;
  }

  html += `
    <div class="btn-row" style="margin-top:16px">
      <button class="chip-btn" data-act="dup">Duplicate</button>
      <button class="chip-btn" data-act="front">↑ Front</button>
      <button class="chip-btn" data-act="back">↓ Back</button>
      <button class="chip-btn" data-act="lock">${sel.locked?'Unlock':'Lock'}</button>
      <button class="chip-btn" data-act="hide">${sel.visible===false?'Show':'Hide'}</button>
      <button class="chip-btn" style="color:#fca5a5" data-act="del">Delete</button>
    </div>
  `;
  propsEl.innerHTML = html;
  bindProps(sel);
};

const bindProps = (sel) => {
  const on = (id, ev, fn) => { const e = propsEl.querySelector('#'+id); if (e) e.addEventListener(ev, fn); };
  const onLive = (id, key, parse=Number) => {
    on(id, 'input', e => updateLayer(sel.id, { [key]: parse(e.target.value) }));
    on(id, 'change', commit);
  };
  on('pName', 'input', e => updateLayer(sel.id, { name: sanitizeText(e.target.value).slice(0, 60) }));
  on('pName', 'change', commit);
  onLive('pX','x'); onLive('pY','y'); onLive('pW','w'); onLive('pH','h');
  on('pR','input', e => updateLayer(sel.id, { rotation: +e.target.value }));
  on('pR','change', commit);
  on('pO','input', e => updateLayer(sel.id, { opacity: +e.target.value/100 }));
  on('pO','change', commit);

  if (sel.type === 'text') {
    on('tText','input', e => updateLayer(sel.id, { text: sanitizeText(e.target.value) }));
    on('tText','change', commit);
    on('tFont','change', e => { updateLayer(sel.id, { fontFamily: e.target.value }); commit(); });
    on('tWeight','change', e => { updateLayer(sel.id, { fontWeight: +e.target.value }); commit(); });
    on('tSize','input', e => updateLayer(sel.id, { fontSize: +e.target.value }));
    on('tSize','change', commit);
    on('tLh','input', e => updateLayer(sel.id, { lineHeight: +e.target.value/100 }));
    on('tLh','change', commit);
    on('tColor','input', e => updateLayer(sel.id, { color: e.target.value }));
    on('tColor','change', commit);
    propsEl.querySelectorAll('[data-align]').forEach(b => b.addEventListener('click', () => { updateLayer(sel.id,{align:b.dataset.align}); commit(); }));
    on('tSw','input', e => updateLayer(sel.id,{ strokeWidth:+e.target.value }));
    on('tSw','change', commit);
    on('tSc','input', e => updateLayer(sel.id,{ strokeColor: e.target.value }));
    on('tSc','change', commit);
    on('tShB','input', e => updateLayer(sel.id,{ shadowBlur:+e.target.value }));
    on('tShB','change', commit);
    on('tShC','input', e => updateLayer(sel.id,{ shadowColor: e.target.value }));
    on('tShC','change', commit);
    on('tBg','input', e => updateLayer(sel.id,{ bgColor: e.target.value }));
    on('tBg','change', commit);
    on('tBgClear','click', () => { updateLayer(sel.id,{ bgColor: 'transparent' }); commit(); });
  }
  if (sel.type === 'shape') {
    on('sFill','input', e => updateLayer(sel.id,{ fill: e.target.value }));
    on('sFill','change', commit);
    on('sStroke','input', e => updateLayer(sel.id,{ stroke: e.target.value }));
    on('sStroke','change', commit);
    on('sSw','input', e => updateLayer(sel.id,{ strokeWidth: +e.target.value }));
    on('sSw','change', commit);
    on('sR','input', e => updateLayer(sel.id,{ radius: +e.target.value }));
    on('sR','change', commit);
  }
  if (sel.type === 'image') {
    propsEl.querySelectorAll('[data-f]').forEach(inp => {
      inp.addEventListener('input', () => {
        const f = { ...(sel.filters||{}) };
        f[inp.dataset.f] = +inp.value;
        updateLayer(sel.id, { filters: f });
      });
      inp.addEventListener('change', commit);
    });
  }
  propsEl.querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', () => {
    const a = b.dataset.act;
    if (a==='dup') duplicateLayer(sel.id);
    if (a==='front') reorderLayer(sel.id, 'top');
    if (a==='back') reorderLayer(sel.id, 'bottom');
    if (a==='lock') { sel.locked = !sel.locked; import('./state.js').then(m=>m.emit('update')); }
    if (a==='hide') { sel.visible = !sel.visible; import('./state.js').then(m=>m.emit('update')); }
    if (a==='del') { if (confirm('Delete layer?')) removeLayer(sel.id); }
    commit();
  }));
};

const renderLayers = () => {
  if (!state.layers.length) {
    layersEl.innerHTML = `<p class="muted small">No layers yet. Add text, shapes or images from the left panel.</p>`;
    return;
  }
  // top of list = front
  const items = [...state.layers].reverse();
  layersEl.innerHTML = items.map((l, i) => `
    <div class="layer-item ${l.id===state.selectedId?'selected':''}" draggable="true" data-id="${l.id}">
      <div class="li-thumb">${iconFor(l)}</div>
      <div class="li-name">${escapeHtml(l.name || l.type)}</div>
      <div class="li-actions">
        <button data-act="vis" title="${l.visible===false?'Show':'Hide'}">${l.visible===false?'◌':'●'}</button>
        <button data-act="lock" title="${l.locked?'Unlock':'Lock'}">${l.locked?'🔒':'🔓'}</button>
        <button data-act="del" title="Delete">✕</button>
      </div>
    </div>
  `).join('');

  layersEl.querySelectorAll('.layer-item').forEach(item => {
    const id = item.dataset.id;
    item.addEventListener('click', e => { if (!e.target.closest('button')) select(id); });
    item.querySelectorAll('button').forEach(b => b.addEventListener('click', e => {
      e.stopPropagation();
      const l = state.layers.find(x => x.id === id);
      if (!l) return;
      if (b.dataset.act === 'vis') { l.visible = l.visible === false ? true : false; import('./state.js').then(m=>m.emit('update')); }
      if (b.dataset.act === 'lock') { l.locked = !l.locked; import('./state.js').then(m=>m.emit('update')); }
      if (b.dataset.act === 'del') { if (confirm('Delete layer?')) removeLayer(id); }
      commit();
    }));
    // drag reorder
    item.addEventListener('dragstart', e => { item.classList.add('dragging'); e.dataTransfer.setData('text/plain', id); });
    item.addEventListener('dragend', () => item.classList.remove('dragging'));
    item.addEventListener('dragover', e => e.preventDefault());
    item.addEventListener('drop', e => {
      e.preventDefault();
      const srcId = e.dataTransfer.getData('text/plain');
      if (!srcId || srcId === id) return;
      // reversed list -> compute target index
      const rev = [...state.layers].reverse();
      const targetRevIdx = rev.findIndex(x => x.id === id);
      const newRealIdx = state.layers.length - 1 - targetRevIdx;
      moveLayerToIndex(srcId, newRealIdx);
      commit();
    });
  });
};

const iconFor = (l) => ({ image: '🖼', text: 'T', shape: '◯', sticker: l.glyph || '★' }[l.type] || '?');
const escapeHtml = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
