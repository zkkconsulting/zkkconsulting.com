/* Sample-report scroll tour. Scroll position maps straight to each sheet's
   transform (no easing lag), so the motion is exactly as smooth as the scroll. */
(function () {
  var root = document.getElementById('tour');
  if (!root) return;
  var track = root.querySelector('.tour-track');
  var desk = root.querySelector('.tour-desk');
  var sheets = [].slice.call(root.querySelectorAll('.sheet'));
  var caps = [].slice.call(root.querySelectorAll('.tour-c'));
  var bar = root.querySelector('.tour-bar i');
  var still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var N = sheets.length, PW = 612, PH = 792;
  var W = 0, H = 0, DW = 0, DH = 0, zoom = [];

  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function seg(t, a, b) { return ease(clamp((t - a) / (b - a))); }

  // Highlight boxes, placed in page units so they scale with the sheet.
  sheets.forEach(function (s) {
    var r = s.dataset.rect.split(',').map(Number), hl = document.createElement('span');
    hl.className = 'sheet-hl';
    hl.style.cssText = 'left:' + (r[0] / PW * 100) + '%;top:' + (r[1] / PH * 100) + '%;width:' + (r[2] / PW * 100) + '%;height:' + (r[3] / PH * 100) + '%';
    s.appendChild(hl);
    var sh = document.createElement('span'); sh.className = 'sheet-shade'; s.appendChild(sh);
  });

  function measure() {
    DW = desk.clientWidth; DH = desk.clientHeight;
    var navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
    H = Math.min((DH - navH * .5) * .86, DW * .86 * PH / PW); W = H * PW / PH;
    desk.style.setProperty('--sw', W + 'px'); desk.style.setProperty('--sh', H + 'px');
    // How far to zoom and shift so each sheet's passage fills the desk.
    zoom = sheets.map(function (s) {
      var r = s.dataset.rect.split(',').map(Number), k = W / PW;
      var z = Math.min(DW * .9 / (r[2] * k), DH * .62 / (r[3] * k), 2.6);
      return { z: Math.max(z, 1), ox: (r[0] + r[2] / 2 - PW / 2) * k, oy: (r[1] + r[3] / 2 - PH / 2) * k };
    });
  }

  var raf = 0;
  function render() {
    raf = 0;
    var r = track.getBoundingClientRect(), span = track.offsetHeight - innerHeight;
    var p = clamp(-r.top / span), f = p * N;
    document.body.classList.toggle('in-tour', r.top <= 0 && r.bottom >= innerHeight);
    if (bar) bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';

    sheets.forEach(function (s, i) {
      var t = f - i, last = i === N - 1;
      if (t < -0.32 || t > 2.2) { s.style.visibility = caps[i].style.visibility = 'hidden'; caps[i].style.opacity = 0; return; }
      s.style.visibility = 'visible';
      // Arrive: slide up from below, tilted like a page being laid down.
      var e = i === 0 ? 1 : seg(t, -0.32, 0);
      // Read: zoom into the passage, hold, zoom back out.
      var zin = seg(t, 0.06, 0.3), zout = seg(t, 0.52, 0.74), zk = last ? zin : Math.min(zin, 1 - zout);
      // Settle: shrink back and tip away as the next page covers it.
      var b = last ? 0 : seg(t, 0.72, 1.02), deep = last ? 0 : clamp(t - 1.02);
      var Z = zoom[i], S = (1 + (Z.z - 1) * zk) * (1 - 0.12 * b - 0.05 * deep) * (0.86 + 0.14 * e);
      var tx = -Z.ox * S * zk, ty = -Z.oy * S * zk + (1 - e) * DH * 0.95 - b * DH * 0.02;
      var rx = still ? 0 : (1 - e) * 22, rz = still ? 0 : (1 - e) * 4 - b * 3;
      s.style.transform = 'translate3d(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px,0) rotateX(' + rx.toFixed(2) + 'deg) rotate(' + rz.toFixed(2) + 'deg) scale(' + S.toFixed(4) + ')';
      s.style.zIndex = i + 1;
      s.lastChild.style.opacity = (0.45 * b + 0.3 * deep).toFixed(3);   // shade
      s.lastChild.previousSibling.style.opacity = zk.toFixed(3);        // highlight
      // Caption follows the zoom.
      var c = caps[i], out = last ? 0 : seg(t, 0.76, 0.87), a = i === 0 ? 1 - out : Math.min(seg(t, -0.12, -0.01), 1 - out);
      if (i === 0 && t < 0) a = 1;
      c.style.opacity = a.toFixed(3);
      c.style.transform = 'translateY(' + ((1 - a) * 10).toFixed(1) + 'px)';
      c.style.visibility = a > 0.01 ? 'visible' : 'hidden';
    });
  }
  function kick() { if (!raf) raf = requestAnimationFrame(render); }

  // Decode every page up front so a fast scroll never shows a blank sheet.
  sheets.forEach(function (s) { var im = s.querySelector('img'); if (im.decode) im.decode().catch(function () {}); });
  measure(); render();
  addEventListener('scroll', kick, { passive: true });
  addEventListener('resize', function () { measure(); kick(); });
})();
