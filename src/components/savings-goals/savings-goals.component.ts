import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { AiChatComponent } from '../ai-chat/ai-chat.component';
import { DeleteConfirmationModalComponent } from '../delete-confirmation-modal/delete-confirmation-modal.component';
import { ToastMessageComponent } from '../toast-message/toast-message.component';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { SavingsGoal, GoalSimulation, AmortizationSimulation } from '../../models/debt.model';

@Component({
  selector: 'app-savings-goals',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, AiChatComponent, DeleteConfirmationModalComponent, ToastMessageComponent, EmptyStateComponent],
  template: `
    <!-- Goal Simulator Modal -->
    @if (isGoalSimulatorVisible()) {
      <div class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 backdrop-blur-sm p-4 animate-fade-in" (click)="closeGoalSimulator()">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col animate-scale-in" (click)="$event.stopPropagation()" style="max-height: 90vh;">
          <div class="p-6 border-b border-gray-200">
            <h3 class="font-bold text-xl text-gray-800">Simular Meta de Quitação</h3>
          </div>
          <div class="overflow-y-auto p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select [(ngModel)]="simulatorType" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition">
                <option value="debt">Cartão de Crédito</option>
                <option value="loan">Empréstimo</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Selecione</label>
              <select [(ngModel)]="simulatorTargetId" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition">
                @if (simulatorType() === 'debt') {
                  @for (debt of dataService.creditCardDebts(); track debt.id) {
                    <option [value]="debt.id">{{ debt.local }} - {{ debt.current_value | currency:'BRL' }}</option>
                  }
                } @else {
                  @for (loan of dataService.loans(); track loan.id) {
                    <option [value]="loan.id">{{ loan.creditor }} - {{ loan.remaining_value | currency:'BRL' }}</option>
                  }
                }
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Quanto pode guardar/mês?</label>
              <input [(ngModel)]="simulatorAmount" type="number" step="0.01" placeholder="R$ 0,00" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition">
            </div>
            @if (simulationResult()) {
              <div class="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 class="font-bold text-blue-900 mb-3">{{ simulationResult()!.targetName }}</h4>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between items-baseline">
                    <span class="text-blue-700 font-medium">Tempo necessário:</span>
                    <span class="font-bold text-gray-900">{{ simulationResult()!.monthsToSave }} meses</span>
                  </div>
                  <div class="flex justify-between items-baseline">
                    <span class="text-blue-700 font-medium">Valor futuro da dívida:</span>
                    <span class="font-bold text-red-600">{{ simulationResult()!.futureValue | currency:'BRL' }}</span>
                  </div>
                  @if (simulationResult()!.hasOffer) {
                    <div class="p-3 bg-green-50 rounded-lg border border-green-200 mt-3">
                      <p class="text-xs text-green-800 font-medium">💡 {{ simulationResult()!.recommendation }}</p>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
          <div class="p-6 border-t border-gray-200 flex gap-4 justify-end">
            <button (click)="closeGoalSimulator()" class="bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-5 rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
            @if (simulationResult()) {
              <button (click)="createGoalFromSimulation()" class="bg-green-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-green-700 transition-colors">Criar Meta</button>
            } @else {
              <button (click)="runSimulation()" [disabled]="!simulatorTargetId() || !simulatorAmount()" class="bg-slate-800 text-white font-semibold py-2 px-5 rounded-lg hover:bg-slate-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">Simular</button>
            }
          </div>
        </div>
      </div>
    }

    <!-- Amortization Simulator Modal -->
    @if (isAmortSimulatorVisible()) {
      <div class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 backdrop-blur-sm p-4 animate-fade-in" (click)="closeAmortSimulator()">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col animate-scale-in" (click)="$event.stopPropagation()" style="max-height: 90vh;">
          <div class="p-6 border-b border-gray-200">
            <h3 class="font-bold text-xl text-gray-800">Simular Amortização</h3>
          </div>
          <div class="overflow-y-auto p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Empréstimo</label>
              <select [(ngModel)]="amortLoanId" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition">
                @for (loan of dataService.loans(); track loan.id) {
                  <option [value]="loan.id">{{ loan.creditor }} - {{ loan.remaining_installments }} parcelas restantes</option>
                }
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Valor para amortizar</label>
              <input [(ngModel)]="amortAmount" type="number" step="0.01" placeholder="R$ 0,00" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition">
            </div>
            @if (amortizationResult()) {
              <div class="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 class="font-bold text-green-900 mb-3">{{ amortizationResult()!.loanName }}</h4>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between items-baseline">
                    <span class="text-green-700 font-medium">Parcelas antecipadas:</span>
                    <span class="font-bold text-gray-900">{{ amortizationResult()!.installmentsSaved }}</span>
                  </div>
                  <div class="flex justify-between items-baseline">
                    <span class="text-green-700 font-medium">Juros economizados:</span>
                    <span class="font-bold text-green-600">{{ amortizationResult()!.interestSaved | currency:'BRL' }}</span>
                  </div>
                  <div class="flex justify-between items-baseline">
                    <span class="text-green-700 font-medium">Parcelas restantes:</span>
                    <span class="font-bold text-gray-900">{{ amortizationResult()!.newRemainingInstallments }}</span>
                  </div>
                </div>
                <div class="mt-3 p-3 bg-white rounded-lg border border-green-300">
                  <p class="text-xs text-green-800 font-medium">💡 {{ amortizationResult()!.recommendation }}</p>
                </div>
              </div>
            }
          </div>
          <div class="p-6 border-t border-gray-200 flex gap-4 justify-end">
            <button (click)="closeAmortSimulator()" class="bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-5 rounded-lg hover:bg-gray-50 transition-colors">Fechar</button>
            @if (!amortizationResult()) {
              <button (click)="runAmortization()" [disabled]="!amortLoanId() || !amortAmount()" class="bg-slate-800 text-white font-semibold py-2 px-5 rounded-lg hover:bg-slate-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">Simular</button>
            }
          </div>
        </div>
      </div>
    }

    <!-- Update Progress Modal -->
    @if (updatingGoal()) {
      <div class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 backdrop-blur-sm p-4 animate-fade-in" (click)="closeUpdateModal()">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in" (click)="$event.stopPropagation()">
          <div class="p-6 border-b border-gray-200">
            <h3 class="font-bold text-xl text-gray-800">Atualizar Progresso</h3>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Meta</label>
              <p class="text-lg font-bold text-gray-900">{{ updatingGoal()!.goal_name }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Valor atual economizado</label>
              <p class="text-base text-gray-600">{{ updatingGoal()!.saved_amount | currency:'BRL' }}</p>
            </div>
            <div>
              <label for="newAmount" class="block text-sm font-medium text-gray-700 mb-1">Novo valor economizado</label>
              <input id="newAmount" [(ngModel)]="newSavedAmount" type="number" step="0.01" placeholder="0,00" class="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition">
            </div>
          </div>
          <div class="p-6 border-t border-gray-200 flex gap-4 justify-end">
            <button (click)="closeUpdateModal()" class="bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-5 rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
            <button (click)="confirmUpdateSaved()" class="bg-slate-800 text-white font-semibold py-2 px-5 rounded-lg hover:bg-slate-700 transition-colors">Salvar</button>
          </div>
        </div>
      </div>
    }

    <!-- Delete Confirmation Modal -->
    <app-delete-confirmation-modal
      [isOpen]="!!deleteConfirmGoal()"
      [title]="'Excluir meta?'"
      [message]="deleteConfirmGoal() ? 'Tem certeza que deseja excluir a meta ' + deleteConfirmGoal()!.goal_name + '? Esta ação não pode ser desfeita.' : ''"
      (confirmed)="confirmDeleteGoal()"
      (cancelled)="deleteConfirmGoal.set(null)"
    />

    <!-- Message Box -->
    <app-toast-message [message]="message()" (close)="message.set(null)" />

    <div class="space-y-6">
      <!-- Header -->
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900">Metas de Quitação</h2>
        <p class="text-gray-600 mt-1">Planeje e acompanhe suas economias</p>
      </div>

      <!-- Actions -->
      <div class="flex flex-col md:flex-row gap-4 mb-6">
        <div class="flex-1"></div>
        <div class="flex gap-3">
          <button (click)="openGoalSimulator()" class="flex items-center gap-2 bg-white text-gray-700 font-semibold py-2.5 px-5 rounded-lg hover:bg-gray-50 transition-colors border border-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            Simular Meta
          </button>
          <button (click)="openAmortSimulator()" class="flex items-center gap-2 bg-slate-800 text-white font-semibold py-2.5 px-5 rounded-lg hover:bg-slate-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            Simular Amortização
          </button>
        </div>
      </div>

      <!-- Active Goals -->
      @if (activeGoals().length > 0) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (goal of activeGoals(); track goal.id) {
            <div class="group relative bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-200 hover:border-gray-300">
              <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    </div>
                    <h4 class="text-lg font-bold text-gray-900 group-hover:text-slate-700 transition-colors">{{ goal.goal_name }}</h4>
                  </div>
                  <p class="text-xs text-gray-500 ml-12">{{ goal.target_type === 'debt' ? 'Cartão de Crédito' : 'Empréstimo' }}</p>
                </div>
              </div>

              <div class="space-y-2 mb-4">
                <div class="flex justify-between items-baseline">
                  <span class="text-sm font-medium text-gray-600">Meta</span>
                  <span class="text-base font-semibold text-gray-700">{{ goal.target_amount | currency:'BRL' }}</span>
                </div>
                <div class="flex justify-between items-baseline">
                  <span class="text-sm font-medium text-gray-600">Guardando/mês</span>
                  <span class="text-base font-semibold text-green-600">{{ goal.monthly_contribution | currency:'BRL' }}</span>
                </div>
                <div class="bg-green-50 rounded-lg p-3 border border-green-200">
                  <div class="flex justify-between items-baseline">
                    <span class="text-sm font-medium text-green-700">Economizado</span>
                    <span class="text-2xl font-bold text-green-600">{{ goal.saved_amount | currency:'BRL' }}</span>
                  </div>
                </div>
              </div>

              <div class="mb-4">
                <div class="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Progresso</span>
                  <span class="font-semibold">{{ getProgress(goal) }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2.5">
                  <div class="bg-green-600 h-2.5 rounded-full transition-all" [style.width.%]="getProgress(goal)"></div>
                </div>
              </div>

              @if (goal.estimated_months) {
                <p class="text-xs text-gray-500 mb-4">Faltam {{ goal.estimated_months }} meses</p>
              }

              <div class="flex gap-2 pt-4 border-t border-gray-100">
                <button (click)="updateSaved(goal)" class="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-slate-50 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition-colors text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                  Atualizar
                </button>
                <button (click)="deleteGoal(goal)" class="flex items-center justify-center p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
            </div>
          }
        </div>
      }

      @if (activeGoals().length === 0) {
        <app-empty-state
          [title]="'Nenhuma meta criada'"
          [description]="'Use os simuladores acima para criar sua primeira meta'"
          [showButton]="false">
          <svg icon xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        </app-empty-state>
      }

      <!-- AI Insights -->
      @if (aiInsights()) {
        <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
            </div>
            <div class="flex-1">
              <h4 class="font-bold text-gray-900 mb-2 flex items-center gap-2">
                💡 Insights da IA
                <button (click)="refreshInsights()" [disabled]="loadingInsights()" class="text-blue-600 hover:text-blue-700 disabled:opacity-50">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" [class.animate-spin]="loadingInsights()"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
                </button>
              </h4>
              <div class="prose prose-sm max-w-none text-gray-700" [innerHTML]="aiInsights()"></div>
            </div>
          </div>
        </div>
      } @else if (activeGoals().length > 0 && !loadingInsights()) {
        <button (click)="generateInsights()" class="w-full py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-dashed border-blue-300 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all text-blue-700 font-medium flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
          Gerar insights com IA sobre minhas metas
        </button>
      }
    </div>

    <app-ai-chat 
      [contextData]="chatContext()"
      [contextTitle]="'Metas de Quitação'"
      [suggestedQuestions]="suggestedQuestions()"
      [contextKey]="'savings-goals'"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SavingsGoalsComponent {
  dataService = inject(DataService);

  savingsGoals = this.dataService.savingsGoals;
  activeGoals = computed(() => this.savingsGoals().filter(g => g.status === 'active'));

  simulatorType = signal<'debt' | 'loan'>('debt');
  simulatorTargetId = signal<number | null>(null);
  simulatorAmount = signal<number>(0);
  simulationResult = signal<GoalSimulation | null>(null);

  amortLoanId = signal<number | null>(null);
  amortAmount = signal<number>(0);
  amortizationResult = signal<AmortizationSimulation | null>(null);

  isGoalSimulatorVisible = signal(false);
  isAmortSimulatorVisible = signal(false);
  updatingGoal = signal<SavingsGoal | null>(null);
  newSavedAmount = signal<number>(0);
  deleteConfirmGoal = signal<SavingsGoal | null>(null);
  message = signal<{type: 'success' | 'error', text: string} | null>(null);
  private messageTimeout?: number;
  loadingInsights = signal(false);
  aiInsights = signal<string | null>(null);

  chatContext = computed(() => ({
    type: 'savings',
    debts: this.dataService.creditCardDebts(),
    loans: this.dataService.loans(),
    income: this.dataService.income(),
    goals: this.savingsGoals()
  }));

  suggestedQuestions = computed(() => {
    const goals = this.activeGoals();
    const debts = this.dataService.creditCardDebts();
    const loans = this.dataService.loans();

    if (goals.length === 0) {
      if (debts.length > 0 || loans.length > 0) {
        return [
          'Qual dívida devo priorizar para criar uma meta?',
          'Quanto preciso economizar por mês para quitar em 1 ano?',
          'Vale a pena aceitar ofertas de negociação ou juntar dinheiro?'
        ];
      }
      return ['Como começar a criar metas de economia?'];
    }

    const slowestGoal = goals.reduce((max, g) => 
      (g.estimated_months || 0) > (max.estimated_months || 0) ? g : max, goals[0]
    );

    return [
      `Como acelerar a meta "${slowestGoal.goal_name}"?`,
      'Devo focar em uma meta ou dividir entre várias?',
      'Como ajustar minhas metas se minha renda mudar?'
    ];
  });

  constructor() {
    this.loadData();
  }

  private async loadData() {
    try {
      await Promise.all([
        this.dataService.fetchSavingsGoals(),
        this.dataService.fetchCreditCardDebts(),
        this.dataService.fetchLoans(),
        this.dataService.fetchIncome()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  }

  private showMessage(msg: {type: 'success' | 'error', text: string}) {
    this.message.set(msg);
    if (this.messageTimeout) clearTimeout(this.messageTimeout);
    this.messageTimeout = window.setTimeout(() => this.message.set(null), 5000);
  }

  getProgress(goal: SavingsGoal): number {
    return Math.min(100, Math.round((goal.saved_amount / goal.target_amount) * 100));
  }

  openGoalSimulator() {
    this.isGoalSimulatorVisible.set(true);
    this.simulationResult.set(null);
  }

  closeGoalSimulator() {
    this.isGoalSimulatorVisible.set(false);
    this.simulationResult.set(null);
    this.simulatorTargetId.set(null);
    this.simulatorAmount.set(0);
  }

  openAmortSimulator() {
    this.isAmortSimulatorVisible.set(true);
    this.amortizationResult.set(null);
  }

  closeAmortSimulator() {
    this.isAmortSimulatorVisible.set(false);
    this.amortizationResult.set(null);
    this.amortLoanId.set(null);
    this.amortAmount.set(0);
  }

  async runSimulation() {
    if (!this.simulatorTargetId() || !this.simulatorAmount()) return;
    
    try {
      const result = await this.dataService.simulateGoal(
        this.simulatorType(),
        this.simulatorTargetId()!,
        this.simulatorAmount()
      );
      this.simulationResult.set(result);
    } catch (error) {
      console.error('Simulation error:', error);
    }
  }

  async runAmortization() {
    if (!this.amortLoanId() || !this.amortAmount()) return;
    
    try {
      const result = await this.dataService.simulateAmortization(
        this.amortLoanId()!,
        this.amortAmount()
      );
      this.amortizationResult.set(result);
    } catch (error) {
      console.error('Amortization error:', error);
    }
  }

  async createGoalFromSimulation() {
    const sim = this.simulationResult();
    if (!sim) return;

    try {
      const goal: Omit<SavingsGoal, 'id' | 'created_at' | 'updated_at'> = {
        goal_name: `Quitar ${sim.targetName}`,
        target_type: this.simulatorType(),
        target_id: this.simulatorTargetId()!,
        target_amount: sim.targetAmount,
        monthly_contribution: sim.monthlyContribution,
        saved_amount: 0,
        estimated_months: sim.monthsToSave,
        target_date: null,
        status: 'active',
        notes: sim.recommendation,
        ai_suggestion: sim
      };

      await this.dataService.addSavingsGoal(goal);
      this.closeGoalSimulator();
      this.showMessage({type: 'success', text: 'Meta criada com sucesso!'});
    } catch (error: any) {
      this.showMessage({type: 'error', text: 'Falha ao criar meta'});
    }
  }

  updateSaved(goal: SavingsGoal) {
    this.updatingGoal.set(goal);
    this.newSavedAmount.set(goal.saved_amount);
  }

  closeUpdateModal() {
    this.updatingGoal.set(null);
    this.newSavedAmount.set(0);
  }

  async confirmUpdateSaved() {
    const goal = this.updatingGoal();
    if (!goal) return;

    const newAmount = this.newSavedAmount();
    if (isNaN(newAmount) || newAmount < 0) {
      this.showMessage({type: 'error', text: 'Valor inválido'});
      return;
    }

    try {
      const updated = { ...goal, saved_amount: newAmount };
      if (newAmount >= goal.target_amount) {
        updated.status = 'completed';
      }

      await this.dataService.updateSavingsGoal(updated);
      this.showMessage({type: 'success', text: 'Progresso atualizado com sucesso!'});
      this.closeUpdateModal();
    } catch (error: any) {
      this.showMessage({type: 'error', text: 'Falha ao atualizar progresso'});
    }
  }

  deleteGoal(goal: SavingsGoal) {
    this.deleteConfirmGoal.set(goal);
  }

  async confirmDeleteGoal() {
    const goal = this.deleteConfirmGoal();
    if (!goal?.id) return;

    try {
      await this.dataService.deleteSavingsGoal(goal.id);
      this.showMessage({type: 'success', text: 'Meta excluída com sucesso!'});
      this.deleteConfirmGoal.set(null);
    } catch (error: any) {
      this.showMessage({type: 'error', text: 'Falha ao excluir meta'});
      this.deleteConfirmGoal.set(null);
    }
  }

  async generateInsights() {
    this.loadingInsights.set(true);
    try {
      const goals = this.activeGoals();
      const debts = this.dataService.creditCardDebts();
      const loans = this.dataService.loans();
      const income = this.dataService.income();

      const totalIncome = income
        .filter(i => i.is_active && i.recurrence === 'monthly')
        .reduce((sum, i) => sum + i.amount, 0);

      const totalMonthlyCommitment = goals.reduce((sum, g) => sum + g.monthly_contribution, 0);

      const prompt = `Analise as metas de quitação e forneça insights práticos e acionáveis:

Metas Ativas:
${goals.map(g => `- ${g.goal_name}: Meta R$ ${g.target_amount.toFixed(2)}, Economizado R$ ${g.saved_amount.toFixed(2)}, Guardando R$ ${g.monthly_contribution.toFixed(2)}/mês, Faltam ${g.estimated_months} meses`).join('\n')}

Renda Mensal: R$ ${totalIncome.toFixed(2)}
Compromisso Mensal Total: R$ ${totalMonthlyCommitment.toFixed(2)}
Dívidas Ativas: ${debts.filter(d => !d.negotiated).length}
Empréstimos Ativos: ${loans.filter(l => l.status === 'Ativo').length}

Forneça:
1. Análise da viabilidade das metas atuais
2. Sugestão de priorização (qual meta focar primeiro)
3. Dica prática para acelerar o progresso
4. Alerta se houver risco de não cumprir as metas

Seja direto, use bullet points e destaque números importantes.`;

      const response = await fetch(`${this.dataService['environment'].apiUrl}/gemini/analyze-goals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) throw new Error('Erro na requisição');

      const data = await response.json();
      const text = data.text || 'Não foi possível gerar insights.';
      
      this.aiInsights.set(text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>'));
    } catch (error) {
      this.showMessage({type: 'error', text: 'Falha ao gerar insights'});
    } finally {
      this.loadingInsights.set(false);
    }
  }

  refreshInsights() {
    this.aiInsights.set(null);
    this.generateInsights();
  }
}
