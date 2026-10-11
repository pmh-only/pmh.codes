const fs = require('fs');
const path = require('path');

const template = fs.readFileSync(path.join(__dirname, 'index.template.html'), 'utf-8');
const { categories } = JSON.parse(fs.readFileSync(path.join(__dirname, 'services.json'), 'utf-8'));

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderService(service) {
  const isPrivate = service.private;
  const cls = isPrivate ? 'service-item private' : 'service-item';
  const lock = isPrivate ? '\n              <i data-lucide="lock" class="lock-icon"></i>' : '';

  return `            <a href="${escapeHtml(service.url)}" target="_blank" class="${cls}">
              <i data-lucide="${escapeHtml(service.icon)}"></i>
              <span class="service-name">${escapeHtml(service.name)}</span>${lock}
              <span class="service-desc">${escapeHtml(service.desc)}</span>
            </a>`;
}

function renderCategory(cat) {
  const listClass = cat.allPrivate ? 'service-list private-list' : 'service-list';
  const items = cat.services.map(renderService).join('\n');

  return `        <section class="service-category ${escapeHtml(cat.cssClass)}">
          <h2 class="section-heading"><i data-lucide="${escapeHtml(cat.icon)}"></i> ${escapeHtml(cat.label)} <span class="service-count">(${cat.services.length})</span></h2>
          <div class="${listClass}">
${items}
          </div>
        </section>`;
}

const servicesHtml = categories.map(renderCategory).join('\n\n');

const output = template.replace('        <!-- SERVICES -->', servicesHtml);
fs.writeFileSync(path.join(__dirname, 'index.html'), output);
console.log('Built index.html from template + services.json');

const publicUrls = categories
  .flatMap(cat => cat.services)
  .filter(s => !s.private)
  .map(s => `  <url>\n    <loc>${s.url}/</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>`)
  .join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://pmh.codes/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
${publicUrls}
</urlset>
`;

fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), sitemap);
console.log('Built sitemap.xml from services.json');
