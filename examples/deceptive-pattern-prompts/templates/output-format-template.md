# Standardized Output Format Template

## Basic Output Structure

```
[DEPARTMENT] DECEPTIVE PATTERN AUDIT RESULTS
Generated: [DATE]
Codebase: [CODEBASE_NAME]
Auditor: [AUDITOR_NAME]

SUMMARY
Total patterns found: [NUMBER]
High risk issues: [NUMBER]
Medium risk issues: [NUMBER]
Low risk issues: [NUMBER]

Risk Distribution:
- Critical: [NUMBER] ([PERCENTAGE]%)
- High: [NUMBER] ([PERCENTAGE]%)
- Medium: [NUMBER] ([PERCENTAGE]%)
- Low: [NUMBER] ([PERCENTAGE]%)

Pattern Categories Found:
- [PATTERN_TYPE]: [NUMBER] instances
- [PATTERN_TYPE]: [NUMBER] instances
- [PATTERN_TYPE]: [NUMBER] instances

DETAILED FINDINGS

[PATTERN_TYPE] - [RISK_LEVEL]
Location: [FILE_PATH:LINE_NUMBER]
Description: [WHAT_THE_CODE_DOES]
User Impact: [HOW_IT_AFFECTS_USERS]
Code Snippet:
```[LANGUAGE]
[PROBLEMATIC_CODE]
```
Recommended Fix: [SPECIFIC_SOLUTION]
Compliance Impact: [RELEVANT_REGULATIONS]
Priority: [HIGH/MEDIUM/LOW]

[Repeat for each finding]

RECOMMENDATIONS

Priority Actions:
1. [ACTION_1] - [TIMELINE]
2. [ACTION_2] - [TIMELINE]
3. [ACTION_3] - [TIMELINE]

Compliance Considerations:
- [REGULATION_1]: [REQUIREMENT]
- [REGULATION_2]: [REQUIREMENT]
- [REGULATION_3]: [REQUIREMENT]

User Experience Improvements:
- [IMPROVEMENT_1]
- [IMPROVEMENT_2]
- [IMPROVEMENT_3]

Technical Debt:
- [TECHNICAL_ISSUE_1]
- [TECHNICAL_ISSUE_2]
- [TECHNICAL_ISSUE_3]

Follow-up Actions:
- [FOLLOW_UP_1]
- [FOLLOW_UP_2]
- [FOLLOW_UP_3]
```

## Detailed Finding Format

### Required Fields
- **Pattern Type**: The specific deceptive pattern category
- **Risk Level**: Critical/High/Medium/Low
- **Location**: File path and line number
- **Description**: What the code does
- **User Impact**: How it affects users
- **Code Snippet**: The problematic code
- **Recommended Fix**: Specific solution
- **Compliance Impact**: Relevant regulations
- **Priority**: High/Medium/Low for implementation

### Optional Fields
- **Severity Score**: 1-10 scale
- **Affected Users**: Percentage or number of users affected
- **Business Impact**: Financial or operational impact
- **Technical Complexity**: Easy/Medium/Hard to fix
- **Testing Required**: What testing is needed after fix

## Risk Level Definitions

### Critical
- Violates major regulations (GDPR, CCPA, ADA)
- Causes immediate financial harm to users
- Creates significant security vulnerabilities
- Results in legal liability

### High
- Violates user expectations significantly
- May cause financial harm
- Creates accessibility barriers
- Could result in regulatory action

### Medium
- Violates user expectations moderately
- May cause minor inconvenience
- Creates usability issues
- Could affect user trust

### Low
- Minor violations of best practices
- Minimal user impact
- Cosmetic or minor issues
- Easy to fix

## Compliance Mapping

### GDPR (General Data Protection Regulation)
- Article 7: Conditions for consent
- Article 17: Right to erasure
- Article 21: Right to object
- Article 25: Data protection by design

### CCPA (California Consumer Privacy Act)
- Section 1798.100: Right to know
- Section 1798.105: Right to deletion
- Section 1798.120: Right to opt-out
- Section 1798.135: Opt-out mechanisms

### WCAG 2.1 (Web Content Accessibility Guidelines)
- 1.4.3: Contrast (Minimum)
- 1.4.4: Resize text
- 2.1.1: Keyboard
- 2.4.3: Focus order

### FTC Guidelines
- Clear and conspicuous disclosure
- No deceptive practices
- Honest advertising
- Fair billing practices

## Usage Instructions

1. Replace all bracketed text with actual values
2. Use consistent formatting throughout
3. Include all required fields for each finding
4. Add optional fields as relevant
5. Map findings to specific regulations
6. Provide actionable recommendations
7. Include timeline estimates for fixes

## Customization Options

### For Different Industries
- **E-commerce**: Add shopping cart, pricing, checkout patterns
- **SaaS**: Add subscription, billing, account management patterns
- **Healthcare**: Add HIPAA, medical consent patterns
- **Financial**: Add banking, investment, payment patterns

### For Different Audiences
- **Developers**: Focus on technical implementation details
- **Managers**: Focus on business impact and timelines
- **Legal**: Focus on compliance and regulatory requirements
- **Designers**: Focus on user experience and interface issues 