# ALMA - Vercel Deployment Guide

## Quick Deploy to Vercel

### Option 1: Deploy from GitHub (Recommended)

1. **Push to GitHub** (already done)
   - Repository: `https://github.com/Evode-Manirahari/humane-tech-framework`
   - Branch: `main`
   - Path: `examples/grounded-ux-sdk`

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import repository: `Evode-Manirahari/humane-tech-framework`
   - Set Root Directory: `examples/grounded-ux-sdk`
   - Deploy!

### Option 2: Deploy with Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to project
cd examples/grounded-ux-sdk

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: alma-reality-anchored-conversations
# - Directory: ./
# - Override settings? No
```

### Option 3: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Evode-Manirahari/humane-tech-framework&root-directory=examples/grounded-ux-sdk)

## Features Included

✅ **All 5 Requested Features Implemented:**

1. **Oreo Cookie Psychology** - Red reply every 5 prompts with "MOMENT OF REFLECTION"
2. **Tally System** - Visual prompt counting with session length indicators
3. **Stance Counter-Balance** - 25-minute window analysis with opposing perspective bubbles
4. **Reflection Prompts** - "What do we know vs what did we assume" questions
5. **Human Support Escalation** - Email/messages/therapist options for emotional crises

## Project Structure

```
grounded-ux-sdk/
├── web-ui/
│   └── index.html          # Main ALMA interface
├── src/                    # TypeScript SDK
├── examples/              # Integration examples
├── package.json           # Dependencies
├── vercel.json           # Vercel configuration
└── README.md             # Documentation
```

## Environment Variables

No environment variables needed - ALMA runs entirely client-side.

## Custom Domain

After deployment, you can:
1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records

## Local Development

```bash
# Install dependencies
npm install

# Run locally
npm run dev

# Or just open the HTML file
open web-ui/index.html
```

## Testing Features

1. **Red Reply Test**: Send 5 messages → see red "MOMENT OF REFLECTION"
2. **Tally Test**: Watch tally marks grow with each prompt
3. **Stance Test**: Send political messages → see stance score change
4. **Opposing Glance Test**: Continue political conversation for 25+ minutes → see opposing perspective
5. **Reflection Test**: Send 10 messages → see reflection prompt
6. **Human Support Test**: Use emotional language → see human support options

## Configuration

Use the sidebar controls to adjust:
- Red Reply Frequency (3, 5, or 7 prompts)
- Stance Threshold (1, 2, or 3)
- Emotional Sensitivity (1, 2, or 3)

## Browser Support

- Chrome/Edge/Safari (modern versions)
- Firefox (modern versions)
- Mobile browsers (responsive design)

## Performance

- Client-side only (no server required)
- Fast loading (< 1 second)
- Responsive design
- Works offline after initial load

## Security

- No data collection
- No external API calls
- Privacy-first design
- Client-side processing only

## Support

For issues or questions:
- GitHub Issues: [humane-tech-framework](https://github.com/Evode-Manirahari/humane-tech-framework/issues)
- Documentation: See README.md in the repository

## License

Apache License 2.0 - See LICENSE file for details.
