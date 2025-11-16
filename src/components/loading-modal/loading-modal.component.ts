import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div style="position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; z-index: 9999 !important; display: flex !important; justify-content: center !important; align-items: center !important; margin: 0 !important; padding: 0 !important; background-color: rgba(0, 0, 0, 0.5) !important; backdrop-filter: blur(4px) !important;">
        <div class="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md" style="margin: 0 !important;">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p class="ml-4 text-gray-700 font-semibold">{{ message }}</p>
            </div>
            @if (showCancel) {
              <button (click)="onCancel()" class="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            }
          </div>
          @if (additionalContent) {
            <div class="mt-4 bg-gray-50 p-3 rounded-lg text-xs max-h-48 overflow-hidden">
              <ng-content></ng-content>
            </div>
          }
        </div>
      </div>
    }
  `
})
export class LoadingModalComponent {
  @Input() isOpen = false;
  @Input() message = 'Carregando...';
  @Input() showCancel = false;
  @Input() additionalContent = false;
  @Input() onCancel = () => {};
}
