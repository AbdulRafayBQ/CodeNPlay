/* =========================================================
   CodeNPlay - course content
   Each lesson: intro, example, practice (task + starter), tests[]
   A test "check" gets a context: { doc, win, logs, errors, code, run }
   and returns true (pass), or a string (hint why it failed).
   ========================================================= */
(function () {
  // ---------- check helpers ----------
  const $ = (c, s) => c.doc.querySelector(s);
  const $$ = (c, s) => Array.from(c.doc.querySelectorAll(s));
  const T = (el) => (el ? el.textContent.trim().toLowerCase() : '');
  const cs = (c, s) => { const e = $(c, s); return e ? c.win.getComputedStyle(e) : null; };
  const rgb = (v) => { const m = (v || '').match(/[\d.]+/g); return m ? m.slice(0, 3).map(Number) : [0, 0, 0]; };
  const isRed = ([r, g, b]) => r > 200 && g < 90 && b < 90;
  const isGreen = ([r, g, b]) => g >= 100 && g > r + 40 && g > b + 40;
  const isWhite = ([r, g, b]) => r > 235 && g > 235 && b > 235;
  const isYellow = ([r, g, b]) => r > 200 && g > 200 && b < 130;
  const last = (c) => c.logs[c.logs.length - 1];
  const need = (c, sel, name) => ($(c, sel) ? null : 'I cannot find ' + (name || sel) + ' on the page.');

  const JS_BASE =
    '<h2 id="title">Hello Player</h2>\n<p id="text">Score: 0</p>\n<button id="btn">Click me</button>\n<div id="box"></div>\n<ul id="list"></ul>';
  const JS_BASE_STYLE =
    'body{font-family:system-ui,sans-serif;padding:14px;color:#1b1f3a}button{padding:9px 16px;font-size:16px;border-radius:8px;border:0;background:#5b4bff;color:#fff}';

  const CSS_STYLE = 'body{font-family:system-ui,sans-serif;padding:16px;color:#1b1f3a}';

  const HTML_HINT = '<!-- write your code here -->\n';
  const CSS_HINT = '/* write your code here */\n';
  const JS_HINT = '// write your code here\n';

  // =========================================================
  // HTML COURSE
  // =========================================================
  const html = [
    {
      id: 'html-1',
      title: 'Headings and Paragraphs',
      intro:
        'HTML is the **skeleton** of every web page. It tells the browser what is on the page: a heading, a paragraph, a button, an image.\n\n' +
        'HTML is written with **tags**. Most tags come in pairs: an opening tag like `<h1>` and a closing tag like `</h1>`. The text between them is the content.\n\n' +
        '`<h1>` is the biggest heading. `<h2>` to `<h6>` are smaller. `<p>` is a normal paragraph of text.',
      example: '<h1>Welcome to my game</h1>\n<h2>Level 1</h2>\n<p>I am learning HTML.</p>',
      task: 'Change the heading to your own name, then add one more paragraph with a `<p>` tag.',
      starter: '<h1>Hello World</h1>\n<p>Edit me!</p>\n',
      tests: [
        {
          q: 'Write an `<h1>` heading that says **Hello Player**.',
          starter: HTML_HINT,
          hint: 'It looks like this: <h1>Hello Player</h1>',
          solution: '<h1>Hello Player</h1>',
          check: (c) => need(c, 'h1', 'an <h1>') || T($(c, 'h1')) === 'hello player' || 'The h1 should say exactly: Hello Player',
        },
        {
          q: 'Make an `<h1>` that says **My Game**, and under it add **two** `<p>` paragraphs.',
          starter: HTML_HINT,
          hint: 'One h1, then <p>...</p> two times.',
          solution: '<h1>My Game</h1>\n<p>Level one</p>\n<p>Level two</p>',
          check: (c) =>
            need(c, 'h1', 'an <h1>') ||
            (T($(c, 'h1')) !== 'my game' ? 'The h1 should say: My Game' : null) ||
            ($$(c, 'p').length >= 2 ? true : 'You need two <p> paragraphs.'),
        },
      ],
    },
    {
      id: 'html-2',
      title: 'Bold, Italic and Line Breaks',
      intro:
        'You can style words inside a paragraph with small tags.\n\n' +
        '`<strong>` makes text **bold** and important. `<em>` makes text *italic* (emphasis).\n\n' +
        '`<br>` starts a new line. It has no closing tag because it has no content.',
      example: '<p>The <strong>Boss</strong> is <em>very</em> close!<br>Get ready.</p>',
      task: 'Make the word `Danger` bold and the word `now` italic.',
      starter: '<p>Danger is coming, run now!</p>\n',
      tests: [
        {
          q: 'Make the word **Boss** bold with `<strong>` inside the paragraph.',
          starter: '<p>The Boss is near!</p>\n',
          hint: 'Wrap only the word: <strong>Boss</strong>',
          solution: '<p>The <strong>Boss</strong> is near!</p>',
          check: (c) => need(c, 'p strong', '<strong> inside a <p>') || T($(c, 'p strong')) === 'boss' || 'Only the word Boss should be inside <strong>.',
        },
        {
          q: 'Write a paragraph that has the word **Danger** in `<em>` and also one `<br>` inside it.',
          starter: HTML_HINT,
          hint: '<p><em>Danger</em><br>Run away</p>',
          solution: '<p><em>Danger</em><br>Run away</p>',
          check: (c) => need(c, 'p em', '<em> inside a <p>') || (T($(c, 'p em')) !== 'danger' ? 'The word in <em> should be Danger.' : null) || (need(c, 'p br', '<br> inside the <p>') || true),
        },
      ],
    },
    {
      id: 'html-3',
      title: 'Links and Images',
      intro:
        'A link uses the `<a>` tag. The `href` attribute says **where** the link goes. Attributes always go inside the opening tag.\n\n' +
        'An image uses `<img>`. `src` is the picture file, and `alt` is a short text description (used by screen readers, and shown if the image fails).\n\n' +
        '`<img>` has no closing tag.',
      example: '<a href="https://example.com">Visit the shop</a>\n<img src="hero.png" alt="The hero">',
      task: 'Make a link that says `Play Now`. Then add an image with any `src` and an `alt`.',
      starter: '<a href="https://example.com">Click me</a>\n',
      tests: [
        {
          q: 'Make a link (`<a>`) that says **Play Now** and goes to `https://example.com`.',
          starter: HTML_HINT,
          hint: '<a href="https://example.com">Play Now</a>',
          solution: '<a href="https://example.com">Play Now</a>',
          check: (c) =>
            need(c, 'a', 'an <a> link') ||
            (T($(c, 'a')) !== 'play now' ? 'The link text should be: Play Now' : null) ||
            (($(c, 'a').getAttribute('href') || '').includes('example.com') ? true : 'The href should be https://example.com'),
        },
        {
          q: 'Add an image with `src="hero.png"` and `alt="Hero"`.',
          starter: HTML_HINT,
          hint: '<img src="hero.png" alt="Hero">',
          solution: '<img src="hero.png" alt="Hero">',
          check: (c) =>
            need(c, 'img', 'an <img>') ||
            ($(c, 'img').getAttribute('src') !== 'hero.png' ? 'src should be hero.png' : null) ||
            (($(c, 'img').getAttribute('alt') || '').toLowerCase() === 'hero' ? true : 'alt should be Hero'),
        },
      ],
    },
    {
      id: 'html-4',
      title: 'Lists',
      intro:
        'Use lists to group items. `<ul>` is an **unordered** list (bullets). `<ol>` is an **ordered** list (numbers).\n\n' +
        'Inside a list, every item is written with `<li>`.',
      example: '<h2>Inventory</h2>\n<ul>\n  <li>Sword</li>\n  <li>Shield</li>\n</ul>\n\n<ol>\n  <li>Wake up</li>\n  <li>Code</li>\n</ol>',
      task: 'Add a third item, `Potion`, to the list.',
      starter: '<ul>\n  <li>Sword</li>\n  <li>Shield</li>\n</ul>\n',
      tests: [
        {
          q: 'Make an unordered list (`<ul>`) with **3** items.',
          starter: HTML_HINT,
          hint: '<ul> with three <li> inside.',
          solution: '<ul><li>One</li><li>Two</li><li>Three</li></ul>',
          check: (c) => need(c, 'ul', 'a <ul>') || ($$(c, 'ul > li').length === 3 ? true : 'The list needs exactly 3 <li> items.'),
        },
        {
          q: 'Make an ordered list (`<ol>`) with the items **Wake up** and **Code**, in that order.',
          starter: HTML_HINT,
          hint: '<ol><li>Wake up</li><li>Code</li></ol>',
          solution: '<ol><li>Wake up</li><li>Code</li></ol>',
          check: (c) => {
            const li = $$(c, 'ol > li').map(T);
            if (!$(c, 'ol')) return 'I cannot find an <ol>.';
            return li.join('|') === 'wake up|code' || 'The ol should have two items: Wake up, then Code.';
          },
        },
      ],
    },
    {
      id: 'html-5',
      title: 'Buttons and Inputs',
      intro:
        'A `<button>` is something the user can click. An `<input>` lets the user type.\n\n' +
        'The `type` attribute chooses what kind of input it is (`text`, `number`, `password`...). `placeholder` shows a gray hint text inside the box.\n\n' +
        '`<input>` has no closing tag.',
      example: '<input type="text" placeholder="Your name">\n<button>Start</button>',
      task: 'Change the placeholder to `Enter hero name` and the button text to `Go`.',
      starter: '<input type="text" placeholder="Your name">\n<button>Start</button>\n',
      tests: [
        {
          q: 'Make a `<button>` that says **Start**.',
          starter: HTML_HINT,
          hint: '<button>Start</button>',
          solution: '<button>Start</button>',
          check: (c) => need(c, 'button', 'a <button>') || T($(c, 'button')) === 'start' || 'The button text should be: Start',
        },
        {
          q: 'Make a text `<input>` with the placeholder **Your name**, and a `<button>` next to it.',
          starter: HTML_HINT,
          hint: '<input type="text" placeholder="Your name">',
          solution: '<input type="text" placeholder="Your name">\n<button>Save</button>',
          check: (c) =>
            need(c, 'input[type="text"]', 'an <input type="text">') ||
            (($(c, 'input').getAttribute('placeholder') || '').toLowerCase() !== 'your name' ? 'The placeholder should be: Your name' : null) ||
            ($(c, 'button') ? true : 'Add a <button> too.'),
        },
      ],
    },
    {
      id: 'html-6',
      title: 'Divs, Classes and IDs',
      intro:
        '`<div>` is an invisible box. It groups other tags together, so you can style or find them later with CSS and JavaScript.\n\n' +
        'Give a tag a **class** (`class="card"`) when many tags share a style. Give a tag an **id** (`id="player"`) when it is unique on the page.',
      example: '<div class="card">\n  <h2>Knight</h2>\n  <p>Strong and brave.</p>\n</div>\n<div id="player">Hero</div>',
      task: 'Add a second card for `Wizard`.',
      starter: '<div class="card">\n  <h2>Knight</h2>\n  <p>Strong and brave.</p>\n</div>\n',
      tests: [
        {
          q: 'Make a `<div class="card">` that contains an `<h2>` and a `<p>`.',
          starter: HTML_HINT,
          hint: '<div class="card"><h2>..</h2><p>..</p></div>',
          solution: '<div class="card"><h2>Title</h2><p>Text</p></div>',
          check: (c) => need(c, 'div.card', '<div class="card">') || ($(c, '.card h2') && $(c, '.card p') ? true : 'The card needs an <h2> and a <p> inside it.'),
        },
        {
          q: 'Make a `<div>` with the id **player** that contains the text **Hero**.',
          starter: HTML_HINT,
          hint: '<div id="player">Hero</div>',
          solution: '<div id="player">Hero</div>',
          check: (c) => need(c, '#player', 'an element with id="player"') || T($(c, '#player')) === 'hero' || 'The text inside should be: Hero',
        },
      ],
    },
  ].map((l) => ({ ...l, kind: 'html' }));

  // =========================================================
  // CSS COURSE
  // =========================================================
  const MENU = '<h1>Game Menu</h1>\n<p class="info">Choose your level</p>\n<button>Start</button>';
  const MENU_STYLE = CSS_STYLE + 'button{padding:10px 18px;font-size:16px;border:0;background:#ddd}';

  const css = [
    {
      id: 'css-1',
      title: 'Colors',
      base: MENU,
      baseStyle: MENU_STYLE,
      intro:
        'CSS makes the page look good. A CSS rule has a **selector** (what to style) and **declarations** (how to style it).\n\n' +
        '`color` changes the text color. `background-color` changes the background. You can use names like `red`, hex codes like `#ff0000`, or `rgb(255, 0, 0)`.',
      example: 'h1 {\n  color: red;\n  background-color: yellow;\n}',
      task: 'Make the `h1` text orange and give the `p` a light background.',
      starter: 'h1 {\n  color: orange;\n}\n',
      tests: [
        {
          q: 'Make the `h1` text **red**.',
          starter: CSS_HINT,
          hint: 'h1 { color: red; }',
          solution: 'h1 { color: red; }',
          check: (c) => isRed(rgb(cs(c, 'h1').color)) || 'The h1 text is not red yet. Use the color property.',
        },
        {
          q: 'Make the `button` have a **green** background and **white** text.',
          starter: CSS_HINT,
          hint: 'button { background-color: green; color: white; }',
          solution: 'button { background-color: green; color: white; }',
          check: (c) => {
            const s = cs(c, 'button');
            if (!isGreen(rgb(s.backgroundColor))) return 'The button background should be green (background-color).';
            return isWhite(rgb(s.color)) || 'The button text should be white (color).';
          },
        },
      ],
    },
    {
      id: 'css-2',
      title: 'Fonts and Text',
      base: '<h1>Game Menu</h1>\n<p>Choose your level</p>',
      baseStyle: CSS_STYLE,
      intro:
        '`font-size` sets how big text is (for example `24px`). `font-weight: bold` makes it thick. `text-align` moves the text: `left`, `center` or `right`.\n\n' +
        '`text-transform: uppercase` turns letters into CAPITALS without retyping.',
      example: 'h1 {\n  font-size: 40px;\n  text-align: center;\n  text-transform: uppercase;\n}',
      task: 'Center the `h1` and make the `p` bigger than normal.',
      starter: 'h1 {\n  text-align: center;\n}\n',
      tests: [
        {
          q: 'Set the `h1` font size to **40px**.',
          starter: CSS_HINT,
          hint: 'h1 { font-size: 40px; }',
          solution: 'h1 { font-size: 40px; }',
          check: (c) => cs(c, 'h1').fontSize === '40px' || 'h1 font-size should be 40px.',
        },
        {
          q: 'Make the `p` **centered** and **bold**.',
          starter: CSS_HINT,
          hint: 'p { text-align: center; font-weight: bold; }',
          solution: 'p { text-align: center; font-weight: bold; }',
          check: (c) => {
            const s = cs(c, 'p');
            if (s.textAlign !== 'center') return 'Use text-align: center;';
            return parseInt(s.fontWeight, 10) >= 700 || 'Use font-weight: bold;';
          },
        },
      ],
    },
    {
      id: 'css-3',
      title: 'The Box Model',
      base: '<div class="box">Inventory</div>',
      baseStyle: CSS_STYLE + '.box{background:#ddd;color:#111}',
      intro:
        'Every element is a box. From inside to outside: **content**, **padding** (space inside the border), **border**, and **margin** (space outside).\n\n' +
        '`padding: 20px;` adds space inside. `margin: 30px;` adds space outside. `border: 4px solid blue;` draws a line around the box (width, style, color).',
      example: '.box {\n  padding: 20px;\n  border: 4px solid blue;\n  margin: 30px;\n}',
      task: 'Give `.box` some padding and a border, then watch the box grow.',
      starter: '.box {\n  padding: 10px;\n}\n',
      tests: [
        {
          q: 'Give `.box` a padding of **20px** on all sides.',
          starter: CSS_HINT,
          hint: '.box { padding: 20px; }',
          solution: '.box { padding: 20px; }',
          check: (c) => { const s = cs(c, '.box'); return [s.paddingTop, s.paddingRight, s.paddingBottom, s.paddingLeft].every((v) => v === '20px') || 'Padding should be 20px on all four sides.'; },
        },
        {
          q: 'Give `.box` a **4px solid** border and a top margin of **30px**.',
          starter: CSS_HINT,
          hint: '.box { border: 4px solid blue; margin-top: 30px; }',
          solution: '.box { border: 4px solid blue; margin-top: 30px; }',
          check: (c) => {
            const s = cs(c, '.box');
            if (s.borderTopWidth !== '4px' || s.borderTopStyle !== 'solid') return 'Use border: 4px solid <color>;';
            return s.marginTop === '30px' || 'margin-top should be 30px.';
          },
        },
      ],
    },
    {
      id: 'css-4',
      title: 'Classes and IDs in CSS',
      base: '<p class="enemy">Goblin</p>\n<p class="hero">Knight</p>\n<p id="boss">Dragon</p>',
      baseStyle: CSS_STYLE,
      intro:
        'To style a **class** in CSS, put a dot before its name: `.enemy { }`. To style an **id**, put a hash: `#boss { }`.\n\n' +
        'Classes style many elements at once. An id styles exactly one.',
      example: '.enemy {\n  color: red;\n}\n#boss {\n  font-size: 30px;\n}',
      task: 'Make the `.hero` text blue without changing the other lines.',
      starter: '.enemy {\n  color: red;\n}\n',
      tests: [
        {
          q: 'Make only the **.enemy** text red. The hero must not turn red.',
          starter: CSS_HINT,
          hint: '.enemy { color: red; }',
          solution: '.enemy { color: red; }',
          check: (c) => (!isRed(rgb(cs(c, '.enemy').color)) ? 'The .enemy text should be red.' : isRed(rgb(cs(c, '.hero').color)) ? 'Only .enemy should be red, not .hero.' : true),
        },
        {
          q: 'Make **#boss** font size **30px**, and give **.hero** a **yellow** background.',
          starter: CSS_HINT,
          hint: '#boss { font-size: 30px; } .hero { background-color: yellow; }',
          solution: '#boss { font-size: 30px; }\n.hero { background-color: yellow; }',
          check: (c) => (cs(c, '#boss').fontSize !== '30px' ? '#boss font-size should be 30px.' : isYellow(rgb(cs(c, '.hero').backgroundColor)) || '.hero background should be yellow.'),
        },
      ],
    },
    {
      id: 'css-5',
      title: 'Flexbox Layout',
      base: '<div class="row">\n  <div class="item">1</div>\n  <div class="item">2</div>\n  <div class="item">3</div>\n</div>',
      baseStyle: CSS_STYLE + '.item{background:#334;color:#fff;padding:12px 18px}',
      intro:
        'Flexbox puts items **side by side**. Add `display: flex;` to the parent and its children line up in a row.\n\n' +
        '`justify-content` spreads them (`center`, `space-between`...). `gap` adds space between items.',
      example: '.row {\n  display: flex;\n  justify-content: center;\n  gap: 20px;\n}',
      task: 'Try `justify-content: space-between;` and see what happens.',
      starter: '.row {\n  display: flex;\n}\n',
      tests: [
        {
          q: 'Make `.row` a **flex** container.',
          starter: CSS_HINT,
          hint: '.row { display: flex; }',
          solution: '.row { display: flex; }',
          check: (c) => cs(c, '.row').display === 'flex' || 'Use display: flex; on .row.',
        },
        {
          q: 'Make `.row` flex, **center** its items horizontally, with a **20px** gap.',
          starter: CSS_HINT,
          hint: '.row { display: flex; justify-content: center; gap: 20px; }',
          solution: '.row { display: flex; justify-content: center; gap: 20px; }',
          check: (c) => {
            const s = cs(c, '.row');
            if (s.display !== 'flex') return 'Use display: flex;';
            if (s.justifyContent !== 'center') return 'Use justify-content: center;';
            return s.columnGap === '20px' || 'Use gap: 20px;';
          },
        },
      ],
    },
    {
      id: 'css-6',
      title: 'Rounded Corners, Shadows and Hover',
      base: '<button class="btn">Play</button>',
      baseStyle: CSS_STYLE + '.btn{padding:12px 24px;font-size:16px;border:0;background:#4c6fff;color:#fff}',
      intro:
        '`border-radius` rounds corners. `box-shadow: 0 4px 10px black;` adds a shadow (x, y, blur, color).\n\n' +
        'A **hover** rule works only while the mouse is on the element: `.btn:hover { }`. On a phone it triggers on touch.',
      example: '.btn {\n  border-radius: 12px;\n  box-shadow: 0 4px 10px rgba(0,0,0,.3);\n}\n.btn:hover {\n  background-color: orange;\n}',
      task: 'Move your mouse over the button after adding a hover rule.',
      starter: '.btn {\n  border-radius: 12px;\n}\n',
      tests: [
        {
          q: 'Give `.btn` a **border-radius of 12px**.',
          starter: CSS_HINT,
          hint: '.btn { border-radius: 12px; }',
          solution: '.btn { border-radius: 12px; }',
          check: (c) => cs(c, '.btn').borderTopLeftRadius === '12px' || 'border-radius should be 12px.',
        },
        {
          q: 'Give `.btn` a **box-shadow**, and add a `.btn:hover` rule that changes the **background-color**.',
          starter: CSS_HINT,
          hint: '.btn { box-shadow: 0 4px 10px black; } .btn:hover { background-color: orange; }',
          solution: '.btn { box-shadow: 0 4px 10px black; }\n.btn:hover { background-color: orange; }',
          check: (c) => (cs(c, '.btn').boxShadow === 'none' ? 'Add a box-shadow to .btn.' : /\.btn\s*:hover\s*\{[^}]*background/i.test(c.code) || 'Add .btn:hover { background-color: ... }'),
        },
      ],
    },
  ].map((l) => ({ ...l, kind: 'css' }));

  // =========================================================
  // JAVASCRIPT COURSE
  // =========================================================
  const jsl = (o) => ({ kind: 'js', base: JS_BASE, baseStyle: JS_BASE_STYLE, ...o });
  const js = [
    jsl({
      id: 'js-1',
      title: 'Printing Output',
      intro:
        'JavaScript makes a page **do** things. The easiest first step is printing a message.\n\n' +
        '`console.log("Hello")` prints text. Here you will see it in the **Console** box under your code. No browser tools needed.\n\n' +
        'Text must be inside quotes. Every statement ends with `;`.',
      example: 'console.log("Hello World");\nconsole.log("Game started");',
      task: 'Print your own name.',
      starter: 'console.log("Hello World");\n',
      tests: [
        {
          q: 'Print the text **Hello World**.',
          starter: JS_HINT,
          hint: 'console.log("Hello World");',
          solution: 'console.log("Hello World");',
          check: (c) => c.logs.includes('Hello World') || 'Print exactly: Hello World',
        },
        {
          q: 'Print **Level 1** on the first line and **Go!** on the second line.',
          starter: JS_HINT,
          hint: 'Use console.log two times.',
          solution: 'console.log("Level 1");\nconsole.log("Go!");',
          check: (c) => (c.logs[0] === 'Level 1' && c.logs[1] === 'Go!') || 'Line 1 should be Level 1 and line 2 should be Go!',
        },
      ],
    }),
    jsl({
      id: 'js-2',
      title: 'Variables',
      intro:
        'A **variable** is a labeled box that stores a value. Create one with `let`.\n\n' +
        '`let score = 10;` creates a box named `score` holding 10. Later you can change it: `score = 20;`.\n\n' +
        'Use `const` for values that never change.',
      example: 'let score = 10;\nconsole.log(score);\nscore = 20;\nconsole.log(score);',
      task: 'Create a variable `lives` set to 3 and print it.',
      starter: 'let score = 10;\nconsole.log(score);\n',
      tests: [
        {
          q: 'Create a variable `score` with the value **50** and print it.',
          starter: JS_HINT,
          hint: 'let score = 50; console.log(score);',
          solution: 'let score = 50;\nconsole.log(score);',
          check: (c) => (!/\b(let|const|var)\s+score\b/.test(c.code) ? 'Create the variable with let: let score = 50;' : last(c) === '50' || 'Print the variable so the console shows 50.'),
        },
        {
          q: 'Create `lives` = **3**, then change it to **2**, then print `lives`.',
          starter: JS_HINT,
          hint: 'let lives = 3; lives = 2; console.log(lives);',
          solution: 'let lives = 3;\nlives = 2;\nconsole.log(lives);',
          check: (c) => (!/\blives\s*=\s*3/.test(c.code) ? 'Start with let lives = 3;' : last(c) === '2' || 'After changing it, the console should show 2.'),
        },
      ],
    }),
    jsl({
      id: 'js-3',
      title: 'Numbers and Math',
      intro:
        'JavaScript can do math: `+` add, `-` subtract, `*` multiply, `/` divide.\n\n' +
        'Math follows the normal order: `*` and `/` happen before `+` and `-`. Use brackets `( )` to change the order.\n\n' +
        'You can do math with variables too.',
      example: 'let coins = 5;\nlet bonus = 3;\nconsole.log(coins + bonus);\nconsole.log((2 + 3) * 4);',
      task: 'Print the result of `100 / 4`.',
      starter: 'console.log(10 + 5);\n',
      tests: [
        {
          q: 'Print the result of `10 + 5 * 2`.',
          starter: JS_HINT,
          hint: 'console.log(10 + 5 * 2);',
          solution: 'console.log(10 + 5 * 2);',
          check: (c) => (last(c) !== '20' ? 'The answer should be 20. Remember: multiply first.' : /[+*]/.test(c.code) || 'Let JavaScript calculate it using + and *.'),
        },
        {
          q: 'Create `score = 100` and `bonus = 25`, then print `score + bonus`.',
          starter: JS_HINT,
          hint: 'console.log(score + bonus);',
          solution: 'let score = 100;\nlet bonus = 25;\nconsole.log(score + bonus);',
          check: (c) => (!/score/.test(c.code) || !/bonus/.test(c.code) ? 'Use two variables named score and bonus.' : last(c) === '125' || 'The console should show 125.'),
        },
      ],
    }),
    jsl({
      id: 'js-4',
      title: 'Text (Strings)',
      intro:
        'Text in JavaScript is called a **string**. Join strings with `+`: `"Hello " + name`.\n\n' +
        'A nicer way is a **template string**. Use backticks and put variables inside `${ }`:\n\n' +
        '`Hello ${name}`',
      example: 'let name = "Hero";\nconsole.log("Hello " + name);\nconsole.log(`Welcome ${name}!`);',
      task: 'Change `name` and see both messages change.',
      starter: 'let name = "Hero";\nconsole.log("Hello " + name);\n',
      tests: [
        {
          q: 'Create `name = "Hero"` and print **Hello Hero** by joining text with `+`.',
          starter: JS_HINT,
          hint: 'console.log("Hello " + name);',
          solution: 'let name = "Hero";\nconsole.log("Hello " + name);',
          check: (c) => (last(c) !== 'Hello Hero' ? 'The console should show: Hello Hero' : /name/.test(c.code) || 'Use the variable name.'),
        },
        {
          q: 'Create `score = 90` and print **Score: 90** using a **template string** (backticks and `${}`).',
          starter: JS_HINT,
          hint: 'console.log(`Score: ${score}`);',
          solution: 'let score = 90;\nconsole.log(`Score: ${score}`);',
          check: (c) => (last(c) !== 'Score: 90' ? 'The console should show: Score: 90' : /`[^`]*\$\{/.test(c.code) || 'Use backticks and ${score}.'),
        },
      ],
    }),
    jsl({
      id: 'js-5',
      title: 'If and Else',
      intro:
        'Programs make decisions with `if`. The code in `{ }` runs only when the condition is true.\n\n' +
        '`else` runs when it is not. `else if` adds more choices.\n\n' +
        'Compare with `>` `<` `>=` `<=` `===` (equal).',
      example: 'let health = 20;\nif (health > 10) {\n  console.log("Safe");\n} else {\n  console.log("Danger");\n}',
      task: 'Change `health` to 5 and run again.',
      starter: 'let health = 20;\nif (health > 10) {\n  console.log("Safe");\n} else {\n  console.log("Danger");\n}\n',
      tests: [
        {
          q: 'With `health = 20`: print **Safe** if health is more than 10, otherwise print **Danger**.',
          starter: 'let health = 20;\n// your if / else here\n',
          hint: 'if (health > 10) { ... } else { ... }',
          solution: 'let health = 20;\nif (health > 10) {\n  console.log("Safe");\n} else {\n  console.log("Danger");\n}',
          check: async (c) => {
            if (c.logs.length !== 1 || c.logs[0] !== 'Safe') return 'With health = 20 your code should print Safe.';
            const r = await c.run(c.code.replace(/health\s*=\s*\d+/, 'health = 5'));
            return (r.logs.length === 1 && r.logs[0] === 'Danger') || 'When health is 5 it should print Danger. Use else.';
          },
        },
        {
          q: 'With `score = 70`: print **Gold** if score is 90 or more, **Silver** if 50 or more, otherwise **Bronze**.',
          starter: 'let score = 70;\n// your if / else if / else here\n',
          hint: 'if (score >= 90) {...} else if (score >= 50) {...} else {...}',
          solution:
            'let score = 70;\nif (score >= 90) {\n  console.log("Gold");\n} else if (score >= 50) {\n  console.log("Silver");\n} else {\n  console.log("Bronze");\n}',
          check: async (c) => {
            if (last(c) !== 'Silver') return 'With score = 70 it should print Silver.';
            const g = await c.run(c.code.replace(/score\s*=\s*\d+/, 'score = 95'));
            if (last(g) !== 'Gold') return 'With score = 95 it should print Gold.';
            const b = await c.run(c.code.replace(/score\s*=\s*\d+/, 'score = 10'));
            return last(b) === 'Bronze' || 'With score = 10 it should print Bronze.';
          },
        },
      ],
    }),
    jsl({
      id: 'js-6',
      title: 'Loops',
      intro:
        'A **loop** repeats code. The `for` loop has three parts: start, condition, step.\n\n' +
        '`for (let i = 1; i <= 5; i++) { }` starts at 1, keeps going while `i` is 5 or less, and adds 1 each time.\n\n' +
        'Be careful: a loop that never stops will freeze your page.',
      example: 'for (let i = 1; i <= 3; i++) {\n  console.log("Round " + i);\n}',
      task: 'Change the loop to count up to 5.',
      starter: 'for (let i = 1; i <= 3; i++) {\n  console.log("Round " + i);\n}\n',
      tests: [
        {
          q: 'Use a loop to print the numbers **1, 2, 3, 4, 5**, one per line.',
          starter: JS_HINT,
          hint: 'for (let i = 1; i <= 5; i++) { console.log(i); }',
          solution: 'for (let i = 1; i <= 5; i++) {\n  console.log(i);\n}',
          check: (c) => (!/\b(for|while)\b/.test(c.code) ? 'Use a for loop.' : c.logs.join(',') === '1,2,3,4,5' || 'It should print 1, 2, 3, 4, 5.'),
        },
        {
          q: 'Use a loop to print the word **Coin** exactly **3** times.',
          starter: JS_HINT,
          hint: 'for (let i = 0; i < 3; i++) { console.log("Coin"); }',
          solution: 'for (let i = 0; i < 3; i++) {\n  console.log("Coin");\n}',
          check: (c) => (!/\b(for|while)\b/.test(c.code) ? 'Use a loop.' : c.logs.join(',') === 'Coin,Coin,Coin' || 'Print Coin exactly 3 times.'),
        },
      ],
    }),
    jsl({
      id: 'js-7',
      title: 'Functions',
      intro:
        'A **function** is a reusable block of code with a name. You write it once and call it many times.\n\n' +
        '`function double(n) { return n * 2; }` takes an input `n` and **returns** an answer.\n\n' +
        'Call it with `double(5)`.',
      example: 'function double(n) {\n  return n * 2;\n}\nconsole.log(double(5));',
      task: 'Call `double` with another number.',
      starter: 'function double(n) {\n  return n * 2;\n}\nconsole.log(double(5));\n',
      tests: [
        {
          q: 'Write a function called **double** that takes `n` and returns `n * 2`.',
          starter: JS_HINT,
          hint: 'function double(n) { return n * 2; }',
          solution: 'function double(n) {\n  return n * 2;\n}',
          check: async (c) => {
            const r = await c.run(c.code + '\nconsole.log(double(7));');
            if (r.errors.length) return 'Your function is not working. Is it named double?';
            if (last(r) !== '14') return 'double(7) should give 14.';
            const r2 = await c.run(c.code + '\nconsole.log(double(0.5));');
            return last(r2) === '1' || 'double(0.5) should give 1.';
          },
        },
        {
          q: 'Write a function called **greet** that takes `name` and returns `"Hello, "` + name.',
          starter: JS_HINT,
          hint: 'function greet(name) { return "Hello, " + name; }',
          solution: 'function greet(name) {\n  return "Hello, " + name;\n}',
          check: async (c) => {
            const r = await c.run(c.code + '\nconsole.log(greet("Ali"));');
            if (r.errors.length) return 'Your function is not working. Is it named greet?';
            return last(r) === 'Hello, Ali' || 'greet("Ali") should give: Hello, Ali';
          },
        },
      ],
    }),
    jsl({
      id: 'js-8',
      title: 'Arrays',
      intro:
        'An **array** is a list of values: `let items = ["Sword", "Shield"];`.\n\n' +
        'Positions start at **0**: `items[0]` is "Sword". `items.length` is how many items. `items.push("Potion")` adds one at the end.',
      example: 'let items = ["Sword", "Shield"];\nitems.push("Potion");\nconsole.log(items[0]);\nconsole.log(items.length);',
      task: 'Add another item and print the length.',
      starter: 'let items = ["Sword", "Shield"];\nconsole.log(items.length);\n',
      tests: [
        {
          q: 'Start with `items = ["Sword", "Shield"]`, add **"Potion"** with `push`, then print how many items there are.',
          starter: 'let items = ["Sword", "Shield"];\n',
          hint: 'items.push("Potion"); console.log(items.length);',
          solution: 'let items = ["Sword", "Shield"];\nitems.push("Potion");\nconsole.log(items.length);',
          check: (c) => (!/\.push\(/.test(c.code) ? 'Use items.push(...) to add an item.' : last(c) === '3' || 'The console should show 3.'),
        },
        {
          q: 'Create an array `nums` = **[5, 10, 15]** and print its **second** item (`nums[1]`).',
          starter: JS_HINT,
          hint: 'console.log(nums[1]);',
          solution: 'let nums = [5, 10, 15];\nconsole.log(nums[1]);',
          check: (c) => (!/nums\s*\[\s*1\s*\]/.test(c.code) ? 'Use nums[1] to get the second item.' : last(c) === '10' || 'The console should show 10.'),
        },
      ],
    }),
    jsl({
      id: 'js-9',
      title: 'Changing the Page (DOM)',
      intro:
        'JavaScript can change the page. First **find** an element, then change it.\n\n' +
        '`document.getElementById("title")` finds the element with id `title`. `.textContent = "New text"` changes its text.\n\n' +
        'To react when the user clicks, use `btn.addEventListener("click", function () { ... });`.\n\n' +
        'Look at the Output box: the page there has `title`, `text`, `btn`, `box` and `list` ready for you.',
      example: 'let title = document.getElementById("title");\ntitle.textContent = "Level Complete";',
      task: 'Change the title to anything you like, and see the Output.',
      starter: 'let title = document.getElementById("title");\ntitle.textContent = "Level Complete";\n',
      tests: [
        {
          q: 'Change the text of the element with id **title** to **Level Complete**.',
          starter: JS_HINT,
          hint: 'document.getElementById("title").textContent = "Level Complete";',
          solution: 'document.getElementById("title").textContent = "Level Complete";',
          check: (c) => c.doc.getElementById('title').textContent === 'Level Complete' || 'The title should say: Level Complete',
        },
        {
          q: 'When the button **btn** is clicked, change the element **text** to **Score: 10**.',
          starter: 'let btn = document.getElementById("btn");\nlet text = document.getElementById("text");\n// your click code here\n',
          hint: 'btn.addEventListener("click", function () { text.textContent = "Score: 10"; });',
          solution:
            'let btn = document.getElementById("btn");\nlet text = document.getElementById("text");\nbtn.addEventListener("click", function () {\n  text.textContent = "Score: 10";\n});',
          check: (c) => {
            const t = c.doc.getElementById('text');
            if (t.textContent === 'Score: 10') return 'It should change only AFTER the click, not before.';
            c.doc.getElementById('btn').click();
            return t.textContent === 'Score: 10' || 'After clicking, the text should say: Score: 10';
          },
        },
      ],
    }),
    jsl({
      id: 'js-10',
      title: 'Mini Game: Click Counter',
      intro:
        'Now put everything together. A variable stores the score, the button changes it, and the page shows it.\n\n' +
        'Remember: changing the variable does not change the page by itself. You must also update `textContent`.\n\n' +
        'Use `score = score + 1;` or the short form `score++`.',
      example:
        'let score = 0;\nlet btn = document.getElementById("btn");\nlet text = document.getElementById("text");\nbtn.addEventListener("click", function () {\n  score++;\n  text.textContent = "Score: " + score;\n});',
      task: 'Click the button in Output. Then change the code so each click adds 2.',
      starter:
        'let score = 0;\nlet btn = document.getElementById("btn");\nlet text = document.getElementById("text");\nbtn.addEventListener("click", function () {\n  score++;\n  text.textContent = "Score: " + score;\n});\n',
      tests: [
        {
          q: 'Make a click counter: each click adds **1** to the score and shows **Score: N** in `text`. (3 clicks should show Score: 3)',
          starter: 'let score = 0;\nlet btn = document.getElementById("btn");\nlet text = document.getElementById("text");\n',
          hint: 'In the click function: score++; text.textContent = "Score: " + score;',
          solution:
            'let score = 0;\nlet btn = document.getElementById("btn");\nlet text = document.getElementById("text");\nbtn.addEventListener("click", function () {\n  score++;\n  text.textContent = "Score: " + score;\n});',
          check: (c) => {
            const b = c.doc.getElementById('btn');
            b.click(); b.click(); b.click();
            return c.doc.getElementById('text').textContent === 'Score: 3' || 'After 3 clicks the text should say: Score: 3';
          },
        },
        {
          q: 'Each click adds **5**. When the score reaches **20**, change the `title` to **You Win!**. (Show Score: N in `text` as before.)',
          starter: 'let score = 0;\nlet btn = document.getElementById("btn");\nlet text = document.getElementById("text");\nlet title = document.getElementById("title");\n',
          hint: 'Inside the click: score = score + 5; update text; if (score >= 20) { title.textContent = "You Win!"; }',
          solution:
            'let score = 0;\nlet btn = document.getElementById("btn");\nlet text = document.getElementById("text");\nlet title = document.getElementById("title");\nbtn.addEventListener("click", function () {\n  score = score + 5;\n  text.textContent = "Score: " + score;\n  if (score >= 20) {\n    title.textContent = "You Win!";\n  }\n});',
          check: (c) => {
            const b = c.doc.getElementById('btn'), t = c.doc.getElementById('title'), x = c.doc.getElementById('text');
            b.click(); b.click(); b.click();
            if (t.textContent === 'You Win!') return 'You Win! should appear only when the score reaches 20.';
            if (x.textContent !== 'Score: 15') return 'After 3 clicks the text should say: Score: 15';
            b.click();
            if (x.textContent !== 'Score: 20') return 'After 4 clicks the text should say: Score: 20';
            return t.textContent === 'You Win!' || 'At 20 the title should become: You Win!';
          },
        },
      ],
    }),
  ];

  // =========================================================
  // EXTRA QUESTIONS (every test round now has 3-4 enemies)
  // and the BOSS rounds that close each course
  // =========================================================
  const isBlue = ([r, g, b]) => b > 180 && r < 110 && g < 150;
  const isOrange = ([r, g, b]) => r > 220 && g > 110 && g < 200 && b < 90;
  const lt = (hint, solution, q, check, starter) => ({ q, starter: starter || null, hint, solution, check });
  const H = (q, hint, solution, check) => lt(hint, solution, q, check, HTML_HINT);
  const C = (q, hint, solution, check) => lt(hint, solution, q, check, CSS_HINT);
  const J = (q, hint, solution, check, starter) => lt(hint, solution, q, check, starter || JS_HINT);
  const setNum = (code, name, v) => code.replace(new RegExp(name + '\\s*=\\s*-?\\d+'), name + ' = ' + v);

  const EXTRA = {
    'html-1': [
      H('Write an `<h2>` that says **Level 1** and a `<p>` that says **Go!**', '<h2>Level 1</h2> and <p>Go!</p>', '<h2>Level 1</h2>\n<p>Go!</p>',
        (c) => need(c, 'h2', 'an <h2>') || (T($(c, 'h2')) !== 'level 1' ? 'The h2 should say: Level 1' : null) || need(c, 'p', 'a <p>') || T($(c, 'p')) === 'go!' || 'The p should say: Go!'),
      H('Write three headings: an `<h1>` **Title**, an `<h2>` **Chapter** and an `<h3>` **Scene**.', 'Use <h1>, <h2> and <h3> once each.', '<h1>Title</h1>\n<h2>Chapter</h2>\n<h3>Scene</h3>',
        (c) => need(c, 'h1', 'an <h1>') || need(c, 'h2', 'an <h2>') || need(c, 'h3', 'an <h3>') ||
          (T($(c, 'h1')) === 'title' && T($(c, 'h2')) === 'chapter' && T($(c, 'h3')) === 'scene' ? true : 'Texts should be: Title, Chapter, Scene.')),
    ],
    'html-2': [
      H('Write **one** paragraph where **Win** is bold (`<strong>`) and **now** is italic (`<em>`).', '<p><strong>Win</strong> <em>now</em></p>', '<p>You can <strong>Win</strong> <em>now</em>!</p>',
        (c) => need(c, 'p strong', '<strong> inside a <p>') || need(c, 'p em', '<em> inside a <p>') || (T($(c, 'p strong')) !== 'win' ? 'The bold word should be Win.' : T($(c, 'p em')) === 'now' || 'The italic word should be now.')),
    ],
    'html-3': [
      H('Make an image that is also a link: an `<a href="https://example.com">` that contains `<img src="logo.png" alt="Logo">`.', '<a href="https://example.com"><img src="logo.png" alt="Logo"></a>',
        '<a href="https://example.com"><img src="logo.png" alt="Logo"></a>',
        (c) => need(c, 'a img', 'an <img> inside an <a>') || (!($(c, 'a').getAttribute('href') || '').includes('example.com') ? 'The link should go to https://example.com' : $(c, 'a img').getAttribute('src') === 'logo.png' || 'The image src should be logo.png')),
    ],
    'html-4': [
      H('Make a `<ul>` with the items **Sword**, **Shield** and **Potion**, in that order.', '<ul><li>Sword</li><li>Shield</li><li>Potion</li></ul>', '<ul>\n  <li>Sword</li>\n  <li>Shield</li>\n  <li>Potion</li>\n</ul>',
        (c) => need(c, 'ul', 'a <ul>') || $$(c, 'ul > li').map(T).join('|') === 'sword|shield|potion' || 'Items should be Sword, Shield, Potion in that order.'),
      H('Make an `<h2>` that says **Quests** and an `<ol>` with **3** items under it.', '<h2>Quests</h2><ol><li>..</li>x3</ol>', '<h2>Quests</h2>\n<ol>\n  <li>One</li>\n  <li>Two</li>\n  <li>Three</li>\n</ol>',
        (c) => need(c, 'h2', 'an <h2>') || (T($(c, 'h2')) !== 'quests' ? 'The h2 should say: Quests' : need(c, 'ol', 'an <ol>') || $$(c, 'ol > li').length === 3 || 'The ol needs exactly 3 items.')),
    ],
    'html-5': [
      H('Make an `<input>` of type **password** and a `<button>` that says **Login**.', '<input type="password"><button>Login</button>', '<input type="password">\n<button>Login</button>',
        (c) => need(c, 'input[type="password"]', 'an <input type="password">') || need(c, 'button', 'a <button>') || T($(c, 'button')) === 'login' || 'The button should say: Login'),
    ],
    'html-6': [
      H('Make **two** `<div>` elements that both have the class **enemy**.', '<div class="enemy"></div> two times', '<div class="enemy">Bug</div>\n<div class="enemy">Glitch</div>',
        (c) => $$(c, 'div.enemy').length >= 2 || 'You need two <div> elements with class="enemy".'),
      H('Make a `<div id="hud">` that contains a `<p class="score">` with the text **Score: 0**.', '<div id="hud"><p class="score">Score: 0</p></div>', '<div id="hud">\n  <p class="score">Score: 0</p>\n</div>',
        (c) => need(c, '#hud', 'an element with id="hud"') || need(c, '#hud p.score', 'a <p class="score"> inside #hud') || T($(c, '#hud p.score')) === 'score: 0' || 'The text should be: Score: 0'),
    ],
    'css-1': [
      C('Make the `p` text **blue**.', 'p { color: blue; }', 'p { color: blue; }', (c) => isBlue(rgb(cs(c, 'p').color)) || 'The p text should be blue.'),
      C('Give the `h1` a **yellow** background color.', 'h1 { background-color: yellow; }', 'h1 { background-color: yellow; }', (c) => isYellow(rgb(cs(c, 'h1').backgroundColor)) || 'Use background-color: yellow; on h1.'),
    ],
    'css-2': [
      C('Make the `h1` **UPPERCASE** (text-transform) and **centered**.', 'h1 { text-transform: uppercase; text-align: center; }', 'h1 { text-transform: uppercase; text-align: center; }',
        (c) => { const s = cs(c, 'h1'); return s.textTransform !== 'uppercase' ? 'Use text-transform: uppercase;' : s.textAlign === 'center' || 'Use text-align: center;'; }),
    ],
    'css-3': [
      C('Give `.box` a **margin of 20px** on all sides and a **padding-left of 40px**.', '.box { margin: 20px; padding-left: 40px; }', '.box { margin: 20px; padding-left: 40px; }',
        (c) => { const s = cs(c, '.box'); return [s.marginTop, s.marginRight, s.marginBottom, s.marginLeft].every((v) => v === '20px') ? s.paddingLeft === '40px' || 'padding-left should be 40px.' : 'Margin should be 20px on all four sides.'; }),
    ],
    'css-4': [
      C('Make **.hero** text **blue** and **#boss** text **red**.', '.hero { color: blue; } #boss { color: red; }', '.hero { color: blue; }\n#boss { color: red; }',
        (c) => (!isBlue(rgb(cs(c, '.hero').color)) ? '.hero text should be blue.' : isRed(rgb(cs(c, '#boss').color)) || '#boss text should be red.')),
    ],
    'css-5': [
      C('Make `.row` flex with items spread out using **space-between**.', '.row { display: flex; justify-content: space-between; }', '.row { display: flex; justify-content: space-between; }',
        (c) => (cs(c, '.row').display !== 'flex' ? 'Use display: flex;' : cs(c, '.row').justifyContent === 'space-between' || 'Use justify-content: space-between;')),
      C('Make `.row` a flex container that stacks its items in a **column**.', '.row { display: flex; flex-direction: column; }', '.row { display: flex; flex-direction: column; }',
        (c) => (cs(c, '.row').display !== 'flex' ? 'Use display: flex;' : cs(c, '.row').flexDirection === 'column' || 'Use flex-direction: column;')),
    ],
    'css-6': [
      C('Give `.btn` a **border-radius of 50px** and an **orange** background.', '.btn { border-radius: 50px; background-color: orange; }', '.btn { border-radius: 50px; background-color: orange; }',
        (c) => (cs(c, '.btn').borderTopLeftRadius !== '50px' ? 'border-radius should be 50px.' : isOrange(rgb(cs(c, '.btn').backgroundColor)) || 'The background should be orange.')),
    ],
    'js-1': [
      J('Print the numbers **1**, **2** and **3**, each on its own line.', 'console.log(1); console.log(2); console.log(3);', 'console.log(1);\nconsole.log(2);\nconsole.log(3);',
        (c) => c.logs.join(',') === '1,2,3' || 'The console should show 1, 2 and 3 on separate lines.'),
    ],
    'js-2': [
      J('Create `coins` = **5**, add **3** to it (`coins = coins + 3`), then print `coins`.', 'let coins = 5; coins = coins + 3; console.log(coins);', 'let coins = 5;\ncoins = coins + 3;\nconsole.log(coins);',
        (c) => (!/\bcoins\s*=\s*5/.test(c.code) ? 'Start with let coins = 5;' : last(c) === '8' || 'After adding 3 the console should show 8.')),
    ],
    'js-3': [
      J('Print the result of `(10 + 5) * 2` (use brackets!).', 'console.log((10 + 5) * 2);', 'console.log((10 + 5) * 2);',
        (c) => (!/\(/.test(c.code.replace(/console\.log\(/g, '')) ? 'Use brackets ( ) around 10 + 5.' : last(c) === '30' || 'The console should show 30.')),
      J('Create `price = 50` and print `price / 2`.', 'console.log(price / 2);', 'let price = 50;\nconsole.log(price / 2);',
        (c) => (!/\bprice\s*=\s*50/.test(c.code) ? 'Create price = 50 first.' : last(c) === '25' || 'The console should show 25.')),
    ],
    'js-4': [
      J('Create `word = "Boss"` and print how many letters it has using `.length`.', 'console.log(word.length);', 'let word = "Boss";\nconsole.log(word.length);',
        (c) => (!/\.length/.test(c.code) ? 'Use word.length' : last(c) === '4' || 'The console should show 4.')),
    ],
    'js-5': [
      J('With `lives = 0`: print **Game Over** if lives is 0, otherwise print **Keep going**.', 'if (lives === 0) {...} else {...}', 'let lives = 0;\nif (lives === 0) {\n  console.log("Game Over");\n} else {\n  console.log("Keep going");\n}',
        async (c) => {
          if (last(c) !== 'Game Over') return 'With lives = 0 it should print Game Over.';
          const r = await c.run(setNum(c.code, 'lives', 3));
          return last(r) === 'Keep going' || 'With lives = 3 it should print Keep going. Use else.';
        }, 'let lives = 0;\n// your code here\n'),
    ],
    'js-6': [
      J('Use a loop to print the **even** numbers **2, 4, 6, 8, 10**, one per line.', 'for (let i = 2; i <= 10; i += 2) { ... }', 'for (let i = 2; i <= 10; i += 2) {\n  console.log(i);\n}',
        (c) => (!/\b(for|while)\b/.test(c.code) ? 'Use a loop.' : c.logs.join(',') === '2,4,6,8,10' || 'It should print 2, 4, 6, 8, 10.')),
    ],
    'js-7': [
      J('Write a function called **add** that takes `a` and `b` and returns `a + b`.', 'function add(a, b) { return a + b; }', 'function add(a, b) {\n  return a + b;\n}',
        async (c) => {
          const r = await c.run(c.code + '\nconsole.log(add(2, 3));\nconsole.log(add(10, -4));');
          if (r.errors.length) return 'Your function is not working. Is it named add?';
          return r.logs.join(',') === '5,6' || 'add(2, 3) should give 5 and add(10, -4) should give 6.';
        }),
    ],
    'js-8': [
      J('Create `loot = ["Gold", "Gem", "Key"]` and print its **last** item.', 'console.log(loot[2]);', 'let loot = ["Gold", "Gem", "Key"];\nconsole.log(loot[2]);',
        (c) => (!/loot/.test(c.code) ? 'Create the array loot first.' : last(c) === 'Key' || 'The console should show: Key')),
      J('Create an empty array `bag = []`, push **"Map"** and **"Torch"**, then print `bag.length`.', 'bag.push("Map"); bag.push("Torch");', 'let bag = [];\nbag.push("Map");\nbag.push("Torch");\nconsole.log(bag.length);',
        (c) => (!/\.push\(/.test(c.code) ? 'Use bag.push(...)' : last(c) === '2' || 'The console should show 2.')),
    ],
    'js-9': [
      J('Change the text of **text** to **Hello Player** and the text of **title** to **Boss Fight**.', 'document.getElementById("text").textContent = ...', 'document.getElementById("text").textContent = "Hello Player";\ndocument.getElementById("title").textContent = "Boss Fight";',
        (c) => (c.doc.getElementById('text').textContent !== 'Hello Player' ? 'The text element should say: Hello Player' : c.doc.getElementById('title').textContent === 'Boss Fight' || 'The title should say: Boss Fight')),
      J('When the button **btn** is clicked, change the **title** to **Clicked!**.', 'btn.addEventListener("click", ...)', 'document.getElementById("btn").addEventListener("click", function () {\n  document.getElementById("title").textContent = "Clicked!";\n});',
        (c) => {
          const t = c.doc.getElementById('title');
          if (t.textContent === 'Clicked!') return 'It should change only AFTER the click.';
          c.doc.getElementById('btn').click();
          return t.textContent === 'Clicked!' || 'After clicking, the title should say: Clicked!';
        }),
    ],
    'js-10': [
      J('Each click adds **2** to the score and shows **Score: N** in `text`. (4 clicks should show Score: 8)', 'let score = 0; btn.addEventListener("click", ...)',
        'let score = 0;\nconst btn = document.getElementById("btn");\nconst text = document.getElementById("text");\nbtn.addEventListener("click", function () {\n  score = score + 2;\n  text.textContent = "Score: " + score;\n});',
        (c) => {
          const b = c.doc.getElementById('btn'), x = c.doc.getElementById('text');
          b.click(); b.click(); b.click();
          if (x.textContent !== 'Score: 6') return 'After 3 clicks the text should say: Score: 6';
          b.click();
          return x.textContent === 'Score: 8' || 'After 4 clicks the text should say: Score: 8';
        }),
    ],
  };
  [...html, ...css, ...js].forEach((l) => (EXTRA[l.id] || []).forEach((t) => l.tests.push(t)));
  // a test round must always start from an empty editor with a hint comment
  [...html, ...css, ...js].forEach((l) => l.tests.forEach((t) => { if (!t.starter) t.starter = l.kind === 'html' ? HTML_HINT : l.kind === 'css' ? CSS_HINT : JS_HINT; }));

  // ---------- bosses (one per course, 4 questions each) ----------
  const BOSS_CSS_BASE = '<h1>Boss Arena</h1>\n<p class="info">Defeat the Titan</p>\n<button class="btn">Attack</button>\n<div class="row">\n  <div class="item">1</div>\n  <div class="item">2</div>\n</div>';
  const BOSSES = {
    html: {
      id: 'boss-html', kind: 'html', title: 'Boss: Zephyr, Lord of Broken Tags',
      tests: [
        H('Make an `<h1>` that says **Boss Fight** and a `<p>` that contains one `<strong>` word.', '<h1>Boss Fight</h1><p>Be <strong>brave</strong></p>', '<h1>Boss Fight</h1>\n<p>Be <strong>brave</strong></p>',
          (c) => need(c, 'h1', 'an <h1>') || (T($(c, 'h1')) !== 'boss fight' ? 'The h1 should say: Boss Fight' : need(c, 'p strong', '<strong> inside a <p>') || true)),
        H('Make an `<h2>` that says **Inventory**, then a `<ul>` with **Sword**, **Shield** and **Potion**.', '<h2>Inventory</h2><ul><li>..</li></ul>', '<h2>Inventory</h2>\n<ul>\n  <li>Sword</li>\n  <li>Shield</li>\n  <li>Potion</li>\n</ul>',
          (c) => need(c, 'h2', 'an <h2>') || (T($(c, 'h2')) !== 'inventory' ? 'The h2 should say: Inventory' : need(c, 'ul', 'a <ul>') || $$(c, 'ul > li').map(T).join('|') === 'sword|shield|potion' || 'Items: Sword, Shield, Potion.')),
        H('Make a `<div class="card">` that has an `<h2>` **Hero**, an `<img src="hero.png" alt="Hero">` and a `<button>` **Select**.', '<div class="card"> h2 + img + button </div>',
          '<div class="card">\n  <h2>Hero</h2>\n  <img src="hero.png" alt="Hero">\n  <button>Select</button>\n</div>',
          (c) => need(c, 'div.card', '<div class="card">') || need(c, '.card h2', 'an <h2> inside the card') || need(c, '.card img', 'an <img> inside the card') || need(c, '.card button', 'a <button> inside the card') ||
            (T($(c, '.card h2')) !== 'hero' ? 'The h2 should say: Hero' : T($(c, '.card button')) === 'select' || 'The button should say: Select')),
        H('Make a `<div id="menu">` that contains a link **Play** (to `https://example.com`), an `<input>` with placeholder **Name**, and a `<button>` **Go**.', '<div id="menu"><a href=..>Play</a><input placeholder="Name"><button>Go</button></div>',
          '<div id="menu">\n  <a href="https://example.com">Play</a>\n  <input type="text" placeholder="Name">\n  <button>Go</button>\n</div>',
          (c) => need(c, '#menu', 'an element with id="menu"') || need(c, '#menu a', 'an <a> inside #menu') || need(c, '#menu input', 'an <input> inside #menu') || need(c, '#menu button', 'a <button> inside #menu') ||
            (T($(c, '#menu a')) !== 'play' ? 'The link should say: Play' : ($(c, '#menu input').getAttribute('placeholder') || '').toLowerCase() !== 'name' ? 'The placeholder should be: Name' : T($(c, '#menu button')) === 'go' || 'The button should say: Go')),
      ],
    },
    css: {
      id: 'boss-css', kind: 'css', base: BOSS_CSS_BASE, baseStyle: CSS_STYLE + '.item{background:#334;color:#fff;padding:4px 10px}.btn{padding:10px 18px;border:0}', title: 'Boss: Titan the Unstyled',
      tests: [
        C('Make the `h1` **red** and **48px** big.', 'h1 { color: red; font-size: 48px; }', 'h1 { color: red; font-size: 48px; }',
          (c) => (!isRed(rgb(cs(c, 'h1').color)) ? 'The h1 should be red.' : cs(c, 'h1').fontSize === '48px' || 'The h1 font-size should be 48px.')),
        C('Give `.btn` a **green** background, **white** text and a **border-radius of 8px**.', '.btn { background-color: green; color: white; border-radius: 8px; }', '.btn { background-color: green; color: white; border-radius: 8px; }',
          (c) => { const s = cs(c, '.btn'); return !isGreen(rgb(s.backgroundColor)) ? 'The button should have a green background.' : !isWhite(rgb(s.color)) ? 'The button text should be white.' : s.borderTopLeftRadius === '8px' || 'border-radius should be 8px.'; }),
        C('Make `.row` a **flex** container with a **15px** gap and its items **centered** horizontally.', '.row { display: flex; gap: 15px; justify-content: center; }', '.row { display: flex; gap: 15px; justify-content: center; }',
          (c) => { const s = cs(c, '.row'); return s.display !== 'flex' ? 'Use display: flex;' : s.justifyContent !== 'center' ? 'Use justify-content: center;' : s.columnGap === '15px' || 'Use gap: 15px;'; }),
        C('Give `.item` **padding of 10px** and a **2px solid** border, and add a `.item:hover` rule that changes the **background-color**.', '.item { padding: 10px; border: 2px solid black; } .item:hover { background-color: orange; }',
          '.item { padding: 10px; border: 2px solid black; }\n.item:hover { background-color: orange; }',
          (c) => { const s = cs(c, '.item'); return s.paddingTop !== '10px' ? 'Padding should be 10px.' : (s.borderTopWidth !== '2px' || s.borderTopStyle !== 'solid') ? 'Use border: 2px solid <color>;' : /\.item\s*:hover\s*\{[^}]*background/i.test(c.code) || 'Add .item:hover { background-color: ... }'; }),
      ],
    },
    js: {
      id: 'boss-js', kind: 'js', base: JS_BASE, baseStyle: JS_BASE_STYLE, title: 'Boss: The Null Titan',
      tests: [
        J('Create `hp = 100`, subtract **30** from it, and print `hp`.', 'let hp = 100; hp = hp - 30; console.log(hp);', 'let hp = 100;\nhp = hp - 30;\nconsole.log(hp);',
          (c) => (!/\bhp\s*=\s*100/.test(c.code) ? 'Start with let hp = 100;' : last(c) === '70' || 'The console should show 70.')),
        J('Write a function **damage** that takes `hp` and returns `hp - 25`.', 'function damage(hp) { return hp - 25; }', 'function damage(hp) {\n  return hp - 25;\n}',
          async (c) => {
            const r = await c.run(c.code + '\nconsole.log(damage(100));\nconsole.log(damage(40));');
            if (r.errors.length) return 'Your function is not working. Is it named damage?';
            return r.logs.join(',') === '75,15' || 'damage(100) should give 75 and damage(40) should give 15.';
          }),
        J('Use a loop to add the numbers **1 + 2 + 3 + 4 + 5** into `total`, then print `total`.', 'let total = 0; for (...) { total = total + i; }', 'let total = 0;\nfor (let i = 1; i <= 5; i++) {\n  total = total + i;\n}\nconsole.log(total);',
          (c) => (!/\b(for|while)\b/.test(c.code) ? 'Use a loop.' : last(c) === '15' || 'The console should show 15.')),
        J('When **btn** is clicked, change the **title** text to **Boss Defeated!**', 'btn.addEventListener("click", ...)', 'document.getElementById("btn").addEventListener("click", function () {\n  document.getElementById("title").textContent = "Boss Defeated!";\n});',
          (c) => {
            const t = c.doc.getElementById('title');
            if (t.textContent === 'Boss Defeated!') return 'It should change only AFTER the click.';
            c.doc.getElementById('btn').click();
            return t.textContent === 'Boss Defeated!' || 'After clicking, the title should say: Boss Defeated!';
          }),
      ],
    },
  };
  window.BOSSES = BOSSES;

  window.COURSES = [
    {
      id: 'html', name: 'HTML', tag: 'The skeleton',
      desc: 'Build the structure of a page: headings, text, links, images, lists and buttons.',
      file: 'index.html', lessons: html, boss: BOSSES.html,
    },
    {
      id: 'css', name: 'CSS', tag: 'The style',
      desc: 'Make pages beautiful with colors, fonts, spacing, layout and hover effects.',
      file: 'style.css', lessons: css, boss: BOSSES.css,
    },
    {
      id: 'js', name: 'JavaScript', tag: 'The brain',
      desc: 'Bring pages to life: variables, decisions, loops, functions and a click game.',
      file: 'script.js', lessons: js, boss: BOSSES.js,
    },
  ];
})();
