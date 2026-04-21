const assert = require('node:assert/strict');
const { test } = require('node:test');

const BASE = 'http://localhost:3000/api';

test('POST /api/users requires wallet', async () => {
  const res = await fetch(`${BASE}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.ok(body.error);
});

test('PATCH /api/users/:id/role rejects invalid role', async () => {
  const res = await fetch(`${BASE}/users/fake-id/role`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'admin' }),
  });
  assert.equal(res.status, 400);
});
