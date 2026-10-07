import { z } from 'zod';

export const DataClassSchema = z.enum(['REAL', 'PUBLISHED', 'COMPUTED']);
export type DataClass = z.infer<typeof DataClassSchema>;

export const FidelityBadgeSchema = z.enum(['ANALYTIC', 'TOY', 'MONTE CARLO', 'ILLUSTRATIVE']);
export type FidelityBadge = z.infer<typeof FidelityBadgeSchema>;

export const SourceTierSchema = z.enum([
  'T1_OFFICIAL',
  'T2_OPEN_DATA',
  'T3_CDS',
  'T4_EXPERIMENT',
  'T5_PEER_REVIEWED',
]);
export type SourceTier = z.infer<typeof SourceTierSchema>;

export const EpistemicStatusSchema = z.enum([
  'ESTABLISHED_PHYSICS',
  'HYPOTHESIS',
  'SEARCH_TARGET',
]);
export type EpistemicStatus = z.infer<typeof EpistemicStatusSchema>;

export const ContentCategorySchema = z.enum([
  'CERN_SOURCE',
  'PUBLICATION',
  'OUR_SIMULATION',
  'EDUCATIONAL_SIMPLIFICATION',
  'OUR_ML_EXPERIMENT',
]);
export type ContentCategory = z.infer<typeof ContentCategorySchema>;

export const DataStatusSchema = z.enum(['verified', 'computed', 'missing']);
export type DataStatus = z.infer<typeof DataStatusSchema>;

export const CitationSchema = z.object({
  id: z.string(),
  authors: z.string().optional(),
  title: z.string(),
  journalOrSource: z.string(),
  year: z.number().int(),
  doiOrUrl: z.string().url(),
  sourceTier: SourceTierSchema,
  retrievalDate: z.string(),
});
export type Citation = z.infer<typeof CitationSchema>;
