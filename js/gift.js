// 第二层：点三下礼物盒，越摇越厉害，然后蓝蝴蝶项链飞出来。
import { GIFT_LINES } from './config.js';
import { sfx } from './audio.js';
import { px, drawNecklace, butterflyDataUrl } from './sprites.js';
import { burstAt, vibrate, shakeScreen, flashScreen, spawnDrift } from './fx.js';

const PROMPTS = ['点一下礼物盒', '再摇一摇…', '好像有什么在发光…'];
const BLUES = Object.freeze(['#aab4ff', '#6f7de0', '#fff6e8', '#c9b6ff']);
const $ = (id) => document.getElementById(id);
const place = (img) => {
  img.style.left = `${10 + Math.random() * 75}%`;
  img.style.top = `${10 + Math.random() * 75}%`;
};

function drawBox(c, lift) {
  c.clearRect(0, 0, 64, 64);
  px(c, 14, 32, 36, 26, '#f08a7a');
  px(c, 14, 32, 36, 3, '#d9705f');
  px(c, 44, 35, 6, 23, '#e07a6a');
  px(c, 29, 32, 6, 26, '#fff1d6');
  const y = 23 - lift;
  px(c, 11, y, 42, 10, '#ff9e8a');
  px(c, 11, y + 8, 42, 2, '#e07a6a');
  px(c, 29, y, 6, 10, '#fff1d6');
  px(c, 20, y - 8, 10, 8, '#fff1d6');
  px(c, 34, y - 8, 10, 8, '#fff1d6');
  px(c, 23, y - 5, 4, 3, '#ff9e8a');
  px(c, 37, y - 5, 4, 3, '#ff9e8a');
  px(c, 29, y - 5, 6, 5, '#ffe0b0');
}

function spawnButterflies(host) {
  const url = butterflyDataUrl();
  for (let i = 0; i < 9; i++) {
    const img = document.createElement('img');
    img.className = 'bfly';
    img.src = url;
    img.alt = '';
    place(img);
    // 点到蝴蝶，它会闪一下然后飞去别的地方
    img.addEventListener('pointerdown', () => {
      burstAt(img, { count: 8, spread: 45, colors: BLUES });
      sfx.star();
      vibrate(10);
      place(img);
    });
    img.style.setProperty('--dx', `${Math.round(Math.random() * 120 - 60)}px`);
    img.style.setProperty('--dy', `${Math.round(Math.random() * 120 - 60)}px`);
    img.style.setProperty('--dur', `${(2 + Math.random() * 2).toFixed(1)}s`);
    host.appendChild(img);
  }
}

export function startGift(onDone) {
  const box = $('boxCanvas');
  const bc = box.getContext('2d');
  const necklace = $('necklaceCanvas');
  const prompt = $('giftPrompt');
  const textHost = $('giftText');
  const nextBtn = $('giftNext');
  let taps = 0;
  let busy = false;

  spawnDrift($('giftSparks'), ['✦', '·', '✧'], 18);
  drawBox(bc, 0);
  box.classList.add('idle');

  function open() {
    prompt.classList.add('hidden');
    sfx.chime();
    let lift = 0;
    const timer = setInterval(() => {
      lift += 3;
      drawBox(bc, lift);
      if (lift >= 30) {
        clearInterval(timer);
        reveal();
      }
    }, 40);
  }

  function reveal() {
    box.className = 'gone';
    flashScreen();
    shakeScreen();
    vibrate([40, 60, 120]);
    sfx.pop();
    burstAt(box, { count: 46, spread: 210 });
    $('rays').classList.add('on');
    drawNecklace(necklace.getContext('2d'));
    necklace.classList.remove('hidden');
    sfx.sparkle();
    setTimeout(() => { spawnButterflies($('butterflies')); sfx.sparkle(); }, 900);
    GIFT_LINES.forEach((line, i) => {
      setTimeout(() => {
        const p = document.createElement('p');
        p.textContent = line;
        textHost.appendChild(p);
        sfx.blip();
      }, 1800 + i * 1600);
    });
    setTimeout(() => {
      nextBtn.classList.remove('hidden');
      $('giftTip').classList.remove('hidden');
    }, 1800 + GIFT_LINES.length * 1600);
  }

  necklace.addEventListener('pointerdown', () => {
    burstAt(necklace, { count: 14, spread: 90, glyph: '✦', colors: BLUES });
    sfx.sparkle();
    vibrate(15);
    necklace.classList.remove('twinkle');
    void necklace.offsetWidth;
    necklace.classList.add('twinkle');
  });

  box.addEventListener('click', () => {
    if (busy || taps >= 3) return;
    busy = true;
    taps += 1;
    sfx.shake(taps);
    vibrate(20 * taps);
    burstAt(box, { count: 4 + taps * 4, spread: 60 + taps * 25 });
    box.className = '';
    void box.offsetWidth;
    box.className = `shake${taps}`;
    setTimeout(() => {
      busy = false;
      if (taps >= 3) { open(); return; }
      prompt.textContent = PROMPTS[taps];
      box.className = 'idle';
    }, 850);
  });

  nextBtn.addEventListener('click', () => { sfx.blip(); onDone(); }, { once: true });
}
