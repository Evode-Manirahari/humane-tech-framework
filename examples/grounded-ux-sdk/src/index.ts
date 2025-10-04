/**
 * Grounded UX SDK - Main export file
 */

export { GroundedUX } from './GroundedUX';
export { RealityAnchors } from './RealityAnchors';
export { CadenceNudges } from './CadenceNudges';
export { StanceCounterBalance } from './StanceCounterBalance';
export { EmotionalSafeguards } from './EmotionalSafeguards';
export { FeedbackLoop } from './FeedbackLoop';

// Export types
export type {
  GroundedUXConfig,
  EscalationContext,
  InterventionPolicy,
  ClaimLabel,
  LabeledOutput,
  StanceAnalysis,
  EmotionalAnalysis,
  TelemetryData,
  FeedbackEntry,
  TrustDeltaModel,
  BadgeStyle,
  CadenceStyle,
  OpposingGlance,
  ReflectionPrompt,
  SessionState,
  HumanOptions
} from './types';

// Default export
export { GroundedUX as default } from './GroundedUX';
