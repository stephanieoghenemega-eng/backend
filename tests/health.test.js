const assert = require('node:assert/strict');
const { test } = require('node:test');

test('health endpoint returns ok', async () => {
  const res = await fetch('http://localhost:3000/api/health');
  const body = await res.json();
  assert.equal(res.status, 200);
  assert.equal(body.status, 'ok');
});
