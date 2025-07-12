/// <reference types="@cloudflare/workers-types" />
// Stripe Node SDK import removed for Worker compatibility

export interface Env {
  DB: D1Database;
  OPENAI_API_KEY: string;
  APP_URL?: string;
  DEMO_MODE?: string;
  PREMIUM_MODE?: string;
  TEST_MODE?: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  SLACK_CLIENT_ID?: string;
  SLACK_CLIENT_SECRET?: string;
  SLACK_SIGNING_SECRET?: string;
  MICROSOFT_CLIENT_ID?: string;
  MICROSOFT_CLIENT_SECRET?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  MICROSOFT_REDIRECT_URI?: string;
  SENTRY_DSN?: string;
}

// Helper function to check if user is admin
async function isAdmin(env: Env, userId: string): Promise<boolean> {
  const user = await env.DB.prepare(`SELECT role FROM users WHERE id = ?`).bind(userId).first();
  return user?.role === 'admin';
}

// Helper function to get current user ID (for now, hardcoded - will be replaced with auth)
function getCurrentUserId(request: Request): string | null {
  // Get user ID from session cookie
  const cookie = request.headers.get('cookie');
  if (!cookie) return null;
  
  const sessionMatch = cookie.match(/session=([^;]+)/);
  if (!sessionMatch) return null;
  
  try {
    // For now, just return the session value as user ID
    // In a real implementation, you'd decode/verify the session
    return sessionMatch[1];
  } catch (error) {
    return null;
  }
}

// Helper function to check if demo mode is enabled
function isDemoMode(env: Env): boolean {
  return env.DEMO_MODE === "true";
}

// Helper function to check if premium mode is enabled
function isPremiumMode(env: Env): boolean {
  return env.PREMIUM_MODE === "true";
}

// Helper function to check if user is premium
async function isUserPremium(env: Env, userId: string): Promise<boolean> {
  const user = await env.DB.prepare(`SELECT is_premium FROM users WHERE id = ?`).bind(userId).first();
  return user?.is_premium === true;
}

// Helper function to check if test mode is enabled
function isTestMode(env: Env): boolean {
  return env.TEST_MODE === "true";
}

// Helper function to authenticate API key
async function authenticateApiKey(env: Env, apiKey: string): Promise<{ teamId: string; scopes: string[] } | null> {
  const key = await env.DB.prepare(`SELECT team_id, scopes, is_active FROM api_keys WHERE key = ? AND is_active = 1`).bind(apiKey).first();
  if (!key) return null;
  
  // Update last used timestamp
  await env.DB.prepare(`UPDATE api_keys SET last_used_at = CURRENT_TIMESTAMP WHERE key = ?`).bind(apiKey).run();
  
  return {
    teamId: key.team_id as string,
    scopes: (key.scopes as string).split(',').map(s => s.trim())
  };
}

// Helper function to check rate limits
async function checkRateLimit(env: Env, teamId: string, endpoint: string): Promise<boolean> {
  const team = await env.DB.prepare(`SELECT rate_limit_hourly, rate_limit_daily FROM teams WHERE id = ?`).bind(teamId).first();
  if (!team) return false;
  
  const hourlyLimit = team.rate_limit_hourly as number || 1000;
  const dailyLimit = team.rate_limit_daily as number || 10000;
  
  // Check hourly rate limit
  const hourlyCount = await env.DB.prepare(`SELECT COUNT(*) as count FROM api_usage WHERE team_id = ? AND endpoint = ? AND created_at > datetime('now', '-1 hour')`).bind(teamId, endpoint).first();
  if (hourlyCount && (hourlyCount.count as number) >= hourlyLimit) return false;
  
  // Check daily rate limit
  const dailyCount = await env.DB.prepare(`SELECT COUNT(*) as count FROM api_usage WHERE team_id = ? AND endpoint = ? AND created_at > datetime('now', '-1 day')`).bind(teamId, endpoint).first();
  if (dailyCount && (dailyCount.count as number) >= dailyLimit) return false;
  
  // Record usage
  await env.DB.prepare(`INSERT INTO api_usage (id, team_id, endpoint, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)`).bind(crypto.randomUUID(), teamId, endpoint).run();
  
  return true;
}

// Helper function to clean up expired password reset tokens
async function cleanupExpiredTokens(env: Env) {
  await env.DB.prepare(`DELETE FROM password_reset_tokens WHERE expires_at < CURRENT_TIMESTAMP`).run();
}

// Helper function to create demo data
async function createDemoData(env: Env) {
  const teamId = "demo-team-123";
  
  // Create demo team
  await env.DB.prepare(`INSERT OR IGNORE INTO teams (id, name, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)`)
    .bind(teamId, "Demo Team")
    .run();

  // Create demo plays
  const plays = [
    { id: "demo-play-1", name: "Increase Engagement", target_outcome: "Boost social media engagement by 25%", why_this_play: "Engagement is dropping across all channels", how_to_run: "Focus on interactive content and community building" },
    { id: "demo-play-2", name: "Boost Conversion", target_outcome: "Improve conversion rate by 15%", why_this_play: "Current conversion funnel has leaks", how_to_run: "Optimize landing pages and reduce friction" }
  ];

  for (const play of plays) {
    await env.DB.prepare(`INSERT OR IGNORE INTO plays (id, team_id, name, target_outcome, why_this_play, how_to_run, signals, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(play.id, teamId, play.name, play.target_outcome, play.why_this_play, play.how_to_run, "", "active")
      .run();
  }

  // Create demo signals
  const signals = [
    { id: "demo-signal-1", play_id: "demo-play-1", observation: "High email open rate", meaning: "Audience is engaged with email content", action: "Double down on email marketing strategy" },
    { id: "demo-signal-2", play_id: "demo-play-2", observation: "Low ad click-through", meaning: "Ad creative needs improvement", action: "A/B test new ad variations" },
    { id: "demo-signal-3", play_id: "demo-play-1", observation: "Positive social mentions", meaning: "Brand sentiment is improving", action: "Amplify positive social content" }
  ];

  for (const signal of signals) {
    await env.DB.prepare(`INSERT OR IGNORE INTO signals (id, play_id, observation, meaning, action) VALUES (?, ?, ?, ?, ?)`)
      .bind(signal.id, signal.play_id, signal.observation, signal.meaning, signal.action)
      .run();
  }
}

// CORS helper function
function addCorsHeaders(response: Response): Response {
  response.headers.set('Access-Control-Allow-Origin', 'https://rhythm90.io');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}

function jsonResponse(data: any, status: number = 200): Response {
  return addCorsHeaders(new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  }));
}

function errorResponse(message: string, status: number = 400): Response {
  return jsonResponse({ success: false, message }, status);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;
    const appUrl = env.APP_URL || "https://rhythm90.io";

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return addCorsHeaders(new Response(null, { status: 200 }));
    }

    if (pathname === "/health") {
      return new Response(JSON.stringify({ status: "ok" }), { headers: { "Content-Type": "application/json" } });
    }

    // Demo mode check route
    if (pathname === "/demo/check" && request.method === "GET") {
      return jsonResponse({ isDemoMode: isDemoMode(env) });
    }

    // Demo login route
    if (pathname === "/auth/demo" && request.method === "POST") {
      if (!isDemoMode(env)) {
        return new Response("Demo mode not enabled", { status: 403 });
      }
      
      const demoUser = { 
        id: "demo-user-123", 
        email: "demo@example.com", 
        name: "Demo User", 
        provider: "demo",
        role: "member",
        is_premium: false
      };
      
      await env.DB.prepare(`INSERT OR IGNORE INTO users (id, email, name, provider, role, is_premium) VALUES (?, ?, ?, ?, ?, ?)`)
        .bind(demoUser.id, demoUser.email, demoUser.name, demoUser.provider, demoUser.role, demoUser.is_premium)
        .run();

      // Create demo data if it doesn't exist
      await createDemoData(env);
      
      return jsonResponse({ success: true, user: demoUser, demo: true });
    }

    // User settings routes
    if (pathname === "/me" && request.method === "GET") {
      try {
        const cookie = request.headers.get('cookie');
        console.log('[BACKEND] /me Cookie header:', cookie);
        const userId = getCurrentUserId(request);
        console.log('[BACKEND] /me Session User:', userId);
        if (!userId) {
          return jsonResponse({ error: "Unauthorized" }, 401);
        }
        // Get user base info
        const user = await env.DB.prepare(`SELECT id, email, name, role FROM users WHERE id = ?`).bind(userId).first();
        console.log('[BACKEND] /me DB User:', user);
        if (!user) {
          return jsonResponse({ error: "Unauthorized" }, 401);
        }
        // Get linked providers and avatars
        const providersRes = await env.DB.prepare(`SELECT provider, avatar FROM oauth_providers WHERE user_id = ?`).bind(userId).all();
        const providers = providersRes.results.map((p: any) => p.provider);
        // Find first non-null avatar
        let avatar = null;
        for (const p of providersRes.results) {
          if (p.avatar) {
            avatar = p.avatar;
            break;
          }
        }
        return jsonResponse({
          id: user.id,
          email: user.email,
          name: user.name,
          avatar,
          role: user.role,
          providers
        });
      } catch (error) {
        console.error("Error in /me endpoint:", error);
        return jsonResponse({ error: "Unauthorized" }, 401);
      }
    }

    if (pathname === "/me" && request.method === "POST") {
      try {
        const userId = getCurrentUserId();
        const body = await request.json() as { name: string };
        
        // Basic name validation
        if (!body.name || body.name.length < 2 || body.name.length > 50) {
          return errorResponse("Name must be between 2 and 50 characters", 400);
        }
        
        // Check for special characters/emojis (basic check)
        const nameRegex = /^[a-zA-Z0-9\s\-\.]+$/;
        if (!nameRegex.test(body.name)) {
          return errorResponse("Name contains invalid characters", 400);
        }
        
        await env.DB.prepare(`UPDATE users SET name = ? WHERE id = ?`).bind(body.name, userId).run();
        return jsonResponse({ success: true });
      } catch (error) {
        console.error("Error in /me POST endpoint:", error);
        return errorResponse("Authentication required", 401);
      }
    }

    // Password reset routes
    if (pathname === "/request-password-reset" && request.method === "POST") {
      const body = await request.json() as { email: string };
      
      // Basic rate limiting (5 requests per hour per email)
      const recentRequests = await env.DB.prepare(`SELECT COUNT(*) as count FROM password_reset_tokens WHERE user_id = (SELECT id FROM users WHERE email = ?) AND created_at > datetime('now', '-1 hour')`).bind(body.email).first();
      
      if (recentRequests && (recentRequests.count as number) >= 5) {
        return Response.json({ success: false, message: "Too many reset requests. Please try again later." }, { status: 429 });
      }
      
      const user = await env.DB.prepare(`SELECT id FROM users WHERE email = ?`).bind(body.email).first();
      if (!user) {
        // Don't reveal if user exists
        return Response.json({ success: true, message: "If an account exists, a reset link has been sent." });
      }
      
      const token = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours
      
      await env.DB.prepare(`INSERT INTO password_reset_tokens (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)`)
        .bind(crypto.randomUUID(), user.id, token, expiresAt)
        .run();
      
      // TODO: Send email with reset link
      console.log(`Password reset link: ${appUrl}/reset-password?token=${token}`);
      
      return Response.json({ success: true, message: "If an account exists, a reset link has been sent." });
    }

    if (pathname === "/reset-password" && request.method === "POST") {
      const body = await request.json() as { token: string; password: string };
      
      // Clean up expired tokens
      await cleanupExpiredTokens(env);
      
      const resetToken = await env.DB.prepare(`SELECT user_id, expires_at FROM password_reset_tokens WHERE token = ?`).bind(body.token).first();
      
      if (!resetToken || new Date(resetToken.expires_at as string) < new Date()) {
        return Response.json({ success: false, message: "Invalid or expired reset token" }, { status: 400 });
      }
      
      // TODO: Hash password before storing
      await env.DB.prepare(`UPDATE users SET password = ? WHERE id = ?`).bind(body.password, resetToken.user_id).run();
      await env.DB.prepare(`DELETE FROM password_reset_tokens WHERE token = ?`).bind(body.token).run();
      
      return Response.json({ success: true, message: "Password updated successfully" });
    }

    // Stripe Integration
    if (pathname === "/create-checkout-session" && request.method === "POST") {
      const userId = getCurrentUserId();
      const body = await request.json() as { plan: string };
      const appUrl = env.APP_URL || "https://rhythm90.io";
      
      try {
        // Get user's team
        const userTeam = await env.DB.prepare(`SELECT team_id FROM team_users WHERE user_id = ?`).bind(userId).first();
        const teamId = userTeam && typeof userTeam.team_id === 'string' ? userTeam.team_id : "default-team";
        
        // Get or create Stripe customer
        let stripeCustomerId: string | undefined;
        const team = await env.DB.prepare(`SELECT stripe_customer_id FROM teams WHERE id = ?`).bind(teamId).first();
        
        if (team && typeof team.stripe_customer_id === 'string' && team.stripe_customer_id.length > 0) {
          stripeCustomerId = team.stripe_customer_id;
        } else {
          const user = await env.DB.prepare(`SELECT email, name FROM users WHERE id = ?`).bind(userId).first();
          const email = user && typeof user.email === 'string' ? user.email : 'user@example.com';
          const name = user && typeof user.name === 'string' ? user.name : 'User';
          // Create customer via Stripe API
          const customerRes = await fetch('https://api.stripe.com/v1/customers', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              email: String(email),
              name: String(name),
              'metadata[team_id]': String(teamId),
              'metadata[user_id]': String(userId)
            })
          });
          const customerData = await customerRes.json() as any;
          if (!customerRes.ok || !customerData.id) throw new Error('Failed to create Stripe customer');
          stripeCustomerId = customerData.id;
          // Update team with Stripe customer ID
          await env.DB.prepare(`UPDATE teams SET stripe_customer_id = ? WHERE id = ?`).bind(stripeCustomerId, teamId).run();
        }

        if (!stripeCustomerId) {
          throw new Error('Stripe customer ID not found or created');
        }

        // Create checkout session via Stripe API
        const sessionRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            customer: String(stripeCustomerId),
            mode: 'subscription',
            success_url: `${appUrl}/dashboard?success=true`,
            cancel_url: `${appUrl}/pricing?canceled=true`,
            'line_items[0][price_data][currency]': 'usd',
            'line_items[0][price_data][product_data][name]': body.plan === 'pro' ? 'Rhythm90 Pro' : 'Rhythm90 Premium',
            'line_items[0][price_data][product_data][description]': body.plan === 'pro' ? 'Professional marketing analytics' : 'Premium marketing suite',
            'line_items[0][price_data][unit_amount]': (body.plan === 'pro' ? 2900 : 4900).toString(),
            'line_items[0][price_data][recurring][interval]': 'month',
            'line_items[0][quantity]': '1',
            'metadata[team_id]': String(teamId),
            'metadata[user_id]': String(userId),
            'metadata[plan]': String(body.plan)
          })
        });
        const sessionData = await sessionRes.json() as any;
        if (!sessionRes.ok || !sessionData.url) throw new Error('Failed to create Stripe checkout session');

        return Response.json({ 
          success: true, 
          checkoutUrl: sessionData.url,
          sessionId: sessionData.id
        });
      } catch (error) {
        console.error('Stripe checkout error:', error);
        return Response.json({ 
          success: false, 
          message: "Failed to create checkout session" 
        }, { status: 500 });
      }
    }

    if (pathname === "/stripe-webhook" && request.method === "POST") {
      try {
        // Read raw body for signature verification
        const body = await request.text();
        const signature = request.headers.get('stripe-signature');
        if (!signature) {
          return new Response('No signature', { status: 400 });
        }
        // TODO: Implement signature verification using crypto.subtle (see Stripe docs)
        // For now, skip verification for dev
        let event: any;
        try {
          event = JSON.parse(body);
        } catch (err) {
          return new Response('Invalid JSON', { status: 400 });
        }
        // Log webhook event
        await env.DB.prepare(`INSERT INTO webhook_logs (id, event_type, payload, status) VALUES (?, ?, ?, ?)`).bind(crypto.randomUUID(), event.type, body, 'processing').run();
        // Handle the event
        switch (event.type) {
          case 'checkout.session.completed': {
            const session = event.data.object;
            const teamId = session.metadata?.team_id;
            const plan = session.metadata?.plan;
            if (teamId) {
              await env.DB.prepare(`UPDATE teams SET billing_status = ? WHERE id = ?`).bind(plan === 'pro' ? 'pro' : 'premium', teamId).run();
              await env.DB.prepare(`UPDATE users SET is_premium = 1 WHERE id IN (SELECT user_id FROM team_users WHERE team_id = ?)`).bind(teamId).run();
            }
            break;
          }
          case 'customer.subscription.deleted': {
            const subscription = event.data.object;
            const customerId = subscription.customer;
            const team = await env.DB.prepare(`SELECT id FROM teams WHERE stripe_customer_id = ?`).bind(customerId).first();
            if (team) {
              await env.DB.prepare(`UPDATE teams SET billing_status = 'free' WHERE id = ?`).bind(team.id).run();
              await env.DB.prepare(`UPDATE users SET is_premium = 0 WHERE id IN (SELECT user_id FROM team_users WHERE team_id = ?)`).bind(team.id).run();
            }
            break;
          }
        }
        await env.DB.prepare(`UPDATE webhook_logs SET status = 'success' WHERE payload = ?`).bind(body).run();
        return new Response('Webhook processed', { status: 200 });
      } catch (error) {
        console.error('Webhook processing error:', error);
        return new Response('Webhook processing failed', { status: 500 });
      }
    }

    if (pathname === "/create-customer-portal-session" && request.method === "POST") {
      const userId = getCurrentUserId();
      const appUrl = env.APP_URL || "https://rhythm90.io";
      
      try {
        // Get user's team
        const userTeam = await env.DB.prepare(`SELECT team_id FROM team_users WHERE user_id = ?`).bind(userId).first();
        const teamId = userTeam && typeof userTeam.team_id === 'string' ? userTeam.team_id : "default-team";
        
        // Check if team has Stripe customer ID
        const team = await env.DB.prepare(`SELECT stripe_customer_id FROM teams WHERE id = ?`).bind(teamId).first();
        
        if (!team || !team.stripe_customer_id) {
          return Response.json({ 
            success: false, 
            message: "⚠️ Billing not set up yet. Please upgrade to access billing management.",
            needsUpgrade: true
          }, { status: 400 });
        }

        // Create customer portal session via Stripe API
        const portalRes = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            customer: String(team.stripe_customer_id),
            return_url: `${appUrl}/dashboard`
          })
        });
        
        const portalData = await portalRes.json() as any;
        if (!portalRes.ok || !portalData.url) {
          throw new Error('Failed to create Stripe customer portal session');
        }

        return Response.json({ 
          success: true, 
          portalUrl: portalData.url
        });
      } catch (error) {
        console.error('Stripe portal error:', error);
        return Response.json({ 
          success: false, 
          message: "Failed to access billing portal" 
        }, { status: 500 });
      }
    }

    // Premium features
    if (pathname === "/checkout" && request.method === "POST") {
      const userId = getCurrentUserId();
      const body = await request.json() as { plan: string };
      
      // Redirect to new checkout endpoint
      return Response.json({ 
        success: true, 
        redirectTo: "/create-checkout-session",
        message: "Redirecting to checkout..." 
      });
    }

    if (pathname === "/premium-content" && request.method === "GET") {
      const userId = getCurrentUserId();
      const isPremium = await isUserPremium(env, userId);
      
      if (!isPremium) {
        return Response.json({ success: false, message: "Premium subscription required" }, { status: 403 });
      }
      
      // Premium content placeholder
      return Response.json({
        success: true,
        content: {
          advancedAnalytics: {
            title: "Advanced Analytics Dashboard",
            description: "Deep insights into your marketing performance",
            data: { conversionRate: "15.2%", engagementScore: "8.7/10", roi: "3.2x" }
          },
          unlimitedPlays: {
            title: "Unlimited Marketing Plays",
            description: "Create as many plays as you need",
            limit: "Unlimited"
          },
          aiAssistant: {
            title: "AI Marketing Assistant",
            description: "Advanced AI-powered insights and recommendations",
            features: ["Predictive analytics", "Automated reporting", "Smart suggestions"]
          }
        }
      });
    }

    // Analytics endpoint
    if (pathname === "/analytics" && request.method === "POST") {
      const body = await request.json() as { event: string; data?: Record<string, any> };
      
      // Store analytics event in database
      await env.DB.prepare(`INSERT INTO analytics_events (id, event, data) VALUES (?, ?, ?)`)
        .bind(crypto.randomUUID(), body.event, JSON.stringify(body.data || {}))
        .run();
      
      console.log("Analytics Event:", body);
      return Response.json({ success: true });
    }

    // Waitlist endpoint
    if (pathname === "/waitlist" && request.method === "POST") {
      const body = await request.json() as { email: string };
      
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        return Response.json({ success: false, message: "Invalid email format" }, { status: 400 });
      }
      
      await env.DB.prepare(`INSERT INTO waitlist (id, email) VALUES (?, ?)`)
        .bind(crypto.randomUUID(), body.email)
        .run();
      
      return Response.json({ success: true });
    }

    // Admin check route
    if (pathname === "/admin/check" && request.method === "GET") {
      const userId = getCurrentUserId(request);
      if (!userId) {
        return jsonResponse({ isAdmin: false });
      }
      const adminStatus = await isAdmin(env, userId);
      return jsonResponse({ isAdmin: adminStatus });
    }

    // Logout route
    if (pathname === "/auth/logout" && request.method === "POST") {
      const response = jsonResponse({ success: true });
      response.headers.set('Set-Cookie', `session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Domain=.rhythm90.io`);
      return response;
    }

    // OAuth login redirects
    if (pathname === "/auth/login/google" && request.method === "GET") {
      const redirectUri = `https://api.rhythm90.io/auth/callback/google`;
      const state = crypto.randomUUID();
      const scope = "openid email profile";
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&state=${state}`;
      
      return Response.redirect(authUrl);
    }

    if (pathname === "/auth/login/microsoft" && request.method === "GET") {
      const redirectUri = env.MICROSOFT_REDIRECT_URI || `https://rhythm90-api.kevin-mcgovern.workers.dev/auth/callback/microsoft`;
      const state = crypto.randomUUID();
      const scope = [
        "https://graph.microsoft.com/User.Read",
        "openid",
        "email",
        "profile"
      ].join(" ");

      const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${env.MICROSOFT_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&state=${state}`;
      return Response.redirect(authUrl);
    }

    if (pathname === "/auth/login/slack" && request.method === "GET") {
      const redirectUri = `${appUrl}/auth/callback/slack`;
      const state = crypto.randomUUID();
      const scope = "identity.basic,identity.email,identity.avatar";
      
      const authUrl = `https://slack.com/oauth/v2/authorize?client_id=${env.SLACK_CLIENT_ID}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
      
      return Response.redirect(authUrl);
    }

    // OAuth callbacks
    if (pathname === "/auth/callback/google" && request.method === "GET") {
      const code = url.searchParams.get("code");
      const state = url.searchParams.get("state");
      if (!code) {
        console.error("Google OAuth callback: No code provided");
        return Response.redirect(`${appUrl}/login?error=no_code`);
      }
      
      // Check if environment variables are set
      if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
        console.error("Google OAuth callback: Missing environment variables", {
          hasClientId: !!env.GOOGLE_CLIENT_ID,
          hasClientSecret: !!env.GOOGLE_CLIENT_SECRET
        });
        return Response.redirect(`${appUrl}/login?error=oauth_config_missing`);
      }
      
      try {
        // Exchange code for tokens
        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: env.GOOGLE_CLIENT_ID!,
            client_secret: env.GOOGLE_CLIENT_SECRET!,
            code,
            grant_type: "authorization_code",
            redirect_uri: `https://api.rhythm90.io/auth/callback/google`
          })
        });
        const tokenData = await tokenResponse.json() as { access_token: string; refresh_token?: string; expires_in: number };
        // Get user info
        const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
          headers: { "Authorization": `Bearer ${tokenData.access_token}` }
        });
        const userData = await userResponse.json() as { id: string; email: string; name: string; picture?: string };
        // Use avatar if available
        const avatar = userData.picture || null;
        // Check if user already exists by email
        let user = await env.DB.prepare(`SELECT id FROM users WHERE email = ?`).bind(userData.email).first();
        let userId: string;
        if (user) {
          userId = user.id;
          // Optionally update name if changed
          await env.DB.prepare(`UPDATE users SET name = ? WHERE id = ?`).bind(userData.name, userId).run();
        } else {
          userId = crypto.randomUUID();
          await env.DB.prepare(`INSERT INTO users (id, email, name, provider, role, is_premium) VALUES (?, ?, ?, ?, ?, ?)`).bind(userId, userData.email, userData.name, "google", "member", false).run();
        }
        // Store OAuth provider data
        await env.DB.prepare(`INSERT OR REPLACE INTO oauth_providers (user_id, provider, provider_user_id, email, name, avatar, access_token, refresh_token, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(userId, "google", userData.id, userData.email, userData.name, avatar, tokenData.access_token, tokenData.refresh_token || null, Date.now() + tokenData.expires_in * 1000).run();
        
        // Set session cookie and redirect
        const headers = new Headers();
        const sessionCookie = `session=${userId}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400; Domain=.rhythm90.io`;
        headers.set('Set-Cookie', sessionCookie);
        headers.set('Location', `${appUrl}/dashboard?auth=success`);
        console.log('[BACKEND] OAuth callback setting session cookie:', sessionCookie);
        console.log('[BACKEND] OAuth callback redirecting to:', `${appUrl}/dashboard?auth=success`);
        return new Response(null, { status: 302, headers });
      } catch (error) {
        console.error("Google OAuth callback error:", error);
        if (env.SENTRY_DSN) {
          fetch(env.SENTRY_DSN, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: "Google OAuth error",
              error: error instanceof Error ? error.message : String(error),
              context: { callback: "google" }
            })
          });
        }
        return Response.redirect(`${appUrl}/login?error=oauth_failed`);
      }
    }

    if (pathname === "/auth/callback/microsoft" && request.method === "GET") {
      const code = url.searchParams.get("code");
      const state = url.searchParams.get("state");
      const redirectUri = env.MICROSOFT_REDIRECT_URI || `https://rhythm90-api.kevin-mcgovern.workers.dev/auth/callback/microsoft`;
      if (!code) {
        return Response.redirect(`${appUrl}/login?error=no_code`);
      }
      try {
        // Exchange code for tokens
        const tokenResponse = await fetch("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: env.MICROSOFT_CLIENT_ID!,
            client_secret: env.MICROSOFT_CLIENT_SECRET!,
            code,
            grant_type: "authorization_code",
            redirect_uri: redirectUri,
            scope: [
              "https://graph.microsoft.com/User.Read",
              "openid",
              "email",
              "profile"
            ].join(" ")
          })
        });
        const tokenData = await tokenResponse.json() as { access_token: string; refresh_token?: string; expires_in: number };
        // Get user info from Microsoft Graph
        const userResponse = await fetch("https://graph.microsoft.com/v1.0/me", {
          headers: { "Authorization": `Bearer ${tokenData.access_token}` }
        });
        const userData = await userResponse.json() as { id: string; userPrincipalName: string; displayName: string; mail?: string };
        // Try to get avatar (optional)
        let avatar: string | null = null;
        try {
          const photoResponse = await fetch("https://graph.microsoft.com/v1.0/me/photo/$value", {
            headers: { "Authorization": `Bearer ${tokenData.access_token}` }
          });
          if (photoResponse.ok) {
            const photoArrayBuffer = await photoResponse.arrayBuffer();
            let binary = '';
            const bytes = new Uint8Array(photoArrayBuffer);
            for (let i = 0; i < bytes.byteLength; i++) {
              binary += String.fromCharCode(bytes[i]);
            }
            avatar = `data:image/jpeg;base64,${btoa(binary)}`;
          }
        } catch (e) {
          avatar = null;
        }
        // Use email from mail or userPrincipalName
        const email = userData.mail || userData.userPrincipalName;
        const name = userData.displayName;
        const providerUserId = userData.id;
        // Check if user already exists by email
        let user = await env.DB.prepare(`SELECT id FROM users WHERE email = ?`).bind(email).first();
        let userId: string;
        if (user) {
          userId = user.id;
          await env.DB.prepare(`UPDATE users SET name = ? WHERE id = ?`).bind(name, userId).run();
        } else {
          userId = crypto.randomUUID();
          await env.DB.prepare(`INSERT INTO users (id, email, name, provider, role, is_premium) VALUES (?, ?, ?, ?, ?, ?)`).bind(userId, email, name, "microsoft", "member", false).run();
        }
        // Store OAuth provider data (link to user)
        await env.DB.prepare(`INSERT OR REPLACE INTO oauth_providers (user_id, provider, provider_user_id, email, name, avatar, access_token, refresh_token, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(userId, "microsoft", providerUserId, email, name, avatar, tokenData.access_token, tokenData.refresh_token || null, Date.now() + tokenData.expires_in * 1000).run();
        return Response.redirect(`${appUrl}/dashboard?auth=success`);
      } catch (error) {
        if (env.SENTRY_DSN) {
          fetch(env.SENTRY_DSN, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: "Microsoft OAuth error",
              error: error instanceof Error ? error.message : String(error),
              context: { callback: "microsoft" }
            })
          });
        }
        return Response.redirect(`${appUrl}/login?error=oauth_failed`);
      }
    }

    if (pathname === "/auth/callback/slack" && request.method === "GET") {
      const code = url.searchParams.get("code");
      const state = url.searchParams.get("state");
      
      if (!code) {
        return Response.redirect(`${appUrl}/login?error=no_code`);
      }

      try {
        // Exchange code for tokens
        const tokenResponse = await fetch("https://slack.com/api/oauth.v2.access", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: env.SLACK_CLIENT_ID!,
            client_secret: env.SLACK_CLIENT_SECRET!,
            code,
            redirect_uri: `${appUrl}/auth/callback/slack`
          })
        });

        const tokenData = await tokenResponse.json() as { 
          access_token: string; 
          authed_user: { id: string; name: string; email?: string; image_192?: string } 
        };
        
        // Create or update user
        const userId = crypto.randomUUID();
        const email = tokenData.authed_user.email || `${tokenData.authed_user.id}@slack.com`;
        await env.DB.prepare(`INSERT OR IGNORE INTO users (id, email, name, provider, role, is_premium) VALUES (?, ?, ?, ?, ?, ?)`)
          .bind(userId, email, tokenData.authed_user.name, "slack", "member", false)
          .run();
        
        // Store OAuth provider data
        await env.DB.prepare(`INSERT OR REPLACE INTO oauth_providers (user_id, provider, provider_user_id, email, name, avatar, access_token, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
          .bind(userId, "slack", tokenData.authed_user.id, email, tokenData.authed_user.name, tokenData.authed_user.image_192 || null, tokenData.access_token, Date.now() + 3600 * 1000)
          .run();
        
        return Response.redirect(`${appUrl}/dashboard?auth=success`);
      } catch (error) {
        console.error("Slack OAuth error:", error);
        return Response.redirect(`${appUrl}/login?error=oauth_failed`);
      }
    }

    if (pathname === "/board" && request.method === "GET") {
      const userId = "user-123";
      const userTeam = await env.DB.prepare(`SELECT team_id FROM team_users WHERE user_id = ?`).bind(userId).first();
      const teamId = userTeam ? userTeam.team_id : "default-team";
      const plays = await env.DB.prepare(`SELECT * FROM plays WHERE team_id = ?`).bind(teamId).all();
      return Response.json(plays);
    }

    if (pathname === "/board" && request.method === "POST") {
      // Skip destructive actions in demo mode
      if (isDemoMode(env)) {
        return Response.json({ success: true, demo: true, message: "Action skipped in demo mode" });
      }

      const body = await request.json() as { name: string; target_outcome: string; why_this_play: string; how_to_run: string; signals?: string; status?: string };
      const userId = "user-123";
      const userTeam = await env.DB.prepare(`SELECT team_id FROM team_users WHERE user_id = ?`).bind(userId).first();
      const teamId = userTeam ? userTeam.team_id : "default-team";
      await env.DB.prepare(`INSERT INTO plays (id, team_id, name, target_outcome, why_this_play, how_to_run, signals, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
        .bind(
          crypto.randomUUID(),
          teamId,
          body.name,
          body.target_outcome,
          body.why_this_play,
          body.how_to_run,
          body.signals || "",
          body.status || "active"
        )
        .run();
      return Response.json({ success: true });
    }

    if (pathname === "/signals" && request.method === "GET") {
      const userId = "user-123";
      const userTeam = await env.DB.prepare(`SELECT team_id FROM team_users WHERE user_id = ?`).bind(userId).first();
      const teamId = userTeam ? userTeam.team_id : "default-team";
      const play = await env.DB.prepare(`SELECT id FROM plays WHERE team_id = ?`).bind(teamId).first();
      const playId = play ? play.id : "play-123";
      const signals = await env.DB.prepare(`SELECT * FROM signals WHERE play_id = ?`).bind(playId).all();
      return Response.json(signals);
    }

    if (pathname === "/signals" && request.method === "POST") {
      // Skip destructive actions in demo mode
      if (isDemoMode(env)) {
        return Response.json({ success: true, demo: true, message: "Action skipped in demo mode" });
      }

      const body = await request.json() as { observation: string; meaning: string; action: string };
      const userId = "user-123";
      const userTeam = await env.DB.prepare(`SELECT team_id FROM team_users WHERE user_id = ?`).bind(userId).first();
      const teamId = userTeam ? userTeam.team_id : "default-team";
      const play = await env.DB.prepare(`SELECT id FROM plays WHERE team_id = ?`).bind(teamId).first();
      const playId = play ? play.id : "play-123";
      await env.DB.prepare(`INSERT INTO signals (id, play_id, observation, meaning, action) VALUES (?, ?, ?, ?, ?)`)
        .bind(
          crypto.randomUUID(),
          playId,
          body.observation,
          body.meaning,
          body.action
        )
        .run();
      return Response.json({ success: true });
    }

    if (pathname === "/rnr-summary" && request.method === "GET") {
      const userId = "user-123";
      const userTeam = await env.DB.prepare(`SELECT team_id FROM team_users WHERE user_id = ?`).bind(userId).first();
      const teamId = userTeam ? userTeam.team_id : "default-team";
      const summary = await env.DB.prepare(`SELECT * FROM rnr_summaries WHERE team_id = ? ORDER BY created_at DESC LIMIT 1`).bind(teamId).first();
      return Response.json(summary || {});
    }

    if (pathname === "/rnr-summary" && request.method === "POST") {
      // Skip destructive actions in demo mode
      if (isDemoMode(env)) {
        return Response.json({ success: true, demo: true, message: "Action skipped in demo mode" });
      }

      const body = await request.json() as { summary: string };
      const userId = "user-123";
      const userTeam = await env.DB.prepare(`SELECT team_id FROM team_users WHERE user_id = ?`).bind(userId).first();
      const teamId = userTeam ? userTeam.team_id : "default-team";
      await env.DB.prepare(`INSERT INTO rnr_summaries (id, team_id, summary, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)`)
        .bind(crypto.randomUUID(), teamId, body.summary)
        .run();
      return Response.json({ success: true });
    }

    if (pathname === "/dashboard-stats" && request.method === "GET") {
      const userId = "user-123";
      const userTeam = await env.DB.prepare(`SELECT team_id FROM team_users WHERE user_id = ?`).bind(userId).first();
      const teamId = userTeam ? userTeam.team_id : "default-team";
      const playCount = await env.DB.prepare(`SELECT COUNT(*) as count FROM plays WHERE team_id = ?`).bind(teamId).first();
      const signalCount = await env.DB.prepare(`SELECT COUNT(*) as count FROM signals WHERE play_id IN (SELECT id FROM plays WHERE team_id = ?)`).bind(teamId).first();
      return Response.json({ 
        playCount: playCount?.count || 0, 
        signalCount: signalCount?.count || 0 
      });
    }

    if (pathname === "/notifications" && request.method === "GET") {
      const since = Number(url.searchParams.get("since")) || Date.now() - 5 * 60 * 1000;
      const notifications = await env.DB.prepare(`SELECT * FROM notifications WHERE created_at > ? ORDER BY created_at DESC`).bind(since).all();
      return Response.json(notifications.results);
    }

    if (pathname === "/ai-signal" && request.method === "POST") {
      const userId = getCurrentUserId();
      const isPremium = await isUserPremium(env, userId);
      
      if (!isPremium && !isTestMode(env)) {
        return Response.json({ success: false, message: "Premium subscription required" }, { status: 403 });
      }

      const body = await request.json() as { 
        signal_text: string; 
        play_name?: string; 
        team?: string; 
        play_goal?: string; 
        recent_signals?: string 
      };

      // Get user's team for context
      const userTeam = await env.DB.prepare(`SELECT team_id FROM team_users WHERE user_id = ?`).bind(userId).first();
      const teamId = userTeam?.team_id || "team-123";

      // Build context for AI
      let context = `Signal: ${body.signal_text}`;
      if (body.play_name) context += `\nPlay: ${body.play_name}`;
      if (body.play_goal) context += `\nGoal: ${body.play_goal}`;
      if (body.recent_signals) context += `\nRecent signals: ${body.recent_signals}`;

      try {
        const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [
              { 
                role: "system", 
                content: "You are a marketing signals assistant. Analyze the signal and provide structured advice. Return only valid JSON with 'interpretation' and 'suggestedAction' fields." 
              },
              { 
                role: "user", 
                content: `Analyze this marketing signal and provide interpretation and suggested next action: ${context}` 
              },
            ],
            temperature: 0.7,
          }),
        });

        const data = await openaiRes.json() as { choices?: Array<{ message?: { content?: string } }> };
        const aiResponse = data.choices?.[0]?.message?.content || "";
        
        // Try to parse JSON response
        let result;
        try {
          result = JSON.parse(aiResponse);
        } catch {
          // Fallback if AI doesn't return valid JSON
          result = {
            interpretation: aiResponse || "Unable to interpret signal at this time.",
            suggestedAction: "Please review the signal manually and take appropriate action."
          };
        }

        // Track usage
        await env.DB.prepare(`
          INSERT INTO ai_usage (id, team_id, feature, count, updated_at)
          VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)
          ON CONFLICT(team_id, feature) DO UPDATE SET
          count = count + 1,
          updated_at = CURRENT_TIMESTAMP
        `).bind(crypto.randomUUID(), teamId, "signal_help").run();

        return Response.json({ 
          success: true,
          interpretation: result.interpretation,
          suggestedAction: result.suggestedAction
        });
      } catch (error) {
        console.error("AI API error:", error);
        return Response.json({ 
          success: false, 
          interpretation: "⚠️ AI is currently unavailable. Please try again later.",
          suggestedAction: "Please review the signal manually and take appropriate action."
        });
      }
    }

    if (pathname === "/ai-hypothesis" && request.method === "POST") {
      const userId = getCurrentUserId();
      const isPremium = await isUserPremium(env, userId);
      
      if (!isPremium && !isTestMode(env)) {
        return Response.json({ success: false, message: "Premium subscription required" }, { status: 403 });
      }

      const body = await request.json() as { 
        play_description: string; 
        goal: string;
        team?: string;
      };

      // Get user's team for context
      const userTeam = await env.DB.prepare(`SELECT team_id FROM team_users WHERE user_id = ?`).bind(userId).first();
      const teamId = userTeam?.team_id || "team-123";

      const context = `Play Description: ${body.play_description}\nGoal: ${body.goal}`;

      try {
        const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [
              { 
                role: "system", 
                content: "You are a marketing strategy assistant. Generate a hypothesis for a marketing play. Return only valid JSON with 'hypothesis', 'expectedOutcome', and 'risks' fields." 
              },
              { 
                role: "user", 
                content: `Generate a hypothesis for this marketing play: ${context}` 
              },
            ],
            temperature: 0.7,
          }),
        });

        const data = await openaiRes.json() as { choices?: Array<{ message?: { content?: string } }> };
        const aiResponse = data.choices?.[0]?.message?.content || "";
        
        // Try to parse JSON response
        let result;
        try {
          result = JSON.parse(aiResponse);
        } catch {
          // Fallback if AI doesn't return valid JSON
          result = {
            hypothesis: aiResponse || "Unable to generate hypothesis at this time.",
            expectedOutcome: "Review the play description and goal to determine expected outcomes.",
            risks: "Consider potential risks and mitigation strategies."
          };
        }

        // Track usage
        await env.DB.prepare(`
          INSERT INTO ai_usage (id, team_id, feature, count, updated_at)
          VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)
          ON CONFLICT(team_id, feature) DO UPDATE SET
          count = count + 1,
          updated_at = CURRENT_TIMESTAMP
        `).bind(crypto.randomUUID(), teamId, "hypothesis_generator").run();

        return Response.json({ 
          success: true,
          hypothesis: result.hypothesis,
          expectedOutcome: result.expectedOutcome,
          risks: result.risks
        });
      } catch (error) {
        console.error("AI API error:", error);
        return Response.json({ 
          success: false, 
          hypothesis: "⚠️ AI is currently unavailable. Please try again later.",
          expectedOutcome: "Review the play description and goal to determine expected outcomes.",
          risks: "Consider potential risks and mitigation strategies."
        });
      }
    }

    if (pathname === "/admin/team" && request.method === "GET") {
      const members = await env.DB.prepare(`SELECT * FROM team_users WHERE team_id = ?`).bind("team-123").all();
      return Response.json(members);
    }

    if (pathname === "/admin/team/add" && request.method === "POST") {
      // Skip destructive actions in demo mode
      if (isDemoMode(env)) {
        return Response.json({ success: true, demo: true, message: "Action skipped in demo mode" });
      }

      const body = await request.json() as { user_id: string; role: string };
      await env.DB.prepare(`INSERT INTO team_users (team_id, user_id, role) VALUES (?, ?, ?)`)
        .bind("team-123", body.user_id, body.role)
        .run();
      return Response.json({ success: true });
    }

    if (pathname === "/admin/team/remove" && request.method === "POST") {
      // Skip destructive actions in demo mode
      if (isDemoMode(env)) {
        return Response.json({ success: true, demo: true, message: "Action skipped in demo mode" });
      }

      const body = await request.json() as { user_id: string };
      await env.DB.prepare(`DELETE FROM team_users WHERE team_id = ? AND user_id = ?`)
        .bind("team-123", body.user_id)
        .run();
      return Response.json({ success: true });
    }

    if (pathname === "/admin/teams" && request.method === "GET") {
      const userId = getCurrentUserId();
      const adminStatus = await isAdmin(env, userId);
      
      if (!adminStatus) {
        return new Response("Unauthorized", { status: 401 });
      }

      const teams = await env.DB.prepare(`SELECT * FROM teams`).all();
      const teamCount = await env.DB.prepare(`SELECT COUNT(*) as count FROM teams`).first();
      
      return Response.json({ 
        teams: teams.results, 
        teamCount: teamCount?.count || 0 
      });
    }

    if (pathname === "/feature-flags" && request.method === "GET") {
      const flags = await env.DB.prepare(`SELECT key, enabled FROM feature_flags`).all();
      const obj = Object.fromEntries(flags.results.map((f: any) => [f.key, !!f.enabled]));
      return Response.json(obj);
    }

    if (pathname === "/feature-flags" && request.method === "POST") {
      const userId = getCurrentUserId();
      const adminStatus = await isAdmin(env, userId);
      
      if (!adminStatus) {
        return new Response("Unauthorized", { status: 401 });
      }

      const body = await request.json() as { key: string; enabled: boolean };
      await env.DB.prepare(`UPDATE feature_flags SET enabled = ? WHERE key = ?`)
        .bind(body.enabled ? 1 : 0, body.key)
        .run();
      return Response.json({ success: true });
    }

    // Admin invitation management
    if (pathname === "/admin/invites" && request.method === "GET") {
      const userId = getCurrentUserId();
      const adminStatus = await isAdmin(env, userId);
      
      if (!adminStatus) {
        return new Response("Unauthorized", { status: 401 });
      }

      // Get all invites (active and expired)
      const allInvites = await env.DB.prepare(`
        SELECT i.*, u.name as invited_by_name 
        FROM invites i 
        LEFT JOIN users u ON i.invited_by = u.id 
        ORDER BY i.created_at DESC
      `).all();
      
      // Separate active and expired invites
      const now = new Date().toISOString();
      const activeInvites = allInvites.results.filter((invite: any) => 
        invite.accepted === 0 && invite.expires_at > now
      );
      const expiredInvites = allInvites.results.filter((invite: any) => 
        invite.accepted === 0 && invite.expires_at <= now
      );
      
      return Response.json({ 
        activeInvites, 
        expiredInvites,
        totalActive: activeInvites.length,
        totalExpired: expiredInvites.length
      });
    }

    if (pathname === "/admin/invites/cancel" && request.method === "POST") {
      const userId = getCurrentUserId();
      const adminStatus = await isAdmin(env, userId);
      
      if (!adminStatus) {
        return new Response("Unauthorized", { status: 401 });
      }

      const body = await request.json() as { invite_id: string };
      
      // Delete the invite
      await env.DB.prepare(`DELETE FROM invites WHERE id = ?`).bind(body.invite_id).run();
      
      // Log admin action
      await env.DB.prepare(`INSERT INTO admin_actions (id, admin_user_id, action_type, target_type, target_id, details) VALUES (?, ?, ?, ?, ?, ?)`)
        .bind(crypto.randomUUID(), userId, "invite_canceled", "invite", body.invite_id, "Invite canceled by admin")
        .run();
      
      return Response.json({ success: true });
    }

    if (pathname === "/admin/invites/resend" && request.method === "POST") {
      const userId = getCurrentUserId();
      const adminStatus = await isAdmin(env, userId);
      
      if (!adminStatus) {
        return new Response("Unauthorized", { status: 401 });
      }

      const body = await request.json() as { invite_id: string };
      const appUrl = env.APP_URL || "https://rhythm90.io";
      
      // Get the invite
      const invite = await env.DB.prepare(`SELECT * FROM invites WHERE id = ?`).bind(body.invite_id).first();
      if (!invite) {
        return Response.json({ success: false, message: "Invite not found" }, { status: 404 });
      }
      
      // Generate new token and expiration
      const newToken = crypto.randomUUID();
      const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days
      
      // Update the invite
      await env.DB.prepare(`UPDATE invites SET token = ?, expires_at = ? WHERE id = ?`)
        .bind(newToken, newExpiresAt, body.invite_id)
        .run();
      
      // Log admin action
      await env.DB.prepare(`INSERT INTO admin_actions (id, admin_user_id, action_type, target_type, target_id, details) VALUES (?, ?, ?, ?, ?, ?)`)
        .bind(crypto.randomUUID(), userId, "invite_resent", "invite", body.invite_id, `Invite resent for ${invite.email}`)
        .run();
      
      const inviteLink = `${appUrl}/accept-invite?token=${newToken}`;
      return Response.json({ success: true, inviteLink });
    }

    if (pathname === "/admin/invites/expire" && request.method === "POST") {
      const userId = getCurrentUserId();
      const adminStatus = await isAdmin(env, userId);
      
      if (!adminStatus) {
        return new Response("Unauthorized", { status: 401 });
      }

      const body = await request.json() as { invite_id: string };
      
      // Mark invite as expired (soft delete)
      await env.DB.prepare(`UPDATE invites SET expires_at = CURRENT_TIMESTAMP WHERE id = ?`)
        .bind(body.invite_id)
        .run();
      
      // Log admin action
      await env.DB.prepare(`INSERT INTO admin_actions (id, admin_user_id, action_type, target_type, target_id, details) VALUES (?, ?, ?, ?, ?, ?)`)
        .bind(crypto.randomUUID(), userId, "invite_expired", "invite", body.invite_id, "Invite manually expired by admin")
        .run();
      
      return Response.json({ success: true });
    }

    if (pathname === "/invite" && request.method === "POST") {
      const userId = getCurrentUserId();
      const adminStatus = await isAdmin(env, userId);
      
      if (!adminStatus) {
        return new Response("Unauthorized", { status: 401 });
      }

      const body = await request.json() as { email: string };
      const token = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days
      
      await env.DB.prepare(`INSERT INTO invites (id, email, token, expires_at, invited_by) VALUES (?, ?, ?, ?, ?)`)
        .bind(crypto.randomUUID(), body.email, token, expiresAt, userId)
        .run();
      
      const inviteLink = `${appUrl}/accept-invite?token=${token}`;
      console.log(`Invite link: ${inviteLink}`);
      return Response.json({ success: true, inviteLink });
    }

    if (pathname === "/accept-invite" && request.method === "GET") {
      const token = url.searchParams.get("token");
      if (!token) {
        return Response.json({ valid: false, message: "No token provided" });
      }

      const invite = await env.DB.prepare(`SELECT * FROM invites WHERE token = ? AND accepted = 0`).bind(token).first();
      if (!invite) {
        return Response.json({ valid: false, message: "Invalid or expired invitation link" });
      }

      return Response.json({ valid: true, email: invite.email });
    }

    if (pathname === "/accept-invite" && request.method === "POST") {
      const body = await request.json() as { token: string; name: string };
      
      const invite = await env.DB.prepare(`SELECT * FROM invites WHERE token = ? AND accepted = 0`).bind(body.token).first();
      if (!invite) {
        return Response.json({ success: false, message: "Invalid or expired invitation link" });
      }

      const userId = crypto.randomUUID();

      // Create user account
      await env.DB.prepare(`INSERT INTO users (id, email, name, provider, role, is_premium) VALUES (?, ?, ?, ?, ?, ?)`)
        .bind(userId, invite.email, body.name || "New User", "invite", "member", false)
        .run();

      // Add user to team
      await env.DB.prepare(`INSERT INTO team_users (team_id, user_id, role) VALUES (?, ?, ?)`)
        .bind("team-123", userId, "member")
        .run();

      // Mark invite as accepted
      await env.DB.prepare(`UPDATE invites SET accepted = 1 WHERE token = ?`).bind(body.token).run();

      return Response.json({ success: true, email: invite.email });
    }

    if (pathname === "/create-sample-notifications" && request.method === "POST") {
      const sampleNotifications = [
        { message: "Kickoff scheduled for Monday at 10 AM." },
        { message: "New signal logged in Play Alpha." },
        { message: "R&R Summary updated for Q1." },
        { message: "Team meeting reminder: Friday 2 PM." },
      ];

      for (const notification of sampleNotifications) {
        await env.DB.prepare(`INSERT INTO notifications (id, message, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)`)
          .bind(crypto.randomUUID(), notification.message)
          .run();
      }

      return Response.json({ success: true, message: "Sample notifications created." });
    }

    if (pathname === "/slack-hook" && request.method === "POST") {
      const payload = await request.json() as { text: string };

      try {
        if (payload.text.toLowerCase().startsWith("/log-signal")) {
          const [_, playId, observation, meaning, action] = payload.text.split("|").map(s => s.trim());
          if (!playId || !observation || !meaning || !action) throw new Error("Invalid format. Use /log-signal | playId | observation | meaning | action");

          await env.DB.prepare(`INSERT INTO signals (id, play_id, observation, meaning, action) VALUES (?, ?, ?, ?, ?)`)
            .bind(crypto.randomUUID(), playId, observation, meaning, action)
            .run();

          return Response.json({ text: `✅ Signal logged for play ${playId}.` });
        }

        if (payload.text.toLowerCase().startsWith("/new-play")) {
          const [_, name, outcome] = payload.text.split("|").map(s => s.trim());
          if (!name || !outcome) throw new Error("Invalid format. Use /new-play | name | outcome");

          await env.DB.prepare(`INSERT INTO plays (id, team_id, name, target_outcome, status) VALUES (?, ?, ?, ?, ?)`)
            .bind(crypto.randomUUID(), "team-123", name, outcome, "active")
            .run();

          return Response.json({ text: `✅ Play "${name}" created.` });
        }

        return Response.json({ text: "🤖 Unknown command." });

      } catch (error) {
        return Response.json({ text: `⚠️ ${(error as Error).message}` });
      }
    }

    if (pathname === "/admin/invite-user" && request.method === "POST") {
      const userId = getCurrentUserId();
      const adminStatus = await isAdmin(env, userId);
      
      if (!adminStatus) {
        return new Response("Unauthorized", { status: 401 });
      }

      const body = await request.json() as { email: string; role: string };
      const appUrl = env.APP_URL || "https://rhythm90.io";
      
      // Validate role
      const validRoles = ["member", "analyst", "admin", "viewer"];
      if (!validRoles.includes(body.role)) {
        return Response.json({ success: false, message: "Invalid role" }, { status: 400 });
      }
      
      // Generate invite
      const inviteId = crypto.randomUUID();
      const token = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days
      
      // Create invite
      await env.DB.prepare(`INSERT INTO invites (id, email, token, expires_at, invited_by, role) VALUES (?, ?, ?, ?, ?, ?)`)
        .bind(inviteId, body.email, token, expiresAt, userId, body.role)
        .run();
      
      // Log admin action
      await env.DB.prepare(`INSERT INTO admin_actions (id, admin_user_id, action_type, target_type, target_id, details) VALUES (?, ?, ?, ?, ?, ?)`)
        .bind(crypto.randomUUID(), userId, "invite_user", "invite", inviteId, `Invited ${body.email} as ${body.role}`)
        .run();
      
      const inviteLink = `${appUrl}/accept-invite?token=${token}`;
      return Response.json({ success: true, inviteLink, email: body.email, role: body.role });
    }

    if (pathname === "/admin/audit-log" && request.method === "GET") {
      const userId = getCurrentUserId();
      const adminStatus = await isAdmin(env, userId);
      
      if (!adminStatus) {
        return new Response("Unauthorized", { status: 401 });
      }

      // Get latest 100 admin actions with admin names
      const auditLog = await env.DB.prepare(`
        SELECT 
          aa.id,
          aa.action_type,
          aa.target_type,
          aa.target_id,
          aa.details,
          aa.created_at,
          u.name as admin_name,
          u.email as admin_email
        FROM admin_actions aa
        LEFT JOIN users u ON aa.admin_user_id = u.id
        ORDER BY aa.created_at DESC
        LIMIT 100
      `).all();
      
      return Response.json({ auditLog: auditLog.results });
    }

    // Team role management routes
    if (pathname === "/admin/team/update-role" && request.method === "POST") {
      const userId = getCurrentUserId();
      const adminStatus = await isAdmin(env, userId);
      
      if (!adminStatus) {
        return new Response("Unauthorized", { status: 401 });
      }

      const body = await request.json() as { user_id: string; new_role: string };
      
      // Validate role
      const validRoles = ["member", "analyst", "admin", "viewer"];
      if (!validRoles.includes(body.new_role)) {
        return Response.json({ success: false, message: "Invalid role" }, { status: 400 });
      }
      
      // Prevent admin from changing their own role
      if (body.user_id === userId) {
        return Response.json({ success: false, message: "Cannot change your own role" }, { status: 400 });
      }
      
      // Get current user's role
      const currentUserRole = await env.DB.prepare(`SELECT role FROM team_users WHERE user_id = ?`).bind(userId).first();
      const targetUserRole = await env.DB.prepare(`SELECT role FROM team_users WHERE user_id = ?`).bind(body.user_id).first();
      
      // Prevent non-admin from changing admin roles
      if (currentUserRole?.role !== "admin" && targetUserRole?.role === "admin") {
        return Response.json({ success: false, message: "Only admins can manage admin roles" }, { status: 403 });
      }
      
      // Update role
      await env.DB.prepare(`UPDATE team_users SET role = ? WHERE user_id = ?`).bind(body.new_role, body.user_id).run();
      
      // Log admin action
      await env.DB.prepare(`INSERT INTO admin_actions (id, admin_user_id, action_type, target_type, target_id, details) VALUES (?, ?, ?, ?, ?, ?)`)
        .bind(crypto.randomUUID(), userId, "role_updated", "user", body.user_id, `Role changed to ${body.new_role}`)
        .run();
      
      return Response.json({ success: true });
    }

    if (pathname === "/admin/team/remove-user" && request.method === "POST") {
      const userId = getCurrentUserId();
      const adminStatus = await isAdmin(env, userId);
      
      if (!adminStatus) {
        return new Response("Unauthorized", { status: 401 });
      }

      const body = await request.json() as { user_id: string };
      
      // Prevent admin from removing themselves
      if (body.user_id === userId) {
        return Response.json({ success: false, message: "Cannot remove yourself from the team" }, { status: 400 });
      }
      
      // Get target user's role
      const targetUserRole = await env.DB.prepare(`SELECT role FROM team_users WHERE user_id = ?`).bind(body.user_id).first();
      
      // Prevent non-admin from removing admin users
      const currentUserRole = await env.DB.prepare(`SELECT role FROM team_users WHERE user_id = ?`).bind(userId).first();
      if (currentUserRole?.role !== "admin" && targetUserRole?.role === "admin") {
        return Response.json({ success: false, message: "Only admins can remove admin users" }, { status: 403 });
      }
      
      // Remove user from team
      await env.DB.prepare(`DELETE FROM team_users WHERE user_id = ?`).bind(body.user_id).run();
      
      // Log admin action
      await env.DB.prepare(`INSERT INTO admin_actions (id, admin_user_id, action_type, target_type, target_id, details) VALUES (?, ?, ?, ?, ?, ?)`)
        .bind(crypto.randomUUID(), userId, "user_removed", "user", body.user_id, "User removed from team")
        .run();
      
      return Response.json({ success: true });
    }

    // Admin dashboard stats route
    if (pathname === "/admin/stats" && request.method === "GET") {
      const userId = getCurrentUserId();
      const adminStatus = await isAdmin(env, userId);
      
      if (!adminStatus) {
        return new Response("Unauthorized", { status: 401 });
      }

      // Get total users
      const totalUsersResult = await env.DB.prepare(`SELECT COUNT(*) as count FROM users`).first();
      const totalUsers = totalUsersResult?.count as number || 0;
      
      // Get premium users
      const premiumUsersResult = await env.DB.prepare(`SELECT COUNT(*) as count FROM users WHERE is_premium = 1`).first();
      const premiumUsers = premiumUsersResult?.count as number || 0;
      
      // Get active users (last 7 days) - mock for now
      const activeUsers = Math.floor(totalUsers * 0.7); // 70% of total users
      
      // Calculate conversion rate - mock for now
      const conversionRate = totalUsers > 0 ? ((premiumUsers / totalUsers) * 100).toFixed(1) : "0.0";
      
      // Mock MRR calculation
      const mrr = premiumUsers * 29; // $29 per premium user
      
      return Response.json({
        totalUsers,
        premiumUsers,
        activeUsers,
        conversionRate: `${conversionRate}%`,
        mrr: `$${mrr}`,
        lastUpdated: new Date().toISOString()
      });
    }

    // Public changelog route
    if (pathname === "/changelog" && request.method === "GET") {
      const changelog = await env.DB.prepare(`
        SELECT version, title, description, category, release_date, created_at
        FROM changelog_entries
        ORDER BY release_date DESC, created_at DESC
      `).all();
      
      return Response.json({ changelog: changelog.results });
    }

    // User onboarding routes
    if (pathname === "/onboarding/status" && request.method === "GET") {
      const userId = getCurrentUserId();
      
      const onboardingItems = await env.DB.prepare(`
        SELECT item, completed_at
        FROM user_onboarding
        WHERE user_id = ?
        ORDER BY completed_at ASC
      `).bind(userId).all();
      
      return Response.json({ items: onboardingItems.results });
    }

    if (pathname === "/onboarding/complete" && request.method === "POST") {
      const userId = getCurrentUserId();
      const body = await request.json() as { item: string };
      
      // Validate item
      const validItems = ["create_play", "connect_slack", "explore_help", "invite_team"];
      if (!validItems.includes(body.item)) {
        return Response.json({ success: false, message: "Invalid onboarding item" }, { status: 400 });
      }
      
      // Mark item as completed (upsert)
      await env.DB.prepare(`
        INSERT OR REPLACE INTO user_onboarding (id, user_id, item, completed_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      `).bind(crypto.randomUUID(), userId, body.item).run();
      
      return Response.json({ success: true });
    }

    // Team members route (for role management UI)
    if (pathname === "/admin/team/members" && request.method === "GET") {
      const userId = getCurrentUserId();
      const adminStatus = await isAdmin(env, userId);
      
      if (!adminStatus) {
        return new Response("Unauthorized", { status: 401 });
      }

      // Get current user's team
      const userTeam = await env.DB.prepare(`SELECT team_id FROM team_users WHERE user_id = ?`).bind(userId).first();
      const teamId = userTeam?.team_id || "team-123";
      
      // Get team members with their roles
      const members = await env.DB.prepare(`
        SELECT 
          tu.user_id,
          tu.role,
          u.name,
          u.email,
          u.is_premium
        FROM team_users tu
        JOIN users u ON tu.user_id = u.id
        WHERE tu.team_id = ?
        ORDER BY u.name ASC
      `).bind(teamId).all();
      
      return Response.json({ members: members.results });
    }

    // Slack/Teams command handler
    if (pathname === "/slack/command" && request.method === "POST") {
      const formData = await request.formData();
      const command = formData.get("command") as string;
      const text = formData.get("text") as string;
      const userId = formData.get("user_id") as string;
      const teamId = formData.get("team_id") as string;

      try {
        if (command === "/r90") {
          const parts = text.split("|").map(s => s.trim());
          
          if (parts[0] === "new-play" && parts.length >= 3) {
            const playName = parts[1].replace(/"/g, "");
            const goal = parts[2].replace(/"/g, "");
            
            // Create play
            const playId = crypto.randomUUID();
            await env.DB.prepare(`INSERT INTO plays (id, team_id, name, target_outcome, status) VALUES (?, ?, ?, ?, ?)`)
              .bind(playId, teamId, playName, goal, "active")
              .run();
            
            // Send webhook notification
            await sendSlackNotification(env, teamId, `✅ New play created: ${playName}`);
            
            return Response.json({
              response_type: "in_channel",
              text: `✅ Play "${playName}" created successfully!`
            });
          }
          
          if (parts[0] === "log-signal" && parts.length >= 4) {
            const playId = parts[1].replace(/"/g, "");
            const observation = parts[2].replace(/"/g, "");
            const meaning = parts[3].replace(/"/g, "");
            
            // Log signal
            await env.DB.prepare(`INSERT INTO signals (id, play_id, observation, meaning, action) VALUES (?, ?, ?, ?, ?)`)
              .bind(crypto.randomUUID(), playId, observation, meaning, "Action needed")
              .run();
            
            // Send webhook notification
            await sendSlackNotification(env, teamId, `⚠️ Signal logged for play ${playId}: ${observation}`);
            
            return Response.json({
              response_type: "in_channel",
              text: `✅ Signal logged successfully!`
            });
          }
          
          return Response.json({
            text: "🤖 Unknown command. Use `/r90 new-play \"Name\" | \"Goal\"` or `/r90 log-signal \"Play ID\" | \"Observation\" | \"Meaning\"`"
          });
        }
      } catch (error) {
        console.error("Slack command error:", error);
        return Response.json({
          text: "⚠️ Error processing command. Please try again."
        });
      }
    }

    // Slack/Teams webhook notifications
    if (pathname === "/slack/webhook" && request.method === "POST") {
      const body = await request.json() as { event: string; data: any };
      
      try {
        // Handle different event types
        if (body.event === "play_created") {
          await sendSlackNotification(env, body.data.team_id, `✅ New play created: ${body.data.play_name}`);
        } else if (body.event === "signal_logged") {
          await sendSlackNotification(env, body.data.team_id, `⚠️ Signal needs review: ${body.data.observation}`);
        } else if (body.event === "team_invite") {
          await sendSlackNotification(env, body.data.team_id, `👥 Team invite sent to: ${body.data.email}`);
        }
        
        return Response.json({ success: true });
      } catch (error) {
        console.error("Slack webhook error:", error);
        return Response.json({ success: false }, { status: 500 });
      }
    }

    // Slack integration settings
    if (pathname === "/slack/settings" && request.method === "GET") {
      const userId = getCurrentUserId();
      const userTeam = await env.DB.prepare(`SELECT team_id FROM team_users WHERE user_id = ?`).bind(userId).first();
      const teamId = userTeam?.team_id || "team-123";
      
      const settings = await env.DB.prepare(`SELECT * FROM slack_settings WHERE team_id = ?`).bind(teamId).first();
      
      // Return mock data for now
      return Response.json({
        workspace_name: settings?.workspace_name || "Demo Workspace",
        connected_channels: settings?.connected_channels || "All Channels",
        last_sync: settings?.last_sync || new Date().toISOString(),
        is_active: settings?.is_active || false
      });
    }

    // Templates route
    if (pathname === "/templates" && request.method === "GET") {
      const templates = await env.DB.prepare(`
        SELECT id, title, category, description, content
        FROM templates
        WHERE is_active = 1
        ORDER BY category, title
      `).all();
      
      return Response.json({ templates: templates.results });
    }

    // Enhanced notifications routes
    if (pathname === "/notifications" && request.method === "GET") {
      const userId = getCurrentUserId();
      const userTeam = await env.DB.prepare(`SELECT team_id FROM team_users WHERE user_id = ?`).bind(userId).first();
      const teamId = userTeam?.team_id || "team-123";

      const notifications = await env.DB.prepare(`
        SELECT id, title, message, type, priority, action_url, action_text, is_read, created_at
        FROM notifications
        WHERE (user_id = ? OR team_id = ? OR (user_id IS NULL AND team_id IS NULL))
        ORDER BY created_at DESC
        LIMIT 10
      `).bind(userId, teamId).all();

      return Response.json({ notifications: notifications.results });
    }

    if (pathname === "/notifications/mark-read" && request.method === "POST") {
      const userId = getCurrentUserId();
      const body = await request.json() as { notification_id: string };

      await env.DB.prepare(`
        UPDATE notifications 
        SET is_read = TRUE 
        WHERE id = ? AND (user_id = ? OR team_id IN (SELECT team_id FROM team_users WHERE user_id = ?))
      `).bind(body.notification_id, userId, userId).run();

      return Response.json({ success: true });
    }

    if (pathname === "/notifications/send" && request.method === "POST") {
      const userId = getCurrentUserId();
      const adminStatus = await isAdmin(env, userId);
      
      if (!adminStatus) {
        return new Response("Unauthorized", { status: 401 });
      }

      const body = await request.json() as {
        title: string;
        message: string;
        type?: string;
        priority?: string;
        action_url?: string;
        action_text?: string;
        user_id?: string;
        team_id?: string;
      };

      await env.DB.prepare(`
        INSERT INTO notifications 
        (id, title, message, type, priority, action_url, action_text, user_id, team_id, is_read, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE, CURRENT_TIMESTAMP)
      `).bind(
        crypto.randomUUID(),
        body.title,
        body.message,
        body.type || "info",
        body.priority || "normal",
        body.action_url || null,
        body.action_text || null,
        body.user_id || null,
        body.team_id || null
      ).run();

      return Response.json({ success: true });
    }

    // Analytics routes
    if (pathname === "/analytics/overview" && request.method === "GET") {
      const userId = getCurrentUserId();
      const userTeam = await env.DB.prepare(`SELECT team_id FROM team_users WHERE user_id = ?`).bind(userId).first();
      const teamId = userTeam?.team_id || "team-123";
      
      const dateRange = url.searchParams.get("range") || "30d";
      let dateFilter = "";
      
      switch (dateRange) {
        case "7d":
          dateFilter = "AND created_at > datetime('now', '-7 days')";
          break;
        case "30d":
          dateFilter = "AND created_at > datetime('now', '-30 days')";
          break;
        case "all":
        default:
          dateFilter = "";
          break;
      }

      // Get plays created
      const playsResult = await env.DB.prepare(`
        SELECT COUNT(*) as count FROM plays 
        WHERE team_id = ? ${dateFilter}
      `).bind(teamId).first();
      const playsCreated = playsResult?.count as number || 0;

      // Get signals logged
      const signalsResult = await env.DB.prepare(`
        SELECT COUNT(*) as count FROM signals s
        JOIN plays p ON s.play_id = p.id
        WHERE p.team_id = ? ${dateFilter}
      `).bind(teamId).first();
      const signalsLogged = signalsResult?.count as number || 0;

      // Get AI usage
      const aiUsageResult = await env.DB.prepare(`
        SELECT SUM(count) as total FROM ai_usage 
        WHERE team_id = ? ${dateFilter}
      `).bind(teamId).first();
      const aiUsageCount = aiUsageResult?.total as number || 0;

      // Get most active user
      const mostActiveResult = await env.DB.prepare(`
        SELECT 
          u.name,
          u.email,
          COUNT(DISTINCT p.id) as play_count,
          COUNT(DISTINCT s.id) as signal_count,
          COALESCE(SUM(au.count), 0) as ai_count
        FROM users u
        LEFT JOIN plays p ON u.id = p.id ${dateFilter ? "AND p.created_at > datetime('now', '-30 days')" : ""}
        LEFT JOIN signals s ON p.id = s.play_id ${dateFilter ? "AND s.created_at > datetime('now', '-30 days')" : ""}
        LEFT JOIN ai_usage au ON u.id = au.user_id ${dateFilter ? "AND au.updated_at > datetime('now', '-30 days')" : ""}
        WHERE u.id IN (SELECT user_id FROM team_users WHERE team_id = ?)
        GROUP BY u.id, u.name, u.email
        ORDER BY (play_count + signal_count + ai_count) DESC
        LIMIT 1
      `).bind(teamId).first();

      return Response.json({
        playsCreated,
        signalsLogged,
        aiUsageCount,
        mostActiveUser: mostActiveResult ? {
          name: mostActiveResult.name,
          email: mostActiveResult.email,
          activityScore: (mostActiveResult.play_count as number || 0) + 
                        (mostActiveResult.signal_count as number || 0) + 
                        (mostActiveResult.ai_count as number || 0)
        } : null,
        dateRange
      });
    }

    // Workshop routes
    if (pathname === "/workshop" && request.method === "GET") {
      const userId = getCurrentUserId();
      const userTeam = await env.DB.prepare(`SELECT team_id FROM team_users WHERE user_id = ?`).bind(userId).first();
      const teamId = userTeam?.team_id || "team-123";

      // Get workshop progress
      const progress = await env.DB.prepare(`
        SELECT step, status, data, started_at, completed_at
        FROM workshop_step_progress
        WHERE user_id = ? AND team_id = ?
        ORDER BY created_at ASC
      `).bind(userId, teamId).all();

      // Define workshop steps with metadata
      const steps = [
        {
          id: "goals",
          title: "Define Team Goals",
          description: "Set clear objectives for your marketing strategy",
          estimatedTime: "5-10 minutes",
          status: "pending"
        },
        {
          id: "plays",
          title: "Select Plays",
          description: "Choose from templates or create custom plays",
          estimatedTime: "10-15 minutes",
          status: "pending"
        },
        {
          id: "owners",
          title: "Assign Owners",
          description: "Assign team members to each play",
          estimatedTime: "5 minutes",
          status: "pending"
        },
        {
          id: "signals",
          title: "Set Signals to Track",
          description: "Define what signals to monitor for each play",
          estimatedTime: "10 minutes",
          status: "pending"
        },
        {
          id: "review",
          title: "Review & Confirm",
          description: "Review your setup and launch your plays",
          estimatedTime: "5 minutes",
          status: "pending"
        }
      ];

      // Update step statuses based on progress
      const progressMap = new Map(progress.results.map((p: any) => [p.step, p]));
      steps.forEach(step => {
        const stepProgress = progressMap.get(step.id);
        if (stepProgress) {
          step.status = stepProgress.status;
        }
      });

      return Response.json({ 
        steps,
        progress: progress.results,
        currentStep: steps.find(s => s.status === "pending")?.id || "review"
      });
    }

    if (pathname === "/workshop/progress" && request.method === "POST") {
      const userId = getCurrentUserId();
      const userTeam = await env.DB.prepare(`SELECT team_id FROM team_users WHERE user_id = ?`).bind(userId).first();
      const teamId = userTeam?.team_id || "team-123";
      
      const body = await request.json() as { 
        step: string; 
        status: string; 
        data?: string 
      };

      // Validate step
      const validSteps = ["goals", "plays", "owners", "signals", "review"];
      if (!validSteps.includes(body.step)) {
        return Response.json({ success: false, message: "Invalid step" }, { status: 400 });
      }

      // Validate status
      const validStatuses = ["pending", "in_progress", "completed"];
      if (!validStatuses.includes(body.status)) {
        return Response.json({ success: false, message: "Invalid status" }, { status: 400 });
      }

      // Update or insert progress
      const now = new Date().toISOString();
      const startedAt = body.status === "in_progress" ? now : null;
      const completedAt = body.status === "completed" ? now : null;

      await env.DB.prepare(`
        INSERT OR REPLACE INTO workshop_step_progress 
        (id, user_id, team_id, step, status, data, started_at, completed_at, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).bind(
        crypto.randomUUID(), 
        userId, 
        teamId, 
        body.step, 
        body.status, 
        body.data || null,
        startedAt,
        completedAt
      ).run();

      // Log analytics event
      if (body.status === "completed") {
        await env.DB.prepare(`
          INSERT INTO analytics_events (id, user_id, team_id, event_type, event_data)
          VALUES (?, ?, ?, ?, ?)
        `).bind(
          crypto.randomUUID(),
          userId,
          teamId,
          "workshop_step_completed",
          JSON.stringify({ step: body.step })
        ).run();
      }

      return Response.json({ success: true });
    }

    // Workshop live collaboration routes
    if (pathname === "/workshop/presence" && request.method === "POST") {
      const userId = getCurrentUserId();
      const userTeam = await env.DB.prepare(`SELECT team_id FROM team_users WHERE user_id = ?`).bind(userId).first();
      const teamId = userTeam?.team_id || "team-123";
      
      const body = await request.json() as { current_step: string };
      
      // Update or insert presence
      await env.DB.prepare(`
        INSERT OR REPLACE INTO workshop_presence 
        (id, user_id, team_id, current_step, last_seen, is_active, created_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, TRUE, COALESCE((SELECT created_at FROM workshop_presence WHERE user_id = ? AND team_id = ?), CURRENT_TIMESTAMP))
      `).bind(
        crypto.randomUUID(),
        userId,
        teamId,
        body.current_step,
        userId,
        teamId
      ).run();

      return Response.json({ success: true });
    }

    if (pathname === "/workshop/presence" && request.method === "GET") {
      const userId = getCurrentUserId();
      const userTeam = await env.DB.prepare(`SELECT team_id FROM team_users WHERE user_id = ?`).bind(userId).first();
      const teamId = userTeam?.team_id || "team-123";

      // Get active users in workshop (active in last 5 minutes)
      const activeUsers = await env.DB.prepare(`
        SELECT 
          wp.user_id,
          wp.current_step,
          wp.last_seen,
          u.name,
          u.email
        FROM workshop_presence wp
        JOIN users u ON wp.user_id = u.id
        WHERE wp.team_id = ? 
        AND wp.is_active = TRUE
        AND wp.last_seen > datetime('now', '-5 minutes')
        ORDER BY wp.last_seen DESC
      `).bind(teamId).all();

      return Response.json({ activeUsers: activeUsers.results });
    }

    if (pathname === "/workshop/sync" && request.method === "GET") {
      const userId = getCurrentUserId();
      const userTeam = await env.DB.prepare(`SELECT team_id FROM team_users WHERE user_id = ?`).bind(userId).first();
      const teamId = userTeam?.team_id || "team-123";
      
      const lastSync = url.searchParams.get("since") || new Date(Date.now() - 30000).toISOString();

      // Get recent workshop updates
      const updates = await env.DB.prepare(`
        SELECT 
          step, status, data, started_at, completed_at, last_activity
        FROM workshop_step_progress
        WHERE team_id = ? 
        AND last_activity > ?
        ORDER BY last_activity DESC
      `).bind(teamId, lastSync).all();

      return Response.json({ updates: updates.results });
    }

    // Enhanced workshop progress with Slack notifications
    if (pathname === "/workshop/progress" && request.method === "POST") {
      const userId = getCurrentUserId();
      const userTeam = await env.DB.prepare(`SELECT team_id FROM team_users WHERE user_id = ?`).bind(userId).first();
      const teamId = (userTeam?.team_id as string) || "team-123";
      
      const body = await request.json() as { 
        step: string; 
        status: string; 
        data?: string 
      };

      // Validate step
      const validSteps = ["goals", "plays", "owners", "signals", "review"];
      if (!validSteps.includes(body.step)) {
        return Response.json({ success: false, message: "Invalid step" }, { status: 400 });
      }

      // Validate status
      const validStatuses = ["pending", "in_progress", "completed"];
      if (!validStatuses.includes(body.status)) {
        return Response.json({ success: false, message: "Invalid status" }, { status: 400 });
      }

      // Update or insert progress
      const now = new Date().toISOString();
      const startedAt = body.status === "in_progress" ? now : null;
      const completedAt = body.status === "completed" ? now : null;

      await env.DB.prepare(`
        INSERT OR REPLACE INTO workshop_step_progress 
        (id, user_id, team_id, step, status, data, started_at, completed_at, last_activity, is_active, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, TRUE, CURRENT_TIMESTAMP)
      `).bind(
        crypto.randomUUID(), 
        userId, 
        teamId, 
        body.step, 
        body.status, 
        body.data || null,
        startedAt,
        completedAt
      ).run();

      // Check if this is a major milestone for Slack notifications
      const isMajorMilestone = body.status === "completed" && 
        (body.step === "goals" || body.step === "plays" || body.step === "review");

      if (isMajorMilestone) {
        // Get notification settings
        const settings = await env.DB.prepare(`
          SELECT * FROM workshop_notification_settings WHERE team_id = ?
        `).bind(teamId).first();

        if (settings?.slack_enabled) {
          let shouldNotify = false;
          let message = "";

          if (body.step === "goals" && settings.notify_goals_completed) {
            shouldNotify = true;
            message = "🎯 Team goals have been set! Workshop is progressing well.";
          } else if (body.step === "plays" && settings.notify_plays_selected) {
            shouldNotify = true;
            message = "📋 Plays have been selected! Team is ready to assign owners.";
          } else if (body.step === "review" && settings.notify_workshop_completed) {
            shouldNotify = true;
            message = "🎉 Workshop completed! Your team is now ready to track signals.";
          }

          if (shouldNotify) {
            await sendSlackNotification(env, teamId, message);
            if (body.step === "review") {
              await sendZapierWebhook(env, teamId, "workshop_completed", {
                workshop_id: "workshop_" + teamId,
                workshop_name: "Team Workshop",
                completed_by_user_id: userId
              });
            }
          }
        }
      }

      // Log analytics event
      if (body.status === "completed") {
        await env.DB.prepare(`
          INSERT INTO analytics_events (id, user_id, team_id, event_type, event_data)
          VALUES (?, ?, ?, ?, ?)
        `).bind(
          crypto.randomUUID(),
          userId,
          teamId,
          "workshop_step_completed",
          JSON.stringify({ step: body.step })
        ).run();
      }

      return Response.json({ success: true });
    }

    // Premium analytics routes
    if (pathname === "/analytics/premium" && request.method === "GET") {
      const userId = getCurrentUserId();
      const isPremium = await isUserPremium(env, userId);
      
      if (!isPremium) {
        return Response.json({ error: "Premium access required" }, { status: 403 });
      }

      const userTeam = await env.DB.prepare(`SELECT team_id FROM team_users WHERE user_id = ?`).bind(userId).first();
      const teamId = userTeam?.team_id || "team-123";
      
      const dateRange = url.searchParams.get("range") || "30d";
      let dateFilter = "";
      
      switch (dateRange) {
        case "7d":
          dateFilter = "AND date >= date('now', '-7 days')";
          break;
        case "30d":
          dateFilter = "AND date >= date('now', '-30 days')";
          break;
        case "all":
        default:
          dateFilter = "";
          break;
      }

      // Get premium analytics data
      const analyticsData = await env.DB.prepare(`
        SELECT 
          date,
          ai_usage_count,
          signals_logged,
          plays_created,
          workshop_completions,
          mrr_amount
        FROM premium_analytics
        WHERE team_id = ? ${dateFilter}
        ORDER BY date ASC
      `).bind(teamId).all();

      // Calculate trends
      const data = analyticsData.results as any[];
      const totalAIUsage = data.reduce((sum, row) => sum + (row.ai_usage_count || 0), 0);
      const totalSignals = data.reduce((sum, row) => sum + (row.signals_logged || 0), 0);
      const totalPlays = data.reduce((sum, row) => sum + (row.plays_created || 0), 0);
      const totalWorkshops = data.reduce((sum, row) => sum + (row.workshop_completions || 0), 0);
      
      // Calculate MRR trend
      const mrrData = data.map(row => ({
        date: row.date,
        mrr: (row.mrr_amount || 0) / 100 // Convert cents to dollars
      }));

      // Get AI usage frequency (daily average)
      const aiUsageFrequency = data.length > 0 ? totalAIUsage / data.length : 0;

      return Response.json({
        analyticsData: data,
        summary: {
          totalAIUsage,
          totalSignals,
          totalPlays,
          totalWorkshops,
          aiUsageFrequency: Math.round(aiUsageFrequency * 10) / 10,
          mrrTrend: mrrData
        },
        dateRange
      });
    }

    // API key management routes
    if (pathname === "/api/keys" && request.method === "GET") {
      const userId = getCurrentUserId();
      const adminStatus = await isAdmin(env, userId);
      
      if (!adminStatus) {
        return new Response("Unauthorized", { status: 401 });
      }

      const userTeam = await env.DB.prepare(`SELECT team_id FROM team_users WHERE user_id = ?`).bind(userId).first();
      const teamId = userTeam?.team_id || "team-123";

      const apiKeys = await env.DB.prepare(`
        SELECT id, name, created_at, last_used_at, is_active
        FROM api_keys
        WHERE team_id = ?
        ORDER BY created_at DESC
      `).bind(teamId).all();

      return Response.json({ apiKeys: apiKeys.results });
    }

    if (pathname === "/api/keys" && request.method === "POST") {
      const userId = getCurrentUserId();
      const adminStatus = await isAdmin(env, userId);
      
      if (!adminStatus) {
        return new Response("Unauthorized", { status: 401 });
      }

      const userTeam = await env.DB.prepare(`SELECT team_id FROM team_users WHERE user_id = ?`).bind(userId).first();
      const teamId = userTeam?.team_id || "team-123";
      
      const body = await request.json() as { name: string; scopes?: string };
      
      // Generate API key
      const apiKey = `rk_${crypto.randomUUID().replace(/-/g, '')}`;
      const scopes = body.scopes || "read,write";

      await env.DB.prepare(`
        INSERT INTO api_keys (id, team_id, key, name, scopes, created_at, is_active)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, TRUE)
      `).bind(
        crypto.randomUUID(),
        teamId,
        apiKey,
        body.name,
        scopes
      ).run();

      return Response.json({ 
        success: true, 
        apiKey, // Only return the key once
        message: "API key created successfully. Store it securely - you won't see it again."
      });
    }

    if (pathname === "/api/keys/revoke" && request.method === "POST") {
      const userId = getCurrentUserId();
      const adminStatus = await isAdmin(env, userId);
      
      if (!adminStatus) {
        return new Response("Unauthorized", { status: 401 });
      }

      const body = await request.json() as { key_id: string };
      
      await env.DB.prepare(`
        UPDATE api_keys SET is_active = FALSE WHERE id = ?
      `).bind(body.key_id).run();

      return Response.json({ success: true });
    }

    // Public API routes with rate limiting
    if (pathname.startsWith("/api/plays") && request.method === "GET") {
      const apiKey = request.headers.get("Authorization")?.replace("Bearer ", "");
      
      if (!apiKey) {
        return Response.json({ error: "API key required" }, { status: 401 });
      }

      // Authenticate API key
      const auth = await authenticateApiKey(env, apiKey);
      if (!auth) {
        return Response.json({ error: "Invalid API key" }, { status: 401 });
      }

      // Check rate limits
      const rateLimitOk = await checkRateLimit(env, auth.teamId, "/api/plays");
      if (!rateLimitOk) {
        return Response.json({ 
          error: "Rate limit exceeded",
          reset: new Date(Date.now() + 60 * 60 * 1000).toISOString()
        }, { status: 429 });
      }

      // Get plays for the team
      const plays = await env.DB.prepare(`
        SELECT id, name, target_outcome, status, created_at
        FROM plays
        WHERE team_id = ?
        ORDER BY created_at DESC
      `).bind(auth.teamId).all();

      return addCorsHeaders(Response.json({ plays: plays.results }));
    }

    if (pathname.startsWith("/api/signals") && request.method === "GET") {
      const apiKey = request.headers.get("Authorization")?.replace("Bearer ", "");
      
      if (!apiKey) {
        return Response.json({ error: "API key required" }, { status: 401 });
      }

      // Authenticate API key
      const auth = await authenticateApiKey(env, apiKey);
      if (!auth) {
        return Response.json({ error: "Invalid API key" }, { status: 401 });
      }

      // Check rate limits
      const rateLimitOk = await checkRateLimit(env, auth.teamId, "/api/signals");
      if (!rateLimitOk) {
        return Response.json({ 
          error: "Rate limit exceeded",
          reset: new Date(Date.now() + 60 * 60 * 1000).toISOString()
        }, { status: 429 });
      }

      // Get signals for the team
      const signals = await env.DB.prepare(`
        SELECT s.id, s.observation, s.meaning, s.action, s.created_at, p.name as play_name
        FROM signals s
        JOIN plays p ON s.play_id = p.id
        WHERE p.team_id = ?
        ORDER BY s.created_at DESC
      `).bind(auth.teamId).all();

      return addCorsHeaders(Response.json({ signals: signals.results }));
    }

    if (pathname.startsWith("/api/analytics") && request.method === "GET") {
      const apiKey = request.headers.get("Authorization")?.replace("Bearer ", "");
      
      if (!apiKey) {
        return Response.json({ error: "API key required" }, { status: 401 });
      }

      // Validate API key
      const keyHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(apiKey))
        .then(hash => Array.from(new Uint8Array(hash))
          .map(b => b.toString(16).padStart(2, '0'))
          .join(''));

      const apiKeyRecord = await env.DB.prepare(`
        SELECT ak.team_id, ak.is_active
        FROM api_keys ak
        WHERE ak.key_hash = ? AND ak.is_active = TRUE
      `).bind(keyHash).first();

      if (!apiKeyRecord) {
        return Response.json({ error: "Invalid API key" }, { status: 401 });
      }

      // Update last used
      await env.DB.prepare(`
        UPDATE api_keys SET last_used_at = CURRENT_TIMESTAMP WHERE key_hash = ?
      `).bind(keyHash).run();

      // Get basic analytics for the team
      const playsCount = await env.DB.prepare(`
        SELECT COUNT(*) as count FROM plays WHERE team_id = ?
      `).bind(apiKeyRecord.team_id).first();

      const signalsCount = await env.DB.prepare(`
        SELECT COUNT(*) as count FROM signals s
        JOIN plays p ON s.play_id = p.id
        WHERE p.team_id = ?
      `).bind(apiKeyRecord.team_id).first();

      const aiUsageCount = await env.DB.prepare(`
        SELECT SUM(count) as total FROM ai_usage WHERE team_id = ?
      `).bind(apiKeyRecord.team_id).first();

      return addCorsHeaders(Response.json({
        analytics: {
          totalPlays: playsCount?.count || 0,
          totalSignals: signalsCount?.count || 0,
          totalAIUsage: aiUsageCount?.total || 0
        }
      }));
    }

    // Workshop notification settings
    if (pathname === "/workshop/notification-settings" && request.method === "GET") {
      const userId = getCurrentUserId();
      const userTeam = await env.DB.prepare(`SELECT team_id FROM team_users WHERE user_id = ?`).bind(userId).first();
      const teamId = userTeam?.team_id || "team-123";

      const settings = await env.DB.prepare(`
        SELECT * FROM workshop_notification_settings WHERE team_id = ?
      `).bind(teamId).first();

      return Response.json({ settings: settings || {} });
    }

    if (pathname === "/workshop/notification-settings" && request.method === "POST") {
      const userId = getCurrentUserId();
      const adminStatus = await isAdmin(env, userId);
      
      if (!adminStatus) {
        return new Response("Unauthorized", { status: 401 });
      }

      const userTeam = await env.DB.prepare(`SELECT team_id FROM team_users WHERE user_id = ?`).bind(userId).first();
      const teamId = userTeam?.team_id || "team-123";
      
      const body = await request.json() as {
        slack_enabled: boolean;
        notify_goals_completed: boolean;
        notify_plays_selected: boolean;
        notify_workshop_completed: boolean;
      };

      await env.DB.prepare(`
        INSERT OR REPLACE INTO workshop_notification_settings 
        (id, team_id, slack_enabled, notify_goals_completed, notify_plays_selected, notify_workshop_completed, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).bind(
        crypto.randomUUID(),
        teamId,
        body.slack_enabled,
        body.notify_goals_completed,
        body.notify_plays_selected,
        body.notify_workshop_completed
      ).run();

      return Response.json({ success: true });
    }

    // Slack 2-way sync routes
    if (pathname === "/slack/webhook" && request.method === "POST") {
      const body = await request.json() as any;
      
      // Handle Slack Events API challenge
      if (body.type === "url_verification") {
        return Response.json({ challenge: body.challenge });
      }

      // Handle Slack events
      if (body.type === "event_callback") {
        const event = body.event;
        const teamId = body.team_id;
        
        // Store event for processing
        await env.DB.prepare(`
          INSERT INTO slack_events (id, team_id, event_type, event_data)
          VALUES (?, ?, ?, ?)
        `).bind(
          crypto.randomUUID(),
          teamId,
          event.type,
          JSON.stringify(event)
        ).run();

        // Process keyword detection
        if (event.type === "message" && event.text) {
          const keywords = ["#signal", "#play", "#ai", "#analytics"];
          const text = event.text.toLowerCase();
          
          for (const keyword of keywords) {
            if (text.includes(keyword)) {
              // Parse command
              const command = parseSlackCommand(event.text, keyword);
              if (command) {
                await processSlackCommand(env, teamId, command, event.user);
              }
            }
          }
        }

        return Response.json({ success: true });
      }

      return Response.json({ success: true });
    }

    // Slack sync settings
    if (pathname === "/slack/sync-settings" && request.method === "GET") {
      const userId = getCurrentUserId();
      const userTeam = await env.DB.prepare(`SELECT team_id FROM team_users WHERE user_id = ?`).bind(userId).first();
      const teamId = userTeam?.team_id || "team-123";

      const settings = await env.DB.prepare(`
        SELECT two_way_sync_enabled, last_sync_at, last_event_received, sync_status, keywords_enabled
        FROM slack_settings WHERE team_id = ?
      `).bind(teamId).first();

      return Response.json({ settings: settings || {} });
    }

    if (pathname === "/slack/sync-settings" && request.method === "POST") {
      const userId = getCurrentUserId();
      const adminStatus = await isAdmin(env, userId);
      
      if (!adminStatus) {
        return new Response("Unauthorized", { status: 401 });
      }

      const userTeam = await env.DB.prepare(`SELECT team_id FROM team_users WHERE user_id = ?`).bind(userId).first();
      const teamId = userTeam?.team_id || "team-123";
      
      const body = await request.json() as {
        two_way_sync_enabled: boolean;
        keywords_enabled: string;
      };

      await env.DB.prepare(`
        UPDATE slack_settings 
        SET two_way_sync_enabled = ?, keywords_enabled = ?, sync_status = ?, last_sync_at = CURRENT_TIMESTAMP
        WHERE team_id = ?
      `).bind(
        body.two_way_sync_enabled,
        body.keywords_enabled,
        body.two_way_sync_enabled ? 'connected' : 'disconnected',
        teamId
      ).run();

      return Response.json({ success: true });
    }

    // Slack events log
    if (pathname === "/slack/events" && request.method === "GET") {
      const userId = getCurrentUserId();
      const adminStatus = await isAdmin(env, userId);
      
      if (!adminStatus) {
        return new Response("Unauthorized", { status: 401 });
      }

      const userTeam = await env.DB.prepare(`SELECT team_id FROM team_users WHERE user_id = ?`).bind(userId).first();
      const teamId = userTeam?.team_id || "team-123";

      const events = await env.DB.prepare(`
        SELECT id, event_type, event_data, processed, created_at
        FROM slack_events 
        WHERE team_id = ?
        ORDER BY created_at DESC
        LIMIT 50
      `).bind(teamId).all();

      return Response.json({ events: events.results });
    }

    // Enhanced analytics routes
    if (pathname === "/analytics/user-activity" && request.method === "GET") {
      const userId = getCurrentUserId();
      const userTeam = await env.DB.prepare(`SELECT team_id FROM team_users WHERE user_id = ?`).bind(userId).first();
      const teamId = userTeam?.team_id || "team-123";
      
      const { searchParams } = new URL(request.url);
      const targetUserId = searchParams.get("userId") || userId;
      const days = parseInt(searchParams.get("days") || "30");

      // Get user activity for specified period
      const userActivity = await env.DB.prepare(`
        SELECT date, plays_created, signals_logged, ai_interactions, workshop_steps_completed, api_calls
        FROM user_activity_summary 
        WHERE user_id = ? AND team_id = ? AND date >= date('now', '-${days} days')
        ORDER BY date ASC
      `).bind(targetUserId, teamId).all();

      // Get team average for comparison
      const teamAverage = await env.DB.prepare(`
        SELECT 
          AVG(plays_created) as avg_plays,
          AVG(signals_logged) as avg_signals,
          AVG(ai_interactions) as avg_ai,
          AVG(workshop_steps_completed) as avg_workshop,
          AVG(api_calls) as avg_api
        FROM user_activity_summary 
        WHERE team_id = ? AND date >= date('now', '-${days} days')
      `).bind(teamId).first();

      return Response.json({ 
        userActivity: userActivity.results,
        teamAverage: teamAverage
      });
    }

    if (pathname === "/analytics/play-performance" && request.method === "GET") {
      const userId = getCurrentUserId();
      const userTeam = await env.DB.prepare(`SELECT team_id FROM team_users WHERE user_id = ?`).bind(userId).first();
      const teamId = userTeam?.team_id || "team-123";
      
      const { searchParams } = new URL(request.url);
      const days = parseInt(searchParams.get("days") || "30");

      // Get play performance data
      const playPerformance = await env.DB.prepare(`
        SELECT 
          p.id, p.name, p.target_outcome,
          pp.outcome_achieved, pp.outcome_notes, pp.marked_at,
          u.name as marked_by_name
        FROM plays p
        LEFT JOIN play_performance pp ON p.id = pp.play_id
        LEFT JOIN users u ON pp.marked_by_user_id = u.id
        WHERE p.team_id = ? AND p.created_at >= date('now', '-${days} days')
        ORDER BY p.created_at DESC
      `).bind(teamId).all();

      return Response.json({ playPerformance: playPerformance.results });
    }

    if (pathname === "/analytics/premium-usage" && request.method === "GET") {
      const userId = getCurrentUserId();
      const userTeam = await env.DB.prepare(`SELECT team_id FROM team_users WHERE user_id = ?`).bind(userId).first();
      const teamId = userTeam?.team_id || "team-123";
      
      const { searchParams } = new URL(request.url);
      const days = parseInt(searchParams.get("days") || "30");

      // Get premium feature usage
      const premiumUsage = await env.DB.prepare(`
        SELECT date, ai_usage_count, workshop_completions, api_calls_count, premium_features_used
        FROM premium_feature_usage 
        WHERE team_id = ? AND date >= date('now', '-${days} days')
        ORDER BY date ASC
      `).bind(teamId).all();

      return Response.json({ premiumUsage: premiumUsage.results });
    }

    // Play outcome marking
    if (pathname === "/plays/outcome" && request.method === "POST") {
      const userId = getCurrentUserId();
      const body = await request.json() as {
        playId: string;
        outcomeAchieved: boolean;
        outcomeNotes?: string;
      };

      const userTeam = await env.DB.prepare(`SELECT team_id FROM team_users WHERE user_id = ?`).bind(userId).first();
      const teamId = userTeam?.team_id || "team-123";

      await env.DB.prepare(`
        INSERT OR REPLACE INTO play_performance 
        (id, play_id, team_id, outcome_achieved, outcome_notes, marked_by_user_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        crypto.randomUUID(),
        body.playId,
        teamId,
        body.outcomeAchieved,
        body.outcomeNotes || null,
        userId
      ).run();

      return Response.json({ success: true });
    }

    // Advanced API permissions routes
    if (pathname === "/api-keys/scopes" && request.method === "GET") {
      const userId = getCurrentUserId();
      const adminStatus = await isAdmin(env, userId);
      
      if (!adminStatus) {
        return new Response("Unauthorized", { status: 401 });
      }

      const userTeam = await env.DB.prepare(`SELECT team_id FROM team_users WHERE user_id = ?`).bind(userId).first();
      const teamId = userTeam?.team_id || "team-123";

      const apiKeys = await env.DB.prepare(`
        SELECT id, name, scopes, is_active, created_at, last_used_at
        FROM api_keys 
        WHERE team_id = ?
        ORDER BY created_at DESC
      `).bind(teamId).all();

      return Response.json({ apiKeys: apiKeys.results });
    }

    if (pathname === "/api-keys/scopes" && request.method === "POST") {
      const userId = getCurrentUserId();
      const adminStatus = await isAdmin(env, userId);
      
      if (!adminStatus) {
        return new Response("Unauthorized", { status: 401 });
      }

      const userTeam = await env.DB.prepare(`SELECT team_id FROM team_users WHERE user_id = ?`).bind(userId).first();
      const teamId = userTeam?.team_id || "team-123";
      
      const body = await request.json() as {
        keyId: string;
        scopes: string;
      };

      await env.DB.prepare(`
        UPDATE api_keys SET scopes = ? WHERE id = ? AND team_id = ?
      `).bind(body.scopes, body.keyId, teamId).run();

      return Response.json({ success: true });
    }

    if (pathname === "/api-keys/templates" && request.method === "GET") {
      return Response.json({
        templates: {
          "read-only": "read:plays,read:signals,read:analytics",
          "full-access": "read:plays,write:plays,read:signals,write:signals,read:analytics,write:analytics",
          "signals-only": "read:signals,write:signals",
          "analytics-only": "read:analytics"
        }
      });
    }

    // Admin export routes
    if (pathname === "/admin/export-audit-log" && request.method === "GET") {
      const userId = getCurrentUserId();
      const adminStatus = await isAdmin(env, userId);
      
      if (!adminStatus) {
        return new Response("Unauthorized", { status: 401 });
      }

      const { searchParams } = new URL(request.url);
      const format = searchParams.get("format") || "csv";
      const startDate = searchParams.get("startDate") || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = searchParams.get("endDate") || new Date().toISOString().split('T')[0];

      // Get audit log data
      const auditLog = await env.DB.prepare(`
        SELECT 
          al.id,
          al.action_type,
          al.action_details,
          al.created_at,
          u.name as admin_name,
          u.email as admin_email
        FROM admin_audit_log al
        LEFT JOIN users u ON al.admin_user_id = u.id
        WHERE al.created_at >= ? AND al.created_at <= ?
        ORDER BY al.created_at DESC
      `).bind(startDate, endDate).all();

      const data = auditLog.results as any[];
      
      if (format === "json") {
        const filename = `audit-log-${new Date().toISOString().split('T')[0]}.json`;
        return new Response(JSON.stringify({ auditLog: data }, null, 2), {
          headers: {
            "Content-Type": "application/json",
            "Content-Disposition": `attachment; filename="${filename}"`
          }
        });
      } else {
        // CSV format
        const csvHeaders = "ID,Action Type,Action Details,Admin Name,Admin Email,Created At\n";
        const csvRows = data.map(row => 
          `"${row.id}","${row.action_type}","${row.action_details?.replace(/"/g, '""') || ''}","${row.admin_name || ''}","${row.admin_email || ''}","${row.created_at}"`
        ).join('\n');
        
        const csvContent = csvHeaders + csvRows;
        const filename = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
        
        return new Response(csvContent, {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="${filename}"`
          }
        });
      }
    }

    if (pathname === "/admin/export-analytics" && request.method === "GET") {
      const userId = getCurrentUserId();
      const adminStatus = await isAdmin(env, userId);
      
      if (!adminStatus) {
        return new Response("Unauthorized", { status: 401 });
      }

      const { searchParams } = new URL(request.url);
      const format = searchParams.get("format") || "csv";
      const startDate = searchParams.get("startDate") || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = searchParams.get("endDate") || new Date().toISOString().split('T')[0];

      // Get analytics data
      const analytics = await env.DB.prepare(`
        SELECT 
          t.name as team_name,
          t.created_at as team_created,
          COUNT(DISTINCT p.id) as total_plays,
          COUNT(DISTINCT s.id) as total_signals,
          COUNT(DISTINCT u.id) as total_users,
          SUM(ai.count) as total_ai_usage,
          t.is_premium
        FROM teams t
        LEFT JOIN plays p ON t.id = p.team_id
        LEFT JOIN signals s ON p.id = s.play_id
        LEFT JOIN team_users tu ON t.id = tu.team_id
        LEFT JOIN users u ON tu.user_id = u.id
        LEFT JOIN ai_usage ai ON t.id = ai.team_id
        WHERE t.created_at >= ? AND t.created_at <= ?
        GROUP BY t.id, t.name, t.created_at, t.is_premium
        ORDER BY t.created_at DESC
      `).bind(startDate, endDate).all();

      const data = analytics.results as any[];
      
      if (format === "json") {
        const filename = `analytics-export-${new Date().toISOString().split('T')[0]}.json`;
        return new Response(JSON.stringify({ analytics: data }, null, 2), {
          headers: {
            "Content-Type": "application/json",
            "Content-Disposition": `attachment; filename="${filename}"`
          }
        });
      } else {
        // CSV format
        const csvHeaders = "Team Name,Team Created,Total Plays,Total Signals,Total Users,Total AI Usage,Premium\n";
        const csvRows = data.map(row => 
          `"${row.team_name || ''}","${row.team_created}","${row.total_plays || 0}","${row.total_signals || 0}","${row.total_users || 0}","${row.total_ai_usage || 0}","${row.is_premium ? 'Yes' : 'No'}"`
        ).join('\n');
        
        const csvContent = csvHeaders + csvRows;
        const filename = `analytics-export-${new Date().toISOString().split('T')[0]}.csv`;
        
        return new Response(csvContent, {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="${filename}"`
          }
        });
      }
    }

    // Stripe webhook handler
    if (pathname === "/stripe/webhook" && request.method === "POST") {
      const sig = request.headers.get("stripe-signature");
      const secret = env.STRIPE_WEBHOOK_SECRET;
      const rawBody = await request.text();
      let event: any = null;
      let verified = false;

      // Signature verification (manual, since no Stripe SDK)
      try {
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
          "raw",
          encoder.encode(secret),
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["verify"]
        );
        // Stripe signature format: t=timestamp,v1=signature
        if (!sig) throw new Error("Missing signature");
        const [tPart, v1Part] = sig.split(",");
        const timestamp = tPart.split("=")[1];
        const signature = v1Part.split("=")[1];
        const signedPayload = `${timestamp}.${rawBody}`;
        const signatureBytes = hexToBytes(signature);
        const valid = await crypto.subtle.verify(
          "HMAC",
          key,
          encoder.encode(signedPayload),
          signatureBytes
        );
        if (!valid) throw new Error("Invalid signature");
        verified = true;
      } catch (err) {
        return new Response("Invalid signature", { status: 400 });
      }

      try {
        event = JSON.parse(rawBody);
      } catch (err) {
        return new Response("Invalid payload", { status: 400 });
      }

      // Log event
      await env.DB.prepare(`
        INSERT INTO stripe_events (id, event_type, event_data, created_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      `).bind(
        crypto.randomUUID(),
        event.type,
        JSON.stringify(event)
      ).run();

      // Handle event types
      if (event.type === "invoice.payment_succeeded") {
        const customerId = event.data.object.customer;
        // Find team by Stripe customer ID
        const team = await env.DB.prepare(`SELECT id FROM teams WHERE stripe_customer_id = ?`).bind(customerId).first();
        if (team) {
          await env.DB.prepare(`UPDATE teams SET is_premium = 1, premium_grace_until = NULL WHERE id = ?`).bind(team.id).run();
        }
      } else if (event.type === "invoice.payment_failed") {
        const customerId = event.data.object.customer;
        const team = await env.DB.prepare(`SELECT id FROM teams WHERE stripe_customer_id = ?`).bind(customerId).first();
        if (team) {
          await env.DB.prepare(`UPDATE teams SET is_premium = 0, at_risk = 1 WHERE id = ?`).bind(team.id).run();
        }
      } else if (event.type === "customer.subscription.deleted") {
        const customerId = event.data.object.customer;
        const team = await env.DB.prepare(`SELECT id FROM teams WHERE stripe_customer_id = ?`).bind(customerId).first();
        if (team) {
          // Set 7-day grace period
          const graceUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
          await env.DB.prepare(`UPDATE teams SET is_premium = 0, premium_grace_until = ?, at_risk = 1 WHERE id = ?`).bind(graceUntil, team.id).run();
        }
      }

      return Response.json({ received: true });
    }

    // Admin: last 10 Stripe events
    if (pathname === "/admin/stripe-events" && request.method === "GET") {
      const userId = getCurrentUserId();
      const adminStatus = await isAdmin(env, userId);
      if (!adminStatus) {
        return new Response("Unauthorized", { status: 401 });
      }
      const events = await env.DB.prepare(`
        SELECT id, event_type, event_data, created_at
        FROM stripe_events
        ORDER BY created_at DESC
        LIMIT 10
      `).all();
      return Response.json({ events: events.results });
    }

    // Admin: List all team subscriptions
    if (pathname === "/admin/subscriptions" && request.method === "GET") {
      const userId = getCurrentUserId();
      const adminStatus = await isAdmin(env, userId);
      if (!adminStatus) {
        return new Response("Unauthorized", { status: 401 });
      }

      const subscriptions = await env.DB.prepare(`
        SELECT 
          t.id as team_id,
          t.name as team_name,
          t.billing_status,
          t.stripe_customer_id,
          t.created_at as team_created_at,
          COUNT(tu.user_id) as member_count
        FROM teams t
        LEFT JOIN team_users tu ON t.id = tu.team_id
        GROUP BY t.id
        ORDER BY t.created_at DESC
      `).all();

      return Response.json({ subscriptions: subscriptions.results });
    }

    // User onboarding status
    if (pathname === "/user/onboarding-status" && request.method === "GET") {
      const userId = getCurrentUserId();
      
      try {
        const user = await env.DB.prepare(`
          SELECT has_completed_onboarding FROM users WHERE id = ?
        `).bind(userId).first();
        
        return Response.json({ 
          hasCompletedTour: user?.has_completed_onboarding || false 
        });
      } catch (error) {
        console.error('Failed to get onboarding status:', error);
        return Response.json({ hasCompletedTour: false });
      }
    }

    if (pathname === "/user/complete-onboarding" && request.method === "POST") {
      const userId = getCurrentUserId();
      
      try {
        await env.DB.prepare(`
          UPDATE users SET has_completed_onboarding = TRUE WHERE id = ?
        `).bind(userId).run();
        
        return Response.json({ success: true });
      } catch (error) {
        console.error('Failed to complete onboarding:', error);
        return Response.json({ success: false }, { status: 500 });
      }
    }

    if (pathname === "/user/skip-onboarding" && request.method === "POST") {
      const userId = getCurrentUserId();
      
      try {
        await env.DB.prepare(`
          UPDATE users SET has_completed_onboarding = TRUE WHERE id = ?
        `).bind(userId).run();
        
        return Response.json({ success: true });
      } catch (error) {
        console.error('Failed to skip onboarding:', error);
        return Response.json({ success: false }, { status: 500 });
      }
    }

    // Admin: Update subscription
    if (pathname === "/admin/subscription/update" && request.method === "POST") {
      const userId = getCurrentUserId();
      const adminStatus = await isAdmin(env, userId);
      if (!adminStatus) {
        return new Response("Unauthorized", { status: 401 });
      }

      const body = await request.json() as {
        teamId: string;
        action: 'upgrade' | 'downgrade' | 'cancel' | 'resume';
        plan?: string;
      };

      try {
        const team = await env.DB.prepare(`
          SELECT billing_status, stripe_customer_id FROM teams WHERE id = ?
        `).bind(body.teamId).first();

        if (!team) {
          return Response.json({ success: false, message: "Team not found" }, { status: 404 });
        }

        let newStatus = team.billing_status;
        let message = "";

        switch (body.action) {
          case 'upgrade':
            newStatus = body.plan === 'pro' ? 'pro' : 'premium';
            message = `Upgraded to ${newStatus} plan`;
            break;
          case 'downgrade':
            newStatus = 'free';
            message = "Downgraded to free plan";
            break;
          case 'cancel':
            newStatus = 'cancelled';
            message = "Subscription cancelled";
            break;
          case 'resume':
            newStatus = team.billing_status === 'cancelled' ? 'premium' : team.billing_status;
            message = "Subscription resumed";
            break;
        }

        await env.DB.prepare(`
          UPDATE teams SET billing_status = ? WHERE id = ?
        `).bind(newStatus, body.teamId).run();

        // Update user premium status
        await env.DB.prepare(`
          UPDATE users SET is_premium = ? WHERE id IN (
            SELECT user_id FROM team_users WHERE team_id = ?
          )
        `).bind(newStatus !== 'free' ? 1 : 0, body.teamId).run();

        // Log admin action
        await env.DB.prepare(`
          INSERT INTO admin_actions (id, admin_id, action_type, target_type, target_id, details)
          VALUES (?, ?, ?, ?, ?, ?)
        `).bind(
          crypto.randomUUID(),
          userId,
          'subscription_update',
          'team',
          body.teamId,
          JSON.stringify({ action: body.action, oldStatus: team.billing_status, newStatus, message })
        ).run();

        return Response.json({ success: true, message });
      } catch (error) {
        console.error('Subscription update error:', error);
        return Response.json({ success: false, message: "Failed to update subscription" }, { status: 500 });
      }
    }

    // Changelog feed (public)
    if (pathname === "/changelog/feed" && request.method === "GET") {
      try {
        const entries = await env.DB.prepare(`
          SELECT id, title, description, category, created_at
          FROM changelog_entries
          ORDER BY created_at DESC
          LIMIT 20
        `).all();

        return Response.json({ entries: entries.results });
      } catch (error) {
        console.error('Failed to fetch changelog:', error);
        return Response.json({ entries: [] });
      }
    }

    // Admin: Create changelog entry
    if (pathname === "/admin/changelog" && request.method === "POST") {
      const userId = getCurrentUserId();
      const adminStatus = await isAdmin(env, userId);
      if (!adminStatus) {
        return new Response("Unauthorized", { status: 401 });
      }

      const body = await request.json() as {
        title: string;
        description: string;
        category: 'New Feature' | 'Improvement' | 'Bug Fix' | 'Security';
      };

      try {
        await env.DB.prepare(`
          INSERT INTO changelog_entries (id, title, description, category)
          VALUES (?, ?, ?, ?)
        `).bind(
          crypto.randomUUID(),
          body.title,
          body.description,
          body.category
        ).run();

        return Response.json({ success: true });
      } catch (error) {
        console.error('Failed to create changelog entry:', error);
        return Response.json({ success: false, message: "Failed to create changelog entry" }, { status: 500 });
      }
    }

    // Admin: Update changelog entry
    if (pathname === "/admin/changelog" && request.method === "PUT") {
      const userId = getCurrentUserId();
      const adminStatus = await isAdmin(env, userId);
      if (!adminStatus) {
        return new Response("Unauthorized", { status: 401 });
      }

      const body = await request.json() as {
        id: string;
        title: string;
        description: string;
        category: 'New Feature' | 'Improvement' | 'Bug Fix' | 'Security';
      };

      try {
        await env.DB.prepare(`
          UPDATE changelog_entries 
          SET title = ?, description = ?, category = ?
          WHERE id = ?
        `).bind(
          body.title,
          body.description,
          body.category,
          body.id
        ).run();

        return Response.json({ success: true });
      } catch (error) {
        console.error('Failed to update changelog entry:', error);
        return Response.json({ success: false, message: "Failed to update changelog entry" }, { status: 500 });
      }
    }

    // Admin: Delete changelog entry
    if (pathname === "/admin/changelog" && request.method === "DELETE") {
      const userId = getCurrentUserId();
      const adminStatus = await isAdmin(env, userId);
      if (!adminStatus) {
        return new Response("Unauthorized", { status: 401 });
      }

      const body = await request.json() as { id: string };

      try {
        await env.DB.prepare(`
          DELETE FROM changelog_entries WHERE id = ?
        `).bind(body.id).run();

        return Response.json({ success: true });
      } catch (error) {
        console.error('Failed to delete changelog entry:', error);
        return Response.json({ success: false, message: "Failed to delete changelog entry" }, { status: 500 });
      }
    }

    // Submit feedback
    if (pathname === "/feedback" && request.method === "POST") {
      const body = await request.json() as {
        message: string;
        category: 'Bug' | 'Feature Request' | 'General Feedback';
        anonymous?: boolean;
      };

      try {
        let userId: string | null = null;
        let teamId: string | null = null;

        // Try to get user info if not anonymous
        if (!body.anonymous) {
          try {
            userId = getCurrentUserId();
            const user = await env.DB.prepare(`
              SELECT team_id FROM team_users WHERE user_id = ? LIMIT 1
            `).bind(userId).first();
            teamId = user?.team_id as string | null || null;
          } catch (error) {
            // User not authenticated, treat as anonymous
            console.log('User not authenticated, treating feedback as anonymous');
          }
        }

        await env.DB.prepare(`
          INSERT INTO feedback_entries (id, user_id, team_id, message, category, anonymous)
          VALUES (?, ?, ?, ?, ?, ?)
        `).bind(
          crypto.randomUUID(),
          userId,
          teamId,
          body.message,
          body.category,
          body.anonymous || false
        ).run();

        return Response.json({ success: true });
      } catch (error) {
        console.error('Failed to submit feedback:', error);
        return Response.json({ success: false, message: "Failed to submit feedback" }, { status: 500 });
      }
    }

    // Admin: Get feedback entries
    if (pathname === "/admin/feedback" && request.method === "GET") {
      const userId = getCurrentUserId();
      const adminStatus = await isAdmin(env, userId);
      if (!adminStatus) {
        return new Response("Unauthorized", { status: 401 });
      }

      try {
        const feedback = await env.DB.prepare(`
          SELECT 
            fe.id,
            fe.message,
            fe.category,
            fe.anonymous,
            fe.created_at,
            u.name as user_name,
            u.email as user_email,
            t.name as team_name
          FROM feedback_entries fe
          LEFT JOIN users u ON fe.user_id = u.id
          LEFT JOIN teams t ON fe.team_id = t.id
          ORDER BY fe.created_at DESC
          LIMIT 100
        `).all();

        return Response.json({ feedback: feedback.results });
      } catch (error) {
        console.error('Failed to fetch feedback:', error);
        return Response.json({ feedback: [] });
      }
    }

    // Enterprise: Update custom domain
    if (pathname === "/enterprise/domain" && request.method === "POST") {
      const userId = getCurrentUserId();
      const adminStatus = await isAdmin(env, userId);
      if (!adminStatus) {
        return new Response("Unauthorized", { status: 401 });
      }

      const body = await request.json() as { customDomain: string };

      // Validate domain format
      const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      if (!domainRegex.test(body.customDomain)) {
        return Response.json({ success: false, message: "Invalid domain format" }, { status: 400 });
      }

      try {
        const userTeam = await env.DB.prepare(`SELECT team_id FROM team_users WHERE user_id = ?`).bind(userId).first();
        const teamId = userTeam?.team_id as string;

        if (!teamId) {
          return Response.json({ success: false, message: "Team not found" }, { status: 404 });
        }

        await env.DB.prepare(`
          UPDATE teams SET custom_domain = ? WHERE id = ?
        `).bind(body.customDomain, teamId).run();

        return Response.json({ 
          success: true, 
          message: "Custom domain updated. Please configure your DNS settings.",
          dnsInstructions: {
            type: "CNAME",
            name: body.customDomain,
            value: "rhythm90.io"
          }
        });
      } catch (error) {
        console.error('Failed to update custom domain:', error);
        return Response.json({ success: false, message: "Failed to update custom domain" }, { status: 500 });
      }
    }

    // Enterprise: Get SAML config
    if (pathname === "/enterprise/saml" && request.method === "GET") {
      const userId = getCurrentUserId();
      const adminStatus = await isAdmin(env, userId);
      if (!adminStatus) {
        return new Response("Unauthorized", { status: 401 });
      }

      try {
        const userTeam = await env.DB.prepare(`SELECT team_id FROM team_users WHERE user_id = ?`).bind(userId).first();
        const teamId = userTeam?.team_id as string;

        if (!teamId) {
          return Response.json({ success: false, message: "Team not found" }, { status: 404 });
        }

        const samlConfig = await env.DB.prepare(`
          SELECT * FROM saml_config WHERE team_id = ?
        `).bind(teamId).first();

        return Response.json({ 
          success: true, 
          samlConfig: samlConfig || null,
          status: "coming_soon"
        });
      } catch (error) {
        console.error('Failed to get SAML config:', error);
        return Response.json({ success: false, message: "Failed to get SAML config" }, { status: 500 });
      }
    }

    // Integrations: List available integrations
    if (pathname === "/integrations/list" && request.method === "GET") {
      const integrations = [
        {
          id: "slack",
          name: "Slack",
          description: "Connect your Slack workspace for real-time notifications and signal logging",
          status: "available",
          icon: "💬",
          connected: false
        },
        {
          id: "teams",
          name: "Microsoft Teams",
          description: "Integrate with Microsoft Teams for team collaboration",
          status: "coming_soon",
          icon: "🏢",
          connected: false
        },
        {
          id: "zapier",
          name: "Zapier",
          description: "Connect with 5000+ apps through Zapier automation",
          status: "beta",
          icon: "⚡",
          connected: false
        },
        {
          id: "hubspot",
          name: "HubSpot",
          description: "Sync marketing data and contacts with HubSpot CRM",
          status: "coming_soon",
          icon: "📊",
          connected: false
        },
        {
          id: "salesforce",
          name: "Salesforce",
          description: "Integrate with Salesforce for customer data and analytics",
          status: "coming_soon",
          icon: "☁️",
          connected: false
        }
      ];

      return Response.json({ integrations });
    }

    // Integrations: Connect integration (mock)
    if (pathname === "/integrations/connect" && request.method === "POST") {
      const userId = getCurrentUserId();
      const adminStatus = await isAdmin(env, userId);
      if (!adminStatus) {
        return new Response("Unauthorized", { status: 401 });
      }

      const body = await request.json() as { integrationId: string };

      // Mock connection - in real implementation, this would handle OAuth flow
      return Response.json({ 
        success: true, 
        message: `Successfully connected ${body.integrationId}`,
        connected: true
      });
    }

    // Referrals: Generate referral code
    if (pathname === "/referrals/generate" && request.method === "POST") {
      const userId = getCurrentUserId();
      
      try {
        // Generate unique referral code
        const referralCode = `REF${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        
        await env.DB.prepare(`
          UPDATE users SET referral_code = ? WHERE id = ?
        `).bind(referralCode, userId).run();

        return Response.json({ 
          success: true, 
          referralCode,
          referralLink: `https://rhythm90.io/ref/${referralCode}`
        });
      } catch (error) {
        console.error('Failed to generate referral code:', error);
        return Response.json({ success: false, message: "Failed to generate referral code" }, { status: 500 });
      }
    }

    // Referrals: Get user's referral stats
    if (pathname === "/referrals/stats" && request.method === "GET") {
      const userId = getCurrentUserId();
      
      try {
        const user = await env.DB.prepare(`
          SELECT referral_code FROM users WHERE id = ?
        `).bind(userId).first();

        const referrals = await env.DB.prepare(`
          SELECT COUNT(*) as total_referrals,
                 SUM(CASE WHEN reward_status = 'completed' THEN 1 ELSE 0 END) as completed_referrals,
                 SUM(CASE WHEN reward_status = 'pending' THEN 1 ELSE 0 END) as pending_referrals
          FROM referrals WHERE referrer_user_id = ?
        `).bind(userId).first();

        return Response.json({ 
          success: true, 
          referralCode: user?.referral_code || null,
          referralLink: user?.referral_code ? `https://rhythm90.io/ref/${user.referral_code}` : null,
          stats: {
            total: referrals?.total_referrals || 0,
            completed: referrals?.completed_referrals || 0,
            pending: referrals?.pending_referrals || 0
          }
        });
      } catch (error) {
        console.error('Failed to get referral stats:', error);
        return Response.json({ success: false, message: "Failed to get referral stats" }, { status: 500 });
      }
    }

    // Referrals: Process referral (when new user signs up with referral code)
    if (pathname === "/referrals/process" && request.method === "POST") {
      const body = await request.json() as { referralCode: string; userId: string };

      try {
        // Find referrer
        const referrer = await env.DB.prepare(`
          SELECT id FROM users WHERE referral_code = ?
        `).bind(body.referralCode).first();

        if (!referrer) {
          return Response.json({ success: false, message: "Invalid referral code" }, { status: 400 });
        }

        // Create referral record
        await env.DB.prepare(`
          INSERT INTO referrals (id, referrer_user_id, referred_user_id, referral_code, reward_status)
          VALUES (?, ?, ?, ?, ?)
        `).bind(
          crypto.randomUUID(),
          referrer.id,
          body.userId,
          body.referralCode,
          'pending'
        ).run();

        return Response.json({ 
          success: true, 
          message: "Referral processed successfully"
        });
      } catch (error) {
        console.error('Failed to process referral:', error);
        return Response.json({ success: false, message: "Failed to process referral" }, { status: 500 });
      }
    }

    // SAML SSO: Login route (mock)
    if (pathname === "/saml/login" && request.method === "GET") {
      const userId = getCurrentUserId();
      const adminStatus = await isAdmin(env, userId);
      if (!adminStatus) {
        return new Response("Unauthorized", { status: 401 });
      }

      try {
        // Mock SAML login - in real implementation, this would redirect to IdP
        const mockSamlResponse = {
          success: true,
          message: "Mock SAML login initiated",
          redirectUrl: `${appUrl}/saml/acs?mock=true&user=admin@example.com&name=Admin User`
        };

        return Response.json(mockSamlResponse);
      } catch (error) {
        console.error('Failed to initiate SAML login:', error);
        return Response.json({ success: false, message: "Failed to initiate SAML login" }, { status: 500 });
      }
    }

    // SAML SSO: ACS (Assertion Consumer Service) route (mock)
    if (pathname === "/saml/acs" && request.method === "POST") {
      try {
        const formData = await request.formData();
        const samlResponse = formData.get('SAMLResponse') as string;
        
        // Mock SAML response processing
        const mockUser = {
          id: "saml-user-123",
          email: "admin@example.com",
          name: "Admin User",
          provider: "saml"
        };

        // In real implementation, this would validate the SAML response
        return Response.json({ 
          success: true, 
          user: mockUser,
          message: "SAML authentication successful"
        });
      } catch (error) {
        console.error('Failed to process SAML response:', error);
        return Response.json({ success: false, message: "Failed to process SAML response" }, { status: 500 });
      }
    }

    // SAML SSO: Test connection
    if (pathname === "/saml/test" && request.method === "POST") {
      const userId = getCurrentUserId();
      const adminStatus = await isAdmin(env, userId);
      if (!adminStatus) {
        return new Response("Unauthorized", { status: 401 });
      }

      try {
        const userTeam = await env.DB.prepare(`SELECT team_id FROM team_users WHERE user_id = ?`).bind(userId).first();
        const teamId = userTeam?.team_id as string;

        if (!teamId) {
          return Response.json({ success: false, message: "Team not found" }, { status: 404 });
        }

        const samlConfig = await env.DB.prepare(`
          SELECT entity_id, acs_url, certificate FROM saml_config WHERE team_id = ?
        `).bind(teamId).first();

        if (!samlConfig) {
          return Response.json({ success: false, message: "SAML configuration not found" }, { status: 404 });
        }

        // Validate required fields
        const requiredFields = ['entity_id', 'acs_url', 'certificate'];
        const missingFields = requiredFields.filter(field => !samlConfig[field]);

        if (missingFields.length > 0) {
          return Response.json({ 
            success: false, 
            message: `Missing required fields: ${missingFields.join(', ')}` 
          }, { status: 400 });
        }

        return Response.json({ 
          success: true, 
          message: "SAML configuration is valid",
          config: {
            entityId: samlConfig.entity_id,
            acsUrl: samlConfig.acs_url,
            hasCertificate: !!samlConfig.certificate
          }
        });
      } catch (error) {
        console.error('Failed to test SAML connection:', error);
        return Response.json({ success: false, message: "Failed to test SAML connection" }, { status: 500 });
      }
    }

    // Slack OAuth: Connect
    if (pathname === "/integrations/slack/connect" && request.method === "GET") {
      const userId = getCurrentUserId();
      const adminStatus = await isAdmin(env, userId);
      if (!adminStatus) {
        return new Response("Unauthorized", { status: 401 });
      }

      try {
        const userTeam = await env.DB.prepare(`SELECT team_id FROM team_users WHERE user_id = ?`).bind(userId).first();
        const teamId = userTeam?.team_id as string;

        if (!teamId) {
          return Response.json({ success: false, message: "Team not found" }, { status: 404 });
        }

        // Check if already connected
        const existingIntegration = await env.DB.prepare(`
          SELECT * FROM integrations WHERE team_id = ? AND provider = 'slack' AND is_active = 1
        `).bind(teamId).first();

        if (existingIntegration) {
          return Response.json({ 
            success: false, 
            message: "Slack is already connected to this team" 
          }, { status: 400 });
        }

        // Build Slack OAuth URL
        const slackClientId = env.SLACK_CLIENT_ID || 'mock-client-id';
        const scopes = 'chat:write,channels:read,users:read';
        const redirectUri = `${appUrl}/integrations/slack/callback`;
        const state = crypto.randomUUID(); // For CSRF protection

        const slackAuthUrl = `https://slack.com/oauth/v2/authorize?client_id=${slackClientId}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;

        return Response.json({ 
          success: true, 
          authUrl: slackAuthUrl,
          state: state
        });
      } catch (error) {
        console.error('Failed to initiate Slack OAuth:', error);
        return Response.json({ success: false, message: "Failed to initiate Slack OAuth" }, { status: 500 });
      }
    }

    // Slack OAuth: Callback
    if (pathname === "/integrations/slack/callback" && request.method === "GET") {
      try {
        const url = new URL(request.url);
        const code = url.searchParams.get('code');
        const state = url.searchParams.get('state');
        const error = url.searchParams.get('error');

        if (error) {
          return Response.json({ success: false, message: `Slack OAuth error: ${error}` }, { status: 400 });
        }

        if (!code) {
          return Response.json({ success: false, message: "No authorization code received" }, { status: 400 });
        }

        // In real implementation, exchange code for access token
        // For now, mock the token exchange
        const mockTokenResponse = {
          access_token: 'mock-slack-token-' + crypto.randomUUID(),
          team_id: 'T' + Math.random().toString(36).substr(2, 8).toUpperCase(),
          team_name: 'Mock Slack Workspace',
          scope: 'chat:write,channels:read,users:read'
        };

        // Store the integration
        const userId = getCurrentUserId();
        const userTeam = await env.DB.prepare(`SELECT team_id FROM team_users WHERE user_id = ?`).bind(userId).first();
        const teamId = userTeam?.team_id as string;

        if (!teamId) {
          return Response.json({ success: false, message: "Team not found" }, { status: 404 });
        }

        await env.DB.prepare(`
          INSERT INTO integrations (id, team_id, provider, workspace_id, workspace_name, access_token, scopes, is_active)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          crypto.randomUUID(),
          teamId,
          'slack',
          mockTokenResponse.team_id,
          mockTokenResponse.team_name,
          mockTokenResponse.access_token,
          mockTokenResponse.scope,
          true
        ).run();

        return Response.json({ 
          success: true, 
          message: "Slack connected successfully",
          workspace: {
            id: mockTokenResponse.team_id,
            name: mockTokenResponse.team_name
          }
        });
      } catch (error) {
        console.error('Failed to process Slack OAuth callback:', error);
        return Response.json({ success: false, message: "Failed to process Slack OAuth callback" }, { status: 500 });
      }
    }

    // Slack OAuth: Get status
    if (pathname === "/integrations/slack/status" && request.method === "GET") {
      const userId = getCurrentUserId();
      const adminStatus = await isAdmin(env, userId);
      if (!adminStatus) {
        return new Response("Unauthorized", { status: 401 });
      }

      try {
        const userTeam = await env.DB.prepare(`SELECT team_id FROM team_users WHERE user_id = ?`).bind(userId).first();
        const teamId = userTeam?.team_id as string;

        if (!teamId) {
          return Response.json({ success: false, message: "Team not found" }, { status: 404 });
        }

        const integration = await env.DB.prepare(`
          SELECT workspace_id, workspace_name, scopes, connected_at 
          FROM integrations 
          WHERE team_id = ? AND provider = 'slack' AND is_active = 1
        `).bind(teamId).first();

        return Response.json({ 
          success: true, 
          connected: !!integration,
          workspace: integration ? {
            id: integration.workspace_id,
            name: integration.workspace_name,
            scopes: integration.scopes,
            connectedAt: integration.connected_at
          } : null
        });
      } catch (error) {
        console.error('Failed to get Slack status:', error);
        return Response.json({ success: false, message: "Failed to get Slack status" }, { status: 500 });
      }
    }

    // Slack OAuth: Disconnect
    if (pathname === "/integrations/slack/disconnect" && request.method === "POST") {
      const userId = getCurrentUserId();
      const adminStatus = await isAdmin(env, userId);
      if (!adminStatus) {
        return new Response("Unauthorized", { status: 401 });
      }

      try {
        const userTeam = await env.DB.prepare(`SELECT team_id FROM team_users WHERE user_id = ?`).bind(userId).first();
        const teamId = userTeam?.team_id as string;

        if (!teamId) {
          return Response.json({ success: false, message: "Team not found" }, { status: 404 });
        }

        await env.DB.prepare(`
          UPDATE integrations SET is_active = 0 WHERE team_id = ? AND provider = 'slack'
        `).bind(teamId).run();

        return Response.json({ 
          success: true, 
          message: "Slack disconnected successfully"
        });
      } catch (error) {
        console.error('Failed to disconnect Slack:', error);
        return Response.json({ success: false, message: "Failed to disconnect Slack" }, { status: 500 });
      }
    }

    // Growth Experiments: Get user's experiment assignments
    if (pathname === "/growth/experiments" && request.method === "GET") {
      const userId = getCurrentUserId();
      
      try {
        const experiments = await env.DB.prepare(`
          SELECT 
            ge.id,
            ge.name,
            ge.description,
            ge.variants,
            ea.variant
          FROM growth_experiments ge
          LEFT JOIN experiment_assignments ea ON ge.id = ea.experiment_id AND ea.user_id = ?
          WHERE ge.is_active = 1
        `).bind(userId).all();

        return Response.json({ 
          success: true, 
          experiments: experiments.results || []
        });
      } catch (error) {
        console.error('Failed to get experiments:', error);
        return Response.json({ success: false, message: "Failed to get experiments" }, { status: 500 });
      }
    }

    // Growth Experiments: Log event
    if (pathname === "/growth/experiments/event" && request.method === "POST") {
      const userId = getCurrentUserId();
      const body = await request.json() as { experimentId: string; eventType: string; eventData?: any };

      try {
        // Get user's assignment for this experiment
        const assignment = await env.DB.prepare(`
          SELECT variant, team_id FROM experiment_assignments 
          WHERE experiment_id = ? AND user_id = ?
        `).bind(body.experimentId, userId).first();

        if (!assignment) {
          return Response.json({ success: false, message: "User not assigned to this experiment" }, { status: 400 });
        }

        // Log the event
        await env.DB.prepare(`
          INSERT INTO experiment_events (id, experiment_id, user_id, team_id, variant, event_type, event_data)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(
          crypto.randomUUID(),
          body.experimentId,
          userId,
          assignment.team_id,
          assignment.variant,
          body.eventType,
          body.eventData ? JSON.stringify(body.eventData) : null
        ).run();

        return Response.json({ 
          success: true, 
          message: "Event logged successfully"
        });
      } catch (error) {
        console.error('Failed to log experiment event:', error);
        return Response.json({ success: false, message: "Failed to log experiment event" }, { status: 500 });
      }
    }

    // Microsoft Teams OAuth: Connect
    if (pathname === "/integrations/teams/connect" && request.method === "GET") {
      const userId = getCurrentUserId();
      const adminStatus = await isAdmin(env, userId);
      if (!adminStatus) {
        return new Response("Unauthorized", { status: 401 });
      }

      try {
        const userTeam = await env.DB.prepare(`SELECT team_id FROM team_users WHERE user_id = ?`).bind(userId).first();
        const teamId = userTeam?.team_id as string;

        if (!teamId) {
          return Response.json({ success: false, message: "Team not found" }, { status: 404 });
        }

        // Check if already connected
        const existingIntegration = await env.DB.prepare(`
          SELECT * FROM integrations WHERE team_id = ? AND provider = 'teams' AND is_active = 1
        `).bind(teamId).first();

        if (existingIntegration) {
          return Response.json({ 
            success: false, 
            message: "Microsoft Teams is already connected to this team" 
          }, { status: 400 });
        }

        // Build Microsoft OAuth URL
        const microsoftClientId = env.MICROSOFT_CLIENT_ID || 'mock-client-id';
        const scopes = 'User.Read,Team.ReadBasic.All,ChannelMessage.Read.All';
        const redirectUri = `${appUrl}/integrations/teams/callback`;
        const state = crypto.randomUUID(); // For CSRF protection

        const microsoftAuthUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${microsoftClientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&state=${state}`;

        return Response.json({ 
          success: true, 
          authUrl: microsoftAuthUrl,
          state: state
        });
      } catch (error) {
        console.error('Failed to initiate Microsoft Teams OAuth:', error);
        return Response.json({ success: false, message: "Failed to initiate Microsoft Teams OAuth" }, { status: 500 });
      }
    }

    // Microsoft Teams OAuth: Callback
    if (pathname === "/integrations/teams/callback" && request.method === "GET") {
      try {
        const url = new URL(request.url);
        const code = url.searchParams.get('code');
        const state = url.searchParams.get('state');
        const error = url.searchParams.get('error');

        if (error) {
          return Response.json({ success: false, message: `Microsoft OAuth error: ${error}` }, { status: 400 });
        }

        if (!code) {
          return Response.json({ success: false, message: "No authorization code received" }, { status: 400 });
        }

        // In real implementation, exchange code for access token
        // For now, mock the token exchange
        const mockTokenResponse = {
          access_token: 'mock-teams-token-' + crypto.randomUUID(),
          tenant_id: 'mock-tenant-' + Math.random().toString(36).substr(2, 8),
          team_name: 'Mock Microsoft Teams',
          scope: 'User.Read,Team.ReadBasic.All,ChannelMessage.Read.All'
        };

        // Store the integration
        const userId = getCurrentUserId();
        const userTeam = await env.DB.prepare(`SELECT team_id FROM team_users WHERE user_id = ?`).bind(userId).first();
        const teamId = userTeam?.team_id as string;

        if (!teamId) {
          return Response.json({ success: false, message: "Team not found" }, { status: 404 });
        }

        await env.DB.prepare(`
          INSERT INTO integrations (id, team_id, provider, workspace_id, workspace_name, access_token, scopes, is_active)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          crypto.randomUUID(),
          teamId,
          'teams',
          mockTokenResponse.tenant_id,
          mockTokenResponse.team_name,
          mockTokenResponse.access_token,
          mockTokenResponse.scope,
          true
        ).run();

        return Response.json({ 
          success: true, 
          message: "Microsoft Teams connected successfully",
          workspace: {
            id: mockTokenResponse.tenant_id,
            name: mockTokenResponse.team_name
          }
        });
      } catch (error) {
        console.error('Failed to process Microsoft Teams OAuth callback:', error);
        return Response.json({ success: false, message: "Failed to process Microsoft Teams OAuth callback" }, { status: 500 });
      }
    }

    // Microsoft Teams OAuth: Get status
    if (pathname === "/integrations/teams/status" && request.method === "GET") {
      const userId = getCurrentUserId();
      const adminStatus = await isAdmin(env, userId);
      if (!adminStatus) {
        return new Response("Unauthorized", { status: 401 });
      }

      try {
        const userTeam = await env.DB.prepare(`SELECT team_id FROM team_users WHERE user_id = ?`).bind(userId).first();
        const teamId = userTeam?.team_id as string;

        if (!teamId) {
          return Response.json({ success: false, message: "Team not found" }, { status: 404 });
        }

        const integration = await env.DB.prepare(`
          SELECT workspace_id, workspace_name, scopes, connected_at 
          FROM integrations 
          WHERE team_id = ? AND provider = 'teams' AND is_active = 1
        `).bind(teamId).first();

        return Response.json({ 
          success: true, 
          connected: !!integration,
          workspace: integration ? {
            id: integration.workspace_id,
            name: integration.workspace_name,
            scopes: integration.scopes,
            connectedAt: integration.connected_at
          } : null
        });
      } catch (error) {
        console.error('Failed to get Microsoft Teams status:', error);
        return Response.json({ success: false, message: "Failed to get Microsoft Teams status" }, { status: 500 });
      }
    }

    // Microsoft Teams OAuth: Disconnect
    if (pathname === "/integrations/teams/disconnect" && request.method === "POST") {
      const userId = getCurrentUserId();
      const adminStatus = await isAdmin(env, userId);
      if (!adminStatus) {
        return new Response("Unauthorized", { status: 401 });
      }

      try {
        const userTeam = await env.DB.prepare(`SELECT team_id FROM team_users WHERE user_id = ?`).bind(userId).first();
        const teamId = userTeam?.team_id as string;

        if (!teamId) {
          return Response.json({ success: false, message: "Team not found" }, { status: 404 });
        }

        await env.DB.prepare(`
          UPDATE integrations SET is_active = 0 WHERE team_id = ? AND provider = 'teams'
        `).bind(teamId).run();

        return Response.json({ 
          success: true, 
          message: "Microsoft Teams disconnected successfully"
        });
      } catch (error) {
        console.error('Failed to disconnect Microsoft Teams:', error);
        return Response.json({ success: false, message: "Failed to disconnect Microsoft Teams" }, { status: 500 });
      }
    }

    // Zapier: Create API key
    if (pathname === "/integrations/zapier/key" && request.method === "POST") {
      const userId = getCurrentUserId();
      const adminStatus = await isAdmin(env, userId);
      if (!adminStatus) {
        return new Response("Unauthorized", { status: 401 });
      }

      try {
        const userTeam = await env.DB.prepare(`SELECT team_id FROM team_users WHERE user_id = ?`).bind(userId).first();
        const teamId = userTeam?.team_id as string;

        if (!teamId) {
          return Response.json({ success: false, message: "Team not found" }, { status: 404 });
        }

        const body = await request.json() as { keyName: string };
        
        // Generate API key
        const apiKey = 'zapier_' + crypto.randomUUID().replace(/-/g, '');
        const hashedKey = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(apiKey))
          .then(hash => Array.from(new Uint8Array(hash))
            .map(b => b.toString(16).padStart(2, '0'))
            .join(''));

        await env.DB.prepare(`
          INSERT INTO zapier_api_keys (id, team_id, api_key, key_name, is_active)
          VALUES (?, ?, ?, ?, ?)
        `).bind(
          crypto.randomUUID(),
          teamId,
          hashedKey,
          body.keyName,
          true
        ).run();

        return Response.json({ 
          success: true, 
          message: "API key created successfully",
          apiKey: apiKey // Only return once
        });
      } catch (error) {
        console.error('Failed to create Zapier API key:', error);
        return Response.json({ success: false, message: "Failed to create API key" }, { status: 500 });
      }
    }

    // Zapier: List API keys
    if (pathname === "/integrations/zapier/keys" && request.method === "GET") {
      const userId = getCurrentUserId();
      const adminStatus = await isAdmin(env, userId);
      if (!adminStatus) {
        return new Response("Unauthorized", { status: 401 });
      }

      try {
        const userTeam = await env.DB.prepare(`SELECT team_id FROM team_users WHERE user_id = ?`).bind(userId).first();
        const teamId = userTeam?.team_id as string;

        if (!teamId) {
          return Response.json({ success: false, message: "Team not found" }, { status: 404 });
        }

        const keys = await env.DB.prepare(`
          SELECT id, key_name, is_active, created_at, last_used_at
          FROM zapier_api_keys 
          WHERE team_id = ?
          ORDER BY created_at DESC
        `).bind(teamId).all();

        return Response.json({ 
          success: true, 
          keys: keys.results || []
        });
      } catch (error) {
        console.error('Failed to get Zapier API keys:', error);
        return Response.json({ success: false, message: "Failed to get API keys" }, { status: 500 });
      }
    }

    // Zapier: Webhook endpoint
    if (pathname === "/integrations/zapier/hooks" && request.method === "POST") {
      try {
        const body = await request.json() as { apiKey: string; event: string; data: any };
        
        if (!body.apiKey) {
          return Response.json({ success: false, message: "API key required" }, { status: 401 });
        }

        // Hash the provided API key for comparison
        const hashedKey = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(body.apiKey))
          .then(hash => Array.from(new Uint8Array(hash))
            .map(b => b.toString(16).padStart(2, '0'))
            .join(''));

        // Find the API key
        const apiKeyRecord = await env.DB.prepare(`
          SELECT team_id, key_name, rate_limit_hourly, is_active
          FROM zapier_api_keys 
          WHERE api_key = ? AND is_active = 1
        `).bind(hashedKey).first();

        if (!apiKeyRecord) {
          return Response.json({ success: false, message: "Invalid API key" }, { status: 401 });
        }

        // Rate limiting check
        const hourlyRequests = await env.DB.prepare(`
          SELECT COUNT(*) as count 
          FROM zapier_webhook_logs 
          WHERE api_key = ? AND created_at > datetime('now', '-1 hour')
        `).bind(hashedKey).first();

        if (hourlyRequests && (hourlyRequests.count as number) >= ((apiKeyRecord.rate_limit_hourly as number) || 100)) {
          return Response.json({ success: false, message: "Rate limit exceeded" }, { status: 429 });
        }

        // Log the webhook
        const webhookId = crypto.randomUUID();
        await env.DB.prepare(`
          INSERT INTO zapier_webhook_logs (id, team_id, api_key, event_type, payload)
          VALUES (?, ?, ?, ?, ?)
        `).bind(
          webhookId,
          apiKeyRecord.team_id,
          hashedKey,
          body.event,
          JSON.stringify(body.data)
        ).run();

        // Update last used timestamp
        await env.DB.prepare(`
          UPDATE zapier_api_keys SET last_used_at = CURRENT_TIMESTAMP WHERE api_key = ?
        `).bind(hashedKey).run();

        return Response.json({ 
          success: true, 
          message: "Webhook received successfully",
          webhookId: webhookId
        });
      } catch (error) {
        console.error('Failed to process Zapier webhook:', error);
        return Response.json({ success: false, message: "Failed to process webhook" }, { status: 500 });
      }
    }

    // Zapier: Toggle outbound hooks
    if (pathname === "/integrations/zapier/outbound" && request.method === "POST") {
      const userId = getCurrentUserId();
      const adminStatus = await isAdmin(env, userId);
      if (!adminStatus) {
        return new Response("Unauthorized", { status: 401 });
      }

      try {
        const body = await request.json() as { enabled: boolean };
        const userTeam = await env.DB.prepare(`SELECT team_id FROM team_users WHERE user_id = ?`).bind(userId).first();
        const teamId = userTeam?.team_id as string;

        if (!teamId) {
          return Response.json({ success: false, message: "Team not found" }, { status: 404 });
        }

        await env.DB.prepare(`
          UPDATE zapier_api_keys SET outbound_enabled = ? WHERE team_id = ?
        `).bind(body.enabled, teamId).run();

        return Response.json({ 
          success: true, 
          message: body.enabled ? "Outbound hooks enabled" : "Outbound hooks disabled"
        });
      } catch (error) {
        console.error('Failed to toggle Zapier outbound hooks:', error);
        return Response.json({ success: false, message: "Failed to update outbound hooks" }, { status: 500 });
      }
    }

    // Zapier: Get outbound hooks status
    if (pathname === "/integrations/zapier/outbound" && request.method === "GET") {
      const userId = getCurrentUserId();
      const adminStatus = await isAdmin(env, userId);
      if (!adminStatus) {
        return new Response("Unauthorized", { status: 401 });
      }

      try {
        const userTeam = await env.DB.prepare(`SELECT team_id FROM team_users WHERE user_id = ?`).bind(userId).first();
        const teamId = userTeam?.team_id as string;

        if (!teamId) {
          return Response.json({ success: false, message: "Team not found" }, { status: 404 });
        }

        const result = await env.DB.prepare(`
          SELECT outbound_enabled FROM zapier_api_keys WHERE team_id = ? LIMIT 1
        `).bind(teamId).first();

        return Response.json({ 
          success: true, 
          outboundEnabled: result?.outbound_enabled || false
        });
      } catch (error) {
        console.error('Failed to get Zapier outbound hooks status:', error);
        return Response.json({ success: false, message: "Failed to get outbound hooks status" }, { status: 500 });
      }
    }

    // Feature Flags: Get team flags
    if (pathname === "/feature-flags" && request.method === "GET") {
      const userId = getCurrentUserId();
      
      try {
        const userTeam = await env.DB.prepare(`SELECT team_id FROM team_users WHERE user_id = ?`).bind(userId).first();
        const teamId = userTeam?.team_id as string;

        if (!teamId) {
          return Response.json({ success: false, message: "Team not found" }, { status: 404 });
        }

        const flags = await env.DB.prepare(`
          SELECT flag_name, is_enabled FROM feature_flags WHERE team_id = ?
        `).bind(teamId).all();

        const flagMap: Record<string, boolean> = {};
        (flags.results || []).forEach((flag: any) => {
          flagMap[flag.flag_name] = flag.is_enabled;
        });

        return Response.json({ 
          success: true, 
          flags: flagMap
        });
      } catch (error) {
        console.error('Failed to get feature flags:', error);
        return Response.json({ success: false, message: "Failed to get feature flags" }, { status: 500 });
      }
    }

    // Feature Flags: Update flag (admin only)
    if (pathname === "/feature-flags" && request.method === "POST") {
      const userId = getCurrentUserId();
      const adminStatus = await isAdmin(env, userId);
      if (!adminStatus) {
        return new Response("Unauthorized", { status: 401 });
      }

      try {
        const body = await request.json() as { teamId: string; flagName: string; isEnabled: boolean };
        
        const userTeam = await env.DB.prepare(`SELECT team_id FROM team_users WHERE user_id = ?`).bind(userId).first();
        const teamId = userTeam?.team_id as string;

        if (!teamId) {
          return Response.json({ success: false, message: "Team not found" }, { status: 404 });
        }

        // Upsert the feature flag
        await env.DB.prepare(`
          INSERT INTO feature_flags (id, team_id, flag_name, is_enabled, updated_at)
          VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(team_id, flag_name) DO UPDATE SET
            is_enabled = excluded.is_enabled,
            updated_at = CURRENT_TIMESTAMP
        `).bind(
          crypto.randomUUID(),
          teamId,
          body.flagName,
          body.isEnabled
        ).run();

        return Response.json({ 
          success: true, 
          message: "Feature flag updated successfully"
        });
      } catch (error) {
        console.error('Failed to update feature flag:', error);
        return Response.json({ success: false, message: "Failed to update feature flag" }, { status: 500 });
      }
    }

    // Growth Stats: Get experiment and referral statistics
    if (pathname === "/growth/stats" && request.method === "GET") {
      const userId = getCurrentUserId();
      const adminStatus = await isAdmin(env, userId);
      if (!adminStatus) {
        return new Response("Unauthorized", { status: 401 });
      }

      try {
        // Get referral stats (last 30 days)
        const referralStats = await env.DB.prepare(`
          SELECT 
            COUNT(*) as total_referrals,
            SUM(CASE WHEN reward_status = 'completed' THEN 1 ELSE 0 END) as completed_referrals,
            SUM(CASE WHEN reward_status = 'pending' THEN 1 ELSE 0 END) as pending_referrals
          FROM referrals 
          WHERE created_at > datetime('now', '-30 days')
        `).first();

        // Get active experiments
        const activeExperiments = await env.DB.prepare(`
          SELECT COUNT(*) as count FROM growth_experiments WHERE is_active = 1
        `).first();

        // Get top performing variants (last 30 days)
        const topVariants = await env.DB.prepare(`
          SELECT 
            variant,
            COUNT(*) as exposure_count,
            SUM(CASE WHEN event_type = 'interaction' THEN 1 ELSE 0 END) as interaction_count,
            SUM(CASE WHEN event_type = 'conversion' THEN 1 ELSE 0 END) as conversion_count
          FROM experiment_events 
          WHERE created_at > datetime('now', '-30 days')
          GROUP BY variant
          ORDER BY conversion_count DESC
          LIMIT 5
        `).all();

        return Response.json({ 
          success: true, 
          stats: {
            referrals: {
              total: referralStats?.total_referrals || 0,
              completed: referralStats?.completed_referrals || 0,
              pending: referralStats?.pending_referrals || 0
            },
            experiments: {
              active: activeExperiments?.count || 0,
              topVariants: topVariants.results || []
            }
          }
        });
      } catch (error) {
        console.error('Failed to get growth stats:', error);
        return Response.json({ success: false, message: "Failed to get growth stats" }, { status: 500 });
      }
    }

    // Growth Experiments: Assign or get variant for user
    if (pathname === "/experiments/assign" && request.method === "POST") {
      const userId = getCurrentUserId();
      const body = await request.json() as { experimentId: string };
      const experimentId = body.experimentId;
      if (!experimentId) {
        return Response.json({ success: false, message: "experimentId required" }, { status: 400 });
      }
      // Check for existing assignment
      let assignment = await env.DB.prepare(`
        SELECT variant FROM experiment_assignments WHERE experiment_id = ? AND user_id = ?
      `).bind(experimentId, userId).first();
      if (!assignment) {
        // Get experiment variants
        const experiment = await env.DB.prepare(`
          SELECT variants FROM growth_experiments WHERE id = ? AND is_active = 1
        `).bind(experimentId).first();
        if (!experiment) {
          return Response.json({ success: false, message: "Experiment not found" }, { status: 404 });
        }
        const variants = JSON.parse(experiment.variants || '["control"]');
        // Assign randomly
        const idx = Math.floor(Math.random() * variants.length);
        const variant = variants[idx];
        await env.DB.prepare(`
          INSERT INTO experiment_assignments (id, experiment_id, user_id, variant)
          VALUES (?, ?, ?, ?)
        `).bind(
          crypto.randomUUID(),
          experimentId,
          userId,
          variant
        ).run();
        assignment = { variant };
      }
      return Response.json({ success: true, variant: assignment.variant });
    }

    // Growth Experiments: Log event (exposure, interaction, conversion)
    if (pathname === "/experiments/event" && request.method === "POST") {
      const userId = getCurrentUserId();
      const body = await request.json() as { experimentId: string, variant: string, eventType: string, eventData?: any };
      if (!body.experimentId || !body.variant || !body.eventType) {
        return Response.json({ success: false, message: "experimentId, variant, and eventType required" }, { status: 400 });
      }
      // Get user's team
      const userTeam = await env.DB.prepare(`SELECT team_id FROM team_users WHERE user_id = ?`).bind(userId).first();
      const teamId = userTeam?.team_id;
      await env.DB.prepare(`
        INSERT INTO experiment_events (id, experiment_id, user_id, team_id, variant, event_type, event_data)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        crypto.randomUUID(),
        body.experimentId,
        userId,
        teamId,
        body.variant,
        body.eventType,
        body.eventData ? JSON.stringify(body.eventData) : null
      ).run();
      return Response.json({ success: true });
    }

    // Growth Experiments: Get metrics summary (admin only)
    if (pathname === "/experiments/metrics" && request.method === "GET") {
      const userId = getCurrentUserId();
      const adminStatus = await isAdmin(env, userId);
      if (!adminStatus) {
        return new Response("Unauthorized", { status: 401 });
      }
      // Summarize metrics for all experiments
      const metrics = await env.DB.prepare(`
        SELECT
          e.id as experiment_id,
          e.name,
          ea.variant,
          COUNT(DISTINCT CASE WHEN ev.event_type = 'exposure' THEN ev.user_id END) as exposures,
          COUNT(DISTINCT CASE WHEN ev.event_type = 'interaction' THEN ev.user_id END) as engagements,
          COUNT(DISTINCT CASE WHEN ev.event_type = 'conversion' THEN ev.user_id END) as conversions
        FROM growth_experiments e
        LEFT JOIN experiment_assignments ea ON ea.experiment_id = e.id
        LEFT JOIN experiment_events ev ON ev.experiment_id = e.id AND ev.variant = ea.variant AND ev.user_id = ea.user_id
        GROUP BY e.id, ea.variant
        ORDER BY e.created_at DESC
      `).all();
      return Response.json({ success: true, metrics: metrics.results || [] });
    }

    // Feature Announcements: Get latest active announcement for user
    if (pathname === "/announcements/latest" && request.method === "GET") {
      const userId = getCurrentUserId();
      // Get latest active announcement
      const announcement = await env.DB.prepare(`
        SELECT * FROM feature_announcements WHERE active = 1 ORDER BY created_at DESC LIMIT 1
      `).first();
      if (!announcement) return Response.json({ success: true, announcement: null });
      // Check if user has read it
      const read = await env.DB.prepare(`
        SELECT 1 FROM user_announcement_reads WHERE user_id = ? AND announcement_id = ?
      `).bind(userId, announcement.id).first();
      return Response.json({ success: true, announcement, read: !!read });
    }

    // Feature Announcements: Mark as read
    if (pathname === "/announcements/mark-read" && request.method === "POST") {
      const userId = getCurrentUserId();
      const body = await request.json() as { announcementId: string };
      if (!body.announcementId) return Response.json({ success: false, message: "announcementId required" }, { status: 400 });
      await env.DB.prepare(`
        INSERT OR IGNORE INTO user_announcement_reads (id, user_id, announcement_id, read_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      `).bind(
        crypto.randomUUID(),
        userId,
        body.announcementId
      ).run();
      return Response.json({ success: true });
    }

    // Admin: List all announcements
    if (pathname === "/admin/announcements" && request.method === "GET") {
      const userId = getCurrentUserId();
      const adminStatus = await isAdmin(env, userId);
      if (!adminStatus) return new Response("Unauthorized", { status: 401 });
      const rows = await env.DB.prepare(`SELECT * FROM feature_announcements ORDER BY created_at DESC`).all();
      return Response.json({ success: true, announcements: rows.results || [] });
    }

    // Admin: Create or update announcement
    if (pathname === "/admin/announcements" && request.method === "POST") {
      const userId = getCurrentUserId();
      const adminStatus = await isAdmin(env, userId);
      if (!adminStatus) return new Response("Unauthorized", { status: 401 });
      const body = await request.json() as { id?: string, title: string, message: string, link?: string, type: string, active: boolean };
      if (!body.title || !body.message || !body.type) return Response.json({ success: false, message: "Missing fields" }, { status: 400 });
      if (body.id) {
        // Update
        await env.DB.prepare(`
          UPDATE feature_announcements SET title = ?, message = ?, link = ?, type = ?, active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
        `).bind(
          body.title,
          body.message,
          body.link || null,
          body.type,
          body.active ? 1 : 0,
          body.id
        ).run();
      } else {
        // Create
        await env.DB.prepare(`
          INSERT INTO feature_announcements (id, title, message, link, type, active, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `).bind(
          crypto.randomUUID(),
          body.title,
          body.message,
          body.link || null,
          body.type,
          body.active ? 1 : 0
        ).run();
      }
      return Response.json({ success: true });
    }

    // Admin: Preview announcement (no DB write)
    if (pathname === "/admin/announcements/preview" && request.method === "POST") {
      const userId = getCurrentUserId();
      const adminStatus = await isAdmin(env, userId);
      if (!adminStatus) return new Response("Unauthorized", { status: 401 });
      const body = await request.json() as { title: string, message: string, link?: string, type: string };
      return Response.json({ success: true, preview: { ...body, created_at: new Date().toISOString() } });
    }

    // Logout endpoint
    if (pathname === "/auth/logout" && request.method === "POST") {
      // Clear session cookie (and JWT if used in future)
      const headers = new Headers();
      headers.set("Set-Cookie", "session=; Path=/; HttpOnly; Secure; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Domain=.rhythm90.io");
      headers.set("Location", "/");
      return new Response(null, { status: 302, headers });
    }

    // Admin: List all users with linked providers
    if (pathname === "/admin/users" && request.method === "GET") {
      const userId = getCurrentUserId();
      const adminStatus = await isAdmin(env, userId);
      if (!adminStatus) {
        return new Response("Unauthorized", { status: 401 });
      }
      // Get all users
      const users = await env.DB.prepare(`SELECT id, email, name, role, is_premium, created_at FROM users`).all();
      // For each user, get linked providers
      const usersWithProviders = await Promise.all(users.results.map(async (user: any) => {
        const providers = await env.DB.prepare(`SELECT provider FROM oauth_providers WHERE user_id = ?`).bind(user.id).all();
        return {
          ...user,
          providers: providers.results.map((p: any) => p.provider)
        };
      }));
      return Response.json({ users: usersWithProviders });
    }

    return new Response("Not Found", { status: 404 });
  },
};

// Helper function to send Slack notifications
async function sendSlackNotification(env: Env, teamId: string, message: string) {
  try {
    const settings = await env.DB.prepare(`SELECT webhook_url FROM slack_settings WHERE team_id = ? AND is_active = 1`).bind(teamId).first();
    
    if (settings?.webhook_url && typeof settings.webhook_url === 'string') {
      await fetch(settings.webhook_url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: message })
      });
    }
  } catch (error) {
    console.error("Failed to send Slack notification:", error);
    // Don't throw - webhook failures shouldn't break the main flow
  }
}

// Helper function to send Zapier outbound webhooks
async function sendZapierWebhook(env: Env, teamId: string, event: string, data: any) {
  try {
    // Check if outbound hooks are enabled for this team
    const zapierConfig = await env.DB.prepare(`
      SELECT api_key, outbound_enabled 
      FROM zapier_api_keys 
      WHERE team_id = ? AND is_active = 1 AND outbound_enabled = 1
    `).bind(teamId).first();

    if (!zapierConfig?.outbound_enabled) {
      return; // Outbound hooks not enabled
    }

    // Get team info for the webhook payload
    const teamInfo = await env.DB.prepare(`
      SELECT name FROM teams WHERE id = ?
    `).bind(teamId).first();

    // Get user info if available
    const userInfo = await env.DB.prepare(`
      SELECT id, name FROM users WHERE id = ?
    `).bind(data.completed_by_user_id || data.user_id).first();

    // Prepare webhook payload
    const webhookPayload = {
      event: event,
      team_id: teamId,
      team_name: teamInfo?.name,
      completed_at: new Date().toISOString(),
      ...data
    };

    // For workshop completion, add specific fields
    if (event === "workshop_completed") {
      webhookPayload.workshop_id = data.workshop_id || "workshop_" + teamId;
      webhookPayload.workshop_name = data.workshop_name || "Team Workshop";
      webhookPayload.completed_by_user_id = userInfo?.id;
      webhookPayload.completed_by_user_name = userInfo?.name;
    }

    // Send webhook to Zapier (this would be configured in Zapier)
    // For now, we'll log it as a webhook log entry
    const webhookId = crypto.randomUUID();
    await env.DB.prepare(`
      INSERT INTO zapier_webhook_logs (id, team_id, api_key, event_type, payload, response_status, response_body)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      webhookId,
      teamId,
      zapierConfig.api_key,
      event,
      JSON.stringify(webhookPayload),
      200, // Mock successful response
      JSON.stringify({ success: true, message: "Webhook sent successfully" })
    ).run();

    console.log(`Zapier webhook sent for team ${teamId}, event: ${event}`);
  } catch (error) {
    console.error('Error sending Zapier webhook:', error);
    
    // Log the failed webhook
    try {
      const zapierConfig = await env.DB.prepare(`
        SELECT api_key FROM zapier_api_keys WHERE team_id = ? AND is_active = 1
      `).bind(teamId).first();

      if (zapierConfig) {
        await env.DB.prepare(`
          INSERT INTO zapier_webhook_logs (id, team_id, api_key, event_type, payload, response_status, response_body)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(
          crypto.randomUUID(),
          teamId,
          zapierConfig.api_key,
          event,
          JSON.stringify(data),
          500,
          JSON.stringify({ error: error.message })
        ).run();
      }
    } catch (logError) {
      console.error('Failed to log webhook error:', logError);
    }
  }
}

// Helper function to parse Slack commands
function parseSlackCommand(text: string, keyword: string): any {
  try {
    const parts = text.split(' ');
    const keywordIndex = parts.findIndex(part => part.toLowerCase() === keyword);
    
    if (keywordIndex === -1) return null;
    
    const command = parts[keywordIndex + 1];
    const args = parts.slice(keywordIndex + 2);
    
    // Handle quoted arguments
    const parsedArgs: string[] = [];
    let currentArg = '';
    let inQuotes = false;
    
    for (const arg of args) {
      if (arg.startsWith('"') && !inQuotes) {
        inQuotes = true;
        currentArg = arg.slice(1);
      } else if (arg.endsWith('"') && inQuotes) {
        inQuotes = false;
        currentArg += ' ' + arg.slice(0, -1);
        parsedArgs.push(currentArg.trim());
        currentArg = '';
      } else if (inQuotes) {
        currentArg += ' ' + arg;
      } else {
        parsedArgs.push(arg);
      }
    }
    
    // Handle unclosed quotes
    if (inQuotes && currentArg) {
      parsedArgs.push(currentArg.trim());
    }
    
    return {
      keyword,
      command,
      args: parsedArgs
    };
  } catch (error) {
    console.error("Error parsing Slack command:", error);
    return null;
  }
}

// Helper function to process Slack commands
async function processSlackCommand(env: Env, teamId: string, parsedCommand: any, userId: string) {
  try {
    const { keyword, command, args } = parsedCommand;
    
    if (keyword === "#signal") {
      if (command === "play-123" && args.length > 0) {
        const observation = args[0];
        
        // Create signal
        await env.DB.prepare(`
          INSERT INTO signals (id, play_id, observation, meaning, action)
          VALUES (?, ?, ?, ?, ?)
        `).bind(
          crypto.randomUUID(),
          "play-123",
          observation,
          "Signal detected from Slack",
          "Review and act on observation"
        ).run();
        
        // Send confirmation
        await sendSlackNotification(env, teamId, `✅ Signal logged: "${observation}" for play-123`);
      } else {
        await sendSlackNotification(env, teamId, `❌ Invalid signal command. Use: #signal play-123 "observation text"`);
      }
    } else if (keyword === "#play") {
      if (args.length >= 2) {
        const playName = args[0];
        const targetOutcome = args[1];
        
        // Create play
        await env.DB.prepare(`
          INSERT INTO plays (id, team_id, name, target_outcome, why_this_play, how_to_run, signals, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          crypto.randomUUID(),
          teamId,
          playName,
          targetOutcome,
          "Created via Slack command",
          "Define execution plan",
          "",
          "active"
        ).run();
        
        // Send confirmation
        await sendSlackNotification(env, teamId, `✅ Play created: "${playName}" with target: "${targetOutcome}"`);
      } else {
        await sendSlackNotification(env, teamId, `❌ Invalid play command. Use: #play "Play Name" "Target Outcome"`);
      }
    } else if (keyword === "#ai" || keyword === "#analytics") {
      await sendSlackNotification(env, teamId, `🔧 ${keyword} integration coming soon! Visit the dashboard for now.`);
    }
  } catch (error) {
    console.error("Error processing Slack command:", error);
    await sendSlackNotification(env, teamId, `❌ Error processing command. Please try again.`);
  }
}

// Helper for hex to bytes
function hexToBytes(hex: string): Uint8Array {
  if (!hex) return new Uint8Array();
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

    // ===== NEW CORE LOGGED-IN FEATURES =====

    // 1. Onboarding Status Endpoint
    if (pathname === "/api/onboarding-status" && request.method === "GET") {
      const userId = getCurrentUserId(request);
      if (!userId) {
        return jsonResponse({ error: "Unauthorized" }, 401);
      }

      try {
        const user = await env.DB.prepare(`
          SELECT 
            has_completed_profile,
            has_joined_team,
            has_created_play,
            has_logged_signal
          FROM users WHERE id = ?
        `).bind(userId).first();

        if (!user) {
          return jsonResponse({ error: "User not found" }, 404);
        }

        return jsonResponse({
          hasCompletedProfile: user.has_completed_profile || false,
          hasJoinedTeam: user.has_joined_team || false,
          hasCreatedPlay: user.has_created_play || false,
          hasLoggedSignal: user.has_logged_signal || false
        });
      } catch (error) {
        console.error("Error fetching onboarding status:", error);
        return jsonResponse({ error: "Failed to fetch onboarding status" }, 500);
      }
    }

    // 2. Team Creation Endpoint
    if (pathname === "/api/teams" && request.method === "POST") {
      const userId = getCurrentUserId(request);
      if (!userId) {
        return jsonResponse({ error: "Unauthorized" }, 401);
      }

      try {
        const body = await request.json() as { name: string };
        
        // Validation
        if (!body.name || body.name.length < 3 || body.name.length > 50) {
          return errorResponse("Team name must be between 3 and 50 characters", 400);
        }

        // Check for uniqueness per user
        const existingTeam = await env.DB.prepare(`
          SELECT t.id FROM teams t
          JOIN team_users tu ON t.id = tu.team_id
          WHERE tu.user_id = ? AND t.name = ?
        `).bind(userId, body.name).first();

        if (existingTeam) {
          return errorResponse("You already have a team with this name", 400);
        }

        // Create team
        const teamId = crypto.randomUUID();
        await env.DB.prepare(`
          INSERT INTO teams (id, name, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)
        `).bind(teamId, body.name).run();

        // Add user as owner
        await env.DB.prepare(`
          INSERT INTO team_users (team_id, user_id, role) VALUES (?, ?, 'owner')
        `).bind(teamId, userId).run();

        // Update user's current team and onboarding status
        await env.DB.prepare(`
          UPDATE users SET 
            current_team_id = ?,
            has_joined_team = TRUE
          WHERE id = ?
        `).bind(teamId, userId).run();

        return jsonResponse({ teamId });
      } catch (error) {
        console.error("Error creating team:", error);
        return jsonResponse({ error: "Failed to create team" }, 500);
      }
    }

    // 3. Get User's Teams Endpoint
    if (pathname === "/api/teams" && request.method === "GET") {
      const userId = getCurrentUserId(request);
      if (!userId) {
        return jsonResponse({ error: "Unauthorized" }, 401);
      }

      try {
        const teams = await env.DB.prepare(`
          SELECT 
            t.id,
            t.name,
            t.created_at,
            tu.role as user_role,
            (t.id = u.current_team_id) as is_current_team
          FROM teams t
          JOIN team_users tu ON t.id = tu.team_id
          JOIN users u ON u.id = ?
          WHERE tu.user_id = ?
          ORDER BY t.created_at DESC
        `).bind(userId, userId).all();

        return jsonResponse({ teams: teams.results });
      } catch (error) {
        console.error("Error fetching teams:", error);
        return jsonResponse({ error: "Failed to fetch teams" }, 500);
      }
    }

    // 4. Switch Team Endpoint
    if (pathname === "/api/teams/switch" && request.method === "POST") {
      const userId = getCurrentUserId(request);
      if (!userId) {
        return jsonResponse({ error: "Unauthorized" }, 401);
      }

      try {
        const body = await request.json() as { teamId: string };
        
        // Verify user belongs to this team
        const teamMembership = await env.DB.prepare(`
          SELECT team_id FROM team_users WHERE user_id = ? AND team_id = ?
        `).bind(userId, body.teamId).first();

        if (!teamMembership) {
          return errorResponse("You don't have access to this team", 403);
        }

        // Update current team
        await env.DB.prepare(`
          UPDATE users SET current_team_id = ? WHERE id = ?
        `).bind(body.teamId, userId).run();

        return jsonResponse({ success: true });
      } catch (error) {
        console.error("Error switching team:", error);
        return jsonResponse({ error: "Failed to switch team" }, 500);
      }
    }

    // 5. Create Play Endpoint
    if (pathname === "/api/plays" && request.method === "POST") {
      const userId = getCurrentUserId(request);
      if (!userId) {
        return jsonResponse({ error: "Unauthorized" }, 401);
      }

      try {
        const body = await request.json() as {
          name: string;
          targetOutcome: string;
          whyThisPlay: string;
          howToRun: string;
        };

        // Validation
        if (!body.name || body.name.length < 3) {
          return errorResponse("Play name must be at least 3 characters", 400);
        }

        // Get user's current team
        const user = await env.DB.prepare(`
          SELECT current_team_id FROM users WHERE id = ?
        `).bind(userId).first();

        if (!user?.current_team_id) {
          return errorResponse("No active team selected", 400);
        }

        // Create play
        const playId = crypto.randomUUID();
        await env.DB.prepare(`
          INSERT INTO plays (id, team_id, name, target_outcome, why_this_play, how_to_run, created_by, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `).bind(
          playId,
          user.current_team_id,
          body.name,
          body.targetOutcome,
          body.whyThisPlay,
          body.howToRun,
          userId
        ).run();

        // Update onboarding status
        await env.DB.prepare(`
          UPDATE users SET has_created_play = TRUE WHERE id = ?
        `).bind(userId).run();

        return jsonResponse({ playId });
      } catch (error) {
        console.error("Error creating play:", error);
        return jsonResponse({ error: "Failed to create play" }, 500);
      }
    }

    // 6. Create Signal Endpoint
    if (pathname === "/api/signals" && request.method === "POST") {
      const userId = getCurrentUserId(request);
      if (!userId) {
        return jsonResponse({ error: "Unauthorized" }, 401);
      }

      try {
        const body = await request.json() as {
          playId: string;
          description: string;
        };

        // Validation
        if (!body.description || body.description.length < 3) {
          return errorResponse("Signal description must be at least 3 characters", 400);
        }

        // Verify play exists and user has access
        const play = await env.DB.prepare(`
          SELECT p.id FROM plays p
          JOIN teams t ON p.team_id = t.id
          JOIN team_users tu ON t.id = tu.team_id
          WHERE p.id = ? AND tu.user_id = ?
        `).bind(body.playId, userId).first();

        if (!play) {
          return errorResponse("Play not found or access denied", 404);
        }

        // Create signal
        const signalId = crypto.randomUUID();
        await env.DB.prepare(`
          INSERT INTO signals (id, play_id, observation, created_by, created_at)
          VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        `).bind(signalId, body.playId, body.description, userId).run();

        // Update onboarding status
        await env.DB.prepare(`
          UPDATE users SET has_logged_signal = TRUE WHERE id = ?
        `).bind(userId).run();

        return jsonResponse({ signalId });
      } catch (error) {
        console.error("Error creating signal:", error);
        return jsonResponse({ error: "Failed to create signal" }, 500);
      }
    }

    // 7. Get Plays for Current Team
    if (pathname === "/api/plays" && request.method === "GET") {
      const userId = getCurrentUserId(request);
      if (!userId) {
        return jsonResponse({ error: "Unauthorized" }, 401);
      }

      try {
        const user = await env.DB.prepare(`
          SELECT current_team_id FROM users WHERE id = ?
        `).bind(userId).first();

        if (!user?.current_team_id) {
          return jsonResponse({ plays: [] });
        }

        const plays = await env.DB.prepare(`
          SELECT 
            id,
            name,
            target_outcome,
            why_this_play,
            how_to_run,
            created_at,
            created_by
          FROM plays 
          WHERE team_id = ?
          ORDER BY created_at DESC
        `).bind(user.current_team_id).all();

        return jsonResponse({ plays: plays.results });
      } catch (error) {
        console.error("Error fetching plays:", error);
        return jsonResponse({ error: "Failed to fetch plays" }, 500);
      }
    }

    // 8. Get Signals for Play
    if (pathname === "/api/signals" && request.method === "GET") {
      const userId = getCurrentUserId(request);
      if (!userId) {
        return jsonResponse({ error: "Unauthorized" }, 401);
      }

      const url = new URL(request.url);
      const playId = url.searchParams.get('playId');

      if (!playId) {
        return errorResponse("Play ID is required", 400);
      }

      try {
        // Verify user has access to this play
        const play = await env.DB.prepare(`
          SELECT p.id FROM plays p
          JOIN teams t ON p.team_id = t.id
          JOIN team_users tu ON t.id = tu.team_id
          WHERE p.id = ? AND tu.user_id = ?
        `).bind(playId, userId).first();

        if (!play) {
          return errorResponse("Play not found or access denied", 404);
        }

        const signals = await env.DB.prepare(`
          SELECT 
            id,
            observation,
            created_at,
            created_by
          FROM signals 
          WHERE play_id = ?
          ORDER BY created_at DESC
        `).bind(playId).all();

        return jsonResponse({ signals: signals.results });
      } catch (error) {
        console.error("Error fetching signals:", error);
        return jsonResponse({ error: "Failed to fetch signals" }, 500);
      }
    }

    // ===== ADMIN DASHBOARD ENDPOINTS =====

    // Admin: Get all users
    if (pathname === "/api/admin/users" && request.method === "GET") {
      const userId = getCurrentUserId(request);
      const adminStatus = await isAdmin(env, userId);
      if (!adminStatus) {
        return jsonResponse({ error: "Unauthorized" }, 401);
      }

      try {
        const users = await env.DB.prepare(`
          SELECT 
            u.id,
            u.email,
            u.name,
            u.role,
            u.is_premium,
            u.is_active,
            u.created_at,
            COUNT(DISTINCT p.id) as play_count,
            COUNT(DISTINCT s.id) as signal_count,
            COUNT(DISTINCT t.id) as team_count
          FROM users u
          LEFT JOIN plays p ON u.id = p.created_by
          LEFT JOIN signals s ON u.id = s.created_by
          LEFT JOIN team_users tu ON u.id = tu.user_id
          LEFT JOIN teams t ON tu.team_id = t.id
          GROUP BY u.id
          ORDER BY u.created_at DESC
        `).all();

        return jsonResponse({ users: users.results });
      } catch (error) {
        console.error("Error fetching users:", error);
        return jsonResponse({ error: "Failed to fetch users" }, 500);
      }
    }

    // Admin: Get all teams
    if (pathname === "/api/admin/teams" && request.method === "GET") {
      const userId = getCurrentUserId(request);
      const adminStatus = await isAdmin(env, userId);
      if (!adminStatus) {
        return jsonResponse({ error: "Unauthorized" }, 401);
      }

      try {
        const teams = await env.DB.prepare(`
          SELECT 
            t.id,
            t.name,
            t.is_premium,
            t.is_active,
            t.created_at,
            COUNT(DISTINCT p.id) as play_count,
            COUNT(DISTINCT s.id) as signal_count,
            COUNT(DISTINCT tu.user_id) as member_count,
            u.name as owner_name
          FROM teams t
          LEFT JOIN plays p ON t.id = p.team_id
          LEFT JOIN signals s ON p.id = s.play_id
          LEFT JOIN team_users tu ON t.id = tu.team_id
          LEFT JOIN team_users owner_tu ON t.id = owner_tu.team_id AND owner_tu.role = 'owner'
          LEFT JOIN users u ON owner_tu.user_id = u.id
          GROUP BY t.id
          ORDER BY t.created_at DESC
        `).all();

        return jsonResponse({ teams: teams.results });
      } catch (error) {
        console.error("Error fetching teams:", error);
        return jsonResponse({ error: "Failed to fetch teams" }, 500);
      }
    }

    // Admin: Get all plays
    if (pathname === "/api/admin/plays" && request.method === "GET") {
      const userId = getCurrentUserId(request);
      const adminStatus = await isAdmin(env, userId);
      if (!adminStatus) {
        return jsonResponse({ error: "Unauthorized" }, 401);
      }

      try {
        const plays = await env.DB.prepare(`
          SELECT 
            p.id,
            p.name,
            p.target_outcome,
            p.is_archived,
            p.created_at,
            t.name as team_name,
            u.name as creator_name,
            COUNT(s.id) as signal_count
          FROM plays p
          LEFT JOIN teams t ON p.team_id = t.id
          LEFT JOIN users u ON p.created_by = u.id
          LEFT JOIN signals s ON p.id = s.play_id
          GROUP BY p.id
          ORDER BY p.created_at DESC
        `).all();

        return jsonResponse({ plays: plays.results });
      } catch (error) {
        console.error("Error fetching plays:", error);
        return jsonResponse({ error: "Failed to fetch plays" }, 500);
      }
    }

    // Admin: Get all signals
    if (pathname === "/api/admin/signals" && request.method === "GET") {
      const userId = getCurrentUserId(request);
      const adminStatus = await isAdmin(env, userId);
      if (!adminStatus) {
        return jsonResponse({ error: "Unauthorized" }, 401);
      }

      try {
        const signals = await env.DB.prepare(`
          SELECT 
            s.id,
            s.observation,
            s.created_at,
            p.name as play_name,
            t.name as team_name,
            u.name as creator_name
          FROM signals s
          LEFT JOIN plays p ON s.play_id = p.id
          LEFT JOIN teams t ON p.team_id = t.id
          LEFT JOIN users u ON s.created_by = u.id
          ORDER BY s.created_at DESC
        `).all();

        return jsonResponse({ signals: signals.results });
      } catch (error) {
        console.error("Error fetching signals:", error);
        return jsonResponse({ error: "Failed to fetch signals" }, 500);
      }
    }

    // Admin: Deactivate/Reactivate User
    if (pathname === "/api/admin/users/toggle-status" && request.method === "POST") {
      const userId = getCurrentUserId(request);
      const adminStatus = await isAdmin(env, userId);
      if (!adminStatus) {
        return jsonResponse({ error: "Unauthorized" }, 401);
      }

      try {
        const body = await request.json() as { targetUserId: string; isActive: boolean };
        
        await env.DB.prepare(`
          UPDATE users SET is_active = ? WHERE id = ?
        `).bind(body.isActive, body.targetUserId).run();

        // Log admin action
        await env.DB.prepare(`
          INSERT INTO admin_audit_log (id, admin_user_id, action_type, target_type, target_id, details)
          VALUES (?, ?, ?, ?, ?, ?)
        `).bind(
          crypto.randomUUID(),
          userId,
          body.isActive ? 'user_reactivated' : 'user_deactivated',
          'user',
          body.targetUserId,
          JSON.stringify({ isActive: body.isActive })
        ).run();

        return jsonResponse({ success: true });
      } catch (error) {
        console.error("Error toggling user status:", error);
        return jsonResponse({ error: "Failed to update user status" }, 500);
      }
    }

    // Admin: Deactivate/Reactivate Team
    if (pathname === "/api/admin/teams/toggle-status" && request.method === "POST") {
      const userId = getCurrentUserId(request);
      const adminStatus = await isAdmin(env, userId);
      if (!adminStatus) {
        return jsonResponse({ error: "Unauthorized" }, 401);
      }

      try {
        const body = await request.json() as { teamId: string; isActive: boolean };
        
        await env.DB.prepare(`
          UPDATE teams SET is_active = ? WHERE id = ?
        `).bind(body.isActive, body.teamId).run();

        // Log admin action
        await env.DB.prepare(`
          INSERT INTO admin_audit_log (id, admin_user_id, action_type, target_type, target_id, details)
          VALUES (?, ?, ?, ?, ?, ?)
        `).bind(
          crypto.randomUUID(),
          userId,
          body.isActive ? 'team_reactivated' : 'team_deactivated',
          'team',
          body.teamId,
          JSON.stringify({ isActive: body.isActive })
        ).run();

        return jsonResponse({ success: true });
      } catch (error) {
        console.error("Error toggling team status:", error);
        return jsonResponse({ error: "Failed to update team status" }, 500);
      }
    }

    // Admin: Archive/Unarchive Play
    if (pathname === "/api/admin/plays/toggle-archive" && request.method === "POST") {
      const userId = getCurrentUserId(request);
      const adminStatus = await isAdmin(env, userId);
      if (!adminStatus) {
        return jsonResponse({ error: "Unauthorized" }, 401);
      }

      try {
        const body = await request.json() as { playId: string; isArchived: boolean };
        
        await env.DB.prepare(`
          UPDATE plays SET is_archived = ? WHERE id = ?
        `).bind(body.isArchived, body.playId).run();

        // Log admin action
        await env.DB.prepare(`
          INSERT INTO admin_audit_log (id, admin_user_id, action_type, target_type, target_id, details)
          VALUES (?, ?, ?, ?, ?, ?)
        `).bind(
          crypto.randomUUID(),
          userId,
          body.isArchived ? 'play_archived' : 'play_unarchived',
          'play',
          body.playId,
          JSON.stringify({ isArchived: body.isArchived })
        ).run();

        return jsonResponse({ success: true });
      } catch (error) {
        console.error("Error toggling play archive status:", error);
        return jsonResponse({ error: "Failed to update play status" }, 500);
      }
    }

    // Admin: Delete Signal
    if (pathname === "/api/admin/signals/delete" && request.method === "POST") {
      const userId = getCurrentUserId(request);
      const adminStatus = await isAdmin(env, userId);
      if (!adminStatus) {
        return jsonResponse({ error: "Unauthorized" }, 401);
      }

      try {
        const body = await request.json() as { signalId: string };
        
        await env.DB.prepare(`
          DELETE FROM signals WHERE id = ?
        `).bind(body.signalId).run();

        // Log admin action
        await env.DB.prepare(`
          INSERT INTO admin_audit_log (id, admin_user_id, action_type, target_type, target_id, details)
          VALUES (?, ?, ?, ?, ?, ?)
        `).bind(
          crypto.randomUUID(),
          userId,
          'signal_deleted',
          'signal',
          body.signalId,
          JSON.stringify({})
        ).run();

        return jsonResponse({ success: true });
      } catch (error) {
        console.error("Error deleting signal:", error);
        return jsonResponse({ error: "Failed to delete signal" }, 500);
      }
    }

    // Admin: Bulk Actions
    if (pathname === "/api/admin/bulk-actions" && request.method === "POST") {
      const userId = getCurrentUserId(request);
      const adminStatus = await isAdmin(env, userId);
      if (!adminStatus) {
        return jsonResponse({ error: "Unauthorized" }, 401);
      }

      try {
        const body = await request.json() as { 
          action: string; 
          targetType: string; 
          targetIds: string[]; 
          isActive?: boolean;
          isArchived?: boolean;
        };
        
        let query = '';
        let params: any[] = [];
        
        if (body.action === 'deactivate' && body.targetType === 'users') {
          query = `UPDATE users SET is_active = FALSE WHERE id IN (${body.targetIds.map(() => '?').join(',')})`;
          params = body.targetIds;
        } else if (body.action === 'activate' && body.targetType === 'users') {
          query = `UPDATE users SET is_active = TRUE WHERE id IN (${body.targetIds.map(() => '?').join(',')})`;
          params = body.targetIds;
        } else if (body.action === 'deactivate' && body.targetType === 'teams') {
          query = `UPDATE teams SET is_active = FALSE WHERE id IN (${body.targetIds.map(() => '?').join(',')})`;
          params = body.targetIds;
        } else if (body.action === 'activate' && body.targetType === 'teams') {
          query = `UPDATE teams SET is_active = TRUE WHERE id IN (${body.targetIds.map(() => '?').join(',')})`;
          params = body.targetIds;
        } else if (body.action === 'archive' && body.targetType === 'plays') {
          query = `UPDATE plays SET is_archived = TRUE WHERE id IN (${body.targetIds.map(() => '?').join(',')})`;
          params = body.targetIds;
        } else if (body.action === 'unarchive' && body.targetType === 'plays') {
          query = `UPDATE plays SET is_archived = FALSE WHERE id IN (${body.targetIds.map(() => '?').join(',')})`;
          params = body.targetIds;
        } else {
          return errorResponse("Invalid bulk action", 400);
        }

        await env.DB.prepare(query).bind(...params).run();

        // Log admin action
        await env.DB.prepare(`
          INSERT INTO admin_audit_log (id, admin_user_id, action_type, target_type, target_id, details)
          VALUES (?, ?, ?, ?, ?, ?)
        `).bind(
          crypto.randomUUID(),
          userId,
          `bulk_${body.action}`,
          body.targetType,
          body.targetIds.join(','),
          JSON.stringify({ count: body.targetIds.length, action: body.action })
        ).run();

        return jsonResponse({ success: true, updatedCount: body.targetIds.length });
      } catch (error) {
        console.error("Error performing bulk action:", error);
        return jsonResponse({ error: "Failed to perform bulk action" }, 500);
      }
    }

    // ===== ANALYTICS ENDPOINTS =====

    // Analytics: Get global analytics (admin only)
    if (pathname === "/api/analytics" && request.method === "GET") {
      const userId = getCurrentUserId(request);
      const adminStatus = await isAdmin(env, userId);
      
      try {
        let query = '';
        let params: any[] = [];
        
        if (adminStatus) {
          // Admin view - global analytics
          query = `
            SELECT 
              (SELECT COUNT(*) FROM users WHERE is_active = TRUE) as active_users,
              (SELECT COUNT(*) FROM plays WHERE is_archived = FALSE) as total_plays,
              (SELECT COUNT(*) FROM signals) as total_signals,
              (SELECT COUNT(*) FROM teams WHERE is_active = TRUE) as total_teams
          `;
        } else {
          // User view - team-specific analytics
          const user = await env.DB.prepare(`SELECT current_team_id FROM users WHERE id = ?`).bind(userId).first();
          if (!user?.current_team_id) {
            return jsonResponse({ 
              activeUsers: 0,
              totalPlays: 0,
              totalSignals: 0,
              topTeams: []
            });
          }
          
          query = `
            SELECT 
              (SELECT COUNT(*) FROM team_users WHERE team_id = ?) as active_users,
              (SELECT COUNT(*) FROM plays WHERE team_id = ? AND is_archived = FALSE) as total_plays,
              (SELECT COUNT(*) FROM signals s JOIN plays p ON s.play_id = p.id WHERE p.team_id = ?) as total_signals,
              (SELECT COUNT(*) FROM teams WHERE id = ?) as total_teams
          `;
          params = [user.current_team_id, user.current_team_id, user.current_team_id, user.current_team_id];
        }

        const analytics = await env.DB.prepare(query).bind(...params).first();

        // Get top teams (for admin view)
        let topTeams: any[] = [];
        if (adminStatus) {
          const teams = await env.DB.prepare(`
            SELECT 
              t.name,
              COUNT(DISTINCT p.id) as play_count,
              COUNT(DISTINCT s.id) as signal_count
            FROM teams t
            LEFT JOIN plays p ON t.id = p.team_id AND p.is_archived = FALSE
            LEFT JOIN signals s ON p.id = s.play_id
            WHERE t.is_active = TRUE
            GROUP BY t.id
            ORDER BY play_count DESC, signal_count DESC
            LIMIT 10
          `).all();
          topTeams = teams.results;
        }

        return jsonResponse({
          activeUsers: analytics?.active_users || 0,
          totalPlays: analytics?.total_plays || 0,
          totalSignals: analytics?.total_signals || 0,
          totalTeams: analytics?.total_teams || 0,
          topTeams
        });
      } catch (error) {
        console.error("Error fetching analytics:", error);
        return jsonResponse({ error: "Failed to fetch analytics" }, 500);
      }
    }

    // ===== PREMIUM FEATURE MIDDLEWARE =====

    // Helper function to check premium status
    async function checkPremiumAccess(env: Env, userId: string): Promise<boolean> {
      const user = await env.DB.prepare(`
        SELECT u.is_premium, t.is_premium as team_premium
        FROM users u
        LEFT JOIN team_users tu ON u.id = tu.user_id
        LEFT JOIN teams t ON tu.team_id = t.id
        WHERE u.id = ? AND u.current_team_id = t.id
      `).bind(userId).first();
      
      return user?.is_premium || user?.team_premium || false;
    }

    // ===== STRIPE BILLING INTEGRATION =====

    // Stripe webhook handler
    if (pathname === "/api/stripe/webhook" && request.method === "POST") {
      try {
        const body = await request.text();
        const signature = request.headers.get('stripe-signature');
        
        if (!signature) {
          return jsonResponse({ error: "No signature" }, 400);
        }

        // TODO: Implement signature verification
        let event: any;
        try {
          event = JSON.parse(body);
        } catch (err) {
          return jsonResponse({ error: "Invalid JSON" }, 400);
        }

        // Handle different event types
        switch (event.type) {
          case 'customer.subscription.created':
          case 'customer.subscription.updated': {
            const subscription = event.data.object;
            const teamId = subscription.metadata?.team_id;
            
            if (teamId) {
              await env.DB.prepare(`
                UPDATE teams SET is_premium = TRUE WHERE id = ?
              `).bind(teamId).run();
              
              await env.DB.prepare(`
                UPDATE users SET is_premium = TRUE 
                WHERE id IN (SELECT user_id FROM team_users WHERE team_id = ?)
              `).bind(teamId).run();
            }
            break;
          }
          
          case 'customer.subscription.deleted': {
            const subscription = event.data.object;
            const teamId = subscription.metadata?.team_id;
            
            if (teamId) {
              await env.DB.prepare(`
                UPDATE teams SET is_premium = FALSE WHERE id = ?
              `).bind(teamId).run();
              
              await env.DB.prepare(`
                UPDATE users SET is_premium = FALSE 
                WHERE id IN (SELECT user_id FROM team_users WHERE team_id = ?)
              `).bind(teamId).run();
            }
            break;
          }
        }

        return jsonResponse({ received: true });
      } catch (error) {
        console.error('Stripe webhook error:', error);
        return jsonResponse({ error: "Webhook processing failed" }, 500);
      }
    }

    // ===== PREMIUM FEATURE PROTECTION =====

    // AI Assistant - Premium only
    if (pathname === "/ai-signal" && request.method === "POST") {
      const userId = getCurrentUserId(request);
      if (!userId) {
        return jsonResponse({ error: "Unauthorized" }, 401);
      }

      const isPremium = await checkPremiumAccess(env, userId);
      if (!isPremium) {
        return jsonResponse({ 
          error: "Premium feature", 
          requiresPremium: true,
          message: "AI Assistant is a premium feature. Upgrade to access advanced AI capabilities."
        }, 403);
      }

      // Continue with existing AI logic...
    }

    if (pathname === "/ai-hypothesis" && request.method === "POST") {
      const userId = getCurrentUserId(request);
      if (!userId) {
        return jsonResponse({ error: "Unauthorized" }, 401);
      }

      const isPremium = await checkPremiumAccess(env, userId);
      if (!isPremium) {
        return jsonResponse({ 
          error: "Premium feature", 
          requiresPremium: true,
          message: "AI Hypothesis is a premium feature. Upgrade to access advanced AI capabilities."
        }, 403);
      }

      // Continue with existing AI logic...
    } 