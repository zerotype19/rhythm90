/// <reference types="@cloudflare/workers-types" />

export interface Env {
  DB: D1Database;
  OPENAI_API_KEY: string;
  APP_URL?: string;
  DEMO_MODE?: string;
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
        role: "member"
      };
      
      await env.DB.prepare(`INSERT OR IGNORE INTO users (id, email, name, provider, role) VALUES (?, ?, ?, ?, ?)`)
        .bind(demoUser.id, demoUser.email, demoUser.name, demoUser.provider, demoUser.role)
        .run();
      
      return Response.json({ success: true, user: demoUser });
    }

    // Analytics endpoint
    if (pathname === "/analytics" && request.method === "POST") {
      const body = await request.json();
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
      const fakeUser = { id: "user-123", email: body.email, name: body.name, provider: "google" };
      await env.DB.prepare(`INSERT OR IGNORE INTO users (id, email, name, provider, role) VALUES (?, ?, ?, ?, ?)`)
        .bind(fakeUser.id, fakeUser.email, fakeUser.name, fakeUser.provider, "member")
        .run();
      return Response.json({ success: true, user: fakeUser });
    }

    if (pathname === "/auth/microsoft" && request.method === "POST") {
      const body = await request.json() as { email: string; name: string };
      const fakeUser = { id: "user-456", email: body.email, name: body.name, provider: "microsoft" };
      await env.DB.prepare(`INSERT OR IGNORE INTO users (id, email, name, provider, role) VALUES (?, ?, ?, ?, ?)`)
        .bind(fakeUser.id, fakeUser.email, fakeUser.name, fakeUser.provider, "member")
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
      const body = await request.json() as { user_id: string; role: string };
      await env.DB.prepare(`INSERT INTO team_users (team_id, user_id, role) VALUES (?, ?, ?)`)
        .bind("team-123", body.user_id, body.role)
        .run();
      return Response.json({ success: true });
    }

    if (pathname === "/admin/team/remove" && request.method === "POST") {
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

    if (pathname === "/invite" && request.method === "POST") {
      const userId = getCurrentUserId();
      const adminStatus = await isAdmin(env, userId);
      
      if (!adminStatus) {
        return new Response("Unauthorized", { status: 401 });
      }

      const body = await request.json() as { email: string };
      const token = crypto.randomUUID();
      await env.DB.prepare(`INSERT INTO invites (id, email, token) VALUES (?, ?, ?)`)
        .bind(crypto.randomUUID(), body.email, token)
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
      const body = await request.json() as { token: string };
      
      const invite = await env.DB.prepare(`SELECT * FROM invites WHERE token = ? AND accepted = 0`).bind(body.token).first();
      if (!invite) {
        return Response.json({ success: false, message: "Invalid or expired invitation link" });
      }

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
        return Response.json({ text: `⚠️ ${error.message}` });
      }
    }

    return new Response("Not Found", { status: 404 });
  },
}; 