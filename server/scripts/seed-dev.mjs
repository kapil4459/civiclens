/**
 * ⚠️  DEVELOPMENT-ONLY SEED SCRIPT — NOT FOR PRODUCTION
 *
 * Submits a set of realistic test complaints through the REAL
 * POST /api/complaints endpoint, so every record gets genuine
 * Gemini AI classification, severity, reasoning and department
 * routing — exactly as a citizen submission would.
 *
 * Prerequisites: backend running (npm run dev:server) and
 * GEMINI_API_KEY configured, otherwise tickets land "Under Review".
 *
 * Run:  node scripts/seed-dev.mjs
 */

const API = process.env.API_URL || 'http://localhost:5000/api';

const COMPLAINTS = [
  'Exposed live electrical wire hanging from a pole near the government school, children touch it daily',
  'Water main burst on the main road, flooding the street and entering nearby shops',
  'Large fallen tree has blocked the entire lane after the storm, cars cannot pass',
  'Overflowing garbage bins outside the railway station for a week, foul smell everywhere',
  'Deep potholes covering the entire stretch of MG Road, multiple vehicle damage reports',
  'Streetlight near the park entrance has been dead for a month, area unsafe at night',
  'Sewage water overflowing from the drain outside the apartment complex into the parking area',
  'Small crack in the sidewalk tile near the temple gate, cosmetic issue only',
  'बाज़ार के बाहर कूड़ेदान से कचरा बाहर निकल रहा है और बदबू आ रही है',
  'स्कूल के सामने गड्ढा बहुत गहरा हो गया है जिससे स्कूली बच्चों को गिरने का खतरा है',
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

console.log(`[seed-dev] Submitting ${COMPLAINTS.length} complaints to ${API}/complaints …\n`);

for (const [i, description] of COMPLAINTS.entries()) {
  const form = new FormData();
  form.append('description', description);
  try {
    const res = await fetch(`${API}/complaints`, { method: 'POST', body: form });
    const json = await res.json();
    const c = json.data || {};
    console.log(
      `${String(i + 1).padStart(2)}. [${c.severity || '—'}/${c.status || 'ERR'}] ${c.category || '—'} → ${c.department || '—'} | ${(c.description || '').slice(0, 60)}…`
    );
  } catch (err) {
    console.log(`${String(i + 1).padStart(2)}. FAILED: ${err.message}`);
  }
  await sleep(1500); // be polite to the Gemini rate limit
}

const stats = await (await fetch(`${API}/complaints/stats`)).json();
console.log('\n[seed-dev] Done. Current stats:', JSON.stringify(stats.data));
