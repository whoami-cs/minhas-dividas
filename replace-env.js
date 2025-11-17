const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, 'dist', 'index.html');
const apiUrl = process.env.VITE_API_URL;

if (!apiUrl) {
  console.error('VITE_API_URL environment variable is required');
  process.exit(1);
}

if (fs.existsSync(distPath)) {
  let html = fs.readFileSync(distPath, 'utf8');
  html = html.replace('%VITE_API_URL%', apiUrl);
  fs.writeFileSync(distPath, html);
  console.log('Environment variables replaced in index.html');
}