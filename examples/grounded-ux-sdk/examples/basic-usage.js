/**
 * Basic Usage Example for Grounded UX SDK
 * 
 * This example shows how to integrate the Grounded UX SDK into a simple
 * LLM chat application to add reality anchors and prevent drift.
 */

const { GroundedUX } = require('../dist/index.js');

// Initialize the SDK with custom configuration
const gx = new GroundedUX({
  cadence: {
    redEveryNPrompts: 5,
    showTallies: true
  },
  stance: {
    enabled: true,
    windowMinutes: 25,
    threshold: 2
  },
  badges: {
    enabled: true,
    level: 'sentence'
  },
  citeGate: {
    requireResolvable: true,
    fallbackMode: 'exploratory'
  },
  reflection: {
    hotkey: 'Ctrl+R',
    enabled: true
  },
  emotion: {
    enabled: true,
    escalateOn: 3,
    onEscalate: ({ level, patterns, sentiment, message }) => {
      console.log(`\n🚨 EMOTIONAL ESCALATION DETECTED (${level.toUpperCase()})`);
      console.log(`Patterns: ${patterns.join(', ')}`);
      console.log(`Sentiment: ${sentiment.toFixed(2)}`);
      console.log(`Message: ${message}`);
      console.log('Consider reaching out to a trusted person or mental health professional.\n');
    }
  },
  telemetry: {
    anonymized: true,
    optIn: true
  }
});

// Simulate a conversation with the LLM
async function simulateConversation() {
  console.log('🤖 Starting Grounded UX SDK Demo\n');
  
  const conversation = [
    "I'm feeling really anxious about the upcoming election. What do you think will happen?",
    "The polls show that the Democratic candidate is leading by 15 points according to recent surveys.",
    "I don't trust those polls. They're always wrong and biased against conservatives.",
    "Actually, studies have shown that polling accuracy has improved significantly in recent years.",
    "I'm so worried about the future. Everything seems hopeless and I can't sleep at night.",
    "The economy is definitely going to crash next year. All the experts are saying so.",
    "I've been reading about conspiracy theories online and they make a lot of sense to me.",
    "The mainstream media is completely controlled by the government and can't be trusted.",
    "I'm feeling really depressed and don't know what to do. Nothing seems to matter anymore.",
    "Maybe I should just give up on everything. What's the point of trying?"
  ];
  
  for (let i = 0; i < conversation.length; i++) {
    const userMessage = conversation[i];
    console.log(`👤 User (Prompt ${i + 1}): ${userMessage}\n`);
    
    // Count the prompt
    gx.countPrompt();
    
    // Get interventions needed
    const policy = gx.getInterventions(userMessage);
    console.log(`🔍 Interventions: ${policy.toPromptHints().join(', ')}\n`);
    
    // Simulate LLM response (in real usage, this would call your LLM)
    const llmResponse = await simulateLLMResponse(userMessage, policy);
    
    // Process the response through the SDK
    const labeledOutput = await gx.labelClaims(llmResponse);
    const balancedOutput = await gx.counterBalanceIfNeeded(labeledOutput);
    const finalOutput = gx.applyCadenceStyles(balancedOutput);
    
    console.log(`🤖 AI Response: ${finalOutput.processedText}\n`);
    
    // Simulate user feedback (thumbs up/down)
    const feedback = simulateUserFeedback(i);
    if (feedback) {
      gx.submitFeedback(feedback.rating, feedback.reason, feedback.context);
      console.log(`👍 User Feedback: ${feedback.rating} - ${feedback.reason}\n`);
    }
    
    console.log('---\n');
    
    // Show telemetry data every few prompts
    if ((i + 1) % 3 === 0) {
      const telemetry = gx.getTelemetryData();
      if (telemetry) {
        console.log('📊 Telemetry Data:');
        console.log(`   Prompt Count: ${telemetry.promptCount}`);
        console.log(`   Grounding Rate: ${(telemetry.metrics.groundingRate * 100).toFixed(1)}%`);
        console.log(`   User Satisfaction: ${((telemetry.userFeedback.thumbsUp / (telemetry.userFeedback.thumbsUp + telemetry.userFeedback.thumbsDown)) * 100).toFixed(1)}%`);
        console.log('---\n');
      }
    }
  }
  
  // Show final insights
  console.log('📈 Final Session Insights:');
  const sessionState = gx.getSessionState();
  console.log(`   Total Prompts: ${sessionState.promptCount}`);
  console.log(`   Interventions Applied: ${sessionState.interventions.length}`);
  console.log(`   Current Stance: ${sessionState.currentStance.toFixed(2)}`);
  console.log(`   Emotional Level: ${sessionState.emotionalState.escalationLevel}`);
  
  const telemetry = gx.getTelemetryData();
  if (telemetry) {
    console.log(`   Overall Satisfaction: ${((telemetry.userFeedback.thumbsUp / (telemetry.userFeedback.thumbsUp + telemetry.userFeedback.thumbsDown)) * 100).toFixed(1)}%`);
  }
}

// Simulate LLM response based on user message and policy
async function simulateLLMResponse(userMessage, policy) {
  // In real usage, this would call your actual LLM
  // Here we simulate different types of responses
  
  if (userMessage.includes('anxious') || userMessage.includes('worried')) {
    return "I understand you're feeling anxious. It's important to remember that I'm an AI and not a mental health professional. While I can provide general information, for anxiety-related concerns, consider speaking with a therapist or counselor who can provide personalized support.";
  }
  
  if (userMessage.includes('polls') || userMessage.includes('election')) {
    return "According to recent polls from FiveThirtyEight and RealClearPolitics, the Democratic candidate is leading by approximately 12-15 points in national polling averages. However, polls can change, and it's important to verify information from multiple credible sources.";
  }
  
  if (userMessage.includes('economy') || userMessage.includes('crash')) {
    return "Economic predictions are inherently uncertain. While some analysts have expressed concerns about potential economic challenges, others remain optimistic. The Federal Reserve and various economic institutions provide regular updates on economic indicators that you can monitor.";
  }
  
  if (userMessage.includes('conspiracy') || userMessage.includes('media')) {
    return "It's important to critically evaluate information from all sources. While media bias exists, most mainstream news organizations follow journalistic standards and fact-checking processes. Consider consulting multiple sources and fact-checking organizations to verify claims.";
  }
  
  if (userMessage.includes('depressed') || userMessage.includes('hopeless')) {
    return "I'm concerned about what you're describing. Feelings of depression and hopelessness are serious, and it's important to seek professional help. Consider reaching out to a mental health professional, crisis helpline, or trusted friend. You don't have to face this alone.";
  }
  
  // Default response
  return "I appreciate you sharing that with me. It's important to remember that I'm an AI assistant and not a human friend or professional advisor. While I can provide information and support, for personal or serious matters, consider consulting with appropriate professionals or trusted individuals in your life.";
}

// Simulate user feedback
function simulateUserFeedback(promptIndex) {
  // Simulate different types of feedback based on prompt content
  const feedbackOptions = [
    { rating: 'thumbs_up', reason: 'Helpful reality check', context: 'cadence' },
    { rating: 'thumbs_down', reason: 'Too intrusive', context: 'stance' },
    { rating: 'thumbs_up', reason: 'Good emotional support', context: 'emotional' },
    { rating: 'thumbs_up', reason: 'Appreciate the citations', context: 'reality_anchors' },
    { rating: 'thumbs_down', reason: 'Opposing glance was confusing', context: 'stance' }
  ];
  
  // Return feedback for some prompts (not all)
  if (Math.random() > 0.7) {
    return feedbackOptions[Math.floor(Math.random() * feedbackOptions.length)];
  }
  
  return null;
}

// Run the demo
if (require.main === module) {
  simulateConversation().catch(console.error);
}

module.exports = { simulateConversation, simulateLLMResponse, simulateUserFeedback };
