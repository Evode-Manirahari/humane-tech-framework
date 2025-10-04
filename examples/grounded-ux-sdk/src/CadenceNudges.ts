/**
 * Cadence Nudges - Implements red reply system and prompt tally tracking
 */

interface CadenceConfig {
  redEveryNPrompts: number; // 3-10, default 5
  showTallies: boolean;     // default true
}

export class CadenceNudges {
  private config: CadenceConfig;

  constructor(config: CadenceConfig) {
    this.config = config;
  }

  /**
   * Check if red reply should be applied
   */
  shouldApplyRedReply(promptCount: number): boolean {
    return promptCount > 0 && promptCount % this.config.redEveryNPrompts === 0;
  }

  /**
   * Apply red reply style to text
   */
  applyRedReplyStyle(text: string): string {
    const redReplyFrame = this.generateRedReplyFrame();
    return redReplyFrame + '\n\n' + text + '\n\n' + this.generateRedReplyFooter();
  }

  /**
   * Add prompt tally to text
   */
  addPromptTally(text: string, promptCount: number): string {
    if (!this.config.showTallies) {
      return text;
    }
    
    const tally = this.generatePromptTally(promptCount);
    return text + '\n\n---\n' + tally;
  }

  /**
   * Generate red reply frame
   */
  private generateRedReplyFrame(): string {
    return `
┌─────────────────────────────────────────────────────────────┐
│  🔍 REALITY CHECK                                          │
│  Quick check: need sources or keep brainstorming?         │
└─────────────────────────────────────────────────────────────┘`;
  }

  /**
   * Generate red reply footer
   */
  private generateRedReplyFooter(): string {
    return `
┌─────────────────────────────────────────────────────────────┐
│  💡 Remember: You're in control of this conversation.     │
│  Take a moment to reflect on what we've discussed.        │
└─────────────────────────────────────────────────────────────┘`;
  }

  /**
   * Generate prompt tally
   */
  private generatePromptTally(promptCount: number): string {
    const ticks = '│'.repeat(Math.min(promptCount, 20));
    const overflow = promptCount > 20 ? ` (+${promptCount - 20})` : '';
    
    return `
Prompt Count: ${ticks}${overflow}
Session Length: ${this.formatSessionLength(promptCount)}`;
  }

  /**
   * Format session length based on prompt count
   */
  private formatSessionLength(promptCount: number): string {
    if (promptCount < 5) {
      return 'Just started';
    } else if (promptCount < 15) {
      return 'Short session';
    } else if (promptCount < 30) {
      return 'Medium session';
    } else if (promptCount < 50) {
      return 'Long session';
    } else {
      return 'Very long session - consider taking a break';
    }
  }

  /**
   * Generate cadence warning for very long sessions
   */
  generateCadenceWarning(promptCount: number): string | null {
    if (promptCount >= 50) {
      return `
⚠️  SESSION LENGTH WARNING
You've been chatting for ${promptCount} prompts. Consider taking a break to:
• Reflect on what you've learned
• Verify important claims with sources
• Step away from the screen for a few minutes
• Come back with fresh perspective

This is just a friendly reminder - you're in control!`;
    }
    
    return null;
  }

  /**
   * Calculate optimal cadence based on user behavior
   */
  calculateOptimalCadence(userFeedback: any[]): number {
    // Analyze user feedback to determine optimal cadence
    const positiveFeedback = userFeedback.filter(f => f.rating === 'thumbs_up');
    const negativeFeedback = userFeedback.filter(f => f.rating === 'thumbs_down');
    
    // If users are consistently rating red replies negatively, increase cadence
    if (negativeFeedback.length > positiveFeedback.length) {
      return Math.min(this.config.redEveryNPrompts + 2, 10);
    }
    
    // If users are rating red replies positively, decrease cadence
    if (positiveFeedback.length > negativeFeedback.length * 2) {
      return Math.max(this.config.redEveryNPrompts - 1, 3);
    }
    
    return this.config.redEveryNPrompts;
  }

  /**
   * Generate personalized cadence message
   */
  generatePersonalizedMessage(promptCount: number, userPreferences?: any): string {
    const baseMessage = this.generateRedReplyFrame();
    
    if (userPreferences?.preferredStyle === 'minimal') {
      return `🔍 Reality check (prompt ${promptCount})`;
    }
    
    if (userPreferences?.preferredStyle === 'detailed') {
      return baseMessage + '\n\n' + this.generateDetailedGuidance();
    }
    
    return baseMessage;
  }

  /**
   * Generate detailed guidance for red reply
   */
  private generateDetailedGuidance(): string {
    return `
Guidance for this reality check:
• Review any factual claims made in this conversation
• Consider whether you need to verify information with sources
• Reflect on whether you're exploring ideas or seeking definitive answers
• Remember that AI can make mistakes and should be fact-checked
• Take a moment to consider your own knowledge and experience`;
  }

  /**
   * Check if user needs a break reminder
   */
  needsBreakReminder(promptCount: number, sessionDuration: number): boolean {
    // Remind users to take breaks based on prompt count and time
    const timeBasedBreak = sessionDuration > 30 * 60 * 1000; // 30 minutes
    const promptBasedBreak = promptCount > 25;
    
    return timeBasedBreak || promptBasedBreak;
  }

  /**
   * Generate break reminder
   */
  generateBreakReminder(): string {
    return `
🛑 BREAK REMINDER
You've been chatting for a while. Consider taking a break to:
• Stretch and move your body
• Get some fresh air
• Process what you've learned
• Return with a fresh perspective

When you're ready, we can continue exploring ideas together!`;
  }

  /**
   * Update configuration
   */
  updateConfig(config: CadenceConfig): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): CadenceConfig {
    return { ...this.config };
  }
}
