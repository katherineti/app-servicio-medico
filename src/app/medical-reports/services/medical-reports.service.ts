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
  getMedicalReportById(id: string): Observable<IMedicalReports> {
    return this.http.get<IMedicalReports>(`${this.tokenService.endPoint}medical-reports/${id}`)
  }
  generatePDFMedicalReport(reportId:any): Observable<void> {
    const options = {
      responseType: 'blob' as 'blob',
      observe: 'response' as const
    };
    return new Observable<void>(observer => {
      this.http.get(`${this.tokenService.endPoint}medical-reports/pdf/${reportId}`, options)
        .subscribe({
          next: (response: HttpResponse<Blob>) => {
            if (response.body) {
              let filename: string | null = null; 
              const contentDisposition = response.headers.get('Content-Disposition');
              console.log("reporte-estadistico-de-usuarios",contentDisposition)
              if (contentDisposition) {
                const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                const matches = filenameRegex.exec(contentDisposition);
                if (matches != null && matches[1]) { 
                  filename = matches[1].replace(/['"]/g, '');
                }
              }
              if (!filename) {
                let today = new Date();
                let year = today.getFullYear();
                let month = (today.getMonth() + 1).toString().padStart(2, '0');
                let day = today.getDate().toString().padStart(2, '0');
                filename = `reporte-estadistico-de-usuarios-${year}-${month}-${day}.pdf`;
              }
              const blob = new Blob([response.body], { type: 'application/pdf' });
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = filename;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
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