# Me siento así… · Guía de publicación

El sitio es estático (HTML + CSS + JS). Como GitHub Pages no tiene servidor, el correo lo envía el servicio gratuito **Web3Forms** (250 envíos/mes gratis, sin instalar nada). Ella solo toca "Enviar".

## 1. Obtener la access key (2 min)
1. Entra a https://web3forms.com y escribe `durbinacastle@gmail.com` en "Create your Access Key".
2. Llegará un correo a esa dirección con la **access key** (un código largo). Revisa spam.
3. Abre `js/config.js` y reemplaza `PEGA_AQUI_TU_ACCESS_KEY` por ese código (déjalo entre comillas).

> La key es pública por diseño: solo permite enviar correos a tu dirección, nada más.

### Cómo llega el correo
Llega directo a `durbincastle@gmail.com` (la dirección con la que creaste la key). Cada pregunta viaja como un campo aparte, numerado y en orden (`01 · ¿Ya comió?` → respuesta), así que Web3Forms lo arma como tabla Pregunta / Respuesta. El asunto lleva fecha y hora. Si quieres plantillas HTML con más espacio y diseño propio, Web3Forms las ofrece en su plan de pago.

## 2. Probar en tu computadora
En la carpeta del proyecto ejecuta `python3 -m http.server 8000` y abre http://localhost:8000. Llena el formulario, envía y revisa tu bandeja.

## 3. Publicar en GitHub Pages
1. Crea cuenta en https://github.com y pulsa **New repository**. Nómbralo, por ejemplo, `me-siento-asi` y déjalo **Public** (Pages gratis lo requiere).
2. Pulsa **uploading an existing file**, arrastra el contenido de la carpeta (`index.html`, `css/`, `js/`) y haz **Commit changes**. Sube la carpeta con las subcarpetas, no el .zip.
3. Ve a **Settings → Pages**. En *Source* elige **Deploy from a branch**, rama **main**, carpeta **/ (root)** y **Save**.
4. En 1–2 minutos aparece la dirección: `https://TU-USUARIO.github.io/me-siento-asi/`. Envíasela a ella; puede agregarla a su pantalla de inicio desde el menú del navegador.

## 4. Cambiar algo después
Edita el archivo en GitHub (icono del lápiz) → Commit. Se actualiza solo en ~1 minuto.

## Problemas comunes
- **"Falta configurar la access key"**: no pegaste la key en `js/config.js`.
- **No llega el correo**: revisa spam; busca "Me siento así…". Marca como "No es spam".
- **Error al enviar**: revisa que la key esté completa y sin espacios. Sus respuestas no se pierden mientras no cierre la página.
- **Página en blanco/sin estilos**: subiste el .zip o los archivos sin las carpetas `css/` y `js/`.

## Notas de diseño
- Si responde "No" a "¿Hay algo que me quiera contar?", se ocultan periodo, relato, sentimiento, puntaje y latidos (los latidos dependen del periodo). Si responde "No" a "¿Ya comió?" o "¿Ya tomó agua?", se ocultan sus preguntas de seguimiento.
- Los latidos se ofrecen como 5 rangos (60–100 pulsaciones/min × duración del periodo).
- El código usa JSDoc con `// @ts-check` para tipado estricto sin necesitar compilar nada.

## Música de fondo
1. Copia tus canciones (.mp3, .m4a, .ogg…) dentro de la carpeta `musica/`.
2. Ejecuta `python3 generar-lista.py` (actualiza `musica/lista.js`). Sin Python, edita ese archivo a mano: `window.CANCIONES = ["cancion1.mp3","cancion2.mp3"];`
3. Sube la carpeta `musica/` a GitHub junto al resto.
Suena una canción aleatoria al 50 % de volumen y, al terminar, otra distinta. Los navegadores bloquean audio automático, así que si no arranca al abrir, empieza con el primer toque en la página. Hay un botón 🔊 abajo a la derecha para silenciar.


## Estructura v2 (centro de aplicaciones)
```
index.html            Hub (elige la aplicación)
cuestionario/         Cuestionario (la app original)
carta/                Carta libre: hoja que crece hacia abajo, se envía por correo
galeria/              Galería: mundo de fotos que se explora arrastrando
  fotos/              <- tus imágenes
musica/               <- tus canciones
css/ js/              Estilos y código compartidos (config.js = tu access key)
generar-lista.py      Registra canciones y fotos (ejecútalo tras añadir archivos)
```
- **Carta libre** usa la misma access key y llega a tu correo con campos Fecha / Para / Carta / Con cariño. El borrador se guarda en el navegador por si se cierra la página.
- **Galería**: pon fotos (ideal ≤ 400 KB, ~1200 px) en `galeria/fotos/` y ejecuta `python3 generar-lista.py`. Se mueve con arrastre (mouse o dedo), rueda/trackpad y flechas.
- La música continúa de donde iba al cambiar de aplicación (misma canción y segundo), pero el navegador puede pedir un toque para reanudarla.

## Subir a GitHub (v2)
Sube TODO el contenido nuevo del zip, conservando carpetas. Conserva tu `js/config.js` con la key real (no lo reemplaces; el de este zip trae el marcador). El antiguo `index.html` ahora es el Hub; el cuestionario vive en `cuestionario/`, y `js/app.js` es solo del cuestionario.
