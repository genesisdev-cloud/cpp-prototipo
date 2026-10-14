"""Lee un .docx y devuelve una lista de bloques con su numeración ya calculada.
Cada bloque: dict(kind, style, lvl, numId, label, runs=[(texto, b, i, u)], page_break_before)"""
import zipfile,re,sys,json
import xml.etree.ElementTree as ET
W='http://schemas.openxmlformats.org/wordprocessingml/2006/main'
R='http://schemas.openxmlformats.org/officeDocument/2006/relationships'
def q(t): return '{%s}%s'%(W,t)

def roman(n,upper=True):
    vals=[(1000,'m'),(900,'cm'),(500,'d'),(400,'cd'),(100,'c'),(90,'xc'),(50,'l'),(40,'xl'),(10,'x'),(9,'ix'),(5,'v'),(4,'iv'),(1,'i')]
    s=''
    for v,r in vals:
        while n>=v: s+=r; n-=v
    return s.upper() if upper else s
def fmt(n,f):
    if f=='decimal': return str(n)
    if f=='decimalZero': return '%02d'%n
    if f=='lowerLetter': return chr(96+((n-1)%26)+1) if n<=26 else chr(96+((n-1)%26)+1)*((n-1)//26+1)
    if f=='upperLetter': return fmt(n,'lowerLetter').upper()
    if f=='lowerRoman': return roman(n,False)
    if f=='upperRoman': return roman(n,True)
    if f=='bullet': return '•'
    if f=='none': return ''
    return str(n)

def load(path):
    z=zipfile.ZipFile(path)
    doc=ET.fromstring(z.read('word/document.xml'))
    num=ET.fromstring(z.read('word/numbering.xml')) if 'word/numbering.xml' in z.namelist() else None
    sty=ET.fromstring(z.read('word/styles.xml'))
    rels={}
    if 'word/_rels/document.xml.rels' in z.namelist():
        for r in ET.fromstring(z.read('word/_rels/document.xml.rels')):
            rels[r.get('Id')]=(r.get('Target'),r.get('Type'))
    return z,doc,num,sty,rels

def parse_numbering(num):
    abstract={}; nums={}
    if num is None: return abstract,nums
    for a in num.findall(q('abstractNum')):
        lv={}
        for l in a.findall(q('lvl')):
            i=int(l.get(q('ilvl')))
            nf=l.find(q('numFmt')); lt=l.find(q('lvlText')); st=l.find(q('start'))
            lv[i]=dict(fmt=nf.get(q('val')) if nf is not None else 'decimal',
                       text=lt.get(q('val')) if lt is not None else '',
                       start=int(st.get(q('val'))) if st is not None else 1)
        abstract[a.get(q('abstractNumId'))]=lv
    for n in num.findall(q('num')):
        aid=n.find(q('abstractNumId')).get(q('val'))
        ov={}
        for o in n.findall(q('lvlOverride')):
            s=o.find(q('startOverride'))
            if s is not None: ov[int(o.get(q('ilvl')))]=int(s.get(q('val')))
        nums[n.get(q('numId'))]=(aid,ov)
    return abstract,nums

def style_info(sty):
    info={}
    for s in sty.findall(q('style')):
        sid=s.get(q('styleId')); name=s.find(q('name')); 
        ppr=s.find(q('pPr')); numpr=None
        if ppr is not None and ppr.find(q('numPr')) is not None:
            npr=ppr.find(q('numPr')); 
            nid=npr.find(q('numId')); il=npr.find(q('ilvl'))
            numpr=(nid.get(q('val')) if nid is not None else None, int(il.get(q('val'))) if il is not None else 0)
        based=s.find(q('basedOn'))
        info[sid]=dict(name=name.get(q('val')) if name is not None else sid,num=numpr,based=based.get(q('val')) if based is not None else None)
    return info

def runs_of(p,rels):
    out=[]
    def walk(el,inherit=None):
        for ch in el:
            if ch.tag==q('r'):
                rpr=ch.find(q('rPr')); b=i=u=False
                if rpr is not None:
                    bb=rpr.find(q('b')); ii=rpr.find(q('i')); uu=rpr.find(q('u'))
                    b=bb is not None and bb.get(q('val')) not in ('0','false')
                    i=ii is not None and ii.get(q('val')) not in ('0','false')
                    u=uu is not None and uu.get(q('val')) not in ('none',None)
                for c in ch:
                    if c.tag==q('t'): out.append([c.text or '',b,i,u])
                    elif c.tag==q('tab'): out.append(['\t',b,i,u])
                    elif c.tag==q('br'):
                        out.append(['\n' if c.get(q('type')) in (None,'textWrapping') else '\f',b,i,u])
                    elif c.tag==q('drawing'):
                        blip=c.find('.//{http://schemas.openxmlformats.org/drawingml/2006/main}blip')
                        if blip is not None:
                            rid=blip.get('{%s}embed'%R); out.append(['\x00IMG:'+rels.get(rid,('',''))[0],False,False,False])
            elif ch.tag in (q('hyperlink'),q('smartTag'),q('sdt'),q('sdtContent'),q('ins')): walk(ch)
    walk(p)
    return out

def extract(path):
    z,doc,num,sty,rels=load(path)
    abstract,nums=parse_numbering(num); sinfo=style_info(sty)
    counters={}  # numId -> {lvl: count}
    blocks=[]
    body=doc.find(q('body'))
    for p in body.iter(q('p')):
        ppr=p.find(q('pPr')); st=None; numid=None; ilvl=0; jc=None
        if ppr is not None:
            ps=ppr.find(q('pStyle'))
            if ps is not None: st=ps.get(q('val'))
            np_=ppr.find(q('numPr'))
            if np_ is not None:
                ni=np_.find(q('numId')); il=np_.find(q('ilvl'))
                if ni is not None: numid=ni.get(q('val'))
                if il is not None: ilvl=int(il.get(q('val')))
            j=ppr.find(q('jc')); jc=j.get(q('val')) if j is not None else None
        if numid is None and st:
            s=st
            while s and s in sinfo:
                if sinfo[s]['num']:
                    numid=sinfo[s]['num'][0]; ilvl=sinfo[s]['num'][1] if np_ is None or p.find('.//'+q('ilvl')) is None else ilvl; break
                s=sinfo[s]['based']
        label=''
        if numid and numid!='0' and numid in nums:
            aid,ov=nums[numid]; lv=abstract.get(aid,{}); info=lv.get(ilvl)
            if info:
                c=counters.setdefault(numid,{})
                c[ilvl]=c.get(ilvl,ov.get(ilvl,info['start'])-1)+1
                for deeper in list(c):
                    if deeper>ilvl: del c[deeper]
                # niveles superiores sin contar todavía: empiezan en su valor inicial
                txt=info['text']
                def rep(m):
                    k=int(m.group(1))-1
                    li=lv.get(k,{'fmt':'decimal','start':1})
                    return fmt(c.get(k,li['start']),li['fmt'])
                label=re.sub(r'%(\d)',rep,txt)
                if info['fmt']=='bullet': label='•'
        rs=runs_of(p,rels)
        text=''.join(r[0] for r in rs)
        blocks.append(dict(style=st,sname=sinfo.get(st,{}).get('name') if st else None,numId=numid,lvl=ilvl,label=label,jc=jc,runs=rs,text=text))
    return blocks,z

if __name__=='__main__':
    bl,z=extract(sys.argv[1])
    lo=int(sys.argv[2]) if len(sys.argv)>2 else 0; hi=int(sys.argv[3]) if len(sys.argv)>3 else 80
    for i,b in enumerate(bl[lo:hi],lo):
        bold=all(r[1] for r in b['runs'] if r[0].strip()) and any(r[0].strip() for r in b['runs'])
        print(f"{i:3} [{b['sname'] or '-'}|{'B' if bold else ' '}|l{b['lvl']}|n{b['numId']}] {b['label']!r:8} {b['text'][:90]!r}")
