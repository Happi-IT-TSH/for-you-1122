// 像素小人与小道具。所有坐标：x 为左边缘，y 为脚底。

export const px = (c, x, y, w, h, col) => {
  c.fillStyle = col;
  c.fillRect(Math.round(x), Math.round(y), w, h);
};

const SKIN = '#ffd9b8';
const HAIR = '#22202c';
const GOLD = '#f2cf7a';
const CREAM = '#f6efd8';
const JEAN = '#5a7fb5';
const TEE = '#f8f6ef';
const JACKET = '#2a2a34';
const PANTS = '#4f74bd';
const PANTS_DARK = '#3f5f9f';
// [左腿x偏移, 右腿x偏移, 左腿抬起, 右腿抬起]
const LEGS = [[0, 0, 0, 0], [-1, 1, 0, 1], [1, -1, 1, 0]];

const DIGITS = {
  0: '111101101101111', 1: '010110010010111', 2: '111001111100111', 3: '111001111001111',
  4: '101101111001001', 5: '111100111001111', 6: '111100111101111', 7: '111001001001001',
  8: '111101111101111', 9: '111101111001111', '/': '001001010100100',
};

export function drawDigits(c, str, x, y, col, s = 1) {
  [...str].forEach((ch, i) => {
    const map = DIGITS[ch];
    if (!map) return;
    for (let k = 0; k < 15; k++) {
      if (map[k] === '1') px(c, x + i * 4 * s + (k % 3) * s, y + Math.floor(k / 3) * s, s, s, col);
    }
  });
}

const HEART = [' ## ## ', '#######', '#######', ' ##### ', '  ###  ', '   #   '];
export function drawHeart(c, x, y, col) {
  HEART.forEach((row, j) => [...row].forEach((ch, i) => { if (ch === '#') px(c, x + i, y + j, 1, 1, col); }));
}

export function drawBouquet(c, x, y) {
  px(c, x, y - 4, 4, 5, '#f6e7c8');
  px(c, x + 1, y, 2, 2, '#e3cfa2');
  px(c, x, y - 5, 1, 1, '#6bbf6b');
  px(c, x + 3, y - 5, 1, 1, '#6bbf6b');
  px(c, x - 1, y - 7, 2, 2, '#ff7a9a');
  px(c, x + 3, y - 7, 2, 2, '#ff9ab0');
  px(c, x + 1, y - 8, 2, 2, '#ffffff');
  px(c, x + 1, y - 6, 2, 2, '#ffd24a');
}

export function drawBoy(c, x, y, o = {}) {
  const f = o.frame || 0;
  const [la, ra, ll, rl] = LEGS[f];
  const Y = y + (f === 1 ? -1 : 0);
  // 腿与鞋
  px(c, x + 5 + la, y - 4 - ll, 2, 3, PANTS);
  px(c, x + 5 + la, y - 1 - ll, 2, 1, '#ffffff');
  px(c, x + 9 + ra, y - 4 - rl, 2, 3, PANTS);
  px(c, x + 9 + ra, y - 1 - rl, 2, 1, '#ffffff');
  // 蓝色长裤
  px(c, x + 4, Y - 8, 8, 4, PANTS);
  px(c, x + 7, Y - 6, 2, 2, PANTS_DARK);
  // 白色上衣 + 敞开的黑色短袖外套
  px(c, x + 4, Y - 15, 8, 7, TEE);
  px(c, x + 4, Y - 15, 2, 7, JACKET);
  px(c, x + 10, Y - 15, 2, 7, JACKET);
  px(c, x + 6, Y - 15, 1, 2, JACKET);
  px(c, x + 9, Y - 15, 1, 2, JACKET);
  px(c, x + 3, Y - 15, 1, 3, JACKET);
  px(c, x + 3, Y - 12, 1, 3, SKIN);
  px(c, x + 12, Y - 15, 1, 3, JACKET);
  px(c, x + 12, Y - 12, 1, 3, SKIN);
  // 头、蓬蓬头发
  px(c, x + 4, Y - 23, 8, 8, SKIN);
  px(c, x + 3, Y - 28, 10, 2, HAIR);
  px(c, x + 2, Y - 26, 12, 4, HAIR);
  px(c, x + 5, Y - 29, 2, 1, HAIR);
  px(c, x + 9, Y - 29, 3, 1, HAIR);
  px(c, x + 2, Y - 22, 1, 2, HAIR);
  px(c, x + 13, Y - 22, 1, 2, HAIR);
  px(c, x + 4, Y - 22, 8, 1, HAIR);
  // 眼镜、眼睛、嘴
  const G = '#b08a4a';
  [5, 9].forEach((k) => {
    px(c, x + k, Y - 21, 2, 1, G);
    px(c, x + k, Y - 19, 2, 1, G);
  });
  px(c, x + 4, Y - 20, 1, 1, G);
  px(c, x + 7, Y - 20, 2, 1, G);
  px(c, x + 11, Y - 20, 1, 1, G);
  px(c, x + 5, Y - 20, 1, 1, '#f2f8ff');
  px(c, x + 10, Y - 20, 1, 1, '#f2f8ff');
  px(c, x + 6, Y - 20, 1, 1, '#222222');
  px(c, x + 9, Y - 20, 1, 1, '#222222');
  px(c, x + 7, Y - 17, 2, 1, '#c9736b');
  // 没拆的挂牌
  if (o.tag) {
    px(c, x + 3, Y - 7, 1, 1, '#ffffff');
    px(c, x + 1, Y - 6, 3, 4, '#ffd24a');
    px(c, x + 2, Y - 5, 1, 1, '#c44444');
  }
  if (o.flowers) drawBouquet(c, x + 12, Y - 10);
}

export function drawGirl(c, x, y, o = {}) {
  const f = o.frame || 0;
  const [la, ra, ll, rl] = LEGS[f];
  const Y = y + (f === 2 ? -1 : 0);
  // 披在背后的长发
  px(c, x + 2, Y - 22, 12, 11, HAIR);
  px(c, x + 2, Y - 11, 2, 2, HAIR);
  // 阔腿牛仔裤与鞋
  px(c, x + 4 + la, y - 6 - ll, 3, 5, JEAN);
  px(c, x + 4 + la, y - 1 - ll, 3, 1, '#ffffff');
  px(c, x + 9 + ra, y - 6 - rl, 3, 5, JEAN);
  px(c, x + 9 + ra, y - 1 - rl, 3, 1, '#ffffff');
  px(c, x + 4, Y - 8, 8, 2, JEAN);
  // 奶油色针织上衣
  px(c, x + 4, Y - 15, 8, 7, CREAM);
  [5, 7, 9, 11].forEach((k) => px(c, x + k, Y - 14, 1, 6, '#e3d8b6'));
  px(c, x + 3, Y - 15, 1, 6, CREAM);
  px(c, x + 3, Y - 9, 1, 1, SKIN);
  if (o.pose === 'photo') {
    px(c, x + 12, Y - 18, 1, 4, CREAM);
    px(c, x + 13, Y - 19, 1, 1, SKIN);
    px(c, x + 13, Y - 23, 3, 4, '#222222');
    px(c, x + 14, Y - 22, 1, 2, '#ffb0dc');
  } else {
    px(c, x + 12, Y - 15, 1, 6, CREAM);
    px(c, x + 12, Y - 9, 1, 1, SKIN);
  }
  // 头
  px(c, x + 4, Y - 23, 8, 8, SKIN);
  px(c, x + 3, Y - 26, 10, 3, HAIR);
  px(c, x + 3, Y - 23, 1, 6, HAIR);
  px(c, x + 12, Y - 23, 1, 6, HAIR);
  px(c, x + 4, Y - 23, 8, 1, HAIR);
  px(c, x + 4, Y - 22, 2, 1, HAIR);
  px(c, x + 10, Y - 22, 2, 1, HAIR);
  px(c, x + 6, Y - 20, 1, 2, '#2a2030');
  px(c, x + 9, Y - 20, 1, 2, '#2a2030');
  px(c, x + 5, Y - 18, 1, 1, '#ff9a9a');
  px(c, x + 10, Y - 18, 1, 1, '#ff9a9a');
  px(c, x + 7, Y - 17, 2, 1, '#d9606a');
  // 金色蝴蝶结发夹
  px(c, x + 1, Y - 26, 2, 3, GOLD);
  px(c, x + 4, Y - 26, 2, 3, GOLD);
  px(c, x + 3, Y - 25, 1, 1, '#fff6d0');
  if (o.flowers) drawBouquet(c, x + 12, Y - 10);
}

/** 小汽车，车头朝右。heads=true 时车窗里有两个人。 */
export function drawCar(c, x, gy, night, heads) {
  const body = night ? '#c9cbe0' : '#f6f6fa';
  const win = night ? '#ffe2a0' : '#bfe6f5';
  px(c, x + 9, gy - 20, 27, 9, body);
  px(c, x, gy - 12, 46, 8, body);
  px(c, x, gy - 6, 46, 2, '#9a9cb0');
  px(c, x + 11, gy - 18, 11, 6, win);
  px(c, x + 24, gy - 18, 10, 6, win);
  if (heads) {
    px(c, x + 13, gy - 17, 6, 5, HAIR);
    px(c, x + 15, gy - 16, 4, 4, SKIN);
    px(c, x + 12, gy - 17, 2, 2, GOLD);
    px(c, x + 26, gy - 18, 6, 2, HAIR);
    px(c, x + 26, gy - 16, 5, 4, SKIN);
    px(c, x + 26, gy - 15, 5, 1, '#b08a4a');
  }
  px(c, x + 44, gy - 11, 2, 2, night ? '#fff3b0' : '#ffe9a0');
  px(c, x, gy - 11, 1, 2, '#e55555');
  [6, 33].forEach((wx) => {
    px(c, x + wx, gy - 7, 7, 7, '#2a2a33');
    px(c, x + wx + 2, gy - 5, 3, 3, '#9a9cb0');
  });
  if (night) {
    c.globalAlpha = 0.18;
    px(c, x + 46, gy - 12, 14, 9, '#fff3b0');
    c.globalAlpha = 1;
  }
}

/** 画一颗带高光的椭圆宝石，(dx,dy) 为长轴方向。 */
function gem(c, cx, cy, rx, ry, dx, dy) {
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  for (let y = Math.floor(cy - rx); y <= cy + rx; y++) {
    for (let x = Math.floor(cx - rx); x <= cx + rx; x++) {
      const u = ((x - cx) * ux + (y - cy) * uy) / rx;
      const v = (-(x - cx) * uy + (y - cy) * ux) / ry;
      const d = Math.abs(v) + u * u;          // 马眼形（两头尖的橄榄形）
      if (d > 1) continue;
      const light = -(x - cx) * 0.5 - (y - cy) * 0.8;
      const col = d > 0.8 ? '#dfe3f5' : light > 2 ? '#aab4ff' : light > 0 ? '#6f7de0' : light > -2 ? '#4a55b8' : '#2f3690';
      px(c, x, y, 1, 1, col);
    }
  }
}

/** 蓝蝴蝶项链，画在 56x56 的画布上。 */
export function drawNecklace(c) {
  c.clearRect(0, 0, 56, 56);
  for (let i = 0; i <= 20; i++) {
    const col = i % 2 ? '#f4f4fa' : '#b9bccb';
    px(c, 14 + i * 0.7, i, 1, 1, col);
    px(c, 42 - i * 0.7, i, 1, 1, col);
  }
  const cx = 28;
  const cy = 32;
  gem(c, cx - 9, cy - 9, 12, 6.5, -0.7, -0.71);
  gem(c, cx + 9, cy - 9, 12, 6.5, 0.7, -0.71);
  gem(c, cx - 7, cy + 7, 8.5, 5, -0.7, 0.71);
  gem(c, cx + 7, cy + 7, 8.5, 5, 0.7, 0.71);
  gem(c, cx, cy, 4.5, 4.5, 1, 0);
  px(c, cx - 1, cy - 2, 1, 1, '#ffffff');
  px(c, cx - 12, cy - 15, 1, 1, '#ffffff');
  px(c, cx + 9, cy - 14, 1, 1, '#ffffff');
}

/** 小蓝蝴蝶，返回 dataURL，给会飞的 DOM 蝴蝶用。 */
export function butterflyDataUrl() {
  const cv = document.createElement('canvas');
  cv.width = 14;
  cv.height = 12;
  const c = cv.getContext('2d');
  const rows = ['.##......##.', '####....####', '#####..#####', '.####BB####.', '..###BB###..', '.####BB####.', '.###.BB.###.', '..#......#..'];
  rows.forEach((row, j) => [...row].forEach((ch, i) => {
    if (ch === '#') px(c, i + 1, j + 2, 1, 1, (i + j) % 3 ? '#6f7de0' : '#aab4ff');
    if (ch === 'B') px(c, i + 1, j + 2, 1, 1, '#2a2140');
  }));
  return cv.toDataURL();
}
