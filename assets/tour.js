/* 3D scroll tour through a sample report. Scroll position drives a camera that
   flies through a stack of pages and frames the area each step talks about. */
(function () {
  var root = document.getElementById('tour');
  if (!root) return;
  var stage = root.querySelector('.tour-stage');
  var world = root.querySelector('.tour-world');
  var pages = [].slice.call(root.querySelectorAll('.tour-page'));
  var steps = [].slice.call(root.querySelectorAll('.tour-step'));
  var bar = root.querySelector('.tour-bar i');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var P = 1400, PW = 612, PH = 792, GAP = 1100;

  // Page positions: a gentle S-curve receding into depth.
  var pos = pages.map(function (_, i) {
    return { x: Math.sin(i * 0.85) * 340, y: Math.cos(i * 0.6) * 50 - 25, z: -i * GAP };
  });
  pages.forEach(function (el, i) {
    el.style.transform = 'translate3d(' + pos[i].x + 'px,' + pos[i].y + 'px,' + pos[i].z + 'px)';
  });

  // Highlight boxes, one per step that targets a page region.
  var hls = steps.map(function (s) {
    if (!s.dataset.rect) return null;
    var r = s.dataset.rect.split(',').map(Number), pg = pages[+s.dataset.page];
    var hl = document.createElement('div');
    hl.className = 'tour-hl';
    hl.style.cssText = 'left:' + r[0] + 'px;top:' + r[1] + 'px;width:' + r[2] + 'px;height:' + r[3] + 'px';
    pg.appendChild(hl);
    return hl;
  });

  var cams = [];
  function buildCams() {
    var w = stage.clientWidth, h = stage.clientHeight, mid = (pages.length - 1) / 2;
    cams = steps.map(function (s, k) {
      if (s.dataset.rect) {
        var i = +s.dataset.page, r = s.dataset.rect.split(',').map(Number);
        var sc = Math.min(w * 0.84 / r[2], h * 0.7 / r[3], 2.2);
        return { x: pos[i].x + r[0] + r[2] / 2 - PW / 2, y: pos[i].y + r[1] + r[3] / 2 - PH / 2, z: pos[i].z,
                 d: P / sc, rx: 4, ry: k % 2 ? -7 : 7, fz: pos[i].z };
      }
      // Overview: the whole stack from the side.
      var fit = Math.min(w / 900, h / 1100);
      return { x: pos[1].x - 560, y: 0, z: -1.3 * GAP, d: 1.3 * GAP + 1.25 * P / fit, rx: 6, ry: -18, fz: GAP };
    });
  }

  function lerp(a, b, t) { return a + (b - a) * t; }
  function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  var target = 0, cur = 0, active = -1, raf = 0;
  function readScroll() {
    var r = root.getBoundingClientRect(), span = root.offsetHeight - innerHeight;
    var p = Math.min(Math.max(-r.top / span, 0), 1);
    if (bar) bar.style.width = (p * 100) + '%';
    var f = p * (steps.length - 1), i = Math.floor(f), t = f - i;
    // Hold on each step for the first 35% of its slice, then fly to the next.
    target = Math.min(i + ease(Math.min(Math.max((t - 0.35) / 0.65, 0), 1)), steps.length - 1);
    if (reduce) target = Math.round(f);
  }

  function render() {
    cur = reduce ? target : lerp(cur, target, 0.14);
    if (Math.abs(cur - target) < 0.0005) cur = target;
    var i = Math.floor(cur), t = cur - i, a = cams[i], b = cams[Math.min(i + 1, cams.length - 1)];
    var swing = Math.sin(Math.PI * t); // pull back and bank mid-flight
    var c = {
      x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), z: lerp(a.z, b.z, t), fz: lerp(a.fz, b.fz, t),
      d: lerp(a.d, b.d, t) + swing * 700,
      rx: lerp(a.rx, b.rx, t) + swing * 6, ry: lerp(a.ry, b.ry, t) + swing * (b.ry > a.ry ? 10 : -10)
    };
    world.style.transform = 'translateZ(' + (P - c.d) + 'px) rotateX(' + c.rx + 'deg) rotateY(' + c.ry + 'deg) translate3d(' + (-c.x) + 'px,' + (-c.y) + 'px,' + (-c.z) + 'px)';
    // Pages between the camera and its target fade away as it passes them.
    pages.forEach(function (el, k) {
      var ahead = pos[k].z - c.fz; // > 0 means in front of the plane the camera is aiming at
      var o = ahead > 0 ? 1 - ahead / (GAP * 0.7) : 1 + ahead / (GAP * 6);
      o = Math.max(0, Math.min(1, o));
      el.style.opacity = o.toFixed(3);
      el.style.visibility = o < 0.01 ? 'hidden' : 'visible';
    });
    var now = Math.round(cur);
    if (now !== active) {
      steps.forEach(function (s, k) { s.classList.toggle('on', k === now); });
      hls.forEach(function (h, k) { if (h) h.classList.toggle('on', k === now); });
      active = now;
    }
    raf = cur !== target ? requestAnimationFrame(render) : 0;
  }
  function kick() {
    var r = root.getBoundingClientRect();
    document.body.classList.toggle('in-tour', r.top <= 0 && r.bottom >= innerHeight);
    readScroll(); if (!raf) raf = requestAnimationFrame(render);
  }

  buildCams();
  addEventListener('scroll', kick, { passive: true });
  addEventListener('resize', function () { buildCams(); kick(); });
  readScroll(); cur = target; render();
})();
