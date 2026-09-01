// generate-product-pages.js
const SUPABASE_URL = 'https://fghhbmdgelnpirysbusl.supabase.co';
const SUPABASE_KEY = 'sb_publishable_nuTN31ISqVeDBFDrCiWf-g_MQWA4Fs4';
const SITE_URL = 'https://shivlko42-jpg.github.io/graspion-store';

const fs = require('fs');
const path = require('path');

function escapeHtml(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function main() {
  const res = await fetch(SUPABASE_URL + '/rest/v1/products?select=*&status=eq.active', {
    headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY },
  });
  if (!res.ok) {
    console.error('Failed to fetch products:', await res.text());
    process.exit(1);
  }
  const products = await res.json();

  const outDir = path.join(__dirname, 'products');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const sitemapEntries = [];

  for (const p of products) {
    const title = p.seo_title || p.name;
    const description = (p.meta_description || p.short_description || p.features || p.name || '').toString().slice(0, 160);
    const pageUrl = SITE_URL + '/products/' + p.id + '.html';
    const appUrl = SITE_URL + '/?product=' + p.id;
    const inStock = Number(p.stock) > 0;

    const jsonLd = {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: p.name,
      description: description,
      sku: p.sku || undefined,
      brand: p.brand ? { '@type': 'Brand', name: p.brand } : undefined,
      offers: {
        '@type': 'Offer',
        priceCurrency: 'INR',
        price: p.price,
        availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        url: appUrl,
      },
    };

    const html = '<!DOCTYPE html>\n<html lang="en">\n<head>\n' +
      '<meta charset="UTF-8">\n' +
      '<title>' + escapeHtml(title) + ' | Graspion</title>\n' +
      '<meta name="description" content="' + escapeHtml(description) + '">\n' +
      '<link rel="canonical" href="' + pageUrl + '">\n' +
      '<meta property="og:title" content="' + escapeHtml(title) + '">\n' +
      '<meta property="og:description" content="' + escapeHtml(description) + '">\n' +
      '<meta property="og:type" content="product">\n' +
      '<meta property="og:url" content="' + pageUrl + '">\n' +
      '<script type="application/ld+json">' + JSON.stringify(jsonLd) + '</script>\n' +
      '<meta http-equiv="refresh" content="0; url=' + appUrl + '">\n' +
      '</head>\n<body>\n' +
      '<p>Redirecting to <a href="' + appUrl + '">' + escapeHtml(p.name) + '</a>&hellip;</p>\n' +
      '</body>\n</html>\n';

    fs.writeFileSync(path.join(outDir, p.id + '.html'), html);
    sitemapEntries.push(pageUrl);
  }

  const sitemapXml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    '<url><loc>' + SITE_URL + '/</loc></url>\n' +
    sitemapEntries.map(function (u) { return '<url><loc>' + u + '</loc></url>'; }).join('\n') + '\n' +
    '</urlset>\n';
  fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), sitemapXml);

  console.log('Generated ' + products.length + ' product pages and updated sitemap.xml');
}

main().catch(function (err) {
  console.error(err);
  process.exit(1);
});
