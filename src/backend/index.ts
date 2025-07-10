export interface Env {
  DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    if (pathname === "/health") {
      return new Response(JSON.stringify({ status: "ok" }), { headers: { "Content-Type": "application/json" } });
    }

    if (pathname === "/board" && request.method === "GET") {
      const plays = await env.DB.prepare(`SELECT * FROM plays WHERE team_id = ?`).bind("team-123").all();
      return Response.json(plays);
    }

    if (pathname === "/board" && request.method === "POST") {
      const body = await request.json();
      await env.DB.prepare(`INSERT INTO plays (id, team_id, name, target_outcome, why_this_play, how_to_run, signals, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
        .bind(
          crypto.randomUUID(),
          body.team_id,
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
      const signals = await env.DB.prepare(`SELECT * FROM signals WHERE play_id = ?`).bind("play-123").all();
      return Response.json(signals);
    }

    if (pathname === "/signals" && request.method === "POST") {
      const body = await request.json();
      await env.DB.prepare(`INSERT INTO signals (id, play_id, observation, meaning, action) VALUES (?, ?, ?, ?, ?)`)
        .bind(
          crypto.randomUUID(),
          body.play_id,
          body.observation,
          body.meaning,
          body.action
        )
        .run();
      return Response.json({ success: true });
    }

    if (pathname === "/rnr-summary" && request.method === "GET") {
      const summary = await env.DB.prepare(`
        SELECT p.name, s.observation, s.meaning, s.action 
        FROM plays p 
        JOIN signals s ON p.id = s.play_id 
        WHERE p.team_id = ?`)
        .bind("team-123")
        .all();
      return Response.json({ summary: summary.results });
    }

    if (pathname === "/slack-hook" && request.method === "POST") {
      const payload = await request.json();
      console.log("Received Slack webhook:", payload);
      return Response.json({ success: true });
    }

    return new Response("Not Found", { status: 404 });
  },
}; 