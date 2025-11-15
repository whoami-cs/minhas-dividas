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
      const path = url.pathname;
      const method = request.method;
      const headers = { ...corsHeaders, 'Content-Type': 'application/json' };

      if (path === '/api/health') {
        return new Response(JSON.stringify({ status: 'ok' }), { headers });
      }

      if (path === '/api/auth/signin' && method === 'POST') {
        const body = await request.json();
        const res = await fetch(`${env.SUPABASE_URL}/auth/v1/token?grant_type=password`, {
          method: 'POST',
          headers: { 'apikey': env.SUPABASE_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        return new Response(await res.text(), { status: res.status, headers });
      }

      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
