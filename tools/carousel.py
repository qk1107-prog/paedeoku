#!/usr/bin/env python3
"""패더쿠 오늘의 캐러셀 → 디자인 캔버스 파일 만들기
사용: python3 carousel.py spec.json <canvas_root>
  <canvas_root>/project/canvas.json 을 읽어 그날 페이지(page)를 추가하고 5장 .dc.html 을 씀.
spec.json:
{
 "date": "2026-11-21",                       # 페이지 이름·파일 접두어
 "cover": {"img": "/_blob/..", "label": "블랙 프라이데이", "l1": "어그 블프", "l2": "최대 50% 할인"},
 "slides": [                                  # 4장 (2~5장)
   {"kind": "grid", "items": [{"img": "/_blob/..", "b": "어그", "n": "스커페트 II", "o": 178000, "p": 88990, "r": 50}, ...9개]},
   {"kind": "single", "img": "/_blob/..", "h1": "진짜 겨울 치트키", "h2": "5만원도 안 하는 어그", "r": 50, "p": 88990}
 ],
 "caption": "캡션 + 고정댓글 텍스트"
}
"""
import json, os, sys, html, datetime
KR = "'Noto Sans KR', sans-serif"
INK = '#1E1B19'; RED = '#E5322D'
E = lambda s: html.escape(str(s if s is not None else ''), quote=True)
won = lambda n: f'{int(n):,}원' if n else ''
PH = 'repeating-linear-gradient(135deg, #E9E6E3 0px, #E9E6E3 16px, #E2DEDA 16px, #E2DEDA 32px)'

def page(title, body):
    return f'''<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<title>{E(title)}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&amp;display=swap">
<style>
body{{margin:0}}
a{{color:#111111}}a:hover{{color:#444444}}
</style>
</helmet>
{body}
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{{"$preview":{{"width":1080,"height":1350}}}}'>
class Component extends DCLogic {{
renderVals() {{
return {{}};
}}
}}
</script>
</body>
</html>
'''

def bgimg(src):
    if src:
        return f'<img src="{E(src)}" alt="" style="position: absolute; left: 0; top: 0; width: 1080px; height: 1350px; object-fit: cover; display: block">'
    return f'<div style="position: absolute; inset: 0; background: {PH}"></div>'

def cover(c):
    return f'''<div style="width: 1080px; height: 1350px; position: relative; overflow: hidden; background: #CFCAC6; font-family: {KR}; color: #FFFFFF">
{bgimg(c.get('img'))}
<div style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.10) 40%, rgba(0,0,0,0.55) 100%)"></div>
<p style="position: absolute; left: 64px; top: 60px; margin: 0; font-size: 32px; font-weight: 700; text-shadow: 0 2px 12px rgba(0,0,0,0.25)">패더쿠</p>
<div style="position: absolute; left: 60px; right: 60px; top: 790px; display: flex; flex-direction: column; align-items: center; gap: 22px; text-shadow: 0 2px 16px rgba(0,0,0,0.28)">
<p style="margin: 0; font-size: 32px; font-weight: 500">{E(c.get('label'))}</p>
<h1 style="margin: 0; font-size: 100px; font-weight: 700; letter-spacing: -3px; line-height: 1.2; text-align: center">{E(c.get('l1'))}<br>{E(c.get('l2'))}</h1>
</div>
</div>'''

def tile(x):
    im = f'<img src="{E(x["img"])}" alt="{E(x.get("b"))} {E(x.get("n"))}" style="width: 100%; height: 100%; object-fit: cover; display: block">' if x.get('img') else ''
    r = x.get('r') or 0
    return f'''<div style="display: flex; flex-direction: column; gap: 5px; min-width: 0">
<div style="width: 100%; height: 254px; background: #F3F3F3; overflow: hidden">{im}</div>
<p style="margin: 0; margin-top: 8px; font-size: 20px; font-weight: 500; color: #8A8A8A">{E(x.get('b'))}</p>
<p style="margin: 0; font-size: 23px; font-weight: 400; color: #111111; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{E(x.get('n'))}</p>
<p style="margin: 0; font-size: 19px; color: #A3A3A3; text-decoration: line-through">{E(won(x.get('o')) if r else '')}</p>
<p style="margin: 0; font-size: 26px; font-weight: 700; color: #111111">{f'<span style="color: {RED}">{r}%</span> ' if r else ''}{E(won(x.get('p')))}</p>
</div>'''

def grid(items):
    return f'''<div style="width: 1080px; height: 1350px; box-sizing: border-box; padding: 34px 32px; background: #FFFFFF; font-family: {KR}; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); column-gap: 18px; row-gap: 22px; align-content: start">
{chr(10).join(tile(x) for x in items[:9])}
</div>'''

def single(s):
    r = s.get('r') or 0
    chips = (f'<p style="margin: 0; font-size: 30px; font-weight: 700; color: #FFFFFF; background: {RED}; border-radius: 999px; padding: 10px 24px">{r}% 할인</p>' if r else '') + \
            (f'<p style="margin: 0; font-size: 30px; font-weight: 700; color: {INK}; background: #FFFFFF; border-radius: 999px; padding: 10px 24px">{E(won(s.get("p")))}</p>' if s.get('p') else '')
    return f'''<div style="width: 1080px; height: 1350px; position: relative; overflow: hidden; background: #CFCAC6; font-family: {KR}; color: #FFFFFF">
{bgimg(s.get('img'))}
<div style="position: absolute; left: 0; right: 0; bottom: 0; height: 620px; background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 100%)"></div>
<p style="position: absolute; left: 64px; top: 60px; margin: 0; font-size: 32px; font-weight: 700; text-shadow: 0 2px 12px rgba(0,0,0,0.25)">패더쿠</p>
<div style="position: absolute; left: 64px; right: 64px; bottom: 80px; display: flex; flex-direction: column; gap: 26px; text-shadow: 0 2px 14px rgba(0,0,0,0.25)">
<h1 style="margin: 0; font-size: 80px; font-weight: 700; letter-spacing: -2.5px; line-height: 1.22">{E(s.get('h1'))}<br>{E(s.get('h2'))}</h1>
<div style="display: flex; gap: 12px; text-shadow: none">{chips}</div>
</div>
</div>'''

def main(spec_path, root):
    spec = json.load(open(spec_path))
    d = spec['date']; key = d.replace('-', '')[2:]  # 261121
    proj = os.path.join(root, 'project'); os.makedirs(proj, exist_ok=True)
    cpath = os.path.join(proj, 'canvas.json')
    c = json.load(open(cpath)) if os.path.exists(cpath) else {"v": 3, "createdOnFiles": {"v": 1, "at": datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')}, "title": "패더쿠 오늘의 캐러셀", "pages": [], "boards": {}, "order": [], "notes": {}, "designSystems": []}
    pid = 'p' + key
    label = f'{int(d[5:7])}/{int(d[8:10])}'
    c.setdefault('pages', [])
    if not any(p['id'] == pid for p in c['pages']):
        c['pages'].insert(0, {"id": pid, "name": label})
    files = []
    bodies = [('1 표지', cover(spec['cover']))]
    for i, s in enumerate(spec['slides'][:4]):
        bodies.append((f'{i+2} {"제품" if s["kind"]=="grid" else "단일컷"}', grid(s['items']) if s['kind'] == 'grid' else single(s)))
    for i, (t, b) in enumerate(bodies):
        f = f'd{key}_{i+1}.dc.html'
        open(os.path.join(proj, f), 'w').write(page(f'{label} {t}', b))
        c['boards'][f] = {"x": i * 1160, "y": 0, "w": 1080, "h": 1350, "title": t, "page": pid}
        if f not in c['order']: c['order'].append(f)
        files.append(f)
    c.setdefault('notes', {})[f'cap{key}'] = {"x": 5 * 1160, "y": 0, "w": 900, "size": "m", "fill": "orange", "page": pid, "text": spec.get('caption', '')}
    c['notes'][f't{key}'] = {"x": 0, "y": -300, "text": f'{label} 오늘의 캐러셀', "kind": "title1", "maxW": 5600, "page": pid}
    c['launch'] = {"view": "canvas", "page": pid}
    json.dump(c, open(cpath, 'w'), ensure_ascii=False, indent=1)
    print(json.dumps({"files": ["project/" + f for f in files], "page": pid}, ensure_ascii=False))

if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
