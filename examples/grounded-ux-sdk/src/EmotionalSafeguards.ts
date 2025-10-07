/**
 * Emotional Safeguards - Implements emotional detection and human hand-off system
 */

import { EmotionalAnalysis, EscalationContext, HumanOptions } from './types';

interface EmotionConfig {
  enabled: boolean;
  escalateOn: number; // sentiment threshold, default 3
  onEscalate: (context: EscalationContext) => void;
}

export class EmotionalSafeguards {
  private config: EmotionConfig;
  private emotionalHistory: EmotionalAnalysis[] = [];

  constructor(config: EmotionConfig) {
    this.config = config;
  }

  /**
   * Analyze emotional state in text
   */
  analyzeEmotion(text: string): EmotionalAnalysis {
    const sentiment = this.calculateSentiment(text);
    const patterns = this.detectEmotionalPatterns(text);
    const escalationLevel = this.determineEscalationLevel(sentiment, patterns);
    const riskFactors = this.identifyRiskFactors(text, patterns);
    
    const analysis: EmotionalAnalysis = {
      sentiment,
      patterns,
      escalationLevel,
      riskFactors,
      timestamp: new Date().toISOString()
    };
    
    // Store in history for trend analysis
    this.emotionalHistory.push(analysis);
    this.cleanOldHistory();
    
    return analysis;
  }

  /**
   * Check if human hand-off should be triggered
   */
  shouldEscalateToHuman(analysis: EmotionalAnalysis): boolean {
    if (!this.config.enabled) {
      return false;
    }
    
    // Check escalation level
    if (analysis.escalationLevel === 'high') {
      return true;
    }
    
    // Check for sustained emotional distress
    if (this.hasSustainedDistress()) {
      return true;
    }
    
    // Check for specific risk factors
    if (analysis.riskFactors.includes('self_harm') || analysis.riskFactors.includes('crisis')) {
      return true;
    }
    
    return false;
  }

  /**
   * Generate human options for escalation
   */
  generateHumanOptions(analysis: EmotionalAnalysis): HumanOptions {
    const contacts = this.generateContacts(analysis);
    const resources = this.generateResources(analysis);
    
    return {
      contacts,
      resources
    };
  }

  /**
   * Calculate sentiment score (-1 to 1)
   */
  private calculateSentiment(text: string): number {
    // Simple sentiment analysis - could be enhanced with NLP libraries
    const positiveWords = [
      'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'happy', 'joy', 'love', 'like',
      'positive', 'optimistic', 'hopeful', 'confident', 'proud', 'grateful', 'blessed', 'lucky'
    ];
    
    const negativeWords = [
      'bad', 'terrible', 'awful', 'horrible', 'sad', 'depressed', 'angry', 'frustrated', 'worried', 'anxious',
      'negative', 'pessimistic', 'hopeless', 'scared', 'afraid', 'lonely', 'isolated', 'overwhelmed', 'stressed'
    ];
    
    const words = text.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;
    
    for (const word of words) {
      if (positiveWords.includes(word)) {
        positiveCount++;
      } else if (negativeWords.includes(word)) {
        negativeCount++;
      }
    }
    
    const total = positiveCount + negativeCount;
    if (total === 0) return 0;
    
    return (positiveCount - negativeCount) / total;
  }

  /**
   * Detect emotional patterns in text
   */
  private detectEmotionalPatterns(text: string): string[] {
    const patterns: string[] = [];
    
    // Anxiety patterns
    if (/anxious|worried|nervous|panic|overwhelmed|stressed/i.test(text)) {
      patterns.push('anxiety');
    }
    
    // Depression patterns
    if (/depressed|sad|hopeless|empty|numb|worthless|suicidal/i.test(text)) {
      patterns.push('depression');
    }
    
    // Anger patterns
    if (/angry|furious|rage|irritated|frustrated|mad/i.test(text)) {
      patterns.push('anger');
    }
    
    // Loneliness patterns
    if (/lonely|isolated|alone|disconnected|abandoned/i.test(text)) {
      patterns.push('loneliness');
    }
    
    // Fear patterns
    if (/scared|afraid|terrified|fear|panic|worried/i.test(text)) {
      patterns.push('fear');
    }
    
    // Grief patterns
    if (/grief|loss|mourning|bereavement|death|died/i.test(text)) {
      patterns.push('grief');
    }
    
    // Crisis patterns
    if (/crisis|emergency|urgent|help|suicide|self.harm|hurt.myself/i.test(text)) {
      patterns.push('crisis');
    }
    
    return patterns;
  }

  /**
   * Determine escalation level
   */
  private determineEscalationLevel(sentiment: number, patterns: string[]): 'low' | 'medium' | 'high' {
    // High escalation
    if (patterns.includes('crisis') || patterns.includes('suicide') || patterns.includes('self_harm')) {
      return 'high';
    }
    
    if (sentiment < -0.7 && (patterns.includes('depression') || patterns.includes('hopelessness'))) {
      return 'high';
    }
    
    // Medium escalation
    if (sentiment < -0.5 && patterns.length >= 2) {
      return 'medium';
    }
    
    if (patterns.includes('depression') || patterns.includes('anxiety') || patterns.includes('loneliness')) {
      return 'medium';
    }
    
    // Low escalation
    if (sentiment < -0.3 || patterns.length >= 1) {
      return 'low';
    }
    
    return 'low';
  }

  /**
   * Identify risk factors
   */
  private identifyRiskFactors(text: string, patterns: string[]): string[] {
    const riskFactors: string[] = [];
    
    // Self-harm risk
    if (/hurt.myself|self.harm|cut.myself|end.it.all|not.worth.living/i.test(text)) {
      riskFactors.push('self_harm');
    }
    
    // Suicide risk
    if (/suicide|kill.myself|end.my.life|not.want.to.live/i.test(text)) {
      riskFactors.push('suicide');
    }
    
    // Crisis situation
    if (/crisis|emergency|urgent|help.me|can.t.cope/i.test(text)) {
      riskFactors.push('crisis');
    }
    
    // Substance abuse
    if (/drink.too.much|drugs|alcohol|substance|addiction/i.test(text)) {
      riskFactors.push('substance_abuse');
    }
    
    // Relationship violence
    if (/abuse|violence|hurt.me|threaten|control.me/i.test(text)) {
      riskFactors.push('relationship_violence');
    }
    
    // Eating disorders
    if (/eating.disorder|anorexia|bulimia|not.eating|binge/i.test(text)) {
      riskFactors.push('eating_disorder');
    }
    
    return riskFactors;
  }

  /**
   * Check for sustained emotional distress
   */
  private hasSustainedDistress(): boolean {
    if (this.emotionalHistory.length < 3) {
      return false;
    }
    
    const recent = this.emotionalHistory.slice(-3);
    const allNegative = recent.every(analysis => analysis.sentiment < -0.3);
    const allMediumOrHigh = recent.every(analysis => 
      analysis.escalationLevel === 'medium' || analysis.escalationLevel === 'high'
    );
    
    return allNegative && allMediumOrHigh;
  }

  /**
   * Generate appropriate contacts based on emotional analysis
   */
  private generateContacts(analysis: EmotionalAnalysis): HumanOptions['contacts'] {
    const contacts: HumanOptions['contacts'] = [];
    
    // Crisis contacts
    if (analysis.escalationLevel === 'high' || analysis.riskFactors.includes('crisis')) {
      contacts.push({
        name: 'Crisis Text Line',
        type: 'crisis',
        method: 'text',
        value: 'Text HOME to 741741'
      });
      
      contacts.push({
        name: 'National Suicide Prevention Lifeline',
        type: 'crisis',
        method: 'call',
        value: '988'
      });
    }
    
    // Professional contacts
    if (analysis.patterns.includes('depression') || analysis.patterns.includes('anxiety')) {
      contacts.push({
        name: 'Find a Therapist',
        type: 'therapist',
        method: 'call',
        value: 'Psychology Today Therapist Finder'
      });
    }
    
    // Friend/family contacts (would be configured by user)
    contacts.push({
      name: 'Trusted Friend',
      type: 'friend',
      method: 'text',
      value: 'Your trusted friend (configure in settings)'
    });
    
    return contacts;
  }

  /**
   * Generate appropriate resources based on emotional analysis
   */
  private generateResources(analysis: EmotionalAnalysis): HumanOptions['resources'] {
    const resources: HumanOptions['resources'] = [];
    
    // Crisis resources
    if (analysis.escalationLevel === 'high') {
      resources.push({
        title: 'Crisis Resources',
        url: 'https://www.crisistextline.org/',
        description: '24/7 crisis support via text'
      });
    }
    
    // Mental health resources
    if (analysis.patterns.includes('depression')) {
      resources.push({
        title: 'Depression Support',
        url: 'https://www.nimh.nih.gov/health/publications/depression',
        description: 'Information about depression and treatment options'
      });
    }
    
    if (analysis.patterns.includes('anxiety')) {
      resources.push({
        title: 'Anxiety Resources',
        url: 'https://www.adaa.org/',
        description: 'Anxiety and Depression Association of America'
      });
    }
    
    // General mental health resources
    resources.push({
      title: 'Mental Health America',
      url: 'https://www.mhanational.org/',
      description: 'Mental health information and resources'
    });
    
    return resources;
  }

  /**
   * Generate escalation context
   */
  generateEscalationContext(analysis: EmotionalAnalysis): EscalationContext {
    return {
      level: analysis.escalationLevel,
      patterns: analysis.patterns,
      sentiment: analysis.sentiment,
      message: this.generateEscalationMessage(analysis),
      timestamp: analysis.timestamp
    };
  }

  /**
   * Generate escalation message
   */
  private generateEscalationMessage(analysis: EmotionalAnalysis): string {
    if (analysis.escalationLevel === 'high') {
      return 'I\'m concerned about your safety. Please reach out to a crisis helpline or trusted person immediately.';
    } else if (analysis.escalationLevel === 'medium') {
      return 'It sounds like you\'re going through a difficult time. Consider speaking with a mental health professional or trusted friend.';
    } else {
      return 'If you\'re feeling overwhelmed, remember that help is available and you don\'t have to go through this alone.';
    }
  }

  /**
   * Clean old emotional history
   */
  private cleanOldHistory(): void {
    // Keep only last 10 entries
    if (this.emotionalHistory.length > 10) {
      this.emotionalHistory = this.emotionalHistory.slice(-10);
    }
  }

  /**
   * Get emotional trend analysis
   */
  getEmotionalTrend(): { direction: 'improving' | 'declining' | 'stable'; confidence: number } {
    if (this.emotionalHistory.length < 2) {
      return { direction: 'stable', confidence: 0 };
    }
    
    const recent = this.emotionalHistory.slice(-3);
    const first = recent[0].sentiment;
    const last = recent[recent.length - 1].sentiment;
    
    let direction: 'improving' | 'declining' | 'stable' = 'stable';
    if (last > first + 0.2) direction = 'improving';
    else if (last < first - 0.2) direction = 'declining';
    
    const confidence = Math.abs(last - first);
    
    return { direction, confidence };
  }

  /**
   * Update configuration
   */
  updateConfig(config: EmotionConfig): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): EmotionConfig {
    return { ...this.config };
  }
}
