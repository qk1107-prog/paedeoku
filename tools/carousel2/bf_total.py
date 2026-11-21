import asyncio, base64, os
from playwright.async_api import async_playwright

D = os.path.dirname(os.path.abspath(__file__))
def b64(p, mime='image/png'): return f'data:{mime};base64,' + base64.b64encode(open(p, 'rb').read()).decode()
BOX = b64(os.path.join(D, 'box_open.png')); BOXF = b64(os.path.join(D, 'box_front.png'))
W2 = os.path.join(D, 'node_modules/pretendard/dist/web/static/woff2')
FF = ''.join(f"@font-face{{font-family:P;font-weight:{w};src:url({b64(os.path.join(W2, f'Pretendard-{n}.woff2'), 'font/woff2')})}}" for w, n in [(500, 'Medium'), (600, 'SemiBold'), (700, 'Bold'), (800, 'ExtraBold'), (900, 'Black')])

LAV, LAV2, LAVL, PINK, RED, YEL, INK, GRAY = '#5B5BF0', '#8B7CFF', '#ECE8FF', '#FFDDE8', '#F0453A', '#FFE14D', '#16151C', '#6E6C80'
CSS = f"""<style>{FF}
*{{margin:0;padding:0;box-sizing:border-box}}
body{{width:1080px;height:1350px;overflow:hidden;font-family:P,'Noto Sans CJK KR',sans-serif;color:{INK};-webkit-font-smoothing:antialiased}}
.pg{{position:relative;width:1080px;height:1350px;overflow:hidden;background:#FBFAFF;background-image:radial-gradient(#DAD5F5 2px,transparent 2px);background-size:36px 36px}}
.myo{{font-family:'Noto Serif CJK KR',serif;font-weight:900}}
.logo{{position:absolute;left:64px;top:56px;display:flex;align-items:center;gap:12px;font-size:30px;font-weight:800;letter-spacing:-0.5px}}
.logo img{{width:56px}}
.pgno{{position:absolute;right:64px;top:64px;font-size:26px;font-weight:700;color:{GRAY};letter-spacing:2px}}
.chip{{display:inline-block;background:{INK};color:#fff;font-size:28px;font-weight:800;padding:12px 26px;border-radius:999px;letter-spacing:-0.3px}}
.h{{font-size:84px;line-height:1.18;letter-spacing:-3px}}
.hl{{background:linear-gradient(transparent 58%,{YEL} 58%,{YEL} 92%,transparent 92%);padding:0 6px}}
.stamp{{position:absolute;background:{RED};color:#fff;font-weight:900;border-radius:14px;box-shadow:0 10px 0 rgba(0,0,0,.12)}}
.stk{{position:absolute;background:#fff;border:4px solid {INK};font-weight:800;border-radius:14px;box-shadow:6px 6px 0 {INK}}}
.bub{{position:absolute;background:#fff;border:4px solid {INK};border-radius:28px;padding:20px 30px;font-size:34px;font-weight:800;letter-spacing:-0.8px;white-space:nowrap}}
.bub:after{{content:'';position:absolute;width:26px;height:26px;background:#fff;border-right:4px solid {INK};border-bottom:4px solid {INK};bottom:-17px;right:70px;transform:rotate(45deg)}}
.card{{background:#fff;border:4px solid {INK};border-radius:28px;box-shadow:8px 8px 0 {INK}}}
.foot{{position:absolute;left:64px;bottom:52px;font-size:24px;font-weight:600;color:{GRAY}}}
</style>"""

def frame(no, body, foot=''):
    return f'<div class="pg"><div class="logo"><img src="{BOXF}">패더쿠</div><div class="pgno">{no} / 05</div>{body}<div class="foot">{foot}</div></div>'

def mascot(x, y, w, say, flip=False):
    tail = 'right:70px' if not flip else 'left:70px'
    return (f'<img src="{BOX}" style="position:absolute;left:{x}px;top:{y}px;width:{w}px">'
            f'<div class="bub" style="left:{x - 150 if not flip else x + 40}px;top:{y - 110}px"><span>{say}</span></div>'
            f'<style>.bub:after{{{tail}}}</style>')

S = []
# 1 표지
S.append(f'''<div class="pg" style="background-color:{LAVL};background-image:radial-gradient(#D3CCFA 2px,transparent 2px)">
<div class="logo"><img src="{BOXF}">패더쿠</div>
<div class="stk" style="left:64px;top:190px;font-size:34px;padding:14px 26px;transform:rotate(-3deg)">26 겨울 무진장 · 11.20 – 12.2</div>
<div style="position:absolute;left:64px;top:300px">
  <p class="myo" style="font-size:168px;line-height:1.05;letter-spacing:-8px">무신사<br>블프</p>
  <p class="myo" style="font-size:168px;line-height:1.05;letter-spacing:-8px;color:{LAV}"><span class="hl" style="padding:0 10px">총정리</span></p>
</div>
<div class="stamp" style="right:60px;top:240px;font-size:36px;padding:16px 26px;transform:rotate(7deg);white-space:nowrap">무신사 고인물의 정리</div>
<div class="card" style="position:absolute;left:64px;top:880px;width:290px;padding:24px 28px;transform:rotate(-4deg)">
  <p style="font-size:24px;font-weight:700;color:{GRAY}">일정</p><p style="font-size:40px;font-weight:900;letter-spacing:-1px;margin-top:6px">11.20 – 12.2</p></div>
<div class="card" style="position:absolute;left:350px;top:930px;width:270px;padding:24px 28px;transform:rotate(3deg);background:{YEL}">
  <p style="font-size:24px;font-weight:700">쿠폰</p><p style="font-size:40px;font-weight:900;letter-spacing:-1px;margin-top:6px">최대 30%</p></div>
<div class="card" style="position:absolute;left:150px;top:1060px;width:330px;padding:24px 28px;transform:rotate(-2deg);background:{RED};color:#fff">
  <p style="font-size:24px;font-weight:700;opacity:.9">시그니처특가 할인율</p><p style="font-size:44px;font-weight:900;letter-spacing:-1px;margin-top:6px">최대 69%</p></div>
<img src="{BOX}" style="position:absolute;right:40px;bottom:130px;width:360px">
<div class="bub" style="right:220px;bottom:500px">이거 하나면 끝!</div>
<div style="position:absolute;left:64px;bottom:60px;font-size:30px;font-weight:800;color:{LAV}">일정 · 회차 · 쿠폰 · 꿀팁 한 번에 →</div>
</div>''')

# 2 일정 = 회차 카드 + 날짜별 할인 브랜드 (달력 없이)
def rcard(date, title, brands, bg='#fff', fg=INK, dbg=LAVL, dfg=INK, tag='', tagc=RED):
    t = f'<span style="position:absolute;right:26px;top:-20px;background:{tagc};color:#fff;font-size:24px;font-weight:900;padding:6px 16px;border-radius:999px;transform:rotate(3deg)">{tag}</span>' if tag else ''
    return f'''<div class="card" style="position:relative;display:flex;align-items:center;gap:26px;padding:14px 26px;background:{bg};color:{fg}">{t}
<span style="flex:none;width:200px;text-align:center;background:{dbg};color:{dfg};border:3px solid {INK};border-radius:14px;padding:12px 0;font-size:28px;font-weight:900;letter-spacing:-0.5px">{date}</span>
<div style="min-width:0"><p style="font-size:38px;font-weight:900;letter-spacing:-1.5px;white-space:nowrap">{title}</p>
<p style="font-size:24px;font-weight:600;opacity:.75;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{brands}</p></div></div>'''

RC = ''.join([
    rcard('11.20 – 21', '티징 · 쿠폰부터 받기', '프리 오픈 쿠폰팩 최대 30% · 장바구니 쿠폰 최대 25%', bg=YEL, dbg='#fff'),
    rcard('11.22 – 24', '1회차 아우터 · 킥스', '나이키 최대 55%+20% 쿠폰 · 노스페이스 · 마뗑킴 · 수아레 · 어그', bg=LAV, fg='#fff', tag='아우터는 이때'),
    rcard('11.25 – 27', '2회차 상의 · 하의', '미쏘 · 아크테릭스 · 마시모두띠 · 에트오소메 · 로긴 앤 로지'),
    rcard('11.28 – 29', '3회차 뷰티 · 잡화', '클리오 · 페리페라 · 나스 · 엠엘비 · 락피쉬웨더웨어'),
    rcard('11.30 – 12.1', '4회차 무료배송 · 무탠다드', '무신사 스탠다드 우먼 · 트릴리온 · 리 · 세컨드솔트'),
    rcard('12.2', '파이널 앙코르 아우터 · 킥스', '1회차 놓친 아우터 · 신발 마지막 기회 + 하루특가', bg=INK, fg='#fff', dbg=YEL, tag='마지막', tagc=LAV),
])
S.append(frame('01', f'''
<div style="position:absolute;left:64px;top:150px"><span class="chip">01 · 일정</span>
<p class="myo h" style="margin-top:26px">언제, <span class="hl">뭐가</span> 싸요?</p></div>
<img src="{BOX}" style="position:absolute;right:60px;top:150px;width:220px">
<div class="bub" style="right:250px;top:150px;font-size:30px">본편은 22일 저녁 7시!</div>
<div style="position:absolute;left:64px;right:64px;top:385px;display:flex;flex-direction:column;gap:18px">{RC}</div>
<div class="stk" style="left:64px;top:1225px;font-size:28px;padding:10px 22px;transform:rotate(-1.5deg);background:{YEL}">TIP · 하루특가 11.22 · 11.27 · 12.2 는 그날 밤 12시면 끝</div>
'''))

# 4 티징 쿠폰
def ticket(top, big, sub, bg=f'#fff', fg=INK, tag=''):
    t = f'<span style="position:absolute;right:30px;top:-24px;background:{RED};color:#fff;font-size:26px;font-weight:900;padding:8px 18px;border-radius:999px;transform:rotate(4deg)">{tag}</span>' if tag else ''
    return f'''<div class="card" style="position:relative;display:flex;align-items:center;background:{bg};color:{fg};height:190px;overflow:visible">{t}
<div style="flex:1;padding:0 40px"><p style="font-size:28px;font-weight:700;opacity:.75">{top}</p><p style="font-size:64px;font-weight:900;letter-spacing:-2px;margin-top:4px">{big}</p></div>
<div style="width:0;height:150px;border-left:4px dashed {fg};opacity:.5"></div>
<div style="width:250px;padding:0 30px;font-size:28px;font-weight:800;line-height:1.35">{sub}</div></div>'''
S.append(frame('02', f'''
<div style="position:absolute;left:64px;top:150px"><span class="chip">02 · 지금 받을 쿠폰</span>
<p class="myo h" style="margin-top:26px">본편 전에<br><span class="hl">쿠폰부터</span> 챙기기</p></div>
<div style="position:absolute;left:64px;right:64px;top:540px;display:flex;flex-direction:column;gap:40px">
{ticket('프리 오픈 쿠폰팩', '최대 30%', '무신사<br>쿠폰함에서')}
{ticket('장바구니 쿠폰', '최대 25%', '담아둔 상품에<br>바로 적용', bg=YEL)}
{ticket('카운트다운 선착순', '20% 쿠폰', '오늘(11/21)<br>저녁 7시', bg=LAV, fg='#fff', tag='선착순')}
</div>
<div class="stamp" style="right:64px;top:180px;font-size:36px;padding:14px 24px;transform:rotate(6deg)">티징 이틀만!</div>
'''))

# 5 본편 하이라이트
def hi(no, t, lines, bg='#fff', fg=INK):
    return f'''<div class="card" style="background:{bg};color:{fg};padding:30px 32px;height:330px;display:flex;flex-direction:column">
<p style="font-size:26px;font-weight:800;opacity:.6">{no}</p><p style="font-size:46px;font-weight:900;letter-spacing:-1.5px;margin-top:6px">{t}</p>
<p style="font-size:29px;font-weight:600;line-height:1.45;margin-top:auto;opacity:.9">{lines}</p></div>'''
S.append(frame('03', f'''
<div style="position:absolute;left:64px;top:150px"><span class="chip">03 · 본편에 열리는 것</span>
<p class="myo h" style="margin-top:26px">22일 저녁 7시,<br>이게 <span class="hl">한꺼번에</span> 열려요</p></div>
<div style="position:absolute;left:64px;right:64px;top:540px;display:grid;grid-template-columns:1fr 1fr;gap:28px">
{hi('A', '시그니처특가', '블프 내내 이 가격<br>1,200여 개 · 40~69% 구간 최다', bg=INK, fg='#fff')}
{hi('B', '브랜드데이', '회차마다 브랜드가 바뀌어요<br>나이키 최대 55%+20% 쿠폰', bg=YEL)}
{hi('C', '하루특가', '11.22 · 11.27 · 12.2<br>그날 밤 12시면 끝')}
{hi('D', '라이브', '저녁 7~9시<br>라이브 중에만 받는 쿠폰', bg=LAV, fg='#fff')}
</div>
<img src="{BOX}" style="position:absolute;right:60px;top:170px;width:200px">
'''))

# 6 꿀팁 체크리스트
TIPS = [('오늘 쿠폰 미리 받아두기', '쿠폰팩·장바구니 쿠폰은 티징 때만'), ('사고 싶은 건 장바구니에', '인기 사이즈는 오픈하자마자 품절'), ('회차 바뀌는 날 쿠폰함 다시 열기', '11.22 · 25 · 28 · 30 · 12.2'), ('할인가 말고 쿠폰 적용가 보기', '같은 할인율이어도 쿠폰 따라 가격 달라요'), ('놓쳤으면 12.2 파이널', '앙코르 아우터·킥스 + 하루특가')]
tips = ''.join(f'''<div style="display:flex;gap:26px;align-items:flex-start;padding:26px 0;border-bottom:3px dashed #D8D4EA">
<span style="flex:none;width:58px;height:58px;border-radius:14px;border:4px solid {INK};background:{YEL if i < 2 else "#fff"};display:flex;align-items:center;justify-content:center;font-size:40px;font-weight:900;color:{INK}">✓</span>
<div><p style="font-size:42px;font-weight:900;letter-spacing:-1.5px">{a}</p><p style="font-size:28px;font-weight:600;color:{GRAY};margin-top:6px">{b}</p></div></div>''' for i, (a, b) in enumerate(TIPS))
S.append(frame('04', f'''
<div style="position:absolute;left:64px;top:150px"><span class="chip">04 · 패더쿠 꿀팁</span>
<p class="myo h" style="margin-top:26px">이렇게 사면<br><span class="hl">제일 싸요</span></p></div>
<div class="stamp" style="right:64px;top:200px;font-size:40px;padding:16px 26px;transform:rotate(-6deg)">속지 마세요</div>
<div class="card" style="position:absolute;left:64px;right:64px;top:520px;padding:6px 40px 10px">{tips}</div>
'''))

# 7 패더쿠의 옷장 안내 (실제 사이트 캡처)
SH = {k: b64(os.path.join(D, 'shots', k + '.png')) for k in ['lineup', 'coupon', 'daily']}
def shot(src, w, x, y, r, label, lc=LAV):
    return (f'<div style="position:absolute;left:{x}px;top:{y}px;width:{w}px;transform:rotate({r}deg)">'
            f'<img src="{src}" style="width:100%;display:block;border:4px solid {INK};border-radius:22px;box-shadow:8px 8px 0 {INK}">'
            f'<span style="position:absolute;left:-12px;top:-22px;background:{lc};color:#fff;font-size:26px;font-weight:900;padding:8px 18px;border-radius:999px;border:3px solid {INK}">{label}</span></div>')
S.append(frame('05', f'''
<div style="position:absolute;left:64px;top:140px"><span class="chip">05 · 할인템 모아보기</span>
<p class="myo" style="margin-top:22px;font-size:68px;line-height:1.16;letter-spacing:-2.5px">매일 바뀌는 할인템은<br><span class="hl">패더쿠의 옷장</span>에</p></div>
{shot(SH['lineup'], 500, 56, 440, -3, '지금 많이 담는 템')}
{shot(SH['coupon'], 480, 548, 460, 3, '실시간 쿠폰', RED)}
{shot(SH['daily'], 640, 60, 950, -1.5, '7시 공개 특가', INK)}
<img src="{BOX}" style="position:absolute;right:56px;top:1010px;width:220px">
<div class="bub" style="right:60px;top:870px">프로필 링크에서!</div>
'''))

# 8 마무리
S.append(f'''<div style="width:1080px;height:1350px;background:{LAVL};display:flex;flex-direction:column;align-items:center;justify-content:center">
<img src="{BOX}" style="width:470px"><p style="margin-top:70px;font-size:120px;font-weight:900;letter-spacing:-4px">패더쿠</p>
<p style="margin-top:26px;font-size:40px;font-weight:500;letter-spacing:-1px;color:{LAV}">패션 덕후가 매일 채우는 할인 박스</p></div>''')

async def main():
    os.makedirs(os.path.join(D, 'bf'), exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={'width': 1080, 'height': 1350})
        for i, h in enumerate(S, 1):
            await pg.set_content(CSS + h); await pg.wait_for_timeout(300)
            await pg.screenshot(path=os.path.join(D, 'bf', f'블프총정리_{i}.png'))
        await b.close()
asyncio.run(main())
