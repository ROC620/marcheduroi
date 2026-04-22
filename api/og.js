// api/og.js — Vercel Edge Function
export const config = { runtime: 'edge' };

const SUPABASE_URL = 'https://mvkcgrextvxlzkqsyscm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12a2NncmV4dHZ4bHprcXN5c2NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMjIwNDcsImV4cCI6MjA4ODc5ODA0N30.dvVbB0E5F-vhZMYlzIl4r-N1jOrRgrNZsp4xbDI_Nho';
const SITE_URL = 'https://marcheduroi.com';
const DEFAULT_IMAGE = 'https://marcheduroi.com/icons/icon-512x512.png';
const SLOGAN = 'Sur MarchéduRoi, vous êtes le Roi du Marché';

const TABLE_MAP = {
  posts:     { table: 'posts',     titleField: 'title' },
  boutiques: { table: 'boutiques', titleField: 'name'  },
  ateliers:  { table: 'ateliers',  titleField: 'name'  },
  restos:    { table: 'restos',    titleField: 'name'  },
  beaute:    { table: 'beaute',    titleField: 'name'  },
};

function formatPrice(rawPrice) {
  if (!rawPrice) return null;
  const digits = String(rawPrice).replace(/[^0-9]/g, '');
  if (!digits) return null;
  return parseInt(digits).toLocaleString('fr-FR').replace(/\u202f|\s/g, ' ') + ' FCFA';
}

function buildCrawlerHtml(title, price, image, pageUrl) {
  const priceStr = price || '';
  const fullTitle = priceStr ? title + ' — ' + priceStr + ' | MarchéduRoi' : title + ' | MarchéduRoi';
  const fullDesc = title + (priceStr ? ' — ' + priceStr : '') + '. ' + SLOGAN + ' - marcheduroi.com';
  const ogImg = image || DEFAULT_IMAGE;

  return '<!DOCTYPE html><html lang="fr"><head>'
    + '<meta charset="UTF-8"/>'
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
    + '</head><body></body></html>';
}

function buildUserHtml(id, source, title, price, image) {
  const priceStr = price || '';
  const fullTitle = priceStr ? title + ' — ' + priceStr + ' | MarchéduRoi' : title + ' | MarchéduRoi';
  const ogImg = image || DEFAULT_IMAGE;

  // Redirige vers la racine avec l'ID en paramètre URL (évite boucle Vercel + conflits sessionStorage)
  const destUrl = SITE_URL + '/?mdr_post=' + id + '&mdr_src=' + source;
  return '<!DOCTYPE html><html lang="fr"><head>'
    + '<meta charset="UTF-8"/>'
    + '<meta name="viewport" content="width=device-width,initial-scale=1"/>'
    + '<title>' + fullTitle + '</title>'
    + '<meta property="og:image" content="' + ogImg + '"/>'
    + '<style>body{margin:0;background:#0D0F1A;display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;color:#fff;flex-direction:column;gap:12px;}</style>'
    + '</head><body>'
    + '<p style="font-size:20px">⏳</p>'
    + '<p style="color:#9A9AB0;font-size:14px">Chargement de l\'annonce...</p>'
    + '<script>window.location.replace("' + destUrl + '");</script>'
    + '</body></html>';
}

export default async function handler(req) {
  const url = new URL(req.url);
  const rawId = url.searchParams.get('id') || '';
  // Nettoyer un ID malformé contenant un chemin dupliqué (ex: "post_123/post_123")
  const id = rawId.includes('/') ? rawId.split('/')[0] : rawId;
  const source = url.searchParams.get('source') || 'posts';
  const pathname = url.pathname;

  const ua = req.headers.get('user-agent') || '';
  const isCrawler = /facebookexternalhit|Twitterbot|WhatsApp|TelegramBot|LinkedInBot|Slackbot|Googlebot|bingbot|Applebot|Discordbot|vk|pinterest/i.test(ua);

  if (!id) {
    return new Response(null, { status: 302, headers: { 'Location': SITE_URL } });
  }

  try {
    const conf = TABLE_MAP[source] || TABLE_MAP.posts;
    const apiUrl = SUPABASE_URL + '/rest/v1/' + conf.table + '?id=eq.' + id + '&select=*&limit=1';
    const resp = await fetch(apiUrl, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
    });
    const data = await resp.json();
    const item = Array.isArray(data) ? data[0] : null;

    const title = item ? (item[conf.titleField] || item.title || item.name || 'MarchéduRoi') : 'MarchéduRoi';
    const price = item ? formatPrice(item.price) : null;
    const photo = item ? ((item.photos || [])[0] || null) : null;
    const pageUrl = SITE_URL + '/' + source.replace('posts','annonce').replace('boutiques','boutique').replace('ateliers','atelier').replace('restos','resto') + '/' + id;

    if (isCrawler) {
      // Crawlers → HTML avec meta OG
      return new Response(buildCrawlerHtml(title, price, photo || DEFAULT_IMAGE, pageUrl), {
        headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 's-maxage=300' }
      });
    } else {
      // Vrais navigateurs → page intermédiaire qui stocke l'ID et redirige vers la SPA
      return new Response(buildUserHtml(id, source, title, price, photo), {
        headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }
      });
    }

  } catch (e) {
    return new Response(null, { status: 302, headers: { 'Location': SITE_URL } });
  }
}
