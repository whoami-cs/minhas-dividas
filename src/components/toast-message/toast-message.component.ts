import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ToastMessage {
  type: 'success' | 'error';
  text: string;
  details?: string;
}

@Component({
  selector: 'app-toast-message',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (message) {
      <div style="position: fixed !important; bottom: 2rem !important; right: 2rem !important; z-index: 9998 !important; max-width: 24rem !important; margin: 0 !important; padding: 0 !important;">
        <div
          [ngClass]="{
            'bg-red-100 border-red-500 text-red-700': message.type === 'error',
            'bg-green-100 border-green-500 text-green-700': message.type === 'success'
          }"
          class="border-l-4 p-4 rounded-lg shadow-lg"
          role="alert">
          <div class="flex">
            <div class="py-1">
              <svg [ngClass]="{'text-red-500': message.type === 'error', 'text-green-500': message.type === 'success'}" class="h-6 w-6 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div class="flex-grow">
              <p class="font-bold">{{ message.type === 'error' ? 'Erro' : 'Sucesso' }}</p>
              <p class="text-sm">{{ message.text }}</p>
              @if (message.details) {
                <button (click)="showDetails = !showDetails" class="text-xs text-gray-600 hover:underline mt-2">
                  {{ showDetails ? 'Ocultar' : 'Ver' }} detalhes
                </button>
                @if (showDetails) {
                  <pre class="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto whitespace-pre-wrap break-words">{{ message.details }}</pre>
                }
              }
            </div>
            <button (click)="close.emit()" class="ml-4 -mt-2 -mr-2 text-gray-500 hover:text-gray-700">&times;</button>
          </div>
        </div>
      </div>
    }
  `
})
export class ToastMessageComponent {
  @Input() message: ToastMessage | null = null;
  @Output() close = new EventEmitter<void>();
  showDetails = false;
}
