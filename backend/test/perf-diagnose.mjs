/**
 * Diagnóstico: 1 sola petición al endpoint real con output completo
 * Uso: PERF_EMAIL=x PERF_PASSWORD=y node test/perf-diagnose.mjs
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL  = 'https://yzizzghmgdvwnkmxshla.supabase.co';
const SUPABASE_ANON = 'sb_publishable_kiKN_6Q1Dno2GEbkmwqpcQ_lxAL_Tny';
const EMAIL    = process.env.PERF_EMAIL;
const PASSWORD = process.env.PERF_PASSWORD;

if (!EMAIL || !PASSWORD) { console.error('Faltan PERF_EMAIL y PERF_PASSWORD'); process.exit(1); }

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
const { data, error } = await supabase.auth.signInWithPassword({ email: EMAIL, password: PASSWORD });
if (error) { console.error('Auth error:', error.message); process.exit(1); }

const token = data.session.access_token;
console.log('Token obtenido ✓ (primeros 40 chars):', token.slice(0, 40) + '...');

console.log('\nEjecutando petición a POST /api/recommendations/generate ...\n');
const t0 = Date.now();

let statusCode, bodyText;
try {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), 45_000);

  const res = await fetch('http://localhost:3000/api/recommendations/generate', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body:    JSON.stringify({ risk_override: 5 }),
    signal:  controller.signal,
  });

  statusCode = res.status;
  bodyText   = await res.text();
} catch (err) {
  console.log(`ERROR de red: ${err.name} — ${err.message}`);
  console.log(`Tiempo transcurrido: ${Date.now() - t0} ms`);
  process.exit(1);
}

const elapsed = Date.now() - t0;
console.log(`HTTP Status: ${statusCode}`);
console.log(`Tiempo:      ${elapsed} ms`);
console.log(`Body (primeros 500 chars):\n${bodyText.slice(0, 500)}`);
