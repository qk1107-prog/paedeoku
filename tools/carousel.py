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
   {"kind": "single", "img": "/_blob/..", "h1": "진짜 겨울 치트키", "h2": "5만원도 안 하는 어그", "r": 50, "p": 88990},
   {"kind": "grid", "title": "오늘의 하루특가", "sub": "11/23(월) 오늘 하루만", "items": [...6개 착샷]},   # 제목 있는 그리드(6개, 사진 크게)
   {"kind": "info", "title": "오늘 같이 챙길 행사", "lines": [{"tag": "쿠폰", "text": "..."}], "items": [...최대 3개]},
   {"kind": "cta", "l1": "링크 필요하면", "l2": "댓글에 '옷장' 남겨주세요", "kw": "옷장"}
 ],
 "mascot": "/_blob/.. (박스 프사, cta·표지 로고용, 선택)",
 "caption": "캡션 + 고정댓글 텍스트"
}
"""
import json, os, sys, html, datetime
KR = "'Noto Sans KR', sans-serif"
INK = '#1E1B19'; RED = '#5B5BF0'; LAV = '#ECE8FF'; LAV2 = '#5B5BF0'
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

def badge(b):
    if not b: return ''
    top, big = (b.split('|') + [''])[:2]
    return f"""<div style="position: absolute; right: 56px; top: 48px; width: 300px; height: 300px; border-radius: 50%; background: {LAV2}; color: #FFFFFF; display: flex; flex-direction: column; align-items: center; justify-content: center; transform: rotate(-8deg); box-shadow: 0 10px 30px rgba(0,0,0,0.25)">
<p style="margin: 0; font-size: 40px; font-weight: 700; text-shadow: none">{E(top)}</p>
<p style="margin: 0; font-size: 112px; font-weight: 700; letter-spacing: -4px; line-height: 1; text-shadow: none">{E(big)}</p>
</div>"""

def cover(c):
    return f'''<div style="width: 1080px; height: 1350px; position: relative; overflow: hidden; background: #CFCAC6; font-family: {KR}; color: #FFFFFF">
{bgimg(c.get('img'))}
<div style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.10) 40%, rgba(0,0,0,0.55) 100%)"></div>
<p style="position: absolute; left: 64px; top: 60px; margin: 0; font-size: 32px; font-weight: 700; text-shadow: 0 2px 12px rgba(0,0,0,0.25)">패더쿠</p>
{badge(c.get('badge'))}
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

def rail(title, sub):
    return f"""<div style="display: flex; flex-direction: column; gap: 10px">
<div style="display: flex; align-items: center; gap: 16px">
<svg width="46" height="32" viewBox="0 0 34 24" fill="none" stroke="{INK}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 9c0-2 1-3 3-3.5S22.5 2 20 1.5 16.5 2 16.5 3.5"/><path d="M17 9 2 21h30z"/></svg>
<h2 style="margin: 0; font-size: 54px; font-weight: 700; letter-spacing: -1.5px; color: {INK}">{E(title)}</h2>
</div>
{f'<p style="margin: 0; font-size: 26px; font-weight: 500; color: #6E6880">{E(sub)}</p>' if sub else ''}
<div style="height: 6px; border-radius: 3px; background: {INK}; margin-top: 8px"></div>
</div>"""

def tag_sticker(r):
    return f'<span style="position: absolute; left: 12px; top: 12px; background: {LAV2}; color: #FFFFFF; font-size: 22px; font-weight: 700; padding: 6px 14px 6px 22px; border-radius: 6px 16px 16px 6px">{r}%<span style="position: absolute; left: 8px; top: 50%; width: 7px; height: 7px; margin-top: -3.5px; border-radius: 50%; background: #FFFFFF"></span></span>' if r else ''

def tile6(x):
    im = f'<img src="{E(x["img"])}" alt="{E(x.get("b"))} {E(x.get("n"))}" style="width: 100%; height: 100%; object-fit: cover; object-position: 50% 20%; display: block">' if x.get('img') else ''
    r = x.get('r') or 0
    return f"""<div style="display: flex; flex-direction: column; gap: 4px; min-width: 0">
<div style="position: relative; width: 100%; height: 372px; background: #F3F3F3; border-radius: 14px; overflow: hidden">{im}{tag_sticker(r)}</div>
<p style="margin: 0; margin-top: 8px; font-size: 20px; font-weight: 500; color: #8A8A8A">{E(x.get('b'))}</p>
<p style="margin: 0; font-size: 22px; color: #111111; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{E(x.get('n'))}</p>
<p style="margin: 0; font-size: 26px; font-weight: 700; color: #111111">{f'<span style="font-size: 19px; font-weight: 400; color: #A3A3A3; text-decoration: line-through">{E(won(x.get("o")))}</span> ' if r and x.get('o') else ''}{E(won(x.get('p')))}</p>
</div>"""

def grid_titled(s):
    return f"""<div style="width: 1080px; height: 1350px; box-sizing: border-box; padding: 56px 44px 40px; background: #FFFFFF; font-family: {KR}; display: flex; flex-direction: column; gap: 30px">
{rail(s.get('title'), s.get('sub'))}
<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); column-gap: 20px; row-gap: 26px">
{chr(10).join(tile6(x) for x in s.get('items', [])[:6])}
</div>
</div>"""

def info(s):
    lines = ''.join(f'<div style="display: flex; align-items: flex-start; gap: 18px; padding: 22px 0; border-bottom: 2px solid #E6E3F2"><span style="flex: none; background: {LAV}; color: {LAV2}; font-size: 24px; font-weight: 700; padding: 8px 16px; border-radius: 999px">{E(l.get("tag"))}</span><p style="margin: 0; font-size: 32px; font-weight: 500; color: {INK}; line-height: 1.4">{E(l.get("text"))}</p></div>' for l in s.get('lines', [])[:5])
    its = s.get('items', [])[:3]
    row = f'<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; margin-top: auto">{"".join(f"""<div style="position: relative; height: 300px; border-radius: 14px; overflow: hidden; background: #F3F3F3"><img src="{E(x.get('img'))}" alt="{E(x.get('b'))}" style="width: 100%; height: 100%; object-fit: cover; object-position: 50% 20%; display: block">{tag_sticker(x.get('r') or 0)}</div>""" for x in its)}</div>' if its else ''
    return f"""<div style="width: 1080px; height: 1350px; box-sizing: border-box; padding: 56px 52px 48px; background: #FAFAFD; font-family: {KR}; display: flex; flex-direction: column; gap: 18px">
{rail(s.get('title'), s.get('sub'))}
<div style="display: flex; flex-direction: column">{lines}</div>
{row}
</div>"""

def cta(s, mascot):
    # 마지막 장: 패더쿠 + 소개글만 (깔끔한 라벤더 기본형)
    import base64
    box = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'endcard_box.png')
    src = 'data:image/png;base64,' + base64.b64encode(open(box, 'rb').read()).decode() if os.path.exists(box) else (mascot or '')
    bio = s.get('bio') or '패션 덕후가 매일 채우는 할인 박스'
    return f"""<div style="width: 1080px; height: 1350px; box-sizing: border-box; background: #ECE8FF; font-family: {KR}; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center">
<img src="{src}" alt="패더쿠" style="width: 470px; display: block">
<p style="margin: 70px 0 0; font-size: 120px; font-weight: 900; letter-spacing: -4px; line-height: 1.1; color: #16151C">패더쿠</p>
<p style="margin: 26px 0 0; font-size: 40px; font-weight: 500; letter-spacing: -1px; color: #5B5BF0">{E(bio)}</p>
</div>"""

def main(spec_path, root):
    spec = json.load(open(spec_path))
    d = spec['date']; key = spec.get('key') or d.replace('-', '')[2:]  # 261121
    proj = os.path.join(root, 'project'); os.makedirs(proj, exist_ok=True)
    cpath = os.path.join(proj, 'canvas.json')
    c = json.load(open(cpath)) if os.path.exists(cpath) else {"v": 3, "createdOnFiles": {"v": 1, "at": datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')}, "title": "패더쿠 오늘의 캐러셀", "pages": [], "boards": {}, "order": [], "notes": {}, "designSystems": []}
    pid = 'p' + key
    label = f'{int(d[5:7])}/{int(d[8:10])}'
    c.setdefault('pages', [])
    if not any(p['id'] == pid for p in c['pages']):
        c['pages'].insert(0, {"id": pid, "name": spec.get('page_name') or label})
    files = []
    bodies = [('1 표지', cover(spec['cover']))]
    names = {'grid': '제품', 'single': '단일컷', 'info': '행사', 'cta': '마무리'}
    for i, s in enumerate(spec['slides'][:4]):
        k = s['kind']
        body = (grid_titled(s) if s.get('title') else grid(s['items'])) if k == 'grid' else info(s) if k == 'info' else cta(s, spec.get('mascot')) if k == 'cta' else single(s)
        bodies.append((f'{i+2} {s.get("title") or names.get(k, k)}', body))
    for i, (t, b) in enumerate(bodies):
        f = f'd{key}_{i+1}.dc.html'
        open(os.path.join(proj, f), 'w').write(page(f'{label} {t}', b))
        c['boards'][f] = {"x": i * 1160, "y": 0, "w": 1080, "h": 1350, "title": t, "page": pid}
        if f not in c['order']: c['order'].append(f)
        files.append(f)
    c.setdefault('notes', {})[f'cap{key}'] = {"x": 5 * 1160, "y": 0, "w": 900, "size": "m", "fill": "orange", "page": pid, "text": spec.get('caption', '')}
    c['notes'][f't{key}'] = {"x": 0, "y": -300, "text": spec.get('title') or f'{label} 오늘의 캐러셀', "kind": "title1", "maxW": 5600, "page": pid}
    c['launch'] = {"view": "canvas", "page": pid}
    json.dump(c, open(cpath, 'w'), ensure_ascii=False, indent=1)
    print(json.dumps({"files": ["project/" + f for f in files], "page": pid}, ensure_ascii=False))

if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
