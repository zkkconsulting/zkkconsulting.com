/* Blueprint reveal of the Vyrex fall-detection device, drawn part by part.
   <div data-blueprint></div>                  framed 9:16 loop (blueprint blue)
   <div data-blueprint data-mode="hero"></div>  full-bleed hero background: the device holds its place
                                                while the whole look jump-cuts between themes, like a match cut.
   Edit CONFIG to change text, colors and timing. Times are seconds within the loop. */
(function () {
  var CONFIG = {
    duration: 6,
    text: {
      title: 'VYREX  FD-01', note: 'Illustrative dimensions',
      w: '22 mm', h: '39 mm', t: '11 mm',
      parts: { mcu: 'ESP32-C3', imu: 'IMU', cell: 'Li-Po', motor: 'Haptic', usb: 'USB-C' }
    },
    // themes: [background, grid minor, grid major, lines, hidden lines, dimensions, labels, accent]
    themes: {
      blue:  ['#0a1f3d', 'rgba(125,175,255,.08)', 'rgba(125,175,255,.18)', '#eef4ff', 'rgba(238,244,255,.6)', '#8fd3ff', '#cfe6ff', '#7fd3ff'],
      green: ['#071a12', 'rgba(127,224,184,.07)', 'rgba(127,224,184,.16)', '#f2d35a', 'rgba(242,211,90,.55)', '#7fe0b8', '#d9efe4', '#f2d35a'],
      ink:   ['#0b0f0d', 'rgba(255,255,255,.05)', 'rgba(255,255,255,.12)', '#ffffff', 'rgba(255,255,255,.5)', '#bfc8c3', '#e6ebe8', '#f2d35a']
    },
    heroCuts: ['blue', 'green', 'ink', 'blue', 'green', 'ink'],   // one theme per cut, spread evenly over the loop
    t: {
      grid: [0, .6], body: [.3, 1.4], wall: [1.0, 1.6], pcb: [1.3, 1.9], mcu: [1.6, 2.3], imu: [1.9, 2.4], cell: [2.1, 2.7],
      motor: [2.3, 2.8], drv: [2.5, 2.9], usb: [2.6, 3.0], btn: [2.7, 3.1], side: [2.9, 3.6], dims: [3.2, 3.9], labels: [3.5, 4.1],
      scan: [3.7, 4.8], done: [4.6, 5.2], out: [5.5, 6.0]
    }
  };
  var NS = 'http://www.w3.org/2000/svg', T = CONFIG.text;
  var V = ['--bp-bg', '--bp-g1', '--bp-g2', '--bp-ln', '--bp-hd', '--bp-dm', '--bp-lb', '--bp-ac'];

  function markup(uid, hero) {
    var x0 = hero ? -1500 : 0, W = hero ? 2400 : 900;
    var mono = "font-family='ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'";
    var ln = function (w) { return "style='stroke:var(--bp-ln);stroke-width:" + (w || 2) + ";fill:none'"; };
    var hd = "style='stroke:var(--bp-hd);stroke-width:1.3;fill:none'";
    var dm = "style='stroke:var(--bp-dm);stroke-width:1.3;fill:none'";
    var txt = function (x, y, s, size, anchor, key, col) { return "<text " + mono + " x='" + x + "' y='" + y + "' font-size='" + size + "' letter-spacing='2' text-anchor='" + (anchor || 'start') + "' style='fill:var(" + (col || '--bp-lb') + ")' data-f='" + key + "'>" + s + "</text>"; };
    var lead = function (pts) { return "<polyline points='" + pts + "' " + dm + " data-d='labels'/>"; };
    return "<defs>" +
      "<pattern id='g" + uid + "' width='20' height='20' patternUnits='userSpaceOnUse'><path d='M20 0H0V20' style='fill:none;stroke:var(--bp-g1)'/></pattern>" +
      "<pattern id='G" + uid + "' width='100' height='100' patternUnits='userSpaceOnUse'><rect width='100' height='100' fill='url(#g" + uid + ")'/><path d='M100 0H0V100' style='fill:none;stroke:var(--bp-g2);stroke-width:1.2'/></pattern>" +
      "<linearGradient id='s" + uid + "' x1='0' y1='0' x2='0' y2='1'><stop offset='0' style='stop-color:var(--bp-ac)' stop-opacity='0'/><stop offset='.85' style='stop-color:var(--bp-ac)' stop-opacity='.2'/><stop offset='1' style='stop-color:var(--bp-ac)' stop-opacity='.65'/></linearGradient>" +
      "</defs>" +
      "<rect x='" + x0 + "' width='" + W + "' height='1600' style='fill:var(--bp-bg)'/>" +
      "<rect x='" + x0 + "' width='" + W + "' height='1600' fill='url(#G" + uid + ")' data-f='grid'/>" +
      "<g data-loop>" +
      (hero ? '' : txt(60, 110, T.title, 28, 'start', 'grid', '--bp-ln') + txt(60, 1550, T.note, 16, 'start', 'labels')) +
      // enclosure, wall, board
      "<rect x='250' y='330' width='400' height='740' rx='150' " + ln(2.6) + " data-d='body'/>" +
      "<rect x='250' y='330' width='400' height='740' rx='150' style='fill:var(--bp-ac);fill-opacity:0' data-done/>" +
      "<rect x='275' y='355' width='350' height='690' rx='128' " + hd + " stroke-dasharray='10 7' data-f='wall'/>" +
      "<rect x='300' y='430' width='300' height='470' rx='40' " + hd + " data-d='pcb'/>" +
      // ESP32-C3 module with antenna and shield
      "<rect x='330' y='455' width='150' height='170' rx='8' " + ln(1.8) + " data-d='mcu'/>" +
      "<path d='M345 492v-18h20v18h20v-18h20v18h20v-18h20v18h10' " + hd + " data-d='mcu'/>" +
      "<rect x='342' y='508' width='126' height='104' rx='4' " + hd + " data-d='mcu'/>" +
      // IMU
      "<rect x='515' y='480' width='56' height='56' rx='4' " + ln(1.8) + " data-d='imu'/>" +
      "<path d='M523 480v-8M535 480v-8M547 480v-8M559 480v-8M523 544v-8M535 544v-8M547 544v-8M559 544v-8' " + hd + " data-d='imu'/>" +
      // charge IC and Li-Po cell under the board
      "<rect x='505' y='568' width='44' height='30' rx='3' " + hd + " data-d='cell'/>" +
      "<rect x='312' y='655' width='276' height='228' rx='18' " + ln(1.6) + " stroke-dasharray='14 6' data-f='cell'/>" +
      // haptic motor with MOSFET driver and flyback diode
      "<circle cx='522' cy='792' r='46' " + ln(1.8) + " data-d='motor'/>" +
      "<circle cx='522' cy='792' r='18' " + hd + " data-d='motor'/>" +
      "<rect x='372' y='780' width='36' height='26' rx='3' " + ln(1.6) + " data-d='drv'/>" +
      "<path d='M420 793h16l10-9v18l-10-9M446 784v18' " + hd + " data-d='drv'/>" +
      // USB-C and side button
      "<rect x='405' y='1050' width='90' height='34' rx='16' style='fill:var(--bp-bg);stroke:var(--bp-ln);stroke-width:2' data-d='usb'/>" +
      "<rect x='642' y='600' width='18' height='96' rx='9' style='fill:var(--bp-bg);stroke:var(--bp-ln);stroke-width:2' data-d='btn'/>" +
      // side profile with layer lines
      "<rect x='250' y='1190' width='400' height='110' rx='46' " + ln(2.2) + " data-d='side'/>" +
      "<path d='M282 1226H618M282 1262H618' " + hd + " stroke-dasharray='8 6' data-f='side'/>" +
      // dimensions
      "<path d='M250 318V270M650 318V270M250 290H650M250 284v12M650 284v12' " + dm + " data-d='dims'/>" + txt(450, 262, T.w, 20, 'middle', 'dims', '--bp-dm') +
      "<path d='M662 330H742M662 1070H742M722 330V1070M716 330h12M716 1070h12' " + dm + " data-d='dims'/>" +
      "<text " + mono + " x='0' y='0' font-size='20' letter-spacing='2' text-anchor='middle' transform='translate(752 700) rotate(90)' style='fill:var(--bp-dm)' data-f='dims'>" + T.h + "</text>" +
      "<path d='M662 1190H742M662 1300H742M722 1190V1300M716 1190h12M716 1300h12' " + dm + " data-d='dims'/>" + txt(738, 1252, T.t, 20, 'start', 'dims', '--bp-dm') +
      // short labels
      lead('330,520 230,500 200,500') + txt(60, 507, T.parts.mcu, 20, 'start', 'labels') +
      lead('312,840 230,880 200,880') + txt(60, 887, T.parts.cell, 20, 'start', 'labels') +
      lead('571,498 600,440 780,440') + txt(790, 447, T.parts.imu, 20, 'start', 'labels') +
      lead('566,808 600,880 780,880') + txt(790, 887, T.parts.motor, 20, 'start', 'labels') +
      lead('450,1084 450,1130 520,1150') + txt(530, 1157, T.parts.usb, 20, 'start', 'labels') +
      "</g>" +
      "<g data-scan><rect x='" + x0 + "' y='-140' width='" + W + "' height='140' fill='url(#s" + uid + ")'/><rect x='" + x0 + "' y='-2' width='" + W + "' height='2' style='fill:var(--bp-ac)' opacity='.9'/></g>";
  }

  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function ease(p) { return p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; }
  function win(k, t) { var w = CONFIG.t[k]; return ease(clamp((t - w[0]) / (w[1] - w[0]))); }
  function theme(host, name) { var c = CONFIG.themes[name]; V.forEach(function (v, i) { host.style.setProperty(v, c[i]); }); }

  function mount(host, uid) {
    var hero = host.getAttribute('data-mode') === 'hero';
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', hero ? (innerWidth > 860 ? '-1500 160 2400 1240' : '-200 160 1300 1240') : '0 0 900 1600');
    svg.setAttribute('preserveAspectRatio', hero ? 'xMidYMid slice' : 'xMidYMid meet');
    if (hero) svg.setAttribute('aria-hidden', 'true');
    else { svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', host.getAttribute('data-label') || 'Animated blueprint of a fall-detection device, drawn part by part with illustrative dimensions'); }
    theme(host, 'blue');
    svg.innerHTML = markup(uid, hero);
    host.appendChild(svg);

    var draws = [].slice.call(svg.querySelectorAll('[data-d]')).filter(function (el) { return el.getTotalLength; }).map(function (el) {
      var len = el.getTotalLength(); el.style.strokeDasharray = len + ' ' + len; return { el: el, len: len, key: el.getAttribute('data-d') };
    });
    var fades = [].slice.call(svg.querySelectorAll('[data-f]')).map(function (el) { return { el: el, key: el.getAttribute('data-f') }; });
    var loop = svg.querySelector('[data-loop]'), scan = svg.querySelector('[data-scan]'), done = svg.querySelector('[data-done]');
    var lastCut = -1;

    function render(t) {
      draws.forEach(function (d) { d.el.style.strokeDashoffset = d.len * (1 - win(d.key, t)); });
      fades.forEach(function (f) { f.el.style.opacity = win(f.key, t); });
      var on = t >= CONFIG.t.scan[0] && t <= CONFIG.t.scan[1];
      scan.setAttribute('transform', 'translate(0 ' + (220 + win('scan', t) * 1150) + ')'); scan.style.opacity = on ? 1 : 0;
      done.style.fillOpacity = (.07 * win('done', t)).toFixed(3);
      loop.style.opacity = 1 - win('out', t);
      if (hero) {   // match cut: the drawing keeps its place, the whole look changes in a single frame
        var cut = Math.floor(t / CONFIG.duration * CONFIG.heroCuts.length);
        if (cut !== lastCut) { lastCut = cut; theme(host, CONFIG.heroCuts[cut]); }
      }
    }

    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { render(5.2); return; }
    var t0 = null, raf = 0, visible = true;
    function frame(now) { if (t0 === null) t0 = now; render(((now - t0) / 1000) % CONFIG.duration); raf = visible ? requestAnimationFrame(frame) : 0; }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible && !raf) { t0 = null; raf = requestAnimationFrame(frame); } }).observe(host);
    } else raf = requestAnimationFrame(frame);
  }

  window.ZKKBlueprint = { config: CONFIG, mount: mount };
  [].slice.call(document.querySelectorAll('[data-blueprint]')).forEach(function (h, i) { mount(h, i); });
})();
