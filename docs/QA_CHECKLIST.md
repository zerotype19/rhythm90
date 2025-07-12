# QA Checklist for Rhythm90

## Critical User Journey Testing

### 1. Authentication Flow
- [ ] **Login Flow**
  - [ ] Valid credentials login
  - [ ] Invalid credentials error handling
  - [ ] Password reset flow
  - [ ] Remember me functionality (if implemented)
  - [ ] Session persistence across browser refresh

- [ ] **Signup Flow**
  - [ ] New user registration
  - [ ] Email validation
  - [ ] Duplicate email handling
  - [ ] Password strength requirements
  - [ ] Welcome email delivery

### 2. Onboarding Flow
- [ ] **Complete Onboarding (with skip)**
  - [ ] Welcome modal appears for new users
  - [ ] Profile completion (avatar, role)
  - [ ] Team joining via invite code
  - [ ] First play creation
  - [ ] First signal logging
  - [ ] Onboarding completion flag set

- [ ] **Complete Onboarding (without skip)**
  - [ ] All onboarding steps required
  - [ ] Cannot access main features until complete
  - [ ] Progress tracking works correctly

- [ ] **Skip Onboarding**
  - [ ] Skip button functionality
  - [ ] Can access main features after skip
  - [ ] Can return to onboarding later

### 3. Team Management
- [ ] **Join Team**
  - [ ] Valid invite code acceptance
  - [ ] Invalid invite code handling
  - [ ] Multi-team support
  - [ ] Team switching functionality

- [ ] **Create Team**
  - [ ] Team creation flow
  - [ ] Team name validation
  - [ ] Admin role assignment
  - [ ] Team settings access

### 4. Core App Features
- [ ] **Create Play**
  - [ ] Play creation modal
  - [ ] Required field validation
  - [ ] Play saving and retrieval
  - [ ] Play editing functionality

- [ ] **Log Signal**
  - [ ] Signal logging modal
  - [ ] Signal categorization
  - [ ] Signal history viewing
  - [ ] Signal analytics

### 5. Admin Dashboard
- [ ] **View Functionality**
  - [ ] Users list with pagination
  - [ ] Teams list with details
  - [ ] Plays overview
  - [ ] Signals overview
  - [ ] Analytics dashboard

- [ ] **Bulk Actions**
  - [ ] User status toggles
  - [ ] Team management actions
  - [ ] Bulk delete operations
  - [ ] Export functionality

### 6. Premium Features
- [ ] **Stripe Integration**
  - [ ] Premium upgrade flow
  - [ ] Payment processing
  - [ ] Webhook handling
  - [ ] Subscription management
  - [ ] Invoice generation

- [ ] **Premium Feature Access**
  - [ ] AI Assistant access control
  - [ ] Advanced analytics access
  - [ ] Premium guard functionality
  - [ ] Downgrade handling

### 7. Developer Portal
- [ ] **API Key Management**
  - [ ] API key generation
  - [ ] Key permissions/scopes
  - [ ] Key revocation
  - [ ] Usage tracking

- [ ] **Rate Limit UX**
  - [ ] Rate limit indicators
  - [ ] Rate limit error handling
  - [ ] Usage quota display
  - [ ] Upgrade prompts

## Manual Test Scripts

### Test Environment Setup
```bash
# Local testing (optional)
npm run dev
# Test against local database

# Remote/Staging testing (recommended)
# Deploy to staging environment
# Test against staging database
```

### Critical Path Test Scenarios

#### Scenario 1: New User Journey
1. Open app in incognito mode
2. Sign up with new email
3. Complete onboarding flow
4. Create first play
5. Log first signal
6. Verify onboarding completion

#### Scenario 2: Premium Upgrade
1. Login as regular user
2. Navigate to premium feature
3. Click upgrade button
4. Complete Stripe checkout
5. Verify premium access
6. Check webhook processing

#### Scenario 3: Admin Operations
1. Login as admin user
2. Access admin dashboard
3. View user list
4. Perform bulk action
5. Check analytics
6. Verify changes persist

#### Scenario 4: API Usage
1. Generate API key
2. Make API request
3. Check usage tracking
4. Hit rate limit
5. Verify rate limit UX
6. Revoke API key

## Automated Testing

### Playwright Test Files
- `tests/e2e/auth.spec.ts` - Authentication flows
- `tests/e2e/onboarding.spec.ts` - Onboarding scenarios
- `tests/e2e/premium.spec.ts` - Premium upgrade flows
- `tests/e2e/admin.spec.ts` - Admin dashboard operations
- `tests/e2e/api.spec.ts` - Developer portal functionality

### Running Tests
```bash
# Run all Playwright tests
npx playwright test

# Run specific test file
npx playwright test auth.spec.ts

# Run tests in headed mode
npx playwright test --headed

# Generate test report
npx playwright show-report
```

## Bug Reporting Template

### Critical Issues
- **Severity**: Critical/High/Medium/Low
- **Environment**: Browser/OS/Version
- **Steps to Reproduce**: 
- **Expected Behavior**:
- **Actual Behavior**:
- **Screenshots/Logs**:
- **Additional Context**:

### Performance Issues
- **Page Load Time**: 
- **Memory Usage**:
- **Network Requests**:
- **User Impact**:

## QA Sign-off Checklist

- [ ] All critical user journeys tested
- [ ] No critical bugs found
- [ ] Performance acceptable
- [ ] Mobile responsiveness verified
- [ ] Dark mode functionality confirmed
- [ ] Admin features working correctly
- [ ] Premium features properly gated
- [ ] API functionality tested
- [ ] Security measures verified
- [ ] Documentation updated

## Known Issues Tracking

### Current Issues
- [ ] List any known bugs or limitations
- [ ] Performance bottlenecks
- [ ] UX edge cases
- [ ] Unfinished features

### Future Improvements
- [ ] Additional test coverage needed
- [ ] Performance optimizations
- [ ] UX enhancements
- [ ] Feature completions 