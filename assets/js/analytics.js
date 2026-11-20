/* ═══════════════════════════════════════════════════════════════════
   ZKK analytics: the only place GA is loaded. Every page includes this
   file in <head>. GA (and Clarity, when an ID is set) run only on the
   production host, so local dev, previews and screenshot runs record
   nothing. Event parameters never carry names, emails or form text.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  var GA_ID = 'G-TMKT95P39F';
  var CLARITY_ID = '';                 // paste a Microsoft Clarity project ID here to turn Clarity on
  var LEAD_MAGNET_ENABLED = true;      // needs /assets/downloads/zkk-medtech-market-readiness-checklist.pdf

  var PROD = location.hostname === 'zkkconsulting.com' || location.hostname === 'www.zkkconsulting.com';
  var q = new URLSearchParams(location.search);
  var YEAR = 31536000;

  function getCookie(n) { var m = document.cookie.match('(?:^|; )' + n + '=([^;]*)'); return m ? decodeURIComponent(m[1]) : ''; }
  function setCookie(n, v, maxAge) { document.cookie = n + '=' + encodeURIComponent(v) + '; max-age=' + maxAge + '; path=/; SameSite=Lax; Secure'; }
  function ls(fn) { try { return fn(window.localStorage); } catch (e) { return null; } }
  function ss(fn) { try { return fn(window.sessionStorage); } catch (e) { return null; } }

  /* ── Internal traffic: ?internal=1 marks this browser, ?internal=0 clears it ── */
  if (q.get('internal') === '1') { setCookie('zkk_internal', '1', YEAR); ls(function (s) { s.setItem('zkk_internal', '1'); }); }
  if (q.get('internal') === '0') { setCookie('zkk_internal', '', 0); ls(function (s) { s.removeItem('zkk_internal'); }); }
  var internal = getCookie('zkk_internal') === '1' || ls(function (s) { return s.getItem('zkk_internal'); }) === '1';

  /* ── DebugView: ?debug_mode=true sends this tab's events to GA4 DebugView, ?debug_mode=false stops ── */
  if (q.get('debug_mode')) ss(function (s) { q.get('debug_mode') === 'true' ? s.setItem('zkk_debug', '1') : s.removeItem('zkk_debug'); });
  var debug = ss(function (s) { return s.getItem('zkk_debug'); }) === '1';

  // Cookie choice: zkk_consent = granted | denied, kept for a year
  var consent = getCookie('zkk_consent') || ls(function (s) { return s.getItem('zkk_consent'); }) || '';
  function consentState(v) { return { ad_storage: v, ad_user_data: v, ad_personalization: v, analytics_storage: v }; }

  window.dataLayer = window.dataLayer || [];
  if (PROD) {
    window.gtag = function () { dataLayer.push(arguments); };
    var s = document.createElement('script');
    s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);

    // Consent Mode v2: denied in the EEA, UK and Switzerland, granted elsewhere, until the visitor
    // answers the cookie banner below. Their saved answer then overrides the default on every page.
    var DENY = { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' };
    gtag('consent', 'default', Object.assign({ region: ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE',
      'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'IS', 'LI', 'NO', 'GB', 'CH'] }, DENY));
    gtag('consent', 'default', { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted', analytics_storage: 'granted' });
    if (consent) gtag('consent', 'update', consentState(consent));
    gtag('set', 'ads_data_redaction', true);
    gtag('js', new Date());
    var cfg = { allow_google_signals: false, allow_ad_personalization_signals: false };
    if (internal) cfg.traffic_type = 'internal';
    if (debug) cfg.debug_mode = true;
    gtag('config', GA_ID, cfg);

    if (CLARITY_ID && !internal && consent === 'granted') {   // Clarity only after an explicit Accept
      window.clarity = window.clarity || function () { (window.clarity.q = window.clarity.q || []).push(arguments); };
      var c = document.createElement('script');
      c.async = true; c.src = 'https://www.clarity.ms/tag/' + CLARITY_ID;
      document.head.appendChild(c);
      // Masking mode "Strict" is set per project in the Clarity dashboard (Settings > Masking); inputs are always masked there.
    }
  } else {
    window.gtag = function () {};
    console.info('[zkk] analytics disabled on ' + (location.hostname || location.protocol));
  }

  function track(name, params) { gtag('event', name, params || {}); }
  window.zkk = { track: track, getCookie: getCookie, setCookie: setCookie, ls: ls, ss: ss };

  var path = location.pathname;

  /* ── Clicks: consultation CTAs, email, phone, social profiles ── */
  var SOCIAL = { 'linkedin.com': 'linkedin', 'instagram.com': 'instagram', 'facebook.com': 'facebook', 'threads.net': 'threads',
    'threads.com': 'threads', 'tiktok.com': 'tiktok', 'youtube.com': 'youtube', 'x.com': 'x', 'twitter.com': 'x' };
  function ctaLocation(a) {
    if (a.closest('nav, .mobile-menu')) return 'nav';
    if (a.closest('footer')) return 'footer';
    if (a.closest('.page-hero, .light-hero, #hero')) return 'hero';
    return 'inline';
  }
  function label(a) {   // rendered text only (some buttons carry separate desktop and mobile spans), original casing
    var t = '', w = document.createTreeWalker(a, NodeFilter.SHOW_TEXT);
    while (w.nextNode()) if (w.currentNode.parentElement.getClientRects().length) t += w.currentNode.data;
    return t || a.textContent;
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href');
    if (/^mailto:/i.test(href)) return track('click_email');
    if (/^tel:/i.test(href)) return track('click_phone');
    if (a.host === location.host && /^\/intake\/?$/.test(a.pathname)) {
      return track('cta_click', { cta_text: label(a).replace(/\s+/g, ' ').trim().slice(0, 100), cta_location: ctaLocation(a), page_path: path });
    }
    var host = a.hostname.replace(/^www\./, '');
    if (SOCIAL[host]) track('outbound_social', { platform: SOCIAL[host] });
  }, true);

  /* ── Intake form: form_start on first touch, qualify_lead only on a confirmed send ── */
  // The intake form has two success paths: a background send that reveals #formSuccess,
  // and a regular post (file uploads, or a failed background send) that FormSubmit
  // redirects to /intake/?sent=1. A session flag set on submit tells a real redirect
  // apart from someone reloading or sharing the ?sent=1 URL.
  var started = false;
  function startForm(e) {
    if (started || !e.target.closest || !e.target.closest('#intakeForm')) return;
    started = true; track('form_start', { form_id: 'intake' });
  }
  document.addEventListener('focusin', startForm);
  document.addEventListener('input', startForm);
  document.addEventListener('submit', function (e) {
    if (e.target.id === 'intakeForm') ss(function (s) { s.setItem('zkk_pending', 'intake'); });
  });
  function qualify() {
    if (ss(function (s) { return s.getItem('zkk_pending'); }) !== 'intake') return;
    ss(function (s) { s.removeItem('zkk_pending'); });
    track('qualify_lead', { form_id: 'intake', page_path: path });
  }

  function ready(fn) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }
  ready(function () {
    var ok = document.getElementById('formSuccess');
    if (ok && document.getElementById('intakeForm')) {
      if (!ok.hidden && q.get('sent') === '1') qualify();
      new MutationObserver(function () { if (!ok.hidden) qualify(); }).observe(ok, { attributes: true, attributeFilter: ['hidden'] });
    }
    if (!consent) cookieBanner();
    if (LEAD_MAGNET_ENABLED) {
      var lm = document.createElement('script');
      lm.src = '/assets/js/lead-magnet.js?v=4'; lm.defer = true;
      document.body.appendChild(lm);
    }
  });

  /* ── Cookie banner: Accept or Decline, asked once a year. A full-width black bar, styled like the nav (black, white button). ── */
  function cookieBanner() {
    var css = document.createElement('style');
    css.textContent =
      '.ck-bar{position:fixed;z-index:9500;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;gap:.75rem 2rem;flex-wrap:wrap;' +
        'padding:.85rem var(--edge,6vw) calc(.85rem + env(safe-area-inset-bottom));background:#0b0f0d;color:#fff;border-top:1px solid rgba(255,255,255,.1);' +
        'box-shadow:0 -12px 32px rgba(0,0,0,.18);font-family:var(--sans)}' +
      '.ck-bar p{margin:0;font-size:.9rem;line-height:1.5;color:rgba(255,255,255,.86)}.ck-bar a{color:#fff;text-decoration:underline;text-underline-offset:3px}' +
      '.ck-row{display:flex;gap:.5rem;flex:none}.ck-row .btn{min-height:44px;max-width:none;width:auto;padding:0 1.3rem;font-size:.74rem}' +
      '.ck-bar .ck-yes{background:#fff;color:#0b0f0d;border:1px solid #fff}.ck-bar .ck-yes:hover{background:#e9e9e3}' +
      '.ck-bar .ck-no{background:transparent;color:#fff;border:1px solid rgba(255,255,255,.4)}.ck-bar .ck-no:hover{border-color:#fff}' +
      '.ck-bar :focus-visible{outline:2px solid #f2d35a;outline-offset:2px}' +
      '@media (max-width:560px){.ck-bar{justify-content:stretch;padding:.8rem 16px calc(.8rem + env(safe-area-inset-bottom))}.ck-bar p{font-size:.84rem}.ck-row{width:100%}.ck-row .btn{flex:1 1 0}}' +
      '@media (prefers-reduced-motion:no-preference){.ck-bar{animation:ck-in .35s ease-out}.ck-bar.ck-out{animation:ck-in .25s ease-in reverse forwards}}@keyframes ck-in{from{transform:translateY(100%)}}';
    document.head.appendChild(css);
    var bar = document.createElement('section');
    bar.className = 'ck-bar'; bar.setAttribute('role', 'region'); bar.setAttribute('aria-label', 'Cookie choice');
    bar.innerHTML = '<p>We use cookies to count visits and see which pages help. <a href="/legal/#s13">Privacy details</a></p>' +
      '<div class="ck-row"><button type="button" class="btn ck-no">Decline</button><button type="button" class="btn ck-yes">Accept</button></div>';
    document.body.appendChild(bar);
    bar.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      consent = b.classList.contains('ck-yes') ? 'granted' : 'denied';
      setCookie('zkk_consent', consent, YEAR);
      ls(function (s) { s.setItem('zkk_consent', consent); });
      gtag('consent', 'update', consentState(consent));
      bar.classList.add('ck-out'); setTimeout(function () { bar.remove(); }, 250);
    });
  }

  /* ── Scroll depth 25/50/75 (GA enhanced measurement already sends 90), and insight_read ── */
  var sent = {}, maxPct = 0, engaged = 0, readSent = false;
  var slug = (path.match(/^\/insights\/([^\/]+)\/?$/) || [])[1];
  function checkRead() {
    if (slug && !readSent && maxPct >= 75 && engaged >= 30) { readSent = true; track('insight_read', { article_slug: slug }); }
  }
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var h = document.documentElement.scrollHeight - innerHeight;
      var pct = h > 0 ? Math.round(scrollY / h * 100) : 100;
      if (pct > maxPct) maxPct = pct;
      [25, 50, 75].forEach(function (p) { if (maxPct >= p && !sent[p]) { sent[p] = 1; track('scroll_depth', { percent: p }); } });
      checkRead();
    });
  }, { passive: true });
  if (slug) setInterval(function () {
    if (document.visibilityState === 'visible' && document.hasFocus()) { engaged++; checkRead(); }
  }, 1000);
})();
