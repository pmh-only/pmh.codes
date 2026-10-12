const root = document.querySelector('[data-service-nav]');
const panel = root.querySelector('#service-launcher');
const input = root.querySelector('#service-search');
const toggle = root.querySelector('.service-nav-toggle');
const clear = root.querySelector('.service-search-clear');
const filters = [...root.querySelectorAll('[data-filter]')];
const results = [...root.querySelectorAll('.launcher-result')];
const serviceForUrl = new Map();
for (const result of results) {
  serviceForUrl.set(result.href, result.href);
  for (const url of JSON.parse(result.dataset.alternateUrls)) serviceForUrl.set(url, result.href);
}
const heading = root.querySelector('.launcher-heading h2');
const count = root.querySelector('.launcher-count');
const empty = root.querySelector('.launcher-empty');
let filter = 'all';
let recent = [];

try {
  const stored = JSON.parse(localStorage.getItem('pmh-recent-services') || '[]');
  if (Array.isArray(stored)) recent = [...new Set(stored.map(url => serviceForUrl.get(url)).filter(Boolean))].slice(0, 8);
} catch { /* Storage can be unavailable in private browsing. */ }

function visibleResults() { return [...root.querySelectorAll('.launcher-result')].filter(result => !result.hidden); }

function update() {
  clear.hidden = input.value.length === 0;
  const terms = input.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
  for (const result of results) {
    const inCategory = filter === 'all' || (filter === 'recent' ? recent.includes(result.href) : result.dataset.category === filter);
    result.hidden = !inCategory || !terms.every(term => result.dataset.search.includes(term));
  }
  const visible = visibleResults();
  heading.textContent = input.value.trim() ? 'Search results' : filters.find(button => button.dataset.filter === filter).textContent.trim();
  count.textContent = `${visible.length} ${visible.length === 1 ? 'service' : 'services'}`;
  empty.hidden = visible.length > 0;
  empty.textContent = filter === 'recent' && !recent.length ? 'Services you open will appear here.' : 'No matching services. Try another name or hostname.';
  for (const button of filters) button.setAttribute('aria-pressed', String(button.dataset.filter === filter));
  const ordered = filter === 'recent'
    ? [...results].sort((a, b) => recent.indexOf(a.href) - recent.indexOf(b.href))
    : results;
  const list = root.querySelector('.launcher-results');
  for (const result of ordered) list.append(result);
  list.scrollTop = 0;
}

function open() {
  panel.hidden = false;
  toggle.setAttribute('aria-expanded', 'true');
  input.setAttribute('aria-expanded', 'true');
  update();
}

function close(returnFocus = false) {
  panel.hidden = true;
  toggle.setAttribute('aria-expanded', 'false');
  input.setAttribute('aria-expanded', 'false');
  if (returnFocus) toggle.focus();
}

toggle.addEventListener('click', () => {
  if (!panel.hidden) return close();
  open(); input.focus();
});
input.addEventListener('focus', open);
input.addEventListener('input', () => {
  filter = 'all'; open();
});
clear.addEventListener('click', () => {
  input.value = '';
  filter = 'all';
  input.focus();
  open();
});
input.addEventListener('keydown', event => {
  if (event.key === 'ArrowDown') {
    event.preventDefault(); open(); visibleResults()[0]?.focus();
  } else if (event.key === 'Enter') {
    event.preventDefault(); open(); visibleResults()[0]?.click();
  }
});

for (const button of filters) button.addEventListener('click', () => {
  filter = button.dataset.filter;
  input.value = '';
  update();
});

root.querySelector('.launcher-close').addEventListener('click', () => close(true));
root.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !panel.hidden) {
    event.preventDefault(); close(true);
  }
  if (!event.target.closest('.launcher-result') || !['ArrowDown', 'ArrowUp'].includes(event.key)) return;
  event.preventDefault();
  const visible = visibleResults();
  const next = visible.indexOf(event.target.closest('.launcher-result')) + (event.key === 'ArrowDown' ? 1 : -1);
  if (next < 0) input.focus();
  else visible[Math.min(next, visible.length - 1)]?.focus();
});

document.addEventListener('keydown', event => {
  const editing = event.target instanceof Element && (event.target.closest('input, textarea, select') || event.target.isContentEditable);
  if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey && !event.isComposing && !editing) {
    event.preventDefault(); open(); input.focus(); input.select();
    return;
  }
  if (((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') || (event.altKey && event.key.toLowerCase() === 's')) {
    event.preventDefault(); open(); input.focus(); input.select();
  }
});
document.addEventListener('pointerdown', event => {
  if (!root.contains(event.target)) close();
});
root.addEventListener('focusout', event => {
  if (event.relatedTarget && !root.contains(event.relatedTarget)) close();
});
document.addEventListener('click', event => {
  const link = event.target.closest('a.service-item, a.launcher-result, a[data-primary-url]');
  if (!link) return;
  const primary = serviceForUrl.get(link.href) || new URL(link.dataset.primaryUrl || link.href, location.href).href;
  recent = [primary, ...recent.filter(url => url !== primary)].slice(0, 8);
  try { localStorage.setItem('pmh-recent-services', JSON.stringify(recent)); } catch { /* Navigation still works without storage. */ }
  if (link.classList.contains('launcher-result')) close(true);
});

update();
