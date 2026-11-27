/**
 * Automated HTTP & Content Smoke Verification Script for CERN-X
 * Verifies every static & dynamic route returns HTTP 200 and non-empty rendered HTML.
 */
import http from 'node:http';

const BASE_URL = process.env.CERNX_BASE_URL || 'http://127.0.0.1:3000';

const ROUTES = [
  '/',
  '/projects',
  '/accelerators',
  '/experiments',
  '/detectors',
  '/simulations',
  '/simulations?module=lhc',
  '/simulations?module=lhc-fill',
  '/simulations?module=tva-timeline',
  '/simulations?module=tva-intake',
  '/simulations?module=arc-magnet',
  '/simulations?module=quantum-zoom',
  '/simulations?module=mirror-dimensions',
  '/simulations?module=displaced-vertex',
  '/simulations?module=monopole-arena',
  '/simulations?module=bifrost-rays',
  '/simulations?module=neutrinos',
  '/simulations?module=feynman',
  '/simulations?module=collision-director',
  '/simulations?module=race',
  '/simulations?module=sm-3d',
  '/simulations?module=isolde',
  '/simulations?module=rich-medipix',
  '/simulations?module=cosmic',
  '/simulations?module=antimatter',
  '/computing',
  '/engineering',
  '/ai-lab',
  '/open-data',
  '/learn',
  '/methodology',
  '/about',
  '/api/health',
];

function checkRoute(path) {
  return new Promise((resolve) => {
    http
      .get(`${BASE_URL}${path}`, (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          const isApi = path.startsWith('/api/');
          const ok =
            res.statusCode === 200 &&
            (isApi ? body.includes('"status":"ok"') : body.length > 500 && !body.includes('Application error'));
          resolve({ path, status: res.statusCode, bytes: body.length, ok });
        });
      })
      .on('error', (err) => {
        resolve({ path, status: 0, bytes: 0, ok: false, error: err.message });
      });
  });
}

(async () => {
  console.log(`[CERN-X Route Smoke] Checking ${ROUTES.length} routes on ${BASE_URL}...`);
  let passed = 0;
  for (const r of ROUTES) {
    const res = await checkRoute(r);
    console.log(`  ${res.ok ? 'PASS' : 'FAIL'} [${res.status}] ${res.path} (${res.bytes} bytes)`);
    if (res.ok) passed++;
  }
  console.log(`[CERN-X Route Smoke] Summary: ${passed}/${ROUTES.length} routes healthy.`);
  if (passed !== ROUTES.length) process.exit(1);
})();
