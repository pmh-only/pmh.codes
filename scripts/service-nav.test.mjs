import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../src/scripts/service-nav.js', import.meta.url), 'utf8');
const scrollCode = source.slice(source.indexOf('let draggedFavorite = null;'), source.indexOf("favoriteLinks.addEventListener('dragstart'"));

function setup(initialY = 0) {
  const classes = new Set();
  const listeners = {};
  let now = 0;
  let focused = false;
  const window = {
    scrollY: initialY,
    innerHeight: 800,
    addEventListener: (name, handler) => { listeners[name] = handler; },
  };
  runInNewContext(scrollCode, {
    window,
    document: { documentElement: { scrollHeight: 3000 }, activeElement: {} },
    performance: { now: () => now },
    root: {
      offsetHeight: 100,
      classList: {
        contains: name => classes.has(name),
        toggle: (name, hidden) => hidden ? classes.add(name) : classes.delete(name),
      },
    },
    favoritesBar: {
      contains: () => focused,
      addEventListener: (name, handler) => { listeners[name] = handler; },
    },
  });
  return {
    hidden: () => classes.has('favorites-hidden'),
    scroll(y, elapsed = 16) {
      now += elapsed;
      window.scrollY = y;
      listeners.scroll();
    },
    focus() { focused = true; listeners.focusin(); },
  };
}

test('small touchpad deltas accumulate, but small reversals do not flash the bar', () => {
  const nav = setup(150);
  for (const y of [154, 158, 162, 166, 170, 174]) nav.scroll(y);
  assert.equal(nav.hidden(), true);
  nav.scroll(174, 250);
  for (const y of [168, 176, 165, 172, 160]) nav.scroll(y);
  assert.equal(nav.hidden(), true);
  nav.scroll(144);
  assert.equal(nav.hidden(), false);
});

test('layout-driven scroll changes during collapse do not reopen the bar', () => {
  const nav = setup(150);
  nav.scroll(180);
  nav.scroll(140);
  nav.scroll(138);
  assert.equal(nav.hidden(), true);
  nav.scroll(138, 250);
  assert.equal(nav.hidden(), true);
  nav.scroll(106);
  assert.equal(nav.hidden(), false);
});

test('the bar remains visible near the top and reveals at the top even during animation', () => {
  const nav = setup();
  nav.scroll(30);
  nav.scroll(60);
  nav.scroll(90);
  assert.equal(nav.hidden(), false);
  nav.scroll(150);
  assert.equal(nav.hidden(), true);
  nav.scroll(-10);
  assert.equal(nav.hidden(), false);
});

test('keyboard focus reveals the bar and prevents hiding it', () => {
  const nav = setup(150);
  nav.scroll(180);
  nav.focus();
  assert.equal(nav.hidden(), false);
  nav.scroll(240, 250);
  assert.equal(nav.hidden(), false);
});

test('bottom overscroll does not cause a false direction reversal', () => {
  const nav = setup(2100);
  nav.scroll(2200);
  nav.scroll(2240, 250);
  nav.scroll(2200);
  assert.equal(nav.hidden(), true);
});
