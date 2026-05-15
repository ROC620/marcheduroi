// api/vitrine-redirect.js
// Détecte les scrapers sociaux et sert les bonnes balises OG
// Route : /vitrine/:slug (configurée dans vercel.json)

export const config = { runtime: "edge" };

const SUPABASE_URL  = "https://mvkcgrextvxlzkqsyscm.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12a2NncmV4dHZ4bHprcXN5c2NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMjIwNDcsImV4cCI6MjA4ODc5ODA0N30.dvVbB0E5F-vhZMYlzIl4r-N1jOrRgrNZsp4xbDI_Nho";
const DOMAIN        = "https://marcheduroi.com";

// User-agents des scrapers sociaux
const SOCIAL_BOTS = [
  "facebookexternalhit", "facebot", "twitterbot", "whatsapp",
  "telegrambot", "linkedinbot", "slackbot", "discordbot",
  "googlebot", "bingbot", "applebot", "ia_archiver"
];

export default async function handler(req) {
  const url      = new URL(req.url);
  const segments = url.pathname.split("/").filter(Boolean);
  const slug     = segments[1]; // /vitrine/:slug

  if (!slug) {
    return new Response(null, { status: 302, headers: { Location: DOMAIN } });
  }

  const ua = (req.headers.get("user-agent") || "").toLowerCase();
  const isBot = SOCIAL_BOTS.some(bot => ua.includes(bot));

  // Si c'est un scraper → servir les balises OG avec photo de la vitrine
  if (isBot) {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/structures?slug=eq.${slug}&select=name,type,slogan,ville,logo_url,cover_url,photos,active&limit=1`,
        { headers: { "apikey": SUPABASE_ANON, "Authorization": `Bearer ${SUPABASE_ANON}` } }
      );
      const data = await res.json();
      const s = data?.[0];

      if (!s || !s.active) {
        return new Response(null, { status: 302, headers: { Location: `${DOMAIN}/vitrines` } });
      }

      const photo = s.cover_url || (s.photos?.[0]) || s.logo_url || `${DOMAIN}/marcheduRoi-icon.svg`;
      const title = `${s.name} — ${s.type} | MarchéduRoi`;
      const desc  = s.slogan || `Découvrez ${s.name}${s.ville ? " à " + s.ville : ""} sur MarchéduRoi 👑`;
      const pageUrl = `${DOMAIN}/vitrine/${slug}`;

      const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>${title}</title>
  <meta name="description" content="${desc}"/>
  <meta property="og:title" content="${title}"/>
  <meta property="og:description" content="${desc}"/>
  <meta property="og:image" content="${photo}"/>
  <meta property="og:image:width" content="1200"/>
  <meta property="og:image:height" content="630"/>
  <meta property="og:url" content="${pageUrl}"/>
  <meta property="og:type" content="website"/>
  <meta property="og:site_name" content="MarchéduRoi"/>
  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:title" content="${title}"/>
  <meta name="twitter:description" content="${desc}"/>
  <meta name="twitter:image" content="${photo}"/>
  <meta http-equiv="refresh" content="0;url=${pageUrl}"/>
</head>
<body>
  <p><a href="${pageUrl}">${title}</a></p>
</body>
</html>`;

      return new Response(html, {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=300" }
      });

    } catch (e) {
      return new Response(null, { status: 302, headers: { Location: `${DOMAIN}/vitrine/${slug}` } });
    }
  }

  // Si c'est un utilisateur normal → servir index.html directement (pas de redirection)
  const indexRes = await fetch(`${DOMAIN}/index.html`);
  const indexHtml = await indexRes.text();
  return new Response(indexHtml, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
}
