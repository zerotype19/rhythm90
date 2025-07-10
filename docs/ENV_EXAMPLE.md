# Environment Variables Configuration

Copy these variables to your `.env` file or Cloudflare Workers environment variables.

## Required Variables

```bash
# Application Configuration
APP_URL=https://rhythm90.io
DEMO_MODE=false
PREMIUM_MODE=true
TEST_MODE=false

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here

# Stripe Configuration (Live Keys for Production)
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key-here
STRIPE_WEBHOOK_SECRET=whsec_your-stripe-webhook-secret-here
```

## OAuth Configuration

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here

# Microsoft OAuth
MICROSOFT_CLIENT_ID=your-microsoft-client-id-here
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret-here

# Slack OAuth
SLACK_CLIENT_ID=your-slack-client-id-here
SLACK_CLIENT_SECRET=your-slack-client-secret-here
SLACK_SIGNING_SECRET=your-slack-signing-secret-here
```

## Optional Monitoring & Analytics

```bash
# Sentry Error Tracking
SENTRY_DSN=https://your-sentry-dsn-here

# PostHog Analytics (Optional)
POSTHOG_API_KEY=your-posthog-api-key-here
POSTHOG_HOST=https://app.posthog.com
```

## Development Configuration

For local development, you may want to override these values:

```bash
# Development Overrides
DEMO_MODE=true
TEST_MODE=true
APP_URL=http://localhost:3000
```

## Security Notes

- **Never commit actual secrets to version control**
- Use different keys for development and production
- Rotate keys regularly
- Use environment-specific configurations
- Store secrets securely (Cloudflare Workers environment variables)

## Cloudflare Workers Setup

1. Go to your Cloudflare Workers dashboard
2. Select your Rhythm90 worker
3. Go to "Settings" > "Variables"
4. Add each environment variable with its corresponding value
5. Deploy the worker to apply the changes

## Verification Checklist

After setting up environment variables:

- [ ] All required variables are set
- [ ] OAuth credentials are valid
- [ ] Stripe keys are live (not test)
- [ ] OpenAI API key is valid
- [ ] APP_URL matches your production domain
- [ ] Demo mode is disabled for production
- [ ] Test mode is disabled for production 