import { Component, input, output, ChangeDetectionStrategy, signal, inject, computed, viewChild, ElementRef, afterNextRender, effect } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreditCardDebt, DebtAttachment } from '../../models/debt.model';
import { GeminiService } from '../../services/gemini.service';
import { DataService } from '../../services/data.service';
import { ParseDatePipe } from '../../pipes/parse-date.pipe';
import { BreadcrumbComponent, BreadcrumbItem } from '../breadcrumb/breadcrumb.component';
import { NegotiationOffersComponent } from '../negotiation-offers/negotiation-offers.component';
import { AiChatComponent } from '../ai-chat/ai-chat.component';
import { marked } from 'marked';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-credit-card-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe, DatePipe, ParseDatePipe, BreadcrumbComponent, NegotiationOffersComponent, AiChatComponent],
  template: `
    <div class="space-y-6">
      <!-- Breadcrumb -->
      <app-breadcrumb [items]="breadcrumbItems()"></app-breadcrumb>

      @if (internalEditMode()) {
        <!-- Edit Form -->
        <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">{{ debt().id ? 'Editar dívida' : 'Adicionar dívida' }}</h2>
          <div [formGroup]="debtForm" class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <div>
              <label for="local" class="block text-sm font-medium text-gray-700 mb-1">Cartão</label>
              <input id="local" formControlName="local" placeholder="Ex: Nubank" class="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition">
            </div>
            <div>
              <label for="debt_date" class="block text-sm font-medium text-gray-700 mb-1">Data da dívida</label>
              <input id="debt_date" formControlName="debt_date" type="date" class="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition">
            </div>
            <div>
              <label for="original_value" class="block text-sm font-medium text-gray-700 mb-1">Valor original</label>
              <input id="original_value" formControlName="original_value" type="number" step="0.01" placeholder="0,00" class="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition">
            </div>
            <div>
              <label for="current_value" class="block text-sm font-medium text-gray-700 mb-1">Valor atual</label>
              <input id="current_value" formControlName="current_value" type="number" step="0.01" placeholder="0,00" class="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition">
            </div>
            <div>
              <label for="last_update_date" class="block text-sm font-medium text-gray-700 mb-1">Última atualização</label>
              <input id="last_update_date" formControlName="last_update_date" type="date" class="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition">
            </div>
            <div>
              <label for="growth_percentage" class="block text-sm font-medium text-gray-700 mb-1">% de crescimento</label>
              <input id="growth_percentage" formControlName="growth_percentage" type="number" class="p-3 border border-gray-300 rounded-lg w-full bg-gray-100" readonly>
            </div>
            <div>
              <label for="interest_value" class="block text-sm font-medium text-gray-700 mb-1">Valor dos juros</label>
              <input id="interest_value" formControlName="interest_value" type="number" class="p-3 border border-gray-300 rounded-lg w-full bg-gray-100" readonly>
            </div>
            <div>
              <label for="next_month_estimate" class="block text-sm font-medium text-gray-700 mb-1">Estimativa próximo mês</label>
              <input id="next_month_estimate" formControlName="next_month_estimate" type="number" class="p-3 border border-gray-300 rounded-lg w-full bg-gray-100" readonly>
            </div>
            <div>
              <label class="flex items-center gap-2">
                <input type="checkbox" formControlName="is_frozen" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
                <span class="text-sm font-medium text-gray-700">Dívida congelada</span>
              </label>
            </div>

            <div class="md:col-span-2">
              <label for="observation" class="block text-sm font-medium text-gray-700 mb-1">Observações</label>
              <textarea id="observation" formControlName="observation" placeholder="Informações adicionais..." class="p-3 border border-gray-300 rounded-lg w-full h-24 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition"></textarea>
            </div>
          </div>
        </div>

        <!-- Card de Negociação -->
        <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm" [formGroup]="debtForm">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Informações de negociação</h3>
          <div class="mb-4">
            <label class="flex items-center gap-2">
              <input type="checkbox" formControlName="negotiated" class="w-4 h-4 text-slate-600 border-gray-300 rounded focus:ring-slate-500">
              <span class="text-sm font-medium text-gray-700">Negociado</span>
            </label>
          </div>
          @if (debtForm.get('negotiated')?.value) {
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label for="discount_percentage_neg" class="block text-sm font-medium text-gray-700 mb-1">% de desconto</label>
                <input id="discount_percentage_neg" formControlName="discount_percentage" type="number" step="0.01" placeholder="0,00" class="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition disabled:bg-gray-100 disabled:cursor-not-allowed">
              </div>
              <div>
                <label for="paid_value_neg" class="block text-sm font-medium text-gray-700 mb-1">Valor pago</label>
                <input id="paid_value_neg" formControlName="paid_value" type="number" step="0.01" placeholder="0,00" class="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition disabled:bg-gray-100 disabled:cursor-not-allowed">
              </div>
            </div>

            <!-- Comprovantes -->
            <div class="border-t border-gray-200 pt-6">
              <div class="flex justify-between items-center mb-4">
                <h4 class="text-base font-semibold text-gray-800">Comprovantes</h4>
                <div class="flex items-center gap-2">
                  <input type="file" #attachmentInputEdit hidden (change)="handleTempAttachmentUpload($event)" accept=".pdf,.jpg,.jpeg,.png" multiple>
                  <button type="button" (click)="attachmentInputEdit.click()" class="flex items-center gap-2 bg-slate-800 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                    Adicionar comprovantes
                  </button>
                </div>
              </div>
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
                <div class="text-center py-8 text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-2 text-gray-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  <p class="text-sm">Nenhum comprovante adicionado</p>
                </div>
              }
            </div>
          }
        </div>
      } @else {
        <!-- Header -->
        <header class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-sm text-gray-500 mb-1">Detalhes da dívida</p>
              <h2 class="text-3xl font-bold text-gray-900">{{ debt().local }}</h2>
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
      }

      @if (internalEditMode()) {
        @if (debt()?.id) {
          <!-- Ofertas de Renegociação (Edit Mode) -->
          <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <app-negotiation-offers #negotiationOffers [debtId]="debt().id!" [readOnly]="false"></app-negotiation-offers>
          </div>
        }

        <!-- Botões de ação -->
        <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div class="flex gap-4 justify-end">
            <button type="button" (click)="cancelEdit()" [disabled]="isLoading()" class="bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-5 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Cancelar</button>
            <button type="button" (click)="saveDebt()" [disabled]="debtForm.invalid || isLoading()" class="flex items-center gap-2 bg-slate-800 text-white font-semibold py-2 px-5 rounded-lg hover:bg-slate-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              <span>Salvar</span>
            </button>
          </div>
        </div>
      }

      <!-- Cards de Resumo -->
      @if (!internalEditMode()) {
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p class="text-sm text-gray-500 mb-1">Valor original</p>
          <p class="text-2xl font-bold text-gray-900">{{ debt().original_value | currency:'BRL' }}</p>
        </div>
        <div class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p class="text-sm text-gray-500 mb-1">Valor atual</p>
          <p class="text-2xl font-bold text-gray-900">{{ debt().current_value | currency:'BRL' }}</p>
        </div>
        <div class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p class="text-sm text-gray-500 mb-1">Juros acumulados</p>
          <p class="text-2xl font-bold text-red-600">{{ debt().interest_value | currency:'BRL' }}</p>
        </div>
        <div class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p class="text-sm text-gray-500 mb-1">Crescimento</p>
          <p class="text-2xl font-bold text-gray-900">{{ debt().growth_percentage }}%</p>
          <div class="mt-2 bg-gray-100 rounded-full h-2">
            <div class="bg-gray-800 rounded-full h-2 transition-all" [style.width.%]="Math.min(debt().growth_percentage, 100)"></div>
          </div>
        </div>
      </div>
      }

      <!-- Delete Confirmation Modal -->
      @if (showDeleteConfirm()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 backdrop-blur-sm" (click)="showDeleteConfirm.set(false)">
          <div class="bg-white rounded-xl shadow-2xl w-full max-w-md" (click)="$event.stopPropagation()">
            <div class="p-6">
              <div class="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-600"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900 text-center mb-2">Excluir Dívida?</h3>
              <p class="text-gray-600 text-center mb-6">Tem certeza que deseja excluir a dívida do cartão <span class="font-semibold">{{ debt().local }}</span>? Esta ação não pode ser desfeita.</p>
              <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p class="text-sm text-red-800 font-medium">Valor atual: {{ debt().current_value | currency:'BRL' }}</p>
              </div>
            </div>
            <div class="bg-gray-50 px-6 py-4 flex gap-3 justify-end rounded-b-xl">
              <button (click)="showDeleteConfirm.set(false)" class="px-5 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors">Cancelar</button>
              <button (click)="delete.emit(debt().id!); showDeleteConfirm.set(false)" class="px-5 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors">Sim, Excluir</button>
            </div>
          </div>
        </div>
      }

      <!-- Gráficos -->
      @if (!internalEditMode()) {
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Evolução mensal</h3>
          <div style="height: 250px;">
            <canvas #evolutionChart></canvas>
          </div>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Composição da dívida</h3>
          <div style="height: 250px;">
            <canvas #compositionChart></canvas>
          </div>
        </div>
      </div>
      }

      <!-- Detalhes Adicionais -->
      @if (!internalEditMode()) {
      <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Informações detalhadas</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div class="space-y-1"><p class="text-sm text-gray-500">Data da dívida</p><p class="font-semibold text-gray-800">{{ debt().debt_date | parseDate | date:'dd/MM/yyyy' }}</p></div>
          <div class="space-y-1"><p class="text-sm text-gray-500">Última atualização</p><p class="font-semibold text-gray-800">{{ debt().last_update_date | parseDate | date:'dd/MM/yyyy' }}</p></div>
          <div class="space-y-1"><p class="text-sm text-gray-500">Dias em atraso</p><p class="font-semibold text-red-600">{{ daysOverdue() }}</p></div>
          <div class="space-y-1"><p class="text-sm text-gray-500">Próx. mês</p><p class="font-semibold text-orange-600">{{ debt().next_month_estimate | currency:'BRL' }}</p></div>
        </div>
        @if(debt().observation) {
          <div class="mt-4 border-t border-gray-200 pt-4">
            <p class="text-sm text-gray-500 mb-1">Observações</p>
            <p class="text-gray-700">{{ debt().observation }}</p>
          </div>
        }
        @if(debt().negotiated) {
          <div class="mt-4 border-t border-gray-200 pt-4">
            <p class="text-sm text-gray-500 mb-2">Informações de negociação</p>
            <div class="grid grid-cols-2 gap-4">
              @if(debt().discount_percentage) {
                <div><span class="text-sm text-gray-600">Desconto:</span> <span class="font-semibold text-green-600">{{ debt().discount_percentage }}%</span></div>
              }
              @if(debt().paid_value) {
                <div><span class="text-sm text-gray-600">Valor pago:</span> <span class="font-semibold text-gray-900">{{ debt().paid_value | currency:'BRL' }}</span></div>
              }
            </div>
            
            @if (attachments().length > 0) {
              <div class="mt-4">
                <p class="text-sm text-gray-500 mb-3">Comprovantes</p>
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
                      <div class="flex gap-2">
                        <button (click)="viewAttachment(attachment)" class="w-full flex items-center justify-center gap-1 py-1.5 px-3 bg-slate-50 text-slate-700 text-xs font-medium rounded hover:bg-slate-100 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                          Ver
                        </button>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        }
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

      <!-- Delete Attachment Confirmation Modal -->
      @if (showDeleteAttachmentConfirm()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 backdrop-blur-sm" (click)="showDeleteAttachmentConfirm.set(false)">
          <div class="bg-white rounded-xl shadow-2xl w-full max-w-md" (click)="$event.stopPropagation()">
            <div class="p-6">
              <div class="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900 text-center mb-2">Excluir anexo?</h3>
              <p class="text-gray-600 text-center mb-6">Tem certeza que deseja excluir o anexo <span class="font-semibold">{{ deletingAttachment()?.file_name }}</span>? Esta ação será efetivada ao salvar.</p>
            </div>
            <div class="bg-gray-50 px-6 py-4 flex gap-3 justify-end rounded-b-xl">
              <button (click)="showDeleteAttachmentConfirm.set(false)" class="px-5 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors">Cancelar</button>
              <button (click)="confirmDeleteAttachment()" class="px-5 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors">Sim, excluir</button>
            </div>
          </div>
        </div>
      }

      <!-- Ofertas de Renegociação -->
      @if (!internalEditMode() && debt()?.id) {
      <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <app-negotiation-offers [debtId]="debt().id!" [readOnly]="true"></app-negotiation-offers>
      </div>
      }

      <!-- Estratégias de Pagamento -->
      @if (!internalEditMode()) {
      <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Estratégias de pagamento</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-gray-50 border border-gray-200 rounded-xl p-5">
            <h4 class="font-semibold text-gray-700 mb-2">Mínimo (10%)</h4>
            <p class="text-2xl font-bold text-gray-900">{{ minimumPayment() | currency:'BRL' }}</p>
            <p class="text-xs text-gray-500 mt-2">Restante: {{ (debt().current_value - minimumPayment()) | currency:'BRL' }}</p>
          </div>
          <div class="bg-gray-50 border border-gray-200 rounded-xl p-5">
            <h4 class="font-semibold text-gray-700 mb-2">Recomendado (30%)</h4>
            <p class="text-2xl font-bold text-gray-900">{{ recommendedPayment() | currency:'BRL' }}</p>
            <p class="text-xs text-gray-500 mt-2">Restante: {{ (debt().current_value - recommendedPayment()) | currency:'BRL' }}</p>
          </div>
          <div class="bg-gray-50 border border-gray-200 rounded-xl p-5">
            <h4 class="font-semibold text-gray-700 mb-2">Projeção 6 meses</h4>
            <p class="text-2xl font-bold text-gray-900">{{ sixMonthProjection() | currency:'BRL':'symbol':'1.0-0' }}</p>
            <p class="text-xs text-gray-500 mt-2">Taxa: {{ monthlyInterestRate() }}% a.m.</p>
          </div>
        </div>
      </div>
      }

      <!-- Loading Modal -->
      @if (isLoading()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" style="z-index: 9999; display: flex; justify-content: center; align-items: center; margin: 0 !important;">
          <div class="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md" style="margin: 0 !important;">
            <div class="flex items-center">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600"></div>
              <p class="ml-4 text-gray-700 font-semibold">{{ loadingMessage() }}</p>
            </div>
          </div>
        </div>
      }

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
    </div>

    <app-ai-chat 
      [contextData]="chatContext()"
      [contextTitle]="debt().local"
      [suggestedQuestions]="suggestedQuestions()"
      [contextKey]="'debt-' + debt().id"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreditCardDetailComponent {
  debt = input.required<CreditCardDebt>();
  isEditMode = input<boolean>(false);
  close = output<void>();
  debtUpdated = output<CreditCardDebt>();
  delete = output<number>();

  private geminiService = inject(GeminiService);
  private sanitizer = inject(DomSanitizer);
  private dataService = inject(DataService);
  private fb = inject(FormBuilder);

  internalEditMode = signal(false);
  effectiveEditMode = computed(() => this.isEditMode() || this.internalEditMode());
  isAnalysisVisible = signal(false);
  analysisResult = signal('');
  isLoadingAnalysis = signal(false);
  isLoading = signal(false);
  loadingMessage = signal('Salvando dívida...');
  showDeleteConfirm = signal(false);
  message = signal<{type: 'success' | 'error', text: string} | null>(null);
  private messageTimeout?: number;

  attachments = signal<DebtAttachment[]>([]);
  tempAttachments = signal<{file: File, description?: string}[]>([]);
  attachmentsToDelete = signal<number[]>([]);
  showAttachmentModal = signal(false);
  showDeleteAttachmentConfirm = signal(false);
  deletingAttachment = signal<DebtAttachment | null>(null);
  selectedAttachment = signal<DebtAttachment | null>(null);
  tempFileUrl = signal<string | null>(null);

  debtForm = this.fb.group({
    local: ['', Validators.required],
    debt_date: ['', Validators.required],
    original_value: [0, [Validators.required, Validators.min(0)]],
    current_value: [0, [Validators.required, Validators.min(0)]],
    growth_percentage: [{ value: 0, disabled: true }, Validators.required],
    interest_value: [{ value: 0, disabled: true }, Validators.required],
    last_update_date: ['', Validators.required],
    next_month_estimate: [{ value: 0, disabled: true }, Validators.required],
    observation: [''],
    negotiated: [false],
    discount_percentage: [{ value: null as number | null, disabled: true }],
    paid_value: [{ value: null as number | null, disabled: true }],
    is_frozen: [false],
  });

  evolutionChartRef = viewChild<ElementRef>('evolutionChart');
  compositionChartRef = viewChild<ElementRef>('compositionChart');
  negotiationOffersRef = viewChild<NegotiationOffersComponent>('negotiationOffers');

  private evolutionChart?: Chart;
  private compositionChart?: Chart;

  Math = Math;

  breadcrumbItems = computed<BreadcrumbItem[]>(() => [
    { label: 'Cartões de crédito', action: () => this.close.emit() },
    { label: this.debt().local }
  ]);

  isImageFile(url: string): boolean {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  }

  getSafeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  constructor() {
    afterNextRender(() => {
      this.initCharts();
    });

    effect(() => {
      const currentDebt = this.debt();
      if (currentDebt) {
        this.updateCharts();
      }
    });

    effect(() => {
      const currentDebt = this.debt();
      if (currentDebt && currentDebt.id) {
        this.loadNegotiationOffers();
      }
    }, { allowSignalWrites: true });

    effect(() => {
      if (this.isEditMode()) {
        this.enterEditMode();
      }
    }, { allowSignalWrites: true });

    effect(() => {
      const currentDebt = this.debt();
      if (currentDebt && currentDebt.id && !this.effectiveEditMode()) {
        this.loadAttachments();
      }
    });

    this.debtForm.get('original_value')?.valueChanges.subscribe(() => this.calculateFields());
    this.debtForm.get('current_value')?.valueChanges.subscribe(() => this.calculateFields());
    this.debtForm.get('debt_date')?.valueChanges.subscribe(() => this.calculateFields());
    this.debtForm.get('last_update_date')?.valueChanges.subscribe(() => this.calculateFields());
    this.debtForm.get('is_frozen')?.valueChanges.subscribe(() => this.calculateFields());
    this.debtForm.get('negotiated')?.valueChanges.subscribe((negotiated) => this.handleNegotiatedChange(negotiated));
  }

  private async loadNegotiationOffers() {
    const offers = await this.dataService.fetchNegotiationOffers(this.debt().id!);
    this.negotiationOffers.set(offers);
  }

  private initCharts() {
    this.createEvolutionChart();
    this.createCompositionChart();
  }

  private updateCharts() {
    if (this.evolutionChart) {
      this.evolutionChart.destroy();
    }
    if (this.compositionChart) {
      this.compositionChart.destroy();
    }
    this.createEvolutionChart();
    this.createCompositionChart();
  }

  private createEvolutionChart() {
    const canvas = this.evolutionChartRef()?.nativeElement;
    if (!canvas) return;

    const history = this.monthlyHistory();
    const labels = history.map(h => h.month);
    const data = history.map(h => h.value);

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Valor da Dívida',
          data,
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
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
              label: (ctx) => `Valor: ${ctx.parsed.y.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
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

    this.evolutionChart = new Chart(canvas, config);
  }

  private createCompositionChart() {
    const canvas = this.compositionChartRef()?.nativeElement;
    if (!canvas) return;

    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: ['Principal', 'Juros'],
        datasets: [{
          data: [this.debt().original_value, this.debt().interest_value],
          backgroundColor: [
            'rgb(34, 197, 94)',
            'rgb(239, 68, 68)'
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

  daysOverdue = computed(() => {
    const dateStr = this.debt().debt_date;
    if (!dateStr || dateStr === 'dd/mm/yyyy') return 0;
    
    const parts = dateStr.split('/');
    if (parts.length !== 3) return 0;
    
    try {
      const debtDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      debtDate.setHours(0, 0, 0, 0);
      
      const diff = Math.floor((today.getTime() - debtDate.getTime()) / (1000 * 60 * 60 * 24));
      return diff > 0 ? diff : 0;
    } catch {
      return 0;
    }
  });

  monthlyInterestRate = computed(() => {
    const debt = this.debt();
    const debtDate = new Date(debt.debt_date.split('/').reverse().join('-'));
    const lastUpdate = new Date(debt.last_update_date.split('/').reverse().join('-'));
    const months = (lastUpdate.getTime() - debtDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    
    if (months > 0 && debt.original_value > 0) {
      const rate = (Math.pow(debt.current_value / debt.original_value, 1 / months) - 1) * 100;
      return rate.toFixed(2);
    }
    return '0.00';
  });

  monthlyGrowth = computed(() => this.debt().next_month_estimate - this.debt().current_value);

  sixMonthProjection = computed(() => {
    const rate = parseFloat(this.monthlyInterestRate()) / 100;
    return this.debt().current_value * Math.pow(1 + rate, 6);
  });

  minimumPayment = computed(() => this.debt().current_value * 0.1);
  recommendedPayment = computed(() => this.debt().current_value * 0.3);

  principalPercentage = computed(() => {
    const total = this.debt().current_value;
    return total > 0 ? ((this.debt().original_value / total) * 100).toFixed(1) : '0';
  });

  interestPercentage = computed(() => {
    const total = this.debt().current_value;
    return total > 0 ? ((this.debt().interest_value / total) * 100).toFixed(1) : '0';
  });



  negotiationOffers = signal<any[]>([]);

  chatContext = computed(() => ({
    type: 'debt',
    item: {
      ...this.debt(),
      negotiation_offers: this.negotiationOffers()
    }
  }));

  suggestedQuestions = computed(() => [
    `Como negociar esta dívida de R$ ${this.debt().current_value.toFixed(2)}?`,
    `Vale a pena aceitar a oferta disponível?`,
    `Qual a melhor estratégia para quitar?`
  ]);

  monthlyHistory = computed(() => {
    const debt = this.debt();
    const parts = debt.debt_date.split('/');
    const debtDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    const lastParts = debt.last_update_date.split('/');
    const lastUpdate = new Date(parseInt(lastParts[2]), parseInt(lastParts[1]) - 1, parseInt(lastParts[0]));
    const months = Math.ceil((lastUpdate.getTime() - debtDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
    
    const history = [];
    const rate = parseFloat(this.monthlyInterestRate()) / 100;
    
    for (let i = 0; i <= Math.min(months, 12); i++) {
      const value = debt.original_value * Math.pow(1 + rate, i);
      const date = new Date(debtDate);
      date.setMonth(date.getMonth() + i);
      history.push({
        month: date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        value: value
      });
    }
    
    return history;
  });



  private showMessage(msg: {type: 'success' | 'error', text: string}) {
    this.message.set(msg);
    if (this.messageTimeout) clearTimeout(this.messageTimeout);
    this.messageTimeout = window.setTimeout(() => this.message.set(null), 5000);
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

  private handleNegotiatedChange(negotiated: boolean | null) {
    if (negotiated) {
      this.debtForm.get('discount_percentage')?.enable();
      this.debtForm.get('paid_value')?.enable();
    } else {
      this.debtForm.patchValue({
        discount_percentage: null,
        paid_value: null
      });
      this.debtForm.get('discount_percentage')?.disable();
      this.debtForm.get('paid_value')?.disable();
      
      // Marcar todos os anexos existentes para exclusão
      this.attachmentsToDelete.update(ids => [
        ...ids,
        ...this.attachments().map(att => att.id!).filter(id => !ids.includes(id))
      ]);
      this.attachments.set([]);
      
      // Limpar anexos temporários
      this.tempAttachments.set([]);
    }
  }

  calculateFields() {
    const original = this.debtForm.get('original_value')?.value ?? 0;
    const current = this.debtForm.get('current_value')?.value ?? 0;
    const isFrozen = this.debtForm.get('is_frozen')?.value ?? false;
    
    if (original > 0) {
      const interest = current - original;
      const growth = (interest / original) * 100;
      this.debtForm.patchValue({
        interest_value: parseFloat(interest.toFixed(2)),
        growth_percentage: parseFloat(growth.toFixed(2))
      }, { emitEvent: false });
    }

    if (isFrozen) {
      this.debtForm.patchValue({ next_month_estimate: 0 }, { emitEvent: false });
      return;
    }

    const debtDateStr = this.debtForm.get('debt_date')?.value;
    const lastUpdateDateStr = this.debtForm.get('last_update_date')?.value;
    
    if (current > 0 && original > 0 && debtDateStr && lastUpdateDateStr) {
      try {
        const debtDate = new Date(debtDateStr);
        const lastUpdateDate = new Date(lastUpdateDateStr);
        const timeDiff = lastUpdateDate.getTime() - debtDate.getTime();
        const dayDiff = timeDiff / (1000 * 3600 * 24);

        if (dayDiff > 0) {
          const dailyRate = Math.pow((current / original), 1 / dayDiff) - 1;
          const estimate = current * Math.pow(1 + dailyRate, 30);
          this.debtForm.patchValue({ next_month_estimate: parseFloat(estimate.toFixed(2)) }, { emitEvent: false });
        } else {
          this.debtForm.patchValue({ next_month_estimate: current }, { emitEvent: false });
        }
      } catch(e) {
        this.debtForm.patchValue({ next_month_estimate: 0 }, { emitEvent: false });
      }
    }
  }

  async enterEditMode() {
    this.loadingMessage.set('Carregando...');
    this.isLoading.set(true);
    try {
      this.internalEditMode.set(true);
      const currentDebt = this.debt();
      const isNegotiated = currentDebt.negotiated ?? false;
      if (isNegotiated) {
        this.debtForm.get('discount_percentage')?.enable();
        this.debtForm.get('paid_value')?.enable();
      }
      this.debtForm.patchValue({
        ...currentDebt,
        debt_date: this.toInputDate(currentDebt.debt_date),
        last_update_date: this.toInputDate(currentDebt.last_update_date),
        observation: currentDebt.observation ?? '',
        negotiated: isNegotiated,
        discount_percentage: currentDebt.discount_percentage ?? null,
        paid_value: currentDebt.paid_value ?? null,
        is_frozen: currentDebt.is_frozen ?? false
      });
      this.attachmentsToDelete.set([]);
      if (currentDebt.id) {
        await this.loadAttachments();
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  cancelEdit() {
    this.attachmentsToDelete.set([]);
    if (this.isEditMode()) {
      this.close.emit();
    } else if (this.internalEditMode()) {
      this.internalEditMode.set(false);
    } else {
      this.close.emit();
    }
  }

  async saveDebt() {
    if (this.debtForm.invalid) return;

    this.loadingMessage.set('Salvando dívida...');
    this.isLoading.set(true);
    try {
      const formValue = this.debtForm.getRawValue();
      const currentDebt = this.debt();

      if (!formValue.negotiated) {
        formValue.discount_percentage = null;
        formValue.paid_value = null;
      }

      const debtData = {
        ...formValue,
        debt_date: this.fromInputDate(formValue.debt_date),
        last_update_date: this.fromInputDate(formValue.last_update_date),
        observation: formValue.observation || null
      };

      if (currentDebt.id) {
        const updatedDebt: CreditCardDebt = { ...currentDebt, ...debtData };
        await this.dataService.updateCreditCardDebt(updatedDebt);
        
        for (const attachmentId of this.attachmentsToDelete()) {
          await this.dataService.deleteDebtAttachment(attachmentId);
        }
        this.attachmentsToDelete.set([]);
        
        for (const tempAtt of this.tempAttachments()) {
          await this.dataService.uploadDebtAttachment(tempAtt.file, currentDebt.id!, tempAtt.description);
        }
        this.tempAttachments.set([]);
        
        if (this.negotiationOffersRef()) {
          await this.negotiationOffersRef()!.persistChanges();
        }
        
        await this.loadAttachments();
        this.debtUpdated.emit(updatedDebt);
        this.internalEditMode.set(false);
        this.showMessage({type: 'success', text: 'Dívida atualizada com sucesso!'});
      } else {
        await this.dataService.addCreditCardDebt(debtData as Omit<CreditCardDebt, 'id' | 'created_at'>);
        const addedDebt = this.dataService.creditCardDebts().find(d => d.local === debtData.local);
        
        if (addedDebt?.id) {
          for (const tempAtt of this.tempAttachments()) {
            await this.dataService.uploadDebtAttachment(tempAtt.file, addedDebt.id, tempAtt.description);
          }
          this.tempAttachments.set([]);
          await this.loadAttachments();
        }
        
        this.debtUpdated.emit(addedDebt || debtData as CreditCardDebt);
        this.internalEditMode.set(false);
        this.showMessage({type: 'success', text: 'Dívida adicionada com sucesso!'});
      }
    } catch (error: any) {
      console.error('Error saving debt:', error);
      this.showMessage({type: 'error', text: 'Falha ao salvar dívida'});
    } finally {
      this.isLoading.set(false);
    }
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

  async loadAttachments() {
    const currentDebt = this.debt();
    if (currentDebt?.id) {
      try {
        const attachments = await this.dataService.fetchDebtAttachments(currentDebt.id);
        this.attachments.set(attachments);
      } catch (error: any) {
        console.error('Error loading attachments:', error);
      }
    }
  }

  deleteAttachment(attachment: DebtAttachment) {
    this.deletingAttachment.set(attachment);
    this.showDeleteAttachmentConfirm.set(true);
  }

  confirmDeleteAttachment() {
    const attachment = this.deletingAttachment();
    if (attachment?.id) {
      this.attachmentsToDelete.update(ids => [...ids, attachment.id!]);
      this.attachments.update(atts => atts.filter(a => a.id !== attachment.id));
    }
    this.showDeleteAttachmentConfirm.set(false);
    this.deletingAttachment.set(null);
  }

  viewAttachment(attachment: DebtAttachment) {
    this.selectedAttachment.set(attachment);
    this.showAttachmentModal.set(true);
  }

  viewTempAttachment(file: File) {
    const url = URL.createObjectURL(file);
    this.tempFileUrl.set(url);
    this.selectedAttachment.set({
      id: 0,
      debt_id: this.debt().id!,
      file_name: file.name,
      file_url: url,
      file_type: file.type,
      file_size: file.size
    } as DebtAttachment);
    this.showAttachmentModal.set(true);
  }

  closeAttachmentModal() {
    if (this.tempFileUrl()) {
      URL.revokeObjectURL(this.tempFileUrl()!);
      this.tempFileUrl.set(null);
    }
    this.showAttachmentModal.set(false);
    this.selectedAttachment.set(null);
  }

  formatFileSize(bytes: number | null): string {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  async analyzeDebt() {
    this.isLoadingAnalysis.set(true);
    this.isAnalysisVisible.set(true);
    this.analysisResult.set('');
    
    try {
      let fullText = '';
      const debtData = {
        ...this.debt(),
        monthly_interest_rate: this.monthlyInterestRate(),
        days_overdue: this.daysOverdue(),
        six_month_projection: this.sixMonthProjection()
      };

      for await (const chunk of this.geminiService.generateSuggestionsStream([debtData])) {
        fullText += chunk;
        this.analysisResult.set(marked(fullText) as string);
      }

    } catch(e: any) {
      this.analysisResult.set(`<p class="text-red-600">Erro ao gerar análise: ${e.message}</p>`);
    } finally {
      this.isLoadingAnalysis.set(false);
    }
  }
}
