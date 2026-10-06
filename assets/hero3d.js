/* ═══════════════════════════════════════════════════════════════════
   ZKK Consulting — 3D network background
   Runs once for the hero, once for the footer.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (typeof THREE === 'undefined') return;

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

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


      if (!visible) { requestAnimationFrame(tick); return; }
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

    var rings = [];
    [[17, MINT, 0.5], [21, TEAL, 0.35], [25, GOLD, 0.3]].forEach(function (r, i) {
      var ring = new THREE.Mesh(
        new THREE.TorusGeometry(r[0], 0.12, 8, 120),
        new THREE.MeshBasicMaterial({ color: r[1], transparent: true, opacity: r[2] })
      );
      ring.rotation.set(Math.PI / 2 + i * 0.5, i * 0.7, 0);
      var bead = new THREE.Mesh(new THREE.SphereGeometry(0.7, 12, 12), new THREE.MeshBasicMaterial({ color: r[1] }));
      ring.userData = { bead: bead, r: r[0], speed: 0.09 + i * 0.04 };
      rig.add(ring, bead);
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
      rig.position.set(wide ? halfW * 0.84 : 0, wide ? -2 : -9, -10);
      rig.scale.setScalar(wide ? 0.62 : 0.55);
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
      if (!visible || document.hidden) return;
      var t = clock.getElapsedTime(), sy = window.pageYOffset || 0;
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
      renderer.render(scene, camera);
    })();
  }

  document.querySelectorAll('.page-hero').forEach(function (h) {
    var cv = h.querySelector('.hero-canvas');
    if (!cv) { cv = document.createElement('div'); cv.className = 'hero-canvas'; cv.setAttribute('aria-hidden', 'true'); h.appendChild(cv); }
    if (!cv.id) cv.id = 'heroCanvas';
    initCrystal(cv.id);
  });
  initNetwork('footerCanvas', 28);
})();