export const config = { runtime: "edge" };

const SUPABASE_URL  = "https://mvkcgrextvxlzkqsyscm.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12a2NncmV4dHZ4bHprcXN5c2NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMjIwNDcsImV4cCI6MjA4ODc5ODA0N30.dvVbB0E5F-vhZMYlzIl4r-N1jOrRgrNZsp4xbDI_Nho";
const DOMAIN        = "https://marcheduroi.com";

const SOCIAL_BOTS = [
  "facebookexternalhit", "facebot", "twitterbot", "whatsapp",
  "telegrambot", "linkedinbot", "slackbot", "discordbot",
  "googlebot", "bingbot", "applebot", "ia_archiver"
];

export default async function handler(req) {
  const url      = new URL(req.url);
  const segments = url.pathname.split("/").filter(Boolean);
  const slug     = segments[1];

  if (!slug) {
    return new Response(null, { 
      status: 301, 
      headers: { 
        "Location": DOMAIN,
        "Cache-Control": "public, max-age=31536000"
      } 
    });
  }

  const ua = (req.headers.get("user-agent") || "").toLowerCase();
  const isBot = SOCIAL_BOTS.some(bot => ua.includes(bot));

  if (isBot) {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/structures?slug=eq.${encodeURIComponent(slug)}&select=name,type,slogan,ville,logo_url,cover_url,photos,active&limit=1`,
        { headers: { "apikey": SUPABASE_ANON, "Authorization": `Bearer ${SUPABASE_ANON}` } }
      );
      const data = await res.json();
      const s = data?.[0];

      if (!s || !s.active) {
        return new Response(null, { 
          status: 301, 
          headers: { 
            "Location": `${DOMAIN}/`,
            "Cache-Control": "public, max-age=86400"
          } 
        });
      }

      const photo = s.cover_url || (s.photos?.[0]) || s.logo_url || `${DOMAIN}/marcheduRoi-icon.svg`;
      const title = `${s.name} — ${s.type} | MarchéduRoi`;
      const desc  = s.slogan || `Découvrez ${s.name}${s.ville ? " à " + s.ville : ""} sur MarchéduRoi 👑`;
      const pageUrl = `${DOMAIN}/vitrine/${slug}`;

      const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
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
  <link rel="canonical" href="${pageUrl}"/>
</head>
<body>
  <p><a href="${pageUrl}">${title}</a></p>
</body>
</html>`;

      return new Response(html, {
        status: 200,
        headers: { 
          "Content-Type": "text/html; charset=utf-8", 
          "Cache-Control": "public, max-age=300, stale-while-revalidate=86400"
        }
      });

    } catch (e) {
      return new Response(null, { 
        status: 301, 
        headers: { 
          "Location": `${DOMAIN}/vitrine/${slug}`,
          "Cache-Control": "public, max-age=300"
        } 
      });
    }
  }

  try {
    const indexRes = await fetch(`${DOMAIN}/index.html`);
    if (!indexRes.ok) throw new Error("index.html not found");
    
    const indexHtml = await indexRes.text();
    return new Response(indexHtml, {
      status: 200,
      headers: { 
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600"
      }
    });
  } catch (e) {
    return new Response(null, { 
      status: 302, 
      headers: { "Location": `${DOMAIN}/vitrine/${slug}` } 
    });
  }
}
