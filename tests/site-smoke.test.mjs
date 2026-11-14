import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';
const root = resolve(import.meta.dirname, '..');
const read = name => readFileSync(resolve(root, name), 'utf8');

test('HTML loads the self-contained resource manager before search script', () => {
  const html = read('index.html');
  assert.ok(html.includes('src="resourcemanager.js"'));
  assert.ok(html.includes('src="main.js"'));
  assert.ok(html.indexOf('src="resourcemanager.js"') < html.indexOf('src="main.js"'));
  for (const id of ['courses', 'tutorials', 'labs', 'quizzes', 'searchInput']) {
    assert.ok(html.includes('id="' + id + '"'), 'missing section ' + id);
  }
});

test('resource manager preserves headings and guards optional warning element', () => {
  const src = read('resourcemanager.js');
  assert.match(src, /data-resource-list/);
  assert.match(src, /if \(warning\) warning\.style\.display/);
  assert.match(src, /rel = 'noopener noreferrer'/);
});

test('search filters resource cards and resets when the query clears', () => {
  const input = { value: 'circuit', addEventListener() {} };
  const cards = [
    { textContent: 'Circuit Analysis', style: {} },
    { textContent: 'Soldering Basics', style: {} },
  ];
  const document = {
    getElementById(id) { return id === 'searchInput' ? input : null; },
    querySelectorAll(selector) { assert.equal(selector, '.resource'); return cards; },
    addEventListener() {},
  };
  const window = { requestAnimationFrame() {} };
  vm.runInNewContext(read('main.js'), { document, window });
  assert.equal(typeof window.searchFunction, 'function');
  window.searchFunction();
  assert.equal(cards[0].style.display, '');
  assert.equal(cards[1].style.display, 'none');
  input.value = '';
  window.searchFunction();
  assert.equal(cards[1].style.display, '');
});

test('feedback uses a composed mailto and offers issues fallback, without nonexistent backend', () => {
  const html = read('index.html');
  const source = read('main.js');
  assert.doesNotMatch(html, /action="\/submit-feedback"/);
  assert.match(html, /id="feedback-form"/);
  assert.match(html, /github.com\/Tyler-Keesee\/Electrical-Engineering\/issues/);
  assert.match(source, /encodeURIComponent\(feedback\.slice\(0, 1500\)\)/);
  assert.match(source, /mailto:rescuepcrepairs@gmail\.com/);
});
