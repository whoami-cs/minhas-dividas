import { createClient } from '@supabase/supabase-js';
import { router } from './router.js';

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

    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
    
    try {
      return await router(request, env, supabase, corsHeaders);
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
