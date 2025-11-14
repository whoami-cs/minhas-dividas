# Instalação do Tailwind CSS para Produção

## Problema
O CDN do Tailwind CSS não deve ser usado em produção. Este guia mostra como instalar corretamente.

## Solução Rápida (Tailwind CLI)

### 1. Instalar Tailwind CSS
```bash
npm install -D tailwindcss
```

### 2. Criar arquivo de configuração
```bash
npx tailwindcss init
```

### 3. Configurar tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
    "./index.html"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### 4. Criar arquivo CSS de entrada
Crie `src/styles.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 5. Adicionar link no index.html
Remova a linha do CDN:
```html
<!-- REMOVER ESTA LINHA -->
<script src="https://cdn.tailwindcss.com"></script>
```

Adicione no `<head>`:
```html
<link rel="stylesheet" href="src/styles.css">
```

### 6. Adicionar script de build no package.json
```json
{
  "scripts": {
    "build:css": "tailwindcss -i ./src/styles.css -o ./src/output.css --watch"
  }
}
```

### 7. Executar o build
```bash
npm run build:css
```

## Nota
Como este projeto usa ESM modules via CDN, a configuração completa do Tailwind pode requerer ajustes adicionais no processo de build.
