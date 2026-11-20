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
    '.lm-inline{padding:clamp(2rem,5vw,3.5rem) var(--edge,6vw)!important}' +
    '.lm-card{max-width:1120px;margin:0 auto;display:grid;grid-template-columns:auto 1fr minmax(280px,400px);gap:1.6rem 2.4rem;align-items:center;' +
      'padding:1.6rem 2rem;border-radius:18px;background:#e5e5df;color:#0d1612;border:1px solid rgba(255,255,255,.9);' +
      'box-shadow:inset 0 1px 0 #fff,0 24px 60px rgba(13,22,18,.12);text-align:left}' +
    '.lm-pages{display:flex;gap:.7rem}' +
    '.lm-pages img{width:120px;height:auto;border-radius:3px;background:#fff;box-shadow:0 1px 0 rgba(13,22,18,.08),0 14px 30px rgba(13,22,18,.2)}' +
    '.lm-kicker{display:block;margin-bottom:.45rem;font-size:.72rem;font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:#775406}' +
    ':root body .lm-card h2{margin:0;font:600 clamp(1.35rem,2.2vw,1.75rem)/1.15 var(--sans)!important;letter-spacing:-.02em;color:#0d1612!important;text-align:left!important}' +
    '.lm-card .lm-sub{margin:.5rem 0 0;color:#4a554f;font-size:1rem;line-height:1.5}' +
    '.lm-form{display:flex;flex-direction:column;gap:.55rem}' +
    '.lm-form input[type="email"]{min-height:50px;padding:0 .95rem;font:400 1rem var(--sans);color:#0d1612;color-scheme:light;background:rgba(255,255,255,.75);' +
      'border:1px solid rgba(255,255,255,.95);border-radius:4px;box-shadow:inset 0 1px 0 #fff,0 6px 18px rgba(13,22,18,.06)}' +
    '.lm-form input[type="email"]::placeholder{color:#6a756f}.lm-form input[aria-invalid="true"]{border-color:#b3261e}' +
    // pages restyle .btn-primary, so pin the dark button of the home hero
    ':root body .lm-card .btn-primary{width:100%;max-width:none;min-height:50px;background:#0d1612!important;color:#fff!important;border:1px solid #0d1612!important}' +
    ':root body .lm-card .btn-primary:hover{background:#0b4a32!important;border-color:#0b4a32!important;transform:translateY(-1px);box-shadow:0 10px 24px rgba(13,22,18,.2)}' +
    '.lm-card :focus-visible,.lm-form input:focus{outline:2px solid #0b6b45;outline-offset:2px}' +
    '.lm-card .rv-note{margin:.1rem 0 0;color:#6a756f;font-size:.75rem}' +
    '.lm-done{display:flex;flex-direction:column;gap:.55rem}.lm-done p{margin:0;color:#0d1612;font-size:.95rem}' +
    '@media (max-width:960px){.lm-card{grid-template-columns:auto 1fr}.lm-card .lm-act{grid-column:1/-1}}' +
    '@media (max-width:600px){.lm-card{grid-template-columns:1fr;padding:1.3rem}.lm-pages{max-width:300px}.lm-pages img{width:calc(50% - .35rem)}}';
  document.head.appendChild(css);

  function formHTML() {
    return '<form class="lm-form" novalidate>' +
        '<label class="visually-hidden" for="lmEmail">Email address</label>' +
        '<input id="lmEmail" type="email" name="email" required maxlength="120" autocomplete="email" placeholder="you@company.com">' +
        '<input type="text" name="_honey" tabindex="-1" autocomplete="off" style="display:none" aria-hidden="true">' +
        '<button type="submit" class="btn btn-primary">Send me the checklist</button>' +
        '<p class="rv-note" aria-live="polite">' + (SIGNUP_URL ? 'We email you the PDF. No spam.' : 'No spam. Unsubscribe anytime.') + '</p>' +
      '</form>';
  }
  function showDownload(again) {
    var f = card.querySelector('.lm-form'); if (!f) return;
    f.outerHTML = '<div class="lm-done">' + (again || !SIGNUP_URL ? '' : '<p role="status">Sent. Check your inbox.</p>') +
      '<a class="btn btn-primary" href="' + PDF + '" download>' + (again ? 'Download again' : 'Download now') + '</a></div>';
  }

  var bands = document.querySelectorAll('main .cta-band');
  var anchor = bands[bands.length - 1] || document.querySelector('footer.site-footer');
  if (!anchor) return;
  var sec = document.createElement('section');
  sec.className = 'alt lm-inline';
  sec.setAttribute('data-lm', 'inline');
  sec.setAttribute('aria-labelledby', 'lmTitle');
  sec.innerHTML = '<div class="lm-card">' +
      '<div class="lm-pages" aria-hidden="true"><img src="' + PAGES[0] + '" alt="" width="120" height="155" loading="lazy"><img src="' + PAGES[1] + '" alt="" width="120" height="155" loading="lazy"></div>' +
      '<div><span class="lm-kicker">Free checklist</span><h2 id="lmTitle">Get the free Market Readiness Checklist when you sign up with your email.</h2>' +
      '<p class="lm-sub">20 questions to answer before you pitch to investors.</p></div>' +
      '<div class="lm-act">' + formHTML() + '</div></div>';
  anchor.parentNode.insertBefore(sec, anchor);
  var card = sec.querySelector('.lm-card');
  if (subscribed()) showDownload(true);

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
      btn.disabled = false; btn.textContent = 'Send me the checklist';
      note.setAttribute('role', 'alert'); note.textContent = 'That did not send. Please try again, or email info@zkkconsulting.com.';
    });
  });
})();
