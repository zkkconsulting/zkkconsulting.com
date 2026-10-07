/* Hero sky: twinkling constellations + occasional shooting stars (2D canvas, sits above the 3D network, below the text) */
(function () {
  'use strict';
  var hero = document.querySelector('.page-hero');
  if (!hero) return;
  var cv = document.createElement('canvas');
  cv.className = 'hero-sky'; cv.setAttribute('aria-hidden', 'true');
  hero.insertBefore(cv, hero.firstChild.nextSibling);
  var ctx = cv.getContext('2d'), W, H, dpr, cons = [], arcs = [], stars = [], vis = true, next = 0;
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function build() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = hero.clientWidth; H = hero.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cons = [];                                  // sparse faint dots + a few long sweeping arcs, like the mockup
    var nd = W < 761 ? 35 : 90;
    for (var i = 0; i < nd; i++) cons.push({ x: Math.random() * W, y: Math.random() * H, r: 0.5 + Math.random() * 0.9, o: 0.15 + Math.random() * 0.3 });
    arcs = [[-.05, .93, .2, .87, .5, .5, 1.05, .07], [-.05, 1.08, .3, .93, .6, .7, 1.05, .28], [.1, 1.2, .4, .95, .7, .45, 1.05, -.1]].map(function (a) {
      return a.map(function (v, i) { return v * (i % 2 ? H : W); });
    });
  }

  function shoot() {
    var a = 0.45 + Math.random() * 0.3;         // down-right angle
    stars.push({ x: W * (0.2 + Math.random() * 0.8), y: H * Math.random() * 0.4, vx: Math.cos(a), vy: Math.sin(a), life: 0, max: 55 + Math.random() * 25, len: 70 + Math.random() * 60 });
  }

  function frame(now) {
    requestAnimationFrame(frame);
    if (!vis) return;
    ctx.clearRect(0, 0, W, H);
    var tw = now / 1000;
    arcs.forEach(function (c, i) {
      var g = ctx.createLinearGradient(c[0], 0, c[6], 0);
      g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.6, 'rgba(255,255,255,' + (i ? 0.07 : 0.1) + ')'); g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.strokeStyle = g; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(c[0], c[1]); ctx.bezierCurveTo(c[2], c[3], c[4], c[5], c[6], c[7]); ctx.stroke();
    });
    cons.forEach(function (p) { ctx.fillStyle = 'rgba(255,255,255,' + p.o + ')'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.28); ctx.fill(); });
    if (!still && now > next) { shoot(); next = now + 9000 + Math.random() * 9000; }
    stars = stars.filter(function (s) { return s.life < s.max; });
    stars.forEach(function (s) {
      var f = s.life / s.max, sp = 9, hx = s.x + s.vx * s.life * sp, hy = s.y + s.vy * s.life * sp;
      var tx = hx - s.vx * s.len, ty = hy - s.vy * s.len, al = Math.sin(f * Math.PI);
      var g = ctx.createLinearGradient(tx, ty, hx, hy);
      g.addColorStop(0, 'rgba(255,211,107,0)'); g.addColorStop(1, 'rgba(255,226,160,' + al * 0.14 + ')');
      ctx.strokeStyle = g; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(hx, hy); ctx.stroke();
      s.life++;
    });
  }

  build();
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(build, 300); });
  if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { vis = e[0].isIntersecting; }).observe(hero);
  next = 1500; requestAnimationFrame(frame);
})();
