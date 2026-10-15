# Sitio nuevo (réplica del diseño de Canva)

Una sola página larga con cinco secciones, igual al diseño de Canva que aprobó la dirección. Reemplaza al diseño anterior, que se quitó del proyecto el 14 de octubre de 2026 (sigue en el historial de git, commit `c168bbc`).

Abrir: <http://localhost:8765/prototipo/canva/index.html> (con `python3 .claude/dev-server.py`).

## Cómo está armado

- `index.html` contiene todo el contenido. Cada elemento lleva sus medidas del diseño en el atributo `style` (`--x`, `--y`, `--w`, `--fs`, `--lh`, en unidades del diseño de 1024 de ancho).
- `styles.css`: desde 1000 px de ancho la página escala el diseño al ancho de la pantalla (hasta 2560 px) y queda igual al de Canva. Por debajo de 1000 px pasa a un orden vertical pensado para tablet y celular.
- `app.js`: menú del celular, aviso para los documentos que todavía no están cargados y repetición del efecto del logo.
- Logo del encabezado: se arma por piezas al cargar la página (globo, libro, figura, texto y paloma, igual que en el diseño anterior) y se repite al tocarlo. Las piezas blancas están en `assets/logo/piezas-blancas/` y se generan desde las piezas a color con `herramientas/logo/construir_logo_blanco.py` (también arma `assets/logo/escudo-blanco.png`).
- Tipografías: Montserrat (la misma del diseño) y Londrina Solid para "#Vení ALCPP". La letra original de ese título ("Balmy") es de Canva y no se puede usar fuera de ahí; Londrina Solid es la más parecida de las gratuitas.

## Para completar cuando lleguen las fotos y los documentos

Fotos: cada recuadro gris tiene un atributo `data-foto-pendiente`. Para cargar una foto, se agrega dentro del recuadro `<img src="..." alt="...">`: la imagen ocupa todo el recuadro y el texto del marcador desaparece solo.

| Marcador | Dónde |
|---|---|
| `hero` | Foto de portada (hoy hay una de prueba; la del diseño es de dos alumnos con campera azul y debe llevar el velo verde incluido) |
| `fundadores` | Foto en blanco y negro de Historia (Adelina, Pastor, docentes, autoridades, egresados) |
| `nivel-inicial`, `nivel-escolar-basica`, `nivel-medio` | Fotos de los tres niveles |
| `foto-1` a `foto-4` | Fila de 4 fotos |

Documentos: los enlaces con `data-doc-pendiente` todavía no tienen archivo. Para activarlos se cambia `href="#"` por la ruta del PDF y se borra ese atributo.

| Marcador | Documento |
|---|---|
| `propuesta-inicial`, `propuesta-escolar-basica`, `propuesta-medio` | "Descargar propuesta" de cada nivel |
| `arancel` | Arancel 2027 |
| `reglamento-admision` | Reglamento de admisión |
| `temario-evaluacion` | Temario de evaluación |

Textos por completar: Misión y Visión (`data-pendiente="mision"` y `"vision"`) y los recuadros de Formulario y de Noticias. La Lista de útiles y el texto del Proceso de admisión se quitaron por ahora.

Botón "Completar formulario": por ahora solo muestra un aviso. Se conecta al formulario de postulación cuando esté listo el servidor.
