// @ts-check
"use strict";
/* Galería: un mundo grande con todas las fotos instanciadas; la cámara se mueve (arrastrar / tocar / rueda / flechas). */
const $ = (s) => /** @type {any} */ (document.querySelector(s));
const view = $("#view"), world = $("#world"), hint = $("#hint"), mini = $("#mini"), miniVp = $("#miniVp");
/** @type {string[]} */
const FOTOS = /** @type {any} */ (window).FOTOS || [];
const touch = matchMedia("(pointer:coarse)").matches;
$("#hintTxt").textContent = touch ? "desliza para explorar" : "arrastra para explorar";

if (!FOTOS.length) { $("#empty").hidden = false; hint.hidden = true; mini.hidden = true; }

/** PRNG determinista: el mapa es el mismo cada vez. @param {number} a */
function rng(a) { return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

let W = 0, H = 0, cam = { x: 0, y: 0 }, vel = { x: 0, y: 0 }, vw = 0, vh = 0, cardW = 180;
/** @type {HTMLElement[]} */ const nodes = [];

function build() {
  const old = { cx: (cam.x + vw / 2) / (W || 1), cy: (cam.y + vh / 2) / (H || 1) };
  vw = innerWidth; vh = innerHeight;
  cardW = Math.max(120, Math.min(230, Math.min(vw, vh) * 0.3));
  const cell = cardW * 1.55, n = FOTOS.length;
  const ratio = 1.4;                                    // mundo algo más ancho que alto
  let cols = Math.max(2, Math.ceil(Math.sqrt(n * ratio))), rows = Math.max(2, Math.ceil(n / cols));
  W = Math.max(cols * cell, vw * 2.2); H = Math.max(rows * cell, vh * 2.2);
  const cw = W / cols, ch = H / rows, cells = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) cells.push([c, r]);
  const R = rng(n * 7919 + 13);
  for (let i = cells.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [cells[i], cells[j]] = [cells[j], cells[i]]; }
  world.style.width = W + "px"; world.style.height = H + "px";
  FOTOS.forEach((name, i) => {
    let el = nodes[i];
    if (!el) {
      el = document.createElement("div"); el.className = "ph";
      const r2 = rng(i * 131 + 7);
      if (r2() < 0.35) el.classList.add("tape");
      el.dataset.rot = String((r2() - 0.5) * 12);
      el.dataset.jx = String(r2()); el.dataset.jy = String(r2());
      el.style.setProperty("--d", (5 + r2() * 5).toFixed(1) + "s");
      el.style.setProperty("--dl", "-" + (r2() * 6).toFixed(1) + "s");
      el.innerHTML = '<figure><i></i><img alt="" draggable="false" loading="lazy" decoding="async"></figure>';
      const img = el.querySelector("img");
      img.src = "fotos/" + encodeURIComponent(name);
      img.addEventListener("load", () => img.classList.add("ok"));
      nodes[i] = el; world.append(el);
    }
    const [c, r] = cells[i];
    const x = c * cw + (cw - cardW) * (0.1 + 0.8 * Number(el.dataset.jx));
    const y = r * ch + (ch - cardW * 1.2) * (0.1 + 0.8 * Number(el.dataset.jy));
    el.style.width = cardW + "px";
    el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotate(${Number(el.dataset.rot).toFixed(2)}deg)`;
    el.dataset.mx = String(x / W); el.dataset.my = String(y / H);
  });
  cam.x = old.cx ? old.cx * W - vw / 2 : (W - vw) / 2;
  cam.y = old.cy ? old.cy * H - vh / 2 : (H - vh) / 2;
  minimap(); apply();
}
function minimap() {
  mini.querySelectorAll("b").forEach((b) => b.remove());
  nodes.forEach((el) => { const b = document.createElement("b"); b.style.left = Number(el.dataset.mx) * 100 + "%"; b.style.top = Number(el.dataset.my) * 100 + "%"; mini.prepend(b); });
}
function clamp() { cam.x = Math.max(0, Math.min(W - vw, cam.x)); cam.y = Math.max(0, Math.min(H - vh, cam.y)); }
function apply() {
  clamp();
  world.style.transform = `translate3d(${-cam.x}px,${-cam.y}px,0)`;
  view.style.backgroundPosition = `${-cam.x}px ${-cam.y}px`;
  miniVp.style.left = (cam.x / W) * 100 + "%"; miniVp.style.top = (cam.y / H) * 100 + "%";
  miniVp.style.width = (vw / W) * 100 + "%"; miniVp.style.height = (vh / H) * 100 + "%";
}

/* ---- Arrastre (mouse + táctil con Pointer Events) e inercia ---- */
let dragging = false, last = { x: 0, y: 0, t: 0 }, raf = 0, hinted = false;
function dismissHint() { if (!hinted) { hinted = true; hint.classList.add("off"); } }
function glide() {
  vel.x *= 0.94; vel.y *= 0.94;
  cam.x += vel.x; cam.y += vel.y; apply();
  raf = Math.abs(vel.x) + Math.abs(vel.y) > 0.15 && !dragging ? requestAnimationFrame(glide) : 0;
}
view.addEventListener("pointerdown", (e) => {
  dragging = true; cancelAnimationFrame(raf); raf = 0; vel.x = vel.y = 0;
  last = { x: e.clientX, y: e.clientY, t: performance.now() };
  view.setPointerCapture(e.pointerId); view.classList.add("drag");
});
view.addEventListener("pointermove", (e) => {
  if (!dragging) return;
  const dx = e.clientX - last.x, dy = e.clientY - last.y, now = performance.now(), dt = Math.max(now - last.t, 1);
  cam.x -= dx; cam.y -= dy;
  vel.x = 0.7 * vel.x + 0.3 * (-dx / dt * 16); vel.y = 0.7 * vel.y + 0.3 * (-dy / dt * 16);
  last = { x: e.clientX, y: e.clientY, t: now };
  if (Math.abs(dx) + Math.abs(dy) > 2) dismissHint();
  apply();
});
const end = () => { if (!dragging) return; dragging = false; view.classList.remove("drag"); if (performance.now() - last.t < 80) raf = requestAnimationFrame(glide); };
view.addEventListener("pointerup", end); view.addEventListener("pointercancel", end);

/* ---- Rueda / trackpad y teclado ---- */
view.addEventListener("wheel", (e) => { e.preventDefault(); cancelAnimationFrame(raf); cam.x += e.shiftKey && !e.deltaX ? e.deltaY : e.deltaX; cam.y += e.shiftKey && !e.deltaX ? 0 : e.deltaY; dismissHint(); apply(); }, { passive: false });
addEventListener("keydown", (e) => {
  const s = 120, k = { ArrowLeft: [-s, 0], ArrowRight: [s, 0], ArrowUp: [0, -s], ArrowDown: [0, s] }[e.key];
  if (!k) return; e.preventDefault(); vel.x += k[0] / 8; vel.y += k[1] / 8; dismissHint();
  if (!raf) raf = requestAnimationFrame(glide);
});
let rt = 0; addEventListener("resize", () => { clearTimeout(rt); rt = window.setTimeout(build, 150); });

Deco.init({ noFloat: true });
build();
view.focus({ preventScroll: true });
