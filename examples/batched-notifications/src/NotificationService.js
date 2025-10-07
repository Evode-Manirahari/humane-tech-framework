/**
 * NotificationService.js
 * 
 * This service handles the receipt, categorization, and delivery of notifications.
 * It demonstrates the "Batched Notifications" pattern from our Humane Technology Framework.
 */

import { PriorityClassifier } from './PriorityClassifier';
import { NotificationBatcher } from './NotificationBatcher';

export class NotificationService {
  constructor(userPreferences) {
    this.userPreferences = userPreferences;
    this.priorityClassifier = new PriorityClassifier(userPreferences);
    this.batcher = new NotificationBatcher(userPreferences);
    this.listeners = [];

    // Initialize notification batches
    this.batches = {
      urgent: [],
      important: [],
      standard: [],
      low: []
    };

    // Start the batching scheduler
    this._startBatchScheduler();
  }

  /**
   * Receive a new notification and process it according to user preferences
   * @param {Object} notification The notification object
   */
  receiveNotification(notification) {
    // Determine notification priority
    const priority = this.priorityClassifier.classify(notification);
    
    // Add metadata
    notification.received = new Date();
    notification.priority = priority;
    notification.read = false;
    
    // Handle based on priority and user preferences
    if (priority === 'urgent' && this.userPreferences.allowUrgentImmediately) {
      // Deliver urgent notifications immediately
      this._deliverNotification(notification);
    } else {
      // Add to appropriate batch
      this.batches[priority].push(notification);
      
      // If this batch should be delivered based on rules, deliver it
      if (this._shouldDeliverBatchNow(priority)) {
        this._deliverBatch(priority);
      }
    }
    
    return notification;
  }
  
  /**
   * Add a listener for notification events
   * @param {Function} listener Callback function for notification events
   */
  addListener(listener) {
    this.listeners.push(listener);
  }
  
  /**
   * Remove a notification listener
   * @param {Function} listener The listener to remove
   */
  removeListener(listener) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }
  
  /**
   * Get the next scheduled delivery time for a specific priority
   * @param {string} priority The notification priority
   * @returns {Date} The next scheduled delivery time
   */
  getNextScheduledDelivery(priority) {
    return this.batcher.getNextDeliveryTime(priority);
  }
  
  /**
   * Get a preview of pending notifications in a batch
   * @param {string} priority The priority level to preview
   * @returns {Array} Summary of pending notifications
   */
  previewBatch(priority) {
    if (!this.batches[priority]) {
      return [];
    }
    
    return this.batches[priority].map(notification => ({
      id: notification.id,
      sender: notification.sender,
      title: notification.title,
      received: notification.received
    }));
  }
  
  /**
   * Schedule batch deliveries based on user preferences
   * @private
   */
  _startBatchScheduler() {
    // Set up recurring delivery for each priority level
    for (const priority in this.batches) {
      if (priority === 'urgent') continue; // Urgent handled separately
      
      this.batcher.scheduleBatch(priority, () => {
        if (this.batches[priority].length > 0) {
          this._deliverBatch(priority);
        }
      });
    }
  }
  
  /**
   * Determine if a batch should be delivered now based on rules
   * @param {string} priority The priority level
   * @returns {boolean} Whether the batch should be delivered now
   * @private
   */
  _shouldDeliverBatchNow(priority) {
    // Check if there are enough notifications to trigger immediate delivery
    if (this.batches[priority].length >= this.userPreferences.batchThresholds[priority]) {
      return true;
    }
    
    // Check if the oldest notification has been waiting too long
    if (this.batches[priority].length > 0) {
      const oldestNotification = this.batches[priority][0];
      const waitTime = new Date() - oldestNotification.received;
      return waitTime > this.userPreferences.maxWaitTime[priority];
    }
    
    return false;
  }
  
  /**
   * Deliver a single notification immediately
   * @param {Object} notification The notification to deliver
   * @private
   */
  _deliverNotification(notification) {
    // Notify all listeners
    this.listeners.forEach(listener => {
      listener('notification', notification);
    });
  }
  
  /**
   * Deliver a batch of notifications
   * @param {string} priority The priority batch to deliver
   * @private
   */
  _deliverBatch(priority) {
    if (this.batches[priority].length === 0) {
      return;
    }
    
    // Create a batch object
    const batch = {
      priority,
      notifications: [...this.batches[priority]],
      deliveredAt: new Date(),
      count: this.batches[priority].length
    };
    
    // Clear the batch
    this.batches[priority] = [];
    
    // Reschedule next delivery
    this.batcher.resetSchedule(priority);
    
    // Notify all listeners
    this.listeners.forEach(listener => {
      listener('batch', batch);
    });
  }
} 