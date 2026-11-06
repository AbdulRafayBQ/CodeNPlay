/* =====================================================================
   CodeNPlay - Jungle engine (js/jungle.js)
   ---------------------------------------------------------------------
   Drawn-by-code maps (Black Fang Jungle, Rotting Swamp, Ashfall Gorge),
   day cycle (morning > noon > evening > night), 5 villains, 3 bosses.
   Maps/art code comes from the "Jungle Run" game; the game flow below is
   driven by play.js:

     const g = new Jungle(canvas, { hero, foes, segments, sfx, onPlace, onClock });
     await g.intro();          // first enemy walks in
     await g.hit();            // right answer: hero shoots  -> 'hit' | 'kill' | 'clear'
     await g.advance();        // after a 'kill': run on (new map every segment), next enemy walks in
     await g.miss();           // wrong answer: enemy shoots the hero
     await g.defeat(); g.revive();
     await g.finish();         // all done: hero runs into the sunrise
     await g.resume(n);        // refresh: continue after n correct answers
   ===================================================================== */
(function () {
'use strict';

const W = 960, H = 540;          // canvas size
const LW = 480, LH = 270;        // low-res art size (drawn x2 => chunky pixel look)
const LG = 215;                  // ground top line in low-res px  (=430 on screen)
const GROUND = LG * 2;
const FEET = GROUND + 12;        // where characters stand
const HERO_X = 230, ENEMY_X = 700;
const RUN_SPEED = 260;           // world scroll speed (px/sec)
const TARGET_H = { codex: 140, nova: 140, zephyr: 128, umbrix: 130, voltrix: 128, glacira: 128, pyrovex: 130, titan: 150, vorathrax: 175, nyxorion: 180 };
const MAP_NAMES = ['Black Fang Jungle', 'Rotting Swamp', 'Ashfall Gorge'];

/* ---------------------------------------------------------------
   2. PIXEL TOOLKIT
   --------------------------------------------------------------- */
const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, f) => a + (b - a) * f;
const smooth = f => f * f * (3 - 2 * f);

function rng(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function mk(w, h) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
  return { c, x };
}
const hexA = h => { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; };
const rgbS = a => `rgb(${a[0] | 0},${a[1] | 0},${a[2] | 0})`;
const mixA = (a, b, f) => [lerp(a[0], b[0], f), lerp(a[1], b[1], f), lerp(a[2], b[2], f)];

const px = (x, a, b, w, h, c) => { x.fillStyle = c; x.fillRect(Math.round(a), Math.round(b), Math.max(1, Math.round(w)), Math.max(1, Math.round(h))); };
function ell(x, cx, cy, rx, ry, c) {
  x.fillStyle = c;
  const R = Math.floor(ry);
  for (let j = -R; j <= R; j++) {
    const k = Math.sqrt(Math.max(0, 1 - (j * j) / (ry * ry))) * rx;
    x.fillRect(Math.round(cx - k), Math.round(cy + j), Math.max(1, Math.round(k * 2)), 1);
  }
}
// draw something that may cross the left/right edge of a tile, so the tile loops seamlessly
function wrap(x0, half, fn) { for (const o of [-LW, 0, LW]) { const xx = x0 + o; if (xx + half > -2 && xx - half < LW + 2) fn(xx); } }

function ridge(x, col, base, waves, floor) {
  x.fillStyle = col;
  for (let i = 0; i < LW; i++) {
    let y = base; for (const [a, k, p] of waves) y += a * Math.sin(TAU * k * i / LW + p);
    y = Math.round(y); x.fillRect(i, y, 1, floor - y);
  }
}
function blobs(r, n, rad) {
  const a = [];
  for (let i = 0; i < n; i++) {
    const ang = r() * TAU, d = r() * rad * .7;
    a.push({ dx: Math.cos(ang) * d, dy: Math.sin(ang) * d * .6, rx: rad * (.45 + r() * .35), ry: rad * (.35 + r() * .3),
      dots: [0, 1, 2, 3, 4].map(() => [(r() - .5) * rad, (r() - .5) * rad * .6]) });
  }
  return a;
}
function crown(x, cx, cy, bl, c) {
  for (const b of bl) ell(x, cx + b.dx + 1, cy + b.dy + 2, b.rx, b.ry, c[0]);
  for (const b of bl) ell(x, cx + b.dx, cy + b.dy, b.rx * .92, b.ry * .9, c[1]);
  for (const b of bl) ell(x, cx + b.dx - 2, cy + b.dy - 3, b.rx * .55, b.ry * .5, c[2]);
  for (const b of bl) for (const d of b.dots) px(x, cx + b.dx + d[0], cy + b.dy + d[1], 2, 1, c[3]);
}
function trunk(x, cx, top, bot, w, c) {
  px(x, cx - w / 2, top, w, bot - top, c[0]);
  px(x, cx - w / 2, top, Math.max(1, w * .28), bot - top, c[1]);
  px(x, cx + w / 2 - 1, top, 1, bot - top, c[2]);
  for (let i = 0; i < 9; i++) px(x, cx - w / 2 - i * .8, bot - 9 + i, w + i * 1.6, 1, c[0]);   // root flare
}
function fern(x, cx, base, len, c) {
  const n = 7;
  for (let i = 0; i < n; i++) {
    const a = -Math.PI * (0.1 + 0.8 * i / (n - 1));
    for (let s = 0; s < len; s++) {
      const fx = cx + Math.cos(a) * s, fy = base + Math.sin(a) * s + s * s * 0.012;
      px(x, fx, fy, 2, 1, (s + i) % 3 ? c[0] : c[1]);
      if (s % 3 === 0) px(x, fx, fy + 1, 1, 1, c[0]);
    }
  }
}
function mkLayers() { const o = {}; for (const k of ['far', 'mid', 'near', 'lane', 'ground', 'fg']) o[k] = mk(LW, LH); return o; }

// flat ground strip shared by all maps (top edge is dead flat: no ledges, no platforms)
function groundBase(L, r, o) {
  const x = L.ground.x;
  const g = x.createLinearGradient(0, LG, 0, LH); g.addColorStop(0, o.dirt[0]); g.addColorStop(1, o.dirt[1]);
  x.fillStyle = g; x.fillRect(0, LG, LW, LH - LG);
  for (let i = 0; i < 90; i++) ell(x, r() * LW, LG + 12 + r() * (LH - LG - 14), 2 + r() * 4, 1 + r() * 2, o.stone[(r() * o.stone.length) | 0]);
  for (let i = 0; i < 140; i++) px(x, r() * LW, LG + 6 + r() * (LH - LG - 8), 1, 1, o.speck);
  px(x, 0, LG, LW, 2, o.top); px(x, 0, LG + 2, LW, 2, o.grass); px(x, 0, LG + 4, LW, 1, o.grass2);
  for (let i = 0; i < LW; i++) if (r() < .55) px(x, i, LG + 5, 1, 1 + r() * 3, o.grass2);
  for (let i = 0; i < 170; i++) px(x, r() * LW, LG - 1 - r() * 2, 1, 1 + r() * 2, o.top);
  return x;
}

/* ---------------------------------------------------------------
   3. THE THREE MAPS
   Each builder returns pre-drawn parallax layers (far/mid/near/lane/ground/fg),
   a list of glowing "lights", swaying vines, and a few settings.
   Ground is always flat. Nothing floats, nothing to jump on.
   --------------------------------------------------------------- */

/* ---- MAP 1 : Black Fang Jungle (dense, thorny, watched) ---- */
function buildJungle() {
  const r = rng(101), L = mkLayers(), lights = [];

  { // FAR: misty ridges, giant crowns, waterfall
    const x = L.far.x;
    ridge(x, '#7fb59c', 72, [[10, 1, .3], [7, 3, 1.2], [4, 6, 2.1]], LG);
    ridge(x, '#5d9a82', 104, [[12, 2, 1], [6, 4, .2], [3, 8, 2.5]], LG);
    for (let i = 0; i < 11; i++) {
      const cx = i * 44 + r() * 16, cy = 84 + r() * 20, bl = blobs(r, 5, 14 + r() * 8);
      wrap(cx, 40, xx => crown(x, xx, cy, bl, ['#3f7b64', '#4f9378', '#63a98a', '#74bb98']));
    }
    px(x, 290, 64, 26, 10, '#3e6e5b'); px(x, 296, 72, 6, LG - 72, '#cfeff0'); px(x, 303, 72, 3, LG - 72, '#a8dde4'); px(x, 293, 74, 2, LG - 74, '#e8fbfb');
    ell(x, 300, LG - 3, 16, 4, '#e8fbfb');
  }
  { // MID: trees, hanging vines, ferns
    const x = L.mid.x, tc = ['#3c2a1d', '#5a3d27', '#2a1c13'];
    for (let i = 0; i < 9; i++) {
      const cx = i * 55 + 10 + r() * 25, top = 46 + r() * 36, w = 4 + Math.round(r() * 3), bl = blobs(r, 7, 24 + r() * 10);
      const vs = [0, 1, 2, 3].map(() => ({ dx: (r() - .5) * 38, len: 18 + r() * 34 }));
      wrap(cx, 50, xx => {
        trunk(x, xx, top + 12, LG, w, tc);
        crown(x, xx, top, bl, ['#17402e', '#25683a', '#3e9645', '#6dc760']);
        for (const v of vs) { px(x, xx + v.dx, top + 10, 1, v.len, '#1c5a30'); for (let k = 6; k < v.len; k += 6) px(x, xx + v.dx - 1, top + 10 + k, 3, 1, '#4cae4a'); }
      });
    }
    for (let i = 0; i < 10; i++) fern(x, 14 + i * 46 + r() * 16, LG - 1, 14 + r() * 8, ['#1f5a2e', '#34864a', '#4fae4c']);
  }
  { // NEAR: huge trunks + canopy ceiling
    const x = L.near.x, tc = ['#2e1d12', '#4a2f1c', '#1c120b'];
    [72, 236, 396].forEach((cx, i) => {
      const w = 22 + i * 3;
      const bark = [...Array(10)].map(() => ({ o: r() * (w - 4), h: 14 + r() * 50, y: r() * 180 }));
      const moss = [...Array(5)].map(() => ({ o: r() * w, y: 20 + r() * 150 }));
      wrap(cx, 40, xx => {
        trunk(x, xx, -4, LG, w, tc);
        for (let j = 0; j < 22; j++) px(x, xx - w / 2 - j * .9, LG - 22 + j, w + j * 1.8, 1, tc[0]);
        for (const b of bark) px(x, xx - w / 2 + 2 + b.o, b.y, 1, b.h, tc[2]);
        for (const m of moss) ell(x, xx - w / 2 + m.o, m.y, 3, 2, '#2f6a2d');
        // a vine wrapped around the trunk
        for (let y = 20; y < 190; y++) px(x, xx + Math.sin(y * .09 + i) * (w / 2 - 1), y, 1, 1, '#1f5a2e');
      });
    });
    for (let i = 0; i < 14; i++) {
      const cx = i * 36 + r() * 10, cy = r() * 14 - 6, bl = blobs(r, 4, 20 + r() * 10);
      wrap(cx, 40, xx => crown(x, xx, cy, bl, ['#0c2418', '#143a26', '#1f5a34', '#2f8040']));
    }
    for (let i = 0; i < 16; i++) { const cx = 10 + i * 29 + r() * 14, len = 10 + r() * 26; px(x, cx, 20, 1, len, '#143a26'); ell(x, cx, 20 + len, 2, 3, '#1f5a34'); }
  }
  { // LANE: thorn bushes, punji stakes, skull totems, man-eating plants, bones
    const x = L.lane.x, B = LG, kinds = ['thorn', 'stakes', 'totem', 'trap', 'bones', 'thorn', 'stakes', 'none', 'thorn', 'trap', 'totem', 'bones'];
    for (let i = 0; i < 12; i++) {
      const cx = 18 + i * 37 + r() * 12, k = kinds[(r() * kinds.length) | 0];
      if (k === 'thorn') {
        const w = 16 + r() * 10, h = 11 + r() * 8;
        ell(x, cx, B - h / 2, w / 2, h / 2, '#10301f'); ell(x, cx - 1, B - h / 2 - 1, w / 2 - 2, h / 2 - 2, '#1c4a2c');
        for (let q = 0; q < 16; q++) { const a = -Math.PI * r(), sx = cx + Math.cos(a) * w / 2 * .9, sy = B - h / 2 + Math.sin(a) * h / 2 * .9; px(x, sx + Math.cos(a) * 2, sy + Math.sin(a) * 2, 1, 1, '#e6c8a0'); px(x, sx, sy, 1, 1, '#b02a2a'); }
        if (r() < .7) lights.push({ layer: 'lane', x: cx - 1, y: B - h * .55, kind: 'eye', c: '#ffd34a' });
      } else if (k === 'stakes') {
        ell(x, cx, B - 1, 13, 3, '#4a2f1c');
        for (let q = 0; q < 6; q++) { const sx = cx - 10 + q * 4 + r() * 2, h = 12 + r() * 8, lean = (r() - .5) * 2; for (let j = 0; j < h; j++) px(x, sx + lean * j / h * 3, B - 2 - j, 2, 1, j > h - 4 ? '#8a1c1c' : (j % 4 ? '#c9a566' : '#a8844a')); }
      } else if (k === 'totem') {
        px(x, cx, B - 40, 3, 40, '#4a2f1c'); px(x, cx, B - 40, 1, 40, '#6b4528');
        px(x, cx - 3, B - 30, 9, 2, '#4a2f1c'); px(x, cx - 3, B - 22, 9, 2, '#4a2f1c');
        ell(x, cx + 1, B - 46, 6, 5, '#efe6cf'); px(x, cx - 2, B - 47, 2, 2, '#0a0a0a'); px(x, cx + 2, B - 47, 2, 2, '#0a0a0a'); px(x, cx - 2, B - 42, 6, 1, '#cfc6ab');
        for (let q = 0; q < 3; q++) px(x, cx - 7 + q, B - 50 + q * 3, 1, 8, ['#c0392b', '#e8a33d', '#c0392b'][q]);
        for (let q = 0; q < 3; q++) px(x, cx + 7 - q, B - 50 + q * 3, 1, 8, ['#c0392b', '#e8a33d', '#c0392b'][q]);
        lights.push({ layer: 'lane', x: cx - 1, y: B - 47, kind: 'eye', c: '#ff4a2a', gap: 4 });
      } else if (k === 'trap') {
        const sway = q => Math.sin(q * .25) * 3;
        for (let j = 0; j < 20; j++) px(x, cx + sway(j), B - j, 2, 1, '#2d7a34');
        const hx = cx + sway(20), hy = B - 23;
        ell(x, hx - 4, hy, 5, 4, '#b31f2a'); ell(x, hx + 4, hy, 5, 4, '#b31f2a'); ell(x, hx - 4, hy, 3, 2, '#e0505a'); ell(x, hx + 4, hy, 3, 2, '#e0505a');
        for (let q = 0; q < 5; q++) { px(x, hx - 8 + q * 3.5, hy - 3, 1, 2, '#f2f2d8'); px(x, hx - 8 + q * 3.5, hy + 2, 1, 2, '#f2f2d8'); }
        ell(x, cx - 7, B - 3, 6, 2, '#2d7a34'); ell(x, cx + 8, B - 3, 6, 2, '#2d7a34');
      } else if (k === 'bones') {
        for (let q = 0; q < 4; q++) { const ox = cx - 8 + q * 5; for (let s = 0; s <= 8; s++) { const a = Math.PI * s / 8; px(x, ox + Math.cos(a) * 3, B - 2 - Math.sin(a) * 8, 1, 1, '#e8e0c8'); } }
        px(x, cx - 10, B - 2, 22, 1, '#cfc6ab');
        ell(x, cx + 15, B - 3, 4, 3, '#efe6cf'); px(x, cx + 13, B - 4, 2, 2, '#0a0a0a'); px(x, cx + 16, B - 4, 2, 2, '#0a0a0a');
      }
    }
  }
  groundBase(L, r, { dirt: ['#6a4326', '#2e1a0f'], stone: ['#8a6a4a', '#5a3c22', '#7b5a3a'], speck: '#3a2314', top: '#7ee04e', grass: '#3f9a3a', grass2: '#2b7a2e' });
  { // ground details: roots and bones
    const x = L.ground.x;
    for (let i = 0; i < 6; i++) { const sx = r() * LW, sy = LG + 10 + r() * 30; for (let s = 0; s < 22; s++) px(x, sx + s, sy + Math.sin(s * .4) * 3, 1, 2, '#4a2f1c'); }
    for (let i = 0; i < 5; i++) { const sx = r() * (LW - 12), sy = LG + 14 + r() * 36; px(x, sx, sy, 9, 2, '#e8e0c8'); px(x, sx - 1, sy - 1, 2, 4, '#e8e0c8'); px(x, sx + 8, sy - 1, 2, 4, '#e8e0c8'); }
  }
  { // FG: hanging leaves (top) + dark ferns (bottom)
    const x = L.fg.x;
    for (let i = 0; i < 8; i++) {
      const cx = 20 + i * 58 + r() * 20, len = 18 + r() * 24; px(x, cx, 0, 1, len, '#06160d');
      for (let j = 6; j < len; j += 7) for (const d of [-1, 1]) for (let q = 0; q < 8; q++) px(x, cx + d * q, j + q * .55, 2, 2, q > 5 ? '#0b2615' : '#071a0f');
    }
    for (let i = 0; i < 8; i++) fern(x, 14 + i * 58 + r() * 20, LH + 2, 22 + r() * 10, ['#06160d', '#0b2615', '#06160d']);
  }
  const vines = [];
  for (let i = 0; i < 9; i++) vines.push({ x: 30 + i * 105 + r() * 40, len: 70 + r() * 90, ph: r() * TAU, amp: 5 + r() * 6, snake: i % 4 === 1 });
  return { name: 'Black Fang Jungle', L, lights, vines, vineCol: ['#1b5a30', '#4cae4a'], grade: [1, 1, 1], skyShift: null,
    mist: .22, parts: 'fireflies', fogLow: .10 };
}

/* ---- MAP 2 : Rotting Swamp (sunken temple, crocodiles, wisps) ---- */
function buildSwamp() {
  const r = rng(202), L = mkLayers(), lights = [];
  const WATER = '#27504f';
  { // FAR
    const x = L.far.x;
    ridge(x, '#8aa79b', 78, [[8, 1, .8], [5, 3, .1], [3, 7, 1.9]], LG);
    ridge(x, '#6d8c82', 112, [[9, 2, 2], [5, 5, .6]], LG);
    for (let i = 0; i < 8; i++) { // dead spire trees
      const cx = 20 + i * 58 + r() * 14, top = 70 + r() * 30;
      px(x, cx, top, 2, LG - top, '#4d6a62');
      for (let k = 0; k < 4; k++) { const by = top + 8 + k * 9, dir = k % 2 ? 1 : -1; for (let s = 0; s < 8 + r() * 6; s++) px(x, cx + dir * s, by - s * .5, 1, 1, '#4d6a62'); }
    }
    // far temple pyramid
    for (let s = 0; s < 7; s++) px(x, 330 - (7 - s) * 9, 80 + s * 9, (7 - s) * 18, 9, s % 2 ? '#58766d' : '#4d6a62');
    px(x, 322, 66, 16, 14, '#4d6a62'); px(x, 328, 72, 4, 8, '#2d423d');
  }
  { // MID: water + mangroves + sunken temple ruins
    const x = L.mid.x;
    const wg = x.createLinearGradient(0, 128, 0, LG); wg.addColorStop(0, '#3a7068'); wg.addColorStop(1, WATER);
    x.fillStyle = wg; x.fillRect(0, 128, LW, LG - 128);
    for (let i = 0; i < 70; i++) px(x, r() * LW, 132 + r() * (LG - 136), 4 + r() * 10, 1, '#5aa097');
    // ruins (3 of them)
    [[60, 1], [250, 0], [400, 2]].forEach(([cx, t]) => {
      const sc = '#76847a', sd = '#4b584f', sm = '#5e8a3e';
      for (let s = 0; s < 5; s++) px(x, cx - 24 + s * 3, 112 + s * 7, 48 - s * 6, 7, s % 2 ? sc : sd);
      px(x, cx - 7, 62, 14, 50, sc); px(x, cx - 7, 62, 3, 50, '#8a998f'); px(x, cx + 5, 62, 2, 50, sd);
      px(x, cx - 9, 58, 18, 5, sd);
      // carved face
      px(x, cx - 4, 78, 3, 3, '#1d2a24'); px(x, cx + 2, 78, 3, 3, '#1d2a24'); px(x, cx - 3, 86, 7, 2, '#1d2a24');
      for (let q = 0; q < 8; q++) px(x, cx - 7 + r() * 14, 62 + r() * 50, 3, 1 + r() * 2, sm);
      ell(x, cx, 132, 28, 3, '#6aa79d');
      if (t !== 1) { px(x, cx - 14, 96, 2, 8, '#3a2a1c'); lights.push({ layer: 'mid', x: cx - 13, y: 94, kind: 'torch', c: '#ffa23a' }); }
    });
    // mangroves (arching roots + drooping moss)
    for (let i = 0; i < 7; i++) {
      const cx = 30 + i * 66 + r() * 20, top = 54 + r() * 30, bl = blobs(r, 6, 22 + r() * 8);
      const drips = [...Array(6)].map(() => ({ dx: (r() - .5) * 46, len: 22 + r() * 40 }));
      wrap(cx, 50, xx => {
        px(x, xx - 3, top + 10, 6, 140 - top - 10, '#3a3126'); px(x, xx - 3, top + 10, 2, 140 - top - 10, '#52463a');
        for (let s = -1; s <= 1; s += 2) for (let q = 0; q < 30; q++) px(x, xx + s * (4 + q * .5), 138 + q * .5 - Math.sin(q * .1) * 4 + q * q * .02, 2, 2, '#2e261d');
        crown(x, xx, top, bl, ['#2a4a2c', '#3d6a36', '#5f9444', '#8cbf5a']);
        for (const d of drips) { px(x, xx + d.dx, top + 8, 1, d.len, '#5f8a3a'); for (let k = 5; k < d.len; k += 5) px(x, xx + d.dx - 1, top + 8 + k, 3, 1, '#7fae4a'); }
      });
    }
  }
  { // NEAR: gnarled giant trunks, webs, moss
    const x = L.near.x, tc = ['#2b241b', '#43382a', '#17120d'];
    [90, 270, 420].forEach((cx, i) => {
      const w = 18 + i * 3, tw = [...Array(8)].map(() => ({ o: r() * (w - 3), h: 10 + r() * 50, y: r() * 180 }));
      wrap(cx, 40, xx => {
        trunk(x, xx, -4, LG, w, tc);
        for (let y = 0; y < LG - 24; y += 2) px(x, xx - w / 2 - 1 + Math.sin(y * .07 + i * 2) * 2, y, 1, 2, tc[0]);
        for (let j = 0; j < 22; j++) px(x, xx - w / 2 - j * .9, LG - 22 + j, w + j * 1.8, 1, tc[0]);
        for (const b of tw) px(x, xx - w / 2 + 2 + b.o, b.y, 1, b.h, tc[2]);
        for (let q = 0; q < 5; q++) ell(x, xx - w / 2 + q * 5, 40 + q * 28, 3, 2, '#4f7a30');
        // spider web
        for (let q = 0; q < 7; q++) { const a = Math.PI * .1 + q * .16; for (let s = 6; s < 30; s++) px(x, xx + w / 2 + Math.cos(a) * s, 40 + Math.sin(a) * s, 1, 1, 'rgba(235,240,235,.8)'); }
        for (let q = 1; q < 5; q++) for (let s = 0; s < 14; s++) { const a = Math.PI * .1 + s * .16 * .75; px(x, xx + w / 2 + Math.cos(a) * q * 7, 40 + Math.sin(a) * q * 7, 1, 1, 'rgba(235,240,235,.65)'); }
      });
    });
    for (let i = 0; i < 13; i++) { // hanging moss curtain along the top
      const cx = i * 38 + r() * 12, len = 26 + r() * 40, bl = blobs(r, 3, 16);
      wrap(cx, 30, xx => { crown(x, xx, -2, bl, ['#14241a', '#1f3a26', '#2e5a34', '#4f8a40']); for (let q = 0; q < 4; q++) { px(x, xx - 8 + q * 5, 6, 1, len - q * 4, '#4f8a40'); } });
    }
  }
  { // LANE: bog band behind the path: water, crocodiles, logs, skulls, mushrooms
    const x = L.lane.x, B = LG;
    const wg = x.createLinearGradient(0, B - 14, 0, B); wg.addColorStop(0, '#2c5a56'); wg.addColorStop(1, '#10302f');
    x.fillStyle = wg; x.fillRect(0, B - 14, LW, 14);
    for (let i = 0; i < 40; i++) px(x, r() * LW, B - 13 + r() * 11, 3 + r() * 7, 1, '#4f8f86');
    for (let i = 0; i < 12; i++) { const cx = 14 + i * 39 + r() * 14, k = (r() * 6) | 0;
      if (k === 0 || k === 1) { // crocodile head in the water
        ell(x, cx, B - 7, 14, 4, '#2f5a2c'); ell(x, cx + 10, B - 7, 7, 2.5, '#3e7436'); px(x, cx - 6, B - 11, 3, 3, '#3e7436'); px(x, cx + 2, B - 11, 3, 3, '#3e7436');
        for (let q = 0; q < 6; q++) px(x, cx + 8 + q * 1.5, B - 5, 1, 2, '#f2f2d8');
        lights.push({ layer: 'lane', x: cx - 4, y: B - 10.5, kind: 'eye', c: '#ffd34a', gap: 6 });
      } else if (k === 2) { // rotting log
        px(x, cx - 14, B - 6, 28, 5, '#3a2a1c'); px(x, cx - 14, B - 6, 28, 1, '#5a4430'); ell(x, cx - 14, B - 4, 1.5, 2.5, '#5a4430');
      } else if (k === 3) { // skull on a stake
        px(x, cx, B - 24, 2, 24, '#4a3a28'); ell(x, cx + 1, B - 28, 5, 4, '#e8e0c8'); px(x, cx - 2, B - 29, 2, 2, '#0a0a0a'); px(x, cx + 2, B - 29, 2, 2, '#0a0a0a');
        lights.push({ layer: 'lane', x: cx - 0, y: B - 28, kind: 'eye', c: '#4affc8', gap: 4 });
      } else if (k === 4) { // glowing mushrooms
        for (let q = 0; q < 3; q++) { const mx = cx - 8 + q * 8, mh = 7 + r() * 6; px(x, mx, B - mh, 2, mh, '#c8d8c0'); ell(x, mx + 1, B - mh, 5, 3, '#2ec7a0'); lights.push({ layer: 'lane', x: mx + 1, y: B - mh, kind: 'wisp', c: '#3dffd0', r: 20 }); }
      } else { // reeds
        for (let q = 0; q < 8; q++) { const rx = cx - 10 + q * 3, rh = 14 + r() * 12; px(x, rx, B - rh, 1, rh, '#6a8a3a'); if (q % 3 === 0) px(x, rx - 1, B - rh - 4, 3, 5, '#5a3a22'); }
      }
    }
  }
  groundBase(L, r, { dirt: ['#4a4030', '#1d1912'], stone: ['#5f5340', '#3c3326', '#6f6350'], speck: '#25201a', top: '#8fb84a', grass: '#52762e', grass2: '#3a5a24' });
  { const x = L.ground.x;
    for (let i = 0; i < 7; i++) ell(x, r() * LW, LG + 14 + r() * 40, 9 + r() * 8, 2, '#2a5a52');   // puddles in the mud
    for (let i = 0; i < 5; i++) { const sx = r() * (LW - 12), sy = LG + 14 + r() * 36; px(x, sx, sy, 9, 2, '#d8d0b8'); px(x, sx - 1, sy - 1, 2, 4, '#d8d0b8'); px(x, sx + 8, sy - 1, 2, 4, '#d8d0b8'); } }
  { // FG: dangling moss + cattails
    const x = L.fg.x;
    for (let i = 0; i < 8; i++) { const cx = 16 + i * 58 + r() * 22, len = 20 + r() * 34; for (let q = 0; q < 4; q++) px(x, cx + q * 2, 0, 1, len - q * 6, '#101d12'); ell(x, cx + 3, len - 4, 5, 3, '#0a140c'); }
    for (let i = 0; i < 10; i++) { const cx = 10 + i * 46 + r() * 20, rh = 22 + r() * 18; px(x, cx, LH - rh, 1, rh, '#09130b'); px(x, cx - 1, LH - rh - 5, 3, 7, '#0a0f08'); }
  }
  const vines = [];
  for (let i = 0; i < 8; i++) vines.push({ x: 24 + i * 118 + r() * 40, len: 60 + r() * 120, ph: r() * TAU, amp: 4 + r() * 5, snake: i % 3 === 0 });
  return { name: 'Rotting Swamp', L, lights, vines, vineCol: ['#4a6a2e', '#9cc25a'], grade: [.92, 1, .96],
    skyShift: { c: [120, 150, 120], a: .22 }, mist: .5, parts: 'fireflies', fogLow: .34 };
}

/* ---- MAP 3 : Ashfall Gorge (volcano, lava, burning trees) ---- */
function buildGorge() {
  const r = rng(303), L = mkLayers(), lights = [];
  { // FAR: volcano
    const x = L.far.x;
    ridge(x, '#6a4a5e', 96, [[10, 1, 2], [6, 3, .4], [4, 6, 1.1]], LG);
    // volcano body
    for (let y = 40; y < LG; y++) { const half = 12 + (y - 40) * .85; px(x, 300 - half, y, half * 2, 1, y < 80 ? '#3a2530' : '#432a36'); }
    for (let y = 40; y < 70; y++) { const half = 12 + (y - 40) * .85; px(x, 300 - half, y, 3, 1, '#4f3340'); }
    ell(x, 300, 41, 13, 3, '#ff7a1a'); ell(x, 300, 41, 8, 2, '#ffc04a');
    for (let i = 0; i < 4; i++) { const sx = 290 + i * 7; for (let y = 44; y < 100 + i * 12; y++) px(x, sx + Math.sin(y * .12 + i) * 3 + (i - 1.5) * (y - 44) * .35, y, 2, 1, i % 2 ? '#ff6a1a' : '#e0481a'); }
    lights.push({ layer: 'far', x: 300, y: 40, kind: 'lava', c: '#ff7a2a', r: 70 });
    // smaller peak
    for (let y = 80; y < LG; y++) { const half = 6 + (y - 80) * .7; px(x, 90 - half, y, half * 2, 1, '#3f2a38'); }
    ell(x, 90, 81, 7, 2, '#ff7a1a');
    lights.push({ layer: 'far', x: 90, y: 80, kind: 'lava', c: '#ff7a2a', r: 40 });
    // ash cloud
    for (let i = 0; i < 9; i++) ell(x, 296 + r() * 90 - 20, 18 + r() * 14, 16 + r() * 18, 6 + r() * 5, ['#4a3a44', '#5a4854', '#3a2c36'][i % 3]);
  }
  { // MID: basalt cliffs, charred trees, lava falls
    const x = L.mid.x;
    let cxp = 0; while (cxp < LW) { const w = 8 + r() * 14, h = 40 + r() * 70, lean = (r() - .5) * 4; for (let y = 0; y < h; y++) px(x, cxp + lean * y / h, LG - y, w, 1, y < 4 ? '#6a5560' : (y % 9 ? '#392a33' : '#2f232b')); px(x, cxp, LG - h, 2, h, '#4d3a45'); cxp += w - 2; }
    for (let i = 0; i < 4; i++) { const lx = 40 + i * 120 + r() * 30, top = 90 + r() * 20; for (let y = top; y < LG; y++) px(x, lx + Math.sin(y * .2) * 1, y, 3, 1, y % 5 ? '#ff7a1a' : '#ffc04a'); lights.push({ layer: 'mid', x: lx + 1, y: (top + LG) / 2, kind: 'lava', c: '#ff6a1a', r: 36 }); }
    for (let i = 0; i < 7; i++) { // charred trees with burning tips
      const cx = 20 + i * 66 + r() * 24, top = 78 + r() * 34;
      px(x, cx, top, 4, LG - top, '#1c1417'); px(x, cx, top, 1, LG - top, '#2c2024');
      for (let k = 0; k < 4; k++) { const by = top + 6 + k * 11, dir = k % 2 ? 1 : -1, len = 10 + r() * 12; for (let s = 0; s < len; s++) px(x, cx + 2 + dir * s, by - s * .6, 2, 1, '#1c1417'); px(x, cx + 2 + dir * len, by - len * .6 - 1, 2, 2, '#ff8a2a'); lights.push({ layer: 'mid', x: cx + 2 + dir * len, y: by - len * .6, kind: 'torch', c: '#ff7a2a', small: true }); }
    }
    for (let i = 0; i < 8; i++) fern(x, 14 + i * 58 + r() * 16, LG - 1, 12 + r() * 8, ['#2a1a14', '#4a2a1c', '#1c1210']);
  }
  { // NEAR: charred giants + rock ceiling with stalactites
    const x = L.near.x, tc = ['#17100f', '#2a1c1a', '#0c0807'];
    [80, 250, 400].forEach((cx, i) => {
      const w = 20 + i * 3, ks = [...Array(3)].map(() => ({ y: 40 + r() * 140, o: r() * w }));
      wrap(cx, 40, xx => {
        trunk(x, xx, -4, LG, w, tc);
        for (let j = 0; j < 22; j++) px(x, xx - w / 2 - j * .9, LG - 22 + j, w + j * 1.8, 1, tc[0]);
        for (const k of ks) { ell(x, xx - w / 2 + k.o, k.y, 3, 4, '#ff6a1a'); ell(x, xx - w / 2 + k.o, k.y, 1.5, 2, '#ffc04a'); }
      });
      ks.forEach(k => lights.push({ layer: 'near', x: cx - w / 2 + k.o, y: k.y, kind: 'lava', c: '#ff6a1a', r: 22 }));
    });
    for (let i = 0; i < 16; i++) { const cx = i * 31 + r() * 12, len = 14 + r() * 34, w = 7 + r() * 8; for (let y = 0; y < len; y++) { const hw = w * (1 - y / len) / 2; px(x, cx - hw, y, hw * 2 + 1, 1, y > len - 4 ? '#4d3340' : '#2f2129'); } }
    px(x, 0, 0, LW, 8, '#241a20');
  }
  { // LANE: lava trench, iron spikes, dragon ribs, burning stumps, skull piles
    const x = L.lane.x, B = LG;
    const lg = x.createLinearGradient(0, B - 10, 0, B); lg.addColorStop(0, '#ff8a2a'); lg.addColorStop(1, '#c8300f');
    x.fillStyle = lg; x.fillRect(0, B - 10, LW, 10);
    for (let i = 0; i < 50; i++) px(x, r() * LW, B - 9 + r() * 8, 2 + r() * 6, 1, r() < .5 ? '#ffc04a' : '#ff5a1a');
    for (let i = 0; i < 18; i++) { const cx = 10 + i * 26 + r() * 10; lights.push({ layer: 'lane', x: cx, y: B - 6, kind: 'lava', c: '#ff7a2a', r: 26 }); }
    for (let i = 0; i < 12; i++) { const cx = 16 + i * 38 + r() * 12, k = (r() * 5) | 0;
      if (k === 0) { // iron spikes
        for (let q = 0; q < 5; q++) { const sx = cx - 8 + q * 4, h = 14 + r() * 6; for (let j = 0; j < h; j++) px(x, sx + (j > h - 6 ? (h - j) * 0 : 0), B - 1 - j, j > h - 5 ? 1 : 3, 1, j > h - 5 ? '#c8cdd4' : '#59606a'); px(x, sx, B - h - 1, 1, 1, '#ffffff'); }
        px(x, cx - 11, B - 2, 24, 2, '#2a2f36');
      } else if (k === 1) { // dragon ribs
        for (let q = 0; q < 4; q++) { const ox = cx - 9 + q * 6; for (let s = 0; s <= 10; s++) { const a = Math.PI * (.05 + .55 * s / 10); px(x, ox + Math.cos(a) * 3, B - 2 - Math.sin(a) * 18, 2, 1, '#d8cfb8'); } }
        px(x, cx - 12, B - 3, 30, 2, '#cfc6ab');
      } else if (k === 2) { // burning stump
        px(x, cx - 4, B - 12, 9, 12, '#1c1417'); px(x, cx - 4, B - 12, 2, 12, '#2c2024'); lights.push({ layer: 'lane', x: cx, y: B - 14, kind: 'torch', c: '#ff8a2a' });
      } else if (k === 3) { // skull pile
        for (let q = 0; q < 4; q++) { const sx = cx - 9 + q * 6 + r() * 2, sy = B - 3 - (q % 2) * 5; ell(x, sx, sy, 4, 3.5, '#e8e0c8'); px(x, sx - 2, sy - 1, 1, 2, '#0a0a0a'); px(x, sx + 1, sy - 1, 1, 2, '#0a0a0a'); }
        lights.push({ layer: 'lane', x: cx - 1, y: B - 8, kind: 'eye', c: '#ff3a1a', gap: 5 });
      } else { // charred thorn bush
        ell(x, cx, B - 6, 11, 6, '#150f10'); for (let q = 0; q < 14; q++) { const a = -Math.PI * r(); px(x, cx + Math.cos(a) * 11, B - 6 + Math.sin(a) * 6, 1, 2, '#ff6a1a'); }
      }
    }
  }
  groundBase(L, r, { dirt: ['#3a2c32', '#140e11'], stone: ['#52414a', '#2c2128', '#463640'], speck: '#0e0a0c', top: '#6a5048', grass: '#3f2f2c', grass2: '#2a1f1e' });
  { const x = L.ground.x; // glowing cracks
    for (let i = 0; i < 9; i++) { let cx = r() * LW, cy = LG + 12 + r() * 40; const n = 10 + r() * 14; for (let s = 0; s < n; s++) { px(x, cx, cy, 2, 1, s % 3 ? '#ff6a1a' : '#ffc04a'); cx += 1 + r() * 2; cy += (r() - .5) * 3; } lights.push({ layer: 'ground', x: cx - n, y: cy, kind: 'lava', c: '#ff6a1a', r: 18 }); }
  }
  { // FG: ash leaves + lava drips
    const x = L.fg.x;
    for (let i = 0; i < 8; i++) { const cx = 20 + i * 58 + r() * 20, len = 14 + r() * 26; px(x, cx, 0, 2, len, '#0a0608'); ell(x, cx + 1, len + 2, 3, 4, '#ff8a2a'); ell(x, cx + 1, len + 2, 1.5, 2, '#ffd27a'); }
    for (let i = 0; i < 8; i++) fern(x, 14 + i * 58 + r() * 20, LH + 2, 20 + r() * 10, ['#0a0608', '#150e10', '#0a0608']);
  }
  const vines = [];
  for (let i = 0; i < 7; i++) vines.push({ x: 40 + i * 130 + r() * 40, len: 50 + r() * 80, ph: r() * TAU, amp: 4 + r() * 4, snake: false });
  return { name: 'Ashfall Gorge', L, lights, vines, vineCol: ['#241a17', '#5a2a1c'], grade: [1, .88, .84],
    skyShift: { c: [150, 60, 40], a: .34 }, mist: .3, parts: 'embers', fogLow: .12 };
}

const MAP_BUILDERS = [buildJungle, buildSwamp, buildGorge];

/* ---------------------------------------------------------------
   4. DAY CYCLE + RENDERER
   Time runs 0 = morning, 1 = noon, 2 = evening, 3 = night, 4 = morning again.
   Everything (sky, sun, moon, fog, tint, stars, glows) is blended from these keys,
   so the day moves smoothly while the hero runs between questions.
   --------------------------------------------------------------- */
const PHASES = [
  { n: 'Morning', top: '#4f9fd6', bot: '#ffd9a6', tint: '#ffeedd', haze: '#d8ecd2', spr: '#ffcf8a', hz: .20, sa: .06, night: 0,  stars: 0,   cloud: .9,  rays: .55,
    sun: [.18, .40], sunTo: [.52, .09], sunC: '#fff0b0', moon: [-.05, .95], moonTo: [-.10, 1.10] },
  { n: 'Noon',    top: '#2b86d8', bot: '#a6e2f6', tint: '#ffffff', haze: '#cfe9da', spr: '#ffffff', hz: .09, sa: 0,   night: 0,  stars: 0,   cloud: 1,   rays: .30,
    sun: [.52, .09], sunTo: [.84, .46], sunC: '#fffbe2', moon: [-.10, 1.10], moonTo: [.06, 1.0] },
  { n: 'Evening', top: '#2e2260', bot: '#ff7a40', tint: '#ffb28c', haze: '#ff9a6a', spr: '#ff7a3c', hz: .20, sa: .16, night: .2, stars: .15, cloud: .8,  rays: .75,
    sun: [.84, .46], sunTo: [.92, 1.0],  sunC: '#ffb050', moon: [.06, 1.0],  moonTo: [.30, .15] },
  { n: 'Night',   top: '#03071a', bot: '#16305a', tint: '#5870b4', haze: '#1a3262', spr: '#1b2c78', hz: .28, sa: .30, night: 1,  stars: 1,   cloud: .35, rays: 0,
    sun: [.06, 1.0], sunTo: [.18, .40],  sunC: '#ffb050', moon: [.30, .15],  moonTo: [-.05, .95] },
];
for (const p of PHASES) for (const k of ['top', 'bot', 'tint', 'haze', 'spr', 'sunC']) p[k + 'A'] = hexA(p[k]);

function pal(t) {
  const i = Math.floor(t), f = smooth(t - i), a = PHASES[((i % 4) + 4) % 4], b = PHASES[(((i + 1) % 4) + 4) % 4];
  const o = {};
  for (const k of ['top', 'bot', 'tint', 'haze', 'spr', 'sunC']) o[k] = mixA(a[k + 'A'], b[k + 'A'], f);
  for (const k of ['hz', 'sa', 'night', 'stars', 'cloud', 'rays']) o[k] = lerp(a[k], b[k], f);
  o.sun = [lerp(a.sun[0], a.sunTo[0], f), lerp(a.sun[1], a.sunTo[1], f)];
  o.moon = [lerp(a.moon[0], a.moonTo[0], f), lerp(a.moon[1], a.moonTo[1], f)];
  return o;
}

const SPEED = { far: .08, mid: .22, near: .5, lane: .8, ground: 1, fg: 1.5 };
let cv = null, ctx = null;
const bg = mk(W, H), spr = mk(W, H);
let RS = 1;                       // render scale: canvas pixels per game pixel (matches the on-screen size => crisp characters)
const smoothOn = () => RS < 2;     // pixel art: smooth below 2x, hard pixels above
let cam = 0, time = 0, timeT = 0, timeTarget = 0, mapIdx = 0;
const maps = [];
const getMap = i => maps[i] || (maps[i] = MAP_BUILDERS[i]());

// small reusable pieces: stars, clouds, mist, glows
const stars = []; { const r = rng(7); for (let i = 0; i < 70; i++) stars.push({ x: r() * W, y: r() * 250, s: r() < .2 ? 3 : 2, p: r() * TAU }); }
const cloudT = mk(LW, 100); { const r = rng(5), x = cloudT.x;
  for (let i = 0; i < 6; i++) { const cx = 30 + i * 78 + r() * 20, cy = 30 + r() * 40, n = 3 + (r() * 3 | 0);
    wrap(cx, 50, xx => { for (let k = 0; k < n; k++) ell(x, xx + (k - n / 2) * 9, cy + (k % 2) * 3, 12 + (k % 3) * 3, 6, '#dfe9f3'); for (let k = 0; k < n; k++) ell(x, xx + (k - n / 2) * 9, cy - 2 + (k % 2) * 3, 11 + (k % 3) * 3, 5, '#ffffff'); }); } }
const mistT = mk(W, 180); { const r = rng(9), x = mistT.x;
  for (let i = 0; i < 9; i++) { const cx = i * 120 + r() * 60, cy = 60 + r() * 70, rad = 90 + r() * 70;
    for (const o of [-W, 0, W]) { const g = x.createRadialGradient(cx + o, cy, 0, cx + o, cy, rad); g.addColorStop(0, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.save(); x.translate(0, cy); x.scale(1, .42); x.translate(0, -cy); x.fillRect(cx + o - rad, cy - rad, rad * 2, rad * 2); x.restore(); } } }
const glows = {};
function glow(col) {
  if (glows[col]) return glows[col];
  const g = mk(64, 64), rr = hexA(col), gr = g.x.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, `rgba(${rr[0]},${rr[1]},${rr[2]},1)`); gr.addColorStop(.35, `rgba(${rr[0]},${rr[1]},${rr[2]},.45)`); gr.addColorStop(1, `rgba(${rr[0]},${rr[1]},${rr[2]},0)`);
  g.x.fillStyle = gr; g.x.fillRect(0, 0, 64, 64); return glows[col] = g.c;
}

function tile(c, src, sp, y) {
  let off = (cam * sp) % W; off = Math.round(off / 2) * 2;
  c.drawImage(src.c, 0, 0, LW, LH, -off, y || 0, W, H);
  c.drawImage(src.c, 0, 0, LW, LH, W - off, y || 0, W, H);
}
function fog(b, col, a, y0) {
  const g = b.createLinearGradient(0, y0, 0, GROUND + 10);
  g.addColorStop(0, `rgba(${col[0] | 0},${col[1] | 0},${col[2] | 0},0)`); g.addColorStop(1, `rgba(${col[0] | 0},${col[1] | 0},${col[2] | 0},${a})`);
  b.fillStyle = g; b.fillRect(0, y0, W, H - y0);
}

// birds by day, bats by night
const flyers = [];
function updateFlyers(dt, P) {
  if (flyers.length < 3 && Math.random() < dt * .22) { const dir = Math.random() < .5 ? 1 : -1; flyers.push({ x: dir > 0 ? -30 : W + 30, y: 40 + Math.random() * 150, vx: dir * (50 + Math.random() * 50), ph: Math.random() * 9, bat: P.night > .5 }); }
  for (let i = flyers.length - 1; i >= 0; i--) { const f = flyers[i]; f.x += f.vx * dt; if (f.x < -60 || f.x > W + 60) flyers.splice(i, 1); }
}
function drawFlyers(b) {
  for (const f of flyers) {
    const fl = Math.sin(time * 9 + f.ph), col = f.bat ? '#150b22' : '#17261b', x = Math.round(f.x), y = Math.round(f.y);
    b.fillStyle = col; b.fillRect(x - 2, y, 4, 3);
    for (let i = 1; i <= (f.bat ? 7 : 6); i++) { const dy = Math.round(-fl * i * .8 + (f.bat ? i * .3 : 0)); b.fillRect(x - 2 - i * 2, y + dy, 2, 2); b.fillRect(x + 2 + i * 2 - 2, y + dy, 2, 2); }
  }
}

function drawVines(b, M) {
  const off = Math.round(((cam * .6) % W) / 2) * 2;
  for (const v of M.vines) for (const k of [0, 1]) {
    const ax = v.x - off + k * W; if (ax < -60 || ax > W + 60) continue;
    let lx = ax, ly = 0;
    for (let s = 0; s < v.len; s += 4) {
      lx = ax + Math.sin(time * 1.3 + v.ph + s * .025) * v.amp * (s / v.len); ly = s;
      b.fillStyle = M.vineCol[0]; b.fillRect(lx | 0, ly, 4, 4);
      if ((s / 4) % 3 === 1) { b.fillStyle = M.vineCol[1]; b.fillRect((lx + (s % 8 ? 3 : -5)) | 0, ly, 5, 3); }
    }
    if (v.snake) {
      for (let q = 0; q < 9; q++) { b.fillStyle = q % 2 ? '#6aa22a' : '#9bd13a'; b.fillRect((lx + Math.sin(time * 2 + q * .8) * 6) | 0, ly + 4 + q * 5, 6, 6); }
      const hx = (lx + Math.sin(time * 2 + 7.2) * 6) | 0, hy = ly + 4 + 45;
      b.fillStyle = '#b8e04a'; b.fillRect(hx - 2, hy, 10, 8); b.fillStyle = '#ff2a2a'; b.fillRect(hx - 1, hy + 2, 2, 2); b.fillRect(hx + 5, hy + 2, 2, 2);
      if (Math.sin(time * 7 + v.ph) > .2) { b.fillStyle = '#e02a3a'; b.fillRect(hx + 2, hy + 8, 2, 5); }
    }
  }
}

function drawLights(b, M, P) {
  b.globalCompositeOperation = 'lighter';
  for (const l of M.lights) {
    const off = Math.round(((cam * SPEED[l.layer]) % W) / 2) * 2;
    for (const k of [0, 1]) {
      const sx = l.x * 2 - off + k * W; if (sx < -60 || sx > W + 60) continue;
      let sy = l.y * 2, a;
      if (l.kind === 'eye') {
        a = clamp(.30 + .70 * P.night, 0, 1) * (Math.sin(time * .9 + l.x) > .94 ? 0 : 1);   // they blink
        const g = (l.gap || 5) * 2;
        b.globalAlpha = a * .45; b.drawImage(glow(l.c), sx - 14, sy - 14, 28 + g, 28);
        b.globalAlpha = a; b.fillStyle = l.c; b.fillRect(sx - 2, sy - 1, 4, 3); b.fillRect(sx - 2 + g, sy - 1, 4, 3);
      } else if (l.kind === 'lava') {
        a = clamp(.40 + .14 * Math.sin(time * 2.1 + l.x) + .12 * P.night, 0, 1); const r2 = (l.r || 30) * 2;
        b.globalAlpha = a; b.drawImage(glow(l.c), sx - r2, sy - r2, r2 * 2, r2 * 2);
      } else if (l.kind === 'torch') {
        const fl = Math.sin(time * 14 + l.x) * 1.5, r2 = l.small ? 16 : 46; a = clamp((l.small ? .4 : .5) + (l.small ? .12 : .35) * P.night + .12 * Math.sin(time * 21 + l.x), 0, 1);
        b.globalAlpha = a; b.drawImage(glow('#ff8a2a'), sx - r2, sy - r2 - 6, r2 * 2, r2 * 2);
        b.globalAlpha = 1; if (l.small) { b.fillStyle = '#ff8a2a'; b.fillRect(sx - 2, sy - 6, 4, 5); b.fillStyle = '#ffd27a'; b.fillRect(sx - 1, sy - 8 + fl * .5, 2, 4); } else { b.fillStyle = '#ff8a2a'; b.fillRect(sx - 3, sy - 12, 6, 10); b.fillStyle = '#ffd27a'; b.fillRect(sx - 1, sy - 16 + fl, 3, 7); }
      } else if (l.kind === 'wisp') {
        sy += Math.sin(time * 1.4 + l.x) * 7; a = clamp(.12 + P.night * .9, 0, 1); const r2 = (l.r || 22) * 2;
        b.globalAlpha = a; b.drawImage(glow(l.c), sx - r2, sy - r2, r2 * 2, r2 * 2); b.fillStyle = '#eafff8'; b.fillRect(sx - 2, sy - 2, 4, 4);
      }
    }
  }
  b.globalAlpha = 1; b.globalCompositeOperation = 'source-over';
}

function renderWorld(dt, scroll) {
  const M = getMap(mapIdx), P = pal(timeT), b = bg.x;
  // sky
  let top = P.top, bot = P.bot;
  if (M.skyShift) { top = mixA(top, M.skyShift.c, M.skyShift.a * .6); bot = mixA(bot, M.skyShift.c, M.skyShift.a); }
  const sg = b.createLinearGradient(0, 0, 0, GROUND); sg.addColorStop(0, rgbS(top)); sg.addColorStop(1, rgbS(bot));
  b.fillStyle = sg; b.fillRect(0, 0, W, H);
  if (P.stars > .02) for (const s of stars) { b.globalAlpha = P.stars * (.55 + .45 * Math.sin(time * 2 + s.p)); b.fillStyle = '#fff'; b.fillRect(s.x | 0, s.y | 0, s.s, s.s); } b.globalAlpha = 1;
  // sun + moon
  const sx = P.sun[0] * W, sy = P.sun[1] * GROUND, sa = clamp((.8 - P.sun[1]) / .25, 0, 1);
  if (sa > 0) { b.globalAlpha = sa; b.globalCompositeOperation = 'lighter'; b.drawImage(glow(rgbHex(P.sunC)), sx - 190, sy - 190, 380, 380); b.globalCompositeOperation = 'source-over'; ell(b, sx, sy, 17, 17, rgbS(P.sunC)); b.globalAlpha = 1; }
  const mx = P.moon[0] * W, my = P.moon[1] * GROUND, ma = clamp((.8 - P.moon[1]) / .25, 0, 1);
  if (ma > 0) { b.globalAlpha = ma; b.globalCompositeOperation = 'lighter'; b.drawImage(glow('#8fb0ff'), mx - 130, my - 130, 260, 260); b.globalCompositeOperation = 'source-over'; ell(b, mx, my, 15, 15, '#e8eeff'); ell(b, mx - 4, my - 3, 3, 3, '#c6d0ea'); ell(b, mx + 5, my + 4, 2, 2, '#c6d0ea'); b.globalAlpha = 1; }
  // clouds (smoke on the volcano map)
  b.globalAlpha = P.cloud * (mapIdx === 2 ? .55 : .9); { let o = Math.round(((time * 5 + cam * .02) % W) / 2) * 2; b.drawImage(cloudT.c, 0, 0, LW, 100, -o, 6, W, 200); b.drawImage(cloudT.c, 0, 0, LW, 100, W - o, 6, W, 200); } b.globalAlpha = 1;
  updateFlyers(dt, P); drawFlyers(b);
  // far / mid with distance haze
  tile(b, M.L.far, SPEED.far, 0); fog(b, P.haze, P.hz * 2.0, 40);
  tile(b, M.L.mid, SPEED.mid, 0); fog(b, P.haze, P.hz * 1.2, 80);
  // drifting mist
  b.globalAlpha = M.mist * (.7 + .3 * (1 - P.night)); { const o = Math.round((time * 12 + cam * .3) % W); b.drawImage(mistT.c, -o, 150); b.drawImage(mistT.c, W - o, 150); } b.globalAlpha = 1;
  // god rays
  if (P.rays > .05 && sa > .1) { b.globalCompositeOperation = 'lighter'; for (let i = 0; i < 5; i++) { const a = P.rays * sa * .06; b.fillStyle = `rgba(255,236,170,${a})`; const sp = (i - 2) * 70 + Math.sin(time * .3 + i) * 12; b.beginPath(); b.moveTo(sx - 10 + i * 14, sy); b.lineTo(sx + 40 + i * 14, sy); b.lineTo(sx + 40 + sp * 3.4, GROUND); b.lineTo(sx - 60 + sp * 3.4, GROUND); b.closePath(); b.fill(); } b.globalCompositeOperation = 'source-over'; }
  tile(b, M.L.near, SPEED.near, 0);
  drawVines(b, M);
  tile(b, M.L.lane, SPEED.lane, 0);
  // low mist crossing the path
  b.globalAlpha = M.fogLow * (.6 + .4 * (1 - P.night)); { const o = Math.round((time * 18 + cam * 1.1) % W); b.drawImage(mistT.c, 0, 0, W, 180, -o, GROUND - 120, W, 150); b.drawImage(mistT.c, 0, 0, W, 180, W - o, GROUND - 120, W, 150); } b.globalAlpha = 1;
  tile(b, M.L.ground, SPEED.ground, 0);
  // time-of-day colour grade
  b.globalCompositeOperation = 'multiply'; b.fillStyle = rgbS([P.tint[0] * M.grade[0], P.tint[1] * M.grade[1], P.tint[2] * M.grade[2]]); b.fillRect(0, 0, W, H); b.globalCompositeOperation = 'source-over';
  drawLights(b, M, P);
  return P;
}
function rgbHex(a) { return '#' + [0, 1, 2].map(i => ('0' + Math.max(0, Math.min(255, Math.round(a[i]))).toString(16)).slice(-2)).join(''); }

// floating particles: fireflies / dust (jungle, swamp) and embers (gorge)
const parts = []; { const r = rng(33); for (let i = 0; i < 60; i++) parts.push({ x: r() * W, y: 120 + r() * 340, z: .3 + r() * .9, f: 1 + r() * 2, ph: r() * TAU, s: 2 + (r() * 2 | 0) }); }
function drawParticles(dt, scroll, M, P) {
  ctx.globalCompositeOperation = 'lighter';
  for (const p of parts) {
    p.x -= scroll * dt * (.25 + p.z * .6);
    if (M.parts === 'embers') { p.y -= (14 + p.z * 40) * dt; p.x += Math.sin(time * p.f + p.ph) * 14 * dt; if (p.y < 20) { p.y = GROUND + 40; } }
    else { p.y += Math.sin(time * p.f + p.ph) * 10 * dt; p.x += Math.cos(time * .6 + p.ph) * 6 * dt; }
    if (p.x < -10) p.x += W + 20; if (p.x > W + 10) p.x -= W + 20;
    let a, col;
    if (M.parts === 'embers') { a = .55 + .45 * Math.sin(time * 5 * p.f + p.ph); col = '#ffa43a'; }
    else if (P.night > .25) { a = P.night * (.35 + .65 * Math.abs(Math.sin(time * p.f + p.ph))); col = '#d2ff6a'; }
    else { a = .22 * (1 - P.night); col = '#fff3b8'; }
    if (a < .03) continue;
    ctx.globalAlpha = a * .4; ctx.drawImage(glow(col), p.x - 8, p.y - 8, 16, 16);
    ctx.globalAlpha = a; ctx.fillStyle = col; ctx.fillRect(p.x | 0, p.y | 0, p.s, p.s);
  }
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
}

/* ---------------------------------------------------------------
   5. THE GAME (flow is driven from play.js)
   --------------------------------------------------------------- */
let G = null;

function Jungle(canvas, o) {
  o = o || {};
  G = this; this.o = o;
  cv = canvas; ctx = cv.getContext('2d');
  const fit = () => {
    const r = cv.getBoundingClientRect(); if (!r.width || !r.height) return;
    const want = Math.max(.5, Math.min(2.5, Math.max(r.width / W, r.height / H) * (window.devicePixelRatio || 1)));
    const q = Math.round(want * 20) / 20;
    if (Math.abs(q - RS) < .001 && cv.width) return;
    RS = q; cv.width = Math.round(W * RS); cv.height = Math.round(H * RS);
    spr.c.width = cv.width; spr.c.height = cv.height;
  };
  fit(); this._fit = fit;
  if (window.ResizeObserver) { this._ro = new ResizeObserver(fit); this._ro.observe(cv); }
  this.heroId = o.hero === 'nova' ? 'nova' : 'codex';
  this.defs = (o.foes || [{ kind: 'zephyr' }]).map(f => Object.assign({ hits: 1, boss: false }, f));
  this.segs = (o.segments && o.segments.length) ? o.segments : [{ map: 0, phase: 0, count: this.defs.length }];
  this.tasks = []; this.bolts = []; this.hero = null; this.en = null;
  this.kills = 0; this.seg = 0; this.scrollNow = 0; this.shake = 0;
  this.fadeA = 1; this.fadeTgt = 1; this.frameN = 0; this.alive = true; this.loaded = false;
  cam = 0; time = 0; mapIdx = this.segs[0].map; timeT = timeTarget = this.segs[0].phase;
  this.ready = this._load();
  this._last = performance.now();
  const loop = (ts) => {
    if (!this.alive) return;
    const dt = Math.min(.05, (ts - this._last) / 1000); this._last = ts;
    this._update(dt); this._render(dt);
    this._raf = requestAnimationFrame(loop);
  };
  this._raf = requestAnimationFrame(loop);
}
const J = Jungle.prototype;

J._load = async function () {
  const M = window.JUNGLE_MANIFEST, ids = new Set([this.heroId].concat(this.defs.map(d => d.kind)));
  const sub = Object.assign({}, M, { characters: M.characters.filter(c => ids.has(c.id)) });
  this.sprites = await CodeQuestSprites.load(sub, 'assets/jungle/');
  this.char = {}; this.fx = {};
  for (const c of sub.characters) {
    this.char[c.id] = c; this.fx[c.id] = {};
    for (const [n, d] of Object.entries(c.fx || {})) { try { this.fx[c.id][n] = { img: await this.sprites.loadFx(c.id, n), w: d.w, h: d.h }; } catch (e) { /* ignore */ } }
  }
  for (const s of this.segs) { getMap(s.map); await new Promise(r => setTimeout(r, 0)); }
  const d = this.char[this.heroId];
  this.hero = { id: this.heroId, def: d, actor: this.sprites.actor(this.heroId), scale: TARGET_H[this.heroId] / d.hitbox.h, x: HERO_X, dead: false };
  this.hero.actor.play('idle');
  this.loaded = true;
};

J.sfx = function (n) { if (this.o.sfx) this.o.sfx(n); };
J._loop = function (fn) { return new Promise(res => this.tasks.push({ fn, res })); };   // fn(dt) -> true when done
J._wait = function (s) { let t = 0; return this._loop(dt => (t += dt) >= s); };
J._segStart = function (i) { let a = 0; for (let k = 0; k < i; k++) a += this.segs[k].count; return a; };
J._segEnd = function (i) { return this._segStart(i) + this.segs[i].count; };
J._setTime = function () { const s = this.segs[this.seg]; timeTarget = s.phase + .1 * (this.kills - this._segStart(this.seg)); };
J._place = function (banner) {
  const s = this.segs[this.seg], a = this._segStart(this.seg);
  if (this.o.onPlace) this.o.onPlace({ seg: this.seg, map: s.map, mapName: MAP_NAMES[s.map], phase: PHASES[((s.phase % 4) + 4) % 4].n, from: a + 1, to: a + s.count, banner: !!banner });
};

J._spawnFoe = function () {
  const d = this.defs[this.kills], def = this.char[d.kind];
  this.en = { id: d.kind, def, actor: this.sprites.actor(d.kind), scale: TARGET_H[d.kind] / def.hitbox.h, x: W + 140 + (d.boss ? 60 : 0), alpha: 1, dead: false, hp: d.hits, max: d.hits, boss: !!d.boss, name: d.name || '', lv: d.lv || 0 };
  this.en.actor.play('walk');
};
J._walkIn = function () {
  const en = this.en, hero = this.hero;
  if (en.boss) { this.shake = .45; this.sfx('boss'); }
  return this._loop(dt => {
    if (en.x > ENEMY_X) en.x -= 150 * dt;
    this.scrollNow = RUN_SPEED * clamp((en.x - ENEMY_X) / 300, 0, 1);
    hero.actor.play(this.scrollNow > 40 ? 'run' : 'idle');
    if (en.x <= ENEMY_X) { en.x = ENEMY_X; en.actor.play('idle'); hero.actor.play('idle'); return true; }
    return false;
  });
};
J._bolt = function (from) {
  const A = from === 'hero' ? this.hero : this.en;
  return new Promise(res => {
    if (!A) { res(); return; }
    const names = Object.keys(A.def.fx || {}).filter(k => k !== 'muzzle_flash' && k !== 'fire_pillar');
    const fx = this.fx[A.id] && this.fx[A.id][names[0]];
    if (!fx) { res(); return; }
    const hb = A.def.hitbox.h * A.scale, y = FEET - hb * .58, sc = from === 'hero' ? 1.5 : (A.boss ? 1.6 : 1.3);
    this.bolts.push(from === 'hero'
      ? { from, x: this.hero.x + 62, y, vx: 820, img: fx.img, w: fx.w * sc, h: fx.h * sc, spin: this.heroId === 'nova', hit: res }
      : { from, x: A.x - (A.def.hitbox.w * A.scale * .5 + 34), y, vx: -640, img: fx.img, w: fx.w * sc, h: fx.h * sc, spin: false, hit: res });
  });
};

// ---------- story beats ----------
J.intro = async function () {
  await this.ready; if (!this.alive) return;
  this.fadeA = 1; this.fadeTgt = 1; this._place(true);
  await this._wait(1.9);
  this._place(false); this.fadeTgt = 0;
  this._setTime(); this._spawnFoe(); this.hero.actor.play('run');
  await this._walkIn();
};

// right answer
J.hit = async function () {
  await this.ready;
  const en = this.en, hero = this.hero; if (!en || en.dead) return 'clear';
  hero.actor.play('attack', true); this.sfx('shoot');
  await this._loop(() => hero.actor.frame >= 3 || hero.actor.finished);
  await this._bolt('hero');
  en.hp--; this.shake = .12; this.sfx('hit');
  if (en.hp > 0) { en.actor.play('hurt', true); await this._wait(.5); if (!en.dead) en.actor.play('idle'); return 'hit'; }
  en.actor.play('hurt', true); await this._wait(.3);
  en.actor.play('die', true); en.dead = true; this.sfx('kill'); if (en.boss) this.shake = .5;
  await this._loop(() => en.actor.finished); await this._wait(.5);
  this.en = null; this.bolts.length = 0; this.kills++;
  return this.kills >= this.defs.length ? 'clear' : 'kill';
};

// after a 'kill': (new map if the segment is over) and the next enemy walks in
J.advance = async function () {
  await this.ready; const hero = this.hero;
  if (this.kills >= this.defs.length) return;
  if (this.kills >= this._segEnd(this.seg)) await this._travel(); else this._setTime();
  this._spawnFoe(); hero.actor.play('run');
  await this._walkIn();
};
J._travel = async function () {
  const hero = this.hero;
  this.seg++; this._setTime();                 // the sun starts moving while the hero runs off
  hero.actor.play('run');
  await this._loop(dt => { this.scrollNow = RUN_SPEED; hero.x += (150 + (hero.x - HERO_X) * 1.1) * dt; return hero.x > W + 160; });
  this.fadeTgt = 1; await this._loop(() => this.fadeA >= .995);
  mapIdx = this.segs[this.seg].map; getMap(mapIdx);
  hero.x = -120; this.en = null; this.bolts.length = 0;
  this._place(true); this.sfx('portal');
  await this._wait(2.0);
  this._place(false); this.fadeTgt = 0; hero.actor.play('run');
  await this._loop(dt => { this.scrollNow = RUN_SPEED; hero.x += 300 * dt; if (hero.x >= HERO_X) { hero.x = HERO_X; return true; } return false; });
};

// wrong answer
J.miss = async function () {
  await this.ready;
  const en = this.en, hero = this.hero; if (!en || hero.dead) return;
  en.actor.play('shoot', true); this.sfx('foeshoot');
  await this._wait(.14);
  await this._bolt('enemy');
  this.shake = .3; this.sfx('hurt'); hero.actor.play('hurt', true);
  await this._wait(.75);
  if (!hero.dead) hero.actor.play('idle');
  if (this.en && !this.en.dead) this.en.actor.play('idle');
};
J.defeat = async function () { await this.ready; this.hero.dead = true; this.hero.actor.play('die', true); this.sfx('die'); await this._wait(1.3); };
J.revive = function () { if (!this.hero) return; this.hero.dead = false; this.hero.actor.play('idle'); };

// everything cleared: the hero runs into the sunrise
J.finish = async function () {
  await this.ready; this.sfx('portal');
  timeTarget = (Math.floor(timeT / 4) + 1) * 4;
  this.hero.actor.play('run'); let t = 0;
  await this._loop(dt => { this.scrollNow = RUN_SPEED * .8; return (t += dt) >= 3.4; });
};

// refresh / reopened tab: carry on after n correct answers (no animation)
J.resume = async function (n) {
  await this.ready;
  let left = n; this.kills = 0;
  for (const d of this.defs) { if (left >= d.hits) { left -= d.hits; this.kills++; } else break; }
  let acc = 0; this.seg = this.segs.length - 1;
  for (let i = 0; i < this.segs.length; i++) { if (this.kills < acc + this.segs[i].count) { this.seg = i; break; } acc += this.segs[i].count; }
  mapIdx = this.segs[this.seg].map; getMap(mapIdx);
  this._setTime(); timeT = timeTarget; cam = 400 + this.kills * 220;
  this.hero.x = HERO_X; this.hero.actor.play('idle'); this.fadeA = this.fadeTgt = 0;
  if (this.kills < this.defs.length) { this._spawnFoe(); this.en.x = ENEMY_X; this.en.hp = this.en.max - left; this.en.actor.play('idle'); }
  this._place(false);
};

J.destroy = function () { this.alive = false; if (this._ro) this._ro.disconnect(); cancelAnimationFrame(this._raf); this.tasks.forEach(t => t.res()); this.tasks = []; this.bolts.forEach(b => b.hit && b.hit()); this.bolts = []; if (G === this) G = null; };

// ---------- per-frame update ----------
J._update = function (dt) {
  time += dt;
  if (!this.loaded) return;
  this.frameN++;
  timeT += (timeTarget - timeT) * (1 - Math.exp(-dt * .7));
  this.fadeA += clamp(this.fadeTgt - this.fadeA, -dt * 1.8, dt * 1.8);
  this.scrollNow = 0;
  for (let i = this.tasks.length - 1; i >= 0; i--) { const t = this.tasks[i]; if (t.fn(dt)) { this.tasks.splice(i, 1); t.res(); } }
  cam += this.scrollNow * dt;
  const hero = this.hero, en = this.en;
  hero.actor.update(dt); if (en) en.actor.update(dt);
  if (hero.actor.anim === 'attack' && hero.actor.finished && !hero.dead) hero.actor.play('idle');
  for (let i = this.bolts.length - 1; i >= 0; i--) {
    const b = this.bolts[i]; b.x += b.vx * dt;
    if (b.from === 'hero' && en && b.x >= en.x - (14 + en.def.hitbox.w * en.scale * .5)) { this.bolts.splice(i, 1); b.hit(); }
    else if (b.from === 'enemy' && b.x <= hero.x + 24) { this.bolts.splice(i, 1); b.hit(); }
    else if (b.x < -80 || b.x > W + 80) { this.bolts.splice(i, 1); b.hit(); }
  }
  if (en && en.dead && en.actor.finished) en.alpha = Math.max(0, en.alpha - dt * 1.6);
  if (this.shake > 0) this.shake -= dt;
};

// ---------- drawing ----------
J._drawActor = function (c, A, x, flip, alpha) {
  if (!A) return;
  c.globalAlpha = alpha === undefined ? 1 : alpha;
  A.actor.draw(c, x, FEET, { flip, scale: A.scale });
  c.globalAlpha = 1;
};
J._render = function (dt) {
  ctx.setTransform(RS, 0, 0, RS, 0, 0); ctx.imageSmoothingEnabled = smoothOn(); ctx.imageSmoothingQuality = 'high';
  spr.x.setTransform(RS, 0, 0, RS, 0, 0); spr.x.imageSmoothingQuality = 'high';
  if (!this.loaded) {
    ctx.fillStyle = '#0b0e22'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#9aa3d1'; ctx.font = '16px monospace'; ctx.textAlign = 'center'; ctx.fillText('Loading map...', W / 2, H / 2);
    return;
  }
  const P = renderWorld(dt, this.scrollNow), M = getMap(mapIdx), hero = this.hero, en = this.en;
  ctx.save();
  if (this.shake > 0) ctx.translate((Math.random() - .5) * 10, (Math.random() - .5) * 8);
  ctx.drawImage(bg.c, 0, 0);
  const sh = (x, w) => { ctx.fillStyle = 'rgba(0,0,0,.32)'; ctx.beginPath(); ctx.ellipse(x, FEET - 2, w, 8, 0, 0, TAU); ctx.fill(); };
  sh(hero.x, 40);
  if (en && en.alpha > 0) { ctx.globalAlpha = en.alpha; sh(en.x, en.def.hitbox.w * en.scale * .8); ctx.globalAlpha = 1; }
  const s = spr.x; s.clearRect(0, 0, W, H);
  this._drawActor(s, hero, hero.x, false);
  if (en) this._drawActor(s, en, en.x, true, en.alpha);
  s.globalCompositeOperation = 'source-atop'; s.globalAlpha = P.sa; s.fillStyle = rgbS(P.spr); s.fillRect(0, 0, W, H); s.globalAlpha = 1; s.globalCompositeOperation = 'source-over';
  ctx.drawImage(spr.c, 0, 0, W, H);
  for (const b of this.bolts) {
    ctx.save(); ctx.imageSmoothingEnabled = false; ctx.translate(b.x, b.y);
    if (b.from === 'enemy') ctx.scale(-1, 1);
    if (b.spin) ctx.rotate(time * 18);
    ctx.drawImage(b.img, -b.w / 2, -b.h / 2, b.w, b.h); ctx.restore();
  }
  tile(ctx, M.L.fg, SPEED.fg, 0);
  drawParticles(dt, this.scrollNow, M, P);
  // boss health bar (name + hearts of the fight)
  if (en && en.boss && !en.dead && en.x < W + 20) {
    const bw = 300, bx = (W - bw) / 2;
    ctx.fillStyle = 'rgba(8,10,24,.78)'; ctx.fillRect(bx - 4, 12, bw + 8, 30);
    ctx.fillStyle = '#3a0f18'; ctx.fillRect(bx, 16, bw, 11);
    ctx.fillStyle = '#ff5470'; ctx.fillRect(bx, 16, bw * Math.max(0, en.hp) / en.max, 11);
    ctx.fillStyle = '#fff'; ctx.font = '700 11px monospace'; ctx.textAlign = 'center'; ctx.fillText(en.name || 'BOSS', W / 2, 38);
  } else if (en && !en.dead && en.max > 1 && en.x <= W) {
    const bw = 60, bx = en.x - bw / 2, by = FEET - en.def.hitbox.h * en.scale - 18;
    ctx.fillStyle = 'rgba(0,0,0,.65)'; ctx.fillRect(bx - 1, by - 1, bw + 2, 8); ctx.fillStyle = '#ff5470'; ctx.fillRect(bx, by, bw * en.hp / en.max, 6);
    if (en.name) { ctx.font = '700 11px monospace'; ctx.textAlign = 'center'; const tx = (en.lv ? 'LV ' + en.lv + '  ' : '') + en.name.toUpperCase(); ctx.fillStyle = 'rgba(0,0,0,.65)'; ctx.fillRect(en.x - ctx.measureText(tx).width / 2 - 4, by - 17, ctx.measureText(tx).width + 8, 14); ctx.fillStyle = ['#fff', '#d8f5ff', '#9fe3ff', '#ffe08a', '#ffb070', '#ff8a8a'][Math.min(5, en.lv || 0)]; ctx.fillText(tx, en.x, by - 6); }
  }
  if (this.fadeA > .003) { ctx.fillStyle = `rgba(4,8,6,${this.fadeA})`; ctx.fillRect(0, 0, W, H); }
  ctx.restore();
  if (this.o.onClock && (this.frameN & 7) === 0) {
    this.o.onClock({ name: PHASES[((Math.round(timeT) % 4) + 4) % 4].n, top: rgbS(P.top), bot: rgbS(P.bot) });
  }
};

Jungle.MAPS = MAP_NAMES;
Jungle.PHASES = PHASES.map(p => p.n);
window.Jungle = Jungle;
})();
