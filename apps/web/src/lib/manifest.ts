import manifestData from '../../../../data/manifest.json';
import { ManifestRecord } from '@cern-x/content-schema';

export function getManifestRecord(id: string): ManifestRecord | undefined {
  return manifestData.records.find((r) => r.id === id) as ManifestRecord | undefined;
}

export function getAllManifestRecords(): ManifestRecord[] {
  return manifestData.records as ManifestRecord[];
}
