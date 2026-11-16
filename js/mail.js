"use strict";
/* Envío por Web3Forms (misma access key de js/config.js). fields: objeto ordenado Pregunta -> Respuesta. */
window.Mail = {
  async send(subject, fromName, fields, botcheck) {
    const CFG = window.APP_CONFIG;
    if (!CFG || !CFG.ACCESS_KEY || CFG.ACCESS_KEY === "PEGA_AQUI_TU_ACCESS_KEY") throw new Error("Falta configurar la access key en js/config.js (ver GUIA.md).");
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 20000);
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ access_key: CFG.ACCESS_KEY, subject, from_name: fromName, botcheck: !!botcheck, ...fields }),
        signal: ctrl.signal,
      });
      const d = await res.json();
      if (!res.ok || !d.success) throw new Error(d.message || "Error " + res.status);
    } finally { clearTimeout(t); }
  },
};
