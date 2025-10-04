/**
 * Feedback Loop - Implements trust delta model and user feedback collection
 */

import { TelemetryData, FeedbackEntry, TrustDeltaModel, SessionState } from './types';

interface TelemetryConfig {
  anonymized: boolean;
  optIn: boolean;
}

export class FeedbackLoop {
  private config: TelemetryConfig;
  private feedbackHistory: FeedbackEntry[] = [];
  private trustDeltaModel: TrustDeltaModel;

  constructor(config: TelemetryConfig) {
    this.config = config;
    this.trustDeltaModel = this.initializeTrustDeltaModel();
  }

  /**
   * Record a prompt in the session
   */
  recordPrompt(sessionState: SessionState): void {
    if (!this.config.optIn) {
      return;
    }
    
    // Update trust delta model based on session behavior
    this.updateTrustDeltaModel(sessionState);
  }

  /**
   * Record user feedback
   */
  recordFeedback(feedback: FeedbackEntry): void {
    if (!this.config.optIn) {
      return;
    }
    
    this.feedbackHistory.push(feedback);
    this.updateTrustDeltaModelFromFeedback(feedback);
    
    // Clean old feedback
    this.cleanOldFeedback();
  }

  /**
   * Get telemetry data for session
   */
  getTelemetryData(sessionState: SessionState): TelemetryData {
    const metrics = this.calculateMetrics(sessionState);
    
    return {
      sessionId: sessionState.sessionId,
      promptCount: sessionState.promptCount,
      interventions: sessionState.interventions,
      userFeedback: this.aggregateUserFeedback(),
      metrics
    };
  }

  /**
   * Get trust delta model for user
   */
  getTrustDeltaModel(): TrustDeltaModel {
    return { ...this.trustDeltaModel };
  }

  /**
   * Calculate optimal cadence sensitivity based on feedback
   */
  calculateOptimalCadenceSensitivity(): number {
    const recentFeedback = this.feedbackHistory.slice(-10);
    if (recentFeedback.length === 0) {
      return 0.5; // Default sensitivity
    }
    
    const redReplyFeedback = recentFeedback.filter(f => 
      f.context.includes('red_reply') || f.context.includes('cadence')
    );
    
    if (redReplyFeedback.length === 0) {
      return 0.5;
    }
    
    const positiveCount = redReplyFeedback.filter(f => f.rating === 'thumbs_up').length;
    const negativeCount = redReplyFeedback.filter(f => f.rating === 'thumbs_down').length;
    
    // If users consistently rate red replies negatively, increase sensitivity (less frequent)
    if (negativeCount > positiveCount) {
      return Math.min(this.trustDeltaModel.cadenceSensitivity + 0.1, 1.0);
    }
    
    // If users rate red replies positively, decrease sensitivity (more frequent)
    if (positiveCount > negativeCount) {
      return Math.max(this.trustDeltaModel.cadenceSensitivity - 0.1, 0.0);
    }
    
    return this.trustDeltaModel.cadenceSensitivity;
  }

  /**
   * Calculate optimal stance sensitivity based on feedback
   */
  calculateOptimalStanceSensitivity(): number {
    const recentFeedback = this.feedbackHistory.slice(-10);
    if (recentFeedback.length === 0) {
      return 0.5; // Default sensitivity
    }
    
    const stanceFeedback = recentFeedback.filter(f => 
      f.context.includes('opposing_glance') || f.context.includes('stance')
    );
    
    if (stanceFeedback.length === 0) {
      return 0.5;
    }
    
    const positiveCount = stanceFeedback.filter(f => f.rating === 'thumbs_up').length;
    const negativeCount = stanceFeedback.filter(f => f.rating === 'thumbs_down').length;
    
    // If users consistently rate opposing glances negatively, increase sensitivity (less frequent)
    if (negativeCount > positiveCount) {
      return Math.min(this.trustDeltaModel.stanceSensitivity + 0.1, 1.0);
    }
    
    // If users rate opposing glances positively, decrease sensitivity (more frequent)
    if (positiveCount > negativeCount) {
      return Math.max(this.trustDeltaModel.stanceSensitivity - 0.1, 0.0);
    }
    
    return this.trustDeltaModel.stanceSensitivity;
  }

  /**
   * Get feedback insights
   */
  getFeedbackInsights(): {
    overallSatisfaction: number;
    interventionEffectiveness: { [key: string]: number };
    userPreferences: { [key: string]: any };
    recommendations: string[];
  } {
    const recentFeedback = this.feedbackHistory.slice(-20);
    const overallSatisfaction = this.calculateOverallSatisfaction(recentFeedback);
    const interventionEffectiveness = this.calculateInterventionEffectiveness(recentFeedback);
    const userPreferences = this.inferUserPreferences(recentFeedback);
    const recommendations = this.generateRecommendations(recentFeedback);
    
    return {
      overallSatisfaction,
      interventionEffectiveness,
      userPreferences,
      recommendations
    };
  }

  /**
   * Initialize trust delta model
   */
  private initializeTrustDeltaModel(): TrustDeltaModel {
    return {
      userId: this.generateUserId(),
      cadenceSensitivity: 0.5,
      stanceSensitivity: 0.5,
      lastUpdated: new Date().toISOString(),
      confidence: 0.0
    };
  }

  /**
   * Update trust delta model based on session behavior
   */
  private updateTrustDeltaModel(sessionState: SessionState): void {
    // Analyze session patterns to adjust sensitivity
    const sessionLength = sessionState.promptCount;
    const interventionCount = sessionState.interventions.length;
    
    // If user has long sessions with few interventions, they might prefer less interruption
    if (sessionLength > 20 && interventionCount < sessionLength * 0.1) {
      this.trustDeltaModel.cadenceSensitivity = Math.min(
        this.trustDeltaModel.cadenceSensitivity + 0.05, 1.0
      );
    }
    
    // If user has short sessions, they might prefer more guidance
    if (sessionLength < 5) {
      this.trustDeltaModel.cadenceSensitivity = Math.max(
        this.trustDeltaModel.cadenceSensitivity - 0.05, 0.0
      );
    }
    
    this.trustDeltaModel.lastUpdated = new Date().toISOString();
  }

  /**
   * Update trust delta model from feedback
   */
  private updateTrustDeltaModelFromFeedback(feedback: FeedbackEntry): void {
    // Update sensitivity based on feedback
    if (feedback.rating === 'thumbs_up') {
      this.trustDeltaModel.confidence = Math.min(this.trustDeltaModel.confidence + 0.1, 1.0);
    } else if (feedback.rating === 'thumbs_down') {
      this.trustDeltaModel.confidence = Math.max(this.trustDeltaModel.confidence - 0.1, 0.0);
    }
    
    // Adjust sensitivity based on feedback context
    if (feedback.context.includes('cadence')) {
      this.trustDeltaModel.cadenceSensitivity = this.calculateOptimalCadenceSensitivity();
    }
    
    if (feedback.context.includes('stance')) {
      this.trustDeltaModel.stanceSensitivity = this.calculateOptimalStanceSensitivity();
    }
    
    this.trustDeltaModel.lastUpdated = new Date().toISOString();
  }

  /**
   * Calculate metrics for telemetry
   */
  private calculateMetrics(sessionState: SessionState): TelemetryData['metrics'] {
    const recentFeedback = this.feedbackHistory.slice(-10);
    
    return {
      groundingRate: this.calculateGroundingRate(sessionState),
      phantomCitationRate: this.calculatePhantomCitationRate(sessionState),
      echoDivergence: this.calculateEchoDivergence(sessionState),
      overTrustIndex: this.calculateOverTrustIndex(recentFeedback)
    };
  }

  /**
   * Calculate grounding rate
   */
  private calculateGroundingRate(sessionState: SessionState): number {
    // This would analyze the percentage of claims that were properly cited
    // For now, return a placeholder value
    return 0.75;
  }

  /**
   * Calculate phantom citation rate
   */
  private calculatePhantomCitationRate(sessionState: SessionState): number {
    // This would analyze citations that don't resolve to actual sources
    // For now, return a placeholder value
    return 0.05;
  }

  /**
   * Calculate echo divergence
   */
  private calculateEchoDivergence(sessionState: SessionState): number {
    // This would measure how often opposing glances change stance scores
    // For now, return a placeholder value
    return 0.30;
  }

  /**
   * Calculate over-trust index
   */
  private calculateOverTrustIndex(recentFeedback: FeedbackEntry[]): number {
    // This would measure how often users accept unverified claims
    // For now, return a placeholder value
    return 0.20;
  }

  /**
   * Aggregate user feedback
   */
  private aggregateUserFeedback(): TelemetryData['userFeedback'] {
    const recentFeedback = this.feedbackHistory.slice(-20);
    
    return {
      thumbsUp: recentFeedback.filter(f => f.rating === 'thumbs_up').length,
      thumbsDown: recentFeedback.filter(f => f.rating === 'thumbs_down').length,
      reasons: recentFeedback.map(f => f.reason).filter(r => r.length > 0)
    };
  }

  /**
   * Calculate overall satisfaction
   */
  private calculateOverallSatisfaction(recentFeedback: FeedbackEntry[]): number {
    if (recentFeedback.length === 0) {
      return 0.5; // Neutral
    }
    
    const positiveCount = recentFeedback.filter(f => f.rating === 'thumbs_up').length;
    return positiveCount / recentFeedback.length;
  }

  /**
   * Calculate intervention effectiveness
   */
  private calculateInterventionEffectiveness(recentFeedback: FeedbackEntry[]): { [key: string]: number } {
    const effectiveness: { [key: string]: number } = {};
    
    const interventionTypes = ['cadence', 'stance', 'emotional', 'reflection'];
    
    for (const type of interventionTypes) {
      const typeFeedback = recentFeedback.filter(f => f.context.includes(type));
      if (typeFeedback.length > 0) {
        const positiveCount = typeFeedback.filter(f => f.rating === 'thumbs_up').length;
        effectiveness[type] = positiveCount / typeFeedback.length;
      } else {
        effectiveness[type] = 0.5; // Neutral
      }
    }
    
    return effectiveness;
  }

  /**
   * Infer user preferences from feedback
   */
  private inferUserPreferences(recentFeedback: FeedbackEntry[]): { [key: string]: any } {
    const preferences: { [key: string]: any } = {};
    
    // Analyze feedback patterns to infer preferences
    const cadenceFeedback = recentFeedback.filter(f => f.context.includes('cadence'));
    if (cadenceFeedback.length > 0) {
      const positiveCount = cadenceFeedback.filter(f => f.rating === 'thumbs_up').length;
      preferences.preferredCadence = positiveCount > cadenceFeedback.length / 2 ? 'frequent' : 'minimal';
    }
    
    const stanceFeedback = recentFeedback.filter(f => f.context.includes('stance'));
    if (stanceFeedback.length > 0) {
      const positiveCount = stanceFeedback.filter(f => f.rating === 'thumbs_up').length;
      preferences.preferredStanceBalance = positiveCount > stanceFeedback.length / 2 ? 'aggressive' : 'gentle';
    }
    
    return preferences;
  }

  /**
   * Generate recommendations based on feedback
   */
  private generateRecommendations(recentFeedback: FeedbackEntry[]): string[] {
    const recommendations: string[] = [];
    
    const overallSatisfaction = this.calculateOverallSatisfaction(recentFeedback);
    
    if (overallSatisfaction < 0.3) {
      recommendations.push('Consider reducing intervention frequency');
    }
    
    const interventionEffectiveness = this.calculateInterventionEffectiveness(recentFeedback);
    
    for (const [intervention, effectiveness] of Object.entries(interventionEffectiveness)) {
      if (effectiveness < 0.3) {
        recommendations.push(`Review effectiveness of ${intervention} interventions`);
      }
    }
    
    return recommendations;
  }

  /**
   * Clean old feedback entries
   */
  private cleanOldFeedback(): void {
    // Keep only last 50 entries
    if (this.feedbackHistory.length > 50) {
      this.feedbackHistory = this.feedbackHistory.slice(-50);
    }
  }

  /**
   * Generate user ID
   */
  private generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Update configuration
   */
  updateConfig(config: TelemetryConfig): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): TelemetryConfig {
    return { ...this.config };
  }
}
