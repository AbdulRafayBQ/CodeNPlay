/* =========================================================
   CodeNPlay - story page (story.html: map, battles, bosses)
   ========================================================= */
(function () {
  'use strict';
  const { COURSES, LESSONS, lessonById, $, esc, fmt, S, save, reset, ACHIEVEMENTS, Sfx, localDay, bumpStreak, lessonDone, qDone, doneCount, playerLevel, ic, view, cleanups, mount, toast, nextLesson, courseCards, soundControl, bindSound, getHero, notFound } = window.CNP;
  const { Workbench, Auth } = window.CNP;
  const HEART = '<img src="assets/pack/ui/heart_full.webp" alt="" class="heartimg">';
  const HEART0 = '<img src="assets/pack/ui/heart_empty.webp" alt="" class="heartimg">';
  const STAR = '<svg class="bigstar" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z"/></svg>';
  const mobileView = () => window.matchMedia('(max-width: 980px)').matches;
  const heroName = () => Quest.CHARS[getHero()].name;
  const MAP_NAME = (n) => Quest.MAPS[n].name;
  const mapOf = (l) => ((l.n - 1) % 3) + 1;

  // [speaker, text, portrait]  portrait: 'hero' | 'zephyr' | 'titan' | null
  const WORLDS = {
    html: {
      place: 'Tag Valley', hue: 0, bossMap: 4,
      intro: (h) => [
        ['Narrator', 'Code City runs on code. Then the Null King freed the Bugs, and now every program is crashing.', null],
        [h, 'I will fix it! Every correct line of code powers my weapon. Time to learn to code.', 'hero'],
        ['Narrator', 'Welcome to <b>Tag Valley</b>. HTML is the skeleton of every web page. Bug-wizards guard each portal.', null]],
      boss: { kind: 'zephyr', hue: -70, scale: 1.7, name: 'ZEPHYR, LORD OF BROKEN TAGS' },
      bossIntro: (h) => [
        ['Narrator', 'The last portal of Tag Valley is sealed by a boss.', null],
        ['Zephyr', 'Unclosed tags! Missing quotes! Your pages will never load, little coder!', 'zephyr'],
        [h, 'Every tag I close makes you weaker. Let us go!', 'hero']],
      bossOutro: 'Zephyr is defeated and the tags are closed again. The portal to the Style Caves opens...',
    },
    css: {
      place: 'Style Caves', hue: 150, bossMap: 4,
      intro: (h) => [
        ['Narrator', 'Beyond the portal lie the <b>Style Caves</b>. Everything here is gray and plain: the Bugs stole all the colors.', null],
        [h, 'CSS is how we paint the web. Colors, fonts, boxes and layouts: let us bring them back!', 'hero']],
      boss: { kind: 'titan', hue: 0, scale: 1.5, name: 'TITAN THE UNSTYLED' },
      bossIntro: (h) => [
        ['Narrator', 'The ground shakes. A giant machine blocks the way out of the caves.', null],
        ['Titan', 'STYLE... DELETED. ALL PAGES... WILL BE... PLAIN.', 'titan'],
        [h, 'Not today. I know my selectors!', 'hero']],
      bossOutro: 'Titan falls and the colors flood back. The portal to Logic Castle opens...',
    },
    js: {
      place: 'Logic Castle', hue: 280, bossMap: 5,
      intro: (h) => [
        ['Narrator', 'At the end of the road stands <b>Logic Castle</b>. The Null King hides inside, where all the bugs are born.', null],
        [h, 'JavaScript is the brain of the web. Variables, decisions, loops and functions: this is my final test.', 'hero']],
      boss: [{ kind: 'zephyr', hue: 280, scale: 1.6, hits: 2, name: 'NULL ZEPHYR' }, { kind: 'titan', hue: 200, scale: 1.7, hits: 2, name: 'THE NULL TITAN' }],
      bossIntro: (h) => [
        ['Narrator', 'The Null King sends his two strongest servants to guard the throne.', null],
        ['Zephyr', 'undefined is all you will ever be!', 'zephyr'],
        ['Titan', 'NULL... NULL... NULL...', 'titan'],
        [h, 'Two bosses? Then I will use two times the code!', 'hero']],
      bossOutro: 'The Null Titan falls and Code City boots up again. The lights return. You are a real coder! THE END.',
    },
  };
  const LEVEL_LINES = [
    'Bug-wizards are blocking the portal. Show them what you know about <b>%t</b>.',
    'A new map, a new group of bugs. Time to use <b>%t</b>.',
    'The path is guarded again. Write the right code and your hero will strike.',
  ];
  const portraitFor = (key) => key === 'hero' ? 'heroes/' + getHero() + '/portrait.webp' : key === 'zephyr' ? 'villains/zephyr/portrait.webp' : key === 'titan' ? 'bosses/titan/portrait.webp' : null;

  function lessonSpec(l) {
    const w = WORLDS[l.course.id], idx = l.course.lessons.indexOf(l), total = l.tests.length, h = heroName();
    const intro = idx === 0 ? (l.n === 1 ? w.intro(h) : w.intro(h)) : [['Narrator', LEVEL_LINES[idx % LEVEL_LINES.length].replace('%t', esc(l.title)), null]];
    const next = LESSONS[l.n] || null;
    return {
      id: l.id, kind: l.kind, base: l.base, baseStyle: l.baseStyle, tests: l.tests, boss: false, lesson: l,
      title: l.title, eyebrow: 'Map ' + l.n + ' · ' + MAP_NAME(mapOf(l)) + ' · ' + l.course.name, map: mapOf(l), course: l.course,
      foes: l.tests.map((_, i) => ({ kind: 'zephyr', hue: w.hue, scale: i === total - 1 ? 1.2 : 1, hits: 1 })),
      intro, back: 'courses.html?lesson=' + l.id, backLabel: 'Back to lesson',
      nextMap: next, nextHref: !next || next.course !== l.course ? 'story.html?boss=' + l.course.id : 'courses.html?lesson=' + next.id,
      nextLabel: !next || next.course !== l.course ? 'Face the boss' : 'Next map',
      nextTitle: !next || next.course !== l.course ? l.course.boss.title : MAP_NAME(mapOf(next)) + ' · ' + next.title,
      outro: '', replay: 'story.html?play=' + l.id, levels: 'courses.html?course=' + l.course.id,
    };
  }
  function bossSpec(c) {
    const w = WORLDS[c.id], b = c.boss, h = heroName();
    const defs = [].concat(w.boss).map((d) => Object.assign({ hits: b.tests.length, boss: true }, d, { hue: d.hue }));
    const sum = defs.reduce((n, d) => n + d.hits, 0);
    if (sum !== b.tests.length) defs[defs.length - 1].hits += b.tests.length - sum;
    const ci = COURSES.indexOf(c), nc = COURSES[ci + 1];
    return {
      id: b.id, kind: b.kind, base: b.base, baseStyle: b.baseStyle, tests: b.tests, boss: true, title: b.title, eyebrow: 'Boss battle · ' + c.name + ' course',
      map: w.bossMap, course: c, foes: defs, intro: w.bossIntro(h), back: 'courses.html?course=' + c.id, backLabel: c.name + ' course',
      nextHref: nc ? 'courses.html?lesson=' + nc.lessons[0].id : 'story.html', nextLabel: nc ? 'Enter ' + WORLDS[nc.id].place : 'Story map',
      nextTitle: nc ? nc.name + ' course · ' + WORLDS[nc.id].place : 'The journey is complete', outro: w.bossOutro, replay: 'story.html?boss=' + c.id, levels: 'story.html', last: !nc,
    };
  }

  // ---------- the battle screen: game + question + editor + output ----------
  function battle(spec) {
    const total = spec.tests.length, hero = getHero(), cid = spec.course.id;
    // saved battle (refresh / closed tab): pick up on the same enemy with the same hearts
    const saved = Auth.battle.get(spec.id), resumed = !!(saved && saved.qi < total && (saved.qi > 0 || saved.lost > 0));
    let qi = resumed ? saved.qi : 0, fails = 0, hearts = resumed ? (saved.hearts > 0 ? saved.hearts : 3) : 3;
    let lost = resumed ? saved.lost || 0 : 0, gained = resumed ? saved.gained || 0 : 0, busy = true;
    const l = spec.lesson;
    const dkey = (i) => 'q:' + spec.id + ':' + i;

    mount(
      '<section class="play c-' + cid + '"><div class="play-grid">' +
      '<div class="mission">' +
      '<a class="back" href="' + spec.back + '">' + ic('back') + ' ' + spec.backLabel + '</a>' +
      '<header class="m-head"><p class="eyebrow">' + esc(spec.eyebrow) + '</p><h1 class="h1s">' + esc(spec.title) + '</h1>' +
      '<ol class="pips">' + spec.tests.map((_, i) => '<li data-i="' + i + '"><b>Q' + (i + 1) + '</b></li>').join('') + '<li class="gatepip"><b>Portal</b></li></ol></header>' +
      '<div class="card qcard" id="qcard"><div class="qtag" id="qTag"></div><div class="question" id="qText"></div>' +
      '<div class="tbar"><button type="button" class="btn ghost" id="hintBtn">' + ic('bulb') + ' Hint</button><button type="button" class="btn ghost hidden" id="ansBtn">Show answer</button></div>' +
      '<div class="feedback" id="fb" role="status" aria-live="polite"></div></div>' +
      '<div class="card endcard hidden" id="endcard"></div><div id="wbSlot"></div>' +
      (l ? '<details class="remind"><summary>Need a reminder? Open the lesson notes</summary><div class="prose">' + fmt(l.intro) + '</div></details>' : '') +
      '</div>' +
      '<aside class="arena" id="arena"><div class="arena-hud"><div class="hearts" id="hearts"></div>' +
      '<div class="stat"><small>' + (spec.boss ? 'Boss hits' : 'Enemies') + '</small><b id="kills">0/' + total + '</b></div><div class="stat"><small>XP earned</small><b id="gx">0</b></div>' + soundControl() + '</div>' +
      '<div class="stage"><canvas id="cv" aria-label="Game"></canvas><div class="ov" id="ov"></div></div>' +
      '<p class="arena-note">Write the code and press <b>Run</b>. Your code runs, and if it is correct your hero strikes. Wrong code: the enemy fights back.</p></aside>' +
      '</div></section>'
    );

    bindSound(view);
    const kills = () => { $('#kills').textContent = qDoneRound.filter(Boolean).length + '/' + total; };
    const game = new Quest($('#cv'), { map: spec.map, hero, foes: spec.foes, sfx: (n) => Sfx.game(n) });
    cleanups.push(() => game.destroy());
    const wb = Workbench({ kind: spec.kind, base: spec.base, baseStyle: spec.baseStyle, starter: spec.tests[0].starter, stacked: true, runLabel: 'Run code', onRun: () => runCode() }, cleanups);
    $('#wbSlot').appendChild(wb.el);
    const fb = $('#fb'), ov = $('#ov'), arena = $('#arena');
    const say = (cls, html) => { fb.className = 'feedback ' + cls; fb.innerHTML = html; };
    const drawHearts = () => { $('#hearts').innerHTML = [0, 1, 2].map((i) => '<span>' + (i < hearts ? HEART : HEART0) + '</span>').join(''); };
    const qDoneRound = [];
    if (resumed) (saved.done || []).forEach((v, i) => { if (v) qDoneRound[i] = true; });
    const snap = (nextQi, extra) => Auth.battle.set(spec.id, { qi: nextQi, hearts, lost, gained, done: Array.from({ length: total }, (_, i) => !!qDoneRound[i] || i === extra) });
    const pips = () => view.querySelectorAll('.pips li[data-i]').forEach((li) => { const i = +li.dataset.i; li.className = (qDoneRound[i] ? 'done' : i === qi ? 'cur' : ''); });
    const inView = (e) => { const r = e.getBoundingClientRect(); return r.top > 40 && r.bottom < innerHeight; };
    const arenaIntoView = () => { if (!inView(arena) && mobileView()) arena.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
    const showOv = (html, cls) => { ov.innerHTML = html; ov.className = 'ov open ' + (cls || ''); };
    const hideOv = () => { ov.className = 'ov'; ov.innerHTML = ''; };

    function dialog(lines, goLabel) {
      return new Promise((res) => {
        let i = 0;
        const step = () => {
          if (i >= lines.length) { hideOv(); res(); return; }
          const [who, txt, pk] = lines[i++], pf = portraitFor(pk);
          showOv('<div class="sdlg">' + (pf ? '<img class="sport" src="assets/pack/' + pf + '" alt="">' : '') + '<div><b>' + esc(who) + '</b><p>' + txt + '</p></div></div>' +
            '<button type="button" class="btn primary" id="dNext">' + (i >= lines.length ? (goLabel || 'Start battle') + ' ▶' : 'Next ▶') + '</button>', 'talk');
          $('#dNext').onclick = () => { Sfx.win(); step(); }; $('#dNext').focus({ preventScroll: true });
        };
        step();
      });
    }

    function showQ(i) {
      qi = i; fails = 0;
      const q = spec.tests[i];
      $('#qTag').textContent = (spec.boss ? 'Boss attack ' : 'Enemy ') + (i + 1) + ' of ' + total + (!spec.boss && i === total - 1 ? ' · last one before the portal' : '');
      $('#qText').innerHTML = fmt(q.q);
      wb.setDraftKey(null); wb.setCode(Auth.drafts.get(dkey(i)) || q.starter); wb.setDraftKey(dkey(i));
      say('', ''); $('#ansBtn').classList.add('hidden');
      pips(); kills(); if (i > 0 || lost > 0) snap(i);
    }
    drawHearts(); showQ(qi);
    $('#hintBtn').onclick = () => say('hint', '<b>Hint:</b> ' + esc(spec.tests[qi].hint));
    $('#ansBtn').onclick = () => { wb.setCode(spec.tests[qi].solution); say('hint', 'Here is one correct answer. Press <b>Run code</b> to use it.'); };

    // the one and only button: Run. It runs the code (output below) AND tells the game what happened.
    async function runCode() {
      if (busy) return; busy = true;
      say('', 'Running your code...');
      const q = spec.tests[qi];
      const res = await Runner.grade({ kind: spec.kind, code: wb.getCode(), base: spec.base, baseStyle: spec.baseStyle }, q.check);
      try { res.ok ? await win() : await lose(res.msg); } finally { busy = false; }
    }

    async function win() {
      let g = 0;
      bumpStreak(); Sfx.win();
      if (!qDone(spec.id, qi)) { S.q[spec.id + ':' + qi] = 1; g += 10; }
      const last = qi === total - 1;
      let finished = false;
      if (last && !S.done[spec.id]) { S.done[spec.id] = 1; g += spec.boss ? 60 : 20; finished = true; }
      if (last && lost === 0) S.perfect = (S.perfect || 0) + 1;
      S.xp += g; gained += g; save(); $('#gx').textContent = gained;
      Auth.drafts.del(dkey(qi));
      if (last) Auth.battle.del(spec.id); else snap(qi + 1, qi);
      say('good', '<b>Correct!</b> ' + (last ? 'The portal is opening...' : 'Your hero strikes!'));
      arenaIntoView();
      const k = qi;
      await game.hit();
      qDoneRound[k] = true; pips(); kills();
      if (last) {
        Sfx.clear(); await game.finish();
        view.querySelector('.pips .gatepip').classList.add('done');
        const stars = Math.max(1, 3 - lost);
        $('#qcard').classList.add('hidden'); $('.remind') && $('.remind').classList.add('hidden');
        const ec = $('#endcard'); ec.classList.remove('hidden');
        ec.innerHTML = ('<p class="ov-title">' + (spec.boss ? 'BOSS DEFEATED' : 'MAP CLEAR') + '</p><div class="stars">' + [0, 1, 2].map((i) => '<span class="' + (i < stars ? 'on' : '') + '">' + STAR + '</span>').join('') + '</div>' +
          '<p class="ov-xp">' + (gained ? '+' + gained + ' XP' : 'Great replay!') + (finished ? (spec.boss ? ' · Course complete' : ' · Lesson complete') : '') + '</p>' +
          (spec.outro ? '<p class="ov-story">' + esc(spec.outro) + '</p>' : '') +
          '<p class="ov-next"><small>NEXT PORTAL</small><b>' + esc(spec.nextTitle) + '</b></p>' +
          '<div class="ov-acts"><a class="btn primary big" href="' + spec.nextHref + '">' + esc(spec.nextLabel) + ' ' + ic('arrow') + '</a>' +
          '<a class="btn ghost" id="replay" href="' + spec.replay + '">Replay</a><a class="btn ghost" href="story.html">Story map</a></div>');
        $('#replay').onclick = (e) => { e.preventDefault(); location.reload(); };
        if (mobileView()) ec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        busy = true;
      } else {
        showQ(qi + 1);
        if (mobileView()) $('#qcard').scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    async function lose(msg) {
      fails++; hearts--; lost++; Sfx.bad(); drawHearts(); snap(qi);
      say('bad', '<b>Not yet.</b> ' + esc(msg));
      if (fails >= 2) $('#ansBtn').classList.remove('hidden');
      arenaIntoView();
      await game.miss();
      if (hearts <= 0) {
        await game.defeat();
        showOv('<p class="ov-title bad">HERO FELL</p><p class="ov-xp">Read the hint, fix your code and try again.</p><div class="ov-acts"><button type="button" class="btn primary big" id="again">Try again</button></div>', 'end');
        busy = true;
        $('#again').onclick = () => { hearts = 3; drawHearts(); game.revive(); hideOv(); busy = false; if (mobileView()) $('#qcard').scrollIntoView({ behavior: 'smooth', block: 'start' }); };
      }
    }

    (async () => {
      if (!resumed) await dialog(spec.intro);
      await game.intro();
      if (resumed) {
        game.fastForward(qDoneRound.filter(Boolean).length); kills();
        $('#gx').textContent = gained;
        busy = false; toast('Welcome back! You are on enemy ' + (qi + 1) + ' of ' + total);
        say('hint', 'You are back where you stopped. Your code was restored. Press <b>Run code</b> when ready.');
        return;
      }
      busy = false;
      say('hint', 'An enemy blocks your path! Solve the question, then press <b>Run code</b>.');
    })();
  }

  function play(id) { const l = lessonById(id); if (!l) return notFound(); battle(lessonSpec(l)); }
  function bossFight(id) {
    const c = COURSES.find((x) => x.id === id); if (!c) return notFound();
    const left = c.lessons.filter((l) => !lessonDone(l.id)).length;
    if (left) {
      mount('<section class="block pad-top center"><p class="eyebrow">LOCKED</p><h1 class="h1s">' + esc(c.boss.title) + '</h1><p class="muted">The boss portal opens after you clear all ' + c.lessons.length + ' ' + c.name + ' maps. ' + left + ' left.</p><a class="btn primary big" href="story.html">Back to the story map</a></section>');
      return;
    }
    battle(bossSpec(c));
  }

  // ---------- story map ----------
  function story() {
    const hero = getHero(), nxt = nextLesson(), h = Quest.CHARS;
    const allDone = !nxt && COURSES.every((c) => S.done[c.boss.id]);
    const pickBoss = COURSES.find((c) => c.lessons.every((l) => lessonDone(l.id)) && !S.done[c.boss.id]);
    const goHref = pickBoss ? 'story.html?boss=' + pickBoss.id : nxt ? 'courses.html?lesson=' + nxt.id : 'courses.html';
    const goLabel = pickBoss ? 'Fight the boss' : !nxt ? 'Review lessons' : Object.keys(S.done).length ? 'Continue story' : 'Start story';
    const heroCards = ['codex', 'nova'].map((id) => '<button type="button" class="hero-pick' + (id === hero ? ' on' : '') + '" data-hero="' + id + '"><img src="assets/pack/' + h[id].portrait + '" alt=""><b>' + h[id].name + '</b><small>' + h[id].blurb + '</small></button>').join('');
    let unlockedAll = true;
    const worlds = COURSES.map((c, ci) => {
      const prevOk = ci === 0 || S.done[COURSES[ci - 1].boss.id];
      const nodes = c.lessons.map((lsn, i) => {
        const done = lessonDone(lsn.id), isNext = nxt && nxt.id === lsn.id;
        const open = done || isNext;
        const stateCls = done ? 'done' : isNext ? 'next' : 'locked';
        const inner = '<span class="n-bg" style="background-image:url(assets/pack/backgrounds/' + Quest.MAPS[mapOf(lsn)].file + '.webp)"></span><span class="n-no">' + (done ? ic('check') : i + 1) + '</span><b>' + esc(lsn.title) + '</b><small>' + (done ? 'Cleared' : isNext ? 'Next map' : 'Locked') + ' · ' + lsn.tests.length + ' enemies</small>';
        return open ? '<a class="snode ' + stateCls + '" href="courses.html?lesson=' + lsn.id + '">' + inner + '</a>' : '<div class="snode locked">' + inner + '</div>';
      }).join('');
      const bossOpen = c.lessons.every((x) => lessonDone(x.id)), bossDone = !!S.done[c.boss.id];
      const bossNode = (bossOpen ? '<a class="snode boss ' + (bossDone ? 'done' : 'next') + '" href="story.html?boss=' + c.id + '">' : '<div class="snode boss locked">') +
        '<span class="n-bg" style="background-image:url(assets/pack/backgrounds/' + Quest.MAPS[WORLDS[c.id].bossMap].file + '.webp)"></span><span class="n-no">☠</span><b>' + esc(c.boss.title.replace('Boss: ', '')) + '</b><small>' + (bossDone ? 'Defeated' : bossOpen ? 'Boss portal is open!' : 'Clear all maps first') + '</small>' + (bossOpen ? '</a>' : '</div>');
      return '<section class="sworld c-' + c.id + '"><header><p class="eyebrow">World ' + (ci + 1) + ' · ' + c.name + '</p><h2>' + WORLDS[c.id].place + '</h2><p class="muted">' + doneCount(c) + ' / ' + c.lessons.length + ' maps cleared' + (bossDone ? ' · boss defeated' : '') + '</p></header><div class="snodes">' + nodes + bossNode + '</div></section>';
    }).join('');
    mount('<section class="block pad-top story-page"><div class="block-head"><a class="back" href="index.html">' + ic('back') + ' Home</a><p class="eyebrow">STORY MODE</p><h1 class="h1s">The Last Debugger</h1>' +
      '<p class="lead sm">The Null King released the Bugs on Code City. Fight through 3 worlds. In every map, write real code to defeat the enemies, walk through the portal, and meet the boss at the end of each course.</p></div>' +
      '<div class="hero-picks"><p class="eyebrow">CHOOSE YOUR HERO</p><div class="hp-row">' + heroCards + '</div></div>' +
      (allDone ? '<p class="win-banner">🏆 You saved Code City! Replay any map to earn stars.</p>' : '') +
      '<div class="cta"><a class="btn primary big" href="' + goHref + '">' + goLabel + ' ' + ic('arrow') + '</a><a class="btn ghost big" href="courses.html">All courses</a></div>' + worlds + '</section>');
    view.querySelectorAll('.hero-pick').forEach((b) => b.addEventListener('click', () => { Auth.setPref('hero', b.dataset.hero); Sfx.win(); story(); }));
  }

  // which screen? story.html (map) | ?play=html-1 | ?boss=html
  const q = new URLSearchParams(location.search);
  if (q.get('play')) play(q.get('play'));
  else if (q.get('boss')) bossFight(q.get('boss'));
  else story();
})();
