// 第三层：一封逐字写出来的信，然后点亮夜空的烟花和生日歌。
import { CONFIG, LETTER, LETTER_SIGN } from './config.js';
import { sfx, playBirthday } from './audio.js';
import { drawBoy, drawGirl, drawHeart } from './sprites.js';
import { heartsCollected } from './journey.js';
import { burstAt, centerOf, floatUp, vibrate, flashScreen } from './fx.js';

const STAR_COUNT = 34;
const SHOOT_EVERY_MS = 3800;
const HEART_EVERY_MS = 1300;

const COLORS = ['#ffd27a', '#ff8f70', '#f06a8a', '#aab4ff', '#6f7de0', '#fff6e8', '#9be8d8'];
const $ = (id) => document.getElementById(id);

function writeLetter(host, scroller, done) {
  const paras = [...LETTER, LETTER_SIGN];
  let pi = 0;
  let ci = 0;
  let node = null;
  let fast = false;
  scroller.addEventListener('click', () => { fast = true; });

  function tick() {
    if (pi >= paras.length) { done(); return; }
    if (!node) {
      node = document.createElement('p');
      if (pi === paras.length - 1) node.className = 'sign';
      host.appendChild(node);
    }
    const text = paras[pi];
    ci = fast ? text.length : ci + 1;
    node.textContent = text.slice(0, ci);
    scroller.scrollTop = scroller.scrollHeight;
    if (ci % 3 === 0) sfx.tick();
    if (ci >= text.length) {
      pi += 1;
      ci = 0;
      node = null;
      fast = false;
      setTimeout(tick, 550);
    } else {
      setTimeout(tick, 60);
    }
  }
  tick();
}

function createFireworks(canvas) {
  const c = canvas.getContext('2d');
  let rockets = [];
  let sparks = [];
  let auto = 0;
  let last = performance.now();

  function resize() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  }

  function launch(x, y) {
    const tx = x ?? canvas.width * (0.15 + Math.random() * 0.7);
    const ty = y ?? canvas.height * (0.12 + Math.random() * 0.35);
    rockets = [...rockets, { x: tx, y: canvas.height, ty, col: COLORS[Math.floor(Math.random() * COLORS.length)] }];
    sfx.whoosh();
  }

  function burst(r) {
    const roll = Math.random();
    const heart = roll < 0.3;
    const ring = !heart && roll < 0.5;
    const n = heart ? 44 : 60;
    const made = Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      const sp = heart || ring ? 1 : 0.4 + Math.random() * 0.6;
      const hx = 16 * Math.sin(a) ** 3;
      const hy = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a));
      return {
        x: r.x, y: r.y,
        vx: heart ? hx * 9 : Math.cos(a) * 170 * sp,
        vy: heart ? hy * 9 : Math.sin(a) * 170 * sp,
        life: 1,
        col: heart ? '#f06a8a' : (i % 4 ? r.col : '#fff6e8'),
      };
    });
    sparks = [...sparks, ...made];
    sfx.boom();
    if (ring) setTimeout(sfx.crackle, 350);
  }

  function frame(nowMs) {
    const dt = Math.min(0.05, (nowMs - last) / 1000);
    last = nowMs;
    auto -= dt;
    if (auto <= 0) { launch(); auto = 0.7 + Math.random() * 1.1; }

    c.globalCompositeOperation = 'destination-out';
    c.fillStyle = 'rgba(0,0,0,0.2)';
    c.fillRect(0, 0, canvas.width, canvas.height);
    c.globalCompositeOperation = 'source-over';

    const arrived = rockets.filter((r) => r.y - 520 * dt <= r.ty);
    arrived.forEach(burst);
    rockets = rockets.filter((r) => !arrived.includes(r)).map((r) => ({ ...r, y: r.y - 520 * dt }));
    rockets.forEach((r) => { c.fillStyle = '#fff6e8'; c.fillRect(Math.round(r.x), Math.round(r.y), 3, 9); });
    // 火箭尾巴的小火星
    sparks = [...sparks, ...rockets.map((r) => ({ x: r.x + 1, y: r.y + 10, vx: (Math.random() - 0.5) * 30, vy: 40, life: 0.45, col: '#ffd27a' }))];

    sparks = sparks
      .map((s) => ({ ...s, x: s.x + s.vx * dt, y: s.y + s.vy * dt, vx: s.vx * 0.97, vy: s.vy * 0.97 + 70 * dt, life: s.life - dt * 0.6 }))
      .filter((s) => s.life > 0);
    sparks.forEach((s) => {
      c.globalAlpha = Math.max(0, s.life);
      c.fillStyle = s.col;
      c.fillRect(Math.round(s.x / 3) * 3, Math.round(s.y / 3) * 3, 3, 3);
    });
    c.globalAlpha = 1;
    requestAnimationFrame(frame);
  }

  resize();
  window.addEventListener('resize', resize);
  canvas.addEventListener('pointerdown', (e) => {
    const rect = canvas.getBoundingClientRect();
    launch(e.clientX - rect.left, e.clientY - rect.top);
    vibrate(15);
  });
  requestAnimationFrame(frame);
}

function animateCouple(canvas) {
  const c = canvas.getContext('2d');
  let n = 0;
  setInterval(() => {
    n += 1;
    c.clearRect(0, 0, 64, 40);
    drawBoy(c, 15, 40, {});
    drawGirl(c, 33, 40, {});
    drawHeart(c, 28, 2 + (n % 2), '#f06a8a');
  }, 400);
}

function spawnStars(host) {
  for (let i = 0; i < STAR_COUNT; i++) {
    const el = document.createElement('i');
    el.style.left = `${Math.random() * 100}%`;
    el.style.top = `${Math.random() * 62}%`;
    el.style.animationDelay = `${(-Math.random() * 3).toFixed(1)}s`;
    if (i % 5 === 0) el.className = 'big';
    host.appendChild(el);
  }
  setInterval(() => {
    const el = document.createElement('b');
    el.style.left = `${20 + Math.random() * 70}%`;
    el.style.top = `${4 + Math.random() * 30}%`;
    host.appendChild(el);
    setTimeout(() => el.remove(), 1300);
  }, SHOOT_EVERY_MS);
}

function showWish(title) {
  const lines = CONFIG.wishLines.map((line, li) => {
    const row = document.createElement('div');
    [...line].forEach((ch, i) => {
      const span = document.createElement('span');
      span.textContent = ch;
      span.style.animationDelay = `${(0.3 + li * 0.5 + i * 0.14).toFixed(2)}s`;
      row.appendChild(span);
    });
    return row;
  });
  title.replaceChildren(...lines);
  $('tally').textContent = CONFIG.heartsNote.replace('{n}', heartsCollected());
}

function setupCouple(couple) {
  const hearts = () => {
    const { x, y } = centerOf(couple);
    floatUp(x - 8 + Math.random() * 16, y - 50, '♥');
  };
  setInterval(hearts, HEART_EVERY_MS);
  couple.addEventListener('pointerdown', () => {
    couple.classList.remove('hop');
    void couple.offsetWidth;
    couple.classList.add('hop');
    burstAt(couple, { count: 12, spread: 90, glyph: '♥', colors: ['#f06a8a', '#ff8fa8', '#ffd27a'] });
    sfx.hop();
    vibrate(20);
  });
}

export function startFinale() {
  const letter = $('letter');
  const lightBtn = $('lightBtn');
  const replayBtn = $('replayBtn');

  spawnStars($('stars'));
  writeLetter($('letterBody'), letter, () => lightBtn.classList.remove('hidden'));

  lightBtn.addEventListener('click', () => {
    lightBtn.classList.add('hidden');
    letter.classList.add('away');
    flashScreen();
    vibrate([30, 50, 80]);
    showWish($('wishTitle'));
    $('wish').classList.remove('hidden');
    const couple = $('coupleCanvas');
    couple.classList.remove('hidden');
    animateCouple(couple);
    setupCouple(couple);
    createFireworks($('fwCanvas'));
    playBirthday();
    setTimeout(() => replayBtn.classList.remove('hidden'), 9000);
  });

  replayBtn.addEventListener('click', () => window.location.reload());
}
