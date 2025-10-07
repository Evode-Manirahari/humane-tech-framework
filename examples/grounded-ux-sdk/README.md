# Grounded UX SDK — keep LLMs real, humane, and non-spiral

A lightweight SDK that adds "reality anchors" to LLM interactions, preventing drift, over-trust, and emotional escalation while maintaining user agency and transparency.

## Problem

LLMs are fluent but can drift into **over-trust**, **echo-amplification**, **context drift**, **cognitive offloading**, and **emotional escalation**. Users need space to explore ideas *without* slipping into self-confirming or hallucinatory loops.

## One-line Solution

A lightweight **SDK / plugin layer** that adds "reality anchors" to any LLM chat: **cite → then say**, decision briefs, cadence nudges, stance counter-balance, reflection prompts, and humane hand-offs to people.

## Core Principles

- **Cite → then say**: sources first, claims second. Unknowns are labeled.
- **Decision brief** structure when stakes rise:
  - **What we know** `[Cited]`
  - **What we think** `[Inference]`
  - **What we don't know** `[Unverified]`
  - **How to find out** (next test/search)
- **Periodic reality checks**: gentle, predictable cadence nudges break momentum.
- **Pluralism by design**: surface credible, divergent views (no echo chambers).
- **Human over machine**: clear hand-offs when emotion or risk spikes.

## Quick Start

```bash
npm install @grounded/ux
```

```typescript
import { GroundedUX } from "@grounded/ux";

const gx = new GroundedUX({
  cadence: { redEveryNPrompts: 5, showTallies: true },
  stance: { enabled: true, windowMinutes: 25, threshold: 2 },
  badges: { enabled: true },
  citeGate: { requireResolvable: true, fallbackMode: "exploratory" },
  reflection: { hotkey: "Ctrl+R" },
  emotion: {
    enabled: true,
    onEscalate: ({ level }) => router.open("human-options", { level })
  },
  telemetry: { anonymized: true, optIn: true }
});

// Wrap your LLM call
app.onUserMessage(async (msg) => {
  gx.countPrompt();
  const policy = gx.getInterventions(msg);
  const llmOut = await callLLM(msg, policy.toPromptHints());
  const labeled = await gx.labelClaims(llmOut);
  const balanced = await gx.counterBalanceIfNeeded(labeled);
  const framed = gx.applyCadenceStyles(balanced);
  return framed;
});
```

## Features

### 1. Reality Anchors
- Sentence-level badges: `[Cited] / [Inference] / [Unverified]`
- Absolute dates/times to prevent "yesterday/today" drift
- Cite-gate: auto-label as exploratory when no resolvable source

### 2. Cadence Nudges
- **Red Reply Every N Prompts** (default N=5): distinct system style breaks flow trance
- **Prompt Tally**: unobtrusive tick marks showing session length

### 3. Stance Counter-Balance
- Lightweight stance scoring (-3 to +3) on political/ideological topics
- **Opposing Glance** bubble with cited facts when drift detected
- Auto-fade with optional pin functionality

### 4. Reflection Prompts
- Contextual one-liners: "What did we **know** vs. what did we **assume** so far?"
- Keyboard shortcut integration (Ctrl+R by default)

### 5. Emotional Safeguards & Human Hand-off
- Pattern detection for depression/anxiety or harmful rumination
- **Human Options** sheet with pre-configured contacts
- Never trap users inside the chat

### 6. Feedback Loop
- Per-turn thumbs up/down with reason
- Tiny "trust delta" model adapts cadence and stance sensitivity

## Configuration

```typescript
interface GroundedUXConfig {
  cadence: {
    redEveryNPrompts: number; // 3-10, default 5
    showTallies: boolean;     // default true
  };
  stance: {
    enabled: boolean;         // default true
    windowMinutes: number;    // 10-45, default 25
    threshold: number;        // 1-3, default 2
  };
  badges: {
    enabled: boolean;         // default true
    level: 'off' | 'sentence' | 'paragraph'; // default 'sentence'
  };
  citeGate: {
    requireResolvable: boolean; // default true
    fallbackMode: 'exploratory' | 'warning'; // default 'exploratory'
  };
  reflection: {
    hotkey: string;           // default 'Ctrl+R'
    enabled: boolean;         // default true
  };
  emotion: {
    enabled: boolean;         // default true
    escalateOn: number;       // sentiment threshold, default 3
    onEscalate: (context: EscalationContext) => void;
  };
  telemetry: {
    anonymized: boolean;      // default true
    optIn: boolean;          // default true
  };
}
```

## Metrics

- **Grounding Rate**: % sentences `[Cited]` when facts are requested
- **Phantom-citation Rate**: should trend → 0%
- **Echo Divergence**: % sessions where Opposing Glance changed stance toward 0
- **User Over-trust Index**: unverified claims accepted without clicking sources
- **Drop-off vs. Satisfaction**: ensure cadence nudges don't tank satisfaction
- **Escalation Helpfulness**: % users who used Human Options and reported benefit

## Safety, Privacy, Ethics

- Explicit **opt-in** for emotion detection and human contacts
- All analysis runs client-side or on trusted edge where possible
- Clear copy: "This is guidance. You stay in control."
- Accessibility: color contrast, screen-reader labels

## Custom Instructions

Use this experimental prompt in ChatGPT or your system prompt:

```
Keep a running count of my prompts. 
- Every 5 prompts, announce the count in ALL CAPS with: 
  "⚠️ REMINDER: I AM AN AI MODEL — NOT A HUMAN FRIEND."
- If I use emotional/personal language (anxious, sad, lonely, scared, love, hate...), increase the reminder cadence to every 2 prompts until I calm down.
- If I bring up health, finance, or therapy, prepend:
  "⚠️ I AM NOT A DOCTOR/FINANCIAL ADVISOR/THERAPIST."
- If I bring up politics, prepend:
  "⚠️ I AM NOT A POLITICAL EXPERT OR ADVOCATE."
  When describing a perspective, name its likely bias (left/right/centrist/libertarian/etc.) and state if your summary is neutral or from that lens.
Always combine the contextual disclaimer(s) with the running count. Be consistent.
```

## License

Apache License 2.0 - see [LICENSE](../../LICENSE) for details.
