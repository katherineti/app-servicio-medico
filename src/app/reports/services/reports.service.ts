import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TokenService } from '../../services/Token.service';
import { ICreateReport, IGetAllReports, IReport, IReportPagination } from '../interfaces/reports.interface';

@Injectable({
  providedIn: 'root',
})

export class ReportsService {
  
  private readonly tokenService = inject(TokenService);
  private readonly http = inject(HttpClient);

  getAll(params: IGetAllReports): Observable<IReportPagination> {
    return this.http.post<IReportPagination>(
      `${this.tokenService.endPoint}temp-auditor-reports/getAll`,
      params
    );
  }
   //creacion de reporte
    create(dto: ICreateReport) {
      console.log("dto create", dto)
      return this.http.post<IReport>(
        `${this.tokenService.endPoint}temp-auditor-reports`,
        dto
      );
    }
    update(dto: IReport, id?: number) {
      console.log("update",dto)
      return this.http.put<IReport>(
        `${this.tokenService.endPoint}temp-auditor-reports/${id}`,
        dto
      );
    }
    updateWithImages(formData: FormData, id?: number) {
      return this.http.put<IReport>(
        `${this.tokenService.endPoint}temp-auditor-reports/images/${id}`,
        formData
      );
    }

  deleteReport(id: string) {
    return this.http.delete<IReport>(`${this.tokenService.endPoint}temp-auditor-reports/${id}`);
  }

  duplicate(id: number) {
    console.log("id", id)
    return this.http.post<IReport>(
      `${this.tokenService.endPoint}temp-auditor-reports/duplicate`,
      {id: id}
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
   * Abre el PDF en una nueva pestaña en lugar de descargarlo
   * @param id ID del reporte
   */
  viewReportPdf(id: number): void {
    const options = {
      responseType: 'blob' as 'blob'
    };
    
    this.http.get(`${this.tokenService.endPoint}temp-auditor-reports/${id}/pdf`, options)
      .subscribe({
        next: (blob: Blob) => {
          // Crear un objeto URL para el blob
          const url = window.URL.createObjectURL(blob);
          
          // Abrir en una nueva pestaña
          window.open(url, '_blank');
          
          // Liberar el objeto URL después de un tiempo
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
          }, 100);
        },
        error: (err) => {
          console.error('Error al visualizar el PDF:', err);
        }
      });
  }
}