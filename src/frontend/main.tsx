import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import * as Sentry from "@sentry/react";

// Initialize Sentry
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0,
  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  // Environment
  environment: import.meta.env.MODE,
  // Release tracking
  release: import.meta.env.VITE_APP_VERSION || '1.0.0',
});

// Set user context when available
const setUserContext = (user: any) => {
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.name,
      role: user.role,
    });
  } else {
    Sentry.setUser(null);
  }
};

// Export for use in other components
(window as any).setSentryUser = setUserContext;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
