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
async function buildMain() {
  const [M, P] = await Promise.all([row("main"), row("pdk_main")]);
  const mb = (M && M.bf) || {}, pb = (P && P.bf) || {};
  const mt = mb.teaser || {};
  return {
    site: (P && P.site) || { name: "패더쿠", brand: "패더쿠", bio: "패션 할인 소식 제일 빠른 곳", avatar: "", footer: "패더쿠" },
    lineup: (P && P.lineup) || [],
    moodCats: (P && P.moodCats) || [],
    categories: (P && P.categories) || [],
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
    else if (id === "packs") out = { starter: [], levelup: [] };
    else if (id === "brands") out = (await row("pdk_brands")) || (await row("brands"));
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
