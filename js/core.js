/* =========================================================
   CodeNPlay - core (shared by every page)
   state + storage, sound, icons, small helpers, XP chip
   ========================================================= */
(function () {
  'use strict';
  const t = window.I18N.t;
  const COURSES = window.COURSES;
  const LESSONS = [];
  COURSES.forEach((c) => c.lessons.forEach((l) => { l.course = c; l.n = LESSONS.length + 1; LESSONS.push(l); }));
  const lessonById = (id) => LESSONS.find((l) => l.id === id);

  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  // simple text format: paragraphs, `code`, **bold**, *italic*
  function fmt(text) {
    return String(text).split(/\n\n+/).map((p) => {
      let s = esc(p);
      s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
      s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
      return '<p>' + s.replace(/\n/g, '<br>') + '</p>';
    }).join('');
  }

  // ---------- storage (per player, safe) ----------
  // Every player has their own progress key. A second slot (.bak) keeps the previous
  // version, so even a half-written save can never wipe the progress.
  const Auth = window.CNPAuth;
  const KEY = Auth.key('progress'), BAK = KEY + '.bak';
  let mem = null;
  const num = (n) => Math.max(0, Math.min(1e6, Number(n) || 0));
  const okKey = (k) => /^[\w:-]{1,40}$/.test(k) && k !== '__proto__' && k !== 'constructor' && k !== 'prototype';
  function parse(s) { try { const o = JSON.parse(s); return o && typeof o === 'object' ? o : null; } catch (e) { return null; } }
  function readSlot(k) { try { return parse(localStorage.getItem(k)); } catch (e) { return null; } }
  function normalize(o) {
    o.xp = num(o.xp); o.q = o.q || {}; o.mq = o.mq || {}; o.done = o.done || {}; o.ach = o.ach || {}; o.perfect = num(o.perfect);
    o.streak = o.streak || { n: 0, best: 0, last: '' };
    return o;
  }
  const S = normalize(readSlot(KEY) || readSlot(BAK) || mem || { xp: 0, q: {}, done: {} });

  // two tabs open at once: never lose progress, only ever add to it
  function mergeFlags(into, from) { Object.keys(from || {}).forEach((k) => { if (okKey(k) && from[k]) into[k] = 1; }); }
  function mergeStored() {
    const st = readSlot(KEY); if (!st) return;
    S.xp = Math.max(num(S.xp), num(st.xp)); S.perfect = Math.max(num(S.perfect), num(st.perfect));
    mergeFlags(S.q, st.q); S.mq = S.mq || {}; mergeFlags(S.mq, st.mq); mergeFlags(S.done, st.done); mergeFlags(S.ach, st.ach);
    const b = st.streak || {};
    S.streak.best = Math.max(num(S.streak.best), num(b.best));
    if (String(b.last || '') > String(S.streak.last || '')) { S.streak.n = num(b.n); S.streak.last = String(b.last).slice(0, 10); }
  }
  // another tab saved -> take its newest progress
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY || !e.newValue) return;
    const o = parse(e.newValue); if (!o) return;
    Object.keys(S).forEach((k) => delete S[k]); Object.assign(S, normalize(o)); updateXp();
  });
  const ACHIEVEMENTS = [
    ['first',t('achFirstSteps'),t('achFirstStepsDesc')],['q10',t('achGettingStarted'),t('achGettingStartedDesc')],['q30',t('achCodeExplorer'),t('achCodeExplorerDesc')],
    ['html',t('achStructureBuilder'),t('achStructureBuilderDesc')],['css',t('achStyleMaster'),t('achStyleMasterDesc')],['js',t('achLogicHero'),t('achLogicHeroDesc')],
    ['xp100',t('achRisingStar'),t('achRisingStarDesc')],['xp300',t('achCodeChampion'),t('achCodeChampionDesc')],['perfect',t('achFlawless'),t('achFlawlessDesc')],['boss',t('achBossSlayer'),t('achBossSlayerDesc')],
    ['streak3',t('achOnARoll'),t('achOnARollDesc')],['streak7',t('achUnstoppable'),t('achUnstoppableDesc')]
  ];
  const Sfx = (() => {
    let ctx = null;
    function enabled(){ return Auth.pref('sound', 'on') !== 'off'; }
    function tone(freq, duration, type) {
      if (!enabled()) return;
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        if (!ctx) ctx = new AC();
        if (ctx.state === 'suspended') ctx.resume();
        const osc = ctx.createOscillator(), gain = ctx.createGain();
        osc.type = type || 'sine'; osc.frequency.value = freq;
        gain.gain.setValueAtTime(.0001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(.12, ctx.currentTime + .01);
        gain.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + duration);
        osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + duration + .02);
      } catch(e) {}
    }
    const GS={shoot:()=>tone(880,.08,'square'),hit:()=>tone(330,.1,'sawtooth'),kill:()=>{tone(220,.12,'sawtooth');setTimeout(()=>tone(440,.15),90)},foeshoot:()=>tone(260,.12,'sawtooth'),hurt:()=>tone(150,.2,'square'),die:()=>tone(110,.5,'sawtooth'),portal:()=>{tone(500,.2,'triangle');setTimeout(()=>tone(750,.3,'triangle'),150)},enter:()=>tone(1000,.25,'sine'),boss:()=>tone(80,.5,'sawtooth')};
    return { game(n){ if(GS[n]) GS[n](); }, win(){tone(660,.12);setTimeout(()=>tone(880,.16),90)}, bad(){tone(180,.18,'square')}, clear(){tone(523,.15);setTimeout(()=>tone(659,.15),120);setTimeout(()=>tone(784,.25),240)}, ach(){tone(784,.12);setTimeout(()=>tone(988,.16),100)}, enabled };
  })();
  function localDay(d) { const x=d||new Date(); return [x.getFullYear(),String(x.getMonth()+1).padStart(2,'0'),String(x.getDate()).padStart(2,'0')].join('-'); }
  function bumpStreak() {
    const today=localDay(), last=S.streak.last;
    if(last===today) return;
    const y=new Date(); y.setDate(y.getDate()-1);
    S.streak.n = last===localDay(y) ? S.streak.n+1 : 1;
    S.streak.last=today; S.streak.best=Math.max(S.streak.best,S.streak.n);
  }
  function checkAch() {
    const completed=LESSONS.filter(l=>S.done[l.id]).length, challenges=Object.keys(S.q).length;
    const flags={first:completed>=1,q10:challenges>=10,q30:challenges>=30,xp100:S.xp>=100,xp300:S.xp>=300,perfect:S.perfect>=1,boss:Object.keys(S.done).some(k=>k.indexOf('boss-')===0),streak3:S.streak.best>=3,streak7:S.streak.best>=7};
    COURSES.forEach(c=>{flags[c.id]=c.lessons.every(l=>!!S.done[l.id]);});
    ACHIEVEMENTS.forEach(([id,name])=>{if(flags[id]&&!S.ach[id]){S.ach[id]=1;setTimeout(()=>{toast(t('achUnlocked')+name);Sfx.ach();},0);}});
  }
  function save(force) {
    mem = S; if (!force) mergeStored(); checkAch(); S.updated = Date.now();
    try {
      const prev = localStorage.getItem(KEY);
      if (prev) localStorage.setItem(BAK, prev);
      localStorage.setItem(KEY, JSON.stringify(S));
    } catch (e) {}
    updateXp();
  }
  const lessonDone = (id) => !!S.done[id];
  const qDone = (id, i) => !!S.q[id + ':' + i];
  const doneCount = (course) => course.lessons.filter((l) => lessonDone(l.id)).length;
  const playerLevel = () => Math.floor(S.xp / 100) + 1;

  // ---------- icons ----------
  const ICONS = {
    home: '<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 21V5"/><path d="M9 7h6"/>',
    play: '<path d="M7 4l13 8-13 8z"/>',
    pad: '<rect x="2" y="7" width="20" height="11" rx="5"/><path d="M7 10v5M4.5 12.5h5"/><circle cx="16" cy="11.5" r=".8"/><circle cx="18.5" cy="14" r=".8"/>',
    check: '<path d="M4 12l5 5L20 6"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"/>',
    reset: '<path d="M4 4v6h6"/><path d="M5.5 15a8 8 0 1 0 2-8.5L4 10"/>',
    run: '<path d="M7 4l13 8-13 8z" fill="currentColor"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
    flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
    star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  };
  const ic = (n, cls) => '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[n] + '</svg>';

  // ---------- page helpers ----------
  const view = $('#view');
  const cleanups = [];
  function mount(html) { view.innerHTML = html; return view; }
  function toast(msg) {
    const el = $('#toast'); el.textContent = msg; el.classList.add('show');
    clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove('show'), 2600);
  }
  function nextLesson() { return LESSONS.find((l) => !lessonDone(l.id)) || null; }
  function soundControl() {
    const on=Sfx.enabled();
    return '<button type="button" class="btn ghost sound-toggle" aria-pressed="'+on+'">'+(on?t('soundOn'):t('soundOff'))+'</button>';
  }
  function bindSound(root) {
    root.querySelectorAll('.sound-toggle').forEach(b=>b.addEventListener('click',()=>{
      const next=!Sfx.enabled(); Auth.setPref('sound',next?'on':'off');
      root.querySelectorAll('.sound-toggle').forEach(x=>{x.textContent=(next?t('soundOn'):t('soundOff'));x.setAttribute('aria-pressed',String(next));});
      if(next) Sfx.win();
    }));
  }
  const getHero = () => { const h = Auth.pref('hero', 'codex'); return Quest.CHARS[h] && Quest.CHARS[h].role === 'Hero' ? h : 'codex'; };
  function notFound() {
    mount('<section class="block pad-top center"><h1 class="h1s">'+t('pageNotFound')+'</h1><p class="muted">'+t('pageNotExist')+'</p><a class="btn primary" href="index.html">'+t('goHome')+'</a></section>');
  }
  function reset() {
    Object.keys(S).forEach((k) => delete S[k]);
    Object.assign(S, { xp: 0, q: {}, mq: {}, done: {}, streak: { n: 0, best: 0, last: '' }, ach: {}, perfect: 0 });
    Auth.clearTransient(); save(true);
  }
  function updateXp() {
    const x = $('#xpChip'); if (!x) return;
    const today=localDay(), y=new Date(); y.setDate(y.getDate()-1); const live=S.streak.last===today||S.streak.last===localDay(y);
    x.innerHTML = '<span class="lv">Lv ' + playerLevel() + '</span><span class="xpbar"><i style="width:' + (S.xp % 100) + '%"></i></span><b>' + S.xp + ' XP</b>'+(live?'<span class="streak-chip">🔥 '+S.streak.n+'</span>':'');
  }


  // highlight the current page in the menu + show the XP chip
  document.querySelectorAll('[data-nav]').forEach((a) => a.classList.toggle('active', a.dataset.nav === document.body.dataset.area));
  updateXp();

  window.CNP = {
    COURSES, LESSONS, lessonById, $, esc, fmt, S, save, reset, Auth, ACHIEVEMENTS, Sfx, localDay, bumpStreak, lessonDone, qDone,
    doneCount, playerLevel, ic, view, cleanups, mount, toast, nextLesson, soundControl, bindSound, getHero, notFound, updateXp,
    Runner: window.Runner, get state() { return S; },
  };
})();
