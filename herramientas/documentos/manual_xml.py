"""Lectura del XML que genera pdftohtml: líneas con coordenadas, fuentes y negritas."""
import re,html
def load(ruta_xml):
    x=open(ruta_xml,encoding='utf-8').read()
    fonts={m.group(1):dict(size=int(m.group(2)),family=m.group(3),color=m.group(4)) for m in re.finditer(r'<fontspec id="(\d+)" size="(\d+)" family="([^"]*)" color="([^"]*)"/>',x)}
    pages=[]
    for pm in re.finditer(r'<page number="(\d+)"[^>]*height="(\d+)" width="(\d+)">(.*?)</page>',x,re.S):
        n=int(pm.group(1)); items=[]
        for tm in re.finditer(r'<text top="(-?\d+)" left="(-?\d+)" width="(\d+)" height="(\d+)" font="(\d+)">(.*?)</text>',pm.group(4),re.S):
            top,left,w,h,f,inner=int(tm.group(1)),int(tm.group(2)),int(tm.group(3)),int(tm.group(4)),tm.group(5),tm.group(6)
            bold=bool(re.search(r'<b>',inner)) or 'Bold' in fonts[f]['family']
            ital=bool(re.search(r'<i>',inner))
            raw=html.unescape(re.sub(r'<[^>]+>','',inner))
            items.append(dict(top=top,left=left,w=w,h=h,font=f,fam=fonts[f]['family'],size=fonts[f]['size'],color=fonts[f]['color'],bold=bold,ital=ital,html=inner,text=raw))
        pages.append(dict(n=n,items=items))
    return fonts,pages
