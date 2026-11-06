/* =========================================================
   CodeNPlay - profile page (profile.html)
   ========================================================= */
(function () {
  'use strict';
  const t = window.I18N.t;
  const Auth = window.CNP.Auth;
  const { COURSES, LESSONS, lessonById, $, esc, fmt, S, save, reset, ACHIEVEMENTS, Sfx, localDay, bumpStreak, lessonDone, qDone, doneCount, playerLevel, ic, view, cleanups, mount, toast, nextLesson, soundControl, bindSound, getHero, notFound } = window.CNP;
  function profile() {
    const level=playerLevel(), into=S.xp%100, need=100-into;
    const done=LESSONS.filter(l=>S.done[l.id]).length, challenges=Object.keys(S.q).length;
    const today=localDay(), y=new Date(); y.setDate(y.getDate()-1);
    const streakLive=S.streak.last===today||S.streak.last===localDay(y);
    const achievements=ACHIEVEMENTS.map(([id,name,desc])=>{
      const unlocked=!!S.ach[id];
      return '<article class="achievement '+(unlocked?'unlocked':'locked')+'"><span class="ach-icon">'+(unlocked?'🏆':'🔒')+'</span><div><b>'+name+'</b><small>'+desc+'</small></div></article>';
    }).join('');
    mount('<section class="block pad-top profile-page"><div class="block-head"><a class="back" href="index.html">'+t('homeBack')+'</a><p class="eyebrow">'+t('playerProfile')+' · '+esc(Auth.name())+'</p><h1 class="h1s">'+t('yourProgressTitle')+'</h1></div>'+
      '<div class="profile-hero"><div class="level-avatar"><img src="assets/pack/'+Quest.CHARS[getHero()].portrait+'" alt="'+esc(Quest.CHARS[getHero()].name)+'"><small>LV '+level+'</small></div><div class="profile-level"><p class="ph-name">'+esc(Quest.CHARS[getHero()].name)+'</p><h2>'+t('level')+' '+level+'</h2><div class="xpbar profile-xp"><i style="width:'+into+'%"></i></div><p class="ph-xp"><b>'+into+' / 100 XP</b> · '+need+' '+t('xpToLevel')+' '+(level+1)+'</p></div>'+soundControl()+'</div>'+
      '<div class="hero-picks"><p class="eyebrow">'+t('yourBattleHero')+'</p><div class="hp-row">'+['codex','nova'].map(id=>{const h=Quest.CHARS[id], on=id===getHero();return '<button type="button" class="hero-pick'+(on?' on':'')+'" data-hero="'+id+'" aria-pressed="'+on+'"><img src="assets/pack/'+h.portrait+'" alt=""><b>'+h.name+'</b><small>'+h.blurb+'</small><span class="hp-tag">'+(on?'\u2713 Selected':'Choose')+'</span></button>';}).join('')+'</div></div>'+
      '<div class="profile-stats"><div><i aria-hidden="true">\u2B50</i><b>'+S.xp+'</b><span>'+t('totalXP')+'</span></div><div><i aria-hidden="true">\uD83D\uDCD8</i><b>'+done+'</b><span>'+t('lessonsDone')+'</span></div><div><i aria-hidden="true">\uD83D\uDD25</i><b>'+(streakLive?S.streak.n:0)+'</b><span>'+t('dayStreak')+'</span></div><div><i aria-hidden="true">\uD83C\uDFC6</i><b>'+S.streak.best+'</b><span>'+t('bestStreak')+'</span></div></div>'+
      '<div class="block-head"><h2>'+t('achievements')+'</h2><p>'+Object.keys(S.ach).length+' / '+ACHIEVEMENTS.length+' '+t('unlocked')+' · '+challenges+' '+t('challengesSolved')+'</p></div><div class="achievement-grid">'+achievements+'</div>'+
      '<section class="account card" id="account"><h2>'+t('yourAccount')+'</h2><p class="muted">'+t('signedInAs')+' <b>'+esc(Auth.name())+'</b>. '+t('accountNote')+'</p>'+
      '<div class="acc-acts"><button type="button" class="btn primary" id="logoutBtn">'+t('logOut')+'</button></div>'+
      '<details class="acc-del"><summary>'+t('deleteAccount')+'</summary><form id="delForm" autocomplete="off"><p class="muted">'+t('deleteAccountDesc')+'</p>'+
      '<label>'+t('confirmPassword')+'<input name="password" type="password" autocomplete="current-password" required></label>'+
      '<button type="submit" class="btn ghost danger">'+t('deleteAccountBtn')+'</button><p class="auth-msg" id="delMsg" role="status" aria-live="polite"></p></form></details></section></section>');
    bindSound(view);
    view.querySelectorAll('.hero-pick').forEach((b)=>b.addEventListener('click',()=>{Auth.setPref('hero',b.dataset.hero);Sfx.win();profile();}));
    $('#logoutBtn').onclick=()=>Auth.logout();
    $('#delForm').onsubmit=async(e)=>{e.preventDefault();const m=$('#delMsg');m.textContent='';
      if(!confirm(t('deleteConfirm').replace('{name}',Auth.name())))return;
      try{await Auth.deleteAccount(e.target.elements.password.value);}catch(x){m.textContent=x.message||t('couldNotDelete');m.className='auth-msg err';}};
    if(location.hash==='#account'){const a=$('#account');a&&a.scrollIntoView();}
  }

  profile();
})();
