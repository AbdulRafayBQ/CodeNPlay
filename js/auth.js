/* =========================================================
   CodeNPlay - local accounts + per-user storage
   Loaded FIRST (plain <script> in <head>, not deferred).
   - No server: accounts live in this browser's localStorage.
   - Passwords are never stored; only a salted PBKDF2 hash.
   - Every player has their own progress, drafts, battle state
     and preferences, so refresh / closing the tab / closing
     Chrome never loses anything.
   - Not logged in -> every page sends you to login.html.
   ========================================================= */
(function () {
  'use strict';
  var USERS = 'cnp.users', SESSION = 'cnp.session', LEGACY = 'codenplay.v1';
  var NAME_RX = /^[a-z0-9_.-]{3,20}$/i;

  // ---------- safe storage helpers ----------
  function rd(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function wr(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } }
  function rm(k) { try { localStorage.removeItem(k); } catch (e) {} }
  function jr(k, d) {
    try { var s = rd(k), o = s ? JSON.parse(s) : null; return o && typeof o === 'object' ? o : d; } catch (e) { return d; }
  }
  function users() { return jr(USERS, {}); }
  function norm(n) { return String(n || '').trim().toLowerCase(); }
  function current() { var id = rd(SESSION); return id && users()[id] ? id : null; }
  function K(id, name) { return 'cnp.u.' + (id || '_guest') + '.' + name; }

  // ---------- the gate: who may see which page ----------
  var path = location.pathname.split('/').pop() || 'index.html';
  var onLogin = path === 'login.html';
  var me = current();

  function safeNext() {
    var n = new URLSearchParams(location.search).get('next') || '';
    return '';   // after login or sign-up the player always lands on the home page
  }
  if (!me && !onLogin) {
    try { window.stop(); } catch (e) {}
    document.documentElement.style.visibility = 'hidden';
    location.replace('login.html?next=' + encodeURIComponent(path + location.search + location.hash));
  } else if (me && onLogin) {
    try { window.stop(); } catch (e) {}
    location.replace(safeNext() || 'index.html');
  }

  // ---------- password hashing ----------
  var canCrypto = !!(window.crypto && crypto.subtle && crypto.getRandomValues);
  var enc = new TextEncoder();
  function b64(buf) { var u = new Uint8Array(buf), s = ''; for (var i = 0; i < u.length; i++) s += String.fromCharCode(u[i]); return btoa(s); }
  function unb64(s) { var b = atob(s), u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
  function newSalt() {
    var u = new Uint8Array(16);
    if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(u); else for (var i = 0; i < 16; i++) u[i] = Math.floor(Math.random() * 256);
    return b64(u);
  }
  // fallback only for plain http:// pages where WebCrypto is switched off by the browser
  function weak(pw, salt) {
    var h1 = 0xdeadbeef, h2 = 0x41c6ce57, s = salt + '|' + pw;
    for (var r = 0; r < 3000; r++) for (var i = 0; i < s.length; i++) { var c = s.charCodeAt(i); h1 = Math.imul(h1 ^ c, 2654435761); h2 = Math.imul(h2 ^ c, 1597334677); }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (h2 >>> 0).toString(16) + (h1 >>> 0).toString(16);
  }
  async function derive(pw, salt, alg) {
    if (alg === 'pbkdf2') {
      var key = await crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveBits']);
      return b64(await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: unb64(salt), iterations: 150000, hash: 'SHA-256' }, key, 256));
    }
    return weak(pw, salt);
  }
  async function verify(id, pw) {
    var u = users()[id];
    if (!u) return false;
    if (u.alg === 'pbkdf2' && !canCrypto) throw new Error('Open the site with https:// or localhost to log in.');
    return (await derive(pw, u.salt, u.alg)) === u.hash;
  }
  function keepStorage() { try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) {} }

  // ---------- accounts ----------
  async function signup(name, pw, hero) {
    name = String(name || '').trim();
    if (!NAME_RX.test(name)) throw new Error('Username: 3 to 20 characters (letters, numbers, _ . -).');
    if (String(pw).length < 6) throw new Error('Password needs at least 6 characters.');
    var id = norm(name), all = users();
    if (all[id]) throw new Error('That username is already taken on this device.');
    var alg = canCrypto ? 'pbkdf2' : 'weak', salt = newSalt();
    all[id] = { name: name, alg: alg, salt: salt, hash: await derive(pw, salt, alg), created: Date.now() };
    if (!wr(USERS, JSON.stringify(all))) throw new Error('Could not save your account. Is browser storage blocked or full?');

    // progress made before accounts existed becomes part of the first account
    var prefs = {}, legacy = rd(LEGACY);
    if (legacy) { wr(K(id, 'progress'), legacy); rm(LEGACY); }
    ['hero', 'sound', 'suggestions'].forEach(function (p) { var v = rd('cnp.' + p); if (v !== null) { prefs[p] = v; rm('cnp.' + p); } });
    if (hero) prefs.hero = hero;
    wr(K(id, 'prefs'), JSON.stringify(prefs));

    wr(SESSION, id); keepStorage();
    return id;
  }
  async function login(name, pw) {
    var id = norm(name);
    if (!(await verify(id, pw))) throw new Error('Wrong username or password.');
    wr(SESSION, id); keepStorage();
    return id;
  }
  function logout() { flushAll(); rm(SESSION); location.replace('login.html'); }
  async function deleteAccount(pw) {
    if (!(await verify(me, pw))) throw new Error('Wrong password.');
    var pre = 'cnp.u.' + me + '.', dead = [];
    try { for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k && k.indexOf(pre) === 0) dead.push(k); } } catch (e) {}
    dead.forEach(rm);
    var all = users(); delete all[me]; wr(USERS, JSON.stringify(all));
    rm(SESSION); location.replace('login.html');
  }

  // ---------- per-user preferences (hero, sound, suggestions) ----------
  function pref(n, d) { var p = jr(K(me, 'prefs'), {}); return p[n] === undefined ? d : p[n]; }
  function setPref(n, v) { var p = jr(K(me, 'prefs'), {}); p[n] = v; wr(K(me, 'prefs'), JSON.stringify(p)); }

  // ---------- small saved buckets: editor drafts + battle progress ----------
  var buckets = [];
  function bucket(name, cap) {
    var cache = null, timer = null;
    function load() { if (cache === null) cache = jr(K(me, name), {}); return cache; }
    function flush() {
      clearTimeout(timer); timer = null;
      if (cache === null) return;
      var keys = Object.keys(cache);
      if (cap && keys.length > cap) keys.sort(function (a, b) { return (cache[a].t || 0) - (cache[b].t || 0); }).slice(0, keys.length - cap).forEach(function (k) { delete cache[k]; });
      wr(K(me, name), JSON.stringify(cache));
    }
    function later() { clearTimeout(timer); timer = setTimeout(flush, 350); }
    var b = {
      get: function (k) { var e = load()[k]; return e ? e.v : undefined; },
      set: function (k, v) { load()[k] = { v: v, t: Date.now() }; later(); },
      del: function (k) { if (k in load()) { delete cache[k]; later(); } },
      clear: function () { cache = {}; flush(); },
      flush: flush
    };
    buckets.push(b); return b;
  }
  var drafts = bucket('drafts', 80), battle = bucket('battle', 20);
  function flushAll() { buckets.forEach(function (b) { b.flush(); }); }
  function clearTransient() { drafts.clear(); battle.clear(); }

  // save the moment the tab is hidden, closed or refreshed
  window.addEventListener('pagehide', flushAll);
  window.addEventListener('beforeunload', flushAll);
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') flushAll(); });
  // log in / out in another tab -> this tab follows
  window.addEventListener('storage', function (e) { if (e.key === SESSION && (e.newValue || null) !== (me || null)) location.reload(); });
  if (me) keepStorage();

  window.CNPAuth = {
    current: function () { return me; },
    name: function () { var u = me && users()[me]; return u ? u.name : ''; },
    names: function () { var a = users(); return Object.keys(a).map(function (id) { return a[id].name; }); },
    hasLegacy: function () { return !!rd(LEGACY); },
    key: function (n) { return K(me, n); },
    next: safeNext, canCrypto: canCrypto,
    signup: signup, login: login, logout: logout, deleteAccount: deleteAccount,
    pref: pref, setPref: setPref, drafts: drafts, battle: battle, clearTransient: clearTransient, flush: flushAll
  };
})();
