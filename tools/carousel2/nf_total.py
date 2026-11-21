# 노스페이스 쿠폰 캐러셀 (블프 총정리와 같은 디자인 시스템)
import asyncio, os
D = os.path.dirname(os.path.abspath(__file__))
_src = open(os.path.join(D, 'bf_total.py'), encoding='utf-8').read()
exec(_src[:_src.index('S = []')])  # 폰트·색·CSS·frame·b64·BOX 불러오기

def frame(no, body, foot=''):
    return f'<div class="pg"><div class="logo"><img src="{BOXF}">패더쿠</div><div class="pgno">{no} / 03</div>{body}</div>'

def img(i): return b64(os.path.join(D, 'nf', f'{i}.jpg'), 'image/jpeg')
won = lambda n: f'{n:,}원'
PG = '#F6F6F6'

PAD = [('5443260', '에이블 파카', 64, 107280, 299000, '공용'), ('7601178', '클라우드 하이브리드 다운', 58, 183200, 439000, ''),
       ('5890265', '레인보우 다운', 57, 167680, 388000, ''), ('5683416', '다이아몬드 다운', 57, 159040, 368000, ''),
       ('5683390', '플로티 다운', 54, 168980, 368000, ''), ('5736381', '클라우드 다운 코트', 54, 200000, 439000, '')]
JKT = [('5006916', '엘더 자켓', 64, 56880, 159000, ''), ('6475681', '에어시프트 자켓', 60, 67150, 169000, ''),
       ('6065760', '칠러 파카', 58, 75650, 179000, ''), ('6113435', '슬라이트 후디 자켓', 57, 55760, 129000, ''),
       ('4812160', '1994 마운틴 화이트라벨', 57, 80640, 188000, '공용'), ('5736303', '테디 플리스 가디건', 52, 75740, 159000, '공용')]
MAXP = max(x[2] for x in PAD + JKT)

ARROW = f'''<div style="position:absolute;right:0;top:{{top}}px;height:130px;display:flex;align-items:center;gap:12px;background:{INK};color:#fff;border-radius:65px 0 0 65px;padding:0 30px 0 40px;box-shadow:0 10px 0 rgba(0,0,0,.12);z-index:5">
 <span style="font-size:30px;font-weight:900;line-height:1.2">{{a}}<br><span style="color:{YEL}">{{b}}</span></span><span style="font-size:76px;font-weight:900;color:{YEL};line-height:1">›</span></div>'''

def card(it, rank):
    i, nm, p, cp, pr, tag = it
    t = f'<span style="position:absolute;right:12px;top:12px;background:#fff;border:3px solid {INK};font-size:20px;font-weight:800;padding:3px 10px;border-radius:999px">{tag}</span>' if tag else ''
    return f'''<div class="card" style="position:relative;background:#fff;overflow:hidden;padding:0;display:flex;flex-direction:column">
<div style="position:relative;background:{PG};height:265px;display:flex;align-items:center;justify-content:center;border-bottom:3px solid {INK}">
<img src="{img(i)}" style="height:100%;object-fit:contain">
<span style="position:absolute;left:12px;top:12px;background:{RED};color:#fff;font-size:30px;font-weight:900;padding:4px 14px;border-radius:12px">{p}%</span>{t}</div>
<div style="padding:16px 18px 18px">
<p style="font-size:25px;font-weight:800;letter-spacing:-0.8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{nm}</p>
<p style="font-size:20px;font-weight:600;color:{GRAY};text-decoration:line-through;margin-top:6px">{won(pr)}</p>
<p style="font-size:30px;font-weight:900;letter-spacing:-1px;color:{LAV};margin-top:2px"><span style="font-size:20px;font-weight:800;color:{INK};margin-right:6px">쿠폰가</span>{won(cp)}</p></div></div>'''

S = []
# 1 표지
HERO = img('5890265')
S.append(f'''<div class="pg" style="background-color:{LAVL};background-image:radial-gradient(#D3CCFA 2px,transparent 2px)">
<div class="logo"><img src="{BOXF}">패더쿠</div>
<div class="stamp" style="right:60px;top:52px;font-size:34px;padding:14px 24px;transform:rotate(5deg);white-space:nowrap">무신사 고인물의 정리</div>
<div class="stk" style="left:64px;top:170px;font-size:32px;padding:12px 24px;transform:rotate(-2deg)">무진장 프리오픈 쿠폰 · 본편 전까지만</div>
<p class="myo" style="position:absolute;left:58px;top:270px;font-size:150px;line-height:1.05;letter-spacing:-8px">노스페이스</p>
<p class="myo" style="position:absolute;left:64px;top:440px;font-size:96px;line-height:1.1;letter-spacing:-4px">지금 <span class="hl" style="color:{LAV};padding:0 10px">최대 {MAXP}%</span></p>
<div class="card" style="position:absolute;left:70px;top:620px;width:560px;height:560px;background:{PG};display:flex;align-items:center;justify-content:center;overflow:hidden;transform:rotate(-3deg)">
 <img src="{HERO}" style="height:100%;object-fit:contain"></div>
<div style="position:absolute;left:520px;top:650px;width:170px;height:170px;border-radius:50%;background:{RED};color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;transform:rotate(10deg);border:4px solid {INK};box-shadow:6px 6px 0 {INK}">
 <span style="font-size:26px;font-weight:800">쿠폰가</span><span style="font-size:52px;font-weight:900;letter-spacing:-2px;line-height:1">-57%</span></div>
<div class="stk" style="left:120px;top:1130px;font-size:28px;padding:10px 20px;transform:rotate(2deg);background:{YEL}">레인보우 다운 388,000원 → 167,680원</div>
{ARROW.format(top=760, a='12개 쿠폰가', b='넘겨서 보기')}
<img src="{BOX}" style="position:absolute;right:40px;top:930px;width:260px">
<div style="position:absolute;left:64px;bottom:52px;display:flex;gap:12px;font-size:26px;font-weight:800">
 <span style="background:#fff;border:3px solid {INK};border-radius:999px;padding:8px 18px">🔖 저장해두고</span>
 <span style="background:#fff;border:3px solid {INK};border-radius:999px;padding:8px 18px">📤 친구한테 공유</span></div>
</div>''')

def grid_page(no, chip, l1, l2, items, note):
    cells = ''.join(card(it, k) for k, it in enumerate(items))
    return frame(no, f'''
<div style="position:absolute;left:64px;top:140px"><span class="chip">{chip}</span>
<p class="myo" style="margin-top:20px;font-size:70px;line-height:1.15;letter-spacing:-2.5px">{l1} <span class="hl">{l2}</span></p></div>
<div style="position:absolute;left:56px;right:56px;top:310px;display:grid;grid-template-columns:repeat(3,1fr);gap:22px 20px">{cells}</div>
<div class="stk" style="left:64px;bottom:58px;font-size:28px;padding:10px 22px;transform:rotate(-1.5deg);background:{YEL}">{note}</div>''')

S.append(grid_page('01', '01 · 패딩 · 다운', '패딩은', '반값 아래로', PAD, '패딩 쿠폰은 본편(11/22 저녁 7시) 전까지만'))
S.append(grid_page('02', '02 · 자켓 · 플리스', '자켓·플리스', '5만원대부터', JKT, '봄까지 입는 바람막이·플리스도 같이 담기'))

# 4 쿠폰 받는 법
STEPS = [('1', '쿠폰함에서 노스페이스 쿠폰 받기', '20% · 15% · 5% 쿠폰이 따로 있어요. 세 개 다 받아두기'),
         ('2', '장바구니 쿠폰도 같이 받아두기', '프리오픈 장바구니 쿠폰 최대 25%도 쿠폰함에 있어요'),
         ('3', '결제창에서 쿠폰가 확인', '할인율보다 쿠폰 적용가가 진짜 가격이에요'),
         ('!', '오늘(11/22) 저녁 7시 본편 전까지만', '본편 열리면 프리오픈 쿠폰은 끝나요')]
st = ''.join(f'''<div style="display:flex;gap:26px;align-items:center;padding:24px 0;border-bottom:3px dashed #D8D4EA">
<span style="flex:none;width:70px;height:70px;border-radius:50%;border:4px solid {INK};background:{RED if a == '!' else (YEL if a == '1' else '#fff')};color:{'#fff' if a == '!' else INK};display:flex;align-items:center;justify-content:center;font-size:38px;font-weight:900">{a}</span>
<div><p style="font-size:40px;font-weight:900;letter-spacing:-1.5px">{b}</p><p style="font-size:27px;font-weight:600;color:{GRAY};margin-top:6px">{c}</p></div></div>''' for a, b, c in STEPS)
S.append(frame('03', f'''
<div style="position:absolute;left:64px;top:150px"><span class="chip">03 · 쿠폰 받는 법</span>
<p class="myo h" style="margin-top:26px">쿠폰 3개 받고<br><span class="hl">이 가격에 사기</span></p></div>
<div class="stamp" style="right:64px;top:190px;font-size:36px;padding:14px 24px;transform:rotate(6deg)">본편 전까지!</div>
<div class="card" style="position:absolute;left:64px;right:64px;top:540px;padding:4px 40px 8px">{st}</div>
<img src="{BOX}" style="position:absolute;right:60px;top:1110px;width:180px">
<div class="bub" style="right:250px;top:1140px;font-size:30px">노스페이스 108개 쿠폰가는 패더쿠의 옷장에!</div>
'''))

# 5 마무리
S.append(f'''<div style="width:1080px;height:1350px;background:{LAVL};display:flex;flex-direction:column;align-items:center;justify-content:center">
<img src="{BOX}" style="width:470px"><p style="margin-top:70px;font-size:120px;font-weight:900;letter-spacing:-4px">패더쿠</p>
<p style="margin-top:26px;font-size:40px;font-weight:500;letter-spacing:-1px;color:{LAV}">패션 덕후가 매일 채우는 할인 박스</p></div>''')

async def main():
    from playwright.async_api import async_playwright
    out = os.path.join(D, 'nfout'); os.makedirs(out, exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={'width': 1080, 'height': 1350})
        for i, h in enumerate(S, 1):
            await pg.set_content(CSS + h); await pg.wait_for_timeout(300)
            await pg.screenshot(path=os.path.join(out, f'노스페이스_{i}.png'))
        await b.close()
asyncio.run(main())
