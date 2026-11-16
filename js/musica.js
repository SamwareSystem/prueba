// @ts-check
"use strict";
/* Música de fondo: canción aleatoria de musica/lista.js, volumen 50 %, encadena otra al terminar. */
(function () {
  const VOLUME = 0.5;
  const BASE = new URL("../musica/", /** @type {HTMLScriptElement} */ (document.currentScript).src).href;
  const KEY = "musica-estado";
  /** @type {string[]} */
  const songs = /** @type {any} */ (window).CANCIONES || [];
  if (!songs.length) return;
  const audio = new Audio();
  audio.volume = 0;
  const FADE_MS = 5000;
  let fadeTimer = 0;
  /** Sube el volumen de 0 a 50 % de forma gradual. */
  function fadeIn() {
    window.clearInterval(fadeTimer);
    audio.volume = 0;
    const t0 = performance.now();
    fadeTimer = window.setInterval(() => {
      const k = Math.min((performance.now() - t0) / FADE_MS, 1);
      audio.volume = VOLUME * k * k; // curva suave: arranca casi imperceptible
      if (k >= 1) window.clearInterval(fadeTimer);
    }, 50);
  }
  audio.preload = "auto";
  let last = -1, started = false, muted = false;

  function pick() {
    let i = Math.floor(Math.random() * songs.length);
    if (songs.length > 1 && i === last) i = (i + 1 + Math.floor(Math.random() * (songs.length - 1))) % songs.length;
    last = i;
    return i;
  }
  function next() {
    let resume = 0;
    try {
      const st = JSON.parse(sessionStorage.getItem(KEY) || "null");
      if (st && songs.includes(st.name) && !audio.src) { last = songs.indexOf(st.name); resume = st.t || 0; }
      else last = pick();
    } catch (e) { last = pick(); }
    audio.src = BASE + encodeURIComponent(songs[last]);
    if (resume) audio.currentTime = resume;
    audio.volume = 0;
    return audio.play().then(fadeIn);
  }
  audio.addEventListener("ended", () => { next().catch(() => {}); });
  audio.addEventListener("error", () => { if (songs.length > 1) setTimeout(() => next().catch(() => {}), 500); });

  const btn = document.createElement("button");
  btn.type = "button"; btn.className = "mus"; btn.textContent = "🔊"; btn.setAttribute("aria-label", "Silenciar música");
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!started) { onGesture(); return; }
    muted = !muted; audio.muted = muted;
    btn.textContent = muted ? "🔇" : "🔊";
    btn.setAttribute("aria-label", muted ? "Activar música" : "Silenciar música");
  });
  document.body.append(btn);

  function save() {
    try { if (audio.src) sessionStorage.setItem(KEY, JSON.stringify({ name: songs[last], t: audio.currentTime })); } catch (e) { /* sin almacenamiento */ }
  }
  addEventListener("pagehide", save);
  setInterval(save, 2000);

  const EVENTS = ["pointerdown", "pointerup", "mouseup", "touchend", "keydown", "click"];
  function arm() { EVENTS.forEach((ev) => document.addEventListener(ev, onGesture, true)); }
  function disarm() { EVENTS.forEach((ev) => document.removeEventListener(ev, onGesture, true)); }
  function onGesture() {
    if (started) return;
    next().then(() => { started = true; disarm(); btn.textContent = muted ? "🔇" : "🔊"; btn.classList.remove("wait"); }).catch(() => {});
  }
  // Intento inmediato (algunos navegadores lo permiten); si lo bloquean, arranca con el primer toque.
  next().then(() => { started = true; }).catch(() => { arm(); btn.textContent = "🔇"; btn.classList.add("wait"); });
})();
