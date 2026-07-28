/* ===== FX AUDIO — musica di sottofondo opt-in =====
   I browser vietano l'autoplay con audio: la traccia parte al PRIMO gesto
   dell'utente (pointerdown/keydown ovunque), oppure dal pulsante dedicato.
   Preferenza persistente in localStorage ("fx-music": on/off).
   Se il file audio manca (404) il pulsante si nasconde da solo. */
(function () {
  "use strict";
  var SRC = "fx/epilogue-theme.mp3";
  var KEY = "fx-music";
  var VOL = 0.32;           /* volume di sottofondo: presente, non invasivo */
  var FADE_MS = 1600;

  var audio = new Audio();
  audio.src = SRC;
  audio.loop = true;
  audio.preload = "none";
  audio.volume = 0;

  var btn = null, playing = false, fadeIv = null, tried = false;

  function pref() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function setPref(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  function fadeTo(target) {
    if (fadeIv) clearInterval(fadeIv);
    var steps = Math.max(1, Math.round(FADE_MS / 60));
    var from = audio.volume, k = 0;
    fadeIv = setInterval(function () {
      k++;
      var p = Math.min(1, k / steps);
      audio.volume = Math.max(0, Math.min(1, from + (target - from) * p));
      if (p >= 1) { clearInterval(fadeIv); fadeIv = null; }
    }, 60);
  }

  function setUI() {
    if (!btn) return;
    btn.classList.toggle("on", playing);
    btn.setAttribute("aria-pressed", playing ? "true" : "false");
    var l = btn.querySelector(".fxa-state");
    if (l) l.textContent = playing ? "ON" : "OFF";
  }

  function play() {
    audio.play().then(function () {
      playing = true;
      fadeTo(VOL);
      setUI();
    }).catch(function () { /* gesto non valido o file mancante: resta off */ });
  }
  function pause() {
    playing = false;
    fadeTo(0);
    setTimeout(function () { if (!playing) audio.pause(); }, FADE_MS);
    setUI();
  }

  /* ---------- pulsante flottante ---------- */
  btn = document.createElement("button");
  btn.id = "fx-audio-btn";
  btn.type = "button";
  btn.setAttribute("aria-pressed", "false");
  btn.setAttribute("aria-label", "Musica di sottofondo: attiva o disattiva");
  btn.title = "Musica di sottofondo";
  btn.innerHTML =
    '<span class="fxa-eq" aria-hidden="true"><i></i><i></i><i></i></span>' +
    '<span class="fxa-label">MUSICA&nbsp;<span class="fxa-state">OFF</span></span>';
  document.body.appendChild(btn);
  setUI();

  btn.addEventListener("click", function () {
    tried = true;
    if (playing) { setPref("off"); pause(); }
    else { setPref("on"); play(); }
  });

  /* ---------- primo gesto ovunque => prova ad avviare (se non disattivata) ---------- */
  function firstGesture(e) {
    if (tried) return;
    tried = true;
    if (pref() === "off") return;
    /* se il gesto è sul pulsante musica, ci pensa il suo click handler */
    if (e && e.target && e.target.closest && e.target.closest("#fx-audio-btn")) return;
    play();
  }
  document.addEventListener("pointerdown", firstGesture, { once: true, passive: true });
  document.addEventListener("keydown", firstGesture, { once: true });

  /* ---------- file mancante => il pulsante sparisce, niente errori in pagina ---------- */
  audio.addEventListener("error", function () {
    if (btn) btn.style.display = "none";
  });
})();
