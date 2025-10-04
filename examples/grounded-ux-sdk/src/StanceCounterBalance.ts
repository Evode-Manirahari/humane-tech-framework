/**
 * Stance Counter-Balance - Implements stance scoring and opposing glance features
 */

import { StanceAnalysis, OpposingGlance } from './types';

interface StanceConfig {
  enabled: boolean;
  windowMinutes: number; // 10-45, default 25
  threshold: number;     // 1-3, default 2
}

export class StanceCounterBalance {
  private config: StanceConfig;
  private stanceHistory: StanceAnalysis[] = [];

  constructor(config: StanceConfig) {
    this.config = config;
  }

  /**
   * Analyze stance in text (-3 to +3 scale)
   */
  analyzeStance(text: string): StanceAnalysis {
    const topics = this.extractTopics(text);
    const score = this.calculateStanceScore(text, topics);
    const confidence = this.calculateConfidence(text, topics);
    
    const analysis: StanceAnalysis = {
      score,
      confidence,
      topics,
      timestamp: new Date().toISOString()
    };
    
    // Store in history for trend analysis
    this.stanceHistory.push(analysis);
    this.cleanOldHistory();
    
    return analysis;
  }

  /**
   * Check if opposing glance should be shown
   */
  shouldShowOpposingGlance(stanceAnalysis: StanceAnalysis): boolean {
    if (!this.config.enabled) {
      return false;
    }
    
    // Check if stance is beyond threshold
    if (Math.abs(stanceAnalysis.score) >= this.config.threshold) {
      return true;
    }
    
    // Check for drift over time
    if (this.hasStanceDrift()) {
      return true;
    }
    
    return false;
  }

  /**
   * Generate opposing glance content
   */
  async generateOpposingGlance(labeledOutput: any, currentStance: number): Promise<OpposingGlance> {
    const opposingStance = this.calculateOpposingStance(currentStance);
    const content = await this.generateOpposingContent(labeledOutput, opposingStance);
    const citations = this.generateOpposingCitations(labeledOutput);
    
    return {
      id: this.generateId(),
      content,
      citations,
      stanceOffset: opposingStance,
      timestamp: new Date().toISOString(),
      dismissed: false,
      pinned: false
    };
  }

  /**
   * Check if counter-balance should be applied
   */
  shouldApplyCounterBalance(currentStance: number): boolean {
    if (!this.config.enabled) {
      return false;
    }
    
    return Math.abs(currentStance) >= this.config.threshold;
  }

  /**
   * Extract topics from text
   */
  private extractTopics(text: string): string[] {
    const topicPatterns = {
      politics: [
        /democrat|republican|liberal|conservative|left|right|progressive|traditional/i,
        /election|vote|campaign|candidate|president|senate|congress/i,
        /policy|legislation|bill|law|regulation|government/i
      ],
      economics: [
        /economy|economic|financial|finance|market|stock|inflation|recession/i,
        /capitalism|socialism|tax|budget|debt|deficit|spending/i,
        /business|corporation|company|industry|trade|commerce/i
      ],
      social: [
        /social|society|community|culture|cultural|identity|diversity/i,
        /equality|inequality|discrimination|prejudice|bias|racism|sexism/i,
        /education|school|university|student|teacher|learning/i
      ],
      technology: [
        /technology|tech|digital|computer|software|hardware|internet/i,
        /ai|artificial intelligence|machine learning|algorithm|data/i,
        /privacy|security|cyber|online|platform|social media/i
      ],
      health: [
        /health|medical|medicine|doctor|patient|treatment|therapy/i,
        /mental health|depression|anxiety|stress|wellness|fitness/i,
        /vaccine|vaccination|disease|illness|symptoms|diagnosis/i
      ]
    };
    
    const topics: string[] = [];
    
    for (const [topic, patterns] of Object.entries(topicPatterns)) {
      if (patterns.some(pattern => pattern.test(text))) {
        topics.push(topic);
      }
    }
    
    return topics;
  }

  /**
   * Calculate stance score (-3 to +3)
   */
  private calculateStanceScore(text: string, topics: string[]): number {
    let score = 0;
    let weight = 0;
    
    // Political stance indicators
    const politicalIndicators = {
      left: [
        /progressive|liberal|democrat|social justice|equality|diversity|inclusion/i,
        /climate change|environment|renewable|green|sustainability/i,
        /healthcare|education|welfare|social safety net|minimum wage/i
      ],
      right: [
        /conservative|republican|traditional|family values|patriotism|freedom/i,
        /free market|capitalism|entrepreneurship|small government|tax cuts/i,
        /law and order|security|defense|military|border|immigration/i
      ]
    };
    
    // Economic stance indicators
    const economicIndicators = {
      left: [
        /wealth inequality|income gap|living wage|workers rights|union/i,
        /social safety net|universal|public|government|regulation/i
      ],
      right: [
        /free market|competition|innovation|entrepreneurship|business/i,
        /deregulation|tax cuts|small government|private sector/i
      ]
    };
    
    // Social stance indicators
    const socialIndicators = {
      left: [
        /diversity|inclusion|equality|social justice|civil rights/i,
        /lgbtq|gender|race|ethnicity|cultural|multicultural/i
      ],
      right: [
        /traditional|family|values|heritage|culture|identity/i,
        /merit|individual|personal responsibility|self-reliance/i
      ]
    };
    
    const allIndicators = { ...politicalIndicators, ...economicIndicators, ...socialIndicators };
    
    for (const [category, patterns] of Object.entries(allIndicators)) {
      for (const pattern of patterns) {
        const matches = text.match(new RegExp(pattern.source, 'gi'));
        if (matches) {
          const categoryScore = category.includes('left') ? 1 : -1;
          score += categoryScore * matches.length;
          weight += matches.length;
        }
      }
    }
    
    // Normalize score to -3 to +3 range
    if (weight > 0) {
      score = (score / weight) * 3;
      return Math.max(-3, Math.min(3, score));
    }
    
    return 0;
  }

  /**
   * Calculate confidence in stance analysis
   */
  private calculateConfidence(text: string, topics: string[]): number {
    let confidence = 0;
    
    // Higher confidence with more topics
    confidence += Math.min(topics.length * 0.2, 0.6);
    
    // Higher confidence with explicit political language
    const explicitPolitical = /democrat|republican|liberal|conservative|left|right/i;
    if (explicitPolitical.test(text)) {
      confidence += 0.3;
    }
    
    // Higher confidence with longer text
    confidence += Math.min(text.length / 1000, 0.1);
    
    return Math.min(confidence, 1.0);
  }

  /**
   * Check for stance drift over time
   */
  private hasStanceDrift(): boolean {
    if (this.stanceHistory.length < 3) {
      return false;
    }
    
    const recent = this.stanceHistory.slice(-3);
    const average = recent.reduce((sum, s) => sum + s.score, 0) / recent.length;
    
    // Check if average has drifted significantly from neutral
    return Math.abs(average) >= this.config.threshold;
  }

  /**
   * Calculate opposing stance
   */
  private calculateOpposingStance(currentStance: number): number {
    if (currentStance > 0) {
      return -Math.min(currentStance + 1, 3);
    } else if (currentStance < 0) {
      return Math.min(Math.abs(currentStance) + 1, 3);
    }
    return 0;
  }

  /**
   * Generate opposing content
   */
  private async generateOpposingContent(labeledOutput: any, opposingStance: number): Promise<string> {
    // This would typically use an LLM to generate opposing content
    // For now, we'll use template-based generation
    
    const templates = {
      political: {
        left: "Some argue that traditional approaches to governance and social policy may offer stability and proven solutions.",
        right: "Others suggest that progressive policies and social reforms may address current challenges more effectively."
      },
      economic: {
        left: "Alternative perspectives emphasize the importance of free markets and individual initiative in driving economic growth.",
        right: "Different viewpoints highlight the role of government intervention and social programs in ensuring economic fairness."
      },
      social: {
        left: "Some perspectives value traditional social structures and cultural continuity.",
        right: "Other viewpoints emphasize the importance of social progress and cultural evolution."
      }
    };
    
    // Determine topic and generate appropriate content
    const topics = this.extractTopics(labeledOutput.originalText);
    const primaryTopic = topics[0] || 'general';
    
    if (primaryTopic === 'politics' && opposingStance > 0) {
      return templates.political.left;
    } else if (primaryTopic === 'politics' && opposingStance < 0) {
      return templates.political.right;
    } else if (primaryTopic === 'economics' && opposingStance > 0) {
      return templates.economic.left;
    } else if (primaryTopic === 'economics' && opposingStance < 0) {
      return templates.economic.right;
    } else if (primaryTopic === 'social' && opposingStance > 0) {
      return templates.social.left;
    } else if (primaryTopic === 'social' && opposingStance < 0) {
      return templates.social.right;
    }
    
    return "Consider exploring alternative perspectives on this topic to gain a more balanced understanding.";
  }

  /**
   * Generate opposing citations
   */
  private generateOpposingCitations(labeledOutput: any): string[] {
    // This would typically search for credible sources with opposing viewpoints
    // For now, we'll return placeholder citations
    return [
      "Research from diverse academic institutions",
      "Policy analysis from multiple think tanks",
      "Expert opinions from various fields"
    ];
  }

  /**
   * Clean old stance history
   */
  private cleanOldHistory(): void {
    const cutoffTime = new Date(Date.now() - this.config.windowMinutes * 60 * 1000);
    this.stanceHistory = this.stanceHistory.filter(
      analysis => new Date(analysis.timestamp) > cutoffTime
    );
  }

  /**
   * Get stance trend analysis
   */
  getStanceTrend(): { direction: 'left' | 'right' | 'neutral'; magnitude: number; confidence: number } {
    if (this.stanceHistory.length < 2) {
      return { direction: 'neutral', magnitude: 0, confidence: 0 };
    }
    
    const recent = this.stanceHistory.slice(-5);
    const average = recent.reduce((sum, s) => sum + s.score, 0) / recent.length;
    const confidence = recent.reduce((sum, s) => sum + s.confidence, 0) / recent.length;
    
    let direction: 'left' | 'right' | 'neutral' = 'neutral';
    if (average > 0.5) direction = 'right';
    else if (average < -0.5) direction = 'left';
    
    return {
      direction,
      magnitude: Math.abs(average),
      confidence
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: StanceConfig): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): StanceConfig {
    return { ...this.config };
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `stance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
