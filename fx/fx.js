/* ===== FX LAYER — aurora + constellation + spotlight + scramble + contatore visite ===== */

/* ---------- 0) SEO HEAD PATCH: ripristina i meta persi dal document.write ---------- */
(function () {
  "use strict";
  if (document.getElementById("fx-seo-patch")) return; /* idempotente */
  var head = document.head || document.getElementsByTagName("head")[0];
  if (!head) return;
  function m(a, v) { var e = document.createElement("meta"); e.setAttribute(a[0], a[1]); e.content = v; head.appendChild(e); }
  var t = document.querySelector('meta[property="og:type"]');
  if (t) t.content = "profile"; /* allinea il DOM finale al loader */
  m(["name", "robots"], "index, follow, max-image-preview:large");
  m(["name", "author"], "Alessandro Chiri");
  m(["property", "og:site_name"], "Alessandro Chiri");
  m(["property", "og:locale"], "it_IT");
  m(["property", "og:locale:alternate"], "en_US");
  m(["property", "og:image:secure_url"], "https://benz91x.github.io/Alessandro-Chiri/og-image.png");
  m(["property", "og:image:type"], "image/png");
  m(["property", "og:image:alt"], "Alessandro Chiri — Senior Consultant, Digital & Data Transformation");
  m(["property", "profile:first_name"], "Alessandro");
  m(["property", "profile:last_name"], "Chiri");
  m(["name", "twitter:title"], "Alessandro Chiri — Senior Consultant");
  m(["name", "twitter:description"], "Otto anni di consulenza enterprise — Accenture, Micro Focus, Deloitte NextHub. Il tuo prossimo senior hire, operativo dal giorno uno.");
  m(["name", "twitter:image:alt"], "Alessandro Chiri — Senior Consultant");
  var s = document.createElement("script"); s.type = "application/ld+json"; s.id = "fx-seo-patch";
  s.textContent = JSON.stringify({ "@context": "https://schema.org", "@type": "Person",
    "name": "Alessandro Chiri", "jobTitle": "Senior Consultant",
    "description": "Senior Consultant in digital & data transformation. Otto anni di consulenza enterprise tra Accenture, Micro Focus e Deloitte NextHub.",
    "url": "https://benz91x.github.io/Alessandro-Chiri/",
    "image": "https://benz91x.github.io/Alessandro-Chiri/og-image.png",
    "email": "mailto:alexch@hotmail.it", "knowsLanguage": ["it", "en"],
    "sameAs": ["https://www.linkedin.com/in/alessandro-chiri", "https://github.com/Benz91x"] });
  head.appendChild(s);
  /* favicon reali al posto dei blob: (invisibili ai crawler) */
  var old = document.querySelectorAll('link[rel="icon"],link[rel="apple-touch-icon"]');
  for (var i = 0; i < old.length; i++) if (old[i].parentNode) old[i].parentNode.removeChild(old[i]);
  var FAV = [["icon", "favicon.ico", "any"], ["icon", "favicon-32x32.png", "32x32"],
    ["icon", "favicon-16x16.png", "16x16"], ["apple-touch-icon", "apple-touch-icon.png", "180x180"]];
  for (i = 0; i < FAV.length; i++) {
    var l = document.createElement("link");
    l.rel = FAV[i][0]; l.href = FAV[i][1]; l.setAttribute("sizes", FAV[i][2]);
    head.appendChild(l);
  }
})();

(function () {
  "use strict";
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine    = matchMedia("(pointer:fine)").matches;
  function accent() { var v = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim(); return v || "#2dd4bf"; }

  /* ---------- tema (mirror di data-theme su body + cache colore per il rAF) ---------- */
  var fxCol = "#2dd4bf", fxLight = false;
  function syncTheme() {
    var r = document.getElementById("ac-root");
    var t = (r && r.getAttribute("data-theme")) || "dark";
    document.body.setAttribute("fx-theme", t);
    document.documentElement.style.setProperty("--fx-ink",
      getComputedStyle(r || document.body).color || (t === "light" ? "#10161a" : "#e8f1ef"));
    fxCol = accent();            /* cache: niente getComputedStyle nel frame loop */
    fxLight = (t === "light");
  }
  syncTheme();
  new MutationObserver(syncTheme).observe(document.documentElement, { subtree: true, attributes: true, attributeFilter: ["data-theme"] });

  /* ---------- 1) AURORA: blob di luce che derivano dietro i contenuti ---------- */
  if (!reduced) {
    var au = document.createElement("div"); au.id = "fx-aurora"; au.setAttribute("aria-hidden", "true");
    au.innerHTML = '<div class="fx-blob fx-blob-1"></div><div class="fx-blob fx-blob-2"></div><div class="fx-blob fx-blob-3"></div>';
    document.body.appendChild(au);
  }

  /* ---------- 2) CONSTELLATION: particelle collegate, reattive al mouse ---------- */
  if (!reduced) {
    var cv = document.createElement("canvas"); cv.id = "fx-stars"; cv.setAttribute("aria-hidden", "true");
    document.body.appendChild(cv);
    var ctx = cv.getContext("2d"), W = 0, H = 0, dpr = Math.min(devicePixelRatio || 1, 2), pts = [], mx = -9999, my = -9999;
    function size() {
      W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr;
      cv.style.width = W + "px"; cv.style.height = H + "px"; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.max(34, Math.min(95, Math.round(W * H / 19000))); pts = [];
      for (var i = 0; i < n; i++) pts.push({ x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35, r: Math.random() * 1.4 + .7 });
    }
    size();
    var rsT = null; /* debounce resize: niente ricreazione punti a ogni pixel */
    addEventListener("resize", function () { if (rsT) clearTimeout(rsT); rsT = setTimeout(size, 150); }, { passive: true });
    addEventListener("pointermove", function (e) { mx = e.clientX; my = e.clientY; }, { passive: true });
    function mouseOut() { mx = my = -9999; }
    document.addEventListener("pointerleave", mouseOut, { passive: true });
    addEventListener("blur", mouseOut, { passive: true });
    var LINK = 130, MR = 170, run = true;
    document.addEventListener("visibilitychange", function () { run = !document.hidden; if (run) frame(); });
    function frame() {
      if (!run) return;
      ctx.clearRect(0, 0, W, H);
      var col = fxCol, light = fxLight; /* colori dalla cache (aggiornata da syncTheme) */
      var aP = light ? .35 : .55, aL = light ? .10 : .16;
      for (var i = 0; i < pts.length; i++) { var p = pts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < -20) p.x = W + 20; if (p.x > W + 20) p.x = -20; if (p.y < -20) p.y = H + 20; if (p.y > H + 20) p.y = -20;
        var dx = mx - p.x, dy = my - p.y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < MR && d > 0.1) { p.x += dx / d * .6; p.y += dy / d * .6; }
        ctx.globalAlpha = aP; ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fill(); }
      ctx.globalAlpha = 1; ctx.strokeStyle = col; ctx.lineWidth = 1;
      for (var a = 0; a < pts.length; a++) for (var b = a + 1; b < pts.length; b++) {
        var A = pts[a], B = pts[b], dxx = A.x - B.x, dyy = A.y - B.y, dd = dxx * dxx + dyy * dyy;
        if (dd < LINK * LINK) { ctx.globalAlpha = aL * (1 - Math.sqrt(dd) / LINK);
          ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke(); } }
      ctx.globalAlpha = 1;
      requestAnimationFrame(frame); }
    frame();
  }

  /* ---------- 3) SPOTLIGHT: alone luminoso che segue il mouse sulle card ---------- */
  if (fine) document.addEventListener("pointermove", function (e) {
    var c = e.target && e.target.closest ? e.target.closest("[data-tilt]") : null; if (!c) return;
    var r = c.getBoundingClientRect();
    c.style.setProperty("--fxmx", (e.clientX - r.left) + "px");
    c.style.setProperty("--fxmy", (e.clientY - r.top) + "px");
  }, { passive: true });

  /* ---------- 4) SHIMMER sul nome nell'hero (+ aria-label H1 per SEO/a11y) ---------- */
  function shine() {
    var s = document.querySelector("h1 [data-split]") || document.querySelector("h1");
    if (s && !s.classList.contains("fx-shine")) s.classList.add("fx-shine");
    var h1 = document.querySelector("h1"); /* H1 spezzato in span: dichiara il testo intero */
    if (h1 && !h1.getAttribute("aria-label")) h1.setAttribute("aria-label", "Alessandro Chiri");
  }
  shine(); setTimeout(shine, 1200); setTimeout(shine, 3000);

  /* ---------- 5) SCRAMBLE: i titoli di sezione si "decodificano" allo scroll ---------- */
  if (!reduced) {
    var CH = "ABCDEFGHILMNOPQRSTUVZ#@/\\<>*";
    function scramble(el) {
      if (el.dataset.fxDone) return; el.dataset.fxDone = "1";
      var orig = el.textContent, len = orig.length, t0 = performance.now(), DUR = 520 + len * 12;
      el.classList.add("fx-scrambled");
      el.setAttribute("aria-label", orig); /* durante l'effetto il titolo resta leggibile agli SR */
      (function tick(now) {
        var p = Math.min(1, (now - t0) / DUR), pe = 1 - Math.pow(1 - p, 3), out = "";
        for (var i = 0; i < len; i++) { var c = orig[i];
          out += (i / len < pe || c === " " || c === "." || c === "→") ? c : CH[(Math.random() * CH.length) | 0]; }
        el.textContent = out;
        if (p < 1) requestAnimationFrame(tick);
        else { el.textContent = orig; el.removeAttribute("aria-label"); }
      })(t0); }
    var io = new IntersectionObserver(function (es) { es.forEach(function (en) {
      if (en.isIntersecting) { io.unobserve(en.target); scramble(en.target); } }); }, { threshold: .35 });
    function watch() { document.querySelectorAll("h2[data-reveal]").forEach(function (h) {
      if (!h.dataset.fxDone && !h.dataset.fxWatch) { h.dataset.fxWatch = "1"; io.observe(h); } }); }
    watch();
    var watchIv = setInterval(function () { /* si auto-elimina: niente intervalli eterni */
      watch();
      if (!document.querySelector("h2[data-reveal]:not([data-fx-watch])")) clearInterval(watchIv);
    }, 1500);
    setTimeout(function () { clearInterval(watchIv); }, 20000); /* rete di sicurezza */
  }

  /* ---------- 6) CONTENUTI: testi CTA + link CV (consapevoli della lingua it/en) ---------- */
  var TXT = {
    "nav.cta": ["CONTATTAMI", "CONTACT ME"],
    "h.cta1": ["Scrivimi — rispondo in giornata", "Write me — I reply within a day"],
    "c.title": ["Parliamo del ruolo che devi coprire.", "Let's talk about the role you need to fill."],
    "h.sub": ["Otto anni nel cuore della consulenza enterprise — Accenture, Micro Focus, oggi Deloitte NextHub. Traduco esigenze di business in piattaforme che funzionano e in decisioni più rapide. Il tuo prossimo Senior Consultant, operativo dal giorno uno.",
      "Eight years at the heart of enterprise consulting — Accenture, Micro Focus, now Deloitte NextHub. I turn business needs into platforms that work and faster decisions. Your next Senior Consultant, productive from day one."]
  };
  var CV_HTML = ['Scarica il CV (PDF) <span aria-hidden="true">↓</span>',
    'Download the CV (PDF) <span aria-hidden="true">↓</span>'];
  function isEN() { return document.documentElement.lang === "en"; }
  function patchTexts() {
    var i = isEN() ? 1 : 0;
    for (var k in TXT) {
      var el = document.querySelector('[data-t="' + k + '"]');
      if (el && el.textContent !== TXT[k][i]) el.textContent = TXT[k][i];
    }
    var cvs = document.querySelectorAll("a.fx-cv");
    for (var n = 0; n < cvs.length; n++) cvs[n].innerHTML = CV_HTML[i];
  }
  function injectCV() { /* terza CTA "Scarica il CV" in hero e contatti (stile secondario) */
    var anchors = ['[data-t="h.cta1"]', '[data-t="c.b1"]'];
    for (var i = 0; i < anchors.length; i++) {
      var span = document.querySelector(anchors[i]);
      if (!span) continue;
      var a0 = span.closest ? span.closest("a") : null;
      var box = a0 ? a0.parentElement : null;
      if (!box || box.querySelector("a.fx-cv")) continue;
      var a = document.createElement("a");
      a.className = "fx-cv";
      a.href = "Alessandro_Chiri_CV.pdf";
      a.setAttribute("download", "Alessandro_Chiri_CV.pdf");
      a.innerHTML = CV_HTML[isEN() ? 1 : 0];
      a.style.cssText = "display:inline-flex;align-items:center;gap:8px;padding:14px 26px;" +
        "border-radius:999px;border:1px solid var(--line2);color:var(--ink);font-weight:600;" +
        "font-size:15px;text-decoration:none;transition:transform 0.2s ease-out;";
      box.appendChild(a);
    }
  }
  /* il toggle lingua del template riscrive i [data-t] dal dict: riapplichiamo dopo ogni cambio */
  new MutationObserver(patchTexts).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });

  /* ---------- 7) A11Y: stato toggle tema/lingua + annunci + decorativi nascosti ---------- */
  (function () {
    var live = document.createElement("div");
    live.setAttribute("role", "status");
    live.className = "fxg-sr";
    live.style.cssText = "position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;";
    document.body.appendChild(live);
    function tag() {
      var btns = document.querySelectorAll('#ac-header button[aria-label]');
      for (var i = 0; i < btns.length; i++)
        if (!btns[i].hasAttribute("aria-pressed")) btns[i].setAttribute("aria-pressed", "false");
    }
    tag(); setTimeout(tag, 1500); setTimeout(tag, 4000);
    document.addEventListener("click", function (e) { /* delegato: sopravvive a eventuali re-render */
      var b = e.target && e.target.closest ? e.target.closest('#ac-header button[aria-label]') : null;
      if (!b) return;
      var pressed = b.getAttribute("aria-pressed") === "true";
      b.setAttribute("aria-pressed", String(!pressed));
      var label = b.getAttribute("aria-label") || "";
      setTimeout(function () { /* il template applica il cambio via setState: leggiamo dopo */
        if (/tema/i.test(label)) {
          var r = document.getElementById("ac-root");
          var tema = (r && r.getAttribute("data-theme")) || "dark";
          live.textContent = "Tema " + (tema === "dark" ? "scuro" : "chiaro") + " attivo";
        } else if (/lingua|language/i.test(label)) {
          live.textContent = "Lingua interfaccia: " + (document.documentElement.lang === "it" ? "italiano" : "inglese");
        }
      }, 80);
    });
  })();
  function a11yFixes() { /* tutte idempotenti e difensive */
    var c = document.getElementById("ac-canvas"); /* canvas hero decorativo */
    if (c && !c.hasAttribute("aria-hidden")) c.setAttribute("aria-hidden", "true");
    var divs = document.querySelectorAll("#ac-root div"); /* giganti decorativi "AC" / "CHIRI" */
    for (var i = 0; i < divs.length; i++) {
      var d = divs[i];
      if (!d.children.length && /^(AC|CHIRI)$/.test(d.textContent.replace(/\s+/g, "")))
        d.setAttribute("aria-hidden", "true");
    }
    var mq = document.querySelectorAll('[style*="acMarquee"] span'); /* marquee duplicato */
    if (mq[1] && !mq[1].hasAttribute("aria-hidden")) mq[1].setAttribute("aria-hidden", "true");
    var sk = document.querySelector(".ac-skip"); /* lo skip link porta anche il focus */
    if (sk && !sk.dataset.fxSkip) {
      sk.dataset.fxSkip = "1";
      sk.addEventListener("click", function () {
        var t = document.getElementById("profilo");
        if (t) { t.setAttribute("tabindex", "-1"); if (t.focus) t.focus(); }
      });
    }
    var f = document.querySelector("main footer"); /* landmark contentinfo */
    if (f && !f.hasAttribute("role")) f.setAttribute("role", "contentinfo");
  }
  function domPatches() { patchTexts(); injectCV(); a11yFixes(); }
  domPatches(); setTimeout(domPatches, 1500); setTimeout(domPatches, 4000);

  /* ---------- 8) CONTATORE VISITE: soglia 1000, count-up, timeout 5s, defer idle ---------- */
  (function () {
    var span = document.createElement("span"); span.id = "fx-visits";
    span.style.display = "none"; /* visibile solo se il conteggio merita (>=1000) */
    span.setAttribute("role", "status");
    span.setAttribute("aria-label", "Visitatori totali");
    span.innerHTML = '<span class="fx-eye" aria-hidden="true">&#9673;</span><span id="fx-visits-n">VISITE: &hellip;</span>';
    var cvf = document.createElement("a"); /* SEO: il PDF è scopribile anche nel footer */
    cvf.href = "Alessandro_Chiri_CV.pdf"; cvf.textContent = "CV (PDF)";
    cvf.style.cssText = "color:var(--muted);text-decoration:none;border-bottom:1px solid var(--line2);";
    function mount() {
      var f = document.querySelector("footer > div");
      if (!f) return false;
      if (!document.getElementById("fx-visits")) f.appendChild(span);
      if (!f.querySelector('a[href$=".pdf"]')) f.appendChild(cvf);
      return true;
    }
    if (!mount()) { /* niente setInterval eterno: observer finché il footer esiste */
      var mo = new MutationObserver(function () { if (mount()) mo.disconnect(); });
      mo.observe(document.body, { childList: true, subtree: true });
    }
    function showCount(nEl, target) {
      if (reduced) { nEl.textContent = "VISITE: " + target.toLocaleString("it-IT"); return; }
      var t0 = performance.now(), DUR = 900;
      (function tick(now) {
        var p = Math.min(1, (now - t0) / DUR), e = 1 - Math.pow(1 - p, 3);
        nEl.textContent = "VISITE: " + Math.round(target * e).toLocaleString("it-IT");
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    }
    function load() {
      var ctrl = ("AbortController" in window) ? new AbortController() : null;
      var to = setTimeout(function () { if (ctrl) ctrl.abort(); }, 5000);
      fetch("https://api.counterapi.dev/v1/benz91x-alessandro-chiri/visite/up", ctrl ? { signal: ctrl.signal } : {})
        .then(function (r) { return r.json(); })
        .then(function (j) {
          clearTimeout(to);
          if (typeof j.count !== "number" || j.count < 1000) { span.style.display = "none"; return; }
          var n = document.getElementById("fx-visits-n");
          span.style.display = "";
          if (n) showCount(n, j.count);
        })
        .catch(function () { clearTimeout(to); span.style.display = "none"; }); /* catch silenzioso */
    }
    (window.requestIdleCallback || function (f) { setTimeout(f, 1200); })(load); /* fuori dal cammino critico */
  })();
})();
