/* Blueprint reveal: a fall-detection wearable drawn as an engineering blueprint.
   Drop <div data-blueprint></div> anywhere (section, hero, background) and this fills it.
   Edit CONFIG to change text, colors and timing. Times are in seconds within the loop. */
(function () {
  var CONFIG = {
    duration: 6,                       // loop length
    text: {
      title: 'FALL-DETECTION WEARABLE',
      subtitle: 'Concept to finished design',
      dwg: 'ZKK  ·  DWG FD-01',
      note: 'Illustrative dimensions',
      done: 'DESIGN READY',
      podW: '40.0 mm', podH: '34.0 mm', strapW: '24.0 mm', thick: 'T 11.0 mm',
      parts: { cell: 'Li-Po cell', motor: 'Haptic motor', button: 'Alert button', imu: '6-axis IMU', mcu: 'BLE MCU', usb: 'USB-C' }
    },
    colors: {
      bg: '#0a1f3d', gridMinor: 'rgba(125,175,255,.08)', gridMajor: 'rgba(125,175,255,.18)',
      stroke: '#eef4ff', hidden: 'rgba(238,244,255,.62)', dim: '#8fd3ff', label: '#cfe6ff', scan: '#7fd3ff', done: '#f2d35a'
    },
    // [start, end] windows for each step of the reveal
    t: {
      grid: [0, .6], strap: [.4, 1.6], pod: [1.1, 2.2], bezel: [1.7, 2.4],
      pcb: [2.0, 2.6], cell: [2.2, 2.8], imu: [2.4, 3.0], mcu: [2.6, 3.2], motor: [2.8, 3.3], button: [2.9, 3.4], usb: [3.0, 3.5],
      dims: [3.1, 3.9], labels: [3.4, 4.1], scan: [3.6, 4.8], done: [4.6, 5.1], out: [5.5, 6.0]
    }
  };

  var NS = 'http://www.w3.org/2000/svg';
  var C = CONFIG.colors, T = CONFIG.text;

  function svgMarkup(uid) {
    var mono = "font-family='ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'";
    var lbl = function (x, y, txt, anchor) { return "<text " + mono + " x='" + x + "' y='" + y + "' fill='" + C.label + "' font-size='19' letter-spacing='1.5' text-anchor='" + (anchor || 'start') + "' data-f='labels'>" + txt + "</text>"; };
    var lead = function (pts) { return "<polyline points='" + pts + "' fill='none' stroke='" + C.dim + "' stroke-width='1.2' data-d='labels'/>"; };
    return "" +
      "<defs>" +
      "<pattern id='g" + uid + "' width='20' height='20' patternUnits='userSpaceOnUse'><path d='M20 0H0V20' fill='none' stroke='" + C.gridMinor + "' stroke-width='1'/></pattern>" +
      "<pattern id='G" + uid + "' width='100' height='100' patternUnits='userSpaceOnUse'><rect width='100' height='100' fill='url(#g" + uid + ")'/><path d='M100 0H0V100' fill='none' stroke='" + C.gridMajor + "' stroke-width='1.2'/></pattern>" +
      "<linearGradient id='s" + uid + "' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='" + C.scan + "' stop-opacity='0'/><stop offset='.85' stop-color='" + C.scan + "' stop-opacity='.22'/><stop offset='1' stop-color='" + C.scan + "' stop-opacity='.7'/></linearGradient>" +
      "</defs>" +
      "<rect width='900' height='1600' fill='" + C.bg + "'/>" +
      "<rect width='900' height='1600' fill='url(#G" + uid + ")' data-f='grid'/>" +
      "<g data-loop>" +
      // title
      "<text " + mono + " x='60' y='96' fill='" + C.stroke + "' font-size='30' letter-spacing='4' data-f='grid'>" + T.title + "</text>" +
      "<text " + mono + " x='60' y='134' fill='" + C.label + "' font-size='19' letter-spacing='1.5' data-f='grid'>" + T.subtitle + "</text>" +
      // strap and pod (visible edges)
      "<rect x='375' y='170' width='150' height='1270' rx='62' fill='none' stroke='" + C.stroke + "' stroke-width='2' data-d='strap'/>" +
      "<g data-d='strap'>" + [1190, 1240, 1290, 1340].map(function (y) { return "<circle cx='450' cy='" + y + "' r='8' fill='none' stroke='" + C.stroke + "' stroke-width='1.6' data-d='strap'/>"; }).join('') + "</g>" +
      "<rect x='290' y='560' width='320' height='300' rx='72' fill='" + C.bg + "' stroke='" + C.stroke + "' stroke-width='2.4' data-d='pod'/>" +
      "<rect x='290' y='560' width='320' height='300' rx='72' fill='" + C.done + "' fill-opacity='0' data-done/>" +
      "<rect x='316' y='586' width='268' height='248' rx='52' fill='none' stroke='" + C.hidden + "' stroke-width='1.4' stroke-dasharray='10 7' data-f='bezel'/>" +
      // internal parts (hidden lines)
      "<rect x='336' y='608' width='228' height='204' rx='18' fill='none' stroke='" + C.hidden + "' stroke-width='1.4' data-d='pcb'/>" +
      "<rect x='348' y='622' width='118' height='82' rx='9' fill='none' stroke='" + C.stroke + "' stroke-width='1.6' data-d='cell'/>" +
      "<path d='M360 663h94M407 640v46' stroke='" + C.hidden + "' stroke-width='1' data-d='cell'/>" +
      "<rect x='486' y='636' width='48' height='48' rx='4' fill='none' stroke='" + C.stroke + "' stroke-width='1.6' data-d='imu'/>" +
      "<path d='M492 636v-8M502 636v-8M512 636v-8M522 636v-8M492 692v-8M502 692v-8M512 692v-8M522 692v-8' stroke='" + C.hidden + "' stroke-width='1' data-d='imu'/>" +
      "<rect x='480' y='706' width='62' height='62' rx='6' fill='none' stroke='" + C.stroke + "' stroke-width='1.6' data-d='mcu'/>" +
      "<circle cx='403' cy='760' r='30' fill='none' stroke='" + C.stroke + "' stroke-width='1.6' data-d='motor'/>" +
      "<circle cx='403' cy='760' r='12' fill='none' stroke='" + C.hidden + "' stroke-width='1' data-d='motor'/>" +
      "<circle cx='450' cy='560' r='17' fill='" + C.bg + "' stroke='" + C.stroke + "' stroke-width='2' data-d='button'/>" +
      "<rect x='603' y='688' width='22' height='50' rx='10' fill='" + C.bg + "' stroke='" + C.stroke + "' stroke-width='1.8' data-d='usb'/>" +
      // dimension lines
      "<path d='M290 548V474M610 548V474M290 494H610M290 488v12M610 488v12' stroke='" + C.dim + "' stroke-width='1.3' fill='none' data-d='dims'/>" +
      "<text " + mono + " x='450' y='482' fill='" + C.dim + "' font-size='19' text-anchor='middle' data-f='dims'>" + T.podW + "</text>" +
      "<path d='M622 560H842M622 860H842M822 560V860M816 560h12M816 860h12' stroke='" + C.dim + "' stroke-width='1.3' fill='none' data-d='dims'/>" +
      "<text " + mono + " x='0' y='0' fill='" + C.dim + "' font-size='19' text-anchor='middle' transform='translate(846 710) rotate(90)' data-f='dims'>" + T.podH + "</text>" +
      "<path d='M375 1452V1490M525 1452V1490M375 1478H525M375 1472v12M525 1472v12' stroke='" + C.dim + "' stroke-width='1.3' fill='none' data-d='dims'/>" +
      "<text " + mono + " x='450' y='1516' fill='" + C.dim + "' font-size='19' text-anchor='middle' data-f='dims'>" + T.strapW + "</text>" +
      // labels and leaders
      lead('348,640 300,600 210,600') + lbl(60, 606, T.parts.cell) +
      lead('373,760 300,800 210,800') + lbl(60, 806, T.parts.motor) +
      lead('436,556 300,520 210,520') + lbl(60, 526, T.parts.button) +
      lead('534,646 600,610 690,610') + lbl(700, 616, T.parts.imu) +
      lead('542,740 600,780 690,780') + lbl(700, 786, T.parts.mcu) +
      lead('625,720 700,900 700,930') + lbl(700, 956, T.parts.usb) +
      // title block
      "<g data-f='labels'><rect x='540' y='1500' width='310' height='70' fill='none' stroke='" + C.dim + "' stroke-width='1.2'/>" +
      "<text " + mono + " x='556' y='1528' fill='" + C.label + "' font-size='17' letter-spacing='1.5'>" + T.dwg + "</text>" +
      "<text " + mono + " x='556' y='1555' fill='" + C.label + "' font-size='15' letter-spacing='1'>" + T.note + "  ·  " + T.thick + "</text></g>" +
      "<text " + mono + " x='450' y='1000' fill='" + C.done + "' font-size='24' letter-spacing='6' text-anchor='middle' data-f='done'>" + T.done + "</text>" +
      "</g>" +
      // scan sweep
      "<g data-scan><rect x='0' y='-140' width='900' height='140' fill='url(#s" + uid + ")'/><rect x='0' y='-2' width='900' height='2' fill='" + C.scan + "' opacity='.9'/></g>";
  }

  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function ease(p) { return p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; }
  function win(key, t) { var w = CONFIG.t[key]; return ease(clamp((t - w[0]) / (w[1] - w[0]))); }

  function mount(host, uid) {
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 900 1600');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', host.getAttribute('data-label') || 'Animated blueprint of a fall-detection wearable, drawn step by step with illustrative dimensions');
    svg.innerHTML = svgMarkup(uid);
    host.appendChild(svg);

    var draws = [].slice.call(svg.querySelectorAll('[data-d]')).filter(function (el) { return el.getTotalLength; }).map(function (el) {
      var len = el.getTotalLength(); el.style.strokeDasharray = len + ' ' + len; return { el: el, len: len, key: el.getAttribute('data-d') };
    });
    var fades = [].slice.call(svg.querySelectorAll('[data-f]')).map(function (el) { return { el: el, key: el.getAttribute('data-f') }; });
    var loop = svg.querySelector('[data-loop]'), scan = svg.querySelector('[data-scan]'), done = svg.querySelector('[data-done]');

    function render(t) {
      draws.forEach(function (d) { d.el.style.strokeDashoffset = d.len * (1 - win(d.key, t)); });
      fades.forEach(function (f) { f.el.style.opacity = win(f.key, t); });
      var s = win('scan', t), sOn = t >= CONFIG.t.scan[0] && t <= CONFIG.t.scan[1];
      scan.setAttribute('transform', 'translate(0 ' + (160 + s * 1360) + ')'); scan.style.opacity = sOn ? 1 : 0;
      done.setAttribute('fill-opacity', (.08 * win('done', t)).toFixed(3));
      loop.style.opacity = 1 - win('out', t);
    }

    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { render(5.2); return; }   // still, finished composition
    var t0 = null, raf = 0, visible = true;
    function frame(now) {
      if (t0 === null) t0 = now;
      render(((now - t0) / 1000) % CONFIG.duration);
      raf = visible ? requestAnimationFrame(frame) : 0;
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        visible = en[0].isIntersecting;
        if (visible && !raf) { t0 = null; raf = requestAnimationFrame(frame); }
      }).observe(host);
    } else raf = requestAnimationFrame(frame);
  }

  window.ZKKBlueprint = { config: CONFIG, mount: mount };
  [].slice.call(document.querySelectorAll('[data-blueprint]')).forEach(function (h, i) { mount(h, i); });
})();
