import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-delete-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div style="position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; z-index: 9999 !important; display: flex !important; justify-content: center !important; align-items: center !important; margin: 0 !important; padding: 0 !important; background-color: rgba(0, 0, 0, 0.5) !important; backdrop-filter: blur(4px) !important;" (click)="onCancel()">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in" (click)="$event.stopPropagation()">
          <div class="p-6">
            <div class="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 text-center mb-2">{{ title }}</h3>
            <p class="text-gray-600 text-center mb-6">{{ message }}</p>
            @if (additionalInfo) {
              <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p class="text-sm text-red-800 font-medium">{{ additionalInfo }}</p>
              </div>
            }
          </div>
          <div class="bg-gray-50 px-6 py-4 flex gap-3 justify-end rounded-b-2xl">
            <button (click)="onCancel()" class="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
            <button (click)="onConfirm()" class="px-5 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors">Sim, excluir</button>
          </div>
        </div>
      </div>
    }
  `
})
export class DeleteConfirmationModalComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirmar Exclusão';
  @Input() message = 'Tem certeza que deseja excluir este item?';
  @Input() additionalInfo = '';
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm() {
    this.confirmed.emit();
  }

  onCancel() {
    this.cancelled.emit();
  }
}
