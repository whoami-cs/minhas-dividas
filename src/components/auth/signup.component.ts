import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { EmailService } from '../../services/email.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Criar nova conta
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Gerencie suas dívidas de forma inteligente
          </p>
        </div>
        
        <form [formGroup]="signupForm" (ngSubmit)="onSubmit()" class="mt-8 space-y-6">
          @if (errorMessage()) {
            <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {{ errorMessage() }}
            </div>
          }
          
          @if (successMessage()) {
            <div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {{ successMessage() }}
            </div>
          }

          <div class="space-y-4">
            <div>
              <label for="firstName" class="block text-sm font-medium text-gray-700">
                Nome *
              </label>
              <input
                id="firstName"
                type="text"
                formControlName="firstName"
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Seu nome"
              />
            </div>

            <div>
              <label for="lastName" class="block text-sm font-medium text-gray-700">
                Sobrenome
              </label>
              <input
                id="lastName"
                type="text"
                formControlName="lastName"
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Seu sobrenome"
              />
            </div>

            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">
                Email *
              </label>
              <input
                id="email"
                type="email"
                formControlName="email"
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">
                Senha *
              </label>
              <input
                id="password"
                type="password"
                formControlName="password"
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
                Confirmar Senha *
              </label>
              <input
                id="confirmPassword"
                type="password"
                formControlName="confirmPassword"
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Confirme sua senha"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              [disabled]="loading() || signupForm.invalid"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              @if (loading()) {
                <span class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
              }
              Criar Conta
            </button>
          </div>

          <div class="text-center space-y-2">
            <a routerLink="/login" class="text-indigo-600 hover:text-indigo-500 block">
              Já tem uma conta? Faça login
            </a>
            <a routerLink="/redefinir-senha" class="text-gray-600 hover:text-gray-500 text-sm">
              Esqueceu a senha?
            </a>
          </div>
        </form>
      </div>
    </div>
  `
})
export class SignupComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private emailService = inject(EmailService);
  private router = inject(Router);

  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  signupForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  passwordMatchValidator(form: any) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  async onSubmit() {
    if (this.signupForm.invalid) return;

    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const { firstName, lastName, email, password } = this.signupForm.value;

    try {
      // Criar conta
      const { data, error } = await this.authService.signUp(
        email!,
        password!,
        firstName!,
        lastName || undefined
      );

      if (error) {
        this.errorMessage.set(error.error || 'Erro ao criar conta');
        return;
      }

      this.successMessage.set(
        'Conta criada com sucesso! Verifique seu email para começar a usar a plataforma.'
      );

      // Redirecionar após 3 segundos
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 3000);

    } catch (error: any) {
      this.errorMessage.set('Erro inesperado. Tente novamente.');
      console.error('Erro no cadastro:', error);
    } finally {
      this.loading.set(false);
    }
  }
}