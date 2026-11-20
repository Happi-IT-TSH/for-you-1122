// 天空、海、木栈道。p 是“走到第几站”的小数，天色随之从白天变到深夜。
import { px } from './sprites.js';

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const SKY_TOP = ['#8fc7e8', '#8fc7e8', '#6fb8ec', '#6ab4ea', '#7aa7e0', '#6a5fb0', '#1b1d4a', '#0f1238', '#0a0d2c'].map(hex);
const SKY_BOT = ['#ffe3cf', '#ffe3cf', '#d8f0ff', '#e6f4ff', '#ffe2b0', '#ff9e7a', '#4a3a78', '#2a2a5e', '#1c2050'].map(hex);
const SEA = ['#5cc3d0', '#5cc3d0', '#4fb6d6', '#4fb6d6', '#5aa9c4', '#7a6fa8', '#1f2a5e', '#182250', '#141c44'].map(hex);
const DECK = ['#e8c9a0', '#e8c9a0', '#e8c9a0', '#e6c69c', '#e0b88a', '#b98a7a', '#4a4068', '#3a3358', '#332c50'].map(hex);
const SAND = ['#f6e2b8', '#f6e2b8', '#f6e2b8', '#f4deb2', '#eccf9e', '#c49a86', '#3f3a66', '#322e56', '#2a274c'].map(hex);

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const mod = (a, n) => ((a % n) + n) % n;

function sample(arr, p) {
  const q = clamp(p, 0, arr.length - 1);
  const i = Math.floor(q);
  const f = q - i;
  const a = arr[i];
  const b = arr[Math.min(i + 1, arr.length - 1)];
  return a.map((v, k) => Math.round(v + (b[k] - v) * f));
}
const rgb = (a) => `rgb(${a[0]},${a[1]},${a[2]})`;

function disc(c, cx, cy, r, col) {
  for (let y = -r; y <= r; y++) {
    const w = Math.round(Math.sqrt(r * r - y * y));
    px(c, cx - w, cy + y, w * 2, 1, col);
  }
}

export function drawBackdrop(c, W, H, gy, p, camX, t) {
  const seaTop = gy - 24;
  const night = clamp((p - 5.2) / 1.2, 0, 1);
  const top = sample(SKY_TOP, p);
  const bot = sample(SKY_BOT, p);

  // 天空（4px 一条色带，保持像素感）
  for (let y = 0; y < seaTop; y += 4) {
    const f = y / seaTop;
    px(c, 0, y, W, 4, rgb(top.map((v, k) => Math.round(v + (bot[k] - v) * f))));
  }

  // 星星
  if (night > 0) {
    for (let i = 0; i < 36; i++) {
      const tw = 0.5 + 0.5 * Math.sin(t * 2 + i * 1.7);
      c.globalAlpha = night * tw;
      px(c, (i * 53) % W, (i * 37) % (seaTop - 14), 1, 1, i % 5 ? '#ffffff' : '#ffe9b0');
    }
    c.globalAlpha = 1;
  }

  // 太阳 / 月亮
  const sunX = Math.round(W * 0.74);
  if (p < 5.9) {
    const f = clamp((p - 2) / 3.6, 0, 1);
    const sunY = Math.round(20 + f * (seaTop - 16));
    c.save();
    c.beginPath();
    c.rect(0, 0, W, seaTop);
    c.clip();
    disc(c, sunX, sunY, 8, f > 0.6 ? '#ff8a5a' : '#fff1b0');
    c.restore();
  }
  if (night > 0) {
    c.globalAlpha = night;
    disc(c, sunX, 24, 6, '#fff6d8');
    disc(c, sunX + 3, 22, 5, rgb(top));
    c.globalAlpha = 1;
  }

  // 云
  c.globalAlpha = 0.9 - night * 0.7;
  for (let i = 0; i < 4; i++) {
    const x = mod(i * 97 - camX * 0.15 - t * 2, W + 60) - 30;
    const y = 12 + ((i * 29) % 46);
    px(c, x, y + 2, 22, 4, '#ffffff');
    px(c, x + 4, y, 10, 3, '#ffffff');
    px(c, x + 12, y + 1, 7, 2, '#ffffff');
  }
  c.globalAlpha = 1;

  // 海
  const sea = sample(SEA, p);
  px(c, 0, seaTop, W, gy - 3 - seaTop, rgb(sea));
  const foam = rgb(sea.map((v) => Math.min(255, v + 45)));
  for (let row = 0; row < 4; row++) {
    const y = seaTop + 3 + row * 5;
    for (let x = -20; x < W + 20; x += 18) {
      px(c, mod(x + row * 7 - camX * 0.3 + Math.sin(t + row) * 3, W + 20) - 10, y, 7, 1, foam);
    }
  }
  // 光在水面上的倒影
  const glow = night > 0.5 ? '#fff6d8' : p > 4.2 ? '#ffb07a' : '#fff6c8';
  for (let y = seaTop + 1; y < gy - 4; y += 2) {
    const w = 3 + ((y * 7 + Math.floor(t * 3)) % 5);
    c.globalAlpha = 0.55;
    px(c, sunX - w, y, w * 2, 1, glow);
  }
  c.globalAlpha = 1;
  // 夜里对岸的灯火
  if (night > 0) {
    c.globalAlpha = night;
    px(c, 0, seaTop - 2, W, 2, '#0c0e26');
    for (let i = 0; i < 16; i++) {
      const x = mod(i * 23 - camX * 0.1, W);
      const col = i % 3 ? '#ffd27a' : '#ff9e7a';
      px(c, x, seaTop - 2, 1, 1, col);
      c.globalAlpha = night * (0.3 + 0.3 * Math.sin(t * 3 + i));
      px(c, x, seaTop, 1, 4, col);
      c.globalAlpha = night;
    }
    c.globalAlpha = 1;
  }

  // 木栈道
  const deck = sample(DECK, p);
  const deckDark = rgb(deck.map((v) => Math.round(v * 0.8)));
  px(c, 0, gy - 3, W, 16, rgb(deck));
  px(c, 0, gy - 3, W, 1, rgb(deck.map((v) => Math.min(255, v + 30))));
  px(c, 0, gy + 12, W, 2, deckDark);
  for (let x = -mod(camX, 14); x < W; x += 14) px(c, x, gy - 2, 1, 14, deckDark);

  // 沙滩与小装饰
  const sand = sample(SAND, p);
  px(c, 0, gy + 14, W, H - gy - 14, rgb(sand));
  const speck = rgb(sand.map((v) => Math.round(v * 0.86)));
  for (let i = 0; i < 40; i++) {
    const x = mod(i * 61 - camX, W + 40) - 20;
    const y = gy + 20 + ((i * 47) % Math.max(1, H - gy - 24));
    px(c, x, y, 2, 1, speck);
    if (i % 9 === 0) {            // 贝壳
      px(c, x + 6, y + 3, 4, 3, '#ffd0d8');
      px(c, x + 7, y + 2, 2, 1, '#ffd0d8');
    }
    if (i % 13 === 0) {           // 海星
      px(c, x - 8, y + 8, 5, 1, '#ff9a7a');
      px(c, x - 6, y + 6, 1, 5, '#ff9a7a');
    }
  }
}
