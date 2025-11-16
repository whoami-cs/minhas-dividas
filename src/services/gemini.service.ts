
import { Injectable, inject } from '@angular/core';
import { environment } from '../environments/environment';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private settingsService = inject(SettingsService);

  private async getAuthHeaders(): Promise<HeadersInit> {
    const tokenService = new (await import('./token.service')).TokenService();
    const token = tokenService.getToken();

    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  async *generateSuggestionsStream(debtData: any): AsyncGenerator<string> {
    const apiUrl = environment.apiUrl;
    const settings = this.settingsService.settings();

    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${apiUrl}/gemini/analyze-debts`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          debts: debtData,
          ai_analysis_model: settings.ai_analysis_model
        })
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;
            try {
              const parsed = JSON.parse(data);
              yield parsed.text;
            } catch { }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      yield `Erro: ${error}`;
    }
  }

  async analyzeFinancialSituation(debts: any[], loans: any[], income: any[], signal?: AbortSignal): Promise<any> {
    const apiUrl = environment.apiUrl;

    try {
      const response = await fetch(`${apiUrl}/gemini/analyze-financial-situation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ debts, loans, income }),
        signal
      });

      if (!response.ok) {
        throw new Error(`Erro: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async suggestPaymentPlan(debts: any[], loans: any[], income: any[], availableAmount: number, signal?: AbortSignal): Promise<any> {
    const apiUrl = environment.apiUrl;

    try {
      const response = await fetch(`${apiUrl}/gemini/suggest-payment-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ debts, loans, income, availableAmount }),
        signal
      });

      if (!response.ok) {
        throw new Error(`Erro: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async *extractLoanDataFromFileStream(file: File, signal?: AbortSignal): AsyncGenerator<{ type: 'thinking' | 'text' | 'final' | 'status' | 'countdown', content: string | number }> {
    const apiUrl = environment.apiUrl;
    const settings = this.settingsService.settings();

    try {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
      });

      const headers = await this.getAuthHeaders();
      const response = await fetch(`${apiUrl}/gemini/extract-loan-pdf`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          fileData: base64,
          mimeType: file.type,
          ai_extraction_model: settings.ai_extraction_model
        }),
        signal
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      while (true) {
        if (signal?.aborted) {
          reader!.cancel();
          throw new DOMException('Aborted', 'AbortError');
        }
        const { done, value } = await reader!.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;
            try {
              const parsed = JSON.parse(data);
              if (parsed.countdown !== undefined) {
                yield { type: 'countdown', content: parsed.countdown };
              } else if (parsed.status) {
                yield { type: 'status', content: parsed.status };
              } else if (parsed.thinking) {
                yield { type: 'thinking', content: parsed.thinking };
              } else if (parsed.final) {
                yield { type: 'final', content: parsed.final };
              } else if (parsed.text) {
                yield { type: 'text', content: parsed.text };
              }
            } catch { }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      if ((error as any).name === 'AbortError') {
        throw error;
      }
      yield { type: 'final', content: JSON.stringify({ error: `Erro: ${error}` }) };
    }
  }

  async *sendChatMessageStream(params: {
    conversationId: number | null;
    message: string;
    context?: any;
    contextKey?: string;
  }): AsyncGenerator<{
    status?: string;
    countdown?: number;
    chunk?: string;
    structured?: any;
    conversationId?: number;
    error?: string;
  }> {
    const settings = this.settingsService.settings();

    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${environment.apiUrl}/ai-chat/stream`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ai_chat_model: settings.ai_chat_model,
          conversationId: params.conversationId,
          message: params.message,
          context: params.context,
          contextKey: params.contextKey
        })
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              yield parsed;
            } catch { }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      yield { error: 'Desculpe, ocorreu um erro. Tente novamente.' };
    }
  }
}
