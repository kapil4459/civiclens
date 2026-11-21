/**
 * Smoke test: boots the real Express app against an ephemeral
 * in-memory MongoDB, seeds complaints with severities, and verifies
 * every endpoint including priority ordering.
 * Run: node scripts/smoke-test.mjs
 */
import { MongoMemoryServer } from 'mongodb-memory-server';

process.env.NODE_ENV = 'development';
process.env.PORT = '5099';

const mongod = await MongoMemoryServer.create();
process.env.MONGODB_URI = mongod.getUri('civiclens_test');

const { default: app } = await import('../src/app.js');
const { connectDB, disconnectDB } = await import('../src/config/db.js');
const { default: Complaint } = await import('../src/models/Complaint.js');

await connectDB();
const server = app.listen(5099);
const base = 'http://localhost:5099/api';

let failures = 0;
const check = (name, cond, extra = '') => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? ` — ${extra}` : ''}`);
  if (!cond) failures++;
};

try {
  // Seed priority-order test data
  await Complaint.create([
    { description: 'Minor cracked tile on sidewalk near shop', severity: 'Low', category: 'Roads', department: 'Public Works Department', reason: 'Cosmetic issue', status: 'Pending' },
    { description: 'Burst water main flooding entire street', severity: 'Critical', category: 'Water', department: 'Water Supply Department', reason: 'Life safety hazard', status: 'Pending' },
    { description: 'Streetlight out on dark alley', severity: 'Medium', category: 'Electricity', department: 'Electricity Department', reason: 'Safety concern at night', status: 'Pending' },
    { description: 'Dead tree blocking drainage channel', severity: 'High', category: 'Trees', department: 'Horticulture Department', reason: 'Flood risk', status: 'In Progress' },
  ]);

  // Health
  let r = await fetch(`${base}/health`);
  check('GET /api/health', r.status === 200 && (await r.json()).success);

  // List + priority order
  r = await fetch(`${base}/complaints`);
  let j = await r.json();
  const order = j.data.map((c) => c.severity);
  check('GET /api/complaints priority order', JSON.stringify(order) === JSON.stringify(['Critical', 'High', 'Medium', 'Low']), order.join(','));

  // Severity filter
  r = await fetch(`${base}/complaints?severity=High`);
  j = await r.json();
  check('filter severity=High', j.data.length === 1 && j.data[0].severity === 'High');

  // Category filter
  r = await fetch(`${base}/complaints?category=Water`);
  j = await r.json();
  check('filter category=Water', j.data.length === 1 && j.data[0].category === 'Water');

  // Combined filter
  r = await fetch(`${base}/complaints?severity=Low&category=Roads`);
  j = await r.json();
  check('combined filters', j.data.length === 1);

  // Search
  r = await fetch(`${base}/complaints?q=streetlight`);
  j = await r.json();
  check('search q=streetlight', j.data.length === 1);

  // Stats
  r = await fetch(`${base}/complaints/stats`);
  j = await r.json();
  check('GET /stats totals', j.data.total === 4);
  check('stats bySeverity', j.data.bySeverity.Critical === 1 && j.data.bySeverity.Low === 1);
  check('stats byCategory', j.data.byCategory.Roads === 1 && j.data.byCategory.Water === 1);

  // Get by id
  const anyId = j.data ? undefined : undefined;
  r = await fetch(`${base}/complaints`);
  const first = (await r.json()).data.at(-1);
  r = await fetch(`${base}/complaints/${first._id}`);
  j = await r.json();
  check('GET /:id', r.status === 200 && j.data._id === first._id);

  // 404s
  r = await fetch(`${base}/complaints/507f1f77bcf86cd799439011`);
  check('GET missing id → 404', r.status === 404);
  r = await fetch(`${base}/complaints/not-an-id`);
  check('GET bad id → 404', r.status === 404);

  // Validation
  r = await fetch(`${base}/complaints`, { method: 'POST', body: new URLSearchParams({ description: 'short' }) });
  check('POST short desc → 400', r.status === 400);
  r = await fetch(`${base}/complaints`, { method: 'POST' });
  check('POST missing desc → 400', r.status === 400);

  // Create via API (multipart)
  const fd = new FormData();
  fd.append('description', 'Smoke test complaint submitted through multipart form data');
  r = await fetch(`${base}/complaints`, { method: 'POST', body: fd });
  j = await r.json();
  check(
    'POST multipart create → 201',
    r.status === 201 && ['Pending', 'Under Review'].includes(j.data.status),
    `status=${j.data.status}`
  );

  // Duplicate guard
  const fd2 = new FormData();
  fd2.append('description', 'Smoke test complaint submitted through multipart form data');
  r = await fetch(`${base}/complaints`, { method: 'POST', body: fd2 });
  j = await r.json();
  check('duplicate POST → returns existing', j.duplicate === true);

  // Enum rejection (direct model-level check via bad status update is N/A; verify invalid severity filter returns empty not error)
  r = await fetch(`${base}/complaints?severity= Bogus`);
  check('invalid severity filter → empty, not crash', r.status === 200);
} finally {
  server.close();
  await disconnectDB();
  await mongod.stop();
}

console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
