# OAuth Setup Guide

This guide covers setting up OAuth integrations for Google, Microsoft, and Slack in Rhythm90.

## Google OAuth Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable the Google+ API and Google OAuth2 API

### 2. Create OAuth 2.0 Credentials

1. Navigate to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application" as application type
4. Add authorized redirect URIs:
   - `https://rhythm90.io/auth/callback/google`
   - `http://localhost:3000/auth/callback/google` (for development)
5. Copy the Client ID and Client Secret

### 3. Environment Variables

Add to your environment:
```bash
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

### 4. Required Scopes

- `openid` - OpenID Connect
- `email` - User's email address
- `profile` - User's basic profile info

## Microsoft OAuth Setup

### 1. Create Azure App Registration

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to "Azure Active Directory" > "App registrations"
3. Click "New registration"
4. Enter app name: "Rhythm90"
5. Select "Accounts in any organizational directory and personal Microsoft accounts"
6. Set redirect URI: `https://rhythm90.io/auth/callback/microsoft`

### 2. Configure Permissions

1. Go to "API permissions"
2. Add Microsoft Graph permissions:
   - `User.Read` (delegated)
   - `User.ReadBasic.All` (delegated)
3. Grant admin consent

### 3. Get Credentials

1. Go to "Certificates & secrets"
2. Create a new client secret
3. Copy the Application (client) ID and client secret

### 4. Environment Variables

Add to your environment:
```bash
MICROSOFT_CLIENT_ID=your_client_id_here
MICROSOFT_CLIENT_SECRET=your_client_secret_here
```

### 5. Required Scopes

- `openid` - OpenID Connect
- `email` - User's email address
- `profile` - User's basic profile info

## Slack OAuth Setup

### 1. Create Slack App

1. Go to [Slack API](https://api.slack.com/apps)
2. Click "Create New App" > "From scratch"
3. Enter app name: "Rhythm90"
4. Select your workspace

### 2. Configure OAuth & Permissions

1. Go to "OAuth & Permissions"
2. Add redirect URLs:
   - `https://rhythm90.io/auth/callback/slack`
   - `http://localhost:3000/auth/callback/slack` (for development)

### 3. Configure Scopes

#### For User Authentication:
- `identity.basic` - View basic user info
- `identity.email` - View user's email address
- `identity.avatar` - View user's avatar

#### For Workspace Integration (optional):
- `channels:read` - View basic channel info
- `chat:write` - Send messages as the app
- `users:read` - View basic user info

### 4. Install App

1. Go to "Install App" in the sidebar
2. Click "Install to Workspace"
3. Copy the Bot User OAuth Token and Client Secret

### 5. Environment Variables

Add to your environment:
```bash
SLACK_CLIENT_ID=your_client_id_here
SLACK_CLIENT_SECRET=your_client_secret_here
SLACK_SIGNING_SECRET=your_signing_secret_here
```

## Testing OAuth Flows

### Development Testing

1. Use localhost redirect URIs for development
2. Test each provider's login flow
3. Verify user data is stored correctly
4. Check token refresh functionality

### Production Deployment

1. Update redirect URIs to production domain
2. Test OAuth flows in production
3. Monitor error logs for OAuth issues
4. Set up proper error handling

## Security Considerations

1. **Client Secrets**: Never commit client secrets to version control
2. **HTTPS**: Always use HTTPS in production
3. **State Parameter**: OAuth state is automatically generated for security
4. **Token Storage**: Access tokens are encrypted and stored securely
5. **Rate Limiting**: Implement rate limiting on OAuth endpoints

## Troubleshooting

### Common Issues

1. **Invalid Redirect URI**: Ensure redirect URIs match exactly
2. **Missing Scopes**: Verify all required scopes are configured
3. **CORS Issues**: Check CORS configuration for OAuth callbacks
4. **Token Expiry**: Implement proper token refresh logic

### Error Handling

The OAuth endpoints return appropriate error responses:
- `401` - Invalid credentials
- `400` - Missing required parameters
- `500` - Server errors

## Database Schema

OAuth provider data is stored in the `oauth_providers` table:

```sql
CREATE TABLE oauth_providers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    provider TEXT NOT NULL,
    provider_user_id TEXT NOT NULL,
    email TEXT,
    name TEXT,
    avatar TEXT,
    access_token TEXT,
    refresh_token TEXT,
    expires_at INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### OAuth Login Redirects
- `GET /auth/login/google` - Redirect to Google OAuth
- `GET /auth/login/microsoft` - Redirect to Microsoft OAuth
- `GET /auth/login/slack` - Redirect to Slack OAuth

### OAuth Callbacks
- `GET /auth/callback/google` - Handle Google OAuth callback
- `GET /auth/callback/microsoft` - Handle Microsoft OAuth callback
- `GET /auth/callback/slack` - Handle Slack OAuth callback 