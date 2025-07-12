# Sentry Setup Guide

This document outlines the Sentry integration for error tracking and performance monitoring in Rhythm90.

## Overview

Sentry provides:
- **Error Tracking**: Automatic capture of JavaScript errors and exceptions
- **Performance Monitoring**: Track page load times and API call performance
- **Session Replay**: Record user sessions to debug issues
- **User Context**: Associate errors with specific users and their actions

## Configuration

### Environment Variables

Add the following to your `.env` file:

```bash
# Sentry Configuration
VITE_SENTRY_DSN=your_sentry_dsn_here
VITE_APP_VERSION=1.0.0
```

### Frontend Integration

The Sentry integration is configured in `src/frontend/main.tsx`:

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  environment: import.meta.env.MODE,
  release: import.meta.env.VITE_APP_VERSION || '1.0.0',
});
```

### User Context

User context is automatically set in `src/frontend/hooks/useAuth.ts`:

```typescript
// Set user context when user logs in
if ((window as any).setSentryUser) {
  (window as any).setSentryUser(userData.user);
}

// Clear user context when user logs out
if ((window as any).setSentryUser) {
  (window as any).setSentryUser(null);
}
```

## Testing

### Error Testing

1. Navigate to the Admin Dashboard (`/admin`)
2. Go to the "System Health" tab
3. Click "Test Sentry Error" button
4. Check your Sentry dashboard for the error

### Performance Testing

1. Navigate to the Admin Dashboard (`/admin`)
2. Go to the "System Health" tab
3. Click "Test Sentry Performance" button
4. Check your Sentry dashboard for the performance transaction

### Manual Error Reporting

You can manually report errors in your code:

```typescript
import * as Sentry from "@sentry/react";

try {
  // Your code here
} catch (error) {
  Sentry.captureException(error);
}

// Or capture messages
Sentry.captureMessage("Something went wrong", "error");
```

## Alert Configuration

### Error Rate Alerts

Set up alerts in Sentry for:
- **High Error Rate**: Alert when error rate exceeds 5% in 5 minutes
- **Critical Errors**: Alert immediately for 500-level errors
- **Performance Degradation**: Alert when page load times increase by 50%

### Alert Channels

Configure alerts to send to:
- **Slack**: Real-time notifications to your team channel
- **Email**: Daily/weekly error summaries
- **PagerDuty**: For critical production issues

## Best Practices

### Error Handling

1. **Don't capture expected errors**: Only capture unexpected exceptions
2. **Add context**: Include relevant user and request information
3. **Group similar errors**: Use consistent error messages for grouping

### Performance Monitoring

1. **Track key user actions**: Monitor critical user flows
2. **Set performance budgets**: Alert when metrics exceed thresholds
3. **Monitor API calls**: Track backend response times

### Privacy Considerations

1. **Mask sensitive data**: Configure data scrubbing rules
2. **Respect user privacy**: Don't capture PII without consent
3. **Session replay settings**: Configure what gets recorded

## Troubleshooting

### Common Issues

1. **DSN not configured**: Ensure `VITE_SENTRY_DSN` is set
2. **No errors appearing**: Check network connectivity and DSN validity
3. **Performance data missing**: Verify `tracesSampleRate` is > 0

### Debug Mode

Enable debug mode for troubleshooting:

```typescript
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  debug: true, // Enable debug mode
  // ... other config
});
```

## Monitoring Dashboard

### Key Metrics to Track

1. **Error Rate**: Percentage of sessions with errors
2. **Performance**: Page load times and API response times
3. **User Impact**: Number of users affected by issues
4. **Resolution Time**: Time from error to fix deployment

### Regular Reviews

- **Daily**: Check for new critical errors
- **Weekly**: Review error trends and performance metrics
- **Monthly**: Analyze user impact and optimization opportunities

## Integration with Other Tools

### Slack Integration

Configure Sentry to post to Slack:
- Error alerts with stack traces
- Performance degradation notifications
- Release deployment confirmations

### GitHub Integration

Link Sentry issues to GitHub:
- Automatic issue creation for new errors
- Commit tracking for releases
- Pull request integration for fixes

## Security Considerations

1. **DSN Security**: Keep your DSN private and rotate if compromised
2. **Data Retention**: Configure appropriate data retention policies
3. **Access Control**: Limit Sentry dashboard access to authorized team members
4. **Compliance**: Ensure Sentry usage complies with your data protection requirements

## Support

For Sentry-specific issues:
- [Sentry Documentation](https://docs.sentry.io/)
- [Sentry Community](https://forum.sentry.io/)
- [Sentry Support](https://sentry.io/support/)

For Rhythm90-specific Sentry integration:
- Check this documentation
- Review the code in `src/frontend/main.tsx`
- Contact the development team 