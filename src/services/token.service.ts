import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private apiUrl = environment.apiUrl;
  private isRefreshing = false;

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  setToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  setRefreshToken(token: string): void {
    localStorage.setItem('refresh_token', token);
  }

  removeToken(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  async refreshAccessToken(): Promise<string | null> {
    if (this.isRefreshing) return null;
    
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return null;

    this.isRefreshing = true;
    try {
      const response = await fetch(`${this.apiUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken })
      });

      if (!response.ok) {
        this.removeToken();
        return null;
      }

      const data = await response.json();
      this.setToken(data.access_token);
      if (data.refresh_token) {
        this.setRefreshToken(data.refresh_token);
      }
      return data.access_token;
    } catch (error) {
      console.error('Error refreshing token:', error);
      this.removeToken();
      return null;
    } finally {
      this.isRefreshing = false;
    }
  }

  async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const token = this.getToken();
    if (token && !url.includes('/auth/')) {
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      };
    }

    let response = await fetch(url, options);

    if (response.status === 401 && !url.includes('/auth/')) {
      const newToken = await this.refreshAccessToken();
      if (newToken) {
        options.headers = {
          ...options.headers,
          'Authorization': `Bearer ${newToken}`
        };
        response = await fetch(url, options);
      }
    }

    return response;
  }

  async getSession(): Promise<{ session: { access_token: string; user: any } } | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const response = await fetch(`${this.apiUrl}/auth/session`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        this.removeToken();
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }
}
