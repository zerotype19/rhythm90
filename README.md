# Rhythm90.io

A marketing signals platform that helps teams track, analyze, and act on marketing insights.

## Features

### Core Features
- **Marketing Plays**: Create and manage marketing strategies
- **Signal Tracking**: Log observations, meanings, and actions
- **R&R Summaries**: Weekly retrospectives and planning
- **Team Collaboration**: Multi-user support with roles
- **AI Integration**: OpenAI-powered insights and recommendations

### Premium Features
- **Advanced Analytics**: Deep insights into marketing performance
- **Unlimited Plays**: Create as many plays as you need
- **AI Assistant**: Advanced AI-powered insights and recommendations
- **Priority Support**: Dedicated customer support

### Admin Features
- **Team Management**: Invite and manage team members
- **Feature Flags**: Toggle features on/off
- **Beta Invitations**: Manage beta access
- **Analytics Dashboard**: Track user engagement

### Demo Mode
- **Sample Data**: Pre-populated with demo plays and signals
- **Safe Testing**: All destructive actions are disabled
- **Demo Badge**: Clear indication when in demo mode

## Tech Stack

- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Backend**: Cloudflare Workers + D1 Database
- **AI**: OpenAI GPT-4
- **Styling**: shadcn/ui components with dark mode
- **Deployment**: Cloudflare Pages + Workers

## Development

### Prerequisites
- Node.js 18+
- npm
- Cloudflare account with D1 database

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/rhythm90.git
   cd rhythm90
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Configure your `.env` file:
   ```env
   VITE_API_URL=http://localhost:8787
   ```

4. **Set up Cloudflare D1 database**
   ```bash
   # Create D1 database
   npx wrangler d1 create rhythm90-db
   
   # Apply migrations
   npx wrangler d1 execute rhythm90-db --file=./migrations/0001_create_tables.sql
   npx wrangler d1 execute rhythm90-db --file=./migrations/0002_create_feature_flags.sql
   npx wrangler d1 execute rhythm90-db --file=./migrations/0003_create_invites.sql
   npx wrangler d1 execute rhythm90-db --file=./migrations/0004_create_notifications.sql
   npx wrangler d1 execute rhythm90-db --file=./migrations/0005_create_analytics_events.sql
   npx wrangler d1 execute rhythm90-db --file=./migrations/0006_create_waitlist.sql
   npx wrangler d1 execute rhythm90-db --file=./migrations/0007_seed_feature_flags.sql
   npx wrangler d1 execute rhythm90-db --file=./migrations/0008_create_demo_admin.sql
   npx wrangler d1 execute rhythm90-db --file=./migrations/0009_create_password_reset_tokens.sql
   npx wrangler d1 execute rhythm90-db --file=./migrations/0010_add_premium_to_users.sql
   ```

5. **Configure wrangler.toml**
   ```toml
   name = "rhythm90"
   main = "src/backend/index.ts"
   compatibility_date = "2024-01-01"

   [[d1_databases]]
   binding = "DB"
   database_name = "rhythm90-db"
   database_id = "your-database-id"

   [vars]
   OPENAI_API_KEY = "your-openai-api-key"
   APP_URL = "https://rhythm90.io"
   DEMO_MODE = "false"
   PREMIUM_MODE = "true"
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

## Deployment

### Production Deployment

1. **Deploy to Cloudflare Workers**
   ```bash
   npx wrangler deploy
   ```

2. **Deploy frontend to Cloudflare Pages**
   ```bash
   npm run build
   # Upload dist/ folder to Cloudflare Pages
   ```

3. **Configure environment variables in Cloudflare dashboard**
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `APP_URL`: Your production URL
   - `DEMO_MODE`: "false"
   - `PREMIUM_MODE`: "true"

### Staging Deployment

1. **Create staging branch**
   ```bash
   git checkout -b staging
   git push origin staging
   ```

2. **Set up staging environment**
   ```bash
   # Create staging D1 database
   npx wrangler d1 create rhythm90-staging-db
   
   # Apply migrations to staging
   npx wrangler d1 execute rhythm90-staging-db --file=./migrations/0001_create_tables.sql
   # ... apply all migrations
   ```

3. **Configure staging wrangler.toml**
   ```toml
   name = "staging-rhythm90"
   main = "src/backend/index.ts"
   compatibility_date = "2024-01-01"

   [[d1_databases]]
   binding = "DB"
   database_name = "rhythm90-staging-db"
   database_id = "your-staging-database-id"

   [vars]
   OPENAI_API_KEY = "your-openai-api-key"
   APP_URL = "https://staging.rhythm90.io"
   DEMO_MODE = "true"
   PREMIUM_MODE = "true"
   ```

4. **Deploy staging**
   ```bash
   npx wrangler deploy
   ```

5. **Set up staging admin account**
   ```bash
   # Create staging admin user
   npx wrangler d1 execute rhythm90-staging-db --command="
   INSERT INTO users (id, email, name, provider, role, is_premium) 
   VALUES ('admin-staging-123', 'admin-staging@example.com', 'Staging Admin', 'demo', 'admin', true)
   "
   ```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key for AI features | Required |
| `APP_URL` | Base URL for the application | `https://rhythm90.io` |
| `DEMO_MODE` | Enable demo mode with sample data | `false` |
| `PREMIUM_MODE` | Enable premium features | `true` |

## API Endpoints

### Authentication
- `POST /auth/google` - Google OAuth login
- `POST /auth/microsoft` - Microsoft OAuth login
- `POST /auth/demo` - Demo login (when demo mode enabled)

### User Management
- `GET /me` - Get current user profile
- `POST /me` - Update user profile
- `POST /request-password-reset` - Request password reset
- `POST /reset-password` - Reset password with token

### Marketing Plays
- `GET /board` - Get all plays
- `POST /board` - Create new play

### Signals
- `GET /signals` - Get all signals
- `POST /signals` - Create new signal

### Premium Features
- `POST /checkout` - Create checkout session
- `GET /premium-content` - Get premium content (requires premium subscription)

### Admin
- `GET /admin/check` - Check admin status
- `GET /admin/teams` - Get all teams
- `POST /feature-flags` - Update feature flags
- `POST /invite` - Send team invitation

### Analytics
- `POST /analytics` - Track analytics event

## Database Schema

### Core Tables
- `users` - User accounts and profiles
- `teams` - Team information
- `team_users` - User-team relationships
- `plays` - Marketing plays
- `signals` - Marketing signals
- `rnr_summaries` - R&R summaries
- `notifications` - System notifications

### Feature Tables
- `feature_flags` - Feature toggle configuration
- `invites` - Team invitations
- `analytics_events` - User analytics tracking
- `waitlist` - Beta waitlist signups
- `password_reset_tokens` - Password reset tokens

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

- Email: support@rhythm90.io
- Documentation: [docs.rhythm90.io](https://docs.rhythm90.io)
- Issues: [GitHub Issues](https://github.com/yourusername/rhythm90/issues)

## Changelog

### Batch 13 (Latest)
- ✅ User Settings page with profile editing
- ✅ Password reset functionality (scaffolding)
- ✅ Premium features and paywall system
- ✅ Staging environment setup
- ✅ Email templates for password reset
- ✅ Enhanced analytics tracking

### Batch 12
- ✅ Account creation after invite acceptance
- ✅ Demo mode with sample data
- ✅ Analytics with database storage
- ✅ Public landing page with waitlist
- ✅ Beta release packaging

### Previous Batches
- Batches 1-11: Core platform features, admin system, team management, notifications, feature flags, beta invitations, and analytics foundation.

## Roadmap

### Next Features
- Team billing and Stripe integration
- Enhanced team invitation system
- Help center and support chat widget
- Advanced reporting and exports
- Mobile app development
