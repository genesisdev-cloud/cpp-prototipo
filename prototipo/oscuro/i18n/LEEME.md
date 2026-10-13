# Idiomas del sitio: español, inglés, coreano y portugués

El sitio se escribe en español (idioma base). Un selector en el encabezado (ES, EN, 한국어, PT) cambia todos los textos. La elección se recuerda en el navegador y también se puede forzar con `?lang=en`, `?lang=ko` o `?lang=pt`.

## Archivos

| Archivo | Para qué sirve |
|---|---|
| `i18n.js` | Motor: arma el selector, cambia los textos, los atributos (placeholder, alt, aria-label), el título de la pestaña y los enlaces a los PDF |
| `translations.js` | Diccionario: cada texto en español con su traducción al inglés, al coreano y al portugués |

## Cómo agregar o corregir una traducción

En `translations.js`, cada línea es `"texto en español": "traducción"`. Para corregir una traducción, se cambia el texto de la derecha. Para un texto nuevo del sitio, se copia el texto en español tal como está en la página y se le agrega su traducción en `en`, en `ko` y en `pt`.

Para ver qué textos faltan traducir, abrir cualquier página con `?lang=en&i18n=debug` y mirar la consola del navegador.

## PDF por idioma

Los enlaces a `assets/pdf/requisitos-*.pdf` cambian solos según el idioma: `-en.pdf` para inglés, `-ko.pdf` para coreano y `-pt.pdf` para portugués. Los cuatro PDF de cada documento deben existir (se generan desde los `.html` de `assets/pdf/`).

## Tipografías

El coreano usa Noto Sans KR y Noto Serif KR (Google Fonts), que solo se descargan cuando se elige coreano.

## Pasar a WordPress

Este motor sirve para el prototipo. En WordPress lo recomendable es un plugin de idiomas:

1. **Polylang** (gratis) o **WPML** (de pago): una página por idioma, menú por idioma, selector de idioma y etiquetas `hreflang` para Google.
2. Los textos de este diccionario se cargan como cadenas de traducción (o se usan como base para traducir cada página).
3. Los plugins propios (`cpp-niveles` y `cpp-actividades`) ya envuelven sus textos en `__()`, así que Polylang, WPML o Loco Translate los pueden traducir.
4. Las tipografías coreanas se cargan igual que en el prototipo.

## Importante

Las traducciones son un borrador. Conviene que las revise una persona de habla nativa (sobre todo el coreano: nombre del colegio, nombres de los niveles y textos religiosos).

El portugués está escrito en la variante de Brasil (trato de "você") y mantiene los nombres de los niveles del sistema paraguayo (Nível Inicial, Educação Escolar Básica, Educação Média, Pre-Jardín, Jardín, Pre-Escolar).

Los textos que genera el servidor al enviar el formulario de admisión (el PDF que recibe el equipo) quedan en español, porque lo lee el personal del colegio.
