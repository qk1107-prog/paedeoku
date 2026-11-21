# 표지 템플릿: 안쪽 장 미리보기 콜라주 + 후킹 제목 (nsteady 정리형 레퍼런스) — 할인템 캐러셀에도 그대로 재사용
import asyncio, base64, os, sys
from playwright.async_api import async_playwright
D = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, D)
def b64(p, mime='image/png'): return f'data:{mime};base64,' + base64.b64encode(open(p, 'rb').read()).decode()
W2 = os.path.join(D, 'node_modules/pretendard/dist/web/static/woff2')
FF = ''.join(f"@font-face{{font-family:P;font-weight:{w};src:url({b64(os.path.join(W2, f'Pretendard-{n}.woff2'), 'font/woff2')})}}" for w, n in [(500, 'Medium'), (700, 'Bold'), (800, 'ExtraBold'), (900, 'Black')])
BOXF = b64(os.path.join(D, 'box_front.png'))
LAV, LAVL, RED, YEL, INK = '#5B5BF0', '#ECE8FF', '#F0453A', '#FFE14D', '#16151C'
CSS = f"<style>{FF}*{{margin:0;padding:0;box-sizing:border-box}}body{{width:1080px;height:1350px;overflow:hidden;font-family:P,sans-serif;color:{INK}}}.myo{{font-family:'Noto Serif CJK KR',serif;font-weight:900}}</style>"

def thumbs(paths):
    return [b64(p) for p in paths]

def cover_grid(T, l1, l2, sub, stamp='', tint='dark'):
    # A/B: 안쪽 장 3x2 콜라주 + 아래쪽 그라데이션 + 큰 제목
    cells = ''.join(f'<div style="border-radius:18px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,.18)"><img src="{t}" style="width:100%;display:block"></div>' for t in T[:6])
    grad = 'linear-gradient(180deg,rgba(22,21,28,0) 28%,rgba(22,21,28,.72) 52%,rgba(22,21,28,.96) 72%)' if tint == 'dark' else 'linear-gradient(180deg,rgba(236,232,255,0) 26%,rgba(236,232,255,.85) 50%,#ECE8FF 66%)'
    fg = '#fff' if tint == 'dark' else INK
    st = f'<div style="position:absolute;right:60px;top:740px;background:{RED};color:#fff;font-size:40px;font-weight:900;padding:14px 26px;border-radius:14px;transform:rotate(6deg);box-shadow:0 8px 0 rgba(0,0,0,.15)">{stamp}</div>' if stamp else ''
    return f'''<div style="position:relative;width:1080px;height:1350px;background:{LAVL if tint != 'dark' else '#F3F1FA'};overflow:hidden">
<div style="position:absolute;left:-20px;right:-20px;top:20px;display:grid;grid-template-columns:repeat(3,1fr);gap:18px;transform:rotate(-4deg)">{cells}</div>
<div style="position:absolute;inset:0;background:{grad}"></div>
<div style="position:absolute;left:56px;top:48px;display:flex;align-items:center;gap:10px;background:#fff;border-radius:999px;padding:8px 20px 8px 10px;font-size:28px;font-weight:800;box-shadow:0 4px 14px rgba(0,0,0,.15)"><img src="{BOXF}" style="width:44px">패더쿠</div>
{st}
<div style="position:absolute;left:64px;right:64px;bottom:120px;color:{fg}">
<p class="myo" style="font-size:112px;line-height:1.12;letter-spacing:-5px">{l1}<br><span style="{('background:'+YEL+';color:'+INK+';padding:0 16px;border-radius:10px;box-decoration-break:clone') if tint == 'dark' else ('background:linear-gradient(transparent 60%,'+YEL+' 60%,'+YEL+' 92%,transparent 92%);padding:0 8px')}">{l2}</span></p>
<p style="margin-top:34px;font-size:38px;font-weight:700;letter-spacing:-1px;opacity:.92">{sub}</p></div></div>'''

def cover_fan(T, l1, l2, sub, stamp=''):
    # C: 카드 세 장 부채꼴 + 아래 제목
    pos = [(-12, 40, 160), (0, 330, 110), (12, 620, 160)]
    cards = ''.join(f'<img src="{T[i]}" style="position:absolute;left:{x}px;top:{y}px;width:420px;border-radius:22px;border:4px solid {INK};box-shadow:10px 10px 0 {INK};transform:rotate({r}deg)">' for i, (r, x, y) in enumerate(pos))
    st = f'<div style="position:absolute;right:56px;top:60px;background:{RED};color:#fff;font-size:40px;font-weight:900;padding:14px 26px;border-radius:14px;transform:rotate(6deg);z-index:3">{stamp}</div>' if stamp else ''
    return f'''<div style="position:relative;width:1080px;height:1350px;background:{LAVL};background-image:radial-gradient(#D3CCFA 2px,transparent 2px);background-size:36px 36px;overflow:hidden">
<div style="position:absolute;left:56px;top:48px;display:flex;align-items:center;gap:10px;font-size:30px;font-weight:800;z-index:3"><img src="{BOXF}" style="width:50px">패더쿠</div>{st}
{cards}
<div style="position:absolute;left:0;right:0;bottom:0;height:560px;background:linear-gradient(180deg,rgba(236,232,255,0),#ECE8FF 30%)"></div>
<div style="position:absolute;left:64px;right:64px;bottom:110px">
<p class="myo" style="font-size:112px;line-height:1.12;letter-spacing:-5px">{l1}<br><span style="background:linear-gradient(transparent 60%,{YEL} 60%,{YEL} 92%,transparent 92%);padding:0 8px;color:{LAV}">{l2}</span></p>
<p style="margin-top:30px;font-size:38px;font-weight:700;letter-spacing:-1px;color:#4A4860">{sub}</p></div></div>'''

async def render(pages, outdir):
    os.makedirs(outdir, exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={'width': 1080, 'height': 1350})
        for name, h in pages:
            await pg.set_content(CSS + h); await pg.wait_for_timeout(300)
            await pg.screenshot(path=os.path.join(outdir, name + '.png'))
        await b.close()

if __name__ == '__main__':
    inner = [os.path.join(D, 'bf', f'블프총정리_{i}.png') for i in [2, 3, 4, 5, 6, 7]]
    T = thumbs(inner)
    pages = [
        ('표지A_정리형_다크', cover_grid(T, '무신사 블프', '모르면 손해 6가지', '1분만 보면 블프 쇼핑 실패할 일 없어요 :)', stamp='저장 필수')),
        ('표지B_정리형_라벤더', cover_grid(T, '무신사 블프', '총정리, 이것만 저장', '일정 · 회차 · 쿠폰 · 꿀팁까지 한 번에', stamp='속지 마세요', tint='lav')),
        ('표지C_카드펼침', cover_fan([T[0], T[2], T[4]], '무신사 블프', '이것만 보면 끝', '일정부터 쿠폰 받는 법까지 6장 정리', stamp='저장 필수')),
    ]
    asyncio.run(render(pages, os.path.join(D, 'covers')))
