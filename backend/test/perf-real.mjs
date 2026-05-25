/**
 * 9.3 Prueba de Rendimiento — Endpoint real de recomendaciones
 *
 * Uso:
 *   PERF_EMAIL=tu@email.com PERF_PASSWORD=tupass node test/perf-real.mjs
 *
 * Requiere: backend corriendo en http://localhost:3000
 */

import { createClient } from '@supabase/supabase-js';

// ─── Configuración ────────────────────────────────────────────────────────────

const SUPABASE_URL  = 'https://yzizzghmgdvwnkmxshla.supabase.co';
const SUPABASE_ANON = 'sb_publishable_kiKN_6Q1Dno2GEbkmwqpcQ_lxAL_Tny';

const EMAIL    = process.env.PERF_EMAIL;
const PASSWORD = process.env.PERF_PASSWORD;
const BASE_URL = 'http://localhost:3000/api';
const N        = 20;  // número de solicitudes secuenciales

if (!EMAIL || !PASSWORD) {
  console.error('\n  ERROR: Debes pasar las credenciales como variables de entorno:');
  console.error('  PERF_EMAIL=tu@email.com PERF_PASSWORD=tupass node test/perf-real.mjs\n');
  process.exit(1);
}

// ─── Utilidades ───────────────────────────────────────────────────────────────

function percentile(arr, p) {
  const sorted = [...arr].sort((a, b) => a - b);
  const idx    = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

function bar(ms, max, width = 30) {
  const filled = Math.round((ms / max) * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  // 1. Autenticación con Supabase
  console.log(`\n  Autenticando como ${EMAIL}...`);
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email: EMAIL, password: PASSWORD });

  if (authError || !authData.session) {
    console.error(`\n  ERROR de autenticación: ${authError?.message ?? 'sin sesión'}`);
    process.exit(1);
  }

  const token = authData.session.access_token;
  console.log('  Autenticación exitosa ✓');

  // 2. N solicitudes secuenciales
  console.log(`\n  Enviando ${N} solicitudes secuenciales a POST /api/recommendations/generate...\n`);

  const times   = [];
  const results = [];

  for (let i = 0; i < N; i++) {
    const t0         = Date.now();
    let status       = '?';
    let recs         = 0;
    let errorDetail  = '';

    try {
      const controller = new AbortController();
      const timer      = setTimeout(() => controller.abort(), 45_000);

      const res = await fetch(`${BASE_URL}/recommendations/generate`, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body:   JSON.stringify({ risk_override: 5 }),
        signal: controller.signal,
      });
      clearTimeout(timer);

      status = res.status;
      const bodyText = await res.text();

      if (res.ok) {
        const body = JSON.parse(bodyText);
        recs = body.recommendations?.length ?? 0;
      } else {
        // Mostrar los primeros 120 caracteres del error para diagnóstico
        errorDetail = bodyText.slice(0, 120).replace(/\n/g, ' ');
      }
    } catch (err) {
      status      = err.name === 'AbortError' ? 'TIMEOUT' : 'ERR';
      errorDetail = err.message;
    }

    const elapsed = Date.now() - t0;
    times.push(elapsed);
    results.push({ i: i + 1, elapsed, status, recs, errorDetail });

    const ok2xx = typeof status === 'number' && status >= 200 && status < 300;
    const icon  = ok2xx ? '✓' : '✗';
    process.stdout.write(`  [${String(i + 1).padStart(2)}] ${icon} ${elapsed.toString().padStart(5)} ms`);
    if (ok2xx)       process.stdout.write(`  (${recs} recomendaciones)`);
    if (errorDetail) process.stdout.write(`  → ${errorDetail}`);
    process.stdout.write('\n');
  }

  // 3. Estadísticas
  const max = Math.max(...times);
  const p50 = percentile(times, 50);
  const p90 = percentile(times, 90);
  const p95 = percentile(times, 95);
  const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
  const ok  = results.filter(r => typeof r.status === 'number' && r.status >= 200 && r.status < 300).length;

  console.log('\n  ┌──────────────────────────────────────────────────────────────────┐');
  console.log('  │          RESULTADOS — Prueba de Rendimiento RNF-01               │');
  console.log('  ├──────────────────────────────────────────────────────────────────┤');
  console.log(`  │  Solicitudes:   ${N} secuenciales            Exitosas: ${ok}/${N}              │`);
  console.log(`  │  Promedio:      ${String(avg).padStart(6)} ms                                      │`);
  console.log(`  │  Mínimo:        ${String(Math.min(...times)).padStart(6)} ms                                      │`);
  console.log(`  │  Máximo:        ${String(max).padStart(6)} ms                                      │`);
  console.log(`  │  Percentil 50:  ${String(p50).padStart(6)} ms                                      │`);
  console.log(`  │  Percentil 90:  ${String(p90).padStart(6)} ms                                      │`);
  console.log(`  │  Percentil 95:  ${String(p95).padStart(6)} ms  ${p95 < 35000 ? '✓ CUMPLE' : '✗ EXCEDE'} umbral 35 000 ms          │`);
  console.log('  ├──────────────────────────────────────────────────────────────────┤');
  console.log('  │  Distribución de tiempos:                                        │');

  for (const r of results) {
    const b = bar(r.elapsed, Math.max(max, 1));
    console.log(`  │  [${String(r.i).padStart(2)}] ${b} ${String(r.elapsed).padStart(5)} ms  │`);
  }

  console.log('  └──────────────────────────────────────────────────────────────────┘');

  const conclusion = p95 < 35_000
    ? `\n  CONCLUSIÓN: p95 = ${p95} ms < 35 000 ms → RNF-01 CUMPLIDO ✓\n`
    : `\n  CONCLUSIÓN: p95 = ${p95} ms ≥ 35 000 ms → RNF-01 NO CUMPLIDO ✗\n`;

  console.log(conclusion);
}

main().catch(err => {
  console.error('\n  Error inesperado:', err.message);
  process.exit(1);
});
