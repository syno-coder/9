/* exportEngine.js — render to offscreen canvas at scale, export PNG/JPG/WEBP */
import { state } from './state.js';
import { renderTo } from './renderer.js';
import { downloadBlob, toast } from './utils.js';

export const renderExport = (scale = 1, transparent = false) => {
  const c = state.canvas;
  const off = document.createElement('canvas');
  off.width = c.width * scale;
  off.height = c.height * scale;
  const ctx = off.getContext('2d');
  ctx.scale(scale, scale);
  if (transparent) {
    // skip bg fill by passing a transparent canvas spec
    const fakeCanvas = { ...c, bg: 'rgba(0,0,0,0)' };
    renderTo(ctx, fakeCanvas);
  } else {
    renderTo(ctx);
  }
  return off;
};

export const exportAs = async (format, scale, quality, transparent, name) => {
  const off = renderExport(scale, transparent && format !== 'jpeg');
  const mime = format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';
  return new Promise((res) => {
    off.toBlob(blob => {
      if (!blob) { toast('Export failed', 'error'); res(null); return; }
      downloadBlob(blob, `${name || 'azeel'}.${format === 'jpeg' ? 'jpg' : format}`);
      toast('Exported successfully', 'success');
      res(blob);
    }, mime, quality / 100);
  });
};

export const copyToClipboard = async () => {
  try {
    const off = renderExport(2, false);
    const blob = await new Promise(r => off.toBlob(r, 'image/png'));
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    toast('Copied to clipboard', 'success');
  } catch (e) {
    toast('Clipboard not supported', 'error');
  }
};
