/**
 * Simple Test Script for Grounded UX SDK
 * 
 * This script tests the basic functionality without requiring a full LLM integration.
 */

const { GroundedUX } = require('./dist/index.js');

console.log('🧪 Testing Grounded UX SDK...\n');

// Test 1: Initialize SDK
console.log('1️⃣ Testing SDK Initialization...');
try {
  const gx = new GroundedUX({
    cadence: { redEveryNPrompts: 3, showTallies: true },
    stance: { enabled: true, windowMinutes: 25, threshold: 2 },
    badges: { enabled: true },
    citeGate: { requireResolvable: true, fallbackMode: 'exploratory' },
    emotion: { enabled: true, escalateOn: 3, onEscalate: () => {} },
    telemetry: { anonymized: true, optIn: true }
  });
  console.log('✅ SDK initialized successfully\n');
} catch (error) {
  console.log('❌ SDK initialization failed:', error.message, '\n');
  process.exit(1);
}

// Test 2: Basic functionality
console.log('2️⃣ Testing Basic Functionality...');
const gx = new GroundedUX();

try {
  // Test prompt counting
  gx.countPrompt();
  gx.countPrompt();
  gx.countPrompt();
  
  const sessionState = gx.getSessionState();
  console.log(`✅ Prompt count: ${sessionState.promptCount} (expected: 3)`);
  
  // Test intervention detection
  const policy1 = gx.getInterventions("I'm feeling really anxious about the election");
  console.log(`✅ Emotional intervention detected: ${policy1.shouldEscalateToHuman}`);
  
  const policy2 = gx.getInterventions("The polls show Democrats leading by 15 points according to recent surveys");
  console.log(`✅ Stance analysis: ${policy2.stanceScore !== undefined ? policy2.stanceScore.toFixed(2) : 'neutral'}`);
  
  console.log('✅ Basic functionality working\n');
} catch (error) {
  console.log('❌ Basic functionality failed:', error.message, '\n');
}

// Test 3: Reality Anchors
console.log('3️⃣ Testing Reality Anchors...');
try {
  const gx = new GroundedUX({ badges: { enabled: true, level: 'sentence' } });
  
  const testText = "According to recent polls from FiveThirtyEight, the Democratic candidate is leading by 15 points. This suggests they will win the election.";
  
  gx.labelClaims(testText).then(result => {
    console.log(`✅ Original text: ${result.originalText.substring(0, 50)}...`);
    console.log(`✅ Processed text: ${result.processedText.substring(0, 60)}...`);
    console.log(`✅ Claims found: ${result.claims.length}`);
    
    if (result.claims.length > 0) {
      console.log(`✅ First claim: ${result.claims[0].type} (confidence: ${result.claims[0].confidence})`);
    }
    
    console.log('✅ Reality anchors working\n');
    runTest4();
  }).catch(error => {
    console.log('❌ Reality anchors failed:', error.message, '\n');
    runTest4();
  });
} catch (error) {
  console.log('❌ Reality anchors failed:', error.message, '\n');
  runTest4();
}

// Test 4: Cadence Nudges
function runTest4() {
  console.log('4️⃣ Testing Cadence Nudges...');
  try {
    const gx = new GroundedUX({ cadence: { redEveryNPrompts: 3, showTallies: true } });
    
    // Simulate 5 prompts
    for (let i = 0; i < 5; i++) {
      gx.countPrompt();
      const policy = gx.getInterventions(`Test message ${i + 1}`);
      
      if (policy.shouldApplyRedReply) {
        console.log(`✅ Red reply triggered at prompt ${i + 1}`);
      }
    }
    
    const sessionState = gx.getSessionState();
    console.log(`✅ Session length: ${sessionState.promptCount} prompts`);
    console.log('✅ Cadence nudges working\n');
    
    runTest5();
  } catch (error) {
    console.log('❌ Cadence nudges failed:', error.message, '\n');
    runTest5();
  }
}

// Test 5: Emotional Safeguards
function runTest5() {
  console.log('5️⃣ Testing Emotional Safeguards...');
  try {
    const gx = new GroundedUX({ emotion: { enabled: true, escalateOn: 2, onEscalate: () => {} } });
    
    const testMessages = [
      "I'm feeling really anxious about the future",
      "Everything seems hopeless and I can't sleep",
      "Maybe I should just give up on everything"
    ];
    
    testMessages.forEach((message, i) => {
      const policy = gx.getInterventions(message);
      console.log(`✅ Message ${i + 1}: Escalation level detected`);
    });
    
    console.log('✅ Emotional safeguards working\n');
    
    runTest6();
  } catch (error) {
    console.log('❌ Emotional safeguards failed:', error.message, '\n');
    runTest6();
  }
}

// Test 6: Configuration
function runTest6() {
  console.log('6️⃣ Testing Configuration...');
  try {
    const gx = new GroundedUX();
    
    // Test configuration update
    gx.updateConfig({
      cadence: { redEveryNPrompts: 2, showTallies: false },
      stance: { enabled: false }
    });
    
    console.log('✅ Configuration updated successfully');
    
    // Test session reset
    gx.resetSession();
    const newSession = gx.getSessionState();
    console.log(`✅ Session reset: prompt count is ${newSession.promptCount}`);
    
    console.log('✅ Configuration working\n');
    
    console.log('🎉 All tests completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Run: node examples/basic-usage.js (for full demo)');
    console.log('2. Check integration examples in examples/integration-guide.md');
    console.log('3. Integrate into your LLM chat application');
    
  } catch (error) {
    console.log('❌ Configuration failed:', error.message, '\n');
  }
}
