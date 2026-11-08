/* =========================================================
   CodeNPlay - code editor (syntax highlight + Workbench)
   used by courses.html and story.html
   ========================================================= */
(function () {
  'use strict';
  const { $, esc, ic } = window.CNP;
  const Runner = window.Runner, Auth = window.CNPAuth;
  const _t = window.I18N ? window.I18N.t : function(k){ return k; };
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
      '<button type="button" data-tab="code" class="on" role="tab" aria-selected="true">'+_t('code')+'</button>' +
      '<button type="button" data-tab="out" role="tab" aria-selected="false">'+_t('output')+'</button></div>' +
      '<div class="wb-grid">' +
      '<section class="pane pane-code">' +
      '<div class="pane-head"><span class="file"><i class="dot"></i>' + FILE[kind] + '</span>' +
      '<span class="acts"><button type="button" class="mini suggest-toggle" data-act="suggestions" aria-pressed="true" title="Turn code suggestions on or off">'+_t('suggestionsOn')+'</button><button type="button" class="mini" data-act="reset" title="Reset code">' + ic('reset') + '<span>'+_t('reset')+'</span></button>' +
      '<button type="button" class="mini run" data-act="run">' + ic('run') + '<span>' + (o.runLabel || _t('run')) + '</span></button></span></div>' +
      '<div class="ed"><pre class="gutter" aria-hidden="true"></pre><div class="ed-main"><pre class="hl" aria-hidden="true"></pre>' +
      '<textarea spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" wrap="off" aria-label="Code editor"></textarea></div></div>' +
      '<div class="symbols"><button type="button" data-ins="  ">Tab</button>' +
      SYMBOLS[kind].map((s) => '<button type="button" data-ins="' + esc(s) + '">' + esc(s) + '</button>').join('') + '</div>' +
      '<div class="suggestions" aria-label="Code suggestions"><span class="suggestions-label">'+_t('tryNext')+'</span><div class="suggestion-list"></div></div>' +
      '</section>' +
      '<section class="pane pane-out">' +
      '<div class="pane-head"><span class="file"><i class="dot out"></i><b class="out-label">'+_t('output')+'</b></span><span class="acts"><button type="button" class="mini back-code" data-tab="code">'+_t('backToCode')+'</button></span></div>' +
      '<iframe class="preview" sandbox="allow-scripts allow-same-origin" title="Output"></iframe>' +
      (kind === 'js' ? '<div class="console"><div class="console-head">'+_t('console_')+'</div><div class="console-body" aria-live="polite"></div></div>' : '') +
      '</section></div>' +
      (kind !== 'html' && o.base ? '<details class="base"><summary>'+_t('pageHtmlUsed')+'</summary><pre>' + esc(o.base) + '</pre></details>' : '');

    const ta = $('textarea', root), hl = $('.hl', root), gut = $('.gutter', root);
    const frame = $('.preview', root), cbody = $('.console-body', root);
    const suggestionBox = $('.suggestions', root), suggestionList = $('.suggestion-list', root);
    let suggestionsOn = true, custom = o.suggestions || [];
    suggestionsOn = Auth.pref('suggestions', 'on') !== 'off';
    // your code is saved while you type: refresh, close the tab or leave Chrome and it is still here
    let draftKey = o.draftKey || null, restored = false;
    ta.value = o.starter || '';
    if (draftKey) { const d = Auth.drafts.get(draftKey); if (typeof d === 'string' && d !== ta.value) { ta.value = d; restored = true; } }

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
      if (toggle) { toggle.textContent = suggestionsOn ? _t('suggestionsOn') : _t('suggestionsOff'); toggle.setAttribute('aria-pressed', String(suggestionsOn)); }
      suggestionBox.classList.toggle('is-off', !suggestionsOn);
      if (!suggestionsOn) { suggestionList.innerHTML = ''; return; }
      const token=currentToken();
      const hash=(str)=>{let h=7;for(let i=0;i<str.length;i++)h=(h*31+str.charCodeAt(i))>>>0;return h;};
      let all=suggestionSets[kind];
      if (custom.length) {
        const mine=custom.slice(0,5), decoys=suggestionSets[kind].filter(g=>!mine.some(c=>c.label===g.label));
        const pool=mine.concat(decoys.slice().sort((a,b)=>hash(a.label)-hash(b.label)).slice(0,Math.max(3,8-mine.length)));
        all=pool.sort((a,b)=>hash(a.label)-hash(b.label)).concat(decoys.filter(d=>!pool.includes(d)));
      }
      const matches=token ? all.filter(item=>item.key.startsWith(token) && item.key!==token) : [];
      const shown=(matches.length?matches:all).slice(0, custom.length ? 8 : 4);
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
      cons.classList.add('has-logs');
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

    // JS: show the page Output only when the code works with the page (DOM). Otherwise the Console takes its place.
    const DOM_RX = /\bdocument\b|\bwindow\b|getElementById|querySelector|innerHTML|textContent|addEventListener|\.style\b|classList|createElement/;
    const pout = $('.pane-out', root), outLabel = $('.out-label', root), cons = $('.console', root);
    function modeFor(codeText) {
      if (kind !== 'js') return;
      const ui = DOM_RX.test(codeText);
      pout.classList.toggle('has-ui', ui); pout.classList.toggle('only-console', !ui);
      outLabel.textContent = ui ? _t('output') : _t('console_');
      cons.classList.remove('has-logs');
    }
    function run(fromUser) {
      if (cbody) cbody.innerHTML = '';
      modeFor(ta.value);
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
      if (draftKey) Auth.drafts.set(draftKey, ta.value);
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
      if (b.dataset.tab) {
        tab(b.dataset.tab);
        if (b.classList.contains('back-code')) {
          // go back to the code: show the code pane, put the cursor at the end and flash the pane so the click is visible
          const pc = root.querySelector('.pane-code');
          if (pc && pc.scrollIntoView) pc.scrollIntoView({ behavior: 'smooth', block: 'center' });
          ta.focus({ preventScroll: true }); try { ta.setSelectionRange(ta.value.length, ta.value.length); } catch (e) {}
          if (pc) { pc.classList.remove('flash'); void pc.offsetWidth; pc.classList.add('flash'); setTimeout(() => pc.classList.remove('flash'), 900); }
        }
      }
      else if (b.dataset.suggest !== undefined) applySuggestion(b.dataset.suggest, b.dataset.replace);
      else if (b.dataset.act === 'suggestions') {
        suggestionsOn = !suggestionsOn;
        Auth.setPref('suggestions', suggestionsOn ? 'on' : 'off');
        renderSuggestions();
      }
      else if (b.dataset.ins !== undefined) { insert(b.dataset.ins); ta.focus(); }
      else if (b.dataset.act === 'run') run(true);
      else if (b.dataset.act === 'reset') { ta.value = o.starter || ''; if (draftKey) Auth.drafts.del(draftKey); paint(); run(false); if (o.onChange) o.onChange(ta.value); }
    });

    paint();
    renderSuggestions();
    ta.addEventListener('keyup', renderSuggestions);
    ta.addEventListener('click', renderSuggestions);
    setTimeout(() => run(false), 0);

    return {
      el: root,
      getCode: () => ta.value,
      setCode: (c) => { ta.value = c; if (draftKey) Auth.drafts.set(draftKey, c); paint(); run(false); },
      setSuggestions: (list) => { custom = list || []; renderSuggestions(); },
      setDraftKey: (k) => { draftKey = k || null; },
      restored: restored,
      run: () => run(true),
      tab: tab,
      refresh: () => run(false),
      setBase: (b, st) => { o.base = b; o.baseStyle = st; run(false); },
    };
  }
  window.CNP.highlight = highlight;
  window.CNP.Workbench = Workbench;
})();
