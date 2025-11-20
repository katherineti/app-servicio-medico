import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
// import type { ResetPasswordDto, ResetPasswordResponse } from '../../shared/models/reset-password.dto';
import type { ForgotPasswordDto, ForgotPasswordResponse } from './forgot-password.dto';
import type { ResetPasswordDto, ResetPasswordResponse } from './reset-password.dto';

@Injectable({
  providedIn: 'root',
})
export class PasswordRecoveryService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/auth'; // Ajusta según tu backend

  forgotPassword(dto: ForgotPasswordDto): Observable<ForgotPasswordResponse> {
    return this.http.post<ForgotPasswordResponse>(`${this.apiUrl}/forgot-password`, dto);
  }

  resetPassword(dto: ResetPasswordDto): Observable<ResetPasswordResponse> {
    return this.http.post<ResetPasswordResponse>(`${this.apiUrl}/reset-password`, dto);
  }

  // Verificar si el token es válido (opcional, pero útil)
  verifyToken(token: string): Observable<{ ok: boolean }> {
    return this.http.get<{ ok: boolean }>(`${this.apiUrl}/verify-reset-token/${token}`);
  }
}
