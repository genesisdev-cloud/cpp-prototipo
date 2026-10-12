# Idiomas del sitio: español, inglés y coreano

El sitio se escribe en español (idioma base). Un selector en el encabezado (ES, EN, 한국어) cambia todos los textos. La elección se recuerda en el navegador y también se puede forzar con `?lang=en` o `?lang=ko`.

## Archivos

| Archivo | Para qué sirve |
|---|---|
| `i18n.js` | Motor: arma el selector, cambia los textos, los atributos (placeholder, alt, aria-label), el título de la pestaña y los enlaces a los PDF |
| `translations.js` | Diccionario: cada texto en español con su traducción al inglés y al coreano |

## Cómo agregar o corregir una traducción

En `translations.js`, cada línea es `"texto en español": "traducción"`. Para corregir una traducción, se cambia el texto de la derecha. Para un texto nuevo del sitio, se copia el texto en español tal como está en la página y se le agrega su traducción en `en` y en `ko`.

Para ver qué textos faltan traducir, abrir cualquier página con `?lang=en&i18n=debug` y mirar la consola del navegador.

## PDF por idioma

Los enlaces a `assets/pdf/requisitos-*.pdf` cambian solos según el idioma: `-en.pdf` para inglés y `-ko.pdf` para coreano. Los tres PDF de cada documento deben existir.

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

Los textos que genera el servidor al enviar el formulario de admisión (el PDF que recibe el equipo) quedan en español, porque lo lee el personal del colegio.
