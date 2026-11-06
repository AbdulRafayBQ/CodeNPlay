(function () {
  var root = document.documentElement;
  var THEMES = ['dark', 'cyan'];
  var ICONS  = { dark: '🌙', cyan: '🌊' };
  var NAMES  = { dark: 'Dark', cyan: 'Dark + Cyan' };
  var COLORS = { dark: '#0b0d1f', cyan: '#031014' };

  function applyTheme(t) {
    if (THEMES.indexOf(t) === -1) t = 'dark';
    root.dataset.theme = t;
    try { localStorage.setItem('theme', t); } catch (e) {}
    var btn = document.getElementById('themeToggle');
    if (btn) { btn.textContent = ICONS[t]; btn.title = 'Theme: ' + NAMES[t]; }
    var mobile = document.getElementById('tabTheme');
    if (mobile) { var emo=mobile.querySelector('.emo'), label=mobile.querySelector('span:last-child'); if(emo) emo.textContent=ICONS[t]; if(label) label.textContent=NAMES[t]; }
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', COLORS[t]);
  }

  var saved = 'dark';
  try { saved = localStorage.getItem('theme') || 'dark'; } catch (e) {}
  applyTheme(saved);

  // --- language toggle ---
  function applyLangLabel() {
    var lang = window.I18N ? window.I18N.getLang() : 'en';
    var label = lang === 'en' ? 'اردو' : 'EN';
    var btn = document.getElementById('langToggle');
    if (btn) { btn.textContent = '🌐 ' + label; btn.title = lang === 'en' ? 'Switch to Roman Urdu' : 'Switch to English'; }
    var mob = document.getElementById('tabLang');
    if (mob) { var sp = mob.querySelector('span:last-child'); if (sp) sp.textContent = label; }
  }
  applyLangLabel();

  // translate static data-t elements and document title on load
  function translatePage() {
    if (!window.I18N) return;
    var lang = window.I18N.getLang();
    document.documentElement.lang = lang === 'ur' ? 'ur' : 'en';

    document.querySelectorAll('[data-t]').forEach(function (el) {
      var key = el.getAttribute('data-t');
      var val = window.I18N.t(key);
      if (val && val !== key) el.textContent = val;
    });

    if (lang === 'ur') {
      var area = document.body ? document.body.dataset.area : '';
      if (document.body && document.body.classList.contains('playpage')) {
        document.title = 'Larai - CodeNPlay';
      } else if (area === 'home') {
        document.title = 'CodeNPlay Academy - Pehle basics seekho, phir code par qabu karo';
      } else if (area === 'learn') {
        document.title = 'Courses - CodeNPlay';
      } else if (area === 'profile') {
        document.title = 'Aapka Profile - CodeNPlay';
      } else if (area === 'auth') {
        document.title = 'Log in ya player banao - CodeNPlay';
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', translatePage);
  } else {
    translatePage();
  }

  document.addEventListener('click', function (e) {
    if (e.target.closest('#themeToggle') || e.target.closest('#tabTheme')) {
      var i = THEMES.indexOf(root.dataset.theme);
      applyTheme(THEMES[(i + 1) % THEMES.length]);
    }
    if (e.target.closest('#langToggle') || e.target.closest('#tabLang')) {
      if (window.I18N) window.I18N.toggleLang();
    }
  });
})();
