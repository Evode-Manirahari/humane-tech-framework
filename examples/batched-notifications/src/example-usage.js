/**
 * Example usage of the Batched Notifications System
 * 
 * This file demonstrates how to use the notification batching system
 * in a real application.
 */

import { NotificationService } from './NotificationService';
import { UserPreferences } from './UserPreferences';

// 1. Initialize user preferences with some customizations
const userPrefs = new UserPreferences({
  quietHoursEnabled: true,
  quietHoursStart: 23, // 11 PM
  quietHoursEnd: 7,    // 7 AM
  workHoursEnabled: true,
  workHoursStart: 9,   // 9 AM
  workHoursEnd: 17,    // 5 PM
  senderOverrides: {
    "Family": "urgent",
    "Newsletter": "low"
  }
});

// 2. Initialize notification service
const notificationService = new NotificationService(userPrefs);

// 3. Add a listener for notification events
notificationService.addListener((eventType, data) => {
  if (eventType === 'notification') {
    console.log('🔔 Immediate notification:', data.title);
    displayNotification(data);
  } else if (eventType === 'batch') {
    console.log(`📦 Batch of ${data.count} ${data.priority} notifications`);
    displayBatch(data);
  }
});

// 4. Simulated UI for displaying notifications
function displayNotification(notification) {
  console.log(`
    ┌─────────────────────────────────┐
    │ ${notification.sender.padEnd(29)} │
    │ ${notification.title.substring(0, 29).padEnd(29)} │
    │ ${notification.body ? notification.body.substring(0, 29).padEnd(29) : ' '.repeat(29)} │
    └─────────────────────────────────┘
  `);
}

// 5. Simulated UI for displaying notification batches
function displayBatch(batch) {
  console.log(`
    ┌─────────────────────────────────┐
    │ ${batch.count} Notifications (${batch.priority.padEnd(16)}) │
    ├─────────────────────────────────┤
    ${batch.notifications.map(n => `│ • ${n.sender}: ${n.title.substring(0, 15)}... │`).join('\n    ')}
    └─────────────────────────────────┘
  `);

  // Provide a preview and call to action
  console.log(`* Tap to view all ${batch.count} notifications`);
}

// 6. Example function to show next scheduled batch deliveries
function showSchedule() {
  const priorities = ['important', 'standard', 'low'];
  console.log('\nUpcoming notification batches:');
  
  priorities.forEach(priority => {
    const nextDelivery = notificationService.getNextScheduledDelivery(priority);
    if (nextDelivery) {
      const timeString = nextDelivery.toLocaleTimeString();
      console.log(`  • ${priority.padEnd(10)}: ${timeString}`);
    }
  });
}

// 7. Example of receiving various notifications
function simulateNotifications() {
  console.log('\n=== Starting Notification Simulation ===\n');
  
  // Urgent notification (delivered immediately if allowed)
  notificationService.receiveNotification({
    id: '1',
    sender: 'Family',
    title: 'Emergency: Please call home',
    body: 'It\'s urgent, please call as soon as possible',
    type: 'message',
    appId: 'com.example.messenger',
    category: 'personal',
    bypassDnd: true
  });
  
  // Important notification (batched)
  notificationService.receiveNotification({
    id: '2',
    sender: 'Boss',
    title: 'Meeting in 30 minutes',
    body: 'Don\'t forget our team meeting at 2pm',
    type: 'calendar',
    appId: 'com.example.calendar',
    category: 'work'
  });
  
  // Standard notification (batched)
  notificationService.receiveNotification({
    id: '3',
    sender: 'Social App',
    title: 'New comment on your post',
    body: 'Alex commented: "Great photo!"',
    type: 'social',
    appId: 'com.example.social',
    category: 'personal'
  });
  
  // Low priority notification (batched)
  notificationService.receiveNotification({
    id: '4',
    sender: 'Newsletter',
    title: 'Weekly Tech Updates',
    body: 'Check out the latest tech news',
    type: 'news',
    appId: 'com.example.news',
    category: 'personal'
  });
  
  // Show upcoming schedule
  showSchedule();
  
  console.log('\n=== End of Simulation ===');
  console.log('In a real app, batches would be delivered at the scheduled times.');
  console.log('Users would have full control over delivery schedules and priorities.');
}

// Run the simulation
simulateNotifications(); 