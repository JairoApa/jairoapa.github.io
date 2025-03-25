var index_default = {
  async scheduled(event, env, ctx) {
    let currentSequence = parseInt(await env.HLS_SEQUENCE.get("sequence")) || 0;
    currentSequence = (currentSequence + 1) % 209;
    await env.HLS_SEQUENCE.put("sequence", currentSequence.toString());
    console.log("Secuencia actualizada automáticamente:", currentSequence);

    // ⚠️ Simulación de actualización cada 10s
    ctx.waitUntil(
      fetch("https://apaiptv.gameplaysofjairo.workers.dev/update")
    );
  },

  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/update") {
      let currentSequence = parseInt(await env.HLS_SEQUENCE.get("sequence")) || 0;
      currentSequence = (currentSequence + 1) % 209;
      await env.HLS_SEQUENCE.put("sequence", currentSequence.toString());
      console.log("Secuencia actualizada por self-call:", currentSequence);
      return new Response("OK");
    }

    if (url.pathname.endsWith(".m3u8")) {
      let currentSequence = parseInt(await env.HLS_SEQUENCE.get("sequence")) || 0;
      let m3u8Text = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:10
#EXT-X-MEDIA-SEQUENCE:${currentSequence}
#EXT-X-PLAYLIST-TYPE:LIVE
#EXT-X-ALLOW-CACHE:NO
`;
      const segments = Array.from({ length: 209 }, (_, i) => `stream${i}.ts`);
      for (let i = 0; i < 5; i++) {
        const segmentIndex = (currentSequence + i) % segments.length;
        const timestamp = Date.now();
        m3u8Text += `#EXTINF:10.0,
        http://jairoapa.github.io/IPTV/TVStream/${segments[segmentIndex]}?t=${timestamp}
`;
      }
      return new Response(m3u8Text, {
        headers: {
          "Content-Type": "application/vnd.apple.mpegurl",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          "Expires": "0",
          "Pragma": "no-cache"
        }
      });
    }

    return new Response("Archivo no encontrado", { status: 404 });
  }
};

export {
  index_default as default
};
