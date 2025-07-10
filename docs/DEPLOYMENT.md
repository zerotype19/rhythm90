# Deployment Checklist

## Environment Variables

### Required Variables
- `OPENAI_API_KEY` - OpenAI API key for AI features
- `STRIPE_SECRET_KEY` - Stripe secret key for payment processing
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signature verification secret
- `APP_URL` - Application URL (e.g., https://rhythm90.io)

### Optional Variables
- `DEMO_MODE` - Set to "true" to enable demo mode (staging only)
- `PREMIUM_MODE` - Set to "true" to enable premium features

## Staging Environment

### Configuration
1. **Environment Variables**
   ```bash
   OPENAI_API_KEY=sk-...
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   APP_URL=https://staging.rhythm90.io
   DEMO_MODE=true
   PREMIUM_MODE=true
   ```

2. **Database Setup**
   - Run all migrations (0001-0013)
   - Create demo admin user: `admin-staging@example.com` / `demo1234`

3. **Stripe Configuration**
   - Use Stripe test mode
   - Configure webhook endpoint: `https://staging.rhythm90.io/stripe-webhook`
   - Set webhook events: `checkout.session.completed`, `customer.subscription.deleted`

4. **Feature Flags**
   - Enable demo mode
   - Enable premium features
   - Enable analytics tracking

### Deployment Steps
1. Deploy to Cloudflare Workers
2. Configure custom domain
3. Set up DNS records
4. Test all features in demo mode

## Production Environment

### Configuration
1. **Environment Variables**
   ```bash
   OPENAI_API_KEY=sk-...
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   APP_URL=https://rhythm90.io
   DEMO_MODE=false
   PREMIUM_MODE=true
   ```

2. **Database Setup**
   - Run all migrations (0001-0013)
   - Create production admin user: `admin@example.com` / `demo1234`
   - Set up proper user authentication

3. **Stripe Configuration**
   - Use Stripe live mode
   - Configure webhook endpoint: `https://rhythm90.io/stripe-webhook`
   - Set webhook events: `checkout.session.completed`, `customer.subscription.deleted`
   - Test webhook signature verification

4. **Security**
   - Enable HTTPS only
   - Set up proper CORS headers
   - Configure rate limiting
   - Enable webhook signature verification

### Deployment Steps
1. Deploy to Cloudflare Workers
2. Configure custom domain
3. Set up SSL certificate
4. Configure CDN and caching
5. Set up monitoring and logging
6. Test all premium features

## Feature Verification

### Core Features
- [ ] User authentication (Google/Microsoft OAuth)
- [ ] Team management and invites
- [ ] Marketing plays creation and management
- [ ] Signal logging and tracking
- [ ] R&R summaries
- [ ] Dashboard analytics

### Premium Features
- [ ] Advanced analytics dashboard
- [ ] Unlimited plays and signals
- [ ] AI assistant features (/ai-signal, /ai-hypothesis)
- [ ] Premium content access
- [ ] Billing management

### Admin Features
- [ ] Team overview and management
- [ ] Invitation management (view, cancel)
- [ ] Feature flag controls
- [ ] Webhook event logs
- [ ] User role management

### Billing Integration
- [ ] Stripe checkout session creation
- [ ] Webhook event processing
- [ ] Customer and subscription management
- [ ] Premium status updates
- [ ] Billing status tracking

## Monitoring and Analytics

### Key Metrics
- User signups and activations
- Premium conversions
- Feature usage (plays, signals, AI)
- Webhook processing success rate
- Error rates and performance

### Tools
- Cloudflare Analytics
- Stripe Dashboard
- Custom analytics events
- Error tracking and logging

## Security Checklist

- [ ] Environment variables secured
- [ ] Stripe webhook signature verification
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] HTTPS enforced
- [ ] Admin access restricted
- [ ] Database queries parameterized
- [ ] Input validation implemented

## Rollback Plan

1. **Database Rollback**
   - Keep migration backups
   - Document rollback procedures

2. **Code Rollback**
   - Use Git tags for releases
   - Maintain deployment history

3. **Configuration Rollback**
   - Backup environment variables
   - Document configuration changes

## Support and Maintenance

### Regular Tasks
- Monitor webhook processing
- Review Stripe dashboard
- Check error logs
- Update dependencies
- Backup database

### Emergency Contacts
- Development team
- Stripe support
- Cloudflare support
- Domain registrar

## Post-Launch

1. **Beta Announcement**
   - Prepare marketing materials
   - Set up waitlist capture
   - Configure analytics tracking

2. **User Onboarding**
   - Create help documentation
   - Set up support channels
   - Monitor user feedback

3. **Performance Optimization**
   - Monitor load times
   - Optimize database queries
   - Implement caching strategies 