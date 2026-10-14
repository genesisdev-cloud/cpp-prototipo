import re,subprocess,sys
from collections import Counter
TOK=re.compile(r"[0-9A-Za-zÁÉÍÓÚÜÑáéíóúüñ°ºª]+")
def tokens(s): return [t.lower() for t in TOK.findall(s)]
def pdf_text(path): return subprocess.run(['pdftotext','-enc','UTF-8',path,'-'],capture_output=True,text=True).stdout
def comparar(src_text,pdf_path,ruido='',mostrar=60):
    a=Counter(tokens(src_text)); b=Counter(tokens(pdf_text(pdf_path)))-Counter(tokens(ruido))
    falta=a-b; sobra=b-a
    print(f'palabras en el original: {sum(a.values())} | en el PDF (sin encabezados/pies): {sum(b.values())}')
    print('FALTAN en el PDF  (%d):'%sum(falta.values()), dict(list(falta.most_common(mostrar))))
    print('SOBRAN en el PDF  (%d):'%sum(sobra.values()), dict(list(sobra.most_common(mostrar))))
    return falta,sobra

def cuerpo_pdf(path,desde=2,arriba_pt=96,abajo_pt=71):
    """Texto de las hojas interiores recortado al área de contenido (sin encabezado ni pie)."""
    n=int(re.search(r'Pages:\s+(\d+)',subprocess.run(['pdfinfo',path],capture_output=True,text=True).stdout).group(1))
    alto=842-arriba_pt-abajo_pt
    t=subprocess.run(['pdftotext','-enc','UTF-8','-f',str(desde),'-l',str(n),'-x','0','-y',str(arriba_pt),'-W','595','-H',str(alto),path,'-'],capture_output=True,text=True).stdout
    return t,n
def comparar_cuerpo(src_text,pdf_path,desde=2,mostrar=50,**kw):
    t,n=cuerpo_pdf(pdf_path,desde,**kw)
    a=Counter(tokens(src_text)); b=Counter(tokens(t))
    falta=a-b; sobra=b-a
    print(f'hojas {desde}..{n} | palabras original: {sum(a.values())} | PDF: {sum(b.values())}')
    print('FALTAN en el PDF (%d):'%sum(falta.values()), dict(falta.most_common(mostrar)))
    print('SOBRAN en el PDF (%d):'%sum(sobra.values()), dict(sobra.most_common(mostrar)))
    return falta,sobra

def _texto_pdf(path,f,l,top,bottom):
    alto=842-top-bottom
    return subprocess.run(['pdftotext','-enc','UTF-8','-f',str(f),'-l',str(l),'-x','0','-y',str(top),'-W','595','-H',str(alto),path,'-'],capture_output=True,text=True).stdout
def _sin_letras_espaciadas(t):
    """quita las líneas hechas solo de letras sueltas (texto con espaciado de letras de los rótulos)"""
    keep=[]
    for ln in t.splitlines():
        tk=ln.split()
        if len(tk)>=6 and all(len(x)==1 for x in tk): continue
        keep.append(ln)
    return '\n'.join(keep)
def comparar_total(src_text,pdf_path,mostrar=50,p1=(193,142),interior=(96,71)):
    n=int(re.search(r'Pages:\s+(\d+)',subprocess.run(['pdfinfo',pdf_path],capture_output=True,text=True).stdout).group(1))
    t=_texto_pdf(pdf_path,1,1,*p1)
    if n>1: t+='\n'+_texto_pdf(pdf_path,2,n,*interior)
    t=_sin_letras_espaciadas(t)
    a=Counter(tokens(src_text)); b=Counter(tokens(t))
    falta=a-b; sobra=b-a
    print(f'{n} hojas | palabras original: {sum(a.values())} | PDF: {sum(b.values())}')
    print('FALTAN en el PDF (%d):'%sum(falta.values()), dict(falta.most_common(mostrar)))
    print('SOBRAN en el PDF (%d):'%sum(sobra.values()), dict(sobra.most_common(mostrar)))
    return falta,sobra
