# Deceptive Pattern Detection Prompts Library

A collection of prompts designed to help AI coding assistants systematically detect deceptive patterns (dark patterns) in software applications.

## Purpose

This library provides structured prompts that can be used with AI coding assistants (like Claude, GPT-4, etc.) to audit codebases for potentially manipulative or deceptive user interface patterns. These prompts help identify technical implementations that could violate user expectations, manipulate decision-making, or make it difficult for users to understand or control their interactions.

## Structure

```
deceptive-pattern-prompts/
├── README.md                           # This file
├── prompts/                            # Individual prompt files
│   ├── codebase-audit-prompt.md       # Comprehensive codebase audit
│   ├── ecommerce-patterns-prompt.md   # E-commerce specific patterns
│   ├── subscription-patterns-prompt.md # Subscription/billing patterns
│   └── accessibility-patterns-prompt.md # Accessibility-related patterns
├── templates/                          # Reusable prompt templates
│   ├── pattern-detection-template.md   # Base template for new prompts
│   └── output-format-template.md       # Standardized output formats
└── examples/                           # Example audit results
    └── sample-audit-report.md          # Sample output from a prompt
```

## How to Use

1. **Choose a prompt** from the `prompts/` directory based on your needs
2. **Copy the prompt** and paste it into your AI coding assistant
3. **Provide your codebase** or specific files for analysis
4. **Review the results** and implement recommended fixes

## Available Prompts

### 1. Codebase Deceptive Pattern Audit Prompt
**File:** `prompts/codebase-audit-prompt.md`
**Purpose:** Comprehensive audit covering all major deceptive pattern categories
**Best for:** Initial codebase reviews, compliance audits, ethical design assessments

### 2. E-commerce Deceptive Patterns Prompt
**File:** `prompts/ecommerce-patterns-prompt.md`
**Purpose:** Focused on shopping cart, pricing, and checkout patterns
**Best for:** E-commerce applications, online stores, payment flows

### 3. Subscription Pattern Detection Prompt
**File:** `prompts/subscription-patterns-prompt.md`
**Purpose:** Specialized for subscription and billing-related patterns
**Best for:** SaaS applications, subscription services, recurring billing

### 4. Accessibility Deceptive Patterns Prompt
**File:** `prompts/accessibility-patterns-prompt.md`
**Purpose:** Focuses on visual interference and accessibility violations
**Best for:** Accessibility compliance, inclusive design reviews

## Pattern Categories Covered

- **Preselection Patterns**: Pre-selected options that benefit the company
- **Sneaking Patterns**: Hidden charges or actions without explicit consent
- **Hidden Subscription Patterns**: Billing without clear subscription workflows
- **Visual Interference Patterns**: Poor contrast, hidden text, small fonts
- **Hard to Cancel Patterns**: Complex cancellation processes
- **Fake Urgency/Scarcity**: Artificial time pressure or limited availability
- **Fake Social Proof**: Fake reviews, testimonials, or user activity
- **Forced Action Patterns**: Bundled required/optional actions

## Contributing

To add a new prompt:

1. Create a new `.md` file in the `prompts/` directory
2. Use the template in `templates/pattern-detection-template.md`
3. Follow the naming convention: `[category]-patterns-prompt.md`
4. Update this README with the new prompt information

## Legal and Ethical Considerations

These prompts are designed to help identify patterns that may:
- Violate consumer protection laws
- Breach privacy regulations (GDPR, CCPA)
- Violate accessibility standards (WCAG)
- Create unfair user experiences

Always consult with legal and compliance experts when implementing fixes for identified patterns.

## Related Resources

- [Deceptive.design](https://www.deceptive.design/) - Database of dark patterns
- [Dark Patterns Hall of Shame](https://darkpatterns.org/) - Examples of deceptive patterns
- [FTC Guidelines on Dark Patterns](https://www.ftc.gov/news-events/news/press-releases/2022/10/ftc-report-shows-rise-sophisticated-dark-patterns-designed-trick-trap-consumers)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) - Accessibility standards

## License

This library is provided for educational and ethical auditing purposes. Use responsibly and in accordance with applicable laws and regulations. 