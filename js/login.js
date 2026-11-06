/* =========================================================
   CodeNPlay - login / create account (login.html)
   ========================================================= */
(function () {
  'use strict';
  const t = window.I18N.t;
  const Auth = window.CNPAuth;
  if (!Auth || Auth.current()) return;           // already signed in: auth.js is redirecting
  const $ = (s) => document.querySelector(s);

  // translate static elements on login page
  (function translateStatic() {
    document.querySelectorAll('[data-t]').forEach(function (el) {
      var key = el.getAttribute('data-t');
      var val = t(key);
      if (val && val !== key) el.textContent = val;
    });
    var eye = document.getElementById('authEyebrow');
    if (eye) eye.textContent = t('codeLearnPlay');
  })();

  const names = Auth.names();
  const forms = { signup: $('#signupForm'), login: $('#loginForm') };
  const tabs = { signup: $('#tabSignup'), login: $('#tabLogin') };

  function show(which) {
    Object.keys(forms).forEach((k) => {
      forms[k].classList.toggle('hidden', k !== which);
      tabs[k].classList.toggle('on', k === which);
      tabs[k].setAttribute('aria-selected', String(k === which));
    });
    $('#authTitle').textContent = which === 'signup' ? t('createPlayer') : 'Welcome back';
    $('#authLead').textContent = which === 'signup'
      ? t('loginLead')
      : (window.I18N.getLang() === 'ur' ? 'Log in karo aur wahin se shuru karo jahan ruke the.' : 'Log in and you continue exactly where you stopped.');
    $('#legacyNote').classList.toggle('hidden', !(which === 'signup' && Auth.hasLegacy()));
    if ($('#legacyNote')) $('#legacyNote').textContent = t('legacyNote');
    forms[which].querySelector('input').focus({ preventScroll: true });
    try { history.replaceState(null, '', location.pathname + location.search + '#' + which); } catch (e) {}
  }
  Object.keys(tabs).forEach((k) => tabs[k].addEventListener('click', () => show(k)));
  show(location.hash === '#login' || (names.length && location.hash !== '#signup') ? 'login' : 'signup');

  // players already on this device: tap a name to fill it in
  if (names.length) {
    $('#known').classList.remove('hidden');
    $('#knownList').innerHTML = names.map((n) => '<button type="button" class="chip" data-n="' + n.replace(/[&<>"]/g, '') + '">' + n.replace(/[&<>"]/g, '') + '</button>').join('');
    $('#knownList').addEventListener('click', (e) => {
      const b = e.target.closest('[data-n]'); if (!b) return;
      forms.login.elements.username.value = b.dataset.n; forms.login.elements.password.focus();
    });
  }

  document.querySelectorAll('[data-show]').forEach((c) => c.addEventListener('change', () => {
    c.closest('form').querySelectorAll('input[type=password], input[data-pw]').forEach((i) => { i.type = c.checked ? 'text' : 'password'; i.dataset.pw = '1'; });
  }));

  const say = (id, txt, cls) => { const m = $(id); m.textContent = txt; m.className = 'auth-msg ' + (cls || ''); };
  const go = () => { location.replace(Auth.next() || 'index.html'); };

  forms.signup.addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target.elements, btn = e.target.querySelector('button[type=submit]');
    if (f.password.value !== f.confirm.value) return say('#signupMsg', window.I18N.getLang() === 'ur' ? 'Dono passwords match nahi karte.' : 'The two passwords do not match.', 'err');
    btn.disabled = true; say('#signupMsg', window.I18N.getLang() === 'ur' ? 'Player ban raha hai…' : 'Creating your player…');
    try { await Auth.signup(f.username.value, f.password.value, f.hero.value); say('#signupMsg', window.I18N.getLang() === 'ur' ? 'Welcome! CodeNPlay khul raha hai…' : 'Welcome! Opening CodeNPlay…', 'ok'); go(); }
    catch (x) { say('#signupMsg', x.message || (window.I18N.getLang() === 'ur' ? 'Account nahi ban saka.' : 'Could not create the account.'), 'err'); btn.disabled = false; }
  });

  forms.login.addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target.elements, btn = e.target.querySelector('button[type=submit]');
    if (!f.username.value.trim() || !f.password.value) return say('#loginMsg', window.I18N.getLang() === 'ur' ? 'Username aur password daalein.' : 'Enter your username and password.', 'err');
    btn.disabled = true; say('#loginMsg', window.I18N.getLang() === 'ur' ? 'Check ho raha hai…' : 'Checking…');
    try { await Auth.login(f.username.value, f.password.value); say('#loginMsg', window.I18N.getLang() === 'ur' ? 'Wapas aaye! CodeNPlay khul raha hai…' : 'Welcome back! Opening CodeNPlay…', 'ok'); go(); }
    catch (x) { say('#loginMsg', x.message || (window.I18N.getLang() === 'ur' ? 'Log in nahi ho saka.' : 'Could not log in.'), 'err'); btn.disabled = false; }
  });
})();
