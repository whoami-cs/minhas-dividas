import { Injectable, signal, inject } from '@angular/core';
import { environment } from '../environments/environment';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';

export interface UserSettings {
  ai_chat_model: string;
  ai_analysis_model: string;
  ai_extraction_model: string;
}

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private authService = inject(AuthService);
  private tokenService = inject(TokenService);
  private loading = false;
  private loaded = false;
  
  settings = signal<UserSettings>({
    ai_chat_model: 'gemini-2.5-flash',
    ai_analysis_model: 'gemini-2.5-flash',
    ai_extraction_model: 'gemini-2.5-flash',
  });

  async loadSettings(force = false): Promise<void> {
    if (this.loading || (!force && this.loaded)) return;
    this.loading = true;
    const user = this.authService.currentUser();
    if (!user) return;

    try {
      const token = this.tokenService.getToken();
      if (!token) return;

      const response = await fetch(`${environment.apiUrl}/settings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        this.settings.set(data);
        this.loaded = true;
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      this.loading = false;
    }
  }

  async updateSettings(settings: Partial<UserSettings>): Promise<void> {
    const user = this.authService.currentUser();
    if (!user) return;

    try {
      const token = this.tokenService.getToken();
      if (!token) throw new Error('No token');

      const response = await fetch(`${environment.apiUrl}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        const data = await response.json();
        this.settings.set(data);
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  }

  reset(): void {
    this.loaded = false;
    this.settings.set({
      ai_chat_model: 'gemini-2.5-flash',
      ai_analysis_model: 'gemini-2.5-flash',
      ai_extraction_model: 'gemini-2.5-flash',
    });
  }
}
