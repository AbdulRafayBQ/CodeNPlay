/* CodeQuest sprite helper — works with manifest.json / manifest.js
 *
 *   const sprites = await CodeQuestSprites.load('./manifest.json');   // or use window.CODEQUEST_MANIFEST
 *   const hero = sprites.actor('codex');            // 'nova' | 'zephyr' | 'titan' | ...
 *   hero.play('run');                               // idle run jump shoot hurt die
 *   // in your game loop:
 *   hero.update(dt);                                // dt in seconds
 *   hero.draw(ctx, x, y, { flip: facingLeft, scale: 2 });   // x,y = FEET (bottom-centre)
 *   hero.finished                                   // true once a non-looping anim ended
 *   hero.jumpFrame('fall')                          // frame index for jump phase (takeoff/rise/peak/fall)
 */
(function (g) {
  class Actor {
    constructor(def, img) { this.def = def; this.img = img; this.anim = null; this.t = 0; this.frame = 0; this.finished = false; this.play('idle'); }
    play(name, restart = false) {
      if (!this.def.animations[name]) name = 'idle';
      if (this.anim === name && !restart) return;
      this.anim = name; this.t = 0; this.frame = 0; this.finished = false;
    }
    update(dt) {
      const a = this.def.animations[this.anim]; this.t += dt * ((this.rate && this.rate[this.anim]) || 1);   // optional per-animation speed (rate: { idle: .5 })
      const n = Math.floor(this.t * a.fps);
      if (a.loop) this.frame = n % a.frames;
      else { this.frame = Math.min(n, a.frames - 1); this.finished = n >= a.frames - 1; }
      if (this.cap && this.cap[this.anim] !== undefined) this.frame = Math.min(this.frame, this.cap[this.anim]);   // optional: stop on an earlier frame (cap: { hurt: 0 })
    }
    setFrame(i) { this.frame = Math.max(0, Math.min(i, this.def.animations[this.anim].frames - 1)); }
    jumpFrame(phase) { return (this.def.jump_phases || {})[phase] ?? 0; }
    draw(ctx, x, y, o = {}) {
      const { w, h } = this.def.cell, a = this.def.animations[this.anim], s = o.scale || 1;
      ctx.save();
      // keep pixel art crisp: smooth when the final scale is small, hard pixels when it is large
      const k = (ctx.getTransform ? ctx.getTransform().a : 1) * s; ctx.imageSmoothingEnabled = k < 2;
      ctx.translate(x, y); if (o.flip) ctx.scale(-1, 1);
      ctx.drawImage(this.img, this.frame * w, a.row * h, w, h, -this.def.anchor.x * s, -this.def.anchor.y * s, w * s, h * s);
      ctx.restore();
    }
  }
  const loadImg = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
  g.CodeQuestSprites = {
    async load(manifestOrUrl, base = '') {
      const m = typeof manifestOrUrl === 'string' ? await (await fetch(manifestOrUrl)).json() : manifestOrUrl;
      const imgs = {};
      await Promise.all(m.characters.map(async c => { imgs[c.id] = await loadImg(base + c.atlas); }));
      return {
        manifest: m,
        list: cat => m.characters.filter(c => !cat || c.category === cat),   // 'heroes' | 'villains' | 'bosses'
        actor: id => { const d = m.characters.find(c => c.id === id); return new Actor(d, imgs[id]); },
        loadFx: async (id, name) => loadImg(base + m.characters.find(c => c.id === id).folder + '/' + m.characters.find(c => c.id === id).fx[name].file),
      };
    },
  };
})(window);
