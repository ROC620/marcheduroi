// api/sitemap.js
export const config = { runtime: "edge" };

export default async function handler() {
  const SUPABASE_URL  = "https://mvkcgrextvxlzkqsyscm.supabase.co";
  const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12a2NncmV4dHZ4bHprcXN5c2NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMjIwNDcsImV4cCI6MjA4ODc5ODA0N30.dvVbB0E5F-vhZMYlzIl4r-N1jOrRgrNZsp4xbDI_Nho";
  const DOMAIN = "https://marcheduroi.com";

  const staticPages = [
    { url:"/", priority:"1.0", changefreq:"daily" },
    { url:"/vitrines", priority:"0.9", changefreq:"daily" },
    { url:"/vitrine", priority:"0.8", changefreq:"weekly" },
  ];

  let vitrinePages = [];
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/structures?select=slug,updated_at&active=eq.true&order=created_at.desc`,
      { headers:{ "apikey":SUPABASE_ANON, "Authorization":`Bearer ${SUPABASE_ANON}` } }
    );
    if (res.ok) {
      const data = await res.json();
      vitrinePages = (data||[]).map(s=>({ url:`/vitrine/${s.slug}`, priority:"0.8", changefreq:"weekly", lastmod:s.updated_at?s.updated_at.slice(0,10):new Date().toISOString().slice(0,10) }));
    }
  } catch(e){}

  const allPages = [...staticPages, ...vitrinePages];
  const today = new Date().toISOString().slice(0,10);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${allPages.map(p=>`  <url>\n    <loc>${DOMAIN}${p.url}</loc>\n    <lastmod>${p.lastmod||today}</lastmod>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>`).join("\n")}\n</urlset>`;

  return new Response(xml, { headers:{ "Content-Type":"application/xml; charset=utf-8", "Cache-Control":"public, max-age=3600" } });
}
