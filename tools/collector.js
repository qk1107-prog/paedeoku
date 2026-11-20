// 패더쿠 데이터 수집기 — 크롬의 무신사 탭(www.musinsa.com, 큐레이터 로그인 상태)에서 실행
// 1) 여성 랭킹(카테고리×나이대, 분위기, 실시간) 수집 → 2) 가격·할인율 → 3) 큐레이터 링크 생성
// 결과: window.__pdkz (압축 JSON 문자열). sink.js 가 띄운 관리자 창으로 postMessage 해서 site_data(id='pdk')에 저장
(async () => {
  const BAD = /하이큐|진격|산리오|헬로키티|포켓몬|짱구|디즈니|마블|키즈|KIDS|\[진|헌터|주술|원피스\]|귀멸|체인소/;
  const get = async (sec, cat, age, period = 'WEEKLY') => {
    const u = `https://client.musinsa.com/api/home/web/v5/pans/ranking/sections/${sec}?storeCode=musinsa&gf=F&ageBand=${age}&period=${period}&categoryCode=${cat}&contentsId=&page=1&size=60`;
    try {
      const j = await (await fetch(u, { credentials: 'include' })).json(); const items = [];
      const walk = (o) => { if (Array.isArray(o)) o.forEach(walk); else if (o && typeof o === 'object') { if (o.type === 'PRODUCT_COLUMN') { const i = o.info || {}; items.push({ id: String(o.id), img: o.image && o.image.url, b: i.brandName, n: i.productName }); return; } for (const k in o) walk(o[k]); } };
      walk(j.data); return items;
    } catch (e) { return []; }
  };
  const CATS = { '002': '아우터', '001': '상의', '003': '바지', '100': '스커트·원피스', '103': '신발', '004': '가방', '101': '소품' };
  const AGES = { '10대': ['AGE_BAND_MINOR'], '20대': ['AGE_BAND_20', 'AGE_BAND_25'], '30대': ['AGE_BAND_30', 'AGE_BAND_35'] };
  const MOOD = { '202': '캐주얼', '203': '스트릿', '301': '걸리시', '205': '미니멀', '209': '포멀' };
  const raw = { cats: {}, mood: {}, all: [] }; const jobs = [];
  for (const c in CATS) for (const a in AGES) for (const ab of AGES[a]) jobs.push(['c', c, a, ab]);
  for (const m in MOOD) jobs.push(['m', m, MOOD[m], 'AGE_BAND_20']);
  jobs.push(['a', '000', 'all', 'AGE_BAND_ALL']);
  for (let i = 0; i < jobs.length; i += 6) await Promise.all(jobs.slice(i, i + 6).map(async ([t, k, a, ab]) => {
    const it = t === 'm' ? await get(k, '000', ab) : await get(200, k, ab, t === 'a' ? 'REALTIME' : 'WEEKLY');
    if (t === 'c') { const key = k + '|' + a; raw.cats[key] = (raw.cats[key] || []).concat(it); } else if (t === 'm') raw.mood[a] = it; else raw.all = it;
  }));
  const info = {};
  const ids0 = [...new Set([].concat(...Object.values(raw.cats), ...Object.values(raw.mood), raw.all).map((x) => x.id))];
  for (let i = 0; i < ids0.length; i += 30) { try { const j = await (await fetch('https://content.musinsa.com/api2/content/magazine-misc/v1/goods?saleStates=SALE,SOLD_OUT&goodsIds=' + ids0.slice(i, i + 30).join(',') + '&sort=RANK&tabId=default&gf=A', { credentials: 'include' })).json(); ((j.data && (j.data.list || j.data.goods)) || []).forEach((g) => (info[String(g.goodsNo)] = g)); } catch (e) {} }
  const mk = (x) => { const f = info[x.id] || {}; return { id: x.id, b: x.b || f.brandName, n: x.n || f.goodsName, img: String(x.img || f.thumbnail || '').replace('https://image.msscdn.net', ''), p: f.price || null, o: f.normalPrice || null, r: f.saleRate || 0, rv: f.reviewCount || 0, so: !!f.isSoldOut }; };
  const clean = (arr) => { const s = new Set(); return arr.map(mk).filter((x) => x.n && !x.so && !BAD.test(x.n + ' ' + x.b) && !s.has(x.id) && s.add(x.id)); };
  const out = { cats: {}, mood: {}, today: [], hot: [] };
  for (const k in raw.cats) { const [c, a] = k.split('|'); out.cats[CATS[c] + '|' + a] = clean(raw.cats[k]).slice(0, 18); }
  for (const m in raw.mood) { const l = clean(raw.mood[m]).slice(0, 18); if (l.length >= 8) out.mood[m] = l; }
  const pool = clean([].concat(raw.all, ...Object.values(raw.cats)));
  out.hot = clean(raw.all).slice(0, 12);
  out.today = pool.filter((x) => x.r >= 30 && x.rv >= 20).sort((a, b) => (b.r + Math.log10(b.rv + 1) * 8) - (a.r + Math.log10(a.rv + 1) * 8)).slice(0, 30);
  const need = [...new Set([].concat(...Object.values(out.cats), ...Object.values(out.mood), out.today, out.hot).map((x) => x.id))];
  let cache = {}; try { cache = JSON.parse(localStorage.getItem('mdcpLinks') || '{}'); } catch (e) {}
  for (let i = 0; i < need.length; i += 15) await Promise.all(need.slice(i, i + 15).filter((id) => !cache[id]).map(async (id) => { try { const l = await (await fetch('https://api.one.musinsa.com/api2/affiliate/v2/link/product/' + id, { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-Platform': 'MUSINSA' }, body: '{}', credentials: 'include' })).json(); if (l.data && l.data.link && /^https:\/\/www\.musinsa\.com\/curator\/goods\/[A-Za-z0-9]+$/.test(l.data.link)) cache[id] = l.data.link.replace('https://www.musinsa.com/curator/goods/', ''); } catch (e) {} }));
  try { localStorage.setItem('mdcpLinks', JSON.stringify(cache)); } catch (e) {}
  // 압축: P[id] = [브랜드, 이름, 이미지(날짜_해시), 가격, 할인율, 큐레이터코드, 정가]
  const P = {};
  const im = (x) => { const m = x.img.match(/^\/images\/(goods_img|prd_img)\/(\d{8})\/\d+\/(detail_)?\d+_(\d+)_500\.(\w+)$/); if (!m) return x.img; return (m[1] === 'prd_img' ? 'p' : '') + m[2] + '_' + m[4] + (m[5] !== 'jpg' ? '.' + m[5] : ''); };
  const ids = (a) => a.filter((x) => cache[x.id]).map((x) => { if (!P[x.id]) P[x.id] = [x.b, x.n.replace(/\s+/g, ' ').replace(/_[A-Z0-9]{8,}.*$/, '').slice(0, 32), im(x), x.p, x.r, cache[x.id], x.o]; return x.id; });
  const z = { at: new Date().toISOString(), P, cats: {}, mood: {}, today: ids(out.today), hot: ids(out.hot) };
  for (const k in out.cats) z.cats[k] = ids(out.cats[k]);
  for (const k in out.mood) z.mood[k] = ids(out.mood[k]);
  window.__pdkz = JSON.stringify(z);
  document.title = '수집 완료 ' + Object.keys(P).length;
})();
