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

  /* ---------- caricamento three.js: DOPO window load + idle (fuori dal cammino critico) ---------- */
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
    /* CDN secondario, già schedulato a idle: priorità bassa per non rubare
       banda al template. fetchPriority è ignorata dove non supportata. */
    try { s.fetchPriority = "low"; if (s.fetchPriority !== "low") s.setAttribute("fetchpriority", "low"); }
    catch (e) { try { s.setAttribute("fetchpriority", "low"); } catch (e2) {} }
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
          '<p class="fxg-sr">' +
            'Globo decorativo: puoi trascinarlo per ruotarlo. Usa i pulsanti Milano, Roma e Bari qui sotto — o clicca i punti luminosi sul globo — ' +
            'per avvicinarti a una città e vedere i clienti. Quando sei su una città, il pulsante «Torna in orbita» o il tasto ESC ti riportano ' +
            'alla vista globo. Il pulsante «Metti in pausa il tour» ferma il cambio automatico.</p>' +
          '<p class="fxg-sr" id="fxg-live" aria-live="polite"></p>' +
          '<div class="fxh" id="fxh" aria-hidden="true">' +
            '<div class="fxh-scrim"></div>' +
            '<div class="fxh-corner fxh-corner--tl"><div class="fxh-tele">' +
              '<span class="fxh-label">ALT</span>' +
              '<span><span class="fxh-value" id="fxh-alt">420</span><span class="fxh-unit" id="fxh-alt-u">km</span></span>' +
            '</div></div>' +
            '<div class="fxh-corner fxh-corner--tr"><div class="fxh-tele fxh-tele--right">' +
              '<div><span class="fxh-label">LAT</span> <span class="fxh-value fxh-geo" id="fxh-lat">45.4642°N</span></div>' +
              '<div><span class="fxh-label">LON</span> <span class="fxh-value fxh-geo" id="fxh-lon">09.1900°E</span></div>' +
            '</div></div>' +
            '<div class="fxh-corner fxh-corner--br"><div class="fxh-status">' +
              '<span class="fxh-dot"></span><span class="fxh-value" id="fxh-status">TARGET LOCK</span>' +
            '</div></div>' +
          '</div>' +
          '<button type="button" class="fxh-back" id="fxh-back" aria-label="Torna alla vista globo">↑ TORNA IN ORBITA</button>' +
          '<div class="fxh-hint" id="fxh-hint" aria-hidden="true">' +
            '<span class="fxh-hint-kb">ESC · torna al globo</span><span class="fxh-hint-touch">Tocca fuori per tornare al globo</span>' +
          '</div>' +
          '<div class="fxg-ping" id="fxg-ping" aria-hidden="true"><i></i><i></i></div>' +
          '<div class="fxg-card" id="fxg-card" aria-live="polite">' +
            '<div class="fxg-dive-bar" aria-hidden="true"></div>' +
            '<div class="fxg-card-city fxg-dive-city" id="fxg-card-city"></div>' +
            '<div class="fxg-card-note" id="fxg-card-note"></div>' +
            '<ul class="fxg-card-clients" id="fxg-card-clients"></ul>' +
            '<div class="fxg-dots" id="fxg-dots" aria-hidden="true"></div>' +
            '<div class="fxg-dive-hint"><span>ESC · torna al globo</span>' +
              '<button type="button" class="fxg-dive-close" id="fxg-dive-close" aria-label="Torna alla vista globo">✕</button></div>' +
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

    /* click sulle città -> CITY DIVE (zoom GTA-style); fallback: card swap se il globo non è pronto.
       Delegato su document (come fx.js): sopravvive a reconciliation/hydration del template,
       che può sostituire i nodi della sezione dopo il mount. */
    document.addEventListener("click", function (e) {
      var t = e.target && e.target.closest ? e.target : null;
      if (!t) return;
      var b = t.closest(".fxg-item");
      if (b) {
        var bi = +b.getAttribute("data-i");
        if (window.__fxgDive) window.__fxgDive(bi, b);
        else if (window.__fxgFly) window.__fxgFly(bi, true);
        return;
      }
      if ((t.closest("#fxh-back") || t.closest("#fxg-dive-close")) && window.__fxgDiveBack) window.__fxgDiveBack();
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
    var borderMat = null; /* confini nazioni: valorizzato da bordersFromData() */
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

    /* confini nazioni. Due percorsi: (a) dati embedded window.__FXG_BORDERS
       (segmenti uint16 LE, lat=(v/65534)*180-90, lon=(v/65535)*360-180,
       separatore lat=0xFFFF); (b) runtime: topojson-client da CDN +
       world-atlas 110m. Fallback silenzioso: senza bordi il resto resta. */
    function buildBorders(pos) {
      if (pos.length < 100) return;
      var g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      borderMat = new THREE.LineBasicMaterial({ color: new THREE.Color(accent()), transparent: true, opacity: 0.30, depthWrite: false });
      globe.add(new THREE.LineSegments(g, borderMat));
      if (reduced) schedule(); /* render-on-demand: ridisegna quando arrivano */
    }
    function bordersFromData() {
      try {
        var bin = atob(window.__FXG_BORDERS || "");
        var pos = [], i = 0, n = bin.length;
        function u16(o) { return bin.charCodeAt(o) | (bin.charCodeAt(o + 1) << 8); }
        var prev = null;
        while (i + 1 < n) {
          var la = u16(i); i += 2;
          if (la === 0xFFFF) { prev = null; continue; }
          var lo = u16(i); i += 2;
          var lat = la / 65534 * 180 - 90, lon = lo / 65535 * 360 - 180;
          var v = ll(lat, lon, R * 1.003);
          if (prev) pos.push(prev.x, prev.y, prev.z, v.x, v.y, v.z);
          prev = v;
        }
        buildBorders(pos);
      } catch (e) { /* niente bordi */ }
    }
    function bordersFromCDN() {
      var s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/dist/topojson-client.min.js";
      s.onload = function () {
        fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
          .then(function (r) { if (!r.ok) throw new Error("http"); return r.json(); })
          .then(function (topo) {
            try {
              var mesh = window.topojson.mesh(topo, topo.objects.countries);
              var pos = [];
              mesh.coordinates.forEach(function (line) {
                for (var i = 1; i < line.length; i++) {
                  var a = line[i - 1], b = line[i];
                  if (a[1] < -60 && b[1] < -60) continue; /* Antartide: coerente coi punti terra */
                  if (Math.abs(a[0] - b[0]) > 180) continue; /* salto antimeridiano */
                  var va = ll(a[1], a[0], R * 1.003), vb = ll(b[1], b[0], R * 1.003);
                  pos.push(va.x, va.y, va.z, vb.x, vb.y, vb.z);
                }
              });
              buildBorders(pos);
            } catch (e) { /* niente bordi */ }
          })
          .catch(function () { /* niente bordi */ });
      };
      s.onerror = function () { /* niente bordi */ };
      document.body.appendChild(s);
    }
    if (window.__FXG_BORDERS) bordersFromData(); else bordersFromCDN();

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
    var sx = 0, sy = 0, px = 0, py = 0, lastUser = 0, vx = 0, vy = 0, downT = 0;
    canvas.style.touchAction = "pan-y";
    canvas.addEventListener("pointerdown", function (e) {
      isTouch = e.pointerType === "touch";
      pendingDrag = true;
      dragging = !isTouch; /* mouse: drag immediato; touch: prima soglia intent (niente tilt durante lo scroll) */
      sx = px = e.clientX; sy = py = e.clientY;
      vx = vy = 0;
      downT = lastUser = performance.now();
      if (dragging && canvas.setPointerCapture) { try { canvas.setPointerCapture(e.pointerId); } catch (err) {} }
    });
    canvas.addEventListener("pointermove", function (e) {
      if (!pendingDrag && !dragging) return;
      var dx = e.clientX - px, dy = e.clientY - py; px = e.clientX; py = e.clientY;
      if (MODE === "flying" || MODE === "returning") return; /* volo/rientro: drag bloccato (resta solo il click-test) */
      if (!dragging) { /* touch: decide l'intent solo dopo 9px di movimento */
        var tdx = e.clientX - sx, tdy = e.clientY - sy;
        if (tdx * tdx + tdy * tdy < 81) return;
        if (Math.abs(tdy) > Math.abs(tdx) * 1.2) { pendingDrag = false; return; } /* scroll verticale: lascia scorrere */
        dragging = true;
        if (canvas.setPointerCapture) { try { canvas.setPointerCapture(e.pointerId); } catch (err) {} }
        dx = tdx; dy = tdy;
      }
      vx = dx * 0.005; vy = dy * 0.003;
      if (MODE === "city") { /* orbita limitata attorno al target: rubber-band, niente inerzia */
        cityYaw = rubber(cityYaw + vx, YAW_LIM);
        cityPitch = rubber(cityPitch + vy, PITCH_LIM);
        vx = vy = 0;
        sbT0 = -1; /* niente spring-back mentre si trascina */
        if (reduced) { applyCityQuat(performance.now()); schedule(); }
        lastUser = performance.now();
        return;
      }
      var qy = new THREE.Quaternion().setFromAxisAngle(AXY, vx);
      var qx = new THREE.Quaternion().setFromAxisAngle(AXX, vy);
      globe.quaternion.premultiply(qy).premultiply(qx);
      lastUser = performance.now();
      if (reduced) schedule(); /* render-on-demand */
    });
    canvas.addEventListener("pointerup", function (e) {
      var nowUp = performance.now();
      /* click vs drag: scatta solo entro 6px / 350ms (più stretto dell'intent-drag da 9px) */
      var cdx = e.clientX - sx, cdy = e.clientY - sy;
      var isClick = pendingDrag && (nowUp - downT <= 350) && (cdx * cdx + cdy * cdy <= 36);
      dragging = false; pendingDrag = false;
      lastUser = nowUp;
      if (reduced) {
        if (MODE === "city") { cityYaw = 0; cityPitch = 0; applyCityQuat(nowUp); } /* spring-back istantaneo */
        vx = vy = 0; schedule();
      }
      if (isClick) {
        var hit = pickMarker(e.clientX, e.clientY);
        if (hit >= 0) {
          if (MODE === "idle" || hit !== diveIdx) dive(hit, itemEl(hit)); /* stesso marker in volo/city: no-op */
        } else if (MODE === "city") {
          returnToOrbit(); /* backdrop: click su canvas vuoto in CITY = esci */
        }
      }
    });
    ["pointercancel", "pointerleave"].forEach(function (ev) {
      canvas.addEventListener(ev, function () {
        dragging = false; pendingDrag = false;
        lastUser = performance.now();
        if (reduced) {
          if (MODE === "city") { cityYaw = 0; cityPitch = 0; applyCityQuat(lastUser); }
          vx = vy = 0; schedule();
        }
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
      camera.position.z = (MODE === "city") ? Z_CITY : scrollZ;
      var camZ = camera.position.z;
      landMat.size = 0.016 * (camZ / 3.4); /* dimensione APPARENTE costante a ogni quota (0.016 a z=3.4) */
      if (borderMat) borderMat.opacity = 0.30 + 0.15 * clamp01((1.6 - camZ) / 0.6); /* più struttura in orbita bassa */
      renderer.render(scene, camera);
    }
    function schedule() {
      if (rafPend) return;
      rafPend = true;
      requestAnimationFrame(function () { rafPend = false; renderFrame(); });
    }

    /* ================= CITY DIVE — zoom GTA-style dal pianeta alla città =================
       State machine: MODE = "idle" | "flying" | "city" | "returning".
       Timing assoluto (performance.now): lo stato avanza anche a rAF fermo (offscreen).
       Timeline volo pieno:  pullback 0-700 (z curr->4.6) · cruise 450-1550 (slerp+roll)
       · dive 1500-2400 (z 4.6->1.28, fov kick, contro-roll) · shake 2400-3100.
       Retarget last-wins (da volo/city): niente pullback, cruise 0-1050, dive 1050-1950,
       arrival 1950-2650, z riparte dal valore corrente. Rientro: 1500ms verso scrollZ. */
    var MODE = "idle";
    var Z_PULL = 4.6, Z_CITY = 1.28, FOV_BASE = 42, FOV_MAX = 50;
    var ROLL_MAX = 0.0611, ROLL_DIVE = -0.0349;            /* +3.5° / -2.0° in rad */
    var SHAKE_AMP = 0.012, SHAKE_TAU = 0.28;
    var DRIFT_YAW = 0.035, DRIFT_PITCH = 0.022;            /* micro-drift orbitale in CITY */
    var YAW_LIM = 25 * Math.PI / 180, PITCH_LIM = 10 * Math.PI / 180;
    var HOME_Q = qFor({ lat: 42.6, lon: 12.4 });           /* home Italia */
    var stage = sec ? sec.querySelector(".fxg-stage") : null;
    var elAlt = document.getElementById("fxh-alt"), elAltU = document.getElementById("fxh-alt-u"),
        elLat = document.getElementById("fxh-lat"), elLon = document.getElementById("fxh-lon"),
        elStatus = document.getElementById("fxh-status"),
        liveEl = document.getElementById("fxg-live"),
        pingEl = document.getElementById("fxg-ping"),
        backBtn = document.getElementById("fxh-back");
    var diveIdx = -1, lastTrigger = null;
    var flyT0 = 0, cityT0 = 0, retT0 = 0, cityOffT = 0, teleT = 0;
    var pullOn = true, crzT0 = 450, crzDur = 1100, divT0 = 1500, arrT0 = 2400, endT = 3100;
    var zFrom = 3.4, zDivFrom = Z_PULL, retFromZ = Z_CITY;
    var latFrom = 42.6, lonFrom = 12.4;
    var qDFrom = new THREE.Quaternion(), qDTo = new THREE.Quaternion(),
        qCity = new THREE.Quaternion(), qRFrom = new THREE.Quaternion(),
        qTmpY = new THREE.Quaternion(), qTmpX = new THREE.Quaternion();
    var cityYaw = 0, cityPitch = 0, sbT0 = -1, sbY0 = 0, sbP0 = 0;
    var curFov = FOV_BASE;

    function clamp01(t) { return t < 0 ? 0 : t > 1 ? 1 : t; }
    function eio(t) { t = clamp01(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
    function eoc(t) { t = clamp01(t); return 1 - Math.pow(1 - t, 3); }
    function eiq(t) { t = clamp01(t); return t * t * t * t; }
    function setFov(f) {
      if (Math.abs(f - curFov) > 0.01) { curFov = f; camera.fov = f; camera.updateProjectionMatrix(); }
    }
    function rubber(v, lim) { /* ×0.35 oltre il limite */
      if (v > lim) return lim + (v - lim) * 0.35;
      if (v < -lim) return -lim + (v + lim) * 0.35;
      return v;
    }
    function itemEl(i) {
      var it = sec ? sec.querySelectorAll(".fxg-item") : [];
      return it[i] || null;
    }
    function setStatus(s) { if (elStatus) elStatus.textContent = s; }

    /* ---- audio WebAudio sintetizzato: lazy al primo gesto, mai in reduced-motion ---- */
    var actx = null, aMaster = null, aNodes = null;
    function audioCtx() {
      if (reduced) return null;
      try {
        if (!actx) {
          var AC = window.AudioContext || window.webkitAudioContext;
          if (!AC) return null;
          actx = new AC();
          aMaster = actx.createGain();
          aMaster.gain.value = 0.35; /* master ≤0.35 */
          aMaster.connect(actx.destination);
        }
        if (actx.state === "suspended") actx.resume();
        return actx;
      } catch (e) { return null; } /* silenzio, tutto il resto funziona */
    }
    function noiseBuf(c, secs) {
      var len = Math.floor(secs * c.sampleRate), buf = c.createBuffer(1, len, c.sampleRate),
          d = buf.getChannelData(0), i;
      for (i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      return buf;
    }
    function audioWhoosh(arrS) { /* whoosh + arrival thump, arrS = secondo di arrivo */
      var c = audioCtx(); if (!c) return;
      try {
        var t0 = c.currentTime + 0.03;
        var src = c.createBufferSource(); src.buffer = noiseBuf(c, arrS + 0.1);
        var bp = c.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = 1.1;
        var g = c.createGain();
        src.connect(bp); bp.connect(g); g.connect(aMaster);
        bp.frequency.setValueAtTime(300, t0);
        bp.frequency.exponentialRampToValueAtTime(2400, t0 + arrS - 0.45);
        bp.frequency.exponentialRampToValueAtTime(350, t0 + arrS);
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(0.16, t0 + 0.35);
        g.gain.setValueAtTime(0.16, t0 + Math.max(0.4, arrS - 0.9));
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + arrS);
        src.start(t0); src.stop(t0 + arrS + 0.05);
        var osc = c.createOscillator(); osc.type = "sine";
        osc.frequency.setValueAtTime(130, t0 + arrS);
        osc.frequency.exponentialRampToValueAtTime(44, t0 + arrS + 0.18);
        var gt = c.createGain();
        gt.gain.setValueAtTime(0.22, t0 + arrS);
        gt.gain.exponentialRampToValueAtTime(0.0001, t0 + arrS + 0.22);
        osc.connect(gt); gt.connect(aMaster);
        osc.start(t0 + arrS); osc.stop(t0 + arrS + 0.25);
        aNodes = [src, osc];
        src.onended = function () { try { src.disconnect(); bp.disconnect(); g.disconnect(); } catch (e) {} };
        osc.onended = function () { try { osc.disconnect(); gt.disconnect(); } catch (e) {} };
      } catch (e) {}
    }
    function audioReturn() { /* sweep invertito 2400->400 Hz, gain ×0.7, niente thump */
      var c = audioCtx(); if (!c) return;
      try {
        var t0 = c.currentTime + 0.03;
        var src = c.createBufferSource(); src.buffer = noiseBuf(c, 1.6);
        var bp = c.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = 1.1;
        var g = c.createGain();
        src.connect(bp); bp.connect(g); g.connect(aMaster);
        bp.frequency.setValueAtTime(2400, t0);
        bp.frequency.exponentialRampToValueAtTime(400, t0 + 1.3);
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(0.112, t0 + 0.25);
        g.gain.setValueAtTime(0.112, t0 + 0.9);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.45);
        src.start(t0); src.stop(t0 + 1.5);
        aNodes = [src];
        src.onended = function () { try { src.disconnect(); bp.disconnect(); g.disconnect(); } catch (e) {} };
      } catch (e) {}
    }
    function audioStop() {
      if (!aNodes) return;
      for (var i = 0; i < aNodes.length; i++) { try { aNodes[i].stop(); } catch (e) {} }
      aNodes = null;
    }

    /* ---- telemetria HUD: ≤10Hz, solo textContent/transform, aria-hidden ---- */
    function fmtLL(v, pos, neg) { return Math.abs(v).toFixed(4) + "°" + (v >= 0 ? pos : neg); }
    function teleUpdate(now, force) {
      if (!force && now - teleT < 100) return;
      teleT = now;
      var alt = Math.max(0, (camera.position.z - 1) * 1500); /* km */
      if (elAlt) {
        if (alt >= 1000) { elAlt.textContent = (alt / 1000).toFixed(2); elAltU.textContent = "Mm"; }
        else { elAlt.textContent = String(Math.round(alt)); elAltU.textContent = "km"; }
      }
      var la, lo, p, tgt = PLACES[diveIdx] || PLACES[0];
      if (MODE === "flying") {
        p = eio((now - flyT0 - crzT0) / crzDur);
        la = latFrom + (tgt.lat - latFrom) * p; lo = lonFrom + (tgt.lon - lonFrom) * p;
      } else if (MODE === "returning") {
        p = eio((now - retT0 - 250) / 900);
        la = tgt.lat + (42.6 - tgt.lat) * p; lo = tgt.lon + (12.4 - tgt.lon) * p;
      } else { la = tgt.lat; lo = tgt.lon; }
      if (elLat) { elLat.textContent = fmtLL(la, "N", "S"); elLon.textContent = fmtLL(lo, "E", "W"); }
      pingUpdate();
    }

    /* ---- anello radar DOM: proiezione Vector3.project() (10Hz, transform-only) ---- */
    var pingV = new THREE.Vector3();
    function pingUpdate() {
      if (!pingEl || diveIdx < 0 || !markers[diveIdx]) return;
      markers[diveIdx].getWorldPosition(pingV);
      var behind = pingV.z < 0; /* dietro il globo */
      pingV.project(camera);
      var w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
      var x = (pingV.x * 0.5 + 0.5) * w, y = (-pingV.y * 0.5 + 0.5) * h;
      x = Math.min(Math.max(x, 48), Math.max(48, w - 48)); /* clamp: l'anello non esce mai dal canvas */
      y = Math.min(Math.max(y, 48), Math.max(48, h - 48));
      pingEl.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px)";
      pingEl.classList.toggle("fxg-ping--off", behind || pingV.z > 1);
    }

    /* ---- drift orbitale in CITY: offset oscillatori ASSOLUTI su base città (mai cumulativi) ---- */
    function applyCityQuat(now) {
      var tau = (now - cityT0) / 1000, fade = Math.min(1, (now - cityT0) / 1200);
      var dY = reduced ? 0 : DRIFT_YAW * Math.sin(2 * Math.PI * tau / 7) * fade;
      var dX = reduced ? 0 : DRIFT_PITCH * Math.sin(2 * Math.PI * tau / 11) * fade;
      qTmpY.setFromAxisAngle(AXY, cityYaw + dY);
      qTmpX.setFromAxisAngle(AXX, cityPitch + dX);
      globe.quaternion.copy(qCity).premultiply(qTmpY).premultiply(qTmpX);
    }

    /* ---- raycast sui 3 marker sprite (una volta per click, mai per frame) ---- */
    var rayc = new THREE.Raycaster(), pickV = new THREE.Vector3(), pickNdc = { x: 0, y: 0 };
    function pickMarker(cx, cy) {
      var r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return -1;
      pickNdc.x = ((cx - r.left) / r.width) * 2 - 1;
      pickNdc.y = -(((cy - r.top) / r.height) * 2 - 1);
      try {
        rayc.setFromCamera(pickNdc, camera);
        var hits = rayc.intersectObjects(markers, false);
        for (var h = 0; h < hits.length; h++) {
          var j = markers.indexOf(hits[h].object);
          if (j < 0) continue;
          markers[j].getWorldPosition(pickV);
          if (pickV.z > 0) return j; /* solo marker fronte-globo */
        }
      } catch (e) {}
      return -1;
    }

    /* ---- ESC: listener attivo solo in FLYING/CITY (niente listener permanenti) ---- */
    var escBound = false;
    function onEscKey(e) {
      if (e.key === "Escape" && (MODE === "flying" || MODE === "city")) returnToOrbit();
    }
    function escOn() { if (!escBound) { escBound = true; document.addEventListener("keydown", onEscKey); } }
    function escOff() { if (escBound) { escBound = false; document.removeEventListener("keydown", onEscKey); } }

    /* ---- annunci aria-live: uno all'arrivo, uno al rientro ---- */
    function announceArrive() {
      if (!liveEl || diveIdx < 0) return;
      var p = PLACES[diveIdx];
      var note = p.note.toLowerCase().replace(/\s*·\s*/g, ", ");
      note = note.charAt(0).toUpperCase() + note.slice(1);
      liveEl.textContent = p.city + ". " + note + ". Clienti: " + p.clients.join(", ") +
        ". Premi ESC o «torna in orbita» per uscire.";
    }
    function focusEl(el) {
      if (!el || !el.focus) return;
      try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); }
    }

    /* ---- ingresso dive (trigger: bottone .fxg-item o marker 3D) ---- */
    function dive(i, trig) {
      if (MODE === "city" && i === diveIdx) return;   /* doppio click stessa città: no-op */
      if (MODE === "flying" && i === diveIdx) return; /* stesso target in volo: no-op */
      if (reduced) { snapDive(i, trig); return; }
      var now = performance.now();
      var wasFlying = (MODE === "flying");
      var retarget = wasFlying || (MODE === "city");  /* last-wins, senza risalire in orbita */
      var prev = (MODE === "idle" || MODE === "returning") ? cur : diveIdx;
      latFrom = PLACES[prev] ? PLACES[prev].lat : 42.6;
      lonFrom = PLACES[prev] ? PLACES[prev].lon : 12.4;
      diveIdx = i; cur = i;
      lastTrigger = trig || itemEl(i);
      flyT0 = now; teleT = 0;
      qDFrom.copy(globe.quaternion);
      qDTo.copy(qFor(PLACES[i]));
      qCity.copy(qDTo);
      cityYaw = cityPitch = 0; sbT0 = -1;
      if (retarget) {
        pullOn = false; crzT0 = 0; crzDur = 1050; divT0 = 1050; arrT0 = 1950; endT = 2650;
        zDivFrom = camera.position.z;                 /* z continua dal valore corrente */
      } else {
        pullOn = true; crzT0 = 450; crzDur = 1100; divT0 = 1500; arrT0 = 2400; endT = 3100;
        zFrom = camera.position.z;                    /* può non essere 3.4 (scroll zoom) */
        zDivFrom = Z_PULL;
      }
      MODE = "flying";
      tourT = -1; vx = vy = 0; dragging = false; pendingDrag = false;
      if (stage) { stage.classList.add("is-dive"); stage.classList.remove("is-city"); }
      setStatus("▚ IN AVVICINAMENTO — " + PLACES[i].city);
      showCardDOM(i);
      markers.forEach(function (m, j) { m.material.opacity = (j === i) ? 1 : 0.25; });
      escOn();
      if (!wasFlying) audioWhoosh(arrT0 / 1000);      /* retarget in volo: whoosh già in corso */
      teleUpdate(now, true);
    }

    /* ---- arrivo in CITY ---- */
    function arriveCity(announce) {
      MODE = "city"; cityT0 = performance.now();
      globe.quaternion.copy(qCity);
      camera.position.set(0, 0, Z_CITY);
      camera.rotation.z = 0; setFov(FOV_BASE);
      if (stage) stage.classList.add("is-city");
      setStatus("◆ TARGET LOCK — " + PLACES[diveIdx].city);
      teleUpdate(cityT0, true);
      if (announce) {
        announceArrive();
        focusEl(backBtn); /* focus sull'azione primaria di uscita (pattern dialog) */
      }
    }

    /* ---- uscita: ESC / backdrop / bottone TORNA IN ORBITA ---- */
    function returnToOrbit() {
      if (MODE !== "flying" && MODE !== "city") return; /* in RETURNING i click backdrop/ESC sono ignorati */
      if (reduced) { snapReturn(); return; }
      retT0 = performance.now();
      retFromZ = camera.position.z;                     /* rientro dal punto corrente */
      qRFrom.copy(globe.quaternion);
      MODE = "returning";
      if (stage) stage.classList.remove("is-city");
      setStatus("↟ RIENTRO IN ORBITA");
      audioReturn();
    }
    function finishReturn(silent) {
      MODE = "idle";
      globe.quaternion.copy(HOME_Q);
      camera.position.set(0, 0, scrollZ);               /* atterra sullo scrollZ corrente */
      camera.rotation.z = 0; setFov(FOV_BASE);
      if (stage) stage.classList.remove("is-dive", "is-city");
      escOff();
      markers.forEach(function (m) { m.material.opacity = 1; });
      lastUser = performance.now() + 1500;              /* tour: riprende solo 8s dopo il rientro */
      frame.next = 0;
      if (!silent) {
        if (liveEl) liveEl.textContent = "Sei tornato alla vista globo.";
        focusEl(lastTrigger);                           /* il focus torna al trigger */
      }
    }
    function abortToIdle() { /* CITY offscreen >4s: snap alla vista globo, stato pulito */
      MODE = "idle";
      globe.quaternion.copy(HOME_Q);
      camera.position.set(0, 0, scrollZ);
      camera.rotation.z = 0; setFov(FOV_BASE);
      if (stage) stage.classList.remove("is-dive", "is-city");
      escOff();
      markers.forEach(function (m) { m.material.opacity = 1; });
      lastUser = performance.now() + 1500; frame.next = 0;
      if (stage && stage.contains(document.activeElement)) focusEl(itemEl(diveIdx));
    }

    /* ---- reduced-motion: snap immediato a TARGET LOCK, niente volo/shake/roll/audio ---- */
    function snapDive(i, trig) {
      var now = performance.now();
      diveIdx = i; cur = i;
      lastTrigger = trig || itemEl(i);
      qDTo.copy(qFor(PLACES[i]));
      qCity.copy(qDTo);
      cityYaw = cityPitch = 0; sbT0 = -1;
      globe.quaternion.copy(qCity);
      camera.position.set(0, 0, Z_CITY);
      camera.rotation.z = 0; setFov(FOV_BASE);
      MODE = "city"; cityT0 = now; teleT = 0;
      tourT = -1; vx = vy = 0; dragging = false; pendingDrag = false;
      if (stage) { stage.classList.add("is-dive"); stage.classList.add("is-city"); }
      setStatus("◆ TARGET LOCK — " + PLACES[i].city);
      showCardDOM(i);
      markers.forEach(function (m, j) { m.material.opacity = (j === i) ? 1 : 0.25; });
      escOn();
      teleUpdate(now, true); /* telemetria statica ai valori finali */
      announceArrive();
      focusEl(backBtn);
      schedule();
    }
    function snapReturn() {
      MODE = "idle";
      globe.quaternion.copy(HOME_Q);
      camera.position.set(0, 0, scrollZ);
      camera.rotation.z = 0; setFov(FOV_BASE);
      if (stage) stage.classList.remove("is-dive", "is-city");
      escOff();
      markers.forEach(function (m) { m.material.opacity = 1; });
      if (liveEl) liveEl.textContent = "Sei tornato alla vista globo.";
      focusEl(lastTrigger);
      schedule();
    }

    /* ---- driver per-frame dei modi non-idle (timing assoluto, niente accumulo) ---- */
    function driveMode(now) {
      var t, z;
      if (MODE === "flying") {
        t = now - flyT0;
        var pB = pullOn ? clamp01(t / 700) : 1,
            pC = clamp01((t - crzT0) / crzDur),
            pD = clamp01((t - divT0) / 900);
        if (t < divT0) z = pullOn ? zFrom + (Z_PULL - zFrom) * eio(pB) : zDivFrom;
        else z = zDivFrom + (Z_CITY - zDivFrom) * eiq(pD);
        camera.position.z = z;
        if (pC < 1) globe.quaternion.slerpQuaternions(qDFrom, qDTo, eio(pC));
        else globe.quaternion.copy(qDTo);
        var f = FOV_BASE;
        if (pD > 0 && pD < 1) f = FOV_BASE + (FOV_MAX - FOV_BASE) * Math.sin(Math.PI * pD);
        setFov(f);
        var roll = 0;
        if (pC > 0 && pC < 1) roll = ROLL_MAX * Math.sin(Math.PI * pC);
        if (pD > 0 && pD < 1) roll = ROLL_DIVE * Math.sin(Math.PI * pD);
        camera.rotation.z = roll;
        var tau = (t - arrT0) / 1000;
        if (tau >= 0 && tau <= 0.7) { /* micro-shake di arrivo, decay exp, deterministico */
          var s = SHAKE_AMP * Math.exp(-tau / SHAKE_TAU);
          camera.position.x = 0.5 * s * (Math.sin(2 * Math.PI * 37 * tau) + 0.6 * Math.sin(2 * Math.PI * 53 * tau + 1.3));
          camera.position.y = 0.5 * s * (Math.sin(2 * Math.PI * 43 * tau + 2.1) + 0.6 * Math.sin(2 * Math.PI * 61 * tau + 0.7));
        } else { camera.position.x = 0; camera.position.y = 0; }
        teleUpdate(now);
        if (t >= endT) arriveCity(true);
      }
      else if (MODE === "city") {
        if (!dragging && (cityYaw !== 0 || cityPitch !== 0)) { /* spring-back ~400ms al rilascio */
          if (sbT0 < 0) { sbT0 = now; sbY0 = cityYaw; sbP0 = cityPitch; }
          var sp = clamp01((now - sbT0) / 400);
          var se = 1 - Math.exp(-3.5 * sp) * Math.cos(4.5 * sp); /* molla smorzata, leggero overshoot */
          cityYaw = sbY0 * (1 - se); cityPitch = sbP0 * (1 - se);
          if (sp >= 1) { cityYaw = 0; cityPitch = 0; sbT0 = -1; }
        }
        applyCityQuat(now);
        camera.position.set(0, 0, Z_CITY);
        camera.rotation.z = 0; setFov(FOV_BASE);
        teleUpdate(now);
      }
      else if (MODE === "returning") {
        t = now - retT0;
        var pP = clamp01(t / 500), pR = clamp01((t - 250) / 900), pH = clamp01((t - 900) / 600);
        if (t < 900) z = retFromZ + (4.0 - retFromZ) * eio(pP);
        else z = 4.0 + (scrollZ - 4.0) * eoc(pH);
        camera.position.z = z;
        camera.position.x = 0; camera.position.y = 0;
        if (pR < 1) globe.quaternion.slerpQuaternions(qRFrom, HOME_Q, eio(pR));
        else globe.quaternion.copy(HOME_Q);
        camera.rotation.z = 0; setFov(FOV_BASE);
        teleUpdate(now);
        if (t >= 1500) finishReturn(false);
      }
    }

    /* ---- tab hidden: completa subito (snap silenzioso) la transizione in corso ---- */
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) return;
      audioStop(); /* niente code fantasma al ritorno */
      if (MODE === "flying") arriveCity(false);
      else if (MODE === "returning") finishReturn(true);
    });

    /* ---- trigger pubblici (click su #fxh-back / #fxg-dive-close: delegato su document in tryMount) ---- */
    window.__fxgDive = function (i, el) { dive(i, el || null); };
    window.__fxgDiveBack = returnToOrbit;

    /* ---------- tema ---------- */
    function recolor() {
      var a = new THREE.Color(accent());
      landMat.color = a; arcMat.color = a;
      if (borderMat) borderMat.color = a;
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
      if (!inView) { /* offscreen: loop a costo ~0, ma lo STATO avanza (timing assoluto) */
        if (MODE === "flying") arriveCity(false);            /* volo completato a rAF spento */
        else if (MODE === "city") {
          if (!cityOffT) cityOffT = now;
          else if (now - cityOffT > 4000) abortToIdle();     /* CITY offscreen >4s: rientro automatico */
        }
        requestAnimationFrame(frame); return;
      }
      cityOffT = 0;
      var t = (now - t0) / 1000, st = dt / 16.7;
      if (MODE === "idle") {
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
        /* tween tour (solo rotazione: il DIVE scatta solo da azione manuale) */
        if (tourT >= 0) {
          tourT = Math.min(1, (now - flyStart) / FLY_MS);
          var e2 = tourT < 0.5 ? 4 * tourT * tourT * tourT : 1 - Math.pow(-2 * tourT + 2, 3) / 2;
          globe.quaternion.slerpQuaternions(qFrom, qTo, e2);
          if (tourT >= 1) tourT = -1;
        } else if (!dragging && !tourPaused && now - lastUser > 6500) {
          /* prossima tappa */
          if (!frame.next || now > frame.next) { frame.next = now + 5500; fly((cur + 1) % PLACES.length); }
        }
        /* lerp camera verso scrollZ: SOLO in idle/… (in volo/city z è della state machine) */
        var k = 1 - Math.pow(0.94, st); /* lerp zoom normalizzato sul dt */
        camera.position.z += ((scrollZ * (tourT >= 0 ? 0.94 : 1)) - camera.position.z) * k;
      } else {
        driveMode(now); /* flying / city / returning */
      }
      /* pulsazione marker: in CITY l'attivo cresce 0.13 -> 0.24 */
      var act = (MODE === "flying" || MODE === "city") ? diveIdx : cur;
      for (var i = 0; i < markers.length; i++) {
        var base = (i === act) ? (MODE === "city" ? 0.24 : 0.19) : 0.13;
        var s = base + Math.sin(t * 2.4 + i * 2) * 0.02;
        markers[i].scale.set(s, s, 1);
      }
      var camZ = camera.position.z;
      landMat.size = 0.016 * (camZ / 3.4); /* dimensione APPARENTE costante a ogni quota (0.016 a z=3.4) */
      if (borderMat) borderMat.opacity = 0.30 + 0.15 * clamp01((1.6 - camZ) / 0.6); /* più struttura in orbita bassa */
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
