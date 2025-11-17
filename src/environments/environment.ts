export const environment = {
  production: false,
  apiUrl: (window as any).__env?.VITE_API_URL || 'http://localhost:3001/api'
};