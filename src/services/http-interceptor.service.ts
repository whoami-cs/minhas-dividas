import { Injectable, inject } from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, switchMap, throwError } from 'rxjs';
import { TokenService } from './token.service';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const tokenService = inject(TokenService);
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = tokenService.getToken();
  if (token && !req.url.includes('/auth/')) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/auth/')) {
        return new Promise<string | null>((resolve) => {
          tokenService.refreshAccessToken().then(resolve);
        }).then((newToken) => {
          if (newToken) {
            const clonedReq = req.clone({
              setHeaders: { Authorization: `Bearer ${newToken}` }
            });
            return next(clonedReq);
          } else {
            authService.signOut();
            router.navigate(['/login']);
            return throwError(() => new Error('Sessão expirada'));
          }
        });
      }
      return throwError(() => error);
    })
  );
};
