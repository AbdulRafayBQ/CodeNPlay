/* =========================================================
   CodeNPlay - app (router, views, editor)
   ========================================================= */
(function () {
  'use strict';
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

  // ---------- storage (safe) ----------
  const KEY = 'codenplay.v1';
  let mem = null;
  function load() {
    try { const s = localStorage.getItem(KEY); if (s) return JSON.parse(s); } catch (e) {}
    return mem || { xp: 0, q: {}, done: {} };
  }
  let S = load();
  S.streak = S.streak || { n: 0, best: 0, last: '' };
  S.ach = S.ach || {};
  S.perfect = Number(S.perfect || 0);
  const ACHIEVEMENTS = [
    ['first','First steps','Complete 1 lesson'],['q10','Getting started','Solve 10 challenges'],['q30','Code explorer','Solve 30 challenges'],
    ['html','HTML complete','Complete the HTML course'],['css','CSS complete','Complete the CSS course'],['js','JavaScript complete','Complete the JavaScript course'],
    ['xp100','Rising star','Earn 100 XP'],['xp300','Code champion','Earn 300 XP'],['perfect','Flawless victory','Clear a level without losing a heart'],['boss','Boss slayer','Defeat a course boss'],
    ['streak3','On a roll','Reach a 3-day streak'],['streak7','Unstoppable','Reach a 7-day streak']
  ];
  const Sfx = (() => {
    let ctx = null;
    function enabled(){ try { return localStorage.getItem('cnp.sound') !== 'off'; } catch(e){ return true; } }
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
    ACHIEVEMENTS.forEach(([id,name])=>{if(flags[id]&&!S.ach[id]){S.ach[id]=1;setTimeout(()=>{toast('Achievement unlocked: '+name);Sfx.ach();},0);}});
  }
  function save() { mem = S; checkAch(); try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} updateXp(); }
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

  // =========================================================
  // Syntax highlighter (single pass, safe)
  // =========================================================
  const RX = {
    html: /(<!--[\s\S]*?-->)|(<\/?[\w-]+)|("[^"\n]*"|'[^'\n]*')|(\/?>)|([\w-]+)(?==)/g,
    css: /(\/\*[\s\S]*?\*\/)|("[^"\n]*"|'[^'\n]*')|([^{};]+)(?=\{)|([\w-]+)(?=\s*:)|(#[0-9a-fA-F]{3,8}\b|\b\d+(?:\.\d+)?(?:px|em|rem|%|vh|vw|s)?\b)/g,
    js: /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`)|\b(let|const|var|function|return|if|else|for|while|true|false|null|undefined|new|of|in)\b|\b(\d+(?:\.\d+)?)\b/g,
  };
  const CLS = {
    html: ['', 'c', 'tg', 's', 'tg', 'at'],
    css: ['', 'c', 's', 'tg', 'at', 'n'],
    js: ['', 'c', 's', 'k', 'n'],
  };
  function highlight(code, kind) {
    const rx = new RegExp(RX[kind].source, 'g');
    let out = '', i = 0, m;
    while ((m = rx.exec(code))) {
      if (m[0] === '') { rx.lastIndex++; continue; }
      out += esc(code.slice(i, m.index));
      let g = 1;
      while (g < m.length && m[g] === undefined) g++;
      out += '<span class="' + CLS[kind][g] + '">' + esc(m[0]) + '</span>';
      i = m.index + m[0].length;
    }
    return out + esc(code.slice(i));
  }

  // =========================================================
  // Workbench: editor + live output (+ console for JS)
  // =========================================================
  const SYMBOLS = {
    html: ['<', '>', '/', '=', '"', "'", '!', '-'],
    css: ['{', '}', ':', ';', '.', '#', '(', ')', '%', '-', ','],
    js: ['(', ')', '{', '}', '[', ']', ';', '"', "'", '`', '=', '.', '+', '$'],
  };
  const FILE = { html: 'index.html', css: 'style.css', js: 'script.js' };

  function Workbench(o, cleanups) {
    const kind = o.kind;
    const root = document.createElement('div');
    root.className = 'wb wb--code' + (o.tabbed ? ' tabbed' : '') + (o.stacked ? ' stacked' : '');
    root.innerHTML =
      '<div class="wb-tabs" role="tablist">' +
      '<button type="button" data-tab="code" class="on" role="tab" aria-selected="true">Code</button>' +
      '<button type="button" data-tab="out" role="tab" aria-selected="false">Output</button></div>' +
      '<div class="wb-grid">' +
      '<section class="pane pane-code">' +
      '<div class="pane-head"><span class="file"><i class="dot"></i>' + FILE[kind] + '</span>' +
      '<span class="acts"><button type="button" class="mini suggest-toggle" data-act="suggestions" aria-pressed="true" title="Turn code suggestions on or off">Suggestions: On</button><button type="button" class="mini" data-act="reset" title="Reset code">' + ic('reset') + '<span>Reset</span></button>' +
      '<button type="button" class="mini run" data-act="run">' + ic('run') + '<span>' + (o.runLabel || 'Run') + '</span></button></span></div>' +
      '<div class="ed"><pre class="gutter" aria-hidden="true"></pre><div class="ed-main"><pre class="hl" aria-hidden="true"></pre>' +
      '<textarea spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" wrap="off" aria-label="Code editor"></textarea></div></div>' +
      '<div class="symbols"><button type="button" data-ins="  ">Tab</button>' +
      SYMBOLS[kind].map((s) => '<button type="button" data-ins="' + esc(s) + '">' + esc(s) + '</button>').join('') + '</div>' +
      '<div class="suggestions" aria-label="Code suggestions"><span class="suggestions-label">Try next</span><div class="suggestion-list"></div></div>' +
      '</section>' +
      '<section class="pane pane-out">' +
      '<div class="pane-head"><span class="file"><i class="dot out"></i>Output</span></div>' +
      '<iframe class="preview" sandbox="allow-scripts allow-same-origin" title="Output"></iframe>' +
      (kind === 'js' ? '<div class="console"><div class="console-head">Console</div><div class="console-body" aria-live="polite"></div></div>' : '') +
      '</section></div>' +
      (kind !== 'html' && o.base ? '<details class="base"><summary>Page HTML used for this lesson</summary><pre>' + esc(o.base) + '</pre></details>' : '');

    const ta = $('textarea', root), hl = $('.hl', root), gut = $('.gutter', root);
    const frame = $('.preview', root), cbody = $('.console-body', root);
    const suggestionBox = $('.suggestions', root), suggestionList = $('.suggestion-list', root);
    let suggestionsOn = true;
    try { suggestionsOn = localStorage.getItem('cnp.suggestions') !== 'off'; } catch (e) {}
    ta.value = o.starter || '';

    function paint() {
      hl.innerHTML = highlight(ta.value, kind) + '\n';
      const n = ta.value.split('\n').length;
      let g = ''; for (let i = 1; i <= n; i++) g += i + '\n';
      gut.textContent = g;
      syncScroll();
    }
    function syncScroll() { hl.scrollTop = ta.scrollTop; hl.scrollLeft = ta.scrollLeft; gut.scrollTop = ta.scrollTop; }

    const suggestionSets = {
      html: [
        ['<h1','<h1> heading','<h1>Heading</h1>'],['<h2','<h2> heading','<h2>Subheading</h2>'],['<p','<p> paragraph','<p>Write your text here</p>'],
        ['<button','button element','<button>Click me</button>'],['<a','anchor link','<a href="#">Link</a>'],['<img','image element','<img src="image.jpg" alt="Description">'],
        ['<ul','unordered list','<ul>\n  <li>Item</li>\n</ul>'],['<div','div container','<div></div>'],['class','class attribute','class="card"'],['id','id attribute','id="main"'],['href','href attribute','href="#"'],['src','src attribute','src="image.jpg"']
      ].map(([key,label,value])=>({key,label,value})),
      css: [
        ['color','color','color: #ffffff;'],['background','background','background: #171a35;'],['font-size','font-size','font-size: 18px;'],['margin','margin','margin: 16px;'],['padding','padding','padding: 16px;'],
        ['display','display','display: flex;'],['border-radius','border-radius','border-radius: 12px;'],['border','border','border: 1px solid #444;'],['text-align','text-align','text-align: center;'],['width','width','width: 100%;']
      ].map(([key,label,value])=>({key,label,value})),
      js: [
        ['const','const variable','const name = "";'],['let','let variable','let score = 0;'],['console.log','console.log','console.log("Hello!");'],['if','if statement','if (condition) {\n  \n}'],
        ['function','function','function myFunction() {\n  \n}'],['for','for loop','for (let i = 0; i < 5; i++) {\n  \n}'],['document.querySelector','querySelector','document.querySelector(".item")'],['addEventListener','addEventListener','element.addEventListener("click", () => {\n  \n});']
      ].map(([key,label,value])=>({key,label,value}))
    };

    function currentToken() {
      const before=ta.value.slice(0,ta.selectionStart), line=before.slice(before.lastIndexOf('\n')+1);
      return line.match(/[<\w.#-]+$/)?.[0] || '';
    }
    function renderSuggestions() {
      const toggle = $('.suggest-toggle', root);
      if (toggle) { toggle.textContent = 'Suggestions: ' + (suggestionsOn ? 'On' : 'Off'); toggle.setAttribute('aria-pressed', String(suggestionsOn)); }
      suggestionBox.classList.toggle('is-off', !suggestionsOn);
      if (!suggestionsOn) { suggestionList.innerHTML = ''; return; }
      const token=currentToken(), all=suggestionSets[kind];
      const matches=token ? all.filter(item=>item.key.startsWith(token) && item.key!==token) : [];
      const shown=(matches.length?matches:all).slice(0,4);
      suggestionList.innerHTML='';
      shown.forEach(item=>{
        const b=document.createElement('button'); b.type='button'; b.className='suggestion-chip'; b.textContent=item.label;
        b.dataset.suggest=item.value; b.dataset.replace=token.length; suggestionList.appendChild(b);
      });
      suggestionBox.classList.toggle('has-match',matches.length>0);
    }
    function applySuggestion(value, replaceLength) {
      const start=ta.selectionStart, from=start-(Number(replaceLength)||0);
      ta.setRangeText(value,from,ta.selectionEnd,'end'); ta.focus();
      ta.dispatchEvent(new Event('input',{bubbles:true}));
    }

    function line(type, text) {
      if (!cbody) return;
      const d = document.createElement('div');
      d.className = 'cl ' + (type === 'error' ? 'err' : type === 'warn' ? 'warn' : '');
      d.textContent = (type === 'error' ? 'Error: ' : '') + text;
      cbody.appendChild(d);
      cbody.scrollTop = cbody.scrollHeight;
    }

    const onMsg = (e) => {
      if (e.source !== frame.contentWindow || !e.data || !e.data.pnc) return;
      line(e.data.type, e.data.text);
    };
    window.addEventListener('message', onMsg);
    cleanups.push(() => window.removeEventListener('message', onMsg));

    const isMobile = () => !!o.tabbed || window.matchMedia('(max-width: 860px)').matches;
    function tab(t) {
      root.classList.toggle('wb--code', t === 'code');
      root.classList.toggle('wb--out', t === 'out');
      root.querySelectorAll('.wb-tabs button').forEach((b) => { const active=b.dataset.tab===t; b.classList.toggle('on',active); b.setAttribute('aria-selected',String(active)); });
    }

    function run(fromUser) {
      if (cbody) cbody.innerHTML = '';
      if (kind === 'js') {
        const p = Runner.loopProblem(ta.value);
        if (p) { line('error', p); frame.srcdoc = Runner.build({ kind: 'html', code: '' }); if (fromUser && o.onRun) o.onRun(ta.value); return; }
      }
      frame.srcdoc = Runner.build({ kind, code: ta.value, base: o.base, baseStyle: o.baseStyle });
      if (fromUser && !o.stacked && isMobile()) tab('out');
      if (fromUser && o.onRun) o.onRun(ta.value);
    }

    let timer = null;
    ta.addEventListener('input', () => {
      paint();
      if (o.onChange) o.onChange(ta.value);
      renderSuggestions();
      if (kind !== 'js') { clearTimeout(timer); timer = setTimeout(() => run(false), 450); }
    });
    ta.addEventListener('scroll', syncScroll);

    function insert(text) {
      const s = ta.selectionStart, e = ta.selectionEnd;
      ta.setRangeText(text, s, e, 'end');
      ta.dispatchEvent(new Event('input'));
    }
    ta.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); run(true); return; }
      if ([')',']','}',String.fromCharCode(34),String.fromCharCode(39),'`'].includes(e.key) && ta.value[ta.selectionStart]===e.key && ta.selectionStart===ta.selectionEnd) { e.preventDefault(); ta.setSelectionRange(ta.selectionStart+1,ta.selectionStart+1); return; }
      if (kind !== 'html' && ['(', '[', '{', '"', "'", '`'].includes(e.key)) {
        const s=ta.selectionStart, en=ta.selectionEnd, next=ta.value[s] || '';
        const closers={ '(':')','[':']','{':'}','"':'"',"'":"'","`":"`" };
        const canPair=!next || /\s/.test(next) || Object.values(closers).includes(next);
        const apostropheAfterWord=e.key==="'" && /[\w$]/.test(ta.value[s-1]||'');
        if (s===en && canPair && !apostropheAfterWord) { e.preventDefault(); ta.setRangeText(e.key+closers[e.key],s,en,'end'); ta.setSelectionRange(s+1,s+1); ta.dispatchEvent(new Event('input',{bubbles:true})); return; }
      }
      if (e.key === 'Tab') { e.preventDefault(); insert('  '); }
      else if (e.key === 'Enter' && !e.isComposing) {
        const s = ta.selectionStart, v = ta.value;
        const ls = v.lastIndexOf('\n', s - 1) + 1;
        const cur = v.slice(ls, s);
        let ind = (cur.match(/^\s*/) || [''])[0];
        if (/[{(\[]\s*$/.test(cur)) ind += '  ';
        e.preventDefault();
        insert('\n' + ind);
      }
    });

    root.addEventListener('mousedown', (e) => { if (e.target.closest('.symbols button')) e.preventDefault(); });
    root.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.tab) tab(b.dataset.tab);
      else if (b.dataset.suggest !== undefined) applySuggestion(b.dataset.suggest, b.dataset.replace);
      else if (b.dataset.act === 'suggestions') {
        suggestionsOn = !suggestionsOn;
        try { localStorage.setItem('cnp.suggestions', suggestionsOn ? 'on' : 'off'); } catch (e) {}
        renderSuggestions();
      }
      else if (b.dataset.ins !== undefined) { insert(b.dataset.ins); ta.focus(); }
      else if (b.dataset.act === 'run') run(true);
      else if (b.dataset.act === 'reset') { ta.value = o.starter || ''; paint(); run(false); if (o.onChange) o.onChange(ta.value); }
    });

    paint();
    renderSuggestions();
    ta.addEventListener('keyup', renderSuggestions);
    ta.addEventListener('click', renderSuggestions);
    setTimeout(() => run(false), 0);

    return {
      el: root,
      getCode: () => ta.value,
      setCode: (c) => { ta.value = c; paint(); run(false); },
      run: () => run(true),
      tab: tab,
      refresh: () => run(false),
    };
  }

  // =========================================================
  // Views
  // =========================================================
  const view = $('#view');
  let cleanups = [];
  let gameInst = null;

  function mount(html) { view.innerHTML = html; return view; }
  function el(html) { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstElementChild; }

  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2600);
  }

  function nextLesson() { return LESSONS.find((l) => !lessonDone(l.id)) || null; }

  function courseCards() {
    const nxt = nextLesson();
    return '<div class="cards">' + COURSES.map((c, i) => {
      const d = doneCount(c), t = c.lessons.length, pct = Math.round((d / t) * 100);
      const current = nxt && nxt.course === c;
      return '<a class="course-card c-' + c.id + (current ? ' current' : '') + '" href="#/course/' + c.id + '">' +
        '<span class="step-no">' + (i + 1) + '</span>' +
        '<h3>' + c.name + '</h3><p class="tag">' + c.tag + '</p><p class="desc">' + c.desc + '</p>' +
        '<div class="prog"><span style="width:' + pct + '%"></span></div>' +
        '<div class="card-foot"><small>' + d + ' / ' + t + ' lessons</small><span class="go">' + (d === 0 ? 'Start' : d === t ? 'Review' : 'Continue') + ' ' + ic('arrow') + '</span></div></a>';
    }).join('') + '</div>';
  }

  function home() {
    const nxt=nextLesson(), started=Object.keys(S.done).length>0||Object.keys(S.q).length>0;
    const startHref=nxt?'#/lesson/'+nxt.id:'#/learn', startLabel=!nxt?'Review lessons':started?'Continue learning':'Start learning';
    const totalChallenges=LESSONS.reduce((n,l)=>n+l.tests.length,0), doneChallenges=Object.keys(S.q).length;
    const upNext=started&&nxt?'<a class="resume-card" href="#/lesson/'+nxt.id+'"><span class="eyebrow">UP NEXT</span><b>'+esc(nxt.title)+'</b><span>'+esc(nxt.course.name)+' · Level '+nxt.n+'</span><strong>Resume learning →</strong></a>':'';
    mount(
      '<section class="hero"><div class="hero-text"><p class="eyebrow">Code. Learn. Play.</p><h1>Write code.<br>Defeat <span class="mark">enemies</span>.</h1>'+
      '<p class="lead">Learn HTML, CSS and JavaScript in short lessons. Play a story: in every map you write real code, and only the right code lets your hero defeat the enemies and open the portal. Beat the boss at the end of each course. Works on your phone too.</p>'+
      '<div class="cta"><a class="btn primary big" href="'+startHref+'">'+startLabel+' '+ic('arrow')+'</a><a class="btn ghost big" href="#/story">'+ic('pad')+' Story Mode</a></div>'+upNext+'</div>'+
      '<div class="hero-art"><div class="cab"><div class="cab-top"><span class="led"></span><span class="led b"></span><b>LIVE DEMO</b></div><div class="stage"><canvas id="demoCv" aria-label="Game preview"></canvas></div><div class="cab-code"><span class="k">if</span> (code.<span class="n">isCorrect</span>()) { hero.<span class="n">shoot</span>(); }</div></div></div></section>'+
      '<section class="stats-strip"><div><b>'+COURSES.length+'</b><span>Courses</span></div><div><b>'+LESSONS.length+'</b><span>Lessons</span></div><div><b>'+totalChallenges+'</b><span>Coding challenges</span></div><div><b>'+COURSES.length+'</b><span>Boss fights</span></div></section>'+
      '<section class="block"><div class="block-head"><h2>Your path</h2><p>Start with HTML, then CSS, then JavaScript. Every lesson ends with a battle round.</p></div>'+courseCards()+'</section>'+
      '<section class="block"><div class="block-head"><h2>Why CodeNPlay</h2><p>A friendly way to turn code into progress.</p></div><div class="feature-grid">'+
      '<article class="feature-card"><span>⌨️</span><h3>Live editor</h3><p>Write code and see your result as you work.</p></article><article class="feature-card"><span>💡</span><h3>Friendly hints</h3><p>Get small suggestions when you need a nudge.</p></article>'+
      '<article class="feature-card"><span>🎮</span><h3>Learn by playing</h3><p>Correct answers help your hero win battles.</p></article><article class="feature-card"><span>📈</span><h3>Track progress</h3><p>Earn XP, build streaks and unlock achievements.</p></article></div></section>'+
      '<section class="block"><div class="block-head"><h2>How every lesson works</h2></div><ol class="how"><li><b>1</b><h4>Learn</h4><p>Read a short, simple lesson with an example.</p></li><li><b>2</b><h4>Practice</h4><p>Type code in the editor and see the result right away.</p></li><li><b>3</b><h4>Fight</h4><p>Press Ready for Test. Each question is an enemy. Press Run: right code makes your hero strike.</p></li><li><b>4</b><h4>Win</h4><p>Walk through the portal to the next map. Beat the boss at the end of the course.</p></li></ol></section>'+
      '<section class="block faq"><div class="block-head"><h2>Frequently asked questions</h2></div>'+
      '<details><summary>Do I need to install anything?</summary><p>No. Open CodeNPlay in a modern browser and start learning.</p></details><details><summary>Is CodeNPlay free?</summary><p>Yes, the learning experience in this project is free.</p></details>'+
      '<details><summary>Where is my progress saved?</summary><p>Your progress is saved locally in this browser on this device.</p></details><details><summary>Is it okay for beginners?</summary><p>Absolutely. Lessons, hints and code suggestions are designed to help beginners.</p></details></section>'+
      '<footer class="foot site-foot"><div><b>CodeNPlay</b><small>Code. Learn. Play.</small></div><div><a href="#/learn">Courses</a><a href="#/story">Story Mode</a></div><button type="button" class="linkbtn" id="resetAll">Reset progress</button></footer>'
    );
    let alive=true;
    const dg=new Quest($('#demoCv'),{map:1,hero:getHero(),foes:[{kind:'zephyr'},{kind:'zephyr',hue:150},{kind:'zephyr',hue:280,scale:1.2}]}); cleanups.push(()=>{alive=false;dg.destroy();});
    (async()=>{while(alive){await dg.intro();for(let k=0;k<3&&alive;k++){await dg.wait(.6);if(k===1){await dg.miss();await dg.wait(.3);}await dg.hit();}if(!alive)break;await dg.finish();await dg.wait(.8);}})();
    $('#resetAll').onclick=()=>{if(confirm('Delete all your progress and XP on this device?')){S={xp:0,q:{},done:{},streak:{n:0,best:0,last:''},ach:{},perfect:0};save();home();toast('Progress reset');}};
  }

  function soundControl() {
    const on=Sfx.enabled();
    return '<button type="button" class="btn ghost sound-toggle" aria-pressed="'+on+'">Sound: '+(on?'On':'Off')+'</button>';
  }
  function bindSound(root) {
    root.querySelectorAll('.sound-toggle').forEach(b=>b.addEventListener('click',()=>{
      const next=!Sfx.enabled(); try{localStorage.setItem('cnp.sound',next?'on':'off');}catch(e){}
      root.querySelectorAll('.sound-toggle').forEach(x=>{x.textContent='Sound: '+(next?'On':'Off');x.setAttribute('aria-pressed',String(next));});
      if(next) Sfx.win();
    }));
  }
  function profile() {
    const level=playerLevel(), into=S.xp%100, need=100-into;
    const done=LESSONS.filter(l=>S.done[l.id]).length, challenges=Object.keys(S.q).length;
    const today=localDay(), y=new Date(); y.setDate(y.getDate()-1);
    const streakLive=S.streak.last===today||S.streak.last===localDay(y);
    const achievements=ACHIEVEMENTS.map(([id,name,desc])=>{
      const unlocked=!!S.ach[id];
      return '<article class="achievement '+(unlocked?'unlocked':'locked')+'"><span class="ach-icon">'+(unlocked?'🏆':'🔒')+'</span><div><b>'+name+'</b><small>'+desc+'</small></div></article>';
    }).join('');
    mount('<section class="block pad-top profile-page"><div class="block-head"><a class="back" href="#/">← Home</a><p class="eyebrow">PLAYER PROFILE</p><h1 class="h1s">Your progress</h1></div>'+
      '<div class="profile-hero"><div class="level-avatar">⚔️<small>LV '+level+'</small></div><div class="profile-level"><h2>Level '+level+'</h2><p>'+need+' XP to level '+(level+1)+'</p><div class="xpbar profile-xp"><i style="width:'+into+'%"></i></div></div>'+soundControl()+'</div>'+
      '<div class="profile-stats"><div><b>'+S.xp+'</b><span>Total XP</span></div><div><b>'+done+'</b><span>Lessons done</span></div><div><b>'+(streakLive?S.streak.n:0)+'</b><span>Day streak</span></div><div><b>'+S.streak.best+'</b><span>Best streak</span></div></div>'+
      '<div class="block-head"><h2>Achievements</h2><p>'+Object.keys(S.ach).length+' / '+ACHIEVEMENTS.length+' unlocked · '+challenges+' challenges solved</p></div><div class="achievement-grid">'+achievements+'</div></section>');
    bindSound(view);
  }

  function learn() {
    mount('<section class="block pad-top"><div class="block-head"><h1 class="h1s">All courses</h1><p>Pick a course. Follow the order for the best experience.</p></div>' + courseCards() + '</section>');
  }

  function course(id) {
    const c = COURSES.find((x) => x.id === id); if (!c) return notFound();
    const d = doneCount(c), t = c.lessons.length;
    const nxt = c.lessons.find((l) => !lessonDone(l.id));
    mount(
      '<section class="block pad-top"><a class="back" href="#/learn">' + ic('back') + ' All courses</a>' +
      '<div class="course-head c-' + c.id + '"><div><p class="eyebrow">' + c.tag + '</p><h1 class="h1s">' + c.name + ' course</h1><p class="lead sm">' + c.desc + '</p></div>' +
      '<div class="ring"><b>' + d + '/' + t + '</b><span>done</span></div></div>' +
      '<ol class="lessons">' + c.lessons.map((l, i) => {
        const done = lessonDone(l.id), isNext = nxt && nxt.id === l.id;
        return '<li><a class="lrow' + (done ? ' done' : '') + (isNext ? ' next' : '') + '" href="#/lesson/' + l.id + '"><span class="num">' + (done ? ic('check') : i + 1) + '</span>' +
          '<span class="lt"><b>' + esc(l.title) + '</b><small>' + (done ? 'Completed' : isNext ? 'Up next' : l.tests.length + ' enemies') + '</small></span>' + ic('arrow', 'chev') + '</a></li>';
      }).join('') + '</ol>' + bossRow(c) + '</section>'
    );
  }
  function bossRow(c) {
    const open = c.lessons.every((l) => lessonDone(l.id)), done = !!S.done[c.boss.id];
    return '<a class="lrow boss-row' + (done ? ' done' : open ? ' next' : ' locked') + '" href="' + (open ? '#/boss/' + c.id : '#/boss/' + c.id) + '"><span class="num">☠</span><span class="lt"><b>' + esc(c.boss.title) + '</b><small>' + (done ? 'Defeated' : open ? 'Boss portal is open' : 'Clear all maps to unlock') + ' · ' + c.boss.tests.length + ' questions</small></span>' + ic(open ? 'arrow' : 'lock', 'chev') + '</a>';
  }

  function lesson(id) {
    const l = lessonById(id); if (!l) return notFound();
    const c = l.course, idx = c.lessons.indexOf(l);
    const prev = c.lessons[idx - 1], next = c.lessons[idx + 1];
    mount(
      '<article class="lesson c-' + c.id + '">' +
      '<a class="back" href="#/course/' + c.id + '">' + ic('back') + ' ' + c.name + ' course</a>' +
      '<header class="l-head"><p class="eyebrow">' + c.name + ' · Lesson ' + (idx + 1) + ' of ' + c.lessons.length + '</p><h1 class="h1s">' + esc(l.title) + '</h1>' +
      '<ol class="steps"><li class="on">Learn</li><li>Practice</li><li>Test</li><li>Play</li></ol></header>' +
      '<section class="card learn"><h2><span class="badge">1</span> Learn</h2><div class="prose">' + fmt(l.intro) + '</div>' +
      '<div class="example"><div class="ex-head"><span>Example</span><button type="button" class="mini" id="tryEx">' + ic('copy') + '<span>Try in editor</span></button></div><pre class="code" id="exCode"></pre></div></section>' +
      '<section class="card practice" id="practice"><h2><span class="badge">2</span> Practice</h2>' +
      '<div class="task">' + ic('bulb') + '<div>' + fmt(l.task) + '</div></div><div id="wbSlot"></div></section>' +
      '<section class="card next"><h2><span class="badge">3</span> Ready?</h2><p class="muted">Practice as much as you like. When you feel ready, enter the battle map: ' + l.tests.length + ' questions, ' + l.tests.length + ' enemies. Write the code and press Run. Only the right code makes your hero strike, and after the last enemy a portal opens.</p>' +
      '<div class="cta"><a class="btn primary big" href="#/play/' + l.id + '">' + ic('flag') + ' Ready for Test</a>' +
      '<a class="btn ghost big" href="#/story">' + ic('pad') + ' Story map</a></div></section>' +
      '<nav class="pn">' + (prev ? '<a href="#/lesson/' + prev.id + '">' + ic('back') + ' ' + esc(prev.title) + '</a>' : '<span></span>') +
      (next ? '<a href="#/lesson/' + next.id + '">' + esc(next.title) + ' ' + ic('arrow') + '</a>' : '<span></span>') + '</nav></article>'
    );
    const ex = $('#exCode'); ex.innerHTML = highlight(l.example, l.kind);
    const wb = Workbench({ kind: l.kind, base: l.base, baseStyle: l.baseStyle, starter: l.starter }, cleanups);
    $('#wbSlot').appendChild(wb.el);
    $('#tryEx').onclick = () => { wb.setCode(l.example); $('#practice').scrollIntoView({ behavior: 'smooth', block: 'start' }); toast('Example loaded in the editor'); };
  }

  // =========================================================
  // STORY MODE: worlds, battles, bosses
  // =========================================================
  const HEART = '<img src="assets/pack/ui/heart_full.png" alt="" class="heartimg">';
  const HEART0 = '<img src="assets/pack/ui/heart_empty.png" alt="" class="heartimg">';
  const STAR = '<svg class="bigstar" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z"/></svg>';
  const mobileView = () => window.matchMedia('(max-width: 980px)').matches;
  const getHero = () => { try { const h = localStorage.getItem('cnp.hero'); return Quest.CHARS[h] && Quest.CHARS[h].role === 'Hero' ? h : 'codex'; } catch (e) { return 'codex'; } };
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
  const portraitFor = (key) => key === 'hero' ? 'heroes/' + getHero() + '/portrait.png' : key === 'zephyr' ? 'villains/zephyr/portrait.png' : key === 'titan' ? 'bosses/titan/portrait.png' : null;

  function lessonSpec(l) {
    const w = WORLDS[l.course.id], idx = l.course.lessons.indexOf(l), total = l.tests.length, h = heroName();
    const intro = idx === 0 ? (l.n === 1 ? w.intro(h) : w.intro(h)) : [['Narrator', LEVEL_LINES[idx % LEVEL_LINES.length].replace('%t', esc(l.title)), null]];
    const next = LESSONS[l.n] || null;
    return {
      id: l.id, kind: l.kind, base: l.base, baseStyle: l.baseStyle, tests: l.tests, boss: false, lesson: l,
      title: l.title, eyebrow: 'Map ' + l.n + ' · ' + MAP_NAME(mapOf(l)) + ' · ' + l.course.name, map: mapOf(l), course: l.course,
      foes: l.tests.map((_, i) => ({ kind: 'zephyr', hue: w.hue, scale: i === total - 1 ? 1.2 : 1, hits: 1 })),
      intro, back: '#/lesson/' + l.id, backLabel: 'Back to lesson',
      nextMap: next, nextHref: !next || next.course !== l.course ? '#/boss/' + l.course.id : '#/lesson/' + next.id,
      nextLabel: !next || next.course !== l.course ? 'Face the boss' : 'Next map',
      nextTitle: !next || next.course !== l.course ? l.course.boss.title : MAP_NAME(mapOf(next)) + ' · ' + next.title,
      outro: '', replay: '#/play/' + l.id, levels: '#/course/' + l.course.id,
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
      map: w.bossMap, course: c, foes: defs, intro: w.bossIntro(h), back: '#/course/' + c.id, backLabel: c.name + ' course',
      nextHref: nc ? '#/lesson/' + nc.lessons[0].id : '#/story', nextLabel: nc ? 'Enter ' + WORLDS[nc.id].place : 'Story map',
      nextTitle: nc ? nc.name + ' course · ' + WORLDS[nc.id].place : 'The journey is complete', outro: w.bossOutro, replay: '#/boss/' + c.id, levels: '#/story', last: !nc,
    };
  }

  // ---------- the battle screen: game + question + editor + output ----------
  function battle(spec) {
    const total = spec.tests.length, hero = getHero(), cid = spec.course.id;
    let qi = 0, fails = 0, hearts = 3, lost = 0, gained = 0, busy = true;
    const l = spec.lesson;

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
      wb.setCode(q.starter);
      say('', ''); $('#ansBtn').classList.add('hidden');
      pips(); kills();
    }
    drawHearts(); showQ(0);
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
          '<a class="btn ghost" id="replay" href="' + spec.replay + '">Replay</a><a class="btn ghost" href="#/story">Story map</a></div>');
        $('#replay').onclick = (e) => { e.preventDefault(); go(spec.replay); };
        if (mobileView()) ec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        busy = true;
      } else {
        showQ(qi + 1);
        if (mobileView()) $('#qcard').scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    async function lose(msg) {
      fails++; hearts--; lost++; Sfx.bad(); drawHearts();
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
      await dialog(spec.intro);
      await game.intro();
      busy = false;
      say('hint', 'An enemy blocks your path! Solve the question, then press <b>Run code</b>.');
    })();
  }

  function play(id) { const l = lessonById(id); if (!l) return notFound(); battle(lessonSpec(l)); }
  function bossFight(id) {
    const c = COURSES.find((x) => x.id === id); if (!c) return notFound();
    const left = c.lessons.filter((l) => !lessonDone(l.id)).length;
    if (left) {
      mount('<section class="block pad-top center"><p class="eyebrow">LOCKED</p><h1 class="h1s">' + esc(c.boss.title) + '</h1><p class="muted">The boss portal opens after you clear all ' + c.lessons.length + ' ' + c.name + ' maps. ' + left + ' left.</p><a class="btn primary big" href="#/story">Back to the story map</a></section>');
      return;
    }
    battle(bossSpec(c));
  }

  // ---------- story map ----------
  function story() {
    const hero = getHero(), nxt = nextLesson(), h = Quest.CHARS;
    const allDone = !nxt && COURSES.every((c) => S.done[c.boss.id]);
    const pickBoss = COURSES.find((c) => c.lessons.every((l) => lessonDone(l.id)) && !S.done[c.boss.id]);
    const goHref = pickBoss ? '#/boss/' + pickBoss.id : nxt ? '#/lesson/' + nxt.id : '#/learn';
    const goLabel = pickBoss ? 'Fight the boss' : !nxt ? 'Review lessons' : Object.keys(S.done).length ? 'Continue story' : 'Start story';
    const heroCards = ['codex', 'nova'].map((id) => '<button type="button" class="hero-pick' + (id === hero ? ' on' : '') + '" data-hero="' + id + '"><img src="assets/pack/' + h[id].portrait + '" alt=""><b>' + h[id].name + '</b><small>' + h[id].blurb + '</small></button>').join('');
    let unlockedAll = true;
    const worlds = COURSES.map((c, ci) => {
      const prevOk = ci === 0 || S.done[COURSES[ci - 1].boss.id];
      const nodes = c.lessons.map((lsn, i) => {
        const done = lessonDone(lsn.id), isNext = nxt && nxt.id === lsn.id;
        const open = done || isNext;
        const stateCls = done ? 'done' : isNext ? 'next' : 'locked';
        const inner = '<span class="n-bg" style="background-image:url(assets/pack/backgrounds/' + Quest.MAPS[mapOf(lsn)].file + '.png)"></span><span class="n-no">' + (done ? ic('check') : i + 1) + '</span><b>' + esc(lsn.title) + '</b><small>' + (done ? 'Cleared' : isNext ? 'Next map' : 'Locked') + ' · ' + lsn.tests.length + ' enemies</small>';
        return open ? '<a class="snode ' + stateCls + '" href="#/lesson/' + lsn.id + '">' + inner + '</a>' : '<div class="snode locked">' + inner + '</div>';
      }).join('');
      const bossOpen = c.lessons.every((x) => lessonDone(x.id)), bossDone = !!S.done[c.boss.id];
      const bossNode = (bossOpen ? '<a class="snode boss ' + (bossDone ? 'done' : 'next') + '" href="#/boss/' + c.id + '">' : '<div class="snode boss locked">') +
        '<span class="n-bg" style="background-image:url(assets/pack/backgrounds/' + Quest.MAPS[WORLDS[c.id].bossMap].file + '.png)"></span><span class="n-no">☠</span><b>' + esc(c.boss.title.replace('Boss: ', '')) + '</b><small>' + (bossDone ? 'Defeated' : bossOpen ? 'Boss portal is open!' : 'Clear all maps first') + '</small>' + (bossOpen ? '</a>' : '</div>');
      return '<section class="sworld c-' + c.id + '"><header><p class="eyebrow">World ' + (ci + 1) + ' · ' + c.name + '</p><h2>' + WORLDS[c.id].place + '</h2><p class="muted">' + doneCount(c) + ' / ' + c.lessons.length + ' maps cleared' + (bossDone ? ' · boss defeated' : '') + '</p></header><div class="snodes">' + nodes + bossNode + '</div></section>';
    }).join('');
    mount('<section class="block pad-top story-page"><div class="block-head"><a class="back" href="#/">' + ic('back') + ' Home</a><p class="eyebrow">STORY MODE</p><h1 class="h1s">The Last Debugger</h1>' +
      '<p class="lead sm">The Null King released the Bugs on Code City. Fight through 3 worlds. In every map, write real code to defeat the enemies, walk through the portal, and meet the boss at the end of each course.</p></div>' +
      '<div class="hero-picks"><p class="eyebrow">CHOOSE YOUR HERO</p><div class="hp-row">' + heroCards + '</div></div>' +
      (allDone ? '<p class="win-banner">🏆 You saved Code City! Replay any map to earn stars.</p>' : '') +
      '<div class="cta"><a class="btn primary big" href="' + goHref + '">' + goLabel + ' ' + ic('arrow') + '</a><a class="btn ghost big" href="#/learn">All courses</a></div>' + worlds + '</section>');
    view.querySelectorAll('.hero-pick').forEach((b) => b.addEventListener('click', () => { try { localStorage.setItem('cnp.hero', b.dataset.hero); } catch (e) {} Sfx.win(); story(); }));
  }

  function notFound() {
    mount('<section class="block pad-top center"><h1 class="h1s">Page not found</h1><p class="muted">That page does not exist.</p><a class="btn primary" href="#/">Go home</a></section>');
  }

  // =========================================================
  // Router + header
  // =========================================================
  function go(h) { if (location.hash === h) route(); else location.hash = h; }

  function route() {
    cleanups.forEach((f) => { try { f(); } catch (e) {} });
    cleanups = [];
    const m = $('#modal'); m.classList.remove('open'); m.innerHTML = '';
    const p = (location.hash || '#/').slice(1);
    let r;
    if (p === '/' || p === '') home();
    else if (p === '/learn') learn();
    else if ((r = p.match(/^\/course\/([\w-]+)$/))) course(r[1]);
    else if ((r = p.match(/^\/lesson\/([\w-]+)$/))) lesson(r[1]);
    else if ((r = p.match(/^\/play\/([\w-]+)$/))) play(r[1]);
    else if ((r = p.match(/^\/boss\/([\w-]+)$/))) bossFight(r[1]);
    else if (p === '/story') story();
    else if (p === '/profile') profile();
    else notFound();
    window.scrollTo(0, 0);
    const area = p === '/profile' ? 'profile' : /^\/(story|play|boss)/.test(p) ? 'story' : /^\/(learn|course|lesson)/.test(p) ? 'learn' : 'home';
    document.querySelectorAll('[data-nav]').forEach((a) => a.classList.toggle('active', a.dataset.nav === area));
    document.body.dataset.area = area;
  }

  function updateXp() {
    const x = $('#xpChip'); if (!x) return;
    const today=localDay(), y=new Date(); y.setDate(y.getDate()-1); const live=S.streak.last===today||S.streak.last===localDay(y);
    x.innerHTML = '<span class="lv">Lv ' + playerLevel() + '</span><span class="xpbar"><i style="width:' + (S.xp % 100) + '%"></i></span><b>' + S.xp + ' XP</b>'+(live?'<span class="streak-chip">🔥 '+S.streak.n+'</span>':'');
  }

  window.addEventListener('hashchange', route);
  updateXp();
  route();
  window.CNP = { LESSONS, COURSES, Runner: window.Runner, Sfx, get state() { return S; } };
})();
