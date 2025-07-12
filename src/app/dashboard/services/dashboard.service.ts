import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TokenService } from '../../services/Token.service';
import { HttpClient, HttpResponse } from '@angular/common/http';

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
   * Genera y descarga un PDF para un reporte en el Dashboard
   * @returns Observable que completa cuando la descarga inicia
   */
  generateDashboardReport_Users(): Observable<void> {
    // Configuración para recibir una respuesta blob (archivo binario)
    const options = {
      responseType: 'blob' as 'blob',
      observe: 'response' as const
    };
    
    return new Observable<void>(observer => {
      // this.http.post(`${this.tokenService.endPoint}dashboard-reports/pdf/${id}`, body,options)
      this.http.post(`${this.tokenService.endPoint}dashboard-reports/pdf`, null, options)
        .subscribe({
          next: (response: HttpResponse<Blob>) => {
            if (response.body) {
              // Extraer el nombre del archivo del header Content-Disposition si está disponible
              let filename: string | null = null; 
              
              const contentDisposition = response.headers.get('Content-Disposition');
              console.log("reporte-estadistico-de-usuarios",contentDisposition)
              if (contentDisposition) { // Si el header existe 
                const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                const matches = filenameRegex.exec(contentDisposition);
                if (matches != null && matches[1]) { // Si la regex encuentra el nombre 
                  filename = matches[1].replace(/['"]/g, ''); // Asigna el nombre extraído
                }
              }
              
              if (!filename) {
                // El nombre de archivo se asigna aqui
                let today = new Date();
                let year = today.getFullYear();
                let month = (today.getMonth() + 1).toString().padStart(2, '0');
                let day = today.getDate().toString().padStart(2, '0');
                filename = `reporte-estadistico-de-usuarios-${year}-${month}-${day}.pdf`;
              }
              // Crear un objeto URL para el blob
              const blob = new Blob([response.body], { type: 'application/pdf' });
              const url = window.URL.createObjectURL(blob);
              
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

  pdfRegistryMedicalSupplies(reportTodayOrMonth:string): Observable<void> {
    // Configuración para recibir una respuesta blob (archivo binario)
    const options = {
      responseType: 'blob' as 'blob',
      observe: 'response' as const
    };
    
    return new Observable<void>(observer => {

      let endpointReport = 'medicalSuppliesToday'
      if(reportTodayOrMonth==='mes'){
        endpointReport = 'medicalSuppliesMonth'
      }

      this.http.post(`${this.tokenService.endPoint}dashboard-reports/pdf/register/${endpointReport}`, null, options)
        .subscribe({
          next: (response: HttpResponse<Blob>) => {
            if (response.body) {
              // Extraer el nombre del archivo del header Content-Disposition si está disponible
              let filename: string | null = null; 
              
              const contentDisposition = response.headers.get('Content-Disposition');

              if (contentDisposition) { // Si el header existe 
                const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                const matches = filenameRegex.exec(contentDisposition);
                if (matches != null && matches[1]) { // Si la regex encuentra el nombre
                  filename = matches[1].replace(/['"]/g, ''); // Asigna el nombre extraído
                }
              }
              
              if (!filename) {
                // El nombre de archivo se asigna aqui
                let today = new Date();
                let year = today.getFullYear();
                let month = (today.getMonth() + 1).toString().padStart(2, '0');
                let day = today.getDate().toString().padStart(2, '0');
                filename = `reporte-estadistico-insumos-medicos(Hoy)-${year}-${month}-${day}.pdf`;
                if(reportTodayOrMonth==='mes'){
                   filename = `reporte-estadistico-insumos-medicos(Mes)-${year}-${month}-${day}.pdf`;
                }
              }
              // Crear un objeto URL para el blob
              const blob = new Blob([response.body], { type: 'application/pdf' });
              const url = window.URL.createObjectURL(blob);
              
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

  pdfRegistryAssignmentsMedicalSupplies_MonthOrToday(reportTodayOrMonth:string): Observable<void> {
    // Configuración para recibir una respuesta blob (archivo binario)
    const options = {
      responseType: 'blob' as 'blob',
      observe: 'response' as const
    };
    
    return new Observable<void>(observer => {

      let endpointReport = 'assignments-day'
      if(reportTodayOrMonth==='mes'){
        endpointReport = 'assignments-month'
      }

      this.http.post(`${this.tokenService.endPoint}dashboard-reports/pdf/register/${endpointReport}`, null, options)
        .subscribe({
          next: (response: HttpResponse<Blob>) => {
            if (response.body) {
              // Extraer el nombre del archivo del header Content-Disposition si está disponible
              let filename: string | null = null; 
              
              const contentDisposition = response.headers.get('Content-Disposition');

              if (contentDisposition) { // Si el header existe 
                const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                const matches = filenameRegex.exec(contentDisposition);
                if (matches != null && matches[1]) { // Si la regex encuentra el nombre 
                  filename = matches[1].replace(/['"]/g, ''); // Asigna el nombre extraído
                }
              }
              
              if (!filename) {
                // El nombre de archivo se asigna aqui
                let today = new Date();
                let year = today.getFullYear();
                let month = (today.getMonth() + 1).toString().padStart(2, '0');
                let day = today.getDate().toString().padStart(2, '0');
                filename = `reporte-estadistico-registro-asignaciones-${year}-${month}-${day}.pdf`;
                if(reportTodayOrMonth==='mes'){
                   filename = `reporte-estadistico-registro-asignaciones(Mes)-${year}-${month}.pdf`;
                }
              }
              // Crear un objeto URL para el blob
              const blob = new Blob([response.body], { type: 'application/pdf' });
              const url = window.URL.createObjectURL(blob);
              
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

  pdfMedicalSuppliesAvailables(supplyType:number): Observable<void> {
    // Configuración para recibir una respuesta blob (archivo binario)
    const options = {
      responseType: 'blob' as 'blob',
      observe: 'response' as const
    };
    
    return new Observable<void>(observer => {

      this.http.post(`${this.tokenService.endPoint}dashboard-reports/generate/${supplyType}`, null, options)
        .subscribe({
          next: (response: HttpResponse<Blob>) => {
            if (response.body) {
              // Extraer el nombre del archivo del header Content-Disposition si está disponible
              let filename: string | null = null; 
              
              const contentDisposition = response.headers.get('Content-Disposition');

              if (contentDisposition) { // Si el header existe 
                const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                const matches = filenameRegex.exec(contentDisposition);
                if (matches != null && matches[1]) { // Si la regex encuentra el nombre 
                  filename = matches[1].replace(/['"]/g, ''); // Asigna el nombre extraído
                }
              }
              
              if (!filename) {
                // El nombre de archivo se asigna aqui
                let today = new Date();
                let year = today.getFullYear();
                let month = (today.getMonth() + 1).toString().padStart(2, '0');
                let day = today.getDate().toString().padStart(2, '0');

                if(supplyType===1){
                  filename = `reporte-estadistico-medicamentos-disponibles-${year}-${month}-${day}.pdf`;

                }else if(supplyType===2){
                  filename = `reporte-estadistico-uniformes-disponibles-${year}-${month}-${day}.pdf`;

                }else {
                  filename = `reporte-estadistico-equiposodontologicos-disponibles-${year}-${month}-${day}.pdf`;
                }
              }
              // Crear un objeto URL para el blob
              const blob = new Blob([response.body], { type: 'application/pdf' });
              const url = window.URL.createObjectURL(blob);
              
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