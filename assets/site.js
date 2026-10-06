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



  /* ── MOBILE HERO LOGOS: continuous conveyor belt (track duplicated for a seamless loop) ── */
  (function () {
    var row = document.querySelector('.page-hero .logo-row');
    if (!row || !window.matchMedia('(max-width: 700px)').matches) return;
    var imgs = Array.prototype.slice.call(row.querySelectorAll('img'));
    if (imgs.length < 3) return;
    var track = document.createElement('div'); track.className = 'logo-track';
    imgs.concat(imgs.map(function (im) { var c = im.cloneNode(true); c.setAttribute('aria-hidden', 'true'); c.alt = ''; return c; }))
        .forEach(function (im) { track.appendChild(im); });
    row.appendChild(track); row.classList.add('is-belt');
  })();

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

  /* ── NAV SHRINK ── */
  var nav = document.getElementById('nav');
  var homeHero = document.querySelector('.page-hero');
  if (nav) {
    var onScroll = function () {
      var y = window.pageYOffset || document.documentElement.scrollTop;
      var sh = y > 30, oh = homeHero ? y < heroLimit : false;
      if (sh !== lastShrink) { nav.classList.toggle('shrink', sh); lastShrink = sh; }
      if (homeHero && oh !== lastOnHero) { nav.classList.toggle('on-hero', oh); lastOnHero = oh; }
    };
    var lastShrink = null, lastOnHero = null, heroLimit = 0;
    var measureHero = function () { heroLimit = homeHero ? homeHero.offsetHeight - nav.offsetHeight : 0; onScroll(); };
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
      var h = (window.__maxScroll && Date.now() - window.__maxAt < 1000) ? window.__maxScroll : (window.__maxScroll = document.documentElement.scrollHeight - innerHeight, window.__maxAt = Date.now(), window.__maxScroll);
      bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, (window.pageYOffset || 0) / h) : 0) + ')';
    });
  }, { passive: true });

  /* ── SECTION RAIL: progress line + clickable dots, on every page (desktop) ── */
  var railIO = null, railEl = null;
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
      a.addEventListener('click', function (e) { e.preventDefault(); if (window.ZKK && window.ZKK.lenis) window.ZKK.lenis.scrollTo(sec, { duration: 1.1 }); else sec.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' }); });
      railEl.appendChild(a); return a;
    });
    document.body.appendChild(railEl);
    railIO = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) dots.forEach(function (d, i) { d.classList.toggle('on', secs[i] === e.target); }); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    secs.forEach(function (x) { railIO.observe(x); });
    setRailProgress();
  }
  var rp = 0, maxScroll = 0, maxAt = 0;
  function setRailProgress() {
    if (!railEl) return;
    if (!maxScroll || Date.now() - maxAt > 1000) { maxScroll = document.documentElement.scrollHeight - innerHeight; maxAt = Date.now(); }
    railEl.style.setProperty('--p', maxScroll > 0 ? Math.min(1, (window.pageYOffset || 0) / maxScroll).toFixed(3) : 0);
  }
  window.addEventListener('scroll', function () { if (!rp) rp = requestAnimationFrame(function () { rp = 0; setRailProgress(); }); }, { passive: true });
  buildRail();
  window.ZKK.buildRail = buildRail;
  (function () { var nv = document.getElementById('nav'); if (!nv) return; function setH() { document.documentElement.style.setProperty('--navh', nv.offsetHeight + 'px'); } setH(); if ('ResizeObserver' in window) new ResizeObserver(setH).observe(nv); window.addEventListener('resize', setH); })();

  /* ── SMOOTH SCROLL + HASH ── */
  var navH = 72;
  function scrollToTarget(target) {
    var y = target.getBoundingClientRect().top + window.pageYOffset - navH + 1;
    if (window.ZKK && window.ZKK.lenis) window.ZKK.lenis.scrollTo(y, { duration: 1.1 });
    else window.scrollTo({ top: y, behavior: reduceMotion ? 'auto' : 'smooth' });
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
    if (h && h.length > 1) { var t = document.querySelector(h); if (t) scrollToTarget(t); }
  });
  if (window.location.hash && window.location.hash.length > 1) {
    var initTarget = document.querySelector(window.location.hash);
    if (initTarget) window.setTimeout(function () { scrollToTarget(initTarget); }, 60);
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
