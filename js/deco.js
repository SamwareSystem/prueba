"use strict";
/* Decoración compartida: sprite de corazón, corazones flotantes, esquinas y confeti. */
window.Deco = (function () {
  const VB = "-.7 -.55 1.4 1.2";
  const HT = (c) => `<svg class="${c}" viewBox="${VB}"><use href="#h"/></svg>`;
  function sprite() {
    if (document.getElementById("h")) return;
    document.body.insertAdjacentHTML("afterbegin", '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><path id="h" d="M0 .55C-1-.1-.6-.78 0-.25C.6-.78 1-.1 0 .55Z"/></defs></svg>');
  }
  function confetti(x, y) {
    for (let i = 0; i < 14; i++) {
      const e = document.createElement("i");
      e.className = "cf"; e.innerHTML = HT("hrt");
      e.style.cssText = `left:${x}px;top:${y}px;color:${["#E85D82", "#8F6CD0", "#EE7A58", "#F5A9BF"][i % 4]};--x:${(Math.random() - 0.5) * 240}px;--y:${-60 - Math.random() * 170}px;--r:${(Math.random() - 0.5) * 160}deg`;
      document.body.append(e);
      setTimeout(() => e.remove(), 1000);
    }
  }
  function init(opts) {
    opts = opts || {};
    sprite();
    const $ = (s) => document.querySelector(s);
    const hs = $("#hs"); if (hs) hs.innerHTML = HT("hrt b") + HT("hrt a") + HT("hrt c");
    document.querySelectorAll("[data-hs]").forEach((n) => { n.innerHTML = HT("hrt b") + HT("hrt a") + HT("hrt c"); });
    document.querySelectorAll("[data-h]").forEach((n) => { n.innerHTML = HT("hrt"); });
    const ft = $("#ft"); if (ft) ft.innerHTML = `con mucho cariño ${HT("hrt")}`;
    document.querySelectorAll("svg.hrt:not([viewBox])").forEach((n) => n.setAttribute("viewBox", VB));
    const app = $("#app");
    if (app) [["left:-13px;top:-12px", "var(--rose)"], ["right:-13px;top:-12px", "var(--lil)"], ["left:-13px;bottom:-12px", "var(--lil)"], ["right:-13px;bottom:-12px", "var(--rose)"]].forEach(([pos, col]) => {
      const i = document.createElement("i");
      i.className = "cn"; i.style.cssText = `${pos};color:${col}`; i.innerHTML = HT("hrt");
      i.firstChild.style.cssText = "width:26px;height:23px";
      app.append(i);
    });
    if (opts.noFloat) return;
    const cols = ["#F7BFD0", "#CDB8F0", "#FFD3C2", "#F9C9D8"];
    for (let i = 0; i < 16; i++) {
      const e = document.createElement("i"), s = 14 + Math.random() * 20;
      e.className = "fl"; e.innerHTML = HT("hrt");
      e.firstChild.style.cssText = `width:${s}px;height:${s * 0.86}px`;
      e.style.cssText = `left:${Math.random() * 96}vw;top:${Math.random() * 92}vh;color:${cols[i % 4]};animation-delay:-${Math.random() * 6}s`;
      document.body.append(e);
    }
  }
  return { HT, init, confetti };
})();
