/* =========================================================
   CodeNPlay - courses page
   courses.html                -> academy map (all courses)
   courses.html?course=web     -> Web Development: levels + topics
   courses.html?lesson=html-1  -> one lesson
   ========================================================= */
(function () {
  'use strict';
  const t = window.I18N.t;
  const { COURSES, LESSONS, lessonById, $, esc, fmt, S, lessonDone, doneCount, ic, cleanups, mount, toast, nextLesson, notFound, worldMap, webTotal, webDone } = window.CNP;
  const { highlight, Workbench } = window.CNP;
  const WEB = 'courses.html?course=web';

  function academy() {
    mount('<section class="block pad-top"><div class="block-head"><p class="eyebrow">'+t('heroEyebrow')+'</p><h1 class="h1s">'+t('chooseCoursePage')+'</h1>' +
      '<p>'+t('coursePageDesc')+'</p></div>' + worldMap() + '</section>');
  }

  // one single map: every level with all its topics and its boss, in one place
  function web() {
    const nxt = nextLesson(), started = LESSONS.some((l) => lessonDone(l.id)), done = webDone(), total = webTotal();
    const go = nxt ? 'courses.html?lesson=' + nxt.id : WEB;
    const levels = COURSES.map((c) => {
      const d = doneCount(c), tl = c.lessons.length, pct = Math.round((d / tl) * 100);
      const bossOpen = true, bossDone = !!S.done[c.boss.id];
      const nodes = c.lessons.map((l, i) => {
        const dn = lessonDone(l.id), isNext = nxt && nxt.id === l.id;
        return '<a class="node' + (dn ? ' done' : '') + (isNext ? ' next' : '') + '" href="courses.html?lesson=' + l.id + '"><span class="num">' + (dn ? ic('check') : i + 1) + '</span><b>' + esc(l.title) + '</b></a>';
      }).join('');
      const boss = '<a class="node boss' + (bossDone ? ' done' : bossOpen ? ' next' : ' locked') + '" href="play.html?boss=' + c.id + '"><span class="num">' + (bossDone ? ic('check') : bossOpen ? '☠' : ic('lock')) + '</span><b>' + (c.id === 'js' ? t('finalBoss') : t('boss')) + '</b><small>' + (bossDone ? t('defeated') : bossOpen ? t('open') : t('clearAllTopics')) + '</small></a>';
      return '<section class="level c-' + c.id + '" id="level-' + c.id + '"><header class="level-head"><div><p class="eyebrow">'+t('level')+' ' + c.lv + '</p><h2>' + esc(c.name) + '</h2></div>' +
        '<div class="lv-prog"><b>' + d + '/' + tl + '</b><div class="prog"><span style="width:' + pct + '%"></span></div></div></header>' +
        '<div class="nodes">' + nodes + boss + '</div></section>';
    }).join('');
    mount('<section class="block pad-top web-page"><a class="back" href="courses.html">' + ic('back') + ' '+t('allCoursesBack')+'</a>' +
      '<div class="web-hero"><div><p class="eyebrow">'+t('courseOpen')+'</p><h1 class="h1s">'+t('webDevTitle')+'</h1>' +
      '<p class="lead sm">'+t('webDevLead')+'</p>' +
      '<div class="cta"><a class="btn primary" href="' + go + '">' + (started ? t('continue_') : t('start')) + ' ' + ic('arrow') + '</a></div></div>' +
      '<div class="ring big"><b>' + done + '/' + total + '</b><span>'+t('complete')+'</span></div></div>' +
      levels + '</section>');
    if (location.hash && $(location.hash)) $(location.hash).scrollIntoView();
  }

  function lesson(id) {
    const l = lessonById(id); if (!l) return notFound();
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
      (next ? '<a href="courses.html?lesson=' + next.id + '">' + esc(next.title) + ' ' + ic('arrow') + '</a>' : '<span></span>') + '</nav></article>'
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
