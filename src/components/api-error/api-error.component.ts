import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-api-error',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div class="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 mb-3">Serviço indisponível</h1>
        <p class="text-gray-600 mb-6">Não foi possível conectar com o servidor. Tente novamente mais tarde.</p>
        <button (click)="checkAndReload()" [disabled]="checking()" class="w-full px-6 py-3 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
          {{ checking() ? 'Verificando...' : 'Tentar novamente' }}
        </button>
      </div>
    </div>
  `
})
export class ApiErrorComponent {
  private dataService = inject(DataService);
  checking = signal(false);

  async checkAndReload() {
    this.checking.set(true);
    const isHealthy = await this.dataService.checkHealth();
    if (isHealthy) {
      this.dataService.apiOffline.set(false);
      window.location.reload();
    } else {
      this.checking.set(false);
    }
  }
}
