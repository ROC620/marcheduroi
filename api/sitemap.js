// api/sitemap.js
// Sitemap dynamique — généré à la volée depuis Supabase
// Accessible sur : marcheduroi.com/api/sitemap.xml
// Google Sitemap déclaré dans robots.txt

export const config = { runtime: "edge" };

export default async function handler() {
  const SUPABASE_URL    = process.env.VITE_SUPABASE_URL    || process.env.SUPABASE_URL;
  const SUPABASE_ANON   = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  const DOMAIN          = "https://marcheduroi.com";

  // Pages statiques du site
  const staticPages = [
    { url: "/",          priority: "1.0", changefreq: "daily"   },
    { url: "/vitrines",  priority: "0.9", changefreq: "daily"   },
    { url: "/vitrine",   priority: "0.8", changefreq: "weekly"  },
  ];

  let vitrinePages = [];

  // Charger les vitrines actives depuis Supabase
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/structures?select=slug,updated_at&active=eq.true&order=created_at.desc`,
      {
        headers: {
          "apikey":        SUPABASE_ANON,
          "Authorization": `Bearer ${SUPABASE_ANON}`,
        },
      }
    );
    if (res.ok) {
      const data = await res.json();
      vitrinePages = (data || []).map(s => ({
        url:        `/vitrine/${s.slug}`,
        priority:   "0.8",
        changefreq: "weekly",
        lastmod:    s.updated_at ? s.updated_at.slice(0, 10) : new Date().toISOString().slice(0, 10),
      }));
    }
  } catch (e) {
    // Silencieux — retourne au moins les pages statiques
  }

  const allPages = [...staticPages, ...vitrinePages];
  const today    = new Date().toISOString().slice(0, 10);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(p => `  <url>
    <loc>${DOMAIN}${p.url}</loc>
    <lastmod>${p.lastmod || today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type":  "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
