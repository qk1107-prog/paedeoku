// 패더쿠 LINE UP 20개 — 크롬 무신사 탭(큐레이터 로그인)에서 실행
// 노스페이스 쿠폰가(패더쿠 spot 데이터) + 어그 블프 할인 예정 + 여성 20·30대 랭킹
// 결과: window.__pdkLineup (배열), 탭 제목 "라인업 완료 N"
(async () => {
  const SB = 'https://cbuydjkvvzbluyohdkie.supabase.co', K = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNidXlkamt2dnpibHV5b2hka2llIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2MjYxMDIsImV4cCI6MjEwNTIwMjEwMn0.dYpj7w5zpyrWeF4YgQ19U6rN3x0pxZwVo8QNiosV4KI';
  const P = (await (await fetch(SB + '/rest/v1/site_data?id=eq.pdk_main&select=value', { headers: { apikey: K, Authorization: 'Bearer ' + K } })).json())[0].value;
  const won = (n) => Number(n || 0).toLocaleString('ko-KR') + '원';
  const MEN = /남성|\[MEN\]|맨즈|키즈|KIDS/;
  const info = {};
  const fetchInfo = async (ids) => { ids = ids.filter((id) => !info[id]); for (let i = 0; i < ids.length; i += 30) { try { const j = await (await fetch('https://content.musinsa.com/api2/content/magazine-misc/v1/goods?saleStates=SALE&goodsIds=' + ids.slice(i, i + 30).join(',') + '&sort=RANK&tabId=default&gf=A', { credentials: 'include' })).json(); ((j.data && (j.data.list || j.data.goods)) || []).forEach((g) => (info[String(g.goodsNo)] = g)); } catch (e) {} } };
  let cache = {}; try { cache = JSON.parse(localStorage.getItem('mdcpLinks') || '{}'); } catch (e) {}
  const link = async (ids) => { const need = ids.filter((id) => !cache[id]); await Promise.all(need.map(async (id) => { try { const l = await (await fetch('https://api.one.musinsa.com/api2/affiliate/v2/link/product/' + id, { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-Platform': 'MUSINSA' }, body: '{}', credentials: 'include' })).json(); if (l.data && l.data.link && /^https:\/\/www\.musinsa\.com\/curator\/goods\/[A-Za-z0-9]+$/.test(l.data.link)) cache[id] = l.data.link.replace('https://www.musinsa.com/curator/goods/', ''); } catch (e) {} })); try { localStorage.setItem('mdcpLinks', JSON.stringify(cache)); } catch (e) {} };
  const curl = (id) => cache[id] ? 'https://www.musinsa.com/curator/goods/' + cache[id] : '';
  const big = (u) => { u = String(u || ''); if (!u.startsWith('http')) u = 'https://image.msscdn.net' + u; return u.replace(/_(500|125|250|320)\./, '_big.'); };
  // 착샷 고르기: 대표사진이 제품컷이면 상세사진 중 사람이 나온 컷
  const look = (url) => new Promise((res) => { const im = new Image(); im.crossOrigin = 'anonymous'; im.onload = () => { try { const c = document.createElement('canvas'); c.width = 50; c.height = 60; const x = c.getContext('2d'); x.drawImage(im, 0, 0, 50, 60); const p = x.getImageData(0, 0, 50, 60).data; let skin = 0, n = 0, ew = 0, en = 0; for (let y = 0; y < 60; y++) for (let xx = 0; xx < 50; xx++) { const i = (y * 50 + xx) * 4, r = p[i], g = p[i + 1], b = p[i + 2]; n++; const Y = 0.299 * r + 0.587 * g + 0.114 * b, cb = 128 - 0.169 * r - 0.331 * g + 0.5 * b, cr = 128 + 0.5 * r - 0.419 * g - 0.081 * b; if (Y > 60 && cb > 85 && cb < 125 && cr > 136 && cr < 170) skin++; if (y < 3 || y > 56 || xx < 3 || xx > 46) { en++; if (r > 232 && g > 232 && b > 232) ew++; } } res({ skin: skin / n, white: ew / en }); } catch (e) { res(null); } }; im.onerror = () => res(null); im.src = url; });
  const photo = async (id, fallback) => {
    try {
      const d = (await (await fetch('https://goods-detail.musinsa.com/api2/goods/' + id, { credentials: 'include' })).json()).data;
      const main = 'https://image.msscdn.net' + d.thumbnailImageUrl;
      const t = await look(main);
      if (t && t.skin >= 0.04 && !(t.white > 0.8 && t.skin < 0.06)) return big(main);
      for (const g of (d.goodsImages || []).slice(0, 12)) { const u = 'https://image.msscdn.net' + g.imageUrl; const s = await look(u); if (s && s.skin >= 0.04 && !(s.white > 0.8 && s.skin < 0.06)) return big(u); }
      return big(main);
    } catch (e) { return big(fallback); }
  };
  const short = (n) => String(n || '').replace(/\[[^\]]*\]|\([^)]*\)|_[A-Z]+$|[A-Z]{2}\d[A-Z0-9]{3,}|\b[A-Z0-9]{6,}\b|-?\s*\d+\s*COLOR|\/.*$/gi, ' ').replace(/\s+/g, ' ').trim().slice(0, 16).trim();

  // 1) 노스페이스: 패더쿠 spot 데이터(쿠폰가)에서 대표템
  const nf = ((P.bf && P.bf.spot && P.bf.spot.brands) || []).find((b) => b.brand === '노스페이스');
  const pool = ((nf && (nf.all || nf.items)) || []).filter((x) => !MEN.test(x.name || ''));
  const NF = [[/레인보우/, '쿠폰 받으면\n반값 아래 레인보우'], [/눕시/, '올겨울 교복\n그 눕시'], [/클라우드/, '가볍고 따뜻한\n클라우드 하이브리드'], [/다이아몬드/, '퀼팅 숏패딩\n다이아몬드 다운'], [/에이블 파카/, '롱하게 덮는\n에이블 파카'], [/부베/, '데일리 바람막이\n부베 숏 후디'], [/테디.*코트|플리스 코트/, '뽀글이 끝판왕\n테디 플리스 코트'], [/슬립온|뮬/, '겨울 실내화 대신\n다운 슬립온'], [/버킷백/, '쿠폰가 2만원대\n브리즈 버킷백']];
  const nfOut = [];
  for (const [re, h] of NF) {
    const c = pool.filter((x) => re.test(x.name || '') && !nfOut.some((o) => o.i === x.i)).sort((a, b) => (b.tot || 0) - (a.tot || 0) || (b.rv || 0) - (a.rv || 0))[0];
    if (c) nfOut.push(Object.assign({ h }, c));
  }
  const NFL = [];
  for (const x of nfOut.slice(0, 8)) {
    const cp = x.cpn || x.sale, pct = x.tot || x.rate || 0;
    NFL.push({ id: 'pdk' + x.i, link: x.link, photo: await photo(x.i, x.img), ratio: '3/4', eyebrow: `노스페이스 · 쿠폰가 ${won(cp)}`, sticker: pct >= 10 ? pct + '% OFF' : 'HOT', headline: x.h });
  }

  // 2) 어그: 블프 할인 예정 → 장바구니 담기
  const searchF = async (kw) => { try { const h = await (await fetch('https://www.musinsa.com/search/goods?keyword=' + encodeURIComponent(kw) + '&gf=F&sortCode=SALE_ONE_WEEK_COUNT', { credentials: 'include' })).text(); return [...new Set([...h.matchAll(/products\/(\d{6,9})/g)].map((m) => m[1]))].slice(0, 20); } catch (e) { return []; } };
  const UGG = [['어그 울트라 미니', /울트라 미니/, '블프 할인 예정\n지금 장바구니에'], ['어그 타즈', /타즈/, '품절 전에\n사이즈 먼저 담기'], ['어그 클래식 미니', /클래식 미니/, '겨울 필수\n그 어그']];
  const UGL = [];
  for (const [kw, re, h] of UGG) {
    const ids = await searchF(kw); await fetchInfo(ids);
    const id = ids.find((i) => info[i] && !info[i].isSoldOut && /어그|UGG/i.test(info[i].brandName || '') && re.test(info[i].goodsName || '') && !MEN.test(info[i].goodsName || '') && !UGL.some((u) => u.id === 'pdk' + i));
    if (!id) continue;
    await link([id]); if (!curl(id)) continue;
    const f = info[id];
    UGL.push({ id: 'pdk' + id, link: curl(id), photo: await photo(id, f.thumbnail), ratio: '3/4', eyebrow: (f.saleRate ? `어그 · 지금 ${f.saleRate}% 할인` : '어그 · 블프 할인 예정'), sticker: '장바구니', headline: h });
  }

  // 3) 여성 20·30대 랭킹 (아우터·상의·신발·가방), 노스페이스·어그 빼고
  const rank = async (cat, age) => { try { const j = await (await fetch(`https://client.musinsa.com/api/home/web/v5/pans/ranking/sections/200?storeCode=musinsa&gf=F&ageBand=${age}&period=REALTIME&categoryCode=${cat}&contentsId=&page=1&size=40`, { credentials: 'include' })).json(); const ids = []; const walk = (o) => { if (Array.isArray(o)) o.forEach(walk); else if (o && typeof o === 'object') { if (o.type === 'PRODUCT_COLUMN') { ids.push(String(o.id)); return; } for (const k in o) walk(o[k]); } }; walk(j.data); return ids; } catch (e) { return []; } };
  const SLOTS = [['20대', 'AGE_BAND_20', '002', '아우터'], ['30대', 'AGE_BAND_30', '002', '아우터'], ['20대', 'AGE_BAND_25', '001', '상의'], ['30대', 'AGE_BAND_35', '001', '상의'], ['20대', 'AGE_BAND_20', '103', '신발'], ['30대', 'AGE_BAND_30', '103', '신발'], ['20대', 'AGE_BAND_25', '004', '가방'], ['20대', 'AGE_BAND_20', '100', '원피스·스커트'], ['30대', 'AGE_BAND_35', '003', '바지']];
  const RKL = [], usedB = new Set(['노스페이스', '어그']);
  for (const [ageL, age, cat, catL] of SLOTS) {
    const ids = (await rank(cat, age)).slice(0, 25); await fetchInfo(ids);
    const ok = ids.map((id, i) => [id, i]).filter(([id]) => { const f = info[id]; return f && !f.isSoldOut && !/^M(EN)?$/.test(String(f.genderCode || '')) && !MEN.test(f.goodsName || '') && !usedB.has(f.brandName) && !RKL.some((r) => r.id === 'pdk' + id); });
    const pick = ok.find(([id]) => (info[id].saleRate || 0) >= 10) || ok[0];
    if (!pick) continue;
    const [id, pos] = pick; await link([id]); if (!curl(id)) continue;
    const f = info[id]; usedB.add(f.brandName);
    RKL.push({ id: 'pdk' + id, link: curl(id), photo: await photo(id, f.thumbnail), ratio: '3/4', eyebrow: `${f.brandName} · ${ageL} 여성 ${catL} ${pos + 1}위`, sticker: (f.saleRate >= 10 ? f.saleRate + '% OFF' : 'RANK'), headline: `${ageL} 여자들이\n제일 많이 담는 ${catL}`, _name: f.goodsName });
  }

  // 순서: 노스페이스 중심으로 섞기
  const order = [];
  const take = (arr) => arr.length ? order.push(arr.shift()) : 0;
  const nfQ = [...NFL], ugQ = [...UGL], rkQ = [...RKL];
  take(nfQ); take(nfQ); take(ugQ); take(nfQ); take(rkQ); take(nfQ); take(rkQ); take(ugQ); take(nfQ); take(rkQ); take(nfQ);
  while (nfQ.length || ugQ.length || rkQ.length) { take(rkQ); take(nfQ); take(ugQ); }
  order[0].sticker = 'HOT';
  window.__pdkLineup = order.slice(0, 20);
  window.__pdkLineupInfo = { nf: NFL.length, ugg: UGL.length, rank: RKL.map((r) => r.eyebrow + ' | ' + r._name) };
  window.__pdkLineup.forEach((x) => delete x._name);
  document.title = '라인업 완료 ' + window.__pdkLineup.length;
})();
