import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { EmailService } from '../../services/email.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div class="max-w-md w-full">
        <div class="bg-white rounded-2xl shadow-2xl p-8">
          <div class="text-center mb-8">
            <div class="w-16 h-16 bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <h1 class="text-3xl font-bold text-gray-900">{{ hasToken() ? 'Nova Senha' : 'Redefinir Senha' }}</h1>
            <p class="text-gray-600 mt-2">{{ hasToken() ? 'Digite sua nova senha' : 'Digite seu email para receber o link de redefinição' }}</p>
          </div>
          @if (validatingToken()) {
            <div class="text-center py-8">
              <div class="w-8 h-8 border-4 border-slate-800 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p class="text-gray-600">Validando link...</p>
            </div>
          } @else if (!tokenValid()) {
            <div class="text-center py-8">
              <p class="text-gray-600">Redirecionando...</p>
            </div>
          } @else {
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
        
            @if (!hasToken()) {
          <!-- Formulário para solicitar redefinição -->
          <form [formGroup]="requestForm" (ngSubmit)="onRequestReset()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                id="email"
                type="email"
                formControlName="email"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none transition"
                placeholder="seu@email.com"
              />
            </div>

            <button
              type="submit"
              [disabled]="loading() || requestForm.invalid"
              class="w-full bg-slate-800 text-white py-3 rounded-lg font-medium hover:bg-slate-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              @if (loading()) {
                <span class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></span>
              }
              {{ loading() ? 'Enviando...' : 'Enviar Link de Redefinição' }}
            </button>
          </form>

          <div class="mt-4 text-center">
            <a routerLink="/login" class="text-sm text-gray-600 hover:underline">
              Voltar ao Login
            </a>
          </div>
        } @else {
          <!-- Formulário para definir nova senha -->
          <form [formGroup]="resetForm" (ngSubmit)="onResetPassword()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nova Senha</label>
              <input
                id="password"
                type="password"
                formControlName="password"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none transition"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Confirmar Nova Senha</label>
              <input
                id="confirmPassword"
                type="password"
                formControlName="confirmPassword"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none transition"
                placeholder="Confirme sua nova senha"
              />
            </div>

            <button
              type="submit"
              [disabled]="loading() || resetForm.invalid"
              class="w-full bg-slate-800 text-white py-3 rounded-lg font-medium hover:bg-slate-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              @if (loading()) {
                <span class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></span>
              }
              {{ loading() ? 'Redefinindo...' : 'Redefinir Senha' }}
            </button>
          </form>
            }
          }
        </div>
      </div>
    </div>
    
    <!-- Toast para mensagens -->
    @if (message()) {
      <div class="fixed bottom-8 right-8 z-[9999] max-w-sm">
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
  `
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private emailService = inject(EmailService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);


  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  hasToken = signal(false);
  token = signal('');
  validatingToken = signal(false);
  tokenValid = signal(true);
  message = signal<{type: 'success' | 'error', text: string} | null>(null);
  private messageTimeout?: number;

  requestForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  resetForm = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  async ngOnInit() {
    console.log('ngOnInit executado');
    const tokenParam = this.route.snapshot.queryParams['token'];
    console.log('Token da URL:', tokenParam);
    if (tokenParam) {
      this.hasToken.set(true);
      this.token.set(tokenParam);
      this.validatingToken.set(true);
      console.log('Iniciando validação do token...');
      await this.validateToken(tokenParam);
      this.validatingToken.set(false);
      console.log('Validação concluída');
    }
  }

  private async validateToken(token: string) {
    try {
      console.log('Validando token no frontend:', token);
      const url = 'http://localhost:3001/api/email/validate-reset-token';
      console.log('URL da requisição:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        this.tokenValid.set(false);
        const error = await response.json();
        console.log('Erro da API:', error);
        this.showMessage({ type: 'error', text: error.error || 'Link inválido ou expirado' });
        setTimeout(() => this.router.navigate(['/login']), 2000);
        return;
      }
      
      const result = await response.json();
      console.log('Token válido - resultado:', result);
    } catch (error) {
      console.error('Erro na validação:', error);
      this.tokenValid.set(false);
      this.showMessage({ type: 'error', text: 'Erro ao validar link' });
      setTimeout(() => this.router.navigate(['/login']), 2000);
    }
  }

  passwordMatchValidator(form: any) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  async onRequestReset() {
    if (this.requestForm.invalid) return;

    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const { email } = this.requestForm.value;

    try {
      const { data, error } = await this.emailService.sendPasswordReset(email!);

      if (error) {
        this.errorMessage.set(error.error || 'Erro ao enviar email');
        return;
      }

      this.successMessage.set(
        'Se o email existir em nossa base, você receberá um link para redefinir sua senha.'
      );

    } catch (error: any) {
      this.errorMessage.set('Erro inesperado. Tente novamente.');
      console.error('Erro ao solicitar redefinição:', error);
    } finally {
      this.loading.set(false);
    }
  }

  async onResetPassword() {
    if (this.resetForm.invalid) return;

    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const { password } = this.resetForm.value;

    try {
      const { data, error } = await this.emailService.resetPassword(
        this.token(),
        password!
      );

      if (error) {
        this.errorMessage.set(error.error || 'Erro ao redefinir senha');
        return;
      }

      this.showMessage({ type: 'success', text: 'Senha redefinida com sucesso!' });
      
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);

    } catch (error: any) {
      this.errorMessage.set('Erro inesperado. Tente novamente.');
      console.error('Erro ao redefinir senha:', error);
    } finally {
      this.loading.set(false);
    }
  }

  private showMessage(msg: {type: 'success' | 'error', text: string}) {
    this.message.set(msg);
    if (this.messageTimeout) clearTimeout(this.messageTimeout);
    this.messageTimeout = window.setTimeout(() => this.message.set(null), 5000);
  }
}