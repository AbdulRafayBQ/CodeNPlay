/* =========================================================
   CodeNPlay - more code questions (loaded after lessons-more.js, before core.js)
   Every topic test now has 5 coding questions (the last enemy is a boss),
   and every level boss has 6.
   ========================================================= */
(function () {
  const ALL = () => window.COURSES.flatMap((c) => c.lessons);
  const lesson = (id) => ALL().find((l) => l.id === id);
  const $ = (c, s) => c.doc.querySelector(s), $$ = (c, s) => Array.from(c.doc.querySelectorAll(s));
  const T = (e) => (e ? e.textContent.trim().toLowerCase() : '');
  const cs = (c, s) => { const e = $(c, s); return e ? c.win.getComputedStyle(e) : null; };
  const rgb = (v) => { const m = (v || '').match(/[\d.]+/g); return m ? m.slice(0, 3).map(Number) : [0, 0, 0]; };
  const isRed = ([r, g, b]) => r > 200 && g < 90 && b < 90;
  const isGreen = ([r, g, b]) => g >= 100 && g > r + 40 && g > b + 40;
  const isWhite = ([r, g, b]) => r > 235 && g > 235 && b > 235;
  const isYellow = ([r, g, b]) => r > 200 && g > 200 && b < 130;
  const isBlue = ([r, g, b]) => b > 180 && r < 110 && g < 150;
  const isOrange = ([r, g, b]) => r > 220 && g > 110 && g < 200 && b < 90;
  const last = (c) => c.logs[c.logs.length - 1];
  const need = (c, sel, name) => ($(c, sel) ? null : 'I cannot find ' + (name || sel) + ' on the page.');
  const setNum = (code, name, v) => code.replace(new RegExp(name + '\\s*=\\s*-?\\d+'), name + ' = ' + v);
  // run a list of rules, the first one that returns a message (string) stops
  const all = (...fs) => (c) => { for (const f of fs) { const r = f(c); if (r !== true && r !== null && r !== undefined) return r; } return true; };
  const prop = (sel, p, val, msg) => (c) => { const s = cs(c, sel); if (!s) return 'I cannot find ' + sel + ' on the page.'; return [].concat(val).includes(s[p]) ? true : msg; };
  const rx = (re, msg) => (c) => re.test(c.code) || msg;
  const HH = '<!-- write your code here -->\n', CH = '/* write your code here */\n', JH = '// write your code here\n';
  const H = (q, hint, solution, check) => ({ q, hint, solution, check, starter: HH });
  const K = (q, hint, solution, check) => ({ q, hint, solution, check, starter: CH });
  const J = (q, hint, solution, check, starter) => ({ q, hint, solution, check, starter: starter || JH });
  const add = (id, ...tests) => { const l = lesson(id); if (l) tests.forEach((t) => l.tests.push(t)); };
  const before = (a, b) => !!(a && b && (a.compareDocumentPosition(b) & 4));
  const px = (v) => parseFloat(v);
  const tracks = (c, s) => { const v = cs(c, s).gridTemplateColumns; return v && v !== 'none' ? v.split(/\s+/).length : 0; };

  // ================= HTML =================
  add('html-1', H('Write a `<p>` that says **Ready?** and under it an `<h3>` that says **Go**.', '<p>Ready?</p> then <h3>Go</h3>', '<p>Ready?</p>\n<h3>Go</h3>',
    all(prop('p', 'display', 'block', 'I cannot find a <p> on the page.'), (c) => (T($(c, 'p')) !== 'ready?' ? 'The p should say: Ready?' : need(c, 'h3', 'an <h3>')), (c) => T($(c, 'h3')) === 'go' || 'The h3 should say: Go')));
  add('html-2',
    H('Write a paragraph with **Fast** in `<strong>` and **Light** in `<em>`, in that order.', '<p><strong>Fast</strong> and <em>Light</em></p>', '<p><strong>Fast</strong> and <em>Light</em></p>',
      all((c) => need(c, 'p strong', '<strong> inside a <p>'), (c) => need(c, 'p em', '<em> inside a <p>'), (c) => (T($(c, 'strong')) !== 'fast' ? 'The bold word should be Fast.' : T($(c, 'em')) !== 'light' ? 'The italic word should be Light.' : before($(c, 'strong'), $(c, 'em')) || 'Fast must come before Light.'))),
    H('Write one paragraph that has **two** line breaks (`<br>`) inside it.', 'Use <br> twice inside <p>...</p>', '<p>Line one<br>Line two<br>Line three</p>', (c) => $$(c, 'p br').length >= 2 || 'Put two <br> tags inside one <p>.'));
  add('html-3',
    H('Make a link that says **Docs** and goes to `https://docs.example.com`.', '<a href="https://docs.example.com">Docs</a>', '<a href="https://docs.example.com">Docs</a>',
      all((c) => need(c, 'a', 'an <a> link'), (c) => (T($(c, 'a')) !== 'docs' ? 'The link text should be: Docs' : ($(c, 'a').getAttribute('href') || '').includes('docs.example.com') || 'The link should go to https://docs.example.com'))),
    H('Make **two** links: one to `https://a.com` and one to `https://b.com`.', 'Two <a href="..."> tags.', '<a href="https://a.com">A</a>\n<a href="https://b.com">B</a>',
      (c) => { const h = $$(c, 'a').map((a) => a.getAttribute('href') || ''); return h.some((x) => x.includes('a.com')) && h.some((x) => x.includes('b.com')) || 'You need one link to https://a.com and one to https://b.com.'; }));
  add('html-4', H('Make a `<ul>` with **2** items where the first item contains a `<strong>` word.', '<ul><li><strong>..</strong></li><li>..</li></ul>', '<ul>\n  <li><strong>Sword</strong> of fire</li>\n  <li>Shield</li>\n</ul>',
    all((c) => need(c, 'ul', 'a <ul>'), (c) => ($$(c, 'ul > li').length === 2 ? true : 'The list needs exactly 2 items.'), (c) => need(c, 'ul > li:first-child strong', '<strong> inside the first item'))));
  add('html-5',
    H('Make a text `<input>` with `placeholder="Enter code"`.', '<input type="text" placeholder="Enter code">', '<input type="text" placeholder="Enter code">',
      all((c) => need(c, 'input', 'an <input>'), (c) => ($(c, 'input').getAttribute('placeholder') === 'Enter code' || 'The placeholder should be: Enter code'))),
    H('Make two buttons: one that says **Yes** and one that says **No**.', 'Two <button> tags.', '<button>Yes</button>\n<button>No</button>',
      (c) => { const t = $$(c, 'button').map(T); return t.includes('yes') && t.includes('no') || 'You need a Yes button and a No button.'; }));
  add('html-6', H('Make a `<div>` with **two** classes, `card` and `big`, that contains the text **Boss**.', 'class="card big"', '<div class="card big">Boss</div>',
    all((c) => need(c, 'div.card.big', 'a <div class="card big">'), (c) => T($(c, 'div.card.big')) === 'boss' || 'The text should be: Boss')));
  add('html-7',
    H('Make a `<form>` that contains a `<button type="submit">` that says **Send**.', '<form><button type="submit">Send</button></form>', '<form>\n  <button type="submit">Send</button>\n</form>',
      all((c) => need(c, 'form', 'a <form>'), (c) => need(c, 'form button[type="submit"]', 'a submit button inside the form'), (c) => T($(c, 'form button')) === 'send' || 'The button should say: Send')),
    H('Make a form with **two** labels: **First** (for `a`) and **Last** (for `b`), each with an input that has the matching id.', '<label for="a">First</label><input id="a">', '<form>\n  <label for="a">First</label>\n  <input type="text" id="a">\n  <label for="b">Last</label>\n  <input type="text" id="b">\n</form>',
      all((c) => need(c, 'label[for="a"]', 'a label for a'), (c) => need(c, 'label[for="b"]', 'a label for b'), (c) => need(c, 'input#a', 'an input with id="a"'), (c) => need(c, 'input#b', 'an input with id="b"'),
        (c) => (T($(c, 'label[for="a"]')) !== 'first' ? 'The first label should say: First' : T($(c, 'label[for="b"]')) === 'last' || 'The second label should say: Last'))),
    H('Make a `<form action="/join">` that contains one text input.', '<form action="/join"><input type="text"></form>', '<form action="/join">\n  <input type="text">\n</form>',
      all((c) => need(c, 'form[action="/join"]', 'a form with action="/join"'), (c) => need(c, 'form input', 'an input inside the form'))));
  add('html-8',
    H('Make an input of type **date**.', '<input type="date">', '<input type="date">', (c) => need(c, 'input[type="date"]', 'an <input type="date">') || true),
    H('Make a **range** input with `min="0"` and `max="100"`.', '<input type="range" min="0" max="100">', '<input type="range" min="0" max="100">',
      all((c) => need(c, 'input[type="range"]', 'an <input type="range">'), (c) => ($(c, 'input').getAttribute('min') === '0' && $(c, 'input').getAttribute('max') === '100') || 'Use min="0" and max="100".')));
  add('html-9',
    H('Make a `<select>` with the options **Easy**, **Medium** and **Hard**, in that order.', '<select><option>Easy</option>...</select>', '<select>\n  <option>Easy</option>\n  <option>Medium</option>\n  <option>Hard</option>\n</select>',
      all((c) => need(c, 'select', 'a <select>'), (c) => $$(c, 'select option').map(T).join('|') === 'easy|medium|hard' || 'Options should be Easy, Medium, Hard in that order.')),
    H('Make a `<textarea>` with `placeholder="Your story"` and `cols="30"`.', '<textarea placeholder="Your story" cols="30"></textarea>', '<textarea placeholder="Your story" cols="30"></textarea>',
      all((c) => need(c, 'textarea', 'a <textarea>'), (c) => ($(c, 'textarea').getAttribute('placeholder') === 'Your story' ? true : 'The placeholder should be: Your story'), (c) => $(c, 'textarea').getAttribute('cols') === '30' || 'Use cols="30".')));
  add('html-10',
    H('Make a text input with `maxlength="10"`.', '<input type="text" maxlength="10">', '<input type="text" maxlength="10">', all((c) => need(c, 'input', 'an <input>'), (c) => $(c, 'input').getAttribute('maxlength') === '10' || 'Use maxlength="10".')),
    H('Make a `<form method="post">` with a text input that has `name="email"`.', '<form method="post"><input name="email"></form>', '<form method="post">\n  <input type="text" name="email">\n</form>',
      all((c) => need(c, 'form[method="post"]', 'a form with method="post"'), (c) => need(c, 'form input[name="email"]', 'an input with name="email"'))));
  add('html-11',
    H('Make a table with **2** data rows, each row has two `<td>` cells.', '<table><tr><td>..</td><td>..</td></tr> x2</table>', '<table>\n  <tr><td>Hero</td><td>100</td></tr>\n  <tr><td>Mage</td><td>80</td></tr>\n</table>',
      all((c) => need(c, 'table', 'a <table>'), (c) => ($$(c, 'tr').filter((r) => r.querySelectorAll('td').length === 2).length >= 2 ? true : 'You need 2 rows that each have two <td> cells.'))),
    H('Make a table with one row of **3** header cells: **A**, **B**, **C**.', '<tr><th>A</th><th>B</th><th>C</th></tr>', '<table>\n  <tr><th>A</th><th>B</th><th>C</th></tr>\n</table>',
      all((c) => need(c, 'table', 'a <table>'), (c) => $$(c, 'th').map(T).join('') === 'abc' || 'The three <th> cells should say A, B and C.')));
  add('html-12',
    H('Make a table where one `<td>` has `colspan="3"`.', '<td colspan="3">', '<table>\n  <tr><td colspan="3">Wide</td></tr>\n  <tr><td>1</td><td>2</td><td>3</td></tr>\n</table>', all((c) => need(c, 'table', 'a <table>'), (c) => need(c, 'td[colspan="3"]', 'a <td colspan="3">'))),
    H('Make a table with a `<caption>` that says **Players** and one `<th>` with `rowspan="2"`.', '<caption>Players</caption> and <th rowspan="2">', '<table>\n  <caption>Players</caption>\n  <tr><th rowspan="2">Name</th><td>Hero</td></tr>\n  <tr><td>Mage</td></tr>\n</table>',
      all((c) => need(c, 'table caption', 'a <caption>'), (c) => (T($(c, 'caption')) === 'players' ? true : 'The caption should say: Players'), (c) => need(c, 'th[rowspan="2"]', 'a <th rowspan="2">'))));

  // ================= CSS =================
  add('css-1', K('Make the `p.info` text **orange** and the `h1` text **green**.', 'p.info { color: orange; } h1 { color: green; }', 'p.info { color: orange; }\nh1 { color: green; }',
    (c) => (!isGreen(rgb(cs(c, 'h1').color)) ? 'The h1 should be green.' : isOrange(rgb(cs(c, 'p.info').color)) || 'The p should be orange.')));
  add('css-2',
    K('Make the `p` **italic** and give it a font size of **20px**.', 'p { font-style: italic; font-size: 20px; }', 'p { font-style: italic; font-size: 20px; }',
      (c) => (cs(c, 'p').fontStyle !== 'italic' ? 'Use font-style: italic;' : cs(c, 'p').fontSize === '20px' || 'Use font-size: 20px;')),
    K('Give the `p` a `line-height` of **2** and the `h1` a `letter-spacing` of **3px**.', 'p { line-height: 2; } h1 { letter-spacing: 3px; }', 'p { line-height: 2; }\nh1 { letter-spacing: 3px; }',
      (c) => (px(cs(c, 'p').lineHeight) !== 32 ? 'Use line-height: 2; on p.' : cs(c, 'h1').letterSpacing === '3px' || 'Use letter-spacing: 3px; on h1.')));
  add('css-3',
    K('Give `.box` a padding of **10px 30px** (10px top and bottom, 30px left and right).', '.box { padding: 10px 30px; }', '.box { padding: 10px 30px; }',
      (c) => { const s = cs(c, '.box'); return s.paddingTop === '10px' && s.paddingBottom === '10px' && s.paddingLeft === '30px' && s.paddingRight === '30px' || 'Use padding: 10px 30px;'; }),
    K('Give `.box` a **2px dashed** border and a **margin-bottom of 40px**.', '.box { border: 2px dashed black; margin-bottom: 40px; }', '.box { border: 2px dashed black; margin-bottom: 40px; }',
      (c) => { const s = cs(c, '.box'); return s.borderTopWidth !== '2px' || s.borderTopStyle !== 'dashed' ? 'Use border: 2px dashed <color>;' : s.marginBottom === '40px' || 'Use margin-bottom: 40px;'; }));
  add('css-4',
    K('Use the `p` selector to make **every** paragraph font size **22px**.', 'p { font-size: 22px; }', 'p { font-size: 22px; }', (c) => $$(c, 'p').every((e) => c.win.getComputedStyle(e).fontSize === '22px') || 'All paragraphs should be 22px.'),
    K('Write ONE rule for `.enemy, .hero` (separated by a comma) that makes both **bold**.', '.enemy, .hero { font-weight: bold; }', '.enemy, .hero { font-weight: bold; }',
      (c) => (['700', 'bold'].includes(cs(c, '.enemy').fontWeight) && ['700', 'bold'].includes(cs(c, '.hero').fontWeight) ? /\.enemy\s*,\s*\.hero|\.hero\s*,\s*\.enemy/.test(c.code) || 'Use one rule with a comma: .enemy, .hero { }' : 'Both .enemy and .hero should be bold.')));
  add('css-5', K('Make `.row` flex with `align-items: center;` and `justify-content: flex-end;`.', '.row { display: flex; align-items: center; justify-content: flex-end; }', '.row { display: flex; align-items: center; justify-content: flex-end; }',
    all(prop('.row', 'display', 'flex', 'Use display: flex;'), prop('.row', 'alignItems', 'center', 'Use align-items: center;'), prop('.row', 'justifyContent', ['flex-end', 'end'], 'Use justify-content: flex-end;'))));
  add('css-6',
    K('Give `.btn` a **2px solid white** border and a **border-radius of 8px**.', '.btn { border: 2px solid white; border-radius: 8px; }', '.btn { border: 2px solid white; border-radius: 8px; }',
      (c) => { const s = cs(c, '.btn'); return s.borderTopWidth !== '2px' || s.borderTopStyle !== 'solid' ? 'Use border: 2px solid white;' : s.borderTopLeftRadius === '8px' || 'Use border-radius: 8px;'; }),
    K('Add a `.btn:hover` rule that changes the **color** of the text.', '.btn:hover { color: yellow; }', '.btn:hover { color: yellow; }', rx(/\.btn\s*:hover\s*\{[^}]*(^|[;\s{])color\s*:/i, 'Write a .btn:hover { } rule with a color: inside.')));
  add('css-7',
    K('Make `.item` use `display: block;` and a **width of 120px**.', '.item { display: block; width: 120px; }', '.item { display: block; width: 120px; }', all(prop('.item', 'display', 'block', 'Use display: block;'), prop('.item', 'width', '120px', 'Use width: 120px;'))),
    K('Hide only the **first** `.item` with `.item:first-child { display: none; }`.', '.item:first-child { display: none; }', '.item:first-child { display: none; }',
      (c) => (cs(c, '.item:first-child').display !== 'none' ? 'The first .item should have display: none;' : $$(c, '.item').filter((e) => c.win.getComputedStyle(e).display !== 'none').length === 2 || 'Only the first item should be hidden.')));
  add('css-8',
    K('Make `.box` flex with `flex-direction: row;` and a `gap: 10px;`.', '.box { display: flex; flex-direction: row; gap: 10px; }', '.box { display: flex; flex-direction: row; gap: 10px; }',
      all(prop('.box', 'display', 'flex', 'Use display: flex;'), prop('.box', 'flexDirection', 'row', 'Use flex-direction: row;'), prop('.box', 'columnGap', '10px', 'Use gap: 10px;'))),
    K('Make `.box` flex with `flex-direction: column-reverse;`.', '.box { display: flex; flex-direction: column-reverse; }', '.box { display: flex; flex-direction: column-reverse; }', all(prop('.box', 'display', 'flex', 'Use display: flex;'), prop('.box', 'flexDirection', 'column-reverse', 'Use flex-direction: column-reverse;'))),
    K('Make `.box` a flex **column** and center its items with `align-items: center;`.', '.box { display: flex; flex-direction: column; align-items: center; }', '.box { display: flex; flex-direction: column; align-items: center; }',
      all(prop('.box', 'display', 'flex', 'Use display: flex;'), prop('.box', 'flexDirection', 'column', 'Use flex-direction: column;'), prop('.box', 'alignItems', 'center', 'Use align-items: center;'))));
  add('css-9',
    K('Make `.box` flex with `justify-content: space-around;`.', '.box { display: flex; justify-content: space-around; }', '.box { display: flex; justify-content: space-around; }', all(prop('.box', 'display', 'flex', 'Use display: flex;'), prop('.box', 'justifyContent', 'space-around', 'Use justify-content: space-around;'))),
    K('Make `.box` flex with `justify-content: flex-start;` and a `gap: 20px;`.', '.box { display: flex; justify-content: flex-start; gap: 20px; }', '.box { display: flex; justify-content: flex-start; gap: 20px; }',
      all(prop('.box', 'display', 'flex', 'Use display: flex;'), prop('.box', 'justifyContent', ['flex-start', 'start', 'normal'], 'Use justify-content: flex-start;'), prop('.box', 'columnGap', '20px', 'Use gap: 20px;'), rx(/justify-content\s*:\s*flex-start/, 'Write justify-content: flex-start;'))));
  add('css-10',
    K('Make `.box` flex with `height: 200px;` and `align-items: flex-start;`.', '.box { display: flex; height: 200px; align-items: flex-start; }', '.box { display: flex; height: 200px; align-items: flex-start; }',
      all(prop('.box', 'display', 'flex', 'Use display: flex;'), prop('.box', 'height', '200px', 'Use height: 200px;'), prop('.box', 'alignItems', ['flex-start', 'start'], 'Use align-items: flex-start;'))),
    K('Make `.box` flex with `height: 150px`, `align-items: center` and `justify-content: space-between`.', '.box { display: flex; height: 150px; align-items: center; justify-content: space-between; }', '.box { display: flex; height: 150px; align-items: center; justify-content: space-between; }',
      all(prop('.box', 'display', 'flex', 'Use display: flex;'), prop('.box', 'height', '150px', 'Use height: 150px;'), prop('.box', 'alignItems', 'center', 'Use align-items: center;'), prop('.box', 'justifyContent', 'space-between', 'Use justify-content: space-between;'))));
  add('css-11',
    K('Make `.box` flex with `flex-wrap: nowrap;` and a `gap: 5px;`.', '.box { display: flex; flex-wrap: nowrap; gap: 5px; }', '.box { display: flex; flex-wrap: nowrap; gap: 5px; }',
      all(prop('.box', 'display', 'flex', 'Use display: flex;'), prop('.box', 'flexWrap', 'nowrap', 'Use flex-wrap: nowrap;'), prop('.box', 'columnGap', '5px', 'Use gap: 5px;'), rx(/flex-wrap\s*:\s*nowrap/, 'Write flex-wrap: nowrap;'))),
    K('Make `.box` flex with `flex-wrap: wrap`, `row-gap: 20px` and `column-gap: 8px`.', '.box { display: flex; flex-wrap: wrap; row-gap: 20px; column-gap: 8px; }', '.box { display: flex; flex-wrap: wrap; row-gap: 20px; column-gap: 8px; }',
      all(prop('.box', 'display', 'flex', 'Use display: flex;'), prop('.box', 'flexWrap', 'wrap', 'Use flex-wrap: wrap;'), prop('.box', 'rowGap', '20px', 'Use row-gap: 20px;'), prop('.box', 'columnGap', '8px', 'Use column-gap: 8px;'))),
    K('Make `.box` flex with `gap: 10px 25px;` (10px between rows, 25px between columns).', '.box { display: flex; gap: 10px 25px; }', '.box { display: flex; gap: 10px 25px; }',
      all(prop('.box', 'display', 'flex', 'Use display: flex;'), prop('.box', 'rowGap', '10px', 'The row gap should be 10px.'), prop('.box', 'columnGap', '25px', 'The column gap should be 25px.'))));
  add('css-12',
    K('Make `.box` flex and give `.item:last-child` a **flex-grow of 2**.', '.item:last-child { flex-grow: 2; }', '.box { display: flex; }\n.item:last-child { flex-grow: 2; }', all(prop('.box', 'display', 'flex', 'Use display: flex;'), prop('.item:last-child', 'flexGrow', '2', 'Use flex-grow: 2; on .item:last-child'))),
    K('Make `.box` flex and give every `.item` the short rule `flex: 1;`.', '.item { flex: 1; }', '.box { display: flex; }\n.item { flex: 1; }', all(prop('.box', 'display', 'flex', 'Use display: flex;'), (c) => $$(c, '.item').every((e) => c.win.getComputedStyle(e).flexGrow === '1') || 'Every .item should have flex: 1;')),
    K('Make `.box` flex, give `.item:first-child` **flex-grow: 1** and keep every other `.item` at **flex-grow: 0**.', '.item { flex-grow: 0; } .item:first-child { flex-grow: 1; }', '.box { display: flex; }\n.item { flex-grow: 0; }\n.item:first-child { flex-grow: 1; }',
      all(prop('.box', 'display', 'flex', 'Use display: flex;'), prop('.item:first-child', 'flexGrow', '1', 'The first item needs flex-grow: 1;'), prop('.item:last-child', 'flexGrow', '0', 'The last item should keep flex-grow: 0;'))));
  add('css-13',
    K('Make `.grid` a grid with **2 equal columns** (`repeat(2, 1fr)`).', '.grid { display: grid; grid-template-columns: repeat(2, 1fr); }', '.grid { display: grid; grid-template-columns: repeat(2, 1fr); }',
      all(prop('.grid', 'display', 'grid', 'Use display: grid;'), (c) => tracks(c, '.grid') === 2 || 'The grid needs exactly 2 columns.')),
    K('Make `.grid` a grid with 2 columns: `1fr 2fr` (the second is twice as wide).', '.grid { display: grid; grid-template-columns: 1fr 2fr; }', '.grid { display: grid; grid-template-columns: 1fr 2fr; }',
      all(prop('.grid', 'display', 'grid', 'Use display: grid;'), (c) => { const v = cs(c, '.grid').gridTemplateColumns.split(/\s+/).map(px); return v.length === 2 && v[1] / v[0] > 1.8 && v[1] / v[0] < 2.2 || 'Use grid-template-columns: 1fr 2fr;'; })));
  add('css-14',
    K('Make `.grid` 3 equal columns (`repeat(3, 1fr)`) with a **gap of 12px**.', '.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }', '.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }',
      all(prop('.grid', 'display', 'grid', 'Use display: grid;'), (c) => tracks(c, '.grid') === 3 || 'The grid needs 3 columns.', prop('.grid', 'columnGap', '12px', 'Use gap: 12px;'), prop('.grid', 'rowGap', '12px', 'Use gap: 12px;'))),
    K('Make `.grid` 2 columns (`repeat(2, 1fr)`) with a `row-gap` of **5px**.', '.grid { display: grid; grid-template-columns: repeat(2, 1fr); row-gap: 5px; }', '.grid { display: grid; grid-template-columns: repeat(2, 1fr); row-gap: 5px; }',
      all(prop('.grid', 'display', 'grid', 'Use display: grid;'), (c) => tracks(c, '.grid') === 2 || 'The grid needs 2 columns.', prop('.grid', 'rowGap', '5px', 'Use row-gap: 5px;'))),
    K('Make `.grid` 3 columns (`repeat(3, 1fr)`) with `column-gap: 0;` and `row-gap: 25px;`.', '.grid { display: grid; grid-template-columns: repeat(3, 1fr); column-gap: 0; row-gap: 25px; }', '.grid { display: grid; grid-template-columns: repeat(3, 1fr); column-gap: 0; row-gap: 25px; }',
      all(prop('.grid', 'display', 'grid', 'Use display: grid;'), (c) => tracks(c, '.grid') === 3 || 'The grid needs 3 columns.', prop('.grid', 'columnGap', '0px', 'Use column-gap: 0;'), prop('.grid', 'rowGap', '25px', 'Use row-gap: 25px;'))));
  add('css-15',
    K('Make `.grid` 3 columns (`repeat(3, 1fr)`) and let `.item:first-child` **span all 3 columns**.', '.item:first-child { grid-column: span 3; }', '.grid { display: grid; grid-template-columns: repeat(3, 1fr); }\n.item:first-child { grid-column: span 3; }',
      all(prop('.grid', 'display', 'grid', 'Use display: grid;'), (c) => tracks(c, '.grid') === 3 || 'The grid needs 3 columns.', (c) => { const s = cs(c, '.item:first-child'); return s.gridColumnStart === 'span 3' || s.gridColumnEnd === 'span 3' || (px(s.gridColumnEnd) - px(s.gridColumnStart) === 3) || 'The first item should span 3 columns.'; })),
    K('Make `.grid` 4 columns (`repeat(4, 1fr)`) and place `.item:first-child` with `grid-column: 2 / 4;`.', '.item:first-child { grid-column: 2 / 4; }', '.grid { display: grid; grid-template-columns: repeat(4, 1fr); }\n.item:first-child { grid-column: 2 / 4; }',
      all(prop('.grid', 'display', 'grid', 'Use display: grid;'), (c) => tracks(c, '.grid') === 4 || 'The grid needs 4 columns.', (c) => { const s = cs(c, '.item:first-child'); return s.gridColumnStart === '2' && s.gridColumnEnd === '4' || 'Use grid-column: 2 / 4;'; })));
  add('css-16',
    K('Make `.grid` 3 columns (`repeat(3, 1fr)`) with `align-items: center;`.', '.grid { display: grid; grid-template-columns: repeat(3, 1fr); align-items: center; }', '.grid { display: grid; grid-template-columns: repeat(3, 1fr); align-items: center; }',
      all(prop('.grid', 'display', 'grid', 'Use display: grid;'), (c) => tracks(c, '.grid') === 3 || 'The grid needs 3 columns.', prop('.grid', 'alignItems', 'center', 'Use align-items: center;'))),
    K('Make `.grid` 3 columns (`repeat(3, 1fr)`) with `justify-items: start;`.', '.grid { display: grid; grid-template-columns: repeat(3, 1fr); justify-items: start; }', '.grid { display: grid; grid-template-columns: repeat(3, 1fr); justify-items: start; }',
      all(prop('.grid', 'display', 'grid', 'Use display: grid;'), (c) => tracks(c, '.grid') === 3 || 'The grid needs 3 columns.', prop('.grid', 'justifyItems', ['start', 'flex-start'], 'Use justify-items: start;'))),
    K('Make `.grid` a grid with 3 columns and center only the **first** item in its cell with `place-self: center;`.', '.item:first-child { place-self: center; }', '.grid { display: grid; grid-template-columns: repeat(3, 1fr); }\n.item:first-child { place-self: center; }',
      all(prop('.grid', 'display', 'grid', 'Use display: grid;'), (c) => tracks(c, '.grid') === 3 || 'The grid needs 3 columns.', prop('.item:first-child', 'justifySelf', 'center', 'Use place-self: center; on .item:first-child'), prop('.item:first-child', 'alignSelf', 'center', 'Use place-self: center; on .item:first-child'))));
  add('css-17',
    K('Give `.item:first-child` `position: relative;` with `top: 10px;` and `left: 20px;`.', '.item:first-child { position: relative; top: 10px; left: 20px; }', '.item:first-child { position: relative; top: 10px; left: 20px; }',
      all(prop('.item:first-child', 'position', 'relative', 'Use position: relative;'), prop('.item:first-child', 'top', '10px', 'Use top: 10px;'), prop('.item:first-child', 'left', '20px', 'Use left: 20px;'))),
    K('Give `.box` `position: relative;` and make `.item:last-child` **absolute** with `bottom: 0;` and `left: 0;`.', '.box { position: relative; } .item:last-child { position: absolute; bottom: 0; left: 0; }', '.box { position: relative; }\n.item:last-child { position: absolute; bottom: 0; left: 0; }',
      all(prop('.box', 'position', 'relative', 'Use position: relative; on .box'), prop('.item:last-child', 'position', 'absolute', 'Use position: absolute; on .item:last-child'), prop('.item:last-child', 'bottom', '0px', 'Use bottom: 0;'), prop('.item:last-child', 'left', '0px', 'Use left: 0;'))));
  add('css-18',
    K('Give the `table` a **width of 100%** and make every `th` have **white** text on a dark `#333` background.', 'table { width: 100%; } th { color: white; background: #333; }', 'table { width: 100%; }\nth { color: white; background-color: #333; }',
      all(rx(/table\s*\{[^}]*width\s*:\s*100%/i, 'Use width: 100%; on the table.'), (c) => (!isWhite(rgb(cs(c, 'th').color)) ? 'The th text should be white.' : rgb(cs(c, 'th').backgroundColor).every((v) => v < 90) || 'The th background should be dark (#333).'))),
    K('Give the `table` `border-collapse: collapse;` and make every `td` text **center** aligned.', 'table { border-collapse: collapse; } td { text-align: center; }', 'table { border-collapse: collapse; }\ntd { text-align: center; }',
      all(prop('table', 'borderCollapse', 'collapse', 'Use border-collapse: collapse;'), prop('td', 'textAlign', 'center', 'Use text-align: center; on td'))));
  add('css-19',
    K('Make `button` have a **blue** background, **white** text and `border: none;`.', 'button { background-color: blue; color: white; border: none; }', 'button { background-color: blue; color: white; border: none; }',
      (c) => { const s = cs(c, 'button'); return !isBlue(rgb(s.backgroundColor)) ? 'The button background should be blue.' : !isWhite(rgb(s.color)) ? 'The button text should be white.' : s.borderTopStyle === 'none' || 'Use border: none;'; }),
    K('Make `input` have a **font-size of 18px** and a **width of 100%**.', 'input { font-size: 18px; width: 100%; }', 'input { font-size: 18px; width: 100%; }',
      all(prop('input', 'fontSize', '18px', 'Use font-size: 18px;'), rx(/input\s*\{[^}]*width\s*:\s*100%/i, 'Use width: 100%; on input.'))));

  // ================= JavaScript =================
  add('js-1',
    J('Print **Ready** and then **Go** on two lines.', 'console.log("Ready"); console.log("Go");', 'console.log("Ready");\nconsole.log("Go");', (c) => c.logs.join(',') === 'Ready,Go' || 'The console should show Ready and then Go.'),
    J('Print the number **42** and then the text **Boss**, each on its own line.', 'console.log(42); console.log("Boss");', 'console.log(42);\nconsole.log("Boss");', (c) => c.logs.join(',') === '42,Boss' || 'The console should show 42 and then Boss.'));
  add('js-2',
    J('Create a variable `name` with the text **Nova** and print it.', 'let name = "Nova"; console.log(name);', 'let name = "Nova";\nconsole.log(name);', (c) => (!/\bname\b/.test(c.code) ? 'Create a variable called name.' : last(c) === 'Nova' || 'The console should show: Nova')),
    J('Create `hp = 100`, subtract **40** from it, and print `hp`.', 'let hp = 100; hp = hp - 40;', 'let hp = 100;\nhp = hp - 40;\nconsole.log(hp);', (c) => (!/\bhp\s*=\s*100/.test(c.code) ? 'Start with let hp = 100;' : last(c) === '60' || 'The console should show 60.')));
  add('js-3', J('Print the result of `20 / 4 + 3`.', 'console.log(20 / 4 + 3);', 'console.log(20 / 4 + 3);', (c) => last(c) === '8' || 'The console should show 8.'));
  add('js-4',
    J('Create `word = "code"` and print it in **UPPERCASE** with `toUpperCase()`.', 'console.log(word.toUpperCase());', 'let word = "code";\nconsole.log(word.toUpperCase());', (c) => (!/toUpperCase\(\)/.test(c.code) ? 'Use word.toUpperCase()' : last(c) === 'CODE' || 'The console should show: CODE')),
    J('Create `word = "Boss"` and print its **first letter** with `word[0]`.', 'console.log(word[0]);', 'let word = "Boss";\nconsole.log(word[0]);', (c) => (!/\bword\b/.test(c.code) ? 'Create a variable called word.' : last(c) === 'B' || 'The console should show: B')));
  add('js-5',
    J('With `score = 7`: print **Even** if `score % 2` is 0, otherwise print **Odd**.', 'if (score % 2 === 0) {...} else {...}', 'let score = 7;\nif (score % 2 === 0) {\n  console.log("Even");\n} else {\n  console.log("Odd");\n}',
      async (c) => { if (last(c) !== 'Odd') return 'With score = 7 it should print Odd.'; const r = await c.run(setNum(c.code, 'score', 8)); return last(r) === 'Even' || 'With score = 8 it should print Even.'; }, 'let score = 7;\n// your code here\n'),
    J('With `age = 12`: print **Kid** if age is less than 13, otherwise print **Teen**.', 'if (age < 13) {...} else {...}', 'let age = 12;\nif (age < 13) {\n  console.log("Kid");\n} else {\n  console.log("Teen");\n}',
      async (c) => { if (last(c) !== 'Kid') return 'With age = 12 it should print Kid.'; const r = await c.run(setNum(c.code, 'age', 15)); return last(r) === 'Teen' || 'With age = 15 it should print Teen.'; }, 'let age = 12;\n// your code here\n'));
  add('js-6',
    J('Use a loop to count **down** and print 10, 9, 8 ... 1, one per line.', 'for (let i = 10; i >= 1; i--) { ... }', 'for (let i = 10; i >= 1; i--) {\n  console.log(i);\n}', (c) => (!/\b(for|while)\b/.test(c.code) ? 'Use a loop.' : c.logs.join(',') === '10,9,8,7,6,5,4,3,2,1' || 'It should print 10 down to 1.')),
    J('Use a loop to add the numbers **1 to 10** into `sum`, then print `sum`.', 'let sum = 0; for (...) { sum = sum + i; }', 'let sum = 0;\nfor (let i = 1; i <= 10; i++) {\n  sum = sum + i;\n}\nconsole.log(sum);', (c) => (!/\b(for|while)\b/.test(c.code) ? 'Use a loop.' : last(c) === '55' || 'The console should show 55.')));
  add('js-7',
    J('Write a function called **square** that takes `n` and returns `n * n`.', 'function square(n) { return n * n; }', 'function square(n) {\n  return n * n;\n}', async (c) => { const r = await c.run(c.code + '\nconsole.log(square(4));\nconsole.log(square(5));'); return r.errors.length ? 'Your function is not working. Is it named square?' : r.logs.join(',') === '16,25' || 'square(4) should give 16 and square(5) should give 25.'; }),
    J('Write a function called **isEven** that takes `n` and returns `true` when n is even, otherwise `false`.', 'return n % 2 === 0;', 'function isEven(n) {\n  return n % 2 === 0;\n}', async (c) => { const r = await c.run(c.code + '\nconsole.log(isEven(4));\nconsole.log(isEven(7));'); return r.errors.length ? 'Your function is not working. Is it named isEven?' : r.logs.join(',') === 'true,false' || 'isEven(4) should be true and isEven(7) should be false.'; }));
  add('js-8', J('Create `nums = [1, 2, 3]` and use a loop to add all its items into `sum`, then print `sum`.', 'for (let i = 0; i < nums.length; i++) { sum = sum + nums[i]; }', 'let nums = [1, 2, 3];\nlet sum = 0;\nfor (let i = 0; i < nums.length; i++) {\n  sum = sum + nums[i];\n}\nconsole.log(sum);',
    (c) => (!/\bnums\b/.test(c.code) ? 'Create the array nums first.' : !/\b(for|while|forEach|reduce)\b/.test(c.code) ? 'Use a loop to add the items.' : last(c) === '6' || 'The console should show 6.')));
  add('js-9', J('Change the **color** of the element with id **title** to **red** using `style.color`.', 'document.getElementById("title").style.color = "red";', 'document.getElementById("title").style.color = "red";',
    (c) => (c.doc.getElementById('title').style.color === 'red' ? true : 'The title style.color should be red.')));
  const JS_CLICK = (extra) => 'let score = 0;\nconst btn = document.getElementById("btn");\nconst text = document.getElementById("text");\n' + extra;
  add('js-10',
    J('Each click adds **10** to the score and shows **Score: N** in `text`. (2 clicks should show Score: 20)', 'score = score + 10;', JS_CLICK('btn.addEventListener("click", function () {\n  score = score + 10;\n  text.textContent = "Score: " + score;\n});'),
      (c) => { const b = c.doc.getElementById('btn'), x = c.doc.getElementById('text'); b.click(); b.click(); return x.textContent === 'Score: 20' || 'After 2 clicks the text should say: Score: 20'; }, JS_CLICK('')),
    J('Make a countdown: `lives` starts at **3** and each click subtracts **1**, showing **Lives: N** in `text`. (2 clicks should show Lives: 1)', 'lives = lives - 1;', 'let lives = 3;\nconst btn = document.getElementById("btn");\nconst text = document.getElementById("text");\nbtn.addEventListener("click", function () {\n  lives = lives - 1;\n  text.textContent = "Lives: " + lives;\n});',
      (c) => { const b = c.doc.getElementById('btn'), x = c.doc.getElementById('text'); b.click(); b.click(); return x.textContent === 'Lives: 1' || 'After 2 clicks the text should say: Lives: 1'; }, 'let lives = 3;\nconst btn = document.getElementById("btn");\nconst text = document.getElementById("text");\n'));

  // ================= BOSSES (4 -> 6 questions) =================
  const B = window.BOSSES;
  B.html.tests.push(
    H('Make a `<form>` with a text input (`placeholder="Name"`), a **password** input and a `<button type="submit">` that says **Join**.', '<form> input + input type="password" + button', '<form>\n  <input type="text" placeholder="Name">\n  <input type="password">\n  <button type="submit">Join</button>\n</form>',
      all((c) => need(c, 'form', 'a <form>'), (c) => need(c, 'form input[placeholder="Name"]', 'a text input with placeholder="Name"'), (c) => need(c, 'form input[type="password"]', 'a password input'), (c) => need(c, 'form button[type="submit"]', 'a submit button'), (c) => T($(c, 'form button')) === 'join' || 'The button should say: Join')),
    H('Make a table with a `<caption>` **Scores**, a header row (**Hero**, **XP**) and one data row.', '<table><caption>..</caption><tr><th>..</th>..</tr><tr><td>..</td>..</tr></table>', '<table>\n  <caption>Scores</caption>\n  <tr><th>Hero</th><th>XP</th></tr>\n  <tr><td>Nova</td><td>120</td></tr>\n</table>',
      all((c) => need(c, 'table caption', 'a <caption>'), (c) => (T($(c, 'caption')) !== 'scores' ? 'The caption should say: Scores' : $$(c, 'th').map(T).join('|') !== 'hero|xp' ? 'The header cells should be Hero and XP.' : $$(c, 'td').length >= 2 || 'Add one data row with two <td> cells.'))));
  B.css.tests.push(
    K('Make `.info` **italic** with a font size of **20px**.', '.info { font-style: italic; font-size: 20px; }', '.info { font-style: italic; font-size: 20px; }', (c) => (cs(c, '.info').fontStyle !== 'italic' ? 'Use font-style: italic;' : cs(c, '.info').fontSize === '20px' || 'Use font-size: 20px;')),
    K('Make `.row` a **flex** container with a **10px** gap, and give `.btn` a **border-radius of 30px**.', '.row { display: flex; gap: 10px; } .btn { border-radius: 30px; }', '.row { display: flex; gap: 10px; }\n.btn { border-radius: 30px; }',
      all(prop('.row', 'display', 'flex', 'Use display: flex; on .row'), prop('.row', 'columnGap', '10px', 'Use gap: 10px; on .row'), prop('.btn', 'borderTopLeftRadius', '30px', 'Use border-radius: 30px; on .btn'))));
  B.js.tests.push(
    J('Write a function **triple** that takes `n` and returns `n * 3`, then print `triple(4)`.', 'function triple(n) { return n * 3; } console.log(triple(4));', 'function triple(n) {\n  return n * 3;\n}\nconsole.log(triple(4));',
      async (c) => { if (!/function\s+triple|triple\s*=/.test(c.code)) return 'Write a function called triple.'; if (last(c) !== '12') return 'The console should show 12.'; const r = await c.run(c.code + '\nconsole.log(triple(10));'); return last(r) === '30' || 'triple(10) should give 30.'; }),
    J('When **btn** is clicked, add a new `<li>` with the text **Item** to the list with id **list**.', 'const li = document.createElement("li"); ... list.appendChild(li);', 'document.getElementById("btn").addEventListener("click", function () {\n  const li = document.createElement("li");\n  li.textContent = "Item";\n  document.getElementById("list").appendChild(li);\n});',
      (c) => { const l = c.doc.getElementById('list'); if (l.children.length) return 'The item should be added only AFTER the click.'; c.doc.getElementById('btn').click(); return l.children.length === 1 && T(l.children[0]) === 'item' || 'After one click the list should have one <li> that says Item.'; }));
})();
