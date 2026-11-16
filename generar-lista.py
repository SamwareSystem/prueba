#!/usr/bin/env python3
"""Escanea musica/ y galeria/fotos/ y escribe sus lista.js. Ejecuta: python3 generar-lista.py"""
import json, pathlib
raiz = pathlib.Path(__file__).parent
def escanear(carpeta, ext, var, destino):
    d = raiz / carpeta
    d.mkdir(parents=True, exist_ok=True)
    f = sorted(p.name for p in d.iterdir() if p.suffix.lower() in ext)
    (raiz / destino).write_text(f"window.{var} = " + json.dumps(f, ensure_ascii=False, indent=1) + ";\n", encoding="utf-8")
    print(f"{carpeta}: {len(f)} archivos registrados")
escanear("musica", {".mp3", ".m4a", ".ogg", ".wav", ".aac", ".opus"}, "CANCIONES", "musica/lista.js")
escanear("galeria/fotos", {".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"}, "FOTOS", "galeria/lista.js")
