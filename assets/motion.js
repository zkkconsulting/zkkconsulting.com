/* Site motion (GSAP): eased anchor scrolling, card entrances, bottom buttons. Loaded after site.js on every page.
   Stepped playback: every animation plays once at a fixed duration when it enters view, never scrubbed. */
(function () {
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger, window.ScrollToPlugin);
  gsap.defaults({ duration: 0.5, ease: 'power2.out' });
  ScrollTrigger.config({ ignoreMobileResize: true });   // no re-measure when the phone URL bar hides

  // hand the cards over from the CSS reveal to GSAP
  document.documentElement.classList.remove('rv-on');
  document.querySelectorAll('.rv').forEach(function (el) { el.classList.remove('rv'); });

  // pause the CSS line/aurora loops while the page moves (see gsap-sample.css)
  var root = document.documentElement, idle = 0;
  window.addEventListener('scroll', function () {
    if (!idle) root.classList.add('is-scrolling');
    clearTimeout(idle);
    idle = setTimeout(function () { root.classList.remove('is-scrolling'); idle = 0; }, 140);
  }, { passive: true });

  // site.js settles section heights after load; re-measure trigger points once then
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });

  var mm = gsap.matchMedia();
  mm.add({ motion: '(prefers-reduced-motion: no-preference)', hover: '(hover: hover)' }, function (ctx) {
    if (!ctx.conditions.motion) return;   // reduced motion: everything stays as plain CSS

    /* ── Scrolling: one eased tween per anchor jump, length scales with distance, any user input cancels it ── */
    if (window.ScrollToPlugin) {
      var nav = document.querySelector('nav');
      document.addEventListener('click', function (e) {
        var a = e.target.closest && e.target.closest('a[href^="#"]');
        if (!a || a.getAttribute('href').length < 2) return;
        var t = document.querySelector(a.getAttribute('href'));
        if (!t) return;
        e.preventDefault(); e.stopImmediatePropagation();
        var dist = Math.abs(t.getBoundingClientRect().top);
        gsap.to(window, { duration: gsap.utils.clamp(0.45, 1.1, dist / 2500), ease: 'power3.inOut', overwrite: true,
          scrollTo: { y: t, offsetY: nav ? nav.offsetHeight + 12 : 0, autoKill: true } });
        history.replaceState(null, '', a.getAttribute('href'));
      }, true);
    }

    /* ── Text boxes: short rise + fade, staggered per row, started before they reach the fold ── */
    var boxes = gsap.utils.toArray('.pkg, .h-tile, .h-patent, .pz-patent, .h-steps > li, .h-person, #reviews .rw-card, .pz-caps > li, .pz-terms > li, .pz-bundles > li, .smp-grid > *, .tm-grid > *, .ig-grid > *, .ig-list > *, .ig-feature, .pz-table');
    gsap.set(boxes, { autoAlpha: 0, y: 18, force3D: true, transition: 'none' });
    ScrollTrigger.batch(boxes, {
      start: 'top 96%', once: true, interval: 0.05, batchMax: 4,
      onEnter: function (els) {
        gsap.to(els, { autoAlpha: 1, y: 0, stagger: 0.06, overwrite: true, clearProps: 'transform,opacity,visibility,transition,will-change' });
      }
    });

    // How it works: icon chips pop in just after their card
    var icos = gsap.utils.toArray('.h-steps .h-ico');
    gsap.set(icos, { scale: 0.6, autoAlpha: 0 });
    ScrollTrigger.batch(icos, { start: 'top 96%', once: true,
      onEnter: function (els) { gsap.to(els, { scale: 1, autoAlpha: 1, duration: 0.45, ease: 'back.out(2)', delay: 0.15, stagger: 0.06, clearProps: 'transform,opacity,visibility' }); } });

    /* ── Buttons at the bottom: CTA band, then footer icons in sequence ── */
    if (document.querySelector('.cta-band')) gsap.from('.cta-band .cta-headline, .cta-band .btn', { autoAlpha: 0, y: 14, stagger: 0.08, clearProps: 'transform,opacity,visibility',
      scrollTrigger: { trigger: '.cta-band', start: 'top 92%', once: true } });

    if (document.querySelector('.footer-pills')) gsap.from('.footer-pills > a', { autoAlpha: 0, scale: 0.7, duration: 0.4, ease: 'back.out(1.7)', stagger: 0.05,
      clearProps: 'transform,opacity,visibility',
      scrollTrigger: { trigger: '.footer-pills', start: 'top 98%', once: true } });

    // hover: small lift on every bottom button (mouse only), one reusable tween per button
    if (ctx.conditions.hover) {
      gsap.utils.toArray('.cta-band .btn, .footer-pills > a').forEach(function (b) {
        var lift = gsap.to(b, { y: -3, scale: 1.05, duration: 0.2, ease: 'power2.out', paused: true });
        b.addEventListener('mouseenter', function () { lift.play(); });
        b.addEventListener('mouseleave', function () { lift.reverse(); });
      });
    }
  });
})();
