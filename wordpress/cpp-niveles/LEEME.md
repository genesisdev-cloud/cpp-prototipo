# CPP Niveles (carrusel curvo)

Plugin de WordPress para mostrar los niveles del colegio (Nivel Inicial, Educación Escolar Básica y Educación Media) en un carrusel curvo de imágenes. Cada imagen lleva el nombre de su nivel debajo y debajo del carrusel queda el texto de cada nivel.

No usa React, Tailwind ni librerías externas: solo PHP, CSS y JavaScript.

## Instalación

1. Comprimir la carpeta `cpp-niveles` en un `.zip` (ya viene uno hecho: `cpp-niveles.zip`).
2. En WordPress: Plugins > Añadir nuevo > Subir plugin > elegir el `.zip` > Instalar > Activar.
3. En la página (por ejemplo "Oferta formativa"), pegar el shortcode en un bloque de texto o de código de Enfold:

```
[cpp_niveles]
```

## Opciones del shortcode (todas opcionales)

| Atributo | Qué hace | Por defecto |
|---|---|---|
| `ids="12,34,56"` | Usa fotos de la Biblioteca de medios (IDs, en el orden Inicial, Básica, Media) | fotos del plugin |
| `altura="560"` | Alto del carrusel en escritorio (px) | 560 |
| `altura_movil="340"` | Alto en celular (px) | 340 |
| `velocidad="4"` | Segundos que tarda en avanzar un tile | 4 |
| `curvatura="80"` | Cuánto se curvan los extremos (5 a 85) | 80 |

Ejemplo: `[cpp_niveles ids="101,102,103" altura="600"]`

## Colores y tipografía

Se cambian con variables CSS (en el CSS del tema o en "CSS adicional"):

```css
.tgh {
  --tgh-tinta: #153F24;      /* color del nombre del nivel */
  --tgh-acento: #C99A2E;     /* línea dorada del texto inferior */
  --tgh-fondo-tile: #EDE8DA; /* fondo mientras carga la imagen */
  --tgh-fuente: 'Questrial', sans-serif;
}
```

## Cambiar niveles o textos

Desde `functions.php` del tema hijo, con el filtro `cpp_niveles_datos`, que recibe y devuelve la lista de niveles (nombre, imagen, texto alternativo y líneas de texto). Ver la función `cpp_niveles_datos()` en `cpp-niveles.php`.

## Notas

- Con "reducir movimiento" activado en el dispositivo, el carrusel queda quieto.
- La animación se pausa cuando el carrusel no está a la vista.
- Si el navegador no ejecuta JavaScript, igual se ve el texto de cada nivel.
- Si WP Fastest Cache o Cloudflare minifican el JavaScript, vaciar la caché después de instalar.
