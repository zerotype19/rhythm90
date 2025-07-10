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

1. **Access the Beta**: Visit [Your Cloudflare Pages URL]
2. **Admin Access**: Use demo account `admin@example.com` / `demo1234`
3. **Admin Panel**: Navigate to `/admin` for feature toggles and team management
4. **Send Invites**: Use `/admin/invite` to invite new beta users

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
   git clone https://github.com/your-username/rhythm90.git
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
   ```

4. **Configure Cloudflare Workers**
   
   Update `wrangler.toml` with your OpenAI API key:
   ```toml
   [vars]
   OPENAI_API_KEY = "your_actual_openai_api_key_here"
   APP_URL = "https://rhythm90.io"
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

### Admin Features
- **Feature Flags**: Toggle features on/off in real-time
- **Beta Invitations**: Send and manage user invitations
- **Team Overview**: View all teams and member counts
- **Admin Access Control**: Role-based permissions

### Integrations
- **AI Integration**: OpenAI-powered insights and recommendations
- **Slack/Teams**: Real-time command processing
- **Notifications**: Real-time system notifications
- **Dark Mode**: Toggle between light and dark themes

### System Features
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Live notifications and data sync
- **Type Safety**: Full TypeScript coverage
- **Modern UI**: shadcn/ui components with animations

## API Endpoints

### Core Endpoints
- `GET /health` - Health check
- `GET /board` - Get marketing plays
- `POST /board` - Create new play
- `GET /signals` - Get marketing signals
- `POST /signals` - Log new signal
- `GET /rnr-summary` - Get R&R summary
- `POST /rnr-summary` - Create R&R summary

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
- `POST /accept-invite` - Accept invitation

### Integration Endpoints
- `POST /slack-hook` - Process Slack/Teams commands
- `GET /notifications` - Get real-time notifications
- `GET /dashboard-stats` - Get dashboard statistics

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
**Last Updated**: [Current Date]  
**Status**: Active Beta Development
