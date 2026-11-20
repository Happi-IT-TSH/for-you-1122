// 音效和背景音乐用 WebAudio 即时合成；生日歌优先播放 CONFIG.birthdaySongUrl 的录音。
import { CONFIG } from './config.js';

const N = { C3: 130.8, F3: 174.6, G3: 196, A3: 220, C4: 261.6, D4: 293.7, E4: 329.6, F4: 349.2, G4: 392, A4: 440, B4: 493.9, C5: 523.3, D5: 587.3, E5: 659.3, F5: 698.5, G5: 784 };
const BARS = [
  [N.C4, N.E4, N.G4, N.C5, N.G4, N.E4, N.G4, N.E4],
  [N.A3, N.C4, N.E4, N.A4, N.E4, N.C4, N.E4, N.C4],
  [N.F3, N.A3, N.C4, N.F4, N.C4, N.A3, N.C4, N.A3],
  [N.G3, N.B4 / 2, N.D4, N.G4, N.D4, N.B4 / 2, N.D4, N.G4],
];
const STEP = 0.34;
const BIRTHDAY = [
  [N.G4, .75], [N.G4, .25], [N.A4, 1], [N.G4, 1], [N.C5, 1], [N.B4, 2],
  [N.G4, .75], [N.G4, .25], [N.A4, 1], [N.G4, 1], [N.D5, 1], [N.C5, 2],
  [N.G4, .75], [N.G4, .25], [N.G5, 1], [N.E5, 1], [N.C5, 1], [N.B4, 1], [N.A4, 2],
  [N.F5, .75], [N.F5, .25], [N.E5, 1], [N.C5, 1], [N.D5, 1], [N.C5, 3],
];

let ctx = null;
let master = null;
let bgmGain = null;
let muted = false;
let bgmTimer = null;
let nextBarAt = 0;
let barIndex = 0;
let songEl = null;

export function initAudio() {
  if (ctx) { ctx.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0.9;
  master.connect(ctx.destination);
  bgmGain = ctx.createGain();
  bgmGain.gain.value = 1;
  bgmGain.connect(master);
}

function tone(freq, at, dur, type = 'sine', vol = 0.15, dest = master) {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(vol, at + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  osc.connect(g).connect(dest);
  osc.start(at);
  osc.stop(at + dur + 0.05);
}

function noise(dur, vol, cutoff) {
  if (!ctx) return;
  const len = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = cutoff;
  const g = ctx.createGain();
  g.gain.value = vol;
  src.connect(filter).connect(g).connect(master);
  src.start();
}

const now = () => (ctx ? ctx.currentTime : 0);
// 录音版生日歌播放时，把烟花声压低，免得盖过歌声
const SONG_DUCK = 0.25;
const duck = () => (songEl && !songEl.paused && !songEl.ended ? SONG_DUCK : 1);
const seq = (freqs, gap, dur, type, vol) => freqs.forEach((f, i) => tone(f, now() + i * gap, dur, type, vol));

export const sfx = Object.freeze({
  step: () => tone(150 + Math.random() * 40, now(), 0.05, 'triangle', 0.05),
  tick: () => tone(880, now(), 0.03, 'square', 0.015),
  blip: () => tone(660, now(), 0.08, 'square', 0.05),
  arrive: () => seq([N.E5, N.G5], 0.09, 0.25, 'sine', 0.12),
  chime: () => seq([N.C5, N.E5, N.G5, N.C5 * 2], 0.08, 0.5, 'sine', 0.13),
  wrong: () => seq([220, 180], 0.1, 0.15, 'square', 0.05),
  snip: () => { noise(0.08, 0.25, 6000); tone(1200, now() + 0.05, 0.1, 'square', 0.04); },
  laugh: () => seq([N.E5, N.G5, N.E5, N.G5, N.C5 * 2], 0.07, 0.12, 'triangle', 0.08),
  hit: () => { noise(0.05, 0.3, 3000); tone(300, now(), 0.08, 'sine', 0.1); },
  shutter: () => { noise(0.06, 0.35, 8000); setTimeout(() => noise(0.08, 0.25, 5000), 90); },
  shake: (level = 1) => { noise(0.25, 0.18, 1800); tone(180 + level * 110, now(), 0.22, 'square', 0.035); },
  boom: () => { const k = duck(); noise(0.9, 0.45 * k, 700); setTimeout(() => noise(0.5, 0.12 * k, 9000), 120); },
  crackle: () => { const k = duck(); [0, 70, 130, 210, 260].forEach((ms) => setTimeout(() => noise(0.04, 0.12 * k, 9000), ms)); },
  tap: () => tone(1320, now(), 0.05, 'sine', 0.02),
  coin: () => seq([987.8, 1318.5], 0.07, 0.2, 'square', 0.035),
  pop: () => { noise(0.14, 0.3, 4500); seq([N.C5, N.E5, N.G5, N.C5 * 2, N.E5 * 2], 0.05, 0.35, 'triangle', 0.1); },
  hop: () => seq([N.C5, N.G5], 0.07, 0.14, 'triangle', 0.08),
  star: () => seq([N.G5 * 2, N.E5 * 2, N.C5 * 2], 0.05, 0.3, 'sine', 0.04),
  whoosh: () => { if (!ctx) return; const t = now(); tone(300, t, 0.4, 'sine', 0.04); tone(600, t + 0.15, 0.3, 'sine', 0.03); },
  sparkle: () => seq([N.G5, N.C5 * 2, N.E5 * 2, N.G5 * 2], 0.06, 0.4, 'sine', 0.08),
});

function scheduleBgm() {
  if (!ctx) return;
  while (nextBarAt < ctx.currentTime + 0.6) {
    const bar = BARS[barIndex % BARS.length];
    bar.forEach((f, i) => tone(f * 2, nextBarAt + i * STEP, 0.9, 'sine', 0.05, bgmGain));
    tone(bar[0] / 2, nextBarAt, STEP * 8, 'triangle', 0.035, bgmGain);
    nextBarAt += STEP * 8;
    barIndex += 1;
  }
}

export function startBgm() {
  if (!ctx || bgmTimer) return;
  nextBarAt = ctx.currentTime + 0.1;
  bgmTimer = setInterval(scheduleBgm, 150);
}

function fadeBgm(to, secs) {
  if (!ctx) return;
  bgmGain.gain.cancelScheduledValues(ctx.currentTime);
  bgmGain.gain.linearRampToValueAtTime(to, ctx.currentTime + secs);
}

/** 播放生日歌（有录音就放录音，没有就用八音盒版）。返回时长（秒）。 */
export function playBirthday() {
  fadeBgm(0.0001, 1);
  if (CONFIG.birthdaySongUrl) {
    songEl = new Audio(CONFIG.birthdaySongUrl);
    songEl.muted = muted;
    songEl.addEventListener('ended', () => fadeBgm(1, 2));
    songEl.addEventListener('error', () => { console.error('生日歌文件加载失败:', CONFIG.birthdaySongUrl); playSynthBirthday(); });
    songEl.play().catch((err) => { console.error('生日歌播放失败:', err); playSynthBirthday(); });
    return 0;
  }
  return playSynthBirthday();
}

function playSynthBirthday() {
  if (!ctx) return 0;
  const beat = 0.5;
  let at = ctx.currentTime + 1;
  BIRTHDAY.forEach(([f, beats]) => {
    tone(f, at, beats * beat + 0.5, 'sine', 0.16);
    tone(f * 2, at, beats * beat * 0.6, 'triangle', 0.04);
    at += beats * beat;
  });
  const total = at - ctx.currentTime;
  setTimeout(() => fadeBgm(1, 2), total * 1000);
  return total;
}

export function toggleMute() {
  muted = !muted;
  if (master) master.gain.value = muted ? 0 : 0.9;
  if (songEl) songEl.muted = muted;
  return muted;
}
