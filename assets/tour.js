/* Immersive report walkthrough (GSAP + ScrollTrigger, scrubbed and pinned).
   Each page zooms until the paper fills the screen, a caption floats in, then the
   page zooms back out and turns like a real sheet to reveal the next one. */
(function () {
  var root = document.getElementById('tour');
  if (!root || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  var stage = root.querySelector('.tour-stage');
  var book = root.querySelector('.tour-book');
  var intro = root.querySelector('.tour-intro');
  var leaves = gsap.utils.toArray(root.querySelectorAll('.leaf'));
  var caps = gsap.utils.toArray(root.querySelectorAll('.tour-cap'));
  var bar = root.querySelector('.tour-progress i');
  var still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var N = leaves.length, PW = 612, PH = 792, W = 0, H = 0;
  var narrow = function () { return innerWidth <= 860; };

  leaves.forEach(function (leaf, i) {
    var sheet = leaf.querySelector('.sheet'), r = sheet.dataset.rect.split(',').map(Number);
    var hl = document.createElement('span');
    hl.className = 'sheet-hl';
    hl.style.cssText = 'left:' + (r[0] / PW * 100) + '%;top:' + (r[1] / PH * 100) + '%;width:' + (r[2] / PW * 100) + '%;height:' + (r[3] / PH * 100) + '%';
    sheet.appendChild(hl);
    var shade = document.createElement('span'); shade.className = 'leaf-shade'; sheet.appendChild(shade);
    leaf.style.zIndex = N - i;
    var im = sheet.querySelector('img'); if (im.decode) im.decode().catch(function () {});
  });

  function size() {
    var navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
    H = Math.min((innerHeight - navH * .55) * .84, innerWidth * .86 * PH / PW); W = H * PW / PH;
    book.style.setProperty('--sw', W + 'px'); book.style.setProperty('--sh', H + 'px');
  }
  // Zoom so the passage is centered and the paper covers the whole screen.
  function cam(i) {
    var r = leaves[i].querySelector('.sheet').dataset.rect.split(',').map(Number), k = W / PW;
    var cover = Math.max(innerWidth / W, innerHeight / H) * 1.04;
    var fitW = innerWidth * (narrow() ? .94 : .8) / (r[2] * k);
    var z = Math.min(Math.max(cover, Math.min(fitW, innerHeight * .5 / (r[3] * k))), 3.6);
    // Phones: never crop the passage sideways just to fill the screen.
    if (narrow()) z = Math.min(z, Math.max(fitW, innerWidth / W * 1.02));
    var ox = (r[0] + r[2] / 2 - PW / 2) * k * z, oy = (r[1] + r[3] / 2 - PH / 2) * k * z;
    var mx = Math.max(0, W * z / 2 - innerWidth / 2), my = Math.max(0, H * z / 2 - innerHeight / 2);
    return { scale: z, x: gsap.utils.clamp(-mx, mx, -ox), y: gsap.utils.clamp(-my, my, -oy + (narrow() ? -innerHeight * .08 : 0)) };
  }

  size();
  var tl = gsap.timeline({
    defaults: { ease: 'power2.inOut' },
    scrollTrigger: {
      trigger: stage, start: 'top top', end: function () { return '+=' + innerHeight * N * 2; },
      pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true,
      onRefreshInit: size,
      onToggle: function (st) { document.body.classList.toggle('in-tour', st.isActive); },
      onUpdate: function (st) { if (bar) bar.style.transform = 'scaleX(' + st.progress.toFixed(4) + ')'; }
    }
  });

  // Opening: the cover sits tilted beside the title, then swings flat to center.
  gsap.set(book, {
    x: function () { return narrow() ? 0 : innerWidth * .2; },
    y: function () { return narrow() ? innerHeight * .2 : 0; },
    scale: function () { return narrow() ? .62 : .86; },
    rotationY: still ? 0 : -16, rotationX: still ? 0 : 6
  });
  tl.to(intro, { autoAlpha: 0, y: -40, duration: .7, ease: 'power1.in' }, 0)
    .to(book, { x: 0, y: 0, scale: 1, rotationY: 0, rotationX: 0, duration: 1.1 }, 0);

  leaves.forEach(function (leaf, i) {
    var sheet = leaf.querySelector('.sheet'), hl = sheet.querySelector('.sheet-hl'), shade = sheet.querySelector('.leaf-shade');
    var cap = caps[i], last = i === N - 1;
    tl.to(sheet, { scale: function () { return cam(i).scale; }, x: function () { return cam(i).x; }, y: function () { return cam(i).y; }, duration: 1.5 }, i ? '>' : '-=0.35')
      .to(hl, { autoAlpha: 1, duration: .45, ease: 'none' }, '-=0.5')
      .fromTo(cap, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: .6, ease: 'power3.out' }, '-=0.55')
      .to({}, { duration: .9 });
    if (last) return;
    tl.to(cap, { autoAlpha: 0, y: -24, duration: .45, ease: 'power1.in' })
      .to(hl, { autoAlpha: 0, duration: .3, ease: 'none' }, '<')
      .to(sheet, { scale: 1, x: 0, y: 0, duration: 1.2 }, '<');
    if (still) tl.to(leaf, { autoAlpha: 0, duration: .6 });
    else tl.to(leaf, { rotationY: -170, x: -8, duration: 1.3, ease: 'power2.inOut' }, '-=0.1')
           .to(shade, { opacity: 1, duration: .65, ease: 'power1.in' }, '<')
           .set(leaf, { autoAlpha: 0 });
  });

  addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
