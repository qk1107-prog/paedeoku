// 수파베이스 스토리지 이미지를 Vercel CDN 에 하루 캐시 (수파베이스 전송량 절약)
const SB = "https://cbuydjkvvzbluyohdkie.supabase.co/storage/v1/object/public/";
module.exports = async function handler(req, res) {
  const p = String((req.query && req.query.p) || "").split("?")[0];
  if (!p || p.includes("..") || /[\s<>"'\\]/.test(p)) { res.statusCode = 400; return res.end("bad"); }
  const src = SB + p.split("/").map((x) => encodeURIComponent(decodeURIComponent(x))).join("/");
  try {
    const r = await fetch(src);
    if (!r.ok) throw new Error(String(r.status));
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length > 4000000) { res.statusCode = 302; res.setHeader("Location", src); res.setHeader("Cache-Control", "public, s-maxage=86400"); return res.end(); }
    res.setHeader("Content-Type", r.headers.get("content-type") || "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800");
    res.statusCode = 200;
    res.end(buf);
  } catch (e) {
    res.statusCode = 302; res.setHeader("Location", src); res.setHeader("Cache-Control", "no-store"); res.end();
  }
};
