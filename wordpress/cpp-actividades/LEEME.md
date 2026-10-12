# CPP Actividades (tarjetas que se expanden)

Plugin de WordPress que muestra las actividades complementarias del colegio (idiomas, deportes, arte, ciencia y otras) en tarjetas con foto. Al tocar una tarjeta, la foto crece al centro de la pantalla y muestra el título y el texto. Se cierra con la X, con Escape o tocando fuera.

No usa React, Tailwind ni librerías externas: solo PHP, CSS y JavaScript.

## Instalación

1. Subir `cpp-actividades.zip` en Plugins > Añadir nuevo > Subir plugin, e instalar y activar.
2. En la página, pegar el shortcode:

```
[cpp_actividades]
```

## Opciones (todas opcionales)

| Atributo | Qué hace |
|---|---|
| `ids="12,34,56,78,90"` | Usa fotos de la Biblioteca de medios (IDs, en el orden de las tarjetas) |
| `alto="300"` | Alto de cada fila de tarjetas en escritorio (px) |

## Textos y traducciones

Los textos de las tarjetas están en la función `cpp_actividades_datos()` envueltos en `__()`, así que Polylang, WPML o Loco Translate los pueden traducir al inglés y al coreano. También se pueden cambiar desde el tema con el filtro `cpp_actividades_datos`.

## Colores y tipografía

```css
.lg {
  --lg-tinta: #153F24;                  /* color del título del texto sin JavaScript */
  --lg-acento: #C99A2E;                 /* anillo de foco con teclado */
  --lg-fuente-titulo: 'Questrial', sans-serif;
  --lg-fuente-texto: 'Bitter', serif;
}
```

## Notas

- Sin JavaScript, cada tarjeta muestra su texto debajo de la foto.
- Con "reducir movimiento" activado, la ventana aparece sin animación.
- Se puede usar el mismo shortcode varias veces en la misma página.
