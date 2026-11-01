/* =========================================================
   CodeNPlay - QUEST engine (story-mode battle scenes)
   ---------------------------------------------------------
   Uses the CodeQuest asset pack (assets/pack): heroes Codex & Nova,
   villain Zephyr, boss Titan, 5 parallax maps.

   The learner's code decides what happens:
     hit()   correct answer  -> hero shoots, the current enemy takes a hit
                                (an enemy with several hits = a boss)
     miss()  wrong answer    -> the enemy shoots back, hero is hurt
     finish()                -> portal opens, hero walks through it
   ========================================================= */
(function () {
  const W = 640, H = 360, FEET = 316, HS = 1.4;       // logical size, feet line, hero scale
  const BASE = 'assets/pack/';
  const rnd = (a, b) => a + Math.random() * (b - a);
  const ease = (p) => 1 - Math.pow(1 - p, 3);

  // anims: [row, frames, fps, loop]
  const A = (r) => ({ idle: [0, r.idle, 6, 1], run: [1, 4, 10, 1], jump: [2, r.jump, 8, 0], shoot: [3, r.shoot, 12, 0], hurt: [4, 3, 10, 0], die: [5, r.die, 7, 0] });
  const CHARS = {
    codex: { name: 'Codex', role: 'Hero', file: 'heroes/codex/codex_atlas_2x.png', portrait: 'heroes/codex/portrait.png', cell: [70, 94], anchor: [35, 92], anims: A({ idle: 4, jump: 3, shoot: 3, die: 4 }), bolt: 'heroes/codex/fx/energy_bolt.png', flash: 'heroes/codex/fx/muzzle_flash.png', gun: [30, 56], col: '#58c8ff', blurb: 'Balanced coder. Energy-bolt blaster.' },
    nova: { name: 'Nova', role: 'Hero', file: 'heroes/nova/nova_atlas_2x.png', portrait: 'heroes/nova/portrait.png', cell: [72, 88], anchor: [36, 86], anims: A({ idle: 4, jump: 4, shoot: 3, die: 4 }), bolt: 'heroes/nova/fx/shuriken.png', spin: true, gun: [26, 52], col: '#ff7ad9', blurb: 'Fast ninja. Throws shuriken.' },
    zephyr: { name: 'Zephyr', role: 'Villain', file: 'villains/zephyr/zephyr_atlas_2x.png', portrait: 'villains/zephyr/portrait.png', cell: [66, 74], anchor: [33, 72], anims: A({ idle: 4, jump: 3, shoot: 2, die: 4 }), bolt: 'villains/zephyr/fx/magic_bolt.png', gun: [26, 46], col: '#7dff6a' },
    titan: { name: 'Titan', role: 'Boss', file: 'bosses/titan/titan_atlas_2x.png', portrait: 'bosses/titan/portrait.png', cell: [78, 84], anchor: [39, 82], anims: A({ idle: 3, jump: 3, shoot: 2, die: 3 }), bolt: 'bosses/titan/fx/flame_burst.png', gun: [34, 52], col: '#ff8a3d' },
  };
  const MAPS = {
    1: { name: 'Syntax Forest', file: 'level1_forest' }, 2: { name: 'Crystal Cave', file: 'level2_cave' }, 3: { name: 'Castle Sunset', file: 'level3_castle' },
    4: { name: 'Lava Arena', file: 'level4_boss' }, 5: { name: 'Aurora Core', file: 'level5_final' },
  };

  // ---------- image cache ----------
  const cache = {};
  function img(path) {
    if (cache[path]) return cache[path];
    const p = new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = BASE + path; });
    return (cache[path] = p);
  }
  const tintCache = {};
  function tinted(i, key, hue) {
    if (!hue || !i) return i;
    const k = key + ':' + hue; if (tintCache[k]) return tintCache[k];
    const c = document.createElement('canvas'); c.width = i.naturalWidth; c.height = i.naturalHeight;
    const x = c.getContext('2d');
    if (!('filter' in x)) return i;
    x.filter = 'hue-rotate(' + hue + 'deg) saturate(1.15)'; x.drawImage(i, 0, 0);
    return (tintCache[k] = c);
  }

  function Quest(canvas, opts) {
    this.cv = canvas; this.ctx = canvas.getContext('2d'); this.o = opts || {};
    this.time = 0; this.cam = 0; this.shake = 0; this.flash = 0;
    this.tasks = []; this.parts = []; this.floats = []; this.bolts = [];
    this.heroId = CHARS[this.o.hero] ? this.o.hero : 'codex';
    this.mapNo = MAPS[this.o.map] ? this.o.map : 1;
    this.alive = true; this._last = performance.now(); this._cw = 0; this.k = 1;
    this.imgs = {}; this.layers = {};
    this.ready = this._load();
    this.reset();
    const loop = (now) => {
      if (!this.alive) return;
      const dt = Math.min(0.05, (now - this._last) / 1000); this._last = now;
      this.checkSize(); this.update(dt); this.render();
      this._raf = requestAnimationFrame(loop);
    };
    this._raf = requestAnimationFrame(loop);
  }
  const P = Quest.prototype;

  P._load = async function () {
    const m = MAPS[this.mapNo];
    const kinds = ['sky', 'far', 'mid', 'ground'];
    const want = [this.heroId, 'zephyr', 'titan'];
    const [layerImgs, charImgs, bolts] = await Promise.all([
      Promise.all(kinds.map((k) => img('backgrounds/' + m.file + '_' + k + '.png'))),
      Promise.all(want.map((id) => img(CHARS[id].file))),
      Promise.all(want.map((id) => (CHARS[id].bolt ? img(CHARS[id].bolt) : null))),
    ]);
    kinds.forEach((k, i) => (this.layers[k] = layerImgs[i]));
    want.forEach((id, i) => { this.imgs[id] = charImgs[i]; this.imgs[id + '.bolt'] = bolts[i]; });
    if (CHARS[this.heroId].flash) this.imgs.flash = await img(CHARS[this.heroId].flash);
    this.heart = await img('ui/heart_full.png');
    this.loaded = true;
  };

  P.checkSize = function () {
    const r = this.cv.getBoundingClientRect();
    if (Math.abs(r.width - this._cw) < 1) return;
    this._cw = r.width;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.cv.width = Math.round(r.width * dpr); this.cv.height = Math.round(r.width * (H / W) * dpr);
    this.k = this.cv.width / W;
  };

  // foes: [{ kind:'zephyr'|'titan', hue, scale, hits, name }]
  P.setFoes = function (list) {
    this.foeDefs = list;
    this.foes = list.map((d) => ({ kind: d.kind, hue: d.hue || 0, scale: d.scale || 1, hp: d.hits || 1, max: d.hits || 1, name: d.name || '', x: 99999, anim: 'idle', t: rnd(0, 2), alive: true, fade: 1, boss: !!d.boss }));
  };
  P.reset = function () {
    this.tasks = []; this.parts = []; this.floats = []; this.bolts = []; this.shake = 0; this.flash = 0; this.portal = null;
    this.hero = { x: 120, anim: 'idle', t: 0, face: 1, alpha: 1, scale: 1, dead: false };
    this.cam = 0; this.banner = null; this.setFoes(this.o.foes || [{ kind: 'zephyr' }]);
    this.kills = 0;
  };

  // ---------- tiny promise animation system ----------
  P.anim = function (dur, fn) { return new Promise((res) => this.tasks.push({ t: 0, dur: Math.max(0.001, dur), fn, res })); };
  P.wait = function (s) { return this.anim(s, () => {}); };
  P.sfx = function (n) { if (this.o.sfx) this.o.sfx(n); };
  P.setHero = function (a) { if (this.hero.anim !== a) { this.hero.anim = a; this.hero.t = 0; } };
  P.setFoe = function (f, a) { if (f.anim !== a) { f.anim = a; f.t = 0; } };
  P.burst = function (x, y, c, n, f) { for (let i = 0; i < n; i++) this.parts.push({ x, y, vx: rnd(-130, 130) * (f || 1), vy: rnd(-210, -30) * (f || 1), life: rnd(0.4, 0.9), c, s: rnd(2, 5) }); };
  P.float = function (x, y, text, color) { this.floats.push({ x, y, text, color, life: 1 }); };
  P.cur = function () { return this.foes.find((f) => f.alive); };
  P.footY = FEET;

  P.runHero = async function (toX) {
    const h = this.hero, from = h.x, d = Math.abs(toX - from);
    if (d < 2) return;
    this.setHero('run');
    await this.anim(d / 190, (p) => { h.x = from + (toX - from) * p; });
    this.setHero('idle');
  };
  P.gap = function (f) { return f.boss ? 300 : 330; };
  P.runFoeIn = async function (f, toX) {
    const from = f.x; this.setFoe(f, 'run');
    await this.anim(Math.abs(from - toX) / 170, (p) => { f.x = from + (toX - from) * p; });
    this.setFoe(f, 'idle');
  };
  P.spawnFoe = function (f, heroTargetX) { f.x = Math.max(f.x < 90000 ? f.x : 0, heroTargetX - 150 + W + 90 * f.scale); };

  // ---------- story beats ----------
  P.intro = async function () {
    await this.ready; this.reset(); this.setHero('idle');
    await this.wait(0.35);
    const f = this.foes[0]; this.spawnFoe(f, this.hero.x);
    if (f.boss) { this.shake = 7; this.sfx('boss'); }
    await this.runFoeIn(f, this.hero.x + this.gap(f));
  };

  P.fireBolt = function (fromHero, target) {
    const side = fromHero ? this.hero : target;
    const def = CHARS[fromHero ? this.heroId : target.kind];
    const sc = fromHero ? HS : HS * 1.3 * target.scale;
    const dir = fromHero ? 1 : -1;
    return { x: side.x + dir * def.gun[0] * sc, y: FEET - def.gun[1] * sc, dir, key: fromHero ? this.heroId : target.kind, hero: fromHero, rot: 0 };
  };
  P.flyBolt = async function (b, toX) {
    this.bolts.push(b); const from = b.x, d = Math.abs(toX - from);
    await this.anim(d / (b.hero ? 760 : 430), (p) => { b.x = from + (toX - from) * p; b.rot += 0.5; });
    this.bolts = this.bolts.filter((x) => x !== b);
  };

  // correct answer
  P.hit = async function () {
    await this.ready;
    const f = this.cur(), h = this.hero; if (!f) return 'clear';
    this.setHero('shoot'); this.sfx('shoot');
    await this.wait(0.16);
    const b = this.fireBolt(true, f);
    this.flashT = 0.12;
    await this.flyBolt(b, f.x - 14);
    f.hp--; this.sfx('hit');
    const fy = FEET - 48 * HS * f.scale;
    this.burst(f.x, fy, '#fff', 8); this.burst(f.x, fy, CHARS[this.heroId].col, 10);
    this.shake = f.hp <= 0 ? (f.boss ? 10 : 5) : 3;
    this.float(f.x, FEET - 100 * HS * f.scale, f.hp <= 0 ? (f.boss ? 'BOSS DOWN!' : '+10 XP') : (f.boss ? 'HIT!' : '+10 XP'), '#ffcf4a');
    if (f.hp > 0) {
      this.setFoe(f, 'hurt'); await this.wait(0.35); this.setFoe(f, 'idle'); this.setHero('idle');
      return 'hit';
    }
    f.alive = false; this.kills++; this.sfx('kill'); this.setFoe(f, 'die');
    this.burst(f.x, fy, CHARS[f.kind].col, f.boss ? 50 : 24);
    if (f.boss) this.flash = 0.5;
    await this.wait(0.55);
    f.fade = 1; const t0 = this.time;
    await this.anim(0.4, (p) => { f.fade = 1 - p; });
    this.setHero('idle');
    // next foe walks in while the hero advances
    const nx = this.cur();
    if (nx) {
      const toX = h.x + 250; this.spawnFoe(nx, toX);
      if (nx.boss) { this.shake = 7; this.sfx('boss'); }
      await Promise.all([this.runHero(toX), this.runFoeIn(nx, toX + this.gap(nx))]);
      return 'kill';
    }
    return 'clear';
  };

  // wrong answer
  P.miss = async function () {
    await this.ready;
    const f = this.cur(), h = this.hero; if (!f || h.dead) return;
    this.setFoe(f, 'shoot'); this.sfx('foeshoot');
    await this.wait(0.2);
    const b = this.fireBolt(false, f);
    await this.flyBolt(b, h.x + 14);
    this.setFoe(f, 'idle'); this.setHero('hurt'); this.sfx('hurt');
    this.shake = 7; this.float(h.x, FEET - 130 * HS, '-1', '#ff6b81'); this.burst(h.x, FEET - 60 * HS, '#ff6b81', 14);
    await this.wait(0.45);
    if (!h.dead) this.setHero('idle');
  };
  P.defeat = async function () { this.hero.dead = true; this.setHero('die'); this.sfx('die'); await this.wait(0.9); };
  P.revive = function () { this.hero.dead = false; this.setHero('idle'); this.hero.alpha = 1; };

  // level cleared: portal opens, hero jumps in
  P.finish = async function () {
    await this.ready;
    const h = this.hero;
    this.portal = { x: h.x + 380, open: 0 };
    this.sfx('portal');
    await this.anim(0.9, (p) => { this.portal.open = ease(p); });
    await this.runHero(this.portal.x - 18);
    this.sfx('enter');
    this.burst(this.portal.x, FEET - 60, '#b9a2ff', 30);
    await this.anim(0.7, (p) => { h.x = this.portal.x - 18 + 18 * p; h.alpha = 1 - p; h.scale = 1 - 0.5 * p; });
    this.flash = 1;
    await this.wait(0.5);
  };

  // ---------- update ----------
  P.update = function (dt) {
    this.time += dt;
    for (let i = this.tasks.length - 1; i >= 0; i--) {
      const t = this.tasks[i]; t.t += dt;
      const p = Math.min(1, t.t / t.dur); t.fn(p, dt);
      if (p >= 1) { this.tasks.splice(i, 1); t.res(); }
    }
    this.hero.t += dt;
    if (this.foes) this.foes.forEach((f) => { f.t += dt; });
    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 22);
    if (this.flash > 0) this.flash = Math.max(0, this.flash - dt * 1.4);
    if (this.flashT > 0) this.flashT -= dt;
    this.parts.forEach((p) => { p.vy += 560 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; });
    this.parts = this.parts.filter((p) => p.life > 0);
    this.floats.forEach((f) => { f.y -= 28 * dt; f.life -= dt * 0.8; });
    this.floats = this.floats.filter((f) => f.life > 0);
    const want = Math.max(0, this.hero.x - 150);
    this.cam += (want - this.cam) * Math.min(1, dt * 5);
  };

  // ---------- render ----------
  P.drawLayer = function (c, im, par) {
    if (!im) return;
    const per = W, off = (((this.cam * par) % per) + per) % per;
    for (let x = -off; x < W; x += per) c.drawImage(im, x, 0, per + 1, H);
  };
  P.actor = function (c, id, source, anim, t, x, scale, flip, alpha) {
    const d = CHARS[id], im = source; if (!im) return;
    const a = d.anims[anim] || d.anims.idle, n = a[1], idx = a[3] ? Math.floor(t * a[2]) % n : Math.min(n - 1, Math.floor(t * a[2]));
    const cw = d.cell[0] * 2, ch = d.cell[1] * 2, s = scale * 0.5;
    c.save(); c.globalAlpha = Math.max(0, alpha); c.translate(x, FEET); if (flip) c.scale(-1, 1);
    c.drawImage(im, idx * cw, a[0] * ch, cw, ch, -d.anchor[0] * 2 * s, -d.anchor[1] * 2 * s, cw * s, ch * s);
    c.restore();
  };

  P.render = function () {
    const c = this.ctx, k = this.k || 1;
    c.setTransform(k, 0, 0, k, 0, 0);
    c.fillStyle = '#0b0e22'; c.fillRect(0, 0, W, H);
    if (!this.loaded) { c.fillStyle = '#9aa3d1'; c.font = '12px "Press Start 2P", monospace'; c.textAlign = 'center'; c.fillText('Loading map...', W / 2, H / 2); return; }
    const sx = this.shake ? rnd(-this.shake, this.shake) : 0, sy = this.shake ? rnd(-this.shake, this.shake) : 0;
    c.save(); c.translate(sx, sy);
    c.imageSmoothingEnabled = false;
    this.drawLayer(c, this.layers.sky, 0.03); this.drawLayer(c, this.layers.far, 0.14);
    this.drawLayer(c, this.layers.mid, 0.4); this.drawLayer(c, this.layers.ground, 1);
    c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
    const cam = this.cam;
    if (this.portal) this.drawPortal(c, this.portal.x - cam, this.portal.open);
    // foes (far to near)
    this.foes.slice().sort((a, b) => a.x - b.x).forEach((f) => {
      const x = f.x - cam; if (x < -160 || x > W + 160) return;
      const sc = HS * 1.3 * f.scale;
      c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(x, FEET + 2, 22 * f.scale, 5, 0, 0, 7); c.fill();
      const im = tinted(this.imgs[f.kind], f.kind, f.hue);
      this.actor(c, f.kind, im, f.anim, f.t, x, sc, true, f.alive ? 1 : f.fade);
      if (f.alive && f.x < cam + W) {
        const top = FEET - 80 * sc * 0.78, w = 44 * Math.min(1.6, f.scale);
        if (f.max > 1) { c.fillStyle = 'rgba(0,0,0,.65)'; c.fillRect(x - w / 2 - 1, top - 1, w + 2, 7); c.fillStyle = '#ff5470'; c.fillRect(x - w / 2, top, w * f.hp / f.max, 5); }
      }
    });
    const h = this.hero, hx = h.x - cam;
    c.fillStyle = 'rgba(0,0,0,.32)'; c.beginPath(); c.ellipse(hx, FEET + 2, 24 * h.scale, 5, 0, 0, 7); c.fill();
    this.actor(c, this.heroId, this.imgs[this.heroId], h.anim, h.t, hx, HS * h.scale, h.face < 0, h.alpha);
    if (this.flashT > 0 && this.imgs.flash) { const fl = this.imgs.flash, g = CHARS[this.heroId].gun; c.drawImage(fl, hx + g[0] * HS - 6, FEET - g[1] * HS - fl.height * 0.45, fl.width * 0.9, fl.height * 0.9); }
    this.bolts.forEach((b) => {
      const im = this.imgs[b.key + '.bolt']; if (!im) return;
      c.save(); c.translate(b.x - cam, b.y); const d = CHARS[b.key];
      if (d.spin) c.rotate(b.rot); else if (b.dir < 0) c.scale(-1, 1);
      c.shadowColor = d.col; c.shadowBlur = 12; const s = b.hero ? 0.9 : 0.8;
      c.drawImage(im, -im.width * s / 2, -im.height * s / 2, im.width * s, im.height * s); c.restore();
    });
    this.parts.forEach((p) => { c.globalAlpha = Math.max(0, p.life); c.fillStyle = p.c; c.fillRect(p.x - cam, p.y, p.s, p.s); }); c.globalAlpha = 1;
    c.font = '700 13px "Press Start 2P", monospace'; c.textAlign = 'center';
    this.floats.forEach((f) => { c.globalAlpha = Math.max(0, f.life); c.fillStyle = '#10122b'; c.fillText(f.text, f.x - cam + 1, f.y + 1); c.fillStyle = f.color; c.fillText(f.text, f.x - cam, f.y); }); c.globalAlpha = 1;
    c.restore();
    // boss bar
    const boss = this.foes.find((f) => f.boss && f.alive && f.x < this.cam + W + 50);
    if (boss) {
      const bw = 300, bx = (W - bw) / 2; c.fillStyle = 'rgba(0,0,0,.7)'; c.fillRect(bx - 3, 10, bw + 6, 24);
      c.fillStyle = '#3a0f18'; c.fillRect(bx, 13, bw, 10); c.fillStyle = '#ff5470'; c.fillRect(bx, 13, bw * (this.bossHp ? this.bossHp() : boss.hp / boss.max), 10);
      c.fillStyle = '#fff'; c.font = '8px "Press Start 2P", monospace'; c.fillText(boss.name, W / 2, 31);
    }
    if (this.flash > 0) { c.fillStyle = 'rgba(255,255,255,' + Math.min(1, this.flash) + ')'; c.fillRect(0, 0, W, H); }
    const v = c.createRadialGradient(W / 2, H / 2, 170, W / 2, H / 2, 420); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.35)'); c.fillStyle = v; c.fillRect(0, 0, W, H);
  };
  P.bossHp = function () {
    const bs = this.foes.filter((f) => f.boss); if (!bs.length) return 0;
    return bs.reduce((s, f) => s + Math.max(0, f.hp), 0) / bs.reduce((s, f) => s + f.max, 0);
  };

  P.drawPortal = function (c, x, o) {
    if (x < -100 || x > W + 100) return;
    const t = this.time, cy = FEET - 62;
    c.save(); c.translate(x, cy); c.scale(o, o);
    const g = c.createRadialGradient(0, 0, 4, 0, 0, 62); g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(0.35, 'rgba(185,162,255,.9)'); g.addColorStop(1, 'rgba(124,92,255,0)');
    c.fillStyle = g; c.beginPath(); c.ellipse(0, 0, 38, 62, 0, 0, 7); c.fill();
    for (let i = 0; i < 4; i++) { c.strokeStyle = i % 2 ? 'rgba(255,207,74,.9)' : 'rgba(124,92,255,.95)'; c.lineWidth = 3; c.beginPath(); c.ellipse(0, 0, 18 + i * 6, 46 + i * 4, 0, t * 3 + i, t * 3 + i + 3.8); c.stroke(); }
    c.restore();
  };

  P.destroy = function () { this.alive = false; cancelAnimationFrame(this._raf); this.tasks.forEach((t) => t.res()); this.tasks = []; };

  Quest.CHARS = CHARS; Quest.MAPS = MAPS; Quest.preload = (ids) => Promise.all((ids || []).map((i) => img(CHARS[i].file)));
  window.Quest = Quest;
})();
