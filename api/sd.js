// 패더쿠 방문자용 데이터: 수파베이스 site_data 를 Vercel CDN 에서 1분 캐시
// main = MD STUDIO의 블프 공통 정보(쿠폰·회차·라이브·오늘 혜택) + 패더쿠 여성 상품(pdk_main)
const SB = "https://cbuydjkvvzbluyohdkie.supabase.co";
const KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNidXlkamt2dnpibHV5b2hka2llIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2MjYxMDIsImV4cCI6MjEwNTIwMjEwMn0.dYpj7w5zpyrWeF4YgQ19U6rN3x0pxZwVo8QNiosV4KI";
const SHARED = { coupons: 1, brands: 1, catrank: 1, pdk: 1 };
const row = async (id) => {
  const r = await fetch(SB + "/rest/v1/site_data?id=eq." + id + "&select=value", { headers: { apikey: KEY, Authorization: "Bearer " + KEY } });
  if (!r.ok) throw new Error("sb " + r.status);
  const j = await r.json();
  return j[0] ? j[0].value : null;
};
const pick = (o, keys) => { const out = {}; keys.forEach((k) => { if (o && o[k] !== undefined) out[k] = o[k]; }); return out; };
const MEN = /남성|\[MEN\]|맨즈|\(M\)\s*$/;
const okItem = (x) => x && !MEN.test(String(x.name || "")) && !/키즈|KIDS/.test(String(x.name || ""));
const noMen = (o) => {
  if (!o) return undefined;
  const c = JSON.parse(JSON.stringify(o));
  if (Array.isArray(c.items)) c.items = c.items.filter(okItem);
  if (Array.isArray(c.brands)) c.brands.forEach((b) => { if (Array.isArray(b.items)) b.items = b.items.filter(okItem); if (Array.isArray(b.all)) b.all = b.all.filter(okItem); });
  return c;
};
const noMenHot = (o) => { if (!o) return undefined; const c = JSON.parse(JSON.stringify(o)); (c.cats || []).forEach((k) => { k.items = (k.items || []).filter(okItem); }); return c; };
// 남성 전용 브랜드(MD STUDIO 남성 그룹에만 있고 패더쿠 여성 그룹엔 없는 브랜드)는 빼고, 여성 신호 있는 상품을 앞으로
const WOM = /여성|우먼|WOMEN|W\)|공용|유니섹스|UNISEX/i;
function womenFirst(list, menB, womB) {
  if (!Array.isArray(list)) return list;
  const keep = list.filter((x) => x && (WOM.test(String(x.name || "")) || !menB.has(x.brand)));
  const score = (x) => (WOM.test(String(x.name || "")) ? 2 : 0) + (womB.has(x.brand) ? 1 : 0);
  return keep.map((x, i) => [x, i]).sort((a, b) => score(b[0]) - score(a[0]) || a[1] - b[1]).map((a) => a[0]);
}
function sexSets(W, B) {
  const F = new Set(), M = new Set();
  ((W && W.groups) || []).forEach((g) => (g.brands || []).forEach((y) => F.add(y.b)));
  ((B && B.groups) || []).filter((g) => /^M\|/.test(g.key)).forEach((g) => (g.brands || []).forEach((y) => M.add(y.b)));
  return { womB: F, menB: new Set([...M].filter((n) => !F.has(n))) };
}
const forWomen = (o, S, hot) => {
  if (!o) return o;
  const c = JSON.parse(JSON.stringify(o));
  if (hot) {
    (c.cats || []).forEach((k) => { k.items = womenFirst(k.items || [], S.menB, S.womB); });
    if (Array.isArray(c.rise)) c.rise = womenFirst(c.rise, S.menB, S.womB);
    else if (c.rise && Array.isArray(c.rise.items)) c.rise.items = womenFirst(c.rise.items, S.menB, S.womB);
  }
  else if (Array.isArray(c.items)) c.items = womenFirst(c.items, S.menB, S.womB);
  return c;
};
// 시그니처·브랜드특가·날짜별 칸: 패더쿠 전용이 없으면 MD STUDIO 것을 여성 위주로 (7시 공개 때 MD가 채우면 같이 열림)
const wl = (arr, S) => womenFirst((arr || []).filter(okItem), S.menB, S.womB);
const sigGroups = (gs, S) => (gs || []).map((g) => Object.assign({}, g, { items: wl(g.items, S) })).filter((g) => g.items.length);
const brandGroups = (gs, S) => (gs || []).map((g) => Object.assign({}, g, { items: wl(g.items, S) })).filter((g) => g.items.length && (!S.menB.has(g.brand) || g.items.some((x) => WOM.test(String(x.name || ""))))).sort((a, b) => (S.womB.has(b.brand) ? 1 : 0) - (S.womB.has(a.brand) ? 1 : 0));
const dayMap = (days, S) => { const out = {}; Object.keys(days || {}).forEach((d) => { const v = Object.assign({}, days[d]); ["hotA", "hotB", "sig"].forEach((k) => { if (Array.isArray(v[k])) v[k] = wl(v[k], S); }); if (Array.isArray(v.brands)) v.brands = brandGroups(v.brands, S); out[d] = v; }); return out; };
const spotFor = (mine, md, S) => {
  const t = (o) => (o && o.at ? Date.parse(o.at) || 0 : 0);
  // 패더쿠 전용(여성 컬렉션)이 있으면 그걸, 없을 때만 MD STUDIO 것(남성 위주)을 여성·공용 먼저로
  const src = mine && (mine.brands || []).length ? mine : md;
  if (!src) return src;
  const c = JSON.parse(JSON.stringify(src));
  (c.brands || []).forEach((b) => {
    // 패더쿠 전용 데이터는 남녀 섞은 순서 그대로(공유용), MD 것만 키즈 빼기
    ["items", "all"].forEach((k) => { if (Array.isArray(b[k])) b[k] = b[k].filter((x) => x && !/키즈|KIDS/.test(String(x.name || ""))); });
  });
  return c;
};
const has = (x) => Array.isArray(x) ? x.length > 0 : !!(x && Object.keys(x).length);
async function buildMain() {
  const [M, P, W, B] = await Promise.all([row("main"), row("pdk_main"), row("pdk_brands").catch(() => null), row("brands").catch(() => null)]);
  const S = sexSets(W, B);
  const mb = (M && M.bf) || {}, pb = (P && P.bf) || {};
  const mt = mb.teaser || {};
  return {
    site: (P && P.site) || { name: "패더쿠", brand: "패더쿠", bio: "패션 할인 소식 제일 빠른 곳", avatar: "", footer: "패더쿠" },
    lineup: (P && P.lineup) || [],
    moodCats: (P && P.moodCats && P.moodCats.length) ? P.moodCats : ((M && M.moodCats) || []),
    categories: (P && P.categories) || [],
    accPicks: (M && M.accPicks) || [], shoePicks: (M && M.shoePicks) || [], bagPicks: (M && M.bagPicks) || [],
    brandsOn: true,
    awards: { on: false, items: [] },
    longform: { on: false },
    outfits: [], stories: [], outfitGroups: [], reels: [],
    bf: Object.assign(
      pick(mb, ["on", "onFrom", "brief", "live", "rounds", "updatedAt"]),
      {
        teaser: Object.assign(pick(mt, ["info", "alarms", "at"]), pb.teaser || {}),
        padding: pb.padding || { groups: [] },
        xmas: pb.xmas || { groups: [] },
        sigPreview: has(pb.sigPreview) ? pb.sigPreview : sigGroups(mb.sigPreview, S),
        sigBrands: has(pb.sigBrands) ? pb.sigBrands : brandGroups(mb.sigBrands, S),
        days: has(pb.days) ? pb.days : dayMap(mb.days, S),
        bestTabs: pb.bestTabs || {},
        bestCats: pb.bestCats || {},
        best: pb.best || [],
        alerts: pb.alerts || [], alertsAt: pb.alertsAt || "",
        now: pb.now || {}, pre: pb.pre || {},
        picks: [], mycart: { on: false },
        // 실시간 칸: 패더쿠 전용 데이터가 있으면 그걸, 없으면 MD STUDIO 것에서 남성 전용만 빼고
        // 브랜드 쿠폰 칸(노스페이스 등): MD STUDIO가 매시간 갱신하니 더 최신 쪽을 쓰고, 여성·공용 상품을 앞으로
        spot: spotFor(pb.spot, mb.spot, S),
        ts: pb.ts || forWomen(noMen(mb.ts), S),
        dm: pb.dm || forWomen(noMen(mb.dm), S),
        hot: pb.hot || forWomen(noMenHot(mb.hot), S, true),
      }
    ),
  };
}
module.exports = async function handler(req, res) {
  const id = String((req.query && req.query.id) || "main");
  try {
    let out;
    if (id === "main") out = await buildMain();
    else if (id === "episodes") out = [];
    else if (id === "packs") out = (await row("pdk_packs")) || (await row("packs")) || { starter: [], levelup: [] };
    else if (id === "brands") {
      // 시스터 = 패더쿠 여성 데이터(스타일 계열별), 브로 = MD STUDIO 남성 데이터
      const [W, B] = await Promise.all([row("pdk_brands"), row("brands")]);
      const gW = (W && W.groups) || [], gB = ((B && B.groups) || []).filter((g) => /^M\|/.test(g.key) || !gW.length);
      out = Object.assign({}, B || {}, { at: (W && W.at) || (B && B.at), styles: (W && W.styles) || [], groups: [...gW, ...gB] });
    }
    else if (SHARED[id]) out = await row(id);
    else { res.statusCode = 400; return res.end("bad id"); }
    if (out == null) throw new Error("empty");
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=60, stale-while-revalidate=600, stale-if-error=86400");
    res.statusCode = 200;
    res.end(JSON.stringify(out).split(SB + "/storage/v1/object/public/").join("https://" + (req.headers.host || "paedeoku.vercel.app") + "/api/img?p="));
  } catch (e) {
    res.setHeader("Cache-Control", "no-store");
    res.statusCode = 502;
    res.end("err");
  }
};
