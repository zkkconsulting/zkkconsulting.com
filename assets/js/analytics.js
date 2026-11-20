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
    // ask once: desktop on first scroll or after 1.2s, phones after 4s so the page lands first
    // a visit is a new browser session; after a choice the card asks again every other visit
    var again = ls(function (s) {
      var a = sessionStorage.getItem('zkk_ask');
      if (a === null) { var n = (+s.getItem('zkk_visits') || 0) + 1; s.setItem('zkk_visits', n); a = n % 2 ? '1' : '0'; sessionStorage.setItem('zkk_ask', a); }
      return a === '1';
    });
    if (!consent || again) {
      var asked = false, ask = function () { if (asked) return; asked = true; removeEventListener('scroll', ask); cookieBanner(); };
      if (matchMedia('(min-width: 861px)').matches) { addEventListener('scroll', ask, { passive: true }); setTimeout(ask, 1200); }
      else setTimeout(ask, 4000);
    }
    if (LEAD_MAGNET_ENABLED) {
      var lm = document.createElement('script');
      lm.src = '/assets/js/lead-magnet.js?v=13'; lm.defer = true;
      document.body.appendChild(lm);
    }
  });

  /* ── Cookie banner, asked on the first visit and again every other visit after. A black rounded card (bottom sheet on phones) with one white "Accept" pill.
        "Settings" is a quiet link that opens a single analytics switch, on by default. ── */
  function cookieBanner() {
    var css = document.createElement('style');
    css.textContent =
      '.ck-bar{position:fixed;z-index:9500;right:28px;bottom:28px;width:min(520px,calc(100% - 56px));box-sizing:border-box;padding:1.4rem 1.5rem 1.2rem;' +
        'border-radius:22px;background:#000;color:#fff;font-family:var(--sans);box-shadow:0 24px 60px rgba(0,0,0,.28)}' +
      '.ck-bar p{margin:0;font-size:.95rem;line-height:1.55;color:#fff}.ck-bar a{color:rgba(255,255,255,.7);text-decoration:underline;text-underline-offset:3px}.ck-bar a:hover{color:#fff}' +
      '.ck-row{display:flex;justify-content:flex-end;align-items:center;gap:.75rem;margin-top:1.1rem}' +
      '.ck-row .ck-yes{min-height:44px;padding:0 1.7rem;border:0;border-radius:999px;background:#fff;color:#0d1612;font:600 .92rem var(--sans);cursor:pointer;transition:background .2s}' +
      '.ck-row .ck-yes:hover{background:#e9e9e3}.ck-bar :focus-visible{outline:2px solid #f2d35a;outline-offset:2px}' +
      '.ck-quiet{min-height:44px;padding:0 .4rem;border:0;background:none;color:rgba(255,255,255,.5);font:400 .8rem var(--sans);text-decoration:underline;text-underline-offset:3px;cursor:pointer}.ck-quiet:hover{color:#fff}' +
      '.ck-set{display:none;margin-top:1rem;border-top:1px solid rgba(255,255,255,.14)}.ck-bar.ck-open .ck-set{display:block}.ck-bar.ck-open .ck-settings{display:none}' +
      '.ck-opt{display:flex;justify-content:space-between;align-items:center;gap:1rem;padding:.8rem 0;border-bottom:1px solid rgba(255,255,255,.14);font-size:.88rem}' +
      '.ck-opt small{display:block;color:rgba(255,255,255,.55);font-size:.78rem;margin-top:.15rem}.ck-on{color:rgba(255,255,255,.55);font-size:.78rem;white-space:nowrap}' +
      '.ck-sw{position:relative;flex:none;width:44px;height:26px;margin:0;appearance:none;-webkit-appearance:none;border-radius:999px;background:rgba(255,255,255,.25);cursor:pointer;transition:background .2s}' +
      '.ck-sw::after{content:"";position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:#fff;transition:transform .2s}' +
      '.ck-sw:checked{background:#0b6b45}.ck-sw:checked::after{transform:translateX(18px)}' +
      '@media (max-width:560px){.ck-bar{right:0;left:0;bottom:0;width:auto;padding:2rem 1.4rem calc(1.3rem + env(safe-area-inset-bottom));border-radius:24px 24px 0 0}' +
        '.ck-bar p{font-size:1rem;line-height:1.6}.ck-row{flex-direction:column-reverse;gap:.5rem;margin-top:1.7rem}.ck-row .ck-yes{width:100%;min-height:56px;font-size:1.02rem}}' +
      // desktop: a soft rise and settle in, a short fade and sink out
      '@media (prefers-reduced-motion:no-preference){.ck-bar{will-change:transform,opacity;transform-origin:100% 100%;animation:ck-in .8s cubic-bezier(.16,1,.3,1) both}.ck-bar{transition:opacity .4s ease,transform .4s cubic-bezier(.4,0,1,1)}.ck-bar.ck-out{animation:none;opacity:0;transform:translateY(10px) scale(.98);pointer-events:none}}' +
      // phones: the sheet glides up from below the screen instead of popping in
      '@media (prefers-reduced-motion:no-preference) and (max-width:560px){.ck-bar{animation:ck-up .75s cubic-bezier(.22,1,.36,1) both}.ck-bar.ck-out{animation:none;transform:translateY(100%);opacity:1;transition:transform .5s cubic-bezier(.4,0,.2,1)}}' +
      '@keyframes ck-in{from{opacity:0;transform:translateY(14px) scale(.98)}}@keyframes ck-up{from{transform:translateY(100%)}}';
    document.head.appendChild(css);
    var bar = document.createElement('section');
    bar.className = 'ck-bar'; bar.setAttribute('role', 'region'); bar.setAttribute('aria-label', 'Cookie choice');
    bar.innerHTML = '<p>We use cookies to improve your browsing experience, enhance site navigation, analyze site usage and assist in our marketing efforts. ' +
      '<a href="/legal/#s13">Click here to view ZKK\u2019s cookie policy.</a></p>' +
      '<div class="ck-set" id="ckSet">' +
        '<div class="ck-opt"><span>Essential<small>Remember your choices.</small></span><span class="ck-on">Always on</span></div>' +
        '<label class="ck-opt" for="ckAn"><span>Analytics<small>Count visits and pages. Never sold.</small></span><input class="ck-sw" id="ckAn" type="checkbox" checked></label>' +
      '</div>' +
      '<div class="ck-row"><button type="button" class="ck-quiet ck-settings" aria-controls="ckSet" aria-expanded="false">Cookie settings</button>' +
        '<button type="button" class="ck-quiet ck-save">Save choices</button><button type="button" class="ck-yes">Accept all</button></div>';
    bar.querySelector('.ck-save').style.display = 'none';
    bar.querySelector('#ckAn').checked = consent !== 'denied';   // settings reflect the last choice
    document.body.appendChild(bar);
    // drop the entrance animation once it ends so the exit transition can run from the resting state
    bar.addEventListener('animationend', function () { bar.style.animation = 'none'; }, { once: true });
    function choose(v) {
      ls(function () { sessionStorage.setItem('zkk_ask', '0'); });   // answered for this visit
      consent = v;
      setCookie('zkk_consent', consent, YEAR);
      ls(function (s) { s.setItem('zkk_consent', consent); });
      gtag('consent', 'update', consentState(consent));
      bar.classList.add('ck-out');   // fade and drop, then remove once the fade has finished
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) bar.remove();
      else { bar.addEventListener('transitionend', function (e) { if (e.target === bar && e.propertyName === 'transform') bar.remove(); }); setTimeout(function () { bar.remove(); }, 900); }
    }
    bar.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.classList.contains('ck-settings')) {
        bar.classList.add('ck-open'); b.setAttribute('aria-expanded', 'true');
        bar.querySelector('.ck-save').style.display = '';
        bar.querySelector('#ckAn').focus();
      } else if (b.classList.contains('ck-save')) choose(bar.querySelector('#ckAn').checked ? 'granted' : 'denied');
      else if (b.classList.contains('ck-yes')) choose('granted');
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
