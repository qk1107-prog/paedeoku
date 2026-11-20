// 패더쿠 '나이대별 브랜드' 데이터 만들기 — 크롬 무신사 탭(큐레이터 로그인)에서 실행
// 여성 랭킹(10대/20대/30대 × HOT·스타일별)에서 잘 팔리는 브랜드를 묶고, 상품마다 착샷 이미지를 고른다.
// 결과: window.__pdkBrands (JSON 문자열) → sink로 site_data id='pdk_brands' 저장
(async () => {
  const AGES = { '10대': ['AGE_BAND_MINOR'], '20대': ['AGE_BAND_20', 'AGE_BAND_25'], '30대': ['AGE_BAND_30', 'AGE_BAND_35'] };
  const STY = [['HOT', 200], ['캐주얼', 202], ['미니멀', 209], ['로맨틱', 206], ['걸코어', 207], ['스트릿', 203], ['시크', 210]];
  const MAX_BRANDS = 8, MAX_ITEMS = 8;
  const BAD = /키즈|KIDS|아동|주니어|레깅스|양말|삭스|스타킹|타이즈|속옷|브라렛|브래지어|팬티|언더웨어|파자마|잠옷|파우치|폰케이스|마스크팩|틴트|립스틱|립밤|쿠션|파운데이션|세럼|크림|로션|앰플|토너|선크림|클렌징|샴푸|향수|퍼퓸|네일|마스카라|아이섀도|블러셔|헤어|디퓨저|캔들|기프트카드/;
  const set = (t) => { document.title = '패더쿠 브랜드 ' + t; };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const pool = async (arr, n, fn) => { let i = 0; await Promise.all(Array.from({ length: n }, async () => { while (i < arr.length) { const k = i++; try { await fn(arr[k], k); } catch (e) {} } })); };

  // 1) 랭킹 수집
  const rank = async (sec, age) => {
    const j = await (await fetch(`https://client.musinsa.com/api/home/web/v5/pans/ranking/sections/${sec}?storeCode=musinsa&gf=F&ageBand=${age}&period=WEEKLY&categoryCode=000&contentsId=&page=1&size=100`, { credentials: 'include' })).json();
    const ids = []; const walk = (o) => { if (Array.isArray(o)) o.forEach(walk); else if (o && typeof o === 'object') { if (o.type === 'PRODUCT_COLUMN') { ids.push(String(o.id)); return; } for (const k in o) walk(o[k]); } };
    walk(j.data); return ids;
  };
  const R = {};
  for (const [age, bands] of Object.entries(AGES)) for (const [sty, sec] of STY) {
    let ids = [];
    for (const b of bands) { try { ids = ids.concat(await rank(sec, b)); } catch (e) {} }
    // 두 연령대를 번갈아 섞어서 순위 유지
    R[age + '|' + sty] = [...new Set(ids)];
    set('랭킹 ' + Object.keys(R).length);
  }

  // 2) 상품 정보
  const info = {};
  const all = [...new Set(Object.values(R).flat())];
  const chunks = []; for (let i = 0; i < all.length; i += 30) chunks.push(all.slice(i, i + 30));
  await pool(chunks, 4, async (c) => {
    const j = await (await fetch('https://content.musinsa.com/api2/content/magazine-misc/v1/goods?saleStates=SALE&goodsIds=' + c.join(',') + '&sort=RANK&tabId=default&gf=F', { credentials: 'include' })).json();
    ((j.data && (j.data.list || j.data.goods)) || []).forEach((g) => (info[String(g.goodsNo)] = g));
  });
  set('상품정보 ' + Object.keys(info).length);
  const ok = (id) => { const f = info[id]; return f && !f.isSoldOut && !/^M(EN)?$/.test(String(f.genderCode || '')) && !BAD.test((f.goodsName || '') + ' ' + (f.brandName || '')); };

  // 3) 그룹별 브랜드 묶기
  const groups = [];
  const picked = new Set();
  for (const [key, ids] of Object.entries(R)) {
    const byBrand = new Map();
    for (const id of ids) { if (!ok(id)) continue; const b = info[id].brandName; if (!byBrand.has(b)) byBrand.set(b, []); byBrand.get(b).push(id); }
    const brands = [...byBrand.entries()].filter(([, v]) => v.length >= 2).slice(0, MAX_BRANDS).map(([b, v]) => ({ b, ids: v.slice(0, MAX_ITEMS) }));
    brands.forEach((B) => B.ids.forEach((id) => picked.add(id)));
    groups.push({ key: 'F|' + key, brands });
  }
  set('브랜드 묶음 ' + groups.length + ' / 상품 ' + picked.size);

  // 4) 착샷 고르기: 대표사진이 제품만 있는 컷이면 상세사진 중 사람이 나온 컷으로
  const look = (url) => new Promise((res) => {
    const im = new Image(); im.crossOrigin = 'anonymous';
    im.onload = () => { try { const c = document.createElement('canvas'); c.width = 50; c.height = 60; const x = c.getContext('2d'); x.drawImage(im, 0, 0, 50, 60); const p = x.getImageData(0, 0, 50, 60).data; let skin = 0, n = 0, edgeW = 0, edgeN = 0; for (let y = 0; y < 60; y++) for (let xx = 0; xx < 50; xx++) { const i = (y * 50 + xx) * 4, r = p[i], g = p[i + 1], b = p[i + 2]; n++; const Y = 0.299 * r + 0.587 * g + 0.114 * b, cb = 128 - 0.169 * r - 0.331 * g + 0.5 * b, cr = 128 + 0.5 * r - 0.419 * g - 0.081 * b; if (Y > 60 && cb > 85 && cb < 125 && cr > 136 && cr < 170) skin++; if (y < 3 || y > 56 || xx < 3 || xx > 46) { edgeN++; if (r > 232 && g > 232 && b > 232) edgeW++; } } res({ skin: skin / n, white: edgeW / edgeN }); } catch (e) { res(null); } };
    im.onerror = () => res(null); im.src = url;
  });
  const IMG = {};
  let done = 0;
  await pool([...picked], 8, async (id) => {
    const thumb = String(info[id].thumbnail || '').replace(/^https?:\/\/image\.msscdn\.net/, '');
    IMG[id] = thumb;
    const t = await look('https://image.msscdn.net' + thumb);
    const flat = t && t.white > 0.8 && t.skin < 0.03;
    if (flat) {
      try {
        const d = (await (await fetch('https://goods-detail.musinsa.com/api2/goods/' + id, { credentials: 'include' })).json()).data;
        for (const g of (d.goodsImages || []).slice(0, 10)) { const u = g.imageUrl; const s = await look('https://image.msscdn.net' + u); if (s && s.skin >= 0.04 && !(s.white > 0.8 && s.skin < 0.06)) { IMG[id] = u; break; } }
      } catch (e) {}
    }
    if (++done % 50 === 0) set('착샷 ' + done + '/' + picked.size);
  });

  // 5) 큐레이터 링크
  let cache = {}; try { cache = JSON.parse(localStorage.getItem('mdcpLinks') || '{}'); } catch (e) {}
  const need = [...picked].filter((id) => !cache[id]);
  await pool(need, 10, async (id) => {
    const l = await (await fetch('https://api.one.musinsa.com/api2/affiliate/v2/link/product/' + id, { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-Platform': 'MUSINSA' }, body: '{}', credentials: 'include' })).json();
    if (l.data && l.data.link && /^https:\/\/www\.musinsa\.com\/curator\/goods\/[A-Za-z0-9]+$/.test(l.data.link)) cache[id] = l.data.link.replace('https://www.musinsa.com/curator/goods/', '');
  });
  try { localStorage.setItem('mdcpLinks', JSON.stringify(cache)); } catch (e) {}

  const clean = (s) => String(s || '').replace(/\[(WOMEN|W|여성|우먼)\]\s*/gi, '').replace(/_[A-Z0-9]{5,}.*$/, '').replace(/\s+/g, ' ').trim();
  const out = {
    at: new Date().toISOString(),
    styles: STY.map((x) => x[0]).filter((x) => x !== 'HOT'),
    groups: groups.map((g) => ({ key: g.key, brands: g.brands.map((B) => ({ b: B.b, items: B.ids.filter((id) => cache[id]).map((id) => ({ n: clean(info[id].goodsName), i: IMG[id], l: cache[id], p: info[id].price, r: info[id].saleRate || 0 })) })).filter((B) => B.items.length >= 2) })),
  };
  window.__pdkBrands = JSON.stringify(out);
  set('완료 ' + out.groups.reduce((a, g) => a + g.brands.length, 0) + '브랜드 ' + (window.__pdkBrands.length / 1024 | 0) + 'KB');
})();
