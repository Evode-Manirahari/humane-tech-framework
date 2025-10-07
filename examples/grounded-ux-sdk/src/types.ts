/**
 * Type definitions for Grounded UX SDK
 */

export interface GroundedUXConfig {
  cadence: {
    redEveryNPrompts: number; // 3-10, default 5
    showTallies: boolean;     // default true
  };
  stance: {
    enabled: boolean;         // default true
    windowMinutes: number;    // 10-45, default 25
    threshold: number;        // 1-3, default 2
  };
  badges: {
    enabled: boolean;         // default true
    level: 'off' | 'sentence' | 'paragraph'; // default 'sentence'
  };
  citeGate: {
    requireResolvable: boolean; // default true
    fallbackMode: 'exploratory' | 'warning'; // default 'exploratory'
  };
  reflection: {
    hotkey: string;           // default 'Ctrl+R'
    enabled: boolean;         // default true
  };
  emotion: {
    enabled: boolean;         // default true
    escalateOn: number;       // sentiment threshold, default 3
    onEscalate: (context: EscalationContext) => void;
  };
  telemetry: {
    anonymized: boolean;      // default true
    optIn: boolean;          // default true
  };
}

export interface EscalationContext {
  level: 'low' | 'medium' | 'high';
  patterns: string[];
  sentiment: number;
  message: string;
  timestamp: string;
}

export interface InterventionPolicy {
  shouldApplyRedReply: boolean;
  shouldShowOpposingGlance: boolean;
  shouldTriggerReflection: boolean;
  shouldEscalateToHuman: boolean;
  stanceScore?: number;
  toPromptHints: () => string[];
}

export interface ClaimLabel {
  type: 'cited' | 'inference' | 'unverified';
  confidence: number;
  source?: string;
  sentence: string;
  position: number;
}

export interface LabeledOutput {
  originalText: string;
  claims: ClaimLabel[];
  processedText: string;
  metadata: {
    timestamp: string;
    promptCount: number;
    sessionId: string;
  };
}

export interface StanceAnalysis {
  score: number; // -3 to +3
  confidence: number;
  topics: string[];
  timestamp: string;
}

export interface EmotionalAnalysis {
  sentiment: number; // -1 to 1
  patterns: string[];
  escalationLevel: 'low' | 'medium' | 'high';
  riskFactors: string[];
  timestamp: string;
}

export interface TelemetryData {
  sessionId: string;
  promptCount: number;
  interventions: string[];
  userFeedback: {
    thumbsUp: number;
    thumbsDown: number;
    reasons: string[];
  };
  metrics: {
    groundingRate: number;
    phantomCitationRate: number;
    echoDivergence: number;
    overTrustIndex: number;
  };
}

export interface HumanOptions {
  contacts: {
    name: string;
    type: 'friend' | 'therapist' | 'crisis' | 'professional';
    method: 'call' | 'text' | 'email';
    value: string;
  }[];
  resources: {
    title: string;
    url: string;
    description: string;
  }[];
}

export interface FeedbackEntry {
  id: string;
  sessionId: string;
  promptCount: number;
  rating: 'thumbs_up' | 'thumbs_down';
  reason: string;
  context: string;
  timestamp: string;
}

export interface TrustDeltaModel {
  userId: string;
  cadenceSensitivity: number; // 0-1
  stanceSensitivity: number;  // 0-1
  lastUpdated: string;
  confidence: number;
}

export interface BadgeStyle {
  cited: string;
  inference: string;
  unverified: string;
}

export interface CadenceStyle {
  redReply: string;
  tally: string;
  systemFrame: string;
}

export interface OpposingGlance {
  id: string;
  content: string;
  citations: string[];
  stanceOffset: number;
  timestamp: string;
  dismissed: boolean;
  pinned: boolean;
}

export interface ReflectionPrompt {
  id: string;
  type: 'decision_brief' | 'assumption_check' | 'source_verification';
  template: string;
  context: string;
  timestamp: string;
}

export interface SessionState {
  sessionId: string;
  promptCount: number;
  startTime: string;
  lastActivity: string;
  currentStance: number;
  emotionalState: EmotionalAnalysis;
  interventions: string[];
  userPreferences: Partial<GroundedUXConfig>;
}
