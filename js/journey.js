// 第一层：按住屏幕，像素小人沿着海边栈道走过每一段回忆。
import { STOPS } from './config.js';
import { sfx } from './audio.js';
import { drawBoy, drawGirl, drawHeart, px } from './sprites.js';
import { burst, floatUp, vibrate, shakeScreen } from './fx.js';
import { drawBackdrop } from './backdrop.js';
import { drawSceneBack, drawSceneFront } from './scenes.js';

const SPEED = 46;
const GAP = 210;
const stopX = (i) => 120 + i * GAP;
const LAST = STOPS.length - 1;
const $ = (id) => document.getElementById(id);
// 路上可以捡的小爱心：出发后一颗，之后每两站之间两颗
const HEART_XS = Object.freeze([80, ...STOPS.slice(0, -1).flatMap((_, i) => [stopX(i) + 70, stopX(i) + 140])]);
const HEART_RISE = 34;
const LOVE_EVERY = 0.9;

let collected = 0;
export const HEART_TOTAL = HEART_XS.length;
export const heartsCollected = () => collected;

export function startJourney(onDone) {
  const root = $('journey');
  const canvas = $('world');
  const c = canvas.getContext('2d');
  const el = {
    hint: $('walkHint'), card: $('card'), date: $('cardDate'), title: $('cardTitle'), text: $('cardText'),
    act: $('actBtn'), next: $('nextBtn'), polaroid: $('polaroid'), flash: $('flash'), floaters: $('floaters'),
    hearts: $('heartCount'), dots: $('hudDots'),
  };
  el.dots.replaceChildren(...STOPS.map(() => document.createElement('i')));

  let st = { x: 40, reached: -1, mode: 'walk', hold: false, flags: {}, time: 0, got: [] };
  let dims = { W: 130, H: 280, gy: 150, scale: 3 };
  let bits = [];            // 画布里的小粒子：脚下的尘土、两人之间冒出的小心心
  let loveClock = 0;
  let typer = null;
  let stepClock = 0;
  let last = performance.now();
  let running = true;

  const set = (patch) => { st = { ...st, ...patch }; };

  function resize() {
    const cw = root.clientWidth;
    const ch = root.clientHeight;
    const scale = Math.max(2, Math.round(cw / 130));
    const W = Math.ceil(cw / scale);
    const H = Math.ceil(ch / scale);
    canvas.width = W;
    canvas.height = H;
    canvas.style.width = `${W * scale}px`;
    canvas.style.height = `${H * scale}px`;
    dims = { W, H, gy: Math.round(H * 0.5), scale };
  }

  const camOf = (x) => Math.round(x - dims.W * 0.3);
  const toScreen = (wx, wy) => ({ x: (wx - camOf(st.x)) * dims.scale, y: wy * dims.scale });

  function collectHearts(x) {
    const fresh = HEART_XS.map((hx, i) => i).filter((i) => HEART_XS[i] <= x && !st.got.includes(i));
    if (!fresh.length) return;
    set({ got: [...st.got, ...fresh] });
    collected = st.got.length;
    el.hearts.textContent = `♥ ${collected}`;
    el.hearts.classList.remove('bump');
    void el.hearts.offsetWidth;
    el.hearts.classList.add('bump');
    fresh.forEach((i) => {
      const pos = toScreen(HEART_XS[i], dims.gy - HEART_RISE);
      burst(pos.x, pos.y, { count: 7, spread: 40, colors: ['#f06a8a', '#ffd27a', '#fff6e8'] });
      floatUp(pos.x, pos.y - 10, '+1');
    });
    sfx.coin();
    vibrate(12);
  }

  function stepBits(dt, walking) {
    bits = bits
      .map((b) => ({ ...b, x: b.x + b.vx * dt, y: b.y + b.vy * dt, life: b.life - dt * b.fade }))
      .filter((b) => b.life > 0);
    if (!walking || st.reached < 2 || st.reached >= LAST) return;
    loveClock += dt;
    if (loveClock < LOVE_EVERY) return;
    loveClock = 0;
    bits = [...bits, { kind: 'heart', x: st.x + 6, y: dims.gy - 30, vx: 0, vy: -9, life: 1, fade: 0.7 }];
  }

  const addDust = () => {
    bits = [...bits, { kind: 'dust', x: st.x - 3, y: dims.gy - 1, vx: -7, vy: -5, life: 1, fade: 2.6 }];
  };

  function typeText(text, done) {
    clearInterval(typer);
    let n = 0;
    el.text.textContent = '';
    typer = setInterval(() => {
      n += 1;
      el.text.textContent = text.slice(0, n);
      if (n % 3 === 0) sfx.tick();
      if (n >= text.length) { clearInterval(typer); typer = null; done(); }
    }, 38);
    el.text.onclick = () => {
      if (!typer) return;
      clearInterval(typer);
      typer = null;
      el.text.textContent = text;
      done();
    };
  }

  function showCard(i) {
    const stop = STOPS[i];
    el.date.textContent = stop.date;
    el.title.textContent = stop.title;
    el.act.classList.add('hidden');
    el.next.classList.add('hidden');
    el.polaroid.classList.add('hidden');
    el.hint.classList.add('hidden');
    el.card.classList.remove('hidden');
    el.next.textContent = i === LAST ? '打开下一层 ▶' : '继续往前走 ▶';
    typeText(stop.text, () => {
      if (stop.action) {
        el.act.textContent = stop.action.label;
        el.act.classList.remove('hidden');
      } else {
        el.next.classList.remove('hidden');
      }
    });
  }

  function floatText(text) {
    const span = document.createElement('span');
    span.className = 'floater';
    span.textContent = text;
    span.style.left = `${20 + Math.random() * 45}%`;
    span.style.top = `${28 + Math.random() * 10}%`;
    el.floaters.appendChild(span);
    setTimeout(() => span.remove(), 1700);
  }

  function runAction() {
    const action = STOPS[st.reached]?.action;
    if (!action || st.flags[action.id] != null) return;
    el.act.classList.add('hidden');
    set({ flags: { ...st.flags, [action.id]: st.time } });
    if (action.id === 'tag') {
      sfx.snip();
      shakeScreen();
      vibrate([20, 30, 20]);
      [300, 600, 900, 1200].forEach((ms) => setTimeout(() => { floatText('哈哈哈'); sfx.laugh(); }, ms));
    }
    if (action.id === 'pot') {
      sfx.hit();
      setTimeout(sfx.hit, 450);
      vibrate(25);
      setTimeout(() => { sfx.chime(); floatText('进了！'); }, 1000);
    }
    if (action.id === 'photo') {
      sfx.shutter();
      vibrate(40);
      el.polaroid.src = canvas.toDataURL();
      el.polaroid.classList.remove('hidden');
      el.flash.classList.remove('go');
      void el.flash.offsetWidth;
      el.flash.classList.add('go');
    }
    typeText(action.after, () => el.next.classList.remove('hidden'));
  }

  function next() {
    if (!running || st.mode !== 'card') return;
    sfx.blip();
    el.card.classList.add('hidden');
    if (st.reached === LAST) {
      running = false;
      onDone();
      return;
    }
    set({ mode: 'walk', hold: false });
    el.hint.textContent = '按住屏幕 ▶ 继续走';
    el.hint.classList.remove('hidden');
  }

  function update(dt) {
    set({ time: st.time + dt });
    const walking = st.mode === 'walk' && st.hold;
    stepBits(dt, walking);
    if (!walking) return;
    const target = stopX(st.reached + 1);
    const x = Math.min(target, st.x + SPEED * dt);
    stepClock += dt;
    if (stepClock > 0.26) { stepClock = 0; sfx.step(); addDust(); }
    collectHearts(x);
    if (x >= target) {
      set({ x, reached: st.reached + 1, mode: 'card', hold: false });
      sfx.arrive();
      vibrate(20);
      [...el.dots.children].forEach((dot, i) => dot.classList.toggle('on', i <= st.reached));
      const pos = toScreen(st.x, dims.gy - 26);
      burst(pos.x, pos.y, { count: 10, spread: 55, colors: ['#ffd27a', '#fff6e8'] });
      showCard(st.reached);
    } else {
      set({ x });
    }
  }

  function draw() {
    const { W, H, gy } = dims;
    const camX = camOf(st.x);
    const p = (st.x - stopX(0)) / GAP;
    const t = st.time;
    drawBackdrop(c, W, H, gy, p, camX, t);

    const visible = STOPS.map((_, i) => ({ i, sx: stopX(i) - camX })).filter(({ sx }) => sx > -150 && sx < W + 60);
    visible.forEach(({ i, sx }) => drawSceneBack(c, i, sx, gy, t, st));

    HEART_XS.forEach((hx, i) => {
      const sx = hx - camX;
      if (st.got.includes(i) || sx < -10 || sx > W + 10) return;
      const y = gy - HEART_RISE - 3 + Math.round(Math.sin(t * 3 + i) * 2);
      drawHeart(c, sx - 3, y, '#f06a8a');
      px(c, sx - 2, y + 1, 1, 1, '#ffd6e0');
    });

    const walking = st.mode === 'walk' && st.hold;
    const frame = walking ? 1 + (Math.floor(t * 8) % 2) : 0;
    const inCar = st.reached >= LAST;
    const bx = Math.round(st.x - camX);
    if (!inCar) {
      drawBoy(c, bx, gy, { frame, tag: st.flags.tag == null, flowers: st.reached < 3 });
      if (st.reached >= 2) {
        const atSea = st.reached === 6 && st.mode === 'card';
        drawGirl(c, bx + 18, gy, {
          frame,
          flowers: st.reached === 3,
          pose: atSea ? 'photo' : null,
        });
      }
    }
    bits.forEach((b) => {
      c.globalAlpha = Math.max(0, Math.min(1, b.life));
      const sx = Math.round(b.x - camX);
      if (b.kind === 'heart') drawHeart(c, sx, Math.round(b.y), '#ff8fa8');
      else px(c, sx, Math.round(b.y), 2, 1, '#fff6e8');
    });
    c.globalAlpha = 1;
    visible.forEach(({ i, sx }) => drawSceneFront(c, i, sx, gy, t, st));
  }

  function loop(nowMs) {
    if (!running) return;
    const dt = Math.min(0.05, (nowMs - last) / 1000);
    last = nowMs;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  const press = (e) => {
    if (e.target.closest('.card')) return;
    if (st.mode === 'walk') { set({ hold: true }); el.hint.classList.add('hidden'); }
  };
  const release = () => set({ hold: false });
  root.addEventListener('pointerdown', press);
  window.addEventListener('pointerup', release);
  window.addEventListener('pointercancel', release);
  window.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight' && st.mode === 'walk') set({ hold: true }); });
  window.addEventListener('keyup', (e) => { if (e.key === 'ArrowRight') release(); });
  root.addEventListener('contextmenu', (e) => e.preventDefault());
  window.addEventListener('resize', resize);
  el.act.addEventListener('click', runAction);
  el.next.addEventListener('click', next);

  resize();
  requestAnimationFrame(loop);
}
