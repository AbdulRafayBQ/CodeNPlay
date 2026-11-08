/* =========================================================
   CodeNPlay - more topics (loaded after lessons.js, before core.js)
   HTML: forms, inputs, select, attributes, tables
   CSS : display, flexbox properties, grid properties, position, tables, forms
   One lesson per property. Every question has related suggestion tags.
   ========================================================= */
(function () {
  const C = window.COURSES;
  const $ = (c, s) => c.doc.querySelector(s), $$ = (c, s) => Array.from(c.doc.querySelectorAll(s));
  const T = (e) => (e ? e.textContent.trim().toLowerCase() : '');
  const cs = (c, s) => { const e = $(c, s); return e ? c.win.getComputedStyle(e) : null; };
  const kebab = (p) => p.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
  const need = (c, s, n) => ($(c, s) ? null : 'I cannot find ' + (n || s) + ' on the page.');
  // css check: computed property of a selector equals value (or one of several)
  const P = (sel, prop, val) => (c) => {
    const s = cs(c, sel); if (!s) return 'I cannot find ' + sel + ' on the page.';
    return [].concat(val).includes(s[prop]) || 'On ' + sel + ', use ' + kebab(prop) + ': ' + [].concat(val)[0] + ';';
  };
  const all = (...fs) => (c) => { for (const f of fs) { const r = f(c); if (r !== true) return r; } return true; };
  const code = (rx, msg) => (c) => rx.test(c.code) || msg;

  const HH = '<!-- write your code here -->\n', CH = '/* write your code here */\n';
  const H = (q, hint, solution, check, tags) => ({ q, hint, solution, check, tags, starter: HH });
  const K = (q, hint, solution, check, tags) => ({ q, hint, solution, check, tags, starter: CH });
  const BASE = 'body{font-family:system-ui,sans-serif;padding:16px;color:#1b1f3a}';
  const ITEMS = '.item{background:#5b4bff;color:#fff;padding:10px 16px;margin:4px}.box,.grid{border:2px dashed #888;min-height:100px}';
  const BOX = '<div class="box">\n  <div class="item">1</div>\n  <div class="item">2</div>\n  <div class="item">3</div>\n</div>';
  const GRID = '<div class="grid">\n  <div class="item">1</div>\n  <div class="item">2</div>\n  <div class="item">3</div>\n  <div class="item">4</div>\n  <div class="item">5</div>\n  <div class="item">6</div>\n</div>';
  const GRID3 = BASE + ITEMS + '.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}';
  const TABLE = '<table>\n  <tr><th>Name</th><th>Score</th></tr>\n  <tr><td>Hero</td><td>100</td></tr>\n</table>';
  const FORM = '<form>\n  <input type="text" placeholder="Your name">\n  <button type="button">Send</button>\n</form>';
  const lh = (id, title, intro, example, task, starter, tests) => ({ id, title, kind: 'html', intro, example, task, starter, tests });
  const lc = (id, title, base, baseStyle, intro, example, task, starter, tests) => ({ id, title, kind: 'css', base, baseStyle, intro, example, task, starter, tests });

  // ---------------- HTML ----------------
  const html = [
    lh('html-7', 'Forms and Labels',
      'A **form** collects information. Wrap the fields in a `<form>` tag.\n\nA `<label>` tells the user what a field is for. Its `for` attribute must match the `id` of the input. Then clicking the label focuses the input.',
      '<form>\n  <label for="name">Name</label>\n  <input type="text" id="name">\n  <button type="submit">Send</button>\n</form>',
      'Add a second label and input for `email`.', '<form>\n  <label for="name">Name</label>\n  <input type="text" id="name">\n</form>\n', [
        H('Make a `<form>` with a `<label for="name">` that says **Name** and an `<input type="text" id="name">`.', '<form><label for="name">Name</label><input type="text" id="name"></form>',
          '<form>\n  <label for="name">Name</label>\n  <input type="text" id="name">\n</form>',
          (c) => need(c, 'form', 'a <form>') || need(c, 'form label[for="name"]', '<label for="name">') || (T($(c, 'label')) !== 'name' ? 'The label should say: Name' : need(c, 'form input#name', '<input id="name"> inside the form') || true), ['<form>', '<label>', 'for', 'id', '<input>']),
        H('Make a `<form>` with an `<input type="email">` and a `<button type="submit">` that says **Join**.', '<form><input type="email"><button type="submit">Join</button></form>',
          '<form>\n  <input type="email">\n  <button type="submit">Join</button>\n</form>',
          (c) => need(c, 'form input[type="email"]', 'an email input inside a <form>') || need(c, 'form button[type="submit"]', 'a submit button inside the form') || T($(c, 'button')) === 'join' || 'The button should say: Join', ['<form>', 'type="email"', '<button>', 'type="submit"']),
      ]),
    lh('html-8', 'Input Types',
      'The `type` attribute changes what an input does: `text`, `email`, `number`, `password`, `checkbox`, `radio`, `date`.\n\n`number` accepts `min` and `max`. Radio buttons that share the same `name` work as one group: only one can be picked.',
      '<input type="number" min="1" max="10">\n<input type="checkbox" id="ok"><label for="ok">OK</label>\n<input type="radio" name="size"> S\n<input type="radio" name="size"> M',
      'Add a `date` input.', '<input type="number" min="1" max="10">\n', [
        H('Make a number input with `min="1"` and `max="10"`.', '<input type="number" min="1" max="10">', '<input type="number" min="1" max="10">',
          (c) => need(c, 'input[type="number"]', 'a number input') || ($(c, 'input').getAttribute('min') === '1' && $(c, 'input').getAttribute('max') === '10') || 'It needs min="1" and max="10".', ['type="number"', 'min', 'max']),
        H('Make a checkbox with a label that says **I agree**.', '<input type="checkbox" id="a"><label for="a">I agree</label>', '<input type="checkbox" id="agree">\n<label for="agree">I agree</label>',
          (c) => need(c, 'input[type="checkbox"]', 'a checkbox') || need(c, 'label', 'a <label>') || T($(c, 'label')) === 'i agree' || 'The label should say: I agree', ['type="checkbox"', '<label>', 'for', 'id']),
        H('Make **two** radio buttons that share the name **level**.', '<input type="radio" name="level"> two times', '<input type="radio" name="level"> Easy\n<input type="radio" name="level"> Hard',
          (c) => $$(c, 'input[type="radio"][name="level"]').length >= 2 || 'You need two radio inputs with name="level".', ['type="radio"', 'name']),
      ]),
    lh('html-9', 'Select and Textarea',
      '`<select>` makes a dropdown. Each choice is an `<option>`. The `value` attribute is what gets sent, and `selected` picks the default choice.\n\n`<textarea>` is a big box for long text. `rows` and `cols` set its size.',
      '<select>\n  <option value="easy">Easy</option>\n  <option value="hard" selected>Hard</option>\n</select>\n<textarea rows="4" cols="30"></textarea>',
      'Add a third option, `Medium`.', '<select>\n  <option>Easy</option>\n  <option>Hard</option>\n</select>\n', [
        H('Make a `<select>` with **3** `<option>` choices.', '<select> with three <option>', '<select>\n  <option>One</option>\n  <option>Two</option>\n  <option>Three</option>\n</select>',
          (c) => need(c, 'select', 'a <select>') || $$(c, 'select > option').length === 3 || 'The select needs exactly 3 options.', ['<select>', '<option>', 'value']),
        H('Make a `<textarea>` with `rows="4"`.', '<textarea rows="4"></textarea>', '<textarea rows="4"></textarea>',
          (c) => need(c, 'textarea', 'a <textarea>') || $(c, 'textarea').getAttribute('rows') === '4' || 'Add rows="4".', ['<textarea>', 'rows', 'cols']),
        H('Make a `<select>` where the option **Hard** has `value="hard"` and is already `selected`.', '<option value="hard" selected>Hard</option>', '<select>\n  <option value="easy">Easy</option>\n  <option value="hard" selected>Hard</option>\n</select>',
          (c) => need(c, 'select', 'a <select>') || (c.doc.querySelector('select').value === 'hard' || 'The select should start on value="hard". Add selected to that option.'), ['<select>', '<option>', 'value', 'selected']),
      ]),
    lh('html-10', 'Form Attributes',
      'Attributes give a field extra rules.\n\n`placeholder` shows a hint. `required` stops the form until the field is filled. `name` is the field\'s label for the server. `value` is the starting text. `disabled` makes a field unusable.',
      '<input type="text" name="user" value="Hero" required placeholder="Username">\n<button disabled>Locked</button>',
      'Make the button not disabled by removing the attribute.', '<input type="text" required>\n', [
        H('Make an input with `required` and `placeholder="Your email"`.', '<input required placeholder="Your email">', '<input type="email" required placeholder="Your email">',
          (c) => need(c, 'input[required]', 'an input with required') || $(c, 'input').getAttribute('placeholder') === 'Your email' || 'placeholder should be: Your email', ['required', 'placeholder']),
        H('Make an input with `name="user"` and `value="Hero"`.', '<input name="user" value="Hero">', '<input type="text" name="user" value="Hero">',
          (c) => need(c, 'input[name="user"]', 'an input with name="user"') || $(c, 'input').getAttribute('value') === 'Hero' || 'value should be: Hero', ['name', 'value']),
        H('Make a `<button>` that says **Locked** and is `disabled`.', '<button disabled>Locked</button>', '<button disabled>Locked</button>',
          (c) => need(c, 'button[disabled]', 'a disabled button') || T($(c, 'button')) === 'locked' || 'The button should say: Locked', ['<button>', 'disabled']),
      ]),
    lh('html-11', 'Tables',
      'A **table** shows data in rows and columns. `<table>` is the whole table, `<tr>` is a row, `<th>` is a header cell (bold) and `<td>` is a normal data cell.\n\nBig tables use `<thead>` for the header rows and `<tbody>` for the data rows.',
      '<table>\n  <thead>\n    <tr><th>Name</th><th>Score</th></tr>\n  </thead>\n  <tbody>\n    <tr><td>Hero</td><td>100</td></tr>\n  </tbody>\n</table>',
      'Add a row for `Wizard` with score `80`.', '<table>\n  <tr><th>Name</th><th>Score</th></tr>\n  <tr><td>Hero</td><td>100</td></tr>\n</table>\n', [
        H('Make a table with one row that has two `<th>` cells: **Name** and **Score**.', '<table><tr><th>Name</th><th>Score</th></tr></table>', '<table>\n  <tr><th>Name</th><th>Score</th></tr>\n</table>',
          (c) => need(c, 'table tr', 'a <table> with a <tr>') || ($$(c, 'th').map(T).join('|') === 'name|score' || 'The th cells should be Name, then Score.'), ['<table>', '<tr>', '<th>']),
        H('Make a table with a header row (**Name**, **Score**) and one data row (**Hero**, **100**).', 'Two <tr>: first with <th>, second with <td>', TABLE,
          (c) => need(c, 'table', 'a <table>') || ($$(c, 'tr').length !== 2 ? 'You need 2 rows (<tr>).' : null) || ($$(c, 'th').map(T).join('|') !== 'name|score' ? 'The th cells should be Name, then Score.' : null) || ($$(c, 'td').map(T).join('|') === 'hero|100' || 'The td cells should be Hero, then 100.'), ['<tr>', '<th>', '<td>']),
        H('Make a table that uses a `<thead>` and a `<tbody>`.', '<table><thead>..</thead><tbody>..</tbody></table>', '<table>\n  <thead><tr><th>Item</th></tr></thead>\n  <tbody><tr><td>Sword</td></tr></tbody>\n</table>',
          (c) => need(c, 'table > thead', 'a <thead>') || need(c, 'table > tbody', 'a <tbody>') || true, ['<thead>', '<tbody>', '<tr>']),
      ]),
    lh('html-12', 'Colspan, Rowspan and Caption',
      'A cell can stretch. `colspan="2"` makes a cell cover 2 **columns**. `rowspan="2"` makes it cover 2 **rows**.\n\n`<caption>` is the title of the table and goes right after `<table>`.',
      '<table>\n  <caption>Scores</caption>\n  <tr><th colspan="2">Team</th></tr>\n  <tr><td>Hero</td><td>100</td></tr>\n</table>',
      'Change `colspan` to 3 and add one more cell in the second row.', '<table>\n  <tr><th colspan="2">Team</th></tr>\n  <tr><td>Hero</td><td>100</td></tr>\n</table>\n', [
        H('Make a table with a header cell that has `colspan="2"`.', '<th colspan="2">', '<table>\n  <tr><th colspan="2">Team</th></tr>\n  <tr><td>A</td><td>B</td></tr>\n</table>',
          (c) => need(c, '[colspan="2"]', 'a cell with colspan="2"') || true, ['colspan', '<th>', '<td>']),
        H('Make a table with a cell that has `rowspan="2"`.', '<td rowspan="2">', '<table>\n  <tr><td rowspan="2">A</td><td>B</td></tr>\n  <tr><td>C</td></tr>\n</table>',
          (c) => need(c, '[rowspan="2"]', 'a cell with rowspan="2"') || true, ['rowspan', '<td>', '<tr>']),
        H('Add a `<caption>` that says **Scores** to a table.', '<table><caption>Scores</caption>..</table>', '<table>\n  <caption>Scores</caption>\n  <tr><td>1</td></tr>\n</table>',
          (c) => need(c, 'table > caption', 'a <caption> inside the table') || T($(c, 'caption')) === 'scores' || 'The caption should say: Scores', ['<caption>', '<table>']),
      ]),
  ];

  // ---------------- CSS ----------------
  const FB = BASE + ITEMS;
  const css = [
    lc('css-7', 'display', BOX, FB,
      '`display` decides how a box behaves. `block` takes the full row. `inline` sits inside a line of text. `inline-block` sits in a line but keeps width and height. `none` hides the element completely.',
      '.item {\n  display: inline-block;\n}\n.box {\n  display: none;\n}', 'Try `display: inline;` on `.item`, then `display: none;` on `.box`.', '.item {\n  display: inline-block;\n}\n', [
        K('Make `.item` use `display: inline-block;`.', '.item { display: inline-block; }', '.item { display: inline-block; }', P('.item', 'display', 'inline-block'), ['display', 'inline-block', 'block']),
        K('Hide the whole `.box` with `display: none;`.', '.box { display: none; }', '.box { display: none; }', P('.box', 'display', 'none'), ['display', 'none']),
        K('Make `.item` use `display: inline;` so the items sit side by side in one line.', '.item { display: inline; }', '.item { display: inline; }', P('.item', 'display', 'inline'), ['display', 'inline']),
      ]),
    lc('css-8', 'flex-direction', BOX, FB,
      'A flex container lays its children in a line. `flex-direction` chooses the direction: `row` (left to right, default), `row-reverse`, `column` (top to bottom) or `column-reverse`.',
      '.box {\n  display: flex;\n  flex-direction: column;\n}', 'Change the direction to `row-reverse`.', '.box {\n  display: flex;\n}\n', [
        K('Make `.box` a flex container with `flex-direction: column;`.', '.box { display: flex; flex-direction: column; }', '.box { display: flex; flex-direction: column; }', all(P('.box', 'display', 'flex'), P('.box', 'flexDirection', 'column')), ['display', 'flex-direction', 'column']),
        K('Make `.box` a flex container with `flex-direction: row-reverse;`.', '.box { display: flex; flex-direction: row-reverse; }', '.box { display: flex; flex-direction: row-reverse; }', all(P('.box', 'display', 'flex'), P('.box', 'flexDirection', 'row-reverse')), ['display', 'flex-direction', 'row-reverse']),
      ]),
    lc('css-9', 'justify-content', BOX, FB,
      '`justify-content` spreads flex items along the **main axis** (the direction of the row). Values: `flex-start`, `center`, `flex-end`, `space-between`, `space-around`.',
      '.box {\n  display: flex;\n  justify-content: space-between;\n}', 'Try `center`, then `flex-end`.', '.box {\n  display: flex;\n}\n', [
        K('Make `.box` flex and put the items in the **center** with `justify-content`.', '.box { display: flex; justify-content: center; }', '.box { display: flex; justify-content: center; }', all(P('.box', 'display', 'flex'), P('.box', 'justifyContent', 'center')), ['display', 'justify-content', 'center']),
        K('Make `.box` flex and push the items apart with `justify-content: space-between;`.', '.box { display: flex; justify-content: space-between; }', '.box { display: flex; justify-content: space-between; }', all(P('.box', 'display', 'flex'), P('.box', 'justifyContent', 'space-between')), ['justify-content', 'space-between']),
        K('Make `.box` flex and put the items at the end with `justify-content: flex-end;`.', '.box { display: flex; justify-content: flex-end; }', '.box { display: flex; justify-content: flex-end; }', all(P('.box', 'display', 'flex'), P('.box', 'justifyContent', ['flex-end', 'end'])), ['justify-content', 'flex-end']),
      ]),
    lc('css-10', 'align-items', BOX, FB + '.box{height:160px}',
      '`align-items` places flex items on the **cross axis** (up and down in a row). Values: `stretch` (default), `flex-start`, `center`, `flex-end`.\n\nTogether, `justify-content` and `align-items` with `center` put an item in the exact middle.',
      '.box {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}', 'Try `align-items: flex-end;`.', '.box {\n  display: flex;\n}\n', [
        K('Make `.box` flex with `align-items: center;`.', '.box { display: flex; align-items: center; }', '.box { display: flex; align-items: center; }', all(P('.box', 'display', 'flex'), P('.box', 'alignItems', 'center')), ['display', 'align-items', 'center']),
        K('Make `.box` flex with `align-items: flex-end;`.', '.box { display: flex; align-items: flex-end; }', '.box { display: flex; align-items: flex-end; }', all(P('.box', 'display', 'flex'), P('.box', 'alignItems', ['flex-end', 'end'])), ['align-items', 'flex-end']),
        K('Center the items **both ways**: `justify-content: center;` and `align-items: center;`.', 'Use both properties with center.', '.box {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}', all(P('.box', 'justifyContent', 'center'), P('.box', 'alignItems', 'center')), ['justify-content', 'align-items', 'center']),
      ]),
    lc('css-11', 'flex-wrap and gap', BOX, FB + '.box{width:260px}',
      'By default flex items stay on one line and shrink. `flex-wrap: wrap;` lets them drop to the next line when there is no room.\n\n`gap` adds space **between** items, so you do not need margins.',
      '.box {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 12px;\n}', 'Change the gap to `24px`.', '.box {\n  display: flex;\n  flex-wrap: wrap;\n}\n', [
        K('Make `.box` flex with `flex-wrap: wrap;`.', '.box { display: flex; flex-wrap: wrap; }', '.box { display: flex; flex-wrap: wrap; }', all(P('.box', 'display', 'flex'), P('.box', 'flexWrap', 'wrap')), ['flex-wrap', 'wrap', 'display']),
        K('Make `.box` flex with a **gap of 15px**.', '.box { display: flex; gap: 15px; }', '.box { display: flex; gap: 15px; }', all(P('.box', 'display', 'flex'), P('.box', 'columnGap', '15px')), ['display', 'gap']),
      ]),
    lc('css-12', 'flex-grow', BOX, FB,
      '`flex-grow` tells an item how much of the free space it may take. `0` (default) means do not grow. `1` means take your share. If one item has `2` and the others `1`, it gets twice the share.',
      '.box {\n  display: flex;\n}\n.item {\n  flex-grow: 1;\n}', 'Give only `.item:first-child` `flex-grow: 2;`.', '.box {\n  display: flex;\n}\n', [
        K('Make `.box` flex and make every `.item` grow with `flex-grow: 1;`.', '.item { flex-grow: 1; }', '.box { display: flex; }\n.item { flex-grow: 1; }', all(P('.box', 'display', 'flex'), P('.item', 'flexGrow', '1')), ['display', 'flex-grow']),
        K('Make `.box` flex and give `.item:first-child` **flex-grow: 3**.', '.item:first-child { flex-grow: 3; }', '.box { display: flex; }\n.item:first-child { flex-grow: 3; }', all(P('.box', 'display', 'flex'), P('.item:first-child', 'flexGrow', '3')), ['flex-grow', ':first-child']),
      ]),
    lc('css-13', 'grid-template-columns', GRID, BASE + ITEMS,
      '**Grid** lays items in rows and columns. Start with `display: grid;`. `grid-template-columns` sets how many columns and how wide.\n\n`fr` means a fraction of free space. `repeat(3, 1fr)` is the short way to write `1fr 1fr 1fr`.',
      '.grid {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n}', 'Change it to 2 columns.', '.grid {\n  display: grid;\n}\n', [
        K('Make `.grid` a grid with **3 equal columns** (`repeat(3, 1fr)`).', '.grid { display: grid; grid-template-columns: repeat(3, 1fr); }', '.grid {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n}',
          all(P('.grid', 'display', 'grid'), (c) => cs(c, '.grid').gridTemplateColumns.split(' ').length === 3 || 'You need exactly 3 columns.'), ['display', 'grid-template-columns', 'repeat', '1fr']),
        K('Make `.grid` a grid with **2 columns**: the first `200px`, the second `1fr`.', '.grid { grid-template-columns: 200px 1fr; }', '.grid {\n  display: grid;\n  grid-template-columns: 200px 1fr;\n}',
          all(P('.grid', 'display', 'grid'), (c) => { const t = cs(c, '.grid').gridTemplateColumns.split(' '); return (t.length === 2 && t[0] === '200px') || 'Use two columns: 200px 1fr'; }), ['grid-template-columns', '200px', '1fr']),
        K('Make `.grid` a grid with **4 columns** of `100px` each.', '.grid { grid-template-columns: repeat(4, 100px); }', '.grid {\n  display: grid;\n  grid-template-columns: repeat(4, 100px);\n}',
          all(P('.grid', 'display', 'grid'), (c) => cs(c, '.grid').gridTemplateColumns === '100px 100px 100px 100px' || 'Use 4 columns of 100px.'), ['grid-template-columns', 'repeat', '100px']),
      ]),
    lc('css-14', 'grid gap', GRID, BASE + ITEMS + '.grid{display:grid;grid-template-columns:repeat(3,1fr)}',
      '`gap` puts space between grid cells. `column-gap` is the space between columns and `row-gap` between rows. `gap: 10px 20px;` sets row gap first, then column gap.',
      '.grid {\n  gap: 20px;\n}', 'Use different gaps for rows and columns.', '.grid {\n  gap: 10px;\n}\n', [
        K('Give `.grid` a **gap of 20px**.', '.grid { gap: 20px; }', '.grid { gap: 20px; }', all(P('.grid', 'rowGap', '20px'), P('.grid', 'columnGap', '20px')), ['gap', '20px']),
        K('Give `.grid` a `column-gap` of **30px** and a `row-gap` of **10px**.', '.grid { column-gap: 30px; row-gap: 10px; }', '.grid {\n  column-gap: 30px;\n  row-gap: 10px;\n}', all(P('.grid', 'columnGap', '30px'), P('.grid', 'rowGap', '10px')), ['column-gap', 'row-gap']),
      ]),
    lc('css-15', 'grid-column and grid-row', GRID, GRID3,
      'An item can cover more than one cell. `grid-column: span 2;` makes it 2 columns wide. `grid-column: 1 / 4;` means from line 1 to line 4 (3 columns). `grid-row: span 2;` makes it 2 rows tall.',
      '.item:first-child {\n  grid-column: span 2;\n}', 'Make the last item span 3 columns.', '.item:first-child {\n  grid-column: span 2;\n}\n', [
        K('Make `.item:first-child` **span 2 columns**.', '.item:first-child { grid-column: span 2; }', '.item:first-child { grid-column: span 2; }', (c) => /span 2/.test(cs(c, '.item:first-child').gridColumnStart + cs(c, '.item:first-child').gridColumnEnd) || 'Use grid-column: span 2;', ['grid-column', 'span', ':first-child']),
        K('Make `.item:first-child` go from column line **1 to 4** (`grid-column: 1 / 4`).', '.item:first-child { grid-column: 1 / 4; }', '.item:first-child { grid-column: 1 / 4; }', (c) => { const s = cs(c, '.item:first-child'); return (s.gridColumnStart === '1' && s.gridColumnEnd === '4') || 'Use grid-column: 1 / 4;'; }, ['grid-column', '1 / 4']),
        K('Make `.item:first-child` **span 2 rows** with `grid-row`.', '.item:first-child { grid-row: span 2; }', '.item:first-child { grid-row: span 2; }', (c) => /span 2/.test(cs(c, '.item:first-child').gridRowStart + cs(c, '.item:first-child').gridRowEnd) || 'Use grid-row: span 2;', ['grid-row', 'span']),
      ]),
    lc('css-16', 'place-items', GRID, BASE + ITEMS + '.grid{display:grid;grid-template-columns:repeat(3,1fr);grid-auto-rows:80px;gap:8px}.item{padding:4px 8px}',
      '`justify-items` moves grid items left and right inside their cell. `align-items` moves them up and down. `place-items: center;` sets both at once.',
      '.grid {\n  place-items: center;\n}', 'Try `justify-items: end;`.', '.grid {\n  place-items: center;\n}\n', [
        K('Center every item inside its cell with `place-items: center;`.', '.grid { place-items: center; }', '.grid { place-items: center; }', all(P('.grid', 'alignItems', 'center'), P('.grid', 'justifyItems', 'center')), ['place-items', 'center']),
        K('Move the items to the right side of their cell with `justify-items: end;`.', '.grid { justify-items: end; }', '.grid { justify-items: end; }', P('.grid', 'justifyItems', ['end', 'flex-end']), ['justify-items', 'end']),
      ]),
    lc('css-17', 'position and z-index', BOX, FB + '.box{height:140px}',
      '`position: relative;` keeps the element in place and makes it a reference point. `position: absolute;` takes the element out of the flow and places it with `top`, `right`, `bottom`, `left` inside the closest positioned parent.\n\n`z-index` decides which overlapping element is on top. It only works on positioned elements.',
      '.box {\n  position: relative;\n}\n.item:first-child {\n  position: absolute;\n  top: 0;\n  right: 0;\n}', 'Add `z-index: 5;` to the first item.', '.box {\n  position: relative;\n}\n', [
        K('Give `.box` `position: relative;`.', '.box { position: relative; }', '.box { position: relative; }', P('.box', 'position', 'relative'), ['position', 'relative']),
        K('Make `.item:first-child` **absolute**, with `top: 0;` and `right: 0;`.', '.item:first-child { position: absolute; top: 0; right: 0; }', '.box { position: relative; }\n.item:first-child {\n  position: absolute;\n  top: 0;\n  right: 0;\n}', all(P('.item:first-child', 'position', 'absolute'), code(/\btop\s*:/, 'Add top: 0;'), code(/\bright\s*:/, 'Add right: 0;')), ['position', 'absolute', 'top', 'right']),
        K('Give `.item:first-child` `position: relative;` and `z-index: 5;`.', '.item:first-child { position: relative; z-index: 5; }', '.item:first-child {\n  position: relative;\n  z-index: 5;\n}', all(P('.item:first-child', 'position', 'relative'), P('.item:first-child', 'zIndex', '5')), ['position', 'z-index']),
      ]),
    lc('css-18', 'Table styling', TABLE, BASE,
      '`border-collapse: collapse;` merges the double borders of a table into one line. Use `border` on `th` and `td`, `padding` for space inside cells, and `background-color` to color the header.',
      'table {\n  border-collapse: collapse;\n}\nth, td {\n  border: 1px solid #333;\n  padding: 10px;\n}', 'Give `th` a colored background.', 'table {\n  border-collapse: collapse;\n}\n', [
        K('Make the `table` use `border-collapse: collapse;`.', 'table { border-collapse: collapse; }', 'table { border-collapse: collapse; }', P('table', 'borderCollapse', 'collapse'), ['border-collapse', 'collapse']),
        K('Give every `td` **padding of 10px** and a **1px solid** border.', 'td { padding: 10px; border: 1px solid black; }', 'td {\n  padding: 10px;\n  border: 1px solid black;\n}', all(P('td', 'paddingTop', '10px'), P('td', 'borderTopWidth', '1px'), P('td', 'borderTopStyle', 'solid')), ['padding', 'border', '1px solid']),
        K('Give `th` a **background-color** and make its text **left** aligned.', 'th { background-color: gold; text-align: left; }', 'th {\n  background-color: gold;\n  text-align: left;\n}', all((c) => cs(c, 'th').backgroundColor !== 'rgba(0, 0, 0, 0)' || 'Give th a background-color.', P('th', 'textAlign', ['left', 'start'])), ['background-color', 'text-align']),
      ]),
    lc('css-19', 'Form styling and :focus', FORM, BASE,
      'Style a form like any element. `border-radius` rounds the box and `padding` makes it comfortable.\n\nThe `:focus` pseudo-class styles an input while the user is typing in it, and `:hover` styles a button under the mouse.',
      'input {\n  padding: 10px;\n  border-radius: 8px;\n}\ninput:focus {\n  border-color: blue;\n  outline: none;\n}', 'Change the `:focus` border color.', 'input {\n  padding: 10px;\n}\n', [
        K('Give `input` **padding: 10px;** and **border-radius: 8px;**.', 'input { padding: 10px; border-radius: 8px; }', 'input {\n  padding: 10px;\n  border-radius: 8px;\n}', all(P('input', 'paddingTop', '10px'), P('input', 'borderTopLeftRadius', '8px')), ['padding', 'border-radius']),
        K('Write an `input:focus` rule that changes the **border-color** (or outline).', 'input:focus { border-color: blue; }', 'input:focus {\n  border-color: blue;\n}', code(/input\s*:focus\s*\{[^}]*(border|outline)/i, 'Write: input:focus { border-color: ...; }'), [':focus', 'border-color', 'outline']),
        K('Write a `button:hover` rule that changes the **background-color**.', 'button:hover { background-color: orange; }', 'button:hover {\n  background-color: orange;\n}', code(/button\s*:hover\s*\{[^}]*background/i, 'Write: button:hover { background-color: ...; }'), [':hover', 'background-color']),
      ]),
  ];

  C[0].lessons.push(...html);
  C[1].lessons.push(...css);

  // ---------------- suggestions per question (tags related to the question) ----------------
  const JS = {
    'console.log': 'console.log();', getElementById: 'document.getElementById("")', querySelector: 'document.querySelector("")', addEventListener: 'el.addEventListener("click", () => {\n  \n});',
    textContent: 'el.textContent = "";', innerHTML: 'el.innerHTML = "";', classList: 'el.classList.add("")', push: 'list.push()', length: '.length', function: 'function name() {\n  \n}',
    return: 'return ;', let: 'let name = ;', const: 'const name = ;', for: 'for (let i = 0; i < 5; i++) {\n  \n}', while: 'while (condition) {\n  \n}', if: 'if (condition) {\n  \n}', else: 'else {\n  \n}',
  };
  function sugg(src, kind) {
    // Chips only name a tag / attribute / property. They never carry the values from the real answer.
    const out = [], seen = new Set(), add = (key, label, value) => { if (!seen.has(label)) { seen.add(label); out.push({ key, label, value }); } };
    src = String(src || '');
    if (kind === 'html') {
      const rx = /<([a-z][\w-]*)([^>]*)>/gi; let m;
      while ((m = rx.exec(src))) {
        const n = m[1].toLowerCase(), void_ = /^(img|input|br|hr|meta|link)$/.test(n);
        add('<' + n, '<' + n + '>', void_ ? '<' + n + '>' : '<' + n + '></' + n + '>');
        (m[2].match(/[\w-]+(?==)/g) || []).forEach((a) => add(a, a, a + '=\"\"'));
        (m[2].match(/\b(required|disabled|selected|checked)\b/g) || []).forEach((a) => add(a, a, a));
      }
    } else if (kind === 'css') {
      const rx = /([\w-]+)\s*:\s*([^;{}]+)(?:;|(?=\}))/g; let m;
      while ((m = rx.exec(src))) add(m[1], m[1], m[1] + ': ;');
      (src.match(/:(hover|focus|first-child)/g) || []).forEach((p) => add(p, p, p + ' {\n  \n}'));
    } else {
      (src.match(/console\.log|getElementById|querySelector|addEventListener|textContent|innerHTML|classList|push|length|function|return|let|const|for|while|if|else/g) || []).forEach((k) => add(k, k, JS[k]));
    }
    return out.slice(0, 5);
  }
  C.forEach((c) => {
    [...c.lessons, { kind: c.lessons[0].kind, tests: c.boss.tests, boss: 1 }].forEach((l) => {
      const kind = l.kind || c.lessons[0].kind;
      if (!l.boss) l.sugg = sugg(l.example, kind);
      l.tests.forEach((t) => { t.sugg = sugg(t.solution, kind); if (!t.tags) t.tags = t.sugg.map((s) => s.label).slice(0, 5); });
    });
  });
})();
