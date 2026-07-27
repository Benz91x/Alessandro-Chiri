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
  var tourPaused = false; /* WCAG 2.2.2: il tour automatico è pausabile */

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
    for (k = 0; k < items.length; k++) {
      items[k].classList.toggle("on", k === i);
      items[k].setAttribute("aria-pressed", k === i ? "true" : "false"); /* stato esposto agli SR */
    }
    cd.classList.remove("fxg-swap");
    void cd.offsetWidth;
    cd.classList.add("fxg-swap");
  }
  window.__fxgFly = function (i) { showCardDOM(i); };

  /* ---------- caricamento three.js: idle, fuori dal cammino critico ---------- */
  var threeReady = false, pendingInit = false, preloading = false;
  function preload() {
    if (preloading) return;
    preloading = true;
    if (window.THREE) {
      threeReady = true;
      if (pendingInit) { pendingInit = false; safeInit(); }
      return;
    }
    var s = document.createElement("script");
    s.src = THREE_URL;
    s.onload = function () {
      threeReady = true;
      if (pendingInit) { pendingInit = false; safeInit(); }
    };
    s.onerror = function () {
      var sec = document.getElementById("fx-globe-sec");
      if (sec) sec.classList.add("fxg-noglobe");
    };
    document.body.appendChild(s);
  }
  function safeInit() {
    try { initGlobe(); }
    catch (err) {
      var c = document.getElementById("fxg-canvas");
      if (c) c.style.display = "none";
    }
  }
  function queuePreload() {
    if (window.requestIdleCallback) requestIdleCallback(function () { preload(); }, { timeout: 2500 });
    else setTimeout(preload, 1500);
  }
  /* Gli script FX vengono iniettati DOPO document.write: il parsing critico è
     già passato. Non dipendiamo dall'evento load (se una risorsa del template
     resta appesa, load non scatta e il globo non partirebbe mai). */
  queuePreload();
  addEventListener("load", queuePreload); /* fallback: preload() è idempotente */

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
      items += '<li><button type="button" class="fxg-item" data-i="' + i + '" aria-pressed="false">' +
        '<span class="fxg-city">' + p.city + '</span>' +
        '<span class="fxg-cli">' + p.clients.join(" · ") + '</span></button></li>';
    }
    sec.innerHTML =
      '<div class="fxg-wrap">' +
        '<div class="fxg-label"><span>◆</span><span class="fxg-rule"></span><span>ESPERIENZE &amp; TERRITORI</span></div>' +
        '<h2 class="fxg-title">Dove ho lavorato.</h2>' +
        '<p class="fxg-sub">Tre città, tre capitoli: ricerca a Bari, enterprise software a Roma, open innovation a Milano.</p>' +
        '<div class="fxg-stage">' +
          '<canvas id="fxg-canvas" role="img" aria-label="Mappa 3D delle città in cui ha lavorato Alessandro Chiri: Milano, Roma e Bari."></canvas>' +
          '<p class="fxg-sr" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;">' +
            'Globo decorativo: puoi trascinarlo per ruotarlo. Usa i pulsanti Milano, Roma e Bari qui sotto per esplorare città e clienti; ' +
            'il pulsante "Metti in pausa il tour" ferma il cambio automatico.</p>' +
          '<div class="fxg-card" id="fxg-card" aria-live="polite">' +
            '<div class="fxg-card-city" id="fxg-card-city"></div>' +
            '<div class="fxg-card-note" id="fxg-card-note"></div>' +
            '<ul class="fxg-card-clients" id="fxg-card-clients"></ul>' +
            '<div class="fxg-dots" id="fxg-dots" aria-hidden="true"></div>' +
          '</div>' +
        '</div>' +
        '<ul class="fxg-list">' + items + '</ul>' +
        '<button type="button" id="fxg-tour" aria-pressed="false" style="margin-top:16px;font-family:\'IBM Plex Mono\',monospace;' +
          'font-size:11px;letter-spacing:.08em;padding:7px 14px;border-radius:999px;border:1px solid var(--line2);' +
          'background:transparent;color:var(--muted);cursor:pointer;">⏸ Metti in pausa il tour</button>' +
      '</div>';
    anchor.parentNode.insertBefore(sec, anchor);
    showCardDOM(0);

    /* trigger extra: se la sezione si avvicina al viewport, forza il preload
       (copre il caso in cui requestIdleCallback venga posticipato a lungo) */
    if ("IntersectionObserver" in window) {
      var ioPre = new IntersectionObserver(function (es) {
        if (es[0].isIntersecting) { preload(); ioPre.disconnect(); }
      }, { rootMargin: "900px 0px" });
      ioPre.observe(sec);
    }

    /* pausa/riprendi il tour automatico (WCAG 2.2.2) */
    var tb = document.getElementById("fxg-tour");
    if (tb) {
      if (reduced) tb.style.display = "none"; /* in reduced-motion il tour non parte mai */
      tb.addEventListener("click", function () {
        tourPaused = !tourPaused;
        tb.setAttribute("aria-pressed", String(tourPaused));
        tb.textContent = tourPaused ? "▶ Riprendi il tour" : "⏸ Metti in pausa il tour";
      });
    }

    /* click sulle città -> vola il globo */
    sec.addEventListener("click", function (e) {
      var b = e.target && e.target.closest ? e.target.closest(".fxg-item") : null;
      if (b && window.__fxgFly) window.__fxgFly(+b.getAttribute("data-i"), true);
    });

    /* init appena three.js è pronto (o subito se già caricato) */
    if (threeReady || window.THREE) safeInit(); else pendingInit = true;
  }
  tryMount(0);

  /* ---------- globo ---------- */
  function initGlobe() {
    var canvas = document.getElementById("fxg-canvas");
    if (!canvas || !window.THREE) return;
    if (canvas.dataset.fxInit) return;
    canvas.dataset.fxInit = "1";
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    } catch (err) { canvas.style.display = "none"; return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5)); /* cap: costo GPU contenuto su mobile */

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.z = 3.4;
    var globe = new THREE.Group();
    scene.add(globe);
    var R = 1;
    var AXY = new THREE.Vector3(0, 1, 0), AXX = new THREE.Vector3(1, 0, 0);

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

    /* ---------- interazione: drag (con soglia intent touch) + inerzia leggera ---------- */
    var dragging = false, pendingDrag = false, isTouch = false;
    var sx = 0, sy = 0, px = 0, py = 0, lastUser = 0, vx = 0, vy = 0;
    canvas.style.touchAction = "pan-y";
    canvas.addEventListener("pointerdown", function (e) {
      isTouch = e.pointerType === "touch";
      pendingDrag = true;
      dragging = !isTouch; /* mouse: drag immediato; touch: prima soglia intent (niente tilt durante lo scroll) */
      sx = px = e.clientX; sy = py = e.clientY;
      vx = vy = 0;
      lastUser = performance.now();
      if (dragging && canvas.setPointerCapture) { try { canvas.setPointerCapture(e.pointerId); } catch (err) {} }
    });
    canvas.addEventListener("pointermove", function (e) {
      if (!pendingDrag && !dragging) return;
      var dx = e.clientX - px, dy = e.clientY - py; px = e.clientX; py = e.clientY;
      if (!dragging) { /* touch: decide l'intent solo dopo 9px di movimento */
        var tdx = e.clientX - sx, tdy = e.clientY - sy;
        if (tdx * tdx + tdy * tdy < 81) return;
        if (Math.abs(tdy) > Math.abs(tdx) * 1.2) { pendingDrag = false; return; } /* scroll verticale: lascia scorrere */
        dragging = true;
        if (canvas.setPointerCapture) { try { canvas.setPointerCapture(e.pointerId); } catch (err) {} }
        dx = tdx; dy = tdy;
      }
      vx = dx * 0.005; vy = dy * 0.003;
      var qy = new THREE.Quaternion().setFromAxisAngle(AXY, vx);
      var qx = new THREE.Quaternion().setFromAxisAngle(AXX, vy);
      globe.quaternion.premultiply(qy).premultiply(qx);
      lastUser = performance.now();
      if (reduced) schedule(); /* render-on-demand */
    });
    ["pointerup", "pointercancel", "pointerleave"].forEach(function (ev) {
      canvas.addEventListener(ev, function () {
        dragging = false; pendingDrag = false;
        lastUser = performance.now();
        if (reduced) { vx = vy = 0; schedule(); } /* niente inerzia in reduced-motion */
      });
    });

    /* ---------- tour automatico (delta-time: durata identica a ogni refresh rate) ---------- */
    var cur = 0, tourT = -1, flyStart = -1, FLY_MS = 1300;
    var qFrom = new THREE.Quaternion(), qTo = new THREE.Quaternion();
    function fly(i, manual) {
      cur = i;
      qFrom.copy(globe.quaternion);
      qTo.copy(qFor(PLACES[i]));
      tourT = 0;
      flyStart = performance.now();
      showCardDOM(i);
      if (manual) lastUser = performance.now() - 4000; /* tour riprende presto */
    }
    window.__fxgFly = fly;
    showCardDOM(0);

    /* ---------- zoom da scroll ---------- */
    var sec = document.getElementById("fx-globe-sec"), scrollZ = 3.4;
    function onScroll() {
      if (!sec) return;
      var r = sec.getBoundingClientRect(), vh = innerHeight;
      var p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
      scrollZ = 3.45 - p * 1.25;
      if (reduced) schedule();
    }
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    /* pausa del rendering quando la sezione è fuori viewport */
    var inView = true;
    if ("IntersectionObserver" in window && sec) {
      new IntersectionObserver(function (es) { inView = !!es[0].isIntersecting; },
        { rootMargin: "120px 0px" }).observe(sec);
    }

    /* ---------- resize ---------- */
    function resize() {
      var w = canvas.clientWidth || 600, h = canvas.clientHeight || 420;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      if (reduced) schedule();
    }
    addEventListener("resize", resize, { passive: true });
    resize();

    /* ---------- render-on-demand (reduced-motion): nessun loop infinito ---------- */
    var rafPend = false;
    function renderFrame() {
      camera.position.z = scrollZ;
      renderer.render(scene, camera);
    }
    function schedule() {
      if (rafPend) return;
      rafPend = true;
      requestAnimationFrame(function () { rafPend = false; renderFrame(); });
    }

    /* ---------- tema ---------- */
    function recolor() {
      var a = new THREE.Color(accent());
      landMat.color = a; arcMat.color = a;
      atm.material.uniforms.uColor.value = a;
      occ.material.color = new THREE.Color(bgColor());
      markers.forEach(function (m) { m.material.map = glowTexture(); m.material.needsUpdate = true; });
      if (reduced) schedule();
    }
    new MutationObserver(recolor).observe(document.documentElement,
      { subtree: true, attributes: true, attributeFilter: ["data-theme"] });

    /* ---------- loop (solo motion pieno; frame-rate independent) ---------- */
    var t0 = performance.now(), lastT = t0;
    function frame(now) {
      if (reduced) return;
      var dt = Math.min(50, now - lastT); lastT = now;
      if (!inView) { requestAnimationFrame(frame); return; } /* offscreen: loop a costo ~0 */
      var t = (now - t0) / 1000, st = dt / 16.7;
      /* autorotazione lenta quando inattivo */
      if (!dragging && now - lastUser > 5000 && tourT < 0) {
        globe.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(AXY, 0.0011 * st));
      }
      /* inerzia dopo il rilascio del drag, con damping esponenziale */
      if (!dragging && (Math.abs(vx) > 0.00005 || Math.abs(vy) > 0.00005)) {
        globe.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(AXY, vx * st));
        globe.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(AXX, vy * st));
        var dmp = Math.pow(0.94, st); vx *= dmp; vy *= dmp;
      }
      /* tween tour */
      if (tourT >= 0) {
        tourT = Math.min(1, (now - flyStart) / FLY_MS);
        var e2 = tourT < 0.5 ? 4 * tourT * tourT * tourT : 1 - Math.pow(-2 * tourT + 2, 3) / 2;
        globe.quaternion.slerpQuaternions(qFrom, qTo, e2);
        if (tourT >= 1) tourT = -1;
      } else if (!dragging && !tourPaused && now - lastUser > 6500) {
        /* prossima tappa */
        if (!frame.next || now > frame.next) { frame.next = now + 5500; fly((cur + 1) % PLACES.length); }
      }
      /* pulsazione marker */
      for (var i = 0; i < markers.length; i++) {
        var s = (i === cur ? 0.19 : 0.13) + Math.sin(t * 2.4 + i * 2) * 0.02;
        markers[i].scale.set(s, s, 1);
      }
      var k = 1 - Math.pow(0.94, st); /* lerp zoom normalizzato sul dt */
      camera.position.z += ((scrollZ * (tourT >= 0 ? 0.94 : 1)) - camera.position.z) * k;
      renderer.render(scene, camera);
      requestAnimationFrame(frame);
    }
    if (reduced) {
      /* statico di default, reattivo ai gesti espliciti: il "volo" è uno snap immediato */
      var flyAnim = fly;
      window.__fxgFly = fly = function (i, m) {
        flyAnim(i, m);
        globe.quaternion.copy(qTo); tourT = -1;
        schedule();
      };
      renderFrame(); recolor(); renderFrame();
    } else {
      requestAnimationFrame(frame);
    }
  }
})();
