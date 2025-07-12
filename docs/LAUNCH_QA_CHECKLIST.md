# Launch QA Checklist

This document contains manual testing steps and setup instructions for launching Rhythm90.

## 🚀 Pre-Launch Setup

### Environment Configuration
- [ ] Run environment validation: `node scripts/validate-env.js`
- [ ] Verify all required environment variables are set
- [ ] Test Stripe webhook endpoint with test events
- [ ] Verify database migrations are applied
- [ ] Check API rate limiting configuration

### Admin Account Setup
- [ ] Create admin user account
- [ ] Verify admin dashboard access
- [ ] Test admin bulk actions
- [ ] Verify webhook monitoring access
- [ ] Test system status endpoint

## 🧪 Manual Testing Checklist

### 1. User Authentication & Onboarding
- [ ] **User Registration**
  - [ ] New user can register with email
  - [ ] Email verification works (if enabled)
  - [ ] User can complete onboarding flow
  - [ ] User can skip onboarding

- [ ] **User Login**
  - [ ] Existing user can log in
  - [ ] Password reset flow works
  - [ ] Session persistence works
  - [ ] Logout clears session

- [ ] **Team Management**
  - [ ] User can create a new team
  - [ ] User can invite team members
  - [ ] Invite acceptance flow works
  - [ ] Team member roles work correctly

### 2. Core Features

- [ ] **Plays Management**
  - [ ] User can create a new play
  - [ ] Play can be edited and updated
  - [ ] Play can be archived/unarchived
  - [ ] Play list shows correct data
  - [ ] Play search/filter works

- [ ] **Signals Management**
  - [ ] User can create a new signal
  - [ ] Signal is associated with correct play
  - [ ] Signal can be edited
  - [ ] Signal list shows correct data
  - [ ] Signal search/filter works

- [ ] **AI Assistant**
  - [ ] AI hypothesis generation works
  - [ ] AI signal interpretation works
  - [ ] Premium guard blocks non-premium users
  - [ ] AI responses are relevant and helpful

### 3. Premium Features

- [ ] **Stripe Integration**
  - [ ] Upgrade modal appears for non-premium users
  - [ ] Stripe checkout session creates successfully
  - [ ] Monthly subscription ($29) works
  - [ ] Yearly subscription ($290) works
  - [ ] Payment success redirects correctly
  - [ ] Payment failure handled gracefully

- [ ] **Subscription Management**
  - [ ] Customer portal link works
  - [ ] Subscription cancellation works
  - [ ] Subscription reactivation works
  - [ ] Webhook events update user status correctly

- [ ] **Premium Feature Access**
  - [ ] Advanced analytics are blocked for free users
  - [ ] AI Assistant is blocked for free users
  - [ ] Premium features unlock after payment
  - [ ] Features lock after subscription cancellation

### 4. Analytics & Reporting

- [ ] **Basic Analytics**
  - [ ] Analytics page loads for all users
  - [ ] Team-specific data shows correctly
  - [ ] Global analytics show for admins
  - [ ] Data is accurate and up-to-date

- [ ] **Advanced Analytics (Premium)**
  - [ ] Interactive charts load correctly
  - [ ] Time-series data displays properly
  - [ ] Chart interactions work (zoom, hover, etc.)
  - [ ] Data exports work (if implemented)

### 5. Developer Portal

- [ ] **API Key Management**
  - [ ] User can generate new API key
  - [ ] API key is displayed securely (one-time)
  - [ ] API key can be revoked
  - [ ] API key list shows correct data
  - [ ] Usage metrics display correctly

- [ ] **API Usage**
  - [ ] API requests work with valid key
  - [ ] Rate limiting works correctly
  - [ ] Invalid key returns 401
  - [ ] Rate limit exceeded returns 429
  - [ ] Usage tracking updates in real-time

### 6. Admin Features

- [ ] **Admin Dashboard**
  - [ ] Admin can access dashboard
  - [ ] User management works
  - [ ] Team management works
  - [ ] Play management works
  - [ ] Signal management works

- [ ] **Bulk Actions**
  - [ ] Bulk user activation/deactivation
  - [ ] Bulk team activation/deactivation
  - [ ] Bulk play archive/unarchive
  - [ ] Bulk signal deletion

- [ ] **Webhook Monitoring**
  - [ ] Webhook logs display correctly
  - [ ] Webhook statistics show accurate data
  - [ ] Failed webhooks are visible
  - [ ] Retry counts are accurate

- [ ] **System Status**
  - [ ] System status endpoint works
  - [ ] Database health check passes
  - [ ] Stripe API health check passes
  - [ ] User/team counts are accurate

### 7. Mobile Responsiveness

- [ ] **Mobile Navigation**
  - [ ] Navigation works on mobile
  - [ ] Sidebar collapses properly
  - [ ] Touch interactions work

- [ ] **Mobile Forms**
  - [ ] Forms are usable on mobile
  - [ ] Input fields are properly sized
  - [ ] Buttons are touch-friendly

- [ ] **Mobile Tables**
  - [ ] Tables are scrollable
  - [ ] Data is readable on small screens
  - [ ] Actions are accessible

### 8. Error Handling

- [ ] **Network Errors**
  - [ ] Offline state handled gracefully
  - [ ] API errors show user-friendly messages
  - [ ] Retry mechanisms work

- [ ] **Validation Errors**
  - [ ] Form validation works
  - [ ] Error messages are clear
  - [ ] Required fields are marked

- [ ] **Permission Errors**
  - [ ] Unauthorized access blocked
  - [ ] Permission denied messages clear
  - [ ] Redirects work correctly

## 🔧 Admin Setup Instructions

### Creating Admin User

1. **Database Method (Recommended)**
   ```sql
   UPDATE users 
   SET role = 'admin', is_active = TRUE 
   WHERE email = 'admin@yourdomain.com';
   ```

2. **API Method**
   ```bash
   curl -X POST /api/admin/users/promote \
     -H "Content-Type: application/json" \
     -d '{"email": "admin@yourdomain.com"}'
   ```

### Admin Credentials
- **Email**: admin@yourdomain.com
- **Password**: [Set during registration]
- **Role**: admin
- **Permissions**: Full system access

### Admin Dashboard Access
- URL: `/admin`
- Required: Admin role
- Features: User management, team management, analytics, webhook monitoring

## 🚨 Critical Launch Checks

### Security
- [ ] All API endpoints require authentication
- [ ] Admin endpoints require admin role
- [ ] Stripe webhook signature verification enabled
- [ ] API keys are properly hashed
- [ ] Rate limiting is active

### Performance
- [ ] Page load times under 3 seconds
- [ ] API response times under 500ms
- [ ] Database queries optimized
- [ ] Analytics queries cached
- [ ] Images and assets optimized

### Monitoring
- [ ] Error logging configured
- [ ] Performance monitoring active
- [ ] Webhook delivery monitoring
- [ ] System health checks
- [ ] Alert system configured

## 📋 Post-Launch Checklist

### Immediate (First 24 hours)
- [ ] Monitor error logs
- [ ] Check webhook delivery rates
- [ ] Verify user registrations
- [ ] Monitor Stripe payment success rates
- [ ] Check system performance

### First Week
- [ ] Review user feedback
- [ ] Monitor analytics usage
- [ ] Check API usage patterns
- [ ] Verify backup systems
- [ ] Update documentation

### First Month
- [ ] Performance review
- [ ] Security audit
- [ ] User satisfaction survey
- [ ] Feature usage analysis
- [ ] Plan next iteration

## 🆘 Troubleshooting

### Common Issues

**Stripe Webhook Failures**
- Check webhook endpoint URL
- Verify signature verification
- Check webhook secret configuration
- Monitor webhook delivery logs

**API Rate Limiting Issues**
- Verify rate limit configuration
- Check API usage logs
- Monitor for abuse patterns
- Adjust limits if needed

**Database Performance**
- Check query execution times
- Verify indexes are created
- Monitor connection pool
- Review slow query logs

**User Authentication Issues**
- Check session configuration
- Verify cookie settings
- Test password reset flow
- Check email delivery

## 📞 Support Contacts

- **Technical Issues**: [Your email]
- **Stripe Support**: [Stripe support URL]
- **Hosting Support**: [Cloudflare support]
- **Emergency Contact**: [Phone number]

---

**Last Updated**: [Date]
**Version**: 1.0
**Next Review**: [Date] 