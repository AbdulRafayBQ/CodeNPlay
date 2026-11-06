/* =========================================================
   CodeNPlay - curriculum (runs right after the lesson files, before core.js)
   41 small topics -> 19 focused topics (6 HTML, 7 CSS, 6 JS).
   A topic that absorbs others keeps the FIRST id (old progress still counts),
   shows the lessons one after another and mixes their code questions + MCQs.
   ========================================================= */
(function () {
  'use strict';
  const C = window.COURSES; if (!C || window.__curriculum) return; window.__curriculum = true;
  const isUr = window.I18N && window.I18N.getLang() === 'ur';
  const byId = {}; C.forEach((c) => c.lessons.forEach((l) => { byId[l.id] = l; }));

  const PLAN = {
    html: [
      { id: 'html-1', title: isUr ? 'Text ki Buniyad: Headings, Bold aur Italic' : 'Text Basics: Headings, Bold and Italic', merge: ['html-2'] },
      { id: 'html-3', title: isUr ? 'Links aur Tasveerein' : 'Links and Images' },
      { id: 'html-4', title: isUr ? 'Lists (Fehrist)' : 'Lists' },
      { id: 'html-6', title: isUr ? 'Divs, Classes aur IDs' : 'Divs, Classes and IDs' },
      { id: 'html-5', title: isUr ? 'Buttons, Inputs aur Forms' : 'Buttons, Inputs and Forms', merge: ['html-7'] },
      { id: 'html-11', title: isUr ? 'Tables (Jadwal)' : 'Tables', merge: ['html-12'] },
    ],
    css: [
      { id: 'css-1', title: isUr ? 'Rang, Fonts aur Text' : 'Colors, Fonts and Text', merge: ['css-2'] },
      { id: 'css-3', title: isUr ? 'The Box Model' : 'The Box Model' },
      { id: 'css-4', title: isUr ? 'CSS mein Classes aur IDs' : 'Classes and IDs in CSS' },
      { id: 'css-5', title: isUr ? 'Flexbox Layout' : 'Flexbox Layout', merge: ['css-9', 'css-10'] },
      { id: 'css-6', title: isUr ? 'Gol Kinaray, Shadows aur Hover' : 'Rounded Corners, Shadows and Hover' },
      { id: 'css-13', title: isUr ? 'CSS Grid' : 'CSS Grid', merge: ['css-14'] },
      { id: 'css-17', title: isUr ? 'Position aur z-index' : 'Position and z-index' },
    ],
    js: [
      { id: 'js-1', title: isUr ? 'Output aur Variables' : 'Output and Variables', merge: ['js-2'] },
      { id: 'js-3', title: isUr ? 'Numbers aur Text' : 'Numbers and Text', merge: ['js-4'] },
      { id: 'js-5', title: isUr ? 'If aur Else' : 'If and Else', merge: [] },
      { id: 'js-6', title: isUr ? 'Loops' : 'Loops' },
      { id: 'js-7', title: isUr ? 'Functions aur Arrays' : 'Functions and Arrays', merge: ['js-8'] },
      { id: 'js-9', title: isUr ? 'Page Badalna (DOM)' : 'Changing the Page (DOM)', merge: ['js-10'] },
    ],
  };

  const COURSE_UR = {
    html: { name: 'Page Structure (Buniyad)', desc: 'Seekho har web page kaise banta hai: headings, text, links, tasveerein, lists, buttons aur sections.' },
    css: { name: 'Style aur Layout', desc: 'Apne page ko sundar aur responsive banao: colors, fonts, spacing, flexbox aur grid.' },
    js: { name: 'Logic aur Interaction', desc: 'Apne web page ko zinda karo: variables, conditions, loops, functions aur DOM interaction.' }
  };

  const UR_LESSONS = {
    'html-1': {
      intro: 'HTML har web page ka **dhancha (skeleton)** hai. Yeh browser ko batata hai k page par kya hai: heading, paragraph, button ya image.\n\nHTML ko **tags** se likha jata hai. Zyada tar tags joray mein aate hain: shuru ka tag jaise `<h1>` aur aakhir ka tag jaise `</h1>`. Beech ka text asal content hota hai.\n\n`<h1>` sab se bari heading hai. `<h2>` se `<h6>` choti headings hain. `<p>` aam text ka paragraph banata hai.\n\n**Part 2: Bold aur Italic Text**\n\nKisi lafz ko wazan dene ke liye `<strong>` tag use karo (bold banata hai). Aur italic karne ke liye `<em>` tag use karo.',
      task: 'Heading ko apne naam se badlo, phir `<p>` tag ke sath ek naya paragraph add karo.'
    },
    'html-3': {
      intro: 'Web ka asal matlab **links** hai jo pages ko aapas mein jortay hain. `<a>` (anchor) tag se link banta hai. Iska `href` attribute batata hai k link kahan le kar jaye ga.\n\nTasweer dikhane ke liye `<img>` tag use hota hai. Iska `src` attribute tasweer ka address rakhta hai, aur `alt` attribute batata hai k agar photo load na ho to kya text aye.',
      task: 'Ek link aur tasweer add karo.'
    },
    'html-4': {
      intro: 'Cheezon ki list banane ke do aasan tareeqay hain:\n\n1. `<ul>`: Bullet points wali list (unordered list).\n2. `<ol>`: Numbers wali list (ordered list).\n\nHar cheez ke liye `<li>` (list item) tag use hota hai jo `<ul>` ya `<ol>` ke andar likha jata hai.',
      task: 'Kam az kam 3 items wali ek list banao.'
    },
    'html-6': {
      intro: '`<div>` ek aam dabbe (box) ki tarah hai jo doosre elements ko ikatha karta hai taake un par CSS style lagaya ja sakay.\n\n`class` kisi bhi element ko pehchan deta hai aur yeh bohot se elements par lag sakti hai.\n\n`id` page par sirf **ek** element ke liye unique hoti hai.',
      task: 'Div ko ek class do aur andar kuch text likho.'
    },
    'html-5': {
      intro: 'Forms ke zariye user se data liya jata hai.\n\n`<button>` dabane wala button banata hai.\n\n`<input>` likhne ka dabba (text box) banata hai. Iska `placeholder` attribute dabba khaali hone par halka sa hint text dikhata hai.\n\n`<form>` tag in sab fields ko ek jagah bandhta hai taake submit kiya ja sakay.',
      task: 'Ek input field aur ek submit button banao.'
    },
    'html-11': {
      intro: 'Data ko rows aur columns mein dikhane ke liye `<table>` tag use hota hai.\n\n`<tr>`: Table ki row (line).\n`<th>`: Heading cell (bold aur center).\n`<td>`: Normal data cell.',
      task: '2 rows aur 2 columns ka ek table banao.'
    },
    'css-1': {
      intro: 'CSS se hum HTML ko khoobsurat banate hain.\n\n`color`: Text ka rang badalta hai.\n`background-color`: Peechay ka rang badalta hai.\n`font-size`: Text ka size set karta hai (jaise `20px`).\n`text-align`: Text ko center, left ya right karta hai.',
      task: 'Heading ka color blue aur font-size 24px set karo.'
    },
    'css-3': {
      intro: 'CSS mein har cheez ek dabba hai (Box Model). Is dabbe ke chaar hissay hain:\n\n1. **Content**: Asal text ya photo.\n2. **Padding**: Border ke andar ki khali jagah.\n3. **Border**: Dabbe ke ird gird ki lakeer.\n4. **Margin**: Dabbe ke bahar doosre elements se faasla.',
      task: 'Dabbe ko padding aur border do.'
    },
    'css-4': {
      intro: 'HTML elements ko select karne ke tareeqay:\n\nTag selector: `p { color: red; }` (saare p par asar hoga)\nClass selector: `.card { background: blue; }` (dot se shuru hota hai)\nID selector: `#hero { color: gold; }` (hash # se shuru hota hai).',
      task: 'Class `.box` par background color lagao.'
    },
    'css-5': {
      intro: 'Flexbox elements ko ek line mein sajane ka sab se aasan tareeqa hai.\n\nContainer par `display: flex;` lagao.\n`justify-content`: Main axis par items ko kahan rakhna hai (jaise `center`, `space-between`).\n`align-items`: Cross axis par items ko kahan rakhna hai (jaise `center`).',
      task: 'Elements ko flex container mein center karo.'
    },
    'css-6': {
      intro: '`border-radius`: Dabbe ke kinaray gol karta hai (jaise `12px` ya `50%` circle ke liye).\n`box-shadow`: Dabbe ke peechay saaya (shadow) banata hai.\n`:hover`: Jab mouse kisi cheez ke ooper aye to style badalne ke liye use hota hai.',
      task: 'Button ko border-radius aur hover effect do.'
    },
    'css-13': {
      intro: 'CSS Grid se 2D layout banta hai (rows aur columns dono ek saath).\n\n`display: grid;` lagao.\n`grid-template-columns: repeat(3, 1fr);` se 3 barabar columns bante hain.\n`gap`: Cells ke darmiyan faasla set karta hai.',
      task: '2 columns ka grid banao.'
    },
    'css-17': {
      intro: '`position: relative;`: Apni aam jagah ke hisab se thora hilti hai.\n`position: absolute;`: Parent ke andar makhsoos jagah par fix hoti hai (top, left se).\n`position: fixed;`: Screen par chipak jati hai chahe page scroll karo.\n`z-index`: Batata hai k konsi layer ooper hogi aur konsi neeche.',
      task: 'Element ko absolute position do.'
    },
    'js-1': {
      intro: 'JavaScript se hum page ko hoshyaar (interactive) banate hain.\n\n`console.log("Salam!");`: Console mein message print karta hai.\n`let score = 0;`: Variable banata hai jiski value baad mein badal sakti hai.\n`const name = "Ali";`: Constant banata hai jiski value badal nahi sakti.',
      task: 'Ek variable banao aur console mein print karo.'
    },
    'js-3': {
      intro: 'JavaScript mein hisaab kitaab:\n`+`, `-`, `*`, `/`, aur `%` (remainder).\n\nText (string) ko jorne ke liye plus `+` ya backticks use karte hain: `` `Score: ${score}` ``.\n\n`text.length`: Kitne letters hain batata hai.',
      task: 'Do numbers ko multiply karo aur print karo.'
    },
    'js-5': {
      intro: 'Code ko faisla karne ke liye `if` statement use hoti hai:\n\n`if (score >= 10) { ... } else { ... }`\n\nMuqabla karne wale operators: `===` (barabar), `!==` (barabar nahi), `>`, `<`, `>=`, `<=`.\n`else` tab chalta hai jab shart poori na ho.',
      task: 'Check karo agar number 5 se bara hai to message print karo.'
    },
    'js-6': {
      intro: 'Ek hi kaam baar baar karne ke liye loop use hota hai:\n\n`for (let i = 0; i < 5; i++) { console.log(i); }`\nYeh code 0 se lekar 4 tak 5 martaba chalay ga.\n`while` loop tab tak chalta hai jab tak condition true ho.',
      task: 'Ek for loop banao jo 3 martaba chalay.'
    },
    'js-7': {
      intro: '`function`: Code ka ek hissa jise baar baar pukara ja sake.\n`function add(a, b) { return a + b; }`\n\n`Array`: Bohat saari cheezon ki list jo square brackets `[ ]` mein likhi jati hai: `let fruits = ["Aam", "Kela", "Seb"];`.\n`push()` se aakhir mein item add hota hai.',
      task: 'Ek function banao jo do numbers ko add kare.'
    },
    'js-9': {
      intro: 'JavaScript se HTML page ko badla ja sakta hai (DOM):\n\n`document.getElementById("title")`: Element ko dhoondhta hai.\n`el.textContent = "Jeet gaye!";`: Text badalta hai.\n`el.addEventListener("click", () => { ... })`: Button dabane par code chalata hai.',
      task: 'Button click par heading ka text badlo.'
    }
  };

  // evenly spread picks: pick(5, 3) -> [0, 2, 4]
  const spread = (n, k) => k >= n ? Array.from({ length: n }, (_, i) => i) : Array.from({ length: k }, (_, i) => Math.round(i * (n - 1) / Math.max(1, k - 1)));

  function build(spec) {
    const a = byId[spec.id]; if (!a) return null;
    const parts = [a].concat((spec.merge || []).map((i) => byId[i]).filter(Boolean));
    const out = Object.assign({}, a, { title: spec.title, src: parts.map((p) => p.id) });
    const own = (p) => (p.tests || []).map((t) => Object.assign({}, t, { base: 'base' in t ? t.base : p.base, baseStyle: 'baseStyle' in t ? t.baseStyle : p.baseStyle }));
    if (parts.length === 1) {
      out.tests = own(a);
      if (isUr && UR_LESSONS[spec.id]) {
        out.intro = UR_LESSONS[spec.id].intro || out.intro;
        out.task = UR_LESSONS[spec.id].task || out.task;
      }
      return out;
    }
    if (isUr && UR_LESSONS[spec.id]) {
      out.intro = UR_LESSONS[spec.id].intro;
      out.task = UR_LESSONS[spec.id].task || out.task;
    } else {
      out.intro = parts.map((p, i) => (i ? '**Part ' + (i + 1) + ': ' + p.title + '**\n\n' : '') + p.intro).join('\n\n');
    }
    out.example = parts.map((p) => p.example).join('\n\n');
    const seen = {}; out.sugg = [].concat.apply([], parts.map((p) => p.sugg || [])).filter((s) => (seen[s.label] ? false : (seen[s.label] = 1)));
    const per = Math.ceil(6 / parts.length);
    out.tests = [].concat.apply([], parts.map((p) => { const t = own(p); return spread(t.length, per).map((i) => t[i]); })).slice(0, 6);
    return out;
  }

  C.forEach((c) => {
    if (isUr && COURSE_UR[c.id]) {
      c.name = COURSE_UR[c.id].name;
      c.desc = COURSE_UR[c.id].desc;
    }
    const plan = PLAN[c.id]; if (!plan) return;
    const built = plan.map(build).filter(Boolean);
    if (built.length) c.lessons = built;
  });
})();
