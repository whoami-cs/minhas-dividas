import { Component, inject, signal, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { Income } from '../../models/debt.model';
import { ParseDatePipe } from '../../pipes/parse-date.pipe';

@Component({
  selector: 'app-income',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, CurrencyPipe, DatePipe, ParseDatePipe],
  template: `
    <!-- Form Modal -->
    @if (isFormVisible()) {
      <div class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 backdrop-blur-sm p-4 animate-fade-in" (click)="closeForm()">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col animate-scale-in" (click)="$event.stopPropagation()" style="max-height: 90vh;">
          <div class="p-6 border-b border-gray-200">
            <h3 class="font-bold text-xl text-gray-800">{{ editingIncome() ? 'Editar' : 'Adicionar' }} rendimento</h3>
          </div>
          <form [formGroup]="incomeForm" (ngSubmit)="saveIncome()" class="flex flex-col flex-1 overflow-hidden">
            <div class="overflow-y-auto p-6 space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <div>
                  <label for="source" class="block text-sm font-medium text-gray-700 mb-1">Fonte</label>
                  <input id="source" formControlName="source" placeholder="Ex: Salário" class="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition">
                </div>
                <div>
                  <label for="amount" class="block text-sm font-medium text-gray-700 mb-1">Valor</label>
                  <input id="amount" formControlName="amount" type="number" step="0.01" placeholder="0,00" class="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition">
                </div>
                <div>
                  <label for="income_date" class="block text-sm font-medium text-gray-700 mb-1">Data</label>
                  <input id="income_date" formControlName="income_date" type="date" class="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition">
                </div>
                <div>
                  <label for="recurrence" class="block text-sm font-medium text-gray-700 mb-1">Recorrência</label>
                  <select id="recurrence" formControlName="recurrence" class="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition bg-white">
                    <option value="unique">Único</option>
                    <option value="monthly">Mensal</option>
                    <option value="weekly">Semanal</option>
                    <option value="annual">Anual</option>
                  </select>
                </div>
                <div>
                  <label for="category" class="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                  <input id="category" formControlName="category" placeholder="Ex: Trabalho" class="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition">
                </div>
                <div class="flex items-center pt-7">
                  <label class="flex items-center gap-2">
                    <input type="checkbox" formControlName="is_active" class="w-4 h-4 text-slate-600 border-gray-300 rounded focus:ring-slate-500">
                    <span class="text-sm font-medium text-gray-700">Ativo</span>
                  </label>
                </div>
                <div class="md:col-span-2">
                  <label for="observations" class="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                  <textarea id="observations" formControlName="observations" placeholder="Informações adicionais..." class="p-3 border border-gray-300 rounded-lg w-full h-24 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition"></textarea>
                </div>
              </div>
            </div>
            <div class="p-6 border-t border-gray-200 flex gap-4 justify-end">
              <button type="button" (click)="closeForm()" class="bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-5 rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
              <button type="submit" [disabled]="incomeForm.invalid" class="bg-slate-800 text-white font-semibold py-2 px-5 rounded-lg hover:bg-slate-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">Salvar</button>
            </div>
          </form>
        </div>
      </div>
    }

    <div class="space-y-6">
      <!-- Header -->
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900">Rendimentos</h2>
        <p class="text-gray-600 mt-1">Gerencie suas fontes de renda</p>
      </div>

      <!-- Filters and Actions -->
      <div class="flex flex-col md:flex-row gap-4 mb-6">
        <div class="flex-1 flex gap-3">
          <div class="relative flex-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input [(ngModel)]="searchTerm" placeholder="Buscar por fonte..." class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition">
          </div>
          <select [(ngModel)]="filterRecurrence" class="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition bg-white">
            <option value="all">Todos</option>
            <option value="monthly">Mensal</option>
            <option value="unique">Único</option>
            <option value="weekly">Semanal</option>
            <option value="annual">Anual</option>
          </select>
        </div>
        <button (click)="openForm()" class="flex items-center gap-2 bg-slate-800 text-white font-semibold py-2.5 px-5 rounded-lg hover:bg-slate-700 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          Adicionar rendimento
        </button>
      </div>

      <!-- Message Box -->
      @if (message()) {
        <div class="fixed bottom-8 right-8 z-50 max-w-sm">
          <div [ngClass]="{'bg-red-100 border-red-500 text-red-700': message()?.type === 'error', 'bg-green-100 border-green-500 text-green-700': message()?.type === 'success'}" class="border-l-4 p-4 rounded-lg shadow-lg" role="alert">
            <div class="flex">
              <div class="py-1">
                <svg [ngClass]="{'text-red-500': message()?.type === 'error', 'text-green-500': message()?.type === 'success'}" class="h-6 w-6 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div class="flex-grow">
                <p class="font-bold">{{ message()?.type === 'error' ? 'Erro' : 'Sucesso' }}</p>
                <p class="text-sm">{{ message()?.text }}</p>
              </div>
              <button (click)="message.set(null)" class="ml-4 -mt-2 -mr-2 text-gray-500 hover:text-gray-700">&times;</button>
            </div>
          </div>
        </div>
      }

      <!-- Income Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (income of filteredIncome(); track income.id) {
          <div class="group relative bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-200 hover:border-gray-300">
            <!-- Card Header -->
            <div class="flex justify-between items-start mb-4">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <div class="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  </div>
                  <h4 class="text-lg font-bold text-gray-900">{{ income.source }}</h4>
                </div>
                <p class="text-xs text-gray-500 ml-12">{{ income.income_date | parseDate | date:'dd/MM/yyyy' }}</p>
              </div>
              <div class="flex flex-col gap-1.5">
                @if (income.is_active) {
                  <span class="px-3 py-1.5 text-xs font-bold rounded-full bg-green-100 text-green-700">Ativo</span>
                } @else {
                  <span class="px-3 py-1.5 text-xs font-bold rounded-full bg-gray-100 text-gray-700">Inativo</span>
                }
                <span class="px-3 py-1.5 text-xs font-bold rounded-full bg-blue-100 text-blue-700">{{ getRecurrenceLabel(income.recurrence) }}</span>
              </div>
            </div>

            <!-- Card Content -->
            <div class="space-y-3 mb-6">
              <div class="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div class="flex justify-between items-baseline">
                  <span class="text-sm font-medium text-gray-700">Valor</span>
                  <span class="text-2xl font-bold text-slate-700">{{ income.amount | currency:'BRL' }}</span>
                </div>
              </div>
              @if (income.category) {
                <div class="flex justify-between items-baseline">
                  <span class="text-sm font-medium text-gray-600">Categoria</span>
                  <span class="text-sm text-gray-900">{{ income.category }}</span>
                </div>
              }
            </div>

            <!-- Card Actions -->
            <div class="flex gap-2 pt-4 border-t border-gray-100">
              <button (click)="editIncome(income)" class="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-slate-50 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition-colors text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                Editar
              </button>
              <button (click)="deleteIncome(income)" class="flex items-center justify-center p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
        } @empty {
          <div class="col-span-full text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-300">
            <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <h4 class="text-xl font-bold text-gray-900 mb-2">Nenhum rendimento cadastrado</h4>
            <p class="text-gray-500 mb-6">Comece adicionando sua primeira fonte de renda</p>
            <button (click)="openForm()" class="inline-flex items-center gap-2 bg-slate-800 text-white font-semibold py-2.5 px-5 rounded-lg hover:bg-slate-700 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              Adicionar primeiro rendimento
            </button>
          </div>
        }
      </div>

      <!-- Delete Confirmation Modal -->
      @if (deleteConfirmIncome()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 backdrop-blur-sm animate-fade-in" (click)="deleteConfirmIncome.set(null)">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in" (click)="$event.stopPropagation()">
            <div class="p-6">
              <div class="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900 text-center mb-2">Excluir rendimento?</h3>
              <p class="text-gray-600 text-center mb-6">Tem certeza que deseja excluir o rendimento <span class="font-semibold">{{ deleteConfirmIncome()!.source }}</span>? Esta ação não pode ser desfeita.</p>
            </div>
            <div class="bg-gray-50 px-6 py-4 flex gap-3 justify-end rounded-b-2xl">
              <button (click)="deleteConfirmIncome.set(null)" class="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
              <button (click)="confirmDeleteIncome()" class="px-5 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors">Sim, excluir</button>
            </div>
          </div>
        </div>
      }

      <!-- Footer Summary -->
      @if (filteredIncome().length > 0) {
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200">
            <div class="flex items-center justify-between mb-3">
              <p class="text-sm font-medium text-gray-600">Total Mensal</p>
              <div class="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
            </div>
            <p class="text-4xl font-bold text-gray-900 mb-1">{{ totalMonthly() | currency:'BRL' }}</p>
            <p class="text-xs text-gray-500">Rendimentos recorrentes</p>
          </div>
          <div class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200">
            <div class="flex items-center justify-between mb-3">
              <p class="text-sm font-medium text-gray-600">Total Geral</p>
              <div class="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
              </div>
            </div>
            <p class="text-4xl font-bold text-gray-900 mb-1">{{ totalAll() | currency:'BRL' }}</p>
            <p class="text-xs text-gray-500">{{ filteredIncome().length }} fonte(s)</p>
          </div>
          <div class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200">
            <div class="flex items-center justify-between mb-3">
              <p class="text-sm font-medium text-gray-600">Fontes Ativas</p>
              <div class="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
            </div>
            <p class="text-4xl font-bold text-gray-900 mb-1">{{ activeCount() }}</p>
            <p class="text-xs text-gray-500">De {{ filteredIncome().length }} total</p>
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncomeComponent {
  private dataService = inject(DataService);
  private fb = inject(FormBuilder);

  income = this.dataService.income;
  isFormVisible = signal(false);
  editingIncome = signal<Income | null>(null);
  deleteConfirmIncome = signal<Income | null>(null);
  message = signal<{type: 'success' | 'error', text: string} | null>(null);
  private messageTimeout?: number;

  searchTerm = signal('');
  filterRecurrence = signal<'all' | 'monthly' | 'unique' | 'weekly' | 'annual'>('all');

  incomeForm = this.fb.group({
    source: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(0)]],
    income_date: ['', Validators.required],
    recurrence: ['monthly', Validators.required],
    category: [''],
    is_active: [true],
    observations: ['']
  });

  filteredIncome = computed(() => {
    let incomes = this.income();
    
    if (this.searchTerm()) {
      incomes = incomes.filter(i => i.source.toLowerCase().includes(this.searchTerm().toLowerCase()));
    }
    
    if (this.filterRecurrence() !== 'all') {
      incomes = incomes.filter(i => i.recurrence === this.filterRecurrence());
    }
    
    return incomes;
  });

  totalMonthly = computed(() => 
    this.filteredIncome()
      .filter(i => i.is_active && i.recurrence === 'monthly')
      .reduce((acc, i) => acc + i.amount, 0)
  );

  totalAll = computed(() => 
    this.filteredIncome()
      .filter(i => i.is_active)
      .reduce((acc, i) => acc + i.amount, 0)
  );

  activeCount = computed(() => this.filteredIncome().filter(i => i.is_active).length);

  constructor() {
    this.loadData();
  }

  private async loadData() {
    try {
      await this.dataService.fetchIncome();
    } catch (error) {
      console.error('Erro ao carregar rendimentos:', error);
    }
  }

  private showMessage(msg: {type: 'success' | 'error', text: string}) {
    this.message.set(msg);
    if (this.messageTimeout) clearTimeout(this.messageTimeout);
    this.messageTimeout = window.setTimeout(() => this.message.set(null), 5000);
  }

  private toInputDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '';
    const parts = dateStr.split('/');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }

  private fromInputDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  getRecurrenceLabel(recurrence: string): string {
    const labels: Record<string, string> = {
      unique: 'Único',
      monthly: 'Mensal',
      weekly: 'Semanal',
      annual: 'Anual'
    };
    return labels[recurrence] || recurrence;
  }

  openForm() {
    this.editingIncome.set(null);
    this.incomeForm.reset({ recurrence: 'monthly', is_active: true });
    this.isFormVisible.set(true);
  }

  closeForm() {
    this.isFormVisible.set(false);
    this.editingIncome.set(null);
  }

  editIncome(income: Income) {
    this.editingIncome.set(income);
    this.incomeForm.patchValue({
      ...income,
      income_date: this.toInputDate(income.income_date),
      observations: income.observations ?? ''
    });
    this.isFormVisible.set(true);
  }

  async saveIncome() {
    if (this.incomeForm.invalid) return;

    try {
      const formValue = this.incomeForm.getRawValue();
      const incomeData = {
        ...formValue,
        income_date: this.fromInputDate(formValue.income_date),
        recurrence: formValue.recurrence as 'unique' | 'monthly' | 'weekly' | 'annual',
        category: formValue.category || null,
        observations: formValue.observations || null
      };

      if (this.editingIncome()) {
        const updated: Income = { ...this.editingIncome()!, ...incomeData };
        await this.dataService.updateIncome(updated);
        this.showMessage({type: 'success', text: 'Rendimento atualizado com sucesso!'});
      } else {
        await this.dataService.addIncome(incomeData as Omit<Income, 'id' | 'created_at'>);
        this.showMessage({type: 'success', text: 'Rendimento adicionado com sucesso!'});
      }
      this.closeForm();
    } catch (error: any) {
      this.showMessage({type: 'error', text: 'Falha ao salvar rendimento'});
    }
  }

  deleteIncome(income: Income) {
    this.deleteConfirmIncome.set(income);
  }

  async confirmDeleteIncome() {
    const income = this.deleteConfirmIncome();
    if (income?.id) {
      try {
        await this.dataService.deleteIncome(income.id);
        this.showMessage({type: 'success', text: 'Rendimento excluído com sucesso!'});
        this.deleteConfirmIncome.set(null);
      } catch (error: any) {
        this.showMessage({type: 'error', text: 'Falha ao excluir rendimento'});
        this.deleteConfirmIncome.set(null);
      }
    }
  }
}
