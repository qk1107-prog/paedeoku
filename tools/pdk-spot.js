// [패더쿠] 대표 브랜드 프리오픈 쿠폰 칸 데이터 (pdk_main.bf.spot) — 여성·남녀공용 위주(남성 전용 제외) — www.musinsa.com 탭(로그인)에서 실행
// 결과: window.__pdkSpData (JSON 문자열), 노란 COPY SPOT 버튼(id __spb)
window.__pdkSpRun = async (brands) => {
  brands = brands || ["노스페이스"];
  const S = (window.__pdkSp = { st: "start" });
  const T_OPEN = new Date("2026-11-22T19:00:00+09:00").getTime();
  const all = [];
  let cp = 0, pp = 0, cm = true, pm = true;
  for (let i = 0; i < 150 && (cm || pm); i++) {
    const j = await (await fetch(`https://api.musinsa.com/api/coupon/coupon-box/v1/coupons?sort=POPULARITY&cartPage=${cm ? cp : 999}&productPage=${pm ? pp : 999}&size=50`, { credentials: "include" })).json();
    const d = j.data;
    if (cm) { (d.cartCoupons.items || []).forEach((x) => all.push(x)); cm = d.cartCoupons.hasNext; cp++; }
    if (pm) { (d.productCoupons.items || []).forEach((x) => all.push(x)); pm = d.productCoupons.hasNext; pp++; }
  }
  const cache = JSON.parse(localStorage.getItem("mdcpLinks") || "{}");
  const out = [];
  for (const b of brands) {
    const cps = all.filter((c) => c.couponChannel === "ONLINE" && c.couponName.includes(b) && !/키즈|깜짝|이달의/.test(c.couponName) && c.discountType === "PERCENT" && new Date(c.expireDateTime).getTime() > Date.now() && (/프리오픈|티징/.test(c.couponName) || Math.abs(new Date(c.expireDateTime).getTime() - T_OPEN) < 6e4));
    if (!cps.length) continue;
    const goods = {};
    for (const c of cps) {
      for (let p = 1; p <= 12; p++) {
        S.st = b + " " + c.couponName + " p" + p;
        let j; try { j = await (await fetch(`https://api.musinsa.com/api2/coupon/plp/v1/goods?gf=A&sortCode=SALE_ONE_WEEK_COUNT&couponNo=${c.couponNo}&couponKind=${c.couponKind}&size=100&caller=COUPON&page=${p}`, { credentials: "include" })).json(); } catch (e) { break; }
        const L = (j.data && (j.data.list || j.data.goods)) || []; if (!L.length) break;
        L.forEach((g, i) => { if (g.isSoldOut || /키즈|KIDS|남성|맨즈|\[MEN\]/i.test(g.goodsName) || g.genderCode === "MEN" || g.brandName !== b) return; const id = String(g.goodsNo); const pct = c.discountValue; const rank = (p - 1) * 100 + i; const cs = (goods[id] && goods[id].cs) || []; if (!cs.includes(c.couponNo)) cs.push(c.couponNo); if (!goods[id] || pct > goods[id].p) goods[id] = { g, p: pct, no: c.couponNo, cs, rank: Math.min(rank, goods[id] ? goods[id].rank : 1e9) }; else { goods[id].rank = Math.min(goods[id].rank, rank); goods[id].cs = cs; } });
        if (L.length < 100) break;
      }
    }
    const kind = (n) => (/눕시|패딩|다운|온볼|파카|푸퍼|구스|헤비/.test(n) && !/뮬|부티|부띠|슬리퍼|슬립온|슈즈|부츠|츄카|스니커즈| 목 |베스트|장갑|모자|햇|캡|머플러|토트|백팩|버킷|숄더|크로스|파우치|멀티팩|팩 |가방|팬츠|바지/.test(n) ? 0 : /자켓|재킷|플리스|아노락|바람막이|가디건|코트/.test(n) ? 1 : 2);
    const arr = Object.values(goods).map((x) => { const g = x.g; const nor = g.normalPrice || g.price; const cpn = Math.round(g.price * (1 - x.p / 100) / 10) * 10; return { id: String(g.goodsNo), brand: g.brandName, name: g.goodsName, img: String(g.thumbnail || "").replace("/thumbnails/images/", "/images/"), price: nor, sale: g.price, rate: g.saleRate || 0, p: x.p, cpn, tot: nor ? Math.round((1 - cpn / nor) * 100) : x.p, rv: g.reviewCount || 0, k: kind(g.goodsName), rank: x.rank, cno: x.no, cs: x.cs }; });
    // 패딩 먼저(인기순), 그다음 자켓·플리스, 나머지 — 섞어서 30개
    // 쿠폰 15% 이상이거나 합쳐서 25% 이상 싸지는 것만, 인기(판매순)와 할인 폭을 같이 봄
    const good = (x) => x.p >= 15 || x.tot >= 25;
    const sc = (x) => x.rank - x.tot * 4;
    // 같은 상품 색상 여러 개면 대표 1개만
    const nkey = (n) => n.replace(/^[A-Z]{2}[A-Z0-9]{5,}\s*/, "").replace(/\((RDS|공용)\)/g, "").replace(/[\s_\-\/]+[A-Z][A-Z_\s]*$/, "").replace(/\s+/g, "");
    const seenN = new Set();
    const by = (k, n) => arr.filter((x) => x.k === k && good(x)).sort((a, b2) => sc(a) - sc(b2)).filter((x) => { const kk = nkey(x.name); if (seenN.has(kk)) return false; seenN.add(kk); return true; }).slice(0, n);
    const pick = [...by(0, 14), ...by(1, 10), ...by(2, 6)];
    // 쿠폰별 전체보기용: 그 쿠폰이 붙는 상품을 패딩 → 자켓·플리스 → 나머지 순으로 각 36개까지 (색상 중복 제외)
    const tiers = [...new Set(arr.map((x) => x.p))].sort((x, y) => y - x);
    const allL = [];
    tiers.forEach((t) => { const sn = new Set(); arr.filter((x) => x.p === t).sort((a, b2) => a.k - b2.k || sc(a) - sc(b2)).filter((x) => { const kk = nkey(x.name); if (sn.has(kk)) return false; sn.add(kk); return true; }).slice(0, 36).forEach((x) => allL.push(x)); });
    for (const x of [...pick, ...allL]) {
      if (cache[x.id]) continue;
      try { const r = await fetch("https://api.one.musinsa.com/api2/affiliate/v2/link/product/" + x.id, { method: "POST", credentials: "include", headers: { Accept: "application/json", "Content-Type": "application/json", "X-Platform": "MUSINSA" }, body: "{}" }); const l = await r.json(); const m = String((l.data && l.data.link) || "").match(/^https:\/\/www\.musinsa\.com\/curator\/goods\/([A-Za-z0-9]+)$/); if (m) cache[x.id] = m[1]; } catch (e) {}
    }
    const byV = {}; cps.forEach((c) => { const k = c.discountValue; if (!byV[k] || /프리오픈/.test(c.couponName)) byV[k] = c; });
    out.push({ brand: b, max: Math.max(...cps.map((c) => c.discountValue)), exp: "11/22", total: arr.length, pad: arr.filter((x) => x.k === 0).length,
      coupons: Object.values(byV).sort((a, b2) => b2.discountValue - a.discountValue).map((c) => ({ no: c.couponNo, v: c.discountValue + "%" })),
      items: pick.filter((x) => cache[x.id]).map((x) => ({ i: x.id, brand: x.brand, name: x.name, img: x.img, link: "https://www.musinsa.com/curator/goods/" + cache[x.id], price: x.price, sale: x.sale, rate: x.rate, p: x.p, cpn: x.cpn, tot: x.tot, rv: x.rv, k: x.k })),
      all: allL.filter((x) => cache[x.id]).map((x) => ({ i: x.id, brand: x.brand, name: x.name, img: x.img, l: cache[x.id], price: x.price, sale: x.sale, p: x.p, cpn: x.cpn, tot: x.tot, k: x.k, cs: x.cs })) });
  }
  localStorage.setItem("mdcpLinks", JSON.stringify(cache));
  window.__pdkSpData = JSON.stringify({ at: new Date().toISOString(), brands: out });
  S.st = "done " + out.map((o) => o.brand + " items " + o.items.length + " (쿠폰 적용 " + o.total + "개 중 패딩 " + o.pad + ")").join(", ");
  let bt = document.getElementById("__spb");
  if (!bt) { bt = document.createElement("button"); bt.id = "__spb"; bt.style.cssText = "position:fixed;left:10px;top:10px;z-index:2147483647;background:#ffe14d;border:2px solid #000;font:bold 16px sans-serif;padding:14px 18px"; document.body.appendChild(bt); }
  bt.textContent = "COPY SPOT"; bt.onclick = () => navigator.clipboard.writeText(window.__pdkSpData).then(() => { bt.textContent = "OK " + out.length; });
  return S;
};
