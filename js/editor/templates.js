/* templates.js — 12 built-in templates */
import { state } from './state.js';
import { uid } from './utils.js';

const T = (id, name, category, canvas, layers) => ({ id, name, category, canvas, layers });

export const TEMPLATES = [
  T('gaming-1', 'Epic Gaming', 'Gaming',
    { width: 1280, height: 720, bg: '#0b0712' },
    [
      { id: uid('l'), type: 'shape', shape: 'rect', name: 'Glow', x: -50, y: -50, w: 1380, h: 820, fill: '#1a0b2e', visible: true, opacity: 1, rotation: 0 },
      { id: uid('l'), type: 'shape', shape: 'circle', name: 'Accent', x: 700, y: -200, w: 800, h: 800, fill: '#A78BFA', opacity: .35, visible: true, rotation: 0 },
      { id: uid('l'), type: 'text', name: 'Title', text: 'INSANE\nWIN', x: 60, y: 140, w: 700, h: 360, fontFamily: 'Anton', fontWeight: 900, fontSize: 180, color: '#fff', strokeColor: '#A78BFA', strokeWidth: 8, lineHeight: .95, align: 'left', visible: true, opacity: 1, rotation: 0 },
      { id: uid('l'), type: 'text', name: 'Tag', text: 'NEW VIDEO', x: 60, y: 540, w: 320, h: 60, fontFamily: 'Inter', fontWeight: 800, fontSize: 32, color: '#0B0F19', bgColor: '#22D3EE', padding: 12, align: 'center', visible: true, opacity: 1, rotation: 0 },
      { id: uid('l'), type: 'sticker', name: 'Fire', glyph: '🔥', x: 1000, y: 420, w: 220, h: 220, visible: true, opacity: 1, rotation: -10 },
    ]),
  T('gaming-2', 'Boss Fight', 'Gaming',
    { width: 1280, height: 720, bg: '#1c0a0a' },
    [
      { id: uid('l'), type: 'shape', shape: 'triangle', name: 'BG', x: -100, y: 200, w: 900, h: 700, fill: '#7f1d1d', opacity: .8, visible: true, rotation: 0 },
      { id: uid('l'), type: 'text', name: 'Title', text: 'FINAL\nBOSS', x: 80, y: 130, w: 700, h: 360, fontFamily: 'Anton', fontWeight: 900, fontSize: 200, color: '#fff', strokeColor: '#000', strokeWidth: 10, lineHeight: .95, align: 'left', visible: true, opacity: 1, rotation: 0 },
      { id: uid('l'), type: 'sticker', glyph: '⚔️', name: 'Sword', x: 980, y: 220, w: 240, h: 240, visible: true, opacity: 1, rotation: 15 },
    ]),
  T('vlog-1', 'Travel Vlog', 'Vlog',
    { width: 1280, height: 720, bg: '#fef3c7' },
    [
      { id: uid('l'), type: 'shape', shape: 'rect', name: 'Tape', x: 0, y: 540, w: 1280, h: 180, fill: '#0B0F19', visible: true, opacity: .9, rotation: 0 },
      { id: uid('l'), type: 'text', name: 'Title', text: 'TOKYO IN 48H', x: 60, y: 220, w: 1100, h: 140, fontFamily: 'Montserrat', fontWeight: 900, fontSize: 110, color: '#0B0F19', align: 'center', visible: true, opacity: 1, rotation: 0 },
      { id: uid('l'), type: 'text', name: 'Sub', text: 'A travel vlog · 2025', x: 60, y: 590, w: 1100, h: 80, fontFamily: 'Inter', fontWeight: 600, fontSize: 38, color: '#fef3c7', align: 'center', visible: true, opacity: 1, rotation: 0 },
      { id: uid('l'), type: 'sticker', glyph: '✈️', x: 60, y: 80, w: 120, h: 120, name: 'Plane', visible: true, opacity: 1, rotation: -15 },
    ]),
  T('vlog-2', 'Day in the Life', 'Vlog',
    { width: 1280, height: 720, bg: '#fce7f3' },
    [
      { id: uid('l'), type: 'shape', shape: 'circle', name: 'Bubble', x: 800, y: -150, w: 700, h: 700, fill: '#f472b6', opacity: .7, visible: true, rotation: 0 },
      { id: uid('l'), type: 'text', text: 'A DAY IN\nMY LIFE', x: 60, y: 160, w: 760, h: 360, fontFamily: 'Anton', fontWeight: 900, fontSize: 160, color: '#831843', lineHeight: .95, name: 'Title', align: 'left', visible: true, opacity: 1, rotation: 0 },
      { id: uid('l'), type: 'text', text: 'EP 24', x: 60, y: 540, w: 160, h: 60, fontFamily: 'Inter', fontWeight: 800, fontSize: 30, color: '#fff', bgColor: '#831843', padding: 10, name: 'Episode', align: 'center', visible: true, opacity: 1, rotation: 0 },
    ]),
  T('tech-1', 'Tech Review', 'Tech',
    { width: 1280, height: 720, bg: '#0F172A' },
    [
      { id: uid('l'), type: 'shape', shape: 'rect', name: 'Bar', x: 0, y: 600, w: 1280, h: 120, fill: '#22D3EE', visible: true, opacity: 1, rotation: 0 },
      { id: uid('l'), type: 'text', text: 'M4 PRO\nDESTROYED?', x: 60, y: 140, w: 1160, h: 380, fontFamily: 'Anton', fontWeight: 900, fontSize: 150, color: '#fff', lineHeight: .95, name: 'Title', strokeColor: '#22D3EE', strokeWidth: 0, align: 'left', visible: true, opacity: 1, rotation: 0 },
      { id: uid('l'), type: 'text', text: 'HONEST REVIEW', x: 60, y: 624, w: 600, h: 80, fontFamily: 'Inter', fontWeight: 800, fontSize: 38, color: '#0B0F19', name: 'Tag', align: 'left', visible: true, opacity: 1, rotation: 0 },
    ]),
  T('tech-2', 'AI Drop', 'Tech',
    { width: 1280, height: 720, bg: '#020617' },
    [
      { id: uid('l'), type: 'shape', shape: 'circle', name: 'Glow', x: 200, y: 100, w: 880, h: 520, fill: '#22D3EE', opacity: .25, visible: true, rotation: 0 },
      { id: uid('l'), type: 'text', text: 'GPT-NEXT IS HERE', x: 60, y: 280, w: 1160, h: 160, fontFamily: 'Montserrat', fontWeight: 900, fontSize: 100, color: '#fff', name: 'Title', align: 'center', visible: true, opacity: 1, rotation: 0 },
      { id: uid('l'), type: 'text', text: 'EVERYTHING YOU NEED TO KNOW', x: 60, y: 440, w: 1160, h: 70, fontFamily: 'Inter', fontWeight: 600, fontSize: 36, color: '#22D3EE', name: 'Sub', align: 'center', visible: true, opacity: 1, rotation: 0 },
    ]),
  T('podcast-1', 'Pod Episode', 'Podcast',
    { width: 1280, height: 720, bg: '#1e1b4b' },
    [
      { id: uid('l'), type: 'shape', shape: 'rect', radius: 24, name: 'Card', x: 80, y: 120, w: 1120, h: 480, fill: '#312e81', visible: true, opacity: 1, rotation: 0 },
      { id: uid('l'), type: 'sticker', glyph: '🎙️', x: 130, y: 220, w: 260, h: 260, name: 'Mic', visible: true, opacity: 1, rotation: 0 },
      { id: uid('l'), type: 'text', text: 'EP 042', x: 430, y: 220, w: 600, h: 60, fontFamily: 'Inter', fontWeight: 800, fontSize: 28, color: '#A78BFA', name: 'Ep', align: 'left', visible: true, opacity: 1, rotation: 0 },
      { id: uid('l'), type: 'text', text: 'BUILD YOUR\nFIRST STARTUP', x: 430, y: 270, w: 720, h: 220, fontFamily: 'Anton', fontWeight: 900, fontSize: 80, color: '#fff', lineHeight: 1, name: 'Title', align: 'left', visible: true, opacity: 1, rotation: 0 },
    ]),
  T('podcast-2', 'Mic Drop', 'Podcast',
    { width: 1080, height: 1080, bg: '#0f172a' },
    [
      { id: uid('l'), type: 'shape', shape: 'circle', name: 'Ring', x: 90, y: 90, w: 900, h: 900, fill: 'transparent', stroke: '#22D3EE', strokeWidth: 6, visible: true, opacity: 1, rotation: 0 },
      { id: uid('l'), type: 'text', text: 'MIC\nDROP', x: 90, y: 350, w: 900, h: 380, fontFamily: 'Anton', fontWeight: 900, fontSize: 220, color: '#fff', lineHeight: .95, name: 'Title', align: 'center', visible: true, opacity: 1, rotation: 0 },
      { id: uid('l'), type: 'text', text: 'A PODCAST', x: 90, y: 760, w: 900, h: 60, fontFamily: 'Inter', fontWeight: 700, fontSize: 32, color: '#22D3EE', name: 'Sub', align: 'center', visible: true, opacity: 1, rotation: 0 },
    ]),
  T('edu-1', 'Tutorial', 'Education',
    { width: 1280, height: 720, bg: '#fff' },
    [
      { id: uid('l'), type: 'shape', shape: 'rect', name: 'Strip', x: 0, y: 0, w: 1280, h: 100, fill: '#22D3EE', visible: true, opacity: 1, rotation: 0 },
      { id: uid('l'), type: 'text', text: 'LEARN PYTHON IN 10 MIN', x: 30, y: 30, w: 1220, h: 50, fontFamily: 'Inter', fontWeight: 800, fontSize: 36, color: '#0B0F19', name: 'Heading', align: 'left', visible: true, opacity: 1, rotation: 0 },
      { id: uid('l'), type: 'text', text: 'BEGINNER\nFRIENDLY', x: 80, y: 200, w: 800, h: 360, fontFamily: 'Anton', fontWeight: 900, fontSize: 170, color: '#0B0F19', lineHeight: .95, name: 'Title', align: 'left', visible: true, opacity: 1, rotation: 0 },
      { id: uid('l'), type: 'sticker', glyph: '🐍', x: 920, y: 240, w: 280, h: 280, name: 'Snake', visible: true, opacity: 1, rotation: -10 },
    ]),
  T('edu-2', 'Quiz Time', 'Education',
    { width: 1280, height: 720, bg: '#facc15' },
    [
      { id: uid('l'), type: 'text', text: 'QUIZ\nTIME!', x: 60, y: 100, w: 1160, h: 480, fontFamily: 'Anton', fontWeight: 900, fontSize: 240, color: '#0B0F19', lineHeight: .95, name: 'Title', align: 'center', visible: true, opacity: 1, rotation: 0 },
      { id: uid('l'), type: 'text', text: 'CAN YOU GET 10/10?', x: 60, y: 600, w: 1160, h: 80, fontFamily: 'Inter', fontWeight: 800, fontSize: 42, color: '#0B0F19', name: 'Sub', align: 'center', visible: true, opacity: 1, rotation: 0 },
    ]),
  T('reel-1', 'Reel Hook', 'Vlog',
    { width: 1080, height: 1920, bg: '#0B0F19' },
    [
      { id: uid('l'), type: 'shape', shape: 'circle', name: 'Glow', x: -200, y: 400, w: 1480, h: 1480, fill: '#A78BFA', opacity: .25, visible: true, rotation: 0 },
      { id: uid('l'), type: 'text', text: 'WAIT\nFOR IT…', x: 60, y: 700, w: 960, h: 600, fontFamily: 'Anton', fontWeight: 900, fontSize: 280, color: '#fff', lineHeight: .95, name: 'Hook', align: 'center', visible: true, opacity: 1, rotation: 0 },
      { id: uid('l'), type: 'text', text: 'Follow for more →', x: 60, y: 1700, w: 960, h: 80, fontFamily: 'Inter', fontWeight: 700, fontSize: 44, color: '#22D3EE', name: 'CTA', align: 'center', visible: true, opacity: 1, rotation: 0 },
    ]),
  T('reel-2', 'Tutorial Reel', 'Education',
    { width: 1080, height: 1920, bg: '#1e293b' },
    [
      { id: uid('l'), type: 'text', text: '3 TIPS\nTO GO\nVIRAL', x: 60, y: 400, w: 960, h: 900, fontFamily: 'Anton', fontWeight: 900, fontSize: 260, color: '#fff', lineHeight: .95, name: 'Title', align: 'left', strokeColor: '#22D3EE', strokeWidth: 6, visible: true, opacity: 1, rotation: 0 },
      { id: uid('l'), type: 'sticker', glyph: '🚀', x: 700, y: 1500, w: 300, h: 300, name: 'Rocket', visible: true, opacity: 1, rotation: -15 },
    ]),
];

export const applyTemplate = (tpl) => {
  if (!tpl) return;
  state.canvas = JSON.parse(JSON.stringify(tpl.canvas));
  state.layers = JSON.parse(JSON.stringify(tpl.layers)).map(l => ({ visible: true, opacity: 1, rotation: 0, ...l, id: uid('lyr') }));
  state.selectedId = null;
  // emit through state module by reassigning
  import('./state.js').then(m => m.emit('load'));
};
