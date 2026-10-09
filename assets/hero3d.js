/* ═══════════════════════════════════════════════════════════════════
   ZKK Consulting — 3D network background
   Runs once for the hero, once for the footer.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (typeof THREE === 'undefined') return;

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  function paused() { return document.hidden || performance.now() < (window.ZKK_PAUSE || 0); }   // hero stops drawing while the page scrolls / the logo docks, so those stay smooth

  function initNetwork(containerId, nodeCount) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var W = container.clientWidth, H = container.clientHeight;
    if (!W || !H) return;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 1000);
    camera.position.z = 60;

    var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    container.appendChild(renderer.domElement);

    var dark = !!container.closest('.page-hero, footer');
    var navy = new THREE.Color(dark ? 0x7dffc0 : 0x1f3a5f);
    var accent = new THREE.Color(dark ? 0xffd36b : 0xb8860b);

    /*0x2e6e63 is the green
    #594b07 is gold
    #b8860b nicer gold
    */ 

    var nodes = [];
    var nodeGeo = new THREE.SphereGeometry(0.55, 8, 8);
    var nodeMat = new THREE.MeshBasicMaterial({ color: accent });
    var group = new THREE.Group();
    scene.add(group);

    var RADIUS = 34, MAX_DIST = 16;

    for (var i = 0; i < nodeCount; i++) {
      var mesh = new THREE.Mesh(nodeGeo, nodeMat);
      mesh.position.set(
        (Math.random() - 0.5) * RADIUS * 2,
        (Math.random() - 0.5) * RADIUS * 1.1,
        (Math.random() - 0.5) * RADIUS * 1.4
      );
      mesh.userData.baseScale = 0.7 + Math.random() * 0.6;
      mesh.userData.pulseOffset = Math.random() * Math.PI * 2;
      group.add(mesh);
      nodes.push(mesh);
    }

    var lineMat = new THREE.LineBasicMaterial({ color: navy, transparent: true, opacity: 0.4 });
    var linePositions = [];
    for (var a = 0; a < nodes.length; a++) {
      for (var b = a + 1; b < nodes.length; b++) {
        if (nodes[a].position.distanceTo(nodes[b].position) < MAX_DIST) {
          linePositions.push(
            nodes[a].position.x, nodes[a].position.y, nodes[a].position.z,
            nodes[b].position.x, nodes[b].position.y, nodes[b].position.z
          );
        }
      }
    }


    var lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    group.add(new THREE.LineSegments(lineGeo, lineMat));

    var knot = null;
    var visible = true;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(container);
    }

    var targetRotX = 0, targetRotY = 0;
    window.addEventListener('mousemove', function (e) {
      targetRotY = ((e.clientX / window.innerWidth) - 0.5) * 0.25;
      targetRotX = ((e.clientY / window.innerHeight) - 0.5) * 0.15;
    });

    var clock = new THREE.Clock();


    function tick() {
      var t = clock.getElapsedTime();


      if (!visible || paused()) { requestAnimationFrame(tick); return; }
      if (knot) { knot.rotation.x = t * 0.25; knot.rotation.y = t * 0.18; }
      group.rotation.y += 0.0009;
      group.rotation.x += (targetRotX - group.rotation.x) * 0.02;
      nodes.forEach(function (n) {


        var s = n.userData.baseScale + Math.sin(t * 1.2 + n.userData.pulseOffset) * 0.18;
        n.scale.setScalar(s);
      });
      renderer.render(scene, camera);
      requestAnimationFrame(tick);
    }
    tick();

    window.addEventListener('resize', function () {
      var w = container.clientWidth, h = container.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
  }

  function initCrystal(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;
    var W = container.clientWidth, H = container.clientHeight;
    if (!W || !H) return;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 1000);
    camera.position.z = 55;
    var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    container.appendChild(renderer.domElement);

    var MINT = 0x7dffc0, TEAL = 0x3fd0c0, GOLD = 0xffd36b;
    var rig = new THREE.Group();
    scene.add(rig);

    var geo = new THREE.IcosahedronGeometry(11, 1);
    var core = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: TEAL, transparent: true, opacity: 0.07 }));
    var edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: MINT, transparent: true, opacity: 0.6 }));
    var inner = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(5.5, 0)), new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0.6 }));
    rig.add(core, edges, inner);

    // beads render in a second pass with a depth-only sphere (the crystal) so they go behind it for real
    var beadScene = new THREE.Scene(), beadRig = new THREE.Group();
    beadScene.add(beadRig);
    var occluder = new THREE.Mesh(new THREE.SphereGeometry(10.6, 32, 24), new THREE.MeshBasicMaterial({ colorWrite: false }));
    occluder.renderOrder = -1; beadRig.add(occluder);
    renderer.autoClear = false;
    var rings = [];
    [[17, MINT, 0.5], [21, TEAL, 0.35], [25, GOLD, 0.3]].forEach(function (r, i) {
      var ring = new THREE.Mesh(
        new THREE.TorusGeometry(r[0], 0.12, 8, 120),
        new THREE.MeshBasicMaterial({ color: r[1], transparent: true, opacity: r[2] })
      );
      ring.rotation.set(Math.PI / 2 + i * 0.5, i * 0.7, 0);
      var bead = new THREE.Mesh(new THREE.SphereGeometry(0.7, 12, 12), new THREE.MeshBasicMaterial({ color: r[1] }));
      ring.userData = { bead: bead, r: r[0], speed: 0.09 + i * 0.04 };
      rig.add(ring); beadRig.add(bead);
      rings.push(ring);
    });

    var N = 240, pos = new Float32Array(N * 3);
    for (var i = 0; i < N; i++) {
      var rad = 14 + Math.random() * 38, th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = rad * Math.sin(ph) * Math.cos(th);
      pos[i * 3 + 1] = rad * Math.sin(ph) * Math.sin(th) * 0.7;
      pos[i * 3 + 2] = rad * Math.cos(ph);
    }
    var pg = new THREE.BufferGeometry();
    pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    var dust = new THREE.Points(pg, new THREE.PointsMaterial({ color: MINT, size: 0.22, transparent: true, opacity: 0.5 }));
    scene.add(dust);

    function place() {
      var wide = container.clientWidth > 900;
      var halfW = 55 * Math.tan(Math.PI / 8) * (container.clientWidth / container.clientHeight);
      rig.position.set(wide ? halfW * 0.84 : 0, wide ? -2 : 5, -10);
      rig.scale.setScalar(wide ? 0.62 : 0.7);
    }
    place();

    var mx = 0, my = 0, visible = true;
    window.addEventListener('pointermove', function (e) {
      mx = (e.clientX / window.innerWidth - 0.5); my = (e.clientY / window.innerHeight - 0.5);
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(container);
    }
    window.addEventListener('resize', function () {
      var w = container.clientWidth, h = container.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h); place();
    });

    var clock = new THREE.Clock();
    (function tick() {
      requestAnimationFrame(tick);
      if (!visible || paused()) return;
      var t = clock.getElapsedTime() * (window.innerWidth > 900 ? 1.7 : 1), sy = window.pageYOffset || 0;
      edges.rotation.y = t * 0.06 + sy * 0.001; edges.rotation.x = t * 0.035;
      core.rotation.copy(edges.rotation);
      inner.rotation.y = -t * 0.14; inner.rotation.z = t * 0.08;
      var pulse = 1 + Math.sin(t * 0.5) * 0.03; inner.scale.setScalar(pulse);
      rings.forEach(function (ring, i) {
        ring.rotation.z = t * ring.userData.speed * (i % 2 ? -1 : 1);
        var a = t * ring.userData.speed * 1.6 + i * 2;
        var v = new THREE.Vector3(Math.cos(a) * ring.userData.r, Math.sin(a) * ring.userData.r, 0).applyEuler(ring.rotation);
        ring.userData.bead.position.copy(v);
      });
      dust.rotation.y = t * 0.008; dust.rotation.x = Math.sin(t * 0.04) * 0.06;
      rig.rotation.y += (mx * 0.4 - rig.rotation.y) * 0.02;
      rig.rotation.x += (my * 0.25 - rig.rotation.x) * 0.02;
      beadRig.position.copy(rig.position); beadRig.rotation.copy(rig.rotation); beadRig.scale.copy(rig.scale);
      renderer.clear();
      renderer.render(scene, camera);
      renderer.clearDepth();
      renderer.render(beadScene, camera);
    })();
  }

  // Brand diamond (the logo's gold star): a static, dark gold gem with thin white lines around it
  function initGem(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;
    var W = container.clientWidth, H = container.clientHeight;
    if (!W || !H) return;
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 1000);
    camera.position.z = 55;
    var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.appendChild(renderer.domElement);

    var gem = new THREE.Group(); scene.add(gem);
    var geo = new THREE.OctahedronGeometry(8, 0);
    var body = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({ color: 0x6b4a0d, emissive: 0x1a1200, specular: 0x6e5018, shininess: 40, flatShading: true }));
    var edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: 0xe9c777, transparent: true, opacity: 0.35 }));
    var lines = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.OctahedronGeometry(11, 0)), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2 }));   // slight, small white lines around the gem
    gem.add(body, edges, lines);
    gem.rotation.set(0.2, 0.65, 0);
    scene.add(new THREE.AmbientLight(0xffffff, 0.28));
    var key = new THREE.DirectionalLight(0xffe2a0, 0.38); key.position.set(18, 16, 35); scene.add(key);

    function place() {
      var wide = container.clientWidth > 900, halfW = 55 * Math.tan(Math.PI / 8) * (container.clientWidth / container.clientHeight);
      var k = wide ? 1 : 0.52, halfH = 55 * Math.tan(Math.PI / 8);
      gem.position.set(wide ? halfW * 0.7 : 0, wide ? -1 : (0.5 - 0.84) * 2 * halfH, 0);   // phones: centered in the empty space below the text
      gem.scale.set(0.42 * k, 0.72 * k, 0.42 * k);
    }
    place();
    window.addEventListener('resize', function () {
      var w = container.clientWidth, h = container.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h); place();
    });
    // gentle turn: a slow sway around its axis (not a spin) so the facets catch the light
    var visible = true, clock = new THREE.Clock();
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(container);
    (function tick() {
      requestAnimationFrame(tick);
      if (!visible || paused()) return;
      var t = clock.getElapsedTime();
      gem.rotation.set(0.2 + Math.sin(t * 0.45) * 0.1, 0.65 + Math.sin(t * 0.38) * 0.6, Math.sin(t * 0.3) * 0.04);
      renderer.render(scene, camera);
    })();
  }

  // Earth globe (test): a huge, dark, see-through wireframe globe with dotted continents, bleeding off the right edge and turning slowly. Land comes from assets/earth-mask.jpg (land = black)
  function initGlobe(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;
    var W = container.clientWidth, H = container.clientHeight;
    if (!W || !H) return;
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 1000);
    camera.position.z = 55;
    var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    container.appendChild(renderer.domElement);

    var R = 20, rig = new THREE.Group(), earth = new THREE.Group();
    rig.rotation.z = 0.25; rig.rotation.x = 0.6; rig.add(earth); scene.add(rig);
    var occ = new THREE.Mesh(new THREE.SphereGeometry(R * 0.995, 48, 32), new THREE.MeshBasicMaterial({ colorWrite: false }));   // hides the far side's dots and lines
    occ.renderOrder = -1; rig.add(occ);

    var grid = [], N = 72;                                                    // graticule every 15 degrees
    function ll(lat, lon, r) { var p = (90 - lat) * Math.PI / 180, t = lon * Math.PI / 180; return [-r * Math.sin(p) * Math.cos(t), r * Math.cos(p), r * Math.sin(p) * Math.sin(t)]; }
    for (var lon = 0; lon < 360; lon += 15) for (var i = 0; i < N; i++) { var a = ll(-90 + 180 * i / N, lon, R), b = ll(-90 + 180 * (i + 1) / N, lon, R); grid.push(a[0], a[1], a[2], b[0], b[1], b[2]); }
    for (var lat = -75; lat <= 75; lat += 15) for (var j = 0; j < N; j++) { var c = ll(lat, 360 * j / N, R), d = ll(lat, 360 * (j + 1) / N, R); grid.push(c[0], c[1], c[2], d[0], d[1], d[2]); }
    var gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.Float32BufferAttribute(grid, 3));
    earth.add(new THREE.LineSegments(gg, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3, depthWrite: false })));

    var dal = ll(32.78, -96.8, R * 1.004), dgeo = new THREE.BufferGeometry();       // one gold dot over Dallas, TX, same size as the map dots
    dgeo.setAttribute('position', new THREE.Float32BufferAttribute(dal, 3));
    earth.add(new THREE.Points(dgeo, new THREE.PointsMaterial({ color: 0xffc933, size: 0.3, transparent: true, opacity: 1, depthWrite: false })));

    var img = new Image();                                                    // dotted continents sampled from the land mask
    img.onload = function () {
      var cw = 512, ch = 256, c = document.createElement('canvas'); c.width = cw; c.height = ch;
      var x = c.getContext('2d'); x.drawImage(img, 0, 0, cw, ch);
      var p = x.getImageData(0, 0, cw, ch).data, pts = [], coast = [];
      function land(r, c) { return r >= 0 && r < ch && c >= 0 && c < cw && p[(r * cw + ((c + cw) % cw)) * 4] < 12; }
      for (var row = 0; row < ch; row += 2) {
        var la = 90 - (row + 0.5) * 180 / ch, step = Math.max(2, Math.round(2 / Math.max(0.12, Math.cos(la * Math.PI / 180))));   // fewer dots near the poles
        for (var col = 0; col < cw; col += step) if (land(row, col)) {
          var q = ll(la, (col + 0.5) * 360 / cw - 180, R * 1.002);
          (land(row - 3, col) && land(row + 3, col) && land(row, col - 3) && land(row, col + 3) ? pts : coast).push(q[0], q[1], q[2]);   // coastline dots are brighter so continents read clearly
        }
      }
      function mk(arr, size, op) { var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3)); return new THREE.Points(g, new THREE.PointsMaterial({ color: 0xe6ece8, size: size, transparent: true, opacity: op, depthWrite: false })); }
      earth.add(mk(pts, 0.19, 0.5), mk(coast, 0.24, 0.9));
    };
    img.src = '/assets/earth-mask.jpg';

    var HALF_H = 55 * Math.tan(Math.PI / 8), start = 1.98;
    function place() {
      var wide = container.clientWidth > 900, halfW = HALF_H * (container.clientWidth / container.clientHeight);
      rig.position.set(wide ? halfW * 0.94 : 0, wide ? -2 : -HALF_H * 1.04, 0);   // phones: centred on the bottom edge, top half showing   // centre sits on/over the right edge so half the globe is off-screen
      rig.scale.setScalar(wide ? 1 : 0.72);
      rig.rotation.x = wide ? 0.6 : 0.8; rig.rotation.z = wide ? 0.25 : -0.7;   // phones: axis tilted well off vertical (no north pole straight up)
      start = wide ? 1.98 : 1.63;                                             // both layouts open with Dallas in view, left of centre (it drifts right as the globe turns)
    }
    place();
    window.addEventListener('resize', function () {
      var w = container.clientWidth, h = container.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h); place();
    });
    var visible = true, clock = new THREE.Clock();
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(container);
    (function tick() {
      requestAnimationFrame(tick);
      if (!visible || document.hidden) return;
      var tt = clock.getElapsedTime();
      earth.rotation.y = start + tt * 0.05;   // starts with Dallas in view
      renderer.render(scene, camera);
    })();
  }

  document.querySelectorAll('.page-hero').forEach(function (h) {
    var cv = h.querySelector('.hero-canvas');
    if (!cv) { cv = document.createElement('div'); cv.className = 'hero-canvas'; cv.setAttribute('aria-hidden', 'true'); h.appendChild(cv); }
    if (!cv.id) cv.id = 'heroCanvas';
    if (window.ZKK_CRYSTAL) initCrystal(cv.id); else if (window.ZKK_GEM) initGem(cv.id); else if (window.ZKK_GLOBE !== false) initGlobe(cv.id);   // ZKK gem is the hero 3D piece; window.ZKK_CRYSTAL = true brings the old atom back, window.ZKK_GEM = false removes both
  });
  initNetwork('footerCanvas', 28);
})();