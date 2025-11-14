const supabase = require('../config/supabase');
const { createClient } = require('@supabase/supabase-js');

const authClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const settingsCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

async function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    const { data: { user }, error } = await authClient.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    req.user = user;

    const cached = settingsCache.get(user.id);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      req.userSettings = cached.settings;
      console.log('[AUTH] Settings do cache:', req.userSettings);
    } else {
      console.log('[AUTH] Buscando settings para user_id:', user.id);
      console.log('[AUTH] Supabase URL:', process.env.SUPABASE_URL);
      
      const result = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id);

      console.log('[AUTH] Query result completo:', JSON.stringify(result, null, 2));
      console.log('[AUTH] Data:', result.data);
      console.log('[AUTH] Error:', result.error);
      
      const settings = result.data?.[0] || null;
      req.userSettings = settings;

      settingsCache.set(user.id, { settings: req.userSettings, timestamp: Date.now() });
    }

    next();
  } catch (error) {
    console.error('[AUTH] Erro na autenticação:', error);
    res.status(401).json({ error: 'Erro na autenticação' });
  }
}

authMiddleware.clearCache = (userId) => {
  if (userId) {
    settingsCache.delete(userId);
  } else {
    settingsCache.clear();
  }
};

module.exports = authMiddleware;
