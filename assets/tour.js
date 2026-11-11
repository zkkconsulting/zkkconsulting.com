/* Immersive report walkthrough.
   Scroll gestures do not scrub the animation. While the walkthrough is on screen,
   each gesture (wheel, swipe, arrow keys, space) plays exactly one step at a fixed
   speed; input during a step is ignored. After the last step the page scrolls on.
   Pages tilt inside their own perspective, so two pages can never cut through each other. */
(function () {
  var root = document.getElementById('tour');
  if (!root || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  var stage = root.querySelector('.tour-stage');
  var book = root.querySelector('.tour-book');
  var intro = root.querySelector('.tour-intro');
  var leaves = gsap.utils.toArray(root.querySelectorAll('.leaf'));
  var caps = gsap.utils.toArray(root.querySelectorAll('.tour-cap'));
  var nav = document.getElementById('nav');
  var still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var N = leaves.length, PW = 612, PH = 792, W = 0, H = 0, P = 1800;
  var STEP_TIME = still ? 0.5 : 1.9;  // seconds per step, whatever the scroll speed
  function narrow() { return innerWidth <= 860; }
  function vw(f) { return function () { return innerWidth * f; }; }
  function vh(f) { return function () { return innerHeight * f; }; }
  function rot(v) { return still ? 0 : v; }

  leaves.forEach(function (leaf, i) {
    var sheet = leaf.querySelector('.sheet');
    var r = sheet.dataset.rect.split(',').map(Number), hl = document.createElement('span');
    hl.className = 'sheet-hl';   // focus outline around the passage the caption describes
    hl.style.cssText = 'left:' + (r[0] / PW * 100) + '%;top:' + (r[1] / PH * 100) + '%;width:' + (r[2] / PW * 100) + '%;height:' + (r[3] / PH * 100) + '%';
    // lens: the page content zooms toward the outlined passage inside the paper frame
    var lens = document.createElement('div'); lens.className = 'sheet-lens';
    lens.appendChild(sheet.querySelector('img')); lens.appendChild(hl); sheet.appendChild(lens);
    gsap.set(lens, { transformOrigin: ((r[0] + r[2] / 2) / PW * 100) + '% ' + ((r[1] + r[3] / 2) / PH * 100) + '%' });
    var shade = document.createElement('span'); shade.className = 'leaf-shade'; sheet.appendChild(shade);
    leaf.style.zIndex = N - i;
    gsap.set([leaf, sheet], { transformPerspective: P });
    gsap.set(leaf, { autoAlpha: i ? 0 : 1 });
    var im = sheet.querySelector('img'); if (im.decode) im.decode().catch(function () {});
  });

  function size() {
    var navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
    H = Math.min((innerHeight - navH * .55) * .82, innerWidth * .84 * PH / PW); W = H * PW / PH;
    book.style.setProperty('--sw', W + 'px'); book.style.setProperty('--sh', H + 'px');
  }
  // phones: the clear space for the outlined passage is between the nav and the caption panel
  function band(i) {
    var navH = (document.getElementById('nav') || {}).offsetHeight || 60, top = navH + 12, bot = innerHeight - caps[i].offsetHeight - 16 - 14;
    return { mid: (top + bot) / 2, h: bot - top };
  }
  // y that puts the passage centre in that band when the page is shown at scale s
  function narrowY(i, s) {
    var r = leaves[i].querySelector('.sheet').dataset.rect.split(',').map(Number), k = W / PW;
    return band(i).mid - (book.offsetTop + H / 2) - (r[1] + r[3] / 2 - PH / 2) * k * s;
  }
  // phones: page scale that keeps the outlined passage (after the lens push L) inside the band
  function fit(i, base, L) {
    var r = leaves[i].querySelector('.sheet').dataset.rect.split(',').map(Number), k = W / PW;
    return Math.max(.4, Math.min(base, (band(i).h - 10) / (r[3] * k * L)));
  }
  function phonePose(i, base, L, extra) {
    return Object.assign({ scale: function () { return fit(i, base, L); }, y: function () { return narrowY(i, fit(i, base, L)); } }, extra || {});
  }
  function cam(i) {
    var r = leaves[i].querySelector('.sheet').dataset.rect.split(',').map(Number), k = W / PW;
    if (narrow()) {
      var z1 = Math.max(1, Math.min(innerWidth * .94 / (r[2] * k), (band(i).h - 10) / (r[3] * k), 2.2));
      return { scale: z1, x: -(r[0] + r[2] / 2 - PW / 2) * k * z1, y: narrowY(i, z1) };
    }
    // desktop: centre the passage in the open side, away from the caption card
    var f = side(i), z = Math.max(.9, Math.min((f.r - f.l) / (r[2] * k), innerHeight * .58 / (r[3] * k), 2.2));
    return { scale: z, x: (f.l + f.r) / 2 - innerWidth / 2 - (r[0] + r[2] / 2 - PW / 2) * k * z, y: -(r[1] + r[3] / 2 - PH / 2) * k * z };
  }
  // desktop: the horizontal span not taken by this step's caption card
  function side(i) {
    var c = caps[i], cl = c.offsetLeft, cr = cl + c.offsetWidth, gap = 40;
    return cl + c.offsetWidth / 2 < innerWidth / 2 ? { l: cr + gap, r: innerWidth - gap } : { l: gap, r: cl - gap };
  }
  // desktop cover step: slide the page only as far as needed so its outlined line clears the caption
  function riseX(i, L) {
    var r = leaves[i].querySelector('.sheet').dataset.rect.split(',').map(Number), k = W / PW, f = side(i);
    var cx = innerWidth / 2 + (r[0] + r[2] / 2 - PW / 2) * k, half = r[2] * k * L / 2 + 12;
    return Math.min(0, f.r - (cx + half)) + Math.max(0, f.l - (cx - half));
  }
  var poses = {
    zoom: function (i) { return { scale: function () { return cam(i).scale; }, x: function () { return cam(i).x; }, y: function () { return cam(i).y; } }; },
    side: function (i) { return narrow() ? phonePose(i, .74, 1.18) : { x: vw(-.2), scale: .9, rotationY: rot(14) }; },
    swing: function (i) { return narrow() ? phonePose(i, .8, 1.28, { rotationZ: rot(-3) }) : { x: vw(-.12), scale: .92, rotationY: rot(-20), rotationZ: rot(-3) }; },
    settle: function (i) { return narrow() ? phonePose(i, .8, 1.28, { rotationX: rot(6) }) : { x: vw(.14), scale: .86, rotationX: rot(8), rotationY: rot(-10) }; }
  };
  var rest = { x: 0, y: 0, scale: 1, rotationX: 0, rotationY: 0, rotationZ: 0 };

  size();
  var tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' } });
  tl.addLabel('s-1', 0);
  gsap.set(book, {
    x: function () { return narrow() ? 0 : innerWidth * .2; },
    y: function () {   // on phones, start the page just below the intro text (short Safari viewports used to overlap)
      if (!narrow()) return innerHeight * .04;
      var top = book.offsetTop + H * (1 - .72) / 2, ib = intro.offsetTop + intro.offsetHeight;
      return Math.max(innerHeight * .17, ib + 28 - top);
    },
    scale: function () { return narrow() ? .72 : .82; },
    transformOrigin: '50% 50%'   // upright beside the title, no tilt
  });
  tl.to(intro, { autoAlpha: 0, y: -40, duration: .7, ease: 'power1.in' }, 0)
    .to(book, { x: 0, y: 0, scale: 1, duration: 1.3, ease: 'power3.inOut' }, 0.1);

  leaves.forEach(function (leaf, i) {
    var sheet = leaf.querySelector('.sheet'), shade = sheet.querySelector('.leaf-shade'), hl = sheet.querySelector('.sheet-hl');
    var lens = sheet.querySelector('.sheet-lens');
    var cap = caps[i], move = cap.dataset.move, last = i === N - 1;
    var bars = cap.querySelectorAll('.tc-bar i'), sticks = cap.querySelectorAll('.tc-stick i');
    gsap.set(bars, { scaleX: 0 }); gsap.set(sticks, { scaleY: 0 });

    if (move !== 'rise') tl.to(sheet, Object.assign({ duration: 1.3 }, poses[move](i)), '>');
    else tl.to(sheet, narrow() ? Object.assign({ duration: .6 }, phonePose(i, 1, 1.28)) : { x: function () { return riseX(i, 1.28); }, duration: .6 }, '>');   // the cover's outlined line clears the caption
    tl.fromTo(cap, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: .55, ease: 'power3.out' }, move === 'rise' ? '>-0.3' : '>-0.45');
    tl.fromTo(hl, { autoAlpha: 0, scale: 1.04 }, { autoAlpha: 1, scale: 1, duration: .5, ease: 'power2.out' }, '<');
    if (bars.length) tl.to(bars, { scaleX: 1, duration: .7, stagger: .07, ease: 'power3.out' }, '>-0.2');
    if (sticks.length) tl.to(sticks, { scaleY: 1, duration: .7, stagger: .09, ease: 'power3.out' }, '>-0.2');
    // dynamic zoom: on non-zoom steps the content pushes in toward the outlined passage
    if (move !== 'zoom' && !still) tl.to(lens, { scale: move === 'side' ? 1.18 : 1.28, duration: 1.1, ease: 'power2.inOut' }, '>-0.3');
    tl.addLabel('s' + i);
    if (last) return;

    tl.to(cap, { autoAlpha: 0, y: -20, duration: .4, ease: 'power1.in' })
      .to(hl, { autoAlpha: 0, duration: .3, ease: 'none' }, '<')
      .to(sheet, Object.assign({ duration: 1 }, rest), '<')
      .to(lens, { scale: 1, duration: .8, ease: 'power2.inOut' }, '<')
      .set(leaves[i + 1], { autoAlpha: 1 }, '>-0.4');
    if (still) { tl.to(leaf, { autoAlpha: 0, duration: .6 }, '>-0.3'); return; }
    if (i % 2 === 0) {
      tl.to(leaf, { rotationY: -165, x: -10, duration: 1.2, ease: 'power2.inOut' }, '>-0.35')   // turn from the spine
        .to(shade, { opacity: 1, duration: .6, ease: 'power1.in' }, '<');
    } else {
      tl.to(leaf, { y: vh(-1.15), rotationX: 22, rotationZ: -5, duration: 1.2, ease: 'power2.in' }, '>-0.35'); // lift off the stack
    }
    tl.set(leaf, { autoAlpha: 0 });
  });

  // ── Stepped playback ──
  var idx = -1, busy = false, step = null;
  function play(to) {
    busy = true;
    step = tl.tweenTo('s' + to, { duration: Math.abs(to - idx) * STEP_TIME, ease: 'power1.inOut', onComplete: function () { busy = false; } });
    idx = to;
  }
  function go(dir) {
    if (busy) return;
    var to = idx + dir;
    if (to > N - 1) return leave(1);
    if (to < -1) return pin.start > 5 ? leave(-1) : undefined; // nothing above the walkthrough at the top of the page
    play(to);
  }
  var pin = ScrollTrigger.create({
    trigger: stage, start: 'top top', end: '+=15%', pin: true, anticipatePin: 1, onRefreshInit: size,
    onEnter: function (self) { lock(self.start + 1); },
    onEnterBack: function (self) { lock(self.end - 1); }
  });
  var saved = 0;
  function hold() { window.scrollTo(0, saved); }
  var intent = ScrollTrigger.observe({
    type: 'wheel,touch', tolerance: 12, preventDefault: true, wheelSpeed: -1,   // -1 makes wheel match touch: a finger swiping up moves forward
    onUp: function () { go(1); }, onDown: function () { go(-1); }
  });
  intent.disable();
  function lock(y) {
    if (intent.isEnabled) return;
    saved = y; hold();
    intent.enable();
    addEventListener('scroll', hold, { passive: true });
    document.body.classList.add('in-tour');
    if (nav) nav.classList.add('on-hero'); // transparent only while the walkthrough is pinned
  }
  function unlock() {
    intent.disable();
    removeEventListener('scroll', hold);
    document.body.classList.remove('in-tour');
    if (nav) nav.classList.remove('on-hero');
  }
  function leave(dir) {
    unlock();
    var next = root.nextElementSibling, navH = (document.getElementById('nav') || {}).offsetHeight || 0;
    var y = dir > 0 ? (next ? next.getBoundingClientRect().top + scrollY - navH : pin.end + 2) : Math.max(0, pin.start - innerHeight * .6);
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
  // Keys: Escape leaves the walkthrough on its finished state; back keys step back; any other key steps forward.
  function finish() { unlock(); if (step) step.kill(); busy = false; tl.progress(1); idx = N - 1; }
  var BACK = ['ArrowUp', 'ArrowLeft', 'PageUp', 'Backspace'];
  var IGNORE = /^(Tab|Shift|Control|Alt|Meta|CapsLock|Fn|ContextMenu|F\d{1,2}|Unidentified)$/;
  addEventListener('keydown', function (e) {
    if (!intent.isEnabled || e.metaKey || e.ctrlKey || e.altKey || IGNORE.test(e.key)) return;
    e.preventDefault();
    if (e.key === 'Escape' || e.key === 'Esc') { finish(); leave(1); return; }
    if (e.repeat) return;
    go(BACK.indexOf(e.key) > -1 ? -1 : 1);
  });
  // A click anywhere on the walkthrough (outside links and buttons) also steps forward.
  stage.addEventListener('click', function (e) {
    if (!intent.isEnabled || (e.target.closest && e.target.closest('a, button'))) return;
    go(1);
  });
  // Skip links jump past the walkthrough and land on the finished state.
  root.querySelectorAll('.tour-skip').forEach(function (a) {
    a.addEventListener('click', finish);
  });

  // The walkthrough opens the page, so lock straight away if we start inside it.
  requestAnimationFrame(function () { if (scrollY >= pin.start && scrollY < pin.end) lock(Math.max(scrollY, pin.start)); });
  addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
