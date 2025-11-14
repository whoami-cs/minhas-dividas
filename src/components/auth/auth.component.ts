import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div class="max-w-md w-full">
        <div class="bg-white rounded-2xl shadow-2xl p-8">
          <div class="text-center mb-8">
            <div class="w-16 h-16 bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <h1 class="text-3xl font-bold text-gray-900">Minhas Finanças</h1>
            <p class="text-gray-600 mt-2">Entre na sua conta</p>
          </div>

          @if (errorMessage()) {
            <div class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p class="text-sm text-red-800">{{ errorMessage() }}</p>
            </div>
          }

          @if (successMessage()) {
            <div class="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p class="text-sm text-green-800">{{ successMessage() }}</p>
            </div>
          }

          <form (ngSubmit)="handleSubmit()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input 
                type="email" 
                [(ngModel)]="email" 
                name="email"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none transition"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Senha</label>
              <input 
                type="password" 
                [(ngModel)]="password" 
                name="password"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none transition"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              [disabled]="loading()"
              class="w-full bg-slate-800 text-white py-3 rounded-lg font-medium hover:bg-slate-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ loading() ? 'Aguarde...' : 'Entrar' }}
            </button>
          </form>

          <div class="mt-4 text-center">
            <button 
              (click)="showResetPassword()" 
              class="text-sm text-gray-600 hover:underline"
            >
              Esqueceu a senha?
            </button>
          </div>

          @if (resetMode()) {
            <div class="mt-4 p-4 bg-gray-50 rounded-lg">
              <p class="text-sm text-gray-700 mb-3">Digite seu email para recuperar a senha:</p>
              <input 
                type="email" 
                [(ngModel)]="resetEmail" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3"
                placeholder="seu@email.com"
              />
              <button 
                (click)="handleResetPassword()"
                class="w-full bg-gray-800 text-white py-2 rounded-lg text-sm hover:bg-gray-700"
              >
                Enviar link de recuperação
              </button>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class AuthComponent {
  private authService = inject(AuthService);

  email = '';
  password = '';
  resetEmail = '';
  resetMode = signal(false);
  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  showResetPassword() {
    this.resetMode.update(v => !v);
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  async handleSubmit() {
    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const { error } = await this.authService.signIn(this.email, this.password);
    if (error) {
      this.errorMessage.set('Email ou senha incorretos');
    }

    this.loading.set(false);
  }

  async handleResetPassword() {
    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const { error } = await this.authService.resetPassword(this.resetEmail);
    
    if (error) {
      this.errorMessage.set(error.message);
    } else {
      this.successMessage.set('Link de recuperação enviado para seu email!');
      this.resetMode.set(false);
    }

    this.loading.set(false);
  }
}
