async function getUser(request, supabase) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  const { data } = await supabase.auth.getUser(token);
  return data?.user;
}

export async function router(request, env, supabase, corsHeaders) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;
  const headers = { ...corsHeaders, 'Content-Type': 'application/json' };

  if (path === '/api/health') {
    return new Response(JSON.stringify({ status: 'ok' }), { headers });
  }

  // Auth routes
  if (path === '/api/auth/signin' && method === 'POST') {
    const { email, password } = await request.json();
    const res = await fetch(`${env.SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { 'apikey': env.SUPABASE_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return new Response(await res.text(), { status: res.status, headers });
  }

  const user = await getUser(request, supabase);
  if (!user && !path.startsWith('/api/auth')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers });
  }

  // Debts
  if (path === '/api/debts') {
    if (method === 'GET') {
      const { data } = await supabase.from('credit_card_debts').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      return new Response(JSON.stringify(data || []), { headers });
    }
    if (method === 'POST') {
      const body = await request.json();
      const { data } = await supabase.from('credit_card_debts').insert({ ...body, user_id: user.id }).select();
      return new Response(JSON.stringify(data[0]), { status: 201, headers });
    }
  }

  if (path.startsWith('/api/debts/')) {
    const id = path.split('/')[3];
    if (method === 'GET') {
      const { data } = await supabase.from('credit_card_debts').select('*').eq('id', id).eq('user_id', user.id).single();
      return new Response(JSON.stringify(data), { headers });
    }
    if (method === 'PUT') {
      const body = await request.json();
      const { data } = await supabase.from('credit_card_debts').update(body).eq('id', id).eq('user_id', user.id).select();
      return new Response(JSON.stringify(data[0]), { headers });
    }
    if (method === 'DELETE') {
      await supabase.from('credit_card_debts').delete().eq('id', id).eq('user_id', user.id);
      return new Response(null, { status: 204, headers });
    }
  }

  // Loans
  if (path === '/api/loans' && method === 'GET') {
    const { data } = await supabase.from('loans').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    return new Response(JSON.stringify(data || []), { headers });
  }

  // Income
  if (path === '/api/income' && method === 'GET') {
    const { data } = await supabase.from('income').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    return new Response(JSON.stringify(data || []), { headers });
  }

  return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers });
}
