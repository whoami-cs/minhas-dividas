import { Component, inject, signal, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { DataService } from '../../services/data.service';
import { Loan } from '../../models/debt.model';
import { LoanDetailComponent } from '../loan-detail/loan-detail.component';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { GeminiService } from '../../services/gemini.service';

@Component({
  selector: 'app-loans',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, LoanDetailComponent, ReactiveFormsModule, FormsModule],
  template: `
    <div>
      <div class="space-y-6">
      @if (selectedLoan() || isAddingNew()) {
        <app-loan-detail 
          [loan]="selectedLoan()" 
          [isEditMode]="isEditMode()"
          [pdfData]="pdfDataForDetail()"
          (close)="closeDetail()" 
          (loanUpdated)="handleLoanUpdate($event)" 
          (delete)="handleDeleteFromDetail($event)"
        ></app-loan-detail>
      } @else {
        <!-- Header -->
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-gray-900">Empréstimos</h2>
          <p class="text-gray-600 mt-1">Acompanhe seus empréstimos e parcelas</p>
        </div>
        <!-- Filters and Actions -->
        <div class="flex flex-col md:flex-row gap-4 mb-6">
          <div class="flex-1 flex gap-3">
            <div class="relative flex-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <input [(ngModel)]="searchTerm" placeholder="Buscar por credor..." class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition">
            </div>
            <select [(ngModel)]="sortBy" class="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition bg-white">
              <option value="remaining_value">Maior saldo</option>
              <option value="loan_date">Mais recente</option>
              <option value="creditor">Nome (A-Z)</option>
            </select>
            <select [(ngModel)]="filterStatus" class="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition bg-white">
              <option value="all">Todos</option>
              <option value="Ativo">Ativo</option>
              <option value="Quitado">Quitado</option>
              <option value="Inativo">Inativo</option>
            </select>
          </div>
          <div class="flex gap-3">
            <input type="file" #pdfInput hidden (change)="handlePdfUpload($event)" accept="application/pdf">
            <button (click)="pdfInput.click()" class="flex items-center gap-2 bg-white text-gray-700 font-semibold py-2.5 px-5 rounded-lg hover:bg-gray-50 transition-colors border border-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
              Importar PDF
            </button>
            <button (click)="openForm()" class="flex items-center gap-2 bg-slate-800 text-white font-semibold py-2.5 px-5 rounded-lg hover:bg-slate-700 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              Adicionar empréstimo
            </button>
          </div>
        </div>

        <!-- Loan Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (loan of filteredAndSortedLoans(); track loan.id) {
            <div class="group relative bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-200 hover:border-gray-300" (click)="selectLoan(loan)">
              <!-- Card Header -->
              <div class="flex justify-between items-start mb-4">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 8-4 4 4 4"/><path d="M8 12h13a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-1"/></svg>
                    </div>
                    <h4 class="text-lg font-bold text-gray-900 group-hover:text-slate-700 transition-colors">{{ loan.creditor }}</h4>
                  </div>
                </div>
                <span class="px-3 py-1.5 text-xs font-bold rounded-full" [ngClass]="{
                  'bg-emerald-100 text-emerald-700': loan.status === 'Quitado',
                  'bg-amber-100 text-amber-700': loan.status === 'Ativo',
                  'bg-rose-100 text-rose-700': loan.status === 'Inativo'
                }">
                  {{ loan.status }}
                </span>
              </div>

              <!-- Progress Bar -->
              <div class="mb-4">
                <div class="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Progresso</span>
                  <span class="font-semibold">{{ loan.paid_installments }}/{{ loan.total_installments }}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2.5">
                  <div class="bg-slate-700 h-2.5 rounded-full transition-all" [style.width.%]="(loan.paid_installments / loan.total_installments) * 100"></div>
                </div>
              </div>

              <!-- Card Content -->
              <div class="space-y-2 mb-6">
                <div class="flex justify-between items-baseline">
                  <span class="text-sm font-medium text-gray-600">Emprestado</span>
                  <span class="text-base font-semibold text-gray-700">{{ loan.loan_value | currency:'BRL' }}</span>
                </div>
                <div class="bg-orange-50 rounded-lg p-3 border border-orange-200">
                  <div class="flex justify-between items-baseline">
                    <span class="text-sm font-medium text-orange-700">Restante</span>
                    <span class="text-2xl font-bold text-orange-600">{{ loan.remaining_value | currency:'BRL' }}</span>
                  </div>
                </div>
              </div>

              <!-- Card Actions -->
              <div class="flex gap-2 pt-4 border-t border-gray-100">
                <button (click)="editLoan(loan, $event)" class="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-slate-50 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition-colors text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                  Editar
                </button>
                <button (click)="deleteLoan(loan, $event)" class="flex items-center justify-center p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
            </div>
          } @empty {
            <div class="col-span-full text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-300">
              <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400"><path d="m12 8-4 4 4 4"/><path d="M8 12h13a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-1"/></svg>
              </div>
              <h4 class="text-xl font-bold text-gray-900 mb-2">Nenhum empréstimo cadastrado</h4>
              <p class="text-gray-500 mb-6">Comece adicionando seu primeiro empréstimo</p>
              <button (click)="openForm()" class="inline-flex items-center gap-2 bg-slate-800 text-white font-semibold py-2.5 px-5 rounded-lg hover:bg-slate-700 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                Adicionar primeiro empréstimo
              </button>
            </div>
          }
        </div>

        <!-- Footer Summary -->
        @if (filteredAndSortedLoans().length > 0) {
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200">
            <div class="flex items-center justify-between mb-3">
              <p class="text-sm font-medium text-gray-600">Valor original</p>
              <div class="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 8-4 4 4 4"/><path d="M8 12h13a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-1"/></svg>
              </div>
            </div>
            <p class="text-4xl font-bold text-gray-900 mb-1">{{ totalOriginalValue() | currency:'BRL' }}</p>
            <p class="text-xs text-gray-500">Valor emprestado</p>
          </div>
          <div class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200">
            <div class="flex items-center justify-between mb-3">
              <p class="text-sm font-medium text-gray-600">Total restante</p>
              <div class="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
            </div>
            <p class="text-4xl font-bold text-gray-900 mb-1">{{ totalRemainingValue() | currency:'BRL' }}</p>
            <p class="text-xs text-gray-500">{{ filteredAndSortedLoans().length }} empréstimo(s)</p>
          </div>
          </div>
        }
      }

     <!-- Loading/Thinking Modal -->
     @if (isLoading()) {
       <div class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" style="z-index: 9999; display: flex; justify-content: center; align-items: center; margin: 0 !important;">
         <div class="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md" style="margin: 0 !important;">
           <div class="flex items-center justify-between mb-4">
             <div class="flex items-center">
               <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
               <p class="ml-4 text-gray-700 font-semibold">{{ loadingStep() }}</p>
             </div>
             <button (click)="cancelUpload()" class="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
             </button>
           </div>
           @if(iaThought()) {
             <div class="mt-4 bg-gray-50 p-3 rounded-lg text-xs max-h-48 overflow-hidden">
               <button (click)="isIaThinkingExpanded.set(!isIaThinkingExpanded())" class="w-full text-left text-gray-500 flex justify-between items-center">
                 <span class="font-medium">Pensamento da IA...</span>
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" [ngClass]="{'rotate-180': isIaThinkingExpanded()}" class="transition-transform"><path d="m6 9 6 6 6-6"/></svg>
               </button>
               @if(isIaThinkingExpanded()) {
                 <div class="mt-2 max-h-40 overflow-y-auto">
                   <pre class="whitespace-pre-wrap break-words text-gray-600 text-xs">{{ iaThought() }}</pre>
                 </div>
               }
             </div>
           }
         </div>
       </div>
     }

     <!-- Message Box -->
     @if (message()) {
       <div class="fixed bottom-8 right-8 z-50 max-w-sm" style="margin: 0 !important;">
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

     <!-- Delete Confirmation Modal -->
     @if (deleteConfirmLoan()) {
       <div class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 backdrop-blur-sm animate-fade-in" style="margin: 0 !important;" (click)="deleteConfirmLoan.set(null)">
         <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in" (click)="$event.stopPropagation()">
           <div class="p-6">
             <div class="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-4">
               <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
             </div>
             <h3 class="text-xl font-bold text-gray-900 text-center mb-2">Excluir empréstimo?</h3>
             <p class="text-gray-600 text-center mb-6">Tem certeza que deseja excluir o empréstimo do <span class="font-semibold">{{ deleteConfirmLoan()!.creditor }}</span>? Esta ação não pode ser desfeita.</p>
             <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
               <p class="text-sm text-red-800 font-medium">Valor restante: {{ deleteConfirmLoan()!.remaining_value | currency:'BRL' }}</p>
             </div>
           </div>
           <div class="bg-gray-50 px-6 py-4 flex gap-3 justify-end rounded-b-2xl">
             <button (click)="deleteConfirmLoan.set(null)" class="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
             <button (click)="confirmDeleteLoan()" class="px-5 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors">Sim, excluir</button>
           </div>
         </div>
       </div>
     }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoansComponent {
  private dataService = inject(DataService);
  private fb = inject(FormBuilder);
  private geminiService = inject(GeminiService);

  loans = this.dataService.loans;
  selectedLoan = this.dataService.selectedLoan;
  isAddingNew = this.dataService.isLoanAddingNew;
  isEditMode = this.dataService.isLoanEditMode;
  extractedPdfData = signal<any>(null);
  uploadedPdfFile = signal<File | null>(null);
  pdfDataForDetail = signal<{installments: any[], pdfFile: File | null} | null>(null);
  isLoading = signal(false);
  loadingStep = signal<string>('Enviando PDF...');
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
  iaThought = signal<string | null>(null);
  isIaThinkingExpanded = signal(false);
  deleteConfirmLoan = signal<Loan | null>(null);

  searchTerm = signal('');
  sortBy = signal<'creditor' | 'remaining_value' | 'loan_date'>('remaining_value');
  filterStatus = signal<'all' | 'Ativo' | 'Quitado' | 'Inativo'>('all');

  filteredAndSortedLoans = computed(() => {
    let loans = this.loans();
    
    // Filter by search
    if (this.searchTerm()) {
      loans = loans.filter(l => l.creditor.toLowerCase().includes(this.searchTerm().toLowerCase()));
    }
    
    // Filter by status
    if (this.filterStatus() !== 'all') {
      loans = loans.filter(l => l.status === this.filterStatus());
    }
    
    // Sort
    return [...loans].sort((a, b) => {
      if (this.sortBy() === 'creditor') return a.creditor.localeCompare(b.creditor);
      if (this.sortBy() === 'remaining_value') return b.remaining_value - a.remaining_value;
      if (this.sortBy() === 'loan_date') {
        const dateA = new Date(a.loan_date.split('/').reverse().join('-'));
        const dateB = new Date(b.loan_date.split('/').reverse().join('-'));
        return dateB.getTime() - dateA.getTime();
      }
      return 0;
    });
  });

  totalRemainingValue = computed(() => this.filteredAndSortedLoans().reduce((acc, loan) => acc + loan.remaining_value, 0));
  totalOriginalValue = computed(() => this.filteredAndSortedLoans().reduce((acc, loan) => acc + loan.loan_value, 0));
  
  constructor() {
    this.loadData();
  }

  private async loadData() {
    this.isLoading.set(true);
    this.loadingStep.set('Carregando empréstimos...');
    try {
      await this.dataService.fetchLoans();
    } catch (error) {
      console.error('Erro ao carregar empréstimos:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  openForm() {
    this.isAddingNew.set(true);
    this.isEditMode.set(true);
    this.selectedLoan.set(null);
  }

  closeDetail() {
    this.selectedLoan.set(null);
    this.isAddingNew.set(false);
    this.isEditMode.set(false);
    this.pdfDataForDetail.set(null);
    this.extractedPdfData.set(null);
    this.uploadedPdfFile.set(null);
  }

  async selectLoan(loan: Loan) {
    if (loan.id) {
      this.isLoading.set(true);
      this.loadingStep.set('Carregando empréstimo...');
      try {
        const fullLoan = await this.dataService.fetchLoanById(loan.id);
        this.selectedLoan.set(fullLoan);
      } catch (error: any) {
        this.showMessage({type: 'error', text: 'Erro ao carregar empréstimo', details: error.message});
      } finally {
        this.isLoading.set(false);
      }
    }
  }

  handleLoanUpdate(updatedLoan: Loan) {
    this.selectedLoan.set(updatedLoan);
    this.isEditMode.set(false);
  }



  async editLoan(loan: Loan, event: MouseEvent) {
    event.stopPropagation();
    if (loan.id) {
      this.isLoading.set(true);
      this.loadingStep.set('Carregando empréstimo...');
      try {
        const fullLoan = await this.dataService.fetchLoanById(loan.id);
        this.selectedLoan.set(fullLoan);
        this.isEditMode.set(true);
      } catch (error: any) {
        this.showMessage({type: 'error', text: 'Erro ao carregar empréstimo', details: error.message});
      } finally {
        this.isLoading.set(false);
      }
    }
  }



  deleteLoan(loan: Loan, event: MouseEvent) {
    event.stopPropagation();
    this.deleteConfirmLoan.set(loan);
  }

  async confirmDeleteLoan() {
    const loan = this.deleteConfirmLoan();
    if (loan?.id) {
      this.isLoading.set(true);
      this.loadingStep.set('Excluindo empréstimo...');
      try {
        await this.dataService.deleteLoan(loan.id);
        this.showMessage({type: 'success', text: 'Empréstimo excluído com sucesso!'});
        this.deleteConfirmLoan.set(null);
        if (this.selectedLoan()?.id === loan.id) {
          this.selectedLoan.set(null);
        }
      } catch (error: any) {
        this.showMessage({type: 'error', text: 'Falha ao excluir empréstimo', details: error.message});
        this.deleteConfirmLoan.set(null);
      } finally {
        this.isLoading.set(false);
      }
    }
  }

  async handleDeleteFromDetail(loanId: number) {
    this.isLoading.set(true);
    this.loadingStep.set('Excluindo empréstimo...');
    try {
      await this.dataService.deleteLoan(loanId);
      this.showMessage({type: 'success', text: 'Empréstimo excluído com sucesso!'});
      this.closeDetail();
    } catch (error: any) {
      this.showMessage({type: 'error', text: 'Falha ao excluir empréstimo', details: error.message});
    } finally {
      this.isLoading.set(false);
    }
  }

  getStatusClasses(status: 'Ativo' | 'Quitado' | 'Inativo'): string {
    switch (status) {
      case 'Quitado': return 'bg-green-200 text-green-800';
      case 'Ativo': return 'bg-yellow-200 text-yellow-800';
      case 'Inativo': return 'bg-red-200 text-red-800';
    }
  }

  private abortController: AbortController | null = null;

  cancelUpload() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    this.isLoading.set(false);
    this.iaThought.set(null);
    this.showMessage({type: 'error', text: 'Upload cancelado pelo usuário.'});
  }

  async handlePdfUpload(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.uploadedPdfFile.set(file);
    this.abortController = new AbortController();
    this.isLoading.set(true);
    this.loadingStep.set('Preparando arquivo...');
    this.message.set(null);
    this.iaThought.set('');

    try {
      let thinkingText = '';
      let fullText = '';
      let finalData = '';
      
      for await (const chunk of this.geminiService.extractLoanDataFromFileStream(file, this.abortController.signal)) {
        if (chunk.type === 'countdown') {
          this.loadingStep.set(`Limite de requisições atingido. Reconectando em ${chunk.content}s...`);
        } else if (chunk.type === 'status') {
          this.loadingStep.set(chunk.content as string);
        } else if (chunk.type === 'thinking') {
          thinkingText += chunk.content as string;
          this.iaThought.set(thinkingText);
          this.loadingStep.set('IA analisando documento...');
        } else if (chunk.type === 'text') {
          fullText += chunk.content as string;
          this.iaThought.set(thinkingText + fullText);
          this.loadingStep.set('Extraindo dados...');
        } else if (chunk.type === 'final') {
          finalData = chunk.content as string;
          this.loadingStep.set('Finalizando...');
        }
      }

      if (!finalData) {
        throw new Error('Nenhum dado foi retornado pela IA');
      }

      const extractedData = typeof finalData === 'string' ? JSON.parse(finalData) : finalData;

      if (extractedData.error) {
        throw new Error(extractedData.error);
      }
      
      if (extractedData) {
        const existingLoan = extractedData.contract_number 
          ? this.loans().find(l => l.contract_number === extractedData.contract_number)
          : null;
        
        this.pdfDataForDetail.set({
          installments: extractedData.installments || [],
          pdfFile: this.uploadedPdfFile()
        });
        
        if (existingLoan) {
          this.selectedLoan.set(existingLoan);
          this.isEditMode.set(true);
        } else {
          this.isAddingNew.set(true);
          this.isEditMode.set(true);
          this.selectedLoan.set({
            contract_number: extractedData.contract_number || null,
            creditor: extractedData.creditor,
            loan_date: extractedData.loan_date,
            loan_value: extractedData.loan_value,
            interest_value: extractedData.interest_value,
            final_value: extractedData.loan_value + extractedData.interest_value,
            total_installments: extractedData.total_installments,
            paid_installments: 0,
            remaining_installments: extractedData.total_installments,
            remaining_value: extractedData.loan_value + extractedData.interest_value,
            last_payment_date: '',
            status: 'Ativo',
            observations: null,
            installments: [],
            balance_evolution: []
          } as Loan);
        }
        this.showMessage({type: 'success', text: 'Dados extraídos do PDF! Revise e confirme.'});
      } else {
         this.showMessage({type: 'error', text: 'A IA não conseguiu extrair os dados do PDF.'});
      }

    } catch (e: any) {
      if (e.name === 'AbortError') {
        console.log('Upload cancelado');
      } else {
        console.error('Erro ao processar o PDF:', e);
        this.showMessage({type: 'error', text: 'Ocorreu um erro ao processar o arquivo PDF.', details: e.message});
      }
    } finally {
      this.isLoading.set(false);
      this.iaThought.set(null);
      this.abortController = null;
      event.target.value = '';
    }
  }
}