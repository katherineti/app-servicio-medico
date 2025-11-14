import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TokenService } from './Token.service';
// import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BackupService {

  private readonly tokenService = inject(TokenService);
  private readonly http = inject(HttpClient);
  
  // Asegúrate de que esta URL base apunte a tu API de NestJS
  private readonly backupEndpoint = `${this.tokenService.endPoint}db-backup/download`; 

//   constructor(private http: HttpClient) {}

  /**
   * Método para descargar el archivo de la DB.
   * Usamos responseType: 'blob' para manejar el archivo binario.
   */
  downloadDatabaseBackup() {
    // Si tu endpoint está protegido por un JWT, HttpClient se encargará 
    // de adjuntar el token automáticamente (si está configurado con un Interceptor).
    return this.http.get(this.backupEndpoint, {
      responseType: 'blob' 
    });
  }
}