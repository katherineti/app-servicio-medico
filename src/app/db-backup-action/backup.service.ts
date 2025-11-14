import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TokenService } from '../services/Token.service';
import { Observable } from 'rxjs'; // ✅ Importar Observable

@Injectable({
  providedIn: 'root'
})
export class BackupService {

  private readonly tokenService = inject(TokenService);
  private readonly http = inject(HttpClient);
  
  // ✅ Cambio: Ahora usamos el prefijo del endpoint para construir las URLs
  private readonly apiUrl = `${this.tokenService.endPoint}db-backup`; 

  /**
   * Método para descargar el archivo de la DB.
   */
  downloadDatabaseBackup() {
    // Usa el nuevo apiUrl para construir la URL de descarga
    return this.http.get(`${this.apiUrl}/download`, {
      responseType: 'blob' 
    });
  }

  /**
   * ✅ NUEVO MÉTODO: Envía el archivo SQL al endpoint de restauración (POST a /db-backup/upload).
   * @param file El archivo .sql seleccionado por el usuario.
   * @returns Observable con el mensaje de éxito del backend.
   */
  uploadDatabaseBackup(file: File): Observable<{ message: string }> {
    const formData = new FormData();
    // 'file' debe coincidir con la clave usada en Multer en el Backend
    formData.append('file', file, file.name); 

    // POST a /db-backup/upload
    return this.http.post<{ message: string }>(`${this.apiUrl}/upload`, formData);
  }
}