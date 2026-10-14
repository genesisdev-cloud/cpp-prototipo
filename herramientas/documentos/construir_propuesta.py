import sys,re,html
from pathlib import Path
RAIZ = Path(__file__).resolve().parents[2]           # carpeta principal del proyecto
HERR = Path(__file__).resolve().parent
sys.path.insert(0,str(HERR))
from docx_bloques import extract
SRC=str(RAIZ/'assets/Documentaciones/PROPUESTA EDUCATIVA INSTITUCIONAL 2027.docx')
OUT=str(RAIZ/'assets/pdf/propuesta-educativa-2027.html')
TITULO='Propuesta educativa 2027'
def esc(s): return html.escape(s,quote=False)
def limpio(t):                               # sin guiones largos
    t=t.replace('2027–2030','2027-2030')
    return t
def fmt(runs):
    out=''
    for txt,b,i,u in runs:
        t=esc(limpio(txt.replace('\t',' ').replace('\f','')))
        t=t.replace('\n','<br>')
        if b: t='<strong>'+t+'</strong>'
        out+=t
    return out.strip()
bl,z=extract(SRC)
# bloques con contenido
SECCIONES={4,9,22,38,44,55,69,83,95}          # títulos de sección (en el Word mezclan estilos)
LISTAS=[(11,19),(46,53),(71,80)]               # líneas sueltas que en realidad son listas
FORMULAS={8,40,100,101,102,103}
ANIOS={86,88,90,92}
out=[]
def en_lista(i): return any(a<=i<=b for a,b in LISTAS)
i=0
while i<len(bl):
    b=bl[i]; t=limpio(b['text'].replace('\f','')).strip()
    if not t: i+=1; continue
    if i==0 or i==1: i+=1; continue            # título y lema: van en la portada
    for a,c in LISTAS:
        if i==a:
            items=''.join(f'<li>{fmt(bl[k]["runs"])}</li>' for k in range(a,c+1))
            out.append(f'<ul>{items}</ul>'); i=c+1; break
    else:
        if i in SECCIONES:
            m=re.match(r'^(\d+\.)\s+(.*)$',t)
            out.append(f'<h2><span class="n">{m.group(1)}</span>{esc(m.group(2))}</h2>')
        elif i in ANIOS:
            m=re.match(r'^(\d{4})\s*[—–-]\s*(.*)$',t)
            out.append(f'<h4 class="anio"><span class="n">{m.group(1)}</span>{esc(m.group(2))}</h4>')
        elif i==99:
            out.append(f'<h2>{esc(t)}</h2>')
        elif i in FORMULAS:
            out.append(f'<p class="formula">{esc(t)}</p>')
        elif (b['sname'] or '')=='heading 3':
            m=re.match(r'^(\d+\.)\s+(.*)$',t)
            out.append(f'<h4><span class="n">{m.group(1)}</span>{esc(m.group(2))}</h4>')
        elif i==98:
            out.append(f'<p class="verso">{fmt(b["runs"])}</p>')
        elif i==104:
            out.append(f'<p class="final">{fmt(b["runs"])}</p>')
        else:
            out.append(f'<p>{fmt(b["runs"])}</p>')
        i+=1
cuerpo='\n'.join(out)
doc=f'''<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Propuesta educativa institucional 2027 | Colegio Presbiteriano del Paraguay</title>
<link href="https://fonts.googleapis.com/css2?family=Bitter:ital,wght@0,400;0,700;1,400&family=Questrial&display=swap" rel="stylesheet">
<link rel="stylesheet" href="documento.css">
<link rel="stylesheet" href="documento-largo.css">
</head>
<body data-titulo="{TITULO}" data-niveles-indice="2">
<!-- Contenido generado a partir de "PROPUESTA EDUCATIVA INSTITUCIONAL 2027.docx". paginar.js arma las hojas A4. -->
<div id="fuente">
<header class="doc-titulo"><div class="eyebrow">Colegio Presbiteriano del Paraguay</div><h1>Propuesta educativa institucional 2027</h1><div class="sub">“Formar con propósito. Educar para transformar.”</div></header>
{cuerpo}
</div>
<script src="paginar.js"></script>
</body>
</html>
'''
open(OUT,'w',encoding='utf-8').write(doc)
print('bloques',len(out),'| h2',doc.count('<h2>'),'| listas',doc.count('<ul>'),'| fórmulas',doc.count('class="formula"'))
