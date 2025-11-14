const { GoogleGenerativeAI } = require('@google/generative-ai');
const { z } = require('zod');
const { zodToJsonSchema } = require('zod-to-json-schema');
const supabase = require('../config/supabase');

if (!process.env.GEMINI_API_KEYS) {
  throw new Error('GEMINI_API_KEYS environment variable is required');
}

const API_KEYS = process.env.GEMINI_API_KEYS.split(',').map(k => k.trim());
let currentKeyIndex = 0;

async function getCurrentKeyIndex() {
  const { data } = await supabase.from('app_config').select('value').eq('key', 'gemini_key_index').single();
  return data?.value || 0;
}

async function setCurrentKeyIndex(index) {
  await supabase.from('app_config').upsert({ key: 'gemini_key_index', value: index });
}

const genAI = new GoogleGenerativeAI(API_KEYS[currentKeyIndex]);

exports.extractLoanFromPDF = async (req, res) => {
  const { fileData, mimeType } = req.body;
  
  currentKeyIndex = await getCurrentKeyIndex();
  console.log(`Índice inicial da chave: ${currentKeyIndex}`);

  const prompt = `
    Analise o arquivo PDF anexo, que é um contrato de empréstimo. Extraia as seguintes informações e retorne um JSON.
    Se alguma informação não for encontrada, retorne null para o campo correspondente.
    O formato da data deve ser DD/MM/YYYY.

    IMPORTANTE: Para cada parcela, verifique se há data de pagamento preenchida. Se houver data de pagamento, marque paid como true.
    Se a coluna "Liq." tiver "S" ou "Sim", a parcela está paga (paid: true).
    Se não houver data de pagamento ou a coluna "Liq." tiver "N" ou "Não", a parcela não está paga (paid: false).

    IMPORTANTE: Retorne APENAS o JSON puro, sem blocos de código markdown, sem texto antes ou depois.
  `;

  const maxRetries = 3;
  const retryDelays = [2000, 5000, 10000];
  
  const { ai_extraction_model: extractionModel } = req.body;
  const models = [extractionModel];

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const installmentSchema = z.object({
    parcel_number: z.number(),
    due_date: z.string(),
    payment_date: z.string().nullable(),
    installment_value: z.number(),
    paid_value: z.number().nullable(),
    interest: z.number().nullable(),
    amortization: z.number().nullable(),
    late_fee: z.number(),
    late_iof: z.number(),
    discount: z.number(),
    days_late: z.number().nullable(),
    history: z.string().nullable(),
    paid: z.boolean(),
  });

  const loanSchema = z.object({
    contract_number: z.string(),
    creditor: z.string(),
    loan_date: z.string(),
    loan_value: z.number(),
    interest_value: z.number().optional(),
    total_installments: z.number(),
    installments: z.array(installmentSchema),
  });

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const modelName = models[0];
      console.log(`Tentando com modelo: ${modelName} | Chave: ${currentKeyIndex + 1}/${API_KEYS.length} | Tentativa: ${attempt + 1}/${maxRetries}`);
      if (attempt > 0) {
        res.write(`data: ${JSON.stringify({ status: `Tentativa ${attempt + 1} de conexão...` })}\n\n`);
      }

      const currentGenAI = new GoogleGenerativeAI(API_KEYS[currentKeyIndex]);
      const model = currentGenAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          responseJsonSchema: zodToJsonSchema(loanSchema),
          thinkingConfig: {
            thinkingBudget: 8192,
            includeThoughts: true,
          },
        },
      });
      
      const result = await model.generateContentStream([
        { text: prompt },
        { inlineData: { data: fileData, mimeType } }
      ]);

      let thoughts = "";
      let answer = "";

      for await (const chunk of result.stream) {
        if (chunk.candidates && chunk.candidates[0].content && chunk.candidates[0].content.parts) {
          for (const part of chunk.candidates[0].content.parts) {
            if (!part.text) {
              continue;
            } else if (part.thought) {
              thoughts += part.text;
              res.write(`data: ${JSON.stringify({ thinking: part.text })}\n\n`);
            } else {
              answer += part.text;
            }
          }
        }
      }

      if (answer) {
        try {
          const finalJson = JSON.parse(answer);
          const responseData = JSON.stringify({ final: finalJson });
          res.write(`data: ${responseData}\n\n`);
        } catch (e) {
          console.error('Erro ao parsear o JSON final:', e, 'Conteúdo:', answer);
          res.write(`data: ${JSON.stringify({ error: 'Erro ao parsear a resposta final da IA.' })}\n\n`);
        }
      } else {
        res.write(`data: ${JSON.stringify({ error: 'Nenhum dado foi retornado pela IA.' })}\n\n`);
      }
      
      res.write('data: [DONE]\n\n');
      res.end();
      return;
    } catch (error) {
      const isRateLimitError = error.message?.includes('429') || error.message?.includes('quota');
      const isOverloadedError = error.status === 503 || error.message?.includes('overloaded');
      const isLastAttempt = attempt === maxRetries - 1;

      if (isOverloadedError && !isLastAttempt) {
        let waitTime = retryDelays[attempt];
        console.log(`Tentativa ${attempt + 1} falhou (Modelo sobrecarregado). Aguardando ${waitTime}ms...`);
        let remainingSeconds = Math.ceil(waitTime / 1000);
        const interval = setInterval(() => {
          res.write(`data: ${JSON.stringify({ countdown: remainingSeconds })}\n\n`);
          remainingSeconds--;
        }, 1000);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        clearInterval(interval);
        continue;
      }

      if (isRateLimitError && isLastAttempt) {
        console.log(`isLastAttempt=true, currentKeyIndex=${currentKeyIndex}, API_KEYS.length=${API_KEYS.length}`);
        const nextKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
        if (nextKeyIndex !== currentKeyIndex) {
          currentKeyIndex = nextKeyIndex;
          await setCurrentKeyIndex(currentKeyIndex);
          console.log(`Rate Limit após 3 tentativas. Alternando para chave ${currentKeyIndex === 0 ? 'inicial' : 'backup'} (${currentKeyIndex + 1}/${API_KEYS.length})...`);
          res.write(`data: ${JSON.stringify({ status: `Alternando para chave ${currentKeyIndex + 1}...` })}\n\n`);
          attempt = -1;
          console.log(`Reiniciando tentativas com nova chave...`);
          continue;
        }
        console.error('Rate Limit em todas as chaves (todas esgotadas):', error.message);
        res.write(`data: ${JSON.stringify({ error: 'Limite de requisições atingido em todas as chaves.' })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
        return;
      }

      if (isRateLimitError && !isLastAttempt) {
        let waitTime = retryDelays[attempt];
        const retryAfterMatch = error.message.match(/Please retry in ([\d.]+)s/);
        if (retryAfterMatch && retryAfterMatch[1]) {
          waitTime = Math.ceil(parseFloat(retryAfterMatch[1]) * 1000);
        }
        console.log(`Tentativa ${attempt + 1} falhou (Rate Limit). Aguardando ${waitTime}ms...`);
        let remainingSeconds = Math.ceil(waitTime / 1000);
        const interval = setInterval(() => {
          res.write(`data: ${JSON.stringify({ countdown: remainingSeconds })}\n\n`);
          remainingSeconds--;
        }, 1000);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        clearInterval(interval);
        continue;
      }

      if (isOverloadedError && isLastAttempt) {
        console.error('Modelo sobrecarregado após múltiplas tentativas:', error.message);
        res.write(`data: ${JSON.stringify({ error: 'O modelo está sobrecarregado. Tente novamente mais tarde.' })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
        return;
      }
      
      console.error(`Erro na tentativa ${attempt + 1}:`, error);
      res.write(`data: ${JSON.stringify({ error: 'Ocorreu um erro inesperado ao se comunicar com a IA.' })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
      return;
    }
  }
};

exports.analyzeDebts = async (req, res) => {
  const { debts } = req.body;

  const prompt = `
    Com base nos seguintes dados de dívidas de cartão de crédito, forneça sugestões para renegociação e estratégias de pagamento.
    Os dados estão em formato JSON:
    ${JSON.stringify(debts, null, 2)}

    Forneça uma resposta concisa e prática, com as seguintes seções:
    1. **Análise da Situação:** Uma breve visão geral da saúde financeira com base nos dados.
    2. **Estratégias de Pagamento:** Sugestões de como priorizar os pagamentos.
    3. **Dicas de Renegociação:** Conselhos sobre como negociar com os credores.
    A resposta deve ser formatada em Markdown.
  `;

  const maxRetries = 3;
  const retryDelays = [2000, 5000, 10000];
  
  const { ai_analysis_model: analysisModel } = req.body;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const model = genAI.getGenerativeModel({ 
        model: analysisModel,
        generationConfig: {
          thinkingConfig: { 
            thinkingBudget: -1,
            includeThoughts: true
          }
        }
      });
      
      const result = await model.generateContentStream(prompt);

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      for await (const chunk of result.stream) {
        if (chunk.candidates && chunk.candidates[0].content && chunk.candidates[0].content.parts) {
          for (const part of chunk.candidates[0].content.parts) {
            if (!part.text) {
              continue;
            } else if (part.thought) {
              res.write(`data: ${JSON.stringify({ thinking: part.text })}\n\n`);
            } else {
              res.write(`data: ${JSON.stringify({ text: part.text })}\n\n`);
            }
          }
        }
      }
      
      res.write('data: [DONE]\n\n');
      res.end();
      return;
    } catch (error) {
      const isRateLimitError = error.message?.includes('429') || error.message?.includes('quota');
      const isLastAttempt = attempt === maxRetries - 1;
      
      if (isRateLimitError && !isLastAttempt) {
        let waitTime = retryDelays[attempt];
        const retryAfterMatch = error.message.match(/Please retry in ([\d.]+)s/);
        if (retryAfterMatch && retryAfterMatch[1]) {
          waitTime = Math.ceil(parseFloat(retryAfterMatch[1]) * 1000);
        }
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      if (isRateLimitError && isLastAttempt) {
        console.error('Erro de limite de taxa da API Gemini após múltiplas tentativas:', error.message);
        if (!res.headersSent) {
          res.status(429).json({ error: 'O serviço atingiu o limite de requisições no momento. Por favor, tente novamente mais tarde.' });
        }
        return;
      }
      
      console.error(`Erro na tentativa ${attempt + 1}:`, error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Ocorreu um erro inesperado ao se comunicar com a IA.' });
      }
      return;
    }
  }
};

exports.analyzeGoals = async (req, res) => {
  const { prompt } = req.body;

  const { ai_analysis_model: analysisModel } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: analysisModel });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    res.json({ text });
  } catch (error) {
    console.error('Erro ao analisar metas:', error);
    res.status(500).json({ error: 'Erro ao gerar insights' });
  }
};
