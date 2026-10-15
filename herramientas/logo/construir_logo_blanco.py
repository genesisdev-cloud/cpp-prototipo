"""Arma la versión blanca del escudo (para fondos verdes) a partir de las piezas a color de assets/logo/piezas/.
Cada pieza se pasa a blanco conservando su detalle y las que van encima de otras dejan un pequeño borde oscuro
(transparente) alrededor, como en el logo del diseño de Canva. Salida:
  assets/logo/piezas-blancas/*.png   las cinco piezas, con el mismo recuadro que las originales (para la animación)
  assets/logo/escudo-blanco.png      el escudo armado, recortado
Uso:  python3 herramientas/logo/construir_logo_blanco.py"""
import numpy as np
from pathlib import Path
from PIL import Image, ImageFilter

RAIZ = Path(__file__).resolve().parents[2]
PIEZAS = RAIZ / 'assets/logo/piezas'
SALIDA = RAIZ / 'assets/logo/piezas-blancas'
S = 3                                   # escala de trabajo: 345 x 400 por 3
W, H = 345 * S, 400 * S
# orden de abajo hacia arriba y posición en % dentro del recuadro de 345 x 400 (igual que en la página)
ORDEN = [('globo', 14.2, 12.75, 71.3), ('libro', 21.45, 69.5, 55.94), ('figura', 13.33, 28.25, 73.33),
         ('texto', 3.48, 3.25, 92.17), ('paloma', 51.3, 11.5, 23.48)]
HALO = {'figura': 8, 'paloma': 9, 'texto': 6, 'libro': 0, 'globo': 0}      # grosor del borde que deja cada pieza (px a escala 3)

def suave(x, a, b):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)

def en_lienzo(nombre, izq, arr, ancho):
    im = Image.open(PIEZAS / f'{nombre}.png').convert('RGBA')
    w = round(ancho / 100 * W); h = round(w * im.height / im.width)
    im = im.resize((w, h), Image.LANCZOS)
    x, y = round(izq / 100 * W), round(arr / 100 * H)
    lienzo = Image.new('RGBA', (W, H), (0, 0, 0, 0)); lienzo.paste(im, (x, y))
    return np.asarray(lienzo).astype(float), (x, y, w, h)

piezas = {}
for nombre, izq, arr, ancho in ORDEN:
    a, caja = en_lienzo(nombre, izq, arr, ancho)
    r, g, b, al = a[..., 0], a[..., 1], a[..., 2], a[..., 3]
    lum = 0.299 * r + 0.587 * g + 0.114 * b
    if nombre == 'globo':
        tinta = al * suave(r, 70, 190)               # amarillo (aro y continentes) a blanco; el océano verde queda vacío
    elif nombre == 'libro':
        tinta = al * suave(255 - lum, 55, 190)       # el libro queda dibujado por sus líneas, como en el logo de Canva
    else:
        tinta = al                                   # figura, texto y paloma: silueta blanca
    piezas[nombre] = {'tinta': tinta, 'silueta': al, 'caja': caja}

# bordes oscuros: cada pieza recorta a las que tiene debajo
for i, (nombre, *_r) in enumerate(ORDEN):
    for j in range(i):
        debajo = ORDEN[j][0]
        borde = HALO[nombre]
        if borde:
            m = Image.fromarray(np.clip(piezas[nombre]['silueta'], 0, 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(2 * borde + 1))
            m = np.asarray(m.filter(ImageFilter.GaussianBlur(1.2))).astype(float) / 255
            piezas[debajo]['tinta'] = piezas[debajo]['tinta'] * (1 - m)

SALIDA.mkdir(exist_ok=True)
compuesto = Image.new('RGBA', (W, H), (0, 0, 0, 0))
for nombre, *_r in ORDEN:
    p = piezas[nombre]; x, y, w, h = p['caja']
    rgba = np.zeros((H, W, 4), dtype=np.uint8); rgba[..., :3] = 255; rgba[..., 3] = np.clip(p['tinta'], 0, 255).astype(np.uint8)
    capa = Image.fromarray(rgba, 'RGBA')
    compuesto = Image.alpha_composite(compuesto, capa)
    capa.crop((x, y, x + w, y + h)).save(SALIDA / f'{nombre}.png', optimize=True)
caja = compuesto.getbbox()
esc = compuesto.crop(caja)
h = 640; esc = esc.resize((round(esc.width * h / esc.height), h), Image.LANCZOS)
esc.save(RAIZ / 'assets/logo/escudo-blanco.png', optimize=True)
print('piezas y escudo listos', esc.size)
