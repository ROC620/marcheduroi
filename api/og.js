// api/og.js — Vercel Edge Function
// Génère des meta OG dynamiques pour chaque annonce
// avec logo MarchéduRoi en coin haut-gauche sur la photo

export const config = { runtime: 'edge' };

const SUPABASE_URL = 'https://mvkcgrextvxlzkqsyscm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12a2NncmV4dHZ4bHprcXN5c2NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMjIwNDcsImV4cCI6MjA4ODc5ODA0N30.dvVbB0E5F-vhZMYlzIl4r-N1jOrRgrNZsp4xbDI_Nho';

const LOGO_URL = 'https://marcheduroi.com/marcheduRoi-icon.svg';
const SITE_URL = 'https://marcheduroi.com';
const DEFAULT_IMAGE = 'https://marcheduroi.com/icons/icon-512x512.png';
const SLOGAN = 'Sur MarchéduRoi, vous êtes le Roi du Marché';

function getTableAndId(pathname) {
  const patterns = [
    { regex: /^\/annonce\/(.+)$/, table: 'posts', titleField: 'title' },
    { regex: /^\/boutique\/(.+)$/, table: 'boutiques', titleField: 'name' },
    { regex: /^\/atelier\/(.+)$/, table: 'ateliers', titleField: 'name' },
    { regex: /^\/resto\/(.+)$/, table: 'restos', titleField: 'name' },
    { regex: /^\/beaute\/(.+)$/, table: 'beaute', titleField: 'name' },
  ];
  for (const p of patterns) {
    const m = pathname.match(p.regex);
    if (m) return { table: p.table, id: m[1], titleField: p.titleField };
  }
  return null;
}

function formatPrice(rawPrice) {
  if (!rawPrice) return null;
  const digits = String(rawPrice).replace(/[^0-9]/g, '');
  if (!digits) return null;
  const num = parseInt(digits);
  return num.toLocaleString('fr-FR').replace(/\u202f|\s/g, ' ') + ' FCFA';
}

function buildHtml({ title, description, image, url, price }) {
  const priceStr = price || '';
  const fullTitle = priceStr
    ? title + ' — ' + priceStr + ' | MarchéduRoi'
    : title + ' | MarchéduRoi';
  const fullDesc = title + (priceStr ? ' — ' + priceStr : '') + '. ' + SLOGAN + ' - marcheduroi.com';
  const ogImage = image || DEFAULT_IMAGE;

  return '<!DOCTYPE html>\n<html lang="fr">\n<head>\n' +
    '<meta charset="UTF-8" />\n' +
    '<title>' + fullTitle + '</title>\n' +
    '<meta name="description" content="' + fullDesc + '" />\n' +
    '<meta property="og:title" content="' + fullTitle + '" />\n' +
    '<meta property="og:description" content="' + fullDesc + '" />\n' +
    '<meta property="og:image" content="' + ogImage + '" />\n' +
    '<meta property="og:image:width" content="1200" />\n' +
    '<meta property="og:image:height" content="630" />\n' +
    '<meta property="og:url" content="' + url + '" />\n' +
    '<meta property="og:type" content="website" />\n' +
    '<meta property="og:site_name" content="MarchéduRoi" />\n' +
    '<meta name="twitter:card" content="summary_large_image" />\n' +
    '<meta name="twitter:title" content="' + fullTitle + '" />\n' +
    '<meta name="twitter:description" content="' + fullDesc + '" />\n' +
    '<meta name="twitter:image" content="' + ogImage + '" />\n' +
    '<script>if(typeof window!=="undefined"&&!window.location.search.includes("from=og")){window.location.replace("' + url + '?from=og");}</script>\n' +
    '</head>\n<body style="background:#0D0F1A;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:20px;">\n' +
    '<div style="max-width:480px;width:100%;text-align:center;">\n' +
    '<img src="' + LOGO_URL + '" style="width:72px;margin-bottom:16px;" />\n' +
    '<div style="position:relative;border-radius:16px;overflow:hidden;margin-bottom:20px;">\n' +
    '<img src="' + ogImage + '" style="width:100%;max-height:300px;object-fit:cover;display:block;" />\n' +
    '<div style="position:absolute;top:10px;left:10px;background:rgba(0,0,0,0.65);border-radius:8px;padding:4px 8px;display:flex;align-items:center;gap:6px;">\n' +
    '<img src="' + LOGO_URL + '" style="width:20px;" />\n' +
    '<span style="color:#FFD700;font-size:11px;font-weight:700;">MarchéduRoi</span>\n' +
    '</div></div>\n' +
    '<h1 style="font-size:22px;font-weight:800;margin:0 0 8px;">' + title + '</h1>\n' +
    (priceStr ? '<p style="font-size:24px;font-weight:800;color:#43C6AC;margin:0 0 8px;">' + priceStr + '</p>\n' : '') +
    '<p style="color:#FFD700;font-style:italic;font-weight:700;margin:0 0 20px;">&ldquo;' + SLOGAN + ' &#128081;&rdquo;</p>\n' +
    '<a href="' + url + '" style="background:linear-gradient(135deg,#6C63FF,#FF6584);color:#fff;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:800;">Voir l'annonce &rarr;</a>\n' +
    '</div></body></html>';
}

export default async function handler(req) {
  const url = new URL(req.url);
  const pathname = url.pathname;
  const ua = req.headers.get('user-agent') || '';
  const isCrawler = /facebookexternalhit|Twitterbot|WhatsApp|TelegramBot|LinkedInBot|Slackbot|Googlebot|bingbot|Applebot|Discordbot|vk|pinterest/i.test(ua);
  const match = getTableAndId(pathname);

  if (!match || !isCrawler) {
    return new Response(null, {
      status: 302,
      headers: { 'Location': SITE_URL + pathname + url.search + url.hash }
    });
  }

  try {
    const apiUrl = SUPABASE_URL + '/rest/v1/' + match.table + '?id=eq.' + match.id + '&select=*&limit=1';
    const resp = await fetch(apiUrl, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
    });
    const data = await resp.json();
    const item = data?.[0];

    if (!item) {
      return new Response(buildHtml({ title: 'MarchéduRoi', description: SLOGAN, image: DEFAULT_IMAGE, url: SITE_URL, price: null }),
        { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    const title = item[match.titleField] || item.title || item.name || 'MarchéduRoi';
    const description = item.description || '';
    const price = formatPrice(item.price);
    const photo = (item.photos || [])[0] || null;
    const pageUrl = SITE_URL + pathname;

    return new Response(buildHtml({ title, description, image: photo || DEFAULT_IMAGE, url: pageUrl, price }),
      { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 's-maxage=300' } });

  } catch (e) {
    return new Response(buildHtml({ title: 'MarchéduRoi', description: SLOGAN, image: DEFAULT_IMAGE, url: SITE_URL, price: null }),
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }
}
