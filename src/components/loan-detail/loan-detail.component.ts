import { Component, input, output, ChangeDetectionStrategy, signal, inject, effect, viewChild, ElementRef, afterNextRender, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Loan, LoanInstallment, LoanBalanceEvolution, LoanAttachment } from '../../models/debt.model';
import { DataService } from '../../services/data.service';
import { ParseDatePipe } from '../../pipes/parse-date.pipe';
import { InstallmentFormComponent } from '../installment-form/installment-form.component';
import { BreadcrumbComponent, BreadcrumbItem } from '../breadcrumb/breadcrumb.component';
import { AiChatComponent } from '../ai-chat/ai-chat.component';
import { DeleteConfirmationModalComponent } from '../delete-confirmation-modal/delete-confirmation-modal.component';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-loan-detail',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, ParseDatePipe, InstallmentFormComponent, BreadcrumbComponent, AiChatComponent, ReactiveFormsModule, DeleteConfirmationModalComponent],
  template: `
    <div class="space-y-6">
      <!-- Breadcrumb -->
      <app-breadcrumb [items]="breadcrumbItems()"></app-breadcrumb>

      @if (effectiveEditMode()) {
        <!-- Edit Form -->
        <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">{{ loan() ? 'Editar empréstimo' : 'Adicionar empréstimo' }}</h2>
          <div [formGroup]="loanForm" class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <div>
                <label for="contract_number" class="block text-sm font-medium text-gray-700 mb-1">Número do contrato</label>
                <input id="contract_number" formControlName="contract_number" placeholder="Ex: 123456789" class="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition">
              </div>
              <div>
                <label for="creditor" class="block text-sm font-medium text-gray-700 mb-1">Credor</label>
                <input id="creditor" formControlName="creditor" placeholder="Ex: Banco do Brasil" class="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition">
              </div>
              <div>
                <label for="loan_date" class="block text-sm font-medium text-gray-700 mb-1">Data do empréstimo</label>
                <input id="loan_date" formControlName="loan_date" type="date" class="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition">
              </div>
              <div>
                <label for="loan_value" class="block text-sm font-medium text-gray-700 mb-1">Valor do empréstimo</label>
                <input id="loan_value" formControlName="loan_value" type="number" step="0.01" placeholder="0,00" class="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition">
              </div>
              <div>
                <label for="interest_value" class="block text-sm font-medium text-gray-700 mb-1">Valor dos juros</label>
                <input id="interest_value" formControlName="interest_value" type="number" step="0.01" placeholder="0,00" class="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition">
              </div>
              <div>
                <label for="total_installments" class="block text-sm font-medium text-gray-700 mb-1">Total de parcelas</label>
                <input id="total_installments" formControlName="total_installments" type="number" placeholder="1" class="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition">
              </div>
              <div>
                <label for="status" class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select id="status" formControlName="status" class="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition">
                  <option value="Ativo">Ativo</option>
                  <option value="Quitado">Quitado</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>
              <div class="md:col-span-2">
                <label for="observations" class="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                <textarea id="observations" formControlName="observations" placeholder="Informações adicionais sobre o empréstimo..." class="p-3 border border-gray-300 rounded-lg w-full h-24 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition"></textarea>
              </div>
            </div>
        </div>

        <!-- Anexos -->
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm">
        <header class="p-5 flex justify-between items-center border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-800">Anexos</h3>
          <div class="flex items-center gap-2">
            <input type="file" #attachmentInputEdit hidden (change)="handleTempAttachmentUpload($event)" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" multiple>
            <button type="button" (click)="attachmentInputEdit.click()" class="flex items-center gap-2 bg-slate-800 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
              Adicionar anexo
            </button>
          </div>
        </header>
        <div class="p-5">
          @if (tempAttachments().length > 0 || attachments().length > 0) {
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              @for (tempAtt of tempAttachments(); track $index) {
                <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div class="flex items-start justify-between mb-3">
                    <div class="flex items-center gap-2 flex-1 min-w-0">
                      <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-semibold text-gray-900 truncate" [title]="tempAtt.file.name">{{ tempAtt.file.name }}</p>
                        <p class="text-xs text-gray-500">{{ formatFileSize(tempAtt.file.size) }}</p>
                      </div>
                    </div>
                  </div>
                  <div class="flex gap-2">
                    <button (click)="viewTempAttachment(tempAtt.file)" class="flex-1 flex items-center justify-center gap-1 py-1.5 px-3 bg-slate-50 text-slate-700 text-xs font-medium rounded hover:bg-slate-100 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                      Ver
                    </button>
                    <button (click)="removeTempAttachment($index)" class="flex items-center justify-center p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                </div>
              }
              @for (attachment of attachments(); track attachment.id) {
                <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div class="flex items-start justify-between mb-3">
                    <div class="flex items-center gap-2 flex-1 min-w-0">
                      <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-semibold text-gray-900 truncate" [title]="attachment.file_name">{{ attachment.file_name }}</p>
                        <p class="text-xs text-gray-500">{{ formatFileSize(attachment.file_size) }}</p>
                      </div>
                    </div>
                  </div>
                  @if (attachment.description) {
                    <p class="text-xs text-gray-600 mb-3">{{ attachment.description }}</p>
                  }
                  <div class="flex gap-2">
                    <button (click)="viewAttachment(attachment)" class="flex-1 flex items-center justify-center gap-1 py-1.5 px-3 bg-slate-50 text-slate-700 text-xs font-medium rounded hover:bg-slate-100 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                      Ver
                    </button>
                    <button (click)="deleteAttachment(attachment)" class="flex items-center justify-center p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="text-center py-12 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-3 text-gray-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <p class="text-sm">Nenhum anexo adicionado</p>
            </div>
          }
        </div>
      </div>

        <!-- Installments Section -->
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm">
        <header class="p-5 flex justify-between items-center border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-800">Histórico de parcelas</h3>
          <button type="button" (click)="openInstallmentForm()" class="flex items-center gap-2 bg-slate-800 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            Adicionar parcela
          </button>
        </header>
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="py-3 px-4 text-left font-semibold text-gray-600">Nº</th>
                <th class="py-3 px-4 text-left font-semibold text-gray-600">Vencimento</th>
                <th class="py-3 px-4 text-left font-semibold text-gray-600">Pagamento</th>
                <th class="py-3 px-4 text-right font-semibold text-gray-600">Valor parcela</th>
                <th class="py-3 px-4 text-right font-semibold text-gray-600">Amortização</th>
                <th class="py-3 px-4 text-right font-semibold text-gray-600">Juros</th>
                <th class="py-3 px-4 text-center font-semibold text-gray-600">Status</th>
                <th class="py-3 px-4 text-center font-semibold text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              @for (installment of tempLoanData()?.installments || []; track installment.parcel_number) {
                <tr [class.bg-green-50]="installment.paid" class="hover:bg-gray-50 transition-colors">
                  <td class="py-3 px-4 text-gray-700 font-medium">{{ installment.parcel_number }}</td>
                  <td class="py-3 px-4 text-gray-700">{{ installment.due_date | parseDate | date:'dd/MM/yyyy' }}</td>
                  <td class="py-3 px-4 text-gray-700">{{ installment.payment_date | parseDate | date:'dd/MM/yyyy' }}</td>
                  <td class="py-3 px-4 text-gray-700 text-right font-medium">{{ installment.installment_value | currency:'BRL' }}</td>
                  <td class="py-3 px-4 text-blue-600 text-right font-medium">{{ installment.amortization | currency:'BRL' }}</td>
                  <td class="py-3 px-4 text-red-600 text-right font-medium">{{ installment.interest | currency:'BRL' }}</td>
                  <td class="py-3 px-4 text-center"><span class="px-3 py-1 text-xs font-semibold rounded-full" [ngClass]="{'bg-green-100 text-green-800': installment.paid, 'bg-yellow-100 text-yellow-800': !installment.paid}">{{ installment.paid ? 'Paga' : 'Pendente' }}</span></td>
                  <td class="py-3 px-4 text-center">
                    <button type="button" (click)="editInstallment(installment)" class="text-slate-600 hover:text-slate-800 p-1 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg></button>
                    <button type="button" (click)="deleteTempInstallment(installment.parcel_number)" class="text-red-600 hover:text-red-700 p-1 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="8" class="text-center text-gray-500 py-12">Nenhuma parcela registrada.</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>

        <!-- Botões de ação -->
        <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div class="flex gap-4 justify-end">
            <button type="button" (click)="cancelEdit()" [disabled]="isLoading()" class="bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-5 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Cancelar</button>
            <button type="button" (click)="saveLoan()" [disabled]="loanForm.invalid || isLoading()" class="flex items-center gap-2 bg-slate-800 text-white font-semibold py-2 px-5 rounded-lg hover:bg-slate-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              <span>Salvar</span>
            </button>
          </div>
        </div>
      } @else {
        <!-- Header -->
        <header class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-sm text-gray-500 mb-1">Detalhes do empréstimo</p>
              <h2 class="text-3xl font-bold text-gray-900">{{ loan()?.creditor }}</h2>
            </div>
            <div class="flex gap-2">
              <button (click)="close.emit()" class="flex items-center gap-2 bg-gray-100 text-gray-700 font-semibold py-2.5 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
                Voltar
              </button>
              <button (click)="enterEditMode()" class="flex items-center gap-2 bg-gray-100 text-gray-700 font-semibold py-2.5 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                Editar
              </button>
              <button (click)="showDeleteConfirm.set(true)" class="flex items-center gap-2 bg-red-50 text-red-600 font-semibold py-2.5 px-4 rounded-lg hover:bg-red-100 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                Excluir
              </button>
            </div>
          </div>
        </header>

        <!-- Cards de Resumo -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p class="text-sm text-gray-500 mb-1">Valor emprestado</p>
          <p class="text-2xl font-bold text-gray-900">{{ loan().loan_value | currency:'BRL' }}</p>
        </div>
        <div class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p class="text-sm text-gray-500 mb-1">Valor final</p>
          <p class="text-2xl font-bold text-gray-900">{{ loan().final_value | currency:'BRL' }}</p>
        </div>
        <div class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p class="text-sm text-gray-500 mb-1">Valor restante</p>
          <p class="text-2xl font-bold text-gray-900">{{ loan().remaining_value | currency:'BRL' }}</p>
        </div>
        <div class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p class="text-sm text-gray-500 mb-1">Parcelas pagas</p>
          <p class="text-2xl font-bold text-gray-900">{{ loan().paid_installments }}/{{ loan().total_installments }}</p>
          <div class="mt-2 bg-gray-100 rounded-full h-2">
            <div class="bg-gray-800 rounded-full h-2 transition-all" [style.width.%]="(loan().paid_installments / loan().total_installments) * 100"></div>
          </div>
        </div>
      </div>

        <!-- Gráficos -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Evolução do saldo</h3>
          <div style="height: 250px;">
            <canvas #balanceChart></canvas>
          </div>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Composição das parcelas</h3>
          <div style="height: 250px;">
            <canvas #compositionChart></canvas>
          </div>
        </div>
      </div>

        <!-- Detalhes Adicionais -->
        <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div class="space-y-1"><p class="text-sm text-gray-500">Data do contrato</p><p class="font-semibold text-gray-800">{{ loan().loan_date | parseDate | date:'dd/MM/yyyy' }}</p></div>
          <div class="space-y-1"><p class="text-sm text-gray-500">Último pagamento</p><p class="font-semibold text-gray-800">{{ loan().last_payment_date | parseDate | date:'dd/MM/yyyy' }}</p></div>
          <div class="space-y-1"><p class="text-sm text-gray-500">Status</p><p class="font-semibold" [ngClass]="{'text-green-600': loan().status === 'Quitado', 'text-yellow-600': loan().status === 'Ativo', 'text-red-600': loan().status === 'Inativo'}">{{ loan().status }}</p></div>
          <div class="space-y-1"><p class="text-sm text-gray-500">Juros total</p><p class="font-semibold text-red-600">{{ loan().interest_value | currency:'BRL' }}</p></div>
        </div>
        @if(loan().observations) {
          <div class="mt-6 border-t border-gray-200 pt-4">
            <p class="text-sm text-gray-500 mb-1">Observações</p>
            <p class="text-gray-700">{{ loan().observations }}</p>
          </div>
        }
      </div>

        <!-- Anexos -->
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm">
        <header class="p-5 flex justify-between items-center border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-800">Anexos</h3>
        </header>
        <div class="p-5">
          @if (attachments().length > 0) {
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              @for (attachment of attachments(); track attachment.id) {
                <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div class="flex items-start justify-between mb-3">
                    <div class="flex items-center gap-2 flex-1 min-w-0">
                      <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-semibold text-gray-900 truncate" [title]="attachment.file_name">{{ attachment.file_name }}</p>
                        <p class="text-xs text-gray-500">{{ formatFileSize(attachment.file_size) }}</p>
                      </div>
                    </div>
                  </div>
                  @if (attachment.description) {
                    <p class="text-xs text-gray-600 mb-3">{{ attachment.description }}</p>
                  }
                  <div class="flex gap-2">
                    <button (click)="viewAttachment(attachment)" class="w-full flex items-center justify-center gap-1 py-1.5 px-3 bg-slate-50 text-slate-700 text-xs font-medium rounded hover:bg-slate-100 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                      Ver
                    </button>
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="text-center py-12 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-3 text-gray-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <p class="text-sm">{{ loan() ? 'Nenhum anexo adicionado' : 'Anexos disponíveis após salvar' }}</p>
            </div>
          }
        </div>
      </div>

        <!-- Installments Section -->
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm">
        <header class="p-5 flex justify-between items-center border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-800">Histórico de parcelas</h3>
        </header>
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="py-3 px-4 text-left font-semibold text-gray-600">Nº</th>
                <th class="py-3 px-4 text-left font-semibold text-gray-600">Vencimento</th>
                <th class="py-3 px-4 text-left font-semibold text-gray-600">Pagamento</th>
                <th class="py-3 px-4 text-right font-semibold text-gray-600">Valor parcela</th>
                <th class="py-3 px-4 text-right font-semibold text-gray-600">Amortização</th>
                <th class="py-3 px-4 text-right font-semibold text-gray-600">Juros</th>
                <th class="py-3 px-4 text-center font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              @for (installment of tempLoanData()?.installments || []; track installment.parcel_number) {
                <tr [class.bg-green-50]="installment.paid" class="hover:bg-gray-50 transition-colors">
                  <td class="py-3 px-4 text-gray-700 font-medium">{{ installment.parcel_number }}</td>
                  <td class="py-3 px-4 text-gray-700">{{ installment.due_date | parseDate | date:'dd/MM/yyyy' }}</td>
                  <td class="py-3 px-4 text-gray-700">{{ installment.payment_date | parseDate | date:'dd/MM/yyyy' }}</td>
                  <td class="py-3 px-4 text-gray-700 text-right font-medium">{{ installment.installment_value | currency:'BRL' }}</td>
                  <td class="py-3 px-4 text-blue-600 text-right font-medium">{{ installment.amortization | currency:'BRL' }}</td>
                  <td class="py-3 px-4 text-red-600 text-right font-medium">{{ installment.interest | currency:'BRL' }}</td>
                  <td class="py-3 px-4 text-center"><span class="px-3 py-1 text-xs font-semibold rounded-full" [ngClass]="{'bg-green-100 text-green-800': installment.paid, 'bg-yellow-100 text-yellow-800': !installment.paid}">{{ installment.paid ? 'Paga' : 'Pendente' }}</span></td>
                </tr>
              } @empty {
                <tr><td colspan="7" class="text-center text-gray-500 py-12">Nenhuma parcela registrada.</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>
      }

      <!-- Attachment Modal -->
      @if (showAttachmentModal() && selectedAttachment()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center backdrop-blur-sm" style="z-index: 9999; margin: 0 !important;" (click)="closeAttachmentModal()">
          <div class="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col" (click)="$event.stopPropagation()" style="max-height: 90vh;">
            <header class="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 class="font-bold text-lg text-gray-800">{{ selectedAttachment()!.file_name }}</h3>
              <button (click)="closeAttachmentModal()">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </header>
            <div class="flex-1 overflow-auto p-4 bg-gray-50">
              @if (isImageFile(selectedAttachment()!.file_url)) {
                <img [src]="selectedAttachment()!.file_url" class="max-w-full h-auto mx-auto" alt="Anexo">
              } @else {
                <iframe [src]="getSafeUrl(selectedAttachment()!.file_url)" class="w-full" style="min-height: 600px;"></iframe>
              }
            </div>
          </div>
        </div>
      }

    </div>

    <!-- Delete Confirmation Modals (outside space-y-6) -->
    <app-delete-confirmation-modal
      [isOpen]="showDeleteConfirm()"
      [title]="'Excluir empréstimo?'"
      [message]="loan() ? 'Tem certeza que deseja excluir o empréstimo do ' + loan()!.creditor + '? Esta ação não pode ser desfeita.' : ''"
      [additionalInfo]="loan() ? 'Valor restante: ' + (loan()!.remaining_value | currency:'BRL') : ''"
      (confirmed)="confirmDelete()"
      (cancelled)="showDeleteConfirm.set(false)"
    />
    
    <app-delete-confirmation-modal
      [isOpen]="showDeleteInstallmentConfirm()"
      [title]="'Excluir parcela?'"
      [message]="'Tem certeza que deseja excluir a parcela #' + deletingInstallmentNumber() + '? Esta ação não pode ser desfeita.'"
      (confirmed)="confirmDeleteInstallment()"
      (cancelled)="showDeleteInstallmentConfirm.set(false)"
    />

    <div class="hidden">

      <!-- Loading Modal -->
      @if (isLoading()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" style="z-index: 9999; display: flex; justify-content: center; align-items: center; margin: 0 !important;">
          <div class="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md" style="margin: 0 !important;">
            <div class="flex items-center">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p class="ml-4 text-gray-700 font-semibold">Salvando empréstimo...</p>
            </div>
          </div>
        </div>
      }

      <!-- Message Box -->
      @if (message()) {
        <div class="fixed bottom-8 right-8 z-[10000] max-w-sm">
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
    </div>

    @if (loan() && !effectiveEditMode()) {
      <app-ai-chat 
        [contextData]="chatContext()"
        [contextTitle]="loan()!.creditor"
        [suggestedQuestions]="suggestedQuestions()"
        [contextKey]="'loan-' + loan()!.id"
      />
    }

    <!-- Forms in a Modal -->
    @if (showInstallmentForm()) {
      <div class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 backdrop-blur-sm" (click)="closeInstallmentForm()">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all" (click)="$event.stopPropagation()">
          <app-installment-form
            [installment]="editingInstallment()"
            [existingInstallments]="tempInstallments()"
            [totalInstallments]="loan() ? loan()!.total_installments : loanForm.get('total_installments')?.value || 0"
            (save)="saveInstallment($event)"
            (validationError)="showMessage({type: 'error', text: $event})"
            (cancel)="closeInstallmentForm()">
          </app-installment-form>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoanDetailComponent {
  loan = input<Loan | null>(null);
  isEditMode = input<boolean>(false);
  pdfData = input<{installments: any[], pdfFile: File | null}| null>(null);
  close = output<void>();
  loanUpdated = output<Loan>();
  edit = output<Loan>();
  delete = output<number>();

  private dataService = inject(DataService);
  private sanitizer = inject(DomSanitizer);
  private fb = inject(FormBuilder);
  
  showInstallmentForm = signal(false);
  editingInstallment = signal<LoanInstallment | null>(null);
  showDeleteConfirm = signal(false);
  showDeleteInstallmentConfirm = signal(false);
  deletingInstallmentNumber = signal<number | null>(null);
  attachments = signal<LoanAttachment[]>([]);
  tempAttachments = signal<{file: File, description?: string}[]>([]);
  tempInstallments = signal<LoanInstallment[]>([]);
  showAttachmentModal = signal(false);
  selectedAttachment = signal<LoanAttachment | null>(null);
  tempFileUrl = signal<string | null>(null);
  isUploadingAttachment = signal(false);
  internalEditMode = signal(false);
  effectiveEditMode = computed(() => this.isEditMode() || this.internalEditMode());
  message = signal<{type: 'success' | 'error', text: string} | null>(null);
  private messageTimeout?: number;
  isLoading = signal(false);

  loanForm = this.fb.group({
    contract_number: [''],
    creditor: ['', Validators.required],
    loan_date: ['', Validators.required],
    loan_value: [0, [Validators.required, Validators.min(0)]],
    interest_value: [0, [Validators.required, Validators.min(0)]],
    total_installments: [1, [Validators.required, Validators.min(1)]],
    status: ['Ativo' as 'Ativo' | 'Quitado' | 'Inativo', Validators.required],
    observations: [''],
  });

  balanceChartRef = viewChild<ElementRef>('balanceChart');
  compositionChartRef = viewChild<ElementRef>('compositionChart');

  private balanceChart?: Chart;
  private compositionChart?: Chart;

  breadcrumbItems = computed<BreadcrumbItem[]>(() => {
    const items: BreadcrumbItem[] = [{ label: 'Empréstimos', action: () => this.close.emit() }];
    if (this.loan()) {
      items.push({ label: this.loan()!.creditor });
    } else {
      items.push({ label: 'Novo empréstimo' });
    }
    return items;
  });

  chatContext = computed(() => this.loan() ? ({
    type: 'loan',
    item: this.loan()
  }) : null);

  suggestedQuestions = computed(() => [
    `Vale a pena antecipar parcelas deste empréstimo?`,
    `Quanto vou economizar se quitar agora?`,
    `Qual a melhor estratégia: antecipar ou investir?`
  ]);

  constructor() {
    afterNextRender(() => {
      this.initCharts();
    });

    effect(() => {
      const currentLoan = this.loan();
      if (currentLoan && currentLoan.id) {
        this.updateCharts();
      }
      if (this.isEditMode()) {
        this.populateForm();
        if (currentLoan) {
          this.tempInstallments.set([...currentLoan.installments]);
          if (currentLoan.id) {
            this.loadAttachments();
          }
        }
      }
      const pdf = this.pdfData();
      if (pdf) {
        this.tempInstallments.set(pdf.installments || []);
        if (pdf.pdfFile) {
          this.tempAttachments.set([{file: pdf.pdfFile, description: 'Contrato importado via IA'}]);
        }
      }
    });

    effect(() => {
      const currentLoan = this.loan();
      if (currentLoan && currentLoan.id && !this.effectiveEditMode()) {
        this.loadAttachments();
      }
    });
  }

  handleTempAttachmentUpload(event: any) {
    const files = Array.from(event.target.files) as File[];
    if (files.length === 0) return;
    this.tempAttachments.update(atts => [...atts, ...files.map(file => ({file}))]);
    event.target.value = '';
  }

  removeTempAttachment(index: number) {
    this.tempAttachments.update(atts => atts.filter((_, i) => i !== index));
  }

  deleteTempInstallment(parcelNumber: number) {
    this.deletingInstallmentNumber.set(parcelNumber);
    this.showDeleteInstallmentConfirm.set(true);
  }

  private toInputDate(dateStr: string | null | undefined): string {
    if (!dateStr || dateStr.toLowerCase() === 'dd/mm/yyyy') return '';
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

  private populateForm() {
    const currentLoan = this.loan();
    if (currentLoan) {
      this.loanForm.patchValue({
        ...currentLoan,
        loan_date: this.toInputDate(currentLoan.loan_date),
        observations: currentLoan.observations ?? ''
      });
    } else {
      this.loanForm.reset({ status: 'Ativo' });
    }
  }

  tempLoanData = computed(() => {
    const currentLoan = this.loan();
    const inEditMode = this.effectiveEditMode();
    
    if (inEditMode && currentLoan) {
      return {
        ...currentLoan,
        installments: this.tempInstallments()
      };
    }
    
    if (!currentLoan && this.isEditMode()) {
      const formValue = this.loanForm.getRawValue();
      const pdf = this.pdfData();
      const installments = this.tempInstallments().length > 0 ? this.tempInstallments() : (pdf?.installments || []);
      return {
        ...formValue,
        loan_date: formValue.loan_date,
        final_value: formValue.loan_value + formValue.interest_value,
        paid_installments: installments.filter((i: any) => i.paid).length || 0,
        remaining_installments: formValue.total_installments - (installments.filter((i: any) => i.paid).length || 0),
        remaining_value: formValue.loan_value + formValue.interest_value - (installments.reduce((sum: number, i: any) => sum + (i.paid_value || 0), 0) || 0),
        installments: installments,
        balance_evolution: []
      } as Loan;
    }
    return currentLoan;
  });

  async enterEditMode() {
    this.internalEditMode.set(true);
    this.populateForm();
    const currentLoan = this.loan();
    if (currentLoan) {
      this.tempInstallments.set([...currentLoan.installments]);
      if (currentLoan.id) {
        await this.loadAttachments();
      }
    }
  }

  cancelEdit() {
    if (this.isEditMode()) {
      this.close.emit();
    } else if (this.internalEditMode()) {
      this.internalEditMode.set(false);
    } else {
      this.close.emit();
    }
  }

  private showMessage(msg: {type: 'success' | 'error', text: string}) {
    this.message.set(msg);
    if (this.messageTimeout) clearTimeout(this.messageTimeout);
    this.messageTimeout = window.setTimeout(() => this.message.set(null), 5000);
  }

  async saveLoan() {
    if (this.loanForm.invalid) return;

    this.isLoading.set(true);
    try {
      const formValue = this.loanForm.getRawValue();
      const currentLoan = this.loan();

      if (currentLoan && currentLoan.id) {
        const installments = this.tempInstallments();
        const updatedLoan: Loan = {
          ...currentLoan,
          ...formValue,
          id: currentLoan.id,
          loan_date: this.fromInputDate(formValue.loan_date),
          observations: formValue.observations || null,
          installments: installments
        };
        this.recalculateLoanState(updatedLoan);
        await this.dataService.updateLoan(updatedLoan);
        
        for (const tempAtt of this.tempAttachments()) {
          await this.dataService.uploadLoanAttachment(tempAtt.file, currentLoan.id!, tempAtt.description);
        }
        this.tempAttachments.set([]);
        
        this.loanUpdated.emit(updatedLoan);
        this.internalEditMode.set(false);
        this.tempInstallments.set([]);
        await this.loadAttachments();
        this.showMessage({type: 'success', text: 'Empréstimo atualizado com sucesso!'});
      } else {
        const pdf = this.pdfData();
        const installments = this.tempInstallments().length > 0 ? this.tempInstallments() : (pdf?.installments || []);
        const paidInstallments = installments.filter((i: any) => i.paid).length || 0;
        const lastPaid = installments
          .filter((i: any) => i.paid && i.payment_date)
          .sort((a: any, b: any) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())[0];
        const totalPaid = installments.reduce((sum: number, i: any) => sum + (i.paid_value || 0), 0) || 0;
        
        const newLoan: Omit<Loan, 'id' | 'created_at'> = {
          ...formValue,
          contract_number: formValue.contract_number || null,
          loan_date: this.fromInputDate(formValue.loan_date),
          final_value: formValue.loan_value + formValue.interest_value,
          paid_installments: paidInstallments,
          remaining_installments: formValue.total_installments - paidInstallments,
          remaining_value: formValue.loan_value + formValue.interest_value - totalPaid,
          last_payment_date: lastPaid?.payment_date || '',
          observations: formValue.observations || null,
          installments: installments,
          balance_evolution: []
        };
        await this.dataService.addLoan(newLoan);
        
        const addedLoan = this.dataService.loans().find(l => l.contract_number === newLoan.contract_number);
        if (addedLoan?.id) {
          for (const tempAtt of this.tempAttachments()) {
            await this.dataService.uploadLoanAttachment(tempAtt.file, addedLoan.id, tempAtt.description);
          }
          this.tempAttachments.set([]);
          await this.loadAttachments();
        }
        
        this.loanUpdated.emit(addedLoan || newLoan as Loan);
        this.internalEditMode.set(false);
        this.tempInstallments.set([]);
        this.showMessage({type: 'success', text: 'Empréstimo adicionado com sucesso!'});
      }
    } catch (error: any) {
      console.error('Error saving loan:', error);
      this.showMessage({type: 'error', text: 'Falha ao salvar empréstimo'});
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadAttachments() {
    const currentLoan = this.loan();
    if (currentLoan?.id) {
      try {
        const attachments = await this.dataService.fetchLoanAttachments(currentLoan.id);
        this.attachments.set(attachments);
      } catch (error: any) {
        console.error('Error loading attachments:', error);
      }
    }
  }

  async handleAttachmentUpload(event: any) {
    const file = event.target.files[0];
    if (!file || !this.loan().id) return;

    this.isUploadingAttachment.set(true);
    try {
      const attachment = await this.dataService.uploadLoanAttachment(file, this.loan().id!, event.target.dataset.description);
      if (attachment) {
        this.attachments.update(atts => [...atts, attachment]);
        this.showMessage({type: 'success', text: 'Anexo enviado com sucesso!'});
      } else {
        this.showMessage({type: 'error', text: 'Falha ao enviar anexo'});
      }
    } catch (error: any) {
      console.error('Error uploading attachment:', error);
      this.showMessage({type: 'error', text: 'Falha ao enviar anexo'});
    } finally {
      this.isUploadingAttachment.set(false);
      event.target.value = '';
    }
  }

  async deleteAttachment(attachment: LoanAttachment) {
    try {
      const success = await this.dataService.deleteLoanAttachment(attachment.id!, attachment.file_url);
      if (success) {
        this.attachments.update(atts => atts.filter(a => a.id !== attachment.id));
        this.showMessage({type: 'success', text: 'Anexo excluído com sucesso!'});
      } else {
        this.showMessage({type: 'error', text: 'Falha ao excluir anexo'});
      }
    } catch (error: any) {
      console.error('Error deleting attachment:', error);
      this.showMessage({type: 'error', text: 'Falha ao excluir anexo'});
    }
  }

  confirmDeleteTempInstallment() {
    const parcelNumber = this.deletingInstallmentNumber();
    if (parcelNumber !== null) {
      this.tempInstallments.update(installments => 
        installments.filter(i => i.parcel_number !== parcelNumber)
      );
      this.showMessage({type: 'success', text: 'Parcela excluída com sucesso!'});
    }
    this.showDeleteInstallmentConfirm.set(false);
    this.deletingInstallmentNumber.set(null);
  }

  private recalculateLoanState(loan: Loan) {
    const installments = loan.installments || [];
    const paidInstallments = installments.filter(i => i.paid).length;
    const totalPaid = installments.reduce((sum, i) => sum + (i.paid_value || 0), 0);
    const lastPaid = installments
      .filter(i => i.paid && i.payment_date)
      .sort((a, b) => new Date(b.payment_date!).getTime() - new Date(a.payment_date!).getTime())[0];

    loan.paid_installments = paidInstallments;
    loan.remaining_installments = loan.total_installments - paidInstallments;
    loan.remaining_value = loan.final_value - totalPaid;
    loan.last_payment_date = lastPaid?.payment_date || '';
  }

  private initCharts() {
    this.createBalanceChart();
    this.createCompositionChart();
  }

  private updateCharts() {
    if (this.balanceChart) {
      this.balanceChart.destroy();
    }
    if (this.compositionChart) {
      this.compositionChart.destroy();
    }
    this.createBalanceChart();
    this.createCompositionChart();
  }

  private createBalanceChart() {
    const canvas = this.balanceChartRef()?.nativeElement;
    if (!canvas) return;

    const currentLoan = this.tempLoanData();
    if (!currentLoan) return;
    const installments = currentLoan.installments.filter(i => i.paid);
    const labels = installments.map(i => `#${i.parcel_number}`);
    const data = installments.map((_, idx) => {
      const paidSoFar = installments.slice(0, idx + 1).reduce((sum, i) => sum + (i.paid_value || 0), 0);
      return currentLoan.final_value - paidSoFar;
    });

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Saldo Devedor',
          data,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `Saldo: ${ctx.parsed.y.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => (value as number).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
            }
          }
        }
      }
    };

    this.balanceChart = new Chart(canvas, config);
  }

  private createCompositionChart() {
    const canvas = this.compositionChartRef()?.nativeElement;
    if (!canvas) return;

    const currentLoan = this.tempLoanData();
    if (!currentLoan) return;
    const totalAmortization = currentLoan.installments.reduce((sum, i) => sum + (i.paid ? i.amortization : 0), 0);
    const totalInterest = currentLoan.installments.reduce((sum, i) => sum + (i.paid ? i.interest : 0), 0);
    const remaining = currentLoan.remaining_value;

    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: ['Amortização paga', 'Juros pagos', 'Saldo restante'],
        datasets: [{
          data: [totalAmortization, totalInterest, remaining],
          backgroundColor: [
            'rgb(34, 197, 94)',
            'rgb(239, 68, 68)',
            'rgb(156, 163, 175)'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.label}: ${(ctx.parsed as number).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
            }
          }
        }
      }
    };

    this.compositionChart = new Chart(canvas, config);
  }

  closeInstallmentForm() {
    this.showInstallmentForm.set(false);
    this.editingInstallment.set(null);
  }

  saveInstallment(installment: LoanInstallment) {
    let installments = [...this.tempInstallments()];
    const existingIndex = installments.findIndex(i => i.parcel_number === installment.parcel_number);
    const isNew = existingIndex === -1;

    if (existingIndex > -1) {
      installments[existingIndex] = installment;
    } else {
      installments.push(installment);
    }
    installments.sort((a, b) => a.parcel_number - b.parcel_number);
    this.tempInstallments.set(installments);
    this.showMessage({type: 'success', text: isNew ? 'Parcela adicionada com sucesso!' : 'Parcela atualizada com sucesso!'});
    this.closeInstallmentForm();
  }

  confirmDeleteInstallment() {
    this.confirmDeleteTempInstallment();
  }

  confirmDelete() {
    if (this.loan()?.id) {
      this.delete.emit(this.loan()!.id!);
      this.showDeleteConfirm.set(false);
    }
  }

  viewAttachment(attachment: LoanAttachment) {
    this.selectedAttachment.set(attachment);
    this.showAttachmentModal.set(true);
  }

  viewTempAttachment(file: File) {
    console.log('viewTempAttachment called with file:', file.name);
    const url = URL.createObjectURL(file);
    console.log('Created URL:', url);
    this.tempFileUrl.set(url);
    this.selectedAttachment.set({
      id: 0,
      file_name: file.name,
      file_url: url,
      file_type: file.type,
      file_size: file.size
    } as LoanAttachment);
    this.showAttachmentModal.set(true);
    console.log('Modal should be visible now');
  }

  closeAttachmentModal() {
    if (this.tempFileUrl()) {
      URL.revokeObjectURL(this.tempFileUrl()!);
      this.tempFileUrl.set(null);
    }
    this.showAttachmentModal.set(false);
    this.selectedAttachment.set(null);
  }

  isImageFile(url: string): boolean {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  }

  getSafeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  formatFileSize(bytes: number | null): string {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  openInstallmentForm() {
    const currentLoan = this.loan();
    const totalInstallments = currentLoan ? currentLoan.total_installments : this.loanForm.get('total_installments')?.value || 0;
    
    if (!totalInstallments || totalInstallments <= 0) {
      this.showMessage({type: 'error', text: 'Por favor, defina o total de parcelas antes de adicionar uma parcela.'});
      return;
    }
    
    const currentInstallmentsCount = this.tempInstallments().length;
    if (currentInstallmentsCount >= totalInstallments) {
      this.showMessage({type: 'error', text: `Não é possível adicionar mais parcelas. Total de parcelas já atingido (${totalInstallments}).`});
      return;
    }
    
    this.editingInstallment.set(null);
    this.showInstallmentForm.set(true);
  }

  editInstallment(installment: LoanInstallment) {
    this.editingInstallment.set(installment);
    this.showInstallmentForm.set(true);
  }

  deleteInstallment(parcelNumber: number) {
    this.deletingInstallmentNumber.set(parcelNumber);
    this.showDeleteInstallmentConfirm.set(true);
  }
}
