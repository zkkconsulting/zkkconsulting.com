/* ═══════════════════════════════════════════════════════════════════
   Medtech checklist lead magnet: inline section + one popup per session.
   Loaded by analytics.js only when LEAD_MAGNET_ENABLED is true.
   Reuses site.css (.btn, .zform, .rv-dialog, .rv-x, .rv-note); the few
   rules below only place the new pieces. The email goes to FormSubmit,
   the same backend as the intake form, and never to GA.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  var Z = window.zkk; if (!Z) return;
  var PDF = '/assets/downloads/zkk-medtech-market-readiness-checklist.pdf';
  var COVER = '/assets/downloads/zkk-checklist-cover.png';
  var ENDPOINT = 'https://formsubmit.co/ajax/info@zkkconsulting.com';
  var DAY = 86400, path = location.pathname, q = new URLSearchParams(location.search);

  /* ── zkk_lm state: cookie first, localStorage mirror as a fallback ── */
  function setState(v) {
    var age = v === 'subscribed' ? 365 * DAY : 14 * DAY;
    Z.setCookie('zkk_lm', v, age);
    Z.ls(function (s) { s.setItem('zkk_lm', JSON.stringify({ v: v, exp: Date.now() + age * 1000 })); });
  }
  function getState() {
    var c = Z.getCookie('zkk_lm'); if (c) return c;
    return Z.ls(function (s) { var o = JSON.parse(s.getItem('zkk_lm') || 'null'); return o && o.exp > Date.now() ? o.v : ''; }) || '';
  }
  if (q.get('lm') === 'reset') {
    Z.setCookie('zkk_lm', '', 0);
    Z.ls(function (s) { s.removeItem('zkk_lm'); });
    Z.ss(function (s) { s.removeItem('zkk_lm_shown'); });
  }

  var excluded = /^\/(intake|contact|legal)(\/|$)/.test(path) || q.get('sent') === '1';
  if (excluded) return;
  var inlinePage = path === '/' || path === '/index.html' || /^\/services\/?$/.test(path) || /^\/insights(\/|$)/.test(path);

  var css = document.createElement('style');
  css.textContent =
    '.lm-box{max-width:760px;margin:0 auto;display:grid;grid-template-columns:120px 1fr;gap:1.6rem;align-items:center;padding:clamp(1.4rem,3vw,2.2rem);background:var(--white);border:1px solid var(--border);border-radius:18px;box-shadow:var(--shadow);text-align:left}' +
    '.lm-box h2{margin:0 0 .4rem;text-align:left}.lm-box p{margin:0 0 1rem;color:var(--muted)}' +
    '.lm-cover{width:120px;height:auto;border-radius:6px;box-shadow:var(--shadow)}.lm-box.no-cover{grid-template-columns:1fr}' +
    '.lm-form{display:flex;gap:.6rem;flex-wrap:wrap}.lm-form input[type="email"]{flex:1 1 220px;min-height:44px}.lm-form .btn{white-space:nowrap;min-height:44px;max-width:none}' +
    '.lm-box .rv-note,.lm-pop .rv-note{margin:.6rem 0 0}.lm-done{display:flex;flex-direction:column;align-items:flex-start;gap:.5rem}' +
    // popup: a small copy of the home hero. Paper ground, the "clearer." video fading in from the right,
    // dark headline with the yellow highlighter, green glass button. Values mirror .hero-paper in site.css.
    '.lm-pop{width:min(900px,calc(100% - 32px));overflow:hidden;background:#e5e5df;color:#0d1612}' +
    '.lm-hero{position:relative;min-height:440px;display:flex;align-items:center;padding:3rem 2.8rem}' +
    '.lm-vid{position:absolute;top:0;right:0;width:60%;height:100%;object-fit:cover;object-position:62% 50%;z-index:0;-webkit-mask-image:linear-gradient(90deg,transparent 0%,#000 34%);mask-image:linear-gradient(90deg,transparent 0%,#000 34%)}' +
    '.lm-hero::after{content:"";position:absolute;inset:0;z-index:1;pointer-events:none;background:linear-gradient(90deg,rgba(229,229,223,.98) 0%,rgba(229,229,223,.95) 46%,rgba(229,229,223,.55) 58%,rgba(229,229,223,.04) 74%),linear-gradient(0deg,rgba(229,229,223,.95) 0%,rgba(229,229,223,0) 28%)}' +
    '.lm-pop .lm-panel{position:relative;z-index:2;max-width:390px;padding:0;gap:.75rem;text-align:left}' +
    '.lm-kicker{display:block;margin-bottom:.6rem;font-size:.74rem;font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:#775406}' +
    '.lm-pop h2#lmPopTitle{color:#0d1612!important;text-align:left;font-size:clamp(1.8rem,3vw,2.5rem);line-height:1.06;letter-spacing:-.03em}' +
    '.lm-pop h2 .hl em{font-style:italic;font-weight:600;letter-spacing:-.02em}' +
    '.lm-pop .rv-sub{margin:0 0 .4rem;color:#4a554f;font-size:1.02rem}' +
    '.lm-pop .lm-form{flex-direction:column;width:100%;gap:.6rem}' +
    '.lm-pop .lm-form input[type="email"]{flex:none;min-height:52px;border-radius:12px;border:1px solid rgba(255,255,255,.9);background:rgba(255,255,255,.72);box-shadow:inset 0 1px 0 #fff,0 8px 22px rgba(13,22,18,.06);color:#0d1612}' +
    '.lm-pop .lm-form .btn-primary,.lm-pop .lm-done .btn-primary{width:100%;max-width:none;justify-content:center;color:#fff;background:linear-gradient(180deg,rgba(14,92,62,.92),rgba(7,58,39,.92));border:1px solid rgba(255,255,255,.22);box-shadow:inset 0 1px 0 rgba(255,255,255,.28),0 10px 26px rgba(7,58,39,.28)}' +
    '.lm-pop .btn-primary:hover{transform:translateY(-1px);box-shadow:inset 0 1px 0 rgba(255,255,255,.3),0 14px 32px rgba(7,58,39,.36)}' +
    '.lm-pop :focus-visible,.lm-pop input:focus{outline:2px solid #0b6b45;outline-offset:2px}' +
    '.lm-no{align-self:flex-start;min-height:44px;padding:0;border:0;background:none;color:#4a554f;font:600 .74rem var(--sans);letter-spacing:.14em;text-transform:uppercase;text-decoration:underline;text-underline-offset:4px;cursor:pointer}.lm-no:hover{color:#0d1612}' +
    '.lm-pop .rv-note{margin:0;color:#4a554f}.lm-pop .lm-done{align-items:stretch;width:100%}' +
    '.lm-pop .rv-x{z-index:3;width:44px;height:44px;color:#0d1612;background:rgba(255,255,255,.55)}.lm-pop .rv-x:hover{background:#fff}' +
    '@media (max-width:640px){.lm-box{grid-template-columns:1fr}.lm-cover{display:none}}' +
    '@media (max-width:767px){.lm-pop.lm-sheet{position:fixed;z-index:9000;inset:auto 0 0 0;margin:0;width:100%;max-width:100%;max-height:30vh;overflow:auto;border-radius:18px 18px 0 0}' +
    '.lm-sheet .lm-hero{display:block;min-height:0;padding:.9rem 1rem .8rem}.lm-sheet .lm-vid,.lm-sheet .lm-no{display:none}.lm-sheet .lm-panel{max-width:none;gap:.4rem}' +
    '.lm-sheet h2#lmPopTitle{padding-right:2.4rem;font-size:1.2rem;line-height:1.2}.lm-sheet .lm-kicker{margin-bottom:.25rem;font-size:.66rem}' +
    '.lm-sheet .rv-sub{margin:0;font-size:.85rem;line-height:1.4}.lm-sheet .lm-form{gap:.4rem}' +
    '.lm-sheet .lm-form input[type="email"],.lm-sheet .lm-form .btn-primary{min-height:44px}.lm-sheet .rv-x{top:.3rem;right:.3rem}}' +
    '@media (prefers-reduced-motion:no-preference){.lm-pop[open]{animation:lm-in .25s ease-out}.lm-sheet[open]{animation:lm-up .3s ease-out}}' +
    '@keyframes lm-in{from{opacity:0;transform:translateY(8px)}}@keyframes lm-up{from{transform:translateY(100%)}}';
  document.head.appendChild(css);

  var n = 0;
  function formHTML(loc) {
    var id = 'lmEmail' + (++n);
    // inline sits in page sections and takes .zform; the popup takes the review dialog's .rv-form input style
    return '<form class="' + (loc === 'inline' ? 'zform ' : '') + 'lm-form" novalidate data-loc="' + loc + '">' +
        '<label class="visually-hidden" for="' + id + '">Email address</label>' +
        '<input id="' + id + '" type="email" name="email" required maxlength="120" autocomplete="email" placeholder="you@company.com">' +
        '<input type="text" name="_honey" tabindex="-1" autocomplete="off" style="display:none" aria-hidden="true">' +
        '<button type="submit" class="btn btn-primary">Send me the checklist</button>' +
      '</form><p class="rv-note" aria-live="polite">No spam. Unsubscribe anytime.</p>';
  }
  function doneHTML(again) {
    return '<div class="lm-done"><a class="btn btn-primary" href="' + PDF + '" download>' + (again ? 'Download again' : 'Download the checklist') + '</a></div>';
  }
  function showDownload(host, again) {
    var f = host.querySelector('.lm-form'); if (!f) return;
    var note = f.nextElementSibling; if (note) note.remove();
    f.outerHTML = doneHTML(again);
  }

  function observeView(el, loc, onShow) {
    var seen = false;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (onShow) onShow(e.isIntersecting);
        if (!seen && e.intersectionRatio >= 0.5) { seen = true; Z.track('lead_magnet_view', { form_location: loc }); }
      });
    }, { threshold: [0, 0.5] });
    io.observe(el); return io;
  }

  /* ── Inline section, above the closing call-to-action band ── */
  var inline, inlineOnScreen = false;
  if (inlinePage) {
    inline = document.createElement('section');
    inline.className = (document.body.classList.contains('home') ? 'hs' : 'alt') + ' lm-inline';
    inline.setAttribute('data-lm', 'inline');
    inline.setAttribute('aria-labelledby', 'lmInlineTitle');
    inline.innerHTML = '<div class="lm-box"><img class="lm-cover" src="' + COVER + '" alt="" width="120" height="155" loading="lazy">' +
      '<div><h2 id="lmInlineTitle">Free: The Medtech Market Readiness Checklist</h2>' +
      '<p>20 questions investors will ask before you pitch your device.</p>' + formHTML('inline') + '</div></div>';
    inline.querySelector('.lm-cover').addEventListener('error', function () { this.remove(); inline.querySelector('.lm-box').classList.add('no-cover'); });
    var bands = document.querySelectorAll('main .cta-band');
    var anchor = bands[bands.length - 1] || document.querySelector('footer.site-footer');
    if (anchor) {
      anchor.parentNode.insertBefore(inline, anchor);
      if (getState() === 'subscribed') showDownload(inline, true);
      observeView(inline, 'inline', function (on) { inlineOnScreen = on; });
    }
  }

  /* ── Submission (shared by inline and popup) ── */
  document.addEventListener('submit', function (e) {
    var f = e.target; if (!f.classList || !f.classList.contains('lm-form')) return;
    e.preventDefault();
    var input = f.querySelector('input[type="email"]'), btn = f.querySelector('button'), note = f.nextElementSibling;
    input.value = input.value.trim();
    var ok = input.checkValidity() && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value);
    input.setAttribute('aria-invalid', ok ? 'false' : 'true');
    if (!ok) { input.setCustomValidity('Please enter a valid email address.'); input.reportValidity(); input.setCustomValidity(''); return; }
    if (f.querySelector('[name="_honey"]').value) return;
    var loc = f.getAttribute('data-loc');
    var data = new FormData();
    data.append('email', input.value);
    data.append('Lead magnet', 'Medtech Market Readiness Checklist (' + loc + ')');
    data.append('_subject', 'New checklist signup from zkkconsulting.com');
    data.append('_template', 'table'); data.append('_captcha', 'false');
    btn.disabled = true; btn.textContent = 'Sending…';
    fetch(ENDPOINT, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
      .then(function (r) { if (!r.ok) throw new Error(r.status); })
      .then(function () {
        setState('subscribed');
        Z.track('generate_lead', { lead_source: 'medtech_checklist', form_location: loc });
        var host = f.parentNode;
        showDownload(host, false);
        var no = host.querySelector('.lm-no'); if (no) no.remove();
        var a = host.querySelector('.lm-done a'); if (a) a.focus();
        if (inline && loc === 'popup') showDownload(inline, true);
      })
      .catch(function () {
        btn.disabled = false; btn.textContent = 'Send me the checklist';
        if (note) { note.setAttribute('role', 'alert'); note.textContent = 'That did not send. Please try again, or email info@zkkconsulting.com.'; }
      });
  });

  /* ── Popup: first of 50% scroll, 40 s or exit intent, never in the first 8 s, once per session ── */
  var state = getState();
  if (state === 'subscribed' || state === 'dismissed') return;
  if (Z.ss(function (s) { return s.getItem('zkk_lm_shown'); })) return;

  var t0 = Date.now(), dlg, lastFocus, popIO;
  function trigger() {
    if (dlg || Date.now() - t0 < 8000 || inlineOnScreen || Z.consentPending()) return;   // never on top of the cookie banner
    if (Z.ss(function (s) { return s.getItem('zkk_lm_shown'); }) || getState()) return;
    open();
  }
  function open() {
    Z.ss(function (s) { s.setItem('zkk_lm_shown', '1'); });
    var sheet = innerWidth < 768;
    lastFocus = document.activeElement;
    dlg = document.createElement('dialog');
    dlg.className = 'rv-dialog lm-pop' + (sheet ? ' lm-sheet' : '');
    dlg.setAttribute('aria-labelledby', 'lmPopTitle');
    dlg.setAttribute('aria-modal', sheet ? 'false' : 'true');
    var still = sheet || matchMedia('(prefers-reduced-motion: reduce)').matches;   // phones and reduced motion get the still frame
    dlg.innerHTML = '<div class="lm-hero">' +
      (sheet ? '' : '<video class="lm-vid" muted loop playsinline ' + (still ? '' : 'autoplay ') + 'preload="' + (still ? 'none' : 'auto') + '" poster="/assets/hero/clearer-poster.jpg" aria-hidden="true" tabindex="-1">' +
        '<source src="/assets/hero/clearer.webm" type="video/webm"><source src="/assets/hero/clearer.mp4" type="video/mp4"></video>') +
      '<button type="button" class="rv-x" aria-label="Close">\u00d7</button><div class="rv-form lm-panel">' +
      '<h2 id="lmPopTitle"><span class="lm-kicker">Free<span class="visually-hidden">:</span></span> The Medtech Market Readiness <mark class="hl"><em>Checklist</em></mark></h2>' +
      '<p class="rv-sub">20 questions investors will ask before you pitch your device.</p>' + formHTML('popup') +
      '<button type="button" class="lm-no">No thanks</button></div></div>';
    document.body.appendChild(dlg);
    dlg.querySelector('.rv-x').addEventListener('click', close);
    dlg.querySelector('.lm-no').addEventListener('click', close);
    var vid = dlg.querySelector('.lm-vid'); if (vid) vid.playbackRate = vid.defaultPlaybackRate = 0.4;   // same pace as the hero
    dlg.addEventListener('cancel', function (e) { e.preventDefault(); close(); });
    dlg.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key !== 'Tab') return;   // keep Tab and Shift+Tab inside the dialog
      var f = dlg.querySelectorAll('button:not([disabled]), input:not([type="hidden"]):not([tabindex="-1"]), a[href]');
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === dlg)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) close(); });
    // Desktop: a true modal (native focus trap, page inert). Mobile: a small bottom card with no
    // overlay that leaves the page usable, so it is not a full-screen interstitial.
    if (sheet) { dlg.tabIndex = -1; dlg.show(); dlg.focus({ preventScroll: true }); }   // no keyboard pop-up on phones
    else { dlg.showModal(); dlg.querySelector('input[type="email"]').focus({ preventScroll: true }); }
    popIO = observeView(dlg, 'popup');
  }
  function close() {
    if (!dlg || !dlg.open) return;
    if (getState() !== 'subscribed') { setState('dismissed'); Z.track('lead_magnet_dismiss', { form_location: 'popup' }); }
    if (popIO) popIO.disconnect();
    dlg.close();
    if (lastFocus && lastFocus.focus && lastFocus !== document.body) lastFocus.focus({ preventScroll: true });
  }

  setTimeout(trigger, 40000);
  document.addEventListener('zkk:consent', function () { if (Date.now() - t0 >= 40000 || scrolled50()) setTimeout(trigger, 1500); });
  setTimeout(function () { if (scrolled50()) trigger(); }, 8000);
  function scrolled50() { var h = document.documentElement.scrollHeight - innerHeight; return h > 0 && scrollY / h >= 0.5; }
  addEventListener('scroll', function () { if (scrolled50()) trigger(); }, { passive: true });
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.addEventListener('mouseout', function (e) { if (!e.relatedTarget && e.clientY <= 0) trigger(); });
  }
})();
