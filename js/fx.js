// 共用小特效：点击火花、粒子爆开、飘起的小字、震动、屏幕抖动和闪光。
import { sfx } from './audio.js';

const COLORS = Object.freeze(['#ffd27a', '#ff8f70', '#f06a8a', '#aab4ff', '#fff6e8']);
const SPARK_MS = 900;
const FLOAT_MS = 1700;
const app = () => document.getElementById('app');
const host = () => document.getElementById('fx');
const pick = (list) => list[Math.floor(Math.random() * list.length)];

/** 手机震动反馈（iPhone 的 Safari 不支持，会自动跳过）。 */
export function vibrate(pattern) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}

/** 在 (x, y)（相对 #app 的像素坐标）爆开一圈粒子；glyph 传字符则用字符代替方块。 */
export function burst(x, y, { count = 8, spread = 60, glyph = null, colors = COLORS } = {}) {
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const d = spread * (0.35 + Math.random() * 0.65);
    const el = document.createElement('span');
    el.className = glyph ? 'spark glyph' : 'spark';
    if (glyph) { el.textContent = glyph; el.style.color = pick(colors); } else { el.style.background = pick(colors); }
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.setProperty('--dx', `${Math.round(Math.cos(a) * d)}px`);
    el.style.setProperty('--dy', `${Math.round(Math.sin(a) * d)}px`);
    host().appendChild(el);
    setTimeout(() => el.remove(), SPARK_MS);
  }
}

/** 元素中心相对 #app 的坐标。 */
export function centerOf(el) {
  const r = el.getBoundingClientRect();
  const base = app().getBoundingClientRect();
  return { x: r.left - base.left + r.width / 2, y: r.top - base.top + r.height / 2 };
}

export function burstAt(el, opts) {
  const { x, y } = centerOf(el);
  burst(x, y, opts);
}

/** 一个慢慢飘上去的小字（比如 ♥、+1）。 */
export function floatUp(x, y, text, color = '#f06a8a') {
  const el = document.createElement('span');
  el.className = 'floaty';
  el.textContent = text;
  el.style.color = color;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  host().appendChild(el);
  setTimeout(() => el.remove(), FLOAT_MS);
}

/** 背景里一直慢慢往上飘的小符号。 */
export function spawnDrift(target, glyphs, count = 14) {
  for (let i = 0; i < count; i++) {
    const el = document.createElement('span');
    el.textContent = glyphs[i % glyphs.length];
    el.style.left = `${4 + Math.random() * 92}%`;
    el.style.fontSize = `${10 + Math.round(Math.random() * 12)}px`;
    el.style.animationDuration = `${(6 + Math.random() * 6).toFixed(1)}s`;
    el.style.animationDelay = `${(-Math.random() * 12).toFixed(1)}s`;
    target.appendChild(el);
  }
}

function replay(el, cls) {
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
}

export const shakeScreen = () => replay(app(), 'quake');
export const flashScreen = () => replay(host(), 'flash');

/** 点到哪里，哪里就冒一点小火花。 */
export function initTapSparks() {
  app().addEventListener('pointerdown', (e) => {
    if (e.target.closest('input')) return;
    const base = app().getBoundingClientRect();
    burst(e.clientX - base.left, e.clientY - base.top, { count: 5, spread: 34 });
    sfx.tap();
  });
}
