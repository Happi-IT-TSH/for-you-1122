// 入口：暗号门 → 第一层回忆 → 第二层礼物 → 第三层想说的话
import { CONFIG } from './config.js';
import { initAudio, startBgm, toggleMute, sfx } from './audio.js';
import { startJourney } from './journey.js';
import { startGift } from './gift.js';
import { startFinale } from './finale.js';
import { burstAt, vibrate, initTapSparks, spawnDrift } from './fx.js';

const LAYERS = Object.freeze([
  { id: 'journey', no: 'LAYER 1 / 3', title: '共同回忆', sub: '从一句关于猫的话开始', start: (next) => startJourney(next) },
  { id: 'gift', no: 'LAYER 2 / 3', title: '生日礼物', sub: '有个小东西，想送给你', start: (next) => startGift(next) },
  { id: 'finale', no: 'LAYER 3 / 3', title: '想对你说的话', sub: '请慢慢看', start: () => startFinale() },
]);
const INTER_MS = 2600;
const $ = (id) => document.getElementById(id);

function showScreen(id) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.toggle('active', s.id === id));
}

function markChips(index) {
  document.querySelectorAll('.chip').forEach((chip, i) => {
    chip.classList.toggle('hidden', i > index);   // 还没到的层先不露出来，留点惊喜
    chip.classList.toggle('on', i === index);
    chip.classList.toggle('done', i < index);
  });
}

function enterLayer(index) {
  const layer = LAYERS[index];
  const inter = $('interstitial');
  $('interNo').textContent = layer.no;
  $('interTitle').textContent = layer.title;
  $('interSub').textContent = layer.sub;
  inter.classList.remove('hidden');
  sfx.chime();
  setTimeout(() => burstAt(inter, { count: 18, spread: 150 }), 350);
  setTimeout(() => {
    showScreen(layer.id);
    markChips(index);
    let left = false;                       // 防止连点导致下一层被启动两次
    layer.start(() => {
      if (left) return;
      left = true;
      enterLayer(index + 1);
    });
  }, INTER_MS / 2);
  setTimeout(() => inter.classList.add('hidden'), INTER_MS);
}

function setupGate() {
  spawnDrift($('gateHearts'), ['♥', '♥', '✦']);
  const form = $('gateForm');
  const input = $('gateInput');
  const msg = $('gateMsg');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    initAudio();
    const answer = input.value.trim();
    if (answer !== CONFIG.password) {
      sfx.wrong();
      vibrate(80);
      msg.textContent = answer ? '暗号不对哦，再想想～' : '要先输入暗号哦';
      form.classList.remove('shake');
      void form.offsetWidth;
      form.classList.add('shake');
      return;
    }
    input.blur();
    vibrate([30, 40, 30]);
    burstAt(form, { count: 22, spread: 150, glyph: '♥' });
    startBgm();
    $('topbar').classList.remove('hidden');
    enterLayer(0);
  });
}

$('muteBtn').addEventListener('click', (e) => {
  e.currentTarget.classList.toggle('off', toggleMute());
});

initTapSparks();
setupGate();
