# Rhythm90 Beta Launch Checklist

## 🚀 Pre-Launch Setup

### Environment Variables
- [ ] `STRIPE_SECRET_KEY` - Live Stripe secret key
- [ ] `STRIPE_WEBHOOK_SECRET` - Live webhook secret
- [ ] `APP_URL` - Production domain (e.g., https://rhythm90.io)
- [ ] `OPENAI_API_KEY` - OpenAI API key for AI features
- [ ] `DEMO_MODE` - Set to "false" for production
- [ ] `PREMIUM_MODE` - Set to "true" for premium features

**Test Scenarios:**
- [ ] Test Stripe API connectivity with live keys
- [ ] Test webhook endpoint with live secret
- [ ] Verify OpenAI API responses
- [ ] Confirm demo mode is disabled
- [ ] Verify premium features are enabled

### Database Migrations
- [ ] Run migration `0014_create_admin_actions.sql` for audit logging
- [ ] Verify all previous migrations are applied
- [ ] Check database schema integrity

**Test Scenarios:**
- [ ] Verify admin_actions table exists and has correct indexes
- [ ] Test admin action logging functionality
- [ ] Confirm all existing data is preserved

### Cloudflare Worker Deployment
- [ ] Deploy to production environment
- [ ] Verify all API endpoints are accessible
- [ ] Test CORS configuration
- [ ] Check error handling and logging

**Test Scenarios:**
- [ ] Test all API endpoints with production URLs
- [ ] Verify CORS headers for frontend requests
- [ ] Test error responses and logging
- [ ] Confirm webhook processing works

## 💳 Stripe Integration

### Customer Portal
- [ ] Verify customer portal session creation
- [ ] Test portal access for premium users
- [ ] Test error handling for non-premium users
- [ ] Verify return URL configuration

**Test Scenarios:**
- [ ] Test portal creation for team with stripe_customer_id
- [ ] Test portal creation for team without stripe_customer_id (should show upgrade message)
- [ ] Verify portal return URL redirects to dashboard
- [ ] Test portal session expiration

### Billing Management
- [ ] Test "Manage Billing" button in UserSettings
- [ ] Test "Manage Billing" button in Admin page
- [ ] Verify upgrade flow for non-premium users

**Test Scenarios:**
- [ ] Click "Manage Billing" as premium user → should open Stripe portal
- [ ] Click "Manage Billing" as non-premium user → should redirect to pricing
- [ ] Test billing portal access from different user roles

## 👥 Admin Invite Management

### Resend Invite
- [ ] Test resend functionality for active invites
- [ ] Verify new token generation
- [ ] Test expiration reset to 7 days
- [ ] Verify invite link copying

**Test Scenarios:**
- [ ] Resend invite → verify new token is generated
- [ ] Resend invite → verify expiration is reset to 7 days from now
- [ ] Test copied invite link works for new user
- [ ] Verify old invite link no longer works

### Expire Invite
- [ ] Test expire functionality for active invites
- [ ] Verify soft delete (not removed from DB)
- [ ] Test expired invites appear in separate section
- [ ] Verify audit logging

**Test Scenarios:**
- [ ] Expire invite → verify it moves to expired section
- [ ] Expire invite → verify it's marked as expired in database
- [ ] Test expired invite link no longer works
- [ ] Verify admin action is logged

### Audit Logging
- [ ] Verify admin actions are logged
- [ ] Test different action types (cancel, resend, expire)
- [ ] Verify audit trail completeness

**Test Scenarios:**
- [ ] Cancel invite → check admin_actions table
- [ ] Resend invite → check admin_actions table
- [ ] Expire invite → check admin_actions table
- [ ] Verify all required fields are logged

## 🆘 Help Center

### Search Functionality
- [ ] Test search in questions
- [ ] Test search in answers
- [ ] Test case-insensitive search
- [ ] Test partial match search
- [ ] Test empty search results

**Test Scenarios:**
- [ ] Search "billing" → should find billing-related Q&As
- [ ] Search "SIGNALS" → should find signal-related Q&As (case-insensitive)
- [ ] Search "market" → should find marketing-related Q&As (partial match)
- [ ] Search "xyz123" → should show no results message

### Crisp Chat Widget
- [ ] Verify chat button is visible
- [ ] Test placeholder functionality
- [ ] Verify accessibility

**Test Scenarios:**
- [ ] Click chat button → should show placeholder message
- [ ] Verify chat button is visible on all pages
- [ ] Test chat button hover effects

## 🌐 Marketing Site

### Page Structure
- [ ] Verify `/marketing` route is accessible
- [ ] Test responsive design
- [ ] Verify dark mode support
- [ ] Test navigation links

**Test Scenarios:**
- [ ] Visit /marketing → should load marketing page
- [ ] Test page on mobile devices
- [ ] Toggle dark mode → verify styling
- [ ] Click "Try Demo" → should go to landing page
- [ ] Click "Join Waitlist" → should scroll to CTA section

### Content Sections
- [ ] Verify hero section content
- [ ] Test features section (6 cards)
- [ ] Verify testimonials (4 placeholder testimonials)
- [ ] Test CTA section with waitlist form

**Test Scenarios:**
- [ ] Verify all 6 feature cards are displayed
- [ ] Verify all 4 testimonials are shown
- [ ] Submit waitlist form → should show success message
- [ ] Test waitlist form validation (empty email, invalid email)

### Waitlist Integration
- [ ] Test waitlist form submission
- [ ] Verify email validation
- [ ] Test success/error handling
- [ ] Verify database storage

**Test Scenarios:**
- [ ] Submit valid email → should show success message
- [ ] Submit empty email → should show validation error
- [ ] Submit invalid email → should show validation error
- [ ] Check waitlist table for new entries

## 🔒 Security & Performance

### Authentication
- [ ] Test user authentication flow
- [ ] Verify admin access controls
- [ ] Test premium feature protection
- [ ] Verify session management

**Test Scenarios:**
- [ ] Login as regular user → verify limited access
- [ ] Login as admin → verify admin features
- [ ] Test premium routes without premium access
- [ ] Verify session persistence

### API Security
- [ ] Test CORS configuration
- [ ] Verify rate limiting
- [ ] Test input validation
- [ ] Verify error handling

**Test Scenarios:**
- [ ] Test API calls from unauthorized domains
- [ ] Submit malformed data to API endpoints
- [ ] Test rate limiting with rapid requests
- [ ] Verify sensitive data is not exposed in errors

### Performance
- [ ] Test page load times
- [ ] Verify API response times
- [ ] Test search performance
- [ ] Verify image optimization

**Test Scenarios:**
- [ ] Load marketing page → should load within 3 seconds
- [ ] Search FAQ → should respond within 1 second
- [ ] Load admin page → should load within 2 seconds
- [ ] Test concurrent user access

## 📱 User Experience

### Navigation
- [ ] Test all navigation links
- [ ] Verify breadcrumbs
- [ ] Test mobile navigation
- [ ] Verify accessibility

**Test Scenarios:**
- [ ] Navigate through all main pages
- [ ] Test mobile menu functionality
- [ ] Verify keyboard navigation
- [ ] Test screen reader compatibility

### Forms & Interactions
- [ ] Test all form submissions
- [ ] Verify form validation
- [ ] Test button states (loading, disabled)
- [ ] Verify success/error messages

**Test Scenarios:**
- [ ] Submit forms with valid data
- [ ] Submit forms with invalid data
- [ ] Test loading states during submissions
- [ ] Verify error message clarity

### Responsive Design
- [ ] Test on desktop (1920x1080)
- [ ] Test on tablet (768x1024)
- [ ] Test on mobile (375x667)
- [ ] Verify touch interactions

**Test Scenarios:**
- [ ] Verify layout on different screen sizes
- [ ] Test touch targets on mobile
- [ ] Verify scrolling behavior
- [ ] Test orientation changes

## 🚀 Launch Day

### Final Checks
- [ ] Verify all features are working
- [ ] Test critical user flows
- [ ] Verify analytics tracking
- [ ] Check error monitoring

**Test Scenarios:**
- [ ] Complete end-to-end user journey
- [ ] Test all premium features
- [ ] Verify analytics events are firing
- [ ] Check error logs for issues

### Monitoring
- [ ] Set up uptime monitoring
- [ ] Configure error alerts
- [ ] Set up performance monitoring
- [ ] Verify backup systems

**Test Scenarios:**
- [ ] Simulate downtime → verify alerts
- [ ] Generate errors → verify logging
- [ ] Test performance thresholds
- [ ] Verify backup restoration

### Communication
- [ ] Prepare launch announcement
- [ ] Set up support channels
- [ ] Prepare FAQ updates
- [ ] Plan user onboarding

**Test Scenarios:**
- [ ] Test support email responses
- [ ] Verify help center accessibility
- [ ] Test user onboarding flow
- [ ] Verify communication channels

---

## ✅ Launch Complete

Once all items are checked and tested, Rhythm90 is ready for beta launch!

**Final Launch Steps:**
1. Update DNS to point to production
2. Send launch announcement
3. Monitor system performance
4. Gather user feedback
5. Plan iterative improvements

**Post-Launch Monitoring:**
- Monitor user signups and engagement
- Track feature usage and adoption
- Monitor system performance and errors
- Gather and act on user feedback
- Plan feature updates and improvements 