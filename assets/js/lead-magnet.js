/* ═══════════════════════════════════════════════════════════════════
   Market Readiness Checklist signup: one inline card at the bottom of
   every page, above the closing call to action. No popup.
   Loaded by analytics.js only when LEAD_MAGNET_ENABLED is true.
   Styled like the home hero (paper, glass, dark button). The email goes
   to the Apps Script mailer (or FormSubmit until it is set), never to GA.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  var Z = window.zkk; if (!Z) return;
  // every page except the intake form (its own signup), the legal page and the post-submit thank-you
  if (/^\/(intake|legal)(\/|$)/.test(location.pathname) || /[?&]sent=1/.test(location.search)) return;
  var PDF = '/assets/downloads/zkk-medtech-market-readiness-checklist.pdf';
  var PAGES = ['/assets/downloads/checklist-page-1.jpg', '/assets/downloads/checklist-page-2.jpg'];
  // Google Apps Script web app that emails the PDF (see ops/checklist-mailer.gs). Until it is set,
  // signups go to FormSubmit like the intake form and the visitor just gets the download button.
  var SIGNUP_URL = '';
  var ENDPOINT = 'https://formsubmit.co/ajax/info@zkkconsulting.com';
  var path = location.pathname, q = new URLSearchParams(location.search);

  /* ── zkk_lm: 'subscribed' for a year swaps the form for "Download again" ── */
  var YEAR = 365 * 86400;
  function subscribe() {
    Z.setCookie('zkk_lm', 'subscribed', YEAR);
    Z.ls(function (s) { s.setItem('zkk_lm', JSON.stringify({ v: 'subscribed', exp: Date.now() + YEAR * 1000 })); });
  }
  function subscribed() {
    if (Z.getCookie('zkk_lm') === 'subscribed') return true;
    return Z.ls(function (s) { var o = JSON.parse(s.getItem('zkk_lm') || 'null'); return !!o && o.v === 'subscribed' && o.exp > Date.now(); });
  }
  if (q.get('lm') === 'reset') { Z.setCookie('zkk_lm', '', 0); Z.ls(function (s) { s.removeItem('zkk_lm'); }); }

  var css = document.createElement('style');
  css.textContent =
    // layout follows the card's own width (container queries), so it never squeezes the heading into a sliver
    '.lm-inline{padding:clamp(2rem,5vw,3.5rem) var(--edge,6vw)!important;container-type:inline-size}' +
    '.lm-card{max-width:1120px;margin:0 auto;display:grid;grid-template-columns:auto minmax(0,1fr);grid-template-areas:"pages copy" "act act";gap:1.6rem 2.4rem;align-items:center;' +
      '--py:clamp(1.5rem,3.4cqi,2.4rem);--px:clamp(1.5rem,4cqi,3rem);padding:var(--py) var(--px);border-radius:18px;background:#e5e5df;color:#0d1612;border:1px solid rgba(255,255,255,.9);' +
      'box-shadow:inset 0 1px 0 #fff,0 24px 60px rgba(13,22,18,.12);text-align:left}' +
    '.lm-pages{grid-area:pages;position:relative;width:196px;height:190px}.lm-card .lm-copy{grid-area:copy}.lm-card .lm-act{grid-area:act}' +
    // desktop: light story on the left, a black panel on the right with the Services hero drawing animating behind the form
    '@container (min-width:1000px){.lm-card{grid-template-columns:auto minmax(0,1fr) minmax(320px,360px);grid-template-areas:"pages copy act";gap:1.6rem 2.6rem;overflow:hidden}' +
      '.lm-card .lm-act{position:relative;isolation:isolate;overflow:hidden;align-self:stretch;display:flex;flex-direction:column;justify-content:center;' +
        'margin:calc(var(--py) * -1) calc(var(--px) * -1) calc(var(--py) * -1) 0;padding:var(--py) var(--px);background:#000}' +
      '.lm-card .lm-act::after{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,.35))}' +
      '.lm-act .lm-form input[type="email"]{background:#fff;border-color:#fff}' +
      '.lm-act .lm-bp{display:block}.lm-card .lm-act .rv-note{color:rgba(255,255,255,.66)}' +
      ':root body .lm-card .lm-act .btn-primary{background:#fff!important;color:#0d1612!important;border-color:#fff!important}' +
      ':root body .lm-card .lm-act .btn-primary:hover{background:#d9d9d3!important;border-color:#d9d9d3!important;box-shadow:none}}' +
    '.lm-bp{display:none;position:absolute!important;inset:0!important;z-index:-1;margin:0!important;width:auto!important;height:auto!important;aspect-ratio:auto!important;max-width:none!important;border-radius:0!important;box-shadow:none!important}' +
    '.lm-act .lm-bp.lm-bp{background-color:#000!important}' +
    '@container (max-width:700px){.lm-card{grid-template-columns:minmax(0,1fr);grid-template-areas:"pages" "copy" "act"}.lm-pages{width:166px;height:160px}.lm-pages img{width:108px!important}}' +
    // report pages: a neat overlapping pair that fans out a little on hover
    '.lm-pages img{position:absolute;top:8px;width:128px;height:auto;border-radius:4px;background:#fff;border:1px solid rgba(13,22,18,.08);' +
      'box-shadow:0 2px 4px rgba(13,22,18,.05),0 18px 36px rgba(13,22,18,.16);transition:transform .6s cubic-bezier(.22,1,.36,1)}' +
    '.lm-pages img:first-child{left:0;z-index:2;transform:rotate(-4deg)}.lm-pages img:last-child{right:0;z-index:1;transform:rotate(5deg) translateY(8px)}' +
    '@media (hover:hover){.lm-card:hover .lm-pages img:first-child{transform:rotate(-6deg) translateX(-4px)}.lm-card:hover .lm-pages img:last-child{transform:rotate(7deg) translate(4px,8px)}}' +
    '.lm-kicker{display:flex;align-items:center;gap:.6rem;margin-bottom:.7rem;font-size:.7rem;font-weight:600;letter-spacing:.22em;text-transform:uppercase;color:#775406}' +
    '.lm-kicker::before{content:"";width:22px;height:1px;background:currentColor}' +
    ':root body .lm-card h2{margin:0;font:500 clamp(1.5rem,2.7cqi,2.05rem)/1.15 var(--sans)!important;letter-spacing:-.03em;text-wrap:balance;max-width:20ch;color:#0d1612!important;text-align:left!important}' +
    // gold marker behind "free", same as the thank-you highlight
    '.lm-free{position:relative;isolation:isolate;padding:0 .14em 0 .08em;white-space:nowrap;font-style:italic}.lm-free::before{content:"";position:absolute;z-index:-1;inset:.16em -.04em .04em -.06em;background:#f2d35a;border-radius:2px}' +
    '.lm-card .lm-sub{margin:.75rem 0 0;color:#5a645e;font-size:.98rem;line-height:1.55;text-wrap:pretty}' +
    '.lm-form{display:flex;flex-direction:column;gap:.55rem}' +
    '.lm-form input[type="email"]{min-height:50px;padding:0 .95rem;font:400 1rem var(--sans);color:#0d1612;color-scheme:light;background:rgba(255,255,255,.75);' +
      'border:1px solid rgba(255,255,255,.95);border-radius:4px;box-shadow:inset 0 1px 0 #fff,0 6px 18px rgba(13,22,18,.06)}' +
    '.lm-form input[type="email"]::placeholder{color:#6a756f}.lm-form input[aria-invalid="true"]{border-color:#b3261e}' +
    // pages restyle .btn-primary, so pin the dark button of the home hero
    ':root body .lm-card .btn-primary{width:100%;max-width:none;min-height:50px;background:#0d1612!important;color:#fff!important;border:1px solid #0d1612!important}' +
    ':root body .lm-card .btn-primary:hover{background:#3a423e!important;border-color:#3a423e!important;transform:translateY(-1px);box-shadow:0 10px 24px rgba(13,22,18,.2)}' +
    '.lm-card :focus-visible,.lm-form input:focus{outline:2px solid #0b6b45;outline-offset:2px}' +
    '.lm-card .rv-note{margin:.2rem 0 0;color:#6a756f;font-size:.78rem;line-height:1.5;text-wrap:pretty}' +
    '.lm-done{display:flex;flex-direction:column;gap:.55rem}.lm-done p{margin:0;color:#0d1612;font-size:.95rem}' +
    '';
  document.head.appendChild(css);

  function formHTML() {
    return '<form class="lm-form" novalidate>' +
        '<label class="visually-hidden" for="lmEmail">Email address</label>' +
        '<input id="lmEmail" type="email" name="email" required maxlength="120" autocomplete="email" placeholder="you@company.com">' +
        '<input type="text" name="_honey" tabindex="-1" autocomplete="off" style="display:none" aria-hidden="true">' +
        '<button type="submit" class="btn btn-primary">Send me the free checklist</button>' +
        '<p class="rv-note" aria-live="polite">' + 'No spam. We\'ll use your email to personally reach out and explore how we can help.' + '</p>' +
      '</form>';
  }
  function showDownload(again) {
    var f = card.querySelector('.lm-form'); if (!f) return;
    f.outerHTML = '<div class="lm-done">' + (again || !SIGNUP_URL ? '' : '<p role="status">Sent. Check your inbox.</p>') +
      '<a class="btn btn-primary" href="' + PDF + '" download>' + (again ? 'Download' : 'Download now') + '</a></div>';
  }

  var bands = document.querySelectorAll('main .cta-band');
  var anchor = bands[bands.length - 1] || document.querySelector('footer.site-footer');
  if (!anchor) return;
  var sec = document.createElement('section');
  sec.className = 'alt lm-inline';
  sec.setAttribute('data-lm', 'inline');
  sec.setAttribute('aria-labelledby', 'lmTitle');
  sec.innerHTML = '<div class="lm-card">' +
      '<div class="lm-pages" aria-hidden="true"><img src="' + PAGES[0] + '" alt="" width="128" height="165" loading="lazy"><img src="' + PAGES[1] + '" alt="" width="128" height="165" loading="lazy"></div>' +
      '<div class="lm-copy"><span class="lm-kicker">Free download</span><h2 id="lmTitle">Get the Market Readiness Checklist for <em class="lm-free">free</em>.</h2>' +
      '<p class="lm-sub">20 questions to answer before you pitch to investors.</p></div>' +
      '<div class="lm-act"><div class="lm-bp" data-mode="hero" data-preset="device" data-cuts="ink" aria-hidden="true"></div>' + formHTML() + '</div></div>';
  anchor.parentNode.insertBefore(sec, anchor);
  var card = sec.querySelector('.lm-card');
  if (subscribed()) showDownload(true);

  /* ── Services hero drawing behind the form, mounted only once the desktop panel is showing ── */
  var bp = card.querySelector('.lm-bp');
  function mountBp() { window.ZKKBlueprint.mount(bp, 'lm'); }
  var ro = new ResizeObserver(function () {
    if (!bp.clientWidth) return;
    ro.disconnect();
    if (window.ZKKBlueprint) return mountBp();
    if (!document.querySelector('link[href^="/assets/blueprint.css"]')) {
      var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = '/assets/blueprint.css?v=7'; document.head.appendChild(l);
    }
    var js = document.createElement('script'); js.src = '/assets/blueprint.js?v=13'; js.onload = mountBp; document.body.appendChild(js);
  });
  ro.observe(bp);

  var io = new IntersectionObserver(function (es) {
    if (es[0].intersectionRatio >= 0.5) { io.disconnect(); Z.track('lead_magnet_view', { form_location: 'inline' }); }
  }, { threshold: 0.5 });
  io.observe(card);

  card.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target, input = f.querySelector('input[type="email"]'), btn = f.querySelector('button'), note = f.querySelector('.rv-note');
    input.value = input.value.trim();
    var ok = input.checkValidity() && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value);
    input.setAttribute('aria-invalid', ok ? 'false' : 'true');
    if (!ok) { input.setCustomValidity('Please enter a valid email address.'); input.reportValidity(); input.setCustomValidity(''); return; }
    if (f.querySelector('[name="_honey"]').value) return;
    var req;
    if (SIGNUP_URL) {   // text/plain keeps it a simple request, so Apps Script needs no CORS preflight
      req = fetch(SIGNUP_URL, { method: 'POST', body: JSON.stringify({ email: input.value, source: 'inline', page: path }) })
        .then(function (r) { return r.json(); }).then(function (j) { if (!j.ok) throw new Error(j.error); });
    } else {
      var data = new FormData();
      data.append('email', input.value);
      data.append('Lead magnet', 'Market Readiness Checklist (' + path + ')');
      data.append('_subject', 'New checklist signup from zkkconsulting.com');
      data.append('_template', 'table'); data.append('_captcha', 'false');
      req = fetch(ENDPOINT, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
        .then(function (r) { if (!r.ok) throw new Error(r.status); });
    }
    btn.disabled = true; btn.textContent = 'Sending…';
    req.then(function () {
      subscribe();
      Z.track('generate_lead', { lead_source: 'medtech_checklist', form_location: 'inline' });
      showDownload(false);
      card.querySelector('.lm-done a').focus();
    }).catch(function () {
      btn.disabled = false; btn.textContent = 'Send me the free checklist';
      note.setAttribute('role', 'alert'); note.textContent = 'That did not send. Please try again, or email info@zkkconsulting.com.';
    });
  });
})();
