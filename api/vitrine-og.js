// api/vitrine-og.js — Vercel Edge Function
// Retourne une page HTML avec les bonnes meta OG pour chaque vitrine
// URL : marcheduroi.com/api/vitrine-og?slug=restaurant-chez-tante-rosine-calavi

export const config = { runtime: "edge" };

const SUPABASE_URL  = "https://mvkcgrextvxlzkqsyscm.supabase.co";
const SUPABASE_KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12a2NncmV4dHZ4bHprcXN5c2NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMjIwNDcsImV4cCI6MjA4ODc5ODA0N30.dvVbB0E5F-vhZMYlzIl4r-N1jOrRgrNZsp4xbDI_Nho";
const DOMAIN        = "https://marcheduroi.com";
const DEFAULT_IMAGE = `${DOMAIN}/icons/icon-512x512.png`;

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  // Valeurs par défaut
  let title       = "MarchéduRoi — Annonces, Boutiques & Services au Bénin";
  let description = "Achetez, vendez, découvrez des boutiques, restaurants et services près de chez vous au Bénin et en Afrique.";
  let image       = DEFAULT_IMAGE;
  let url         = DOMAIN;
  let type        = "website";

  // Charger les données de la vitrine depuis Supabase
  if (slug) {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/structures?slug=eq.${encodeURIComponent(slug)}&active=is.true&select=name,type,slogan,description,cover_url,logo_url,photos,ville&limit=1`,
        {
          headers: {
            "apikey":        SUPABASE_KEY,
            "Authorization": `Bearer ${SUPABASE_KEY}`,
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        const s = data?.[0];
        if (s) {
          title       = `${s.name} — ${s.type}${s.ville ? ` à ${s.ville}` : ""} | MarchéduRoi`;
          description = (s.description || s.slogan || `Découvrez ${s.name}, ${s.type} sur MarchéduRoi`).slice(0, 160);
          image       = s.cover_url || s.logo_url || (s.photos?.[0]) || DEFAULT_IMAGE;
          url         = `${DOMAIN}/vitrine/${slug}`;
          type        = "local.business";
        }
      }
    } catch (e) {
      // Silencieux — utiliser les valeurs par défaut
    }
  }

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>${title}</title>
  <meta property="og:title"       content="${title}"/>
  <meta property="og:description" content="${description}"/>
  <meta property="og:image"       content="${image}"/>
  <meta property="og:url"         content="${url}"/>
  <meta property="og:type"        content="${type}"/>
  <meta property="og:site_name"   content="MarchéduRoi"/>
  <meta property="og:locale"      content="fr_BJ"/>
  <meta name="twitter:card"        content="summary_large_image"/>
  <meta name="twitter:title"       content="${title}"/>
  <meta name="twitter:description" content="${description}"/>
  <meta name="twitter:image"       content="${image}"/>
  <link rel="canonical" href="${url}"/>
  <!-- Redirection douce pour les visiteurs humains uniquement -->
  <script>
    var ua = navigator.userAgent || '';
    var isScraper = /facebookexternalhit|Facebot|WhatsApp|Twitterbot|LinkedInBot|Slackbot/i.test(ua);
    if (!isScraper) window.location.replace("${url}");
  </script>
</head>
<body>
  <p><a href="${url}">${title}</a></p>
</body>
</html>`;

  return new Response(html, {
    headers: {
      "Content-Type":  "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
    },
  });
}
