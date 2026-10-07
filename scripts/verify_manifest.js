import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const MANIFEST_PATH = path.resolve(process.cwd(), 'data', 'manifest.json');

function verifyManifest() {
  console.log(`[Manifest Validator] Checking: ${MANIFEST_PATH}`);
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error(`ERROR: Manifest file not found at ${MANIFEST_PATH}`);
    process.exit(1);
  }

  const content = fs.readFileSync(MANIFEST_PATH, 'utf-8');
  let manifest;
  try {
    manifest = JSON.parse(content);
  } catch (err) {
    console.error('ERROR: Invalid JSON in manifest.json', err);
    process.exit(1);
  }

  if (!manifest.records || !Array.isArray(manifest.records)) {
    console.error('ERROR: Manifest missing "records" array');
    process.exit(1);
  }

  console.log(`[Manifest Validator] Found ${manifest.records.length} registered records.`);
  let hasErrors = false;

  for (const record of manifest.records) {
    if (!record.id || !record.title || !record.dataClass || !record.sourceTier || !record.license) {
      console.error(`ERROR: Record ${record.id || 'UNKNOWN'} is missing mandatory fields`);
      hasErrors = true;
    }

    if (!['REAL', 'PUBLISHED', 'COMPUTED'].includes(record.dataClass)) {
      console.error(`ERROR: Record ${record.id} has invalid dataClass: ${record.dataClass}`);
      hasErrors = true;
    }

    if (!record.knownLimitations) {
      console.error(`ERROR: Record ${record.id} must declare knownLimitations`);
      hasErrors = true;
    }
  }

  if (hasErrors) {
    console.error('[Manifest Validator] FAILED with schema violations.');
    process.exit(1);
  }

  console.log('[Manifest Validator] PASSED: All registered records valid.');
}

verifyManifest();
