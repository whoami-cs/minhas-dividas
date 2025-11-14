const { GoogleGenerativeAI } = require('@google/generative-ai');
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

function getNextKeyIndex() {
  return (currentKeyIndex + 1) % API_KEYS.length;
}

function getGenAI() {
  return new GoogleGenerativeAI(API_KEYS[currentKeyIndex]);
}

const chatResponseSchema = {
  type: 'object',
  properties: {
    answer: {
      type: 'string',
      description: 'Resposta completa e formatada em markdown para a pergunta do usuário'
    },
    key_points: {
      type: 'array',
      items: { type: 'string' },
      description: 'Lista de 2-4 pontos-chave da resposta'
    },
    action_items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          action: { type: 'string', description: 'Ação recomendada' },
          priority: { type: 'string', enum: ['high', 'medium', 'low'], description: 'Prioridade da ação' }
        },
        required: ['action', 'priority']
      },
      description: 'Lista de ações recomendadas (máximo 3)'
    },
    warning: {
      type: 'string',
      nullable: true,
      description: 'Aviso importante se houver'
    }
  },
  required: ['answer', 'key_points', 'action_items']
};

exports.chatStream = async (req, res) => {

  
  const { conversationId, message, context, contextKey, userId } = req.body;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    currentKeyIndex = await getCurrentKeyIndex();
    if (currentKeyIndex >= API_KEYS.length) {
      currentKeyIndex = 0;
      await setCurrentKeyIndex(0);
    }
    
    let conversation;
    let messages = [];

    if (conversationId) {
      const { data } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('id', conversationId)
        .single();
      conversation = data;
      messages = data?.messages || [];
    }

    console.log('Messages before building history:', messages.length);
    
    const systemPrompt = buildSystemPrompt(context);
    const history = buildHistory(messages);
    
    console.log('History built with', history.length, 'messages');
    console.log('History:', JSON.stringify(history, null, 2));

    messages.push({ role: 'user', content: message, timestamp: new Date().toISOString() });

    const { ai_chat_model: chatModel } = req.body;
    console.log('Modelo selecionado:', chatModel);

    let result;
    const maxRetries = 3;
    const retryDelays = [2000, 5000, 10000];

    const startKeyIndex = currentKeyIndex;
    let keysAttempted = 0;

    while (keysAttempted < API_KEYS.length) {
      let keySuccess = false;
      
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          console.log(`Chave ${currentKeyIndex + 1}/${API_KEYS.length} | Tentativa ${attempt + 1}/${maxRetries}`);
          if (attempt > 0) {
            res.write(`data: ${JSON.stringify({ status: `Tentativa ${attempt + 1} de conexão...` })}\n\n`);
          }
          
          const genAI = getGenAI();
          const model = genAI.getGenerativeModel({ 
            model: chatModel,
            generationConfig: {
              responseMimeType: 'application/json',
              responseSchema: chatResponseSchema
            },
            systemInstruction: systemPrompt
          });
          
          const chat = model.startChat({ history });
          result = await chat.sendMessageStream(message);
          keySuccess = true;
          break;
        } catch (error) {
          const isRateLimitError = error.status === 429;
          const isLastAttempt = attempt === maxRetries - 1;

          if (isRateLimitError && !isLastAttempt) {
            let waitTime = retryDelays[attempt];
            const retryAfterMatch = error.message?.match(/Please retry in ([\d.]+)s/);
            if (retryAfterMatch && retryAfterMatch[1]) {
              waitTime = Math.ceil(parseFloat(retryAfterMatch[1]) * 1000);
            }
            console.log(`Rate limit. Aguardando ${waitTime}ms...`);
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
            break;
          }

          throw error;
        }
      }
      
      if (keySuccess) break;
      
      keysAttempted++;
      if (keysAttempted < API_KEYS.length) {
        currentKeyIndex = getNextKeyIndex();
        await setCurrentKeyIndex(currentKeyIndex);
        console.log(`3 tentativas falharam. Alternando para chave ${currentKeyIndex + 1}/${API_KEYS.length}`);
        res.write(`data: ${JSON.stringify({ status: `Alternando para chave ${currentKeyIndex + 1}...` })}\n\n`);
      }
    }

    if (!result) {
      throw new Error('Todas as chaves excederam a quota');
    }

    let jsonBuffer = '';
    for await (const chunk of result.stream) {
      const text = chunk.text();
      jsonBuffer += text;
      res.write(`data: ${JSON.stringify({ chunk: text })}\n\n`);
    }

    console.log('JSON Buffer length:', jsonBuffer.length);
    console.log('JSON Buffer:', jsonBuffer);
    
    if (!jsonBuffer.trim()) {
      throw new Error('Empty response from AI');
    }

    const structuredResponse = JSON.parse(jsonBuffer);
    messages.push({ role: 'assistant', content: structuredResponse, timestamp: new Date().toISOString() });

    res.write(`data: ${JSON.stringify({ structured: structuredResponse })}\n\n`);

    if (conversationId) {
      await supabase
        .from('ai_conversations')
        .update({ messages, updated_at: new Date().toISOString() })
        .eq('id', conversationId);
    } else {
      const title = message.substring(0, 50);
      const { data } = await supabase
        .from('ai_conversations')
        .insert({
          title,
          context_type: context?.type || null,
          context_id: context?.item?.id || null,
          context_key: contextKey || null,
          messages
        })
        .select()
        .single();
      
      res.write(`data: ${JSON.stringify({ conversationId: data.id })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Chat error:', error);
    console.error('Error stack:', error.stack);
    res.write(`data: ${JSON.stringify({ error: error.message || 'Erro ao processar mensagem' })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
};

exports.getConversations = async (req, res) => {
  try {
    const { contextKey } = req.query;
    
    let query = supabase
      .from('ai_conversations')
      .select('id, title, context_type, context_key, created_at, updated_at')
      .eq('is_archived', false);
    
    if (contextKey) {
      query = query.eq('context_key', contextKey);
    }
    
    const { data, error } = await query
      .order('updated_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Erro ao buscar conversas' });
  }
};

exports.getConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Erro ao buscar conversa' });
  }
};

exports.deleteConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('ai_conversations')
      .update({ is_archived: true })
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ error: 'Erro ao deletar conversa' });
  }
};

function buildSystemPrompt(context) {
  let prompt = `Você é um assistente financeiro especializado em gestão de dívidas e empréstimos.

REGRAS CRÍTICAS:
1. Responda SEMPRE em português do Brasil
2. Use APENAS os dados fornecidos no contexto abaixo
3. NUNCA invente informações ou use conhecimento externo sobre finanças pessoais do usuário
4. Se a pergunta não puder ser respondida com os dados fornecidos, informe isso claramente
5. Seja objetivo, prático e direto
6. VOCÊ TEM ACESSO AO HISTÓRICO COMPLETO DA CONVERSA - use-o para responder perguntas sobre mensagens anteriores

`;

  if (context?.type === 'debt' && context?.item) {
    prompt += `CONTEXTO RESTRITO: Usuário está visualizando APENAS a dívida "${context.item.local}".

DADOS DISPONÍVEIS (ÚNICO CONTEXTO VÁLIDO):
${JSON.stringify(context.item, null, 2)}

IMPORTANTE: 
- Responda focando EXCLUSIVAMENTE nesta dívida específica
- NÃO mencione outras dívidas
- NÃO faça comparações com outras dívidas
- Se o usuário perguntar sobre outras dívidas, informe que você só tem acesso aos dados desta dívida específica`;
  } else if (context?.type === 'loan' && context?.item) {
    prompt += `CONTEXTO RESTRITO: Usuário está visualizando APENAS o empréstimo "${context.item.creditor}".

DADOS DISPONÍVEIS (ÚNICO CONTEXTO VÁLIDO):
${JSON.stringify(context.item, null, 2)}

IMPORTANTE:
- Responda focando EXCLUSIVAMENTE neste empréstimo específico
- NÃO mencione outros empréstimos
- NÃO faça comparações com outros empréstimos
- Se o usuário perguntar sobre outros empréstimos, informe que você só tem acesso aos dados deste empréstimo específico`;
  } else {
    prompt += `CONTEXTO GERAL: Visão completa das finanças.

DADOS DISPONÍVEIS:
`;
    
    if (context?.debts?.length > 0) {
      prompt += `\nDÍVIDAS DE CARTÃO:\n${JSON.stringify(context.debts, null, 2)}\n`;
    }

    if (context?.loans?.length > 0) {
      prompt += `\nEMPRÉSTIMOS:\n${JSON.stringify(context.loans, null, 2)}\n`;
    }

    if (context?.income?.length > 0) {
      prompt += `\nRENDIMENTOS:\n${JSON.stringify(context.income, null, 2)}\n`;
    }
    
    prompt += `\nIMPORTANTE: Use APENAS os dados acima para responder. Não invente valores ou informações.`;
  }

  return prompt;
}

function buildHistory(messages) {
  const history = [];
  
  for (const msg of messages) {
    const role = msg.role === 'user' ? 'user' : 'model';
    let content;
    
    if (typeof msg.content === 'string') {
      content = msg.content;
    } else if (msg.content?.answer) {
      // Resposta estruturada - usa apenas o answer
      content = msg.content.answer;
    } else {
      content = JSON.stringify(msg.content);
    }
    
    history.push({
      role,
      parts: [{ text: content }]
    });
  }
  
  return history;
}
