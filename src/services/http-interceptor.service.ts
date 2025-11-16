import { Injectable, inject } from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, switchMap, throwError, from } from 'rxjs';
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
        // Tenta renovar o token
        return from(tokenService.refreshAccessToken()).pipe(
          switchMap((newToken: string | null) => {
            if (newToken) {
              // Se um novo token for obtido, clona a requisição com o novo token e a reenvia
              const clonedReq = req.clone({
                setHeaders: { Authorization: `Bearer ${newToken}` }
              });
              return next(clonedReq);
            } else {
              // Se a renovação falhar, desloga o usuário e o redireciona
              authService.signOut();
              router.navigate(['/login']);
              return throwError(() => new Error('Sessão expirada. Faça login novamente.'));
            }
          }),
          catchError((refreshError) => {
            // Se ocorrer um erro durante a tentativa de renovação, desloga e redireciona
            authService.signOut();
            router.navigate(['/login']);
            return throwError(() => new Error('Não foi possível renovar a sessão.'));
          })
        );
      }
      // Para outros erros, apenas os repassa
      return throwError(() => error);
    })
  );
};
