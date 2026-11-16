#!/usr/bin/env python3
"""Registra canciones y fotos y OPTIMIZA las fotos de la galería.

Uso (desde la raíz del proyecto):   python3 generar-lista.py
Requiere Pillow para optimizar:     pip install pillow

Por cada foto de galeria/fotos/ crea (solo si falta o cambió):
  galeria/min/  miniatura WebP 640 px de ancho (carga instantánea, nítida hasta tarjetas de 320 px a 2x)
  galeria/med/  versión WebP 1800 px, calidad 92 (se carga sobre la miniatura cuando la foto está a la vista)
y escribe galeria/lista.js con tamaño y un mini-borroso para mostrar algo al instante.
Tus originales NO se tocan. Para subir a GitHub puedes omitir fotos/ y subir solo min/ y med/ (mucho más liviano).
"""
import base64, io, json, pathlib, sys
raiz = pathlib.Path(__file__).parent

def escribir(destino, var, datos):
    (raiz / destino).write_text(f"window.{var} = " + json.dumps(datos, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf-8")

# ---- Música ----
mus = raiz / "musica"; mus.mkdir(exist_ok=True)
canciones = sorted(p.name for p in mus.iterdir() if p.suffix.lower() in {".mp3", ".m4a", ".ogg", ".wav", ".aac", ".opus"})
escribir("musica/lista.js", "CANCIONES", canciones)
print(f"musica: {len(canciones)} canciones")

# ---- Fotos ----
EXT = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"}
fotos_dir = raiz / "galeria" / "fotos"; fotos_dir.mkdir(parents=True, exist_ok=True)
originales = sorted(p for p in fotos_dir.iterdir() if p.suffix.lower() in EXT)
try:
    from PIL import Image, ImageOps
except ImportError:
    Image = None
    print("AVISO: Pillow no está instalado (pip install pillow). Se registran las fotos sin optimizar.")

lista = []
if Image:
    (raiz / "galeria" / "min").mkdir(exist_ok=True); (raiz / "galeria" / "med").mkdir(exist_ok=True)
    ant = 0; nuevo = 0
    for p in originales:
        mn = raiz / "galeria" / "min" / (p.name + ".webp"); md = raiz / "galeria" / "med" / (p.name + ".webp")
        try:
            with Image.open(p) as im:
                im = ImageOps.exif_transpose(im)           # respeta la orientación del celular
                if im.mode not in ("RGB", "RGBA"): im = im.convert("RGB")
                w, h = im.size
                if not (mn.exists() and md.exists() and mn.stat().st_mtime >= p.stat().st_mtime):
                    s = min(1.0, 640 / w); im.resize((max(1, round(w * s)), max(1, round(h * s))), Image.LANCZOS).save(mn, "WEBP", quality=86, method=6)
                    s = min(1.0, 1800 / max(w, h)); im.resize((max(1, round(w * s)), max(1, round(h * s))), Image.LANCZOS).save(md, "WEBP", quality=92, method=6)
                t = im.convert("RGB").resize((16, max(1, round(16 * h / w))), Image.LANCZOS)
                b = io.BytesIO(); t.save(b, "WEBP", quality=45)
                lqip = "data:image/webp;base64," + base64.b64encode(b.getvalue()).decode()
        except Exception as e:
            print(f"  omitida {p.name}: {e}"); continue
        ant += p.stat().st_size; nuevo += mn.stat().st_size + md.stat().st_size
        lista.append({"n": p.name, "m": "min/" + mn.name, "g": "med/" + md.name, "w": w, "h": h, "l": lqip})
    mb = lambda x: f"{x/1048576:.1f} MB"
    print(f"galeria: {len(lista)} fotos · originales {mb(ant)} → min+med {mb(nuevo)}")
else:
    lista = [{"n": p.name} for p in originales]
escribir("galeria/lista.js", "FOTOS", lista)
