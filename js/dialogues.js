/* =========================================================
   CodeNPlay - story mode content (loaded by play.html and profile.html)
   - lesson[id]  : the talk before each topic fight (enemy <-> hero)
   - boss[level] : talk before and after each boss
   - relic[level]: the antique reward for beating a level boss
   Line format: [speaker, English, Roman Urdu]
   speaker: 'h' = your hero, 'f' = the first enemy of the fight, 'f2' = the second boss
   ========================================================= */
(function () {
  'use strict';
  const isUr = window.I18N && window.I18N.getLang() === 'ur';

  const lesson = {
    // ---------------- LEVEL 1: HTML ----------------
    'html-1': [
      ['f', 'Halt! This jungle only answers to proper headings. Show me an <h1> or turn back.', 'Ruko! Yeh jungle sirf theek headings ki baat sunta hai. Mujhe <h1> dikhao warna wapas jao.'],
      ['h', 'Easy. A heading starts with <h1> and always ends with </h1>.', 'Aasan hai. Heading <h1> se shuru hoti hai aur hamesha </h1> par khatam hoti hai.'],
      ['f', 'Then make my words strong and slanted. Bold AND italic. Do you even know the tags?', 'Phir meray alfaaz ko mota aur tirchha karo. Bold bhi, italic bhi. Tags aate bhi hain?'],
      ['h', '<strong> for bold, <em> for italic. Watch me.', 'Bold ke liye <strong>, italic ke liye <em>. Dekho.'],
      ['f', 'Every wrong answer costs you a heart, little coder. Let us see your code!', 'Har ghalat jawab par ek dil jayega, chhotay coder. Dekhte hain tumhara code!']
    ],
    'html-3': [
      ['f', 'The river path is broken. No link leads out of this jungle, and you cannot show me a single picture.', 'Darya ka rasta toota hua hai. Is jungle se koi link bahar nahi jata, aur tum aik tasweer bhi nahi dikha sakte.'],
      ['h', 'The web is made of links. I will use the <a> tag, and its href tells the browser where to go.', 'Web links se bana hai. Main <a> tag use karunga, aur uska href browser ko batata hai kahan jana hai.'],
      ['f', 'And a picture? Pictures need magic!', 'Aur tasweer? Tasweer ke liye jaadu chahiye!'],
      ['h', 'No magic. <img src="..." alt="..."> and the picture appears. The alt text even helps people who cannot see it.', 'Jaadu nahi. <img src="..." alt="..."> likho aur tasweer aa jati hai. Alt text unki bhi madad karta hai jo dekh nahi sakte.'],
      ['f', 'Hmph. Prove it. Fight me!', 'Hunh. Sabit karo. Mujh se lado!']
    ],
    'html-4': [
      ['f', 'My army marches in a mess! No order, no list, nothing. You cannot tidy them up.', 'Meri fauj bey-tarteeb chal rahi hai! Na order, na list. Tum inhein theek nahi kar sakte.'],
      ['h', 'Then I will make a list. <ul> gives bullet points and <ol> gives numbers.', 'Phir main list banata hoon. <ul> se bullets aate hain aur <ol> se numbers.'],
      ['f', 'And what goes inside, clever one?', 'Aur andar kya jata hai, hoshiyar?'],
      ['h', 'Every item sits inside its own <li>. One tag for the list, one tag for each item.', 'Har cheez apne <li> mein hoti hai. List ke liye aik tag, har item ke liye aik tag.'],
      ['f', 'Then line up your answers and face my soldiers!', 'Phir apne jawab saf mein lagao aur meray sipahiyon ka saamna karo!']
    ],
    'html-6': [
      ['f', 'Every wall of this jungle is a box, and you cannot tell my boxes apart. Which is which?', 'Is jungle ki har deewar aik dabba hai, aur tum meray dabbay alag nahi kar sakte. Kaun sa kaun sa hai?'],
      ['h', 'A <div> is a plain box that groups things together. I will give each one a name.', '<div> aik saada dabba hai jo cheezon ko aik jagah jama karta hai. Main har aik ko naam doon ga.'],
      ['f', 'A name? How?', 'Naam? Kaise?'],
      ['h', 'A class can be shared by many boxes, but an id is unique to one. Class is a uniform, id is a fingerprint.', 'Class bohat se dabbon mein share ho sakti hai, lekin id sirf aik ki hoti hai. Class wardi hai, id ungli ka nishan.'],
      ['f', 'Fine words. Now show me with real code!', 'Achhi baatein. Ab asli code se dikhao!']
    ],
    'html-5': [
      ['f', 'The jungle gate has a lock, and it listens only to someone who can build a proper form. A button that does nothing? Useless!', 'Jungle ke darwazay par taala hai, aur woh sirf usi ki sunta hai jo theek form bana sake. Aisa button jo kuch na kare? Bekaar!'],
      ['h', '<button> makes something to click, and <input> lets people type.', '<button> click karne ke liye cheez banata hai, aur <input> se log likh sakte hain.'],
      ['f', 'And how will anyone know what to type?', 'Aur kisi ko kaise pata chalega ke kya likhna hai?'],
      ['h', 'I add a <label>, a placeholder, and wrap everything inside a <form>. Clear and friendly.', 'Main <label>, placeholder lagata hoon aur sab kuch <form> mein rakhta hoon. Saaf aur dosti wala.'],
      ['f', 'Then open the gate if you can. Here I come!', 'Phir darwaza kholo agar kar sakte ho. Main aa raha hoon!']
    ],
    'html-11': [
      ['f', 'Numbers, names, scores... my treasure list is a pile of scattered words. You will never make a table out of this.', 'Numbers, naam, scores... meri khazane ki list bikhray alfaaz ka dhair hai. Tum is se table nahi bana sakte.'],
      ['h', 'A <table> holds it all. Each <tr> is a row, and inside a row every cell is a <td>.', '<table> sab sambhal leta hai. Har <tr> aik row hai aur row ke andar har cell <td> hai.'],
      ['f', 'What about the titles at the top?', 'Aur upar ke titles ka kya?'],
      ['h', 'Those use <th> for heading cells. Rows and columns, everything in its place.', 'Unke liye <th> hota hai. Rows aur columns, har cheez apni jagah.'],
      ['f', 'Hah! Keep your cells tidy, because I never will. Fight!', 'Hah! Apne cells saaf rakhna, kyun ke main to nahi rakhunga. Lado!']
    ],

    // ---------------- LEVEL 2: CSS ----------------
    'css-1': [
      ['f', 'Look around, coder. The swamp is grey. No colour, no style, no soul. And you are going to leave it that way.', 'Dekho coder. Swamp bilkul grey hai. Na rang, na style, na jaan. Aur tum ise aisa hi chhor doge.'],
      ['h', 'Not a chance. CSS is paint for the web. I write a selector and then rules like color and font-size.', 'Bilkul nahi. CSS web ka rang hai. Main selector likhta hoon phir color aur font-size jaise rules.'],
      ['f', 'Rules? What rules?', 'Rules? Kaun se rules?'],
      ['h', 'Like this: p { color: teal; }. The property, a colon, the value, and a semicolon at the end.', 'Aise: p { color: teal; }. Property, colon, value aur aakhir mein semicolon.'],
      ['f', 'Pretty words. Let us see if your paint can hurt me!', 'Khoobsurat baatein. Dekhte hain tumhara rang mujhe takleef de sakta hai ya nahi!']
    ],
    'css-3': [
      ['f', 'Everything in this swamp is a box, and my boxes are too crowded. You cannot give them room to breathe.', 'Is swamp ki har cheez aik dabba hai, aur meray dabbay tang hain. Tum inhein saans lene ki jagah nahi de sakte.'],
      ['h', 'The box model: content in the middle, then padding inside, a border around it, and margin outside.', 'Box model: beech mein content, phir andar padding, uske gird border, aur bahar margin.'],
      ['f', 'Padding, margin... they are the same thing!', 'Padding, margin... yeh to aik hi cheez hain!'],
      ['h', 'Wrong. Padding is the space inside the border. Margin is the space outside, pushing other boxes away.', 'Ghalat. Padding border ke andar ki jagah hai. Margin bahar ki jagah hai jo dosray dabbay door karti hai.'],
      ['f', 'Then measure it all correctly or be crushed!', 'Phir sab kuch theek naapo warna kuchle jaoge!']
    ],
    'css-4': [
      ['f', 'If you style one thing, you style everything! You cannot paint just one of my creatures.', 'Agar tum aik cheez ko style karo to sab ko hoti hai! Tum meri aik makhlooq ko alag rang nahi de sakte.'],
      ['h', 'A class selector starts with a dot: .card { ... } and works on every element with that class.', 'Class selector dot se shuru hota hai: .card { ... } aur us class wali har cheez par chalta hai.'],
      ['f', 'And if I want only ONE of them?', 'Aur agar mujhe sirf AIK chahiye?'],
      ['h', 'Then I use an id with a hash: #boss { ... }. One name, one element.', 'Phir main hash wali id use karta hoon: #boss { ... }. Aik naam, aik element.'],
      ['f', 'Choose your selectors wisely. Here I come!', 'Apne selectors soch kar chuno. Main aa raha hoon!']
    ],
    'css-5': [
      ['f', 'My bridge of boxes is a tangled mess. They stack up and fall into the water. You cannot line them up!', 'Meray dabbon ka pul uljha hua hai. Woh ek ke oopar gir kar paani mein ja rahe hain. Tum inhein seedha nahi kar sakte!'],
      ['h', 'One line fixes it: display: flex on the parent. Now they sit in a row.', 'Aik line sab theek kar deti hai: parent par display: flex. Ab woh aik row mein baith jate hain.'],
      ['f', 'In a row... but how do you centre them? Space them out?', 'Row mein... lekin unhein beech mein kaise laoge? Faasla kaise doge?'],
      ['h', 'justify-content for the main direction, align-items for the other one, and gap for the space between.', 'Main direction ke liye justify-content, doosri ke liye align-items, aur beech ke faasle ke liye gap.'],
      ['f', 'Then keep everything in line while I hit you!', 'Phir sab kuch seedha rakho jab main tumhein maroon!']
    ],
    'css-6': [
      ['f', 'Sharp corners, flat boxes, dead buttons. This is the swamp and nothing here is soft or alive!', 'Tez kinaray, sapat dabbay, murda buttons. Yeh swamp hai aur yahan kuch naram ya zinda nahi!'],
      ['h', 'border-radius rounds the corners, box-shadow lifts a box off the page, and :hover wakes a button when the mouse touches it.', 'border-radius kinaray gol karta hai, box-shadow dabbay ko page se oopar uthata hai, aur :hover button ko jagata hai jab mouse lagta hai.'],
      ['f', 'Tricks! Cheap tricks!', 'Chaalein! Sasti chaalein!'],
      ['h', 'Tricks that make a page feel alive. Try me.', 'Aisi chaalein jo page ko zinda mehsoos karwati hain. Aazmao.'],
      ['f', 'Then soften my attacks if you can!', 'Phir meray hamlay naram karke dikhao!']
    ],
    'css-13': [
      ['f', 'Rows and columns! Rows and columns! My grid of traps is perfect and you cannot copy it.', 'Rows aur columns! Rows aur columns! Meri jaalon ka grid bilkul theek hai aur tum ise copy nahi kar sakte.'],
      ['h', 'display: grid and I decide the columns myself with grid-template-columns.', 'display: grid aur main khud columns tay karta hoon grid-template-columns se.'],
      ['f', 'Fixed columns are boring.', 'Fixed columns boring hote hain.'],
      ['h', 'So I use fr units and repeat(): repeat(3, 1fr) gives three equal columns that fit any screen.', 'To main fr units aur repeat() use karta hoon: repeat(3, 1fr) har screen par barabar teen columns deta hai.'],
      ['f', 'We shall see how well your layout holds!', 'Dekhte hain tumhara layout kitna mazboot hai!']
    ],
    'css-17': [
      ['f', 'Everything has its place and I move it where I want. You cannot hold my things still, and you cannot put one above another.', 'Har cheez ki apni jagah hai aur main use jahan chahun hata sakta hoon. Tum meri cheezein rok nahi sakte, aur aik ko doosre ke oopar nahi la sakte.'],
      ['h', 'position: relative on the parent, position: absolute on the child, and the child goes exactly where I say.', 'Parent par position: relative, bachay par position: absolute, aur bacha bilkul wahan jata hai jahan main kahun.'],
      ['f', 'And if two things overlap?', 'Aur agar do cheezein aapas mein ghus jayein?'],
      ['h', 'z-index decides who is on top. The bigger number wins the front.', 'z-index tay karta hai kaun oopar hai. Bara number aagay aata hai.'],
      ['f', 'Then stand your ground, because I strike from above!', 'Phir apni jagah par raho, kyun ke main oopar se hamla karta hoon!']
    ],

    // ---------------- LEVEL 3: JavaScript ----------------
    'js-1': [
      ['f', 'Ashfall Gorge is silent and so are you. A page that cannot speak or remember a single thing.', 'Ashfall Gorge khamosh hai aur tum bhi. Aisa page jo bol nahi sakta aur aik cheez yaad nahi rakh sakta.'],
      ['h', 'console.log() makes it speak, and variables help it remember: let name = "Rafay";', 'console.log() ise bolna sikhata hai, aur variables yaad rakhne mein madad karte hain: let name = "Rafay";'],
      ['f', 'A variable? What is that?', 'Variable? Woh kya hota hai?'],
      ['h', 'A named box that holds a value. I can change what is inside it any time.', 'Naam wala dabba jis mein value hoti hai. Main andar ki cheez jab chahun badal sakta hoon.'],
      ['f', 'Then speak, little one, and I will see if your words are strong!', 'Phir bolo chhotay, aur main dekhta hoon tumhare alfaaz mein dum hai ya nahi!']
    ],
    'js-3': [
      ['f', 'Numbers and text are different things and you will mix them up. Add them together and the machines will melt.', 'Numbers aur text alag cheezein hain aur tum inhein mila doge. Jama karoge to machines pighal jayengi.'],
      ['h', 'Numbers can be added, subtracted and multiplied. Text goes inside quotes, and + joins two pieces of text.', 'Numbers jama, tafreeq aur zarb ho sakte hain. Text quotes mein jata hai, aur + do text ke tukray jorta hai.'],
      ['f', 'So 5 + 5 is 10, but "5" + "5" is...?', 'To 5 + 5 hai 10, lekin "5" + "5" kya hoga...?'],
      ['h', '"55". Quotes turn numbers into text, and text joins instead of adding.', '"55". Quotes numbers ko text bana dete hain, aur text jama hone ke bajaye jurta hai.'],
      ['f', 'Hmm... you know more than you look like. Fight!', 'Hmm... tum jitna lagte ho us se zyada jaante ho. Lado!']
    ],
    'js-5': [
      ['f', 'Every path forks here and a wrong turn ends in fire. You cannot choose, you only guess.', 'Yahan har rasta do hissay mein bat jata hai aur ghalat mor aag mein khatam hota hai. Tum chun nahi sakte, sirf andaza lagate ho.'],
      ['h', 'I do not guess. if (condition) { ... } else { ... }. The code checks the condition and picks a side.', 'Main andaza nahi lagata. if (condition) { ... } else { ... }. Code condition check karta hai aur aik taraf chunta hai.'],
      ['f', 'Conditions? Like what?', 'Conditions? Jaise kya?'],
      ['h', 'age >= 18, score === 100, name !== "". True runs the if part, false runs the else part.', 'age >= 18, score === 100, name !== "". True ho to if wala hissa chalta hai, false ho to else wala.'],
      ['f', 'Then decide fast, because the fire is behind you!', 'Phir jaldi faisla karo, kyun ke aag tumhare peechay hai!']
    ],
    'js-6': [
      ['f', 'The same trap, again and again and again. You will do the same chore a thousand times until you drop.', 'Wahi jaal, baar baar baar. Tum aik hi kaam hazaar baar karoge jab tak gir na jao.'],
      ['h', 'Not with a loop. for (let i = 0; i < 5; i++) { ... } repeats the code five times, and I only write it once.', 'Loop ke saath nahi. for (let i = 0; i < 5; i++) { ... } code ko paanch baar chalata hai, aur main use sirf aik baar likhta hoon.'],
      ['f', 'And when does it stop?', 'Aur yeh rukta kab hai?'],
      ['h', 'When the condition becomes false. Be careful: a loop that never stops will freeze the page.', 'Jab condition false ho jaye. Ehtiyat: jo loop kabhi na ruke woh page ko freeze kar deta hai.'],
      ['f', 'Then go round and round until you are dizzy. Fight!', 'Phir ghoomte raho jab tak chakkar na aa jayein. Lado!']
    ],
    'js-7': [
      ['f', 'My machines only obey a function. And one list of orders is nothing if you keep losing the items.', 'Meri machines sirf function ka hukum maanti hain. Aur aik list bhi kuch nahi agar tum items kho do.'],
      ['h', 'A function is a recipe I write once and use many times: function greet(name) { ... }. Then I call it by name.', 'Function aik recipe hai jo main aik baar likhta hoon aur kai baar chalata hoon: function greet(name) { ... }. Phir naam se bulata hoon.'],
      ['f', 'And a list of things?', 'Aur cheezon ki list?'],
      ['h', 'An array: let fruits = ["apple", "mango"]; and fruits[0] is "apple". Counting starts at zero.', 'Array: let fruits = ["apple", "mango"]; aur fruits[0] hai "apple". Ginti zero se shuru hoti hai.'],
      ['f', 'Call your functions and fill your arrays, because I am coming!', 'Apne functions bulao aur arrays bharo, kyun ke main aa raha hoon!']
    ],
    'js-9': [
      ['f', 'The final gate. A page that just sits there like a stone. You cannot make it react to anything.', 'Aakhri darwaza. Aisa page jo pathar ki tarah pada hai. Tum use kisi cheez par react nahi karwa sakte.'],
      ['h', 'The DOM is the page as JavaScript sees it. document.querySelector() finds an element, and I can change its text or its style.', 'DOM woh page hai jo JavaScript ko nazar aata hai. document.querySelector() aik element dhoondta hai, aur main uska text ya style badal sakta hoon.'],
      ['f', 'And if a person clicks?', 'Aur agar koi click kare?'],
      ['h', 'addEventListener("click", ...) waits for the click and runs my function. Then the page answers back.', 'addEventListener("click", ...) click ka intezaar karta hai aur meri function chalata hai. Phir page jawab deta hai.'],
      ['f', 'Make the page alive, then, before I turn it to ash!', 'Phir page ko zinda karo, us se pehle ke main ise raakh kar doon!']
    ]
  };

  const boss = {
    html: {
      intro: [
        ['f', 'You have come far, little coder. I am Titan, Guardian of the Tags, and every tag in this jungle belongs to me.', 'Tum door tak aa gaye, chhotay coder. Main Titan hoon, Tags ka Nigheban, aur is jungle ka har tag meri milkiyat hai.'],
        ['h', 'Then I will take them back. Headings, links, lists, forms and tables. I have learned all of them.', 'To main inhein wapas le lunga. Headings, links, lists, forms aur tables. Main ne sab seekh liye hain.'],
        ['f', 'Learned? A page is more than a pile of tags. It needs structure, and the structure starts with <html>.', 'Seekh liye? Page sirf tags ka dhair nahi hota. Usay dhancha chahiye, aur dhancha <html> se shuru hota hai.'],
        ['h', 'Yes: <head> holds the title, <body> holds what people see, and every tag that opens must close.', 'Haan: <head> mein title hota hai, <body> mein woh jo log dekhte hain, aur jo tag khulta hai woh band bhi hota hai.'],
        ['f', 'Hmph. Then answer my questions about every topic you have passed, or my tags will bury you!', 'Hunh. Phir mere har us topic ke sawalon ka jawab do jo tum ne guzra hai, warna meray tags tumhein dafn kar denge!'],
        ['h', 'Bring them. I am not afraid of a few angle brackets.', 'Le aao. Mujhe chand angle brackets se dar nahi lagta.']
      ],
      outro: [
        ['f', 'Impossible... a tiny coder who knows every tag...', 'Na-mumkin... aik chhota coder jise har tag aata hai...'],
        ['h', 'You guarded them well, Titan. But tags belong to the people who learn them.', 'Tum ne unki hifazat achhi ki, Titan. Lekin tags unke hain jo unhein seekhte hain.'],
        ['f', 'Take this, then. The Scroll of Ancient Tags. It was written by the first builders of the web.', 'Phir yeh lo. Qadeem Tags ka Scroll. Yeh web ke pehlay bananay walon ne likha tha.'],
        ['h', 'I will keep it safe. The swamp is next, and it needs colour.', 'Main ise mehfooz rakhunga. Aagay swamp hai, aur usay rang chahiye.']
      ]
    },
    css: {
      intro: [
        ['f', 'The swamp is mine. I am Vorathrax, and I drained every colour from this place long ago.', 'Swamp meri hai. Main Vorathrax hoon, aur main ne bohat pehle yahan ke saray rang choos liye.'],
        ['h', 'Then I will paint it back. Colours, fonts, spacing, flexbox, grid. I know them all.', 'To main ise dobara rang doon ga. Colours, fonts, spacing, flexbox, grid. Mujhe sab aate hain.'],
        ['f', 'Paint? A boring page with a nice colour is still a boring page. Can you build a LAYOUT?', 'Rang? Achhe rang wala boring page phir bhi boring hai. Kya tum LAYOUT bana sakte ho?'],
        ['h', 'Flexbox for rows, grid for rooms, position for the special pieces. Every box with its own padding, border and margin.', 'Rows ke liye flexbox, kamron ke liye grid, khaas cheezon ke liye position. Har dabba apni padding, border aur margin ke saath.'],
        ['f', 'Words are cheap. My flames will melt your selectors!', 'Alfaaz sasti cheez hain. Meri aag tumhare selectors pighla degi!'],
        ['h', 'Then I will use better ones. Class, id, hover... I am ready.', 'To main behtar selectors use karunga. Class, id, hover... main tayyar hoon.']
      ],
      outro: [
        ['f', 'My colours... they are coming back... how can a few lines of CSS do this?', 'Meray rang... wapas aa rahe hain... CSS ki chand lines yeh kaise kar sakti hain?'],
        ['h', 'Because CSS is the paint of the web, and a good painter never runs out of colour.', 'Kyun ke CSS web ka rang hai, aur achha painter kabhi rang se khali nahi hota.'],
        ['f', 'Then take the Painter\'s Antique Palette. It once painted the first beautiful page.', 'Phir Painter ka Qadeem Palette le jao. Is ne kabhi pehla khoobsurat page rangga tha.'],
        ['h', 'Thank you. Ashfall Gorge is ahead, and it needs a brain.', 'Shukriya. Aagay Ashfall Gorge hai, aur usay dimagh chahiye.']
      ]
    },
    js: {
      intro: [
        ['f', 'You walk into Ashfall Gorge with colours and tags. But a page without logic is a statue. I am Vorathrax and I turn statues to ash.', 'Tum Ashfall Gorge mein rang aur tags le kar aaye ho. Lekin logic ke baghair page aik mujassama hai. Main Vorathrax hoon aur main mujassamon ko raakh karta hoon.'],
        ['h', 'Then I will give it logic. Variables, if and else, loops, functions, arrays. I have learned them all.', 'To main ise logic doon ga. Variables, if aur else, loops, functions, arrays. Main ne sab seekh liye.'],
        ['f2', 'Do not waste your breath on him. I am Nyxorion, the final guardian. When he falls, I rise.', 'Us par apna saans zaya mat karo. Main Nyxorion hoon, aakhri nigheban. Jab woh girega, main uthunga.'],
        ['h', 'Two guardians? Then I will use two times the code.', 'Do nigheban? To main do guna code use karunga.'],
        ['f2', 'Code that reacts to a click, changes the page, answers a person. Can you do that, little one?', 'Aisa code jo click par react kare, page badle, kisi insaan ko jawab de. Kya tum yeh kar sakte ho, chhotay?'],
        ['h', 'The DOM is mine. I will wake this whole gorge, one line at a time. Come!', 'DOM meri hai. Main yeh poori gorge jagaunga, aik line ek waqt mein. Aao!']
      ],
      outro: [
        ['f2', 'The void... it is fading... a web page that thinks for itself...', 'Void... ghayab ho raha hai... aisa web page jo khud sochta hai...'],
        ['h', 'HTML is the skeleton, CSS is the skin, and JavaScript is the brain. Now the page is alive.', 'HTML dhancha hai, CSS jild hai, aur JavaScript dimagh hai. Ab page zinda hai.'],
        ['f2', 'Then take the last gift of the old world: the Antique Gear of Logic. It started the first machine that thought.', 'Phir purani duniya ka aakhri tohfa lo: Logic ka Qadeem Gear. Isi ne woh pehli machine chalai jo sochti thi.'],
        ['h', 'I will carry it with pride. Every great site is built from these three. And now so can I.', 'Main ise fakhar se rakhunga. Har bari website inhi teen se bani hai. Aur ab main bhi bana sakta hoon.']
      ]
    }
  };

  /* ---------- antique relics: drawn in SVG (parchment, brass, gears) ---------- */
  function cog(cx, cy, rOut, rIn, teeth) {
    let d = '';
    for (let i = 0; i < teeth * 4; i++) {
      const a = (i / (teeth * 4)) * Math.PI * 2 - Math.PI / 2, up = (i % 4 === 1 || i % 4 === 2);
      const r = up ? rOut : rIn; d += (i ? 'L' : 'M') + (cx + Math.cos(a) * r).toFixed(1) + ' ' + (cy + Math.sin(a) * r).toFixed(1);
    }
    return d + 'Z';
  }
  const svg = {
    html: '<svg viewBox="0 0 160 160" role="img" aria-label="Scroll of Ancient Tags"><defs><linearGradient id="rp" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b98a4a"/><stop offset=".12" stop-color="#f1deac"/><stop offset=".88" stop-color="#f1deac"/><stop offset="1" stop-color="#b98a4a"/></linearGradient><linearGradient id="rr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9c777"/><stop offset=".5" stop-color="#9c6a2b"/><stop offset="1" stop-color="#5e3a14"/></linearGradient><radialGradient id="rw" cx=".4" cy=".35"><stop offset="0" stop-color="#e8564c"/><stop offset="1" stop-color="#8d1c1c"/></radialGradient></defs>' +
      '<rect x="30" y="26" width="100" height="110" fill="url(#rp)" stroke="#6b4720" stroke-width="2"/>' +
      '<rect x="22" y="16" width="116" height="16" rx="8" fill="url(#rr)" stroke="#4a2c0c" stroke-width="2"/><rect x="22" y="130" width="116" height="16" rx="8" fill="url(#rr)" stroke="#4a2c0c" stroke-width="2"/>' +
      '<circle cx="22" cy="24" r="8" fill="#e9c777" stroke="#4a2c0c" stroke-width="2"/><circle cx="138" cy="24" r="8" fill="#e9c777" stroke="#4a2c0c" stroke-width="2"/><circle cx="22" cy="138" r="8" fill="#e9c777" stroke="#4a2c0c" stroke-width="2"/><circle cx="138" cy="138" r="8" fill="#e9c777" stroke="#4a2c0c" stroke-width="2"/>' +
      '<g font-family="Courier New, monospace" font-weight="700" font-size="11" fill="#4a2c0c"><text x="42" y="50">&lt;html&gt;</text><text x="52" y="66">&lt;head&gt;</text><text x="52" y="82">&lt;body&gt;</text><text x="62" y="98">&lt;h1&gt;</text><text x="42" y="114">&lt;/html&gt;</text></g>' +
      '<path d="M36 40h88M36 122h88" stroke="#a77a3b" stroke-width="1" stroke-dasharray="3 3" fill="none"/>' +
      '<circle cx="112" cy="104" r="15" fill="url(#rw)" stroke="#5c0f0f" stroke-width="2"/><text x="112" y="109" text-anchor="middle" font-family="Courier New, monospace" font-weight="700" font-size="13" fill="#ffd9a0">&lt;/&gt;</text></svg>',
    css: '<svg viewBox="0 0 160 160" role="img" aria-label="Painter\'s Antique Palette"><defs><linearGradient id="pw" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d7a35c"/><stop offset=".55" stop-color="#9a6528"/><stop offset="1" stop-color="#5e3a14"/></linearGradient><linearGradient id="pb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3d68a"/><stop offset="1" stop-color="#9c6a2b"/></linearGradient></defs>' +
      '<path d="M80 18C40 18 14 46 14 82c0 34 26 60 62 60 14 0 20-8 16-18-4-9 2-18 14-18h14c20 0 36-12 36-32C156 44 124 18 80 18Z" fill="url(#pw)" stroke="#4a2c0c" stroke-width="3"/>' +
      '<path d="M80 26C46 26 22 50 22 82" fill="none" stroke="#f0cf8e" stroke-width="2" opacity=".5"/>' +
      '<circle cx="46" cy="64" r="9" fill="#e5484d" stroke="#3a1f08" stroke-width="2"/><circle cx="70" cy="45" r="9" fill="#f5b83d" stroke="#3a1f08" stroke-width="2"/><circle cx="98" cy="42" r="9" fill="#58c26b" stroke="#3a1f08" stroke-width="2"/><circle cx="122" cy="58" r="9" fill="#3b8bf5" stroke="#3a1f08" stroke-width="2"/><circle cx="42" cy="92" r="9" fill="#a05be0" stroke="#3a1f08" stroke-width="2"/><ellipse cx="92" cy="96" rx="12" ry="9" fill="#2a1a0a" stroke="#3a1f08" stroke-width="2"/>' +
      '<g transform="rotate(32 100 110)"><rect x="52" y="104" width="94" height="8" rx="4" fill="url(#pb)" stroke="#4a2c0c" stroke-width="2"/><rect x="26" y="102" width="30" height="12" rx="4" fill="#cfd6e3" stroke="#4a2c0c" stroke-width="2"/><path d="M26 102c-12 0-16 10-14 18 8-2 14-4 14-6Z" fill="#e5484d" stroke="#4a2c0c" stroke-width="2"/></g>' +
      '<text x="80" y="136" text-anchor="middle" font-family="Courier New, monospace" font-weight="700" font-size="11" fill="#f3d68a">{ color }</text></svg>',
    js: '<svg viewBox="0 0 160 160" role="img" aria-label="Antique Gear of Logic"><defs><linearGradient id="gb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f7dc8d"/><stop offset=".5" stop-color="#c58d2f"/><stop offset="1" stop-color="#6e4513"/></linearGradient><radialGradient id="gj" cx=".35" cy=".3"><stop offset="0" stop-color="#9ff0ff"/><stop offset="1" stop-color="#0f6b8f"/></radialGradient></defs>' +
      '<path d="' + cog(70, 74, 62, 50, 12) + '" fill="url(#gb)" stroke="#4a2c0c" stroke-width="3" stroke-linejoin="round"/>' +
      '<circle cx="70" cy="74" r="40" fill="none" stroke="#4a2c0c" stroke-width="3"/><circle cx="70" cy="74" r="34" fill="#7c4f17" opacity=".35"/>' +
      '<path d="M70 38v72M34 74h72M45 49l50 50M95 49L45 99" stroke="#4a2c0c" stroke-width="3" opacity=".55"/>' +
      '<path d="' + cog(124, 118, 28, 21, 8) + '" fill="url(#gb)" stroke="#4a2c0c" stroke-width="3" stroke-linejoin="round"/><circle cx="124" cy="118" r="9" fill="#2a1a0a" stroke="#4a2c0c" stroke-width="2"/>' +
      '<circle cx="70" cy="74" r="17" fill="url(#gj)" stroke="#4a2c0c" stroke-width="3"/><text x="70" y="79" text-anchor="middle" font-family="Courier New, monospace" font-weight="700" font-size="13" fill="#04202c">{ }</text></svg>'
  };
  const relic = {
    html: { id: 'html', name: isUr ? 'Qadeem Tags ka Scroll' : 'Scroll of Ancient Tags', from: 'Titan', art: svg.html,
      text: isUr ? 'Purani parchment par moom ki mohar. Web ka har page isi mein likhe tags se shuru hota hai: html, head, body.' : 'An old parchment sealed with wax. Every web page ever built starts with the tags written on it: html, head and body.' },
    css: { id: 'css', name: isUr ? 'Painter ka Qadeem Palette' : 'Painter\'s Antique Palette', from: 'Vorathrax', art: svg.css,
      text: isUr ? 'Pital ke rang-donon wala purana palette. Isi se web ka pehla khoobsurat page rangga gaya tha: color, font aur layout.' : 'A brass-and-wood palette with five colour wells. It painted the first beautiful web page: colour, fonts and layout.' },
    js: { id: 'js', name: isUr ? 'Logic ka Qadeem Gear' : 'Antique Gear of Logic', from: 'Nyxorion', art: svg.js,
      text: isUr ? 'Pital ka clockwork gear jis ke beech mein neeli jewel hai. Isi ne web page ko sochna aur jawab dena sikhaya.' : 'A brass clockwork gear with a blue jewel in the middle. It taught the web page to think and to answer back.' }
  };

  window.STORY = { lesson, boss, relic, isUr };
})();
