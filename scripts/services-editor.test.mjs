import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateServices } from './services-editor.mjs';

const original = JSON.parse(await readFile(new URL('../services.json', import.meta.url), 'utf8'));

test('accepts the existing service directory', () => {
  assert.equal(validateServices(original), original);
});

for (const [label, change, message] of [
  ['invalid URL scheme', data => { data.categories[0].services[0].url = 'javascript:alert(1)'; }, /HTTP\(S\)/],
  ['unknown icon', data => { data.categories[0].services[0].icon = 'not-a-real-icon'; }, /unknown Lucide/],
  ['empty name', data => { data.categories[0].services[0].name = ''; }, /name is required/],
  ['duplicate URL', data => { data.categories[0].services[1].url = data.categories[0].services[0].url; }, /Duplicate URL/],
  ['invalid privacy', data => { data.categories[0].services[0].private = 'yes'; }, /privacy must be a boolean/],
  ['invalid visibility', data => { data.categories[0].services[0].hidden = 'yes'; }, /visibility must be a boolean/],
  ['duplicate category', data => { data.categories[1].id = data.categories[0].id; }, /Duplicate category/],
  ['invalid category ID', data => { data.categories[0].id = 'Wrong ID'; }, /lowercase letters/],
  ['invalid category icon', data => { data.categories[0].icon = 'not-a-real-icon'; }, /unknown Lucide/],
  ['invalid alternate URL', data => { data.categories[0].services[0].alternates = [{ url: 'javascript:alert(1)', type: 'alias' }]; }, /HTTP\(S\)/],
  ['duplicate alternate URL', data => { data.categories[0].services[0].alternates = [{ url: data.categories[0].services[0].url + '/', type: 'alias' }]; }, /Duplicate URL/],
  ['invalid alternate type', data => { data.categories[0].services[0].alternates = [{ url: 'https://other.pmh.codes', type: 'other' }]; }, /alias or redirect/],
  ['invalid alternate availability', data => { data.categories[0].services[0].alternates = [{ url: 'https://other.pmh.codes', type: 'alias', unavailable: 'yes' }]; }, /availability must be a boolean/],
]) {
  test(`rejects ${label}`, () => {
    const data = structuredClone(original);
    change(data);
    assert.throws(() => validateServices(data), message);
  });
}
