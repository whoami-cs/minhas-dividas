import { Component, signal, input, effect, ChangeDetectionStrategy, viewChild, ElementRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { SettingsService } from '../../services/settings.service';
import { GeminiService } from '../../services/gemini.service';

interface Message {
  role: 'user' | 'assistant';
  content: string | StructuredResponse;
  timestamp: string;
}

interface StructuredResponse {
  answer: string;
  key_points: string[];
  action_items: { action: string; priority: 'high' | 'medium' | 'low' }[];
  warning?: string | null;
}

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  template: `
    @if (isOpen()) {
      <div class="fixed bottom-20 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200">
        <div class="bg-gradient-to-r from-slate-800 to-slate-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <div>
              <h3 class="font-bold text-sm">Assistente IA</h3>
              <p class="text-xs text-white/80">{{ contextTitle() || 'Tire suas dúvidas' }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button (click)="showHistory.set(!showHistory())" class="text-white/80 hover:text-white transition" title="Histórico">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
            </button>
            @if (currentConversationId()) {
              <button (click)="newConversation()" class="text-white/80 hover:text-white transition" title="Nova conversa">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
              </button>
            }
            <button (click)="close()" class="text-white/80 hover:text-white transition">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
        </div>

        <div #messagesContainer class="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          @if (showHistory()) {
            <div class="space-y-2">
              <div class="flex items-center justify-between mb-3">
                <h4 class="font-bold text-gray-900">Conversas Anteriores</h4>
                <button (click)="showHistory.set(false)" class="text-gray-500 hover:text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>
              @if (conversations().length === 0) {
                <p class="text-sm text-gray-500 text-center py-4">Nenhuma conversa anterior</p>
              }
              @for (conv of conversations(); track conv.id) {
                <div (click)="loadConversation(conv.id)" class="bg-white p-3 rounded-lg border border-gray-200 hover:border-slate-300 cursor-pointer transition">
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <p class="text-sm font-medium text-gray-900 line-clamp-1">{{ conv.title }}</p>
                      <p class="text-xs text-gray-500 mt-1">{{ conv.updated_at | date:'dd/MM/yyyy HH:mm' }}</p>
                    </div>
                    <button (click)="confirmDeleteConversation(conv, $event)" class="text-red-500 hover:text-red-700 ml-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
                    </button>
                  </div>
                </div>
              }
            </div>
          } @else {
          @if (messages().length === 0) {
            <div class="text-center py-8">
              <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <p class="text-sm text-gray-600 mb-2">Como posso ajudar?</p>
              @if (suggestedQuestions().length > 0) {
                <div class="space-y-2 mt-4">
                  @for (question of suggestedQuestions(); track question) {
                    <button (click)="askQuestion(question)" class="w-full text-left text-xs bg-white p-3 rounded-lg hover:bg-slate-50 transition border border-gray-200 text-gray-700">
                      {{ question }}
                    </button>
                  }
                </div>
              }
            </div>
          }
          @for (msg of messages(); track msg.timestamp) {
            <div [class]="msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'">
              @if (msg.role === 'user') {
                <div class="bg-slate-800 text-white rounded-2xl rounded-br-sm px-4 py-2 max-w-[80%]">
                  <p class="text-sm whitespace-pre-wrap">{{ msg.content }}</p>
                </div>
              } @else {
                <div class="bg-white text-gray-800 rounded-2xl rounded-bl-sm px-4 py-3 max-w-[85%] border border-gray-200 space-y-3">
                  @if (isStructuredResponse(msg.content)) {
                    <!-- Answer -->
                    <div class="text-sm text-gray-800 leading-relaxed" [innerHTML]="formatMarkdown(msg.content.answer)"></div>
                    
                    <!-- Key Points -->
                    @if (msg.content.key_points?.length > 0) {
                      <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p class="text-xs font-semibold text-blue-900 mb-2 flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                          Pontos-chave
                        </p>
                        <ul class="space-y-1">
                          @for (point of msg.content.key_points; track point) {
                            <li class="text-xs text-blue-800 flex items-start gap-2">
                              <span class="text-blue-500 mt-0.5">•</span>
                              <span>{{ point }}</span>
                            </li>
                          }
                        </ul>
                      </div>
                    }
                    
                    <!-- Action Items -->
                    @if (msg.content.action_items?.length > 0) {
                      <div class="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p class="text-xs font-semibold text-green-900 mb-2 flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
                          Ações recomendadas
                        </p>
                        <ul class="space-y-2">
                          @for (item of msg.content.action_items; track item.action) {
                            <li class="text-xs flex items-start gap-2">
                              <span [class]="getPriorityClass(item.priority)">{{ getPriorityLabel(item.priority) }}</span>
                              <span class="text-green-800 flex-1">{{ item.action }}</span>
                            </li>
                          }
                        </ul>
                      </div>
                    }
                    
                    <!-- Warning -->
                    @if (msg.content.warning) {
                      <div class="bg-amber-50 border border-amber-300 rounded-lg p-3 flex items-start gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" class="flex-shrink-0 mt-0.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                        <p class="text-xs text-amber-800">{{ msg.content.warning }}</p>
                      </div>
                    }
                  } @else {
                    <p class="text-sm whitespace-pre-wrap">{{ msg.content }}</p>
                  }
                </div>
              }
            </div>
          }
          @if (isLoading()) {
            <div class="flex justify-start">
              <div class="bg-white text-gray-800 rounded-2xl rounded-bl-sm px-4 py-3 border border-gray-200">
                @if (statusMessage() || countdown() > 0) {
                  <div class="text-sm text-gray-600">
                    @if (statusMessage()) {
                      <p class="mb-1">{{ statusMessage() }}</p>
                    }
                    @if (countdown() > 0) {
                      <p class="text-xs text-gray-500">Aguardando {{ countdown() }}s...</p>
                    }
                  </div>
                } @else {
                  <div class="flex gap-1">
                    <div class="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
                    <div class="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
                    <div class="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
                  </div>
                }
              </div>
            </div>
          }
          }
        </div>

        <div class="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
          <form (submit)="sendMessage($event)" class="flex gap-2">
            <input [(ngModel)]="userInput" name="message" type="text" placeholder="Digite sua pergunta..." class="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-sm" [disabled]="isLoading()">
            <button type="submit" [disabled]="!userInput().trim() || isLoading()" class="bg-slate-800 text-white p-3 rounded-lg hover:bg-slate-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
            </button>
          </form>
        </div>
      </div>
    }

    @if (!isOpen()) {
      <button (click)="toggle()" class="fixed bottom-6 right-6 w-14 h-14 bg-slate-800 text-white rounded-full shadow-lg hover:bg-slate-700 transition flex items-center justify-center z-50">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        @if (hasUnreadSuggestion()) {
          <span class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
        }
      </button>
    }

    <!-- Delete Conversation Modal -->
    @if (deleteConfirmConversation()) {
      <div class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[60] backdrop-blur-sm" (click)="deleteConfirmConversation.set(null)">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md" (click)="$event.stopPropagation()">
          <div class="p-6">
            <div class="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 text-center mb-2">Excluir Conversa?</h3>
            <p class="text-gray-600 text-center mb-6">Tem certeza que deseja excluir esta conversa? Esta ação não pode ser desfeita.</p>
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <p class="text-sm text-gray-800 font-medium line-clamp-2">{{ deleteConfirmConversation()!.title }}</p>
            </div>
          </div>
          <div class="bg-gray-50 px-6 py-4 flex gap-3 justify-end rounded-b-2xl">
            <button (click)="deleteConfirmConversation.set(null)" class="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
            <button (click)="deleteConversation()" class="px-5 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors">Sim, excluir</button>
          </div>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AiChatComponent {
  contextData = input<any>(null);
  contextTitle = input<string>('');
  suggestedQuestions = input<string[]>([]);
  contextKey = input<string>(''); // Chave única para identificar o contexto (ex: 'debt-123', 'loan-456')
  
  isOpen = signal(false);
  messages = signal<Message[]>([]);
  userInput = signal('');
  isLoading = signal(false);
  statusMessage = signal<string>('');
  countdown = signal<number>(0);
  currentConversationId = signal<number | null>(null);
  hasUnreadSuggestion = signal(false);
  conversations = signal<any[]>([]);
  showHistory = signal(false);
  deleteConfirmConversation = signal<any>(null);
  messagesContainer = viewChild<ElementRef>('messagesContainer');

  constructor() {
    effect(() => {
      if (this.suggestedQuestions().length > 0 && !this.isOpen()) {
        this.hasUnreadSuggestion.set(true);
      }
    });

    effect(() => {
      const key = this.contextKey();
      if (key && this.isOpen()) {
        this.loadConversations();
      }
    });

    effect(() => {
      if (this.messages().length > 0) {
        this.scrollToBottom();
      }
    });
  }

  toggle() {
    this.isOpen.update(v => !v);
    if (this.isOpen()) {
      this.hasUnreadSuggestion.set(false);
      this.loadConversations();
    }
  }

  close() {
    this.isOpen.set(false);
  }

  newConversation() {
    this.currentConversationId.set(null);
    this.messages.set([]);
    this.showHistory.set(false);
  }

  async loadConversations() {
    try {
      const contextKey = this.contextKey();
      const url = contextKey 
        ? `${environment.apiUrl}/ai-chat/conversations?contextKey=${encodeURIComponent(contextKey)}`
        : `${environment.apiUrl}/ai-chat/conversations`;
      
      const response = await fetch(url);
      const conversations = await response.json();
      
      this.conversations.set(conversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  }

  async loadConversation(id: number) {
    try {
      const response = await fetch(`${environment.apiUrl}/ai-chat/conversations/${id}`);
      const conversation = await response.json();
      
      this.currentConversationId.set(conversation.id);
      this.messages.set(conversation.messages || []);
      this.showHistory.set(false);
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  }

  confirmDeleteConversation(conversation: any, event: Event) {
    event.stopPropagation();
    this.deleteConfirmConversation.set(conversation);
  }

  async deleteConversation() {
    const conv = this.deleteConfirmConversation();
    if (!conv) return;
    
    try {
      await fetch(`${environment.apiUrl}/ai-chat/conversations/${conv.id}`, { method: 'DELETE' });
      await this.loadConversations();
      if (this.currentConversationId() === conv.id) {
        this.newConversation();
      }
      this.deleteConfirmConversation.set(null);
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  }

  askQuestion(question: string) {
    this.userInput.set(question);
    this.sendMessage(new Event('submit'));
  }

  isStructuredResponse(content: any): content is StructuredResponse {
    return typeof content === 'object' && content !== null && 'answer' in content;
  }

  formatMarkdown(text: string): string {
    let html = text;
    
    // Headers
    html = html.replace(/^### (.+)$/gm, '<h3 class="text-base font-bold text-gray-900 mt-3 mb-2">$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold text-gray-900 mt-4 mb-2">$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold text-gray-900 mt-4 mb-3">$1</h1>');
    
    // Bold and italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
    html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">$1</code>');
    
    // Lists - convert to proper HTML lists
    const lines = html.split('\n');
    const processed: string[] = [];
    let inList = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const isListItem = /^[\*\-] /.test(line);
      
      if (isListItem) {
        if (!inList) {
          processed.push('<ul class="list-disc list-inside space-y-1 ml-2 my-2">');
          inList = true;
        }
        const content = line.replace(/^[\*\-] /, '');
        processed.push(`<li class="text-sm text-gray-700">${content}</li>`);
      } else {
        if (inList) {
          processed.push('</ul>');
          inList = false;
        }
        processed.push(line);
      }
    }
    
    if (inList) {
      processed.push('</ul>');
    }
    
    html = processed.join('\n');
    
    // Paragraphs
    html = html.replace(/\n\n/g, '</p><p class="text-sm text-gray-700 mb-2">');
    html = html.replace(/\n/g, '<br/>');
    html = `<p class="text-sm text-gray-700 mb-2">${html}</p>`;
    
    return html;
  }

  getPriorityClass(priority: string): string {
    const classes = {
      high: 'px-2 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-semibold uppercase',
      medium: 'px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-[10px] font-semibold uppercase',
      low: 'px-2 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-semibold uppercase'
    };
    return classes[priority as keyof typeof classes] || classes.medium;
  }

  getPriorityLabel(priority: string): string {
    const labels = { high: 'Alta', medium: 'Média', low: 'Baixa' };
    return labels[priority as keyof typeof labels] || 'Média';
  }

  scrollToBottom() {
    requestAnimationFrame(() => {
      const container = this.messagesContainer()?.nativeElement;
      if (container) {
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
      }
    });
  }
  
  private settingsService = inject(SettingsService);
  private geminiService = inject(GeminiService);

  async sendMessage(event: Event) {
    event.preventDefault();
    const message = this.userInput().trim();
    if (!message || this.isLoading()) return;

    this.messages.update(msgs => [...msgs, { 
      role: 'user', 
      content: message, 
      timestamp: new Date().toISOString() 
    }]);
    this.userInput.set('');
    this.isLoading.set(true);
    this.scrollToBottom();

    try {
      for await (const data of this.geminiService.sendChatMessageStream({
        conversationId: this.currentConversationId(),
        message,
        context: this.contextData(),
        contextKey: this.contextKey()
      })) {
        if (data.status) {
          this.statusMessage.set(data.status);
          this.scrollToBottom();
        }
        
        if (data.countdown !== undefined) {
          this.countdown.set(data.countdown);
          this.scrollToBottom();
        }
        
        if (data.chunk) {
          this.statusMessage.set('');
          this.countdown.set(0);
          this.scrollToBottom();
        }
        
        if (data.structured) {
          this.messages.update(msgs => [...msgs, {
            role: 'assistant',
            content: data.structured,
            timestamp: new Date().toISOString()
          }]);
          this.statusMessage.set('');
          this.countdown.set(0);
          this.scrollToBottom();
        }
        
        if (data.conversationId) {
          this.currentConversationId.set(data.conversationId);
        }
        
        if (data.error) {
          this.messages.update(msgs => [...msgs, {
            role: 'assistant',
            content: `Erro: ${data.error}`,
            timestamp: new Date().toISOString()
          }]);
          this.statusMessage.set('');
          this.countdown.set(0);
          this.scrollToBottom();
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      this.messages.update(msgs => [...msgs, {
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro. Tente novamente.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      this.isLoading.set(false);
      this.statusMessage.set('');
      this.countdown.set(0);
    }
  }
}
