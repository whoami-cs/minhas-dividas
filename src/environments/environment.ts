export const environment = {
  production: false,
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY || ''
};