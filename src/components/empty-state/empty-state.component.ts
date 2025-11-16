import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="col-span-full text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-300">
      <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <ng-content select="[icon]"></ng-content>
      </div>
      <h4 class="text-xl font-bold text-gray-900 mb-2">{{ title }}</h4>
      <p class="text-gray-500 mb-6">{{ description }}</p>
      @if (showButton) {
        <button (click)="action.emit()" class="inline-flex items-center gap-2 bg-slate-800 text-white font-semibold py-2.5 px-5 rounded-lg hover:bg-slate-700 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          {{ buttonText }}
        </button>
      }
    </div>
  `
})
export class EmptyStateComponent {
  @Input() title = 'Nenhum item cadastrado';
  @Input() description = 'Comece adicionando seu primeiro item';
  @Input() buttonText = 'Adicionar item';
  @Input() showButton = true;
  @Output() action = new EventEmitter<void>();
}
