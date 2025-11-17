import { Component, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthComponent } from './components/auth/auth.component';
import { SettingsComponent } from './components/settings/settings.component';
import { ApiErrorComponent } from './components/api-error/api-error.component';

import { DataService } from './services/data.service';
import { AuthService } from './services/auth.service';
import { SettingsService } from './services/settings.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, AuthComponent, SettingsComponent, ApiErrorComponent],
  template: `
    @if (authService.loading()) {
      <div class="min-h-screen bg-gray-50 flex items-center justify-center">
        <div class="text-center">
          <div class="w-16 h-16 border-4 border-slate-800 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-gray-600">Carregando...</p>
        </div>
      </div>
    } @else if (dataService.apiOffline()) {
      <app-api-error></app-api-error>
    } @else if (!authService.currentUser() && !isPublicRoute()) {
      <app-auth></app-auth>
    } @else if (!authService.currentUser() && isPublicRoute()) {
      <div class="min-h-screen bg-gray-50">
        <router-outlet></router-outlet>
      </div>
    } @else {
      <div class="min-h-screen bg-gray-50">
        <header class="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
          <div class="max-w-7xl mx-auto px-6 lg:px-8">
            <div class="flex items-center justify-between h-16">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </div>
                <h1 class="text-xl font-bold text-gray-900">Minhas finanças</h1>
              </div>
              <div class="flex items-center gap-4">
                <div class="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                  <button (click)="navigate('/')" class="px-4 py-2 rounded-lg text-sm font-medium transition-all" [class]="currentRoute() === '/' ? 'bg-slate-800 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'">
                    <div class="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
                      <span>Dashboard</span>
                    </div>
                  </button>
                  <button (click)="navigate('/dividas')" class="px-4 py-2 rounded-lg text-sm font-medium transition-all" [class]="currentRoute() === '/dividas' ? 'bg-slate-800 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'">
                    <div class="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                      <span>Dívidas</span>
                    </div>
                  </button>
                  <button (click)="navigate('/emprestimos')" class="px-4 py-2 rounded-lg text-sm font-medium transition-all" [class]="currentRoute() === '/emprestimos' ? 'bg-slate-800 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'">
                    <div class="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 8-4 4 4 4"/><path d="M8 12h13a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-1"/></svg>
                      <span>Empréstimos</span>
                    </div>
                  </button>
                  <button (click)="navigate('/rendimentos')" class="px-4 py-2 rounded-lg text-sm font-medium transition-all" [class]="currentRoute() === '/rendimentos' ? 'bg-slate-800 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'">
                    <div class="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                      <span>Rendimentos</span>
                    </div>
                  </button>
                  <button (click)="navigate('/metas')" class="px-4 py-2 rounded-lg text-sm font-medium transition-all" [class]="currentRoute() === '/metas' ? 'bg-slate-800 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'">
                    <div class="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                      <span>Metas</span>
                    </div>
                  </button>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-sm text-gray-600">{{ authService.currentUser()?.email }}</span>
                  <button 
                    (click)="showSettingsModal.set(true)" 
                    class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                    title="Configurações"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                  <button 
                    (click)="handleSignOut()" 
                    class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                  >
                    Sair
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div class="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          @if (dataService.apiError()) {
            <div class="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-sm">
              <div class="flex items-start">
                <svg class="h-6 w-6 text-red-500 mr-3 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div class="flex-1">
                  <h3 class="text-sm font-bold text-red-800">Erro de conexão com a API</h3>
                  <p class="text-sm text-red-700 mt-1">{{ dataService.apiError() }}</p>
                  <p class="text-xs text-red-600 mt-2">Verifique se a API está configurada corretamente no arquivo environment.ts</p>
                </div>
                <button (click)="dataService.apiError.set(null)" class="ml-4 text-red-500 hover:text-red-700">
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          }
          <router-outlet></router-outlet>
        </div>
      </div>

      @if (showSettingsModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" (click)="showSettingsModal.set(false)">
          <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
            <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 class="text-xl font-bold text-gray-900">Configurações</h2>
              <button (click)="showSettingsModal.set(false)" class="p-2 hover:bg-gray-100 rounded-lg transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div class="p-6">
              <app-settings (close)="showSettingsModal.set(false); showSettingsMessage($event)"></app-settings>
            </div>
          </div>
        </div>
      }

      @if (settingsMessage()) {
        <div class="fixed bottom-8 right-8 z-[9999] max-w-sm">
          <div [ngClass]="{'bg-red-100 border-red-500 text-red-700': settingsMessage()?.type === 'error', 'bg-green-100 border-green-500 text-green-700': settingsMessage()?.type === 'success'}" class="border-l-4 p-4 rounded-lg shadow-lg" role="alert">
            <div class="flex">
              <div class="py-1">
                <svg [ngClass]="{'text-red-500': settingsMessage()?.type === 'error', 'text-green-500': settingsMessage()?.type === 'success'}" class="h-6 w-6 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div class="flex-grow">
                <p class="font-bold">{{ settingsMessage()?.type === 'error' ? 'Erro' : 'Sucesso' }}</p>
                <p class="text-sm">{{ settingsMessage()?.text }}</p>
              </div>
              <button (click)="settingsMessage.set(null)" class="ml-4 -mt-2 -mr-2 text-gray-500 hover:text-gray-700">&times;</button>
            </div>
          </div>
        </div>
      }
    }
  `
})
export class AppComponent {
  dataService = inject(DataService);
  authService = inject(AuthService);
  settingsService = inject(SettingsService);
  private router = inject(Router);
  
  currentRoute = signal('/');
  showSettingsModal = signal(false);
  settingsMessage = signal<{type: 'success' | 'error', text: string} | null>(null);
  private messageTimeout?: number;

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute.set(event.url);
    });

    effect(() => {
      const user = this.authService.currentUser();
      const loading = this.authService.loading();
      const currentRoute = this.currentRoute();
      
      // Rotas que não precisam de autenticação
      const publicRoutes = ['/login', '/redefinir-senha'];
      const isPublicRoute = publicRoutes.some(route => currentRoute.startsWith(route));
      
      if (!user && !loading && !isPublicRoute) {
        this.router.navigate(['/login']);
      } else if (user && currentRoute === '/login') {
        this.router.navigate(['/painel']);
      }
    });

    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        this.settingsService.loadSettings();
      }
    });
  }

  navigate(route: string) {
    this.dataService.resetComponentStates();
    this.router.navigate([route]);
  }

  isPublicRoute(): boolean {
    const publicRoutes = ['/login', '/redefinir-senha'];
    return publicRoutes.some(route => this.currentRoute().startsWith(route));
  }

  showMessage(msg: {type: 'success' | 'error', text: string}) {
    this.settingsMessage.set(msg);
    if (this.messageTimeout) clearTimeout(this.messageTimeout);
    this.messageTimeout = window.setTimeout(() => this.settingsMessage.set(null), 5000);
  }

  private showSettingsMessage(msg: {type: 'success' | 'error', text: string}) {
    this.showMessage(msg);
  }

  async handleSignOut() {
    await this.authService.signOut();
    this.settingsService.reset();
  }
}
