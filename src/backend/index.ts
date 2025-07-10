/// <reference types="@cloudflare/workers-types" />

export interface Env {
  DB: D1Database;
  OPENAI_API_KEY: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    if (pathname === "/health") {
      return new Response(JSON.stringify({ status: "ok" }), { headers: { "Content-Type": "application/json" } });
    }

    if (pathname === "/auth/google" && request.method === "POST") {
      const body = await request.json();
      const fakeUser = { id: "user-123", email: body.email, name: body.name, provider: "google" };
      await env.DB.prepare(`INSERT OR IGNORE INTO users (id, email, name, provider, role) VALUES (?, ?, ?, ?, ?)`)
        .bind(fakeUser.id, fakeUser.email, fakeUser.name, fakeUser.provider, "member")
        .run();
      return Response.json({ success: true, user: fakeUser });
    }

    if (pathname === "/auth/microsoft" && request.method === "POST") {
      const body = await request.json();
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
      const body = await request.json();
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
      const body = await request.json();
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
      const summary = await env.DB.prepare(`
        SELECT p.name, s.observation, s.meaning, s.action 
        FROM plays p 
        JOIN signals s ON p.id = s.play_id 
        WHERE p.team_id = ?`)
        .bind(teamId)
        .all();
      return Response.json({ summary: summary.results });
    }

    if (pathname === "/ai-signal" && request.method === "POST") {
      const body = await request.json();
      console.log("OPENAI_API_KEY:", env.OPENAI_API_KEY);
      const mockResponse = `Looking at \"${body.observation}\", you might explore deeper segmentation.`;
      return Response.json({ suggestion: mockResponse });
    }

    if (pathname === "/ai-hypothesis" && request.method === "POST") {
      const body = await request.json();
      console.log("OPENAI_API_KEY:", env.OPENAI_API_KEY);
      const mockHypothesis = `We believe \"${body.play_name}\" will increase engagement by 20%.`;
      return Response.json({ hypothesis: mockHypothesis });
    }

    if (pathname === "/admin/team" && request.method === "GET") {
      const members = await env.DB.prepare(`SELECT * FROM team_users WHERE team_id = ?`).bind("team-123").all();
      return Response.json(members);
    }

    if (pathname === "/slack-hook" && request.method === "POST") {
      const payload = await request.json();
      console.log("Received Slack message:", payload.text);
      return Response.json({ ok: true });
    }

    return new Response("Not Found", { status: 404 });
  },
}; 