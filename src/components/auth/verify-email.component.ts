import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { EmailService } from '../../services/email.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div class="text-center">
          <div class="w-16 h-16 mx-auto mb-4">
            @if (loading()) {
              <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
            } @else if (success()) {
              <svg class="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            } @else {
              <svg class="w-16 h-16 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            }
          </div>
          
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {{ getTitle() }}
          </h2>
          
          <p class="mt-2 text-center text-sm text-gray-600">
            {{ getMessage() }}
          </p>
        </div>

        @if (errorMessage()) {
          <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {{ errorMessage() }}
          </div>
        }

        @if (success()) {
          <div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            Email verificado com sucesso! Você já pode fazer login.
          </div>
        }

        <div class="text-center">
          <a 
            routerLink="/login" 
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {{ success() ? 'Fazer Login' : 'Voltar ao Login' }}
          </a>
        </div>
      </div>
    </div>
  `
})
export class VerifyEmailComponent implements OnInit {
  private emailService = inject(EmailService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loading = signal(true);
  success = signal(false);
  errorMessage = signal('');

  ngOnInit() {
    const token = this.route.snapshot.queryParams['token'];
    if (token) {
      this.verifyEmail(token);
    } else {
      this.loading.set(false);
      this.errorMessage.set('Token de verificação não encontrado');
    }
  }

  async verifyEmail(token: string) {
    try {
      const { data, error } = await this.emailService.verifyEmail(token);

      if (error) {
        this.errorMessage.set(error.error || 'Token inválido ou expirado');
      } else {
        this.success.set(true);
      }
    } catch (error: any) {
      this.errorMessage.set('Erro inesperado. Tente novamente.');
      console.error('Erro na verificação:', error);
    } finally {
      this.loading.set(false);
    }
  }

  getTitle(): string {
    if (this.loading()) return 'Verificando Email...';
    if (this.success()) return 'Email Verificado!';
    return 'Erro na Verificação';
  }

  getMessage(): string {
    if (this.loading()) return 'Aguarde enquanto verificamos seu email';
    if (this.success()) return 'Seu email foi verificado com sucesso';
    return 'Não foi possível verificar seu email';
  }
}