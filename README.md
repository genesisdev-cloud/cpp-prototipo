# Colegio Presbiteriano del Paraguay: rediseño del sitio

Prototipo del nuevo sitio del colegio (HTML, CSS y JavaScript), con los plugins de WordPress para llevarlo a producción. El sitio actual (colegiocpp.com) usa WordPress con el tema Enfold.

## Ver el sitio en línea

https://genesisdev-cloud.github.io/cpp-prototipo/

Es una versión de prueba: el formulario no envía datos y el sitio no está indexado por buscadores (`robots.txt`).

## Ver el sitio en tu computadora

```bash
python3 -m http.server 8765
```

Abrir <http://localhost:8765/prototipo/oscuro/index.html>

## Qué hay en cada carpeta

| Carpeta | Contenido |
|---|---|
| `prototipo/oscuro/` | El sitio: 12 páginas, `styles.css`, `nav.js` y el sistema de idiomas (`i18n/`) |
| `wordpress/` | Plugins de WordPress: `cpp-niveles` (carrusel curvo) y `cpp-actividades` (tarjetas que se expanden) |
| `assets/img/` | Fotos del sitio, ya optimizadas, ordenadas por sección |
| `assets/logo/` | Escudo (versión normal y en alta resolución), piezas del escudo animado, logos ISO y UNE |
| `assets/pdf/` | PDF de requisitos de admisión y membrete, en español, inglés y coreano (más su HTML) |

## Páginas

Inicio, Admisión, Oferta formativa, Institucional (Quiénes somos, El colegio, Nuestra historia, Nuestro emblema, Instalaciones, Capellanía, Dirección y personal), Comunicados y Blog, y Contacto.

## Idiomas

Español, inglés y coreano, con un selector en el encabezado. Cómo funciona y cómo corregir traducciones: `prototipo/oscuro/i18n/LEEME.md`. Las traducciones son un borrador y conviene que las revise una persona de habla nativa.

## Plugins de WordPress

Cada plugin tiene su `LEEME.md` con la instalación y las opciones. Para armar el `.zip`:

```bash
cd wordpress
zip -r cpp-niveles.zip cpp-niveles
zip -r cpp-actividades.zip cpp-actividades
```

Uso en las páginas: `[cpp_niveles]` y `[cpp_actividades]`.

## Tipografías

Questrial (títulos y menú), EB Garamond (encabezados de sección), Bitter (texto y formularios, alternativa libre a Prachamati), Unbounded (algunos títulos) y Noto Sans/Serif KR (coreano). Todas libres, desde Google Fonts.

## Colores

Verde oscuro `#153F24`, verde `#1E5631`, dorado `#C99A2E`, blanco hueso `#F6F2E8`, beige `#EDE8DA`.

## Estado

Prototipo avanzado (cerca del 90 %). Pendiente: contenido definitivo de algunas secciones (horarios, ficha médica, personal), revisión de las traducciones, páginas legales y pasar todo al tema de WordPress.

## Lo que no se sube a este repositorio

La documentación técnica interna del colegio (contiene contraseñas), las fotos originales descargadas del sitio actual y los prototipos anteriores. Están en `.gitignore`.
