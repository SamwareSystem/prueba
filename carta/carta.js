// @ts-check
"use strict";
const $ = (s) => /** @type {any} */ (document.querySelector(s));
const LH = 34, MIN_LINES = 16, EXTRA_LINES = 4, DRAFT = "carta-borrador";
const body = $("#cuerpo"), form = $("#form"), status = $("#status"), send = $("#send");
Deco.init();
$("#fecha").textContent = new Date().toLocaleDateString("es-HN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

/** La hoja crece hacia abajo: siempre quedan EXTRA_LINES líneas libres bajo lo escrito. */
function grow() {
  body.style.height = "auto";
  const need = Math.ceil((body.scrollHeight + EXTRA_LINES * LH) / LH) * LH;
  body.style.height = Math.max(need, MIN_LINES * LH) + "px";
}
function save() { try { localStorage.setItem(DRAFT, JSON.stringify({ p: $("#para").value, c: body.value, f: $("#firma").value })); } catch (e) { /* sin almacenamiento */ } }
try { const d = JSON.parse(localStorage.getItem(DRAFT) || "null"); if (d) { $("#para").value = d.p || ""; body.value = d.c || ""; $("#firma").value = d.f || ""; } } catch (e) { /* borrador inválido */ }
grow();
form.addEventListener("input", () => { grow(); save(); });
addEventListener("resize", grow);

/** @param {string} m */
const fail = (m) => { status.hidden = false; status.textContent = m; };
form.addEventListener("submit", async (e) => {
  e.preventDefault(); status.hidden = true;
  const text = body.value.trim();
  if (!text) { fail("La carta está vacía, mi amor. Escribe algo antes de sellarla."); body.focus(); return; }
  send.disabled = true; send.lastChild.textContent = " Enviando…";
  const para = $("#para").value.trim(), firma = $("#firma").value.trim();
  try {
    await Mail.send(`Carta libre${para ? " · para " + para : ""} (${new Date().toLocaleString("es-MX")})`, "Carta libre", {
      "Fecha": $("#fecha").textContent,
      "Para": para || "(sin destinatario)",
      "Carta": text,
      "Con cariño": firma || "(sin firma)",
    }, $("#botcheck").checked);
    try { localStorage.removeItem(DRAFT); } catch (x) { /* nada */ }
    form.hidden = true; $("#thanks").hidden = false;
    Deco.confetti(innerWidth / 2, innerHeight / 3); scrollTo({ top: 0, behavior: "smooth" });
  } catch (err) {
    fail(err instanceof Error && err.message.startsWith("Falta") ? err.message : "No se pudo enviar. Tu carta sigue aquí (y guardada); intenta de nuevo en un momento.");
    console.error(err); send.disabled = false; send.lastChild.textContent = " Sellar y enviar";
  }
});
