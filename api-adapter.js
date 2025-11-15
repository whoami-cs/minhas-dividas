import { createClient } from '@supabase/supabase-js';

async function handleRequest(request, env, supabase, user) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;
  
  // Debts CRUD
  if (path === '/api/debts' && method === 'GET') {
    const { data } = await supabase.from('credit_card_debts').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    return Response.json(data);
  }
  if (path === '/api/debts' && method === 'POST') {
    const body = await request.json();
    const { data } = await supabase.from('credit_card_debts').insert({ ...body, user_id: user.id }).select();
    return Response.json(data[0], { status: 201 });
  }
  if (path.match(/^\/api\/debts\/\d+$/) && method === 'GET') {
    const id = path.split('/')[3];
    const { data } = await supabase.from('credit_card_debts').select('*').eq('id', id).eq('user_id', user.id).single();
    return Response.json(data);
  }
  if (path.match(/^\/api\/debts\/\d+$/) && method === 'PUT') {
    const id = path.split('/')[3];
    const body = await request.json();
    const { data } = await supabase.from('credit_card_debts').update(body).eq('id', id).eq('user_id', user.id).select();
    return Response.json(data[0]);
  }
  if (path.match(/^\/api\/debts\/\d+$/) && method === 'DELETE') {
    const id = path.split('/')[3];
    await supabase.from('credit_card_debts').delete().eq('id', id).eq('user_id', user.id);
    return new Response(null, { status: 204 });
  }

  // Loans CRUD
  if (path === '/api/loans' && method === 'GET') {
    const { data } = await supabase.from('loans').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    return Response.json(data);
  }
  if (path === '/api/loans' && method === 'POST') {
    const body = await request.json();
    const { data } = await supabase.from('loans').insert({ ...body, user_id: user.id }).select();
    return Response.json(data[0], { status: 201 });
  }
  if (path.match(/^\/api\/loans\/\d+$/) && method === 'PUT') {
    const id = path.split('/')[3];
    const body = await request.json();
    const { data } = await supabase.from('loans').update(body).eq('id', id).eq('user_id', user.id).select();
    return Response.json(data[0]);
  }
  if (path.match(/^\/api\/loans\/\d+$/) && method === 'DELETE') {
    const id = path.split('/')[3];
    await supabase.from('loans').delete().eq('id', id).eq('user_id', user.id);
    return new Response(null, { status: 204 });
  }

  // Income CRUD
  if (path === '/api/income' && method === 'GET') {
    const { data } = await supabase.from('income').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    return Response.json(data);
  }
  if (path === '/api/income' && method === 'POST') {
    const body = await request.json();
    const { data } = await supabase.from('income').insert({ ...body, user_id: user.id }).select();
    return Response.json(data[0], { status: 201 });
  }

  return Response.json({ error: 'Not found' }, { status: 404 });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    if (!url.pathname.startsWith('/api')) {
      return env.ASSETS.fetch(request);
    }

    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
    const path = url.pathname;
    const method = request.method;

    if (path === '/api/health') {
      return Response.json({ status: 'ok' });
    }

    if (path === '/api/auth/signin' && method === 'POST') {
      const { email, password } = await request.json();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      return Response.json(error ? { error } : data);
    }

    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    return handleRequest(request, env, supabase, user);
  }
};
