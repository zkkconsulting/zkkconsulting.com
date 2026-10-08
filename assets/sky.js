/* Hero sky: northern-lights curtains + drifting nebulas + flowing lines + twinkling constellations + occasional shooting stars (2D canvas, sits above the 3D network, below the text) */
(function () {
  'use strict';
  var hero = document.querySelector('.page-hero');
  if (!hero) return;
  var cv = document.createElement('canvas');
  cv.className = 'hero-sky'; cv.setAttribute('aria-hidden', 'true');
  hero.insertBefore(cv, hero.firstChild.nextSibling);
  var lo = document.createElement('canvas'), lx = lo.getContext('2d'), LW, LH;   // low-res layer for the aurora/nebula: upscaling makes it soft for free
  var ctx = cv.getContext('2d'), W, H, dpr, cons = [], mt = [], arcs = [], stars = [], vis = true, next = 0;
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function build() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = hero.clientWidth; H = hero.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    LW = Math.ceil(W / 5); LH = Math.ceil(H / 5); lo.width = LW; lo.height = LH;
    cons = [];                                  // sparse faint dots + a few long sweeping arcs, like the mockup
    var nd = W < 761 ? 35 : 90;
    for (var i = 0; i < nd; i++) cons.push({ x: Math.random() * W, y: Math.random() * H, r: 0.5 + Math.random() * 0.9, o: 0.15 + Math.random() * 0.3 });
    mt = []; var nm = W < 761 ? 22 : 55;
    for (var j = 0; j < nm; j++) mt.push({ x: Math.random() * W, y: Math.random() * H, r: 0.7 + Math.random() * 1.6, v: 0.08 + Math.random() * 0.22, s: 0.2 + Math.random() * 0.6, p: Math.random() * 6.28, o: 0.2 + Math.random() * 0.35, c: Math.random() < 0.25 ? '255,211,107' : '170,255,220' });
    arcs = [];                                  // long straight-ish arcs removed: they read as a hard dividing line
  }

  function shoot() {
    var a = 0.45 + Math.random() * 0.3;         // down-right angle
    stars.push({ x: W * (0.2 + Math.random() * 0.8), y: H * Math.random() * 0.4, vx: Math.cos(a), vy: Math.sin(a), life: 0, max: 55 + Math.random() * 25, len: 70 + Math.random() * 60 });
  }

  // northern lights: wavy curtains of vertical streaks; nebulas: big slow radial clouds. Drawn additively at low res.
  var CURT = [[0.30, 0.22, '125,255,192', 0.0007, 1.0], [0.42, 0.18, '63,208,192', 0.0005, 2.1], [0.24, 0.14, '255,211,107', 0.0004, 3.3]];
  var NEB = [[0.78, 0.30, 0.50, '91,74,168', 0.10, 0.00011, 0], [0.18, 0.78, 0.45, '20,147,92', 0.16, 0.00009, 2], [0.88, 0.86, 0.40, '185,138,42', 0.14, 0.00010, 4]];
  function sky(t) {
    lx.globalCompositeOperation = 'source-over'; lx.clearRect(0, 0, LW, LH);
    lx.globalCompositeOperation = 'lighter';
    NEB.forEach(function (n) {
      var cx = (n[0] + Math.sin(t * n[5] * 1000 + n[6]) * 0.06) * LW, cy = (n[1] + Math.cos(t * n[5] * 1000 + n[6]) * 0.05) * LH, r = n[2] * LW;
      var g = lx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, 'rgba(' + n[3] + ',' + n[4] + ')'); g.addColorStop(1, 'rgba(' + n[3] + ',0)');
      lx.fillStyle = g; lx.fillRect(0, 0, LW, LH);
    });
    CURT.forEach(function (c, ci) {
      var step = 1, hh = c[1] * LH;
      for (var x = 0; x < LW; x += step) {
        var u = x / LW, ph = t * 1000 * c[3] * 6;
        var y = c[0] * LH + Math.sin(u * 5 + ph + c[4]) * LH * 0.07 + Math.sin(u * 11 - ph * 1.7) * LH * 0.025;
        var a = (0.5 + 0.5 * Math.sin(u * 3.2 + ph * 1.3 + c[4] * 2)) * (0.5 + 0.5 * Math.sin(u * 7.5 - ph * 2));   // brightness varies along the curtain
        a = a * a * 0.17;
        var g = lx.createLinearGradient(0, y - hh * 0.35, 0, y + hh);
        g.addColorStop(0, 'rgba(' + c[2] + ',0)'); g.addColorStop(0.25, 'rgba(' + c[2] + ',' + a + ')'); g.addColorStop(1, 'rgba(' + c[2] + ',0)');
        lx.fillStyle = g; lx.fillRect(x, y - hh * 0.35, step, hh * 1.35);
      }
    });
  }
  var lastSky = -1;
  function flow(t) {                           // thin lines drifting across the sky, alternating direction and tint
    ctx.lineWidth = 1;
    for (var k = 0; k < 5; k++) {
      var dir = k % 2 ? -1 : 1, gold = k === 3, rgb = gold ? '255,226,160' : '160,255,215';
      var base = H * (0.2 + k * 0.14), amp = H * (0.03 + (k % 4) * 0.014), f = 0.0032 - (k % 5) * 0.0003, ph = dir * t * (0.16 + (k % 5) * 0.05);
      var g = ctx.createLinearGradient(0, 0, W, 0), al = (gold ? 0.06 : 0.075) - k * 0.003;
      g.addColorStop(0, 'rgba(' + rgb + ',0)'); g.addColorStop(0.5, 'rgba(' + rgb + ',' + al + ')'); g.addColorStop(1, 'rgba(' + rgb + ',0)');
      ctx.strokeStyle = g; ctx.beginPath();
      for (var x = 0; x <= W; x += 16) { var y = base + Math.sin(x * f + ph + k) * amp + Math.sin(x * f * 2.3 - ph * 1.4) * amp * 0.4; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke();
    }
  }
  // stock-chart lines: dark price series that scroll left, with random-walk drift and sudden spikes up and down
  var STOCKS = false, STEP = 14, SER = [[0.74, 0.09, 0.9, 38], [0.58, 0.07, 0.55, 26], [0.88, 0.06, 0.4, 20]]; // [baseline y, amplitude, line alpha, px/sec]
  var series = [], lastT = 0;
  function seed() {
    series = SER.map(function (c) {
      var n = Math.ceil(W / STEP) + 4, pts = [], v = 0;
      for (var i = 0; i < n; i++) { v = nextVal(v); pts.push(v); }
      return { pts: pts, off: 0, v: v };
    });
  }
  function nextVal(v) {
    v = v * 0.96 + (Math.random() - 0.5) * 0.5;                    // mean-reverting wander
    if (Math.random() < 0.05) v += (Math.random() < 0.5 ? -1 : 1) * (0.8 + Math.random() * 1.2);   // spike
    return Math.max(-2.2, Math.min(2.2, v));
  }
  function stocks(t, dt) {
    ctx.save();
    ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(0,18,10,0.16)';     // faint dark grid
    for (var gy = 1; gy < 6; gy++) { ctx.beginPath(); ctx.setLineDash([2, 6]); ctx.moveTo(0, H * gy / 6); ctx.lineTo(W, H * gy / 6); ctx.stroke(); }
    ctx.setLineDash([]);
    series.forEach(function (s, k) {
      var c = SER[k], base = H * c[0], amp = H * c[1];
      if (!still) { s.off += c[3] * dt; while (s.off >= STEP) { s.off -= STEP; s.v = nextVal(s.v); s.pts.shift(); s.pts.push(s.v); } }
      var xy = function (i) { return [i * STEP - s.off, base - s.pts[i] * amp]; };
      ctx.beginPath();
      for (var i = 0; i < s.pts.length; i++) { var p = xy(i); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }
      ctx.lineJoin = 'round'; ctx.strokeStyle = 'rgba(0,16,9,' + (c[2] * 0.5) + ')'; ctx.lineWidth = k ? 1.2 : 1.8; ctx.stroke();
      var last = xy(s.pts.length - 1);                             // soft dark area under the line
      ctx.lineTo(last[0], H); ctx.lineTo(-s.off, H); ctx.closePath();
      var g = ctx.createLinearGradient(0, base - amp * 2.2, 0, H);
      g.addColorStop(0, 'rgba(0,16,9,' + (c[2] * 0.14) + ')'); g.addColorStop(1, 'rgba(0,16,9,0)');
      ctx.fillStyle = g; ctx.fill();
    });
    ctx.restore();
  }
  function shafts(t) {                         // slow diagonal light shafts that sweep and breathe
    for (var k = 0; k < 3; k++) {
      var cx = W * (0.25 + k * 0.28) + Math.sin(t * 0.05 + k * 2) * W * 0.08, wd = W * (0.07 + k * 0.02), al = 0.025 + 0.02 * Math.sin(t * 0.13 + k * 1.7);
      ctx.save(); ctx.translate(cx, -H * 0.1); ctx.rotate(0.38);
      var g = ctx.createLinearGradient(-wd, 0, wd, 0);
      g.addColorStop(0, 'rgba(160,255,215,0)'); g.addColorStop(0.5, 'rgba(160,255,215,' + al + ')'); g.addColorStop(1, 'rgba(160,255,215,0)');
      ctx.fillStyle = g; ctx.fillRect(-wd, 0, wd * 2, H * 1.5); ctx.restore();
    }
  }
  function motes(t) {                          // glowing dust slowly rising and swaying
    for (var i = 0; i < mt.length; i++) {
      var m = mt[i];
      m.y -= m.v; if (m.y < -10) { m.y = H + 10; m.x = Math.random() * W; }
      var x = m.x + Math.sin(t * m.s + m.p) * 22, al = m.o * (0.55 + 0.45 * Math.sin(t * m.s * 2 + m.p));
      ctx.fillStyle = 'rgba(' + m.c + ',' + al + ')'; ctx.beginPath(); ctx.arc(x, m.y, m.r, 0, 6.28); ctx.fill();
    }
  }

  function frame(now) {
    requestAnimationFrame(frame);
    if (!vis) return;
    ctx.clearRect(0, 0, W, H);
    var tw = still ? 12 : now / 1000;
    if (now - lastSky > 45) { sky(tw); lastSky = now; }     // ~22fps is plenty for slow light
    ctx.imageSmoothingEnabled = true; ctx.drawImage(lo, 0, 0, W, H);
    shafts(tw);
    var dt = Math.min(0.1, Math.max(0, (now - lastT) / 1000)); lastT = now;
    if (STOCKS) stocks(tw, dt); else flow(tw);
    motes(tw);
    arcs.forEach(function (c, i) {
      var g = ctx.createLinearGradient(c[0], 0, c[6], 0);
      g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.6, 'rgba(255,255,255,' + (i ? 0.07 : 0.1) + ')'); g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.strokeStyle = g; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(c[0], c[1]); ctx.bezierCurveTo(c[2], c[3], c[4], c[5], c[6], c[7]); ctx.stroke();
    });
    cons.forEach(function (p, i) { ctx.fillStyle = 'rgba(255,255,255,' + (p.o * (0.6 + 0.4 * Math.sin(tw * 1.3 + i))) + ')'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.28); ctx.fill(); });
    if (!still && now > next) { shoot(); next = now + 4500 + Math.random() * 5000; }
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

  build(); seed();
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { build(); seed(); }, 300); });
  if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { vis = e[0].isIntersecting; }).observe(hero);
  next = 1500; requestAnimationFrame(frame);
})();
