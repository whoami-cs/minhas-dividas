// Vercel Cron Job - Mantém o backend ativo
export default async function handler(req, res) {
  try {
    const apiUrl = `${process.env.VITE_API_URL}/health` || 'https://minhasdividas-api.onrender.com/api/health';
    
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    console.log('Health check executado:', data);
    
    res.status(200).json({
      message: 'Cron job executado com sucesso',
      healthCheck: data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro no cron job:', error);
    res.status(500).json({
      message: 'Erro ao executar cron job',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
