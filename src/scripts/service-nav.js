const root = document.querySelector('[data-service-nav]');
const panel = root.querySelector('#service-launcher');
const input = root.querySelector('#service-search');
const toggle = root.querySelector('.service-nav-toggle');
const clear = root.querySelector('.service-search-clear');
const filters = [...root.querySelectorAll('[data-filter]')];
const results = [...root.querySelectorAll('.launcher-result')];
const favoriteLinks = root.querySelector('.service-favorites-links');
const favoritesBar = root.querySelector('.service-favorites');
const favoriteButtons = [...root.querySelectorAll('[data-favorite-url]')];
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
let favorites = [...favoriteLinks.querySelectorAll('a')].map(link => link.href);

try {
  const stored = JSON.parse(localStorage.getItem('pmh-favorite-services') || 'null');
  if (Array.isArray(stored)) favorites = [...new Set(stored.map(url => serviceForUrl.get(url)).filter(Boolean))];
} catch { /* Keep the defaults when storage is unavailable. */ }

function saveFavorites() {
  try { localStorage.setItem('pmh-favorite-services', JSON.stringify(favorites)); } catch { /* Favorites still work for this visit. */ }
}

function updateFavorites() {
  favoriteLinks.replaceChildren();
  for (const url of favorites) {
    const result = results.find(result => result.href === url);
    if (!result) continue;
    const link = document.createElement('a');
    link.href = url;
    link.className = 'service-favorite';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.draggable = true;
    link.title = `${result.querySelector('.launcher-result-desc').textContent} — Drag to reorder (or Alt + Left/Right)`;
    link.setAttribute('aria-keyshortcuts', 'Alt+ArrowLeft Alt+ArrowRight');
    const name = document.createElement('span');
    name.textContent = result.querySelector('.launcher-result-name').firstChild.textContent.trim();
    link.append(result.querySelector('svg').cloneNode(true), name);
    favoriteLinks.append(link);
  }
  if (!favorites.length) {
    const hint = document.createElement('span');
    hint.className = 'service-favorites-empty';
    hint.textContent = 'Star services in the launcher to pin them here.';
    favoriteLinks.append(hint);
  }
  for (const button of favoriteButtons) {
    const url = new URL(button.dataset.favoriteUrl).href;
    const selected = favorites.includes(url);
    const name = results.find(result => result.href === url).querySelector('.launcher-result-name').firstChild.textContent.trim();
    const label = `${selected ? 'Remove' : 'Add'} ${name} ${selected ? 'from' : 'to'} favorites`;
    button.setAttribute('aria-pressed', String(selected));
    button.setAttribute('aria-label', label);
    button.title = label;
  }
}

let draggedFavorite = null;
let scrollAnchor = window.scrollY;
let scrollTransitionUntil = 0;

function setFavoritesHidden(hidden) {
  if (root.classList.contains('favorites-hidden') === hidden) return;
  root.classList.toggle('favorites-hidden', hidden);
  // Collapsing the bar can move the document's scroll anchor. Do not treat
  // those layout-driven scroll events as a change in the user's direction.
  scrollTransitionUntil = performance.now() + 220;
}

window.addEventListener('scroll', () => {
  const scrollY = Math.max(0, Math.min(window.scrollY, document.documentElement.scrollHeight - window.innerHeight));
  if (scrollY === 0) {
    setFavoritesHidden(false);
    scrollAnchor = scrollY;
    return;
  }
  if (performance.now() < scrollTransitionUntil) {
    scrollAnchor = scrollY;
    return;
  }
  const hidden = root.classList.contains('favorites-hidden');
  // Track the directional extreme, so tiny reversals and touchpad inertia
  // cannot repeatedly toggle the bar around a single threshold.
  scrollAnchor = hidden ? Math.max(scrollAnchor, scrollY) : Math.min(scrollAnchor, scrollY);
  const delta = scrollY - scrollAnchor;
  if (hidden && delta <= -32) {
    setFavoritesHidden(false);
    scrollAnchor = scrollY;
  } else if (!hidden && delta >= 24 && scrollY > root.offsetHeight) {
    setFavoritesHidden(!favoritesBar.contains(document.activeElement) && !draggedFavorite);
    scrollAnchor = scrollY;
  }
}, { passive: true });

favoritesBar.addEventListener('focusin', () => {
  setFavoritesHidden(false);
  scrollAnchor = window.scrollY;
});

favoriteLinks.addEventListener('dragstart', event => {
  const link = event.target.closest('.service-favorite');
  if (!link) return;
  draggedFavorite = link;
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', link.href);
  link.classList.add('is-dragging');
});

favoriteLinks.addEventListener('dragover', event => {
  if (!draggedFavorite) return;
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
  const next = [...favoriteLinks.querySelectorAll('.service-favorite')].find(link => {
    if (link === draggedFavorite) return false;
    const bounds = link.getBoundingClientRect();
    return event.clientX < bounds.left + bounds.width / 2;
  });
  favoriteLinks.insertBefore(draggedFavorite, next || null);
  const bounds = favoriteLinks.getBoundingClientRect();
  if (event.clientX < bounds.left + 24) favoriteLinks.scrollLeft -= 12;
  else if (event.clientX > bounds.right - 24) favoriteLinks.scrollLeft += 12;
});

favoriteLinks.addEventListener('drop', event => {
  if (!draggedFavorite) return;
  event.preventDefault();
  favorites = [...favoriteLinks.querySelectorAll('.service-favorite')].map(link => link.href);
  saveFavorites();
});

favoriteLinks.addEventListener('dragend', () => {
  draggedFavorite = null;
  updateFavorites();
});

favoriteLinks.addEventListener('keydown', event => {
  const link = event.target.closest('.service-favorite');
  if (!link || !event.altKey || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
  event.preventDefault();
  const index = favorites.indexOf(link.href);
  const next = index + (event.key === 'ArrowLeft' ? -1 : 1);
  if (next < 0 || next >= favorites.length) return;
  [favorites[index], favorites[next]] = [favorites[next], favorites[index]];
  saveFavorites();
  updateFavorites();
  favoriteLinks.querySelectorAll('.service-favorite')[next].focus();
});

for (const button of favoriteButtons) button.addEventListener('click', () => {
  const url = new URL(button.dataset.favoriteUrl).href;
  favorites = favorites.includes(url) ? favorites.filter(favorite => favorite !== url) : [...favorites, url];
  saveFavorites();
  updateFavorites();
});

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
    result.parentElement.hidden = result.hidden;
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
  for (const result of ordered) list.append(result.parentElement);
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
   const link = event.target.closest('a.service-item, a.launcher-result, a.service-favorite, a[data-primary-url]');
  if (!link) return;
  const primary = serviceForUrl.get(link.href) || new URL(link.dataset.primaryUrl || link.href, location.href).href;
  recent = [primary, ...recent.filter(url => url !== primary)].slice(0, 8);
  try { localStorage.setItem('pmh-recent-services', JSON.stringify(recent)); } catch { /* Navigation still works without storage. */ }
  if (link.classList.contains('launcher-result')) close(true);
});

updateFavorites();
update();
