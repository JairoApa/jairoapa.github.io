export default {
  async fetch(request) {
    return new Response("¡Hola desde Cloudflare Workers!", { status: 200 });
  }
};
