const assert = require('node:assert/strict');
const { test } = require('node:test');

const BASE = 'http://localhost:3000/api';

test('GET /api/listings rejects invalid category', async () => {
  const res = await fetch(`${BASE}/listings?category=invalid`);
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.equal(body.error, 'Validation failed');
  assert.ok(body.details.fieldErrors.category);
});

test('POST /api/listings requires seller_id, title, and price', async () => {
  const res = await fetch(`${BASE}/listings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'test' }),
  });
  assert.equal(res.status, 400);
});

test('GET /api/listings/:id returns 404 for unknown id', async () => {
  const res = await fetch(`${BASE}/listings/nonexistent-id-00000`);
  assert.equal(res.status, 404);
});
