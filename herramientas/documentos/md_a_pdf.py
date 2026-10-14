"""Convierte un documento Markdown de documentacion/ a una página HTML con el diseño de los PDF del colegio
(la imprime después imprimir_pdf.mjs).  Uso:
    python3 herramientas/documentos/md_a_pdf.py documentacion/registro-de-admision.md
Admite: títulos (#, ##), párrafos, listas con viñetas o numeradas, tablas, imágenes, bloques de código, **negrita** y `código`."""
import sys,re,html
from pathlib import Path
RAIZ = Path(__file__).resolve().parents[2]

def esc(s): return html.escape(s,quote=False)
def inline(t):
    t=esc(t)
    t=re.sub(r'`([^`]+)`',r'<code>\1</code>',t)
    t=re.sub(r'\*\*([^*]+)\*\*',r'<strong>\1</strong>',t)
    t=re.sub(r'(?<![*\w])\*([^*\n]+)\*(?![*\w])',r'<em>\1</em>',t)
    t=re.sub(r'\[([^\]]+)\]\(([^)]+)\)',r'\1',t)          # los enlaces quedan como texto en el PDF
    return t

def convertir(md_path):
    lineas=Path(md_path).read_text(encoding='utf-8').split('\n')
    out=[]; i=0; titulo=''; h2n=0; primer_h1=True
    def es_tabla(k): return k+1<len(lineas) and lineas[k].lstrip().startswith('|') and re.match(r'^\s*\|[\s:|-]+\|\s*$',lineas[k+1] or '')
    while i<len(lineas):
        ln=lineas[i]
        if not ln.strip(): i+=1; continue
        if ln.startswith('```'):
            j=i+1; bloque=[]
            while j<len(lineas) and not lineas[j].startswith('```'): bloque.append(lineas[j]); j+=1
            out.append('<pre>'+esc('\n'.join(bloque))+'</pre>'); i=j+1; continue
        m=re.match(r'^(#{1,3})\s+(.*)$',ln)
        if m:
            nivel=len(m.group(1)); txt=m.group(2).strip()
            if nivel==1:
                titulo=txt; out.append(f'@@TITULO@@'); 
            else:
                h2n+=1
                n=re.match(r'^((?:\d+|Anexo [A-Z])\.)\s+(.*)$',txt)
                tag='h2' if nivel==2 else 'h3'
                if n: out.append(f'<{tag} id="s{h2n}"><span class="n">{esc(n.group(1))}</span>{inline(n.group(2))}</{tag}>')
                else: out.append(f'<{tag} id="s{h2n}">{inline(txt)}</{tag}>')
            i+=1; continue
        m=re.match(r'^!\[([^\]]*)\]\(([^)]+)\)\s*$',ln)
        if m:
            out.append(f'<figure><img src="{esc(m.group(2))}" alt="{esc(m.group(1))}"></figure>'); i+=1; continue
        if es_tabla(i):
            def celdas(l): return [c.strip() for c in l.strip().strip('|').split('|')]
            cab=celdas(lineas[i]); j=i+2; filas=[]
            while j<len(lineas) and lineas[j].lstrip().startswith('|'): filas.append(celdas(lineas[j])); j+=1
            th=''.join(f'<th>{inline(c)}</th>' for c in cab)
            tr=''.join('<tr>'+''.join(f'<td>{inline(c)}</td>' for c in f)+'</tr>' for f in filas)
            out.append(f'<table><thead><tr>{th}</tr></thead><tbody>{tr}</tbody></table>'); i=j; continue
        if re.match(r'^\s*[-*]\s+',ln) or re.match(r'^\s*\d+\.\s+',ln):
            ordenada=bool(re.match(r'^\s*\d+\.\s+',ln)); items=[]
            while i<len(lineas):
                l=lineas[i]
                mm=re.match(r'^\s*(?:[-*]|\d+\.)\s+(.*)$',l)
                if mm and not (ordenada is False and re.match(r'^\s*\d+\.\s+',l)): items.append(mm.group(1)); i+=1
                elif l.startswith('  ') and l.strip() and items: items[-1]+=' '+l.strip(); i+=1
                else: break
            tag='ol' if ordenada else 'ul'
            out.append(f'<{tag}>'+''.join(f'<li>{inline(x)}</li>' for x in items)+f'</{tag}>'); continue
        # párrafo
        buf=[ln.strip()]; i+=1
        while i<len(lineas) and lineas[i].strip() and not re.match(r'^(#|\||```|!\[|\s*[-*]\s|\s*\d+\.\s)',lineas[i]): buf.append(lineas[i].strip()); i+=1
        out.append(f'<p>{inline(" ".join(buf))}</p>')
    return titulo,out

def main(md):
    md=Path(md); titulo,bloques=convertir(md)
    cuerpo='\n'.join(bloques)
    cabecera=(f'<header class="doc-titulo"><div class="eyebrow">Colegio Presbiteriano del Paraguay · Documentación</div><h1>{esc(titulo)}</h1></header>\n'
              '<div class="contenido-h">Contenido</div>\n<nav class="toc"></nav>\n<div class="salto"></div>')
    cuerpo=cuerpo.replace('@@TITULO@@',cabecera,1)
    rel=Path('../assets/pdf')   # desde documentacion/
    doc=f'''<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>{esc(titulo)} | Colegio Presbiteriano del Paraguay</title>
<link href="https://fonts.googleapis.com/css2?family=Bitter:ital,wght@0,400;0,700;1,400&family=Questrial&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{rel}/documento.css">
<link rel="stylesheet" href="{rel}/documento-largo.css">
</head>
<body data-titulo="{esc(titulo)}" data-niveles-indice="2" data-logos="../assets/logo/">
<!-- Generado a partir de {md.name} con herramientas/documentos/md_a_pdf.py. paginar.js arma las hojas A4. -->
<div id="fuente">
{cuerpo}
</div>
<script src="{rel}/paginar.js"></script>
</body>
</html>
'''
    salida=md.with_suffix('.html'); salida.write_text(doc,encoding='utf-8')
    print('escrito',salida,'| bloques:',len(bloques))
if __name__=='__main__': main(sys.argv[1])
