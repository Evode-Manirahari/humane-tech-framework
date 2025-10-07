/**
 * UserPreferences.js
 * 
 * This class manages user preferences for notification handling,
 * demonstrating customizable controls that respect user agency.
 */

export class UserPreferences {
  constructor(initialPreferences = {}) {
    // Set default values, overridden by any provided preferences
    this.preferences = {
      // Delivery preferences
      allowUrgentImmediately: true, // Whether urgent notifications bypass batching
      batchFrequencies: {
        urgent: 0, // Immediate (in minutes)
        important: 30, // 30 minutes
        standard: 60, // 1 hour
        low: 180 // 3 hours
      },
      batchThresholds: {
        urgent: 1, // Deliver after this many notifications
        important: 3,
        standard: 5,
        low: 10
      },
      maxWaitTime: {
        urgent: 0, // Maximum minutes to hold notifications
        important: 30,
        standard: 120,
        low: 240
      },
      
      // Quiet hours settings
      quietHoursEnabled: false,
      quietHoursStart: 22, // 10 PM
      quietHoursEnd: 7, // 7 AM
      
      // Work hours settings
      workHoursEnabled: false,
      workHoursStart: 9, // 9 AM
      workHoursEnd: 17, // 5 PM
      allowWorkAfterHours: false,
      
      // Do not disturb
      doNotDisturb: false,
      
      // Override specific senders or apps
      senderOverrides: {}, // e.g. { "Alice": "urgent", "Newsletter": "low" }
      appOverrides: {}, // e.g. { "com.example.chat": "important" }
      
      // Advanced features
      enableMachineLearning: true, // Use ML to predict importance
      urgentKeywords: [
        'emergency', 'urgent', 'critical', 'important', 'alert',
        'security', 'immediately', 'action required'
      ],
      
      // Recent contacts for prioritization
      recentContacts: [], // Populated dynamically
      
      // Accessibility options
      disableAnimations: false,
      highContrastMode: false,
      
      ...initialPreferences // Override defaults with any provided values
    };
    
    // Set up observers for preference changes
    this.observers = [];
  }
  
  /**
   * Update user preferences
   * @param {Object} newPreferences Object with preferences to update
   */
  updatePreferences(newPreferences) {
    // Deep merge the new preferences
    this._deepMerge(this.preferences, newPreferences);
    
    // Notify observers of changes
    this._notifyObservers();
    
    return this.preferences;
  }
  
  /**
   * Get all user preferences
   * @returns {Object} The current preference object
   */
  getAllPreferences() {
    return { ...this.preferences };
  }
  
  /**
   * Get a specific preference value
   * @param {string} key The preference key to retrieve
   * @returns {*} The preference value
   */
  getPreference(key) {
    return this.preferences[key];
  }
  
  /**
   * Add an app to overrides with specific priority
   * @param {string} appId The app identifier
   * @param {string} priority The priority level for the app
   */
  setAppPriority(appId, priority) {
    if (!this.preferences.appOverrides) {
      this.preferences.appOverrides = {};
    }
    
    this.preferences.appOverrides[appId] = priority;
    this._notifyObservers();
  }
  
  /**
   * Add a sender to overrides with specific priority
   * @param {string} sender The sender identifier
   * @param {string} priority The priority level for the sender
   */
  setSenderPriority(sender, priority) {
    if (!this.preferences.senderOverrides) {
      this.preferences.senderOverrides = {};
    }
    
    this.preferences.senderOverrides[sender] = priority;
    this._notifyObservers();
  }
  
  /**
   * Enable or disable quiet hours
   * @param {boolean} enabled Whether quiet hours should be enabled
   * @param {number} startHour Start hour (0-23)
   * @param {number} endHour End hour (0-23)
   */
  setQuietHours(enabled, startHour = null, endHour = null) {
    this.preferences.quietHoursEnabled = enabled;
    
    if (startHour !== null) {
      this.preferences.quietHoursStart = Math.min(23, Math.max(0, startHour));
    }
    
    if (endHour !== null) {
      this.preferences.quietHoursEnd = Math.min(23, Math.max(0, endHour));
    }
    
    this._notifyObservers();
  }
  
  /**
   * Enable or disable work hours
   * @param {boolean} enabled Whether work hours should be enabled
   * @param {number} startHour Start hour (0-23)
   * @param {number} endHour End hour (0-23)
   * @param {boolean} allowWorkAfterHours Whether work notifications are allowed after hours
   */
  setWorkHours(enabled, startHour = null, endHour = null, allowWorkAfterHours = null) {
    this.preferences.workHoursEnabled = enabled;
    
    if (startHour !== null) {
      this.preferences.workHoursStart = Math.min(23, Math.max(0, startHour));
    }
    
    if (endHour !== null) {
      this.preferences.workHoursEnd = Math.min(23, Math.max(0, endHour));
    }
    
    if (allowWorkAfterHours !== null) {
      this.preferences.allowWorkAfterHours = allowWorkAfterHours;
    }
    
    this._notifyObservers();
  }
  
  /**
   * Add a recent contact for prioritization
   * @param {string} contact The contact identifier
   */
  addRecentContact(contact) {
    if (!this.preferences.recentContacts) {
      this.preferences.recentContacts = [];
    }
    
    // Remove if already exists
    this.preferences.recentContacts = this.preferences.recentContacts
      .filter(c => c !== contact);
    
    // Add to front of array
    this.preferences.recentContacts.unshift(contact);
    
    // Limit to 10 recent contacts
    this.preferences.recentContacts = this.preferences.recentContacts.slice(0, 10);
    
    this._notifyObservers();
  }
  
  /**
   * Add an observer to be notified of preference changes
   * @param {Function} callback The observer callback
   */
  addObserver(callback) {
    this.observers.push(callback);
  }
  
  /**
   * Remove an observer
   * @param {Function} callback The observer to remove
   */
  removeObserver(callback) {
    this.observers = this.observers.filter(cb => cb !== callback);
  }
  
  /**
   * Deep merge objects
   * @param {Object} target The target object
   * @param {Object} source The source object
   * @returns {Object} The merged object
   * @private
   */
  _deepMerge(target, source) {
    for (const key in source) {
      if (source[key] instanceof Object && key in target) {
        this._deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
    return target;
  }
  
  /**
   * Notify all observers of preference changes
   * @private
   */
  _notifyObservers() {
    this.observers.forEach(callback => {
      callback(this.preferences);
    });
  }
} 