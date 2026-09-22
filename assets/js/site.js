/* =====================================================================
   Alessandro Chiri — digital résumé v4 · comportamento della pagina
   Lingua IT/EN, tema, menu, scene guidate dallo scroll, comparse,
   galleria, contatori, analytics (GoatCounter opzionale).
   Tutto è progressivo: senza JS la pagina è completa e leggibile.
   ===================================================================== */
(function () {
  "use strict";

  /* ---------- Configurazione ---------- */
  var GC_CODE = "TUOCODICE"; // <-- codice GoatCounter (vedi ISTRUZIONI-ANALYTICS.md)
  var COUNTER = "https://api.counterapi.dev/v1/benz91x-alessandro-chiri/visite";
  var PREVIEW = /\/anteprima\//.test(location.pathname);

  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var mqReduce = matchMedia("(prefers-reduced-motion: reduce)");
  var reduced = mqReduce.matches;
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  /* ---------- Testi inglesi (l'italiano è nell'HTML) ---------- */
  var EN = {
    "a11y.skip": "Skip to content",
    "a11y.sections": "Sections",
    "a11y.lang": "Passa all'italiano",
    "a11y.theme": "Toggle light or dark theme",
    "a11y.menuOpen": "Open menu",
    "a11y.numbers": "By the numbers",
    "a11y.gallery": "Projects: scroll horizontally",
    "a11y.prev": "Previous project",
    "a11y.next": "Next project",
    "a11y.cities": "Choose a city",
    "a11y.langs": "Languages",
    "a11y.areas": "Areas",
    "nav.profile": "Profile", "nav.journey": "Journey", "nav.projects": "Projects",
    "nav.where": "Where", "nav.skills": "Skills", "nav.contact": "Contact",
    "nav.cta": "Get in touch", "nav.lang": "IT",
    "menu.lang": "Italiano", "menu.theme": "Light / dark theme",
    "hero.badge": "Open to work · Italy, EU, remote",
    "hero.sub": "I turn business needs into platforms that work. And into faster decisions.",
    "hero.cta1": "Let’s talk about the role",
    "hero.cta2": "Download my CV",
    "hero.alt": "Portrait of Alessandro Chiri",
    "hero.cap": "Milan / Bari · 2026",
    "hero.k1": "Since 2018", "hero.k1s": "uninterrupted enterprise delivery",
    "hero.k2": "Big 4 · utilities · public sector", "hero.k2s": "the contexts I work in",
    "hero.k3s": "requirements, platforms, releases",
    "hero.k4": "Italy · EU · remote", "hero.k4s": "open to new roles",
    "st.eyebrow": "Profile",
    "st.text": "Eight years at the heart of enterprise consulting. Accenture, Micro Focus, now Deloitte NextHub. I speak both the stakeholders’ language and the systems’ — and translate in both directions.",
    "n.1": "years of enterprise consulting",
    "n.2": "companies: Accenture, Micro Focus, Deloitte",
    "n.3": "Micro Focus professional certifications",
    "n.4": "working languages: Italian and English",
    "p.label": "Why hire me",
    "p.title": "Three reasons to stop your search here.",
    "p.intro": "A hybrid business + technology profile: consulting rigor, attention to the numbers, and the ability to get non-technical stakeholders, IT teams and vendors talking.",
    "p.c1.s": "End-to-end ownership",
    "p.c1.t": "Delivery that gets it done.",
    "p.c1.b": "Day-by-day management of complex projects, coordinated cross-functional teams, KPIs and reporting that keep everything under control. Zero surprises at go-live.",
    "p.c2.s": "From requirement to production",
    "p.c2.t": "A bridge between business and IT.",
    "p.c2.b": "Formalized requirements, configured platforms, validated releases. I speak both the stakeholders’ language and the systems’ — and translate in both directions.",
    "p.c3.s": "Faster decisions",
    "p.c3.t": "Executive-ready communication.",
    "p.c3.b": "One-pagers, business cases and dashboards C-levels actually read. Every number in its place, every slide built for action.",
    "x.label": "Journey",
    "x.title": "From 2018 to today. Every role, one level up.",
    "x.intro": "From Business Analyst at Accenture to Application Specialist at Micro Focus, to consulting at Deloitte NextHub. A coherent trajectory, always climbing.",
    "x.1.p": "2024 — today",
    "x.cur": "Current role",
    "x.1.b": "Open innovation and technology transfer on the xTech / NextHub platform. Requirements, backlog prioritization and decision-ready deliverables for corporate executives and public-sector stakeholders.",
    "x.2.m": "5 years · enterprise software",
    "x.2.b": "Five years of service quality on enterprise ALM and testing solutions: environment configuration, incident and problem management, release validation, documentation and knowledge sharing with teams and clients.",
    "x.3.m": "Where it all started",
    "x.3.b": "Requirements gathering, process analysis and redesign, functional documentation and test cases in Agile projects for large clients. The method I still apply every day.",
    "j.label": "Selected projects",
    "j.title": "How I work, in practice.",
    "j.k1": "Challenge", "j.k2": "Contribution", "j.k3": "Outcome",
    "j.c1.tag": "Open innovation",
    "j.c1.t": "xTech / NextHub — startup scouting for corporates and government",
    "j.c1.v1": "Picking the right solutions among dozens of candidate startups.",
    "j.c1.v2": "Platform configured and managed, evaluation criteria defined, decision-ready one-pagers for executives.",
    "j.c1.v3": "Structured scouting, faster decisions, traceable evaluations.",
    "j.c2.tag": "Software quality",
    "j.c2.t": "ALM &amp; testing platform for a major utility",
    "j.c2.v1": "Quality and operational continuity across a critical application portfolio.",
    "j.c2.v2": "Micro Focus suite configured (ALM, UFT, LoadRunner), incidents managed, test cycles supported.",
    "j.c2.v3": "Fewer release disruptions, more stakeholder confidence in change.",
    "j.c3.tag": "Data &amp; automation",
    "j.c3.t": "Project reporting automation",
    "j.c3.v1": "Slow, manual analyses supporting project decisions.",
    "j.c3.v2": "Automated Excel / VBA reports, standard templates for KPIs and milestones.",
    "j.c3.v3": "Less manual work, consistent reporting, more visibility for PMs and sponsors.",
    "g.label": "Experience &amp; places",
    "g.title": "Where I’ve worked.",
    "g.sub": "Three cities, three chapters: open innovation in Milan, enterprise software in Rome, research in Bari.",
    "g.c0": "Milan", "g.c1": "Rome",
    "g.n0": "Open innovation · Ventures",
    "g.n1": "Utilities · Energy · Public funding",
    "g.n2": "Research · Technology transfer",
    "g.cl": "Key clients",
    "g.hint": "Scroll to explore",
    "s.label": "Skills",
    "s.title": "Enterprise tools, consulting method.",
    "s.h": "Technical",
    "s.h.note": "Platforms, data, software quality",
    "s.t2": "Configuration and support",
    "s.t3": "Innovation platforms, AI recommendation engine",
    "s.t4": "Advanced Excel, VBA, SQL, Python",
    "s.c": "Consulting",
    "s.c.note": "Method, relationships, communication",
    "s.c1": "And process analysis",
    "s.c2": "Clear communication with executives",
    "s.c3": "Cross-functional teams",
    "s.c4t": "Decision-ready deliverables",
    "s.c4": "One-pagers, slides, executive summaries",
    "s.c5": "Workshops and training",
    "s.l1k": "Italian", "s.l1v": "Native", "s.l2k": "English",
    "e.label": "Education",
    "e.title": "Education and certifications.",
    "e.c1.k": "Studies",
    "e.c1.a": "BSc in Industrial Engineering (L-9)",
    "e.c1.b": "Industrial mechanical technician diploma",
    "e.c2.x": "Plus courses on Agile, Cyber Security, Power BI, public speaking and digital writing.",
    "c.label": "Contact",
    "c.title": "The candidate you were looking for already has a web page.",
    "c.text": "I’m looking for Senior Consultant / Manager roles in management consulting and digital transformation — Big 4, corporate or scale-up. Energy, industrial and the public sector are where I perform best. Write to me: I reply the same day.",
    "c.b1": "Email me",
    "c.cv": "CV as PDF",
    "c.a.1k": "Roles", "c.a.2k": "Sectors", "c.a.3k": "Location",
    "c.a.3v": "Italy (Milan / Bari) · open to EU, remote and hybrid",
    "f.h1": "Sections", "f.h2": "Contact", "f.h3": "Today",
    "f.cv": "CV (PDF)", "f.where": "Italy · EU · remote",
    "f.ver": "Digital résumé v4.0 — updated September 2026.",
    "f.top": "Back to top"
  };
  /* testi generati da JS, in entrambe le lingue */
  var DYN = {
    it: { menuOpen: "Apri il menu", menuClose: "Chiudi il menu", visits: "Visite" },
    en: { menuOpen: "Open menu", menuClose: "Close menu", visits: "Visits" }
  };

  var lang = root.getAttribute("data-lang") === "en" ? "en" : "it";
  function t(k) { return DYN[lang][k]; }
  var listeners = { lang: [], theme: [] };
  function emit(n) { listeners[n].forEach(function (f) { try { f(); } catch (e) {} }); }

  function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function splitWords() {
    $$("[data-words]").forEach(function (el) {
      var text = el.textContent.replace(/\s+/g, " ").trim();
      var words = text.split(" ");
      el.innerHTML = '<span class="sr-only"></span><span aria-hidden="true"></span>';
      el.firstChild.textContent = text;
      el.lastChild.innerHTML = words.map(function (w, i) {
        return '<span class="w" style="--i:' + i + '">' + esc(w) + "</span>";
      }).join(" ");
      el.style.setProperty("--n", words.length);
    });
  }

  function applyLang(l) {
    lang = l;
    root.lang = l;
    root.setAttribute("data-lang", l);
    $$("[data-i18n]").forEach(function (el) {
      if (el.__it === undefined) el.__it = el.innerHTML;
      var v = l === "en" ? EN[el.getAttribute("data-i18n")] : undefined;
      el.innerHTML = v !== undefined ? v : el.__it;
    });
    $$("[data-i18n-attr]").forEach(function (el) {
      el.getAttribute("data-i18n-attr").split(";").forEach(function (pair) {
        var kv = pair.split(":"), attr = kv[0], key = kv[1], k = "__it_" + attr;
        if (el[k] === undefined) el[k] = el.getAttribute(attr) || "";
        var v = l === "en" ? EN[key] : undefined;
        el.setAttribute(attr, v !== undefined ? v : el[k]);
      });
    });
    splitWords();
    var mb = $(".nav__menu");
    if (mb) mb.setAttribute("aria-label", t(mb.getAttribute("aria-expanded") === "true" ? "menuClose" : "menuOpen"));
    emit("lang");
  }
  function toggleLang() {
    applyLang(lang === "it" ? "en" : "it");
    store("ac-lang", lang);
    try {
      var u = new URL(location.href);
      if (u.searchParams.has("lang")) { u.searchParams.set("lang", lang); history.replaceState(null, "", u); }
    } catch (e) {}
  }

  /* ---------- Tema ---------- */
  var mqDark = matchMedia("(prefers-color-scheme: dark)");
  function theme() { return root.getAttribute("data-theme") || (mqDark.matches ? "dark" : "light"); }
  function paintThemeColor() {
    var c = theme() === "dark" ? "#000000" : "#ffffff";
    $$('meta[name="theme-color"]').forEach(function (m) {
      if (root.getAttribute("data-theme")) m.setAttribute("content", c);
    });
  }
  function toggleTheme() {
    var next = theme() === "dark" ? "light" : "dark";
    var go = function () { root.setAttribute("data-theme", next); store("ac-theme", next); paintThemeColor(); emit("theme"); };
    if (document.startViewTransition && !reduced) document.startViewTransition(go); else go();
  }

  /* ---------- Scene guidate dallo scroll ---------- */
  var scenes = [], ticking = false;
  var sceneIO = "IntersectionObserver" in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      for (var i = 0; i < scenes.length; i++) if (scenes[i].el === e.target) scenes[i].on = e.isIntersecting;
    });
    requestTick();
  }, { rootMargin: "25% 0px 25% 0px" }) : null;

  function measure(s) {
    var r = s.el.getBoundingClientRect(), vh = window.innerHeight, p;
    if (s.mode === "pin") p = -r.top / Math.max(1, r.height - vh);
    else if (s.mode === "enter") p = (vh - r.top) / (vh * 0.85);
    else if (s.mode === "center") p = (vh * 0.55 - r.top) / Math.max(1, r.height);
    else p = (vh - r.top) / (vh + r.height);
    p = clamp(p, 0, 1);
    if (Math.abs(p - s.p) > 0.0004 || s.p < 0) {
      s.p = p;
      if (s.css) s.el.style.setProperty("--p", p.toFixed(4));
      if (s.cb) s.cb(p);
    }
  }
  function tick() {
    ticking = false;
    for (var i = 0; i < scenes.length; i++) if (scenes[i].on || !sceneIO) measure(scenes[i]);
  }
  function requestTick() { if (!ticking) { ticking = true; requestAnimationFrame(tick); } }
  function addScene(el, mode, cb, css) {
    var s = { el: el, mode: mode, cb: cb, css: css !== false, p: -1, on: true };
    scenes.push(s);
    if (sceneIO) sceneIO.observe(el);
    measure(s);
    return s;
  }
  addEventListener("scroll", requestTick, { passive: true });
  addEventListener("resize", function () { scenes.forEach(function (s) { s.p = -1; }); requestTick(); }, { passive: true });

  /* ---------- Avvio ---------- */
  function init() {
    applyLang(lang);
    paintThemeColor();
    mqDark.addEventListener && mqDark.addEventListener("change", function () { paintThemeColor(); emit("theme"); });

    $$('[data-action="lang"]').forEach(function (b) { b.addEventListener("click", toggleLang); });
    $$('[data-action="theme"]').forEach(function (b) { b.addEventListener("click", toggleTheme); });

    initNav();
    initMenu();

    if (!reduced) {
      $$("[data-scene]").forEach(function (el) {
        if (el.classList.contains("where__scroller")) return; /* gestita dal globo */
        addScene(el, el.getAttribute("data-scene"));
      });
    } else {
      var jl = $(".journey__list"); if (jl) jl.style.setProperty("--p", 1);
    }

    initReveal();
    initCounters();
    initJourney();
    initGallery();
    idle(initAnalytics);
    idle(initVisits);
  }

  function idle(fn) { ("requestIdleCallback" in window) ? requestIdleCallback(fn, { timeout: 3000 }) : setTimeout(fn, 1200); }

  /* ---------- Nav: bordo quando incollata + sezione corrente ---------- */
  function initNav() {
    var nav = $("#nav"), darks = $$(".section--dark"), dark = false;
    var onScroll = function () {
      nav.classList.toggle("is-stuck", window.scrollY > 8);
      /* il vetro si adatta al contenuto sotto: scuro sopra i capitoli scuri */
      var y = 24, d = false;
      for (var i = 0; i < darks.length; i++) {
        var r = darks[i].getBoundingClientRect();
        if (r.top <= y && r.bottom >= y) { d = true; break; }
      }
      if (d !== dark) { dark = d; nav.classList.toggle("nav--dark", d); }
    };
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (!("IntersectionObserver" in window)) return;
    var map = { top: null, profilo: "profilo", perche: "profilo", percorso: "percorso", progetti: "progetti",
                dove: "dove", competenze: "competenze", formazione: "competenze", contatti: "contatti" };
    var links = $$(".nav__links a");
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var id = map[e.target.id];
        links.forEach(function (a) {
          if (a.getAttribute("href") === "#" + id) a.setAttribute("aria-current", "true");
          else a.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
  }

  /* ---------- Menu mobile ---------- */
  function initMenu() {
    var btn = $(".nav__menu"), menu = $("#menu");
    if (!btn || !menu) return;
    $$(".menu__links a", menu).forEach(function (a, i) { a.style.setProperty("--i", i); });
    function setOpen(open) {
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.setAttribute("aria-label", t(open ? "menuClose" : "menuOpen"));
      if (open) {
        menu.hidden = false;
        requestAnimationFrame(function () { menu.classList.add("is-open"); });
        root.style.overflow = "hidden";
        var first = $("a", menu); if (first) first.focus({ preventScroll: true });
      } else {
        menu.classList.remove("is-open");
        menu.hidden = true;
        root.style.overflow = "";
      }
    }
    btn.addEventListener("click", function () { setOpen(btn.getAttribute("aria-expanded") !== "true"); });
    menu.addEventListener("click", function (e) {
      if (e.target.closest && e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && btn.getAttribute("aria-expanded") === "true") { setOpen(false); btn.focus(); }
    });
    matchMedia("(min-width: 834px)").addEventListener("change", function (m) { if (m.matches) setOpen(false); });
  }

  /* ---------- Comparse allo scroll ---------- */
  function initReveal() {
    var els = $$(".reveal");
    if (reduced || !("IntersectionObserver" in window)) { els.forEach(function (el) { el.classList.add("is-in"); }); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Contatori ---------- */
  function initCounters() {
    var els = $$("[data-count]");
    if (reduced || !("IntersectionObserver" in window)) return;
    els.forEach(function (el) { el.textContent = "0"; });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        var el = e.target, to = +el.getAttribute("data-count"), t0 = performance.now(), dur = 1400;
        (function step(now) {
          var k = clamp((now - t0) / dur, 0, 1), eased = 1 - Math.pow(1 - k, 3);
          el.textContent = String(Math.round(to * eased));
          if (k < 1) requestAnimationFrame(step);
        })(t0);
      });
    }, { threshold: 0.6 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Percorso: anno in evidenza ---------- */
  function initJourney() {
    var roles = $$(".role"), years = $$(".journey__year");
    if (!roles.length) return;
    function setCurrent(role) {
      roles.forEach(function (r) { r.classList.toggle("is-current", r === role); });
      var y = role.getAttribute("data-year");
      years.forEach(function (el) { el.classList.toggle("is-active", el.getAttribute("data-year") === y); });
    }
    setCurrent(roles[0]);
    if (!("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) setCurrent(e.target); });
    }, { rootMargin: "-42% 0px -52% 0px" });
    roles.forEach(function (r) { io.observe(r); });
  }

  /* ---------- Galleria progetti ---------- */
  function initGallery() {
    $$("[data-gallery]").forEach(function (g) {
      var track = $(".gallery__track", g), cards = $$(".gcard", g), dots = $$(".gallery__dots span", g);
      var prev = $('.paddle[data-dir="-1"]', g), next = $('.paddle[data-dir="1"]', g);
      function step() { return cards[1] ? cards[1].offsetLeft - cards[0].offsetLeft : track.clientWidth; }
      var raf = 0;
      function update() {
        raf = 0;
        var x = track.scrollLeft, max = track.scrollWidth - track.clientWidth;
        var i = clamp(Math.round(x / step()), 0, cards.length - 1);
        if (x >= max - 4) i = cards.length - 1;
        dots.forEach(function (d, k) { d.classList.toggle("is-active", k === i); });
        prev.disabled = x <= 4;
        next.disabled = x >= max - 4;
      }
      track.addEventListener("scroll", function () { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
      addEventListener("resize", update, { passive: true });
      [prev, next].forEach(function (b) {
        b.addEventListener("click", function () {
          track.scrollBy({ left: +b.getAttribute("data-dir") * step(), behavior: reduced ? "auto" : "smooth" });
        });
      });
      update();
    });
  }

  /* ---------- Analytics (GoatCounter, solo sul sito pubblicato) ---------- */
  function initAnalytics() {
    if (PREVIEW || GC_CODE === "TUOCODICE") return;
    var s = document.createElement("script");
    s.async = true; s.src = "https://gc.zgo.at/count.js";
    s.setAttribute("data-goatcounter", "https://" + GC_CODE + ".goatcounter.com/count");
    document.head.appendChild(s);

    var q = [], ready = false;
    function flush() { if (!window.goatcounter || !window.goatcounter.count) return; ready = true; while (q.length) window.goatcounter.count(q.shift()); }
    var poll = setInterval(function () { flush(); if (ready) clearInterval(poll); }, 400);
    setTimeout(function () { clearInterval(poll); }, 15000);
    function ev(p, title) { var o = { path: p, title: title || p, event: true }; if (ready) window.goatcounter.count(o); else q.push(o); }

    var hit = {};
    addEventListener("scroll", function () {
      var max = document.documentElement.scrollHeight - innerHeight; if (max <= 0) return;
      var pct = scrollY / max * 100;
      [25, 50, 75, 100].forEach(function (m) { if (!hit[m] && pct >= m - 0.5) { hit[m] = true; ev("scroll-" + m, "Scroll " + m + "%"); } });
    }, { passive: true });
    [[15, "15s"], [30, "30s"], [60, "1min"], [180, "3min"]].forEach(function (x) {
      setTimeout(function () { ev("tempo-" + x[1], "Permanenza " + x[1]); }, x[0] * 1000);
    });
    document.addEventListener("click", function (e) {
      var a = e.target.closest ? e.target.closest("a") : null; if (!a) return;
      var h = (a.getAttribute("href") || "").toLowerCase();
      if (h.indexOf(".pdf") > -1) ev("download-cv", "Download CV PDF");
      else if (h.indexOf("mailto:") === 0) ev("click-email", "Click Email");
      else if (h.indexOf("linkedin.") > -1) ev("click-linkedin", "Click LinkedIn");
      else if (h.indexOf("github.") > -1) ev("click-github", "Click GitHub");
    }, true);
    try {
      var sp = new URLSearchParams(location.search), src = sp.get("ref") || sp.get("utm_source");
      if (src) { src = src.toLowerCase().replace(/[^a-z0-9-_]/g, "").slice(0, 40); if (src) ev("fonte-" + src, "Candidatura: " + src); }
    } catch (err) {}
  }

  /* ---------- Contatore visite (compare oltre le 1000) ---------- */
  function initVisits() {
    var el = $(".visits"); if (!el || !window.fetch) return;
    var ctrl = "AbortController" in window ? new AbortController() : null;
    var to = setTimeout(function () { if (ctrl) ctrl.abort(); }, 5000);
    var count = null;
    function paint() {
      if (count === null) return;
      el.textContent = t("visits") + ": " + count.toLocaleString(lang === "en" ? "en-US" : "it-IT");
      el.hidden = false;
    }
    fetch(COUNTER + (PREVIEW ? "" : "/up"), ctrl ? { signal: ctrl.signal } : {})
      .then(function (r) { return r.json(); })
      .then(function (j) { clearTimeout(to); if (typeof j.count === "number" && j.count >= 1000) { count = j.count; paint(); } })
      .catch(function () {});
    listeners.lang.push(paint);
  }

  /* ---------- API minima per il globo ---------- */
  window.AC = {
    scene: addScene,
    reduced: function () { return reduced; },
    lang: function () { return lang; },
    on: function (n, f) { if (listeners[n]) listeners[n].push(f); }
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
