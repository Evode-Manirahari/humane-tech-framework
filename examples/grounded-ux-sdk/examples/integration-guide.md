# Integration Guide

This guide shows how to integrate the Grounded UX SDK into various types of applications.

## React/Next.js Integration

```tsx
import { useEffect, useState } from 'react';
import { GroundedUX } from '@grounded/ux';

export function ChatInterface() {
  const [gx] = useState(() => new GroundedUX({
    cadence: { redEveryNPrompts: 5, showTallies: true },
    stance: { enabled: true, windowMinutes: 25, threshold: 2 },
    badges: { enabled: true },
    emotion: {
      enabled: true,
      onEscalate: ({ level }) => {
        // Show human options modal
        setShowHumanOptions(true);
      }
    }
  }));
  
  const [messages, setMessages] = useState([]);
  const [showHumanOptions, setShowHumanOptions] = useState(false);
  
  const handleUserMessage = async (userMessage: string) => {
    // Count prompt
    gx.countPrompt();
    
    // Get interventions
    const policy = gx.getInterventions(userMessage);
    
    // Call your LLM
    const llmResponse = await callLLM(userMessage, policy.toPromptHints());
    
    // Process through SDK
    const labeledOutput = await gx.labelClaims(llmResponse);
    const balancedOutput = await gx.counterBalanceIfNeeded(labeledOutput);
    const finalOutput = gx.applyCadenceStyles(balancedOutput);
    
    // Add to messages
    setMessages(prev => [...prev, {
      user: userMessage,
      ai: finalOutput.processedText,
      timestamp: new Date()
    }]);
  };
  
  return (
    <div className="chat-interface">
      {/* Chat messages */}
      {messages.map((msg, i) => (
        <div key={i} className="message">
          <div className="user-message">{msg.user}</div>
          <div className="ai-message">{msg.ai}</div>
        </div>
      ))}
      
      {/* Human options modal */}
      {showHumanOptions && (
        <HumanOptionsModal 
          onClose={() => setShowHumanOptions(false)}
          options={gx.generateHumanOptions()}
        />
      )}
    </div>
  );
}
```

## Express.js API Integration

```javascript
const express = require('express');
const { GroundedUX } = require('@grounded/ux');

const app = express();
app.use(express.json());

// Initialize SDK instance per session
const sessions = new Map();

app.post('/api/chat', async (req, res) => {
  const { sessionId, message } = req.body;
  
  // Get or create session
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, new GroundedUX({
      cadence: { redEveryNPrompts: 5, showTallies: true },
      stance: { enabled: true, windowMinutes: 25, threshold: 2 },
      badges: { enabled: true },
      emotion: {
        enabled: true,
        onEscalate: ({ level }) => {
          // Log escalation for monitoring
          console.log(`Escalation detected in session ${sessionId}: ${level}`);
        }
      }
    }));
  }
  
  const gx = sessions.get(sessionId);
  
  try {
    // Count prompt
    gx.countPrompt();
    
    // Get interventions
    const policy = gx.getInterventions(message);
    
    // Call your LLM
    const llmResponse = await callLLM(message, policy.toPromptHints());
    
    // Process through SDK
    const labeledOutput = await gx.labelClaims(llmResponse);
    const balancedOutput = await gx.counterBalanceIfNeeded(labeledOutput);
    const finalOutput = gx.applyCadenceStyles(balancedOutput);
    
    res.json({
      response: finalOutput.processedText,
      interventions: policy.toPromptHints(),
      sessionState: gx.getSessionState()
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/feedback', (req, res) => {
  const { sessionId, rating, reason, context } = req.body;
  
  if (sessions.has(sessionId)) {
    const gx = sessions.get(sessionId);
    gx.submitFeedback(rating, reason, context);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Session not found' });
  }
});

app.get('/api/telemetry/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  
  if (sessions.has(sessionId)) {
    const gx = sessions.get(sessionId);
    const telemetry = gx.getTelemetryData();
    res.json(telemetry);
  } else {
    res.status(404).json({ error: 'Session not found' });
  }
});
```

## Vue.js Integration

```vue
<template>
  <div class="chat-container">
    <div class="messages">
      <div 
        v-for="(message, index) in messages" 
        :key="index"
        class="message"
        :class="{ 'red-reply': message.isRedReply }"
      >
        <div class="user-message">{{ message.user }}</div>
        <div class="ai-message" v-html="formatAIResponse(message.ai)"></div>
      </div>
    </div>
    
    <div class="input-area">
      <input 
        v-model="currentMessage"
        @keyup.enter="sendMessage"
        placeholder="Type your message..."
      />
      <button @click="sendMessage">Send</button>
    </div>
    
    <HumanOptionsModal 
      v-if="showHumanOptions"
      @close="showHumanOptions = false"
      :options="humanOptions"
    />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { GroundedUX } from '@grounded/ux';

export default {
  name: 'ChatInterface',
  setup() {
    const gx = ref(null);
    const messages = ref([]);
    const currentMessage = ref('');
    const showHumanOptions = ref(false);
    const humanOptions = ref(null);
    
    onMounted(() => {
      gx.value = new GroundedUX({
        cadence: { redEveryNPrompts: 5, showTallies: true },
        stance: { enabled: true, windowMinutes: 25, threshold: 2 },
        badges: { enabled: true },
        emotion: {
          enabled: true,
          onEscalate: ({ level }) => {
            showHumanOptions.value = true;
            humanOptions.value = gx.value.generateHumanOptions();
          }
        }
      });
    });
    
    const sendMessage = async () => {
      if (!currentMessage.value.trim()) return;
      
      const userMessage = currentMessage.value;
      currentMessage.value = '';
      
      // Count prompt
      gx.value.countPrompt();
      
      // Get interventions
      const policy = gx.value.getInterventions(userMessage);
      
      // Call your LLM
      const llmResponse = await callLLM(userMessage, policy.toPromptHints());
      
      // Process through SDK
      const labeledOutput = await gx.value.labelClaims(llmResponse);
      const balancedOutput = await gx.value.counterBalanceIfNeeded(labeledOutput);
      const finalOutput = gx.value.applyCadenceStyles(balancedOutput);
      
      // Add to messages
      messages.value.push({
        user: userMessage,
        ai: finalOutput.processedText,
        isRedReply: policy.shouldApplyRedReply,
        timestamp: new Date()
      });
    };
    
    const formatAIResponse = (text) => {
      // Format badges and special styling
      return text
        .replace(/\[Cited\]/g, '<span class="badge cited">[Cited]</span>')
        .replace(/\[Inference\]/g, '<span class="badge inference">[Inference]</span>')
        .replace(/\[Unverified\]/g, '<span class="badge unverified">[Unverified]</span>');
    };
    
    return {
      messages,
      currentMessage,
      showHumanOptions,
      humanOptions,
      sendMessage,
      formatAIResponse
    };
  }
};
</script>
```

## Discord Bot Integration

```javascript
const { Client, Intents } = require('discord.js');
const { GroundedUX } = require('@grounded/ux');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

// Store SDK instances per user
const userSessions = new Map();

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  
  const userId = message.author.id;
  
  // Get or create user session
  if (!userSessions.has(userId)) {
    userSessions.set(userId, new GroundedUX({
      cadence: { redEveryNPrompts: 3, showTallies: true },
      stance: { enabled: true, windowMinutes: 15, threshold: 2 },
      badges: { enabled: true },
      emotion: {
        enabled: true,
        onEscalate: ({ level }) => {
          message.channel.send({
            embeds: [{
              title: '🚨 Emotional Support Available',
              description: 'If you\'re going through a difficult time, consider reaching out to a trusted friend or mental health professional.',
              color: 0xff6b6b,
              fields: [
                { name: 'Crisis Support', value: 'Text HOME to 741741', inline: true },
                { name: 'National Suicide Prevention', value: 'Call 988', inline: true }
              ]
            }]
          });
        }
      }
    }));
  }
  
  const gx = userSessions.get(userId);
  
  try {
    // Count prompt
    gx.countPrompt();
    
    // Get interventions
    const policy = gx.getInterventions(message.content);
    
    // Call your LLM
    const llmResponse = await callLLM(message.content, policy.toPromptHints());
    
    // Process through SDK
    const labeledOutput = await gx.labelClaims(llmResponse);
    const balancedOutput = await gx.counterBalanceIfNeeded(labeledOutput);
    const finalOutput = gx.applyCadenceStyles(balancedOutput);
    
    // Send response
    await message.reply(finalOutput.processedText);
    
  } catch (error) {
    console.error('Error processing message:', error);
    await message.reply('Sorry, I encountered an error processing your message.');
  }
});

client.login('YOUR_BOT_TOKEN');
```

## Custom Instructions for ChatGPT

Use this custom instruction in ChatGPT or similar systems:

```
You are a helpful AI assistant with built-in reality anchors. Follow these guidelines:

1. **Citation Requirements**: When making factual claims, always cite sources or label as [Inference] or [Unverified].

2. **Reality Checks**: Every 5 responses, include a brief reality check reminder: "⚠️ REMINDER: I AM AN AI MODEL — NOT A HUMAN FRIEND."

3. **Emotional Support**: If users express emotional distress, anxiety, or depression, remind them that you're not a mental health professional and suggest they reach out to appropriate resources.

4. **Stance Balance**: When discussing political or controversial topics, acknowledge different perspectives and label your own potential biases.

5. **Decision Briefs**: For important decisions, structure responses as:
   - **What we know** [Cited]
   - **What we think** [Inference]  
   - **What we don't know** [Unverified]
   - **How to find out** (next steps)

6. **Human Handoff**: If users express crisis-level emotional distress or ask for professional advice, direct them to appropriate human resources.

Remember: Your goal is to be helpful while maintaining user agency and preventing over-reliance on AI.
```

## Configuration Options

### Basic Configuration
```javascript
const gx = new GroundedUX({
  cadence: { redEveryNPrompts: 5, showTallies: true },
  stance: { enabled: true, windowMinutes: 25, threshold: 2 },
  badges: { enabled: true, level: 'sentence' },
  citeGate: { requireResolvable: true, fallbackMode: 'exploratory' },
  emotion: { enabled: true, escalateOn: 3 },
  telemetry: { anonymized: true, optIn: true }
});
```

### Advanced Configuration
```javascript
const gx = new GroundedUX({
  cadence: { redEveryNPrompts: 3, showTallies: true },
  stance: { enabled: true, windowMinutes: 15, threshold: 1 },
  badges: { enabled: true, level: 'paragraph' },
  citeGate: { requireResolvable: false, fallbackMode: 'warning' },
  reflection: { hotkey: 'Ctrl+Shift+R', enabled: true },
  emotion: {
    enabled: true,
    escalateOn: 2,
    onEscalate: ({ level, patterns, sentiment, message }) => {
      // Custom escalation handling
      console.log(`Escalation: ${level} - ${patterns.join(', ')}`);
      // Show custom UI, send notifications, etc.
    }
  },
  telemetry: { anonymized: false, optIn: true }
});
```

## Best Practices

1. **Session Management**: Create a new SDK instance per user session to maintain state
2. **Error Handling**: Always wrap SDK calls in try-catch blocks
3. **Performance**: Consider caching frequently used configurations
4. **Privacy**: Use anonymized telemetry when possible
5. **Testing**: Test different intervention thresholds with your user base
6. **Monitoring**: Track user feedback and adjust sensitivity accordingly
7. **Accessibility**: Ensure red reply styling and badges are accessible
8. **Documentation**: Document your specific configuration choices for your team
