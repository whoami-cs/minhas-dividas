import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private apiUrl = environment.apiUrl;

  async sendWelcomeEmail(email: string, firstName: string) {
    try {
      const response = await fetch(`${this.apiUrl}/email/welcome`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, firstName })
      });

      const data = await response.json();
      return { data, error: response.ok ? null : data };
    } catch (error: any) {
      return { data: null, error };
    }
  }

  async sendPasswordReset(email: string) {
    try {
      const response = await fetch(`${this.apiUrl}/email/password-reset`, {
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

  async resetPassword(token: string, newPassword: string) {
    try {
      const response = await fetch(`${this.apiUrl}/email/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token, newPassword })
      });

      const data = await response.json();
      return { data, error: response.ok ? null : data };
    } catch (error: any) {
      return { data: null, error };
    }
  }

  async sendEmailVerification(email: string, firstName: string) {
    try {
      const response = await fetch(`${this.apiUrl}/email/verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, firstName })
      });

      const data = await response.json();
      return { data, error: response.ok ? null : data };
    } catch (error: any) {
      return { data: null, error };
    }
  }

  async verifyEmail(token: string) {
    try {
      const response = await fetch(`${this.apiUrl}/email/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      });

      const data = await response.json();
      return { data, error: response.ok ? null : data };
    } catch (error: any) {
      return { data: null, error };
    }
  }
}