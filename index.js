import { createClient } from '@supabase/supabase-js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    if (!url.pathname.startsWith('/api')) {
      return env.ASSETS.fetch(request);
    }

    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
    const path = url.pathname;
    const method = request.method;
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');

    // Auth
    if (path === '/api/auth/signin' && method === 'POST') {
      const { email, password } = await request.json();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      return Response.json(error ? { error } : data);
    }

    if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Debts
    if (path === '/api/debts' && method === 'GET') {
      const { data } = await supabase.from('credit_card_debts').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      return Response.json(data);
    }

    if (path === '/api/debts' && method === 'POST') {
      const body = await request.json();
      const { data } = await supabase.from('credit_card_debts').insert({ ...body, user_id: user.id }).select();
      return Response.json(data[0], { status: 201 });
    }

    // Loans
    if (path === '/api/loans' && method === 'GET') {
      const { data } = await supabase.from('loans').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      return Response.json(data);
    }

    // Income
    if (path === '/api/income' && method === 'GET') {
      const { data } = await supabase.from('income').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      return Response.json(data);
    }

    return Response.json({ error: 'Not found' }, { status: 404 });
  }
};
