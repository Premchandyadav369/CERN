import { z } from 'zod';
import {
  EpistemicStatusSchema,
  FidelityBadgeSchema,
  CitationSchema,
} from './provenance.js';

export const EntityTypeSchema = z.enum([
  'accelerator',
  'experiment',
  'detector',
  'particle',
  'facility',
  'technology',
  'dataset',
  'paper',
  'simulation',
  'physics_concept',
  'engineering_system',
  'computing_system',
  'historical_event',
  'future_project',
]);
export type EntityType = z.infer<typeof EntityTypeSchema>;

export const EquationRecordSchema = z.object({
  latex: z.string(),
  description: z.string(),
  variables: z.record(z.string()).optional(),
});
export type EquationRecord = z.infer<typeof EquationRecordSchema>;

export const EntityRecordSchema = z.object({
  id: z.string().min(1),
  type: EntityTypeSchema,
  name: z.string().min(1),
  shortDescription: z.string().min(1),
  fullDescription: z.string().min(1),
  scientificDomain: z.string(),
  epistemicStatus: EpistemicStatusSchema,
  fidelityBadge: FidelityBadgeSchema.optional(),
  manifestIds: z.array(z.string()).default([]),
  relatedEntityIds: z.array(z.string()).default([]),
  equations: z.array(EquationRecordSchema).optional(),
  citations: z.array(CitationSchema).default([]),
  lastVerified: z.string(),
});
export type EntityRecord = z.infer<typeof EntityRecordSchema>;
