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

  window.dataLayer = window.dataLayer || [];
  if (PROD) {
    window.gtag = function () { dataLayer.push(arguments); };
    var s = document.createElement('script');
    s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);

    // Consent Mode v2: denied in the EEA, UK and Switzerland, granted elsewhere. No banner.
    var DENY = { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' };
    gtag('consent', 'default', Object.assign({ region: ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE',
      'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'IS', 'LI', 'NO', 'GB', 'CH'] }, DENY));
    gtag('consent', 'default', { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted', analytics_storage: 'granted' });
    gtag('set', 'ads_data_redaction', true);
    gtag('js', new Date());
    var cfg = { allow_google_signals: false, allow_ad_personalization_signals: false };
    if (internal) cfg.traffic_type = 'internal';
    if (debug) cfg.debug_mode = true;
    gtag('config', GA_ID, cfg);

    if (CLARITY_ID && !internal) {
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
    if (a.closest('.lm-pop')) return 'popup';
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
    if (LEAD_MAGNET_ENABLED) {
      var lm = document.createElement('script');
      lm.src = '/assets/js/lead-magnet.js?v=1'; lm.defer = true;
      document.body.appendChild(lm);
    }
  });

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
