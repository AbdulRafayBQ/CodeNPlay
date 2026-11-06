/* =========================================================
   CodeNPlay - backup & restore (profile.html)
   No server, no signup. The learner picks a username + password,
   and the progress is locked (AES-GCM) into a backup code / link / file.
   After clearing browser data: same username + password + code = same progress.
   ========================================================= */
(function () {
  'use strict';
  const { S, save, esc, toast } = window.CNP;
  const root = document.querySelector('.profile-page');
  if (!root) return;

  const enc = new TextEncoder(), dec = new TextDecoder();
  const PREFIX = 'CNP1-', META_KEY = 'cnp.backup';
  const canCrypto = !!(window.crypto && window.crypto.subtle);

  // ---------- small helpers ----------
  const b64 = (u8) => btoa(String.fromCharCode.apply(null, u8)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const unb64 = (s) => {
    s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '=';
    return Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  };
  const norm = (u) => String(u || '').trim().toLowerCase();
  const sig = () => S.xp + '|' + Object.keys(S.done).length + '|' + Object.keys(S.q).length;
  const meta = () => { try { return JSON.parse(localStorage.getItem(META_KEY)) || null; } catch (e) { return null; } };

  async function pipe(bytes, Stream) {
    const out = new Response(new Blob([bytes]).stream().pipeThrough(new Stream('deflate-raw')));
    return new Uint8Array(await out.arrayBuffer());
  }
  async function keyFor(user, pass, salt) {
    const base = await crypto.subtle.importKey('raw', enc.encode(norm(user) + '\u0000' + pass), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 200000, hash: 'SHA-256' }, base,
      { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  }

  // ---------- make / read a backup code ----------
  async function makeCode(user, pass) {
    let data = enc.encode(JSON.stringify({ u: norm(user), t: Date.now(), s: S }));
    let flag = 0;
    if (window.CompressionStream) { try { data = await pipe(data, CompressionStream); flag = 1; } catch (e) { flag = 0; } }
    const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await keyFor(user, pass, salt), data));
    const all = new Uint8Array(1 + 16 + 12 + ct.length);
    all[0] = flag; all.set(salt, 1); all.set(iv, 17); all.set(ct, 29);
    return PREFIX + b64(all);
  }

  function cleanCode(text) {
    let t = String(text || '').trim();
    const i = t.indexOf('#backup='); if (i >= 0) t = t.slice(i + 8);
    t = t.replace(/\s+/g, '');
    return t.startsWith(PREFIX) ? t.slice(PREFIX.length) : t;
  }

  async function readCode(text, user, pass) {
    let all;
    try { all = unb64(cleanCode(text)); } catch (e) { throw new Error('That backup code looks broken. Copy it again.'); }
    if (all.length < 40) throw new Error('That backup code looks too short.');
    let data;
    try {
      data = new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: all.slice(17, 29) }, await keyFor(user, pass, all.slice(1, 17)), all.slice(29)));
    } catch (e) { throw new Error('Wrong username or password (or the code is damaged).'); }
    if (all[0] === 1) data = await pipe(data, DecompressionStream);
    const p = JSON.parse(dec.decode(data));
    if (!p || p.u !== norm(user) || !p.s) throw new Error('Wrong username or password.');
    return p;
  }

  // ---------- merge restored progress into this browser (never lose progress) ----------
  const okKey = (k) => /^[\w:-]{1,40}$/.test(k) && k !== '__proto__' && k !== 'constructor' && k !== 'prototype';
  const num = (n) => Math.max(0, Math.min(1e6, Number(n) || 0));
  function mergeFlags(into, from) { Object.keys(from || {}).forEach((k) => { if (okKey(k) && from[k]) into[k] = 1; }); }
  function merge(inc) {
    S.xp = Math.max(num(S.xp), num(inc.xp));
    S.perfect = Math.max(num(S.perfect), num(inc.perfect));
    mergeFlags(S.q, inc.q); mergeFlags(S.done, inc.done); mergeFlags(S.ach, inc.ach);
    const b = inc.streak || {};
    S.streak.best = Math.max(num(S.streak.best), num(b.best));
    if (String(b.last || '') > String(S.streak.last || '')) { S.streak.n = num(b.n); S.streak.last = String(b.last).slice(0, 10); }
    save();
  }

  // ---------- UI ----------
  const m = meta();
  const note = m
    ? (sig() === m.sig ? 'Last backup: ' + esc(new Date(m.at).toLocaleString()) + ' (username: ' + esc(m.user) + '). Your progress is up to date.'
                       : 'You have new progress since your last backup (' + esc(new Date(m.at).toLocaleDateString()) + '). Make a new backup.')
    : 'No backup yet. Make one so you never lose your progress.';

  const sec = document.createElement('section');
  sec.className = 'backup'; sec.id = 'backup';
  sec.innerHTML =
    '<div class="block-head"><h2>Save your progress anywhere</h2><p>No signup. Pick a username and password, and your progress is locked into a backup code. If browser data is ever cleared (or you use another device), enter the same username, password and code to get everything back.</p></div>' +
    (canCrypto ? '' : '<p class="bk-msg err">Backups need a secure page (https:// or localhost). Open the site that way to use this.</p>') +
    '<div class="bk-grid">' +
    '<form class="card bk-card" id="bkMake" autocomplete="on"><h3>1. Make a backup</h3>' +
    '<label>Username<input name="username" autocomplete="username" minlength="3" maxlength="30" required value="' + esc(m ? m.user : '') + '"></label>' +
    '<label>Password<input name="password" type="password" autocomplete="new-password" minlength="6" required></label>' +
    '<button class="btn primary" type="submit">Create backup code</button>' +
    '<div class="bk-out hidden" id="bkOut"><textarea id="bkCode" readonly rows="4" aria-label="Your backup code"></textarea>' +
    '<div class="bk-acts"><button type="button" class="btn ghost" data-do="copy">Copy code</button><button type="button" class="btn ghost" data-do="link">Copy link</button><button type="button" class="btn ghost" data-do="file">Download file</button></div>' +
    '<p class="muted bk-hint">Keep this somewhere safe (notes, email to yourself). Nobody can recover a forgotten password.</p></div>' +
    '<p class="bk-msg" id="bkMakeMsg" role="status" aria-live="polite">' + note + '</p></form>' +
    '<form class="card bk-card" id="bkRestore" autocomplete="on"><h3>2. Restore progress</h3>' +
    '<label>Username<input name="username" autocomplete="username" required></label>' +
    '<label>Password<input name="password" type="password" autocomplete="current-password" required></label>' +
    '<label>Backup code or link<textarea name="code" id="bkIn" rows="3" placeholder="Paste your backup code or link here" required></textarea></label>' +
    '<label class="bk-file">…or choose your backup file<input type="file" id="bkFile" accept=".txt,text/plain"></label>' +
    '<button class="btn primary" type="submit">Restore progress</button>' +
    '<p class="bk-msg" id="bkRestoreMsg" role="status" aria-live="polite"></p></form></div>';
  root.appendChild(sec);

  const $q = (s) => sec.querySelector(s);
  const say = (el, txt, cls) => { el.textContent = txt; el.className = 'bk-msg ' + (cls || ''); };
  const busy = (form, on) => { const b = form.querySelector('button[type=submit]'); b.disabled = on; };
  let lastCode = '', lastUser = '';

  $q('#bkMake').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target, msg = $q('#bkMakeMsg'), user = f.elements.username.value, pass = f.elements.password.value;
    if (!canCrypto) return;
    if (norm(user).length < 3) return say(msg, 'Username needs at least 3 characters.', 'err');
    if (pass.length < 6) return say(msg, 'Password needs at least 6 characters.', 'err');
    busy(f, true); say(msg, 'Locking your progress…');
    try {
      lastCode = await makeCode(user, pass); lastUser = norm(user);
      try { localStorage.setItem(META_KEY, JSON.stringify({ user: lastUser, at: Date.now(), sig: sig() })); } catch (x) {}
      $q('#bkCode').value = lastCode; $q('#bkOut').classList.remove('hidden');
      say(msg, 'Backup ready. Copy it or download the file.', 'ok');
    } catch (x) { say(msg, 'Could not make the backup. Try again.', 'err'); }
    busy(f, false);
  });

  const linkFor = () => location.href.split('#')[0].split('?')[0] + '#backup=' + lastCode;
  const copy = async (text, done) => {
    try { await navigator.clipboard.writeText(text); toast(done); }
    catch (x) { const t = $q('#bkCode'); t.value = text; t.select(); toast('Select and copy the text'); }
  };
  $q('#bkOut').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-do]'); if (!b || !lastCode) return;
    if (b.dataset.do === 'copy') copy(lastCode, 'Backup code copied');
    else if (b.dataset.do === 'link') copy(linkFor(), 'Backup link copied');
    else {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([lastCode + '\n'], { type: 'text/plain' }));
      a.download = 'codenplay-backup-' + lastUser + '.txt'; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    }
  });

  $q('#bkFile').addEventListener('change', (e) => {
    const file = e.target.files[0]; if (!file) return;
    if (file.size > 200000) return say($q('#bkRestoreMsg'), 'That file is too big to be a backup.', 'err');
    const r = new FileReader(); r.onload = () => { $q('#bkIn').value = String(r.result).trim(); }; r.readAsText(file);
  });

  $q('#bkRestore').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target, msg = $q('#bkRestoreMsg');
    if (!canCrypto) return;
    busy(f, true); say(msg, 'Unlocking…');
    try {
      const p = await readCode(f.elements.code.value, f.elements.username.value, f.elements.password.value);
      merge(p.s);
      try { localStorage.setItem(META_KEY, JSON.stringify({ user: norm(f.elements.username.value), at: p.t, sig: sig() })); } catch (x) {}
      say(msg, 'Progress restored! Reloading…', 'ok'); toast('Progress restored');
      setTimeout(() => location.reload(), 900);
    } catch (x) { say(msg, x.message || 'Could not restore.', 'err'); busy(f, false); }
  });

  // opened from a backup link: fill the code and jump to the restore form
  if (location.hash.indexOf('#backup=') === 0) {
    $q('#bkIn').value = location.hash.slice(8);
    try { history.replaceState(null, '', location.pathname + location.search); } catch (x) {}
    sec.scrollIntoView(); $q('#bkRestore input[name=username]').focus({ preventScroll: true });
  } else if (location.hash === '#backup') { sec.scrollIntoView(); }

  window.CNPBackup = { makeCode, readCode, merge };
})();
