/* ===== FX GLOBE — mappa mondo 3D: dove ho lavorato & clienti principali ===== */
(function () {
  "use strict";
  var THREE_URL = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";

  var PLACES = [
    { city: "MILANO", lat: 45.4642, lon: 9.1900,
      clients: ["Deloitte Innovation & Ventures"],
      note: "OPEN INNOVATION · VENTURES" },
    { city: "ROMA", lat: 41.9028, lon: 12.4964,
      clients: ["OpenFiber", "Enel", "MicroCyber × Ente Nazionale del Microcredito"],
      note: "UTILITY · ENERGIA · FINANZA AGEVOLATA" },
    { city: "BARI", lat: 41.1171, lon: 16.8719,
      clients: ["Politecnico di Bari"],
      note: "RICERCA · TRASFERIMENTO TECNOLOGICO" }
  ];
  var ARCS = [[0, 1], [1, 2], [0, 2]];
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- card UI (indipendente dal 3D) ---------- */
  function showCardDOM(i) {
    var p = PLACES[i], h = "", k;
    var cc = document.getElementById("fxg-card-city"),
        cn = document.getElementById("fxg-card-note"),
        cl = document.getElementById("fxg-card-clients"),
        dt = document.getElementById("fxg-dots"),
        cd = document.getElementById("fxg-card");
    if (!cc) return;
    cc.textContent = p.city;
    cn.textContent = p.note;
    for (k = 0; k < p.clients.length; k++) h += "<li>" + p.clients[k] + "</li>";
    cl.innerHTML = h;
    var d = "";
    for (k = 0; k < PLACES.length; k++) d += '<span class="' + (k === i ? "on" : "") + '"></span>';
    dt.innerHTML = d;
    var items = document.querySelectorAll(".fxg-item");
    for (k = 0; k < items.length; k++) items[k].classList.toggle("on", k === i);
    cd.classList.remove("fxg-swap");
    void cd.offsetWidth;
    cd.classList.add("fxg-swap");
  }
  window.__fxgFly = function (i) { showCardDOM(i); };

  /* ---------- iniezione sezione ---------- */
  function tryMount(n) {
    var anchor = document.getElementById("contatti");
    if (!anchor) { if (n < 60) setTimeout(function () { tryMount(n + 1); }, 400); return; }
    if (document.getElementById("fx-globe-sec")) return;

    var sec = document.createElement("section");
    sec.id = "fx-globe-sec";
    var items = "", i, p;
    for (i = 0; i < PLACES.length; i++) {
      p = PLACES[i];
      items += '<li><button type="button" class="fxg-item" data-i="' + i + '">' +
        '<span class="fxg-city">' + p.city + '</span>' +
        '<span class="fxg-cli">' + p.clients.join(" · ") + '</span></button></li>';
    }
    sec.innerHTML =
      '<div class="fxg-wrap">' +
        '<div class="fxg-label"><span>◆</span><span class="fxg-rule"></span><span>CLIENTI &amp; TERRITORI</span></div>' +
        '<h2 class="fxg-title">Dove ho lavorato.</h2>' +
        '<p class="fxg-sub">Da Bari a Roma a Milano: trascina il globo, o lascia che sia il tour a portarti sul posto.</p>' +
        '<div class="fxg-stage">' +
          '<canvas id="fxg-canvas" aria-label="Mappa 3D delle città in cui ha lavorato Alessandro Chiri"></canvas>' +
          '<div class="fxg-card" id="fxg-card">' +
            '<div class="fxg-card-city" id="fxg-card-city"></div>' +
            '<div class="fxg-card-note" id="fxg-card-note"></div>' +
            '<ul class="fxg-card-clients" id="fxg-card-clients"></ul>' +
            '<div class="fxg-dots" id="fxg-dots"></div>' +
          '</div>' +
        '</div>' +
        '<ul class="fxg-list">' + items + '</ul>' +
      '</div>';
    anchor.parentNode.insertBefore(sec, anchor);
    showCardDOM(0);

    /* click sulle città -> vola il globo */
    sec.addEventListener("click", function (e) {
      var b = e.target && e.target.closest ? e.target.closest(".fxg-item") : null;
      if (b && window.__fxgFly) window.__fxgFly(+b.getAttribute("data-i"), true);
    });

    /* lazy-load three.js quando la sezione si avvicina */
    var loaded = false;
    function preload() {
      if (loaded) return; loaded = true;
      var s = document.createElement("script");
      s.src = THREE_URL;
      s.onload = function () {
        try { initGlobe(); }
        catch (err) {
          var c = document.getElementById("fxg-canvas");
          if (c) c.style.display = "none";
        }
      };
      s.onerror = function () { sec.classList.add("fxg-noglobe"); };
      document.body.appendChild(s);
    }
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (en) { if (en.isIntersecting) { io.disconnect(); preload(); } });
      }, { rootMargin: "700px" });
      io.observe(sec);
    } else preload();
  }
  tryMount(0);

  /* ---------- globo ---------- */
  function initGlobe() {
    var canvas = document.getElementById("fxg-canvas");
    if (!canvas || !window.THREE) return;
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    } catch (err) { canvas.style.display = "none"; return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.z = 3.4;
    var globe = new THREE.Group();
    scene.add(globe);
    var R = 1;

    function accent() {
      var v = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
      return v || "#2dd4bf";
    }
    function bgColor() {
      var r = document.getElementById("ac-root");
      return getComputedStyle(r || document.body).backgroundColor || "#07090c";
    }

    /* occluder: nasconde i punti sul retro */
    var occ = new THREE.Mesh(
      new THREE.SphereGeometry(R * 0.985, 48, 48),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(bgColor()) })
    );
    globe.add(occ);

    /* atmosfera */
    var atm = new THREE.Mesh(
      new THREE.SphereGeometry(R * 1.16, 48, 48),
      new THREE.ShaderMaterial({
        transparent: true, side: THREE.BackSide, depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uColor: { value: new THREE.Color(accent()) } },
        vertexShader: "varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal);" +
          " gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
        fragmentShader: "uniform vec3 uColor; varying vec3 vN;" +
          " void main(){ float i = pow(0.72 - dot(vN, vec3(0.0,0.0,1.0)), 3.5);" +
          " gl_FragColor = vec4(uColor, 1.0) * i; }"
      })
    );
    scene.add(atm);

    function ll(lat, lon, r) {
      var phi = (90 - lat) * Math.PI / 180, th = (lon + 180) * Math.PI / 180;
      return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th));
    }

    /* punti terra (continenti veri, da fx/globe-land.js) */
    var landPts = null, landMat = new THREE.PointsMaterial({
      color: new THREE.Color(accent()), size: 0.016, transparent: true,
      opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false
    });
    function buildPoints(positions) {
      var g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      if (landPts) globe.remove(landPts);
      landPts = new THREE.Points(g, landMat);
      globe.add(landPts);
    }
    function fallbackGrid() {
      var arr = [], N = 2600, k, la, lo, v;
      for (k = 0; k < N; k++) {
        la = Math.asin(-1 + 2 * k / N) * 180 / Math.PI;
        lo = (k * 137.508) % 360 - 180;
        if (la < -62) continue;
        v = ll(la, lo, R); arr.push(v.x, v.y, v.z);
      }
      buildPoints(arr);
    }
    (function landFromData() {
      try {
        var step = window.__FXG_LAND_STEP || 2.5;
        var bin = atob(window.__FXG_LAND || ""), arr = [], i, la, lo, v;
        for (i = 0; i + 1 < bin.length; i += 2) {
          la = bin.charCodeAt(i) * step - 90;
          lo = bin.charCodeAt(i + 1) * step - 180;
          v = ll(la, lo, R); arr.push(v.x, v.y, v.z);
        }
        if (arr.length > 1500) buildPoints(arr); else fallbackGrid();
      } catch (e) { fallbackGrid(); }
    })();

    /* marker */
    function glowTexture() {
      var c = document.createElement("canvas"); c.width = c.height = 64;
      var x = c.getContext("2d"), g = x.createRadialGradient(32, 32, 2, 32, 32, 30);
      g.addColorStop(0, "rgba(255,255,255,0.85)");
      g.addColorStop(0.22, accent());
      g.addColorStop(1, "rgba(0,0,0,0)");
      x.fillStyle = g; x.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(c);
    }
    var markers = [];
    PLACES.forEach(function (p, i) {
      var sp = new THREE.Sprite(new THREE.SpriteMaterial({
        map: glowTexture(), transparent: true, depthWrite: false,
        blending: THREE.AdditiveBlending
      }));
      sp.position.copy(ll(p.lat, p.lon, R * 1.01));
      sp.scale.set(0.13, 0.13, 1);
      globe.add(sp);
      markers.push(sp);
    });

    /* archi tra le città */
    var arcMat = new THREE.LineDashedMaterial({
      color: new THREE.Color(accent()), dashSize: 0.06, gapSize: 0.035,
      transparent: true, opacity: 0.55
    });
    ARCS.forEach(function (pr) {
      var a = ll(PLACES[pr[0]].lat, PLACES[pr[0]].lon, R),
          b = ll(PLACES[pr[1]].lat, PLACES[pr[1]].lon, R);
      var mid = a.clone().add(b).multiplyScalar(0.5).normalize()
        .multiplyScalar(R * (1.25 + a.distanceTo(b) * 0.35));
      var curve = new THREE.QuadraticBezierCurve3(a, mid, b);
      var g = new THREE.BufferGeometry().setFromPoints(curve.getPoints(60));
      var line = new THREE.Line(g, arcMat);
      line.computeLineDistances();
      globe.add(line);
    });

    /* orientamento iniziale: Italia al centro */
    var ZED = new THREE.Vector3(0.22, 0.06, 1).normalize();
    function qFor(p) {
      return new THREE.Quaternion().setFromUnitVectors(
        ll(p.lat, p.lon, 1).normalize(), ZED);
    }
    globe.quaternion.copy(qFor({ lat: 42.6, lon: 12.4 }));

    /* ---------- interazione: drag + autorotazione ---------- */
    var dragging = false, px = 0, py = 0, lastUser = 0;
    canvas.style.touchAction = "pan-y";
    canvas.addEventListener("pointerdown", function (e) {
      dragging = true; px = e.clientX; py = e.clientY; lastUser = performance.now();
      canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var dx = e.clientX - px, dy = e.clientY - py; px = e.clientX; py = e.clientY;
      var qy = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), dx * 0.005);
      var qx = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), dy * 0.003);
      globe.quaternion.premultiply(qy).premultiply(qx);
      lastUser = performance.now();
    });
    ["pointerup", "pointercancel", "pointerleave"].forEach(function (ev) {
      canvas.addEventListener(ev, function () { dragging = false; lastUser = performance.now(); });
    });

    /* ---------- tour automatico ---------- */
    var cur = 0, tourT = -1, qFrom = new THREE.Quaternion(), qTo = new THREE.Quaternion();
    function fly(i, manual) {
      cur = i;
      qFrom.copy(globe.quaternion);
      qTo.copy(qFor(PLACES[i]));
      tourT = 0;
      showCardDOM(i);
      if (manual) lastUser = performance.now() - 4000; /* tour riprende presto */
    }
    window.__fxgFly = fly;
    showCardDOM(0);

    /* ---------- zoom da scroll ---------- */
    var sec = document.getElementById("fx-globe-sec"), scrollZ = 3.4;
    function onScroll() {
      var r = sec.getBoundingClientRect(), vh = innerHeight;
      var p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
      scrollZ = 3.45 - p * 1.25;
    }
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    /* ---------- resize ---------- */
    function resize() {
      var w = canvas.clientWidth || 600, h = canvas.clientHeight || 420;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    addEventListener("resize", resize, { passive: true });
    resize();

    /* ---------- tema ---------- */
    function recolor() {
      var a = new THREE.Color(accent());
      landMat.color = a; arcMat.color = a;
      atm.material.uniforms.uColor.value = a;
      occ.material.color = new THREE.Color(bgColor());
      markers.forEach(function (m) { m.material.map = glowTexture(); m.material.needsUpdate = true; });
    }
    new MutationObserver(recolor).observe(document.documentElement,
      { subtree: true, attributes: true, attributeFilter: ["data-theme"] });

    /* ---------- loop ---------- */
    var t0 = performance.now();
    function frame(now) {
      var t = (now - t0) / 1000;
      /* autorotazione lenta quando inattivo */
      if (!dragging && !reduced && now - lastUser > 5000 && tourT < 0) {
        globe.quaternion.premultiply(
          new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0.0011));
      }
      /* tween tour */
      if (tourT >= 0) {
        tourT = Math.min(1, tourT + 0.016);
        var e2 = tourT < 0.5 ? 4 * tourT * tourT * tourT : 1 - Math.pow(-2 * tourT + 2, 3) / 2;
        globe.quaternion.slerpQuaternions(qFrom, qTo, e2);
        if (tourT >= 1) tourT = -1;
      } else if (!reduced && !dragging && now - lastUser > 6500) {
        /* prossima tappa */
        if (!frame.next || now > frame.next) { frame.next = now + 5500; fly((cur + 1) % PLACES.length); }
      }
      /* pulsazione marker */
      for (var i = 0; i < markers.length; i++) {
        var s = (i === cur ? 0.19 : 0.13) + Math.sin(t * 2.4 + i * 2) * 0.02;
        markers[i].scale.set(s, s, 1);
      }
      camera.position.z += ((scrollZ * (tourT >= 0 ? 0.94 : 1)) - camera.position.z) * 0.06;
      renderer.render(scene, camera);
      if (!reduced) requestAnimationFrame(frame);
    }
    if (reduced) { renderer.render(scene, camera); recolor(); renderer.render(scene, camera); }
    else requestAnimationFrame(frame);
  }
})();
