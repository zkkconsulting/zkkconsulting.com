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

  /* Scroll reveal removed: content is visible on load. */
  if (animate) document.body.classList.add('js-anim');

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
      return !x.classList.contains('page-hero') && !x.classList.contains('tour') && x.id !== 'contact' && !x.classList.contains('cta-band') && !x.classList.contains('legal-item');
    });
    var pio = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (e.isIntersecting && !e.target.querySelector(':scope > .bg-paths')) buildPaths(e.target, secs.indexOf(e.target) % 2);
        e.target.classList.toggle('is-off', !e.isIntersecting);
      });
    }, { rootMargin: '150px' });
    secs.forEach(function (x) { pio.observe(x); });
  }

  // Progress bar and section rail removed so the nav is the only bar at the top.
  window.ZKK.buildRail = window.ZKK.railLayout = function () {};

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

/* ── Quiet scroll reveal (new components only): fade and rise once, staggered within a group ── */
(function () {
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var groups = ['.h-tiles > *', '.h-prices > *', '.h-steps > *', '.h-people > *', '.pz-grid > *', '.pz-caps > *', '.pz-terms > *', '.smp-grid > *', '.tm-grid > *', '.ig-grid > *', '.ig-list > *', '.pz-bundles > *', '.ig-feature',
                'section.hs > h2', '.h-patent', '.pz-patent', '.pz-table', '.smp-sec > h2', '.pz-sec > h2'];
  var els = document.querySelectorAll(groups.join(','));
  if (!els.length) return;
  document.documentElement.classList.add('rv-on');
  els.forEach(function (el) {
    var i = Array.prototype.indexOf.call(el.parentNode.children, el);
    el.classList.add('rv');
    el.style.setProperty('--rv-d', Math.min(i, 6) * 0.06 + 's');
  });
  var io = new IntersectionObserver(function (en) {
    en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' });
  els.forEach(function (el) { io.observe(el); });
})();

/* ── Home: the first downward scroll from the top glides off the hero into the first section ── */
(function () {
  var hero = document.querySelector('body.home .hero-paper'), next = document.getElementById('research');
  if (!hero || !next) return;
  var busy = false, ty = 0;
  function target() { var nav = document.getElementById('nav'); return next.getBoundingClientRect().top + scrollY - (nav ? nav.offsetHeight : 0); }
  function glide(e) {
    if (busy || scrollY > 8) return;
    if (e && e.cancelable) e.preventDefault();
    busy = true;
    window.scrollTo({ top: target(), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    setTimeout(function () { busy = false; }, 900);
  }
  addEventListener('wheel', function (e) { if (e.deltaY > 6) glide(e); }, { passive: false });
  addEventListener('touchstart', function (e) { ty = e.touches[0].clientY; }, { passive: true });
  addEventListener('touchmove', function (e) { if (ty - e.touches[0].clientY > 14) glide(e); }, { passive: false });
  addEventListener('keydown', function (e) { if (['ArrowDown', 'PageDown', ' '].indexOf(e.key) > -1 && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) glide(e); });
  var cue = hero.querySelector('.hero-scroll');
  if (cue) cue.addEventListener('click', function (e) { e.preventDefault(); e.stopImmediatePropagation(); busy = false; window.scrollTo({ top: target(), behavior: 'smooth' }); }, true);
})();

/* ── Home: leaving the hero animates (headline lifts, video pushes in), the next section slides over it ── */
(function () {
  var hero = document.querySelector('body.home .hero-paper');
  if (!hero || !window.gsap || !window.ScrollTrigger || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  gsap.registerPlugin(ScrollTrigger);
  var tl = gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: .6 } });
  tl.to(hero.querySelector('.page-hero-inner'), { y: -80, autoAlpha: 0, ease: 'none' }, 0)
    .to(hero.querySelector('.hero-vid'), { scale: 1.12, filter: 'blur(2px) grayscale(.3)', ease: 'none' }, 0);
})();
