# Documentos largos en PDF (reglamento, propuesta y manual)

Convierten los documentos de `assets/Documentaciones/` al diseño de los PDF del colegio
(membrete con escudo, MEC y Gobierno del Paraguay, franja verde y dorada, pie de Admisiones y numeración).
La carpeta `assets/Documentaciones/` no se sube a git, así que los originales quedan solo en esta computadora.

| PDF que se genera | Origen |
|---|---|
| `assets/pdf/reglamento-admision.pdf` | `REGLAMENTO DE ADMISION 09-10-2026.docx` |
| `assets/pdf/propuesta-educativa-2027.pdf` | `PROPUESTA EDUCATIVA INSTITUCIONAL 2027.docx` |
| `assets/pdf/manual-convivencia.pdf` | `Normas de convivencias.pdf` (se reconstruye el texto desde el PDF) |

## Cuando cambia un documento

1. Reemplazar el archivo en `assets/Documentaciones/` (mismo nombre).
2. Ejecutar, desde la carpeta principal del proyecto:

   ```bash
   bash herramientas/documentos/actualizar_documentos.sh            # los tres
   bash herramientas/documentos/actualizar_documentos.sh reglamento # o uno solo: reglamento, propuesta, manual
   ```

3. Revisar la salida de la verificación: compara palabra por palabra el texto del documento de origen con el del PDF.
   En el reglamento debe dar `FALTAN 0` y `SOBRAN 0`. En los otros dos solo puede quedar ruido que no es contenido
   (letras sueltas del rótulo con letras espaciadas, el encabezado de una tabla, palabras que el PDF original traía cortadas).

Requisitos: Python 3 con Pillow, `pdftotext`, `pdfinfo` y `pdftohtml` (poppler), Node 22 o superior y Google Chrome.

## Cómo está hecho

- `docx_bloques.py` lee el Word (incluida la numeración de varios niveles, como 3.1.1.1).
- `construir_*.py` arman `assets/pdf/<documento>.html` con el contenido dentro de `<div id="fuente">`.
- `assets/pdf/paginar.js` reparte ese contenido en hojas A4 (portada con índice, hojas interiores con encabezado reducido),
  cuida que un título no quede solo al final de una hoja y calcula los números de página del índice.
- `imprimir_pdf.mjs` imprime el HTML a PDF con Chrome.
- Los estilos están en `assets/pdf/documento.css` y `assets/pdf/documento-largo.css`.

## Detalles del contenido

- El texto se copia tal cual. Dos excepciones: en la propuesta, los guiones largos se cambiaron por `:` y `-`
  (por ejemplo "2027: FUNDAMENTAR"), y lo mismo en una frase del manual ("enseñanza-aprendizaje").
- En la propuesta, las líneas sueltas que siguen a una frase terminada en ":" se muestran como listas con viñetas.
- En el manual, el índice del Word (escrito a mano, con otra numeración) se reemplazó por uno generado con los títulos reales
  y los números de página nuevos. Los calendarios del MEC y la resolución final son imágenes en el original y siguen siendo imágenes.
- En el reglamento hay errores del Word que se dejaron como están (por ejemplo, "cédula de identidad del padre" aparece dos veces
  en la formalización de la matrícula, donde la segunda debería decir "madre").

## Documentos de documentacion/ (Markdown a PDF)

El mismo diseño sirve para pasar a PDF los documentos de `documentacion/`:

```bash
python3 herramientas/documentos/md_a_pdf.py documentacion/registro-de-admision.md
node herramientas/documentos/imprimir_pdf.mjs documentacion/registro-de-admision.html documentacion/registro-de-admision.pdf
```

Admite títulos, párrafos, listas, tablas, imágenes, bloques de código, `**negrita**` y `` `código` ``. Los enlaces quedan como texto en el PDF.
