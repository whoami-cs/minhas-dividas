export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (!url.pathname.startsWith('/api')) {
      return env.ASSETS.fetch(request);
    }

    try {
      const headers = { ...corsHeaders, 'Content-Type': 'application/json' };
      
      // Proxy para API Express no Render
      const apiUrl = url.pathname.replace('/api', 'https://minhas-dividas-api.onrender.com/api');
      const proxyRequest = new Request(apiUrl + url.search, {
        method: request.method,
        headers: request.headers,
        body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.text() : undefined
      });
      
      const res = await fetch(proxyRequest);
      return new Response(await res.text(), { status: res.status, headers: { ...headers, ...Object.fromEntries(res.headers) } });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
  }
};
