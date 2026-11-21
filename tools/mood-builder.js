// 패더쿠 분위기별: 분위기(캐주얼·걸리시·미니멀·스트릿·포멀) 안에서 카테고리별 TOP 20 (여성)
// 크롬 무신사 탭(큐레이터 로그인)에서 실행 → window.__pdkMood (배열), 탭 제목 "분위기 완료 N"
window.__pdkMoodRun = async () => {
  const MOOD = [['202', '캐주얼'], ['301', '걸리시'], ['205', '미니멀'], ['203', '스트릿'], ['209', '포멀']];
  const CATS = [['숏패딩', '002012'], ['롱패딩', '002013'], ['코트', '002007'], ['무스탕·퍼', '002025'], ['카디건', '002020'], ['니트', '001006'], ['맨투맨·후드', '001005'], ['데님', '003002'], ['원피스·스커트', '100'], ['부츠', '103002'], ['스니커즈', '103004'], ['가방', '004']];
  const BAD = /남성|\[MEN\]|맨즈|키즈|KIDS|레깅스|양말|속옷|브라|팬티/;
  const S = (window.__pdkMoodSt = { done: 0, total: MOOD.length * CATS.length });
  const info = {};
  const fetchInfo = async (ids) => { ids = ids.filter((id) => !info[id]); for (let i = 0; i < ids.length; i += 30) { try { const j = await (await fetch('https://content.musinsa.com/api2/content/magazine-misc/v1/goods?saleStates=SALE&goodsIds=' + ids.slice(i, i + 30).join(',') + '&sort=RANK&tabId=default&gf=A', { credentials: 'include' })).json(); ((j.data && (j.data.list || j.data.goods)) || []).forEach((g) => (info[String(g.goodsNo)] = g)); } catch (e) {} } };
  let cache = {}; try { cache = JSON.parse(localStorage.getItem('mdcpLinks') || '{}'); } catch (e) {}
  const link = async (ids) => { const need = ids.filter((id) => !cache[id]); for (let i = 0; i < need.length; i += 15) await Promise.all(need.slice(i, i + 15).map(async (id) => { try { const l = await (await fetch('https://api.one.musinsa.com/api2/affiliate/v2/link/product/' + id, { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-Platform': 'MUSINSA' }, body: '{}', credentials: 'include' })).json(); if (l.data && l.data.link && /^https:\/\/www\.musinsa\.com\/curator\/goods\/[A-Za-z0-9]+$/.test(l.data.link)) cache[id] = l.data.link.replace('https://www.musinsa.com/curator/goods/', ''); } catch (e) {} })); try { localStorage.setItem('mdcpLinks', JSON.stringify(cache)); } catch (e) {} };
  const img = (t) => { t = String(t || ''); return t.startsWith('http') ? t : 'https://image.msscdn.net' + t; };
  const item = (id) => { const f = info[id]; if (!f || !cache[id]) return null; return { i: id, brand: f.brandName, name: f.goodsName, img: img(f.thumbnail), link: 'https://www.musinsa.com/curator/goods/' + cache[id], price: f.normalPrice || f.price, sale: f.price, rate: f.saleRate || 0, rv: f.reviewCount || 0 }; };
  const rank = async (sec, cat) => { const ids = []; for (const age of ['AGE_BAND_20', 'AGE_BAND_25', 'AGE_BAND_30']) { try { const j = await (await fetch(`https://client.musinsa.com/api/home/web/v5/pans/ranking/sections/${sec}?storeCode=musinsa&gf=F&ageBand=${age}&period=WEEKLY&categoryCode=${cat}&contentsId=&page=1&size=40`, { credentials: 'include' })).json(); const walk = (o) => { if (Array.isArray(o)) o.forEach(walk); else if (o && typeof o === 'object') { if (o.type === 'PRODUCT_COLUMN') { ids.push(String(o.id)); return; } for (const k in o) walk(o[k]); } }; walk(j.data); } catch (e) {} } return [...new Set(ids)]; };
  const out = [];
  for (const [sec, mood] of MOOD) {
    const groups = [];
    await Promise.all(CATS.map(async ([cat, code], ci) => {
      const ids = await rank(sec, code); await fetchInfo(ids);
      const ok = ids.filter((id) => { const f = info[id]; return f && !f.isSoldOut && !/^M(EN)?$/.test(String(f.genderCode || '')) && !BAD.test((f.goodsName || '') + ' ' + (f.brandName || '')); }).slice(0, 24);
      await link(ok);
      const items = ok.map(item).filter(Boolean).slice(0, 20);
      if (items.length >= 6) groups[ci] = { cat, items };
      S.done++; document.title = `분위기 ${S.done}/${S.total}`;
    }));
    const g = groups.filter(Boolean);
    if (g.length) out.push({ mood, groups: g });
  }
  window.__pdkMood = out;
  document.title = '분위기 완료 ' + out.map((m) => m.mood + m.groups.length).join(' ');
};
window.__pdkMoodRun();
