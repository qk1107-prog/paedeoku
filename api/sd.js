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
async function buildMain() {
  const [M, P] = await Promise.all([row("main"), row("pdk_main")]);
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
        sigPreview: pb.sigPreview || [],
        sigBrands: pb.sigBrands || [],
        days: pb.days || {},
        bestTabs: pb.bestTabs || {},
        bestCats: pb.bestCats || {},
        best: pb.best || [],
        alerts: pb.alerts || [], alertsAt: pb.alertsAt || "",
        now: pb.now || {}, pre: pb.pre || {},
        picks: [], mycart: { on: false },
        // 실시간 칸: 패더쿠 전용 데이터가 있으면 그걸, 없으면 MD STUDIO 것에서 남성 전용만 빼고
        spot: pb.spot || noMen(mb.spot),
        ts: pb.ts || noMen(mb.ts),
        dm: pb.dm || noMen(mb.dm),
        hot: pb.hot || noMenHot(mb.hot),
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
