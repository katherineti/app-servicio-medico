import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TokenService } from '../services/Token.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BackupService {
  private readonly tokenService = inject(TokenService);
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${this.tokenService.endPoint}db-backup`; 
  downloadDatabaseBackup() {
    return this.http.get(`${this.apiUrl}/download`, {
      responseType: 'blob' 
    });
  }
  uploadDatabaseBackup(file: File): Observable<{ message: string }> {
    const formData = new FormData();
    formData.append('file', file, file.name); 
    return this.http.post<{ message: string }>(`${this.apiUrl}/upload`, formData);
  }
}