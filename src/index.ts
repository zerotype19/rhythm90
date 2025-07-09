export default {
  async fetch(request: Request): Promise<Response> {
    return new Response("Hello from Rhythm90 API!", {
      headers: { "Content-Type": "text/plain" },
    });
  },
}; 