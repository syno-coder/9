/* renderer.js — paint state.layers to a canvas context */
import { state } from './state.js';

const imageCache = new Map(); // src -> HTMLImageElement

const getImg = (src) => {
  if (!src) return null;
  if (imageCache.has(src)) return imageCache.get(src);
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => requestRedraw();
  img.src = src;
  imageCache.set(src, img);
  return img;
};

let redrawCb = null;
export const setRedrawCallback = (fn) => { redrawCb = fn; };
export const requestRedraw = () => { if (redrawCb) redrawCb(); };

const wrapText = (ctx, text, maxWidth) => {
  const lines = [];
  for (const para of String(text).split('\n')) {
    const words = para.split(' ');
    let line = '';
    for (const w of words) {
      const test = line ? line + ' ' + w : w;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = w;
      } else line = test;
    }
    lines.push(line);
  }
  return lines;
};

export const renderTo = (ctx, c = state.canvas, layers = state.layers) => {
  ctx.save();
  ctx.fillStyle = c.bg || '#fff';
  ctx.fillRect(0, 0, c.width, c.height);
  for (const l of layers) {
    if (!l.visible) continue;
    drawLayer(ctx, l);
  }
  ctx.restore();
};

const drawLayer = (ctx, l) => {
  ctx.save();
  ctx.globalAlpha = l.opacity ?? 1;
  const cx = l.x + l.w / 2, cy = l.y + l.h / 2;
  ctx.translate(cx, cy);
  ctx.rotate((l.rotation || 0) * Math.PI / 180);
  ctx.translate(-cx, -cy);

  if (l.type === 'image') {
    const img = getImg(l.src);
    if (img && img.complete && img.naturalWidth) {
      // apply filters
      const f = l.filters || {};
      const parts = [];
      if (f.brightness != null) parts.push(`brightness(${f.brightness}%)`);
      if (f.contrast != null) parts.push(`contrast(${f.contrast}%)`);
      if (f.saturate != null) parts.push(`saturate(${f.saturate}%)`);
      if (f.blur) parts.push(`blur(${f.blur}px)`);
      ctx.filter = parts.join(' ') || 'none';
      ctx.drawImage(img, l.x, l.y, l.w, l.h);
      ctx.filter = 'none';
    } else {
      ctx.fillStyle = '#1f2937'; ctx.fillRect(l.x, l.y, l.w, l.h);
    }
  } else if (l.type === 'shape') {
    ctx.fillStyle = l.fill || '#22D3EE';
    ctx.strokeStyle = l.stroke || 'transparent';
    ctx.lineWidth = l.strokeWidth || 0;
    if (l.shape === 'rect') {
      const r = l.radius || 0;
      roundRect(ctx, l.x, l.y, l.w, l.h, r);
      ctx.fill();
      if (l.strokeWidth) ctx.stroke();
    } else if (l.shape === 'circle') {
      ctx.beginPath();
      ctx.ellipse(l.x + l.w / 2, l.y + l.h / 2, l.w / 2, l.h / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      if (l.strokeWidth) ctx.stroke();
    } else if (l.shape === 'triangle') {
      ctx.beginPath();
      ctx.moveTo(l.x + l.w / 2, l.y);
      ctx.lineTo(l.x + l.w, l.y + l.h);
      ctx.lineTo(l.x, l.y + l.h);
      ctx.closePath();
      ctx.fill();
      if (l.strokeWidth) ctx.stroke();
    } else if (l.shape === 'arrow') {
      drawArrow(ctx, l);
    }
  } else if (l.type === 'text') {
    drawText(ctx, l);
  } else if (l.type === 'sticker') {
    // emoji/text-based sticker
    ctx.font = `${Math.min(l.w, l.h) * 0.85}px 'Inter', sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(l.glyph || '★', l.x + l.w / 2, l.y + l.h / 2);
  }
  ctx.restore();
};

const roundRect = (ctx, x, y, w, h, r) => {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
};

const drawArrow = (ctx, l) => {
  const x = l.x, y = l.y, w = l.w, h = l.h;
  const headW = Math.min(h, w * 0.4);
  const shaftH = h * 0.4;
  const shaftY = y + (h - shaftH) / 2;
  ctx.beginPath();
  ctx.moveTo(x, shaftY);
  ctx.lineTo(x + w - headW, shaftY);
  ctx.lineTo(x + w - headW, y);
  ctx.lineTo(x + w, y + h / 2);
  ctx.lineTo(x + w - headW, y + h);
  ctx.lineTo(x + w - headW, shaftY + shaftH);
  ctx.lineTo(x, shaftY + shaftH);
  ctx.closePath();
  ctx.fill();
  if (l.strokeWidth) ctx.stroke();
};

const drawText = (ctx, l) => {
  const size = l.fontSize || 64;
  const family = l.fontFamily || 'Inter';
  const weight = l.fontWeight || 800;
  ctx.font = `${weight} ${size}px '${family}', sans-serif`;
  ctx.textBaseline = 'top';
  ctx.textAlign = l.align || 'left';
  const lh = (l.lineHeight || 1.15) * size;
  const lines = wrapText(ctx, l.text || '', l.w);

  // bg highlight
  if (l.bgColor && l.bgColor !== 'transparent') {
    const pad = l.padding || 8;
    let by = l.y;
    for (const line of lines) {
      const tw = ctx.measureText(line).width;
      let bx = l.x;
      if (l.align === 'center') bx = l.x + (l.w - tw) / 2;
      if (l.align === 'right') bx = l.x + l.w - tw;
      ctx.fillStyle = l.bgColor;
      roundRect(ctx, bx - pad, by - pad / 2, tw + pad * 2, lh, l.bgRadius || 6);
      ctx.fill();
      by += lh;
    }
  }

  // shadow / glow
  if (l.shadowBlur) {
    ctx.shadowColor = l.shadowColor || 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = l.shadowBlur;
    ctx.shadowOffsetX = l.shadowX || 0;
    ctx.shadowOffsetY = l.shadowY || 0;
  }

  let y = l.y;
  for (const line of lines) {
    let x = l.x;
    if (l.align === 'center') x = l.x + l.w / 2;
    if (l.align === 'right') x = l.x + l.w;

    // stroke
    if (l.strokeWidth && l.strokeWidth > 0) {
      ctx.lineWidth = l.strokeWidth;
      ctx.strokeStyle = l.strokeColor || '#000';
      ctx.lineJoin = 'round';
      ctx.strokeText(line, x, y);
    }

    ctx.fillStyle = l.color || '#fff';
    ctx.fillText(line, x, y);
    y += lh;
  }

  ctx.shadowBlur = 0;
};

// hit test (ignoring rotation for simplicity in selection)
export const hitTest = (px, py) => {
  for (let i = state.layers.length - 1; i >= 0; i--) {
    const l = state.layers[i];
    if (!l.visible || l.locked) continue;
    const cx = l.x + l.w / 2, cy = l.y + l.h / 2;
    // inverse rotate
    const rad = -(l.rotation || 0) * Math.PI / 180;
    const dx = px - cx, dy = py - cy;
    const rx = dx * Math.cos(rad) - dy * Math.sin(rad) + cx;
    const ry = dx * Math.sin(rad) + dy * Math.cos(rad) + cy;
    if (rx >= l.x && rx <= l.x + l.w && ry >= l.y && ry <= l.y + l.h) return l;
  }
  return null;
};
