/* =========================================================
   CodeNPlay - shared SVG icon set (replaces every emoji)
   Loaded as a plain script in <head> on every page.
   Usage: CNPIcons.svg('flame', 'extra-class')
   ========================================================= */
(function () {
  'use strict';
  var P = {
    home: '<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 21V5"/><path d="M9 7h6"/>',
    play: '<path d="M7 4l13 8-13 8z"/>',
    pad: '<rect x="2" y="7" width="20" height="11" rx="5"/><path d="M7 10v5M4.5 12.5h5"/><circle cx="16" cy="11.5" r=".8"/><circle cx="18.5" cy="14" r=".8"/>',
    check: '<path d="M4 12l5 5L20 6"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"/>',
    reset: '<path d="M4 4v6h6"/><path d="M5.5 15a8 8 0 1 0 2-8.5L4 10"/>',
    run: '<path d="M7 4l13 8-13 8z" fill="currentColor"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
    flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
    star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18z"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    drop: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    wrench: '<path d="M14.7 6.3a4 4 0 0 0 5 5L21 12.6 12.6 21a2.1 2.1 0 0 1-3-3L18 9.6"/><path d="M14.7 6.3L12 9"/><path d="M9 4.5l-4.5 4.5L7 11.5 11.5 7z"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
    rocket: '<path d="M5 15c-1.5 1.3-2 5-2 5s3.7-.5 5-2"/><path d="M12 15l-3-3a22 22 0 0 1 2-4 12 12 0 0 1 11-5c0 3-1 8-5 11a22 22 0 0 1-4 2z"/><path d="M9 12H4s.6-3 2-4c1.6-1 5 0 5 0"/><path d="M12 15v5s3-.6 4-2c1-1.6 0-5 0-5"/>',
    keyboard: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M6 9h.01M10 9h.01M14 9h.01M18 9h.01M6 13h.01M18 13h.01M9 16h6"/>',
    chart: '<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>',
    flame: '<path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z"/>',
    trophy: '<path d="M8 4h8v6a4 4 0 0 1-8 0z"/><path d="M8 6H4v1a4 4 0 0 0 4 4M16 6h4v1a4 4 0 0 1-4 4"/><path d="M12 14v4M8 21h8M9 18h6"/>',
    skull: '<path d="M12 3a8 8 0 0 0-8 8c0 2.5 1.2 4.3 3 5.5V20h10v-3.5c1.8-1.2 3-3 3-5.5a8 8 0 0 0-8-8z"/><circle cx="9" cy="11.5" r="1.5"/><circle cx="15" cy="11.5" r="1.5"/><path d="M10 20v-2.5M14 20v-2.5"/>',
    sound: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>',
    mute: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 9l5 6M22 9l-5 6"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>'
  };
  function svg(name, cls) {
    return '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + (P[name] || '') + '</svg>';
  }
  window.CNPIcons = { paths: P, svg: svg };
})();
