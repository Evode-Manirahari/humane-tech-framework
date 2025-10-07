/**
 * NotificationBatcher.js
 * 
 * This class handles the scheduling and batching of notifications
 * based on user preferences and notification priorities.
 */

export class NotificationBatcher {
  constructor(userPreferences) {
    this.userPreferences = userPreferences;
    this.scheduledDeliveries = {};
    this.nextDeliveryTimes = {};
    this.timers = {};
  }

  /**
   * Schedule a recurring batch delivery for a notification priority
   * @param {string} priority The notification priority to schedule
   * @param {Function} callback Function to call when batch should be delivered
   */
  scheduleBatch(priority, callback) {
    // Clear any existing timer for this priority
    if (this.timers[priority]) {
      clearTimeout(this.timers[priority]);
    }
    
    // Get batch frequency for this priority from user preferences
    const frequencyMinutes = this.getBatchFrequency(priority);
    
    // Calculate next delivery time
    const nextDelivery = this.calculateNextDeliveryTime(priority, frequencyMinutes);
    this.nextDeliveryTimes[priority] = nextDelivery;
    
    // Calculate delay in milliseconds
    const now = new Date();
    const delay = Math.max(0, nextDelivery - now);
    
    // Schedule the delivery
    this.timers[priority] = setTimeout(() => {
      // Call the provided callback when it's time to deliver
      callback();
      
      // Reschedule for the next delivery
      this.scheduleBatch(priority, callback);
    }, delay);
    
    this.scheduledDeliveries[priority] = {
      frequency: frequencyMinutes,
      nextDelivery: nextDelivery,
      callback
    };
  }

  /**
   * Reset the schedule for a priority after delivering a batch
   * @param {string} priority The notification priority
   */
  resetSchedule(priority) {
    const delivery = this.scheduledDeliveries[priority];
    if (!delivery) return;
    
    // Clear existing timer
    if (this.timers[priority]) {
      clearTimeout(this.timers[priority]);
    }
    
    // Calculate new delivery time
    const nextDelivery = this.calculateNextDeliveryTime(priority, delivery.frequency);
    this.nextDeliveryTimes[priority] = nextDelivery;
    
    // Calculate new delay
    const now = new Date();
    const delay = Math.max(0, nextDelivery - now);
    
    // Schedule the new delivery
    this.timers[priority] = setTimeout(() => {
      delivery.callback();
      this.resetSchedule(priority);
    }, delay);
  }

  /**
   * Get the next delivery time for a specific priority
   * @param {string} priority The notification priority
   * @returns {Date} The next scheduled delivery time
   */
  getNextDeliveryTime(priority) {
    return this.nextDeliveryTimes[priority] || null;
  }

  /**
   * Get batch frequency in minutes for a specific priority
   * @param {string} priority The notification priority
   * @returns {number} Frequency in minutes
   * @private
   */
  getBatchFrequency(priority) {
    const defaultFrequencies = {
      urgent: 0, // Immediately
      important: 30, // 30 minutes
      standard: 60, // 1 hour
      low: 180 // 3 hours
    };
    
    // Use user preference if available, otherwise use default
    return (this.userPreferences.batchFrequencies || {})[priority] || 
           defaultFrequencies[priority] || 
           60; // Default to 1 hour if no match
  }

  /**
   * Calculate the next delivery time based on current time and user preferences
   * @param {string} priority The notification priority
   * @param {number} frequencyMinutes How often batches should be delivered (in minutes)
   * @returns {Date} The next delivery time
   * @private
   */
  calculateNextDeliveryTime(priority, frequencyMinutes) {
    const now = new Date();
    const nextDelivery = new Date(now.getTime() + frequencyMinutes * 60 * 1000);
    
    // Check if this falls within quiet hours
    if (this.isInQuietHours(nextDelivery) && priority !== 'urgent') {
      // If in quiet hours, schedule for end of quiet hours
      return this.getEndOfQuietHours();
    }
    
    return nextDelivery;
  }

  /**
   * Check if a given time is within user-defined quiet hours
   * @param {Date} time The time to check
   * @returns {boolean} True if within quiet hours
   * @private
   */
  isInQuietHours(time) {
    if (!this.userPreferences.quietHoursEnabled) {
      return false;
    }
    
    const hour = time.getHours();
    const quietStart = this.userPreferences.quietHoursStart || 22; // 10 PM default
    const quietEnd = this.userPreferences.quietHoursEnd || 7; // 7 AM default
    
    // Handle midnight crossing
    if (quietStart > quietEnd) {
      return hour >= quietStart || hour < quietEnd;
    } else {
      return hour >= quietStart && hour < quietEnd;
    }
  }

  /**
   * Get the end time of quiet hours
   * @returns {Date} The end time of quiet hours
   * @private
   */
  getEndOfQuietHours() {
    const now = new Date();
    const quietEnd = this.userPreferences.quietHoursEnd || 7; // 7 AM default
    
    // Create a date for today at quiet hours end
    const endTime = new Date(now);
    endTime.setHours(quietEnd, 0, 0, 0);
    
    // If we're past the end time, schedule for tomorrow
    if (now > endTime) {
      endTime.setDate(endTime.getDate() + 1);
    }
    
    return endTime;
  }

  /**
   * Clean up any timers when this object is destroyed
   */
  cleanup() {
    Object.values(this.timers).forEach(timer => {
      clearTimeout(timer);
    });
    this.timers = {};
  }
} 