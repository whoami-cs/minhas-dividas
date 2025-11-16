export const environment = {
  production: false,
  apiUrl: (typeof process !== 'undefined' && process.env?.['VITE_API_URL']) || 'http://localhost:3001/api'
};