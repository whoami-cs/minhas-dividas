import { Component, inject, signal, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 class="text-lg font-semibold text-gray-800 mb-6">Modelos de IA</h3>
        
        <div class="space-y-6">
          <!-- Chat Model -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Modelo de Chat
            </label>
            <select 
              [ngModel]="chatModel()"
              (ngModelChange)="chatModel.set($event)"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            >
              <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
              <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
            </select>
            <p class="text-xs text-gray-500 mt-1">Modelo usado para conversas com a IA</p>
          </div>

          <!-- Analysis Model -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Modelo de Análise
            </label>
            <select 
              [ngModel]="analysisModel()"
              (ngModelChange)="analysisModel.set($event)"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            >
              <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
              <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
            </select>
            <p class="text-xs text-gray-500 mt-1">Modelo usado para análise financeira</p>
          </div>

          <!-- Extraction Model -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Modelo de Extração
            </label>
            <select 
              [ngModel]="extractionModel()"
              (ngModelChange)="extractionModel.set($event)"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            >
              <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
              <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
            </select>
            <p class="text-xs text-gray-500 mt-1">Modelo usado para extração de dados de documentos</p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3 mt-8">
          <button
            (click)="saveSettings()"
            [disabled]="saving()"
            class="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
          >
            {{ saving() ? 'Salvando...' : 'Salvar alterações' }}
          </button>
          <button
            (click)="resetSettings()"
            [disabled]="saving()"
            class="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
          >
            Restaurar padrão
          </button>
        </div>
      </div>


    </div>
  `,
})
export class SettingsComponent {
  private settingsService = inject(SettingsService);
  
  close = output<{type: 'success' | 'error', text: string}>();

  chatModel = signal(this.settingsService.settings().ai_chat_model);
  analysisModel = signal(this.settingsService.settings().ai_analysis_model);
  extractionModel = signal(this.settingsService.settings().ai_extraction_model);

  saving = signal(false);

  async saveSettings() {
    this.saving.set(true);

    try {
      await this.settingsService.updateSettings({
        ai_chat_model: this.chatModel(),
        ai_analysis_model: this.analysisModel(),
        ai_extraction_model: this.extractionModel(),
      });

      this.close.emit({type: 'success', text: 'Configurações salvas com sucesso!'});
    } catch (error) {
      this.close.emit({type: 'error', text: 'Erro ao salvar configurações. Tente novamente.'});
    } finally {
      this.saving.set(false);
    }
  }

  resetSettings() {
    this.chatModel.set('gemini-2.5-flash');
    this.analysisModel.set('gemini-2.5-flash');
    this.extractionModel.set('gemini-2.5-flash');
  }
}
