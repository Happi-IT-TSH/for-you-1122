// 九个回忆站点的像素场景。sx = 该站在屏幕上的 x，gy = 地面 y，st = 只读的旅程状态。
import { px, drawDigits, drawHeart, drawCar, drawGirl } from './sprites.js';

const since = (st, key) => (st.flags[key] == null ? -1 : st.time - st.flags[key]);

function phone(c, sx, gy, t) {
  const x = sx + 44;
  const y = gy - 66 + Math.round(Math.sin(t * 2) * 2);
  px(c, x, y, 24, 40, '#2b2b3a');
  px(c, x + 2, y + 3, 20, 32, '#fff5f8');
  px(c, x + 10, y + 37, 4, 1, '#77778a');
  const n = Math.floor(t * 1.5) % 5;
  [[3, 6, '#ffc2d4'], [9, 12, '#bfe0ff'], [3, 18, '#ffc2d4'], [9, 24, '#bfe0ff']].forEach(([bx, by, col], i) => {
    if (i <= n) px(c, x + bx, y + by, 12, 4, col);
  });
  drawHeart(c, x + 8, y - 10 - (Math.floor(t * 6) % 6), '#ff6a8a');
}

function calendar(c, sx, gy) {
  const x = sx + 42;
  px(c, x + 6, gy - 12, 2, 9, '#8a6a4a');
  px(c, x + 26, gy - 12, 2, 9, '#8a6a4a');
  px(c, x, gy - 50, 34, 40, '#2a2140');
  px(c, x + 1, gy - 49, 32, 38, '#ffffff');
  px(c, x + 1, gy - 49, 32, 9, '#f0506a');
  drawDigits(c, '11', x + 13, gy - 47, '#ffffff');
  drawDigits(c, '14', x + 6, gy - 36, '#2a2140', 3);
  drawHeart(c, x + 24, gy - 19, '#f0506a');
  px(c, x + 7, gy - 52, 2, 5, '#9a9cb0');
  px(c, x + 25, gy - 52, 2, 5, '#9a9cb0');
}

function japanese(c, sx, gy) {
  const bx = sx - 30;
  px(c, bx, gy - 60, 112, 57, '#6a4632');
  px(c, bx - 3, gy - 65, 118, 6, '#2e2a35');
  px(c, bx - 1, gy - 59, 114, 2, '#3e3944');
  px(c, bx + 8, gy - 54, 44, 18, '#ffd98a');
  [0, 11, 22, 33, 43].forEach((k) => px(c, bx + 8 + k, gy - 54, 1, 18, '#6a4632'));
  px(c, bx + 8, gy - 46, 44, 1, '#6a4632');
  px(c, bx + 74, gy - 44, 28, 41, '#2a1b14');
  px(c, bx + 74, gy - 44, 28, 12, '#2c3e7a');
  [7, 14, 21].forEach((k) => px(c, bx + 74 + k, gy - 38, 1, 6, '#2a1b14'));
  px(c, bx + 86, gy - 42, 4, 4, '#ffffff');
  px(c, bx + 61, gy - 50, 9, 13, '#e0483e');
  px(c, bx + 61, gy - 50, 9, 2, '#2a1b14');
  px(c, bx + 61, gy - 39, 9, 2, '#2a1b14');
  px(c, bx + 64, gy - 46, 3, 5, '#ffd98a');
}

function jubensha(c, sx, gy, t) {
  const bx = sx - 30;
  px(c, bx, gy - 62, 112, 59, '#efe6d6');
  px(c, bx - 2, gy - 65, 116, 4, '#5a4a66');
  px(c, bx + 5, gy - 57, 60, 27, '#6a4a3a');
  px(c, bx + 7, gy - 55, 56, 23, '#fff8ec');
  px(c, bx + 10, gy - 54, 10, 16, '#ffffff');       // 墙上的字画
  px(c, bx + 10, gy - 54, 10, 1, '#b08a4a');
  px(c, bx + 13, gy - 51, 4, 1, '#222222');
  px(c, bx + 14, gy - 50, 1, 8, '#222222');
  px(c, bx + 12, gy - 46, 6, 1, '#222222');
  px(c, bx + 22, gy - 37, 38, 3, '#d8d0c0');        // 桌子
  [[26, '#e8b84a'], [42, '#f2c8c8']].forEach(([k, fig]) => {   // 两本剧本
    px(c, bx + k, gy - 51, 11, 14, '#7a1f2a');
    px(c, bx + k + 1, gy - 50, 9, 2, '#c94a4a');
    px(c, bx + k + 3, gy - 46, 5, 8, fig);
    px(c, bx + k + 4, gy - 47, 3, 2, '#ffd9b8');
    if (k === 42) px(c, bx + k + 3, gy - 44, 5, 2, '#d03a3a');
  });
  px(c, bx + 78, gy - 36, 20, 33, '#8a5a3c');
  px(c, bx + 94, gy - 20, 2, 2, '#ffd24a');
  for (let i = 0; i < 22; i++) {                    // 雪乡的雪
    const y = gy - 62 + ((t * 14 + i * 23) % 58);
    px(c, bx + ((i * 31 + Math.floor(y / 6)) % 112), y, 1, 1, '#ffffff');
  }
}

function pool(c, sx, gy, st) {
  const bx = sx - 30;
  px(c, bx, gy - 62, 112, 59, '#2b2d3a');
  [6, 44, 82].forEach((k) => {
    px(c, bx + k, gy - 58, 24, 3, '#f4f6ff');
    c.globalAlpha = 0.08;
    px(c, bx + k - 3, gy - 55, 30, 30, '#f4f6ff');
    c.globalAlpha = 1;
  });
  px(c, bx + 4, gy - 48, 30, 14, '#1a1c28');
  [8, 14, 20, 26].forEach((k) => px(c, bx + k, gy - 44, 2, 2, '#ffb060'));
  const tx = sx + 38;
  px(c, tx, gy - 26, 48, 16, '#c7cad6');
  px(c, tx + 2, gy - 24, 44, 12, '#2f8fe0');
  px(c, tx + 2, gy - 10, 44, 5, '#1e1e28');
  px(c, tx + 4, gy - 5, 3, 3, '#1e1e28');
  px(c, tx + 41, gy - 5, 3, 3, '#1e1e28');
  [[2, -24], [44, -24], [2, -14], [44, -14]].forEach(([a, b]) => px(c, tx + a, gy + b, 2, 2, '#10101a'));
  [[10, -22, '#ffd24a'], [16, -15, '#4ac96a'], [26, -22, '#b05ad0'], [22, -17, '#222222']].forEach(([a, b, col]) => px(c, tx + a, gy + b, 2, 2, col));
  const k = since(st, 'pot');
  const f = k < 0 ? 0 : Math.min(1, k / 1.1);
  const cue = 5 + Math.min(1, f / 0.4) * 25;
  const red = 32 + Math.max(0, (f - 0.4) / 0.5) * 12;
  px(c, tx + cue, gy - 19, 2, 2, '#ffffff');
  if (red < 44) px(c, tx + red, gy - 19, 2, 2, '#e0483e');
  else if (k < 2.2) drawHeart(c, tx + 38, gy - 34 - k * 6, '#ffd24a');
}

function knot(c, sx, gy) {
  const bx = sx - 30;
  px(c, bx, gy - 58, 60, 55, '#2a2438');
  px(c, bx - 2, gy - 61, 64, 4, '#16121f');
  px(c, bx + 8, gy - 54, 44, 9, '#463a5a');
  px(c, bx + 26, gy - 52, 8, 5, '#f2cf7a');
  px(c, bx + 28, gy - 51, 4, 3, '#463a5a');
  px(c, bx + 6, gy - 40, 26, 16, '#14121f');
  px(c, bx + 38, gy - 40, 16, 37, '#14121f');
  px(c, bx + 39, gy - 30, 14, 7, '#f4f0e0');
  px(c, bx + 41, gy - 27, 10, 1, '#d03a3a');
  for (let x = bx + 62; x < bx + 116; x += 10) px(c, x, gy - 12, 2, 9, '#8a8ca8');
  px(c, bx + 62, gy - 12, 54, 2, '#a8aac4');
}

function zhuchao(c, sx, gy, t) {
  const bx = sx - 30;
  px(c, bx + 2, gy - 50, 2, 47, '#8a8f9c');
  px(c, bx + 108, gy - 50, 2, 47, '#8a8f9c');
  for (let k = 0; k < 14; k++) {
    px(c, bx + k * 8, gy - 58, 8, 8, k % 2 ? '#e8483e' : '#ffd24a');
    px(c, bx + k * 8 + 2, gy - 50, 4, 2, k % 2 ? '#e8483e' : '#ffd24a');
  }
  for (let k = 0; k < 13; k++) {
    const on = (Math.floor(t * 2) + k) % 3;
    px(c, bx + 6 + k * 8, gy - 45 + (k % 2), 2, 2, on ? '#ffe9a0' : '#ff9e7a');
  }
  px(c, bx + 4, gy - 17, 22, 14, '#8a8f9c');
  px(c, bx + 4, gy - 17, 22, 2, '#b4b8c4');
  px(c, bx + 8, gy - 21, 14, 3, '#222222');
  const fl = Math.floor(t * 10) % 3;
  px(c, bx + 11, gy - 25 - fl, 3, 4 + fl, '#ff9a3a');
  px(c, bx + 16, gy - 24 - ((fl + 1) % 3), 3, 3, '#ffd24a');
  px(c, bx + 76, gy - 14, 28, 3, '#d44a4a');
  px(c, bx + 89, gy - 11, 2, 8, '#8a3030');
  px(c, bx + 72, gy - 8, 5, 5, '#e85a5a');
  px(c, bx + 104, gy - 8, 5, 5, '#e85a5a');
  [[79, 5, '#6bbf6b'], [87, 7, '#e8a04a'], [96, 5, '#f0e0c0']].forEach(([k, w, food]) => {
    px(c, bx + k, gy - 16, w, 2, '#ffffff');
    px(c, bx + k + 1, gy - 18, w - 2, 2, food);
  });
  c.globalAlpha = 0.5;
  for (let i = 0; i < 6; i++) {
    const r = (t * 9 + i * 7) % 16;
    px(c, bx + (i % 2 ? 90 : 14) + Math.sin(t * 2 + i) * 2, gy - (i % 2 ? 20 : 28) - r, 2, 2, '#ffffff');
  }
  c.globalAlpha = 1;
}

function lamp(c, x, gy) {
  px(c, x, gy - 48, 2, 45, '#55586a');
  px(c, x - 3, gy - 50, 8, 3, '#55586a');
  px(c, x - 2, gy - 47, 6, 2, '#ffe9a0');
  c.globalAlpha = 0.1;
  px(c, x - 10, gy - 45, 22, 42, '#ffe9a0');
  c.globalAlpha = 1;
}

/** 画在小人后面的布景 */
export function drawSceneBack(c, i, sx, gy, t, st) {
  if (i === 0) phone(c, sx, gy, t);
  if (i === 1) calendar(c, sx, gy);
  if (i === 2) {
    drawCar(c, sx + 40, gy, false, false);
    if (st.reached < 2 || (st.reached === 2 && st.mode === 'card')) return;
  }
  if (i === 3) japanese(c, sx, gy);
  if (i === 4) jubensha(c, sx, gy, t);
  if (i === 5) pool(c, sx, gy, st);
  if (i === 6) knot(c, sx, gy);
  if (i === 7) zhuchao(c, sx, gy, t);
  if (i === 8) {
    lamp(c, sx - 16, gy);
    drawCar(c, sx + 30, gy, true, st.reached >= 8);
  }
}

/** 画在小人前面的效果 */
export function drawSceneFront(c, i, sx, gy, t, st) {
  if (i === 2 && st.reached < 2) drawGirl(c, sx + 18, gy, {});   // 还没接到她时，她在这里等
  if (i === 3) {
    const k = since(st, 'tag');
    if (k >= 0 && k < 1.2) {                                      // 飞走的挂牌
      px(c, sx - 4 - k * 26, gy - 8 - k * 40 + k * k * 30, 3, 4, '#ffd24a');
    }
  }
  if (i === 8 && st.reached >= 8) {
    for (let n = 0; n < 4; n++) {
      const r = (t * 10 + n * 11) % 44;
      c.globalAlpha = 1 - r / 44;
      if (n % 2) drawHeart(c, sx + 42 + n * 6, gy - 26 - r, '#ff6a8a');
      else {
        px(c, sx + 38 + n * 8, gy - 28 - r, 9, 5, '#ffffff');
        [1, 4, 7].forEach((d) => px(c, sx + 38 + n * 8 + d, gy - 26 - r, 1, 1, '#8a8ca8'));
      }
    }
    c.globalAlpha = 1;
  }
}
