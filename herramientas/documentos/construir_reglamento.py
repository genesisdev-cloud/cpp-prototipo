import sys,re,html,zipfile,io
from pathlib import Path
RAIZ = Path(__file__).resolve().parents[2]           # carpeta principal del proyecto
HERR = Path(__file__).resolve().parent
sys.path.insert(0,str(HERR))
from docx_bloques import extract
from PIL import Image

SRC=str(RAIZ/'assets/Documentaciones/REGLAMENTO DE ADMISION 09-10-2026.docx')
OUT=str(RAIZ/'assets/pdf/reglamento-admision.html')
TITULO='Reglamento de admisión'
HEAD_NUMID={'15'}               # numeración de los títulos
IMG_MAP={'media/image1.jpeg':('../img/documentos/reglamento-hitos-desarrollo.jpg','Hitos clave en el desarrollo infantil')}

def esc(s): return html.escape(s,quote=False)
def fmt_runs(runs,bold_ok=True):
    out=[]; cur=None; buf=''
    def flush():
        nonlocal buf,cur
        if buf=='' : return
        t=esc(buf)
        b,i,u=cur
        if u: t='<u>'+t+'</u>'
        if i: t='<em>'+t+'</em>'
        if b and bold_ok: t='<strong>'+t+'</strong>'
        out.append(t); buf=''
    for txt,b,i,u in runs:
        if txt.startswith('\x00IMG'): continue
        txt=txt.replace('\t',' ').replace('\f','')
        parts=txt.split('\n')
        for k,pt in enumerate(parts):
            key=(b,i,u)
            if cur!=key: flush(); cur=key
            buf+=pt
            if k<len(parts)-1:
                flush(); out.append('<br>')
    flush()
    s=''.join(out)
    s=re.sub(r'</strong>(\s*)<strong>',r'\1',s); s=re.sub(r'</em>(\s*)<em>',r'\1',s)
    return s.strip()
def slug(label): return 'sec-'+re.sub(r'[^0-9]+','-',label).strip('-')

blocks,z=extract(SRC)
# la imagen del Word se guarda optimizada en assets/img/documentos
(RAIZ/'assets/img/documentos').mkdir(parents=True,exist_ok=True)
_im=Image.open(io.BytesIO(z.read('word/media/image1.jpeg'))).convert('RGB'); _im.thumbnail((1200,1200),Image.LANCZOS)
_im.save(RAIZ/'assets/img/documentos/reglamento-hitos-desarrollo.jpg','JPEG',quality=84,optimize=True,progressive=True)
out=[]; ul_open=None; pending_page=False
def cerrar_ul():
    global ul_open
    if ul_open is not None: out.append('</ul>'); ul_open=None
heads=[]
for b in blocks:
    sname=(b['sname'] or '')
    low=sname.lower()
    if low.startswith('toc') : continue
    t=b['text']; ts=t.replace('\f','').strip()
    if '\f' in t and not ts:
        cerrar_ul(); pending_page=True; continue
    imgs=[r[0][5:] for r in b['runs'] if r[0].startswith('\x00IMG:')]
    if imgs:
        cerrar_ul()
        for im in imgs:
            src,alt=IMG_MAP[im]
            out.append(f'<figure><img src="{src}" alt="{esc(alt)}"></figure>')
        continue
    if not ts: continue
    if b['numId'] in HEAD_NUMID and b['label'] and b['label']!='•':
        cerrar_ul()
        lvl=b['lvl']; tag='h'+str(min(lvl+2,5))
        if pending_page and lvl<=1: out.append('<div class="salto"></div>')
        pending_page=False
        hid=slug(b['label']) if lvl<=2 else ''
        label=esc(b['label'])
        out.append(f'<{tag}{" id=%s"%chr(34)+hid+chr(34) if hid else ""}><span class="n">{label}</span>{fmt_runs(b["runs"],False)}</{tag}>')
        continue
    if pending_page: out.append('<div class="salto"></div>'); pending_page=False
    if b['label']=='•':
        if ul_open!=b['numId']:
            cerrar_ul(); out.append('<ul>'); ul_open=b['numId']
        out.append(f'<li>{fmt_runs(b["runs"])}</li>')
        continue
    cerrar_ul()
    bolds=[r for r in b['runs'] if r[0].strip()]
    if bolds and all(r[1] for r in bolds) and len(ts)<90 and not ts.endswith('.'):
        out.append(f'<h5 class="sub">{fmt_runs(b["runs"],False)}</h5>')
    else:
        out.append(f'<p>{fmt_runs(b["runs"])}</p>')
cerrar_ul()

cuerpo='\n'.join(out)
doc=f'''<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>{TITULO} | Colegio Presbiteriano del Paraguay</title>
<link href="https://fonts.googleapis.com/css2?family=Bitter:ital,wght@0,400;0,700;1,400&family=Questrial&display=swap" rel="stylesheet">
<link rel="stylesheet" href="documento.css">
<link rel="stylesheet" href="documento-largo.css">
</head>
<body data-titulo="{TITULO}" data-niveles-indice="2,3,4">
<!-- Contenido generado a partir de "REGLAMENTO DE ADMISION 09-10-2026.docx". paginar.js arma las hojas A4. -->
<div id="fuente">
<header class="doc-titulo"><div class="eyebrow">Colegio Presbiteriano del Paraguay</div><h1>{TITULO}</h1></div>
<div class="contenido-h">Contenido</div>
<nav class="toc"></nav>
<div class="salto"></div>
{cuerpo}
</div>
<script src="paginar.js"></script>
</body>
</html>
'''
doc=doc.replace('</h1></div>','</h1></header>',1)
open(OUT,'w',encoding='utf-8').write(doc)
print('bloques:',len(out),'| títulos con id:',len(re.findall(r'<h[2-4] id=',doc)),'| listas:',doc.count('<ul>'),'| párrafos:',doc.count('<p>'),'| saltos:',doc.count('class="salto"'))
