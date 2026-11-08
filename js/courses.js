/* =========================================================
   CodeNPlay - courses page
   courses.html                -> academy map (all courses)
   courses.html?course=web     -> Web Development: levels + topics
   courses.html?lesson=html-1  -> one lesson
   ========================================================= */
(function () {
  'use strict';
  const t = window.I18N.t;
  const { COURSES, LESSONS, lessonById, $, esc, fmt, S, lessonDone, doneCount, ic, cleanups, mount, toast, nextLesson, levelOpen, lessonOpen, bossOpen, notFound, worldMap, webTotal, webDone } = window.CNP;
  const { highlight, Workbench } = window.CNP;
  const Auth = window.CNPAuth, Sfx = window.CNP.Sfx;
  const WEB = 'courses.html?course=web';

  function academy() {
    mount('<section class="block pad-top"><div class="block-head"><p class="eyebrow">'+t('heroEyebrow')+'</p><h1 class="h1s">'+t('chooseCoursePage')+'</h1>' +
      '<p>'+t('coursePageDesc')+'</p></div>' + worldMap() + '</section>');
  }

  // levels page: one banner per level, a path of lesson tiles, a boss card at the end
  const BOSS_ART = { html: 'titan', css: 'vorathrax', js: 'nyxorion' };
  const BG = { html: 'level1_forest', css: 'level2_cave', js: 'level3_castle' };
  function web() {
    const nxt = nextLesson(), started = LESSONS.some((l) => lessonDone(l.id)), done = webDone(), total = webTotal();
    const pctAll = Math.round((done / total) * 100);
    const go = nxt ? 'courses.html?lesson=' + nxt.id : WEB;
    const levels = COURSES.map((c) => {
      const d = doneCount(c), tl = c.lessons.length, pct = Math.round((d / tl) * 100);
      const open = levelOpen(c), bOpen = bossOpen(c), bDone = !!S.done[c.boss.id], cleared = bDone;
      const prevLv = COURSES[COURSES.indexOf(c) - 1];
      const chip = cleared ? '<span class="lv-chip ok">' + ic('check') + t('stCleared') + '</span>' : open ? '<span class="lv-chip on">' + ic('play') + t('stOpen') + '</span>' : '<span class="lv-chip off">' + ic('lock') + t('stLocked') + '</span>';
      const nodes = c.lessons.map((l, i) => {
        const dn = lessonDone(l.id), lo = lessonOpen(l), isNext = !dn && nxt && nxt.id === l.id;
        const st = dn ? 'done' : isNext ? 'next' : lo ? 'open' : 'locked';
        const lab = dn ? t('stDone') : isNext ? t('stNext') : lo ? t('stReady') : t('stLocked');
        const num = dn ? ic('check') : lo ? (i + 1) : ic('lock');
        const inner = '<span class="sn-num">' + num + '</span><span class="sn-body"><b>' + esc(l.title) + '</b><small>' + lab + '</small></span><span class="sn-go">' + (lo ? ic(dn ? 'reset' : 'arrow') : '') + '</span>';
        return lo ? '<a class="snode2 ' + st + '" href="courses.html?lesson=' + l.id + '">' + inner + '</a>'
                  : '<div class="snode2 locked" aria-disabled="true">' + inner + '</div>';
      }).join('');
      const bst = bDone ? 'done' : bOpen ? 'next' : 'locked';
      const bTitle = c.id === 'js' ? t('finalBoss') : t('boss');
      const bSub = bDone ? t('defeated') : bOpen ? t('open') : t('clearAllTopics');
      const bInner = '<span class="bc-art"><img src="assets/jungle/' + BOSS_ART[c.id] + '/portrait.webp" alt="" loading="lazy">' + (bOpen || bDone ? '' : '<i class="bc-lock">' + ic('lock') + '</i>') + '</span>' +
        '<span class="bc-body"><small>' + bTitle + '</small><b>' + esc(String(c.boss.title || bTitle).replace(/^Boss:\s*/i, '')) + '</b><em>' + bSub + '</em></span>' +
        '<span class="bc-go">' + (bDone ? ic('check') : bOpen ? ic('flag') : ic('lock')) + '</span>';
      const boss = bOpen || bDone ? '<a class="bosscard ' + bst + '" href="play.html?boss=' + c.id + '">' + bInner + '</a>' : '<div class="bosscard locked" aria-disabled="true">' + bInner + '</div>';
      const note = !open ? '<p class="lock-note">' + ic('lock') + ' <span>' + t('levelLockedHint').replace('{n}', prevLv.lv) + '</span></p>' : '';
      return '<section class="lvl c-' + c.id + (open ? '' : ' is-locked') + (cleared ? ' is-cleared' : '') + '" id="level-' + c.id + '">' +
        '<header class="lvl-banner" style="--bg:url(assets/pack/backgrounds/' + BG[c.id] + '.webp)"><div class="lvl-no"><small>' + t('level') + '</small><b>' + c.lv + '</b></div>' +
        '<div class="lvl-info"><h2>' + esc(c.name) + '</h2><p>' + d + ' / ' + tl + ' ' + t('lessonsWord') + '</p><div class="prog"><span style="width:' + pct + '%"></span></div></div>' + chip + '</header>' +
        '<div class="lvl-body">' + note + '<div class="snodes2">' + nodes + '</div>' + boss + '</div></section>';
    }).join('');
    const CH = window.Quest && window.Quest.CHARS, hero = window.CNP.getHero();
    const heroBox = CH ? '<section class="hero-picks course-hero"><p class="eyebrow">' + t('chooseHero') + '</p><div class="hp-row">' + ['codex', 'nova'].map((id) => {
      const h = CH[id], on = id === hero;
      return '<button type="button" class="hero-pick' + (on ? ' on' : '') + '" data-hero="' + id + '" aria-pressed="' + on + '"><span class="hp-frame"><img src="assets/pack/' + h.portrait + '" alt="' + h.name + '"></span><b>' + h.name + '</b><small>' + h.blurb + '</small><span class="hp-tag">' + (on ? ic('check') + ' Selected' : 'Choose') + '</span></button>';
    }).join('') + '</div></section>' : '';
    mount('<section class="block pad-top web-page"><a class="back" href="courses.html">' + ic('back') + ' ' + t('allCoursesBack') + '</a>' +
      '<div class="wh"><div class="wh-text"><p class="eyebrow">' + t('courseOpen') + '</p><h1 class="h1s">' + t('webDevTitle') + '</h1>' +
      '<p class="lead sm">' + t('webDevLead') + '</p>' +
      '<div class="cta"><a class="btn primary big" href="' + go + '">' + (started ? t('continue_') : t('start')) + ' ' + ic('arrow') + '</a></div></div>' +
      '<div class="wh-ring" style="--p:' + pctAll + '"><div class="wh-ring-in"><b>' + done + '/' + total + '</b><span>' + t('complete') + '</span></div></div></div>' +
      heroBox + '<div class="lvl-list">' + levels + '</div></section>');
    bindHero();
    if (location.hash && $(location.hash)) $(location.hash).scrollIntoView();
  }

  function bindHero() {
    document.querySelectorAll('.course-hero .hero-pick').forEach((b) => b.addEventListener('click', () => {
      Auth.setPref('hero', b.dataset.hero);
      try { Sfx && Sfx.win && Sfx.win(); } catch (e) {}
      web();
    }));
  }

  function locked(c, why, key) {
    const prevLv = COURSES[COURSES.indexOf(c) - 1];
    mount('<section class="block pad-top center locked-page"><div class="burst lockburst">' + ic('lock') + '</div><h1 class="h1s">' + t(key || 'levelLockedPage') + '</h1><p class="muted">' + (why || t('levelLockedHint').replace('{n}', prevLv ? prevLv.lv : 1)) + '</p><a class="btn primary" href="' + WEB + '">' + ic('back') + ' ' + t('backToLevels') + '</a></section>');
  }

  function lesson(id) {
    const l = lessonById(id); if (!l) return notFound();
    if (!lessonOpen(l)) { const pp = l.course.lessons[l.course.lessons.indexOf(l) - 1]; const ok = levelOpen(l.course) && pp; return locked(l.course, ok ? t('lessonLockedHint').replace('{title}', pp.title) : '', ok ? 'lessonLockedPage' : ''); }
    const c = l.course, idx = c.lessons.indexOf(l);
    const prev = c.lessons[idx - 1], next = c.lessons[idx + 1];
    mount(
      '<article class="lesson c-' + c.id + '">' +
      '<a class="back" href="courses.html?course=web#level-' + c.id + '">' + ic('back') + ' '+t('webDevelopment')+'</a>' +
      '<header class="l-head"><p class="eyebrow">'+t('level')+' ' + c.lv + ' · ' + esc(c.name) + ' · '+t('lesson_')+' ' + (idx + 1) + ' '+t('ofText')+' ' + c.lessons.length + '</p><h1 class="h1s">' + esc(l.title) + '</h1>' +
      '<ol class="steps"><li class="on">'+t('learnStep')+'</li><li>'+t('practiceStep')+'</li><li>'+t('battleStep')+'</li></ol></header>' +
      '<section class="card learn"><h2><span class="badge">1</span> '+t('learnStep')+'</h2><div class="prose">' + fmt(l.intro) + '</div>' +
      '<div class="example"><div class="ex-head"><span>'+t('example')+'</span><button type="button" class="mini" id="tryEx">' + ic('copy') + '<span>'+t('tryInEditor')+'</span></button></div><pre class="code" id="exCode"></pre></div></section>' +
      '<section class="card practice" id="practice"><h2><span class="badge">2</span> '+t('practiceStep')+'</h2>' +
      '<div class="task">' + ic('bulb') + '<div>' + fmt(l.task) + '</div></div><div id="wbSlot"></div></section>' +
      '<section class="card next"><h2><span class="badge">3</span> '+t('battleStep')+'</h2><p class="muted">'+t('readyBattle')+'</p>' +
      '<div class="cta"><a class="btn primary" href="play.html?play=' + l.id + '">' + ic('flag') + ' '+t('startBattle')+'</a>' +
      '<a class="btn ghost" href="courses.html?course=web#level-' + c.id + '">' + ic('book') + ' '+t('map')+'</a></div></section>' +
      '<nav class="pn">' + (prev ? '<a href="courses.html?lesson=' + prev.id + '">' + ic('back') + ' ' + esc(prev.title) + '</a>' : '<span></span>') +
      (next ? (lessonOpen(next) ? '<a href="courses.html?lesson=' + next.id + '">' + esc(next.title) + ' ' + ic('arrow') + '</a>' : '<span class="pn-lock">' + ic('lock') + ' ' + esc(next.title) + '</span>') : '<span></span>') + '</nav></article>'
    );
    const ex = $('#exCode'); ex.innerHTML = highlight(l.example, l.kind);
    const wb = Workbench({ kind: l.kind, base: l.base, baseStyle: l.baseStyle, starter: l.starter, draftKey: 'lesson:' + l.id, suggestions: l.sugg }, cleanups);
    $('#wbSlot').appendChild(wb.el);
    if (wb.restored) toast(t('welcomeBackCode'));
    $('#tryEx').onclick = () => { wb.setCode(l.example); $('#practice').scrollIntoView({ behavior: 'smooth', block: 'start' }); toast(t('exampleLoaded')); };
  }

  const q = new URLSearchParams(location.search);
  if (q.get('lesson')) lesson(q.get('lesson'));
  else if (q.get('course') === 'web' || COURSES.some((c) => c.id === q.get('course'))) web();   // old ?course=html links land on the web course
  else academy();
})();
