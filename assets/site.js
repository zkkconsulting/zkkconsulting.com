/* ═══════════════════════════════════════════════════════════════════
   ZKK Consulting LLC — shared site behaviour (v5)
   Nav shrink, mobile menu, scroll reveal, smooth anchors.
   Nothing on the site depends on this file to be readable.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
    document.documentElement.classList.add('js');

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGSAP = typeof window.gsap !== 'undefined';
  var hasST = hasGSAP && typeof window.ScrollTrigger !== 'undefined';
  var animate = hasGSAP && !reduceMotion;
  if (hasST) gsap.registerPlugin(ScrollTrigger);

  window.ZKK = { reduceMotion: reduceMotion, animate: animate, hasST: hasST };



  /* ── HERO LOGOS: continuous conveyor belt (track duplicated for a seamless loop) ── */
  (function () {
    var row = document.querySelector('.page-hero .logo-row');
    if (!row) return;
    var imgs = Array.prototype.slice.call(row.querySelectorAll('img'));
    if (imgs.length < 3) return;
    var track = document.createElement('div'); track.className = 'logo-track';
    imgs.concat(imgs.map(function (im) { var c = im.cloneNode(true); c.setAttribute('aria-hidden', 'true'); c.alt = ''; return c; }))
        .forEach(function (im) { track.appendChild(im); });
    row.appendChild(track); row.classList.add('is-belt');
  })();

  /* ── FAQ: smooth open/close for <details> ── */
  document.querySelectorAll('.faq-item').forEach(function (d) {
    var sum = d.querySelector('summary'), ans = d.querySelector('.faq-answer');
    if (!sum || !ans) return;
    var anim = null;
    sum.addEventListener('click', function (e) {
      if (reduceMotion || !d.animate) return;
      e.preventDefault();
      if (anim) anim.cancel();
      var opening = !d.open;
      var startH = d.offsetHeight;
      if (opening) d.open = true;
      var endH = opening ? sum.offsetHeight + ans.offsetHeight + (parseFloat(getComputedStyle(d).borderTopWidth) || 0) * 2 : sum.offsetHeight + (parseFloat(getComputedStyle(d).borderTopWidth) || 0) * 2;
      d.style.overflow = 'hidden';
      anim = d.animate({ height: [startH + 'px', endH + 'px'] }, { duration: 380, easing: 'cubic-bezier(.22,.8,.3,1)' });
      ans.animate({ opacity: opening ? [0, 1] : [1, 0], transform: opening ? ['translateY(-6px)', 'none'] : ['none', 'translateY(-6px)'] }, { duration: 320, easing: 'ease' });
      anim.onfinish = anim.oncancel = function () { if (!opening) d.open = false; d.style.overflow = ''; anim = null; };
    });
  });

  /* ── SCROLL REVEAL ── */
  if (animate) {
        document.body.classList.add('js-anim');
    gsap.set('.fade-up', { clearProps: 'opacity,transform' }); // release the CSS-based hide; GSAP now owns these props
    gsap.set('.fade-up', { opacity: 0, y: 26 });
    if (hasST) {
      ScrollTrigger.batch('.fade-up', {
        start: 'top 88%',
        onEnter: function (els) {
          gsap.to(els, { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out', stagger: 0.07, overwrite: true, clearProps: 'transform,willChange' });
        }
      });
      ScrollTrigger.refresh();
    } else {
      gsap.to('.fade-up', { opacity: 1, y: 0, duration: 0.8, stagger: 0.08 });
    }
  }

  /* ── REVEAL SAFETY NET: refresh trigger positions after load, and un-hide anything that is on screen but still hidden ── */
  if (animate) {
    var fixHidden = function () {
      var vh = window.innerHeight;
      document.querySelectorAll('.fade-up').forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < vh && r.bottom > 0 && parseFloat(getComputedStyle(el).opacity) < 0.05) gsap.to(el, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', overwrite: true, clearProps: 'transform' });
      });
    };
    var fixT = 0;
    window.addEventListener('scroll', function () { clearTimeout(fixT); fixT = setTimeout(fixHidden, 220); }, { passive: true });
    window.addEventListener('load', function () { if (hasST) ScrollTrigger.refresh(); setTimeout(function () { if (hasST) ScrollTrigger.refresh(); fixHidden(); }, 600); });
  }

  /* ── STABLE PAGE HEIGHT: measure each section once so content-visibility never changes the page length mid-scroll ── */
  (function () {
    var secs = Array.prototype.slice.call(document.querySelectorAll('main section:not(.page-hero):not(.deck-slide)'));
    function measure() {
      secs.forEach(function (x) { x.style.contentVisibility = 'visible'; });
      var hs = secs.map(function (x) { return x.getBoundingClientRect().height; });
      secs.forEach(function (x, i) { if (hs[i] > 0) x.style.containIntrinsicSize = 'auto ' + Math.round(hs[i]) + 'px'; x.style.contentVisibility = ''; });
      window.__maxAt = 0; if (window.ZKK) window.ZKK.page = Date.now();
    }
    var t = 0;
    window.addEventListener('load', function () { setTimeout(measure, 300); });
    window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(measure, 400); });
  })();

  /* ── NAV SHRINK ── */
  var nav = document.getElementById('nav');
  var homeHero = document.querySelector('.page-hero');
  var isHome = document.body.classList.contains('hero-pg');
  if (nav) {
    if (isHome) nav.classList.add('hero-home');
    var navLogo = nav.querySelector('.nav-logo');
    if (isHome && homeHero && navLogo) { var hl = navLogo.cloneNode(true); hl.classList.add('hero-logo'); hl.setAttribute('tabindex', '-1'); hl.setAttribute('aria-hidden', 'true'); homeHero.appendChild(hl); }
    var onScroll = function () {
      var y = window.pageYOffset || document.documentElement.scrollTop;
      var sh = y > 30, oh = isHome ? y < 8 : (homeHero ? y < heroLimit : false); /* flips as the logo docks */
      var li = y > logoPass; if (li !== lastLogo) { nav.classList.toggle('logo-in', li); lastLogo = li; }
      if (sh !== lastShrink) { nav.classList.toggle('shrink', sh); lastShrink = sh; }
      if (homeHero && oh !== lastOnHero) { nav.classList.toggle('on-hero', oh); lastOnHero = oh; }
    };
    var lastShrink = null, lastOnHero = null, lastLogo = null, heroLimit = 0, logoPass = 0;
    var measureHero = function () { heroLimit = homeHero ? homeHero.offsetHeight - nav.offsetHeight : 0; var hl = homeHero && homeHero.querySelector('.hero-logo'); logoPass = hl && hl.offsetParent ? hl.offsetTop + hl.offsetHeight - nav.offsetHeight * 0.6 : 0; onScroll(); };
    window.addEventListener('resize', measureHero);
    window.addEventListener('load', measureHero);
    setTimeout(measureHero, 0);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── AURORA LAYER (hero, CTA band, footer): compositor-only blobs, paused offscreen ── */
  var hosts = document.querySelectorAll('.page-hero, .cta-band, footer');
  hosts.forEach(function (h) {
    if (h.querySelector(':scope > .aurora')) return;
    var d = document.createElement('div'); d.className = 'aurora'; d.setAttribute('aria-hidden', 'true');
    d.innerHTML = '<i></i><i></i><i></i><i></i><i></i>';
    h.insertBefore(d, h.firstChild);
  });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { e.target.classList.toggle('is-off', !e.isIntersecting); });
    });
    hosts.forEach(function (h) { io.observe(h); });
  }

  /* ── SPOTLIGHT CARDS: glow follows cursor on the hovered card only ── */
  var glassSel = '.card, .faq-item, .terms-item, .spotlight, .review-card';
  document.addEventListener('pointermove', function (e) {
    var el = e.target.closest && e.target.closest(glassSel);
    if (!el) return;
    var r = el.getBoundingClientRect();
    el.style.setProperty('--cx', (e.clientX - r.left) + 'px');
    el.style.setProperty('--cy', (e.clientY - r.top) + 'px');
  }, { passive: true });

  /* ── BACKGROUND PATHS: flowing white lines in each content section (built when first seen) ── */
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var NS = 'http://www.w3.org/2000/svg';
    var buildPaths = function (sec, flip) {
      var svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('class', 'bg-paths'); svg.setAttribute('viewBox', '0 0 696 316');
      svg.setAttribute('preserveAspectRatio', 'xMidYMid slice'); svg.setAttribute('aria-hidden', 'true');
      [1, -1].forEach(function (pos) {
        for (var i = 0; i < 9; i++) {
          var k = i * 4, o = 380 - k * 5 * pos;
          var path = document.createElementNS(NS, 'path');
          path.setAttribute('d', 'M-' + o + ' -' + (189 + k * 6) + 'C-' + o + ' -' + (189 + k * 6) + ' -' + (312 - k * 5 * pos) + ' ' + (216 - k * 6) + ' ' + (152 - k * 5 * pos) + ' ' + (343 - k * 6) + 'C' + (616 - k * 5 * pos) + ' ' + (470 - k * 6) + ' ' + (684 - k * 5 * pos) + ' ' + (875 - k * 6) + ' ' + (684 - k * 5 * pos) + ' ' + (875 - k * 6));
          path.setAttribute('pathLength', '1');
          path.setAttribute('stroke-width', (0.3 + i * 0.035).toFixed(2));
          path.setAttribute('stroke-opacity', (0.07 + i * 0.016).toFixed(3));
          path.style.setProperty('--d', (28 + ((i * 7 + (pos > 0 ? 3 : 11)) % 17)) + 's');
          path.style.animationDelay = '-' + ((i * 2.3) % 20).toFixed(1) + 's';
          svg.appendChild(path);
        }
      });
      if (flip) svg.style.transform = 'scaleX(-1)';
      sec.insertBefore(svg, sec.firstChild);
    };
    var secs = Array.prototype.slice.call(document.querySelectorAll('main section:not(.deck-slide)')).filter(function (x) {
      return !x.classList.contains('page-hero') && x.id !== 'contact' && !x.classList.contains('cta-band') && !x.classList.contains('legal-item');
    });
    var pio = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (e.isIntersecting && !e.target.querySelector(':scope > .bg-paths')) buildPaths(e.target, secs.indexOf(e.target) % 2);
        e.target.classList.toggle('is-off', !e.isIntersecting);
      });
    }, { rootMargin: '150px' });
    secs.forEach(function (x) { pio.observe(x); });
  }

  /* ── SCROLL PROGRESS BAR ── */
  var bar = document.createElement('div'); bar.className = 'scroll-progress'; bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);
  var pr = 0;
  window.addEventListener('scroll', function () {
    if (pr) return;
    pr = requestAnimationFrame(function () {
      pr = 0;
      var h = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, (window.pageYOffset || 0) / h) : 0) + ')';
    });
  }, { passive: true });

  /* ── SECTION RAIL: progress line + clickable dots, on every page (desktop) ── */
  var railIO = null, railEl = null, railSecs = [], railDots = [], railLabel = null, lastLabel = -2;
  function buildRail() {
    if (!('IntersectionObserver' in window)) return;
    if (railEl) railEl.remove();
    if (railIO) railIO.disconnect();
    var secs = Array.prototype.slice.call(document.querySelectorAll('main section:not(.deck-slide)')).filter(function (x) {
      return !x.classList.contains('page-hero') && !x.closest('[hidden]') && x.getBoundingClientRect().height > 60;
    });
    if (secs.length < 2) return;
    railEl = document.createElement('div'); railEl.className = 'scroll-rail'; railEl.setAttribute('aria-label', 'Sections');
    var dots = secs.map(function (sec) {
      var a = document.createElement('a'); a.href = '#'; a.setAttribute('role', 'button');
      var lab = sec.querySelector('.section-label, h2, h1');
      var span = document.createElement('span'); span.textContent = lab ? lab.textContent.trim() : 'Section';
      a.setAttribute('aria-label', span.textContent); a.appendChild(span);
      a.addEventListener('mousedown', function (e) { e.preventDefault(); }); // mouse clicks don't focus the dot, so no stuck focus ring (keyboard focus still works)
      a.addEventListener('click', function (e) { e.preventDefault(); scrollToTarget(sec); });
      railEl.appendChild(a); return a;
    });
    document.body.appendChild(railEl);
    railSecs = secs; railDots = dots;
    railLabel = document.createElement('div'); railLabel.className = 'rail-label'; railLabel.setAttribute('aria-hidden', 'true'); railEl.appendChild(railLabel);
    setRailProgress();
    if (window.ZKK && window.ZKK.railLayout) window.ZKK.railLayout();
  }
  var rp = 0, maxScroll = 0, maxAt = 0;
  function setRailProgress() {
    if (!railEl || !railSecs.length) return;
    var n = railSecs.length, mid = innerHeight * 0.4, idx = -1, frac = 0;
    for (var k = 0; k < n; k++) {
      var r = railSecs[k].getBoundingClientRect();
      if (r.top <= mid) { idx = k; frac = Math.max(0, Math.min(1, (mid - r.top) / Math.max(r.height, 1))); } else break;
    }
    var p = idx < 0 ? 0 : (idx >= n - 1 ? 1 : (idx + frac) / (n - 1));
    railEl.style.setProperty('--p', p.toFixed(3));
    var pos = p * (n - 1);
    if (idx < 0) { var ft = railSecs[0].getBoundingClientRect().top; pos = -1 + Math.max(0, Math.min(1, 1 - (ft - mid) / innerHeight)); }
    if (railLabel) { var li = idx < 0 ? -1 : idx; if (li !== lastLabel) { lastLabel = li; railLabel.textContent = li < 0 ? '' : railDots[li].getAttribute('aria-label'); railLabel.classList.remove('swap'); void railLabel.offsetWidth; railLabel.classList.add('swap'); } }
    for (var j = 0; j < n; j++) {
      var f = Math.max(0, Math.min(1, pos - j + 1));          // 0 -> 1 as the line approaches then reaches the dot
      var act = Math.max(0, 1 - Math.abs(pos - j));            // bell shape around the dot
      railDots[j].style.setProperty('--f', f.toFixed(3));
      railDots[j].style.setProperty('--a', act.toFixed(3));
    }
  }
  window.addEventListener('scroll', function () { if (!rp) rp = requestAnimationFrame(function () { rp = 0; setRailProgress(); }); }, { passive: true });
  buildRail();
  window.ZKK.buildRail = buildRail;
  (function () {
    var nv = document.getElementById('nav'); if (!nv) return;
    var mark = nv.querySelector('.nav-mark'), ham = nv.querySelector('.hamburger');
    function setH() {
      var root = document.documentElement.style;
      root.setProperty('--navh', nv.offsetHeight + 'px');
      if (!mark || !ham || window.innerWidth > 700) return;
      var a = mark.getBoundingClientRect(), b = ham.getBoundingClientRect();
      var avail = Math.max(80, b.left - a.right - 28), n = railDots.length || 8;
      root.setProperty('--rail-x', ((a.right + b.left) / 2).toFixed(1) + 'px');
      root.setProperty('--rail-w', Math.min(avail - 32, 28 + n * 16).toFixed(0) + 'px');
    }
    setH();
    if ('ResizeObserver' in window) new ResizeObserver(setH).observe(nv);
    window.addEventListener('resize', setH);
    nv.addEventListener('transitionend', setH);
    window.addEventListener('load', function () { setH(); setTimeout(setH, 400); });
    window.ZKK.railLayout = setH;
  })();

  /* ── SMOOTH SCROLL + HASH ── */
  var navH = 72;
  var scrollRaf = 0;
  function stopScroll() { if (scrollRaf) { cancelAnimationFrame(scrollRaf); scrollRaf = 0; document.documentElement.style.scrollBehavior = ''; document.documentElement.classList.remove('sj'); } }
  ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(function (ev) { window.addEventListener(ev, stopScroll, { passive: true }); });
  // one eased scroll that re-reads the target every frame, so late layout shifts (lazy sections, fade-ins) can't make it jerk or overshoot
  function scrollToTarget(target) {
    stopScroll();
    function want() { return Math.max(0, target.getBoundingClientRect().top + window.pageYOffset - navH + 1); }
    document.documentElement.classList.add('sj'); // render every section at its real height while scrolling, so the target can't move under us
    var from = window.pageYOffset || 0;
    if (reduceMotion) { window.scrollTo({ top: want(), behavior: 'instant' }); document.documentElement.classList.remove('sj'); return; }
    document.documentElement.style.scrollBehavior = 'auto'; // CSS smooth-scroll would turn every frame into its own animation and fight the next one
    var t0 = performance.now(), dur = Math.min(1500, 650 + Math.abs(want() - from) * 0.3);
    (function step(now) {
      var p = Math.min(1, (now - t0) / dur), e = p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; // easeInOutCubic
      window.scrollTo({ top: from + (want() - from) * e, behavior: 'instant' });
      if (p < 1) scrollRaf = requestAnimationFrame(step); else { scrollRaf = 0; document.documentElement.style.scrollBehavior = ''; document.documentElement.classList.remove('sj'); }
    })(t0);
  }
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (ev) {
      var id = link.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      ev.preventDefault();
      scrollToTarget(target);
      if (history.pushState) history.pushState(null, '', id);
      else window.location.hash = id;
    });
  });
  window.addEventListener('popstate', function () {
    var h = window.location.hash;
    if (h && h.length > 1) { var t = document.querySelector(h); if (t && !t.classList.contains('pf-anchor')) scrollToTarget(t); }
  });
  if (window.location.hash && window.location.hash.length > 1) {
    var initTarget = document.querySelector(window.location.hash);
    if (initTarget && !initTarget.classList.contains('pf-anchor')) window.setTimeout(function () { scrollToTarget(initTarget); }, 60);
  }

  /* ── MOBILE MENU ── */
  var hamburger = document.getElementById('hamburger');
  var mobileMenu = document.getElementById('mobileMenu');
  if (hamburger && mobileMenu) {
    var closeMenu = function () {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };
    hamburger.addEventListener('click', function () {
      var open = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    var mc = document.getElementById('mobileClose');
    if (mc) mc.addEventListener('click', closeMenu);
    document.querySelectorAll('.mobile-link').forEach(function (l) { l.addEventListener('click', closeMenu); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
  }

  /* ── ACTIVE IN-PAGE NAV LINK ── */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-links a[href^="#"]'));
  var sections = navLinks.map(function (a) { return document.querySelector(a.getAttribute('href')); }).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    var navObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var id = e.target.id;
          navLinks.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + id); });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { navObs.observe(s); });
  }
})();
