#!/usr/bin/env python3
"""Render static share metadata and validate local/deployed page + JPEG bytes."""
import argparse, datetime, hashlib, html, json, struct, sys, urllib.request, urllib.parse
from collections import defaultdict
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SPEC = json.loads((ROOT / 'social-preview.json').read_text())
START, END = '<!-- NaCLip social preview -->', '<!-- /NaCLip social preview -->'

def fields():
    s = SPEC
    return {'description':s['description'], 'og:type':'website', 'og:site_name':s['siteName'],
            'og:title':s['title'], 'og:description':s['description'], 'og:url':s['canonicalUrl'],
            'og:image':s['imageUrl'], 'og:image:secure_url':s['imageUrl'], 'og:image:type':s['imageMime'],
            'og:image:width':str(s['imageWidth']), 'og:image:height':str(s['imageHeight']),
            'og:image:alt':s['imageAlt'], 'twitter:card':s['cardType'], 'twitter:title':s['title'],
            'twitter:description':s['description'], 'twitter:image':s['imageUrl'], 'twitter:image:alt':s['imageAlt']}

class Head(HTMLParser):
    def __init__(self):
        super().__init__(); self.values=defaultdict(list); self.in_head=False; self.in_title=False; self.title=''
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if tag=='head': self.in_head=True
        if not self.in_head: return
        if tag=='title': self.in_title=True
        if tag=='meta':
            key=a.get('property',a.get('name'))
            if key: self.values[key].append(a.get('content',''))
        if tag=='link' and a.get('rel')=='canonical': self.values['canonical'].append(a.get('href',''))
    def handle_endtag(self, tag):
        if tag=='title': self.in_title=False
        if tag=='head': self.in_head=False
    def handle_data(self, value):
        if self.in_title: self.title+=value

def render():
    import re
    p=ROOT/'index.html'; source=p.read_text()
    if START in source:
        a=source.index(START); b=source.index(END,a)+len(END); source=source[:a]+source[b:]
    source=re.sub(r'\s*<meta\b[^>]*(?:name="(?:description|twitter:[^"]+)"|property="og:[^"]+")[^>]*>', '', source)
    source=re.sub(r'\s*<link\b[^>]*rel="canonical"[^>]*>', '', source)
    source=re.sub(r'<title>.*?</title>', '<title>'+html.escape(SPEC['title'])+'</title>', source)
    lines=[START, '  <link rel="canonical" href="'+SPEC['canonicalUrl']+'" />']
    for key,value in fields().items():
        attr='property' if key.startswith('og:') else 'name'
        lines.append(f'  <meta {attr}="{key}" content="{html.escape(value,quote=True)}" />')
    lines.append(END)
    source=source.replace('</head>', '\n  '+'\n  '.join(lines)+'\n</head>')
    p.write_text(source)

def inspect_html(data):
    p=Head();p.feed(data.decode('utf-8')); expected=fields()|{'canonical':SPEC['canonicalUrl']}
    errors=[f'{key}: expected one {value!r}, got {p.values[key]!r}' for key,value in expected.items() if p.values[key]!=[value]]
    if p.title!=SPEC['title']: errors.append('title differs from spec')
    return errors

def inspect_image(data):
    errors=[]
    if data[:3]!=b'\xff\xd8\xff': return ['not a JPEG']
    offset=2; dims=None
    while offset<len(data):
        if data[offset]!=255: return ['invalid JPEG marker']
        while data[offset]==255: offset+=1
        marker=data[offset];offset+=1
        if marker in (0xd8,0xd9): continue
        size=int.from_bytes(data[offset:offset+2],'big')
        if marker in (0xc0,0xc1,0xc2):
            height,width=struct.unpack('>HH',data[offset+3:offset+7]);dims=(width,height);break
        offset+=size
    if dims is None: return ['JPEG has no supported dimension marker']
    if dims!=(SPEC['imageWidth'],SPEC['imageHeight']): errors.append(f'wrong dimensions {dims}')
    if not 1.88<=dims[0]/dims[1]<=1.94: errors.append('wrong card aspect ratio')
    if len(data)>1_000_000: errors.append('card exceeds 1 MB target')
    if hashlib.sha256(data).hexdigest()!=SPEC['asset']['sha256']: errors.append('image hash differs from spec')
    if len(data)!=SPEC['asset']['byteSize']: errors.append('image byte size differs from spec')
    return errors

def fetch(url, agent):
    request=urllib.request.Request(url,headers={'User-Agent':agent})
    with urllib.request.urlopen(request,timeout=30) as response:
        data=response.read()
        return data, {'requestedUrl':url,'finalUrl':response.url,'status':response.status,
                      'contentType':response.headers.get_content_type(),'headers':dict(response.headers),
                      'sha256':hashlib.sha256(data).hexdigest(),'byteSize':len(data)}

def validate(deployed):
    records=[]
    spec_errors=[]
    canonical=urllib.parse.urlparse(SPEC['canonicalUrl']);image=urllib.parse.urlparse(SPEC['imageUrl'])
    if canonical.scheme!='https' or image.scheme!='https': spec_errors.append('share URLs must use HTTPS')
    if canonical.netloc!=image.netloc: spec_errors.append('image must share the canonical origin')
    if SPEC['cardType']!='summary_large_image': spec_errors.append('large image card type required')
    if SPEC['imageWidth']<800: spec_errors.append('image width below 800px')
    if SPEC['asset']['sha256'][:12] not in SPEC['imageUrl']: spec_errors.append('image URL is not content-addressed')
    if not SPEC['imageAlt'].strip(): spec_errors.append('image alt is empty')
    if spec_errors: records.append({'mode':'spec','findings':spec_errors})
    if not deployed:
        errors=inspect_html((ROOT/'index.html').read_bytes())+inspect_image((ROOT/SPEC['imagePath']).read_bytes())
        records.append({'mode':'build','findings':errors})
    else:
        agents={'browser':'Mozilla/5.0','X':'Twitterbot/1.0','Meta':'facebookexternalhit/1.1','Threads':'meta-externalagent/1.1'}
        for label, agent in agents.items():
            try:
                raw,page=fetch(SPEC['canonicalUrl'],agent); errors=inspect_html(raw)
                image,asset=fetch(SPEC['imageUrl'],agent); errors+=inspect_image(image)
                if page['contentType']!='text/html': errors.append('page MIME is not HTML')
                if asset['contentType']!=SPEC['imageMime']: errors.append('image MIME mismatch')
                if page['status']!=200 or asset['status']!=200: errors.append('non-200 status')
                records.append({'agent':label,'page':page,'image':asset,'findings':errors})
            except Exception as e: records.append({'agent':label,'findings':[str(e)]})
    ok=all(not r['findings'] for r in records)
    return {'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(), 'canonicalUrl':SPEC['canonicalUrl'],
            'state':'DEPLOYED_ROUTE_VALIDATED' if deployed and ok else 'BUILD_VALIDATED' if ok else 'FAIL',
            'result':'PASS' if ok else 'FAIL','records':records,
            'platformPreview':'NOT_RUN - crawler reads are not a composer or published-post acceptance'}

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--render',action='store_true');parser.add_argument('--deployed',action='store_true');parser.add_argument('--output',type=Path)
    args=parser.parse_args()
    if args.render: render()
    report=validate(args.deployed)
    if args.output:
        args.output.parent.mkdir(parents=True,exist_ok=True);args.output.write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps(report,indent=2));sys.exit(0 if report['result']=='PASS' else 1)
