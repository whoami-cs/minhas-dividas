import { Component, inject, signal, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { GeminiService } from '../../services/gemini.service';
import { CreditCardDebt } from '../../models/debt.model';
import { ParseDatePipe } from '../../pipes/parse-date.pipe';
import { CreditCardDetailComponent } from '../credit-card-detail/credit-card-detail.component';
import { AiChatComponent } from '../ai-chat/ai-chat.component';
import { marked } from 'marked';

@Component({
  selector: 'app-credit-card-debts',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, CurrencyPipe, DatePipe, ParseDatePipe, CreditCardDetailComponent, AiChatComponent],
  template: `
    @if (selectedDebt() || isAddingNew()) {
      <app-credit-card-detail 
        [debt]="selectedDebt() || newDebt()!" 
        [isEditMode]="isEditMode()"
        (close)="closeDetail()" 
        (debtUpdated)="handleDebtUpdate($event)" 
        (delete)="handleDeleteFromDetail($event)"
      ></app-credit-card-detail>
    } @else {
    <div class="space-y-6">
      <!-- Header -->
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900">{{ pageTitle() }}</h2>
        <p class="text-gray-600 mt-1">{{ pageSubtitle() }}</p>
      </div>
      <!-- Filters and Actions -->
      <div class="flex flex-col md:flex-row gap-4 mb-6">
        <div class="flex-1 flex gap-3">
          <div class="relative flex-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input [(ngModel)]="searchTerm" placeholder="Buscar por local..." class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition">
          </div>
          <select [(ngModel)]="sortBy" class="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition bg-white">
            <option value="current_value">Maior valor</option>
            <option value="growth_percentage">Maior crescimento</option>
            <option value="local">Nome (A-Z)</option>
          </select>
          <select [(ngModel)]="filterStatus" class="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition bg-white">
            <option value="all">Todos</option>
            <option value="active">Ativos</option>
            <option value="negotiated">Negociados</option>
          </select>
        </div>
        <button (click)="openForm()" class="flex items-center gap-2 bg-slate-800 text-white font-semibold py-2.5 px-5 rounded-lg hover:bg-slate-700 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          Adicionar dívida
        </button>
      </div>

      <!-- Message Box -->
      @if (message()) {
        <div class="fixed bottom-8 right-8 z-50 max-w-sm">
          <div
            [ngClass]="{
              'bg-red-100 border-red-500 text-red-700': message()?.type === 'error',
              'bg-green-100 border-green-500 text-green-700': message()?.type === 'success'
            }"
            class="border-l-4 p-4 rounded-lg shadow-lg"
            role="alert">
            <div class="flex">
              <div class="py-1">
                <svg [ngClass]="{'text-red-500': message()?.type === 'error', 'text-green-500': message()?.type === 'success'}" class="h-6 w-6 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div class="flex-grow">
                <p class="font-bold">{{ message()?.type === 'error' ? 'Erro' : 'Sucesso' }}</p>
                <p class="text-sm">{{ message()?.text }}</p>
                @if (message()?.details) {
                  <button (click)="showErrorDetails.set(!showErrorDetails())" class="text-xs text-gray-600 hover:underline mt-2">
                    {{ showErrorDetails() ? 'Ocultar' : 'Ver' }} detalhes
                  </button>
                  @if (showErrorDetails()) {
                    <pre class="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto whitespace-pre-wrap break-words">{{ message()?.details }}</pre>
                  }
                }
              </div>
              <button (click)="message.set(null); showErrorDetails.set(false);" class="ml-4 -mt-2 -mr-2 text-gray-500 hover:text-gray-700">&times;</button>
            </div>
          </div>
        </div>
      }

      <!-- Debt Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (debt of filteredAndSortedDebts(); track debt.id) {
          <div (click)="selectedDebt.set(debt)" class="group relative bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-200 hover:border-gray-300">
            <!-- Card Header -->
            <div class="flex justify-between items-start mb-4">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <div class="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e11d48" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                  </div>
                  <h4 class="text-lg font-bold text-gray-900 group-hover:text-slate-700 transition-colors">{{ debt.local }}</h4>
                </div>
                <p class="text-xs text-gray-500 ml-12">Última atualização: {{ debt.last_update_date | parseDate | date:'dd/MM/yyyy' }}</p>
              </div>
              <div class="flex flex-col gap-1.5">
                @if (debt.negotiated) {
                  <span class="px-3 py-1.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-700">Negociado</span>
                }
                @if (debt.is_frozen) {
                  <span class="px-3 py-1.5 text-xs font-bold rounded-full bg-blue-100 text-blue-700 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6h4"/><path d="M2 10h4"/><path d="M2 14h4"/><path d="M2 18h4"/><path d="M18.59 6.41 17.17 5l-4.58 4.59L8 5l-1.41 1.41L11.17 11l-4.58 4.59L8 17l4.59-4.59L17.17 17 18.59 15.59 14 11z"/></svg>
                    Congelada
                  </span>
                }
                @if (!debt.negotiated && !debt.is_frozen) {
                  <span class="px-3 py-1.5 text-xs font-bold rounded-full bg-slate-100 text-slate-700">+{{ debt.growth_percentage }}%</span>
                }
              </div>
            </div>

            <!-- Card Content -->
            <div class="space-y-3 mb-6">
              @if (debt.negotiated) {
                <div class="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                  <div class="flex justify-between items-baseline mb-2">
                    <span class="text-sm font-medium text-gray-700">Valor original</span>
                    <span class="text-xl font-bold text-gray-900">{{ debt.current_value | currency:'BRL' }}</span>
                  </div>
                  @if (debt.discount_percentage) {
                    <div class="flex justify-between items-baseline mb-2">
                      <span class="text-sm font-medium text-gray-700">Desconto</span>
                      <span class="text-xl font-bold text-green-600">{{ debt.discount_percentage }}%</span>
                    </div>
                  }
                  @if (debt.paid_value) {
                    <div class="flex justify-between items-baseline">
                      <span class="text-sm font-medium text-gray-700">Valor pago</span>
                      <span class="text-xl font-bold text-gray-900">{{ debt.paid_value | currency:'BRL' }}</span>
                    </div>
                  }
                </div>
              } @else {
                <div class="space-y-2">
                  <div class="flex justify-between items-baseline">
                    <span class="text-sm font-medium text-gray-600">Original</span>
                    <span class="text-base font-semibold text-gray-700">{{ debt.original_value | currency:'BRL' }}</span>
                  </div>
                  <div class="flex justify-between items-baseline">
                    <span class="text-sm font-medium text-gray-600">Atual</span>
                    <span class="text-2xl font-bold text-red-600">{{ debt.current_value | currency:'BRL' }}</span>
                  </div>
                  <div class="bg-orange-50 rounded-lg p-3 border border-orange-200">
                    <div class="flex justify-between items-baseline">
                      <span class="text-xs font-medium text-orange-700">Próximo mês</span>
                      <span class="text-lg font-bold text-orange-600">{{ debt.next_month_estimate | currency:'BRL' }}</span>
                    </div>
                  </div>
                </div>
              }
            </div>

            <!-- Card Actions -->
            <div class="flex gap-2 pt-4 border-t border-gray-100">
              <button (click)="editDebt(debt, $event)" class="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-slate-50 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition-colors text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                Editar
              </button>
              <button (click)="deleteDebt(debt); $event.stopPropagation()" class="flex items-center justify-center p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
        } @empty {
          <div class="col-span-full text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-300">
            <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
            </div>
            <h4 class="text-xl font-bold text-gray-900 mb-2">Nenhuma dívida cadastrada</h4>
            <p class="text-gray-500 mb-6">Comece adicionando sua primeira dívida</p>
            <button (click)="openForm()" class="inline-flex items-center gap-2 bg-slate-800 text-white font-semibold py-2.5 px-5 rounded-lg hover:bg-slate-700 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              Adicionar primeira dívida
            </button>
          </div>
        }
      </div>

      <!-- Loading Modal -->
      @if (isLoading()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" style="z-index: 9999; display: flex; justify-content: center; align-items: center; margin: 0 !important;">
          <div class="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md" style="margin: 0 !important;">
            <div class="flex items-center">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600"></div>
              <p class="ml-4 text-gray-700 font-semibold">{{ loadingStep() }}</p>
            </div>
          </div>
        </div>
      }

      <!-- Delete Confirmation Modal -->
      @if (deleteConfirmDebt()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 backdrop-blur-sm animate-fade-in" (click)="deleteConfirmDebt.set(null)">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in" (click)="$event.stopPropagation()">
            <div class="p-6">
              <div class="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900 text-center mb-2">Excluir dívida?</h3>
              <p class="text-gray-600 text-center mb-6">Tem certeza que deseja excluir a dívida do cartão <span class="font-semibold">{{ deleteConfirmDebt()!.local }}</span>? Esta ação não pode ser desfeita.</p>
              <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p class="text-sm text-red-800 font-medium">Valor atual: {{ deleteConfirmDebt()!.current_value | currency:'BRL' }}</p>
              </div>
            </div>
            <div class="bg-gray-50 px-6 py-4 flex gap-3 justify-end rounded-b-2xl">
              <button (click)="deleteConfirmDebt.set(null)" class="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
              <button (click)="confirmDeleteDebt()" class="px-5 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors">Sim, excluir</button>
            </div>
          </div>
        </div>
      }

      <!-- Footer Summary -->
      @if (filteredAndSortedDebts().length > 0) {
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200">
            <div class="flex items-center justify-between mb-3">
              <p class="text-sm font-medium text-gray-600">Valor original</p>
              <div class="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/></svg>
              </div>
            </div>
            <p class="text-4xl font-bold text-gray-900 mb-1">{{ totalOriginalValue() | currency:'BRL' }}</p>
            <p class="text-xs text-gray-500">Sem juros</p>
          </div>
          <div class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200">
            <div class="flex items-center justify-between mb-3">
              <p class="text-sm font-medium text-gray-600">Total atual</p>
              <div class="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e11d48" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
            </div>
            <p class="text-4xl font-bold text-gray-900 mb-1">{{ totalCurrentValue() | currency:'BRL' }}</p>
            <p class="text-xs text-gray-500">{{ filteredAndSortedDebts().length }} cartão(ões)</p>
          </div>
          <div class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200">
            <div class="flex items-center justify-between mb-3">
              <p class="text-sm font-medium text-gray-600">Próximo mês</p>
              <div class="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
              </div>
            </div>
            <p class="text-4xl font-bold text-gray-900 mb-1">{{ totalNextMonthEstimate() | currency:'BRL' }}</p>
            <p class="text-xs text-gray-500">Estimativa</p>
          </div>
        </div>
      }
    </div>
    }

    @if (!selectedDebt()) {
      <app-ai-chat 
        [contextData]="chatContext()"
        [contextTitle]="'Dívidas de Cartão'"
        [suggestedQuestions]="suggestedQuestions()"
        [contextKey]="'debts-list'"
      />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreditCardDebtsComponent {
  dataService = inject(DataService);
  private geminiService = inject(GeminiService);
  private fb = inject(FormBuilder);

  creditCardDebts = this.dataService.creditCardDebts;
  selectedDebt = this.dataService.selectedDebt;
  isAddingNew = signal(false);
  isEditMode = signal(false);
  newDebt = signal<CreditCardDebt | null>(null);
  isAnalysisVisible = signal(false);
  analysisResult = signal('');
  isLoadingAnalysis = signal(false);
  message = signal<{type: 'success' | 'error', text: string, details?: string} | null>(null);
  showErrorDetails = signal(false);
  private messageTimeout?: number;

  private showMessage(msg: {type: 'success' | 'error', text: string, details?: string}) {
    this.message.set(msg);
    if (this.messageTimeout) clearTimeout(this.messageTimeout);
    this.messageTimeout = window.setTimeout(() => {
      this.message.set(null);
      this.showErrorDetails.set(false);
    }, 5000);
  }
  deleteConfirmDebt = signal<CreditCardDebt | null>(null);



  searchTerm = signal('');
  sortBy = signal<'local' | 'current_value' | 'growth_percentage'>('current_value');
  filterStatus = signal<'all' | 'negotiated' | 'active'>('all');

  filteredAndSortedDebts = computed(() => {
    let debts = this.creditCardDebts();
    
    // Filter by search
    if (this.searchTerm()) {
      debts = debts.filter(d => d.local.toLowerCase().includes(this.searchTerm().toLowerCase()));
    }
    
    // Filter by status
    if (this.filterStatus() === 'negotiated') {
      debts = debts.filter(d => d.negotiated);
    } else if (this.filterStatus() === 'active') {
      debts = debts.filter(d => !d.negotiated);
    }
    
    // Sort
    return [...debts].sort((a, b) => {
      if (this.sortBy() === 'local') return a.local.localeCompare(b.local);
      if (this.sortBy() === 'current_value') return b.current_value - a.current_value;
      if (this.sortBy() === 'growth_percentage') return b.growth_percentage - a.growth_percentage;
      return 0;
    });
  });

  totalCurrentValue = computed(() => this.filteredAndSortedDebts().reduce((acc, debt) => acc + debt.current_value, 0));
  totalOriginalValue = computed(() => this.filteredAndSortedDebts().reduce((acc, debt) => acc + debt.original_value, 0));
  totalNextMonthEstimate = computed(() => this.filteredAndSortedDebts().reduce((acc, debt) => acc + (debt.is_frozen ? 0 : debt.next_month_estimate), 0));

  pageTitle = computed(() => 'Dívidas');

  pageSubtitle = computed(() => 'Gerencie suas dívidas de cartão de crédito');

  chatContext = computed(() => ({
    type: 'debts',
    debts: this.creditCardDebts(),
    loans: this.dataService.loans(),
    income: this.dataService.income()
  }));

  suggestedQuestions = computed(() => {
    const debts = this.creditCardDebts();
    if (debts.length === 0) return ['Como começar a organizar minhas dívidas?'];
    
    const highestGrowth = debts.reduce((max, d) => d.growth_percentage > max.growth_percentage ? d : max, debts[0]);
    return [
      `Qual dívida devo priorizar primeiro?`,
      `Como negociar a dívida do ${highestGrowth.local}?`,
      `Quanto vou economizar se quitar agora?`
    ];
  });

  constructor() {
    this.loadData();
  }

  private async loadData() {
    this.isLoading.set(true);
    this.loadingStep.set('Carregando dívidas...');
    try {
      await this.dataService.fetchCreditCardDebts();
    } catch (error) {
      console.error('Erro ao carregar dívidas:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  openForm() {
    this.isAddingNew.set(true);
    this.isEditMode.set(true);
    this.newDebt.set({
      local: '',
      debt_date: '',
      original_value: 0,
      current_value: 0,
      growth_percentage: 0,
      interest_value: 0,
      last_update_date: '',
      next_month_estimate: 0,
      observation: null,
      negotiated: false,
      is_frozen: false
    } as CreditCardDebt);
  }

  closeDetail() {
    this.selectedDebt.set(null);
    this.isAddingNew.set(false);
    this.isEditMode.set(false);
    this.newDebt.set(null);
  }

  handleDebtUpdate(updatedDebt: CreditCardDebt) {
    this.selectedDebt.set(updatedDebt);
    this.isEditMode.set(false);
  }

  isLoading = signal(false);
  loadingStep = signal<string>('Carregando...');

  editDebt(debt: CreditCardDebt, event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.selectedDebt.set(debt);
    this.isEditMode.set(true);
  }



  deleteDebt(debt: CreditCardDebt) {
    this.deleteConfirmDebt.set(debt);
  }

  async confirmDeleteDebt() {
    const debt = this.deleteConfirmDebt();
    if (debt?.id) {
      this.isLoading.set(true);
      this.loadingStep.set('Excluindo dívida...');
      try {
        await this.dataService.deleteCreditCardDebt(debt.id);
        this.showMessage({type: 'success', text: 'Dívida excluída com sucesso!'});
        this.deleteConfirmDebt.set(null);
      } catch (error: any) {
        this.showMessage({type: 'error', text: 'Falha ao excluir dívida', details: error.message});
        this.deleteConfirmDebt.set(null);
      } finally {
        this.isLoading.set(false);
      }
    }
  }

  async handleDeleteFromDetail(id: number) {
    this.isLoading.set(true);
    this.loadingStep.set('Excluindo dívida...');
    try {
      await this.dataService.deleteCreditCardDebt(id);
      this.showMessage({type: 'success', text: 'Dívida excluída com sucesso!'});
      this.closeDetail();
    } catch (error: any) {
      this.showMessage({type: 'error', text: 'Falha ao excluir dívida', details: error.message});
    } finally {
      this.isLoading.set(false);
    }
  }

  async analyzeDebts() {
    this.isLoadingAnalysis.set(true);
    this.isAnalysisVisible.set(true);
    this.message.set(null);
    this.analysisResult.set('');
    
    try {
      let fullText = '';
      for await (const chunk of this.geminiService.generateSuggestionsStream(this.creditCardDebts())) {
        fullText += chunk;
        this.analysisResult.set(marked(fullText) as string);
      }

      if (fullText.includes('Ocorreu um erro')) {
        this.isAnalysisVisible.set(false);
        this.showMessage({type: 'error', text: 'Não foi possível gerar a análise.', details: fullText});
      }

    } catch(e: any) {
        this.isAnalysisVisible.set(false);
        this.showMessage({type: 'error', text: 'Ocorreu uma falha na comunicação com a IA.', details: e.message});
    } finally {
        this.isLoadingAnalysis.set(false);
    }
  }
}
