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
  var still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var N = leaves.length, PW = 612, PH = 792, W = 0, H = 0, P = 1800;
  var STEP_TIME = still ? 0.5 : 1.9;  // seconds per step, whatever the scroll speed
  function narrow() { return innerWidth <= 860; }
  function vw(f) { return function () { return innerWidth * f; }; }
  function vh(f) { return function () { return innerHeight * f; }; }
  function rot(v) { return still ? 0 : v; }

  leaves.forEach(function (leaf, i) {
    var sheet = leaf.querySelector('.sheet');
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
  function cam(i) {
    var r = leaves[i].querySelector('.sheet').dataset.rect.split(',').map(Number), k = W / PW;
    var z = Math.max(1.15, Math.min(innerWidth * (narrow() ? .94 : .78) / (r[2] * k), innerHeight * .58 / (r[3] * k), 2.2));
    return { scale: z, x: -(r[0] + r[2] / 2 - PW / 2) * k * z, y: -(r[1] + r[3] / 2 - PH / 2) * k * z - (narrow() ? innerHeight * .1 : 0) };
  }
  var poses = {
    zoom: function (i) { return { scale: function () { return cam(i).scale; }, x: function () { return cam(i).x; }, y: function () { return cam(i).y; } }; },
    side: function () { return narrow() ? { y: vh(-.2), scale: .6 } : { x: vw(-.2), scale: .9, rotationY: rot(14) }; },
    swing: function () { return narrow() ? { y: vh(-.14), scale: .7, rotationZ: rot(-4) } : { x: vw(-.12), scale: .92, rotationY: rot(-20), rotationZ: rot(-3) }; },
    settle: function () { return narrow() ? { y: vh(-.14), scale: .7, rotationX: rot(8) } : { x: vw(.14), scale: .86, rotationX: rot(8), rotationY: rot(-10) }; }
  };
  var rest = { x: 0, y: 0, scale: 1, rotationX: 0, rotationY: 0, rotationZ: 0 };

  size();
  var tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' } });
  tl.addLabel('s-1', 0);
  gsap.set(book, {
    x: function () { return narrow() ? 0 : innerWidth * .2; },
    y: function () { return narrow() ? innerHeight * .2 : innerHeight * .04; },
    scale: function () { return narrow() ? .58 : .82; },
    rotationX: rot(48), rotationY: rot(-12), transformOrigin: '50% 100%'
  });
  tl.to(intro, { autoAlpha: 0, y: -40, duration: .7, ease: 'power1.in' }, 0)
    .to(book, { x: 0, y: 0, scale: 1, rotationX: 0, rotationY: 0, duration: 1.4, ease: 'power3.out' }, 0.1);

  leaves.forEach(function (leaf, i) {
    var sheet = leaf.querySelector('.sheet'), shade = sheet.querySelector('.leaf-shade');
    var cap = caps[i], move = cap.dataset.move, last = i === N - 1;
    var bars = cap.querySelectorAll('.tc-bar i'), sticks = cap.querySelectorAll('.tc-stick i');
    gsap.set(bars, { scaleX: 0 }); gsap.set(sticks, { scaleY: 0 });

    if (move !== 'rise') tl.to(sheet, Object.assign({ duration: 1.3 }, poses[move](i)), '>');
    tl.fromTo(cap, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: .55, ease: 'power3.out' }, move === 'rise' ? '>-0.3' : '>-0.45');
    if (bars.length) tl.to(bars, { scaleX: 1, duration: .7, stagger: .07, ease: 'power3.out' }, '>-0.2');
    if (sticks.length) tl.to(sticks, { scaleY: 1, duration: .7, stagger: .09, ease: 'power3.out' }, '>-0.2');
    tl.addLabel('s' + i);
    if (last) return;

    tl.to(cap, { autoAlpha: 0, y: -20, duration: .4, ease: 'power1.in' })
      .to(sheet, Object.assign({ duration: 1 }, rest), '<')
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
  var idx = -1, busy = false;
  function play(to) {
    busy = true;
    tl.tweenTo('s' + to, { duration: Math.abs(to - idx) * STEP_TIME, ease: 'power1.inOut', onComplete: function () { busy = false; } });
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
    trigger: stage, start: 'top top', end: '+=60%', pin: true, anticipatePin: 1, onRefreshInit: size,
    onEnter: function (self) { lock(self.start + 1); },
    onEnterBack: function (self) { lock(self.end - 1); }
  });
  var saved = 0;
  function hold() { window.scrollTo(0, saved); }
  var intent = ScrollTrigger.observe({
    type: 'wheel,touch', tolerance: 12, preventDefault: true,
    onDown: function () { go(1); }, onUp: function () { go(-1); }
  });
  intent.disable();
  function lock(y) {
    if (intent.isEnabled) return;
    saved = y; hold();
    intent.enable();
    addEventListener('scroll', hold, { passive: true });
    document.body.classList.add('in-tour');
  }
  function unlock() {
    intent.disable();
    removeEventListener('scroll', hold);
    document.body.classList.remove('in-tour');
  }
  function leave(dir) {
    unlock();
    var next = root.nextElementSibling, navH = (document.getElementById('nav') || {}).offsetHeight || 0;
    var y = dir > 0 ? (next ? next.getBoundingClientRect().top + scrollY - navH : pin.end + 2) : Math.max(0, pin.start - innerHeight * .6);
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
  addEventListener('keydown', function (e) {
    if (!intent.isEnabled) return;
    var down = ['ArrowDown', 'PageDown', ' ', 'Spacebar'].indexOf(e.key) > -1;
    var up = ['ArrowUp', 'PageUp'].indexOf(e.key) > -1;
    if (!down && !up) return;
    e.preventDefault(); go(down ? 1 : -1);
  });
  // Skip links jump past the walkthrough and land on the finished state.
  root.querySelectorAll('.tour-skip').forEach(function (a) {
    a.addEventListener('click', function () { unlock(); tl.progress(1); idx = N - 1; });
  });

  // The walkthrough opens the page, so lock straight away if we start inside it.
  requestAnimationFrame(function () { if (scrollY >= pin.start && scrollY < pin.end) lock(Math.max(scrollY, pin.start)); });
  addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
