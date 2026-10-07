import { z } from 'zod';
import {
  DataClassSchema,
  SourceTierSchema,
  ContentCategorySchema,
  DataStatusSchema,
} from './provenance.js';

export const ManifestRecordSchema = z.object({
  id: z.string().min(1, 'Manifest ID cannot be empty'),
  title: z.string().min(1),
  dataClass: DataClassSchema,
  sourceTier: SourceTierSchema,
  sourceUrl: z.string().url(),
  doiOrRecordId: z.string().optional(),
  retrievalDate: z.string().regex(/^\d{4}-\d{2}-\d{2}/, 'Expected ISO YYYY-MM-DD date format'),
  sha256: z.string().regex(/^[a-f0-9]{64}$/i, 'Must be valid 64-character SHA-256 hex').optional(),
  license: z.string().min(1),
  transformScript: z.string().optional(),
  gitCommit: z.string().optional(),
  softwareVersions: z.record(z.string()).optional(),
  seed: z.number().int().optional(),
  formula: z.string().optional(),
  knownLimitations: z.string().min(1, 'Honest limitations statement is required'),
  category: ContentCategorySchema,
  dataStatus: DataStatusSchema.default('verified'),
});
export type ManifestRecord = z.infer<typeof ManifestRecordSchema>;

export const ManifestSchema = z.object({
  version: z.string(),
  generatedAt: z.string(),
  records: z.array(ManifestRecordSchema),
});
export type Manifest = z.infer<typeof ManifestSchema>;
