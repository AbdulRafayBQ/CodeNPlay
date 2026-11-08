/* =========================================================
   CodeNPlay - home page (index.html)
   ========================================================= */
(function () {
  'use strict';
  const t = window.I18N.t;
  const Auth = window.CNP.Auth;
  const { COURSES, LESSONS, lessonById, $, esc, fmt, S, save, reset, ACHIEVEMENTS, Sfx, localDay, bumpStreak, lessonDone, qDone, doneCount, playerLevel, ic, view, cleanups, mount, toast, nextLesson, soundControl, bindSound, getHero, notFound, worldMap, CATALOG } = window.CNP;
  function home() {
    const nxt=nextLesson(), started=Object.keys(S.done).length>0||Object.keys(S.q).length>0;
    const startHref='courses.html?course=web', startLabel=!nxt?t('reviewWebDev'):started?t('continueLearn'):t('startWebDev');
    const totalChallenges=LESSONS.reduce((n,l)=>n+l.tests.length,0);
    const upNext=started&&nxt?'<a class="resume-card" href="courses.html?lesson='+nxt.id+'"><span class="eyebrow">'+t('upNext')+'</span><b>'+esc(nxt.title)+'</b><span>'+t('webDevelopment')+' · '+t('level')+' '+nxt.course.lv+'</span><strong>'+t('resumeLearning')+'</strong></a>':'';
    mount(
      '<section class="hero"><div class="hero-text"><p class="eyebrow">'+t('heroEyebrow')+'</p><h1>'+t('heroTitle')+'</h1>'+
      '<p class="lead">'+t('heroLead')+'</p>'+
      '<div class="cta"><a class="btn primary big" href="'+startHref+'">'+startLabel+' '+ic('arrow')+'</a><a class="btn ghost big" href="courses.html">'+ic('book')+' '+t('allCourses')+'</a></div>'+upNext+'</div>'+
      '<div class="hero-art"><div class="cab"><div class="cab-top"><span class="led"></span><span class="led b"></span><b>'+t('learnByPlaying')+'</b></div><div class="stage"><canvas id="demoCv" aria-label="Game preview"></canvas></div><div class="cab-code"><span class="k">if</span> (code.<span class="n">isCorrect</span>()) { hero.<span class="n">shoot</span>(); }</div></div></div></section>'+
      '<section class="stats-strip"><div><b>'+CATALOG.length+'</b><span>'+t('courses')+'</span></div><div><b>'+COURSES.length+'</b><span>'+t('webLevels')+'</span></div><div><b>'+LESSONS.length+'</b><span>'+t('lessons')+'</span></div><div><b>'+totalChallenges+'</b><span>'+t('codingChallenges')+'</span></div></section>'+
      '<section class="block why"><div class="block-head"><p class="eyebrow">'+t('whyFundamentals')+'</p><h2>'+t('aiCanWrite')+'</h2></div>'+
      '<blockquote class="why-quote">'+t('aiQuote')+'</blockquote>'+
      '<div class="feature-grid why-grid">'+
      '<article class="feature-card"><span class="fc-ic">'+ic('eye')+'</span><h3>'+t('youCanRead')+'</h3><p>'+t('youCanReadDesc')+'</p></article>'+
      '<article class="feature-card"><span class="fc-ic">'+ic('wrench')+'</span><h3>'+t('youCanFix')+'</h3><p>'+t('youCanFixDesc')+'</p></article>'+
      '<article class="feature-card"><span class="fc-ic">'+ic('compass')+'</span><h3>'+t('youCanDirect')+'</h3><p>'+t('youCanDirectDesc')+'</p></article>'+
      '<article class="feature-card"><span class="fc-ic">'+ic('rocket')+'</span><h3>'+t('youGrowFaster')+'</h3><p>'+t('youGrowFasterDesc')+'</p></article></div></section>'+
      '<section class="block"><div class="block-head"><h2>'+t('howEveryLesson')+'</h2><p>'+t('howLessonDesc')+'</p></div><ol class="how"><li><b>1</b><h4>'+t('step1Title')+'</h4><p>'+t('step1Desc')+'</p></li><li><b>2</b><h4>'+t('step2Title')+'</h4><p>'+t('step2Desc')+'</p></li><li><b>3</b><h4>'+t('step3Title')+'</h4><p>'+t('step3Desc')+'</p></li><li><b>4</b><h4>'+t('step4Title')+'</h4><p>'+t('step4Desc')+'</p></li></ol></section>'+
      '<section class="block"><div class="block-head"><h2>'+t('builtForLearning')+'</h2></div><div class="feature-grid">'+
      '<article class="feature-card"><span class="fc-ic">'+ic('keyboard')+'</span><h3>'+t('liveEditor')+'</h3><p>'+t('liveEditorDesc')+'</p></article><article class="feature-card"><span class="fc-ic">'+ic('bulb')+'</span><h3>'+t('friendlyHints')+'</h3><p>'+t('friendlyHintsDesc')+'</p></article>'+
      '<article class="feature-card"><span class="fc-ic">'+ic('pad')+'</span><h3>'+t('learnByPlayingCard')+'</h3><p>'+t('learnByPlayingDesc')+'</p></article><article class="feature-card"><span class="fc-ic">'+ic('chart')+'</span><h3>'+t('trackProgress')+'</h3><p>'+t('trackProgressDesc')+'</p></article></div></section>'+
      '<section class="block faq"><div class="block-head"><h2>'+t('faq')+'</h2></div>'+
      '<details><summary>'+t('faqInstall')+'</summary><p>'+t('faqInstallAns')+'</p></details><details><summary>'+t('faqFree')+'</summary><p>'+t('faqFreeAns')+'</p></details>'+
      '<details><summary>'+t('faqProgress')+'</summary><p>'+t('faqProgressAns')+'</p></details><details><summary>'+t('faqBeginner')+'</summary><p>'+t('faqBeginnerAns')+'</p></details>'+
      '<details><summary>'+t('faqOtherCourses')+'</summary><p>'+t('faqOtherCoursesAns')+'</p></details></section>'+
      '<footer class="foot site-foot"><div class="sf-grid"><div class="sf-brand"><img class="sf-logo" src="assets/logo.webp" alt="CodeNPlay" width="621" height="176"><p>'+t('footerDesc')+'</p></div><nav class="sf-col" aria-label="Footer"><h4>'+t('explore')+'</h4><a href="index.html">'+t('home')+'</a><a href="courses.html">'+t('courses')+'</a><a href="profile.html">'+t('profile')+'</a></nav><div class="sf-col"><h4>'+t('yourProgress')+'</h4><p class="sf-note">'+t('savedFor')+' <b>'+esc(Auth.name())+'</b>. <a href="profile.html#account">'+t('account')+'</a></p><button type="button" class="linkbtn" id="resetAll">'+t('resetProgress')+'</button></div></div><div class="sf-bottom"><span>&copy; '+new Date().getFullYear()+' CodeNPlay Academy</span><span class="sf-tag">'+t('learnPracticePlay')+'</span></div></footer>'
    );
    let alive=true;
    const dg=new Quest($('#demoCv'),{map:1,hero:getHero(),foes:[{kind:'zephyr'},{kind:'zephyr',hue:150},{kind:'zephyr',hue:280,scale:1.2}]}); cleanups.push(()=>{alive=false;dg.destroy();});
    (async()=>{while(alive){await dg.intro();for(let k=0;k<3&&alive;k++){await dg.wait(.6);if(k===1){await dg.miss();await dg.wait(.3);}await dg.hit();}if(!alive)break;await dg.finish();await dg.wait(.8);}})();
    $('#resetAll').onclick=()=>{if(confirm(t('deleteAllProgress')+' '+Auth.name()+'? '+t('accountStays'))){reset();cleanups.splice(0).forEach((f)=>f());home();toast(t('progressReset'));}};
  }

  home();
})();
