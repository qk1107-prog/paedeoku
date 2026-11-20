// 방문자용 데이터 캐시: 수파베이스 site_data(pdk)를 Vercel CDN에서 1분간 캐시해서 내려줌
const SB = "https://cbuydjkvvzbluyohdkie.supabase.co";
const KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNidXlkamt2dnpibHV5b2hka2llIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2MjYxMDIsImV4cCI6MjEwNTIwMjEwMn0.dYpj7w5zpyrWeF4YgQ19U6rN3x0pxZwVo8QNiosV4KI";
const OK = { pdk: 1 };
module.exports = async function handler(req, res) {
  const id = String((req.query && req.query.id) || "pdk");
  if (!OK[id]) { res.statusCode = 400; return res.end("bad id"); }
  try {
    const r = await fetch(SB + "/rest/v1/site_data?id=eq." + id + "&select=value", { headers: { apikey: KEY, Authorization: "Bearer " + KEY } });
    if (!r.ok) throw new Error("sb " + r.status);
    const j = await r.json();
    const out = j[0] ? j[0].value : null;
    if (out == null) throw new Error("empty");
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=60, stale-while-revalidate=600, stale-if-error=86400");
    res.statusCode = 200;
    res.end(JSON.stringify(out));
  } catch (e) {
    res.setHeader("Cache-Control", "no-store");
    res.statusCode = 502;
    res.end("err");
  }
};
