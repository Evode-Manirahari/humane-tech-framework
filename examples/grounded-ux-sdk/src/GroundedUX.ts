/**
 * Grounded UX SDK - Main class that orchestrates reality anchors for LLM interactions
 */

import { 
  GroundedUXConfig, 
  InterventionPolicy, 
  LabeledOutput, 
  StanceAnalysis, 
  EmotionalAnalysis,
  SessionState,
  TelemetryData,
  FeedbackEntry,
  TrustDeltaModel
} from './types';
import { RealityAnchors } from './RealityAnchors';
import { CadenceNudges } from './CadenceNudges';
import { StanceCounterBalance } from './StanceCounterBalance';
import { EmotionalSafeguards } from './EmotionalSafeguards';
import { FeedbackLoop } from './FeedbackLoop';

export class GroundedUX {
  private config: GroundedUXConfig;
  private sessionState: SessionState;
  private realityAnchors: RealityAnchors;
  private cadenceNudges: CadenceNudges;
  private stanceCounterBalance: StanceCounterBalance;
  private emotionalSafeguards: EmotionalSafeguards;
  private feedbackLoop: FeedbackLoop;

  constructor(config: Partial<GroundedUXConfig> = {}) {
    this.config = this.mergeWithDefaults(config);
    this.sessionState = this.initializeSession();
    
    // Initialize components
    this.realityAnchors = new RealityAnchors(this.config.badges, this.config.citeGate);
    this.cadenceNudges = new CadenceNudges(this.config.cadence);
    this.stanceCounterBalance = new StanceCounterBalance(this.config.stance);
    this.emotionalSafeguards = new EmotionalSafeguards(this.config.emotion);
    this.feedbackLoop = new FeedbackLoop(this.config.telemetry);
  }

  /**
   * Count a new prompt and update session state
   */
  countPrompt(): void {
    this.sessionState.promptCount++;
    this.sessionState.lastActivity = new Date().toISOString();
    
    // Update telemetry
    if (this.config.telemetry.optIn) {
      this.feedbackLoop.recordPrompt(this.sessionState);
    }
  }

  /**
   * Analyze message and determine interventions needed
   */
  getInterventions(message: string): InterventionPolicy {
    const emotionalAnalysis = this.emotionalSafeguards.analyzeEmotion(message);
    const stanceAnalysis = this.stanceCounterBalance.analyzeStance(message);
    
    // Update session state
    this.sessionState.emotionalState = emotionalAnalysis;
    this.sessionState.currentStance = stanceAnalysis.score;

    const policy: InterventionPolicy = {
      shouldApplyRedReply: this.cadenceNudges.shouldApplyRedReply(this.sessionState.promptCount),
      shouldShowOpposingGlance: this.stanceCounterBalance.shouldShowOpposingGlance(stanceAnalysis),
      shouldTriggerReflection: this.shouldTriggerReflection(message, emotionalAnalysis),
      shouldEscalateToHuman: this.emotionalSafeguards.shouldEscalateToHuman(emotionalAnalysis),
      stanceScore: stanceAnalysis.score,
      toPromptHints: () => this.generatePromptHints(policy)
    };

    // Record intervention
    this.sessionState.interventions.push(JSON.stringify(policy));
    
    return policy;
  }

  /**
   * Label claims in LLM output with reality anchors
   */
  async labelClaims(llmOutput: string): Promise<LabeledOutput> {
    const labeledOutput = await this.realityAnchors.labelClaims(llmOutput);
    
    // Update session state with processed output
    this.sessionState.lastActivity = new Date().toISOString();
    
    return labeledOutput;
  }

  /**
   * Apply stance counter-balance if needed
   */
  async counterBalanceIfNeeded(labeledOutput: LabeledOutput): Promise<LabeledOutput> {
    if (this.stanceCounterBalance.shouldApplyCounterBalance(this.sessionState.currentStance)) {
      const opposingGlance = await this.stanceCounterBalance.generateOpposingGlance(
        labeledOutput,
        this.sessionState.currentStance
      );
      
      // Inject opposing glance into output
      labeledOutput.processedText = this.injectOpposingGlance(
        labeledOutput.processedText,
        opposingGlance
      );
    }
    
    return labeledOutput;
  }

  /**
   * Apply cadence styles (red reply, tallies)
   */
  applyCadenceStyles(labeledOutput: LabeledOutput): LabeledOutput {
    let styledOutput = labeledOutput.processedText;
    
    // Apply red reply style if needed
    if (this.cadenceNudges.shouldApplyRedReply(this.sessionState.promptCount)) {
      styledOutput = this.cadenceNudges.applyRedReplyStyle(styledOutput);
    }
    
    // Add prompt tally if enabled
    if (this.config.cadence.showTallies) {
      styledOutput = this.cadenceNudges.addPromptTally(styledOutput, this.sessionState.promptCount);
    }
    
    return {
      ...labeledOutput,
      processedText: styledOutput
    };
  }

  /**
   * Submit user feedback
   */
  submitFeedback(rating: 'thumbs_up' | 'thumbs_down', reason: string, context: string): void {
    const feedback: FeedbackEntry = {
      id: this.generateId(),
      sessionId: this.sessionState.sessionId,
      promptCount: this.sessionState.promptCount,
      rating,
      reason,
      context,
      timestamp: new Date().toISOString()
    };
    
    this.feedbackLoop.recordFeedback(feedback);
  }

  /**
   * Get current session state
   */
  getSessionState(): SessionState {
    return { ...this.sessionState };
  }

  /**
   * Get telemetry data (if opted in)
   */
  getTelemetryData(): TelemetryData | null {
    if (!this.config.telemetry.optIn) {
      return null;
    }
    
    return this.feedbackLoop.getTelemetryData(this.sessionState);
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<GroundedUXConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Update components with new config
    this.realityAnchors.updateConfig(this.config.badges, this.config.citeGate);
    this.cadenceNudges.updateConfig(this.config.cadence);
    this.stanceCounterBalance.updateConfig(this.config.stance);
    this.emotionalSafeguards.updateConfig(this.config.emotion);
    this.feedbackLoop.updateConfig(this.config.telemetry);
  }

  /**
   * Reset session
   */
  resetSession(): void {
    this.sessionState = this.initializeSession();
  }

  // Private methods

  private mergeWithDefaults(config: Partial<GroundedUXConfig>): GroundedUXConfig {
    return {
      cadence: {
        redEveryNPrompts: 5,
        showTallies: true,
        ...config.cadence
      },
      stance: {
        enabled: true,
        windowMinutes: 25,
        threshold: 2,
        ...config.stance
      },
      badges: {
        enabled: true,
        level: 'sentence',
        ...config.badges
      },
      citeGate: {
        requireResolvable: true,
        fallbackMode: 'exploratory',
        ...config.citeGate
      },
      reflection: {
        hotkey: 'Ctrl+R',
        enabled: true,
        ...config.reflection
      },
      emotion: {
        enabled: true,
        escalateOn: 3,
        onEscalate: () => {},
        ...config.emotion
      },
      telemetry: {
        anonymized: true,
        optIn: true,
        ...config.telemetry
      }
    };
  }

  private initializeSession(): SessionState {
    return {
      sessionId: this.generateId(),
      promptCount: 0,
      startTime: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      currentStance: 0,
      emotionalState: {
        sentiment: 0,
        patterns: [],
        escalationLevel: 'low',
        riskFactors: []
      },
      interventions: [],
      userPreferences: {}
    };
  }

  private shouldTriggerReflection(message: string, emotionalAnalysis: EmotionalAnalysis): boolean {
    // Trigger reflection based on emotional state, message complexity, or config
    return emotionalAnalysis.escalationLevel === 'medium' || 
           message.length > 500 || 
           this.sessionState.promptCount % 10 === 0;
  }

  private generatePromptHints(policy: InterventionPolicy): string[] {
    const hints: string[] = [];
    
    if (policy.shouldApplyRedReply) {
      hints.push("Apply red reply style to break flow trance");
    }
    
    if (policy.shouldShowOpposingGlance) {
      hints.push("Include opposing perspective with citations");
    }
    
    if (policy.shouldTriggerReflection) {
      hints.push("Suggest reflection on assumptions vs. knowledge");
    }
    
    if (policy.shouldEscalateToHuman) {
      hints.push("Prepare human hand-off options");
    }
    
    return hints;
  }

  private injectOpposingGlance(text: string, opposingGlance: any): string {
    const glanceText = `\n\n**Opposing Glance:** ${opposingGlance.content}`;
    return text + glanceText;
  }

  private generateId(): string {
    return `gx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default GroundedUX;
