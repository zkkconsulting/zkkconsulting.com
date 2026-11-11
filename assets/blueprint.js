/* Line-drawing heroes. Each drawing builds part by part in thin strokes while the camera hard-cuts between shots.
   <div data-blueprint data-preset="device"></div>                  framed 9:16 loop
   <div data-blueprint data-mode="hero" data-preset="bars"></div>  full-bleed hero background: the drawing
        holds its place while the whole look jump-cuts between themes, like the home page's match cut.
   Presets: device, bars, funnel, patent, matrix, stack, research, people, question, envelope, referral, shield.
   Edit CONFIG for colors, timing and the theme sequence; edit PRESETS for the drawings and their labels. */
(function () {
  var CONFIG = {
    duration: 8,
    themes: {   // background, grid minor, grid major, lines, hidden lines, dimensions, labels, accent (every line stays white)
      blue:   ['#0a1f3d', 'rgba(255,255,255,.05)', 'rgba(255,255,255,.11)', '#ffffff', 'rgba(255,255,255,.55)', 'rgba(255,255,255,.75)', '#ffffff', '#ffffff'],
      maroon: ['#2e0c14', 'rgba(255,255,255,.05)', 'rgba(255,255,255,.11)', '#ffffff', 'rgba(255,255,255,.55)', 'rgba(255,255,255,.75)', '#ffffff', '#ffffff'],
      green:  ['#071a12', 'rgba(255,255,255,.05)', 'rgba(255,255,255,.11)', '#ffffff', 'rgba(255,255,255,.55)', 'rgba(255,255,255,.75)', '#ffffff', '#ffffff'],
      gray:   ['#25282a', 'rgba(255,255,255,.05)', 'rgba(255,255,255,.11)', '#ffffff', 'rgba(255,255,255,.55)', 'rgba(255,255,255,.75)', '#ffffff', '#ffffff'],
      amber:  ['#25170a', 'rgba(255,255,255,.05)', 'rgba(255,255,255,.11)', '#ffffff', 'rgba(255,255,255,.55)', 'rgba(255,255,255,.75)', '#ffffff', '#ffffff'],
      teal:   ['#06272b', 'rgba(255,255,255,.05)', 'rgba(255,255,255,.11)', '#ffffff', 'rgba(255,255,255,.55)', 'rgba(255,255,255,.75)', '#ffffff', '#ffffff'],
      ink:    ['#0b0f0d', 'rgba(255,255,255,.05)', 'rgba(255,255,255,.11)', '#ffffff', 'rgba(255,255,255,.55)', 'rgba(255,255,255,.75)', '#ffffff', '#ffffff']
    },
    palette: ['blue', 'maroon', 'green', 'gray', 'amber', 'teal', 'ink'],   // every hero cycles all of these, starting from its page's first data-cuts theme
    heroCuts: ['blue', 'maroon', 'green', 'gray', 'amber', 'teal', 'ink'],
    t: { grid: [0, .6], s1: [.3, 1.3], s2: [.9, 1.8], s3: [1.4, 2.3], s4: [1.9, 2.8], s5: [2.4, 3.2], s6: [2.8, 3.6],
         dims: [3.2, 3.9], labels: [3.5, 4.1], done: [4.4, 5.0] }
  };
  var NS = 'http://www.w3.org/2000/svg', V = ['--bp-bg', '--bp-g1', '--bp-g2', '--bp-ln', '--bp-hd', '--bp-dm', '--bp-lb', '--bp-ac'];
  var MONO = "font-family='ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'";

  // drawing helpers: k is the stage key that reveals the element
  function st(kind, w) { return kind === 'hd' ? 'stroke:var(--bp-hd);stroke-width:1.3;fill:none' : kind === 'dm' ? 'stroke:var(--bp-dm);stroke-width:1.3;fill:none' : 'stroke:var(--bp-ln);stroke-width:' + (w || 2) + ';fill:none'; }
  function P(d, k, kind, w, extra) { return "<path d='" + d + "' style='" + st(kind, w) + "' data-d='" + k + "' " + (extra || '') + "/>"; }
  function R(x, y, w, h, rx, k, kind, sw, extra) { return "<rect x='" + x + "' y='" + y + "' width='" + w + "' height='" + h + "' rx='" + (rx || 0) + "' style='" + st(kind, sw) + "' data-d='" + k + "' " + (extra || '') + "/>"; }
  function C(cx, cy, r, k, kind, sw) { return "<circle cx='" + cx + "' cy='" + cy + "' r='" + r + "' style='" + st(kind, sw) + "' data-d='" + k + "'/>"; }
  function F(inner, k) { return "<g data-f='" + k + "'>" + inner + "</g>"; }   // faded in, for dashed or filled parts
  function T(x, y, s, size, anchor, k, col) { return "<text " + MONO + " x='" + x + "' y='" + y + "' font-size='" + (size || 20) + "' letter-spacing='2' text-anchor='" + (anchor || 'start') + "' style='fill:var(" + (col || '--bp-lb') + ")' data-f='" + (k || 'labels') + "'>" + s + "</text>"; }
  function L(pts) { return "<polyline points='" + pts + "' style='" + st('dm') + "' data-d='labels'/>"; }
  function D(d) { return P(d, 'dims', 'dm'); }

  var PRESETS = {
    device: function () {   // Vyrex fall-detection device: ESP32-C3, IMU, Li-Po, haptic driver, USB-C
      return R(250, 330, 400, 740, 150, 's1', 'ln', 2.6) + "<rect x='250' y='330' width='400' height='740' rx='150' style='fill:var(--bp-ac);fill-opacity:0' data-done/>" +
        F(R(275, 355, 350, 690, 128, 'x', 'hd', 0, "stroke-dasharray='10 7'"), 's2') + R(300, 430, 300, 470, 40, 's2', 'hd') +
        R(330, 455, 150, 170, 8, 's3', 'ln', 1.8) + P('M345 492v-18h20v18h20v-18h20v18h20v-18h20v18h10', 's3', 'hd') + R(342, 508, 126, 104, 4, 's3', 'hd') +
        R(515, 480, 56, 56, 4, 's3', 'ln', 1.8) + P('M523 480v-8M535 480v-8M547 480v-8M559 480v-8M523 544v-8M535 544v-8M547 544v-8M559 544v-8', 's3', 'hd') +
        R(505, 568, 44, 30, 3, 's4', 'hd') + F(R(312, 655, 276, 228, 18, 'x', 'ln', 1.6, "stroke-dasharray='14 6'"), 's4') +
        C(522, 792, 46, 's4', 'ln', 1.8) + C(522, 792, 18, 's4', 'hd') + R(372, 780, 36, 26, 3, 's5', 'ln', 1.6) + P('M420 793h16l10-9v18l-10-9M446 784v18', 's5', 'hd') +
        "<rect x='405' y='1050' width='90' height='34' rx='16' style='fill:var(--bp-bg);stroke:var(--bp-ln);stroke-width:2' data-d='s5'/>" +
        "<rect x='642' y='600' width='18' height='96' rx='9' style='fill:var(--bp-bg);stroke:var(--bp-ln);stroke-width:2' data-d='s5'/>" +
        R(250, 1190, 400, 110, 46, 's6', 'ln', 2.2) + F(P('M282 1226H618M282 1262H618', 'x', 'hd', 0, "stroke-dasharray='8 6'"), 's6') +
        D('M250 318V270M650 318V270M250 290H650M250 284v12M650 284v12') + T(450, 262, '22 mm', 20, 'middle', 'dims', '--bp-dm') +
        D('M662 330H742M662 1070H742M722 330V1070M716 330h12M716 1070h12') +
        "<text " + MONO + " x='0' y='0' font-size='20' letter-spacing='2' text-anchor='middle' transform='translate(752 700) rotate(90)' style='fill:var(--bp-dm)' data-f='dims'>39 mm</text>" +
        D('M662 1190H742M662 1300H742M722 1190V1300M716 1190h12M716 1300h12') + T(738, 1252, '11 mm', 20, 'start', 'dims', '--bp-dm') +
        L('330,520 230,500 200,500') + T(60, 507, 'ESP32-C3') + L('312,840 230,880 200,880') + T(60, 887, 'Li-Po') +
        L('571,498 600,440 780,440') + T(790, 447, 'IMU') + L('566,808 600,880 780,880') + T(790, 887, 'Haptic') + L('450,1084 450,1130 520,1150') + T(530, 1157, 'USB-C');
    },
    bars: function () {   // pricing: the three packages to scale ($2,499 / $4,499 / $7,499)
      return P('M200 1150V420M200 1150H720', 's1', 'ln', 2.4) + F(P('M200 950H720M200 750H720M200 550H720', 'x', 'hd', 0, "stroke-dasharray='6 8'"), 's1') +
        R(250, 940, 110, 210, 6, 's2', 'ln', 2) + R(410, 820, 110, 330, 6, 's3', 'ln', 2) + R(570, 550, 110, 600, 6, 's4', 'ln', 2) +
        "<rect x='570' y='550' width='110' height='600' rx='6' style='fill:var(--bp-ac);fill-opacity:0' data-done/>" +
        P('M305 930L465 810L625 540', 's5', 'dm') + C(305, 930, 6, 's5', 'dm') + C(465, 810, 6, 's5', 'dm') + C(625, 540, 6, 's5', 'dm') +
        P('M600 380h120l40 40-40 40H600z', 's6', 'ln', 2) + C(622, 420, 8, 's6', 'hd') +
        T(305, 915, '$2,499', 20, 'middle', 'labels', '--bp-lb') + T(465, 795, '$4,499', 20, 'middle') + T(625, 520, '$7,499', 20, 'middle') +
        T(305, 1190, 'LAUNCHPAD', 14, 'middle') + T(465, 1190, 'GROWTH', 14, 'middle') + T(625, 1190, 'COMPREHENSIVE', 13, 'middle') + T(690, 428, 'FIXED', 16, 'middle', 'labels', '--bp-ac') +
        D('M180 420V1150M174 420h12M174 1150h12');
    },
    funnel: function () {   // market sizing: TAM, SAM, SOM
      return C(450, 760, 330, 's1', 'ln', 2.2) + C(450, 760, 220, 's2', 'ln', 2) + C(450, 760, 110, 's3', 'ln', 2) +
        "<circle cx='450' cy='760' r='110' style='fill:var(--bp-ac);fill-opacity:0' data-done/>" +
        F(P('M90 760H810M450 400V1120', 'x', 'hd', 0, "stroke-dasharray='6 8'"), 's4') +
        C(420, 730, 7, 's5', 'dm') + C(480, 745, 7, 's5', 'dm') + C(440, 795, 7, 's5', 'dm') + C(500, 790, 7, 's5', 'dm') + C(455, 700, 7, 's5', 'dm') +
        D('M450 760L683 527') + D('M450 760L606 916') + T(560, 625, 'r', 18, 'middle', 'dims', '--bp-dm') +
        L('450,430 450,380 560,380') + T(570, 387, 'TAM') + L('300,620 230,560 140,560') + T(60, 567, 'SAM') + L('450,870 450,940 300,1180') + T(300, 1210, 'SOM', 20, 'middle');
    },
    patent: function () {   // patent landscape: a patent sheet and its citation network
      return P('M230 330H600L670 400V930H230Z', 's1', 'ln', 2.4) + P('M600 330V400H670', 's1', 'ln', 1.6) +
        P('M270 390H520M270 420H460', 's2', 'ln', 1.8) + F(P('M270 480H630M270 510H630M270 540H600M270 600H630M270 630H630M270 660H560', 'x', 'hd'), 's3') +
        R(300, 720, 140, 140, 10, 's4', 'ln', 1.6) + C(530, 790, 50, 's4', 'ln', 1.6) + P('M440 790H480', 's4', 'hd') +
        "<path d='M230 330H600L670 400V930H230Z' style='fill:var(--bp-ac);fill-opacity:0' data-done/>" +
        P('M450 930V1040M450 1040L250 1130M450 1040L450 1180M450 1040L650 1130M450 1180L350 1290M450 1180L550 1290', 's5', 'dm') +
        C(250, 1130, 22, 's5', 'ln', 1.6) + C(450, 1180, 22, 's5', 'ln', 1.6) + C(650, 1130, 22, 's5', 'ln', 1.6) + C(350, 1290, 18, 's6', 'hd') + C(550, 1290, 18, 's6', 'hd') +
        L('630,600 700,560 780,560') + T(790, 567, 'CLAIM 1') + L('370,860 370,960 200,960') + T(60, 967, 'FIG. 1') + T(450, 1350, 'CITED BY', 18, 'middle');
    },
    matrix: function () {   // competitive landscape: a positioning matrix with an open quadrant
      return P('M200 800H700M450 550V1050', 's1', 'ln', 2.2) + F(R(200, 550, 500, 500, 0, 'x', 'hd', 0, "stroke-dasharray='8 8'"), 's2') +
        C(300, 640, 16, 's3', 'ln') + C(370, 700, 16, 's3', 'ln') + C(310, 900, 16, 's3', 'ln') + C(560, 960, 16, 's3', 'ln') + C(390, 980, 16, 's3', 'ln') +
        C(590, 660, 22, 's4', 'ln', 2.6) + C(590, 660, 40, 's4', 'dm') +
        "<circle cx='590' cy='660' r='22' style='fill:var(--bp-ac);fill-opacity:0' data-done/>" +
        P('M470 820Q520 740 572 678', 's5', 'dm') + P('M556 690L572 678L566 698', 's5', 'dm') +
        T(700, 840, 'FEATURES', 16, 'end') + T(470, 540, 'PRICE', 16, 'start') + T(590, 610, 'OPEN SPACE', 16, 'middle', 'labels', '--bp-ac') + T(300, 600, 'INCUMBENTS', 16, 'middle');
    },
    stack: function () {   // guides: a stack of pages, one open with a highlight
      return P('M290 470L590 430L640 1010L340 1050Z', 's1', 'hd') + P('M260 440L560 420L590 1000L290 1020Z', 's2', 'hd') +
        R(240, 400, 340, 600, 8, 's3', 'ln', 2.4) +
        P('M280 470H520M280 500H470', 's4', 'ln', 1.8) + F(P('M280 560H540M280 590H540M280 620H500M280 680H540M280 710H540M280 740H460M280 800H540M280 830H520', 'x', 'hd'), 's4') +
        "<rect x='272' y='668' width='276' height='54' rx='4' style='fill:var(--bp-ac);fill-opacity:0' data-done/>" + R(272, 668, 276, 54, 4, 's5', 'dm') +
        P('M520 400V500L540 485L560 500V400', 's6', 'ln', 1.8) +
        L('548,695 640,695 720,640') + T(730, 647, 'KEY POINT') + T(240, 1060, 'GUIDE', 18, 'start');
    },
    research: function () {   // research and guides: a guide page and a target with an arrow in the bullseye
      return P('M170 560L410 530L450 1000L210 1030Z', 's1', 'hd') +
        R(120, 520, 280, 470, 8, 's2', 'ln', 2.4) + P('M150 580H350M150 610H310', 's3', 'ln', 1.8) +
        F(P('M150 670H370M150 700H370M150 730H330M150 830H370M150 860H370M150 890H300', 'x', 'hd'), 's3') +
        "<rect x='142' y='760' width='236' height='44' rx='4' style='fill:var(--bp-ac);fill-opacity:0' data-done/>" + R(142, 760, 236, 44, 4, 's3', 'dm') +
        C(640, 720, 170, 's4', 'ln', 2.2) + C(640, 720, 115, 's4', 'ln', 2) + C(640, 720, 60, 's5', 'ln', 2) + C(640, 720, 16, 's5', 'ln', 2.6) +
        "<circle cx='640' cy='720' r='16' style='fill:var(--bp-ac);fill-opacity:0' data-done/>" +
        F(P('M600 885L560 1060M680 885L720 1060', 'x', 'hd'), 's5') +
        P('M440 920L634 726', 's6', 'ln', 2.4) + P('M634 726L604 732M634 726L628 756', 's6', 'ln', 2.4) +
        P('M440 920L412 920M440 920L440 948M454 906L426 906M454 906L454 934', 's6', 'ln', 1.8);
    },
    people: function () {   // team: two founders
      return C(330, 640, 90, 's1', 'ln', 2.4) + P('M190 930Q190 770 330 770Q470 770 470 930', 's2', 'ln', 2.2) +
        C(570, 640, 90, 's3', 'ln', 2.4) + P('M430 930Q430 770 570 770Q710 770 710 930', 's4', 'ln', 2.2) +
        P('M160 960H740', 's5', 'ln', 1.8) + F(P('M330 560V720M570 560V720', 'x', 'hd', 0, "stroke-dasharray='6 6'"), 's5') +
        P('M330 1010H570', 's6', 'dm') + C(450, 1010, 8, 's6', 'dm') +
        "<circle cx='450' cy='1010' r='8' style='fill:var(--bp-ac);fill-opacity:0' data-done/>" +
        T(330, 1060, 'FOUNDER', 16, 'middle') + T(570, 1060, 'CO-FOUNDER', 16, 'middle');
    },
    question: function () {   // FAQ: a question mark built on construction lines
      return F(C(450, 620, 180, 'x', 'hd'), 's1') + P('M300 620A150 150 0 1 1 520 760Q450 800 450 880V960', 's2', 'ln', 3) +
        C(450, 1060, 22, 's3', 'ln', 3) + "<circle cx='450' cy='1060' r='22' style='fill:var(--bp-ac);fill-opacity:0' data-done/>" +
        F(P('M270 620H630M450 440V800', 'x', 'hd', 0, "stroke-dasharray='6 8'"), 's4') + D('M450 620L577 493') + T(530, 540, 'r', 18, 'middle', 'dims', '--bp-dm') +
        T(450, 1160, 'ASK US', 18, 'middle');
    },
    envelope: function () {   // contact: a letter on its way
      return R(220, 560, 460, 320, 10, 's1', 'ln', 2.4) + P('M220 570L450 740L680 570', 's2', 'ln', 2) +
        R(270, 420, 360, 220, 6, 's3', 'ln', 1.8) + F(P('M300 460H560M300 490H600M300 520H520', 'x', 'hd'), 's4') +
        R(590, 590, 60, 70, 4, 's5', 'dm') + P('M680 520Q780 420 760 300', 's6', 'dm') + P('M748 318L760 300L776 316', 's6', 'dm') +
        "<rect x='220' y='560' width='460' height='320' rx='10' style='fill:var(--bp-ac);fill-opacity:0' data-done/>" +
        T(450, 940, 'FREE CONSULTATION', 18, 'middle');
    },
    referral: function () {   // referrals: one introduction leads to the next
      return R(170, 560, 240, 170, 8, 's1', 'ln', 2.2) + P('M170 566L290 650L410 566', 's2', 'ln', 1.8) +
        R(490, 760, 240, 170, 8, 's3', 'ln', 2.2) + P('M490 766L610 850L730 766', 's4', 'ln', 1.8) +
        P('M410 650Q500 640 520 750', 's5', 'dm') + P('M506 736L520 752L532 734', 's5', 'dm') +
        R(560, 520, 140, 70, 35, 's6', 'ln', 2) + "<rect x='560' y='520' width='140' height='70' rx='35' style='fill:var(--bp-ac);fill-opacity:0' data-done/>" +
        T(630, 563, '15%', 22, 'middle', 'labels', '--bp-ac') + T(290, 780, 'YOU', 16, 'middle') + T(610, 980, 'THEM', 16, 'middle');
    },
    shield: function () {   // legal: plain terms
      return P('M450 420L680 500V720Q680 940 450 1040Q220 940 220 720V500Z', 's1', 'ln', 2.6) +
        F(P('M450 470L630 535V720Q630 900 450 985Q270 900 270 720V535Z', 'x', 'hd', 0, "stroke-dasharray='10 7'"), 's2') +
        P('M360 730L425 795L550 650', 's3', 'ln', 3) +
        "<path d='M450 420L680 500V720Q680 940 450 1040Q220 940 220 720V500Z' style='fill:var(--bp-ac);fill-opacity:0' data-done/>" +
        F(P('M740 560H840M740 600H840M740 640H810', 'x', 'hd'), 's4') + T(450, 1110, 'PLAIN TERMS', 18, 'middle');
    }
  };

  // camera shots for hero mode: hard cuts, like the home page's match cut (s: zoom, rx/ry/rz: degrees, dx/dy: share of the frame)
  var SHOTS = [
    { s: 1.00, rx: 0,   ry: 0,   rz: 0,   dx: 0,    dy: 0 },      // wide
    { s: 2.05, rx: 0,   ry: 0,   rz: 0,   dx: .02,  dy: .06 },    // tight
    { s: 1.15, rx: 54,  ry: 0,   rz: -18, dx: 0,    dy: .04 },    // flat on the desk
    { s: 1.35, rx: 8,   ry: -40, rz: 0,   dx: -.04, dy: 0 },      // side angle
    { s: 2.90, rx: 0,   ry: 0,   rz: 4,   dx: -.06, dy: .12 },    // extreme close-up
    { s: .88,  rx: -24, ry: 22,  rz: 0,   dx: .03,  dy: -.02 }    // low and wide
  ];

  function markup(uid, hero, preset) {
    var draw = (PRESETS[preset] || PRESETS.device)();
    if (preset !== 'device') draw = draw.replace(/<text[^>]*>[^<]*<\/text>/g, '').replace(/<polyline[^>]*data-d='labels'\/>/g, '');   // words only on the blueprint
    if (hero) return "<g data-loop>" + draw + "</g>";   // grid lives on the hero itself so tilted shots never show an edge
    return "<defs>" +
      "<pattern id='g" + uid + "' width='20' height='20' patternUnits='userSpaceOnUse'><path d='M20 0H0V20' style='fill:none;stroke:var(--bp-g1)'/></pattern>" +
      "<pattern id='G" + uid + "' width='100' height='100' patternUnits='userSpaceOnUse'><rect width='100' height='100' fill='url(#g" + uid + ")'/><path d='M100 0H0V100' style='fill:none;stroke:var(--bp-g2);stroke-width:1.2'/></pattern>" +
      "</defs>" +
      "<rect x='0' y='0' width='900' height='1600' style='fill:var(--bp-bg)'/>" +
      "<rect x='0' y='0' width='900' height='1600' fill='url(#G" + uid + ")' data-f='grid'/>" +
      "<g data-loop>" + draw + "</g>";
  }

  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function ease(p) { return p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; }
  function win(k, t) { var w = CONFIG.t[k]; return w ? ease(clamp((t - w[0]) / (w[1] - w[0]))) : 1; }
  function theme(host, name) { var c = CONFIG.themes[name]; V.forEach(function (v, i) { host.style.setProperty(v, c[i]); }); }

  function mount(host, uid) {
    var hero = host.getAttribute('data-mode') === 'hero', preset = host.getAttribute('data-preset') || 'device';
    var cuts = (host.getAttribute('data-cuts') || '').split(/\s+/).filter(Boolean);
    var pal = CONFIG.palette, start = Math.max(0, pal.indexOf(cuts[0]));
    cuts = pal.slice(start).concat(pal.slice(0, start));
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', hero ? (innerWidth > 860 ? '-1500 160 2400 1240' : '-200 160 1300 1240') : '0 0 900 1600');
    svg.setAttribute('preserveAspectRatio', hero ? 'xMidYMid slice' : 'xMidYMid meet');
    if (hero) { svg.setAttribute('aria-hidden', 'true'); host.classList.add('bp-cam-host'); }
    else { svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', host.getAttribute('data-label') || 'Animated line drawing'); }
    theme(host, cuts[0]);
    svg.innerHTML = markup(uid, hero, preset);
    host.appendChild(svg);

    var draws = [].slice.call(svg.querySelectorAll('[data-d]')).filter(function (el) { return el.getTotalLength && el.getAttribute('data-d') !== 'x'; }).map(function (el) {
      var len = el.getTotalLength(); el.style.strokeDasharray = len + ' ' + len; return { el: el, len: len, key: el.getAttribute('data-d') };
    });
    var fades = [].slice.call(svg.querySelectorAll('[data-f]')).map(function (el) { return { el: el, key: el.getAttribute('data-f') }; });
    var done = svg.querySelector('[data-done]'), loop = svg.querySelector('[data-loop]');
    var lastShot = -1, cutN = -1, built = false;

    // aim the camera at the drawing's centre
    function aim() {
      var m = svg.getScreenCTM(), r = svg.getBoundingClientRect();
      if (!m) return;
      var px = 450 * m.a + 720 * m.c + m.e - r.left, py = 450 * m.b + 720 * m.d + m.f - r.top;
      svg.style.transformOrigin = px.toFixed(0) + 'px ' + py.toFixed(0) + 'px';
    }

    // the drawing builds once (tDraw stops once it is finished); the camera and colours keep cycling on t
    function render(t, tDraw) {
      if (tDraw === undefined) tDraw = t;
      if (!built) {
        draws.forEach(function (d) { d.el.style.strokeDashoffset = d.len * (1 - win(d.key, tDraw)); });
        fades.forEach(function (f) { f.el.style.opacity = win(f.key, tDraw); });
        built = tDraw >= CONFIG.t.done[1];
      }
      if (done) done.style.fillOpacity = 0;   // no filled highlight box
      if (!hero) return;
      var n = SHOTS.length, len = CONFIG.duration / n, i = Math.min(n - 1, Math.floor(t / len)), p = (t - i * len) / len, sh = SHOTS[i];
      if (i !== lastShot) { lastShot = i; cutN++; theme(host, cuts[cutN % cuts.length]); }   // the cut: new angle and new look in the same frame
      var push = 1 + .06 * p, w = host.clientWidth, h = host.clientHeight;      // a slow push inside each shot
      svg.style.transform = 'translate(' + (sh.dx * w).toFixed(1) + 'px,' + (sh.dy * h).toFixed(1) + 'px) rotateX(' + sh.rx + 'deg) rotateY(' + (sh.ry + 4 * p).toFixed(2) + 'deg) rotateZ(' + sh.rz + 'deg) scale(' + (sh.s * push).toFixed(3) + ')';
      host.style.setProperty('--bp-zoom', (sh.s * push).toFixed(3));
    }
    aim(); addEventListener('resize', aim);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { render(5.2); if (hero) svg.style.transform = 'none'; return; }
    var t0 = null, raf = 0, visible = true, held = 0, last = 0;
    function frame(now) {
      if (t0 === null) t0 = now - held;   // resume where it left off after being scrolled away, never rebuild
      var el = (now - t0) / 1000; last = el;
      render(el % CONFIG.duration, el);
      raf = visible ? requestAnimationFrame(frame) : 0;
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (!visible) { held = last * 1000; t0 = null; } else if (!raf) raf = requestAnimationFrame(frame); }).observe(host);
    } else raf = requestAnimationFrame(frame);
  }

  window.ZKKBlueprint = { config: CONFIG, presets: PRESETS, shots: SHOTS, mount: mount };
  [].slice.call(document.querySelectorAll('[data-blueprint]')).forEach(function (h, i) { mount(h, i); });
})();
