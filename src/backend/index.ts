/// <reference types="@cloudflare/workers-types" />
// Stripe Node SDK import removed for Worker compatibility

export interface Env {
  DB: D1Database;
  OPENAI_API_KEY: string;
  APP_URL?: string;
  DEMO_MODE?: string;
  PREMIUM_MODE?: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
}

// Helper function to check if user is admin
async function isAdmin(env: Env, userId: string): Promise<boolean> {
  const user = await env.DB.prepare(`SELECT role FROM users WHERE id = ?`).bind(userId).first();
  return user?.role === 'admin';
}

// Helper function to get current user ID (for now, hardcoded - will be replaced with auth)
function getCurrentUserId(): string {
  return "admin-demo-123"; // Demo admin for now
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

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;
    const appUrl = env.APP_URL || "https://rhythm90.io";

    if (pathname === "/health") {
      return new Response(JSON.stringify({ status: "ok" }), { headers: { "Content-Type": "application/json" } });
    }

    // Demo mode check route
    if (pathname === "/demo/check" && request.method === "GET") {
      return Response.json({ isDemoMode: isDemoMode(env) });
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
      
      return Response.json({ success: true, user: demoUser, demo: true });
    }

    // User settings routes
    if (pathname === "/me" && request.method === "GET") {
      const userId = getCurrentUserId();
      const user = await env.DB.prepare(`SELECT id, email, name, provider, role, is_premium FROM users WHERE id = ?`).bind(userId).first();
      
      if (!user) {
        return new Response("User not found", { status: 404 });
      }
      
      return Response.json(user);
    }

    if (pathname === "/me" && request.method === "POST") {
      const userId = getCurrentUserId();
      const body = await request.json() as { name: string };
      
      // Basic name validation
      if (!body.name || body.name.length < 2 || body.name.length > 50) {
        return Response.json({ success: false, message: "Name must be between 2 and 50 characters" }, { status: 400 });
      }
      
      // Check for special characters/emojis (basic check)
      const nameRegex = /^[a-zA-Z0-9\s\-\.]+$/;
      if (!nameRegex.test(body.name)) {
        return Response.json({ success: false, message: "Name contains invalid characters" }, { status: 400 });
      }
      
      await env.DB.prepare(`UPDATE users SET name = ? WHERE id = ?`).bind(body.name, userId).run();
      return Response.json({ success: true });
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
      const userId = getCurrentUserId();
      const adminStatus = await isAdmin(env, userId);
      return Response.json({ isAdmin: adminStatus });
    }

    if (pathname === "/auth/google" && request.method === "POST") {
      const body = await request.json() as { email: string; name: string };
      const fakeUser = { id: "user-123", email: body.email, name: body.name, provider: "google", is_premium: false };
      await env.DB.prepare(`INSERT OR IGNORE INTO users (id, email, name, provider, role, is_premium) VALUES (?, ?, ?, ?, ?, ?)`)
        .bind(fakeUser.id, fakeUser.email, fakeUser.name, fakeUser.provider, "member", fakeUser.is_premium)
        .run();
      return Response.json({ success: true, user: fakeUser });
    }

    if (pathname === "/auth/microsoft" && request.method === "POST") {
      const body = await request.json() as { email: string; name: string };
      const fakeUser = { id: "user-456", email: body.email, name: body.name, provider: "microsoft", is_premium: false };
      await env.DB.prepare(`INSERT OR IGNORE INTO users (id, email, name, provider, role, is_premium) VALUES (?, ?, ?, ?, ?, ?)`)
        .bind(fakeUser.id, fakeUser.email, fakeUser.name, fakeUser.provider, "member", fakeUser.is_premium)
        .run();
      return Response.json({ success: true, user: fakeUser });
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
      
      if (!isPremium) {
        return Response.json({ success: false, message: "Premium subscription required" }, { status: 403 });
      }

      const body = await request.json() as { observation: string };

      const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            { role: "system", content: "You are a marketing signals assistant." },
            { role: "user", content: `Give a short recommendation based on this observation: ${body.observation}` },
          ],
        }),
      });

      const data = await openaiRes.json() as { choices?: Array<{ message?: { content?: string } }> };
      const suggestion = data.choices?.[0]?.message?.content || "No suggestion.";
      return Response.json({ suggestion });
    }

    if (pathname === "/ai-hypothesis" && request.method === "POST") {
      const userId = getCurrentUserId();
      const isPremium = await isUserPremium(env, userId);
      
      if (!isPremium) {
        return Response.json({ success: false, message: "Premium subscription required" }, { status: 403 });
      }

      const body = await request.json() as { play_name: string };

      const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            { role: "system", content: "You are a marketing strategy assistant." },
            { role: "user", content: `Generate a short hypothesis about why running the following play could help the marketing team: ${body.play_name}. Focus on business impact.` },
          ],
        }),
      });

      const data = await openaiRes.json() as { choices?: Array<{ message?: { content?: string } }> };
      const hypothesis = data.choices?.[0]?.message?.content || "No hypothesis generated.";
      return Response.json({ hypothesis });
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

    return new Response("Not Found", { status: 404 });
  },
}; 