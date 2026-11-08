/* =========================================================
   Runner: runs the learner's code in a sandboxed iframe.
   - console.log output is captured and shown inside the page
     (the learner never needs browser DevTools).
   ========================================================= */
(function () {
  const SHIM =
    '<script>(function(){window.__logs=[];window.__errors=[];' +
    'function f(a){try{if(a===undefined)return "undefined";if(typeof a==="string")return a;if(a instanceof Error)return a.message;return JSON.stringify(a)}catch(e){return String(a)}}' +
    'function send(t,s){try{parent.postMessage({pnc:1,type:t,text:s},"*")}catch(e){}}' +
    '["log","info","warn","error"].forEach(function(k){console[k]=function(){var s=[].map.call(arguments,f).join(" ");window.__logs.push(s);send(k,s)}});' +
    'window.addEventListener("error",function(e){var s=(e.message||"Error");window.__errors.push(s);send("error",s);});' +
    'window.addEventListener("unhandledrejection",function(e){var s=String(e.reason);window.__errors.push(s);send("error",s)});' +
    '})();<\/script>';

  const PAGE_CSS = 'html,body{margin:0}body{padding:14px;font-family:system-ui,sans-serif;color:#1b1f3a;background:#fff;line-height:1.5}';

  function safe(code) { return String(code).replace(/<\/script/gi, '<\\/script'); }

  function build(spec) {
    const { kind, code, base = '', baseStyle = '' } = spec;
    let head = '<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>' + PAGE_CSS + '</style>';
    let body = '';
    if (kind === 'html') {
      body = code;
    } else if (kind === 'css') {
      head += '<style>' + baseStyle + '</style><style id="user-css">' + String(code).replace(/<\/style/gi, '') + '</style>';
      body = base;
    } else {
      head += '<style>' + baseStyle + '</style>';
      body = base + '\n<script>\n' + safe(code) + '\n<\/script>';
    }
    return '<!doctype html><html><head>' + (kind === 'js' ? '' : '') + head + SHIM + '</head><body>' + body + '</body></html>';
  }

  // Catch loops that would freeze the whole page
  function loopProblem(code) {
    if (/while\s*\(\s*(true|1)\s*\)/.test(code) || /for\s*\(\s*[^;)]*;\s*;/.test(code)) {
      return 'This loop never stops, so I did not run it. Give the loop an end condition.';
    }
    return null;
  }

  function makeFrame(hidden) {
    const f = document.createElement('iframe');
    f.setAttribute('sandbox', 'allow-scripts allow-same-origin');
    f.setAttribute('title', 'Output');
    if (hidden) f.style.cssText = 'position:fixed;left:-9999px;top:0;width:700px;height:500px;border:0;visibility:hidden';
    return f;
  }

  // Run code in a hidden frame and return a context for tests
  function exec(spec, bag) {
    return new Promise((resolve) => {
      const guard = spec.kind === 'js' ? loopProblem(spec.code) : null;
      if (guard) {
        resolve({ doc: document.implementation.createHTMLDocument(''), win: window, logs: [], errors: [guard], code: spec.code, spec, run: null });
        return;
      }
      const f = makeFrame(true);
      (bag || []).push(f);
      let done = false;
      const finish = () => {
        if (done) return; done = true;
        const w = f.contentWindow;
        const ctx = {
          doc: f.contentDocument, win: w,
          logs: (w.__logs || []).slice(), errors: (w.__errors || []).slice(),
          code: spec.code, spec,
        };
        ctx.run = (newCode) => exec({ ...spec, code: newCode }, bag);
        resolve(ctx);
      };
      f.onload = () => setTimeout(finish, 60);
      setTimeout(finish, 3000);
      f.srcdoc = build(spec);
      document.body.appendChild(f);
    });
  }

  function cleanup(bag) { (bag || []).forEach((f) => f.remove()); bag.length = 0; }

  // Run the check function of a test
  async function grade(spec, check) {
    const bag = [];
    try {
      const ctx = await exec(spec, bag);
      if (ctx.errors.length) return { ok: false, msg: 'Your code has an error: ' + ctx.errors[0] };
      const wrapped = Object.assign({}, ctx, {
        run: (code) => exec({ ...spec, code }, bag),
      });
      const r = await check(wrapped);
      if (r === true) return { ok: true };
      return { ok: false, msg: typeof r === 'string' ? r : 'Not quite. Try again!' };
    } catch (e) {
      return { ok: false, msg: 'Something went wrong while checking: ' + e.message };
    } finally {
      cleanup(bag);
    }
  }

  window.Runner = { build, exec, grade, makeFrame, loopProblem };
})();
