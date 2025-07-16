import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TokenService } from '../../services/Token.service';
import { IGetAllMedicalreports, IUser, IMedicalReportPagination, ICreateDTO, IMedicalReports } from '../interfaces/medical-reports.interface';

@Injectable({
  providedIn: 'root',
})

export class MedicalReportsService {
  
  private readonly tokenService = inject(TokenService);
  private readonly http = inject(HttpClient);

  getAll(params: IGetAllMedicalreports): Observable<IMedicalReportPagination> {
    return this.http.post<IMedicalReportPagination>(
      `${this.tokenService.endPoint}medical-reports/getAll`,
      params
    );
  }

  create(dto: ICreateDTO) {
    return this.http.post<IUser>(
      `${this.tokenService.endPoint}medical-reports/create`,
      dto
    );
  }

/*   update(id: string, dto: ICreateUserDTO) {
    return this.http.patch<IUser>(
      `${this.tokenService.endPoint}medical-reports/${id}`,
      dto
    );
  }

  deleteUser(id: string) {
    return this.http.delete<IUser>(`${this.tokenService.endPoint}medical-reports/${id}`);
  } */

  getUser(id:number): Observable<IUser> {
    return this.http.get<IUser>(
      `${this.tokenService.endPoint}medical-reports/${id}`
    );
  }

  getRolesActives(): Observable<{id:number,name:string}[]> {
    return this.http.get<{id:number,name:string}[]>(
      `${this.tokenService.endPoint}roles/getRolesActives`
    );
  }  

  // Método para obtener un informe médico por ID (necesario para precargar datos en la receta)
  getMedicalReportById(id: string): Observable<IMedicalReports> {
    return this.http.get<IMedicalReports>(`${this.tokenService.endPoint}medical-reports/${id}`)
  }

  // Genera PDF del Informe Medico
  generatePDFMedicalReport(reportId:any): Observable<void> {
    // Configuración para recibir una respuesta blob (archivo binario)
    const options = {
      responseType: 'blob' as 'blob',
      observe: 'response' as const
    };
    
    return new Observable<void>(observer => {
      // this.http.post(`${this.tokenService.endPoint}dashboard-reports/pdf/${id}`, body,options)
      // this.http.post(`${this.tokenService.endPoint}medical-reports/pdf/${reportId}`, null, options)
      this.http.get(`${this.tokenService.endPoint}medical-reports/pdf/${reportId}`, options)
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
}