/* =========================================================
   CodeNPlay - battle page (play.html)
     play.html?play=html-1   one topic: 3 enemies, every question is a hit
     play.html?boss=html     level boss: a long fight with questions from the whole level
   ========================================================= */
(function () {
  'use strict';
  const _t = window.I18N.t;
  const isUr = window.I18N && window.I18N.getLang() === 'ur';
  const tQ = (s) => (window.I18N && window.I18N.tQ ? window.I18N.tQ(s) : s);
  const tOpt = (s) => (window.I18N && window.I18N.tOpt ? window.I18N.tOpt(s) : s);
  const tHint = (s) => (window.I18N && window.I18N.tHint ? window.I18N.tHint(s) : s);
  const { COURSES, LESSONS, lessonById, $, esc, fmt, S, save, Sfx, bumpStreak, lessonDone, ic, view, cleanups, mount, toast, soundControl, bindSound, getHero, notFound, levelOpen, lessonOpen, bossOpen } = window.CNP;
  const { Workbench, Auth, Runner } = window.CNP;

  const HEART = 'assets/pack/ui/heart_full.webp', HEART0 = 'assets/pack/ui/heart_empty.webp';
  const MAXH = 4, MCQ_XP = 5, CODE_XP = 10, LESSON_XP = 25, BOSS_XP = 80;
  const TIERS = [{ k: 'zephyr', n: 'Zephyr' }, { k: 'umbrix', n: 'Umbrix' }, { k: 'glacira', n: 'Glacira' }, { k: 'voltrix', n: 'Voltrix' }, { k: 'pyrovex', n: 'Pyrovex' }];
  const MAP_OF = { html: 0, css: 1, js: 2 };
  const PLACE = { html: 'Black Fang Jungle', css: 'Rotting Swamp', js: 'Ashfall Gorge' };
  const BOSS = {
    html: { title: _t('bossTitle_html'), intro: _t('bossIntro_html'), outro: _t('bossOutro_html') },
    css: { title: _t('bossTitle_css'), intro: _t('bossIntro_css'), outro: _t('bossOutro_css') },
    js: { title: _t('bossTitle_js'), intro: _t('bossIntro_js'), outro: _t('bossOutro_js') },
  };
  const STORY = isUr ? {
    html: [
      'Void ka ek jasoos darakhton mein chhipa hai. Usey dikhao ke tum structure bana sakte ho.',
      'Toote hue tags ne darya ka rasta roka hua hai. Paar karne ke liye unhein theek karo.',
      'Jungle ka darwaza sirf saaf aur theek bane pages ke liye khulta hai.',
      'Taza qadmon ke nishan. Agla dushman zyada taqatwar hai, hoshiyar raho.',
      'Tum Titan ke qareeb ho. Yahan uske pehredar zyada sakht hain.',
      'Titan se pehle aakhri pehredar. Dat jao!'
    ],
    css: [
      'Swamp mein koi rang nahi hai. Ek ek rule karke rang wapas laao.',
      'Kechar se bad-shakal makhlooq nikal rahi hai. Unhein style do.',
      'Dabbon ka ek pul paani ke ooper hai. Spacing ka dhyan rakho.',
      'Layout toot gaya hai. Dushman ke hamle se pehle ise seedha karo.',
      'Dhund mein chamakti aankhein. Style hi tumhara hathyar hai.',
      'Hawa kaanp rahi hai. Vorathrax tumhari aamad mehsoos kar sakta hai.',
      'Uske khaas guards ne rasta rok liya hai. Bas pohanchne wale ho.'
    ],
    js: [
      'Ashfall Gorge bilkul khamosh hai. Ise logic do taake yeh jaag jaye.',
      'Darwaza sirf numbers aur text sunta hai. Iski zuban mein baat karo.',
      'Yahan har rasta do hisson mein bat jata hai. If aur else se faisla karo.',
      'Ek hi jaal baar baar dohra raha hai. Loops ise torein ge.',
      'Raakh ki machines sirf functions ka hukum maanti hain. Hukum do.',
      'Aakhri darwaza. Page ko react karwao, aur Nyxorion apni taqat kho dega.'
    ]
  } : {
    html: ['A scout of the Void is hiding in the trees. Show it you can build structure.', 'Broken tags are blocking the river path. Fix them to cross.', 'The jungle gate only opens for clean, well-built pages.', 'Fresh footprints. The next enemy is stronger, stay sharp.', 'You are close to Titan. His guards are tougher here.', 'The last guards before Titan. Hold the line!'],
    css: ['The swamp has no colour. Paint it back, one rule at a time.', 'Shapeless creatures crawl out of the mud. Give them style.', 'A bridge of boxes crosses the water. Mind your spacing.', 'The layout is broken. Align it before they strike.', 'Glowing eyes in the fog. Style is your weapon.', 'The air shakes. Vorathrax can feel you coming.', 'His elite guards block the road. Almost there.'],
    js: ['Ashfall Gorge is silent. Give it logic and it will wake up.', 'The gate only responds to numbers and text. Speak its language.', 'Every path forks here. Choose with if and else.', 'The same trap repeats and repeats. Loops will break it.', 'Machines of ash obey only functions. Command them.', 'The final gate. Make the page react, and Nyxorion will lose his power.'],
  };

  const mobileView = () => window.matchMedia('(max-width: 900px)').matches;

  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function shuffled(arr, r) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  const bank = () => window.MCQ || {};
  function bankOf(l) { return [].concat.apply([], (l.src || [l.id]).map((id) => (bank()[id] || []))).map((q) => Object.assign({ type: 'mcq', topic: l.title }, q)); }

  function reviewFor(l, count, r) {
    const before = LESSONS.slice(0, l.n - 1), out = [], used = {};
    if (!before.length) return out;
    const order = [before[before.length - 1], before[before.length - 2] || before[before.length - 1]];
    const older = before.slice(0, Math.max(0, before.length - 2));
    for (let k = 0; out.length < count && k < count * 6; k++) {
      const src = k < 2 ? order[k] : (older.length ? older[Math.floor(r() * older.length)] : order[k % 2]);
      const pool = shuffled(bankOf(src), r).filter((q) => !used[q.q]);
      if (pool.length) { used[pool[0].q] = 1; out.push(Object.assign({}, pool[0], { review: true })); }
    }
    return out;
  }

  const codeItem = (kind, t, topic, fallbackBase, fallbackStyle) => Object.assign({ type: 'code', kind, topic }, t, { base: 'base' in t ? t.base : fallbackBase, baseStyle: 'baseStyle' in t ? t.baseStyle : fallbackStyle });

  function lessonQuestions(l) {
    const r = rng(l.n * 977 + 13);
    const codes = l.tests.map((t) => codeItem(l.kind, t, l.title, l.base, l.baseStyle));
    const own = shuffled(bankOf(l), r).slice(0, (l.src && l.src.length > 1) ? 4 : 3);
    const rev = reviewFor(l, 3, r);
    const m = [];
    while (own.length || rev.length) { if (own.length) m.push(own.shift()); if (rev.length) m.push(rev.shift()); }
    const seq = []; let i = 0, j = 0;
    while (i < m.length || j < codes.length) { if (i < m.length) seq.push(m[i++]); if (j < codes.length) seq.push(codes[j++]); }
    return seq;
  }
  function bossQuestions(c) {
    const r = rng(c.lv * 131 + 7), b = c.boss;
    const codes = b.tests.map((t) => codeItem(b.kind, t, 'Boss attack', b.base, b.baseStyle));
    const nM = c.id === 'js' ? 16 : c.id === 'css' ? 10 : 8, nOld = c.id === 'html' ? 0 : c.id === 'css' ? 2 : 4;
    const pools = shuffled(c.lessons, r).map((l) => shuffled(bankOf(l), r)), mcqs = [];
    for (let k = 0; mcqs.length < nM - nOld && k < 200; k++) { const p = pools[k % pools.length]; if (p.length) mcqs.push(p.shift()); }
    const earlier = [].concat.apply([], COURSES.slice(0, COURSES.indexOf(c)).map((x) => x.lessons));
    if (nOld && earlier.length) {
      const ep = shuffled(earlier, r).map((l) => shuffled(bankOf(l), r));
      for (let k = 0, n = 0; n < nOld && k < 100; k++) { const p = ep[k % ep.length]; if (p.length) { mcqs.push(Object.assign({}, p.shift(), { review: true })); n++; } }
    }
    const list = shuffled(mcqs, r), n = codes.length + list.length, at = {};
    codes.forEach((t, k) => { at[Math.round(((k + 1) * n) / codes.length) - 1] = t; });
    const out = []; let mi = 0;
    for (let i = 0; i < n; i++) out.push(at[i] || list[mi++]);
    return out;
  }

  function lessonSpec(l) {
    const tests = lessonQuestions(l), N = tests.length, c = l.course, gi = l.n - 1, p = gi / Math.max(1, LESSONS.length - 1);
    const t1 = Math.round(p * 2), tiers = [t1, Math.min(4, t1 + 1), Math.min(4, t1 + 2)];
    const h1 = Math.max(2, Math.round(N * 0.28)), h2 = Math.max(2, Math.round(N * 0.33)), hp = [h1, h2, N - h1 - h2];
    const foes = tiers.map((t, i) => ({ kind: TIERS[t].k, name: TIERS[t].n, lv: t + 1, hits: hp[i] }));
    const idx = c.lessons.indexOf(l), next = c.lessons[idx + 1] || null;
    return {
      id: l.id, kind: l.kind, tests, boss: false, course: c, title: l.title, key: l.id,
      chapter: _t('chapter') + ' ' + (gi + 1) + ' · ' + PLACE[c.id], story: STORY[c.id][idx % STORY[c.id].length],
      world: { foes, segments: [{ map: MAP_OF[c.id], phase: gi % 4, count: 3 }] },
      back: 'courses.html?lesson=' + l.id, backLabel: _t('lesson_'),
      nextHref: next ? 'courses.html?lesson=' + next.id : 'play.html?boss=' + c.id, nextLabel: next ? _t('next') + ' topic' : 'Face the boss',
      nextTitle: next ? next.title : BOSS[c.id].title, replay: 'play.html?play=' + l.id, levels: 'courses.html?course=web#level-' + c.id,
      beats: {},
    };
  }
  function bossSpec(c) {
    const tests = bossQuestions(c), n = tests.length, nc = COURSES[COURSES.indexOf(c) + 1];
    let foes, segments, beats = {};
    if (c.id === 'js') {
      const h1 = Math.round(n * 0.36);
      foes = [{ kind: 'vorathrax', name: 'VORATHRAX', hits: h1, boss: true }, { kind: 'nyxorion', name: 'NYXORION', hits: n - h1, boss: true }];
      segments = [{ map: 1, phase: 2, count: 1 }, { map: 2, phase: 3, count: 1 }];
      beats[h1 - 1] = isUr ? 'Vorathrax gir gaya... lekin zameen phat gayi. Nyxorion uth khada hua!' : 'Vorathrax falls... but the ground cracks. Nyxorion rises!';
      beats[h1 + Math.round((n - h1) / 2) - 1] = isUr ? 'Nyxorion gusse mein hai! Uske hamlay tez ho rahe hain. Lagey raho!' : 'Nyxorion is enraged! His attacks get faster. Keep going!';
    } else {
      const kind = c.id === 'css' ? 'vorathrax' : 'titan';
      foes = [{ kind, name: kind.toUpperCase(), hits: n, boss: true }]; segments = [{ map: MAP_OF[c.id], phase: 3, count: 1 }];
      beats[Math.round(n / 2) - 1] = isUr ? (kind.toUpperCase() + ' gusse mein hai! Uski aadhi health khatam ho gayi.') : (kind.toUpperCase() + ' is enraged! Half of his health is gone.');
    }
    return {
      id: c.boss.id, kind: c.boss.kind, tests, boss: true, course: c, title: BOSS[c.id].title, key: c.boss.id,
      chapter: _t('level') + ' ' + c.lv + ' · ' + PLACE[c.id], story: BOSS[c.id].intro, outro: BOSS[c.id].outro,
      world: { foes, segments }, back: 'courses.html?course=web#level-' + c.id, backLabel: _t('map'),
      nextHref: nc ? 'courses.html?lesson=' + nc.lessons[0].id : 'courses.html', nextLabel: nc ? 'Enter ' + PLACE[nc.id] : _t('allCourses'),
      nextTitle: nc ? _t('level') + ' ' + nc.lv + ' · ' + nc.name : _t('webDevelopment') + ' ' + _t('complete'), replay: 'play.html?boss=' + c.id, levels: 'courses.html?course=web',
      beats,
    };
  }

  const STAR = '<svg class="jr-star" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z"/></svg>';


  // ---------- story mode: enemy <-> hero talk (tap Next) ----------
  const ST = () => window.STORY || { lesson: {}, boss: {}, relic: {} };
  const cap = (n) => { n = String(n || ''); return n.charAt(0).toUpperCase() + n.slice(1).toLowerCase(); };
  function cast(spec) {
    const hero = getHero(), CH = (window.Quest && window.Quest.CHARS) || {}, foes = spec.world.foes;
    const pic = (id) => (id === 'codex' || id === 'nova') ? 'assets/pack/heroes/' + id + '/portrait.webp' : 'assets/jungle/' + id + '/portrait.webp';
    const mk = (id, name) => ({ id, name, img: pic(id) });
    const f1 = foes[0], f2 = foes[1] || foes[0];
    return { h: mk(hero, (CH[hero] && CH[hero].name) || cap(hero)), f: mk(f1.kind, cap(f1.name || f1.kind)), f2: mk(f2.kind, cap(f2.name || f2.kind)) };
  }
  function talk(spec, lines, lastLabel, done) {
    if (!lines || !lines.length) { done(); return; }
    const ov = document.getElementById('ov');
    const C = cast(spec), L = isUr ? 2 : 1;
    let i = 0, timer = null, typing = false, full = '', shown = 0, curRight = lines[0][0] === 'f2' ? 'f2' : 'f', dead = false;
    const portrait = (side, p, on) => '<div class="jr-tp ' + side + (on ? ' on' : '') + '"><span class="jr-tf"><img src="' + p.img + '" alt=""></span><b>' + esc(p.name) + '</b></div>';
    ov.innerHTML = '<div class="jr-talk"><div class="jr-tcast"></div>' +
      '<div class="jr-tbox left" role="dialog" aria-live="polite"><b class="jr-tn"></b><p class="jr-tt"></p></div>' +
      '<div class="jr-tbar"><span class="jr-tc"></span><button type="button" class="btn ghost" id="tSkip">Skip</button><button type="button" class="btn primary" id="tNext"></button></div></div>';
    ov.classList.add('open');
    const cast$ = ov.querySelector('.jr-tcast'), nm = ov.querySelector('.jr-tn'), tx = ov.querySelector('.jr-tt'), nx = ov.querySelector('#tNext'), cn = ov.querySelector('.jr-tc'), bub = ov.querySelector('.jr-tbox');
    function finish() { if (dead) return; dead = true; clearInterval(timer); document.removeEventListener('keydown', key, true); done(); }
    function typeLine(text) {
      clearInterval(timer); full = text; shown = 0; typing = true; tx.textContent = '';
      timer = setInterval(() => { shown += 2; tx.textContent = full.slice(0, shown); if (shown >= full.length) { clearInterval(timer); typing = false; } }, 22);
    }
    function paint() {
      const ln = lines[i], who = ln[0];
      if (who !== 'h') curRight = who;
      cast$.innerHTML = portrait('left', C.h, who === 'h') + portrait('right', C[curRight], who !== 'h');
      bub.className = 'jr-tbox ' + (who === 'h' ? 'left' : 'right'); nm.textContent = (who === 'h' ? C.h : C[who]).name; nm.className = 'jr-tn ' + (who === 'h' ? 'hero' : 'foe');
      cn.textContent = (i + 1) + ' / ' + lines.length;
      nx.innerHTML = (i === lines.length - 1) ? esc(lastLabel) + ' '+ic('arrow') : (isUr ? 'Agla' : 'Next') + ' '+ic('arrow');
      typeLine(ln[L] || ln[1]);
    }
    function next() {
      if (typing) { clearInterval(timer); tx.textContent = full; typing = false; return; }
      if (i >= lines.length - 1) { finish(); return; }
      i++; paint();
    }
    function key(e) { if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') { e.preventDefault(); e.stopPropagation(); next(); } }
    nx.onclick = next; ov.querySelector('#tSkip').onclick = finish;
    document.addEventListener('keydown', key, true); cleanups.push(() => { dead = true; clearInterval(timer); document.removeEventListener('keydown', key, true); });
    paint();
  }

  function battle(spec) {
    const total = spec.tests.length, hero = getHero(), hasCode = spec.tests.some((q) => q.type === 'code');
    const sid = spec.id + '~3';
    const saved = Auth.battle.get(sid), resumed = !!(saved && saved.qi < total && (saved.qi > 0 || saved.lost > 0));
    let qi = resumed ? saved.qi : 0, fails = 0, hearts = resumed ? (saved.hearts > 0 ? saved.hearts : MAXH) : MAXH;
    let lost = resumed ? saved.lost || 0 : 0, gained = resumed ? saved.gained || 0 : 0, busy = true;
    const dkey = (i) => 'q3:' + spec.id + ':' + i;
    const bossFirst = !!spec.boss && !S.done[spec.id];

    mount(
      '<section class="jr c-' + esc(spec.course.id) + '"><div class="jr-grid">' +
      '<div class="jr-left">' +
      '<div class="jr-gp"><div class="jr-ph">' + ic('pad') + '<b>' + _t('gameTitle') + '</b></div>' +
      '<div class="jr-stage" id="stage"><canvas id="cv" aria-label="Game scene"></canvas>' +
      '<div class="jr-hud jr-hl"><div class="jr-pill jr-hearts" id="hearts" aria-label="Lives"></div><div class="jr-pill jr-xp"><img src="assets/pack/ui/coin.webp" alt=""><b id="gx">0</b></div></div>' +
      '<div class="jr-hud jr-hr"><a class="jr-ib wide" href="' + spec.back + '" aria-label="' + esc(spec.backLabel) + '">' + ic('book') + '<span>' + esc(spec.backLabel) + '</span></a>' +
      '<button type="button" class="jr-ib" id="sndBtn" aria-label="Sound"></button>' +
      '<a class="jr-ib" href="' + spec.levels + '" aria-label="Leave the fight"><svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></a></div>' +
      '<div class="jr-banner" id="banner" aria-live="polite"><h2 id="bTitle"></h2><p id="bSub"></p></div>' +
      '<div class="jr-ov" id="ov"></div></div></div>' +
      '<div class="jr-qcard" id="qbox"><span class="jr-qic" aria-hidden="true">&lt;/&gt;</span><p class="jr-tag"><span class="jr-kind" id="qKind"></span><span class="jr-topic" id="qTopic"></span></p><div class="jr-qtext" id="qText"></div>' +
      '<span class="jr-qpill">' + STAR + '<span>' + _t('questionWord') + ' <b id="qNum">1</b> / ' + total + '</span></span>' +
      '<div class="jr-tools"><button type="button" class="btn ghost hidden" id="hintBtn">' + ic('bulb') + ' ' + _t('hint') + '</button><button type="button" class="btn ghost hidden" id="ansBtn">' + _t('showAnswer') + '</button></div></div>' +
      '<div class="jr-out"><div class="jr-ph"><span class="jr-term" aria-hidden="true">&gt;_</span><b>' + _t('output') + '</b></div><div class="jr-fb" id="fb" role="status" aria-live="polite" data-ph="' + esc(_t('outputHint')) + '"></div></div>' +
      '</div>' +
      '<div class="jr-right" id="right"><div id="wbSlot"></div><div class="jr-optwrap hidden" id="optwrap"><div class="jr-ph">' + ic('check') + '<b>' + _t('chooseAnswer') + '</b></div><div class="jr-opts" id="opts"></div><p class="jr-tip">' + _t('tipPress') + '</p></div></div>' +
      '<div class="jr-prog"><div class="jr-ph"><svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 4h8v6a4 4 0 0 1-8 0z"/><path d="M8 6H4v1a4 4 0 0 0 4 4M16 6h4v1a4 4 0 0 1-4 4"/><path d="M12 14v4M8 20h8"/></svg><b>' + _t('yourProgress') + '</b></div><div class="jr-pbody"><div class="jr-pbar"><i id="pBar"></i></div><b class="jr-pnum" id="pNum">0 / ' + total + '</b></div></div>' +
      '</div><div class="jr-end hidden" id="endcard"></div></section>'
    );
    const sndBtn = $('#sndBtn');
    const paintSnd = () => { sndBtn.innerHTML = ic(Sfx.enabled() ? 'sound' : 'mute'); };
    sndBtn.onclick = () => { const on = !Sfx.enabled(); Auth.setPref('sound', on ? 'on' : 'off'); paintSnd(); if (on) Sfx.win(); };
    paintSnd();

    const fb = $('#fb'), ov = $('#ov');
    const narrow = window.matchMedia('(max-width: 900px)');
    const say = (cls, html) => {
      fb.className = 'jr-fb ' + cls; fb.innerHTML = html;
      // phones: the extra Output box is gone, so short messages show as a toast instead
      if (narrow.matches && html) { const tmp = document.createElement('div'); tmp.innerHTML = html; toast(tmp.textContent.trim(), cls === 'hint' ? 4200 : 2600); }
    };
    const drawHearts = () => { $('#hearts').innerHTML = [0, 1, 2, 3].map((i) => '<img src="' + (i < hearts ? HEART : HEART0) + '" alt="">').join(''); };
    const showOv = (html) => { ov.innerHTML = html; ov.classList.add('open'); };
    const hideOv = () => { ov.classList.remove('open'); ov.innerHTML = ''; };
    const snap = (nextQi) => Auth.battle.set(sid, { qi: nextQi, hearts, lost, gained, done: [] });
    const lockOpts = (on) => { const o = $('#opts'); o.classList.toggle('locked', on); o.querySelectorAll('.jr-opt').forEach((b) => { b.disabled = on || b.classList.contains('wrong'); }); };

    const game = new window.Jungle($('#cv'), {
      hero, foes: spec.world.foes, segments: spec.world.segments, sfx: (n) => Sfx.game(n),
      onPlace: (p) => {
        if (p.banner) { $('#bTitle').textContent = p.mapName; $('#bSub').textContent = p.phase; $('#banner').classList.add('show'); }
        else $('#banner').classList.remove('show');
      },
    });
    cleanups.push(() => game.destroy());
    drawHearts();

    let wb = null;
    if (hasCode) {
      wb = Workbench({ kind: spec.kind, starter: '', tabbed: true, stacked: false, runLabel: _t('runCode'), onRun: () => runCode() }, cleanups);
      $('#wbSlot').appendChild(wb.el);
      $('#hintBtn').onclick = () => {
        const html = '<b>' + _t('hint') + ':</b> ' + esc(tHint(spec.tests[qi].hint));
        say('hint', html);
        let pop = $('#hintPop');
        if (!pop) { pop = document.createElement('div'); pop.id = 'hintPop'; pop.className = 'jr-hintpop'; pop.setAttribute('role', 'status'); $('#qbox').appendChild(pop); }
        pop.innerHTML = '<span class="hp-ic">' + ic('bulb') + '</span><div class="hp-t">' + html + '</div><button type="button" class="hp-x" aria-label="Close">\u00d7</button>';
        pop.classList.add('show'); pop.querySelector('.hp-x').onclick = () => pop.classList.remove('show');
      };
      $('#ansBtn').onclick = () => { wb.tab('code'); wb.setCode(spec.tests[qi].solution); say('hint', _t('correctAnswer')); };
    }

    function tagOf(q) {
      if (q.type === 'code') return [spec.boss ? _t('bossCode') : _t('codeTag'), spec.boss ? '' : q.topic, ''];
      if (q.review) return [_t('remember'), q.topic, 'review'];
      return [spec.boss ? _t('bossQuestion') : _t('quickQuestion'), spec.boss ? '' : q.topic, ''];
    }
    function showQ(i, note) {
      qi = i; fails = 0; const q = spec.tests[i], isCode = q.type === 'code'; { const hp = $('#hintPop'); if (hp) hp.classList.remove('show'); }
      $('#qNum').textContent = i + 1; $('#pBar').style.width = (i / total * 100) + '%'; $('#pNum').textContent = i + ' / ' + total;
      const tg = tagOf(q); $('#qKind').textContent = tg[0]; $('#qKind').className = 'jr-kind ' + tg[2] + (isCode ? ' code' : ''); $('#qTopic').textContent = tg[1];
      $('#qText').innerHTML = fmt(tQ(q.q));
      say(note ? 'hint' : '', note || '');
      $('#wbSlot').classList.toggle('hidden', !isCode); $('#optwrap').classList.toggle('hidden', isCode);
      if (!isCode) {
        const order = q.o.map((_, k) => k), r = rng(i * 31 + spec.tests.length + (q.q.length));
        for (let k = order.length - 1; k > 0; k--) { const j = Math.floor(r() * (k + 1)); const tmp = order[k]; order[k] = order[j]; order[j] = tmp; }
        $('#opts').innerHTML = order.map((oi, n) => '<button type="button" class="jr-opt" data-i="' + oi + '"><span class="jr-chip">' + 'ABCD'[n] + '</span><span class="jr-otext' + (/[<>={}();]/.test(q.o[oi]) ? ' mono' : '') + '">' + esc(tOpt(q.o[oi])) + '</span></button>').join('');
        $('#opts').querySelectorAll('.jr-opt').forEach((b) => b.addEventListener('click', () => pick(+b.dataset.i, b)));
        lockOpts(busy);
        $('#hintBtn').classList.add('hidden'); $('#ansBtn').classList.add('hidden');
      } else {
        wb.setBase(q.base, q.baseStyle); wb.setSuggestions(q.sugg || []);
        wb.setDraftKey(null); wb.setCode(Auth.drafts.get(dkey(i)) || q.starter); wb.setDraftKey(dkey(i)); wb.tab('code');
        $('#hintBtn').classList.remove('hidden'); $('#ansBtn').classList.add('hidden');
      }
      if (i > 0 || lost > 0) snap(i);
    }

    async function runCode() {
      if (busy) { say('hint', _t('enemyStillComing')); return; }
      const q = spec.tests[qi]; if (q.type !== 'code') return;
      busy = true; say('', _t('runningCode'));
      let res;
      try { res = await Runner.grade({ kind: q.kind, code: wb.getCode(), base: q.base, baseStyle: q.baseStyle }, q.check); }
      catch (e) { res = { ok: false, msg: _t('codeError') }; }
      if (res.ok) await win(); else await lose(res.msg);
    }
    async function pick(oi, btn) {
      if (busy) return; busy = true; lockOpts(true);
      if (oi === spec.tests[qi].a) { btn.classList.add('right'); await win(); }
      else { btn.classList.add('wrong'); await lose(_t('answerNotCorrect')); }
    }
    const onKey = (e) => {
      const q = spec.tests[qi]; if (!q || q.type !== 'mcq' || busy || e.ctrlKey || e.metaKey || e.altKey) return;
      let n = '1234'.indexOf(e.key); if (n < 0) n = 'abcd'.indexOf(e.key.toLowerCase()); if (n < 0) return;
      const b = $('#opts').children[n]; if (b && !b.disabled) b.click();
    };
    document.addEventListener('keydown', onKey); cleanups.push(() => document.removeEventListener('keydown', onKey));

    async function win() {
      let g = 0; bumpStreak(); Sfx.win();
      const q = spec.tests[qi], last = qi === total - 1, k = qi;
      const key = spec.id + ':' + qi; if (!S.q[key]) { S.q[key] = 1; g += q.type === 'code' ? CODE_XP : MCQ_XP; }
      if (last && !S.done[spec.id]) { S.done[spec.id] = 1; g += spec.boss ? BOSS_XP : LESSON_XP; }
      if (last && lost === 0) S.perfect = (S.perfect || 0) + 1;
      if (q.type === 'code') Auth.drafts.del(dkey(qi));
      S.xp += g; gained += g; save(); $('#gx').textContent = gained;
      if (last) Auth.battle.del(sid); else snap(qi + 1);
      say('good', '<b>' + _t('hitMsg') + '</b> ' + (last ? _t('lastEnemyFalls') : _t('heroStrikes')));
      const r = await game.hit();
      if (r === 'clear' || last) {
        Sfx.clear(); await game.finish();
        const outro = spec.boss ? (ST().boss[spec.course.id] || {}).outro : null;
        if (outro) talk(spec, outro, isUr ? 'Inaam lo' : 'Claim reward', finishScreen); else finishScreen();
        return;
      }
      const beat = spec.beats[k];
      if (r === 'kill') {
        showQ(qi + 1, beat || _t('newEnemy')); lockOpts(true);
        await game.advance(); busy = false; lockOpts(false);
        say('hint', beat || (spec.tests[qi].type === 'code' ? _t('writeCodePrompt') : _t('pickAnswer')));
      } else { busy = false; showQ(qi + 1, beat || ''); if (beat) Sfx.game('boss'); }
    }

    async function lose(msg) {
      fails++; hearts--; lost++; Sfx.bad(); drawHearts(); snap(qi);
      say('bad', '<b>' + _t('notYet') + '</b> ' + esc(msg));
      if (spec.tests[qi].type === 'code') {
        $('#hintBtn').classList.remove('hidden'); if (fails >= 2) $('#ansBtn').classList.remove('hidden');
        // wrong code: show the output for a moment, then go back to the code by itself (the "Back to code" button also works any time)
        setTimeout(() => { wb.tab('code'); const ta = wb.el.querySelector('textarea'); if (ta && !mobileView()) ta.focus({ preventScroll: true }); }, mobileView() ? 900 : 1500);
      }
      await game.miss();
      if (hearts <= 0) {
        await game.defeat();
        showOv('<p class="jr-ov-title bad">' + _t('heroFell') + '</p><p class="jr-ov-text">' + _t('heroFellText') + '</p><button type="button" class="btn primary" id="again">' + _t('tryAgain') + '</button>');
        $('#again').onclick = () => { hearts = MAXH; drawHearts(); game.revive(); hideOv(); busy = false; lockOpts(false); };
        return;
      }
      busy = false; lockOpts(false);
    }

    function relicCard() {
      const R = spec.boss ? ST().relic[spec.course.id] : null; if (!R) return '';
      return '<div class="jr-relic' + (bossFirst ? ' fresh' : '') + '"><div class="jr-relic-art">' + R.art + '</div><div class="jr-relic-txt"><small>' +
        (bossFirst ? (isUr ? 'NAYA QADEEM INAAM' : 'NEW ANTIQUE REWARD') : (isUr ? 'AAPKE COLLECTION MEIN' : 'IN YOUR COLLECTION')) + '</small><b>' + esc(R.name) + '</b><p>' + esc(R.text) + '</p></div></div>';
    }

    function finishScreen() {
      const stars = Math.max(1, 3 - lost);
      $('.jr-grid').classList.add('hidden');
      const ec = $('#endcard'); ec.classList.remove('hidden');
      ec.innerHTML = '<p class="jr-ov-title">' + (spec.boss ? _t('bossDefeated') : _t('levelCleared')) + '</p>' +
        (spec.outro ? '<p class="jr-ov-text">' + esc(spec.outro) + '</p>' : '') +
        '<div class="jr-stars">' + [0, 1, 2].map((i) => '<span class="' + (i < stars ? 'on' : '') + '">' + STAR + '</span>').join('') + '</div>' +
        relicCard() +
        '<p class="jr-ov-xp">' + (gained ? '+' + gained + ' XP' : _t('greatReplay')) + '</p>' +
        '<p class="jr-next"><small>' + _t('next') + '</small><b>' + esc(spec.nextTitle) + '</b></p>' +
        '<div class="jr-acts"><a class="btn primary" href="' + spec.nextHref + '">' + esc(spec.nextLabel) + ' ' + ic('arrow') + '</a>' +
        '<a class="btn ghost" id="replay" href="' + spec.replay + '">' + _t('replay') + '</a><a class="btn ghost" href="' + spec.levels + '">' + _t('map') + '</a></div>';
      $('#replay').onclick = (e) => { e.preventDefault(); location.reload(); };
    }

    // Flow: Start -> hero and enemy meet face to face in the real scene -> they talk -> fight begins
    function begin(lines, lastLabel) {
      showQ(qi, spec.boss ? _t('bossComing') : _t('enemyComing')); lockOpts(true);
      return (async () => {
        if (resumed) {
          await game.resume(qi); $('#gx').textContent = gained; busy = false; lockOpts(false);
          toast(_t('welcomeBackFight'));
          say('hint', spec.tests[qi].type === 'code' ? _t('backWhereYouStopped') : _t('backWhereYouStoppedMcq'));
          return;
        }
        await game.intro();                                   // enemy walks in and stands opposite the hero
        if (lines && lines.length) {
          await new Promise((r) => setTimeout(r, 650));       // a short moment of staring each other down
          game.setActorsHidden(true);                          // the big portraits stand in for the two sprites
          await new Promise((r) => talk(spec, lines, lastLabel, r));
          game.setActorsHidden(false); hideOv();
        }
        busy = false; lockOpts(false);
        say('hint', spec.tests[qi].type === 'code' ? _t('writeCodePrompt') : _t('pickAnswer'));
      })();
    }
    if (resumed) begin();
    else {
      showQ(0, ''); lockOpts(true);
      showOv('<p class="jr-ov-kicker">' + esc(spec.chapter) + '</p><p class="jr-ov-title">' + esc(spec.title) + '</p><p class="jr-ov-text">' + esc(spec.story) + '</p><button type="button" class="btn primary" id="go">' + (spec.boss ? _t('fight') : _t('start')) + '</button>');
      $('#go').onclick = () => {
        Sfx.game('portal'); hideOv();
        const lines = spec.boss ? (ST().boss[spec.course.id] || {}).intro : ST().lesson[spec.id];
        begin(lines, spec.boss ? _t('fight') : _t('start'));
      };
    }
  }

  function lockedPage(c, why, key) {
    const prevLv = COURSES[COURSES.indexOf(c) - 1];
    mount('<section class="block pad-top center locked-page"><div class="burst lockburst">' + ic('lock') + '</div><h1 class="h1s">' + _t(key || 'levelLockedPage') + '</h1><p class="muted">' + (why || _t('levelLockedHint').replace('{n}', prevLv ? prevLv.lv : 1)) + '</p><a class="btn primary" href="courses.html?course=web">' + ic('back') + ' ' + _t('backToLevels') + '</a></section>');
  }
  function play(id) { const l = lessonById(id); if (!l) return notFound(); if (!lessonOpen(l)) { const c = l.course, p = c.lessons[c.lessons.indexOf(l) - 1]; return lockedPage(c, levelOpen(c) && p ? _t('lessonLockedHint').replace('{title}', p.title) : '', levelOpen(c) && p ? 'lessonLockedPage' : ''); }
    battle(lessonSpec(l)); }
  function bossFight(id) {
    const c = COURSES.find((x) => x.id === id); if (!c) return notFound();
    if (!bossOpen(c)) return lockedPage(c, levelOpen(c) ? _t('bossLockedHint') : '', levelOpen(c) ? 'bossLockedPage' : '');
    const left = 0;
    if (left) {
      mount('<section class="block pad-top center"><p class="eyebrow">' + _t('locked') + '</p><h1 class="h1s">' + esc(BOSS[c.id].title) + '</h1><p class="muted">' + _t('bossWakesUp') + ' ' + c.lessons.length + ' ' + _t('topicsOfLevel') + ' ' + c.lv + '. ' + left + ' ' + _t('leftText') + '</p><a class="btn primary big" href="courses.html?course=web#level-' + c.id + '">' + _t('backToMap') + '</a></section>');
      return;
    }
    battle(bossSpec(c));
  }

  const q = new URLSearchParams(location.search);
  if (q.get('play')) play(q.get('play'));
  else if (q.get('boss')) bossFight(q.get('boss'));
  else if (q.get('mcq')) { const m = q.get('mcq'); location.replace(lessonById(m) ? 'play.html?play=' + m : COURSES.some((c) => c.id === m) ? 'play.html?boss=' + m : 'courses.html?course=web'); }
  else location.replace('courses.html?course=web');
})();
