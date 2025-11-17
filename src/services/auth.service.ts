import { Injectable, signal, inject } from '@angular/core';
import { environment } from '../environments/environment';
import { TokenService } from './token.service';

interface User {
  id: string;
  email?: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private tokenService = inject(TokenService);
  currentUser = signal<User | null>(null);
  loading = signal(true);

  constructor() {
    this.initAuth();
  }

  private async initAuth() {
    const session = await this.tokenService.getSession();
    this.currentUser.set(session?.session?.user ?? null);
    this.loading.set(false);
  }

  async signUp(email: string, password: string, firstName: string, lastName?: string) {
    try {
      const response = await fetch(`${environment.apiUrl}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, firstName, lastName })
      });

      const data = await response.json();
      return { data, error: response.ok ? null : data };
    } catch (error: any) {
      return { data: null, error };
    }
  }

  async signIn(email: string, password: string) {
    try {
      const response = await fetch(`${environment.apiUrl}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { data: null, error: data };
      }

      this.tokenService.setToken(data.access_token);
      if (data.refresh_token) {
        this.tokenService.setRefreshToken(data.refresh_token);
      }
      this.currentUser.set(data.user);
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }

  async signOut() {
    try {
      const token = this.tokenService.getToken();
      if (token) {
        await fetch(`${environment.apiUrl}/auth/signout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      this.tokenService.removeToken();
      this.currentUser.set(null);
    }
    return { error: null };
  }

  async resetPassword(email: string) {
    try {
      const response = await fetch(`${environment.apiUrl}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      return { data, error: response.ok ? null : data };
    } catch (error: any) {
      return { data: null, error };
    }
  }

  async updatePassword(newPassword: string, accessToken: string) {
    try {
      const response = await fetch(`${environment.apiUrl}/auth/update-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ password: newPassword })
      });

      const data = await response.json();
      return { data, error: response.ok ? null : data };
    } catch (error: any) {
      return { data: null, error };
    }
  }
}
