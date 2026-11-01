(function () {
  var root = document.documentElement;
  var THEMES = ['dark', 'cyan'];
  var ICONS  = { dark: '🌙', cyan: '🌊' };
  var NAMES  = { dark: 'Dark', cyan: 'Dark + Cyan' };
  var COLORS = { dark: '#0b0d1f', cyan: '#031014' };

  function applyTheme(t) {
    if (THEMES.indexOf(t) === -1) t = 'dark';      // purana 'light' bhi dark ban jayega
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

  document.addEventListener('click', function (e) {
    if (e.target.closest('#themeToggle') || e.target.closest('#tabTheme')) {
      var i = THEMES.indexOf(root.dataset.theme);
      applyTheme(THEMES[(i + 1) % THEMES.length]);
    }
  });
})();
