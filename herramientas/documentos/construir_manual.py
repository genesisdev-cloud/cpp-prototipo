"""Manual de convivencia: reconstruye el contenido a partir del PDF original y lo escribe como #fuente de paginar.js.
Uso:  python3 herramientas/documentos/construir_manual.py
Requiere: pdftohtml (poppler) y Pillow.  Lee assets/Documentaciones/Normas de convivencias.pdf"""
import re,html,sys,os,subprocess
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
from PIL import Image
RAIZ = Path(__file__).resolve().parents[2]
HERR = Path(__file__).resolve().parent
TMP = HERR/'_tmp'/'manual'                      # archivos temporales (no se suben a git)
FUENTE = RAIZ/'assets/Documentaciones/Normas de convivencias.pdf'
TMP.mkdir(parents=True,exist_ok=True)
# 1) el PDF se convierte a XML con coordenadas, fuentes e imágenes
subprocess.run(['pdftohtml','-xml','-nodrm','-q','-enc','UTF-8',str(FUENTE),str(TMP/'man')],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)

from manual_xml import load

fonts,pages=load(TMP/'man.xml')
REPO=str(RAIZ)+'/'
OUT=REPO+'assets/pdf/manual-convivencia.html'
TITULO='Manual de convivencia'
PITCH=23.7
RIGHT_FULL=735          # una línea que llega a esta x se considera "llena" (el párrafo sigue)
MARCAS={'●','•','▪','■','○','◦','►'}

def esc(s): return html.escape(s,quote=False)

xml=open(TMP/'man.xml',encoding='utf-8').read()
IMGS={}
for pm in re.finditer(r'<page number="(\d+)"[^>]*>(.*?)</page>',xml,re.S):
    for im in re.finditer(r'<image top="(-?\d+)" left="(-?\d+)" width="(\d+)" height="(\d+)" src="([^"]+)"',pm.group(2)):
        t,l,w,h,src=im.groups()
        if int(w)>400 and int(h)>300: IMGS.setdefault(int(pm.group(1)),[]).append(dict(top=int(t),h=int(h),src=src))

def inline(raw):
    s=re.sub(r'<(/?)b>',lambda m:'<'+m.group(1)+'strong>',raw)
    s=re.sub(r'<(/?)i>',lambda m:'<'+m.group(1)+'em>',s)
    s=re.sub(r'<(?!/?(strong|em)>)[^>]+>','',s)
    s=html.unescape(re.sub(r'(?<=>)([^<]*)',lambda m:m.group(1),s))
    # volver a escapar lo que no son nuestras etiquetas
    parts=re.split(r'(</?(?:strong|em)>)',s)
    s=''.join(p if re.fullmatch(r'</?(?:strong|em)>',p) else esc(p) for p in parts)
    s=re.sub(r'\s*[–—]\s*','-',s)
    s=re.sub(r'\s+',' ',s)
    s=re.sub(r'</strong>\s*<strong>',' ',s); s=re.sub(r'</em>\s*<em>',' ',s)
    s=re.sub(r'<(strong|em)>\s*</\1>','',s)
    return s.strip()

def lineas(p):
    its=[i for i in p['items'] if i['text'].strip() and 115<i['top']<1190]
    its.sort(key=lambda i:(i['top'],i['left']))
    grupos=[]
    for it in its:
        if grupos and abs(it['top']-grupos[-1][0]['top'])<=4: grupos[-1].append(it)
        else: grupos.append([it])
    out=[]
    for g in grupos:
        g.sort(key=lambda i:i['left'])
        marca=False; items=g
        if len(g)>1 and g[0]['text'].strip() in MARCAS and g[0]['w']<30:
            marca=True; items=g[1:]; mleft=g[0]['left']
        elif len(g)==1 and g[0]['text'].strip() in MARCAS: continue
        txt_html=''; prev=None
        for it in items:
            if prev is not None and it['left']-(prev['left']+prev['w'])>=2: txt_html+=' '
            txt_html+=it['html']; prev=it
        bold=all(i['bold'] for i in items)
        out.append(dict(top=g[0]['top'],left=items[0]['left'],right=max(i['left']+i['w'] for i in items),
                        size=items[0]['size'],bold=bold,marca=marca,mleft=(mleft if marca else None),
                        html=inline(txt_html),text=re.sub(r'<[^>]+>','',inline(txt_html)),page=p['n']))
    return out

def es_mayus(t):
    letras=[c for c in t if c.isalpha()]
    return len(letras)>=3 and sum(c.isupper() for c in letras)/len(letras)>=0.85

# ---------- secuencia de elementos: líneas e imágenes, en orden de lectura ----------
elems=[]
for p in pages[4:32]:               # páginas 5 a 32 (la 33 es la resolución escaneada)
    for ln in lineas(p):
        if p['n']==12 and 150<ln['top']<870: continue          # filas de la tabla del calendario institucional
        elems.append(('l',p['n'],ln['top'],ln))
    if p['n']==12: elems.append(('t',12,155,None))
    for im in IMGS.get(p['n'],[]): elems.append(('i',p['n'],im['top'],im))
elems.sort(key=lambda e:(e[1],e[2]))

# ---------- tabla de la página 12 (Calendario Institucional) ----------
def tabla_calendario():
    p=pages[11]; its=[i for i in p['items'] if i['text'].strip() and 150<i['top']<870]
    its.sort(key=lambda i:(i['top'],i['left']))
    grupos=[]
    for it in its:
        if grupos and abs(it['top']-grupos[-1][0]['top'])<=4: grupos[-1].append(it)
        else: grupos.append([it])
    filas=[]; mes=None
    for g in grupos:
        g.sort(key=lambda i:i['left'])
        if g[0]['text'].strip() in ('Mes','Actividad'): continue
        m=None; act=[]
        for it in g:
            if it['left']+it['w']<=300: m=it['text'].strip()
            else: act.append(it['text'].strip())
        if m: mes=m; filas.append([m,' '.join(act)])
        else: filas.append([None,' '.join(act)])
    html_f=[]; i=0
    while i<len(filas):
        m,a=filas[i]; n=1
        while i+n<len(filas) and filas[i+n][0] is None: n+=1
        for k in range(n):
            tds=''
            if k==0: tds+=f'<td rowspan="{n}"><strong>{esc(m)}</strong></td>'
            tds+=f'<td>{esc(filas[i+k][1])}</td>'
            html_f.append(f'<tr>{tds}</tr>')
        i+=n
    return '<table class="cal"><thead><tr><th>Mes</th><th>Actividad</th></tr></thead><tbody>'+''.join(html_f)+'</tbody></table>', sum(len(f[1].split())+0 for f in filas), len(filas)

# ---------- imágenes del manual ----------
def guardar_imagen(src,nombre,maxw=1500):
    im=Image.open(TMP/src).convert('RGB')
    im.thumbnail((maxw,maxw),Image.LANCZOS)
    os.makedirs(REPO+'assets/img/documentos',exist_ok=True)
    destino=REPO+'assets/img/documentos/'+nombre
    im.save(destino,'JPEG',quality=84,optimize=True,progressive=True)
    return '../img/documentos/'+nombre,im.size,os.path.getsize(destino)//1024
NOMBRES={(9,0):('manual-organigrama.jpg','Organigrama de la institución en su organización y gestión'),
         (11,0):('manual-calendario-mec-1.jpg','Calendario Escolar MEC, cronograma de actividades (1.ª parte)'),
         (11,1):('manual-calendario-mec-2.jpg','Calendario Escolar MEC, cronograma de actividades (2.ª parte)')}

# ---------- armado de bloques ----------
bloques=[]       # (tipo, html, extra)
estado=dict(par=None,prev=None)
def cerrar_par():
    if estado['par'] is not None:
        t,partes,extra=estado['par']
        h=' '.join(partes)
        h=re.sub(r'</strong>\s*<strong>',' ',h); h=re.sub(r'</em>\s*<em>',' ',h); h=re.sub(r'\s+',' ',h).strip()
        bloques.append((t,h,extra)); estado['par']=None
heads=[]
primer_cap=False
def nuevo_par(tipo,ln,extra=None):
    cerrar_par(); estado['par']=(tipo,[ln['html']],extra or {})
def seguir_par(ln): estado['par'][1].append(ln['html'])

img_idx={}
for tipo,pn,top,e in elems:
    if tipo=='t':
        cerrar_par(); tabla,_,_=tabla_calendario(); bloques.append(('tabla',tabla,{})); estado['prev']=None; continue
    if tipo=='i':
        cerrar_par(); k=img_idx.get(pn,0); img_idx[pn]=k+1
        nom,alt=NOMBRES[(pn,k)]
        ruta,tam,kb=guardar_imagen(e['src'],nom)
        bloques.append(('fig',f'<figure><img src="{ruta}" alt="{esc(alt)}"></figure>',{})); estado['prev']=None
        continue
    ln=e; prev=estado['prev']; gap=(ln['top']-prev['top']) if prev and prev['page']==ln['page'] else None
    texto=ln['text']
    # 1) viñetas
    if ln['marca']:
        cerrar_par()
        nivel=2 if ln['mleft']>=175 else 1
        estado['par']=('li',[ln['html']],dict(nivel=nivel))
        estado['prev']=ln; continue
    # 2) títulos
    caps=es_mayus(texto) or re.match(r'^CAP[IÍ]TULO\b',texto) or (ln['bold'] and ln['right']<RIGHT_FULL and len(texto)<=60 and re.match(r'^[A-ZÁÉÍÓÚÑ ]{4,}:',texto.strip()))
    if ln['bold'] and (caps or ln['size']>=21):
        es_cap=bool(re.match(r'^CAP[IÍ]TULO\b',texto))
        # los títulos de varias líneas se unen
        if estado['par'] and estado['par'][0]=='h' and gap is not None and gap<=PITCH*1.6 and not es_cap and not re.match(r'^CAP[IÍ]TULO\b',estado['par'][1][0]):
            seguir_par(ln); estado['prev']=ln; continue
        if estado['par'] and estado['par'][0]=='cap' and len(estado['par'][1])==1 and gap is not None and gap<=PITCH*2.2 and not es_cap:
            seguir_par(ln); estado['prev']=ln; continue
        cerrar_par()
        estado['par']=('cap' if es_cap else 'h',[ln['html']],dict(centrado=(ln['left']>250)))
        estado['prev']=ln; continue
    # 3) texto corrido
    par=estado['par']
    if par is not None and par[0]=='li':
        # continuación de la viñeta (sangría) si no hay hueco grande
        if gap is not None and gap<=PITCH*1.5 and ln['left']>=prev['left']-3 or (gap is not None and gap<=PITCH*1.5 and prev['right']>=RIGHT_FULL):
            seguir_par(ln); estado['prev']=ln; continue
        cerrar_par()
    elif par is not None and par[0] in ('p','sub'):
        misma_pagina=prev is not None
        continuar=(gap is not None and gap<=PITCH*1.5 and prev['right']>=RIGHT_FULL) or (gap is None and prev is not None and prev['right']>=RIGHT_FULL and abs(ln['left']-prev['left'])<=8 and ln['top']<200)
        if continuar:
            seguir_par(ln); estado['prev']=ln; continue
        cerrar_par()
    elif par is not None:
        cerrar_par()
    # párrafo o subtítulo en negrita
    if ln['bold'] and ln['size']>=18 and len(texto)<=95 and ln['right']<RIGHT_FULL:
        estado['par']=('sub',[ln['html']],dict(centrado=(ln['left']>250)))
    else:
        estado['par']=('p',[ln['html']],{})
    estado['prev']=ln
cerrar_par()

# ---------- a HTML ----------
def hid(prefix,i): return f'{prefix}{i}'
out=[]; n=0; ul_nivel=0
def abrir_cerrar_listas(nivel_actual):
    pass
i=0; cont_h=0; viñetas=[]
def emitir_lista(items):
    # items: lista de (nivel,html); agrupa subniveles
    res=[]; abierto=0
    for nivel,h in items:
        if nivel==1:
            if abierto>=1: res.append('</li>' if abierto==1 else '</li></ul></li>')
            res.append(f'<li>{h}'); abierto=1
        else:
            if abierto==1: res.append('<ul>'); abierto=2
            elif abierto==2: res.append('</li>')
            if abierto==0: res.append('<li>'); abierto=1
            res.append(f'<li>{h}'); abierto=2
    if abierto==2: res.append('</li></ul></li>')
    elif abierto==1: res.append('</li>')
    return '<ul>'+''.join(res)+'</ul>'

html_blocks=[]; j=0; primer_titulo=True; cap_abierto=False
while j<len(bloques):
    t,h,ex=bloques[j]
    if t=='li':
        its=[]
        while j<len(bloques) and bloques[j][0]=='li':
            its.append((bloques[j][2]['nivel'],bloques[j][1])); j+=1
        html_blocks.append(emitir_lista(its)); continue
    if t=='cap':
        cont_h+=1; hid_=f'cap{cont_h}'
        m=re.match(r'^(CAP[IÍ]TULO\s+[IVXL]+\.?)\s*(.*)$',re.sub(r'<[^>]+>','',h))
        # el título del capítulo puede venir en las líneas siguientes (se unieron) o ya estar en el mismo bloque
        num=m.group(1).rstrip('.') ; resto=m.group(2)
        html_blocks.append(f'<h2 id="{hid_}"><span class="n">{esc(num)}</span>{esc(resto) if resto else ""}</h2>')
        cap_abierto=True
    elif t=='h':
        cont_h+=1; hid_=f'h{cont_h}'
        txt=re.sub(r'<[^>]+>','',h)
        if primer_titulo and re.match(r'^PRESENTACI',txt): lvl='h2'
        else: lvl='h3'
        primer_titulo=False
        html_blocks.append(f'<{lvl} id="{hid_}">{esc(txt)}</{lvl}>')
    elif t=='sub':
        html_blocks.append(f'<h5 class="sub">{h}</h5>')
    elif t in ('fig','tabla'):
        html_blocks.append(h)
    else:
        html_blocks.append(f'<p>{h}</p>')
    j+=1


# ---- resolución escaneada (última página del original) ----
ruta,tam,kb=guardar_imagen('man-33_4.jpg','manual-resolucion.jpg',maxw=1800)
html_blocks.append(f'<figure data-nueva class="resolucion"><img src="{ruta}" alt="Resolución que aprueba las Normas de Convivencia del Colegio Presbiteriano del Paraguay"></figure>')
cuerpo='\n'.join(h.replace(' </h','</h') for h in html_blocks)
doc=f'''<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Manual de convivencia | Colegio Presbiteriano del Paraguay</title>
<link href="https://fonts.googleapis.com/css2?family=Bitter:ital,wght@0,400;0,700;1,400&family=Questrial&display=swap" rel="stylesheet">
<link rel="stylesheet" href="documento.css">
<link rel="stylesheet" href="documento-largo.css">
</head>
<body data-titulo="{TITULO}" data-niveles-indice="2,3">
<!-- Contenido reconstruido a partir de "Normas de convivencias.pdf" (vigencia 2024-2029). paginar.js arma las hojas A4. -->
<div id="fuente">
<header class="doc-titulo"><div class="eyebrow">Colegio Presbiteriano del Paraguay</div><h1>{TITULO}</h1><div class="sub">“Consolidando Juntos” · Luque, Paraguay · Vigencia 2024-2029</div></header>
<div class="contenido-h">Contenido</div>
<nav class="toc"></nav>
<div class="salto"></div>
{cuerpo}
</div>
<script src="paginar.js"></script>
</body>
</html>
'''
open(OUT,'w',encoding='utf-8').write(doc)
print('escrito',OUT,len(doc)//1024,'KB')
print('bloques:',len(html_blocks),'| capítulos:',sum(1 for b in html_blocks if b.startswith('<h2 id="cap')),'| títulos:',sum(1 for b in html_blocks if b.startswith('<h3')),'| subtítulos:',sum(1 for b in html_blocks if b.startswith('<h5')),'| listas:',sum(1 for b in html_blocks if b.startswith('<ul>')),'| párrafos:',sum(1 for b in html_blocks if b.startswith('<p>')))
