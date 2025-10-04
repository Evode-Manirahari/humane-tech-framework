/**
 * Reality Anchors - Implements cite-gate, badges, and source verification
 */

import { ClaimLabel, LabeledOutput, BadgeStyle } from './types';

interface BadgeConfig {
  enabled: boolean;
  level: 'off' | 'sentence' | 'paragraph';
}

interface CiteGateConfig {
  requireResolvable: boolean;
  fallbackMode: 'exploratory' | 'warning';
}

export class RealityAnchors {
  private badgeConfig: BadgeConfig;
  private citeGateConfig: CiteGateConfig;
  private badgeStyles: BadgeStyle;

  constructor(badgeConfig: BadgeConfig, citeGateConfig: CiteGateConfig) {
    this.badgeConfig = badgeConfig;
    this.citeGateConfig = citeGateConfig;
    this.badgeStyles = this.initializeBadgeStyles();
  }

  /**
   * Label claims in text with reality anchors
   */
  async labelClaims(text: string): Promise<LabeledOutput> {
    const claims = await this.extractClaims(text);
    const processedText = this.applyBadges(text, claims);
    
    return {
      originalText: text,
      claims,
      processedText,
      metadata: {
        timestamp: new Date().toISOString(),
        promptCount: 0, // Will be set by caller
        sessionId: '' // Will be set by caller
      }
    };
  }

  /**
   * Extract and classify claims from text
   */
  private async extractClaims(text: string): Promise<ClaimLabel[]> {
    const sentences = this.splitIntoSentences(text);
    const claims: ClaimLabel[] = [];
    
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      const claim = await this.classifyClaim(sentence, i);
      if (claim) {
        claims.push(claim);
      }
    }
    
    return claims;
  }

  /**
   * Classify a sentence as cited, inference, or unverified
   */
  private async classifyClaim(sentence: string, position: number): Promise<ClaimLabel | null> {
    // Check for explicit citations
    if (this.hasExplicitCitation(sentence)) {
      return {
        type: 'cited',
        confidence: 0.9,
        source: this.extractSource(sentence),
        sentence,
        position
      };
    }
    
    // Check for factual claims that need verification
    if (this.isFactualClaim(sentence)) {
      if (this.citeGateConfig.requireResolvable) {
        return {
          type: 'unverified',
          confidence: 0.7,
          sentence,
          position
        };
      } else {
        return {
          type: 'inference',
          confidence: 0.6,
          sentence,
          position
        };
      }
    }
    
    // Check for inferential language
    if (this.isInferentialClaim(sentence)) {
      return {
        type: 'inference',
        confidence: 0.8,
        sentence,
        position
      };
    }
    
    return null;
  }

  /**
   * Apply badges to text based on claims
   */
  private applyBadges(text: string, claims: ClaimLabel[]): string {
    if (!this.badgeConfig.enabled || this.badgeConfig.level === 'off') {
      return text;
    }
    
    let processedText = text;
    
    // Apply badges in reverse order to maintain positions
    const sortedClaims = claims.sort((a, b) => b.position - a.position);
    
    for (const claim of sortedClaims) {
      const badge = this.getBadgeForClaim(claim);
      if (badge) {
        processedText = this.insertBadge(processedText, claim.position, badge);
      }
    }
    
    return processedText;
  }

  /**
   * Check if sentence has explicit citation
   */
  private hasExplicitCitation(sentence: string): boolean {
    const citationPatterns = [
      /according to .+$/i,
      /as reported by .+$/i,
      /source: .+$/i,
      /\(.+ \d{4}\)/i,
      /\[.+\]/i,
      /https?:\/\/.+/i
    ];
    
    return citationPatterns.some(pattern => pattern.test(sentence));
  }

  /**
   * Extract source from sentence
   */
  private extractSource(sentence: string): string | undefined {
    const sourcePatterns = [
      /according to ([^.]+)/i,
      /as reported by ([^.]+)/i,
      /source: ([^.]+)/i,
      /\(([^)]+ \d{4})\)/i,
      /\[([^\]]+)\]/i,
      /(https?:\/\/[^\s]+)/i
    ];
    
    for (const pattern of sourcePatterns) {
      const match = sentence.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    
    return undefined;
  }

  /**
   * Check if sentence is a factual claim
   */
  private isFactualClaim(sentence: string): boolean {
    const factualIndicators = [
      /is \d+/i,
      /was \d+/i,
      /will be \d+/i,
      /studies show/i,
      /research indicates/i,
      /data suggests/i,
      /statistics show/i,
      /the fact that/i,
      /it is true that/i,
      /historically/i,
      /scientists say/i,
      /experts agree/i
    ];
    
    return factualIndicators.some(pattern => pattern.test(sentence));
  }

  /**
   * Check if sentence is inferential
   */
  private isInferentialClaim(sentence: string): boolean {
    const inferentialIndicators = [
      /it seems/i,
      /appears to/i,
      /likely/i,
      /probably/i,
      /might be/i,
      /could be/i,
      /suggests that/i,
      /implies that/i,
      /indicates that/i,
      /this means/i,
      /therefore/i,
      /thus/i
    ];
    
    return inferentialIndicators.some(pattern => pattern.test(sentence));
  }

  /**
   * Get badge for claim type
   */
  private getBadgeForClaim(claim: ClaimLabel): string | null {
    switch (claim.type) {
      case 'cited':
        return `[${this.badgeStyles.cited}]`;
      case 'inference':
        return `[${this.badgeStyles.inference}]`;
      case 'unverified':
        return `[${this.badgeStyles.unverified}]`;
      default:
        return null;
    }
  }

  /**
   * Insert badge into text at position
   */
  private insertBadge(text: string, position: number, badge: string): string {
    const before = text.slice(0, position);
    const after = text.slice(position);
    
    if (this.badgeConfig.level === 'sentence') {
      // Insert at beginning of sentence
      return before + badge + ' ' + after;
    } else if (this.badgeConfig.level === 'paragraph') {
      // Insert at beginning of paragraph
      const paragraphStart = text.lastIndexOf('\n\n', position) + 2;
      if (paragraphStart > 0) {
        const beforeParagraph = text.slice(0, paragraphStart);
        const afterParagraph = text.slice(paragraphStart);
        return beforeParagraph + badge + ' ' + afterParagraph;
      }
      return badge + ' ' + text;
    }
    
    return text;
  }

  /**
   * Split text into sentences
   */
  private splitIntoSentences(text: string): string[] {
    // Simple sentence splitting - could be enhanced with NLP
    return text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  /**
   * Initialize badge styles
   */
  private initializeBadgeStyles(): BadgeStyle {
    return {
      cited: 'Cited',
      inference: 'Inference',
      unverified: 'Unverified'
    };
  }

  /**
   * Update configuration
   */
  updateConfig(badgeConfig: BadgeConfig, citeGateConfig: CiteGateConfig): void {
    this.badgeConfig = badgeConfig;
    this.citeGateConfig = citeGateConfig;
  }

  /**
   * Get current configuration
   */
  getConfig(): { badges: BadgeConfig; citeGate: CiteGateConfig } {
    return {
      badges: this.badgeConfig,
      citeGate: this.citeGateConfig
    };
  }
}
