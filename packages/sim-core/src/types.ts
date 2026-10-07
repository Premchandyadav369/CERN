/**
 * CERN-X Simulation Core Primitives
 * All experiments and simulators consume these shared, typed primitives.
 */

export interface Particle {
  id: string;
  name: string;
  symbol: string;
  charge: number;           // in units of elementary charge e
  massGev: number;          // rest mass in GeV/c^2
  pdgId: number;
  lifetimeSeconds?: number;
  isStable: boolean;
}

export interface Beam {
  id: string;
  particle: Particle;
  energyGev: number;        // Total energy E per particle in GeV
  particlesPerBunch: number;
  numberOfBunches: number;
  bunchSpacingNs: number;
  emittanceMmRad: number;
  direction: 1 | -1;        // Clockwise (1) or Counter-Clockwise (-1)
}

export interface Bunch {
  id: string;
  beamId: string;
  bunchIndex: number;
  intensity: number;        // Number of particles
  sPositionMeters: number;  // Longitudinal position along the ring
  energyGev: number;
}

export type MagnetType = 'DIPOLE' | 'QUADRUPOLE' | 'SEXTUPOLE' | 'SOLENOID' | 'TOROID';

export interface Magnet {
  id: string;
  name: string;
  type: MagnetType;
  magneticFieldTesla: number;
  effectiveLengthMeters: number;
  apertureMm: number;
  currentAmperes: number;
  temperatureKelvin: number;
  isSuperconducting: boolean;
}

export interface RFCavity {
  id: string;
  name: string;
  frequencyMhz: number;
  peakVoltageMv: number;
  phaseRadians: number;
  harmonicNumber: number;
  lengthMeters: number;
}

export interface Collision {
  id: string;
  collisionEnergyGev: number; // Center-of-mass energy sqrt(s)
  beam1Id: string;
  beam2Id: string;
  interactionPoint: 'IP1_ATLAS' | 'IP2_ALICE' | 'IP5_CMS' | 'IP8_LHCB';
  lumiInstantaneousCm2S1: number;
  pileupMean: number;
  simulatedTimeNs: number;
}

export type SubdetectorCategory = 
  | 'PIXEL_TRACKER'
  | 'STRIP_TRACKER'
  | 'ELECTROMAGNETIC_CALORIMETER'
  | 'HADRONIC_CALORIMETER'
  | 'MUON_CHAMBER'
  | 'FORWARD_CALORIMETER';

export interface Subdetector {
  id: string;
  name: string;
  category: SubdetectorCategory;
  innerRadiusMeters: number;
  outerRadiusMeters: number;
  lengthMeters: number;
  etaCoverageMin: number;
  etaCoverageMax: number;
  radiationLengthsX0?: number;
  interactionLengthsLambda?: number;
  active: boolean; // Toggle for digital twin "what if subsystem is disabled"
}

export interface Detector {
  id: string;
  name: string;
  subdetectors: Subdetector[];
  magneticFieldTesla: number;
  solenoidRadiusMeters: number;
  toroidFieldTesla?: number;
}

export interface Hit {
  id: string;
  subdetectorId: string;
  xMeters: number;
  yMeters: number;
  zMeters: number;
  energyDepositGev: number;
  timeNs: number;
}

export interface Track {
  id: string;
  charge: number;
  ptGev: number;
  eta: number;
  phi: number;
  d0Mm: number;
  z0Mm: number;
  hitIds: string[];
}

export type PhysicsObjectType = 'ELECTRON' | 'MUON' | 'TAU' | 'PHOTON' | 'JET' | 'MET' | 'B_JET';

export interface PhysicsObject {
  id: string;
  type: PhysicsObjectType;
  ptGev: number;
  eta: number;
  phi: number;
  energyGev: number;
  charge: number;
  isolation?: number;
}

export interface Event {
  id: string;
  eventId: number;
  runNumber: number;
  sqrtSGev: number;
  timestamp: string;
  isRealData: boolean;
  provenanceManifestId: string;
  physicsObjects: PhysicsObject[];
  tracks: Track[];
  hits: Hit[];
}

export interface TriggerDecision {
  eventId: string;
  passedL1: boolean;
  passedHlt: boolean;
  l1LatencyMicroseconds: number;
  hltLatencyMilliseconds: number;
  matchedTriggers: string[];
}

export interface DataPacket {
  id: string;
  sourceId: string;
  sizeBytes: number;
  timestampNs: number;
  dataType: 'RAW' | 'AOD' | 'MINIAOD' | 'NANOAOD';
}

export interface ComputeJob {
  id: string;
  datasetId: string;
  targetTier: 'Tier0' | 'Tier1' | 'Tier2';
  cpuHoursRequired: number;
  inputSizeBytes: number;
  outputSizeBytes: number;
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  submittedAt: number;
}

export interface Site {
  id: string;
  name: string;
  tier: 'Tier0' | 'Tier1' | 'Tier2';
  country: string;
  storagePetaBytes: number;
  cpuCores: number;
  currentLoadPercent: number;
}

export interface Experiment {
  id: string;
  name: string;
  acceleratorId: string;
  primaryPhysicsGoals: string[];
  spokesperson?: string;
  status: 'ACTIVE' | 'UPGRADING' | 'PROPOSED' | 'COMPLETED';
}
