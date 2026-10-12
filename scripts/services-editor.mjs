import { readFile, writeFile, rename, unlink } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import { icons } from 'lucide';

const dataFile = new URL('../services.json', import.meta.url);
const editorFile = new URL('../src/editor/index.html', import.meta.url);
const revision = source => createHash('sha256').update(source).digest('hex');
const iconKey = name => name.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');

export function validateServices(data) {
  const fail = message => { throw new Error(message); };
  const text = (value, label) => {
    if (typeof value !== 'string' || !value.trim()) fail(`${label} is required.`);
  };
  const icon = (value, label) => {
    text(value, label);
    if (!Object.hasOwn(icons, iconKey(value))) fail(`${label}: unknown Lucide icon "${value}".`);
  };
  if (!data || !Array.isArray(data.categories) || !data.categories.length) fail('At least one category is required.');
  const ids = new Set();
  const urls = new Set();
  const checkUrl = (value, label) => {
    text(value, `${label} URL`);
    let url;
    try { url = new URL(value); } catch { fail(`${label}: enter a valid URL.`); }
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) fail(`${label}: use an HTTP(S) URL without credentials.`);
    if (urls.has(url.href)) fail(`Duplicate URL: ${value}.`);
    urls.add(url.href);
  };
  for (const category of data.categories) {
    if (!category || typeof category !== 'object') fail('Invalid category.');
    text(category.id, 'Category ID');
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(category.id)) fail('Category ID must use lowercase letters, numbers, and hyphens.');
    if (ids.has(category.id)) fail(`Duplicate category ID: ${category.id}.`);
    ids.add(category.id);
    text(category.label, 'Category label');
    text(category.cssClass, 'Category CSS class');
    icon(category.icon, `${category.label} icon`);
    if (category.allPrivate !== undefined && typeof category.allPrivate !== 'boolean') fail('Category privacy must be a boolean.');
    if (!Array.isArray(category.services)) fail(`${category.label}: services must be a list.`);
    for (const service of category.services) {
      if (!service || typeof service !== 'object') fail('Invalid service.');
      text(service.name, 'Service name');
      text(service.desc, `${service.name} description`);
      icon(service.icon, `${service.name} icon`);
      checkUrl(service.url, service.name);
      if (service.private !== undefined && typeof service.private !== 'boolean') fail(`${service.name}: privacy must be a boolean.`);
      if (service.hidden !== undefined && typeof service.hidden !== 'boolean') fail(`${service.name}: visibility must be a boolean.`);
      if (service.alternates !== undefined) {
        if (!Array.isArray(service.alternates)) fail(`${service.name}: alternate addresses must be a list.`);
        for (const address of service.alternates) {
          if (!address || typeof address !== 'object') fail(`${service.name}: invalid alternate address.`);
          checkUrl(address.url, `${service.name} alternate address`);
          if (!['alias', 'redirect'].includes(address.type)) fail(`${service.name}: address type must be alias or redirect.`);
          if (address.unavailable !== undefined && typeof address.unavailable !== 'boolean') fail(`${service.name}: address availability must be a boolean.`);
        }
      }
    }
  }
  return data;
}

function send(response, status, data, type = 'application/json') {
  response.writeHead(status, {
    'Content-Type': `${type}; charset=utf-8`,
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; frame-ancestors 'none'; base-uri 'none'",
  });
  response.end(type === 'application/json' ? JSON.stringify(data) : data);
}

export default function servicesEditor() {
  let writes = Promise.resolve();
  return {
    name: 'local-services-editor',
    hooks: {
      'astro:server:setup': ({ server, logger }) => {
        logger.info('Local services editor: /__services');
        server.middlewares.use(async (request, response, next) => {
          const path = request.url?.split('?')[0];
          if (!['/__services', '/__services/', '/__services/data'].includes(path)) return next();
          const address = request.socket.remoteAddress;
          let origin;
          try { origin = new URL(`http://${request.headers.host}`); } catch { return send(response, 403, { error: 'Local access only.' }); }
          if (!['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(address) ||
              !['localhost', '127.0.0.1', '[::1]'].includes(origin.hostname) ||
              request.headers['sec-fetch-site'] === 'cross-site') {
            return send(response, 403, { error: 'Local access only.' });
          }
          try {
            if (path !== '/__services/data') {
              if (request.method !== 'GET') return send(response, 405, { error: 'Method not allowed.' });
              return send(response, 200, await readFile(editorFile, 'utf8'), 'text/html');
            }
            if (request.method === 'GET') {
              const source = await readFile(dataFile, 'utf8');
              return send(response, 200, { data: JSON.parse(source), revision: revision(source) });
            }
            if (request.method !== 'PUT') return send(response, 405, { error: 'Method not allowed.' });
            if (request.headers.origin !== origin.origin) return send(response, 403, { error: 'Same-origin saves only.' });
            if (!request.headers['content-type']?.startsWith('application/json')) return send(response, 415, { error: 'Send JSON data.' });
            let body = '';
            for await (const chunk of request) {
              body += chunk;
              if (Buffer.byteLength(body) > 128 * 1024) return send(response, 413, { error: 'Service data is too large.' });
            }
            let input;
            try { input = JSON.parse(body); validateServices(input.data); }
            catch (error) { return send(response, 400, { error: error.message }); }
            const save = async () => {
              const current = await readFile(dataFile, 'utf8');
              if (input.revision !== revision(current)) return send(response, 409, { error: 'services.json changed outside this editor. Reload before saving to avoid overwriting changes.' });
              const source = JSON.stringify(input.data, null, 2) + '\n';
              const temporary = new URL(`../.services-${randomUUID()}.tmp`, import.meta.url);
              try {
                await writeFile(temporary, source, { flag: 'wx' });
                await rename(temporary, dataFile);
              } finally { await unlink(temporary).catch(() => {}); }
              send(response, 200, { revision: revision(source) });
            };
            const pending = writes.then(save);
            writes = pending.catch(() => {});
            await pending;
          } catch (error) {
            logger.error(error.message);
            if (!response.headersSent) send(response, 500, { error: 'Could not read or save services.json. Check the dev server logs.' });
          }
        });
      },
    },
  };
}
