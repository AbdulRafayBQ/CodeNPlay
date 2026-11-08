/* =========================================================
   CodeNPlay - academy catalog + course world map
   (shared by index.html and courses.html)
   ========================================================= */
(function () {
  'use strict';
  const t = window.I18N.t;
  const { COURSES, LESSONS, S, esc, ic, nextLesson } = window.CNP;

  // every course of the academy. Only Web Development is open for now.
  const CATALOG = [
    { id: 'web', name: t('webDevelopment'), open: true, art: 'level1_forest', tag: t('openNow'),
      blurb: t('webDevBlurb') },
    { id: 'game', name: t('gameDev'), art: 'level3_castle', tag: t('comingSoon'),
      blurb: t('gameDevBlurb') },
    { id: 'python', name: t('pythonFound'), art: 'level2_cave', tag: t('comingSoon'),
      blurb: t('pythonBlurb') },
    { id: 'data', name: t('databaseSQL'), art: 'level5_final', tag: t('comingSoon'),
      blurb: t('databaseBlurb') },
    { id: 'backend', name: t('backendAPIs'), art: 'level4_boss', tag: t('comingSoon'),
      blurb: t('backendBlurb') },
    { id: 'mobile', name: t('mobileApps'), art: 'level3_castle', tag: t('comingSoon'),
      blurb: t('mobileBlurb') },
  ];

  const webTotal = () => LESSONS.length + COURSES.length;               // lessons + one boss per level
  const webDone = () => LESSONS.filter((l) => S.done[l.id]).length + COURSES.filter((c) => S.done[c.boss.id]).length;

  function island(c, i) {
    const total = webTotal(), done = webDone();
    const cls = 'isl ' + (c.open ? 'open' : 'locked') + (i === 0 ? ' main' : '') + ' fl-' + (i % 3);
    const art = '<div class="isl-art" aria-hidden="true"><div class="isl-top" style="background-image:url(assets/pack/backgrounds/' + c.art + '.webp)"></div><div class="isl-rock"></div></div>';
    const head = '<h3>' + esc(c.name) + '</h3>' +
      (c.open ? '<p class="isl-count">' + done + '/' + total + ' ' + t('done_') + '</p><span class="isl-btn">' + (done ? t('continue_btn') : t('play_')) + '</span>'
              : '<p class="isl-count">' + t('locked') + '</p>') +
      '<p class="isl-desc">' + esc(c.blurb) + '</p>';
    return c.open
      ? '<a class="' + cls + '" href="courses.html?course=' + c.id + '" aria-label="Open ' + esc(c.name) + '">' + art + '<div class="isl-info">' + head + '</div></a>'
      : '<div class="' + cls + '" role="group" aria-label="' + esc(c.name) + ' (' + t('comingSoon').toLowerCase() + ')">' + art + '<div class="isl-info">' + head + '</div></div>';
  }
  function worldMap() {
    return '<div class="wmap">' + CATALOG.map(island).join('') + '</div>';
  }

  Object.assign(window.CNP, { CATALOG, worldMap, webTotal, webDone });
})();
