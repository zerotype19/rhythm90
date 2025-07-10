# Rhythm90.io

Your team's digital toolbox to run smarter marketing quarters.

## Project Overview

Rhythm90.io is a monorepo application built with:
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Cloudflare Workers API
- **Database**: Cloudflare D1 (SQLite)
- **Deployment**: Automated via GitHub → Cloudflare Pages + Workers

## 🚀 Beta Launch

Rhythm90.io is now in **Beta**! 

### Quick Start for Beta Users

1. **Access the Beta**: 
   - **Production**: https://rhythm90.io
   - **Staging**: https://staging.rhythm90.io
2. **Demo Mode**: Click "Try Demo Mode" on the landing page for instant exploration
3. **Admin Access**: Use demo account `admin@example.com` / `demo1234`
4. **Admin Panel**: Navigate to `/admin` for feature toggles and team management
5. **Send Invites**: Use `/admin/invite` to invite new beta users

### Demo Mode Features

- **Instant Access**: No account creation required
- **Sample Data**: Pre-loaded with demo team, plays, and signals
- **Safe Exploration**: Destructive actions are disabled
- **Full Functionality**: Experience all features without risk

### Slack/Teams Integration

Connect your Slack or Teams workspace to use these commands:

```
/log-signal | playId | observation | meaning | action
/new-play | name | outcome
```

Example:
```
/log-signal | play-123 | Website traffic increased 25% | Users responding to new landing page | Double down on landing page optimization
/new-play | Q1 Content Blitz | Increase organic traffic by 40%
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Cloudflare account
- OpenAI API key (for AI features)

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/zerotype19/rhythm90.git
   cd rhythm90
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env.local` and configure:
   ```bash
   cp .env.example .env.local
   ```
   
   Update the values in `.env.local`:
   ```
   VITE_API_URL=https://your-worker-url.workers.dev
   DEMO_MODE=true  # Enable demo mode for testing
   ```

4. **Configure Cloudflare Workers**
   
   Update `wrangler.toml` with your OpenAI API key:
   ```toml
   [vars]
   OPENAI_API_KEY = "your_actual_openai_api_key_here"
   APP_URL = "https://rhythm90.io"
   DEMO_MODE = "true"  # Enable demo mode
   ```

### Development

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Deploy to Cloudflare**
   ```bash
   npm run deploy
   ```

## Project Structure

```
rhythm90/
├── src/
│   ├── frontend/          # React frontend application
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── contexts/      # React contexts
│   │   ├── utils/         # Utility functions and API calls
│   │   └── lib/           # Library utilities
│   └── backend/           # Cloudflare Worker API
├── migrations/            # Database migrations
├── docs/                  # Documentation
├── dist/                  # Build output
├── wrangler.toml          # Cloudflare Workers configuration
└── package.json           # Project dependencies
```

## Features

### Core Features
- **Team Management**: Add/remove team members with role-based access
- **Marketing Plays**: Create and manage marketing strategies
- **Signal Tracking**: Log and analyze marketing signals
- **R&R Summaries**: Retrospective and review documentation
- **Account Creation**: Invite-based user onboarding

### Admin Features
- **Feature Flags**: Toggle features on/off in real-time
- **Beta Invitations**: Send and manage user invitations
- **Team Overview**: View all teams and member counts
- **Admin Access Control**: Role-based permissions
- **Analytics Tracking**: Monitor user engagement and events

### Demo Mode
- **Instant Access**: No registration required
- **Sample Data**: Pre-configured demo content
- **Safe Environment**: No destructive actions allowed
- **Full Experience**: All features available for exploration

### Integrations
- **AI Integration**: OpenAI-powered insights and recommendations
- **Slack/Teams**: Real-time command processing
- **Notifications**: Real-time system notifications
- **Dark Mode**: Toggle between light and dark themes
- **OAuth Login**: Google and Microsoft authentication

### System Features
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Live notifications and data sync
- **Type Safety**: Full TypeScript coverage
- **Modern UI**: shadcn/ui components with animations
- **Analytics**: Anonymous event tracking and insights

## API Endpoints

### Core Endpoints
- `GET /health` - Health check
- `GET /board` - Get marketing plays
- `POST /board` - Create new play
- `GET /signals` - Get marketing signals
- `POST /signals` - Log new signal
- `GET /rnr-summary` - Get R&R summary
- `POST /rnr-summary` - Create R&R summary

### Authentication Endpoints
- `POST /auth/google` - Google OAuth login
- `POST /auth/microsoft` - Microsoft OAuth login
- `POST /auth/demo` - Demo mode login
- `GET /demo/check` - Check demo mode status

### AI Endpoints
- `POST /ai-signal` - Get AI recommendation for signal
- `POST /ai-hypothesis` - Generate AI hypothesis for play

### Admin Endpoints
- `GET /admin/check` - Check admin status
- `GET /admin/teams` - Get all teams with count
- `GET /feature-flags` - Get feature flags
- `POST /feature-flags` - Update feature flag
- `POST /invite` - Send beta invitation
- `GET /accept-invite` - Validate invitation token
- `POST /accept-invite` - Accept invitation and create account

### Integration Endpoints
- `POST /slack-hook` - Process Slack/Teams commands
- `GET /notifications` - Get real-time notifications
- `GET /dashboard-stats` - Get dashboard statistics
- `POST /analytics` - Track analytics events
- `POST /waitlist` - Join waitlist

## Database Schema

### Core Tables
- `users` - User accounts with roles
- `teams` - Team information
- `team_users` - Team membership
- `plays` - Marketing plays
- `signals` - Marketing signals
- `rnr_summaries` - Retrospective summaries

### System Tables
- `notifications` - System notifications
- `feature_flags` - Feature toggle flags
- `invites` - Beta invitation tokens
- `waitlist` - Waitlist signups
- `analytics_events` - User engagement tracking

## Beta Testing

### Key Features to Test
1. **Demo Mode**: Try the instant demo experience
2. **Account Creation**: Test the invite flow
3. **OAuth Login**: Test Google/Microsoft login
4. **Admin Panel**: Explore feature flags and team management
5. **Analytics**: Check that events are being tracked
6. **Mobile Experience**: Test on various devices

### Known Limitations
- Demo mode disables destructive actions for safety
- Analytics events are anonymous (no user identification)
- Some features may be limited in demo mode

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

---

**Beta Version**: 1.0  
**Last Updated**: December 2024  
**Status**: Active Beta Development
