"""Verifica que cada PDF largo tenga las mismas palabras que el documento de origen (cuenta palabra por palabra).
Uso:  python3 herramientas/documentos/verificar.py reglamento|propuesta|manual|todos
Las diferencias que no son contenido (letras sueltas del rótulo con letras espaciadas, encabezados de tabla,
palabras que el PDF original traía cortadas en dos) se reconocen a simple vista en la lista."""
import sys,re,subprocess
from pathlib import Path
RAIZ = Path(__file__).resolve().parents[2]
sys.path.insert(0,str(Path(__file__).resolve().parent))
from comparar_texto import comparar_cuerpo, comparar_total

def reglamento():
    from docx_bloques import extract
    bl,_=extract(str(RAIZ/'assets/Documentaciones/REGLAMENTO DE ADMISION 09-10-2026.docx'))
    src=[]
    for b in bl:
        if (b['sname'] or '').lower().startswith('toc'): continue
        if b['label'] and b['label']!='•': src.append(b['label'])
        src.append(re.sub(r'\x00IMG:\S+',' ',b['text'].replace('\x0c',' ')))
    return comparar_cuerpo(' '.join(src),str(RAIZ/'assets/pdf/reglamento-admision.pdf'),desde=2)

def propuesta():
    from docx_bloques import extract
    bl,_=extract(str(RAIZ/'assets/Documentaciones/PROPUESTA EDUCATIVA INSTITUCIONAL 2027.docx'))
    return comparar_total(' '.join(b['text'].replace('\x0c',' ') for b in bl),str(RAIZ/'assets/pdf/propuesta-educativa-2027.pdf'))

def manual():
    from manual_xml import load
    _,pages=load(RAIZ/'herramientas/documentos/_tmp/manual/man.xml')
    src=[]
    for p in pages[4:32]:
        for it in sorted(p['items'],key=lambda i:(i['top'],i['left'])):
            t=it['text'].strip()
            if 115<it['top']<1190 and t and t not in ('●','•'): src.append(it['text'])
    pdf=str(RAIZ/'assets/pdf/manual-convivencia.pdf')
    n=int(re.search(r'Pages:\s+(\d+)',subprocess.run(['pdfinfo',pdf],capture_output=True,text=True).stdout).group(1))
    inicio=next(k for k in range(1,n+1) if 'fue fundado en el año 2002' in subprocess.run(['pdftotext','-f',str(k),'-l',str(k),pdf,'-'],capture_output=True,text=True).stdout)
    return comparar_cuerpo(' '.join(src),pdf,desde=inicio)

DOCS={'reglamento':reglamento,'propuesta':propuesta,'manual':manual}
if __name__=='__main__':
    quien=sys.argv[1] if len(sys.argv)>1 else 'todos'
    for k in (DOCS if quien=='todos' else [quien]):
        print('==',k); DOCS[k]()
