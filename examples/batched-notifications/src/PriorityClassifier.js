/**
 * PriorityClassifier.js
 * 
 * This class determines the priority of incoming notifications based on
 * various factors and user preferences.
 */

export class PriorityClassifier {
  constructor(userPreferences) {
    this.userPreferences = userPreferences;
  }

  /**
   * Classify a notification into a priority category
   * @param {Object} notification The notification to classify
   * @returns {string} Priority level: 'urgent', 'important', 'standard', or 'low'
   */
  classify(notification) {
    // Check for user-defined overrides for specific senders or apps
    const senderOverride = this.getSenderOverride(notification.sender);
    if (senderOverride) {
      return senderOverride;
    }

    const appOverride = this.getAppOverride(notification.appId);
    if (appOverride) {
      return appOverride;
    }

    // Check for urgent keywords in the content
    if (this.containsUrgentKeywords(notification)) {
      return 'urgent';
    }

    // Apply machine learning model if available
    if (this.userPreferences.enableMachineLearning) {
      const mlPriority = this.predictPriorityWithML(notification);
      if (mlPriority) {
        return mlPriority;
      }
    }

    // Apply time-based prioritization
    if (this.isFromRecentInteraction(notification)) {
      return 'important';
    }

    // Apply context-aware prioritization
    const contextPriority = this.applyContextRules(notification);
    if (contextPriority) {
      return contextPriority;
    }

    // Fall back to default category based on notification type
    return this.getCategoryByType(notification);
  }

  /**
   * Check if the user has set a priority override for a specific sender
   * @param {string} sender The notification sender
   * @returns {string|null} Priority override or null if none exists
   */
  getSenderOverride(sender) {
    const overrides = this.userPreferences.senderOverrides || {};
    return overrides[sender] || null;
  }

  /**
   * Check if the user has set a priority override for a specific app
   * @param {string} appId The app identifier
   * @returns {string|null} Priority override or null if none exists
   */
  getAppOverride(appId) {
    const overrides = this.userPreferences.appOverrides || {};
    return overrides[appId] || null;
  }

  /**
   * Check if the notification contains urgent keywords
   * @param {Object} notification The notification object
   * @returns {boolean} True if urgent keywords are found
   */
  containsUrgentKeywords(notification) {
    const urgentKeywords = this.userPreferences.urgentKeywords || [
      'emergency', 'urgent', 'critical', 'important', 'alert',
      'security', 'immediately', 'action required'
    ];

    const content = `${notification.title} ${notification.body}`.toLowerCase();
    
    return urgentKeywords.some(keyword => 
      content.includes(keyword.toLowerCase())
    );
  }

  /**
   * Check if notification is from someone the user interacted with recently
   * @param {Object} notification The notification object
   * @returns {boolean} True if from recent interaction
   */
  isFromRecentInteraction(notification) {
    const recentContacts = this.userPreferences.recentContacts || [];
    return recentContacts.includes(notification.sender);
  }

  /**
   * Apply context-aware rules based on time, location, calendar, etc.
   * @param {Object} notification The notification object
   * @returns {string|null} Priority based on context or null if no rules match
   */
  applyContextRules(notification) {
    // Check if we're in do not disturb mode
    if (this.userPreferences.doNotDisturb) {
      // Only let through urgent notifications in DND mode
      if (notification.bypassDnd) {
        return 'urgent';
      } else {
        return 'low';
      }
    }
    
    // Apply time of day rules
    const hour = new Date().getHours();
    
    // Work hours priority (customize based on user preferences)
    if (this.userPreferences.workHoursEnabled &&
        hour >= this.userPreferences.workHoursStart && 
        hour <= this.userPreferences.workHoursEnd) {
      if (notification.category === 'work') {
        return 'important';
      } else {
        return 'standard'; // Non-work notifications during work hours
      }
    }
    
    // Evening wind down - lower priority for work notifications
    if (hour >= 20 || hour <= 7) { // 8pm - 7am
      if (notification.category === 'work' && !this.userPreferences.allowWorkAfterHours) {
        return 'low';
      }
    }
    
    return null; // No specific rules apply
  }

  /**
   * Use machine learning to predict notification priority based on past behavior
   * @param {Object} notification The notification object
   * @returns {string|null} Predicted priority or null if prediction not available
   */
  predictPriorityWithML(notification) {
    // This would integrate with a machine learning service
    // Simplified placeholder implementation
    return null;
  }

  /**
   * Get default category based on notification type
   * @param {Object} notification The notification object
   * @returns {string} Default priority category
   */
  getCategoryByType(notification) {
    // Map notification types to default categories
    const categoryMaps = {
      message: 'important',
      email: 'standard',
      social: 'standard',
      news: 'low',
      update: 'low',
      reminder: 'important',
      calendar: 'important',
      promotion: 'low'
    };

    // Return the mapped category or default to standard
    return categoryMaps[notification.type] || 'standard';
  }
} 