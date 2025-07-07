import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TokenService } from '../../services/Token.service';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly tokenService = inject(TokenService);
  private readonly http = inject(HttpClient);

  //Solo admin
  totalUsers(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(
      `${this.tokenService.endPoint}dashboard/totalUsers`
    );
  }

  //Para todos:
  totalProductsOfTheDay(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(
      `${this.tokenService.endPoint}dashboard/totalProductsOfTheDay`
    );
  }

  totalProductsOfMonth(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(
      `${this.tokenService.endPoint}dashboard/totalProductsOfMonth`
    );
  }
  
  //Para el dashboard del usuario almacen:
  totalAssignmentOfTheDay(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(
      `${this.tokenService.endPoint}dashboard/totalAssignmentOfTheDay`
    );
  }

  totalAssignmentOfMonth(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(
      `${this.tokenService.endPoint}dashboard/totalAssignmentOfMonth`
    );
  }

    //Solo almacen
    totalAllProducts(): Observable<{ count: number }> {
      return this.http.get<{ count: number }>(
        `${this.tokenService.endPoint}dashboard/totalAllProducts`
      );
    }
    //Solo médico
    totalAllAssignments(): Observable<{ count: number }> {
      return this.http.get<{ count: number }>(
        `${this.tokenService.endPoint}dashboard/totalAssignments`
      );
    }

    // Nuevos
    totalAvailableProductsByType(): Observable<any> {
      return this.http.get<any>(
        `${this.tokenService.endPoint}dashboard/totalAvailableProductsByType`
      );
    }
    totalOfProductAssignmentsByType(): Observable<any> {
      return this.http.get<any>(
        `${this.tokenService.endPoint}dashboard/totalOfProductAssignmentsByType`
      );
    }
    expiredProductsCount(): Observable<any> {
      return this.http.get<any>(
        `${this.tokenService.endPoint}dashboard/expiredProductsCount`
      );
    }

    /**
   * Genera y descarga un PDF para un reporte de auditoría
   * @param id ID del reporte
   * @returns Observable que completa cuando la descarga inicia
   */
  generateReportPdf(id: number,body:any): Observable<void> {
    // Configuración para recibir una respuesta blob (archivo binario)
    const options = {
      responseType: 'blob' as 'blob',
      observe: 'response' as const
    };
    
    return new Observable<void>(observer => {
      this.http.post(`${this.tokenService.endPoint}temp-auditor-reports/pdf/${id}`, body,options)
        .subscribe({
          next: (response: HttpResponse<Blob>) => {
            if (response.body) {
              // Crear un objeto URL para el blob
              const blob = new Blob([response.body], { type: 'application/pdf' });
              const url = window.URL.createObjectURL(blob);
              
              // Extraer el nombre del archivo del header Content-Disposition si está disponible
              let filename = `reporte-auditoria-${id}.pdf`;
              const contentDisposition = response.headers.get('Content-Disposition');
              if (contentDisposition) {
                const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                const matches = filenameRegex.exec(contentDisposition);
                if (matches != null && matches[1]) {
                  filename = matches[1].replace(/['"]/g, '');
                }
              }
              
              // Crear un elemento <a> para descargar el archivo
              const link = document.createElement('a');
              link.href = url;
              link.download = filename;
              
              // Añadir al DOM, hacer clic y luego eliminar
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              
              // Liberar el objeto URL
              setTimeout(() => {
                window.URL.revokeObjectURL(url);
              }, 100);
              
              observer.next();
              observer.complete();
            } else {
              observer.error('La respuesta no contiene datos');
            }
          },
          error: (err) => {
            console.error('Error al generar el PDF:', err);
            observer.error(err);
          }
        });
    });
  }

    /**
   * Genera y descarga un PDF para un reporte de auditoría
   * @param id ID del reporte
   * @returns Observable que completa cuando la descarga inicia
   */
  generateDashboardReport(id: number,body:any): Observable<void> {
    // Configuración para recibir una respuesta blob (archivo binario)
    const options = {
      responseType: 'blob' as 'blob',
      observe: 'response' as const
    };
    
    return new Observable<void>(observer => {
      this.http.post(`${this.tokenService.endPoint}dashboard-reports/pdf/${id}`, body,options)
        .subscribe({
          next: (response: HttpResponse<Blob>) => {
            if (response.body) {
              // Crear un objeto URL para el blob
              const blob = new Blob([response.body], { type: 'application/pdf' });
              const url = window.URL.createObjectURL(blob);
              
              // Extraer el nombre del archivo del header Content-Disposition si está disponible
              let filename = `reporte-auditoria-${id}.pdf`;
              const contentDisposition = response.headers.get('Content-Disposition');
              if (contentDisposition) {
                const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                const matches = filenameRegex.exec(contentDisposition);
                if (matches != null && matches[1]) {
                  filename = matches[1].replace(/['"]/g, '');
                }
              }
              
              // Crear un elemento <a> para descargar el archivo
              const link = document.createElement('a');
              link.href = url;
              link.download = filename;
              
              // Añadir al DOM, hacer clic y luego eliminar
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              
              // Liberar el objeto URL
              setTimeout(() => {
                window.URL.revokeObjectURL(url);
              }, 100);
              
              observer.next();
              observer.complete();
            } else {
              observer.error('La respuesta no contiene datos');
            }
          },
          error: (err) => {
            console.error('Error al generar el PDF:', err);
            observer.error(err);
          }
        });
    });
  }

}