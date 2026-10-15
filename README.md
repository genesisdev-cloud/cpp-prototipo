# Colegio Presbiteriano del Paraguay: sitio nuevo

Prototipo del nuevo sitio del colegio (HTML, CSS y JavaScript), réplica del diseño de Canva aprobado por la dirección. El sitio actual (colegiocpp.com) usa WordPress con el tema Enfold.

## Ver el sitio en línea

https://genesisdev-cloud.github.io/cpp-prototipo/

Es una versión de prueba: las fotos y los documentos todavía no están cargados, el formulario no envía datos y el sitio no está indexado por buscadores (`robots.txt`).

## Ver el sitio en tu computadora

```bash
python3 -m http.server 8765
```

Abrir <http://localhost:8765/prototipo/canva/index.html>

## Qué hay en cada carpeta

| Carpeta | Contenido |
|---|---|
| `prototipo/canva/` | El sitio: una página larga con seis secciones (ver su `LEEME.md`, con la lista de fotos y documentos por cargar) |
| `assets/img/` | Fotos del colegio, ya optimizadas, ordenadas por sección |
| `assets/logo/` | Escudo (normal, en alta resolución y blanco), piezas del escudo animado, logos oficiales y de ISO |
| `assets/pdf/` | PDF del colegio con membrete (requisitos, ficha médica, propuesta educativa, manual de convivencia) y su HTML |
| `herramientas/documentos/` | Convierte documentos largos a PDF con el diseño del colegio (ver su `LEEME.md`) |
| `herramientas/logo/` | Arma la versión blanca del escudo (y sus piezas animadas) desde las piezas a color |
| `firmas/` | Firma de correo del Departamento de Admisiones (HTML y PNG) |

## Tipografías y colores

Montserrat (todo el texto) y Londrina Solid (el título "#Vení ALCPP"), desde Google Fonts. Verde `#004C23`, blanco hueso `#FCFDF9` y gris azulado `#C8D1D9` para los recuadros de fotos.

## Lo que no se sube a este repositorio

La documentación técnica interna del colegio (contiene contraseñas), las fotos originales descargadas del sitio actual y el material de trabajo. Están en `.gitignore`.

El diseño anterior (13 páginas en cuatro idiomas y sus plugins de WordPress) se quitó del proyecto el 14 de octubre de 2026. Sigue disponible en el historial de git (commit `c168bbc`).
