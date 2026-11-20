// 패더쿠 블프 데이터(여성) 만들기 — 크롬 무신사 탭(큐레이터 로그인)에서 실행
// 결과: window.__pdkMain (JSON 문자열) → sink로 site_data id='pdk_main' 저장
(async () => {
  const BAD = /키즈|KIDS|하이큐|진격|산리오|포켓몬|짱구|디즈니|마블|귀멸|주술|레깅스|양말|삭스|스타킹|속옷|브라|팬티|파우치|폰케이스|마스크팩/;
  const info = {};
  const fetchInfo = async (ids) => { ids = ids.filter((id) => !info[id]); for (let i = 0; i < ids.length; i += 30) { try { const j = await (await fetch('https://content.musinsa.com/api2/content/magazine-misc/v1/goods?saleStates=SALE&goodsIds=' + ids.slice(i, i + 30).join(',') + '&sort=RANK&tabId=default&gf=A', { credentials: 'include' })).json(); ((j.data && (j.data.list || j.data.goods)) || []).forEach((g) => (info[String(g.goodsNo)] = g)); } catch (e) {} } };
  const search = async (kw) => { try { const h = await (await fetch('https://www.musinsa.com/search/goods?keyword=' + encodeURIComponent(kw) + '&gf=F&sortCode=SALE_ONE_WEEK_COUNT', { credentials: 'include' })).text(); return [...new Set((h.match(/products\/(\d{6,8})/g) || []).map((x) => x.slice(9)))]; } catch (e) { return []; } };
  const rank = async (sec, cat, age, period = 'WEEKLY') => { try { const j = await (await fetch(`https://client.musinsa.com/api/home/web/v5/pans/ranking/sections/${sec}?storeCode=musinsa&gf=F&ageBand=${age}&period=${period}&categoryCode=${cat}&contentsId=&page=1&size=60`, { credentials: 'include' })).json(); const ids = []; const walk = (o) => { if (Array.isArray(o)) o.forEach(walk); else if (o && typeof o === 'object') { if (o.type === 'PRODUCT_COLUMN') { ids.push(String(o.id)); return; } for (const k in o) walk(o[k]); } }; walk(j.data); return ids; } catch (e) { return []; } };
  let cache = {}; try { cache = JSON.parse(localStorage.getItem('mdcpLinks') || '{}'); } catch (e) {}
  const link = async (ids) => { const need = ids.filter((id) => !cache[id]); for (let i = 0; i < need.length; i += 15) await Promise.all(need.slice(i, i + 15).map(async (id) => { try { const l = await (await fetch('https://api.one.musinsa.com/api2/affiliate/v2/link/product/' + id, { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-Platform': 'MUSINSA' }, body: '{}', credentials: 'include' })).json(); if (l.data && l.data.link && /^https:\/\/www\.musinsa\.com\/curator\/goods\/[A-Za-z0-9]+$/.test(l.data.link)) cache[id] = l.data.link.replace('https://www.musinsa.com/curator/goods/', ''); } catch (e) {} })); try { localStorage.setItem('mdcpLinks', JSON.stringify(cache)); } catch (e) {} };
  const img = (t) => { t = String(t || ''); return t.startsWith('http') ? t : 'https://image.msscdn.net' + t; };
  const item = (id) => { const f = info[id]; if (!f || !cache[id]) return null; return { i: id, brand: f.brandName, name: f.goodsName, img: img(f.thumbnail), link: 'https://www.musinsa.com/curator/goods/' + cache[id], price: f.normalPrice || f.price, sale: f.price, rate: f.saleRate || 0, rv: f.reviewCount || 0 }; };
  const ok = (id, maxPrice) => { const f = info[id]; return f && !f.isSoldOut && !/^M(EN)?$/.test(String(f.genderCode || '')) && !BAD.test((f.goodsName || '') + ' ' + (f.brandName || '')) && (!maxPrice || f.price <= maxPrice); };
  const noRepeat = (arr) => { const out = [], rest = [...arr]; while (rest.length) { const i = rest.findIndex((x) => !out.length || x.brand !== out[out.length - 1].brand); out.push(rest.splice(i < 0 ? 0 : i, 1)[0]); } return out; };
  const build = async (kw, n, maxPrice, discOnly) => { const ids = await search(kw); await fetchInfo(ids); let pick = ids.filter((id) => ok(id, maxPrice)); if (discOnly) pick = [...pick.filter((id) => (info[id].saleRate || 0) >= 10), ...pick.filter((id) => (info[id].saleRate || 0) < 10)]; pick = pick.slice(0, n + 6); await link(pick); return noRepeat(pick.map(item).filter(Boolean)).slice(0, n); };
  const PAD = [['인기 패딩', '패딩', 30, 0, true], ['⭐ 어그·부츠', '어그 부츠', 30], ['10만원 아래 패딩', '숏패딩', 30, 100000, true], ['코트', '코트', 30], ['플리스', '플리스', 30], ['무스탕·퍼', '무스탕', 24], ['니트·가디건', '니트 가디건', 30], ['장갑·목도리', '머플러', 24]];
  const XMAS = [['커플템', '커플', 20], ['머플러', '머플러', 20], ['장갑', '장갑', 20], ['지갑', '카드지갑', 20], ['비니', '비니', 20], ['주얼리', '목걸이', 20], ['캐시미어 니트', '캐시미어 니트', 20]];
  const padding = { at: new Date().toISOString(), groups: [] };
  for (const [label, kw, n, mp, disc] of PAD) padding.groups.push({ label, disc: !!disc, items: await build(kw, n, mp, disc) });
  const xmas = { at: new Date().toISOString(), groups: [] };
  for (const [label, kw, n] of XMAS) xmas.groups.push({ label, items: await build(kw, n) });
  // 프리오픈 추천: 여성 랭킹 상위 중 할인 큰 것
  const pool = [...new Set([].concat(await rank(200, '000', 'AGE_BAND_20'), await rank(200, '000', 'AGE_BAND_25'), await rank(200, '002', 'AGE_BAND_20'), await rank(200, '103', 'AGE_BAND_20'), await rank(200, '000', 'AGE_BAND_ALL', 'REALTIME')))];
  await fetchInfo(pool);
  let pre = pool.filter((id) => ok(id) && (info[id].saleRate || 0) >= 15 && (info[id].reviewCount || 0) >= 10).sort((a, b) => (info[b].saleRate + Math.log10(info[b].reviewCount + 1) * 8) - (info[a].saleRate + Math.log10(info[a].reviewCount + 1) * 8)).slice(0, 40);
  await link(pre);
  const teaser = { groups: [{ label: '프리오픈 추천', items: noRepeat(pre.map(item).filter(Boolean)).slice(0, 34) }] };
  // 라인업: 실시간 인기 중 할인 있는 것 6개
  const rt = (await rank(200, '000', 'AGE_BAND_ALL', 'REALTIME')).filter((id) => ok(id) && (info[id].saleRate || 0) >= 10).slice(0, 8);
  await link(rt);
  const short = (s) => { s = String(s || '').replace(/\[[^\]]*\]|\([^)]*\)|_[A-Z0-9]{6,}.*$|\/.*$/g, '').replace(/\s+/g, ' ').trim(); return s.length > 15 ? s.slice(0, 15).trim() + '…' : s; };
  const lineup = rt.map(item).filter(Boolean).slice(0, 6).map((x, k) => ({ id: 'pdk' + x.i, link: x.link, photo: x.img.replace('_500.', '_big.'), ratio: '3/4', eyebrow: x.brand, sticker: k === 0 ? 'HOT' : x.rate + '% OFF', headline: short(x.name) + '\n지금 ' + x.rate + '% 할인' }));
  // 분위기별
  const MOOD = [['202', '캐주얼'], ['301', '걸리시'], ['205', '미니멀'], ['203', '스트릿'], ['209', '포멀']];
  const moodCats = [];
  for (const [sec, mood] of MOOD) { const ids = (await rank(sec, '000', 'AGE_BAND_20')); await fetchInfo(ids); const p = ids.filter((id) => ok(id)).slice(0, 24); await link(p); const items = noRepeat(p.map(item).filter(Boolean)).slice(0, 20); if (items.length >= 8) moodCats.push({ mood, groups: [{ cat: '인기 TOP 20', items }] }); }
  const out = {
    at: new Date().toISOString(),
    site: { name: '패더쿠', brand: '패더쿠', avatar: '', instagram: 'paedeoku', footer: '패더쿠 · 패션 할인 소식 제일 빠른 곳', bio: '🔥 무진장 · 무신사 블랙프라이데이 할인 소식 제일 빠른 곳\n지금 제일 핫한 여성 아이템만 골라서 정리했어요\n블프 탭부터 보시고, 카테고리 꿀템도 둘러보세요' },
    lineup, moodCats,
    bf: { padding, xmas, teaser, sigPreview: [], sigBrands: [], days: {}, bestTabs: {} },
  };
  window.__pdkMain = JSON.stringify(out);
  document.title = '패더쿠 블프 준비 완료 ' + window.__pdkMain.length;
})();
