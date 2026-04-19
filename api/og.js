// api/og.js — Vercel Edge Function
export const config = { runtime: 'edge' };

const SUPABASE_URL = 'https://mvkcgrextvxlzkqsyscm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12a2NncmV4dHZ4bHprcXN5c2NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMjIwNDcsImV4cCI6MjA4ODc5ODA0N30.dvVbB0E5F-vhZMYlzIl4r-N1jOrRgrNZsp4xbDI_Nho';
const SITE_URL = 'https://marcheduroi.com';
const DEFAULT_IMAGE = 'https://marcheduroi.com/icons/icon-512x512.png';
const SLOGAN = 'Sur MarchéduRoi, vous êtes le Roi du Marché';

const TABLE_MAP = {
  posts: { table: 'posts', titleField: 'title' },
  boutiques: { table: 'boutiques', titleField: 'name' },
  ateliers: { table: 'ateliers', titleField: 'name' },
  restos: { table: 'restos', titleField: 'name' },
  beaute: { table: 'beaute', titleField: 'name' },
};

function formatPrice(rawPrice) {
  if (!rawPrice) return null;
  const digits = String(rawPrice).replace(/[^0-9]/g, '');
  if (!digits) return null;
  return parseInt(digits).toLocaleString('fr-FR').replace(/\u202f|\s/g, ' ') + ' FCFA';
}

function buildHtml(title, price, image, pageUrl) {
  const priceStr = price || '';
  const fullTitle = priceStr ? title + ' — ' + priceStr + ' | MarchéduRoi' : title + ' | MarchéduRoi';
  const fullDesc = title + (priceStr ? ' — ' + priceStr : '') + '. ' + SLOGAN + ' - marcheduroi.com';
  const ogImg = image || DEFAULT_IMAGE;

  return '<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/>'
    + '<title>' + fullTitle + '</title>'
    + '<meta name="description" content="' + fullDesc + '"/>'
    + '<meta property="og:title" content="' + fullTitle + '"/>'
    + '<meta property="og:description" content="' + fullDesc + '"/>'
    + '<meta property="og:image" content="' + ogImg + '"/>'
    + '<meta property="og:image:width" content="1200"/>'
    + '<meta property="og:image:height" content="630"/>'
    + '<meta property="og:url" content="' + pageUrl + '"/>'
    + '<meta property="og:type" content="website"/>'
    + '<meta property="og:site_name" content="MarchéduRoi"/>'
    + '<meta name="twitter:card" content="summary_large_image"/>'
    + '<meta name="twitter:title" content="' + fullTitle + '"/>'
    + '<meta name="twitter:description" content="' + fullDesc + '"/>'
    + '<meta name="twitter:image" content="' + ogImg + '"/>'
    + '<script>window.location.replace("' + pageUrl + '?from=og");</script>'
    + '</head><body style="background:#0D0F1A;color:#fff;font-family:sans-serif;text-align:center;padding:40px;">'
    + '<h1>' + fullTitle + '</h1>'
    + '<p style="color:#FFD700">' + SLOGAN + ' 👑</p>'
    + '<a href="' + pageUrl + '" style="color:#6C63FF">Voir sur MarchéduRoi</a>'
    + '</body></html>';
}

export default async function handler(req) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    const source = url.searchParams.get('source') || 'posts';
    const pathname = url.pathname;

    const ua = req.headers.get('user-agent') || '';
    const isCrawler = /facebookexternalhit|Twitterbot|WhatsApp|TelegramBot|LinkedInBot|Slackbot|Googlebot|bingbot|Applebot|Discordbot|vk|pinterest/i.test(ua);

    if (!isCrawler) {
      const dest = SITE_URL + pathname + (id ? '/' + id : '') + '?from=og';
      return new Response(null, { status: 302, headers: { 'Location': dest } });
    }

    if (!id) {
      return new Response(buildHtml('MarchéduRoi', null, DEFAULT_IMAGE, SITE_URL),
        { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    const conf = TABLE_MAP[source] || TABLE_MAP.posts;
    const apiUrl = SUPABASE_URL + '/rest/v1/' + conf.table + '?id=eq.' + id + '&select=*&limit=1';

    const resp = await fetch(apiUrl, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
    });

    const data = await resp.json();
    const item = Array.isArray(data) ? data[0] : null;

    if (!item) {
      return new Response(buildHtml('MarchéduRoi', null, DEFAULT_IMAGE, SITE_URL),
        { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    const title = String(item[conf.titleField] || item.title || item.name || 'MarchéduRoi');
    const price = formatPrice(item.price);
    const photo = Array.isArray(item.photos) ? (item.photos[0] || null) : null;
    const pageUrl = SITE_URL + '/' + source.replace('posts', 'annonce').replace('boutiques', 'boutique').replace('ateliers', 'atelier').replace('restos', 'resto') + '/' + id;
    const ogImg = photo || DEFAULT_IMAGE;

    return new Response(buildHtml(title, price, ogImg, pageUrl), {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 's-maxage=300',
      }
    });

  } catch (err) {
    return new Response(
      '<!DOCTYPE html><html><head>'
      + '<meta property="og:title" content="MarchéduRoi"/>'
      + '<meta property="og:image" content="' + DEFAULT_IMAGE + '"/>'
      + '</head><body>Error</body></html>',
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
}
