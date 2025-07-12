# Monitoring Setup Guide

## Overview

This guide covers setting up monitoring and analytics for Rhythm90, including error tracking, performance monitoring, and user analytics.

## 1. Sentry Error Tracking

### Setup

1. **Create Sentry Account**
   - Go to [sentry.io](https://sentry.io)
   - Create a new account or sign in
   - Create a new project for Rhythm90

2. **Get DSN**
   - In your Sentry project, go to Settings > Projects > [Your Project] > Client Keys (DSN)
   - Copy the DSN value

3. **Environment Variables**
   ```bash
   SENTRY_DSN=https://your-dsn@sentry.io/project-id
   ```

4. **Backend Integration**
   - Sentry is already configured in the backend
   - Errors are automatically captured and sent to Sentry
   - Performance monitoring is enabled for API endpoints

5. **Frontend Integration** (Optional)
   ```bash
   npm install @sentry/react @sentry/tracing
   ```

   Add to your main.tsx:
   ```typescript
   import * as Sentry from "@sentry/react";
   import { BrowserTracing } from "@sentry/tracing";

   Sentry.init({
     dsn: import.meta.env.VITE_SENTRY_DSN,
     integrations: [new BrowserTracing()],
     tracesSampleRate: 1.0,
   });
   ```

### Dashboard Setup

1. **Error Alerts**
   - Go to Alerts in Sentry
   - Create alerts for:
     - Error rate > 5% in 5 minutes
     - New errors
     - Performance degradation

2. **Performance Monitoring**
   - View transaction traces
   - Monitor API response times
   - Track user experience metrics

## 2. PostHog Analytics

### Setup

1. **Create PostHog Account**
   - Go to [posthog.com](https://posthog.com)
   - Create a new account
   - Create a new project for Rhythm90

2. **Get API Key**
   - In your PostHog project, go to Settings > Project API Keys
   - Copy the API key

3. **Environment Variables**
   ```bash
   VITE_POSTHOG_API_KEY=your-posthog-api-key
   VITE_POSTHOG_HOST=https://app.posthog.com
   ```

4. **Frontend Integration**
   ```bash
   npm install posthog-js
   ```

   Add to your main.tsx:
   ```typescript
   import posthog from 'posthog-js'

   posthog.init(import.meta.env.VITE_POSTHOG_API_KEY, {
     api_host: import.meta.env.VITE_POSTHOG_HOST,
     capture_pageview: true,
     capture_pageleave: true,
     autocapture: true
   })
   ```

### Dashboard Setup

1. **User Analytics**
   - Track user signups and conversions
   - Monitor feature usage
   - Analyze user retention

2. **Funnel Analysis**
   - Create funnels for onboarding
   - Track premium upgrade conversion
   - Monitor API usage patterns

3. **Cohort Analysis**
   - Track user retention by signup date
   - Analyze premium user behavior
   - Monitor team engagement

## 3. Plausible Analytics (Alternative)

### Setup

1. **Create Plausible Account**
   - Go to [plausible.io](https://plausible.io)
   - Create a new account
   - Add your domain

2. **Get Script**
   - In your Plausible dashboard, go to Settings > Website
   - Copy the tracking script

3. **Frontend Integration**
   Add to your index.html:
   ```html
   <script defer data-domain="rhythm90.io" src="https://plausible.io/js/script.js"></script>
   ```

### Dashboard Setup

1. **Traffic Overview**
   - Monitor page views and visitors
   - Track referrers and search terms
   - Analyze device and browser usage

2. **Goal Tracking**
   - Set up goals for signups
   - Track premium conversions
   - Monitor API usage

## 4. System Health Monitoring

### Built-in Health Checks

The system includes built-in health monitoring at `/api/system/health`:

- **Database Status**: Connection and basic metrics
- **Stripe API**: Payment processing status
- **Webhooks**: Pending webhook count
- **Active Users**: 24-hour user activity

### Admin Dashboard

The admin dashboard includes a System Health tab with:

- Real-time status indicators
- Detailed health check results
- Refresh capability
- Historical data (when available)

## 5. Alerting Setup

### Sentry Alerts

1. **Error Rate Alerts**
   - Alert when error rate exceeds 5% in 5 minutes
   - Alert on new error types
   - Alert on performance degradation

2. **Notification Channels**
   - Email notifications
   - Slack integration
   - PagerDuty (for critical issues)

### Custom Alerts

1. **System Health Alerts**
   - Database connection failures
   - Stripe API issues
   - High webhook failure rates

2. **Business Metrics Alerts**
   - Low user signup rates
   - High churn rates
   - Payment processing issues

## 6. Performance Monitoring

### Backend Performance

- API response time monitoring
- Database query performance
- Memory and CPU usage
- Error rate tracking

### Frontend Performance

- Page load times
- User interaction metrics
- Error tracking
- Performance budgets

## 7. Logging Strategy

### Structured Logging

All logs should include:
- Timestamp
- Log level
- User ID (when applicable)
- Request ID
- Context information

### Log Retention

- Application logs: 30 days
- Error logs: 90 days
- Performance logs: 90 days
- Audit logs: 1 year

## 8. Monitoring Best Practices

### Key Metrics to Track

1. **Technical Metrics**
   - Error rates
   - Response times
   - Uptime
   - Database performance

2. **Business Metrics**
   - User signups
   - Premium conversions
   - API usage
   - Team engagement

3. **User Experience Metrics**
   - Page load times
   - Feature adoption
   - User satisfaction
   - Support ticket volume

### Alert Thresholds

- **Critical**: Immediate response required
- **Warning**: Monitor closely, respond within 1 hour
- **Info**: Track trends, respond within 4 hours

### Response Procedures

1. **Immediate Actions**
   - Acknowledge the alert
   - Assess impact
   - Implement temporary fixes if needed

2. **Investigation**
   - Review logs and metrics
   - Identify root cause
   - Implement permanent fix

3. **Communication**
   - Update stakeholders
   - Document incident
   - Plan prevention measures

## 9. Cost Optimization

### Monitoring Costs

- **Sentry**: Free tier available, paid for advanced features
- **PostHog**: Free tier available, paid for advanced analytics
- **Plausible**: Paid service, privacy-focused alternative

### Optimization Tips

- Use sampling for high-volume events
- Set appropriate retention periods
- Monitor usage and adjust as needed
- Consider self-hosted alternatives for cost control

## 10. Security Considerations

### Data Privacy

- Ensure compliance with GDPR/CCPA
- Minimize PII in logs and analytics
- Use data anonymization where possible
- Implement proper access controls

### Access Management

- Limit access to monitoring tools
- Use role-based access control
- Regularly review access permissions
- Implement audit logging for monitoring access

---

**Last Updated**: [Current Date]
**Version**: 1.0 